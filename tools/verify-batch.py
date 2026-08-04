#!/usr/bin/env python3
"""The PROVE pass, at scale. Fetch each cited page ONCE, read the claims against it.

  python3 tools/verify-batch.py --plan          what would be checked, grouped by page
  python3 tools/verify-batch.py --fetch N       download the next N uncached pages
  python3 tools/verify-batch.py --show URL      print a page's readable text + its claims
  python3 tools/verify-batch.py --apply FILE    write verdicts back into the tables

WHY IT WORKS PAGE-FIRST, NOT FACT-FIRST
---------------------------------------
829 facts are in V0 scope and not one has ever been checked against its source
(DESIGN §10a wants BOTH a good-enough source and a checked answer; we have the
first for some and the second for none). Of those, 151 already carry a Tier 1
link — the cheapest possible slice, because the sourcing argument is already won
and all that is missing is somebody opening the page.

Those 151 claims sit on only **106 distinct pages**. One Basketball-Reference
MVP table settles seven separate cards. Fetching per FACT would mean 151
downloads and would read the same table seven times; fetching per PAGE means 106
downloads and one careful read each. It is also the polite way to treat someone
else's server.

WHY curl AND NOT THE FETCH TOOL. Basketball-Reference returns 403 to the
assistant's fetcher and 200 to curl. Pages are cached under .cache/verify/ and
re-used, so a re-run costs nothing and nobody gets hammered.

WHAT THIS SCRIPT WILL NOT DO
----------------------------
It does not decide anything. It downloads, it strips a page to readable text, and
it puts the claim next to the evidence. A human (or the assistant, reading it)
gives the verdict, and `--apply` records it. There is no regex that "confirms" a
fact, because a regex that matches a name in a page proves the name is on the
page and nothing else — which is exactly the wrong-page failure already logged as
V14 in the backlog.
"""
import json, os, re, sys, subprocess, collections, time, hashlib, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
CACHE = os.path.join(ROOT, '.cache/verify')
os.makedirs(CACHE, exist_ok=True)
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')


def T(name):
    return json.load(open(os.path.join(D, name + '.json')))


def slice_t1():
    """V0-scope facts whose source is a Tier 1 link, grouped by that link."""
    facts = {f['fact_id']: f for f in T('facts')}
    lg = collections.defaultdict(set)
    for r in T('fact_leagues'):
        lg[r['fact_id']].add(r['league_id'])
    src = {s['source_id']: s for s in T('sources')}
    fs = collections.defaultdict(list)
    for r in T('fact_sources'):
        fs[r['fact_id']].append(src[r['source_id']])
    out = collections.defaultdict(list)
    for f in facts.values():
        if not (lg[f['fact_id']] & {'nba', 'wnba'}):
            continue
        if f.get('date_checked'):
            continue                       # already proven, skip
        t1 = [s for s in fs[f['fact_id']] if s.get('tier') == 1 and s.get('url')]
        if t1:
            out[t1[0]['url']].append(f)
    return out


def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + '.html')


def fetch(url):
    p = cache_path(url)
    if os.path.exists(p):
        return open(p, encoding='utf-8', errors='replace').read(), True
    r = subprocess.run(['curl', '-sS', '-L', '--max-time', '45', '-A', UA, url],
                       capture_output=True, text=True)
    body = r.stdout or ''
    if len(body) < 500:
        return None, False
    open(p, 'w', encoding='utf-8').write(body)
    time.sleep(3)                          # somebody else's server
    return body, False


def readable(raw):
    """HTML -> text a person can actually scan, tables kept as rows."""
    s = re.sub(r'(?is)<(script|style|svg|noscript).*?</\1>', ' ', raw)
    s = re.sub(r'(?is)<!--(.*?)-->', r'\1', s)      # bbref hides tables in comments
    s = re.sub(r'(?i)</t[dh]>\s*', ' | ', s)
    s = re.sub(r'(?i)</tr>\s*', '\n', s)
    s = re.sub(r'(?i)<br\s*/?>', '\n', s)
    s = re.sub(r'(?s)<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'[ \t\xa0]+', ' ', s)
    s = re.sub(r'\n{3,}', '\n\n', s)
    return '\n'.join(l.strip() for l in s.splitlines() if l.strip())


def main():
    a = sys.argv[1:]
    groups = slice_t1()
    ordered = sorted(groups.items(), key=lambda x: -len(x[1]))

    if '--plan' in a or not a:
        n = sum(len(v) for v in groups.values())
        print(f'UNCHECKED, V0 scope, already carrying a Tier 1 link')
        print(f'  {n} facts across {len(groups)} pages\n')
        cached = sum(1 for u, _ in ordered if os.path.exists(cache_path(u)))
        print(f'  pages already downloaded: {cached} of {len(ordered)}\n')
        for u, v in ordered[:20]:
            mark = '*' if os.path.exists(cache_path(u)) else ' '
            print(f' {mark}{len(v):3d}  {u[:88]}')
        if len(ordered) > 20:
            print(f'      ... and {len(ordered)-20} more pages')
        return

    if '--fetch' in a:
        want = int(a[a.index('--fetch') + 1])
        got = 0
        for u, v in ordered:
            if got >= want:
                break
            if os.path.exists(cache_path(u)):
                continue
            body, hit = fetch(u)
            got += 1
            print(f'  {"OK  " if body else "FAIL"} {len(v):2d} claims  {u[:76]}')
        print(f'\n{got} fetched.')
        return

    if '--show' in a:
        u = a[a.index('--show') + 1]
        body, _ = fetch(u)
        if not body:
            print('could not fetch'); return
        txt = readable(body)
        print('=' * 78); print(u); print('=' * 78)
        print('CLAIMS RESTING ON THIS PAGE:')
        for f in groups.get(u, []):
            print(f'  [{f["fact_id"]}]')
            print(f'    Q {f["question"]}')
            print(f'    A {f["choices"][f["answer"]]}')
        # NO TRUNCATION. The first version cut this at 12000 chars and the
        # missing tail read exactly like a missing TABLE — I spent a detour
        # convinced Basketball-Reference had stopped serving pre-1987 MVPs,
        # when 128 player rows were sitting in the file the whole time. A
        # verification tool that hides evidence is worse than no tool.
        # --grep narrows honestly; it never silently shortens.
        if '--grep' in a:
            pat = a[a.index('--grep') + 1]
            keep = [l for l in txt.splitlines() if re.search(pat, l, re.I)]
            print(f'\nPAGE TEXT, lines matching /{pat}/  ({len(keep)} of {len(txt.splitlines())}):')
            print('\n'.join(keep))
        else:
            print(f'\nPAGE TEXT ({len(txt)} chars, complete):')
            print(txt)
        return

    if '--apply' in a:
        path = a[a.index('--apply') + 1]
        verdicts = json.load(open(path))
        facts = T('facts')
        by = {f['fact_id']: f for f in facts}
        n = collections.Counter()
        for v in verdicts:
            f = by.get(v['fact_id'])
            if not f:
                print('  ?? unknown fact', v['fact_id']); continue
            if v['verdict'] == 'verified':
                f['date_checked'] = v['date']
                n['verified'] += 1
            elif v['verdict'] == 'fixed':
                f['date_checked'] = v['date']
                if 'new_answer_index' in v:
                    f['answer'] = v['new_answer_index']
                if 'new_choices' in v:
                    f['choices'] = v['new_choices']
                if 'new_question' in v:
                    f['question'] = v['new_question']
                n['fixed'] += 1
            elif v['verdict'] == 'quarantine':
                n['quarantine'] += 1       # handled separately, never auto-deleted
            else:
                n['unknown verdict'] += 1
        json.dump(facts, open(os.path.join(D, 'facts.json'), 'w'), indent=1)
        for k, c in n.most_common():
            print(f'  {k:12s}{c:4d}')
        print('\nNOW RUN: tables-verify.py && tables-emit.py --apply && audit.py')
        return


main()

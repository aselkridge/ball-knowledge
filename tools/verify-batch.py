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
import json, os, re, sys, subprocess, collections, time, hashlib, html, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
CACHE = os.path.join(ROOT, '.cache/verify')
os.makedirs(CACHE, exist_ok=True)
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')


def T(name):
    return json.load(open(os.path.join(D, name + '.json')))


TIER = int(os.environ.get('TIER', '1'))


def slice_t1():
    """V0-scope facts whose best source is a TIER link, grouped by that link.

    TIER=1 was the whole first pass and is now exhausted. TIER=2 opens the next
    135: same method, one tier down, and the standard is different — a single
    Tier 2 page is a good secondary source, not the record, so DEEPRESEARCH says
    two independent publishers before a card can call itself high confidence.
    Reading one still proves the ANSWER, which is what date_checked means; the
    second source is a separate job (V17)."""
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
        # a fact already carrying a BETTER tier belongs to that pass, not this one
        if any(s.get('tier') and s['tier'] < TIER and s.get('url')
               for s in fs[f['fact_id']]):
            continue
        hit = [s for s in fs[f['fact_id']] if s.get('tier') == TIER and s.get('url')]
        if hit:
            out[hit[0]['url']].append(f)
    return out


def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + '.html')


BROKEN = re.compile(r'(?is)<title>[^<]*(page not found|404 error|not found|'
                    r'access denied|forbidden|are you a robot)')


def broken(body):
    """Is this an error page wearing a 200?

    Basketball-Reference answers a dead player id with a 91 KB, HTTP-200
    'Page Not Found' page. The size check below waved it through, --sheet read it
    as evidence, and the only reason it got caught was that Diana Taurasi's name
    did not appear anywhere on Diana Taurasi's page. A verification tool that
    cannot tell a page from an apology will quietly verify nothing."""
    return bool(BROKEN.search(body[:4000]))


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


def title_of(body):
    m = re.search(r'(?is)<title>(.*?)</title>', body)
    return norm(html.unescape(m.group(1)).strip()) if m else '(no title)'


def norm(s):
    """Fold the typographic characters publishers use and our data does not.

    THIS IS NOT COSMETIC. wnba.com writes "Women’s National Basketball
    Association" with a curly apostrophe; the fact stores a straight one. The
    --sheet term search matched nothing and printed 'NO LINE ON THIS PAGE
    MENTIONS ANY OF IT — suspect the SOURCE', which is the single most
    misleading thing this tool can say: it points a careful reader at the
    conclusion that a perfectly good source is the wrong page. A false negative
    in a verification tool is worse than a false positive, because the false
    positive still gets read."""
    for a, b in (('’', "'"), ('‘', "'"), ('“', '"'), ('”', '"'),
                 ('–', '-'), ('—', '-'), ('\u2011', '-'), ('\u00a0', ' ')):
        s = s.replace(a, b)
    # AND FOLD ACCENTS. Second instance of the same bug on the same day: the
    # apostrophe one hid wnba.com, this one hid Luka Dončić, whom
    # Basketball-Reference spells with a č and our bank spells with a c. Any
    # character a publisher renders one way and a hand-typed question renders
    # another is a silent miss, and a silent miss in a verification tool reads
    # as "the source is wrong".
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')


def from_scripts(raw):
    """Pull the prose out of embedded JSON when the markup has none.

    nba.com's team-history pages are a React app: the article is a string
    inside __NEXT_DATA__, and every <script> gets thrown away below because
    scripts are normally noise. The Nate Thurmond page came back as one line —
    its own <title> — while the word "Thurmond" appeared 75 times in the raw
    bytes. A reader that discards the only copy of the evidence reports "no
    evidence", which is the same false negative as the curly apostrophe and the
    accented name, arriving by a third route.

    Deliberately crude: long quoted strings only, so it lifts sentences and not
    css class names or ids."""
    out = []
    for blk in re.findall(r'(?is)<script[^>]*>(.*?)</script>', raw):
        if len(blk) < 500:
            continue
        for m in re.findall(r'"((?:[^"\\]|\\.){80,})"', blk):
            try:
                t = json.loads('"' + m + '"')
            except Exception:
                t = m
            t = re.sub(r'<[^>]+>', ' ', t)
            # REJECT MINIFIED JAVASCRIPT. The first filter asked only for two
            # words in a row, and bundled code clears that easily — the Lakers
            # page came back with `(e,t,r)=>{r.d(t,{L:()=>d` sitting under the
            # evidence. Prose has few symbols and mostly long words; minified JS
            # is the opposite, so measure both instead of guessing at a pattern.
            t = re.sub(r'\s+', ' ', t).strip()
            if len(t) < 60:
                continue
            sym = sum(1 for c in t if c in '{}[]()<>=;:|&$_\\/')
            words = t.split(' ')
            if sym / len(t) > 0.04:
                continue
            if sum(len(w) for w in words) / max(1, len(words)) < 3:
                continue
            if re.search(r'[a-z]{3}\s+[a-z]{3}', t, re.I):
                out.append(t)
    seen, keep = set(), []
    for t in out:
        if t not in seen:
            seen.add(t); keep.append(t)
    return keep


def readable(raw):
    """HTML -> text a person can actually scan, tables kept as rows."""
    s = re.sub(r'(?is)<(script|style|svg|noscript).*?</\1>', ' ', raw)
    # bbref hides real tables inside HTML comments, so comments get unwrapped
    # rather than dropped -- but ONLY when they contain markup. si.com is built
    # on Qwik, which litters the page with <!--qv q:id=6c q:key=AxY3:3--> and
    # nothing else; unwrapping those turned every si.com article into pages of
    # "qv q:key=" that the term search happily ranked as evidence. A comment
    # with a '<' in it is a stashed fragment; one without is a framework marker.
    s = re.sub(r'(?is)<!--(.*?)-->', lambda m: m.group(1) if '<' in m.group(1) else ' ', s)
    s = re.sub(r'(?i)</t[dh]>\s*', ' | ', s)
    s = re.sub(r'(?i)</tr>\s*', '\n', s)
    s = re.sub(r'(?i)<br\s*/?>', '\n', s)
    s = re.sub(r'(?s)<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'[ \t\xa0]+', ' ', s)
    s = re.sub(r'\n{3,}', '\n\n', s)
    lines = [l.strip() for l in s.splitlines() if l.strip()]
    # only when the markup gave us almost nothing — never as extra noise on a
    # page that reads fine, which is most of them
    if len(' '.join(lines)) < max(2000, len(raw) // 60):
        lines += from_scripts(raw)
    return norm('\n'.join(lines))


def main():
    a = sys.argv[1:]
    groups = slice_t1()
    ordered = sorted(groups.items(), key=lambda x: -len(x[1]))

    if '--plan' in a or not a:
        n = sum(len(v) for v in groups.values())
        print(f'UNCHECKED, V0 scope, best source is a Tier {TIER} link')
        print(f'  {n} facts across {len(groups)} pages\n')
        cached = sum(1 for u, _ in ordered if os.path.exists(cache_path(u)))
        print(f'  pages already downloaded: {cached} of {len(ordered)}')
        dead = [(u, v) for u, v in ordered if os.path.exists(cache_path(u))
                and broken(open(cache_path(u), encoding='utf-8', errors='replace').read())]
        if dead:
            print(f'  DEAD LINKS among those: {len(dead)} page(s), '
                  f'{sum(len(v) for _, v in dead)} claim(s) resting on nothing')
            for u, v in dead:
                print(f'     {len(v):2d}  {u}')
        print()
        for u, v in ordered[:20]:
            mark = '*' if os.path.exists(cache_path(u)) else ' '
            print(f' {mark}{len(v):3d}  {u[:88]}')
        if len(ordered) > 20:
            print(f'      ... and {len(ordered)-20} more pages')
        return

    if '--thin' in a:
        """Pages that downloaded fine and say nothing.

        broken() catches the 404-served-at-200. This catches its cousin, which
        bit twice on the Tier 2 batch: a bot wall. newsnationnow.com returned
        281 characters reading "Access to this page has been denied", and
        si.com returned a Qwik shell whose only 'prose' is q:key markup. Both
        were 20KB+ of HTML, so every length check upstream waved them through,
        and the evidence sheet dutifully reported NO LINE ON THIS PAGE MENTIONS
        ANY OF IT — pointing at the source when the problem was the download.

        A page you cannot read is not a source. Re-fetch these with
        tools/fetch-hard.mjs --force, which drives a real browser."""
        bad = []
        for u, v in ordered:
            p = cache_path(u)
            if not os.path.exists(p):
                continue
            txt = readable(open(p, encoding='utf-8', errors='replace').read())
            if len(txt) < 1500:
                bad.append((len(txt), u, len(v)))
        for n2, u, c in sorted(bad):
            print(f'  {n2:6d} chars  {c:2d} claims  {u[:70]}')
        print(f'\n  {len(bad)} cached pages are too thin to verify against, '
              f'{sum(c for _, _, c in bad)} claims resting on them')
        if '--full' in a:
            print()
            for _, u, _ in sorted(bad):
                print(u)
        return

    if '--urls' in a:
        # The --plan view stops at 20 pages, which hides WHERE the work is. When
        # a whole publisher is unreachable you need the host tally, not the head
        # of the list: espn.com being 40% of the queue is the fact that decides
        # what to build next.
        miss = [(u, v) for u, v in ordered if not os.path.exists(cache_path(u))]
        by = {}
        for u, v in miss:
            h = re.sub(r'^www\.', '', u.split('/')[2])
            c, f = by.get(h, (0, 0))
            by[h] = (c + 1, f + len(v))
        for h, (c, f) in sorted(by.items(), key=lambda x: -x[1][1]):
            print(f'  {f:3d} facts  {c:3d} pages  {h}')
        print(f'\n  {sum(f for _, f in by.values())} facts, '
              f'{len(miss)} pages not downloaded')
        if '--full' in a:
            print()
            for u, v in miss:
                print(f'  {len(v):2d}  {u}')
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

    if '--sheet' in a:
        """Every claim on the next N cached pages, each sat next to the lines of
        its own page that mention it. Reading 127 claims one --show at a time
        means scrolling a 2,700-line page per claim; this puts the evidence and
        the claim in the same eyeful.

        IT STILL DECIDES NOTHING. The terms are pulled from the answer and from
        the question's proper nouns and numbers, so a hit means 'the words are on
        the page' — which is precisely the wrong-page failure logged as V14, and
        precisely why a person reads the block. A claim with NO hits is the
        useful signal: the cited page may simply not be about it. Jordan's
        jersey number was found that way — the career page never states it."""
        want = int(a[a.index('--sheet') + 1])
        start = int(a[a.index('--from') + 1]) if '--from' in a else 0
        shown = 0
        for u, fs in ordered[start:]:
            if shown >= want:
                break
            if not os.path.exists(cache_path(u)):
                continue
            shown += 1
            raw = fetch(u)[0]
            print('\n' + '=' * 78)
            print(f'PAGE {start+shown}  {u}')
            print('=' * 78)
            if broken(raw):
                print(f'  !! THIS URL IS DEAD — the server returned "{title_of(raw)}"')
                print(f'  !! {len(fs)} claim(s) rest on it. The SOURCE is wrong, not the answer.')
                for f in fs:
                    print(f'       [{f["fact_id"]}]  {f["question"][:88]}')
                continue
            txt = readable(raw)
            lines = txt.splitlines()
            for f in fs:
                ans = norm(f['choices'][f['answer']])
                # distinctive tokens: the answer, plus capitalised words and any
                # number of 2+ digits out of the question.
                terms = set()
                for w in re.findall(r'\b[A-Z][a-zA-Z\'\.]{2,}\b|\b\d{2,4}\b', norm(f['question'])):
                    if w.lower() not in ('what', 'which', 'who', 'the', 'nba', 'wnba'):
                        terms.add(w)
                terms = {t for t in terms if len(t) > 2}
                terms.add(ans)          # ALWAYS, however short — the answer to
                                        # "what number did he wear" is "23", and
                                        # dropping it for being two characters is
                                        # how the jersey line stayed buried
                # DROP THE PAGE'S OWN BOILERPLATE. On a player page the surname
                # is on a fifth of the lines and carries no information at all,
                # so it outvotes the one line that actually settles the claim.
                # Anything this common is background, not evidence.
                common = {t for t in terms
                          if sum(1 for l in lines if re.search(re.escape(t), l, re.I))
                          > max(6, len(lines) * 0.02)}
                common.discard(ans)     # the answer is never boilerplate, however
                                        # often the page happens to say it
                if common and len(common) < len(terms):
                    print(f'    (ignoring page boilerplate: {sorted(common)})')
                    terms -= common
                # RANK BY HOW MANY DISTINCT TERMS A LINE CARRIES, not by where it
                # sits. On a player page the surname is on almost every line, so
                # first-ten-in-document-order returns the nav menu every time —
                # it did, and it buried "Number 23 for Chicago Bulls, 1985-1998"
                # under "Michael Jordan Menu". A line holding the answer AND the
                # subject is the line worth reading.
                def hit(t, l):
                    # a short or numeric term needs a word boundary: "23" must not
                    # match "1923", ".237" or "23,481"
                    pat = (r'(?<![\w.])' + re.escape(t) + r'(?![\w.])'
                           if len(t) <= 4 else re.escape(t))
                    return re.search(pat, l, re.I)
                scored = []
                for l in lines:
                    n = sum(1 for t in terms if hit(t, l))
                    if n:
                        scored.append((n, -len(l), l))
                scored.sort(reverse=True)
                print(f'\n  [{f["fact_id"]}]')
                print(f'    Q  {f["question"]}')
                print(f'    A  {ans}')
                print(f'    terms: {sorted(terms)}')
                if not scored:
                    print('    >>> NO LINE ON THIS PAGE MENTIONS ANY OF IT — suspect the SOURCE, not the answer')
                elif scored[0][0] < len(terms):
                    print(f'    >>> no single line carries all {len(terms)} terms — read carefully')
                for n, _, l in scored[:8]:
                    print(f'      {n}| ' + l[:240])
                if len(scored) > 8:
                    print(f'       ... {len(scored)-8} weaker lines (use --show --grep)')
        return

    if '--apply' in a:
        path = a[a.index('--apply') + 1]
        verdicts = json.load(open(path))
        facts = T('facts')
        by = {f['fact_id']: f for f in facts}
        sources = T('sources')
        by_src = {s['source_id']: s for s in sources}
        links = T('fact_sources')
        have = {(r['fact_id'], r['source_id']) for r in links}
        n = collections.Counter()

        def src_slug(url):
            """Same rule tables-build.py uses, so a source added here and a source
            added by a rebuild get the SAME id instead of two rows for one page."""
            s = re.sub(r'^https?://(www\.)?', '', url).lower().strip()
            for x, y in (('&', ' and '), ("'", ''), ('’', ''), ('"', ''), ('.', '')):
                s = s.replace(x, y)
            return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s)).strip('-')[:80]

        def add_source(fid, url, tier, title=None):
            """THE FOURTH OUTCOME. The pipeline has verify / fix / quarantine, and
            none of them fits the commonest thing a careful read turns up: the
            ANSWER is right and the CITED PAGE does not show it. A superlative is
            the usual shape — Catchings' own page proves she won five Defensive
            Player awards and says nothing about whether five is the most, which
            is a different page entirely.

            Leaving those unverified would be honest and useless; marking them
            verified would be a lie of exactly the kind V14 warns about. So the
            proving page gets ADDED as a source. The old one is never removed —
            it is usually still a fine source for the subject, and quarantine-
            never-delete applies to sources too."""
            # BY URL FIRST, for the same reason drop_source has to: a page can
            # already be in `sources` under a hand-made id, and matching only the
            # slug mints a second row for a page we already cite. f-1431 ended up
            # citing Catchings' page twice that way.
            existing = [k for k, r in by_src.items() if r.get('url') == url]
            sid = existing[0] if existing else src_slug(url)
            if sid not in by_src:
                row = {'source_id': sid, 'title': title, 'url': url,
                       'publisher': re.sub(r'^https?://(www\.)?([^/]+).*', r'\2', url),
                       'date_checked': None, 'tier': tier}
                sources.append(row); by_src[sid] = row
                n['new source rows'] += 1
            # ...and the fact may already cite a DIFFERENT row holding the same
            # url, which is how f-1431 finished up citing Catchings' page twice.
            already = {r['source_id'] for r in links if r['fact_id'] == fid}
            if any(by_src.get(k, {}).get('url') == url for k in already):
                return sid
            if (fid, sid) not in have:
                links.append({'fact_id': fid, 'source_id': sid})
                have.add((fid, sid))
                n['facts given a proving source'] += 1
            return sid

        for v in verdicts:
            f = by.get(v['fact_id'])
            if not f:
                print('  ?? unknown fact', v['fact_id']); continue
            if v.get('drop_source'):
                """A cited page that 404s is worse than no citation: it LOOKS
                sourced. Basketball-Reference stores Diana Taurasi at
                tauradi01w and our row said taurasdi01w — one letter, a dead
                link, and two cards resting on nothing. The source ROW stays
                (quarantine-never-delete, and something else may cite it) but
                this fact stops pointing at it, and the row's title says so."""
                # RESOLVE BY URL, NOT BY SLUG. Half the source rows in this repo
                # carry hand-made ids from the original bank ("v5-taurasi-vs-bird-
                # ppg"), not the url-derived slug, so slug lookup silently matched
                # nothing — while the counter below incremented anyway and
                # reported two dead citations dropped that were still there.
                dead = [k for k, r in by_src.items() if r.get('url') == v['drop_source']]
                if not dead:
                    print('  ?? no source row has url', v['drop_source'])
                for d in dead:
                    before = len(links)
                    links[:] = [r for r in links
                                if not (r['fact_id'] == f['fact_id'] and r['source_id'] == d)]
                    have.discard((f['fact_id'], d))
                    n['dead citations dropped'] += before - len(links)
                    if not str(by_src[d].get('title') or '').startswith('DEAD'):
                        by_src[d]['title'] = 'DEAD LINK (404, checked %s) - %s' % (
                            v['date'], by_src[d].get('title') or 'no title')
                        by_src[d]['tier'] = None
                        n['sources marked dead'] += 1
            if v.get('add_source'):
                # one url or several — a comparison card ("who averaged more,
                # Shaq or Duncan?") is only proven by BOTH players' pages, and
                # citing one of them is the wrong-page failure with extra steps
                urls = v['add_source']
                for u2 in ([urls] if isinstance(urls, str) else urls):
                    add_source(f['fact_id'], u2, v.get('tier', 1),
                               v.get('source_title'))
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
        json.dump(sources, open(os.path.join(D, 'sources.json'), 'w'), indent=1)
        json.dump(links, open(os.path.join(D, 'fact_sources.json'), 'w'), indent=1)
        for k, c in n.most_common():
            print(f'  {k:32s}{c:4d}')
        print('\nNOW RUN: tier-sources.py --apply && tables-verify.py'
              ' && tables-emit.py --apply && audit.py')
        return


main()

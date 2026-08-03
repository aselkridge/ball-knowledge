#!/usr/bin/env python3
"""R1 — re-link every card to its fact. Dry-run by default; --apply writes.

WHAT R1 ACTUALLY IS (measured 2026-08-03, and it is not what V0 budgeted)
------------------------------------------------------------------------
V0 lists R1 as 829 rows of "card source does not resolve to a fact" and files it
under the research block — the biggest, most expensive lift on the board.

Measured, 829 is EVERY in-scope card, not a subset, and most of it is not
research at all. Where the source URL actually lives today:

    A  131  already on the fact, via fact_sources -> sources
    B  387  in a research-*.json file, never carried into the sources table
    C  311  nowhere. q3-corpus-* ids mined from the player DB. Genuinely unsourced.

So 518 of 829 (62%) is a MECHANICAL re-link a script can do and prove, and the
real research residue is 311 cards. This tool does A and B, and leaves C as a
precisely named list instead of a vague 829.

THE HONESTY PROBLEM THIS TOOL MUST NOT HIDE
-------------------------------------------
Re-linking makes the sourcing VISIBLE. It does not make it GOOD. Of the URLs
recovered in B, 195 are Wikipedia — which is an index, not a record, and sits
below the standard in DEEPRESEARCH_KNOWLEDGE.md. A card can pass R1 and still be
sourced to something we would not defend. That is R3's job (tier every source)
and the verify pipeline's job. R1 only guarantees the chain resolves.

THE GATE INTERACTION — READ BEFORE --apply
------------------------------------------
`audit.py` counts `srcids_unresolved` (currently 373) and it is on the RATCHET,
so it can only go down. It resolves a card's src against `collect_corpus_ids()`.
Rewriting src to a fact_id would make all 829 unresolvable against that set and
the gate would fail — correctly, because the set does not yet know fact_ids are
a legitimate target.

Widening a gate's accept-set to make your own change pass is how a ratchet gets
cheated, so this is NOT done silently: `--apply` refuses to run until audit.py
accepts fact_ids as resolving. A fact_id resolves to a row in facts.json, which
is a STRONGER resolution than the research-corpus ids already accepted, so the
widening is defensible — but it is Aaron's call to make, not a side effect of
this script.
"""
import json, os, re, sys, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
QJS = os.path.join(ROOT, 'docs/play/questions.js')
APPLY = '--apply' in sys.argv
LEAGUES = {'nba', 'wnba'}          # V0 scope, Aaron 08-01

T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D)
     if f.endswith('.json') and f != 'todo.json'}
SRC = {s['source_id']: s for s in T['sources']}
FS = collections.defaultdict(list)
for r in T['fact_sources']:
    FS[r['fact_id']].append(r['source_id'])

BYQ = {}
for f in T['facts']:
    BYQ.setdefault(f['question'], []).append(f['fact_id'])

# every id in the research runs that carries a source url
RK = {}
for p in sorted(glob.glob(os.path.join(ROOT, 'docs/play/data/research-*.json'))):
    try:
        d = json.load(open(p))
    except Exception:
        continue
    def walk(o):
        if isinstance(o, dict):
            fid = o.get('id') or o.get('fact_id')
            url = o.get('source') or o.get('source_url')
            if isinstance(fid, str) and isinstance(url, str) and url.strip():
                RK.setdefault(fid, (os.path.basename(p), url.strip()))
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(d)

qsrc = open(QJS, encoding='utf-8').read()
CARDS = []
for m in re.finditer(r'\{t:\s*\d.*?\}(?=,\n|\n\];)', qsrc, re.S):
    c = m.group(0)
    g = lambda p: (re.search(p, c).group(1) if re.search(p, c) else None)
    q = g(r'\bq:"((?:[^"\\]|\\.)*)"')
    if q:
        q = q.replace('\\"', '"').replace("\\'", "'")
    CARDS.append({'raw': m.group(0), 'span': m.span(),
                  'l': g(r'\bl:"([^"]*)"'), 'src': g(r'\bsrc:"([^"]*)"'), 'q': q})

plan, unsourced, missing_fact = [], [], []
for c in CARDS:
    if c['l'] not in LEAGUES:
        continue
    fids = BYQ.get(c['q'] or '')
    if not fids or len(fids) != 1:
        missing_fact.append(c)
        continue
    fid = fids[0]
    urls = [SRC[s]['url'] for s in FS.get(fid, []) if SRC.get(s) and SRC[s].get('url')]
    if urls:
        plan.append((c, fid, urls[0], 'A'))
    elif c['src'] in RK:
        plan.append((c, fid, RK[c['src']][1], 'B'))
    else:
        unsourced.append((c, fid))

byclass = collections.Counter(p[3] for p in plan)
dom = collections.Counter(
    re.sub(r'^https?://(www\.)?([^/]+).*', r'\2', u) for _, _, u, _ in plan)

print('R1 · RE-LINK EVERY CARD TO ITS FACT   (NBA + WNBA, V0 scope)')
print('-' * 62)
print(f'  in-scope cards                  {sum(1 for c in CARDS if c["l"] in LEAGUES):5d}')
print(f'  A · url already on the fact     {byclass["A"]:5d}   re-link only')
print(f'  B · url in a research file      {byclass["B"]:5d}   re-link + carry the url in')
print(f'  C · no url anywhere             {len(unsourced):5d}   REAL RESEARCH, stays open')
print(f'  no matching fact row            {len(missing_fact):5d}')
print()
print(f'  this run would close            {len(plan):5d} of 829  '
      f'({100*len(plan)//829}%)')
print(f'  R1 would drop to                {len(unsourced) + len(missing_fact):5d}')
print()
print('  where the sourcing actually points (the R3 honesty check):')
for k, v in dom.most_common(8):
    flag = '   <-- an index, not a record' if 'wikipedia' in k else ''
    print(f'    {k:34s}{v:5d}{flag}')

if unsourced:
    print()
    print(f'  C · the {len(unsourced)} that still need a human or a research run:')
    for c, fid in unsourced[:5]:
        print(f'    {(c["src"] or "-")[:34]:34s} {(c["q"] or "")[:44]}')
    print(f'    ... and {len(unsourced)-5} more')

if not APPLY:
    print()
    print('--dry: nothing written.')
    print('BEFORE --apply, audit.py must accept fact_ids as resolving srcids,')
    print('or the ratchet fails on srcids_unresolved. That is a deliberate stop:')
    print('widening a gate to pass your own change is Aaron\'s call, not a script\'s.')
    sys.exit(0)

# --- apply ---------------------------------------------------------------
ids_ok = 'facts.json' in open(os.path.join(ROOT, 'tools/audit.py')).read()
if not ids_ok:
    print('\nREFUSING TO APPLY: audit.py does not resolve fact_ids yet.')
    print('Applying now would spike srcids_unresolved and fail the ratchet.')
    sys.exit(1)

out = qsrc
for c, fid, url, _cls in sorted(plan, key=lambda x: -x[0]['span'][0]):
    new = re.sub(r'\bsrc:"[^"]*"', 'src:"' + fid + '"', c['raw'], count=1)
    a, b = c['span']
    out = out[:a] + new + out[b:]
open(QJS, 'w', encoding='utf-8').write(out)

# carry class-B urls into sources + fact_sources
def sid_for(url):
    s = re.sub(r'^https?://(www\.)?', '', url)
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:80]

changed = 0
for c, fid, url, cls in plan:
    if cls != 'B':
        continue
    sid = sid_for(url)
    if sid not in SRC:
        SRC[sid] = {'source_id': sid, 'title': None, 'url': url, 'tier': None}
        T['sources'].append(SRC[sid])
    if sid not in FS.get(fid, []):
        T['fact_sources'].append({'fact_id': fid, 'source_id': sid})
        FS[fid].append(sid)
    changed += 1
for name in ('sources', 'fact_sources'):
    json.dump(T[name], open(os.path.join(D, name + '.json'), 'w'), indent=1)

print(f'\nAPPLIED: {len(plan)} cards re-linked, {changed} source rows carried in.')
print('Now run: python3 tools/audit.py && python3 tools/todo-build.py')

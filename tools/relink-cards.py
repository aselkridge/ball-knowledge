#!/usr/bin/env python3
"""R1 — give every label-only source its real url. Dry-run by default; --apply.

WHAT R1 TURNED OUT TO BE
------------------------
V0 files R1 as 829 rows of research and calls the data block the biggest lift on
the board. It is not research. 1,107 of 2,063 source rows are LABELS with no url
— strings like `nba-1947-first-baa-champion-warriors` that point nowhere. But
those labels are the ids from the original research runs, and those run files
still sit in docs/play/data/ WITH the url attached. The paperwork was done; it
was never filed.

So R1 is: look the label up in the research files and write the url onto the
source row. Nothing is invented. If a label is not in any research file, it stays
a label and stays counted.

WHY THIS WRITES TO THE TABLES, NOT questions.js
-----------------------------------------------
The tables are the source of truth; questions.js and players.js are BUILD OUTPUT
(tables-emit.py says so in its own first line). The first version of this script
rewrote questions.js — a generated file — which would have been erased by the
next emit. Aaron caught the architecture; this is the corrected version.

WHY FILLING A URL IS ENOUGH
---------------------------
A source row with a url gets a publisher, and a publisher gets a tier from the
map (tools/tier-sources.py), and a tier drives the fact's confidence. So one
recovered url can carry a fact from `low` to `high` with no other change. It does
not need a SECOND source row — that is the separate Tier-2 path, still blocked
because no fact has two sources.

SCOPE NOTE. V0 is NBA + WNBA only, and that governs RESEARCH — going and finding
new things. This recovers urls that were already written down and lost in the
filing, for whatever league. Leaving a known url unfilled would be discarding
information we already paid for. Nothing new ships either way: the pack gate is
still dark, and out-of-scope leagues are still excluded from packs and the daily.
The report splits in-scope from out so the V0 number stays readable.
"""
import json, os, re, sys, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
APPLY = '--apply' in sys.argv
SCOPE = {'nba', 'wnba'}

T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D)
     if f.endswith('.json') and f != 'todo.json'}

# every id in the research runs that carries a url
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
            if isinstance(fid, str) and isinstance(url, str) and url.strip().startswith('http'):
                RK.setdefault(fid, (os.path.basename(p), url.strip()))
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(d)

# which facts does a source back, and are they in scope?
FL = collections.defaultdict(set)
for r in T['fact_leagues']:
    FL[r['fact_id']].add(r['league_id'])
SRC_FACTS = collections.defaultdict(list)
for r in T['fact_sources']:
    SRC_FACTS[r['source_id']].append(r['fact_id'])

labels = [s for s in T['sources'] if not s.get('url')]
fixable, stuck = [], []
for s in labels:
    hit = RK.get(s['source_id'])
    (fixable if hit else stuck).append((s, hit))

def in_scope(sid):
    return any(FL.get(f, set()) & SCOPE for f in SRC_FACTS.get(sid, []))

fix_in = sum(1 for s, _ in fixable if in_scope(s['source_id']))
stuck_in = sum(1 for s, _ in stuck if in_scope(s['source_id']))
dom = collections.Counter(
    re.sub(r'^https?://(?:www\.)?([^/]+).*', r'\1', u) for _, (_, u) in fixable)

print('R1 · RECOVER THE URLS THAT WERE ALREADY WRITTEN DOWN')
print('-' * 60)
print(f'  source rows                       {len(T["sources"]):5d}')
print(f'  of those, LABELS with no url      {len(labels):5d}')
print(f'    url found in a research file    {len(fixable):5d}   <- this run fixes these')
print(f'    no url anywhere                 {len(stuck):5d}   <- real research, stays open')
print()
print(f'  NBA/WNBA only (the V0 number):')
print(f'    fixable                         {fix_in:5d}')
print(f'    genuinely unsourced             {stuck_in:5d}')
print()
print('  the recovered urls point at:')
for k, v in dom.most_common(8):
    flag = '   <- Tier 3, will NOT ship alone' if 'wikipedia' in k else ''
    print(f'    {k:34s}{v:5d}{flag}')

if not APPLY:
    print()
    print('--dry: nothing written. Re-run with --apply, then tier-sources.py --apply.')
    sys.exit(0)

for s, hit in fixable:
    _file, url = hit
    s['url'] = url
    s['publisher'] = re.sub(r'^https?://(?:www\.)?([^/]+).*', r'\1', url)
json.dump(T['sources'], open(os.path.join(D, 'sources.json'), 'w'), indent=1)
print(f'\nAPPLIED: {len(fixable)} source rows given their real url.')
print('NOW RUN: python3 tools/tier-sources.py --apply   (tiers + confidence)')
print('THEN:    python3 tools/tables-verify.py && python3 tools/todo-build.py --apply')

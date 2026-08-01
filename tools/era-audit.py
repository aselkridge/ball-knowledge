#!/usr/bin/env python3
"""What the era data ACTUALLY says, measured. READ-ONLY — writes nothing.

Written before proposing any change to eras (22v), because the last three
things I believed about this data without measuring turned out to be wrong.
Everything printed here is counted from docs/play/data/tables/.

An "era" today is one row per (league, decade). A person or a fact links to
one, and the game filters on it: pick the 1990s and you should get 1990s ball.
That is the promise. This tool asks how much of it we can currently keep.
"""
import json, os, re, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D) if f.endswith('.json')}

LG = {l['league_id']: l for l in T['leagues']}
ERA = {e['era_id']: e for e in T['eras']}
NAME = {p['person_id']: p['name'] for p in T['people']}


def dec_num(d):
    m = re.match(r'^(\d{4})s$', str(d))
    return int(m.group(1)) if m else None


def rule(t):
    print('\n' + t + '\n' + '-' * len(t))


print('ERA AUDIT — what we hold, and what it is worth')
print(f"{len(T['eras'])} era rows · {len(T['person_eras'])} person links · "
      f"{len(T['fact_eras'])} fact links")

# ---------------------------------------------------------------- 1. shape
rule('1. AN ERA ROW IS (league, decade). WHICH ROWS BREAK THAT?')
noleague = [e for e in T['eras'] if not e['league_id']]
print(f"  era rows with NO league             {len(noleague):>5}"
      f"   <- {', '.join(sorted(e['era_id'] for e in noleague)) if noleague else '-'}")
badlg = [e for e in T['eras'] if e['league_id'] and e['league_id'] not in LG]
print(f"  era rows pointing at a dead league  {len(badlg):>5}")
dupe = [k for k, v in collections.Counter(
    (e['league_id'], e['decade']) for e in T['eras']).items() if v > 1]
print(f"  duplicate (league, decade) pairs    {len(dupe):>5}")

# who actually uses the league-less ones?
if noleague:
    ids = {e['era_id'] for e in noleague}
    pe = [r for r in T['person_eras'] if r['era_id'] in ids]
    fe = [r for r in T['fact_eras'] if r['era_id'] in ids]
    print(f"    ...used by {len(pe)} person links and {len(fe)} fact links")
    for e in sorted(ids):
        who = sorted({NAME.get(r['person_id'], r['person_id'])
                      for r in T['person_eras'] if r['era_id'] == e})
        print(f"      {e:10} {len(who):>3} people"
              + ('  e.g. ' + ', '.join(who[:4]) if who else ''))

# ------------------------------------------------------- 2. league lifespans
rule('2. NO LEAGUE DECLARES WHEN IT EXISTED')
nof = [l['league_id'] for l in T['leagues'] if l['first_year'] is None]
print(f"  leagues with no first_year          {len(nof):>5} of {len(T['leagues'])}")
print("  So a decade OUTSIDE a league's real life cannot be caught by the data —")
print("  only by a human noticing. 'the fives, 1904-1950' lives in a TAGLINE STRING,")
print("  which nothing can check. Every span below is inferred from the data itself:")
print(f"\n  {'league':11} {'status':7} {'eras':>4} {'people':>7} {'facts':>6}  span (from the data)")
for l in T['leagues']:
    lid = l['league_id']
    eids = {e['era_id'] for e in T['eras'] if e['league_id'] == lid}
    ppl = len({r['person_id'] for r in T['person_eras'] if r['era_id'] in eids})
    fct = len({r['fact_id'] for r in T['fact_eras'] if r['era_id'] in eids})
    ds = sorted(filter(None, (dec_num(ERA[e]['decade']) for e in eids)))
    span = f"{ds[0]}s-{ds[-1]}s" if ds else '(none)'
    print(f"  {lid:11} {l['status']:7} {len(eids):>4} {ppl:>7} {fct:>6}  {span}")

# ------------------------------------------------- 3. the duplication bug
rule('3. THE FLAGS/OVERSEAS DUPLICATION (my bug, 22v-ERAS item 1)')
def decs_of(pid, lid):
    return frozenset(ERA[r['era_id']]['decade'] for r in T['person_eras']
                     if r['person_id'] == pid and ERA.get(r['era_id'], {}).get('league_id') == lid)

pe_by_person = collections.defaultdict(list)
for r in T['person_eras']:
    pe_by_person[r['person_id']].append(r['era_id'])

both, same = [], []
for pid in NAME:
    f = frozenset(ERA[e]['decade'] for e in pe_by_person[pid]
                  if ERA.get(e, {}).get('league_id') == 'flags')
    o = frozenset(ERA[e]['decade'] for e in pe_by_person[pid]
                  if ERA.get(e, {}).get('league_id') == 'overseas')
    if f and o:
        both.append(pid)
        if f == o:
            same.append(pid)
print(f"  people with era rows in BOTH flags and overseas   {len(both):>5}")
print(f"  ...of those, with the IDENTICAL decade set        {len(same):>5}"
      f"  ({len(same)*100//max(1,len(both))}%)")
print("  An identical set is the signature of the bug: the migration copied each")
print("  world era into both leagues instead of asking which career ran when.")

# is the same true of the facts?
fl = collections.defaultdict(set)
for r in T['fact_leagues']:
    fl[r['fact_id']].add(r['league_id'])
fboth = [f for f, s in fl.items() if {'flags', 'overseas'} <= s]
print(f"\n  facts riding BOTH flags and overseas              {len(fboth):>5}")
try:
    unsorted_ = json.load(open(os.path.join(ROOT, 'docs/play/data/world-facts-to-sort.json')))
    print(f"  ...of which flagged for a human to split          {len(unsorted_):>5}")
    print(f"  ...which means {len(fboth)-len(unsorted_)} were classified as GENUINELY both")
except Exception:
    pass

# ------------------------------------------------ 4. decades out of bounds
rule('4. DECADES THAT CANNOT BE RIGHT')
KNOWN = {'nba': (1946, None), 'wnba': (1997, None), 'big3': (2017, None),
         'gleague': (2001, None), 'fives': (1904, 1950), 'fiba3x3': (2012, None)}
print("  (bounds below are the real-world founding years, hard-coded HERE only")
print("   because the leagues table does not carry them — see section 2)")
bad = []
for r in T['person_eras']:
    e = ERA.get(r['era_id'])
    if not e or not e['league_id']:
        continue
    lo_hi = KNOWN.get(e['league_id'])
    d = dec_num(e['decade'])
    if not lo_hi or d is None:
        continue
    lo, hi = lo_hi
    if d + 9 < lo or (hi and d > hi):
        bad.append((e['league_id'], e['decade'], NAME.get(r['person_id'], r['person_id'])))
for lid in sorted({b[0] for b in bad}):
    rows = sorted(b for b in bad if b[0] == lid)
    who = collections.defaultdict(list)
    for _, d, n in rows:
        who[n].append(d)
    print(f"\n  {lid}: {len(rows)} rows across {len(who)} people"
          f"   (league starts {KNOWN[lid][0]}"
          + (f", ends {KNOWN[lid][1]}" if KNOWN[lid][1] else '') + ')')
    for n in sorted(who):
        print(f"      {n:24} {', '.join(sorted(who[n]))}")
if not bad:
    print('  none')

# ------------------------------------------------------- 5. coverage holes
rule('5. WHO AND WHAT HAS NO ERA AT ALL')
have = {r['person_id'] for r in T['person_eras']}
print(f"  people with NO era row                {len(NAME)-len(have):>5} of {len(NAME)}")
fhave = {r['fact_id'] for r in T['fact_eras']}
print(f"  facts with NO era row                 {len(T['facts'])-len(fhave):>5} of {len(T['facts'])}")
print(f"  positions with no era                 {sum(1 for r in T['person_positions'] if not r['era_id']):>5} of {len(T['person_positions'])}")
print(f"  quality ratings with no era           {sum(1 for r in T['person_quality'] if not r['era_id']):>5} of {len(T['person_quality'])}")
print("  A position or rating with no era is the same claim for every decade —")
print("  1996 Jordan and 2002 Jordan rated identically. That is D11's open work.")

empty = [e for e in T['eras']
         if e['era_id'] not in {r['era_id'] for r in T['person_eras']}
         and e['era_id'] not in {r['era_id'] for r in T['fact_eras']}]
print(f"\n  era rows nothing points at            {len(empty):>5}"
      + ('   ' + ', '.join(sorted(x['era_id'] for x in empty)) if empty else ''))

# ------------------------------------------------------------ 6. gap shape
rule('6. CAREERS WITH A HOLE IN THE MIDDLE')
holes = []
for pid, eids in pe_by_person.items():
    per_lg = collections.defaultdict(list)
    for e in eids:
        row = ERA.get(e)
        if row and row['league_id']:
            d = dec_num(row['decade'])
            if d:
                per_lg[row['league_id']].append(d)
    for lid, ds in per_lg.items():
        ds = sorted(set(ds))
        if len(ds) > 1:
            missing = [x for x in range(ds[0], ds[-1] + 1, 10) if x not in ds]
            if missing:
                holes.append((NAME.get(pid, pid), lid, ds, missing))
print(f"  people whose decades skip one in the middle   {len(holes):>5}")
print("  (real for a comeback, wrong for a continuous career — each needs a look)")
for n, lid, ds, m in sorted(holes)[:12]:
    print(f"      {n:24} {lid:9} has {','.join(str(x)[2:]+'s' for x in ds)}"
          f"   MISSING {','.join(str(x)[2:]+'s' for x in m)}")
if len(holes) > 12:
    print(f"      ... and {len(holes)-12} more")

# ------------------------------------------------------- 7. is it playable
rule('7. THE ONLY QUESTION THAT MATTERS: CAN YOU PLAY A DECADE?')
print("  A decade is playable in a league when it has enough PEOPLE to deal two")
print("  squads AND enough FACTS to ask about them. Below, per live/lab league:\n")
print(f"  {'league':10} {'decade':8} {'people':>7} {'facts':>7}   verdict")
for l in T['leagues']:
    if l['status'] == 'hidden':
        continue
    lid = l['league_id']
    rows = sorted((e for e in T['eras'] if e['league_id'] == lid),
                  key=lambda e: dec_num(e['decade']) or 0)
    for e in rows:
        ppl = len({r['person_id'] for r in T['person_eras'] if r['era_id'] == e['era_id']})
        fct = len({r['fact_id'] for r in T['fact_eras'] if r['era_id'] == e['era_id']})
        need = 6 if '3v3' in l['plays'][0] else 10
        v = 'ok' if ppl >= need and fct >= 20 else (
            'THIN — no squad' if ppl < need else 'THIN — no questions')
        print(f"  {lid:10} {e['decade']:8} {ppl:>7} {fct:>7}   {v}")

print('\nNothing was written. This tool only counts.')

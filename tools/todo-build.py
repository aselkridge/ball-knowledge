#!/usr/bin/env python3
"""R0 — build the todo table. Dry-run by default; --apply writes.

WHY THIS EXISTS (BUILD.md V0, run R0)
Aaron: *"say I pull up the row (players that need stats) I can join that and get
a table of every player that needs that research?"* Yes — but only if the gaps
live in a TABLE instead of where they lived before: twenty loose JSON files in
docs/play/data/ that each mean some version of "unfinished", joined to nothing.

THE DESIGN DECISION THAT MATTERS: rows are DERIVED, not typed.
A hand-maintained todo list is wrong the day after you write it — you fix a
player's stats and the list still says he needs stats. So every derived row is
recomputed from the tables on each run. Close the gap in the data and the row
disappears by itself. Nothing to remember, nothing to drift.

Rows a human genuinely has to write (a judgement call, an outreach task) carry
manual:true and are PRESERVED across rebuilds. Those are the only ones that
survive, and they are the only ones that should.

Each row points at a real row in a real table (target_table + target_id), so
"every player still missing stats" is a join, not an archaeology dig.
"""
import json, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
OUT = os.path.join(D, 'todo.json')
APPLY = '--apply' in sys.argv
LEAGUES = {'nba', 'wnba'}          # V0 scope, Aaron 08-01. Everything else waits.

T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D)
     if f.endswith('.json') and f != 'todo.json'}
SRC = {s['source_id']: s for s in T['sources']}
FACT = {f['fact_id'] for f in T['facts']}
NAME = {p['person_id']: p['name'] for p in T['people']}

# the question bank is JS, not JSON — pull the array out the same way audit.py does
qsrc = open(os.path.join(ROOT, 'docs/play/questions.js'), encoding='utf-8').read()
CARDS = []
for m in re.finditer(r'\{t:\s*\d.*?\}(?=,\n|\n\];)', qsrc, re.S):
    c = m.group(0)
    g = lambda p: (re.search(p, c).group(1) if re.search(p, c) else None)
    CARDS.append({'l': g(r'\bl:"([^"]*)"'), 'src': g(r'\bsrc:"([^"]*)"'),
                  'f': g(r'\bf:"([^"]*)"'),
                  'q': g(r'\bq:"((?:[^"\\]|\\.)*)"'),
                  'e': bool(re.search(r'\be:\[', c)), 'p': bool(re.search(r'\bp:\[', c)),
                  'v': bool(re.search(r'\bv:1', c))})

rows = []
def add(run, kind, tbl, tid, note, blocks):
    rows.append({'todo_id': f'{run}-{tbl}-{tid}', 'run': run, 'kind': kind,
                 'target_table': tbl, 'target_id': str(tid),
                 'note': note, 'blocks': blocks, 'manual': False})

people = {r['person_id'] for r in T['person_leagues'] if r['league_id'] in LEAGUES}

# ---- R2 · stat rows too thin to be useful --------------------------------
for i, r in enumerate(T['person_stats']):
    if r['league_id'] not in LEAGUES:
        continue
    filled = sum(1 for k, v in r.items()
                 if k not in ('person_id', 'league_id', 'era_id') and v not in (None, ''))
    if filled < 5:
        add('R2', 'stats-thin', 'people', r['person_id'],
            f"{NAME.get(r['person_id'],r['person_id'])} — {r['league_id']} stat row has "
            f"only {filled} real fields", 'per-era stats, stat-based battles')

# ---- R3 · sources with no reliability tier -------------------------------
for sid in {r['source_id'] for r in T['person_sources'] if r['person_id'] in people}:
    if not SRC.get(sid, {}).get('tier'):
        add('R3', 'source-untiered', 'sources', sid,
            f"no tier — cannot tell a record from an index: {SRC.get(sid,{}).get('name') or sid}",
            'the verified-pack gate')

# ---- R1/R4/R5/R6 · the question bank -------------------------------------
for i, c in enumerate(CARDS):
    if c['l'] not in LEAGUES:
        continue
    cid = c.get('f') or c['src'] or f'card-{i}'
    # R1 ASKS ONE THING: can this card find the fact it came from?
    # It used to test `src in FACT` — whether the card's SOURCE STRING happened
    # to be a fact id. It never was, for any card, which is why the counter sat
    # at 829 forever and read like an enormous research job. It was not research;
    # the emitter simply never wrote the link. `f` is that link now.
    if not c.get('f'):
        add('R1', 'card-source-dead', 'questions', cid,
            f"card carries no fact id — nothing to inherit verification from: {(c['q'] or '')[:70]}",
            'proving any answer is right')
    elif c['f'] not in FACT:
        add('R1', 'card-source-dead', 'questions', cid,
            f"fact id does not resolve to a fact row: {(c['q'] or '')[:70]}",
            'proving any answer is right')
    if not (c['e'] and c['p']):
        miss = ' + '.join(x for x, ok in (('era', c['e']), ('player', c['p'])) if not ok)
        add('R5', 'card-untagged', 'questions', cid,
            f"missing {miss} tag: {(c['q'] or '')[:70]}", 'era scoping, the 3x roster weighting')
    if c['v']:
        add('R6', 'card-volatile', 'questions', cid,
            f"answer can go stale: {(c['q'] or '')[:70]}", 'not shipping a wrong answer')

# ---- R7 · positions and ratings that apply to every decade at once --------
for tbl, run in (('person_positions', 'R7'), ('person_quality', 'R7')):
    for r in T[tbl]:
        if r.get('league_id') in LEAGUES and not r.get('era_id'):
            add(run, tbl.replace('person_', '') + '-no-era', 'people', r['person_id'],
                f"{NAME.get(r['person_id'],r['person_id'])} — one {tbl.split('_')[1]} for every "
                f"decade, so 1990s and 2020s are the same player",
                'eras meaning anything')

# ---- R8 · accolades with no year -----------------------------------------
yrs = {y['award_row'] for y in T['person_award_years']}
for r in T['person_awards']:
    if r.get('league_id') in LEAGUES and r['award_row'] not in yrs:
        add('R8', 'award-no-year', 'people', r['person_id'],
            f"{NAME.get(r['person_id'],r['person_id'])} — \"{(r.get('text') or '')[:56]}\" has no year",
            'era-filtered accolades')

# ---- keep anything a human wrote ------------------------------------------
manual = []
if os.path.exists(OUT):
    manual = [r for r in json.load(open(OUT)) if r.get('manual')]
rows = manual + rows

# ---------------------------------------------------------------- report
print('TODO TABLE — every gap, pointing at the row it blocks')
print(f'V0 scope: NBA + WNBA only ({len(people)} people). Everything else waits.\n')
by = collections.Counter(r['run'] for r in rows)
kinds = collections.defaultdict(collections.Counter)
for r in rows:
    kinds[r['run']][r['kind']] += 1
print(f"  {'run':6}{'rows':>7}   what it is")
for run in sorted(by):
    for k, n in kinds[run].most_common():
        print(f"  {run:6}{n:>7}   {k}")
print(f"\n  {'TOTAL':6}{len(rows):>7}   ({len(manual)} written by a human, preserved)")

print('\nWhat a join looks like now:')
ex = [r for r in rows if r['kind'] == 'stats-thin'][:3]
for r in ex:
    print(f"   todo.target_id = '{r['target_id']}'  ->  people.person_id  ->  {r['note'][:64]}")

if not APPLY:
    print('\n--dry: nothing written. Re-run with --apply.')
    sys.exit(0)
json.dump(rows, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(f'\nwrote {len(rows)} rows -> docs/play/data/tables/todo.json')

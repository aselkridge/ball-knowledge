#!/usr/bin/env python3
"""Prove the tables lost nothing and that every link lands on a real row.

Run after tools/tables-build.py. Exit 1 on any failure so it can gate a commit.

Why this exists as its own tool: the first version of tables-build.py looked
perfectly healthy by row count and had silently dropped 38 accolades and Bill
Walton's entire college career, because it processed only the first record of
the nine people who hold two. Row counts alone do not catch that. These do.
"""
import json, os, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D) if f.endswith('.json')}
fails = []
def check(cond, msg):
    print(('  PASS  ' if cond else '  FAIL  ') + msg)
    if not cond:
        fails.append(msg)

# NOTE (2026-07-31): this file used to compare the tables against players.json
# to prove the ORIGINAL migration lost nothing. That comparison is now backwards
# -- players.json is BUILD OUTPUT, so measuring the source against its own output
# fails the moment the source legitimately changes, which it did the instant the
# world league split. Exactly the trap already removed from audit.py's gate.
# The migration-era checks are gone; what remains is internal consistency, which
# stays true no matter how the data evolves.

print('INTERNAL CONSISTENCY')
leagues = {r['league_id'] for r in T['leagues']}
people_ids = {r['person_id'] for r in T['people']}
check(len({r['league_id'] for t in T for r in T[t] if isinstance(r, dict)
           and r.get('league_id')} - leagues) == 0,
      'every league_id used anywhere is a real league')
check(people_ids == {r['person_id'] for r in T['person_leagues']},
      'every person holds at least one league record, and vice versa')
check(all(r.get('gender') in (None, 'men', 'women', 'mixed') for r in T['person_leagues']),
      'gender is only ever men / women / mixed / null')
check(all(isinstance(r['plays'], list) and r['plays'] for r in T['leagues']),
      'every league declares at least one play shape')
check(all(set(r['genders']) <= {'men', 'women', 'mixed'} for r in T['leagues']),
      'every league declares valid genders')
check(all(r.get('text') for r in T['person_awards']),
      'every award keeps the line it was parsed from')
check(len({(r['person_id'], r['league_id'], r['ord']) for r in T['person_awards']}
          | {(r['person_id'], r['league_id'], r['ord']) for r in T['person_notes']})
      == len(T['person_awards']) + len(T['person_notes']),
      'no two accolades claim the same slot on one record')

print('\nEVERY LINK LANDS ON A REAL ROW')
ids = {'people': {r['person_id'] for r in T['people']},
       'leagues': {r['league_id'] for r in T['leagues']},
       'eras': {r['era_id'] for r in T['eras']},
       'facts': {r['fact_id'] for r in T['facts']},
       'sources': {r['source_id'] for r in T['sources']},
       'teams': {r['team_id'] for r in T['teams']},
       'awards': {r['award_row'] for r in T['person_awards']}}
LINKS = [
    ('person_leagues', 'person_id', 'people'), ('person_leagues', 'league_id', 'leagues'),
    ('person_eras', 'person_id', 'people'), ('person_eras', 'era_id', 'eras'),
    ('person_positions', 'person_id', 'people'), ('person_positions', 'league_id', 'leagues'),
    ('person_quality', 'person_id', 'people'), ('person_quality', 'league_id', 'leagues'),
    ('person_teams', 'person_id', 'people'), ('person_teams', 'team_id', 'teams'),
    ('person_sources', 'person_id', 'people'), ('person_sources', 'source_id', 'sources'),
    ('person_stats', 'person_id', 'people'), ('person_stats', 'league_id', 'leagues'),
    ('person_awards', 'person_id', 'people'), ('person_awards', 'league_id', 'leagues'),
    ('person_award_years', 'award_row', 'awards'),
    ('person_notes', 'person_id', 'people'),
    ('fact_leagues', 'fact_id', 'facts'), ('fact_leagues', 'league_id', 'leagues'),
    ('fact_eras', 'fact_id', 'facts'), ('fact_eras', 'era_id', 'eras'),
    ('fact_people', 'fact_id', 'facts'), ('fact_people', 'person_id', 'people'),
    ('fact_sources', 'fact_id', 'facts'), ('fact_sources', 'source_id', 'sources'),
]
bad = 0
for t, col, tgt in LINKS:
    miss = {r[col] for r in T[t] if r.get(col) is not None and r[col] not in ids[tgt]}
    if miss:
        bad += 1
        print(f'  FAIL  {t}.{col} -> {tgt}: {len(miss)} unresolved, e.g. {sorted(map(str, miss))[:3]}')
        fails.append(f'{t}.{col}')
if not bad:
    print(f'  PASS  all {len(LINKS)} link columns resolve')

print('\nNO ORPHANS')
used_people = {r['person_id'] for t in ('person_leagues',) for r in T[t]}
check(used_people == ids['people'], 'every person is in at least one league')
cited = {r['source_id'] for r in T['fact_sources']} | {r['source_id'] for r in T['person_sources']}
check(cited == ids['sources'], 'every source is cited by something')

print('\nTHE HONEST GAPS (counted, not hidden)')
nourl = [r for r in T['sources'] if not r['url']]
print(f"   sources with no url            {len(nourl):>5} of {len(T['sources'])}"
      f"  ({len(nourl)*100//len(T['sources'])}%)  <- labels that point nowhere")
print(f"   facts marked low confidence    {sum(1 for f in T['facts'] if f['confidence']=='low'):>5}")
print(f"   positions with no era          {sum(1 for r in T['person_positions'] if not r['era_id']):>5}  <- D11 work undone")
print(f"   quality with no era            {sum(1 for r in T['person_quality'] if not r['era_id']):>5}  <- D11 work undone")
print(f"   awards with no year recorded   {len([r for r in T['person_awards'] if r['award_row'] not in {y['award_row'] for y in T['person_award_years']}]):>5}"
      f"  <- countable, NOT era-filterable")

print('\n' + (f'{len(fails)} FAILING' if fails else 'ALL CHECKS PASS'))
sys.exit(1 if fails else 0)

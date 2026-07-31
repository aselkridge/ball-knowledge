#!/usr/bin/env python3
"""What would the PROPOSED league list actually contain?

Aaron, 22v: "how do we know where the gaps are and whats the most important to
reserach if we dont split and see the gaps?" -- correct, and this is the tool
that answers it. Splitting is the gap analysis, not a thing to do after one.

READ-ONLY. Writes nothing. It maps every record we already hold onto the
proposed league list and reports what lands where, so the empty cells ARE the
research brief.

The classifier is a HEURISTIC and says so: it reads a person's team names to
guess national-team vs club, and their WNBA membership to guess gender. It is a
starting count, not a verdict -- every number it prints is "at least this many",
and the unknowns are printed rather than hidden.
"""
import json, os, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D) if f.endswith('.json')}

# ---- the proposed list (22v). id, display, gender, plays, where it comes from
PROPOSED = [
    ('nba',            'NBA',                      'men',   '5v5-full',          'nba'),
    ('gleague',        'G League',                 'men',   '5v5-full',          'BUILD OUT'),
    ('big3',           'BIG3',                     'men',   '3v3-half',          'big3'),
    ('wnba',           'WNBA',                     'women', '5v5-full',          'wnba'),
    ('college-men',    'College (men)',            'men',   '5v5-full',          'college split'),
    ('college-women',  'College (women)',          'women', '5v5-full',          'college split'),
    ('intl-nat-men',   'International (national)', 'men',   '5v5-full',          'world split'),
    ('intl-nat-women', 'International (national)', 'women', '5v5-full',          'world split'),
    ('intl-club-men',  'International (club)',     'men',   '5v5-full',          'world split'),
    ('intl-club-women','International (club)',     'women', '5v5-full',          'world split'),
    ('street',         'Street Legends',           'mixed', '5v5-full/4v4-full/3v3-half', 'street'),
    ('fives',          'Early Black Basketball',   'mixed', '5v5-full',          'fives'),
    ('fiba3x3',        'FIBA 3x3 (Olympic)',       'men',   '3v3-half',          'NEW'),
    ('fiba3x3-women',  'FIBA 3x3 (Olympic)',       'women', '3v3-half',          'NEW'),
    ('wheel-men',      'Wheelchair',               'men',   '5v5-full',          'NEW'),
    ('wheel-women',    'Wheelchair',               'women', '5v5-full',          'NEW'),
]

# ---- heuristics, stated openly ---------------------------------------------
# a "national team" name is a country, or literally says national team
COUNTRYISH = {'yugoslavia','ussr','soviet union','lithuania','greece','brazil','spain',
    'argentina','australia','france','italy','croatia','serbia','germany','turkey',
    'china','nigeria','canada','slovenia','russia','usa','united states','puerto rico',
    'philippines','japan','angola','senegal','iran','venezuela','dominican republic',
    'czechoslovakia','poland','israel','new zealand','mexico','korea','egypt'}
def is_national(team_name):
    t = team_name.lower().strip()
    return 'national team' in t or t in COUNTRYISH

tn = {r['team_id']: r['name'] for r in T['teams']}
teams_of = collections.defaultdict(list)
for r in T['person_teams']:
    teams_of[(r['person_id'], r['league_id'])].append(tn[r['team_id']])
women = {r['person_id'] for r in T['person_leagues'] if r['league_id'] == 'wnba'}
facts_by_lg = collections.Counter(r['league_id'] for r in T['fact_leagues'])

# ---- map what we hold onto the proposal ------------------------------------
landing = collections.Counter()
unknown_gender = collections.Counter()
unknown_kind = 0
for r in T['person_leagues']:
    pid, lg = r['person_id'], r['league_id']
    if lg in ('nba', 'wnba', 'big3', 'street', 'fives', 'gleague'):
        landing[lg] += 1
        continue
    if lg == 'college':
        w = pid in women
        landing['college-women' if w else 'college-men'] += 1
        if not w:
            unknown_gender['college'] += 1      # men BY ASSUMPTION, not evidence
        continue
    if lg == 'world':
        ts = teams_of.get((pid, lg), [])
        nat = any(is_national(t) for t in ts)
        club = any(not is_national(t) for t in ts)
        w = pid in women
        if not ts:
            unknown_kind += 1
        # a person can be both -- count them in both, that is the point
        if nat or not ts:
            landing[('intl-nat-women' if w else 'intl-nat-men')] += 1
        if club:
            landing[('intl-club-women' if w else 'intl-club-men')] += 1
        if not w:
            unknown_gender['world'] += 1
        continue

print('PROPOSED LEAGUE LIST vs WHAT WE ACTUALLY HOLD\n')
print(f"{'league':17}{'gender':7}{'plays':30}{'people':>7}{'facts':>7}  status now")
for lid, name, gender, plays, origin in PROPOSED:
    n = landing.get(lid, 0)
    # facts follow the old league id until they are re-tagged by hand
    f = facts_by_lg.get(lid, 0)
    if origin in ('college split',):
        f = '(of %d)' % facts_by_lg.get('college', 0)
    elif origin == 'world split':
        f = '(of %d)' % facts_by_lg.get('world', 0)
    verdict = 'EMPTY — research' if n == 0 else ('thin' if n < 15 else 'ok')
    print(f"  {lid:15}{gender:7}{plays:30}{n:>7}{str(f):>7}  {verdict}")

print('\nHOW MUCH OF THIS IS GUESSED (say it, do not bury it):')
print(f"  college people assumed MEN purely because they are not in the WNBA: {unknown_gender['college']}")
print(f"  world   people assumed MEN purely because they are not in the WNBA: {unknown_gender['world']}")
print(f"  world   people with no team recorded, so national-vs-club unknown : {unknown_kind}")
print('\n  -> gender for everyone outside the WNBA is UNVERIFIED. The counts above are')
print('     a starting brief, not a finding. Every "EMPTY" row is a research target,')
print('     and that is the whole point of splitting before researching.')

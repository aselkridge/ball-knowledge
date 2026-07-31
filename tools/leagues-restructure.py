#!/usr/bin/env python3
"""22v: restructure the league list. ONE-TIME MIGRATION, --apply to write.

Spec: BUILD.md 22v-DECIDED, 22v-ROUND-2, 22v-SEQUENCING. Names approved by Aaron
2026-07-31.

WHAT IT DOES
  * `leagues` gains gender + tagline + slam word; `plays` becomes a LIST
    (Street plays three shapes -- the "can it have more than one?" test from
    TABLES.md 0, failing on a column written the same morning)
  * `world` SPLITS into two real leagues, because the data says it is two
    things: 216 club-team links vs 62 national-team links
        flags     national-team ball   FOR COUNTRY
        overseas  club ball abroad     OVERSEAS
  * `person_leagues` gains a nullable `gender`
  * G League, FIBA 3x3 and Wheelchair added EMPTY, status hidden
  * the `fives` pack comes down pending research

WHY GENDER IS A COLUMN AND NOT A PAIR OF LEAGUES
Aaron asked to "split" College and Early Black Basketball by gender. Splitting
them into separate league ROWS would mean assigning a gender to all 128 people
who have one, and we have evidence for exactly TWO of them -- everyone else is
male only by the absence of a WNBA record, which is not evidence. That is
inventing data in the file whose whole job is to stop that.

A nullable gender on the RECORD delivers everything the split was for: the gap
is countable, men's and women's play separately, and the sport's real structure
is respected (the NCAA runs one tournament in two divisions, not two leagues).
It also matches the picker Aaron approved -- one card, men/women toggle. If he
wants literal separate league rows later it is a data change, not a schema one.
"""
import json, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
APPLY = '--apply' in sys.argv
T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D) if f.endswith('.json')}

# ---------------------------------------------------------------- the list
# id, name, tagline, slam, genders, plays, status
LEAGUES = [
 ('nba',      'NBA',                    '5v5 · full court',        'THE SHOW',   ['men'],   ['5v5-full'], 'live'),
 ('wnba',     'WNBA',                   '5v5 · full court',        'THE W',      ['women'], ['5v5-full'], 'live'),
 ('big3',     'BIG3',                   '3v3 · half court',        "3'S UP",     ['men'],   ['3v3-half'], 'lab'),
 ('flags',    'Flags',                  'nation vs nation',        'FOR COUNTRY',['men','women'], ['5v5-full'], 'lab'),
 ('overseas', 'Overseas',               'club ball, everywhere else','OVERSEAS', ['men','women'], ['5v5-full'], 'lab'),
 ('college',  'College',                'the dance',               'MADNESS',    ['men','women'], ['5v5-full'], 'lab'),
 ('gleague',  'G League',               'the grind',               'NEXT UP',    ['men'],   ['5v5-full'], 'hidden'),
 ('street',   'Street Legends',         'no refs',                 'NO REFS',    ['men','women','mixed'],
                                                                                 ['5v5-full','4v4-full','3v3-half'], 'lab'),
 ('fives',    'Early Black Basketball', 'the fives, 1904-1950',    'THE FIVES',  ['men','women'], ['5v5-full'], 'hidden'),
 ('fiba3x3',  'FIBA 3x3',               'Olympic 3x3',             'THREE',      ['men','women'], ['3v3-half'], 'hidden'),
 ('wheelchair','Wheelchair',            'IWBF',                    'ROLL OUT',   ['men','women'], ['5v5-full','3v3-half'], 'hidden'),
]
OLD = {r['league_id']: r for r in T['leagues']}

# ------------------------------------------------- world -> flags / overseas
COUNTRYISH = {'yugoslavia','ussr','soviet union','lithuania','greece','brazil','spain',
 'argentina','australia','france','italy','croatia','serbia','germany','turkey','china',
 'nigeria','canada','slovenia','russia','usa','united states','puerto rico','philippines',
 'japan','angola','senegal','iran','venezuela','dominican republic','czechoslovakia',
 'poland','israel','new zealand','mexico','korea','egypt'}
def is_national(t):
    t = t.lower().strip()
    return 'national team' in t or t in COUNTRYISH

tn = {r['team_id']: r['name'] for r in T['teams']}
teams_of = collections.defaultdict(list)
for r in T['person_teams']:
    teams_of[(r['person_id'], r['league_id'])].append(tn[r['team_id']])
women = {r['person_id'] for r in T['person_leagues'] if r['league_id'] == 'wnba'}

NAT = re.compile(r'\b(Olympic|FIBA World Cup|World Cup|EuroBasket|national team|AmeriCup|'
                 r'AfroBasket|Asia Cup|Dream Team|Olympics)\b', re.I)
CLUB = re.compile(r'\b(EuroLeague|Euroleague|ACB|CBA|NBL|Real Madrid|Barcelona|Panathinaikos|'
                  r'Olympiacos|CSKA|Maccabi|Partizan|Zalgiris|club)\b', re.I)

def build():
    out = {k: [dict(r) for r in v] for k, v in T.items()}

    # --- leagues -----------------------------------------------------------
    out['leagues'] = []
    for lid, name, tag, slam, genders, plays, status in LEAGUES:
        o = OLD.get(lid, {})
        out['leagues'].append({
            'league_id': lid, 'name': name, 'tagline': tag, 'slam': slam,
            'genders': genders, 'plays': plays, 'status': status,
            'first_year': None, 'last_year': None,          # 22v: still Aaron's call
            'ball': o.get('ball'), 'colour': o.get('colour'),
            'colour_hi': o.get('colour_hi')})

    # --- person_leagues: split world, add nullable gender ------------------
    pl, moved = [], collections.Counter()
    for r in T['person_leagues']:
        pid, lg = r['person_id'], r['league_id']
        base = {k: v for k, v in r.items() if k != 'league_id'}
        # gender: ONLY where we have evidence. WNBA membership is evidence;
        # its absence is not. Everyone else stays null and stays countable.
        base['gender'] = 'women' if pid in women else (
            'men' if lg in ('nba', 'big3', 'gleague') else None)
        if lg != 'world':
            pl.append(dict(base, league_id=lg)); moved[lg] += 1
            continue
        ts = teams_of.get((pid, 'world'), [])
        nat = any(is_national(t) for t in ts)
        club = any(not is_national(t) for t in ts)
        if not ts:
            nat = True                       # no evidence either way -> the broader one
        if nat:
            pl.append(dict(base, league_id='flags')); moved['flags'] += 1
        if club:
            pl.append(dict(base, league_id='overseas')); moved['overseas'] += 1
    out['person_leagues'] = pl

    # --- person_* tables that carry league_id follow the same split --------
    for tbl in ('person_positions', 'person_quality', 'person_teams', 'person_sources',
                'person_stats', 'person_awards', 'person_notes'):
        rows = []
        for r in T[tbl]:
            if r.get('league_id') != 'world':
                rows.append(dict(r)); continue
            ts = teams_of.get((r['person_id'], 'world'), [])
            nat = any(is_national(t) for t in ts) or not ts
            club = any(not is_national(t) for t in ts)
            # a team row goes to the side it belongs to; everything else follows
            # the person into BOTH, because their career genuinely spans both
            if tbl == 'person_teams':
                rows.append(dict(r, league_id='flags' if is_national(tn[r['team_id']]) else 'overseas'))
            else:
                if nat:  rows.append(dict(r, league_id='flags'))
                if club: rows.append(dict(r, league_id='overseas'))
        out[tbl] = rows

    # --- fact_leagues: classify by the fact's own words --------------------
    facts = {f['fact_id']: f for f in T['facts']}
    fl, unclear = [], []
    for r in T['fact_leagues']:
        if r['league_id'] != 'world':
            fl.append(dict(r)); continue
        f = facts[r['fact_id']]
        txt = f['question'] + ' ' + ' '.join(f['choices'])
        nat, club = bool(NAT.search(txt)), bool(CLUB.search(txt))
        if not nat and not club:
            # 70 facts say nothing either way. They ARE international, so per D8
            # they ride BOTH rather than being lost -- but they are recorded as
            # needing a human, and the count is a gate metric.
            unclear.append({'fact_id': r['fact_id'], 'question': f['question'][:110]})
            nat = club = True
        if nat:  fl.append({'fact_id': r['fact_id'], 'league_id': 'flags'})
        if club: fl.append({'fact_id': r['fact_id'], 'league_id': 'overseas'})
    out['fact_leagues'] = fl

    # --- eras follow their league -----------------------------------------
    eras, seen = [], set()
    for r in T['eras']:
        if r['league_id'] != 'world':
            eras.append(dict(r)); seen.add(r['era_id']); continue
        for lid in ('flags', 'overseas'):
            e = f"{lid}-{r['decade']}"
            if e not in seen:
                seen.add(e); eras.append({'era_id': e, 'league_id': lid, 'decade': r['decade']})
    out['eras'] = eras
    # and every person_eras / fact_eras pointing at a world-* era
    for tbl in ('person_eras', 'fact_eras'):
        rows = []
        for r in T[tbl]:
            if not str(r['era_id']).startswith('world-'):
                rows.append(dict(r)); continue
            dec = r['era_id'].split('-', 1)[1]
            key = 'person_id' if tbl == 'person_eras' else 'fact_id'
            for lid in ('flags', 'overseas'):
                rows.append({key: r[key], 'era_id': f'{lid}-{dec}'})
        out[tbl] = rows

    # --- the fives pack comes down (22v round 2) ---------------------------
    out['packs'] = [dict(p) for p in T['packs'] if p['pack_id'] != 'fives']
    return out, moved, unclear

new, moved, unclear = build()

print('LEAGUES\n')
print(f"{'id':12}{'name':24}{'gender':18}{'plays':34}{'status':8}{'people':>7}")
cnt = collections.Counter(r['league_id'] for r in new['person_leagues'])
for r in new['leagues']:
    print(f"  {r['league_id']:10}{r['name']:24}{'/'.join(r['genders']):18}"
          f"{'/'.join(r['plays']):34}{r['status']:8}{cnt.get(r['league_id'],0):>7}")

g = collections.Counter(r['gender'] for r in new['person_leagues'])
print(f"\nGENDER on person_leagues:  women {g['women']}   men {g['men']}   "
      f"UNKNOWN {g[None]}  <- null, not guessed")
print(f"\nworld split -> flags {cnt['flags']}, overseas {cnt['overseas']} "
      f"(a person in both is in both, correctly)")
print(f"facts needing a human to sort national-vs-club: {len(unclear)}")
print(f"packs: {len(T['packs'])} -> {len(new['packs'])} (fives pulled)")

if not APPLY:
    print('\n--dry: nothing written. Re-run with --apply, then tables-emit.py.')
    sys.exit(0)
for k, v in new.items():
    json.dump(v, open(os.path.join(D, k + '.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(unclear, open(os.path.join(ROOT, 'docs/play/data/world-facts-to-sort.json'), 'w'),
          ensure_ascii=False, indent=1)
print(f'\nwrote {len(new)} tables + docs/play/data/world-facts-to-sort.json')
print('NOW RUN: python3 tools/tables-emit.py')

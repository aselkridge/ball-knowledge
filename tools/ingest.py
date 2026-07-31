#!/usr/bin/env python3
"""Put a research run INTO THE TABLES. The one door for new data.

DRY RUN BY DEFAULT -- writes nothing unless --apply is passed.

  python3 tools/ingest.py docs/play/data/research-run4.json
  python3 tools/ingest.py <file> --apply
  python3 tools/tables-emit.py            # <- ALWAYS, or the game runs stale

Why this exists. The six merge-*.py scripts each target one specific research
file (research-run3-players.json, research-run2-stats.json, ...) and each writes
straight to players.json / questions.js -- which are BUILD OUTPUT now. Running
one today would drop new data into a generated file, and the next
tools/tables-emit.py would wipe it. They are kept as a record of how earlier
runs were merged; they must not be run again. This is their replacement, and it
is run-agnostic: hand it any research file in the shape researchers already
deliver.

It carries the gates the old scripts established, because they were earned:
  * schema: t 0-4, a known league, exactly 4 distinct options, a question mark
  * c[0] ARRIVES CORRECT and gets shuffled; `a` records where it landed
  * seeded, so the same input always produces the same result
  * dedupe on exact question stem and on source id, against the whole bank
  * a person already in the tables is UPDATED, never duplicated

And it will not invent anything. A fact with no real source link is ingested at
confidence `low` with its label kept, exactly like the 1,326 already there.
"""
import json, os, re, sys, random, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
SEED = 20260731

sys.path.insert(0, os.path.join(ROOT, 'tools'))
from bkid import slug, canonical_name     # bkid.py: "Import this; never
                                          # re-implement it." I re-implemented
                                          # it here and got it wrong -- my copy
                                          # stripped punctuation instead of
                                          # turning it into a hyphen, so
                                          # "J.J. Redick" came out jj-redick
                                          # against the real j-j-redick and this
                                          # tool would have re-split the very
                                          # person the migration merged.

def load():
    return {f[:-5]: json.load(open(os.path.join(D, f)))
            for f in os.listdir(D) if f.endswith('.json')}

def save(T, names):
    for n in names:
        json.dump(T[n], open(os.path.join(D, n + '.json'), 'w'),
                  ensure_ascii=False, indent=1)

STATKEYS = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'fg_pct', 'ft_pct', 'fg3_pct', 'g', 'pts']

def rows_of(blob, key):
    """Research files wrap their payload differently per run; find the list."""
    if isinstance(blob, list):
        return blob if key == 'players' else []
    v = blob.get(key)
    return v if isinstance(v, list) else []

def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith('--'):
        print(__doc__)
        return 2
    path = sys.argv[1]
    apply = '--apply' in sys.argv
    random.seed(SEED)
    blob = json.load(open(path))
    T = load()
    touched = set()

    leagues = {r['league_id'] for r in T['leagues']}
    people = {r['person_id']: r for r in T['people']}
    eras = {r['era_id'] for r in T['eras']}
    sources = {r['source_id']: r for r in T['sources']}
    stems = {f['question'].strip().lower() for f in T['facts']}
    fact_ids = {f['fact_id'] for f in T['facts']}
    cited_src = {r['source_id'] for r in T['fact_sources']}
    have_person_league = {(r['person_id'], r['league_id']) for r in T['person_leagues']}
    by_name = {r['name']: r['person_id'] for r in T['people']}
    team_by_name = {r['name']: r['team_id'] for r in T['teams']}
    next_award = max([r['award_row'] for r in T['person_awards']] or [0])

    def use_source(val):
        if not val:
            return None
        if val.startswith('http'):
            sid = slug(re.sub(r'^https?://(www\.)?', '', val))[:80]
            if sid in sources and sources[sid]['url'] != val:
                n = 2
                while f'{sid}-{n}' in sources and sources[f'{sid}-{n}']['url'] != val:
                    n += 1
                sid = f'{sid}-{n}'
            if sid not in sources:
                sources[sid] = {'source_id': sid, 'title': None, 'url': val,
                                'publisher': re.sub(r'^https?://(www\.)?([^/]+).*', r'\2', val),
                                'date_checked': None}
                T['sources'].append(sources[sid])
                touched.add('sources')
            return sid
        sid = val
        if sid not in sources:
            sources[sid] = {'source_id': sid, 'title': val, 'url': None,
                            'publisher': None, 'date_checked': None}
            T['sources'].append(sources[sid])
            touched.add('sources')
        return sid

    def use_era(lg, dec):
        eid = f'{lg}-{dec}' if lg else str(dec)
        if eid not in eras:
            eras.add(eid)
            T['eras'].append({'era_id': eid, 'league_id': lg, 'decade': str(dec)})
            touched.add('eras')
        return eid

    # ------------------------------------------------------------ people
    pin = rows_of(blob, 'players')
    p_new = p_upd = p_skip = 0
    rejected = []
    for r in pin:
        if not r.get('name') or not r.get('league'):
            rejected.append(('player', r.get('name', '?'), 'missing name or league')); continue
        lg = r['league']
        if lg not in leagues:
            rejected.append(('player', r['name'], f'unknown league {lg!r}')); continue
        # match an existing person BY NAME first and only fall back to
        # slugging. A lookup can never drift from however the id was originally
        # made; recomputing one always can.
        pid = by_name.get(r['name']) or by_name.get(canonical_name(r['name'])) \
              or slug(canonical_name(r['name']))
        if (pid, lg) in have_person_league:
            p_skip += 1                     # already have this person in this league
            continue
        if pid not in people:
            people[pid] = {'person_id': pid, 'name': r['name'],
                           'also_known_as': None, 'jersey': None}
            T['people'].append(people[pid]); by_name[r['name']] = pid
            touched.add('people'); p_new += 1
        else:
            p_upd += 1                      # known person, NEW league record
        have_person_league.add((pid, lg))
        T['person_leagues'].append({'person_id': pid, 'league_id': lg,
                                    'jersey': r.get('num'),
                                    'confidence': r.get('confidence'),
                                    'date_checked': r.get('dateChecked')})
        touched.add('person_leagues')
        for e in (r.get('eras') or []):
            T['person_eras'].append({'person_id': pid, 'era_id': use_era(lg, e)})
            touched.add('person_eras')
        if r.get('pos'):
            T['person_positions'].append({'person_id': pid, 'position': r['pos'],
                                          'league_id': lg, 'era_id': None})
            touched.add('person_positions')
        if r.get('tier'):
            T['person_quality'].append({'person_id': pid, 'quality': r['tier'],
                                        'league_id': lg, 'era_id': None})
            touched.add('person_quality')
        for t in (r.get('teams') or []):
            # by name, for the same reason as people: two of the 337 existing
            # team ids predate this slug rule (killer-3s, 3s-company) and
            # recomputing them would mint a duplicate team
            tid = team_by_name.get(t)
            if not tid:
                tid = slug(t); team_by_name[t] = tid
                T['teams'].append({'team_id': tid, 'name': t}); touched.add('teams')
            T['person_teams'].append({'person_id': pid, 'league_id': lg, 'team_id': tid})
            touched.add('person_teams')
        for kind, key in (('career', 'career'), ('peak', 'peak'), ('high', 'highs')):
            blk = r.get(key)
            if not blk:
                continue
            row = {'person_id': pid, 'kind': kind, 'league_id': lg, 'era_id': None,
                   'season': blk.get('season'),
                   'covers': r.get('covers') if kind == 'career' else None}
            for k in STATKEYS:
                row[k] = blk.get(k)
            T['person_stats'].append(row); touched.add('person_stats')
        for i, a in enumerate(r.get('accolades') or []):
            # same split as D12 -- reuse the builder's parser so one rule governs
            parsed = parse_accolade(a)
            if parsed is None:
                T['person_notes'].append({'person_id': pid, 'league_id': lg,
                                          'ord': i, 'text': a}); touched.add('person_notes')
            else:
                name, times, years = parsed
                next_award += 1
                T['person_awards'].append({'award_row': next_award, 'person_id': pid,
                                           'league_id': lg, 'ord': i, 'text': a,
                                           'award': name, 'times_won': times})
                touched.add('person_awards')
                for y in years:
                    T['person_award_years'].append({'award_row': next_award, 'year': y})
                    touched.add('person_award_years')
        sid = use_source(r.get('source') or r.get('statSource'))
        if sid:
            T['person_sources'].append({'person_id': pid, 'league_id': lg,
                                        'source_id': sid, 'role': 'stat'})
            touched.add('person_sources')

    # ----------------------------------------------------------- questions
    qin = rows_of(blob, 'questions')
    # A research file carries the verifier's verdicts alongside the questions:
    # `kills` are ones it REJECTED (with a reason) and `fixes` are concrete
    # field corrections. Ignoring them means ingesting known-bad rows and
    # dropping known corrections -- the old merge applied both, and the order
    # matters: fixes first, because one may repair the very field a gate checks.
    kills = {k['srcId']: k.get('why', '') for k in (blob.get('kills') or [])
             if isinstance(k, dict) and k.get('srcId')}
    fixes = collections.defaultdict(list)
    for f in (blob.get('fixes') or []):
        if isinstance(f, dict) and f.get('srcId') and f.get('field') is not None:
            fixes[f['srcId']].append(f)
    q_new = q_skip = q_killed = q_fixed = 0
    seen_src_this_run = set()
    for r in qin:
        sref = r.get('srcId') or r.get('src')
        if sref in kills:
            q_killed += 1
            continue
        for f in fixes.get(sref, []):
            if 'correct' in f and r.get(f['field']) != f['correct']:
                r = dict(r); r[f['field']] = f['correct']; q_fixed += 1
        stem = (r.get('q') or '').strip()
        opts = r.get('c') or []
        why = None
        if not stem or not stem.endswith('?'):
            why = 'no question mark'
        elif r.get('t') not in (0, 1, 2, 3, 4):
            why = f"difficulty {r.get('t')!r} not 0-4"
        elif (r.get('l') or 'any') != 'any' and r.get('l') not in leagues:
            why = f"unknown league {r.get('l')!r}"
        elif len(opts) != 4 or len(set(opts)) != 4:
            why = f'{len(opts)} options, {len(set(opts))} distinct (need 4 and 4)'
        elif stem.lower() in stems:
            q_skip += 1; continue
        elif r.get('srcId') and r['srcId'] in seen_src_this_run:
            q_skip += 1; continue
        if why:
            rejected.append(('question', stem[:54], why)); continue

        # c[0] arrives correct; shuffle and record where it lands
        correct = opts[0]
        shuffled = opts[:]
        random.shuffle(shuffled)
        lg = r.get('l') or 'any'
        universal = (lg == 'any')
        fid = 'f-%04d-%s' % (len(T['facts']) + 1, slug(stem)[:52])
        while fid in fact_ids:
            fid += '-b'
        fact_ids.add(fid); stems.add(stem.lower())
        if r.get('srcId'):
            seen_src_this_run.add(r['srcId'])
        sid = use_source(r.get('src') or r.get('srcId'))
        T['facts'].append({
            'fact_id': fid, 'difficulty': r['t'], 'question': stem,
            'choices': shuffled, 'answer': shuffled.index(correct),
            'category': r.get('cat'), 'universal': universal,
            'goes_stale': bool(r.get('v')), 'off_court': bool(r.get('off')),
            # D14, and the same rule the migration used: a fact whose only
            # source is a label pointing nowhere is low confidence by
            # construction. NEVER invent a url to dodge this.
            'confidence': ('medium' if (sid and sources[sid]['url']) else
                           'low' if sid else None),
            'date_checked': r.get('dateChecked')})
        touched.add('facts')
        if not universal:
            T['fact_leagues'].append({'fact_id': fid, 'league_id': lg}); touched.add('fact_leagues')
        for e in (r.get('e') or []):
            T['fact_eras'].append({'fact_id': fid,
                                   'era_id': use_era(None if universal else lg, e)})
            touched.add('fact_eras')
        for pidx in (r.get('p') or []):
            if pidx in people:
                T['fact_people'].append({'fact_id': fid, 'person_id': pidx})
                touched.add('fact_people')
            else:
                rejected.append(('question', stem[:54], f'player tag {pidx!r} matches nobody'))
        if sid:
            T['fact_sources'].append({'fact_id': fid, 'source_id': sid}); touched.add('fact_sources')
        q_new += 1

    # -------------------------------------------------------------- report
    print(f'{os.path.basename(path)}\n')
    print(f'  people   : {len(pin):>5} in run   {p_new} new, {p_upd} new league record for '
          f'someone we already have, {p_skip} already present')
    print(f'  questions: {len(qin):>5} in run   {q_new} new, {q_skip} duplicates dropped, '
          f'{q_killed} killed by the verifier, {q_fixed} verifier fixes applied')
    if rejected:
        print(f'\n  REJECTED ({len(rejected)}) -- these are NOT ingested:')
        for kind, what, why in rejected[:14]:
            print(f'    {kind:9} {what[:52]:54} {why}')
        if len(rejected) > 14:
            print(f'    ... and {len(rejected)-14} more')
    nourl = sum(1 for f in T['facts'] if f.get('confidence') == 'low')
    print(f'\n  facts at low confidence after this run: {nourl}')

    if not apply:
        print('\n--dry: nothing written. Re-run with --apply, then tables-emit.py.')
        return 0
    save(T, sorted(touched))
    print(f'\nwrote {len(touched)} table(s): {", ".join(sorted(touched))}')
    print('NOW RUN: python3 tools/tables-emit.py   (or the game runs on stale data)')
    return 0

# the award/note split must obey exactly one rule -- borrow the builder's
_src = open(os.path.join(ROOT, 'tools/tables-build.py')).read()
_ns = {'re': re}
exec(_src[_src.index('AWARD_WORDS ='):_src.index('# ------------------------------'
     '--------------------------------------- build')], _ns)
parse_accolade = _ns['parse_accolade']

if __name__ == '__main__':
    sys.exit(main())

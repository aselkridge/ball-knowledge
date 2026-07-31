#!/usr/bin/env python3
"""Build the 21 tables from the two flat files. Spec: TABLES.md. Decisions: BUILD.md D8-D14.

The rule this whole file serves (TABLES.md 0): A COLUMN HOLDS EXACTLY ONE VALUE.
Anything a person or a fact can have SEVERAL of gets its own table.

This is a PURE, LOSSLESS transform. It invents nothing. Where the current data
cannot answer a question, the table says NULL and the gap stays countable --
see the era_id on person_positions/person_quality, and the url on label-only
sources. Do not "helpfully" fill those in; the whole point is that the holes
are visible.

ONE-TIME MIGRATION, NOT A REPEATABLE BUILD. It reads players.json, which is
now OUTPUT of tools/tables-emit.py -- so re-running it after anyone edits a
table would overwrite that edit with whatever the stale flat file still says.
Edit the TABLES and run tables-emit.py. This script is kept for auditability of
how the tables were derived, and is deliberately NOT gated by tools/audit.py.

Usage: python3 tools/tables-build.py [--check]
       --check rebuilds into memory and diffs against what's on disk.
"""
import json, os, re, subprocess, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAYERS = os.path.join(ROOT, 'docs/play/data/players.json')
QUESTIONS = os.path.join(ROOT, 'docs/play/questions.js')
GAME = os.path.join(ROOT, 'docs/play/game.js')
OUT = os.path.join(ROOT, 'docs/play/data/tables')

def slug(s):
    """Slug for TEAM and SOURCE ids only.

    NOT the same rule as bkid.py, despite what this comment used to claim:
    bkid turns punctuation into a hyphen ("J.J. Redick" -> j-j-redick) while
    this strips it (-> jj-redick). It never mattered here because PERSON ids
    are read from players.json, not made here -- but tools/ingest.py copied
    this function to mint person ids and would have re-split J.J. Redick from
    himself. Person ids come from bkid.slug. Nothing else should copy this.
    """
    s = (s or '').lower().strip()
    for a, b in (('&', ' and '), ("'", ''), ('’', ''), ('"', ''), ('.', '')):
        s = s.replace(a, b)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return re.sub(r'-+', '-', s).strip('-')

# ---------------------------------------------------------------- read inputs
def read_questions():
    """questions.js is real JS, not JSON -- let node evaluate it rather than
    trying to regex object literals with nested quotes and escapes."""
    tmp = os.path.join(OUT, '.questions.tmp.json')
    os.makedirs(OUT, exist_ok=True)
    js = ("const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);"
          "vm.runInContext(fs.readFileSync(%r,'utf8')+'\\n;this.__Q=QUESTIONS;',c);"
          "fs.writeFileSync(%r,JSON.stringify(c.__Q));" % (QUESTIONS, tmp))
    subprocess.run(['node', '-e', js], check=True, cwd=ROOT)
    q = json.load(open(tmp))
    os.remove(tmp)
    return q

def read_leagues():
    """Merge the FOUR disagreeing lists (TABLES.md 1). LG_LEAGUES is the
    REGISTRY -- a league exists because it is there, not because it has a
    dealer. That mistake has now been made twice; see BUILD.md 22u."""
    g = open(GAME).read()
    reg = re.search(r'var LG_LEAGUES=\[(.*?)\n\];', g, re.S).group(1)
    modes = set(re.findall(r'\n  (\w+):\{cols', g))
    packs = re.search(r'var PACKS=\[(.*?)\n\];', g, re.S).group(1)
    pack_ids = re.findall(r"\{id:'(\w+)',\s*nm:", packs)
    pack_rows = [{'pack_id': i, 'name': n, 'colour': c} for i, n, c in
                 re.findall(r"\{id:'(\w+)',\s*nm:'([^']*)',\s*rc:'([^']*)'", packs)]

    out = []
    for m in re.finditer(r"\{id:'(\w+)',\s*name:'([^']*)'[^\n]*", reg):
        lid, nm = m.group(1), m.group(2)
        line = m.group(0)
        ball = re.search(r"ball:'([^']*)'", line)
        col = re.search(r"rc:'([^']*)'", line)
        # how it plays comes from MODES; 'none' means it cannot field a squad
        plays = 'none'
        if lid in modes:
            plays = '3v3-half' if lid == 'big3' else '5v5-full'
        out.append({
            'league_id': lid, 'name': nm,
            'plays': plays,
            'status': 'lab' if 'lock:1' in line else 'live',
            # NOT in the code anywhere. Left NULL deliberately -- Aaron has not
            # ruled on the league list yet (BUILD.md 22v). Do not guess years.
            'first_year': None, 'last_year': None,
            'ball': ball.group(1) if ball else None,
            'colour': col.group(1) if col else None,
        })
    seen = {r['league_id'] for r in out}
    # a league can exist in the data without being in the picker -- 'fives' is
    # exactly that, and its invisibility is a finding, not something to paper over
    for lid in pack_ids:
        if lid not in seen:
            out.append({'league_id': lid, 'name': dict((r['pack_id'], r['name']) for r in pack_rows).get(lid, lid),
                        'plays': '5v5-full' if lid in modes else 'none',
                        'status': 'hidden', 'first_year': None, 'last_year': None,
                        'ball': None, 'colour': None})
    return out, pack_rows

# ------------------------------------------------------------- era resolution
def era_id(league, decade):
    """An era belongs to a league (D9). league None => a bare decade, which is
    what the 38 universal facts with a date need ("basketball invented, 1891").
    This does NOT weaken the guarantee: 'nba-1910s' is still never created
    unless an nba record actually claims the 1910s."""
    d = str(decade)
    return ('%s-%s' % (league, d)) if league else d

# --------------------------------------------------------------- award parser
AWARD_WORDS = re.compile(
    r'\b(MVP|All-Star|All-NBA|All-WNBA|All-American|All-Defensive|champion|championship|'
    r'Hall of Fame|HOF|Olympic|gold|silver|bronze|Rookie of the Year|Defensive Player|'
    r'Sixth Man|Most Improved|EuroBasket|World Cup|scoring title|scoring champion|'
    r'Player of the Year|Coach of the Year|Finals MVP|title|Most Outstanding Player)\b', re.I)

def parse_accolade(text):
    """-> (award, times_won, [years]) or None if it reads as prose.

    Aaron asked whether every accolade splits. It does not -- ~44% is writing
    that columns would destroy, and those go to person_notes verbatim (D12)."""
    t = text.strip()
    m = re.match(r'^(\d+)x\s+(.*)$', t)
    times, rest = (int(m.group(1)), m.group(2)) if m else (1, t)
    years = []
    ym = re.search(r'\(([^)]*)\)\s*$', rest)
    if ym:
        inner = ym.group(1)
        for a, b in re.findall(r'\b((?:19|20)\d{2})\s*[-–]\s*((?:19|20)?\d{2})\b', inner):
            b = b if len(b) == 4 else a[:2] + b
            if int(b) >= int(a):
                years += list(range(int(a), int(b) + 1))
        if not years:
            years = [int(y) for y in re.findall(r'\b((?:19|20)\d{2})\b', inner)]
        if years:
            rest = rest[:ym.start()].strip()
    if not years:
        lead = re.match(r'^((?:19|20)\d{2})\s+(.*)$', rest)   # "1979 All-Star"
        if lead:
            years = [int(lead.group(1))]
            rest = lead.group(2)
    if not AWARD_WORDS.search(rest):
        return None
    return (rest.strip(' .,'), times, sorted(set(years)))

# --------------------------------------------------------------------- build
def build():
    players = json.load(open(PLAYERS))
    facts = read_questions()
    leagues, packs = read_leagues()
    league_ids = {r['league_id'] for r in leagues}
    T = collections.defaultdict(list)
    T['leagues'] = leagues
    T['packs'] = packs

    eras = {}
    def use_era(lg, dec):
        eid = era_id(lg, dec)
        eras.setdefault(eid, {'era_id': eid, 'league_id': lg, 'decade': str(dec)})
        return eid

    # ---- people and everything hanging off them
    people = {}
    teams = {}
    sources = {}
    def use_source(val, kind):
        """A label-only source still gets a row with url NULL, so fact_sources
        always resolves and the 1,326-strong gap stays countable (TABLES.md 1).
        NEVER invent a url here."""
        if val.startswith('http'):
            sid = slug(re.sub(r'^https?://(www\.)?', '', val))[:80]
            # two DIFFERENT links can survive the 80-char cut identically -- one
            # pair already does, a compound "url1 and url2" statSource where only
            # the tail differs. Disambiguate rather than silently merge them.
            if sid in sources and sources[sid]['url'] != val:
                n = 2
                while f'{sid}-{n}' in sources and sources[f'{sid}-{n}']['url'] != val:
                    n += 1
                sid = f'{sid}-{n}'
            sources.setdefault(sid, {'source_id': sid, 'title': None, 'url': val,
                                     'publisher': re.sub(r'^https?://(www\.)?([^/]+).*', r'\2', val),
                                     'date_checked': None})
        else:
            sid = val
            sources.setdefault(sid, {'source_id': sid, 'title': val, 'url': None,
                                     'publisher': None, 'date_checked': None})
        return sid

    award_row = 0
    seen_note, seen_award, seen_team, seen_src = set(), set(), set(), set()
    for p in players:
        pid, lg = p['playerId'], p['league']
        # Identity is per PERSON; everything else is per RECORD. The nine people
        # who hold two records are the reason: six of them already DISAGREE on
        # quality across their two leagues (Bill Walton is a superstar in
        # college and an all-star in the NBA) and Tom Gola disagrees on position
        # too (SF in college, SG in the NBA). That variation is real signal that
        # was invisible while it sat inside duplicate rows -- an earlier pass of
        # this script kept only the first record and silently dropped 38
        # accolades and Walton's whole college career.
        people.setdefault(pid, {'person_id': pid, 'name': p['name'],
                                'also_known_as': p.get('aka')})
        # league_id carries the variation we HAVE; era_id is NULL because that
        # breakdown does not exist yet (D11) and must not be invented.
        T['person_positions'].append({'person_id': pid, 'position': p['pos'],
                                      'league_id': lg, 'era_id': None})
        T['person_quality'].append({'person_id': pid, 'quality': p['tier'],
                                    'league_id': lg, 'era_id': None})
        for t in (p.get('teams') or []):
            tid = slug(t)
            teams.setdefault(tid, {'team_id': tid, 'name': t})
            # league-scoped: Bill Walton's UCLA belongs to his college record,
            # not his NBA one, and without this they merge into both
            if (pid, lg, tid) not in seen_team:
                seen_team.add((pid, lg, tid))
                T['person_teams'].append({'person_id': pid, 'league_id': lg,
                                          'team_id': tid})
        # `ord` is the accolade's position in the record's original list, and
        # `text` is the line exactly as written. Both exist so the list rebuilds
        # verbatim and in order: the parsed award/times_won/years are for
        # QUERYING, the text is what a player actually reads on a card. Without
        # them "1990 All-Star" comes back as "All-Star (1990)" and
        # "(1987, 1988, 2000)" as "(1987-88, 2000)" -- a silent product change.
        for i, a in enumerate(p.get('accolades') or []):
            parsed = parse_accolade(a)
            if parsed is None:
                T['person_notes'].append({'person_id': pid, 'league_id': lg,
                                          'ord': i, 'text': a})
            else:
                name, times, years = parsed
                award_row += 1
                T['person_awards'].append({'award_row': award_row, 'person_id': pid,
                                           'league_id': lg, 'ord': i, 'text': a,
                                           'award': name, 'times_won': times})
                for y in years:
                    T['person_award_years'].append({'award_row': award_row, 'year': y})
        # `role` matters: statSource is THE source for the numbers, `sources` are
        # supporting. Flattening them into one list loses which was which.
        for s, role in ([(p['statSource'], 'stat')] if p.get('statSource') else []) + \
                       [(s, 'supporting') for s in (p.get('sources') or [])]:
            sid = use_source(s, 'person')
            # role is part of the key on purpose: the same link is very often
            # BOTH the stat source and a member of the supporting list, and
            # deduping across roles silently drops it from the list
            if (pid, lg, sid, role) not in seen_src:
                seen_src.add((pid, lg, sid, role))
                T['person_sources'].append({'person_id': pid, 'league_id': lg,
                                            'source_id': sid, 'role': role})
        # confidence/date_checked describe the RECORD, not its stats -- Aaron
        # 'AO' Owens carries both and has no career block at all, so hanging
        # them off person_stats loses them outright.
        # jersey is per RECORD too: Pete Maravich wore 23 at LSU and 7 in the
        # NBA, so a single number on `people` silently picks one and loses the
        # other -- the same shape of bug as position and quality
        T['person_leagues'].append({'person_id': pid, 'league_id': lg,
                                    'jersey': p.get('num'),
                                    'confidence': p.get('confidence'),
                                    'date_checked': p.get('dateChecked')})
        for e in (p.get('eras') or []):
            T['person_eras'].append({'person_id': pid, 'era_id': use_era(lg, e)})
        for kind, src in (('career', p.get('career')), ('peak', p.get('peak')), ('high', p.get('highs'))):
            if not src:
                continue
            # league_id matters here too: Walton's college and NBA careers are
            # different numbers, and without it they would be indistinguishable
            row = {'person_id': pid, 'kind': kind, 'league_id': lg, 'era_id': None,
                   'season': src.get('season'),
                   'covers': p.get('covers') if kind == 'career' else None}
            for k in ('ppg', 'rpg', 'apg', 'spg', 'bpg', 'fg_pct', 'ft_pct', 'fg3_pct', 'g', 'pts'):
                row[k] = src.get(k)
            T['person_stats'].append(row)

    T['people'] = list(people.values())
    T['teams'] = list(teams.values())

    # ---- facts
    for i, q in enumerate(facts):
        fid = 'f-%04d-%s' % (i + 1, slug(q['q'])[:52])
        lg = q.get('l') or 'any'
        universal = (lg == 'any')
        T['facts'].append({
            'fact_id': fid, 'difficulty': q['t'], 'question': q['q'],
            'choices': q['c'], 'answer': q['a'],
            'category': q.get('cat'),          # UNTOUCHED -- separate conversation
            'universal': universal,
            'goes_stale': bool(q.get('v')),
            'off_court': bool(q.get('off')),
            # D14. A fact whose only source is a label that points nowhere is
            # low confidence BY CONSTRUCTION -- that is the honest reading of
            # 87% of the bank, not a judgement call.
            'confidence': None, 'date_checked': None,
        })
        if not universal:
            T['fact_leagues'].append({'fact_id': fid, 'league_id': lg})
        for e in (q.get('e') or []):
            T['fact_eras'].append({'fact_id': fid,
                                   'era_id': use_era(None if universal else lg, e)})
        for pid in (q.get('p') or []):
            T['fact_people'].append({'fact_id': fid, 'person_id': pid})
        if q.get('src'):
            T['fact_sources'].append({'fact_id': fid, 'source_id': use_source(q['src'], 'fact')})

    # confidence on facts: low when every source it cites has no url
    by_fact = collections.defaultdict(list)
    for r in T['fact_sources']:
        by_fact[r['fact_id']].append(r['source_id'])
    for f in T['facts']:
        sids = by_fact.get(f['fact_id'], [])
        if sids and all(sources[s]['url'] is None for s in sids):
            f['confidence'] = 'low'
        elif sids:
            f['confidence'] = 'medium'

    T['sources'] = list(sources.values())
    T['eras'] = sorted(eras.values(), key=lambda r: (r['league_id'] or '', r['decade']))
    return T

ORDER = ['leagues', 'eras', 'people', 'facts', 'sources', 'teams', 'packs',
         'person_leagues', 'person_eras', 'person_positions', 'person_quality',
         'person_teams', 'person_sources', 'fact_leagues', 'fact_eras',
         'fact_people', 'fact_sources', 'person_stats', 'person_awards',
         'person_award_years', 'person_notes']

def main():
    T = build()
    check = '--check' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    print(f"{'table':22}{'rows':>7}")
    drift = 0
    for name in ORDER:
        rows = T.get(name, [])
        path = os.path.join(OUT, name + '.json')
        blob = json.dumps(rows, ensure_ascii=False, indent=1)
        if check:
            old = open(path).read() if os.path.exists(path) else None
            if old != blob:
                drift += 1
                print(f"  {name:20}{len(rows):>7}   DRIFT")
                continue
        else:
            open(path, 'w').write(blob)
        print(f"  {name:20}{len(rows):>7}")
    print(f"\n{sum(len(T.get(n,[])) for n in ORDER)} rows across {len(ORDER)} tables -> {OUT}")
    if check:
        print('CHECK: ' + ('%d table(s) differ from disk' % drift if drift else 'disk matches a fresh build'))
        return 1 if drift else 0
    return 0

if __name__ == '__main__':
    sys.exit(main())

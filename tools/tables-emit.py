#!/usr/bin/env python3
"""Generate the game's data files FROM the tables (TABLES.md 6, step 2).

After this, the tables are the source of truth and players.json / players.js /
questions.js are BUILD OUTPUT. The game is not touched and does not know
anything changed -- which is the point: the restructure must provably alter no
gameplay.

  python3 tools/tables-emit.py           write the files
  python3 tools/tables-emit.py --check   emit into memory and prove the result
                                         is the SAME DATA the game reads today

On --check we compare PARSED VALUES, not bytes. players.json currently has 69
different field orders across 744 records -- whatever order each record happened
to be written in -- so byte equality would mean preserving an accident. We emit
one consistent order instead and prove the game cannot tell the difference.
"""
import json, os, re, subprocess, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
JSON_PATH = os.path.join(ROOT, 'docs/play/data/players.json')
JS_PATH = os.path.join(ROOT, 'docs/play/players.js')
Q_PATH = os.path.join(ROOT, 'docs/play/questions.js')

def load():
    return {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D) if f.endswith('.json')}

# player record field order. Canonical, not inherited -- see the docstring.
P_ORDER = ['playerId', 'name', 'aka', 'league', 'eras', 'pos', 'tier', 'num', 'teams',
           'career', 'peak', 'highs', 'accolades', 'covers', 'statSource', 'sources',
           'confidence', 'dateChecked']
STATKEYS = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'fg_pct', 'ft_pct', 'fg3_pct', 'g', 'pts']

def build_players(T):
    """One record per (person, league) -- exactly what person_leagues holds."""
    person = {r['person_id']: r for r in T['people']}
    by = lambda t, k: collections.defaultdict(list, {kk: list(v) for kk, v in
         collections.groupby(sorted(T[t], key=lambda r: r[k]), key=lambda r: r[k])})
    eras = collections.defaultdict(list)
    for r in T['person_eras']:
        eras[r['person_id']].append(r['era_id'])
    pos = {(r['person_id'], r['league_id']): r['position'] for r in T['person_positions']}
    qual = {(r['person_id'], r['league_id']): r['quality'] for r in T['person_quality']}
    teamname = {r['team_id']: r['name'] for r in T['teams']}
    teams = collections.defaultdict(list)
    for r in T['person_teams']:
        teams[(r['person_id'], r['league_id'])].append(teamname[r['team_id']])
    src = {r['source_id']: r for r in T['sources']}
    statsrc, suppsrc = {}, collections.defaultdict(list)
    for r in T['person_sources']:
        s = src[r['source_id']]
        url = s['url'] or s['title']
        if r['role'] == 'stat':
            statsrc[(r['person_id'], r['league_id'])] = url
        else:
            suppsrc[(r['person_id'], r['league_id'])].append(url)
    stats = collections.defaultdict(dict)
    for r in T['person_stats']:
        stats[(r['person_id'], r['league_id'])][r['kind']] = r
    # accolades come back verbatim and in their original order -- `text` and
    # `ord` exist for exactly this
    acc = collections.defaultdict(list)
    for r in T['person_awards']:
        acc[(r['person_id'], r['league_id'])].append((r['ord'], r['text']))
    for r in T['person_notes']:
        acc[(r['person_id'], r['league_id'])].append((r['ord'], r['text']))

    out = []
    for pl in T['person_leagues']:
        pid, lg = pl['person_id'], pl['league_id']
        p = person[pid]
        rec = {'playerId': pid, 'name': p['name'], 'league': lg}
        if p.get('also_known_as'):
            rec['aka'] = p['also_known_as']
        mine = [e for e in eras[pid] if e.startswith(lg + '-')]
        rec['eras'] = [e.split('-', 1)[1] for e in mine]
        rec['pos'] = pos.get((pid, lg))
        rec['tier'] = qual.get((pid, lg))
        if pl.get('jersey') is not None:
            rec['num'] = pl['jersey']
        if teams[(pid, lg)]:
            rec['teams'] = teams[(pid, lg)]
        st = stats.get((pid, lg), {})
        for kind, key in (('career', 'career'), ('peak', 'peak'), ('high', 'highs')):
            r = st.get(kind)
            if not r:
                continue
            blob = {}
            if kind == 'peak' and r.get('season'):
                blob['season'] = r['season']
            for k in STATKEYS:
                if r.get(k) is not None:
                    blob[k] = r[k]
            if blob:
                rec[key] = blob
        a = acc.get((pid, lg), [])
        if a:
            rec['accolades'] = [t for _, t in sorted(a)]
        c = st.get('career') or {}
        if c.get('covers'):
            rec['covers'] = c['covers']
        if statsrc.get((pid, lg)):
            rec['statSource'] = statsrc[(pid, lg)]
        if suppsrc.get((pid, lg)):
            rec['sources'] = suppsrc[(pid, lg)]
        if pl.get('confidence'):
            rec['confidence'] = pl['confidence']
        if pl.get('date_checked'):
            rec['dateChecked'] = pl['date_checked']
        out.append({k: rec[k] for k in P_ORDER if k in rec})
    return out

def render_award(r, years):
    """Rebuild the human string an award came from."""
    s = ('%dx %s' % (r['times_won'], r['award'])) if r['times_won'] > 1 else r['award']
    if years:
        ys = sorted(years)
        runs, i = [], 0
        while i < len(ys):
            j = i
            while j + 1 < len(ys) and ys[j + 1] == ys[j] + 1:
                j += 1
            runs.append(str(ys[i]) if i == j else '%d-%s' % (ys[i], str(ys[j])[2:]))
            i = j + 1
        s += ' (%s)' % ', '.join(runs)
    return s

Q_ORDER = ['t', 'l', 'cat', 'q', 'c', 'a', 'v', 'src', 'e', 'p', 'off']

def build_questions(T):
    lg = collections.defaultdict(list)
    for r in T['fact_leagues']:
        lg[r['fact_id']].append(r['league_id'])
    er = collections.defaultdict(list)
    for r in T['fact_eras']:
        er[r['fact_id']].append(r['era_id'])
    pe = collections.defaultdict(list)
    for r in T['fact_people']:
        pe[r['fact_id']].append(r['person_id'])
    src = {r['source_id']: r for r in T['sources']}
    fs = collections.defaultdict(list)
    for r in T['fact_sources']:
        s = src[r['source_id']]
        fs[r['fact_id']].append(s['url'] or s['title'])

    out = []
    for f in T['facts']:
        fid = f['fact_id']
        rec = {'t': f['difficulty'],
               # D8 allows several leagues; the LEGACY file has one box, so the
               # emitter writes the first.
               #
               # ⚠️ THIS IS LOSSY AND THE COMMENT HERE USED TO DENY IT. It said
               # "nothing has multiple yet, so this is lossless today". Measured
               # 2026-08-04 after Aaron asked whether a card can carry two
               # leagues: SIXTY facts already do, every one of them
               # flags+overseas, and the second tag has been dropped on every
               # build since. Nothing broke loudly because both of those leagues
               # are out of V0 scope, which is exactly how a comment like this
               # survives being wrong.
               # The daily is unaffected TODAY (measured: 0 facts where an
               # nba/wnba tag is not first), but the structure is a live bug.
               # Filed as TABLES.md -> "one card, many leagues".
               'l': (lg[fid][0] if lg[fid] else 'any'),
               'cat': f['category'], 'q': f['question'], 'c': f['choices'], 'a': f['answer']}
        if f['goes_stale']:
            rec['v'] = 1
        if fs[fid]:
            rec['src'] = fs[fid][0]
        if er[fid]:
            rec['e'] = [e.split('-', 1)[1] if '-' in e else e for e in er[fid]]
        if pe[fid]:
            rec['p'] = pe[fid]
        if f['off_court']:
            rec['off'] = 1
        out.append({k: rec[k] for k in Q_ORDER if k in rec})
    return out

def js_card(c):
    bits = []
    for k in Q_ORDER:
        if k not in c:
            continue
        v = c[k]
        if k == 'c':
            bits.append('c:[' + ', '.join(json.dumps(x, ensure_ascii=False) for x in v) + ']')
        elif isinstance(v, list):
            bits.append(k + ':[' + ','.join(json.dumps(x, ensure_ascii=False) for x in v) + ']')
        elif isinstance(v, str):
            bits.append(k + ':' + json.dumps(v, ensure_ascii=False))
        else:
            bits.append(k + ':' + json.dumps(v))
    return '  {' + ','.join(bits) + '}'

GAME = os.path.join(ROOT, 'docs/play/game.js')

def emit_game_leagues(T, js):
    """Rewrite game.js's THREE league lists from the leagues table.

    Those lists -- LG_LEAGUES (the picker), MODES (how it plays), PACKS (what
    you can bolt on) -- are the same four-lists-that-disagree problem TABLES.md
    was written to kill, and leaving them hand-maintained would let a FIFTH copy
    drift from the table. They are generated now, so the table is the only place
    a league is defined.

    Only the three blocks are touched; everything else in game.js is untouched
    byte for byte. MODE geometry (cols/rows/starts) is keyed off `plays` because
    that is what it describes.
    """
    L = T['leagues']
    SHAPE = {
      '5v5-full': ("cols:15,rows:8,half:false", "['PG','SG','SF','PF','C']",
                   "[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]"),
      '3v3-half': ("cols:8,rows:7,half:true", "['PG','SF','C']",
                   "[[[2,3],[1,1],[1,5]],[[4,3],[5,1],[5,5]]]"),
      '4v4-full': ("cols:15,rows:8,half:false", "['PG','SG','SF','C']",
                   "[[[5,4],[4,1],[4,6],[6,3]],[[9,3],[10,6],[10,1],[8,3]]]"),
    }
    # MODES: one entry per league, using its FIRST play shape. A league with
    # several shapes (Street) picks at setup; that selector is not built yet, so
    # the first is the default and the others are declared in the table.
    modes = []
    for r in L:
        shape = r['plays'][0]
        if shape not in SHAPE:
            continue
        geo, lineup, starts = SHAPE[shape]
        modes.append("  %s:{%s,label:%s,lineup:%s,\n    starts:%s}"
                     % (r['league_id'], geo, json.dumps(r['name'].upper()), lineup, starts))
    modes_js = 'var MODES={\n' + ',\n'.join(modes) + '\n};'

    BALL = {'nba':'classic','wnba':'oatmeal','big3':'aba','flags':'molten',
            'overseas':'molten','college':'classic','gleague':'classic',
            'street':'street','fives':'classic','fiba3x3':'aba','wheelchair':'classic'}
    rolo = []
    for r in L:
        if r['status'] == 'hidden':
            continue                       # hidden = not offered, per 22v
        bits = ["id:'%s'" % r['league_id'], "name:'%s'" % r['name'].replace("'", "\\'"),
                "fmt:'%s'" % r['tagline'].replace("'", "\\'"),
                'graf:"%s"' % r['slam'],
                "ball:'%s'" % (r['ball'] or BALL.get(r['league_id'], 'classic')),
                "rc:'%s'" % (r['colour'] or '#f5872e'),
                # the picker uses a two-stop gradient; both stops live in the
                # table so a colour change is a data edit, not a code edit
                "gr:'%s'" % (r.get('colour_hi') or r['colour'] or '#ffa14e')]
        if r['status'] == 'live':
            bits.append("play:'%s'" % r['league_id'])
        else:
            bits.append('lock:1')
        rolo.append('  {' + ', '.join(bits) + '}')
    rolo_js = ('/* GENERATED from docs/play/data/tables/leagues.json by\n'
               '   tools/tables-emit.py. Do not hand-edit: the table is the only\n'
               '   place a league is defined (TABLES.md). */\nvar LG_LEAGUES=[\n'
               + ',\n'.join(rolo) + '\n];')

    packs = ["  {id:'%s', nm:'%s', rc:'%s'}" % (r['league_id'], r['name'],
             r['colour'] or '#f5872e') for r in L if r['status'] != 'hidden']
    packs_js = 'var PACKS=[\n' + ',\n'.join(packs) + '\n];'

    for pat, repl in ((r'var MODES=\{.*?\n\};', modes_js),
                      (r'(/\* GENERATED from[^*]*\*/\n)?var LG_LEAGUES=\[.*?\n\];', rolo_js),
                      (r'var PACKS=\[.*?\n\];', packs_js)):
        js, n = re.subn(pat, lambda m: repl, js, count=1, flags=re.S)
        if n != 1:
            raise SystemExit('could not locate a league block in game.js: ' + pat[:24])
    return js

def header(path, marker):
    """Keep the existing hand-written header comment -- it carries real
    documentation (the t: scale, the 'fives' naming note) that is not ours."""
    s = open(path).read()
    return s[:s.index(marker)]

def main():
    T = load()
    players = build_players(T)
    questions = build_questions(T)
    pj = json.dumps(players, ensure_ascii=False, indent=1)
    pjs = header(JS_PATH, 'const PLAYERDB=') + 'const PLAYERDB=' + \
          json.dumps(players, ensure_ascii=False, separators=(', ', ': ')) + ';\n'
    qjs = header(Q_PATH, 'const QUESTIONS = [') + 'const QUESTIONS = [\n' + \
          ',\n'.join(js_card(c) for c in questions) + '\n];\n'

    game_old = open(GAME).read()
    game_new = emit_game_leagues(T, game_old)

    if '--check' not in sys.argv:
        open(JSON_PATH, 'w').write(pj)
        open(JS_PATH, 'w').write(pjs)
        open(Q_PATH, 'w').write(qjs)
        if game_new != game_old:
            open(GAME, 'w').write(game_new)
        print('wrote players.json, players.js, questions.js'
              + (', and game.js league blocks' if game_new != game_old else '')
              + ' from the tables')
        return 0

    # --- prove the game sees identical data -------------------------------
    fails = []
    old_p = json.load(open(JSON_PATH))
    norm = lambda r: {k: v for k, v in sorted(r.items())}
    a = sorted(map(norm, old_p), key=lambda r: (r['playerId'], r['league']))
    b = sorted(map(norm, players), key=lambda r: (r['playerId'], r['league']))
    print(f'players: {len(a)} on disk vs {len(b)} rebuilt')
    if len(a) != len(b):
        fails.append('player count')
    # ONE named, justified exception -- NOT a general tolerance. Any field not
    # on this list differing is still a failure.
    #   aka: a fact about a PERSON. The legacy file happened to write it onto
    #   only one record of a two-record person (Redick's college row, Tatum's
    #   fives row). Emitting it on both is more correct, and the game reads
    #   `aka` exactly zero times -- verified by grep over game.js and players.js.
    ALLOWED = {'aka'}
    diff, expected = [], []
    for x, y in zip(a, b):
        if x == y:
            continue
        keys = {k for k in set(x) | set(y) if x.get(k) != y.get(k)}
        (expected if keys <= ALLOWED else diff).append((x, y, keys))
    print(f'  records that differ: {len(diff)}')
    for x, y, keys in diff[:4]:
        for k in sorted(keys):
            print(f'    {x["playerId"]}/{x["league"]}  {k}:\n       disk={x.get(k)!r}\n        new={y.get(k)!r}')
    if expected:
        print(f'  differing ONLY by {sorted(ALLOWED)} -- expected, see comment: '
              + ', '.join(f'{x["playerId"]}/{x["league"]}' for x, _, _ in expected))
    if diff:
        fails.append('player records')

    tmp = os.path.join(D, '.q.tmp.js')
    open(tmp, 'w').write(qjs)
    out = os.path.join(D, '.q.tmp.json')
    subprocess.run(['node', '-e',
        "const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);"
        "vm.runInContext(fs.readFileSync(%r,'utf8')+'\\n;this.__Q=QUESTIONS;',c);"
        "fs.writeFileSync(%r,JSON.stringify(c.__Q));" % (tmp, out)], check=True, cwd=ROOT)
    newq = json.load(open(out))
    os.remove(tmp); os.remove(out)
    oldq_file = os.path.join(D, '.qold.json')
    subprocess.run(['node', '-e',
        "const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);"
        "vm.runInContext(fs.readFileSync(%r,'utf8')+'\\n;this.__Q=QUESTIONS;',c);"
        "fs.writeFileSync(%r,JSON.stringify(c.__Q));" % (Q_PATH, oldq_file)], check=True, cwd=ROOT)
    oldq = json.load(open(oldq_file)); os.remove(oldq_file)
    print(f'questions: {len(oldq)} on disk vs {len(newq)} rebuilt')
    qdiff = [(x, y) for x, y in zip(oldq, newq) if x != y]
    print(f'  cards that differ: {len(qdiff)}')
    for x, y in qdiff[:4]:
        keys = {k for k in set(x) | set(y) if x.get(k) != y.get(k)}
        for k in sorted(keys):
            print(f'    {x["q"][:46]!r}  {k}:\n       disk={x.get(k)!r}\n        new={y.get(k)!r}')
    if qdiff or len(oldq) != len(newq):
        fails.append('question cards')

    print('\n' + ('FAILING: ' + ', '.join(fails) if fails else
                  'IDENTICAL -- the game cannot tell the tables replaced the files'))
    return 1 if fails else 0

if __name__ == '__main__':
    sys.exit(main())

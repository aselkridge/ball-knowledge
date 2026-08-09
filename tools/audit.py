#!/usr/bin/env python3
"""The data-integrity gate. Skills advise; THIS enforces.

Measures the shipped bank + player DB against the standard in
DEEPRESEARCH_KNOWLEDGE.md and compares every metric to tools/audit-baseline.json.
The baseline is a RATCHET: the script fails if any metric got WORSE than the
recorded debt, and the baseline only moves down (via --update-baseline after a
pass that fixed things). Existing debt doesn't fail the gate; NEW debt does.

Usage:
  python3 tools/audit.py                  # report + gate (exit 1 on regression)
  python3 tools/audit.py --update-baseline  # ratchet after a fixing pass
"""
import re, json, sys, glob, collections, os, subprocess, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = os.path.join(ROOT, 'docs/play/questions.js')
PLAYERS = os.path.join(ROOT, 'docs/play/data/players.json')
DATA = os.path.join(ROOT, 'docs/play/data')
BASELINE = os.path.join(ROOT, 'tools/audit-baseline.json')

def parse_cards():
    s = open(BANK).read()
    cards = [c for c in re.findall(r'\{[^{}]*?\bt\s*:\s*\d.*?\}', s, re.S)
             if re.search(r'\bq\s*:', c)]
    return cards

def collect_corpus_ids():
    ids = set()
    def walk(o):
        if isinstance(o, dict):
            if 'id' in o and isinstance(o['id'], str):
                ids.add(o['id'])
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    for f in glob.glob(os.path.join(DATA, 'research-*.json')):
        try: walk(json.load(open(f)))
        except Exception as e: print(f"  ! unreadable corpus {f}: {e}")
    return ids

def measure():
    m = {}
    cards = parse_cards()
    m['cards_total'] = len(cards)
    m['cards_unsourced'] = sum(1 for c in cards if not re.search(r'src(Id)?\s*:', c))
    vol = [c for c in cards if re.search(r'\bv\s*:\s*1\b', c)]
    m['volatile_total'] = len(vol)
    m['volatile_t1'] = sum(1 for c in vol if re.search(r'\bt\s*:\s*1\b', c))
    # every card must offer exactly 4 choices
    bad = 0
    for c in cards:
        arr = re.search(r'\bc\s*:\s*\[(.*?)\]', c, re.S)
        if not arr or len(re.findall(r'"(?:[^"\\]|\\.)*"', arr.group(1))) != 4:
            bad += 1
    m['cards_bad_choices'] = bad
    # srcId chains must resolve to a corpus fact
    ids = collect_corpus_ids()
    refs = set()
    for c in cards:
        r = re.search(r'src(?:Id)?\s*:\s*"([^"]+)"', c)
        if r and not r.group(1).startswith('http'): refs.add(r.group(1))
    m['srcids_referenced'] = len(refs)
    m['srcids_unresolved'] = len([r for r in refs if r not in ids])

    raw = json.load(open(PLAYERS))
    pl = raw if isinstance(raw, list) else raw.get('players', [])
    pl = [p for p in pl if isinstance(p, dict)]
    m['players_total'] = len(pl)
    m['players_no_statsource'] = sum(1 for p in pl if not p.get('statSource'))
    TIER3 = ('wikipedia', 'landofbasketball', 'lwosports')
    # the standard permits Tier-3 best-available WHEN confidence is recorded
    # (street/fives/pre-1950: no Tier-1 exists) — only unflagged Tier-3 is debt
    m['players_tier3_source'] = sum(1 for p in pl
        if any(t in (p.get('statSource') or '').lower() for t in TIER3)
        and not p.get('confidence'))
    tiers = collections.Counter(p.get('tier') for p in pl)
    m['superstar_count'] = tiers.get('superstar', 0)
    # guardrail: superstars must be the SMALLEST tier (pack rarity economy)
    m['superstar_not_smallest'] = int(tiers.get('superstar', 0) > min(
        v for k, v in tiers.items() if k and k != 'superstar'))
    m['bpg_missing'] = sum(1 for p in pl
        if not (p.get('career') or {}).get('bpg'))

    # --- cross-league integrity (backlog P9, LEARNINGS #18-19) ---------------
    # A person may legitimately hold several records (one per league they
    # played in). The key is the raw `name` string, so variant spellings
    # SPLIT one person into two people the engine can't reconcile — it would
    # deal both onto the same squad. Normalise, then look for collisions that
    # the exact-name key misses.
    def norm(n):
        n = re.sub(r'\([^)]*\)', ' ', n)                 # trailing aliases
        n = re.sub(r'"[^"]*"|\'[^\']*\'|[‘’“”]', ' ', n)  # quoted nicknames
        n = re.sub(r'[^a-z ]', ' ', n.lower())           # punctuation -> space
        toks = n.split()
        # join runs of single letters so "J.J." == "JJ" and "A.C." == "AC"
        out = []
        for t in toks:
            if len(t) == 1 and out and len(out[-1]) <= 2 and out[-1].isalpha() \
               and len(out[-1]) < 3 and out[-1] == out[-1]:
                out[-1] += t
            else:
                out.append(t)
        return ' '.join(out)
    # people whose records disagree on spelling: same normalised name, >1 raw form.
    # This catches only MECHANICAL splits (punctuation, initials, nickname quotes).
    forms = collections.defaultdict(set)
    for p in pl:
        forms[norm(p['name'])].add(p['name'])
    m['players_dupe_name'] = sum(len(v) - 1 for v in forms.values() if len(v) > 1)
    # Splits that no normaliser can see (a nickname-only record vs a legal-name
    # record) live in a curated file — fuzzy matching them would falsely merge
    # real distinct people (Chuck Cooper vs Charles 'Tarzan' Cooper are two men).
    known = os.path.join(DATA, 'known-duplicate-people.json')
    unresolved = 0
    if os.path.exists(known):
        raw_names = set(p['name'] for p in pl)
        for pair in json.load(open(known)).get('pairs', []):
            if len([n for n in pair.get('names', []) if n in raw_names]) > 1:
                unresolved += 1
    m['players_dupe_curated'] = unresolved

    # --- the permanent name tag (playerId) must exist and must resolve -------
    m['players_no_pid'] = sum(1 for p in pl if not p.get('playerId'))
    # two DIFFERENT people must never share one tag (same person across leagues
    # sharing a tag is correct and expected — that is the whole design)
    bypid = collections.defaultdict(set)
    for p in pl:
        if p.get('playerId'): bypid[p['playerId']].add(p.get('name'))
    m['pid_collisions'] = sum(1 for v in bypid.values() if len(v) > 1)
    # every player tag on a question card must point at a real player
    bank = open(BANK).read()
    tags = set()
    for mm in re.findall(r'\bp:\[([^\]]*)\]', bank):
        tags |= set(re.findall(r'"([^"]+)"', mm))
    m['ptags_unresolved'] = len(tags - set(bypid))
    # the two copies of the player database must agree — the game loads the .js,
    # every tool reads the .json, and nothing checked they matched
    try:
        js = open(os.path.join(ROOT, 'docs/play/players.js')).read()
        mj = re.search(r'const PLAYERDB=(\[.*\]);?\s*$', js, re.S)
        mirror = json.loads(mj.group(1)) if mj else []
        key = lambda r: (r.get('playerId') or r.get('name'), r.get('league'))
        a = {key(r): r for r in pl}
        b = {key(r): r for r in mirror}
        m['players_mirror_drift'] = len(set(a) ^ set(b)) + sum(
            1 for k in (set(a) & set(b)) if a[k] != b[k])
    except Exception:
        m['players_mirror_drift'] = 9999   # unreadable mirror is maximum debt

    # a record that says "NBA"/"WNBA" in its own prose describes a career in a
    # league where the game claims the person doesn't exist. Objective FLOOR on
    # the missing-companion-record debt (the true number is higher — e.g. every
    # BIG3 player is an NBA alum whether the blurb says so or not).
    have = collections.defaultdict(set)
    for p in pl:
        have[norm(p['name'])].add(p.get('league'))
    def prose(p):
        return ' '.join((p.get('accolades') or []) + (p.get('teams') or [])
                        + [p.get('covers') or ''])
    missing = 0
    for p in pl:
        lgs, txt = have[norm(p['name'])], prose(p)
        if re.search(r'\bNBA\b|\bBAA\b', txt) and 'nba' not in lgs:
            missing += 1
        elif re.search(r'\bWNBA\b', txt) and 'wnba' not in lgs:
            missing += 1
    m['players_missing_companion'] = missing

    # every league offered in the UI must have data, and every league with data
    # must be offered — the vocabularies drifted apart once already (P10).
    # NOTE these compare LG_LEAGUES (which leagues you can PLAY) against the
    # player DB. PACKS is a THIRD registry governing which questions you can be
    # ASKED, and it is deliberately wider — `fives` is a pack with no league
    # card, so its questions are reachable while its 20 players are not.
    gj = open(os.path.join(ROOT, 'docs/play/game.js')).read()
    blk = re.search(r'var LG_LEAGUES\s*=\s*\[(.*?)\n\];', gj, re.S)
    ui = set(re.findall(r"\{id:'(\w+)'", blk.group(1) if blk else ''))
    data_lgs = set(p.get('league') for p in pl) - {None}
    m['leagues_orphaned'] = len(data_lgs - ui)       # data no player can reach
    m['leagues_empty'] = len(ui - data_lgs)          # a card with nothing behind it

    # --- the tables (D10) --------------------------------------------------
    # The tables are the SOURCE now and the three game files are build output,
    # so three separate things can rot and each gets its own metric:
    #   1. a link pointing at a row that isn't there
    #   2. the tables on disk no longer being what the builder produces
    #   3. the game's files no longer being what the tables produce
    # Without (2) and (3) someone edits players.json by hand, the game works
    # fine, and the next table build silently reverts them.
    TD = os.path.join(ROOT, 'docs/play/data/tables')
    try:
        T = {f[:-5]: json.load(open(os.path.join(TD, f)))
             for f in os.listdir(TD) if f.endswith('.json')}
        ids = {'people': {r['person_id'] for r in T['people']},
               'leagues': {r['league_id'] for r in T['leagues']},
               'eras': {r['era_id'] for r in T['eras']},
               'facts': {r['fact_id'] for r in T['facts']},
               'sources': {r['source_id'] for r in T['sources']},
               'teams': {r['team_id'] for r in T['teams']},
               'awards': {r['award_row'] for r in T['person_awards']}}
        LINKS = [('person_leagues','person_id','people'),('person_leagues','league_id','leagues'),
                 ('person_eras','person_id','people'),('person_eras','era_id','eras'),
                 ('person_positions','person_id','people'),('person_positions','league_id','leagues'),
                 ('person_quality','person_id','people'),('person_quality','league_id','leagues'),
                 ('person_teams','person_id','people'),('person_teams','team_id','teams'),
                 ('person_sources','person_id','people'),('person_sources','source_id','sources'),
                 ('person_stats','person_id','people'),('person_stats','league_id','leagues'),
                 ('person_awards','person_id','people'),('person_awards','league_id','leagues'),
                 ('person_award_years','award_row','awards'),('person_notes','person_id','people'),
                 ('fact_leagues','fact_id','facts'),('fact_leagues','league_id','leagues'),
                 ('fact_eras','fact_id','facts'),('fact_eras','era_id','eras'),
                 ('fact_people','fact_id','facts'),('fact_people','person_id','people'),
                 ('fact_sources','fact_id','facts'),('fact_sources','source_id','sources')]
        m['tables_link_unresolved'] = sum(
            len({r[c] for r in T[t] if r.get(c) is not None and r[c] not in ids[g]})
            for t, c, g in LINKS)
        cited = {r['source_id'] for r in T['fact_sources']} | {r['source_id'] for r in T['person_sources']}
        # A SOURCE MARKED DEAD IS KEPT ON PURPOSE, so it is not an orphan.
        # 2026-08-04: Diana Taurasi's cited url had a typo (taurasdi01w for
        # tauradi01w) and 404s. Two cards stopped citing it, which is the right
        # thing -- a card pointing at a dead page LOOKS sourced -- and the row
        # itself stays, because quarantine-never-delete applies to sources too
        # and the record that we once cited it is worth more than the row costs.
        # Without this exemption doing the right thing failed the gate, which is
        # how a ratchet teaches people to route around it.
        dead = {s['source_id'] for s in T['sources']
                if str(s.get('title') or '').startswith('DEAD LINK')}
        m['tables_orphans'] = (len(ids['people'] - {r['person_id'] for r in T['person_leagues']})
                               + len(ids['sources'] - cited - dead))
        m['sources_dead'] = len(dead)
        # R0: the V0 work still outstanding, per RUN, straight off the todo table.
        # These are the numbers that have to reach zero before V0 ships. Ratcheted
        # like everything else, so they can only ever go DOWN -- which makes the
        # release measurable instead of a feeling.
        todo = json.load(open(os.path.join(ROOT, 'docs/play/data/tables/todo.json')))
        for run in ('R1', 'R2', 'R3', 'R5', 'R6', 'R7', 'R8'):
            m['todo_' + run.lower()] = sum(1 for r in todo if r['run'] == run)
        m['todo_open'] = len(todo)
    except Exception:
        m['tables_link_unresolved'] = 9999
        m['tables_orphans'] = 9999
    # ONLY the tables -> game-files direction is gated. The reverse
    # (tables-build.py --check, old files -> tables) is deliberately NOT a
    # metric: tables-build.py reads players.json, which is now OUTPUT, so
    # gating on it would fail the moment someone edits a table -- punishing
    # exactly the behaviour the restructure exists to enable. It is a one-time
    # migration, not a repeatable build.
    try:
        r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'tables-emit.py'), '--check'],
                           capture_output=True, text=True, cwd=ROOT)
        m['emit_drift'] = 0 if r.returncode == 0 else 1
    except Exception:
        m['emit_drift'] = 9999

    # THE GATE'S OWN INDEX GOES STALE EVERY TIME A FACT IS VERIFIED.
    # docs/play/unverified-index.js is what PACKGATE actually reads at runtime,
    # and it is generated. Nothing regenerated it: build-verified-index.py was
    # in no pipeline, no skill and no other tool -- verify-batch.py's own "NOW
    # RUN" line named four scripts and not this one. So a session could verify
    # 135 facts, watch the whole pipeline pass, and leave the gate excluding
    # cards it had just proven. Caught by a stop hook noticing a dirty file,
    # which is not a control.
    # Ratcheted at 0: a stale index is always wrong and there is no old debt to
    # grandfather, because the file is generated in full every run.
    try:
        p = os.path.join(ROOT, 'docs/play/unverified-index.js')
        before = open(p, encoding='utf-8').read()
        subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build-verified-index.py')],
                       capture_output=True, text=True, cwd=ROOT)
        after = open(p, encoding='utf-8').read()
        if before != after:
            open(p, 'w', encoding='utf-8').write(before)   # audit MEASURES, never edits
        # the header carries a build date, so compare the card list, not the bytes
        cards = lambda s: re.findall(r'(?m)^".*?":1,$', s)
        m['verified_index_drift'] = 0 if cards(before) == cards(after) else 1
    except Exception:
        m['verified_index_drift'] = 9999

    # EVERY GENERIC PLAYER IS "HE", IN A GAME WITH A WNBA MODE.
    # Aaron spotted this in a playthrough on 2026-08-04 and thought it was in the
    # question bank. It was not — measured, every he/him/his in `facts` refers to
    # a specific man, which is correct. It was in the GAME'S OWN VOICE: "Move him",
    # "Shake him", "he breaks free", and thirteen more in the Rulebook explaining
    # what a defender does. Twenty in total, every one about a piece on the board
    # that is a woman half the time.
    # Ratcheted at 0 because a reminder would not have caught it and did not: the
    # words had been on screen for weeks. Comments are stripped first — this is
    # about what a PLAYER reads, not what a coder reads.
    try:
        pron = re.compile(r'\b(he|him|his|himself)\b')
        n = 0
        for f in ('docs/play/game.js', 'docs/play/daily.js', 'docs/play/index.html'):
            src = open(os.path.join(ROOT, f), encoding='utf-8').read()
            src = re.sub(r'/\*[\s\S]*?\*/', '', src)
            src = re.sub(r'(?m)^\s*//.*$', '', src)
            # HTML comments too. This metric says it measures what a PLAYER
            # reads and it did not: <!-- ... --> was never stripped, so the
            # first HTML comment containing the word "he" pushed a ratcheted
            # metric off 0 and failed the gate for prose no player will ever
            # see. Found on 2026-08-08 by a comment I had written that morning.
            src = re.sub(r'<!--[\s\S]*?-->', '', src)
            n += len(pron.findall(src))
        m['ui_gendered'] = n
    except Exception:
        m['ui_gendered'] = 9999

    # NO EM DASHES. ANYWHERE IN THE GAME.
    # Aaron, 2026-08-08: "please remove all em dashes throughout the game,
    # EVERYWHERE! this is a standard of mine." CLAUDE.md already carried half of
    # this rule for outbound copy; he extended it to the whole product, so it
    # stops being a style note and becomes law.
    # Ratcheted at 0 from a clean sweep: 584 were removed in one pass, 218 from
    # hand-written copy and 366 from the data tables, so there is no old debt to
    # grandfather. Counted over the WHOLE source, comments included, because
    # that is what "EVERYWHERE" says, and over the TABLES rather than the
    # emitted questions.js / players.js, which are build output and would carry
    # a fixed dash right back the next time tables-emit ran.
    # todo.json is excluded: 2,231 of them, and it is the work queue, not the
    # product. tools/emdash.py holds the replacement rules and the reasoning.
    try:
        n = 0
        for f in ('docs/play/game.js', 'docs/play/daily.js', 'docs/play/coach.js',
                  'docs/play/install.js', 'docs/play/audio.js', 'docs/play/index.html',
                  'docs/play/questions.js', 'docs/play/players.js',
                  'server/index.js'):
            n += open(os.path.join(ROOT, f), encoding='utf-8').read().count('\u2014')
        tdir = os.path.join(ROOT, 'docs/play/data/tables')
        for fn in sorted(os.listdir(tdir)):
            if fn.endswith('.json') and fn != 'todo.json':
                n += open(os.path.join(tdir, fn), encoding='utf-8').read().count('\u2014')
        m['em_dashes'] = n
    except Exception:
        m['em_dashes'] = 9999

    # EVERY HTML PAGE NEEDS A HEAD THAT WORKS, INCLUDING THE THROWAWAY ONES.
    # Two lines, both found the same way and both missing from the same seven
    # files: a viewport meta and a charset. The charset half showed up in a
    # screenshot as "BALL KNOWLEDGE Â· 9 AUGUST" -- every middot in the game's
    # own favourite separator turned to mojibake, because a page with no
    # declared encoding is read as windows-1252 and this project writes UTF-8
    # everywhere on purpose.
    # 2026-08-09: Aaron opened the THE PLACES spike on his phone and could not
    # use it. "worked on desktop tho." Measured: with no viewport meta the
    # layout viewport is 980px, so a 390px phone renders the desktop page and
    # scales it by 0.398. The 44px hotspot rings landed at 17.5px on glass, a
    # quarter of the minimum touch target, and pinch-zoom fought the page.
    # Seven files had it missing and every one of them was a dev page or a
    # mockup. Not a coincidence: the shipped pages all had it, because the
    # shipped pages get opened on a phone. A mockup that cannot be opened on a
    # phone cannot be JUDGED on a phone, and most of this game is played on one.
    # Ratcheted at 0 because all seven were fixed in the same commit, so there
    # is no old debt to grandfather.
    try:
        n, seen, nc, seenc = 0, [], 0, []
        for base in ('docs', 'design'):
            for dp, _, fns in os.walk(os.path.join(ROOT, base)):
                for fn in fns:
                    if not fn.endswith('.html'):
                        continue
                    fp = os.path.join(dp, fn)
                    head = open(fp, encoding='utf-8', errors='replace').read(4000)
                    if 'name="viewport"' not in head:
                        n += 1
                        seen.append(os.path.relpath(fp, ROOT))
                    if 'charset' not in head:
                        nc += 1
                        seenc.append(os.path.relpath(fp, ROOT))
        m['pages_no_viewport'] = n
        m['pages_no_charset'] = nc
        if seen:
            print('  pages missing a viewport meta: ' + ', '.join(sorted(seen)))
        if seenc:
            print('  pages missing a charset: ' + ', '.join(sorted(seenc)))
    except Exception:
        m['pages_no_viewport'] = 9999
        m['pages_no_charset'] = 9999

    # A NOTE IS A CLAIM, SO IT NEEDS A SOURCE LIKE ANY OTHER CLAIM.
    # Aaron asked on 2026-08-05 for an occasional "did you know" blurb on cards
    # with an interesting story behind them. Good idea, and the exact shape of
    # thing that invites confident invention: nobody scores a blurb, nobody
    # picks it in a multiple choice, and a wrong one still reads beautifully.
    # So a fact carrying a note must also carry date_checked — meaning somebody
    # opened the page and read it. Ratcheted at 0 from the first note, because
    # there is no old debt here: the field did not exist an hour ago, and a
    # ratchet set while a pile already exists grandfathers the pile forever.
    try:
        facts = json.load(open(os.path.join(
            ROOT, 'docs/play/data/tables/facts.json'), encoding='utf-8'))
        m['notes_unsourced'] = sum(
            1 for f in facts
            if (f.get('note') or '').strip() and not f.get('date_checked'))
    except Exception:
        m['notes_unsourced'] = 9999

    # STALE-ABLE FACTS WHOSE LAST READ HAS EXPIRED.
    # Until 2026-08-06 a goes_stale fact was binned from the verified pack
    # outright, forever, under a message that said "needs a refresh pass" — so
    # the debt was invisible AND unpayable. It is payable now: inside
    # build-verified-index.STALE_WINDOW_DAYS the card ships. The exchange is
    # that somebody has to actually re-read those pages, and a maintenance job
    # nobody counts is a maintenance job nobody does.
    #
    # So this counts the ones that have fallen out: proven cards, held back
    # only because their check has expired. Zero today, because every one of
    # the 38 checks on a stale-able fact is under a week old. When it starts
    # climbing, that is not a bug — it is the bill arriving, and the fix is to
    # re-read the sources (or to reword the card so it can never rot, which is
    # strictly better where the question survives it).
    try:
        # Importing build-verified-index would RUN the whole builder, so the
        # one predicate is re-implemented here — but the window itself is read
        # back out of that file's source, so there is still exactly one place
        # to change 180 and no chance of the two drifting apart.
        _src = open(os.path.join(ROOT, 'tools/build-verified-index.py'),
                    encoding='utf-8').read()
        _win = int(re.search(r'^STALE_WINDOW_DAYS\s*=\s*(\d+)', _src,
                             re.M).group(1))
        _awin = int(re.search(r'^ANCHORED_WINDOW_DAYS\s*=\s*(\d+)', _src,
                              re.M).group(1))
        _today = datetime.date.today()

        def _overdue(f):
            if not f.get('goes_stale'):
                return False
            d = f.get('date_checked')
            if not d:
                return False        # never checked is a DIFFERENT debt, already counted
            try:
                age = (_today - datetime.date.fromisoformat(str(d)[:10])).days
            except ValueError:
                return True
            return age > (_awin if f.get('anchor') else _win)
        m['stale_overdue'] = sum(
            1 for f in facts if f.get('confidence') == 'high' and _overdue(f))
    except Exception:
        m['stale_overdue'] = 9999

    # ANCHORING MUST NOT BECOME A WAY TO ESCAPE REVIEW.
    # Aaron, 2026-08-06: *"these cards should still be getting refreshed
    # regularly because at some point maybe changing the question or tossing it
    # is worth it ... if someone down the line destroys that record, then why
    # would we still ask it that way?"*
    #
    # Exactly right, and it is the obvious way for this to rot. Writing
    # "Through the 2025 season, ..." makes a card permanently TRUE, and the
    # temptation is then to clear goes_stale and never look at it again. It
    # would still be true in 2040 and it would be junk: an old newspaper asking
    # who held a record two people ago.
    #
    # So an anchored card KEEPS the flag and stays in the cycle -- it just gets
    # the longer ANCHORED_WINDOW_DAYS leash, because the question at review time
    # changed from "is this still true?" to "is this still worth asking?".
    # This counts anyone who anchors a card and then quietly drops it out of the
    # review loop. Zero, and it must stay zero.
    try:
        m['anchored_unreviewed'] = sum(
            1 for f in facts
            if str(f.get('anchor') or '').strip() and not f.get('goes_stale'))
    except Exception:
        m['anchored_unreviewed'] = 9999
    return m

# metrics where LOWER is better; anything rising above baseline fails the gate
RATCHET = ['cards_unsourced','volatile_t1','cards_bad_choices','srcids_unresolved',
           'players_no_statsource','players_tier3_source','superstar_not_smallest',
           'bpg_missing','players_dupe_name','players_dupe_curated',
           'players_missing_companion','leagues_orphaned','leagues_empty',
           'players_no_pid','pid_collisions','ptags_unresolved',
           'players_mirror_drift',
           'tables_link_unresolved','tables_orphans','emit_drift',
           'ui_gendered','em_dashes','verified_index_drift','notes_unsourced',
           'stale_overdue','anchored_unreviewed','pages_no_viewport',
           'pages_no_charset']

# A METRIC NOT IN THIS LIST IS NOT GATED, and adding it to measure() alone does
# nothing. 2026-08-04: ui_gendered was written, printed, baselined at 0 — and the
# deliberate sabotage (one "him" put back) still reported PASS, because the name
# was never added here. The measurement was real and the gate was decorative.
# Break every new metric on purpose before believing it bites.

def _gate_covers_every_ratchetable_metric(m):
    """Names in measure() that look like debt but nobody wired to the ratchet."""
    suspect = [k for k in m
               if k not in RATCHET
               and (k.endswith('_missing') or k.endswith('_unresolved')
                    or k.endswith('_drift') or k.startswith('ui_')
                    or k.endswith('_collisions'))]
    return suspect

def main():
    m = measure()
    print("BALL KNOWLEDGE DATA AUDIT")
    for k, v in m.items(): print(f"  {k:24} {v}")
    ungated = _gate_covers_every_ratchetable_metric(m)
    if ungated:
        print("\n  !! MEASURED BUT NOT GATED — add to RATCHET or it is decoration:")
        for k in ungated: print("     ", k)
    if not os.path.exists(BASELINE) or '--update-baseline' in sys.argv:
        json.dump(m, open(BASELINE, 'w'), indent=1)
        print(f"\nbaseline written -> {BASELINE}")
        return 0
    base = json.load(open(BASELINE))
    fails, gains = [], []
    # A RATCHETED METRIC WITH NO BASELINE ENTRY USED TO BE SILENTLY SKIPPED.
    # This is the THIRD time in this repo a metric has measured correctly and
    # failed to bite. First ui_gendered (written and printed, never added to
    # RATCHET). Then verified_index_drift, added to RATCHET, sabotaged, and the
    # gate still said PASS -- because `if k in base` treats an unbaselined
    # metric as nothing to compare against.
    # A metric in RATCHET with no baseline is an UNFINISHED CHANGE, not a
    # passing one, so it fails and names its own fix. First run is unaffected:
    # that path writes the baseline and returns above.
    missing = [k for k in RATCHET if k not in base]
    if missing:
        print("\nGATE FAILED — ratcheted metric with no baseline:")
        for k in missing:
            print(f"  ✗ {k} (now {m.get(k)}) — nothing to compare against")
        print("  A metric in RATCHET but not in the baseline is NOT gated.")
        print("  Fix: get the metric to its intended value, then")
        print("       python3 tools/audit.py --update-baseline")
        return 1
    for k in RATCHET:
        if m[k] > base[k]: fails.append(f"{k}: {base[k]} -> {m[k]}")
        elif m[k] < base[k]: gains.append(f"{k}: {base[k]} -> {m[k]}")
    if gains:
        print("\nIMPROVED (run --update-baseline to ratchet):")
        for g in gains: print("  ✓", g)
    if fails:
        print("\nGATE FAILED — new debt introduced:")
        for f in fails: print("  ✗", f)
        return 1
    print("\ngate: PASS (no metric worse than baseline)")
    return 0

if __name__ == '__main__':
    sys.exit(main())

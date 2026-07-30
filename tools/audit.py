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
import re, json, sys, glob, collections, os

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
    return m

# metrics where LOWER is better; anything rising above baseline fails the gate
RATCHET = ['cards_unsourced','volatile_t1','cards_bad_choices','srcids_unresolved',
           'players_no_statsource','players_tier3_source','superstar_not_smallest',
           'bpg_missing','players_dupe_name','players_dupe_curated',
           'players_missing_companion','leagues_orphaned','leagues_empty',
           'players_no_pid','pid_collisions','ptags_unresolved',
           'players_mirror_drift']

def main():
    m = measure()
    print("BALL KNOWLEDGE DATA AUDIT")
    for k, v in m.items(): print(f"  {k:24} {v}")
    if not os.path.exists(BASELINE) or '--update-baseline' in sys.argv:
        json.dump(m, open(BASELINE, 'w'), indent=1)
        print(f"\nbaseline written -> {BASELINE}")
        return 0
    base = json.load(open(BASELINE))
    fails, gains = [], []
    for k in RATCHET:
        if k in base:
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

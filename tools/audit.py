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
    m['players_tier3_source'] = sum(1 for p in pl
        if any(t in (p.get('statSource') or '').lower() for t in TIER3))
    tiers = collections.Counter(p.get('tier') for p in pl)
    m['superstar_count'] = tiers.get('superstar', 0)
    # guardrail: superstars must be the SMALLEST tier (pack rarity economy)
    m['superstar_not_smallest'] = int(tiers.get('superstar', 0) > min(
        v for k, v in tiers.items() if k and k != 'superstar'))
    m['bpg_missing'] = sum(1 for p in pl
        if not (p.get('career') or {}).get('bpg'))
    return m

# metrics where LOWER is better; anything rising above baseline fails the gate
RATCHET = ['cards_unsourced','volatile_t1','cards_bad_choices','srcids_unresolved',
           'players_no_statsource','players_tier3_source','superstar_not_smallest',
           'bpg_missing']

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

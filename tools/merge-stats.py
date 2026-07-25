#!/usr/bin/env python3
"""Merge the Phase 2.2 stats run into players.json.

DRY RUN BY DEFAULT — writes nothing unless --apply is passed.

Rules:
  * Only fill fields we don't already have, unless --overwrite is given. The run
    also flagged 22 disagreements with stored values; those are REPORTED, never
    silently applied, because the existing number might be the right one.
  * Strip any field the adversarial verifier flagged. Flags name a field
    (career.fg3_pct, peak.ppg, covers); the whole player is kept, the bad field
    is dropped. A missing stat is fine; a wrong one drives bad ratings.
  * found:false players are left completely alone — no stats is the honest state
    for a Rucker Park legend, not a gap to paper over.
  * Sanity gates catch anything the verifier missed: era-impossible stats,
    percentages entered as whole numbers, peaks below career average.
"""
import json, re, sys, collections, os

REPO = '/workspace/ball-knowledge'
APPLY = '--apply' in sys.argv
OVERWRITE = '--overwrite' in sys.argv

db = json.load(open(f'{REPO}/docs/play/data/players.json'))
run = json.load(open(f'{REPO}/docs/play/data/research-run2-stats.json'))
players = {p['name']: p for p in db['players']}
NUM = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'fg_pct', 'ft_pct', 'fg3_pct', 'g', 'pts']

# ---- 1. what the verifier flagged, by player -> set of fields to strip --------
strip = collections.defaultdict(set)
for f in run.get('flagged', []):
    fld = (f.get('field') or '').strip()
    name = f['name']
    for m in re.findall(r'(?:career\.)?(ppg|rpg|apg|spg|bpg|fg_pct|ft_pct|fg3_pct|g|pts)\b', fld):
        strip[name].add(m)
    if 'peak' in fld:   strip[name].add('__peak')
    if 'covers' in fld or 'span' in fld.lower(): strip[name].add('__covers')
    if not fld:         strip[name].add('__all')   # unnamed field -> distrust the lot

# ---- 2. sanity gates the verifier might have missed ---------------------------
def era_end(p):
    """last year the player was active, from eras like ['1960s','1970s']"""
    yrs = []
    for e in (p.get('eras') or []):
        m = re.match(r'(\d{4})s', str(e))
        if m: yrs.append(int(m.group(1)) + 9)
    return max(yrs) if yrs else None

gated = collections.Counter()
def sanity(name, career, peak, p):
    out, notes = {}, []
    end = era_end(p)
    for k, v in (career or {}).items():
        if k not in NUM: continue
        try: v = float(v)
        except (TypeError, ValueError): continue
        if k in strip[name] or '__all' in strip[name]:
            gated['verifier-flagged'] += 1; continue
        # percentages must be decimals
        if k.endswith('_pct'):
            if v > 1.0:
                v = v / 100.0; notes.append(f'{k} was a whole number, converted')
            if not (0 <= v <= 1): gated['pct out of range'] += 1; continue
        # stats that did not exist yet
        if end and end < 1974 and k in ('spg', 'bpg'):
            gated['pre-1974 steals/blocks'] += 1; continue
        if end and end < 1980 and k == 'fg3_pct':
            gated['pre-1980 three-point'] += 1; continue
        # obvious nonsense
        if k in ('ppg', 'rpg', 'apg') and not (0 <= v <= 60): gated['implausible rate'] += 1; continue
        if k in ('spg', 'bpg') and not (0 <= v <= 6):         gated['implausible rate'] += 1; continue
        out[k] = round(v, 3) if k.endswith('_pct') else (int(v) if k in ('g', 'pts') else round(v, 1))
    pk = None
    if peak and '__peak' not in strip[name] and '__all' not in strip[name]:
        pk = dict(peak)
        # a peak season below the career average is impossible
        if pk.get('ppg') is not None and out.get('ppg') is not None:
            if float(pk['ppg']) < float(out['ppg']) - 0.05:
                gated['peak below career'] += 1; pk = None
    return out, pk, notes

# ---- 3. merge ------------------------------------------------------------------
added = conflicts = touched = skipped = 0
conflict_rows, note_rows = [], []
for x in run['players']:
    name = x['name']
    p = players.get(name)
    if not p or not x.get('found') or not x.get('career'):
        skipped += 1; continue
    career, peak, notes = sanity(name, x.get('career'), x.get('peak'), p)
    if not career: skipped += 1; continue
    cur = p.get('career') or {}
    changed = False
    for k, v in career.items():
        if k not in cur:
            cur[k] = v; added += 1; changed = True
        elif abs(float(cur[k]) - float(v)) > 0.05:
            conflicts += 1
            conflict_rows.append((name, k, cur[k], v))
            if OVERWRITE: cur[k] = v; changed = True
    if changed or cur:
        p['career'] = cur
    if peak and 'peak' not in p:
        p['peak'] = peak; changed = True
    if x.get('highs') and 'highs' not in p and '__all' not in strip[name]:
        p['highs'] = x['highs']; changed = True
    if x.get('covers') and '__covers' not in strip[name] and '__all' not in strip[name]:
        p['covers'] = x['covers']
    if x.get('source'): p['statSource'] = x['source']
    for n in notes: note_rows.append((name, n))
    if changed: touched += 1

# ---- 4. report -----------------------------------------------------------------
WANT = NUM
cov = sum(len([k for k in WANT if k in (p.get('career') or {})]) for p in db['players'])
print('STATS MERGE ' + ('(APPLIED)' if APPLY else '(DRY RUN — nothing written)'))
print(f'  players touched        {touched}')
print(f'  stat fields added      +{added}')
print(f'  players skipped        {skipped}  (no verified stats — left alone)')
print(f'  total stat fields now  {cov}')
print()
print('  gated by sanity checks:')
for k, v in gated.most_common(): print(f'    {k:26} {v}')
print()
print(f'  CONFLICTS with existing values: {conflicts}' +
      ('  (APPLIED — overwrite on)' if OVERWRITE else '  (kept existing; rerun with --overwrite to take the run\'s value)'))
for n, k, a, b in conflict_rows[:12]:
    print(f'    {n[:24]:24} {k:8} stored {a}  ->  run {b}')
if len(conflict_rows) > 12: print(f'    … and {len(conflict_rows)-12} more')
if note_rows:
    print()
    print('  auto-corrections:')
    for n, t in note_rows[:8]: print(f'    {n[:24]:24} {t}')

byl = collections.defaultdict(lambda: [0, 0])
for p in db['players']:
    byl[p['league']][0] += 1
    if (p.get('career') or {}).get('ppg') is not None: byl[p['league']][1] += 1
print()
print('  players with a PPG, by league:')
for l, (t, w) in sorted(byl.items()): print(f'    {l:8} {w:3}/{t:3}')

if APPLY:
    db['statsRun'] = 'run2-stats'
    json.dump(db, open(f'{REPO}/docs/play/data/players.json', 'w'), indent=1)
    print('\n  players.json WRITTEN')
else:
    print('\n  (pass --apply to write, --overwrite to also take the run\'s value on conflicts)')

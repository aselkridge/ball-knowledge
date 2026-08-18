#!/usr/bin/env python3
"""THE FLOOR ANALYSIS (Aaron, 08-18): "I want a floor analysis given the above
and a HONEST TRUE analysis of if the floor is too small for all of those
rules, do we need to make the floor bigger or do we need to make defense less
restrictive."

His rules, both parts read together:
  R1  head-on crossovers are full price, diagonals are cheaper
  R2  a lane two defenders guard is CLOSED, unless a highly skilled handler
      opens it (the skill escape hatch)
  R3  crossover reach is one square SHORTER than free-move reach, so the
      momentum tax is paid in the tiles offered, never after the win

HOW THIS STAYS HONEST. The page probe (tools/floor-truth.mjs) classifies every
tile using the game's OWN functions on the real board. This file carries
a copy of that geometry in Python, and it is only trusted for bigger boards
AFTER it reproduces the probe's classifications exactly, tile for tile
(--validate; currently 432 of 432). A model that never met the real thing would just be an
opinion with decimals.

Screens are OFF throughout, on purpose and stated everywhere the numbers go:
screens only ever OPEN lanes, so every map here is the floor at its WORST for
the offense. Run --emit first, then the probe, then --validate, then --model.

CORRECTED BEFORE FIRST USE: the first draft modelled a 13x7 board, read off
game.js line 1067's initial values. The game RESIZES per league (applyMode,
line 1080): NBA is 15x8. The validation pass caught it in thirty mismatched
tiles before a single number reached Aaron, which is the whole reason the
validate step exists. Every board size here now starts from 15x8.
"""
import json, math, os, sys

TILE = 46

# the game's own shape tables (game.js 3560-3571), written for attacking EAST
# on the real NBA board, 15 columns x 8 rows
OFF_SHAPES = {
    'HORNS':    {'PG': (9, 3), 'SG': (13, 0), 'SF': (13, 7), 'PF': (11, 5), 'C': (11, 2)},
    'FIVE-OUT': {'PG': (9, 3), 'SG': (10, 1), 'SF': (10, 6), 'PF': (13, 0), 'C': (13, 7)},
    'FLOPPY':   {'PG': (9, 3), 'SG': (13, 4), 'SF': (10, 1), 'PF': (12, 5), 'C': (12, 2)},
}
DEF_SHAPES = {
    'MAN':         {'PG': (10, 3), 'SG': (11, 1), 'SF': (11, 6), 'PF': (12, 5), 'C': (12, 2)},
    '2-3 ZONE':    {'PG': (11, 2), 'SG': (11, 5), 'SF': (13, 6), 'PF': (13, 1), 'C': (12, 3)},
    'BOX-AND-ONE': {'PG': (10, 4), 'SG': (11, 2), 'SF': (11, 5), 'PF': (13, 2), 'C': (13, 5)},
}
POS = ['PG', 'SG', 'SF', 'PF', 'C']
CROSS_BASE = {'PG': 1, 'SG': 2, 'SF': 2, 'PF': 3, 'C': 3}   # game.js 3354


def clamp(c, r, cols, rows):
    return (max(0, min(cols - 1, c)), max(0, min(rows - 1, r)))


def free_tile(c, r, occ, cols, rows):
    """mbFreeTile's bump, replicated in its exact search order (dr outer)."""
    c, r = clamp(c, r, cols, rows)
    if (c, r) not in occ:
        return (c, r)
    for rad in range(1, 5):
        for dr in range(-rad, rad + 1):
            for dcc in range(-rad, rad + 1):
                if max(abs(dcc), abs(dr)) != rad:
                    continue
                cc, rr = c + dcc, r + dr
                if 0 <= cc < cols and 0 <= rr < rows and (cc, rr) not in occ:
                    return (cc, rr)
    return (c, r)


def place(off_name, def_name, cols=15, rows=8):
    """Defense claims its table spots first, then offense bumps around it.
    On a bigger board the shapes keep their distance from the attacked (east)
    edge, and rows shift to stay centred on the rim."""
    dc_shift, dr_shift = cols - 15, (rows - 8) // 2
    occ, pieces = set(), []
    for team, shapes, name in ((1, DEF_SHAPES, def_name), (0, OFF_SHAPES, off_name)):
        for pos in POS:
            c, r = shapes[name][pos]
            t = free_tile(c + dc_shift, r + dr_shift, occ, cols, rows)
            occ.add(t)
            pieces.append({'team': team, 'pos': pos, 'c': t[0], 'r': t[1]})
    return pieces


# ---- the geometry, ported line for line from game.js ----------------------
def center(c, r):
    return ((c + 0.5) * TILE, (r + 0.5) * TILE)


def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


def seg_dist(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    L2 = dx * dx + dy * dy
    t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) if L2 else 0
    return math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dy * t))


def guards(dc, dr, c, r, all8=True):
    ax, ay = abs(dc - c), abs(dr - r)
    if max(ax, ay) > 1:
        return False
    return True if all8 else ax + ay <= 1


def rim(cols, rows):
    lw = cols * TILE
    return (lw - 5.25 * (lw / 94), rows * TILE / 2)


def drive(pieces, fc, fr, tc, tr, cols, rows, linegate=1.15):
    """driveChallenge (game.js 1968), screens off.
    Returns (duel_idx, gaters, gaters_on_the_lane, forward).
    `gaters_on_the_lane` counts only men standing ON the move (next to where
    you start or where you land), not men merely NEAR the path; the loosened
    closure rule below closes a lane only when two men are truly on it."""
    R = rim(cols, rows)
    a, b = center(fc, fr), center(tc, tr)
    s_rim = dist(a, R)
    if s_rim - dist(b, R) <= 4:
        return (-1, 0, 0, False)
    best, bd, n, n_on = -1, 1e9, 0, 0
    for i, p in enumerate(pieces):
        if p['team'] == 0:
            continue
        d = center(p['c'], p['r'])
        line_d = seg_dist(d, a, b)
        gate = on = False
        if guards(p['c'], p['r'], fc, fr) and dist(d, R) < s_rim + TILE * 0.6:
            gate = on = True
        elif guards(p['c'], p['r'], tc, tr):
            if dist(b, R) < dist(d, R) - TILE * 0.3:
                gate = on = True
        elif line_d <= TILE * linegate:
            gate = True
        if gate:
            n += 1
            n_on += 1 if on else 0
            if line_d < bd:
                bd, best = line_d, i
    return (best, n, n_on, True)


def classify(pieces, hi, rng, cols, rows, linegate=1.15, closure='all'):
    """Every tile within reach of the handler, named for what it offers.
    lane   · toward the rim, nobody gates it: a clean drive
    free   · sideways or backward, safe
    headon · a duel priced full (the man is square to you)
    diag   · a duel priced one step easier (he covers you from the corner)
    closed · two men gate it (R2); with closure='on-lane' only men truly ON
             the move close it, men merely near the path just duel
    -taxed · at full reach, so R3 (crossovers reach one less) removes it"""
    h = pieces[hi]
    occ = {(p['c'], p['r']) for p in pieces}
    out = {}
    for r in range(rows):
        for c in range(cols):
            d = max(abs(c - h['c']), abs(r - h['r']))
            if d == 0 or d > rng:
                continue
            if (c, r) in occ:
                out[f'{c},{r}'] = 'occupied'
                continue
            duel, gaters, on_lane, fwd = drive(pieces, h['c'], h['r'], c, r,
                                               cols, rows, linegate)
            if duel < 0:
                out[f'{c},{r}'] = 'lane' if fwd else 'free'
                continue
            dp = pieces[duel]
            diag = dp['c'] != h['c'] and dp['r'] != h['r']
            two = (on_lane if closure == 'on-lane' else gaters) >= 2
            kind = 'closed' if two else ('diag' if diag else 'headon')
            if d == rng:                       # R3: crossovers reach one less
                kind += '-taxed'
            out[f'{c},{r}'] = kind
    return out


def coverage(pieces, cols, rows):
    """Floor-wide: how much of the attacking half a defender stands next to."""
    half_c = cols // 2
    tiles = guarded = doubled = 0
    occ = {(p['c'], p['r']) for p in pieces}
    for r in range(rows):
        for c in range(half_c, cols):
            if (c, r) in occ:
                continue
            tiles += 1
            n = sum(1 for p in pieces if p['team'] == 1 and guards(p['c'], p['r'], c, r))
            guarded += 1 if n >= 1 else 0
            doubled += 1 if n >= 2 else 0
    return {'half_tiles': tiles, 'guarded': guarded, 'doubled': doubled}


SCEN = [(o, d) for o in OFF_SHAPES for d in DEF_SHAPES]
TRUTH = 'design/floor-truth.json'


def scen_payload(rng_default=3):
    return [{'name': f'{o} vs {d}', 'off': o, 'def': d,
             'pieces': place(o, d)} for o, d in SCEN]


if '--emit' in sys.argv:
    json.dump(scen_payload(), open('design/floor-scenarios.json', 'w'), indent=1)
    print('wrote design/floor-scenarios.json for the page probe')
    sys.exit(0)

if '--validate' in sys.argv:
    truth = json.load(open(TRUTH))
    mismatches = total = 0
    for t in truth['scenarios']:
        pieces = t['pieces']
        hi = next(i for i, p in enumerate(pieces) if p['team'] == 0 and p['pos'] == 'PG')
        mine = classify(pieces, hi, t['range'], 15, 8)
        for k, v in t['tiles'].items():
            total += 1
            # the probe reports raw duel/gaters; 'lane' is our forward split
            # of what the page calls 'free'
            m = mine.get(k, '?').replace('-taxed', '')
            if (m if m != 'lane' else 'free') != v:
                mismatches += 1
                print(f'  MISMATCH {t["name"]} {k}: model={mine.get(k)} page={v}')
    print(f'{total} tile classifications compared, {mismatches} mismatches')
    sys.exit(1 if mismatches else 0)

if '--model' in sys.argv:
    truth = json.load(open(TRUTH))
    rng = truth['scenarios'][0]['range']
    boards = [('15x8 · the board today', 15, 8, 1.15, 'all'),
              ('17x9 · two wider, one taller', 17, 9, 1.15, 'all'),
              ('19x10 · four wider, two taller', 19, 10, 1.15, 'all'),
              ('15x8 · lanes close only when both men are ON them',
               15, 8, 1.15, 'on-lane')]
    report = {'range': rng, 'boards': []}
    for label, cols, rows, lg, clo in boards:
        entry = {'label': label, 'cols': cols, 'rows': rows, 'linegate': lg,
                 'closure': clo, 'scenarios': []}
        for o, d in SCEN:
            pieces = place(o, d, cols, rows)
            hi = next(i for i, p in enumerate(pieces) if p['team'] == 0 and p['pos'] == 'PG')
            tiles = classify(pieces, hi, rng, cols, rows, lg, clo)
            counts = {}
            for v in tiles.values():
                counts[v] = counts.get(v, 0) + 1
            entry['scenarios'].append({'name': f'{o} vs {d}', 'pieces': pieces,
                'handler': hi, 'tiles': tiles, 'counts': counts,
                'coverage': coverage(pieces, cols, rows)})
        report['boards'].append(entry)
    json.dump(report, open('design/floor-analysis.json', 'w'), indent=1)
    # the summary a reader can check the artifact against · FORWARD tiles are
    # the story, safe sideways/backward outs are listed once for scale
    for b in report['boards']:
        lane = ho = dg = closed = taxed = free = 0
        cov = dbl = half = 0
        for s in b['scenarios']:
            for v in s['tiles'].values():
                if v == 'lane': lane += 1
                elif v == 'free': free += 1
                elif v.startswith('headon'): ho += 1
                elif v.startswith('diag'): dg += 1
                elif v.startswith('closed'): closed += 1
                if v.endswith('-taxed'): taxed += 1
            cov += s['coverage']['guarded']; dbl += s['coverage']['doubled']
            half += s['coverage']['half_tiles']
        n = len(b['scenarios'])
        print(f"{b['label']}")
        print(f"   toward the rim: {lane/n:.1f} clean lanes · {ho/n:.1f} head-on duels "
              f"· {dg/n:.1f} cheaper diagonal duels · {closed/n:.1f} closed by two men")
        print(f"   {taxed/n:.1f} of those vanish under the shorter crossover reach · "
              f"{free/n:.1f} safe sideways/back moves · half-court guarded "
              f"{100*cov/half:.0f}% · double-covered {100*dbl/half:.0f}%")
    print('wrote design/floor-analysis.json')

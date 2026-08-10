#!/usr/bin/env python3
"""
label-colours.py -- the inventory of every colour in Ball Knowledge that
CARRIES MEANING, and the measurement of how well those meanings are told apart.

Aaron, 2026-08-10: "can you show me a comparison artifact with every color used
for labeling in the game?"

WHY THIS IS A SCRIPT AND NOT A LIST IN A DOC. A hand-written palette table is
wrong the first time anyone retunes a hex and forgets the doc. This reads the
LIVE VALUES out of game.js and index.html every time it runs, so the inventory
cannot drift from the game. When a colour changes, the numbers here change with
it. (CLAUDE.md: "if a check can be a script, make it one, because scripts run
and reminders do not.")

WHAT COUNTS AS A LABELLING COLOUR. A colour that tells you WHICH KIND of thing
you are looking at: how hard this card is, whose player that is, what rarity
this pack was, whether that answer was right. It does NOT include chrome, which
is every colour that just builds the surface: ground, panel, line, ink, wood,
the ball, the rim. Chrome can be any colour it likes without lying to anybody.
The test is: if you swapped this colour for another, would a player misread a
FACT? Then it is a label.

    python3 tools/label-colours.py            # the inventory + the collisions
    python3 tools/label-colours.py --json     # machine-readable, for the artifact

DISTANCE: CIE76 deltaE, the same formula the 08-02 Medium/Legendary finding
used, so its 9.2 stays comparable to everything printed here. CIE2000 is also
computed because it models small differences better; where the two disagree
sharply the pair is called out. Neither is a substitute for looking at it.
"""
import json, math, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAY = os.path.join(ROOT, 'docs', 'play')

# ---------------------------------------------------------------- colour math
def hex2lab(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    def f(c): return ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92
    r, g, b = f(r), f(g), f(b)
    X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    Y = (0.2126 * r + 0.7152 * g + 0.0722 * b)
    Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    def g2(t): return t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = g2(X), g2(Y), g2(Z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)

def de76(a, b):
    L1, A1, B1 = hex2lab(a); L2, A2, B2 = hex2lab(b)
    return math.sqrt((L1 - L2) ** 2 + (A1 - A2) ** 2 + (B1 - B2) ** 2)

def de2000(c1, c2):
    L1, a1, b1 = hex2lab(c1); L2, a2, b2 = hex2lab(c2)
    C1 = math.hypot(a1, b1); C2 = math.hypot(a2, b2); Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = a1 * (1 + G), a2 * (1 + G)
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360
    h2p = math.degrees(math.atan2(b2, a2p)) % 360
    dLp = L2 - L1; dCp = C2p - C1p
    dh = h2p - h1p
    if C1p * C2p == 0: dhp = 0
    elif abs(dh) <= 180:  dhp = dh
    elif dh > 180:        dhp = dh - 360
    else:                 dhp = dh + 360
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp) / 2)
    Lbp = (L1 + L2) / 2; Cbp = (C1p + C2p) / 2
    if C1p * C2p == 0:          hbp = h1p + h2p
    elif abs(h1p - h2p) <= 180: hbp = (h1p + h2p) / 2
    elif h1p + h2p < 360:       hbp = (h1p + h2p + 360) / 2
    else:                       hbp = (h1p + h2p - 360) / 2
    T = (1 - 0.17 * math.cos(math.radians(hbp - 30))
           + 0.24 * math.cos(math.radians(2 * hbp))
           + 0.32 * math.cos(math.radians(3 * hbp + 6))
           - 0.20 * math.cos(math.radians(4 * hbp - 63)))
    dth = 30 * math.exp(-((hbp - 275) / 25) ** 2)
    RC = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
    SL = 1 + 0.015 * (Lbp - 50) ** 2 / math.sqrt(20 + (Lbp - 50) ** 2)
    SC = 1 + 0.045 * Cbp; SH = 1 + 0.015 * Cbp * T
    RT = -math.sin(math.radians(2 * dth)) * RC
    return math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2
                     + RT * (dCp / SC) * (dHp / SH))

def relL(h):
    """WCAG relative luminance, for contrast against the ground."""
    h = h.lstrip('#')
    ch = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        ch.append(c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]

def contrast(a, b):
    la, lb = relL(a), relL(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

# ------------------------------------------------------------------ the read
def src(name):
    with open(os.path.join(PLAY, name), encoding='utf-8') as f:
        return f.read()

GAME = src('game.js')
HTML = src('index.html')

def need(pattern, text, what, flags=0):
    """Extract or die loudly. A silently-empty system is how an inventory lies."""
    m = re.search(pattern, text, flags)
    if not m:
        sys.exit('label-colours: could not find %s -- the source moved, fix the '
                 'pattern rather than shipping a short inventory.' % what)
    return m

def pairs(blob):
    """every  key ... '#rrggbb'  in source order, with the label beside it"""
    return re.findall(r"'?([A-Za-z0-9_]+)'?\s*:\s*\{[^}]*?'(#[0-9a-fA-F]{6})'", blob)

# 1 -- question difficulty. game.js owns it; the court, the cards, the rack and
#      the pass arcs all read from here, which is why it is the spine.
blob = need(r'var TIERS=\{.*?\}\};', GAME, 'TIERS', re.S).group(0)
TIERS = [(n, c) for n, c in re.findall(r"n:'([^']+)',c:'(#[0-9a-fA-F]{6})'", blob)]

# 2 -- knowledge level, the bracket the room plays at
blob = need(r'var BRACKETS=\{.*?\n\};', GAME, 'BRACKETS', re.S).group(0)
BRACKETS = [(l, c) for l, c in
            re.findall(r"lbl:'([^']+)'[^}]*?col:'(#[0-9a-fA-F]{6})'", blob)]

# 3 -- pack rarity, and 4 -- player tier. Both are flat maps.
def flatmap(varname):
    blob = need(r'var %s=\{[^}]*\};' % varname, GAME, varname).group(0)
    return re.findall(r"(\w+):'(#[0-9a-fA-F]{6})'", blob)

SR_RC = flatmap('SR_RC')
SR_TC = flatmap('SR_TC')

RC_LBL = dict(re.findall(r"k:'(\w+)',lbl:'([^']+)'", GAME))
TC_LBL = {'S': 'Superstar', 'A': 'All-Star', 'R': 'Role player'}

# 5 -- team identity, out of :root
root = need(r':root\{(.*?)\n  \}', HTML, ':root', re.S).group(1)
def rootvar(v):
    return need(r'--%s:(#[0-9a-fA-F]{6})' % v, root, '--' + v).group(1)

# 6 -- league accent (the `rc` on each league row)
LEAGUES = re.findall(r"id:'(\w+)', name:'([^']+)'[^\n]*?rc:'(#[0-9a-fA-F]{6})'", GAME)

# 7 -- theme accents, which REPLACE --accent per theme
THEMES = re.findall(r'body\.theme-(\w+)\{--accent:(#[0-9a-fA-F]{6})', HTML)

# Systems that live in one-off CSS rules or inline copy get read by exact
# anchor, so a retune still flows through but a rename fails loudly.
def anchored(pattern, what):
    return need(pattern, HTML, what).group(1)

SYSTEMS = [
 {'id':'tier', 'name':'Question difficulty', 'src':'game.js  var TIERS',
  'what':'How hard is this card. The spine of the whole palette: the court '
         'tiles, the card header, the Daily Five rack and the pass arcs all '
         'read their colour from this one table.',
  'rows':[{'lbl':n,'hex':c} for n,c in TIERS]},

 {'id':'bracket','name':'Knowledge level','src':'game.js  var BRACKETS',
  'what':'The bracket the room plays at, chosen at setup. Deliberately the '
         'same five colours as difficulty, one step along: playing at Pro '
         'means Pro-red cards. The sixth, Surprise me, is not on the '
         'difficulty scale at all.',
  'rows':[{'lbl':l,'hex':c} for l,c in BRACKETS]},

 {'id':'pack','name':'Pack rarity','src':'game.js  var SR_RC',
  'what':'What a squad pack rolled, shown once on the reveal. Its own ladder, '
         'borrowed from card-game convention rather than from difficulty.',
  'rows':[{'lbl':RC_LBL.get(k,k),'hex':c} for k,c in SR_RC]},

 {'id':'ptier','name':'Player tier','src':'game.js  var SR_TC',
  'what':'How good the PLAYER is: the badge on a squad card and the ring on '
         'the inspector. Three grades, and they sit right next to the pack '
         'chip on the same screen.',
  'rows':[{'lbl':TC_LBL.get(k,k),'hex':c} for k,c in SR_TC]},

 {'id':'team','name':'Whose is it','src':'docs/play/index.html  :root',
  'what':'The single most load-bearing label in the game: which of these '
         'players is mine. Your colour follows the theme, the opponent is '
         'always the same blue.',
  'rows':[{'lbl':'You (default Hardwood)','hex':rootvar('accent')},
          {'lbl':'You, deep (rims, shadows)','hex':rootvar('accent-deep')},
          {'lbl':'Opponent','hex':rootvar('away')}]},

 {'id':'ring','name':'What that defender is doing','src':'docs/play/index.html  rulebook + board',
  'what':'A ring around every defender\'s feet. Three states, and they are '
         'told apart by SILHOUETTE as well as hue: the screened ring is '
         'broken, the contest ring is doubled.',
  'rows':[{'lbl':'Screened, drive past','hex':anchored(r'color:(#6fd0c3)">broken teal','teal ring')},
          {'lbl':'Will contest the shot','hex':anchored(r'color:(#e0473c)">double red','contest ring')},
          {'lbl':'Forces a crossover','hex':anchored(r'color:(#e8b84b)">amber ring','crossover ring')}]},

 {'id':'verdict','name':'Right or wrong','src':'docs/play/index.html  .correct / .wrong',
  'what':'The answer verdict on a card, and the one place in the game where '
         'green means good rather than easy.',
  'rows':[{'lbl':'Correct','hex':anchored(r'\.correct\{background:color-mix\(in srgb,(#[0-9a-f]{6})','correct green')},
          {'lbl':'Wrong','hex':rootvar('hard')},
          {'lbl':'Not answered','hex':anchored(r'\.missed\{background:rgba\(107,97,87,\.28\);border-color:(#[0-9a-f]{6})','missed grey')}]},

 {'id':'heat','name':'Heat','src':'docs/play/index.html  .heatrack',
  'what':'How lit your squad is, four quarters of a bar that warms as it '
         'fills. A ramp rather than a set of categories, so neighbours are '
         'MEANT to be close, but the top of the ramp lands on gold.',
  'rows':[{'lbl':'Quarter 1','hex':anchored(r'\.heatrack\.h1 i\{background:linear-gradient\(90deg,#\w{6},(#[0-9a-f]{6})','heat 1')},
          {'lbl':'Quarter 2','hex':anchored(r'\.heatrack\.h2 i\{background:linear-gradient\(90deg,#\w{6},(#[0-9a-f]{6})','heat 2')},
          {'lbl':'Quarter 3','hex':anchored(r'\.heatrack\.h3 i\{background:linear-gradient\(90deg,#\w{6},(#[0-9a-f]{6})','heat 3')},
          {'lbl':'ON FIRE','hex':rootvar('legend')}]},

 {'id':'league','name':'League','src':'game.js  LG_LEAGUES rc:',
  'what':'One accent per league on the picker. Not a scale, just identity, '
         'so these only need to differ from EACH OTHER.',
  'rows':[{'lbl':n,'hex':c} for _,n,c in LEAGUES]},

 {'id':'theme','name':'Theme accent (replaces "you")','src':'docs/play/index.html  body.theme-*',
  'what':'Twelve themes, each of which overwrites --accent. Every one of these '
         'becomes YOUR TEAM COLOUR, so each has to survive beside the opponent '
         'blue and beside the difficulty scale.',
  'rows':[{'lbl':t.capitalize(),'hex':c} for t,c in THEMES]},
]

GROUND = rootvar('ground')

for s in SYSTEMS:
    for r in s['rows']:
        r['contrast'] = round(contrast(r['hex'], GROUND), 2)

# ------------------------------------------------------- the two measurements
# A. inside a system: can you tell this system's own categories apart?
INTERNAL = []
for s in SYSTEMS:
    rows = s['rows']
    worst = None
    for i in range(len(rows)):
        for j in range(i + 1, len(rows)):
            d = de76(rows[i]['hex'], rows[j]['hex'])
            if worst is None or d < worst[0]:
                worst = (d, rows[i]['lbl'], rows[j]['lbl'],
                         de2000(rows[i]['hex'], rows[j]['hex']))
    if worst:
        INTERNAL.append({'sys': s['name'], 'id': s['id'], 'de': round(worst[0], 1),
                         'de2000': round(worst[3], 1), 'a': worst[1], 'b': worst[2]})

# B. across systems: does one colour carry two different meanings?
#    Exact repeats are the loud case; near-misses under NEAR are the quiet one.
NEAR = 12.0
flat = [(s['name'], s['id'], r['lbl'], r['hex']) for s in SYSTEMS for r in s['rows']]
byhex = {}
for sysname, sid, lbl, hx in flat:
    byhex.setdefault(hx.lower(), []).append((sysname, lbl))

EXACT = [{'hex': h, 'uses': u} for h, u in byhex.items() if len(u) > 1]
EXACT.sort(key=lambda e: -len(e['uses']))

CROSS = []
seen = set()
for i in range(len(flat)):
    for j in range(i + 1, len(flat)):
        s1, i1, l1, h1 = flat[i]; s2, i2, l2, h2 = flat[j]
        if i1 == i2 or h1.lower() == h2.lower():
            continue
        d = de76(h1, h2)
        if d < NEAR:
            key = tuple(sorted([h1.lower(), h2.lower()]))
            if key in seen:
                continue
            seen.add(key)
            CROSS.append({'de': round(d, 1), 'de2000': round(de2000(h1, h2), 1),
                          'a': '%s · %s' % (s1, l1), 'b': '%s · %s' % (s2, l2),
                          'ha': h1, 'hb': h2})
CROSS.sort(key=lambda c: c['de'])

DATA = {'systems': SYSTEMS, 'ground': GROUND, 'internal': INTERNAL,
        'exact': EXACT, 'cross': CROSS, 'near_threshold': NEAR}

# ---------------------------------------------------------------------- out
if __name__ == '__main__':
    if '--json' in sys.argv:
        print(json.dumps(DATA, indent=1))
        sys.exit(0)

    total = sum(len(s['rows']) for s in SYSTEMS)
    uniq = len({r['hex'].lower() for s in SYSTEMS for r in s['rows']})
    print('LABELLING COLOURS -- %d slots across %d systems, %d distinct hexes'
          % (total, len(SYSTEMS), uniq))
    print('ground %s\n' % GROUND)
    for s in SYSTEMS:
        print('  %-28s %s' % (s['name'], s['src']))
        for r in s['rows']:
            flag = '  low contrast' if r['contrast'] < 3 else ''
            print('      %-26s %s  %4.1f:1%s' % (r['lbl'], r['hex'], r['contrast'], flag))
        print()

    print('A. WITHIN each system, the closest pair (CIE76 / CIE2000):')
    for x in sorted(INTERNAL, key=lambda x: x['de']):
        mark = '  <-- too close' if x['de'] < 25 else ''
        print('   %-28s %5.1f / %4.1f   %s vs %s%s'
              % (x['sys'], x['de'], x['de2000'], x['a'], x['b'], mark))

    print('\nB. ACROSS systems, one colour wearing two meanings.')
    print('   Exact repeats (%d):' % len(EXACT))
    for e in EXACT:
        print('      %s  =  %s' % (e['hex'], '  |  '.join('%s: %s' % u for u in e['uses'])))
    print('   Near misses under deltaE %g (%d):' % (NEAR, len(CROSS)))
    for c in CROSS:
        print('      %4.1f / %4.1f  %s (%s)  ~  %s (%s)'
              % (c['de'], c['de2000'], c['a'], c['ha'], c['b'], c['hb']))

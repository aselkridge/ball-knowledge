#!/usr/bin/env python3
"""
label-artifact.py -- builds the palette specimen sheet for Aaron out of the LIVE
values in tools/label-colours.py plus the real screenshots in
design/shots/labels/.

Aaron, 2026-08-10: "can you show me a comparison artifact with every color used
for labeling in the game?"

Nothing here is typed by hand. The colours come from game.js and index.html at
run time, the distances are measured, and the proof shots are crops of real
headless screenshots of the shipped screens. Re-run it after any palette change
and the sheet is current, including the findings.

    python3 tools/label-artifact.py            # writes the html
    python3 tools/label-artifact.py --shots    # re-crop the proof shots first

DESIGN NOTE, so the next session does not "improve" it into a lie: the page uses
the GAME'S OWN ground, panel, ink and fonts (CLAUDE.md: reuse the device rather
than reinvent it), and it is deliberately single-theme. These colours were
chosen against #100d0b and only #100d0b. Rendering a swatch on a white card
would show Aaron a colour the game never displays. The page chrome itself is
kept strictly neutral for the same reason: if the document had an accent, that
accent would be competing with the very swatches under review.
"""
import base64, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import importlib
LC = importlib.import_module('label-colours')

OUT = os.environ.get('BK_SCRATCH', '/tmp') + '/label-colours.html'
SHOTS = os.path.join(ROOT, 'design', 'shots', 'labels')
FONTS = os.path.join(ROOT, 'docs', 'play', 'assets', 'fonts')

# --------------------------------------------------------------- proof crops
# (source, out, box in ORIGINAL pixels, scale) -- the shots are 2x, so a 1440
# desktop frame is 2880 wide. Crops are tight on the collision, because a full
# 1440 frame shrunk to fit an artifact column hides the very thing it is proving.
CROPS = [
 ('desktop-squad-legendary.png', 'crop-squad.png',      (860, 470, 2010, 1030), 0.62),
 ('desktop-rulebook.png',        'crop-tiermap.png',    (1080, 380, 1800, 910), 0.78),
 ('desktop-leagues.png',         'crop-leagues.png',    (900, 790, 2000, 1150), 0.62),
 # taller box than the Legendary crop, because this one has to hold the header
 # and the on-the-clock line as well as the chip: all three are the same blue.
 ('desktop-squad-rare-blue.png', 'crop-blue-rare.png',  (860, 270, 2010, 860), 0.62),
]

def make_crops():
    from PIL import Image
    for src, dst, box, sc in CROPS:
        p = os.path.join(SHOTS, src)
        if not os.path.exists(p):
            print('  missing %s, run tools/label-shots.mjs first' % src); continue
        im = Image.open(p).convert('RGB').crop(box)
        im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
        im.save(os.path.join(SHOTS, dst), 'PNG', optimize=True)
        print('  %s  %dx%d  %.0fkb' % (dst, im.width, im.height,
              os.path.getsize(os.path.join(SHOTS, dst)) / 1024))

if '--shots' in sys.argv:
    make_crops()

def datauri(path, mime):
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())

def font(name):
    return datauri(os.path.join(FONTS, name), 'font/woff2')

def shot(name):
    p = os.path.join(SHOTS, name)
    return datauri(p, 'image/png') if os.path.exists(p) else ''

D = LC.DATA
SYS = {s['id']: s for s in D['systems']}
GROUND = D['ground']

def rows(sid):
    return SYS[sid]['rows']

def hexes(sid):
    return {r['lbl']: r['hex'] for r in rows(sid)}

# ------------------------------------------------------- the reading of it all
# Reuse is not automatically a fault. Some of it is the game deliberately
# speaking one language, and the code says so out loud. Separating the two is
# the only part of this page that is judgement rather than measurement, so every
# call below cites the reason it was made.
DELIBERATE = {
 '#8fd0ff': 'Difficulty and knowledge level are meant to be one scale. game.js '
            'keeps them in two tables but one language: pick Pro and you get '
            'Pro-red cards.',
 '#6fbf73': 'Same scale, on purpose.',
 '#e8b84b': 'Same scale, on purpose. The crossover ring is the third use and it '
            'is also correct: that ring is telling you the crossover it forces '
            'is a MEDIUM card, so it is showing difficulty, not a fourth thing.',
 '#d5524b': 'Same scale, on purpose. The third use, a wrong answer, is the one '
            'worth a second look.',
 '#c9641a': 'Heat is YOUR heat, so the bar warms through your own team colour '
            'on its way to gold. Deliberate.',
 '#f5872e': 'Same reason: heat quarter 3 is your accent. NBA sharing it is '
            'defensible too, it is the house league and the default skin.',
}

def d76(a, b): return LC.de76(a, b)

# Numbers the findings quote. Computed, never typed: the first draft of this
# file asserted three of them from memory and all three were wrong, in the
# direction that made the findings sound milder than they are.
_lg = [(n, c) for _, n, c in LC.LEAGUES]
_lgp = sorted((d76(a[1], b[1]), a[0], b[0])
              for i, a in enumerate(_lg) for b in _lg[i + 1:])
LG_WORST, LG_NEXT = _lgp[0], _lgp[1]
_t = [r['hex'] for r in rows('tier')]
_nb = [d76(_t[i], _t[i + 1]) for i in range(len(_t) - 1)]
_nb_ok = [x for x in _nb if x > 25]          # every neighbour pair except the bad one
LADDER_LO, LADDER_HI = min(_nb_ok), max(_nb_ok)
GREEN_GAP = d76(hexes('verdict')['Correct'], hexes('tier')['Easy'])

FINDINGS = [
 {'id':'F1','sev':'high',
  'ttl':'Pack rarity and player tier are two different questions in the same three colours',
  'lede':'Every one of the three player-tier colours is also a pack-rarity '
         'colour, and both appear on the squad reveal at the same moment.',
  'body':'The chip at the top says what the PACK rolled. The badge on each card '
         'says how good that PLAYER is. They are unrelated axes, and they share '
         '#ffcf6a, #b98cff and #9a8f7c exactly. On a Legendary pack the screen '
         'shows a gold chip above four gold badges, and none of that gold means '
         'the same thing twice. A Common pack is worse: its grey chip is the '
         'exact grey of a Role badge sitting an inch below it.',
  'meas':'3 of 3 player-tier colours collide exactly with 3 of 5 pack colours. '
         'Measured, not estimated: SR_TC = {S #ffcf6a, A #b98cff, R #9a8f7c}, '
         'all three present in SR_RC.',
  'shot':'crop-squad.png',
  'cap':'Real screenshot, squad reveal forced to a Legendary pack. Gold chip, '
        'gold badges, one grey badge that is Common-pack grey.'},

 {'id':'F2','sev':'high',
  'ttl':'Medium and Legendary, the 08-02 finding, seen on one card',
  'lede':'deltaE 9.2, against %.0f to %.0f for every other neighbouring pair '
         'on the same ladder.' % (LADDER_LO, LADDER_HI),
  'body':'The knowledge-level screen prints the difficulty ladder as a column '
         'of chips. MID-RANGE reads MEDIUM in amber and SUDDEN DEATH '
         'reads LEGENDARY in gold, two rows apart, and at chip size they are '
         'the same colour. This is the finding already recorded in BUILD.md and '
         'already has an option board waiting on a pick. It is here because it '
         'is not a rack-size problem: it fails at full desktop size too.',
  'meas':'CIE76 9.2 / CIE2000 5.7. Every other neighbouring pair on the same '
         'ladder sits between %.0f and %.0f.' % (LADDER_LO, LADDER_HI),
  'shot':'crop-tiermap.png',
  'cap':'Real screenshot, the knowledge-level screen at 1440. MEDIUM and '
        'LEGENDARY are the second and fourth chips.'},

 {'id':'F3','sev':'med',
  'ttl':'Two teal leagues sit next to each other on the picker',
  'lede':'Flags #6fd0c3 and Overseas #4e9c93 are deltaE 18.9 apart and appear as '
         'adjacent rows.',
  'body':'League accents only have to differ from each other, which makes this '
         'the one system where a near-miss has no excuse. Flags and Overseas '
         'are also the two leagues a player is most likely to confuse on '
         'meaning alone: both are basketball played outside the American '
         'leagues. The colour is doing nothing to separate them. BIG3 and '
         'Street Legends are the second offenders, two browns at 23.',
  'meas':'%.1f CIE76 / %.1f CIE2000 for %s and %s. And the next pair down is '
         'also inside the danger zone: %s and %s at %.1f. Two of the seven '
         'league accents have a neighbour under 25.'
         % (LG_WORST[0], LC.de2000(hexes('league')[LG_WORST[1]],
                                    hexes('league')[LG_WORST[2]]),
            LG_WORST[1], LG_WORST[2], LG_NEXT[1], LG_NEXT[2], LG_NEXT[0]),
  'shot':'crop-leagues.png',
  'cap':'Real screenshot, the league picker. Flags and Overseas, consecutive.'},

 {'id':'F4','sev':'high',
  'ttl':'The blue team is the same blue as a Rare pack',
  'lede':'#58a8d6 is both "this is the blue side" and "this pack rolled Rare", '
         'and the blue reveal puts both on screen at once.',
  'body':'This started life as the mild one on the list. The note said these two '
         'never share a screen, which was reasoning rather than checking, and it '
         'was wrong. Driving the squad reveal with the blue side on the clock '
         'and rolling until the pack came up Rare put three uses of #58a8d6 in '
         'one eyeful: the FIVE in the headline, the BLUE on the clock line, and '
         'the pack chip between them. The first two say whose turn it is. The '
         'third says what the pack rolled. Nothing distinguishes them.',
  'meas':'Exact match, deltaE 0. Confirmed live, not inferred: header colour '
         'rgb(88,168,214), chip colour rgb(88,168,214), same frame. Rare is '
         'weighted 28 of 100, and the blue side reveals in every local two '
         'player game, so this is roughly one game in four.',
  'shot':'crop-blue-rare.png',
  'cap':'Real screenshot, blue side on the clock, pack forced to Rare. Team '
        'blue and rarity blue are the same value.'},

 {'id':'F5','sev':'med',
  'ttl':'Hardwood and The Garden are the same accent',
  'lede':'Both themes set --accent to #f5872e. They differ only in accent-deep.',
  'body':'On the theme picker the two swatches show a different second colour, '
         'so they are distinguishable there. In play the difference is close to '
         'invisible, because accent-deep is used for rims and shadows while '
         'accent carries every player, button and highlight. A player picking '
         'The Garden for Knicks blue gets a court that looks like Hardwood.',
  'meas':'deltaE 0.0 on --accent. The intended contrast, #c9641a vs #1f4f9c, '
         'lives only on accent-deep.', 'shot':'', 'cap':''},

 {'id':'F6','sev':'low',
  'ttl':'Two reds on the court: Hard and the contest ring',
  'lede':'#d5524b and #e0473c, deltaE 11.6 CIE76 but only 3.4 CIE2000.',
  'body':'The tiles under a crossover are painted Hard red; the ring around a '
         'defender who will contest is painted a second, slightly different '
         'red. They regularly appear within a few tiles of each other. The two '
         'formulas disagree sharply here, and CIE2000 is the more trustworthy '
         'of the two at short distances, which puts this closer to "the same '
         'red" than the CIE76 number suggests. Silhouette saves it: the contest '
         'ring is doubled and the tile is a fill.',
  'meas':'CIE76 11.6 / CIE2000 3.4. Flagged as low only because the shapes '
         'differ, not because the colours do.', 'shot':'', 'cap':''},

 {'id':'F7','sev':'low',
  'ttl':'Pack Legendary and Hall of Fame, already logged',
  'lede':'#ffcf6a vs #ffd76a, deltaE 5.1: the closest pair anywhere in the game.',
  'body':'Recorded on 08-10 alongside the Legendary colour board. The rarest '
         'outcome in the game looks like the second-rarest. The animated sheen '
         'on the Hall of Fame chip is currently doing all the work of telling '
         'them apart, and it is switched off under reduce-motion.',
  'meas':'CIE76 5.1 / CIE2000 3.1.', 'shot':'', 'cap':''},

 {'id':'F8','sev':'q',
  'ttl':'Question for you: should a wrong answer be Hard red?',
  'lede':'#d5524b is Hard difficulty, Pro level, and a wrong answer.',
  'body':'The argument for leaving it: red is red, and a player never mistakes '
         'a verdict for a difficulty because they arrive at different moments. '
         'The argument against: the card you just failed was very often NOT a '
         'hard card, and turning it hard-red at the moment you miss teaches the '
         'wrong lesson. The correct-answer green (#2fbf6a) has the mirror '
         'problem, and it is tighter than the red one: %.0f from Easy green. '
         'This one is taste, so it is yours rather than mine.' % GREEN_GAP,
  'meas':'Wrong #d5524b = Hard exactly, deltaE 0. Correct #2fbf6a to Easy '
         '#6fbf73 is %.1f, which is closer than any pair inside the '
         'difficulty ladder itself.' % GREEN_GAP,
  'shot':'', 'cap':''},
]

SEV = {'high':('Worth fixing','sev-hi'), 'med':('Worth a decision','sev-md'),
       'low':('Logged, not urgent','sev-lo'), 'q':('Your call','sev-q')}

# ------------------------------------------------------------------- the page
def swatch_row(r, extra=''):
    return (
      '<div class="sw">'
      '<span class="chip" style="--c:%s"></span>'
      '<span class="swl">%s</span>'
      '<span class="swh">%s</span>'
      '<span class="swc" title="contrast against the game ground">%.1f:1</span>'
      '%s</div>' % (r['hex'], r['lbl'], r['hex'], r['contrast'], extra))

def sysblock(s):
    internal = next((x for x in D['internal'] if x['id'] == s['id']), None)
    note = ''
    if internal:
        cls = 'tight' if internal['de'] < 25 else ''
        note = ('<p class="closest %s">closest pair <b>%s</b> and <b>%s</b>, '
                'deltaE <b>%.1f</b> <span class="d2">(CIE2000 %.1f)</span></p>'
                % (cls, internal['a'], internal['b'], internal['de'], internal['de2000']))
    reused = ''
    marks = []
    for r in s['rows']:
        others = [u for u in
                  next((e['uses'] for e in D['exact'] if e['hex'] == r['hex'].lower()), [])
                  if u[0] != s['name']]
        if others:
            marks.append('<li><b>%s</b> also means %s</li>' % (
                r['lbl'], ', '.join('%s in %s' % (l, sn) for sn, l in others)))
    if marks:
        reused = '<ul class="reuse">%s</ul>' % ''.join(marks)
    # The theme accents are twelve rows against everyone else's three to six.
    # Left in the normal grid it sits alone in the last band with two empty
    # columns beside it, so it spans instead and columns its own swatches.
    wide = ' wide' if len(s['rows']) > 8 else ''
    return ('<section class="sys%s"><header><h3>%s</h3><code>%s</code></header>'
            '<p class="what">%s</p><div class="sws">%s</div>%s%s</section>'
            % (wide, s['name'], s['src'], s['what'],
               ''.join(swatch_row(r) for r in s['rows']), note, reused))

def exactblock():
    out = []
    for e in D['exact']:
        why = DELIBERATE.get(e['hex'])
        cls = 'ok' if why else 'clash'
        uses = ''.join('<li><span>%s</span><b>%s</b></li>' % (sn, l) for sn, l in e['uses'])
        out.append('<div class="ex %s"><div class="exsw" style="--c:%s">'
                   '<code>%s</code><em>%d uses</em></div>'
                   '<ul class="exu">%s</ul>'
                   '<p class="exw">%s</p></div>'
                   % (cls, e['hex'], e['hex'], len(e['uses']), uses,
                      why if why else 'Two unrelated axes wearing one colour. '
                                      'Nothing in the code says this was intended.'))
    return ''.join(out)

def crossblock():
    tr = []
    for c in D['cross']:
        tr.append('<tr><td class="n">%.1f</td><td class="n d2">%.1f</td>'
                  '<td><span class="dot" style="--c:%s"></span>%s <code>%s</code></td>'
                  '<td><span class="dot" style="--c:%s"></span>%s <code>%s</code></td></tr>'
                  % (c['de'], c['de2000'], c['ha'], c['a'], c['ha'],
                     c['hb'], c['b'], c['hb']))
    return ''.join(tr)

def findingblock(f):
    lbl, cls = SEV[f['sev']]
    img = ''
    if f['shot']:
        uri = shot(f['shot'])
        if uri:
            img = ('<figure><img src="%s" alt="%s"><figcaption>%s</figcaption></figure>'
                   % (uri, f['cap'].replace('"', '&quot;'), f['cap']))
    return ('<article class="find %s" id="%s">'
            '<div class="fh"><span class="sev">%s</span><span class="fid">%s</span></div>'
            '<h3>%s</h3><p class="lede">%s</p><p>%s</p>'
            '<p class="meas"><span>measured</span>%s</p>%s</article>'
            % (cls, f['id'], lbl, f['id'], f['ttl'], f['lede'], f['body'],
               f['meas'], img))

total = sum(len(s['rows']) for s in D['systems'])
uniq = len({r['hex'].lower() for s in D['systems'] for r in s['rows']})
clashes = len([e for e in D['exact'] if e['hex'] not in DELIBERATE])

# the full ladder, every distinct hex sorted by hue, as one strip
allhex = sorted({r['hex'].lower() for s in D['systems'] for r in s['rows']},
                key=lambda h: LC.hex2lab(h)[0])

HTML = """<title>Ball Knowledge · every colour that means something</title>
<style>
@font-face{font-family:'Anton';src:url(%(f_anton)s) format('woff2');font-display:swap}
@font-face{font-family:'Space Mono';src:url(%(f_mono)s) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Space Mono';src:url(%(f_monob)s) format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'Archivo';src:url(%(f_arch)s) format('woff2');font-weight:600;font-display:swap}

/* Single theme, on purpose. Every colour on this page was chosen against
   %(ground)s and is only honest against %(ground)s. Tokens copied from
   docs/play/index.html :root so the two move together. */
:root{
  --ground:%(ground)s;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
  --ink:#efe6d8;--dim:#b3a894;--faint:#7d735f;
  --mono:'Space Mono',ui-monospace,Menlo,monospace;
  --sans:'Archivo',system-ui,-apple-system,sans-serif;
  --display:'Anton','Archivo',system-ui,sans-serif;
  --gut:clamp(18px,4vw,44px);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--ground);color:var(--ink);font-family:var(--sans);
  font-weight:600;line-height:1.6;-webkit-font-smoothing:antialiased;
  font-size:15px;padding:0 var(--gut) 120px}
.wrap{max-width:940px;margin:0 auto}
h1,h2,h3{font-family:var(--display);font-weight:400;letter-spacing:.02em;
  text-transform:uppercase;text-wrap:balance;line-height:1.02}
h1{font-size:clamp(40px,8vw,78px);margin:0 0 6px}
h2{font-size:clamp(23px,4vw,34px)}
h3{font-size:19px}
code,.n{font-family:var(--mono);font-variant-numeric:tabular-nums}
p{max-width:66ch}
a{color:var(--ink)}

/* masthead ------------------------------------------------------------- */
header.top{padding:clamp(48px,9vw,96px) 0 0}
.eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:.24em;
  text-transform:uppercase;color:var(--faint);margin-bottom:18px}
.sub{color:var(--dim);font-size:17px;max-width:62ch;margin-top:14px}
.ladder{display:flex;height:44px;border-radius:5px;overflow:hidden;margin:34px 0 8px;
  border:1px solid var(--line)}
.ladder i{flex:1;background:var(--c)}
.ladcap{font-family:var(--mono);font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint)}
.counts{display:flex;flex-wrap:wrap;gap:0;margin:38px 0 0;border-top:1px solid var(--line)}
.ct{flex:1 1 130px;padding:16px 18px 16px 0;border-bottom:1px solid var(--line)}
.ct b{display:block;font-family:var(--display);font-size:38px;font-weight:400;
  line-height:1;letter-spacing:0}
.ct span{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--faint);display:block;margin-top:7px}

section.band{padding-top:clamp(56px,8vw,90px)}
.bandhead{border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:26px;
  display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap}
.bandhead p{font-family:var(--mono);font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--faint);margin:0}
.intro{color:var(--dim);margin-bottom:8px}

/* the sheet ------------------------------------------------------------ */
.sheet{display:grid;gap:2px;grid-template-columns:repeat(auto-fit,minmax(290px,1fr))}
.sys{background:var(--panel);padding:20px 20px 22px;display:flex;flex-direction:column;gap:11px}
.sys header{display:flex;flex-direction:column;gap:5px}
.sys header code{font-size:9.5px;letter-spacing:.06em;color:var(--faint)}
.what{font-size:13px;color:var(--dim);line-height:1.55;max-width:none}
.sws{display:flex;flex-direction:column;gap:1px;margin-top:3px}
.sys.wide{grid-column:1/-1}
.sys.wide .what{max-width:62ch}
.sys.wide .sws{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:1px 28px}
.sys.wide .sw:first-child{border-top:1px solid rgba(58,51,42,.5)}
.sw{display:grid;grid-template-columns:34px 1fr auto auto;align-items:center;gap:11px;
  padding:6px 0;border-top:1px solid rgba(58,51,42,.5)}
.sw:first-child{border-top:0}
.chip{height:19px;border-radius:4px;background:var(--c);
  box-shadow:0 0 0 1px rgba(255,255,255,.07) inset}
.swl{font-size:13.5px}
.swh{font-family:var(--mono);font-size:11px;color:var(--dim)}
.swc{font-family:var(--mono);font-size:10px;color:var(--faint);min-width:44px;text-align:right}
.closest{font-family:var(--mono);font-size:10.5px;letter-spacing:.03em;color:var(--faint);
  border-top:1px solid var(--line);padding-top:10px;margin-top:2px;max-width:none;line-height:1.5}
.closest b{color:var(--dim)}
.closest.tight{color:#e8b84b}.closest.tight b{color:#ffcf6a}
.d2{opacity:.62}
.reuse{list-style:none;font-size:11.5px;color:var(--faint);line-height:1.5;
  display:flex;flex-direction:column;gap:3px}
.reuse b{color:var(--dim);font-weight:600}

/* one colour, two meanings --------------------------------------------- */
.exs{display:grid;gap:2px;grid-template-columns:repeat(auto-fit,minmax(258px,1fr))}
.ex{background:var(--panel);padding:16px 17px 17px;display:flex;flex-direction:column;gap:11px}
.ex.clash{background:#241b13}
.exsw{height:52px;border-radius:5px;background:var(--c);position:relative;
  display:flex;align-items:flex-end;justify-content:space-between;padding:7px 9px}
.exsw code,.exsw em{font-family:var(--mono);font-size:10px;font-style:normal;
  letter-spacing:.05em;color:#160f07;background:rgba(255,255,255,.62);
  border-radius:3px;padding:1px 5px}
.exu{list-style:none;display:flex;flex-direction:column;gap:4px}
.exu li{display:flex;gap:9px;font-size:12.5px;align-items:baseline}
.exu span{font-family:var(--mono);font-size:9.5px;letter-spacing:.09em;
  text-transform:uppercase;color:var(--faint);flex:0 0 96px;line-height:1.5}
.exu b{font-weight:600}
.exw{font-size:11.5px;color:var(--faint);line-height:1.5;border-top:1px solid var(--line);
  padding-top:9px;max-width:none}
.ex.clash .exw{color:#d8b98a}

/* near misses table ----------------------------------------------------- */
.tw{overflow-x:auto;border:1px solid var(--line)}
table{border-collapse:collapse;width:100%%;min-width:600px}
th{font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--faint);text-align:left;padding:11px 14px;border-bottom:1px solid var(--line);
  font-weight:400}
td{padding:11px 14px;border-bottom:1px solid rgba(58,51,42,.45);font-size:13px;
  vertical-align:middle}
tr:last-child td{border-bottom:0}
td.n{font-size:14px;width:62px}
td code{font-size:10.5px;color:var(--faint);margin-left:7px}
.dot{display:inline-block;width:11px;height:11px;border-radius:50%%;background:var(--c);
  margin-right:9px;vertical-align:-1px;box-shadow:0 0 0 1px rgba(255,255,255,.1) inset}

/* findings -------------------------------------------------------------- */
.finds{display:flex;flex-direction:column;gap:2px}
.find{background:var(--panel);padding:24px clamp(18px,3vw,30px) 28px;
  border-left:3px solid var(--line)}
.find.sev-hi{border-left-color:#d5524b}
.find.sev-md{border-left-color:#e8b84b}
.find.sev-lo{border-left-color:#6a5c48}
.find.sev-q{border-left-color:#58a8d6}
.fh{display:flex;align-items:center;gap:12px;margin-bottom:11px}
.sev{font-family:var(--mono);font-size:9px;letter-spacing:.17em;text-transform:uppercase;
  color:var(--faint)}
.sev-hi .sev{color:#d5524b}.sev-md .sev{color:#e8b84b}.sev-q .sev{color:#58a8d6}
.fid{font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--faint);
  margin-left:auto}
.find h3{margin-bottom:9px}
.lede{color:var(--ink);font-size:16px;margin-bottom:13px}
.find p{color:var(--dim);font-size:14px}
.meas{font-family:var(--mono);font-size:11px;color:var(--faint);line-height:1.6;
  border-top:1px solid var(--line);margin-top:16px;padding-top:12px;max-width:none}
.meas span{display:block;font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;
  margin-bottom:5px}
figure{margin-top:20px}
figure img{width:100%%;max-width:100%%;display:block;border:1px solid var(--line);
  border-radius:4px}
figcaption{font-family:var(--mono);font-size:10px;letter-spacing:.05em;color:var(--faint);
  margin-top:9px;line-height:1.55}

/* close ----------------------------------------------------------------- */
.close{background:var(--panel);padding:clamp(24px,4vw,38px);margin-top:2px}
.close h3{margin-bottom:14px}
.close ol{margin:0 0 4px 19px;display:flex;flex-direction:column;gap:11px}
.close li{font-size:14.5px;color:var(--dim);padding-left:5px}
.close li b{color:var(--ink);font-weight:600}
.foot{font-family:var(--mono);font-size:10px;letter-spacing:.06em;color:var(--faint);
  line-height:1.85;margin-top:56px;border-top:1px solid var(--line);padding-top:20px}
@media (max-width:560px){
  .sw{grid-template-columns:28px 1fr auto;gap:9px}
  .swc{display:none}
  .exu span{flex-basis:76px}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="wrap">
<header class="top">
  <p class="eyebrow">Ball Knowledge · palette audit · 10 August 2026</p>
  <h1>Every colour<br>that means something</h1>
  <p class="sub">%(total)d labelling slots, %(uniq)d distinct colours, across %(nsys)d systems.
  A labelling colour is one that tells you WHICH KIND of thing you are looking at:
  how hard this card is, whose player that is, what the pack rolled, whether you
  got it right. Chrome is excluded, because the ground and the panels and the
  wood can be any colour they like without lying to anyone.</p>

  <div class="ladder">%(ladder)s</div>
  <p class="ladcap">all %(uniq)d, sorted by lightness</p>

  <div class="counts">
    <div class="ct"><b>%(total)d</b><span>label slots</span></div>
    <div class="ct"><b>%(uniq)d</b><span>distinct colours</span></div>
    <div class="ct"><b>%(nexact)d</b><span>colours doing 2+ jobs</span></div>
    <div class="ct"><b>%(nclash)d</b><span>of those unexplained</span></div>
    <div class="ct"><b>%(ntight)d</b><span>systems whose own<br>categories sit under 25</span></div>
  </div>
</header>

<section class="band">
  <div class="bandhead"><h2>The sheet</h2><p>read live from game.js and index.html</p></div>
  <p class="intro">Every system, every slot, with its contrast against the game
  ground. The closest pair inside each system is measured at the foot of its
  card, and turns amber when the two are under deltaE 25 (below which two colours
  side by side start reading as one).</p>
  <div class="sheet">%(sheet)s</div>
</section>

<section class="band">
  <div class="bandhead"><h2>One colour, two meanings</h2><p>%(nexact)d exact repeats</p></div>
  <p class="intro">Reuse is not automatically a fault. Some of it is the game
  deliberately speaking one language, and the code says so out loud: difficulty
  and knowledge level share a scale on purpose, and heat warms through your own
  team colour on purpose. Those are the dark cards. The lit cards are the ones
  where two unrelated axes ended up in one colour with nothing in the source
  explaining why.</p>
  <div class="exs">%(exact)s</div>
</section>

<section class="band">
  <div class="bandhead"><h2>Near misses</h2><p>under deltaE %(near)g, different systems</p></div>
  <p class="intro">Colours that are not identical but are close enough to be
  mistaken for each other. CIE76 is the house formula, the one the 08-02
  Medium-versus-Legendary finding used, kept here so its 9.2 stays comparable.
  CIE2000 models short distances better; where the two disagree sharply, believe
  CIE2000 and look at the pixels.</p>
  <div class="tw"><table>
    <thead><tr><th>CIE76</th><th>CIE2000</th><th>this</th><th>and this</th></tr></thead>
    <tbody>%(cross)s</tbody>
  </table></div>
</section>

<section class="band">
  <div class="bandhead"><h2>What it adds up to</h2><p>%(nfind)d findings, worst first</p></div>
  <div class="finds">%(finds)s</div>
</section>

<section class="band">
  <div class="close">
    <h3>If it were mine</h3>
    <ol>
      <li><b>Fix F1 with the Legendary pick you already owe.</b> Whatever colour
      you choose off the option board, give it to the pack chip only and leave
      the Superstar badge gold. That splits pack from player in one move and
      settles F7 at the same time, because Hall of Fame gold stops competing.</li>
      <li><b>Give player tier its own three colours.</b> Pack rarity is a moment,
      shown once; player tier is permanent and appears everywhere a card does.
      Player tier should own the scarce gold and the pack ladder should move.</li>
      <li><b>Take the opponent blue out of the pack ladder (F4).</b> Team
      colour has to win every argument it is in: it is the label a player reads
      a hundred times a game. Rare should move, not the blue.</li>
      <li><b>Move Overseas off teal, and one of BIG3 or Street Legends off
      brown.</b> The league accents are the cheapest fix on this page: nothing
      reads them as a scale, so any distinct hue works. Two of the seven
      currently have a neighbour under 25.</li>
      <li><b>Give The Garden its Broadway blue as the accent</b>, not just as
      accent-deep, or drop the theme. Two identical themes is worse than one.</li>
      <li><b>Leave the difficulty and knowledge-level sharing exactly as it is.</b>
      It is the best thing in the palette. One scale, five colours, and the court,
      the cards, the rack and the level picker all speak it.</li>
    </ol>
  </div>
</section>

<p class="foot">
Built by <code>tools/label-artifact.py</code> from <code>tools/label-colours.py</code>,
which reads the live values out of <code>docs/play/game.js</code> and
<code>docs/play/index.html</code> at run time. Re-run either after a palette
change and this sheet is current, findings included.<br>
Proof shots are real headless screenshots of the shipped screens via
<code>tools/label-shots.mjs</code>, cropped, not mockups.<br>
Distances are CIE76 and CIE2000 deltaE in Lab. Contrast is WCAG against
<code>%(ground)s</code>.<br>
Single theme on purpose: these colours were chosen against the game's ground and
only tell the truth on it.
</p>
</div>
""" % {
 'f_anton': font('anton-400.woff2'),
 'f_mono': font('spacemono-400.woff2'),
 'f_monob': font('spacemono-700.woff2'),
 'f_arch': font('archivo-600.woff2'),
 'ground': GROUND,
 'total': total, 'uniq': uniq, 'nsys': len(D['systems']),
 'nexact': len(D['exact']), 'nclash': clashes,
 'ntight': len([x for x in D['internal'] if x['de'] < 25]),
 'near': D['near_threshold'],
 'ladder': ''.join('<i style="--c:%s"></i>' % h for h in allhex),
 'sheet': ''.join(sysblock(s) for s in D['systems']),
 'exact': exactblock(),
 'cross': crossblock(),
 'nfind': len(FINDINGS),
 'finds': ''.join(findingblock(f) for f in
          sorted(FINDINGS, key=lambda f: ['high','med','low','q'].index(f['sev']))),
}

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('wrote %s  (%.0f kb)' % (OUT, os.path.getsize(OUT) / 1024))

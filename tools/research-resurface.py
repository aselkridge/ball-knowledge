#!/usr/bin/env python3
"""
research-resurface.py -- rebuild the 22af comparative-design programme as one
readable page, with a SHIPPED / NOT SHIPPED column against every finding.

Aaron, 2026-08-10: *"That was based on some research we did of other strategy
based games, can you resurface all the info we gathered from that research
run?! We got a lot of ideas there."*

WHY THIS EXISTS. The research was not lost. It is all in
`design/22af-findings.md`, 528 lines of it, plus four briefs. What was missing
is the only column anybody actually needs a year later: **did we DO it?** A
finding with a verdict but no build status reads as done, which is how a rule
Aaron remembers agreeing to can sit unbuilt for eight days without anyone
noticing. CLAUDE.md calls this resurfacing rather than recording.

The finding TEXT is parsed out of the markdown so it cannot be paraphrased
into something the research did not say. The STATUS column is hand-written
judgement, and every row carries the check that produced it, because a status
with no evidence is the same failure one level up.

    python3 tools/research-resurface.py
"""
import base64, html, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'design', '22af-findings.md')
FONTS = os.path.join(ROOT, 'docs', 'play', 'assets', 'fonts')
OUT = os.environ.get('BK_SCRATCH', '/tmp') + '/research-resurface.html'

# ---------------------------------------------------------------- the status
# id -> (state, one-line status, the check that proved it)
# States: shipped · half · not · held · ruled · closed
STATUS = {
 'F1': ('half',
   'Contest price is graduated by ANGLE, not by how many defenders are near.',
   'doShoot() reads one defender via adjDefenderIdx and raises the tier if he '
   'is square-on rather than diagonal. Aaron\'s corrected version of F1 asked '
   'for "more defenders nearby = harder question". Defender COUNT still does '
   'not enter the price.'),
 'F2': ('shipped',
   'All four zone-of-control settings ship, and players can pick between them.',
   'setupCfg.spacing takes open · locked · toll · chain, all four wired in '
   'game.js and all four exposed as data-sp buttons on the house-rules screen.'),
 'F3': ('held',
   'Correctly held. The finding said do NOT touch roster or board size yet.',
   'Board is still 13x7 with 5v5. That is the finding being obeyed, not '
   'ignored.'),
 'F4': ('not',
   'THE ONE AARON IS ASKING ABOUT. No free off-ball move exists in the game.',
   'tools/turn-economy-check.mjs moves an off-ball attacker one square and '
   'reads the phase afterwards: it goes straight to def-slide, so the shuffle '
   'spent the possession\'s only action. DESIGN.md section 3 line 68 says '
   'otherwise. The doc and the game disagree. Filed as V0 D32, with '
   'the defensive half as D33.'),
 'F5': ('not',
   'No off-ball job, no open-man bonus, nothing that rewards ending a turn '
   'uncovered.',
   'Zero matches for openMan / open-man / unguarded anywhere in game.js. '
   'Aaron ruled "I LOVE THIS" on 08-02 with the constraint that every '
   'incentive must be visible on screen. Neither half was built.'),
 'F6': ('held',
   'Partly true by accident: the ball-handler duel IS the spotlight.',
   'Every possession already resolves through handler vs nearest defender. '
   'What is missing is the other half of the finding, which is that everyone '
   'else needs the off-ball rules from F4 and F5 to have anything to do.'),
 'F7': ('not',
   'TV mode does not exist yet, so the adopted design has nothing to sit in.',
   'Zero matches for tvMode or "TV mode" in game.js or index.html. ADOPTED on '
   '08-02, unbuilt, and not currently in V0 scope.'),
 'F8': ('closed',
   'Superseded by Run C, which refuted the wide claim and found a narrow one '
   'that holds.',
   'See C1 and C2 below.'),
 'F9': ('held', 'Correctly held: six questions returned nothing and the '
   'decisions were frozen until the re-runs.',
   'Runs A, B and C are those re-runs. Turn order stayed empty in all three '
   'and is now closed to research.'),

 'A1': ('shipped', 'Heat grants abilities, never points. Exactly the NBA Jam '
   'shape.', 'ON FIRE drops every question one tier and gives every player one '
   'extra tile of movement. No point multiplication anywhere.'),
 'A2': ('shipped', 'A miss costs one quarter of the bar, never the whole '
   'thing.', 'The rulebook states it and heat-check.mjs guards it.'),
 'A3': ('shipped', 'No multiplier was ever built.', 'Heat changes capability '
   'only. A3 was a REJECT and the reject held.'),
 'A4': ('not', 'Neither lever was pulled: nothing speeds the middle, nothing '
   'escalates the end.',
   'One weak match for escalation language in game.js and no rule behind it. '
   'The target is still 11, which the finding endorsed, but the two levers it '
   'said to pull instead were never built. This is the pacing complaint\'s '
   'unclaimed answer.'),
 'A5': ('shipped', 'Sudden death triggers at game point and tests cards.',
   'Tie at game point freezes the board and alternates cards, first clean '
   'hit-versus-miss ends it. Matches the adopted placement.'),
 'A6': ('held', 'Correctly held. These were named as unknowable from research.',
   'Reset harshness and the fouls-shorten-games question both wait on '
   'playtests, as instructed.'),
 'A7': ('shipped', 'Alternating possessions, as recommended.',
   'This is what the game does. Worth reading beside F4: A7 also said that if '
   'the waiting player disengages, the fix is to give the DEFENDER something '
   'to do inside the question beat, not to rebuild the turn system.'),

 'B1': ('half', 'Cards do repeat, but there is no per-player scheduling.',
   'Aaron refined the ruling to "everything repeats, correct answers wait a '
   'lot longer". The volatile index and the question bank exist; the '
   'per-player history that would space them does not.'),
 'B2': ('not', 'No wager, no defender-picks-the-category.',
   'Handicap exists as a difficulty dial, which is where Aaron placed these '
   '(options in handicap matches, not core rules). The two mechanics '
   'themselves are unbuilt.'),
 'B3': ('shipped', 'The Daily Five shipped, in the two-round shape Aaron '
   'ruled.', 'Five shots, five stops, bonus round on a 10 of 10 sweep, '
   'forgiving streak, shared daily set. 46 checks in daily-check.mjs.'),
 'B4': ('half', 'The drills exist and the coach is arriving; the rulebook is '
   'still the front door.',
   'Drills are reachable from inside the rulebook, which is the place a '
   'person who does not read rulebooks never opens. The coach tours are the '
   'work in flight that closes this.'),
 'B5': ('ruled', 'Never show the answer, and the premise has since gone void '
   'in one mode.',
   'Still correct in the main game, where a missed card genuinely returns. In '
   'the Daily Five the card never comes back, so the ruling\'s reasoning does '
   'not apply there. Flagged in the findings doc itself and open in V0.'),

 'C1': ('closed', 'Reference. Stop saying "essentially never shipped".',
   'Quiz Tonosama no Yabou, Capcom, 1991.'),
 'C2': ('closed', 'The sentence Aaron can say out loud, and it is defensible.',
   'Narrower than the original claim and it survives.'),
 'C3': ('closed', 'The real axis is CHOSEN versus ASSIGNED position.',
   'Recommended to make this explicit rather than bury it. Still buried.'),
 'C4': ('closed', 'Reference: the near-misses that collapsed.', ''),
 'C5': ('not', 'A follow-up run was EARNED and never ran.',
   'Lane 5, sports plus trivia, was never actually searched, and it is the '
   'lane most likely to hold a competitor. Run E was specified and is still '
   'not scheduled.'),
 'C6': ('closed', 'Source honesty on the decisive finding.',
   'No English primary source. Fine for a 35-year-old artifact, not fine in '
   'front of an investor without a native-Japanese re-check.'),
 'C7': ('closed', 'Hygiene, and worth re-reading.',
   'A source served a prompt-injection payload; a fetch summary fabricated '
   'evidence pointing at the answer we wanted. The three-checker pass caught '
   'both.'),
}

SLABEL = {
 'shipped': ('In the game', 'st-ship'),
 'half':    ('Half built', 'st-half'),
 'not':     ('Not built', 'st-not'),
 'held':    ('Held on purpose', 'st-held'),
 'ruled':   ('Ruled, with a caveat', 'st-held'),
 'closed':  ('Reference', 'st-ref'),
}

# ------------------------------------------------------------------ the parse
raw = open(SRC, encoding='utf-8').read()

RUNS = [
 ('one', 'RUN ONE', '11 questions, 5 search lanes, 7 starved',
  r'# 22af RUN ONE(.*?)(?=# RUN A FINDINGS)'),
 ('a', 'RUN A', 'heat · game length · turn order',
  r'# RUN A FINDINGS(.*?)(?=# RUN B FINDINGS)'),
 ('b', 'RUN B', 'trivia · teaching · spectators · turn order',
  r'# RUN B FINDINGS(.*?)(?=# RUN C FINDINGS)'),
 ('c', 'RUN C', 'the moat, one question with the whole search to itself',
  r'# RUN C FINDINGS(.*)'),
]

def dash(s):
    """the em-dash rule, applied on the way out (see md())

    Whitespace is normalised around the dash FIRST. A dash that wrapped across
    a line arrives as ' —\\n', which does not match ' — ', and the bare-dash
    fallback then produces ' , ' with a space before the comma. Eight of those
    shipped in the repo's first em-dash sweep for the same reason."""
    s = re.sub(r'\s*—\s*', ' — ', s)
    return s.replace(' — ', ' · ')

def md(s):
    """the small subset of markdown these docs actually use"""
    # The findings doc was written before the em-dash ban and lives in design/,
    # which the ban does not cover. This page is written FOR Aaron, which it
    # does. Convert on the way out rather than editing the research file: the
    # source stays the untouched record, and what he reads follows the rule.
    # Separator becomes the game's own middot; the other three jobs an em dash
    # does are rare enough here to handle by eye if they ever appear.
    s = html.escape(dash(s))
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s, flags=re.S)
    s = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<i>\1</i>', s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    return s

def parse_findings(block):
    out = []
    # "### Finding 4 · Title (ADAPT)"  or  "### A1 · Title (ADOPT)"
    pat = re.compile(r'^### (?:Finding )?([A-C]?\d)\s*·\s*(.+?)\s*\(([^)]+)\)\s*$',
                     re.M)
    hits = list(pat.finditer(block))
    for i, m in enumerate(hits):
        num, title, verdict = m.group(1), m.group(2), m.group(3)
        fid = num if num[0].isalpha() else 'F' + num
        body = block[m.end():(hits[i + 1].start() if i + 1 < len(hits) else len(block))]
        # split the labelled paragraphs out of the body
        srcs = []
        sm = re.search(r'^Sources?: (.+?)(?=\n\n|\n###|\Z)', body, re.M | re.S)
        if sm:
            srcs = [u.strip() for u in re.split(r'\s·\s|\n', sm.group(1)) if u.strip().startswith('http')]
            body = body[:sm.start()] + body[sm.end():]
        # The source runs "What we learned / Why it matters / The move / How
        # solid" together as one paragraph with inline bold labels. Split on
        # the labels so the structure reads: same words, four blocks.
        body = re.sub(r'^\*\*(What we learned|Why it matters|The move|'
                      r'What it got wrong[^:]*|One precision that matters|'
                      r'How solid|The sentence Aaron can say out loud|'
                      r'⚠ Aaron\'s call|Wits & Wagers|LearnedLeague):\*\*',
                      r'\n\n**\1:**', body, flags=re.M)
        body = re.sub(r'\n{3,}', '\n\n', body)
        paras = [p.strip() for p in body.strip().split('\n\n') if p.strip()]
        out.append({'id': fid, 'title': title, 'verdict': verdict,
                    'paras': paras, 'sources': srcs})
    return out

def parse_rulings(block):
    m = re.search(r'^## AARON\'S RULINGS[^\n]*\n(.*?)(?=\n# |\Z)', block, re.M | re.S)
    if not m:
        return []
    items = re.split(r'\n(?=\d+\. )', m.group(1).strip())
    return [i.strip() for i in items if i.strip()]

DATA = []
for key, name, sub, pat in RUNS:
    m = re.search(pat, raw, re.S)
    if not m:
        sys.exit('research-resurface: could not find %s. The findings doc moved; '
                 'fix the pattern rather than shipping a partial index.' % name)
    block = m.group(1)
    DATA.append({'key': key, 'name': name, 'sub': sub,
                 'findings': parse_findings(block),
                 'rulings': parse_rulings(block)})

ALL = [f for r in DATA for f in r['findings']]
missing = [f['id'] for f in ALL if f['id'] not in STATUS]
if missing:
    sys.exit('research-resurface: no status for %s. Every finding needs one, '
             'or the page lies by omission.' % ', '.join(missing))

n_ship = len([f for f in ALL if STATUS[f['id']][0] == 'shipped'])
n_half = len([f for f in ALL if STATUS[f['id']][0] == 'half'])
n_not = len([f for f in ALL if STATUS[f['id']][0] == 'not'])

def datauri(p, m):
    with open(p, 'rb') as f:
        return 'data:%s;base64,%s' % (m, base64.b64encode(f.read()).decode())
def font(n): return datauri(os.path.join(FONTS, n), 'font/woff2')

# ------------------------------------------------------------------- render
def finding_html(f):
    st, line, check = STATUS[f['id']]
    lbl, cls = SLABEL[st]
    ps = ''.join('<p>%s</p>' % md(p) for p in f['paras'])
    srcs = ''
    if f['sources']:
        srcs = ('<p class="src"><span>sources</span>%s</p>'
                % ' · '.join('<a href="%s">%s</a>'
                             % (html.escape(u), html.escape(
                                 re.sub(r'^https?://(www\.)?', '', u).split('/')[0]))
                             for u in f['sources']))
    return ('<article class="f %s" id="%s">'
            '<div class="fhead"><span class="fid">%s</span>'
            '<span class="verdict">%s</span>'
            '<span class="status %s">%s</span></div>'
            '<h3>%s</h3>'
            '<div class="status-line %s"><b>%s</b><span>%s</span></div>'
            '<div class="fbody">%s%s</div></article>'
            % (cls, f['id'], f['id'], html.escape(dash(f['verdict'])), cls, lbl,
               md(f['title']), cls, html.escape(line), md(check), ps, srcs))

def run_html(r):
    rl = ''
    if r['rulings']:
        rl = ('<div class="rulings"><h4>What Aaron ruled on this run</h4><ol>%s</ol></div>'
              % ''.join('<li>%s</li>' % md(re.sub(r'^\d+\.\s*', '', i)) for i in r['rulings']))
    return ('<section class="run"><div class="runhead"><h2>%s</h2><p>%s</p></div>'
            '<div class="fs">%s</div>%s</section>'
            % (r['name'], html.escape(r['sub']),
               ''.join(finding_html(f) for f in r['findings']), rl))

HTML = """<title>22af · the research, and what we did with it</title>
<style>
@font-face{font-family:'Anton';src:url(%(f_anton)s) format('woff2');font-display:swap}
@font-face{font-family:'Space Mono';src:url(%(f_mono)s) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Space Mono';src:url(%(f_monob)s) format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'Archivo';src:url(%(f_arch)s) format('woff2');font-weight:600;font-display:swap}
:root{
  --ground:#100d0b;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
  --ink:#efe6d8;--dim:#b3a894;--faint:#7d735f;
  --ship:#6fbf73;--half:#e8b84b;--not:#d5524b;--held:#58a8d6;--ref:#7d735f;
  --mono:'Space Mono',ui-monospace,Menlo,monospace;
  --sans:'Archivo',system-ui,-apple-system,sans-serif;
  --display:'Anton','Archivo',system-ui,sans-serif;
  --gut:clamp(18px,4vw,44px);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--ground);color:var(--ink);font-family:var(--sans);font-weight:600;
  line-height:1.62;font-size:15px;padding:0 var(--gut) 120px;-webkit-font-smoothing:antialiased}
.wrap{max-width:960px;margin:0 auto}
h1,h2,h3,h4{font-family:var(--display);font-weight:400;letter-spacing:.02em;
  text-transform:uppercase;text-wrap:balance;line-height:1.03}
h1{font-size:clamp(38px,7.5vw,72px)}
h2{font-size:clamp(24px,4vw,36px)}
h3{font-size:18px;margin-bottom:10px}
h4{font-size:15px;letter-spacing:.06em}
p{max-width:70ch}
code{font-family:var(--mono);font-size:.9em;color:var(--dim)}
a{color:var(--dim);text-decoration-color:var(--line);text-underline-offset:2px}
a:hover{color:var(--ink)}
a:focus-visible{outline:2px solid var(--held);outline-offset:2px;border-radius:2px}

header.top{padding:clamp(46px,9vw,92px) 0 0}
.eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:.24em;text-transform:uppercase;
  color:var(--faint);margin-bottom:16px}
.sub{color:var(--dim);font-size:17px;max-width:64ch;margin-top:16px}

/* the answer up top, because it is the question that was asked */
.answer{background:var(--panel);border-left:3px solid var(--not);
  padding:clamp(20px,3.4vw,32px);margin:40px 0 0}
.answer h2{font-size:clamp(20px,3vw,27px);margin-bottom:14px}
.answer p{color:var(--dim);font-size:15px;margin-bottom:12px}
.answer p:last-child{margin-bottom:0}
.answer b{color:var(--ink)}
.two{display:grid;gap:2px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));margin:18px 0 4px}
.two div{background:var(--panel2);padding:15px 16px}
.two h4{font-size:12px;letter-spacing:.1em;color:var(--faint);margin-bottom:8px;
  font-family:var(--mono);text-transform:uppercase}
.two p{font-size:13.5px;margin:0}
.term{font-family:var(--mono);font-size:11.5px;color:var(--ink);display:block;margin-bottom:5px}

.counts{display:flex;flex-wrap:wrap;margin:44px 0 0;border-top:1px solid var(--line)}
.ct{flex:1 1 120px;padding:16px 18px 16px 0;border-bottom:1px solid var(--line)}
.ct b{display:block;font-family:var(--display);font-size:36px;font-weight:400;line-height:1;letter-spacing:0}
.ct span{font-family:var(--mono);font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;
  color:var(--faint);display:block;margin-top:7px}
.ct.s b{color:var(--ship)}.ct.h b{color:var(--half)}.ct.n b{color:var(--not)}

.band{padding-top:clamp(50px,7vw,84px)}
.bandhead{border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:24px;
  display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap}
.bandhead p{font-family:var(--mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;
  color:var(--faint);margin:0}
.intro{color:var(--dim);margin-bottom:6px}

/* the board */
.tw{overflow-x:auto;border:1px solid var(--line)}
table{border-collapse:collapse;width:100%%;min-width:640px}
th{font-family:var(--mono);font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--faint);
  text-align:left;padding:11px 14px;border-bottom:1px solid var(--line);font-weight:400}
td{padding:10px 14px;border-bottom:1px solid rgba(58,51,42,.42);font-size:13.5px;vertical-align:top}
tr:last-child td{border-bottom:0}
td.id{font-family:var(--mono);font-size:12px;color:var(--faint);width:46px}
td.st{width:130px}
tbody tr:hover{background:rgba(255,255,255,.022)}
.pill{font-family:var(--mono);font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;
  padding:3px 8px;border-radius:9px;white-space:nowrap;display:inline-block;
  border:1px solid currentColor}
.st-ship .pill,.pill.st-ship{color:var(--ship)}
.st-half .pill,.pill.st-half{color:var(--half)}
.st-not  .pill,.pill.st-not{color:var(--not)}
.st-held .pill,.pill.st-held{color:var(--held)}
.st-ref  .pill,.pill.st-ref{color:var(--ref)}
td a{font-weight:600}

/* findings */
.run{padding-top:clamp(50px,7vw,84px)}
.runhead{border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:22px;
  display:flex;align-items:baseline;justify-content:space-between;gap:14px;flex-wrap:wrap}
.runhead p{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--faint);margin:0}
.fs{display:flex;flex-direction:column;gap:2px}
.f{background:var(--panel);padding:20px clamp(16px,2.6vw,26px) 24px;border-left:3px solid var(--line)}
.f.st-ship{border-left-color:var(--ship)}
.f.st-half{border-left-color:var(--half)}
.f.st-not{border-left-color:var(--not)}
.f.st-held{border-left-color:var(--held)}
.f.st-ref{border-left-color:var(--ref)}
.fhead{display:flex;align-items:center;gap:11px;margin-bottom:9px;flex-wrap:wrap}
.fid{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--faint)}
.verdict{font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--dim);border:1px solid var(--line);border-radius:9px;padding:3px 8px}
.status{font-family:var(--mono);font-size:8.5px;letter-spacing:.13em;text-transform:uppercase;
  margin-left:auto;padding:3px 9px;border-radius:9px;border:1px solid currentColor}
.status.st-ship{color:var(--ship)}.status.st-half{color:var(--half)}
.status.st-not{color:var(--not)}.status.st-held{color:var(--held)}
.status.st-ref{color:var(--ref)}
.status-line{border-top:1px solid var(--line);border-bottom:1px solid var(--line);
  padding:12px 0;margin:0 0 16px;display:flex;flex-direction:column;gap:6px}
.status-line b{font-size:14px;color:var(--ink)}
.status-line span{font-family:var(--mono);font-size:11px;line-height:1.65;color:var(--faint)}
.st-not .status-line b{color:#f0a89f}
.st-half .status-line b{color:#f0d79a}
.fbody p{color:var(--dim);font-size:14px;margin-bottom:9px}
.fbody p:last-child{margin-bottom:0}
.fbody b{color:var(--ink)}
.src{font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:12px!important}
.src span{display:block;font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px}

.rulings{background:var(--panel2);padding:20px clamp(16px,2.6vw,26px) 24px;margin-top:2px}
.rulings h4{margin-bottom:13px;color:var(--dim)}
.rulings ol{margin-left:18px;display:flex;flex-direction:column;gap:10px}
.rulings li{font-size:13.5px;color:var(--dim);padding-left:4px}
.rulings b{color:var(--ink)}

.close{background:var(--panel);padding:clamp(22px,4vw,36px);margin-top:2px}
.close h3{margin-bottom:14px}
.close ol{margin-left:19px;display:flex;flex-direction:column;gap:12px}
.close li{font-size:14.5px;color:var(--dim);padding-left:5px}
.close li b{color:var(--ink)}
.foot{font-family:var(--mono);font-size:10px;color:var(--faint);line-height:1.85;
  margin-top:52px;border-top:1px solid var(--line);padding-top:20px;max-width:none}
@media (max-width:560px){.status{margin-left:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="wrap">
<header class="top">
  <p class="eyebrow">Ball Knowledge · 22af comparative design programme · resurfaced 10 August 2026</p>
  <h1>The research,<br>and what we did with it</h1>
  <p class="sub">Four research runs across 2026-08-01 and 08-02, asking how other
  games solved problems this one has. Every claim was fact-checked by three
  independent checkers whose job was to DISPROVE it. About half of everything
  the research asserted was thrown out. What survived is below, all of it, with
  the column that was missing: <b>did we build it?</b></p>

  <div class="answer">
    <h2>First, the thing you asked about</h2>
    <p>You remembered agreeing that movement before the main action is free.
    <b>You are right that it was agreed, and right that it never shipped.</b>
    I measured it rather than argued about it: move an off-ball player one
    square and the game hands the turn straight to the defense. The shuffle
    spends the possession.</p>
    <p>The reason it is hard to find is that <b>your memory is of two different
    rules that were decided at different times, and neither was built</b>:</p>
    <div class="two">
      <div><h4>What DESIGN.md says</h4>
        <span class="term">"one free off-ball shuffle (1 square) + one main action"</span>
        <p>Section 3, line 68. A single free move for one player, then the real
        action. This is written as settled rule in the file that is supposed to
        be the law.</p></div>
      <div><h4>What you are describing</h4>
        <span class="term">every piece gets one action per turn</span>
        <p>Team turns, from the Mario + Rabbids study. Logged as FL-2.6 and as
        open question 10, both times with the same disposition: prototype it
        behind a house-rules toggle and playtest both rhythms. Never
        prototyped.</p></div>
    </div>
    <p>So there is no single lost decision, there are two live ones sitting in
    two different docs, one of them wearing the clothes of a locked rule. And
    <b>the finding underneath them both, F4, is the one the research called the
    single highest-value change in the run</b>: it said one rule fixes idle
    pieces AND long possessions, with no timer. It has been ADAPT-verdicted and
    unbuilt for eight days.</p>
    <p><b>Did I forget it? No, and the truth is worse than forgetting.</b> I
    found this contradiction yesterday while measuring the action economy, and
    I wrote it down the same day: item 4 of "Open for Aaron to rule" in
    <code>design/COACH-TOURS-2026-08-10.md</code>, naming the exact § 3 line and
    saying it needs a build item or a rewrite. Then you asked about that rule
    today and it did not surface, because <code>open-items.py</code> harvests
    the five root docs and <code>next.py</code> reads V0's two tables, and a
    working doc under <code>design/</code> is neither. <b>Filed into a doc
    nothing reads is the same as not filed.</b> It is now V0 D32 and D33, where
    the two commands can see it, and <code>open-items.py</code> warns from now
    on when a design doc holds a pending-rulings section. That warning is the
    only part of this worth keeping.</p>
  </div>

  <div class="counts">
    <div class="ct"><b>%(nfind)d</b><span>findings survived</span></div>
    <div class="ct s"><b>%(nship)d</b><span>in the game</span></div>
    <div class="ct h"><b>%(nhalf)d</b><span>half built</span></div>
    <div class="ct n"><b>%(nnot)d</b><span>not built</span></div>
    <div class="ct"><b>4</b><span>runs</span></div>
  </div>
</header>

<section class="band">
  <div class="bandhead"><h2>The board</h2><p>every finding · one line each</p></div>
  <p class="intro">Sorted by run. "Held on purpose" means the finding told us
  NOT to do something and we correctly did not do it, which is a success and
  not a gap. Every status carries its check in the full entry below.</p>
  <div class="tw"><table>
    <thead><tr><th>id</th><th>finding</th><th>verdict</th><th>status</th></tr></thead>
    <tbody>%(board)s</tbody>
  </table></div>
</section>

%(runs)s

<section class="band">
  <div class="close">
    <h3>What I would do about the turn structure</h3>
    <ol>
      <li><b>Fix the contradiction before designing anything.</b> DESIGN.md
      currently states a rule the game does not implement. Either build the
      free shuffle or strike the line. Leaving it is how the next session, or
      you, reasons from a rule that is not real. There is now a check for it:
      <code>tools/turn-economy-check.mjs</code> fails today and goes green when
      the game and the doc agree.</li>
      <li><b>Build the free off-ball move, not team turns, first.</b> It is the
      smaller change, it is what DESIGN.md already claims, and F4 says it is
      the one that fixes idle pieces and possession length together. Team turns
      are a bigger rhythm change and the research explicitly found NO evidence
      for them in three separate runs.</li>
      <li><b>And this is where your defense question gets its answer.</b> If
      off-ball moves are free, the defense cannot answer each one or the
      possession never ends. A7 already wrote the shape: the defender's job
      belongs inside the beat that matters, not spread across every shuffle.
      So: free off-ball moves draw NO defensive response, and the defense gets
      its slide when the main action commits. That keeps the current one-for-one
      exchange on everything that can score, and stops the defense having to
      answer a man stepping sideways.</li>
      <li><b>Then F5, because it is what makes the free move worth taking.</b>
      A free move nobody wants is just extra tapping. F5 is the open-man bonus:
      end the turn uncovered and get something for it, visible on screen, which
      was your binding constraint when you ruled "I LOVE THIS" on 08-02.</li>
      <li><b>A4 is the unclaimed answer to the pacing complaint.</b> Speed the
      middle, escalate the end, keep the target at 11. Three studios pulled
      those same two levers and none of them lowered the win target. Neither
      lever exists in the game.</li>
    </ol>
  </div>
</section>

<p class="foot">
Findings text parsed from <code>design/22af-findings.md</code> by
<code>tools/research-resurface.py</code>, so it cannot be paraphrased into
something the research did not say. Briefs for each run:
<code>design/22af-brief.md</code>, <code>22af-runA-brief.md</code>,
<code>22af-runB-brief.md</code>, <code>22af-runC-brief.md</code>.<br>
Status column is hand-written judgement and each row carries the check behind
it. The turn-economy status is measured live by
<code>tools/turn-economy-check.mjs</code>.<br>
Run totals: 106 agents and roughly 4.7M tokens on run one alone; 109 claims
extracted, 25 fact-checked, 13 disproven, 9 findings after merging.<br>
Run D (the player wishlist) was never run. Run E (sports-plus-trivia and the
BoardGameGeek taxonomy, the two lanes Run C could not cover) was earned and
never scheduled.
</p>
</div>
""" % {
 'f_anton': font('anton-400.woff2'), 'f_mono': font('spacemono-400.woff2'),
 'f_monob': font('spacemono-700.woff2'), 'f_arch': font('archivo-600.woff2'),
 'nfind': len(ALL), 'nship': n_ship, 'nhalf': n_half, 'nnot': n_not,
 'board': ''.join(
    '<tr><td class="id"><a href="#%s">%s</a></td><td>%s</td>'
    '<td><span class="verdict">%s</span></td>'
    '<td class="st"><span class="pill %s">%s</span></td></tr>'
    % (f['id'], f['id'], md(f['title']), html.escape(dash(f['verdict'])),
       SLABEL[STATUS[f['id']][0]][1], SLABEL[STATUS[f['id']][0]][0])
    for f in ALL),
 'runs': ''.join(run_html(r) for r in DATA),
}

with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write(HTML)
print('wrote %s  (%.0f kb)' % (OUT, os.path.getsize(OUT) / 1024))
print('%d findings · %d shipped · %d half · %d not built'
      % (len(ALL), n_ship, n_half, n_not))

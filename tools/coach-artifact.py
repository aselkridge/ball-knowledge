#!/usr/bin/env python3
"""Build the review page for the two lists, straight out of the markdown.

The lists live in design/COACH-AND-DRILLS.md and nowhere else. This reads that
file and emits the page, so the artifact can never disagree with the document
the way my summary line disagreed with the document it was summarising. Every
count on the page is computed here, not typed.

    git show 366ca2c:docs/dev/gym-sample.png > /tmp/before.png
    python3 tools/coach-artifact.py /tmp/coach-lists.html /tmp/before.png

The "before" shot is the last commit that still had the invented court, which is
366ca2c. It is deliberately NOT committed as a file: a before/after only exists
in relation to a specific commit, and a loose before.png in the repo goes stale
silently the moment the after changes. The output is not committed either, at
1.6 MB of inlined fonts and screenshots. This script plus the markdown is the
source; the page is a build.

Design comes from the game: Anton, Archivo, Space Mono and DSEG7 out of
docs/play/assets/fonts, arena orange #f5872e, warm near black #100d0b.

ONE deliberate departure, and it is the point: the weights are NOT green /
amber / red. That is the game's difficulty scale and it already collided with
the three point line once. MUST / SHOULD / COULD reads as filled, hollow and
faint instead, so the only meaning red carries on any Ball Knowledge surface
stays "this question is hard".
"""
import base64, html, os, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'design/COACH-AND-DRILLS.md'
FONTS = ROOT / 'docs/play/assets/fonts'
SHOTS = {'before': None, 'after': ROOT / 'docs/dev/gym-sample.png'}


def datauri(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(pathlib.Path(path).read_bytes()).decode()


def face(name, file, weight=400):
    return (f"@font-face{{font-family:{name};font-weight:{weight};font-style:normal;"
            f"font-display:swap;src:url({datauri(FONTS/file,'font/woff2')}) format('woff2')}}")


# ---------------------------------------------------------------- markdown ---
INLINE = [(re.compile(r'\*\*(.+?)\*\*'), r'<strong>\1</strong>'),
          (re.compile(r'`(.+?)`'), r'<code>\1</code>'),
          (re.compile(r'(?<!\*)\*([^*]+?)\*(?!\*)'), r'<em>\1</em>')]


def inline(t):
    t = html.escape(t)
    for pat, rep in INLINE:
        t = pat.sub(rep, t)
    return t


WEIGHTS = {'MUST': 'must', 'SHOULD': 'should', 'COULD': 'could', 'live': 'live',
           'NO': 'no', 'later': 'later'}


def wclass(cell):
    for k, v in WEIGHTS.items():
        if cell.startswith(k):
            return v
    return 'plain'


def parse():
    """-> [ {h1, h2, intro:[str], tables:[{head:[..], rows:[[..]]}] } ]"""
    blocks, cur = [], None
    table = None
    for raw in SRC.read_text(encoding='utf-8').splitlines():
        line = raw.rstrip()
        if line.startswith('# ') or line.startswith('## '):
            lvl = 1 if line.startswith('# ') else 2
            cur = {'lvl': lvl, 'title': line.lstrip('# ').strip(),
                   'intro': [], 'tables': []}
            blocks.append(cur)
            table = None
            continue
        if cur is None:
            continue
        if line.startswith('|'):
            cells = [c.strip() for c in line.strip('|').split('|')]
            if set(''.join(cells)) <= set('-: '):
                continue                       # the ---|--- separator
            if table is None:
                table = {'head': cells, 'rows': []}
                cur['tables'].append(table)
            else:
                table['rows'].append(cells)
            continue
        table = None
        # blank lines are PARAGRAPH BOUNDARIES, not noise. Dropping them joined
        # a quote, three paragraphs and a closing line into one wall of text.
        cur['intro'].append(line)
    return blocks


def counts(blocks):
    dr = [r for b in blocks for t in b['tables'] for r in t['rows']
          if re.match(r'^DR-\d+$', r[0])]
    cm = [(b['title'], r) for b in blocks for t in b['tables'] for r in t['rows']
          if re.match(r'^CM-[A-Z]+-\d+$', r[0])]
    live = [c for c in cm if c[0].startswith('The fourteen')]
    body = [c for c in cm if not c[0].startswith('The fourteen')]
    # strict, not by prefix: "MUST, if that is the ruling" is a conditional and
    # counting it as a MUST is exactly the kind of flattering rounding this
    # script exists to stop.
    w = {}
    for _, r in body:
        k = wclass(r[-1]) if r[-1] in WEIGHTS else 'other'
        w[k] = w.get(k, 0) + 1
    first = {'COLD', 'LOAD', 'MENU', 'CPU', 'OPEN', 'GAME', 'DEF', 'CARD',
             'HEAT', 'HUD', 'END', 'INT'}
    fmust = sum(1 for _, r in body
                if r[0].split('-')[1] in first and r[-1] == 'MUST')
    return dict(dr=len(dr), cm=len(body), live=len(live), weights=w,
                first_must=fmust,
                sections=len({r[0].split('-')[1] for _, r in body}))


# -------------------------------------------------------------------- html ---
def prose(lines):
    """intro lines -> paragraphs and blockquotes, honouring blank lines."""
    out, buf, quote = [], [], False

    def flush():
        if not buf:
            return
        txt = inline(' '.join(buf))
        out.append(f'<blockquote>{txt}</blockquote>' if quote else f'<p>{txt}</p>')
        buf.clear()

    for ln in lines:
        t = ln.strip()
        if not t or t.startswith('```') or set(t) <= {'-'}:
            flush(); quote = False
            continue
        q = t.startswith('>')
        if q != quote:
            flush(); quote = q
        buf.append(t.lstrip('> ').rstrip() if q else t)
    flush()
    return ''.join(out)


def render_table(t, tid=None):
    """Rows with a DR-/CM- id are PICKABLE (Aaron, 08-10: "the ability to pick
    the ones I want and copy and send it to you"). The checkbox carries the
    id, the row's short name and its weight, so the copy block downstream is
    self-describing without re-parsing the table."""
    pickable = any(re.match(r'^(DR|CM)-', r[0]) for r in t['rows'])
    out = [f'<div class="scroll"><table{"" if not tid else f" id={tid}"}>',
           '<thead><tr>' + ('<th class="pick"></th>' if pickable else '')
           + ''.join(f'<th>{inline(c)}</th>' for c in t['head'])
           + '</tr></thead><tbody>']
    for r in t['rows']:
        w = wclass(r[-1]) if len(r) > 2 else 'plain'
        cells = []
        rid = r[0] if re.match(r'^(DR|CM)-', r[0]) else None
        if pickable:
            if rid:
                name = html.escape(re.sub(r'<[^>]+>', '', re.sub(r'\*+', '', r[1]))[:60])
                # weight only when the last cell IS one; a drill row ends in
                # its teaching line, and "select, lega" is nobody's weight
                wtxt = html.escape(r[-1][:12]) if w != 'plain' else ''
                cells.append(f'<td class="pick"><input type="checkbox" '
                             f'data-id="{html.escape(rid)}" data-nm="{name}" '
                             f'data-w="{wtxt}" '
                             f'aria-label="pick {html.escape(rid)}"></td>')
            else:
                cells.append('<td class="pick"></td>')
        for i, c in enumerate(r):
            if i == 0 and rid:
                cells.append(f'<td class="id">{html.escape(c)}</td>')
            elif i == len(r) - 1 and w != 'plain':
                cells.append(f'<td class="w"><span class="chip {w}">'
                             f'{inline(c)}</span></td>')
            else:
                cells.append(f'<td>{inline(c)}</td>')
        out.append('<tr>' + ''.join(cells) + '</tr>')
    out.append('</tbody></table></div>')
    return '\n'.join(out)


def mix(t):
    """the little weight-mix bar that rides each collapsed section summary"""
    n = {}
    for r in t['rows']:
        n[wclass(r[-1])] = n.get(wclass(r[-1]), 0) + 1
    tot = sum(n.values()) or 1
    seg = ''.join(f'<i class="{k}" style="flex:{n[k]}"></i>'
                  for k in ('must', 'should', 'could', 'live', 'no', 'later')
                  if n.get(k))
    return f'<span class="mix">{seg}</span><span class="n">{tot}</span>'


def main(out):
    blocks = parse()
    c = counts(blocks)

    # ---- the two list bodies, plus the rulings block --------------------
    # Three h1 sections between LIST TWO and "What this costs" carry Aaron's
    # rulings and the two explanations he asked for. They go on the page under
    # their own heading; the trailing three h1s are written into the template
    # by hand and are skipped here.
    one, two, rul = [], [], []
    where = None
    for b in blocks:
        t = b['title']
        if t.startswith('LIST ONE'):
            where = one
        elif t.startswith('LIST TWO'):
            where = two
        elif b['lvl'] == 1 and (t.startswith("AARON'S RULINGS")
                                or t.startswith('THE TWELVE')
                                or t.startswith('NOW versus')):
            where = rul
            rul.append(f'<h3>{inline(t)}</h3>')
            rul.append(prose(b['intro']))
            for tb in b['tables']:
                rul.append(render_table(tb))
            continue
        elif b['lvl'] == 1 and (t.startswith('What this costs')
                                or t.startswith('Found while')
                                or t.startswith('What I need')):
            where = None
            continue
        if where is None:
            continue
        body = [prose(b['intro'])]
        for tb in b['tables']:
            body.append(render_table(tb))
        if where is rul:                      # h2s inside the rulings block
            rul.append(f'<h4>{inline(t)}</h4>')
            rul.append(''.join(body))
            continue
        if b['lvl'] == 1:
            # The LIST ONE / LIST TWO headings and their intros are NOT emitted.
            # The page writes its own lede for each, and the markdown intro
            # carries the arithmetic that already has a whole section above.
            # Flattened into one paragraph it read as "109 MUST 71 SHOULD 54",
            # which is the code block losing its shape.
            continue
        else:
            openattr = ' open' if where is one and 'Tier A' in t else ''
            summ = mix(b['tables'][0]) if b['tables'] else ''
            where.append(f'<details{openattr}><summary><span class="st">'
                         f'{inline(t)}</span>{summ}</summary>{"".join(body)}</details>')

    css = CSS.replace('__FONTS__', ''.join([
        face('Anton', 'anton-400.woff2'),
        face('Arch', 'archivo-600.woff2', 600),
        face('Mono', 'spacemono-400.woff2'),
        face('Seg', 'dseg7-700.woff2', 700)]))

    page = PAGE.format(
        css=css,
        before=datauri(SHOTS['before'], 'image/png'),
        after=datauri(SHOTS['after'], 'image/png'),
        n_dr=c['dr'], n_cm=c['cm'], n_live=c['live'], n_sec=c['sections'],
        n_must=c['weights'].get('must', 0), n_should=c['weights'].get('should', 0),
        n_could=c['weights'].get('could', 0), n_first=c['first_must'],
        list_one=''.join(one), list_two=''.join(two), rulings=''.join(rul))
    page = page.replace('__PICKER__', PICKER)
    pathlib.Path(out).write_text(page, encoding='utf-8')
    kb = os.path.getsize(out) / 1024
    print(f'wrote {out}  {kb:.0f} KB')
    print(f'  drills {c["dr"]}   coach moments {c["cm"]} in {c["sections"]} sections'
          f'   already live {c["live"]}')
    print(f'  MUST {c["weights"].get("must",0)}  SHOULD {c["weights"].get("should",0)}'
          f'  COULD {c["weights"].get("could",0)}   first-game MUST {c["first_must"]}')


CSS = """__FONTS__
/* DARK FIRST, because the game is. :root carries the complete dark palette;
   light is redefined at token level twice, once for the OS preference (guarded
   so an explicit dark choice still wins) and once for the explicit stamp. */
:root{
  --ground:#100d0b; --panel:#191410; --panel2:#211a15; --rule:#332c24;
  --ink:#efe6d8; --dim:#a89a85; --faint:#7b6f5d;
  --accent:#f5872e; --accent-soft:rgba(245,135,46,.14); --shadow:rgba(0,0,0,.6);
}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){
  --ground:#f2ebe0; --panel:#fffdf8; --panel2:#f8f1e5; --rule:#dcd0bd;
  --ink:#1d1710; --dim:#5f5443; --faint:#8b7f6c;
  --accent:#b8530c; --accent-soft:rgba(184,83,12,.10); --shadow:rgba(60,40,20,.14);
}}
:root[data-theme="light"]{
  --ground:#f2ebe0; --panel:#fffdf8; --panel2:#f8f1e5; --rule:#dcd0bd;
  --ink:#1d1710; --dim:#5f5443; --faint:#8b7f6c;
  --accent:#b8530c; --accent-soft:rgba(184,83,12,.10); --shadow:rgba(60,40,20,.14);
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:Arch,ui-sans-serif,system-ui,sans-serif;font-weight:600;
  font-size:15.5px;line-height:1.6;-webkit-text-size-adjust:100%}
/* ONE container width for the whole page, so every section shares a left edge.
   The reading measure is enforced on the text itself, not on the container,
   which lets the tables and the comparison run full width without the masthead
   and the first section starting in two different places. */
.wrap,.bleed{max-width:1080px;margin:0 auto;padding:0 clamp(20px,4vw,34px)}
.wrap{padding-bottom:90px}
p,.quote,.punch,.key,ol.ask{max-width:64ch}

/* ---- masthead ---- */
header{border-bottom:1px solid var(--rule);margin-bottom:0;
  padding:clamp(34px,7vw,64px) 0 30px}
.eyebrow{font-family:Mono;font-size:10px;letter-spacing:.26em;text-transform:uppercase;
  color:var(--accent);margin:0 0 14px}
h1{font-family:Anton;font-weight:400;text-transform:uppercase;margin:0;
  font-size:clamp(38px,10.5vw,74px);line-height:.9;letter-spacing:.01em;
  text-wrap:balance}
h1 .thin{display:block;color:var(--accent)}
.quote{margin:22px 0 0;border-left:3px solid var(--accent);padding-left:16px;
  color:var(--dim);font-style:italic;max-width:60ch}
.quote b{color:var(--ink);font-style:normal}

/* ---- nav ---- */
nav{position:sticky;top:0;z-index:20;background:var(--ground);
  border-bottom:1px solid var(--rule);margin-bottom:46px}
nav ul{display:flex;gap:4px;list-style:none;margin:0;padding:0;overflow-x:auto;
  scrollbar-width:none}
@media(min-width:760px){nav ul{overflow-x:visible;flex-wrap:wrap}}
nav ul::-webkit-scrollbar{display:none}
nav a{display:block;white-space:nowrap;padding:11px 12px;text-decoration:none;
  color:var(--dim);font-family:Mono;font-size:10px;letter-spacing:.15em;
  text-transform:uppercase;border-bottom:2px solid transparent}
nav a:hover,nav a:focus-visible{color:var(--ink);border-bottom-color:var(--rule)}

/* ---- type ---- */
h2{font-family:Anton;font-weight:400;text-transform:uppercase;
  font-size:clamp(24px,5.4vw,38px);line-height:1;margin:0 0 6px;text-wrap:balance}
h3{font-family:Anton;font-weight:400;text-transform:uppercase;letter-spacing:.02em;
  font-size:clamp(17px,3.4vw,22px);margin:34px 0 8px}
p{margin:0 0 16px;max-width:66ch}
section{margin:0 0 58px;scroll-margin-top:60px}
.kicker{font-family:Mono;font-size:10px;letter-spacing:.24em;text-transform:uppercase;
  color:var(--faint);margin:0 0 10px}
code{font-family:Mono;font-size:.86em;background:var(--accent-soft);
  padding:1px 5px;border-radius:4px;color:var(--ink)}
strong{color:var(--ink)}
em{color:var(--dim)}
a{color:var(--accent)}
hr{border:0;border-top:1px solid var(--rule);margin:46px 0}

/* ---- the comparison ---- */
.pair{display:grid;grid-template-columns:1fr;gap:18px;margin:22px 0 8px}
@media(min-width:760px){.pair{grid-template-columns:1fr 1fr}}
figure{margin:0}
figure img{display:block;width:100%;height:auto;border-radius:12px;
  border:1px solid var(--rule);box-shadow:0 16px 40px var(--shadow)}
figcaption{font-family:Mono;font-size:10px;letter-spacing:.18em;text-transform:uppercase;
  margin-top:9px;color:var(--faint)}
figcaption b{color:var(--accent);font-weight:400}
.wrong figcaption b{color:var(--dim)}

/* ---- scoreboard ---- */
.board{background:var(--panel);border:1px solid var(--rule);border-radius:14px;
  padding:clamp(18px,4vw,30px);margin:26px 0}
.board .row{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
@media(min-width:620px){.board .row{grid-template-columns:repeat(4,1fr)}}
.stat{border-left:2px solid var(--accent);padding-left:12px}
.stat .n{font-family:Seg;font-size:clamp(28px,7vw,42px);line-height:1;
  color:var(--accent);font-variant-numeric:tabular-nums}
.stat .l{font-family:Mono;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--dim);margin-top:8px;line-height:1.5}
.punch{margin:22px 0 0;padding-top:20px;border-top:1px solid var(--rule);
  font-size:clamp(16px,3.4vw,19px);max-width:58ch}

/* ---- weight chips: deliberately NOT the game's green/amber/red ---- */
.chip{display:inline-block;font-family:Mono;font-size:9px;letter-spacing:.13em;
  text-transform:uppercase;padding:3px 7px;border-radius:999px;border:1px solid;
  white-space:nowrap}
.chip.must{background:var(--accent);border-color:var(--accent);color:#1a0d02}
.chip.should{background:none;border-color:var(--accent);color:var(--accent)}
.chip.could{background:none;border-color:var(--rule);color:var(--dim)}
.chip.live{background:var(--panel2);border-color:var(--rule);color:var(--faint)}
.chip.no,.chip.later{background:none;border-color:var(--rule);color:var(--faint);
  text-decoration:line-through}
.key{display:flex;flex-wrap:wrap;gap:14px;margin:0 0 22px;padding:14px 16px;
  background:var(--panel);border:1px solid var(--rule);border-radius:11px}
.key div{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dim)}

/* ---- tables ---- */
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 0 8px}
table{border-collapse:collapse;width:100%;min-width:520px;font-size:14px}
th{font-family:Mono;font-size:9px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--faint);text-align:left;font-weight:400;padding:0 12px 8px 0;
  border-bottom:1px solid var(--rule)}
td{padding:11px 12px 11px 0;border-bottom:1px solid var(--rule);
  vertical-align:top;color:var(--dim);line-height:1.5}
td strong{color:var(--ink)}
td.id{font-family:Mono;font-size:11px;color:var(--faint);white-space:nowrap;
  padding-right:14px}
td.w{white-space:nowrap;text-align:right;padding-right:0}
tbody tr:last-child td{border-bottom:0}

/* ---- collapsible entry points ---- */
details{border:1px solid var(--rule);border-radius:11px;margin:0 0 10px;
  background:var(--panel);overflow:hidden}
details[open]{background:var(--panel2)}
summary{cursor:pointer;list-style:none;padding:14px 16px;display:flex;
  align-items:center;gap:12px}
summary::-webkit-details-marker{display:none}
summary:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.st{flex:1;font-family:Anton;font-weight:400;text-transform:uppercase;
  font-size:15px;letter-spacing:.02em;line-height:1.15}
summary .n{font-family:Mono;font-size:11px;color:var(--faint);
  font-variant-numeric:tabular-nums}
.mix{display:flex;width:74px;height:6px;border-radius:3px;overflow:hidden;
  background:var(--rule);flex:none}
.mix i{display:block}
.mix i.must{background:var(--accent)}
.mix i.should{background:var(--accent);opacity:.45}
.mix i.could{background:var(--faint);opacity:.5}
.mix i.live,.mix i.no,.mix i.later{background:var(--faint);opacity:.25}
details > p,details > .scroll{padding:0 16px}
details > p:first-of-type{padding-top:2px}
details > .scroll:last-child{padding-bottom:8px}
.listhead{margin-top:8px}
#ruled h3{font-family:Anton;font-weight:400;text-transform:uppercase;
  font-size:clamp(19px,4vw,26px);margin:40px 0 10px;color:var(--accent);
  padding-top:22px;border-top:1px solid var(--rule)}
#ruled h3:first-of-type{border-top:0;padding-top:0;margin-top:14px}
#ruled h4{font-family:Anton;font-weight:400;text-transform:uppercase;
  font-size:16px;letter-spacing:.02em;margin:26px 0 8px}
blockquote{margin:0 0 18px;border-left:3px solid var(--accent);padding-left:16px;
  font-style:italic;color:var(--dim);max-width:60ch}
blockquote strong{color:var(--ink);font-style:normal}

/* ---- the picker (Aaron, 08-10) ---- */
td.pick,th.pick{width:34px;text-align:center;padding-right:0}
td.pick input{width:20px;height:20px;accent-color:var(--accent);cursor:pointer}
tbody tr{cursor:pointer}
tbody tr.picked{background:rgba(245,135,46,.10);box-shadow:inset 3px 0 0 var(--accent)}
#pickbar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:60;
  display:flex;gap:10px;align-items:center;background:#1d1815;border:1px solid var(--accent);
  border-radius:14px;padding:10px 14px;box-shadow:0 8px 30px rgba(0,0,0,.55)}
#pickbar[hidden]{display:none}
#pickn{font-family:Mono;font-size:11px;letter-spacing:.1em;color:var(--ink)}
#pickbar{max-width:94vw}
#pickbar button{white-space:nowrap;font-family:Mono;font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  background:var(--accent);color:#1a0d02;border:0;border-radius:9px;padding:9px 13px;cursor:pointer}
#pickbar button.ghost{background:transparent;color:var(--dim);border:1px solid var(--rule)}

/* ---- decisions ---- */
ol.ask{counter-reset:q;list-style:none;margin:0;padding:0;
  display:flex;flex-direction:column;gap:14px}
ol.ask li{counter-increment:q;background:var(--panel);border:1px solid var(--rule);
  border-left:3px solid var(--accent);border-radius:10px;padding:16px 18px;
  color:var(--dim)}
ol.ask li b{display:block;color:var(--ink);font-size:16px;margin-bottom:5px}
ol.ask li::before{content:counter(q,decimal-leading-zero);font-family:Mono;
  font-size:9.5px;letter-spacing:.2em;color:var(--accent);display:block;
  margin-bottom:8px}
footer{border-top:1px solid var(--rule);padding-top:20px;margin-top:12px;
  font-family:Mono;font-size:10.5px;letter-spacing:.08em;color:var(--faint);
  line-height:2}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
"""

PAGE = """<title>The Coach and the Drills</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>{css}</style>

<header class="wrap">
  <p class="eyebrow">Ball Knowledge · 9 August 2026 · for review · pickable since 10 August: tap rows, then Copy picks</p>
  <h1>The Coach<span class="thin">and the Drills</span></h1>
  <p class="quote">"I need two lists and we need to go over them in great detail
  because <b>I don't want to miss A THING.</b> Everything you can do in the game
  that should be a drill, EVERYTHING. And every single moment in the game when
  the coach should and might appear, broken up by each entry point. Too much is
  better than too little, we can scale back afterwards."</p>
</header>

<nav><div class="wrap"><ul>
  <li><a href="#court">The court</a></li>
  <li><a href="#count">The arithmetic</a></li>
  <li><a href="#one">List one · drills</a></li>
  <li><a href="#two">List two · the coach</a></li>
  <li><a href="#ruled">Ruled</a></li>
  <li><a href="#ask">Your call</a></li>
</ul></div></nav>

<main>

<section id="court" class="bleed">
  <p class="kicker">First, the thing you caught</p>
  <h2>The court lines were very wrong</h2>
  <p>You said it in one sentence without measuring anything, because a person who
  has watched basketball can see a wrong court instantly. The three point line ran
  sideline to sideline in a smooth curve. <strong>The corners are straight.</strong>
  Everybody who has ever stood in a corner knows the corners are straight.</p>

  <div class="pair">
    <figure class="wrong">
      <img src="{before}" alt="The first version of the Gym, with an invented half court">
      <figcaption><b>Before</b> · eleven numbers, none of which could say where they came from</figcaption>
    </figure>
    <figure>
      <img src="{after}" alt="The Gym with a half court drawn to the real dimensions">
      <figcaption><b>After</b> · every line traced to a real measurement</figcaption>
    </figure>
  </div>

  <div>
  <h3>What was actually wrong</h3>
  <div class="scroll"><table>
  <thead><tr><th>line</th><th>what I drew</th><th>what it is</th></tr></thead>
  <tbody>
  <tr><td>The three point arc</td><td>a plain ellipse, sideline to sideline, reaching 36% of the way out</td><td>straight in the corners, 3 ft off the sideline, arcing from 23 ft 9 in, topping out at 61.7%</td></tr>
  <tr><td>The key</td><td>38% of the court's width, 34% deep</td><td>16 ft wide and 19 ft deep, which is 32% and 40.4%</td></tr>
  <tr><td>The free throw circle</td><td>30% wide, floating above the line</td><td>12 ft across, centred ON the line, far half dashed</td></tr>
  <tr><td>The rim</td><td>2.5% from the baseline</td><td>5 ft 3 in, which is 11.2%</td></tr>
  <tr><td>Missing entirely</td><td>backboard, restricted area, centre circle, the block</td><td>all four are on every court in the world</td></tr>
  </tbody></table></div>

  <p>It is now one file, <code>docs/play/assets/halfcourt.svg</code>, whose viewBox
  <em>is</em> the court: 500 by 470 units at a tenth of a foot each. The arc meets
  the corner lines at their exact tangent, 14.198 ft up, which is why the published
  "14 ft" is really 14.2. Every measurement is written into the file. The seven
  stations now sit on real coordinates, and <code>tools/gym-labels.py</code> lays
  every marker and label out as a rectangle and reports overlaps. It found three
  I had already looked at and called fine.</p>

  <p><strong>Deliberately left alone:</strong> the room behind it is still the
  packed arena stand-in, because a gym is the opposite of a packed arena and that
  image has to be sourced. The spec is in V0 under B14. And the game's own board
  still draws its old three-box court, because it sits at low opacity behind a
  rack of cards where nobody counts its lines. It gets this one when the Gym ships.</p>
  </div>
</section>

<section id="count" class="wrap">
  <p class="kicker">Then, the number that changed the plan</p>
  <h2>Seventy-seven</h2>
  <p>I wrote both lists, then wrote the summary line at the top from memory:
  <em>168 moments, 41 of them essential.</em> Then I grepped the file I had
  finished ninety seconds earlier.</p>

  <div class="board">
    <div class="row">
      <div class="stat"><div class="n">{n_dr}</div><div class="l">drill candidates</div></div>
      <div class="stat"><div class="n">{n_cm}</div><div class="l">coach moments · {n_sec} entry points</div></div>
      <div class="stat"><div class="n">{n_must}</div><div class="l">rated MUST</div></div>
      <div class="stat"><div class="n">{n_first}</div><div class="l">MUST on a first game</div></div>
    </div>
    <p class="punch"><strong>{n_first} cards in one twenty minute game is one every
    fifteen seconds.</strong> That is not a coach, that is a hostage situation.</p>
  </div>

  <p>I could have quietly trimmed the list before showing it to you, and that
  would have hidden the actual finding, which is this: <strong>the MUST weight
  failed.</strong> Applied honestly to a game with this many moving parts, "a
  player who misses this does not understand the game" is true of {n_first}
  things, because the game genuinely has that many moving parts. A weight sorts a
  list. It does not cut one.</p>

  <p>So the list stays at full length, which is what you asked for, and the cut
  moves somewhere else entirely:</p>

  <div class="board">
    <p style="margin:0;font-size:clamp(16px,3.6vw,20px);max-width:52ch">
    <strong>No more than twelve coach cards in a first game. Never two in the same
    possession. Anything that does not fit WAITS, it is never dropped.</strong></p>
    <p class="punch">That turns an impossible trimming job into a pleasant one:
    pick the twelve. A moment that never got its turn in game one is still armed
    in game two, so the tips that matter most are the ones that keep recurring.
    The list stops being a script and becomes a priority queue, which is what it
    should have been from the start.</p>
  </div>
</section>

<section id="one" class="wrap">
  <p class="kicker">List one</p>
  <h2>Every drill candidate</h2>
  <p>A drill is not an explanation, it is a sandbox, and <code>coach.js</code>
  says exactly what one is made of: a board position, an action set to allow, and
  a done condition a machine can evaluate. Anything that fails those three is not
  a drill. It is still listed, and it is routed to where it does belong.</p>
  <div class="key">
    <div><span class="chip must">must</span> miss it and you do not understand the game</div>
    <div><span class="chip should">should</span> miss it and you play worse without knowing why</div>
    <div><span class="chip could">could</span> nice, and cuttable</div>
  </div>
  <p style="color:var(--faint);font-size:13px"><strong>Not</strong> green, amber
  and red on purpose. That is the game's difficulty scale, and it already collided
  with the three point line once. Red keeps meaning "this question is hard" and
  nothing else.</p>
  {list_one}
</section>

<section id="two" class="wrap">
  <p class="kicker">List two</p>
  <h2>Every coach moment, by entry point</h2>
  <p>Tap a heading to open it. The bar beside each one is its weight mix, so you
  can see where the pressure is before reading a single row.</p>
  {list_two}
</section>

<section id="ruled" class="wrap">
  <p class="kicker">Answered 9 August</p>
  <h2>Rulings, and the two I explained badly</h2>
  {rulings}
</section>

<section id="ask" class="wrap">
  <p class="kicker">Your call</p>
  <h2>One number, and two questions</h2>
  <p>Three of the original five are ruled and recorded above. What is left is
  mostly a single number, and nothing else in the file is blocked on anything
  else.</p>
  <ol class="ask">
    <li><b>How many times may the Coach interrupt one game?</b> That is the whole
    of the budget question. My guess is twelve, and twelve turns out to be mostly
    things he already says, so the real cost is five or six new lines. Say five
    and the ranking gets brutal. Say twenty and almost nothing has to wait. Either
    is a fine answer.</li>
    <li><b>Is "never two coach cards in the same possession" a rule I can hold you
    to?</b> It is the thing that stops a bad minute from becoming a lecture, and
    it costs one queue and one valve.</li>
    <li><b>What did I get wrong?</b> Anything marked cuttable that you want,
    anything marked essential that you would kill. Cheaper now than after five of
    these are built.</li>
  </ol>
</section>

<footer class="wrap">
The lists live in <code>design/COACH-AND-DRILLS.md</code> and nowhere else · this
page is generated from that file by <code>tools/coach-artifact.py</code>, so the
counts cannot drift apart the way my summary line did<br>
The court is <code>docs/play/assets/halfcourt.svg</code> · the Gym sample is
<code>docs/dev/gym-sample.html</code> · scope is V0 B14, the last item before release
</footer>
</main>

__PICKER__
"""


# Lives OUTSIDE the PAGE template on purpose: PAGE goes through .format(), and
# a script this braceful would need every brace doubled to survive it. The
# page gets it via a plain .replace() after formatting, so the JS reads as JS.
PICKER = """
<div id="pickbar" hidden>
  <span id="pickn">0 picked</span>
  <button id="pickcopy">Copy picks for Claude</button>
  <button id="pickclear" class="ghost">Clear</button>
</div>
<script>
(function(){
  var KEY='bk_coach_picks';
  var bar=document.getElementById('pickbar'),n=document.getElementById('pickn');
  var boxes=[].slice.call(document.querySelectorAll('input[type=checkbox][data-id]'));
  var saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  boxes.forEach(function(b){
    if(saved[b.dataset.id])b.checked=true;
    paintRow(b);
    b.addEventListener('change',function(){paintRow(b);store();paint();});
    /* the whole row is the touch target; a checkbox alone is a phone miss */
    b.closest('tr').addEventListener('click',function(e){
      if(e.target===b||(e.target.closest&&e.target.closest('a')))return;
      b.checked=!b.checked;paintRow(b);store();paint();
    });
  });
  function paintRow(b){b.closest('tr').classList.toggle('picked',b.checked)}
  function picks(){return boxes.filter(function(b){return b.checked})}
  function store(){
    var o={};picks().forEach(function(b){o[b.dataset.id]=1});
    try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}
  }
  function paint(){
    var p=picks();
    bar.hidden=!p.length;
    n.textContent=p.length+' picked';
  }
  document.getElementById('pickclear').addEventListener('click',function(){
    boxes.forEach(function(b){b.checked=false;paintRow(b)});store();paint();
  });
  document.getElementById('pickcopy').addEventListener('click',function(){
    var p=picks();
    var dr=p.filter(function(b){return b.dataset.id.indexOf('DR-')===0});
    var cm=p.filter(function(b){return b.dataset.id.indexOf('CM-')===0});
    var lines=['COACH PICKS \\u00b7 Aaron',
      'IN ('+p.length+' of '+boxes.length+'): drills '+dr.length+' \\u00b7 coach moments '+cm.length,''];
    function block(t,a){ if(!a.length)return;
      lines.push(t+':');
      a.forEach(function(b){lines.push('  '+b.dataset.id+' \\u00b7 '+b.dataset.nm+(b.dataset.w?' \\u00b7 '+b.dataset.w:''))});
      lines.push('');
    }
    block('DRILLS',dr);block('COACH MOMENTS',cm);
    lines.push('Everything not listed: cut or hold. Ask me only if you think a MUST is missing.');
    var txt=lines.join('\\n');
    var btn=this;
    function done(t){btn.textContent=t;setTimeout(function(){btn.textContent='Copy picks for Claude'},1800)}
    if(navigator.clipboard&&navigator.clipboard.writeText)
      navigator.clipboard.writeText(txt).then(function(){done('Copied \\u2713')},
        function(){prompt('Copy this:',txt);done('Copy picks for Claude')});
    else{prompt('Copy this:',txt);done('Copy picks for Claude')}
  });
  paint();
})();
</script>
"""

if __name__ == '__main__':
    SHOTS['before'] = sys.argv[2] if len(sys.argv) > 2 else None
    if not SHOTS['before']:
        sys.exit('usage: coach-artifact.py <out.html> <before.png>')
    main(sys.argv[1])

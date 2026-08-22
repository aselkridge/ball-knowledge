#!/usr/bin/env python3
"""The comparison for list items 4 and 5 (V0 rows 18 and 19), re-judged.

Aaron, 2026-08-22: "Can I see what the solution to 4 and 5 were again? I
don't think I'm happy with the results yet."

Three states, not two, because the answer changed after it shipped:
  BEFORE   d95e527, the build he complained about on 08-19
  FIX      ec552bb, what the fix looked like the day it landed
  TODAY    the working tree, after the row 22 camera raised the court

The third column is the point. The dock the fix built is still there on a
desktop and is a clipped one-line scroller on a phone, and no screenshot from
08-19 could have shown that because the court was half the height then.

  python3 tools/text18-artifact.py     writes design/text18-compare.html
"""
import base64
import pathlib

W = pathlib.Path('design/shots/text18/web')
OUT = pathlib.Path('design/text18-compare.html')


def img(name):
    b = base64.b64encode((W / name).read_bytes()).decode()
    return 'data:image/webp;base64,' + b


PHONES = [
    ('p-before.webp', '08-19, before',
     'Three bordered cards floating with gaps, a mode strip that could not '
     'change all game, and a sentence naming the selected player and his grid '
     'square.'),
    ('p-fix.webp', '08-19, the fix',
     'Strip gone. Banner became a beat that fades after 2.8s. Selection line '
     'retired. The three choices became one grounded panel with hairline '
     'dividers.'),
    ('p-today.webp', '08-22, live',
     'The panel is a one line scroller with two thirds of it off the right '
     'edge. Nothing on screen says there is more to the right.'),
]

ROWS = [
    ('SHOOT', 'out of range · move up', '46', '192', 'fully visible'),
    ('PASS', '4 open · 0 covered', '238', '162', 'clipped at 345'),
    ('MOVE', 'tap a lit tile', '400', '140', 'entirely off screen'),
]

HTML = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rows 18 and 19, Re-Judged</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
:root{
  --ground:#f6f1ea; --panel:#fffdfa; --raise:#efe7dc;
  --ink:#1c1512; --dim:#6d5f55; --line:#e0d5c9;
  --accent:#c25a10; --alarm:#b83c26; --ok:#3f7a4a;
  --shadow:0 1px 2px rgba(60,40,24,.08),0 8px 22px rgba(60,40,24,.07);
  --display:'Oswald',Haettenschweiler,'Arial Narrow',sans-serif;
  --body:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --ground:#0f0c0a; --panel:#191310; --raise:#241b15;
    --ink:#f2ebe4; --dim:#9c8a7d; --line:#372b23;
    --accent:#f5872e; --alarm:#e8654c; --ok:#6fbf82;
    --shadow:0 1px 0 rgba(255,255,255,.03),0 14px 34px rgba(0,0,0,.5);
  }
}
:root[data-theme="dark"]{
  --ground:#0f0c0a; --panel:#191310; --raise:#241b15;
  --ink:#f2ebe4; --dim:#9c8a7d; --line:#372b23;
  --accent:#f5872e; --alarm:#e8654c; --ok:#6fbf82;
  --shadow:0 1px 0 rgba(255,255,255,.03),0 14px 34px rgba(0,0,0,.5);
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:var(--body);font-size:16px;line-height:1.6;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px 96px}

/* the scoreboard rule: two weights of the accent, the game's own device */
.top{border-top:3px solid var(--accent);
  box-shadow:inset 0 3px 0 rgba(0,0,0,.12)}
header{padding:52px 0 40px;border-bottom:1px solid var(--line)}
.eyebrow{font-family:var(--mono);font-size:11px;font-weight:500;
  letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin:0 0 14px}
h1{font-family:var(--display);font-weight:600;font-size:clamp(38px,7vw,62px);
  line-height:.98;letter-spacing:.005em;text-transform:uppercase;
  margin:0 0 20px;text-wrap:balance}
.lede{max-width:64ch;font-size:17px;color:var(--dim);margin:0}
.lede strong{color:var(--ink);font-weight:500}
blockquote{margin:26px 0 0;padding:14px 0 14px 20px;
  border-left:2px solid var(--accent);max-width:60ch}
blockquote p{margin:0;font-size:17px;font-style:italic;color:var(--ink)}
blockquote cite{display:block;margin-top:8px;font-family:var(--mono);
  font-size:11px;font-style:normal;letter-spacing:.1em;
  text-transform:uppercase;color:var(--dim)}

section{padding:56px 0 0}
h2{font-family:var(--display);font-weight:500;font-size:26px;
  letter-spacing:.03em;text-transform:uppercase;margin:0 0 6px}
.sub{margin:0 0 30px;color:var(--dim);max-width:66ch;font-size:15px}

/* three phones, at the shape a phone actually is */
.three{display:grid;gap:22px;grid-template-columns:repeat(3,1fr)}
@media (max-width:820px){.three{grid-template-columns:1fr;max-width:420px}}
.shot{background:var(--panel);border:1px solid var(--line);border-radius:4px;
  box-shadow:var(--shadow);overflow:hidden;display:flex;flex-direction:column}
.shot .cap{display:flex;align-items:baseline;gap:10px;
  padding:12px 14px 11px;border-bottom:1px solid var(--line)}
.when{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.1em;
  text-transform:uppercase;color:var(--dim);white-space:nowrap}
.when.now{color:var(--alarm)}
.frame{position:relative;background:#0d0a08;line-height:0}
.frame img{width:100%;height:auto;display:block}
.note{padding:14px;font-size:13.5px;color:var(--dim);flex:1}

/* THE CLIP MARKER, drawn on the measured rect and nowhere else. The dock sits
   at x45 y741 w300 h31 in a 390x844 frame, so these percentages are that
   rectangle and not a guess. The first version of this was a full-height band
   down the right edge, which was wrong twice over: it implied the whole column
   was cut, and it implied the missing pixels are IN the picture. They are not.
   The strip runs to 493px and the frame stops at 390, so the honest graphic is
   a box around what you can see and an arrow saying the rest is past the edge. */
.clip{position:absolute;left:11.5%;top:87.3%;width:77%;height:4.6%;
  border:1.5px solid var(--alarm);border-radius:2px;
  box-shadow:0 0 0 100vmax rgba(0,0,0,.30)}
.clip::after{content:"";position:absolute;right:-1.5px;top:-1.5px;bottom:-1.5px;
  width:14%;background:repeating-linear-gradient(135deg,
    rgba(232,101,76,.5) 0 4px,rgba(232,101,76,.12) 4px 8px)}
.cliptag{position:absolute;left:11.5%;top:92.6%;
  background:var(--alarm);color:#fff;font-family:var(--mono);font-size:9.5px;
  font-weight:500;letter-spacing:.06em;padding:3px 7px;white-space:nowrap;
  border-radius:2px}

.band{margin-top:22px;display:grid;gap:22px;grid-template-columns:1fr 1fr}
@media (max-width:820px){.band{grid-template-columns:1fr}}

/* the finding */
.alarm{margin-top:34px;background:var(--panel);
  border:1px solid var(--line);border-left:3px solid var(--alarm);
  border-radius:4px;box-shadow:var(--shadow);padding:26px 28px}
.alarm h3{font-family:var(--display);font-weight:500;font-size:21px;
  letter-spacing:.03em;text-transform:uppercase;margin:0 0 4px;color:var(--alarm)}
.alarm .verdict{font-family:var(--mono);font-size:11px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--dim);margin:0 0 18px}
.alarm p{margin:0 0 14px;max-width:70ch;font-size:15px}
.alarm p:last-child{margin-bottom:0}
.scroll{overflow-x:auto;margin:20px 0 4px}
table{border-collapse:collapse;width:100%;min-width:520px;
  font-family:var(--mono);font-size:12.5px;font-variant-numeric:tabular-nums}
th{text-align:left;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
  font-size:10px;color:var(--dim);padding:0 16px 8px 0;
  border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:9px 16px 9px 0;border-bottom:1px solid var(--line);white-space:nowrap}
tr:last-child td{border-bottom:0}
td.k{color:var(--ink);font-weight:500}
td.bad{color:var(--alarm)}
td.good{color:var(--ok)}

.kept{margin-top:34px;display:grid;gap:26px;grid-template-columns:290px 1fr;
  align-items:start}
@media (max-width:820px){.kept{grid-template-columns:1fr;max-width:420px}}
.kept .frame{border:1px solid var(--line);border-radius:4px;overflow:hidden;
  box-shadow:var(--shadow)}
.kept p{margin:0 0 14px;font-size:15px;color:var(--dim);max-width:64ch}
.kept p strong{color:var(--ink);font-weight:500}

.ask{margin-top:56px;padding:30px 0 0;border-top:1px solid var(--line)}
.ask h2{margin-bottom:14px}
ol{margin:0;padding-left:0;list-style:none;counter-reset:q;
  display:grid;gap:14px;max-width:72ch}
ol li{counter-increment:q;position:relative;padding-left:38px;font-size:15.5px}
ol li::before{content:counter(q);position:absolute;left:0;top:1px;
  font-family:var(--mono);font-size:11px;font-weight:500;color:var(--accent);
  border:1px solid var(--line);border-radius:2px;
  width:24px;height:24px;display:grid;place-items:center}
ol li strong{font-weight:500}

footer{margin-top:56px;padding-top:20px;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--dim)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
<div class="top"></div>
<div class="wrap">
<header>
  <p class="eyebrow">List items 4 and 5 &middot; V0 rows 18 and 19</p>
  <h1>Rows 18 and 19,<br>re-judged</h1>
  <p class="lede">You asked to see what the fix for the in-game text was, and
  said you were not happy yet. Here it is in three states rather than two,
  because <strong>the answer changed after it shipped.</strong> The middle
  column is what landed on 08-19. The right column is your site right now,
  after the row 22 camera raised the court, and it is not the same thing.</p>
  <blockquote>
    <p>&ldquo;that top section where it says &lsquo;NBA - first to 11&rsquo; is
    not needed... the banner feels like computer talk that the player is going
    to waste time trying to decipher while it&rsquo;s their turn and they should
    just be playing... they just feel, ehhh, like it could all be organized and
    designed better&rdquo;</p>
    <cite>Aaron, 2026-08-19</cite>
  </blockquote>
</header>

<section>
  <h2>Your turn, on a phone</h2>
  <p class="sub">Same moment in all three: your ball, carrier selected, options
  offered. Real headless shots at 390 &times; 844, reduce-motion on, same
  staging script for each.</p>
  <div class="three">{PHONE_CARDS}</div>

  <div class="alarm">
    <h3>The dock is cut in half on a phone</h3>
    <p class="verdict">Found 08-22 answering this question &middot; FILED as list item 102 &middot; not fixed</p>
    <p>The overlap law says the controls may never cover the board, so when a
    tile would go under the dock it collapses to one swipeable line. The row 22
    camera made the court fill the width of a phone, so that collapse now
    happens on <strong>every turn</strong>, not in the rare case it was written
    for. The line it collapses to needs 493px and gets 298px.</p>
    <div class="scroll"><table>
      <thead><tr><th>Action</th><th>Reads</th><th>Left edge</th><th>Width</th><th>At 390px wide</th></tr></thead>
      <tbody>{ROWS}</tbody>
    </table></div>
    <p>So the third of your three main actions is not on the screen, there is no
    scrollbar on a phone, and nothing about the strip says it continues. On
    desktop the same strip measures 493 of 493 visible, which is why every
    check stayed green and why the shots from 08-19 look fine: the court was
    half this height then, so the dock never had to collapse.</p>
  </div>
</section>

<section>
  <h2>The same moment on a desktop</h2>
  <p class="sub">1280 &times; 860. Here the fix is doing what it was built to do,
  which is worth seeing next to the phone.</p>
  <div class="band">
    <figure class="shot" style="margin:0">
      <figcaption class="cap"><span class="when">08-19, before</span></figcaption>
      <div class="frame"><img src="{D_BEFORE}" alt="Desktop game screen before the fix"></div>
      <p class="note">Mode strip across the top, selection line under it, three
      bordered cards at the bottom.</p>
    </figure>
    <figure class="shot" style="margin:0">
      <figcaption class="cap"><span class="when now">08-22, live</span></figcaption>
      <div class="frame"><img src="{D_TODAY}" alt="Desktop game screen today"></div>
      <p class="note">One line, all three actions readable, 493 of 493 pixels on
      screen. This is the state the fix was measured in.</p>
    </figure>
  </div>
</section>

<section>
  <h2>The half that still works</h2>
  <div class="kept">
    <div class="frame"><img src="{P_FREE}" alt="The free moves dock on a phone"></div>
    <div>
      <p>The <strong>free moves</strong> dock is the same panel, the same
      material, and it holds up at 390px: two full-width rows, hairline divider,
      the count and the door both readable. It has less to say, so it never has
      to collapse.</p>
      <p>Which points at the fix. The action dock is not badly designed, it is
      <strong>too wide for one line</strong> and one line is the only shape the
      overlap law leaves it. Either the content gets shorter, or the panel gets
      to be two rows again and the court gives back the band, which is the third
      escape row 22 already built and this path does not currently use.</p>
    </div>
  </div>
</section>

<section class="ask">
  <h2>What I need from you</h2>
  <p class="sub">I have not built any of these. Nothing changes until you pick.</p>
  <ol>
    <li><strong>The clipping is a bug and I will fix it regardless.</strong>
    That is not a taste question. But the shape it lands in is: do you want the
    dock to stay one line and lose the descriptions, or go back to stacked rows
    and let the court shrink by about 60px on a phone?</li>
    <li><strong>Is the 08-19 direction itself right?</strong> Strip gone, banner
    as a fading beat, no selection line. If the answer is no, say which of the
    three you want back and I will put options next to each other before I
    touch anything.</li>
    <li><strong>The banner is still a box over the court.</strong> It fades after
    2.8s, but it sits on top of the floor while it is up. I left it alone in the
    fix. If it bothers you, it is its own job.</li>
  </ol>
</section>

<footer>
  Real headless shots &middot; Chromium 390&times;844 and 1280&times;860 &middot;
  reduce-motion on &middot; BEFORE d95e527 &middot; FIX ec552bb &middot;
  TODAY working tree at 57ad094
</footer>
</div>
"""


def build():
    cards = []
    for i, (fn, when, note) in enumerate(PHONES):
        last = i == len(PHONES) - 1
        overlay = ('<div class="clip"></div>'
                   '<div class="cliptag">300px shown &middot; 193px past the edge</div>') if last else ''
        cards.append(
            '<figure class="shot" style="margin:0">'
            f'<figcaption class="cap"><span class="when{" now" if last else ""}">{when}</span></figcaption>'
            f'<div class="frame"><img src="{img(fn)}" alt="{when}">{overlay}</div>'
            f'<p class="note">{note}</p></figure>')

    rows = []
    for k, reads, x, w, state in ROWS:
        cls = 'good' if 'fully' in state else 'bad'
        rows.append(f'<tr><td class="k">{k}</td><td>{reads}</td>'
                    f'<td>{x}px</td><td>{w}px</td><td class="{cls}">{state}</td></tr>')

    html = (HTML
            .replace('{PHONE_CARDS}', ''.join(cards))
            .replace('{ROWS}', ''.join(rows))
            .replace('{D_BEFORE}', img('d-before.webp'))
            .replace('{D_TODAY}', img('d-today.webp'))
            .replace('{P_FREE}', img('p-free.webp')))
    OUT.write_text(html)
    kb = OUT.stat().st_size // 1024
    print(f'{OUT}  {kb}KB')


if __name__ == '__main__':
    build()

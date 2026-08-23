#!/usr/bin/env python3
"""THE COACH CORNER: the coach button under the shot clock, and the music
button where it already lives.

Aaron, 2026-08-22. Options built, nothing picked, nothing shipped.

  node tools/coach-shots.mjs && python3 tools/coach-artifact.py
"""
import base64
import pathlib

W = pathlib.Path('design/shots/coach/web')
OUT = pathlib.Path('design/coach-board.html')


def img(n):
    return 'data:image/webp;base64,' + base64.b64encode((W / n).read_bytes()).decode()


HTML = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Coach Corner</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
:root{
  --ground:#f6f1ea; --panel:#fffdfa; --sunk:#efe7dc;
  --ink:#1c1512; --dim:#6d5f55; --line:#e0d5c9;
  --accent:#c25a10; --alarm:#b83c26; --ok:#3f7a4a;
  --shadow:0 1px 2px rgba(60,40,24,.07),0 8px 22px rgba(60,40,24,.06);
  --display:'Oswald',Haettenschweiler,'Arial Narrow',sans-serif;
  --body:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ground:#0f0c0a; --panel:#191310; --sunk:#231a14;
  --ink:#f2ebe4; --dim:#9c8a7d; --line:#372b23;
  --accent:#f5872e; --alarm:#e8654c; --ok:#6fbf82;
  --shadow:0 1px 0 rgba(255,255,255,.03),0 14px 34px rgba(0,0,0,.5);
}}
:root[data-theme="dark"]{
  --ground:#0f0c0a; --panel:#191310; --sunk:#231a14;
  --ink:#f2ebe4; --dim:#9c8a7d; --line:#372b23;
  --accent:#f5872e; --alarm:#e8654c; --ok:#6fbf82;
  --shadow:0 1px 0 rgba(255,255,255,.03),0 14px 34px rgba(0,0,0,.5);
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--body);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:1000px;margin:0 auto;padding:0 24px 100px}
.top{border-top:3px solid var(--accent)}
header{padding:54px 0 38px;border-bottom:1px solid var(--line)}
.eyebrow{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.18em;
  text-transform:uppercase;color:var(--accent);margin:0 0 14px}
h1{font-family:var(--display);font-weight:600;font-size:clamp(36px,6.4vw,58px);
  line-height:.98;text-transform:uppercase;margin:0 0 18px;text-wrap:balance}
.lede{max-width:62ch;font-size:17px;color:var(--dim);margin:0}
.lede strong{color:var(--ink);font-weight:500}
section{padding:50px 0 0}
h2{font-family:var(--display);font-weight:500;font-size:26px;letter-spacing:.03em;
  text-transform:uppercase;margin:0 0 6px}
.sub{margin:0 0 26px;color:var(--dim);max-width:66ch;font-size:15px}

/* an option: the HUD at the width it is really seen, 390px */
.opt{margin-top:26px;background:var(--panel);border:1px solid var(--line);
  border-radius:5px;box-shadow:var(--shadow);overflow:hidden}
.opt.pick{border-color:var(--accent)}
.ohead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;
  padding:15px 20px 13px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.oname{font-family:var(--display);font-weight:500;font-size:19px;letter-spacing:.02em}
.otag{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:2px 7px}
.strips{padding:20px;display:grid;gap:16px;justify-items:center}
.strip{width:390px;max-width:100%}
.strip img{width:100%;height:auto;display:block;border-radius:3px}
.slab{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--dim);margin:0 0 6px}
.slab b{color:var(--ink);font-weight:500}
.onote{padding:0 20px 20px;font-size:14px;color:var(--dim);max-width:70ch}
.onote b{color:var(--ink);font-weight:500}

.scroll{overflow-x:auto;margin-top:10px}
table{border-collapse:collapse;width:100%;min-width:520px;font-family:var(--mono);
  font-size:12.5px;font-variant-numeric:tabular-nums}
th{text-align:left;font-weight:500;letter-spacing:.1em;text-transform:uppercase;font-size:9.5px;
  color:var(--dim);padding:0 16px 8px 0;border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:9px 16px 9px 0;border-bottom:1px solid var(--line);white-space:nowrap}
tr:last-child td{border-bottom:0}
td.k{font-weight:500} td.bad{color:var(--alarm)} td.ok{color:var(--ok)}

.rec{margin-top:34px;background:var(--panel);border:1px solid var(--line);
  border-left:3px solid var(--accent);border-radius:4px;padding:24px 26px}
.rec h3{font-family:var(--display);font-weight:500;font-size:20px;letter-spacing:.02em;
  text-transform:uppercase;margin:0 0 12px}
.rec p{margin:0 0 13px;font-size:15px;max-width:70ch}
.rec p:last-child{margin-bottom:0}
.rec b{font-weight:500}
.ask{margin-top:30px;padding-top:26px;border-top:1px solid var(--line)}
ol{margin:0;padding-left:0;list-style:none;counter-reset:q;display:grid;gap:13px;max-width:70ch}
ol li{counter-increment:q;position:relative;padding-left:36px;font-size:15px}
ol li::before{content:counter(q);position:absolute;left:0;top:1px;font-family:var(--mono);
  font-size:11px;color:var(--accent);border:1px solid var(--line);border-radius:2px;
  width:24px;height:24px;display:grid;place-items:center}
footer{margin-top:52px;padding-top:20px;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:11px;letter-spacing:.05em;color:var(--dim)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
<div class="top"></div>
<div class="wrap">
<header>
  <p class="eyebrow">Item 103 &middot; the HUD &middot; the two corners</p>
  <h1>The coach<br>corner</h1>
  <p class="lede">The coach button where you put it: <strong>top right, under
  the shot clock, outside the HUD</strong>. Both icons you named, both states,
  and the ask itself. The music button is in every frame, exactly where it is
  today, so you can judge the pair rather than one corner at a time.
  <strong>Nothing shipped.</strong></p>
</header>

<section>
  <h2>First, the whistle answer</h2>
  <p class="sub">You said question mark <em>or</em> the coach icon. I tried a
  third, because the coach already has a whistle in the sound design, and it
  did not work. Four whistle glyphs drawn and rendered at 19px, the size this
  button ships at: <b>two read as a keyhole, one as a padlock, one as a
  squiggle.</b> A whistle needs more pixels than this button has. Two goes is
  my stopping rule, so it is your two options below and not three.</p>
</section>

<section>
  <h2>As it is now</h2>
  <div class="opt">
    <div class="ohead"><span class="oname">Shipped</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Nothing under the shot clock &middot; music at
        <b>328, 782, 52&times;52</b></p>
      <img src="{NOW}" alt="The game as it is now"></div></div>
    <p class="onote">The coach today is a bell in the left rail, behind the
    hamburger, which is two taps and on the opposite side of the screen from
    where you are looking.</p>
  </div>
</section>

<section>
  <h2>A &middot; the question mark</h2>
  <div class="opt">
    <div class="ohead"><span class="oname">Resting</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Quiet: same dark panel as the music button, no glow</p>
      <img src="{ASK}" alt="Question mark, resting"></div></div>
  </div>
  <div class="opt">
    <div class="ohead"><span class="oname">The coach has something</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Lit: the same orange, border and glow as the replay button</p>
      <img src="{ASK_LIVE}" alt="Question mark, lit"></div></div>
    <p class="onote">One vocabulary for &ldquo;this is worth a tap&rdquo; across
    the whole screen, so a player learns it once. The values are copied from
    the existing lit-button rule rather than a second orange being invented.</p>
  </div>
</section>

<section>
  <h2>B &middot; the coach bell</h2>
  <div class="opt">
    <div class="ohead"><span class="oname">Resting, then lit</span></div>
    <div class="strips">
      <div class="strip"><p class="slab">Resting</p>
        <img src="{BELL}" alt="Bell, resting"></div>
      <div class="strip"><p class="slab">Lit</p>
        <img src="{BELL_LIVE}" alt="Bell, lit"></div>
    </div>
    <p class="onote">The bell is what the coach toggle already uses, so it
    carries continuity from the settings and the left rail. Against it: a bell
    means <em>notifications</em> to anyone who has used a phone, and a lit bell
    reads as &ldquo;you have unread things&rdquo; rather than &ldquo;want a
    hand?&rdquo;</p>
  </div>
</section>

<section>
  <h2>The thing I found measuring</h2>
  <p class="sub">The two corners are not a pair, and they are close enough that
  the difference reads as a mistake rather than a choice.</p>
  <div class="scroll"><table>
    <thead><tr><th>Button</th><th>Size</th><th>Right inset</th><th>Top / bottom inset</th></tr></thead>
    <tbody>
      <tr><td class="k">Music, shipped</td><td>52 &times; 52</td><td>10px</td><td>10px from the bottom</td></tr>
      <tr><td class="k">Coach, as first drawn</td><td>44 &times; 44</td><td class="bad">14px</td><td class="bad">12px below the HUD</td></tr>
      <tr><td class="k">Coach, matched</td><td class="ok">52 &times; 52</td><td class="ok">10px</td><td class="ok">10px below the HUD</td></tr>
    </tbody>
  </table></div>
  <div class="opt pick">
    <div class="ohead"><span class="oname">Matched to the music button</span>
      <span class="otag">my recommendation</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Coach at <b>328, 58, 52&times;52</b> &middot; music at
        <b>328, 782, 52&times;52</b> &middot; same column, same size</p>
      <img src="{MATCH}" alt="Coach matched to the music button"></div></div>
    <p class="onote">Same x, same width, same inset. Two round dark buttons
    holding the top and bottom of the same right-hand column, which is a
    deliberate frame rather than two things that happen to be near each other.</p>
  </div>
</section>

<section>
  <h2>The ask, and a collision</h2>
  <div class="opt">
    <div class="ohead"><span class="oname">Tapped</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Measured: the panel <b>overlaps the banner</b> on a phone</p>
      <img src="{POP}" alt="The coach ask, overlapping the banner"></div></div>
    <p class="onote"><b>This is a real collision and I am showing it rather
    than quietly moving it,</b> because it is the same shape as the setup
    carousel printing over the turn tray. On a phone the ask panel lands on top
    of the banner. On desktop there is room and it does not. Three ways out and
    none of them is chosen: the ask replaces the banner instead of covering it,
    since only one of them can be the most important sentence on screen · the
    ask opens downward from the button as a narrow column that clears the
    banner &middot; the ask waits for the banner to finish its 2.8 seconds and
    fades in after.</p>
  </div>
  <p class="sub" style="margin-top:22px">The wording is a first draft, not a
  ruling: <b>&ldquo;Need a hand with this one?&rdquo;</b> with YES and NOT NOW.
  Two taps to the answer, and nothing to read if you do not want it.</p>
</section>

<section>
  <h2>On the music button</h2>
  <div class="rec">
    <h3>You are right, and here is the argument</h3>
    <p><b>Leave it exactly where it is.</b> Continuity is the smaller half of
    the reason. The bigger half: it is the only control on this screen that has
    nothing to do with the turn. Everything else you tap changes the game.
    Music does not, and a control that does nothing to the game belongs
    furthest from the ones that do.</p>
    <p>Putting the coach diagonally opposite makes that split visible: <b>top
    right is the game asking if you need help, bottom right is the room.</b>
    Two corners, two different jobs, and neither near the board or the dock.</p>
    <p><b>The one thing I would change eventually,</b> and not now: the music
    button is the brightest object on the screen at rest, with a full orange
    ring, while the coach is asked to be quiet until it has something. If both
    are going to live in that column they should agree about how loud a resting
    control is. That is a separate look and a separate render.</p>
  </div>
  <div class="ask">
    <h2>What I need from you</h2>
    <ol>
      <li><b>Question mark or bell.</b></li>
      <li><b>Matched at 52px, or the smaller 44px</b> so the coach is quieter
      than the music button.</li>
      <li><b>How the ask clears the banner:</b> replace it, open downward, or
      wait for it.</li>
      <li><b>Does it also activate the coach for the rest of the game</b>, or
      is it one answer for this moment only? You said &ldquo;activates the coach
      or at least pops up&rdquo;, which are two different features.</li>
    </ol>
  </div>
</section>

<footer>
  Real renders, variants injected in flight, repo untouched &middot;
  tools/coach-shots.mjs &middot; 390&times;844 and 1280&times;860 &middot;
  every position measured, collisions asserted &middot; 2026-08-22
</footer>
</div>
"""


def build():
    html = (HTML
            .replace('{NOW}', img('p-now.webp'))
            .replace('{ASK}', img('p-ask.webp'))
            .replace('{ASK_LIVE}', img('p-ask-live.webp'))
            .replace('{BELL}', img('p-bell.webp'))
            .replace('{BELL_LIVE}', img('p-bell-live.webp'))
            .replace('{MATCH}', img('p-ask-match.webp'))
            .replace('{POP}', img('p-ask-pop.webp')))
    OUT.write_text(html)
    print(f'{OUT}  {OUT.stat().st_size // 1024}KB')


if __name__ == '__main__':
    build()

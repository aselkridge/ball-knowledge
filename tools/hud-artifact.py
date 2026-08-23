#!/usr/bin/env python3
"""HUD OPTION BOARD: pause as a symbol or as the word, replay beside it.

Aaron, 2026-08-22, opening the gameplay redesign. Options built, nothing
picked, nothing shipped.

  node tools/hud-shots.mjs && python3 tools/hud-artifact.py
"""
import base64
import pathlib

W = pathlib.Path('design/shots/hud/web')
OUT = pathlib.Path('design/hud-board.html')


def img(n):
    return 'data:image/webp;base64,' + base64.b64encode((W / n).read_bytes()).decode()


HTML = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pause And Replay, Up Top</title>
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
  <p class="eyebrow">Item 103 &middot; the HUD &middot; round two</p>
  <h1>Pause and replay,<br>up top</h1>
  <p class="lede">You picked <strong>A, the symbol</strong>, and caught two
  things: the pause button collides with the edge of the HUD, and the desktop
  buttons are far too small for the space. Both are fixed here as options
  rather than as one answer. <strong>Still nothing shipped.</strong></p>
</header>

<section>
  <h2>The edge, on a phone</h2>
  <p class="sub">You were right, and the reason is that the dock is in the
  wrong box. Sampling a line across the scoreboard art finds the dark left
  panel: a bright bevel from 0.78% to 1.86% of the art width, then the dark
  interior from <b>1.95% to 26.95%</b>. The shipped dock is left 1.8%, width
  25.5%, so it <b>starts before the panel does</b> and ends past it. At 390px
  the button lands 1.4px inside the interior with the bevel highlight right
  beside it.</p>
  <div class="opt">
    <div class="ohead"><span class="oname">Where it was</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Dock at 1.8% &middot; button left edge at <b>9px</b></p>
      <img src="{P_R1}" alt="Round one, colliding with the edge"></div></div>
  </div>
  <div class="opt">
    <div class="ohead"><span class="oname">Tight</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Dock at 2.6% &middot; button left edge at <b>10px</b>
        &middot; about 3px clear of the bevel</p>
      <img src="{P_TIGHT}" alt="Tight inset"></div></div>
  </div>
  <div class="opt pick">
    <div class="ohead"><span class="oname">Roomy</span>
      <span class="otag">my recommendation</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Dock at 3.4% &middot; button left edge at <b>13px</b>
        &middot; about 6px clear, and centred in the panel</p>
      <img src="{P_ROOMY}" alt="Roomy inset"></div></div>
    <p class="onote">The dock is now centred on the panel interior rather than
    pinned to its left, so the pair sits in the middle of the dark area at any
    width instead of drifting as the screen changes.</p>
  </div>
</section>

<section>
  <h2>The size, on a desktop</h2>
  <p class="sub">One number causes it. The shipped rule is
  <code>clamp(30px, 4.4cqw, 34px)</code>, and <code>cqw</code> is a share of
  the HUD width, so at 1280 it wants 56px and the <b>34px ceiling throws that
  away</b>. Raising only the ceiling leaves the phone sitting on its 30px
  floor. That is proved rather than assumed: the phone was re-shot for every
  desktop size below and measures <b>30px in all three</b>.</p>
  <div class="opt">
    <div class="ohead"><span class="oname">Where it was &middot; 34px</span></div>
    <div class="strips"><div class="strip" style="width:100%">
      <img src="{D_R1}" alt="Desktop, 34px"></div></div>
  </div>
  <div class="opt">
    <div class="ohead"><span class="oname">56px</span>
      <span class="otag" style="border-color:var(--line);color:var(--dim)">the clamp&rsquo;s own answer</span></div>
    <div class="strips"><div class="strip" style="width:100%">
      <img src="{D_56}" alt="Desktop, 56px"></div></div>
    <p class="onote">What <code>4.4cqw</code> already asks for at 1280, just
    uncapped. 53% of the dock&rsquo;s 105px height.</p>
  </div>
  <div class="opt pick">
    <div class="ohead"><span class="oname">64px</span>
      <span class="otag">my recommendation</span></div>
    <div class="strips"><div class="strip" style="width:100%">
      <img src="{D_64}" alt="Desktop, 64px"></div></div>
    <p class="onote">61% of the dock height, which puts the buttons on the same
    visual weight as the HOME and AWAY plates beside them. The corner radius
    and the icon scale with the button rather than staying at the phone value,
    so a 64px button does not read as a 30px button that got stretched.</p>
  </div>
  <div class="opt">
    <div class="ohead"><span class="oname">72px</span></div>
    <div class="strips"><div class="strip" style="width:100%">
      <img src="{D_72}" alt="Desktop, 72px"></div></div>
    <p class="onote">69% of the dock height. Confident, and starting to compete
    with the score for attention rather than sitting beside it.</p>
  </div>
  <div class="opt">
    <div class="ohead"><span class="oname">64px &middot; replay spent</span></div>
    <div class="strips"><div class="strip" style="width:100%">
      <img src="{D_OFF}" alt="Desktop, 64px, replay spent"></div></div>
    <p class="onote">The state you asked about, at the bigger size. Worth a look
    here because a dim treatment that reads clearly at 30px can look washed out
    when the button is twice as big.</p>
  </div>

  <div class="scroll"><table>
    <thead><tr><th>Desktop size</th><th>Button</th><th>Of the 105px dock</th>
      <th>Phone button</th><th>Phone unchanged</th></tr></thead>
    <tbody>
      <tr><td class="k">Shipped</td><td>34px</td><td>32%</td><td>30px</td><td class="ok">baseline</td></tr>
      <tr><td class="k">56px</td><td>56px</td><td>53%</td><td>30px</td><td class="ok">yes, measured</td></tr>
      <tr><td class="k">64px</td><td>64px</td><td>61%</td><td>30px</td><td class="ok">yes, measured</td></tr>
      <tr><td class="k">72px</td><td>72px</td><td>69%</td><td>30px</td><td class="ok">yes, measured</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <div class="rec">
    <h3>What I would ship</h3>
    <p><b>Roomy inset, 64px on desktop.</b> The inset is not really a taste
    call once the panel is measured: the button belongs inside the box, and
    roomy is the one that centres it. The size is a taste call, and 64 is where
    the buttons stop looking like an afterthought and start looking like part
    of the board, without pulling the eye off the score.</p>
    <p><b>What this does not touch:</b> the phone, deliberately. Every desktop
    size above leaves it at 30px because the change is to the clamp&rsquo;s
    ceiling only. If you want the phone buttons bigger too that is a separate
    call and a separate render, since 30px is already the raised floor from
    August and going further eats the dock&rsquo;s spare 32px.</p>
  </div>
  <div class="ask">
    <h2>What I need from you</h2>
    <ol>
      <li><b>Tight or roomy</b> on the phone edge.</li>
      <li><b>56, 64 or 72</b> on desktop.</li>
      <li><b>Does the spent replay still read at 64px</b>, or does it need to be
      dimmer now that there is more of it?</li>
    </ol>
  </div>
</section>

<footer>
  Real renders, variants injected in flight, repo untouched &middot;
  tools/hud-shots.mjs &middot; 390&times;844 at 3x and 1280&times;860 &middot;
  panel edges sampled from hud-n7.webp &middot; 2026-08-22
</footer>
</div>
"""


def build():
    html = (HTML
            .replace('{P_R1}', img('p2-r1.webp'))
            .replace('{P_TIGHT}', img('p2-inset-tight.webp'))
            .replace('{P_ROOMY}', img('p2-inset-roomy.webp'))
            .replace('{D_R1}', img('d2-r1.webp'))
            .replace('{D_56}', img('d2-size-56.webp'))
            .replace('{D_64}', img('d2-size-64.webp'))
            .replace('{D_72}', img('d2-size-72.webp'))
            .replace('{D_OFF}', img('d2-size-64-off.webp')))
    OUT.write_text(html)
    print(f'{OUT}  {OUT.stat().st_size // 1024}KB')


if __name__ == '__main__':
    build()

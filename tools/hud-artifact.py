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
  <p class="eyebrow">Item 103 &middot; the gameplay rebuild &middot; the HUD</p>
  <h1>Pause and replay,<br>up top</h1>
  <p class="lede">Both pause treatments you asked for, with the replay button
  beside each one and both of its states. Real renders of the real scoreboard,
  shown at <strong>390px, the width a phone actually shows them at</strong>.
  Nothing is shipped and nothing is picked.</p>
</header>

<section>
  <h2>Where it is now</h2>
  <p class="sub">One button in the scoreboard, a hamburger, which opens a rail
  of five down the left edge of the court. Pause is inside that rail.</p>
  <div class="opt">
    <div class="ohead"><span class="oname">Shipped</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Live build &middot; 390 &times; 844</p>
      <img src="{NOW}" alt="The shipped HUD"></div></div>
    <p class="onote">65px of the 99px dock used, and the one control it shows is
    a menu rather than an action. Pause is two taps away.</p>
  </div>
</section>

<section>
  <h2>A &middot; the pause symbol</h2>
  <div class="opt">
    <div class="ohead"><span class="oname">Symbol + replay</span>
      <span class="otag">my recommendation</span></div>
    <div class="strips">
      <div class="strip"><p class="slab"><b>Replay available</b> &middot; orange, lit border, soft glow</p>
        <img src="{ICON_ON}" alt="Pause symbol with replay available"></div>
      <div class="strip"><p class="slab"><b>Replay spent</b> &middot; dim ink, no border light, no glow</p>
        <img src="{ICON_OFF}" alt="Pause symbol with replay unavailable"></div>
    </div>
    <p class="onote">67px of 99 used, <b>32px spare</b>. Two 30px buttons, both
    already carrying the invisible 44px tap target the HUD has used since
    August. The pause bars are filled rather than stroked: two 2.1px strokes
    read as hairlines at 19px.</p>
  </div>
</section>

<section>
  <h2>B &middot; the word</h2>
  <div class="opt">
    <div class="ohead"><span class="oname">PAUSE + replay</span></div>
    <div class="strips">
      <div class="strip"><p class="slab"><b>Replay available</b></p>
        <img src="{WORD_ON}" alt="The word PAUSE with replay available"></div>
      <div class="strip"><p class="slab"><b>Replay spent</b></p>
        <img src="{WORD_OFF}" alt="The word PAUSE with replay unavailable"></div>
    </div>
    <p class="onote">89px of 99 used, <b>10px spare</b>. The word is 52px wide
    against the symbol&rsquo;s 30px, and it is unmistakable: nobody has to know
    what two bars mean. It also sits in the same mono the scoreboard already
    uses, so it reads as part of the board rather than as an app control.</p>
  </div>
</section>

<section>
  <h2>The thing the measurement decided</h2>
  <p class="sub">I built a third variant to find out whether a spare slot
  survives either choice. It does not, and that is the real trade.</p>
  <div class="opt">
    <div class="ohead"><span class="oname">A+ &middot; symbol, replay, and one more</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Three controls in a 99px dock</p>
      <img src="{ICON3}" alt="Three controls in the dock"></div></div>
    <p class="onote">102px of content in a 99px dock. It <b>fits the artwork</b>,
    because the dark panel painted on the scoreboard is wider than the box the
    buttons live in, but it is 3px past that box and there is no room for a
    fourth. So the dock holds <b>two controls comfortably, three at a squeeze,
    and never four.</b> Music, help and the coach toggle have to live somewhere,
    and today they live in the left rail. That question is open, not answered
    here.</p>
  </div>

  <div class="scroll"><table>
    <thead><tr><th>Layout</th><th>Pause width</th><th>Total used</th>
      <th>Of 99px dock</th><th>Spare</th><th>Room for a third</th></tr></thead>
    <tbody>
      <tr><td class="k">Shipped (menu only)</td><td>30px</td><td>65px</td><td>66%</td><td>34px</td><td class="ok">yes</td></tr>
      <tr><td class="k">A &middot; symbol</td><td>30px</td><td>67px</td><td>68%</td><td>32px</td><td class="ok">just</td></tr>
      <tr><td class="k">B &middot; the word</td><td>52px</td><td>89px</td><td>90%</td><td>10px</td><td class="bad">no</td></tr>
      <tr><td class="k">A+ &middot; three up</td><td>30px</td><td>102px</td><td>103%</td><td class="bad">over by 3px</td><td class="bad">full</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Desktop, where space is not the question</h2>
  <p class="sub">The dock is 326px wide at 1280, so both layouts are comfortable
  and the choice is purely taste.</p>
  <div class="opt"><div class="strips">
    <div class="strip" style="width:100%"><p class="slab">A &middot; symbol</p>
      <img src="{D_ICON}" alt="Desktop, symbol"></div>
    <div class="strip" style="width:100%"><p class="slab">B &middot; the word</p>
      <img src="{D_WORD}" alt="Desktop, word"></div>
  </div></div>
</section>

<section>
  <div class="rec">
    <h3>What I would pick, and why</h3>
    <p><b>A, the symbol</b>, for one reason that is not about the symbol: it
    leaves 32px, and this screen has five other controls with nowhere good to
    live. The pause glyph is as universal as a symbol gets, it is in every video
    player and every game, and it will never need translating.</p>
    <p><b>The case against my own pick:</b> a word cannot be misread, this is a
    game people will play once and put down, and the scoreboard mono makes PAUSE
    look like it was printed on the board rather than stuck on top of it. If you
    decide the other five controls belong in a menu behind one button anyway,
    the 32px stops mattering and B is the better looking of the two.</p>
    <p><b>On the replay states,</b> the available look copies the values of the
    existing lit-button rule in the game rather than inventing a second orange,
    so the two move together if that orange is ever retuned. The spent look
    dims the ink and drops the border light and the glow, but does <em>not</em>
    fade the whole button, which would make the scoreboard look damaged instead
    of the control look used.</p>
  </div>

  <div class="ask">
    <h2>What I need from you</h2>
    <ol>
      <li><b>A or B.</b></li>
      <li><b>Is the spent replay dim enough, or too dim?</b> It is currently
      readable but clearly off. It could go further, to nearly invisible, or
      less far, to merely unlit.</li>
      <li><b>Where do music, help and the coach toggle go?</b> They are the five
      minus two. The left rail they use today is one of the things you called
      cramped, so leaving them there is not really an answer.</li>
    </ol>
  </div>
</section>

<footer>
  Real renders, variants injected in flight, repo untouched &middot;
  tools/hud-shots.mjs &middot; 390&times;844 at 3x and 1280&times;860 &middot;
  reduce-motion on &middot; 2026-08-22
</footer>
</div>
"""


def build():
    html = (HTML
            .replace('{NOW}', img('p-now.webp'))
            .replace('{ICON_ON}', img('p-icon-on.webp'))
            .replace('{ICON_OFF}', img('p-icon-off.webp'))
            .replace('{WORD_ON}', img('p-word-on.webp'))
            .replace('{WORD_OFF}', img('p-word-off.webp'))
            .replace('{ICON3}', img('p-icon3-on.webp'))
            .replace('{D_ICON}', img('d-icon-on.webp'))
            .replace('{D_WORD}', img('d-word-on.webp')))
    OUT.write_text(html)
    print(f'{OUT}  {OUT.stat().st_size // 1024}KB')


if __name__ == '__main__':
    build()

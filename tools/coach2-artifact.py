#!/usr/bin/env python3
"""WHERE THE COACH STANDS: bottom left, or in the pause menu.

Aaron, 2026-08-22. Options built, nothing picked, nothing shipped.

  node tools/coach2-shots.mjs && python3 tools/coach2-artifact.py
"""
import base64
import pathlib

W = pathlib.Path('design/shots/coach2/web')
OUT = pathlib.Path('design/coach2-board.html')


def img(n):
    return 'data:image/webp;base64,' + base64.b64encode((W / n).read_bytes()).decode()


HTML = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Where The Coach Stands</title>
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

.two{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:24px}
@media (max-width:820px){.two{grid-template-columns:1fr;max-width:420px}}
.wide{margin-top:22px;background:var(--panel);border:1px solid var(--line);
  border-radius:5px;box-shadow:var(--shadow);overflow:hidden;padding:20px}
.wide img{width:390px;max-width:100%;display:block;margin:0 auto;border-radius:3px}
.q{margin-top:34px;background:var(--panel);border:1px solid var(--line);
  border-left:3px solid var(--know);border-radius:4px;padding:24px 26px}
.q h3{font-family:var(--display);font-weight:500;font-size:20px;letter-spacing:.02em;
  text-transform:uppercase;margin:0 0 12px;color:var(--know)}
.q p{margin:0 0 13px;font-size:15px;max-width:70ch}
.q p:last-child{margin-bottom:0}
.q b{font-weight:500}
</style>
<div class="top"></div>
<div class="wrap">
<header>
  <p class="eyebrow">Item 103 &middot; the HUD &middot; where the coach stands</p>
  <h1>Where the<br>coach stands</h1>
  <p class="lede">Both placements you named, with the icon you named: <strong>the
  guy who already pops up.</strong> Nothing shipped.</p>
</header>

<section>
  <h2>The icon was already made</h2>
  <p class="sub">You called him &ldquo;the guy who pops up when a coach hint
  appears&rdquo;, and that is <code>assets/brand/philosopher.png</code>: a
  classical bust with a raised finger on an orange disc. He is already on the
  coach card at 34, 46 and 56px, and already loaded on this screen. That is
  better than the question mark or the bell from the last round, and it is
  the third answer to the medium question. Both placements below use him.</p>
</section>

<section>
  <h2>A &middot; bottom left, opposite the music</h2>
  <div class="wide">
    <p class="slab">The two corners, at real size &middot; resting, then when he has something</p>
    <img src="{CORNERS_REST}" alt="Both corners, coach resting" style="margin-bottom:10px">
    <img src="{CORNERS}" alt="Both corners, coach lit">
  </div>
  <div class="two">
    <div class="opt" style="margin:0">
      <div class="ohead"><span class="oname">Resting</span></div>
      <div class="strips"><div class="strip"><img src="{BL_REST}" alt="Resting"></div></div>
      <p class="onote">Dimmed portrait, grey ring. Quieter than the music
      button on purpose: music is always doing something, the coach usually is
      not.</p>
    </div>
    <div class="opt" style="margin:0">
      <div class="ohead"><span class="oname">He has something</span></div>
      <div class="strips"><div class="strip"><img src="{BL_LIVE}" alt="Lit"></div></div>
      <p class="onote">Full colour, lit ring. Same orange as the replay button
      and the music ring, so &ldquo;worth a tap&rdquo; is one vocabulary across
      the screen.</p>
    </div>
  </div>
  <p class="sub" style="margin-top:18px"><b>Measured:</b> 52 &times; 52 at a
  10px inset, exactly mirroring the music button, so the corners are a
  deliberate pair rather than nearly one. It overlaps the bottom instruction
  line, <b>and so does the music button already</b> at the same y band, so that
  is a condition of that strip rather than something the coach introduces.</p>
</section>

<section>
  <h2>B &middot; in the pause menu, left of the score</h2>
  <div class="two">
    <div class="opt" style="margin:0">
      <div class="ohead"><span class="oname">As it is</span></div>
      <div class="strips"><div class="strip"><img src="{PV_NOW}" alt="Pause menu now"></div></div>
    </div>
    <div class="opt" style="margin:0">
      <div class="ohead"><span class="oname">With the coach</span></div>
      <div class="strips"><div class="strip"><img src="{PV_COACH}" alt="Pause menu with coach"></div></div>
    </div>
  </div>
  <p class="sub" style="margin-top:18px">He sits in a row with the score at
  58px rather than being bolted to the side of a centred column. The screen
  already says <b>THE CLOCK IS STOPPED, HUDDLE UP</b>, and putting the coach in
  the huddle is the most natural thing on this page.</p>
</section>

<section>
  <h2>Both at once</h2>
  <div class="wide">
    <p class="slab">Because &ldquo;is that too much&rdquo; is easier to answer by looking</p>
    <img src="{BOTH}" alt="Both placements">
  </div>
</section>

<section>
  <div class="q">
    <h3>On your strategy-game instinct</h3>
    <p>You are right that most strategy games put help on the game screen. It
    is worth naming <b>why</b> it works there, because the reason does not
    fully transfer: those games let you stop and think for free. Opening a help
    panel costs nothing, so it can afford to be a manual.</p>
    <p>Your game has a running clock. You just cut the music player out of live
    play for exactly that reason. <b>So an in-game help button that opens
    something to read would be the same mistake you have just fixed.</b></p>
    <p>But the coach is not a manual. He is one line at the moment it matters,
    and the Rulebook in the pause menu is already the manual. <b>That is what
    makes the in-game button defensible</b>: it is not help, it is a nudge, and
    a nudge is worthless five seconds later.</p>
  </div>

  <div class="rec">
    <h3>What I would pick</h3>
    <p><b>A, bottom left, and not both.</b> Three reasons, in order of weight.</p>
    <p><b>One:</b> what the coach knows is time-sensitive. A hint about the shot
    you are about to take is worth nothing in a menu you open after taking it.
    <b>Two:</b> the pause menu already has <em>How to play</em>, which is the
    go-and-read job. Putting the coach there gives that screen two answers to
    the same question, which is the thing we just deleted quick help for.
    <b>Three:</b> at rest he costs one dimmed 52px circle in a corner that is
    otherwise empty, and the game already puts his card on screen unprompted,
    so he is not a new presence, just a reachable one.</p>
    <p><b>The case for B, honestly:</b> it adds nothing at all to the playing
    screen, which is the surface you called chaos. If you decide the in-game
    screen must lose objects rather than gain them, B is the disciplined answer
    and the coach still turns up on his own when he has something.</p>
  </div>

  <div class="ask">
    <h2>What I need from you</h2>
    <ol>
      <li><b>A, B or both.</b></li>
      <li><b>Resting brightness.</b> He is dimmed and grey-ringed until he has
      something. Too quiet to notice, or right?</li>
      <li>Then: <b>what happens when you tap him</b>, which you said is next.
      Worth knowing my recommendation there depends on this answer, so it is
      the right order.</li>
    </ol>
  </div>
</section>

<footer>
  Real renders, variants injected in flight, repo untouched &middot;
  tools/coach2-shots.mjs &middot; 390&times;844 and 1280&times;860 &middot;
  every position measured, collisions asserted against the shipped music
  button &middot; 2026-08-22
</footer>
</div>
"""


def build():
    html = (HTML
            .replace('{CORNERS}', img('corners.webp'))
            .replace('{CORNERS_REST}', img('corners-rest.webp'))
            .replace('{BL_REST}', img('p-bl-rest.webp'))
            .replace('{BL_LIVE}', img('p-bl-live.webp'))
            .replace('{PV_NOW}', img('p-pv-now.webp'))
            .replace('{PV_COACH}', img('p-pv-coach.webp'))
            .replace('{BOTH}', img('p-both.webp')))
    OUT.write_text(html)
    print(f'{OUT}  {OUT.stat().st_size // 1024}KB')


if __name__ == '__main__':
    build()

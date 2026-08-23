#!/usr/bin/env python3
"""MUSIC ON THE CLOCK: the in-game music button as a stop/play switch.

Aaron, 2026-08-22. Options built, nothing picked, nothing shipped.

  node tools/music-shots.mjs && python3 tools/music-artifact.py
"""
import base64
import pathlib

W = pathlib.Path('design/shots/music/web')
OUT = pathlib.Path('design/music-board.html')


def img(n):
    return 'data:image/webp;base64,' + base64.b64encode((W / n).read_bytes()).decode()


HTML = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Music On The Clock</title>
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

/* the button, at twice the size it is really seen, in a row */
.btnrow{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:14px;
  margin-top:24px}
.btncell{background:var(--panel);border:1px solid var(--line);border-radius:5px;
  box-shadow:var(--shadow);overflow:hidden;text-align:center}
.btncell.pick{border-color:var(--accent)}
.btncell img{width:100%;height:auto;display:block}
.btncell .bl{font-family:var(--mono);font-size:10px;letter-spacing:.09em;
  text-transform:uppercase;color:var(--dim);padding:9px 6px 10px;line-height:1.4}
.btncell .bl b{display:block;color:var(--ink);font-weight:500;margin-bottom:2px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:24px}
@media (max-width:820px){.two{grid-template-columns:1fr;max-width:420px}}
</style>
<div class="top"></div>
<div class="wrap">
<header>
  <p class="eyebrow">Item 103 &middot; the HUD &middot; music</p>
  <h1>Music on<br>the clock</h1>
  <p class="lede">In a live game the bottom-right button stops being a door and
  becomes a switch: <strong>one tap, music off. One tap, music on.</strong>
  Pause the game and the same button opens the boombox exactly as it does
  today. Nothing shipped.</p>
</header>

<section>
  <h2>What happens today</h2>
  <p class="sub">Worth saying first, because it changes what the work is: during
  play the boombox <b>already</b> collapses to the small round tab. It is the
  TAP that is wrong, not the resting look.</p>
  <div class="two">
    <div class="opt" style="margin:0">
      <div class="ohead"><span class="oname">At rest</span></div>
      <div class="strips"><div class="strip"><img src="{NOW_REST}" alt="At rest"></div></div>
      <p class="onote">Already the 52px tab, bottom right, 10px in. This part is
      fine and does not change.</p>
    </div>
    <div class="opt" style="margin:0">
      <div class="ohead"><span class="oname">After one tap</span></div>
      <div class="strips"><div class="strip"><img src="{NOW_OPEN}" alt="After one tap"></div></div>
      <p class="onote">The whole player opens: brand strip, speakers, reels, the
      track marquee, prev, play, next and a volume slider. Measured at
      <b>202 &times; 162 sitting on the floor</b>, with the game clock still
      running. That is the thing you are cutting.</p>
    </div>
  </div>
</section>

<section>
  <h2>The button, at twice life size</h2>
  <p class="sub">Same 52px circle, same corner, same ring in every one. Only the
  glyph changes. The ring is already doing work you did not ask for: it lights
  when music is playing and goes quiet when it is not, so state is on the
  button twice.</p>
  <div class="btnrow">{BTNS}</div>
</section>

<section>
  <h2>The three, in place</h2>
  <div class="opt pick">
    <div class="ohead"><span class="oname">A &middot; stop and play</span>
      <span class="otag">my recommendation</span></div>
    <div class="two" style="margin:0;padding:20px">
      <div><p class="slab">Music on &middot; tap to stop</p>
        <img src="{A_ON}" style="width:100%;border-radius:3px" alt="Stop"></div>
      <div><p class="slab">Music off &middot; tap to play</p>
        <img src="{A_OFF}" style="width:100%;border-radius:3px" alt="Play"></div>
    </div>
    <p class="onote">Exactly what you asked for. The glyph says what the tap
    does, which is the right thing for a control you hit without looking. It
    gives up the word &ldquo;music&rdquo;: a square in the corner of a
    basketball game is not obviously about a song the first time you meet it,
    though the ring around it is lit and thumping while a track plays.</p>
  </div>

  <div class="opt">
    <div class="ohead"><span class="oname">B &middot; note with a state badge</span></div>
    <div class="two" style="margin:0;padding:20px">
      <div><p class="slab">Music on</p>
        <img src="{B_ON}" style="width:100%;border-radius:3px" alt="Note, playing"></div>
      <div><p class="slab">Music off</p>
        <img src="{B_OFF}" style="width:100%;border-radius:3px" alt="Note, stopped"></div>
    </div>
    <p class="onote">Keeps the note, so the button still announces its category,
    and puts the action in a badge. Against it: the badge is <b>22px with an
    11px glyph</b>, which is small enough that at arm&rsquo;s length you read
    &ldquo;music&rdquo; and not &ldquo;music, currently on&rdquo;. It also adds
    a second object to a corner you are trying to quieten.</p>
  </div>

  <div class="opt">
    <div class="ohead"><span class="oname">C &middot; pause bars instead of a stop square</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Music on &middot; tap to pause</p>
      <img src="{C_ON}" alt="Pause bars"></div></div>
    <p class="onote">Here because of a collision you have already half decided.
    The HUD is about to carry <b>the same pause bars</b> for the game itself,
    top left. Two pause glyphs on one screen doing different things is a real
    risk. Using a SQUARE for music keeps them apart: pause the game, stop the
    music. That is the argument for A over C, and it is the reason C exists on
    this page rather than being quietly dropped.</p>
  </div>
</section>

<section>
  <h2>Paused, the boombox comes back</h2>
  <div class="opt">
    <div class="ohead"><span class="oname">The full player, only when the clock is stopped</span></div>
    <div class="strips"><div class="strip">
      <p class="slab">Pause menu up &middot; tap the music button</p>
      <img src="{PAUSED}" alt="Boombox open over the pause menu"></div></div>
    <p class="onote">Track name, prev, next, volume, all of it. It draws above
    the pause veil already, so nothing had to be moved for this. <b>Measured
    and worth flagging:</b> the boombox and the pause veil are both z-index 40,
    and the boombox only wins because it comes later in the file. That works,
    and it is luck rather than intent, so it should be made explicit when this
    ships.</p>
  </div>
</section>

<section>
  <div class="rec">
    <h3>What I would ship</h3>
    <p><b>A, the stop square and play triangle.</b> It says what the tap does,
    it stays out of the way of the game&rsquo;s own pause glyph, and the lit
    ring already carries &ldquo;this is the music and it is on&rdquo; without
    the note having to.</p>
    <p><b>One thing I would add that you did not ask for,</b> and would not do
    without your say-so: a very short label under the button the first time it
    is tapped in a session, so the change is discoverable. Right now a player
    who taps expecting the boombox gets silence instead and no explanation.</p>
  </div>
  <div class="ask">
    <h2>What I need from you</h2>
    <ol>
      <li><b>A, B or C.</b></li>
      <li><b>Stop or pause, in behaviour</b>: does the track halt and restart
      from the top, or does it hold its place and resume? You said stop, and
      the two feel quite different across a long game.</li>
      <li><b>Does the coach button follow the same rule?</b> If music collapses
      to one tap while the clock runs, the coach ask arguably should too, and
      that changes the answer to the question you left open about whether YES
      turns the coach on for the game.</li>
    </ol>
  </div>
</section>

<footer>
  Real renders, variants injected in flight, repo untouched &middot;
  tools/music-shots.mjs &middot; 390&times;844 and 1280&times;860 &middot;
  every state measured, the live tap disabled the way the real guard would
  &middot; 2026-08-22
</footer>
</div>
"""


def build():
    btns = [
        ('now-rest', 'Today', 'note, opens the player'),
        ('a-playing', 'A · on', 'tap to stop'),
        ('a-stopped', 'A · off', 'tap to play'),
        ('b-playing', 'B · on', 'note plus badge'),
        ('b-stopped', 'B · off', 'note plus badge'),
        ('c-playing', 'C · on', 'pause bars'),
    ]
    cells = ''.join(
        f'<div class="btncell{" pick" if k.startswith("a-") else ""}">'
        f'<img src="{img("btn-" + k + ".webp")}" alt="{t}">'
        f'<p class="bl"><b>{t}</b>{s}</p></div>' for k, t, s in btns)
    html = (HTML.replace('{BTNS}', cells)
            .replace('{NOW_REST}', img('p-now-rest.webp'))
            .replace('{NOW_OPEN}', img('p-now-open.webp'))
            .replace('{A_ON}', img('p-a-playing.webp'))
            .replace('{A_OFF}', img('p-a-stopped.webp'))
            .replace('{B_ON}', img('p-b-playing.webp'))
            .replace('{B_OFF}', img('p-b-stopped.webp'))
            .replace('{C_ON}', img('p-c-playing.webp'))
            .replace('{PAUSED}', img('p-paused-open.webp')))
    OUT.write_text(html)
    print(f'{OUT}  {OUT.stat().st_size // 1024}KB')


if __name__ == '__main__':
    build()

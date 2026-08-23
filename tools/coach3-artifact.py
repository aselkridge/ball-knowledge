#!/usr/bin/env python3
"""ONE TAP OF THE COACH: his speed dial against one-tap-one-tip.

Aaron, 2026-08-23. Options built, nothing picked, nothing shipped.

  node tools/coach3-shots.mjs && python3 tools/coach3-artifact.py
"""
import base64
import pathlib

W = pathlib.Path('design/shots/coach3/web')
OUT = pathlib.Path('design/coach3-board.html')


def img(n):
    return 'data:image/webp;base64,' + base64.b64encode((W / n).read_bytes()).decode()


HTML = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>One Tap Of The Coach</title>
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

.three{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:24px}
@media (max-width:880px){.three{grid-template-columns:1fr;max-width:420px}}
.shotc{background:var(--panel);border:1px solid var(--line);border-radius:5px;
  box-shadow:var(--shadow);overflow:hidden}
.shotc.pick{border-color:var(--accent)}
.shotc .cap{display:flex;justify-content:space-between;align-items:baseline;gap:8px;
  padding:13px 16px 11px;border-bottom:1px solid var(--line)}
.shotc .cnm{font-family:var(--display);font-weight:500;font-size:17px}
.shotc img{width:100%;height:auto;display:block}
.shotc .note2{padding:12px 16px 15px;font-size:13.5px;color:var(--dim)}
.shotc .note2 b{color:var(--ink);font-weight:500}
</style>
<div class="top"></div>
<div class="wrap">
<header>
  <p class="eyebrow">Item 103 &middot; the coach &middot; the tap</p>
  <h1>One tap of<br>the coach</h1>
  <p class="lede">Your speed dial, built properly on the real screen, next to
  the one-tap version. Same resting button either way; <strong>the only thing
  being decided is what the tap does.</strong> Nothing shipped.</p>
</header>

<section>
  <h2>The three states</h2>
  <div class="three">
    <div class="shotc">
      <div class="cap"><span class="cnm">At rest</span>
        <span class="otag" style="border-color:var(--line);color:var(--dim)">both options</span></div>
      <img src="{REST}" alt="At rest">
      <p class="note2">The philosopher, dimmed, 52px, mirroring the music
      button. Identical in both options, so it is not part of the decision.</p>
    </div>
    <div class="shotc">
      <div class="cap"><span class="cnm">Your speed dial</span></div>
      <img src="{DIAL}" alt="Speed dial open">
      <p class="note2">Tap fans out two satellites tight to the button, 8px
      gaps, per your call: <b>NEED A TIP?</b> above, <b>COACH OFF</b> beside.
      They sit over the dimmed action strip and that is fine, because the veil
      holds it inert while the dial is open: a satellite over scenery, not
      over a live control. Labels are chips because your own words do not fit
      inside a circle at a readable size.</p>
    </div>
    <div class="shotc pick">
      <div class="cap"><span class="cnm">One tap, one tip</span>
        <span class="otag">my recommendation</span></div>
      <img src="{TIP}" alt="One tap, one tip">
      <p class="note2">Tap plays the coach&rsquo;s own card with a line about
      the current moment, exactly the shape his tips already use. No menu in
      between. Tap anywhere, it goes.</p>
    </div>
  </div>
  <p class="sub" style="margin-top:18px"><b>On overlap:</b> the open dial
  sits over the action strip and you ruled that acceptable, since the veil
  holds everything under it inert. The one-tap card still clears the strip,
  because it has no veil: a card with no veil over a live SHOOT button would
  be a real collision, not a cosmetic one.</p>
</section>

<section>
  <div class="rec">
    <h3>Why I still land on one tap</h3>
    <p><b>The dial is a real pattern and this is its honest best,</b> and it
    still makes the common thing slower to serve the rare thing. Wanting a tip
    is the everyday tap; turning the first-time coach on or off is a
    twice-ever event with a home in Settings already. The dial charges the
    everyday tap a second decision to keep a shortcut nobody visits twice.</p>
    <p><b>The clock is your own argument.</b> You cut the boombox out of live
    play so one tap would do the whole job. A dial is the boombox problem at
    smaller scale: tap, read two options, pick one, then get what you came
    for.</p>
    <p><b>And to say the pause-menu half plainly, because I said it badly
    last time:</b> in the one-tap version I add NOTHING to the pause menu.
    The coach on/off switch already exists inside Settings, and Settings is
    already a button on the pause menu. So the path to the switch is Pause,
    then Settings, and it is already live today. My whole claim was that the
    switch needs no second home, not that I would build one.</p>
    <p><b>What the dial buys that one-tap does not:</b> a discoverable off
    switch for the player who finds the coach annoying mid-game. If that
    matters to you, the cheaper version is one line at the bottom of the tip
    card itself, <b>&ldquo;coach off&rdquo;</b>, small and quiet: the switch
    appears exactly when someone is most likely to want it, and costs the
    everyday tap nothing.</p>
  </div>
  <div class="ask">
    <h2>What I need from you</h2>
    <ol>
      <li><b>Dial, or one tap.</b></li>
      <li>If one tap: <b>a small &ldquo;coach off&rdquo; line on the tip card
      itself</b>, yes or no?</li>
      <li><b>Online it is the same button, no freeze,</b> matching how the
      coach already behaves there. Confirm and that is the whole spec.</li>
    </ol>
  </div>
</section>

<footer>
  Real renders, variants injected in flight, repo untouched &middot;
  tools/coach3-shots.mjs &middot; 390&times;844 and 1280&times;860 &middot;
  dock collision measured and cleared in both options &middot; 2026-08-23
</footer>
</div>
"""


def build():
    html = (HTML
            .replace('{REST}', img('p-rest.webp'))
            .replace('{DIAL}', img('p-dial.webp'))
            .replace('{TIP}', img('p-tip.webp')))
    OUT.write_text(html)
    print(f'{OUT}  {OUT.stat().st_size // 1024}KB')


if __name__ == '__main__':
    build()

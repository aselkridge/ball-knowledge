#!/usr/bin/env python3
"""Build docs/dev/daily-theatre.html, the B5c sample.

    python3 tools/theatre-sample-build.py

Aaron asked to see a sample of B5c before it is built for real ("Let's see your
sample of B5c", 2026-08-09). B5c's own spec line is the design brief: the Daily
Five REPORTS results, it does not STAGE them. A caption fading in is a status
message; making a shot should be an event.

Everything visual in the sample is a device the game already ships, copied with
its values and credited in a comment, per the third option in CLAUDE.md (build
it, source it, or find it already built):

    the shot arc        flyBall's sine formula, game.js:2429 (h0..h1 + sin*peak)
    make / miss story   resolveShot, game.js:4019 (arc->net · arc->carom->brick)
    the slam stamp      .pow, index.html:937 (Sedgwick, starburst clip-path)
    the confetti        ev-confetti, game.js:4486 (44 spans, evFall tumble)
    the roof-off slam   #fireslam, index.html:3851 (burst + stamp A + quake)
    the sounds          audio.js's own synth recipes (net arp, brick noise,
                        whistle, horn, buzzer), reimplemented note for note
    the court + spots   the daily screen's own dvcourt / dvspot CSS
    the fonts           the game's five, inlined as data URIs

The crowd cheer is the ONE thing deliberately absent, because V0 rules it must
be sourced and never faked: the FINISHED ending shows a labelled slot where it
lands. The files are already in Aaron's Drive folder.

Assets are inlined so the page works as a claude.ai artifact (strict CSP, no
external requests) and opens from file:// on a phone.
"""
import base64, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'docs/dev/daily-theatre.html'
A = ROOT / 'docs/play/assets'


def b64(p):
    return base64.b64encode(pathlib.Path(p).read_bytes()).decode()


def face(name, file, weight=400):
    return (f"@font-face{{font-family:'{name}';font-weight:{weight};font-style:normal;"
            f"font-display:swap;src:url(data:font/woff2;base64,{b64(A/'fonts'/file)})"
            f" format('woff2')}}")


FONTS = ''.join([
    face('Anton', 'anton-400.woff2'),
    face('Sedgwick Ave Display', 'sedgwick-400.woff2'),
    face('Mono', 'spacemono-400.woff2'),
    face('Arch', 'archivo-600.woff2', 600),
    face('Seg', 'dseg7-700.woff2', 700),
])
FIRE_A = 'data:image/webp;base64,' + b64(A / 'fire' / 'onfire-stamp-a.webp')

PAGE = r"""<meta charset="utf-8">
<title>The Daily Five, staged</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
__FONTS__
:root{--ground:#100d0b;--panel:#1d1815;--line:#3a332a;--ink:#efe6d8;--dim:#b3a894;
 --faint:#7d735f;--accent:#f5872e;--accent-deep:#c9641a;--cream:#fff5e2;
 --good:#6fbf73;--bad:#d5524b;--gold:#ffcf6a}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
 font-family:Arch,system-ui,sans-serif;-webkit-text-size-adjust:100%}
.wrap{max-width:960px;margin:0 auto;padding:22px 16px 70px}
.eyebrow{font-family:Mono;font-size:10px;letter-spacing:.24em;text-transform:uppercase;
 color:var(--accent);margin:0}
h1{font-family:Anton;font-weight:400;text-transform:uppercase;
 font-size:clamp(26px,6.5vw,40px);line-height:.96;margin:8px 0 8px}
.stand{color:var(--dim);max-width:64ch;margin:0 0 18px;line-height:1.6}
.stand b{color:var(--ink)}

/* ===================== THE PHONE, a replica of screen-daily ============== */
.phone{position:relative;width:100%;max-width:390px;margin:0 auto;
 background:linear-gradient(180deg,#171210,#120e0b);border:1px solid var(--line);
 border-radius:18px;padding:16px 14px 14px;box-shadow:0 20px 50px rgba(0,0,0,.6);
 overflow:hidden}
.phone.quake{animation:quake .5s ease}
@keyframes quake{0%,100%{transform:none}18%{transform:translate(-5px,3px) rotate(-.5deg)}
 38%{transform:translate(4px,-3px) rotate(.4deg)}58%{transform:translate(-3px,2px)}
 78%{transform:translate(2px,-1px)}}
.dvey{display:flex;justify-content:space-between;font-family:Mono;font-size:9px;
 letter-spacing:.18em;text-transform:uppercase;color:var(--faint);margin-bottom:2px}
.dvtitle{font-family:'Sedgwick Ave Display';font-size:27px;color:var(--cream);
 transform:rotate(-2deg);text-shadow:2px 2px 0 var(--accent-deep);margin:0 0 8px}
.tabs{display:flex;gap:6px;margin-bottom:8px}
.tab{flex:1;font-family:Mono;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;
 text-align:center;border:1px solid var(--line);border-radius:8px;padding:6px 2px;
 color:var(--faint)}
.tab.on{border-color:var(--accent);color:var(--accent)}
.tab.def.on{border-color:#6fd0c3;color:#6fd0c3}

/* the stage: same geometry as the game's dvstage.r1, values copied so the two
   move together the day the original is retuned (index.html:376) */
.stage{position:relative;height:196px;border-radius:12px;overflow:hidden;
 border:1px solid var(--line);background:linear-gradient(180deg,#241c17,#1a1410);
 margin-bottom:8px;transition:background .5s ease}
.stage.def{background:linear-gradient(180deg,#101b1a,#0e1413)}
.court{position:absolute;inset:0;pointer-events:none;transition:opacity .4s ease}
.arc{position:absolute;left:50%;top:-96px;width:250px;height:250px;margin-left:-125px;
 border:1.5px solid rgba(255,246,226,.16);border-radius:50%}
.key{position:absolute;left:50%;top:0;width:98px;height:112px;margin-left:-49px;
 border:1.5px solid rgba(255,246,226,.13);border-top:0}
.rim{position:absolute;left:50%;top:6px;width:34px;height:7px;margin-left:-17px;
 border:2px solid var(--accent);border-radius:3px;transition:transform .1s}
.rim.hit{animation:rimhit .35s ease}
@keyframes rimhit{0%{transform:translateY(0)}30%{transform:translateY(3px) rotate(2deg)}
 60%{transform:translateY(-1px) rotate(-1deg)}100%{transform:none}}
/* net ripple on a make: three widening rings under the rim */
.swish i{position:absolute;left:50%;top:12px;width:26px;height:26px;margin-left:-13px;
 border:2px solid var(--cream);border-radius:50%;opacity:0;pointer-events:none}
.swish.go i{animation:swishring .5s ease-out forwards}
.swish.go i:nth-child(2){animation-delay:.07s}
.swish.go i:nth-child(3){animation-delay:.14s}
@keyframes swishring{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.7)}}

/* the five spots, the daily's own .dvspot grammar */
.spot{position:absolute;width:62px;margin-left:-31px;padding:5px 2px 4px;border-radius:10px;
 text-align:center;font-family:Mono;border:1.5px solid;background:rgba(20,14,10,.82);
 transition:transform .18s ease,box-shadow .2s ease,opacity .3s}
.spot b{display:block;font-size:13px;font-weight:400;line-height:1}
.spot small{display:block;font-size:6.5px;letter-spacing:.06em;margin-top:2px;opacity:.85}
.spot.t1{border-color:var(--good);color:var(--good)}
.spot.t2{border-color:#e8b84b;color:#e8b84b}
.spot.t3{border-color:var(--bad);color:var(--bad)}
.spot.t4{border-color:var(--gold);color:var(--gold)}
.spot.live{transform:scale(1.14);box-shadow:0 0 0 4px rgba(245,135,46,.25),0 6px 16px rgba(0,0,0,.5)}
.spot.made{opacity:.92}.spot.made::after{content:"\2713";position:absolute;right:-7px;top:-7px;
 width:16px;height:16px;border-radius:50%;background:var(--good);color:#08140a;
 font-size:11px;line-height:16px}
.spot.missed{opacity:.5}.spot.missed::after{content:"\2715";position:absolute;right:-7px;top:-7px;
 width:16px;height:16px;border-radius:50%;background:var(--bad);color:#1c0806;
 font-size:11px;line-height:16px}

/* round 2: the stop strip replaces the court */
.stops{position:absolute;inset:12px 10px;display:none;grid-template-columns:repeat(5,1fr);
 gap:7px;align-content:center}
.stage.def .stops{display:grid}
.stage.def .court,.stage.def .spot{opacity:0;pointer-events:none}
/* THE COLOUR LAW HOLDS ON DEFENSE TOO. First cut painted all five stops teal
   and that is the corner-three collision again: colour on the floor always
   means ONE thing, how hard the question is. So the tiles keep the tier scale
   (STOPS are t1,t2,t2,t3,t3 in daily.js:78) and "defense" is carried by the
   floor tint, the tab, the stamp and the line under the strip instead. */
.stop{border:1.5px solid;border-radius:10px;text-align:center;
 font-family:Mono;padding:10px 2px;background:rgba(8,20,18,.7)}
.stop.t1{border-color:var(--good);color:var(--good)}
.stop.t2{border-color:#e8b84b;color:#e8b84b}
.stop.t3{border-color:var(--bad);color:var(--bad)}
.stop b{display:block;font-size:13px;font-weight:400}
.stop small{display:block;font-size:6px;letter-spacing:.05em;margin-top:3px;opacity:.85}
.shieldline{position:absolute;left:0;right:0;bottom:8px;text-align:center;font-family:Mono;
 font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:#6fd0c3;opacity:0;
 transition:opacity .4s .3s}
.stage.def .shieldline{opacity:1}

/* THE BALL. ballSVG's palette (game.js:9), flown on flyBall's arc (game.js:2429) */
#ball{position:absolute;width:22px;height:22px;margin:-11px;left:0;top:0;display:none;
 pointer-events:none;z-index:5;border-radius:50%;
 background:radial-gradient(circle at 34% 30%,#ffb976,#ef8330 55%,#8a430c);
 box-shadow:inset -2px -3px 5px rgba(0,0,0,.4),0 3px 7px rgba(0,0,0,.5)}
#ball::before{content:"";position:absolute;inset:0;border-radius:50%;
 border:1px solid rgba(60,25,4,.55);clip-path:inset(0 46% 0 46%)}
#ball::after{content:"";position:absolute;inset:0;border-radius:50%;
 border:1px solid rgba(60,25,4,.55);clip-path:inset(46% 0 46% 0)}

/* the score pop that floats off the rim */
.pts{position:absolute;z-index:6;font-family:Seg;font-size:20px;color:var(--gold);
 text-shadow:0 0 12px rgba(255,207,106,.6);pointer-events:none;
 animation:ptsup .9s ease-out forwards}
@keyframes ptsup{0%{opacity:0;transform:translateY(6px)}25%{opacity:1}
 100%{opacity:0;transform:translateY(-34px)}}

/* THE POW. Copied from index.html:937 (.pow) so the two move together: same
   face, same starburst polygon, same slam curve. */
.pow{position:absolute;z-index:60;font-family:'Sedgwick Ave Display';
 font-size:clamp(30px,9vw,52px);color:var(--cream);text-transform:uppercase;
 pointer-events:none;white-space:nowrap;
 transform:translate(-50%,-50%) scale(2.6) rotate(var(--pr,-7deg));
 text-shadow:3px 3px 0 var(--accent-deep),0 0 22px rgba(245,135,46,.55),0 6px 20px rgba(0,0,0,.5);
 animation:powslam .55s cubic-bezier(.16,1.7,.4,1) forwards}
.pow::before{content:"";position:absolute;inset:-34px -48px;z-index:-1;
 background:radial-gradient(closest-side,rgba(245,135,46,.95),rgba(245,135,46,0) 72%);
 clip-path:polygon(50% 0,61% 24%,88% 12%,76% 38%,100% 50%,76% 62%,88% 88%,61% 76%,50% 100%,39% 76%,12% 88%,24% 62%,0 50%,24% 38%,12% 12%,39% 24%)}
.pow.cold{text-shadow:3px 3px 0 #7a2a22,0 0 18px rgba(213,82,75,.45),0 6px 20px rgba(0,0,0,.5)}
.pow.cold::before{background:radial-gradient(closest-side,rgba(213,82,75,.75),rgba(213,82,75,0) 72%)}
.pow.teal{text-shadow:3px 3px 0 #16554d,0 0 22px rgba(111,208,195,.5),0 6px 20px rgba(0,0,0,.5)}
.pow.teal::before{background:radial-gradient(closest-side,rgba(111,208,195,.85),rgba(111,208,195,0) 72%)}
@keyframes powslam{0%{opacity:0;transform:translate(-50%,-50%) scale(2.6) rotate(var(--pr,-7deg))}
 24%{opacity:1;transform:translate(-50%,-50%) scale(.82) rotate(var(--pr,-7deg))}
 40%{transform:translate(-50%,-50%) scale(1.06) rotate(var(--pr,-7deg))}
 100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(var(--pr,-7deg))}}
.pow.out{animation:powout .3s ease forwards}
@keyframes powout{to{opacity:0;transform:translate(-50%,-50%) scale(.7) rotate(var(--pr,-7deg))}}

/* the card */
.dvcard{border:1px solid var(--line);border-radius:12px;background:rgba(0,0,0,.22);
 padding:12px 12px 10px;min-height:150px}
.dvcard.swap{animation:dvSwap .16s ease both}
@keyframes dvSwap{0%{opacity:0;transform:translateY(5px)}100%{opacity:1;transform:none}}
.qtop{display:flex;justify-content:space-between;font-family:Mono;font-size:8.5px;
 letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-bottom:7px}
.qtop .t3c{color:var(--bad)}
.dvq{font-size:14px;line-height:1.45;color:var(--ink);margin-bottom:10px}
.dva{display:block;width:100%;text-align:left;font-family:inherit;font-size:13.5px;
 color:var(--dim);background:none;border:1px solid var(--line);border-radius:9px;
 padding:9px 11px;margin-bottom:6px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.dva.right{border-color:var(--good);color:var(--good);background:rgba(111,191,115,.08)}
.dva.wrong{border-color:var(--bad);color:var(--bad);background:rgba(213,82,75,.08)}
.dva[disabled]{cursor:default}
/* TODAY's entire celebration, for contrast: the caption */
.whisper{font-family:Mono;font-size:10px;letter-spacing:.12em;text-transform:uppercase;
 min-height:15px;margin-top:2px}
.whisper.good{color:var(--good)}.whisper.bad{color:var(--bad)}

/* confetti, ev-confetti's device (game.js:4486): spans, evFall tumble */
.confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:50}
.confetti span{position:absolute;top:-6%;border-radius:2px;
 animation:evFall linear forwards}
@keyframes evFall{to{transform:translateY(118vh) rotate(640deg) rotateY(720deg)}}

/* the roof off: #fireslam's shape (index.html:3851), stamp A, black = transparency */
.fslam{position:absolute;inset:0;z-index:70;display:none;align-items:center;
 justify-content:center;pointer-events:none;
 /* the stamp's black plate is dropped by mix-blend-mode:screen, but a blend
    only sees its own stacking context, and this overlay IS one (z-index).
    So the overlay carries the arena's near-black itself: the plate melts into
    the veil exactly the way it melts into the game's ground. */
 background:radial-gradient(90% 70% at 50% 45%,rgba(16,13,11,.86),rgba(16,13,11,.96))}
.fslam.on{display:flex}
.fs-burst{position:absolute;width:130vmax;height:130vmax;border-radius:50%;
 background:radial-gradient(circle,rgba(255,207,106,.9),rgba(245,135,46,.4) 30%,transparent 62%);
 animation:fsburst .9s ease-out forwards}
@keyframes fsburst{0%{opacity:0;transform:scale(.1)}18%{opacity:1}100%{opacity:0;transform:scale(1)}}
.fs-stamp{position:relative;transform:rotate(-9deg);animation:fsslam .42s cubic-bezier(.2,1.4,.35,1) forwards}
.fs-stamp img{width:min(74vw,300px);mix-blend-mode:screen;
 filter:drop-shadow(0 0 26px rgba(245,135,46,.7))}
.fs-sub{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%) rotate(2deg);
 font-family:'Sedgwick Ave Display';font-size:21px;color:var(--cream);white-space:nowrap;
 text-shadow:2px 2px 0 var(--accent-deep),0 0 16px rgba(245,135,46,.6)}
@keyframes fsslam{0%{opacity:0;transform:scale(3.4) rotate(-16deg)}
 55%{opacity:1;transform:scale(.94) rotate(-8deg)}100%{transform:scale(1) rotate(-9deg)}}
.fslam.out{animation:fsout .5s ease forwards}
@keyframes fsout{to{opacity:0}}

/* the receipt moment + the labelled hole where the sourced cheer lands */
.finline{position:absolute;left:0;right:0;top:0;bottom:0;z-index:55;display:none;
 align-items:center;justify-content:center;flex-direction:column;gap:10px;
 background:rgba(10,7,5,.82);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
.finline.on{display:flex}
.fin-big{font-family:'Sedgwick Ave Display';font-size:34px;color:var(--cream);
 transform:rotate(-3deg);text-shadow:3px 3px 0 var(--accent-deep),0 0 20px rgba(245,135,46,.5)}
.fin-score{font-family:Seg;font-size:34px;color:var(--gold);
 text-shadow:0 0 16px rgba(255,207,106,.5)}
.fin-cheer{font-family:Mono;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;
 color:var(--ground);background:var(--gold);border-radius:7px;padding:6px 10px}
.fin-x{font-family:Mono;font-size:9px;letter-spacing:.14em;text-transform:uppercase;
 background:none;border:1px solid var(--line);border-radius:7px;color:var(--dim);
 padding:7px 12px;cursor:pointer;pointer-events:auto}

/* ---- the control rack under the phone ---- */
.rack{max-width:390px;margin:12px auto 0;border:1px solid var(--line);border-radius:10px;
 background:var(--panel);padding:12px 13px}
.rack h4{font-family:Mono;font-size:9px;letter-spacing:.2em;text-transform:uppercase;
 color:var(--faint);margin:0 0 9px;font-weight:400}
.ctl{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:4px}
.ctl button{font-family:Mono;font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;
 background:none;color:var(--dim);border:1px solid var(--line);border-radius:7px;
 padding:9px 11px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ctl button.hot{border-color:var(--accent);color:var(--accent)}
.ctl button.on{background:rgba(245,135,46,.12);border-color:var(--accent);color:var(--accent)}
.rack .sep{height:1px;background:var(--line);margin:11px -13px 11px}
ul.k{margin:22px auto 0;padding:0;list-style:none;display:flex;flex-direction:column;
 gap:11px;max-width:640px}
ul.k li{border-left:3px solid var(--line);padding-left:14px;color:var(--dim);
 font-size:14px;line-height:1.55}
ul.k li b{color:var(--ink)}
.note{font-family:Mono;font-size:11px;line-height:1.75;color:var(--dim);
 border-left:3px solid var(--accent);padding:2px 0 2px 14px;margin:22px auto 0;max-width:80ch}
.note b{color:var(--accent);font-weight:400}
footer{margin-top:30px;border-top:1px solid var(--line);padding-top:15px;
 font-family:Mono;font-size:10px;letter-spacing:.09em;color:var(--faint);line-height:1.9}
@media(prefers-reduced-motion:reduce){
 .pow,.fs-burst,.fs-stamp,.confetti span,.pts,.swish.go i{animation-duration:1ms!important}
 .phone.quake{animation:none}}
</style>
<div class="wrap">
<p class="eyebrow">Ball Knowledge · 9 August 2026 · a sample, not a build · B5c</p>
<h1>The Daily Five, staged</h1>
<p class="stand">Aaron's brief, in his words: <b>"the player really needs to feel like
they won or got it wrong"</b> · <b>"it would be cool if you saw a ball go from that
spot to the rim area and either swish or miss"</b> · <b>"when we switch to defense,
it's not even clear you are on defense."</b> The root cause, from V0: the mode
REPORTS results, it does not STAGE them. This page is the staging, playable.
Tap an answer on the card, or drive it from the rack below.</p>

<div class="phone" id="ph">
  <div class="dvey"><span>AUG 9 · THE DAILY FIVE</span><span>▦ 4 DAY STREAK</span></div>
  <div class="dvtitle">The Daily Five</div>
  <div class="tabs">
    <div class="tab on" id="tabS">Round 1 · Shots</div>
    <div class="tab def" id="tabD">Round 2 · Stops</div>
  </div>
  <div class="stage" id="stage">
    <div class="court">
      <span class="arc"></span><span class="key"></span>
      <span class="rim" id="rim"></span>
      <span class="swish" id="swish"><i></i><i></i><i></i></span>
    </div>
    <!-- the five spots, at daily.js's own coordinates (SHOTS, daily.js:71) -->
    <div class="spot t1"      style="left:38%;top:26px"  data-p="2"><b>2</b><small>LAYUP</small></div>
    <div class="spot t2"      style="left:68%;top:58px"  data-p="2"><b>2</b><small>ELBOW</small></div>
    <div class="spot t2"      style="left:20%;top:86px"  data-p="2"><b>2</b><small>WING</small></div>
    <div class="spot t3 live" style="left:87%;top:118px" data-p="3"><b>3</b><small>CORNER 3</small></div>
    <div class="spot t4"      style="left:46%;top:148px" data-p="3"><b>3</b><small>LOGO</small></div>
    <div class="stops">
      <div class="stop t1"><b>2</b><small>CONTEST</small></div>
      <div class="stop t2"><b>2</b><small>CLOSE OUT</small></div>
      <div class="stop t2"><b>2</b><small>HELP SIDE</small></div>
      <div class="stop t3"><b>3</b><small>AT THE RIM</small></div>
      <div class="stop t3"><b>3</b><small>THE BLOCK</small></div>
    </div>
    <div class="shieldline">Your rim now · five stops to make</div>
    <div id="ball"></div>
  </div>
  <div class="dvcard" id="card">
    <div class="qtop"><span>Rivalries · <b class="t3c">Hard</b></span><span>3 PTS · CORNER 3</span></div>
    <div class="dvq">On May 7, 1995, Reggie Miller scored eight points in nine seconds
      to steal a playoff game from which team?</div>
    <button class="dva" data-r="0">Chicago Bulls</button>
    <button class="dva" data-r="1">New York Knicks</button>
    <button class="dva" data-r="0">Orlando Magic</button>
    <button class="dva" data-r="0">Atlanta Hawks</button>
    <div class="whisper" id="whis"></div>
  </div>
  <div class="confetti" id="conf"></div>
  <div class="fslam" id="fslam">
    <div class="fs-burst"></div>
    <div class="fs-stamp"><img src="__FIRE__" alt="ON FIRE">
      <div class="fs-sub" id="fsSub">10 for 10 + the Heat Check</div></div>
  </div>
  <div class="finline" id="fin">
    <div class="fin-big" id="finBig">Good run.</div>
    <div class="fin-score" id="finScore">0</div>
    <div class="fin-cheer" id="finCheer">🔊 the sourced crowd cheer lands here</div>
    <button class="fin-x" id="finX">Back to the receipt</button>
  </div>
</div>

<div class="rack">
  <h4>Drive it · every button is a moment from the spec</h4>
  <div class="ctl">
    <button class="hot" id="bMake">Splash</button>
    <button id="bMiss">Brick</button>
    <button id="bR2">Round 2 · defense</button>
    <button id="bReset">Reset</button>
  </div>
  <div class="sep"></div>
  <h4>The three endings · "visibly different from each other"</h4>
  <div class="ctl">
    <button id="bFin">Finished</button>
    <button id="bSwept">Swept · 10/10</button>
    <button class="hot" id="bRoof">Roof off · +Heat Check</button>
  </div>
  <div class="sep"></div>
  <h4>For contrast</h4>
  <div class="ctl">
    <button id="bToday">Today's version: OFF</button>
  </div>
</div>

<ul class="k">
  <li><b>Nothing on this page is a new device.</b> The slam word is the menu's own
    <b>.pow</b> (same face, same starburst polygon, same overshoot curve). The arc is
    <b>flyBall's</b> sine formula from the main board. The make/miss story is
    <b>resolveShot's</b>: arc then swish, or arc then a carom off the rim. The confetti
    is the victory screen's. The roof-off slam is <b>the ON FIRE stamp</b>, art the game
    already ships. Copied with their values, so the two surfaces move together.</li>
  <li><b>That is also the plan for the real build.</b> V0's own line: the shot animation
    is the SAME JOB as the main game's unbuilt shot effects (arc trail, swish burst,
    rim rattle). Write it once as its own small module, drive it from the Daily Five
    AND the board, or the two screens end up looking like different games.</li>
  <li><b>Defense announces itself.</b> The whistle blows, the floor goes cold teal, the
    court art gives way to the five stops, and a stamp says the word. Aaron: "it's not
    even clear you are on defense, it's just 5 squares." Now it is a change of ends.</li>
  <li><b>The crowd cheer is deliberately absent.</b> V0 rules it must be SOURCED, never
    synthesised, and never faked to unblock the visuals. The FINISHED ending shows the
    labelled slot where it lands. The files arrived in the Drive folder on 08-09; they
    need to be moved into the repo and trimmed.</li>
  <li><b>What the real build adds that a sample cannot:</b> wiring into
    <b>answer()</b> at daily.js:765 (the one funnel every outcome passes through), the
    round flip inside <b>roundBreak()</b>, the endings inside <b>finish()</b>, and the
    reduce-motion guards the game already applies to every one of these devices.</li>
</ul>

<p class="note"><b>MEDIUM CHECK, stated before it was drawn.</b> Everything here is
vector, CSS and type: geometry, so it is BUILT. The one non-buildable ingredient in
all of B5c is the crowd audio, which is SOURCED and already in Aaron's Drive. The ON
FIRE stamp is sourced art the game already ships, reused, not commissioned.</p>

<p class="note"><b>What to judge.</b> One: does a make feel won, next to today's
whisper (flip the contrast toggle and answer again). Two: is the brick mean enough
without being a punishment. Three: does Round 2 read as a change of ENDS rather than
a change of list. Four: are the three endings visibly three tiers. Five: too much?
Every one of these is one notch, and notches are cheap.</p>

<footer>
Sample only, not wired in · built by tools/theatre-sample-build.py ·
the real build hooks answer() / roundBreak() / finish() in daily.js ·
spec: V0.md B5c, D4 D5 D6 D8 and THE THREE ENDINGS · every device credited above
</footer>
</div>
<script>
/* ======================= the sample's little engine ======================
   Sounds are audio.js's own recipes, note for note: net = rising arp
   [76,81,88], brick = bandpass noise hit, whistle, horn = arp [53,53,60],
   buzzer = saw sweep. Same synthesis, so the sample sounds like the game. */
var AC=null;
function ac(){if(!AC){var C=window.AudioContext||window.webkitAudioContext;
  if(!C)return null;AC=new C()}if(AC.state==='suspended')AC.resume();return AC}
function mtof(m){return 440*Math.pow(2,(m-69)/12)}
function tone(f,at,len,type,g0){var c=ac();if(!c)return;
  var o=c.createOscillator(),g=c.createGain();o.type=type||'triangle';
  o.frequency.value=f;g.gain.setValueAtTime(g0||.16,c.currentTime+at);
  g.gain.exponentialRampToValueAtTime(.001,c.currentTime+at+len);
  o.connect(g);g.connect(c.destination);o.start(c.currentTime+at);o.stop(c.currentTime+at+len)}
function sfxNet(){[76,81,88].forEach(function(m,i){tone(mtof(m),i*0.05,0.14)})}
function sfxHorn(){[53,53,60].forEach(function(m,i){tone(mtof(m),i*0.09,0.3,'sawtooth',.12)})}
function sfxWhistle(){tone(2350,0,.09,'square',.05);tone(2350,.13,.22,'square',.05)}
function sfxBrick(){var c=ac();if(!c)return;var n=Math.floor(c.sampleRate*.12),
  b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
  for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,5);
  var s=c.createBufferSource();s.buffer=b;var f=c.createBiquadFilter();
  f.type='bandpass';f.frequency.value=190;f.Q.value=1.4;var g=c.createGain();
  g.gain.value=.5;s.connect(f);f.connect(g);g.connect(c.destination);s.start()}

var ph=document.getElementById('ph'),stage=document.getElementById('stage'),
    ball=document.getElementById('ball'),rim=document.getElementById('rim'),
    swish=document.getElementById('swish'),card=document.getElementById('card'),
    whis=document.getElementById('whis'),conf=document.getElementById('conf'),
    fslam=document.getElementById('fslam'),fin=document.getElementById('fin');
var TODAY=false, busy=false;
var live=function(){return stage.querySelector('.spot.live')};

function pow(word,cls,x,y,life){
  var p=document.createElement('div');p.className='pow'+(cls?' '+cls:'');
  p.textContent=word;p.style.left=(x||50)+'%';p.style.top=(y||42)+'%';
  p.style.setProperty('--pr',(Math.random()*14-8).toFixed(1)+'deg');
  ph.appendChild(p);
  setTimeout(function(){p.classList.add('out');
    setTimeout(function(){p.remove()},320)},life||900);
  return p;
}
function quake(){ph.classList.remove('quake');void ph.offsetWidth;ph.classList.add('quake')}
function ptsPop(txt){
  var s=live(),e=document.createElement('div');e.className='pts';e.textContent=txt;
  e.style.left='calc(50% + 26px)';e.style.top='4px';
  stage.appendChild(e);setTimeout(function(){e.remove()},950);
}
/* THE FLIGHT. flyBall's own math (game.js:2429): linear x/y, height added as
   h0+(h1-h0)*t + sin(pi t)*peak. Here the "height" subtracts from screen y. */
function fly(fx,fy,tx,ty,peak,dur,done){
  ball.style.display='block';
  var t0=null;
  function step(ts){
    if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/dur);
    var x=fx+(tx-fx)*t, base=fy+(ty-fy)*t,
        y=base-Math.sin(Math.PI*t)*peak;
    ball.style.transform='translate('+x+'px,'+y+'px) scale('+(1-.25*t)+')';
    if(t<1)requestAnimationFrame(step);else done&&done();
  }
  requestAnimationFrame(step);
}
function spotXY(){
  var s=live(),r=s.getBoundingClientRect(),g=stage.getBoundingClientRect();
  return [r.left-g.left+r.width/2, r.top-g.top+6];
}
function rimXY(){return [stage.clientWidth/2, 12]}

function make(){
  if(busy)return;busy=true;
  if(TODAY){whis.textContent='CORNER 3 · GOOD';whis.className='whisper good';
    setTimeout(function(){whis.textContent='';busy=false},900);return}
  var a=spotXY(),b=rimXY();
  fly(a[0],a[1],b[0],b[1],64,620,function(){
    ball.style.display='none';
    swish.classList.remove('go');void swish.offsetWidth;swish.classList.add('go');
    sfxNet();
    var s=live();s.classList.remove('missed');s.classList.add('made');
    ptsPop('+'+(s.dataset.p||3));
    pow('Splash!','',50,34);
    busy=false;
  });
}
function miss(){
  if(busy)return;busy=true;
  if(TODAY){whis.textContent='NO GOOD';whis.className='whisper bad';
    setTimeout(function(){whis.textContent='';busy=false},900);return}
  var a=spotXY(),b=rimXY();
  fly(a[0],a[1],b[0]-8,b[1],64,620,function(){
    rim.classList.remove('hit');void rim.offsetWidth;rim.classList.add('hit');
    sfxBrick();quake();
    /* the carom: resolveShot's second short flight off the rim */
    fly(b[0]-8,b[1],b[0]-70-Math.random()*40,150,26,430,function(){
      ball.style.display='none';
    });
    var s=live();s.classList.remove('made');s.classList.add('missed');
    pow('Brick.','cold',50,34);
    busy=false;
  });
}
function round2(){
  sfxWhistle();
  stage.classList.add('def');
  document.getElementById('tabS').classList.remove('on');
  document.getElementById('tabD').classList.add('on');
  setTimeout(function(){pow('Defense!','teal',50,40,1100)},260);
}
function reset(){
  stage.classList.remove('def');
  document.getElementById('tabS').classList.add('on');
  document.getElementById('tabD').classList.remove('on');
  [].forEach.call(stage.querySelectorAll('.spot'),function(s){
    s.classList.remove('made','missed')});
  fin.classList.remove('on');fslam.classList.remove('on','out');
  conf.innerHTML='';whis.textContent='';
  [].forEach.call(card.querySelectorAll('.dva'),function(b){
    b.disabled=false;b.classList.remove('right','wrong')});
  busy=false;
}
/* confetti: ev-confetti's exact device, winner-colour cycling */
function confetti(n,cols){
  conf.innerHTML='';
  for(var i=0;i<n;i++){var s=document.createElement('span');
    s.style.left=Math.random()*100+'%';
    s.style.width=(6+Math.random()*7)+'px';s.style.height=(10+Math.random()*9)+'px';
    s.style.background=cols[i%cols.length];
    s.style.animationDuration=(2.4+Math.random()*2.4)+'s';
    s.style.animationDelay=(Math.random()*1.2)+'s';
    conf.appendChild(s)}
  setTimeout(function(){conf.innerHTML=''},5600);
}
/* the rising counter: "a rising score counter" from V0's medium check */
function countUp(el,to,ms){
  var t0=null;
  function step(ts){if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/ms);
    el.textContent=Math.round(to*(1-Math.pow(1-t,3)));
    if(t<1)requestAnimationFrame(step)}
  requestAnimationFrame(step);
}
function ending(tier){
  reset();
  var big=document.getElementById('finBig'),
      cheer=document.getElementById('finCheer');
  if(tier===0){                                    /* FINISHED */
    sfxWhistle();
    fin.classList.add('on');big.textContent='Good run.';
    cheer.textContent='🔊 the sourced crowd cheer lands here · polite';
    countUp(document.getElementById('finScore'),14,900);
  }
  if(tier===1){                                    /* SWEPT */
    sfxHorn();
    fin.classList.add('on');big.textContent='SWEPT. 10 for 10.';
    cheer.textContent='🔊 crowd cheer · loud';
    countUp(document.getElementById('finScore'),22,1100);
    confetti(44,['#f5872e','#fff5e2','#ffcf6a']);
    quake();
  }
  if(tier===2){                                    /* ROOF OFF */
    sfxHorn();setTimeout(sfxNet,240);
    fslam.classList.remove('on','out');void fslam.offsetWidth;
    fslam.classList.add('on');
    confetti(72,['#f5872e','#fff5e2','#ffcf6a','#ffe9c4']);
    quake();
    setTimeout(function(){fslam.classList.add('out');
      setTimeout(function(){fslam.classList.remove('on','out');
        fin.classList.add('on');
        document.getElementById('finBig').textContent='THE ROOF IS OFF.';
        cheer.textContent='🔊 crowd cheer · roof off';
        countUp(document.getElementById('finScore'),28,1200);
      },500)},1900);
  }
}
document.getElementById('bMake').addEventListener('click',make);
document.getElementById('bMiss').addEventListener('click',miss);
document.getElementById('bR2').addEventListener('click',round2);
document.getElementById('bReset').addEventListener('click',reset);
document.getElementById('bFin').addEventListener('click',function(){ending(0)});
document.getElementById('bSwept').addEventListener('click',function(){ending(1)});
document.getElementById('bRoof').addEventListener('click',function(){ending(2)});
document.getElementById('finX').addEventListener('click',function(){
  fin.classList.remove('on');conf.innerHTML=''});
document.getElementById('bToday').addEventListener('click',function(){
  TODAY=!TODAY;this.classList.toggle('on',TODAY);
  this.textContent='Today’s version: '+(TODAY?'ON':'OFF')});
[].forEach.call(card.querySelectorAll('.dva'),function(b){
  b.addEventListener('click',function(){
    if(busy)return;
    var right=b.dataset.r==='1';
    b.classList.add(right?'right':'wrong');
    [].forEach.call(card.querySelectorAll('.dva'),function(x){x.disabled=true});
    (right?make:miss)();
    setTimeout(function(){[].forEach.call(card.querySelectorAll('.dva'),function(x){
      x.disabled=false;x.classList.remove('right','wrong')})},1800);
  });
});
window.BKTheatre={make:make,miss:miss,round2:round2,reset:reset,ending:ending,
  _busy:function(){return busy},_today:function(){return TODAY}};
</script>
"""

OUT.write_text(PAGE.replace('__FONTS__', FONTS).replace('__FIRE__', FIRE_A),
               encoding='utf-8')
print(f'wrote {OUT}  {OUT.stat().st_size/1024:.0f} KB')

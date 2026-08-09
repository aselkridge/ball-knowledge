#!/usr/bin/env python3
"""Rebuild docs/dev/places-spike.html, keeping its inlined fonts and image.

The spike is one file with about 350 KB of base64 in it: three woff2 faces and
one court photograph. Editing that by hand is how you lose a font. This keeps
everything above the first CSS comment verbatim, lifts the image data URI out of
the old body, and rewrites the engine underneath both.

    python3 tools/spike-build.py

VERSION 2, 2026-08-09, driven by Aaron trying version 1:
  "I couldn't zoom or use the image on mobile."   -> no viewport meta. Fixed,
     and now gated in audit.py at 0 across every html file in docs and design.
  "it def felt more like a zoom than walking"     -> the four candidate fixes
     are now toggles, so the question is answered by feel and not by argument.
  "we would lose the turn towards something"      -> yes, with a flat push-in.
     So turning is now demonstrated too, out of the same photograph.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / 'docs/dev/places-spike.html'
MARK = '/* ===== THE VIEWPORT'


def main():
    old = PAGE.read_text(encoding='utf-8')
    head = old[:old.find(MARK)]
    if not head or MARK not in old:
        sys.exit('marker not found, refusing to rewrite')
    i = old.find('.cam{')
    img = old[old.find('url(', i) + 4:old.find(')', old.find('base64,', i))]
    if not img.startswith('data:image/'):
        sys.exit('could not lift the image data uri')
    # THE HEAD IS CARRIED FORWARD FROM THE FILE ITSELF, which makes damage to it
    # sticky: a sabotage run that stripped the viewport meta survived three
    # rebuilds, because rebuilding faithfully preserved the missing line. So the
    # one line the page cannot ship without is ASSERTED here rather than trusted.
    if 'name="viewport"' not in head:
        head = re.sub(r'(</title>\s*\n)',
                      r'\1<meta name="viewport" content="width=device-width,initial-scale=1">\n',
                      head, count=1)
        print('  (re-inserted the missing viewport meta)')
    if 'charset' not in head:
        head = '<meta charset="utf-8">\n' + head
        print('  (re-inserted the missing charset)')
    PAGE.write_text(head + CSS.replace('__IMG__', img) + BODY, encoding='utf-8')
    print(f'rebuilt {PAGE}  {PAGE.stat().st_size/1024:.0f} KB'
          f'  (image {len(img)/1024:.0f} KB kept, fonts kept)')


CSS = """/* ===== THE VIEWPORT. This is the whole engine's stage. =====================
   VERSION 2. Version one moved ONE element: the camera scaled, and that is all
   a zoom is, which is why Aaron said it felt like one. There are now four
   layers and they move at different rates, because that is what walking is.

     .place   the frame. Fixed. This is the phone.
     .rig     the HEAD. Bobs. Everything you "see" hangs off it.
     .cam     the world. Scales toward a point, pans sideways to turn.
     .near    the near field. Scales at 1.9x the world's rate. THE PARALLAX.
     .pins    the hotspots, panning with the world so they stay on their things.
*/
.place{position:relative;width:100%;max-width:420px;margin:0 auto;aspect-ratio:9/14;
 border-radius:16px;overflow:hidden;border:1px solid var(--line);
 box-shadow:0 20px 50px rgba(0,0,0,.6);background:#000;touch-action:manipulation;
 --dur:1100ms;--bob:7px}

/* THE HEAD. Its only job is to bob, and it only bobs while you are moving.
   A walk cycle is three footfalls here: up-down, up-down, up-down, with a
   little lateral sway and a fraction of a degree of roll, because a person
   leans into the foot they are on. The numbers are small on purpose. Anything
   you can consciously see is seasickness. */
.rig{position:absolute;inset:-14px;will-change:transform}
@keyframes bob{
  0%  {transform:translate3d(0,0,0) rotate(0deg)}
  16% {transform:translate3d(2px,calc(var(--bob) * -1),0) rotate(.22deg)}
  33% {transform:translate3d(0,1px,0) rotate(0deg)}
  50% {transform:translate3d(-2px,calc(var(--bob) * -1),0) rotate(-.22deg)}
  66% {transform:translate3d(0,1px,0) rotate(0deg)}
  83% {transform:translate3d(1px,calc(var(--bob) * -.7),0) rotate(.14deg)}
  100%{transform:translate3d(0,0,0) rotate(0deg)}
}
.rig.walking{animation:bob var(--dur) cubic-bezier(.4,0,.5,1) 1}

/* THE WORLD. background-size:auto 100% instead of cover, which renders
   identically for a wide image in a tall frame and buys the x position back.
   That x position is the turn. */
.cam{position:absolute;inset:0;background:url(__IMG__) 50% center/auto 100% no-repeat;
 transform-origin:50% 50%;transform:scale(1);
 transition:transform var(--dur) cubic-bezier(.33,.02,.2,1),
            background-position-x var(--dur) cubic-bezier(.4,.02,.25,1),
            filter var(--dur) ease;
 filter:brightness(.86)}

/* THE NEAR FIELD, and it is a STAND-IN, drawn not photographed.
   A real room would deliver this as a transparent cutout of whatever is
   closest to you. Here it is a chain-link fence in SVG, because the picture
   behind it is a blacktop. It exists to answer one question: does a near layer
   moving faster than a far layer turn a zoom into a step? */
.near{position:absolute;inset:0;pointer-events:none;opacity:0;
 background:url('data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 620" preserveAspectRatio="none">\
<defs><pattern id="m" width="26" height="26" patternUnits="userSpaceOnUse">\
<path d="M0 13 13 0 26 13 13 26Z" fill="none" stroke="%23000" stroke-opacity=".5" stroke-width="2.4"/>\
</pattern></defs>\
<rect x="0" y="0" width="58" height="620" fill="url(%23m)"/>\
<rect x="342" y="0" width="58" height="620" fill="url(%23m)"/>\
<rect x="46" y="0" width="9" height="620" fill="%23000" fill-opacity=".62"/>\
<rect x="345" y="0" width="9" height="620" fill="%23000" fill-opacity=".62"/>\
<rect x="0" y="596" width="400" height="24" fill="%23000" fill-opacity=".5"/>\
</svg>') 50% center/auto 100% no-repeat;
 transform-origin:50% 50%;transform:scale(1);
 transition:transform var(--dur) cubic-bezier(.33,.02,.2,1),
            background-position-x var(--dur) cubic-bezier(.4,.02,.25,1),
            opacity .3s ease}
.place.par .near{opacity:1}

.vig{position:absolute;inset:0;pointer-events:none;transition:opacity var(--dur) ease;
 background:radial-gradient(120% 80% at 50% 45%,transparent 40%,rgba(0,0,0,.72))}
.place.deep .vig{opacity:.55}
.place.deep .cam{filter:brightness(1)}

/* HOTSPOTS. Percentages, so they survive any screen. They live on .pins, which
   pans with the world, so a hotspot stays on its thing when you turn. */
.pins{position:absolute;inset:0;
 transition:transform var(--dur) cubic-bezier(.4,.02,.25,1)}
.hs{position:absolute;transform:translate(-50%,-50%);background:none;border:0;padding:0;
 cursor:pointer;-webkit-tap-highlight-color:transparent;
 display:flex;flex-direction:column;align-items:center;gap:6px;
 transition:opacity .35s ease,transform .35s ease}
.hs .ring{width:44px;height:44px;border-radius:50%;
 border:2px solid rgba(255,240,220,.9);background:rgba(245,135,46,.2);
 -webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);
 display:grid;place-items:center;
 box-shadow:0 0 0 5px rgba(245,135,46,.14),0 6px 18px rgba(0,0,0,.6);
 animation:pulse 2.6s ease-in-out infinite}
.hs .ring i{font-style:normal;font-family:Anton;font-size:19px;color:#fff2e0;line-height:1}
@keyframes pulse{0%,100%{box-shadow:0 0 0 5px rgba(245,135,46,.14),0 6px 18px rgba(0,0,0,.6)}
 50%{box-shadow:0 0 0 11px rgba(245,135,46,.05),0 6px 18px rgba(0,0,0,.6)}}
.hs .cap{font-family:Mono;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;
 background:rgba(10,7,5,.8);border:1px solid rgba(245,135,46,.34);border-radius:5px;
 padding:3px 7px;white-space:nowrap}
.place.deep .hs{opacity:0;pointer-events:none;transform:translate(-50%,-50%) scale(.9)}
.show-hs .hs::before{content:"";position:absolute;left:50%;top:50%;
 width:var(--w);height:var(--h);transform:translate(-50%,-50%);
 border:1.5px dashed rgba(245,135,46,.75);border-radius:8px}

/* the turn arrows sit on the frame, not in the world */
.turn{position:absolute;top:50%;transform:translateY(-50%);z-index:7;
 width:38px;height:64px;border-radius:9px;border:1px solid rgba(245,135,46,.4);
 background:rgba(10,7,5,.72);color:var(--ink);font-family:Anton;font-size:20px;
 cursor:pointer;-webkit-tap-highlight-color:transparent;
 display:grid;place-items:center;transition:opacity .25s ease}
.turn.l{left:8px}.turn.r{right:8px}
.turn[disabled]{opacity:.18;cursor:default}

.hud{position:absolute;left:0;right:0;bottom:0;padding:12px 14px;z-index:8;
 display:flex;align-items:center;gap:10px;
 background:linear-gradient(180deg,transparent,rgba(8,5,3,.9))}
.where{font-family:Mono;font-size:9px;letter-spacing:.2em;text-transform:uppercase;
 color:var(--dim);flex:1;line-height:1.5}
.where b{color:var(--accent);font-weight:400}
.back{font-family:Mono;font-size:9px;letter-spacing:.16em;text-transform:uppercase;
 background:rgba(12,8,6,.85);color:var(--ink);border:1px solid var(--line);
 border-radius:7px;padding:7px 12px;cursor:pointer;opacity:0;pointer-events:none;
 transition:opacity .3s ease}
.place.deep .back,.place.turned .back{opacity:1;pointer-events:auto}

/* ---- the controls, which are the actual instrument ---- */
.ab{display:grid;grid-template-columns:1fr 1fr;gap:9px;max-width:420px;margin:14px auto 0}
.ab button{font-family:Anton;font-weight:400;text-transform:uppercase;font-size:15px;
 letter-spacing:.03em;padding:13px 10px;border-radius:9px;cursor:pointer;
 border:1px solid var(--line);background:var(--panel);color:var(--dim)}
.ab button.walk{border-color:var(--accent);color:var(--accent)}
.ab small{display:block;font-family:Mono;font-size:8px;letter-spacing:.12em;
 margin-top:4px;opacity:.75}
.rack{max-width:420px;margin:12px auto 0;border:1px solid var(--line);border-radius:10px;
 background:var(--panel);padding:12px 13px}
.rack h4{font-family:Mono;font-size:9px;letter-spacing:.2em;text-transform:uppercase;
 color:var(--faint);margin:0 0 9px;font-weight:400}
.ctl{display:flex;gap:7px;flex-wrap:wrap}
.ctl button{font-family:Mono;font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;
 background:none;color:var(--dim);border:1px solid var(--line);border-radius:7px;
 padding:8px 11px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ctl button.on{border-color:var(--accent);color:var(--accent);
 background:rgba(245,135,46,.1)}
ul.k{margin:24px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:11px}
ul.k li{border-left:3px solid var(--line);padding-left:14px;color:var(--dim);font-size:14px;line-height:1.55}
ul.k li b{color:var(--ink)}
table.cm{border-collapse:collapse;width:100%;margin:14px 0 0;font-size:13px}
table.cm th{font-family:Mono;font-size:8.5px;letter-spacing:.15em;text-transform:uppercase;
 color:var(--faint);text-align:left;font-weight:400;padding:0 10px 7px 0;
 border-bottom:1px solid var(--line)}
table.cm td{padding:10px 10px 10px 0;border-bottom:1px solid var(--line);
 color:var(--dim);vertical-align:top;line-height:1.5}
table.cm td b{color:var(--ink)}
table.cm tr.pick td{color:var(--ink)}
table.cm tr.pick td:first-child b{color:var(--accent)}
.scroll{overflow-x:auto}
.note{font-family:Mono;font-size:11px;line-height:1.75;color:var(--dim);
 border-left:3px solid var(--accent);padding:2px 0 2px 14px;margin:24px 0 0;max-width:80ch}
.note b{color:var(--accent);font-weight:400}
footer{margin-top:30px;border-top:1px solid var(--line);padding-top:15px;
 font-family:Mono;font-size:10px;letter-spacing:.09em;color:var(--faint);line-height:1.9}
@media(prefers-reduced-motion:reduce){
 .cam,.near,.pins{transition-duration:1ms}.hs .ring{animation:none}
 .rig.walking{animation:none}}
</style>
"""

BODY = """<div class="wrap">
<p class="eyebrow">Ball Knowledge · 9 August 2026 · spike v2, nothing commissioned</p>
<h1>The Places</h1>
<p class="stand">Version one asked whether a push-in feels like walking. Aaron
answered: <b>"it def felt more like a zoom than walking, and while the slower was
better it still wasn't the feel."</b> He was right, and slower was never going to
fix it, because speed is not what was missing. Here are the things that were,
each one a switch you can throw.</p>

<div class="place" id="pl">
  <div class="rig" id="rig">
    <div class="cam" id="cam"></div>
    <div class="near" id="near"></div>
    <div class="pins" id="pins">
      <button class="hs" style="left:28%;top:50%;--w:150px;--h:120px" data-x="26" data-y="50" data-z="1.9" data-nm="The wall">
        <span class="ring"><i>&#8599;</i></span><span class="cap">The wall</span></button>
      <button class="hs" style="left:66%;top:46%;--w:130px;--h:150px" data-x="68" data-y="44" data-z="1.9" data-nm="The gate">
        <span class="ring"><i>&#8593;</i></span><span class="cap">The gate</span></button>
      <button class="hs" style="left:48%;top:74%;--w:190px;--h:100px" data-x="48" data-y="76" data-z="1.7" data-nm="The court">
        <span class="ring"><i>&#8595;</i></span><span class="cap">The court</span></button>
    </div>
  </div>
  <div class="vig"></div>
  <button class="turn l" id="tl" aria-label="Turn left">&#8249;</button>
  <button class="turn r" id="tr" aria-label="Turn right">&#8250;</button>
  <div class="hud">
    <span class="where" id="wh">You are <b>standing at the gate</b></span>
    <button class="back" id="bk">&#8592; Step back</button>
  </div>
</div>

<div class="ab">
  <button id="bz">Zoom to the gate<small>v1 · camera only</small></button>
  <button id="bw" class="walk">Walk to the gate<small>v2 · everything on</small></button>
</div>

<div class="rack">
  <h4>What is actually different, one switch at a time</h4>
  <div class="ctl">
    <button id="cb" class="on">Head bob</button>
    <button id="cs" class="on">Footsteps</button>
    <button id="cp" class="on">Near layer</button>
    <button id="cd">Slow · 1600ms</button>
    <button id="tg">Show hotspots</button>
  </div>
</div>

<ul class="k">
  <li><b>Slower was never going to fix it.</b> A zoom and a walk can take exactly
    the same time. What separates them is that when you walk, the near things
    slide past faster than the far things, your head goes up and down, and you can
    hear your own feet. None of those are speed.</li>
  <li><b>The near layer is the real one, and it costs money.</b> Push in with it
    off and then on. Off, the whole picture grows at one rate, which is a lens.
    On, the fence rushes past while the court behind it creeps, which is legs.
    <b>Measured</b>, by shooting the frame with the layer on and off and
    counting the pixels that changed: it is 8 to 9 percent of the picture
    standing still, <b>over 80 percent halfway through the walk</b>, and
    0.3 percent once you arrive, because by then you have walked past it.
    That last number is why the first version of this measurement said the
    parallax did nothing: it sampled the one moment where the effect is
    correctly over.
    <b>The fence here is drawn, not photographed</b>, and that is the point: a
    real room has to be DELIVERED IN LAYERS, a background plus two or three
    transparent cutouts of whatever is nearest. That is a different order to
    twelve flat pictures, and finding it out now is what the spike was for.</li>
  <li><b>The bob is Aaron's idea and it works, at about a third of the size you
    would guess.</b> Seven pixels, three footfalls, a fifth of a degree of roll.
    Anything you can consciously notice reads as seasickness rather than walking.</li>
  <li><b>The footsteps do more than the bob.</b> They are synthesised here, filtered
    noise with a fast decay, and they are still the single biggest jump in the
    whole page. Real footfalls on wood and on blacktop would be better and belong
    on the same sound-sourcing list as the crowd cheer.</li>
</ul>

<p class="note"><b>"AND DOING IT THIS WAY WE WOULD LOSE THE TURN TOWARDS
SOMETHING RIGHT?"</b><br>
Yes. With one flat photograph you can only move ALONG the axis into it. A turn
reveals geometry that is not in the picture, so it cannot be faked by any amount
of scaling. That is a real limit and it was worth catching before the art was
commissioned.<br><br>
<b>But there is more room than v1 suggested, and it came out of v1's own bad
news.</b> A 16:9 image in a phone-shaped frame shows only 36% of its width. v1
filed that as pure loss. It is not: the other 64% is exactly the material a turn
pans across. The arrows on the frame are doing that right now, on the same
photograph, with nothing added. It reads as looking around rather than pivoting
on the spot, because this is a normal lens and not a panorama, but the mechanism
is real and it is free.</p>

<h3 style="font-family:Anton;font-weight:400;text-transform:uppercase;font-size:20px;margin:26px 0 0">Four camera models, four art bills</h3>
<p class="stand" style="margin:8px 0 0">This is the decision the spike exists to
serve, and it is a decision about ART, not about code. Every row below is a
similar amount of engineering.</p>
<div class="scroll"><table class="cm">
<thead><tr><th>model</th><th>what you can do</th><th>what one room costs</th></tr></thead>
<tbody>
<tr><td><b>Flat push-in</b><br>v1</td><td>Walk toward things. No turning. Reads as a zoom</td><td>1 image</td></tr>
<tr class="pick"><td><b>Layered push-in</b><br>v2, this page</td><td>Walk toward things and have it FEEL like walking. Still no real turning</td><td>1 background + 2 or 3 transparent cutouts</td></tr>
<tr><td><b>Wide layered</b><br>the likely answer</td><td>Walk AND look around, out of one wide picture per room</td><td>1 wide background, 3000px or more, + cutouts</td></tr>
<tr><td><b>Discrete viewpoints</b><br>classic point-and-click</td><td>Anything, including a true pivot</td><td>3 to 6 images per room, so the whole bill by 4</td></tr>
</tbody></table></div>

<p class="note"><b>What v1 got right and keeps.</b> A 16:9 backdrop in a phone
frame is cropped by 64 percent, so base images must be portrait or near square,
and 3000px or more on the long edge so a 2x push-in still has pixels behind it.
Every court backdrop we own is 1376x768, which is what makes them backdrops and
not rooms.<br><br>
<b>What v2 adds to the brief:</b> layers. The near thing in every room has to
arrive as its own transparent file. Ask for it at generation time and it costs
one extra prompt. Ask for it after twelve flat pictures are finished and it costs
twelve pictures.</p>

<p class="note"><b>What to judge now, in order.</b> One, does WALK read as walking
where ZOOM does not, on your phone. Two, turn the near layer off and back on and
say whether that alone is worth delivering every room in pieces. Three, is the bob
too much, too little, or wrong. Four, do the footsteps carry it, and are they
worth sourcing properly. Five, is looking around with the arrows enough, or do you
want a true turn badly enough to pay four times the art bill for it.</p>

<footer>
One image, blacktop-a-bgwide.jpg, already in the repo and already licensed ·
the near layer is drawn SVG, a stand-in for a real cutout · footsteps are
synthesised, no audio file · zero new art · docs/dev/places-spike.html ·
built by tools/spike-build.py · analysis in BUILD.md section 6, THE PLACES
</footer>
</div>
<script>
/* THE ENGINE v2. A node is a point, a zoom and a heading. A move is four
   transforms that disagree with each other on purpose: the near field moves
   further than the world, the head bobs, and the feet land. Take any one of
   them away with the switches and watch which one you actually miss. */
var pl=document.getElementById('pl'), rig=document.getElementById('rig'),
    cam=document.getElementById('cam'), near=document.getElementById('near'),
    pins=document.getElementById('pins'), wh=document.getElementById('wh'),
    bk=document.getElementById('bk'), tl=document.getElementById('tl'),
    tr=document.getElementById('tr');

var HOME={x:50,y:50,z:1,pan:50,nm:'standing at the gate'};
var S={bob:true, steps:true, par:true, dur:1100, pan:50, z:1};

/* THE NEAR FIELD MOVES FURTHER. That single number is the whole illusion.
   1.9 was picked by eye and is the one value on this page worth arguing about:
   too low and it is still a zoom, too high and the fence tears off the screen. */
var NEAR_RATE=1.9;

/* ---- footsteps, synthesised. A footfall is a noise burst that dies fast,
   bandpassed low so it thumps rather than hisses. Two filters and an envelope.
   A real sample will beat this; the point is that it costs nothing to try. ---- */
var AC=null;
function ac(){
  if(!AC){var C=window.AudioContext||window.webkitAudioContext; if(!C)return null;
          AC=new C();}
  if(AC.state==='suspended')AC.resume();
  return AC;
}
function foot(at,gain){
  var c=ac(); if(!c)return;
  var n=Math.floor(c.sampleRate*0.17), buf=c.createBuffer(1,n,c.sampleRate),
      d=buf.getChannelData(0);
  for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,7);
  var s=c.createBufferSource(); s.buffer=buf;
  var bp=c.createBiquadFilter(); bp.type='bandpass';
  bp.frequency.value=330+Math.random()*170; bp.Q.value=1.15;
  var lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2100;
  var g=c.createGain(); g.gain.value=gain;
  s.connect(bp); bp.connect(lp); lp.connect(g); g.connect(c.destination);
  s.start(c.currentTime+at);
}
/* the three footfalls land on the bob's three low points, 16% / 50% / 83% */
function walkSound(dur){
  if(!S.steps)return;
  foot(dur*0.16/1000,0.30); foot(dur*0.50/1000,0.26); foot(dur*0.83/1000,0.19);
}

var bobTimer=null;
function apply(){
  pl.style.setProperty('--dur',S.dur+'ms');
  pl.classList.toggle('par',S.par);
  cam.style.transform='scale('+S.z+')';
  near.style.transform='scale('+(1+(S.z-1)*NEAR_RATE)+')';
  cam.style.backgroundPositionX=S.pan+'%';
  near.style.backgroundPositionX=S.pan+'%';
  /* the pins ride the pan so a hotspot stays on its thing. The frame is the
     unit here: 50% of pan is one frame width of travel at this zoom. */
  pins.style.transform='translateX('+((50-S.pan)*0.9)+'%)';
  pl.classList.toggle('deep',S.z>1.01);
  /* THE HARNESS FOUND THIS, NOT ME. Step back only appeared when you were
     zoomed IN, so turning left at home left you facing a wall with no control
     that undid it. Anywhere-but-home has to offer a way home, and turning is a
     way of not being home. */
  var turned=Math.abs(S.pan-50)>1;
  pl.classList.toggle('turned',turned);
  bk.innerHTML=(S.z>1.01)?'&#8592; Step back':'&#8592; Face front';
  tl.disabled=S.pan<=2; tr.disabled=S.pan>=98;
}
function move(){
  apply();
  if(S.bob){
    rig.classList.remove('walking'); void rig.offsetWidth;  /* restart it */
    rig.classList.add('walking');
    clearTimeout(bobTimer);
    bobTimer=setTimeout(function(){rig.classList.remove('walking')},S.dur+40);
  }
  walkSound(S.dur);
}
function go(n){
  S.z=n.z; if(n.pan!==undefined)S.pan=n.pan;   /* HOME carries pan:50, so back un-turns too */
  cam.style.transformOrigin=n.x+'% '+n.y+'%';
  near.style.transformOrigin=n.x+'% '+n.y+'%';
  wh.innerHTML='You are <b>'+n.nm+'</b>';
  move();
}
document.querySelectorAll('.hs').forEach(function(h){
  h.addEventListener('click',function(){
    go({x:+h.dataset.x,y:+h.dataset.y,z:+h.dataset.z,
        nm:'at '+h.dataset.nm.toLowerCase()});
  });
});
bk.addEventListener('click',function(){go(HOME)});

/* TURNING. No scale change, only the world sliding across the frame, which is
   all a turn can be out of one picture. */
function turn(dir){
  S.pan=Math.max(0,Math.min(100,S.pan+dir*22));
  wh.innerHTML='You are <b>looking '+(dir<0?'left':'right')+'</b>';
  move();
}
tl.addEventListener('click',function(){turn(-1)});
tr.addEventListener('click',function(){turn(1)});

/* ---- the A/B. Same destination, same duration. Only the trimmings differ. --- */
var GATE={x:68,y:44,z:1.9,nm:'at the gate'};
document.getElementById('bz').addEventListener('click',function(){
  var b=S.bob,s=S.steps,p=S.par; S.bob=S.steps=S.par=false;
  go({x:GATE.x,y:GATE.y,z:GATE.z,nm:'at the gate · camera only'});
  setTimeout(function(){S.bob=b;S.steps=s;S.par=p;apply()},S.dur+60);
});
document.getElementById('bw').addEventListener('click',function(){
  S.bob=S.steps=S.par=true; paintSwitches(); go(GATE);
});

/* ---- the switches ---- */
function paintSwitches(){
  document.getElementById('cb').classList.toggle('on',S.bob);
  document.getElementById('cs').classList.toggle('on',S.steps);
  document.getElementById('cp').classList.toggle('on',S.par);
  var d=document.getElementById('cd');
  d.classList.toggle('on',S.dur!==1100);
  d.textContent=S.dur===1100?'Slow · 1600ms':'Normal · 1100ms';
  apply();
}
document.getElementById('cb').addEventListener('click',function(){S.bob=!S.bob;paintSwitches()});
document.getElementById('cs').addEventListener('click',function(){S.steps=!S.steps;if(S.steps)foot(0,.3);paintSwitches()});
document.getElementById('cp').addEventListener('click',function(){S.par=!S.par;paintSwitches()});
document.getElementById('cd').addEventListener('click',function(){S.dur=S.dur===1100?1600:1100;paintSwitches()});
document.getElementById('tg').addEventListener('click',function(){
  pl.classList.toggle('show-hs'); this.classList.toggle('on');
  this.textContent=pl.classList.contains('show-hs')?'Hide hotspots':'Show hotspots';
});
paintSwitches();
window.BKSpike=function(){return {z:S.z,pan:S.pan,bob:S.bob,steps:S.steps,par:S.par,dur:S.dur,
  nearScale:1+(S.z-1)*NEAR_RATE}};
</script>
"""

if __name__ == '__main__':
    main()

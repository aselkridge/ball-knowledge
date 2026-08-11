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

VERSION 3, same day, after he ran v2:
  "I def need the near layer"                     -> RULED. Every room ships in
     layers now. Recorded in V0 and BUILD; the spike just defaults it on.
  "I want to at least try the pivot once so I can
   see how it will feel"                          -> a real 90 degree turn needs
     a SECOND picture, because a pivot reveals geometry the first one does not
     contain. So a second facing is inlined, generated at build time from
     blacktop-b-bgwide.jpg, and there are three ways to get from one to the
     other. They feel completely different and they cost different amounts of
     art, which is the actual decision hiding inside "can we turn".
"""
import base64, io, pathlib, re, sys

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
    # the <title> IS the artifact's name, and the tag always beats the publish
    # parameter, so a stale title silently renames nothing. v3 published under
    # "spike v2" once for exactly this reason.
    head = re.sub(r'<title>The Places, spike v\d</title>',
                  '<title>The Places, spike v3</title>', head)
    if '<title>The Places, spike' not in head:
        head = re.sub(r'<title>.*?</title>', '<title>The Places, spike v3</title>',
                      head, count=1, flags=re.S)
    if 'charset' not in head:
        head = '<meta charset="utf-8">\n' + head
        print('  (re-inserted the missing charset)')
    css = CSS.replace('__IMGA__', img).replace('__IMGB__', face_b())
    PAGE.write_text(head + css + BODY, encoding='utf-8')
    print(f'rebuilt {PAGE}  {PAGE.stat().st_size/1024:.0f} KB'
          f'  (facing A {len(img)/1024:.0f} KB kept, fonts kept)')


def face_b():
    """The SECOND facing, for the pivot. Generated here rather than committed as
    another 200 KB blob: the source is already in the repo and already licensed,
    and a derived file that nothing regenerates is a file that rots.

    It is a DIFFERENT COURT, not the same one from another angle, and the page
    says so loudly. Nobody can judge whether two facings match until the real
    art exists. What can be judged today is the MOTION, and the motion does not
    care what is in the pictures."""
    from PIL import Image
    src = ROOT / 'docs/play/assets/courts/blacktop-b-bgwide.jpg'
    buf = io.BytesIO()
    Image.open(src).convert('RGB').save(buf, 'WEBP', quality=78, method=6)
    b64 = base64.b64encode(buf.getvalue()).decode()
    print(f'  facing B generated from {src.name}: {len(buf.getvalue())/1024:.0f} KB webp')
    return 'data:image/webp;base64,' + b64


CSS = """/* ===== THE VIEWPORT. This is the whole engine's stage. =====================
   VERSION 3. Two facings now, because a pivot reveals geometry a push-in never
   can. Layers, top to bottom:

     .place   the frame. Fixed. This is the phone. Holds the perspective.
     .rig     the HEAD. Bobs while you walk, leans while you turn.
     .stack   the two FACINGS. How this moves IS the pivot, and there are three
              completely different answers, one per .m- class below.
     .face    one facing. Contains its own world and its own near field.
     .cam     the world. Scales toward a point, pans sideways to look around.
     .near    the near field. Scales at 1.9x the world's rate. THE PARALLAX,
              RULED IN by Aaron on 08-09, so it is on by default now.
     .pins    the hotspots, panning with the world so they stay on their things.
*/
.place{position:relative;width:100%;max-width:420px;margin:0 auto;aspect-ratio:9/14;
 border-radius:16px;overflow:hidden;border:1px solid var(--line);
 box-shadow:0 20px 50px rgba(0,0,0,.6);background:#000;touch-action:manipulation;
 perspective:900px;--dur:1100ms;--pdur:700ms;--bob:7px;--r:180px}

/* THE HEAD. Bobs only while moving. A walk cycle is three footfalls, with a
   little lateral sway and a fraction of a degree of roll, because a person
   leans into the foot they are on. The numbers are small on purpose. Anything
   you can consciously see is seasickness. */
/* NOT preserve-3d. The pins used to live here, and inside a 3D rendering
   context z-index is IGNORED: everything is sorted by computed depth instead.
   At 420px wide the faces landed a hair in front of the hotspots and every
   hotspot became unclickable on desktop while staying fine on a phone, because
   the frame is narrower there. They now live inside their own facing, where
   there is nothing to sort them against. */
.rig{position:absolute;inset:-14px}
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
/* turning on the spot is a LEAN, not a bob. One weight shift, no footfall arc. */
@keyframes lean{0%{transform:rotate(0)}40%{transform:rotate(var(--lean))}100%{transform:rotate(0)}}
.rig.turning{animation:lean var(--pdur) cubic-bezier(.4,0,.4,1) 1}

.stack{position:absolute;inset:0}
.face{position:absolute;inset:0;overflow:hidden;backface-visibility:hidden}

/* ---- PIVOT MODE ONE · SWING. A real carousel: the viewer stands at the origin
   and the two facings sit half a frame-width out, so rotating the stack really
   does turn you through ninety degrees. Costs the most in ART, because the
   seam between the two pictures is visible for the whole turn: they have to
   have been generated to meet. ------------------------------------------- */
.place.m-swing .stack{transform-style:preserve-3d;
 transform:translateZ(calc(var(--r) * -1));
 transition:transform var(--pdur) cubic-bezier(.45,.02,.2,1)}
.place.m-swing .fa{transform:translateZ(var(--r))}
.place.m-swing .fb{transform:rotateY(90deg) translateZ(var(--r))}
.place.m-swing.b .stack{transform:translateZ(calc(var(--r) * -1)) rotateY(-90deg)}

/* ---- PIVOT MODE TWO · WHIP. No 3D at all. The world slides and smears. Reads
   as turning FAST. Costs nothing in art: any two pictures whatsoever, because
   the smear hides the seam. This is what most games actually ship. ------- */
.place.m-whip .face{transition:transform var(--pdur) cubic-bezier(.55,0,.25,1)}
.place.m-whip .fb{transform:translateX(100%)}
.place.m-whip.b .fa{transform:translateX(-100%)}
.place.m-whip.b .fb{transform:translateX(0)}
@keyframes smear{0%,100%{filter:blur(0) saturate(1)}
 46%{filter:blur(7px) saturate(1.12) brightness(1.06)}}
.place.m-whip .stack.spin{animation:smear var(--pdur) ease-in-out 1}

/* ---- PIVOT MODE THREE · CUT. A short swing away, a hard cut, a short settle
   in. The cheapest, the oldest, and honestly the one most point-and-clicks
   used. Costs nothing in art and nothing in time. ------------------------ */
.place.m-cut .face{transition:transform 150ms ease-in,opacity 90ms linear}
.place.m-cut .fb{opacity:0;pointer-events:none}
.place.m-cut.pre .fa{transform:rotateY(-7deg) scale(1.035)}
.place.m-cut.b .fa{opacity:0;pointer-events:none}
.place.m-cut.b .fb{opacity:1;pointer-events:auto;
 transition:transform 190ms cubic-bezier(.2,.7,.3,1),opacity 90ms linear}
.place.m-cut.b.post .fb{transform:rotateY(7deg) scale(1.035)}

/* THE WORLD. background-size:auto 100% instead of cover, which renders
   identically for a wide image in a tall frame and buys the x position back.
   That x position is LOOKING AROUND, which is not the same thing as turning,
   and v2 conflated them. */
.cam{position:absolute;inset:0;
 transform-origin:50% 50%;transform:scale(1);
 transition:transform var(--dur) cubic-bezier(.33,.02,.2,1),
            background-position-x var(--dur) cubic-bezier(.4,.02,.25,1),
            filter var(--dur) ease;
 filter:brightness(.86)}
.fa .cam{background:url(__IMGA__) 50% center/auto 100% no-repeat}
.fb .cam{background:url(__IMGB__) 50% center/auto 100% no-repeat}

/* THE NEAR FIELD, and it is a STAND-IN, drawn not photographed. A real room
   delivers this as a transparent cutout of whatever is closest to you. Here it
   is a chain-link fence in SVG, because the pictures behind it are blacktops.
   Aaron ruled it IN on 08-09, so it is on unless you switch it off. */
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
 background:radial-gradient(120% 80% at 50% 45%,transparent 40%,rgba(0,0,0,.72));z-index:5}
.place.deep .vig{opacity:.55}
.place.deep .cam{filter:brightness(1)}

/* HOTSPOTS. Percentages, so they survive any screen. They live on .pins, which
   pans with the world, so a hotspot stays on its thing when you look around. */
.pins{position:absolute;inset:0;z-index:6;pointer-events:none;
 transition:transform var(--dur) cubic-bezier(.4,.02,.25,1),opacity .3s ease}
.place.b .pins{opacity:0;pointer-events:none}
.hs{position:absolute;transform:translate(-50%,-50%);background:none;border:0;padding:0;
 cursor:pointer;pointer-events:auto;-webkit-tap-highlight-color:transparent;
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

/* the LOOK arrows sit on the frame, not in the world. They are not the pivot
   and v2 was wrong to imply they were: they pan inside one picture. */
.turn{position:absolute;top:44%;transform:translateY(-50%);z-index:9;
 width:38px;height:64px;border-radius:9px;border:1px solid rgba(245,135,46,.4);
 background:rgba(10,7,5,.72);color:var(--ink);font-family:Anton;font-size:20px;
 cursor:pointer;-webkit-tap-highlight-color:transparent;
 display:grid;place-items:center;transition:opacity .25s ease}
.turn.l{left:8px}.turn.r{right:8px}
.turn[disabled]{opacity:.18;cursor:default}
/* THE PIVOT. Its own control, deliberately not an arrow, because it does a
   different thing: it turns you ninety degrees into a picture you have not
   seen. */
.piv{position:absolute;left:50%;transform:translateX(-50%);bottom:52px;z-index:9;
 font-family:Mono;font-size:9px;letter-spacing:.16em;text-transform:uppercase;
 background:rgba(245,135,46,.92);color:#1a0d02;border:0;border-radius:8px;
 padding:9px 15px;cursor:pointer;-webkit-tap-highlight-color:transparent;
 box-shadow:0 6px 18px rgba(0,0,0,.55)}

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
.rack h4 + .ctl{margin-bottom:0}
.rack .sep{height:1px;background:var(--line);margin:13px -13px 12px}
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
h3.sub{font-family:Anton;font-weight:400;text-transform:uppercase;font-size:20px;
 margin:30px 0 0;letter-spacing:.02em}
footer{margin-top:30px;border-top:1px solid var(--line);padding-top:15px;
 font-family:Mono;font-size:10px;letter-spacing:.09em;color:var(--faint);line-height:1.9}
@media(prefers-reduced-motion:reduce){
 .cam,.near,.pins,.face,.stack{transition-duration:1ms}.hs .ring{animation:none}
 .rig.walking,.rig.turning,.stack.spin{animation:none}}
</style>
"""

BODY = """<div class="wrap">
<p class="eyebrow">Ball Knowledge &middot; 9 August 2026 &middot; spike v3, nothing commissioned</p>
<h1>The Places</h1>
<p class="stand">v2 answered "does a push-in feel like walking". Aaron ruled:
<b>"I def need the near layer"</b>, so the parallax is in and every room now
ships as a background plus cutouts. Then: <b>"I want to at least try the pivot
once so I can see how it will feel."</b> Here it is, three ways, because a pivot
is not one thing and the three cost wildly different amounts of art.</p>

<div class="place par m-swing" id="pl">
  <div class="rig" id="rig">
    <div class="stack" id="stack">
      <div class="face fa"><div class="cam"></div><div class="near"></div>
    <div class="pins" id="pins">
      <button class="hs" style="left:28%;top:50%;--w:150px;--h:120px" data-x="26" data-y="50" data-z="1.9" data-nm="The wall">
        <span class="ring"><i>&#8599;</i></span><span class="cap">The wall</span></button>
      <button class="hs" style="left:66%;top:46%;--w:130px;--h:150px" data-x="68" data-y="44" data-z="1.9" data-nm="The gate">
        <span class="ring"><i>&#8593;</i></span><span class="cap">The gate</span></button>
      <button class="hs" style="left:48%;top:74%;--w:190px;--h:100px" data-x="48" data-y="76" data-z="1.7" data-nm="The court">
        <span class="ring"><i>&#8595;</i></span><span class="cap">The court</span></button>
    </div>
      </div>
      <div class="face fb"><div class="cam"></div><div class="near"></div></div>
    </div>
  </div>
  <div class="vig"></div>
  <button class="turn l" id="tl" aria-label="Look left">&#8249;</button>
  <button class="turn r" id="tr" aria-label="Look right">&#8250;</button>
  <button class="piv" id="pv">Pivot 90&deg; &#8635;</button>
  <div class="hud">
    <span class="where" id="wh">You are <b>standing at the gate</b></span>
    <button class="back" id="bk">&#8592; Face front</button>
  </div>
</div>

<div class="ab">
  <button id="bz">Zoom to the gate<small>v1 &middot; camera only</small></button>
  <button id="bw" class="walk">Walk to the gate<small>everything on</small></button>
</div>

<div class="rack">
  <h4>How the pivot moves &middot; press one, then Pivot</h4>
  <div class="ctl">
    <button id="ms" class="on">Swing &middot; a real 90&deg;</button>
    <button id="mw">Whip &middot; smear</button>
    <button id="mc">Cut &middot; swing, cut, settle</button>
    <button id="pd">Pivot 700ms</button>
  </div>
  <div class="sep"></div>
  <h4>The walk, one switch at a time</h4>
  <div class="ctl">
    <button id="cb" class="on">Head bob</button>
    <button id="cs" class="on">Footsteps</button>
    <button id="cp" class="on">Near layer</button>
    <button id="cd">Slow &middot; 1600ms</button>
    <button id="tg">Show hotspots</button>
  </div>
</div>

<h3 class="sub">The pivot, and what each one costs</h3>
<p class="stand" style="margin:8px 0 0">Press one, press Pivot, press it again to
come back. <b>The two pictures are DIFFERENT COURTS, not one place from two
angles</b>, because no such pair exists in this repo yet. Ignore what is in them.
Judge the motion.</p>
<div class="scroll"><table class="cm">
<thead><tr><th>mode</th><th>what it is</th><th>what it costs in ART</th></tr></thead>
<tbody>
<tr class="pick"><td><b>Swing</b></td><td>A real carousel. You stand at the middle, the two facings sit half a frame out, and the stack rotates ninety degrees around you. This is a genuine turn</td><td><b>The most.</b> The seam between the two pictures is on screen for the whole turn, so they have to be GENERATED TO MEET. In practice that means one wide panorama per room, not two separate pictures</td></tr>
<tr><td><b>Whip</b></td><td>No 3D at all. The world slides sideways and smears. Reads as turning fast</td><td><b>Nothing.</b> Any two pictures. The blur hides the seam, which is exactly why so many games ship this</td></tr>
<tr><td><b>Cut</b></td><td>A short swing away, a hard cut, a short settle in. The oldest answer in the genre</td><td><b>Nothing.</b> And it is the fastest, which on a phone is worth more than it sounds</td></tr>
</tbody></table></div>

<ul class="k">
  <li><b>Looking is not turning, and v2 blurred them.</b> The <i>&#8249; &#8250;</i>
    arrows pan inside ONE picture: you are moving your eyes. <b>Pivot</b> turns you
    ninety degrees into a picture you have not seen. They feel different and they
    cost different amounts, so they are two controls now instead of one.</li>
  <li><b>The near layer is RULED IN and on by default.</b> It is still worth
    switching off once, because that switch is the whole reason every room has to
    arrive as a background plus two or three transparent cutouts instead of one
    flat picture.</li>
  <li><b>The head does something different when you turn.</b> Walking bobs, three
    footfalls. Turning LEANS, one weight shift, no arc. Same idea, a third of the
    movement, and if you switch the bob off you lose both.</li>
  <li><b>Nothing here is new art.</b> Facing A is <code>blacktop-a-bgwide.jpg</code>,
    facing B is <code>blacktop-b-bgwide.jpg</code>, both already in the repo and
    already licensed. The second one is generated into the page at build time
    rather than committed, so nothing rots.</li>
</ul>

<p class="note"><b>WHAT THE PIVOT ACTUALLY DECIDES.</b> Not whether we can turn,
we can. It decides <b>what shape the art is</b>, and that is the one thing that
cannot be changed later.<br><br>
If SWING is the answer, every room is <b>one wide panorama</b> generated in a
single pass so the facings genuinely meet, plus its cutouts. If WHIP or CUT is
the answer, every room is <b>a handful of separate pictures</b> that never have
to line up, plus cutouts, and the art gets easier while the number of files
goes up. There is no wrong answer here and there is no changing it in month
three.</p>

<p class="note"><b>What v1 and v2 established and this keeps.</b> A 16:9 backdrop
in a phone frame is cropped by 64 percent, so base images must be portrait or
near square and 3000px or more on the long edge. Every court backdrop we own is
1376x768, which is what makes them backdrops and not rooms. Speed was never the
missing variable in the walk: parallax, bob and footsteps were, and the
footsteps are the biggest of the three and are now on Aaron's sourcing list.</p>

<p class="note"><b>What to judge now.</b> One, on your phone. Two, which of the
three pivots feels like turning your head rather than a slideshow. Three, whether
the extra art discipline SWING demands is worth what it buys, given you will be
looking at these rooms for a year. Four, is 700ms right for a turn, it is
deliberately faster than the 1100ms walk because turning your head is faster than
walking across a room.</p>

<footer>
Two images, blacktop-a-bgwide.jpg and blacktop-b-bgwide.jpg, both already in the
repo and already licensed &middot; the near layer is drawn SVG, a stand-in for a real
cutout &middot; footsteps are synthesised, no audio file &middot; zero new art &middot;
docs/dev/places-spike.html &middot; built by tools/spike-build.py &middot; checked by
tools/spike-check.mjs &middot; analysis in BUILD.md section 6, THE PLACES
</footer>
</div>
<script>
/* THE ENGINE v3. A node is a point, a zoom and a FACING. Walking is four layers
   disagreeing on purpose. Turning is the whole stack moving, and which way it
   moves is the only real question left. */
var pl=document.getElementById('pl'), rig=document.getElementById('rig'),
    stack=document.getElementById('stack'), pins=document.getElementById('pins'),
    wh=document.getElementById('wh'), bk=document.getElementById('bk'),
    tl=document.getElementById('tl'), tr=document.getElementById('tr'),
    pv=document.getElementById('pv');
var FACE=[document.querySelector('.fa'),document.querySelector('.fb')];
var cam=function(){return FACE[S.face].querySelector('.cam')};
var near=function(){return FACE[S.face].querySelector('.near')};

var HOME={x:50,y:50,z:1,pan:50,nm:'standing at the gate'};
var S={bob:true, steps:true, par:true, dur:1100, pdur:700, pan:50, z:1,
       face:0, mode:'swing', busy:false};
var NAMES=['standing at the gate','facing the other way'];

/* THE NEAR FIELD MOVES FURTHER. That single number is the whole illusion.
   1.9 was picked by eye and is the one value on this page worth arguing about:
   too low and it is still a zoom, too high and the fence tears off the screen. */
var NEAR_RATE=1.9;

/* ---- feet, synthesised. A footfall is a noise burst that dies fast,
   bandpassed low so it thumps rather than hisses. A pivot scuff is the same
   thing shorter, quieter and higher, because you are not landing on it. ---- */
var AC=null;
function ac(){
  if(!AC){var C=window.AudioContext||window.webkitAudioContext; if(!C)return null; AC=new C();}
  if(AC.state==='suspended')AC.resume();
  return AC;
}
function foot(at,gain,len,lo,hi){
  var c=ac(); if(!c)return;
  len=len||0.17; lo=lo||330; hi=hi||170;
  var n=Math.floor(c.sampleRate*len), buf=c.createBuffer(1,n,c.sampleRate),
      d=buf.getChannelData(0);
  for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,7);
  var s=c.createBufferSource(); s.buffer=buf;
  var bp=c.createBiquadFilter(); bp.type='bandpass';
  bp.frequency.value=lo+Math.random()*hi; bp.Q.value=1.15;
  var lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2100;
  var g=c.createGain(); g.gain.value=gain;
  s.connect(bp); bp.connect(lp); lp.connect(g); g.connect(c.destination);
  s.start(c.currentTime+at);
}
/* three footfalls on the bob's low points, 16% / 50% / 83% */
function walkSound(dur){
  if(!S.steps)return;
  foot(dur*0.16/1000,0.30); foot(dur*0.50/1000,0.26); foot(dur*0.83/1000,0.19);
}
/* a pivot is two scuffs, not three steps */
function turnSound(dur){
  if(!S.steps)return;
  foot(dur*0.10/1000,0.20,0.11,520,240); foot(dur*0.58/1000,0.15,0.13,430,200);
}

var bobTimer=null;
function radius(){pl.style.setProperty('--r',(pl.clientWidth/2)+'px')}
window.addEventListener('resize',radius);

function apply(){
  pl.style.setProperty('--dur',S.dur+'ms');
  pl.style.setProperty('--pdur',S.pdur+'ms');
  pl.classList.toggle('par',S.par);
  var c=cam(), n=near();
  c.style.transform='scale('+S.z+')';
  n.style.transform='scale('+(1+(S.z-1)*NEAR_RATE)+')';
  c.style.backgroundPositionX=S.pan+'%';
  n.style.backgroundPositionX=S.pan+'%';
  pins.style.transform='translateX('+((50-S.pan)*0.9)+'%)';
  pl.classList.toggle('deep',S.z>1.01);
  var turned=Math.abs(S.pan-50)>1||S.face!==0;
  pl.classList.toggle('turned',turned);
  bk.innerHTML=(S.z>1.01)?'&#8592; Step back':'&#8592; Face front';
  tl.disabled=S.pan<=2; tr.disabled=S.pan>=98;
}
function move(){
  apply();
  if(S.bob){
    rig.classList.remove('walking'); void rig.offsetWidth;
    rig.classList.add('walking');
    clearTimeout(bobTimer);
    bobTimer=setTimeout(function(){rig.classList.remove('walking')},S.dur+40);
  }
  walkSound(S.dur);
}
function go(n){
  S.z=n.z; if(n.pan!==undefined)S.pan=n.pan;
  var c=cam(), nr=near();
  c.style.transformOrigin=n.x+'% '+n.y+'%';
  nr.style.transformOrigin=n.x+'% '+n.y+'%';
  wh.innerHTML='You are <b>'+n.nm+'</b>';
  move();
}
document.querySelectorAll('.hs').forEach(function(h){
  h.addEventListener('click',function(){
    go({x:+h.dataset.x,y:+h.dataset.y,z:+h.dataset.z,nm:'at '+h.dataset.nm.toLowerCase()});
  });
});
bk.addEventListener('click',function(){
  if(S.face!==0){pivot();return;}
  go(HOME);
});

/* LOOKING. No scale change, no facing change, the world sliding inside ONE
   picture. This is your eyes, not your feet. */
function look(dir){
  S.pan=Math.max(0,Math.min(100,S.pan+dir*22));
  wh.innerHTML='You are <b>looking '+(dir<0?'left':'right')+'</b>';
  move();
}
tl.addEventListener('click',function(){look(-1)});
tr.addEventListener('click',function(){look(1)});

/* THE PIVOT. Ninety degrees into a picture you have not seen, which is the one
   thing a flat push-in can never do. Three modes, three different art bills. */
function pivot(){
  if(S.busy)return; S.busy=true;
  radius();
  var to=1-S.face, d=S.pdur;
  /* reset the outgoing facing so you never come back to a half-zoomed view */
  S.z=1; S.pan=50; apply();
  rig.style.setProperty('--lean',(to===1?'-.9deg':'.9deg'));
  if(S.bob){rig.classList.remove('turning'); void rig.offsetWidth;
            rig.classList.add('turning');
            setTimeout(function(){rig.classList.remove('turning')},d+40);}
  turnSound(d);

  if(S.mode==='cut'){
    pl.classList.add('pre');
    setTimeout(function(){
      pl.classList.remove('pre');
      pl.classList.toggle('b',to===1);
      pl.classList.add('post');
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        pl.classList.remove('post');});});
      finish(to,220);
    },150);
    return;
  }
  if(S.mode==='whip'){
    stack.classList.remove('spin'); void stack.offsetWidth; stack.classList.add('spin');
    setTimeout(function(){stack.classList.remove('spin')},d+40);
  }
  pl.classList.toggle('b',to===1);
  finish(to,d);
}
function finish(to,ms){
  setTimeout(function(){
    S.face=to; S.z=1; S.pan=50; S.busy=false;
    var c=cam(); c.style.transformOrigin='50% 50%';
    near().style.transformOrigin='50% 50%';
    wh.innerHTML='You are <b>'+NAMES[to]+'</b>';
    apply();
  },ms+30);
}
pv.addEventListener('click',pivot);

/* ---- the A/B. Same destination, same duration. Only the trimmings differ. --- */
var GATE={x:68,y:44,z:1.9,nm:'at the gate'};
document.getElementById('bz').addEventListener('click',function(){
  if(S.face!==0)return;
  var b=S.bob,s=S.steps,p=S.par; S.bob=S.steps=S.par=false;
  go({x:GATE.x,y:GATE.y,z:GATE.z,nm:'at the gate &middot; camera only'});
  setTimeout(function(){S.bob=b;S.steps=s;S.par=p;apply()},S.dur+60);
});
document.getElementById('bw').addEventListener('click',function(){
  if(S.face!==0)return;
  S.bob=S.steps=S.par=true; paintSwitches(); go(GATE);
});

/* ---- the switches ---- */
function setMode(m){
  S.mode=m;
  pl.classList.remove('m-swing','m-whip','m-cut','b','pre','post');
  pl.classList.add('m-'+m);
  S.face=0; S.z=1; S.pan=50;
  ['ms','mw','mc'].forEach(function(id,i){
    document.getElementById(id).classList.toggle('on',['swing','whip','cut'][i]===m);});
  wh.innerHTML='You are <b>'+NAMES[0]+'</b>';
  apply();
}
function paintSwitches(){
  document.getElementById('cb').classList.toggle('on',S.bob);
  document.getElementById('cs').classList.toggle('on',S.steps);
  document.getElementById('cp').classList.toggle('on',S.par);
  var d=document.getElementById('cd');
  d.classList.toggle('on',S.dur!==1100);
  d.textContent=S.dur===1100?'Slow · 1600ms':'Normal · 1100ms';
  var q=document.getElementById('pd');
  q.classList.toggle('on',S.pdur!==700);
  q.textContent='Pivot '+S.pdur+'ms';
  apply();
}
document.getElementById('ms').addEventListener('click',function(){setMode('swing')});
document.getElementById('mw').addEventListener('click',function(){setMode('whip')});
document.getElementById('mc').addEventListener('click',function(){setMode('cut')});
document.getElementById('pd').addEventListener('click',function(){
  S.pdur=S.pdur===700?1200:700; paintSwitches();});
document.getElementById('cb').addEventListener('click',function(){S.bob=!S.bob;paintSwitches()});
document.getElementById('cs').addEventListener('click',function(){S.steps=!S.steps;if(S.steps)foot(0,.3);paintSwitches()});
document.getElementById('cp').addEventListener('click',function(){S.par=!S.par;paintSwitches()});
document.getElementById('tg').addEventListener('click',function(){
  pl.classList.toggle('show-hs'); this.classList.toggle('on');
  this.textContent=pl.classList.contains('show-hs')?'Hide hotspots':'Show hotspots';
});
radius(); paintSwitches();
window.BKSpike=function(){return {z:S.z,pan:S.pan,bob:S.bob,steps:S.steps,par:S.par,
  dur:S.dur,pdur:S.pdur,face:S.face,mode:S.mode,
  nearScale:1+(S.z-1)*NEAR_RATE}};
</script>
"""


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""THE FEEL STANDARD proposal board (V0 B18, Aaron: "I want POLISHED").

Nothing here is shipped. Every rule is a live demo the thumb can compare,
current behavior against proposed, because taste rulings on motion cannot be
made from prose. The "today" demos replicate the shipped code's values
exactly (the 880Hz 50ms square click, the dock's instant pop, the missing
press states); the sources are cited in the footer. Game-world skin on
purpose: the board should feel like the game it is tuning."""
import base64, os

FONTS = 'docs/play/assets/fonts'
OUT = 'design/feel-board.html'


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Feel Standard</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  /* one visual world, the game's own; both host themes get the same night */
  :root{{--ground:#0f0b09;--raised:#181310;--panel:#1d1710;--line:#4a3f31;
    --ink:#fff5e2;--dim:#a3937f;--accent:#f5872e;--good:#6fbf73;--warn:#e8b84b;--bad:#d5524b}}
  *{{box-sizing:border-box}}
  html{{background:var(--ground)}}
  body{{margin:0;background:var(--ground);color:var(--ink);font-size:16px;line-height:1.6;
    font-family:Archivo,ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:760px;margin:0 auto;padding:0 18px 110px;display:flex;flex-direction:column;gap:46px}}
  .eyebrow{{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.2em;
    text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(40px,10vw,64px);line-height:.96;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:22px;margin:0;letter-spacing:.02em}}
  h2 .rn{{color:var(--accent);margin-right:8px}}
  p{{margin:0}}
  .lede{{color:var(--dim);font-size:16.5px;max-width:60ch}}
  .lede strong{{color:var(--ink)}}
  header.top{{padding:52px 0 0;display:flex;flex-direction:column;gap:16px}}
  blockquote{{margin:0;padding:10px 0 10px 18px;border-left:3px solid var(--accent);
    font-size:17px;max-width:56ch}}
  blockquote cite{{display:block;margin-top:6px;font-style:normal;font-size:12px;
    color:var(--dim);font-family:'Space Mono',monospace}}
  section{{display:flex;flex-direction:column;gap:14px}}
  .rule{{background:var(--raised);border:1px solid var(--line);border-radius:12px;
    padding:16px 18px;color:var(--dim);font-size:15px}}
  .rule b{{color:var(--ink)}}
  .call{{display:inline-block;font-family:'Space Mono',monospace;font-size:10.5px;
    letter-spacing:.14em;color:#17110a;background:var(--warn);border-radius:4px;
    padding:2px 8px;margin-right:8px;font-weight:700}}
  .demo{{background:var(--panel);border:1px solid var(--line);border-radius:12px;
    padding:16px;display:flex;flex-direction:column;gap:12px}}
  .demo .lab{{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.16em;
    color:var(--dim);text-transform:uppercase}}
  .duo{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}
  @media (max-width:560px){{.duo.stack{{grid-template-columns:1fr}}}}
  .half{{display:flex;flex-direction:column;gap:8px;min-width:0}}
  .tag{{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.16em;
    padding:2px 8px;border-radius:3px;align-self:flex-start}}
  .tag.now{{background:rgba(0,0,0,.5);color:#cfc4ae;border:1px solid var(--line)}}
  .tag.new{{background:var(--accent);color:#1b120a;font-weight:700}}

  /* the shared fake-game bits the demos animate */
  .row{{display:flex;justify-content:space-between;align-items:center;gap:12px;
    background:rgba(20,14,10,.94);border:1.5px solid var(--line);border-radius:11px;
    padding:12px 14px;font-family:'Space Mono',monospace;color:var(--ink);cursor:pointer;
    -webkit-tap-highlight-color:transparent;user-select:none;text-align:left;width:100%}}
  .row b{{font-size:13px;letter-spacing:.12em}}
  .row span{{font-size:10.5px;color:#c8a76a}}
  .row.pressy{{transition:transform .12s cubic-bezier(.2,.9,.3,1),filter .12s,border-color .12s}}
  .row.pressy:active{{transform:scale(.965);filter:brightness(1.25);border-color:var(--accent)}}
  button.bare{{all:unset;display:block;width:100%}}
  .stagebtn{{font-family:Archivo,sans-serif;font-weight:700;font-size:13px;letter-spacing:.1em;
    text-transform:uppercase;background:var(--accent);color:#241000;border:0;border-radius:8px;
    padding:11px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent}}
  .ghostbtn{{background:none;border:1px solid var(--line);color:var(--dim);border-radius:8px;
    font-family:'Space Mono',monospace;font-size:11.5px;letter-spacing:.12em;padding:9px 14px;cursor:pointer}}

  .chips{{display:flex;gap:8px;flex-wrap:wrap}}
  .chip{{font-family:'Space Mono',monospace;font-size:12px;border:1px solid var(--line);
    border-radius:999px;padding:7px 14px;color:var(--dim);cursor:pointer;background:none}}
  .chip.on{{border-color:var(--accent);color:var(--accent);font-weight:700}}
  .stage{{position:relative;height:96px;border:1px dashed var(--line);border-radius:10px;overflow:hidden}}
  .mover{{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:64px;height:64px;
    border-radius:12px;background:linear-gradient(140deg,#ffa14e,var(--accent));
    display:flex;align-items:center;justify-content:center;font-family:Anton;color:#241000;font-size:20px}}
  .curveline{{font-family:'Space Mono',monospace;font-size:10.5px;color:var(--dim)}}

  .minidock{{display:flex;flex-direction:column;gap:8px}}
  .minidock.hid{{visibility:hidden}}
  .minidock.pop{{visibility:visible}}
  .minidock.rise{{visibility:visible;animation:dockRise .44s cubic-bezier(.2,.9,.3,1) both}}
  @keyframes dockRise{{from{{transform:translateY(26px);opacity:0}}to{{transform:none;opacity:1}}}}

  .fbanner{{background:rgba(16,10,6,.92);border:1px solid var(--line);border-radius:10px;
    padding:10px 14px;font-size:14px;min-height:44px;display:flex;align-items:center}}
  .fbanner b{{color:var(--accent);margin-right:6px}}
  .fbanner .txt{{display:inline-block}}
  .fbanner .txt.xfade{{animation:bIn .24s cubic-bezier(.2,.9,.3,1) both}}
  @keyframes bIn{{from{{opacity:0;transform:translateY(5px)}}to{{opacity:1;transform:none}}}}

  .drops{{position:relative;height:120px;border:1px dashed var(--line);border-radius:10px}}
  .ballchip{{position:absolute;top:6px;left:50%;margin-left:-17px;width:34px;height:34px;border-radius:50%;
    background:radial-gradient(circle at 32% 30%,#ffb066,#e35b0e 70%);box-shadow:0 3px 8px rgba(0,0,0,.5)}}
  .ballchip.fall{{animation:chipFall .44s cubic-bezier(.5,0,.72,.35) both}}
  @keyframes chipFall{{to{{transform:translateY(74px)}}}}

  /* R7 · the beauty moves */
  .wash{{border:1px solid var(--line);border-radius:12px;min-height:104px;padding:14px;
    display:flex;align-items:center;justify-content:center;gap:12px;
    transition:background .6s ease}}
  .wash.flat{{background:rgba(20,14,10,.94)}}
  .wash .wn{{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;
    color:#e8ddca;max-width:74px;text-align:center}}
  .wash .ws{{font-family:Anton;font-size:44px;font-weight:400;color:#fff;line-height:1}}
  .wash .ws.dim2{{opacity:.55}}
  .wash i{{color:rgba(255,255,255,.5);font-style:normal}}
  .scorerow{{display:flex;align-items:center;justify-content:center;gap:14px;
    background:rgba(20,14,10,.94);border:1px solid var(--line);border-radius:12px;padding:16px 12px}}
  .scorerow span{{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.12em;color:#cfc4ae}}
  .scorerow b{{font-family:Anton;font-weight:400;font-size:34px;line-height:1;color:#fff}}
  .scorerow .win{{color:#fff;opacity:1}}
  .scorerow span.win{{color:#e8ddca}}
  .scorerow .lose{{opacity:.38}}
  .minicard{{background:#141018;border:1.5px solid var(--line);border-radius:14px;
    padding:14px;display:flex;flex-direction:column;gap:8px;min-height:120px}}
  .minicard span{{font-family:'Space Mono',monospace;font-size:9.5px;letter-spacing:.18em;
    color:var(--warn)}}
  .minicard p{{font-size:14.5px;font-weight:600;line-height:1.45}}
  .minicard.glow{{border-color:rgba(232,184,75,.8);
    box-shadow:0 0 18px rgba(232,184,75,.28),0 0 2px rgba(232,184,75,.7),0 14px 30px rgba(0,0,0,.6);
    background:linear-gradient(160deg,#1b1420,#141018 60%)}}
  ul{{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;color:var(--dim);font-size:15px}}
  ul strong{{color:var(--ink)}}
  table{{border-collapse:collapse;font-size:13.5px;width:100%}}
  td,th{{border-bottom:1px solid var(--line);padding:7px 10px;text-align:left;color:var(--dim);
    font-family:'Space Mono',monospace}}
  th{{color:var(--ink);font-size:11px;letter-spacing:.14em;text-transform:uppercase}}
  td b{{color:var(--ink)}}
  .tablewrap{{overflow-x:auto}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:11.5px;
    border-top:1px solid var(--line);padding-top:18px;line-height:1.8}}
  @media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · proposal board · nothing shipped</p>
    <h1>The feel standard</h1>
    <blockquote>"I love what we have done but I want POLISHED."
      <cite>Aaron, 08-18 · every demo below runs live, tap everything</cite></blockquote>
    <p class="lede">Six rules. Each one is a <strong>live before/after your thumb can
      compare</strong>, with the shipped behavior reproduced exactly on the left.
      A yellow <span class="call">YOUR CALL</span> marks where taste decides and
      your ruling is needed. Nothing changes in the game until you rule.</p>
  </header>

  <section>
    <h2><span class="rn">R0</span>What was measured first</h2>
    <div class="rule">Counted from the shipped code, not from impressions. The good news:
      screen-to-screen already pans (440ms, a real curve), the slams land, one sound (the
      VS bolt) is already a designed, layered piece. The gaps are below, and they are the
      whole reason the game reads "almost glitchy".</div>
    <div class="tablewrap"><table>
      <tr><th>Measured</th><th>Today</th></tr>
      <tr><td>Distinct animation durations</td><td><b>14</b> (.16s to .6s, no scale)</td></tr>
      <tr><td>Distinct easing curves</td><td><b>8</b></td></tr>
      <tr><td>The dock and its menus entering</td><td><b>instant pop</b>, no motion at all</td></tr>
      <tr><td>The banner changing its sentence</td><td><b>instant text swap</b></td></tr>
      <tr><td>Controls with press-down feedback</td><td><b>13 kinds</b>; the answer buttons, action rows, setup cards and more have <b>none</b></td></tr>
      <tr><td>Interface sounds</td><td><b>11 synth cues, 40-350ms, hard attacks</b> · your words: "short fast bursts"</td></tr>
    </table></div>
  </section>

  <section>
    <h2><span class="rn">R1</span>One clock</h2>
    <div class="rule"><span class="call">YOUR CALL</span><b>Five durations, and only five.</b>
      120ms answers the finger · 240ms changes an element · 440ms enters or leaves a surface
      (the number the screen pan already uses) · 700ms plays an event beat · 1700ms is a slam.
      Every animation in the game snaps to one of these. Tap each to feel it.</div>
    <div class="demo">
      <div class="chips" id="clockChips">
        <button class="chip on" data-ms="120">120</button>
        <button class="chip" data-ms="240">240</button>
        <button class="chip" data-ms="440">440</button>
        <button class="chip" data-ms="700">700</button>
        <button class="chip" data-ms="1700">1700</button>
      </div>
      <div class="stage"><div class="mover" id="clockMover">23</div></div>
      <p class="curveline" id="clockLab">120ms · the finger's answer</p>
    </div>
  </section>

  <section>
    <h2><span class="rn">R2</span>Two curves, and the pop stays special</h2>
    <div class="rule"><span class="call">YOUR CALL</span><b>Everything enters on the game
      curve, leaves on the exit curve.</b> The game curve is already the most-used curve in
      the shipped code; this promotes it to law. The bouncy pop is reserved for slams and
      celebrations, so a slam still feels bigger than a menu.</div>
    <div class="demo">
      <div class="chips">
        <button class="chip on" data-cv="game">the game curve</button>
        <button class="chip" data-cv="exit">the exit curve</button>
        <button class="chip" data-cv="pop">the pop (slams only)</button>
      </div>
      <div class="stage"><div class="mover" id="curveMover">7</div></div>
      <p class="curveline" id="curveLab">cubic-bezier(.2,.9,.3,1) · eases in fast, settles soft</p>
    </div>
  </section>

  <section>
    <h2><span class="rn">R3</span>Everything answers the finger</h2>
    <div class="rule"><b>Every tappable thing reacts the moment it is touched</b>, 120ms,
      a slight shrink and brighten, before the action even fires. This is the single
      biggest share of "feels native". Today the answer buttons on a question card, the
      SHOOT/PASS/MOVE rows, the setup cards and nine other controls do nothing until
      release. Hold each row down and compare.</div>
    <div class="demo">
      <div class="duo stack">
        <div class="half"><span class="tag now">TODAY</span>
          <button class="bare"><span class="row"><b>PASS</b><span>2 open · 2 covered</span></span></button>
        </div>
        <div class="half"><span class="tag new">PROPOSED</span>
          <button class="bare"><span class="row pressy"><b>PASS</b><span>2 open · 2 covered</span></span></button>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2><span class="rn">R4</span>Nothing pops, everything arrives</h2>
    <div class="rule"><span class="call">YOUR CALL</span><b>The dock rises, the banner
      crossfades, a card scales in.</b> Surfaces stop teleporting: the dock enters from
      the bottom edge in 440ms, the banner's old sentence gives way to the new one in 240ms
      instead of being overwritten mid-read.</div>
    <div class="demo">
      <div class="lab">The dock arriving · replay both</div>
      <div class="duo stack">
        <div class="half"><span class="tag now">TODAY · POP</span>
          <div class="minidock hid" id="dockA">
            <span class="row"><b>FREE MOVES</b><span>3 still to step</span></span>
            <span class="row"><b>DONE</b><span>run your main action ▸</span></span>
          </div>
        </div>
        <div class="half"><span class="tag new">PROPOSED · RISE</span>
          <div class="minidock hid" id="dockB">
            <span class="row"><b>FREE MOVES</b><span>3 still to step</span></span>
            <span class="row"><b>DONE</b><span>run your main action ▸</span></span>
          </div>
        </div>
      </div>
      <button class="ghostbtn" id="dockGo">Replay the arrival</button>
      <div class="lab" style="margin-top:6px">The banner changing its mind · replay both</div>
      <div class="duo stack">
        <div class="half"><span class="tag now">TODAY · SWAP</span>
          <div class="fbanner"><span class="txt" id="banA"><b>Your ball.</b> Pass it in.</span></div>
        </div>
        <div class="half"><span class="tag new">PROPOSED · CROSSFADE</span>
          <div class="fbanner"><span class="txt" id="banB"><b>Your ball.</b> Pass it in.</span></div>
        </div>
      </div>
      <button class="ghostbtn" id="banGo">Replay the change</button>
    </div>
  </section>

  <section>
    <h2><span class="rn">R5</span>Sound lands where the motion lands</h2>
    <div class="rule"><span class="call">YOUR CALL</span><b>Two changes: softer shapes, and
      timing.</b> Today's click is a 50-millisecond square wave, all attack, and every cue
      fires at the tap. Proposed: rounder envelopes (the VS bolt already proved the layered
      approach in this game), and event sounds fire when the motion LANDS, not when the
      finger taps. Sound on for this one.</div>
    <div class="demo">
      <div class="lab">The click itself</div>
      <div class="duo">
        <div class="half"><span class="tag now">TODAY</span>
          <button class="stagebtn" id="sndA">tap · today's click</button></div>
        <div class="half"><span class="tag new">PROPOSED</span>
          <button class="stagebtn" id="sndB">tap · shaped click</button></div>
      </div>
      <div class="lab" style="margin-top:6px">Timing · the same drop, sound at tap vs sound at landing</div>
      <div class="duo">
        <div class="half"><span class="tag now">AT THE TAP</span>
          <div class="drops"><div class="ballchip" id="dropA"></div></div>
          <button class="ghostbtn" id="dropAGo">Drop it</button></div>
        <div class="half"><span class="tag new">AT THE LANDING</span>
          <div class="drops"><div class="ballchip" id="dropB"></div></div>
          <button class="ghostbtn" id="dropBGo">Drop it</button></div>
      </div>
    </div>
  </section>

  <section>
    <h2><span class="rn">R6</span>What v1 does not touch, said out loud</h2>
    <div class="rule">Your instruction was no silent compromises, so the three things this
      standard deliberately leaves alone are listed as decisions, not skipped:</div>
    <ul>
      <li><strong>The pieces on the court.</strong> Their speeds are gameplay pacing; making
        them "smoother" changes how plays read. If they need retuning it is its own look,
        with its own before/after.</li>
      <li><strong>Continuity moments</strong> (the question card growing out of the tile you
        tapped, the menu growing out of the pressed button). Real rework per surface. Proposed
        as Phase 2, after the timing/press/sound pass proves itself.</li>
      <li><strong>Recorded sound.</strong> This pass shapes the game's own synthesized cues.
        Real recorded samples (crowd, leather, sneakers) are a sourcing decision with its own
        cost, already mapped on the Sound Sheet.</li>
    </ul>
  </section>

  <section>
    <h2><span class="rn">R7</span>The beauty moves</h2>
    <div class="rule"><span class="call">YOUR CALL</span><b>Your ruling, same night: the bar
      is beauty, not genre.</b> So the reference pull went to the most beautiful screens on a
      phone, and three moves came back that our game can wear tonight-cheap because the
      ingredients already exist. Each is live below; each would ship as its own before/after.</div>
    <div class="demo">
      <div class="lab">7a · The match wears both squads' colours (Apple Sports' move) · tap a matchup</div>
      <div class="chips" id="washChips">
        <button class="chip on" data-w="0">orange v blue</button>
        <button class="chip" data-w="1">crimson v teal</button>
        <button class="chip" data-w="2">violet v gold</button>
      </div>
      <div class="duo stack">
        <div class="half"><span class="tag now">TODAY · ONE DARK PANEL</span>
          <div class="wash flat"><span class="wn">SHOWTIME</span><b class="ws">7</b><i>·</i><b class="ws dim2">4</b><span class="wn">THE BRICKS</span></div>
        </div>
        <div class="half"><span class="tag new">PROPOSED · THE WASH</span>
          <div class="wash live" id="washB"><span class="wn">SHOWTIME</span><b class="ws">7</b><i>·</i><b class="ws dim2">4</b><span class="wn">THE BRICKS</span></div>
        </div>
      </div>
      <div class="lab" style="margin-top:6px">7b · The winner is BRIGHT, no words needed (their scores list)</div>
      <div class="duo stack">
        <div class="half"><span class="tag now">TODAY · EQUAL WEIGHT</span>
          <div class="scorerow"><span>SHOWTIME</span><b>96</b><b>120</b><span>BRICKS</span></div>
        </div>
        <div class="half"><span class="tag new">PROPOSED · BRIGHT WINS</span>
          <div class="scorerow"><span class="lose">SHOWTIME</span><b class="lose">96</b><b class="win">120</b><span class="win">BRICKS</span></div>
        </div>
      </div>
      <div class="lab" style="margin-top:6px">7c · A card is a treasured object (glow, pedestal)</div>
      <div class="duo">
        <div class="half"><span class="tag now">TODAY</span>
          <div class="minicard"><span>MEDIUM</span><p>Who holds the single-game rebound record?</p></div>
        </div>
        <div class="half"><span class="tag new">PROPOSED</span>
          <div class="minicard glow"><span>MEDIUM</span><p>Who holds the single-game rebound record?</p></div>
        </div>
      </div>
    </div>
    <div class="rule">And one move that is a RULE rather than a demo, from the most restrained
      screen in the pull (Opal: one lit stone in darkness, one sentence): <b>the biggest beats
      earn the emptiest screens.</b> The tip-off, the sweep, the grad cap: one lit thing, one
      line, nothing else competing. References with readings:
      design/reference/mobbin-pull-1.md.</div>
  </section>

  <section>
    <h2>The rulings needed</h2>
    <ul>
      <li><strong>R1</strong> · the five clock numbers (or tell me which feels wrong)</li>
      <li><strong>R2</strong> · the two curves plus reserved pop</li>
      <li><strong>R3</strong> · press feedback on every control (I see no taste fork here, but it ships nothing until you nod)</li>
      <li><strong>R4</strong> · dock rises · banner crossfades · card scales in</li>
      <li><strong>R5</strong> · shaped clicks and landing-timed event sounds</li>
      <li><strong>R6</strong> · the three exclusions above stay excluded from v1</li>
      <li><strong>R7</strong> · the beauty moves: the two-colour match wash (and which surfaces get it first) · bright-wins scores · the treasured card · empty screens for the biggest beats</li>
    </ul>
  </section>

  <footer>
    Measured from the shipped code 08-18: 80 transition rules and 14 distinct durations
    (grep over index.html), 18 :active rules against 16+ control families, the dock's
    display-flip (#stagebox.on), the banner's innerHTML swap (banner() in game.js),
    the click's recipe (blip 880Hz square, 4ms attack, 50ms, audio.js).
    "Today" demos reproduce those values exactly. Fonts and colors are the game's own.
  </footer>
</div>
<script>
(function(){{
  var CURVES={{game:'cubic-bezier(.2,.9,.3,1)',exit:'cubic-bezier(.5,0,.72,.35)',pop:'cubic-bezier(.2,1.3,.4,1)'}};
  var CLAB={{120:'120ms · the finger\\u2019s answer',240:'240ms · an element changes',
    440:'440ms · a surface enters or leaves',700:'700ms · an event beat',1700:'1700ms · a slam'}};
  var KLAB={{game:'cubic-bezier(.2,.9,.3,1) · eases in fast, settles soft',
    exit:'cubic-bezier(.5,0,.72,.35) · leaves without ceremony',
    pop:'cubic-bezier(.2,1.3,.4,1) · overshoots · slams and celebrations only'}};
  function run(el,ms,curve){{
    el.style.transition='none';el.style.transform='translateY(-50%)';
    void el.offsetWidth;
    el.style.transition='transform '+ms+'ms '+curve;
    var w=el.parentNode.clientWidth-el.clientWidth-20;
    el.style.transform='translateY(-50%) translateX('+(el._out?0:w)+'px)';
    el._out=!el._out;
  }}
  /* R1 */
  var clockMs=120,cm=document.getElementById('clockMover');
  document.getElementById('clockChips').addEventListener('click',function(e){{
    var b=e.target.closest('.chip');if(!b)return;
    this.querySelectorAll('.chip').forEach(function(x){{x.classList.remove('on')}});
    b.classList.add('on');clockMs=+b.dataset.ms;
    document.getElementById('clockLab').textContent=CLAB[clockMs];
    run(cm,clockMs,CURVES.game);
  }});
  cm.parentNode.addEventListener('click',function(){{run(cm,clockMs,CURVES.game)}});
  /* R2 */
  var curveK='game',vm=document.getElementById('curveMover');
  document.querySelectorAll('[data-cv]').forEach(function(b){{
    b.addEventListener('click',function(){{
      document.querySelectorAll('[data-cv]').forEach(function(x){{x.classList.remove('on')}});
      b.classList.add('on');curveK=b.dataset.cv;
      document.getElementById('curveLab').textContent=KLAB[curveK];
      run(vm,440,CURVES[curveK]);
    }});
  }});
  vm.parentNode.addEventListener('click',function(){{run(vm,440,CURVES[curveK])}});
  /* R4 dock */
  document.getElementById('dockGo').addEventListener('click',function(){{
    var a=document.getElementById('dockA'),b=document.getElementById('dockB');
    a.className='minidock hid';b.className='minidock hid';
    setTimeout(function(){{a.className='minidock pop';b.className='minidock rise'}},420);
  }});
  /* R4 banner */
  var lines=['<b>Setup done.</b> Their defense \\u00b7 one slide.','<b>Your ball.</b> Pass it in.'];
  var li=0;
  document.getElementById('banGo').addEventListener('click',function(){{
    li=1-li;
    var A=document.getElementById('banA'),B=document.getElementById('banB');
    A.innerHTML=lines[li];                       /* today: overwrite mid-read */
    B.style.opacity=0;
    setTimeout(function(){{B.innerHTML=lines[li];B.style.opacity=1;
      B.classList.remove('xfade');void B.offsetWidth;B.classList.add('xfade');}},120);
  }});
  /* R5 sound */
  var AC=null;
  function ac(){{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')AC.resume();return AC}}
  function env(g,t,a,d,lv){{g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(lv,t+a);
    g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);}}
  function todayClick(){{var A=ac(),t=A.currentTime,o=A.createOscillator(),g=A.createGain();
    o.type='square';o.frequency.value=880;env(g,t,0.004,0.05,0.35);
    o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+0.1);}}
  function shapedClick(){{var A=ac(),t=A.currentTime;
    var o=A.createOscillator(),g=A.createGain(),f=A.createBiquadFilter();
    o.type='triangle';o.frequency.setValueAtTime(560,t);
    o.frequency.exponentialRampToValueAtTime(420,t+0.09);
    f.type='lowpass';f.frequency.value=1900;
    env(g,t,0.010,0.11,0.30);
    o.connect(f);f.connect(g);g.connect(A.destination);o.start(t);o.stop(t+0.16);
    var p=A.createOscillator(),pg=A.createGain();
    p.type='sine';p.frequency.value=1680;env(pg,t+0.004,0.006,0.05,0.07);
    p.connect(pg);pg.connect(A.destination);p.start(t);p.stop(t+0.09);}}
  function thud(){{var A=ac(),t=A.currentTime,o=A.createOscillator(),g=A.createGain();
    o.type='sine';o.frequency.setValueAtTime(150,t);
    o.frequency.exponentialRampToValueAtTime(62,t+0.13);
    env(g,t,0.006,0.14,0.5);
    o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+0.2);}}
  document.getElementById('sndA').addEventListener('click',todayClick);
  document.getElementById('sndB').addEventListener('click',shapedClick);
  function drop(chipId,when){{
    var c=document.getElementById(chipId);
    c.classList.remove('fall');void c.offsetWidth;
    if(when==='tap')thud();
    c.classList.add('fall');
    if(when==='land')setTimeout(thud,430);
  }}
  document.getElementById('dropAGo').addEventListener('click',function(){{drop('dropA','tap')}});
  document.getElementById('dropBGo').addEventListener('click',function(){{drop('dropB','land')}});
  /* R7a · the two-squad wash, Apple Sports' move on our colours */
  var WASHES=[['#f5872e','#58a8d6'],['#d5524b','#6fd0c3'],['#8a5cf5','#e8b84b']];
  function washBg(pair){{
    return 'linear-gradient(115deg,'+pair[0]+'cc 0%,'+pair[0]+'55 30%,#14100b 50%,'+pair[1]+'55 70%,'+pair[1]+'cc 100%)';
  }}
  var wb=document.getElementById('washB');
  wb.style.background=washBg(WASHES[0]);
  document.getElementById('washChips').addEventListener('click',function(e){{
    var b=e.target.closest('.chip');if(!b)return;
    this.querySelectorAll('.chip').forEach(function(x){{x.classList.remove('on')}});
    b.classList.add('on');
    wb.style.background=washBg(WASHES[+b.dataset.w]);
  }});
}})();
</script>
'''

open(OUT, 'w').write(HTML)
print(OUT, len(HTML) // 1024, 'KB')

#!/usr/bin/env python3
"""Build the crowd audition: Aaron picks the cheer for each of the three endings.

    node tools/crowd-swells.mjs                # measure the swells first
    python3 tools/crowd-audition-build.py <out.html>

Aaron, 08-09: "the plain Finished crowd isnt even cheering and it ends on this
weird PA announcement getting cut off... give me a set to listen to for each
ending and Ill pick."

The split, same as the sfx audition: WHERE the swells are is measurement
(tools/crowd-swells.mjs found them), so that half is done. WHICH swell fits
each ending is hearing, so it is Aaron's. Every candidate below plays through
the EXACT treatment its ending uses in the B5c sample (window length, gain,
fade curve copied from realPlay, values cited), so what he hears is what
ships: no candidate is auditioned prettier than it would play.

Audio is inlined base64 and decoded via atob -> decodeAudioData. NEVER
fetch(), even of a data: URI: that passed the file:// harness and died
silently under the artifact CSP (AI-LEARNINGS 2.6w).
"""
import base64, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SFX = ROOT / 'docs/play/assets/sfx'
FONTS = ROOT / 'docs/play/assets/fonts'

# The three endings and their in-game treatment. dur/gain copied from
# tools/theatre-sample-build.py's ending() (cheer soft 0.5/3.5, loud 0.75/4.5,
# loud 1.0/6.5); fade is realPlay's min(0.6, dur*0.3). Retune there -> retune here.
ENDINGS = [
    {'key': 'fin',   'name': 'FINISHED',  'sub': 'played all ten, any score · polite, warm, short',
     'dur': 3.5, 'gain': 0.5},
    {'key': 'swept', 'name': 'SWEPT',     'sub': '10 for 10 · a real cheer, confetti weather',
     'dur': 4.5, 'gain': 0.75},
    {'key': 'roof',  'name': 'ROOF OFF',  'sub': 'swept the bonus too · the biggest sound the game makes',
     'dur': 6.5, 'gain': 1.0},
]

# Candidate windows, chosen from tools/crowd-swells.mjs output (committed as
# sfx/crowd-swells.json). off starts a touch BEFORE each measured swell so the
# rise is heard. swellDur is the measured length of the swell itself: a
# candidate shorter than an ending's window will run past its own cheer, and
# Aaron should hear that honestly rather than have it hidden.
CANDS = [
    {'id': 'roar-rise',   'src': 'crowd-cheer.mp3',          'off': 0.85,
     'swell': 12.9, 'label': 'the big roar, from its rise',
     'note': 'swell at 0.9s, +21.7 dB over the bed, 12.9s long'},
    {'id': 'roar-mid',    'src': 'crowd-cheer.mp3',          'off': 3.5,
     'swell': 10.3, 'label': 'the big roar, already rolling',
     'note': 'same roar, entered at full volume'},
    {'id': 'roar-late',   'src': 'crowd-cheer.mp3',          'off': 7.0,
     'swell': 6.8,  'label': 'the big roar, back half',
     'note': 'same roar, riding into its decay'},
    {'id': 'react-a',     'src': 'crowd-cheer-reacting.mp3', 'off': 6.3,
     'swell': 2.4,  'label': 'reacting crowd, first real swell',
     'note': 'the file’s cheering starts HERE (6.5s), not at 0 where the old FINISHED window pointed'},
    {'id': 'react-b',     'src': 'crowd-cheer-reacting.mp3', 'off': 13.1,
     'swell': 3.3,  'label': 'reacting crowd, second swell',
     'note': 'swell at 13.3s, decays clean toward the file’s end'},
    {'id': 'pa-swell',    'src': 'crowd-bed-pa.mp3',         'off': 102.5,
     'swell': 9.0,  'label': 'live game crowd, the late swell',
     'note': 'a 9s swell at 102.8s of the game bed, +17.7 dB · long enough for every ending'},
    {'id': 'pa-open',     'src': 'crowd-bed-pa.mp3',         'off': 0.3,
     'swell': 37.0, 'label': 'live game crowd, the loud open',
     'note': 'the bed’s first half is continuously loud · may carry PA talk, your ear decides'},
    {'id': 'squeak-a',    'src': 'crowd-bed-squeaks.mp3',    'off': 14.2,
     'swell': 4.0,  'label': 'announcer-game crowd, big moment',
     'note': 'swell at 14.4s, +8 dB · may carry announcer, your ear decides'},
    {'id': 'squeak-open', 'src': 'crowd-bed-squeaks.mp3',    'off': 0.0,
     'swell': 2.6,  'label': 'announcer-game crowd, the open',
     'note': 'opens already up, +7.3 dB'},
]
# crowd-bed-whistles.mp3 is deliberately absent: measured flat (+1.6 dB max
# rise over its bed). It is ambience, not a cheer, and the page says so.

SOURCES = sorted({c['src'] for c in CANDS})


def face(name, file, weight=400):
    b64 = base64.b64encode((FONTS / file).read_bytes()).decode()
    return (f"@font-face{{font-family:'{name}';font-weight:{weight};"
            f"font-style:normal;font-display:swap;"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}")


def main(out):
    audio = {s: base64.b64encode((SFX / s).read_bytes()).decode() for s in SOURCES}

    sections = []
    for e in ENDINGS:
        rows = []
        for c in CANDS:
            short = (' · <b class="warn">swell is %.1fs, window runs past it</b>'
                     % c['swell']) if c['swell'] < e['dur'] else ''
            rows.append(
                f'<div class="row" data-e="{e["key"]}" data-c="{c["id"]}">'
                f'<button class="pl" data-src="{c["src"]}" data-off="{c["off"]}"'
                f' data-dur="{e["dur"]}" data-gain="{e["gain"]}">&#9654;</button>'
                f'<span class="meta"><b>{c["label"]}</b>'
                f'<small>{c["src"].replace(".mp3", "")} at {c["off"]}s · '
                f'{c["note"]}{short}</small></span>'
                f'<button class="pick">This one</button></div>')
        sections.append(
            f'<section id="s-{e["key"]}"><h2>{e["name"]}'
            f'<small>{e["sub"]} · plays {e["dur"]}s at gain {e["gain"]}, '
            f'the ending’s real treatment</small></h2>'
            f'{"".join(rows)}</section>')

    snd_js = json.dumps(audio)
    cfg_js = json.dumps({'endings': ENDINGS, 'cands': CANDS})

    page = (TPL.replace('__FONTS__', ''.join([
                face('Anton', 'anton-400.woff2'),
                face('Sedgwick Ave Display', 'sedgwick-400.woff2'),
                face('Mono', 'spacemono-400.woff2'),
                face('Arch', 'archivo-600.woff2', 600)]))
               .replace('__SECTIONS__', ''.join(sections))
               .replace('__CFG__', cfg_js)
               .replace('__SND__', snd_js))
    pathlib.Path(out).write_text(page, encoding='utf-8')
    print(f'wrote {out}  {pathlib.Path(out).stat().st_size/1024:.0f} KB, '
          f'{len(CANDS)} candidates x {len(ENDINGS)} endings, '
          f'{len(SOURCES)} source files inlined')


TPL = """<meta charset="utf-8">
<title>Pick the crowd</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
__FONTS__
:root{--ground:#100d0b;--panel:#1d1815;--line:#3a332a;--ink:#efe6d8;--dim:#b3a894;
 --faint:#7d735f;--accent:#f5872e;--deep:#c9641a;--good:#6fbf73;--warn:#e0a33c}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
 font-family:Arch,system-ui,sans-serif;-webkit-text-size-adjust:100%}
.wrap{max-width:640px;margin:0 auto;padding:20px 14px 90px}
.eyebrow{font-family:Mono;font-size:10px;letter-spacing:.22em;text-transform:uppercase;
 color:var(--accent);margin:0}
h1{font-family:'Sedgwick Ave Display';font-weight:400;font-size:clamp(30px,8vw,44px);
 margin:6px 0 6px;color:#fff5e2;transform:rotate(-1.5deg);
 text-shadow:2px 2px 0 var(--deep)}
.stand{color:var(--dim);max-width:60ch;margin:0 0 10px;line-height:1.55;font-size:14.5px}
.stand b{color:var(--ink)}
.bar{position:sticky;top:0;z-index:9;background:var(--ground);
 border-bottom:1px solid var(--line);padding:9px 0;display:flex;gap:9px;align-items:center}
.bar .n{font-family:Mono;font-size:10px;letter-spacing:.11em;text-transform:uppercase;
 color:var(--faint);flex:1;line-height:1.8}
.bar .n b{color:var(--accent)}
.cp{font-family:Mono;font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;
 background:var(--accent);color:#1a0d02;border:0;border-radius:8px;padding:10px 14px;
 cursor:pointer}
.cp.ok{background:var(--good);color:#06170a}
section{margin:26px 0 0}
h2{font-family:Anton;font-weight:400;text-transform:uppercase;font-size:22px;
 letter-spacing:.02em;margin:0 0 8px}
h2 small{display:block;font-family:Mono;font-size:8.5px;letter-spacing:.14em;
 color:var(--faint);margin-top:4px;text-transform:none}
.row{display:flex;align-items:center;gap:10px;background:var(--panel);
 border:1px solid var(--line);border-radius:11px;padding:9px 10px;margin:0 0 7px}
.row.on{border-color:var(--good)}
.pl{flex:none;width:42px;height:42px;border-radius:50%;border:1.5px solid var(--accent);
 background:none;color:var(--accent);font-size:15px;cursor:pointer;
 -webkit-tap-highlight-color:transparent}
.pl.playing{background:var(--accent);color:#1a0d02}
.meta{flex:1;min-width:0;line-height:1.35}
.meta b{font-size:13.5px}
.meta small{display:block;font-family:Mono;font-size:8.5px;letter-spacing:.05em;
 color:var(--faint);margin-top:3px;line-height:1.55}
.meta small .warn{color:var(--warn);font-weight:400}
.pick{flex:none;font-family:Mono;font-size:8.5px;letter-spacing:.1em;
 text-transform:uppercase;background:none;border:1px solid var(--line);border-radius:7px;
 color:var(--dim);padding:11px 10px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.row.on .pick{border-color:var(--good);color:var(--good);background:rgba(111,191,115,.1)}
footer{margin-top:30px;border-top:1px solid var(--line);padding-top:14px;
 font-family:Mono;font-size:10px;letter-spacing:.08em;color:var(--faint);line-height:1.9}
</style>
<div class="wrap">
<p class="eyebrow">Ball Knowledge · 9 August 2026 · the crowd, take two</p>
<h1>Pick the crowd</h1>
<p class="stand">You were right twice: the FINISHED crowd was not cheering, and
the window ran into PA talk. Measured, the cheering in that file starts at
<b>6.5s</b>, and the old window started at 0. So here is every real swell in
every crowd file we own, found by measurement: nine candidates, each played
through <b>the exact treatment its ending uses in the game</b> (length, volume,
fade). Tap play, pick <b>one per ending</b>, hit copy, send it. The same
candidate is allowed to win twice.</p>
<p class="stand"><b>Left off on purpose:</b> crowd-bed-whistles, measured
flat (+1.6 dB over its own bed). It is ambience, not a cheer.</p>
<div class="bar">
  <span class="n" id="st">FINISHED: – · SWEPT: – · ROOF OFF: –</span>
  <button class="cp" id="copy">Copy picks</button>
</div>
__SECTIONS__
<footer>
swells measured by tools/crowd-swells.mjs (RMS envelope, 500ms smoothing, bed =
20th percentile) · numbers in sfx/crowd-swells.json · treatments copied from
the B5c sample’s endings · page by tools/crowd-audition-build.py
</footer>
</div>
<script>
var CFG=__CFG__;
var SND=__SND__;
var KEY='bk_crowd_picks';
var AC=null,BUFS={},CUR=null,CURBTN=null;
function ac(){if(!AC){var C=window.AudioContext||window.webkitAudioContext;
  if(!C)return null;AC=new C()}if(AC.state==='suspended')AC.resume();return AC}
/* decode on demand, atob only, the one path that works on file:// AND under
   the artifact CSP (AI-LEARNINGS 2.6w) */
function withBuf(src,cb){
  if(BUFS[src]){cb(BUFS[src]);return}
  var c=ac();if(!c)return;
  var bin=atob(SND[src]),u=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  c.decodeAudioData(u.buffer).then(function(b){BUFS[src]=b;cb(b)});
}
function stopCur(){
  if(CUR){try{CUR.stop()}catch(e){}CUR=null}
  if(CURBTN){CURBTN.classList.remove('playing');CURBTN=null}
}
/* the ending's real treatment: window + gain + realPlay's fade, copied from
   tools/theatre-sample-build.py so audition and game move together */
function play(btn){
  var c=ac();if(!c)return;
  stopCur();
  withBuf(btn.dataset.src,function(buf){
    var off=+btn.dataset.off,dur=+btn.dataset.dur,gain=+btn.dataset.gain;
    var s=c.createBufferSource();s.buffer=buf;
    var g=c.createGain(),t=c.currentTime,fade=Math.min(0.6,dur*0.3);
    g.gain.setValueAtTime(gain,t);
    g.gain.setValueAtTime(gain,t+dur-fade);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    s.connect(g);g.connect(c.destination);
    s.start(t,off,dur+0.1);
    window.__crowdPlays=(window.__crowdPlays||0)+1;
    CUR=s;CURBTN=btn;btn.classList.add('playing');
    s.onended=function(){if(CURBTN===btn){btn.classList.remove('playing');
      if(CUR===s)CUR=null;CURBTN=null}};
  });
}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function save(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}
function name(cid){for(var i=0;i<CFG.cands.length;i++)
  if(CFG.cands[i].id===cid)return CFG.cands[i].label;return cid||'–'}
function paint(){
  var v=load(),bits=[];
  document.querySelectorAll('.row').forEach(function(r){
    r.classList.toggle('on',v[r.dataset.e]===r.dataset.c)});
  CFG.endings.forEach(function(e){
    bits.push(e.name+': '+(v[e.key]?name(v[e.key]):'–'))});
  document.getElementById('st').textContent=bits.join(' · ');
}
document.addEventListener('click',function(ev){
  var r=ev.target.closest('.row');
  if(ev.target.classList.contains('pl')){play(ev.target);return}
  if(r&&ev.target.classList.contains('pick')){
    var v=load();
    v[r.dataset.e]=v[r.dataset.e]===r.dataset.c?undefined:r.dataset.c;
    save(v);paint();
  }
});
document.getElementById('copy').addEventListener('click',function(){
  var v=load(),lines=['CROWD PICKS'];
  CFG.endings.forEach(function(e){
    lines.push(e.name+': '+(v[e.key]||'–'))});
  var txt=lines.join('\\n'),b=this;
  function done(t){b.textContent=t;b.classList.add('ok');
    setTimeout(function(){b.textContent='Copy picks';b.classList.remove('ok')},1600)}
  if(navigator.clipboard&&navigator.clipboard.writeText)
    navigator.clipboard.writeText(txt).then(function(){done('Copied \\u2713')},
      function(){prompt('Copy this:',txt);done('Copy picks')});
  else{prompt('Copy this:',txt);done('Copy picks')}
});
window.BKCrowd={play:function(e,c){
    var btn=document.querySelector('.row[data-e="'+e+'"][data-c="'+c+'"] .pl');
    if(btn)play(btn)},
  _plays:function(){return window.__crowdPlays||0},
  _bufs:function(){var o={};for(var k in BUFS)o[k]=+BUFS[k].duration.toFixed(2);return o},
  _srcs:Object.keys(SND)};
paint();
</script>
"""

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'docs/dev/crowd-audition.html'))

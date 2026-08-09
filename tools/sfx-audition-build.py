#!/usr/bin/env python3
"""Build the slice audition page: Aaron's two minutes of the slicing job.

    node tools/sfx-slice.mjs                 # cut the candidates first
    python3 tools/sfx-audition-build.py <out.html>

The split this page exists to enforce: the CUTTING is measurement (onsets,
valleys, fades: tools/sfx-slice.mjs), so it is done. The CHOOSING is hearing,
so it is Aaron's, and this page makes his half cost two minutes: every
candidate is a play button with its waveform, a KEEP and a KILL, verdicts
survive a reload, and one button copies them out in a line I can act on.

Candidates are NOT in the game and never will be as a pile: keepers ship,
the rest die. That is why this page inlines scratch WAVs instead of pointing
at committed files.
"""
import base64, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SL = pathlib.Path('/tmp/claude-0/-home-user-ball-knowledge/'
                  'dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/slices')
FONTS = ROOT / 'docs/play/assets/fonts'


def face(name, file, weight=400):
    b64 = base64.b64encode((FONTS / file).read_bytes()).decode()
    return (f"@font-face{{font-family:'{name}';font-weight:{weight};"
            f"font-style:normal;font-display:swap;"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}")


def main(out):
    idx = json.loads((SL / 'slices.json').read_text())
    groups, total = [], 0
    for src, meta in idx.items():
        rows = []
        for i, s in enumerate(meta['slices']):
            wav = base64.b64encode((SL / s['name']).read_bytes()).decode()
            total += 1
            rows.append(
                f'<div class="row" data-k="{s["name"]}">'
                f'<button class="pl" data-a="a{total}">&#9654;</button>'
                f'<canvas class="wv" width="120" height="30" '
                f'data-strip="{",".join(str(v) for v in s["strip"])}"></canvas>'
                f'<span class="meta">{meta["unit"]} {i+1} · {s["sec"]}s · '
                f'{s["peakDb"]} dB · at {s["at"]}s</span>'
                f'<span class="votes"><button class="keep">Keep</button>'
                f'<button class="kill">Kill</button></span>'
                f'<audio id="a{total}" preload="none" '
                f'src="data:audio/wav;base64,{wav}"></audio></div>')
        groups.append(
            f'<section><h2>{src.replace(".mp3","")}'
            f'<small>{meta["hitsFound"]} hits found · {len(meta["slices"])} '
            f'candidates · floor {meta["floorDb"]} dB</small></h2>'
            f'<button class="walk">&#9654; play them in a row</button>'
            f'{"".join(rows)}</section>')

    page = TPL.replace('__FONTS__', ''.join([
                face('Anton', 'anton-400.woff2'),
                face('Sedgwick Ave Display', 'sedgwick-400.woff2'),
                face('Mono', 'spacemono-400.woff2'),
                face('Arch', 'archivo-600.woff2', 600)])) \
              .replace('__GROUPS__', ''.join(groups)) \
              .replace('__N__', str(total))
    pathlib.Path(out).write_text(page, encoding='utf-8')
    print(f'wrote {out}  {pathlib.Path(out).stat().st_size/1024:.0f} KB, '
          f'{total} candidates')


TPL = """<meta charset="utf-8">
<title>Pick the one-shots</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
__FONTS__
:root{--ground:#100d0b;--panel:#1d1815;--line:#3a332a;--ink:#efe6d8;--dim:#b3a894;
 --faint:#7d735f;--accent:#f5872e;--deep:#c9641a;--good:#6fbf73;--bad:#d5524b}
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
.bar .n{font-family:Mono;font-size:10px;letter-spacing:.13em;text-transform:uppercase;
 color:var(--faint);flex:1}
.bar .n b{color:var(--accent)}
.cp{font-family:Mono;font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;
 background:var(--accent);color:#1a0d02;border:0;border-radius:8px;padding:10px 14px;
 cursor:pointer}
.cp.ok{background:var(--good);color:#06170a}
section{margin:22px 0 0}
h2{font-family:Anton;font-weight:400;text-transform:uppercase;font-size:19px;
 letter-spacing:.02em;margin:0 0 2px}
h2 small{display:block;font-family:Mono;font-size:8.5px;letter-spacing:.14em;
 color:var(--faint);margin-top:3px}
.walk{font-family:Mono;font-size:9px;letter-spacing:.13em;text-transform:uppercase;
 background:none;border:1px solid var(--line);border-radius:7px;color:var(--dim);
 padding:7px 10px;margin:8px 0;cursor:pointer}
.row{display:flex;align-items:center;gap:9px;background:var(--panel);
 border:1px solid var(--line);border-radius:11px;padding:8px 10px;margin:0 0 7px}
.row.keep{border-color:var(--good)}
.row.kill{border-color:transparent;opacity:.38}
.pl{flex:none;width:40px;height:40px;border-radius:50%;border:1.5px solid var(--accent);
 background:none;color:var(--accent);font-size:15px;cursor:pointer;
 -webkit-tap-highlight-color:transparent}
.wv{flex:none;opacity:.85}
.meta{flex:1;font-family:Mono;font-size:8.5px;letter-spacing:.06em;
 text-transform:uppercase;color:var(--faint);line-height:1.5;min-width:0}
.votes{display:flex;gap:5px}
.votes button{font-family:Mono;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;
 background:none;border:1px solid var(--line);border-radius:7px;color:var(--dim);
 padding:9px 9px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.row.keep .keep{border-color:var(--good);color:var(--good);background:rgba(111,191,115,.1)}
.row.kill .kill{border-color:var(--bad);color:var(--bad)}
footer{margin-top:30px;border-top:1px solid var(--line);padding-top:14px;
 font-family:Mono;font-size:10px;letter-spacing:.08em;color:var(--faint);line-height:1.9}
</style>
<div class="wrap">
<p class="eyebrow">Ball Knowledge · 9 August 2026 · your two minutes</p>
<h1>Pick the one-shots</h1>
<p class="stand">The cutting was arithmetic, so it is done: __N__ candidates,
sliced where the energy says a hit starts and stops, fades on every edge.
<b>Which ones SOUND right is yours.</b> Tap play, tap Keep or Kill, then copy
the verdicts at the top and send them. Keepers ship into the game, the rest
die, and nothing ships unheard.</p>
<div class="bar">
  <span class="n"><b id="nk">0</b> keep · <b id="nx">0</b> kill · <span id="nu">__N__</span> unheard</span>
  <button class="cp" id="copy">Copy verdicts</button>
</div>
__GROUPS__
<footer>
cut by tools/sfx-slice.mjs from docs/play/assets/sfx/ · onsets over a measured
noise floor, 3ms/25ms fades · candidates live in scratch, keepers get committed
· page by tools/sfx-audition-build.py
</footer>
</div>
<script>
var KEY='bk_sfx_verdicts';
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function save(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}
function paint(){
  var v=load(),nk=0,nx=0,nu=0;
  document.querySelectorAll('.row').forEach(function(r){
    var s=v[r.dataset.k];
    r.classList.toggle('keep',s==='keep');
    r.classList.toggle('kill',s==='kill');
    if(s==='keep')nk++;else if(s==='kill')nx++;else nu++;
  });
  document.getElementById('nk').textContent=nk;
  document.getElementById('nx').textContent=nx;
  document.getElementById('nu').textContent=nu;
}
document.addEventListener('click',function(e){
  var r=e.target.closest('.row');
  if(e.target.classList.contains('pl')){
    document.querySelectorAll('audio').forEach(function(a){a.pause();a.currentTime=0});
    document.getElementById(e.target.dataset.a).play();
    return;
  }
  if(r&&(e.target.classList.contains('keep')||e.target.classList.contains('kill'))){
    var v=load(),want=e.target.classList.contains('keep')?'keep':'kill';
    v[r.dataset.k]=v[r.dataset.k]===want?undefined:want;
    save(v);paint();
  }
});
/* the walk test: hear a group in sequence, keepers only once any exist, so a
   set of steps can be judged as a GAIT and not just as eight thuds */
document.querySelectorAll('.walk').forEach(function(w){
  w.addEventListener('click',function(){
    var v=load(),rows=[].slice.call(w.parentNode.querySelectorAll('.row'));
    var kept=rows.filter(function(r){return v[r.dataset.k]==='keep'});
    var list=(kept.length?kept:rows).map(function(r){return r.querySelector('audio')});
    var i=0;
    (function step(){
      if(i>=list.length)return;
      var a=list[i++];a.currentTime=0;a.play();
      setTimeout(step,Math.max(a.duration*1000||300,250)+140);
    })();
  });
});
document.querySelectorAll('.wv').forEach(function(c){
  var g=c.getContext('2d'),v=c.dataset.strip.split(',').map(Number);
  g.fillStyle='#f5872e';
  v.forEach(function(a,i){var h=Math.max(1,a*28);g.fillRect(i*2,15-h/2,1.5,h)});
});
document.getElementById('copy').addEventListener('click',function(){
  var v=load(),by={};
  document.querySelectorAll('.row').forEach(function(r){
    var k=r.dataset.k,m=/^(.*)-(\\d+)\\.wav$/.exec(k);
    if(!m)return;
    (by[m[1]]=by[m[1]]||{keep:[],kill:[]});
    if(v[k]==='keep')by[m[1]].keep.push(+m[2]);
    if(v[k]==='kill')by[m[1]].kill.push(+m[2]);
  });
  var lines=Object.keys(by).map(function(f){
    return f+': keep '+(by[f].keep.join(',')||'-')+' · kill '+(by[f].kill.join(',')||'-');
  });
  var txt='SFX VERDICTS\\n'+lines.join('\\n');
  var b=this;
  function done(t){b.textContent=t;b.classList.add('ok');
    setTimeout(function(){b.textContent='Copy verdicts';b.classList.remove('ok')},1600)}
  if(navigator.clipboard&&navigator.clipboard.writeText)
    navigator.clipboard.writeText(txt).then(function(){done('Copied \\u2713')},
      function(){prompt('Copy this:',txt);done('Copy verdicts')});
  else{prompt('Copy this:',txt);done('Copy verdicts')}
});
paint();
</script>
"""

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'audition.html')

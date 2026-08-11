#!/usr/bin/env python3
"""Build the working page for the art brief, out of the brief itself.

    python3 tools/artbrief-artifact.py <out.html>

design/PLACES-ART-BRIEF.md is the source and the only home. This reads it,
lifts every ```text block with the heading above it, and emits a page built for
ONE job: standing at an image tool with a phone in your hand, copying prompts.

So the page is not a document. Every prompt has a copy button, the style block
has its own button that follows you down the page, and the six Tier 1 images
have checkboxes that survive a reload, because the whole thing takes an hour and
nobody remembers which of six near layers they already did.

Design comes from the game: Anton, Archivo, Space Mono out of
docs/play/assets/fonts, arena orange #f5872e, warm near black #100d0b.
"""
import base64, html, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'design/PLACES-ART-BRIEF.md'
FONTS = ROOT / 'docs/play/assets/fonts'


def face(name, file, weight=400):
    b64 = base64.b64encode((FONTS / file).read_bytes()).decode()
    return (f"@font-face{{font-family:{name};font-weight:{weight};font-style:normal;"
            f"font-display:swap;src:url(data:font/woff2;base64,{b64}) format('woff2')}}")


def inline(t):
    t = html.escape(t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    t = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<em>\1</em>', t)
    return t


def parse():
    """-> (style_block, [ {tier, title, note, prompt, meta[]} ])"""
    lines = SRC.read_text(encoding='utf-8').splitlines()
    out, style = [], None
    tier, title, note, buf, infence = None, None, [], None, False
    for ln in lines:
        if ln.startswith('# TIER'):
            tier = ln.lstrip('# ').strip()
            # a new tier closes the open card, or its intro prose (any **bold
            # line) glues itself to the previous card's save-as meta. Found
            # when TIER 1B's intro rode in on gym-4-near's card, 08-10.
            title, note = None, []
        elif ln.startswith('## THE STYLE BLOCK'):
            title, note = '__STYLE__', []
        elif ln.startswith('## '):
            title, note = ln[3:].strip(), []
        elif ln.startswith('```text'):
            infence, buf = True, []
        elif infence and ln.startswith('```'):
            infence = False
            if title == '__STYLE__':
                style = '\n'.join(buf)
            elif title and tier:
                out.append({'tier': tier, 'title': title, 'note': note[:],
                            'prompt': '\n'.join(buf), 'meta': []})
            buf = None
        elif infence:
            buf.append(ln)
        elif title and ln.strip():
            # the ** lines immediately after a fence are the save-as / spec lines
            if out and out[-1]['title'] == title and ln.startswith('**'):
                out[-1]['meta'].append(ln)
            elif ln.startswith('*') and not ln.startswith('**'):
                note.append(ln.strip('* '))
    return style, out


CARD = """<article class="card{tone}" data-id="{cid}">
  <header>
    <label class="tick"><input type="checkbox" data-k="{cid}"><span></span></label>
    <h3>{title}</h3>
  </header>
  {note}
  <pre class="p" id="p-{cid}">{prompt}</pre>
  <div class="row">
    <button class="cp" data-t="p-{cid}">Copy prompt</button>
    {stylebtn}
    <span class="save">{meta}</span>
  </div>
</article>"""


def main(out):
    style, cards = parse()
    if not style or not cards:
        sys.exit('could not parse the brief')

    tiers, cur = [], None
    for i, c in enumerate(cards):
        if c['tier'] != cur:
            cur = c['tier']
            tiers.append((cur, []))
        tiers[-1][1].append((i, c))

    body = []
    for name, group in tiers:
        t1 = name.startswith('TIER 1')
        body.append(f'<h2 class="tier{"" if t1 else " later"}">{inline(name)}</h2>')
        if not t1:
            body.append('<p class="hold">Written down so a second sitting starts '
                        'warm. <strong>Not so it happens today.</strong></p>')
        for i, c in group:
            near = 'near layer' in c['title'].lower()
            body.append(CARD.format(
                cid=f'c{i}', tone=' near' if near else '',
                title=inline(c['title']),
                note=('<p class="n">' + inline(' '.join(c['note'])) + '</p>')
                     if c['note'] else '',
                prompt=html.escape(c['prompt']),
                stylebtn='' if near else
                         '<button class="cp alt" data-t="styleblock">+ style block</button>',
                meta=inline(' '.join(c['meta']))))

    fonts = ''.join([face('Anton', 'anton-400.woff2'),
                     face('Arch', 'archivo-600.woff2', 600),
                     face('Mono', 'spacemono-400.woff2')])
    n1 = sum(1 for n, g in tiers if n.startswith('TIER 1') for _ in g)
    page = PAGE.replace('__FONTS__', fonts) \
               .replace('__STYLE__', html.escape(style)) \
               .replace('__BODY__', ''.join(body)) \
               .replace('__N1__', str(n1))
    pathlib.Path(out).write_text(page, encoding='utf-8')
    print(f'wrote {out}')
    print(f'  {len(cards)} prompts, {n1} in tier 1, style block {len(style)} chars')


PAGE = """<title>The Places, art brief</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
__FONTS__
:root{
  --ground:#100d0b; --panel:#191410; --panel2:#221b15; --rule:#332c24;
  --ink:#efe6d8; --dim:#a89a85; --faint:#7b6f5d;
  --accent:#f5872e; --soft:rgba(245,135,46,.13); --shadow:rgba(0,0,0,.55);
}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){
  --ground:#f2ebe0; --panel:#fffdf8; --panel2:#f7f0e4; --rule:#dcd0bd;
  --ink:#1d1710; --dim:#5f5443; --faint:#8b7f6c;
  --accent:#b8530c; --soft:rgba(184,83,12,.09); --shadow:rgba(60,40,20,.13);
}}
:root[data-theme="light"]{
  --ground:#f2ebe0; --panel:#fffdf8; --panel2:#f7f0e4; --rule:#dcd0bd;
  --ink:#1d1710; --dim:#5f5443; --faint:#8b7f6c;
  --accent:#b8530c; --soft:rgba(184,83,12,.09); --shadow:rgba(60,40,20,.13);
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:Arch,ui-sans-serif,system-ui,sans-serif;font-weight:600;
  font-size:15.5px;line-height:1.6;-webkit-text-size-adjust:100%}
.wrap{max-width:800px;margin:0 auto;padding:0 clamp(16px,4vw,28px) 90px}
header.top{padding:clamp(30px,7vw,56px) 0 22px;border-bottom:1px solid var(--rule);
  margin-bottom:22px}
.eyebrow{font-family:Mono;font-size:10px;letter-spacing:.24em;text-transform:uppercase;
  color:var(--accent);margin:0 0 12px}
h1{font-family:Anton;font-weight:400;text-transform:uppercase;margin:0;
  font-size:clamp(34px,9.5vw,62px);line-height:.9;text-wrap:balance}
h1 .t{display:block;color:var(--accent)}
p{margin:0 0 14px;max-width:62ch}
.lede{color:var(--dim);margin-top:16px}

/* the spec, up top and short, because it is the part that gets skipped */
.spec{background:var(--panel);border:1px solid var(--rule);border-radius:12px;
  padding:16px 18px;margin:0 0 26px}
.spec h4{font-family:Mono;font-size:9px;letter-spacing:.2em;text-transform:uppercase;
  color:var(--faint);margin:0 0 10px;font-weight:400}
.spec ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:9px}
.spec li{color:var(--dim);font-size:14px;line-height:1.5;padding-left:15px;position:relative}
.spec li::before{content:"";position:absolute;left:0;top:.62em;width:6px;height:6px;
  border-radius:50%;background:var(--accent)}
.spec li b{color:var(--ink)}

/* the style block rides along at the bottom of the screen */
.dock{position:sticky;bottom:0;z-index:20;margin:0 0 22px;
  background:var(--ground);padding:10px 0 12px;border-top:1px solid var(--rule)}
.dock .in{display:flex;align-items:center;gap:11px;background:var(--panel2);
  border:1px solid var(--accent);border-radius:10px;padding:10px 12px}
.dock p{margin:0;flex:1;font-family:Mono;font-size:9.5px;letter-spacing:.11em;
  text-transform:uppercase;color:var(--dim);line-height:1.5}
#styleblock{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}

h2.tier{font-family:Anton;font-weight:400;text-transform:uppercase;
  font-size:clamp(20px,4.6vw,28px);margin:34px 0 4px;letter-spacing:.02em}
h2.tier.later{color:var(--faint)}
.hold{color:var(--faint);font-size:13.5px;margin-bottom:16px}
.prog{font-family:Mono;font-size:10px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--faint);margin:0 0 18px}
.prog b{color:var(--accent);font-weight:400}

article.card{background:var(--panel);border:1px solid var(--rule);border-radius:12px;
  padding:15px 16px;margin:0 0 12px;transition:opacity .2s ease}
article.card.near{background:none;border-style:dashed}
article.card.done{opacity:.42}
article.card header{display:flex;align-items:flex-start;gap:11px;margin-bottom:9px}
article.card h3{font-family:Anton;font-weight:400;text-transform:uppercase;
  font-size:15.5px;letter-spacing:.02em;line-height:1.2;margin:0;flex:1}
.tick{flex:none;cursor:pointer;display:block;width:22px;height:22px;position:relative}
.tick input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}
.tick span{display:block;width:22px;height:22px;border:1.5px solid var(--rule);
  border-radius:6px;pointer-events:none}
.tick input:checked + span{background:var(--accent);border-color:var(--accent)}
.tick input:checked + span::after{content:"";position:absolute;left:7px;top:3px;
  width:6px;height:11px;border:solid #1a0d02;border-width:0 2.5px 2.5px 0;
  transform:rotate(43deg)}
.tick input:focus-visible + span{outline:2px solid var(--accent);outline-offset:2px}
.n{font-size:13px;color:var(--faint);margin:-3px 0 9px;font-style:italic}
pre.p{font-family:Mono;font-size:12px;line-height:1.65;color:var(--dim);
  background:var(--panel2);border:1px solid var(--rule);border-radius:9px;
  padding:12px 13px;margin:0 0 10px;white-space:pre-wrap;word-break:break-word;
  max-height:190px;overflow:auto}
.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
button.cp{font-family:Mono;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;
  background:var(--accent);color:#1a0d02;border:0;border-radius:7px;
  padding:9px 13px;cursor:pointer;-webkit-tap-highlight-color:transparent}
button.cp.alt{background:none;color:var(--accent);border:1px solid var(--accent)}
button.cp.ok{background:#4f9a56;color:#06170a}
button.cp.alt.ok{background:#4f9a56;border-color:#4f9a56;color:#06170a}
.save{font-family:Mono;font-size:9px;letter-spacing:.1em;color:var(--faint);
  line-height:1.6}
.save strong{color:var(--dim);font-weight:400}
.save code{font-family:Mono;background:var(--soft);padding:1px 5px;border-radius:4px;
  color:var(--accent)}
code{font-family:Mono;font-size:.86em;background:var(--soft);padding:1px 5px;
  border-radius:4px}
footer{border-top:1px solid var(--rule);margin-top:34px;padding-top:18px;
  font-family:Mono;font-size:10.5px;letter-spacing:.07em;color:var(--faint);line-height:2}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

<div class="wrap">
<header class="top">
  <p class="eyebrow">Ball Knowledge · 9 August 2026 · take this to the image tool</p>
  <h1>The Places<span class="t">art brief</span></h1>
  <p class="lede">Six generations, not twenty four. The Gym proves the pipeline:
  if the cutouts key cleanly and the three facings match, everything else is a
  repeat. If they do not, we find out after six images.</p>
</header>

<div class="spec">
  <h4>The four things that matter, and everything else is taste</h4>
  <ul>
    <li><b>3:2 landscape, 5400 x 3600 or bigger.</b> Generate at your tool's
      largest native size, then upscale. Height is the number that counts: the
      phone frame fills by height, and a 2x push-in needs 3,640 px of it.
      Absolute floor 2400.</li>
    <li><b>Every room is a BASE plus a NEAR cutout.</b> The near layer is
      generated separately, on transparent or flat magenta, never cropped out of
      the base. This is the one thing that cannot be added later.</li>
    <li><b>Empty. Eye level. No text.</b> No people, no signage, no logos, and
      standing height rather than a drone shot.</li>
    <li><b>Keep the lower third and the outer thirds simple.</b> The drill
      markers sit low, and only the middle 43% of the width is on screen before
      you turn.</li>
  </ul>
</div>

<p class="prog" id="prog">0 of __N1__ done</p>

<div class="dock">
  <div class="in">
    <p>The style block goes on the end of every BASE prompt. Never on a cutout.</p>
    <button class="cp" data-t="styleblock">Copy</button>
  </div>
</div>
<pre id="styleblock">__STYLE__</pre>

__BODY__

<footer>
The brief lives in <code>design/PLACES-ART-BRIEF.md</code> and this page is
generated from it by <code>tools/artbrief-artifact.py</code><br>
Drop the finished files into <code>docs/play/assets/places/</code> at full
resolution, with the filenames above, and tell me which tool made them
</footer>
</div>
<script>
/* copy, with the fallback that matters: an artifact runs in a sandboxed frame
   and navigator.clipboard is not guaranteed there. If it is missing the text
   gets selected instead, so a long-press copy still works on a phone. */
function flash(b,txt){var o=b.textContent;b.textContent=txt;b.classList.add('ok');
  setTimeout(function(){b.textContent=o;b.classList.remove('ok')},1400);}
document.addEventListener('click',function(e){
  var b=e.target.closest('button.cp'); if(!b)return;
  var el=document.getElementById(b.dataset.t); if(!el)return;
  var txt=el.textContent;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){flash(b,'Copied \\u2713')},
      function(){select(el);flash(b,'Select + copy')});
  } else { select(el); flash(b,'Select + copy'); }
});
function select(el){
  if(el.id==='styleblock'){                 /* the dock's source is off-screen */
    var t=document.createElement('textarea'); t.value=el.textContent;
    t.style.cssText='position:fixed;top:40%;left:5%;width:90%;height:22%;z-index:99';
    document.body.appendChild(t); t.focus(); t.select();
    setTimeout(function(){t.remove()},9000); return;
  }
  var r=document.createRange(); r.selectNodeContents(el);
  var s=getSelection(); s.removeAllRanges(); s.addRange(r);
}
/* the ticks survive a reload, because six images take an hour and nobody
   remembers which near layers they already did. */
var KEY='bk_artbrief';
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function paint(){
  var s=load(),n=0,tot=0;
  document.querySelectorAll('article.card').forEach(function(c){
    var box=c.querySelector('input'),on=!!s[box.dataset.k];
    box.checked=on; c.classList.toggle('done',on);
    var t1=c.previousElementSibling;
    });
  document.querySelectorAll('h2.tier').forEach(function(h){
    if(h.classList.contains('later'))return;
    var el=h.nextElementSibling;
    while(el&&el.tagName!=='H2'){
      if(el.tagName==='ARTICLE'){tot++; if(s[el.querySelector('input').dataset.k])n++;}
      el=el.nextElementSibling;
    }
  });
  var p=document.getElementById('prog');
  p.innerHTML=(n===tot&&tot)?'<b>All '+tot+' done.</b> Bring them back.'
                            :'<b>'+n+'</b> of '+tot+' done';
}
document.addEventListener('change',function(e){
  var b=e.target.closest('.tick input'); if(!b)return;
  var s=load(); if(b.checked)s[b.dataset.k]=1; else delete s[b.dataset.k];
  save(s); paint();
});
paint();
</script>
"""

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'artbrief.html')

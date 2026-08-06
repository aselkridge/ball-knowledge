#!/usr/bin/env python3
"""Before/after for the gendered-language fix. Run tools/lang-compare.mjs first."""
import base64, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'shots/lang.html')
def b64(p, m):
    return 'data:%s;base64,%s' % (m, base64.b64encode(open(os.path.join(ROOT,p),'rb').read()).decode())
img = lambda n: b64('shots/'+n, 'image/png')
font = lambda n: b64('docs/play/assets/fonts/'+n, 'font/woff2')

LINES = [
 ('game.js', 'Move him ▸', 'Move them ▸'),
 ('game.js', 'Pass it — or move him instead', 'Pass it — or move them instead'),
 ('game.js', 'Shake him', 'Shake them'),
 ('game.js', 'ANKLES! he breaks free', 'ANKLES! they break free'),
 ('game.js', 'leaves him grasping', 'leaves them grasping'),
 ('Rulebook', 'a defender only guards the squares <b>he is</b> square to — slide past <b>him</b> on a diagonal and <b>he</b> can’t touch you',
              'a defender only guards the squares <b>they are</b> square to — slide past <b>them</b> on a diagonal and <b>they</b> can’t touch you'),
 ('Rulebook', 'Locked up: <b>he guards</b> every direction', 'Locked up: <b>they guard</b> every direction'),
 ('Rulebook', 'beat it and <b>he answers</b> to stay in front', 'beat it and <b>they answer</b> to stay in front'),
 ('Rulebook', 'earn the steal with <b>his</b> own card', 'earn the steal with <b>their</b> own card'),
 ('Rulebook', 'any of the eight squares around <b>him</b>', 'any of the eight squares around <b>them</b>'),
 ('Rulebook', 'the red lanes <b>he was</b> guarding reopen', 'the red lanes <b>they were</b> guarding reopen'),
 ('Rulebook', 'a ring saying what <b>he is</b> doing', 'a ring saying what <b>they are</b> doing'),
 ('Rulebook', 'screened, drive straight past <b>him</b>', 'screened, drive straight past <b>them</b>'),
 ('Rulebook', '<b>he</b> will contest this shot', '<b>they</b> will contest this shot'),
 ('Rulebook', 'drive past <b>him</b> and <b>he forces</b> a crossover', 'drive past <b>them</b> and <b>they force</b> a crossover'),
 ('Rulebook', 'one tile less than <b>his</b> offensive speed', 'one tile less than <b>their</b> offensive speed'),
 ('Rulebook', 'your card, then <b>his</b> protect-the-rock card', 'your card, then <b>their</b> protect-the-rock card'),
 ('Rulebook', 'sharpens <b>his</b> block card', 'sharpens <b>their</b> block card'),
 ('Rulebook', 'the blocker gets <b>his</b> say', 'the blocker gets <b>their</b> say'),
]
rows = '\n'.join(
 f'<tr><td class="w">{w}</td><td class="b">{a}</td><td class="a">{b}</td></tr>'
 for w,a,b in LINES)

HTML = f'''<title>Every generic player was “he”</title>
<style>
@font-face{{font-family:'Anton';src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
@font-face{{font-family:'Archivo';src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:block}}
@font-face{{font-family:'SpaceMono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
:root{{--ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;--ink:#221a15;
 --muted:#5f5245;--dim:#877868;--accent:#b3590b;--cool:#0f6c65;--bad:#9d2b25;
 --shadow:0 1px 0 rgba(34,26,21,.05),0 10px 30px -18px rgba(34,26,21,.5);
 --mono:'SpaceMono',ui-monospace,Menlo,monospace;--body:'Archivo',system-ui,sans-serif;
 --display:'Anton',Impact,sans-serif}}
@media (prefers-color-scheme:dark){{:root{{--ground:#141010;--panel:#1d1714;--sunk:#100c0b;
 --rule:#3a2e26;--ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;--accent:#f5872e;--cool:#6fd0c3;
 --bad:#d5524b;--shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000}}}}
:root[data-theme="light"]{{--ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;
 --ink:#221a15;--muted:#5f5245;--dim:#877868;--accent:#b3590b;--cool:#0f6c65;--bad:#9d2b25}}
:root[data-theme="dark"]{{--ground:#141010;--panel:#1d1714;--sunk:#100c0b;--rule:#3a2e26;
 --ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;--accent:#f5872e;--cool:#6fd0c3;--bad:#d5524b}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--ground);color:var(--ink);font-family:var(--body);
 font-size:17px;line-height:1.62;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:1080px;margin:0 auto;padding:0 22px 90px;display:flex;flex-direction:column;gap:48px}}
header{{padding:64px 0 0;display:flex;flex-direction:column;gap:14px}}
.eyebrow{{font-family:var(--mono);font-size:.68rem;letter-spacing:.24em;text-transform:uppercase;
 color:var(--accent);margin:0}}
h1{{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:.01em;
 font-size:clamp(2.2rem,6vw,3.6rem);line-height:.96;margin:0;text-wrap:balance}}
h1 span{{color:var(--accent)}}
.stand{{font-size:1.1rem;color:var(--muted);margin:0;max-width:62ch;text-wrap:pretty}}
h2{{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:.02em;
 font-size:clamp(1.3rem,3vw,1.9rem);margin:0 0 16px;padding-bottom:10px;
 border-bottom:2px solid var(--accent)}}
h2 em{{font-style:normal;color:var(--dim)}}
.why{{font-family:var(--mono);font-size:.8rem;line-height:1.75;color:var(--muted);
 border-left:3px solid var(--accent);padding:2px 0 2px 16px;margin:0 0 18px;max-width:80ch}}
.why b{{color:var(--accent);font-weight:400}}
.scroll{{overflow-x:auto}}
table{{border-collapse:collapse;width:100%;background:var(--panel);border:1px solid var(--rule);
 box-shadow:var(--shadow);font-size:.9rem}}
th,td{{text-align:left;padding:10px 14px;border-bottom:1px solid var(--rule);vertical-align:top}}
th{{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
 color:var(--accent);font-weight:400}}
tr:last-child td{{border-bottom:0}}
td.w{{font-family:var(--mono);font-size:.7rem;color:var(--dim);white-space:nowrap}}
td.b{{color:var(--muted)}} td.b b{{color:var(--bad);font-weight:600}}
td.a{{color:var(--ink)}} td.a b{{color:var(--cool);font-weight:600}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}}
figure{{margin:0;display:flex;flex-direction:column;min-width:0}}
figcaption{{font-family:var(--mono);font-size:.66rem;letter-spacing:.13em;text-transform:uppercase;
 color:var(--dim);display:flex;align-items:center;gap:9px;padding:0 0 8px}}
.tag{{font-family:var(--mono);font-size:.6rem;letter-spacing:.16em;padding:3px 8px;
 border:1px solid currentColor;line-height:1}}
.b .tag{{color:var(--dim)}} .a .tag{{color:var(--accent)}}
.frame{{border:1px solid var(--rule);background:#141010;overflow:hidden;box-shadow:var(--shadow);line-height:0}}
figure.a .frame{{border-color:var(--accent)}}
.frame img{{width:100%;height:auto;display:block}}
code{{font-family:var(--mono);font-size:.86em;background:var(--sunk);color:var(--cool);
 padding:.1em .38em;border:1px solid var(--rule)}}
footer{{border-top:1px solid var(--rule);padding-top:20px;font-family:var(--mono);font-size:.7rem;
 letter-spacing:.09em;color:var(--dim);line-height:1.9}}
@media(max-width:820px){{.pair{{grid-template-columns:1fr}}header{{padding-top:42px}}}}
</style>
<div class="wrap">
<header>
  <p class="eyebrow">Ball Knowledge · 4 August 2026</p>
  <h1>Every generic player<br><span>was “he”</span></h1>
  <p class="stand">You thought it was in the questions. It is not — every he/him/his
   in the card bank refers to a specific man, which is correct. It was in the game’s
   own voice, describing the piece you are moving.</p>
</header>

<section>
  <h2>The Rulebook <em>— 390px, same panel, same state</em></h2>
  <p class="why">Fifteen of the twenty are in this one paragraph. <b>Before:</b> “the
squares <b>he is</b> square to — slide past <b>him</b> … <b>he</b> can’t touch you.
Locked up: <b>he guards</b> every direction.” <b>After:</b> they / them / they guard.</p>
  <div class="pair">
   <figure class="b"><figcaption><span class="tag">Before</span>390 × 900</figcaption>
     <div class="frame"><img src="{img('lang-before-390.png')}" alt="Before"></div></figure>
   <figure class="a"><figcaption><span class="tag">After</span>390 × 900</figcaption>
     <div class="frame"><img src="{img('lang-after-390.png')}" alt="After"></div></figure>
  </div>
</section>

<section>
  <h2>All twenty</h2>
  <div class="scroll"><table>
   <tr><th>where</th><th>was</th><th>now</th></tr>
   {rows}
  </table></div>
</section>

<section>
  <h2>And it is a gate now</h2>
  <p class="why"><code>audit.py</code> measures <b>ui_gendered</b> across game.js,
daily.js and index.html with comments stripped — what a <b>player</b> reads, not what
a coder reads — baselined at <b>0</b>. A reminder would not have caught this and did
not: the words had been on screen for weeks.<br><br>
<b>The sabotage failed first, which is the point of doing it.</b> Putting one “him”
back printed <code>ui_gendered: 1</code> and still said <b>PASS</b> — the metric was
measured and never added to the ratchet list. Real measurement, decorative gate.
Fixed, re-broken, and it fails properly now. The audit also gained a check that
NAMES any metric that looks like debt and is not gated, so the next one cannot be
silently decorative either.</p>
</section>

<footer>
  Real headless captures at 390 × 900 · the “before” is minted out of git by
  <code>tools/lang-compare.mjs</code> and deleted again · the card bank was measured,
  not assumed: 178 gendered cards, all about specific men, 0 about a generic player
</footer>
</div>
'''
open(OUT,'w',encoding='utf-8').write(HTML)
print('%s  %.1f MB' % (OUT, os.path.getsize(OUT)/1e6))

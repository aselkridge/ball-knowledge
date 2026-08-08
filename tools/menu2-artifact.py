#!/usr/bin/env python3
"""Before/after for the main-menu REDESIGN (2026-08-08).
Run tools/menu2-shots.mjs first.

Same page furniture as tools/lang-artifact.py, Anton display, Space Mono
utility, the arena-orange accent, before in muted grey and after ringed in
accent.  Copied deliberately rather than re-invented so every comparison in
this project reads as the same document, and so retuning one retunes the rest.
"""
import base64, io, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'docs/dev/menu2')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'shots/menu2.html')
os.makedirs(os.path.dirname(OUT), exist_ok=True)

def font(n):
    p = os.path.join(ROOT, 'docs/play/assets/fonts', n)
    return 'data:font/woff2;base64,' + base64.b64encode(open(p, 'rb').read()).decode()

def img(name, maxw=980):
    """WebP at a sane width. Full-page captures at 1440 are a megabyte each and
    twelve of them would make a page nobody on a phone opens twice."""
    im = Image.open(os.path.join(SHOTS, name)).convert('RGB')
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=82, method=5)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

def pair(before, after, cap_b, cap_a, maxw=980):
    return f'''<div class="pair">
   <figure class="b"><figcaption><span class="tag">Before</span>{cap_b}</figcaption>
     <div class="frame"><img src="{img(before, maxw)}" alt="Before"></div></figure>
   <figure class="a"><figcaption><span class="tag">After</span>{cap_a}</figcaption>
     <div class="frame"><img src="{img(after, maxw)}" alt="After"></div></figure>
  </div>'''

HTML = f'''<title>The new main menu</title>
<style>
@font-face{{font-family:'Anton';src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
@font-face{{font-family:'Archivo';src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:block}}
@font-face{{font-family:'SpaceMono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
:root{{--ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;--ink:#221a15;
 --muted:#5f5245;--dim:#877868;--accent:#b3590b;--cool:#0f6c65;--bad:#9d2b25;
 --shadow:0 1px 0 rgba(34,26,21,.05),0 10px 30px -18px rgba(34,26,21,.5);
 --mono:'SpaceMono',ui-monospace,Menlo,monospace;--body:'Archivo',system-ui,sans-serif;
 --display:'Anton',Impact,sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--ground:#141010;--panel:#1d1714;
 --sunk:#100c0b;--rule:#3a2e26;--ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;--accent:#f5872e;
 --cool:#6fd0c3;--bad:#d5524b;--shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000}}}}
:root[data-theme="dark"]{{--ground:#141010;--panel:#1d1714;--sunk:#100c0b;--rule:#3a2e26;
 --ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;--accent:#f5872e;--cool:#6fd0c3;--bad:#d5524b;
 --shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000}}
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
h3{{font-family:var(--mono);font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;
 color:var(--dim);margin:26px 0 12px;font-weight:400}}
.why{{font-family:var(--mono);font-size:.8rem;line-height:1.75;color:var(--muted);
 border-left:3px solid var(--accent);padding:2px 0 2px 16px;margin:0 0 18px;max-width:80ch}}
.why b{{color:var(--accent);font-weight:400}}
.why+.why{{margin-top:-6px}}
.scroll{{overflow-x:auto}}
table{{border-collapse:collapse;width:100%;background:var(--panel);border:1px solid var(--rule);
 box-shadow:var(--shadow);font-size:.9rem}}
th,td{{text-align:left;padding:10px 14px;border-bottom:1px solid var(--rule);vertical-align:top}}
th{{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
 color:var(--accent);font-weight:400}}
tr:last-child td{{border-bottom:0}}
td.w{{font-family:var(--mono);font-size:.78rem;color:var(--dim);white-space:nowrap;
 font-variant-numeric:tabular-nums}}
td.b{{color:var(--muted)}}
td.a{{color:var(--ink);font-weight:600}}
td.m{{font-family:var(--mono);font-size:.68rem;color:var(--cool);white-space:nowrap}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}}
figure{{margin:0;display:flex;flex-direction:column;min-width:0}}
figcaption{{font-family:var(--mono);font-size:.66rem;letter-spacing:.13em;text-transform:uppercase;
 color:var(--dim);display:flex;align-items:center;gap:9px;padding:0 0 8px}}
.tag{{font-family:var(--mono);font-size:.6rem;letter-spacing:.16em;padding:3px 8px;
 border:1px solid currentColor;line-height:1}}
figure.b .tag{{color:var(--dim)}} figure.a .tag{{color:var(--accent)}}
.frame{{border:1px solid var(--rule);background:#141010;overflow:hidden;box-shadow:var(--shadow);line-height:0}}
figure.a .frame{{border-color:var(--accent)}}
.frame img{{width:100%;height:auto;display:block}}
code{{font-family:var(--mono);font-size:.86em;background:var(--sunk);color:var(--cool);
 padding:.1em .38em;border:1px solid var(--rule)}}
ul.left{{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px}}
ul.left li{{border-left:3px solid var(--rule);padding-left:16px;color:var(--muted);
 font-size:.95rem;max-width:80ch}}
ul.left li b{{color:var(--ink);font-weight:600}}
footer{{border-top:1px solid var(--rule);padding-top:20px;font-family:var(--mono);font-size:.7rem;
 letter-spacing:.09em;color:var(--dim);line-height:1.9}}
@media(max-width:820px){{.pair{{grid-template-columns:1fr}}header{{padding-top:42px}}}}
</style>
<div class="wrap">
<header>
  <p class="eyebrow">Ball Knowledge · 8 August 2026 · main menu redesign, build one</p>
  <h1>Five doors,<br><span>and a way back</span></h1>
  <p class="stand">Aaron's brief, in his words: <i>“move the logo and title further up,
   beneath them two squares side by side, the daily five calendar and a square for quick
   run… then the gym… then story mode… then beneath that maybe a rolodex style thing.”</i>
   Both menus ship. The old one is untouched and one switch away, because he asked for
   <i>“the ability to go back to the original if it doesn’t work out well”</i>, and a git
   revert is not that.</p>
</header>

<section>
  <h2>Phone · 390 × 844</h2>
  <p class="why">Top to bottom the layout encodes a hierarchy, and that is why the sizes
differ: <b>TODAY</b> two squares · <b>LEARN</b> one wide strip · <b>BUILD</b> the big one,
because it is the biggest promise · <b>COMPETE</b> three siblings sharing one device.
Nothing here is decorative sizing.</p>
  {pair('phone-dark-classic.png','phone-dark-new.png','Hardwood · 390','Hardwood · 390',480)}
  <div style="height:18px"></div>
  {pair('phone-light-classic.png','phone-light-new.png','Whiteout · 390','Whiteout · 390',480)}
</section>

<section>
  <h2>Desktop · 1440 × 900</h2>
  <p class="why">A 430px column centred in 1440 is a phone screenshot with wallpaper
around it. The hero takes the left and runs full height, the quick doors stack right, and
the rolodex spreads until it no longer needs to be a rolodex, all three cards fit, so all
three sit still. <b>No scrolling at 900px tall</b>, measured.</p>
  {pair('desktop-dark-classic.png','desktop-dark-new.png','Hardwood · 1440','Hardwood · 1440',900)}
  <div style="height:18px"></div>
  {pair('desktop-light-classic.png','desktop-light-new.png','Whiteout · 1440','Whiteout · 1440',900)}
</section>

<section>
  <h2>What changed, and why <em>: one line each</em></h2>
  <div class="scroll"><table>
   <tr><th>change</th><th>why</th></tr>
   <tr><td class="a">Logo and title move up and tighten</td>
       <td class="b">The old head centred a 180px calendar beside the crest and ate the
        top third of a phone. The doors now start around 200px instead of 400.</td></tr>
   <tr><td class="a">Two squares: the Daily Five calendar and Quick Run</td>
       <td class="b">Measured square, 174×174 each at 390px. The calendar is the SAME
        component as before, re-laid-out, not redrawn.</td></tr>
   <tr><td class="a">THE GYM, one wide strip</td>
       <td class="b"><b>Seven working drills already exist</b> and are buried inside the
        Rulebook. This is a promotion, not a build.</td></tr>
   <tr><td class="a">THE COME UP, the big door</td>
       <td class="b">The biggest promise gets the biggest shape, bigger by AREA than a
        square, which is what visual weight actually is.</td></tr>
   <tr><td class="a">The three VS modes become a peeking carousel</td>
       <td class="b">CPU rests in the middle with Online and Local either side, so
        <b>all three are on screen at rest</b>. A one-at-a-time flipper would have hidden
        Online an hour after it was promoted to slot 02.</td></tr>
   <tr><td class="a">The 01–05 numbers are gone</td>
       <td class="b">Aaron: <i>“you can get rid of those numbers next to each item.”</i></td></tr>
   <tr><td class="a">Packs folds into The Come Up</td>
       <td class="b">His own read, and it is right: a collection surface belongs inside
        the mode that earns the collection.</td></tr>
  </table></div>
</section>

<section>
  <h2>What was deliberately left alone</h2>
  <ul class="left">
   <li><b>The classic menu is byte-for-byte untouched.</b> Not refactored, not tidied.
    It is the control, and a control you edited is not a control.</li>
   <li><b>Quick Run and The Come Up are teases, and say so.</b> Neither is a button.
    Quick Run does not exist yet; the career mode is the biggest build in the project.
    A beautiful door that opens onto nothing costs more trust than an honest
    COMING SOON.</li>
   <li><b>The Gym goes to the Rulebook for now.</b> The room Aaron described, a gym
    space with stations you click. Is the next job, not this one. The door already
    opens onto seven real drills in the meantime.</li>
   <li><b>The arena photograph is the only image on the screen</b>, and the game already
    owned it. No new art was invented for this build. The gym interior and the career
    room both need sourcing, and that is written down rather than faked.</li>
   <li><b>The boombox, the ♪ and ⚙ controls, the background type and the arena drift</b>
    all behave as they did, except that the music player now measures whether it would
    cover the menu instead of guessing, because on the wider new layout it landed on
    LOCAL VS.</li>
  </ul>
</section>

<section>
  <h2>Four bugs this comparison caught <em>, that a description would not have</em></h2>
  <p class="why"><b>The new screen was never hidden.</b> <code>.nm{{display:flex}}</code>
beats <code>.screen{{display:none}}</code>, same specificity, later in the file, so the
new menu sat invisibly on top of the old one. install-check named the collisions in one
run: <code>btnCpu &lt;- nmGym</code>, <code>btnPlay &lt;- nm-bgdark</code>,
<code>dailyStamp &lt;- nm-h1</code>. A layout rule that also decides visibility will
always fight the thing that owns visibility.</p>
  <p class="why"><b>The calendar hung 74px off the left edge.</b> The classic menu pulls
it with a negative margin on phones, correct there, lethal in a grid cell. Overriding
width without overriding margin is half an override.</p>
  <p class="why"><b>The play cards went near-black in the light theme.</b>
<code>.nm-</code> has belonged to the NAME YOUR SQUADS screen since it was written, so its
dark <code>.nm-card</code> landed on all three rolodex cards. Found by measuring the
computed background, it reported a 160deg gradient when the new CSS only ever writes
168deg. One wrong number, one grep, one answer. The prefix is <code>.mm-</code> now.</p>
  <p class="why"><b>The hero scrim flipped with the theme but the photograph did not.</b>
The dim over the artwork was mixed from <code>var(--ground)</code>, which is a light cream
in whiteout, so light type sat on a light wash and the pitch became unreadable in one
theme only. What covers a fixed-dark picture has to be fixed dark.</p>
  <p class="why">And one that was never a bug: six red lines came from the harness
clicking <code>#btnBack</code>, which has been <code>display:none</code> on <i>both</i>
menus for weeks, the persistent back arrow replaced it. Measuring first is how you tell
a bug you just wrote from one that was never there.</p>
</section>

<footer>
  Real headless captures at 390 × 844 and 1440 × 900, both themes ·
  42 checks in <code>tools/menu2-check.mjs</code>, including the collision test run BOTH
  ways round · ten harnesses green · the switch lives in ⚙ Control Room, or
  <code>?menu=classic</code> / <code>?menu=new</code>
</footer>
</div>
'''

open(OUT, 'w', encoding='utf-8').write(HTML)
print('%s  %.2f MB' % (OUT, os.path.getsize(OUT) / 1e6))

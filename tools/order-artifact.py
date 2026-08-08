#!/usr/bin/env python3
"""Before/after for the 2026-08-08 round: the menu re-ranked, and the coach
stopping the Daily Five clock.  Run tools/menu-order-compare.mjs first.

Same page furniture as tools/lang-artifact.py — Anton display, Space Mono
utility, the arena-orange accent, before in muted grey and after ringed in
accent.  Copied deliberately rather than re-invented so every comparison in
this project reads as the same document, and so retuning one retunes the rest.
"""
import base64, io, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'docs/dev/order')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'shots/order.html')
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

MENU_ROWS = [
    ('01', 'Play · Vs the CPU',      'Play · Vs the CPU',      'unmoved'),
    ('02', 'Local VS · one screen',  'Online · Friend Codes',  'up three'),
    ('03', 'How to Play',            'Local VS · one screen',  'down one'),
    ('04', 'Packs &amp; My Squad',   'How to Play',            'down one'),
    ('05', 'Online · Friend Codes',  'Packs &amp; My Squad',   'down one'),
]
rows = '\n   '.join(
    f'<tr><td class="w">{n}</td><td class="b">{a}</td><td class="a">{b}</td>'
    f'<td class="m">{m}</td></tr>' for n, a, b, m in MENU_ROWS)

HTML = f'''<title>Online moved up · and the coach stops the clock</title>
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
  <p class="eyebrow">Ball Knowledge · 8 August 2026 · before / after</p>
  <h1>Online moved up<br><span>and the coach stops the clock</span></h1>
  <p class="stand">Two changes a player would notice in a screenshot, so both get
   put next to what they replaced. Every frame below is a real headless capture of
   the real page; the “before” is minted straight out of git, never from a working
   copy.</p>
</header>

<section>
  <h2>1 · The menu is a ranking <em>— and Online was fifth</em></h2>
  <p class="why">Aaron: <b>“can we move online play to right below CPU? It’s the
second best Main attraction honestly.”</b> Local VS needs two people in one room.
Online needs two people anywhere. The numbered list is read as <b>what is this game
for</b> long before it is read as a list of buttons.</p>
  <div class="scroll"><table>
   <tr><th>slot</th><th>was</th><th>now</th><th>move</th></tr>
   {rows}
  </table></div>

  <h3>Phone · 390 × 844 · both themes</h3>
  {pair('menu-phone-dark-before.png', 'menu-phone-dark-after.png',
        'Hardwood · 390', 'Hardwood · 390', 480)}
  <div style="height:18px"></div>
  {pair('menu-phone-light-before.png', 'menu-phone-light-after.png',
        'Whiteout · 390', 'Whiteout · 390', 480)}

  <h3>Desktop · 1440 × 900 · both themes</h3>
  {pair('menu-desktop-dark-before.png', 'menu-desktop-dark-after.png',
        'Hardwood · 1440', 'Hardwood · 1440', 900)}
  <div style="height:18px"></div>
  {pair('menu-desktop-light-before.png', 'menu-desktop-light-after.png',
        'Whiteout · 1440', 'Whiteout · 1440', 900)}

  <p class="why">Nothing here is positional in code — the ids carry the handlers,
and the only <code>nth-child</code> rules on the menu are the staircase indent and
the entrance stagger, both of which follow position by design. <b>Only the printed
01–05 had to move with it,</b> and the harness checks the printed numbers against
the on-screen geometry: a list that reads 01, 02, 03 while the DOM says otherwise
is worse than either error on its own.</p>
</section>

<section>
  <h2>2 · The coach was talking over a running clock</h2>
  <p class="why">Aaron: <b>“Make sure the coach popup pauses daily 5 gameplay.”</b>
Every coach tip already called <code>BK.freeze()</code> — and the Daily Five does not
run on the engine, so on that screen the freeze was <b>a no-op</b>. The resume notice
fires one line after the card is dealt, which means the first thing a returning
player saw was the explanation of why they lost a card, printed over a question
whose clock was already burning. <b>Reading it cost you the next one.</b></p>
  <p class="why">Now the clock is <b>held</b>, not stopped: the remaining
milliseconds are parked and handed straight back, so a 17s card interrupted at :11
resumes at :11. Measured in the harness rather than asserted — read the clock, hold
the world for 1.6 seconds of real time, read it again: <b>:21 → :21</b>, then
<b>:21 → :20</b> once the card is dismissed.</p>
  <p class="why">And it puts the veil up whenever it holds. A non-modal tip is
click-through by design; on this screen that would have left four live answer
buttons under a card announcing the clock was stopped — stopped for the timer, not
for your thumb. <code>elementFromPoint</code> on an answer now returns
<code>coachVeil</code>.</p>

  <h3>Phone · the same card, clock live vs clock held</h3>
  {pair('clock-phone-live.png', 'clock-phone-held.png',
        'Clock live · no coach', 'Coach up · clock held', 480)}

  <h3>Desktop</h3>
  {pair('clock-desktop-live.png', 'clock-desktop-held.png',
        'Clock live · no coach', 'Coach up · clock held', 900)}

  <p class="why"><b>The cue moved because these screenshots said so.</b> The clock
bar grew a striped HELD state — and the pair above shows the coach card sitting
squarely on top of it at 390 <i>and</i> at 1440. So the frozen time is printed in
the card’s own header instead: <code>COACH · CLOCK STOPPED AT :21</code>, which
doubles as a promise of exactly what you get back. The striped bar stays for
wherever it <i>is</i> visible. <b>A cue nobody can see is not a cue.</b></p>
</section>

<section>
  <h2>3 · A reset door, for testing only</h2>
  <p class="why">Aaron: <b>“I want to test again after you fix, can you reset the
daily five somehow?”</b> Two URLs, deliberately not a button — a visible “replay
today” control is a re-roll, and a streak you can repair from a settings switch is
not a streak.</p>
  <div class="scroll"><table>
   <tr><th>url</th><th>clears</th><th>keeps</th></tr>
   <tr><td class="w">?daily=reset</td>
       <td class="b">today’s stamp, receipt, any half-finished run, and today’s row
        in the history</td>
       <td class="a">your streak, every other day, the coach’s memory</td></tr>
   <tr><td class="w">?daily=wipe</td>
       <td class="b">all of the above, the entire history, and
        <code>bk_coach_seen</code></td>
       <td class="a">nothing — every tip fires again like a new phone, and every
        past day is playable for a <i>fresh</i> ten</td></tr>
   <tr><td class="w">?daily=anything-else</td>
       <td class="b">nothing at all</td>
       <td class="a">everything — it lands on the title screen like any other
        visit</td></tr>
  </table></div>
  <p class="why">Same ten cards on a <code>reset</code>, because the set is a
function of the date — that is the whole premise of the mode and it is not being
broken for a test. For a <b>fresh</b> ten, use <code>wipe</code> and open a past day
from the streak calendar. Both say which one they did, in the game’s first toast.</p>
</section>

<section>
  <h2>What was deliberately left alone</h2>
  <ul class="left">
   <li><b>The Daily Five stamp stays where it is</b> — above the title, not in the
    numbered list. A daily ritual is not a game mode, and that ruling has not
    changed.</li>
   <li><b>Packs &amp; My Squad is still last</b> and still locked. It moved from 04
    to 05 only because Online passed it; the tease itself is untouched.</li>
   <li><b>The streak calendar is still disabled mid-card.</b> That is the pause
    loophole the clock refuses to open — a door the <i>player</i> can use to stop
    the world and go look an answer up. Nobody can summon a coach card, which is
    why the coach may stop the clock and the calendar may not.</li>
   <li><b>The main game’s freeze is unchanged.</b> Online play still holds nothing,
    on purpose: you cannot pause the other phone.</li>
   <li><b>No reset control in the Control Room.</b> The Coach re-arm switch that
    already lives there is a teaching setting, not a scoring one.</li>
  </ul>
</section>

<footer>
  Real headless captures · the “before” tree is minted out of git by
  <code>tools/menu-order-compare.mjs</code> and deleted again ·
  28 checks in <code>tools/daily-pause-check.mjs</code>, including two that try to
  break it: an unknown <code>?daily=</code> value, and a tap on an answer while the
  coach has the floor · filed as D16, D17 and D18 in <code>V0.md</code>
</footer>
</div>
'''

open(OUT, 'w', encoding='utf-8').write(HTML)
print('%s  %.2f MB' % (OUT, os.path.getsize(OUT) / 1e6))

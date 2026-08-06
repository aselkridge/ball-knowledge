#!/usr/bin/env python3
"""Comparison page: the export lock, and the six HUD controls made bigger.

Run tools/lock-shots.mjs and tools/hud-compare.mjs first.
"""
import base64, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'shots/lock.html')


def b64(path, mime):
    with open(os.path.join(ROOT, path), 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


def img(n):
    return b64('shots/' + n, 'image/png')


def font(n):
    return b64('docs/play/assets/fonts/' + n, 'font/woff2')


HTML = f'''<title>The export lock, and six buttons that grew</title>
<style>
@font-face{{font-family:'Anton';src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
@font-face{{font-family:'Archivo';src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:block}}
@font-face{{font-family:'SpaceMono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
:root{{
  --ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;
  --ink:#221a15;--muted:#5f5245;--dim:#877868;--accent:#b3590b;--cool:#0f6c65;--bad:#9d2b25;
  --shadow:0 1px 0 rgba(34,26,21,.05),0 10px 30px -18px rgba(34,26,21,.5);
  --mono:'SpaceMono',ui-monospace,Menlo,monospace;
  --body:'Archivo',system-ui,-apple-system,sans-serif;--display:'Anton',Impact,sans-serif}}
@media (prefers-color-scheme:dark){{:root{{
  --ground:#141010;--panel:#1d1714;--sunk:#100c0b;--rule:#3a2e26;
  --ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;--accent:#f5872e;--cool:#6fd0c3;--bad:#d5524b;
  --shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000}}}}
:root[data-theme="light"]{{--ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;
  --ink:#221a15;--muted:#5f5245;--dim:#877868;--accent:#b3590b;--cool:#0f6c65;--bad:#9d2b25;
  --shadow:0 1px 0 rgba(34,26,21,.05),0 10px 30px -18px rgba(34,26,21,.5)}}
:root[data-theme="dark"]{{--ground:#141010;--panel:#1d1714;--sunk:#100c0b;--rule:#3a2e26;
  --ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;--accent:#f5872e;--cool:#6fd0c3;--bad:#d5524b;
  --shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--ground);color:var(--ink);font-family:var(--body);
  font-size:17px;line-height:1.62;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:1080px;margin:0 auto;padding:0 22px 90px;display:flex;flex-direction:column;gap:52px}}
header{{padding:64px 0 0;display:flex;flex-direction:column;gap:14px}}
.eyebrow{{font-family:var(--mono);font-size:.68rem;letter-spacing:.24em;text-transform:uppercase;
  color:var(--accent);margin:0}}
h1{{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:.01em;
  font-size:clamp(2.3rem,6vw,3.8rem);line-height:.95;margin:0;text-wrap:balance}}
h1 span{{color:var(--accent)}}
.stand{{font-size:1.1rem;color:var(--muted);margin:0;max-width:62ch;text-wrap:pretty}}
section{{display:flex;flex-direction:column;gap:18px}}
h2{{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:.02em;
  font-size:clamp(1.4rem,3.2vw,2rem);line-height:1.05;margin:0;text-wrap:balance;
  padding-bottom:10px;border-bottom:2px solid var(--accent)}}
h2 em{{font-style:normal;color:var(--dim)}}
p{{margin:0;max-width:66ch}}
.why{{font-family:var(--mono);font-size:.8rem;line-height:1.75;color:var(--muted);
  border-left:3px solid var(--accent);padding:2px 0 2px 16px;margin:0;max-width:80ch}}
.why b{{color:var(--accent);font-weight:400}}
.warn{{border-left-color:var(--bad)}}
.warn b{{color:var(--bad)}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}}
.shot{{margin:0;display:flex;flex-direction:column;min-width:0}}
.shot figcaption{{font-family:var(--mono);font-size:.66rem;letter-spacing:.13em;text-transform:uppercase;
  color:var(--dim);display:flex;align-items:center;gap:9px;padding:0 0 8px}}
.tag{{font-family:var(--mono);font-size:.6rem;letter-spacing:.16em;padding:3px 8px;
  border:1px solid currentColor;line-height:1}}
.shot.b .tag{{color:var(--dim)}}
.shot.a .tag{{color:var(--accent)}}
.frame{{border:1px solid var(--rule);background:#141010;overflow:hidden;box-shadow:var(--shadow);line-height:0}}
.shot.a .frame{{border-color:var(--accent)}}
.frame img{{width:100%;height:auto;display:block}}
table{{border-collapse:collapse;width:100%;font-family:var(--mono);font-size:.76rem;
  background:var(--panel);border:1px solid var(--rule);box-shadow:var(--shadow)}}
th,td{{text-align:left;padding:9px 14px;border-bottom:1px solid var(--rule)}}
th{{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:400}}
td{{color:var(--muted);font-variant-numeric:tabular-nums}}
td b{{color:var(--ink);font-weight:600}}
tr:last-child td{{border-bottom:0}}
.scroll{{overflow-x:auto}}
code{{font-family:var(--mono);font-size:.86em;background:var(--sunk);color:var(--cool);
  padding:.1em .38em;border:1px solid var(--rule)}}
footer{{border-top:1px solid var(--rule);padding-top:20px;font-family:var(--mono);font-size:.7rem;
  letter-spacing:.09em;color:var(--dim);line-height:1.9}}
@media(max-width:820px){{.pair{{grid-template-columns:1fr}}header{{padding-top:42px}}.wrap{{gap:40px}}}}
@media(prefers-reduced-motion:reduce){{*{{transition:none!important}}}}
</style>

<div class="wrap">

<header>
  <p class="eyebrow">Ball Knowledge · 4 August 2026</p>
  <h1>A lock on the export,<br><span>and six buttons that grew</span></h1>
  <p class="stand">You overruled me on gating the spreadsheet export, and you were right —
    I answered the mechanism and ignored what you were actually asking for. It is built.
    The second half is the HUD controls you asked to see before and after.</p>
</header>

<section>
  <h2>The export lock</h2>
  <p class="why"><b>Locked by default.</b> The button carries a padlock, and pressing it
asks for a passcode instead of copying. Everything else on the page stays open —
you can still read, filter, sort, join and count. A wrong passcode fails closed and
says so. The right one sticks, and a <b>Lock</b> button appears so you can shut it again.
The passcode is not in the page: only a SHA-256 of it, iterated 5,000 times.</p>
  <div class="pair">
    <figure class="shot a"><figcaption><span class="tag">New</span>the bar, locked</figcaption>
      <div class="frame"><img src="{img('lock-bar.png')}" alt="The bar with a padlock on the export button"></div></figure>
    <figure class="shot a"><figcaption><span class="tag">New</span>pressing it</figcaption>
      <div class="frame"><img src="{img('lock-ask.png')}" alt="The passcode prompt"></div></figure>
  </div>
  <p class="why warn"><b>WHAT IT DOES NOT DO, and you should know this before you trust it.</b>
It stops the stumbler — the person who finds the page, presses the obvious button
and walks off with 1,526 cards in a spreadsheet. It cannot stop anyone who opens
developer tools, because the tables live at <code>/play/data/tables/*.json</code>
on the same public site and the game itself fetches them in the clear. The repo is
public too. A check in the test suite asserts exactly this, so nobody later
mistakes the lock for security: <b>"THE DATA IS STILL PUBLIC — the json fetches
fine with the export locked."</b> The lock is a door on a room that does not have
walls yet. It is still worth having; most people only ever try the door.</p>
</section>

<section>
  <h2>Six HUD controls <em>— you asked to see this one</em></h2>
  <p class="why">Five of the six live behind the <b>⋯</b>, so a shot with the tray shut
would show one button changing and hide the rest. Tray open, both sides, 390px.
Only the <b>minimum</b> moved — <code>.dbtn</code> clamp floor 24px → 30px and
<code>.pbtn</code> padding 3px → 7px — so nothing changes on a laptop. The text,
the borders and the icons are untouched; only the boxes around them grew.</p>
  <div class="pair">
    <figure class="shot b"><figcaption><span class="tag">Before</span>390px · tray open</figcaption>
      <div class="frame"><img src="{img('hud-before-390.png')}" alt="Before — the HUD tray with small buttons"></div></figure>
    <figure class="shot a"><figcaption><span class="tag">After</span>390px · tray open</figcaption>
      <div class="frame"><img src="{img('hud-after-390.png')}" alt="After — the HUD tray with bigger buttons"></div></figure>
  </div>
  <div class="scroll"><table>
    <tr><th>Control</th><th>Before</th><th>After</th></tr>
    <tr><td>⋯ &nbsp;<span style="color:var(--dim)">hudMore</span></td><td>24 × 24</td><td><b>30 × 30</b></td></tr>
    <tr><td>☰ &nbsp;<span style="color:var(--dim)">pause</span></td><td>37 × 26</td><td><b>39 × 34</b></td></tr>
    <tr><td>↺ &nbsp;<span style="color:var(--dim)">replay</span></td><td>37 × 26</td><td><b>39 × 34</b></td></tr>
    <tr><td>♪ &nbsp;<span style="color:var(--dim)">music</span></td><td>37 × 25</td><td><b>39 × 33</b></td></tr>
    <tr><td>? &nbsp;<span style="color:var(--dim)">help</span></td><td>37 × 25</td><td><b>39 × 33</b></td></tr>
    <tr><td>🔔 <span style="color:var(--dim)">coach</span></td><td>37 × 25</td><td><b>39 × 33</b></td></tr>
  </table></div>
  <p class="why">The invisible 44px tap area shipped weeks ago, so these were already
easy to <b>hit</b> — they just read as specks. <code>smoke-check.mjs</code> counted
6 controls under 28px on the game screen and its ceiling was 6; it now counts
<b>0</b> and the ceiling is <b>0</b>, so a seventh can never quietly appear.</p>
</section>

<footer>
  Real headless captures at 390 × 844 and 1000px · the “before” is minted out of git by
  <code>tools/hud-compare.mjs</code> and deleted again ·
  <code>tools/tape-passcode.py</code> sets the passcode ·
  91 checks in <code>tools/tape-check.mjs</code>, all passing
</footer>

</div>
'''

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('%s  %.1f MB' % (OUT, os.path.getsize(OUT) / 1e6))

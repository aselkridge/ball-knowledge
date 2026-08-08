#!/usr/bin/env python3
"""The visual walkthrough of add-to-home-screen, before it merges.

    node tools/install-shots.mjs        # capture the seven states first
    python3 tools/install-walkthrough.py <out.html>

Why this exists
---------------
Aaron, 2026-08-07: *"Can you give me a visual walkthrough of the build and what
it will look like to the player before we push it live?"* Which is also the
standing house rule: anything that changes how something LOOKS ships a
comparison before it merges.

THE "BEFORE" IS REAL, not described. `main` has the logo as pure decoration and
nothing anywhere that mentions the home screen, so the before/after pair for
state 3 is genuinely the same screen with and without this change.

Images are downscaled and re-encoded to JPEG before embedding. The raw PNGs are
6.8MB and the artifact ceiling is 16MB; a phone screenshot of a dark UI is
exactly the case where JPEG at quality 82 is indistinguishable at the size it is
displayed and about a tenth of the bytes.
"""

import base64
import io
import pathlib
import re
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHOTS = ROOT / 'design/shots/install'
MAXW = 620          # displayed at ~310 CSS px, so 2x for retina

STATES = [
    ('1-iphone-first-run', 'iPhone · the very first open',
     'THE COLDEST CALL PATTERN, which you asked for by name. The world dims, '
     'the logo is cut out of the dim and ringed, and the card moves BELOW its '
     'subject instead of parking on it. The hole is a real hole: the logo '
     'inside it is still tappable, which is the whole point. "Or tap the logo '
     'any time" is now its own line in the accent, not a clause in the grey.',
     'Three things I had wrong first, all caught by the harness rather than by '
     'me: the veil was covering the logo it points at, the card was UNDER the '
     'darkness rather than above it, and the anytime line was buried.'),
    ('2-iphone-sheet', 'iPhone · what the button opens',
     'The fake home screen was your idea and it was not overkill: "Add to Home '
     'Screen" is an abstraction until you have seen what you end up with. The '
     'icon in the mock is the REAL icon file, so the picture and the outcome '
     'cannot drift apart. Apple exposes no install API at all, so pointing '
     'precisely is the honest maximum here.',
     'STEP 2 CHANGED BECAUSE OF YOUR PHOTOGRAPH. Your share sheet ends that '
     'row with View More, and Add to Home Screen is not visible until you tap '
     'it. A guide that just says "scroll down" loses people exactly there. '
     'Fixed here AND in the guide you send friends.'),
    ('3-iphone-later-visit', 'iPhone · every visit after that',
     'The coach is gone for good. The logo keeps a small hint pill under it, '
     'so the offer is permanent without ever being a nag. This is the state '
     'most people will see most of the time.',
     'BEFORE, on main: the same screen with no pill, and a logo that does '
     'nothing at all.'),
    ('4-iphone-INSTALLED', 'iPhone · ALREADY on the home screen',
     'Your rule, and the reason the harness exists. No coach, no pill, and the '
     'logo is not merely inert — it loses the pointer, the button role, the '
     'label and its place in the keyboard tab order. A control that looks '
     'live and does nothing is worse than no control.',
     'Impossible to eyeball, because seeing it fail means installing the app '
     'and coming back. Six checks drive it by telling the page it is already '
     'installed, exactly as a launched home-screen app reports.'),
    ('5-android-hint', 'Android · same screen, different machinery',
     'Android gives the browser a real install event. We intercept Chrome’s '
     'own banner and hand it to the logo instead, so tapping it opens the '
     'genuine one-tap install dialog rather than instructions.',
     'The pill wording is identical on both platforms on purpose. The player '
     'should not have to know which of these two worlds they are in.'),
    ('6-ios-chrome-sheet', 'iPhone, but not Safari',
     'Chrome and Firefox on iOS cannot do this the way Safari can. Rather '
     'than fail silently or pretend, the sheet says so and names Safari.',
     'A small case that would otherwise be a mystery for whoever opens your '
     'link from inside another app.'),
    ('7-desktop-untouched', 'Desktop · nothing changes',
     'No coach, no pill, no glow. Nobody adds a game to the home screen of a '
     'laptop, and desktop Chrome’s install dialog produces a window nobody '
     'asked for.',
     'Deliberately left alone, listed here because silence can read as an '
     'oversight.'),
]


def img(name):
    p = SHOTS / f'{name}.png'
    if not p.exists():
        sys.exit(f'missing screenshot: {p}. Run tools/install-shots.mjs first.')
    im = Image.open(p).convert('RGB')
    if im.width > MAXW:
        im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=82, optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


PAGE = """<title>Add to home screen — the walkthrough</title>
<style>
@font-face{font-family:'Anton';src:url(data:font/woff2;base64,__ANTON__) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Archivo';src:url(data:font/woff2;base64,__ARCHIVO__) format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:'SpaceMono';src:url(data:font/woff2;base64,__MONO__) format('woff2');font-weight:700;font-display:swap}
/* the game's own palette, copied from docs/play/index.html :root */
:root{
  --ground:#f4efe6;--panel:#fffdf8;--panel2:#ece4d6;--line:#d9cdb9;
  --ink:#17120f;--ink-dim:#544a3f;--ink-faint:#8b8073;--accent:#b8560f;--ok:#3f7d43;
  --mono:'SpaceMono',ui-monospace,Menlo,monospace;
  --sans:'Archivo',system-ui,-apple-system,sans-serif;
  --display:'Anton','Archivo',system-ui,sans-serif;}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ground:#100d0b;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
  --ink:#efe6d8;--ink-dim:#c2b7a3;--ink-faint:#7d735f;--accent:#f5872e;--ok:#6fbf73;}}
:root[data-theme="dark"]{
  --ground:#100d0b;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
  --ink:#efe6d8;--ink-dim:#c2b7a3;--ink-faint:#7d735f;--accent:#f5872e;--ok:#6fbf73;}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);
  font-weight:600;line-height:1.55;-webkit-font-smoothing:antialiased}
.wrap{max-width:1080px;margin:0 auto;padding:clamp(22px,4vw,50px) clamp(16px,4vw,28px) 80px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.15em;font-weight:700;
  text-transform:uppercase;color:var(--ink-faint);display:block;margin-bottom:10px}
h1{font-family:var(--display);font-weight:400;letter-spacing:.02em;
  font-size:clamp(34px,7vw,58px);line-height:.98;margin:0;text-wrap:balance}
h1 em{font-style:normal;color:var(--accent)}
.dek{margin:14px 0 0;max-width:62ch;color:var(--ink-dim);font-size:clamp(15px,1.7vw,17px)}
.dek b{color:var(--ink)}
.status{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 34px}
.chip{font-family:var(--mono);font-size:10.5px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;border:1px solid var(--line);border-radius:999px;
  padding:5px 11px;color:var(--ink-dim)}
.chip.go{border-color:var(--ok);color:var(--ok)}
.state{display:grid;grid-template-columns:320px 1fr;gap:clamp(18px,3vw,36px);
  align-items:start;padding:26px 0;border-top:1px solid var(--line)}
.state img{width:100%;height:auto;border-radius:12px;border:1px solid var(--line);
  display:block;background:#100d0b}
.n{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.12em;
  color:var(--accent);text-transform:uppercase;display:block;margin-bottom:5px}
.state h2{font-family:var(--display);font-weight:400;letter-spacing:.02em;
  font-size:clamp(21px,3vw,29px);margin:0 0 10px;line-height:1.08}
.state p{margin:0 0 11px;font-size:15px;color:var(--ink)}
.state .note{font-size:13.5px;color:var(--ink-dim);border-left:2px solid var(--line);
  padding-left:12px;margin:0}
.foot{margin-top:44px;border-top:1px solid var(--line);padding-top:24px}
.foot h2{font-family:var(--mono);font-size:11px;letter-spacing:.15em;font-weight:700;
  text-transform:uppercase;color:var(--ink-faint);margin:0 0 12px}
.foot ul{margin:0;padding-left:19px}
.foot li{font-size:14.5px;color:var(--ink-dim);margin-bottom:7px}
.foot li b{color:var(--ink)}
code{font-family:var(--mono);font-size:.86em;background:var(--panel2);
  padding:1px 5px;border-radius:2px;color:var(--accent)}
@media (max-width:760px){.state{grid-template-columns:1fr}
  .state img{max-width:330px;margin:0 auto}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
<div class="wrap">
<span class="eyebrow">Ball Knowledge &middot; before it merges &middot; 7 August 2026</span>
<h1>Add to <em>home screen</em></h1>
<p class="dek">The manifest shipped this morning and made the game installable.
This is the part that makes anyone <b>notice</b>. Every picture below is a real
headless screenshot of the real build at 390px, not a mockup.</p>
<div class="status">
  <span class="chip go">50 checks pass</span>
  <span class="chip go">4 sabotages proven</span>
  <span class="chip">smoke &middot; daily &middot; drill &middot; pwa all still green</span>
  <span class="chip">not merged</span>
</div>
__STATES__
<div class="foot">
  <h2>What I would still flag</h2>
  <ul>
    <li><b>If somebody deletes the icon, the offer comes back.</b> On Android
    that is airtight: Chrome stops firing its install event while the app is
    installed and starts again once it is gone. On iPhone it is best-effort,
    because a home-screen web app gets its own storage separate from Safari and
    no API lets a browser tab ask whether a site is already installed. <b>What
    always works on both is the logo</b>: the moment the app is not installed
    it becomes a control again and the hint pill returns, with no memory
    needed.</li>
    <li><b>Somebody who just says "not now" is never nagged again.</b> Only a
    removal re-arms the coach, and it re-arms once, not every visit. Both halves
    are tested separately.</li>
    <li><b>Android's dialog cannot be screenshotted here.</b> State 5 shows our
    half; the dialog on top of it is Chrome's own and looks the same as every
    other app install. The harness proves our code calls it.</li>
    <li><b>The hint pill wording is a taste call.</b> "Add to home screen" is
    plain and slightly flat. Say the word and it becomes something with more
    voice.</li>
    <li><b>This is a slice of B7, not B7.</b> The coach now has a first-run
    moment and a way to carry an action button. The full first-run guide, the
    one that teaches the game, is still the bigger job.</li>
  </ul>
</div>
</div>
"""


def main():
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'walkthrough.html')
    fonts = ROOT / 'docs/play/assets/fonts'
    body = ''.join(
        f'<section class="state">'
        f'<img src="data:image/jpeg;base64,{img(k)}" alt="{esc(title)}">'
        f'<div><span class="n">State {i}</span><h2>{esc(title)}</h2>'
        f'<p>{esc(what)}</p><p class="note">{esc(note)}</p></div></section>'
        for i, (k, title, what, note) in enumerate(STATES, 1))
    s = PAGE.replace('__STATES__', body)
    for tok, f in [('__ANTON__', 'anton-400.woff2'),
                   ('__ARCHIVO__', 'archivo-600.woff2'),
                   ('__MONO__', 'spacemono-700.woff2')]:
        s = s.replace(tok, base64.b64encode((fonts / f).read_bytes()).decode())
    left = re.findall(r'__[A-Z]+__', s)
    if left:
        sys.exit(f'unreplaced: {sorted(set(left))}')
    out.write_text(s, encoding='utf-8')
    mb = len(s) / 1024 / 1024
    if mb > 15:
        sys.exit(f'{mb:.1f}MB is too close to the 16MB artifact ceiling')
    print(f'{out}  {mb:.1f}MB  ·  {len(STATES)} states')


if __name__ == '__main__':
    main()

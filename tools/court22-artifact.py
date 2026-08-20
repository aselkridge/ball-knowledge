#!/usr/bin/env python3
"""ROW 22: THE COURT TURNS UP THE SCREEN ON PHONES.

Aaron ruled this next on 08-19 ("V0 row 22 explain it more to me and let's do
it next"). Every frame is a real headless screenshot of the real game. The
BEFORE is reconstructed on demand by the `cam-before` variant in
tools/board2-shots.mjs, which makes the tall camera identical to the wide one
so the responsive path still runs and ONLY the angle differs. House skin,
copied from tools/board3-artifact.py.

Two things in here are measurements rather than opinions, and both are quoted
with the number: the court's share of the screen on four real devices, and the
proof that desktop did not move (0 pixels)."""
import base64, io, os
from PIL import Image

S = 'design/shots/board2/'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/court22-compare.html'


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


def img(name, w=None, box=None, q=86):
    im = Image.open(S + name + '.png')
    if box:
        im = im.crop(box)
    if w and im.width != w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.convert('RGB').save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


def pair(a, b, la, lb, cap, note, box=None, w=1120, tall=False):
    return f'''
    <figure class="pair{' tall' if tall else ''}">
      <figcaption><b>{cap}</b><span>{note}</span></figcaption>
      <div class="ba">
        <div class="cell"><span class="chip">{la}</span><img src="{img(a, w, box)}" alt="{la}"></div>
        <div class="cell after"><span class="chip on">{lb}</span><img src="{img(b, w, box)}" alt="{lb}"></div>
      </div>
    </figure>'''


# --------------------------------------------------------------- measurements
# Court height through the game's own projection, on real renders.
DEVICES = [
    ('iPhone 14', '390x844', 170, 434, 20.2, 51.4),
    ('iPhone SE', '375x667', 164, 415, 24.5, 62.3),
    ('Pro Max', '430x932', 189, 483, 20.4, 51.8),
    ('Desktop', '1280x860', 574, 574, 66.7, 66.7),
]
drows = ''.join(f'''
      <tr><td class="thing">{d}</td><td class="mono">{v}</td>
        <td class="mono">{b}px</td><td class="mono num">{a}px</td>
        <td class="mono">{bp}%</td><td class="mono num">{ap}%</td>
        <td class="mono">{'unchanged' if b == a else f'{a/b:.2f}x'}</td></tr>'''
                 for d, v, b, a, bp, ap in DEVICES)

# Cameras swept, all measured on real 390x844 renders by tools/camera-sweep.mjs.
CAMS = [
    ('as it ships', '-30 / 57', 170, '1.00x', 20.2, False),
    ('more overhead', '-30 / 45', 219, '1.28x', 25.9, False),
    ('more overhead', '-30 / 38', 242, '1.42x', 28.7, False),
    ('more overhead', '-30 / 30', 264, '1.55x', 31.3, False),
    ('turned upright', '-55 / 57', 224, '1.32x', 26.6, False),
    ('turned upright', '-55 / 45', 288, '1.69x', 34.1, False),
    ('turned upright', '-55 / 38', 318, '1.87x', 37.7, False),
    ('lengthwise', '-80 / 45', 390, '2.29x', 46.2, False),
    ('lengthwise', '-80 / 38', 434, '2.54x', 51.4, True),
    ('lengthwise', '-90 / 42', 423, '2.48x', 50.2, False),
]
crows = ''.join(f'''
      <tr class="{'pick' if p else ''}"><td class="thing">{n}{' &larr; shipped' if p else ''}</td>
        <td class="mono">{rz}</td><td class="mono num">{h}px</td>
        <td class="mono">{m}</td><td class="mono">{s}%</td></tr>'''
                for n, rz, h, m, s, p in CAMS)

HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Court Turns</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{--ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;
    --accent:#b8560c;--good:#2f7d43;}}
  @media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{
    --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
    --accent:#f5872e;--good:#63c47e;}}}}
  :root[data-theme="dark"]{{--ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;
    --dim:#a3937f;--accent:#f5872e;--good:#63c47e;}}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ground);color:var(--ink);font-size:16.5px;line-height:1.62;
    font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1120px;margin:0 auto;padding:0 22px 96px;display:flex;flex-direction:column;gap:54px}}
  .eyebrow{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.15em;
    text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(38px,7vw,64px);line-height:.98;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:26px;margin:0}}
  p{{margin:0}}
  .lede{{max-width:66ch;color:var(--dim);font-size:17px}}
  .lede strong{{color:var(--ink)}}
  blockquote{{margin:0;font-family:'Space Mono',monospace;font-size:15px;line-height:1.7;
    border-left:3px solid var(--accent);padding-left:18px;color:var(--ink);max-width:72ch}}
  header.top{{padding:56px 0 0;display:flex;flex-direction:column;gap:18px}}
  section{{display:flex;flex-direction:column;gap:20px}}
  .pair{{margin:0;display:flex;flex-direction:column;gap:10px}}
  .pair figcaption{{display:flex;flex-direction:column;gap:3px}}
  .pair figcaption b{{font-family:Archivo,sans-serif;font-weight:600;font-size:15px;
    letter-spacing:.04em;text-transform:uppercase}}
  .pair figcaption span{{font-family:'Space Mono',monospace;font-size:13px;color:var(--dim);max-width:88ch}}
  .ba{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
  .pair.tall .ba{{max-width:640px}}
  @media (max-width:820px){{.ba{{grid-template-columns:1fr}}}}
  .cell{{position:relative;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#0a0706}}
  .cell.after{{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}}
  .cell img{{display:block;width:100%;height:auto}}
  .chip{{position:absolute;top:8px;left:8px;z-index:2;font-family:'Space Mono',monospace;
    font-size:10px;letter-spacing:.16em;padding:3px 8px;border-radius:3px;
    background:rgba(0,0,0,.62);color:#cfc4ae}}
  .chip.on{{background:var(--accent);color:#1b120a;font-weight:700}}
  .scroll{{overflow-x:auto}}
  table{{border-collapse:collapse;width:100%;font-size:15px;min-width:520px}}
  td,th{{text-align:left;vertical-align:top;padding:10px 13px;border-top:1px solid var(--line);white-space:nowrap}}
  th{{font-family:Archivo,sans-serif;font-weight:600;font-size:11px;letter-spacing:.11em;
    text-transform:uppercase;color:var(--dim);border-top:0}}
  td.thing{{font-family:Archivo,sans-serif;font-weight:600;white-space:normal}}
  td.mono{{font-family:'Space Mono',monospace;font-size:13px;color:var(--dim)}}
  td.mono.num{{color:var(--good)}}
  tr.pick td{{background:rgba(184,86,12,.09)}}
  tr.pick td.thing{{color:var(--accent)}}
  .stat{{display:flex;gap:34px;flex-wrap:wrap}}
  .stat div{{display:flex;flex-direction:column}}
  .stat b{{font-family:Anton,Impact,sans-serif;font-size:38px;line-height:1;color:var(--accent)}}
  .stat span{{font-family:'Space Mono',monospace;font-size:11px;color:var(--dim);
    letter-spacing:.06em;text-transform:uppercase;margin-top:6px;max-width:22ch}}
  .call{{border-left:3px solid var(--accent);padding:2px 0 2px 18px;display:flex;flex-direction:column;gap:9px}}
  .call b{{font-family:Archivo,sans-serif;font-weight:600;letter-spacing:.04em;
    text-transform:uppercase;font-size:14px}}
  .call p{{color:var(--dim);font-size:15px;max-width:82ch}}
  .call.ask{{border-left-color:var(--good)}}
  ul{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:9px;color:var(--dim);
    max-width:84ch;font-size:15px}}
  ul strong{{color:var(--ink)}}
  ol{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:9px;color:var(--dim);
    max-width:84ch;font-size:15px}}
  ol strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:18px;line-height:1.7}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · V0 row 22 · 08-20</p>
    <h1>The court turns up the screen</h1>
    <blockquote>"sometimes it feels low budget, airy, weird, everything is small"</blockquote>
    <p class="lede">A big part of that was one measurable thing. The board was
      <strong>20.2% of a phone screen and 66.7% of a desktop one</strong>, so the game was three
      times smaller on the machine it actually gets played on. Nothing was wasting the space: a
      basketball court is a wide short shape, so at phone width the fit runs out of WIDTH first
      and the court can only be as tall as its own proportions allow. The lever was never the
      layout. It was the camera.</p>
    <div class="stat">
      <div><b>2.54x</b><span>taller board on a phone</span></div>
      <div><b>51.4%</b><span>of the screen, up from 20.2</span></div>
      <div><b>0 px</b><span>changed on desktop</span></div>
      <div><b>28/28</b><span>turn checks passing</span></div>
    </div>
  </header>

  <section>
    <h2>The phone</h2>
    {pair('cam-before-phone-full', 'ship-phone-full', 'BEFORE', 'NOW',
          'Whole screen, 390x844',
          'Same seed, same court, same roster, same moment. Only the camera angle differs.',
          w=560, tall=True)}
  </section>

  <section>
    <h2>The desktop, which was deliberately not touched</h2>
    {pair('cam-before-desk-full', 'ship-desk-full', 'BEFORE', 'NOW',
          'Whole screen, 1280x860',
          'A wide screen suits a wide court, so desktop keeps the three-quarter view. '
          'Not "looks the same": 0 of 3,287,040 pixels differ.',
          w=1100)}
  </section>

  <section>
    <h2>What it buys, per device</h2>
    <p class="lede">Court height read out of the game's own projection on real renders, never
      modelled. I did write a model first, it disagreed with the renderer by 1.9x, and it was
      binned rather than debugged.</p>
    <div class="scroll"><table>
      <tr><th>Device</th><th>Viewport</th><th>Before</th><th>Now</th>
        <th>Before</th><th>Now</th><th></th></tr>{drows}
    </table></div>
  </section>

  <section>
    <h2>The ten cameras, and why this one</h2>
    <p class="lede">RZ turns the court on the floor. RX tilts it and is measured from overhead,
      so smaller is more top-down. Every row is a real 390x844 render.</p>
    <div class="scroll"><table>
      <tr><th>Camera</th><th>RZ / RX</th><th>Court height</th><th>vs before</th><th>Share of screen</th></tr>{crows}
    </table></div>
  </section>

  <section>
    <h2>How it decides</h2>
    <div class="call">
      <b>It keys on the shape of the space, not on a device width</b>
      <p>What decides which camera fits is the shape of the hole the court goes into, so that is
        what gets measured: the court wrapper's own aspect. Portrait phones come in at 0.53 to
        0.67, a portrait tablet at 0.89, desktop at 2.00, and a phone turned on its side at 3.77.
        A threshold at 1.0 separates them with room to spare, and it gets rotation right for free:
        turn the phone landscape and the space is wide and short again, so the wide camera comes
        back on its own.</p>
      <p>It re-aims only when the space changes SHAPE, never on every resize. RZ is live, you can
        drag the court around, and a phone fires a resize event every time the URL bar hides. A
        camera that re-applied on each of those would snap your view back while you were moving
        it.</p>
    </div>
    <div class="call">
      <b>The overlap law needed a third escape, and this row predicted it</b>
      <p>The law is that no dock state ever covers a tile. Its two escapes both assume the DOCK
        can move: go slim, then slide into the dead triangle a rotated court leaves at the lower
        right. A court turned upright is a tall rectangle across the full width and there is no
        triangle, so both ran out. Measured at 390x667 with the lean-in camera at full zoom, the
        floor sat 33.7px under a dock that had already gone slim AND side.</p>
      <p>So the last resort inverts it and the BOARD gives way: the dock's intrusion becomes
        unusable height. Grow-only and cleared when the viewport changes, so it settles in one
        step instead of arguing with its own measurement. The lean-in camera needed the same rule
        again separately, because it zooms past the wrapper on purpose, so its bottom edge is
        clamped and its top is deliberately left free. All 28 turn checks pass.</p>
    </div>
  </section>

  <section>
    <h2>Two costs this job listed that turned out not to exist</h2>
    <ul>
      <li><strong>"The pieces still face across the court."</strong> They do not, and they cannot.
        Each figurine is a lathe, a single curve spun around a vertical axis, so turning one about
        its own axis cannot change its outline. Checked rather than assumed, with the yaw set to
        zero: <strong>548 changed pixels out of 1,143,480, 0.05%</strong>, and that is sampling
        phase, not shape.</li>
      <li><strong>"Left and right become up and down, so every mental model moves."</strong> Every
        spatial left or right in the repo is a code COMMENT. Nothing a player reads gives a
        direction, so there was no written mental model to move.</li>
    </ul>
  </section>

  <section>
    <h2>Left alone on purpose</h2>
    <ul>
      <li><strong>Desktop.</strong> Wide screen, wide court, existing view. Proved at 0 pixels.</li>
      <li><strong>The rules, the tiles, the geometry.</strong> This is a camera, nothing about
        the court itself changed. Same 13x7, same measured feet, same rims.</li>
      <li><strong>The lean-in.</strong> Tapping a player still zooms the floor toward him; it just
        cannot push the floor under the dock any more.</li>
      <li><strong>Everything from the board run.</strong> Floor, inlaid grid, jersey numbers,
        lighting, depth sort and the head are as they were.</li>
    </ul>
  </section>

  <section>
    <h2>One thing that needs your call</h2>
    <div class="call ask">
      <b>The near basket reads as a ghost at the new angle</b>
      <p>Look at the bottom of the phone shot. The backboard is CLEAR GLASS by design, panes at
        alpha .09 to .12, which is right when you see it edge-on and wrong when you see it
        face-on. Measured rather than eyeballed: the board's normal runs along the court's length,
        so how face-on it reads works out to the sine of the turn times the sine of the tilt, and
        that goes from <strong>0.419 on the old camera to 0.606 on the new one, 1.45x</strong>. The
        same glass that read as a pane now reads as a smear on the paint. It was always like this;
        the old camera just never showed it to you square on.</p>
      <ol>
        <li><strong>Scale the glass with the angle.</strong> One line, and physically right, since
          glass seen square on reflects more, not less. Costs you a slice of the near key under a
          more solid board.</li>
        <li><strong>Dim the near goal, leave the far one.</strong> The near basket is behind the
          action and nobody needs to read it.</li>
        <li><strong>My recommendation: do 1 for the far goal and crop the near one to its rim and
          net</strong>, dropping the near backboard and stanchion entirely. Overhead broadcast
          does exactly this, nothing about the near board carries information, and it is the only
          option that gives court back instead of taking more.</li>
      </ol>
    </div>
  </section>

  <footer>
    Frames: real headless screenshots at 1280x860 and 390x844, DPR 2, reduce-motion on.
    The before is reconstructed live by the cam-before variant in tools/board2-shots.mjs, which
    makes the tall camera identical to the wide one so only the angle differs.
    Pixel counts are trustworthy because the harness noise floor was measured and then removed:
    two shots of the same build used to differ by 24,491 pixels on animation phase alone, and now
    differ by 0. Checks: turn 28/28, plus board, heat, methodb, floor, smoke, daily and palette
    all passing, audit gate PASS.
  </footer>
</div>'''

open(OUT, 'w').write(HTML)
print(OUT, str(round(len(HTML) / 1024)) + ' KB')

#!/usr/bin/env python3
"""THE BOARD, EVERYTHING THAT CHANGED. One page covering the whole 08-19 run:
the floor, the grid, the figurines, the lighting, and the clean board.

Every frame is a real headless screenshot of the real game, shot by
tools/board2-shots.mjs, which rewrites game.js in flight so the repo is never
edited. House comparison skin."""
import base64, io, os
from PIL import Image

S = 'design/shots/board2/'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/board3-compare.html'
PIECE = (950, 650, 1450, 1000)
FLOOR = (300, 700, 1500, 1010)


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


def img(name, w=None, box=None, q=87):
    im = Image.open(S + name + '.png')
    if box:
        im = im.crop(box)
    if w and im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.convert('RGB').save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


def pair(a, b, la, lb, cap, note, box=None, w=1120):
    return f'''
    <figure class="pair">
      <figcaption><b>{cap}</b><span>{note}</span></figcaption>
      <div class="ba">
        <div class="cell"><span class="chip">{la}</span><img src="{img(a, w, box)}" alt="{la}"></div>
        <div class="cell after"><span class="chip on">{lb}</span><img src="{img(b, w, box)}" alt="{lb}"></div>
      </div>
    </figure>'''


CHANGES = [
    ('The default court', 'Hardwood', 'Classic loaded no art at all, so every player who never opened the picker got the placeholder. The sourced floors had never shipped.'),
    ('The grid', 'Inlaid lines', 'A checkerboard says "this surface is made of squares" over a photograph of a floor made of planks. Lines say "this floor has a grid marked on it", which is what a real court does. Neon keeps its own grid of light.'),
    ('The numbers', 'On the chest', 'Placed by a flat formula that assumed the figurine maps linearly onto its sprite. It does not, so they landed about 9px high, across the neck. Now the chest is projected and the glyph centred on it.'),
    ('The panel behind them', 'Gone', 'Added to stop the number floating. The number was floating because it was in the wrong place; once it moved, the panel was just a dark box stuck to the piece.'),
    ('The contact shadow', 'Widened, pushed along the light', 'It was sized to the piece, so the piece sat on top of it and hid every dark pixel. Proved by drawing the shadow with the sprite hidden.'),
    ('The light', 'Turned right way up', 'y is negative upward in this projection but the light carried a positive y, so every upward-facing surface went unlit. Every figurine had been lit from below since the sprites were written.'),
    ('The silhouette', 'Splined', 'A lathe object\'s outline comes from its profile, and the profile had 15 points. Raising the segments around the figure could never have fixed it.'),
    ('The colour zones', 'Moved to the geometry', 'The base and neck boundaries sat at heights where the shape was still turning, painting a bright ring at the base and a wide disc across the shoulders.'),
    ('The head', 'Closed at the apex', 'Every profile stopped at radius .02 instead of 0, leaving a tiny uncapped tube you looked straight down into.'),
    ('Classic', 'Rebuilt as the clean board', 'A room with a light in it, one wood instead of a checkerboard, and every plank its own tone.'),
]

rows = ''.join(f'''
      <tr><td class="thing">{a}</td><td class="verdict">{b}</td><td class="why">{c}</td></tr>'''
               for a, b, c in CHANGES)

HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Board Rebuild</title>
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
  h3{{font-family:Archivo,sans-serif;font-weight:600;font-size:13.5px;letter-spacing:.05em;
    text-transform:uppercase;margin:0;color:var(--dim)}}
  p{{margin:0}}
  .lede{{max-width:66ch;color:var(--dim);font-size:17px}}
  .lede strong{{color:var(--ink)}}
  header.top{{padding:56px 0 0;display:flex;flex-direction:column;gap:16px}}
  section{{display:flex;flex-direction:column;gap:20px}}
  .pair{{margin:0;display:flex;flex-direction:column;gap:10px}}
  .pair figcaption{{display:flex;flex-direction:column;gap:3px}}
  .pair figcaption b{{font-family:Archivo,sans-serif;font-weight:600;font-size:15px;
    letter-spacing:.04em;text-transform:uppercase}}
  .pair figcaption span{{font-family:'Space Mono',monospace;font-size:13px;color:var(--dim);max-width:88ch}}
  .ba{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
  @media (max-width:820px){{.ba{{grid-template-columns:1fr}}}}
  .cell{{position:relative;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#0a0706}}
  .cell.after{{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}}
  .cell img{{display:block;width:100%;height:auto}}
  .chip{{position:absolute;top:8px;left:8px;z-index:2;font-family:'Space Mono',monospace;
    font-size:10px;letter-spacing:.16em;padding:3px 8px;border-radius:3px;
    background:rgba(0,0,0,.62);color:#cfc4ae}}
  .chip.on{{background:var(--accent);color:#1b120a;font-weight:700}}
  table{{border-collapse:collapse;width:100%;font-size:15px}}
  td,th{{text-align:left;vertical-align:top;padding:12px 14px;border-top:1px solid var(--line)}}
  th{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.12em;
    text-transform:uppercase;color:var(--dim);border-top:0}}
  td.thing{{font-family:Archivo,sans-serif;font-weight:600;width:20%}}
  td.verdict{{font-family:'Space Mono',monospace;font-size:12.5px;width:22%;color:var(--good);line-height:1.5}}
  td.why{{color:var(--dim)}}
  .call{{border-left:3px solid var(--accent);padding:2px 0 2px 18px;display:flex;flex-direction:column;gap:9px}}
  .call b{{font-family:Archivo,sans-serif;font-weight:600;letter-spacing:.04em;
    text-transform:uppercase;font-size:14px}}
  .call p{{color:var(--dim);font-size:15px;max-width:82ch}}
  .duo{{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}}
  @media (max-width:820px){{.duo{{grid-template-columns:1fr}}}}
  .duo img{{display:block;width:100%;border:1px solid var(--line);border-radius:8px}}
  .stat{{display:flex;gap:30px;flex-wrap:wrap}}
  .stat div{{display:flex;flex-direction:column}}
  .stat b{{font-family:Anton,Impact,sans-serif;font-size:34px;line-height:1;color:var(--accent)}}
  .stat span{{font-family:'Space Mono',monospace;font-size:11px;color:var(--dim);
    letter-spacing:.06em;text-transform:uppercase;margin-top:5px}}
  ul{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:9px;color:var(--dim);
    max-width:84ch;font-size:15px}}
  ul strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:18px;line-height:1.7}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · V0 rows 20 and 22 to 27 · 08-19</p>
    <h1>The board rebuild</h1>
    <p class="lede">Everything that changed on the board in one run, from making
      hardwood the default through to the last three things Aaron circled in a
      screenshot. <strong>Almost none of it was a taste call. Nine of the ten
      changes below are defects that had been shipping, and four of them he found
      by looking at a picture.</strong></p>
  </header>

  <section>
    <h2>Everything that changed</h2>
    <table>
      <tr><th>What</th><th>Now</th><th>Why it needed doing</th></tr>
      {rows}
    </table>
  </section>

  <section>
    <h2>The board</h2>
    {pair('before-desk', 'ship-desk', 'BEFORE', 'NOW',
          'The whole thing, same moment',
          'Sourced floor with an inlaid grid instead of a checkerboard over a placeholder, '
          'and ten figurines that are smooth, lit from above, and read as solid.')}
  </section>

  <section>
    <h2>One piece, close up</h2>
    {pair('before-desk', 'ship-desk', 'BEFORE', 'NOW',
          'Where all of it lands',
          'Numbers on the chest with no panel. A cast shadow that clears the base. A smooth '
          'silhouette. No dark rim, no bright ring at the base, no wide disc across the '
          'shoulders, and a closed crown.', box=PIECE, w=1000)}
    <div class="call">
      <b>The three he circled, and what each one actually was</b>
      <p><strong>The dark rim and the lines through the piece.</strong> Not one bug, three.
        First the light was upside down, so every upward-facing ring went unlit. Then a hard
        clamp meant the silhouette of a lathe object is edge-on by definition and always sat
        at the ambient floor. Then, once both were fixed and he could STILL see lines, the
        remainder turned out not to be lighting at all: two colour-zone boundaries sat at
        heights where the shape was still turning, so the base flare was painted bright team
        colour and the shoulders were painted skin brown. Moving the light barely touched
        those, which is how they were ruled out.</p>
      <p><strong>The dip in the crown.</strong> Every profile stopped at radius .02 rather
        than 0, so the head was a tiny open tube you looked straight down into. Not
        introduced by the smoothing pass, checked: it is in the source profiles and was
        always there, just easier to see once the head stopped being faceted.</p>
      <p><strong>The jaggedness.</strong> I had raised the segments AROUND the figure from 24
        to 52 and called it smoothing. That could never have worked. A lathe object's outline
        comes from its PROFILE, and the profile had 15 points, so the edge was a 14-segment
        polyline however finely it was spun. He said it still looked jagged, twice, and he
        was right both times.</p>
    </div>
  </section>

  <section>
    <h2>The clean board</h2>
    <p class="lede">Classic loads no photograph, which is the point of it. When I said the fix
      was never to hand it someone else's floor, Aaron's answer was to make it genuinely
      good instead.</p>
    {pair('classic-before-desk', 'classic-now-desk', 'BEFORE', 'NOW',
          'Classic Run',
          'A room with a light in it instead of a flat gradient, which is a void with no '
          'source and no centre. One pale maple instead of two alternating tones. Every '
          'plank its own tone, under 4%, seeded so they never crawl.')}
    <div class="call">
      <b>And the floor gate paid for itself here</b>
      <p>The first single-wood colour for Classic rendered at 162,116,76 and landed SEVEN
        away from Underwater's 159,118,74. Two of the six courts would have rendered as the
        same floor. Caught before it shipped rather than by his eye days later, which is the
        whole reason that gate exists. Classic was retoned to a paler maple, now 37 from its
        nearest neighbour, rather than the anchor being re-baselined around the clash: doing
        that would have written the bug into the baseline and the gate would then defend it.</p>
    </div>
  </section>

  <section>
    <h2>What it costs</h2>
    <div class="stat">
      <div><b>61fps</b><span>phone, in play</span></div>
      <div><b>58fps</b><span>desktop, in play</span></div>
      <div><b>149ms</b><span>startGame, phone</span></div>
      <div><b>0</b><span>page errors</span></div>
    </div>
    <p class="lede">The smoothing multiplied the geometry by about five, and it is free at
      runtime: sprites are drawn once to offscreen canvases and then blitted, so the whole
      cost lands inside startGame and nothing touches the frame loop.</p>
  </section>

  <section>
    <h2>Still open</h2>
    <ul>
      <li><strong>The board is a fifth of a phone screen</strong> (row 22). Measured 20.2% on
        a 390x844 against 66.7% on desktop. Turning the court to run up the screen is worth
        2.5x. Approved, not started, and the biggest thing left.</li>
      <li><strong>Classic's room stops at the canvas edge</strong> (row 25). The margin is the
        app's warm ground colour, so Midnight Run is a cold blue court in a warm frame. Needs
        a call on the app's theme colour before it can be fixed properly.</li>
      <li><strong>The menu header</strong> (row 17). Last of the four critiques from 08-19,
        still unbuilt.</li>
    </ul>
  </section>

  <footer>
    Frames: tools/board2-shots.mjs against :8899, real game at 1280x860 and 390x844, 2x,
    reduce-motion on so ambient drift cannot differ between columns. Variants are applied by
    rewriting game.js in flight, and a patch that fails to match is a hard error rather than
    a silent no-op. Gates after: turn, board, heat, methodb, floor, smoke, daily, palette,
    audit. Two of them were re-baselined in this run, both because the floors genuinely
    changed, both dated and reasoned in the file, neither by widening a tolerance.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
print(OUT, len(HTML) // 1024, 'KB')

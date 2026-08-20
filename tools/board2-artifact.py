#!/usr/bin/env python3
"""THE BOARD ON HARDWOOD: re-judging pass one against the real floor.

Pass one grounded the court while the default was the art-less Classic, so
four fixes were judged against a placeholder. Aaron made hardwood the default
and asked to re-judge before moving on. Every frame here is a real headless
screenshot of the real game at 1280x860 and 390x844, shot by
tools/board2-shots.mjs, which patches game.js in flight so nothing on disk is
touched. House comparison skin."""
import base64, io, os
from PIL import Image

S = 'design/shots/board2/'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/board2-compare.html'


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


def jpg(im, w=None, q=86):
    if w and im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.convert('RGB').save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


def shot(name, w=None, box=None, q=86):
    im = Image.open(S + name + '.png')
    if box:
        im = im.crop(box)
    return jpg(im, w, q)


CROP = (950, 650, 1450, 1000)      # one lone piece, desktop frame
FLOOR = (300, 700, 1500, 1010)     # an open stretch of floor


def pair(a, b, la, lb, cap, note, w=560, box=None):
    return f'''
    <figure class="pair">
      <figcaption><b>{cap}</b><span>{note}</span></figcaption>
      <div class="ba">
        <div class="cell"><span class="chip">{la}</span>
          <img src="{shot(a + '-desk', w * 2, box)}" alt="{la}"></div>
        <div class="cell after"><span class="chip on">{lb}</span>
          <img src="{shot(b + '-desk', w * 2, box)}" alt="{lb}"></div>
      </div>
    </figure>'''


VERDICTS = [
    ('Hand-drawn planks', 'RETIRED, and that was right',
     'The photograph brings its own grain and its own butt joints. Drawing ours '
     'on top was the same mistake as the apron bug: our marks over his material. '
     'Already limited to the art-less Classic court, so on the default nothing '
     'draws. No further work.', 'gone'),
    ('Contact shadows', 'BROKEN, not just unnecessary',
     'Sized to the piece, so the piece\'s own base covers it completely. What you '
     'actually see is the small occlusion dot peeking out below, which reads as a '
     'separate smudge. Proved by hiding the sprite. Fix proposed below.', 'bad'),
    ('Jersey number plates', 'KEEP, but the claim was overstated',
     'At 390px the plate is about two pixels tall and makes no difference I can '
     'see. What actually holds the numbers is the dark stroke around each glyph, '
     'which was always there. Harmless and slightly better on desktop, so it '
     'stays, but it is not what anchored anything.', 'ok'),
    ('The apron', 'KEEP, it earns its place',
     'The one pass-one fix that is straightforwardly better on the real floor. It '
     'gives the court a thick edge so it reads as a slab standing in a room '
     'instead of a rectangle floating on a photo. Most visible on the phone.',
     'good'),
]

rows = ''.join(f'''
      <tr class="v-{k}">
        <td class="thing">{a}</td>
        <td class="verdict">{b}</td>
        <td class="why">{c}</td>
      </tr>''' for a, b, c, k in VERDICTS)

CHK = [('0.16', 'shipping now', '31.2', 'Grid unmistakable. The wood is visibly '
        'tinted in alternating squares and the photograph is fighting a checkerboard.'),
       ('0.05', 'my recommendation', '9.8', 'Grid still reads tile by tile. The '
        'photograph comes back: plank joints, grain and the overhead sheen are all visible.'),
       ('0.00', 'for reference only', '0.0', 'The floor is at its best and the board '
        'is gone. Not shippable: the grid IS the game.')]

chk_cells = ''.join(f'''
      <div class="chk">
        <img src="{shot(('ship-desk' if a == '0.16' else 'checker-05-desk' if a == '0.05' else 'checker-00-desk'), 1000, FLOOR)}" alt="checker {a}">
        <div class="chk-h"><b>{a}</b><span>{lab}</span></div>
        <p class="chk-n"><em>step between neighbouring tiles: {step} of 255</em><br>{txt}</p>
      </div>''' for a, lab, step, txt in CHK)

HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Board on Hardwood</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{
    --ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;--accent:#b8560c;
    --good:#2f7d43;--bad:#a3301b;--ok:#7a6a2f;
  }}
  @media (prefers-color-scheme:dark){{
    :root:not([data-theme="light"]){{
      --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;--accent:#f5872e;
      --good:#63c47e;--bad:#f2705a;--ok:#d6bd63;
    }}
  }}
  :root[data-theme="dark"]{{
    --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;--accent:#f5872e;
    --good:#63c47e;--bad:#f2705a;--ok:#d6bd63;
  }}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ground);color:var(--ink);font-size:16.5px;line-height:1.62;
    font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1080px;margin:0 auto;padding:0 22px 96px;display:flex;flex-direction:column;gap:52px}}
  .eyebrow{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.15em;
    text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(38px,7vw,62px);line-height:.98;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:26px;margin:0}}
  h3{{font-family:Archivo,sans-serif;font-weight:600;font-size:14px;letter-spacing:.05em;
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
  .pair figcaption span{{font-family:'Space Mono',monospace;font-size:13px;color:var(--dim);max-width:84ch}}
  .ba{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
  @media (max-width:760px){{.ba{{grid-template-columns:1fr}}}}
  .cell{{position:relative;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#0a0706}}
  .cell.after{{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}}
  .cell img{{display:block;width:100%;height:auto}}
  .chip{{position:absolute;top:8px;left:8px;z-index:2;font-family:'Space Mono',monospace;
    font-size:10px;letter-spacing:.16em;padding:3px 8px;border-radius:3px;
    background:rgba(0,0,0,.62);color:#cfc4ae}}
  .chip.on{{background:var(--accent);color:#1b120a;font-weight:700}}
  table{{border-collapse:collapse;width:100%;font-size:15px}}
  td,th{{text-align:left;vertical-align:top;padding:13px 14px;border-top:1px solid var(--line)}}
  th{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.12em;
    text-transform:uppercase;color:var(--dim);border-top:0}}
  td.thing{{font-family:Archivo,sans-serif;font-weight:600;width:20%}}
  td.verdict{{font-family:'Space Mono',monospace;font-size:12.5px;width:24%;line-height:1.5}}
  td.why{{color:var(--dim)}}
  .v-good td.verdict{{color:var(--good)}} .v-bad td.verdict{{color:var(--bad)}}
  .v-ok td.verdict{{color:var(--ok)}}   .v-gone td.verdict{{color:var(--dim)}}
  .chks{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}}
  @media (max-width:860px){{.chks{{grid-template-columns:1fr}}}}
  .chk img{{display:block;width:100%;border:1px solid var(--line);border-radius:6px}}
  .chk-h{{display:flex;align-items:baseline;gap:9px;margin-top:9px}}
  .chk-h b{{font-family:Anton,Impact,sans-serif;font-size:22px;letter-spacing:.02em}}
  .chk-h span{{font-family:'Space Mono',monospace;font-size:11.5px;color:var(--accent);
    letter-spacing:.08em;text-transform:uppercase}}
  .chk-n{{font-size:13.5px;color:var(--dim);margin-top:5px;line-height:1.55}}
  .chk-n em{{color:var(--ink);font-style:normal;font-family:'Space Mono',monospace;font-size:12px}}
  .call{{border-left:3px solid var(--accent);padding:2px 0 2px 18px;display:flex;
    flex-direction:column;gap:9px}}
  .call b{{font-family:Archivo,sans-serif;font-weight:600;letter-spacing:.04em;text-transform:uppercase;font-size:14px}}
  .call p{{color:var(--dim);font-size:15px;max-width:80ch}}
  .phone{{display:grid;grid-template-columns:1fr 1fr;gap:26px;align-items:start}}
  @media (max-width:760px){{.phone{{grid-template-columns:1fr}}}}
  .phone img{{display:block;width:100%;border:1px solid var(--line);border-radius:8px}}
  .stat{{display:flex;gap:26px;flex-wrap:wrap;margin:4px 0 2px}}
  .stat div{{display:flex;flex-direction:column}}
  .stat b{{font-family:Anton,Impact,sans-serif;font-size:38px;line-height:1;color:var(--accent)}}
  .stat span{{font-family:'Space Mono',monospace;font-size:11.5px;color:var(--dim);
    letter-spacing:.06em;text-transform:uppercase;margin-top:5px}}
  ul{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:9px;color:var(--dim);max-width:82ch;font-size:15px}}
  ul strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:18px;line-height:1.7}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · V0 row 20 · re-judged 08-19</p>
    <h1>The board on hardwood</h1>
    <p class="lede">Pass one grounded the court while the default was the art-less
      Classic, so all four fixes were judged against a placeholder. Hardwood is the
      default now. <strong>Two of the four hold up, one is broken in a way the
      placeholder was hiding, and the biggest problem on the board is none of
      them.</strong></p>
  </header>

  <section>
    <h2>The four fixes, re-judged</h2>
    <table>
      <tr><th>Pass one built</th><th>Verdict now</th><th>Why</th></tr>
      {rows}
    </table>
  </section>

  <section>
    <h2>1 · The contact shadow is not there</h2>
    <p class="lede">Pass one replaced a flat grey ellipse with a height-aware
      gradient shadow. On the real floor you can see it is doing almost nothing.
      The test is simple: <strong>draw the shadow and skip the piece.</strong></p>
    {pair('ship', 'shadow-only', 'AS IT SHIPS', 'SAME FRAME, PIECE HIDDEN',
          'The shadow, alone',
          'Everything the shadow contributes is in the right frame. It is a faint '
          'smudge. Its dark core is sized to the piece, so the piece sits on top of '
          'it, and the only part that escapes is the small occlusion dot below.',
          box=CROP)}
    {pair('ship', 'proposed', 'NOW', 'PROPOSED',
          'Widened, and pushed along the light',
          'Wider than the base so it clears the piece, offset along the light the '
          'figurine is already lit by, and holding its tone out to 0.72 of the radius '
          'instead of hiding it all in an invisible core. Now the piece casts.',
          box=CROP)}
  </section>

  <section>
    <h2>2 · The checkerboard is painted over the photograph</h2>
    <p class="lede">Every tile carries a tint so the grid reads. Over a flat colour
      that was free. Over a photograph it is a checkerboard laid on a floor you
      paid for. The number under each frame is the luminance step between two
      touching tiles, computed from the blend the code actually performs against
      the measured hardwood (150 of 255).</p>
    <div class="chks">{chk_cells}</div>
    <div class="call">
      <b>My recommendation: 0.05</b>
      <p>A step of about 10 out of 255 is a visible edge between two large flat
        areas, and it is what the middle frame shows: the grid still reads tile by
        tile while the plank joints and the sheen come back. But the honest version
        of this recommendation is that <strong>the checkerboard is the wrong
        instrument</strong>. A grid wants LINES, the way a real court inlays them,
        not forty tinted squares competing with a photograph. That is a bigger job
        and I have filed it rather than smuggled it in here.</p>
    </div>
  </section>

  <section>
    <h2>3 · The thing I did not expect to find</h2>
    <p class="lede">Both of these are the same build, same moment, shot at the two
      sizes. <strong>On a phone the board is a fifth of the screen with a third of
      the screen empty underneath it.</strong></p>
    <div class="stat">
      <div><b>20.2%</b><span>of a 390x844 phone is court</span></div>
      <div><b>66.7%</b><span>of a 1280x860 desktop is court</span></div>
      <div><b>279px</b><span>of nothing between board and controls</span></div>
    </div>
    <div class="phone">
      <div><h3>Phone · 390x844</h3>
        <img src="{shot('ship-phone-full', 780)}" alt="phone"></div>
      <div><h3>Desktop · 1280x860</h3>
        <img src="{shot('ship-desk-full', 1000)}" alt="desktop">
        <p class="chk-n" style="margin-top:12px">Measured with the game's own
          projection, not off a screenshot: court 171px of 844 on the phone, 574px
          of 860 on desktop. Below the phone court sits one 33px strip at y735, and
          between them 279px of empty floor. Same on an SE (24.5%) and a Pro Max
          (20.4%), so it is not one device.</p></div>
    </div>
    <div class="call">
      <b>This is what "low budget, airy, weird" is actually made of</b>
      <p>Pass one, and this pass, are detail work inside a board that is too small
        on the device the game is played on. Shadows and grain and plates cannot fix
        a court occupying a fifth of the screen with the pieces rendered at a size
        where a jersey number is four pixels tall. <strong>I think this outranks
        everything else in this list and should be its own job before any more
        material work.</strong> It is a camera and layout question (fit the court to
        the space it has, bring the pieces up with it), not a texture question.</p>
    </div>
  </section>

  <section>
    <h2>4 · Your call: the black base</h2>
    <p class="lede">Each figurine stands on a plinth painted [58,42,28], which
      renders at luminance 15 against a floor at 148. On the placeholder it was
      invisible. On bright wood it is the darkest thing on the board.</p>
    {pair('proposed', 'proposed-warmbase', 'BASE AS BUILT', 'BASE LIFTED',
          'A weighted base, or a hole in the floor',
          'Left is the shadow fix alone. Right is the same plus the plinth lifted to '
          '[104,76,52]. I am not deciding this one by shipping it: a dark weighted '
          'base is what a real tournament figurine has, and it is also what makes '
          'the board read as a checkers set rather than an arena.',
          box=CROP)}
  </section>

  <section>
    <h2>What I deliberately left alone</h2>
    <ul>
      <li><strong>The goals.</strong> The near one ghosts to 45% so it never blocks
        the play, and that is why it reads thin, not the geometry. Changing it is a
        rule about occlusion, not a material fix.</li>
      <li><strong>The figurines themselves.</strong> Flat-shaded lathe turns.
        Making them read sculpted is its own pass and probably wants a proper
        light model rather than more tweaks.</li>
      <li><strong>The arena backdrops.</strong> They are the best thing on the
        screen and they are already yours.</li>
      <li><strong>Anything on Classic.</strong> It keeps its planks and its flat
        tiles; it is the no-art option and should look like one.</li>
    </ul>
  </section>

  <footer>
    Frames: tools/board2-shots.mjs against :8899, real game, 1280x860 and 390x844 at
    2x, reduce-motion on so the ambient drift cannot differ between columns. Variants
    are applied by rewriting game.js in flight, so the repo is never edited and a
    patch that fails to match is a hard error rather than a silent no-op. Court share
    measured through the game's own projection. Checker steps are arithmetic on the
    blend in the source against the hardwood median from tools/floor-check.mjs.
    Nothing in sections 1, 2 or 4 is committed: they are proposals awaiting your call.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
print(OUT, len(HTML) // 1024, 'KB')

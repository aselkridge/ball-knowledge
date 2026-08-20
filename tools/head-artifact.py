#!/usr/bin/env python3
"""THE HEAD: one defect, five attempts, and why four of them were the same
mistake. Aaron, 08-19: "the whole head should be a single shape, not two put
together to fix an issue, what is the problem?!"

Both frames are real headless screenshots of the real game. The BEFORE is not
a stored PNG from earlier in the day: it is reconstructed on demand by the
'head-capped' variant in tools/board2-shots.mjs, which rewrites game.js in
flight. A reconstruction can be re-run and checked; an old screenshot has to
be taken on trust.

The profile diagram is vector, drawn from the SAME numbers the renderer spins,
resampled through the SAME Catmull-Rom, so it cannot drift from what ships.
House comparison skin, copied from tools/board3-artifact.py."""
import base64, io, os, math
from PIL import Image

S = 'design/shots/board2/'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/head-compare.html'
DESK = (950, 620, 1500, 1010)
PHONE = (150, 590, 640, 815)


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


def img(name, w=None, box=None, q=88):
    im = Image.open(S + name + '.png')
    if box:
        im = im.crop(box)
    if w and im.width != w:
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


# ---------------------------------------------------------------- the geometry
# The small forward's profile, straight out of game.js. Fifteen points, spun
# around the vertical axis to make the piece.
PROF = [[0, .34], [.05, .36], [.11, .28], [.15, .175], [.20, .15], [.33, .20],
        [.51, .235], [.61, .21], [.655, .135], [.695, .07], [.73, .105],
        [.80, .135], [.875, .115], [.935, .065], [.965, .02]]


def catmull(p, mult=5):
    """The renderer's own resample, so the diagram cannot lie about the shape."""
    def at(i):
        return p[max(0, min(len(p) - 1, i))]

    def cr(a, b, c, d, t):
        t2, t3 = t * t, t * t * t
        return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2
                      + (-a + 3 * b - 3 * c + d) * t3)

    out = []
    for i in range(len(p) - 1):
        p0, p1, p2, p3 = at(i - 1), at(i), at(i + 1), at(i + 2)
        for s in range(mult):
            t = s / mult
            out.append([cr(p0[0], p1[0], p2[0], p3[0], t),
                        max(0, cr(p0[1], p1[1], p2[1], p3[1], t))])
    out.append(p[-1])
    return out


def authored():
    return list(PROF)


def capped():
    """Attempt four: drop the needle-thin rings, cap the last substantial one
    with a quarter circle whose height equals its radius."""
    ci = max(i for i, q in enumerate(PROF) if q[1] >= 0.05)
    tc, rc = PROF[ci]
    h = PROF[:ci + 1]
    for k in range(1, 7):
        a = k / 6 * math.pi / 2
        h.append([tc + rc * math.sin(a), rc * math.cos(a)])
    return h


def rebuilt():
    """Shipped: find the neck, find the head's widest ring above it, and regrow
    the top from there as a single half ellipse."""
    ni = min((i for i, q in enumerate(PROF) if 0.6 < q[0] < 0.76),
             key=lambda i: PROF[i][1])
    hi = max(range(ni + 1, len(PROF)), key=lambda i: PROF[i][1])
    tm, rm = PROF[hi]
    apex = PROF[-1][0] + PROF[-1][1] * 0.65
    h = PROF[:hi + 1]
    for k in range(1, 7):
        a = k / 6 * math.pi / 2
        h.append([tm + (apex - tm) * math.sin(a), rm * math.cos(a)])
    return h


# Diagram frame. Only the head is worth drawing, so the view starts at the neck.
DW, DH, T0, T1 = 300, 400, 0.66, 1.00
CX, RS = DW / 2, 620


def sx(r):
    return CX + r * RS


def sy(t):
    return DH - (t - T0) / (T1 - T0) * (DH - 14) - 7


def silhouette(pts, mult=5):
    q = catmull(pts, mult)
    q = [p for p in q if p[0] >= T0 - 0.02]
    right = ' '.join(f'{sx(p[1]):.1f},{sy(p[0]):.1f}' for p in q)
    left = ' '.join(f'{sx(-p[1]):.1f},{sy(p[0]):.1f}' for p in reversed(q))
    return f'{right} {left}'


def diagram(pts, label, note, tone, marks=()):
    band = (f'<rect x="{sx(-.20):.1f}" y="{sy(.845):.1f}" width="{.40 * RS:.1f}" '
            f'height="{sy(.79) - sy(.845):.1f}" fill="currentColor" opacity=".1"/>')
    dots = ''.join(
        f'<circle cx="{sx(r):.1f}" cy="{sy(t):.1f}" r="3.4" class="mk"/>'
        f'<text x="{sx(r) + 10:.1f}" y="{sy(t) + 4:.1f}" class="mkt">{lb}</text>'
        for t, r, lb in marks)
    return f'''
      <figure class="dia {tone}">
        <svg viewBox="0 0 {DW} {DH}" role="img" aria-label="{label}">
          {band}
          <line x1="{CX}" y1="6" x2="{CX}" y2="{DH - 4}" class="axis"/>
          <polygon points="{silhouette(pts)}" class="sil"/>
          {dots}
        </svg>
        <figcaption><b>{label}</b><span>{note}</span></figcaption>
      </figure>'''


NECK = min((i for i, q in enumerate(PROF) if 0.6 < q[0] < 0.76),
           key=lambda i: PROF[i][1])
WIDE = max(range(NECK + 1, len(PROF)), key=lambda i: PROF[i][1])

DIAS = (
    diagram(authored(), 'As drawn', 'Above its widest ring the head tapers with a '
            'steepening slope and stops at radius .02, so the top is a cone with a '
            'hole in the end. That hole is the whole defect.', 'plain',
            marks=[(PROF[-1][0], PROF[-1][1], 'r .02')])
    + diagram(capped(), 'Attempt four', 'A quarter circle capping the last ring wide '
              'enough to bother with. It starts at radius .065, deep in the taper, so '
              'the cap and the taper meet at an angle. That crease is the milk dud.',
              'bad', marks=[(PROF[13][0], PROF[13][1], 'join')])
    + diagram(rebuilt(), 'Shipped', 'The top is regrown from the widest ring as one '
              'half ellipse. The slope there is already zero and an ellipse is flat at '
              'its widest, so the curves meet flat and there is no join to see.',
              'good', marks=[(PROF[WIDE][0], PROF[WIDE][1], 'join')]))

ATTEMPTS = [
    ('One', 'Cone to a point', 'Closed the hole. Every head got a spike. '
     '<em>"now the heads look like they have a point at the top"</em>'),
    ('Two', 'Dome on the end', 'Rounder, still a separate piece of geometry meeting '
     'a taper at an angle, so it read as a bump.'),
    ('Three', 'Apex in the profile', 'No added geometry at all: an apex point pushed '
     'into the curve so the smoothing spline ran through it. Better, and still a small '
     'nipple, because a dome started at radius .02 has nothing to work with.'),
    ('Four', 'Quarter circle off a wider ring', 'Started lower to get some width. '
     'Bigger cap, bigger crease. <em>"like you put a milk dud on the top half above '
     'the headband"</em>'),
    ('Five', 'Rebuild from the widest ring', 'Stop capping. Throw away everything '
     'above the head\'s widest point and regrow it as one half ellipse. The only join '
     'on a rounded form that cannot be seen is the one where both slopes are already '
     'flat.'),
]

rows = ''.join(f'''
      <tr><td class="thing">{a}</td><td class="verdict">{b}</td><td class="why">{c}</td></tr>'''
               for a, b, c in ATTEMPTS)

HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Head</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{--ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;
    --accent:#b8560c;--good:#2f7d43;--bad:#b03024;}}
  @media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{
    --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
    --accent:#f5872e;--good:#63c47e;--bad:#e8705f;}}}}
  :root[data-theme="dark"]{{--ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;
    --dim:#a3937f;--accent:#f5872e;--good:#63c47e;--bad:#e8705f;}}
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
  @media (max-width:820px){{.ba{{grid-template-columns:1fr}}}}
  .cell{{position:relative;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#0a0706}}
  .cell.after{{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}}
  .cell img{{display:block;width:100%;height:auto}}
  .chip{{position:absolute;top:8px;left:8px;z-index:2;font-family:'Space Mono',monospace;
    font-size:10px;letter-spacing:.16em;padding:3px 8px;border-radius:3px;
    background:rgba(0,0,0,.62);color:#cfc4ae}}
  .chip.on{{background:var(--accent);color:#1b120a;font-weight:700}}
  .dias{{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}}
  @media (max-width:820px){{.dias{{grid-template-columns:1fr}}}}
  .dia{{margin:0;display:flex;flex-direction:column;gap:10px;background:var(--raised);
    border:1px solid var(--line);border-radius:8px;padding:14px}}
  .dia svg{{display:block;width:100%;height:auto;color:var(--ink)}}
  .dia .axis{{stroke:var(--line);stroke-width:1;stroke-dasharray:3 5}}
  .dia .sil{{fill:var(--dim);opacity:.30;stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}}
  .dia.bad .sil{{fill:var(--bad);opacity:.34;stroke:var(--bad);stroke-width:1.8}}
  .dia.good .sil{{fill:var(--good);opacity:.34;stroke:var(--good);stroke-width:1.8}}
  .dia .mk{{fill:var(--accent)}}
  .dia .mkt{{fill:var(--accent);font-family:'Space Mono',monospace;font-size:11px}}
  .dia figcaption{{display:flex;flex-direction:column;gap:5px}}
  .dia figcaption b{{font-family:Archivo,sans-serif;font-weight:600;font-size:13px;
    letter-spacing:.06em;text-transform:uppercase}}
  .dia figcaption span{{color:var(--dim);font-size:13.5px;line-height:1.55}}
  table{{border-collapse:collapse;width:100%;font-size:15px}}
  td,th{{text-align:left;vertical-align:top;padding:12px 14px;border-top:1px solid var(--line)}}
  th{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.12em;
    text-transform:uppercase;color:var(--dim);border-top:0}}
  td.thing{{font-family:Anton,Impact,sans-serif;font-size:22px;width:9%;color:var(--dim)}}
  td.verdict{{font-family:'Space Mono',monospace;font-size:12.5px;width:26%;line-height:1.5}}
  td.why{{color:var(--dim)}}
  tr:last-child td.verdict{{color:var(--good)}}
  .call{{border-left:3px solid var(--accent);padding:2px 0 2px 18px;display:flex;flex-direction:column;gap:9px}}
  .call b{{font-family:Archivo,sans-serif;font-weight:600;letter-spacing:.04em;
    text-transform:uppercase;font-size:14px}}
  .call p{{color:var(--dim);font-size:15px;max-width:82ch}}
  ul{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:9px;color:var(--dim);
    max-width:84ch;font-size:15px}}
  ul strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:18px;line-height:1.7}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · V0 row 30 · 08-19</p>
    <h1>The head</h1>
    <blockquote>"now the head looks VERY WEIRD!!! Like you put a milk dud on the top
      half above the headband, Please pelase the whole head should be a single shape,
      not two put together to fix an issue, what is the problem?!"</blockquote>
    <p class="lede">The problem, and you had it in the sentence. There was <strong>one</strong>
      defect and it was one number: the curve that gets spun into each figurine stops at
      radius .02 instead of 0, so the top of the head was an open pinhole. I answered that
      four times by <strong>gluing a second shape onto the end</strong>. Every one of them
      started part way down a taper, where the existing curve is already heading somewhere
      at a definite angle, and two curves that meet at different angles read as two
      objects. The fifth attempt does not add anything: it rebuilds the top of the head as
      one curve.</p>
  </header>

  <section>
    <h2>On the board</h2>
    {pair('head-capped-desk', 'ship-desk', 'ATTEMPT FOUR', 'SHIPPED',
          'Desktop, 1280 wide',
          'Same seed, same court, same camera. Only the head profile differs.',
          box=DESK, w=1100)}
    {pair('head-capped-phone', 'ship-phone', 'ATTEMPT FOUR', 'SHIPPED',
          'Phone, 390 wide',
          'The nub survives being three millimetres tall, which is the real test.',
          box=PHONE, w=980)}
  </section>

  <section>
    <h2>What the curve is doing</h2>
    <p class="lede">Each figurine is a lathe: one profile curve, spun around the vertical
      axis. So the outline you see IS this curve. These are drawn from the same numbers
      the game spins, through the same smoothing, showing the head only. The shaded band
      is the headband.</p>
    <div class="dias">{DIAS}</div>
  </section>

  <section>
    <h2>Five goes at one pinhole</h2>
    <table>
      <tr><th>Go</th><th>What I did</th><th>What happened</th></tr>{rows}
    </table>
    <div class="call">
      <b>Why four attempts failed the same way</b>
      <p>A cap is a <em>local</em> fix. It does not disturb anything already working, so it
        feels safe, and that safety is exactly what let me try it four times without
        noticing the pattern. The artifact never changed category: the bump moved, the bump
        got smaller, the bump stayed a bump. When the same class of defect survives several
        increasingly careful attempts, the attempts are the wrong kind, and it is cheaper to
        believe that at attempt two than at attempt four.</p>
      <p>The rule I have written down from it: <strong>a new curve can join an existing one
        invisibly at exactly one kind of place, where both slopes are the same.</strong> At
        the widest point of a rounded form the slope is zero, and an ellipse is also flat at
        its widest. That point is the only seamless join available on a head, and it sits
        well below the pinhole I was trying to close, which is why every fix aimed at the
        hole itself was doomed.</p>
    </div>
    <div class="call">
      <b>One wrong turn on the way, caught by looking</b>
      <p>My first stab at "find the widest ring of the head" searched above 60% of the
        height. The shoulders are above 60% of the height. It found them, threw the head
        away, and regrew the top of the figurine as one enormous dome starting at the
        shoulders: every player a bullet. The search returned a plausible number and no
        error at all. Anchoring on the <strong>neck</strong> first, then the widest ring
        above that, is stable across all five body types. Caught in the render, not by
        reasoning.</p>
    </div>
  </section>

  <section>
    <h2>Left alone on purpose</h2>
    <ul>
      <li><strong>The head's width, and near enough its height.</strong> The widest ring is
        untouched, so the head is exactly as broad as it was drawn. The apex lands 1.3% of
        body height above the old top point, which is what closing a hole with a real curve
        costs: measured, not eyeballed. This is not a resculpt, it is the same head finished
        properly.</li>
      <li><strong>The headband, the shoulders, the base.</strong> Untouched. The rebuild
        only replaces the profile above the head's widest ring, which sits inside the
        headband, so nothing below it moves by a pixel.</li>
      <li><strong>The other four body types.</strong> Same code path, no per-position
        tuning: the neck and the widest ring are found on each profile rather than
        hardcoded, and they land at the same two indices on all five.</li>
      <li><strong>Everything else from the board run.</strong> The floor, the inlaid grid,
        the numbers, the lighting and the depth sort are as they were, and the board page
        covers those.</li>
    </ul>
  </section>

  <footer>
    Frames: real headless screenshots at 1280x860 and 390x844, DPR 2, reduce-motion on.
    The before is reconstructed live by the head-capped variant in tools/board2-shots.mjs,
    which rewrites game.js in flight, so nothing on disk is edited to produce it.
    Diagrams drawn from the shipped profile numbers through the shipped resample.
    Checks after the fix: turn, board, heat, methodb, floor, smoke, daily, palette all
    zero fails, audit gate PASS.
  </footer>
</div>'''

open(OUT, 'w').write(HTML)
print(OUT, str(round(len(HTML) / 1024)) + ' KB')

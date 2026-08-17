#!/usr/bin/env python3
"""Builds the grad-cap comparison board from the real screenshots.

Every image on the page comes out of design/shots/cap/, which cap-shots.mjs
produced by playing ten real questions per cell. Nothing here is drawn or
posed: this script crops, scales and inlines, and that is all it does.

The desktop frames get CROPPED to the panel column. Shown whole at three
across they render the cap about 15px wide, which is smaller than the thing
being judged and would make the board a picture of a decision rather than
the decision. The phone frames are shown entire because on a phone the panel
IS most of the screen.

Fonts and images are inlined as data URIs: the artifact CSP blocks every
external host, and the repo's no-CDN rule points at the same files anyway.
"""
import base64, io, os, sys
from PIL import Image

SHOTS = 'design/shots/cap'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/cap-board.html'
DESK_CROP = (380, 175, 900, 860)     # the panel column, measured off the frame


def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode()


def shot(name, crop=None, scale=1.0, quality=82):
    im = Image.open(os.path.join(SHOTS, name + '.png')).convert('RGB')
    if crop:
        im = im.crop(crop)
    if scale != 1.0:
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=quality, method=5)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def font(name):
    return 'data:font/woff2;base64,' + b64(os.path.join(FONTS, name))


CAP = 'data:image/png;base64,' + b64('docs/play/assets/brand/gradcap.png')

OPTS = [
    ('none',  'As it ships today',
     'The sweep already has the horn, the roar, two waves of confetti, the gold PERFECT '
     'and the panel flare. This is the control: whatever the cap adds, it adds on top of this.'),
    ('crown', 'A · The crown',
     'The cap drops onto the PERFECT slam, which is the exact gesture game.js already makes '
     'when somebody wins a full game. It leaves with the word, about 1.6 seconds all in.'),
    ('stamp', 'B · The stamp',
     'The cap thumps onto the receipt once the score has counted up and the marks have '
     'stamped in, and it stays there. It is in the shot when you screenshot your day.'),
]

cells = []
for view, crop, scale in (('phone', None, 0.78), ('desk', DESK_CROP, 0.86)):
    for key, _, _ in OPTS:
        cells.append((view + '-' + key + '-beat', shot(view + '-' + key + '-beat', crop, scale)))
        cells.append((view + '-' + key + '-rest', shot(view + '-' + key + '-rest', crop, scale)))
IMG = dict(cells)


def col(view, key, title, blurb):
    return f'''
      <article class="opt" data-opt="{key}">
        <header>
          <h3>{title}</h3>
          <p>{blurb}</p>
        </header>
        <figure>
          <img src="{IMG[view + '-' + key + '-beat']}" alt="{title}, the moment the run ends" loading="lazy">
          <figcaption><span class="tick">1</span> the moment it lands</figcaption>
        </figure>
        <figure>
          <img src="{IMG[view + '-' + key + '-rest']}" alt="{title}, seven seconds later" loading="lazy">
          <figcaption><span class="tick">2</span> what you are left looking at</figcaption>
        </figure>
      </article>'''


def board(view, label, sub):
    return f'''
    <section class="board">
      <div class="boardhead">
        <h2>{label}</h2><p>{sub}</p>
      </div>
      <div class="grid">{''.join(col(view, k, t, b) for k, t, b in OPTS)}</div>
    </section>'''


# charset and viewport are declared even though the artifact wrapper supplies
# its own: this file is also opened straight off disk to verify it, every other
# design/*.html carries them, and audit.py counts a page that lacks them.
HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Cap on a Sweep</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');
    font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');
    font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');
    font-weight:400;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-700.woff2')}) format('woff2');
    font-weight:700;font-display:swap}}

  /* the game's own night-court tokens, so this board looks like it came out
     of the same building as the thing it is judging */
  :root{{
    --ground:#f4efe6; --raised:#fffaf3; --sunk:#ece4d7;
    --line:#d9cbb6; --line-soft:#e7ddcd;
    --ink:#241b14; --dim:#6f6154;
    --accent:#b8560c; --gold:#8a6410; --good:#2f6d4f;
    --shadow:0 1px 2px rgba(60,40,20,.07),0 8px 24px rgba(60,40,20,.07);
  }}
  :root:not([data-theme="light"]){{ }}
  @media (prefers-color-scheme:dark){{
    :root:not([data-theme="light"]){{
      --ground:#0f0b09; --raised:#181310; --sunk:#0a0706;
      --line:#4a3f31; --line-soft:#2e2620;
      --ink:#fff5e2; --dim:#a3937f;
      --accent:#f5872e; --gold:#ffcf6a; --good:#6fd0c3;
      --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
    }}
  }}
  :root[data-theme="dark"]{{
    --ground:#0f0b09; --raised:#181310; --sunk:#0a0706;
    --line:#4a3f31; --line-soft:#2e2620;
    --ink:#fff5e2; --dim:#a3937f;
    --accent:#f5872e; --gold:#ffcf6a; --good:#6fd0c3;
    --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
  }}

  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ground);color:var(--ink);
    font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    font-size:16.5px;line-height:1.62;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1180px;margin:0 auto;padding:0 22px 96px;
    display:flex;flex-direction:column;gap:56px}}

  .eyebrow{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;
    letter-spacing:.15em;text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    letter-spacing:.005em;font-size:clamp(38px,7vw,68px);line-height:.98;margin:0;
    text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(21px,3vw,27px);line-height:1.08;margin:0;letter-spacing:.01em}}
  h3{{font-family:Archivo,sans-serif;font-weight:600;font-size:15px;margin:0;
    letter-spacing:.02em}}
  p{{margin:0}}
  .lede{{max-width:62ch;color:var(--dim);font-size:17.5px}}
  .lede strong{{color:var(--ink);font-weight:600}}

  /* ---- masthead ---- */
  header.top{{padding:64px 0 0;display:flex;flex-direction:column;gap:18px}}
  .capline{{display:flex;align-items:center;gap:20px;flex-wrap:wrap}}
  .capline img{{width:74px;height:74px;filter:drop-shadow(0 6px 16px rgba(0,0,0,.4))}}
  blockquote{{margin:0;padding:14px 0 14px 20px;border-left:3px solid var(--accent);
    font-size:19px;line-height:1.5;max-width:56ch}}
  blockquote cite{{display:block;margin-top:8px;font-style:normal;font-size:13px;
    color:var(--dim);font-family:'Space Mono',monospace}}

  /* ---- the rule box ---- */
  .rule{{background:var(--raised);border:1px solid var(--line);border-radius:4px;
    padding:22px 24px;display:flex;flex-direction:column;gap:10px;box-shadow:var(--shadow)}}
  .rule p{{max-width:70ch;color:var(--dim)}}
  .rule p strong{{color:var(--ink);font-weight:600}}

  /* ---- the boards ---- */
  .board{{display:flex;flex-direction:column;gap:22px}}
  .boardhead{{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;
    padding-bottom:12px;border-bottom:1px solid var(--line)}}
  .boardhead p{{color:var(--dim);font-size:14px;font-family:'Space Mono',monospace}}
  .grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}}
  @media (max-width:900px){{.grid{{grid-template-columns:1fr;gap:34px}}}}
  .opt{{display:flex;flex-direction:column;gap:12px;min-width:0}}
  .opt header{{display:flex;flex-direction:column;gap:6px;min-height:96px}}
  .opt header p{{color:var(--dim);font-size:13.5px;line-height:1.5}}
  .opt[data-opt="none"] h3{{color:var(--dim)}}
  .opt[data-opt="crown"] h3,.opt[data-opt="stamp"] h3{{color:var(--accent)}}
  figure{{margin:0;display:flex;flex-direction:column;gap:7px}}
  figure img{{width:100%;height:auto;display:block;border:1px solid var(--line);
    border-radius:4px;background:var(--sunk)}}
  figcaption{{font-family:'Space Mono',monospace;font-size:11.5px;color:var(--dim);
    display:flex;align-items:center;gap:8px}}
  .tick{{display:inline-grid;place-items:center;width:17px;height:17px;flex:none;
    border:1px solid var(--line);border-radius:50%;font-size:10px;color:var(--ink)}}

  /* ---- verdict ---- */
  .verdict{{display:grid;grid-template-columns:1.15fr 1fr;gap:28px;align-items:start}}
  @media (max-width:820px){{.verdict{{grid-template-columns:1fr}}}}
  .pick{{background:var(--raised);border:1px solid var(--accent);border-radius:4px;
    padding:24px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow)}}
  .pick .eyebrow{{color:var(--accent)}}
  .pick p{{color:var(--dim);max-width:52ch}}
  .pick p strong{{color:var(--ink);font-weight:600}}
  .against{{display:flex;flex-direction:column;gap:16px}}
  .against h3{{color:var(--dim)}}
  .against p{{color:var(--dim);font-size:14.5px;max-width:52ch}}

  /* ---- the size question ---- */
  .sizes{{display:flex;gap:34px;flex-wrap:wrap;align-items:flex-end;
    background:var(--raised);border:1px solid var(--line);border-radius:4px;padding:26px 24px}}
  .size{{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}}
  .size img{{display:block;image-rendering:auto}}
  .size span{{font-family:'Space Mono',monospace;font-size:11px;color:var(--dim);
    max-width:15ch;line-height:1.45}}
  .size b{{color:var(--ink);font-weight:700;display:block}}
  svg.mk{{display:block;color:var(--gold)}}

  /* ---- receipts ---- */
  table{{border-collapse:collapse;width:100%;font-size:14px}}
  .scroll{{overflow-x:auto;border:1px solid var(--line);border-radius:4px;
    background:var(--raised)}}
  th,td{{text-align:left;padding:11px 16px;border-bottom:1px solid var(--line-soft);
    vertical-align:top}}
  th{{font-family:Archivo,sans-serif;font-weight:600;font-size:11px;letter-spacing:.12em;
    text-transform:uppercase;color:var(--dim);white-space:nowrap}}
  tr:last-child td{{border-bottom:0}}
  td.m{{font-family:'Space Mono',monospace;font-size:12.5px;white-space:nowrap;
    font-variant-numeric:tabular-nums}}
  .ok{{color:var(--good);font-weight:700}}

  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:20px;line-height:1.7}}
  @media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
</style>

<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · Daily Five · 17 August</p>
    <div class="capline">
      <img src="{CAP}" alt="The grad cap mark, logo finalist 64">
      <h1>The cap on<br>a sweep</h1>
    </div>
    <blockquote>Maybe we stamp my chosen grad cap logo?
      <cite>Aaron, today</cite></blockquote>
    <p class="lede">Two places it can land, both built and both played through for real.
      Every frame below came out of a run where the harness answered ten questions and
      photographed whatever the game did. <strong>Pick A or B and the other one gets
      deleted.</strong></p>
  </header>

  <section class="rule">
    <p class="eyebrow">The rule it inherits</p>
    <p>The cap is not a new mark and it does not need a new meaning. <strong>game.js
      already drops it on the winner's slam at the end of a full game, and pointedly
      never on the machine's.</strong> So the Daily Five borrows the rule with the
      artwork: a perfect ten carries the cap, and no other score ever does. A mark that
      shows up on an ordinary day means nothing the next time it appears.</p>
    <p>That rule is now gated, and gated separately from the placement, so it survives
      whichever of these two you pick.</p>
  </section>

  {board('phone', 'On the phone', '390 x 844 · where this game is actually played')}
  {board('desk', 'On desktop', '1280 x 860 · cropped to the panel so the cap is judged at size')}

  <section class="verdict">
    <div class="pick">
      <p class="eyebrow">If you want my pick · B, the stamp</p>
      <p>The crown is the more faithful reuse and it looks great in frame 1. The problem
        is frame 2: <strong>it is gone.</strong> It lives 1.65 seconds, in the same second
        as a horn, a roar, a quake, a flare and 116 pieces of confetti, on a phone, and
        then the screen it leaves behind has no cap on it at all.</p>
      <p>The stamp lands after the noise, on the one thing a player actually stops and
        reads, and it is still there when they screenshot it to send to somebody.
        <strong>You said stamp, and a stamp is a thing that stays.</strong></p>
      <p>If you want both, say so: they compose, and the code already supports it. I would
        not, though. Two caps in two seconds spends the mark twice.</p>
    </div>
    <div class="against">
      <h3>What I deliberately left alone</h3>
      <p><strong>The ordinary ending has no cap and should not get one.</strong> It got its
        own beat yesterday, the count-up and the day word, and that is the right size for
        it. The cap has to stay expensive.</p>
      <p><strong>The bonus round's ending is untouched.</strong> Past the sweep there is a
        third tier already, the roof-off, and I did not want to stack a fourth mark on it
        before you have seen the third.</p>
      <p><strong>The calendar and the menu stamp keep their crown.</strong> Reasoning below,
        with the sizes rendered honestly.</p>
    </div>
  </section>

  <section class="board">
    <div class="boardhead">
      <h2>Why the calendar keeps its crown</h2>
      <p>the obvious next question, answered at true size</p>
    </div>
    <p class="lede">The natural follow-up is to swap the calendar's gold crown for the cap
      too, so the whole game speaks one mark. I would not, and the reason is size, not
      taste. These are rendered at the exact pixel sizes each surface uses:</p>
    <div class="sizes">
      <div class="size">
        <img src="{CAP}" width="74" height="74" alt="the cap at 74 pixels">
        <span><b>74px</b>the stamp on the receipt</span>
      </div>
      <div class="size">
        <img src="{CAP}" width="46" height="46" alt="the cap at 46 pixels">
        <span><b>46px</b>the crown on the phone slam</span>
      </div>
      <div class="size">
        <img src="{CAP}" width="15" height="15" alt="the cap at 15 pixels">
        <span><b>15px</b>if it replaced the calendar mark</span>
      </div>
      <div class="size">
        <svg class="mk" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path d="M2.6 7.2l3.9 3.3L12 3.4l5.5 7.1 3.9-3.3-1.5 10.4H4.1z" fill="currentColor"/>
          <rect x="4.1" y="18.6" width="15.8" height="2.6" rx="1.1" fill="currentColor"/>
        </svg>
        <span><b>15px</b>the crown that is there now</span>
      </div>
    </div>
    <p class="lede">At 15px the tassel and the little ball turn to mush and the silhouette
      stops being readable, which is the whole job of a mark in a calendar cell. The
      calendar also carries a second meaning the cap cannot: <strong>filled means you were
      there on the day, hollow means you caught it up late.</strong> A photograph of a hat
      has no hollow version. The crown, the star and the tick are a deliberate ladder of
      flat shapes for exactly that reason.</p>
  </section>

  <section class="board">
    <div class="boardhead">
      <h2>What was checked</h2>
      <p>tools/cap-check.mjs · six checks, sabotage-proved</p>
    </div>
    <div class="scroll">
      <table>
        <thead><tr><th>Check</th><th>Result</th><th>Why it exists</th></tr></thead>
        <tbody>
          <tr><td>Both runs reached an ending at all</td>
              <td class="m ok">sweep=true ordinary=true</td>
              <td>The first version of the negative check passed against a run that never
                  finished. This one makes a vacuous pass announce itself.</td></tr>
          <tr><td>A 10/10 sweep carries the cap</td><td class="m ok">dv-stamp · 24 pts</td>
              <td>Recorded through a MutationObserver, because the crown is transient and a
                  screenshot at a fixed delay misses it.</td></tr>
          <tr><td>An ordinary day does not</td><td class="m ok">12 pts, cap=false</td>
              <td>The inherited rule. Dropping the guard in the code turns this red.</td></tr>
          <tr><td>The cap sits clear of the panel type</td><td class="m ok">clear</td>
              <td>Measured against the score, the label, the receipt and every button.</td></tr>
          <tr><td>Fully inside the phone viewport</td><td class="m ok">inside</td>
              <td>The desktop inset put it against the glass at 390. Now 18px.</td></tr>
          <tr><td>Zero page errors</td><td class="m ok">clean</td><td>Both runs.</td></tr>
        </tbody>
      </table>
    </div>
    <p class="lede">The existing thirty-one Daily Five checks, the coach suite, the audio
      suite and the audit gate all still pass. Nothing here is live yet: it is on the
      branch, waiting on which one you want.</p>
  </section>

  <footer>
    Frames: 12 real runs, 2 viewports x 3 options x 2 moments. Shot by tools/cap-shots.mjs,
    assembled by tools/cap-artifact.py.<br>
    Cap artwork: logo finalist #64, docs/play/assets/brand/gradcap.png, already shipping as
    the victory crown.<br>
    Type and colour taken from the game's own tokens: Anton, Archivo, Space Mono, and the
    night-court palette.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
kb = os.path.getsize(OUT) / 1024
print(f'wrote {OUT}  {kb:.0f} KB  ({len(IMG)} frames inlined)')
if kb > 15000:
    sys.exit('over the artifact size ceiling')

#!/usr/bin/env python3
"""The Heat Check endings board: named it, and iced it, side by side.

Same rules as cap-artifact.py. Every frame comes out of design/shots/bonus/,
which bonus-shots.mjs produced by sweeping a real ten, unlocking the bonus and
typing into the real input. This script crops, scales and inlines.

Desktop frames are cropped to the panel column for the same reason as the cap
board: shown whole at two across, the thing being judged is 15px tall.
"""
import base64, io, os, sys
from PIL import Image

SHOTS = 'design/shots/bonus'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/bonus-board.html'
DESK_CROP = (380, 120, 900, 860)


def b64(p):
    return base64.b64encode(open(p, 'rb').read()).decode()


def shot(name, crop=None, scale=1.0):
    im = Image.open(os.path.join(SHOTS, name + '.png')).convert('RGB')
    if crop:
        im = im.crop(crop)
    if scale != 1.0:
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=82, method=5)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def font(n):
    return 'data:font/woff2;base64,' + b64(os.path.join(FONTS, n))


CAP = 'data:image/png;base64,' + b64('docs/play/assets/brand/gradcap.png')

BEATS = [
    ('1-clue',    'The clue is up',
     'One clock for the round, not one per clue, and the whole ladder is on screen: '
     'six on clue one, then four, three, two. Asking for another clue costs points AND time.'),
    ('2-verdict', 'The buzz'),
    ('3-panel',   'It hands over to the receipt'),
    ('4-rest',    'And settles'),
]
OUTCOMES = [
    ('hit',  'Named it', 'good',
     'Answered on clue one, so the full 6. The roof-off is the third ending tier and it '
     'only exists past a sweep: the game\'s own ON FIRE stamp under the words THE ROOF IS '
     'OFF, the roar layered with the announcer, and 72 more pieces of confetti.'),
    ('iced', 'Iced it', 'bad',
     'Wrong name, or the clock runs out, and both reach the same end through the same code '
     'so the receipt and the saved history cannot disagree. No points, and the reveal comes '
     'anyway: naming them is the payoff of the round whether you got there or not.'),
]

IMG = {}
for v, crop, sc in (('phone', None, 0.74), ('desk', DESK_CROP, 0.80)):
    for key, *_ in OUTCOMES:
        for b, *_ in BEATS:
            n = f'{v}-{key}-{b}'
            IMG[n] = shot(n, crop, sc)


def strip(view, key):
    out = []
    for i, beat in enumerate(BEATS):
        b, label = beat[0], beat[1]
        out.append(f'''
        <figure>
          <img src="{IMG[f'{view}-{key}-{b}']}" alt="{label}" loading="lazy">
          <figcaption><span class="tick">{i + 1}</span>{label}</figcaption>
        </figure>''')
    return ''.join(out)


def outcome(view, key, title, tone, blurb):
    return f'''
      <article class="out" data-tone="{tone}">
        <header><h3>{title}</h3><p>{blurb}</p></header>
        <div class="strip">{strip(view, key)}</div>
      </article>'''


def board(view, label, sub):
    return f'''
    <section class="board">
      <div class="boardhead"><h2>{label}</h2><p>{sub}</p></div>
      {''.join(outcome(view, k, t, tone, b) for k, t, tone, b in OUTCOMES)}
    </section>'''


# charset and viewport declared for the same reason as the cap board: this file
# is opened straight off disk to verify it, and audit.py counts a page without them.
HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Named It or Iced It</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');
    font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');
    font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');
    font-weight:400;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-700.woff2')}) format('woff2');
    font-weight:700;font-display:swap}}

  :root{{
    --ground:#f4efe6; --raised:#fffaf3; --sunk:#ece4d7;
    --line:#d9cbb6; --line-soft:#e7ddcd;
    --ink:#241b14; --dim:#6f6154;
    --accent:#b8560c; --gold:#8a6410; --good:#2f6d4f; --bad:#a83a30;
    --shadow:0 1px 2px rgba(60,40,20,.07),0 8px 24px rgba(60,40,20,.07);
  }}
  @media (prefers-color-scheme:dark){{
    :root:not([data-theme="light"]){{
      --ground:#0f0b09; --raised:#181310; --sunk:#0a0706;
      --line:#4a3f31; --line-soft:#2e2620;
      --ink:#fff5e2; --dim:#a3937f;
      --accent:#f5872e; --gold:#ffcf6a; --good:#6fd0c3; --bad:#d5524b;
      --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
    }}
  }}
  :root[data-theme="dark"]{{
    --ground:#0f0b09; --raised:#181310; --sunk:#0a0706;
    --line:#4a3f31; --line-soft:#2e2620;
    --ink:#fff5e2; --dim:#a3937f;
    --accent:#f5872e; --gold:#ffcf6a; --good:#6fd0c3; --bad:#d5524b;
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
    font-size:clamp(38px,7vw,68px);line-height:.98;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(21px,3vw,27px);line-height:1.08;margin:0}}
  h3{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:20px;margin:0;letter-spacing:.02em}}
  p{{margin:0}}
  .lede{{max-width:64ch;color:var(--dim);font-size:17.5px}}
  .lede strong{{color:var(--ink);font-weight:600}}

  header.top{{padding:64px 0 0;display:flex;flex-direction:column;gap:18px}}
  blockquote{{margin:0;padding:14px 0 14px 20px;border-left:3px solid var(--accent);
    font-size:19px;line-height:1.5;max-width:56ch}}
  blockquote cite{{display:block;margin-top:8px;font-style:normal;font-size:13px;
    color:var(--dim);font-family:'Space Mono',monospace}}

  .board{{display:flex;flex-direction:column;gap:30px}}
  .boardhead{{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;
    padding-bottom:12px;border-bottom:1px solid var(--line)}}
  .boardhead p{{color:var(--dim);font-size:14px;font-family:'Space Mono',monospace}}
  .out{{display:flex;flex-direction:column;gap:14px}}
  .out header{{display:flex;flex-direction:column;gap:6px}}
  .out header p{{color:var(--dim);font-size:14.5px;max-width:74ch}}
  .out[data-tone="good"] h3{{color:var(--good)}}
  .out[data-tone="bad"] h3{{color:var(--bad)}}
  .strip{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}}
  @media (max-width:860px){{.strip{{grid-template-columns:repeat(2,1fr)}}}}
  @media (max-width:520px){{.strip{{grid-template-columns:1fr;gap:26px}}}}
  figure{{margin:0;display:flex;flex-direction:column;gap:7px;min-width:0}}
  figure img{{width:100%;height:auto;display:block;border:1px solid var(--line);
    border-radius:4px;background:var(--sunk)}}
  figcaption{{font-family:'Space Mono',monospace;font-size:11.5px;color:var(--dim);
    display:flex;align-items:center;gap:8px;line-height:1.35}}
  .tick{{display:inline-grid;place-items:center;width:17px;height:17px;flex:none;
    border:1px solid var(--line);border-radius:50%;font-size:10px;color:var(--ink)}}

  .fixes{{display:flex;flex-direction:column;gap:18px}}
  .fix{{background:var(--raised);border:1px solid var(--line);border-radius:4px;
    padding:20px 22px;display:flex;flex-direction:column;gap:9px;box-shadow:var(--shadow)}}
  .fix.ask{{border-color:var(--accent)}}
  .fix h3{{font-family:Archivo,sans-serif;font-weight:600;font-size:15px;
    text-transform:none;letter-spacing:.01em;display:flex;align-items:center;gap:10px}}
  .fix p{{color:var(--dim);max-width:76ch;font-size:15px}}
  .fix p strong{{color:var(--ink);font-weight:600}}
  .verdict{{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;
    padding:3px 8px;border-radius:3px;flex:none}}
  .verdict.fixed{{background:color-mix(in srgb,var(--good) 22%,transparent);color:var(--good)}}
  .verdict.open{{background:color-mix(in srgb,var(--accent) 22%,transparent);color:var(--accent)}}

  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:20px;line-height:1.7}}
  @media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
</style>

<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · The Heat Check · 17 August</p>
    <h1>Named it<br>or iced it</h1>
    <blockquote>Can you show me the bonus round ending, right and wrong answer?
      <cite>Aaron, today</cite></blockquote>
    <p class="lede">Both, four beats each, on the phone and on desktop. Real runs:
      the harness swept a ten, unlocked the bonus and typed into the real box.
      <strong>Two defects turned up while shooting it and both are fixed below.</strong></p>
  </header>

  {board('phone', 'On the phone', '390 x 844')}
  {board('desk', 'On desktop', '1280 x 860 · cropped to the panel column')}

  <section class="board">
    <div class="boardhead"><h2>What the shoot turned up</h2>
      <p>two fixed, one for you to rule on</p></div>
    <div class="fixes">
      <div class="fix">
        <h3><span class="verdict fixed">FIXED</span> Every clue price was piled in the
          top-left corner of the screen</h3>
        <p>The clue label was called <code>.dvcn</code>. So is the CALENDAR's day number,
          170 lines up the stylesheet, and that rule sets <code>position:absolute</code>
          for a cell that is <code>position:relative</code>. The clue rows are not, so all
          four labels anchored to the viewport instead and stacked on top of each other at
          (5, 3). <strong>Every locked clue rendered as a blank bar.</strong> A player could
          not see that clue two costs them two points, which is the only decision the round
          has, and the button offering it just said "worth less".</p>
        <p>Renamed to <code>.dvcln</code> rather than patched: two unrelated things sharing
          a class name is the bug, and patching the symptom leaves the trap set.</p>
      </div>
      <div class="fix">
        <h3><span class="verdict fixed">FIXED</span> A perfect run read "30 PTS, out of 24"</h3>
        <p>The subtitle always printed the ten cards' ceiling. A heat check on clue one is
          six more, so the best possible day sat under a line saying it had exceeded the
          maximum. <strong>The ceiling now moves when the bonus is played</strong>, and only
          then: before you take it, 24 is still the honest number, because the bonus is an
          offer rather than a shortfall.</p>
      </div>
      <div class="fix ask">
        <h3><span class="verdict open">YOUR CALL</span> The six points arrive silently</h3>
        <p>On a hit you see 24 on the panel, play the bonus, and come back to a panel
          reading 30. The number simply changes. Everywhere else in this mode a score that
          moves gets counted up, and <strong>the bonus payoff is the one place it does
          not.</strong> Counting 24 to 30 on the way back would take about ten minutes.</p>
        <p>I did not just build it, because you asked to SEE the endings, not to change
          them, and last time I improved something adjacent to what you asked for you sent
          it back. Say the word.</p>
      </div>
    </div>
  </section>

  <section class="board">
    <div class="boardhead"><h2>And the cap, as you ruled it</h2>
      <p>crown then corner, one at a time</p></div>
    <p class="lede">Your ruling is in: the cap crowns the PERFECT slam, and when that word
      goes it turns up in the panel corner and stays for the screenshot. It is visible in
      frames 3 and 4 of both outcomes above, <strong>including the iced one</strong>, which
      is deliberate: the cap marks the perfect ten, and the heat check is a separate
      ceiling you can miss without losing the sweep. The comparison switch is deleted, and
      the handoff is now gated at eight checks, including one that fails if the two ever
      appear in the same frame.</p>
  </section>

  <footer>
    Frames: 16, from 4 real runs. Shot by tools/bonus-shots.mjs, assembled by
    tools/bonus-artifact.py.<br>
    Answer typed by the harness came from the game's own hcPlayer() for the day, so the
    shoot cannot drift from the answer the mode expects.<br>
    Suites green at time of writing: cap 8, theatre 31, daily-sfx 19, coach 22, daily,
    smoke, audit gate, em dash sweep.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
kb = os.path.getsize(OUT) / 1024
print(f'wrote {OUT}  {kb:.0f} KB  ({len(IMG)} frames inlined)')
if kb > 15000:
    sys.exit('over the artifact size ceiling')

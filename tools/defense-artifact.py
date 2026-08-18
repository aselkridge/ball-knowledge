#!/usr/bin/env python3
"""The ONE DEFENSE comparison board, from the before/after shots.

Both shoots staged the SAME scenarios through the same script
(tools/defense-shots.mjs), one run on the old code and one on the new, so the
only difference in each pair is what shipped. Desktop frames are cropped to
the action; the phone frames run whole. Plain words throughout, per 08-18.
"""
import base64, io, os
from PIL import Image

SHOTS = 'design/shots/defense'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/defense-board.html'
DESK_CROP = (555, 175, 1165, 570)     # tight on the frontcourt: every duel tile, no empty backcourt


def b64f(path):
    return base64.b64encode(open(path, 'rb').read()).decode()


def font(n):
    return 'data:font/woff2;base64,' + b64f(os.path.join(FONTS, n))


def shot(name, crop=None, scale=1.0):
    im = Image.open(os.path.join(SHOTS, name + '.png')).convert('RGB')
    if crop:
        im = im.crop(crop)
    if scale != 1.0:
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=84, method=5)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


PAIRS = [
    ('desk-horns-vs-man', 'Against MAN pressure', DESK_CROP, 1.0),
    ('desk-horns-vs-2-3-zone', 'Against the 2-3 ZONE', DESK_CROP, 1.0),
    ('phone-horns-vs-man', 'The phone, against MAN', None, 0.78),
]


def pair(tag, caption, crop, scale):
    return f'''
    <figure class="pair">
      <figcaption>{caption}</figcaption>
      <div class="ba">
        <div class="cell before"><span class="chip">BEFORE</span>
          <img src="{shot('before-' + tag, crop, scale)}" alt="before, {caption}" loading="lazy"></div>
        <div class="cell after"><span class="chip on">AFTER</span>
          <img src="{shot('after-' + tag, crop, scale)}" alt="after, {caption}" loading="lazy"></div>
      </div>
    </figure>'''


HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The One Defense</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{
    --ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;
    --accent:#b8560c;--good:#2f6d4f;--warn:#8a6410;--bad:#a83a30;
    --shadow:0 1px 2px rgba(60,40,20,.07),0 8px 24px rgba(60,40,20,.07);
  }}
  @media (prefers-color-scheme:dark){{
    :root:not([data-theme="light"]){{
      --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
      --accent:#f5872e;--good:#6fd0c3;--warn:#ffcf6a;--bad:#d5524b;
      --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
    }}
  }}
  :root[data-theme="dark"]{{
    --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
    --accent:#f5872e;--good:#6fd0c3;--warn:#ffcf6a;--bad:#d5524b;
    --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
  }}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ground);color:var(--ink);font-size:16.5px;line-height:1.62;
    font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1120px;margin:0 auto;padding:0 22px 96px;display:flex;flex-direction:column;gap:52px}}
  .eyebrow{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.15em;
    text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(38px,7vw,66px);line-height:.98;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(21px,3vw,27px);margin:0}}
  p{{margin:0}}
  .lede{{max-width:64ch;color:var(--dim);font-size:17.5px}}
  .lede strong,li strong{{color:var(--ink);font-weight:600}}
  header.top{{padding:60px 0 0;display:flex;flex-direction:column;gap:18px}}
  blockquote{{margin:0;padding:12px 0 12px 20px;border-left:3px solid var(--accent);
    font-size:18px;line-height:1.55;max-width:58ch}}
  blockquote cite{{display:block;margin-top:8px;font-style:normal;font-size:13px;
    color:var(--dim);font-family:'Space Mono',monospace}}
  section{{display:flex;flex-direction:column;gap:20px}}
  .pair{{margin:0;display:flex;flex-direction:column;gap:10px}}
  .pair figcaption{{font-family:'Space Mono',monospace;font-size:13px;color:var(--dim)}}
  .ba{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
  @media (max-width:820px){{.ba{{grid-template-columns:1fr}}}}
  .cell{{position:relative;border:1px solid var(--line);border-radius:4px;overflow:hidden;
    background:#0a0706}}
  .cell.after{{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}}
  .cell img{{display:block;width:100%;height:auto}}
  .chip{{position:absolute;top:8px;left:8px;z-index:2;font-family:'Space Mono',monospace;
    font-size:10px;letter-spacing:.16em;padding:3px 8px;border-radius:3px;
    background:rgba(0,0,0,.55);color:#cfc4ae}}
  .chip.on{{background:var(--accent);color:#1b120a;font-weight:700}}
  ul{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:10px;
    color:var(--dim);max-width:74ch}}
  .keep{{background:var(--raised);border:1px solid var(--line);border-radius:4px;
    padding:20px 22px;display:flex;flex-direction:column;gap:9px;box-shadow:var(--shadow)}}
  .keep p{{color:var(--dim);max-width:74ch;font-size:15px}}
  .keep p strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:20px;line-height:1.7}}
  @media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · shipped to the branch · 18 August</p>
    <h1>The one<br>defense</h1>
    <blockquote>I confirm the first two rules... I think we just drop the momentum tax,
      movement will be movement and the cards are the price that's all
      <cite>Aaron, the ruling</cite></blockquote>
    <p class="lede">Both shoots below staged the exact same scenarios through the same
      script, one on the old code and one on the new, so the only difference inside each
      pair is what shipped. The handler is your point guard, whose plain crossover card is
      Easy: that is why the after-tiles around him run green, with amber where the drive
      is deep. A shooting guard would see amber, a big red. <strong>The tile tells the
      truth about the card before the tap.</strong></p>
  </header>

  <section>
    <h2>What changed, with the measurement</h2>
    <ul>
      <li><strong>Duel tiles now wear the colour of the card they deal</strong> (green
        Easy, amber Medium, red Hard, the scale everything else already speaks). They
        used to be one flat red whatever the price. The colour and the card come from
        one shared function, so they cannot disagree.</li>
      <li><strong>Corner coverage is one step cheaper, everywhere, always.</strong>
        Measured through the real move: head-on Medium, same duel from the corner Easy,
        deep-plus-corner back to Medium.</li>
      <li><strong>A lane two defenders stand on is closed</strong>, drawn dark, refused
        with a plain sentence if tapped. Your skill escape hatch is recorded in the
        rulebook of record and waits on ratings.</li>
      <li><strong>The four-way Spacing picker is gone from setup.</strong> The defense
        is a rule now, not a room preference. Old room links that still carry a spacing
        value are ignored on purpose.</li>
      <li><strong>The CPU plays by the same rules.</strong> Walled in with no shot and
        no pass, it acts in under two seconds and never taps the closed lane. With its
        guard sabotaged out it tapped the wall four times in six seconds, so that guard
        is load-bearing and now has a check standing on it.</li>
      <li><strong>The rulebook stopped lying.</strong> "Winning still costs a step" had
        shipped for two days after the momentum tax died; it is gone, along with the
        four-settings paragraph.</li>
    </ul>
  </section>

  <section>
    <h2>Before and after, same board</h2>
    {''.join(pair(*p) for p in PAIRS)}
  </section>

  <section>
    <h2>Deliberately left alone</h2>
    <div class="keep">
      <p><strong>Shot contests.</strong> Already graduated by geometry in every game: a
        man in your chest makes the shot harder, a diagonal closeout leaves daylight but
        sharpens his block card. Your rule 1 made crossovers match shooting, not the
        other way round.</p>
      <p><strong>The deep cross.</strong> Still one step harder for carrying it 3+
        squares. That is a card price, which is exactly what you ruled prices should
        be.</p>
      <p><strong>Screens.</strong> A body beside a defender still screens him, diagonals
        included. Screens only ever open lanes.</p>
      <p><strong>Movement ranges.</strong> Untouched, per the ruling: point guards move
        3, wings and forwards 2, centers 1, and nothing shortens a crossover any
        more.</p>
    </div>
  </section>

  <footer>
    Shots: tools/defense-shots.mjs, same scenarios both runs. Checks:
    tools/defense-check.mjs, 11, sabotage-proved twice (the closure guard and the CPU's
    wall-skip). Suites green after the change: methodb 43, smoke, drills, heat, coach 22,
    board, turn economy, audit, em dash sweep.<br>
    The rule of record lives in DESIGN.md § 4. The floor analysis that cleared the way:
    the Is-the-Floor-Too-Small board.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
print(f'wrote {OUT}  {os.path.getsize(OUT) // 1024} KB')

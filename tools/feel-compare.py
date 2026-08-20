#!/usr/bin/env python3
"""Wave-1 motion comparison (B18): the feel standard in the real game.

Four short clips of the REAL game recorded by the same script
(tools/feel-videos.mjs), one run on the code before the pass and one after.
Videos, not stills, because motion cannot be photographed. House comparison
skin. The sound slice and the beauty moves ship as their own comparisons."""
import base64, os

FONTS = 'docs/play/assets/fonts'
CLIPS = 'design/shots/feel'
OUT = 'design/feel-compare.html'


def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode()


def font(n):
    return 'data:font/woff2;base64,' + b64(os.path.join(FONTS, n))


def vid(name):
    return 'data:video/webm;base64,' + b64(os.path.join(CLIPS, name + '.webm'))


def pair(tag, caption, note):
    return f'''
    <figure class="pair">
      <figcaption><b>{caption}</b><span>{note}</span></figcaption>
      <div class="ba">
        <div class="cell before"><span class="chip">BEFORE</span>
          <video src="{vid('before-' + tag)}" autoplay loop muted playsinline></video></div>
        <div class="cell after"><span class="chip on">AFTER</span>
          <video src="{vid('after-' + tag)}" autoplay loop muted playsinline></video></div>
      </div>
    </figure>'''


HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Motion Pass</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{
    --ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;--accent:#b8560c;
    --shadow:0 1px 2px rgba(60,40,20,.07),0 8px 24px rgba(60,40,20,.07);
  }}
  @media (prefers-color-scheme:dark){{
    :root:not([data-theme="light"]){{
      --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;--accent:#f5872e;
      --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
    }}
  }}
  :root[data-theme="dark"]{{
    --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;--accent:#f5872e;
    --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
  }}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ground);color:var(--ink);font-size:16.5px;line-height:1.62;
    font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1000px;margin:0 auto;padding:0 22px 96px;display:flex;flex-direction:column;gap:48px}}
  .eyebrow{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.15em;
    text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(38px,7vw,62px);line-height:.98;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:24px;margin:0}}
  p{{margin:0}}
  .lede{{max-width:64ch;color:var(--dim);font-size:17px}}
  .lede strong{{color:var(--ink)}}
  header.top{{padding:56px 0 0;display:flex;flex-direction:column;gap:16px}}
  section{{display:flex;flex-direction:column;gap:20px}}
  .pair{{margin:0;display:flex;flex-direction:column;gap:10px}}
  .pair figcaption{{display:flex;flex-direction:column;gap:3px}}
  .pair figcaption b{{font-family:Archivo,sans-serif;font-weight:600;font-size:15px;
    letter-spacing:.04em;text-transform:uppercase}}
  .pair figcaption span{{font-family:'Space Mono',monospace;font-size:13px;color:var(--dim);max-width:80ch}}
  .ba{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
  @media (max-width:760px){{.ba{{grid-template-columns:1fr}}}}
  .cell{{position:relative;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#0a0706}}
  .cell.after{{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}}
  .cell video{{display:block;width:100%;height:auto}}
  .chip{{position:absolute;top:8px;left:8px;z-index:2;font-family:'Space Mono',monospace;
    font-size:10px;letter-spacing:.16em;padding:3px 8px;border-radius:3px;
    background:rgba(0,0,0,.55);color:#cfc4ae}}
  .chip.on{{background:var(--accent);color:#1b120a;font-weight:700}}
  ul{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:9px;color:var(--dim);max-width:78ch;font-size:15px}}
  ul strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:18px;line-height:1.7}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · B18 wave 1 · shipped on the branch</p>
    <h1>The motion pass</h1>
    <p class="lede">The feel standard's first wave, in the real game, on video, because
      motion cannot be photographed. Both columns were recorded by the same script staging
      the same moments; the only difference is the shipped code. <strong>Watch the clips
      twice: the second viewing is where the before column starts to feel like a
      slideshow.</strong></p>
  </header>

  <section>
    {pair('screens',
      'Screen to screen',
      'Before: the 440ms eased pan (my number, never ruled). After: 320ms on the computed spring in, 200ms exit out. Faster AND softer at once, which is the spring doing what an eased line cannot.')}
    {pair('dock',
      'The dock arrives, the banner breathes',
      'Before: the action menu teleports into existence in one frame and the banner overwrites its sentence mid-read. After: the dock rises 320ms on the spring when it returns from empty (never on mere repaints, so live counts do not bounce it), and each new banner sentence arrives in 200ms.')}
  </section>

  <section>
    <h2>Also in this pass, feelable only on a real phone</h2>
    <ul>
      <li><strong>Press states on ten silent control families</strong>: the answer buttons on
        a question card, the SHOOT/PASS/MOVE rows, the setup cards, colorways, target chips
        and HUD buttons now answer the finger in 100ms, before the action fires.</li>
      <li><strong>The question card scales in</strong> (200ms) instead of snapping on.</li>
      <li><strong>The slam joined the clock</strong>: 1500ms on the reserved bouncy spring.</li>
      <li><strong>One clock, five tokens</strong>: every duration in this pass reads from
        --t-press/--t-elem/--t-surface/--t-beat/--t-slam, so a retune is one token.</li>
      <li><strong>Reduce motion is honored everywhere</strong>: every new animation dies
        under the setting and the system preference.</li>
    </ul>
  </section>

  <section>
    <h2>Deliberately not in this pass</h2>
    <ul>
      <li><strong>Sound</strong> ships as its own slice next (shaped cues, landing-timed).</li>
      <li><strong>The beauty moves</strong> (the two-colour wash, bright-wins, the treasured
        card) each land as their own before/after, versus screen first.</li>
      <li><strong>Board pieces, continuity moments, recorded samples</strong>: wave 2+, per
        the ruled exclusions.</li>
    </ul>
  </section>

  <footer>
    Clips: tools/feel-videos.mjs against :8899, phone 390px. Standard: DESIGN § 9, ruled
    08-18 ("I love the board"). Gates after the pass: turn-check 28 · methodb 41 ·
    defense 11 · heat · cap · audit, all green.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
print(OUT, len(HTML) // 1024, 'KB')

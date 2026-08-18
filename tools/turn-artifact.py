#!/usr/bin/env python3
"""The turn-clarity comparison board, from the before/after shots.

Both shoots ran the same script (tools/turn-shots.mjs), one on the game as it
stood on the 17th and one on the shipped build, so the only difference in a
pair is what shipped. Two of the states are new: their old selves lived
behind the prototype switch or did not exist, so there is nothing a player
could have reached to photograph on the left; they are labelled NEW rather
than passed off as pairs. House comparison skin (defense-artifact.py)."""
import base64, io, os
from PIL import Image

SHOTS = 'design/shots/turn'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/turn-compare.html'


def b64f(path):
    return base64.b64encode(open(path, 'rb').read()).decode()


def font(n):
    return 'data:font/woff2;base64,' + b64f(os.path.join(FONTS, n))


def shot(name, scale=1.0):
    im = Image.open(os.path.join(SHOTS, name + '.png')).convert('RGB')
    if scale != 1.0:
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=82, method=5)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def pair(tag, caption, note, scale=0.9):
    return f'''
    <figure class="pair">
      <figcaption><b>{caption}</b><span>{note}</span></figcaption>
      <div class="ba">
        <div class="cell before"><span class="chip">BEFORE</span>
          <img src="{shot('before-' + tag, scale)}" alt="before, {caption}" loading="lazy"></div>
        <div class="cell after"><span class="chip on">AFTER</span>
          <img src="{shot('after-' + tag, scale)}" alt="after, {caption}" loading="lazy"></div>
      </div>
    </figure>'''


def solo(tag, caption, note, scale=0.9):
    return f'''
    <figure class="pair">
      <figcaption><b>{caption}</b><span>{note}</span></figcaption>
      <div class="ba one">
        <div class="cell after"><span class="chip new">NEW</span>
          <img src="{shot('after-' + tag, scale)}" alt="{caption}" loading="lazy"></div>
      </div>
    </figure>'''


HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Handoff</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{
    --ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;
    --accent:#b8560c;--good:#2f6d4f;--bad:#a83a30;
    --shadow:0 1px 2px rgba(60,40,20,.07),0 8px 24px rgba(60,40,20,.07);
  }}
  @media (prefers-color-scheme:dark){{
    :root:not([data-theme="light"]){{
      --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
      --accent:#f5872e;--good:#6fd0c3;--bad:#d5524b;
      --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
    }}
  }}
  :root[data-theme="dark"]{{
    --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
    --accent:#f5872e;--good:#6fd0c3;--bad:#d5524b;
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
  section{{display:flex;flex-direction:column;gap:24px}}
  .pair{{margin:0;display:flex;flex-direction:column;gap:10px}}
  .pair figcaption{{display:flex;flex-direction:column;gap:3px}}
  .pair figcaption b{{font-family:Archivo,sans-serif;font-weight:600;font-size:15px;
    letter-spacing:.04em;text-transform:uppercase}}
  .pair figcaption span{{font-family:'Space Mono',monospace;font-size:13px;color:var(--dim);max-width:80ch}}
  .ba{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
  .ba.one{{grid-template-columns:minmax(0,1fr);max-width:560px}}
  @media (max-width:820px){{.ba{{grid-template-columns:1fr}}}}
  .cell{{position:relative;border:1px solid var(--line);border-radius:4px;overflow:hidden;
    background:#0a0706}}
  .cell.after{{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}}
  .cell img{{display:block;width:100%;height:auto}}
  .chip{{position:absolute;top:8px;left:8px;z-index:2;font-family:'Space Mono',monospace;
    font-size:10px;letter-spacing:.16em;padding:3px 8px;border-radius:3px;
    background:rgba(0,0,0,.55);color:#cfc4ae}}
  .chip.on{{background:var(--accent);color:#1b120a;font-weight:700}}
  .chip.new{{background:var(--good);color:#0a1512;font-weight:700}}
  ul{{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:10px;
    color:var(--dim);max-width:78ch}}
  .keep{{background:var(--raised);border:1px solid var(--line);border-radius:4px;
    padding:20px 22px;display:flex;flex-direction:column;gap:9px;box-shadow:var(--shadow)}}
  .keep p{{color:var(--dim);max-width:76ch;font-size:15px}}
  .keep p strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:20px;line-height:1.7}}
  @media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · shipped build · 18 August</p>
    <h1>The handoff</h1>
    <blockquote>"it's still unclear when it's your turn, maybe we make it super
      clear with big'ish words 'your turn!' and then even a player menu comes
      up showing your options"<cite>Aaron, 08-17 · built to the seven rulings he
      gave on the mockup, 08-18</cite></blockquote>
    <p class="lede">Every frame below is the real game photographed, both
      shoots staged by the same script. The rule the whole build serves:
      <strong>it is your turn exactly when your buttons exist.</strong> The
      slam announces the change once, the dock at the bottom is the state you
      can check at any time, and when it is not your turn the lights come
      down, the floor stays lit, and a quiet strip holds the space where your
      buttons will come back. Method B is now simply the game on every
      full-court squad-vs-squad night, per his ruling; the prototype switch
      is gone.</p>
  </header>

  <section>
    <h2>Their turn, on your phone</h2>
    {pair('phone-waiting',
      'The moment you are waiting on the machine',
      'Before: the only signal on the whole screen was a three-letter chip in the banner. After: the slam has just hit, the lights are down everywhere EXCEPT the floor (his note: "the player needs to watch the board"), and the strip holds the bottom. Measured on this build: the clear band runs 259 to 457 while the court spans 273 to 443, so every tile sits inside the lit band.')}
    {pair('desk-waiting',
      'The same moment, wide screen',
      'The court fills a wide screen, so the strip walks itself to the dead corner the rotated floor leaves at the lower right rather than sit on a tile. That move is the overlap law working, not a styling choice.', 0.62)}
  </section>

  <section>
    <h2>Your turn, ball in hand</h2>
    {pair('phone-action',
      'The action menu is the turn signal',
      'Before: a hint sentence in the bottom bar. After: the dock, with the same three calls the menu ruling picked: SHOOT priced by the real zone, PASS with the honest open/covered count, MOVE as a plain control. Buttons there = you are up.')}
    {solo('phone-setup-dock',
      'Free moves open the turn',
      'NEW: the dock opens ON the free moves with a live count, and DONE is the only door to the action, so they cannot be skipped or forgotten (his ask: "how are we alerting or informing the player of their free moves before main action again?"). Its predecessor was a lone "Done setting up" button that lived behind the prototype switch, which no longer exists.')}
    {solo('phone-slam',
      'The slam, mid-air',
      'NEW: fires on possession flips ONLY, never on the beats inside a possession, proven by a dedicated check. Solo it speaks you/they; a shared phone gets the squad name in the squad colour, which is also why duplicate names had to die at setup.')}
  </section>

  <section>
    <h2>Two squads, one name</h2>
    {pair('phone-names-dup',
      'The name block, at setup',
      'The refusal existed before but mumbled ("two squads, two names") and let matching scoreboard tags through, so two squads could still wear the same three letters all night. After: the ruled copy, and the tag is checked too. Online guests are checked against the host the same way.')}
  </section>

  <section>
    <h2>What changed, in one line each</h2>
    <ul>
      <li><strong>Method B is the game.</strong> The Settings switch, the PROTOTYPE chip and the bk_methodb flag are gone; it latches for every full-court 5v5 local and CPU game. Online, BIG3 and drills keep the classic possession until Method B carries them.</li>
      <li><strong>The slam</strong> fires on possession flips only. YOUR TURN / THEY'RE UP against the machine and online, the squad's name at a shared phone.</li>
      <li><strong>The dock</strong> moved from floating over the floor's low edge to the dead space under it, opens each turn on the free moves with a live count, and collapses entirely while a question card is up.</li>
      <li><strong>The lights</strong> dim the room, never the floor, and the clear band re-measures itself from the projected court every tick, so the lean-in camera can never drag a tile into the dark.</li>
      <li><strong>The overlap law has a check on it:</strong> tools/turn-check.mjs walks every tile through the game's own projection and fails on one pixel of dock or tray over any tile, at 390x844, 390x667 and 1280x860. The dock goes slim, then walks to the side, before a tile ever goes under it. 27 checks, and each family was sabotaged red before its green was trusted.</li>
      <li><strong>Trash talk shipped in its ruled shape:</strong> fixed prefixed lines only, big moments only (their deep splash or steal, game point, a big hit they take, a blowout gap), at least 20 seconds apart, six lines a game at most, and a Settings switch that kills it entirely. Tested: the seventh line in a game does not exist.</li>
      <li><strong>Turn copy speaks you/they</strong> in solo and online games ("Your ball. Main action..."), squad names at a shared phone.</li>
    </ul>
  </section>

  <section>
    <h2>Deliberately left alone</h2>
    <div class="keep">
      <p><strong>The turn chip and the banner stay.</strong> The banner is the play-by-play and the chip still names the acting side; they just stopped being the only place the turn lives.</p>
      <p><strong>The scoreboard dimming stays.</strong> The idle side's plates still dim exactly as they did.</p>
      <p><strong>The classic possession is archived in place, not deleted.</strong> BIG3, online and the drills still play it, and the harness holds a regression section on it.</p>
      <p><strong>The coach is still quiet in full-court games.</strong> His scripts teach the old possession; the rewrite is ordered LAST, his call, so the silence holds until then.</p>
      <p><strong>The two Method B range toggles are still in Settings</strong> under "Full court": those are open numbers the friend playtest settles by feel, and they were never the switch he removed.</p>
    </div>
  </section>

  <footer>
    Real screenshots, both columns: tools/turn-shots.mjs against :8899, phone 390x844 and desktop 1280x860.
    Gates: tools/turn-check.mjs (28) · methodb-check (42) · defense-check (11) · heat, cap, audit all green.
    The lone "after"-only panels are labelled NEW because their before lived behind the removed prototype switch; a lone after is otherwise a sales pitch, per the comparison law.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
print(OUT, len(HTML) // 1024, 'KB')

#!/usr/bin/env python3
"""THE HOOP FRAME · EIGHT OPTIONS, NOTHING DECIDED.

Aaron, 08-20: "I really did want to change the frames but you couldn't seem to
get it. And honestly I would have wanted to see some changes and then side by
side comparisons before you went making decisions."

So this page exists BEFORE a decision, not after one. Every frame is a real
headless screenshot of the real game with `FRAME` patched in flight by
tools/board2-shots.mjs. The shipped default is still 'now' and is proved
untouched at 0 changed pixels: nothing here is in the game.

Two views, because the frame has two completely different jobs. The FAR goal on
desktop is where you see it side on, in full, at full opacity. The NEAR goal on
a phone is where the original complaint came from: seen from behind and from
above, where structure either survives foreshortening or turns to mush."""
import base64, io, os
from PIL import Image

S = 'design/shots/board2/'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/frames-compare.html'
FAR = (1950, 20, 2560, 560)      # desktop, far goal, full opacity, side on
NEAR = (180, 930, 620, 1290)     # phone, near goal, from behind and above


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


def img(name, view, box, w, q=88):
    im = Image.open(S + name + '-' + view + '.png').crop(box)
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.convert('RGB').save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


OPTIONS = [
    ('frame-nba', 'F', 'NBA portable (from his photos)',
     'The real thing, read off the two reference shots: a big TALL black box on '
     'the floor, a chunky white tower that leans forward and narrows as it '
     'climbs, a white boom out over the baseline with a clear elbow, and a '
     'sponsor strip across the base.',
     'It is the actual object. Three things I had wrong before the photos and '
     'would not have guessed: the base is a third of the rig, not a low pad; '
     'the tower TAPERS; and the whole frame is WHITE over black, not dark steel.',
     'The base is the biggest floor footprint of any option, and it sits right '
     'behind the baseline where the near goal already crowds the paint.'),
    ('frame-nbateam', 'G', 'NBA portable, team base',
     'Identical to F with the base box in the squad colour instead of black.',
     'Ties the end of the court to whoever is attacking it, and the game '
     'already uses team colour for ownership everywhere else.',
     'Two big saturated blocks at opposite ends compete with the pieces, which '
     'are the thing that actually has to read.'),
    ('frame-nbabold', 'H', 'NBA portable, bolder',
     'F with every structural member 1.35x thicker. Same silhouette, more mass.',
     'Survives phone size better. At 390px the slim members of F are close to '
     'the point where a line stops being a shape.',
     'Heavier than the real thing, and on desktop it starts to look toy-like.'),
    ('ship', 'A', 'As it is now',
     'The A-frame truss: two legs splaying out of the base, three cross rungs, '
     'two hanger arms over the top. Every member is a round-capped stroke, which '
     'is why it reads as tubing rather than steel.',
     'Nothing to build, and you already know you do not like it.',
     'Round tube, and a truss is not a shape a basketball goal has. Seen from '
     'above at the near end it flattens into a ladder on the paint.'),
    ('frame-goose', 'B', 'Gooseneck',
     'The modern NBA portable. One slim mast at the back of a big padded base, a '
     'level boom out over the baseline, then a curve down onto the back of the '
     'board. Square-section steel, dark, with only the pad in team colour.',
     'The most recognisable of the five: this is what a televised hoop looks '
     'like. The padded base gives the end of the court some weight.',
     'The most parts, so the most to go wrong at phone size, and the base eats '
     'the most apron.'),
    ('frame-fan', 'C', 'Fan brace',
     'The older arena look. A straight column close behind the board with two '
     'angled braces running back down to a small pad on the floor.',
     'Fewer parts than the gooseneck and a triangle instead of a curve, which '
     'survives being small better than a bent boom does.',
     'From the near end the two braces foreshorten into one dark slab behind the '
     'board. That is visible in the phone strip and it is the weakest of the '
     'five there.'),
    ('frame-drop', 'D', 'Ceiling drop',
     'No floor rig at all. The board hangs off two arms that run back and up out '
     'of frame, the way a practice gym or a school hall does it.',
     'By far the cleanest at the near end: it gives back every inch of apron and '
     'paint, and the board simply floats where it should be. Fewest parts, so '
     'the least to render badly.',
     'It is a gym, not an arena. If the game is selling a televised feel then '
     'this is the option that quietly downgrades the room.'),
    ('frame-park', 'E', 'Park pole',
     'One thick pole set straight into the ground behind the board. No pad, no '
     'truss, no boom.',
     'The simplest silhouette of the five and it reads at any size. It also '
     'suits Blacktop, where an arena rig has always looked out of place.',
     'On the hardwood courts it reads as a driveway hoop, which is a different '
     'game to the one the arena backdrop is selling.'),
]

far = ''.join(f'''
      <figure class="opt">
        <span class="tag">{k}</span>
        <img src="{img(n, 'desk', FAR, 560)}" alt="{t}">
        <figcaption>{t}</figcaption>
      </figure>''' for n, k, t, _d, _f, _a in OPTIONS)

near = ''.join(f'''
      <figure class="opt">
        <span class="tag">{k}</span>
        <img src="{img(n, 'phone', NEAR, 520)}" alt="{t}">
        <figcaption>{t}</figcaption>
      </figure>''' for n, k, t, _d, _f, _a in OPTIONS)

cards = ''.join(f'''
    <div class="card">
      <h3><b>{k}</b> {t}</h3>
      <p class="what">{d}</p>
      <p class="good"><span>For</span>{f}</p>
      <p class="bad"><span>Against</span>{a}</p>
    </div>''' for _n, k, t, d, f, a in OPTIONS)

HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Eight Hoop Frames</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{--ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;
    --accent:#b8560c;--good:#2f7d43;--bad:#a8412f;}}
  @media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{
    --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
    --accent:#f5872e;--good:#63c47e;--bad:#e8846f;}}}}
  :root[data-theme="dark"]{{--ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;
    --dim:#a3937f;--accent:#f5872e;--good:#63c47e;--bad:#e8846f;}}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ground);color:var(--ink);font-size:16.5px;line-height:1.62;
    font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1180px;margin:0 auto;padding:0 22px 96px;display:flex;flex-direction:column;gap:52px}}
  .eyebrow{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.15em;
    text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(38px,7vw,64px);line-height:.98;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:26px;margin:0}}
  h3{{font-family:Archivo,sans-serif;font-weight:600;font-size:15px;margin:0;letter-spacing:.03em}}
  h3 b{{font-family:Anton,Impact,sans-serif;font-weight:400;font-size:22px;color:var(--accent);
    margin-right:8px}}
  p{{margin:0}}
  .lede{{max-width:68ch;color:var(--dim);font-size:17px}}
  .lede strong{{color:var(--ink)}}
  blockquote{{margin:0;font-family:'Space Mono',monospace;font-size:15px;line-height:1.7;
    border-left:3px solid var(--accent);padding-left:18px;color:var(--ink);max-width:74ch}}
  header.top{{padding:56px 0 0;display:flex;flex-direction:column;gap:18px}}
  section{{display:flex;flex-direction:column;gap:18px}}
  .strip{{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}}
  @media (max-width:980px){{.strip{{grid-template-columns:repeat(2,1fr)}}}}
  @media (max-width:560px){{.strip{{grid-template-columns:1fr}}}}
  .opt{{margin:0;position:relative;display:flex;flex-direction:column;gap:7px}}
  .opt img{{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:6px;
    background:#0a0706}}
  .opt figcaption{{font-family:'Space Mono',monospace;font-size:12px;color:var(--dim)}}
  .tag{{position:absolute;top:7px;left:7px;z-index:2;font-family:Anton,Impact,sans-serif;
    font-size:15px;line-height:1;padding:5px 9px 4px;border-radius:4px;
    background:var(--accent);color:#1b120a}}
  .cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}}
  .card{{background:var(--raised);border:1px solid var(--line);border-radius:9px;padding:17px;
    display:flex;flex-direction:column;gap:10px}}
  .card .what{{color:var(--dim);font-size:14.5px}}
  .card p span{{font-family:Archivo,sans-serif;font-weight:600;font-size:10.5px;letter-spacing:.13em;
    text-transform:uppercase;display:block;margin-bottom:2px}}
  .card .good{{font-size:14.5px;color:var(--dim)}}
  .card .good span{{color:var(--good)}}
  .card .bad{{font-size:14.5px;color:var(--dim)}}
  .card .bad span{{color:var(--bad)}}
  .call{{border-left:3px solid var(--accent);padding:2px 0 2px 18px;display:flex;flex-direction:column;gap:9px}}
  .call b{{font-family:Archivo,sans-serif;font-weight:600;letter-spacing:.04em;
    text-transform:uppercase;font-size:14px}}
  .call p{{color:var(--dim);font-size:15px;max-width:82ch}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:18px;line-height:1.7}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · list item 2 · 08-20 · nothing decided</p>
    <h1>Eight hoop frames</h1>
    <blockquote>"I really did want to change the frames but you couldn't seem to get it. And
      honestly I would have wanted to see some changes and then side by side comparisons before
      you went making decisions."</blockquote>
    <p class="lede">Fair, and the second half is the part I got wrong: this project has had a rule
      since day one that a visual change ships a side-by-side, and I had been treating that as a
      receipt to publish after deciding. So here are seven alternatives beside what is there now,
      <strong>before</strong> anything is chosen. <strong>F, G and H came after he sent two
      reference photos of a real NBA portable</strong>, and those photos corrected three things I
      had wrong and would not have guessed: the base is a big TALL box rather than a low pad, the
      tower TAPERS as it climbs, and the whole frame is WHITE over black rather than dark steel. <strong>None of this is in the game.</strong> The
      shipped frame is still A, and that is proved rather than promised: with all five built, the
      default render differs from the previous build by <strong>0 of 3,287,040 pixels</strong>.</p>
  </header>

  <section>
    <h2>Side on, full size</h2>
    <p class="lede">The far goal on desktop, where you see the whole frame at full opacity.</p>
    <div class="strip">{far}</div>
  </section>

  <section>
    <h2>From behind, on a phone</h2>
    <p class="lede">The near goal at 390px, which is where the complaint started. Seen from above
      and behind, a frame either survives foreshortening or turns to mush.</p>
    <div class="strip">{near}</div>
  </section>

  <section>
    <h2>What each one is</h2>
    <div class="cards">{cards}</div>
  </section>

  <section>
    <h2>What I would pick, and it is only a vote</h2>
    <div class="call">
      <b>F, or H if the phone matters more than the desktop</b>
      <p><strong>F is the one built from his own reference</strong>, and that shows: it is the only
        option whose proportions came from the real object rather than from me guessing at one. The
        black box, the white taper and the elbow are what make a hoop rig recognisable at a glance,
        and none of my first four had any of the three.</p>
      <p><strong>H is F for phones.</strong> Compare the second strip: F's tower is close to the
        width where a member stops reading as a shape at 390px, and H buys that back at the cost of
        looking slightly toy-like on desktop. If the phone is the machine that matters, and the
        measurements say it is, H is the safer pick.</p>
      <p><strong>G, the team-coloured base,</strong> is the one I would not take: two big saturated
        blocks at opposite ends of a small board compete with the pieces, and the pieces are the
        thing that has to read.</p>
      <p>Of the first four, <strong>B, the gooseneck,</strong> is the best and it is now clearly
        second to F: it was my guess at this shape before the photos, and the photos beat it.</p>
      <p><strong>D, the ceiling drop,</strong> is the honest answer to the original complaint: at
        the near end there is simply nothing on the floor to read badly. Look at the second strip
        and it is not close. The cost is that it says school gym rather than arena.</p>
      <p><strong>C is the weakest</strong> and I would drop it: the two braces collapse into one
        dark slab from behind, which is the same class of failure as the ladder.</p>
      <p>Worth saying plainly: these are all hand-built canvas geometry and I have now missed on
        this object three times. If none of the five is right, my recommendation is to
        <strong>source the frame as art</strong> rather than have me keep drawing it, and that is
        your call, not mine.</p>
    </div>
  </section>

  <footer>
    Real headless screenshots at 1280x860 and 390x844, DPR 2, reduce-motion on, seeded so the
    only difference between panels is the frame. Built by tools/board2-shots.mjs, which patches
    FRAME in flight and hard-fails rather than silently showing the wrong candidate. Page built by
    tools/frames-artifact.py. Nothing merged, nothing shipped: say a letter and it is one word to
    switch.
  </footer>
</div>'''

open(OUT, 'w').write(HTML)
print(OUT, str(round(len(HTML) / 1024)) + ' KB')

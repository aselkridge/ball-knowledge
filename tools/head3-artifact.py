#!/usr/bin/env python3
"""THE MENU HEADER · FIVE OPTIONS, NOTHING DECIDED (list item 3).

Aaron, 08-19: "I love the logo but 'ball knowledge' and the little quote are
cool but they look sooo plain and crowded... just like the title of a word doc
not the title of a game at the top of a main menu."

Options built and shown BEFORE a decision, which is the rule now. Every frame
is a real headless screenshot of the real menu, with the header markup and CSS
patched in flight by tools/head-shots.mjs. Nothing is in the game."""
import base64, io, os
from PIL import Image

S = 'design/shots/head3/'
FONTS = 'docs/play/assets/fonts'
OUT = 'design/head3-compare.html'
TOP = (0, 0, 780, 1220)      # phone: header plus the first doors


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


def img(name, view, box, w, q=86):
    im = Image.open(S + name + '-' + view + '.png')
    if box:
        im = im.crop(box)
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.convert('RGB').save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


# name, key, title, header px, doors-start px, what, for, against
OPTIONS = [
    ('now', 'A', 'As it is now', 150, 162,
     'Crest, then BALL, then KNOWLEDGE, then the line, four things stacked dead '
     'centre with 5px between them, and the line set in 9px letterspaced mono.',
     'It is what everyone has seen, and the wordmark is unmissable.',
     'A centred stack with tight gaps and a small caption under it IS a document '
     'title block. That is not a taste judgement, it is the same construction. '
     'The background art also carries a huge BALL KNOW watermark, so the name is '
     'genuinely said twice on one screen.'),
    ('b-lockup', 'B', 'Lockup left', 87, 98,
     'Crest and wordmark side by side on one line, pushed to the left edge of the '
     'column. The tagline goes.',
     'A lockup with air to its right reads as a product; a centred stack reads as '
     'a document. Keeps the crest at a decent size, keeps the name, and buys back '
     '64px of phone.',
     'Left-aligning the header makes it the only left-aligned thing above the '
     'doors, so it needs the rest of the top edge to agree with it.'),
    ('c-crest', 'C', 'Crest hero', 177, 188,
     'The mark gets to be big. The name becomes ONE wide-tracked line underneath '
     'instead of two stacked slabs. Tagline goes.',
     'Answers the "I love the logo" half directly: the best thing we own becomes '
     'the hero instead of a 60px ornament above the type. Nothing is crowded.',
     'The most expensive option: 26px MORE than now, so the doors start lower on '
     'the machine with the least room.'),
    ('d-poster', 'D', 'Poster', 141, 152,
     'No crest in the header at all. The name goes big and tight, title-card '
     'sized, with the line under it as the only small thing on the screen.',
     'The most confident of the five and the least like a document. The crest is '
     'already the app icon, the tab icon and the install card, so the menu does '
     'not have to introduce it.',
     'He said he loves the logo, and this is the one option that removes it. '
     'Also the option that fights the background watermark hardest.'),
    ('e-bug', 'E', 'Broadcast bug', 46, 57,
     'The smallest possible claim: a compact crest and wordmark sitting top left, '
     'opposite the two round buttons, so the top of the screen reads as a bar.',
     'Buys back 105px, which is 12% of a 844px phone, and it shows: THE JACKET '
     'and PLAY SOMEBODY both come into view. Treats the doors as the hero, which '
     'on a menu they are.',
     'The quietest. If the main menu is meant to feel like a title screen rather '
     'than an app, this undersells it.'),
]

REFINED = [('b1-34', '34px', 'as shown on the board'),
           ('b2-30', '30px', 'my vote'),
           ('b3-27', '27px', 'noticeably quieter'),
           ('b4-24', '24px', 'the crest clearly leads')]
refined = ''.join(f"""
      <figure class="opt">
        <span class="tag">{k}</span>
        <img src="{img(n, 'phone', (0, 40, 780, 560), 470)}" alt="{k}">
        <figcaption>{d}</figcaption>
      </figure>""" for n, k, d in REFINED)

strip = ''.join(f'''
      <figure class="opt">
        <span class="tag">{k}</span>
        <img src="{img(n, 'phone', TOP, 470)}" alt="{t}">
        <figcaption>{t}<br><span class="mono">{hp}px header · doors {gp}px down</span></figcaption>
      </figure>''' for n, k, t, hp, gp, _w, _f, _a in OPTIONS)

desk = ''.join(f'''
      <figure class="opt">
        <span class="tag">{k}</span>
        <img src="{img(n, 'desk', (0, 0, 2560, 900), 700)}" alt="{t}">
        <figcaption>{t}</figcaption>
      </figure>''' for n, k, t, _h, _g, _w, _f, _a in OPTIONS)

rows = ''.join(f'''
      <tr{' class="pick"' if k in ('B',) else ''}>
        <td class="thing">{k} &middot; {t}</td>
        <td class="mono num">{hp}px</td>
        <td class="mono">{gp}px</td>
        <td class="mono">{'baseline' if k == 'A' else (f'{162-gp}px earlier' if gp < 162 else f'{gp-162}px later')}</td>
      </tr>''' for n, k, t, hp, gp, _w, _f, _a in OPTIONS)

cards = ''.join(f'''
    <div class="card">
      <h3><b>{k}</b> {t}</h3>
      <p class="what">{w}</p>
      <p class="good"><span>For</span>{f}</p>
      <p class="bad"><span>Against</span>{a}</p>
    </div>''' for _n, k, t, _h, _g, w, f, a in OPTIONS)

HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Menu Header</title>
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
  h3 b{{font-family:Anton,Impact,sans-serif;font-weight:400;font-size:22px;color:var(--accent);margin-right:8px}}
  p{{margin:0}}
  .lede{{max-width:68ch;color:var(--dim);font-size:17px}}
  .lede strong{{color:var(--ink)}}
  blockquote{{margin:0;font-family:'Space Mono',monospace;font-size:15px;line-height:1.7;
    border-left:3px solid var(--accent);padding-left:18px;color:var(--ink);max-width:74ch}}
  header.top{{padding:56px 0 0;display:flex;flex-direction:column;gap:18px}}
  section{{display:flex;flex-direction:column;gap:18px}}
  .strip{{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}}
  .strip4{{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}}
  @media (max-width:980px){{.strip4{{grid-template-columns:repeat(2,1fr)}}}}
  .deskstrip{{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}}
  @media (max-width:980px){{.strip{{grid-template-columns:repeat(2,1fr)}}
    .deskstrip{{grid-template-columns:1fr}}}}
  @media (max-width:560px){{.strip{{grid-template-columns:1fr}}}}
  .opt{{margin:0;position:relative;display:flex;flex-direction:column;gap:7px}}
  .opt img{{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:6px;background:#0a0706}}
  .opt figcaption{{font-size:13px;color:var(--dim);line-height:1.45}}
  .opt .mono{{font-family:'Space Mono',monospace;font-size:11.5px;color:var(--accent)}}
  .tag{{position:absolute;top:7px;left:7px;z-index:2;font-family:Anton,Impact,sans-serif;
    font-size:15px;line-height:1;padding:5px 9px 4px;border-radius:4px;background:var(--accent);color:#1b120a}}
  .scroll{{overflow-x:auto}}
  table{{border-collapse:collapse;width:100%;font-size:15px;min-width:460px}}
  td,th{{text-align:left;vertical-align:top;padding:10px 13px;border-top:1px solid var(--line);white-space:nowrap}}
  th{{font-family:Archivo,sans-serif;font-weight:600;font-size:11px;letter-spacing:.11em;
    text-transform:uppercase;color:var(--dim);border-top:0}}
  td.thing{{font-family:Archivo,sans-serif;font-weight:600;white-space:normal}}
  td.mono{{font-family:'Space Mono',monospace;font-size:13px;color:var(--dim)}}
  td.mono.num{{color:var(--ink)}}
  tr.pick td{{background:rgba(184,86,12,.10)}}
  .cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}}
  .card{{background:var(--raised);border:1px solid var(--line);border-radius:9px;padding:17px;
    display:flex;flex-direction:column;gap:10px}}
  .card .what{{color:var(--dim);font-size:14.5px}}
  .card p span{{font-family:Archivo,sans-serif;font-weight:600;font-size:10.5px;letter-spacing:.13em;
    text-transform:uppercase;display:block;margin-bottom:2px}}
  .card .good{{font-size:14.5px;color:var(--dim)}} .card .good span{{color:var(--good)}}
  .card .bad{{font-size:14.5px;color:var(--dim)}} .card .bad span{{color:var(--bad)}}
  .call{{border-left:3px solid var(--accent);padding:2px 0 2px 18px;display:flex;flex-direction:column;gap:9px}}
  .call b{{font-family:Archivo,sans-serif;font-weight:600;letter-spacing:.04em;text-transform:uppercase;font-size:14px}}
  .call p{{color:var(--dim);font-size:15px;max-width:82ch}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:18px;line-height:1.7}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · list item 3 · 08-20 · nothing decided</p>
    <h1>The menu header</h1>
    <blockquote>"I love the logo but 'ball knowledge' and the little quote are cool but they look
      sooo plain and crowded... just like the title of a word doc not the title of a game at the
      top of a main menu."</blockquote>
    <p class="lede">He is right and the construction proves it rather than the taste. The header is
      <strong>four things stacked dead centre with 5px between them</strong>, closing with a 9px
      letterspaced caption. That is the same build as a document title block, so it reads as one.
      <strong>And the name really is said twice:</strong> the background art carries a huge BALL
      KNOW watermark right behind the wordmark. One thing I had wrong in my own notes and have
      corrected: the crest is WORDLESS, so the wordmark is not redundant with the logo, only with
      the backdrop.</p>
  </header>

  <section>
    <h2>B, refined &middot; his notes</h2>
    <p class="lede">*"May I see B but with the title form a bit smaller, don't touch the logo, and
      yes please feel free to remove the watermark in the background."* All three done. The
      <strong>watermark is gone</strong> in every frame below: it was a real element,
      <code>&lt;div class="bg-type"&gt;BALL KNOW LEDGE&lt;/div&gt;</code>, a 230px outline of the
      name sitting behind the header, which is why the top of the screen felt like it was shouting
      twice. The logo is untouched at every size. <strong>And shrinking the wordmark is free:</strong>
      the header stays 87px in all four, because the logo sets its height, not the type.</p>
    <div class="strip4">{refined}</div>
    <div class="call">
      <b>My vote: 30px</b>
      <p>It is the one that reads as "a bit smaller" rather than as a different decision. At 27 and
        24 the name starts to look deferential next to the crest, which is a real option if you
        want the logo to lead, but it is a bigger move than you asked for. Say a number.</p>
    </div>
  </section>

  <section>
    <h2>On a phone, where it matters</h2>
    <p class="lede">Top of a 390x844 screen. The number under each is the header's height and how
      far down the first door starts, measured off the live layout rather than estimated.</p>
    <div class="strip">{strip}</div>
  </section>

  <section>
    <h2>What each costs</h2>
    <div class="scroll"><table>
      <tr><th>Option</th><th>Header</th><th>Doors start</th><th>vs now</th></tr>{rows}
    </table></div>
  </section>

  <section>
    <h2>Desktop</h2>
    <div class="deskstrip">{desk}</div>
  </section>

  <section>
    <h2>What each one is</h2>
    <div class="cards">{cards}</div>
  </section>

  <section>
    <h2>What I would pick, and it is only a vote</h2>
    <div class="call">
      <b>B, the lockup</b>
      <p>It fixes the actual defect rather than trading it for a different one. The complaint is
        "plain and crowded" and a left lockup is the one change that removes BOTH: the crowding
        goes because the stack becomes a line, and the plainness goes because the top of the screen
        stops being symmetrical. It keeps the crest at a size worth looking at, keeps the name, and
        still buys back 64px on the machine with the least room.</p>
      <p><strong>C is the one to pick if the logo is the point.</strong> You said you love it, and
        C is the only option that treats it that way. It costs 26px more than now, which is real
        but survivable. If it were not for the phone I would probably choose C.</p>
      <p><strong>E is the most useful and the least exciting.</strong> 105px back is 12% of the
        screen and you can see it working: two more doors come into view. If the menu should feel
        like an app rather than a title screen, this is the answer.</p>
      <p><strong>D is the risk.</strong> It is the boldest and the least document-like, and it is
        also the only one that deletes the thing you said you love. I would not ship it without you
        saying so explicitly.</p>
      <p>Worth flagging: whichever wins, <strong>the background watermark should probably be
        turned down or moved</strong>, because it is competing with the header in all five. That is
        a separate small change and I have not made it here.</p>
    </div>
  </section>

  <footer>
    Real headless screenshots at 390x844 and 1280x860, DPR 2, reduce-motion on. Variants are
    markup and CSS patched into index.html in flight by tools/head-shots.mjs; a patch that fails to
    match is a hard error, and the shooter now also refuses to save a frame where the header did
    not actually render, after a dead local server quietly produced five identical empty screens.
    Page built by tools/head3-artifact.py. Nothing merged: say a letter.
  </footer>
</div>'''

open(OUT, 'w').write(HTML)
print(OUT, str(round(len(HTML) / 1024)) + ' KB')

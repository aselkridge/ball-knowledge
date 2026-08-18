#!/usr/bin/env python3
"""The turn-clarity MOCKUP board (Aaron, 08-18: "Feels good let's see the
mockup"). Four phone frames drawn OVER a real screenshot of the live board,
so every new device is judged against the actual court and not a sketch.
Clearly labelled a mockup: the base photo is shipped pixels, the slam, dock,
strip and bark are drawn to spec on top.

His two rulings are already baked in: duplicate squad names get BLOCKED at
setup (frame five shows the block), and the dock's waiting state is the
quiet THEY'RE UP strip, not greyed buttons.
"""
import base64, io, os
from PIL import Image, ImageEnhance

FONTS = 'docs/play/assets/fonts'
OUT = 'design/turn-board.html'
BASE_SHOT = 'design/shots/defense/after-phone-horns-vs-man.png'


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


def img(im, q=82):
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, method=5)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


base = Image.open(BASE_SHOT).convert('RGB')
BRIGHT = img(base)
dim = ImageEnhance.Brightness(base).enhance(0.45)
dim = ImageEnhance.Color(dim).enhance(0.55)
DIM = img(dim)

HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Whose Turn Is It</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Sedgwick;src:url({font('sedgwick-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{
    --ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;
    --accent:#b8560c;--good:#2f6d4f;--bad:#a83a30;
    --oj:#f5872e;--bl:#58a8d6;
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
  .wrap{{max-width:1180px;margin:0 auto;padding:0 22px 96px;display:flex;flex-direction:column;gap:52px}}
  .eyebrow{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.15em;
    text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(38px,7vw,66px);line-height:.98;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(21px,3vw,27px);margin:0}}
  p{{margin:0}}
  .lede{{max-width:64ch;color:var(--dim);font-size:17.5px}}
  .lede strong{{color:var(--ink);font-weight:600}}
  header.top{{padding:60px 0 0;display:flex;flex-direction:column;gap:18px}}
  .mockchip{{align-self:flex-start;font-family:'Space Mono',monospace;font-size:11px;
    letter-spacing:.18em;padding:4px 10px;border:1.5px dashed var(--accent);
    border-radius:3px;color:var(--accent)}}
  section{{display:flex;flex-direction:column;gap:22px}}

  .frames{{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}}
  @media (max-width:1020px){{.frames{{grid-template-columns:repeat(2,1fr)}}}}
  @media (max-width:560px){{.frames{{grid-template-columns:1fr}}}}
  figure{{margin:0;display:flex;flex-direction:column;gap:10px;min-width:0}}
  figcaption{{display:flex;flex-direction:column;gap:4px}}
  figcaption b{{font-family:Archivo,sans-serif;font-size:14px;color:var(--accent)}}
  figcaption span{{font-size:13px;color:var(--dim);line-height:1.5}}
  .phone{{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line);
    aspect-ratio:390/844;background:#000}}
  .phone>img.base{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}}

  /* THE SLAM · the game's own slam voice (Sedgwick), team colour */
  .slam{{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%) rotate(-5deg);
    font-family:Sedgwick,Anton,Impact,sans-serif;font-size:13cqw;white-space:nowrap;
    color:#fff5e2;text-shadow:3px 3px 0 #7a3a08,0 0 24px rgba(245,135,46,.75),0 8px 22px rgba(0,0,0,.6);
    z-index:5}}
  .slam small{{display:block;text-align:center;font-family:Archivo,sans-serif;
    font-size:3.6cqw;letter-spacing:.3em;margin-top:2cqw;color:#ffd9ae;text-shadow:0 2px 8px rgba(0,0,0,.8)}}
  .slam.blue{{color:#eaf6ff;text-shadow:3px 3px 0 #14425c,0 0 24px rgba(88,168,214,.8),0 8px 22px rgba(0,0,0,.6)}}
  .slam.blue small{{color:#bfe2f7}}
  .phone{{container-type:inline-size}}

  /* THE DOCK · the player menu as the turn's home, bottom, thumb country */
  .dock{{position:absolute;left:2.5%;right:2.5%;bottom:2%;z-index:4;
    display:flex;flex-direction:column;gap:1.6cqw;
    background:rgba(18,13,9,.94);border:1px solid #4a3f31;border-radius:3.5cqw;
    padding:2.6cqw;box-shadow:0 -8px 30px rgba(0,0,0,.55)}}
  .dock.mine{{border-color:rgba(245,135,46,.65);box-shadow:0 0 0 1px rgba(245,135,46,.4),0 -8px 30px rgba(0,0,0,.55)}}
  .tray{{display:flex;gap:1cqw;justify-content:space-between;font-family:'Space Mono',monospace;
    font-size:2.5cqw;letter-spacing:.08em;color:#8d7f6c;padding:0 1cqw 1cqw}}
  .tray i{{font-style:normal}}
  .tray i.done{{text-decoration:line-through;opacity:.5}}
  .tray i.now{{color:#ffcf6a;font-weight:700}}
  .row{{display:flex;align-items:baseline;gap:2.4cqw;background:#241b12;border:1px solid #3c3125;
    border-radius:2.4cqw;padding:2.6cqw 3.2cqw}}
  .row b{{font-family:Anton,Impact,sans-serif;font-weight:400;letter-spacing:.04em;
    font-size:4.4cqw;color:#fff0da}}
  .row span{{font-size:3cqw;color:#a3937f}}
  .row .price{{margin-left:auto;font-family:'Space Mono',monospace;font-size:2.9cqw;font-weight:700}}
  .price.easy{{color:#6fbf73}}.price.med{{color:#e8b84b}}.price.hard{{color:#d5524b}}

  /* THEIR TURN · the quiet strip (his ruling), and the world dims */
  .strip{{position:absolute;left:2.5%;right:2.5%;bottom:2%;z-index:4;
    display:flex;align-items:center;gap:3cqw;justify-content:center;
    background:rgba(18,13,9,.9);border:1px solid #33291f;border-radius:3.5cqw;
    padding:3.4cqw;font-family:Archivo,sans-serif;font-size:3.6cqw;
    letter-spacing:.22em;color:#8d7f6c}}
  .strip .dot{{width:2cqw;height:2cqw;border-radius:50%;background:var(--bl);
    box-shadow:0 0 8px var(--bl)}}
  .bark{{position:absolute;right:4%;top:20%;z-index:5;max-width:62%;
    background:#eaf6ff;color:#14283a;border-radius:3.5cqw 3.5cqw 1cqw 3.5cqw;
    padding:2.8cqw 3.6cqw;font-family:Archivo,sans-serif;font-weight:600;font-size:3.8cqw;
    box-shadow:0 6px 18px rgba(0,0,0,.5)}}
  .bark small{{display:block;font-family:'Space Mono',monospace;font-weight:400;
    font-size:2.4cqw;letter-spacing:.14em;color:#4a6a84;margin-top:1cqw}}

  /* the name-taken block, a setup-screen card */
  .block{{max-width:420px;background:var(--raised);border:1px solid var(--line);border-radius:4px;
    padding:22px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow)}}
  .block .lbl{{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.2em;color:var(--dim)}}
  .block .input{{display:flex;align-items:center;gap:10px;border:1.5px solid var(--bad);
    border-radius:6px;padding:12px 14px;font-family:Anton,Impact,sans-serif;font-size:20px;
    letter-spacing:.03em}}
  .block .err{{color:var(--bad);font-size:14px;font-weight:600;font-family:Archivo,sans-serif}}
  .block .hint{{color:var(--dim);font-size:13.5px}}

  .notes{{background:var(--raised);border:1px solid var(--line);border-radius:4px;
    padding:20px 22px;display:flex;flex-direction:column;gap:9px;box-shadow:var(--shadow)}}
  .notes p{{color:var(--dim);max-width:76ch;font-size:15px}}
  .notes p strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:20px;line-height:1.7}}
  @media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · turn clarity · 18 August</p>
    <h1>Whose turn<br>is it</h1>
    <p class="mockchip">MOCKUP · the court photo is real, everything drawn on it is proposed</p>
    <p class="lede">Four moments from one possession against the CPU. The rule underneath
      all four: <strong>it is your turn exactly when your buttons exist.</strong> The slam
      announces the change once; the dock at the bottom IS the state you can check any
      time; and when it is not your turn, the world dims and a quiet strip holds the
      space where your buttons will come back.</p>
  </header>

  <section>
    <div class="frames">
      <figure>
        <div class="phone">
          <img class="base" src="{BRIGHT}" alt="the live board">
          <div class="slam">YOUR TURN<small>ORANGE BALL</small></div>
          <div class="dock mine" style="opacity:.55;transform:translateY(18%)">
            <div class="row"><b>SHOOT</b><span>corner three</span><span class="price med">MEDIUM · 3</span></div>
            <div class="row"><b>PASS</b><span>2 open · 1 covered</span></div>
          </div>
        </div>
        <figcaption><b>1 · The handoff</b>
          <span>Possession flips, the slam hits once in your colour and leaves, and the
          dock rises behind it. Against the CPU it always says YOUR TURN, never a team
          name. Slams only fire when the ball changes hands, not on every beat.</span>
        </figcaption>
      </figure>

      <figure>
        <div class="phone">
          <img class="base" src="{BRIGHT}" alt="the live board, your turn">
          <div class="dock mine">
            <div class="tray">
              <i class="done">SETUPS</i><i class="done">BALL IN</i><i class="done">SLIDE</i><i class="now">▶ ACTION</i>
            </div>
            <div class="row"><b>SHOOT</b><span>corner three</span><span class="price med">MEDIUM · 3</span></div>
            <div class="row"><b>PASS</b><span>2 open · 1 covered</span></div>
            <div class="row"><b>MOVE</b><span>the tile's colour is its price</span><span class="price easy">FROM EASY</span></div>
          </div>
        </div>
        <figcaption><b>2 · Your turn, any moment</b>
          <span>The dock is the menu you already picked, promoted to the game's permanent
          bottom surface with the tray riding on top. Glance down at any point in the
          game: buttons there means you are up, and the tray says where in the turn you
          are.</span>
        </figcaption>
      </figure>

      <figure>
        <div class="phone">
          <img class="base" src="{DIM}" alt="the board, dimmed while they play">
          <div class="bark">You scared!?<small>THE MACHINE</small></div>
          <div class="strip"><span class="dot"></span> THEY'RE UP</div>
        </div>
        <figcaption><b>3 · Their turn</b>
          <span>The whole world drops to about half brightness, your buttons are gone,
          and the strip holds their place. That is three signals saying one thing. The
          bark is the trash talk you asked for: canned lines on real moments, with an
          off switch in settings.</span>
        </figcaption>
      </figure>

      <figure>
        <div class="phone">
          <img class="base" src="{BRIGHT}" alt="the live board, hot seat handoff">
          <div class="slam blue">MAD DOGS<small>YOU'RE UP · PASS THE PHONE</small></div>
          <div class="strip" style="border-color:rgba(88,168,214,.5)"><span class="dot"></span> MAD DOGS BALL</div>
        </div>
        <figcaption><b>4 · Same phone, two humans</b>
          <span>"You" is ambiguous when two people share a phone, so the slam speaks the
          squad name in the squad's colour instead. This works because duplicate names
          are now blocked at setup, your ruling, shown below.</span>
        </figcaption>
      </figure>
    </div>
  </section>

  <section>
    <h2>The name block, at setup</h2>
    <div class="block">
      <div class="lbl">SQUAD NAME</div>
      <div class="input">THE VALLEY</div>
      <div class="err">Taken. The other squad got here first.</div>
      <div class="hint">Both squads were named The Valley in your screenshot, and every
        whose-turn message in the game names teams, so they all went blank at once. The
        second player picks a different name before the game will start.</div>
    </div>
  </section>

  <section>
    <h2>What this replaces, and what it keeps</h2>
    <div class="notes">
      <p><strong>Replaced:</strong> the small turn chip in the top banner and the
        court-edge glow. Both shipped, and you played straight past them, which is the
        only verdict that counts. The banner itself stays for play-by-play; it just
        stops being the only place the turn lives.</p>
      <p><strong>Kept and promoted:</strong> the tray and the menu you already ruled in.
        They come out from behind the old prototype switch and become the game's one
        bottom surface, in every game, since their method is now the game.</p>
      <p><strong>The dimming does real work:</strong> it is the one signal that reads
        from across the room, it cannot be missed on any court art, and it makes the
        bright moment when your buttons return feel like the ball arriving.</p>
      <p><strong>Cost worth naming:</strong> the dock stands roughly as tall as three
        answer buttons. It earns the space by being the controls, not decoration, and
        it collapses while a card is up so it never fights the question.</p>
    </div>
  </section>

  <footer>
    Mockup, not shipped pixels: the base photo is the real board from the one-defense
    shoot; the slam, dock, strip, bark and name block are drawn to spec on top.
    Slam voice: Sedgwick, the game's own slam face. Dock rows mirror the real player
    menu's shape and pricing language.<br>
    On your go: build lands as B17 with a real before/after comparison, the CPU barks
    behind their off switch, and checks on all of it.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
print(f'wrote {OUT}  {os.path.getsize(OUT) // 1024} KB')

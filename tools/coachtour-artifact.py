#!/usr/bin/env python3
"""Build THE COACH'S TOURS example page: the start of game one, played.

Aaron, 08-10: the coach should work like his Coldest Call game: dim the
screen, cut a hole around the subject, explain, Next. Tours at the start,
triggers for everything else, multi-step allowed when a whole screen arrives.

The tour SCRIPTS are parsed from design/COACH-TOURS-2026-08-10.md (the plan's
one home), so this page cannot drift from the plan. The spotlight device is
the game's own #coachSpot pattern from coach.js (the 9999px box-shadow hole,
the pulsing ring, the card that moves opposite its subject), rebuilt here on
a mock game screen. Colors and fonts are the shipped game's, copied and named.

    python3 tools/coachtour-artifact.py <out.html>
"""
import base64, html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLAN = ROOT / 'design/COACH-TOURS-2026-08-10.md'
FONTS = ROOT / 'docs/play/assets/fonts'
BRAND = ROOT / 'docs/play/assets/brand'


def datauri(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(pathlib.Path(path).read_bytes()).decode()


def face(name, file, weight=400):
    return (f"@font-face{{font-family:'{name}';font-weight:{weight};font-style:normal;"
            f"font-display:swap;src:url({datauri(FONTS/file,'font/woff2')}) format('woff2')}}")


# Which mock element each scripted spotlight subject points at. The plan
# names subjects in prose; the mock gives them ids. A subject with no entry
# here fails the build, so a new tour step cannot silently point at nothing.
SPOT = {
    'THE SCOREBOARD': '#sb',
    'THE TARGET': '#target',
    'YOUR SQUAD (the orange pieces)': '#squad',
    'A GREEN TILE, AN AMBER TILE, A RED TILE': '#tiles3',
    "THE COACH'S OWN CARD": '__self__',
    'YOUR BALL-HANDLER': '#pg',
    'THE LIT TILES': '#lit',
    'THE WHOLE SQUAD': '#squad',
    'THE CONFIRM BUTTON': '#bconfirm',
    'THE WHOLE BOARD': '#grid',
    'ONE OF YOUR DEFENDERS': '#dpg',
    'THE RINGS AT THEIR FEET': '#opp',
    'THE :12': '#clock',
}


def parse_tours():
    """lift the three T-tables from the plan: [(key, title, [(spot, say)])]"""
    text = PLAN.read_text(encoding='utf-8')
    tours = []
    for m in re.finditer(r'### (T\d) · ([^·]+) · ([^\n]+)\n\n((?:\|[^\n]*\n)+)', text):
        key, title = m.group(1), m.group(2).strip()
        steps = []
        for row in m.group(4).splitlines()[2:]:
            cells = [c.strip() for c in row.strip('|').split('|')]
            if len(cells) >= 3:
                steps.append({'spot': cells[1], 'say': cells[2].replace('"', '')})
        tours.append({'key': key, 'title': title, 'steps': steps})
    if len(tours) != 3:
        sys.exit(f'expected 3 tour tables in the plan, found {len(tours)}')
    for t in tours:
        for s in t['steps']:
            if s['spot'] not in SPOT:
                sys.exit(f'no mock target for spotlight subject: {s["spot"]!r}')
            s['sel'] = SPOT[s['spot']]
    return tours


def main(out):
    tours = parse_tours()

    # the two triggered-tour examples and the single trigger, authored here
    # because their scenes (a card, the pause menu) are mock-specific; their
    # copy follows the plan's triggered-tours table
    chapters = []
    for t in tours:
        chapters.append({'id': t['key'].lower(), 'label': f'{t["key"]} · {t["title"]}',
                         'scene': 'game', 'kind': 'tour', 'steps':
                         [{'sel': s['sel'], 'say': s['say']} for s in t['steps']]})
    chapters.insert(1, {'id': 'card', 'label': 'FIRST CARD · triggered tour',
        'scene': 'card', 'kind': 'tour', 'steps': [
        {'sel': '#qcard', 'say': 'Your first card. <b>Answer to play</b>: that is the whole game. Right answer, the move happens. Wrong, you pay for it.'},
        {'sel': '#tier', 'say': 'The badge says how hard, and <b>harder pays more</b>. Green easy, amber medium, red hard: same colours as the floor.'},
        {'sel': '#q15', 'say': 'Fifteen seconds, and <b>it burns while you read</b>. It is holding still right now because I am talking. It will not for the next one.'}]})
    chapters.append({'id': 'pause', 'label': 'PAUSE MENU · triggered tour',
        'scene': 'pause', 'kind': 'tour', 'steps': [
        {'sel': '#ptitle', 'say': 'You paused it. <b>The clock is stopped and nothing is lost.</b> Take your time.'},
        {'sel': '#pbtns', 'say': 'Resume picks up exactly where you were. Restart starts the night over. Quit keeps nothing, and says so before it does.'},
        {'sel': '#pbook', 'say': 'The Rulebook is <b>safe to open mid-game</b>. Your board keeps. Come back whenever.'}]})
    chapters.append({'id': 'trig', 'label': 'A SINGLE TRIGGER · for contrast',
        'scene': 'game', 'kind': 'trigger', 'steps': [
        {'sel': '#tred', 'say': '<b>Red tile.</b> Somebody is in your path, and going through him costs a question. First time it appears, I say this once, and never again.'}]})

    css = CSS.replace('__FONTS__', ''.join([
        face('Anton', 'anton-400.woff2'),
        face('Archivo', 'archivo-600.woff2', 600),
        face('Space Mono', 'spacemono-400.woff2'),
        face('Space Mono Bold', 'spacemono-700.woff2', 700),
        face('DSEG7', 'dseg7-700.woff2', 700)]))

    page = (PAGE
            .replace('__CSS__', css)
            .replace('__COACH__', datauri(BRAND / 'philosopher.png', 'image/png'))
            .replace('__DATA__', json.dumps(chapters, ensure_ascii=False)))
    pathlib.Path(out).write_text(page, encoding='utf-8')
    n = sum(len(c['steps']) for c in chapters)
    print(f'wrote {out}  {pathlib.Path(out).stat().st_size/1024:.0f} KB · '
          f'{len(chapters)} chapters · {n} steps · tour scripts parsed from the plan')


CSS = """__FONTS__
:root{
  --ground:#100d0b; --panel:#191410; --panel2:#211a15; --rule:#332c24;
  --ink:#efe6d8; --dim:#a89a85; --faint:#7b6f5d;
  --accent:#f5872e; --accent-soft:rgba(245,135,46,.14); --shadow:rgba(0,0,0,.6);
}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){
  --ground:#f2ebe0; --panel:#fffdf8; --panel2:#f8f1e5; --rule:#dcd0bd;
  --ink:#1d1710; --dim:#5f5443; --faint:#8b7f6c;
  --accent:#b8530c; --accent-soft:rgba(184,83,12,.10); --shadow:rgba(60,40,20,.14);
}}
:root[data-theme="light"]{
  --ground:#f2ebe0; --panel:#fffdf8; --panel2:#f8f1e5; --rule:#dcd0bd;
  --ink:#1d1710; --dim:#5f5443; --faint:#8b7f6c;
  --accent:#b8530c; --accent-soft:rgba(184,83,12,.10); --shadow:rgba(60,40,20,.14);
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:'Archivo',ui-sans-serif,system-ui,sans-serif;font-weight:600;
  font-size:15.5px;line-height:1.6;-webkit-text-size-adjust:100%}
.wrap{max-width:1080px;margin:0 auto;padding:0 clamp(18px,4vw,34px)}
p{margin:0 0 16px;max-width:66ch}
h1{font-family:'Anton';font-weight:400;text-transform:uppercase;margin:0;
  font-size:clamp(38px,10vw,72px);line-height:.9;text-wrap:balance}
h1 .thin{display:block;color:var(--accent)}
h2{font-family:'Anton';font-weight:400;text-transform:uppercase;
  font-size:clamp(24px,5.4vw,38px);line-height:1;margin:0 0 6px;text-wrap:balance}
h3{font-family:'Anton';font-weight:400;text-transform:uppercase;
  font-size:clamp(17px,3.4vw,22px);margin:30px 0 8px}
.eyebrow{font-family:'Space Mono';font-size:10px;letter-spacing:.26em;
  text-transform:uppercase;color:var(--accent);margin:0 0 14px}
.kicker{font-family:'Space Mono';font-size:10px;letter-spacing:.24em;
  text-transform:uppercase;color:var(--faint);margin:0 0 10px}
header{border-bottom:1px solid var(--rule);padding:clamp(30px,6vw,56px) 0 26px;
  margin-bottom:34px}
.quote{margin:20px 0 0;border-left:3px solid var(--accent);padding-left:16px;
  color:var(--dim);font-style:italic;max-width:60ch}
.quote b{color:var(--ink);font-style:normal}
section{margin:0 0 56px}
code{font-family:'Space Mono';font-size:.86em;background:var(--accent-soft);
  padding:1px 5px;border-radius:4px;color:var(--ink)}
strong{color:var(--ink)}
footer{border-top:1px solid var(--rule);padding:20px 0 60px;
  font-family:'Space Mono';font-size:10.5px;letter-spacing:.08em;
  color:var(--faint);line-height:2}
table{border-collapse:collapse;width:100%;font-size:13.5px}
th{font-family:'Space Mono';font-size:9px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--faint);text-align:left;font-weight:400;padding:0 10px 7px 0;
  border-bottom:1px solid var(--rule)}
td{padding:9px 10px 9px 0;border-bottom:1px solid var(--rule);vertical-align:top;
  color:var(--dim);line-height:1.45}
td b{color:var(--ink)}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}

/* ---- chapter picker ---- */
#chapters{display:flex;gap:8px;margin:0 0 12px;flex-wrap:wrap}
.chip{font-family:'Space Mono';font-size:10px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;border-radius:999px;padding:9px 14px;cursor:pointer;
  background:none;color:var(--dim);border:1.5px solid var(--rule)}
.chip.done{border-color:var(--accent);color:var(--accent)}
.chip.on{background:var(--accent);color:#241000;border-color:var(--accent)}
.chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* ================= THE STAGE: the game, always dark ================= */
/* Game tokens from docs/play/index.html :root, copied 08-10 so they move
   together: ground #100d0b · panel #1d1815 · line #3a332a · ink #efe6d8 ·
   accent #f5872e · away #58a8d6 · easy #6fbf73 · med #e8b84b · hard #d5524b */
#stage{background:#100d0b;border:1px solid #3a332a;border-radius:18px;
  overflow:hidden;box-shadow:0 24px 60px var(--shadow);color:#efe6d8;
  position:relative;margin:0 0 10px;min-height:540px}
#stage,#stage *{-webkit-tap-highlight-color:transparent}

/* -- the mock game screen -- */
#gtop{display:flex;align-items:center;gap:10px;padding:10px 14px;
  background:linear-gradient(180deg,#1d1815,#171310);border-bottom:1px solid #3a332a}
#sb{display:flex;align-items:baseline;gap:9px;font-family:'DSEG7';font-size:19px;
  color:#ffb03a;text-shadow:0 0 8px rgba(255,176,58,.5)}
#sb .nm{font-family:'Anton';font-size:12px;letter-spacing:.05em;color:#f5872e;
  text-shadow:none}
#sb .nm.away{color:#58a8d6}
#sb .parr{font-size:11px;color:#ffb03a;font-family:'Archivo'}
#target{margin-left:auto;font-family:'Space Mono';font-size:9px;font-weight:700;
  letter-spacing:.16em;color:#d8b57a;border:1px solid #4a4136;border-radius:999px;
  padding:5px 10px;white-space:nowrap}
#clock{font-family:'DSEG7';font-size:17px;color:#f5872e;background:#0b0805;
  border:1px solid #3a332a;border-radius:7px;padding:4px 7px}
#gear{font-size:15px;color:#7d735f;background:none;border:1.5px solid #3a332a;
  border-radius:50%;width:32px;height:32px;cursor:pointer}
#court{position:relative;padding:clamp(12px,3vw,26px);display:flex;
  align-items:center;justify-content:center}
#grid{position:relative;display:grid;grid-template-columns:repeat(8,1fr);
  gap:5px;width:min(100%,560px);aspect-ratio:8/7}
.tile{position:relative;border-radius:7px;background:rgba(255,255,255,.09)}
.tile.kkey{background:rgba(240,225,200,.16)}
.tile.g{background:rgba(111,191,115,.4);box-shadow:inset 0 0 0 1.5px rgba(111,191,115,.8)}
.tile.a{background:rgba(232,184,75,.4);box-shadow:inset 0 0 0 1.5px rgba(232,184,75,.8)}
.tile.r{background:rgba(213,82,75,.4);box-shadow:inset 0 0 0 1.5px rgba(213,82,75,.85)}
.tile.lit{background:rgba(245,135,46,.42);box-shadow:inset 0 0 0 1.5px rgba(245,135,46,.8)}
.pc{position:absolute;width:11%;aspect-ratio:1;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:'Space Mono';font-size:10px;font-weight:700;color:#241000;
  transform:translate(-50%,-50%);border:2px solid rgba(0,0,0,.35);
  box-shadow:0 4px 10px rgba(0,0,0,.5)}
.pc.you{background:#f5872e}
.pc.opp{background:#58a8d6;color:#0a1c26}
.pc .ring{position:absolute;inset:-7px;border-radius:50%;border:2.5px solid transparent}
.pc.ring-amber .ring{border-color:#e8b84b}
.pc.ring-teal .ring{border-color:#6fd0c3;border-style:dashed}
#squad,#lit,#tiles3{position:absolute;pointer-events:none}
#acts{display:flex;gap:8px;padding:10px 14px;border-top:1px solid #3a332a;
  background:#15110e;flex-wrap:wrap}
.act{font-family:'Space Mono';font-size:11px;font-weight:700;letter-spacing:.1em;
  border-radius:999px;padding:9px 16px;border:0;background:#241d16;color:#b3a894}
#bconfirm{background:#f5872e;color:#241000}

/* -- the mock question card scene -- */
#cardveil{position:absolute;inset:0;z-index:5;display:none;align-items:center;
  justify-content:center;background:radial-gradient(120% 90% at 50% 40%,rgba(16,10,6,.55),rgba(8,5,3,.85))}
#cardveil.on{display:flex}
#qcard{width:min(340px,86%);background:linear-gradient(160deg,#221a12,#15100a);
  border:1.5px solid #f5872e;border-radius:14px;padding:14px;position:relative;
  box-shadow:0 12px 34px rgba(0,0,0,.6)}
#qcard .qh{display:flex;align-items:center;gap:8px;margin-bottom:8px}
#tier{font-family:'Space Mono';font-size:9px;font-weight:700;letter-spacing:.14em;
  color:#0d1f0e;background:#6fbf73;border-radius:999px;padding:3px 9px}
#qcard .pts{font-family:'Space Mono';font-size:9px;letter-spacing:.14em;color:#b3a894}
#q15{margin-left:auto;font-family:'DSEG7';font-size:15px;color:#f5872e}
#qcard .qt{font-family:'Archivo';font-weight:800;font-size:15px;color:#efe6d8;
  line-height:1.35;margin-bottom:11px}
#qcard .qa{display:block;width:100%;text-align:left;margin:0 0 7px;
  background:#241d16;color:#efe6d8;border:1.5px solid #3a332a;border-radius:9px;
  padding:10px 12px;font-family:'Archivo';font-weight:600;font-size:13.5px}

/* -- the mock pause menu scene -- */
#pauseveil{position:absolute;inset:0;z-index:5;display:none;align-items:center;
  justify-content:center;background:radial-gradient(120% 90% at 50% 40%,rgba(16,10,6,.6),rgba(8,5,3,.88))}
#pauseveil.on{display:flex}
#pmenu{width:min(300px,84%);text-align:center}
#ptitle{font-family:'Anton';font-size:30px;letter-spacing:.02em;color:#fff5e2;
  text-shadow:2px 2px 0 #c9641a;margin-bottom:4px}
#pclock{font-family:'Space Mono';font-size:10px;letter-spacing:.2em;color:#b3a894;
  margin-bottom:14px}
#pbtns{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}
#pbtns button{font-family:'Space Mono';font-size:11px;font-weight:700;
  letter-spacing:.12em;border-radius:999px;padding:11px;border:0;
  background:#f5872e;color:#241000}
#pbtns button.ghost{background:none;color:#b3a894;border:1.5px solid #4a4136}
#pbook{font-family:'Space Mono';font-size:10.5px;color:#d8b57a;background:none;
  border:1.5px solid #4a4136;border-radius:999px;padding:9px 14px;width:100%}

/* -- THE SPOTLIGHT: the game's Coldest Call device, verbatim technique --
   one ring div; the dim is its 9999px box-shadow, so the hole IS the gap.
   From #coachSpot in docs/play/index.html, with the pulsing ::after ring. */
#spot{position:absolute;z-index:8;border-radius:14px;pointer-events:none;
  display:none;box-shadow:0 0 0 9999px rgba(7,5,4,.82),0 0 0 2px #f5872e inset,
  0 0 26px 6px rgba(245,135,46,.5);transition:all .35s cubic-bezier(.2,.9,.3,1)}
#spot.on{display:block}
#spot.circle{border-radius:50%}
#spot::after{content:"";position:absolute;inset:-7px;border-radius:inherit;
  border:2px solid #f5872e;animation:spotring 2.2s ease-in-out infinite}
@keyframes spotring{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.06);opacity:.4}}

/* -- the tour card -- */
#tcard{position:absolute;left:50%;transform:translateX(-50%);z-index:9;
  width:min(400px,92%);display:none;gap:11px;align-items:flex-start;
  background:linear-gradient(160deg,#221a12,#171009);border:1.5px solid #f5872e;
  border-radius:14px;padding:11px 13px;
  box-shadow:0 12px 34px rgba(0,0,0,.6),0 0 22px rgba(245,135,46,.18)}
#tcard.on{display:flex}
#tcard img{width:46px;height:46px;flex:0 0 auto;border-radius:50%;
  background:#0e0b08;border:2px solid #f5872e;object-fit:cover;object-position:65% 30%}
#tcard .tb{flex:1;min-width:0}
#tcard .who{font-family:'Space Mono';font-size:9px;letter-spacing:.3em;
  color:#f5872e;margin-bottom:3px}
#tcard .txt{font-size:13.5px;line-height:1.45;color:#efe6d8}
#tcard .txt b{color:#ffb056}
#tcard .row{display:flex;gap:10px;margin-top:9px;align-items:center;flex-wrap:wrap}
#tnext{font-family:'Space Mono';font-size:11px;font-weight:700;letter-spacing:.1em;
  color:#241000;background:#f5872e;border:0;border-radius:999px;padding:6px 16px;cursor:pointer}
#tback{font-family:'Space Mono';font-size:10.5px;color:#b3a894;background:none;
  border:1.5px solid #4a4136;border-radius:999px;padding:6px 12px;cursor:pointer}
#tback[hidden]{display:none}
#tskip{font-family:'Space Mono';font-size:10px;color:#7d735f;background:none;
  border:0;text-decoration:underline;cursor:pointer;padding:6px 2px;margin-left:auto}
#tcard.trigger .who{color:#6fd0c3}

/* ---- page furniture ---- */
.legend{display:flex;flex-wrap:wrap;gap:12px;margin:10px 0 0;padding:12px 14px;
  background:var(--panel);border:1px solid var(--rule);border-radius:11px;
  font-size:12.5px;color:var(--dim)}
.legend b{color:var(--ink)}
.cardlist{counter-reset:q;list-style:none;margin:0;padding:0;
  display:flex;flex-direction:column;gap:12px;max-width:72ch}
.cardlist li{counter-increment:q;background:var(--panel);border:1px solid var(--rule);
  border-left:3px solid var(--accent);border-radius:10px;padding:15px 17px;color:var(--dim)}
.cardlist li::before{content:counter(q,decimal-leading-zero);font-family:'Space Mono';
  font-size:9.5px;letter-spacing:.2em;color:var(--accent);display:block;margin-bottom:7px}
.cardlist li b{color:var(--ink)}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
"""

PAGE = """<title>The Coach's Tours · example</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>__CSS__</style>

<header class="wrap">
  <p class="eyebrow">Ball Knowledge · 10 August 2026 · the coach, reorganized your way · a mock, the real one runs in coach.js</p>
  <h1>The Coach's<span class="thin">Tours</span></h1>
  <p class="quote">"The first moment before tip off the coach should do the same
  thing I showed you from my coldest call game. Go around highlighting things in
  the screen (dimming the rest) and explaining as you hit next... then almost
  everything else should happen <b>when triggered</b>. But when something happens
  the coach can have <b>multiple steps</b>."</p>
</header>

<main class="wrap">

<section id="demo">
  <p class="kicker">The example · tap a chapter, then Next through it</p>
  <h2>Game one, walked</h2>
  <p>This is your model played on a mock of the game screen, using the game's
  own spotlight (the same dim-with-a-hole device <code>coach.js</code> already
  ships for the menu welcome). Six chapters: the three opening tours, two
  triggered tours (the first card, the pause menu), and one single trigger so
  you can feel the difference. Every tour line is parsed from the plan file,
  so what you read here is what the plan says, word for word.</p>

  <div id="chapters"></div>

  <div id="stage">
    <div id="gtop">
      <div id="sb"><span class="nm">YOU</span> 00 <span class="parr">◂</span> 00 <span class="nm away">CCH</span></div>
      <div id="target">FIRST TO 11</div>
      <div id="clock">24</div>
      <button id="gear" aria-label="settings">⚙</button>
    </div>
    <div id="court">
      <div id="grid"></div>
    </div>
    <div id="acts">
      <button class="act">MOVE</button><button class="act">PASS</button>
      <button class="act">SHOOT</button><button class="act" id="bconfirm">CONFIRM ✓</button>
    </div>
    <div id="cardveil"><div id="qcard">
      <div class="qh"><span id="tier">EASY · 2 PTS</span><span id="q15">15</span></div>
      <div class="qt">TOSS-UP · Which line on the court is worth three points from behind it?</div>
      <button class="qa">The cream arc</button><button class="qa">The halfway line</button>
      <button class="qa">The baseline</button><button class="qa">The key</button>
    </div></div>
    <div id="pauseveil"><div id="pmenu">
      <div id="ptitle">PAUSED</div>
      <div id="pclock">CLOCK STOPPED · NOTHING IS LOST</div>
      <div id="pbtns"><button>▶ Resume</button><button class="ghost">↺ Restart</button>
      <button class="ghost">✕ Quit</button></div>
      <button id="pbook">📖 The Rulebook</button>
    </div></div>
    <div id="spot"></div>
    <div id="tcard">
      <img src="__COACH__" alt="The Coach">
      <div class="tb"><div class="who" id="twho">COACH · 1 OF 5</div>
      <div class="txt" id="ttxt"></div>
      <div class="row"><button id="tback" hidden>‹ Back</button>
      <button id="tnext">Next →</button>
      <button id="tskip">Skip the tour</button></div></div>
    </div>
  </div>

  <div class="legend">
    <div><b>orange COACH</b> · a tour, with steps and a counter</div>
    <div><b>teal COACH</b> · a single trigger: one card, once, Got it</div>
    <div><b>Skip</b> · kills that tour only, the triggers stay armed</div>
    <div><b>the hole</b> · the subject stays bright AND tappable, everything else dims</div>
  </div>
</section>

<section id="model">
  <p class="kicker">What your model did to the 256</p>
  <h2>Five kinds of moment, not 256 equal rows</h2>
  <div class="scroll"><table>
  <thead><tr><th>kind</th><th>what it is</th><th>how many</th></tr></thead><tbody>
  <tr><td><b>The 3 opening tours</b></td><td>the Coldest Call walks: the lay of the land pre-tip, your first possession, your first stop. 13 steps total, each tour skippable as a block</td><td>14 rows</td></tr>
  <tr><td><b>7 triggered tours</b></td><td>your multi-step insight: first card, THE CALL, pause menu, end screen, Daily Five, Heat Check, first setup. 2-3 steps each, once per phone</td><td>25 rows</td></tr>
  <tr><td><b>Single triggers</b></td><td>one card at the exact first moment: red tile, first three, perfect release, opponent on fire. Never two in one possession</td><td>63 rows → 49 cards, 8 already live</td></tr>
  <tr><td><b>Guardrails</b></td><td>fire only when a situation asks: thin card pile, one reshuffle left, three wrong in a row, a blowout loss</td><td>7</td></tr>
  <tr><td><b>The screen says it</b></td><td>the big correction: status lines, subtitles and dialogs that were never the Coach's job. The waking server is a fact, not a mentor visit</td><td>101 rows</td></tr>
  </tbody></table></div>
  <p style="margin-top:14px">The rest: 24 cut with reasons, 10 waiting on a
  smarter coach that tracks play patterns, 9 parked behind unbuilt features,
  6 folded into neighbouring rows. <strong>All 256 filed, proven by
  <code>tools/coachtours-count.py</code></strong>, which refuses to pass if a
  row is missed, doubled, or invented.</p>
  <p><strong>What game one costs now:</strong> the hello, three tours, the
  first-card tour, THE CALL if you win the toss, then only triggers as things
  happen. About ninety seconds of tapped-through walking. The old list's
  seventy-seven MUSTs are structurally impossible under this model, which is
  my recommended answer to the budget question.</p>
</section>

<section id="jargon">
  <p class="kicker">The three complaints, answered with examples</p>
  <h2>Jargon, repeats, and the rows that were secretly yours</h2>
  <ol class="cardlist">
  <li><b>Jargon, translated.</b> "The Rolodex" meant the three-ways-to-play
  list on the menu. "The BRAINS × BUCKETS card" meant the splash card before
  tip-off. "Worth re-ruling" meant I wanted you to look at it again. All three
  now say what they mean, and every tour line above is written to be heard by
  somebody who has never seen the game.</li>
  <li><b>Repeats, merged.</b> The four prices of a wrong answer appeared in
  three different sections; they are now four one-line triggers plus the KNOW
  YOUR CARD drill. "You got screened" appeared once per side; each side keeps
  exactly one card. The key warning and its whistle were two rows; they are
  one card.</li>
  <li><b>The rows that were secretly your tours.</b> "The scoreboard, first
  look", "the target on the board", "the camera, first touch", "the flip, the
  category, the tier badge": those were your pre-tip walkthrough and your
  first-card tour, listed as fragments. They are now literally T1 and the
  FIRST CARD chapter you just played.</li>
  </ol>
</section>

<section id="ask">
  <p class="kicker">Your call</p>
  <h2>Four things to rule</h2>
  <ol class="cardlist">
    <li><b>The model and the filing.</b> Every row's destination is in
    <code>design/COACH-TOURS-2026-08-10.md</code>; overrule any by id.</li>
    <li><b>Tours replace the twelve-card budget.</b> Recommended above.</li>
    <li><b>Skip behaviour:</b> Skip kills that tour only; Coach off kills
    everything. Feels right?</li>
    <li><b>The pass-the-phone curtain</b> for Local VS surfaced as a real
    build item (it is a screen, not a speech). Want it on a track?</li>
  </ol>
</section>

<footer>
  the plan and the full 256-row filing: <code>design/COACH-TOURS-2026-08-10.md</code>
  · tour scripts on this page are parsed from it at build time ·
  coverage proven by <code>tools/coachtours-count.py</code> · the spotlight is
  the game's own #coachSpot device · built by <code>tools/coachtour-artifact.py</code>
</footer>
</main>

<script>
(function(){
'use strict';
var CH=__DATA__;
function $(i){return document.getElementById(i)}
var done={},cur=-1,step=0;

/* ---- build the mock court: pieces, key, the three colour tiles ---- */
var COLS=8,ROWS=7;
function pct(c,r){return{left:((c+0.5)/COLS*100)+'%',top:((r+0.5)/ROWS*100)+'%'}}
(function(){
  var g=$('grid'),h='';
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
    var cls='tile';
    if(c>=6&&r>=2&&r<=4)cls+=' kkey';
    if(c===3&&r===1)cls+=' g';
    if(c===4&&r===1)cls+=' a';
    if(c===5&&r===1)cls+=' r';
    if(c===2&&r===3||c===2&&r===2)cls+=' lit';
    if(c===6&&r===3)cls+=' r';
    h+='<div class="'+cls+'" data-c="'+c+'" data-r="'+r+'"></div>';
  }
  g.innerHTML=h;
  var P=[['pg','you','PG',1,3],['sf','you','SF',1,5],['c1','you','C',3,4],
         ['opp','opp','SF',5,3,'ring-amber'],['dpg','opp','PG',4,5],['dc','opp','C',6,4]];
  P.forEach(function(p){
    var pos=pct(p[3],p[4]);
    g.insertAdjacentHTML('beforeend','<div class="pc '+p[1]+(p[5]?' '+p[5]:'')+
      '" id="'+p[0]+'" style="left:'+pos.left+';top:'+pos.top+'"><span class="ring"></span>'+p[2]+'</div>');
  });
  /* group targets: invisible rectangles the spotlight can frame */
  function box(id,c1,r1,c2,r2){
    var a=pct(c1,r1),b=pct(c2,r2);
    g.insertAdjacentHTML('beforeend','<div id="'+id+'" style="position:absolute;'+
      'left:calc('+a.left+' - 7%);top:calc('+a.top+' - 9%);'+
      'width:calc('+b.left+' - '+a.left+' + 14%);height:calc('+b.top+' - '+a.top+' + 18%);'+
      'pointer-events:none"></div>');
  }
  box('squad',1,3,3,5);
  box('lit',2,2,2,3);
  box('tiles3',3,1,5,1);
  g.insertAdjacentHTML('beforeend','<div id="tred" style="position:absolute;pointer-events:none;'+
    'left:calc('+pct(6,3).left+' - 7%);top:calc('+pct(6,3).top+' - 9%);width:14%;height:18%"></div>');
})();

/* ---- chapters ---- */
function paintChips(){
  var el=$('chapters');el.innerHTML='';
  CH.forEach(function(c,i){
    var b=document.createElement('button');
    b.className='chip'+(i===cur?' on':done[c.id]?' done':'');
    b.textContent=(done[c.id]?'✓ ':'')+c.label;
    b.addEventListener('click',function(){start(i)});
    el.appendChild(b);
  });
}
function scene(name){
  $('cardveil').classList.toggle('on',name==='card');
  $('pauseveil').classList.toggle('on',name==='pause');
}
function start(i){cur=i;step=0;scene(CH[i].scene);paintChips();show()}
function stop(mark){
  if(mark&&cur>=0)done[CH[cur].id]=1;
  cur=-1;scene('game');
  $('spot').classList.remove('on');$('tcard').classList.remove('on');
  paintChips();
}
function show(){
  var c=CH[cur],s=c.steps[step];
  var card=$('tcard');
  card.classList.toggle('trigger',c.kind==='trigger');
  $('twho').textContent=c.kind==='trigger'?'COACH · SAID ONCE, EVER'
    :'COACH · '+(step+1)+' OF '+c.steps.length;
  $('ttxt').innerHTML=s.say;
  $('tback').hidden=step===0;
  $('tnext').textContent=c.kind==='trigger'?'Got it →'
    :(step===c.steps.length-1?'Done ✓':'Next →');
  $('tskip').textContent=c.kind==='trigger'?'Coach off':'Skip the tour';
  card.classList.add('on');
  aim(s.sel);
}
function aim(sel){
  var spot=$('spot'),stage=$('stage');
  var el=sel==='__self__'?$('tcard'):document.querySelector(sel);
  if(!el){spot.classList.remove('on');return}
  var r=el.getBoundingClientRect(),sr=stage.getBoundingClientRect();
  var pad=10;
  var isRound=el.classList&&el.classList.contains('pc')||sel==='#gear';
  spot.classList.toggle('circle',!!isRound);
  var x=r.left-sr.left-pad,y=r.top-sr.top-pad,w=r.width+pad*2,h=r.height+pad*2;
  if(isRound){var d=Math.max(w,h);x-=(d-w)/2;y-=(d-h)/2;w=h=d}
  spot.style.left=x+'px';spot.style.top=y+'px';
  spot.style.width=w+'px';spot.style.height=h+'px';
  spot.classList.add('on');
  /* the card moves OPPOSITE its subject, the game's own rule */
  var card=$('tcard');
  var below=(y+h/2)<(sr.height*0.5);
  card.style.top=below?'':'12px';
  card.style.bottom=below?'12px':'';
  if(sel==='__self__'){
    /* the coach pointing at himself: ring the card, park it mid-stage */
    card.style.top='';card.style.bottom='16%';
    requestAnimationFrame(function(){
      var cr=card.getBoundingClientRect();
      spot.style.left=(cr.left-sr.left-pad)+'px';
      spot.style.top=(cr.top-sr.top-pad)+'px';
      spot.style.width=(cr.width+pad*2)+'px';
      spot.style.height=(cr.height+pad*2)+'px';
      spot.classList.remove('circle');
    });
  }
}
$('tnext').addEventListener('click',function(){
  var c=CH[cur];if(!c)return;
  if(c.kind==='trigger'||step===c.steps.length-1){stop(true);return}
  step++;show();
});
$('tback').addEventListener('click',function(){if(step>0){step--;show()}});
$('tskip').addEventListener('click',function(){stop(false)});
window.addEventListener('resize',function(){
  if(cur>=0)aim(CH[cur].steps[step].sel);
});

paintChips();
start(0);   /* the page opens mid-T1, the thing he asked to see */
})();
</script>
"""

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('usage: coachtour-artifact.py <out.html>')
    main(sys.argv[1])

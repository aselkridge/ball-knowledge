#!/usr/bin/env python3
"""Build THE COACH'S TOURS page: every tour, walked on a mock of its screen.

Aaron, 08-10: the coach should work like his Coldest Call game: dim the
screen, cut a hole around the subject, explain, Next. Tours at the start,
triggers for everything else, multi-step allowed when a whole screen arrives.
Second batch, same day: "give me a list of all the tours and feel free to
give me visuals of those as you did earlier. For the rest of the one offs
you can just give me the list."

EVERY tour script and EVERY one-off row is parsed from
design/COACH-TOURS-2026-08-10.md (the plan's one home), so this page cannot
drift from the plan. The spotlight device is the game's own #coachSpot
pattern from coach.js (the 9999px box-shadow hole, the pulsing ring, the
card that moves opposite its subject), rebuilt on mock screens. Colors and
fonts are the shipped game's, copied and named.

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
# names subjects in prose; the mocks give them ids. A subject with no entry
# here fails the build, so a new tour step cannot silently point at nothing.
SPOT = {
    # the game screen
    'THE SCOREBOARD': '#sb',
    'THE TARGET': '#target',
    'YOUR SQUAD (the orange pieces)': '#squad',
    'A GREEN TILE, AN AMBER TILE, A RED TILE': '#tiles3',
    "THE COACH'S OWN CARD": '__self__',
    'YOUR BALL-HANDLER': '#pg',
    'THE LIT TILES': '#lit',
    'YOUR OTHER FOUR': '#squad',
    'THE CONFIRM BUTTON': '#bconfirm',
    'THE FULL FLOOR': '#grid',
    'ONE OF YOUR DEFENDERS': '#dpg',
    'THE RINGS AT THEIR FEET': '#rings',
    'THE :12': '#clock',
    # the question card
    'THE CARD': '#qcard',
    'THE TIER BADGE': '#tier',
    'THE :15': '#q15',
    # THE CALL
    'THE HEADLINE': '#cwon',
    'THE TWO PRIZES': '#cprizes',
    # the pause menu
    'THE PAUSED TITLE': '#ptitle',
    'THE THREE BUTTONS': '#pbtns',
    'THE RULEBOOK BUTTON': '#pbook',
    # the end screen
    'THE FINAL SCORE': '#escore',
    'THE FINAL LINE': '#eline',
    'THE TWO BUTTONS': '#ebtns',
    # the Daily Five
    'THE HEADER': '#dhead',
    'THE RACK': '#drack',
    'THE CLOCK': '#dclock',
    # the Heat Check
    'THE MYSTERY CARD': '#hclues',
    'THE GUESS BOX': '#hguess',
    # setup
    'THE STEP COUNTER': '#sstep',
    'THE SQUAD CARDS': '#ssquad',
    'THE HOUSE RULES': '#srules',
    # the main menu
    'THE DAILY FIVE STAMP': '#mstamp',
    'THE GYM TILE': '#mgym',
    'THE PLAY ROW': '#mplay',
    'THE GEAR': '#mgear',
    # the gym
    'THE ROOM': '#gyroom',
    'THE STATIONS': '#gystations',
    'THE RULEBOOK STATION': '#gybook',
}

# which mock scene each tour plays on, and the chip label where the plan's
# title alone would read unclear on a button
SCENE = {'T1': 'game', 'T2': 'game', 'T3': 'game',
         'TT:MENU': 'menu', 'TT:SETUP': 'setup', 'TT:FIRST-CARD': 'card',
         'TT:THE-CALL': 'call', 'TT:PAUSE': 'pause', 'TT:END': 'end',
         'TT:DAILY': 'daily', 'TT:HEAT-CHECK': 'heat', 'TT:GYM': 'gym'}
LABEL = {'TT:MENU': 'THE MAIN MENU', 'TT:GYM': 'THE GYM'}
# a first session's chronology, which is the order the chips read in
ORDER = ['TT:MENU', 'TT:SETUP', 'T1', 'TT:FIRST-CARD', 'TT:THE-CALL',
         'T2', 'T3', 'TT:PAUSE', 'TT:END', 'TT:DAILY', 'TT:HEAT-CHECK',
         'TT:GYM']


def parse_tours(text):
    """lift every tour script table: {key: {title, when, steps:[{spot,say}]}}"""
    tours = {}
    for m in re.finditer(r'^### (T\d|TT:[A-Z-]+) · ([^\n]+)\n\n((?:\|[^\n]*\n)+)',
                         text, re.M):
        key = m.group(1)
        bits = [b.strip() for b in m.group(2).split('·')]
        title, when = bits[0], '·'.join(bits[1:-1]).strip() if len(bits) > 2 else ''
        steps = []
        for row in m.group(3).splitlines()[2:]:
            cells = [c.strip() for c in row.strip('|').split('|')]
            if len(cells) >= 3:
                steps.append({'spot': cells[1], 'say': cells[2].replace('"', '')})
        tours[key] = {'title': title, 'when': when, 'steps': steps}
    missing = [k for k in ORDER if k not in tours]
    if missing:
        sys.exit(f'tour tables missing from the plan: {missing}')
    for k, t in tours.items():
        for s in t['steps']:
            if s['spot'] not in SPOT:
                sys.exit(f'no mock target for spotlight subject: {s["spot"]!r} ({k})')
            s['sel'] = SPOT[s['spot']]
    return tours


def parse_oneoffs(text):
    """every TRIG and GUARD line from the filing tables: the one-off list"""
    trigs, guards = [], []
    for line in text.splitlines():
        m = re.match(r'^\| (CM-[^|]+) \| ([^|]+) \| ([^|]*) \|', line)
        if not m:
            continue
        ids, verdict, note = (x.strip() for x in m.groups())
        if ids.startswith('CM-EXIST'):
            continue   # aliases of body rows; counting both doubles them
        head = verdict.split('·')[0].strip()
        if head == 'TRIG':
            trigs.append({'id': ids, 'live': 'live' in verdict, 'note': note})
        elif head == 'GUARD':
            guards.append({'id': ids, 'note': note})
    if not trigs or not guards:
        sys.exit('one-off parse came back empty; the filing tables moved?')
    return trigs, guards


def main(out):
    text = PLAN.read_text(encoding='utf-8')
    tours = parse_tours(text)
    trigs, guards = parse_oneoffs(text)

    chapters = []
    for k in ORDER:
        t = tours[k]
        label = (f'{k} · {t["title"]}' if k.startswith('T') and ':' not in k
                 else LABEL.get(k, t['title']))
        chapters.append({'id': k.replace('TT:', 'tt-').lower(), 'label': label,
                         'scene': SCENE[k], 'kind': 'tour',
                         'steps': [{'sel': s['sel'], 'say': s['say']} for s in t['steps']]})
    chapters.append({'id': 'trig', 'label': 'A SINGLE TRIGGER · for contrast',
        'scene': 'game', 'kind': 'trigger', 'steps': [
        {'sel': '#tred', 'say': '<b>Red tile.</b> Somebody is in your path, and going through him costs a question. First time it appears, I say this once, and never again.'}]})

    def li(rows, live_tag):
        out_rows = []
        for r in rows:
            tag = ' <span class="live">LIVE</span>' if live_tag and r.get('live') else ''
            out_rows.append(f'<li><b>{html.escape(r["id"])}</b>{tag} · '
                            f'{html.escape(r["note"])}</li>')
        return '\n'.join(out_rows)

    css = CSS.replace('__FONTS__', ''.join([
        face('Anton', 'anton-400.woff2'),
        face('Archivo', 'archivo-600.woff2', 600),
        face('Space Mono', 'spacemono-400.woff2'),
        face('Space Mono Bold', 'spacemono-700.woff2', 700),
        face('DSEG7', 'dseg7-700.woff2', 700)]))

    page = (PAGE
            .replace('__CSS__', css)
            .replace('__COACH__', datauri(BRAND / 'philosopher.png', 'image/png'))
            .replace('__NTRIG__', str(len(trigs)))
            .replace('__NGUARD__', str(len(guards)))
            .replace('__TRIGLIST__', li(trigs, True))
            .replace('__GUARDLIST__', li(guards, False))
            .replace('__DATA__', json.dumps(chapters, ensure_ascii=False)))
    pathlib.Path(out).write_text(page, encoding='utf-8')
    n = sum(len(c['steps']) for c in chapters)
    print(f'wrote {out}  {pathlib.Path(out).stat().st_size/1024:.0f} KB · '
          f'{len(chapters)} chapters · {n} steps · {len(trigs)} triggers · '
          f'{len(guards)} guardrails · all parsed from the plan')


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
/* the three defender rings, the game's own colour language (game.js
   defenderMarks): amber = gate · double red = contest · broken teal = screened */
.pc .ring{position:absolute;inset:-7px;border-radius:50%;border:2.5px solid transparent}
.pc.ring-amber .ring{border-color:#e8b84b}
.pc.ring-teal .ring{border-color:#6fd0c3;border-style:dashed}
.pc.ring-red .ring{border-color:#e0473c;box-shadow:0 0 0 3.5px rgba(224,71,60,.35)}
#squad,#lit,#tiles3,#rings{position:absolute;pointer-events:none}
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

/* -- full-screen mock scenes: menu, setup, THE CALL, end, daily, heat, gym -- */
/* gap stays wider than the spotlight's reach (pad 10 + ring 7), so the
   hole never bites the neighbouring tile */
.scn{position:absolute;inset:0;z-index:5;display:none;flex-direction:column;
  align-items:center;justify-content:center;gap:22px;padding:22px;
  background:#100d0b;text-align:center}
.scn.on{display:flex}
.scn .ey{font-family:'Space Mono';font-size:9px;font-weight:700;letter-spacing:.24em;
  text-transform:uppercase;color:#d8b57a}
.scn .big{font-family:'Anton';font-size:clamp(26px,6vw,40px);line-height:.95;
  color:#fff5e2;text-shadow:2px 2px 0 #c9641a}
.scn .big .k{color:#f5872e}
.scn .sub{font-family:'Space Mono';font-size:10px;letter-spacing:.14em;color:#b3a894}
.mtile{display:flex;align-items:center;gap:12px;width:min(340px,90%);text-align:left;
  background:linear-gradient(160deg,#221a12,#171009);border:1.5px solid #3a332a;
  border-radius:13px;padding:12px 14px}
.mtile .tname{font-family:'Anton';font-size:17px;letter-spacing:.03em;color:#efe6d8}
.mtile .tsub{font-family:'Space Mono';font-size:9px;letter-spacing:.1em;color:#b3a894}
.mtile.hot{border-color:#f5872e}
#mstamp .day{font-family:'Anton';font-size:26px;color:#f5872e;line-height:1}
#mstamp .mon{font-family:'Space Mono';font-size:8px;letter-spacing:.2em;color:#d8b57a}
#mgear{position:absolute;top:12px;right:14px;font-size:15px;color:#7d735f;
  background:none;border:1.5px solid #3a332a;border-radius:50%;width:34px;height:34px}
#mplay{display:flex;gap:8px;width:min(340px,90%)}
#mplay .pcard{flex:1;background:#191410;border:1.5px solid #3a332a;border-radius:11px;
  padding:10px 6px}
#mplay .pk{font-family:'Space Mono';font-size:7.5px;letter-spacing:.12em;color:#d8b57a;
  display:block;margin-bottom:3px}
#mplay .pn{font-family:'Anton';font-size:13px;color:#efe6d8}
#sstep{display:flex;flex-direction:column;gap:6px;align-items:center}
.pips{display:flex;gap:5px;justify-content:center}
.pips i{width:7px;height:7px;border-radius:50%;background:#3a332a}
.pips i.on{background:#f5872e}
#ssquad{display:flex;gap:7px;width:min(400px,92%);justify-content:center}
.sq{flex:1;max-width:72px;background:#191410;border:1.5px solid #3a332a;border-radius:10px;
  padding:8px 4px}
.sq .pos{font-family:'Anton';font-size:15px;color:#f5872e}
.sq .spd{font-family:'Space Mono';font-size:8px;letter-spacing:.06em;color:#b3a894;
  display:block;margin-top:3px}
#srules{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;width:min(400px,92%)}
#srules span{font-family:'Space Mono';font-size:8.5px;font-weight:700;letter-spacing:.1em;
  color:#d8b57a;border:1px solid #4a4136;border-radius:999px;padding:6px 11px}
#cprizes{display:flex;gap:10px;width:min(420px,94%)}
.prize{flex:1;background:linear-gradient(160deg,#221a12,#171009);border-radius:13px;
  padding:12px;text-align:left;border:1.5px solid var(--pc,#f5872e)}
.prize .kn{font-family:'Anton';font-size:17px;color:#efe6d8}
.prize .kt{font-family:'Space Mono';font-size:8.5px;letter-spacing:.1em;color:#d8b57a;
  margin-bottom:6px}
.prize li{font-size:11px;color:#b3a894;margin-left:14px;line-height:1.5}
.prize li b{color:#efe6d8}
#escore{display:flex;align-items:baseline;gap:12px;font-family:'DSEG7';font-size:34px;
  color:#ffb03a;text-shadow:0 0 10px rgba(255,176,58,.5)}
#escore .tn{font-family:'Anton';font-size:15px;color:#f5872e;text-shadow:none}
#escore .tn.away{color:#58a8d6}
#eline{font-style:italic;color:#cfc4ae;font-size:14px}
#ebtns{display:flex;gap:9px}
#ebtns button{font-family:'Space Mono';font-size:10.5px;font-weight:700;
  letter-spacing:.1em;border-radius:999px;padding:10px 18px;border:0;
  background:#f5872e;color:#241000}
#ebtns button.ghost{background:none;color:#b3a894;border:1.5px solid #4a4136}
#dhead .dvt{font-family:'Anton';font-size:clamp(26px,6vw,38px);color:#fff5e2;
  text-shadow:2px 2px 0 #c9641a}
#dhead .dvt .k{color:#f5872e}
#drack{display:flex;gap:14px;align-items:center}
#drack .half{display:flex;gap:6px}
#drack i{width:26px;height:26px;border-radius:50%;border:2px solid #4a4136;
  display:flex;align-items:center;justify-content:center;font-size:12px}
#drack .made{border-color:#6fbf73;background:rgba(111,191,115,.18)}
#drack .lbl{font-family:'Space Mono';font-size:8.5px;letter-spacing:.14em;color:#d8b57a}
#dclock{font-family:'DSEG7';font-size:22px;color:#f5872e;background:#0b0805;
  border:1px solid #3a332a;border-radius:8px;padding:6px 12px}
#hclues{width:min(340px,90%);background:linear-gradient(160deg,#221a12,#15100a);
  border:1.5px solid #f5872e;border-radius:13px;padding:14px;text-align:left}
#hclues .cl{font-size:13px;color:#efe6d8;padding:7px 0;border-bottom:1px dashed #3a332a}
#hclues .cl b{color:#ffb056;font-family:'Space Mono';font-size:9px;letter-spacing:.14em}
#hclues .next{font-family:'Space Mono';font-size:9px;letter-spacing:.14em;color:#7d735f;
  padding-top:8px}
#hguess{display:flex;gap:8px;width:min(340px,90%)}
#hguess .in{flex:1;background:#0b0805;border:1.5px solid #3a332a;border-radius:999px;
  padding:10px 14px;font-family:'Space Mono';font-size:11px;color:#7d735f;text-align:left}
#hguess button{font-family:'Space Mono';font-size:10.5px;font-weight:700;
  letter-spacing:.1em;border-radius:999px;padding:10px 16px;border:0;
  background:#f5872e;color:#241000}
#gystations{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));
  gap:7px;width:min(420px,94%)}
#gystations span{font-family:'Space Mono';font-size:8.5px;font-weight:700;
  letter-spacing:.08em;color:#b3a894;border:1.5px solid #3a332a;border-radius:999px;
  padding:8px 4px}
#gystations span.done{color:#6fbf73;border-color:#3f6b42}
#gybook{font-family:'Space Mono';font-size:10.5px;color:#d8b57a;background:none;
  border:1.5px solid #4a4136;border-radius:999px;padding:10px 16px}

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
.flatlist{list-style:none;margin:0;padding:0;columns:2;column-gap:26px;font-size:12.5px}
.flatlist li{break-inside:avoid;padding:7px 0;border-bottom:1px solid var(--rule);
  color:var(--dim);line-height:1.45}
.flatlist li b{color:var(--ink);font-family:'Space Mono';font-size:10.5px}
.flatlist .live{font-family:'Space Mono';font-size:8px;font-weight:700;
  letter-spacing:.12em;color:#2c7a4b;border:1px solid #2c7a4b;border-radius:999px;
  padding:1px 6px;vertical-align:1px}
@media(max-width:640px){.flatlist{columns:1}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
"""

PAGE = """<title>The Coach's Tours · example</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>__CSS__</style>

<header class="wrap">
  <p class="eyebrow">Ball Knowledge · 10 August 2026 · second batch: every tour, walked · a mock, the real one runs in coach.js</p>
  <h1>The Coach's<span class="thin">Tours</span></h1>
  <p class="quote">"Did you make sure to capture everything? Give me a list of
  <b>all the tours</b> and feel free to give me <b>visuals</b> of those as you
  did earlier. For the rest of the <b>one offs</b> you can just give me the
  list."</p>
</header>

<main class="wrap">

<section id="demo">
  <p class="kicker">All twelve tours · tap a chapter, then Next through it</p>
  <h2>Every tour, walked</h2>
  <p>The chips run in the order a first session meets them: the main menu,
  setup, then game one, then the Daily Five and the Gym. Each plays on a mock
  of its real screen with the game's own spotlight device. Every line is
  parsed from the plan file at build time, so what you read here is what the
  plan says, word for word. The last chip is a single trigger, for contrast.</p>

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
      <div class="qh"><span id="tier">EASY · TOSS-UP</span><span id="q15">15</span></div>
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

    <div class="scn" id="scn-menu">
      <button id="mgear" aria-label="settings">⚙</button>
      <div class="big">BALL<span class="k">KNOWLEDGE</span></div>
      <div class="sub">YOUR KNOWLEDGE IS YOUR JUMPSHOT</div>
      <div class="mtile hot" id="mstamp">
        <div><div class="mon">AUG</div><div class="day">10</div></div>
        <div><div class="tname">Run your Daily 5</div>
        <div class="tsub">ONE RACK · SAME TEN FOR EVERYBODY</div></div>
      </div>
      <div class="mtile" id="mgym">
        <div><div class="tname">The Gym</div>
        <div class="tsub">SEVEN LIVE DRILLS · HOW TO PLAY</div></div>
      </div>
      <div id="mplay">
        <div class="pcard"><span class="pk">ALPHA · CODE</span><span class="pn">ONLINE</span></div>
        <div class="pcard"><span class="pk">THE MAIN EVENT</span><span class="pn">VS THE CPU</span></div>
        <div class="pcard"><span class="pk">ONE SCREEN</span><span class="pn">LOCAL VS</span></div>
      </div>
    </div>

    <div class="scn" id="scn-setup">
      <div id="sstep"><div class="ey">STEP 3 · MEET YOUR SQUAD</div>
        <div class="pips"><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div></div>
      <div class="big">YOUR STARTING <span class="k">FIVE</span></div>
      <div id="ssquad">
        <div class="sq"><div class="pos">PG</div><span class="spd">● ● ●</span></div>
        <div class="sq"><div class="pos">SG</div><span class="spd">● ●</span></div>
        <div class="sq"><div class="pos">SF</div><span class="spd">● ●</span></div>
        <div class="sq"><div class="pos">PF</div><span class="spd">● ●</span></div>
        <div class="sq"><div class="pos">C</div><span class="spd">●</span></div>
      </div>
      <div id="srules"><span>SPACING · OPEN FLOOR</span><span>FIRST TO 11</span>
        <span>KNOWLEDGE · CASUAL</span></div>
    </div>

    <div class="scn" id="scn-call">
      <div class="ey">YOU WON THE TOSS-UP</div>
      <div class="big" id="cwon">YOU'VE GOT <span class="k">THE CALL!</span></div>
      <div class="sub">PICK YOUR PRIZE · THEY GET THE OTHER</div>
      <div id="cprizes">
        <div class="prize" style="--pc:#f5872e"><div class="kn">Two more</div>
          <div class="kt">RESHUFFLE YOUR FIVE</div>
          <li><b>7 shuffles</b> instead of 5</li><li>but they pick <b>first</b></li></div>
        <div class="prize" style="--pc:#58a8d6"><div class="kn">First pick</div>
          <div class="kt">TAKE THE BOARD FIRST</div>
          <li><b>lock your five</b> first</li><li>they shuffle <b>5</b>, same as you</li></div>
      </div>
    </div>

    <div class="scn" id="scn-end">
      <div class="ey">FINAL</div>
      <div id="escore"><span class="tn">YOU</span> 11 <span class="tn away">CCH</span> 8</div>
      <div class="big" id="eslam">YOU <span class="k">WIN!</span></div>
      <div id="eline">Ball knowledge don't lie.</div>
      <div id="ebtns"><button>RUN IT BACK</button><button class="ghost">MAIN MENU</button></div>
    </div>

    <div class="scn" id="scn-daily">
      <div id="dhead"><div class="ey">AUG 10 · ONE RACK FOR EVERYBODY · 3 DAY STREAK</div>
        <div class="dvt">The Daily <span class="k">Five</span></div></div>
      <div id="drack">
        <div class="half"><i class="made">✓</i><i class="made">✓</i><i></i><i></i><i></i></div>
        <span class="lbl">5 SHOTS · 5 STOPS</span>
        <div class="half"><i></i><i></i><i></i><i></i><i></i></div>
      </div>
      <div id="dclock">12</div>
    </div>

    <div class="scn" id="scn-heat">
      <div class="ey">TEN FOR TEN · BONUS ROUND</div>
      <div class="big">HEAT <span class="k">CHECK</span></div>
      <div id="hclues">
        <div class="cl"><b>CLUE 1</b> · A guard, drafted in the 1990s</div>
        <div class="cl"><b>CLUE 2</b> · Famous for hitting game-winners</div>
        <div class="next">NEXT CLUE DROPPING…</div>
      </div>
      <div id="hguess"><div class="in">Who is it?</div><button>GUESS</button></div>
    </div>

    <div class="scn" id="scn-gym">
      <div id="gyroom"><div class="ey">PRACTICE COURT · NOTHING COUNTS</div>
        <div class="big">THE <span class="k">GYM</span></div></div>
      <div id="gystations">
        <span class="done">✓ BASICS</span><span class="done">✓ PASSING</span>
        <span>SHOOTING</span><span>CROSSOVERS</span><span>SCREENS</span>
        <span>STEALS</span><span>REBOUNDS</span>
      </div>
      <button id="gybook">📖 THE RULEBOOK · THE EIGHTH STATION</button>
    </div>

    <div id="spot"></div>
    <div id="tcard">
      <img src="__COACH__" alt="The Coach">
      <div class="tb"><div class="who" id="twho">COACH · 1 OF 4</div>
      <div class="txt" id="ttxt"></div>
      <div class="row"><button id="tback" hidden>‹ Back</button>
      <button id="tnext">Next →</button>
      <button id="tskip">Skip the tour</button></div></div>
    </div>
  </div>

  <div class="legend">
    <div><b>orange COACH</b> · a tour, with steps and a counter</div>
    <div><b>teal COACH</b> · a single trigger: one card, once, Got it</div>
    <div><b>Skip</b> · RULED: kills that tour only, the triggers stay armed</div>
    <div><b>the hole</b> · the subject stays bright AND tappable, everything else dims</div>
  </div>
</section>

<section id="model">
  <p class="kicker">The shape after your second batch</p>
  <h2>Twelve tours, then one-offs</h2>
  <div class="scroll"><table>
  <thead><tr><th>kind</th><th>what it is</th><th>count</th></tr></thead><tbody>
  <tr><td><b>The 3 opening tours</b></td><td>the Coldest Call walks inside game one: the lay of the land pre-tip, your first possession, your first stop. 13 steps, each tour skippable as a block</td><td>3 tours</td></tr>
  <tr><td><b>9 triggered tours</b></td><td>a whole screen arrives, the Coach walks it once: main menu, setup, first card, THE CALL, pause, the final buzzer, Daily Five, Heat Check, the Gym. The menu and Gym ones are new this batch, upgraded from single cards</td><td>9 tours · 26 steps</td></tr>
  <tr><td><b>Single triggers</b></td><td>one card at the exact first moment, never two in one possession</td><td>__NTRIG__ cards</td></tr>
  <tr><td><b>Guardrails</b></td><td>fire only when a situation asks for a warning</td><td>__NGUARD__</td></tr>
  </tbody></table></div>
  <p style="margin-top:14px">Everything else is the screen's job, a cut, a
  fold, or shelved for later; the row-by-row filing lives in
  <code>design/COACH-TOURS-2026-08-10.md</code> and
  <code>tools/coachtours-count.py</code> still proves all 256 rows are filed
  exactly once. <strong>Settings gets no tour on purpose:</strong> a settings
  page that needs a guided walk is a settings page that failed. The one
  moment that needs the Coach there is switching the Coach off, and that
  stays a single card.</p>
</section>

<section id="batch2">
  <p class="kicker">Your second batch, answered</p>
  <h2>The catches, measured</h2>
  <ol class="cardlist">
  <li><b>"Defense only moves one, that's unfair."</b> Measured in the game
  code: offense also gets exactly ONE action a turn (move one player, or
  pass, or shoot). Defense answers every one of those actions with one slide,
  a square shorter than a run, full speed in the backcourt, and the defense
  also plays cards on crossovers, contests, blocks and steals. One action
  against one answer. The unfair feeling came from my earlier wrong line
  about free sidesteps; the T3 script now says "same as you" out loud. If it
  still feels wrong knowing this, changing the rule is your call.</li>
  <li><b>"Pay for it means nothing."</b> Gone. The first-card script now says
  what actually happens: the play fails, shots miss, passes fly out, drives
  get stopped.</li>
  <li><b>"Do we ever explain the rings?"</b> Today, only the Rulebook does,
  and nothing forces anyone to open it. The T3 script now decodes all three
  at your first defensive turn: amber guards a path, double red contests the
  shot, broken teal means he got screened. Walk T3 above to hear it, and the
  mock now wears all three rings so you can see them.</li>
  <li><b>"Was replay covered in any tour?"</b> No, nowhere, on purpose: the
  ↺ button is safe to tap and shows what it does the moment you tap it, so
  it is filed CUT. Say the word if you want it to get a card anyway.</li>
  <li><b>One of mine, caught while measuring yours:</b> the setup script
  said "guards move three." Only point guards move three; a shooting guard
  moves two. Fixed, and it now reads point guards three, centers one,
  everybody else two.</li>
  </ol>
</section>

<section id="oneoffs">
  <p class="kicker">The one-offs · the list, as asked</p>
  <h2>__NTRIG__ single triggers</h2>
  <p>One card each, at the exact first moment, once per phone. <span
  class="flatlist" style="columns:1;padding:0"><span class="live">LIVE</span></span>
  marks the eight already shipped. Ids point into the filing; overrule any by id.</p>
  <ul class="flatlist">
__TRIGLIST__
  </ul>
  <h3>__NGUARD__ guardrails</h3>
  <p>Conditional: they fire only when the situation calls for a warning,
  and stay silent otherwise.</p>
  <ul class="flatlist">
__GUARDLIST__
  </ul>
</section>

<section id="ask">
  <p class="kicker">Your call</p>
  <h2>Still open</h2>
  <ol class="cardlist">
    <li><b>The filing itself.</b> Every row's destination is in
    <code>design/COACH-TOURS-2026-08-10.md</code>; overrule any by id. Skip
    behaviour is now RULED: skip kills that tour only.</li>
    <li><b>Tours replace the twelve-card budget.</b> Still recommended.</li>
    <li><b>The action economy</b>, only if it still feels unfair with the
    real numbers above.</li>
    <li><b>Settings stays tour-less</b> (recommended, reason above).</li>
    <li><b>The pass-the-phone curtain</b> for Local VS: a build item looking
    for a track.</li>
  </ol>
</section>

<footer>
  the plan, the scripts and the full 256-row filing: <code>design/COACH-TOURS-2026-08-10.md</code>
  · everything on this page is parsed from it at build time ·
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
  /* the three blue defenders wear the game's three ring states, so T3's
     ring step has all three to point at (amber gate · red contest · teal
     screened, from game.js defenderMarks) */
  var P=[['pg','you','PG',1,3],['sf','you','SF',1,5],['c1','you','C',3,4],
         ['opp','opp','SF',5,3,'ring-amber'],['dpg','opp','PG',4,5,'ring-red'],
         ['dc','opp','C',6,4,'ring-teal']];
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
  box('rings',4,3,6,5);
  g.insertAdjacentHTML('beforeend','<div id="tred" style="position:absolute;pointer-events:none;'+
    'left:calc('+pct(6,3).left+' - 7%);top:calc('+pct(6,3).top+' - 9%);width:14%;height:18%"></div>');
})();

/* ---- chapters ---- */
var SCENES=['menu','setup','call','end','daily','heat','gym'];
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
  SCENES.forEach(function(s){$('scn-'+s).classList.toggle('on',name===s)});
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
  var isRound=el.classList&&el.classList.contains('pc')||sel==='#gear'||sel==='#mgear';
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
start(0);   /* the page opens on the first thing a player ever sees */
})();
</script>
"""

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('usage: coachtour-artifact.py <out.html>')
    main(sys.argv[1])

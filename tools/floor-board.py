#!/usr/bin/env python3
"""Builds the floor-analysis page from design/floor-analysis.json.

Every map on the page is DRAWN FROM MEASURED DATA: the classifications came
out of the game's own movement functions (via tools/floor-truth.mjs), the
Python model matched them tile for tile before it was allowed near a bigger
board, and this file only colours squares. It invents nothing.

Written for Aaron in plain words, after his 08-18 note that the last
explanation was too heavy on jargon. Banned here: tier, gate, harness,
saturation, stacking. The page says card, check, guarded floor.
"""
import base64, json, os, sys

DATA = json.load(open('design/floor-analysis.json'))
FONTS = 'docs/play/assets/fonts'
OUT = 'design/floor-board.html'


def font(n):
    return 'data:font/woff2;base64,' + base64.b64encode(
        open(os.path.join(FONTS, n), 'rb').read()).decode()


KIND_CLASS = {
    'lane': 'lane', 'free': 'safe', 'headon': 'headon', 'diag': 'diag',
    'closed': 'closed', 'occupied': None,
}


def grid(scenario, cols, rows, note=''):
    pieces = {(p['c'], p['r']): p for p in scenario['pieces']}
    h = scenario['pieces'][scenario['handler']]
    cells = []
    for r in range(rows):
        for c in range(cols):
            cls, txt, title = 'court', '', ''
            p = pieces.get((c, r))
            if p:
                cls = 'def' if p['team'] == 1 else 'off'
                txt = p['pos']
                if (c, r) == (h['c'], h['r']):
                    cls += ' ball'
            else:
                k = scenario['tiles'].get(f'{c},{r}')
                if k:
                    taxed = k.endswith('-taxed')
                    base = k.replace('-taxed', '')
                    cls = KIND_CLASS.get(base) or 'court'
                    if taxed:
                        cls += ' taxed'
            cells.append(f'<i class="{cls}">{txt}</i>')
    return (f'<div class="floor" style="--cols:{cols}">' + ''.join(cells) +
            '<b class="rim">RIM</b></div>' +
            (f'<p class="fnote">{note}</p>' if note else ''))


today = DATA['boards'][0]
big = DATA['boards'][2]
loose = DATA['boards'][3]


def avg(board):
    n = len(board['scenarios'])
    keys = {'lane': 0, 'free': 0, 'headon': 0, 'diag': 0, 'closed': 0, 'taxed': 0}
    cov = dbl = half = 0
    for s in board['scenarios']:
        for v in s['tiles'].values():
            b = v.replace('-taxed', '')
            if b in keys:
                keys[b] += 1
            if v.endswith('-taxed'):
                keys['taxed'] += 1
        cov += s['coverage']['guarded']
        dbl += s['coverage']['doubled']
        half += s['coverage']['half_tiles']
    return {k: v / n for k, v in keys.items()} | {
        'cov': 100 * cov / half, 'dbl': 100 * dbl / half}


t, b17, lo = avg(today), avg(big), avg(loose)
# the three hero maps: HORNS offense against each defense, on today's board
hero = [s for s in today['scenarios'] if s['name'].startswith('HORNS')]
big_horns_man = next(s for s in big['scenarios'] if s['name'] == 'HORNS vs MAN')
today_horns_man = next(s for s in today['scenarios'] if s['name'] == 'HORNS vs MAN')

maps = ''.join(
    f'<figure><figcaption>Your point guard against <b>{s["name"].split(" vs ")[1]}</b></figcaption>'
    + grid(s, today['cols'], today['rows']) + '</figure>'
    for s in hero)

HTML = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Is the Floor Too Small?</title>
<style>
  @font-face{{font-family:Anton;src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  @font-face{{font-family:Archivo;src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:swap}}
  @font-face{{font-family:'Space Mono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:swap}}
  :root{{
    --ground:#f4efe6;--raised:#fffaf3;--line:#d9cbb6;--ink:#241b14;--dim:#6f6154;
    --accent:#b8560c;--good:#2f6d4f;--warn:#8a6410;--bad:#a83a30;
    --court:#e7dcc8;--court-line:#d5c5a8;
    --shadow:0 1px 2px rgba(60,40,20,.07),0 8px 24px rgba(60,40,20,.07);
  }}
  @media (prefers-color-scheme:dark){{
    :root:not([data-theme="light"]){{
      --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
      --accent:#f5872e;--good:#6fd0c3;--warn:#ffcf6a;--bad:#d5524b;
      --court:#241c14;--court-line:#332818;
      --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
    }}
  }}
  :root[data-theme="dark"]{{
    --ground:#0f0b09;--raised:#181310;--line:#4a3f31;--ink:#fff5e2;--dim:#a3937f;
    --accent:#f5872e;--good:#6fd0c3;--warn:#ffcf6a;--bad:#d5524b;
    --court:#241c14;--court-line:#332818;
    --shadow:0 1px 0 rgba(255,245,226,.04),0 18px 44px rgba(0,0,0,.5);
  }}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--ground);color:var(--ink);font-size:16.5px;line-height:1.62;
    font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1080px;margin:0 auto;padding:0 22px 96px;display:flex;flex-direction:column;gap:52px}}
  .eyebrow{{font-family:Archivo,sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.15em;
    text-transform:uppercase;color:var(--accent)}}
  h1{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(38px,7vw,66px);line-height:.98;margin:0;text-wrap:balance}}
  h2{{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;
    font-size:clamp(21px,3vw,27px);margin:0}}
  p{{margin:0}}
  .lede{{max-width:62ch;color:var(--dim);font-size:17.5px}}
  .lede strong,.card p strong{{color:var(--ink);font-weight:600}}
  header.top{{padding:60px 0 0;display:flex;flex-direction:column;gap:18px}}
  blockquote{{margin:0;padding:12px 0 12px 20px;border-left:3px solid var(--accent);
    font-size:18px;line-height:1.55;max-width:58ch}}
  blockquote cite{{display:block;margin-top:8px;font-style:normal;font-size:13px;
    color:var(--dim);font-family:'Space Mono',monospace}}
  section{{display:flex;flex-direction:column;gap:20px}}
  .rulecards{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}}
  @media (max-width:860px){{.rulecards{{grid-template-columns:1fr}}}}
  .card{{background:var(--raised);border:1px solid var(--line);border-radius:4px;
    padding:18px 20px;display:flex;flex-direction:column;gap:8px;box-shadow:var(--shadow)}}
  .card h3{{font-family:Archivo,sans-serif;font-weight:600;font-size:14px;margin:0;color:var(--accent)}}
  .card p{{color:var(--dim);font-size:14.5px}}

  .floor{{display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:2px;position:relative;
    background:var(--court-line);border:1px solid var(--line);border-radius:4px;padding:2px;
    max-width:760px}}
  .floor i{{aspect-ratio:1;display:grid;place-items:center;font-style:normal;border-radius:2px;overflow:hidden;min-width:0;
    font-family:'Space Mono',monospace;font-size:clamp(6px,1.7vw,9.5px);font-weight:700;background:var(--court)}}
  .floor i.safe{{background:color-mix(in srgb,var(--dim) 18%,var(--court))}}
  .floor i.lane{{background:color-mix(in srgb,var(--good) 55%,var(--court))}}
  .floor i.diag{{background:color-mix(in srgb,var(--warn) 60%,var(--court))}}
  .floor i.headon{{background:color-mix(in srgb,var(--bad) 62%,var(--court))}}
  .floor i.closed{{background:color-mix(in srgb,var(--bad) 30%,#000 24%);position:relative}}
  .floor i.closed::after{{content:"✕";color:color-mix(in srgb,var(--bad) 65%,#fff);font-size:11px}}
  .floor i.taxed{{outline:2px dashed color-mix(in srgb,var(--ink) 45%,transparent);outline-offset:-3px}}
  .floor i.off{{background:var(--accent);color:#1b120a}}
  .floor i.def{{background:#3d5a80;color:#eef3f8}}
  .floor i.ball{{box-shadow:0 0 0 2.5px #fff,0 0 10px rgba(255,255,255,.6);z-index:1}}
  .floor .rim{{position:absolute;right:-4px;top:50%;transform:translateY(-50%) rotate(90deg);
    font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.3em;color:var(--dim)}}
  figure{{margin:0;display:flex;flex-direction:column;gap:8px}}
  figcaption{{font-family:'Space Mono',monospace;font-size:12.5px;color:var(--dim)}}
  figcaption b{{color:var(--ink)}}
  .fnote{{font-size:12.5px;color:var(--dim);max-width:70ch}}
  .legend{{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--dim);align-items:center}}
  .legend i{{width:16px;height:16px;display:inline-block;border-radius:2px;vertical-align:-3px;
    margin-right:6px;font-style:normal}}
  .pair{{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}}
  @media (max-width:860px){{.pair{{grid-template-columns:1fr}}}}
  .scroll{{overflow-x:auto;border:1px solid var(--line);border-radius:4px;background:var(--raised)}}
  table{{border-collapse:collapse;width:100%;font-size:14px}}
  th,td{{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:top}}
  th{{font-family:Archivo,sans-serif;font-weight:600;font-size:11px;letter-spacing:.12em;
    text-transform:uppercase;color:var(--dim);white-space:nowrap}}
  tr:last-child td{{border-bottom:0}}
  td.m{{font-family:'Space Mono',monospace;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap}}
  .verdict{{background:var(--raised);border:1px solid var(--accent);border-radius:4px;
    padding:24px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow)}}
  .verdict p{{color:var(--dim);max-width:70ch}}
  .verdict p strong{{color:var(--ink)}}
  footer{{color:var(--dim);font-family:'Space Mono',monospace;font-size:12px;
    border-top:1px solid var(--line);padding-top:20px;line-height:1.7}}
  @media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Ball Knowledge · the defense rules · 18 August</p>
    <h1>Is the floor<br>too small?</h1>
    <blockquote>I want a floor analysis given the above and a HONEST TRUE analysis of if
      the floor is too small for all of those rules, do we need to make the floor bigger
      or do we need to make defense less restrictive
      <cite>Aaron, part 1</cite></blockquote>
    <p class="lede">Measured, not argued. The game's own movement rules classified every
      square your point guard can reach, across all nine pairings of your three offensive
      setups and three defensive setups, placed exactly where the game places them.
      Screens were left OFF everywhere, and screens only ever open lanes, so
      <strong>every map below shows the floor at its absolute worst for the offense.</strong></p>
  </header>

  <section>
    <h2>Your three rules, on a tile</h2>
    <div class="rulecards">
      <div class="card"><h3>1 · Head-on costs full, diagonal costs less</h3>
        <p>Drive at a defender standing square in front of you and the crossover card is
        full price. If the man forcing the duel covers you from a corner, the card is one
        step easier. <strong>Already true for shots</strong>, in every game: a defender in
        your chest makes the shot question harder, a diagonal closeout leaves daylight but
        sharpens his block card.</p></div>
      <div class="card"><h3>2 · Two men on a lane close it</h3>
        <p>A drive that two defenders both stand on is simply not offered. The exception
        you named is the escape hatch: a highly skilled ball handler can still take it on,
        and that is the first place player skill will decide what a player CAN DO, not
        just how a meter behaves.</p></div>
      <div class="card"><h3>3 · Crossovers reach one square less</h3>
        <p>Free movement shows every square you can reach. The moment a move would be a
        crossover, you are offered one square less distance. The cost of going through a
        man is shown before you choose, and nothing is taken from you after you win.</p></div>
    </div>
  </section>

  <section>
    <h2>The point guard's floor, against each defense</h2>
    <p class="lede">Orange chips are your five (HORNS setup, the ring marks the ball).
      Blue chips are the defense. Every coloured square is something the ball handler can
      do this turn under all three rules at once.</p>
    <div class="legend">
      <span><i style="background:color-mix(in srgb,var(--good) 55%,var(--court))"></i>clean lane to drive</span>
      <span><i style="background:color-mix(in srgb,var(--warn) 60%,var(--court))"></i>duel · one step easier (diagonal)</span>
      <span><i style="background:color-mix(in srgb,var(--bad) 62%,var(--court))"></i>duel · full price (head-on)</span>
      <span><i style="background:color-mix(in srgb,var(--bad) 30%,#000 24%)"></i>closed · two men on it</span>
      <span><i style="background:color-mix(in srgb,var(--dim) 18%,var(--court))"></i>safe sideways or back</span>
      <span><i style="outline:2px dashed var(--dim);outline-offset:-3px;background:var(--court)"></i>dashed · removed by rule 3's shorter reach</span>
    </div>
    {maps}
  </section>

  <section>
    <h2>The honest answer: the floor is not too small</h2>
    <div class="verdict">
      <p><strong>Averaged over all nine setup pairings, your point guard still has about
      3 clean driving lanes, 7 duels (most of them the cheaper diagonal kind), 4 lanes
      closed by two men, and 28 safe squares sideways or back.</strong> A turn under all
      three rules is a real set of choices, not a locked door. The two-man rule closes
      about a third of the contested paths, and your skill hatch reopens exactly those
      for the players who have earned it.</p>
      <p><strong>Making the floor bigger does not help, and the measurement is blunt about
      it:</strong> on a board four columns wider and two rows taller, the point guard's
      numbers are IDENTICAL to today's. The defense stands where the rim is, so a bigger
      floor only adds empty space behind the play, plus longer walks up the court. Keep
      15 x 8.</p>
      <p><strong>One real collision between your rules, and it has a one-line fix.</strong>
      Players reach different distances: your point guard moves 3, wings and bigs move 2,
      centers move 1. Rule 3 as stated would give centers a crossover reach of ZERO, so a
      center could never cross anyone, ever. The fix: crossover reach never drops below
      one square. The long crossover dies (nobody but a point guard on fire can reach 3),
      and that is worth knowing: the DEEP CROSSOVER card mostly retires with this rule.</p>
      <p><strong>If real games ever feel too tight, the lever is the closing rule, not the
      board.</strong> Counting only defenders truly standing ON a lane (not just near it)
      reopens about one closed lane in seven and turns it into a cheaper diagonal duel.
      That is the knob to reach for after the twenty have played, and only then.</p>
    </div>
  </section>

  <section>
    <h2>Bigger board, same fight</h2>
    <div class="pair">
      <figure><figcaption>Today · 15 x 8 · HORNS vs MAN</figcaption>
        {grid(today_horns_man, today['cols'], today['rows'])}</figure>
      <figure><figcaption>Four wider, two taller · 19 x 10 · same setups</figcaption>
        {grid(big_horns_man, big['cols'], big['rows'])}</figure>
    </div>
    <p class="fnote">The coloured area around the ball is the same picture on both boards.
      Every square the bigger floor adds is grey: space nobody is fighting over.</p>
  </section>

  <section>
    <h2>The numbers behind the maps</h2>
    <div class="scroll"><table>
      <thead><tr><th>Board</th><th>Clean lanes</th><th>Cheaper diagonal duels</th>
        <th>Full-price duels</th><th>Closed by two men</th><th>Half court guarded</th></tr></thead>
      <tbody>
        <tr><td>15 x 8 · today</td><td class="m">{t['lane']:.1f}</td><td class="m">{t['diag']:.1f}</td>
          <td class="m">{t['headon']:.1f}</td><td class="m">{t['closed']:.1f}</td><td class="m">{t['cov']:.0f}%</td></tr>
        <tr><td>19 x 10 · much bigger</td><td class="m">{b17['lane']:.1f}</td><td class="m">{b17['diag']:.1f}</td>
          <td class="m">{b17['headon']:.1f}</td><td class="m">{b17['closed']:.1f}</td><td class="m">{b17['cov']:.0f}%</td></tr>
        <tr><td>15 x 8 · softer closing rule</td><td class="m">{lo['lane']:.1f}</td><td class="m">{lo['diag']:.1f}</td>
          <td class="m">{lo['headon']:.1f}</td><td class="m">{lo['closed']:.1f}</td><td class="m">{lo['cov']:.0f}%</td></tr>
      </tbody>
    </table></div>
    <p class="fnote">Averages across all nine setup pairings, point guard on the ball.
      "Half court guarded" is how much of the attacking half has a defender standing next
      to it: 45% today, which means most of the floor is open and the crowd is where the
      rim is. That is basketball behaving like basketball.</p>
  </section>

  <section>
    <h2>What happens when you say go</h2>
    <p class="lede">Nothing is built yet. On your confirm, one build ships all of it
      together: the three rules as the game's ONE defense (the four-way house-rule picker
      retires), the tiles coloured so the price is visible before every tap, the CPU
      taught to see cheaper diagonals and closed lanes, the skill hatch wired for when
      ratings land, the rulebook rewritten, a Coach drill for it, and an automatic check
      that replays all of this so it can never quietly break.</p>
  </section>

  <footer>
    Method: tools/floor-truth.mjs asked the game's own functions to classify 432 squares
    across 9 real setup pairings; tools/floor-analysis.py reproduced all 432 exactly and
    only then modelled the bigger boards. Data: design/floor-analysis.json.<br>
    Worst case shown: screens off everywhere, and screens only ever open lanes.
  </footer>
</div>
'''

open(OUT, 'w').write(HTML)
print(f'wrote {OUT}  {os.path.getsize(OUT)//1024} KB')

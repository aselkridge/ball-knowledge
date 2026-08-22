#!/usr/bin/env python3
"""THE MOMENT INVENTORY, list item 103, first deliverable.

Aaron, 2026-08-22: "What does a player need to know and do at each point and
how can we surface that in a clean POLISHED BEUATIFUL INTUITIVE WAY?"

Two halves, kept visibly apart on the page because they have different
standards of proof:
  COUNTED   what is on the screen at each moment, from tools/moment-inventory.mjs
  JUDGED    what the player needs to KNOW and can DO, written by hand

  python3 tools/moments-artifact.py   writes design/moments.html
"""
import base64
import pathlib

W = pathlib.Path('design/shots/moments/web')
OUT = pathlib.Path('design/moments.html')


def img(name):
    return 'data:image/webp;base64,' + base64.b64encode((W / name).read_bytes()).decode()


#  key, title, when it happens, KNOW (list), DO (list), on-screen counts, defects
MOMENTS = [
    dict(
        key='setups-def', title='They have the ball. You call defense.',
        when='Dead ball. The defense is asked first, always.',
        know=['Whose ball it is', 'That this choice is yours and not theirs',
              'What each shape does when the ball arrives',
              'How many shapes there are to choose from'],
        do=['Tap a card to try it on the floor', 'Tap RUN IT to lock it'],
        vis=58, doN=3, util=7, words=72, chans=3, ov=4, off=3,
        bad=['Two cards print on top of the turn tray and two print on top of '
             'the turn pill. Four panel overlaps, measured.',
             'A third card sits entirely off the right edge, ending at 551px on '
             'a 390px screen. The carousel is 810px of content in 390px, so on '
             'defense you see two of four shapes and nothing says there are more.',
             'The pill underneath reads YOUR TURN &middot; TAP A PLAYER while the '
             'line at the bottom reads tap a card. Two instructions, in conflict, '
             'at the same instant.',
             'RUN IT is <code>display:none</code> until a card is selected, so the '
             'instruction names a button that is not on the screen yet.'],
    ),
    dict(
        key='setups-off', title='Your ball. You answer their defense.',
        when='Straight after the machine picks its shape.',
        know=['What defense they just called, and what it means for you',
              'What each of your shapes does against it',
              'How many shapes you have'],
        do=['Tap a card to preview it on the floor', 'Tap RUN IT to lock it'],
        vis=58, doN=3, util=7, words=70, chans=3, ov=4, off=3,
        bad=['Every defect from the moment above, identically. Four overlaps, '
             'a card off the right edge, the same contradicting pill.',
             'The banner names their shape (BOX-AND-ONE) and nothing on the '
             'screen shows what that shape is. The picture of it was on the card '
             'they picked, which is gone.'],
    ),
    dict(
        key='ballin', title='Pass it in.',
        when='The shapes are set. The ball is out of bounds.',
        know=['That the ball is not live yet', 'Which of your players can receive'],
        do=['Tap a teammate to pass it in'],
        vis=28, doN=0, util=7, words=37, chans=3, ov=0, off=0,
        bad=['Zero controls in the census, because the only thing you can do is '
             'tap a figure painted on a canvas. Correct for the game, and it means '
             'the primary way you play has no affordance a browser can see, and '
             'therefore none a screen reader or a keyboard can reach either.',
             'The quietest moment on the list at 28 elements, and 27 of them are '
             'the same furniture that is there every other moment.'],
    ),
    dict(
        key='freemoves', title='Free moves. Step your off-ball players.',
        when='The ball is in. Before your main action.',
        know=['That these moves are free and do not cost your action',
              'How many teammates have still not moved',
              'Which players count as off-ball', 'That DONE is the way out'],
        do=['Tap an off-ball player, then a lit tile', 'Tap DONE to move on'],
        vis=44, doN=1, util=7, words=61, chans=2, ov=0, off=0,
        bad=['The count is live and correct, and it is the one place on any of '
             'these six screens where a number changes as you act. It is also '
             '10px tall.',
             'The dock reads as two rows of one panel here and survives, because '
             'it has less to say than the action dock does.'],
    ),
    dict(
        key='action', title='Your main action.',
        when='Free moves are done. This is the turn.',
        know=['Whether a shot is on from here, and what it is worth',
              'Who is open to pass to', 'What a move costs you',
              'That this ends your possession'],
        do=['SHOOT', 'PASS', 'MOVE'],
        vis=32, doN=1, util=7, words=42, chans=2, ov=0, off=1,
        bad=['MOVE is not on the screen. The strip needs 493px and gets 298px, '
             'so PASS is cut and the third action never renders. No scrollbar on '
             'a phone, nothing saying it continues.',
             'The most consequential moment of the turn has the same 7 utility '
             'buttons and 32 elements as the moment where you do nothing.'],
    ),
    dict(
        key='waiting', title='Their possession. You watch.',
        when='You have acted. The machine is thinking.',
        know=['That it is not your turn', 'What they just did',
              'Whether anything is expected of you'],
        do=['Nothing. Watch the floor.'],
        vis=28, doN=0, util=7, words=31, chans=3, ov=0, off=0,
        bad=['Seven utility buttons remain fully lit and tappable at the one '
             'moment when the player has no decision to make.',
             'The bottom instruction line was not repainted by this staging, so '
             'what it says here is not evidence. Everything else on this row is.'],
    ),
]

FINDINGS = [
    ('The furniture outnumbers the game, at every moment',
     'Seven utility controls are present, lit and tappable on all six moments: '
     'the HUD menu, pause, replay, music, help, coach and the bench tab. The '
     'controls that actually advance your turn number <b>three at most, and zero '
     'twice</b>. At the biggest moment of a possession the score is seven to one. '
     'This is the measured version of "it is unclear what is a button": most of '
     'the buttons are not about the thing you are being asked to do.'),
    ('Three text channels speak at once, and they contradict each other',
     'A banner over the court, a pill under it, and a line at the very bottom. '
     'All three are lit simultaneously on four of six moments. On the setup '
     'moments the pill says <b>YOUR TURN &middot; TAP A PLAYER</b> while the '
     'bottom line says <b>tap a card</b>. Your own screenshots catch a worse one: '
     'the pill reading <b>THEY&rsquo;RE UP</b> while the banner and the bottom '
     'line both say it is your free moves.'),
    ('The instruction is always as far from the tap as the screen allows',
     'The bottom line sits at 96% of screen height on every moment. The thing it '
     'is telling you to tap is the court, in the middle, or a card, just above it. '
     'It is the last thing in reading order and the first thing a thumb covers.'),
    ('Two carousels hide their own options with no sign that they do',
     'The setup cards are 810px of content in a 390px window and the action strip '
     'is 493px in 298px. Both are horizontally scrollable, neither shows a '
     'scrollbar on a phone, and neither has an edge fade, an arrow or a count. '
     'A player on defense sees two shapes and has no way to learn there are four.'),
    ('The board, which is the whole game, is invisible to every check',
     'Tapping a player and tapping a tile are the two most common actions in the '
     'game and both happen on a canvas. They produce no DOM element, so they have '
     'no hover state a browser can style, no focus ring, no name a screen reader '
     'can read, and no way for any harness here to assert they are reachable. '
     'That is why two moments score zero controls.'),
]

HTML = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Six Moments Of A Turn</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
:root{
  --ground:#f6f1ea; --panel:#fffdfa; --sunk:#efe7dc;
  --ink:#1c1512; --dim:#6d5f55; --line:#e0d5c9;
  --accent:#c25a10; --alarm:#b83c26; --know:#2f6b7a; --do:#3f7a4a;
  --shadow:0 1px 2px rgba(60,40,24,.07),0 8px 22px rgba(60,40,24,.06);
  --display:'Oswald',Haettenschweiler,'Arial Narrow',sans-serif;
  --body:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ground:#0f0c0a; --panel:#191310; --sunk:#231a14;
  --ink:#f2ebe4; --dim:#9c8a7d; --line:#372b23;
  --accent:#f5872e; --alarm:#e8654c; --know:#6fb6c9; --do:#6fbf82;
  --shadow:0 1px 0 rgba(255,255,255,.03),0 14px 34px rgba(0,0,0,.5);
}}
:root[data-theme="dark"]{
  --ground:#0f0c0a; --panel:#191310; --sunk:#231a14;
  --ink:#f2ebe4; --dim:#9c8a7d; --line:#372b23;
  --accent:#f5872e; --alarm:#e8654c; --know:#6fb6c9; --do:#6fbf82;
  --shadow:0 1px 0 rgba(255,255,255,.03),0 14px 34px rgba(0,0,0,.5);
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--body);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:1160px;margin:0 auto;padding:0 24px 100px}
.top{border-top:3px solid var(--accent)}
header{padding:54px 0 40px;border-bottom:1px solid var(--line)}
.eyebrow{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.18em;
  text-transform:uppercase;color:var(--accent);margin:0 0 14px}
h1{font-family:var(--display);font-weight:600;font-size:clamp(38px,7vw,64px);
  line-height:.97;text-transform:uppercase;margin:0 0 20px;text-wrap:balance}
.lede{max-width:64ch;font-size:17px;color:var(--dim);margin:0 0 8px}
.lede strong{color:var(--ink);font-weight:500}
blockquote{margin:24px 0 0;padding:12px 0 12px 20px;border-left:2px solid var(--accent);
  max-width:60ch}
blockquote p{margin:0;font-size:17px;font-style:italic}
blockquote cite{display:block;margin-top:8px;font-family:var(--mono);font-size:11px;
  font-style:normal;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
section{padding:54px 0 0}
h2{font-family:var(--display);font-weight:500;font-size:27px;letter-spacing:.03em;
  text-transform:uppercase;margin:0 0 6px}
.sub{margin:0 0 28px;color:var(--dim);max-width:68ch;font-size:15px}

/* the headline ratio, the one number worth leading with */
.ratio{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;
  background:var(--line);border:1px solid var(--line);border-radius:4px;overflow:hidden;
  margin-bottom:8px}
.rcell{background:var(--panel);padding:18px 16px}
.rk{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--dim);margin:0 0 8px}
.rv{font-family:var(--display);font-size:38px;line-height:1;font-weight:500;
  font-variant-numeric:tabular-nums}
.rv.bad{color:var(--alarm)} .rv.ok{color:var(--do)}
.rn{font-size:12.5px;color:var(--dim);margin:8px 0 0;line-height:1.45}

/* one moment */
.moment{margin-top:34px;background:var(--panel);border:1px solid var(--line);
  border-radius:5px;box-shadow:var(--shadow);overflow:hidden;
  display:grid;grid-template-columns:300px 1fr}
@media (max-width:880px){.moment{grid-template-columns:1fr}}
.mshot{background:#0d0a08;border-right:1px solid var(--line);line-height:0}
.mshot img{width:100%;height:auto;display:block}
.mbody{padding:24px 26px}
.mwhen{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--accent);margin:0 0 7px}
.mtitle{font-family:var(--display);font-weight:500;font-size:23px;letter-spacing:.02em;
  margin:0 0 4px;text-wrap:balance}
.mcue{margin:0 0 20px;font-size:13.5px;color:var(--dim)}
.kd{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
@media (max-width:560px){.kd{grid-template-columns:1fr}}
.kd h4{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  margin:0 0 9px;padding-bottom:6px;border-bottom:1px solid var(--line)}
.kd .k h4{color:var(--know)} .kd .d h4{color:var(--do)}
.kd ul{margin:0;padding:0;list-style:none;display:grid;gap:6px}
.kd li{font-size:13.5px;padding-left:14px;position:relative;line-height:1.45}
.kd li::before{content:"";position:absolute;left:0;top:8px;width:5px;height:5px;
  border-radius:50%}
.kd .k li::before{background:var(--know)} .kd .d li::before{background:var(--do)}
.counts{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.chip{font-family:var(--mono);font-size:10.5px;letter-spacing:.05em;padding:4px 9px;
  border:1px solid var(--line);border-radius:3px;color:var(--dim);
  font-variant-numeric:tabular-nums;background:var(--sunk)}
.chip b{color:var(--ink);font-weight:500}
.chip.bad{border-color:var(--alarm);color:var(--alarm)}
.chip.bad b{color:var(--alarm)}
.bad-list{margin:0;padding:0;list-style:none;display:grid;gap:9px;
  border-top:1px solid var(--line);padding-top:16px}
.bad-list li{font-size:13.5px;padding-left:18px;position:relative;line-height:1.5;
  color:var(--dim)}
.bad-list li::before{content:"\\2715";position:absolute;left:0;top:1px;
  color:var(--alarm);font-size:10px}
.bad-list li b{color:var(--ink);font-weight:500}
code{font-family:var(--mono);font-size:.88em;background:var(--sunk);
  padding:1px 4px;border-radius:2px}

/* findings */
.finds{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);
  border-radius:4px;overflow:hidden;counter-reset:f}
.find{background:var(--panel);padding:24px 26px;counter-increment:f;
  display:grid;grid-template-columns:44px 1fr;gap:18px;align-items:start}
.find::before{content:counter(f);font-family:var(--display);font-size:26px;
  color:var(--accent);line-height:1}
.find h3{font-family:var(--display);font-weight:500;font-size:19px;letter-spacing:.02em;
  margin:0 0 7px;text-wrap:balance}
.find p{margin:0;font-size:14.5px;color:var(--dim);max-width:72ch}
.find p b{color:var(--ink);font-weight:500}

.scroll{overflow-x:auto;margin-top:8px}
table{border-collapse:collapse;width:100%;min-width:640px;font-family:var(--mono);
  font-size:12.5px;font-variant-numeric:tabular-nums}
th{text-align:left;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
  font-size:9.5px;color:var(--dim);padding:0 14px 8px 0;border-bottom:1px solid var(--line);
  white-space:nowrap}
td{padding:9px 14px 9px 0;border-bottom:1px solid var(--line);white-space:nowrap}
tr:last-child td{border-bottom:0}
td.k{font-weight:500}
td.bad{color:var(--alarm)}

.limits{margin-top:30px;background:var(--panel);border:1px solid var(--line);
  border-left:3px solid var(--dim);border-radius:4px;padding:24px 26px}
.limits h3{font-family:var(--display);font-weight:500;font-size:19px;
  letter-spacing:.02em;text-transform:uppercase;margin:0 0 12px}
.limits ul{margin:0;padding-left:18px;display:grid;gap:8px}
.limits li{font-size:14px;color:var(--dim);max-width:74ch}
.limits li b{color:var(--ink);font-weight:500}

footer{margin-top:56px;padding-top:20px;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:11px;letter-spacing:.05em;color:var(--dim)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
<div class="top"></div>
<div class="wrap">
<header>
  <p class="eyebrow">Item 103 &middot; the gameplay rebuild &middot; step one</p>
  <h1>Six moments<br>of a turn</h1>
  <p class="lede">Before anything gets designed: <strong>what is actually on the
  screen at each point of a possession</strong>, counted by a harness that drives
  a real game and walks the DOM, and next to it what a player needs to know and
  can do. The counts are measured. The two middle columns are my judgement and
  are the part to argue with.</p>
  <blockquote>
    <p>&ldquo;What does a player need to know and do at each point and how can we
    surface that in a clean POLISHED BEUATIFUL INTUITIVE WAY that will bring joy
    to the game?&rdquo;</p>
    <cite>Aaron, 2026-08-22</cite>
  </blockquote>
</header>

<section>
  <h2>The number to start from</h2>
  <p class="sub">Counted across all six moments at 390 &times; 844.</p>
  <div class="ratio">{RATIO}</div>
</section>

<section>
  <h2>The six moments</h2>
  <p class="sub">In the order a possession runs. Each frame is a real headless
  shot of the moment, staged through the game&rsquo;s own painters rather than a
  mock, so what is counted is what ships.</p>
  {MOMENTS}
</section>

<section>
  <h2>What the census says</h2>
  <p class="sub">Five things that are true at more than one moment, which makes
  them structure rather than bugs.</p>
  <div class="finds">{FINDS}</div>
</section>

<section>
  <h2>Every moment, side by side</h2>
  <div class="scroll"><table>
    <thead><tr><th>Moment</th><th>On screen</th><th>Turn controls</th>
    <th>Utility buttons</th><th>Words</th><th>Text channels</th>
    <th>Panel overlaps</th><th>Off right edge</th></tr></thead>
    <tbody>{ROWS}</tbody>
  </table></div>
</section>

<section>
  <div class="limits">
    <h3>What this does not establish</h3>
    <ul>
      <li><b>Six moments, not twelve.</b> The shot, the trivia card, the score, the
      tip-off, halftime and game point are not counted here. Six was enough to
      find structure that repeats; the rest should be counted before anything is
      finalised.</li>
      <li><b>Staleness is not proven.</b> The banner appears to carry text from a
      previous moment, but each moment here was staged directly rather than played
      into, so I cannot separate the game doing that from my staging doing it.
      That needs one real possession played end to end. The pill contradiction IS
      established, because it is in three of your own five screenshots.</li>
      <li><b>The waiting moment&rsquo;s bottom line is not evidence.</b> The real
      handover would have repainted it and this staging does not. Everything else
      in that row is real.</li>
      <li><b>The KNOW and DO columns are mine.</b> Nothing measured them. They are
      the argument this whole exercise exists to have, and if they are wrong the
      design built on them will be wrong in the same direction.</li>
    </ul>
  </div>
</section>

<footer>
  Counted with tools/moment-inventory.mjs &middot; Chromium 390&times;844,
  reduce-motion on &middot; six moments staged through the game&rsquo;s own
  painters &middot; 2026-08-22
</footer>
</div>
"""


def build():
    ratio = ''.join([
        ('<div class="rcell"><p class="rk">Utility buttons, every moment</p>'
         '<p class="rv bad">7</p><p class="rn">HUD menu, pause, replay, music, help, '
         'coach, bench tab. Lit and tappable at all six moments, including the two '
         'where you cannot act at all.</p></div>'),
        ('<div class="rcell"><p class="rk">Controls that advance the turn</p>'
         '<p class="rv ok">0&ndash;3</p><p class="rn">Three at the setup carousel, '
         'one at free moves, one at your main action, zero at the inbound and zero '
         'while you wait.</p></div>'),
        ('<div class="rcell"><p class="rk">Elements on screen</p>'
         '<p class="rv">28&ndash;58</p><p class="rn">Of which 27 to 30 are the same '
         'permanent furniture at every single moment.</p></div>'),
        ('<div class="rcell"><p class="rk">Simultaneous text channels</p>'
         '<p class="rv bad">3</p><p class="rn">Banner, pill and bottom line, all lit '
         'at once on four of six moments, disagreeing on two of them.</p></div>'),
    ])

    moments = ''
    for m in MOMENTS:
        chips = [
            f'<span class="chip"><b>{m["vis"]}</b> on screen</span>',
            f'<span class="chip"><b>{m["doN"]}</b> turn controls</span>',
            f'<span class="chip"><b>{m["util"]}</b> utility buttons</span>',
            f'<span class="chip"><b>{m["words"]}</b> words</span>',
            f'<span class="chip"><b>{m["chans"]}</b> text channels</span>',
        ]
        if m['ov']:
            chips.append(f'<span class="chip bad"><b>{m["ov"]}</b> panel overlaps</span>')
        if m['off']:
            chips.append(f'<span class="chip bad"><b>{m["off"]}</b> off the right edge</span>')
        moments += (
            '<div class="moment">'
            f'<div class="mshot"><img src="{img(m["key"] + ".webp")}" alt="{m["title"]}"></div>'
            '<div class="mbody">'
            f'<p class="mwhen">{m["when"]}</p>'
            f'<h3 class="mtitle">{m["title"]}</h3>'
            '<div class="kd">'
            '<div class="k"><h4>Needs to know</h4><ul>'
            + ''.join(f'<li>{x}</li>' for x in m['know']) + '</ul></div>'
            '<div class="d"><h4>Can do</h4><ul>'
            + ''.join(f'<li>{x}</li>' for x in m['do']) + '</ul></div>'
            '</div>'
            f'<div class="counts">{"".join(chips)}</div>'
            '<ul class="bad-list">'
            + ''.join(f'<li>{x}</li>' for x in m['bad']) + '</ul>'
            '</div></div>')

    finds = ''.join(
        f'<div class="find"><div><h3>{t}</h3><p>{p}</p></div></div>'
        for t, p in FINDINGS)

    rows = ''
    for m in MOMENTS:
        rows += (f'<tr><td class="k">{m["title"][:34]}</td><td>{m["vis"]}</td>'
                 f'<td>{m["doN"]}</td><td>{m["util"]}</td><td>{m["words"]}</td>'
                 f'<td>{m["chans"]}</td>'
                 f'<td class="{"bad" if m["ov"] else ""}">{m["ov"]}</td>'
                 f'<td class="{"bad" if m["off"] else ""}">{m["off"]}</td></tr>')

    html = (HTML.replace('{RATIO}', ratio).replace('{MOMENTS}', moments)
                .replace('{FINDS}', finds).replace('{ROWS}', rows))
    OUT.write_text(html)
    print(f'{OUT}  {OUT.stat().st_size // 1024}KB')


if __name__ == '__main__':
    build()

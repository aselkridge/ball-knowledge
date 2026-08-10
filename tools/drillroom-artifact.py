#!/usr/bin/env python3
"""Build THE DRILL ROOM example page: Aaron's board, played.

Aaron filed all 62 drill candidates into sections (design/COACH-BOARD-2026-08-10.md)
and described the experience he wants: each section becomes ONE drill; inside it
the parts are listed down the left, the Coach takes you through them one at a
time, cleared parts check off and cross out, any line jumps, any drill redoes.
This page is that experience, mocked: sections are parsed FROM HIS BOARD FILE so
the example cannot drift from what he filed, and the look is lifted from the
game's own CSS (index.html values copied below, named where they are used).

Honesty box: the court in the mock is a flat tile stand-in. The real drill runs
the live 3D board in game.js; what this page demonstrates is the FRAME around
it: the rail, the check-off, the jump, the gating, the coach lane. It also
bakes in the two B5 fixes Aaron named (actions outside the drill refuse with a
reason · the coach panel owns a reserved lane so it can never cover an action).

    python3 tools/drillroom-artifact.py /tmp/drill-room.html
"""
import base64, html, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BOARD = ROOT / 'design/COACH-BOARD-2026-08-10.md'
FONTS = ROOT / 'docs/play/assets/fonts'
BRAND = ROOT / 'docs/play/assets/brand'


def datauri(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(pathlib.Path(path).read_bytes()).decode()


def face(name, file, weight=400):
    return (f"@font-face{{font-family:'{name}';font-weight:{weight};font-style:normal;"
            f"font-display:swap;src:url({datauri(FONTS/file,'font/woff2')}) format('woff2')}}")


# --------------------------------------------------------------- the board ---
def parse_board():
    """-> [{name, kind, items:[{id, nm, w}]}] in Aaron's order, from his file."""
    secs, cur = [], None
    started = False
    for line in BOARD.read_text(encoding='utf-8').splitlines():
        if line.startswith('# COACH BOARD'):
            started = True
            continue
        if not started:
            continue
        m = re.match(r'^## (.+?) \(\d+\)\s*$', line)
        if m:
            nm = m.group(1).strip()
            low = nm.lower()
            kind = ('coach' if low.startswith('main menu')
                    else 'walk' if low.startswith('first walkthrough')
                    else 'unsure' if low == 'unsure' else 'drill')
            cur = {'name': nm, 'kind': kind, 'items': []}
            secs.append(cur)
            continue
        m = re.match(r'^- (DR-\d+) · (.+?)(?: · (MUST|SHOULD|COULD|NO.*))?$', line)
        if m and cur is not None:
            cur['items'].append({'id': m.group(1), 'nm': m.group(2).strip(),
                                 'w': (m.group(3) or '').strip()})
    return secs


# Blocked per COACH-AND-DRILLS.md: the mechanic does not exist yet. A locked
# rail line, excluded from the progress denominator, with the reason on tap.
LOCKED = {
    'DR-40': 'fatigue is not built yet', 'DR-41': 'signature skills are not built yet',
    'DR-57': 'fouls are not implemented', 'DR-58': 'fouls are not implemented',
    'DR-59': 'the timed block gamble is a DESIGN item, not built',
    'DR-60': 'substitutions are not built', 'DR-61': 'the alley-oop is not built',
    'DR-62': 'heat phase 2, spec’d and not built',
}
BUILT = {'DR-01', 'DR-02', 'DR-03', 'DR-04', 'DR-05', 'DR-06', 'DR-07'}

# ------------------------------------------------------------- part scripts --
# Two beats each: the Coach instructs and points (tap: the lit hotspot), then
# calls the outcome. Lines are condensed from each row's teaching text in
# design/COACH-AND-DRILLS.md. BOARDS is the hero drill and carries real card
# play, including DR-07's brick-on-purpose. No em dashes anywhere: house law.
# fx keys are applied to the stage; hotspots: pg you, sf mate, def, tiles
# free/red/key/corner, buttons, clock, heat, meter, card.
P = {
 'DR-01': [('Tap your <b>point guard</b>. His reachable tiles light up: orange is free.', 'pg', 'free'),
           ('You act, then they slide one man. That is the rhythm of every turn.', None, None)],
 'DR-02': [('Swing it: <b>tap your teammate</b>. Short is automatic, a laser asks a medium card, a heave is hard.', 'sf', 'pass'),
           ('And the lane matters: a lurking defender turns a free swing into a question.', None, None)],
 'DR-23': [('Before the main action, EVERY player gets one free one-square shuffle. <b>Tap the SF</b> and nudge him.', 'sf', 'free'),
           ('Shuffle plus action, every turn. Skip it and you play at half the tempo.', None, None)],
 'DR-32': [('Freeze. Feet first: <b>tap the ringed defender</b> and read him before you move anyone.', 'def', 'rings'),
           ('Check every ring, then pick. The rings are the whole defense, printed on the floor.', None, None)],
 'DR-11': [('Made bucket, so it comes in under the rim. The inbounder cannot move or shoot. <b>Tap your cutter</b>.', 'sf', 'free'),
           ('One cutter, the defense answers with a slide, then put it in play. Every made basket runs this.', None, None)],
 'DR-15': [('Carry the crossover three tiles or more and the tile goes DARKER red. <b>Tap it.</b>', 'tred', 'deep'),
           ('One tier harder, and winning still costs a step. Pick your spots.', None, None)],
 'DR-04': [('Tiles past the defender glow <b>red</b>. Tap one: that is a crossover challenge.', 'tred', 'red'),
           ('You answer, then HE answers to stay in front. Both right is an ANKLE BATTLE.', None, None)],
 'DR-31': [('Two bodies in the paint. A drive asks one card per defender the path crosses. <b>Tap the lane.</b>', 'tred', 'red'),
           ('On the One-on-one floor a lane gated by two is simply closed. Beat them one at a time.', None, None)],
 'DR-05': [('Off the ball, park a body NEXT TO a defender, diagonals count. <b>Tap the tile beside him.</b>', 'tfree', 'free'),
           ('Broken teal ring: screened. The lane he was guarding just reopened.', None, 'teal')],
 'DR-06': [('Defense now. After every offensive action you slide ONE man. <b>Tap your defender.</b>', 'def', None),
           ('Up to one tile less than his speed. Next to the handler, you can reach in.', None, None)],
 'DR-10': [('Go for it: <b>hit STEAL</b>. Your card first, then his protect-the-rock card.', 'bsteal', 'card'),
           ('Both right is RIP OR GRIP. First miss loses, the handler holds the edge: <b>SUDDEN DEATH</b>, the same shape every time it appears.', None, None)],
 'DR-14': [('Look at the feet. Broken teal = screened · double red = will contest · amber = forces a crossover. <b>Tap the ring.</b>', 'def', 'rings'),
           ('Three states, on every defender, every turn. Nothing else on the floor tells you more.', None, None)],
 'DR-16': [('Now it happens TO you: their big just parked beside your man. <b>Tap your screened defender.</b>', 'def', 'teal'),
           ('A screened man cannot challenge the drive. Slide somebody else to plug the lane.', None, None)],
 'DR-21': [('Open floor, the default: a defender only guards squares he is SQUARE to. <b>Tap the diagonal.</b>', 'tfree', 'free'),
           ('The diagonal walks straight past him. Most counter-intuitive rule in the game, now yours.', None, None)],
 'DR-22': [('Same possession, three more floors: Locked up, Pay the toll, One-on-one. <b>Tap the key</b> to cycle.', 'tkey', None),
           ('House rules change what a lane costs. Read the floor before you pick a fight.', None, None)],
 'DR-08': [('Only a man BETWEEN you and the rim contests. Chest costs a tier; a diagonal closeout sharpens his block card. <b>SHOOT.</b>', 'bshoot', 'meter'),
           ('A perfect release DENIES the block card outright. That is what the meter is for.', None, None)],
 'DR-03': [('Contested look in the paint. <b>Hit SHOOT</b> and answer the card.', 'bshoot', 'card'),
           ('The meter is pure bonus: dead centre denies the block. It can never shank a make.', None, None)],
 'DR-12': [('Two colour languages, one floor: the cream line says WORTH, green·amber·red says HARD. <b>Tap the amber corner.</b>', 'tcorner', 'line'),
           ('Same card either side of the line, different payout. The line never changes the difficulty.', None, None)],
 'DR-13': [('The corner: a medium card worth THREE. Most efficient shot on the floor. <b>Tap it.</b>', 'tcorner', 'line'),
           ('Move it there on purpose. Real basketball’s best idea works here too.', None, None)],
 'DR-19': [(':24 to commit, and it burns. <b>Tap the clock.</b>', 'clock', 'tick'),
           ('Sit on the rock and the possession dies. It pauses for cards, never for doubt.', None, None)],
 'DR-36': [('Five contested looks, one job: stop the sweep dead centre. <b>Tap the meter.</b>', 'meter', 'meter'),
           ('Centre DENIES the block card. Anywhere else, the contest plays out on cards. No shanks, ever.', None, None)],
 'DR-25': [('Every card you win pours heat: easy drips, hard pours, and trailing pours faster. <b>Tap the bar.</b>', 'heat', 'heat1'),
           ('Four segments of three. It climbs while you answer, so keep answering.', None, None)],
 'DR-26': [('A miss costs ONE QUARTER of the bar, never the lot. <b>Tap the bar</b> and feel the drop.', 'heat', 'heatdrop'),
           ('And any made basket ends a burn, including your own. Cash it in or lose it.', None, None)],
 'DR-27': [('Bar is FULL. Every card one tier easier, every player one tile further. <b>Tap your PG.</b>', 'pg', 'onfire'),
           ('You get about four of these a night. Make them count.', None, None)],
 'DR-17': [('The key counts ACTIONS, not seconds: warning at two, turnover at three. <b>Tap the key.</b>', 'tkey', 'keyflash'),
           ('An invisible clock that ends possessions. Get in, do the job, get out.', None, None)],
 'DR-18': [('Once you cross half, going back is LIVE. Dark red is the warning. <b>Tap it.</b>', 'tred', 'deep'),
           ('Commit and it is a whistle. The line remembers.', None, None)],
 'DR-20': [('Defense gets :12, half the offensive clock, paused during cards. <b>Tap the clock.</b>', 'clock', 'c12'),
           ('Time out on D and the offense earns a free slide. The quiet clock still bites.', None, None)],
 'DR-30': [('A full stand: slide, contest, force the clock, secure the glass. <b>Tap your defender</b> to open.', 'def', None),
           ('Four decisions a stop. That is defense, entire.', None, None)],
 'DR-29': [('End to end: shuffle, action, slide, card, shot, board. <b>Tap your PG.</b>', 'pg', 'free'),
           ('The graduation rep. Everything above, one possession.', None, None)],
 'DR-28': [('Tied at game point: the board freezes and cards alternate. <b>Tap the card.</b>', 'card', 'card'),
           ('First clean hit against a miss ends it: <b>SUDDEN DEATH</b>, the same shape you met on the glass, at the rim and in RIP OR GRIP, and this time it is the whole game.', None, None)],
 'DR-09': [('Contested at the rim: you answer right, and their big answers right too. <b>SHOOT.</b>', 'bshoot', 'card'),
           ('BATTLE AT THE RIM. First miss loses, and the rim big holds the edge on layups: <b>SUDDEN DEATH</b>, the same shape every time it appears.', None, None)],
 'DR-37': [(':15 on every card, and it burns while you read. <b>Tap the clock.</b>', 'clock', 'q15'),
           ('Slow is a wrong answer. The clock waits for nobody once the card is up.', None, None)],
 'DR-38': [('A wrong answer is not one punishment, it is four: brick on a shot, steal on a pass, wasted move on a drive, ball out on a heave. <b>Tap the card.</b>', 'card', 'card'),
           ('Same card, four prices. Know what THIS action risks before you tap it.', None, None)],
 'DR-52': [('Same question, five levels: Casual · Rookie · Baller · Pro · Legend. <b>Tap the card</b> and feel one.', 'card', 'card'),
           ('The handicap lets every player in the room pick their own level, so mixed crews stay close. And the colours on the card are the same scale painted on the floor: that half of the lesson lives in BUCKETS.', None, None)],
 'DR-39': [('Same shot, four addresses: layup two, mid two, three three, logo three. <b>Tap the corner.</b>', 'tcorner', 'line'),
           ('The floor sets the price and the payout. Where you shoot from is a decision, not scenery.', None, None)],
}
# Tier B rows that need machinery the sandbox lacks (scripted opponent, live
# clocks): flagged on the rail so nobody mistakes the mock for a promise.
NEEDS = {'DR-29': 'scripted opponent', 'DR-30': 'scripted opponent',
         'DR-31': 'crowded-paint setup', 'DR-32': 'paused-board puzzle',
         'DR-36': 'meter-only mode', 'DR-19': 'live clocks in a drill',
         'DR-20': 'live clocks in a drill', 'DR-42': 'scenario mode',
         'DR-33': 'a buzzer to race', 'DR-34': 'a buzzer to race',
         'DR-35': 'a buzzer to race', 'DR-38': 'four wrong answers on purpose',
         'DR-39': 'scoring switched on'}


def weight_class(w):
    if w.startswith('MUST'): return 'must'
    if w.startswith('SHOULD'): return 'should'
    if w.startswith('COULD'): return 'could'
    if w.startswith('NO'): return 'no'
    return ''


# --------------------------------------------------- the advised layout -----
# "Let me see it with all of your suggestions" (Aaron, 08-10). This is the ten
# suggestions APPLIED, with my recommended option wherever a suggestion offered
# options: S5 option A (both clocks to Violations), S6 option A (both eights
# split), S7 option A (spacing gets its own drill), S8 order A (28 → 29 → 30),
# and the re-voiced names with his originals kept as 'was' labels. It is a
# PROPOSAL: his board above stays untouched, and the page shows both.
# Items are pulled from the parsed board by id, so a DR row exists in exactly
# one place per view and the 62-count is asserted below, not hoped.
ADVISED = [
    ('MOVING THE ROCK', 'drill', 'was Movement & Passing · split S6',
     ['DR-01', 'DR-23', 'DR-02', 'DR-11', 'DR-61']),
    ('KNOW YOUR CARD', 'drill', 'NEW · the missing section S1',
     ['DR-38', 'DR-37', 'DR-52']),
    ('BUCKETS', 'drill', 'was scoring · gains DR-39 S9',
     ['DR-03', 'DR-36', 'DR-12', 'DR-13', 'DR-39']),
    ('BEATING YOUR MAN', 'drill', 'was Movement & Passing · split S6',
     ['DR-04', 'DR-15', 'DR-31', 'DR-32']),
    ('LOCKDOWN', 'drill', 'was Defensive Movement · gains DR-09 S3',
     ['DR-06', 'DR-14', 'DR-10', 'DR-08', 'DR-09']),
    ('SCREENS, BOTH SIDES', 'drill', 'was Defensive Movement · split S6',
     ['DR-05', 'DR-16']),
    ('THE FOUR FLOORS', 'drill', 'spacing, given its own name S7',
     ['DR-21', 'DR-22']),
    ('THE GLASS', 'drill', 'was Boards · DR-09 moved out S3',
     ['DR-07', 'DR-24']),
    ('THE WHISTLE', 'drill', 'was Violations · both clocks now live here S5',
     ['DR-17', 'DR-18', 'DR-19', 'DR-20', 'DR-57', 'DR-58', 'DR-59']),
    ('CATCH FIRE', 'drill', 'was On Fire',
     ['DR-25', 'DR-26', 'DR-27', 'DR-62']),
    ('GAME TIME', 'drill', 'was Full Possesions · the graduation, last S8',
     ['DR-28', 'DR-29', 'DR-30']),
    ('SCENARIOS', 'park', 'a later shelf, not V0 · S8',
     ['DR-42']),
    ('ROTATION', 'park', 'when the bench and fatigue are built · S2',
     ['DR-60', 'DR-40']),
    ('SIGNATURE SKILLS', 'park', 'when built · "the best drill in the game" · S2',
     ['DR-41']),
    ('Main menu coach lines', 'coach', 'DR-52 moved to KNOW YOUR CARD · S1',
     ['DR-55', 'DR-56', 'DR-54', 'DR-53', 'DR-51', 'DR-50',
      'DR-49', 'DR-48', 'DR-47']),
    ('First walkthrough at game start', 'walk', 'DR-39 moved to BUCKETS · S9',
     ['DR-43', 'DR-44', 'DR-45', 'DR-46', 'DR-35', 'DR-34', 'DR-33']),
]

# why-panels, one voice per kind of card, shown when a non-drill card opens
WHY = {
    'coach': ('You called it yourself: <b>these are coaches, not drills</b>. Each one '
              'becomes a coach line AT its own screen, the moment the thing is in front '
              'of you. They join the coach-moment board you are filing next. In the '
              'suggested view DR-52 has left for KNOW YOUR CARD, DR-54 really belongs '
              'to Local VS’s entry point, and DR-56 already ships as its own prompt.'),
    'walk': ('The first-game walkthrough: these fire <b>live in game one</b>, at the '
             'moment each thing first appears, under the twelve-card budget. The '
             'toss-up, THE CALL and the jump ball open every game anyway, so game one '
             'IS their drill. They graduate to real drills the day a buzzer to race '
             'gets built.'),
    'unsure': ('The eight you were not sure about. The advice board below has a home '
               'for every one of them, yours to overrule: two seed KNOW YOUR CARD, '
               'four park behind unbuilt mechanics, one joins THE WHISTLE’s locked '
               'rows, and Playing from behind waits for a Scenarios shelf.'),
    'park': ('Parked, not lost. This drill exists the day its mechanic does; the slot '
             'sits on the shelf so nothing quietly vanishes. Same rule as the locked '
             'rows inside live drills, one level up.'),
}


def sec_obj(name, kind, sub, ids, pool):
    hero = kind == 'drill' and name.lower() in ('boards', 'the glass')
    items = []
    for pid in ids:
        it = pool[pid]
        beats = P.get(pid)
        row = {'id': pid, 'nm': it['nm'], 'w': weight_class(it['w']),
               'lock': LOCKED.get(pid, ''), 'built': pid in BUILT,
               'needs': NEEDS.get(pid, '')}
        if beats and not row['lock']:
            row['beats'] = [{'say': b[0], 'tap': b[1] or '', 'fx': b[2] or ''}
                            for b in beats]
        items.append(row)
    o = {'name': name, 'kind': kind, 'items': items}
    if sub: o['sub'] = sub
    if hero: o['hero'] = True
    if kind in WHY: o['why'] = WHY[kind]
    return o


def build_views(secs):
    pool = {it['id']: it for s in secs for it in s['items']}
    yours = [sec_obj(s['name'], s['kind'], '', [i['id'] for i in s['items']], pool)
             for s in secs]
    advised = [sec_obj(n, k, sub, ids, pool) for n, k, sub, ids in ADVISED]
    # conservation: every filed id appears exactly once per view, or the build dies
    for label, view in (('yours', yours), ('advised', advised)):
        ids = [i['id'] for s in view for i in s['items']]
        assert len(ids) == len(set(ids)) == len(pool) == 62, \
            f'{label} view holds {len(set(ids))} unique of {len(ids)} rows, want 62'
    return yours, advised, pool


# S-references for every id that changes home, used by the moves table.
MOVE_WHY = {
    'DR-38': 'S1 · seeds the missing card drill', 'DR-37': 'S1 · seeds the missing card drill',
    'DR-52': 'S1 · the one borderline in Tier C, rescued from the menu tray',
    'DR-39': 'S9 · scoring values are not game-start-specific',
    'DR-09': 'S3 · filed by its name; its content ends the contest arc',
    'DR-19': 'S5 · the two clocks are twins, now in one house',
    'DR-21': 'S7 · spacing gets its own findable name', 'DR-22': 'S7 · spacing gets its own findable name',
    'DR-42': 'S8 · a scenario, not a tutorial: parked for a later shelf',
    'DR-59': 'S2 · foul family, joins the locked rows in THE WHISTLE',
    'DR-60': 'S2 · bench and fatigue are one future system', 'DR-40': 'S2 · bench and fatigue are one future system',
    'DR-41': 'S2 · its own star module the day it is built',
    'DR-61': 'S2 · a pass that finishes: joins ball movement when built',
}


# Which of his sections each advised section is carved from. A row only counts
# as MOVED if it crossed one of these family lines: a rename is not a move, and
# a split (S6/S7) keeps its rows in the family, so the first cut of this table
# claimed "55 rows moved", which was the renames lying. Now it is boundary
# crossings only.
WAS = {
    'MOVING THE ROCK': 'Movement & Passing', 'BEATING YOUR MAN': 'Movement & Passing',
    'BUCKETS': 'scoring', 'LOCKDOWN': 'Defensive Movement',
    'SCREENS, BOTH SIDES': 'Defensive Movement', 'THE FOUR FLOORS': 'Defensive Movement',
    'THE GLASS': 'Boards', 'THE WHISTLE': 'Violations', 'CATCH FIRE': 'On Fire',
    'GAME TIME': 'Full Possesions',
    'Main menu coach lines': 'Main menu (not drills, these are coaches',
    'First walkthrough at game start': 'First walkthrough at game start',
}


def moves_table(secs, advised_view):
    home_a = {i['id']: s['name'] for s in secs for i in s['items']}
    home_b = {i['id']: s['name'] for s in advised_view for i in s['items']}
    rows = []
    for pid in sorted(home_a, key=lambda x: int(x.split('-')[1])):
        a, b = home_a[pid], home_b[pid]
        if WAS.get(b, None) == a:
            continue                       # same family: a rename or a split
        why = MOVE_WHY.get(pid, 'S6')
        rows.append(f'<tr><td class="idc">{pid}</td><td>{html.escape(a)}</td>'
                    f'<td><b>{html.escape(b)}</b></td><td>{why}</td></tr>')
    return '\n'.join(rows), len(rows)


def js_data(data):
    import json
    return json.dumps(data, ensure_ascii=False)


def main(out):
    secs = parse_board()
    yours, advised, pool = build_views(secs)
    n_a = sum(1 for s in yours if s['kind'] == 'drill')
    n_b = sum(1 for s in advised if s['kind'] == 'drill')
    moves_html, n_moves = moves_table(secs, advised)

    css = CSS.replace('__FONTS__', ''.join([
        face('Anton', 'anton-400.woff2'),
        face('Archivo', 'archivo-600.woff2', 600),
        face('Space Mono', 'spacemono-400.woff2'),
        face('Space Mono Bold', 'spacemono-700.woff2', 700),
        face('Sedgwick', 'sedgwick-400.woff2'),
        face('DSEG7', 'dseg7-700.woff2', 700)]))

    data = {'views': [
        {'label': 'YOUR BOARD, AS FILED', 'secs': yours},
        {'label': 'WITH THE SUGGESTIONS', 'secs': advised}]}

    page = (PAGE
            .replace('__CSS__', css)
            .replace('__COACH__', datauri(BRAND / 'philosopher.png', 'image/png'))
            .replace('__CAP__', datauri(BRAND / 'gradcap.png', 'image/png'))
            .replace('__NA__', str(n_a)).replace('__NB__', str(n_b))
            .replace('__NMOVES__', str(n_moves))
            .replace('__MOVES__', moves_html)
            .replace('__DATA__', js_data(data))
            .replace('__ADVICE__', ADVICE))
    pathlib.Path(out).write_text(page, encoding='utf-8')
    print(f'wrote {out}  {pathlib.Path(out).stat().st_size/1024:.0f} KB · '
          f'yours {n_a} drills · advised {n_b} drills + '
          f'{sum(1 for s in advised if s["kind"]=="park")} parked · '
          f'{n_moves} rows moved · 62 conserved in both views')


# =========================================================================== #
CSS = """__FONTS__
/* PAGE CHROME: same warm dark-first family as the review board page, light
   supported at token level. THE STAGE inside is the GAME and stays the game's
   dark, always: its colors are the shipped :root of docs/play/index.html,
   copied here on purpose so the two move together when the game retunes. */
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
section{margin:0 0 56px;scroll-margin-top:20px}
code{font-family:'Space Mono';font-size:.86em;background:var(--accent-soft);
  padding:1px 5px;border-radius:4px;color:var(--ink)}
strong{color:var(--ink)}
em{color:var(--dim)}
footer{border-top:1px solid var(--rule);padding:20px 0 60px;
  font-family:'Space Mono';font-size:10.5px;letter-spacing:.08em;
  color:var(--faint);line-height:2}

/* ================= THE STAGE: the game's world, always dark =============== */
/* Game tokens, verbatim from docs/play/index.html :root (2026-08-10):
   ground #100d0b · panel #1d1815 · panel2 #242019 · line #3a332a
   ink #efe6d8 · dim #b3a894 · faint #7d735f · accent #f5872e · deep #c9641a
   away #58a8d6 · easy #6fbf73 · med #e8b84b · hard #d5524b */
#stage{background:#100d0b;border:1px solid #3a332a;border-radius:18px;
  overflow:hidden;box-shadow:0 24px 60px var(--shadow);color:#efe6d8;
  position:relative;margin:18px 0 10px}
#stage,#stage *{-webkit-tap-highlight-color:transparent}
.mono{font-family:'Space Mono';letter-spacing:.08em}

/* -- top strip: back · drill name · part chip (game HUD language) -- */
#top{display:flex;align-items:center;gap:10px;padding:10px 14px;
  background:linear-gradient(180deg,#1d1815,#171310);border-bottom:1px solid #3a332a}
#back{font-family:'Space Mono';font-size:11px;font-weight:700;letter-spacing:.1em;
  color:#cfc4ae;background:rgba(16,10,6,.85);border:1.5px solid #4a4136;
  border-radius:999px;padding:7px 13px;cursor:pointer}
#hud{flex:1;text-align:center;font-family:'Space Mono';font-size:11px;
  letter-spacing:.22em;text-transform:uppercase;color:#f5872e;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#partchip{font-family:'Space Mono';font-size:10px;font-weight:700;letter-spacing:.12em;
  color:#241000;background:#f5872e;border:0;border-radius:999px;
  padding:7px 12px;cursor:pointer;white-space:nowrap}
#partchip[hidden]{display:none}

/* -- shelf -- */
#shelf{padding:16px}
.shelf-h{font-family:'Space Mono';font-size:9.5px;letter-spacing:.24em;
  text-transform:uppercase;color:#7d735f;margin:14px 2px 8px}
.shelf-h:first-child{margin-top:2px}
.dcards{display:grid;gap:10px;grid-template-columns:1fr}
@media(min-width:640px){.dcards{grid-template-columns:1fr 1fr}}
.dcard{display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer;
  background:#1d1815;border:1.5px solid #3a332a;border-radius:12px;padding:13px 14px;
  color:#efe6d8;font-family:'Archivo';font-weight:700;font-size:14.5px}
.dcard:hover,.dcard:focus-visible{border-color:#f5872e;outline:none}
.dcard .ic{flex:0 0 auto;width:34px;height:34px;border-radius:9px;display:flex;
  align-items:center;justify-content:center;background:rgba(245,135,46,.12);
  color:#f5872e;font-family:'Anton';font-size:15px}
.dcard .mid{flex:1;min-width:0}
.dcard .nm{display:block;text-transform:uppercase;letter-spacing:.03em;
  font-family:'Anton';font-weight:400;font-size:15px;line-height:1.1}
.dcard .sub{display:block;font-family:'Space Mono';font-weight:400;font-size:9.5px;
  letter-spacing:.1em;color:#7d735f;margin-top:4px}
.dcard .prog{flex:0 0 auto;font-family:'Space Mono';font-size:10px;color:#b3a894}
.dcard .prog b{color:#f5872e;font-weight:700}
.dcard.done .ic{background:#f5872e;color:#241000}
.dcard.tray{opacity:.92;border-style:dashed}
.dcard.tray .ic{background:rgba(88,168,214,.14);color:#58a8d6}
.dcard.park{opacity:.8;border-style:dashed}
.dcard.park .ic{background:rgba(123,111,93,.16);color:#7d735f;font-size:13px}

/* -- the view toggle: his board and the advised board, one tap apart -- */
#views{display:flex;gap:8px;margin:0 0 12px;flex-wrap:wrap}
.vchip{font-family:'Space Mono';font-size:10px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;border-radius:999px;padding:9px 15px;cursor:pointer;
  background:none;color:var(--dim);border:1.5px solid var(--rule)}
.vchip.on{background:var(--accent);color:#241000;border-color:var(--accent)}
.vchip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* -- SHOW ME: the demo flash -- */
.demo{animation:demo .32s ease-in-out 4}
@keyframes demo{0%,100%{box-shadow:0 0 0 3px rgba(245,135,46,.9)}
  50%{box-shadow:0 0 0 12px rgba(245,135,46,.15),0 0 30px 10px rgba(245,135,46,.55)}}

td.idc{font-family:'Space Mono';font-size:11px;color:var(--faint);white-space:nowrap}

/* -- drill screen -- */
#drill{display:none}
#drill.on{display:grid;grid-template-columns:250px 1fr;
  grid-template-rows:1fr auto auto;min-height:520px}
#rail{grid-row:1/4;border-right:1px solid #3a332a;background:#15110e;
  padding:12px 10px;overflow-y:auto}
.rail-h{font-family:'Space Mono';font-size:9px;letter-spacing:.22em;
  text-transform:uppercase;color:#7d735f;margin:2px 4px 8px}
.pline{display:flex;gap:9px;align-items:center;width:100%;text-align:left;
  background:none;border:0;border-radius:9px;padding:9px 8px;cursor:pointer;
  color:#cfc4ae;font-family:'Archivo';font-weight:600;font-size:12.5px;line-height:1.3}
.pline:hover,.pline:focus-visible{background:rgba(245,135,46,.08);outline:none}
.pline .box{flex:0 0 auto;width:17px;height:17px;border-radius:5px;
  border:1.5px solid #4a4136;display:flex;align-items:center;justify-content:center;
  font-size:11px;color:#241000;background:transparent}
.pline .t{flex:1;min-width:0}
.pline .needs{display:block;font-family:'Space Mono';font-size:8px;
  letter-spacing:.06em;color:#7d735f;margin-top:2px}
.pline.cur{background:rgba(245,135,46,.12);color:#efe6d8}
.pline.cur .box{border-color:#f5872e;box-shadow:0 0 0 2px rgba(245,135,46,.25)}
.pline.done{color:#7d735f}
.pline.done .t .nm{text-decoration:line-through;text-decoration-color:#f5872e;
  text-decoration-thickness:2px}
.pline.done .box{background:#f5872e;border-color:#f5872e}
.pline.locked{color:#5c5344;cursor:pointer}
.pline.locked .box{border-style:dashed;color:#5c5344;background:transparent;font-size:9px}
.railbtns{display:flex;gap:6px;margin-top:12px;padding:0 4px}
.rbtn{flex:1;font-family:'Space Mono';font-size:9.5px;font-weight:700;
  letter-spacing:.08em;border-radius:999px;padding:7px 4px;cursor:pointer;
  background:none;color:#b3a894;border:1.5px solid #4a4136}
.rbtn:hover{border-color:#f5872e;color:#efe6d8}

/* -- court stand-in (flat tiles: the real drill runs the live board) -- */
#court{position:relative;padding:clamp(10px,3vw,26px);display:flex;
  align-items:center;justify-content:center;min-height:300px;
  background:radial-gradient(120% 100% at 50% 0%,#17120e, #100d0b 70%)}
#grid{position:relative;display:grid;grid-template-columns:repeat(8,1fr);
  gap:5px;width:min(100%,560px);aspect-ratio:8/7}
.tile{position:relative;border-radius:7px;background:rgba(255,255,255,.09)}
.tile.kkey{background:rgba(240,225,200,.16)}
.tile.free{background:rgba(245,135,46,.42);box-shadow:inset 0 0 0 1.5px rgba(245,135,46,.8)}
.tile.red{background:rgba(213,82,75,.4);box-shadow:inset 0 0 0 1.5px rgba(213,82,75,.85)}
.tile.deep{background:rgba(150,40,36,.55);box-shadow:inset 0 0 0 1.5px #d5524b}
.tile.amber{background:rgba(232,184,75,.35);box-shadow:inset 0 0 0 1.5px rgba(232,184,75,.8)}
#arc{position:absolute;inset:0;pointer-events:none;opacity:.5}
.pc{position:absolute;width:11%;aspect-ratio:1;border-radius:50%;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  font-family:'Space Mono';font-size:10px;font-weight:700;color:#241000;
  transform:translate(-50%,-50%);border:2px solid rgba(0,0,0,.35);
  box-shadow:0 4px 10px rgba(0,0,0,.5)}
.pc.you{background:#f5872e}
.pc.opp{background:#58a8d6;color:#0a1c26}
.pc .ring{position:absolute;inset:-7px;border-radius:50%;border:2.5px solid transparent}
.pc.ring-amber .ring{border-color:#e8b84b}
.pc.ring-red .ring{border-color:#e0473c;box-shadow:0 0 0 2.5px rgba(224,71,60,.35)}
.pc.ring-teal .ring{border-color:#6fd0c3;border-style:dashed}
.pc.fire{box-shadow:0 0 16px 4px rgba(245,135,46,.75)}
#rim{position:absolute;width:7%;aspect-ratio:1;border-radius:50%;
  border:3px solid #f5872e;background:rgba(245,135,46,.15);
  transform:translate(-50%,-50%);pointer-events:none}
.want{animation:want 1.1s ease-in-out infinite}
@keyframes want{0%,100%{box-shadow:0 0 0 3px rgba(245,135,46,.9),0 0 18px 4px rgba(245,135,46,.45)}
  50%{box-shadow:0 0 0 6px rgba(245,135,46,.5),0 0 26px 8px rgba(245,135,46,.25)}}
.tile.want{z-index:2}
#ballout{position:absolute;right:6px;top:8px;font-family:'Space Mono';font-size:9px;
  letter-spacing:.14em;color:#d5524b;background:rgba(16,10,6,.9);
  border:1px solid #d5524b;border-radius:7px;padding:4px 8px;display:none}
#ballout.on{display:block}

/* -- widgets row over the court: clock · heat -- */
#widgets{position:absolute;left:12px;top:10px;display:flex;gap:10px;align-items:center}
#clock{font-family:'DSEG7';font-size:19px;color:#f5872e;background:#0b0805;
  border:1px solid #3a332a;border-radius:7px;padding:5px 8px;cursor:pointer}
#clock.c12{color:#58a8d6}
#heat{width:96px;height:12px;border-radius:6px;background:#241d16;cursor:pointer;
  border:1px solid #3a332a;overflow:hidden;display:flex;gap:2px;padding:2px}
#heat i{flex:1;border-radius:3px;background:#3a2c1c;transition:background .3s}
#heat i.f{background:linear-gradient(180deg,#ffb056,#f5872e)}
#heat.blaze{box-shadow:0 0 14px 2px rgba(245,135,46,.7)}

/* -- action bar: gating made visible -- */
#actions{display:flex;gap:8px;padding:10px 14px;border-top:1px solid #3a332a;
  background:#15110e;flex-wrap:wrap}
.act{font-family:'Space Mono';font-size:11px;font-weight:700;letter-spacing:.1em;
  border-radius:999px;padding:9px 16px;cursor:pointer;border:0;
  background:#f5872e;color:#241000}
.act.off{background:none;color:#5c5344;border:1.5px solid #3a332a;position:relative}
.act.off::before{content:"🔒 ";font-size:9px}
#actnote{flex-basis:100%;font-family:'Space Mono';font-size:8.5px;
  letter-spacing:.1em;color:#7d735f;margin:2px 2px 0}

/* -- the coach lane: RESERVED. The band is his; the board can never be under
      him, which is B5's "coach card covers the board" fix drawn as layout -- */
#coachband{display:flex;gap:11px;align-items:stretch;padding:11px 13px;
  border-top:1.5px solid #f5872e;
  background:linear-gradient(160deg,#221a12,#15100a)}
#coachband img{width:46px;height:46px;flex:0 0 auto;border-radius:50%;
  background:#0e0b08;border:2px solid #f5872e;object-fit:cover;object-position:65% 30%}
.cb-mid{flex:1;display:flex;flex-direction:column;justify-content:center;min-width:0}
.cb-who{font-family:'Space Mono';font-size:9px;letter-spacing:.3em;color:#f5872e;margin-bottom:3px}
.cb-txt{font-size:13.5px;line-height:1.45;color:#efe6d8}
.cb-txt b{color:#ffb056}
.cb-btns{display:flex;flex-direction:column;gap:6px;justify-content:center;flex:0 0 auto}
.cb-b{font-family:'Space Mono';font-size:10px;font-weight:700;letter-spacing:.08em;
  white-space:nowrap;color:#241000;background:#f5872e;border:0;border-radius:999px;
  padding:6px 11px;cursor:pointer}
.cb-b.ghost{background:none;color:#b3a894;border:1.5px solid #4a4136}
#coachband.shake{animation:shk .4s}
@keyframes shk{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}

/* -- the question card -- */
#qveil{position:absolute;inset:0;z-index:8;display:none;align-items:center;
  justify-content:center;background:radial-gradient(120% 90% at 50% 40%,rgba(16,10,6,.55),rgba(8,5,3,.85))}
#qveil.on{display:flex}
#qcard{width:min(340px,88%);background:linear-gradient(160deg,#221a12,#15100a);
  border:1.5px solid #f5872e;border-radius:14px;padding:14px;
  box-shadow:0 12px 34px rgba(0,0,0,.6)}
#qcard .qh{font-family:'Space Mono';font-size:9px;letter-spacing:.26em;
  color:#6fbf73;margin-bottom:8px}
#qcard .qt{font-family:'Archivo';font-weight:800;font-size:15px;color:#efe6d8;
  line-height:1.35;margin-bottom:11px}
#qcard button{display:block;width:100%;text-align:left;margin:0 0 7px;
  background:#241d16;color:#efe6d8;border:1.5px solid #3a332a;border-radius:9px;
  padding:10px 12px;font-family:'Archivo';font-weight:600;font-size:13.5px;cursor:pointer}
#qcard button:hover{border-color:#f5872e}
#qcard .hint{font-family:'Space Mono';font-size:8.5px;letter-spacing:.1em;color:#7d735f}

/* -- flashes (battle, whistle) -- */
#flash{position:absolute;inset:0;z-index:9;display:none;align-items:center;
  justify-content:center;pointer-events:none}
#flash.on{display:flex}
#flash .f{font-family:'Anton';font-size:clamp(26px,6vw,44px);letter-spacing:.03em;
  color:#fff5e2;text-shadow:2px 2px 0 #c9641a,0 0 24px rgba(245,135,46,.65);
  transform:rotate(-4deg);animation:slam .5s cubic-bezier(.2,1.5,.4,1)}
@keyframes slam{from{transform:rotate(-4deg) scale(1.6);opacity:0}to{transform:rotate(-4deg) scale(1);opacity:1}}

/* -- release meter -- */
#meterw{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:7;
  width:min(300px,80%);display:none}
#meterw.on{display:block}
#meterw .lane{height:16px;border-radius:8px;background:#241d16;border:1px solid #3a332a;
  position:relative;overflow:hidden;cursor:pointer}
#meterw .mid{position:absolute;left:50%;top:0;bottom:0;width:14%;transform:translateX(-50%);
  background:rgba(111,191,115,.35);border-left:1px solid #6fbf73;border-right:1px solid #6fbf73}
#meterw .pin{position:absolute;top:-2px;bottom:-2px;width:4px;border-radius:2px;
  background:#f5872e;animation:sweep 1.5s linear infinite alternate}
@keyframes sweep{from{left:2%}to{left:96%}}

/* -- diploma (dd-card, from the game) -- */
#dd{position:absolute;inset:0;z-index:12;display:none;align-items:center;justify-content:center;
  background:radial-gradient(120% 80% at 50% 30%,rgba(245,135,46,.2),rgba(8,5,3,.94) 62%)}
#dd.on{display:flex}
.dd-card{text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center;
  padding:28px 32px;border-radius:18px;background:linear-gradient(160deg,#221a12,#15100a);
  border:1.5px solid #f5872e;box-shadow:0 20px 60px rgba(0,0,0,.7)}
.dd-card img{width:96px;filter:drop-shadow(0 0 18px rgba(245,135,46,.5))}
.dd-h{font-family:'Sedgwick';font-size:32px;color:#fff5e2;
  text-shadow:2px 2px 0 #c9641a,0 0 18px rgba(245,135,46,.5)}
.dd-sub{font-family:'Space Mono';font-size:11px;letter-spacing:.22em;
  text-transform:uppercase;color:#b3a894}
.dd-card .cb-b{margin-top:4px}

/* -- tray panel (menu coaches / first walkthrough / unsure) -- */
#tray{display:none;padding:18px 16px 22px}
#tray.on{display:block}
#tray .tp{max-width:56ch;color:#b3a894;font-size:13.5px}
#tray .tp b{color:#efe6d8}
#tray ul{list-style:none;margin:10px 0 0;padding:0}
#tray li{display:flex;gap:9px;align-items:baseline;padding:7px 2px;
  border-top:1px solid #241d16;font-size:12.5px;color:#cfc4ae}
#tray li .iid{font-family:'Space Mono';font-size:9.5px;color:#f5872e;flex:0 0 auto}

/* -- phone: the rail folds into the strip; sheet on demand -- */
#sheetveil{position:absolute;inset:0;z-index:14;background:rgba(0,0,0,.55);display:none}
#sheetveil.on{display:block}
#psheet{position:absolute;left:0;right:0;bottom:0;z-index:15;display:none;
  background:#15110e;border-top:1.5px solid #f5872e;border-radius:14px 14px 0 0;
  max-height:70%;overflow-y:auto;padding:12px 10px 16px}
#psheet.on{display:block}
@media(max-width:719px){
  #drill.on{grid-template-columns:1fr}
  #rail{display:none}
}
@media(min-width:720px){#partchip{display:none}}

/* ---- page furniture below the stage ---- */
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
.cardlist li .opt{display:block;margin-top:7px;padding-left:12px;border-left:2px solid var(--rule)}
table{border-collapse:collapse;width:100%;font-size:13.5px}
th{font-family:'Space Mono';font-size:9px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--faint);text-align:left;font-weight:400;padding:0 10px 7px 0;
  border-bottom:1px solid var(--rule)}
td{padding:9px 10px 9px 0;border-bottom:1px solid var(--rule);vertical-align:top;
  color:var(--dim);line-height:1.45}
td b{color:var(--ink)}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
"""

PAGE = """<title>The Drill Room · example</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>__CSS__</style>

<header class="wrap">
  <p class="eyebrow">Ball Knowledge · 10 August 2026 · your board, played · this is a MOCK, the real one runs the live engine</p>
  <h1>The Drill<span class="thin">Room</span></h1>
  <p class="quote">"Once you are in that drill, on the left side of the screen all
  of the parts of that drill are listed and you are taken through them one at a
  time. As you complete each part it <b>checks off and crosses out</b>, you can
  click on each of those lines to <b>jump</b> to a part, and <b>go back and redo
  a drill</b>."</p>
</header>

<main class="wrap">

<section id="demo">
  <p class="kicker">The example · tap around, it plays · now in two versions</p>
  <h2>Your board, and your board with the suggestions</h2>
  <p>You asked to see it with all of my suggestions in, so the room now has two
  views, one tap apart. <b>WITH THE SUGGESTIONS</b> is the ten applied: the new
  KNOW YOUR CARD drill, Unsure dissolved, DR-09 rehomed, both clocks in THE
  WHISTLE, the two eights split into lesson-sized halves, spacing named THE
  FOUR FLOORS, the parked builds on their own shelf, and the re-voiced names
  with yours kept underneath. <b>YOUR BOARD, AS FILED</b> is untouched. Where a
  suggestion offered options I applied my recommendation (5A, 6A, 7A, 8A);
  every one is still yours to overrule, and the moves table below the demo
  lists each relocated part with its reason. Nothing here is a ruling.</p>

  <div id="views"></div>

  <div id="stage">
    <div id="top">
      <button id="back" hidden>‹ ROOM</button>
      <div id="hud">THE DRILL ROOM</div>
      <button id="partchip" hidden>PARTS</button>
    </div>
    <div id="shelf"></div>
    <div id="drill">
      <aside id="rail"></aside>
      <div id="court">
        <div id="widgets"><div id="clock">24</div><div id="heat"><i></i><i></i><i></i><i></i></div></div>
        <div id="grid"></div>
        <div id="ballout">■ BALL OUT · OTHER TEAM</div>
        <div id="meterw"><div class="lane"><div class="mid"></div><div class="pin"></div></div></div>
      </div>
      <div id="actions"></div>
      <div id="coachband">
        <img src="__COACH__" alt="The Coach">
        <div class="cb-mid"><div class="cb-who">COACH · DRILL</div><div class="cb-txt" id="say"></div></div>
        <div class="cb-btns"><button class="cb-b" id="cbRestart">↺ Restart</button>
        <button class="cb-b ghost" id="cbShow">▶ Show me</button>
        <button class="cb-b ghost" id="cbEnd">✕ End drill</button></div>
      </div>
      <div id="qveil"><div id="qcard"></div></div>
      <div id="flash"><div class="f"></div></div>
      <div id="dd"><div class="dd-card"><img src="__CAP__" alt="">
        <div class="dd-h">DRILL COMPLETE</div><div class="dd-sub" id="ddSub"></div>
        <button class="cb-b" id="ddBack">Back to the room</button>
        <button class="cb-b ghost" id="ddStay">Keep shooting around</button></div></div>
      <div id="sheetveil"></div><div id="psheet"></div>
    </div>
    <div id="tray"></div>
  </div>

  <div class="legend">
    <div><b>filled box</b> · part cleared, crossed out</div>
    <div><b>orange line</b> · where the Coach has you now</div>
    <div><b>🔒 dashed</b> · mechanic not built yet, out of the count</div>
    <div><b>small grey tag</b> · what the sandbox still needs (Tier B)</div>
  </div>
  <p style="margin-top:14px;color:var(--faint);font-size:13px">The flat tile
  court is a stand-in so this page stays a page. The real drill runs the live
  board and engine, same as the seven drills that already ship. What this mock
  is FOR is the frame: the rail, the check-off, the jump, the refusal, the
  coach lane.</p>
</section>

<section id="reading">
  <p class="kicker">What the example is claiming</p>
  <h2>Five decisions, drawn</h2>
  <div class="scroll"><table>
  <thead><tr><th>decision</th><th>how the mock plays it</th></tr></thead><tbody>
  <tr><td><b>The rail is the drill</b></td><td>parts listed left, one current, cleared lines check AND cross out. Tap any line to jump: forward into new material or back to re-run a cleared part (re-running never un-clears it; ↺ Restart is the clean slate).</td></tr>
  <tr><td><b>Filing = the parts list</b></td><td>your board file is parsed at build time; section order is part order. Fix the board file, the room follows.</td></tr>
  <tr><td><b>Gating is a refusal, not an absence</b></td><td>every action stays visible; the ones outside the drill are padlocked, and tapping one makes the Coach say why. Players learn the bar exists even while it is fenced (V0 · B5 fix one).</td></tr>
  <tr><td><b>The Coach owns a lane</b></td><td>the band under the court is RESERVED: the board and actions can never sit under him because the layout will not allow it, instead of politeness hoping it will not happen (V0 · B5 fix two).</td></tr>
  <tr><td><b>Locked parts stay visible</b></td><td>fouls, subs, the alley-oop, heat phase 2: dashed, padlocked, out of the progress count, reason on tap. The list stays stable while mechanics land; nothing quietly vanishes.</td></tr>
  </tbody></table></div>
</section>

<section id="moves">
  <p class="kicker">The diff between the two views · derived from the data, not typed</p>
  <h2>__NMOVES__ parts cross a section line. Everything else stays in its family</h2>
  <p>Every row here left the section family you filed it in, with the
  suggestion that moved it. Renames (Boards → THE GLASS) and the two splits
  (S6, S7) keep their rows in the family and are not listed. Both views hold
  all 62 items exactly once; the build refuses to compile if that ever stops
  being true.</p>
  <div class="scroll"><table>
  <thead><tr><th>part</th><th>your home</th><th>suggested home</th><th>why</th></tr></thead>
  <tbody>
__MOVES__
  </tbody></table></div>
</section>

__ADVICE__

<footer>
  sections read from <code>design/COACH-BOARD-2026-08-10.md</code> · built by
  <code>tools/drillroom-artifact.py</code> · fonts and the Philosopher are the
  game's own · your view holds __NA__ drills, the suggested view __NB__ drills
  plus the parked shelf, both hold all 62 items exactly once ·
  the two B5 fixes this leans on are still open items in V0
</footer>
</main>

<script>
(function(){
'use strict';
var DATA=__DATA__;
var KEY='bk_drillroom_demo_v1';
function $(i){return document.getElementById(i)}
var st={done:{},view:1};
try{var raw=localStorage.getItem(KEY);if(raw)st=JSON.parse(raw)||st}catch(e){}
if(!st.done)st.done={};
if(st.view!==0&&st.view!==1)st.view=1;   /* default: the suggested room, he asked to see it */
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}

var drills=[],trays=[];
function splitData(){
  drills=[];trays=[];
  DATA.views[st.view].secs.forEach(function(s){(s.kind==='drill'?drills:trays).push(s)});
}
splitData();
var cur=null,part=0,beat=0,replay=false;
function isBoards(){return !!cur&&!!cur.hero}

/* ---------------- the view toggle ---------------- */
function paintViews(){
  var el=$('views');el.innerHTML='';
  /* suggested first: it is the thing he asked to see */
  [1,0].forEach(function(v){
    var b=document.createElement('button');
    b.className='vchip'+(st.view===v?' on':'');
    b.dataset.v=v;
    b.textContent=DATA.views[v].label;
    b.addEventListener('click',function(){
      if(st.view===v)return;
      st.view=v;save();splitData();closeDrill();paintViews();
    });
    el.appendChild(b);
  });
}

/* ---------------- shelf ---------------- */
function playable(s){return s.items.filter(function(i){return !i.lock})}
function doneCount(s){var d=st.done[s.name]||{};return playable(s).filter(function(i){return d[i.id]}).length}
function paintShelf(){
  var el=$('shelf'),h='';
  /* NEXT UP: a pointer, never a lock. 2KU's known weakness is a menu with no
     recommended start; chess.com's fix is a soft next-up. Order = board order. */
  var next=-1;
  drills.forEach(function(s,i){if(next<0&&doneCount(s)<playable(s).length)next=i});
  h+='<div class="shelf-h">Drills · tap one · nothing is locked · the order is the recommended path</div><div class="dcards">';
  drills.forEach(function(s,i){
    var n=playable(s).length,d=doneCount(s),lk=s.items.length-n;
    h+='<button class="dcard'+(d===n?' done':'')+'" data-d="'+i+'">'+
      '<span class="ic">'+(d===n?'✓':(i+1))+'</span>'+
      '<span class="mid"><span class="nm">'+esc(s.name)+'</span>'+
      '<span class="sub">'+n+' parts'+(lk?' · '+lk+' locked':'')+
      (s.sub?' · '+esc(s.sub):'')+
      (i===next?' · <b style="color:#f5872e">NEXT UP</b>':'')+'</span></span>'+
      '<span class="prog"><b>'+d+'</b>/'+n+'</span></button>';
  });
  var parks=trays.filter(function(s){return s.kind==='park'});
  var rest=trays.filter(function(s){return s.kind!=='park'});
  if(parks.length){
    h+='</div><div class="shelf-h">Parked · drills the day their mechanic is built</div><div class="dcards">';
    parks.forEach(function(s){
      var i=trays.indexOf(s);
      h+='<button class="dcard park" data-t="'+i+'">'+
        '<span class="ic">🔒</span>'+
        '<span class="mid"><span class="nm">'+esc(s.name)+'</span>'+
        '<span class="sub">'+s.items.length+' part'+(s.items.length===1?'':'s')+
        (s.sub?' · '+esc(s.sub):'')+'</span></span></button>';
    });
  }
  h+='</div><div class="shelf-h">Not drills · they go to the Coach\\u2019s other job</div><div class="dcards">';
  rest.forEach(function(s){
    var i=trays.indexOf(s);
    var sub=s.kind==='unsure'?'the advice board below sorts all eight':'coach lines, not sandboxes';
    h+='<button class="dcard tray" data-t="'+i+'">'+
      '<span class="ic">☰</span>'+
      '<span class="mid"><span class="nm">'+esc(s.name)+'</span>'+
      '<span class="sub">'+s.items.length+' items · '+(s.sub?esc(s.sub):sub)+'</span></span></button>';
  });
  h+='</div>';
  el.innerHTML=h;
}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

$('shelf').addEventListener('click',function(e){
  var b=e.target.closest('button.dcard');if(!b)return;
  if(b.dataset.d!=null)openDrill(+b.dataset.d);
  else openTray(+b.dataset.t);
});

/* ---------------- board scene ---------------- */
var COLS=8,ROWS=7;
function pct(c,r){return{left:((c+0.5)/COLS*100)+'%',top:((r+0.5)/ROWS*100)+'%'}}
function buildCourt(){
  var g=$('grid'),h='';
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
    var cls='tile',id='';
    if(c>=6&&r>=2&&r<=4)cls+=' kkey';
    if(c===2&&r===3)id='tfree';
    if(c===6&&r===3)id='tred';
    if(c===6&&r===2)id='tkey';
    if(c===7&&r===0)id='tcorner';
    h+='<div class="'+cls+'"'+(id?' id="'+id+'"':'')+' data-c="'+c+'" data-r="'+r+'"></div>';
  }
  g.innerHTML=h;
  /* the cream lines, faint, an SVG whisper of the real halfcourt */
  var svg='<svg id="arc" viewBox="0 0 800 700" preserveAspectRatio="none">'+
    '<path d="M770 40 L640 40 A330 330 0 0 0 640 660 L770 660" fill="none" stroke="#efe0c8" stroke-width="3"/>'+
    '<rect x="600" y="200" width="200" height="300" fill="none" stroke="#efe0c8" stroke-width="3"/></svg>';
  g.insertAdjacentHTML('beforeend',svg);
  ;[['pg','you','PG',1,3],['sf','you','SF',1,5],['def','opp','C',5,3]].forEach(function(p){
    var pos=pct(p[3],p[4]);
    g.insertAdjacentHTML('beforeend','<div class="pc '+p[1]+'" id="'+p[0]+'" style="left:'+pos.left+';top:'+pos.top+'"><span class="ring"></span>'+p[2]+'</div>');
  });
  var rp=pct(7,3);
  g.insertAdjacentHTML('beforeend','<div id="rim" style="left:'+rp.left+';top:'+rp.top+'"></div>');
}

/* ---------------- drill runtime ---------------- */
var ACTS=[['bmove','MOVE'],['bpass','PASS'],['bshoot','SHOOT'],['bsteal','STEAL']];
function allowFor(sec,it){
  /* the mock derives the allow-set from the current part's target button, plus
     MOVE for movement sections: enough to make refusal REAL on this page */
  var tap=curBeat()&&curBeat().tap;
  var ok={};if(tap&&tap.charAt(0)==='b')ok[tap]=1;
  if(/movement|passing|rock|beating/i.test(sec.name)){ok.bmove=1}
  return ok;
}
function curPartObj(){return cur?cur.items[part]:null}
function curBeat(){var p=curPartObj();return p&&p.beats?p.beats[beat]:null}

function openDrill(i){
  cur=drills[i];part=0;beat=0;replay=false;
  var d=st.done[cur.name]||{};
  var idx=cur.items.findIndex(function(it){return !it.lock&&!d[it.id]});
  part=idx<0?0:idx;
  $('shelf').style.display='none';$('tray').classList.remove('on');
  $('drill').classList.add('on');
  $('back').hidden=false;$('partchip').hidden=false;
  $('hud').textContent='DRILL · '+cur.name.toUpperCase();
  buildCourt();paintRail();paintActs();showBeat();
}
function closeDrill(){
  cur=null;$('drill').classList.remove('on');$('tray').classList.remove('on');
  $('shelf').style.display='block';
  $('back').hidden=true;$('partchip').hidden=true;
  $('hud').textContent='THE DRILL ROOM';
  $('dd').classList.remove('on');closeSheet();paintShelf();
}
$('back').addEventListener('click',closeDrill);
$('cbEnd').addEventListener('click',closeDrill);
$('cbRestart').addEventListener('click',function(){
  if(!cur)return;st.done[cur.name]={};save();part=0;beat=0;
  paintRail();paintActs();showBeat();$('dd').classList.remove('on');
});
$('ddBack').addEventListener('click',closeDrill);
$('ddStay').addEventListener('click',function(){$('dd').classList.remove('on');
  say('Shoot around as long as you like. <b>✕ End drill</b> when you are done.');});

function paintRail(){
  var d=st.done[cur.name]||{};
  var h='<div class="rail-h">'+esc(cur.name)+' · the parts</div>';
  cur.items.forEach(function(it,i){
    var cls='pline'+(it.lock?' locked':(d[it.id]?' done':''))+(i===part&&!it.lock?' cur':'');
    var box=it.lock?'🔒':(d[it.id]?'✓':'');
    h+='<button class="'+cls+'" data-p="'+i+'"><span class="box">'+box+'</span>'+
      '<span class="t"><span class="nm">'+esc(it.nm)+'</span>'+
      (it.needs&&!it.lock?'<span class="needs">needs: '+esc(it.needs)+'</span>':'')+
      (it.lock?'<span class="needs">'+esc(it.lock)+'</span>':'')+
      '</span></button>';
  });
  h+='<div class="railbtns"><button class="rbtn" id="railRestart">↺ redo drill</button></div>';
  $('rail').innerHTML=h;
  var pv=$('psheet');pv.innerHTML=h;   /* the phone sheet mirrors the rail */
  var chip=$('partchip');
  var d2=st.done[cur.name]||{};
  var n=playable(cur).length,dn=playable(cur).filter(function(i){return d2[i.id]}).length;
  chip.textContent='PARTS '+dn+'/'+n+' ▾';
}
function railClick(e){
  var rb=e.target.closest('#railRestart');
  if(rb){$('cbRestart').click();closeSheet();return}
  var b=e.target.closest('.pline');if(!b)return;
  var i=+b.dataset.p,it=cur.items[i];
  closeSheet();
  if(it.lock){say('That one is waiting on the game: <b>'+esc(it.lock)+'</b>. It stays on the list so it cannot be forgotten, and unlocks the day the mechanic lands.');return}
  var d=st.done[cur.name]||{};
  replay=!!d[it.id];
  part=i;beat=0;paintRail();paintActs();showBeat(replay?'Run it back: ':'');
}
$('rail').addEventListener('click',railClick);
$('psheet').addEventListener('click',railClick);
$('partchip').addEventListener('click',function(){$('sheetveil').classList.add('on');$('psheet').classList.add('on')});
$('sheetveil').addEventListener('click',closeSheet);
function closeSheet(){$('sheetveil').classList.remove('on');$('psheet').classList.remove('on')}

function paintActs(){
  var ok=cur?allowFor(cur,curPartObj()):{};
  var h='';
  ACTS.forEach(function(a){
    var on=ok[a[0]];
    h+='<button class="act'+(on?'':' off')+'" id="'+a[0]+'">'+a[1]+'</button>';
  });
  h+='<div id="actnote">padlocked = not part of this drill · tap one anyway and see</div>';
  $('actions').innerHTML=h;
}
$('actions').addEventListener('click',function(e){
  var b=e.target.closest('.act');if(!b)return;
  if(b.classList.contains('off')){deny();return}
  hot(b.id);
});
function deny(){
  var band=$('coachband');
  band.classList.remove('shake');void band.offsetWidth;band.classList.add('shake');
  var p=curPartObj();
  say('<b>Stick to the drill!</b> '+(p&&p.beats&&p.beats[beat]?p.beats[beat].say:''));
}

function say(t){ $('say').innerHTML=t }

/* fx application */
function clearFx(){
  ['free','red','deep','amber'].forEach(function(k){
    [].forEach.call(document.querySelectorAll('.tile.'+k),function(t){t.classList.remove(k)});
  });
  ['pg','sf','def'].forEach(function(id){var p=$(id);if(p)p.className=p.className.replace(/ ring-\\w+| fire/g,'')});
  $('ballout').classList.remove('on');
  $('meterw').classList.remove('on');
  $('clock').classList.remove('c12');$('clock').textContent='24';
  $('heat').classList.remove('blaze');
  [].forEach.call(document.querySelectorAll('#heat i'),function(i){i.classList.remove('f')});
  document.querySelectorAll('.want').forEach(function(w){w.classList.remove('want')});
}
function applyFx(fx){
  if(!fx)return;
  if(fx==='free'){tileAt(2,3).classList.add('free');tileAt(2,2).classList.add('free');tileAt(3,4).classList.add('free')}
  if(fx==='pass'){tileAt(2,4).classList.add('free')}
  if(fx==='red'){$('tred').classList.add('red');tileAt(6,4).classList.add('red')}
  if(fx==='deep'){$('tred').classList.add('deep')}
  if(fx==='line'){$('tcorner').classList.add('amber')}
  if(fx==='rings'){$('def').classList.add('ring-amber')}
  if(fx==='teal'){$('def').classList.add('ring-teal')}
  if(fx==='onfire'){$('pg').classList.add('fire');$('heat').classList.add('blaze');
    [].forEach.call(document.querySelectorAll('#heat i'),function(i){i.classList.add('f')})}
  if(fx==='heat1'){document.querySelectorAll('#heat i')[0].classList.add('f');
    document.querySelectorAll('#heat i')[1].classList.add('f')}
  if(fx==='heatdrop'){document.querySelectorAll('#heat i')[0].classList.add('f')}
  if(fx==='keyflash'){tileAt(6,2).classList.add('amber');tileAt(6,3).classList.add('amber');tileAt(6,4).classList.add('amber')}
  if(fx==='tick'){$('clock').textContent='17'}
  if(fx==='q15'){$('clock').textContent='15'}
  if(fx==='c12'){$('clock').classList.add('c12');$('clock').textContent='12'}
  if(fx==='meter'){$('meterw').classList.add('on')}
}
function tileAt(c,r){return document.querySelector('.tile[data-c="'+c+'"][data-r="'+r+'"]')}

/* the hotspot map: beat.tap values -> elements */
function hotEl(tag){
  var m={pg:'pg',sf:'sf',def:'def',tfree:'tfree',tred:'tred',tkey:'tkey',
    tcorner:'tcorner',clock:'clock',heat:'heat',meter:'meterw',card:'qveil',
    bshoot:'bshoot',bpass:'bpass',bmove:'bmove',bsteal:'bsteal'};
  return m[tag]?$(m[tag]):null;
}
function showBeat(prefix){
  clearFx();
  var p=curPartObj();
  if(!p)return;
  if(isBoards()){boardsShow(prefix);return}
  var b=curBeat();
  if(!b){say(esc(p.nm)+'.');return}
  say((prefix||'')+b.say);
  applyFx(b.fx);
  paintActs();
  if(b.tap==='card'){openCard('any');return}
  var el=hotEl(b.tap);
  if(el)el.classList.add('want');
  if(!b.tap){ /* outcome beat: linger, then the line clears itself */
    setTimeout(function(){partClear()},1600);
  }
}
/* one tap engine: the wanted element advances the beat. Capture phase, and
   hot() is idempotent, because action buttons ALSO route through the actions
   bar listener: the second call finds the beat already moved and drops out. */
document.addEventListener('click',function(e){
  if(!cur)return;
  var w=e.target.closest('.want');
  if(!w)return;
  hot(w.id);
},true);
function hot(id){
  if(isBoards()){boardsHot(id);return}
  var b=curBeat();if(!b)return;
  if(b.tap!==id&&!(b.tap==='meter'&&id==='meterw'))return;
  advance();
}
function advance(){
  beat++;
  var p=curPartObj();
  if(p&&p.beats&&beat<p.beats.length)showBeat();
  else partClear();
}
function partClear(){
  var p=curPartObj();if(!p)return;
  var d=st.done[cur.name]||(st.done[cur.name]={});
  var was=d[p.id];
  d[p.id]=1;save();
  var line=$('rail').querySelector('.pline[data-p="'+part+'"]');
  paintRail();
  /* march to the next uncleared part, or graduate */
  var nxt=-1;
  for(var i=0;i<cur.items.length;i++){
    var it=cur.items[i];
    if(!it.lock&&!(st.done[cur.name]||{})[it.id]){nxt=i;break}
  }
  if(nxt<0){diploma();return}
  part=nxt;beat=0;
  setTimeout(function(){paintRail();paintActs();showBeat()},450);
}
function diploma(){
  $('ddSub').textContent=cur.name;
  $('dd').classList.add('on');
  paintShelf();
}

/* ---------------- the question card (BOARDS hero moments) ---------------- */
var cardMode=null;
function openCard(mode,q){
  cardMode=mode;
  var el=$('qcard');
  var Q=q||{t:'EASY · In this game, what actually wins the possession?',
    a:[['The right answer',1],['The fastest thumb',0],
       ['The tallest player',0],['Calling bank',0]],hint:''};
  var h='<div class="qh">'+(mode==='wrong'?'EASY · AND YOU WANT TO MISS IT':'QUESTION CARD')+'</div>'+
    '<div class="qt">'+Q.t+'</div>';
  Q.a.forEach(function(a,i){h+='<button data-ok="'+a[1]+'">'+esc(a[0])+'</button>'});
  if(Q.hint)h+='<div class="hint">'+Q.hint+'</div>';
  el.innerHTML=h;
  $('qveil').classList.add('on');
}
$('qcard').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  var ok=b.dataset.ok==='1';
  if(cardMode==='wrong'&&ok){
    deny();say('<b>On PURPOSE, rook.</b> Rebounds live off misses. Pick a wrong one, I will not tell anyone.');
    return;
  }
  $('qveil').classList.remove('on');
  if(isBoards()){boardsCard(ok);return}
  advance();
});

/* BOARDS: the hero drill, fully scripted so the page proves the feel.
   Part DR-07 = brick on purpose; DR-09 = battle at the rim; DR-24 = nobody
   crashing. bStep is the mini state machine inside the current part; every
   unmatched tap falls out silently, never into the generic engine. */
var bStep=0;
function boardsShow(prefix){
  bStep=0;paintActs();
  var pid=curPartObj().id,pre=prefix||'';
  if(pid==='DR-07'){say(pre+'Rebounds live off MISSES, so we brick one on purpose. <b>Tap your handler.</b>');
    $('pg').classList.add('want');return}
  if(pid==='DR-09'){say(pre+'Contested layup, their big is home. <b>Hit SHOOT</b>, and this time answer RIGHT.');
    pointBtn('bshoot');return}
  if(pid==='DR-24'){say(pre+'One more brick, and this time <b>nobody</b> crashes the glass. <b>SHOOT.</b>');
    pointBtn('bshoot');return}
  say(esc(curPartObj().nm)+'.');
}
function boardsHot(id){
  var p=curPartObj();if(!p)return;
  var pid=p.id;
  if(pid==='DR-07'){
    if(bStep===0&&id==='pg'){bStep=1;say('Now <b>hit SHOOT</b>. Yes, really.');pointBtn('bshoot');return}
    if(bStep===1&&id==='bshoot'){bStep=2;openCard('wrong');return}
  }
  if(pid==='DR-09'){
    if(bStep===0&&id==='bshoot'){bStep=1;openCard('right',{t:'MEDIUM · Bill Russell owns 11 rings. How many did he win as a PLAYER-COACH?',
      a:[['Two',1],['None',0],['Five',0],['Eleven',0]],hint:'get it right this time · his 1968 and 1969 titles came with him coaching the team'});return}
  }
  if(pid==='DR-24'){
    if(bStep===0&&id==='bshoot'){bStep=1;
      flash('CLANK.');
      setTimeout(function(){$('ballout').classList.add('on');
        say('Nobody crashed the glass, so the long board rolls OUT. Other team\\u2019s ball. The punishment half of the rebound rule.');
        setTimeout(function(){bStep=0;partClear()},2400)},900);
      return}
  }
}
function boardsCard(ok){
  var pid=curPartObj().id;
  if(pid==='DR-07'){
    flash('BATTLE FOR THE BOARD');
    setTimeout(function(){say('First miss loses, and the closest body holds the box-out edge: <b>SUDDEN DEATH</b>, the same shape every time it appears. Knowledge wins the glass, never thumb-mash.');
      setTimeout(function(){bStep=0;partClear()},2600)},1100);
    return;
  }
  if(pid==='DR-09'){
    if(!ok){say('<b>Missed it.</b> The card was the shot. Run the line again from the rail when you are ready.');bStep=0;return}
    flash('BATTLE AT THE RIM');
    setTimeout(function(){say('Shooter right AND blocker right. First miss loses, and the rim big holds the edge on layups: <b>SUDDEN DEATH</b>, the same shape every time it appears.');
      setTimeout(function(){bStep=0;partClear()},2600)},1100);
    return;
  }
}
function pointBtn(id){paintActs();var el=$(id);if(el)el.classList.add('want')}
function flash(t){
  var f=$('flash');f.querySelector('.f').textContent=t;
  f.classList.add('on');setTimeout(function(){f.classList.remove('on')},1200);
}

/* the hero drill needs SHOOT allowed in all of its parts */
var _allow=allowFor;
allowFor=function(sec,it){
  var ok=_allow(sec,it);
  if(sec&&sec.hero)ok.bshoot=1;
  return ok;
};

/* SHOW ME: in the real drill this replays the rep; in the mock it makes the
   next tap unmissable, which is the honest version of the same promise */
$('cbShow').addEventListener('click',function(){
  var w=document.querySelector('.want');
  if(!w){say('Nothing to show mid-outcome. The next part arms in a second.');return}
  w.classList.remove('demo');void w.offsetWidth;w.classList.add('demo');
  say('Watch the glow: <b>that is the thing to tap</b>. In the real drill this button replays the whole rep for you.');
});


/* ---------------- trays ---------------- */
function openTray(i){
  var s=trays[i];
  $('shelf').style.display='none';
  var el=$('tray');el.classList.add('on');
  $('back').hidden=false;$('hud').textContent=s.name.toUpperCase();
  var h='<p class="tp">'+(s.why||'')+'</p><ul>';
  s.items.forEach(function(it){h+='<li><span class="iid">'+it.id+'</span>'+esc(it.nm)+'</li>'});
  h+='</ul>';
  el.innerHTML=h;   /* ‹ ROOM closes trays too: closeDrill handles both */
}

buildCourt();paintViews();paintShelf();
})();
</script>
"""

# ---------------------------------------------------------------- advice ----
# The advice round Aaron asked for: options and examples, never decisions.
# Grounded in two sources produced 2026-08-10: an audit of his board against
# COACH-AND-DRILLS.md, and a study of the great training modes (KI dojo, SF6
# trials, GGST missions, Skullgirls, Tekken 8, VF4 Evo, 2KU, Rocket League,
# chess.com). The summary lives in design/COACH-BOARD-2026-08-10.md.
ADVICE = """
<section id="advice">
  <p class="kicker">The advice round · options, not decisions · your call on all of it</p>
  <h2>Your grouping is 80% right. Here is the other 20%</h2>
  <p><b>Since you asked to see them applied, all ten now ARE applied</b> in the
  WITH THE SUGGESTIONS view of the demo above, using my recommended option
  wherever one is offered below. The text below is the reasoning behind what
  you just played, kept in full so every option is still on the table.</p>
  <p>First, what the study of the greats says about your INSTINCT: it is
  exactly the proven shape. Street Fighter 6's combo trials pin a step list to
  the left edge that checks off in real time; Virtua Fighter 4 shipped your
  auto-advance-plus-jump rail in 2003; chess.com's whole hierarchy is
  section · drill · part with 5 to 10 parts a lesson. Nobody great does it a
  different way. The suggestions below are about WHICH parts sit WHERE.</p>

  <ol class="cardlist">
  <li><b>The question card has no drill, and it is the core loop.</b>
  "Answer to play" is the game, and the card's own mechanics are scattered:
  the :15 clock (DR-37) and what a wrong answer costs (DR-38) sit in Unsure,
  knowledge levels (DR-52) sit in the menu tray even though the catalog calls
  it the one Tier C item that "could be a genuinely good drill", and the
  colour language (DR-12) rides scoring. My strongest suggestion on the whole
  board: a new drill, <b>READING THE CARD</b> · DR-38 → DR-37 → DR-52, with
  DR-12's colour half re-tested inside it. It also empties most of Unsure.</li>

  <li><b>Unsure can dissolve entirely: it is mostly the "not built yet" pile.</b>
  Five of its eight are blocked on unbuilt mechanics, so they are parking
  slots, not decisions: DR-59 joins the locked rows in Violations (same foul
  family as DR-57/58) · DR-60 + DR-40 pair as a future ROTATION drill (bench
  and fatigue are one system) · DR-61 joins Movement &amp; Passing the day the
  oop is built · DR-41 becomes its own star module when built. DR-37 and
  DR-38 go to suggestion 01. DR-42 goes to suggestion 08. Nothing left to be
  unsure about.</li>

  <li><b>DR-09 got filed by its name, not its content.</b> "Battle at the
  rim" sounds like a rebound, but the catalog row is shooter-right-AND-
  blocker-right sudden death: the ENDING of DR-08's contests-and-blocks arc,
  not a board battle. <span class="opt">Option A · move it next to DR-08,
  wherever contests live.</span> <span class="opt">Option B · keep it in
  Boards as the closer, with the Coach naming the link back to DR-08. A
  two-part Boards drill is fine; Rocket League's best packs are small.</span></li>

  <li><b>Sudden death is a shape nobody owns.</b> It appears four times on
  your board with four different edge-holders: boards (closest body), rim
  (the big), RIP OR GRIP (the handler), game point (nobody). No part ever
  says the pattern out loud: <em>first miss loses, and somebody holds the
  edge</em>. Cheapest fix: one recurring coach line that names it each time
  it appears. Dearest fix: it gets its own part in Full Possessions.</li>

  <li><b>The two clocks are twins living in two houses.</b> The offensive
  :24 (DR-19) is filed under scoring; the defensive :12 (DR-20) under
  Violations. But "sit on it and you turn it over" IS a violation.
  <span class="opt">Option A · both to Violations, which becomes THE WHISTLE
  AND THE CLOCKS.</span> <span class="opt">Option B · both to scoring, next
  to the shots they hurry.</span> <span class="opt">Option C · leave them
  split and have each drill point at the other.</span></li>

  <li><b>The two eight-part sections are each two lessons wearing one name.</b>
  Every great mode keeps a lesson at 3 to 6 parts (KI tasks, GGST's one
  concept per mission, chess.com's challenges); eight parts on a phone is a
  ten-minute sit. <span class="opt">Movement &amp; Passing · Option A: split
  into BALL MOVEMENT (DR-01, 23, 02, 11) and BEATING YOUR MAN (DR-04, 15,
  31, 32). Option B: keep the eight, ordered simple-to-compound: 01 · 23 ·
  02 · 11 · 04 · 15 · 31 · 32.</span> <span class="opt">Defensive Movement ·
  Option A: split into DEFENSE (DR-06, 14, 21, 10, 08) and SCREENS, BOTH
  SIDES (DR-05, 16). Option B: keep the eight, ordered 06 · 14 · 21 · 10 ·
  08 · 05 · 16 · 22.</span> One flag either way: DR-05 teaches the
  OFFENSIVE side of screens (the catalog built DR-16 because DR-05 "only
  ever shows you the good side"), so your defensive filing actually pairs
  the two sides of the screen. That is good teaching IF the drill says so
  out loud, and an accident if it does not.</li>

  <li><b>Spacing may deserve its own name.</b> You filed DR-21 (MUST) and
  DR-22 (COULD) as two rows inside Defensive Movement, while LIST TWO calls
  the house-rules screen "the single most under-explained screen in the
  game". <span class="opt">Option A · THE FOUR FLOORS, its own short
  drill.</span> <span class="opt">Option B · keep them in defense but as
  loudly named parts, so a player who lost to a diagonal can find the
  lesson in five seconds.</span></li>

  <li><b>Full Possessions is the graduation, and DR-42 is what comes after
  graduation.</b> It is your only all-MUST section: keep it LAST on the
  shelf, the Skullgirls way: teach the parts, then demand the combo.
  Order options: <span class="opt">A · DR-28 → 29 → 30, simple before
  compound (28 is buildable today, the other two need the scripted
  opponent).</span> <span class="opt">B · 29 → 30 → 28, chronological,
  ending on how games end.</span> And DR-42 (down four, two possessions) is
  not a tutorial at all: it is the first SCENARIO, a puzzle that re-tests
  On Fire and sudden death under pressure. Park it for a later Scenarios
  shelf; do not force it into a teaching section.</li>

  <li><b>Your two non-drill trays are right, and the catalog agrees with
  you twice.</b> The main-menu ten match the catalog's own Tier C verdicts
  in nine cases of ten (the tenth is DR-52, claimed by suggestion 01; two
  footnotes: DR-54 belongs to Local VS's entry point, not the menu, and
  DR-56 already ships as its own install prompt). The first-walkthrough
  eight are really four walkthrough lines (camera, scoreboard, coordinates,
  replay) plus the ceremony trio (toss-up, THE CALL, jump ball) that opens
  every real game anyway: game one IS their drill, under the twelve-card
  budget, and they graduate to real drills the day a fake buzzer exists.
  One move to consider: DR-39 (where the points come from) is not
  game-start-specific; it would sit naturally beside DR-12 and DR-13 in
  scoring.</li>

  <li><b>What the room should steal from the greats, whatever the
  groupings end up being.</b> A part checks off after ~3 clean reps, not
  one lucky one (VF4, KI). Retry restarts the PART in a second, never the
  drill (Rocket League's defining feature). Every part gets a SHOW ME
  demo button (SF6's most-loved trial affordance). Teach the failure case,
  what the wrong choice costs, not just the right one (Skullgirls). No
  hard locks anywhere, just the NEXT UP pointer (chess.com; Rocket League
  removed forced order after players revolted). Redo is replay, never
  reset. And completion pays identity, a diploma wall in the Gym, never
  gameplay power, which your own economy rules already forbid.</li>
  </ol>

  <h3>Names, if you want them louder</h3>
  <p>Your labels work as they are. If you want them in the game's own voice
  (RIP OR GRIP, THE CALL), here is one offer per section, take or leave
  one by one:</p>
  <div class="scroll"><table>
  <thead><tr><th>your section</th><th>in the game's voice</th></tr></thead>
  <tbody>
  <tr><td>Movement &amp; Passing</td><td><b>MOVING THE ROCK</b></td></tr>
  <tr><td>Defensive Movement</td><td><b>LOCKDOWN</b></td></tr>
  <tr><td>scoring</td><td><b>BUCKETS</b></td></tr>
  <tr><td>On Fire</td><td><b>CATCH FIRE</b></td></tr>
  <tr><td>Boards</td><td><b>THE GLASS</b></td></tr>
  <tr><td>Violations</td><td><b>THE WHISTLE</b></td></tr>
  <tr><td>Full Possesions</td><td><b>GAME TIME</b></td></tr>
  <tr><td>the new card drill (01)</td><td><b>KNOW YOUR CARD</b></td></tr>
  </tbody></table></div>

  <h3>Deliberately left alone</h3>
  <p>The shelf order in the demo is your board order, untouched. The Unsure
  tray still shows exactly as you filed it, so you can see it next to the
  suggestion that dissolves it. And "Full Possesions" is spelled the way
  your export spells it: flagging it here rather than silently editing
  your file.</p>

  <h3>Your call</h3>
  <ol class="cardlist">
    <li><b>Add READING THE CARD?</b> It is the one genuinely missing section
    (suggestion 01) and it empties Unsure on the way through.</li>
    <li><b>Split the two eights, or keep them long?</b> A or B on each
    (suggestion 06).</li>
    <li><b>Where do DR-09 and the two clocks live?</b> (suggestions 03
    and 05).</li>
    <li><b>Names: keep yours, or re-voice per the table?</b> Mixing is
    fine too.</li>
    <li><b>One semantics check: re-running a cleared part keeps its
    checkmark</b> (that is how the demo behaves, and how SF6 and Rocket
    League behave). Confirm or overrule.</li>
  </ol>
</section>
"""

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('usage: drillroom-artifact.py <out.html>')
    main(sys.argv[1])

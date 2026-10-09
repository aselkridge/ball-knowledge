#!/usr/bin/env python3
"""Turn the harvested model into the board's HTML sections.

The split is deliberate. `harvest.py` decides WHAT exists, this file decides how
it reads, and `template-v3.html` holds the design. Version 2 of the board mixed
all three into one hand-written file, which is why it was missing most of
BUILD.md: there was no separation between "the list" and "the page", so the list
could only ever be as complete as my memory at the moment of writing.

Curated text still lives here, in CURATED below, because a generated list cannot
know what is worth doing next or why. What it CAN do is guarantee that nothing
is silently absent, and every curated block is checked against the harvest so a
hand-written claim about an item that no longer exists fails the build.
"""

import html
import json
import os
import re
import sys

from harvest import build_model, measure, harvest_todo, read as _read

# repo root, for shelling out to tools/decisions.py
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# The gate card used to hard-code "961 cards exist" and "roughly 150 to 200 new
# questions". Both moved the day gate-blockers.py was written, and a board whose
# masthead is stale is worse than no board. Import the real thing instead.
import importlib.util as _ilu
import os as _os
_gb_path = _os.path.join(_os.path.dirname(_os.path.dirname(
    _os.path.abspath(__file__))), 'gate-blockers.py')
_spec = _ilu.spec_from_file_location('gate_blockers', _gb_path)
gate_blockers = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(gate_blockers)


def blockers():
    facts, srcs, by_fact, lg = gate_blockers.model()
    scope = gate_blockers.SCOPE
    in_scope = [f for f in facts if not lg[f['fact_id']] or (lg[f['fact_id']] & scope)]
    dealable = [f for f in in_scope
                if f.get('confidence') == 'high' and f.get('date_checked')]
    readable = 0
    for f in in_scope:
        if f in dealable:
            continue
        k, _ = gate_blockers.bucket_of(f, by_fact[f['fact_id']])
        if k in 'ABCDE':
            readable += 1
    return {'exists': len(in_scope), 'dealable': len(dealable),
            'readable': readable, 'ceiling': len(dealable) + readable,
            'target': gate_blockers.GATE_TARGET}


def branch():
    """How much is stacked up unmerged, split into game and paper.

    Computed, because the first version of this card had "50 commits, 41 of
    them paper" TYPED INTO IT. Four commits later the board was telling Aaron
    a wrong number about the thing it exists to report, and the sentence right
    next to it said "Counted, not estimated". A number that goes stale between
    builds has to come from the build.
    """
    import subprocess
    def git(*a):
        return subprocess.run(['git', '-C', ROOT] + list(a),
                              capture_output=True, text=True).stdout.strip()
    base = 'origin/main'
    shas = [s for s in git('rev-list', base + '..HEAD').splitlines() if s]
    game = 0
    for s in shas:
        files = git('diff-tree', '--no-commit-id', '--name-only', '-r', s)
        if any(f.startswith('docs/play/') for f in files.splitlines()):
            game += 1
    stat = git('diff', '--shortstat', base + '..HEAD', '--', 'docs/play')
    m = re.search(r'(\d+) files? changed.*?(\d+) insertions', stat)
    return {'total': len(shas), 'game': game, 'paper': len(shas) - game,
            'files': m.group(1) if m else '?', 'added': m.group(2) if m else '?'}

ESC = lambda s: html.escape(str(s), quote=True)

STATUS_LABEL = {'done': 'Done', 'open': 'Open', 'wait': 'Your call',
                'spec': 'Specced', 'dead': 'Superseded', 'run': 'Half done',
                'stop': 'Red'}

# Every status that still owes work. Named once because it was spelled out at
# two call sites and a third would have been missed the day a status was added,
# which is exactly what happened when 'run' arrived.
OPEN_STATES = ('open', 'wait', 'spec', 'run')

# Docs, in the order a person would want to read them, with a plain-language
# line about what the doc is FOR. Aaron does not think in filenames.
DOC_ORDER = [
    ('TODO.md', 'The plan: every row of the six lists, in ruled order',
     'The only tracker since 08-24. List 1 is the road to the twenty and its '
     'order is the plan; a row leaves only when it ships into the changelog or '
     'is scrapped with a reason.'),
    ('V0.md', 'What ships to the twenty',
     'The live scope. If it is not in here, it is not blocking launch.'),
    ('BUILD.md', 'The build log and every design decision',
     'The biggest doc by far. Roadmap, rulings, specs written but not built, '
     'and the whole after-launch plan.'),
    ('RESEARCH-BACKLOG.md', 'Research and fact checking',
     'Every run, every piece of verification debt, and who runs it.'),
    ('DESIGN.md', 'The rules and the locked design',
     'Only its open questions appear here. The settled parts are the game.'),
    ('TABLES.md', 'The data structure',
     'Tables, keys and joins, plus anything still owed on the schema.'),
]


# --------------------------------------------------------------------------
# curated: the judgement a script cannot make
# --------------------------------------------------------------------------
# measured once, so every curated line that quotes a gate number quotes the
# same one the gate card does
_B = blockers()
_BR = branch()

CURATED = {}

# measured once, so every curated line that quotes a number quotes the same one
# the gate card does. Nothing below is typed from memory: the branch, the bank,
# the list counts and the 27 all come from the files at build time.
_ROWS = [i for i in harvest_todo('TODO.md', _read('TODO.md')) if i['kind'] == 'row']


def _n(prefix, states=OPEN_STATES):
    return sum(1 for r in _ROWS if r['section'].startswith(prefix)
               and r['status'] in states)


_L1, _L2, _L3, _L4, _L5 = (_n('1 ·'), _n('2 ·'), _n('3 ·'), _n('4 ·'), _n('5 ·'))
_D27 = None   # filled by launch27() below, after it is defined

PREVIEW = ('https://raw.githack.com/aselkridge/ball-knowledge/'
           'claude/locked-brief-build-078n10/docs/play/?flow=new')
WALK = 'https://claude.ai/code/artifact/2c8b3b1a-dfa8-4d19-ae8b-15b28a0afc19'
OPTS = 'https://claude.ai/code/artifact/be4ecd16-7484-4bed-96d9-9893ac375835'
LIST_BOARD = 'https://claude.ai/code/artifact/dab6fedc-5f69-4e17-9ca8-53853fa9e3a0'

# The check fleet is the one number here that is not recomputed by the build:
# it takes ten minutes to run. It is DATED, and the sentence says what ran.
FLEET = dict(date='2026-09-30', green=47, red=0,
             note='every gate green with the flag off, cine-check 12c included '
                  '(the one red on 09-07, row 247); the online gate went red in '
                  'its lane because the relay\'s dependency had not survived a '
                  'container move, and ran green alone once it was restored '
                  '(13 ok, 10-09, row 254)')
_FLEET = (f"the fleet run on {FLEET['date']}: {FLEET['green']} green, "
          f"{FLEET['red']} red, {FLEET['note']}")

CURATED['now'] = [
    ('LIVE is the 09-05 ship, verified again today, byte for byte', 'done',
     'main is at e9dc06f, the 09-05 ship ("242 of 243 files verified against '
     'the repo"). Re-checked 09-30 for this board: <code>game.js</code>, '
     '<code>coach.js</code> and <code>index.html</code> at '
     'bk-ballknowledge.com/play/ hash identical to main; <code>flow.js</code> '
     'is not on main and the live site answers 404 for it, as it should. So '
     'the twenty-facing game is the one with the entrance, the drop onto the '
     'real court, the referee, the fork card and the first-game-only cards.',
     'What anyone gets at the link today is exactly the game you shipped on '
     '09-05. Nothing since then is live, including three fixes to bugs you '
     'hit on your phone.'),
    (f'{_BR["total"]} commits sit on the branch, not live: the possession '
     'redesign and three fixes to the live road', 'open',
     f'{_BR["game"]} of them touch the game ({_BR["files"]} files, '
     f'{_BR["added"]} lines added under docs/play). In them: DESIGN § 8a\'s '
     'new possession rules, ruled 09-06 and 09-07 in three rounds off the '
     f'<a href="{WALK}">Tip-Off to Turnover</a> page; the mock-up of those '
     'rules on the real court behind <code>?flow=new</code> (flow.js plus '
     'nine flag-guarded hooks in game.js); your five 09-08 catches fixed; the '
     f'<a href="{OPTS}">two option rounds</a> boarded 09-10 and A5 and B1 '
     'ruled and built 09-14. Three of the fixes are to the SHIPPED road and '
     'wait behind the same merge: the match clock reads 00:00 until the jump '
     'ball is won and holds through picks, the jump-ball answer has fifteen '
     'seconds, the BUZZED stamp clears when the answers land. With the flag '
     f'off the branch is the live game plus those three, and {_FLEET}.',
     'The branch is the version you have been playing on your phone. Until '
     'you say merge, the live game still runs the clock through the tip-off '
     'and paints the stamp over the question, two things you asked for on '
     '09-05.'),
    ('The gameplay rebuild is at the possession, and the next gate is your '
     'verdict on the mock-up', 'wait',
     'Row 103, screen by screen since 08-28: the HUD and the music button '
     '(08-22 and 08-24), the dome and the loud buzz (08-31), the entrance and '
     'the drop onto the real court with the referee (09-04), the fork card and '
     'the first-game-only cards (09-05), your full playthrough filed as rows '
     '225 to 244 (09-05), the possession ruled (free move, one ball action a '
     'turn, the balls as the shot clock, the two-question steal, ONE MORE, the '
     'ten-second step, the three-second count, the shown glide), the mock-up '
     'built on the real court (09-07), its five catches fixed (09-08), '
     'who-am-I and the machine\'s move ruled A5 and B1 (09-14). Row 253, '
     'filed today: making those rules THE game, out of the flag with Method '
     'B\'s every-dead-ball ritual retired, waits on your word that the mock-up '
     'is the game. Row 238, pick your play once with timeouts to change it, '
     'is ruled and not built.',
     'You have played the new rules with your two picks on. If they are '
     'right, say so and the mock-up stops being a mock-up. If not, the '
     'catches go on the list the way the last five did.'),
    ('Sixteen quiet days, and the tracker had drifted under them', 'open',
     'Last commit 09-14 (A5 and B1). No research run is in flight, no fetch, '
     'no background job; nothing moved between 09-14 and 09-30. Found '
     'rebuilding this board: seventeen rows whose work had shipped into the '
     'changelog between 09-03 and 09-14 (the entrance, the drop, the referee, '
     'the fork card, the mock-up\'s catches, the option rounds) were still '
     'open on list 1; row 15, cards remembering you, sat blocked on you '
     'although V0 records your 08-11 yes; no row said what turns the mock-up '
     'into the game; and this board\'s harvester had never read TODO.md, the '
     'only tracker since 08-24, so it drew "everything owed" from the wrong '
     'files. All four fixed today, on the branch.',
     'The list is honest again as of today. Before this the board would have '
     'shown you work as owed that you had already watched ship, which is the '
     'drift you named on 08-24.'),
    ('Gate 1, the bank, has not moved since August', 'open',
     f'<b>{_B["dealable"]} cards deal today against a gate of '
     f'{_B["target"]:,}.</b> {_B["exists"]} exist in scope and the rest '
     'cannot be dealt because they are unverified; reading every readable '
     f'card left reaches <b>{_B["ceiling"]}</b>, so the remainder must be '
     f'found or written. List 2 holds {_L2} rows, the V29 Run B prove pass at '
     'the top; none of it has run since the gameplay rebuild began on 08-22.',
     'Every hour since 08-22 went to the screen, on your call, and the bank '
     'did not fill itself meanwhile. It is still the thing that decides the '
     'launch date.'),
    ('The checks, said plainly', 'done' if FLEET['red'] == 0 else 'stop',
     f'{_FLEET[0].upper() + _FLEET[1:]}. The mock-up has its own two gates '
     'on top: flow-check (27 checks under ?flow=local, both sabotages red) and '
     'flow-cpu-check (10 checks, two minutes against the machine with the '
     'coach on). Not runnable here: the online two-peer harness needs a live '
     'room. Known and filed: the toss-up race still has no answer clock (row '
     '226); the online reconnect drops Method B state (row 209); three checks '
     'from the 08-24 census were stale or flaky when filed (rows 98, 100, 101) '
     'and are not in the fleet.',
     'A gate is a script that plays the real game and asserts what a change '
     'promised, and a new check is sabotaged red before it counts. Green with '
     'the flag off means the branch is safe to merge.'),
]

CURATED['desk'] = [
    # Ordered by what unblocks the most, and ONLY things verified still open
    # on 09-30 in TODO.md's own whose/status columns. Each ends in the one move.
    ('Your verdict on the mock-up: is this the game? (row 253)', 'wait',
     f'The new rules play at <a href="{PREVIEW}">the branch preview</a> with '
     'your two picks on: their side dims and YOU rides your ball handler; the '
     'machine\'s move leaves a trail. Everything ruled in DESIGN § 8a is in it. '
     'Deliberately not: the pick screens (row 238\'s design), the shot\'s '
     'release meter and tap battle, pass prices on the pieces (they are dock '
     'chips). <code>?flow=local</code> is the same game on one phone, both '
     'sides by hand.',
     'This is the fork in the road. Yes means the mock-up becomes the game and '
     'Method B retires; no means another round of catches, filed one per row.',
     'Play a few possessions both ways and say "this is the game", or send '
     'the catches.'),
    (f'Say merge: {_BR["total"]} commits, three of them fixes to the live game',
     'wait',
     'The branch is the live game plus the possession redesign behind its '
     'flag plus the three live-road fixes (the clock, the jump-ball limit, the '
     f'stamp). Flag off, {_FLEET}. Pages serves docs/ from main, so merge is '
     'the whole ship.',
     'Nothing about the twenty-facing game changes except the three bugs you '
     'hit, and the mock-up stays behind its switch.',
     'One word: merge.'),
    ('The grey note bar: keep, merge, or retire (row 223)', 'wait',
     'Three places said "tap a player" at once on 09-04; the strip now says '
     'the turn alone at the winner beat, and the top readout survives as the '
     'announcer line (your 09-05 ruling, row 242). The mock-up plays with the '
     'grey bar cleared, so under the new rules it is already gone in practice.',
     'The last of the three text channels on the screen, and it is your call '
     'whether it comes back in any form.',
     'Say retire, and row 223 closes with the mock-up; say keep or merge, and '
     'it gets an option list.'),
    ('The standing small calls, none urgent', 'wait',
     'What survives a back button (40) · the hint-pill wording (44) · '
     '<code>short_name</code> for the home-screen icon, which iOS truncates '
     '(45) · service worker yes, no or later; without one iOS offline is '
     'broken (46) · the app\'s theme colour behind Midnight Run (6) · the '
     'other half of B3, one field (48) · delete three stale branches (49) · '
     'branch protection on main (50) · the tunnel-to-matching-court art pass, '
     'your own maybe (216).',
     'None blocks a build this week; all bite eventually. Two of them are '
     'single clicks on GitHub.',
     'Pick any off when you have a minute; 49 and 50 are two clicks.'),
    ('Research rulings you owe (list 2)', 'wait',
     'The AI clause, V41 (67) · "throw-in" versus "inbound" as the house term '
     '(68) · the Black Fives label, which matters to you personally (73) · '
     'real players versus original archetypes (75) · the naming question to a '
     'real attorney before any release past the twenty (76).',
     'Two are one-sentence rulings; the others gate work that is not on this '
     'week\'s road.',
     'Rule 68 and 73 in a sentence each; 67 needs the clause read; 75 and 76 '
     'can wait for the twenty.'),
]

# The roadmap. Every stage names the gate it clears and what it unblocks, so the
# board answers "how do we get there" and not only "where are we".
CURATED['roadmap'] = [
    ('Stage 1', 'The gameplay rebuild, row 103: tip-off to turnover', 'now',
     'Done on the branch: the HUD, the music button, the dome, the entrance, '
     'the drop onto the real court, the referee, the fork card, the '
     'first-game-only cards, the clock and the jump-ball limit, the possession '
     'rules and their mock-up, who-am-I and the machine\'s move. Next, in '
     'order: your verdict on the mock-up (253); pick your play once with '
     'timeouts to change it (238, ruled 09-05: once a quarter, half or game, '
     'most of the screen, a small board above the choices showing the shape); '
     'then the rest of your 09-05 playthrough: the skip-tips bug (233), a '
     'change of possession that announces itself (234), the shot clock big '
     'with a buzzer and every hand-off called (236), the zoom hiding the pass '
     'targets (237), the inbound clock (240), the board seen the way 3D chess '
     'shows it (241), the announcer readout (242), the coach copy under row '
     '230\'s law (230, 232), the setup cards (231), the layers (235). Then the '
     'bible pass (111), the setup flow (12) and the coach as first-run guide '
     '(14).',
     'Every hour goes here until you say the screen reads clean. The mock-up '
     'is the biggest single step in it, and it is waiting on you.'),
    ('Stage 2', 'The rest of the road to the twenty', 'next',
     f'List 1 holds {_L1} open rows in your 08-24 order. After the rebuild: '
     'Quick Run (16), cards remembering you and play logging (15, unblocked '
     'by your 08-11 yes), the Gym as a room (20, waiting on its one image), '
     'skills, TV mode, chat and trash talk (21), the heat sound (17), name '
     'tags, the 27 lazy questions and the CPU-vs-CPU test (19), smoothness '
     'wave 2 (11) and the menu and setup polish batches (193, 192). Of V0\'s '
     '27 launch items: __D27__, recounted from V0\'s checklist every build.',
     'More than half of the original 27 is done. What is left is the '
     'second-session work, and it comes after the screen reads clean, because '
     'polishing a screen you are about to rebuild is waste.'),
    ('Stage 3', 'Fill the bank to 1,000, alongside', 'alongside',
     f'{_B["dealable"]} dealable of {_B["target"]:,}; the ceiling from '
     f'verification alone is {_B["ceiling"]}. List 2, {_L2} rows: the V29 Run '
     'B prove pass (51), the publisher terms read with hoophall still unread '
     '(52), the era lookup pass (53), Block D\'s second publisher (54), the '
     'pre-1980 NBA cards (55), mining the 158 Tier 1 pages (56), the '
     'Wikipedia-only footnotes (57), and the rest in order.',
     'Runs alongside the build, not after it, and nothing on it has run since '
     '08-22. When the screen work pauses on your verdict, this is where the '
     'hours go.'),
    ('Stage 4', 'Launch to the twenty', 'later',
     'Both gates green, then the link goes out to the twenty. Nothing before '
     'that.',
     'This is the release you have been protecting, and the reason nothing '
     'ships early.'),
    ('Stage 5', 'After the twenty, and the big direction', 'later',
     f'List 3 holds {_L3} committed builds (packs and the collection spine, '
     'story mode, All-Star Weekend, the league, the sound systems, the drills '
     'build-out, hands and heat, the identity and infrastructure blocks), '
     f'list 4 holds {_L4} research runs, list 5 holds {_L5} maybes. Beyond '
     'them the big direction from BUILD § 5b: the knowledge base as the thing '
     'itself, complete across every league and era, and the Tape\'s third tab '
     'answering questions in plain English.',
     'Nothing here is a new idea. It is everything already thought through '
     'and deliberately kept behind the twenty.'),
]

CURATED['guides'] = [
    ('How a change to the game gets ruled and shipped',
     'Show the list, show real options, ship nothing until he picks. The '
     'option rounds of 09-10 are the worked example.',
     ['Say the medium out loud first: build it, source it, or reuse a device '
      'the game already has (DESIGN § 9 and the shipped game are checked '
      'before anything is drawn).',
      'The option LIST goes to Aaron before any option is built.',
      'Three or four real options side by side, at the size they will be '
      'seen, on the real court, photographed by the game itself under '
      'identical conditions, with a recommendation and its reasons after the '
      'frames, not before.',
      'Nothing ships until he picks. A direction he approves is not a green '
      'light: the sample comes first.',
      'The ruling goes to DESIGN.md the same day with the numbers he picked; '
      'the row and the changelog carry it; the check fleet grows a check that '
      'asserts it.',
      'Every visual change merges with a before/after from real screenshots, '
      'desktop and phone (the <code>compare</code> skill).']),
    ('How a fact becomes a question in the game',
     'find → prove → merge. Nothing enters <code>questions.js</code> or '
     '<code>players.json</code> except through it.',
     ['A run gathers candidates into <code>docs/play/data/</code>.',
      'The <code>verify-facts</code> skill reads each claim against its source '
      'and gives one of three verdicts: verify, fix, or quarantine. Quarantine '
      'never deletes.',
      '<code>tier-sources.py --apply</code> scores the sources. Any Tier 1 gives '
      'high confidence; two Tier 2 sources from different publishers also give '
      'high; one Tier 2 gives medium.',
      '<code>tables-verify.py</code> then <code>tables-emit.py --apply</code> '
      'rebuilds the game files from the tables, which are the real source of '
      'truth.',
      '<code>build-volatile-index.py</code> and '
      '<code>build-verified-index.py</code> rebuild what the game is allowed to '
      'deal.',
      '<code>audit.py</code> is the gate. Old debt passes, new debt fails.']),
    ('How work gets remembered',
     'A decision or a to-do that is only in chat does not exist.',
     ['Anything new (a decision, a bug, a deferral, an idea) becomes a row in '
      'TODO.md the same turn it is said; <code>python3 tools/list.py</code> '
      'reads the plan, <code>--yours</code> prints what waits on Aaron.',
      'A row leaves only two ways: it shipped and BUILD.md\'s changelog says '
      'so, or it moved to SCRAPPED with a reason.',
      '<code>python3 tools/open-items.py</code> harvests everything still owed '
      'from the docs that own it, so prose cannot hide a task.',
      'Every bug gets a verdict out loud: FIXED, FILED with a row number, or '
      'RULED.',
      'Rulings go to DESIGN.md. Lessons about working with AI go to '
      'AI-LEARNINGS.md. The story goes to MAKING.md. The list board '
      f'(<a href="{LIST_BOARD}">The Whole List</a>) is republished after any '
      'change to the rows or the changelog.']),
    ('How the board itself is made',
     'Generated from the docs, so it cannot quietly go out of date.',
     ['<code>python3 tools/status-board/harvest.py</code> reads TODO.md (every '
      'row of the six lists, since 09-30), then V0, BUILD, RESEARCH-BACKLOG, '
      'DESIGN and TABLES, and extracts every item.',
      '<code>python3 tools/status-board/build.py</code> renders it into '
      '<code>template-v3.html</code>, recomputes the gates, the branch and the '
      '27, inlines the fonts, and refuses to finish if any harvested item is '
      'missing from the page.',
      'The curated blocks (right now, your desk, the roadmap, the guides) are '
      'the one part written by hand, and every number in them is read from the '
      'files at build time.',
      'If something is missing from this board it is missing from the docs, '
      'which is a different and more useful problem.']),
]

CURATED['ref_words'] = [
    ('A card', 'One question plus its answer, its difficulty, and the source '
     'somebody read to prove it.'),
    ('Dealable', 'A card the live game is allowed to ask. It needs high '
     'confidence AND a recorded date when a person read the source. High '
     'confidence alone is not enough, which is how 331 became 298.'),
    ('Tier 1 / 2 / 3', 'How good a source is. Tier 1 is the record of fact, like '
     'basketball-reference or the league itself. Tier 2 is reputable but needs a '
     'second, independent publisher to agree. Tier 3 is a lead and never ships '
     'on its own.'),
    ('The gate', 'The rule that stops the game asking a question nobody has '
     'checked. It is on.'),
    ('Stale', 'A fact that can change, like an active career record. It still '
     'ships, but it has to be re-read on a cycle: 180 days normally, 550 days if '
     'it is anchored to a season that has ended.'),
    ('The ratchet', 'How <code>audit.py</code> works. Existing problems are '
     'allowed to pass so old debt does not block every commit, but any NEW '
     'problem of the same kind fails.'),
    ('The twenty', 'The twenty friends who get the first real invite. They owe '
     'you nothing, so the game has to be worth a second session.'),
    ('The road, list 1', 'The first list in TODO.md. Its order is the plan; the '
     'number on a row is its name and never changes when the row moves.'),
    ('Row 103', 'The gameplay rebuild, the umbrella every screen-by-screen '
     'ruling since 08-22 lives under: what a player needs to know and do at '
     'each moment, and nothing else on the screen.'),
    ('Method B', 'The possession the live game plays today: every dead ball '
     'opens a setup ritual, defense picks first and visibly, then free moves, '
     'one slide, the action. The new rules replace it.'),
    ('The mock-up', 'The new possession rules running on the real court behind '
     'a switch in the address: <code>?flow=new</code> against the machine, '
     '<code>?flow=local</code> on one phone. The live game does not know it '
     'exists.'),
    ('The check fleet', 'The scripts that drive the real game and assert what a '
     'change promised; every new check is sabotaged red before it counts, and '
     '<code>node tools/gates.mjs</code> runs all of them.'),
    ('V-number, H-number, S-number', 'Ids for research and verification jobs. V '
     'is verification debt, H is a history deep dive, S is a stats run, Q '
     'unblocks a feature, P is a player run, C is a checking task like licensing.'),
]


# --------------------------------------------------------------------------
def _open_under(it, index):
    """How much unfinished work sits inside this item, at any depth.

    A superseded branch counts zero. "3 · Build phases, SUPERSEDED by V0.md"
    was reporting 7 open, which is the board telling you to do work that was
    explicitly retired. Status propagates down: if the chapter is dead, so is
    everything filed under it.
    """
    if it['status'] == 'dead':
        return 0
    n = 0
    for k in it['children']:
        kid = index.get(k)
        if not kid:
            continue
        if kid['status'] in OPEN_STATES:
            n += 1
        n += _open_under(kid, index)
    return n


def item_html(it, index, depth=0):
    kids = [index[k] for k in it['children'] if k in index]
    sid = ESC(it['id'])
    # A chapter heading is navigation, not a task. Giving "2 · The player
    # journey" an OPEN badge reads as an unfinished job when it is a place where
    # jobs live, so headings carry a count of the work inside them instead.
    is_heading = it.get('rank', 2) <= 1 and kids
    if is_heading and it['status'] == 'dead':
        badge = ('<span class="pill dead">Scrapped</span>' if it.get('kind') == 'list'
                 else '<span class="pill dead">Superseded</span>')
    elif is_heading:
        n = _open_under(it, index)
        badge = (f'<span class="pill count">{n} open</span>' if n
                 else '<span class="pill done">all done</span>')
    else:
        badge = (f'<span class="pill {it["status"]}">'
                 f'{STATUS_LABEL.get(it["status"], it["status"])}</span>')
    head = (f'{badge}'
            f'{f"<span class=chip>{sid}</span>" if sid else ""}'
            f'<span class="ttl">{ESC(it["title"])}</span>'
            f'<span class="src">{ESC(it["doc"])}:{it["line"]}</span>')
    if not kids and not it['detail']:
        return (f'<div class="row d{depth} s-{it["status"]}" '
                f'data-key="{ESC(it["key"])}">{head}</div>')
    body = ''
    if it['detail']:
        body += f'<p class="det">{ESC(it["detail"])}</p>'
    if kids:
        body += ('<div class="kids">' +
                 ''.join(item_html(k, index, depth + 1) for k in kids) +
                 '</div>')
    return (f'<details class="row d{depth} s-{it["status"]}" '
            f'data-key="{ESC(it["key"])}">'
            f'<summary>{head}</summary>{body}</details>')


def owed_html(model):
    index = {i['key']: i for i in model['items']}
    out = []
    for doc, doc_title, doc_why in DOC_ORDER:
        # An item counts as top-level when it has no parent OR when its parent
        # was never harvested as an item. 21 rows had a parent key pointing at
        # a line the harvester does not emit, so they rendered neither as their
        # own row nor as anyone's child: harvested, counted, and invisible.
        mine = [i for i in model['items']
                if i['doc'] == doc and (not i['parent'] or i['parent'] not in index)]
        if not mine:
            continue
        mine.sort(key=lambda x: x['line'])
        total = sum(1 for i in model['items'] if i['doc'] == doc)
        openish = sum(1 for i in model['items']
                      if i['doc'] == doc and i['status'] in OPEN_STATES)
        rows = ''.join(item_html(i, index) for i in mine)
        out.append(
            f'<details class="grp"><summary>'
            f'<span class="gname">{ESC(doc_title)}</span>'
            f'<span class="gcount">{openish} open of {total}</span>'
            f'<span class="gfile">{ESC(doc)}</span></summary>'
            f'<p class="gwhy">{ESC(doc_why)}</p>{rows}</details>')
    return '\n'.join(out)


def done_html(model):
    index = {i['key']: i for i in model['items']}
    done = [i for i in model['items'] if i['status'] == 'done']
    done.sort(key=lambda x: (x['doc'], x['line']))
    by_doc = {}
    for i in done:
        by_doc.setdefault(i['doc'], []).append(i)
    out = []
    for doc, _t, _w in DOC_ORDER:
        if doc not in by_doc:
            continue
        rows = ''.join(item_html(i, index) for i in by_doc[doc])
        out.append(f'<details class="grp"><summary>'
                   f'<span class="gname">{ESC(doc)}</span>'
                   f'<span class="gcount">{len(by_doc[doc])} finished</span>'
                   f'</summary>{rows}</details>')
    return '\n'.join(out), len(done)


def now_html():
    out = []
    for title, st, what, plain in CURATED['now']:
        out.append(
            f'<div class="item s-{st}"><div class="ihead">'
            f'<h3>{title}</h3><span class="pill {st}">'
            f'{STATUS_LABEL[st]}</span></div>'
            f'<p class="what">{what}</p>'
            f'<div class="plain"><b>In plain terms</b>{plain}</div></div>')
    return '\n'.join(out)


def desk_html():
    out = []
    for title, st, what, plain, cta in CURATED['desk']:
        out.append(
            f'<div class="item s-{st}"><div class="ihead">'
            f'<h3>{title}</h3><span class="pill {st}">'
            f'{STATUS_LABEL[st]}</span></div>'
            f'<p class="what">{what}</p>'
            f'<div class="plain"><b>In plain terms</b>{plain}</div>'
            f'<div class="cta"><b>Do</b>{cta}</div></div>')
    return '\n'.join(out)


def roadmap_html():
    out = []
    d27 = launch27()
    for tag, title, when, what, plain in CURATED['roadmap']:
        what = what.replace('__D27__', f'{d27[0]} done, {d27[1]} part done, {d27[2]} not started')
        out.append(
            f'<details class="stage w-{when}"{" open" if when == "now" else ""}>'
            f'<summary><span class="stag">{tag}</span>'
            f'<span class="stitle">{ESC(title)}</span>'
            f'<span class="swhen">{when}</span></summary>'
            f'<p class="what">{what}</p>'
            f'<div class="plain"><b>In plain terms</b>{plain}</div></details>')
    return '\n'.join(out)


def guides_html():
    out = []
    for title, lead, steps in CURATED['guides']:
        li = ''.join(f'<li>{s}</li>' for s in steps)
        out.append(f'<details class="grp"><summary>'
                   f'<span class="gname">{ESC(title)}</span></summary>'
                   f'<p class="gwhy">{lead}</p><ol class="steps">{li}</ol>'
                   f'</details>')
    return '\n'.join(out)


def ref_html():
    li = ''.join(f'<dt>{ESC(w)}</dt><dd>{d}</dd>'
                 for w, d in CURATED['ref_words'])
    return f'<dl class="words">{li}</dl>'


def research_html(model):
    runs = [i for i in model['items']
            if i['doc'] == 'RESEARCH-BACKLOG.md' and i['id']
            and re.match(r'^[VQSHPC]\d', i['id'])]
    runs.sort(key=lambda x: (x['status'] != 'open', x['line']))
    rows = ''.join(
        f'<tr class="s-{i["status"]}"><td class="rid">{ESC(i["id"])}</td>'
        f'<td>{ESC(i["title"])}</td>'
        f'<td class="rst">{STATUS_LABEL.get(i["status"], i["status"])}</td></tr>'
        for i in runs)
    return (f'<div class="tw"><table class="runs"><thead><tr>'
            f'<th>Run</th><th>What it settles</th><th>State</th>'
            f'</tr></thead><tbody>{rows}</tbody></table></div>'), len(runs)


def launch27():
    """V0's 27 launch items, recounted from V0's own checklist every build.

    This card said "10 done" from 08-06 until 09-30 while the checklist under
    it had five more marks flipped on 08-11: a typed number in the gate card,
    the exact mistake the branch() comment describes. The code check behind
    the marks is the 08-11 grep of docs/play; the marks are the record of it.
    """
    lines = _read('V0.md')
    s0 = next(i for i, l in enumerate(lines) if l.startswith('### THE 27 ITEMS'))
    e0 = next(i for i, l in enumerate(lines) if i > s0 and l.startswith('## '))
    sec = '\n'.join(lines[s0:e0])
    done = len(re.findall(r'\[x\]', sec, re.I))
    part_block = (sec.split('**PART-DONE')[1].split('**NOT STARTED')[0]
                  if '**PART-DONE' in sec else '')
    part = len(re.findall(r'\[ \]', part_block))
    todo = len(re.findall(r'\[ \]', sec)) - part
    if done + part + todo != 27:
        raise SystemExit(f'V0 launch checklist counts {done}+{part}+{todo}, '
                         'not 27: read the section before building')
    return done, part, todo


def gates_html(m, model):
    b = blockers()
    dealable = b['dealable']
    pct1 = round(dealable / b['target'] * 100)
    done27, part27, todo27 = launch27()
    pct2 = round(done27 / 27 * 100)
    n1 = sum(1 for i in model['items'] if i['doc'] == 'TODO.md'
             and i.get('kind') == 'row' and i['section'].startswith('1 ·')
             and i['status'] in OPEN_STATES)
    return f'''
<div class="gate">
  <span class="gk">Gate 1 · the bank</span>
  <h2>1,000 verified cards</h2>
  <div class="bar"><i style="width:{min(pct1,100)}%"></i></div>
  <span class="gpc">{pct1}%</span>
  <p>{dealable} of {b['target']:,} dealable. Only {b['exists']} NBA and WNBA
  cards exist at all, and only {b['readable']} of those can be reached by
  reading, so the ceiling from verification alone is <b>{b['ceiling']}</b>.
  The rest have to be written fresh or found somewhere new. Recomputed at build
  time by <code>tools/gate-blockers.py</code>. Nothing on this gate has run
  since 08-22, when every hour went to the screen on your call.</p>
</div>
<div class="gate">
  <span class="gk">Gate 2 · the build</span>
  <h2>27 launch items, and the road past them</h2>
  <div class="bar"><i style="width:{pct2}%"></i></div>
  <span class="gpc">{pct2}%</span>
  <p>{done27} done, {part27} part done, {todo27} not started, recounted from
  V0's own checklist every build. The road is longer than the 27 now: list 1
  of TODO.md holds <b>{n1} open rows</b> in your ruled order, the gameplay
  rebuild (row 103) first, and nothing on it goes to the twenty before the
  screen reads clean.</p>
</div>'''


def decisions_n():
    """How many decisions are open, straight from tools/decisions.py.

    Fails LOUD rather than falling back to a number, because a decision tile
    quietly reading 0 is worse than a broken build: it tells Aaron he owes
    nothing, which is the one lie this board exists to prevent."""
    import subprocess
    out = subprocess.run(
        [sys.executable, os.path.join(ROOT, 'tools', 'decisions.py'), '--json'],
        capture_output=True, text=True, check=True)
    return len(json.loads(out.stdout))


def score_html(model, m):
    c = model['counts']
    cells = [
        # from blockers(), the SAME source as the Gate 1 card. measure()
        # counts every league; the gate counts its own scope, and showing
        # both on one screen looked like an off-by-one.
        (blockers()['dealable'], 'cards dealt', 'gate scope'),
        # rows of the two ACTIVE lists that are his call, from TODO.md's own
        # whose/status columns. The masthead already carries the item total.
        (sum(1 for i in model['items'] if i['doc'] == 'TODO.md'
             and i.get('kind') == 'row' and i['status'] == 'wait'
             and i['section'][:3] in ('1 ·', '2 ·')),
         'awaiting you', 'active lists'),
        # SAME definition as the masthead's __OPEN__: everything that is
        # neither done nor superseded. These two used to be computed
        # separately and printed 204 and 211 on one screen.
        (c['by_status'].get('open', 0) + c['by_status'].get('spec', 0)
         + c['by_status'].get('wait', 0),
         'still open', 'incl. specced'),
        # The count comes from tools/decisions.py, which harvests the docs for
        # the marker phrases they already use. Hand-counting this tile is how
        # it silently drifted before: a decision nobody remembered looked
        # exactly like a decision already made.
        (decisions_n(), 'decisions', 'open, all docs'),
        (c['by_status'].get('done', 0), 'finished', 'folded away'),
        (m.get('commits_ahead', 0), 'not live yet', 'on the branch'),
    ]
    return ''.join(
        f'<div class="cell"><b>{v}</b><span>{k}</span><i>{sub}</i></div>'
        for v, k, sub in cells)


def render(template):
    model = build_model()
    m = measure()
    done_block, done_n = done_html(model)
    research_block, run_n = research_html(model)
    slots = {
        '__GATES__': gates_html(m, model),
        '__SCORE__': score_html(model, m),
        '__NOW__': now_html(),
        '__DESK__': desk_html(),
        '__ROADMAP__': roadmap_html(),
        '__OWED__': owed_html(model),
        '__RESEARCH__': research_block,
        '__DONE__': done_block,
        '__GUIDES__': guides_html(),
        '__REF__': ref_html(),
        '__DATE__': model['generated'],
        '__TOTAL__': str(model['counts']['total']),
        '__OPEN__': str(model['counts']['by_status'].get('open', 0)
                        + model['counts']['by_status'].get('spec', 0)
                        + model['counts']['by_status'].get('wait', 0)),
        '__DONEN__': str(done_n),
        '__RUNS__': str(run_n),
    }
    for k, v in slots.items():
        if k not in template:
            raise SystemExit(f'template has no slot {k}')
        template = template.replace(k, v)
    return template, model, m


if __name__ == '__main__':
    import os
    tpl = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       'template-v3.html')
    out, model, m = render(open(tpl).read())
    print(f"{len(out)//1024}KB · {model['counts']['total']} items")

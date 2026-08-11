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

from harvest import build_model, measure

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

ESC = lambda s: html.escape(str(s), quote=True)

STATUS_LABEL = {'done': 'Done', 'open': 'Open', 'wait': 'Your call',
                'spec': 'Specced', 'dead': 'Superseded', 'run': 'Half done'}

# Every status that still owes work. Named once because it was spelled out at
# two call sites and a third would have been missed the day a status was added,
# which is exactly what happened when 'run' arrived.
OPEN_STATES = ('open', 'wait', 'spec', 'run')

# Docs, in the order a person would want to read them, with a plain-language
# line about what the doc is FOR. Aaron does not think in filenames.
DOC_ORDER = [
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

CURATED = {}

CURATED['now'] = [
    ('50 commits sit on the branch, and 41 of them are paper', 'open',
     'Counted, not estimated: of the 50 commits on '
     '<code>claude/locked-brief-build-078n10</code> that are not on '
     '<code>main</code>, <b>41 touch only docs and design files</b>. Nine '
     'touched the game, across 33 files and 1,072 added lines: the feedback '
     'button, the seventeen sounds, the Daily Five staging, the D25 coach-card '
     'fix, the Drill Room, and a data merge.',
     'This is the reason it feels like a lot is piled up. Most of the pile is '
     'writing, not game. The part a player would notice is nine commits, and '
     'nothing goes live until you merge.'),
    ('The coach is fully designed and not built', 'open',
     'All 256 catalogue rows are filed across five verdicts in '
     '<code>design/COACH-TOURS-2026-08-10.md</code>: 14 tours live today, the '
     'rest triggers, screens, guardrails or cut. Every script is written in '
     'plain language and jargon-swept. <code>grep tour docs/play/game.js</code> '
     'returns nothing, so none of it exists in the game yet.',
     'You have read and liked the tours. They are still a document. Turning '
     'them into something a player meets is a build job that has not started.'),
    ('The palette got audited and it has real collisions', 'open',
     '51 labelling slots, 10 systems, 30 distinct colours, 11 doing more than '
     'one job. Six of those eleven are deliberate and stay. Two are worse than '
     'the amber/gold pair that started it: pack rarity and player tier share '
     'three colours EXACTLY on the squad reveal, and the blue team and a Rare '
     'pack are both #58a8d6 in the same frame, about one local game in four.',
     'Colours are the game telling a player what something means. Right now '
     'two of them mean two different things at the same moment, which is a '
     'small thing that makes the game feel unfinished.'),
    ('DESIGN.md and the game disagree about the turn', 'open',
     'Section 3 line 68 states a free off-ball shuffle plus one main action. '
     '<code>tools/turn-economy-check.mjs</code> moves an off-ball attacker one '
     'square and the phase goes straight to <code>def-slide</code>, so the '
     'shuffle spent the possession. The check fails today on purpose and turns '
     'green when the two agree. Filed V0 D32 and D33.',
     'You remembered agreeing that off-ball movement is free. You were right, '
     'and it was never built. The rulebook has been describing a game we do '
     'not have.'),
    ('Gate 1 is the long pole and it has not moved much', 'open',
     # computed, never typed. A hand-written 318 here disagreed with the gate
     # card's 317 the moment it was written, because they count different
     # populations, and two numbers for one thing on one screen is a bug.
     f'<b>{_B["dealable"]} cards deal today against a gate of '
     f'{_B["target"]:,}.</b> {_B["exists"]} exist in scope and the rest cannot '
     f'be dealt because they are unverified. Reading every readable card left '
     f'reaches <b>{_B["ceiling"]}</b>, so the remainder must be found or '
     f'written.',
     'This is still the thing that decides when twenty people can play, and no '
     'amount of coach, colour or turn work moves it.'),
]

CURATED['desk'] = [
    # Ordered by what unblocks the most. The merge is first because until it
    # happens, everything below is invisible to anyone but us.
    ('Merge the branch, or tell me what to hold back', 'wait',
     '50 commits, 41 docs-only, 9 touching <code>docs/play/</code>. All gates '
     'green: <code>audit.py</code> PASS, <code>smoke-check</code>, '
     '<code>daily-check</code> and <code>board-check</code> all pass, em dashes '
     '0, AI tics 0. The one deliberate red is '
     '<code>turn-economy-check.mjs</code>, which fails because DESIGN.md and '
     'the game disagree, not because anything regressed.',
     'Nothing you have looked at this week is on the live site. Merging is the '
     'difference between us having built it and anyone being able to see it.',
     'Say merge and it goes. If you would rather ship only the game code and '
     'leave the writing on the branch, say that instead and I will split it.'),
    ('One colour pick settles three problems', 'wait',
     'The Legendary pack chip is #ffcf6a and collides twice: with Hall of Fame '
     'at deltaE 5.1, and with the Superstar player badge, which is the exact '
     'same hex on the same screen. Option board is published. Give the new '
     'colour to the PACK chip and leave the Superstar badge gold and both '
     'collisions die at once. Filed V0 D28.',
     'On a Legendary pull you currently see a gold chip sitting above four gold '
     'badges that mean something completely different. One pick fixes it.',
     'Open the colour board and name a number. My pick is option 1, the '
     'purples, because they survive red-green colour-blindness better than '
     'magenta.'),
    ('The other three colour fixes need a yes, not a decision', 'wait',
     'V0 D29 the blue team versus a Rare pack, both #58a8d6 in one frame. D30 '
     'two league accent pairs at deltaE 19 and 23. D31 Hardwood and The Garden '
     'share an accent and differ only on <code>accent-deep</code>. Each has a '
     'clear right answer and none is taste.',
     'Three cases where two different things wear the same colour. I know what '
     'to do in each; I just should not repaint the game without you saying so.',
     'Say go on the colour fixes and all three ship together with a before and '
     'after.'),
    ('The turn rule: build it or strike it', 'wait',
     'V0 D32. Either build the free off-ball move that DESIGN.md section 3 '
     'already promises, or delete the line. <b>Recommendation: build it.</b> It '
     'is the smaller change, and 22af finding F4 rates it the highest-value '
     'single change the research found, fixing idle pieces and long possessions '
     'with one rule and no timer. D33 comes with it: free off-ball moves draw '
     'no defensive answer, and the defence gets its slide when the main action '
     'commits.',
     'This is the thing you remembered agreeing to. Leaving the doc and the '
     'game disagreeing is the worst of the three options, because everyone who '
     'reads the doc is then wrong.',
     'Say build it and I will do D32 and D33 together, with the harness going '
     'green as the proof.'),
    ('The coach block is waiting on one answer', 'wait',
     'B7 and B14 are held in <code>next.py</code> behind a single question: do '
     'the tours REPLACE the twelve-cards-a-game coach budget, or sit alongside '
     'it? The tours are one-off and finite; the budget governs the running '
     'commentary. Your own note says the cadence feels weird in regular play '
     '(V0 D27), which is evidence for replace.',
     'Two build jobs are parked until you say how chatty the coach should be '
     'once the tours are done teaching.',
     'Answer replace or alongside and both unpark.'),
    ('B9 · what lives in the TODAY square', 'wait',
     'Asked 08-09, still open. Quick Run, Vs CPU, Online, or Online plus CPU '
     'with Quick Run demoted. <b>Recommendation: keep Quick Run.</b> It always '
     'opens; Online at the top is a door onto an empty room whenever no friend '
     'is free, which with twenty players is most taps.',
     'The biggest square on the main menu. It decides what a person does when '
     'they open the game with no plan.',
     'Say keep or name the replacement.'),
    ('Turn on branch protection', 'wait',
     'github.com/aselkridge/ball-knowledge → Settings → Branches → Add rule for '
     '<code>main</code>. <b>Required approvals must be 0</b> or you lock '
     'yourself out, since you are the only reviewer.',
     'It stops anyone, me included, changing the live site without going '
     'through the front door.',
     'Two clicks. Say done and I will confirm it took.'),
    ('Delete three dead branches', 'wait',
     'GitHub returns 403 on branch deletion for me. The day-one history is '
     'preserved on <code>archive/origin-v0</code>, so nothing is lost.',
     'Housekeeping. Nothing depends on it.',
     'Branches page → the bin icon on each.'),
    ('Define "all the stats"', 'wait',
     'Four sizes: career only · every season · plus playoffs · plus advanced. '
     'Season by season for around 400 players is roughly 150,000 values. Free '
     'to read; the gate is licensing (V29), not cost.',
     'How deep the player data goes changes how long the research runs take and '
     'what the crossover duel can ever use.',
     'Pick a depth, ideally after V29 answers the licensing question.'),
    ('Handles: the formula needs rethinking', 'wait',
     'Usage rate ranks Chris Paul above Iverson, which is plainly wrong. Open '
     'directions: isolation frequency, drives per game, or splitting "ball '
     'security" away from "creation off the dribble" as two ratings.',
     'This blocks the crossover duel using real ratings instead of position '
     'defaults.',
     'You said you would ask around. Bring back what people say.'),
    ('The front door still says "Play the alpha"', 'wait',
     'The root of bk-ballknowledge.com is the old landing page with a button '
     'straight into the game. The coming-soon page lives at <code>/soon/</code>.',
     'If a friend trims /soon off the link out of curiosity, that is where they '
     'land.',
     'Say swap and I will move it, keeping the alpha reachable.'),
]

# The roadmap. Every stage names the gate it clears and what it unblocks, so the
# board answers "how do we get there" and not only "where are we".
CURATED['roadmap'] = [
    ('Stage 1', 'Fill the bank to 1,000', 'now',
     '305 dealable. Measured 08-07: reading every readable card left reaches '
     '<b>607</b>, so this is not one job but three running together. '
     '<b>Read</b> the 302 readable (V13, V15). <b>Find</b> sources for the 317 '
     'cards whose source rows have no url, and mine the 158 Tier 1 pages cited '
     'exactly once (V32, which yields new questions as a side effect). '
     '<b>Write</b> the remainder from the corpus with the mine-questions skill.',
     'Order: V29 licensing first, because it decides what V32 is allowed to do. '
     'Then V34 images, V32 mining, V28 census, with V13 verification running '
     'continuously alongside all of it.'),
    ('Stage 2', 'Build the 27 things that make strangers play twice', 'next',
     '10 done, 1 part done, 16 not started. The ten that matter most for a '
     'second session: Quick Run, the Daily Five, cards remembering you between '
     'games, play logging, retiring the access code, wake lock, the feedback '
     'button, add to home screen, handling the sleeping server, and an invite '
     'link that just works. Only the Daily Five is finished.',
     'Add to home screen has no manifest file at all, so it starts from zero.'),
    ('Stage 3', 'Launch to the twenty', 'later',
     'Both gates green, then the link goes out. Nothing before that.',
     'This is the release Aaron has been protecting, and the reason nothing '
     'ships early.'),
    ('Stage 4', 'Everything already designed and waiting', 'later',
     'Packs and the collection spine, story mode, the Tape rebuild, skills, '
     'TV and couch mode, team turns, the pacing package, the spacing fix. All '
     'specced in BUILD.md, none started.',
     'Nothing here is a new idea. It is the backlog of things already thought '
     'through and deliberately deferred.'),
    ('Stage 5', 'The big direction', 'later',
     'The knowledge base as the thing itself: completeness across every league '
     'and era, and the Tape\'s third tab answering questions in plain English '
     'with tier and confidence attached.',
     'This is the part that is bigger than the game.'),
]

CURATED['guides'] = [
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
    ('How to add or change something visual',
     'Every visual change ships a before and after, from real screenshots, '
     'desktop and phone.',
     ['Check DESIGN.md section 9 first: the game may already have the device. '
      'The coming-soon page reused the menu\'s painted arena rather than '
      'inventing a backdrop.',
      'State the medium honestly: build it, source it, or find it already built.',
      'Screenshot the current state out of git, never out of a file you saved.',
      'Build the comparison with the <code>compare</code> skill and publish it '
      'before merging.']),
    ('How work gets remembered',
     'A decision or a to-do that is only in chat does not exist.',
     ['<code>python3 tools/open-items.py</code> harvests everything still owed '
      'from the docs that own it.',
      '<code>python3 tools/learnings-check.py</code> counts commits since the '
      'last learning was written.',
      'Every bug gets a verdict out loud: FIXED, FILED with an id, or RULED.',
      'Project decisions go to their home doc. Lessons about working with AI go '
      'to AI-LEARNINGS.md. The story goes to MAKING.md.']),
    ('How the board itself is made',
     'Generated from the docs, so it cannot quietly go out of date.',
     ['<code>python3 tools/status-board/harvest.py</code> reads V0, BUILD, '
      'RESEARCH-BACKLOG, DESIGN and TABLES and extracts every item.',
      '<code>python3 tools/status-board/build.py</code> renders it into '
      '<code>template-v3.html</code> and inlines the fonts.',
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
        badge = '<span class="pill dead">Superseded</span>'
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
    for tag, title, when, what, plain in CURATED['roadmap']:
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


def gates_html(m):
    b = blockers()
    dealable = b['dealable']
    pct1 = round(dealable / b['target'] * 100)
    done27, total27 = 10, 27
    pct2 = round(done27 / total27 * 100)
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
  time by <code>tools/gate-blockers.py</code>.</p>
</div>
<div class="gate">
  <span class="gk">Gate 2 · the build</span>
  <h2>27 launch items</h2>
  <div class="bar"><i style="width:{pct2}%"></i></div>
  <span class="gpc">{pct2}%</span>
  <p>{done27} done, 1 part done, {total27 - done27 - 1} not started. Includes
  add to home screen, which has no manifest file today. Starts the moment Gate 1
  lands, alongside the research, not after it.</p>
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
        (c['total'], 'items tracked', f"{len(DOC_ORDER)} docs"),
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
        '__GATES__': gates_html(m),
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

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
_BR = branch()

CURATED = {}

CURATED['now'] = [
    ('Merged and LIVE, verified byte for byte', 'done',
     'Aaron said merge on 08-11 and the branch went to <code>main</code>: '
     f'the merge carried the week (B5 drill fixes, the skip confirm, the '
     f'colour rulings, the feedback button, sounds, invite, wake lock). '
     'Verified against the LIVE site, not assumed: game.js, coach.js and '
     'index.html at bk-ballknowledge.com/play/ are byte-identical to the '
     'repo, and the new sentinels (Legendary purple, skipveil, the fire '
     'drill, panelDodge, drillGrey, the shimmer) all serve.',
     'Everything you looked at this week is now what a tester gets. The '
     'live game and the repo agree exactly.'),
    ('The 08-11/08-12 ruling wave: fourteen calls landed, every one filed', 'done',
     '<b>Tours</b> yes · <b>skip popup</b> in your words · <b>TODAY slot</b> '
     'Quick Run · <b>slang</b> dictionary+usage · <b>colours</b> live · '
     '<b>the exact court</b> accepted ("Court is good") · <b>reveal '
     'sounds</b> ship the V2 synth, sourced v2 post-launch · <b>the rarity '
     'mock</b> approved, build GO · <b>B5c theatre</b> ship it · <b>full '
     'free setup</b> ruled with defense researched · <b>device profile</b> '
     'yes, new profile = new hello · <b>V18</b> tiers applied · '
     '<b>V21b</b> five superlatives anchored · <b>V23</b> confirmed closed.',
     'Rulings become rows the same day now. Everything in this card is '
     'already in V0, the backlog, or the shipped game.'),
    ('B5 is CLOSED, and the B15 reveal build is BACKLOGGED on your call', 'done',
     'Five defects fixed and live 08-11; the sixth (pack rarities '
     'invisible) got its mock ruling the same evening. Then on 08-12 you '
     'pulled back: "let\'s really backlog that for a while, and get the '
     'game for the 20 nailed down first," with the names-as-collectibles '
     'legal grey zone as context. B15 keeps the approved spec filed for '
     'whenever it wakes; the shipped pack roll stays in the game unless '
     'you say pull it.',
     'Build order now: B5c (Daily Five theatre) then B7 (the first-run '
     'coach). No pack work in between.'),
    ('METHOD B IS PLAYABLE · your method runs in the real game, behind the flag', 'open',
     'Built 08-16 on your word ("love it, lets build it! we have to get '
     'my friend playing!"). Settings > Prototype > Method B, then any '
     'full-court local or CPU game: every dead ball opens the ritual, '
     'defense calls its setup FIRST in the open, you answer seeing it, '
     'the shapes land (your accepted lists: MAN · 2-3 · BOX-AND-ONE and '
     'HORNS · FIVE-OUT · FLOPPY, plus BOX/4-LOW at baselines, ZIPPER at '
     'sidelines, DIAMOND PRESS at made baskets), and the beat runs your '
     'order: full-team free setup, one slide, then the action. Both open '
     'numbers are live toggles in the same Settings block, so the friend '
     'playtest settles them by feel. Steals and boards keep running with '
     'no reset, exactly your ruling. The made-basket trip and the '
     'menu logic are drawn move by move in '
     '<a href="https://claude.ai/code/artifact/0c7f4d68-a36c-4575-9ebb-ffad9e628a9a">'
     'Up the Floor</a>; 35 harness checks pass, seven of them proving '
     'flag OFF is the untouched shipped game.',
     'Nothing changed for the twenty: the flag is the revert (proven, not '
     'promised), the coach goes silent under a PROTOTYPE banner, and '
     'main\'s save point is recorded at b1f1abf.'),
    ('THE INJECTION PROTOCOL is law: research defends itself and tells you', 'done',
     'Your ask, filed same day: fetched content is DATA, never '
     'instructions. Any page that tries to instruct the AI gets its claims '
     'excluded, the source flagged in the register, and YOU TOLD IN THE '
     'SAME REPLY, every time, plus a permanent incident log (opened at '
     'zero detected, dated). Every research brief now carries the clause '
     'verbatim so /deep-research sub-agents receive it too. The ethics '
     'line held and turned out to be the industry position: robots rules, '
     'CAPTCHAs, paywalls and 403s are a site saying no, and the answer to '
     'no is a different source or a human read, never circumvention. Full '
     'law in DEEPRESEARCH_KNOWLEDGE.md with every source link opened '
     'before it was cited.',
     'Not a skill, on purpose: a skill protects only the session that '
     'loads it; a law binds every fetch in every session.'),
    ('The naming complication is documented, and the path holds', 'wait',
     'Your lawyer friend flagged league names and player names; your ruling '
     '(keep the path for the twenty) and five link-checked findings live in '
     '<code>LEGAL.md</code>, the new one home for legal. The strongest '
     'finding: fantasy sports won names-plus-stats unlicensed on the First '
     'Amendment (CBC v. MLBAM). The greyest zone: names as pack contents. '
     '<a href="https://claude.ai/code/artifact/758a0520-83c3-4590-8bec-e077ef39fef8">'
     'The memo for your friend.</a>',
     'Real legal review gates any release past the twenty and any money. '
     'The item sits in BUILD § 5 where the harvester sees it.'),
    ('The coach is designed, ruled, UNBLOCKED, and not built', 'open',
     'All 256 catalogue rows filed, every script written and jargon-swept, '
     'and as of 08-11 the tours model is RULED. '
     '<code>grep tour docs/play/game.js</code> still returns nothing: none '
     'of it exists in the game. B7 is the next big build on Track B after '
     'B5c and B15, and nothing blocks it any more.',
     'This is the largest single build left on the board, and it is the '
     'one that decides whether a first-time player understands the game '
     'without you standing next to them.'),
    ('Gate 1 is the long pole and it has not moved this week', 'open',
     # computed, never typed. See branch(); the same rule as ever.
     f'<b>{_B["dealable"]} cards deal today against a gate of '
     f'{_B["target"]:,}.</b> {_B["exists"]} exist in scope and the rest '
     f'cannot be dealt because they are unverified. Reading every readable '
     f'card left reaches <b>{_B["ceiling"]}</b>, so the remainder must be '
     f'found or written.',
     'Every hour this week went to Track B. That was the right call for '
     'the twenty, and the bank did not fill itself meanwhile: this is '
     'still the thing that decides the launch date.'),
]

CURATED['desk'] = [
    # Ordered by what unblocks the most, and ONLY things verified still open
    # on 08-13. Each ends with the one action.
    ('Say "merge" to lock the save point', 'wait',
     'The branch holds committed ruled work: the V21b rewords, the V18 '
     'register tiers, LEGAL.md, the D37 record, the injection protocol. '
     'Merging it to main is the tagged save point the Method B revert '
     'architecture needs, and none of it changes gameplay for the twenty.',
     'The prototype build does not wait on this, but the revert '
     'architecture is only real once the save point exists.',
     'One word: merge.'),
    ('Choose the plays: the Setup Book is on your desk', 'wait',
     'Both runs RETURNED, verified. The Setup Book draws every candidate '
     'on the game\'s own court with the offense/defense toggle: '
     '<a href="https://claude.ai/code/artifact/22783545-84e0-4b46-ae29-476f5c290780">'
     'open it and pick</a>. Run B sized the in-game lists: 3 defensive '
     'picks, 4-5 offensive picks.',
     'The lists are the last design input Method B needs; placeholders '
     'carry the build until you pick.',
     'Pick the default 3 defense + 4-5 offense from the book, or overrule it.'),
    ('The hoophall.com one-minute hand read', 'wait',
     'The Hall of Fame\'s terms page is JS-rendered and unreadable to every '
     'fetcher tried; 10 citations in the dealable pool wait on it. The '
     'other 13 of V45\'s 17 publishers are read and filed; springfield.edu '
     'came back GREEN (no terms exist).',
     'hoophall is the natural backbone for the pre-1980 cards Track A '
     'writes next.',
     'Open hoophall.com/terms-of-use on your phone and read for a database '
     'or scraping clause; one sentence back settles 10 citations.'),
    ('Send the naming memo to your friend', 'wait',
     'The background memo is written for him: deferential, six cases with '
     'checked links (Daniels v. FanDuel joined it), the packs question '
     'flagged as the one we do not trust our own read on, and the '
     'signature-moves gradient added at your ask. '
     '<a href="https://claude.ai/code/artifact/758a0520-83c3-4590-8bec-e077ef39fef8">'
     'The memo.</a>',
     'His research starts from our links instead of from scratch.',
     'Send it, and tell me anything he corrects so LEGAL.md stays true.'),
    ('The gym room needs its one image', 'wait',
     'B14 is ruled IN for the twenty and the build is ready to start; the '
     'one real dependency is a gym interior image from your art pipeline. '
     'Art round 2 (with the Daily 5 and Quick Run prompts you asked for '
     'again) is at '
     '<a href="https://claude.ai/code/artifact/c54731f8-60c0-4cdf-97f5-52a2433667dc">'
     'the prompts page</a>.',
     'Without the image the room ships as geometry, which is the '
     'coming-soon mistake again.',
     'Generate the gym interior (portrait first, per the round-2 doc) and '
     'drop it in.'),
    ('Standing decisions nobody is waiting on urgently', 'wait',
     'The hint-pill wording · <code>short_name</code> for the home-screen '
     'icon (iOS truncates "Ball Knowledge") · service worker yes/no/later · '
     '"all the stats" depth (after V29) · the handles formula (you were '
     'asking around) · the walkthrough artifact redo (your call: "that\'s '
     'for later").',
     'None blocks a build this week; all will bite eventually.',
     'Pick any off when you have a minute.'),
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
    ('Stage 2', 'Build the 27 things that make strangers play twice', 'now',
     'Recounted against the code 08-11: <b>15 done, 1 part done, 11 open.</b> '
     'Done since the last count: wake lock, the feedback button, add to home '
     'screen, the sleeping-server handling, and the invite link. Part done: '
     'heat (the sound is still missing). The 11 open: Quick Run, cards '
     'remembering you, play logging, the access-code retirement (your '
     'optional lever, not owed), name tags, the CPU-vs-CPU sanity test, the '
     '27 lazy questions, TV mode, player skills, chat and trash talk.',
     'More than half done. The biggest open items for a second session are '
     'Quick Run and cards remembering you (B8/B9), both unblocked.'),
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

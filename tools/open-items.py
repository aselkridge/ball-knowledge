#!/usr/bin/env python3
"""Every open item, harvested from the docs that own them. Reports; never writes.

  python3 tools/open-items.py            # the list, plus the drift checks
  python3 tools/open-items.py --list     # just the list, nothing else

WHY THIS EXISTS
---------------
Aaron, 2026-08-04: *"Make sure you mark down every learning and everything that
is still left to do that you mentioned so we do not lose track. Maybe that needs
to be ANOTHER skill, that every time you come up with something that still needs
to be done that we are sure to add it to the list of to-dos so that it does not
get lost or forgotten."*

He was pointing at a real hole. On 08-04 a single work block surfaced four things
that needed doing — 40 source rows holding two urls, 3 unruled sites, the
wrong-page failure tiering cannot catch, a root-slug hole — and every one of them
existed ONLY as a sentence in a chat reply. The commit did not carry them. No
file carried them. One compaction and all four are gone, and the next session
rediscovers them at full price. That has already happened in this project: the
22u lesson was rediscovered twice.

WHAT IT IS NOT
--------------
It is NOT a new to-do file. CLAUDE.md is explicit that a parallel notes file is
how a source of truth dies, and it is right. Open items live in the doc that
already owns that KIND of work — the sources-of-truth map decides, not this
script. All this does is read those docs and put the answer in one place.

THE CONVENTION, and it already existed
--------------------------------------
BUILD.md §5 has used `- [ ]` / `- [x]` for Aaron's action items since July. This
extends that same markdown checkbox to the other homes. Nothing new to learn:

    - [ ] **Title** — what it is, and what it blocks.
    - [x] ~~Title~~ ✅ DONE 08-04 — what actually happened.

WHAT IT CANNOT DO. It cannot see a to-do that was only ever said out loud in a
chat reply — which is the exact failure it was built for. No script can. What it
CAN do is show the whole list in one command so a missing item is visible, and
count work commits against doc commits so a silent stretch gets called out. The
`open-items` skill does the judgement. This does the counting.
"""
import os, re, sys, json, subprocess, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIST_ONLY = '--list' in sys.argv
LOUD = 5

# Each doc owns a KIND of work. This mirrors the sources-of-truth table in
# CLAUDE.md — if that table changes, change this and nothing else.
HOMES = [
    ('V0.md',                'the live scope — what ships to the twenty'),
    ('RESEARCH-BACKLOG.md',  'research & verification queue'),
    ('BUILD.md',             'build state, roadmap, things needed from Aaron'),
    ('TABLES.md',            'the data structure — schema debt'),
    ('DESIGN.md',            'game rules & locked design decisions'),
]

BOX = re.compile(r'^\s*- \[( |x)\]\s*(.+?)\s*$')
HEAD = re.compile(r'^(#{1,4})\s+(.*)$')


def harvest(path):
    """Checkbox lines, each tagged with the nearest heading above it."""
    out, head = [], ''
    if not os.path.exists(path):
        return out
    for i, line in enumerate(open(path, encoding='utf-8'), 1):
        h = HEAD.match(line)
        if h:
            head = h.group(2).strip()
            continue
        m = BOX.match(line)
        if m:
            out.append({'line': i, 'done': m.group(1) == 'x',
                        'text': m.group(2), 'head': head})
    return out


def git(*a):
    return subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True,
                          text=True).stdout.strip()


ALL = {f: harvest(os.path.join(ROOT, f)) for f, _ in HOMES}
open_items = {f: [i for i in v if not i['done']] for f, v in ALL.items()}
n_open = sum(len(v) for v in open_items.values())
n_done = sum(len(v) - len(open_items[f]) for f, v in ALL.items())

print('OPEN ITEMS — harvested from the docs that own them')
print('=' * 66)
for f, what in HOMES:
    items = open_items[f]
    if not items:
        continue
    print(f'\n{f}  ({what})')
    last = None
    for it in items:
        if it['head'] != last:
            print(f'   ── {it["head"]}')
            last = it['head']
        txt = re.sub(r'\*\*|`|~~', '', it['text'])
        txt = re.sub(r'\s+', ' ', txt)
        print(f'      [{f}:{it["line"]}] {txt[:110]}')
print()
print('=' * 66)
print(f'  {n_open} open · {n_done} closed · across '
      f'{sum(1 for f in open_items if open_items[f])} files')

if LIST_ONLY:
    sys.exit(0)

# ---- drift check 1: counted debt that nobody has written an item for --------
# todo.json counts gaps in the DATA. If a run has hundreds of open rows and no
# open item anywhere names it, the work is being counted but not tracked — which
# is how R3 sat at 513 for a week with no one owning it.
print()
print('COUNTED DEBT vs WRITTEN ITEMS')
print('-' * 66)
try:
    todo = json.load(open(os.path.join(ROOT, 'docs/play/data/tables/todo.json')))
    runs = collections.Counter(r['run'] for r in todo)
    blob = ' '.join(i['text'] + ' ' + i['head']
                    for v in open_items.values() for i in v)
    # V0.md's run table is a legitimate home for these even without a checkbox
    v0 = open(os.path.join(ROOT, 'V0.md'), encoding='utf-8').read()
    for run, n in sorted(runs.items()):
        named = bool(re.search(rf'\b{run}\b', blob))
        in_v0 = bool(re.search(rf'\*\*{run}\*\*', v0))
        where = 'open item' if named else ('V0 run table' if in_v0 else None)
        flag = '' if where else '   <- COUNTED, BUT NOTHING TRACKS IT'
        print(f'  {run:4s} {n:5d} rows   {where or "nowhere":14s}{flag}')
except Exception as e:
    print(f'  could not read todo.json: {e}')

# ---- drift check 2: a run that hit zero but is still written as open --------
try:
    stale = []
    for f, items in open_items.items():
        for it in items:
            for run in re.findall(r'\bR\d\b', it['text'] + it['head']):
                if runs.get(run, 0) == 0:
                    stale.append((f, it['line'], run))
    if stale:
        print()
        print('  DONE BUT STILL WRITTEN AS OPEN:')
        for f, ln, run in stale:
            print(f'    {f}:{ln} still tracks {run}, which is now 0 rows')
except Exception:
    pass

# ---- drift check 3: work commits with no item filed ------------------------
print()
print('WAS ANYTHING FILED LATELY?')
print('-' * 66)
files = [f for f, _ in HOMES]
last = git('log', '-1', '--format=%H', '--', *files)
rng = f'{last}..HEAD' if last else 'HEAD'
commits = [l for l in git('log', rng, '--format=%h').splitlines() if l]
work = []
for h in commits:
    names = git('show', '--name-only', '--format=', h).splitlines()
    if any(n.startswith(('tools/', 'docs/play/')) for n in names):
        work.append(h)

print(f'  commits since a home doc was touched   {len(commits):4d}')
print(f'  of those, code or data work            {len(work):4d}')
if len(work) >= LOUD:
    print()
    print('  ' + '!' * 60)
    print(f'  {len(work)} COMMITS OF WORK AND NOT ONE ITEM FILED OR CLOSED.')
    print('  Work that surfaces nothing to do, and closes nothing, is rare.')
    print('  ' + '!' * 60)
elif not work:
    print('  Nothing since. Nothing owed.')

print()
print('  Filed in the SAME turn it is realised, or it is gone. The home is')
print('  decided by the sources-of-truth table in CLAUDE.md, never by this')
print('  script, and never by starting a new file.')
sys.exit(0)

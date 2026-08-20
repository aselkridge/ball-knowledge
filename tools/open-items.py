#!/usr/bin/env python3
"""DRIFT DETECTOR. Everything filed in a doc that never reached TODO.md.

  python3 tools/open-items.py            # the harvest, plus the drift checks
  python3 tools/open-items.py --list     # just the harvest

DEMOTED 2026-08-20, and the demotion is the point. **TODO.md is the list** and
`tools/list.py` is the command. This is no longer where work is tracked; it is
the guard that catches work which was written into a doc and never made it onto
the list.

Aaron, 2026-08-20: *"every time we speak there is a B# and a D# and A# and just
regular old number X and more and more lists... I have no idea what list is
truly tracking what's next."* Counted: eight id schemes across five files. This
script was part of that, because it faithfully reported a pile of items from
five documents while `next.py` answered "what's next" from two tables in one of
them, so the two commands never agreed and neither was the plan.

WHAT IT IS FOR NOW
------------------
The prose docs still hold the REASONING: why a defect matters, what was
measured, what Aaron said. That belongs there and is not moving. What moved is
the LIST. The risk that creates is obvious: someone writes an item into V0.md or
BUILD.md and it never becomes a row in TODO.md. This finds those.

Run it at the end of a work block, next to `python3 tools/list.py --check`.
Anything it surfaces should either be added to TODO.md or, if the doc text is
stale, struck in the doc.

WHY THE ORIGINAL EXISTED, kept because the lesson still holds
-------------------------------------------------------------
Aaron, 2026-08-04: *"every time you come up with something that still needs to be
done... make sure it does not get lost or forgotten."* On 08-04 one work block
surfaced four real tasks and every one existed ONLY as a sentence in a chat
reply. One compaction from gone. The mechanism was right; it just needed one
destination instead of five.
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
    ('LEGAL.md',             'legal findings & open legal questions'),
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

print('DRIFT CHECK — items in the docs, measured against TODO.md')
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


# ---------------------------------------------------------------------------
# STRAY RULINGS UNDER design/
#
# The five HOMES above are the only docs harvested, per the sources-of-truth
# table, and that is right: items belong in a root home, not scattered.
#
# But a working doc under design/ is where a big piece of thinking gets
# written, and thinking produces items. On 2026-08-10 the DESIGN.md-versus-
# shipped-turn contradiction was found, understood and written down as item 4
# of "Open for Aaron to rule" in design/COACH-TOURS-2026-08-10.md. It was
# invisible to this script and to next.py, so the next time Aaron asked about
# that rule the answer had to be rebuilt from scratch. Filed correctly, into a
# doc nothing reads, is the same as not filed.
#
# This does not harvest those docs (that would break one-home). It NAMES them,
# so the section gets read and its items get moved.
DESIGN_DIR = os.path.join(ROOT, 'design')
OPEN_SEC = re.compile(r'^#{1,4}\s+.*\b(open for aaron|open to rule|'
                      r'open questions?|still open|for aaron to rule)\b',
                      re.I | re.M)
strays = []
if os.path.isdir(DESIGN_DIR):
    for fn in sorted(os.listdir(DESIGN_DIR)):
        if not fn.endswith('.md'):
            continue
        try:
            txt = open(os.path.join(DESIGN_DIR, fn), encoding='utf-8').read()
        except OSError:
            continue
        for m in OPEN_SEC.finditer(txt):
            line = txt[:m.start()].count('\n') + 1
            # count the numbered/bulleted items under that heading
            rest = txt[m.end():]
            nxt = re.search(r'^#{1,4}\s+', rest, re.M)
            body = rest[:nxt.start()] if nxt else rest
            n = len(re.findall(r'^\s*(?:\d+\.|[-*])\s+\S', body, re.M))
            strays.append((fn, line, m.group(0).strip('# ').strip(), n))

if strays:
    print()
    print('  RULINGS PENDING IN design/, WHICH NOTHING HARVESTS')
    print('  ' + '-' * 58)
    for fn, line, head, n in strays:
        print(f'    design/{fn}:{line}')
        print(f'      "{head}"  ·  {n} item{"" if n == 1 else "s"}')
    print()
    print('  These are NOT counted above. A doc under design/ is a working')
    print('  doc; items in it are invisible to this script and to next.py.')
    print('  Read the section and move anything real to its root home.')

print()
print('  Filed in the SAME turn it is realised, or it is gone. The home is')
print('  decided by the sources-of-truth table in CLAUDE.md, never by this')
print('  script, and never by starting a new file.')
sys.exit(0)

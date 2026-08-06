#!/usr/bin/env python3
"""Did this stretch of work write down what it learned? Reports; never writes.

  python3 tools/learnings-check.py            # since the last learnings commit
  python3 tools/learnings-check.py --since 20 # last 20 commits

WHY THIS EXISTS
Aaron, 2026-08-03: *"are you tracking all of the learnings... I thought there
were skills that did this regularly."* There were none. Checked: nine commits
that day, ZERO touching AI-LEARNINGS.md or MAKING.md — including the commits
that produced the two most useful lessons the project had turned up.

CLAUDE.md already predicted this about itself:

  "instructions alone did NOT prevent the repeat... the durable fix is turning a
   claim into a command — because scripts run and reminders don't."

The rule meant to capture learnings was itself a reminder, and it failed exactly
as the document said reminders fail. This is the command version.

WHAT IT CANNOT DO. It cannot tell whether something was LEARNED — that is a
judgement, and pretending otherwise would make it a rubber stamp. What it can do
is count, and refuse to be quiet: N commits of real work with no learnings
written is a fact, and seeing it is usually enough.
"""
import subprocess, sys, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['AI-LEARNINGS.md', 'MAKING.md']
LOUD = 5          # this many work commits with nothing written = say so loudly


def git(*a):
    return subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True,
                          text=True).stdout.strip()


n = None
if '--since' in sys.argv:
    n = int(sys.argv[sys.argv.index('--since') + 1])

if n is None:
    # everything since the last commit that touched a learnings file
    last = git('log', '-1', '--format=%H', '--', *FILES)
    rng = f'{last}..HEAD' if last else 'HEAD'
    label = 'since the last learnings were written'
else:
    rng = f'HEAD~{n}..HEAD'
    label = f'the last {n} commits'

log = git('log', rng, '--format=%h\x1f%s')
commits = [l.split('\x1f') for l in log.splitlines() if l]

touched = set()
for f in FILES:
    if git('log', rng, '--format=%h', '--', f):
        touched.add(f)

# a commit is "work" if it changed code or data, not just docs
work = []
for h, subj in commits:
    files = git('show', '--name-only', '--format=', h).splitlines()
    if any(f.startswith(('tools/', 'docs/play/')) for f in files):
        work.append((h, subj))

print('LEARNINGS CHECK — ' + label)
print('-' * 62)
print(f'  commits in range              {len(commits):4d}')
print(f'  of those, code or data work   {len(work):4d}')
for f in FILES:
    print(f'  {f:28s}{"written  ✓" if f in touched else "NOT WRITTEN":>12}')

if not work:
    print('\n  No code or data work in range. Nothing owed.')
    sys.exit(0)

missing = [f for f in FILES if f not in touched]
if not missing:
    print('\n  Both written. Nothing owed.')
    sys.exit(0)

print()
print(f'  {len(work)} commits of real work and {" + ".join(missing)} untouched.')
if len(work) >= LOUD:
    print()
    print('  ' + '!' * 58)
    print(f'  THAT IS {len(work)} COMMITS WITH NOTHING WRITTEN DOWN.')
    print('  This is the exact failure CLAUDE.md predicts about its own rules.')
    print('  ' + '!' * 58)
print()
print('  The work in question — anything here teach you something?')
for h, subj in work[:14]:
    print(f'    {h}  {subj[:66]}')
if len(work) > 14:
    print(f'    ... and {len(work)-14} more')
print()
print('  AI-LEARNINGS.md = portable lessons about working with an AI system.')
print('                    Overwrite the relevant section; never stack a new one.')
print('  MAKING.md       = the story. What went wrong, what it cost, how it felt.')
print('                    Do not sanitise — the errors ARE the content.')
print()
print('  Nothing to write is a legitimate answer. Deciding that without')
print('  looking is not. Run the `learnings` skill to do this properly.')
sys.exit(0)

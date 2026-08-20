#!/usr/bin/env python3
"""RETIRED 2026-08-20. The list is TODO.md and the command is list.py.

This used to read V0.md's two track tables. It was right to exist and it was
right about its own principle, which was: one command, one source, and if the
answer is wrong then the plan is wrong. It is retired for the reason it warned
about, one level up.

Aaron, 2026-08-20: "every time we speak there is a B# and a D# and A# and just
regular old number X and more and more lists and you have never explicitly told
me what any of those letters stand for and I have no idea what list is truly
tracking what's next."

Counted, he was right: EIGHT id schemes across FIVE files, and the bare numbers
in V0.md meant two unrelated things. This command answered honestly from two of
those tables and was therefore blind to the other six. It named B17 as next
while the item Aaron had explicitly queued in his own words sat in a table this
never read.

Kept as a redirect rather than deleted, because its url is in commit messages
and in BUILD.md's session records.
"""
import sys

print(__doc__.split('\n\n')[0])
print('\n  python3 tools/list.py            what is next')
print('  python3 tools/list.py --all      every list')
print('  python3 tools/list.py --yours    everything waiting on Aaron')
print('  python3 tools/list.py --check    validate the file\n')
sys.exit(2)

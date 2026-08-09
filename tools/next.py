#!/usr/bin/env python3
"""What is the next open item on each of the two tracks to the twenty?

    python3 tools/next.py            the top open item on each track
    python3 tools/next.py --all      every row on both tracks, with its state

CLAUDE.md opens with "THE PLAN IS V0.md" and warns against assembling a plan
from anywhere else. On 2026-08-09 I did exactly that: asked what was left, I
harvested open-items.py, BUILD.md and a handful of my own greps and produced a
list that was NOT the plan. Aaron: "This should be from the two paths to 20."

He was right, and reading the plan would ALSO have given a wrong answer, because
three shipped items had never been struck through in the track tables. A plan
nobody can query in one command is a plan that gets rebuilt from memory, and a
plan that lies about what is done is one nobody trusts twice.

So this is the command. It reads the two track tables in V0.md and nothing else.
No second source, no inference, no cleverness: if the answer here is wrong, the
PLAN is wrong, and the plan is the thing to fix.
"""
import re, sys, pathlib

V0 = pathlib.Path(__file__).resolve().parent.parent / 'V0.md'

TRACKS = [('### TRACK A · DATA', 'TRACK A · DATA', 'to 1,000 dealable cards'),
          ('### TRACK B · BUILD', 'TRACK B · BUILD', 'the game the twenty open')]

# The coach block, ruled by Aaron on 08-08 and 08-09: these go in together and
# they are all waiting on one answer, how much the Coach may say.
COACH = {'B7', 'B14'}
ROW = re.compile(r'^\|\s*(~~)?\*\*([AB]\d+\w*)\*\*(~~)?\s*\|(.*)$')


def clean(t):
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'\*\*|~~|`', '', t)
    return re.sub(r'\s+', ' ', t).strip()


def rows(head):
    s = V0.read_text(encoding='utf-8')
    i = s.find(head)
    if i < 0:
        return []
    j = s.find('\n---', i)
    out = []
    for ln in s[i:j if j > 0 else i + 12000].splitlines():
        m = ROW.match(ln)
        if not m:
            continue
        cells = [c for c in m.group(4).split('|')]
        title = clean(cells[0])
        rest = ' '.join(clean(c) for c in cells[1:])
        who = 'Aaron' if re.search(r'\bAaron\b,?\s*(one|a sentence|one small|decides)', rest) \
                      or clean(cells[1] if len(cells) > 1 else '') == 'Aaron' else 'Claude'
        out.append({'id': m.group(2), 'done': bool(m.group(1)),
                    'title': title, 'who': who, 'why': rest})
    return out


def main():
    every = '--all' in sys.argv
    print('THE TWO PATHS TO THE TWENTY, read out of V0.md and nowhere else')
    print('=' * 74)
    for head, label, gist in TRACKS:
        rs = rows(head)
        if not rs:
            print(f'\n{label}: TABLE NOT FOUND. The plan moved; fix this script.')
            continue
        done = [r for r in rs if r['done']]
        openr = [r for r in rs if not r['done']]
        blocked = [r for r in openr if r['id'] in COACH]
        free = [r for r in openr if r['id'] not in COACH]
        print(f'\n{label}  ·  {gist}')
        print(f'  {len(done)} done · {len(openr)} open'
              + (f' · {len(blocked)} held in the coach block' if blocked else ''))
        print('-' * 74)
        show = rs if every else (free[:3] if free else openr[:3])
        for r in show:
            mark = 'DONE ' if r['done'] else ('COACH' if r['id'] in COACH else
                                              ('AARON' if r['who'] == 'Aaron' else '  >  '))
            print(f'  {mark} {r["id"]:5} {r["title"][:96]}')
        if not every:
            nxt = next((r for r in free if r['who'] == 'Claude'), None)
            aar = next((r for r in openr if r['who'] == 'Aaron'), None)
            if nxt:
                print(f'\n  NEXT, mine:    {nxt["id"]} · {nxt["title"][:82]}')
            if aar:
                print(f'  NEXT, Aaron:   {aar["id"]} · {aar["title"][:82]}')
            if blocked:
                print('  HELD:          ' + ', '.join(r['id'] for r in blocked)
                      + '  (the coach block, waiting on one answer)')
    print('\n' + '=' * 74)
    print('  Anything not on these two tables is NOT the plan. If work belongs')
    print('  on a track, put it on the track. If a row is stale, fix the row:')
    print('  the commit that makes a doc stale fixes the doc.')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""THE LIST. One command, one file, six lists, no letters.

Aaron, 2026-08-20: "I have no idea what list is truly tracking what's next."
He was right, and the count was the argument: EIGHT id schemes across FIVE
files, with bare numbers meaning two different things inside one of them.

This reads TODO.md and nothing else. If the answer here is wrong, TODO.md is
wrong, and the fix is the row. That is deliberate and it is the same rule
next.py had: a plan you cannot query in one command gets rebuilt from memory.

  python3 tools/list.py             what to do next, one item per active list
  python3 tools/list.py --all       every list, every row
  python3 tools/list.py --yours     everything waiting on Aaron
  python3 tools/list.py --mine      everything waiting on me
  python3 tools/list.py build       one list by name (build, research,
                                    build-later, research-later, nice, scrapped)
  python3 tools/list.py --check     validate the file, exit 1 if it is broken
"""
import re
import sys

DOC = 'TODO.md'
STATUS = {'open', 'doing', 'blocked'}
WHOSE = {'me', 'Aaron'}
# section heading -> (short name, is it being worked on right now)
LISTS = [
    ('1 · BUILD — active',            'build',           True),
    ('2 · RESEARCH — active',         'research',        True),
    ('3 · BUILD · after the 20',      'build-later',     False),
    ('4 · RESEARCH · after the 20',   'research-later',  False),
    ('5 · NICE TO HAVE',              'nice',            False),
    ('6 · SCRAPPED',                  'scrapped',        False),
]
# 3, 4, 5 and 6 owe a reason for being there rather than on 1 or 2.
NEEDS_NOTE = {'build-later', 'research-later', 'scrapped'}


def parse():
    """Rows out of TODO.md, in file order, tagged with their list."""
    try:
        lines = open(DOC).read().split('\n')
    except FileNotFoundError:
        sys.exit(DOC + ' is missing. That file IS the list.')
    heads = {h: (s, a) for h, s, a in LISTS}
    cur, rows, problems = None, [], []
    for n, line in enumerate(lines, 1):
        if line.startswith('## '):
            cur = heads.get(line[3:].strip())
            continue
        if cur is None or not line.startswith('|'):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) != 6 or cells[0] in ('#', '') or set(cells[0]) <= set('-: '):
            continue
        num, was, item, whose, status, note = cells
        if not num.isdigit():
            problems.append(f'{DOC}:{n}  id "{num}" is not a plain number')
            continue
        rows.append({'n': int(num), 'was': was, 'item': item, 'whose': whose,
                     'status': status, 'note': note,
                     'list': cur[0], 'active': cur[1], 'line': n})
    return rows, problems


def check(rows, problems):
    seen = {}
    for r in rows:
        if r['n'] in seen:
            problems.append(f"{DOC}:{r['line']}  id {r['n']} already used on line {seen[r['n']]}")
        seen[r['n']] = r['line']
        if r['status'] not in STATUS:
            problems.append(f"{DOC}:{r['line']}  status \"{r['status']}\" is not one of {sorted(STATUS)}")
        if r['whose'] not in WHOSE:
            problems.append(f"{DOC}:{r['line']}  whose \"{r['whose']}\" is not one of {sorted(WHOSE)}")
        if not r['item']:
            problems.append(f"{DOC}:{r['line']}  id {r['n']} has no text")
        if r['list'] in NEEDS_NOTE and not r['note']:
            problems.append(f"{DOC}:{r['line']}  id {r['n']} is on {r['list']} and owes a note saying why")
        if r['status'] == 'blocked' and r['whose'] == 'me' and not r['note']:
            problems.append(f"{DOC}:{r['line']}  id {r['n']} is blocked on me with no note saying on what")
        # No new letters. The whole point.
        if re.match(r'^[A-Z]+\d', r['item']):
            problems.append(f"{DOC}:{r['line']}  id {r['n']} starts with a letter code; put it in `was`")
    return problems


def line(r, wide=False):
    tag = {'open': '  ', 'doing': '>>', 'blocked': '..'}[r['status']]
    who = '' if r['whose'] == 'me' else '  [AARON]'
    txt = r['item'] if wide else r['item'][:86]
    out = f"  {tag} {str(r['n']).rjust(3)}  {txt}{who}"
    if wide and r['note']:
        out += f"\n           note: {r['note']}"
    return out


def main():
    args = [a for a in sys.argv[1:]]
    rows, problems = parse()
    problems = check(rows, problems)

    if '--check' in args:
        for p in problems:
            print('  ' + p)
        print(f"\n{len(rows)} rows · " + ('BROKEN: ' + str(len(problems)) + ' problem(s)'
                                          if problems else 'clean'))
        sys.exit(1 if problems else 0)

    if problems:
        print('!! TODO.md has ' + str(len(problems)) +
              ' problem(s). Run: python3 tools/list.py --check\n')

    named = [a for a in args if not a.startswith('-')]
    if named:
        want = named[0]
        rows = [r for r in rows if r['list'] == want]
        if not rows:
            sys.exit('no list called "' + want + '". Try: ' +
                     ', '.join(s for _, s, _ in LISTS))
        print(f'\n{want.upper()} · {len(rows)} open\n' + '-' * 66)
        for r in rows:
            print(line(r, wide=True))
        return

    if '--yours' in args or '--mine' in args:
        who = 'Aaron' if '--yours' in args else 'me'
        rows = [r for r in rows if r['whose'] == who]
        title = ("WAITING ON AARON" if who == 'Aaron' else "MINE")
        print(f'\n{title} · {len(rows)}\n' + '=' * 66)
        for lname in [s for _, s, _ in LISTS]:
            sub = [r for r in rows if r['list'] == lname]
            if not sub:
                continue
            print(f'\n{lname}')
            for r in sub:
                print(line(r, wide=True))
        return

    if '--all' in args:
        print('\nTHE LIST · everything, out of TODO.md\n' + '=' * 66)
        for head, short, active in LISTS:
            sub = [r for r in rows if r['list'] == short]
            flag = '' if active else '   (not being worked on)'
            print(f'\n{head}  ·  {len(sub)}{flag}\n' + '-' * 66)
            for r in sub:
                print(line(r))
        print()
        return

    # default: what is next
    print('\nWHAT IS NEXT, out of TODO.md and nothing else\n' + '=' * 66)
    for head, short, active in LISTS:
        if not active:
            continue
        sub = [r for r in rows if r['list'] == short]
        mine = [r for r in sub if r['whose'] == 'me']
        doing = [r for r in mine if r['status'] == 'doing']
        ready = [r for r in mine if r['status'] == 'open']
        theirs = [r for r in sub if r['whose'] == 'Aaron']
        print(f'\n{head}  ·  {len(sub)} open, {len(theirs)} of them yours'
              f'\n' + '-' * 66)
        if doing:
            r = doing[0]
            print(f'  CARRY ON:  {r["n"]}  {r["item"]}')
            if r['note']:
                print(f'             note: {r["note"]}')
            rest = ready          # nothing consumed from ready, so start at its top
        elif ready:
            r = ready[0]
            print(f'  NEXT:  {r["n"]}  {r["item"]}')
            if r['note']:
                print(f'         note: {r["note"]}')
            rest = ready[1:]
        else:
            print('  nothing of mine is unblocked here')
            rest = []
        for r in rest[:2]:
            print(f'  then:  {r["n"]}  {r["item"][:74]}')

    waiting = [r for r in rows if r['whose'] == 'Aaron' and r['active']]
    print('\n' + '=' * 66)
    print(f'  {len(waiting)} waiting on Aaron across the two active lists.'
          '  python3 tools/list.py --yours')
    print('  Anything not in TODO.md is not the plan. If a row is wrong, fix'
          '\n  the row: the commit that makes it stale fixes it.\n')


main()

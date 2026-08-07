#!/usr/bin/env python3
"""What have we already downloaded and NOT turned into questions?

    python3 tools/unmined.py            the pile, richest first
    python3 tools/unmined.py --files    research files, field by field
    python3 tools/unmined.py --pages    cached pages vs cards resting on them

Why this exists
---------------
Aaron, 2026-08-07, after I made the same mistake twice in one day:
*"please ALWAYS err on the side of more is better with data and questions...
when you come across data, no matter what other task you are doing, save it,
use it, save it for later, mine it DRYYYY for facts and questions!!!"*

**The failure mode, named exactly.** When I meet data I ask "is this worth it
FOR THE TASK I AM ON?" That question has the wrong denominator. Any single card
is small, so the answer is always no, so I keep walking past material we already
paid for. Twice today: I called an 80-page sweep a bad trade because I was
costing it against one card, and then, having been overruled and having run the
sweep, I used ONE of the 609 facts it returned and moved on.

The right denominator is the database. A fact already on disk costs nothing to
keep and nothing to mine, and the bank is 393 cards short of its own gate.

**Why a script and not a note.** CLAUDE.md says it in its own words: instructions
alone did not prevent a repeat, and the durable fix is turning a claim into a
command. A reminder to "mine it dry" is a reminder. This counts what was left.
"""

import collections
import json
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = ROOT / 'docs/play/data'
T = DATA / 'tables'

# Keys that are plumbing, not facts. Everything else in a research file is
# something a question could be written from.
PLUMBING = {'id', 'url', 'source', 'sources', 'source_id', 'fact_id', 'srcid',
            'src', 'date', 'date_checked', 'date_read', 'tier', 'confidence',
            'verdict', 'note', 'notes', 'add_source', 'source_title', 'via',
            'season_end', 'slug', 'key'}


def walk(obj, bank, depth=0):
    """Return (facts, already_in_bank) for a nested structure.

    ONE walk for both halves, deliberately. The first version counted facts
    recursively and checked the bank only at the top level, so any file shaped
    as a dict-of-lists reported 100% unmined. research-run1-questions.json is
    exactly that shape and came back "8,350 facts, 0 in bank" when 626 of its
    657 questions were already live. I quoted that number to Aaron and wrote it
    into CLAUDE.md before catching it.

    The lesson is not "be careful with recursion". It is that a counter which
    walks the numerator and the denominator DIFFERENTLY will always be wrong,
    and wrong in the flattering direction, because the deep side finds more.
    """
    n = seen = 0
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in PLUMBING:
                continue
            if isinstance(v, (dict, list)):
                a, b = walk(v, bank, depth + 1)
                n += a
                seen += b
            elif v not in (None, '', [], {}):
                n += 1
                if isinstance(v, str) and norm(v) in bank:
                    seen += 1
    elif isinstance(obj, list):
        for x in obj:
            a, b = walk(x, bank, depth + 1)
            n += a
            seen += b
    return n, seen


def norm(s):
    return re.sub(r'[^a-z0-9 ]', '', str(s).lower()).strip()


def bank_index():
    """Everything the bank already knows, as a bag of normalised strings, so a
    research row can be asked "are you already in here?"."""
    facts = json.loads((T / 'facts.json').read_text())
    blob = set()
    for f in facts:
        for k in ('question', 'answer', 'note'):
            v = f.get(k)
            if isinstance(v, str):
                blob.add(norm(v))
        for c in (f.get('choices') or []):
            blob.add(norm(c))
    return blob


def question_level(bank):
    """Written questions vs raw facts, which is what a mining pass actually acts
    on. The leaf counter is for spotting neglected FILES; this is for planning."""
    QK = ('q', 'question', 'prompt', 'stem')
    FK = ('fact', 'claim', 'statement')

    def every_dict(o):
        if isinstance(o, dict):
            yield o
            for v in o.values():
                yield from every_dict(v)
        elif isinstance(o, list):
            for x in o:
                yield from every_dict(x)

    qn = qnew = fn = 0
    for p, obj in research_files():
        for r in every_dict(obj):
            qk = next((k for k in QK if k in r), None)
            if qk:
                qn += 1
                if norm(r[qk]) not in bank:
                    qnew += 1
            elif any(k in r for k in FK):
                fn += 1
    return qn, qnew, fn


def research_files():
    out = []
    for p in sorted(DATA.glob('research-*.json')):
        try:
            obj = json.loads(p.read_text())
        except Exception:
            continue
        out.append((p, obj))
    return out


def main():
    a = sys.argv[1:]

    if '--pages' in a:
        # Every page we have downloaded, against how many cards cite it. A rich
        # page with one card on it is the shape V32 already chases.
        srcs = json.loads((T / 'sources.json').read_text())
        fs = json.loads((T / 'fact_sources.json').read_text())
        cites = collections.Counter(r['source_id'] for r in fs)
        by_url = {s['source_id']: s.get('url') for s in srcs}
        cached = []
        for d in ('.cache/verify', '.cache/seasons', '.cache/images'):
            p = ROOT / d
            if p.exists():
                cached += [f for f in p.iterdir() if f.is_file()]
        print(f'\nPAGES ON DISK: {len(cached)} across .cache/')
        thin = [(cites.get(sid, 0), by_url[sid]) for sid in by_url
                if by_url[sid] and cites.get(sid, 0) == 1]
        print(f'SOURCES CITED EXACTLY ONCE: {len(thin)}')
        print('  a page good enough to prove one card usually holds five more')
        return

    files = research_files()
    bank = bank_index()
    print(f'\nRESEARCH FILES ON DISK: {len(files)}')
    print(f'{"facts":>7}  {"in bank":>7}  {"%":>4}  file')
    total = untouched = 0
    for p, obj in files:
        n, seen = walk(obj, bank)
        total += n
        untouched += max(0, n - seen)
        pct = round(seen / n * 100) if n else 0
        flag = '  <-- UNMINED' if n > 20 and pct < 15 else ''
        print(f'{n:7}  {seen:7}  {pct:3}%  {p.name}{flag}')

    # LEAF COUNTS ARE NOT QUESTION COUNTS. The number above counts every value
    # in the file, so one four-choice question contributes eight. Quoting it as
    # "facts waiting" overstates the pile by roughly an order of magnitude, which
    # I did once already. The two numbers below are the ones that decide work.
    qn, qnew, fn = question_level(bank)
    print(f'\n{total} leaf values across the files (INFLATED: 4 choices count as 4).')
    print(f'\nTHE NUMBERS THAT DECIDE WORK:')
    print(f'  {qnew:5} ready-written questions NOT in the bank (of {qn} total)')
    print(f'  {fn:5} standalone FACT rows with no question written yet')
    print('\nA fact already on disk costs nothing to keep and nothing to mine,')
    print('and the bank is short of its own gate. Mine it before fetching more.')


if __name__ == '__main__':
    main()

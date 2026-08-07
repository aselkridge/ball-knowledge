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


def facts_in(obj, depth=0):
    """Count leaf values that are plausibly a fact worth a question."""
    n = 0
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in PLUMBING:
                continue
            if isinstance(v, (dict, list)):
                n += facts_in(v, depth + 1)
            elif v not in (None, '', [], {}):
                n += 1
    elif isinstance(obj, list):
        for x in obj:
            n += facts_in(x, depth + 1)
    return n


def bank_index():
    """Everything the bank already knows, as a bag of normalised strings, so a
    research row can be asked "are you already in here?"."""
    facts = json.loads((T / 'facts.json').read_text())
    blob = set()
    for f in facts:
        for k in ('question', 'answer', 'note'):
            v = f.get(k)
            if isinstance(v, str):
                blob.add(re.sub(r'[^a-z0-9 ]', '', v.lower()))
        for c in (f.get('choices') or []):
            blob.add(re.sub(r'[^a-z0-9 ]', '', str(c).lower()))
    return blob


def research_files():
    out = []
    for p in sorted(DATA.glob('research-*.json')):
        try:
            obj = json.loads(p.read_text())
        except Exception:
            continue
        out.append((p, obj, facts_in(obj)))
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
    print(f'{"facts":>7}  {"in bank":>7}  file')
    total = untouched = 0
    for p, obj, n in files:
        rows = obj if isinstance(obj, list) else [obj]
        seen = 0
        for r in rows:
            if not isinstance(r, dict):
                continue
            for k, v in r.items():
                if k in PLUMBING or not isinstance(v, str):
                    continue
                if re.sub(r'[^a-z0-9 ]', '', v.lower()) in bank:
                    seen += 1
        total += n
        untouched += max(0, n - seen)
        flag = '  <-- UNMINED' if n and seen / max(n, 1) < 0.15 else ''
        print(f'{n:7}  {seen:7}  {p.name}{flag}')

    print(f'\n{total} discrete facts sitting in research files.')
    print(f'{untouched} of them do not appear anywhere in the bank.')
    print('\nA fact already on disk costs nothing to keep and nothing to mine,')
    print('and the bank is short of its own gate. Mine it before fetching more.')


if __name__ == '__main__':
    main()

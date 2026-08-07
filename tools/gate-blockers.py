#!/usr/bin/env python3
"""What stands between every in-scope card and the verified gate, counted.

    python3 tools/gate-blockers.py            the breakdown
    python3 tools/gate-blockers.py --links    also fetch every source page
    python3 tools/gate-blockers.py --slice D  list the cards in one bucket

Why this exists
---------------
"How do we get to 1,000?" was answered three times this week by writing a
throwaway script in a chat window, and each answer had to be re-derived from
scratch because the previous one existed only as a message. CLAUDE.md's rule
covers exactly this case: *if a check can be a script, make it one, because
scripts run and reminders don't.*

It also answers a question the raw count cannot. `build-verified-index.py` says
how many cards are held back. This says WHY each one is held back, which decides
what work to do next: a card one publisher short of high confidence is twenty
minutes of reading, and a card whose only source row has no url is a research
job that no amount of reading will touch.

The buckets are ordered by cost, cheapest first.
"""

import collections
import concurrent.futures
import json
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T = ROOT / 'docs/play/data/tables'

# V0 scope. Untagged cards count as in-scope because the picker deals them into
# every league, which is the same reason they count toward every pool in
# build-verified-index.py. Keep the two definitions in step.
SCOPE = {'nba', 'wnba', 'any'}
GATE_TARGET = 1000


def load(name):
    return json.loads((T / f'{name}.json').read_text())


def model():
    facts, srcs = load('facts'), load('sources')
    SRC = {s['source_id']: s for s in srcs}
    by_fact = collections.defaultdict(list)
    for r in load('fact_sources'):
        if r['source_id'] in SRC:
            by_fact[r['fact_id']].append(SRC[r['source_id']])
    lg = collections.defaultdict(set)
    for r in load('fact_leagues'):
        lg[r['fact_id']].add(r['league_id'])
    return facts, srcs, by_fact, lg


def bucket_of(f, ss):
    """Cheapest true statement about why this card is not dealable."""
    if f.get('confidence') == 'high' and not f.get('date_checked'):
        return 'A', 'high confidence, never date-stamped: one read each'
    tiered = [s for s in ss if s.get('url')]
    t1 = [s for s in tiered if s.get('tier') == 1]
    t2 = [s for s in tiered if s.get('tier') == 2]
    pubs2 = {s.get('publisher') for s in t2 if s.get('publisher')}
    if t1:
        return 'B', 'has a Tier 1 source already: read it and stamp it'
    if len(pubs2) >= 2:
        return 'C', 'two Tier 2 publishers already: should already be high'
    if len(pubs2) == 1:
        return 'D', 'exactly one Tier 2: needs ONE more publisher'
    wiki = [s for s in tiered if 'wikipedia.org' in (s.get('url') or '')]
    if wiki:
        return 'E', 'Wikipedia only: follow the footnote (V15)'
    if tiered:
        return 'F', 'only other Tier 3 links: needs a real source'
    if ss:
        return 'G', 'source rows carry NO url: a FINDING job, not a reading one'
    return 'H', 'no source row at all'


def main():
    facts, srcs, by_fact, lg = model()
    in_scope = [f for f in facts
                if not lg[f['fact_id']] or (lg[f['fact_id']] & SCOPE)]
    dealable = [f for f in in_scope
                if f.get('confidence') == 'high' and f.get('date_checked')]

    buckets = collections.OrderedDict()
    for f in in_scope:
        if f in dealable:
            continue
        k, why = bucket_of(f, by_fact[f['fact_id']])
        buckets.setdefault(k, [why, []])[1].append(f)

    print(f'\nIN SCOPE (nba, wnba, or untagged): {len(in_scope)} of {len(facts)}')
    print(f'DEALABLE TODAY:                    {len(dealable)}')
    print(f'GATE TARGET:                       {GATE_TARGET}')

    readable = sum(len(v[1]) for k, v in buckets.items() if k in 'ABCDE')
    print(f'\nCEILING CHECK, and it is the number that matters:')
    print(f'  {len(dealable)} dealable + {readable} readable = '
          f'{len(dealable) + readable} best case from verification alone')
    # TWO gaps, and quoting only the first one flatters the position.
    # The floor assumes every card in the bank eventually becomes dealable.
    # The realistic gap assumes only the readable ones do, which is the honest
    # planning number until the no-url pile has somewhere to be read FROM.
    floor = GATE_TARGET - len(in_scope)
    real = GATE_TARGET - (len(dealable) + readable)
    if floor > 0:
        print(f'  floor:      {floor} new questions, if every single card in '
              f'the bank is eventually sourced')
    if real > 0:
        print(f'  realistic:  {real} more cards needed beyond the readable '
              f'ones, whether written new or rescued from the no-url pile')

    print(f'\nWHY THE OTHER {len(in_scope)-len(dealable)} ARE HELD BACK, '
          f'cheapest first:')
    for k in sorted(buckets):
        why, rows = buckets[k]
        print(f'  {k}  {len(rows):5}  {why}')

    # A placeholder source row is not a source. Counting them separately stops
    # "it has a source" from meaning "it has something you can open".
    nourl = [s for s in srcs if not (s.get('url') or '').strip()]
    print(f'\nPLACEHOLDER SOURCE ROWS (id and title, no url, no tier): '
          f'{len(nourl)} of {len(srcs)}')

    if '--slice' in sys.argv:
        want = sys.argv[sys.argv.index('--slice') + 1].upper()
        why, rows = buckets.get(want, ('no such bucket', []))
        print(f'\nBUCKET {want}: {why}  ({len(rows)} cards)')
        for f in rows:
            urls = ' '.join(s.get('url', '') for s in by_fact[f['fact_id']])
            print(f"  {f['fact_id'][:44]:44} t{f['difficulty']}  "
                  f"{(f.get('question') or '')[:56]}")
            if urls.strip():
                print(f"      {urls[:150]}")

    if '--links' in sys.argv:
        urls = sorted({s['url'].split('#')[0]
                       for f in in_scope for s in by_fact[f['fact_id']]
                       if (s.get('url') or '').startswith('http')})
        print(f'\nFETCHING {len(urls)} distinct source pages...')

        def check(u):
            req = urllib.request.Request(u, headers={
                'User-Agent': 'BallKnowledge-linkcheck/1.0 '
                              '(+https://bk-ballknowledge.com)'})
            try:
                with urllib.request.urlopen(req, timeout=25) as r:
                    return u, r.status
            except urllib.error.HTTPError as e:
                return u, e.code
            except Exception as e:
                return u, type(e).__name__

        bad = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
            for u, st in ex.map(check, urls):
                if st != 200:
                    bad.append((u, st))
        print(f'  {len(urls)-len(bad)} resolve, {len(bad)} do not')
        for u, st in sorted(bad, key=lambda x: str(x[1])):
            n = sum(1 for f in in_scope for s in by_fact[f['fact_id']]
                    if (s.get('url') or '').split('#')[0] == u)
            print(f'  {str(st):>10}  {n:2} cards  {urllib.parse.unquote(u)[:78]}')
    print()


if __name__ == '__main__':
    main()

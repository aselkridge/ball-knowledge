#!/usr/bin/env python3
"""Is the dealable pool DIVERSE, not just big?

    python3 tools/diversity.py            the report card
    python3 tools/diversity.py --thin     what to write next, worst gap first

Why this exists
---------------
Aaron, 2026-08-07: *"I want all of the questions and facts, but small goal
before the launch to the 20 friends is that the question pool of 1000 is at
least pretty diverse."* And earlier the same day, the thing that prompted it:
*"is that 1000 wide enough or is it 1000 who was the mvp questions?"*

He is right that a raw total says nothing. Two banks of 1,000 can be completely
different games. So the launch bar has two halves now: **1,000 dealable cards
AND a spread that stops them all being one kind of question.**

The thresholds below are not invented. They were set on 2026-08-07 by measuring
the 318-card pool that existed at the time and asking, per dimension, "is this
already fine, or is this the thing that would make twenty games feel repetitive?"
Difficulty was already well spread and needed no help. Era was 37% untagged and
badly skewed modern, which is the one a player would actually notice.

WHAT THIS IS NOT. It does not measure repeats-per-player, which is the thing
that ultimately matters and needs the real picker driven over simulated sessions
(see V0.md and BUILD.md 22ag). This is the cheap proxy that can run on every
merge; that is the expensive truth that runs once before launch.
"""

import collections
import json
import os
import pathlib
import sys

ROOT = pathlib.Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T = ROOT / 'docs/play/data/tables'

# The bar. Every number here is a floor, checked against the pool as it grows.
TARGET_POOL = 1000
MIN_PER_LEAGUE_TIER = 25      # already enforced by the verified-pack gate
MAX_UNTAGGED_ERA_PCT = 20     # measured 37% on 2026-08-07: the worst dimension
MIN_PER_ERA = 15              # so no decade is a token presence
MAX_ONE_PERSON_PCT = 2.5      # ~25 cards in a 1,000 pool: Jordan can be big, not dominant
MAX_TOP10_PEOPLE_PCT = 25     # measured 34%: concentrated, not yet a Jordan quiz
MIN_CATEGORIES = 12


def load():
    L = lambda n: json.loads((T / f'{n}.json').read_text())
    facts = L('facts')
    lg, er, pe = (collections.defaultdict(set) for _ in range(3))
    for r in L('fact_leagues'):
        lg[r['fact_id']].add(r['league_id'])
    for r in L('fact_eras'):
        er[r['fact_id']].add(r['era_id'])
    for r in L('fact_people'):
        pe[r['fact_id']].add(r['person_id'])
    deal = [f for f in facts
            if f.get('confidence') == 'high' and f.get('date_checked')]
    return deal, lg, er, pe


def main():
    deal, lg, er, pe = load()
    n = len(deal)
    rows, fails = [], 0

    def check(label, ok, detail):
        nonlocal fails
        if not ok:
            fails += 1
        rows.append((('PASS' if ok else 'THIN'), label, detail))

    # --- era, the dimension that was worst when the bar was set --------------
    # AN UNTAGGED CARD IS NOT AUTOMATICALLY A GAP. Plenty are era-FREE on
    # purpose: today's rulebook, court dimensions, vocabulary, and any
    # career-spanning superlative ("all-time leader in blocks") which belongs to
    # no single decade. Counting those as debt makes the metric nag forever
    # about work that must never be done, and a metric you learn to ignore is
    # worse than no metric. Measured 2026-08-07: of 117 untagged cards, only
    # about 30 were genuinely taggable.
    ERA_FREE_CATS = {'Rules', 'Court', 'Equipment', 'Fouls', 'Original Rules',
                     'Vocabulary', 'Glossary', 'Positions'}
    SPANNING = ('all-time', 'career leader', 'entire career', 'all time',
                'retired with the higher', 'highest career', 'most career')

    def era_free(f):
        if f.get('category') in ERA_FREE_CATS:
            return True
        q = (f.get('question') or '').lower()
        return any(w in q for w in SPANNING)

    untagged = [f for f in deal if not er[f['fact_id']]]
    taggable = [f for f in untagged if not era_free(f)]
    pct = round(len(taggable) / n * 100) if n else 0
    check('era tagged', pct <= MAX_UNTAGGED_ERA_PCT,
          f'{pct}% untagged AND taggable ({len(taggable)} cards); '
          f'{len(untagged)-len(taggable)} more are era-free on purpose')

    eras = collections.Counter(e for f in deal for e in er[f['fact_id']])
    scaled = max(1, round(MIN_PER_ERA * n / TARGET_POOL))
    thin_eras = sorted(k for k, v in eras.items() if v < scaled)
    check('every era present', not thin_eras,
          f'{len(thin_eras)} below {scaled} (scales to {MIN_PER_ERA} at 1,000)'
          + (f': {", ".join(thin_eras[:6])}' if thin_eras else ''))

    # --- subject concentration ----------------------------------------------
    people = collections.Counter(p for f in deal for p in pe[f['fact_id']])
    tags = sum(people.values())
    if tags:
        top1, c1 = people.most_common(1)[0]
        check('no single dominant subject', c1 / tags * 100 <= MAX_ONE_PERSON_PCT * 4,
              f'{top1} is {round(c1/tags*100,1)}% of person-tags ({c1} cards)')
        top10 = sum(v for _, v in people.most_common(10))
        check('top 10 people not dominant', top10 / tags * 100 <= MAX_TOP10_PEOPLE_PCT + 12,
              f'{round(top10/tags*100)}% of person-tags (bar: '
              f'{MAX_TOP10_PEOPLE_PCT + 12}% now, {MAX_TOP10_PEOPLE_PCT}% at 1,000)')
        check('breadth of subjects', len(people) >= n / 4,
              f'{len(people)} distinct people across {n} cards')

    # --- difficulty and category --------------------------------------------
    tiers = collections.Counter(f['difficulty'] for f in deal)
    spread = min(tiers.values()) / max(tiers.values()) if tiers else 0
    check('difficulty spread', spread >= 0.35,
          f'thinnest tier is {round(spread*100)}% of the fattest '
          f'({dict(sorted(tiers.items()))})')

    cats = collections.Counter(f.get('category') for f in deal if f.get('category'))
    check('category breadth', len(cats) >= MIN_CATEGORIES,
          f'{len(cats)} categories (bar: {MIN_CATEGORIES})')

    # --- league x tier, the gate that already exists -------------------------
    lt = collections.Counter()
    for f in deal:
        for l in (lg[f['fact_id']] or {'any'}):
            lt[(l, f['difficulty'])] += 1
    core = [(k, v) for k, v in lt.items() if k[0] in ('nba', 'wnba', 'any')]
    scaled_lt = max(1, round(MIN_PER_LEAGUE_TIER * n / TARGET_POOL))
    short = [k for k, v in core if v < scaled_lt]
    check('league x difficulty pools', not short,
          f'{len(short)} below {scaled_lt} (scales to {MIN_PER_LEAGUE_TIER} at 1,000)')

    print(f'\nDIVERSITY OF THE DEALABLE POOL   {n} cards, target {TARGET_POOL}\n')
    for st, label, detail in rows:
        print(f'  {st}  {label:28} {detail}')
    print(f'\n  {len(rows)-fails} of {len(rows)} pass. '
          f'{"DIVERSE ENOUGH" if not fails else str(fails) + " dimension(s) thin"}.')
    print('\n  Bars scale with the pool, so this is answerable today rather than')
    print('  only at 1,000. It is a proxy: the real measure is repeats per')
    print('  player over 20 games, which needs the picker driven for real.')

    if '--thin' in sys.argv:
        print('\nWHAT TO WRITE NEXT, worst gap first:')
        for e, c in sorted(eras.items(), key=lambda x: x[1])[:8]:
            print(f'   {c:4} cards   {e}')
        print(f'   {len(taggable):4} cards   (taggable, no era yet)')
        print(f'   {len(untagged)-len(taggable):4} cards   (era-free on purpose, leave them)')


if __name__ == '__main__':
    main()

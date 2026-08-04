#!/usr/bin/env python3
"""THE VERIFIED-PACK GATE, data half (V0 build item, built 2026-08-02).

Emits docs/play/unverified-index.js — the set of cards the gate excludes
when it is switched on. INVERTED on purpose: we ship the list of cards that
are NOT yet trustworthy, so the file shrinks toward empty as R1/R6 data work
completes, and a missing file gates nothing.

What makes a card unverified (from the todo table, the same rows The Tape
shows):
  R1  card-source-dead — the card's src does not resolve to a fact row, so
      it cannot inherit verification ("blocks: proving any answer is right").
  R6  volatile-refresh-due — the card's fact is time-sensitive and overdue,
      so its "current" answer may be quietly wrong.
  R5 (missing era/player tags) is metadata, not trust — it never gates.

Rerun after ANY merge that touches questions.js or the todo table, exactly
like build-volatile-index.py. The game reads the file at load; the switch
itself (PACKGATE.verifiedOnly) lives in game.js and ships OFF until the pool is
healthy — flipping it today would cut the bank roughly in half, measured
below every time this runs.
"""
import re, json, os, datetime
import collections
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
qs = open(os.path.join(ROOT, 'docs/play/questions.js')).read()
todo = json.load(open(os.path.join(ROOT, 'docs/play/data/tables/todo.json')))

# every card: (q text, src, tier, league) — same regex family as the volatile index
cards = []
for c in re.findall(r'\{[^{}]*?\bt\s*:\s*\d.*?\}', qs, re.S):
    q = re.search(r'\bq\s*:\s*"((?:[^"\\]|\\.)*)"', c)
    s = re.search(r'\bsrc\s*:\s*"([^"]+)"', c)
    t = re.search(r'\bt\s*:\s*(\d)', c)
    l = re.search(r'\bl\s*:\s*"(\w+)"', c)
    if q and s:
        cards.append({'q': q.group(1), 'src': s.group(1),
                      't': int(t.group(1)), 'l': l.group(1) if l else 'any'})

# ALL the runs against a source, not the first one seen. setdefault kept only
# whichever row happened to come first in the file, and 398 sources carry more
# than one run — so the reason a card was blocked was effectively arbitrary.
bad_srcs = collections.defaultdict(set)
for row in todo:
    if row['target_table'] == 'questions' and row['run'] in ('R1', 'R6'):
        bad_srcs[row['target_id']].add(row['run'])

# ---- THE AIRTIGHT RULE (DESIGN.md 10a, locked by Aaron 2026-08-03) ---------
# A card ships only when BOTH are true, and neither implies the other:
#   1. its fact's source is good enough        -> facts.confidence == 'high'
#   2. somebody READ that source and confirmed -> facts.date_checked is set
#
# Until 08-03 this gate checked neither directly — only R1/R6 debt, which is a
# proxy for (1) and says nothing at all about (2). Measured the day the rule
# landed: 216 of 1,526 cards pass (1) and ZERO pass (2). date_checked was empty
# on every fact in the game.
#
# Why (2) cannot be dropped: tiering says a SITE is trustworthy, never that this
# card's answer matches that page. Two right-quality wrong-page errors are
# already known — the Red Auerbach card citing a Phil Jackson biography, and
# big3.com/leadership/ cited for what format Big3 is played in. A perfect tier
# score cannot catch either.
facts = json.load(open(os.path.join(ROOT, 'docs/play/data/tables/facts.json')))
BYQ = {f['question']: f for f in facts}

def airtight(c):
    f = BYQ.get(c['q'])
    if not f:
        return False, 'no fact row'
    if f.get('confidence') != 'high':
        return False, 'source not good enough'
    if not f.get('date_checked'):
        return False, 'answer never checked against its source'
    return True, None

unver, why = [], Counter()
for c in cards:
    ok, reason = airtight(c)
    if not ok:
        unver.append(c)
        why[reason] += 1
    elif 'R1' in bad_srcs.get(c['src'], ()):
        # R1 still gates: a card whose source does not resolve to a fact has
        # nothing to inherit verification FROM.
        unver.append(c)
        why['R1 · source does not resolve to a fact'] += 1
    elif BYQ.get(c['q'], {}).get('goes_stale'):
        # STALENESS IS A PROPERTY OF THE FACT, NOT OF THE PAGE.
        # This used to gate on R6, which flags a SOURCE URL as volatile — so one
        # stale-able card poisoned every other card citing the same page.
        # Measured 2026-08-04 on the first verified batch: 24 facts proved,
        # 23 blocked, and only ONE of the 24 can actually go stale (which team
        # Stephen Curry currently plays for). "Who won Finals MVP in 2015?"
        # cannot change, and was being held back because it happens to cite a
        # page that also answers a question about a current roster.
        # facts.goes_stale already exists and is set on 119 facts — the accurate
        # signal was in the data the whole time, and the gate used a proxy.
        unver.append(c)
        why['can go stale — needs a refresh pass'] += 1
by_run = why

out = ['/* UNVERIFIED CARDS — built by tools/build-verified-index.py, ' +
       datetime.date.today().isoformat(),
       '   ' + str(len(unver)) + ' of ' + str(len(cards)) +
       ' cards cannot yet inherit verification (R1 src-dead: ' +
       str(by_run.get("R1", 0)) + ', R6 volatile-overdue: ' +
       str(by_run.get("R6", 0)) + ').',
       '   The gate (PACKGATE.verifiedOnly in game.js) excludes these when ON.',
       '   This file SHRINKS as R1/R6 complete; empty = every card verified. */',
       'var BK_UNVERIFIED={']
out += ['"' + c['q'].replace('\\', '\\\\').replace('"', '\\"') + '":1,' for c in unver]
out += ['};']
dst = os.path.join(ROOT, 'docs/play/unverified-index.js')
open(dst, 'w').write('\n'.join(out) + '\n')

# THE GATE REPORT — measured pool health if the gate flipped on today
print('unverified: %d of %d cards -> %s' % (len(unver), len(cards), dst))
print('  by cause: %s' % dict(by_run))
print('\n  SURVIVING POOL IF THE GATE FLIPPED TODAY (league x tier):')
surv = [c for c in cards if airtight(c)[0] and c['src'] not in bad_srcs]
leagues = sorted(set(c['l'] for c in cards))
hdr = '  %-8s' + '%7s' * 5 + '%8s'
print(hdr % tuple(['league'] + ['t' + str(t) for t in range(5)] + ['total']))
thin = []
for lg in leagues:
    row = [sum(1 for c in surv if c['l'] == lg and c['t'] == t) for t in range(5)]
    print(hdr % tuple([lg] + row + [sum(row)]))
    for t in range(5):
        pool = sum(1 for c in surv if c['l'] in (lg, 'any') and c['t'] == t)
        if pool < 25 and sum(1 for c in cards if c['l'] in (lg, 'any') and c['t'] == t) >= 25:
            thin.append('%s t%d: %d playable (was %d)' %
                        (lg, t, pool,
                         sum(1 for c in cards if c['l'] in (lg, 'any') and c['t'] == t)))
print()
if thin:
    print('  THIN POOLS the flip would create (<25 playable incl. "any"):')
    for w in thin: print('    ' + w)
else:
    print('  no pool drops below 25 playable cards — flip is survivable')

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
  R6  volatile-refresh-due — the card's fact is time-sensitive AND its last
      read has expired (see STALE_WINDOW_DAYS), so its "current" answer may be
      quietly wrong. Note the AND: from 08-04 to 08-06 this excluded every
      time-sensitive fact permanently, whether or not anyone had just read it.
      A stale-able fact inside the window ships; audit.stale_overdue counts
      the ones that have fallen out, so the re-reading debt is visible.
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

# HOW LONG A STALE-ABLE FACT STAYS TRUSTED AFTER SOMEBODY READS ITS SOURCE.
# 180 days, i.e. re-read roughly twice a year. Chosen against the thing that
# actually moves: a season's scoring or wins leader can change inside one
# season, so a full year is too slack, and a card would spend months quietly
# claiming a record somebody else now holds. Anything shorter turns 160 cards
# into a monthly chore nobody will do, and a chore nobody does is the same as
# no rule. One constant, one place — change it here.
# It is deliberately NOT the same idea as rewording a card to be time-anchored
# ("Through the 2025 season, ..."). That fix is better where it fits, because
# an anchored fact never needs re-reading at all. This window is what carries
# the ones that cannot be anchored without ruining the question.
STALE_WINDOW_DAYS = 180

# AND A LONGER ONE FOR CARDS THAT HAVE BEEN TIME-ANCHORED.
# Aaron, 2026-08-06, asking the question this whole design turns on: *"if
# someone down the line destroys that record, then why would we still ask it
# that way? How will the volatility work way downstream?"*
#
# The answer is that anchoring changes what a refresh is FOR. It does not
# remove the need for one.
#
#   an UNANCHORED stale card is re-read to ask "is this still TRUE?"
#       — a correctness check. If it lapses, the game lies to a player.
#   an ANCHORED card is re-read to ask "is this still worth ASKING?"
#       — an editorial check. "Through the 2025 season, A'ja Wilson had won
#         four MVPs" stays true forever even after somebody wins five. It just
#         stops being interesting, and eventually reads like an old newspaper.
#
# Musty is a much less urgent failure than wrong, so anchored cards get a
# longer leash — 550 days, which guarantees the review lands AFTER a full
# season has finished, because a season ending is when records actually move.
#
# The payoff Aaron was reaching for: an anchored card is UPGRADEABLE where a
# live one is simply wrong. When the record falls, the reviewer has three
# moves, and only a human should pick between them:
#   1. still current      -> bump date_checked, done
#   2. record moved, card still good -> roll the anchor forward and update the
#      answer, or deliberately keep it as history
#   3. record moved, card no longer worth asking -> retire it
#      (quarantine-never-delete, per DEEPRESEARCH_KNOWLEDGE.md)
ANCHORED_WINDOW_DAYS = 550


def stale_overdue(f):
    """True when a stale-able fact's last read is missing or too old.

    A fact with no goes_stale flag is never overdue — it cannot rot."""
    if not f or not f.get('goes_stale'):
        return False
    d = f.get('date_checked')
    if not d:
        return True
    try:
        age = (datetime.date.today() - datetime.date.fromisoformat(str(d)[:10])).days
    except ValueError:
        return True          # unparseable date is not a proof of freshness
    return age > (ANCHORED_WINDOW_DAYS if f.get('anchor') else STALE_WINDOW_DAYS)


qs = open(os.path.join(ROOT, 'docs/play/questions.js')).read()
todo = json.load(open(os.path.join(ROOT, 'docs/play/data/tables/todo.json')))

# every card: (q text, src, tier, league) — same regex family as the volatile index
cards = []
for c in re.findall(r'\{[^{}]*?\bt\s*:\s*\d.*?\}', qs, re.S):
    q = re.search(r'\bq\s*:\s*"((?:[^"\\]|\\.)*)"', c)
    s = re.search(r'\bsrc\s*:\s*"([^"]+)"', c)
    t = re.search(r'\bt\s*:\s*(\d)', c)
    l = re.search(r'\bl\s*:\s*"(\w+)"', c)
    fid = re.search(r'\bf\s*:\s*"([^"]+)"', c)
    if q and s:
        # DECODE the JS string literal, do not carry its escapes around.
        # The regex captures SOURCE text, so a question containing a quote comes
        # back as  Why is it called \"the key\"?  — and the writer below then
        # escaped the backslash again, producing a key of \\" that matches no
        # card. Result: every unverified question containing a quotation mark
        # SILENTLY PASSED THE GATE. 17 of them, measured 2026-08-04, and a gate
        # that fails open is worse than no gate at all.
        try:
            qtext = json.loads('"' + q.group(1) + '"')
        except Exception:
            qtext = q.group(1)
        cards.append({'q': qtext, 'src': s.group(1),
                      'f': fid.group(1) if fid else None,
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
BYID = {f['fact_id']: f for f in facts}

def fact_for(c):
    """Join on the FACT ID now that cards carry one (R1, closed 2026-08-04).
    Matching on question TEXT was the only option before and it is fragile —
    edit a question's wording and the card silently loses its proof. Text
    matching stays as a fallback only until every card is re-emitted."""
    return BYID.get(c.get('f')) or BYQ.get(c['q'])

def airtight(c):
    f = fact_for(c)
    if not f:
        return False, 'no fact row'
    if f.get('confidence') != 'high':
        return False, 'source not good enough'
    if not f.get('date_checked'):
        return False, 'answer never checked against its source'
    return True, None

# ONE definition of "will this card ship", used by the count AND by the pool
# table below. They used to be computed separately — the count on the current
# rule, the table on the old source-based proxy — so they disagreed by a card
# and both were printed as fact in the same report. Two ways to compute one
# concept is the bug this project keeps meeting; here it is again, in the tool
# built to measure it.
ships = {}
unver, why = [], Counter()
for c in cards:
    ok, reason = airtight(c)
    if not ok:
        unver.append(c); ships[id(c)] = False
        why[reason] += 1
    elif 'R1' in bad_srcs.get(c['src'], ()):
        # R1 still gates: a card whose source does not resolve to a fact has
        # nothing to inherit verification FROM.
        unver.append(c); ships[id(c)] = False
        why['R1 · source does not resolve to a fact'] += 1
    elif stale_overdue(fact_for(c)):
        # STALENESS IS A PROPERTY OF THE FACT, NOT OF THE PAGE.
        # This used to gate on R6, which flags a SOURCE URL as volatile — so one
        # stale-able card poisoned every other card citing the same page.
        # Measured 2026-08-04 on the first verified batch: 24 facts proved,
        # 23 blocked, and only ONE of the 24 can actually go stale (which team
        # Stephen Curry currently plays for). "Who won Finals MVP in 2015?"
        # cannot change, and was being held back because it happens to cite a
        # page that also answers a question about a current roster.
        # facts.goes_stale is the accurate signal, and the gate used a proxy.
        #
        # AND THEN THIS LINE MADE THE OPPOSITE MISTAKE, 2026-08-04 to 08-06.
        # It read `if goes_stale` and binned the card outright, never once
        # looking at date_checked — while printing "needs a refresh pass" to
        # whoever ran it. A refresh could not clear it. Nothing could. Found by
        # re-reading Popovich against Basketball-Reference, watching it reach
        # high confidence, and watching the pool not move: six cards in, five
        # out. 160 facts carry the flag; 22 were proven, fresh, and binned.
        # Aaron, 2026-08-06: *"The stale tag can remain but there are other
        # ways of dealing with it other than trashing good facts."*
        # So the flag now means WHAT IT SAYS: this fact needs re-reading on a
        # cycle. Inside the window it ships. Outside it, it is held — and
        # audit.py counts the overdue ones so the debt is visible before a
        # player ever sees it. Held, never wrong: that is the safe direction.
        unver.append(c); ships[id(c)] = False
        why['stale check overdue — re-read the source'] += 1
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
surv = [c for c in cards if ships.get(id(c), True)]
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

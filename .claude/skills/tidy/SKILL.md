---
name: tidy
description: Doc-hygiene review for the Ball Knowledge repo. Run monthly-ish or after a heavy stretch of work. Finds stale numbers, contradictions between docs, orphan to-do lists, and unfiled learnings — and fixes them per the sources-of-truth map in CLAUDE.md.
---

# Tidy — keep one home per thing true

The map lives in `CLAUDE.md` (Sources of truth). The two standing rules:
learnings OVERWRITE their section in their home file; the commit that makes a
doc stale fixes the doc.

## Sweep
1. **Stale numbers:** grep the docs for coverage counts (players, cards, ppg,
   corpus sizes) and recompute each from the files. Fix in place, or replace
   with a pointer to `tools/audit.py` output.
2. **Orphan to-do lists:** the only queues are `BUILD.md` §4 (build) and
   `RESEARCH-BACKLOG.md` (research/data). Anything list-shaped elsewhere gets
   merged into one of those and replaced with a pointer.
3. **Contradictions:** where two docs disagree, the home file wins; fix the
   other. If a genuine open question emerges, it goes to BUILD.md §6.
4. **Unfiled learnings:** scan recent commits/chat for rulings not yet in the
   LEARNINGS LOG; file them (overwrite, don't append duplicates).
5. **Superseded docs:** move to `design/archive/` (or delete if truly dead) —
   never leave two versions live. NEVER move anything under `docs/` (the live
   site) without an explicit decision.
6. Report: what was fixed, what was archived, what needs Aaron.

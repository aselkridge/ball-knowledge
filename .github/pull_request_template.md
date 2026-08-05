<!-- Ball Knowledge — the ONE pull request format.

     Same idea as .claude/skills/status-board/: one shape, every time, so the
     reader never has to hunt for the part they care about. Delete any section
     that is genuinely empty — but say "none" rather than deleting a section a
     reader would EXPECT to be filled. A missing section reads as an oversight;
     "none" reads as a decision.

     PR #1 is the worked example. This template was written out of it. -->

## What this changes

<!-- One paragraph, in plain words, for someone who has not read the commits.
     Then one bullet per real change. Group by area if there are many. -->

-
-

## The numbers

<!-- CLAUDE.md: MEASURE BEFORE YOU ASSERT. Every count here comes from running
     the thing, not from memory. If a number moved, show both ends: 45 -> 47.
     If a number got WORSE, it goes here too, with the reason. -->

| | before | after |
|---|---|---|
| | | |

## Before / after

<!-- STANDING RULE (CLAUDE.md): any change to how something LOOKS or READS
     ships a side-by-side comparison — real screenshots of the real thing,
     desktop AND 390px, light AND dark. Link the Artifact here.

     No visual change in this PR? Write "no visual change" and move on. -->

## How it is verified

<!-- Harness names and check counts, from an actual run. Then: what was broken
     ON PURPOSE to prove the check bites. A green tick over a check that cannot
     fail has happened here more than once. -->

- harnesses:
- broken on purpose:
- `python3 tools/audit.py`:

## Docs updated

<!-- The commit that makes a doc stale fixes the doc. Which homes changed?
     V0 · DESIGN · BUILD · TABLES · RESEARCH-BACKLOG · AI-LEARNINGS · MAKING -->

-

## Filed, not built

<!-- EVERY BUG GETS A VERDICT: FIXED, FILED (with the item id) or RULED.
     Anything found on this branch and deliberately left alone belongs here,
     with the id of the item that now owns it. `python3 tools/open-items.py`.

     Something a reader would expect to see changed and does not? Say so here.
     Silence reads as an oversight. -->

-

## Known limits

<!-- The things that are true and unflattering. Ships-dark switches, security
     that is not security, cards knowingly unverified, numbers that went the
     wrong way. If this section is empty, it is usually because it has not been
     thought about yet. -->

-

## Aaron decides

<!-- Anything in here that is a taste call, not an engineering call — the
     questions that should not be answered by whoever wrote the code.
     "none" is a fine answer. -->

-

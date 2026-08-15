---
name: design-research-brief
description: Write the paste-ready /deep-research block for a COMPARATIVE DESIGN run (22af run one, run two, and any future "how did other games solve this" run), then run the intake pass on what comes back. Use when the run studies other GAMES, not when it gathers FACTS about basketball — facts go to research-brief.
---

# Design-research-brief — study other people's solutions, kill the reading list

## Which skill, and do not get this wrong
| The run gathers | Skill | Output |
|---|---|---|
| Facts about basketball (players, records, history) | `research-brief` | `research-*.json` → `verify-facts` → the bank |
| How OTHER GAMES solved a design problem | **this one** | `design/<run>-findings.md` → rows in idea bank 22ac |

A design run merges nothing into `questions.js` or `players.json`. The
find→prove→merge gate, `sourceTier`, `confidence`, slug ids and `audit.py` do
NOT apply. Applying them anyway produces a brief that asks for the wrong shape
of answer. What carries over from the fact standard is one thing only: **every
claim needs a clickable URL.**

Discovery stays Aaron's half (`DEEPRESEARCH_KNOWLEDGE.md` LEARNINGS #1). This
skill writes the brief; it does not do the sweep. That split was measured on a
fact run, so it is weaker evidence here — if Claude also runs a supplementary
sweep, it is ADDITIVE and must be labelled as such, never merged silently into
Aaron's return.

## Part 1 — writing the brief
1. Pull the locked question list from its home in `BUILD.md`. If two versions
   of the run exist, the locked one wins and the superseded one gets merged
   away in the same commit — do not write a brief from an unlocked draft.
2. **Every question must name the decision it changes.** A question with no
   decision attached is cut, not demoted. If Aaron kept a question because the
   answer "might move it up the board", the brief must ask for the answer in a
   form that supports that call — i.e. demand a recommendation, not a summary.
3. Write the block to `design/<run>-brief.md` and hand Aaron the same text
   inline to paste. Both, always — chat text does not survive a compaction.
4. The block must carry, verbatim in spirit:
   - **per finding: the GAME, the PROBLEM it solved, the VERDICT for us —
     adopt / adapt / reject — and a reason**
   - **a clickable URL per claim**; player-facing claims (what people complain
     about, what they want) cite the actual thread/review, not a summary of it
   - the kill rule, stated inside the prompt so the returning research applies
     it to itself: *if a finding cannot be tied to a decision on our board, it
     does not go in the doc*
   - our constraints, so the answers are usable: what the game IS, what V0
     scope is, and the specific broken numbers being designed against
   - **the PHYSICAL GAME CONTEXT, not just the turn economy.** Aaron, 08-12,
     after the D37 run: *"maybe context is missing, for example what is even
     the shape and movement of this board and what is the scoring method?
     ... remember my game is more side based like a sport rather than a
     board game."* The D37 brief described taps and beats and got skirmish
     games back as precedents; a brief that had said "one fixed basket both
     teams converge on, a 15x8 grid where the TILE you shoot from sets the
     points and the question difficulty, possessions with inbounds and
     live-ball turnovers" would have weighted the sport-shaped answers
     (play-calling, schemes) over the board-game-shaped ones from the start.
     Standing block to include from now on: board dimensions and movement
     ranges · the scoring method and what the court position means · the
     possession flow (inbound, reset, live-ball continuation) · the sentence
     "this is a SPORT with sides and a fixed goal, not a symmetric
     skirmish."
   - **negative results are findings.** "Almost nobody has done this" is the
     single most valuable answer a moat question can return; the brief must say
     so or the sweep will pad instead.
5. Note expected size and how to split if `/deep-research` caps out — split by
   question, never by cutting the constraints preamble.

## Part 1b — DID THE RUN DO ITS JOB? (decide this BEFORE reading for content)
`/deep-research` decomposes whatever it is given into **five search angles**,
regardless of how many questions the brief contains. Eleven questions therefore
share five angles — roughly two questions per angle — and the ones that lose are
invisible unless you look for them. Score coverage FIRST, before the findings
seduce you into thinking the run was thorough.

Per question, it PASSES only if all of these hold:
1. At least one finding that names a GAME, the PROBLEM, and a VERDICT.
2. At least two DISTINCT sources. One source is an anecdote.
3. For a question that demanded a RECOMMENDATION, an actual recommendation —
   a comparison of options is a fail, however good the comparison.
4. For a MOAT / "has anyone done this" question, **the scope of the search is
   stated**. A negative result without stated scope is unusable: "nobody does
   this" and "we didn't look" are the same sentence otherwise.
5. For a DEMAND question (what players complain about), links to actual threads
   or reviews. Paraphrased trends are a fail.

**The decision rule, fixed in advance:**
- 0–2 questions fail → accept the run, note the thin ones, move on.
- 3–5 fail → re-run the failures only, in a group of their own.
- 6+ fail → the run did not do its job. Split the brief and re-run all of it.

**How to split, and why not into halves.** Splitting 11 questions into two runs
of 5–6 still leaves every angle carrying roughly one question. Groups of **3–4**
give each question its own angle with room to spare, which is where the return
actually improves. And a moat question is worth **a run of its own**: one
question against five angles is exactly the shape that makes a negative result
credible, and credibility is the entire value of a negative result.

## Part 2 — the intake pass (the half that actually needs a procedure)
Run this on the return BEFORE anything is quoted or acted on. This is where a
design run rots into a reading list, because "interesting, keep it" is the path
of least resistance.

1. **Kill pass first.** Every finding with no named decision on the V0 board is
   deleted. Not moved to an appendix — deleted. Report the kill rate; a run
   that kills nothing was not filtered.
2. **Citation pass.** Any finding whose URL is missing, dead, or points at a
   summary of the real source is quarantined, not deleted (three outcomes, per
   `DEEPRESEARCH_KNOWLEDGE.md` LEARNINGS #3).
3. **Verdict pass.** Every survivor carries adopt / adapt / reject with a
   reason. "Interesting" is not a verdict. A finding that survives with no
   verdict is Claude's job to supply, flagged as Claude's opinion.
4. **Contradiction pass.** Where the research contradicts a LOCKED decision in
   `DESIGN.md`, say so out loud and put the conflict in front of Aaron. Do not
   quietly adopt, and do not quietly drop it either.
5. **File it.** Findings doc at `design/<run>-findings.md`; every adopt/adapt
   gets a row in idea bank 22ac in `BUILD.md` WITH ITS CITATION, so in six
   weeks the provenance is a link and not a memory.
6. **Say what you did not do.** Questions the return answered thinly get named
   as thin. Silence reads as coverage.

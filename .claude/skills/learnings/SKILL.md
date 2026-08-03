---
name: learnings
description: Capture what a stretch of work taught you into AI-LEARNINGS.md and MAKING.md. Run at the end of any work block, before a compact, when a mistake is understood, or whenever Aaron asks whether learnings are being tracked. Runs tools/learnings-check.py first so the answer is counted, not remembered.
---

# Learnings — write it down while it still stings

Aaron, 2026-08-03: *"are you tracking all of the learnings and all of the
information about the steps and things you learn trying to build your own
database? I thought we spoke about these sorts of things going in AI Learnings
and making.md and I thought there were skills that did this regularly."*

There were none. Checked at the time: **nine commits that day, zero touching
either file** — including the commits that produced the two most useful lessons
the project had turned up. He caught it. No mechanism did.

CLAUDE.md already says why:

> *"instructions alone did NOT prevent the repeat... the durable fix is turning a
> claim into a command — because scripts run and reminders don't."*

The rule meant to capture learnings was itself a reminder. This skill plus
`tools/learnings-check.py` is the command version.

## Step 1 — count, do not recall

```
python3 tools/learnings-check.py            # since the last learnings commit
python3 tools/learnings-check.py --since 20
```

It lists the code and data commits and whether either file was touched. **Never
open this skill and answer from memory.** The whole reason it exists is that
memory said "yes, probably" while the answer was zero.

## Step 2 — read the actual work, not the commit subjects

Subjects are what you MEANT to do. Learnings live in what went wrong on the way.
For each work commit, look at the diff and the message body. You are hunting for:

- a mistake you made and understood — the single richest source
- a thing that took far longer than it should have, and why
- an assumption that turned out to be wrong when measured
- a surprise: a number, a behaviour, a shape of the data
- a moment Aaron corrected you, especially where he was right about something
  you had already argued against
- a rule or check you had to invent because a reminder had failed

If none of that happened, say so and stop. **Nothing to write is a legitimate
answer. Deciding that without looking is not.**

## Step 3 — sort each one into the right file. They are not the same.

| | `AI-LEARNINGS.md` | `MAKING.md` |
|---|---|---|
| whose | Aaron's, portable, outlives this project | the build diary, possibly a book |
| about | working with an AI system, in general | this project, specifically |
| shape | a named failure mode + the fix that binds | a story: what happened, what it cost |
| test | would this help someone on a different project? | would a reader find this interesting? |

A lesson can go in both, told differently. `AI-LEARNINGS` gets the mechanism;
`MAKING` gets the scene.

**Neither file is a changelog.** "Built the tier system" belongs in BUILD.md. Only
write here if something was LEARNED.

## Step 4 — write it properly

**AI-LEARNINGS.md**
- Add to or OVERWRITE the relevant numbered section. Never start a parallel one —
  a new section for every incident turns the file into a diary and kills it.
- Name the failure mode as a heading you could repeat back. Not "be careful with
  rebuilds" but "It edits the file it can see, not the file that governs."
- Include the concrete detail. A number, a filename, the exact wrong output. A
  lesson with no evidence reads as advice and gets skipped.
- End with the CHECK, not the intention. "Ask X before Y" beats "remember to Y."

**MAKING.md**
- Add a dated `###` entry before `## What surprised us`.
- Write the scene. What you thought, what actually happened, what it cost.
- **Do not sanitise. The errors ARE the content.** A tidy account of a build is
  worthless and Aaron has said so explicitly.
- Quote Aaron directly where he said the thing that landed. His words are better
  than your summary of them, every time.

## Step 5 — commit in the same turn

Learnings written and not committed are learnings lost to the next compaction.
The commit body should say what was learned, not just that a file changed.

## Do not

- Do not write a learning you cannot point at evidence for.
- Do not soften a mistake into a "challenge" or an "opportunity".
- Do not log the same lesson twice under a new heading — find the existing
  section and sharpen it.
- Do not let this become a ritual that always finds three learnings. Some
  stretches teach nothing, and a file padded with filler is a file nobody reads.

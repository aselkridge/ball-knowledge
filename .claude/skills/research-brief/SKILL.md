---
name: research-brief
description: Generate the paste-ready /deep-research block for a named run from RESEARCH-BACKLOG.md (H2, H3, H4, Q5, Q8...). Bakes the source standard into the prompt so returns come back verifiable. Use whenever Aaron is about to run /deep-research.
---

# Research-brief — write the FIND prompt, standards included

Discovery is **Aaron's** half of the pipeline (`/deep-research` sweeps wider
than Claude — see LEARNINGS LOG #1). This skill writes the brief; it never does
the discovery itself.

## Procedure
1. Pull the run's scope from `RESEARCH-BACKLOG.md` and any rulings that bind it
   (e.g. H3: Black Fives Era naming, no baseball vocabulary, Original Celtics
   were a white team, Globetrotters split at 1950).
2. Build the block on the template in `DEEPRESEARCH_KNOWLEDGE.md` (the quoted
   paste block). Non-negotiables it must carry, verbatim in spirit:
   - every fact: **clickable URL** + `sourceTier` + `confidence` (+ `volatile`)
   - statistics from Tier-1 sources only
   - superlatives require the prior-claimant search, scoped honestly
   - **enumerate before narrating**: start from membership rolls / champion
     lists / award registers, never link-following
   - unique slug `id` per fact (the dedupe key); JSON exactly per schema
3. For a Q8 run, inline the quarantine file contents as the found-list.
4. Deliver the block ready to paste, with a one-line note on expected size and
   how to split it if /deep-research caps out.
5. Remind: the return is UNPROVEN until `verify-facts` passes it — file it as
   `research-*.json`, never straight into the bank.

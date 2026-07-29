---
name: mine-questions
description: Write new Ball Knowledge questions from an EXISTING corpus (a question run — needs no new research). Use for new packs, filling thin league/tier pools, or squeezing a corpus claim-level. Enforces every bank-writing rule and reports kill rate.
---

# Mine-questions — question runs from facts already on file

Read `DEEPRESEARCH_KNOWLEDGE.md`: **THE FIVE KINDS OF RUN** (this is type 4),
**VOLATILE FACTS**, and the claim-level exhaustion rule.

## Procedure
1. Mine **claim-level**: one fact often holds 3–5 questions (who won · what
   year · who they beat · which league). A fact is spent only when every fair
   claim is used. Track the corpus fact `srcId` on every card.
2. Bank-writing rules (all enforced, no exceptions):
   - correct answer is `c[0]`; exactly 4 choices; distractors plausible
   - one sentence; the stem never reveals the answer
   - no duplicate of any live card (check by subject + claim, not string match)
   - **never a volatile t:1**; prefer timeless phrasing; date-anchor if current
   - gender-neutral language (the sweep rule from BUILD.md entry 20)
   - league tag honest (the league-leak rules); era tag per the era standard
3. Kill what can't be fair (no plausible distractors / answer in stem /
   unknowable) and **report the kill rate** — under ~10% healthy; 40–50% means
   this corpus is dry *for questions* and a fact run is genuinely needed.
4. Only verified facts may be mined. If the source fact has no URL, send the
   slice through `verify-facts` first.
5. Finish: regenerate the volatile index
   (`python3 tools/build-volatile-index.py`), then `python3 tools/audit.py`.

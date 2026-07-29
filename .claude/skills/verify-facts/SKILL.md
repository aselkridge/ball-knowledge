---
name: verify-facts
description: The PROVE pass for Ball Knowledge data. Run on any slice of facts, questions, or player records that needs sourcing — V-items in RESEARCH-BACKLOG.md, a fresh /deep-research return before merge, or a re-check. Applies the source standard adversarially with three outcomes (verify / fix / quarantine).
---

# Verify-facts — the PROVE pass

Read `DEEPRESEARCH_KNOWLEDGE.md` first: **WHAT COUNTS AS A SOURCE**, **THE
PIPELINE**, and the **LEARNINGS LOG**. This skill is the PROVE step; it never
gathers new facts (that is discovery — Aaron's `/deep-research`).

## Procedure
1. Take the slice (a backlog V-item, a file, or an explicit list). Work in
   batches small enough to verify honestly — never skim.
2. For each claim, attempt to **refute** it, not confirm it. Check against the
   tier standard: 1× Tier-1, or 2× *independent* Tier-2. Statistics: Tier-1
   only. Superlatives ("first/most/only/record"): run the prior-claimant search
   and scope the claim ("major-college record", date-anchored) if it fails.
3. **Three outcomes — never two:**
   - **Verified** → attach clickable URL(s) + `dateChecked: YYYY-MM-DD`.
   - **Wrong detail** → fix it in place, cite the correcting source.
   - **Unverifiable in a bounded lookup** → move to
     `docs/play/data/quarantine-questions.json` / `quarantine-players.json`.
     NEVER delete: obscure is not false, and quarantine feeds the next
     `/deep-research` run (backlog Q8). For players, quarantine only the stat
     block — the player stays playable on accolades.
4. Where no Tier-1 exists (Black Fives Era, pre-1978 women's game), cite the
   best available and set `confidence` honestly. Do not fake certainty; do not
   drop hard history.
5. Finish: run `python3 tools/audit.py` — if metrics improved, run with
   `--update-baseline` to ratchet. Report counts per outcome and the kill rate.

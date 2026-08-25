---
paths:
  - "docs/play/data/**"
  - "docs/play/questions.js"
  - "docs/play/players.js*"
  - "TABLES.md"
  - "RESEARCH-BACKLOG.md"
  - "DEEPRESEARCH_KNOWLEDGE.md"
  - "tools/audit.py"
  - "tools/tables-*.py"
---

# The data laws (load when data files are touched)

- Mine every open page dry (Aaron: "save it, use it, save it for later,
  mine it DRYYYY"). The denominator is the database, never the current task.
- Save all of it to docs/play/data/research-*.json. Quarantine, never delete.
- Before fetching new data: `python3 tools/unmined.py` (its numbers are
  direction, not precision; `--pages` finds one-citation sources worth more).
- Any "not worth it" judgment about data is written down WITH arithmetic.
- Nothing merges into questions.js/players.json outside the find → prove →
  merge pipeline (source tiers, three outcomes, dateChecked).
- After any data change: `python3 tools/audit.py` must pass the ratchet.
  After merges touching v:1 cards: regenerate volatile-questions.json via
  `tools/build-volatile-index.py`.

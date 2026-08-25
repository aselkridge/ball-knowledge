---
paths:
  - "docs/play/**/*.html"
  - "docs/play/**/*.js"
---

# Product language (load when product files are touched)

- Write to the player: banned families are design rationale, roadmap notes,
  plumbing terms, and the designer's flourish. Test: could a player tell
  what the sentence refers to from their screen alone? Gate: dev_voice=0.
- No em dashes, including &mdash;-style entities (the gate counts what the
  renderer emits). Replacement jobs (tools/emdash.py): separator → " · ",
  apposition → comma, restatement → colon, two clauses → two sentences.
  Fix data in the TABLES, never in build output.
- Personality lives in the coach and the taunts (characters); controls and
  rules lines just say the thing.

---
name: audit-bank
description: Read-only integrity report for Ball Knowledge data. Run after ANY merge into questions.js or players.json, before shipping a pack, or when asked "how healthy is the data". Runs tools/audit.py and interprets drift against the backlog.
---

# Audit-bank — the recurring integrity check

1. Run `python3 tools/audit.py`. The baseline is a **ratchet**: existing debt
   passes, NEW debt fails. Never edit `tools/audit-baseline.json` by hand;
   ratchet it only with `--update-baseline` after a pass that genuinely fixed
   things.
2. Interpret, don't just paste: connect each moved metric to its backlog item
   (`RESEARCH-BACKLOG.md` V1–V12) and say what changed since last audit.
3. Also check the softer signals the script can't gate:
   - era × position holes in the player DB (any 0 = a squad that can't deal)
   - tier spread per league (superstars must be the smallest tier)
   - pool depth per league+era+tier combo the UI currently offers
4. Anything new goes into `RESEARCH-BACKLOG.md` as a numbered item in the same
   commit — a finding that lives only in chat does not exist.

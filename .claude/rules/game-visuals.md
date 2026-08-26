---
paths:
  - "docs/play/**"
  - "design/**"
  - "tools/*shots*.mjs"
  - "tools/*-check.mjs"
  - "tools/*artifact*.py"
---

# Visual craft (load when game or harness files are touched)

- Comparison artifacts: real headless screenshots of the real thing, both
  sides (a lone after is a sales pitch), desktop AND 390px, both themes
  where they exist, one line per change with its measurement, plus what
  was deliberately left alone.
- The BEFORE comes out of git (a worktree at the pre-change commit), never
  from a saved copy.
- Harness conventions: route-interception mockups patch in flight and a
  missed patch is a hard error; every check ships with a render guard; new
  checks get sabotaged red before they count; a red check names two
  suspects, so isolate the claim before filing the product.
- When reusing a shipped device, copy its values and comment the source so
  the two move together when the original is retuned.
- An option render must obey the option's own law: patch exactly the
  elements the option changes, exempt the ones it protects, and guard the
  exemptions (the squared Start-over circle, 08-25: a blanket `.ctrlbtn`
  rule restyled a circle the option explicitly kept).

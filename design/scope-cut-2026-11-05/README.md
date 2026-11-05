# The fourteen-day cut · 2026-11-05

The measurement behind the scope board (row 255): what fourteen days of work
holds for the road to the twenty, now that November 1 has passed with no
ruling, no cut and no launch.

- `result.json`: the fourteen-day-scope workflow's return value, verbatim: the
  four measurement reports (throughput, the size of every open row on list 1,
  the bank gate, launch mechanics), the three composed scopes, and the six
  verdicts (two judges per scope). Committed the moment it landed, because
  the 10-18 run of the same measurement was lost to a container replacement
  before its board was published (AI-LEARNINGS 1.3ai).
- `mypick.html`: my pick with reasons, written by hand, pasted in after the
  options as the option law requires. Nothing ships until Aaron picks.
- `scope-board.html`: the page, built by `python3 tools/scope-board.py
  result.json scope-board.html mypick.html`; `scope-board.txt` is its text
  dump, what the skeptics read.
- `skeptics.json`: the skeptics' survivors, applied to the page before it was
  published.
- `shots/`: the page photographed by `node tools/scope-board-check.mjs`.

The published board is linked from PLACES.md and from the status board.

# Ball Knowledge — operating instructions (read first, every session)

## What this is
Turn-based basketball strategy where knowledge is your jumpshot. The full
ruleset and every locked decision live in **DESIGN.md** — read it before
touching gameplay code. If it's not in DESIGN.md, it's not decided.

## The medium-honesty rule (carried over from Aaronautics — non-negotiable)
Before building ANY visual element, state which medium it needs:
- **Vector / CSS / SVG / canvas geometry** (court, HUD, logos, cards, meters,
  figurine pieces, animation, type) → build it; this can be genuinely beautiful.
- **Illustrated / painterly / organic** (player portraits, card art, mascots,
  painterly scenes) → hand-coding has a hard ceiling. STOP, say so, and spec
  exactly what Aaron should source (subject, style, framing, transparent bg).
  Never over-promise and land at blocks.

## Best option wins
On design decisions, present a genuine expert opinion AND the trade-offs, then
let Aaron pick. The goal is the best result for the game — including "source
this art" or "don't build my idea" — never the option that's merely easiest or
most fun to build. Ask, don't guess, on anything with real taste in it.

## Show before it goes live — and VERIFY
- Main branch = live site (GitHub Pages serves `docs/` on main). Feature work
  happens on branches; Aaron merges.
- Mockup first for big visual changes; real headless screenshots (desktop AND
  mobile viewport) verified before asking Aaron to look.
- HARD-LEARNED: file previews in chat may run NO JavaScript. Chat-previewable
  mockups must be static HTML/CSS. The real game (served from Pages, opened in
  a browser) runs JS fine — never confuse the two constraints.

## Sources of truth — one home per thing, updated IN PLACE
| Thing | Its ONE home |
|---|---|
| How we work (this) | `CLAUDE.md` |
| Game rules & locked design decisions | `DESIGN.md` |
| Build state, roadmap, changelog | `BUILD.md` |
| Research method, data standards, LEARNINGS | `DEEPRESEARCH_KNOWLEDGE.md` |
| Research & verification queue | `RESEARCH-BACKLOG.md` |
| Links, services, logins | `PLACES.md` |

Everything else is reference (`APP-AND-MONEY.md`, `ART_PROMPTS.md`, `design/`)
or a pending action (`BLACKFIVES-OUTREACH.md`). Rules that keep this true:
- **New learnings OVERWRITE the relevant section in their home file.** Never
  start a parallel notes file; superseded text gets deleted, not stacked under.
- **The commit that makes a doc stale fixes the doc.** Never quote a coverage
  number without recomputing it from the files.
- **Data gate:** nothing merges into `questions.js`/`players.json` without the
  find → prove → merge pipeline in `DEEPRESEARCH_KNOWLEDGE.md` (source tiers,
  three outcomes, quarantine-never-delete, dateChecked).
- **Enforcement is code, not vibes:** `python3 tools/audit.py` gates every data
  change (baseline ratchet — old debt passes, NEW debt fails). Skills in
  `.claude/skills/` (`verify-facts`, `mine-questions`, `audit-bank`,
  `research-brief`, `tidy`) carry the procedures; the script carries the law.
  Regenerate `volatile-questions.json` via `tools/build-volatile-index.py`
  after any merge touching v:1 cards.

## House rules
- No CDNs. Everything self-hosted in this repo.
- Renderer and game rules stay separate (DESIGN.md §9) — the look can evolve
  without a rules rewrite.
- Economy guardrails (DESIGN.md §11): cards raise floors, never ceilings;
  stakes in credits, never real money.
- Commit with `user.email=noreply@anthropic.com`.

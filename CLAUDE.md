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

## House rules
- No CDNs. Everything self-hosted in this repo.
- Renderer and game rules stay separate (DESIGN.md §9) — the look can evolve
  without a rules rewrite.
- Economy guardrails (DESIGN.md §11): cards raise floors, never ceilings;
  stakes in credits, never real money.
- Commit with `user.email=noreply@anthropic.com`.

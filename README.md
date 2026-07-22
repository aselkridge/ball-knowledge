# 🏀 BALL KNOWLEDGE

**Your basketball knowledge is your jumpshot.**

Turn-based basketball strategy played on a full-court board. Move your squad like
chess pieces, but buckets are bought with hoops knowledge: the court itself is the
difficulty map — layups cost easy questions, threes cost hard ones. Your hands
matter too: passes, dunks, boards, and free throws run on timing meters, and
blocks are a risk/reward gamble that can put opponents on the line.

> "He took a hard question with the game on the line and BRICKED it."

## The north star

Every design decision is measured against one sentence: **knowledge is your
athleticism, strategy is your coaching.** Trivia gates every score; positioning,
shot selection, and skill timing decide close games.

## Core mechanics (locked v0.1 — see DESIGN.md for the full ruleset)

| Verb | Mechanic |
|---|---|
| Shoot | Trivia — question tier set by court zone (layup/mid/three/logo) |
| Pass | Timing meter — green window sized by passer rating |
| Drive past a defender | Trivia — "handles" question, raised by defender rating |
| Open-floor movement | Free, within the piece's speed range |
| Dunk / alley-oop | Timing meters — posterizing drains the victim's heat |
| Rebound | Reflex duel, weighted by position + rating |
| Contest a shot | Defender's choice: contest question (safe) or timed block (red zone = foul) |
| Free throws | Timing meter sized by the shooter's real FT skill |

Plus: **heat meter → ON FIRE** (questions drop a tier, team +1 move), signature
star skills unlocked by answering questions *about that player*, fatigue,
matchup-scaled contests, and the collector-card trivia UI (card flips to reveal
the question).

## Launch scope

- Full 5v5 game, quarters, hotseat (same device) play
- **NBA and WNBA rosters + question packs, day one**
- **All-Star Weekend**: 3-point contest, dunk contest, skills challenge (doubles as the tutorial)

## Roadmap

| Milestone | Deliverable |
|---|---|
| M0 — The stage | Full-court 2.5D board: canvas engine, visible tiles, oriented hoops, 3D figurine pieces (per-position shapes, superstar details) |
| M1 — The board game | Movement, turns, possession, scoring — no trivia yet; validate the chess |
| M2 — The cards | Trivia system, collector-card flip UI, starter question bank |
| M3 — Hands | Pass/dunk/FT meters, contests, blocks, fouls |
| M4 — Juice | Heat, ON FIRE, sound, crowd, screen shake |
| M5 — The CPU | Single-player opponent |
| M6 — Room codes | Private online play with friends (no accounts, no strangers) |

**Later:** streetball mode (2v2/3v3 to 21, ones-and-twos, 4-point circle),
secret unlockable characters, saved custom teams via share codes, drafts & seasons.

## Dev principles

1. **Mockup first.** Big visual changes are shown and approved before they land.
2. **Verify on real devices.** No visual milestone ships without desktop + mobile screenshots.
3. **Self-hosted everything.** No CDNs; assets live in this repo.
4. **The board logic never knows what renders it.** Renderer and rules stay separate so the look can evolve (2.5D today, 3D someday) without a rebuild.

## Structure

```
docs/          → the playable site (GitHub Pages serves this folder)
docs/index.html→ entry point
DESIGN.md      → full ruleset + art direction decisions
```

---
An independent project by Aaron Selkridge · linked from [Aaronautics](https://aselkridge.github.io/aarons-portfolio/)

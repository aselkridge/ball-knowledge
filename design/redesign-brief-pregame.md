# Handoff: Squad → Clash → Court flow (pre-game screens)

## Overview
A redesigned run of the **pre-game menu screens** for Ball Knowledge, phone-first:
each player shuffles/locks their dealt five, both squads collide in a hype
diagonal "clash," a short *Brains × Buckets* loading beat plays, then tip-off.
Plus fresh takes on the main menu (with a live theme picker) and the tip-off
buzzer race. Goal: beat the shipped v0.10 baseline with real
broadcast/anime/NBA-Street motion, and a palette system to trial an
NBA-game × trivia-show look.

Screens covered:
- **2a · Meet Your Squad** — shuffle/lock your randomly-dealt starting five
- **2b · The Clash** — the two locked squads face off across a diagonal split
- **2c · Brains × Buckets** — short pre-court loading beat
- **2d · Main Menu** — theme picker + lineup-announcement entrance
- **2e · Tip-off** — split-screen buzzer race

## About the design files
The bundled file `Squad Reveal.dc.html` is a **design reference**, not production
code. It's a motion/layout prototype built in HTML on a small React-based preview
runtime (`support.js`, also bundled). **Do not ship it or copy it into the repo
as-is.**

The task is to **recreate these screens in the existing Ball Knowledge codebase**
— vanilla HTML/CSS/JS, served statically from `docs/`, game living in
`docs/play/` (`index.html` + `game.js` + `rosters.js` + `questions.js`). Match the
project's established patterns: no build step, **no CDNs — self-host everything**,
and keep the **renderer separate from the board/rules** (DESIGN.md §9). These are
menu/flow screens, not the 2.5D canvas board, so they're plain DOM + CSS (with
CSS `@keyframes` entrances), overlaid on / swapped with the existing screen stack
in `docs/play/index.html`.

Medium-honesty (per CLAUDE.md): the **figurine pieces here are CSS geometry**
(rounded "pawn" silhouettes) and are fine to build as-is. The **venue backdrop**
is **sourced art** — a swap layer is designed in (see Assets); the bundle ships a
neutral placeholder image, not final art.

## Fidelity
**High-fidelity.** Final colors, type, spacing, copy, and motion timings are all
specified below. Exact px values were authored against a **366 × 812 CSS-px
portrait screen** (the phone content area) — treat that as the mobile reference
viewport and scale fluidly from there.

---

## Design tokens

### Fonts (self-host as woff2 — the proto loads them from Google Fonts; that must NOT ship)
- **Anton** — display headlines (SQUAD VS SQUAD, MEET YOUR SQUAD, BALL KNOWLEDGE,
  JUMP BALL, VS). Uppercase, always skewed `transform: skewX(-5deg..-7deg)`
  (Anton has no italic — skew instead). Letter-spacing ~1px.
- **Archivo** — names, buttons, body. Weights 600/700/800/900; player names use
  `800 italic`, letter-spacing -0.3px.
- **Space Mono** — labels, step markers, jersey numbers, scoreboard digits.
  Weights 400/700, letter-spacing 1–4px, usually uppercase.

### Palettes (CSS custom properties — 4 themes; swap by setting them on a root wrapper)
Team A = `--a` (offense/orange slot), Team B = `--b` (rival slot). Both teams
recolor per palette — that's the point of the toggle. In the proto the root
`<section class="bkroot" data-pal="…">` carries the theme; the base class holds
`hardwood` and `[data-pal=arcade|broadcast|court]` override the vars.

| token | hardwood (default) | arcade | broadcast | court |
|---|---|---|---|---|
| `--bg`    | #100d0b | #0a0a16 | #0b0f16 | #120a18 |
| `--bg2`   | #1a130e | #141428 | #141b26 | #1e1428 |
| `--panel` | #1d1815 | #17172c | #141b26 | #1e1428 |
| `--panel2`| #251c16 | #20203a | #1c2634 | #281a34 |
| `--ink`   | #efe6d8 | #f4f1ff | #eaf2ff | #f3e9ff |
| `--dim`   | #b3a894 | #9a97c0 | #8fa2bd | #b09ac6 |
| `--line`  | #3a2c20 | #2e2e4a | #26303f | #3a2a4a |
| `--a`  (team A)  | #f5872e | #ffd23f | #ff5a3c | #ff7a1a |
| `--a2` (A shade) | #b4560f | #d68a12 | #c23015 | #c2530a |
| `--aL` (A light) | #ffb066 | #ffe27a | #ff8a70 | #ffa552 |
| `--b`  (team B)  | #58a8d6 | #3ad1ff | #4aa3ff | #35e0c8 |
| `--b2` (B shade) | #2f6f96 | #1f8fb8 | #2f6fb0 | #1f9f8c |
| `--bL` (B light) | #8fd0f0 | #8fe6ff | #8fc4ff | #8ff0e2 |
| `--head` (skin)  | #f7b27e | #ffd9a0 | #ffb59a | #ffcfa0 |

Vibe intent: **hardwood** = warm broadcast; **arcade** = game-show gold × cyan;
**broadcast** = cool TV night; **court** = bold youth neon (orange × teal).
`color-mix(in srgb, var(--a) 30%, transparent)` is used throughout for tinted
glows — fine in modern browsers; precompute rgba() per palette if you need wider
support.

### Shape / elevation
- Phone screen radius 36px; cards/buttons 8–16px.
- Primary button: `linear-gradient(var(--aL), var(--a))`, chunky bottom shadow
  `0 5–6px 0 var(--a2)`, text `var(--bg)`, skewed -4deg.
- Roster rows: `linear-gradient(100deg, var(--panel2), var(--panel))`, 3–4px
  team-colored left (orange) / right (blue) border, hard offset shadow
  `5px 5px 0 rgba(0,0,0,.4)` (orange) / `-5px 5px 0 …` (blue), skewed ±3deg.
- Global overlays (toggleable): **scanlines** `repeating-linear-gradient(0deg,
  rgba(0,0,0,.16) 0 1px, transparent 1px 3px)` at `mix-blend-mode:multiply;
  opacity:.5`, and the **venue-art backdrop** layer (see Assets).

### Motion (durations, easing, choreography)
Easing: `cubic-bezier(.2,.9,.25,1)` (settle) and `cubic-bezier(.2,.85,.3,1.25)`
(overshoot). Named keyframes referenced below.
- **Reveal rows** (2a, `slamR`): 0.5s, slide in from the right, staggered ~0.12s.
- **Clash rows** (2b, `clashL`/`clashR`): 0.5s overshoot; orange rows fly in from
  the left, blue from the right, interleaved (~0.11s apart), settling to their
  resting ±3deg skew.
- **VS impact** (2b) resolves ~0.9–0.95s after entry: a radial **flash** (accent→
  white, screen blend) peaks ~0.9s; the **VS medallion** punches in (`boltIn`,
  scale 2.4→.86→1, ends rotated -4deg) at 0.95s; a **shockwave ring** (`shock`,
  scale .25→3.4 fade) at 0.95s; the whole board **screen-shakes** (`shake`) at
  0.95s.
- **Menu entries** (2d, `menuIn`): 0.45s overshoot, staggered 0.12s, from
  translateX 46px + skew -6deg; title uses `dropIn`.
- **Loading ball** (2c): spins **side-on** — a repeating vertical-seam strip
  (`repeating-linear-gradient(90deg, transparent 0 18px, rgba(0,0,0,.55) 18px
  20px)`, 200% wide) translated 0 → -50% on loop (`rollX`, 1.3s linear infinite)
  inside a round radially-shaded ball. Reads as rotation about the vertical axis
  (side view), NOT a flat spin. Static equator + inner shadow sell the sphere.
- **Tip-off** (2e): top zone drops in (`zoneTop`), bottom rises (`zoneBot`),
  question card scales in (`cardPop`) at 0.35s.

---

## Screens / views

### 2a · Meet Your Squad
- **Purpose:** the player reviews and locks the five they were randomly dealt (v1
  does NOT hand-pick from a collection). Per-player, on their own device — when
  both players lock, the game advances to The Clash. **SHUFFLE re-deals a fresh
  random five**; there is no picking grid.
- **Layout:** portrait, centered. Mono `SQUAD CHECK`; Anton title `MEET YOUR
  SQUAD` (SQUAD in --a, skewed -6); mono `YOU ARE ORANGE` (team-colored). A single
  centered **column of 5 full-width rows**, one per position, each sliding in from
  the right (staggered). Fixed footer (gradient scrim): a line of copy
  *"Shuffle until it feels right — then lock it. Opponent is still picking…"*, a
  primary **LOCK IT IN ✓**, and a secondary **SHUFFLE ↻**.
- **Row:** `linear-gradient(100deg,var(--panel2),var(--panel))`, 1px `--line`
  border, 4px `--a` left border, radius 11px, hard shadow `6px 6px 0
  rgba(0,0,0,.45)`, skewed -3deg. Left→right: position badge (mono, --a), player
  name (Archivo 800 italic 16px, centered), jersey # (mono, --a). The C (center)
  row is accented with `--aL` border + a soft `--a` glow.
- **Dealt pool (one random per position on each shuffle):** pull from `rosters.js`
  scoped to the chosen league+era. The proto's sample pool: PG {SGA·02, Ja
  Morant·12, Steve Nash·13, Ricky Rubio·09}; SG {Anthony Edwards·05, Devin
  Booker·01, Michael Jordan·23, Manu Ginobili·20}; SF {Jaylen Brown·07, Jayson
  Tatum·00, Kevin Durant·35, Luka Doncic·77}; PF {Paolo Banchero·05, Zion·01,
  Giannis·34, Charles Barkley·34}; C {Joel Embiid·21, Wembanyama·01, Patrick
  Ewing·33, Yao Ming·11}.
- **State:** `dealt: {pos,name,num}[5]`, re-rolled on SHUFFLE (which also replays
  the row entrance). LOCK advances the flow.

### 2b · The Clash
- **Purpose:** show both locked squads colliding before tip-off — the hype beat.
- **Layout:** portrait with a **diagonal "/" split** running corner-to-corner from
  the top-right to the bottom-left. **Orange squad occupies the upper-left
  triangle; blue the lower-right.** Each squad is a **staircase of 5 rows** whose
  widths taper so every rectangle reaches the diagonal but never crosses it:
  - Orange: left-anchored block near the top; row widths **decrease** downward
    (~240 → 220 → 198 → 176 → 152px) so lower rows stay left of the descending
    diagonal. `ORANGE` label above.
  - Blue: right-anchored block in the lower half; row widths **increase** downward
    (~150 → 172 → 190 → 205 → 222px). `BLUE` label above.
  - The two blocks are vertically offset (orange higher, blue lower) leaving a
    clear center band for the VS.
- **Diagonal line:** a subtle 2px bar centered on the screen, `rotate(-66deg)`
  (aligned to the top-right↔bottom-left line), colored a faint --aL→--bL gradient
  at ~0.55 opacity. Reinforced by two soft radial region glows (orange top-left,
  blue bottom-right). No hard edge — earlier a clip-path seam / empty image-slot
  placeholder cut the names; both are gone.
- **Rows:** compact single-line (pos · name · number), orange left-bordered / blue
  right-bordered with mirrored hard shadows; C rows get a light glow. Names may
  wrap to 2 lines in the narrowest cards.
- **VS medallion:** 64px circle (`--aL→--a`), ring `0 0 0 5px var(--bg)`, centered
  on the seam in the gap between the two staircases. Punches in on impact.
- **Header:** mono `TONIGHT'S MATCHUP`, Anton `SQUAD VS SQUAD` (VS in --a).
  Center-bottom mono `TIP-OFF INCOMING…` (pulsing). Footer: **↻ REPLAY** +
  primary **TO TIP-OFF ▸**.

### 2c · Brains × Buckets (loading)
- **Purpose:** short (~≤3s, skippable) pre-court beat framing the game: a battle
  of wits *on the court*.
- **Layout:** centered. Side-spinning ball (see motion) → `:24` shot clock
  (pulsing, --a) → Anton `BRAINS × BUCKETS` (× in --a) → body *"This is a battle
  of wits — on the court. Brains and athleticism. Bring both."* → mono ticker
  `LACING UP YOUR CEREBELLUM…`. Footer `TAP ANYWHERE TO SKIP ▸`. Rotate several
  loading lines for personality (ICING THE SHOOTER…, SMART BALL ONLY, IQ WARMING
  UP…).

### 2d · Main Menu
- **Purpose:** S2 entry hub — now with a **theme picker** on top.
- **Layout:** centered column. First a **THEME row**: mono label + 4 tappable
  34px swatches, each a two-tone `linear-gradient(120deg, teamA 50%, teamB 50%)`
  of a palette (hardwood/arcade/broadcast/court); the active one gets a
  `0 0 0 2px var(--bg), 0 0 0 4px var(--ink)` ring + slight scale. Tapping a
  swatch re-themes the whole flow. Then BK badge (placeholder ring — replace with
  real logo), Anton `BALL / KNOWLEDGE` (KNOWLEDGE in --a), tagline, and 5 skewed
  entry rows staggering in (`menuIn`): **01 PLAY · PASS & PLAY** (primary), **02
  HOW TO PLAY** (outlined --a), **03 VS CPU**, **04 PACKS & MY SQUAD**, **05
  ONLINE · FRIEND CODES** (last three dimmed + `COMING SOON`). Footer mono
  `V0.11 · NBA · WNBA · BIG3 · WORLD`.

### 2e · Tip-off
- **Purpose:** S8 split-screen buzzer race (shared phone).
- **Layout:** full-height split — top **orange buzz zone** (radial --a glow,
  `▲ ORANGE`, `SLAP TO BUZZ IN`) + bottom **blue buzz zone** (`▼ BLUE`). Centered
  question card (`--panel`, 1px --line, radius 16px, big shadow + --a glow): Anton
  `JUMP BALL`, divider, question (Archivo 800 16px), mono `FIRST TO BUZZ ANSWERS
  FOR THE BALL`. Footer `↻ REPLAY`.
- **Copy:** sample Q *"Whose silhouette is famously called 'The Logo'?"* — pull
  real jump-ball questions from `questions.js`.
- **Behavior:** first zone tapped wins the buzz → answer flow → winner gets the
  ball, loser picks the venue.

---

## Interactions & behavior
- **Meet Squad → Clash → Loading → Tip-off** is the intended chain. 2a is
  per-player (each shuffles/locks on their own device); The Clash shows only after
  both have locked. Wire 2a's LOCK and 2b's TO TIP-OFF to the existing
  screen/state machine.
- Entrance animations are CSS `@keyframes` with `animation-fill-mode: both` and
  per-element `animation-delay`. To **replay** an entrance, re-mount the node or
  toggle a class + force reflow (`void el.offsetWidth`) to restart it.
- Buttons: pointer cursor, chunky press shadow; disabled = muted `--panel` + `--dim`.

## State management
- `dealt: {pos,name,num}[5]` — 2a's five, re-rolled on SHUFFLE.
- `palette: 'hardwood'|'arcade'|'broadcast'|'court'` — sets the CSS-var theme on
  the root wrapper; switchable via the 2d swatches (and a dev PALETTE bar in the
  proto). Ship with the chosen default.
- `showVenueArt: boolean`, `showScanlines: boolean` — overlay toggles.
- Squads/questions come from existing `rosters.js` / `questions.js`.

## Assets
- **BK badge logo** — shipped in-repo (logo + favicon). The proto uses a
  placeholder ring "BK"; swap in the real mark on 2d.
- **Venue backdrop art** — Aaron sources this (painterly arena). The design has a
  full-bleed backdrop layer per screen at low opacity (~0.2–0.28) with the content
  above it. The bundle includes `venue-placeholder.png` (a neutral dark "VENUE
  ART · drop your arena here" texture) standing in until real art lands; in the
  repo, use an `<img>`/`background-image` layer, self-hosted. Design tolerates its
  absence (dark warm ground).
- **Fonts** — Anton, Archivo, Space Mono. **Self-host as woff2** (no CDNs).
- **Figurines** — pure CSS, no assets needed.

## Files
- `Squad Reveal.dc.html` — the motion/layout reference (all five screens
  side-by-side). Open in a JS-capable browser; it will not run in a no-JS chat
  preview. In-page PALETTE / VENUE ART / SCANLINES controls preview the themes.
- `venue-placeholder.png` — the neutral backdrop placeholder.
- `support.js` / `image-slot.js` — runtime + drop-slot helpers the proto loads
  (reference only; not needed in the vanilla rebuild).
- Target implementation sits alongside the existing screens in
  `docs/play/index.html` (markup + CSS) and `docs/play/game.js` (flow/state),
  reading `rosters.js` / `questions.js`.

# BALL KNOWLEDGE — Master Build Document

**This is the single source of truth for what we're building, what's built, what's
next, and what's still undecided.** Updated every working session. No backlog —
every idea lives in a phase. Deep rule mechanics live in [DESIGN.md](DESIGN.md);
this doc tracks the whole game.

*Last updated: 2026-07-22 · after playtest round 1 and the pre-game-flow design session.*

---

## 1 · Vision

**Your basketball knowledge is your jumpshot.** Turn-based basketball strategy on
a rotatable 3D court: chess brain (positioning, spacing, transition), trivia range
(the court is the difficulty map — layups easy, threes hard), timing hands
(meters for passes, dunks, boards, free throws). Collectible figurines, era packs,
heat and ON FIRE, signature star moves — sports-broadcast polish × anime warmth ×
NBA Street swagger. Play on the couch, vs the CPU, or vs your friend two states
away via a private room code. NBA & WNBA day one. For the group chat first, the
world later.

**Design laws (never break):**
1. Knowledge is your athleticism; strategy is your coaching. Trivia gates every score.
2. Cards/figurines raise floors, never ceilings (max ~15–20% mechanical edge).
3. Stakes in credits, never real money.
4. Renderer and rules stay separate — looks can evolve without rebuilds.
5. Medium honesty: code owns everything dynamic; sourced illustration owns
   atmosphere and hero art. Say which, always.

---

## 2 · The player journey (target experience, end-state)

1. **First open** → intro sting (in-code motion graphics first; true cinematic
   video is a sourced asset, later phase) → **onboarding pack rip**: 3 figurine
   packs from EVERY era. Your starting collection. Duplicates allowed.
2. **Main menu** → Play · My Collection · Packs · All-Star Weekend · Online · Settings.
3. **Play setup wizard** (each step a screen, fast and hype):
   - **League**: NBA (5v5, full court) · WNBA (5v5, full court) · Big3 (3v3, half court) — league sets court size, roster size, and question flavor.
   - **Era**: pick an era (players + questions scoped to it) or **Full Knowledge** (everything). Era list TBD (see Open Questions).
   - **Squad select**: build your lineup from your collection, filtered by league + era. THE fun screen — see design brief.
   - **Venue**: pick the court (sourced painterly backdrops). In versus play, the tip-off loser gets venue pick (consolation prize).
   - **Rules**: target score or quarters, handicap dial on/off, Friendly (flat power) vs Competitive (your collection + credit stakes).
4. **The tip-off**: a trivia buzzer race — one question, both players race to buzz
   (split-screen like the rebound battle); jump/height rating gives a head-start
   edge. Winner: first possession. Loser: picked the venue. Then — the court.
5. **Postgame**: credits awarded (losers get some, upset wins pay multipliers),
   heat highlights, rematch button.

---

## 3 · Build phases

Legend: ✅ shipped · 🔨 in progress · ⏭ next up · ▢ planned

### P0 — Foundation ✅
- ✅ Repo, GitHub Pages site, landing page (vector ball), CLAUDE.md constitution
- ✅ DESIGN.md rules bible · this BUILD.md master doc
- ✅ Logo round 1 (Crossover Monogram primary; Open-Book Court = loading hero; Scholar's Swish = rank badge)
- ✅ Look tests: diagonal camera, 2.5D vs 3D pieces, dunk choreography

### P1 — The playable core ✅ (v0.2 live at /play/) → 🔨 iterating on playtests
- ✅ Full-court tile board, zone tints, plane-oriented hoops, 3D figurine pieces
- ✅ Loading screen (ball, shot clock, NBA-idiom lines) + basic title menu
- ✅ Move / pass / shoot loop; collector-card question flips; 15s clock; 30-question bank
- ✅ Rebound tap-battles w/ box-out bonus; offensive boards; OOB long rebounds
- ✅ Baseline inbounding after makes and dead balls (no teleports)
- ✅ Transition defense (backcourt defenders sprint; in-position slides 1)
- ✅ Pass range tiers (auto ≤3 · laser 4–6 · heave 7+, misses sail OOB)
- ✅ Drag-to-rotate court (touch + mouse) · piece travel animations
- ✅ Defensive friction (v0.3): crossover challenges past defenders (red tiles;
  tier by handles — PG easy, C brutal; fail = live-ball steal), contested shots
  (+1 tier w/ defender adjacent), live block cards (matchup-aware: C blocks
  easier in the paint), blocked shots carom into rebound rules
- ✅ v0.5 — no-slip-behind rule (pull-up exemption only on a defender's near
  side), rim tap-offs (double-correct contests settle in a tap battle; rim
  protectors get the edge on layups), jitter-proof drag/tap input with pointer
  capture, per-frame camera refit, pause menu (☰ resume/restart/exit),
  spinning loading ball
- ✅ v0.4 — direction-aware crossovers (retreat/lateral always free; advancing
  past your marker never free), **screens v1** (off-ball body adjacent to a
  defender neutralizes his drive gate — red lanes visibly reopen), lane-aware
  pass risk (clean medium lane = free swing; lurker = question; heaves always
  hard), **forced inbound passes** (inbounder can't move or shoot)
- 🔨 Playtest rounds with the test kitchen (Isaiah, Malik, Tim, brother) — every
  round produces fixes before the next phase starts

### P2 — Leagues & modes ⏭ NEXT (reprioritized: testers need pickable modes)
- ▢ Mode select at game start: **NBA 5v5 · WNBA 5v5 · Big3 3v3**
- ▢ **5v5 engine** (bigger grid, SF/PF positions with their movement DNA)
- ▢ **League-scoped questions** — bank tagged nba/wnba/big3; the mode you pick
  decides what you get asked. Bank expansion to 150+ (era tags too).
- ▢ Half-court Big3 variant (check-up rule; 4-pt circle later)
- ▢ Menu redesign from the Claude-design comps (sports × anime × Street vibe)
- ▢ Setup wizard: League → Era → Squad → Venue → Rules screens
- ▢ Tip-off buzzer race · turn-structure experiment (Open Q #10) · rules screen
  · in-code intro sting

### P3 — ONLINE: friend rooms 🚨 MOVED UP (test kitchen is fully remote)
- ▢ Room codes: create game → share code → friend joins from anywhere
- ▢ Small relay server (free tier). **BLOCKER ONLY AARON CAN CLEAR: create a
  free account at render.com** — server code and deploy guide are on Claude.
- ▢ Real-time sync: turns, cards, tap-battles, buzzer races
- ▢ No accounts, no strangers, no matchmaking — private rooms only

### P4 — Hands & heat (the feel layer)
- ▢ Pass timing meter replaces long-pass questions (green width = passer rating; no-look = elite skip, 2×/game)
- ▢ Dunk meter + alley-oop (lob window when dunker in paint) + posterize (drains victim heat)
- ▢ Contest choice: question (safe) vs timed block (red zone = FOUL)
- ▢ Fouls → FT timing meters sized by FT rating (hack-a-Shaq lives) · and-ones · foul-out at 4
- ▢ Heat meter → ON FIRE (tier discounts, +1 team movement, heat check, flaming ball)
- ▢ ON FIRE streak mode (brother's beer-pong rule, balanced): keep shooting after
  makes with no defensive turns between — but each heat-check climbs a tier
  (easy→…→impossible, self-limiting), contests stay live (a block extinguishes),
  and a miss ends it with a guaranteed defensive board
- ▢ Fatigue (overused star's questions get harder until rest)
- ▢ Shot clock per turn (:24) + question clocks tuned per tier
- ▢ Matchup clause (mismatch contests = impossible tier, arena explodes)

### P5 — The collection (figurines, packs, eras)
- ▢ **Figurines ARE the collectibles** (pivot from cards — the game piece and the
  collectible are the same object; question reveal = figurine pops up and tilts
  to show its base). Collector-card UI remains for question delivery until this lands.
- ▢ Six pack rarities: Common → Uncommon → Rare → Epic → Legendary → Mystic
- ▢ Onboarding rip: 3 packs × every era on first launch
- ▢ Player tiers (Common 80 OVR → Mystic 96+) bending mechanics per design law #2
- ▢ **Duplicate fusing**: stack dupes Russian-doll style → ring tiers on the base
  (visible on the piece in-game). Trading = online phase.
- ▢ Credits economy: earn per game, losers earn some, upset multipliers
- ▢ Local persistence (browser save) + exportable collection share codes
- ▢ Pack-rip ceremony screen (the dopamine moment — designed, not defaulted)

### P6 — Art & juice integration
- ▢ Sourced hero ball + ON-FIRE flame ball (Aaron generates from prompts in DESIGN.md §9b)
- ▢ Sourced venue backdrops: Gym god-rays · Sunset Blacktop · City Night (= court skins)
- ▢ Sourced player/archetype portrait style test (figurine faces & card art)
- ▢ Sound: crowd swell, sneakers, rim, swish, buzzer; commentary barks ("COUNT IT!")
- ▢ Camera punch-ins on dunks, screen shake, net physics, movement trails
- ▢ Final logo polish + favicon + Aaronautics link panel (portfolio integration)
- ▢ WNBA + NBA visual identities (jerseys, court trims) per league

### P7 — All-Star Weekend & the CPU
- ▢ 3-Point Contest (racks of rapid-fire questions, moneyball = hard tier)
- ▢ Dunk Contest (timing-combo chains, judged)
- ▢ Skills Challenge (relay through every mechanic = the secret tutorial)
- ▢ CPU opponent (difficulty = its "knowledge" accuracy + tactical heuristics)

### P7 — Online (play Tim from another state)
- ▢ Room codes: create → share code → friend joins. No accounts, no strangers, no matchmaking.
- ▢ Small relay server (free tier — Render/Fly; Aaron creates the account, I build/deploy)
- ▢ Real-time sync of turns, battles, buzzer races
- ▢ Figurine trading between friends · cross-device collection (accounts, minimal)

### P8 — The league (long game)
- ▢ Big3 4-point circle + streetball rule variants (ones-and-twos to 21, win by 2)
- ▢ Secret unlockable characters (answer an impossible-tier question in-game; codes; the Alien)
- ▢ Home-court advantage perk · coach-view camera toggle
- ▢ Community question packs · seasons & drafts · leaderboards ("if we ever care")
- ▢ Cinematic intro video (sourced/AI-generated — real video is beyond hand-code)

---

## 4 · What's next (the live edge)

1. **Aaron**: playtest v0.2 with the crew; bring the list.
2. **Aaron**: run the menu brief through Claude design → bring comps back.
3. **Aaron**: generate first art drop (hero ball + gym backdrop, prompts in DESIGN.md §9b).
4. **Claude**: P2 kickoff on comps arrival — menu + setup wizard + 5v5 engine.
5. **Claude**: question bank expansion w/ era tags (parallel, ongoing).

## 5 · Needs from Aaron (blocking or soon)

- [ ] **🚨 Create a free render.com account** — the only blocker on online friend
  play. Five minutes; deploy steps come from Claude when ready.

- [ ] **Brother's game-rules input** — referenced but never captured. Get it in here.
- [ ] Menu design comps from Claude design
- [ ] First sourced-art drop (ball, gym backdrop)
- [ ] Logo verdict (Crossover Monogram as primary — bless or iterate)
- [ ] Era list approval (see Open Questions)
- [ ] Test-kitchen verdicts: is the core loop fun? Which mechanic feels best/worst?

## 6 · Open design questions

1. **Real players vs original archetypes** — biggest open. Collectible figurines
   of real NBA/WNBA players = licensed territory (likeness rights apply to
   figurines same as cards). Trivia ABOUT real players/facts: always fine.
   Options: (a) real names, friends-only forever; (b) original archetype legends
   ("The King" figurine) with real-fact trivia — safe to grow, art-friendly;
   (c) hybrid. Leaning (b)+(c); decide before P4 art.
2. **Era list** — proposal to react to: Pioneers ('50s–'60s) · Rivals ('70s–'80s) ·
   Golden ('90s) · Iso Era ('00s) · Splash Era ('10s) · Modern ('20s) · plus
   The W across eras. Big3 counts as league, not era.
3. **Jump-ball skill weighting** — buzzer race + how much head start per jump
   rating? And does a Brunson-type ever win a tip? (Maybe: big head-start gap,
   but a perfect instant answer can still steal it — knowledge beats gravity, rarely.)
4. **Duplicate fusing specifics** — how many dupes per ring tier; what a ring
   grants (small stat bump vs cosmetic vs +1 skill use). Must obey design law #2.
5. **Handicap dial mechanics** — question-tier shifting by rating gap; opt-in or automatic in Friendly?
6. **Figurine question-reveal staging** — pop up + tilt to read the base: how does
   the 15s clock display on a tilted base? Prototype needed in P4.
7. **Big3 rules fidelity** — how much of real Big3 (half court, 4-pt, first to 50)?
8. **Intro video** — in-code motion sting always; is AI-generated cinematic worth sourcing later?
9. **5v5 board size** — bigger grid changes pacing; needs a feel test early in P2.
10. **Turn structure** — current: one action per turn. Aaron's instinct: force
    whole-team movement (no same-piece-twice, or everyone-moves-once). Best
    candidate per Mario+Rabbids study: **team turns** (every piece gets one
    action per turn — squad sweeps are the default rhythm). Alternative:
    "tired legs" (consecutive moves by one piece raise his question tiers).
    Decision: prototype team turns behind a toggle in P2; playtest both.

## 7 · Changelog

- **2026-07-23** — v0.6 shipped from playtest round 5: backcourt rule (ball
  can't recross half), passer-adjacent lane fix (backward outlets no longer
  "contested"), inbound cutter setup (one repositioning move + defensive
  answer before the forced pass; 5-second timer arrives with shot clock),
  attacked-rim glow for orientation after court rotation, finger-sized tap
  floor for far-side pieces. PRIORITY PIVOT: online rooms moved P7→P3 (all
  testers are remote); P2 refocused to league modes (NBA/WNBA 5v5, Big3 3v3)
  with league-scoped questions.
- **2026-07-22 (night)** — v0.5 shipped from playtest round 4: slip-behind fix,
  rim tap-offs, input smoothing, pause menu, spinning loader. Turn-structure
  experiment (Mario+Rabbids team turns) queued into P2.
- **2026-07-22 (later)** — v0.4 shipped from playtest round 3: direction-aware
  crossover gating, screen logic v1 (teamwork visibly opens lanes), lane-aware
  passing, inbound-must-pass (killed the inbound layup exploit).
- **2026-07-22 (late)** — v0.3 shipped: defensive friction package from playtest
  round 2 (crossovers, contested tiers, live blocks). ON FIRE streak-mode design
  locked (brother's rule, balanced). Spacing problem diagnosed: friction makes
  teammates matter; screens/assist-heat land in P3 to finish the job.
- **2026-07-22 (pm)** — Playtest round 1 fixes shipped (v0.2): rebound battles,
  inbounding, transition sprint defense, pass range tiers, drag-to-rotate,
  travel animations. Pre-game pipeline designed (leagues, eras, onboarding
  packs, figurine pivot, tip-off buzzer). This document created.
- **2026-07-22 (am)** — Repo + site launched. v0.1 playable slice shipped to
  /play/. Logo round 1. Sourced-art plan locked. Menu design brief written.
- **(pre-repo)** — Concept & look-test era: game invented (basketball chess
  trivia), core loop designed, mockups v1–v4, quality/medium rules established.

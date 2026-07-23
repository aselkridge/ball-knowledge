# BALL KNOWLEDGE — Master Build Document

**This is the single source of truth for what we're building, what's built, what's
next, and what's still undecided.** Updated every working session. No backlog —
every idea lives in a phase. Deep rule mechanics live in [DESIGN.md](DESIGN.md);
this doc tracks the whole game.

*Last updated: 2026-07-23 · FRIENDS-LAUNCH REPRIORITIZATION — see the FL roadmap.*

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

### 🏁 ROAD TO FRIENDS LAUNCH (the only priority until the group chat is playing)

**Definition of launched:** a friend anywhere opens the URL, signs in with the
friend code Aaron gave them, picks a league + decade, gets a roster of real
named players, joins a room, and plays a full game that looks and feels dope.

### FL-1 — Identity & front-of-house ✅ (v0.8)
- ✅ Loading sting: light sweep → logo slam → spinning ball + shot clock +
  NBA-idiom lines; tap to skip
- ✅ Main menu, Street × Persona treatment: rotating ghost type backdrop,
  diagonal slashes, tilted badge, skewed slab buttons staggering in like a
  lineup announcement, numbered entries, Vs CPU / Packs / Online teasers
- ✅ Favicon (monogram) + logo as the shipped mark
- → Menu flow shell rides with FL-2 (screens ship when their options are real)

### FL-2 — Setup flow & modes
- ▢ League select: **NBA 5v5 · WNBA 5v5 · Big3 3v3** (court + roster size + bank scope)
- ▢ **5v5 engine** (bigger grid, SF/PF movement DNA) + Big3 half-court variant
- ▢ Decade/era select (or Full Knowledge)
- ▢ Roster v1: **randomized real named players** per league+decade (numbers on
  figurine backs, names on screen; hand-picking rosters = fast-follow)
- ▢ Rules screen (first to N) + tip-off buzzer race

### FL-2.5 — CPU opponent (moved up per Aaron: practice mode + midnight games)
- ▢ Heuristic board AI over the existing rules engine (score candidate actions:
  rim distance, open teammates, crossover risk, paint protection) — no LLM
- ▢ CPU "knowledge" = accuracy dial per tier — difficulty IS ball knowledge:
  Rookie 85/55/30 · All-Star 95/80/60 · Legend barely misses; fake think-time;
  same dial drives tap-battles and future meters
- ▢ Difficulty select framed in-world: "who are you playing against — a casual
  fan or a hoops historian?"

### FL-3 — Question engine v1
- ▢ Bank schema: {league, era, tier, category, subject(s), question, answers}
- ▢ **300+ questions authored + fact-checked** (NBA, WNBA, Big3 to start;
  Negro Leagues/Olympics/international grow the bank continuously)
- ▢ No-repeat cooldown tracking (local first; per-account once server lands;
  subject-keyed so the same fact can return about a different player)
- ▢ Deep-research pull #2 feeds this: the everything-basketball knowledge sweep

### FL-4 — Server: friend codes & rooms (✅ infrastructure LIVE)
**Server address: https://ball-knowledge-rvbb.onrender.com** (placeholder v0;
/health answers; auto-deploys from /server on main; free tier naps when idle)
- ▢ Relay server + Postgres (free tier) — accounts-lite: handle + friend code,
  no passwords, invite codes Aaron hands out
- ▢ Room codes: create game → share code → friend joins from anywhere
- ▢ Real-time sync: turns, cards, tap-battles, buzzer races
- ▢ Per-account seen-question tracking moves server-side
- ▢ **In-game chat window** (per Aaron): room-scoped text chat between players —
  slide-up panel + quick-chat trash-talk presets ("BRICK!", "ANKLES!",
  "call bank"); friends-only rooms so no moderation machinery for v1

### FL-5 — In-game dope pass
- ▢ Basketball-style scoreboard · fun heat bar (simple heat v1 mechanic with it)
- ▢ Court beautification + light-up tile effects + shot effects (arc trail,
  swish burst, rim rattle)
- ▢ Figurine jersey numbers (back) + player names on screen
- ▢ Sound pass v1 (swish, rim, crowd, buzzer)

### FL-6 — 🚀 LAUNCH to the group chat
- ▢ Verified round-trip: two phones, two states, full game
- ▢ Hype sheet v2 + the URL drops in the chat

---

### AFTER LAUNCH (everything already designed, nothing dropped)

**AL-1 · Hands & heat (full):** pass/dunk/FT timing meters, alley-oops,
posterize, contest choice (question vs timed block → fouls, and-ones,
foul-outs), full ON FIRE + streak mode (brother's rule, balanced), fatigue,
:24 shot clock, matchup clause, turn-structure experiment (Rabbids team turns).

**AL-2 · The collection:** figurines as collectibles (tilt-the-base question
reveal), six pack rarities, onboarding rip (3 packs × every era), tiered player
cards w/ ratings (handles→crossover depth, etc.), duplicate fusing (ring tiers),
credits economy + upset multipliers, pack-rip ceremony, per-account inventory
tables (same Postgres), trading (needs rooms), collection share codes.

**AL-3 · Art & atmosphere:** sourced hero ball + flame ball + venue backdrops
(gym god-rays, sunset blacktop, city night = court skins), player/archetype
portraits, commentary barks, camera punch-ins, WNBA/NBA visual identities,
Aaronautics link panel.

**AL-4 · All-Star Weekend & CPU:** 3-point contest, dunk contest, skills
challenge (secret tutorial), CPU opponent.

**AL-4.5 · Squad-up co-op (per Aaron — "players teaming up against other
teams"):** 2v2 (or more) rooms where teammates share a squad — each human
controls their own pieces and answers their own questions (your teammate can't
bail you out at the line), alternating possessions or split PG/wing duties,
co-op rebound tap-battles (both teammates hammer the same zone), shared heat
meter, and team chat. Also: 2 humans vs a Legend CPU as a co-op boss mode.
Rides on FL-4's rooms — mostly a room-size + turn-assignment extension.

**AL-5 · The league:** Big3 4-pt circle + streetball rules, secret characters,
home-court perk, coach view, handicap dial, community packs, seasons & drafts,
leaderboards, cinematic intro video (sourced).

## 4 · What's next (the live edge)

1. **Aaron**: 🚨 create the free render.com account (unblocks FL-4).
2. **Aaron**: run the two /deep-research pulls (prompts from Claude): games-UI
   research + the everything-basketball knowledge sweep.
3. **Claude**: FL-1 — loading screen + dope menus + flow shell.
4. **Claude**: FL-3 question schema + first 300-question authored bank (parallel).
5. **Aaron**: menu comps + art drop still welcome — they slot into FL-1/AL-3.

## 5 · Needs from Aaron (blocking or soon)

- [x] ~~Create a free render.com account~~ ✅ DONE — placeholder server in
  /server proves the pipeline; real relay lands in FL-4.

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

- **2026-07-23 (5)** — Squad-up co-op logged (AL-4.5): teammates share a squad,
  answer their own questions, co-op boss mode vs Legend CPU.
- **2026-07-23 (4)** — CPU opponent moved up to FL-2.5 (heuristic AI +
  accuracy-dial knowledge; no LLM). In-game room chat added to FL-4 (text +
  quick-chat trash-talk presets).
- **2026-07-23 (3)** — FRIENDS-LAUNCH replan: everything reorganized around
  getting remote friends playing — FL-1 identity/menus → FL-2 modes/setup →
  FL-3 question engine (300+ tagged bank, no-repeat cooldowns) → FL-4 server
  (friend codes, rooms, Postgres — NOT Snowflake) → FL-5 in-game dope pass →
  FL-6 launch. Packs/collection explicitly deferred (needs per-account
  inventory; lands AL-2). Two deep-research pulls queued for Aaron to fire.
- **2026-07-23 (2)** — v0.7: trailing defenders can no longer contest shots
  (chase-down blocks reserved as a future signature skill); deep crossovers
  (3+ tiles past your man) cost one tier more. Ratings hook logged: the
  handles stat will set crossover tier AND max carry depth (the AI-vs-
  Draymond rule) when player cards land.
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

# BALL KNOWLEDGE — Master Build Document

> # ⛔ READ `V0.md` FIRST — IT IS THE PLAN.
> Locked 2026-08-01. **This file is the RECORD, not the to-do list.**
>
> **§ 3 "Build phases" and § 4 "What's next" below are the JULY 29 DRAFT BOARD and
> are SUPERSEDED.** They were written before Aaron's goal changed to "ship to 20
> friends, NBA + WNBA only, fast". They are kept because the reasoning in them is
> still worth reading — NOT because they are still the plan.
>
> **Do not blend the two lists.** If a plan you are writing contains items from
> both, you have already made the mistake this banner exists to prevent.
>
> Live scope: `V0.md` · live gap counts: `python3 tools/todo-build.py` · browse
> them: `/tape/` saved views.



**This is the single source of truth for what we're building, what's built, what's
next, and what's still undecided.** Updated every working session. No backlog —
every idea lives in a phase. Deep rule mechanics live in [DESIGN.md](DESIGN.md);
this doc tracks the whole game.

*Last updated: 2026-07-23 · FRIENDS-LAUNCH REPRIORITIZATION — see the FL roadmap.*

---

## 1 · Vision

**Your basketball knowledge is your jumpshot.** Turn-based basketball strategy on
a rotatable 3D court: chess brain (positioning, spacing, transition), trivia range
(the court is the difficulty map — layups easy, threes hard), timing hands —
upside-only: reflex can deny a block or win first crack, never erase a right
answer (DESIGN.md §3b). Collectible figurines, era packs,
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

## 3 · Build phases  — ⛔ SUPERSEDED by V0.md (July 29 draft, kept for reasoning only)

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
- ✅ THE BRAND (07-27, replaced the monogram): #48 head-brain = favicon/app
  icons · #76 circuit ball = share card + landing hero · #56 Philosopher =
  loading screens (live spinball on his fingertip) · #64 grad cap = victory
  crown · #48 crest on the title screen · landing page = storefront with
  PLAY THE ALPHA · og/twitter link previews on both pages
- → Menu flow shell rides with FL-2 (screens ship when their options are real)

### FL-2 — Setup flow & modes ✅ (v0.9)
- ✅ League select: NBA 5v5 · WNBA 5v5 · Big3 3v3 — sets court, lineup, and
  question scope; each league card has its own identity
- ✅ 5v5 engine: 15×8 court, SF/PF figurine profiles + movement DNA; Big3 =
  8×7 half court, single rim, check-it-up-top on possession changes
- ✅ Decade select per league (+ FULL KNOWLEDGE); Big3 skips straight to squads
- ✅ Randomized real-name rosters (~160 players with canonical numbers across
  NBA '60s–'20s, WNBA '00s–'20s, Big3) — numbered figurines, names in the
  play-by-play, squad-reveal screen with re-deal button
- ✅ Rules screen (first to 11/21) + tip-off buzzer race (split-screen speed
  answer; wrong answer hands the ball over) — jump-rating head start rides
  with player ratings in AL-2
- ✅ League-scoped questions (bank now ~51, tagged nba/wnba/big3/world/any;
  Big3 and WORLD also draw NBA — their players are vets/Olympians; 300+ = FL-3)
- ✅ **v0.10 playtest batch (2026-07-23):**
  - WORLD league playable (Olympic/FIBA legends pool, world-tagged questions);
    G League + Street Legends visible as dashed "IN THE LAB" cards (they rattle
    when tapped) — real rosters/questions wait on the deep-research pull
  - Era MULTI-select: mix any decades ('70s + '00s!), '20s labeled "· NOW",
    FULL KNOWLEDGE is the default and re-arms if you empty the mix
  - Crossover is a DUEL: beat your question → defender answers his own card to
    stay in front (quick guards get easier cards, bigs on skates get brutal
    ones — the AI-vs-Shaq asymmetry) → both right = ANKLE BATTLE tap-off
    (edge to the ball-handler; lose it and the possession move is burned)
  - Contest quality reads defender position: orthogonal = SMOTHERED (shot +1
    tier), diagonal = late closeout (shot clean, but his block card is harder)
  - Real pinch-zoom (0.75–1.6×) + touch-action:none — the "glitchy zoom" was
    the browser fighting the canvas; drag-rotate untouched
  - Chess-style court coordinates (A1-style letters/numbers on the edges;
    selection banner calls the square) — groundwork for voice/type-to-move
  - Loading ball now finger-spins (fast reverse spin + wind arcs + fingertip)
  - "Skip slide" → "Stay put ▸" + clearer defense banners
  - Help everywhere: "?" on every setup screen + in-game quick-help "?" +
    pause menu gained "How to play" (rulebook overlays the live game)
  - Question de-babying: the 3 gimme questions cut, 6 world questions added
- ✅ **v0.11 playtest batch (2026-07-23, same-day round 2):**
  - **Confirm step**: every move/pass/slide stages first — Confirm ✓ / Cancel ✗
    (touch is sensitive; nothing fires on a stray tap). Tapping a teammate now
    asks **"Pass ✓ or Move him ▸?"** — fixes being locked out of repositioning
  - **Backcourt = real violation**: no more refusals — dark-red warning tiles,
    ⚠️ warning at confirm, whistle + turnover if you do it anyway. (Easy mode
    that BLOCKS illegal moves rides with the coach tutorial)
  - **Steals must be EARNED**: flubbed crossover → defender gets his own
    PICK-THE-POCKET card (guards 2, bigs 3); he misses too = move simply wasted
  - **Contest fix**: only a defender BETWEEN shooter and rim contests — the
    "how was 1 contesting 77" side-by-side phantom contest is dead
  - **Ball pressure**: marker within 1 tile AND rim-side of the ball contests
    every forward/diagonal-forward pass (inbounds included — the uncontested
    inbound pass Aaron flagged); sideways/backward stay free
  - **RELEASE METER (the tap bar, pulled forward)**: after a correct answer on
    any shot or risky pass, a sweeping timing bar — perfect center = rises
    clean over any contest / on-the-money dish; wide middle = good; red edges
    = shank even on a right answer. Knowledge earns the look, touch finishes it
  - **Tip-off buzzers are real BUTTONS** now (slap-to-buzz slabs), side-by-side
    on desktop, stacked halves on mobile
  - **Loading ball v2**: side-view finger spin — seams whirl around the
    vertical axis (no finger, per Aaron), wind flicks at the equator
- ✅ **v0.12 playtest batch (2026-07-23, round 3 — readability & rules):**
  - **Mid-screen prompts**: confirm panel, big pulsing 🏀 SHOOT button, Stay
    put, and Set-up-a-cutter all live center-court now, not buried at the
    bottom; bottom bar is hints only
  - **Event CALLOUTS**: who won the tip, SPLASH +2, OFF THE IRON, PICKED
    CLEAN, OVER & BACK, ANKLES!, boards — big center-screen slams in team
    colors instead of quiet top-bar text
  - **Defense slides offense-minus-one** (min 1): guards cover 2, bigs 1;
    backcourt sprint unchanged
  - **Crossover duel target is deterministic & NAMED**: the defender closest
    to your driving line (cutting between two = the tighter one) — the
    confirm prompt says "DEEP CROSSOVER vs Rubio" before you commit
  - **Deep-cross tiles glow darker red** (know the price before you leap)
  - **Winning a cross costs a step**: you land one square short of your
    target when there's room — momentum tax on ankle-breakers
- → hand-picked rosters: fast-follow

### FL-2.6 — Turn structure experiment + coach tutorial (NEXT — per playtest)
- ▢ **Team-turns toggle** (Mario+Rabbids study): every piece gets one action
  per turn, shot can't come from the piece that just moved — prototyped behind
  a house-rules toggle so both rhythms can be playtested ("is it too much?" —
  the toggle answers it)
- ▢ **Coach-style interactive tutorial** replaces the how-to wall of text:
  a guided first possession — coach voice, highlight windows, "tap HERE" —
  teaching move/pass/shoot/cross/contest one beat at a time

### FL-5 → moved up: the dope pass rides NOW (Aaron: "I need these visuals
ASAP because I am bored") — scoreboard, heat bar, light-up tiles, shot
effects, sounds land before CPU/questions, right after FL-2.6.

### FL-2.5 — CPU opponent ✅ (v1 SHIPPED 07-24)
- ✅ Heuristic board AI over the existing rules engine (input-layer contract:
  the CPU picks among engine-computed options, never its own rules)
- ✅ CPU "knowledge" = accuracy dial per tier; same dial drives tap-battles
  and meters; fake think-time
- ✅ Difficulty select framed in-world ("who are you facing?" picker)
- ▢ LATER: adaptive "studies your game" layer · CPU-vs-CPU headless sanity test

### FL-3 — Question engine v1 (🟢 bank live, cooldown pending)
- ✅ Bank schema: {league, era, tier, category, question, answers} — live
- ✅ **1,526 questions authored + verified** (runs 1–3 merged; tier spread
  rebalanced; gender-neutral sweep 07-27; t:0 giveaway phrasing is a feature)
- ✅ Difficulty brackets (Casual→Legend + Surprise Me) slide the whole curve
  in one place (top of showCard, covers all nine card sites)
- ▢ No-repeat cooldown tracking (local first; per-account once server lands;
  subject-keyed so the same fact can return about a different player)

### FL-4 — Server: friend codes & rooms (🟢 ALPHA LIVE — v0.13)
**Server address: https://ball-knowledge-rvbb.onrender.com** (websocket room
relay; /health answers; auto-deploys from /server on main; free tier naps —
first connect can take ~30s to wake, the client says so)
- ✅ **Room codes (alpha)**: Online → Create a room → 4-letter code → friend
  joins from anywhere. Host is Orange and picks the matchup.
- ✅ **Real-time sync**: every move/pass/shot/slide, cards, ANKLE battles,
  rebound tap-offs, release meters, buzzer races — each side controls only
  its own team, tap zones and buzzers are gated per phone
- ✅ **Private cards**: you only see YOUR trivia — opponent sees "answering a
  HARD card…" and sweats
- ✅ Host-authoritative tap-battle resolution (+grace for taps in flight);
  disconnect/leave → callout + back to menu; host controls rematches
- ✅ **Squad check + VS screen (v0.14, per Aaron)**: after house rules, BOTH
  players see their own squad, shuffle it as much as they want (shuffles sync
  live, dupes vs opponent excluded), lock in — when both lock, the SQUAD VS
  SQUAD matchup screen faces the teams off, then the tip goes up. Local play
  gets the VS screen too.
- ✅ **THE GUEST LIST**: invite-only relay (BK_ACCESS codes) — and the client
  now cards you AT THE DOOR (07-27): clicking Online probes the bouncer
  before any setup walking; menu button warns "ALPHA · access code required"
- ✅ **Online toss-up + full game audit (Phase 1.1/1.2)**: host-arbitrated
  races on reaction deltas, broadcast question indexes, drop/rejoin tickets
  with pre-game null-safety — see the NETCODE INVARIANT in §6
- ✅ Room setup leak fixed (07-27): creator no longer sees jersey/court rows —
  both are toss-up spoils
- ▢ Accounts-lite (handle + friend code, Postgres/Supabase) — later; rooms
  need zero sign-in for the friends test
- ▢ Per-account seen-question tracking moves server-side
- ▢ **In-game chat window — LATER / MAYBE** (Aaron 07-25: moderation risk;
  if built: collapsed pill + quick-emote presets + hard off switch)

### FL-5 — In-game dope pass (🟢 started — v0.15)
- ✅ **REAL music (v0.16 — the portfolio method)**: procedural chiptune was
  the wrong medium (Aaron: "horrible, lol" — correct). Now: self-hosted
  Kevin MacLeod tracks (incompetech.com, CC BY 4.0, credit in rulebook) —
  "Funkorama" on menus, "Funk Game Loop" in-game, crossfading by screen.
  Swap tracks anytime: replace the two files in docs/play/audio/. Synth SFX
  stay (those work). v0.15 bugs fixed: music restarted on every tap (the
  audio-unlock handler re-fired forever — now runs exactly once) and the ♪
  toggle couldn't stop it (a pending fade-in timer resurrected it — fades
  now cancel on toggle). "Connect Spotify/Apple" = intentionally skipped
  (paid dev accounts + premium + fragile); Music-OFF + your own music app
  playing underneath is the universal answer.
- ✅ **Settings / "Control Room" (v0.15, per-phone via localStorage)**: color
  theme (Hardwood/Blacktop/Neon/Sunset — retints menu chrome; team + court
  colors stay fixed), music on/off + volume, SFX on/off + volume, court-label
  toggle, reduce-motion. Reachable from the title ⚙ and the pause menu; ♪ quick
  music toggle on title + in-game HUD.
- ✅ Broadcast scorebar v1 (07-27): angled team panels in TRUE team colors,
  Anton abbrevs, possession dot, one-tray (⋯) gameplay chrome
- ✅ Home courts: 6 families × A/B = 12 looks, picker in the house language,
  Midnight Run retints the live engine board
- ▢ Scoreboard + play-by-play REDESIGN (Aaron calls current lazy — BLOCKED ON
  Aaron's reference art; includes shot clock/quarter timers in the language)
- ▢ Fun heat bar (simple heat v1 mechanic with it)
- ▢ Light-up tile effects + shot effects (arc trail, swish burst, rim rattle)
- ▢ On-court name tags (numbers ✅ · play-by-play names ✅)

### FL-6 — 🚀 LAUNCH to the group chat (⏭ genuinely close)
- ✅ Verified round-trip: two phones, two states, full game (Phase 1.2 audit +
  Aaron's real-device sessions; drops2 rejoin suite green)
- ✅ Invite gate + share card + link previews = the front door is dressed
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

## 4 · What's next  — ⛔ SUPERSEDED by V0.md (July 29 draft, kept for reasoning only)

**PLAYTEST BUGS (Aaron, 07-29 — ✅ FIXED same day, harness-verified, on the branch):**
1. **Answer highlight is fragile + weak (game.js `answer()`):** the correct
   button is found by TEXT comparison (`e.textContent===q.c[q.a]`) instead of
   marking buttons at creation like the toss-up path does (`dataset.ok`) — a
   duplicate/near-duplicate choice text mislights it. And `.ans.correct` is a
   dim dark-green wash shown for only ~1.4s (the toss-up's `.good` has a bright
   color-mix + pop animation) — on a timeout before the card was even flipped,
   the reveal happens on a hidden face and the player sees nothing. FIX: mark
   by index at creation; give right/wrong a real BEAT (pop animation + longer
   hold + result flash, toss-up included). Aaron: "getting a question right or
   wrong should have a short, important moment."
2. **Coach first-tip delayed past tip-off — REGRESSION from the 07-28 coach
   pause fix (coach.js watcher):** the added guard waits for
   `phase==='off-select'` AND (vs CPU) the player on offense, so when the CPU
   wins the tip the coach's hello can arrive minutes late. Aaron: coach should
   show ASAP. FIX: fire the `first` tip at game-screen mount BEFORE the
   jumbotron/tip-off in CPU/local (freeze makes this safe now); keep online
   deferred (freeze is a no-op in NET games — a pre-tip modal would talk over
   a live synced tip-off).
   **SHIPPED RULING (Aaron, 07-29): the coach does not exist in ONLINE games at
   all.** Investigation confirmed online tips were showing WITHOUT pausing
   (tipShow only froze when !netOn) — worst of both worlds. The watcher now
   exits immediately when netOn(); seen-flags are preserved so a player's
   first CPU/local game still teaches. Answer beat: buttons marked ok at
   creation (dataset), bright pop + shake + result slam, hold 1400→1800ms
   MIRRORED in netApply 'card' (the desync lesson). Harness: 9/9 assertions
   green (coach ASAP pre-tip-off, frozen, thaw-on-dismiss, online-silent,
   dataset marking, correct lights, wrong shakes, ansPop live).

**★ CURRENT PRIORITY ORDER (synced 07-27) — one at a time, finished before the next:**
1. **FL-2.6 — Coach tutorial** (guided first possession, "tap HERE" beats) +
   team-turns toggle experiment + rules-assist easy mode (Q15) — Aaron's big one.
2. **Inbound rework** (§6 · 22a): ✅ BUILT 07-27 (entry 62, on the branch) —
   inbounder out of bounds + spot inbounds. Blind simultaneous setup moves
   still open as a future experiment.
3. **Scoreboard + play-by-play redesign** (§6 · 22b) — ✅ SCOREBOARD HALF
   BUILT 07-27 (entry 66, on the branch): n-7 rig replaces the HUD in every
   mode, n-8 jumbotron beats. Play-by-play language + replay hide-toggle
   (22d) still open.
4. **Player inspect panel + stats everywhere** (§6 · 22e/f) — data already in
   the DB; UI + mapping job.
5. **FL-5 juice**: heat bar, light-up tiles, shot effects, on-court name tags,
   in-game commentary barks (22g).
6. **FL-6 — LAUNCH**: hype sheet + drop the URL in the group chat.
- **Future headline (Aaron 07-27): STORY MODE** — CPU-first menu is its doorway;
  design TBD, logged so it's never lost.
- **Cross-cutting quality bar:** every remaining screen (settings, pause,
  how-to) gets the design-language audit pass (rolodex cards · breathing glow ·
  Sedgwick slam · realistic balls · arena backdrop).

**AARON'S AGENDA (sent 07-27, discuss ONE AT A TIME in his order — logged
verbatim so nothing is lost):**
1. **Music selection** — better starting songs; in-game track is
   anxiety-inducing (ties into §5 NEW MUSIC / §6 · 22o brief).
2. **Scoreboard art** — (ties into §5 reference-art ask / §6 · 22b).
3. **Desktop UI sizing** — hard to see timeline etc.; desktop needs its own
   sizing pass, not just stretched mobile.
4. **Theme Selection screen** — ✅ BUILT 07-27 as LOCKER ROOM (entry 64,
   on the branch): CPU-mode step 3, two showcase squares, pickers round-trip.
5. **Full phases send** — complete / in progress / yet to release, with
   ONGOING work as its own category.
6. **Deep-research debt list** — ✅ ANSWERED 07-29 → `RESEARCH-BACKLOG.md`
   (every number measured from the files; method + standards live in
   `DEEPRESEARCH_KNOWLEDGE.md`).
7. **Stats + superstar skills in gameplay** — playtester: "I don't get any
   questions about the players I have" / "why do we choose them then?" —
   make rosters MATTER (question targeting and/or player skills).

## 5 · Needs from Aaron (blocking or soon)

### Test coverage — filed 2026-08-04

Aaron, 08-04: *"Why do I keep finding these bugs and bad data through random
questions?"* Counted rather than answered: the Daily Five carried **99** automatic
checks and the whole rest of the game carried **~68 across 21 screens**, with
**17 having none at all**. The bugs were never concentrated in the daily — the
attention was. `tools/smoke-check.mjs` is now the floor under all 21; these two
items are what it does NOT cover.

- [ ] **Six controls in the game HUD are under 28px on a phone.** Measured 08-04
  at 390px: `⋯` is 24×24, and `☰ ↺ ♪ ?` plus the coach toggle are 37×25. Apple's
  guidance is 44px. **Safe today** — each already carries a transparent 44px tap
  area (`index.html`, `.dbtn/.pbtn::after`), so they are far easier to hit than
  their size implies, and `smoke-check.mjs` ratchets the count at 6 so no screen
  can grow a seventh. Making them genuinely bigger changes how the HUD LOOKS,
  which needs a before/after comparison first — that is why this is an item and
  not a fix. Recount:
  `node tools/smoke-check.mjs | grep "under 28px"`
- [ ] **17 screens have only the smoke floor, not a real test.** The floor opens
  every screen and complains about crashes, empty screens, sideways scroll,
  literal "undefined" on screen and tiny controls. It does **not** know what any
  screen is supposed to DO — nothing checks that league select actually selects a
  league, or that settings persist. The three screens with real tests (daily,
  game, tape) are the three anyone has ever asked a question about. No need to do
  all 17: the useful order is whatever a new player touches first — title →
  league → squad → game.

### Stale branches — HISTORY IS SAFE, three deletions still owed to Aaron

Measured 08-05 while explaining pull requests. Aaron's ruling the same day:
delete the two empty branches; preserve the origin history and delete its
branch.

**DONE — the day-one history is preserved.** `archive/origin-v0` now exists on
GitHub at `437f2a6`, holding all six of the project's first commits:
`Initial commit`, `Ball Knowledge v0 — project scaffold`, `Design bible v0.2`,
`Add CLAUDE.md — project constitution`, `Landing page: real vector basketball`,
`Playable prototype slice v0.1`. Verified by fetching day-one's 38-line
CLAUDE.md back out of GitHub at that ref. This matters because main's own
history begins at `aed17ca` on Jul 29 — main was restarted, and nothing else in
the repo reaches back to Jul 22. For MAKING.md it is the birth certificate.

**WHY IT IS AN ARCHIVE BRANCH AND NOT A TAG — a session limit, not a choice.**
Aaron asked for a tag. This session's git proxy answers **HTTP 403** to
`git push origin refs/tags/*`, and the GitHub MCP server has no tag-creation
method (only `get_tag` / `list_tags`). Branch refs push fine, so a
permanently-named branch does the same job: it keeps the commits reachable so
git never sweeps them up. A tag would be strictly better — tags cannot be moved
by accident — but it is not available from here.

- [ ] **Delete three branches — Aaron approved, and only he can do it.** The same
  403 blocks ref *deletion*, and there is no delete-branch MCP tool, so this
  cannot be done from a session. GitHub → **Code** → the branch dropdown →
  **View all branches** → the bin icon on each of:
  `claude/session-ge7fso` · `claude/song-vote` · `feat/play-slice`.
  All three are safe: the first two have **0** commits main does not already
  have, and `feat/play-slice`'s six now also live on `archive/origin-v0`.
- [ ] **OPTIONAL — upgrade the archive to a real tag.** GitHub → **Releases** →
  **New tag** → name `origin-v0`, target `archive/origin-v0`. Then the archive
  branch can be deleted too. Only worth doing if Aaron wants the stronger
  guarantee that the marker can never move.
- **Honest limit on the safety check:** filenames and the two decision docs were
  compared line by line. The 245 prose lines that differ in the old `game.js`
  were not read individually — prototype code superseded by a 6,521-line file.

### Branch protection on `main` — APPROVED, waiting on Aaron to click it

`main` is `"protected": false`. Nothing on GitHub's side stops a direct push to
the live site; the pull request is a habit, not a wall.

**Aaron approved turning it on, 2026-08-05.** It is still open because **no tool
in this session can set it** — the GitHub MCP server has no branch-protection or
ruleset method, and there is no `gh` CLI or direct API access here. It is a
settings page only Aaron can open.

- [ ] **Turn on branch protection for `main`.** github.com/aselkridge/ball-knowledge
  → **Settings** → **Rules** → **Rulesets** → New branch ruleset (older repos may
  show **Settings** → **Branches** instead). Target `main`, then:
  - ✅ Require a pull request before merging
  - ⚠️ **Required approvals must be 0.** GitHub will not let you approve your own
    pull request, so setting 1 while working solo locks Aaron out of his own
    repo. This is the one setting that can go badly wrong.
  - ✅ Block force pushes · ✅ Restrict deletions
  - ❌ Do NOT require status checks — nothing runs on GitHub's side. All 474
    checks run locally. Requiring a check that never reports would block every
    merge forever.
  - Leave the bypass list **empty**, so the rule applies to Claude too. That is
    the entire point of turning it on.
  Verify afterwards with `list_branches` — `main` should read `protected: true`.

### The Tape — known limits after the 08-04 pass

Six asks came back from one sitting (sort · hide columns · a query sample · SQL ·
a coach · a replay button) and all six shipped, with 56 checks in
`tools/tape-check.mjs`. These two are what it still cannot do. Neither blocks
anything today; both are here so nobody rediscovers them as bugs.

- [x] ~~**The Tape cannot count or group.**~~ ✅ **DONE 08-04**, the same day it
  was filed. It said "do it only if Aaron asks a question the ▾ cannot answer" —
  he asked a better one: why the screen claimed the tables were not a database.
  Counting was the honest gap behind that sentence. `+ count them up` in the
  builder, `count by col` in the query, `GROUP BY`/`COUNT(*)` in SQL. Still no
  `OR`, `HAVING`, subqueries or SUM/AVG/MIN/MAX, and the hint on screen now lists
  those as the TRANSLATOR's limits rather than denying the data model.
  First thing it found: 191 distinct `category` values across 1,526 cards.
- [ ] **`source_register`'s nested rules print as raw JSON.** The table is now in
  The Tape (it was missing entirely until 08-04), but a site's `sections` is a
  list of objects and renders as `{"match":"/players/","tier":1,…}` in one cell.
  Readable, ugly, and the only table in the repo shaped this way — 14 rows.
  **Safe today**: it is legible and nothing reads it programmatically from the
  browser. Type C. The fix is either a nested sub-table on click or a flattened
  `source_register_sections` link table, and the second is the one TABLES.md's own
  rules would pick. Count the offenders:
  `python3 -c "import json;d=json.load(open('docs/play/data/tables/source_register.json'));print(sum(len(s.get('sections',[])) for s in d),'section rules across',len(d),'sites')"`

- [x] ~~Create a free render.com account~~ ✅ DONE — relay live on Render.
- [x] ~~Menu design comps~~ ✅ DONE — design language established and shipped.
- [x] ~~First sourced-art drop~~ ✅ DONE — court scenes (12 looks), the logo
  pack (9 finalists), the ball-less Philosopher, arena backdrops.
- [x] ~~Logo verdict~~ ✅ DONE — full brand cast shipped 07-27 (#48 icon ·
  #76 share card · #56 loading · #64 victory).
- [x] ~~Era list approval~~ ✅ DONE — era multi-select shipped (v0.10).
- [ ] **BLACK FIVES: THE LABEL** (Aaron 07-28, HIGH — matters to him personally).
  Interim label **"Early Black Basketball"** SHIPPED 07-28 (Aaron's pick); no
  player-facing surface says "Negro Leagues" any more. Remaining: send
  BLACKFIVES-OUTREACH.md, and if the Foundation says yes, swap the label to
  "Black Fives Era" + an on-screen credit (one line). The internal tag is now
  `fives` — the word is gone from the codebase.
- [~] **WOMEN'S BASKETBALL BEFORE THE WNBA** — H1 RESEARCH DONE 07-28, awaiting
  Aaron's review: docs/play/data/research-h1-women-prewnba.json. 20 verified
  facts + a 7-period era model (origins 1892 · industrial · AAU dynasties ·
  AIAW · WBL · ABL · WNBA). Three decisions needed before merge: do pre-1997
  players become draftable, does the WNBA era picker gain the earlier periods,
  and does AIAW/AAU material belong under 'college' instead.
- [ ] **MORE BIG3 QUESTIONS** (Aaron 07-28) — the BIG3 pool is 77 own cards, so
  with strict league scoping a BIG3 game now runs ~69% league-neutral and feels
  generic. Audited 07-28: the 77 are all genuinely BIG3 (rules, history, its own
  rosters) and the NBA references in them are the good kind — the pool isn't
  wrong, it's just small. Target ~150 own cards, weighted to t1/t2 (thinnest at
  17 and 8).
- [ ] **OFF-COURT MINING RUN** (Aaron 07-28) — spec in §6 · 22p.
- [ ] **ERA TAGGING RUN** (Aaron 07-28) — spec in §6 · 22q; blocks era-scoped
  questions, which do not exist today.
- [x] ~~**NEW MUSIC**~~ ✅ DONE 08-01 · 22x — Aaron sourced eight Ketsa tracks
  (*Concrete Flowers*, CC BY 4.0) and cast six of them to a moment. The MacLeod
  set is deleted from the repo and from the rulebook credit. The 56-second-loop
  problem is gone with it: the shortest new track is 2:32.
- [x] ~~Scoreboard reference art~~ ✅ DONE 07-27 — n-7 HUD + n-8 jumbotron
  picked, tuned, and landed in docs/play/assets/scoreboard/ (entry 65).
- [ ] **Real players vs original archetypes** (Open Q #1) — must be decided
  before collectible-figurine art (AL-2).
- [ ] Test-kitchen verdicts each round: is the loop fun? Best/worst mechanic?


### 22p · OFF-COURT: "what they're known for outside the game" (Aaron, 07-28 — spec'd, not built)

A toggle on the **league select** screen — *Off-Court: on/off* — that mixes in a
pool of questions about what players are remembered for AWAY from basketball:
acting, music, business, activism, the famous commercial, the second career.

- **Deliberately cross-league.** These are PLAYER-specific, not league-specific,
  so `l` is the wrong axis for them. New field `off:1` on the question, and the
  gate treats it as a separate opt-in dimension: `leagueOk(q) || (OFFCOURT && q.off)`.
  A Shaq question rides with NBA, WNBA or BIG3 alike if Shaq is relevant there —
  the point is the person, not the jersey.
- **Must still respect the league the player belongs to** so a WNBA room doesn't
  get an all-NBA off-court set: tag each off-court question with the player's
  home league(s) too (`l` can stay), and let the toggle only ADD to the pool,
  never replace it. Off is the default; the toggle is the whole feature.
- **Mining brief:** for each player already in the 744-player DB, research the
  one thing they're known for off the court, with a verifiable source, and only
  keep the ones that are genuinely famous (the rule from the existing bank: no
  trivia nobody could reasonably know). Expect this to skew heavily to the
  big names — that is fine, it is a flavour pool, not a difficulty ladder.
- **Tone guardrail:** celebratory, never gossip. Business, art, service,
  the second act. Nothing about legal trouble, health or family drama.

### 22q · ERA-SCOPED QUESTIONS (Aaron, 07-28 — answered + spec'd, not built)

**The answer to Aaron's question: no, they are not scoped, and today they
cannot be.** Era/decade selection currently drives ROSTERS ONLY (`pickRosters`
/ `pickSquad`). Question objects carry `{t,l,cat,q,c,a,src,v}` — there is no
era, decade or year field on a single one of the 1,526, and no question draw
consults `state.decade`. So picking the '90s can hand you a Luka Doncic card
today. Same class of unfairness as the league leak, one axis over.

The fix Aaron described, and it's the right shape: scope by era only where era
is meaningful, which is **player-specific questions**. "How many rings does
Jordan have" belongs to the '90s; "how many points is a free throw" and "who
invented basketball" belong to everyone.

- **D1 RULED (Aaron, 07-29): rule A for PLAYERS, fact-dating for QUESTIONS.**
  Players carry every decade they played — "I cannot take LeBron out of their
  eras... it would be crazy to be doing the 2020s and be unable to get LeBron."
  Rosters deal by rule A, full stop.
- **D2–D7 RULED (Aaron, 07-29):**
  · **D2 — Pre-1997 women become DRAFTABLE, marquee only** ("marquee means the
    greats"): the shortlist class of Lusia Harris, Nera White, Ann Meyers,
    Nancy Lieberman, Lynette Woodard, Cheryl Miller, Teresa Edwards, Pearl
    Moore, Hazel Walker — accolade-carried (pre-1978 box scores mostly don't
    exist), gated on V3 verification before any record ships.
  · **D3 — "BEFORE THE W" ships as one era.** DOCUMENTED DEFINITION (per
    Aaron's requirement to note what it includes and when it starts): it BEGINS
    with Senda Berenson's Smith College game (1892) and ENDS at the WNBA's
    first tip (June 21, 1997). It contains the origins era, company/AAU ball,
    the AIAW, the WBL, the 1982–95 wilderness, and the ABL — the ABL is
    included whole (1996–98) as the rival that bridged into the W, so its
    1997-98 overlap lives in "Before the W", not in the WNBA era.
  · **D4 — H1 material splits by WHAT THE QUESTION IS ABOUT:** college-era
    subjects (AIAW, AAU college teams, Lusia at Delta State) → `college`;
    pro and national-team subjects (WBL, ABL, Olympics, barnstormers) →
    `wnba`. ~~One league per question, no double-counting.~~ **SUPERSEDED by
    D8 (2026-07-31)** — a fact may now carry several leagues. The rest of D4
    stands: a fact's leagues are decided by what it is ABOUT.
  · **D5 — Edmonton Grads → `world`; All American Red Heads + Hazel Walker's
    Arkansas Travelers → `street`.** PRINCIPLE Aaron surfaced with the Raptors
    point: **league tags mean the COMPETITION, never the country.** Toronto is
    NBA; the Grads are `world` not because they're Canadian but because their
    competition (FSFI world titles, Olympic exhibitions) was international;
    the Red Heads/Travelers are `street` because barnstorming vs local men's
    teams IS the Globetrotters lineage.
  · **D6 — HONESTY ABOVE ALL on the tier economy:** fix V12 the honest way
    even if it costs research — an evidence-based audit of the 99 superstars
    (demotions only with justification) plus deep-bench growth via P2/P3.
    Pack odds stay untouched until the pyramid is honest.
  · **D7 — PLAYER RATINGS ARE COMING.** Aaron: "Why have Steph Curry if he
    can't do anything for you." Consequences: S6 (per-era stat packages,
    totals-not-rates) and S4 (the bpg hole) are now MANDATORY prerequisites,
    and per the 22t principle the ratings formula gets an EXECUTABLE SPEC
    (ratings-spec.mjs) adversarially tested before any engine code.
  · **D8 — A FACT CAN BELONG TO SEVERAL LEAGUES. This SUPERSEDES the "one
    league per question, no double-counting" clause of D4** (D4's actual
    subject — which league a question is ABOUT — still stands; only the
    one-league limit is lifted). Aaron's case: "What was the first year the
    WNBA and NBA both participated in All-Star Weekend together?" belongs to
    both. 80 facts are currently filed under one league while plainly being
    about another — the Larry Brown NCAA-and-NBA fact is filed `college`, so an
    NBA game never sees it. Delivered by the `fact_leagues` table.
  · **D9 — AN ERA BELONGS TO A LEAGUE.** Aaron's idea. A 1990s WNBA and a 1990s
    World are different things, so `era_id` is `nba-1990s`, not `1990s`. The
    point is that it stops bad data being TYPEABLE rather than merely
    detectable: `nba-1910s` is not a row, so the three Original Celtics
    (Dehnert, Lapchick, Holman — tagged NBA + 1910s, before the NBA existed)
    cannot be filed there. `league_id` is nullable for the 38 universal facts
    that carry a decade and no league ("who invented basketball in 1891").
  · **D10 — THE DATA BECOMES TABLES. Full spec: `TABLES.md`.** Aaron: "I want
    to start with a table restructuring... I dont want to do anything else,
    until everything is structured the way it should be, not just pages of
    information." 21 tables with real keys. The rule underneath all of it: A
    COLUMN HOLDS EXACTLY ONE VALUE, so anything a person can have several of
    gets its own table. That is not theory — `players.json` has a single
    `league` column, so Earl Lloyd is in the file twice as two strangers, and
    nine people are split that way.
  · **D11 — POSITION AND QUALITY CHANGE OVER A CAREER.** Aaron caught me
    applying D10's rule to leagues and eras and then leaving `position` and
    `quality` as plain columns two fields later. Every player has exactly ONE
    position today — Magic Johnson is filed `PG`, the man who played centre in
    the 1980 Finals — and 189 people span 3+ decades on a single quality
    rating (Iverson is `superstar` across the 1990s, 2000s AND 2010s). Both
    become link tables, both with a nullable era. Written NULL on first build,
    meaning "not yet broken down", because writing today's single value onto
    every era would assert things we know are false.
  · **D12 — ACCOLADES SPLIT INTO TWO TABLES, NOT ONE.** Aaron asked whether
    every accolade can be split; the answer is no, and it changed the design.
    Only ~55% are awards. The other ~44% is prose that columns would destroy
    ("Mustachioed mid-major folk hero of the mid-2000s"). So: `person_awards`
    (countable, one row per award per person) + `person_notes` (kept verbatim).
    Award years get their own rows — of 592 count-style accolades only 153
    list years, and 57 of those cross a decade boundary; the other 439 can be
    counted but NOT filtered by era, and the UI must say so.
  · **D13 — THE SQUAD FILL ORDER SHUFFLES.** Consequence of D11: the dealer
    walked the lineup in FIXED order (PG,SG,SF,PF,C) and only the star slots
    were shuffled, so the first slot always got first refusal on any
    multi-position player. Aaron chose shuffling the fill order over filling
    the thinnest bucket first — truer to what versatility should feel like,
    and depth is better solved by having more players than by rigging order.
    **CORRECTION, and it matters because Aaron decided on the strength of it:
    I told him the fixed order meant Magic would "land at PG on nearly every
    deal and essentially never at centre", leaving C the leftovers drawer.
    THAT WAS WRONG.** Measured, by giving one player two positions and dealing
    thousands of squads:

        NBA   (deep buckets)  fixed 52/48  ->  shuffled 52/48
        BIG3  (PG 8, C 6)     fixed 55/45  ->  shuffled 52/48
        BIG3, 2010s only      fixed 55/45  ->  shuffled 50/50

    Being considered FIRST is not the same as being TAKEN: he is one of ~82
    point guards, so he usually is not picked at PG and stays fully available
    for C. The real bias is a few percentage points in thin buckets, not the
    collapse I described. The change is kept because it is strictly fairer,
    costs nothing, and 0 duplicate/incomplete squads across ~12,000 deals —
    but it is a small correctness win, NOT the fix for a broken feel.
    (LEARNINGS LOG #18: measure the bias before describing its size. I reasoned
    "filled first therefore wins" and never checked the arithmetic.)
  · **D14 — FACTS GET `confidence` AND `date_checked`.** The asymmetry was
    backwards: 121 PEOPLE carry a confidence rating and NO FACT does, when
    facts are the things citing 1,326 sources that do not exist. Not the same
    axis as difficulty — difficulty is how hard the question is, confidence is
    how sure we are it is true.
- **THE BECAME-TRUE RULE (the solve for Aaron's era-leak concern):** a question
  is tagged with the decade its ANSWER BECAME TRUE — never inherited from the
  player's span. Drafted-2009 player in a 2000s game: his 2009 draft question
  rides (fact = 2000s), his 2016 Finals MVP question does not (fact = 2010s).
  Jordan's sixth ring = a '90s question that does NOT follow him into 2000s
  games via the Wizards years. Corollaries: facts that genuinely span decades
  get multi-tags (e:["2000s","2010s"]); streak/aggregate facts tag their
  COMPLETING decade; current-state volatile questions ("plays for which team",
  as-of-now totals) tag the CURRENT decade only — a 2000s game can never ask
  about a player's present-day totals. Evergreen stays untagged (~42%).
- ✅ **ENGINE HALF SHIPPED 07-29** — `eraOk()` lives next to `leagueOk()` and is
  ANDed into `pickQuestionIdx` (both the main pool and the reset pool). The era
  selection now rides in `state.eras`, which is the actual bug fix: it used to
  exist only at setup time and drive rosters, which is precisely why picking the
  '90s could still hand you a Luka card. `packTotal(lg,packs,eras)` gained the
  era term and is memoised per (league|packs|eras). Harness-proven in
  `tools/tests/`: a 2020s card is locked out of a 1990s game, an untagged card
  still rides, a card tagged ["1990s","2000s"] rides on either, and the counter
  drops 742 → 375 when you pick the '90s and climbs to 426 when you add the '00s.
  Netcode-safe: the era selection already travelled in the house-rules payload
  (`decade`), so both phones gate identically.
- ✅ **DATA HALF SHIPPED 07-29** — `tools/era-tag.py` tagged 1,102 cards with
  `e:` and 883 with `p:`; 173 correctly evergreen; 251 queued for lookup in
  `docs/play/data/era-tag-lookups.json`. Pool depth verified: every league x era
  combo holds 133+ cards. The engine half (eraOk in the gate, the counter's era
  term, the 22r picker) is next.
- **Data first (a mining run, not a code change):** add `e:` per the became-true
  rule. Omitted = always eligible, exactly like `l:"any"`. Note the cost: cards
  naming multi-decade players cannot inherit era mechanically — the FACT's date
  decides, though most such facts carry their date in the stem.
- **Future polish (filed, not urgent):** era-sliced player-card stats — a 2000s
  game dealing LeBron ideally shows his 2000s line, not his 2026 career line.
  players.json peak-season data makes this possible someday.
- **Then the gate:** `eraOk(q) = !q.e || decadeSelected(q.e)`, ANDed with
  `leagueOk`. FULL KNOWLEDGE (the default) skips the check entirely.
- **Check the pools before shipping it**, the same way the league tightening
  was checked: multi-select eras make thin combinations possible (one decade +
  a small league). If a combination can't fill a tier, the honest fix is to
  say so at era-select, not to silently widen — widening is precisely what
  broke league scoping.
- **The LED counter survives era scoping — it's the instrument FOR it (Aaron +
  ruling, 07-29).** Aaron: the counting numbers "really do a lot for the game"
  but "Era has to mean something!" Resolution: the counter is a live count over
  the gate, so it gains the era term — `count(league + packs + era)` — and
  follows the flow onto the era screen, dropping visibly when an era narrows
  the pool. That drop IS era meaning something. ~42% of the bank is evergreen,
  so no major combo collapses ('90s NBA ≈ 489, '60s NBA ≈ 348 of 736).
- **Targeting weights, never filters (ruling, 07-29).** Player-specific /
  roster-targeted questions (playtester ask, agenda 7) BIAS the draw within the
  counted pool; they never restrict it. The counter counts what CAN appear at
  setup (rosters aren't dealt yet); targeting shapes what DOES appear in play.
  This keeps the LED honest forever, no matter how smart the draw gets.

## 5b · THE BIG DIRECTION (Aaron, 2026-08-06) — not V0, not dropped

Two ambitions, stated by Aaron and written down the same day so they cannot be
lost. Neither is V0 scope. Neither is started. Both are post-FL-6.

### 5b.1 · The knowledge base — COMPLETENESS, not size

> **THE MOAT CLAIM IS SUPPORTED, measured 2026-08-07 (V29 run, question 1).**
> Nobody in the basketball data field publishes per-fact provenance of the form
> we carry: source + source-quality tier + confidence + the date a human read
> it. Wikidata comes closest and stops at references plus a retrieval date, with
> no tier and no confidence. Wikipedia proves published source TIERING works but
> attaches it to a publisher, never to a fact. Sports Reference publishes a
> completeness ledger, which is metadata about what is MISSING rather than
> provenance for what is there.
>
> **Confidence: MEDIUM, and the wording on any public page should respect that.**
> This is a negative finding from a broad but not exhaustive search: 24 sources,
> 120 claims extracted, 25 verified, 13 confirmed and 12 killed. "Nobody else
> does this" is fair to believe and not yet fair to state as proven.
>
> The practical consequence for the coming-soon page: its current wording is
> about the PLAYER experience ("deep cuts you will not find in another
> basketball game") and makes no provenance claim at all, so it needs no change.
> If a provenance claim is ever put in front of players, it should be phrased as
> what we do, not as what nobody else does.


Aaron: *"I want to see if we can become the largest, most cohesive most
extensive aggregate database of basketball knowledge available online, spreading
across leagues, history, and more."* Then, correcting me the same day: *"I want
A LOT of data (not going for largest, I get that), but I don't want any rules
history missing, I don't want any leagues history missing, and ALL major events
and history in basketball."*

**I got the framing wrong first and the correction is the important part.** I
said "don't try to out-size Basketball-Reference", which is right, and then
let that slide into "stay small", which is wrong. They are different targets:

| | Basketball-Reference's game | Ours |
|---|---|---|
| unit | the ROW — every box score, every game log, every play | the ENTITY and the EVENT — every rule change, every league, every All-Star, every title |
| size | effectively unbounded, tens of millions | **finite and enumerable** |
| can it ever be "done"? | no | **yes — that is the whole point** |

The domains Aaron named are *closed sets*. There is a countable number of NBA
rule changes since 1946. A countable number of leagues that have ever existed. A
countable number of All-Star selections, champions, Finals, Olympic
tournaments, expansions, relocations, mergers and lockouts. **"Complete" is a
reachable state for those, and nobody has reached it in one structured place.**
That is not a smaller ambition than bbref's. It is a different axis, and on that
axis being finished is possible.

Order-of-magnitude, to be replaced by the real counts when V28 runs: entities
and events in the low tens of thousands, not the tens of millions. Ambitious,
bounded, and — unlike a row count — defensible against a site with a 25-year
head start and licensed feeds.

**What we already hold that nobody else publishes:** a source tier, a confidence
level and a date-checked on every single fact. Wikipedia has citations without
tiering. bbref has authority without per-row provenance. The differentiator is
not volume, it is **provenance at fact level** — and it is already built.

**Where the current machinery does NOT reach, and this is the honest gap.**
`verify-batch.py` is a PROVING tool: one claim, one page, one careful read. It
is the right tool for "is this card true" and the wrong tool for "acquire every
rule change since 1946". Completeness needs an ACQUISITION pipeline — bulk
structured extraction into the tables, with the same tier/confidence discipline
applied on the way in. That does not exist and would need building. Naming it
now so nobody plans the ambition assuming the current tools scale to it.

### 5b.1a-2 · CONSTRAINT FOUR: WHAT THE DOCUMENTS ACTUALLY SAY (V29 Run B, 2026-08-07)

**STATUS: UNPROVEN.** The return is filed at
`docs/play/data/research-v29b-licensing.json` — 30 terms rows, 72 law rows, 94
documents read, 8 unreachable and each one recorded as such. **Not one quoted
clause has been re-read at its URL yet**, which is step 1 of the prove pass in
`design/V29B-brief.md` and the only check that cannot be skipped, because a
research tool can quote a cached copy of a page that has since changed. Treat
everything below as *what a careful reading found*, not as settled. **It is not
legal advice and must never be described as any.**

Constraints 1 to 3 above are Aaron's, about how we acquire. This fourth one is
the documents', about what we may acquire from, and it is a constraint of the
same kind: **a licence finding is never a fact for the bank.**

#### The shape of it, in one table

| | verdict | rests on |
|---|---|---|
| **Cite one page to prove one card** — what we do today | **permitted** on 17 of 30 rows | SR's own guiding principle 1: *"sharing, using, modifying, repackaging, or publishing data found on individual SRL webpages is welcomed, whether for commercial or non-commercial purposes"*, conditioned on credit, which every card already carries |
| **Extract facts into our own database** | **restricted** on 13, prohibited on 2 | the automated-means and AI clauses below |
| **Aggregate at scale** | **prohibited** on 8, restricted on 7 | SR § 5(i): a database that *"competes with or constitutes a material substitute"* |

**The clause is a SUBSTITUTION test, not a volume test, and that distinction is
the whole defence.** A trivia bank of discrete cited facts is not a substitute
for basketball-reference.com. A mirror of their season tables is. State it in
those terms whenever it comes up.

#### THE THREE FINDINGS THAT CHANGE WHAT WE DO

**1. The AI clause, and it describes this project's own method.** SR's terms bar
using their Content *"for purposes of training, fine-tuning, PROMPTING, or
INSTRUCTING artificial intelligence models or technologies in any manner,
including without limitation for purposes of (i) generating answers, text,
scores, statistics"*. Reading a b-ref page into a model to write or check a card
is, on the document's plain words, inside that clause. It is newer than every
scraper in the never-enforced record (last updated 19 May 2023), so the comfort
of "nobody has ever been sued" does not reach it. **Open question the run could
not settle: does it reach a HUMAN who reads the page and writes the card in
their own words?** That reading is the project's likely position and it needs
Aaron's decision, not a default.

**2. Wikidata under CC0 is a real, sanctioned, uncapped bulk route** — the
single most useful thing the run returned. *"All structured data from the main,
Property, Lexeme, and EntitySchema namespaces is available under the Creative
Commons CC0 License."* No volume cap, no non-commercial limit, no share-alike,
no anti-substitution clause; attribution is requested, not required. Weekly JSON
dumps and a public SPARQL endpoint, both intended for bulk.
**What it can carry:** the spine of `players.json` — names, dates, teams with
spans, draft, awards — and, decisively, the **external-id crosswalk** (b-ref
slug, NBA.com id), which is the cheapest lawful way to join our records to
restricted sources without fetching a page from one.
**What it cannot carry, and this must not be over-read:** the stat line a card
turns on. CC0 licenses the data and warrants nothing about it. **Wikidata is a
legally free INDEX, not a citable authority** — cards still get proved against
the references its statements cite, under the existing tiers. It also says
nothing about images; CC0 covers the statement naming a file, never the pixels.

**3. Wikipedia's facts are free of even attribution**, which disposes of the
database-right theory every restrictive holder leans on. WMF ToU § 7: *"Where
you own Sui Generis Database Rights covered by CC BY-SA 4.0, you waive these
rights. As an example, this means facts you contribute to the projects may be
reused freely without attribution."* The condition is a writing discipline, not
a negotiation: **facts in, our own sentences out.** Copying prose would drag a
bulk export of our own bank under BY-SA.

#### WHAT THIS DOES TO THE PLAN

- **V32 survives, in a narrower shape.** Mining 158 already-trusted pages one at
  a time, by hand, at the published ceiling, to prove specific cards, sits
  inside principle 1. Crawling them into a table does not. V32 is the former and
  was always written as the former.
- **Wikidata moves from "not considered" to a Track A candidate**, but gated on
  a coverage measurement nobody has made: the recommendation rests on what the
  LICENCE permits, not on what the data contains.
- **The honest hole:** government archives, out-of-copyright newspapers and
  official league record books were **not researched at all** — no row touches
  them. That is the highest-value next search in the project, because a pre-1930
  newspaper archive carries the Black Fives and early-league material where
  Wikidata is thinnest and no commercial holder has a claim.

#### THE HARD LIMITS, as published ceilings rather than opinions

- **20 requests/minute** on any sports-reference.com site, 10 on FBref and
  Stathead, *"regardless of bot type and construction and pages accessed"*, with
  a 3-second crawl delay in robots.txt agreeing. Violation is a block of *"up to
  a day"*. `tools/season-sweep.py` runs at 1.5s, inside it.
- **Wikimedia, 2026:** 10 req/min unidentified, 200 with a compliant User-Agent,
  3 concurrent connections.
- **`stats.nba.com` publishes no terms at all** — 301 to a 404 — and blocks
  datacenter IPs wholesale. Two requests from this machine hung to full timeout
  with zero bytes while the HTML site returned 200 in the same minute.

#### TWO THINGS TO NEVER SAY

- **Never quote "nobody has ever been sued" as permission.** The absence of an
  enforcement record measures RISK, not RIGHTS, and it says nothing about the AI
  clause, which postdates every project in that record.
- **Never describe any of this as legal advice.** It is a record of what
  documents say, quoted and dated, so Aaron can decide.

The full do-not-do list is 20 items and lives in the JSON rather than being
copied here, because a second copy is a second thing to go stale.

### 5b.1a · THE THREE CONSTRAINTS ON ACQUISITION (Aaron, 2026-08-06)

Stated when the acquisition idea was first written down, so nobody later reads
"more data" as "looser data".

**1. Scale the FIND stage. Never skip the PROVE stage.** Aaron: *"we need
research runs focused on acquisition, but that does not mean sacrificing
verification and quality, because trust is the biggest factor in the game."*
The find → prove → merge pipeline in DEEPRESEARCH_KNOWLEDGE.md is not a
bottleneck to route around; it is the product. Acquisition means the first
stage gets bigger, not that the second gets optional. `audit.py` gates every
merge either way.

**2. A CONTESTED fact must say so, to the player — and that is a NEW field.**
Aaron: *"Facts involving questions CANNOT be wrong, and if they have something
that is more ambiguous or up for debate, it's clearly indicated as such."*
Note this is **not** what `confidence` means, and conflating the two would be a
real bug:

| field | question it answers | example |
|---|---|---|
| `confidence` | how well sourced is this? | one Tier 2 link = `medium` |
| `contested` *(new)* | do good sources DISAGREE? | pre-1950 statistics; early Black Fives records; some Wilt game details |

A fact can be `high` confidence and still contested — two Tier 1 sources that
flatly disagree is *well sourced* and *unsettled* at the same time. Today the
bank has no way to say that, and a quiz that asks a disputed question as if it
were settled is the fastest way to lose the trust the whole project runs on.
Two decisions Aaron still owes: does a contested card get **asked at all**, or
only shown in The Tape? And what does the marker look like to a player?

**3. Full stats for a defined subset — and "impact" is its own axis.** Aaron:
*"I do in fact want all the stats for a subset of players and that means Super
Stars, all stars, and any and all players that have had significant impacts on
the game, this includes the Jeremy Lins and the Tracy McGradys too."*
The subset is not just the top tiers. Today: 111 superstar + 267 allstar = 378,
against 230 starter / 185 role / 45 deep. **Jeremy Lin is not a superstar by any
career average and obviously belongs in.** So `impact` is a separate opt-in flag
that cuts ACROSS tier, exactly like `off_court` already does.

**CORRECTION, 2026-08-06 — I first wrote that promoting Lin would "corrupt the
pack-rarity economy", and that was overstated. Aaron asked why, I checked, and
two of the three things I was leaning on turned out to be wrong.**
- **Rarity is coupled to `superstar` specifically**, not to tier generally:
  game.js:5169 defines rarity as *"2 superstars · a real one-two"* and the help
  text says *"rarity = how many superstars you land"*. So promoting anyone to
  **superstar** really does move the economy. Promoting to **allstar** does not,
  or not much.
- **Tier is a POWER BAND, not a factual claim** — I had implied calling Lin an
  "allstar" would be a data lie. It would not. Measured: **142 of the 267
  allstar-tier players carry no All-Star accolade at all**, and they are mostly
  college players (Ann Meyers, Bill Bradley, Christian Laettner) from a level
  that has no All-Star game. The tier never claimed literal selection.

**So the real reason for a separate flag is simpler and less dramatic: tier is
the wrong tool for the job.** Tier answers *how good, how rare*. The stats
question is *how deeply do we research this person*. Those are orthogonal — you
can want full stats for a role player who mattered (Lin) and not want them for
an obscure college all-timer. A flag is right because it is a different
question, not because the economy would break.
Still undefined and needed before any run: **what "all the stats" means.**
Career splits only (what we store now), or season-by-season, or playoffs too, or
advanced? Season-by-season for ~400 players at ~15 seasons × ~25 fields is
roughly 150,000 values — tractable, but it is bulk extraction from bbref and
therefore lands squarely on the licensing question in V29. Answer V29 first.

### 5b.2 · The Tape, third tab: ask it in English

Aaron: *"a third tag to 'the tape' where it can work with an LLM to take in
natural language requests and return that data with tier level and confidence
level, referenced sources and everything asked for … 'please give me all of Dell
Curry's +30 games in the 90s decade' … or tells them if the data is not
available and why. And then we get a backlog of research tasks based on
additional research people are asking for."*

**THE ONE ARCHITECTURAL RULE, and everything depends on it: the model must never
supply a fact.** If it answers about Dell Curry from its own memory, we have
built a machine that emits confident unsourced basketball claims — the exact
inverse of this repo. The only safe shape is text-to-QUERY:

1. model reads the schema (TABLES.md) + the question
2. model emits a **query**, not an answer
3. our code runs it against the tables — deterministic, no model in the loop
4. results render with the tier / confidence / source columns that already exist
5. query not expressible against the schema → *"we do not hold this, and why"*, logged

**Step 5 is the best idea in the whole proposal, and it is worth more than step
3.** A log of what people asked and we could not answer is a research roadmap
written by DEMAND instead of by our guessing. Today's backlog is things Aaron
noticed and things Claude noticed. That log would be ranked by how often real
people want it — and it is exactly what tells 5b.1 which direction to grow.

**Measure before building — the answerability rate.** Dell Curry's 30-point
games are not answerable today and not because of a missing feature: **we hold
no game logs at all.** 1,526 question facts and 838 player records of career
averages. Before any of this is built, write ~50 realistic queries and hand-
classify what our schema could serve. If it is 10%, the tab is a
research-backlog generator wearing a data-browser costume — possibly still worth
it, but it must be NAMED that, because a tab that says "we don't have that" nine
times in ten reads as broken rather than as rigorous.

**Two costs that are easy to miss.** It breaks "no backend, static on Pages" — an
LLM call needs a server and a key, so rate limiting is not optional (Render
already hosts the rooms server). And logging queries to build the backlog means
storing what people typed; fine, but as a decision, not a side effect.

## 6 · Open design questions

### THE PLACES: a walkable gym, a room, and a town (Aaron, 2026-08-08)

He prefaced it with *"typically I would be nervous to share such a gigantic
idea."* It is gigantic. It is also **far more buildable than it sounds**, and
the reason is worth stating first because it changes what the work actually is.

#### WHAT HE DESCRIBED HAS A NAME

> *"you could not fully walk through the room, but you could click to the right
> and the person would move forward and then go to the right into that spot. And
> then you could click back. Or you could click the rim, which you would see
> straight ahead."*

That is a **node graph of still images**, the structure every point-and-click
adventure from Myst onward has used. Not 3D. Not a game engine. It is:

    a NODE   = one viewpoint (one image, or one framing of an image)
    a HOTSPOT = a region on that node + which node it takes you to
    a MOVE   = a transition between two nodes

**The engine for this is small.** A few hundred lines: a node table, hotspots as
percentage rectangles so they survive any screen size, a transition, a back
stack, and a preloader. That is the same order of work as the Daily Five, which
took about a day. **The engine is not the project.**

#### THE PROJECT IS THE ART, AND THERE IS A TRICK THAT CUTS IT BY MOST

Naively, every viewpoint is its own image. Count his description: the gym facing
in, the rim, the desk with the Rulebook, the weight room, plus the way back from
each. That is six or more images for ONE room, and the room has to look like the
same room in all six, which is exactly what AI image generation is worst at.

**So do not generate a viewpoint per node. Generate ONE VERY WIDE IMAGE and move
a camera inside it.** "Walking to the rim" becomes a CSS transform that pans and
zooms into that part of the picture. This is better on three counts at once:
1. **Consistency is free.** It cannot look like a different room, because it is
   literally the same pixels.
2. **You SEE the movement.** A crossfade between two stills says you teleported.
   A push-in says you walked.
3. **One image instead of six**, per room.

The honest limit: you can only push in so far before it goes soft. So the shape
is a **hybrid**: one wide base image per place, plus a small number of DETAIL
images for the two or three spots where the player has to read something, like
the desk with the Rulebook on it. Call it **one wide plus two or three details**
per room rather than six flats.

#### THE ART BILL, COUNTED RATHER THAN GUESSED

| Place | Wide base | Detail nodes | Notes |
|---|---|---|---|
| The Gym | 1 | 2 or 3 | the rim, the desk/Rulebook, the weight corner |
| Your room | 1 | 3 | the bed, the trophy shelf, the TV and console |
| The town | 1 top-down | 0 | buildings are hotspots on the one image |
| The time machine | 1 exterior is IN the town | 1 or 2 interior | |

**Roughly 4 wide images and 8 details for a first version.** Twelve pictures,
not sixty. That is a real budget and a finishable one.

#### "DO I GO FIND THAT STUFF ELSEWHERE?" NO. YOU ALREADY HAVE THE PIPELINE.

This is the third option again, the one this project keeps forgetting: **it
already exists.** `design/COURT-SKINS.md` is a working prompt system, Adobe
Firefly is already the generator (`PLACES.md`), the Drive folders are already
set up, and **27 court images already came through it.** The style is already
locked and already in the game, so the gym and the room can be told to match
courts that ship today.

So the division of labour is the one that already works:
**Claude writes the prompts · Aaron generates and picks · Claude composites.**
Nothing new to buy, nobody new to hire, no tool to learn.

#### THE TOWN IS A DIFFERENT AND EASIER PATTERN

> *"a town where you are looking from a top down view at your character, and you
> could click on the gym, you could click on your house, and the character would
> walk there."*

One image, a handful of named points with x/y, and a sprite that tweens between
them along a path. **That is easier than the rooms**, because there is no
camera and no viewpoint problem, and it needs exactly one picture. The character
is the only new art, and a top-down figure is small and can be a handful of
frames.

**The era idea lands here perfectly.** A town that is *"this weird interplace
between all the eras"* with one time machine building is a much better frame
than time travel scattered through the whole mode: the weirdness is quarantined
to one building, and everywhere else is just a place you live. That is the
version of the sci-fi that cannot embarrass the rest of the game.

#### WHAT I WOULD DO ABOUT IT, IN ORDER

1. **A SPIKE FIRST, with art we already own.** Build the node engine and point it
   at an image already in the repo, and find out whether a push-in on a phone
   feels like walking or feels like a zoom. **Half a day, no art commissioned,
   and it de-risks the only part that could be a dead end.** If it feels wrong
   we have lost an afternoon rather than twelve pictures.
2. **Then one room for real**, the Gym, wide plus two details, as a vertical
   slice. If the Gym works the room and the town are the same machine.
3. **Then the town, then your room.**

#### THE SPIKE RAN, AND IT PAID FOR ITSELF ON THE FIRST RUN (2026-08-08)

`docs/dev/places-spike.html`. One image already in the repo, three viewpoints cut
out of it by moving a camera, nothing commissioned. The engine works: transform
origin plus scale, hotspots as percentages, a back stack, hotspots fading out
once you are deep, zero page errors. **About sixty lines.**

**And it immediately found the thing that would have wasted the art budget.**
Measured, not guessed: a **16:9 backdrop inside a phone-shaped frame is cropped
by 64 percent.** `background-size:cover` on a 1.79 aspect image in a 0.64 aspect
viewport draws it 1109px wide inside a 398px window, so only the **middle 36
percent of the width is ever on screen.** Two of the three hotspots I placed
were aimed at parts of the picture no phone will ever show, and the push-in at
2.6x on a 1376px source went soft.

**So the art brief changes before anybody generates anything:**

| Was going to ask for | Must actually ask for |
|---|---|
| wide cinematic 16:9 | **portrait or near square**, roughly 4:5 to 3:4 |
| 1400px or so, like the court skins | **3000px+ on the long edge**, so a 2x push-in still has pixels |
| "a gym interior" | a gym interior **composed for a tall crop**, with the interesting things stacked vertically rather than spread across the width |

**Every court backdrop we own is 1376x768.** That is what makes them court
backdrops and not walkable rooms, and it is why reusing them for this was never
going to work past a demo. Worth knowing now rather than after twelve
generations.

**Still unanswered, and only Aaron can answer it:** does the push-in FEEL like a
step or like a pinch-zoom. The spike has a slow-motion toggle so he can judge the
timing, and a button that draws the hotspot boxes so he can see the structure.

#### HE ANSWERED IT. SPIKE V2, 2026-08-09

> *"The spike artifact did not work on mobile strange, worked on desktop tho, I
> couldn't zoom or use the image on mobile. Second, maybe giving the zoom a slow
> bounce to make it seem like you are walking is worth it? But also when I was
> using it on the desktop it def felt more like a zoom than walking and while
> the slower was better it still wasn't the feel. And doing it this way we would
> lose the turn towards something right?"*

Three findings, and the third is the one that moves money.

**1 · The mobile bug was mine and it was one missing line. FIXED.** No viewport
meta, so the layout viewport was 980px and a 390px phone rendered the desktop
page scaled by 0.398. The 44px hotspot rings were **17.5px of actual finger**, a
quarter of the minimum touch target. Seven files were missing it and every one
was a dev page or a mockup, never a shipped page, because shipped pages get
opened on a phone. The same seven were also missing a charset, which a
screenshot caught as *"BALL KNOWLEDGE Â· 9 AUGUST"*. Both are now gated in
`audit.py` at 0 across every html file in `docs` and `design`, proved by
sabotage. **A mockup that cannot be opened on a phone cannot be JUDGED on a
phone, and most of this game is played on one.**

**2 · Slower was never going to fix the feel, because speed is not the missing
variable.** A zoom and a walk can take exactly the same time. What separates
them is parallax, head bob and footsteps, and v1 had none of the three. All
three are now switches in the spike, plus a straight A/B on the same
destination, so the question is settled by feel rather than by argument.

| the fix | what it costs | measured |
|---|---|---|
| **Head bob**, Aaron's idea and it works | free | 7px, three footfalls, a fifth of a degree of roll. About a third of the size you would guess; more reads as seasickness |
| **Footsteps**, synthesised, no audio file | free | the biggest single jump on the page. Real footfalls on wood and on blacktop belong on the same sourcing list as the crowd cheer |
| **A near layer moving faster than the far one** | **THE ART BILL** | 8 to 9 percent of the frame at rest, **over 80 percent mid-walk**, 0.3 percent once you arrive |

**3 · "We would lose the turn towards something, right?" Yes, and it was worth
catching.** With one flat photograph you can only move ALONG the axis into it. A
turn reveals geometry that is not in the picture and no amount of scaling fakes
it. **But v1's bad news is v2's headroom:** a 16:9 image in a phone frame shows
36% of its width, and the other 64% is exactly what a turn pans across. Turning
now works in the spike on the same photograph with nothing added. It reads as
looking around rather than pivoting on the spot, because this is a normal lens
and not a panorama.

**FOUR CAMERA MODELS, FOUR ART BILLS. This is the decision, and it is about ART,
not code.** Every row is a similar amount of engineering.

| model | what you can do | one room costs |
|---|---|---|
| Flat push-in (v1) | walk toward things, no turning, reads as a zoom | 1 image |
| **Layered push-in (v2)** | walk toward things and have it FEEL like walking | 1 background + 2 or 3 transparent cutouts |
| **Wide layered** (my recommendation) | walk AND look around, out of one wide picture per room | 1 wide background, 3000px+, + cutouts |
| **Wide layered + a pivot** (v3, and where this is heading) | walk, look around, AND turn 90 degrees | as above, plus the facings must MEET if the turn is a Swing |
| Discrete viewpoints | anything, including a true pivot | 3 to 6 per room, so the whole bill by 4 |

**WHAT THIS ADDS TO THE ART BRIEF, and it is the whole point of having run a
spike: LAYERS.** The near thing in every room must arrive as its own
transparent file. Asked for at generation time it costs one extra prompt. Asked
for after twelve flat pictures are finished it costs twelve pictures.

#### HE RULED. SPIKE V3, same day

> *"I def need the near layer. And I want to at least try the pivot once so I
> can see how it will feel."*

**RULED: the near layer is IN, so every room ships in LAYERS.** A background
plus two or three transparent cutouts of whatever is nearest the camera. This is
the one decision in the whole feature that cannot be taken later: asked for at
generation time it is one extra prompt per room, asked for after twelve flat
pictures are finished it is twelve pictures. **Nothing gets commissioned without
it.** The spike now defaults it on and `spike-check.mjs` asserts it.

**And the pivot is built, three ways**, because a pivot is not one thing and the
three cost wildly different amounts of ART while costing the same in code. The
second facing is `blacktop-b-bgwide.jpg`, generated into the page at build time
rather than committed, so nothing rots.

| mode | what it is | what it costs in ART |
|---|---|---|
| **Swing** | a real carousel. You stand at the middle, the two facings sit half a frame out, the stack rotates 90 degrees around you. A genuine turn | **The most.** The seam is on screen for the whole turn, so the two views must be GENERATED TO MEET. In practice: one wide panorama per room, not two pictures |
| **Whip** | no 3D. The world slides sideways and smears | **Nothing.** Any two pictures. The blur hides the seam, which is why so many games ship this |
| **Cut** | a short swing away, a hard cut, a short settle in | **Nothing**, and it is the fastest, which on a phone is worth more than it sounds |

**LOOKING IS NOT TURNING, and v2 conflated them.** The arrows pan inside ONE
picture, which is your eyes. The pivot turns you 90 degrees into a picture you
have not seen. Two controls now, because they feel different and cost
differently.

**WHAT THE PIVOT ACTUALLY DECIDES:** not whether we can turn, we can. **What
shape the art is.** SWING means one wide panorama per room, generated in a
single pass so the facings genuinely meet. WHIP or CUT means a handful of
separate pictures that never have to line up: easier art, more files. No wrong
answer, and no changing it in month three.

**One defect the harness found and reading never would.** Every hotspot became
unclickable on desktop while staying fine on a phone. The pins lived inside a
`transform-style:preserve-3d` element, and **inside a 3D rendering context
z-index is ignored** and everything sorts by computed depth instead. At 420px
wide the picture landed a hair in front of the hotspots; at 358px it did not.
The pins now live inside their own facing, where there is nothing to sort them
against, and the check that catches it asks the browser
`elementFromPoint` at the middle of each ring rather than trusting the CSS.
**A control can be the right size, in the right place, and still be
unreachable.**

**Still Aaron's call:** which of the three pivots feels like turning your head
rather than a slideshow, whether the bob is right, and whether 700ms is right
for a turn (deliberately faster than the 1100ms walk, because turning your head
is faster than walking across a room). Spike v3:
<https://claude.ai/code/artifact/b85a3fd1-b835-4a64-9073-7db9759d4006>

#### THE THINGS THAT WILL BITE, NAMED NOW

- **Weight.** Twelve big images is several megabytes. They have to load per
  place and not at boot, or the game gets slower for people who never open it.
- **Style drift between generations.** Mitigated by the one-wide-image trick and
  by reusing the locked prompt block, not by hoping.
- **This is bigger than everything else on the roadmap put together.** It must
  not sit in front of the twenty friends. **It is post-launch**, and the sample
  Gym floor already built (`docs/dev/gym-sample.html`) is the version that ships
  before it, deliberately.
- **A room you cannot fully walk is easy to make FEEL cheap.** The thing that
  stops that is the transition, not the picture. Budget real time for how the
  move looks.

**Nothing here is decided. This is a feasibility answer to a direct question,
and the answer is yes, at a cost of about twelve images and a small engine,
post-launch, starting with a half-day spike that risks nothing.**

### CAN A CAREER MODE BE BUILT ON TRIVIA AT ALL? (Aaron, 2026-08-08)

His name ruling: **THE JACKET.** The Hall of Fame jacket, a real object, one you
can draw and put in a room and earn. `CAREER_NAME` in `game.js`; both menus read
it from `[data-career-name]`.

And immediately, his own doubt, which is the useful part:

> *"I am already having some doubts about career mode because can we really
> build a career off of trivia questions? I almost am thinking a time travel
> series and letting it be going through the eras teaching you as you become a
> legend with the jacket in your own era. A little sci-fi might kill it but I do
> not know how to make the trivia around a career mode work."*

**The doubt is correct and it is pointed at the wrong thing.** A career mode
normally rewards skill that VARIES: you get better, and the game can see it.
Trivia is binary, you know it or you do not, so a career built on the QUESTIONS
would be a progress bar bolted to a quiz.
But the questions are not the game. **They are the dice.** The game is the
board: rosters, spacing rules, screens, the shot chart, who you are playing.
A career varies all of that while the resolution mechanic stays constant, which
is exactly how every dice game with a campaign works.

**THE ERA IDEA IS THE BEST THING SAID ABOUT THIS MODE, and it is not sci-fi.**
It is already in the data. `eras.json`, `fact_eras.json` and `person_eras.json`
exist today; era tagging is Track A item **A3**; era-scoped questions were
ruled in **22q**. So "a chapter per era" is not a fiction laid over the bank, it
is **the bank's own shape**: each chapter narrows the question pool to one era,
which is a real difficulty curve made of real data rather than a number going up.

**And the two problems solve each other.** Coverage is thinnest in the old eras,
which is why **A5** (the pre-1980 cards) is on Track A at all. A mode that walks
the eras gives a reason to write those cards AND gives the player a reason to
learn them. Right now nobody has a reason to care about 1954.

**On the sci-fi worry, two honest options.**
1. **Do not call it time travel.** Call it film study, or chapters. You are not
   travelling, you are playing THROUGH the history of the game, and the frame
   writes itself: *how do you earn a jacket? By knowing the whole game, era by
   era.* Costs nothing, needs no new art, and the Coach is already a narrator.
2. **Lean all the way in.** Time travel is the only frame that lets you line up
   against Wilt and then Jokic without apologising for it, and it makes the
   Coach a guide rather than a tutorial. **It costs writing and art**, which is
   the real bill, not the credibility.

**Recommendation: option 1 to start, structured so option 2 stays available.**
Chapters by era, the Coach narrating, the jacket as the thing you are earning.
If it wants to become time travel later, nothing has to be rebuilt, because the
chapter structure is identical either way. **Aaron's call, not decided.**

#### "THE CARDS ARE THE DICE" · a worked example, because Aaron asked for one

> *"can you explain the cards are the dice again? Like maybe give me a career
> game play through or something, examples are better for me"*

**The idea in one line.** In Monopoly the dice never change. What changes is the
board you are moving on, who else is on it, and what it costs to land somewhere.
Ball Knowledge is the same shape with one upgrade: **the roll is not luck, it is
whether you know the answer.** So a career does not need the questions to get
more interesting. It needs the BOARD to get more interesting, and the board is
already built.

**What a chapter can vary, all of it shipped code today:**

| Dial | Already exists as | What it does to a chapter |
|---|---|---|
| Which era's cards | `eras.json`, `person_eras.json`, 22q's era rule | Chapter 3 deals only 1980s cards. A different pool, not a harder one |
| Difficulty tier | `Casual · Rookie · Baller · Pro · Legend` | The same era can be gentle or brutal |
| The opponent squad | `pickRosters`, the player DB | Chapter 3 is the Showtime Lakers. They are FAST, so their defenders slide further |
| Spacing house rule | Open floor · Locked up · Pay the toll · One on one | Changes the whole geometry of a possession |
| The court | 27 court skins | Blacktop for the playground chapter, arena for the finals |
| Target score | first to 11 or 21, or quarters | A chapter can be a four minute scrap or a war |

Six dials, zero new systems. **That is the argument: a career is a sequence of
board states, and the card is what resolves each action inside it.**

---

**A PLAYTHROUGH. Chapter 2, "Nobody knows your name yet."**

*Setup the chapter hands you, none of it chosen by the player:* 1970s pool ·
Rookie tier · half court, first to 11 · Open floor spacing · blacktop court ·
opponent is a 1970s squad with one dominant big.

**The Coach, before tip:** "Seventies ball. Nobody is shooting threes out here
and neither are you. Get to the rim or learn something."

**Possession 1.** You tap your guard. Tiles light up: orange is free, and the
lane past their big is **red**, a crossover challenge. You take the red tile.

> *A card pops. Rookie tier, 1970s pool.*
> **"Which team did Wilt Chamberlain win his second title with in 1972?"**
> You get it. **Lakers.**

The crossover lands. Now THEIR defender answers to stay in front, and they miss,
so you are past him. **Notice what happened: the card did not score any points.
It resolved a MOVE.** That is the dice roll.

**Possession 2.** You are in the paint but their center is between you and the
rim. You shoot anyway.

> *Card, one tier easier because it is a layup.* You hit it.
> The **release meter** pops because the shot is contested. You tap dead centre,
> which **denies the block card entirely.** Two points.

**Possession 4.** You miss one. Sudden death cards for the rebound, closest body
gets the edge. You lose the board. That is a turnover you can feel.

**Possession 7.** You have won four cards in a row and the heat bar is full.
**ON FIRE.** Every question your squad sees drops one tier and every player
moves one tile further. The 1970s pool suddenly feels readable. You go on a run.

**End of chapter.** You win 11 to 8. The Coach: "You can hang in the seventies.
Try that in the eighties when everybody can run."

**The chapter pays out three things:** a **banner** for the room, one **era
unlocked** on the map, and a line of dialogue that sets up the next one.

---

**WHY THIS ANSWERS THE DOUBT.** Nothing in that playthrough is a quiz. Every
card was attached to a decision the player made on a board: which tile, which
player, shoot or pass, crash or get back. **You cannot answer your way out of
bad spacing, and you cannot position your way out of not knowing who Wilt played
for.** Both have to be true, and that is a game.

**AND WHY THE ERA FRAME IS THE ENGINE, not decoration.** Chapter 2 deals only
1970s cards. That is a genuinely different experience from chapter 5, not a
number going up: **a different body of knowledge**. The player who cruises
through the 2010s chapter will struggle in the 1970s one, and the reverse is
true for somebody's dad. That asymmetry is the mode's whole replay value and it
comes free from a column that already exists in the tables.

**THE HONEST COSTS, so this is not a sales pitch:**
1. **Old eras are the thinnest part of the bank.** A 1950s chapter cannot be
   dealt today. Track A item **A5** is exactly this work and it stops being
   upkeep the moment this mode exists: it becomes the blocker.
2. **Dialogue is writing, and a lot of it.** Even one line per chapter start and
   end is real copy in a specific voice.
3. **The room needs art**, and it is the sourcing kind, not the CSS kind.
4. **What a chapter WIN is** is still the open question below.

**Still unresolved and worth naming:** what a "win" in a chapter IS. Beating a
CPU squad from that era is the obvious answer and it reuses everything already
built. That is the first thing to pin down before any of this gets built.



- **22ag · QUESTION ROTATION, AND WHY IT CHANGES WHAT "ENOUGH QUESTIONS" MEANS
  (Aaron, 2026-08-07 — filed, not built)**

  Aaron, arguing against my "58 fetches for one card is a bad trade": *"isn't
  all that data just fuel for soooo many more questions... one day we will build
  an algorithm in this game that makes sure not to cycle even similar questions
  within a time period, we may need more tags for that... ultimately we have
  unlimited questions we can ask, it's just how you rotate them per user."*

  **He is right and it reframes Gate 1.** I have been treating the bank as a
  pile that has to be big enough. The thing a player actually experiences is
  **the gap between seeing a card and seeing it again**, and that is a function
  of rotation quality, not only of size. A thousand cards dealt badly feels
  smaller than six hundred dealt well.

  ### What "similar" has to mean, because exact-duplicate is not enough
  A cooldown on `fact_id` is trivial and nearly useless. The repeat a player
  notices is not the same card, it is the same KNOWLEDGE asked twice:
  - **Same answer.** "Which team went 72-10?" and "Which team did Jordan lead to
    72-10?" are one question wearing two hats. V26 already counts 55 pairs of
    cards sharing an answer and two proper nouns.
  - **Same subject.** Three Jordan cards in five questions reads as a Jordan
    quiz even when all three are different facts.
  - **Same source row.** Cards proven off one page tend to be facets of one
    fact. This is free to compute: we already store `fact_sources`.
  - **Same shape.** Four "in what year" cards in a row is a rhythm problem, not
    a knowledge problem, and it is the one players describe as boring.

  ### The tags this needs, and what we already have
  Present today: `fact_leagues`, `fact_eras`, `fact_people`, `difficulty`,
  `category`, `fact_sources`. **Most of the work is already done** — subject
  overlap is `fact_people`, source overlap is `fact_sources`, era clustering is
  `fact_eras`.
  Missing, and each is cheap:
  - `answer_key` — a normalised form of the answer so two cards with the same
    answer collide even when worded differently. Computable now, no research.
  - `question_shape` — year / who / which-team / how-many / definition / rule.
    Derivable from the stem with a small classifier and a human pass.
  - `team_id` on the fact, distinct from the person. "Which team" cards cluster
    by team and we currently have no handle on that.

  ### Where it lives, and the thing to be careful about
  Rotation state is PER PLAYER, which means it belongs beside the existing
  local-storage progress rather than on the server, and it has to survive the
  card bank changing underneath it. **The trap: a cooldown that is too strict on
  a thin bank produces "no eligible card" and the picker either repeats anyway
  or crashes.** Whatever ships must degrade in a defined order — relax shape
  first, then subject, then source, and only ever relax exact-answer last.
  `gate-check.mjs` is the harness that would prove it, since it already deals
  across every league by decade by tier.

  ### Why it is filed and not built
  It needs the bank to be bigger first, or the cooldowns have nothing to work
  with. But it belongs in the record now because it changes the ARGUMENT about
  size: the sweep that produced `research-seasons.json` looked like a bad trade
  costed per card and is an obvious win costed per question-rotation. That is
  the reasoning error this item exists to stop repeating.


- **RATINGS: where does "handles" come from? (Aaron, 2026-08-06 — OPEN, blocks
  the crossover duel)**

  DESIGN.md §2 already locked the philosophy — *"ratings never score points, they
  bend the mechanics"* — and already admits the hole: *"Position defaults (PG/SG/C
  + deep-cross +1) stand in until player ratings land with packs."* Aaron's
  question is what fills it: *"if both get it right, it would be like handles vs
  defense, but how would you do that? How do NBA Live, NBA Jam, and NBA 2K work?"*

  **THE SHORT VERSION, in plain words** (Aaron asked for this on 08-06 after the
  first write-up did not land).

  There are two kinds of number in basketball, and we keep treating them the
  same. **Points per game is COUNTED** — somebody sat there with a clicker. It
  is a measurement. **"Handles" is JUDGED** — nobody counts dribbles. It is an
  opinion, like a grade on an essay rather than a score on a spelling test.

  The video games all just decide. A room of people at 2K watch film, argue, and
  write down 92. That is genuinely the whole method, and none of them publishes
  a formula. So *there is no "handles" data anywhere to go and get.*

  Why we cannot simply do the same: every other number in this database has a
  receipt attached — where it came from and how much that source is worth. Type
  `handles: 92` and it becomes the only number here with no receipt, sitting
  beside 1,526 facts that each carry one. The first player who asks why Iverson
  is 95 and Kyrie 93 gets no answer.

  Three ways to get a number that DOES have a receipt:

  1. **Let the awards do the judging.** The league already votes on some of this
     and writes it down. All-Defensive Team literally means "these were the best
     defenders this year", decided by people who watched and recorded forever
     after. So we do not invent a defence rating — we count All-Defensive teams.
     That is a fact with a source. Defence is close to solved this way.
  2. **Build it from countable things, and publish the recipe.** Rebounding
     percentage is countable. Assist percentage is countable. We write down the
     recipe — "rebounding = this formula, on these bbref numbers" — so anybody
     can redo the sum and get our answer. That is a calculation, not an opinion.
  3. **We decide, and we admit we decided.** Last resort. The rating is stamped
     as opinion with a name and a date. Weaker, but honest, and honest is the
     thing we cannot trade.

  **Then two choices that make the whole problem smaller:**

  **Bands, not exact numbers.** The duel only cares who WINS. We do not need
  Curry 94 and Gobert 31 — we need Curry a 5 and Gobert a 1, out of five.
  Defending "Curry is elite at ball-handling" is easy. Defending "Curry is
  exactly 94" is impossible, because it is not true of any number.

  **Compare inside an era, not across them.** Cousy versus Kyrie cannot be done
  with raw numbers; the sport changed underneath them. But "Cousy was in the top
  5% of ball handlers *of his own time*" and "Kyrie is top 5% of his" can both be
  supported, and both come out as a 5. Fair, sourceable, and the era tags to do
  it already exist from Q6.

  **Eight attributes, not fifty.** 2K rates dozens per player. DESIGN.md §2
  already names eight. Eight × 838 players = 6,704 numbers that each need a
  receipt. Fifty would be about 42,000. That is the difference between a job and
  a fantasy.

  **And the bad news, on the exact one Aaron asked about.** Handles is the
  hardest of the eight. Nothing counts dribbling. Points are counted, rebounds
  are counted, nobody ever recorded "kept his dribble alive under pressure", and
  there is no tracking data at all before roughly 2013. Turnovers are the usual
  stand-in and they are a poor one — a point guard handles the ball forty times
  a game and a centre four, so raw turnovers measure the job, not the skill.
  Handles will mostly come from awards-or-opinion, and the schema should say so
  out loud instead of hiding it behind a confident-looking number.

  **Nothing is blocked meanwhile.** DESIGN.md §2 already ships position defaults
  (PG/SG/C, deep-cross +1) as the stand-in, so the crossover duel works today
  and gets better when ratings land.

  **How the three actually do it — and the answer is uncomfortable for us.**
  - **NBA Jam** — a handful of attributes (speed, 3-pointers, dunks, passing,
    steals, blocks, clutch) on a tiny scale, hand-tuned for arcade feel.
  - **NBA Live** — 0–100 per category, hand-rated by a ratings team.
  - **NBA 2K** — the deepest: dozens of attributes per player on a 25–99 scale,
    composed into badges. **Still hand-assigned**, by a ratings group with a
    public "ratings czar", informed by stats and film but not computed from them.

  **All three are editorial. None publishes a formula. There is no sourced
  "handles" dataset anywhere to import.** So a hand-typed `handles: 92` would be
  the first unsourceable number in this database, and it would sit next to 1,526
  facts that each carry a tier and a date. That collision is the real problem,
  not the game design.

  **Three ways to derive a rating, best first:**
  1. **HONOUR-DERIVED — Tier 1, and underrated.** All-Defensive Team selections,
     DPOY, steals and blocks titles, All-NBA. These are *records of fact* and they
     are already formal expert assessments of exactly the skills we want. Defense
     is nearly solved this way.
  2. **STAT-PROXY — Tier 1 inputs, published formula.** TS%/3P% → shooting.
     AST% and AST:TO → passing. TRB% → rebounding. STL%/BLK%/DBPM → defense.
     The formula ships with the rating so it is reproducible, not asserted.
  3. **EDITORIAL — allowed, but labelled**, with a name and a date, never
     laundered as a fact.

  **RECOMMENDATION (mine, for Aaron to accept or reject):**
  - **Bands, not numbers, and era-relative.** The duel needs Curry > Gobert at
    handles *reliably*; it does not need 94 vs 31. A 1–5 band from percentile
    rank WITHIN ERA is far more defensible, far easier to source, degrades
    gracefully where old data is thin, and solves Cousy-vs-Kyrie, which no raw
    number can. The era tags already exist (Q6).
  - **Eight attributes, not fifty.** DESIGN.md §2 already names exactly eight
    levers: shooting, passing, handles, defense, speed, rebounding, dunking,
    IQ/leadership. That is the Jam model, not the 2K model, and it is the right
    call: 8 × 838 players = 6,704 ratings. Fifty would be ~42,000.
  - **A separate `player_skills` table with its own provenance** — every rating
    carries a `basis` (`honour` / `stat` / `editorial`), the award or the formula,
    and a date. Ratings must never contaminate the fact bank's tiering.

  **THE HONEST HARD ONE, and it is the exact one Aaron asked about.** Of the
  eight, **handles has the worst statistical proxy.** Turnover rate is confounded
  by role; usage is not skill. No public dribble metric exists before tracking
  data (~2013). So for most of history handles will be honour-or-editorial, and
  that should be admitted in the schema rather than hidden behind a number.
  Defense, rebounding, shooting and passing are the well-sourced four; handles,
  speed, dunking and IQ are the soft four.


- **22u · COLLEGE AS A PLAYABLE LEAGUE (Aaron's question, 07-29 — measured;
  CORRECTED 07-30 after Aaron caught an error):**

  **CORRECTION FIRST. I wrote below that "college is not a selectable league at
  all." That was WRONG and Aaron proved it with a screenshot of the live league
  screen.** College IS a league: `LG_LEAGUES` (game.js:3994) declares it with
  `lock:1` — the identical treatment to BIG3 and World, which I called leagues
  without hesitation. My mistake was reading `ROSTERS` (rosters.js — the legacy
  hand-built FALLBACK dealer, 4 leagues) as if it were the league registry. It
  isn't. `LG_LEAGUES` is, and it has seven: nba, wnba, big3, world, college,
  gleague, street. College is gated on DATA, exactly like BIG3 and World.
  **The generalisable lesson: a league's existence lives in `LG_LEAGUES`; a
  league's DEALER lives in `ROSTERS`/`PLAYERDB`. Never infer the first from the
  second.** (LEARNINGS LOG #17.)

  The narrow answer to the Jordan question still holds: Michael Jordan has NO
  college record — he exists once, as `nba` — so picking a college era cannot
  produce UNC Jordan. But the reason is the missing RECORD, not a missing league.

  **The cross-league count was also a symptom of a real defect, now filed as
  backlog P9 — see there.** Only 7 people hold two records; the floor should be
  ~70+. Do not cite "7 cross-league players, all deliberate" as a design fact
  again: it is data debt, not intent.

  **Claude's opinion if this is built: the ASYMMETRY is the feature.** Do not try
  to give every NBA player a college record. In a real college league LeBron,
  Kobe, KG, T-Mac and Dwight Howard simply DO NOT EXIST (prep-to-pro) — an
  absence that teaches something true. One-and-done stars have a single thin
  season. And college legends who never made the NBA become the superstars:
  Bevo Francis scored 113 in a game and would outrank Hall of Famers, which is
  correct and is exactly what this game exists to teach. That is a league that
  feels DIFFERENT; giving everyone a UNC-Jordan record would flatten it.
  **Cost:** ~400 new records with college stats — a full player run, not a tag
  change — plus the per-league era model H4 was going to settle (college eras are
  four-year windows, not NBA decades). **Note P7 in the backlog is currently
  scoped as "College ICONS", which is a much smaller idea than this.** Decide
  which one before commissioning it. NOTE: that asymmetry argument is about which
  PEOPLE a college league contains. It is NOT a defence of the missing companion
  records in P9 — Laettner, Sampson, Danny Manning, Austin Carr and Wat Misaka
  all have college records and no NBA record, which is simply wrong either way.

  **REPEATED 07-31 — I MADE THE IDENTICAL MISTAKE AGAIN.** I told Aaron BIG3 and
  World were "playable" and College/Street "can't be the game", having built the
  table from `MODES` and `PACKS` without once opening `LG_LEAGUES`. Aaron: "it
  bothers me you keep saying college and street are not playable when I sent you
  a screenshot showing they are... are you even keeping track of this?" The
  correction above was already written, in this file, and I did not read it.
  **The lesson is therefore NOT "remember that LG_LEAGUES is the registry" — it
  is READ THE DOC BEFORE ASSERTING SOMETHING IT ALREADY COVERS.** Writing a
  learning down does nothing if the next session doesn't open it. The ground
  truth, for the third time: only NBA and WNBA are unlocked; BIG3, World,
  College, G League and Street are all `lock:1`; Early Black Basketball is not in
  `LG_LEAGUES` at all; G League has zero players and zero facts. (LEARNINGS LOG
  #17, restated.)

- **22v · THE TAXONOMY CONVERSATIONS AARON HAS ASKED FOR AND WE HAVE NOT HAD
  (07-31, PENDING — do not decide these unilaterally):** Aaron, after the four
  disagreeing league lists surfaced: "We need to have a VERY VERY VERY CLEAR
  conversation about all of the tags/fields/everything." He named the agenda:
  1. **What leagues we should have.** Live inputs for that conversation: G
     League is a nameplate (0 players, 0 facts, exists only in `LG_LEAGUES`);
     Early Black Basketball is invisible in the picker but has 20 players and 58
     facts; College/Street/Fives have no lineup so cannot field a squad, and
     Aaron has confirmed **that is NOT on purpose.** Note BIG3 is the only
     league that plays differently (3v3, half court, 3 positions) — NBA, WNBA
     and World are identical to each other but for the label, so "make College
     playable" is mostly a question of which of those two shapes it takes.
  2. **What eras belong to each league.** D9 gives the mechanism; the CONTENT is
     undecided. Today's spans are NBA 1910s–2020s (wrong at the front — the
     league started 1946), WNBA 1990s–2020s, World 1940s–2020s, College
     1930s–2020s, Street 1910s–2020s, Early Black Basketball 1900s–1990s
     (contradicts its own stated 1904–1950 period), BIG3 2010s–2020s. Facts
     reach one decade further back than any player (1890s).
  3. **What packs we should have.** `packs` is its own table per D10; its
     CONTENTS are unsettled.
  4. **Difficulties and tiers.** Note the word "tier" currently means TWO
     unrelated things — fact difficulty 0–4 (139/324/393/402/268) and player
     quality superstar→deep (99/228/199/176/42). Aaron has not yet ruled on
     either scale; renaming one of them is the minimum fix.
  5. **Category / topic / competition** — Aaron: "Lets have a seperate planning
     conversation about the category/topic/competition fields, because thats
     confusing." See TABLES.md §4 for the numbers.

- **22v-DECIDED · THE LEAGUE LIST (Aaron, 2026-07-31). Superseded the "what
  leagues should we have" half of 22v; eras/packs/tiers still open.**
  1. **G League — BUILD IT OUT.** Currently 0 players, 0 facts.
  2. **Early Black Basketball — research first, and take it OFF the picker
     until we know.** Aaron: "cant make promises we cant keep." NOTE: it was
     never ON the picker (it is `hidden`, offered only as a pack) — so the
     action is to keep it out AND decide whether the pack should also come down
     pending research. FLAGGED FOR AARON, not assumed either way.
  3. **World — needs more research** before unlocking (44 of 101 have career
     stats). See 6 below: what World *is* must be settled first.
  4. **College and Street become real leagues.**
  5. **ABA stays inside NBA history.** Not a separate league.
  6. **EuroLeague may become its own league — but first define what "World"
     represents.** Aaron: "the better question is what does World represent,
     lets get that fleshed out first." Open.
  7. **No High School league.**
  8. **Olympics — open.** Possibly its own league; Aaron's own caution is that
     a four-year cycle may be too sparse. Needs research.
  9. **Claude to research what leagues are missing entirely.**
  10. **GENDER IS UNSOLVED AND STRUCTURAL.** Aaron: "College may need to be
      split in two, so might early black basketball... and world may have to be
      split too." MEASURED: outside the WNBA there is NO gender signal in the
      data at all — of 29 college people exactly 1 also holds a WNBA record,
      and of 101 world people exactly 1 does. A women's college league today
      would contain about one player. Aaron's instinct is right and the data to
      fill the other half barely exists yet.
  11. **NBA and WNBA still have large data gaps** — this does not get skipped
      in favour of new leagues.
  12. **High school becomes a PACK, not a league.** No HS players are gathered.
      If a player already in our leagues has high-school material, those
      questions land in a high-school pack that people can add at setup.
  13. **Street plays THREE shapes: 5v5 full court, 4v4 full court, 3v3 half
      court — chosen at setup.** STRUCTURAL CONSEQUENCE: `leagues.plays` is
      currently ONE value per league (TABLES.md §1). It becomes a list, and the
      picker has to offer the choice. This is the same "can it have more than
      one?" test from TABLES.md §0, now failing on a column I wrote this
      morning.

- **22v-BUILT (2026-07-31).** `tools/leagues-restructure.py` applied. The league
  list is now the eleven rows in `docs/play/data/tables/leagues.json`, and
  game.js's THREE hardcoded league lists (LG_LEAGUES / MODES / PACKS) are
  GENERATED from it by `tables-emit.py` — they were a fifth copy waiting to
  drift, which is the exact problem TABLES.md exists to kill.
  - `world` split into **Flags** (nation vs nation, FOR COUNTRY) and
    **Overseas** (club ball everywhere else, OVERSEAS). 99 and 96 people; a
    player who did both is in both, which is why records went 744 -> 838.
  - **Gender is a nullable column on `person_leagues`, not a pair of leagues.**
    Splitting into league rows would have meant asserting a gender for 128
    people we have no evidence about. 117 women and 433 men are evidenced;
    **288 are null and stay null.**
  - `plays` is a LIST. Street declares 5v5-full / 4v4-full / 3v3-half; the
    setup selector for it is NOT built yet, so the first shape is the default.
  - G League, FIBA 3x3, Wheelchair exist and are `hidden` — visible in the data
    as ranked research targets, offered to nobody.
  - **59 world facts could not be classified** national-vs-club from their own
    text. They ride BOTH (D8 allows it, and they are international either way)
    and are listed in `docs/play/data/world-facts-to-sort.json` for a human.
  - BASELINE MOVED, and not silently: `bpg_missing` 423->494,
    `players_tier3_source` 228->257 and `players_missing_companion` 71->103 all
    rose purely because those metrics count RECORDS and records grew by 94.
    Checked per PERSON: people with bpg went 312 -> **320** (better), people on
    an unflagged tier-3 source stayed **228** (unchanged). No real regression.
    Worth knowing that those three metrics now have a slightly misleading
    denominator.

- **22v-ERAS · THREE PROBLEMS FOUND, ONE OF THEM MINE (2026-07-31):**
  1. **The world split duplicated eras instead of dividing them. MY BUG,
     introduced by `leagues-restructure.py` the same day.** All 101 people
     landed with IDENTICAL decade sets in both `flags` and `overseas` — 101 of
     101. So the era data for those two leagues is currently uninformative: it
     asserts that every international player's national-team and club careers
     spanned exactly the same decades, which is false for most of them. Fixing
     it needs per-person evidence of WHICH career ran WHEN; we do not hold that
     today. Until then those era rows should be treated as unverified.
  2. **Three people are filed NBA before the NBA existed** (8 rows): Dutch
     Dehnert, Joe Lapchick, Nat Holman, tagged nba-1910s/20s/30s. They are
     Original Celtics — pre-NBA barnstorming professionals. They need a home
     that is not the NBA. Aaron's call: a pre-NBA league, part of `fives`, or a
     named pre-1946 era of the NBA.
  3. **Early Black Basketball is defined 1904-1950 but 5 rows run past it** —
     Earl Lloyd (1960s) and Marques Haynes (1960s-1990s). Both are real: Lloyd
     crossed into the NBA, Haynes barnstormed for forty years. Either the
     boundary is soft or those records belong elsewhere.

- **22v-ERAS-MEASURED (2026-08-01) — `tools/era-audit.py`, read-only.**
  Written before proposing anything, because the era data had not been counted
  end-to-end. Findings, all counted:

  **The duplication is worse AND better than recorded.** 101 of 101 people carry
  identical decade sets in flags and overseas — 100%, confirmed. But cross-checked
  against `person_leagues`, **94 of those 101 genuinely played BOTH**. So being in
  both leagues is CORRECT; the false claim is narrower than I wrote on 07-31: it is
  that their national-team and club careers spanned the SAME decades. Only **16
  rows** (7 people) put a person in a league they are not even a member of — those
  are free to delete. The other ~1,000 need per-person year evidence, and
  `person_teams` carries **no years at all** (columns are person/league/team only),
  so it cannot be derived from anything we hold.

  **No league declares when it existed.** `first_year` / `last_year` are null on
  **11 of 11** leagues. "the fives, 1904-1950" lives in a tagline STRING, which
  nothing can check — which is exactly why the two boundary bugs below survived.

  **13 rows are outside their league's real life:** 8 NBA rows before 1946 (Dutch
  Dehnert, Joe Lapchick, Nat Holman — Original Celtics) and 5 `fives` rows after
  1950 (Earl Lloyd 1960s; Marques Haynes 1960s-1990s).

  **A second, parallel era system exists.** 7 era rows carry NO league (1890s,
  1930s, 1950s, 1960s, 1970s, 1990s, 2000s), used by **41 fact links** and zero
  people. Bare decades sitting beside (league, decade) rows.

  **The era work D11 called for is 100% undone:** 838 of 838 positions and 838 of
  838 quality ratings carry no era. Today 1996 Jordan and 2002 Jordan are the same
  player to the engine. 424 of 1,526 facts also carry no era.

  **Clean:** 0 people with no era, 0 empty era rows, 0 duplicate (league, decade)
  pairs, 0 careers with a decade hole in the middle.

  **THE HEADLINE — which decades can actually be played.** A decade needs enough
  people to deal two squads and enough facts to ask about them:

  | League | Playable decades | Note |
  |---|---|---|
  | NBA | 1960s-2020s (7) | 1910s-1950s all too thin |
  | WNBA | 1990s-2020s (4) | all of them |
  | BIG3 | 2010s-2020s (2) | all of them |
  | Flags | 1990s-2020s (4) | but see the duplication above |
  | Overseas | 1990s-2020s (4) | identical set — that IS the bug |
  | College | **none** | best decade has 8 people, needs 10 |
  | Street | **none** | best decade has 21 people but 12 facts |

  College and Street are `lab` and Aaron has correctly pointed out they ARE on the
  picker. To be precise this time: both are playable **All-Time** (29 and 47 people
  across all decades) — it is only the per-decade slice that cannot deal a squad.

- **22v-ROUND-2 (Aaron, 2026-07-31):**
  - **Wheelchair basketball and FIBA 3x3 are IN for research**, decision on
    whether they ship comes after the research lands.
  - **Early Black Basketball splits by gender** — "but if results are overlly
    thin seperate, we can just push both dtaa sets into one leagure later."
    Splitting is reversible; not splitting hides the gap. Same logic as
    22v-SEQUENCING.
  - **The `fives` PACK comes down** pending research. Aaron's reason was a
    misremembering — he thought a "negro league" label still lingered on the
    picker — and it does not (checked; the only repo hit is "Serbia and
    Montenegro"). The pull still stands on its own terms: don't offer it until
    the research says what it is.
  - **League NAMES: Claude to propose.** Existing voice to match — THE SHOW,
    THE W, MADNESS, NEXT UP, NO REFS, 3'S UP. Note GLOBAL dies with the World
    split and needs replacing twice over.

- **22v-SEQUENCING · SPLIT FIRST, THEN RESEARCH. Aaron overruled me and was
  right (2026-07-31).** I argued the gender split should FOLLOW the research,
  because splitting today produces a women's college league with one player.
  Aaron: "how do we know where the gaps are and whats the most important to
  reserach if we dont split and see the gaps?"

  He is right, and my error is worth naming because it is a category mistake I
  could repeat: **I conflated "exists in the tables" with "offered to players".**
  `leagues.status` (live / lab / hidden) already separates those two things. So
  a league can be split in the data, show its hole honestly, and stay `hidden`
  until it earns a place in the picker. Nobody is promised anything, and the
  split does the job Aaron actually wants — measuring the gap. **The split IS
  the gap analysis.**

  `tools/league-gaps.py` is the mechanism (read-only, writes nothing). Mapping
  what we hold onto the proposed list, it found what no amount of arguing would
  have:
    - the women's game barely exists outside the WNBA — **1 college woman,
      1 international woman**, against 28 and 100 men
    - **128 people are recorded as men on no evidence whatsoever** — purely
      because they are not in the WNBA. That is an assumption the tool prints
      rather than buries.
    - world does NOT split into two groups: 98 national-team and 95 club, so
      most of those players did BOTH and the single tag was losing which record
      was which. Splitting roughly doubles world's record count, correctly.
    - five proposed leagues are empty (G League, FIBA 3x3 m/w, Wheelchair m/w)
      and each empty row is a ranked research target

- **22y-DECIDED (Aaron, 2026-08-01).** The pacing package, approved:
  - **HEAT MULTIPLIER — IN.** Every card won in a possession raises the payout.
    Aaron's requirements, verbatim in spirit: it "has to have a really cool pop
    up and sound when it happens so people know what's up", and it "has to have
    somewhere to live so you can see your multiplier" — a persistent readout, not
    just a flash. This is not a new idea bolted on: a heat bar and **ON FIRE
    mode** have been in the backlog since the start (FL-5 juice, AL-1, "brother's
    rule, balanced"). 22y is what finally gives heat a JOB. **ON FIRE mode is
    explicitly wanted too.**
  - **DESPERATION HEAVE — IN.** Clock low, anyone can shoot from anywhere on an
    impossible card. Pacing valve + highlight + the first real home for skills.
  - **FOULS AND FREE THROWS — IN.** "we gotta make that happen." Currently the
    engine has neither, which is why the sport's fastest scoring is missing.
  - **BATTLES → TIEBREAK STAT, but SUDDEN DEATH SURVIVES.** Aaron: "The sudden
    death belongs somewhere tho, idk where but somewhere! But for basic battles I
    like the stats thing." So: routine battles (rebound, rip-or-grip, ankle)
    resolve on the relevant STAT — which finally makes the player database matter
    inside the engine. Sudden death is RESERVED for the moments that deserve it,
    home TBD; the obvious candidates are game point and the heave.
  - **SKILL-ACTIVE ANIMATION.** When a skill downgrades a card, that needs its
    own popup. Same family as the heat popup — a moment, not a status line.

- **22ab · BACKCOURT TIMER (Aaron's proposal, 08-01) — Claude's answer:**
  Note this is NOT the rule we already have. Today's backcourt rule is
  **over-and-back** (cross half, can't go back). Aaron is proposing the **8/10
  second rule** — a count on how long you may LOITER in the backcourt. That is a
  pacing rule in real basketball, so it belongs in 22y.

  **Recommend YES, with one correction that matters.** Counting in *cards* is the
  wrong unit — a possession can pass with zero cards, and the 3-second rule
  already counts ACTIONS. Use actions, reuse that machinery, and give it the same
  treatment Aaron asked for: warning popup + highlight the player.

  **The trap to avoid:** crossing half often means beating a defender, which is a
  CARD you can lose. A blind timer punishes you twice for one miss — you failed
  the crossover AND now you lose the ball. So: **an action only ticks the count if
  you did not TRY to advance.** Camping ticks. A failed crossover does not. That
  keeps the pressure honest.

  Number: **5 actions, warning at 4** — the low end of Aaron's 5-10, because our
  possessions are already long in cards.

- **22af · RESEARCH RUN: WHAT HAS EVERYONE ELSE ALREADY SOLVED?
  RUN ONE 08-01 (4 of 11) + RUN A 08-02 (heat ✓, length ✓) + RUN B 08-02
  (trivia ✓ 3 of 4 halves, teaching ✓ with recommendation; spectators ✗,
  turn order ✗✗✗ CLOSED) + RUN C 08-02 (THE MOAT — **claim REFUTED as worded,
  survives narrower**) — 9 of 11 answered; D remains on request.
  **RUN C HEADLINE: Quiz Tonosama no Yabou (Capcom, arcade 1991, Japan-only)
  DID ship the fusion** — you choose which of 38 provinces to attack and the
  province sets how many correct answers you need. Genuine category (i);
  "essentially never shipped" is FALSE and must not be repeated. What survives
  and is defensible: nobody has coupled a player-CHOSEN TILE on a tactical grid
  to BOTH difficulty and point value, nobody has done it in a sports frame, and
  nobody has done it as a modern two-player product. Also: Capcom's other
  quiz-board games (Quiz & Dragons, Quiz Nanairo Dreams) put you on the tile by
  DICE — the real axis separating us from all prior art is CHOSEN vs
  CHANCE-ASSIGNED position. **RUN E EARNED before any public claim:** lane 5
  (sports+trivia hybrids) was never searched and lane 3 (BGG trivia x area
  control / grid movement) returned nothing verified — those two lanes are
  where a competitor would hide. Three decisions
  now waiting on Aaron: repeats (never-repeat vs spaced-repeat, 22ac 33),
  drills-into-V0 (22ac 36), TV reveal timing (no prior art — couch playtest).**
  Run A scorecard: heat and game-length ANSWERED on primary sources (2 of 25
  claims disproven vs run one's 13 — small runs work); turn order failed
  verification for the SECOND time, carries a labeled-unverified
  recommendation (alternating; defender-contest if downtime bites), gets one
  last shot in Run B with named candidate games, then playtest decides.
  New idea bank rows: 22ac 28-32. TWO NEW FLAGS FOR AARON in the findings doc:
  heat-as-abilities vs the planned heat-as-multiplier, and A7 vs 22ad's
  team-turns toggle.
  Findings + scorecard: `design/22af-findings.md`. Idea bank rows: 22ac 21-27.
  Verified kill rate 13/25. Scorecard verdict (criteria fixed pre-return):
  Q1/Q2/Q3 pass, Q7 pass-thin; Q4/Q5/Q6/Q8/Q9/Q10/Q11 fail — the five-angle
  harness cannot carry eleven questions, now measured. Re-runs, grouped 3-4
  max: **A** economy/pace (Q4+Q5+Q8) · **B** trivia/teaching (Q6+Q9+Q7's
  hidden-info half) · **C** THE MOAT alone (Q10, documented scope) ·
  **D** THE WISHLIST alone (Q11, must cite actual threads).
  **OPEN — Aaron's call:** F1/F2 recommend paper-testing graduated coverage
  (priced, not blocked) BEFORE the binary Open-floor default locks; V0 scope
  currently ships the toggle as default. Flagged in findings doc, not acted on.
  Original locked brief below, kept for the re-runs:

  **BRIEF LOCKED 2026-08-01. RUN ONE = 11 QUESTIONS.**
  A comparative run, not a data-mining run — nothing here merges into
  `questions.js` or `players.json`, so the find→prove→merge gate does not apply.
  Aaron's ask (08-01): look at trivia games, turn-based games, and board games —
  *"chess, checkers etc."* — *"and get back everything we possibly can in relation
  to this game and how we can make it better."*

  **Why now.** 22ae just proved by arithmetic that the board is 102% saturated
  and that pacing / idle pieces / busywork violations are ONE problem. Every game
  below solved some version of that decades ago. This is the cheapest possible
  way to stop re-deriving solved problems from scratch.

  Tightened with Aaron from a 15-question draft. The rule that decided what
  stayed: **a research run answers questions that change what we build.** Fifteen
  questions produces a reading list; eleven with a decision attached produces
  decisions. The four that were cut are not lost — they are RUN TWO, below.
  (Draft note kept because it cost us: I missed the tabletop-sports lineage
  entirely in the first pass. It is now question 1.)

  **RUN ONE — each one changes a call already on the V0 board:**
  1. **Tabletop sports games** — Strat-O-Matic, Blood Bowl, Statis Pro, APBA.
     The closest prior art by far. → the Open floor toggle, the board.
  2. **Density and spacing in abstract games** — chess opens congested ON PURPOSE
     so trading opens the game. → is 102% saturation a bug or an arc to design?
  3. **Idle pieces** — zones of control, opportunity attacks, area objectives.
     → is "pieces sitting" fixable without a timer?
  4. **Reward curves** — roguelikes, deckbuilders. → the heat multiplier, which
     we are about to invent from scratch.
  5. **Pacing and game length** — what ends a game on time without a resented
     clock. → target score; whether fouls alone fix it.
  6. **Trivia mechanics** — repeats, mixed-knowledge groups, teaching on a wrong
     answer, daily loops. → Daily Five, cards-remember-you, adaptive difficulty.
  7. **TV + phone party games** (Jackbox lineage), including how hidden
     information stays fun for the person who CANNOT see. → TV mode, in V0.
  8. **Turn structure** — simultaneous vs alternating vs team turns.
     *Aaron kept this in run one: it might MOVE UP depending on what comes back.*
  9. **Teaching without a manual.** *Same reason — Aaron kept it in because the
     answer could promote drills-as-tutorial out of the not-in-V0 pile.*
  10. **THE MOAT.** Who else has fused a KNOWLEDGE test with a POSITIONAL game?
     Aaron: *"I LOVE THE RESEARCH ABOUT IF THIS IS MY MOAT, basically am I
     creating something that technically doesn't exist even in format."* If
     almost nobody has, that is the answer. If a few have, what did they get
     wrong. This is the question with the highest strategic value in the run.
  11. **THE UNMET WISHLIST (Aaron's addition).** What do people actually complain
     about and wish for in games like this that the market is NOT serving?
     Reviews, forums, subreddits, store one-stars — the gap between what players
     ask for out loud and what exists. Aaron's framing: *"what are people's
     complaints slash desires about games and things like this that aren't being
     addressed in the current market."* This is the only question that looks at
     DEMAND rather than at other people's solutions, which is why it earns a slot.

  **RUN TWO (saved, not cut):** catch-up and blowout design · content longevity ·
  not-a-sports-fan reach · **could this be a PHYSICAL board game** — Aaron, 08-01:
  *"I can't wait for the second run on if that can be a physical game because I
  have never said it to you but I've been thinking it and then you said it which
  solidified it for me."* That one is his, independently arrived at; log it as his.

  **OUTPUT RULES — these matter more than the questions:**
  - Every finding names a GAME, the PROBLEM it solved, and a VERDICT for us:
    adopt / adapt / reject, with a reason.
  - **If a finding cannot be tied to a decision on the board, it does not go in
    the doc.** That rule is what keeps this from becoming a reading list.
  - Anything that maps gets a row in the idea bank (22ac) WITH A CITATION, so in
    six weeks we know where it came from instead of re-deriving it.

  **THE PASTE BLOCK LIVES AT `design/22af-brief.md`** — generated by the
  `design-research-brief` skill, which also carries the INTAKE pass for what
  comes back (kill rule, citation check, verdict check, contradiction check).
  `research-brief` is the wrong skill for this run: it bakes in the fact-run
  standard (sourceTier, confidence, slug ids) and 22af merges no facts.
  The return files to `design/22af-findings.md`, never straight into 22ac.

- **22ae · THE BOARD HAS NO SPACING, AND IT IS THE ROOT CAUSE (measured 08-01).**
  Aaron: *"5v5 maybe is too many pieces, or the board is too small for 5v5
  because you don't get real spacing... something something is off."* He is right,
  and it is arithmetic, not vibes.

  A defender gates his own tile plus his neighbours — that adjacency is what
  forces a crossover or a contest. With diagonals counting, that is **9 tiles per
  defender**. Measured over the tiles you can actually shoot from:

  | | scoring tiles | defensive saturation |
  |---|---|---|
  | **NBA 5v5, 15x8, today** | 44 | **102%** |
  | BIG3 3v3, 8x7, today | 38 | 71% |
  | 5v5 on a bigger 19x10 board | 52 | 87% |
  | **5v5, 15x8, ORTHOGONAL gating only** | 44 | **57%** |
  | 5v5, 17x9, orthogonal only | 46 | 54% |
  | 4v4, 15x8, orthogonal only | 44 | 45% |

  **102% means there is mathematically no open space in 5v5.** Five defenders
  produce 45 tile-covers over a 44-tile scoring area. Every scoring tile is
  covered, on average, more than once, before anybody moves.

  **That one number explains all three complaints as ONE problem:**
  - *Pacing* — no open tile means every shot is contested and every drive is a
    crossover, so every possession takes the most expensive path through the card
    gates. The pacing problem is not the card COUNT; the board forces the
    expensive route every single time.
  - *Pieces sitting* — with no open space there is nowhere better to go, so moving
    an off-ball player achieves nothing. Players are not being lazy; the board is
    telling them the truth.
  - *Violations as busywork* — a timer that forces movement on a saturated board
    is management with no payoff, exactly as Aaron described.

  **CLAUDE WALKS BACK HIS OWN RECOMMENDATION (22ab).** I recommended the backcourt
  timer two turns ago. On a 102%-saturated board it would make the management
  feeling WORSE, because there is no advantage to be gained by the movement it
  forces. **Fix spacing first, then re-ask whether the timer is needed at all.**

  **RECOMMENDED FIX — orthogonal gating only.** A defender gates the tile he is on
  plus the four squares he is square to; a diagonal no longer gates a drive.
  102% -> 57%, better spacing than BIG3 has today, and it keeps 5v5, keeps the
  board size, keeps phone-sized tap targets. It is close to a one-line change.
  **The game already believes this**: the rulebook says a man square in your chest
  jacks the shot a full tier while "a diagonal closeout leaves it cleaner". We
  already treat diagonals as the weaker coverage — this just finishes the thought.
  Diagonals should still count for SCREENS (a body beside a defender is a body).

  **THE TOGGLE — Aaron 08-01: "where would the toggle live and what would it say?"**

  **Only ONE of the four options is actually a toggle.** Worth being precise,
  because they are different kinds of change:
  | option | what it changes | can it flip mid-session? |
  |---|---|---|
  | bigger board 19x10 | `MODE.cols/rows` — layout, camera, tap-target size | **no** — re-layout |
  | 4v4 / 3v3 | `MODE.lineup` — squad size, dealing, positions | **no** — re-deal |
  | **orthogonal gating** | **one adjacency test** | **YES — nothing re-renders** |
  The first two are MODES and need a restart. Only orthogonal gating is a true
  rules variant, which is also why it is the right thing to A/B first.

  **WHERE IT LIVES: House Rules, NOT Settings.** This is a rule the ROOM plays
  by, not a per-phone preference. In Settings it would fork the rules between two
  online players — one phone gating diagonally, the other not — which is a real
  desync, not a cosmetic one. `houseRules()` is already broadcast to the guest on
  connect (`netEv({a:'house'})`), so adding a field there syncs for free.

  **WHAT IT SAYS: `SPACING`**, with both states NAMED rather than on/off:
  - **LOCKED UP** — *"Defenders guard every direction, corners included. Tight,
    grinding, hard to score."*  (today's game)
  - **OPEN FLOOR** — *"Defenders only guard straight-on. Slide past on a diagonal
    and he can't touch you — more lanes, faster scoring."*
  Naming both sides matters: on/off would brand today's game "the broken one" and
  bias the playtest before anyone plays it.

  **WHAT IT ADJUSTS, EXACTLY:** which defenders **gate a drive and contest a
  shot** — all 8 neighbours vs the 4 he is square to. **Screens are NOT affected:**
  a body diagonal to a defender still screens him, because a body is a body. Also
  applies to the CPU — the same helpers drive its decisions, so it inherits the
  change automatically and does not need separate tuning.

  Untested. Needs a playtest, and the saturation number should be re-measured
  after, but it is the cheapest experiment with the largest predicted effect.

- **V0 · LOCKED BY AARON, 2026-08-01. THIS IS THE RELEASE SCOPE.**
  Ships to a 20-person friend group. Board:
  https://claude.ai/code/artifact/99f89fb6-7861-4573-9850-b4ef81eaf506
  Aaron's framing: *"I really need to get this out to that 20 person group and
  fast... If I cannot get adoption from these 20 then what am I even doing."*
  **37 items.** He was shown the scope cost of the five pulled-forward items and
  chose to keep all of them. That is his call and it is recorded as his call.

  **RESEARCH (all 9 IN — NBA + WNBA ONLY, every other league waits):**
  R0 todo table (build first — nothing else is trackable without it) ·
  R1 re-link every card to its fact (1,526) · R2 fill thin stat rows (604 of
  1,193) · R3 tier every source (514 links) · R4 verify answers + decoys (829) ·
  R5 complete era + player tags (401) · R6 refresh volatile cards (98) ·
  R7 positions + ratings per era (512+512) · R8 year-stamp accolades (574)

  **BUILD — 23 ticked:** verified-pack gate ✅ **MECHANISM BUILT 08-02, ships
  DARK** (tools/build-verified-index.py emits the exclusion list; PACKGATE in
  game.js filters every pool in the picker; verified-gate-check.mjs proves it
  bites and degrades safely; MEASURED: flipping today zeroes the NBA and WNBA
  pools — 835 of 1,526 cards are R1 src-dead, so the flip waits for R1's
  relink work, and the build script's thin-pool report is the flip criterion) ·
  fouls + free throws · heat abilities + bar + ON FIRE ✅ **CORE BUILT 08-02**
  (NBA Jam shape per DESIGN.md §6: pour 1+tier with the trailing lever, miss
  drops one segment never wipes, full bar ignites — cards −1 tier + pieces
  +1 move — any bucket or stop ends it; rides the reconnect snapshot;
  battles heat-neutral by netcode design; heat-check.mjs 15 checks +
  break-proof. PRESENTATION REBUILT same day after Aaron's four-part "lazy
  design" ruling: fill bars beneath each scoreboard side that get more on
  fire per quarter filled · a DIAGONAL ON FIRE slam in Sedgwick Ave (the
  menus' graffiti face) with burst + court shake and NO body copy — the Coach
  explains it once via BKCoach.tip('fire'), then it lives in the rulebook's
  new Heat & ON FIRE topic · additive-blend aura on the lit ball-handler
  (halo, rising column, peeling embers), a white-hot comet-tailed ball, and
  glowing ember rings on teammates · reduced-motion honored throughout.
  BUG FOUND VIA THE DEMO: the aura was drawn BEFORE the drop shadow, so the
  shadow buried the teammate rings — the real reason the first version read
  as "too subtle". Live demo: `design/heat-demo.html`.
  Phase 2 = streak mode / heat-check bomb / posterize drain, DESIGN §6).
  **SOURCED ART WIRED IN 08-02 — Aaron's ruling: USE BOTH stamps.** Stamp A
  (flames-are-the-letters) slams during play; stamp B (brush lettering) is the
  WORDMARK wherever the word sits still — Daily Five receipt, rulebook heat
  topic, anywhere static. The PILLAR: painted flame art replaces the
  hand-drawn cone on the lit ball-handler, columns 1+2 cycling at ~8fps and
  mirrored for four apparent frames. Columns 3+4 are NOT used for the aura
  (0.25/0.12 aspect normalised into the aura box turned the pillar into a wisp
  floating over the player's head — caught by screenshot, fixed by sizing the
  box against the sprite: 1.4x his width, 1.25x his height, anchored at the
  feet). They are kept for the ball trail, where narrow is correct.
  BALL TRAIL BUILT 08-02: columns 3+4 finally earn their keep. The handler
  burned and the held ball burned, but the ball went cold the instant it left
  the hand — the pass and the shot, the two most watchable seconds in a
  possession. Now a lit team's ball streams flame the whole flight: rotation
  from SCREEN velocity (court coords point wrong under zoom), length keyed to
  speed as well as ball size, two draw passes (wide soft body + tight bright
  core) because one read as a thread on a 1440px court, and `lit` captured at
  LAUNCH so the trail is identical on both machines online. Two new checks
  measured off the canvas — and counting ORANGE pixels did not work, because
  the floor is orange hardwood and a cold pass scored 2,473 of them; additive
  fire is what's BRIGHT, so the line is luminance>200: 1,658px lit vs 0px
  cold, proven red in both directions. STAMP B PLACED 08-02: the wide band
  now heads the Heat & ON FIRE rulebook topic, the one page that was pure
  wall-of-text (screen blend, the art has no alpha). ·
  THE DAILY FIVE — the stamp ✅ **BUILT 08-02** (the mode itself still to come)
  A torn desk-calendar page pinned top-left of the main menu, opposite ♪/⚙,
  deliberately OUTSIDE the numbered list: everything in that list is a mode
  you choose, this is a ritual you complete and it resets. Real date from the
  device clock, slow orange flare while unplayed; tapped, the paper greys and
  the face fades but the tick stays GREEN (grayscale goes on `.ds-face`, never
  the whole button, or the tick greys with it). Stored as a date string so
  midnight re-arms it; `visibilitychange` re-checks a tab left open overnight.
  `tools/daily-check.mjs`, rollover proven with a faked clock.
  **THE MODE ITSELF BUILT 08-02** (`docs/play/daily.js`, its own file so the
  daily can change without a rules rewrite, DESIGN §9). The stamp is now a
  DOOR: it opens the mode, and a played day opens its receipt instead of a
  dead end. Round 1 make five (tiers 1,2,2,3,4 — layup to logo), round 2 stop
  five (1,2,2,3,3 — one tier lower at the top, because on defence you react
  rather than choose, and a sweep has to stay reachable or nobody ever sees
  the bonus). Points are what the shot is worth on a floor: 2/2/2/3/3 each
  round, 24 max, plus up to 6 from the Heat Check.
  SEEDED BY THE DATE, never Math.random, and it reads NO player state — not
  your roster, league or era — because two phones on the same day must deal
  the same ten cards or the mode has no reason to exist (Wordle's creator,
  22af Run B). Only the verified-pack gate is honoured.
  HEAT CHECK: who-am-I, typed, four clues at 6/4/3/2. Candidate pool MEASURED
  and then tightened — the first play-through served Larry "Bone Collector"
  Williams with one usable clue, because the old filter (superstar OR allstar,
  ppg OR accolades) let in 378 including 23 streetball and 6 Black Fives
  players whose box scores were never kept. Superstar + career ppg + 2
  accolades leaves 86 (51 NBA, 14 WNBA, 4 college, 6 international, 6 flag).
  THE COST, stated: the Heat Check will rarely surface a Black Fives or
  streetball legend — the record does not carry their numbers, so they belong
  in the written bank where context can travel with them.
  Matcher is Aaron's spec, plus two fixes found by testing: Damerau not plain
  Levenshtein (a transposition must cost 1 — "Micheal Jordn" scored 3 under
  plain and blew a budget of 2), and the 40 records carrying a quoted nickname
  now answer to their plain name too.
  MEASURED, and it is a GAME-WIDE finding not a daily one: Medium #e8b84b and
  Legendary #ffcf6a are only **deltaE 9.2** apart, while every other
  neighbouring tier pair is 55-61. At small size they are the same colour —
  the corner-three collision in a new costume. TIERS is game-wide so the
  palette was NOT forked; Legendary gets a non-hue marker (★ + gold ring) on
  the rack, and the finding is Aaron's call to make.
  46 checks in daily-check.mjs, break-proofed three ways (unseed the picker,
  leak the answer on a miss, unlock the bonus early — each reddens).
  **VERSION B same day, after Aaron: "this is a big deal thing and should be
  the draw... not hidden away in the corner."** A was 120px, 3deg, top-left
  corner. B is 180px and near-square (0.97:1 measured), 6deg, parked 13px left
  of the BALL KNOWLEDGE title and level with it (106px of shared height), and
  it now behaves like a live menu button: the same cursor-tilt on hover and
  the same POW slam on click — `data-pow="CLOCK IN!"`, and since the stamp
  isn't inside `.menu` the shake lands on `.title-wrap` instead. A crossed-off
  stamp does neither. Below 1000px the title is ~92vw and there is genuinely
  no floor to its left (measured), so B stacks above the crest, still large
  and still tilted, pushed left of centre so it never reads as part of the
  centred stack. daily-check.mjs now 15 checks, all green. ·
  desperation heave ·
  battles on a tiebreak stat (with the numbers popping, per 22ac item 2) ·
  Quick Run · The Daily Five · cards remember you between games · play logging ·
  retire the access code · wake lock · shot effects (arc trail, swish burst, rim
  rattle) · on-court name tags · CPU-vs-CPU headless sanity test · in-game
  feedback button · add to home screen · handle the sleeping server · invite
  link · give sudden death a home · fix the 27 lazy questions

  **PULLED FORWARD INTO V0 (5):** TV / couch mode · player skills · in-game chat ·
  The Tape rebuild · trash talk

  **ORDER 08-01 (Aaron, twice):** 1. R0 todo table ✅ · 2. **The Tape rebuild ✅
  (built 08-01, verified + screenshotted 08-02)**
  · 3. **22af, the comparative research run** (trivia / turn-based / board games)
  · then the verified-pack gate and R1-R8. Aaron moved 22af up so what we learn
  from other games can shape the build BEFORE the expensive data runs start,
  not after. That is the right order: 22ae proved we are re-deriving problems
  chess solved in the 1400s.

  **ORDER CHANGED 08-01, Aaron: "I want the tables rebuild moved up to next,
  nothing matters if I can't navigate and look at the data correctly."**
  The Tape rebuild (22w) now runs SECOND, before the verified-pack gate and
  before R1-R8. He is right and I had it wrong: R0 just produced 4,043 todo
  rows and the only way to look at them today is a viewer with no joins and an
  invisible filter syntax. Handing someone 4,043 rows and no way to sort them
  is not a plan. The tool comes before the work it is meant to direct.

  **NOT IN V0 (6, Aaron's call):** spacing playtest verdict (Open floor already
  ships as the default; the verdict is feedback, not a build) · drills-as-tutorial ·
  Black Fives label + Foundation outreach · scoreboard/play-by-play redesign
  (still blocked on Aaron's reference art) · hype sheet v2 · test-kitchen verdicts

  **NOTE ON CHAT + TRASH TALK.** Both are in V0 now, and BUILD.md line 242 parked
  in-game chat on 07-25 with a MODERATION RISK flagged by Aaron himself. That
  concern does not disappear because the item moved up. Mute, canned phrases
  where possible, and a report path are part of shipping it, not follow-ups.

  **MY ERROR THAT PRODUCED THIS LIST'S FIRST DRAFT:** I built the first board from
  this conversation and memory instead of sweeping BUILD.md, and missed 7 open
  items including one marked HIGH and "matters to him personally" (Black Fives).
  I also pitched "trash talk" as a new idea when chat was already parked WITH its
  risk named. **Sweep the record before writing any plan.** See MAKING.md.

- **22w-SPEC · THE TAPE REBUILD — NEXT UP, ready to build (08-01).**
  Aaron moved this to second. Current file: `docs/tape/index.html`, 346 lines.
  His three notes from 07-31 are the requirements; this is what they become.

  1. **A dropdown per column, showing that column's ACTUAL values with counts.**
     Aaron: filtering "should be as easy as a drop down". Today's `url:null` /
     `confidence:low` syntax is invisible unless you already know it exists —
     the same mistake as the AI-LEARNINGS jargon critique. A dropdown teaches
     itself: open it, see every value the column really holds and how many rows
     have each, tick the ones you want.
  2. **Joins offered, not invented.** Every arrow in TABLES.md §2 is a join the
     tool should present by name — "add the person's name", "add their league",
     "add what it blocks". The user picks a relationship, not a key.
     **`todo` is the join that matters most right now**: todo.target_id ->
     people.person_id turns 4,043 gap rows into a named worklist.
  3. **Two tabs, and the builder WRITES THE TEXT QUERY as you click.** Pick a
     table, pick a column, pick a value, add a join — and the text form assembles
     itself alongside. Nobody has to learn a syntax to start, and anyone who uses
     it a few times learns it for free by watching. Beats either tab alone: a
     pure builder has a ceiling, a pure query box has a floor nobody clears cold.

  **Also needs, given R0 landed:** a saved view per run (R1..R8) so "show me
  everything blocking R2" is one click, and a row count that updates live so the
  numbers on the release board and the numbers in the tool are the same numbers.

  **BUILT (commit 68c3b38, 08-01) and VERIFIED 08-02** — the "Not started" note
  that used to sit here was stale: the same session that wrote it went on to
  ship the rebuild and never came back to fix this line. Verified today:
  `node tools/tape-check.mjs` (serve `docs/` on :8899 first) — **ALL 11 CHECKS
  PASS**, including R2 saved view (604 rows), join brings in people.name, the
  builder writes the query text, dropdown lists real values with counts, and
  zero console errors. Desktop + mobile screenshots taken and sent to Aaron.

- **22ac · IDEA BANK (Claude, 2026-08-01, at Aaron's request — 20 ideas + feedback).**
  Nothing here is scheduled. It is a bank to pull from. Aaron's reaction to the
  first ten: "Man these are good!"

  **THE DATA**
  1. **The database is the biggest unused asset.** 735 people with eras,
     accolades, teams and sources, and in-game a player is a name, a position and
     a rarity. The tiebreak-stat battle (22y) is the crack in the door — kick it
     open. Rodman wins the glass BECAUSE he actually led the league in boards.
  2. **AARON'S, 08-01 — SHOW THE STATS WINNING.** When a stat beats a stat in a
     battle, the two numbers pop on screen, the winning one JUMPS/GLOWS, then they
     fade. The player sees exactly why they lost the board. This is the piece that
     turns idea 1 from a hidden calculation into the best moment in the game — do
     not ship the tiebreak without it.
  3. **Wrong answers should TEACH.** On a miss, hold the right answer for a beat
     with one line of context ("Rodman: 11,954 boards"). Trivia that teaches gets
     replayed; trivia that just says WRONG feels punitive. Uses fact + source data
     we already hold.

  **RETENTION — the weakest area of the product today**
  4. **"THE DAILY FIVE" — biggest missing thing.** No solo mode, no reason to open
     the app alone. Five cards, one dealt squad, same five for everyone, one
     score, shareable. Bank and dealer already exist. Turns an event into a habit.
  5. **The loser gets nothing.** Give them a "what you knew" card — 8/12 on 1990s
     NBA, 2/7 on the WNBA. Every card is already tagged with league and era, so
     the data exists TODAY. A loss becomes a diagnosis, and a diagnosis is a
     reason to run it back.
  6. **Cards do not remember you.** `usedQ` resets every game, so the no-repeat
     memory dies at the final buzzer — three NBA-90s games tonight and you see
     repeats. A per-phone "seen it" list fixes it AND finally measures the real
     bank size. 1,526 sounds like a lot until one person burns a league in a
     weekend. That number is the content runway and nobody is measuring it.
  7. **Seasonal packs.** The pack system exists; a monthly themed pack ("Playoff
     Legends") gives a return cadence and is the answer to bank exhaustion.

  **FEEL / ONBOARDING**
  8. **Time-to-first-bucket may be half the pacing complaint.** Ten screens before
     anyone scores. A QUICK RUN button — sensible defaults, straight to the tip —
     would test that in one build. Measure before rebalancing anything else.
  9. **The squad reveal should be a RIP.** Pack-opening is proven dopamine and
     rarity already exists. Staggered reveal, sound, ritual. It is the moment
     before every single game.
  10. **The rulebook teaches by wall of text.** It is excellent and it is thousands
      of words, with the drills buried inside it. Flip it: drills ARE the tutorial,
      rulebook is the reference afterwards. Nobody reads the manual before ball.
  11. **A roster drawer.** You cannot easily see your own squad's names and stats
      mid-game.

  **COMPETITION / SOCIAL**
  12. **Difficulty should adapt quietly.** Level is picked once and lives forever.
      Miss five straight, ease off a notch silently; run hot, climb. Invisible
      handicapping keeps a superfan and their cousin in the same game. The bracket
      machinery already exists.
  13. **Handicap by KNOWLEDGE DOMAIN, not just tier.** You are a 90s NBA head, your
      cousin knows the WNBA — skew each player's cards toward their own strength
      inside one shared game. Genuinely novel, and it is what makes mixed crews work.
  14. **Trash talk.** Canned taunts over the existing netcode — cheapest stickiness
      in party games. Must be canned, not free text, and must have a mute.
  15. **Co-op 2v2 on a shared squad** — teammates must agree. Co-op rebound
      tap-battles were already sketched in the backlog.
  16. **Name the possession.** Generate a title from the data — "The Rodman Board ·
      4 cards · 5 points" — off the back of the replay button. Shareable text is
      free marketing.

  **DEPTH**
  17. **Give the five players a reason to be five different people.** No fatigue,
      no foul trouble, no substitutions. Fouls are coming anyway (22y); foul
      trouble is nearly free once they land, and a Legendary center in foul trouble
      is a real decision.
  18. **Voice / call-the-shot.** The coordinate system was built for this ("C to
      E4" — the code says voice mode someday). On a TV with phones as hands, saying
      your move is a genuinely distinctive party mechanic.

  **HARD FEEDBACK**
  19. **The online access code is friction for exactly the people you want testing.**
      Worth a sunset date.
  20. **THERE IS NO MEASUREMENT OF REAL PLAY.** No idea how long games take, where
      people quit, which cards get missed most. The playtester's pacing complaint
      should have arrived as a CHART, not an anecdote — and the fix for it is
      currently being chosen from opinion. A small opt-in, privacy-safe, local
      play-log would make every future balance call measurable. Of everything here
      this is the one that most fits how Aaron already works (see the MEASURE
      BEFORE YOU ASSERT rule in CLAUDE.md) and it is the one I would build first
      if the goal is good decisions rather than more features.

  **FROM 22af RUN ONE (2026-08-01) — full citations in `design/22af-findings.md`:**
  21. **Price coverage, don't block it** (Blood Bowl — coverage costs a roll,
      never forbids). A contested tile bumps the question tier or cuts the
      points instead of gating the shot. The strongest lever the research
      returned against the 102% problem. [F1]
  22. **Defender reach is a four-setting dial, not a switch** (50 years of war
      board games: can't-enter / can't-chain-between-covered-tiles /
      covered-tiles-cost-extra / can't-leave). **AARON'S RULING 08-02:** Open
      floor ships as the default NOW; build the gating rule as a settings
      parameter with the alternates behind a playtest toggle so Aaron (+ his
      brother) can compare in the real game — NOT exposed to the 20-person
      group, whose feedback would splinter across variants. His words: "build
      in the 4 options anyway, and I can just playtest between the options
      myself and maybe my brother." Renderer/rules separation (DESIGN.md §9)
      is what makes this cheap. [F2]
      **BUILT 08-02, verified, screenshotted (desktop+mobile).** All four on
      the house-rules Spacing picker (Aaron's call — visible, not hidden):
      Open floor (default) · Locked up · **Pay the toll** (8-way coverage,
      diagonal crossovers one tier easier) · **One-on-one** (8-way coverage,
      a lane gated by 2+ defenders is refused — closed tiles draw dark).
      `tools/spacing-check.mjs` extended to all four modes + a staged
      two-gater corridor; gate proven to bite (deliberately broken → 2 FAIL →
      restored → green). gate-spec 30/30, board-check, music-check all green.
  23. **Depth beats saturation** (Blood Bowl's Column: robust defense at ~1/3
      body density via a second line, two empty squares between defenders).
      Test whether reduced-coverage RULES create spacing before changing
      roster size or board size. [F3]
  24. **Risk-ordered turns** (Blood Bowl's Turnover rule): off-ball moves are
      safe and first, the shot is the turn-ending gamble taken last. One
      mechanism for possession length AND idle pieces, no clock. A missed
      question already resembles a turnover — the skeleton exists. [F4]
  25. **Off-ball pieces get per-turn jobs; blanketing loses** (cage escorts
      must END turns un-covered; roster splits screeners/hunters; all-passive
      coverage is a documented losing pattern). [F5] **Aaron 08-02: "I LOVE
      THIS" + the binding constraint — every incentive must be VISIBLE on
      screen (same law as 22ac item 2's stats-popping rule: a hidden bonus is
      a hidden calculation, and hidden calculations don't change behavior).**
  26. **Spotlight one matchup per possession** (Strat-O-Matic's Action Deck —
      the closest basketball sim never gives all ten players a job). Build the
      turn around ball-handler vs nearest defender; others do the cheap jobs
      from 24-25. [F6]
  27. **Reveal-at-resolution for TV mode** (Jackbox's Push the Button: private
      info on the phone, TV shows derived output only, reveal at the moment it
      matters). Card on phone, board on TV, card revealed at the shot. [F7]

  **FROM 22af RUN A (2026-08-02) — full citations in `design/22af-findings.md`:**
  28. **The NBA Jam heat recipe** — ignite on 3 card wins in a row, break on
      OPPONENT SCORE (not on your own miss), self-cap, and pay out in
      ABILITIES (easier tier in sweet spots / extra attempt / unlock the logo
      zone), never in point multiples. Verified from the official SNES manual.
      [A1] **RESOLVED 08-02: Aaron picked this shape** ("lovveeeee the
      abilities heat"). Locked in DESIGN.md §6; V0 item renamed.
  29. **Soft reset on heat** — a missed question drops heat ONE TIER, never to
      zero (Beat Saber: break halves the multiplier, 8x→4x, capped top). The
      cap stops runaways, the halving keeps the cold player engaged. [A2]
  30. **Fix pace with the two-lever pattern** — speed the MIDDLE (trim the 11
      stops per possession, shrink distance-to-shot so possessions resolve in
      fewer turns) and escalate the END (late points bigger, or sudden death
      on a length trigger). No shipped game ever lowered its win target to fix
      pace — keep 11. TFT + Clash Royale patch notes, Sid Meier memoir. [A4]
  31. **Sudden death = repair, testing the core skill** — trigger it off game
      length (tennis tiebreak, 1965), and design it as "next made basket wins,
      every tile costs one question." Smash's failure mode to avoid: sudden
      death that rewards a different skill than the game tests. [A5]
  32. **Turn order stays alternating (UNVERIFIED — reasoning, not evidence,
      after two research strikes).** If playtests show the waiting player
      disengages, give the DEFENDER the same question to contest/steal inside
      the beat — don't rebuild the turn system. ⚠ overlaps 22ad's team-turns
      toggle plan: don't build both. [A7] **08-02, third strike: Q4 returned
      nothing verified again and is CLOSED as a research question per its own
      brief — playtesting owns turn order now.**

  **FROM 22af RUN B (2026-08-02) — full citations in `design/22af-findings.md`:**
  33. **Repeats are a mastery feature, proven at 3.3M-player scale** (Duolingo
      half-life regression, peer-reviewed + open-sourced: schedule the SAME
      question back at widening intervals; +12% daily engagement). ⚠ CONTRADICTS
      idea 6's never-repeat "seen it" list — Aaron picks: fresh-challenge vs
      you-actually-learn-ball. The game is literally named for the second one.
      [B1] **AARON'S RULING 08-02 (refined same day): EVERYTHING repeats —
      but correct answers wait a LOT longer.** Miss a card and it returns
      soon, at widening intervals until beaten; get it right and it still
      comes back eventually, just on a much longer clock. (This is full
      spaced repetition — his refinement landed exactly on Duolingo's model.)
      **Plus the miss moment, DECIDED:** never show the right answer — the
      card taunts instead ("I'LL BE BACK.") and its return IS the second
      chance. Keeps the player guessing and coming back, his words.
  34. **Two shipped expert-vs-novice mechanics to adapt** — Wits & Wagers'
      bet-on-whose-answer-looks-right (a clueless player competes by reading
      people; maps to defender side-wagers on the shooter's make), and
      LearnedLeague's defense-pick (you assign the questions your OPPONENT
      faces; maps to defender picks the shooter's category). Feeds idea 13's
      knowledge-domain handicap. [B2] **AARON 08-02: placed — these live as
      OPTIONS in handicap matches, not core rules.**
  35. **Daily Five, evidence-shaped:** SAME five for the whole group (Wordle's
      creator: a different word each would never have caught on — confirms
      idea 4 with a primary source) · if streaks ship, forgiveness ships day
      one (Duolingo A/Bs: freezes + milestone celebrations beat rigid streaks)
      · consider bounded SEASONS with off-weeks instead of infinite streaks
      (LearnedLeague, 20 years) — also solves lapsed-player re-entry ·
      REJECT guilt notifications. [B3] **Aaron 08-02, shape RULED across two
      refinements: TWO ROUNDS OF FIVE.** Round 1 — make five shots (shot
      cards, difficulty ramps with distance). Round 2 — STOP five shots
      (block cards: you're the rim protector now). Perfect 10 unlocks the
      BONUS ROUND with a unique question style (heat-check card proposed).
      His framing: "ultimately they are all questions lol" — correct, the
      rounds are dressing on the same bank, which is why it's cheap: both
      card types already exist in the game. And the name survives: it's
      still the Daily FIVE — five per round. Mock at v3 + Heat Check sample
      (who-am-i, type the name), Aaron: "Love it!!!!"
      **TYPE-IN SPELLING SPEC (Aaron asked 08-02; measured against the 735):**
      (a) normalize first — lowercase, strip accents/periods/punctuation, so
      "jj redick" hits J.J. Redick; (b) forgive typos — edit distance 1 for
      short names, 2 for long ("Dikembay Mutumbo" lands); (c) surname alone
      counts IF unique in the DB — 540 of 608 surnames are, but "Johnson"
      matches 10 people, so an ambiguous surname gets "need more than the
      family name," no penalty, NO candidate list shown (a list would leak
      the answer); (d) the people table already has an also_known_as field
      (only 2 rows filled — Goose Tatum, JJ Redick); mining nicknames
      ("Magic," "The Answer," "Dr. J") is a research-free pass over the
      corpus, queue it when the Heat Check gets built. Matcher is a
      ~20-line self-hosted function — no CDN, per house rules.
  36. **Promote the practice drills into the shipped tutorial** (George Fan's
      PvZ GDC talk, primary: tutorial-as-first-level, one rule per drill,
      "not feel like a tutorial at all"). ⚠ drills-as-tutorial currently sits
      in NOT-IN-V0 by Aaron's scope ruling — the evidence moved; the scope
      call stays his. [B4] **Aaron 08-02, and he's right that he half-built
      this already:** the drills exist inside the rulebook topics. What's
      missing is SEQUENCE + SURFACE, and his own proposal is the cheap
      version: coach pops up for new players at the main menu — "new here?
      Head to the gym and run some drills" — plus a suggested drill order
      (move → shoot → contest → foul → heat). That may be small enough to
      slip into V0 without violating his scope ruling; his call.
      **RULED 08-02: "I love it" — build the coach nudge + sequenced drills;
      and the rulebook-as-wall-of-text relocates to a reference home
      ("maybe the rule book style thing should live somewhere else anyway" —
      exact home TBD, likely under ⚙ or a Library shelf).**
  37. **Adapt Trivia Crack's Question Factory rating for the friend group** —
      players flag bad/stale cards in-game; 20 players are a quality-control
      engine for a 1,526-card bank. (Its "50M questions" framing was refuted —
      never quote it.) [B2-negative half]

  **TV MODE IS BIGGER THAN A FEATURE (see 22aa).** Once a board-only view exists
  you get couch multiplayer, spectating, streaming, and — the one worth chasing —
  TOURNAMENT MODE: a room of people running a bracket on one TV with their own
  phones. That is a party game, not a trivia app. It is also the most work here;
  do not let it get half-built as a side quest.

- **22ad · TEAM TURNS: AARON ALREADY HAD IT (08-01).** He offered Mario+Rabbids
  team turns (every piece moves each turn) as a pacing idea and called it "wack".
  It is not, and it was already his: BUILD.md line 184 logs a **Team-turns toggle
  (Mario+Rabbids study)** and the P2 note says "prototype team turns behind a
  toggle; playtest both." He also correctly re-derived the caveat — it is a FEEL
  question that needs playtesting, and probably its own mode rather than a pacing
  fix. Keep it as a toggle, not a replacement.

- **22y · PACING IS THE PROBLEM (playtester, via Aaron 2026-08-01) — OPEN:**
  Verbatim: *"It takes really long to score in this game, not that I don't like
  it, I do and it's hard which is good I guess, but scoring takes a long time, I
  have never actually finished a game to 11."* Aaron has felt it too.

  **Structural cause, counted:** there are **11 distinct places the game stops to
  ask a card** (steal, crossover, deep crossover, pass, shot, block, stay-in-front,
  pick-the-pocket, protect-the-rock, battle, sudden death). Most are TWO-SIDED --
  both players answer -- and a tie ESCALATES into an alternating sudden-death
  chain. So one contested bucket can demand 6-10 correct answers, every one of
  which can end the possession, and a bucket pays 2 against a target of 11.
  The grind is the design working as written; nobody tuned the exchange rate.

  **ALSO FOUND: there are no fouls and no free throws anywhere in the engine.**
  Real basketball paces itself partly at the line -- one shot, one point, no
  defense. We have removed the sport's fastest scoring mechanism entirely.

  Ideas on the table (Claude's, plus Aaron's own held back until after):
  1. ~~**Heat multiplier** — every card you win on a possession raises the
     payout.~~ **SUPERSEDED by Aaron's ruling 08-02 (22af A1–A3, DESIGN.md §6):
     heat pays in ABILITIES, never point multiples — a layup is never "worth 4."
     The research showed the multiplier version is the runaway-leader shape in
     a race to a fixed score.
  2. **Free throws** — a lost defensive card can be a foul. Fastest points in
     the sport, one card, and it fills a real hole.
  3. **Desperation heave (AARON'S)** — clock low, anyone can shoot from anywhere
     on an impossible card. Pacing valve AND a highlight. Pairs with skills.
  4. **Stop double-gating ties** — resolve battles on a tiebreak STAT (the
     rebounder's boards, the defender's steals) instead of another card chain.
  5. ~~Shorter shot clock~~ **REJECTED by Aaron 08-01: "Don't shorten the
     shot clock."** Do not re-propose it. The :24 stays as it is; pacing gets
     fixed by making possessions PAY more, not by cutting time to think.

- **22z · SKILLS (Aaron, 08-01, parked — do not lose):** players should carry
  skills that bend the CARD, not the outcome. Aaron's example: **Steph shooting
  from deep gets a HARD card where everyone else gets an IMPOSSIBLE one.** The
  skill changes the tier you face, never whether the ball goes in — which keeps
  "ball knowledge is the jumpshot" intact. Rest of the skill list TBD.

- **22aa · TV / COUCH PLAY (playtester, via Aaron 08-01) — OPEN:** "Can someone
  stream this to a TV and play against someone else in another state, or two
  people in the same room on different devices?" Two devices in one room or
  across states already works -- that is the online mode. **Casting does not,
  and the ARCHITECTURE is why:** the design is "you only see your own cards", so
  mirroring a tab to a TV shows one player's private cards to the room. Checked:
  no spectator role, no cast/Presentation API, no fullscreen, no wake lock.
  The fix is a THIRD view -- a board-only screen with no cards -- which is also
  the best version of the product: **TV shows the court, phones are your hands.**

- **22w · THE TAPE IS A VIEWER, NOT YET A TOOL (Aaron, 07-31, parked not
  dropped):** his three notes on `docs/tape/`, verbatim:
  1. "its not clear how you can join tables or build queries around this data"
  2. "Flitering on a table should be as easy as a drop down or allowing for what
     a table is showing there to be options that show up at the top for every
     filter possible and you can select the values as drop downd from each field"
  3. "we could have a two tab section that allows for almos standar sql to query
     tables or like an intutitve new method that we can come up with. This needs
     to be way easier to read and sort through and build from"

  He is right, and note 2 lands on the same mistake as the AI-LEARNINGS jargon
  critique: I shipped a `url:null` / `confidence:low` filter syntax that is
  invisible unless you already know it exists. A dropdown per column showing its
  actual values (with counts) needs no teaching at all.

  **Claude's opinion, for when this is built:** do BOTH tabs, and make the
  visual builder WRITE THE TEXT QUERY as you click. Pick a table, pick a column,
  pick a value from a dropdown, add a join — and the text form of that query
  appears alongside. Nobody has to learn a syntax to start, and anyone who uses
  it a few times learns the syntax for free by watching it assemble. That beats
  either tab alone: a pure builder has a ceiling, and a pure query box has a
  floor nobody clears cold. The join is the piece that makes it a tool rather
  than a viewer — every arrow in TABLES.md §2 is a join it should offer.

- **22x · THE SOUNDTRACK IS CAST AND WIRED (Aaron, 2026-08-01 — BUILT):**
  Eight Ketsa tracks off *Concrete Flowers*, CC BY 4.0, attribution to Ketsa.uk.
  Six of them have a JOB, cast by Aaron:

  | Moment | Track |
  |---|---|
  | opening / all menus | Grounded |
  | live play | Mole Soul |
  | you win | Sum of the All |
  | you lose | Sad Soul |
  | tutorial drill | Irony |
  | paused | Soul Up |
  | no fixed role | Follow My Soul, Cursed Without |

  **What replaced what.** The five Kevin MacLeod tracks are gone from the repo
  and from the rulebook credit. `docs/vote/audio/` is gone too — the vote page
  now streams out of `docs/play/audio/`, so there is exactly ONE copy of each
  file and friends judge the same bytes the game plays.

  **Three engineering decisions worth keeping.**
  1. **One resolver, not scattered calls.** `musicWant()` in game.js reads the
     game's actual state (end veil? pause veil? drill? which screen?) and
     answers with a role. Everything calls `musicSync()`. Before this there was
     a single `BKAudio.music(...)` line inside `show()`, which cannot see pause
     or the final buzzer at all, because neither is a screen.
  2. **A MutationObserver on the two veils, not ten call sites.** The pause and
     end veils are opened/closed from ten places (resume, rematch,
     settings-from-pause, rulebook-from-pause, reconnect...). Hooking each one
     means the eleventh, written next month, is silently wrong. Watching the
     class cannot drift.
  3. **A hand-picked track HOLDS.** Skipping in the boombox sets `manual`, and
     every automatic switch is then ignored until the ♪ toggle goes off and back
     on. Picking a song is a statement; the game shouldn't overrule it two
     screens later.

  **Sad Soul only plays when THIS phone lost.** Vs CPU and online both know who
  "you" are (`CPU.team` / `NET.role`); on a hot-seat 1v1 the winner is standing
  in the room, so that is a win and Sum of the All plays. Never mourn a stranger.

  **Files re-encoded 320kbps → 160kbps** — 49MB → 25MB for eight tracks, against
  29MB for the old five. Background music under gameplay on a phone speaker; if
  Aaron wants the higher rate back it is one ffmpeg pass.

  **Verified in a real browser, not asserted** (`music-check.mjs`, 21 checks, all
  passing): every transition read back off `BKAudio.mpState()` — menu→Grounded
  playing, game→Mole Soul, pause→Soul Up *via the observer with no music call in
  the path*, resume→Mole Soul, drill→Irony beating the game track on the same
  screen, win/lose through the real `endShow`, hot-seat never mourning, manual
  pick surviving screen changes, all eight reachable in the player, no console
  errors. Vote page at 1440 and 390: 8 tracks, no overflow, all eight durations
  read off the real mp3s. Long names scroll in the boombox LCD (measured: 71px
  of text in a 48px window, 23px shift, confirmed mid-scroll in a screenshot).

- **22r · COMBINED LEAGUE+ERA PICKER (Aaron's proposal, 07-29 — evaluated, awaiting D1 to mock):**
  merge league select and era select into ONE screen — pick leagues, check off
  eras PER LEAGUE beneath each selection, one LED counter, sections sized like
  the court picker. Claude's evaluation: the per-league era structure is the
  strongest part (eras ARE per-league facts — a global decade picker is
  incoherent across leagues, and this fixes it structurally; "Before the W"
  becomes just a WNBA era chip). Two amendments ruled in the evaluation:
  (1) MUST be progressive-disclosure — era chips unfurl only under a selected
  league, packs-panel style; built flat it's a settings form and dies. Common
  path stays one tap. (2) Difficulty does NOT inherit the vacated era screen —
  difficulty is a settings row (locker room / CPU setup), the era screen is CUT,
  and the flow gets one screen shorter. ("Wants rule B" retracted 07-29 —
  with D1 ruled A-for-players + the became-true rule for questions, per-league
  era chips work cleanly: chips = decades the league existed, players deal
  under every chip they played in, questions follow their fact's date.)
  Sequence: D1 ✅ ruled → Q6 era tagging (became-true rule) → mockup → integrate.

- **22s · THE UNIFIED TAG SYSTEM (Aaron, 07-29 — spec'd AND executable):** every
  card carries three tag axes — `l` (home league), `e:[...]` (decades the fact
  BECAME TRUE; omitted = evergreen), `p:[...]` (player ids the card is about) —
  plus `off:1` and `v:1`. Gate semantics: **AND across axes, OR within an
  axis** (multi-tag era passes if ANY selected decade matches; league passes
  via home league OR any active pack). Era sets are **PER-LEAGUE** (the 22r
  model): `eras:{nba:["2000s"],fives:"all"}` is one coherent game; a league
  absent from the map defaults to All-Time; `eras:null` = FULL KNOWLEDGE.
  **`p:` weights the draw, it NEVER filters** — consistent with the 22q
  targeting ruling, so the LED counter stays honest at setup.
  Aaron's testing requirement is met with an EXECUTABLE spec:
  `tools/gate-spec.mjs` implements the gate and runs a 22-case adversarial
  table (spanning facts, per-league era overrides, current-state volatile
  lockouts, off-court toggle, roster weighting) — all passing 07-29. When the
  real gate lands in game.js, these cases port over as the engine's tests;
  any future gate question gets settled by ADDING A CASE, not by debate.

- **22t · PLAYERS AND STATS ARE OBJECTS TOO (Aaron, 07-29 — spec'd AND
  executable):** players carry the same tag axes as questions (league +
  eras[]), and **stats become per-era packages stored as TOTALS, never rates**
  — `statsByEra:{"2000s":{g,pts,reb,ast,fgm,fga},...}`. Multi-era selections
  combine by GAMES-WEIGHTING (28.0 over 500g + 25.0 over 300g = 26.875, not
  26.5); percentages recombine from makes/attempts; rates are derived at read
  time only. **Self-consistency law:** all era packages summed must equal the
  career block — a free data-integrity check the future stats run gets gated
  on. Honesty ladder on the result: `era-exact` → `era-partial` (flagged) →
  `career-fallback` (flagged) → accolade-only (fives/street: no numbers to
  fake). Engine math cost at draw time: microseconds — the risk was never
  speed, it was averaging traps. `tools/player-spec.mjs` is the executable
  ruling: dealable() (rule A) + statlineFor() + a 14-case suite, all passing
  07-29. THE PRINCIPLE, now standing: **every data object type gets an
  executable spec before the engine touches it** — questions (gate-spec),
  players/stats (player-spec), whatever comes next.
  **Data prerequisite:** per-era packages don't exist in players.json yet —
  that's backlog S6, and the spec was written FIRST so the mining run captures
  the right shape (totals, not rates).

1. **Real players vs original archetypes** — biggest open. Collectible figurines
   of real NBA/WNBA players = licensed territory (likeness rights apply to
   figurines same as cards). Trivia ABOUT real players/facts: always fine.
   Options: (a) real names, friends-only forever; (b) original archetype legends
   ("The King" figurine) with real-fact trivia — safe to grow, art-friendly;
   (c) hybrid. Leaning (b)+(c); decide before P4 art.
2. **Era list — ✅ RESOLVED** (era MULTI-select shipped v0.10; '20s = NOW,
   FULL KNOWLEDGE default). Original proposal kept for reference: Pioneers ('50s–'60s) · Rivals ('70s–'80s) ·
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
    → **IN FLIGHT: FL-2.6** (Aaron re-raised it in the 07-23 playtest; also
    wants "shot not on the same turn as the move" tested).
11. **Year-range slider** ("'96–'04 run") — needs per-year roster data, not
    per-decade. Logged for after the deep-research roster sweep.
12. **Voice / type-to-move** — court coordinates shipped (v0.10) as the
    grammar; "C to E4" input field, then voice, someday. G League + Street
    Legends leagues go live (cards already in the lab) once the deep-research
    pull returns real rosters + question banks; lab cards get hidden at launch
    if they're not ready.
13. **Lane-guard steals (signature skill, per Aaron 07-23)** — special players
    can secretly pick a passing lane on their defensive turn (opponent can't
    see it), answer a difficulty-gated card to arm it; a pass down that lane
    triggers an interception challenge the passer can answer back (difficulty
    from passer's passing skill), tap-off on a tie. Needs HIDDEN input —
    natural online (FL-4); on one shared phone it needs a pass-the-phone
    moment. Slot: with special players/ratings (AL-2), online-first.
14. **No-look pass counter (per Aaron 07-23)** — the answer to #13: attacker
    quietly declares a no-look; if a lane-guard bites, attacker's question —
    win it and the DEFENDER gets yanked to the intercept tile (he bit on the
    fake) while the ball goes where it was really meant. Mind-games loop with
    #13; build them together.
15. **Rules-assist "easy mode"** — beginners: illegal moves (backcourt etc.)
    are blocked with an explanation; normal play: violations are LIVE (whistle,
    turnover) — shipped in v0.11. Easy-mode toggle rides with the coach
    tutorial (FL-2.6).
16. **Pre-game OPENING TOSS-UP → THE CALL — ✅ SHIPPED** (local + online;
    prizes settled in 22k; colors/court became spoils 07-25→27). Original
    design (per Aaron 07-24) — the pre-game "toss" is the **first taste of trivia**: a
    general Basketball-Knowledge question opens every versus match. **Knowledge
    earns the rights, not luck** (no coin). **DECIDED: this does NOT replace the
    tip-off buzzer race** — the ball is still earned in the race. Two distinct
    knowledge beats:
    - **Opening Toss-Up** (general BK question, both players race to answer) →
      winner gets **THE CALL**.
    - **Tip-off buzzer race** (later) → opening **possession** (unchanged).
    - **THE CALL — light either/or (DECIDED):** the toss winner picks ONE bundle,
      loser gets the other —
        · **THE LOOK** = pick the **court theme/skin** + **home side**.
        · **THE EDGE** = **pick team color first** (opponent can't match) +
          **lock your squad first** (shuffle can't snipe your guys).
      Keeps a real choice and both players walk away with something.
    - **Open sub-question:** "Lock squad first" only bites if squad-select is a
      **draft from a shared pool**; today it's a **random deal + shuffle/lock**
      (no snipe risk). Keep random-deal → THE EDGE = color-first + maybe a small
      perk; want the snipe tension → squad-select needs a draft mode. **Design
      call needed (ties to the squad-reveal task).**
    - **Toss-up vs tip-off — keep them distinct in feel:** toss-up = ONE punchy
      general question (opening bell); tip-off = the possession race. Don't let
      them read as the same minigame twice.
    - **Match length / win condition** (first to 11/21, tiebreaker) = lobby/host
      settings agreed BEFORE the flip, not a flip prize.
    - **Era/decade + question scope = SHARED, not per-player (DECIDED 07-24).**
      Both players run the same era timeline / question pool; it's set once
      (host/mutual), not chosen per side.
    - **Surface (medium):** coin, flip, heads/tails call, THE CALL hand-off are
      all CSS/SVG geometry + motion (my wheelhouse — spinning 3D-ish coin,
      slam-down result). No sourced art needed.
    - **Shared-phone vs online:** any hidden bits (a squad draft the opponent
      can't snipe) want a pass-the-phone moment on one device; natural online
      (FL-4). Slot: with versus/online polish.
17. **All-Star Weekend (⏸ PARKED 07-24 — "leave it out for now")** — Aaron wants
    All-Star Weekend (3pt contest, dunk contest, skills challenge, All-Star Game)
    someday, but is parking it. Captured so we don't re-derive it: the tension is
    that leagues currently BUNDLE format+pool+vibe (BIG3 = the 3v3 home,
    Streetball = streetball rules), so "format" isn't a free axis.
    **Claude's recommendation (for when we un-park):** the picker chooses a
    PACKAGE, not just a league. Most packages are leagues (pool+format+vibe → a
    MATCH). All-Star Weekend is a SPECIAL package (cross-league star pool → an
    EVENTS HUB, not a match) — its own visually-distinct card in the SAME rolodex
    (All-Star ball + shimmer, set apart), NO extra "what do you want to do" mode
    screen (Aaron flagged that as corny; agreed). All-Star naturally pulls stars
    from ALL leagues (that's what it IS), sidestepping "which league / 3s
    everywhere." **Keep format bundled to its league** — Aaron's instinct (and
    mine): letting every format float free flattens variety (one dominant style
    rises), and the combos explode the build. A free-format "Exhibition/Custom"
    mode can come later, opt-in, post-launch. All-Star events map onto existing
    trivia + release-meter mechanics cleanly. Sub-choice for later: one
    cross-league All-Star package (simplest) vs per-league All-Star weekend.

**★ DESIGN-SYSTEM RULE (decided 07-24): one global "SLAM" language.**
Every slam-down and off-to-the-side card graffiti uses the SAME treatment,
established on the league picker:
- **Font:** Sedgwick Ave Display (graffiti) for all slam words / tag callouts —
  retrofit the menu SWISH/RULES/LET'S GO from Anton to Sedgwick.
- **POW recipe:** colored hard-offset shadow + accent glow + spiky comic starburst
  behind the word (the menu `.pow` treatment) — used on commit bursts, event
  callouts, reveals.
- **Selected state:** breathing glow in the item's own color (league color, etc.).
- **Balls / identity:** realistic real-world ball designs (theme-neutral), not
  candy colors.
Applies across: league picker, main menu, era/decade pick, squad reveal, in-game
callouts — so the whole game reads as one thing. Self-host Sedgwick woff2 in
`docs/play/assets/fonts/` at integration (no CDN).

18. **Squad reveal = PACK-RARITY system — ✅ SHIPPED** (5 tiers live, deals
    from the full 744-player DB, 5-shuffle cap, THE CALL's +2 shuffles rides
    it). Original spec (per Aaron 07-24) — the dealt starting
    five is a pack pull, not just "5 all-stars." Rules:
    - **One player per position** (PG/SG/SF/PF/C). Bench/fatigue come LATER (no
      fatigue now = no bench).
    - **Every shuffle guarantees ≥1 superstar.** Player star-tiers drive it:
      `superstar → allstar → starter/role` (needs the PART-3 player DB tiers).
    - **Pack rarities & composition (5 tiers, DECIDED 07-24):**
      · **Common** — 1 superstar + 4 role
      · **Rare** — 1 superstar + 1 all-star + 3 role
      · **Epic** — the "big three" (3 greats) + 2 role
      · **Legendary** — 4–5 full-on greats
      · **Hall of Fame** — the immortals: ALL FIVE superstars (the chase; holo treatment)
      Drop odds: Common 40 · Rare 28 · Epic 20 · Legendary 9 · Hall of Fame 3 (tunable).
    - **SHUFFLES ARE CAPPED AT 5 (DECIDED — was unlimited).** You're dealt a five
      + 5 reshuffles; spend them, then lock in. This is what makes rarity meaningful
      AND gives THE EDGE's "lock squad first" real teeth (first to lock wins ties
      on a contested pull). Deplete-pip UI.
    - Card = position chip · jersey number · name · tier badge + tier-colored glow
      (number-forward, NO player portraits → sidesteps likeness/licensing, and
      it's CSS/SVG = my wheelhouse). Deal + flip reveal; breathing glow on stars.
    - **Names DECIDED (07-24): Common · Rare · Epic · Legendary · Hall of Fame.**
      HOF sits ABOVE Legendary and is all five superstars (holographic banner).
    - **FUTURE — luck perks:** earnable perks/boosters that raise a player's pack
      drop odds (better shot at Epic/Legendary pulls). Reward for progression;
      slots with the economy (packs/credits). Logged for later.
    - **Mocked 07-24**, pending sign-off → integrate (honor toss-up EDGE lock-order).

19. **Tournament BRACKET mode (long-term, per Aaron 07-24)** — a bracket you
    play through: seeded field (you + CPUs at mixed difficulties, or friends
    online later), single-elim rounds, bracket screen between games (advance the
    winner, show the path to the chip), a championship = extra-juiced victory
    ceremony. Natural fit with CPU levels (early rounds Rookie → finals
    All-Star) and credits/packs as round rewards. Slot: after tutorials +
    look-pass; design the bracket screen in the house language.

20. **No pausing mid-question — ✅ BUILT** (pause veil blocked while any card
    is live, NO TIMEOUTS toast; covered by the drops2 suite). Original note:
    the pause button must be dead while a trivia card / tip-off answer / toss-up
    question is live (no reading the question, pausing, and googling). Pause
    stays available between possessions and during non-question phases. Small
    guard in btnPause when it's built — slot with the next gameplay batch.

21. **TEAM-IDENTITY REFACTOR — 🟢 LARGELY SHIPPED** (24 colorways + squad
    names + abbrevs ride every surface: buzzers, tipveil, tap battles, HUD,
    victory, callouts — 07-26→27). REMAINING: ③ figurine sprite tint pass
    beyond the base team hues, ④ clash-bolt/vsmed retint to team colors
    (DECIDED reactive, 22o). Original audit list (per Aaron 07-25):
    When custom team names + jersey colorways land (menu-screen-brief §colors),
    "Orange/Blue" stops being the teams' identity. THE TRACKED LIST of every
    surface that must revisit:
    **The design model (decided):**
    · Two color layers stay separate: THEME accent = menu chrome (already
      theme-safe — themes deliberately never recolor teams); TEAM identity =
      per-side {name, primary, secondary} chosen at setup. Defaults remain
      Orange (#f5872e) / Blue (#58a8d6) when players don't customize.
    · BRAND stays brand: the BK logo is blue-orange FOREVER (Aaron's rule) —
      brand marks never re-tint to jerseys.
    **The good news (audit 07-25):** 66 call-sites already funnel through
    teamName()/teamCol() — swap those two functions to read the identity
    object and MOST of the game follows (banners, callouts, victory ceremony,
    HUD, confetti, CPU labels). The revisit list is what sits OUTSIDE the funnel:
    ① Hardcoded "Orange"/"Blue" strings (8): toss-up buzzers/rows + THE CALL
       results, tip-off buzzer slabs, online "You'll be Orange/Blue" cards,
       squad-reveal headers, HUD ORANGE/BLUE labels.
    ② Hardcoded hexes/vars (43): --team-oj/--away in clash gradients, tz.oj/
       tz.bl slab gradients, tu-buzz o/b, THE CALL card colors, fr-card online
       colors, selection rings (game.js piece ring), zone tint rgba pair,
       stagebox/meter borders.
    ③ FIGURINE SPRITES — baked per-team at makeSprite(0/1,pos); needs a tint
       pass (hue-map the base sprite to primary, trim to secondary) at
       game start. Numbered decals unaffected.
    ④ CLASH BOLT (clash-bolt.png) — the art is literally orange→blue.
       Options: (a) treat it as BRAND like the logo (keep as-is), (b) neutral
       white-hot bolt + CSS glow tinted per side, (c) mask + two-tone tint.
       AARON DECIDES. Same question for the vsmed medallion + cg-a/cg-b washes
       (those are CSS — trivially re-tintable).
    ⑤ VICTORY SCREEN — already var-driven (--wc) ✓, but slam text says team
       name → must use custom names ("THUNDERBIRDS WIN!"), confetti colors ✓.
    ⑥ TIP-OFF/TOSS-UP fairness copy ("Orange (you)") → names.
    ⑦ ART PROMPTS — any future backdrop/court prompts that bake orange-vs-blue
       teams into the ART must say "home/away jerseys in variable colors" or
       keep players out of frame (current court prompts already exclude
       players ✓; venue-placeholder + clash backdrop are player-free ✓).
    ⑧ TEAM NAMES everywhere text says Orange/Blue: play-by-play banners,
       callouts (SPLASH etc. are team-colored ✓ via teamCol), sudden-death
       copy, rematch copy, netcode room copy ("You'll be BLUE").
    **Guardrails when built:** two sides can never pick identical/too-close
    colorways (min contrast delta, EDGE winner picks first); primary drives
    UI surfaces, secondary is trim (numbers/borders); long custom names need
    a short-code for the narrow HUD (auto-abbreviate).
    Slot: with the team-name + colorway build (menu-screen-brief §colors).

22. **AARON'S 07-25 BATCH (banked — nothing built yet).** Ordered into the
    master plan in §4; details here:
    a) **INBOUND REWORK (rules bug).** Today the inbounder stands ON the court
       under the basket. Correct behavior: (i) inbounder stands OUT OF BOUNDS,
       off the playing surface; (ii) the inbound happens FROM WHERE THE BALL
       WENT OUT (baseline after makes, else the spot of the violation/OOB),
       not always the baseline under the rim; (iii) **both** teams get a setup
       move — offense sets a cutter AND defense repositions — **simultaneously
       and BLIND** (neither sees the other's move), then the inbound pass
       resolves. This is a real rules + UI change: needs a hidden-commit step
       (both sides stage, then reveal) — natural on one phone (pass-and-hide)
       and on netcode (both submit, server reveals).
    b) **SCOREBOARD + PLAY-BY-PLAY REDESIGN.** Aaron: current design is lazy.
       He is SENDING REFERENCE ART to design the scoreboard from. Play-by-play
       band gets the same pass. Includes the **shot clock + quarter timers**
       (make them part of the scoreboard language, not floating leftovers).
       BLOCKED ON: Aaron's reference art.
    c) **HUD CONSOLIDATION — ✅ SHIPPED 07-27** (the one-tray ⋯ collapses
       replay/music/help/menu off the gameplay bar).
    d) **REPLAY BUTTON — status: BUILT** (`btnReplay` ↺ in the HUD, wired to
       replayPlay). MISSING: a Settings toggle to hide/disable it. Small add.
    e) **PLAYER INSPECT PANEL (mid-game).** Tapping a player opens a side panel:
       name, number, position, STATS, and — for superstars — their SPECIALTY.
       Must not crowd the court on mobile (slide-over that dismisses).
    f) **STATS EVERYWHERE.** Same stat block appears at SQUAD-PICK time (so you
       know who you're getting) and in the mid-game inspect panel. Depends on
       the player DB (Run 1 landed 441 players WITH career/peak/highs stats —
       the data is already there, this is a UI + mapping job).
    g) **IN-GAME COMMENTARY (NBA broadcast × streetball announcer).** Source:
       does NOT need deep research for v1 — it's authored flavor text, written
       against real play events (bucket, brick, block, steal, ankle-breaker,
       heat check, blowout, comeback) and player context from the DB. A later
       research pull can mine real announcer catchphrase STYLE (not copyrighted
       lines) + streetball nickname culture. DISPLAY (the mobile problem):
       one-line ticker/bark that fades, keyed to the existing callout system —
       never a stacked log. Volume/frequency setting + off switch.
    h) **CHAT WINDOW (online) — LATER / MAYBE.** Aaron: may not ship it at all
       (moderation risk). If built: compact collapsed pill that expands, never
       occupying court space, with quick-emote presets as the safer default and
       a hard off switch.
    i) **ONLINE TOSS-UP — ✅ SHIPPED 07-25 (Phase 1.1).** Both phones open with
       the toss-up; both must ready up; HOST picks the question and broadcasts
       its index so both see the identical card; 5-4-3-2-1 runs on both.
       **FAIRNESS MODEL (important, reuse it):** the relay server is a dumb pipe,
       so the HOST arbitrates (same pattern as the rebound battle). Each phone
       measures its OWN reaction delta (ms from its reveal to its buzz) and sends
       THAT number; the host compares DELTAS, never packet-arrival order, so lag
       can never steal a buzz. Host opens a 500ms window after the first buzz so
       a slower packet still counts. Only your own buzzer is live; only the
       winner gets answer buttons; a brick hands THE CALL to the opponent; only
       the winner can pick LOOK/EDGE and the pick syncs. 15s no-buzz safety net
       awards to the guest (host already had setup). After THE CALL the host
       drives the matchup screens and the guest gets a waiting state.
       **NO SERVER CHANGE NEEDED** — relay untouched, nothing to redeploy.
       Verified with two live browsers on a real relay: identical question,
       race fairness BOTH directions (the slower-arriving but faster-reacting
       phone wins), brick-steal, no-buzz default, local + CPU regressions, and
       drop/rejoin mid-toss-up.
       ALSO FIXED (pre-existing crash): snapshot() dereferenced a null `state`,
       so ANY drop+rejoin before tip-off (toss-up/league/era/squad) threw and
       broke the room. Now null-safe — a pre-game reconnect re-runs the toss-up.

    j) **FULL ONLINE GAME AUDIT — ✅ DONE 07-25 (Phase 1.2).** Drove a complete
       versus match with two live browsers on a real relay (room → toss-up →
       league → era → rules → squads → 900 ticks of play → victory screen).
       Found and fixed TWO game-breaking defects, both in the TIP-OFF — the one
       simultaneous race that never got the Phase 1.1 treatment:
       - **Buzz race resolved locally.** Each phone sees its own buzz at zero
         latency, so when BOTH players buzzed (the entire point of a jump ball —
         the normal case, not an edge case) each awarded itself the tip and the
         clients disagreed about possession for the rest of the game. Caught it
         forking on the very first possession: host 3-0 while the guest sat 0-0.
         Now host-arbitrated + lag-fair, identical model to the toss-up, plus a
         15s no-buzz default so a silent room can't hang on the jump ball.
       - **Each phone drew its OWN tip-off question.** Both players raced to
         buzz on questions the other never saw — you buzz fast because yours was
         easy. Host now draws the INDEX and broadcasts it (`{a:'tipq'}`). The
         pick is BUFFERED: the brains screen is tap-to-skip, so the host's pick
         routinely lands before the guest has even built its `tip` state.
       Endgame needs no arbitration — endGame() derives the winner from the
       (already-synced) score, so both clients reach the same victory screen on
       their own. Verified, not assumed.
       **NO SERVER CHANGE NEEDED** — relay untouched.

    **THE NETCODE INVARIANT (learned the hard way twice — apply to everything new):**
    the relay is a dumb pipe, so any shared moment needs one of two treatments:
      1. **Simultaneous race → HOST ARBITRATES on deltas.** Never let a client
         resolve a race it is part of, and never compare packet arrival order.
      2. **Shared random draw → BROADCAST THE INDEX, never the roll.** Both
         clients must resolve to the same array element; buffer it, because the
         receiver may not exist yet.
    Anything only ONE side acts on (a trivia card, the shot meter, a steal) is
    safe to resolve locally — `showCard` already early-returns for the non-owner.
    **Test-harness trap:** dev hooks must call the `*Emit` wrapper, not its local
    half. `_shoot` called `doShoot()` instead of `shootEmit()` and silently
    skipped the wire — the harness invented a desync that did not exist, which
    burned a whole debugging pass before the real bugs surfaced.

    k) **THE CALL — settled 07-25.** Toss-up winner picks ONE prize: **+2 shuffles**
       OR **first squad pick**. If they take the shuffles, the loser goes first; if
       they take first pick, the loser simply goes second with normal shuffles. The
       loser never gets a bonus — just the leftover slot. **The winner always picks
       jersey colour first**, regardless.
       WHY NOT "loser gets the other perk": first-pick's value collapses when the
       draft pool is deep. Measured superstars per position — NBA 6-12, WNBA 2-4,
       World 0-3, **BIG3 zero at every position**. So in the two leagues most likely
       to be played, first-pick is worth ~nothing and handing it to the loser as a
       "fair" consolation would be hollow. +2 shuffles is league-independent
       (~47% -> ~59% chance of a Legendary-or-better pack).

    l) **HOUSE RULES vs SPOILS — the rule for sorting any future setting.**
       Ask: *"would I want to know this before I agreed to play?"* -> the ROOM
       CREATOR owns it, and the joiner is shown it before committing. Ask:
       *"would I be annoyed if my opponent got it for free?"* -> it's a toss-up SPOIL.
       - Room creator: league, era, game length, knowledge level + handicap on/off.
       - Toss-up: the prize above, plus jersey colour to the winner.
       NOTE: **court theme is currently a private, per-player localStorage setting**
       and is NOT synced — two people in one room can be looking at different
       coloured courts today. Making it a spoil means BUILDING it as a shared
       setting first. Recommended shape: winner picks the shared court, each player
       may override locally (Whiteout/Blackout are an accessibility problem to force).

    m) **DIFFICULTY BRACKETS — built 07-25.** A bracket is a CURVE, not a fixed
       difficulty: the game already decides how hard a card should be from what you
       attempted, and the bracket slides that whole curve. Applied in exactly ONE
       place (top of `showCard`), so it automatically covers all nine card sites —
       shot, crossover/deep crossover, pass, steal, block, stay-in-front,
       pick-the-pocket, protect-the-rock, sudden death — and runs before the label
       is drawn so a shifted card shows the difficulty it actually is.
       Ladder: **Casual · Rookie · Baller · Pro · Legend**, plus **Surprise Me**
       (rolls a tier per card) sitting beside the ladder, not on it. `BRACKETS.lo`
       is a PER-BRACKET floor — only Casual reaches t:0, otherwise unlocking Casual
       would drag Rookie's layups down with it.

    n) **QUESTION RUN 2 — done 07-25. 834 -> 1141 questions.** Run 1 drifted deep
       (48 easy vs 250 hard vs 176 legendary), so run 2 was briefed at the opposite
       end and mined the SAME corpus — no new research needed, 156 facts had never
       been used at all. Added 307: t:0=130, t:1=273. Tier spread is now
       130/273/261/302/175.
       **t:0 questions are ALLOWED to hint at their own answer.** That is the tier
       for someone who barely follows ball and just wants to try, and giveaway
       phrasing is a feature there — the verifiers were explicitly told not to kill
       it at t:0, only above it.
       Verifiers caught a genuinely fresh one: Bam Adebayo's 83 on 2026-03-10 pushed
       Kobe's 81 to THIRD-highest, so that stem was wrong the day it was written.
       Also repaired 60 questions where the NBA miner wrote the difficulty
       ("easy"/"very easy") into the LEAGUE field — recoverable only because every
       srcId was nba-prefixed. Worth asserting on in future merges.

    o) **AARON'S 07-26 AUDIO/VISUAL BATCH.**
       - **DECIDED: the versus lightning bolt matches TEAM COLORS** (rides with
         team colorways + the Orange/Blue refactor in Phase 4). This settles the
         bolt brand-vs-reactive question in item #21: reactive wins; the main
         logo stays brand orange/blue.
       - **FIXED: brains (loading-beat) screen flipped back to the menu song**
         for ~2.6s between the versus slam and the game. It now keeps the game
         track — versus → brains → game is one continuous groove.
       - **FIXED: track switches were a jump-cut.** 350ms linear out vs 600ms in.
         Now a real crossfade — cosine-eased, ~1s out / ~1.8s in — so the versus
         slam lands on the sfx first and the music swells in under it.
       - ~~**NEEDS AARON: new music.**~~ ✅ CLOSED 08-01 · 22x — replaced by the
         eight-track Ketsa soundtrack. The brief below is kept because the
         DIAGNOSIS in it (loop length, BPM) is what made the replacement work,
         not because anything is still owed.
         **BRIEF REVISED 07-27** after measuring the files — the original brief
         below the line was part of the problem, so it is superseded:

         **DIAGNOSIS (measured, not guessed).** The in-game track (Funk Game
         Loop) is **56 seconds long**. A 10-15 minute game loops it 11-16
         times with zero variation. That repetition — not tempo alone — is
         what reads as "anxiety-inducing": the ear learns the whole phrase in
         a minute and then spends fourteen more predicting it. Second factor:
         the game already supplies ALL the urgency it needs (a :24 shot clock,
         a 15s question timer with a hot-pulsing LED, buzzers). Music stacked
         on top of that competes instead of supporting.
         **THE RULE: the clock creates pressure; the music creates the room.**

         **SLOT 1 · MENU** (~85-100 BPM). Warm, head-nod, unhurried — the
         locker room before tip, anticipation not adrenaline. Groove carried
         by bass + keys; percussion present but relaxed. Prefer >=2:30 so
         repeats are rare while someone reads the rulebook.
         **SLOT 2 · IN-GAME** (~90-110 BPM — NOTE: the old brief said 110-130,
         which is exactly the mistake). Must survive 15 minutes under a
         countdown. Bass and keys carry it; percussion soft (brushed/muted,
         no relentless 16th hats, no snare shoving every backbeat). NO
         build-and-drop structure, no rising tension, no sirens — the shot
         clock is the tension. Sparse low-mid so sfx sit on top. Prefer
         >=3:00, or a loop with genuine internal variation (an A and a B
         section beats a perfect 1-bar groove here).
         **SLOT 3 · optional VERSUS STING** 3-6s hype hit for the lightning
         slam; **SLOT 4 · optional VICTORY CUE** 8-15s.
         All slots: **instrumental, no vocals** (lyrics fight trivia reading).

         **LICENSE CONSTRAINT (this repo is PUBLIC).** Committed mp3s are
         redistributed by definition. **CC0 / public domain or CC BY only.**
         Avoid ND (blocks trimming/looping) and NC (ambiguous for a portfolio
         that doubles as a hiring signal). Free-with-credit catalogs that
         forbid standalone redistribution (Uppbeat/Bensound free tiers,
         YouTube Audio Library) are a poor fit for a public repo even though
         they'd be fine on a normal site — that rules out several of the
         sources named in the superseded brief.
         **SOURCES (verified live 07-27):** Free Music Archive advanced search
         (license checkboxes incl. CC BY + Public Domain + Commercial Use, an
         Instrumental toggle and a duration filter — the best tool for this
         job) · OpenGameArt Music (CC0/CC BY, and written to LOOP) · ccMixter
         (instrumental + "music for games" filters) · Scott Buckley (CC BY,
         has Funk and Hip Hop) · Incompetech (CC BY, the current source —
         different tracks, filter by Feel not just Genre). **FreePD is DEAD**
         (permanently closed 2025) — remove it from every list. Pixabay Music
         is plausible but its license summary would not load from here;
         verify redistribution terms before using.
         **DELIVERY.** mp3, **128 kbps is plenty** (current files are 256-320
         kbps / 28 MB total — a real mobile cost); target <=2.5 MB per track.
         Drop them in **`docs/play/audio/`** (NOT assets/audio — the old brief
         had the path wrong) or hand them over, with **track name + artist +
         license + source URL** for each so the rulebook credit line is right.
         I wire the crossfades and credits.

## 6b · SESSION RECORD, 2026-08-08 · where everything from this day lives

Aaron, 2026-08-08: *"Please file all of this please please please, sometimes
when I go to bring something back up the context is incomplete, I need to be
able to resurface all of this convo."*

**This section is an INDEX, not a second copy.** Every decision below is written
in full in the file named beside it, per the sources-of-truth map in
`CLAUDE.md`. What was missing was not the filing, it was a way to find it
without the chat. A duplicate of the content here would go stale the first time
one of those files was edited; a pointer will not.

### Decisions Aaron made today
| What he ruled | His words | Where it lives |
|---|---|---|
| Online moves to menu slot 02 | *"it's the second best Main attraction honestly"* | `V0.md` D18 |
| The coach must pause the Daily Five | *"Make sure the coach popup pauses daily 5 gameplay"* | `V0.md` D16 |
| A way to reset the Daily Five for testing | *"can you reset the daily five somehow?"* | `V0.md` D17 |
| **NO EM DASHES ANYWHERE** | *"EVERYWHERE! this is a standard of mine"* | `CLAUDE.md` (own section) · `tools/emdash.py` · gated in `audit.py` |
| The main menu redesign, with a way back | *"the ability to go back to the original if it doesn't work out well"* | `V0.md` D19 to D22 · artifact below |
| The Gym, named | picked from four options | `V0.md` D19 |
| The old menu catches up | *"get rid of the numbers... rename the how to play and the packs"* | `V0.md` D19 |
| The career mode needs its own backdrop | *"not the same one as the background of the game"* | `V0.md` D20 |
| No pack-of-cards icon on the career row | *"have to change that pack of cards icon"* | `V0.md` D22 |
| **The career mode is THE JACKET** | *"let's go with The Jacket"* | `CAREER_NAME` in `game.js`, one line |
| Peeking carousel for the three VS modes | picked from three options | `V0.md` D19 |
| Merge to main | *"Let's merge now tho"* | merged, `main` |

### Questions he asked that got real answers
| Question | Where the answer lives |
|---|---|
| Where do I source a crowd cheer and other sounds? | `V0.md`, under THE THREE ENDINGS: the six sounds that cannot be synthesised, four sources ranked by how quotable the licence is, three to avoid |
| Can a career really be built on trivia? | **§ 6 above**, with a turn by turn playthrough |
| More names for the career mode | `V0.md` D21 keeps the shortlist; the name is now ruled |

### Still open, and whose call it is
| Item | Owner |
|---|---|
| What a chapter WIN is in The Jacket | Aaron, and it blocks any build |
| Chapters vs full time travel framing | Aaron. Recommendation is chapters, structured so time travel stays available |
| Sourcing the six sound files | Aaron |
| Whether the NEW menu stays the default | Aaron. It is live and default right now; `?menu=classic` or the Control Room switch flips it |
| Quick Run on the classic menu | deferred by Aaron: *"we can figure out quick run on the old menu later"* |
| Deleting the losing menu once he picks | Claude, after he rules |

### The artifacts published today
| Page | URL |
|---|---|
| Menu re-rank · the coach clock · the reset door | https://claude.ai/code/artifact/2670a986-0718-429b-9a5f-424a3e2cb991 |
| **The main menu redesign, classic beside new** | https://claude.ai/code/artifact/b23c7e3d-357a-4878-9b2c-9aa8f6a9996d |

### What was learned, as opposed to decided
`AI-LEARNINGS.md` **2.6o** (a shared verb that silently no-ops for one caller)
and **2.6p** (if a test varies a parameter, prove the parameter varied).
`MAKING.md` gained two entries: *The pause that paused nothing* and *The cue
nobody could see*.

### New tools this day
`tools/emdash.py` · `tools/daily-pause-check.mjs` (28 checks) ·
`tools/menu2-check.mjs` (42 checks) · `tools/menu2-shots.mjs` ·
`tools/menu2-artifact.py` · `tools/menu-order-compare.mjs` ·
`tools/order-artifact.py`

## 7 · Changelog

- **2026-08-08 — THE COACH STOPS THE CLOCK, THE MENU IS RE-RANKED, AND THE DAILY
  FIVE HAS A RESET DOOR.** Three of Aaron's asks (V0 D16 · D17 · D18).
  **D16:** every coach tip called `BK.freeze()`, and the Daily Five does not run
  on the engine, so on that screen the freeze was a **no-op** — the resume notice
  D13 added was printed over a question whose clock was already burning.
  `clockHold()` parks the remaining ms and hands them back (`clockTotal` never
  moves, so the bar means the same thing before and after) and returns how much
  it parked, which is how `coach.js` knows whether it may claim to have stopped
  anything. It also raises the veil whenever it holds — a non-modal tip is
  click-through by design, which would have left four live answer buttons under a
  card announcing the clock was stopped. **The measurement is the test:** 1.6s of
  real time, `:21 → :21`, then `:21 → :20` on dismiss.
  **D17:** `?daily=reset` (today's stamp, receipt, half-run and history row) and
  `?daily=wipe` (all of it plus `bk_coach_seen`). Deliberately URLs, not a
  Control Room button — a streak you can repair from a settings switch is not a
  streak. Anything not exactly those two words does nothing. Ships the game's
  first toast, `#bkToast`.
  **D18:** `01 Vs the CPU · 02 Online · 03 Local VS · 04 How to Play · 05 Packs`.
  Nothing on the menu is positional in code; only the printed 01–05 moved.
  New: `tools/daily-pause-check.mjs` (28 checks, two of them sabotage),
  `tools/menu-order-compare.mjs`, `tools/order-artifact.py`.
  **The comparison caught two things description would not have**: the clock
  bar's new striped HELD state is covered by the coach card at 390 *and* 1440,
  so the frozen time moved into the card header where it is readable; and the
  "both themes" shots came back byte-identical because the script wrote a
  `bk_theme` key nothing reads. The theme is now read back off the body class
  and printed in every row of the log.

- **2026-08-07 — THE STATUS BOARD IS GENERATED NOW, NOT WRITTEN.** Aaron:
  *"I think you are missing ALOT from my future build stuff... I want this doc
  to be complete just not confusing... Think of this artifact like a project
  management tool."* The cause was structural, not careless: v2 was authored by
  hand, so it held whatever I remembered while writing it. This doc alone has
  about ninety items and v2 showed a handful. **`tools/status-board/harvest.py`
  now reads V0, BUILD, RESEARCH-BACKLOG, DESIGN and TABLES and extracts every
  item: 211 on the first run, against 20 hand-written.** Three files, three
  jobs: harvest decides what exists, `render.py` decides how it reads and holds
  the curated blocks, `template-v3.html` holds the design. **`build.py` fails
  the build if the page renders fewer rows than the harvest found**, because a
  silently dropped item is the exact failure this rebuild exists to prevent.
  New sections: the five-stage roadmap, How we get there (the pipelines as
  numbered steps), a plain-language glossary, and a sticky control bar with
  Expand all, Collapse all, Only open, Only your calls and a live filter.
  Three parser defects fixed on the way, each measured: sub-bullets were being
  listed as peers (now nested, demoted not deleted), the id regex read
  "17 screens have only the smoke floor" as item 17, and substring matching read
  COMPLETENESS as COMPLETE and filed the knowledge-base section as finished.
  Two output traps recorded in the skill: the page must be pure ASCII because
  the artifact host supplies `<head>` and any host without a charset guesses
  latin-1, and CSS `content:` needs a CSS escape rather than an HTML entity.
  Board: https://claude.ai/code/artifact/89cb5a79-9c6d-4b3b-8842-b5954f5ceaec


- **2026-08-06 (later) — THE ARENA, AND COPY A FRIEND WOULD ACTUALLY READ.**
  Aaron on the first rebuild: *"i cant even see that basketball court and ball
  in the background"* and *"this isn't a 5 min pitch to a CEO this is a launch
  page for a video game for friends and normal people."* Both right.
  **The backdrop is now the game's own painted arena** (`arena-menu.jpg`, the
  same image and the same treatment values as `#worldbg` on the main menu, per
  DESIGN.md § 9b) instead of the invisible SVG court I hand-drew. Portrait gets
  a different rule, the whole 16:9 painting as a band across the top, because
  `cover` on a 440px phone crops to a third of its width and all of it is the
  underside of the jumbotron. **The closing block was rewritten out of pitch
  language**: *the knowledge is the product* and *that bank is the whole thing*
  are gone, replaced with *Knowing ball has never won you a game before*, no
  made up stats, and the deep cuts you cannot get in another basketball game.
  One honest line under the league chips: orange is playable now, the rest are
  being built. `soon-check.mjs` grew to **77 passed, 0 failed** with two new
  assertions, that the arena is present and that no panel is thinner than 0.93
  alpha over it. The opacity check failed falsely on its first run because a
  gradient-filled panel reports `backgroundColor: rgba(0,0,0,0)`; it reads the
  gradient stops now and takes the thinnest. A new CLAUDE.md rule came out of
  this: the medium question has three answers, build it, source it, **or find
  it already built, and check the third one first.**
  Before/after: https://claude.ai/code/artifact/f0513485-df5f-4107-a245-5b6984148aa6


- **2026-08-06 — THE COMING-SOON PAGE, REBUILT (Aaron's screenshot).** He
  photographed an empty grey rectangle on his phone: three panels in a
  two-column grid left a fourth cell empty and the container colour showed
  through. I had "fixed" this earlier the same day by raising the column floor
  to 190px and verifying at **390px**, where two columns genuinely do not fit.
  **His phone reports 440px.** The number was never the bug; the layout's
  correctness depended on the panel count. Now: four separate cards with their
  own borders (an empty cell would be invisible) and an explicit column count.
  Also his brief, all of it: **one song** (Ketsa's "Grounded", the game's own
  menu theme) on a tap-to-play button that remembers the answer, no autoplay
  because mobile browsers refuse it; "timing hands" out of the tagline; **every
  em dash removed** from the page; four rewritten panels covering modes,
  leagues and eras, customisation and the possession; and a closing statement
  about the moat replacing the old footnote. Every claim on it checked against
  the code first: 3 modes live, 7 leagues with 2 unlocked, 8 decades, 12
  courts, 12 colour themes. New harness `tools/soon-check.mjs`: **59 passed, 0
  failed** across nine widths from 320 to 1280, asserting
  `(cols - cards % cols) % cols == 0` rather than eyeballing it, plus sound
  proved by the audio element's real state and a `play()` sabotage that shows
  the button lighting up while the sound check goes red. Before/after:
  https://claude.ai/code/artifact/f0513485-df5f-4107-a245-5b6984148aa6


- **2026-08-05 — MERGED TO LIVE (PR #1, 86 commits).** The first pull request
  this repo has ever had, and it sat open from 08-02 under a title describing
  only its first commit — a PR tracks a branch, so 85 later commits were swept
  in silently. Now merged; `main` went 93 → 180 commits. Live and verified by
  fetching the deployed files, not assumed: `DAILY_LEAGUES={nba:1,wnba:1,any:1}`
  and the `Run your` stamp label are both serving from bk-ballknowledge.com.
  Contents: 373 cards read against their sources (290 high confidence, 0 wrong
  answers, 22 bad citations repaired, 3 questions reworded); the Daily Five,
  scoped by tag rather than filtered at runtime and proved over a full year of
  3,650 cards; and the playthrough fixes — drill teardown on every exit route,
  the scroll chevron pointing at decoration, the Daily Five stamp affordance,
  9px type, the boombox, 20 gendered pronouns. 474 automated checks green.
  Gate deficit 45 → 47, the honest cost of tagging 35 neutral cards out of the
  shared pools so the daily stops dealing ABA questions.

- **2026-07-28 (76)** — THE TAG IS `fives`; THE OLD WORD IS GONE (Aaron: "I don't
  wanna use that anywhere anymore... there isn't anything negro anything" in
  basketball). Renamed everywhere, not just the label: 58 question tags, 20
  player records, 58 source slugs, the pack id, the preset lists, the code
  comments, the five research-archive files, and the research playbook. Tag is
  `fives` after the period term — teams were called "fives" for their five
  players — which is accurate and sidesteps the trademarked compound.
  THREE THINGS THE SWEEP CAUGHT THAT THE LABEL CHANGE ALONE MISSED:
  (1) **players.js — the file the game actually LOADS — was never updated.**
  data/players.json is the source archive; players.js is the shipped bundle, and
  it still had all 23 under the old tag, so entry 74's Original Celtics fix had
  not reached the game at all. Regenerated from source; Dehnert, Lapchick and
  Holman now really are out.
  (2) **The pack PRESETS still pointed at the old id** ('Hoop history' and 'The
  whole gym' listed `negro`), so after the rename they would have silently
  failed to tick the pack. Fixed before it shipped.
  (3) **DEEPRESEARCH_KNOWLEDGE.md — the live playbook for future research runs —
  still specified the old value in its JSON schema**, which would have made the
  NEXT run reproduce the error. Corrected, plus its Run 6 brief now says the
  Black Fives Era explicitly, warns not to borrow baseball's vocabulary, and
  records that the Original Celtics were a white team belonging to early-pro.
  DELIBERATELY KEPT — genuine BASEBALL references, which is the whole point of
  the distinction: the Goose Tatum card (he played Negro League baseball for the
  Indianapolis Clowns) and two players' baseball accolades.
  RULINGS LOGGED: Globetrotters stay split at 1950 (competitive Black Fives-era
  team vs modern exhibition act) — Aaron's call, now written into the playbook.
  The big history research run goes SEQUENTIAL, not fanned out — also his call.
- **2026-07-28 (75)** — "EARLY BLACK BASKETBALL" SHIPS AS THE INTERIM LABEL
  (Aaron's pick from the three options). No player-facing surface says "Negro
  Leagues" any more. Two stale code comments corrected in the same pass. One use
  of the term is deliberately KEPT because it is accurate: the Goose Tatum card
  asks about his Negro League BASEBALL career with the Indianapolis Clowns —
  which is exactly the distinction that makes the rest of the fix necessary.
  Outreach letter rewritten at Aaron's direction: it is a permission request, not
  an apology. Nothing shipped publicly and nobody saw the old label, so there is
  nothing to make amends for — the letter now simply says what the game is, what
  the section covers, and asks to use the proper term with a credit. Internal tag
  stays `negro` until the re-tag pass; label and tag get unified then.
  **DONE, and this line was stale (checked 2026-07-31).** The re-tag happened:
  the league id is `fives` everywhere, the picker says "Early Black Basketball",
  and a grep for `negro` across the whole repo returns exactly one hit — the
  string "Serbia and Montenegro" in a question's answer options. Aaron asked
  about this because he remembered the pre-rename state; nothing lingers. A note
  claiming outstanding work that is finished is worse than no note.
- **2026-07-28 (74)** — THE BLACK FIVES CORRECTION, PART 1 (Aaron: "there was no
  Negro League in Basketball, it was the Black Fives... this matters ALOT to me
  that we get this right"). He is correct. The Negro Leagues were BASEBALL. The
  parallel in basketball is the **Black Fives Era, 1904-1950** — 1904 when the
  game was first organized among African Americans at scale, 1950 when the NBA
  signed its first Black players ("fives" = the five on the floor).
  GOOD NEWS FROM THE AUDIT: our CONTENT is accurate — the 65 cards were real
  Black Fives history (the Rens' 88-game streak, Bob Douglas, Cumberland Posey's
  Loendi Big Five, Edwin Bancroft Henderson, Tarzan Cooper, Pop Gates and Dolly
  King integrating the NBL in 1946). One card literally defines the era. So this
  is a taxonomy error, not a research failure: we borrowed baseball's label.
  SECOND ERROR FOUND, fixed here: the bucket also held the **Original Celtics** —
  the famous WHITE barnstorming team, the Rens' great rivals. Wrong in the other
  direction and the kind of thing a knowledgeable player would catch. Re-filed to
  `nba` (the pro lineage, consistent with Aaron's ruling that the ABA merges into
  NBA): players Dutch Dehnert, Joe Lapchick, Nat Holman; and 6 questions (the
  pivot play, the 1922-23 record, the 1914 Hell's Kitchen origin, Walter Brown
  buying the name for Boston, "Mr. Basketball", "Break up the Celtics!"). Holman
  coaching CCNY to the 1950 NCAA+NIT sweep went to `college` by the rule from
  entry 70 (purely a college achievement). Verified no Original Celtics remain in
  the Black-basketball bucket. ABA confirmed already correct — 18 ABA players sit
  under `nba` and the leagues really did merge in 1976.
  STILL OPEN — the label itself. "Black Fives" and "Black Fives Era" are
  REGISTERED TRADEMARKS of Black Fives, Inc., coined by Claude Johnson through
  the research that recovered this history; their FAQ states the mark and gives
  no usage guidance. Outreach letter drafted at BLACKFIVES-OUTREACH.md for Aaron
  to send — asking permission to use the correct term plus an on-screen credit,
  and leaving room for collaboration. Until there's an answer the tag stays
  `negro` INTERNALLY but the player-facing pack label must not ship as "Negro
  Leagues" — see the interim options in §5.
  ALSO SURFACED, not yet fixed: women's basketball before 1997 is entirely absent
  (WBL 1978-81, the FIRST US women's pro league — Ann Meyers, Lusia Harris; and
  the ABL 1996-98, the first independent one; plus the AAU era before both). The
  men's pre-1960 pro era (ABL 1925-55, NBL 1937-49, BAA 1946-49) is in the player
  DB but unreachable in the era picker. And the Harlem Globetrotters currently
  sit in TWO buckets (Black Fives and street) — defensible as a period split
  (pre-1950 team vs modern exhibition act) but it needs a ruling.
  Tests: packstest now derives its expected counts from the live bank instead of
  hardcoding them, so a future re-tag can never false-alarm again.
- **2026-07-28 (73)** — "FULL KNOWLEDGE" IS NOW "ALL-TIME" (Aaron spotted the
  collision on the joiner screen). Three things were called Knowledge: the game
  itself, the era picker's all-eras option, and the difficulty bracket — and on
  the house screen the last two sat four rows apart meaning unrelated things.
  Worse, the era copy PROMISED something the engine doesn't do ("FULL KNOWLEDGE
  deals from every era") when era only picks rosters, so a player choosing the
  '90s could still be asked about Luka. Renamed in all four places (era button,
  caption, joiner row, help text). "Knowledge level" KEEPS the word — it's the
  game's thesis; the era option was the interloper. Vocabulary now locked:
  cards = questions · pile = what you can be dealt · packs = sources you add ·
  era = when · knowledge level = how hard.
  LOGGED FOR THE ERA WORK, not a bug today: the pack counter (736 for NBA) will
  overstate once era scoping ships — a '90s-only NBA game is really 489 cards
  (267 evergreen + 222 from the '90s), and the '60s just 348. The counter is
  correct today because era doesn't filter questions at all; when it does, the
  count must respect it (recommendation: show the count on the era screen too,
  so each screen owns the number it changes). 267 of NBA's 736 name no player
  and are always eligible — that's the floor no era choice can go below.
- **2026-07-28 (72)** — HOUSE SCREEN NAMES THE WHOLE PILE (Aaron, reading the
  joiner screen: the Packs row listed only the extras while its sub-line counted
  the whole pile, so the two disagreed — "it needs to include the pack of the
  league you choose, otherwise it should say additional packs"). Took the first
  option: the row now reads "NBA · College · Street Legends" above "941 cards in
  the pile", so the list and the number describe the same thing and the row
  answers "what am I being quizzed on" without the reader having to add the
  League row to it in their head. One line; the in-panel copy already named the
  league ("NBA + 2 packs") and needed no change.
- **2026-07-28 (71)** — QUESTION PACKS (unshipped — on the branch; Aaron: "some
  people may genuinely want to quiz on a combo of Big3, NBA and streetball, but
  cant as it stands"). Mockup approved before build ("you killed that").
  THE DESIGN CALL: league keeps doing its job — it decides your board and your
  player pool, and Aaron explicitly did not want to lose that link. Packs are
  TRIVIA ONLY and only ever ADD, so an empty set is exactly the strict gate from
  entry 69 and a pack can never thin a tier or skew a room. Rejected on the way:
  a standalone "custom league" screen (too big, and it would have made `league`
  ambiguous for the board) and a 5v5/3v3 + question-pile split (severs league
  from rosters).
  THE PANEL: one quiet line under the league card you just opened — a player who
  doesn't care never meets it. Opens IN PLACE (no new screen, no flow change):
  4 quick picks (Just my league · Hoop history · Pro circuit · The whole gym),
  6 toggles wearing their own rolodex colours, and a plain-English summary of
  what you built. The count is set in DSEG7 — the scoreboard's own LED, ghost
  8888 behind it — and rolls with the Coldest Call credit-meter easing, so a
  climbing number speaks the arena's language instead of reading like a web
  counter. Counts come from qCount() over the live bank, never hardcoded.
  THE PRIZE: College (120), Street Legends (85) and Negro Leagues (65) have
  questions but no rosters and no board, so 270 cards — 18% of the bank — were
  unreachable in every game. As trivia they need neither; packs is how they ship.
  Online: packs ride in houseRules/applyHouse and the house screen grew a Packs
  row naming them plus the pile size, so the joiner sees the deal before
  committing. CPU is untouched by construction (cpuRollCard is a dice roll on
  tier — it never reads a question).
  TWO REAL BUGS CAUGHT IN BUILD, both invisible to logic tests: (1) CSS class
  collision — `.pk` is the menu's card-fan decoration and `.chip` is the
  question-card difficulty badge, so the toggles inherited `position:absolute`
  and rendered at viewport width somewhere else entirely while the grid measured
  0px; renamed to `.qpk`/`.qchip` rather than fighting specificity. (2) The
  setup screen is a column flexbox and shrank the panel, clipping its own
  toggles; fixed with `flex:0 0 auto`. Both now have hard layout assertions
  (grid height, computed position, toggle width) so a collapsed panel can never
  pass green again.
  Verified: packstest (both viewports, baseline 736, own league never offered,
  presets, re-basing on league switch), leaguescope extended (packs reach the
  deal, empty set stays strict, the 3 rosterless pools reachable at last),
  packsnet (host ticks → guest inherits, house screen names them), plus meter,
  coachpause, drill, cpu, nbagame, a full online autopilot game and a full CPU
  game with the coach on — all green, zero page errors.
- **2026-07-28 (70)** — QUESTION-TAG CLEANUP + BACKLOG SPECS (unshipped — on
  the branch; Aaron's calls on the two open items from entry 69). (a) RETAG,
  by the rule he approved: if the SUBJECT is the pro league (draft position,
  pro career) the card stays; if it is purely a college achievement it moves
  to `college` and comes back when College is playable. 12 moved — Bird's 1979
  NCAA final, Jordan's 1982 title, Larry Brown's college championship (nba);
  Sue Bird/Taurasi at UConn, Caitlin Clark's NCAA record, A'ja Wilson's college
  title (wnba); Cosic (world); plus 5 in the non-selectable street/negro pools.
  5 deliberately KEPT because the subject is the pro draft: Draymond's 35th
  pick, and the four WNBA No.1-pick cards. (b) BIG3 AUDITED, nothing to move —
  all 77 big3 cards are genuinely BIG3 (rules, history, its own rosters) and
  their NBA references are the kind Aaron called fine ("Big3 relevant but
  references an NBA player"). The BIG3 problem is volume, not tagging, so it is
  logged as a mining ask instead. (c) Two features spec'd, not built: §6 · 22p
  OFF-COURT (a league-select toggle for what players are known for away from
  the game — cross-league by design because it is player-specific, new `off:1`
  field, celebratory-not-gossip guardrail) and §6 · 22q ERA-SCOPED QUESTIONS.
  Re-verified after the retag: 12,000 draws, four leagues, zero foreign cards;
  a real NBA game dealt 17 cards, all nba/any; every tier still fills.
- **2026-07-28 (69)** — YOUR LEAGUE MEANS YOUR LEAGUE (unshipped — on the
  branch; Aaron, playing Vs CPU: "chose NBA as my league, but ended up
  answering questions about streetball, and college ball as well"). Root cause
  was not a leak but a DELIBERATE widening in `leagueOk`: NBA drew from
  nba+college+negro+street, BIG3 from big3+nba+college+street, World from
  world+nba+negro, WNBA from wnba+college. The comment said it was to keep the
  pools feeling full "until they get their own selectable leagues" — the cost
  was that the league you PICKED stopped meaning anything.
  Now strict: your league + the league-neutral 'any' pool (origins, rules, the
  sport itself) and nothing else. college / negro / street are not selectable
  leagues (locked "in the lab" cards), so those questions now wait for the
  leagues that will own them. Second fix in the same path: `pickQuestionIdx`'s
  last-resort fallback re-opened the ENTIRE bank when a tier ran thin, which
  would have leaked every league straight back in — it now degrades to the
  league-neutral pool instead.
  Bank supports it comfortably (own + neutral): NBA 739 · WNBA 421 · World 358
  · BIG3 243, every tier 0-4 able to fill a draw. Toss-up unchanged — it is
  league-neutral by design (it runs before a league is chosen) and verified so.
  Verified: 12,000 draws across all four playable leagues with ZERO foreign
  cards, every tier filled, plus a full real NBA CPU game whose 16 dealt cards
  were all nba/any; meter, coachpause, drill and cpu suites still green.
  OPEN FOR AARON (content, not code — deliberately not silently changed):
  (a) 17 questions sit in a pro league but ask for a college answer, e.g.
  "Larry Bird carried which small school to the 1979 NCAA final?" (nba) and
  "Caitlin Clark broke the all-time NCAA scoring record at…" (wnba). Proposed
  rule: if the SUBJECT is the pro league (draft position, pro career) it
  stays; if it is purely a college achievement it retags to 'college'. That
  moves ~6, leaves draft questions alone. (b) BIG3 now runs ~69% league-neutral
  cards, so its games will feel generic until the BIG3 pool grows — options are
  live with it, write more BIG3 questions, or deliberately let BIG3 keep NBA
  (it is half-court ex-NBA ball).
- **2026-07-27 (68)** — "GAME PAUSED" NOW ACTUALLY PAUSES (unshipped — on the
  branch; Aaron, playing the CPU build: "the coach popups that should pause the
  game all together do not do so"). Audited the whole engine against the claim:
  `BKCoach.tipUp()` was read in exactly ONE place out of ~72 timers — the :24
  shot clock — so everything else played on behind a card headed COACH · GAME
  PAUSED. Reproduced before touching anything: the CPU took a full possession
  and SCORED during 6s of "pause", and a coach card over a live question let
  the 15s deadline run out and auto-answered the player WRONG ("CLOCK — BRICK")
  for reading the tutorial. 64 confirmed defects (24 critical) across six
  dimensions.
  THE FIX — one shared freeze primitive (`freezeGame`/`thawGame`/`gameFrozen`
  + `fTimeout`, a setTimeout that survives a pause), because two features that
  both mean "the game is held" should not be two half-implementations.
  Contract: deadlines RESUME with the ms they had left (an offline tip has no
  time limit, so restarting would gift free seconds and letting it run was the
  bug); NEVER freezes online (the card is deliberately non-modal there — one
  phone stopping desyncs the room) or drills (the drill poller is the only
  thing that advances a drill); rendering and audio keep going.
  Now held: the CPU loop and every in-flight CPU decision, the 15s card
  deadline (JS + the LED + the CSS bar), the meter's 3s auto-grade and its
  sweep, card battles, sudden death, the animation-completion callbacks (the
  engine's real play-resolver — buckets, possession, game-over), the jump-ball
  countdown and the CPU's buzz/answer, and the keyboard buzzers that punched
  straight through the veil.
  Also: the PAUSE MENU now freezes too (it never stopped the shot clock — you
  could eat a 24-second violation during a timeout); the coach layer moved
  above the help card and the Rulebook (z43/44 → 47/48) so the modal can't be
  buried by something still clickable; tips no longer fire over the pause
  menu, victory screen, help card or a screen stacked on the game; the
  'inbound' and jump-ball tips got the CPU guard 'slide'/'select' always had;
  the arena match clock stops lying through a pause; a double-tap on the card
  front no longer orphans a timer that auto-missed a LATER play; and the
  'first' tip now waits for the player's own first decision instead of talking
  over the jumbotron and tip-off (which used to play out, and be decided,
  entirely behind it).
  Verified: new coachpause suite (deadline holds and resumes mid-count, CPU
  frozen then resumes, pause menu freezes the :24, cinematic open left alone),
  6/6 full CPU games with the coach on ran to a natural finish with every tip
  freezing and thawing and no deadlock, plus meter/drill/cpu/online suites and
  a full online autopilot game green. NOT changed: online semantics, wire
  format, save/room format. Known leftovers logged, not fixed: #rebveil is dead
  markup, and callouts still don't queue (moot now that nothing fires behind
  the veil).
- **2026-07-27 (67)** — THE UPSIDE-ONLY RELEASE METER (unshipped — on the
  branch; the 8-case review Aaron approved with "build it"). The rule, now law
  (DESIGN.md §3b): **the only thing that can erase a right answer is the
  opponent's right answer.** Open-look shots splash straight from the card —
  no meter on the game's most common beat. Contested shots keep the meter as
  pure upside: dead center DENIES the block card and rises clean; anything
  else — including never tapping (the 3s timeout now locks the marker where
  the sweep stands; the auto-worst-shank is dead) — just lets the contest
  play out on cards. Risky passes (laser / dish / heave) connect on a right
  answer, period: the THREAD IT meter is gone (no contest interplay = pure
  downside). CPU meter profiles now express one thing — deny-rate on its
  contested shots (same knobs: Rookie ~12%, Pro ~28%, All-Star ~48%). Online
  keeps its shape: the 'meter' net event and mid-meter resume logic are
  untouched; you simply only watch the sweep on their contested shots. Bar
  art lost its red shank edges. Copy sweep shipped with it: coach meter tip,
  rulebook (shooting / passing / contests & blocks), the Shooting drill
  restaged with Coach's big man camped rim-side so the meter is taught on an
  honestly contested look — and a stale find fixed in passing: the rulebook
  still called rebounds a tap-race ("mash A / L"); boards have been
  sudden-death cards since the mash was replaced. BIG CATCH FROM THE E2E RUN:
  removing the meter exposed a latent netcode skew — the answering phone
  shows its card result for 1400ms before resolving, but the receiving phone
  resolved the 'card' event INSTANTLY; every no-meter play (open splash,
  completed pass) then flipped possession and acted on one phone while the
  other was still reading its result (deterministic online deadlock, 4/4
  repro via autopilot + relay wire logs — the old build only survived
  because the meter round-trip was an accidental sync barrier on exactly
  those plays). Fix: the receiver now mirrors the 1400ms beat before
  resolving 'card', and 'meter' waits for the local meter to exist (battle-ev
  pattern) instead of dropping a fast tap. Verified: metertest (23 asserts,
  all engine cases), drillmeter (restaged drill, both viewports), cpumeter
  (deny + no-deny, pinned dice), onlinemeter (contested shot over the real
  relay: watch mode, block card, splash + possession synced on both phones),
  3× full online autopilot runs in lockstep. Zero page errors throughout.
  No wire-format or save/room changes.
- **2026-07-27 (66)** — SCOREBOARD INTEGRATION: THE n-7 RIG IS THE HUD
  (unshipped — the 22b build, to entry 65's locked spec). The old scorebar is
  gone; every mode now plays under the real board: full-width n-7 strip
  (37KB webp, cqw-sized so it's drift-proof at any width) with team-color
  squad names on the HOME/AWAY plates (shrink-to-fit + abbrev below the 55%
  floor AND below 8px — phones abbreviate extreme names), amber LED scores,
  a ticking match clock + period in the center stack (ghost "88:88" + live
  DSEG7 in the same box), possession arrows flanking PERIOD (hudPoss drives
  them; turn spotlight still dims the idle side's plates), and the shot
  clock LIVE in the wing unit (red LED, hot-pulse under :05 — the colon is
  gone, scoreboard-style bare digits). LEFT WING = CONTROL DOCK: menu /
  replay / music / help + the Coach whistle (quick on/off with a callout);
  under 700px the dock folds to ⋯ + the dropdown tray (all five, tap-size
  kept). Mode/target/quarter info rides an LED ticker strip under the board.
  n-8 JUMBOTRON BEATS (81KB webp): tip-off intro, quarter breaks, sudden
  death — big board dressed live (team-color panel glows, squad-jersey
  emblems with monogram, names+scores, possession arrows, clocks), 2.1–2.6s
  hold, z-below callouts so END OF Q1 pops over it. Fix that fell out: the
  n-8 art's baked ghost clock digits flattened (the "weird shadow"). Desktop
  media block slimmed (board self-scales). Verified: sbgame + sblive E2E
  both viewports (fit, beats, dock, tray, coach toggle, abbrev, zero
  errors); localflow + lockertest green. Screenshots sent. Play-by-play
  language and the game-menu-in-dock idea still open under 22b.
- **2026-07-27 (65)** — SCOREBOARD ART: DECIDED + ASSETS LANDED (unshipped;
  no game code yet). Two Drive rounds (30 pieces) graded in the live-demo
  comparison artifact; Aaron picked and hand-tuned. FINAL: HUD = n-7 strip
  (HOME/AWAY plates, center game-clock+period stack, shot-clock wing) ·
  JUMBOTRON = n-8 (front-on, all sockets labeled, lit rig). Cleaned
  production assets in docs/play/assets/scoreboard/ (hud-n7.png,
  jumbo-n8.png — LED sockets flattened; artwork otherwise untouched).
  LOCKED SPEC for integration (final, Aaron-tuned in the artifact):
  overlays in % of the art, fonts in container units (drift-proof);
  ghost+live DSEG7 stacks on every clock (shot-glow tightened to 5px);
  n-7: name 0.90 @1,1.5 · score 0.75 @0.25,0.5 · shot 0.85 · POSSESSION
  ARROWS (amber LED ◀▶, stubby aspect 0.92, replace the old dot) at L@45.7 R@53.4, both top 40.8 (leveled)
  flanking PERIOD · left wing = CONTROL DOCK (menu/replay/music/help +
  Coach whistle). n-8 jumbotron: big grey panels carry team-color glow +
  squad-jersey emblems (jer 1.15@3), clean name+score screens (n3
  1.00/1.00), possession arrows in the center POSS box (left:44.8,
  top:53, w:10.6, h:5.6). Names shrink-to-fit, abbrev fallback below 55%;
  away mirrors home offsets. Next: the 22b integration build — replace
  #hud with the n-7 rig in-game, jumbotron on tip-off/quarter/sudden-death
  beats, desktop+mobile screenshots before ship.
- **2026-07-27 (64)** — LOCKER ROOM (unshipped — Aaron's agenda #4, mockup
  approved same day). CPU mode gets a real theme step: squads → LOCKER ROOM →
  Game Format. Two big showcase squares — home court wearing the full scene
  art (classic renders its CSS look), and a big staged jersey on a
  color-matched glow with the squad name on the kicker. Tapping a square
  opens the existing picker; lock or back routes straight back to the locker
  (LK.ret), which re-dresses instantly. The colors/court rows leave the
  Game Format screen in CPU mode (they were the buried version of this).
  rulesBack and the CPU pick interstitial now route through the locker;
  back arrow wired (BACKMAP). Local VS + online untouched — their spoils
  flow already owns these picks. Verified: lockertest E2E mobile + desktop
  (squares open/return/re-dress, rows gone, tip-off launches), localflow +
  online two-phone green. Mockup artifact: theme-mockup (claude.ai).
- **2026-07-27 (63)** — DESKTOP SIZING PASS (unshipped — Aaron's agenda #3:
  "hard to see timeline" — which turned out to be literal: the era screen's
  TAP THE TIMELINE coins). One @media(min-width:1100px) block at the end of
  the stylesheet: in-game HUD steps up (scores 24→34, squad names 15→21,
  mid 13→16), banner 13→16 + bigger turn chip, shot clock LED to 58px,
  question card widens 360→520 with 20px questions / 17px answers / 27px
  card countdown, action notes + big buttons up, and the ERA TIMELINE gets
  60px coins with 22px years and 12.5px nicknames at a gentler slant on a
  680px rail. League rolodex already read fine — untouched. Lesson learned
  the hard way: the block must live at the END of the stylesheet or
  equal-specificity base rules silently win. Mobile untouched (media-gated,
  localflow green). Desktop screenshots sent.
- **2026-07-27 (62)** — REAL INBOUNDS: TAKE IT OUT, STEP BACK IN (unshipped —
  Aaron's photo: the inbounder stood ON the court holding the ball; plus
  "out of bounds should inbound from where it went out, not under the rim").
  The inbounder now stands OUTSIDE the lines in the floor apron (the apron
  deepened 22→36px so sideline spots have real floor): made buckets and
  boards-out take it out behind the baseline beside the stanchion; dead
  balls (sailed passes, backcourt, 3-in-key, shot clock) take it out just
  past the line NEAREST where the ball died (baseline mid-rows sidestep the
  rim). After the pass is away the inbounder animates back onto the nearest
  open tile; a whistle with someone still in the strip snaps them home
  (inbRestore). Rules guards: no stealing from the inbounder, an off-court
  inbounder can't be called for camping the key. Big3 half court keeps its
  on-floor check-up. Verified: inbtest E2E — real game to a made bucket
  (stand at (15,2) off-court, step-in returns all 10 to the floor) and a
  dead ball at (6,6) inbounded at its nearest edge (6,8); localflow + online
  two-phone green.
- **2026-07-27 (61)** — WHOSE-TURN SPOTLIGHT (unshipped — Aaron: "sometimes
  it's hard to tell whose turn it is"). The old signals didn't say it: the
  HUD ball-dot marks POSSESSION (it stays on the offense during the
  defense's slide — actively misleading), and the banner named the actor in
  uniform text. Three reinforcing cues now, all driven off the live phase
  state on one watcher (def-slide = defense; off/inbound phases = offense;
  cards/battles hold the spotlight; jump ball = neutral) so they can never
  drift: (1) a turn chip leading the banner — "▶ SHO" in the acting squad's
  jersey color with luminance-picked ink; (2) a court vignette that washes
  the board edges in the acting team's color (crossfades on turn change);
  (3) the idle squad dims in the HUD. Banner text moved into #bannerTxt so
  the chip keeps its slot (banner() untouched at call sites). Verified:
  turnshot E2E — real local game, offense shows purple chip/glow/dim, one
  move later all three flip to Shamrock green on the defense; localflow +
  online two-phone green.
- **2026-07-27 (60)** — SPOILS FLOW GETS A REVERSE GEAR + THE CHEVRON RETURNS
  (unshipped — Aaron: colors and court screens had no way back and no down
  arrow). Local play can now walk the whole call chain backward — court call
  → loser's jerseys → winner's jerseys → THE CALL panel (prize re-clickable)
  — with each squad's pick preselected when stepping back in. Online keeps
  every call-mode back hidden: the spoils ride the wire and can't rewind on
  one phone. The scroll chevron shows on sticky-bar screens again, floated
  just above the Lock bar instead of colliding with it (its old exemption
  assumed the bar implied "more below" — it didn't read that way). Verified:
  spoilsback E2E green (back arrow live at every call stop, picks preserved,
  chain still lands on league), localflow green, online two-phone flow green.
- **2026-07-27 (59)** — KNOWLEDGE LEVEL READS LIKE A CHOICE (unshipped —
  Aaron: the tier font on the game-format screen was too small to read as
  the thing you're selecting). The Casual→Legend rungs go 14px→17px (all
  five still fit their columns on a 390px phone, verified no overflow), the
  Same level/Handicap cards match at 17px, Surprise Me 13→14.5px, and the
  "Knowledge level" section label steps up 9.5→11.5px with brighter ink.
  Shared classes, so the handicap and online rules screens inherit it.
  Killed a dead duplicate .klbtn rule while in there. Mobile + desktop
  screenshots sent; localflow green.
- **2026-07-27 (58)** — NOBODY RIDES AS BLUE (unshipped — Aaron: local VS
  squad two showed "BLUE" through all of setup no matter its name). Root
  cause: an EMPTY name field fell back to the legacy 'Orange'/'Blue' labels,
  not to the suggestion the screen advertises — and squad two's field is the
  one that's usually left empty (its placeholder even LOOKS like an entry;
  see entry 57). Empty fields now take their placeholder identity (Showtime /
  The Bricks, abbrevs included); guests suggest The Bricks so two empty
  phones online can never collide. Same sweep caught CPU play: with no
  jersey picked the machine kept the classic-Blue default and the versus
  marquee read stale TEAM values. The CPU now always contrasts a real
  colorway (vs default orange when the player never suited up) and
  beginMatch applies both identities BEFORE the versus screen. Verified:
  blank-fields local VS rides as Showtime/The Bricks through toss-up + HUD,
  solo fresh-phone tips off as "Showtime VS Tricolore" (was SHO vs BLU),
  localflow + nametest (online, no Orange/Blue) green.
- **2026-07-27 (57)** — SAVED SQUAD SAYS SO (unshipped — Aaron: "why are only
  the bottom name squares highlighted?" — his phone's remembered squad had
  silently pre-filled Squad One, killing its glow with no explanation). The
  names screen now labels the memory: a small "SAVED SQUAD · TAP TO CHANGE"
  pill on the pre-filled card (hides the moment they edit), and placeholders
  everywhere on the name screens render dim + italic so a suggestion can
  never be mistaken for an entry. Verified: pill on when bk_cw exists, off
  on fresh phones and after editing, placeholders italic, localflow green.
- **2026-07-27 (56)** — SECOND-PICKER GIANT CARDS: REAL ROOT CAUSE (unshipped —
  Aaron: still broken in local VS after entry 54's fix). Installed real WebKit
  into the harness and reproduced on iPhone-13 emulation: entry 54's "Safari
  flex-stretch" diagnosis was WRONG. The true cause is a CSS class collision —
  the versus screen's `.clash` container rule (`height:min(66vh,580px)`) also
  matched the picker's `.cwc.clash` "too close to theirs" cards, ballooning
  every row that held one to ~66vh. Only the SECOND picker has clash cards,
  which is exactly why only it broke, in every mode. Renamed the versus
  container to `.vsclash` (CSS + markup; no JS referenced it) and left a
  keep-state-names-unique note at the picker CSS. Bonus fix the repro exposed:
  both pickers now reset scrollTop on rebuild, so the second picker starts at
  the top instead of wherever the winner left it. Audited for other bare
  state-class rules (sel/taken/active/…): none. Verified: WebKit iPhone repro
  now renders all 24 cards at ~129px (was 14 cards at ~440px), versus screen
  intact after rename, chromium localflow ALL GREEN, online two-phone flow
  green through colors/courts/reveals/game.
- **2026-07-27 (55)** — LOCK IT IN RIDES THE VIEWPORT (unshipped — Aaron:
  picking a jersey then scrolling to the basement for Lock made no sense;
  the court picker had it too). Both pickers' action bars are now STICKY
  at the bottom of the screen with a fade backdrop — pick a card anywhere,
  Lock is right there. The scroll-hint chevron yields on screens that
  carry a sticky bar (the bar itself says more-below). Verified: lock
  visible top-of-screen and mid-scroll on both pickers, chevron off,
  localflow green.
- **2026-07-27 (54)** — iOS SAFARI GIANT-CARD FIX (unshipped — Aaron's
  photos: the SECOND jersey picker exploded on iPhone, single cards
  stretched to full viewport). Diagnosis (couldn't repro locally — no
  WebKit in the harness; classic engine bug by symptom): Safari stretches
  a grid that is a child of a centered flex column and pours the surplus
  height into the ROWS. Hardened .cw-grid and .crt-grid with
  grid-auto-rows:max-content + align-content:start + flex:0 0 auto — the
  stretch mechanism is gone on every engine. Chromium regression green.
  NEEDS AARON: confirm on-device after ship.
- **2026-07-27 (53)** — LOCAL VS MATCHES ONLINE: LOSER SETS THE SCENE
  (unshipped — Aaron's call). Pass&play now runs the full spoils ritual:
  call winner suits up → loser suits up → LOSER picks the court → setup
  continues to league. The rules screen hides BOTH colors and court rows
  in local VS (spoils spent at the call); vs CPU keeps both rows (no
  toss-up against the machine). Court sub-copy drops "both phones" on
  one shared screen. localflow updated for the new beat + newflow online
  regression — all green.
- **2026-07-27 (52)** — CPU PICKING IS ITS OWN BEAT (unshipped — Aaron: the
  CPU LOCKS ITS FIVE callout slammed on top of the rules screen and read
  as UI). The machine drawing its squad is now a quick two-beat waiting
  veil: robot + "ROOKIE is picking its five…" (1.3s) → "ROOKIE LOCKED
  ITS FIVE. Your house rules, coach." (0.9s) → rules screen, veil gone.
  Verified: both beats render, lands clean on rules, zero page errors.
- **2026-07-27 (51)** — THE LIGHTNING STRIKES IN YOUR COLORS (unshipped —
  Aaron flagged the versus screen still orange/blue; partly a live-vs-
  staged artifact since names-first CPU wasn't shipped, but the bolt art
  and a medallion stop were truly hardcoded). The clash bolt is now TWO
  ARMS of the same PNG, each clipped (top/bottom halves) and hue-rotated
  from its baked base (orange ~28deg, blue ~212deg) to the team's REAL hue
  via a --tint var that survives the strike-flash keyframes; the VS
  medallion deepens from the team primary instead of #c9641a. This settles
  open Q21-4: the bolt is REACTIVE (brand marks stay brand). Everything
  else on the screen (labels, washes, accent bars) was already var-driven.
  Verified: Lake Show purple vs Beantown green — both arms, medallion,
  and chrome in picked colors, zero page errors.
- **2026-07-27 (50)** — SCROLL IS NOW AN INVITATION (unshipped — Aaron:
  nothing said the colors grid keeps going). A bobbing orange chevron sits
  bottom-center on ANY setup screen with content below the fold; it hides
  at the bottom, never appears over the game board or loading, respects
  reduce-motion, and tapping it smooth-scrolls most of a viewport. One
  generic watcher — every current and future scrollable screen gets it
  free. Verified on the colors grid: on at top, gone at bottom.
- **2026-07-27 (49)** — COLORS SCREEN IS JERSEYS ONLY (unshipped — Aaron
  spotted the Squad name/Scoreboard fields still living at the bottom of
  Team Colors in every mode, leftovers from before names-first). When an
  identity already exists (every normal flow now), the name box hides and
  cwIdent sources {nm,ab} straight from the names-screen identity — no
  accidental mid-suit-up renames. The box only appears in the (practically
  unreachable) no-name fallback. localflow updated + green: box hidden,
  names still ride call/colors/HUD end to end.
- **2026-07-27 (48)** — THE CPU READS AT HUMAN SPEED (unshipped, rides with
  46/47 — Aaron: the comp buzzes the tip-off before a person can read the
  card). The CPU jump-ball buzz now floors at a reading time computed from
  the ACTUAL question (1.4s + 32ms/char — an 87-char card = 4.2s minimum)
  before its level-based reaction roll. Its edge is knowledge, never robot
  eyes. Measured live: Legend CPU buzzed at 5.7s on an 87-char card.
- **2026-07-27 (47)** — THE CARD CLOCK GOES LED (unshipped, rides with 46).
  Aaron asked how the shot clock works in sudden death — answer: possession
  clocks freeze during any card, but every card arms a 15s window where
  timeout = wrong answer (= the loss in battles/sudden death). That timer
  was only a subtle shrinking bar, so the card face now carries a DSEG7
  LED countdown next to the bar — amber, flips red + pulses under :05.
  Wired to the same deadline as the real qTimer; cleared everywhere the
  timer is. Verified live: :04 red at 11.5s into a drill card.
- **2026-07-27 (46)** — TAP-OFFS ARE DEAD, LONG LIVE SUDDEN-DEATH CARDS
  (unshipped — Aaron + a tester: the mash battles were no good). All four
  tap-off sites (boards, ANKLE BATTLE, RIP OR GRIP, at the rim) now settle
  on trivia: the team WITHOUT the edge answers first, the FIRST wrong
  answer loses outright; both right = next round one tier harder (r1
  medium, r2 hard, r3 legendary); survive all three rounds and the EDGE
  team takes it (DEADLOCK — the edge settles it). Same startTapBattle
  interface, so all four call sites kept their onWin continuations.
  FUTURE (Aaron): player ratings bend these battles (order/tiers) when
  stats land — logged with AL-2. NETCODE (two real bugs found by
  harness): (1) the deal timer could lose a fast opponent answer —
  pending now arms SYNCHRONOUSLY at every transition, show-timers carry a
  staleness guard; (2) two perfect players looped forever (round 16 in
  testing) and drifted — battles are now HOST-ARBITRATED (bstep/bwin
  events; guests answer but never self-advance), per the invariant.
  Mash leftovers removed: battleTap, endBattle, rz taps, the tap net
  event, the keyboard-mash branch (A/L still work the buzz races). Coach
  tip + rebound drill + Rulebook copy rewritten for the new rule.
  Verified: rebound drill first-miss-loses, forced two-phone battle in
  perfect sync ending on the edge cap, newflow full game with scores
  flowing, localflow — all green, zero page errors.

- **2026-07-27 (45)** — COACH TIPS TRULY PAUSE (unshipped — Aaron: you
  can't read a lesson while the shot clock runs). Solo & hot-seat tips are
  now REAL pauses: dimmed backdrop blocks the game, the card centers as a
  modal reading COACH · GAME PAUSED, the clock freezes (clockTickable
  consults BKCoach.tipUp), and nothing resumes until Got it — no
  auto-dismiss while paused. Online keeps the quiet corner card (freezing
  one phone's clock would desync rooms). Select/slide tips now fire only
  on the HUMAN's decision, never during the CPU's turn. Verified: intro
  modal centered + veil up + clock frozen in a live CPU game, resumes on
  dismissal into the next lesson, zero page errors.
- **2026-07-27 (44)** — NAMES FIRST, EVERY MODE (unshipped — Aaron's rule:
  the game never says Orange or Blue). Online joined the club: room
  creators name their squad right after Create (before league), guests
  name theirs right after I'm-in (before the toss-up). Names sync over the
  wire ({a:'name'} announce — own-side declare + broadcast, no races, per
  the netcode invariant; host re-announces on every pair so rejoins heal),
  live-refresh the toss-up buzzers and heads-up card, and the guest
  heads-up says "Showtime's room · You'll be Blue-until-you-name".
  Fixed in review: startNames wiped the guest's copy of the host name.
  Verified: NEW nametest.js (two phones, 11 asserts, "nobody says
  Orange or Blue" green) + patched newflow full-game + localflow, zero
  page errors.
- **2026-07-27 (43)** — CPU NAMES-FIRST (unshipped — Aaron: you picked your
  team before naming it vs the CPU; names-first had only gone into Local
  VS). The CPU flow now runs level pick → NAME YOUR SQUAD (single glowing
  card, "the machine names itself") → league → era → squads, so the
  reveal says "Dynasty's Starting Five" and the HUD wears your abbrev
  from the jump. The colors row prefills the squad name over the
  colorway's. BONUS BUG FOUND IN THE SAME CODE: beginMatch recomputed the
  second colorway via auto-contrast even in hot-seat, silently clobbering
  the call-loser's picked jersey at game start — cw[1] is sacred now.
  Names-only players keep classic-Blue CPU (no bad contrast base).
  Verified: CPU E2E (names screen, header, DYN vs BLU HUD) + localflow
  ALL GREEN, zero page errors.
- **2026-07-27 (42)** — ZOOM ESCAPE HATCH (unshipped — Aaron's brother got
  stuck zoomed with no way back). The iOS page-zoom guards already existed
  (gesture* preventDefault + touch-action) and pointercancel cleans stale
  pinches — the real gap was NO VISIBLE WAY OUT of the in-game camera
  zoom, especially with a card/veil covering the canvas. New: a ⤢ RESET
  VIEW chip (top-left, mirror of the shot clock) appears the moment the
  camera leaves 1× and snaps zoom back on tap, clearing any half-dead
  pinch/drag state with it. Verified: hidden at 1×, appears at 1.6×,
  resets and hides on tap, zero page errors.
- **2026-07-27 (41)** — DRILL GUARDRAILS (unshipped — Aaron got stuck moving
  a defender in the steal drill on desktop). (1) Drills now LOCK the lesson:
  each drill declares allowed actions; off-script commits bounce at the
  engine chokepoints (commitStaged/doShoot/startStealTry) with a panel
  SHAKE + "Stick to the drill" re-prompt — the stage survives so Cancel
  still works. (2) Coach panel grew always-visible ↺ Restart and ✕ End
  drill buttons (the floating chip was too hidden). (3) offtrack safety
  net: a drill that escapes its script (e.g. Stay put in the steal drill)
  announces "running it back" and auto-restarts. Verified: Aaron's exact
  repro blocked with shake, restart works, stay-put auto-recovers, End
  returns to the Rulebook, zero page errors.
- **2026-07-27 (40)** — THE COACH ARRIVES (unshipped, awaiting sign-off).
  FL-2.6 built to Aaron's spec, the Philosopher is the coach. (1) COACH
  TIPS: first-time pop-up cards during real games (intro holds until Got
  it; one tip at a time; each situation fires once per phone; Coach off on
  every card + a Control Room switch, default ON). Situations: intro,
  possession, confirm, cards, meter, slides, crossovers, tap battles, jump
  ball, inbounds. (2) THE RULEBOOK went clickable: 15 fold-open topics in
  the house language; 7 carry a RUN THE DRILL button that boots a Big3
  sandbox (real engine, resume-mode, frozen clocks, t:0 cards, vs THE
  COACH) where the coach narrates and advances by WATCHING live state —
  zero engine forks. Drills: basics, passing, shooting+meter, crossover,
  screens, defense/steals, rebounds (brick-on-purpose). Diploma overlay
  drops the grad cap; End-drill chip bails anytime. Engine hooks: DRILL
  global + clockTickable/shiftTier guards + drill-freeze after buckets +
  BK.coach bridge (game.js is an IIFE). All 7 drills boot-verified, shoot
  drill completed end-to-end (2-0, diploma, back to Rulebook), tips
  verified in a live CPU game, zero page errors.
- **2026-07-27 (39)** — THE SHOT CLOCK IS A REAL LED UNIT (unshipped, awaiting
  sign-off): DSEG7 seven-segment face (keshikan, SIL OFL, self-hosted woff2),
  bigger (34-44px), amber LED glow in a dark housing, flips red-hot under
  :05; loading + brains clocks joined the LED language. HUD mid strip
  (Aaron: "illegible random words") bumped 10px→13px bold brighter ink,
  wraps to two lines on phones instead of truncating. Also struck brother's
  rules input from the needs list (Aaron: ignore it).
- **2026-07-27 (38)** — ONLINE DOOR + DESKTOP BUZZERS + MENU TRUTH (unshipped,
  rides with 37). Four more from Aaron's session:
  **(a) Carded at the door** — clicking Online now PROBES the bouncer
  immediately (gateProbe: quiet dial + t:'access' with the stored pass;
  relay answers ok+gate). Invite-only run + no valid pass = THE GUEST LIST
  drops before you touch create/join — nobody walks all of room setup just
  to get bounced at "get my code". Valid stored pass shows "You're on the
  list"; open relay changes nothing. GATE.probe branch keeps the old
  deny-time flow intact as the fallback.
  **(b) Menu honesty** — Online button now says "ALPHA · access code
  required" so a code-less click is never wasted. Vs CPU promoted to slot
  01 as "Play · Vs the CPU — the main event" (exhibition-first, like a
  sports title); pass&play renamed "Local VS · one screen" (two squads,
  pass-n-play). STORY MODE noted for the future roadmap — CPU-first menu
  is the doorway it will live behind.
  **(c) Room setup leak** — the creator could pick jersey + court even
  though BOTH are online toss-up prizes (winner's colors, loser's court).
  klRulesSync now hides both rows under ROOMSET/NET.
  **(d) One mouse can't buzz-off** — desktop keyboard buzzers: squad ONE
  = A (or Q), squad TWO = L (or P), wired to ALL two-sided races: toss-up
  buzz, jump-ball slap, rebound/rip-or-grip tap battles. Guards: never
  while typing, never the CPU's side, never the other phone's side online.
  <kbd> chips render on the buzzers/zones only on hover+fine-pointer
  devices (phones never see them). Tap-battle zones also stopped saying
  Orange/Blue — they wear squad names now.
  Verified: NEW gatetest.js (gated relay: door-card, stamp-in, roomset
  rows hidden, stored-pass skip — 7 asserts) + NEW keytest.js (chips
  visible, L buzzes squad two, A dead after buzz) + localflow + cpuflow +
  newflow + drops2 all green, zero page errors.
- **2026-07-27 (37)** — AARON'S PLAYTEST BATCH (unshipped, awaiting sign-off).
  Five fixes from a real phone session:
  **(a) Names first** — pass&play opens on a NAME YOUR SQUADS screen
  (screen-names, registered in screens{}+BACKMAP) before the toss-up; the
  fields GLOW until filled (:placeholder-shown pulse, also added to the
  colors-screen name box), blocklist enforced, slot 0 prefills from bk_cw.
  teamFromCw learned to carry {nm,ab} with no colorway id (default colors,
  their name) so buzzers, THE CALL, squad reveal, tipveil slap zones, HUD
  and victory all speak squad names from the jump.
  **(b) THE BUG: local colors** — pass&play now runs the same
  winner-suits-up-first → loser-picks-clash-guarded sequence online uses,
  right after THE CALL (cwAdvance grew a !NET.on branch; localColorCall).
  The rules-screen colors row hides in pass&play (already picked); the
  colorway card click no longer clobbers a pre-set squad name. Online
  verified untouched (newflow + drops2 green).
  **(c) THE CALL readability** — "X WON THE TOSS-UP" is now big Anton in
  accent orange (was 11px mono eyebrow); sub-lines bumped.
  **(d) Colors/court prominence** — rules rows: taller, jersey/hoop icons,
  "pick ›" chip in accent, and a .todo glow-pulse until this phone has
  actually picked.
  **(e) No more tofu** — Aaron's phone rendered the jersey/stadium/ball/die
  emoji as crossed boxes. Every emoji-block glyph in UI chrome is now a
  self-hosted inline SVG (<symbol> set in index.html + ICO() in game.js):
  ball, die, jersey, hoop, bell, lock, hand, card, tap, robot, shield,
  key. BMP glyphs (music note, gear, check, cross, warning) stay text.
  Four textContent sites flipped to innerHTML for the icons.
  PLUS: gender-neutral sweep of the question bank — 15 pronoun fixes in 11
  generic rules/scenario questions ("the official… they"); all 200
  named-real-player references untouched; bank still parses.
  Verified: NEW localflow.js harness (names → toss-up → call → both-pick
  colors → league → squads → rules → live game, 18 asserts ALL GREEN) +
  cpuflow + newflow (two phones, full synced game) + drops2, zero page
  errors.
- **2026-07-27 (36)** — LOGO INTEGRATION, site-wide (SHIPPED, live on
  main). Aaron picked plan A+site from three in-situ mockups: **crest**
  — #48 sits above the wordmark on the title screen (reused the dormant
  #logo slot + logoPop entrance, added crestbob idle float, shrinks on
  short screens); **victory** — the grad cap (#64, Aaron's favorite) drops
  onto the winner's slam text with a bounce + sway, glowing in the winner's
  color, pulled inboard on narrow phones so it never clips, and NEVER
  crowns the CPU (machine wins get no cap); **landing page** — from stale
  "under construction" to storefront: #76 emblem floats over the wordmark,
  PLAY THE ALPHA button (menu-button styling) links to /play/, #48 corner
  bug, status line says the alpha is playable; retired the CSS bouncing
  ball (redundant next to the emblem). New assets: brand/gradcap.png,
  brand/mark76.png.
- **2026-07-27 (35)** — THE BRAND (SHIPPED, live on main): Aaron culled
  his Firefly logo folder to nine finalists (66/48/51/74/76-sans-circle/41/
  56/64/67); all nine keyed to transparency and banked in
  design/art-bank/logo-finalists/. Role-cast by the 16px gauntlet: **#48
  (head + basketball brain) is the identity mark** — favicon.ico (16/32/48),
  favicon-32.png, apple-touch-icon + 192/512 tiles (brand ground + orange
  glow), and a root /favicon.ico; **#76 (circuit ball) headlines the
  share card** (Aaron compared #41/#76 renders and picked 76) — 1200x630
  og:image (emblem over the arena art, Anton wordmark, tagline, URL chip;
  rendered from the site's own fonts, 127KB).
  Full og:/twitter: meta wired into /play/ AND the root landing page with
  absolute bk-ballknowledge.com URLs, so link previews in texts/group chats
  show the card. Old inline-SVG "BK" favicon retired. Assets live in
  docs/play/assets/brand/. Remaining finalists = the alternates bench.
  AND #56 lives: Aaron's idea — the Greek philosopher joined BOTH loading
  screens (boot + Brains x Buckets) with the game's LIVE spinning ball
  resting on his fingertip. Aaron regenerated the statue ball-less in
  Firefly ("can you remove the ball") and delivered via Drive; the
  spinball sprite overlays at the fingertip (geometry pinned in CSS
  comments, wobble + wind kept). Source banked:
  design/art-bank/philosopher-noball-src.png.
- **2026-07-27 (34)** — SQUAD IDENTITY + THE SCORE BUG: players name their
  squad + pick a 2-3 letter scoreboard abbrev
  (prefilled from the colorway, e.g. Showtime -> SHO) on the colors screen;
  leet-normalized bad-word blocklist gates both fields (honest limits noted).
  Identity rides the cw events/cfg as {id,nm,ab}. Broadcast score bug: angled
  team panels tinted in TRUE colors (color-mix), jersey chip, Anton ABBREV +
  score, possession dot, center strip truncates instead of crushing names.
  ONE tray (\u22ef) collapses replay/music/help/menu off the gameplay bar.
  Pause veil shows the live matchup line in team inks + court name. Victory
  names colored, confetti uses the winner's accent. teamInk() sweep: all 15
  callout colors lightness-boosted (dark colorways stay readable). Names are
  born at THE CALL and carry through versus/game/pause/victory.
- **2026-07-27 (33)** — TEAM COLORS ships: 24 colorways (NBA/WNBA/FIBA/BIG3
  palettes deduped, trademark-free nicknames). THE CALL now pays three ways
  online: winner suits up FIRST (the settled jersey rule), loser suits up
  second behind the clash guard (same hue family blocked, stealing blocked),
  then the loser sets the court. Engine sweep: TEAM[] drives pieceColor
  (body + accent headband), sprites rebuild on applyColors, teamCol/teamName
  everywhere ("Showtime ball — Iverson brings it up"), rims/glows/move-tints/
  def-slide tint by actual team, HUD names dynamic, CSS vars set text-safe
  (lightness-boosted so Mile High navy stays readable ink while jerseys keep
  truth). Solo: rules-row picker (bk_cw persisted), CPU auto-picks the
  farthest non-clashing hue. Colors ride cfg -> snapshot -> resync free.
  Verified: newflow (showtime/shamrock synced both phones through court +
  full game), 16/16 drops2, cpuflow, colorshot (HUD/team/names).
- **2026-07-27 (32)** — THE TOSS-UP PAYS BOTH WAYS (Aaron's rule): online, the
  CALL winner takes their prize and the LOSER sets the scene — the court pick
  is the consolation. Flow: CALL locks -> loser gets the picker in 'tossup'
  mode ("You lost the tip — so YOU set the scene", no back door, back arrow
  hidden) -> {a:'court'} broadcasts -> both phones apply -> handicap/squad as
  before. Room-level pick never overwrites the loser's solo default. Heads-up
  card row now reads "Toss-up loser gets the final say". Verified: newflow
  (both phones land cosmic-a mid-flow, full game after) + all 16 drops2
  checks with the new step inserted before handicap. ALSO this window: main
  gained a GitHub-authored CNAME commit (custom domain bk-ballknowledge.com
  went live) — merged, and the site now serves from the real URL.
- **2026-07-27 (31)** — HOME COURT: the picker ships. COURTS registry (6
  families x A/B = 12 looks incl. Classic/Midnight Run engine tints), picker
  screen built to the approved mockup (art cards, A/B chips, Sedgwick stamp,
  lazy-loaded art), entry row on the rules screen. Court is a ROOM SETTING:
  creator picks it with the house rules, rides houseRules()/applyHouse, shows
  on the guest heads-up card, survives rejoins (applySnapshot re-applies).
  Solo remembers per phone (bk_court). Midnight Run retints the actual engine
  board (bg gradient/apron/tiles). Harness catch: the new screen wasn'''t in
  the screens registry — show('courts') threw and the screen could never
  display; ALWAYS register new screens in screens{} + BACKMAP. Verified:
  courtflow.js (solo pick/persist/apply, blue-scan tint proof, online
  creator-court -> guest heads-up -> guest cfg) + newflow/cpuflow/drops2.
- **2026-07-26 (30)** — QUESTION RUN 3 merged: bank 1,141 -> 1,526 (+385).
  The FREE run type — zero new research: mined from the verified player DB
  (stats/numbers/accolades/provable comparisons) + the run-1 corpus tail.
  Six slices, each adversarially verified (every c[0] recomputed from
  players.json): 404 mined, 19 killed, 37 fixes applied. Best verifier
  catches: a batch-wide first-named-wins tell in the comparison slice (13
  stems rewritten), 4 flippable active-player total-races killed, stale
  records killed, non-DB distractors swapped for stored players. NOTE: the
  Workflow tool's permission layer was broken this session (stripped ALL
  subagent tool inputs) — run executed via direct background agents instead;
  miners correctly returned NOTHING while blind rather than fabricate.
- **2026-07-26 (29)** — THE GUEST LIST: online play can be invite-only. Relay
  reads BK_ACCESS (comma-separated codes, unset = door open); create/join/
  rejoin carry the stored pass and an {t:'access'} check exists for the gate
  moment. Client stays permissive — the styled gate (velvet rope, ticket
  card, stamp animation, deny shake) only DROPS IN when the server says no,
  holds the player's intent (create/join/rejoin), re-fires it through the
  already-open socket after the stamp, and remembers the pass in localStorage.
  Code check doubles as the server wake (netDial runs under "checking the
  list"). Rotation: change BK_ACCESS on Render — old codes die instantly,
  mid-game rejoiners get a themed re-entry gate. Verified: 9-check gate.js
  matrix (deny/stamp/held-action/stored-pass/open-server) + newflow, green.
- **2026-07-26 (28)** — PHASE 1 COMPLETE. 1.5 server wake-up UX: the player
  never hand-retries a napping relay again. netPoke() fires the /health wake
  the moment the online screen (or room-setup walk) opens, so the server warms
  while they read/type; netDial() then places the socket call on a patient
  loop — 10s hung-socket guard, 3s redial spacing, ~85s window — painting a
  living arena-warm-up status line ("Calling the arena…" -> "lights coming on
  rack by rack" -> …) with real elapsed seconds. Honest failure + one-tap
  redial only after the window. Create, join, AND mid-game rejoin all dial
  through it; Back/leave hangs up the loop (token cancel). Verified: wakeup.js
  (8 checks incl. dead-server message progression, failure+redial, hang-up)
  plus newflow + full drops2 matrix, all green.
- **2026-07-26 (27)** — DEAL FROM THE DATABASE: packs now deal from the full
  744-player research DB (league + era + position filtered), so ~270 depth
  players enter play and Common finally means "1 superstar · role support"
  (non-star slots tier-weighted: role 3 / starter 2 / all-star 1 / deep 1).
  Hand-built rosters remain the fallback dealer for any pool the DB can't
  honestly fill (guard: every position needs 4+ candidates — big3's 3-man
  lineup falls back today). One dealer covers solo, online reveal, and CPU
  (cpuAutoSquad routes through srPickSquad). Jersey-number honesty: a depth
  player with no verified number renders a clean card/back — never invented.
  Verified: 200-deal distribution + era purity + WNBA + fallback + numberless
  harness (dbdeal.js), plus statcards/cpuflow/newflow regressions, all green.
  Harness lesson repeated: the one "era leak" (Tom Gola) was the TEST matching
  the wrong league's record for a name that exists in two leagues — match on
  name+league when auditing deals.
- **2026-07-24 (24)** — v0.27 (Clash fixes): lightning bolt moved BEHIND the VS
  medallion (it crosses the location, not over the disk); blue rows mirrored +
  names right-justified to the screen edge (proper mirror of the orange stack).
  Added a lightning-bolt sourcing prompt to ART_PROMPTS.md (Aaron sourcing a
  real bolt PNG; I'll composite it behind the VS and keep the strike/glow) —
  prefer a white/gold bolt on transparent so it recolors per theme.
- **2026-07-24 (23)** — v0.26: removed the (disliked) logo from the loading
  open AND the title (Anton wordmark carries identity until the new logo lands);
  loading ball now the CLEAN bright-orange render (better vibe than photoreal
  rugged) and 60% bigger. GLASS BACKBOARDS: clear translucent boards + a
  colored ownership glow blooming behind each rim and a light-pool on the floor
  — the lazy "SCORES HERE" text is gone. DARK MODE added (Blackout · OLED),
  creative theme names (Gotham, Neo-Tokyo, Xeno, Vice, Speakeasy, Rucker, Jam,
  The Garden, Flight 23…), and ALL 12 swatches are now two-tone diagonal splits.
  Defense clock is now :24 too (it's chess — both sides get to think). Added
  design/INTERACTION-PROPOSAL.md (theme scroller, era timeline, card-deal squad
  reveal, comic hover, + a big idea list, and the full in-game tutorial spec).
  Deep-research brief upgraded to return a reusable corpus + t:4 Impossible.
  All regressions green.
- **2026-07-24 (22)** — v0.25 (no-lazy pass): THE CLASH rebuilt properly — the
  lightning bolt now TAPERS (filled ribbon, fat at the strike, thin at the
  tips), glows with an orange→cream→blue gradient, cuts directly THROUGH the VS
  medallion (VS text floats on top and stays readable), and STRIKES LAST — rows
  slam in first, then the bolt hits and EVERYTHING jumps + shakes (battle
  signal) with a punchy strike flash. Rows now taper to meet the diagonal seam;
  blue direction fixed (smallest→longest at bottom). Persistent top-left BACK
  ARROW replaces all the scattered inline Back buttons. Deep-research brief
  upgraded to return a reusable, de-dup-keyed RESEARCH CORPUS + questions +
  a t:4 "Impossible" tier (infinite-difficulty, packs-forever engine).
  Local+online+back-arrow suites green.
- **2026-07-24 (21)** — v0.24: REAL 3D BASKETBALL everywhere (per Aaron — the
  CSS ball "looked bad"). Set up a headless three.js render pipeline, baked
  Aaron's rugged_basketball.glb into a hero PNG + an 8-frame vertical-axis spin
  strip; loading sting, Brains×Buckets beat, and the in-game canvas ball all
  use the render now (translate-strip sprite for the spin). LIGHTNING-BOLT
  Clash seam: replaced the weak diagonal line with an animated jagged bolt
  (orange→blue gradient) that strikes in to divide the squads (+zap sfx) — no
  art needed, pure vector. Themes moved OFF the main menu back into Settings
  only. Local+online+theme regressions green.
- **2026-07-24 (20)** — v0.23 (pre-game redesign phase 2): **Brains × Buckets**
  loading beat (2c) between the Clash and tip-off — side-spinning ball, :24
  pulse, Anton title, rotating ticker lines, tap-to-skip, online-synced through
  the start event. **Main-menu theme picker** (2d): all 11 swatches live on the
  title, shared selection with the settings screen. Loading beat verified in
  local + online + reconnect flows. Redesign now covers the major brief
  screens (type, Clash, loading, menu themes); squad-row + tip-off are already
  on the new type — minor polish remains.
- **2026-07-24 (19)** — v0.22 (PRE-GAME REDESIGN phase 1, to the Drive brief):
  real self-hosted display TYPE — **Anton** (skewed broadcast headlines),
  **Archivo** (body/names), **Space Mono** (labels/scoreboard), woff2 in
  docs/play/assets/fonts/, no CDNs. Rebuilt **2b · The Clash**: diagonal
  staircase (orange upper-left tapering down, blue lower-right tapering up),
  region glows + seam line, VS medallion punch-in with flash + shockwave +
  screen-shake on impact, whoosh→horn sfx. Local + online regressions green
  through the new screen. Phase 2 next: Brains×Buckets loading beat, main-menu
  theme picker (2d), Meet-Your-Squad row polish (2a), tip-off polish (2e).
- **2026-07-24 (18)** — v0.21: THEME PACK — 11 themes (was 4): Hardwood,
  **The Garden** (Knicks nod: orange × Broadway blue), **Flight · 23**
  (Jordan nod: red × black), Jam (NBA-Jam fire), Midnight (dark), Blacktop,
  Neon, Alien (toxic green), Sunset, Lounge (relaxed), **Whiteout** (true
  LIGHT theme — flips ink/panels). Live name label under the swatches.
  Pulled Aaron's Google Drive at last (link-readable): design brief for the
  pre-game redesign saved to design/redesign-brief-pregame.md; 3D pack is 14
  small .glb models (48-92KB, download works). MEDIUM CALL logged: go 2D
  AI-generated for the vibe-carrying art (venues/hero ball/cards/logos —
  painterly-anime is a 2D look; raw 3D reads plastic and fights the 2.5D
  renderer); use the .glb pack surgically (pre-rendered spinning ball +
  scoreboard prop + proportion reference). 15-theme test suite green.
- **2026-07-24 (17)** — v0.20: mid-game RECONNECT — server holds the room ~45s
  when a player drops (server FL-4 v2); survivor sees "Opponent dropped —
  holding…" instead of a dead game, dropped player gets a Reconnect button,
  and a full page refresh offers "jump back in" via sessionStorage. Rejoin
  resyncs the live board (score, positions, possession, quarter, clock) from
  the survivor's authoritative state. Also: bank 132 → 200 (+ new `negro`
  Black-Fives/Globetrotters and `college` tags, surfaced through nba/wnba/
  world scope), Leave button on the online squad-check screen. Deep-research
  mega-bank prompt written (DEEPRESEARCH_KNOWLEDGE.md) — targets 400+ with
  sources, adds negro/college as first-class leagues when it lands. Full
  regression + 9-test reconnect E2E green.
- **2026-07-24 (16)** — v0.19: SHOT CLOCK (:24 offense to commit, :12 defense
  to slide; pauses through cards/meters/battles; expiry = shot-clock turnover
  / skipped slide; online-authoritative per phone) + 4-QUARTERS format (6
  possessions/quarter, most points after Q4, tie → sudden death) alongside
  first-to-11/21. Also killed browser zoom hijacking the pinch gesture
  (preventDefault on gesturestart/change/end + touch-action on the game
  screen) — that was iOS Safari's own zoom firing on the two-finger pinch,
  not ours. Full regression green.
- **2026-07-24 (15)** — v0.18: SUDDEN DEATH (tie at game point → board
  freezes, alternating cards with the scored-on team first, both-survive/
  both-miss = next round with hard cards, first split decides the whole
  game) + HOOP OWNERSHIP (each rim wears its attacker's color: tinted
  baseline, floor glow, colored shooter's square, floating "ORANGE/BLUE
  SCORES HERE" label over the backboard). Full regression green.
- **2026-07-24 (14)** — v0.17, playtest round 4: ZOOM CAMERA (tap a player →
  camera leans in; tap away → releases and pulls back out), REPLAY LAST MOVE
  (↺ in the HUD re-runs the last hop/pass visually — for the "wait, what
  just happened" moments), GO FOR THE STEAL (adjacent defender spends the
  slide: their card → handler's PROTECT THE ROCK card → RIP OR GRIP tap-off,
  edge to the handler; a missed reach burns the slide), THREE IN THE KEY
  (per Aaron: any offensive player camping the paint for 3 of your actions =
  whistle + turnover, ⚠️ warning at 2), timing-bar OWNERSHIP (team color +
  "🖐 ORANGE ONLY — tap to lock" — fixes the confused defender), def-slide
  denial feedback (the game now says WHY a slide is illegal — answers the
  "blue couldn't move" report: slides are offense-minus-one), question bank
  51 → 132 (+66 curated across nba/wnba/world/big3/rules). Drive folders
  still pending Aaron's permission approval (or link-public).
- **2026-07-23 (13)** — v0.16: REAL funk (portfolio method — self-hosted
  Kevin MacLeod CC BY 4.0: Funkorama menu / Funk Game Loop in-game) replaces
  the procedural grooves; both v0.15 music bugs fixed (every-click restart,
  toggle not stopping). ART_PROMPTS.md added: full sourcing prompt pack —
  logos (book / BK monogram / knowledge ball), layered menu + arena
  backdrops, court skin, hero/flame ball, 8-frame ball spin sheet, card
  back — plus the 3D-vs-2D ruling (paint the world in parallax layers;
  Aaron's 3D uploads become layers if renders, pre-rendered sprites if
  models). Aaron's Drive folders (3D pack + design brief) pending a
  permission approval to read.
- **2026-07-23 (12)** — v0.15 (FL-5 starts): procedural arcade MUSIC (two
  Web-Audio grooves, menu + in-game, crossfading by screen) + synthesized SFX,
  all synthesized live (no files/CDNs). Settings "Control Room": 4 color themes,
  music/SFX on-off + volume, court-label + reduce-motion toggles, per-phone in
  localStorage; ⚙ on title + pause, ♪ quick-toggle on title + HUD. Honest medium
  call logged: real songs need sourced files; personal-service integration
  skipped for a Music-OFF "play your own" path. 15-test settings suite + local
  + online E2E all green.
- **2026-07-23 (11)** — v0.14: pre-game ritual per Aaron — online squad check
  (each player sees THEIR five, Shuffle ↻ synced live w/ opponent-dupe
  exclusion, Lock it in ✓, live opponent-lock status) → SQUAD VS SQUAD
  matchup screen → tip-off. Online setup now skips the host-only squad
  reveal; local play routes through the VS screen too. 23-test online E2E +
  full local regression green.
- **2026-07-23 (10)** — 🚀 **FL-4 ALPHA: ONLINE PLAY LIVE (v0.13).** Websocket
  room relay on the Render server (ws, in-memory rooms, heartbeat that also
  keeps the free dyno awake mid-game). Client: Online menu unlocked — create/
  join with a 4-letter code, host picks the matchup, full game syncs event-by-
  event (moves, cards, duels, meters, battles, buzzers) with per-side input
  gating and private trivia cards. 18-test two-browser E2E green + full local
  regression green. Known alpha edges: no mid-game reconnect (drop = room
  closes), host-only rematch, first connect ~30s if server napping.
- **2026-07-23 (9)** — v0.12 round 3: mid-screen action prompts + big SHOOT
  alert, center-screen event callouts (tip/splash/steals/violations/boards),
  defense slides at offense-minus-one, crossover duels vs the nearest-to-line
  defender (named in the confirm prompt), deep-cross tiles darker red,
  crossovers cost a landing step. Next: FL-4 minimal online (room codes +
  relay) so Aaron can play his remote friend — the top blocker.
- **2026-07-23 (8)** — v0.11 same-day round 2: confirm-step for every action +
  pass-or-move disambiguation, backcourt as a live violation (turnover, not a
  refusal), earned steals (defender card on flubbed crossovers), between-you-
  and-the-rim contest fix, ball-pressure pass rule (fixes uncontested inbound),
  RELEASE METER on shots & risky passes (tap bar pulled forward from AL-1),
  real tip-off buzzer buttons, side-view spinning loading ball. Logged:
  lane-guard steals + no-look counter (open Q 13/14), rules-assist easy mode.
- **2026-07-23 (7)** — v0.10 playtest batch: WORLD league live + G League /
  Street Legends lab cards, era multi-select mixing, crossover duels ending in
  ANKLE BATTLE tap-offs, position-graded contests (SMOTHERED vs late closeout),
  real pinch-zoom, chess coordinates on the court, finger-spin loading ball,
  "Stay put" copy, help "?" everywhere + rulebook from pause, question
  de-babying. Next: FL-2.6 (team-turns toggle + coach tutorial), then the
  moved-up dope pass.
- **2026-07-23 (6)** — FL-2 shipped (v0.9): leagues & modes live — NBA/WNBA
  5v5 on a 15×8 court, Big3 half-court with check-ups, decade select, real-name
  randomized rosters with numbered figurines, squad-reveal + re-deal, first-to
  rules, tip-off buzzer race, league-scoped question bank (~48). Next: FL-2.5 CPU.
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

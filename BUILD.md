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
- ▢ Accounts-lite (handle + friend code, Postgres/Supabase) — later; rooms
  need zero sign-in for the friends test
- ▢ Per-account seen-question tracking moves server-side
- ▢ **In-game chat window** (per Aaron): room-scoped text chat between players —
  slide-up panel + quick-chat trash-talk presets ("BRICK!", "ANKLES!",
  "call bank"); friends-only rooms so no moderation machinery for v1

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
- ▢ Basketball-style scoreboard · fun heat bar (simple heat v1 mechanic with it)
- ▢ Court beautification + light-up tile effects + shot effects (arc trail,
  swish burst, rim rattle)
- ▢ Figurine jersey numbers (back) + player names on screen — numbers ✅, names
  in play-by-play ✅; on-court name tags still to come

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

**★ AARON'S PRIORITY ORDER (07-24) — one at a time, each fully finished before the next:**
1. **Squad reveal** (redesign to the new feel) — in flight.
2. **CPU play** — ✅ SHIPPED v1 (07-24): Vs CPU live on the menu w/ Rookie/Pro/
   All-Star picker. ARCHITECTURE CONTRACT: the CPU is an INPUT LAYER, never a
   rules engine — it picks among engine-computed options and drives the same
   entry points as a tap (commitStaged/doShoot/endDefSlide/startStealTry/
   tipBuzz/meterResolve/battleTap/resolvePending). Rules changes are free;
   new decision TYPES get one heuristic in the marked CPU section of game.js;
   safe fallback = first stagebox button. Level sets trivia accuracy AND
   decision quality. v1 scope: no toss-up vs CPU (straight to league), CPU
   squad auto-locks silently. LATER: adaptive "studies your game" layer,
   CPU-vs-CPU headless sanity test, networked-style spectate of CPU cards.
3. **Tutorial mode + in-game tutorials** (teach rules/buzzer/contests/meter as you play) — BIG for Aaron.
- **Cross-cutting quality bar:** EVERY downstream menu/screen must match the
  established design language (rolodex cards · breathing selected-glow · Sedgwick
  slam/POW · realistic balls · arena backdrop) so the whole game feels like one
  thing. Audit + restyle squad/clash/rules/settings/pause/end as we pass through.
- LIVE on main (07-24): league picker (rolodex), era timeline, Play-with-Friends
  revamp, menu slam font → Sedgwick. Toss-up + THE CALL = designed (mock), pending
  build. Coin flip is dead — replaced by the trivia Toss-Up (see Open Q #16).

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
16. **Pre-game OPENING TOSS-UP → THE CALL (versus — trivia, NOT a coin flip;
    per Aaron 07-24)** — the pre-game "toss" is the **first taste of trivia**: a
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

18. **Squad reveal = PACK-RARITY system (per Aaron 07-24)** — the dealt starting
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

20. **No pausing mid-question (rule note, per Aaron 07-24 — NOT built yet):**
    the pause button must be dead while a trivia card / tip-off answer / toss-up
    question is live (no reading the question, pausing, and googling). Pause
    stays available between possessions and during non-question phases. Small
    guard in btnPause when it's built — slot with the next gameplay batch.

21. **TEAM-IDENTITY REFACTOR — the Orange/Blue revisit list (per Aaron 07-25).**
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
    c) **HUD CONSOLIDATION.** All non-gameplay controls (pause, settings,
       music, help, replay) collapse into ONE hideable dropdown/cluster so they
       stop eating screen space — mobile-first.
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

## 7 · Changelog

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

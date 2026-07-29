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

## 4 · What's next (the live edge)

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
- [ ] **NEW MUSIC** — MacLeod tracks are placeholders Aaron isn't feeling.
  Sourcing brief REVISED 07-27 in §6 · 22o (menu ~85-100 BPM · game ~90-110,
  NOT the old 110-130 · instrumental · CC0/CC BY only, public repo · drop mp3s
  in docs/play/audio/). Root cause measured: the in-game track is a 56-second
  loop repeating 11-16× a game.
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

## 6 · Open design questions

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
       - **NEEDS AARON: new music.** Current tracks (Kevin MacLeod funk set) are
         placeholders and Aaron isn't feeling them. I can't compose.
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

## 7 · Changelog

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

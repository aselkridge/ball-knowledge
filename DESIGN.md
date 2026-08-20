# BALL KNOWLEDGE — Design Bible v0.2

This file is the living record of every gameplay + art decision. If it's not in
here, it's not decided. Last updated: 2026-07-22 (pre-M0; added economy, modes,
loading screen, logo direction).

## North star

**Knowledge is your athleticism, strategy is your coaching.**
Trivia gates every score. Positioning, shot selection, and skill timing decide
close games. When two mechanics conflict, the one that serves this sentence wins.

**Audience — RULED 2026-08-09.** Aaron: *"this is not a game for high school
kids, so this is really a college and up game."* Career fiction, room art, tone
and copy pitch to college age and up. The current high-school practice gym
stays because the fiction holds either way (grown players go back to
high-school gyms to train); the player's own spaces (bedroom, later gyms) read
college-and-up from their first appearance.

---

## 1. The board

- Full court, rectangular tile grid, a hoop at each end. You attack one end, defend the other.
- **Tiles must read clearly** — visible grid, zone tints, occupancy highlight under each piece.
- The court is the difficulty map (distances from the basket you're attacking):
  - **Layup zone** (adjacent to rim): easy question · 2 pts
  - **Mid-range**: medium question · 2 pts
  - **Three-point zone**: hard question · 3 pts
  - **Logo zone**: ★ deep-range specialists only · hard+ · 3 pts
- Board edge = out of bounds. Missed card on a risky pass → ball sails out, turnover.
  Shot-clock violation = turnover. Baseline traps shrink the ball-handler's options.

**THE COURT IS EXACT (locked 2026-08-11).** Aaron, with real NBA diagrams in
hand: *"use these photos and try and get it as close to exact as possible with
good spacing... This is one of the most important parts of the game."* The
board is 94x50ft (full) / 47ft deep (half), scaled per axis, and **the rims sit
INSIDE the court at the real 5.25ft from the baseline** — they had sat 1.9ft
outside since day one, which is the single error that made the first exact
draw's arc cut the free-throw circle. The painted lines are the real set: 16x19ft
key with lane hash marks, 6ft free-throw circle (solid top, dashed bottom), 4ft
restricted arc, glass at 4ft, 23'9" arc meeting corner rails that
**snap to the first grid line** (6.25ft off the sideline, not the real 3ft):
Aaron's second read found the true-position rail slicing the outer tiles so
their value was unreadable, and his rule stands: *"at least one set needs to be
outside that three point line."* The whole outer row IS the corner-three lane
now, six whole tiles per rim, at 18.75ft lateral · grid-legible beats
inch-faithful where the two collide. 6ft/2ft centre pair, free-throw circle
solid toward centre court and dashed inside the key (his catch too, it shipped
swapped). **The drawn
three-point line IS the scoring rule** (`ARC_FT=23.75` in game.js; corner strip
computed from the same arc), so line and rule cannot drift — the fix the
corner-three bug demanded in July, now structural. Measured map per attacking
side on the 15x8 grid: 26 tiles worth 3 (20 arc + 6 whole corner tiles) ·
16 mid · 10 layup. Difficulty shows as faint tier TINTS on the tiles (his ruling, same
day); the old zone-staircase borders survive only behind the `bk_lines=zones`
fallback flag. The old tuned arc (185 units) is retired.

## 2. Pieces — two layers

**Layer 1 · Position = movement DNA**
| Pos | Identity |
|---|---|
| PG | Engine. Moves 3 with ball, longest passes |
| SG | Range. Moves 2, deepest shot zones |
| SF | Versatile. Moves 2, no weaknesses |
| PF | Muscle. Moves 2, screens ease adjacent teammates' shot questions |
| C  | Anchor. Moves 1, owns the paint both ends |

**Layer 2 · Player = personality**
- Role players: one small plus + one small minus quirk, drawn from archetype pools.
- Stars ★: signature skill (1–2 uses/game) **activated by answering a question
  about that player's own career**, plus optionally a passive aura.
- Balance rule: every star kit = 1 signature + 1 small passive on a shared point
  budget; role-player quirk pairs sum to zero.

**Ratings philosophy: ratings never score points — they bend the mechanics.**
- Shooting (by zone) → coach's hint (one wrong answer greyed) in sweet spots
- Passing → risky-pass cards bend a tier easier; elite passers get limited no-look passes (skip the card)
- **Handles → crossover base tier AND max carry depth** (Iverson crosses far;
  Draymond gets one power step). Position defaults (PG/SG/C + deep-cross +1)
  stand in until player ratings land with packs.
- Defense → slide distance (see §4) and contest scaling
- Speed → movement range · Rebounding → duel window · Dunking → dunk-meter width
- IQ/Leadership → heat gain, once-per-half play call (move two teammates)

## 3. The turn

> **RULED 2026-08-17: METHOD B IS THE POSSESSION MODEL.** Aaron, after playing
> it: *"not a small thing but we are goin with method B (store the old method
> in our history so we know what it was if we ever have to build it again, and
> remove the option to switch)."*
>
> **BUILT 2026-08-18: the switch is gone.** Method B latches for every
> full-court five-player local or CPU game; online, BIG3 half court and the
> drills still play the classic possession because Method B does not carry
> them yet. A stale `bk_methodb` key in a phone's storage is never read
> again. The PROTOTYPE chip and the tip-off announcement went with the
> switch. **The two open range numbers were settled by Aaron on 08-18
> evening, no playtest needed: "lets give everyone full range and that's
> it, we can remove the switches."** So every off-ball setup move runs at
> the player's full role range, the defensive slide runs at full role
> range, and the two Settings toggles are gone.
> `tools/methodb-check.mjs` holds the scope: Method B latches with no flag,
> full range is the rule with no switch, and the classic rules still hold
> where classic still plays.
>
> **AND THE TURN SPEAKS NOW (built same day, V0 B17 · Aaron's list item 2).**
> The grammar: it is your turn exactly when your buttons exist. On a
> possession flip (and ONLY a flip) the slam calls it: YOUR TURN / THEY'RE UP
> solo and online, the squad name in the squad colour at a shared phone.
> Your turn stands in the bottom dock: free moves first with a live count
> and DONE as the only door to the action, then SHOOT/PASS/MOVE with honest
> prices. Their turn: the lights come down on the sky and the chrome, the
> floor stays lit (his ruling: the player has to watch what moves), and a
> quiet strip holds the dock's place. A question card owns the whole screen.
> THE OVERLAP LAW is code, not intent: `dockFit()` walks every tile through
> the renderer's own projection, and the dock goes slim, then steps into the
> side dead zone, before one tile is ever covered · `tools/turn-check.mjs`
> fails on one pixel at 390x844, 390x667 and 1280x860. Duplicate squad
> names AND scoreboard tags are refused at setup ("Taken. The other squad
> got here first."), because the turn language names squads. Trash talk is
> the ruled closed set: fixed prefixed lines, big moments only, 20s apart,
> six a game, Settings kill switch.
>
> **The rules written in §3 and §4 below are the CLASSIC model and are
> superseded for full-court play**; they are left standing because online,
> BIG3 and the drills still run them, and the full prose rewrite of this
> section rides with the coach rewrite Aaron ordered LAST. Until then the
> authoritative description of Method B is the built code plus V0 B16/B17.
>
> What changes, in one line each, so a reader is not misled in the meantime:
> the defense picks and reveals its setup FIRST and the offense picks seeing
> it · both sides get a free off-ball setup rather than one shuffle · the
> slide moves to after-setup-before-action · a live-ball turnover does not
> reset the possession · the offense's dead-ball menu is contextual by spot.
>
> **The classic model is ARCHIVED, not deleted** (quarantine-never-delete
> applies to code we may have to rebuild), and Settings loses the toggle.
> This also un-gates the coach: `coach.js`, the COACH-TOURS mapping and the
> seven gym drills all teach the classic possession, and Aaron has ruled
> without waiting for the friend playtest that B16 had gated them on.

Turn-based with a :24 shot clock per turn and ~15s question clocks. Reflex moments
inject real-time inside turns — but only ever as upside (§3b). (A real-time
"Blacktop mode" is a possible later mode.)

Per offensive turn: one free off-ball shuffle (1 square) + one main action
(Move / Pass / Shoot / Skill). Wrong answers on risky actions = turnover.
Leaving players parked is strategy (spacing — defense must respect the corner sniper).

**Shipped 2026-08-11** (this line was doc-only for two weeks; V0 D32 records the
gap and Aaron's "Design free off ball movement please" that closed it), with the
defensive half locked at the same time (V0 D33): **the free step draws NO
defensive slide — the defense answers the main action only.** That keeps the
one-for-one exchange measured fair on 08-10 intact on everything that can score,
and stops the defense having to answer a man stepping sideways. Exactly one free
step per offensive turn, off-ball only, exactly 1 square: longer repositioning is
a main action. Enforced by `freeStepQualifies()` in `game.js` — one predicate for
the stage label, the commit hinge and the harness — and guarded green by
`tools/turn-economy-check.mjs`. Taught in the rulebook (Your possession), the
free-step drill, and a once-per-phone coach tip on first use.

### 3b. The upside-only meter (locked 2026-07-27)

**The rule: the only thing that can erase a right answer is the opponent's
right answer.** No reflex mechanic may turn earned knowledge into a miss.
Shipped 07-27 (full case walk in the "Release Meter — every use case" review):

- **Open-look shot, answered right → straight splash.** No meter on the game's
  most common play.
- **Contested shot, answered right → the release meter fires, upside only.**
  Dead center DENIES the defender's block card and rises clean; anything else —
  including never tapping — simply lets the contest play out on cards. The
  shank zone is gone (the bar art lost its red edges to match).
- **Risky pass, answered right → the ball arrives, period.** Contested laser,
  pressured dish, full-court heave: the card was the risk. The THREAD IT
  delivery meter is gone (passes have no contest interplay — it was pure downside).
- **CPU meter profiles now express one thing:** how often the CPU denies YOUR
  block card on its contested shots (Rookie rarely, All-Star often).
- **Reflex keeps its game-show home:** toss-up buzz and jump-ball slap decide
  who answers FIRST — the question still decides the ball. Everywhere else
  (boards, ankles, rip-or-grip, at the rim) it's sudden-death cards.
- **Trade-off accepted eyes-open:** offense is buffed (no more free misses),
  games run higher-scoring; the block card is the defense's whole counterplay
  on contested looks, so lane positioning matters more — a strategy buff.
  The "right answer, rushed release" story is gone on purpose.
- **Future hook:** perfect (deny) releases are natural fuel for the heat bar (§6).

## 4. Defense

> **THE ONE DEFENSE · RULED 2026-08-18 AND SHIPPED THE SAME DAY.** Aaron
> confirmed the two rules and killed the settings menu that used to offer
> them as options:
> 1. **Every defender guards all eight squares around them.** Beat a man
>    head-on and the crossover card is FULL PRICE; a duel forced by a man
>    covering you from the corner (diagonal to your start square) asks a
>    question ONE STEP EASIER, never below Easy. The card and the tile
>    colour both read `crossPrice()`, one source, so the floor can never
>    promise a price the card will not ask. Deep crosses (3+ squares) stay
>    one step harder: the cards are the price, and that includes distance.
> 2. **A lane two defenders gate is CLOSED**, refused rather than duelled,
>    drawn in the dark do-not-tap. **The skill escape hatch is his design
>    and it is OWED when ratings land**: *"unless you have a highly skilled
>    ball handler, this is when we inject skills and stats based basketball
>    into the game."* The first place ratings will decide what a player CAN
>    DO rather than bend a meter.
>
> The four spacing house rules (Open floor · Locked up · Pay the toll ·
> One-on-one, 08-01/08-02) are RETIRED: the one defense is toll's pricing
> plus one-on-one's closure made standard, and the picker left the setup
> screen. Git history is the archive, same as Method B's switch. The July
> fear that all-eight guarding smothers the floor was measured before this
> shipped: with real defensive shapes placed, 45% of the attacking half is
> guarded and the handler keeps about three clean lanes
> (`design/floor-analysis.json`, the Is-the-Floor-Too-Small board).
> The CPU plays by the same rules: it never taps a closed lane (proven by
> the wall test in `tools/defense-check.mjs`, 11 checks) and smart levels
> prefer the cheaper corner duel.

1. **Slides are free**: after each offensive action, slide one defender one square.
   Ratings bend it: B-defender slides 2; A-defender (lockdown) slides 2 and once
   per possession may "jump a lane" (pre-commit to a square for a big steal window).
2. **Contests are live**: defender within 1 square of a shot → owner chooses:
   - Contest **question** (safe): right = block/alter
   - Timed **block** (gamble): green = block; red zone = FOUL
3. **Matchup clause**: contest difficulty scales with the matchup. Guard blocking a
   7-footer's dunk = impossible-tier question. Answer it and the arena explodes.

## 5. Fouls & free throws

- Red-zone blocks = shooting foul → FTs; made shot + foul = and-one.
- FT = timing meter, green width set by shooter's real FT skill (hack-a-Shaq is strategy).
- Team fouls → bonus. 3 personals = foul trouble (block meter loses green); 4 = fouled out.

## 6. Heat & ON FIRE

**CORE BUILT 08-02, SHIPPED LIVE 08-02** (`game.js` HEAT block;
`tools/heat-check.mjs`, 20 checks + break-proof): bar of 4 segments × 3,
pour = 1+tier (+1 trailing), miss drops one segment, full bar ignites — cards
−1 tier + every piece +1 move — any bucket or a stop ends the burn. Heat rides
the snapshot; battles are heat-neutral by netcode design.

**PRESENTATION + SOURCED FLAME ART BUILT 08-02:** fill bars under each
scoreboard side that stage up per quarter filled · a diagonal ON FIRE slam in
the menus' graffiti face (stamp A) with burst + court shake and no body copy ·
painted flame pillar on the lit ball-handler (columns 1+2, mirrored, ~8fps) ·
ember rings on teammates · a burning ball, in the hand AND in flight (columns
3+4, rotation from screen velocity) · stamp B as the wordmark heading the
rulebook's Heat & ON FIRE topic.

NOT yet built (phase 2, spec below stands): streak mode, heat-check bomb,
posterize drain, pass/dunk windows.

**LOCKED by Aaron 2026-08-02, on the 22af Run A evidence (findings A1–A3):**
- **Heat pays out in ABILITIES, never in point multipliers.** The score of a
  basket is never multiplied by heat. (NBA Jam shape — verified from the
  official manual; Balatro shows why multipliers break a race to a fixed
  target. Aaron: "lovveeeee the abilities heat.")
- **A miss drops heat ONE TIER — never to zero** (Beat Saber's halve-not-zero
  reset, the only verified shipped data point on reset severity).
- Exact ignite counter, tier count and ability list: playtest, within the
  frame below.

- Correct answers add heat: easy drips, hard pours; streaks multiply the GAIN
  (payout stays abilities per the lock above); misses cool one tier.
- Full bar = ON FIRE for one possession: all questions −1 tier, whole team +1 move,
  pass/dunk windows widen, one "heat check" logo bomb at mid difficulty, flaming ball.
- Opponent extinguishes it with a stop. Tuning lever: trailing team heats slightly faster.
- Posterizing dunk drains victim's heat.
- **ON FIRE streak mode**: while lit, a make lets you immediately shoot again —
  no defensive turns between (arcade "shoot till you miss"). Balanced three ways:
  each consecutive heat-check climbs one tier (self-limiting even for savants),
  contests stay live mid-streak (a successful block extinguishes the fire), and
  the streak-ending miss gives the defense a guaranteed board.

## 7. Game structure

4 quarters × 6 possessions. Most points wins. Fatigue: overusing a star raises his
question tiers until he rests. Substitutions at quarter breaks (bench = M-later).
Alley-oop: special pass option when a dunker is in the paint with a lane —
smaller green window, catch-and-slam payoff.

## 8. Trivia presentation — the collector card

Questions arrive as a **trading card**: face shows category art / team crest / the
player himself (signature-skill questions show that player's own card). The card
**flips in 3D** to reveal the question + 4 tappable answers with a burning clock
border. This is the signature UI moment; it must feel collectible, never like a quiz.

## 9. Art direction (decided via look tests v1–v4)

> **THE FEEL STANDARD (Aaron ruled it 2026-08-18: "I love the board," on the
> clean-slate feel board, artifact 3b20d39b):**
> - **One clock, five numbers:** 100ms answers the finger · 200ms changes an
>   element · 320ms enters or leaves a surface · 600ms plays an event beat ·
>   1500ms is a slam. Every animation snaps to one, including the screen pan.
> - **Arrivals run on a computed damped spring** (CSS linear(), sampled
>   physics; fallback cubic-bezier(.16,1,.3,1) where linear() cannot run) ·
>   **exits are quicker than arrivals** (200ms, cubic-bezier(.4,0,1,1)) ·
>   **the bouncier spring is reserved for slams and celebrations.**
> - **Every tappable thing answers the finger in 100ms** (slight shrink and
>   brighten on touch, before the action fires).
> - **Nothing pops:** the dock rises, the banner crossfades, a card scales
>   in. Surfaces never teleport.
> - **Sound is shaped and lands with the motion** (soft attacks; event cues
>   fire at the animation's landing, not the tap). For the no-compromise
>   bar, designed samples beat synthesis: a purchased UI/sport cue set is
>   the ruled direction when he spends there (Sound Sheet owns it).
> - **The beauty moves** (from the beauty-over-genre pull): the match wears
>   both squads' colours as a screen wash · winners are bright, losers dim ·
>   a card is a treasured object · the biggest beats get the emptiest
>   screens. Each lands as its own before/after comparison, versus screen
>   first.
> - **v1 exclusions, his R6:** board-piece motion, continuity moments, and
>   recorded samples are wave 2+, filed on V0 B18.
> - Numbers move when his thumb says so in the real game; the point of a
>   scale is that a retune is one token, not forty.
>
> **THE REFERENCE BAR IS BEAUTY, NOT GENRE (Aaron ruled it 2026-08-18):**
> *"for comparisons I care less about if I match what's in my genre and more
> about if the game is beautiful."* So when this game is compared against
> other software, the comparison set is the most beautiful work on a phone,
> whatever it is about: Apple Sports' team-colour screen washes, Opal's
> one-object-in-darkness restraint, a streaming app's poster-led home. A
> trivia game or a sports game is only a reference when it is ALSO
> beautiful. The pulls live in `design/reference/`, each entry with a
> reading of what it teaches for our surface.

- **Camera**: diagonal broadcast angle. Optional tap-to-overhead "coach view" later.
- **Renderer**: canvas engine at 60fps using our own projection math
  (screen-space sprites, painter's-algorithm depth sort — proven WebKit-safe).
  All standing objects (hoops included) must be **oriented in the court plane**,
  not camera-facing billboards. Ball has a fixed catch point per player.
- **Pieces**: 3D lathe-rendered figurines. Per-position silhouettes
  (C broad, PG slim…), superstars get extra detail + a star-shaped base/crest.
- **Leagues**: NBA + WNBA skins/rosters from day one.
- Sourced illustrated art (player portraits for cards, etc.) composited in later —
  the engine never depends on it.


### 9b. Sourced-art plan (locked 2026-07-22 — the parchment method)

**One style lane for all sourced art: warm painterly-anime** (reference: Aaron's
gym-with-god-rays and sunset-blacktop images). Code draws everything dynamic
(board tiles, zones, highlights, hoops, meters, cards chrome, tiny in-game
ball); sourced illustration owns atmosphere and hero moments:

| Asset | Used for | Prompt notes |
|---|---|---|
| Hero ball | title, loading, card fronts | isolated on solid white bg, no text |
| On-fire ball | ON FIRE state | same style, stylized flames |
| Venue backdrops (Gym, Sunset Blacktop, City Night) | world around the playable board = court skins | empty floor fills lower half; **NO hoops**, no people, no text; **9:16 portrait**, not 16:9 (ruled 08-16, the frame matches the surface: the shipped Daily Five courts are 768 x 1376 and every phone backdrop is portrait; `design/PLACES-ART-BRIEF.md` owns the rule) |
| Player portraits | collector cards (later milestone) | style test first |

Rules: never ship watermarked stock previews; key/optimize before inlining;
assets live in docs/play/assets/. In-game 16px ball stays vector (illustration
is invisible at that size).

## 10. Question bank

The real content grind. Tiers: easy/medium/hard/impossible; categories by era,
team, player, rules, numbers. Authored in JSON, fact-checked by the test-kitchen
crew (Isaiah, Malik, Tim). Community packs = far-future.

### 10a-2. WHEN THERE IS NO RECORD: attested claims (Aaron, 2026-08-07 — LOCKED)

> *"when it comes to the times when history wasn't really being recorded, or even
> like street ball, sometimes these stores and people and blogs and pages are in
> fact THE Source... during those times and in certain situations a 'verified'
> source is not a reality and the story telling of the people is more than
> anything else... Maybe for things like this we have questions where we say
> 'the story is' or like 'it is said that so and so scored how much at Rucker
> park in said year'... Those eras and times should have little disclaimers when
> selecting as well."*

**The problem 10a cannot solve on its own.** The source standard assumes a
documentary record exists. For the Black Fives era, for playground ball, for
women's basketball before the WNBA, it often does not — and *not by accident*.
Those games went unrecorded because white newspapers did not cover Black
leagues, because nobody keeps a box score at Rucker Park, because women's
basketball was not thought worth writing down.

**So applying 10a unchanged does something ugly: it makes the bank's coverage
mirror the exact historical exclusion that created the gap.** The game would be
most confident precisely where the record-keeping was most privileged. That is
the opposite of what this project is for.

**The resolution, and it does NOT lower the bar.** There are two kinds of claim
and we have been treating them as one:

| | **documented** | **attested** |
|---|---|---|
| what is asserted | the event happened | *this account exists, and this is who tells it* |
| example | "Wilt scored 100 on 2 March 1962" | "Earl Manigault is said to have..." |
| what the source proves | the event | the ACCOUNT |
| tier applies to | the record | the attestation |

**An attested card is not a lower-evidence card. It is a different claim.** You
still verify rigorously — you verify that the story is told, by whom, and where
it was recorded. That is what historians do with oral history, and it is
provable in exactly the way 10a demands. What changes is not the standard, it is
**what the question asserts.**

#### The four rules

1. **`claim_type` on every fact**: `documented` (the default, 10a unchanged),
   `attested` (the record is the telling), `contested` (sources disagree, and
   the disagreement is the fact).
2. **An attested question must SAY SO in its own words.** "Who is *said to
   have*...", "According to Rucker Park legend...", "*The story goes* that...".
   Then the answer is unambiguously correct, because the question asks about the
   account and the account is what the source proves. A card that states a
   legend as plain fact is wrong even when the legend is beloved.
3. **The attestation still needs a real source and a real read.** Both halves of
   10a apply, aimed at the telling: who told it, where it was published, when it
   was read. A blog IS a valid Tier 2 for "this is the story that is told" while
   being no source at all for "this is what happened."
4. **The player is told.** Eras and leagues that lean on attestation carry a
   short note at selection, and attested cards carry a small mark. Not an
   apology — a frame. *"Much of this era was never written down. These questions
   are about the stories that survived."*

#### Why this is the right call and not a soft one

It is more honest than the alternative, not less. Recording "Manigault dunked 36
straight" as a plain fact would be a claim nobody can support. Recording it as
*what is told, by whom* is a claim that is exactly true, and it preserves the
thing that actually matters about that history: **that the community kept it
alive when nobody else was writing it down.**

**Owed before this ships:** the `claim_type` column (TABLES.md), the phrasing
pass on existing streetball and Black Fives cards, the selection-screen note,
and a `verify-facts` branch that checks attestations rather than events.

### 10a. AIRTIGHT — what a card must have before a player ever sees it
**LOCKED by Aaron 2026-08-03:** *"the validity and organization of the facts and
questions are what underpins my entire game, this has to be AIR TIGHT!!!"*

A card ships only when **BOTH** are true. Neither implies the other, and the
whole bank has been failing the second one silently:

1. **The source is good enough** — one Tier 1, or two independent Tier 2
   (different publishers). Statistics: Tier 1 only. Tier 3 never ships alone.
   *Computed*, in `facts.confidence`. See `TABLES.md` → Source tier.
2. **Somebody has actually read that source and confirmed the answer** —
   recorded as `facts.date_checked`. Not inferred, not assumed. Read.

> **Measured 2026-08-03: 216 of 1,526 cards pass (1), and ZERO pass (2).**
> `date_checked` is empty on every single fact in the game. Not one answer has
> ever been checked against its own source.

**Why both, and why this is the section that matters.** Tiering says
*Basketball-Reference is trustworthy*. It has never said *and this card's answer
matches that page*. Two errors already found that a perfect tier score cannot
catch:

- the Red Auerbach nine-titles card cited a Britannica page about **Phil Jackson**
- `big3.com/leadership/` — a legitimate, correctly-Tier-1 official page — is
  cited for *"Big3 games are played in what format?"*, which a leadership page
  does not answer

Both are **right-quality, wrong-page**. Only reading the page against the fact
catches that, which is what `.claude/skills/verify-facts` exists to do:
attempt to REFUTE each claim, three outcomes (verify / fix / quarantine), never
delete.

**The gate enforces both, and stays DARK until (2) is real.** Turning it on
today would serve zero cards — which is the correct and honest reading of a bank
where nothing has been verified. It is not a bug to be worked around.

## 11. Economy & collection (Competitive spine)

- **Credits**: earned every game — winners big, losers small (never zero).
  Bonuses: **upset multiplier** (beating a higher-tier collection), streaks.
- **Packs** bought with credits, six rarities:
  **Common → Uncommon → Rare → Epic → Legendary → Mystic.**
- **Player cards come in tiers**: e.g. Common Steph (80 OVR) vs Legendary Steph
  (96 OVR) — higher tiers bend mechanics harder (wider meters, better hints,
  upgraded signature skill) and carry premium card art/frames.
- **Onboarding = ripping starter packs.** Your first roster comes out of your
  first packs; that moment is the tutorial's front door.
- **GUARDRAIL (non-negotiable): cards raise floors, never ceilings.** Ratings
  bend meters/hints; they never answer questions. Max mechanical edge of a
  full-Mystic squad over full-Common capped ~15–20% so knowledge always has a
  path to the upset. The upset multiplier exists to make underdog games exciting.
- **Stakes are credits only — never real money** (skill-wager legality; not our fight).
- **Implementation path**: local-first (browser storage + exportable collection
  codes) → server-backed accounts when room-code multiplayer lands. Economy
  design is final now; persistence upgrades later without redesign.
- Licensing note: collectible cards of real NBA players = licensed territory
  (Top Shot / MyTeam). Fine as a free friends/portfolio project; revisit the
  real-names-vs-archetypes decision before any public/monetized launch.

## 12. Game modes

- **Friendly**: flat power — every roster plays at even strength (80s across the
  board). Pure knowledge + strategy. Collections cosmetic only.
- **Competitive**: your earned collection, credit stakes, upset multipliers.
- **THE DAILY FIVE** — shipped, and it had no entry in this file until 08-17
  even though it is the mode most people will touch most often. Ten cards a
  day, the same ten for everyone, deterministic from the date: **round one is
  five SHOTS** taken from spots on the painted court, **round two is five
  STOPS** on the dusk court (Defend the Floor). A 10/10 sweep unlocks **the
  Heat Check**, a name-the-player bonus on a ladder of four clues worth 6 · 4 ·
  3 · 2, one clock for the whole round, typed in with no choices to lean on.
  - **Three ending tiers, and they must stay visibly different from each
    other.** FINISHED: the whistle, the crowd's late swell, the score counting
    up, the marks stamping in, and one word sized to the day (STRONG DAY at 8+,
    THAT WILL DO at 5+, TOMORROW below, that one cold). SWEPT: the horn, the
    rising roar, two waves of confetti, a gold PERFECT that the grad cap crowns,
    a flare across the panel. ROOF OFF, reachable only past a sweep: the game's
    own ON FIRE stamp under THE ROOF IS OFF.
  - **The receipt is the shareable object**, which is why the payoff panel is a
    sheet over the painted court rather than a screen that takes over (ruled
    08-16: *"I liked the background showing because it looks really nice"*).
  - Marks on the calendar and the menu stamp are a ladder of flat SVG shapes,
    tick · star · crown, filled if you were there on the day and hollow if you
    caught it up late. See § 13 for why the grad cap does not join that ladder.
- (Later: streetball rules, All-Star events as party modes, wager lobbies in credits.)

## 12b. Reading the turn (added 2026-08-17)

Ruled out of the Flatness Board, 08-16, and recorded here because they are
rules about the game's LEGIBILITY rather than about a screen:

- **THE TURN TRAY.** The possession is a ticking checklist under the HUD:
  SETUPS · BALL IN · FREE MOVES (with the live count) · SLIDE · ACTION. Steps
  strike through as they complete. Aaron: *"love the tray"*. Built behind the
  Method B flag.
- **THE PLAYER MENU** beats a radial wheel, his pick over my comparison: the
  carrier's options are PRICED from the engine's own functions, so the menu
  cannot describe a shot the engine would not take.
- **THE MOMENTUM TAX, KILLED 08-16 AND REDESIGNED 08-17.** v1 charged the step
  AFTER you won: you picked a tile, beat your man, and landed one square short.
  Aaron killed it, *"unnecessary complication for the player to understand"*,
  and then brought the idea back the next day in the shape that works:

  > *"instead of showing the same potential tiles and landing short of one
  > because of a momentum tax, we would just show less available tiles when
  > doing crossovers, so the momentum tax is taken already at the decision
  > point for the player."*

  **So the tax is now paid in the TILES YOU ARE OFFERED, not in the landing.**
  Going through a man reaches one square less far than going around him. You
  see the shorter reach before you commit, you choose with the price already
  applied, and nothing is taken from you after you win.
  - Same cost, same intent, and the player is never surprised by it.
  - It becomes a spacing decision instead of a penalty: driving through
    traffic is genuinely shorter, so going around starts to look like the
    basketball move it is.
  - **v2 DIED ON 08-18, dropped by Aaron himself before it was ever built,
    and the killer was his own centers question.** Reach-minus-one would
    give a range-1 center a crossover reach of zero. He weighed moving to
    ability-based movement and rejected that too, in the same breath:
    *"no stat tells you how a player can move so nvm, I think we just drop
    the momentum tax, movement will be movement and the cards are the price
    that's all."* **That sentence is the law now: movement is movement, the
    cards are the price.** Twice designed, twice killed, zero of it shipped
    to a player; the record stays because the reasoning keeps earning.
- **STILL UNSOLVED, and Aaron raised it again on 08-17 looking at a
  screenshot:** whose turn it is. *"it's still unclear when it's your turn,
  maybe that's really all that the screen needs to show 'your turn!' and a
  player menu showing your options."* Tracked as V0 B17, not answered here.

## 13. Front of house — loading & identity

- **Loading screen**: looping ball → bounce → swish into hoop; scoreboard digits
  counting up; shot clock draining. Rotating NBA-idiom loading lines (never
  AI-slop words): "Lacing 'em up…", "Chalk toss…", "Setting the screen…",
  "Icing the shooter…", "Calling bank…", "Painting the key…", "Checking the
  tape…", "Squeaking the sneakers…"
- **THE BRAND · DECIDED AND SHIPPED 2026-07-27.** The five concepts below were
  the pitch and are superseded; Aaron generated his own round in Firefly and
  culled it to nine finalists, and four of those now do jobs. The monogram that
  led this list was REPLACED, and the grad cap this list called "probably too
  jokey" is the mark he kept. Recording the miss on purpose: my read of the
  concepts and his were furthest apart on the one he chose.

  | mark | its job | where it lives |
  |---|---|---|
  | **#48** head-brain | favicon, app icons, the title-screen crest, landing corner | `assets/brand/mark.png` |
  | **#76** circuit ball | share card, landing hero | `assets/brand/mark76.png` |
  | **#56** Philosopher | loading screens, spinball on the fingertip | `assets/brand/philosopher.png` |
  | **#64** grad cap | **the victory mark** | `assets/brand/gradcap.png` |

- **WHAT THE GRAD CAP MEANS, and it is a rule, not a decoration.** #64 marks
  that YOU WON THE THING. `game.js endShow()` drops it on the winner's slam and
  never on the machine's; the Daily Five gives it to a 10/10 sweep and to no
  other score (added 08-17, one cap with two beats: it crowns the PERFECT slam,
  and when that word leaves it settles into the panel corner and stays for the
  screenshot). **Any new surface that wants the cap has to be a win**, or the
  mark stops meaning anything the next time it appears.
- **The calendar and the menu stamp deliberately DO NOT use it** (ruled 08-17).
  Those cells are 15px, where the tassel and ball lose their silhouette, and
  they carry a second axis the artwork cannot: filled means you were there on
  the day, hollow means you caught it up late. A photograph of a hat has no
  hollow version. The crown, star and tick stay a ladder of flat SVG shapes.
- The five original concepts, kept only so the record shows what was pitched:
  Crossover Monogram · Card Crest · Open-Book Court · Matrix Rock ·
  Scholar's Swish.

## Open questions

- Real player names/likenesses vs. original archetype rosters (trivia about real
  players is fine; playable likenesses need a decision before public launch)
- Handicap dial for mismatched friends (rating-tuned question difficulty)
- Secret characters list (NBA Street energy)
- Home-court perk details

### THE DEPTH QUESTION (Aaron, 2026-08-10, unruled; candidates on the table)

Aaron: *"As of right now this is just a trivia game... I am adding all this
depth but really, what for? ... don't just take my ideas either, give me
more."* Raised alongside tester #1's finding that the strategy layer was
invisible (V0, B7 scope). Candidate directions, argued in full in the 08-10
session reply and indexed here so they survive the chat; none is decided:

- **The litmus every candidate must pass** (proposed law): a new system must
  feed the core loop (makes you better at trivia), spend its results (stakes,
  progression), or show them off (identity, social). Anything else is lobby
  furniture.
- **Fuse the layers: matchups change the QUESTIONS.** Crossing a shooter deals
  shooting questions, posting a big deals paint questions. Makes the board
  impossible to ignore (the Malik failure) by making strategy select trivia.
- **The Film Room** (gym hotspot candidate): your MISSED cards become film;
  re-proving a miss clears it and upgrades the card. Needs B8's play logging.
  Real basketball fiction, zero new content cost.
- **The Weight Room = conditioning**: spaced-repetition training disguised as
  reps; streaks buy floor-raising buffs (never ceilings, section 11 law).
- **Scouting cards** (Aaron's reading-room idea, sharpened): one-paragraph
  reads that immediately cash into a 3-question proof, crediting the source
  on-card. The find-prove-merge pipeline as gameplay. Counterweight to his
  own worry that in-app reading is homework: never more than a paragraph,
  always immediately spendable.
- **A season among the twenty** (LearnedLeague shape): one async match a day
  against a rotating friend, standings, a champion's jacket line. Rides the
  online-by-signal plan (V0 B9 row), needs no new mechanics.
- **The Jacket already answers "what for"** and must not be double-built:
  career is the spine that spends everything above.

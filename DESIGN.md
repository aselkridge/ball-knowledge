# BALL KNOWLEDGE — Design Bible v0.2

This file is the living record of every gameplay + art decision. If it's not in
here, it's not decided. Last updated: 2026-07-22 (pre-M0; added economy, modes,
loading screen, logo direction).

## North star

**Knowledge is your athleticism, strategy is your coaching.**
Trivia gates every score. Positioning, shot selection, and skill timing decide
close games. When two mechanics conflict, the one that serves this sentence wins.

---

## 1. The board

- Full court, rectangular tile grid, a hoop at each end. You attack one end, defend the other.
- **Tiles must read clearly** — visible grid, zone tints, occupancy highlight under each piece.
- The court is the difficulty map (distances from the basket you're attacking):
  - **Layup zone** (adjacent to rim): easy question · 2 pts
  - **Mid-range**: medium question · 2 pts
  - **Three-point zone**: hard question · 3 pts
  - **Logo zone**: ★ deep-range specialists only · hard+ · 3 pts
- Board edge = out of bounds. Badly missed pass meter → ball sails out, turnover.
  Shot-clock violation = turnover. Baseline traps shrink the ball-handler's options.

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
- Passing → pass-meter green width; elite passers get limited no-look passes (skip meter)
- **Handles → crossover base tier AND max carry depth** (Iverson crosses far;
  Draymond gets one power step). Position defaults (PG/SG/C + deep-cross +1)
  stand in until player ratings land with packs.
- Defense → slide distance (see §4) and contest scaling
- Speed → movement range · Rebounding → duel window · Dunking → dunk-meter width
- IQ/Leadership → heat gain, once-per-half play call (move two teammates)

## 3. The turn

Turn-based with a :24 shot clock per turn and ~15s question clocks. Reflex meters
inject real-time inside turns. (A real-time "Blacktop mode" is a possible later mode.)

Per offensive turn: one free off-ball shuffle (1 square) + one main action
(Move / Pass / Shoot / Skill). Wrong answers on risky actions = turnover.
Leaving players parked is strategy (spacing — defense must respect the corner sniper).

## 4. Defense

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

- Correct answers add heat: easy drips, hard pours; streaks multiply; misses cool.
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
| Venue backdrops (Gym, Sunset Blacktop, City Night) | world around the playable board = court skins | empty floor fills lower half; **NO hoops**, no people, no text; 16:9 |
| Player portraits | collector cards (later milestone) | style test first |

Rules: never ship watermarked stock previews; key/optimize before inlining;
assets live in docs/play/assets/. In-game 16px ball stays vector (illustration
is invisible at that size).

## 10. Question bank

The real content grind. Tiers: easy/medium/hard/impossible; categories by era,
team, player, rules, numbers. Authored in JSON, fact-checked by the test-kitchen
crew (Isaiah, Malik, Tim). Community packs = far-future.

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
- (Later: streetball rules, All-Star events as party modes, wager lobbies in credits.)

## 13. Front of house — loading & identity

- **Loading screen**: looping ball → bounce → swish into hoop; scoreboard digits
  counting up; shot clock draining. Rotating NBA-idiom loading lines (never
  AI-slop words): "Lacing 'em up…", "Chalk toss…", "Setting the screen…",
  "Icing the shooter…", "Calling bank…", "Painting the key…", "Checking the
  tape…", "Squeaking the sneakers…"
- **Logo**: direction TBD from five concepts —
  1. Crossover Monogram (B+K interlocked, basketball seam curves) — front-runner
  2. Card Crest (shield/trading-card frame, ball + bolt question mark; doubles
     as the card-back design) — front-runner
  3. Open-Book Court (book pages as a court, half-court line on the spine)
  4. Matrix Rock (falling-digit basketball) — better as loading animation than logo
  5. Scholar's Swish (grad cap with net) — probably too jokey
- Vector concept sheet to be rendered for sign-off before anything ships.

## Open questions

- Real player names/likenesses vs. original archetype rosters (trivia about real
  players is fine; playable likenesses need a decision before public launch)
- Handicap dial for mismatched friends (rating-tuned question difficulty)
- Secret characters list (NBA Street energy)
- Home-court perk details

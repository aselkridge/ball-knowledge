# BALL KNOWLEDGE — Design Bible v0.1

This file is the living record of every gameplay + art decision. If it's not in
here, it's not decided. Last updated: 2026-07-22 (pre-M0).

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

## 10. Question bank

The real content grind. Tiers: easy/medium/hard/impossible; categories by era,
team, player, rules, numbers. Authored in JSON, fact-checked by the test-kitchen
crew (Isaiah, Malik, Tim). Community packs = far-future.

## Open questions

- Real player names/likenesses vs. original archetype rosters (trivia about real
  players is fine; playable likenesses need a decision before public launch)
- Handicap dial for mismatched friends (rating-tuned question difficulty)
- Secret characters list (NBA Street energy)
- Home-court perk details

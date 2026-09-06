# Tempo review of the 09-06 proposal

Lens: what one possession costs in taps, seconds, decisions and hand-offs. Every number below comes out of `panel/tempo.py` (same folder); the unit costs it uses are listed in the assumptions table, and each is marked as code fact or assumption. I have not measured a live possession on the shipped game; neither did the panel. "Today" figures are the panel's estimate rebuilt from its own description.

Short version: the proposal is the slowest flow on the table. A typical made-basket possession is 25 taps and about 83 seconds for practiced players, 141 for first-timers, with the turn changing sides 8 times. Flow A is 12 taps and 46 seconds with 6 changes; today is about 21 taps and 56 seconds with 3. Two parts of the proposal cause almost all of it: the free off-ball move every turn, and playing the walk-up from the baseline after a made basket. Both are fixable without touching the idea he likes.

## 1. What I checked in the code today

- The 24 restarts at every turn on both sides. `CLK_OFF=24, CLK_DEF=24` (game.js 5969); `clockStart('off')` fires at the inbound and after every offensive action (4526, 4892, 6075, 6245), `clockStart('def')` at every slide (4184, 4499, 4912). The comment above it still says ":12 to answer on D"; the value is 24 and has been since the 07-23 ruling.
- The clock only ticks during the offense's own phases (`clockTickable`, 5989 to 5998). Cards, animations and the other side's turn do not eat it.
- At zero: offense, a shot-clock turnover (6009 to 6014); defense, "DEFENSE SLEEPS · play on" and the slide is forfeited (6016 to 6018). Nothing else.
- Nothing caps the number of turns in a possession. A quarter is 6 possessions (6021), so a long possession costs only real time. His filibuster diagnosis is right.
- A pass is free when it is 3 tiles or less, or up to 6 with a clean lane, and not a pressured forward pass (4425). Otherwise a card at tier 2, or tier 3 past 6 tiles (4440).
- A steal today, on the slide: the defender answers (tier 2 or 3 by position, 4199). Wrong: "All reach, no rock · the slide is spent" (5683 to 5685), nothing else. Right: the holder answers PROTECT THE ROCK (5688 to 5693). Both right: the rip-or-grip tap battle (5713). So one steal attempt is up to two cards and a buzz race, about 21 seconds practiced and 35 at the clocks.
- The "pick a pass steal lane" he asks about: not in the game. Grep for a lane pre-commit finds nothing; `laneDefenders` (2519) only counts bodies on the line to price a pass. It exists on paper only, DESIGN § 4 rule 1, as a perk for A-rated defenders ("once per possession may jump a lane"), never built. Today, choosing a lane means stepping a defender onto the line, which is just the slide.
- Question clock 15 seconds (5530). Ranges: point guard 3, wings and forwards 2, center 1 (1129). Court 15 by 8; the half-court line sits between columns 7 and 8 (`inFront`, 2531).

## 2. Assumptions the arithmetic rests on

| Unit | Value | Status |
|---|---|---|
| Off-ball free move | 2 taps, 4 seconds practiced, 8 seconds first-timer | assumption |
| Dribble with the ball | 2 taps, 4 / 9 seconds | assumption (1 tap if the handler is in hand by default) |
| Crossover | 2 taps + 1 answer, 4 / 9 seconds + the card | assumption |
| Pass | 1 tap (the receiver ring is the button, the accepted cut), 4 / 9 seconds | assumption |
| Shot | 1 tap + 1 answer, 3 / 5 seconds + the card | assumption |
| Card | 1 tap, 8 / 12 seconds | assumption; code maximum 15 |
| Defense step | 2 taps, 4 / 7 seconds; stay 1 tap, 2 / 4 seconds | assumption |
| Steal attempt, today's shape | 3 taps + about 24 reflex taps, 21 / 29 seconds | shape is code; seconds assumption |
| Lane pick | 2 taps, 3 / 5 seconds, no card | assumption; not built |
| Hand-off (strip, chime, piece slides) | 1.5 seconds | assumption |
| Shared phone, extra per hand-off | 2 seconds | assumption |
| Flip slam 2 seconds; inbound count 2 seconds; release meter 3 seconds | | assumption |
| The inbound pass counts as one of the three backcourt turns | | assumption from his words ("if they pass... the turn is used up") |
| Crossing half court on turn k restarts a fresh count of 3 | | assumption; he said "resets" |
| The 3-before-half count applies to a live steal too | | assumption; he did not say |
| A clean dribble ends the turn like a pass does | | assumption; his list names pass, crossover, shot only |
| Made basket: the inbound lands at column 2 or 3, so the ball needs 5 to 6 tiles to cross | | from `oOpts.over={SG:[2,3]}` (4798) |

"Practiced" means a player who has played a few games. "First-timer" uses the seconds the panel's critic used for a decision on a phone with priced tiles (8 to 15 seconds).

## 3. One possession, four flows

Made-basket inbound, offense starting in the backcourt. Turns are offense + defense. Side changes are how many times the acting side flips inside the possession (the flip at the end is not counted). Decisions count answers as decisions.

| Possession | turns | side changes | taps | decisions offense / defense | cards | seconds practiced | seconds first-timer | seconds shared phone |
|---|---|---|---|---|---|---|---|---|
| Proposal, quick (inbound, pass ahead, shoot) | 3+2 | 4 | 11 | 6 / 2 | 1 | 41 | 66 | 49 |
| Proposal, typical (3 turns up, 2 in the front court, blow-by then shot) | 5+4 | 8 | 25 | 12 / 4 | 2 | 83 | 141 | 99 |
| Proposal, typical, free move skipped twice | 5+4 | 8 | 21 | 10 / 4 | 2 | 75 | 125 | 91 |
| Proposal, longest (cap reached, pressured pass, one steal attempt, contested shot) | 6+5 | 11 | 40 + 24 reflex | 16 / 10 | 6 | 146 | 236 | 168 |
| Flow A, quick | 2+1 | 2 | 5 | 3 / 1 | 1 | 24 | 34 | 28 |
| Flow A, typical (inbound, move, pass, shoot) | 4+3 | 6 | 12 | 5 / 3 | 1 | 46 | 72 | 58 |
| Flow A, longest (24 of offense time used, one-card steal, contested shot) | 7+6 | 13 | 29 | 10 / 9 | 5 | 118 | 184 | 144 |
| Flow B, quick | 2+1 | 2 | 5 | 3 / 1 | 1 | 24 | 34 | 28 |
| Flow B, typical (two move-and-pass turns, shot) | 4+3 | 6 | 15 | 7 / 3 | 1 | 54 | 88 | 66 |
| Flow B, typical with the walk-up played | 5+4 | 8 | 19 | 9 / 4 | 1 | 67 | 112 | 83 |
| Today, typical (two setup picks, inbound, five free moves, DONE, slide, crossover) | 5+2 | 3 | 21 | 9 / 2 | 1 | 56 | 92 | 62 |
| Today minus the play pick (already ruled once a quarter) | 3+1 | 2 | 16 | 8 / 1 | 1 | 44 | 69 | 48 |

The panel's figure for today is 16 to 20 taps and 45 to 75 seconds; my rebuild lands at the top of that range because I count the setup pick as two taps (tap the card, RUN IT).

Live steal, no inbound, the ball 3 to 5 tiles from half court (assumption: most steals happen near the arc):

| Possession | turns | side changes | taps | decisions offense / defense | cards | seconds practiced | seconds first-timer | seconds shared phone |
|---|---|---|---|---|---|---|---|---|
| Proposal, quick (point guard dribbles across, shoots) | 2+1 | 2 | 10 | 5 / 1 | 1 | 32 | 54 | 36 |
| Proposal, typical (outlet ahead, dribble, shoot) | 3+2 | 4 | 15 | 7 / 2 | 1 | 47 | 81 | 55 |
| Proposal, longest (cap reached both halves) | 6+5 | 11 | 41 + 24 reflex | 15 / 10 | 5 | 140 | 232 | 162 |
| Flow A, typical | 4+3 | 6 | 13 | 5 / 3 | 1 | 46 | 76 | 58 |

Two honest readings of these tables:

- The proposal handles the live ball better than three-moves-then-shoot did. The critic's fatal flaw in C was that three moves could not cross the floor; the half-court reset fixes that, and a point guard steal is a 32-second possession. That is a real gain over C and it is his.
- The proposal's typical made-basket possession is longer than anything else on the table, including today. 25 taps against 21, 83 seconds against 56, 8 side changes against 3. Against flow A it is twice the taps, 1.8 times the seconds and a third more hand-offs.

## 4. Where the taps and seconds go

The typical proposal possession, practiced, beat by beat:

| Beat | taps | seconds |
|---|---|---|
| Inbound | 1 | 4 |
| Defense: stay | 1 | 2 |
| Free move + dribble | 4 | 8 |
| Defense: step | 2 | 4 |
| Free move + pass (crosses half court) | 3 | 8 |
| Defense: step | 2 | 4 |
| Free move + pass | 3 | 8 |
| Defense: step | 2 | 4 |
| Free move + crossover card + blow-by shot card | 7 | 27 |
| 8 hand-offs at 1.5 seconds, flip 2 seconds | 0 | 14 |

Three things account for the gap to flow A:

1. **The free off-ball move every turn: 8 taps and 16 seconds practiced, 32 first-timer, per possession.** Four free moves in a typical possession. Today's complaint was up to five free moves in a row; the proposal spreads the same number over five turns and adds a defensive step after each. The tap count for off-ball moves does not fall. The panel's critic said why free moves get taken: they are free, so skipping one feels like waste. If the free move is offered on every turn, expect it taken on most.
2. **The walk-up: 13 taps, 38 seconds, 5 side changes** from the inbound to the crossing. Three of those five side changes are defensive turns where the honest play is STAY, so the defense taps once and hands the phone back. Flow A and B glide both teams into their plays on a made basket and skip this whole; his proposal plays it. Over a game with 12 to 14 made-basket possessions (assumption), that is 7 to 9 minutes.
3. **Two cards in one turn.** The blow-by shot puts the crossover card and the shot card back to back: 27 seconds practiced, 46 first-timer, in one offensive turn. It saves one defensive step and two hand-offs, about 7 seconds. It costs the defender a wait of 16 seconds typical and 30 at the clocks, plus his own block card if he is in position.

## 5. The 24 against a turn with two decisions

- An offensive turn now holds a free move and a ball action. Practiced: 8 seconds of the 24. First-timer: 17 seconds, and the front-court turn where the SHOOT price and the crossover tiles are read runs 20 or more. The buzzer will fire on some first-timer front-court turns and it is a turnover. Not every possession, but not never.
- The cap does not cap seconds. With the 24 per turn kept, the longest possession at the cap is 6 offensive turns at 24, 6 defensive steps at 24, and 5 cards at 15: 363 seconds, six minutes, every clock legal. Flow A's ceiling with its possession clock and an 8-second step is 71 seconds.
- The defense's 24 becomes the stalling lever. Six steps at 24 is 144 seconds a possession that the defense may burn with nothing lost at zero ("play on"). Online that is the griefing tool; on a shared phone it is the friend who thinks. His filibuster worry moves from the offense to the defense unless the step clock shrinks. The panel's 8 seconds gives a 48-second ceiling for six steps; 10 gives 60.
- The 15-second card is fine on its own. What changes is how many cards can stack in one turn: two (crossover then shot, or crossover then a priced pass), which is new. The steal in its shipped shape adds two more on the defense's turn.

## 6. Over a game

24 possessions (4 quarters of 6), typical possession, practiced players, online or against the computer:

| Flow | minutes of play | side changes |
|---|---|---|
| Proposal | 33 | 192 |
| Flow A | 18 | 144 |
| Flow B | 22 | 144 |
| Today | 22 | 72 |

First-timers, same possessions: proposal 56 minutes, flow A 29, today 37.

Race to 11 at 12 to 20 possessions (assumption: a 50 to 70 percent make rate, so about five makes a side): proposal 17 to 28 minutes, flow A 9 to 15, flow B 11 to 18, today 11 to 19.

**Shared phone.** Two people, one phone, 2 seconds per physical pass (assumption): the proposal is 192 passes and 6.4 minutes of passing the phone in a 24-possession game; flow A 144 and 4.8; today 72 and 2.4. The walk-up is the worst of it: three of the five passes in the backcourt are for a STAY. If the phone lies flat between the two, the count still holds; what changes is that the pass is a reach instead of a hand-over. The critic's note on C applies word for word: on a 390-pixel phone lying flat, one person reads the strip upside down.

**Online.** No physical pass, so the side changes cost only the strip and the network. The two online costs are the 24-second step (the stalling lever above) and 8 to 11 round trips a possession where a dropped connection can land; the shipped online check already notes a reconnect mid-ritual degrades a beat.

**Decisions per side.** The proposal typical is 12 offensive decisions to 4 defensive, three to one. Flow A is 5 to 3. Giving the defense an action every turn evens it to about 12 to 8, at the seconds in section 7.

## 7. What buys tempo and what costs it

Buys:

1. **The 3-and-3 cap.** Bounds a possession at 6 offensive turns. Today's bound is none. Cost in the typical case: zero. Value: it ends the filibuster, which is real. What it does not do: bound seconds, unless the per-turn clock is short or the clock is per possession.
2. **The half-court reset.** Fixes the fast break that killed C. A steal-and-go is 2 turns, 32 seconds.
3. **The blow-by shot (One More).** Saves one defensive step and two hand-offs per blow-by, about 7 seconds practiced, 10 first-timer. Small, and it comes with the two-card wait in section 4.
4. **The blow-by free pass.** Same saving as 3 when it happens.
5. **The receiver as the button.** 1 tap per pass instead of 2. Two or three taps a possession. Already in the four cuts.
6. **The steal costing a blow-by.** No direct change in seconds; it cuts the number of attempts, and each attempt in the shipped shape is 21 to 35 seconds. Indirect but large if the defense would otherwise reach every turn (the Hoop League Tactics complaint the sports lens quoted).

Costs:

1. **The free off-ball move every turn.** +8 to 12 taps and +16 to 48 seconds a possession over flow A. The largest single item in the proposal, bigger than everything it buys put together.
2. **Playing the walk-up after a made basket.** +13 taps, +38 seconds, +5 side changes per made-basket possession over a glide. 7 to 9 minutes a game.
3. **A defensive action on top of the step.** A lane pick is cheap: 2 taps, 3 to 5 seconds, no card. A steal attempt in the shipped shape is 3 taps plus about 24 reflex taps, 21 to 35 seconds, two cards. If the defense attempts one steal a possession, the possession grows by a quarter to a third.
4. **The 24 per turn with up to 12 turns.** A six-minute ceiling and a 144-second stalling lever, both legal.
5. **Two cards in one offensive turn.** The defender's longest wait doubles, 15 to 30 seconds at the clocks.

## 8. His claims, checked

- "That's the 24 sec clock and the 15 sec clock right?" Yes. And the 24 is per turn, both sides, not per possession. So the cap he proposes limits turns while the clock still limits only each turn; the two together do not limit a possession's seconds.
- "Nothing would stop them from filibustering." Correct today. Nothing caps turns; time costs nothing in a 6-possession quarter.
- "Choosing a steal pass lane, you have that in the game somewhere right?" On paper only (DESIGN § 4, an A-defender perk, never built). What the game has is a pass priced when a defender stands on the line or a hand is within a tile of the passer. So today the lane pick is the slide itself. Building it as a separate action is new work; tempo-wise it is the cheap defensive action.
- "The steal costing." Today a wrong answer costs only the slide. He is right that it needs a cost. The bigger tempo fact is the shape: a steal today is two cards and a buzz race. A one-card steal (defender right = steal, wrong = blow-by) halves its seconds and drops 24 reflex taps.
- "Even when basketball is taught they say you have three dribbles." A youth coaching cue, not a rule, and a fine teaching device. The real-game cousins are the 8-second backcourt rule and the 24-second clock; his 3-and-3 is those two rules counted in turns instead of seconds.

## 9. Against the research

- Football, Tactics and Glory (sports lens, section 6): reviewers praise the three-pip counter and complain about the wait behind it. That is why C was retired. The proposal's counter is six pips over two halves with a defensive step after each, so the wait behind it is spread rather than blocked; the count of stops goes up, not down.
- The first run's pace finding (22af A4, the best-sourced in the program): "trim the stops per possession; shrink distance-to-shot so possessions resolve in fewer turns." The proposal adds stops (8 side changes, 2 to 6 cards) and lengthens distance-to-shot by playing the walk-up. It runs against the one pace finding that survived checking.
- Hero Academy and Magic Arena (thin sources): several small reaction windows read as unbearable. The proposal has 4 to 6 per possession, three of them in the backcourt with nothing to do. The sourcing is weak, so this is a risk to test, not a verdict.
- Hoop League Tactics (fetched review): a steal chance on every dribble and pass makes it "annoying to play." His blow-by cost is the right answer; the shipped two-card steal shape is still the wrong tempo.
- Blood Bowl (fetched rules): move-then-act once a turn, priced. His blow-by shot is exactly that ration. Consistent.
- Kill Team: one informed step after each enemy action. His defensive step is that. Consistent.
- Nothing in the archive priced a two-decision offensive turn or a walk-up played turn by turn. Those two are unmeasured anywhere; the numbers above are the first count.

## 10. Score and the repairs

**Tempo score for the proposal as written: 3 out of 10.** Slower than today on taps, seconds and hand-offs; the slowest flow on the table; a six-minute legal ceiling. The cap and the half-court reset are good ideas carrying two expensive passengers.

For scale: flow A with the four cuts, 7 out of 10 (12 taps, 46 seconds, 6 side changes; unproven on a shared phone). Flow B, 7 (15 taps, 54 seconds, 6 side changes, the best on one phone). Today, 3 (21 taps, 56 seconds, most taps before the defense sees anything; its one virtue is 3 hand-offs).

Three repairs keep everything he asked for and buy the difference, with the numbers they buy:

1. **Glide on a made basket, play the walk-up only on a live ball.** Flow A and B already do this. Buys 13 taps, 38 seconds and 5 side changes per made-basket possession. The half-court violation still exists; it just bites on steals and rebounds, where the defense is out of shape and the count matters.
2. **The free move is a choice, not a step.** Tapping a ball action skips it in zero taps, and it is not offered on the inbound turn. Buys 4 to 8 taps and 8 to 32 seconds a possession, depending on how often it is used. If playtests show it taken every turn anyway, the free move is the shipped complaint in a new coat and should go.
3. **The defense's step clock at 8 to 10 seconds, expiry forfeits the step, and the steal as one card** (right = steal, wrong = blow-by, no holder card, no buzz race). Buys a 48 to 60 second ceiling on six steps instead of 144, and 11 to 20 seconds per steal attempt.

With those three: the typical made-basket possession is 15 taps, 55 seconds practiced, 90 first-timer, 4 side changes; the longest at three front-court turns with a steal and a contested shot is 26 taps and 94 seconds. That is flow B with a crossover and a cap, which is what the proposal is underneath. Tempo score repaired: 7 out of 10, level with A and B.

One number I cannot produce: whether four to six hand-offs a possession feel like chess or like ping-pong on one phone. The paper walkthrough the memo asks for is the only instrument for that, and it should be run with the walk-up glided and with it played, so he feels the 38 seconds himself.

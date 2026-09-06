# Rules coherence review · Aaron's 09-06 possession

Lens: does the proposal hold together as a rulebook two people could play on
a printed court. Every line below is tagged. HE SAID: his words, 09-06 or
09-05. TODAY: the shipped code, docs/play/game.js, with the line. GAP: not
said by anyone, must be written. MINE: my suggestion, not his decision.

Verified for this review beyond the facts given: the court is 15 columns by
8 rows; attacking the right rim, the frontcourt is columns 8 to 14 and the
middle column (7) is backcourt for both sides (game.js 2531, inFront). A
shot exists only within 38 feet of the rim (HEAVE_FT, game.js 1530 and
1544), so no square in the backcourt can shoot, and neither can the four
outer squares of column 8 (computed from the constants). Movement: point
guard 3, shooting guard 2, small forward 2, power forward 2, center 1
(game.js 1129). After a made basket today, the setup puts three attackers
in the frontcourt already, the shooting guard at column 2 as the receiver,
and the point guard behind the baseline to inbound (game.js 4795 to 4798,
6234). The crossover today is not one card: the ball handler answers, then
the beaten defender answers a stay-in-front card, both right is an ankle
battle; a wrong first answer gives the defender a pick-the-pocket card, and
if he misses that too the move is wasted and the offense keeps the ball
(game.js 5659 to 5768). A shot is contested by a defender next to the
shooter and between him and the rim, and a center is preferred as the
contester (game.js 2499 to 2513). A timeout today is the pause button: it
freezes the clock and is refused while a card is up (game.js 653 to 670).
An offensive rebound is the same possession, "Go again", the 24 restarts
(game.js 6070 to 6079). The diamond press is offered to the defense only
after a made basket (game.js 4611, 4619).

## 1. His proposal written out as one possession

### Start of a possession

- The ball changes teams by a made basket, a defensive rebound, a steal, a
  sailed pass, or a violation. TODAY.
- The offense and the defense each pick a setup during their first offense
  and their first defense of the game, not after the jump ball. HE SAID.
  GAP: whether the pick is once a game, once a half, or once a quarter (the
  board says "depending on the game format"). GAP: the diamond press is a
  made-basket-only shape today; with pick-once it is either the whole
  game's defense or never picked.
- Where everyone stands when the ball becomes live. GAP. He did not say.
  TODAY after a made basket: three attackers pre-stationed in the
  frontcourt, the receiver at column 2, the inbounder behind the baseline.
  After a steal or a defensive rebound: all ten at the same end, the ball
  in the hands of whoever took it, in that team's backcourt. The half-court
  count applies to every possession start except an offensive rebound.

### One offensive turn

1. One free move by a player who does not have the ball. HE SAID.
   GAP: how far (today's setup moves run at full role range, ruled 08-18;
   the 08-11 free step was exactly 1 square). GAP: whether it must come
   before the ball action or can come after (pass, then cut).
2. Then one thing with the ball, and it ends the turn: pass, crossover, or
   shot. HE SAID ("if they pass or cross over or shot the turn is used up").
   GAP: a plain dribble to an unguarded square is not on his list. It is
   either a turn-ending ball action (MINE: it must be), or impossible, or
   free. If it were free the ball handler could walk the floor unanswered.
3. A crossover is a dribble into a guarded square; it brings up the card.
   TODAY.
4. A blow-by crossover in shot range: the shot goes up at once, no
   defensive turn in between, and it can still be contested by a defender
   already next to the landing square and between it and the rim, big men
   preferred. HE SAID, and it matches today's contest rule exactly.
5. A blow-by crossover outside shot range: a free pass at once. HE SAID
   ("I guess"). GAP: free of the turn, or free of the card too. A pass of 7
   or more squares is a heave card today; from column 5 to a corner shooter
   at column 13 is 8 squares.
6. One More is once per turn and never off a pass. MEMO, and he took the
   shot half of it. GAP: what "blow-by" means against today's three-step
   crossover. A right first answer is not yet past the man: the defender
   can still wall him off, or win the ankle battle.
7. The 24 restarts at every turn and runs only while the offense's buttons
   are up. TODAY (CLK_OFF=24). At zero, turnover. TODAY.

### One defensive turn

1. One defender moves. HE SAID ("the defense responds with a movement").
   GAP: how far (today's slide is full role range; the memo's A said a
   short step and a beaten man recovers one square only). GAP: what the
   move answers, the whole offensive turn (free move plus ball action) or
   each half of it. His sentence order says the whole turn.
2. Possibly an action after the move: pick a pass lane, or try a steal if
   the mover ends next to the ball. HE ASKED, did not decide.
3. A steal attempt: the defender's card (guards medium, forwards and
   centers hard); wrong costs him a blow-by square (the small change he
   accepted); right puts the ball handler on a protect-the-rock card.
   TODAY plus the accepted change.
4. The defense's clock: 24 per slide today (CLK_DEF=24). The memo proposed
   8. HE SAID nothing on 09-06.

### The count

- Three turns to get the ball over half court, or it is a half-court
  violation, turnover. HE SAID.
- When the ball crosses, the count resets: three more turns to shoot, or
  it is a shot clock violation, turnover. HE SAID.
- GAP: which turns count. Offensive turns only is the only reading that
  works (the board's own word "turn" covers both sides' turns).
- GAP: whether the inbound pass is turn one.
- GAP: the count after an offensive rebound, a timeout, a One More pass
  that crosses half court, a wasted crossover, a steal.
- GAP: the name. The game already calls the 24 the shot clock ("SHOT
  CLOCK! 24 seconds of nothing, turnover", game.js 6014; DESIGN § 1). His
  message calls the three-turn count the shot clock too.

## 2. Holes and contradictions

Numbered, harshest first.

**H1. The reset rewards holding the ball in the backcourt.** Cross on turn
one and the possession has four offensive turns in all. Cross on turn three
and it has six. Each turn also hands the offense a free off-ball move, so
the slow team gets two more cuts than the fast team, and picks when to
cross. That is the opposite of what a shot clock is for. Real basketball
does not have this problem because the 24 keeps running through the eight
second count. His per-turn 24 does not accumulate, so nothing plays that
role. MINE: one count for the possession, cross by turn 3, shoot by turn 6.
Same worst case as his, no reward for waiting, one number pair to teach.

**H2. Two different things called the shot clock.** The 24 per turn is the
shot clock today, on screen and in the rulebook. The three-turn count is a
shot clock in his message. A player hearing "shot clock violation" cannot
know which one fired. One of them must be renamed before anything is
built. His own teaching line ("you have three dribbles") suggests the
count's name is dribbles or turns, and the 24 keeps its name.

**H3. The plain dribble is missing.** His ball-handler list is pass,
crossover, shot. The most common thing a ball handler does, dribble to an
open square, is not on it. If it is a turn-ending action, say so and the
row reads Move, Pass, Shoot as today. If it is not, the possession has no
grammar.

**H4. The defensive turn is a question, not a rule.** "Should they get an
action too?" is unanswered. Three shapes are possible and they play very
differently:
- Move OR steal (today's rule: the steal uses the slide). One thing a turn.
- Move THEN steal if the mover lands next to the ball. Two things a turn.
  Every defender's reach for a steal becomes his range plus one. A steal
  attempt puts a card in front of the offense every time the defender's
  card is right, which is the Hoop League Tactics complaint the sports
  lens warned about ("you can neither dribble nor pass without risk").
  The blow-by cost only fires when the defender misses.
- Move, and a different defender steals. Mirrors his offense (the free move
  is never the ball handler; the action is). MINE: this is the symmetric
  shape if he wants two things a turn.
Is two things a turn the shape he rejected? No. What he rejected on 09-05
was three beats with the defense wedged in the middle (move, their step,
then shoot). His new offensive turn is itself two things (a free off-ball
move plus a ball action), which is the memo's B, not A. A defense that
moves and then acts is B mirrored. It contradicts the memo's A grammar,
which he is no longer choosing, not his own objection.

**H5. Picking a pass lane is not in the game, and cannot be hidden on a
shared phone.** He asked "you have that in the game somewhere right?" No.
It is a filed signature skill for special players (BUILD.md 3103: a secret
lane pick, armed by a card, online-first, "on one shared phone it needs a
pass-the-phone moment"; row 187 shelf). What exists today is a defender
standing in the lane: any pass over three squares with a body in the lane
costs the passer a card (game.js 4425). So a public lane pick adds nothing
the step does not already do, and a hidden one is a different game on one
phone: both ends of the buzz-race layout look at the same court. MINE: no
lane pick in the base rules; the step is the lane pick; the hidden version
stays a signature skill.

**H6. Blow-by means two things.** A failed steal gives the ball handler one
free square past the reacher. A won crossover is also a blow-by and gives
One More. The first is a square during the defense's turn; the second is an
action during the offense's turn. If a steal-miss square lands in shot
range, does the shot go up at once too? Not said. Two names are needed, or
one rule that covers both.

**H7. One More has no trigger against today's crossover.** Today a right
crossover answer starts a chain: the defender answers to stay in front,
and if both are right an ankle battle decides. "Blow-by" can only mean the
ball handler is past the man: the defender missed his card, or lost the
ankle battle. If One More fires on the offense's right answer alone, the
defender's card and the battle either vanish or come after the shot, which
makes no sense. Rule to write: One More fires only when the chain ends
with the ball handler past his man.

**H8. Free pass and One More are the same thing, or they are two.** His
"free pass outside shot range" is the One More action when no shot exists.
Read that way there is nothing to add. Read as "a pass with no card" it is
a second gift: a backcourt blow-by plus a card-free heave to a pre-
stationed corner shooter crosses half court and reaches the shooter in one
turn. MINE: free of the turn, never of the card.

**H9. The last turn of the count can be unplayable.** On the last turn the
ball handler must shoot. If he stands where no shot exists (outside 38
feet, or in the logo zone as a non-specialist, DESIGN § 1), his only legal
action is a pass, and a pass on the last turn is a violation. Either the
row shows LAST TURN and the player wears it (simple, harsh, same as the 24
running out today), or a last-turn pass to a man who shoots at once is
allowed (the catch-and-shoot item open since 08-02). One must be written.

**H10. Crossing with a slow handler.** The arithmetic, from the code's
numbers. After a made basket the receiver stands at column 2 and needs to
reach column 8. Point guard, range 3: two dribbles, one turn of slack.
Shooting guard, range 2: three dribbles, zero slack, so one wasted
crossover card is a half-court violation. Center, range 1: never alone; he
must pass. After a defensive rebound or a steal the ball is at columns 11
to 14 and the frontcourt starts at column 6: a center cannot cross alone
in three turns under any reading. What saves him is the free off-ball
move: the point guard runs three squares on turn one's free move, takes
the outlet as turn one's ball action, and dribbles over on turn three. That
works only if the outlet pass is free (within three squares, or six with a
clean lane and no pressure) or its card is answered. So the count does not
strand a slow team; it forces the outlet pass, which is basketball. But it
must be visible: the count on the row, the pass prices on the rings. And
whether the inbound pass is turn one decides whether the shooting guard's
zero-slack case is even reachable. MINE: the count starts on the first
turn after the catch, as the eight second count starts on the touch.

**H11. The count and the rest of the game do not share a unit.** Three in
the key counts "three of your actions in a row" (game.js 4456). Under the
new turn an action is a free move plus a ball action. The paint count, the
half-court count and the shot count must all count the same thing, the
offensive turn, or a player will be whistled by a rule that counts
differently from the one on screen.

**H12. A backward pass over half court.** Already a turnover (over and
back, game.js 4446: once the ball has been in the frontcourt any move or
pass of the ball to a backcourt square blows the whistle). No new rule
needed. Before the ball crosses, backward passes are free and the count
runs on. Consistent.

**H13. A crossover that lands on a shot square.** Covered by One More if
the blow-by is real (H7): shoot at once. If the crossover is won but the
player would rather pass (an open corner after help came), not said.
MINE: One More is one action, pass or shoot, never another move; that one
sentence covers both his sentences.

**H14. Offensive rebound.** Same possession today, no reset of anything but
the 24. Under the count: not said. A full three would let a team that
misses keep six turns; zero would end the possession on the board. MINE:
two turns, the shape of the 14 second rule.

**H15. Timeout.** Not said. If a timeout resets the count, timeouts become
the filibuster he is trying to stop, unless they are few. If it does not,
say so. Today a timeout only freezes the clock and cannot be called on a
card. His earlier idea (memo § 6 item 8, board F) adds the setup pick and
substitutions to a timeout; also unwritten.

**H16. The free move before a shot.** A power forward's screen eases an
adjacent teammate's shot question (DESIGN § 2), and an off-ball body next
to a defender breaks his gating of drives (game.js 2532). So the free move
can be "slide the screener next to the shooter, then shoot", or "screen
the ball handler's man, then drive past him with no card", both with no
defensive answer in between. That is move-then-shoot by proxy, and the
memo's B carried the same issue. Decide whether shot prices are read
before or after the free move, or accept it as the point of a screen.

**H17. Setup once, press forever.** With the setup picked once, a defense
that picks the diamond press keeps it for the whole span of the pick. A
press against a three-turn half-court count is the strongest thing in the
rulebook: every inbound dish pressured, every crossover a card, one miss a
violation. Maybe right, but it is a consequence nobody has priced.

## 3. Rules that must be written before a paper game

1. What one offensive turn contains, with the plain dribble on the list.
2. The free off-ball move's range and its order relative to the ball action.
3. What one defensive turn contains: move or steal, or move then steal, and
   who may do which.
4. The defensive move's range.
5. Which turns the count counts, and the turn it starts on.
6. The count's shape: two separate threes, or one six with a cross-by-three
   check (H1).
7. The count's name against the 24's name.
8. The count after an offensive rebound, a steal, a timeout.
9. Where everyone stands at each kind of possession start.
10. When One More fires (H7), what it may be (H13), and whether its pass
    pays its card (H8).
11. The two blow-bys, named apart (H6).
12. The last turn: shoot only, or pass to a man who shoots at once (H9).
13. Whether a pass lane can be picked at all in the base rules (H5).
14. Whether the defense's clock stays 24 or goes to 8.
15. The unit for three in the key (H11).

## 4. Against the research, for coherence only

- Blood Bowl rations move-then-act to once a turn and prices it. That
  supports his offensive turn (the free move plus a priced ball action)
  and a defensive move-then-steal only if the steal costs, which he has
  accepted.
- Football Tactics and Glory was the reason C was retired. Its complaint is
  three actions in a row with nothing for the other side to do. His count
  keeps a defensive turn after every offensive turn, so that complaint does
  not transfer. The other two reasons on the board do: the same skeleton
  every possession, and three moves cannot cross the floor after a steal.
  He answered the second with the reset, at the cost of H1. So the memo's
  "C retired on evidence" is weaker against his version than it reads.
- Hoop League Tactics: a steal chance on every dribble reads as annoying.
  Move-then-steal raises how often a steal can be tried, and the protect-
  the-rock card lands on the offense every time the defender's card is
  right. The blow-by cost does not fix that half.
- Madden's one controlled defender is his defensive turn either way.
- The August finding that several small reaction windows are unbearable is
  about the defense reacting inside an offensive turn. His shape does not
  do that. It is not evidence against him.
- The research never asked what one turn may contain or what the other
  side gets after move-then-act (memo § 5). His proposal is exactly that
  question, so no research answers it; only the paper game does.

## 5. Score and the smallest set

**Coherence as spoken: 4 of 10.** The spine is sound and it is a known
shape: the memo's B (move one, then act) plus One More plus a two-stage
count plus a mirrored defensive turn. What drops it to 4: the reset rewards
waiting (H1), two things share the name shot clock (H2), the most common
ball action is missing (H3), the defensive turn is a question (H4), the
lane pick is neither built nor hideable on one phone (H5), and One More has
no trigger against the crossover the game actually has (H7). None of these
is a taste problem; each one stops two people playing it on paper.

**The smallest set that makes his idea work, in his terms (MINE where
marked):**

1. Your turn: one free move by a teammate without the ball, then one thing
   with the ball: dribble, pass, or shoot. Any of the three ends your turn.
2. Their turn: one defender moves, or one defender already next to the ball
   goes for the steal. Not both. (MINE: keeps the card count down; his
   move-then-steal is the alternative and needs a cap.)
3. Dribbling into a guarded square is a crossover, priced by the card as
   today. If you end up past your man, you act once more right away, shoot
   or pass, no defensive turn between. Once a turn, never off a pass. The
   pass pays its normal card. (His One More, with H7, H8 and H13 closed.)
4. A missed steal gives the ball handler one square past the reacher, and
   then it is his turn as normal. (The accepted small change, named apart
   from the crossover blow-by.)
5. The count: six of your turns a possession, counted from the first turn
   after the ball is caught. The ball must be over half court by the end of
   turn three. A shot must go up by the end of turn six. Either miss is a
   turnover. An offensive rebound gives two more turns. A timeout changes
   nothing. (His numbers, one count instead of two, H1 closed. The six is
   a tuning number; five is the other candidate.)
6. The 24 stays as it is and keeps its name. The count is called the
   dribbles, or the turns, never the shot clock. (H2.)
7. No lane pick. A defender standing in the lane is the lane pick. (H5.)
8. Over and back, three in the key, out of bounds: as today, with three in
   the key counting turns. (H11, H12.)

Eight rules. With those written, the proposal reads as about 8 of 10: what
is left is tuning (the ranges, the defensive clock, five or six) and the
paper walkthrough the memo already asked for.

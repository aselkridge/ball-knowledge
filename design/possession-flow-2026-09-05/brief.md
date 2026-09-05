You are working on BALL KNOWLEDGE, a turn-based basketball strategy game played mostly on phones (390px wide), in the repo at /home/user/ball-knowledge. Read files if you need more: DESIGN.md sections 3, 4 and 12b (the turn, defense, reading the turn), design/d37-defense-findings.md, design/22af-findings.md, design/22ai-findings.md, design/GAMEPLAY-WALKTHROUGH-2026-08-28.md, and TODO.md rows 223 and 225 to 244 (the owner's latest playthrough notes, in his words). The shipped code is docs/play/game.js (one big file; search for 'mbStartSetup', 'mbSetupEnd', 'def-slide', 'off-select', 'function inbound(' to see the current possession machinery).

THE GAME, the facts that constrain any design:
- A rectangular tile court, 15 tiles long by 8 wide, two baskets, real court lines, seen in 3D on a phone. Five real players a side (real NBA and WNBA names), each a figurine on a tile. One of them holds the ball.
- Knowledge is the jumpshot: every scoring attempt is gated by a basketball trivia question with four answers and a 15 second clock. The tile you shoot from sets both the points and the question difficulty (near the rim = easy question, 2 points; mid-range = medium, 2; behind the arc = hard, 3; the logo = very hard, 3). Wrong answer = the shot misses / turnover. Dribbling past a defender ("crossover") is also priced by a question; passing through traffic can be too. Movement is movement, the cards are the price (owner's law).
- Every defender guards all eight tiles around them. A lane that two defenders both guard is closed (cannot be entered). Movement ranges depend on the player's role (roughly 1 to 3 tiles).
- There is a game clock, a 24 second shot clock for the possession, and a 15 second question clock. Formats: race to 11, or 4 quarters of 6 possessions each.
- Two ways to play: versus the computer, two people on one phone (hot seat), and online (two phones).
- Possessions alternate: inbound after a made basket, dead-ball resets; steals and defensive rebounds continue live with no reset (the owner's rule: the team that took the ball keeps the advantage).
- A "jump ball" buzz race opens the game (already rebuilt, not in scope).

WHAT IS SHIPPED TODAY (the thing the owner says is too much): at every dead-ball inbound the defense picks a formation from a list, then the offense picks one seeing it; all ten pieces snap into those shapes. Then the offense gets FREE MOVES: every off-ball player may step, one at a time, tap-tap-tap, then taps DONE. Then the defense gets ONE SLIDE (one defender moves). Then the offense takes its MAIN ACTION (move with the ball / pass / shoot, priced by questions). A step ladder on screen reads SETUPS > BALL IN > FREE MOVES > SLIDE > ACTION.

THE OWNER'S WORDS (2026-09-05), the brief you are designing to. He played the live game and said:
- "moving every player every time is starting to seem like a really bad setup because you run the clock down just trying to click each player, move, click move, click move, click move. It's just too much. Something's gotta give."
- His new direction: the plays are picked ONCE, "at the beginning of each quarter or half or game depending on the game style", from a list that can take most of the screen (with a small 2D board above the list that moves the pieces around to show what the whole floor will look like for each choice). Timeouts, called only on offense, are the chance to change the play. That is decided; do not redesign it. The open question is what happens INSIDE a possession, turn by turn.
- "it should be very clear whose possession it is. They should highlight the player with the ball. Then it should say something like, move your player or shoot. It should be almost like Pokemon. You have your choices on the bottom, what to do, and then you can move, you can pass. Then the defense gets their turn to move. That goes back and forth until there's a flip of possession."
- "movement of the person with the ball or somebody off the ball is free, so we're still keeping that as free. They can still move and then pass. I don't know if they should be able to move and then shoot... if they can move then shoot then defense doesn't really have the option to respond."
- "once their turn is done, it should flip, clear, defense possession. And that movement should be zoomed in on, highlighted... it needs to be a much faster pace back and forth. It has to be really clear that it's back and forth. That part needs to be more like chess."
- "Sometimes defense moves, you don't even realize it's your turn again. That should never happen. The clock should be very clear, bright, top right, and kind of jump out at you as it gets lower. We gotta have a buzzer."
- "following the gameplay is really difficult because you never really know that a turn ended."
- "if you click on one person and it zooms in on them... you can't even see or access another player in order to pass it to them... Now you're just trying to beat the clock based off of bad UI."
- "I do like the readout at the top... I want it to be more announcer style, like NBA Street, where it's just like, oh, this happened and that happened, not like move to A1 and B4."
- "I'm starting to wonder if we need to be looking at the board more like how 3D chess games are set up."
- "the screen should only have on it what we need at the time to play."
- And his doubt, the exact thing to answer: "what will happen? The offense picks a player and moves them, then the defense picks a player and moves them and THEN the offense chooses to shoot or pass? And then the offense goes again to start it over? That feels confusing. What is the overall process and is that easy to digest as a player? How will you make the visual part clear so that the repeated flow feels fluid and fun and not tedious and confusing?"
- His instruction to us: "Do not make assumptions, do not stay stuck on current structure or patterns, think inside and outside the box and do not compromise ideas or throw them out based on assumptions... make the best not easiest decision."

WHAT THE RESEARCH ARCHIVE ALREADY SETTLED (cite it, do not re-argue it, but you MAY propose something that contradicts it if you say so out loud and why):
- Turn structure itself was never verified in any shipped game (22af finding A7: "zero claims about turn structure survived checking"); the archive's advice there is design reasoning: keep alternating possessions; if the waiting player disengages, give the defender something to do inside the question beat rather than rebuild the turn system.
- Blood Bowl (22af finding 4): safe moves first, the gamble last; a failed risky action ends the whole turn; that ordering gives a possession a shape.
- Strat-O-Matic (22af finding 6): a basketball possession is one story about one matchup, the ball handler against his defender; everyone else is context.
- The defensive answer (d37 findings): one defender making one small, capped move AFTER seeing the offense's move reads as fair (Kill Team's "Counteract"); several small reaction windows read as unbearable (Magic Arena, Hero Academy); mirrored full-team movement is tedious (Wargroove); blind pre-commitment dominates or reads as luck (XCOM overwatch); no mid-beat prompts to the defender, ever.
- The play menu (22ai findings): defense picks from 3, offense from 4 to 5, everything visible, one tap. The owner has now moved the pick to once per game/half/quarter, which loosens the count.
- The owner's own 08-12 theory: "offense has full team free movement and the defense has 1 person slide (full motion) and then offense has an action. This continues until the opposing inbound." He has now walked that back on 09-05 (too many taps).

LANGUAGE LAW for everything you write: plain English for the owner, who knows basketball but not game-design vocabulary. Basketball words are fine (pick and roll, help defense, inbound). No abbreviations, no internal code names (never write Method B, MB, D37, 22af, UI/UX; say "the research" and "the screen"). No em dashes. Short sentences.

## THE OUTPUT SHAPE every concept must follow (markdown, these exact headings)

# <Name, two to four words>
**One line:** the whole idea in one sentence a player could repeat.
## The loop
3 to 6 sentences: what the offense does, what the defense does, when it flips back, when the possession ends.
## One possession, beat by beat
A table: Beat | Whose turn | What happens | What the phone shows (what is lit, what the choice row says, what the announcer line says, what the clock does; nothing else on screen) | Taps | Seconds. 6 to 12 beats, from the inbound to the ball changing hands.
## Move then shoot?
Yes or no, the reason, and what the defense gets.
## Why it reads clearly
How a first-time phone player always knows whose turn it is and what to do; what the hand-off looks and sounds like.
## Why it is fun, not tedious
## Fit with the locked rules
The question gates, eight-tile guarding, closed lanes, the 24 second clock, plays picked once, offense-only timeouts, live-ball continuation. Say out loud any rule you would change and why.
## Numbers
Offense decisions per possession · defense decisions · total taps · seconds per possession · longest wait for the other player (seconds).
## Weaknesses
## Open questions for the owner
## Borrowed from
Games or sports patterns, named honestly.

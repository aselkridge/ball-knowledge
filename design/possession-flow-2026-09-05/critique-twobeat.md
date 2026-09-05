# Critique: Build, Answer, Finish

Judged against brief.md, scout.md, DESIGN.md sections 3, 3b and 4, the 08-02 rulings in the first research findings file, and the role ranges in the shipped code (point guard 3, wings and forwards 2, center 1; the concept has those right).

## Lens 1 · The first-time player

I am a tester on a 390 pixel phone, no coach, never read a rulebook. I walk the eight beats.

**Beat 1, the whistle.** A slam says TOWN BALL with a horn. I am playing against the computer, so I know I am Town only if the matchup screen told me and I remembered. On a shared phone this is worse: two people, one slam with a team name, and whoever is Town has to reach for the phone. It does not say YOU. Small, but it is the first thing a tester sees. Confusion one, mild.

**Beat 2, the build.** Three buttons, MOVE lit, PASS lit, SHOOT dim with "after they answer" under it. The lit buttons are the best thing in this concept: I know it is my turn because there is something to press. But "after they answer" means nothing to me. Answer what? I have not seen a question yet. Confusion two. Then I tap MOVE and the button says "MOVE · who?" I tap Curry because he has the ring. Tiles light green and amber; one amber tile says MEDIUM. I do not know that MEDIUM means a trivia question is about to appear. I tap it. Confusion three, and it costs me a card I did not expect. The concept's own open question 5 says the dim SHOOT button is tappable and means "skip the move". On every phone I own, dim means dead. A tester will either never find it, or tap it by accident and lose his move. That is a trap, not a teaching device.

**Beat 3, the first hand-off.** Replay, both tiles glow, one announcer line, then the slam SHOWTIME · YOUR ANSWER with a whistle, lights flip, the clock turns colour and reads 8. Four signals in two seconds. As a hand-off it works; I would know something changed even looking away. But the word ANSWER is the wrong word in this game. The whole game is answering questions. A tester who sees SHOWTIME · YOUR ANSWER expects a trivia card and gets a chess move. Confusion four, and it repeats every possession until learned. On a shared phone the two seconds of replay do not include the physical pass of the phone, and the 8 second clock is already running by the time the second person has it the right way up.

**Beat 4, the answer.** Five little chips over the five opponents, "2 · EASY", "3 · HARD", "3 · VERY HARD". First reading as a tester: those are labels on the other team's players, maybe their skill. Nothing says "this is the shot he can take right now". Confusion five. The bottom row says MOVE ONE and STAY, which is clear. I tap a defender, and the concept says the chips "update live as you hover the tile". There is no hover on a phone. Either the chips update on a first tap and a second tap confirms (three taps, not two), or they do not update at all and the puzzle is solved blind. Either way the concept is describing a mouse. Eight seconds to read five chips on a tilted court, pick one of five defenders, and pick one of up to eight tiles, on a first play: that is not enough, and the concept admits the chips have not been render-tested at phone size. What happens at zero on the defense's clock is not written anywhere. Confusion six: the tester lets it run out and does not know whether he lost anything.

**Beat 5, the second hand-off.** Same ritual, TOWN · FINISH, clock back to Town's colour at 17. Fine. But by now the same clock face has shown 24, then 8, then 17, and the next card will show 15. Four different numbers in one possession on the one clock the owner wants to be "very clear". A tester cannot tell which number is the possession and which is the beat.

**Beat 6, the finish.** MOVE dim with "they answered", PASS lit, SHOOT lit with the price on it. This is the clearest beat in the table. The price on the button is exactly right. If I moved Thompson to the corner in the build hoping to shoot with him, I now discover SHOOT is Curry's shot and I need PASS. The chip on Thompson tells me, so it is discoverable. Mild.

**Beat 7, the shot.** One button, SHOOT with the price, then the card. Nothing to get wrong.

**Beat 8, the result.** Announcer line, horn, SHOWTIME BALL, their buttons appear. Clear. But if I am Showtime and the miss was rebounded by my center under Town's basket, my five light up at the wrong end of the floor with MOVE · PASS · SHOOT and nothing on screen tells me why my only shot is from behind half court. See Lens 3; the tester meets that hole on the first miss.

Count: six confusions, two of them repeating every possession (ANSWER, the chips) and one a trap (dim SHOOT). Do I know it is my turn: yes, always, from the buttons and the lights. Do I know what I can do: yes on offense, roughly on defense. Do I know what just happened: yes, the replay and the announcer are good. Do I know the ball changed hands: yes, the horn and the slam. The hand-off is visible without reading. The beats inside the possession are not fully readable without reading.

**Score: 6 out of 10.** The signals are the strongest of any turn design in the repo. The words on them are not.

## Lens 2 · Tempo and waiting

**Taps.** Build 3 (MOVE, who, where), answer 2, finish 1 or 2, shot 2 (SHOOT, then the answer), cards 1 each. Seven to eleven, as the concept says, with one correction: the defender's chip preview needs a tap on a phone, so the answer is 3, not 2, and the range is 8 to 12. Shipped today is 16 to 20. So this is about half. But the honest baseline is not shipped-as-is: the owner already removed the every-possession play pick by ruling, and that pick was 2 of the shipped taps. Against shipped-minus-the-pick (tap every off-ball player, done, slide, action: about 14 to 18), the saving is 4 to 8 taps, not 9 to 11. Still a real saving, and every tap left is a choice, not bookkeeping. That is the concept's best number.

**Seconds.** The concept says 25 to 35: build 6, hand-off 2, answer 5, hand-off 2, finish 4, shot card 8, result 3. I checked it beat by beat and it holds for a player who knows the game. For a first-time tester reading chips, the answer takes the full 8 and the build closer to 10, so 35 to 45. With a crossover card and a pass card both firing, add up to 30. Shipped is 45 to 75. Faster, yes, by roughly half in the common case.

**The 24 second clock.** Here the arithmetic exposes something. The offense's 24 runs only during the build (5 to 8 seconds) and the finish (3 to 5 seconds). That is 8 to 13 seconds of a 24 second clock. It cannot reach zero unless a player stalls. The owner asked for a clock that "jumps out at you as it gets lower" and a buzzer. Under this concept the buzzer fires roughly never, and the pulse from 5 down is decoration. The number is wrong for the beats it covers; the concept picked 24 because it is basketball, not because it fits. The defense's 8 has no source either; the shipped beat is 15, the research's unit is 15, and the 07-23 changelog gave the defense a 24 of its own on purpose ("it's chess, both sides get to think"). Cutting that to 8 without saying so is not honest checking.

**The 15 second question clock.** Fine. Every card is 15 and the beats do not overlap it.

**Waiting.** The offense waits 9 seconds a possession (two hand-offs and the answer). The defense waits the rest: build, then finish, then the shot card. Common case 20 to 25 seconds. The concept claims "19 at the worst". Wrong. Worst case is build 8, crossover card 15, hand-off 2 before the defense's beat (25 seconds), then finish 5, pass card 15, shot card 17 after it (37 seconds). The concept's own beats produce a 37 second wait it reports as 19. The online mitigation, showing the defender the same card read-only, is good and is the research's own advice, but it does not shorten the wait.

**Decisions.** Two for the offense, one for the defense, every possession. In a 24 possession game each side defends 12 times, so each side's defensive game is twelve 8-second puzzles: about 96 seconds of agency across a 14 minute game. The owner said chess; in chess both sides move the same number of times. This is two to one by decision and about four to one by time. It will feel like the offense's game with a defensive interruption.

**Over 24 possessions.** About 35 seconds each, so 12 to 16 minutes with cards. Shipped is roughly double. Race to 11: 20 to 24 possessions, about the same length. Both fine.

**Shared phone.** The phone passes three times a possession (offense to defense, back, then at the flip). Shipped passes it three or four times too, so no worse. But the 8 second answer clock starting at the slam is brutal on a passed phone; either it starts on the first touch or it is 15.

**Online.** Clean. The replay-then-slam ritual works better here than on a shared phone because nobody has to hand anything over.

Faster and less tedious, or just different: faster, and fewer dead taps. But the sameness is the new tedium risk. Every possession is the identical three beats of identical length; the concept lists that itself. And the defender does nothing for three quarters of every possession.

**Score: 6 out of 10.** Real savings, two numbers reported wrong (longest wait, and the 24 that never bites), two clocks chosen by feel.

## Lens 3 · Rules and research

**Question gates on shots and crossovers.** Kept whole. Pass through traffic kept. Good.

**The tile sets the price.** Kept, and the contested shot is priced one tier harder on the chip. That is the graduated price the owner asked for on 08-02. But the concept then retires the block card, the release meter and the sudden-death rebound cards, and it says the owner's 08-02 correction "asked for a graduated price; this is that price with nothing else". That is half a quote. The 08-02 ruling, in the findings file, says "keep blocks exactly as they are; make the PRICE graduated". Both halves. The release meter is locked in section 3b (07-27) with the words "the block card is the defense's whole counterplay on contested looks". The concept removes the defense's whole counterplay and cites the owner as support for it. The reasoning behind the removal is actually sound: the block card is a prompt to the defender inside the offense's shot beat, which is the one thing the research says every game bled on. So this is a real rule collision, and I think the concept's side is the stronger one. But it is the owner's to rule, out loud, and the concept must stop presenting his 08-02 words as already having ruled it. Should the rule or the concept give: the rule, probably, but only after he rules, and only if the defense gets something back (see the pass problem below), because the concept takes the defense's card away and gives it a beat the offense can play around.

**Every defender guards eight tiles.** Kept exactly and used well; the chips are what make it visible.

**Closed lanes.** Kept for movement. For passes the concept says "kept" but the shipped rule prices a pass through traffic; refusing a pass line through two defenders' tiles is a new rule, stated as a keep. Small, but the concept has a "said out loud" habit it did not apply here.

**The 24 second clock.** DESIGN.md section 3 says "a :24 shot clock per turn" and the 07-23 changelog gave the defense its own 24. The concept makes it the offense's possession clock, held during the defense's 8. The per-turn reading can give; the owner asked for one clock. The 8 cannot stand unexamined. See Lens 2.

**Plays picked once, offense-only timeouts.** Kept. The automatic inbound (ball live in the named receiver's hands at the whistle) is a rule change said out loud with a reason, and the fallback (PASS from the inbounder as the first build) is offered. Handled properly.

**Live-ball continuation.** The concept says "kept and made the rhythm's reward". It is broken, and this is the biggest thing wrong with the concept. Walk it: Showtime is defending at Town's basket. Thompson misses. Green, Showtime's center, is nearest the rim and boards it. Live ball, no snap. All ten players are standing in Town's front court, 10 to 14 tiles from Showtime's basket. Showtime's build is one move (Green has range 1) or one pass (to a teammate who is also in the wrong half). Showtime's finish is "shoot from where the ball is, or pass once to a man who shoots from where he stands". No Showtime player can be closer than about ten tiles from his rim. So every defensive rebound, every steal, every deflection and every shot-clock turnover produces a shot from behind half court, a tile the price table does not even define. The same is true of the wrong-answer turnovers at beats 2b and 6b, which the concept sends "live" to beat 8. I have not measured the miss rate, but with hard questions on every three, something like half the possessions in a game start live, and the concept has no possession for them. This is not a tuning issue. A two-beat possession cannot cross the floor, and a live ball starts at the wrong end by definition. The fix is a transition rule (extra builds until the ball crosses half court, or an automatic advance that contradicts the no-snap rule), and either fix breaks the one-line promise that every possession is three words. The rule should stay; the concept must give.

**Research verdicts.**
- No mid-beat prompts: honored, and extended by removing the block card. The defender is never asked anything during the offense's beats.
- One informed, last-moving, small defensive answer reads fair: half honored. The move is one defender, after seeing the build, which is the research's shape. But it is not last-moving. The offense's last decision is the pass in the finish, and the defense makes its move before it knows who will shoot. With five shooters wearing five prices and one defender able to change one or two of them, the offense will always find the chip the defense did not touch. The concept argues the pass "moves the ball, not the men", so the defense had all the information. It had the prices, not the target. This is exactly the owner's worry in a different verb: he said move-then-shoot gives the defense no chance to respond, and this concept gives it pass-then-shoot with no chance to respond. It is the same open item the scout found sitting since 08-02 ("if the final action is a PASS, does the defense get a beat before the catch-and-shoot?"), and the concept answers it "no" without saying it is answering it. The concept's own weakness list admits the defense may feel thin. It will.
- The size of the answer: the research said "one defender, 1 to 2 squares, is right-sized" under a 15 second beat. The concept gives full role range (a point guard slides 3) under an 8 second beat. Bigger move, less time. Not fatal, but it is the opposite of what the research sized.
- Several small reaction windows are unbearable: avoided; there is exactly one.
- Safe moves first, then the gamble: honored, and it is the spine of the design.

**Does it quietly reintroduce tap-every-player?** No. One move a beat, clearly. What it introduces instead is read-every-player: the defender has to read five chips in 8 seconds. That is the mental version of the same cost, but it is not taps, and the chips are information the research wants on the board. Not a reintroduction.

**Score: 4 out of 10.** The gates, guarding, plays and timeouts are all kept correctly, and the safe-then-gamble shape is right. But one locked rule is broken by structure (live ball), one locked mechanic is removed under a half quote of the owner, and the defense moves before the offense's real last decision.

## The owner's doubt

**Yes, with one thing he should hear first.** His doubt was: offense moves, defense moves, offense shoots or passes, "and then the offense goes again to start it over?" This concept answers the "start it over" part flatly: no, never. Build, answer, finish, and the finish always ends the possession. Three words in a fixed order, and a player only needs to learn that the shot is the third thing. That is digestible, and it is the cleanest answer in this panel to the confusion he named.

The thing he should hear: it answers the confusion by removing the back-and-forth. He also said "that goes back and forth until there's a flip of possession" and "that part needs to be more like chess". This is not back and forth. It is one move each and a shot. If what he wants is the rhythm of chess, this concept gives him the clarity of a set play instead. Those are different things and he should choose on purpose.

## Flaws

1. **Live-ball possessions cannot reach the front court.** Fatal as written. After every defensive rebound, steal, deflection and buzzer, all ten players are at the wrong end and a two-beat possession cannot cross the floor. Fix: a transition rule (the build repeats, one move or pass a beat, with no defensive answer, until the ball crosses half court; or a fast-break snap that the concept must then admit contradicts "no snap"). Either fix means the three-word promise holds only after made baskets, and the pitch line must say so.

2. **The defense moves before the offense's last decision.** Serious. The answer is made against five prices, then the offense passes to the one it did not lower. Fix: make the finish shoot-only and the pass a build verb, so the defense always answers the actual shooter; or give the defense a one-tile closeout toward the receiver after a pass (the owner's own 08-02 instinct). The first fix costs the second pass; the second adds a beat.

3. **The block card, meter and rebound cards are retired on a half quote.** Serious. The 08-02 ruling says keep blocks exactly as they are AND make the price graduated; section 3b locks the meter. The concept's reasoning (the card is a mid-beat prompt) is good and should be put to the owner as a ruling, not as something he already said.

4. **"YOUR ANSWER" is the wrong word.** Serious for a first-timer, trivial to fix. In a game where every shot is an answered question, the defensive beat cannot be called the answer. Call it RESPOND, or COVER, or YOUR MOVE.

5. **Hover does not exist on a phone.** Serious for the numbers, easy to fix. The chip preview needs tap-to-preview then tap-to-confirm; the answer is 3 taps and the numbers section should say so.

6. **The 8 second defensive clock has no source and starts too early on a shared phone.** Serious. The research's unit is 15, the shipped unit is 15, the 07-23 rule gave the defense 24. Fix: 15, or 12 starting on first touch, and say what happens at zero (STAY, presumably; the concept does not say).

7. **The 24 second clock never reaches zero.** Minor in play, serious against the owner's ask. The offense uses 8 to 13 seconds of it. Fix: either the clock runs through the defense's beat too (one clock, one number, which is what he asked for), or it is a 14.

8. **"Longest wait 19 seconds" is wrong.** Minor as a number, serious as a habit. The concept's own beats produce 37 with both cards. Report the real worst case.

9. **The dim SHOOT button is tappable.** Minor, and the concept already suspects it. Fix: either it is a real lit button reading SHOOT NOW · skip move, or it is not tappable.

10. **The chips read as opponent labels, not as my prices.** Minor once learned, but it is the whole puzzle. Fix: a one-time coach line on first defense ("each number is the shot he can take right now"), or chips only on the ball handler plus anyone he can pass to cleanly, which also cuts the reading load.

11. **The pass closure is a new rule presented as a keep.** Minor. Say it out loud like the others.

12. **The same three beats every possession.** Minor now, possibly serious after twenty possessions. The concept names it. The transition rule from flaw 1 will, ironically, add the variety.

## Strengths

Only what the beat table shows.

- **The verb row never changes.** MOVE · PASS · SHOOT in every offensive beat, with the lit ones telling you where you are (beats 2 and 6). This is the owner's Pokemon row done right, and the instruction lives in the button label, not in a second line of text.
- **The price is on the button** (beat 6: "SHOOT · 3 · VERY HARD"). The player sees the cost at the exact place he is about to pay it.
- **The hand-off is four signals in two seconds** (beats 3 and 5): replay with both tiles lit, one announcer line, full-width slam in the new colour with a sound, clock changes colour and number. A tester cannot miss it, and the same ritual with a horn marks a change of possession (beat 8).
- **The finish always ends the possession** (beat 8). No loop, no "am I going again". This is the direct answer to the owner's doubt.
- **The defense's beat is a real puzzle with everything visible** (beat 4): five prices, one move, and the chips are the telegraph the research wanted painted on the board rather than in a box.
- **Safe move, then the gamble, and a wrong answer ends everything** (beats 2, 2b, 6b, 7). The research's strongest finding, built into the order of the beats.
- **The waiting player watches the same card** (beat 7, online). The research's own advice for the disengaged defender, with nothing to tap.
- **No zoom during a decision** (stated for beats 2, 4 and 6). The owner's "you can't even access another player to pass to" complaint is answered by rule.

## Verdict

**REPAIR.** The skeleton is the best answer to the owner's doubt on the table: three beats, fixed order, the shot always last, the possession always over, one verb row and a hand-off nobody can miss. Keep all of that. But the concept does not survive its first missed shot, because a two-beat possession cannot get a live ball from one end of the floor to the other, and that is roughly half the possessions in a game; it needs a transition rule and an honest pitch line that says the three words hold after a made basket. Then move the pass in front of the defense's beat (or give the defense a closeout after it), so the one informed move is actually the last one, which is the whole reason the research called that shape fair. Rename the defensive beat so it does not share a word with the trivia cards. Put the block-card removal to the owner as a ruling with the real 08-02 quote beside it, not as his decision already made. Replace hover with tap-and-confirm, replace the 8 with a sourced number and a stated zero rule, and recompute the longest wait from the concept's own table. With those repairs this is the one to draw next. Without the first two it is a clean possession that only works after the other team scores.

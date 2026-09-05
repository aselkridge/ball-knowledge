# Critique: The Play Runs Itself

Judged against brief.md, scout.md and the shipped code. Where I checked the repo, I say so. Where I did not, I say "not checked".

## Lens 1 · The first-time player

I am on a 390 pixel phone, no coach, never read a rulebook, and I walk the eleven beats.

**Beat 1, Inbound.** Wilson is lit, two teammates glow, the header says "Wilson, your call", the clock is in my colour. I know it is my turn. I know what to do because there is one slot, PASS. Then the table says the one tap is on Curry, not on the slot. So do I tap PASS or tap Curry? Beat 6 says a pass is two taps, slot then man. Beat 1 says one. First confusion: two grammars for the same act on the first possession. Also "Your ball" in the announcer line: on a shared phone, whose "your"? I do not yet know which colour is mine; nothing in the table teaches it.

**Beat 2, Bring it up.** Nothing to do, the camera follows the ball, the shot clock starts. Clear enough, but a first-timer sees a clock running with no buttons and taps the screen anyway. Minor, and the concept's own "nothing else on screen" rule makes an accidental tap harmless.

**Beat 3, Read 1.** Curry is ringed and coned, the header names him, the clock is my colour and running. I know it is my turn. Four slots, two by two, each about 180 pixels wide. "Three · hard · 3 · Holiday on you" is 31 characters; at a readable size that wraps to two lines. Four wrapped slots, a header, an announcer line, a big clock and a timeout chip: dense, but it fits. What I do not know: what "RUN IT" means. "Jokic comes to screen" tells a basketball player that a screen is coming, but not that the whole team is about to move on its own while I watch. Second confusion, and it lasts until beat 5 shows me. Greyed DRIVE with "lane is packed" is good: it tells me why in three words.

**Beat 4, Help 1.** The floor light swings to their colour with a tick, Curry wears a red ring, defenders glow with dotted paths, one button says HOLD. On my own phone online, or on the shared phone after I pass it, the header reads "Their move. Who steps up?" I am the defender. "Their" is not me. Third confusion, and it repeats on every defensive beat: the whole table is written from the offense's phone, and the defense's phone is never described. Then the ask itself: step toward where Curry "would land" before Curry has moved, because the segment has not played yet. I am guessing at an animation I have not seen, with a 5 second clock. Fourth confusion. The dotted path helps, but I do not know yet that it is a prediction.

**Beat 5, Segment.** Pieces move, the announcer says what happened. Clear. Watching is fine.

**Beat 6, Read 2.** Curry lit, camera "tightens to the key but keeps both corners in frame". I tap PASS, then I tap Ionescu in the corner. On a 3D court at phone width a corner figurine is a small target near the edge of the screen, and the owner's exact complaint on 09-05 was a zoom that hid the pass target. The concept promises the frame holds the corners and admits in its weaknesses that it has not proven it. Fifth confusion, conditional on the frame; the concept knows.

**Beat 7, Help 2.** Same as beat 4, but now the pass is in the air and two defenders glow. This one is clear: the ball is going to Ionescu, Brown can reach her, tap Brown. The best defensive beat in the table.

**Beat 8, Read 3.** Ionescu lit, the light swings back with a tick. Slots make sense. RUN IT is greyed but reads "play is done · RESET · 3 sec". A greyed button that carries a live instruction: is it tappable? Sixth confusion. The concept lists it as open question 6, so it knows.

**Beat 9, The question.** The card owns the screen, 15 in my colour. Shipped behaviour, clear.

**Beat 10, The contest.** Brown's block card in their colour. I know it is not my turn because the colour changed. I do not know why the defense gets a card if I answered right, but the shipped game already does this and a first-timer learns it once.

**Beat 11, Splash, flip.** Buzzer, full-screen "THEIR BALL", the light swings and stays. The change of possession is unmistakable. On a shared phone "THEIR" is again a pronoun without an owner, but the buzzer and the stamp are loud enough that the two humans work it out.

**Count:** six moments of confusion, at beats 1, 3, 4 (two), 6 and 8. Two are wording (the pronouns, the greyed RESET), one is grammar (tap the slot or tap the man), one is a real design hole (the defender is asked to react to a move that has not happened), one is conditional on the camera.

**Is the hand-off visible without reading?** Yes, and this is the concept's best work. One clock, top right, in the colour of the side on the clock; the sideline light swings with a tick; one player is lit and it is always the ball. A player who reads nothing still sees the colour change. The one thing it depends on is knowing your colour, which the table never teaches; that is one line at the jump ball.

**Score: 7 out of 10.** The turn signal is clearer than anything shipped. The points come off for the defense's phone never being described, for the half-blind help beat, and for two grammars for a pass.

## Lens 2 · Tempo and waiting

**The concept's own numbers, checked against its own table.** The seconds column sums to 45 (3+3+4+3+2+5+3+3+8+8+3). That 45 includes an 8 second block card at beat 10, yet the Numbers section says "about 45, fifty-five with a block card". The table is the honest one: 45 with the card, 37 without. The taps column sums to 9 (offense 6 including the question, defense 3 including the block card); the Numbers section says "about 11". Both errors run in the concept's favour, so it is undercounting its own speed, but the seconds column assumes a read takes 3 to 5 seconds, and the concept itself admits a first-timer "thinks for eight seconds a read".

**At first-timer speed.** Three reads at 8 seconds is 24 seconds on its own. Add the flat 4 for the bring-up and 5 for the two segments, and the shot clock is at zero before the third read opens. Under the concept's real-time 24, the first possession a new player ever plays ends in a violation. The concept calls this "tuneable"; it is not a tuning problem, it is the clock rule burning while the player thinks.

**Hand-offs.** From the table: offense to defense after beat 3, back after 4, over after 6, back after 7, over after 9 for the block card, and the flip after 10. Six hand-offs per possession. The shipped game has about four (defense setup pick, offense pick, free moves to slide, slide to action, plus the contest). So the concept adds hand-offs while removing taps.

**Hot seat, one phone.** Six passes of the phone in 45 seconds is one every seven seconds. Each defensive beat gives the receiver 5 seconds. Physically taking a phone, finding your bearings on a 3D court and choosing a defender takes two to three seconds before any thinking. The concept's open question 5 admits it has not decided when the 5 starts. The only workable answer is a "pass the phone" card that starts the clock on a tap, which is four more taps and four to six more seconds per possession: 13 to 15 taps, about 50 seconds. That is inside today's range (16 to 20 taps, 45 to 75 seconds), not below it. Hot seat is a wash on taps and worse on how often the phone moves.

**Online, two phones.** Six hand-offs each need a round trip. A one second lag eats a fifth of every 5 second defensive window. Not fatal, but the 5 was drawn for a phone with no lag. Both phones must watch every segment (no skip, the concept says so), which is 5 to 8 seconds of shared watching a possession.

**Who sits idle, and how long.** The defender waits through the bring-up (3), the reads (12 at expert speed, 24 or more at first-timer speed), the segments (5) and the question (8 to 15): roughly 28 of 45 seconds, but never more than one read at a stretch and always with a job coming in under ten seconds. The offense waits through three help beats (9) and the block card (8): 17 seconds. That spread is better than today, where the defense sits through four free moves and a whole action before it touches anything.

**The clocks against the beats.** The 15 second question clock fits (beats 9 and 10 use 8 of it). The 24 freezes during help beats and cards, which is consistent through the table (20, 16, 14, 9). The bring-up costs 3 in the table and "a flat four" in the text; small, but the concept should pick one.

**Over a game.** 24 possessions at 45 seconds is 18 minutes; at first-timer speed nearer 60 seconds and 24 minutes, with violations. A race to 11 is 10 to 14 possessions, 8 to 12 minutes. Both are playable lengths.

**Faster and less tedious, or just different?** Online, taps drop by about half and the offense's chores are gone; that is real. Seconds do not drop: the concept lands at the fast end of today's range because it spends the saved time on watching and on four defensive beats. For the defense it is a new shape, four short "who steps up" windows with 5 seconds each, and HOLD is a tap to do nothing, four times a possession. That is the DONE button the owner hated, moved to the other side of the table and renamed. Whether four 5 second windows feel brisk or feel like being poked is exactly the thing the research warned about and nobody has tested.

**Score: 6 out of 10.** Half the taps online is a real win. Same seconds, more hand-offs, hot seat unresolved, and a clock rule that fouls the first-timer.

## Lens 3 · Rules and research

**Question gates on shots and crossovers.** Kept. SHOOT asks the tile's card, DRIVE past a man asks the crossover card, PASS through a body asks the pass card. I checked the slot labels against the shipped code: "Corner three · medium · 3", "Mid-range · medium · 2" and "Three · hard · 3" are the engine's own strings (game.js, the zone function near line 1546), and the block card and priced pass both exist in the shipped card types. The row prints what the card will ask. Good.

**The tile sets the price.** Kept in letter, lost in spirit. The offense never chooses a tile. The play's author decides where Curry comes off the screen, so the author sets the price and the player picks from what he is handed. The owner's law is "movement is movement, the cards are the price". This concept has no offensive movement by the human at all: not the ball handler, not a teammate. The concept's rule change 1 says "The owner already said this on 09-05". He did not. His words: "movement of the person with the ball or somebody off the ball is free, so we're still keeping that as free. They can still move and then pass." He cut everybody-moves-every-time and kept one free move. The concept cuts the free move too and cites him for it. The concept should give here, not the rule.

**Eight-tile guarding and closed lanes.** Kept as pricing rules, and DRIVE greys with "two men in the lane". But since the human moves nobody on offense, these rules are now the play author's problem between reads and the player's only at DRIVE. Not broken, thinned.

**The 24 second clock.** Changed, out loud: one real-time 24 per possession that runs during reads and segments, freezes during help beats and cards. The file says 24 per turn. Which should give? The rule, on "one clock per possession": it matches the owner's ask for one big clock with a buzzer and it stops the defense stalling. The concept, on "real time while thinking": see Lens 2. Fix: the 24 spends in fixed costs (a read costs a flat amount when the tap lands, a segment costs its length), so thinking time is bounded by a separate short read clock and never by the possession.

**Plays picked once, offense-only timeouts.** Kept and built on; the timeout chip is right. Two quiet growths: the table's coverage is PACK THE PAINT, which is not one of the three the owner picked (MAN, 2-3 ZONE, BOX-AND-ONE), and the concept needs six coverages written as shadowing rules plus eight plays with three authored reads each. The lists were chosen at three and three; the concept should start there and say so.

**Live-ball continuation.** Kept in words, undefined in play. After a steal the new offense gets "two freelance reads" before the play flows. The four slots in a freelance read are never stated. If RUN IT is greyed because no play is running, the fast break offers SHOOT, DRIVE, PASS and no way to run the floor. A steal at the far end with no play to run and no MOVE is a stall dressed as a break.

**No mid-beat prompts to the defender.** Two breaks. Beat 4 asks the defender to step before the RUN IT segment plays: the offense has declared an action that has not resolved, and the defender reacts to a dotted prediction. That is half of the blind pre-commitment the research rejected. Beat 7 asks for a closeout while the pass is in the air; that is the pass-then-shoot beat the owner left open on 08-02, and the concept decides it ("the defense always gets a closeout") without saying it is deciding an open ruling. The second one I would keep; it is a good spec for the open item. The first should go.

**One informed, last-moving, small defensive answer reads fair.** Matched. One defender, one step, after seeing the offense's tap, with full information. This is the research's approved shape and the concept names its source honestly.

**Several small reaction windows read as unbearable.** Broken, and not declared. The concept gives the defense three to five windows a possession. The scout says the sourcing behind that warning is thin, so the concept may overrule it, but it must say so out loud; it says nothing, and its rule-change list names the auto-defense warning instead. This is the one research verdict aimed squarely at this concept's shape.

**Safe moves first, then the gamble.** Matched: the play is the safe part, the shot ends it, a failed drive or pass ends the possession.

**Does it quietly reintroduce tap-every-player?** No. The offense taps no figurine except a pass target. But it moves a smaller chore across the table: the defense taps one defender, or HOLD, after every offensive beat, three to five times a possession. HOLD in particular is a mandatory tap that changes nothing. That is the same family as click, move, click, move, at a quarter of the volume.

**The auto-moving defense.** The concept flags it, and its answer (an honest coarse telegraph plus one human step) is the pair the research approved. The gap is that beat 5 just plays: nothing in the table shows the coverage's coming shadow move drawn on the floor before the segment, which is the "honest telegraph" half of the answer.

**Two things done right that the rules asked for.** The turn tray retires and the concept says so, naming that the owner loved it. The dead-ball setup ritual leaves the possession, which the owner decided. Both are stated plainly.

**Score: 5 out of 10.** The gates and the fair-defense shape are right and verified against the code. The concept misquotes the owner on movement, overrules the "several windows" warning silently, leaves the fast break undefined, and asks the defender to react before the offense's action resolves.

## The owner's doubt

Does this answer "the offense picks a player and moves them, then the defense picks a player and moves them, and then the offense chooses to shoot or pass, and then again... that feels confusing"?

**Yes, and it is the cleanest answer available, but it earns the clarity by deleting the thing he said to keep.** Nobody on offense ever picks a player to move, so the confusing loop cannot happen. Every offensive turn is one question, what do you do with the ball, and every defensive turn is one question, who steps up. Two questions, same order, all possession long, with one lit player and one coloured clock. A first-timer has the rhythm after one possession; the table shows it. But he said "movement of the person with the ball or somebody off the ball is free, so we're still keeping that as free. They can still move and then pass." This concept has no free move. It answers his doubt about the loop by removing his loop. If he wants to move a piece of his own at any point in a possession, the concept as written does not apply to that game.

## Flaws

1. **Removes all offensive movement and cites the owner for it.** Serious. He kept one free move; the concept cuts it and says he asked. Fix: add MOVE as a read option (the ball handler or one teammate, free, one to three tiles by role, no card); the defense's step follows it; the play resumes from where the mover stands. The screen survives unchanged.
2. **Three to five defensive windows a possession, against the research's warning, without saying so.** Serious. Fix: the defense steps only when the ball moves (a pass lands, a drive lands), never after RUN IT and never mid-pass; two or three windows a possession. State the overrule out loud and name the thin sourcing.
3. **The help beat after RUN IT fires before the action resolves.** Serious. The defender reacts to a dotted guess. Fix: covered by flaw 2; the segment plays, then the defense steps at the read.
4. **HOLD is a required tap to do nothing.** Minor online, serious in hot seat. Fix: the window auto-holds at zero, and the window only opens when at least one defender can reach the ball.
5. **The real-time 24 fouls the first-timer on possession one.** Serious. Fix: fixed costs per read and per segment; a separate short read clock bounds thinking.
6. **Six hand-offs a possession on a shared phone with a 5 second window.** Serious for hot seat, admitted as open. Fix: a "pass the phone" card that starts the clock on tap, and the tap and second counts rewritten with it.
7. **Every header and stamp is written from the offense's phone.** Serious. "Their move" on the defender's phone; "THEIR BALL" on a shared phone. Fix: the phone in hand always names the team ("Storm, who steps up?", "STORM BALL"), never a pronoun; teach each side's colour once at the jump ball.
8. **Two grammars for a pass.** Minor. Beat 1 is one tap on the man; beat 6 is slot then man. Fix: slot then man, always.
9. **A greyed slot that carries a live instruction.** Minor. Fix: greyed means dead; RESET is a live slot or absent.
10. **Freelance reads undefined; no fast break.** Serious. Fix: freelance is the ball slots plus MOVE (flaw 1), or one authored two-read "run" play that starts from wherever the steal happened.
11. **Stale by the third possession.** Serious, admitted. One play a quarter means the defense knows every read. Fix: the defense's step is the variety, so make it matter more (a sent helper visibly leaves a man open at the next read, which the table already does once); and give each play one branch at its second read.
12. **Authoring load.** Serious as a schedule risk. Eight plays by three reads by four slots by a camera frame by a segment, plus six coverages as rules. Fix: build the three plays and three coverages already chosen, nine combinations, and prove the loop before writing a fourth.
13. **The coverage's shadow move is never drawn before it plays.** Minor. The research's approved pair needs the telegraph on the floor. Fix: a dotted shadow on the defenders who will move, shown during the read.
14. **The camera per read is promised, not proven.** Minor until measured. Fix: a screenshot of every authored frame at 390 pixels with every receiver tappable before any read ships.
15. **The concept's Numbers section disagrees with its own table.** Minor. 9 taps and 45 seconds with the block card in the table; "about 11" and "55 with a block card" in the text. Fix: report the table.
16. **"Defense first and visible" listed as an open question.** Minor. The research answered it and the owner's own file locks it. Fix: state it as the rule.
17. **The table uses a coverage that is not on the chosen list.** Minor. Fix: use the three the owner picked.

## Strengths

- One lit player, and it is always the ball (beats 3, 6, 8). The question "who is the game asking about" never comes up.
- The clock is the turn (every beat's clock changes colour with the side, and beat 11 makes the flip louder than a hand-off). The hand-off works without reading a word.
- Fixed four slots in fixed places with the engine's own price strings (beats 3, 6, 8; checked against game.js). The row cannot promise a price the card will not ask.
- The defense's beat is one line and one tap, after seeing the offense's choice (beats 4, 7). That is the shape the research called fair.
- The announcer speaks in the past tense (beats 4, 7, 8). A player who looks up late learns what happened and that it is now on him.
- A greyed slot says why in three words (beat 3, "lane is packed").
- Pass then shoot gets a real spec (beats 7 and 8): the closeout step, then the shooter's price after it. The owner's open item from 08-02 finally has a candidate answer.
- Taps roughly halved online (9 in the table against 16 to 20 shipped), and the offense's chores are gone entirely.
- The concept names what it retires (the tray, the every-inbound ritual) and that the owner loved one of them.

## Verdict

**REPAIR.** The screen is the best answer on the table to "you never really know that a turn ended": one lit player, one coloured clock, four fixed slots, a past-tense announcer, and a louder stamp for a change of possession. Keep all of that. The game underneath it needs five repairs before it is the owner's game and not a different one: give the offense back one free MOVE per read, because he kept it and the concept says he did not; cut the defense's windows to the beats where the ball moves and say out loud that the research's "several windows" warning is being overruled on thin sourcing; drop the HOLD tap and the help beat that fires before the play runs; stop the 24 burning while a player thinks; and write every header and stamp from the phone in hand, with a hand-over card for hot seat and the numbers recounted with it. Ship it with the three plays and three coverages already chosen. If the owner reads "the offense never moves a player" and says no, the concept as written is dead, and its screen should be lifted onto whichever concept wins.

# Critique: Beat Your Man

Judged against brief.md, scout.md and the shipped rules. Where I checked the repo I say so; where I did not, I say "not checked."

## Lens 1 · The first-time player

I am a tester on a 390 pixel phone, no coach, no rulebook. I walk the nine beats.

**Beat 1, the flip.** A slam says CREAM CITY BALL, pieces glide, a row rises with "Curry has it" and three buttons. Do I know it is my turn? If I am on my own phone, yes: buttons exist. On one shared phone, the row tells me a player's name and a colour. It never says "you." A first-timer who does not yet know he is Cream City has to work that out from the colour of the row. Confusion moment 1 (shared phone only).

**Beat 2, the first move.** I tap MOVE. Tiles light in three kinds: green, orange with a tag reading "Crossover · Medium", dark. I can guess orange costs a question. Dark I cannot tell from "just not lit." Confusion moment 2: dark means closed, and nothing says so. Also, there is no way back described. If I tap MOVE and want PASS instead, the concept shows the other two buttons dimmed and no cancel. Confusion moment 3: a first-timer who taps the wrong verb is stuck until he taps a tile.

**Beat 3, the hand-off.** The row folds, a squeak plays, a ring shrinks on Green, a strip reads THE TOWN'S STEP. On my own phone this is clear without reading: my buttons went away. On a shared phone it is the weakest beat in the whole concept: the concept's own words are "the strip is the only thing that changes hands," and the eight second ring has already started before the phone has moved. Confusion moment 4, and a tempo problem too (see Lens 2).

**Beat 4, the defense's step.** Green is lit, the row reads HOLD · STEP · STEAL. Fine. But the concept also says "STEAL shows only because Green is on a tile next to the ball." A button that is sometimes there and sometimes not, with nothing explaining why, is exactly the kind of thing a first-timer reads as a bug. Confusion moment 5.

**Beat 6, help defense.** This is the beat where the first-timer is lost. The row says HOLD · STEP · STEAL. Nothing on screen says "you may tap a different defender." The concept's own beat table needs three taps here: tap the big man, tap STEP, tap a tile. The only way a first-timer discovers that other defenders can move is by accident. Every help rotation, every closeout choice, every read the defense is supposed to enjoy sits behind a tap the screen never offers. Confusion moment 6, and it is not at the edge, it is the middle of the defense's game.

**Beat 5, the wrong answer.** If I miss the crossover question, "the ball is loose, Green picks it up, the possession flips live and the table ends here." Ends here is a dodge. What does the screen do? The concept says the flip ritual is a slam, a horn and pieces gliding into shape, but a live flip has no glide and no snap, and the concept never describes the live version. The owner's exact complaint was "you never really know that a turn ended." The most common turn-ending event in this game (a wrong answer) is the one the table declines to draw. Confusion moment 7.

**Beat 9, the shot.** After a right answer on a contested shot, "the defender's contest card fires." On a shared phone that is: offense answers, phone passes to defense for their card, then the result. The phone changes hands inside a single beat. I checked: the contested-shot block card and the release meter are shipped law (DESIGN.md section 3b), so this is not new. But under this concept the defense has just had a beat, will have a beat, and now also gets a card inside the offense's beat. On a shared phone that is three passes in about fifteen seconds. Confusion moment 8.

**Beats 7 and 8.** The pass and the closeout read well: rings jump, the announcer names both players, the camera keeps both in frame. I know the ball changed players.

**Is the hand-off visible without reading?** On two phones, yes: the row rises or folds, and that is the one signal that never lies. On a shared phone, no: the strip is words, the rings are colour, and the concept admits it has nothing more (open question 7).

**Count: eight moments, two of them in the middle of play (help defense, the live flip).** The core grammar is honest and good: the same three verbs on every beat, and "my move, his step" is a sentence a tester could repeat after one possession. That is worth a lot. The gaps are all around it.

**Score: 6 / 10.**

## Lens 2 · Tempo and waiting

**The concept's own arithmetic, recounted from its table.** Taps: 0 + 2 + 0 + 2 + 3 + 3 + 2 + 2 + 2 = 16. The concept says offense 9, defense 7. Honest. Seconds, as written: 2 + 5 + 1 + 4 + 11 + 5 + 4 + 4 + 10 = 46. But the table charges 8 seconds a card (the clock is 15; a first-timer uses most of it), lists the one second hand-off once and then hides the other seven hand-offs inside the beats, and leaves the defender's contest card out of the seconds column entirely. Honest total for the possession drawn: about 46 + 7 hand-offs + 10 for the contest card = 60 to 65. The "45 to 70" claim is roughly right; the 45 end is optimistic. "Under 40 with no crossover and a clean look" is fair.

**Against what is shipped.** Today: 16 to 20 taps, 45 to 75 seconds, nearly all the taps on the offense's thumb. This concept: 16 taps, 45 to 70 seconds, split 9 and 7. So it is not faster. It is the same length of possession with the taps shared out and the waiting chopped into small pieces. That is the real gain and the concept should say it in those words instead of "the tempo of chess bullet play." Bullet chess is under a second a move. This is four to six seconds a beat with a one second ritual between beats. Call it a chess clock, not bullet.

**The longest wait is misreported.** The concept says 23 seconds worst case: "one card (15) plus one beat (8)." That is the offense's wait, because the defense beat is capped at 8. The defender's wait is the other way round: the shot clock counts only on the offense's beats, so the offense may sit on one beat for most of 24 seconds and then open a 15 second card. Worst case for the defender is about 39 seconds doing nothing, worse than the shipped free-moves phase at its longest. Typical wait around 10 seconds is plausible and is genuinely better than today.

**Over a game.** A 24 possession game at 55 to 65 seconds a possession is 22 to 26 minutes of possession play, before the play picks, the jump ball and the cards that time out. A race to 11 is roughly 8 to 12 possessions, so 8 to 12 minutes. Neither is shorter than today. What changes is the shape: 8 hand-offs a possession instead of 2 or 3. That is about 190 hand-offs in a 24 possession game.

**Hot seat, one phone.** This is where the concept breaks. Eight hand-offs a possession means the phone physically crosses the table eight times in a minute, at four to six second intervals, plus once more for the contest card. The defense's eight second ring starts ticking at the hand-off beat, before the second player has the phone in hand. Nobody tests this and then plays a second game. The concept's answer to the shared phone is one open question at the end of the file. That is not an answer.

**Online, two phones.** Each hand-off is a network round trip plus the one second ritual. Eight round trips a possession. An eight second defense window minus a second or two of delay is six seconds to read the floor and make two taps. Not checked against real latency; the concept does not raise it.

**The clocks.** The owner asked for one clock, big, top right, with a buzzer. The concept has three time pressures: the 24 in the corner (offense beats only), an 8 second ring on a defender (defense beats), and the 15 on every card. For half the beats the live clock is a ring on a piece, not the corner. The concept argues the corner number keeps one meaning, which is true, but "one clock" it is not. The 24 counting only on offense beats also means a possession can run over a minute of wall time while the "24 second clock" never reaches zero, which is fine as a design but should be said plainly. And the concept's own first weakness admits the opposite danger: with four or five offense beats sharing 24 seconds, a first-timer who thinks for six seconds a beat gets a shot clock violation before he ever shoots. Day one testers will hit the buzzer on their own possessions repeatedly. That is not the buzzer the owner asked for.

**Is it faster and less tedious, or just different?** For the offense on its own phone: less tedious, about half the taps, and never five players in a row. For the defense: more to do and shorter waits, which is good. In wall clock: the same. On a shared phone: much worse. The concept's numbers are mostly honest except the longest wait (wrong side) and the missing contest card.

**Score: 5 / 10.**

## Lens 3 · Rules and research

**The locked rules, one by one.**

- Question gates on shots and crossovers: kept as written. The steal is the shipped card duel. Fine.
- The tile sets the price: kept, and the SHOOT button reading its live price ("2 · Medium · CONTESTED") is a good use of it, though that is a lot of text on one of three buttons at 390 pixels.
- Every defender guards eight tiles: kept, and used well: it is what picks the man on the ball. The tie rule (last man on him, then nearer the rim) is proposed, not drawn. Needed before anything is built.
- Closed lanes: kept, shown dark. See Lens 1 for why dark alone is not enough.
- The 24 second clock: changed to offense beats only, and said out loud. But there is a second ruling the concept does not name: on 07-23 the defense got a 24 too, "it's chess, both sides get to think" (BUILD.md changelog, checked). This concept gives the defense 8. That may be the right number; it is still an unspoken reversal.
- Plays picked once, offense-only timeouts: kept and placed sensibly.
- Live-ball continuation: kept in words, undrawn on screen (see Lens 1, beat 5).
- The inbound: the concept makes it automatic with no taps and says "no inbound clock is needed because there is no inbound beat." I checked DESIGN.md section 8a: "the inbound gets a clock (240)" is RULED 09-05, from the owner's own words the same day ("you can sit inbounding the ball forever. That's not real."). The concept crosses a same-day ruling without naming it. It might be the right cut: an inbound that is played is one more beat, and the owner's complaint was the missing clock, not a love of the inbound. But the concept must say "this removes the inbound you asked to put a clock on" and let him rule. Should the rule give or the concept? The concept, unless he says otherwise: his ruling is eleven hours old and in his own voice.
- Move then pass: the owner's words are "movement of the person with the ball or somebody off the ball is free... They can still move and then pass. I don't know if they should be able to move and then shoot." His doubt is about move-then-shoot only; move-then-pass he explicitly kept. This concept's "one action per beat" kills move-then-pass too, and never says so. That is the biggest unspoken departure from the brief in the file. A ball handler who wants to drive and kick now spends two beats and gives the defense a step in between, which is a different game from the one he described.
- The free step draws no defensive slide (the August rule that shipped): reversed. Every offensive move, including an off-ball move, now draws a defensive step. The scout names this collision (its item 4) and notes the fear behind the old rule: "either the defence answers each shuffle and no possession ever ends, or it answers none." The concept bounds it with the offense-only 24, which is a real answer, but it never says the rule it is reversing.

**The research verdicts.**

- No mid-beat prompts to the defender, ever: the contest card on beat 9 is a prompt inside the offense's shot beat. The concept defends it by citing the other piece of research advice ("give the defender something to do inside the question beat"). Both pieces are on file and they collide; the concept picks one and does not say the other exists. Since the contest card is shipped law (section 3b), the concept is allowed to keep it, but it should own that under one-move turns the defender is no longer a bored spectator, so the reason for the inside-the-beat card has weakened, while the cost (a third phone pass in fifteen seconds on hot seat) has grown.
- One informed, last-moving, small defensive answer reads fair: the STEP is exactly this, and the concept names its source honestly.
- Several small reaction windows read as unbearable: this concept has three to four defensive windows per possession and the file never mentions the warning. The scout says those sources are snippet-level, so the concept may overrule them, but it must do it out loud. The honest defense is: these are not interrupts inside someone else's turn, they are whole turns with their own clock and buttons, which is the shape the research adopted (the counter-move between each enemy action), not the shape it rejected. The concept should make that argument instead of leaving it to the critic.
- Safe moves first, then the gamble, a failed gamble ends the turn: the last part is kept (a wrong crossover flips the ball). The first part is by choice, not structure: MOVE, PASS and SHOOT are all available on every beat, and the crossover gamble in the table is beat 5 of 9, not last. That matches Blood Bowl, which also does not force the order, so this is acceptable; the concept overclaims when it lists it under "borrowed from."
- One matchup per possession: kept and made visible (the rings and the line). The scout's caveat on that finding (thin source, one dissent, "take the spotlight idea and nothing else") is respected: the concept takes only the spotlight.

**Does it quietly reintroduce tap-every-player?** No. It goes the other way: the four off-ball men stand still unless the offense spends a whole beat and a defensive step on one of them, at three taps. In practice nobody will. The off-ball game the owner called "free" becomes a thing that costs a turn, and the July complaint "pieces just sit there" comes back by design. The concept admits this in its second weakness and offers the play running its own cuts as a bigger build. That is the right upgrade and it should be in the concept, not in the weaknesses.

**Score: 6 / 10.** Every rule is named and most are kept; the failures are four reversals not spoken (the inbound clock ruled that morning, move-then-pass, the defense's 24, the free-step rule) and one research warning not answered.

## The owner's doubt

**Yes, it answers it, and it is the strongest thing in the file.** His doubt was a three-part turn: offense moves, defense moves, offense shoots or passes, then start over. This concept has no three-part turn. Every offense beat is the same one question with the same three answers (MOVE, PASS, SHOOT), every defense beat is the same one question with the same three answers (HOLD, STEP, STEAL), shooting is one of the three and it ends the possession. "My move, his step, my move, his step, shoot" is a sentence a player can hold in his head, and the screen on beat 7 looks like the screen on beat 2. Nothing starts over because nothing was a sequence. That is a real answer to "is it easy to digest." What it does not answer is his other sentence, "they can still move and then pass," which the concept quietly overrules, and his "that movement should be zoomed in on," which the concept declines (for a good reason, the hidden pass targets) but resolves by rings and a glide rather than by anything he asked for.

## Flaws

1. **Hot seat is not designed.** Eight phone passes a possession at four to six second intervals, an eight second defense ring that starts before the phone moves, and a contest card that passes the phone a third time inside one beat. Severity: **fatal for the shared-phone mode as written**, serious for the concept as a whole since hot seat is one of the three ways to play. Fix: on one phone, the defense's beat waits for a tap on the strip ("THE TOWN: TAP TO STEP") before its ring starts; the ring runs only after the tap; and the contest card on hot seat becomes an automatic contest at the defender's rating, no pass. Better: the concept should ask whether hot seat under one-move turns wants the defense's step to be pre-set (a standing instruction like "shade left" chosen at the play pick) so the phone only crosses once a possession. That is a different concept and it should be drawn as an option.

2. **Help defense is undiscoverable.** The row never says "tap another defender." The whole defensive read (help, closeout, who leaves whom open) lives behind a tap the screen does not offer. Severity: **serious**. Fix: STEP opens a second small choice (the man on the ball lit first, every other defender tappable and marked with his reach), or the row becomes HOLD · STEP · HELP · STEAL with HELP lighting the other four defenders. Four buttons is still a Pokemon row.

3. **The live flip is not drawn.** A wrong crossover answer, a steal, or a defensive rebound is the most common way a turn ends and the table "ends here." Severity: **serious**, because it is exactly the owner's complaint ("you never really know that a turn ended"). Fix: draw the live flip as its own beat: the ball flies to the taker, both rings jump, a short slam in the new colour with no glide (STOLEN, THE TOWN BALL), the row rises for the new side, the corner clock resets to 24 in their colour. Small ritual for a beat, medium for a live flip, big for a dead ball.

4. **Move-then-pass is killed without saying so.** The owner kept it in words. Severity: **serious**. Fix: either say out loud "one action a beat means no move-then-pass either, and here is why the drive-and-kick still exists across two beats," or ration it the way Blood Bowl rations move-then-hit: one MOVE-AND-PASS a possession, drawn as a fourth button that greys out once used, with the defense's step still landing before any shot. Put it to him as the open question it is.

5. **The inbound clock ruled that morning is crossed silently.** Severity: **serious as a process matter, minor as a design matter**. Fix: name row 240 and DESIGN.md section 8a, say the automatic inbound removes the beat he wanted timed, and offer the press exception as the place the inbound returns.

6. **Longest wait misreported.** 23 seconds is the offense's wait; the defender's is up to 39. Severity: **minor** in honesty, serious in what it hides: the offense-beats-only clock lets a slow offense park. Fix: report both sides; consider a per-beat cap for the offense (say 12) inside the 24, so no single beat can eat the possession.

7. **Three timers, and the owner asked for one.** Corner 24, ring 8, card 15. Severity: **minor**, but it fights his exact words ("very clear, bright, top right"). Fix: the defense's 8 also runs in the corner, in their colour, with the ring as the echo on the piece, so the corner is always the clock and the ring only says which piece.

8. **The shot clock on day one.** 24 shared across four or five beats gives a first-timer about five seconds a decision. The concept's own first weakness admits violations will be common. Severity: **minor**, tunable. Fix: 30 by default for the first games, or the pass refill the concept already floats, chosen after a measured playtest and not before.

9. **Closed lanes as "dark".** Severity: **minor**. Fix: closed tiles get the shipped locked-lane mark (whatever the game already draws for a two-defender lane; the concept should reuse it, not invent dark).

10. **STEAL appears and disappears.** Severity: **minor**. Fix: always show it, greyed with "not close enough" when it cannot fire, so the row is always the same three (or four) buttons, which is the concept's own selling point.

11. **The contest card inside the shot beat.** Severity: **minor** on two phones, folds into flaw 1 on one phone. Fix as in flaw 1.

12. **Off-ball men stand still.** Severity: **minor now, serious after twenty possessions**. The upgrade (the picked play runs one scripted cut per exchange, drawn on the small board at the pick) belongs in the concept as a named option, not in its weaknesses.

## Strengths

- Beats 2, 4, 5, 7, 9: the same three-verb row for the offense on every beat, the same three for the defense. That is the clearest single answer to the owner's doubt in any shape I can imagine, and it is in the table, not in the prose.
- Beat 3: the fold-and-rise of the row as the one hand-off signal, with a sound per direction. On two phones this cannot be missed without reading.
- Beat 6: a beaten defender recovers one tile, so someone else must help, so someone is open, and the OPEN mark says so on the floor. The possession has a basketball story because of one small rule, and the table proves it.
- Beat 8: the closeout beat answers the owner's month-old question ("defense first before you can shoot, right?") by structure, not by a special case.
- Beat 7: SHOOT showing its live price and CONTESTED status on the button means the player never has to compute the tile.
- The last-move tint and the whole court always in view (stated in the table's screen assumptions) answer row 237 directly.
- The announcer line reports, the row instructs, nothing repeats: it obeys the "said once" ruling by design.

## Verdict

**REPAIR.** The heart of this concept, one action a beat with the same three verbs every time and one lit matchup, is the best answer on the table to "is it easy to digest," and it keeps every question gate, the eight-tile guarding, closed lanes, the once-picked play and live continuation without bending them. It should go to the owner. But not as written. It has to (1) design the shared-phone mode instead of leaving it as an open question, because eight phone passes a minute is not a game; (2) put help defense on the row so a first-timer can find it; (3) draw the live flip, since that is the exact moment the owner said he loses the thread; (4) say out loud the four rulings it reverses (move-then-pass, the inbound clock from that same morning, the defense's 24, the free step drawing no slide) and the one research warning it walks past (several small reaction windows), with its reasons, so he rules rather than discovers; and (5) fix its numbers: 16 taps and about a minute is the same cost as today shared out differently, not a faster game, and the longest wait belongs to the defender at nearly 40 seconds. With those five repairs it is a KEEP. Without the first three it will fail its first hot-seat test and the owner will read that as "the back-and-forth idea does not work," which would be the wrong lesson.

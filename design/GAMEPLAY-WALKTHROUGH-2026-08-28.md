# The gameplay walkthrough, his words, live capture

Row 103 absorbed the toss-up (198, 13) on his 08-28 ruling. Rather than an
option list built from a moment inventory, he chose to describe the whole
player walkthrough himself, screen by screen, ruling as he goes. **This doc
is that walkthrough, captured verbatim as he gives it.** Nothing here is
built until he says build it — this is the spec growing, not a proposal.

His protocol, stated 08-28: *"this is how we will work, step by step."* One
piece at a time; I confirm each before he gives the next.

---

## Stop 1 · the toss-up "How it works" card

**KEEP, redesign for digestibility.** His words: *"I don't mind this screen
but I want this screen to be designed so it's really easily digestible."*

Current copy (unchanged pending the redesign):
> **How it works**
> 1. A general ball-knowledge question is coming, same for both of you.
> 2. On 5·4·3·2·1 it pops up. Slap your buzzer the second you know it.
> 3. First to buzz answers. Right = you win THE CALL. Miss it and it's
>    your friend's.
> 🔔 this is your warm-up, the tip-off for the ball works the exact same way
>
> [ I'm ready → ]

Shows on **every** run (local + online), not just the first. Note for the
redesign pass: three bullets to read is what row 198 already asked to
replace ("a brief slideshow or sample toss up... not bullet points").

## Stop 2 · the coach offers a test run

**NEW.** Fires immediately after Stop 1, before the live toss-up starts.
His words: *"a popup from the coach that says something along the lines of
'you want to give this a test run first?!'"*

**Scope, his ruling: CPU and Local vs ONLY. Never online.** Consistent with
the standing law (coach.js `netOn()` gates, his 07-29 ruling reaffirmed
08-28: "the coach shouldn't exist online").

If yes → a sample toss-up walkthrough, Stop 3 below.

## Stop 3 · the sample toss-up, CONFIRMED

Nine beats, in order, his words throughout:

1. **The countdown gets explained before it runs.** The "5" appears,
   highlighted, everything else veiled. Coach: *"here's the countdown,
   ready to go?"* Player says yes. Only then does the real 5-4-3-2-1 play.

2. **The question card appears empty**, and as soon as it appears — not
   after anything else — **both buzzers appear immediately**: one top, one
   bottom. *"The bottom buzzer needs to be that person"* — bottom is always
   **you**: the player vs CPU, Player 1 in local vs.

3. **Coach explains the buzzers before the question types.** Both buzzers
   plus the card are highlighted, rest veiled: *"you've got two buzzers,
   the question's gonna type itself out here in the middle, when you know
   the answer hit your buzzer."*

4. **Then the question types itself out**, letter by letter, center of the
   card. **Scoped 08-28**: typing-out is for buzz-race moments ONLY (the
   toss-up, and the tip-off which "works the exact same way" per Stop 1's
   copy) — his words, *"nothing else is a timing competition so those can
   show up normally."* Every other question card keeps showing up as it
   does today. For the practice round the question is always the SAME
   question, always simple, agnostic to league (his example, "what does
   NBA stand for", named one league by accident — needs a real placeholder,
   e.g. "how many players are on the court for one team").

5. **Coach interrupts once typing finishes**: *"now's the time to buzz, hit
   the button if you know it."* Highlight narrows to just the buzzer,
   everything else veiled: *"go ahead and click here."*

6. **Player clicks the buzzer.** Answer choices appear.

7. **Coach highlights the correct answer** so the player can't miss it:
   *"now click the right answer."*

8. **Player clicks it, sees the toss-up result** ("you win the ball" or
   similar). Sample ends.

9. **Coach closes it out**: *"does that all make sense? ready for the real
   thing?"* Player says yes, or redoes the buzzer test.

**The one rule he settled mid-thought, confirmed**: if the first buzz
misses, the ball goes straight to the other side. No rebound question, no
second chance on the same question. Right → you get it. Wrong → they do.
**Verified against the shipped game**: `tuResolveAnswer` (game.js:6626)
already does exactly this — a miss calls `tuWin(otherSide)` directly, no
second question. The sample teaches the real rule, not a simplified one.

---

## The intro cinematic · tunnel to tip-off

His ask, before this walkthrough continues: a tunnel players walk out of
toward a bright light, a sky-to-court drop, a side-view close-up on center
court (one player each side, a ref between), straight into the confirmed
toss-up beats above, then the normal game start. A Skip control throughout.

**Medium ruling, his words**: *"source the art and you build the movement is
correct."* The hallway photo is his to buy or commission later; the camera
push, the drop, and the zoom are a build job on top of whatever art lands.

**Preview, built and verified 08-28**: a rough-pass demo proving the
movement technique with stand-in art (CSS/canvas rings for the tunnel, no
photo yet) — <https://claude.ai/code/artifact/569949f9-525e-4ac3-8289-5a27167a35fe>.

**His catch on the first pass**: the sky view cut to the side view. *"there
is no way to go directly from the sky to the side view of the players
without a skip? I know the court can rotate so I thought it was possible"*
— he's right; the shipped game's own camera is an RZ/RX perspective
projection, so a continuous tilt is natural. **Smooth version built and
republished same day**: the two flat scenes became ONE camera — the court
is a 3D plane whose tilt animates near-overhead to near side-on while the
zoom pushes in; the three figures are billboards counter-rotating every
frame so they stand upright the whole way down; the tunnel crossfades onto
the overhead court so even that seam reads as one move; the buzzer beats
then play OVER the landed side view (veil dims it, never a cut to black);
Skip lands on the same side view; the end card dims the court instead of
erasing it. Verified: zero page errors end to end, Skip lands correctly,
`prefers-reduced-motion` completes without hanging.
**Not proven yet**: the real hallway art, final coach copy, the real
question bank. This is technique only, nothing here ships as-is.

**The art prompts, delivered 08-31** on his ask (*"one prompt for each
entry art, so one for blacktop, one for hardwood, etc."*): one tunnel per
court family, Firefly-measured, home in `design/COURT-SKINS.md` § THE
ENTRANCE TUNNELS, copy-button page linked in PLACES.md. Row 215, blocked
on his generations. Classic stays code-drawn (CLEAN family identity),
flagged for his overrule.

---

## The ruling that gates everything after Stop 3

His words, 08-28: *"I want to build up to this point first and see if I am
happy with the results before we move forward to doing more."*

So the confirmed pieces — the coach's test-run offer (Stop 2) and the full
nine-beat sample toss-up (Stop 3), plus the typewriter reveal on buzz-race
questions — get built INTO the real game on the branch now, for him to play
and judge. The walkthrough pauses here; no new stops until he's played it.
The intro cinematic stays a demo until he sources the art. Stop 1's
digestibility redesign still owes its option round.

## BUILT 08-29, on the branch, waiting for his verdict

What plays now (local vs and CPU, never online):
- After Stop 1's "I'm ready" (local) or over the jumbotron (CPU), the
  coach offers: *"Want to give it a test run first? One practice round.
  Nothing counts."* Show me / I'm good.
- Yes runs all nine beats exactly as confirmed: countdown explained with
  the 5 lit and everything veiled, the real 5-4-3-2-1, the card popping
  up EMPTY with both buzzers the same instant (top the other side, bottom
  always YOU with the squad name), the coach teaching the buzz law and
  the miss rule, the question typing itself out at the live game's own
  pace, the handoff spotlight to the bottom buzzer, four answers with the
  right one lit and the only one live, the result, and "Does that all
  make sense?" with I'm ready / Run it again looping cleanly.
- The typewriter runs on the REAL toss-up and REAL tip-off reveals.
  Gate: `tools/sample-check.mjs`, 23 checks + 3 render guards, sabotage
  proven; the full 43-gate fleet green; an adversarial four-skeptic
  verification pass ran over the diff and its three real finds are fixed
  (the CPU offer self-abort that burned the key, the practice card not
  typing under the freeze, the reduce-motion online fairness hole).

**DECISIONS IN THE BUILD THAT ARE MINE, NOT HIS - flagged for his ruling:**
1. **The real buzzers still contradict the lesson.** The sample teaches
   bottom-is-you, but the live toss-up still renders its buzzers LEFT and
   RIGHT (row 13's open comparison), and the live tip-off's zones put YOU
   on TOP in a CPU game. His Stop 3 geometry probably settles both, but
   changing the live surfaces changes how the game looks, so they stay
   untouched until he picks (option round owed).
2. **Once per phone.** The offer shows once and burns a seen-key
   (Settings > Run the Coach again brings it back; an offer that folds
   because the world moved on hands the key back). He never ruled a
   frequency.
3. **The CPU placement.** No "How it works" card exists on the CPU road,
   so the offer rides the jumbotron window with the tip held frozen. My
   judgment, not his spec.
4. **"Run it again" replays all nine beats.** His words were "redo the
   buzzer test"; a shorter redo (skip the countdown lesson) is a fair
   other reading.
5. **Online keeps the whole-card reveal.** A typing race is only fair if
   both phones type; a reduce-motion phone would see the full question
   seconds early and win every toss-up. So online shows the question
   whole (exactly as shipped today) and the typewriter lives in CPU and
   local play. If he wants typing online, both phones would have to type
   regardless of the motion setting, which fights accessibility.

## RULED 08-31 · the five flags answered (three of five)

**Flag 1 · the buzzer geometry — RULED, his pick C with his correction.**
His words: *"For flag 1 I'd say C but also for VS it can't be left and
right because if we are racing on the same phone we would hold it top and
bottom the long way so each player can hit the button if needed. Left and
right wouldn't work. And the phone would have to respond to whoever hit
the button first. But other than that the bottom should always be the
player, ie. CPU and ONLINE."*

So the law: **every buzz race is stacked, never left/right.**
- CPU: bottom is you, top is the CPU.
- Online: bottom is you on your own phone (by NET role).
- Local VS: top and bottom, the phone held the long way between the two
  players, one buzzer each end; first tap wins.

The shipped tip-off is already stacked on phones and already
first-tap-wins; the toss-up's left/right row and the CPU tip-off's
you-on-top are what change. Renders owe the option round (row 13); the
open render questions include whether the top player's buzzer flips 180°
to face them in Local VS, and what desktop does.

**Flag 4 · "Run it again" — RULED.** *"Keep all nine, but introduce a
button that allows the player to skip out of the process if they feel
like they got it midway thru or if they restart in accident."* The skip
control is new build, filed as row 212.

**Flag 5 · online whole-card — RULED.** *"I agree for online whole
card."* Locked: the typewriter never races online; online shows the
question whole. Recorded in DESIGN.md.

**Flags 2 and 3 — pending.** He asked for a plainer explanation
(*"can you explain more plainly please or show me"*); shown 08-31 with
live captures of both offer moments and the Settings row. Awaiting his
call.

**The sequence, his words 08-31**: *"After the sample jump ball we should
see the video entrance to the players and ref and the actual jump ball
correct?"* — confirmed correct against this doc: offer and sample first,
then the tunnel-to-court entrance, then the REAL jump ball, whose
question types out over the cinematic's landed side view (exactly where
the demo plays its buzzer beats). The cinematic still waits on his
sourced art.

## RULED 08-31, second round · the buzz race gets one name, one look, one loud moment

**The name.** *"Jump ball, toss up and tip off, why are there so many
names, it needs to be one universal thing."* The counted truth: two real
moments wear three names — the opening race for THE CALL (the toss-up)
and the possession race, which is "Jump Ball!" on its own screen but
"the tip-off" in the coach's and Stop 1's copy. Row 213, blocked on his
pick of the winning name.

**The parity.** *"The practice run and the real jump ball look so
different and they shouldn't. I get it that the practice run has the
buzzers and card stacked so closely because of the coach so that's an
okay difference but the rest of the look should be the same."* Ruled:
one buzz-race look, practice and real, tight practice spacing excepted.
Folded into row 13's renders.

**The buzzers themselves.** *"I really want the buzzers to look like
raised buzzers that you hit and to have clear visual and audio displays
that show that the player who buzzed first did and not quietly so it's
confusing. I noticed that when the CPU wins the buzzer in the real game
it's almost confusing because you can barely tell what happens and it
just goes forward."* Defect confirmed in code (tipBuzz plays no sound at
all; a CPU win is an 11px grey line) and filed with the genre research
as row 214, riding row 13's option board.

## RULED 08-31, third round · flag 2 closed, the name picked, the board delivered

**Flag 2 — RULED, once-ever stays.** *"Okay flag 2 I agree with you."*
The offer shows once per phone, whatever the answer; Settings > Run the
Coach again is the one road back.

**The name — RULED.** *"Let's go with jump ball. And the toss up can
stay as it is."* The possession race is THE JUMP BALL in every
player-facing word; the toss-up keeps its name. Swept the same turn
(nine player-facing strings: the coach offer, the Stop 1 warm-up line,
the setup button, the VS chip, the handicap blurb, the three
won-the-tip lines); locked in DESIGN § 8a; trivia content and code
identifiers untouched.

**Flag 3 — still his.** *"I need to see this because I still don't
remember what you are talking about"* — shown 08-31 as a three-frame
strip of the CPU road (jumbotron alone · the offer riding it · the jump
ball proceeding). Awaiting his call: keep the jumbotron placement, or
give CPU games their own "How it works" card.

**The buzzer board — DELIVERED** (his ask: *"I need those side by side
renders for the buzzers... and I need to see that board of buzzer
options"*). Four forms on the real toss-up screen, one page load,
stacked per his law, each shown armed / buzzed / flipped:
<https://claude.ai/code/artifact/1953cc83-99b9-448c-be72-067e08312842>.
Awaiting his number.

## RULED 08-31, fourth round · the dome, the sandwich, the name confirmed

**The buzzer — RULED: option 2, the dome.** With the friend-match spec
in his words: *"for friends matches the opposing team buzzer should be
above the question as though the phone was held from two ends. Also the
question should show facing both directions and that's all that needs
to be on the screen."* So the friend race screen is a sandwich: flipped
dome above, the question rendered twice (one copy facing each end),
your dome below, nothing else. Sample rendered on the real toss-up and
sent same turn; the build waits on his confirm of that sample. CPU and
online wear the dome with you at the bottom.

**The name — questioned and settled.** *"I just want the terminology to
match real basketball."* Verified against the NBA's own rulebook: "jump
ball" IS the official term for the procedure that starts the game;
"tip-off" is the informal name for that same opening jump ball. His
pick already matches the rulebook; nothing re-swept.

**Flag 3 — rebuilt as the Two Roads explainer** after *"I really really
don't understand what the ask is here"*: both roads step by step in
real screenshots, the one difference highlighted, the jumbotron
explicitly NOT in question, and the ask reduced to A (offer stays on
the scoreboard pause) or B (CPU road gets its own How-it-works card
first): <https://claude.ai/code/artifact/51c4b455-889b-41a3-b487-15a06b230bd7>.

---

*Owner: row 103 (gameplay rebuild, toss-up absorbed). Stops 2 and 3 and
the buzz-race typewriter are BUILT and LIVE as of 08-30 (see § BUILT
08-29); everything else here is still description, not product. Flag
status after 08-31: 1, 2, 4, 5 ruled; 3 reduced to an A/B pick on the
Two Roads page. Rows in flight: 13+214 the dome build (awaiting his
sandwich-sample confirm), 212 the skip-out, 215 the tunnel art on his
generations; 213 (the name) SHIPPED 08-31 and re-verified against the
rulebook. Update this file the same turn each new piece is described;
do not fork a second copy.*

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
flagged for his overrule. **The art landed 09-03** (all 20 slots, four
models, both looks) and is boarded for his picks: row 215, the Tunnel
Round in PLACES.md.

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

## RULED 08-31, fifth round · the family, the names on screen, and the flows

**The sandwich spec liked** (*"I like the spec for the friend match
buzzers"*) with one addition ruled: **every race screen names its moment
on the screen itself** (*"it should say jump ball somewhere too
right?"*), the name facing both ends in a friend match. **The full
family mocked same turn** on his ask (all screens side by side,
practice runs included): toss-up friend / online / practice, jump ball
friend / online / CPU / practice, all wearing the dome:
<https://claude.ai/code/artifact/15f0790d-46c6-49e4-a038-f9650c4dc1a2>.

**A shipped naming bug found by walking his flow question**: the online
setup veil told the TOSS-UP winner's opponent they "won the tip" — the
wrong race's name, live in the product (game.js `startColorCall`), and
the 08-31 sweep had renamed it to "won the jump ball", compounding it.
FIXED this commit: "won the toss-up." Verdict: the exact confusion he
reported ("why are there so many names") existed in the shipped copy.

**The flows, verified from code and given to him** (his question marks
answered): the coach offers ONE practice per phone, attached to the
FIRST race a road meets. CPU road: setup → offer over the scoreboard
intro → practice jump ball → real jump ball → play. Friend road: names
→ How-it-works → offer → practice toss-up → real toss-up → THE CALL →
suit up → jump ball (no second practice) → play. Online: names →
How-it-works → real toss-up (no coach online, ever) → THE CALL → suit
up → jump ball → play.

## RULED 08-31, sixth round · three build specs off the family

1. **The bridge line lives in the toss-up practice only.** *"When the
   practice run shows up for the toss up practice in local mode, it
   should say something along the line of this is the same for toss up
   and jump ball, but only in the toss up practice run."* The jump ball
   practice (CPU road) carries no such line.
2. **One visual language for both races, and the toss-up's wins.** *"The
   visuals of the toss up and the jump ball need to match (I like the
   toss up version more)."* The jump ball takes the toss-up's dark
   question card and mono moment-tag; the graffiti "Jump Ball!" title
   yields to that treatment.
3. **The coach card must not overlap the bottom dome in the practice.**
   *"Yes we need to fix the coach overlapping the buzzer, we can adjust
   the text too if needed."*

## RULED 08-31, seventh round · flag 3 closed, and the dome build green-lit

**Flag 3 — RULED: B.** *"Yeah give the CPU version the card like everyone
else."* The CPU road's jump ball opens on its own How-it-works card (the
toss-up card's own object, jump-ball copy), and the coach's practice
offer rides its ready tap instead of the jumbotron window. All five
flags from § BUILT 08-29 are now ruled.

**The build — GO** (*"go ahead and build"*), built same turn: the dome
on both races per the whole accumulated spec (sandwich in friend
matches with the mirrored reading, you at the bottom in CPU and online,
the moment named on every screen, one card language with the toss-up's
winning, stacked on desktop too, the buzz theatre with its own buzzin
sting and held beat, the CPU's win played loud, the practice domes with
the coach card clearing them, the bridge line on the toss-up offer
only). Gate: tools/dome-check.mjs, both sabotages proven red.

## RULED 08-31/09-01, eighth round · two amendments on the shipped dome

*"Can you please still let the words toss up and jump ball be a bit
bigger? Also for widescreen or desktop it should be left right, with
main player on left side."* Both built the same turn: the moment tags
grew 11px to 15px, and at 700px and up every race runs left/right with
your dome on the left, nothing rotated, nothing mirrored (a desk has no
ends), A/L matching left/right. DESIGN 8a amended; dome-check grew five
wide checks and a third proven sabotage; the two date-bombed fixtures
the month's 1st exposed in daily-check were defused on the way.

**His online question, answered from the code**: the How-it-works card
is the waiting room. Each phone shows it; tapping I'M READY turns the
button into "Waiting for your friend…"; the host fires the shared
countdown only when BOTH readies are in (`tuMarkReady`, game.js), so
neither player can see the question early, and each phone times its own
reaction from its own reveal.

---

*Owner: row 103 (gameplay rebuild, toss-up absorbed). Stops 2 and 3 and
the buzz-race typewriter are BUILT and LIVE as of 08-30 (see § BUILT
08-29); everything else here is still description, not product. Flag
status after 08-31: 1, 2, 4, 5 ruled; 3 reduced to an A/B pick on the
Two Roads page. Rows in flight: 13+214 the dome build (family liked,
three specs added, awaiting his go), 212 the skip-out, 215 the tunnel
art on his generations; 213 (the name) SHIPPED 08-31, re-verified
against the rulebook, and its sweep corrected once (the toss-up netVeil
line). Update this file the same turn each new piece is described; do
not fork a second copy.*

## BUILT 09-04: the entrance, in the game

His ask this turn: *"Let me just see what you got with one of the hardwood
themes so I can visualize better. Build it and let me see it in game,
because I don't think you can show me the real thing via an artifact, am I
right?"* Right: the artifact is frames; the real thing is the branch
preview. Built for every family (the code reads the court the game is set
to), shown on Hardwood: How-it-works card, practice or its refusal, the
walk up the tunnel into light, the drop to centre court, the jump ball
countdown. Law in DESIGN 8a (THE ENTRANCE); changelog 09-04; frames at
<https://claude.ai/code/artifact/704c3a53-acd7-47a2-b7cc-25d8d073a773>.
His ruling on the mouth (*"even if all that was at the end of the tunnel
was a bright light then that would work"*) is what the bloom does.

## Row 219 build notes, from the 09-04 read of the renderer

Four readers walked the code before the boards were drawn (camera, pieces,
the jump-ball flow, the opening road). What the build must respect, with
the places in game.js:

- **The camera is three numbers and a fit.** RZ turns the court on the
  floor, RX tilts it from overhead (smaller = more top-down), PERSP=1400;
  fit {s,ox,oy} comes from computeFit, and FOCUS (the tap-a-player lean-in,
  z 1.5, anchored at 0.46 of the height) is the existing per-frame camera
  tween to copy. Playing view: phone RZ -80 RX 38, desk RZ -30 RX 57
  (CAM_TALL/CAM_WIDE, ~1175). Every court element goes through proj(), so
  driving RZ/RX and a zoom IS the whole camera. Do not drive the zoom
  through ZOOM (pinch): |ZOOM-1|>0.02 lights the view-reset button.
- **What must be invalidated per frame:** fitDirty=true, and SKIN.cacheKey
  (the floor texture cache keys on RZ and fit but NOT RX). A per-frame RZ
  change rebuilds the hardwood floor every frame (52 clipped drawImages at
  DPR 2); drag already pays that per move event, but 3.5s continuous on a
  real phone is unmeasured. Measure before shipping.
- **The painted arena never turns.** The backdrop is drawn cover-fit in
  screen space; under a high camera the court reads as a card on a wall.
  Ramp SKIN.scrim up while high, down on landing (the boards do this).
- **Gate the finger.** Drag writes RZ and pinch writes ZOOM with no phase
  guard (~3757, 3749); lock both while the camera is scripted. Taps are
  already refused in phase 'tip'.
- **End on the table.** aimCamera re-aims only on an aspect flip, so the
  move must finish by writing RZ/RX from CAM_TALL/CAM_WIDE (or a new tip
  camera pair) and restore FOCUS.z=1.5, or the resting camera is silently
  wrong until the next rotation. computeFit's bottom clamp shoves a zoomed
  centre view upward on phones; bypass it while the camera is scripted.
- **The formation is display-only.** Pieces are {team,pos,c,r,...}; index 4
  and 9 are the centres. Do NOT move c/r for the jump ball: snapshot() on a
  peer rejoin would restore INTO the formation as a live board, and
  defenderMarks reads real c/r every frame. Put the formation in drawnPos
  (pass the piece index) behind a TIP_FORM table, cleared in tipAnswer
  before phase becomes 'off-select'. Centre circle r=52 covers tiles
  (6..8, 3..4) on 15x8; half-court modes (8x7, three a side) need their
  own table or must skip. Hide the ball on holder 0 during 'tip'.
- **The ref is renderer-only.** Colour enters the lathe at ONE line
  (pieceColor, ~2005 and ~2156); stripes are a colour rule by segment
  (vertical) or by height (hoops). Build one sprite once, never in
  SPRITES[team+pos], yaw 0 to face the camera, drawn as an extra entry in
  draws[] with the piece closure's own shadow/scale/bob values copied and
  the source commented. Never in state.pieces, pieceAt or legalMove.
- **The veil.** #tipveil is rgba(8,5,3,.88) at z 26; the card and the domes
  carry their own backgrounds, but the countdown, #tipMsg and the buzzed
  stamp are painted straight on the veil and need a plate or a vignette
  when it goes see-through; .tz.lock (.35) and the far dome (.45) will
  read as ghosts over a lit floor. Row 222 (the chrome under the veil)
  rides this.
- **The road.** startGame calls refit while the game screen is still
  display:none (it rAF-retries), so the game screen must be ON before the
  camera move, i.e. the drop runs after show('game'). showJumbo leaves
  the opening (row 218) but stays for quarter breaks and sudden death; its
  fTimeout was also the freeze-aware hold between startGame and
  runTipoff, and coach.js:425 used the jumboveil as a "no tip during the
  opening" guard: replace both. The brains skip has no online guard
  (phones can diverge 2.6s); the guest absorbs an early tipq via
  tipPendQ. Keep whoosh-before-whistle (cine-check 7c).
- **The fork (row 221).** The card shows only when CPU.on; online and
  hot-seat go straight to the countdown, so Try one must not leak there.
  sampleOffer refuses online at one exact line the netgate sabotage
  patches: keep it. Burn the once-ever key on the Try-one TAP, not on card
  show, keep samAbort's unmark so a folded practice hands it back. Open:
  does Try one hide once burned (once-ever ruling says yes; ask).
- **Reduce-motion:** the camera move collapses to a cut, both ways.

Boards: The Referee Piece
<https://claude.ai/code/artifact/4622873e-1a06-4104-90e9-bdf572d3854e>;
The Drop (four camera moves, moving)
<https://claude.ai/code/artifact/19606ba5-fff9-456c-86e2-954bbd2b6ac1>. Harnesses:
tools/ref-board.mjs and tools/cam-board.mjs, both route-interception, no
product change.

## BUILT 09-04, the second pass: the real-court drop

His picks, in order: *"for ref, do 4 on phone and 1 on desktop"*; on the
drop, *"go with 1 build it"*. Built the same evening on the branch: the
loading beat in front of the walk, the jumbotron out of the road, the
light lifting onto the real board seen from high above with the pieces in
formation and the ref at centre, the game's own camera dropping onto the
sideline, the jump ball over the see-through veil, the fork on the card,
the pull-back on the winner. Law in DESIGN 8a (THE OPENING); rows 217-222;
before/after <https://claude.ai/code/artifact/c007cf16-bd2e-48e4-a713-35bad06ff159>.

Two things he said mid-build are on his desk, not built: the wording per
beat (*"the only wording and buttons that should be on the screen at any
beat are the things relevant to the player at that time, show me first"*),
beat sheet <https://claude.ai/code/artifact/0f818422-f1ae-423d-97d9-9dd18d143adc>; the scoreboard question was ruled the same night
(it stays, Skip just below it, row 222); and the turn said once (row 223).

## 09-05, second and third messages · the possession flow, panel and board

His pushback on the first answer: *"if it were you designing and building
the game for optimal player UI, UX and gaming experience how would you make
the flow... Walk me through what a simple clean process would look like...
think inside and outside the box... make the best not easiest decision."*
Then: *"why not games like Madden and Rabbids as well? Or even other turn
based RPGs?"* Answered the same day with an eight-angle design panel, three
critics on each, an archive scout, and three game-family passes. The memo
is design/possession-flow-2026-09-05/MEMO.md; the board is
<https://claude.ai/code/artifact/27ef4220-ee68-4d38-8779-d3abedade3c8>. The answer to his
doubt in one line: one thing with the ball, then they get one step, again,
until you shoot. Six rulings on his desk (the grammar A or B, the defense's
step clock, the shared phone, the play pick, the steal's price, One More).
Nothing built.

## 09-05 · the whole game played through, and the list filed

The opening shipped live in the morning (changelog 09-05 LIVE). He played
the game end to end on his phone and spoke the whole list; his ask was
*"just give me back a bullet point list of everything that I highlighted
that needs to be edited, changed, worked on... then we can add that to the
list and continue the gameplay rebuild."* Filed as rows 225-244 in TODO.md,
his words on every row, in the order he said them; nothing built. The
walkthrough resumes from those rows, and the first stops are the two he
called ideas rather than fixes:

- row 238, pick your play once after the jump ball, timeouts to change it
  (his research ask first: *"look back at some of the research that we did
  and see if there's anything in there that can indicate how we should
  allow the early setup to happen"*);
- row 239, one action a turn, chess-fast, Pokemon-style choices.

Both change the possession rules in DESIGN, so both get the option round
before anything moves. His five screenshots:
design/shots/playthrough-2026-09-05/.


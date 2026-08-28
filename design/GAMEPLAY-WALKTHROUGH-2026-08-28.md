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

---

*Owner: row 103 (gameplay rebuild, toss-up absorbed). Nothing above is
built into the product. Update this file the same turn each new piece is
described; do not fork a second copy.*

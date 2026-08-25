# TODO — the only list

> **This file is the list.** Six sections, one numbering, no letters. Ask it
> what to do next with `python3 tools/list.py`. Everything anyone is going to
> do, or has decided not to do, is a row in here.
>
> Aaron, 2026-08-20, and he had asked before: *"every time we speak there is a
> B# and a D# and A# and just regular old number X and more and more lists and
> you have never explicitly told me what any of those letters stand for and I
> have no idea what list is truly tracking what's next."* He was right. There
> were **eight ID schemes across five files**, and the bare numbers meant two
> different things inside the same file.

## How it works

**Six lists, and only the first two are being worked on.**

| # | list | what belongs in it |
|---|---|---|
| 1 | **BUILD** | Everything that must be true before the twenty play. Bugs, fixes and features all together, because to a player they are the same thing: the game is not ready. |
| 2 | **RESEARCH** | Getting to 1,000 dealable cards, and proving the ones we have. |
| 3 | **BUILD · after the 20** | We WILL build it. Not before launch. |
| 4 | **RESEARCH · after the 20** | We WILL research it. Not before launch. |
| 5 | **NICE TO HAVE** | We might never. Real ideas, no commitment. |
| 6 | **SCRAPPED** | Decided against. The `note` says why, so it does not get re-proposed. |

**The difference between 3/4 and 5 is commitment, not size.** "After the 20"
means it is going to happen. "Nice to have" means it might not. If that line is
ever unclear for an item, it belongs in 5, because promising less is the
cheaper mistake.

**The columns.**

- **`#`** · the number. It is a **NAME, not a position.** Assigned once, never
  changed, never reused, so an item keeps its number when it moves between
  lists and every mention of it in a commit or a doc still resolves.
  **New items go at the BOTTOM of their list with the next free number.**
  That rule exists because breaking it is confusing: on 08-20 a brand new item
  97 got filed second from the top of BUILD, next to items 2 and 3, and it read
  as though the numbering had gone wrong. Aaron: *"what is this item 97/96
  stuff I thought we had the single list thing."* The list was fine; the
  placement was not. If a new item genuinely has to be done next, it still goes
  at the bottom and gets `doing`, or it is said out loud. **Related items are
  linked in the `note`, never by sitting next to each other.**
- **`was`** · the old label (B17, A3c, D40, V42, row 22) so anything written in
  `BUILD.md`, `MAKING.md` or a commit message is still findable. Nothing new
  ever gets a letter.
- **`item`** · what it is, in one line.
- **`whose`** · **me** or **Aaron**. An item waiting on a ruling stays on its
  list and just changes hands. `python3 tools/list.py --yours` prints Aaron's.
- **`status`** · `open` · `doing` · `blocked`. Nothing else.
- **`note`** · required on 3, 4, 5 and 6. Why it is there and not on 1 or 2.

**Closing an item removes the row**, and a row may only leave this file two
ways: it shipped and the change is in `BUILD.md`'s changelog, or it moved to
SCRAPPED with a reason. Silently vanishing is the failure this file exists to
stop.

**Adding an item.** Anything new lands here in the same turn it is said, on one
of the six. If it is genuinely unclear which, it goes on BUILD as `blocked`
with a note asking, never left out.

---

## 1 · BUILD — active

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 6 | row 25 | The room stops at the canvas edge. Midnight Run is a cold court in a warm frame | Aaron | blocked | needs a call on the app's theme colour |
| 7 | row 21 | The feel tokens cover the game but not the satellite pages, 16 hardcoded motion declarations | me | open | |
| 8 | row 16 | The best fonts, and where to buy them | Aaron | blocked | his ask 08-18, needs a licence decision |
| 9 | B17 | The theatre port · halftime and game-point beats · zone glow · stakes on the tile · RUNS and TEAM TURNS calls | me | open | |
| 10 | B17 | The announcer voice pick | Aaron | blocked | |
| 11 | B18 | Smoothness wave 2: material language, continuity moments, sound slice, beauty moves | me | open | |
| 12 | B19 | Menus that lead you, from the Apple Store checkout pattern | me | open | |
| 13 | B20 | The toss-up buzzers. Comparison owed first: bottom-anchored versus two real buzzers left and right | me | open | |
| 14 | B7 | The coach as a first-run guide | me | open | |
| 15 | B8 | Cards remember you between games · play logging. Store proposed 08-11 | Aaron | blocked | his read pending on the proposal |
| 16 | B9 | Quick Run | me | open | |
| 17 | B10 | The heat sound, the missing third of a shipped feature | me | open | |
| 18 | B11 | "Did you know" blurbs in the Daily Five. Database half already done | me | open | |
| 19 | B12 | On-court name tags · the 27 lazy questions · CPU-vs-CPU headless sanity test | me | open | |
| 20 | B14 | The Gym as a room | me | open | |
| 21 | B13 | Player skills · TV / couch mode · in-game chat · trash talk | me | open | |
| 22 | D40 | The Daily Five starts without asking | me | open | |
| 23 | D41 | Playing older dates is invisible once today is done | me | open | |
| 24 | D42 | Leaving an old date mid-run throws the run away | me | open | |
| 25 | D43 | The menu slam fires off-tile, and scrolling triggers it | me | open | |
| 26 | D1b | The other 42 hover rules have the same bug | me | open | |
| 27 | D1c | A canvas ellipse can be asked for a negative radius | me | open | fixed once in computeFit 08-19, the general case is still open |
| 28 | D8 | The Daily Five stamp still does not read as tappable | me | open | |
| 29 | D24 | The install card failed its first real tester, twice in one sitting | me | open | |
| 30 | D26 | The Daily Five has no first-time intro, and it costs a shot | me | open | |
| 31 | D27 | Cadence during regular gameplay | me | open | |
| 32 | D34 | The open-man bonus, the half of the free move still open | me | open | |
| 33 | D36 | The tours doc owns six rulings no harvester reads | Aaron | blocked | move them here, then he rules |
| 34 | D4 | Right and wrong are a whisper | me | open | |
| 35 | D5 | No shot on offence | me | open | |
| 36 | D6 | Defence does not announce itself | me | open | |
| 37 | — | The Heat Check's six points arrive silently | Aaron | blocked | his call, raised 08-17 |
| 38 | — | Six controls in the game HUD are under 28px on a phone | me | open | measured 08-04 |
| 39 | — | 17 screens have only the smoke floor, not a real test | me | open | |
| 40 | — | Decide what survives a back button, on purpose | Aaron | blocked | |
| 41 | — | The flipped coach card covers the MOVING THE ROCK banner | me | open | |
| 42 | — | A player cannot see pack rarities, so re-shuffling has no meaning | me | open | |
| 43 | — | Tap the scoreboard to pause and blow it up | me | open | |
| 44 | — | The hint pill wording | Aaron | blocked | |
| 45 | — | What the icon is called on a home screen (`short_name`) | Aaron | blocked | |
| 46 | — | Service worker: yes, no, or later | Aaron | blocked | without one, iOS offline is broken |
| 47 | — | Two more icon shortcuts, owed when their features land | me | open | |
| 48 | — | The other half of B3, one field, is Aaron's | Aaron | blocked | |
| 49 | — | Delete three stale branches | Aaron | blocked | approved, only he can click it |
| 50 | — | Turn on branch protection for `main` | Aaron | blocked | approved, only he can click it |
| 98 | — | `menu2-check.mjs` fails on a stale count: it asserts seven live drills and there are 11 | me | open | fails identically on a clean tree, so it is the check that is out of date, not the game. Found 08-22 running the suite |
| 99 | — | The end-of-block check suite is a memory, not a command | me | open | there is no runner: the gates are named in prose across `CLAUDE.md` and `BUILD.md`, so a new one only runs if I remember it. Found 08-22 with nowhere to wire `install-check`'s new section into. This file's own law says a check that can be a script should be one |
| 100 | — | `feedback-check.mjs` finds 14 of 15 expected fields in a live game | me | open | fails identically on `origin/main`, so it predates this branch. Either a field really did vanish or the check's list of 15 is stale, and which one it is has not been established. Found 08-22 running the full suite before the merge |
| 101 | — | `install-check.mjs` flakes about one run in six on "the logo is tappable WITH the spotlight up" | me | open | 1 red in 6 runs, always the same classic-menu check, everything else green. The file already fought one race like this and fixed it by polling for the state instead of sleeping a fixed time; this one still sleeps. A flaky check is worse than no check, because it teaches you to ignore the output |

| 103 | rows 18+19 | **Rebuild the gameplay screen from scratch.** What does a player need to KNOW and DO at each moment, surfaced clean, polished and intuitive | me | open | Aaron 08-22 on five live screenshots: *"it's the whole gameplay visuals that need to be redone... it's unclear what's a button, what's a notification, I mean it's chaos... not being afraid to start from scratch."* Replaces items 4 and 5, which shipped 08-19 and did not fix it, and absorbs 102, the clipped action dock. Six named defects, the three open questions from the 08-22 comparison, and the moment-by-moment method are all in V0 row 32. **The option LIST goes to him before any option is built.** Related rows that should close when this lands: 34, 35, 36, 38, 41. **In flight 08-22:** the moment inventory is published (V0 row 32); the HUD is the first surface, with pause-as-symbol vs pause-as-word and the replay states on his desk at <https://claude.ai/code/artifact/0ef25906-9fb6-4352-9d1b-ee09b0c83b9f>, **RULED 08-22: A, the symbol; roomy inset; 64px on desktop; spent states approved.** Not yet shipped, deliberately: the phone dock holds only two controls, so shipping pause and replay before music, help and the coach have homes would strand them. The coach corner is the next pick, at <https://claude.ai/code/artifact/2a585c2e-0ff2-4905-8ee6-9f7076fe29a7>. HUD board: <https://claude.ai/code/artifact/0ef25906-9fb6-4352-9d1b-ee09b0c83b9f>. **SHIPPED 08-22: the in-game music button**, on his pick of B and resume-from-position. Gate `tools/music-check.mjs`, 23 checks a viewport, three sabotages. **SHIPPED 08-24: the two-control HUD as ruled** (pause symbol A, replay beside it with grey/orange states, roomy inset, 64px desktop), the ⋯ tray and the dock's ♪ and whistle retired with it; gate `tools/hud-check.mjs`, 24 checks, three sabotages, comparison at <https://claude.ai/code/artifact/a4ededa4-abfb-40ab-97fd-5d22c2a80bf3>. Still open in this item: the action dock/strip, the instruction line, the notification chaos, the pause-menu staircase and confirms |
| 104 | — | **Clear the board**: an option that removes everything from the game screen except the current move's picks | me | open | Aaron 08-23: *"I need to create a 'clear the board' option that removes everything except the current move picks."* Filed in his words; the exact scope (which overlays go, where the option lives, whether it is a toggle or a one-shot) is not yet ruled and should be asked before building. Part of the same cleanup as 103 and should be designed with it, since 103's census already lists every object this would remove |
| 106 | — | The coach in the pause menu, as the first-time-coach ON/OFF | me | open | Aaron 08-23: *"maybe we add the coach button back in the pause menu just so people can turn back on first time coach or off... Idc that it's in settings, that may be too hidden for a player that just wants it off or on mid match."* The look exists already, the pv-coach frame on the placement board (philosopher beside the score). Was blocked on 107's answers; those landed 08-24 (BUILD.md changelog) and nothing in them blocks this: the Settings road already round-trips cleanly, so a switch in the pause menu itself is safe to build |
| 110 | — | **The rulebook becomes a visual reference: 2D board images that cleanly display the rules, shorter text, drills move out to the gym** | me | open | Aaron 08-24, twice in the same breath as the 109 fix: *"the rulebook mid-game should have some 2D board images that cleanly display the rules anyone needs to know; I mean, the rulebook should have that regardless, because drills are leaving the rulebook anyway to end up in 'the gym' when it's built."* And later the same day, on the text itself: *"I want the rulebook to be more digestible eventually, those large paragraphs are too much, we will work on that later."* So the rebuild is diagrams AND a prose diet, one job: the picture carries the rule, the words shrink to captions. Two halves that ship together: the diagrams (screens, spacing, the corner three, the eight-square guard rule are all begging to be drawn on a flat court) and the drill relocation, which needs the gym to exist first. The mid-run hiding shipped for 109 is the down payment, and he has since ruled it law: DESIGN.md § 12a, *"no drills available mid game should be the rule"*, which binds the gym too when it lands. Medium question applies to the diagrams (vector court art is buildable to the standard; check DESIGN.md § 9 for devices that already exist before drawing new ones) |
## 2 · RESEARCH — active

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 51 | A3c / V42 | The prove pass on V29 Run B. Re-read all 30 quoted terms clauses at their URLs | me | open | |
| 52 | A3d / V45 | The publisher terms read. 13 of 17 done, hoophall.com and three others remain | me | open | |
| 53 | A3 | The era lookup pass. 321 of 1,526 facts carry no era tag, 43 in the dealable pool | me | open | |
| 54 | A4 | Block D: 90 cards with exactly one Tier 2 source, need one more publisher | me | open | |
| 55 | A5 / V37 | Write the pre-1980 NBA cards, aimed by `diversity.py --thin` | me | open | |
| 56 | A6 / V32 | Mine the 158 Tier 1 pages we already trust and cite exactly once | me | open | |
| 57 | A7 / V15 | Block E: 198 Wikipedia-only cards, follow the footnote and cite what it cites | me | open | |
| 58 | A8 / V22 V20 V19 | Link resolution as a script, then multi-league emit, then the remaining `l:any` | me | open | |
| 59 | A9 / V26 V17 V44 | 55 twin pairs · second sources · source posture | me | open | |
| 60 | A10 | Blocks F and G: 37 weak-tier cards, then 317 with no URL at all | me | open | |
| 61 | A11 / V39 | The pre-1997 women's half, attested claims for "Before the W" | me | open | |
| 62 | A12 / V25 V27 V40 | Reword the stale-able · the `goes_stale` audit · the rejection vocabulary | me | open | |
| 63 | V34 | The image pass: read the 783 pictures we already have | me | open | |
| 64 | V28 | The completeness census: how big is "all of it" | me | open | |
| 65 | V30 | Answerability rate, measured before building the natural-language tab | me | open | |
| 66 | V31 | Ratings derivation: can the eight attributes be sourced rather than invented | me | open | |
| 67 | V41 | The AI clause, a ruling Aaron owes, and it touches how we work today | Aaron | blocked | |
| 68 | V46 | "Throw-in" versus "inbound": pick the house term, then sweep | Aaron | blocked | |
| 69 | V23 | Nine rules cards the NBA rulebook does not settle | me | open | |
| 70 | — | More BIG3 questions. The pool is 77 own cards | me | open | Aaron 07-28 |
| 71 | — | Off-court mining run | me | open | Aaron 07-28 |
| 72 | — | Era tagging run. Blocks era-scoped play | me | open | Aaron 07-28 |
| 73 | — | Black Fives: the label | Aaron | blocked | 07-28, HIGH, matters to him personally |
| 74 | — | The board's curated cards are copies, and copies go stale | me | open | |
| 75 | — | Real players versus original archetypes | Aaron | blocked | Open Q #1 |
| 76 | — | The naming question goes to a real attorney before any release past the twenty | Aaron | blocked | |

## 3 · BUILD · after the 20

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 2 | row 31 | **Source a hoop frame and fit it.** Eight hand-built frames were shown and none landed, so this stops being a drawing job. Buy or find a low-poly `.obj`, then render it through the game's own projection. Spec and shopping list: ART_PROMPTS.md | Aaron | blocked | his call 08-20: *"none of them landed, it's okay we can keep as is and file this as something to source in the list post release to the 20."* Needs a model file plus its licence page |
| 77 | B15 | The pack reveal build | me | open | backlogged 08-12, superseding the 08-11 go, on Aaron's own second thoughts |
| 78 | — | Fouls and timeouts | me | open | Aaron 08-16, *"which are going to come"*, but not before the twenty |
| 79 | — | Heat phase 2: streak mode, the heat-check bomb, posterize drain | me | open | phase 1 ships first and gets played |
| 80 | — | `source_register`'s nested rules print as raw JSON | me | open | internal surface, no player sees it |

## 4 · RESEARCH · after the 20

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 81 | — | 22af Runs D and E, the player and pacing studies | me | open | asked 08-03, neither gates the twenty |
| 82 | V38 | Reaching 1,000 needs NEW research, not more digging | me | open | the corpus is already mined, measured 08-07; this is the plan for card 1,001 onward |

## 5 · NICE TO HAVE

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 83 | option A | Raise a banner to the rafters at 30 | Aaron | open | his call, the recommended one of four celebration ideas |
| 84 | option B | The month card, a trading card minted for the month | Aaron | open | |
| 85 | option C | A championship ring in a trophy case | Aaron | open | |
| 86 | option D | The stamp itself levels up | Aaron | open | cheapest of the four |
| 87 | — | Upgrade the branch archive to a real tag | Aaron | open | explicitly optional |
| 88 | — | Test-kitchen verdicts each round: is the loop fun, best and worst mechanic | Aaron | open | a ritual, not a task |

## 6 · SCRAPPED

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 97 | — | Render a sourced `.obj` hoop frame through the game's own projection | me | open | merged into 2 the day it was filed. Once the frame became a sourcing job the two were one piece of work, and two rows for one job is how a list starts lying |
| 89 | row 28 | Fix the figurine rings by moving the colour zones | me | open | wrong diagnosis, reverted. It was a depth-sort bug, see row 29 and BUILD 08-19 |
| 90 | row 13 | Bring the momentum tax back as fewer tiles on a crossover | me | open | THE ONE DEFENSE replaced it, 08-18 |
| 91 | — | Method A, the old turn structure | me | open | Aaron 08-17: *"we are goin with method B... and remove the option to switch"* |
| 92 | — | The spacing picker | me | open | retired by THE ONE DEFENSE, 08-18 |
| 93 | — | Both Method B switches | me | open | Aaron ruled full range for everyone, no toggles |
| 94 | — | Mobbin reference pull for the feel standard | me | open | blocked by a paid plan; the standard was written without it |
| 95 | — | `tools/grid-legibility.mjs` | me | open | returned non-monotonic nonsense, deleted 08-19 |
| 96 | — | An analytic camera model for the court fit | me | open | disagreed with the renderer by 1.9x; measure on real renders instead |
| 105 | — | The in-game coach button (the philosopher, bottom left, tap for a tip or a speed dial) | me | open | **MAY RETURN, his tag.** Aaron 08-23: *"scrap it but make it so we can bring it back if we needed... If we get enough feedback that it's needed then great."* Nothing was ever shipped, so the bring-back kit is complete: both option boards (<https://claude.ai/code/artifact/7264579f-52ca-4acf-b330-6d81d2eee3ca> placements, <https://claude.ai/code/artifact/e815d3c9-8100-471f-8322-5a38cf466466> the tap, dial tightened per his ruling) and the render harnesses `tools/coach2-shots.mjs` and `tools/coach3-shots.mjs`, which rebuild every frame from the live game. The trigger to reopen is TESTER FEEDBACK asking for mid-game help |

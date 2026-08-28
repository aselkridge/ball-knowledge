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

**Within BUILD, the ORDER of the rows IS the plan to the twenty.** Ruled by
Aaron 08-24 (*"Order is fine and let's order it now"*), sequence proposed
here and approved by him. `python3 tools/list.py` reads it top down, so its
NEXT is now a real answer, not the oldest surviving row.

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
  **New items get the next free number and land at the POSITION where they
  belong in the order** (Aaron, 08-24: *"things should land where they
  belong"*). This supersedes the at-the-bottom rule of 08-20. Both rules
  answer the same confusion two different ways: back then a new item filed
  near the top read as broken numbering, so everything sank to the bottom and
  the ORDER quietly stopped meaning anything, which confused him worse on
  08-24 (*"there should be a clear order list to the 20, why is this list so
  all over the place?"*). The resolution: **position carries priority, the
  number carries identity.** A row's place in BUILD is its rank on the road
  to the twenty; its number is just its name. **Related items are linked in
  the `note`, never by sitting next to each other.**
- **`was`** · the old label (B17, A3c, D40, V42, row 22) so anything written in
  `BUILD.md`, `MAKING.md` or a commit message is still findable. Nothing new
  ever gets a letter. The decoder, for reading old text: **A#** V0 Track A
  data · **B#** V0 Track B build · **R#** research runs · **D#** defects ·
  **V#** verification items · **H# Q# P# S# C#** research categories ·
  **row N** V0's numbered rows.
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
| 111 | — | **The design bible pass: the polish standard nailed down and every shipped surface audited against it** | me | doing | Aaron 08-24: *"The next thing I want nailed down is the polish, so that we don't keep building things that don't meet the design standard."* What already exists and is NOT lost: THE FEEL STANDARD ruled 08-18 (*"I love the board"*, <https://claude.ai/code/artifact/3b20d39b-0d57-4752-ba2b-1dc6499dbfac>), motion fully tokenized 08-19 with `audit.py` gating `raw_motion` at 0, DESIGN.md § 9 as the bible's home, and the 22af comparative research findings. What this row adds: wave 2 (11), the banked Mobbin pull as the reference input (`design/reference/mobbin-pull-1.md`, three pulls with readings, committed 08-19; further pulls only where a surface has no reference yet), the VISUAL half of the standard written into DESIGN.md § 9 the way motion already is, and an audit of every shipped screen against it with the gaps filed as rows. **Audit round 1 ran 08-25**: 20 screens shot both viewports, 15 agents (7 auditors, 7 adversarial verifiers, a completeness critic), 67 findings, 34 killed in verification, the rest filed as rows 189-196; the census and ratchet shipped the same day; his decision board (the token rulings plus the font shop) is the open half. **Board round 2 ruled 08-25**: D1 lit law and D4 radius ladder ruled (circles stay, his pill point), D6 amber ruled (the radio OBJECT stays open, rows 11/190/193); D2 widened by him to a researched palette round seeded from #f5872e, D3 re-explained, D5 rebuilt from standards on his start-fresh rule, D7/D8 blocked on the font round (row 8). **Rounds 4-5 (08-25/26)**: D3 RULED a (five inks + the 4.5:1 floor, DESIGN section 9); D4's snap render corrected after his catch (a blanket selector squared a circle the law keeps; game-visuals rule added); D5 got the middle-mush demo drawn live; D6 rewritten plain (open: keep or retire the boombox); D2 reframed and MEASURED: full token flip on the real build moved 1% of pixels, so the palette is the law the sweeps repaint by. **Rounds 6-8 (08-26): D2 RULED (ramp + cold family), D5 RULED (two-tier + escape valve), D6 hardware RULED (boombox stays a tamed toy), tokens landed inert in :root; the font round ran (Druk out on cost, corrected Big Shoulders render after the fallback catch, five guarded specimen pairs); F + D7 RULED ('Keep Sedgwick's territory and lets go big shoulders') and SHIPPED same day: Big Shoulders Black self-hosted, Anton retired from the game, before/after artifact in PLACES. THE BIBLE IS FULLY RULED; what remains of this row is the sweeps, rows 189-196** |
| 192 | — | **Setup flow polish batch**: the one ask gets the light (league), label-vs-pill collision (STREET LEGENDS), one primary-button spec across the five screens, focused-field halo only (names), Reshuffle demoted to ghost (squad), the era header saying one thing once, the 4 QTRS card and floating blurb (rules), the stats hint contrast (squad) | me | open | audit 08-25, setup-a and setup-b groups, verified per finding. 08-26: two of this batch's items landed early inside 189's lit sweep (Reshuffle to ghost; the era screen's second primary demoted to a selected toggle); do not redo them **08-27, first pass: six closed** (the STREET LEGENDS collision, the pack drawer's four labels and Surprise Me lifted over the 4.5:1 floor, the era line's duplicate instruction, the 4 QTRS sibling, the floating level blurb, and the radius ladder swept across the flow). `tools/setup-check.mjs` holds all of it, 12 checks, sabotage-proved. **Two filed items were already true**: the league screen has exactly one lit thing, and the primary button was already identical on all five screens, only its corner was off-ladder. **STILL OPEN, and both are HIS to rule, not mine to apply**: (a) the name fields glow before they are filled, which the code argues for out loud and which collides with the one-light rule, four at once, with the focus state measured BACKWARDS (halo 0.46 at rest, 0.25 focused); (b) selection on the rules screen wearing the action's accent, the menu collision again but with selection doing a different job here |
| 193 | — | **Menu polish batch**: one SOON treatment for both locked modes, one music control per screen, the separator-dangling wrap on THE JACKET's caption | me | open | audit 08-25, menu group. The seven-vs-eleven drills copy was FIXED on the spot the same day **08-27, his catch:** *"I think the one thing lit per page is not working on the main menu too, I think settings and the selected vs option are highlighted, not sure"*. He is right, counted: the music note and the gear both wear accent rings (utility chrome, the same job 189 already ghosted in-game), the centred VS THE CPU card wears an accent border, the Daily 5 stamp glows at 32,599px squared, the gym badge and the carousel dot are accent too. Selection and utility are two jobs and neither is the one bright action. Options per surface before anything is repainted **08-27: the lit half of this batch SHIPPED** on his ruling of option A (four lit down to two, utility quieted, selection moved to the cold family, the Quick Run clock ghosted). What remains of 193: one SOON treatment for both locked modes, one music control per screen, and the separator-dangling wrap on THE JACKET's caption |
| 197 | — | **Sedgwick narrowed: reevaluate the 12 non-slam sites** (TIMEOUT!, tip-veil title, who-buzzed, callout flourish, rolodex tag, Daily Five title + taunt + break + HEAT CHECK, rulebook headings, court stamp, court lock) with options shown per surface; the 8 slam/victory sites stay graffiti | me | open | his ruling 08-26: *"I really think Sedgwick should only be on SLAMS and like Victory moments. Everything else should be reevaluated."* Full map with selectors in DESIGN section 9; rides the sweeps so each surface gets judged in its own screen's pass |
| 194 | — | **The beauty-move wave, versus screen first**: the match wears both squads' colours, winner bright loser dim at the buzzer, the tip-off gets the empty screen | me | open | ruled 08-18 in § 9 and re-armed by the audit (versus identity is the smallest thing on its own screen; the end line drops both ruled treatments at the exact moment they are ruled for) plus mobbin-pull-2's MLS full-time wash and Apple News weight. Each lands as its own before/after |
| 195 | — | The screen sweep drives REAL flows: setup pickers rendered, versus built with a cfg, render guards that fail loud | me | open | audit 08-25 process finding: five setup captures and the versus shell shipped to the auditors with their JS content missing, and the verify stage caught it instead of the harness. The sweep joins the suite once it drives the flows |
| 196 | — | **Bible audit round 2: the live-play layer** | me | open | the completeness critic's list, 08-25: the question card, the release meter, the battles, the coach card and drill chrome, callouts and toasts, the install sheet, Daily Five in-round and both endings, the end veil's WIN vs LOSS dress, the load and toss-up screens. Static captures cannot reach these; round 2 stages them live the way the moment inventory did. 08-26: the LIT slice of this round ran early on his order: tossup and end veil hunted clean; the Daily Five in-round layer could not be staged (195's harness gap) and stays owed here |
| 11 | B18 | Smoothness wave 2: material language, continuity moments, sound slice, beauty moves | me | open | RESTORED 08-24, his catch, hours after the triage moved it down: *"soooo many things missing, quick game, tv gameplay, the gym... it just feels like you got really confused somewhere along the way."* He was right and V0 already said so: the "all five stay / do not re-litigate" ruling and the original 27 cover this row, and the triage proposal never checked the moves against those rulings. Rank inside the list is provisional until his gameplay walkthrough sets it. 08-26, D6 ruling binds this row: the boombox stays AS A TOY, repainted in house colours and calmed down; restyle comes back as its own option board before shipping |
| 134 | — | Inlaid grid lines over the ART courts: ruled by Aaron, marked "BUILT: not yet", and the row-22 job it rode has shipped without it | me | open | census 08-24 (V0:1909). His ruling: "the inlaid lines thing seems like the answer" |
| 103 | rows 18+19 | **Rebuild the gameplay screen from scratch.** What does a player need to KNOW and DO at each moment, surfaced clean, polished and intuitive | me | doing | Aaron 08-22 on five live screenshots: *"it's the whole gameplay visuals that need to be redone... it's unclear what's a button, what's a notification, I mean it's chaos... not being afraid to start from scratch."* Replaces items 4 and 5, which shipped 08-19 and did not fix it, and absorbs 102, the clipped action dock. Six named defects, the three open questions from the 08-22 comparison, and the moment-by-moment method are all in V0 row 32. **The option LIST goes to him before any option is built.** Related rows that should close when this lands: 34, 35, 36, 38, 41. **In flight 08-22:** the moment inventory is published (V0 row 32); the HUD is the first surface, with pause-as-symbol vs pause-as-word and the replay states on his desk at <https://claude.ai/code/artifact/0ef25906-9fb6-4352-9d1b-ee09b0c83b9f>, **RULED 08-22: A, the symbol; roomy inset; 64px on desktop; spent states approved.** Not yet shipped, deliberately: the phone dock holds only two controls, so shipping pause and replay before music, help and the coach have homes would strand them. The coach corner is the next pick, at <https://claude.ai/code/artifact/2a585c2e-0ff2-4905-8ee6-9f7076fe29a7>. HUD board: <https://claude.ai/code/artifact/0ef25906-9fb6-4352-9d1b-ee09b0c83b9f>. **SHIPPED 08-22: the in-game music button**, on his pick of B and resume-from-position. Gate `tools/music-check.mjs`, 23 checks a viewport, three sabotages. **SHIPPED 08-24: the two-control HUD as ruled** (pause symbol A, replay beside it with grey/orange states, roomy inset, 64px desktop), the ⋯ tray and the dock's ♪ and whistle retired with it; gate `tools/hud-check.mjs`, 24 checks, three sabotages, comparison at <https://claude.ai/code/artifact/a4ededa4-abfb-40ab-97fd-5d22c2a80bf3>. Still open in this item: the action dock/strip, the instruction line, the notification chaos, the pause-menu staircase and confirms. **Paused 08-24 on his direction:** the action-strip option list was shown and he answered with a bigger plan, *"I want to walk through full gameplay and build this the way I want it to be"*, AFTER the polish block (111) lands. The five named options and his coming alternatives go into that walkthrough |
| 29 | D24 | The install card failed its first real tester, twice in one sitting | me | open | |
| 14 | B7 | The coach as a first-run guide | me | open | |
| 127 | — | **The coach still teaches the old possession**: coach.js scripts, the COACH-TOURS map and all seven gym drills predate Method B, so the coach stays muted in full-court games until the rewrite lands | me | open | census 08-24 (V0:1995, BUILD:4401). Gates 14, the first-run guide, which cannot ship teaching rules the game no longer has |
| 130 | — | CM-INT-10: a tip suppressed by a veil must re-arm, "already half-true, finish it in the build" | me | open | census 08-24 (design/COACH-TOURS-2026-08-10.md:455) |
| 30 | D26 | The Daily Five has no first-time intro, and it costs a shot | me | open | |
| 128 | — | **Method B does not carry online or half-court**: the group chat the launch exists for would play the OLD possession | me | open | census 08-24 (BUILD:4402, V0:1995, DESIGN:96 "drills still play the classic possession because Method B does not carry"). Rank provisional: big build, sits high because online IS the launch; confirm its place in the walkthrough |
| 129 | — | The CPU setup brain: the CPU currently skips its free setup entirely | me | open | census 08-24 (V0:1995). Every CPU game gives the human a free positional edge the CPU never takes |
| 34 | D4 | Right and wrong are a whisper | me | open | |
| 35 | D5 | No shot on offence | me | open | |
| 36 | D6 | Defence does not announce itself | me | open | |
| 25 | D43 | The menu slam fires off-tile, and scrolling triggers it | me | open | |
| 26 | D1b | The other 42 hover rules have the same bug | me | open | |
| 41 | — | The flipped coach card covers the MOVING THE ROCK banner | me | open | |
| 38 | — | Six controls in the game HUD are under 28px on a phone | me | open | measured 08-04; the dock pair grew to 30-64px in the 08-24 HUD ship, the remaining four ride with 103 and close with it |
| 27 | D1c | A canvas ellipse can be asked for a negative radius | me | open | fixed once in computeFit 08-19, the general case is still open |
| 126 | — | Settings says the music is "5 tracks"; audio.js has 8 and the Rulebook says eight | me | open | census 08-24 (V0:1076, design/COACH-AND-DRILLS.md:845, verified live). One of the three is lying to players today |
| 22 | D40 | The Daily Five starts without asking | me | open | |
| 23 | D41 | Playing older dates is invisible once today is done | me | open | |
| 24 | D42 | Leaving an old date mid-run throws the run away | me | open | |
| 132 | — | The Daily Five card-advance timer keeps dealing after a player walks out, so an abandoned run burns down while they are away | me | open | census 08-24 (V0:1994). Sibling of 24; the fix likely shares its pause-the-run machinery |
| 28 | D8 | The Daily Five stamp still does not read as tappable | me | open | |
| 104 | — | **Clear the board**: an option that removes everything from the game screen except the current move's picks | me | open | Aaron 08-23: *"I need to create a 'clear the board' option that removes everything except the current move picks."* Filed in his words; the exact scope (which overlays go, where the option lives, whether it is a toggle or a one-shot) is not yet ruled and should be asked before building. Part of the same cleanup as 103 and should be designed with it, since 103's census already lists every object this would remove |
| 106 | — | The coach in the pause menu, as the first-time-coach ON/OFF | me | open | Aaron 08-23: *"maybe we add the coach button back in the pause menu just so people can turn back on first time coach or off... Idc that it's in settings, that may be too hidden for a player that just wants it off or on mid match."* The look exists already, the pv-coach frame on the placement board (philosopher beside the score). Was blocked on 107's answers; those landed 08-24 (BUILD.md changelog) and nothing in them blocks this: the Settings road already round-trips cleanly, so a switch in the pause menu itself is safe to build |
| 16 | B9 | Quick Run | me | open | RESTORED 08-24, his catch, hours after the triage moved it down: *"soooo many things missing, quick game, tv gameplay, the gym... it just feels like you got really confused somewhere along the way."* He was right and V0 already said so: the "all five stay / do not re-litigate" ruling and the original 27 cover this row, and the triage proposal never checked the moves against those rulings. Rank inside the list is provisional until his gameplay walkthrough sets it |
| 20 | B14 | The Gym as a room | me | open | RESTORED 08-24, his catch, hours after the triage moved it down: *"soooo many things missing, quick game, tv gameplay, the gym... it just feels like you got really confused somewhere along the way."* He was right and V0 already said so: the "all five stay / do not re-litigate" ruling and the original 27 cover this row, and the triage proposal never checked the moves against those rulings. Rank inside the list is provisional until his gameplay walkthrough sets it |
| 21 | B13 | Player skills · TV / couch mode · in-game chat · trash talk | me | open | RESTORED 08-24, his catch, hours after the triage moved it down: *"soooo many things missing, quick game, tv gameplay, the gym... it just feels like you got really confused somewhere along the way."* He was right and V0 already said so: the "all five stay / do not re-litigate" ruling and the original 27 cover this row, and the triage proposal never checked the moves against those rulings. Rank inside the list is provisional until his gameplay walkthrough sets it |
| 15 | B8 | Cards remember you between games · play logging. Store proposed 08-11 | Aaron | blocked | his read pending on the proposal. RESTORED 08-24, his catch, hours after the triage moved it down: *"soooo many things missing, quick game, tv gameplay, the gym... it just feels like you got really confused somewhere along the way."* He was right and V0 already said so: the "all five stay / do not re-litigate" ruling and the original 27 cover this row, and the triage proposal never checked the moves against those rulings. Rank inside the list is provisional until his gameplay walkthrough sets it |
| 19 | B12 | On-court name tags · the 27 lazy questions · CPU-vs-CPU headless sanity test | me | open | RESTORED 08-24, his catch, hours after the triage moved it down: *"soooo many things missing, quick game, tv gameplay, the gym... it just feels like you got really confused somewhere along the way."* He was right and V0 already said so: the "all five stay / do not re-litigate" ruling and the original 27 cover this row, and the triage proposal never checked the moves against those rulings. Rank inside the list is provisional until his gameplay walkthrough sets it |
| 17 | B10 | The heat sound, the missing third of a shipped feature | me | open | |
| 31 | D27 | Cadence during regular gameplay | me | open | |
| 13 | B20 | The toss-up buzzers. Comparison owed first: bottom-anchored versus two real buzzers left and right | me | open | |
| 32 | D34 | The open-man bonus, the half of the free move still open | me | open | |
| 131 | — | No-repeat question cooldown, subject-keyed so a fact can return about another player | me | open | census 08-24 (BUILD:232, the FL-3 box never ticked). Without it the twenty see repeat cards inside a session; 174 on the after-list is the full spaced-repetition version, this is the floor |
| 99 | — | The end-of-block check suite is a memory, not a command | me | open | there is no runner: the gates are named in prose across `CLAUDE.md` and `BUILD.md`, so a new one only runs if I remember it. Found 08-22 with nowhere to wire `install-check`'s new section into. This file's own law says a check that can be a script should be one |
| 98 | — | `menu2-check.mjs` fails on a stale count: it asserts seven live drills and there are 11 | me | open | fails identically on a clean tree, so it is the check that is out of date, not the game. Found 08-22 running the suite |
| 100 | — | `feedback-check.mjs` finds 14 of 15 expected fields in a live game | me | open | fails identically on `origin/main`, so it predates this branch. Either a field really did vanish or the check's list of 15 is stale, and which one it is has not been established. Found 08-22 running the full suite before the merge |
| 101 | — | `install-check.mjs` flakes about one run in six on "the logo is tappable WITH the spotlight up" | me | open | 1 red in 6 runs, always the same classic-menu check, everything else green. The file already fought one race like this and fixed it by polling for the state instead of sleeping a fixed time; this one still sleeps. A flaky check is worse than no check, because it teaches you to ignore the output |
| 39 | — | 17 screens have only the smoke floor, not a real test | me | open | |
| 123 | — | `open-items.py` is blind to BUILD § 3's AFTER LAUNCH block and the § 5b.3 idea shelf | me | open | found 08-24 the hard way: the whole post-launch design sat in prose under a header stamped SUPERSEDED, the harvester believed the stamp, and the list looked complete while missing the future. Teach it to read those sections so this cannot drift again |
| 133 | — | The non-affiliation disclaimer surface ("not affiliated with the NBA, WNBA, BIG3") | me | open | census 08-24 (LEGAL.md:176, BUILD:428). LEGAL recommends shipping it even for the twenty and it needs no ruling to build |
| 40 | — | Decide what survives a back button, on purpose | Aaron | blocked | |
| 44 | — | The hint pill wording | Aaron | blocked | |
| 45 | — | What the icon is called on a home screen (`short_name`) | Aaron | blocked | |
| 46 | — | Service worker: yes, no, or later | Aaron | blocked | without one, iOS offline is broken |
| 6 | row 25 | The room stops at the canvas edge. Midnight Run is a cold court in a warm frame | Aaron | blocked | needs a call on the app's theme colour |
| 48 | — | The other half of B3, one field, is Aaron's | Aaron | blocked | |
| 49 | — | Delete three stale branches | Aaron | blocked | approved, only he can click it |
| 50 | — | Turn on branch protection for `main` | Aaron | blocked | approved, only he can click it |
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
| 135 | V3/H1 | **117 verified women's pre-WNBA facts, paid for on 07-29 and never applied to the bank**, plus the three pre-merge debts (adversarial refutation of the 45 corrections, conflict settling, the completeness critic) and the three H1 merge decisions on Aaron's desk | me | open | census 08-24 (RESEARCH-BACKLOG:1465,1520, BUILD:586). Finished research sitting outside the product is the most expensive kind of hidden |
| 136 | V4/V6 | The volatile index and the refresh loop: `volatile-questions.json` has never been generated, 148 volatile cards live unindexed, the ruled 3-runs-a-year cadence cannot run, and the player-DB half has no schedule either | me | open | census 08-24 (RESEARCH-BACKLOG:1532,1556, DEEPRESEARCH_KNOWLEDGE:236,249). The documented refresh loop's step 1 reads a file that does not exist |
| 137 | V7-V10 | The source-chain block: run-1 corpus is 73% Wikipedia (559/765), 385 srcIds resolve to no fact anywhere, players.json rides 213 weak citations, and 441 shipped superlative cards never got a prior-claimant search | me | open | census 08-24 (RESEARCH-BACKLOG:1565-1587) |
| 138 | V12 | The tier economy violation: 99 superstars vs 42 deep, 10 of 35 BIG3 players tagged superstar; pack odds are frozen until the pyramid is right side up | me | open | census 08-24 (RESEARCH-BACKLOG:1593) |
| 139 | V11 | The three stuck facts (Taurasi's unreadable source, first-WNBA-Hall needs a meaning ruling, LeBron's "in 2023" needs a Tier 1 date or a cut) plus a check on whether `dateChecked` stamping survived the tables migration | me | open | census 08-24 (RESEARCH-BACKLOG:981-991,1608). Two of the three are Aaron's call |
| 140 | — | The 731 recovered source mappings were never checked for CORRECTNESS: an Auerbach card cites a Britannica page on Phil Jackson | me | open | census 08-24 (V0:2272). Recovered is not the same as right |
| 141 | — | Verified cards for the thinnest decades, the fix for the 1-in-8 draws that silently ignore the era the player picked (125 of 1,080 measured) | me | open | census 08-24 (V0:2871). Sharper than 55, which writes pre-1980 NBA generally |
| 142 | — | Mine nicknames into `also_known_as` (2 of 838 rows filled), queued for "when the Heat Check gets built", and the Heat Check is live | me | open | census 08-24 (BUILD:2802). The Heat Check accepts typed names; nicknames are wrong answers today |

## 3 · BUILD · after the 20

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 2 | row 31 | **Source a hoop frame and fit it.** Eight hand-built frames were shown and none landed, so this stops being a drawing job. Buy or find a low-poly `.obj`, then render it through the game's own projection. Spec and shopping list: ART_PROMPTS.md | Aaron | blocked | his call 08-20: *"none of them landed, it's okay we can keep as is and file this as something to source in the list post release to the 20."* Needs a model file plus its licence page |
| 77 | B15 | The pack reveal build | me | open | backlogged 08-12, superseding the 08-11 go, on Aaron's own second thoughts |
| 78 | — | Fouls and timeouts | me | open | Aaron 08-16, *"which are going to come"*, but not before the twenty |
| 79 | — | Heat phase 2: streak mode, the heat-check bomb, posterize drain | me | open | phase 1 ships first and gets played |
| 80 | — | `source_register`'s nested rules print as raw JSON | me | open | internal surface, no player sees it |
| 7 | row 21 | The feel tokens cover the game but not the satellite pages, 16 hardcoded motion declarations | me | open | moved 08-24, the ordering ruling: satellite-page polish does not gate the twenty |
| 9 | B17 | The theatre port · halftime and game-point beats · zone glow · stakes on the tile · RUNS and TEAM TURNS calls | me | open | moved 08-24, the ordering ruling: theatre beats are polish the twenty can play without |
| 10 | B17 | The announcer voice pick | Aaron | blocked | moved 08-24, the ordering ruling: the voice pick can land after launch |
| 12 | B19 | Menus that lead you, from the Apple Store checkout pattern | me | open | moved 08-24, the ordering ruling: the menus work, leading is a refinement |
| 18 | B11 | "Did you know" blurbs in the Daily Five. Database half already done | me | open | moved 08-24, the ordering ruling: a bonus layer, database half stays done and waiting |
| 33 | D36 | The tours doc owns six rulings no harvester reads | Aaron | blocked | move them here, then he rules. moved 08-24, the ordering ruling: doc plumbing, his six rulings keep |
| 37 | — | The Heat Check's six points arrive silently | Aaron | blocked | his call, raised 08-17. moved 08-24, the ordering ruling: a sound cue on a bonus round |
| 42 | — | A player cannot see pack rarities, so re-shuffling has no meaning | me | open | moved 08-24, the ordering ruling: packs are cosmetic in the friendly launch |
| 43 | — | Tap the scoreboard to pause and blow it up | me | open | moved 08-24, the ordering ruling: a nicety on top of a pause that works |
| 47 | — | Two more icon shortcuts, owed when their features land | me | open | moved 08-24, the ordering ruling: owed when their features land, and their features moved with them |
| 110 | — | **The rulebook becomes a visual reference: 2D board images that cleanly display the rules, shorter text, drills move out to the gym** | me | open | Aaron 08-24, twice in the same breath as the 109 fix: *"the rulebook mid-game should have some 2D board images that cleanly display the rules anyone needs to know; I mean, the rulebook should have that regardless, because drills are leaving the rulebook anyway to end up in 'the gym' when it's built."* And later the same day, on the text itself: *"I want the rulebook to be more digestible eventually, those large paragraphs are too much, we will work on that later."* So the rebuild is diagrams AND a prose diet, one job: the picture carries the rule, the words shrink to captions. Two halves that ship together: the diagrams (screens, spacing, the corner three, the eight-square guard rule are all begging to be drawn on a flat court) and the drill relocation, which needs the gym to exist first. The mid-run hiding shipped for 109 is the down payment, and he has since ruled it law: DESIGN.md § 12a, *"no drills available mid game should be the rule"*, which binds the gym too when it lands. Medium question applies to the diagrams (vector court art is buildable to the standard; check DESIGN.md § 9 for devices that already exist before drawing new ones). moved 08-24, the ordering ruling, and his own words already said later: "I want the rulebook to be more digestible eventually... we will work on that later". Audit 08-25 adds two riders: the panel hard-clips a topic row mid-glyph at its bottom edge (needs a fade or full-height scroll), and three of nine topics share the identical basketball glyph |
| 198 | — | **The toss-up teaches by showing, not bullets**: first run gets a brief slideshow or a sample toss-up in place of the bullet-point instructions | me | open | his ask 08-26: *"the toss up instructions should have a brief slideshow or sample toss up as the instructions or first time run, not bullet points to read"*; same show-don't-tell spirit as the rulebook redesign (110), the current bullets live in .tu-how |
| 112 | AL-1 | **Hands & heat, the full build**: pass/dunk/free-throw timing meters, alley-oops, posterize, contest choice (question vs timed block, fouls, and-ones, foul-outs), fatigue, the :24 shot clock, matchup clause | me | open | harvested 08-24 from BUILD.md § 3 AFTER LAUNCH, which was designed and committed but had never become rows; his catch: *"career mode, online builds, everything feels like it's missing"* |
| 113 | AL-2 | **The collection, the career spine (his "career mode")**: figurines as collectibles with the tilt-the-base reveal, six pack rarities, the onboarding rip (3 packs x every era), tiered player cards with ratings, duplicate fusing into ring tiers, the credits economy with upset multipliers and wager lobbies, the pack-rip ceremony, per-account inventory, trading, collection share codes | me | open | harvested 08-24 from AL-2; the career-mode art round (rooms, gyms, cutscenes, shop) already produced prompts in ART_PROMPTS.md |
| 114 | AL-3 | **Art & atmosphere**: sourced hero and flame balls, venue backdrops as court skins, player and archetype portraits, commentary barks, camera punch-ins, WNBA/NBA visual identities | me | open | harvested 08-24 from AL-3 |
| 115 | AL-4 | **All-Star Weekend**: the 3-point contest, the dunk contest, the skills challenge as a secret tutorial | me | open | harvested 08-24 from AL-4; the CPU opponent half of that block shipped 07-24 |
| 116 | AL-4.5 | **Squad-up co-op**, his ask (*"players teaming up against other teams"*): 2v2+ rooms, each human runs their own pieces and answers their own cards, co-op rebound battles, shared heat, team chat, and two humans vs a Legend CPU as a boss mode | me | open | harvested 08-24 from AL-4.5; rides on FL-4's rooms |
| 117 | AL-5 | **The league**: Big3 4-point circle and streetball rules, secret characters, home-court perk, coach view, handicap dial, community packs, seasons and drafts, leaderboards (including the Daily Five leaderboard he called long-term vision), the cinematic intro | me | open | harvested 08-24 from AL-5 and § 12's "Later" line |
| 118 | — | **The two browser fixes still owed from the app question**: web push for turn notifications, and match state that survives a backgrounded tab | me | open | harvested 08-24 from APP-AND-MONEY.md Part 1, where six symptoms were mapped and four are fixed (manifest, wake lock, standalone, sleeping server); these two remain and neither needs an app store |
| 119 | — | **The four streak rewards**, accepted whole | me | open | Aaron 08-04: *"I love all 4 rewards and we will build them later."* Harvested 08-24 from V0; the streak's one-device localStorage limit is documented there and has to be solved with them |
| 152 | — | **The sound systems build**: state-driven crowd bed with the game-point hush, the five chants wired to existing hooks, the 30-bark bank with its trigger map and 9-second cadence guard, and the VS screen's sourced riser and real buzzer | me | open | census 08-24 (design/SOUND-SHEET.md:17,35,58,128). The sheet was written 08-16 and no row ever carried its layers |
| 153 | — | The sound sourcing pile: the six files that cannot be synthesised (crowd cheer, footfalls on wood and blacktop...), the consistent footstep slices, the sneaker squeak one-shot, the clipped takeoff re-source, and every sfx licence recorded in PLACES.md the way Ketsa is | Aaron | blocked | census 08-24 (BUILD:3540, V0:457-677). Sourcing is his; the wiring rides 152 |
| 154 | — | The drill build-out: 11 drills ship today against the ruled 62-part layout across 11 multi-part drills, Tier A first | me | open | census 08-24 (design/COACH-AND-DRILLS.md:125). Waits on 127, the Method B coach rewrite |
| 155 | — | The scripted CPU opponent, the one capability that unlocks the six Tier B drills including the graduation pair | me | open | census 08-24 (design/COACH-AND-DRILLS.md:156) |
| 156 | — | The coach delivery block: the DR-43..56 tray rows that were never filed with the coach moments, the pass-the-phone curtain for Local VS, the ruled gym nudge with sequenced drill order, and the rulebook's relocation to a reference home | me | open | census 08-24 (COACH-BOARD:207, COACH-TOURS:349, BUILD:2818). Overlaps 33 and 110 and should land with them |
| 157 | — | Trivia card back art: every possession shows it and it is still a CSS gradient; the sourcing spec sits in ART_PROMPTS § 6 | me | open | census 08-24 (ART_PROMPTS:328) |
| 158 | — | Backdrop depth layers for parallax (sky, mid, fore, arena haze); one flat arena-menu.jpg is all that ever landed | me | open | census 08-24 (ART_PROMPTS:232) |
| 159 | — | The 1.5s broadcast intro bumper, deferred until the logo existed; the logo shipped 07-27 | me | open | census 08-24 (design/INTERACTION-PROPOSAL.md:84) |
| 160 | — | The Courts tab and the court unlock economy (rarities, Court Packs, milestones, versioned drops), plus shipping more of the 25 approved skins from the menu of 30 | me | open | census 08-24 (design/COURT-SKINS.md:238,29). Which skins ship next is his pick |
| 161 | — | The PLACES art batch: the ten Gym-and-film-room generations called "the one blocking piece of art in the whole project", waiting on his ART ROUND 2 aspect verdict and the pivot/bob/700ms camera rulings | Aaron | blocked | census 08-24 (design/PLACES-ART-BRIEF.md:43, V0:1020, BUILD:1352). Unblocks 20, the Gym as a room |
| 162 | — | **The Film Room**: what it actually does is undecided (the miss-reveal from the Daily Five is the standing candidate), the tile wears COMING SOON, and reveal-on-a-miss itself is his open call | Aaron | blocked | census 08-24 (design/PLACES-ART-BRIEF.md:233, BUILD:1389, V0:2762, design/22af-findings.md:414) |
| 163 | — | The identity block: accounts-lite (handle + friend code) growing into real accounts with auth, password reset, the deletion flow both stores require, the COPPA age gate that applies BEFORE money, and server-side seen-question tracking | me | open | census 08-24 (BUILD:261,263, APP-AND-MONEY:108,117) |
| 164 | — | The infrastructure block: relay rooms live in memory with a 45s grace so a restart drops every live game, and the 40MB of art needs a real asset pipeline before any binary | me | open | census 08-24 (APP-AND-MONEY:113,139) |
| 165 | — | The pride economy, the app-and-money doc's explicit "build this": rivalry pages, standings, streak records, the cosmetic debt board, trash-talk cards | me | open | census 08-24 (APP-AND-MONEY:276). If it does not scratch the itch, 122 carries the counsel question |
| 166 | — | The player-journey trio: the Friendly vs Competitive toggle at setup, the tip-off head start scaled by ratings (does a Brunson-type ever win a tip), and the postgame heat highlights reel | me | open | census 08-24 (BUILD:61,63,65) |
| 167 | — | The CPU adaptive layer that studies your game | me | open | census 08-24 (BUILD:224) |
| 168 | — | Light-up tile effects, the FL-5 box that never ticked when shot effects shipped | me | open | census 08-24 (BUILD:291) |
| 169 | — | Blind simultaneous inbound setup: both sides stage, then reveal | me | open | census 08-24 (BUILD:371) |
| 170 | 22e/f | The inspect block: a player inspect panel mid-game, the same stat block at squad-pick, and the roster drawer (you cannot see your own squad's names mid-game) | me | open | census 08-24 (BUILD:376,2646) |
| 171 | — | STORY MODE, the headline future mode | me | open | census 08-24 (BUILD:381). Distinct from 113, the career spine |
| 172 | — | Era-sliced player-card stats (a 2000s game shows LeBron's 2000s line) and the year-range slider that needs the same per-year data | me | open | census 08-24 (BUILD:788,3096). Data side lives in 143's statsByEra |
| 173 | 22s | Roster-targeted question weighting in the draw, the answer to "make rosters matter" | me | open | census 08-24 (BUILD:804) |
| 174 | 22ag | The spaced-repetition question rotation with graded degradation, plus the three missing tags it needs (answer_key, question_shape, team_id) | me | open | census 08-24 (BUILD:1543). 131 on the active list is its floor version |
| 175 | — | The `impact` opt-in flag cutting across tier (the Jeremy Lins) | me | open | census 08-24 (BUILD:1023) |
| 176 | 5b.2 | The ask-it-in-English third tab: text-to-query architecture, the unanswerable-query demand log, and the two costs it carries (breaks static-on-Pages; query logging is a decision) | me | open | census 08-24 (BUILD:1060-1089). 65 measures answerability first and stays where it is |
| 177 | 22ab | The backcourt loiter timer (8/10 seconds as actions, warn at 4), recommended then deferred until spacing settled; spacing settled | me | open | census 08-24 (BUILD:2006) |
| 178 | — | The team-identity refactor remainder: 8 hardcoded Orange/Blue strings, 43 hardcoded hexes, the figurine sprite tint pass, the colorway guardrails | me | open | census 08-24 (BUILD:3234-3279) |
| 179 | — | Court theme becomes a room-shared setting (two people in one room see different courts today), prerequisite for courts as spoils | me | open | census 08-24 (BUILD:3398) |
| 180 | — | Tournament bracket mode: seeded field, the bracket screen between games, a championship ceremony, and the TV tournament variant | me | open | census 08-24 (BUILD:3217,2875) |
| 181 | — | The loser's diagnosis card ("what you knew: 8/12 on 1990s NBA"), the data for it exists today | me | open | census 08-24 (BUILD:2624) |
| 182 | — | Seasonal and monthly themed packs, the return cadence and the answer to bank exhaustion | me | open | census 08-24 (BUILD:2633). 84's month card is a different object and stays |
| 183 | — | **The career decision desk**: chapters vs full time-travel for The Jacket, what a chapter WIN is ("it blocks any build"), fusing specifics, handicap dial mechanics, figurine reveal staging, Big3 rules fidelity, the shop catalogue, All-Star structure (one package or per-league), and whether squad select ever becomes a draft | Aaron | blocked | census 08-24 (BUILD:1443,1537,3080-3171,3136, design/PLACES-ART-BRIEF.md:568). Nine rulings that gate 113-117 |
| 184 | — | **The possession decision desk**: cutter mechanics (four options filed), UP THE FLOOR's three proposals, the closeout reaction beat, the D35 pacing levers (speed the middle, escalate the end), the defence-side nudge, the D37 CALL-AND-SLIDE recommendation, the 22ai playbook picks, the skill escape hatch plus the corner-pricing drill, and the two read-backs Claude owes first (defensive tax, THE ONE DEFENSE in plain words) | Aaron | blocked | census 08-24 (V0:1263,1294,1312,1369,1857,1869, BUILD:2067,2099,4433, design/22af-findings.md:246,311) |
| 185 | — | **The presentation decision desk**: wrong-answer red, the D28 colour leftovers, the squad reveal treatment, his top picks from the motion menu, whether the new menu stays default (and deleting the loser), the classic menu's unjudged watermark, the banner book red pen, the possession walkthrough artifact redo, the Daily Five's respaced spots awaiting his eye plus the round-2 stop positions and the desktop cover-crop call, the three 08-16 gym questions, and the coach budget with the LIST TWO filing | Aaron | blocked | census 08-24 (V0:1128,1384,1893,1994,1997,1282,545, BUILD:3541,3651,3620, design/INTERACTION-PROPOSAL.md:32,53) |
| 186 | — | **The research-go desk**: the 22aj engaging-gameplay run (c), 22af run two (catch-up design, longevity, not-a-fan reach, and his own "could this be a physical board game"), the TV reveal couch playtest, and THE DEPTH QUESTION's seven parked directions | Aaron | blocked | census 08-24 (V0:1850, BUILD:2043,2141,2214, DESIGN:664) |

## 4 · RESEARCH · after the 20

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 81 | — | 22af Runs D and E, the player and pacing studies | me | open | asked 08-03, neither gates the twenty |
| 82 | V38 | Reaching 1,000 needs NEW research, not more digging | me | open | the corpus is already mined, measured 08-07; this is the plan for card 1,001 onward |
| 143 | S1/S2/S4/S6 | The stat holes: World/FIBA ppg 39/101, BIG3 ppg 11/35 (keeps BIG3 out of the era-stat features), bpg 321/744, and the per-era `statsByEra` packages that era-sliced cards need | me | open | census 08-24 (RESEARCH-BACKLOG:1730-1799) |
| 144 | S7 | The stat fill run: 364 players, 2,007 field fetches, the list already built and batched | me | open | census 08-24 (RESEARCH-BACKLOG:1739). Prerequisite for 66, ratings derivation |
| 145 | P2-P9 | The player runs: NBA role and deep bookends, the WNBA sweep, World deep, streetball and fives deep, college icons, gap-fill, and cross-league careers (7 of 744 recorded, floor ~70, blocked on no stable pid) | me | open | census 08-24 (RESEARCH-BACKLOG:1811,1822, BUILD:1743) |
| 146 | H2-H4 | The history runs: early pro men (ABL/NBL/BAA, also settles the ABA merge and the pre-1960 era-picker gap where the data exists but no picker reaches it), the H3 brief Claude has owed since 07-29, and the H4 league-and-era model run | me | open | census 08-24 (RESEARCH-BACKLOG:1912-1948, BUILD:5101) |
| 147 | 22u | **The taxonomy rulings desk**: eras per league (NBA currently starts in the 1910s), the packs table contents, renaming one of the two unrelated "tier" meanings, what World means before EuroLeague splits, Olympics yes/no, high-school as a pack, the gender structure (128 people recorded as men on no evidence), the three Original Celtics filed NBA before 1946, the five fives rows past 1950, college ICONS vs a full league, and G League build-or-cut | Aaron | blocked | census 08-24 (BUILD:1757-1944, RESEARCH-BACKLOG:1879). One planning conversation he asked for on 08-07 covers most of it (BUILD:1802,1833) |
| 148 | 22u | The taxonomy data debts: no league declares first/last years (11 of 11 null), a second parallel era system with 41 fact links, D11 at 838/838 positions and ratings with no era, per-person team years empty, the fives league card missing so its 20 players cannot be dealt, MODES lineups for four leagues only, three decades with no small forward, and the street 5v5/4v4/3v3 selector that leaves two shapes unreachable | me | open | census 08-24 (BUILD:1856-1916, RESEARCH-BACKLOG:1870-1900) |
| 149 | — | League names proposal (GLOBAL dies with the world split), the missing-leagues research, and the wheelchair + FIBA 3x3 research that is IN with the ship decision after | me | open | census 08-24 (BUILD:1838,1941-1952) |
| 150 | 5b.1 | The completeness machinery: the bulk acquisition pipeline that does not exist, the Wikidata coverage measurement nobody has made, and the never-searched government archives, out-of-copyright newspapers and league record books ("the highest-value next search") | me | open | census 08-24 (BUILD:876-956) |
| 151 | C1-C5 | The compliance block before any store listing: audit every shipped asset for logos and likenesses, confirm commercial art licensing, run the trademark search on the name, and wire the gender-neutral sweep into the merge gate | me | open | census 08-24 (RESEARCH-BACKLOG:1963-1980). 8 covers fonts only; 76 covers naming counsel only |

## 5 · NICE TO HAVE

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 83 | option A | Raise a banner to the rafters at 30 | Aaron | open | his call, the recommended one of four celebration ideas |
| 84 | option B | The month card, a trading card minted for the month | Aaron | open | |
| 85 | option C | A championship ring in a trophy case | Aaron | open | |
| 86 | option D | The stamp itself levels up | Aaron | open | cheapest of the four |
| 87 | — | Upgrade the branch archive to a real tag | Aaron | open | explicitly optional |
| 88 | — | Test-kitchen verdicts each round: is the loop fun, best and worst mechanic | Aaron | open | a ritual, not a task |
| 125 | — | **The project management website**, the one he could use for every project | Aaron | open | his words 08-24, the day the visibility law landed: "This is why I so desperately wanted to build that project management website for myself." The seed already exists and is portable: the plain-text list schema, `tools/list-artifact.py`, the drift detector and the shipped ledger |
| 187 | — | The idea-bank shelf, accepted for later as one visible row: quiet adaptive difficulty, handicap by knowledge domain with wagering, name-the-possession share text, voice call-the-shot (the coordinate grammar already ships), luck perks, in-game bad-card flagging by the twenty, the replay hide toggle, and lane-guard steals with the no-look counter | me | open | census 08-24 (BUILD:2650-2670,2822,3212,3302,3103). Each graduates to its own row the day it is picked |
| 188 | — | The private admin dashboard page (NOW / DESK / BUGS / CALENDAR / PROGRESS), recommended and never ruled | Aaron | open | census 08-24 (BUILD:3584-3604). Cousin of 125 and probably the same build |
| 120 | — | The scoreboard and play-by-play redesign | Aaron | blocked | harvested 08-24 from V0's not-in-V0 block; blocked on his reference art, as it was there |
| 121 | — | Hype sheet v2 | Aaron | open | harvested 08-24 from V0's not-in-V0 block; commitment never ruled, so it lands here where promising less is the cheaper mistake |
| 122 | — | **Going native, and the money question** | Aaron | blocked | harvested 08-24 from APP-AND-MONEY.md: the native-app decision and the real-money question are one decision in two parts, the doc is the map, and its own first rule stands: gaming counsel in writing before a single dollar moves |

## 6 · SCRAPPED

| # | was | item | whose | status | note |
|---|---|---|---|---|---|
| 97 | — | Render a sourced `.obj` hoop frame through the game's own projection | me | open | merged into 2 the day it was filed. Once the frame became a sourcing job the two were one piece of work, and two rows for one job is how a list starts lying |
| 89 | row 28 | Fix the figurine rings by moving the colour zones | me | open | wrong diagnosis, reverted. It was a depth-sort bug, see row 29 and BUILD 08-19 |
| 90 | row 13 | Bring the momentum tax back as fewer tiles on a crossover | me | open | THE ONE DEFENSE replaced it, 08-18 |
| 91 | — | Method A, the old turn structure | me | open | Aaron 08-17: *"we are goin with method B... and remove the option to switch"* |
| 92 | — | The spacing picker | me | open | retired by THE ONE DEFENSE, 08-18 |
| 93 | — | Both Method B switches | me | open | Aaron ruled full range for everyone, no toggles |
| 95 | — | `tools/grid-legibility.mjs` | me | open | returned non-monotonic nonsense, deleted 08-19 |
| 96 | — | An analytic camera model for the court fit | me | open | disagreed with the renderer by 1.9x; measure on real renders instead |
| 105 | — | The in-game coach button (the philosopher, bottom left, tap for a tip or a speed dial) | me | open | **MAY RETURN, his tag.** Aaron 08-23: *"scrap it but make it so we can bring it back if we needed... If we get enough feedback that it's needed then great."* Nothing was ever shipped, so the bring-back kit is complete: both option boards (<https://claude.ai/code/artifact/7264579f-52ca-4acf-b330-6d81d2eee3ca> placements, <https://claude.ai/code/artifact/e815d3c9-8100-471f-8322-5a38cf466466> the tap, dial tightened per his ruling) and the render harnesses `tools/coach2-shots.mjs` and `tools/coach3-shots.mjs`, which rebuild every frame from the live game. The trigger to reopen is TESTER FEEDBACK asking for mid-game help |
| 124 | — | The easier "open floor" mode | me | open | **MAY RETURN.** Aaron 08-18: *"let's scratch the easier mode altogether for now, it's fine."* The worked-out shape is stored whole in BUILD.md § 5b.3, the idea shelf; row added 08-24 so the scrap is findable from the list too |

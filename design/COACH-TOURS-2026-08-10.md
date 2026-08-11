# The Coach, organized · tours and triggers

**Written 2026-08-10, after Aaron tried to file LIST TWO and it fought him.**

> *"The coach board was difficult, I am really unsure about these... I think
> the first moment before tip off the coach should do the same thing I showed
> you from my coldest call game. Go around highlighting things in the screen
> (dimming the rest of the screen) and explaining as you hit next... Then
> almost everything else should happen when triggered. But the thing is when
> something happens the coach can have multiple steps, like when you open the
> pause menu for the first time, when you see a win screen for the first
> time... some of the things listed didn't even make sense to me (jargon) and
> some felt repetitive... could use your take on this one."*

He is right on all three complaints, and his model is better than the list it
replaces. This file is the model formalized, MY filing of all 256 LIST TWO
rows into it, and the tour scripts in plain language. **Status: my take, laid
out for his ruling. Nothing below is locked until he says so.**

The catalog stays `design/COACH-AND-DRILLS.md` LIST TWO (what each moment IS).
This file owns WHERE EACH ONE GOES. The drill side's equivalent ruling lives
in `design/COACH-BOARD-2026-08-10.md`.

---

## The model · five kinds of moment, not 256 equal rows

1. **THE TOURS (3).** Multi-step spotlight walks using the game's own Coldest
   Call device, already shipped in `coach.js` (the veil dims, a hole is cut
   around the subject, the ring pulses, the card sits opposite the hole).
   Add: a **Next →** button, a step counter (2 OF 5), and **Skip the tour**.
   They fire at fixed points in the FIRST game only:
   - **T1 · THE LAY OF THE LAND** · right after the hello, before the
     toss-up, either way. 5 steps.
   - **T2 · YOUR FIRST POSSESSION** · the first time you have the ball. 4
     steps, then the coach steps back and lets you play the possession.
   - **T3 · YOUR FIRST STOP** · your first defensive turn. 4 steps. If you
     lost the tip, T3 happens before T2 and its first line says so.

2. **TRIGGERED TOURS (9).** Aaron's second insight: a trigger can have
   multiple steps when a whole SCREEN arrives at once. First card ever, first
   time in the Daily Five, first Heat Check, the pause menu, the end screen,
   first setup flow, and (added in his second batch, 08-10: *"give a pass
   over on the other tours that need to exist"*) the first main-menu open
   and the first time in the Gym, both upgraded from single triggers. Same
   device, 2-4 steps, once per phone. The first online room stays a single
   card (CM-ON-11).

3. **TRIGGERS (the bulk of the coach).** One card, once per phone, at the
   exact moment the thing first happens. Never two in the same possession;
   a suppressed trigger re-arms instead of dying (CM-INT-10's rule).

4. **GUARDRAILS (conditional triggers).** Fire only when a situation calls
   for it, not on a schedule: picking a thin card pile, one reshuffle left,
   "to 21" on a first game, All-Star CPU on a first game, a blowout loss.

5. **THE SCREEN SAYS IT (not the Coach at all).** The biggest correction to
   LIST TWO: rows that are really interface copy. A status line, a subtitle,
   a confirm dialog. No card, no once-per-phone bookkeeping, no Philosopher.
   The server waking up is a fact on the screen, not a visit from a mentor.

Plus two shelves that keep rows without building them now: **SMART COACH,
LATER** (nudges that need play-pattern tracking: "three opens, no game
started") and **PARKED** (moments for unbuilt features, same device as the
drill board's parked rows).

**What this does to the budget question.** The old open question was "how many
coach cards may interrupt game one." Under this model game one is: the hello,
three tours (13 steps total, each skippable as a block), the first-card
mini-tour, and then only triggers as things actually happen, at most one per
possession. The seventy-seven-MUST pileup is structurally impossible, because
the walkthrough load moved into three tours a player taps through in about
ninety seconds combined. **Recommendation: this replaces the twelve-card
budget. Aaron rules.**

---

## The tour scripts · plain language, no jargon

**The writing law for every word the Coach says (Aaron, 08-10, second
batch):** *"no em dashes, you are speaking to a player not me, no AI speak or
catch phrases, not Ted talky stuff just plain English. Err on the side of
they won't know."* Applied to every line below. If a line names a mechanic,
the line says what the mechanic does in words a first-timer can act on.

Every line here is written to be heard by someone who has never seen the game.
The subject in CAPS is what the spotlight cuts out of the dim.

### T1 · THE LAY OF THE LAND · before the toss-up · 5 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE SCOREBOARD | "Up top: your score, their score, and the clock. Keep one eye up here all night." |
| 2 | THE TARGET | "First to 11 wins tonight. Every game says its target right here." |
| 3 | YOUR SQUAD (the orange pieces) | "The orange five are yours. Guards cover ground, bigs own the paint." |
| 4 | A GREEN TILE, AN AMBER TILE, A RED TILE | "One rule to remember: colour means HOW HARD THE QUESTION IS. Green easy, amber medium, red hard. Everywhere, always." |
| 5 | THE COACH'S OWN CARD | "I'll pop in the first time things happen. Tap ⚙ and switch me off any time, no hard feelings." |

### T2 · YOUR FIRST POSSESSION · first time you have the ball · 4 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | YOUR BALL-HANDLER | "You've got the rock. Tap any of your five to pick them up." |
| 2 | THE LIT TILES | "Orange tiles are free moves. RED tiles mean somebody's in the way, and beating him costs a question." |
| 3 | YOUR OTHER FOUR | "One action a turn: move ANY of your five, pass, or shoot. Moving a man without the ball never costs a question. That's how you set a screen." |
| 4 | THE CONFIRM BUTTON | "Nothing happens until you hit Confirm. Stray thumbs never cost you a possession." |

Then he goes quiet and the possession is theirs. The card that resolves their
first action is the FIRST CARD tour below, arriving exactly when a card first
matters.

### T3 · YOUR FIRST STOP · first defensive turn · 5 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE FULL FLOOR | (won the tip:) "They've got it, so now you play the other half." (lost the tip:) "Lost the tip? Then defense is your first job tonight. Most people never expect that." |
| 2 | ONE OF YOUR DEFENDERS | "They move one man a turn, same as you. After every move they make, you answer: slide one defender, or stay put." |
| 3 | THE RINGS AT THEIR FEET | "Every defender wears a ring that says what he is doing right now. Amber: he is guarding a path, and anyone driving through him has to answer a question. Double red: he is on a shooter, and any shot over him gets contested. Broken teal: he got screened, and he cannot stop anybody until you move him." |
| 4 | THE :12 | "Defense thinks fast: twelve seconds to slide. It pauses whenever a card is up." |
| 5 | THE ↺ BUTTON | "Missed what they just did? Tap ↺ and watch it again, as many times as you want. It costs you nothing, but the twelve keeps running." |

### The 9 triggered tours · full scripts

In the order a first session actually meets them. Every script table below is
parsed by `tools/coachtour-artifact.py`, so the demo page and this file
cannot disagree.

### TT:MENU · FIRST OPEN · the first main-menu load, right after the hello · 4 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE DAILY FIVE STAMP | "Start here. Ten cards a day, the same ten for everybody, and it is the fastest way to learn the game." |
| 2 | THE GYM TILE | "The Gym is the practice court. No score, no clock, easy questions. Nothing in there counts, everything in there teaches." |
| 3 | THE PLAY ROW | "Three ways to play somebody: the computer, a friend on this phone, or a friend anywhere with a room code." |
| 4 | THE GEAR | "Sound, music, court labels and me: it all lives under the gear, and every phone keeps its own settings." |

### TT:SETUP · FIRST SETUP · first time in the vs-CPU setup flow · 3 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE STEP COUNTER | "A few quick calls before we play. The defaults are fine for a first game, so you can just keep hitting the big button." |
| 2 | THE SQUAD CARDS | "Position is speed. Point guards go three squares a turn, centers go one, everybody else goes two. A good five mixes range and muscle." |
| 3 | THE HOUSE RULES | "These change how the game plays, not how it looks. Each one has a drill in the Gym if you want to feel it before you pick." |

### TT:FIRST-CARD · THE FIRST CARD · the first question card ever flips (the toss-up), clock held · 3 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE CARD | "Your first card. Answer to play. Get it right and the play happens. Get it wrong and the play fails: shots miss, passes fly out, drives get stopped." |
| 2 | THE TIER BADGE | "The colour says how hard: green easy, amber medium, red hard. The words say what you are playing for, and this one plays for the ball. Points come from where you shoot: 3 behind the cream line, 2 inside it." |
| 3 | THE :15 | "Fifteen seconds, and it burns while you read. It is holding still right now because I am talking. It will not for the next one." |

### TT:THE-CALL · THE CALL · you win the toss-up, the choice is on screen · 2 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE HEADLINE | "You won the toss-up, so you get the Call. Two prizes on the table. You take one, they get the other." |
| 2 | THE TWO PRIZES | "First pick locks your five before they touch the player pool. Two more gives you 7 reshuffles instead of 5, but then they pick first. There is no wrong answer here." |

### TT:PAUSE · THE PAUSE MENU · first open, clock already stopped · 3 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE PAUSED TITLE | "You paused it. The clock is stopped and nothing is lost. Take your time." |
| 2 | THE THREE BUTTONS | "Resume picks up exactly where you were. Restart starts the night over. Quit keeps nothing, and it warns you before it does." |
| 3 | THE RULEBOOK BUTTON | "The Rulebook is safe to open mid-game. Your board keeps. Come back whenever." |

### TT:END · THE FINAL BUZZER · first game ends, win or lose · 3 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE FINAL SCORE | (win:) "That's a win. The slam is yours." (loss:) "They got you tonight. Every legend has an 0-1." |
| 2 | THE FINAL LINE | "That score is the story of the cards. Every bucket up there started as a question somebody answered." |
| 3 | THE TWO BUTTONS | "Run it back for the rematch. Or head to the menu: the Daily Five and the Gym both make you better before the next one." |

### TT:DAILY · THE DAILY FIVE · first entry ever · 3 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE HEADER | "Ten cards, one rack, and it is the same ten for everybody today. Tomorrow brings a new ten." |
| 2 | THE RACK | "Five shots first, then five stops. First you score, then you defend." |
| 3 | THE CLOCK | "Twelve seconds a card, and running out counts as a miss. Trust your first answer." |

### TT:HEAT-CHECK · THE HEAT CHECK · your first perfect ten in the Daily Five · 2 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE MYSTERY CARD | "Ten for ten unlocks this. One mystery player, and the clues drop in one at a time. Name him." |
| 2 | THE GUESS BOX | "Guess whenever you want: the earlier you get him, the more it is worth. Close spellings count, I am not grading penmanship." |

### TT:GYM · FIRST TIME IN THE GYM · first entry · 3 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE ROOM | "Practice court. No score, no clock, and the questions stay easy. Nothing in here counts, so try things." |
| 2 | THE STATIONS | "Each station is one drill, and each drill teaches one rule in about five taps. Finished ones get checked off." |
| 3 | THE RULEBOOK STATION | "The Rulebook lives in here too. Every rule in writing, and the orange buttons jump you straight into the drill for that rule." |

The GYM script is written against the ruled Drill Room layout
(`design/COACH-BOARD-2026-08-10.md`); it ships with that build. Until then
the Gym tile opens the Rulebook, which needs no tour.

**Settings gets no tour. RULED by Aaron 08-10: *"agree no tour for
settings."*** Eight of its nine catalog rows filed SCREEN or CUT: a settings
page that needs a guided walk is a settings page that failed. The one moment
that needs the Coach is switching the Coach OFF, and that stays a single
trigger (CM-SET-02).

---

## The filing · all 256 rows, five verdicts and two shelves

Verdict key: **T1/T2/T3** into that tour · **TT:x** into that triggered tour ·
**TRIG** single trigger · **GUARD** conditional guardrail · **SCREEN** the
screen says it, no coach card · **FOLD→id** merged into that row's moment ·
**LATER** smart coach shelf · **PARKED** feature not built · **CUT** dies
outright, with the reason.

### The fourteen live today

| id | verdict | note |
|---|---|---|
| CM-EXIST-01 hello | TRIG · keeps | stays the first voice, now hands off to T1 |
| CM-EXIST-02 select | T2 | absorbed into step 1 |
| CM-EXIST-03 confirm | T2 | absorbed into step 4 |
| CM-EXIST-04 card | TT:FIRST-CARD | rebuilt as the 3-step card tour |
| CM-EXIST-05 meter | TRIG · keeps | first contested look |
| CM-EXIST-06 slide | T3 | absorbed into step 2 |
| CM-EXIST-07 cross | TRIG · keeps | first red tile |
| CM-EXIST-08 battle | TRIG · keeps | first sudden death of any kind |
| CM-EXIST-09 tip | TRIG · keeps | the jump ball |
| CM-EXIST-10 inbound | TRIG · keeps | gains one line: the cutter (CM-GAME-29) |
| CM-EXIST-11 fire | TRIG · keeps | gains the payoff lines (CM-HEAT-05) |
| CM-EXIST-12/13 install | SCREEN | install.js owns them already |
| CM-EXIST-14 daily resume | SCREEN | the resume banner is the screen's job |

### 0 · Cold open

| id | verdict | note |
|---|---|---|
| CM-COLD-01 | TRIG · live already | the menu hello (08-07 slice) |
| CM-COLD-02 | LATER | needs open-count tracking |
| CM-COLD-03 | LATER | needs absence tracking |
| CM-COLD-04 | CUT | opening the installed app is its own reward |
| CM-COLD-05 | TRIG | invite-link open: "you're joining someone's room" |
| CM-COLD-06 | CUT | the shortcut lands you IN the Daily Five, which explains itself (TT:DAILY) |
| CM-COLD-07 | SCREEN | an offline banner, not a mentor visit |

### 1 · Loading

| id | verdict | note |
|---|---|---|
| CM-LOAD-01 | SCREEN | a "still lacing up" status line |
| CM-LOAD-02 | CUT | nobody reads a manifesto on a spinner |

### 2 · Main menu · 18 rows become 2 coach moments

| id | verdict | note |
|---|---|---|
| CM-MENU-01 | TT:MENU | upgraded from TRIG in the second batch: the 4-step first-open tour |
| CM-MENU-02 | FOLD→CM-MENU-01 | same moment, now the tour's step 1 |
| CM-MENU-03/04/05 | SCREEN | the stamp already wears its states |
| CM-MENU-06/08 | SCREEN | SOON tiles carry their own one-liners |
| CM-MENU-07 | SCREEN | the Gym tile's subtitle |
| CM-MENU-09/10/12/13/14/15 | SCREEN | tiles and subtitles; jargon rows translated: the Rolodex row meant "the three play modes list" |
| CM-MENU-11 | FOLD→CM-ON-01 | the gate explains itself at the gate |
| CM-MENU-16 | TRIG | after your first finished game: what next |
| CM-MENU-17 | CUT | scolding-adjacent; the END tour already handled the exit |
| CM-MENU-18 | LATER | needs pattern tracking |

### 3 · The Gym

| id | verdict | note |
|---|---|---|
| CM-GYM-01 | TT:GYM | upgraded from TRIG in the second batch: the 3-step gym entry tour |
| CM-GYM-02/03 | SCREEN | station labels and previews are B14 UI |
| CM-GYM-04 | CUT | the drill diploma IS this moment (drill room, ruled) |
| CM-GYM-05 | TRIG | all drills done: the push into a real game |
| CM-GYM-06/07/09 | SCREEN / CUT / CUT | progress marks are B14 UI; quitting needs no speech; the losing-player line was me inventing melodrama |
| CM-GYM-08 | RULED already | the Rulebook is the eighth station |

### 4 · Rulebook · 5 · Settings

| id | verdict | note |
|---|---|---|
| CM-RULE-01 | SCREEN | the header line already says it |
| CM-RULE-02 | TT:PAUSE | "the Rulebook is safe mid-game" is that tour's step 3 |
| CM-RULE-03 | LATER | the right-topic trick needs game→rulebook plumbing |
| CM-RULE-04 | CUT | explaining an absence draws attention to it |
| CM-SET-01/05/06/08 | CUT | settings that explain themselves |
| CM-SET-02 | TRIG | turning the Coach off: confirm, say the way back, go quiet |
| CM-SET-03/04 | SCREEN | shipped: the re-arm button and its counter line |
| CM-SET-07 | SCREEN | one sub-line under the toggle |
| CM-SET-09 | SCREEN | the confirm dialog carries the warning |

### 6 · The Daily Five · 24 rows become 1 tour + 3 triggers

| id | verdict | note |
|---|---|---|
| CM-DAILY-01/02/03 | TT:DAILY | the 3-step entry tour |
| CM-DAILY-04 | CUT | the right-answer theatre is B5c's job, with sound not speech |
| CM-DAILY-05 | TRIG | first miss: what it cost, the run continues |
| CM-DAILY-06/07 | SCREEN | the round break is its own screen; give it one strong line of copy |
| CM-DAILY-08/09/10 | TT:HEAT-CHECK | the 2-step tour; the forgiving-matcher line is its step 2 sub-line |
| CM-DAILY-11/12 | SCREEN | the result panel says it |
| CM-DAILY-13/14 | SCREEN | the receipt legend and share button explain themselves |
| CM-DAILY-15 | SCREEN | the stamp's done-today state |
| CM-DAILY-16 | SCREEN | live banner already |
| CM-DAILY-17/18/19 | SCREEN | streak states on the stamp and calendar; the broken-streak line stays KIND and stays once |
| CM-DAILY-20/21 | SCREEN | calendar legend |
| CM-DAILY-22 | TRIG | leaving mid-run: held, not lost |
| CM-DAILY-23 | PARKED | B11 |
| CM-DAILY-24 | SCREEN | the midnight edge is an engineering rule, not a speech |

### 7 · Vs the CPU setup · 37 rows become 1 tour + 6 guardrails

| id | verdict | note |
|---|---|---|
| CM-CPU-01 | TT:SETUP step 1 | |
| CM-CPU-02/03/05 | SCREEN | the count and the tick-boxes show it |
| CM-CPU-04 | GUARD | thin pile picked: warn before, not after |
| CM-CPU-06/07/08 | SCREEN | era screen copy; All-Time note rides the tile |
| CM-CPU-09 | GUARD | one thin decade picked |
| CM-CPU-10 | FOLD→TT:SETUP step 2 | |
| CM-CPU-11 | TT:SETUP step 2 | position = speed, the one thing that must be said |
| CM-CPU-12/13 | SCREEN | tap-for-stats and pips are card UI |
| CM-CPU-14 | SCREEN | the allowance counter IS the explanation |
| CM-CPU-15 | GUARD | one reshuffle left |
| CM-CPU-16 | SCREEN | a rare-squad flourish belongs to the reveal, not the coach |
| CM-CPU-17 | SCREEN | the Lock In button's own sub-line |
| CM-CPU-18/19/20/21 | SCREEN | the locker room explains itself |
| CM-CPU-22/28 | TT:SETUP step 3 | spacing changes how the game plays |
| CM-CPU-23 | SCREEN | each format chip carries its minutes |
| CM-CPU-24 | GUARD | "to 21" on a first game |
| CM-CPU-25/26/27 | SCREEN | the level picker's copy; the FOUR FLOORS drill teaches the rest |
| CM-CPU-29/30/31/32 | CUT | taught by THE FOUR FLOORS drill (ruled); screen keeps one line each |
| CM-CPU-33 | CUT | over-coaching a settings toggle |
| CM-CPU-34 | SCREEN | the CPU level copy says what changes |
| CM-CPU-35 | GUARD | All-Star on a first game |
| CM-CPU-36 | CUT | last look needs no voice |
| CM-CPU-37 | SCREEN | jargon translated: the pre-tip splash card. It is skippable and its own skip button says so |

### 8 · Local VS · 9 · Online

| id | verdict | note |
|---|---|---|
| CM-LOCAL-01 | TRIG | one card: pass-and-play, and the golden rule (don't read their card) |
| CM-LOCAL-02/03/04/05 | SCREEN | the names and colours screens explain themselves |
| CM-LOCAL-06/07 | SCREEN + build item | the handover needs a pass-the-phone CURTAIN in the game, which is a build task, not a speech; the curtain's copy carries the etiquette |
| CM-LOCAL-08 | SCREEN | the handicap picker, same copy as CPU setup |
| CM-ON-01..10, 13..18 | SCREEN | all of it: gate copy, room codes, waiting lines, the waking server, drops and reconnects. Status is the screen's job, and the Coach is silent online anyway |
| CM-ON-11 + CM-ON-12 | TRIG | ONE card before your first online tip: "you only see YOUR cards; and I go quiet online, clocks are live" |

### 10 · Opening ceremony

| id | verdict | note |
|---|---|---|
| CM-OPEN-01 | TRIG · live | the hello |
| CM-OPEN-02 | CUT | the jumbotron stays uninterrupted (his NO stands) |
| CM-OPEN-03/04 | TT:FIRST-CARD adjacent | the toss-up IS the first card; its tour covers buzz-to-answer |
| CM-OPEN-05 | SCREEN | the early-buzz penalty flashes on the buzzer itself |
| CM-OPEN-06 | TT:THE-CALL | the 2-step choice tour |
| CM-OPEN-07 | SCREEN | losing line rides the toss-up result |
| CM-OPEN-08 | TRIG · live | the jump ball |
| CM-OPEN-09 | T3 step 1 | the lost-the-tip variant line |

### 11 · Offense · 32 rows become 4 tour steps + 12 triggers

| id | verdict | note |
|---|---|---|
| CM-GAME-01 | TRIG | camera, first touch of the court |
| CM-GAME-02/03/04 | T2 | steps 1, 4, 3 |
| CM-GAME-05 | TRIG | first pass: short free, long asks |
| CM-GAME-06 | FOLD→CM-GAME-05 | the lane line joins the pass card |
| CM-GAME-07 | TRIG | pass sailed out: why |
| CM-GAME-08/09 | TRIG | first shot: distance sets the question; open looks splash, no meter |
| CM-GAME-10 | TRIG · live | the meter |
| CM-GAME-11 | TRIG | first perfect release: you just denied their block |
| CM-GAME-12 | LATER | "never taps the meter" needs tracking |
| CM-GAME-13 | TRIG | first three: cream line is WORTH, colour is HARD |
| CM-GAME-14/15 | FOLD→CM-GAME-13 | the corner and logo lines join it |
| CM-GAME-16 | TRIG · live | red tile |
| CM-GAME-17 | TRIG | dark red: the deep cross |
| CM-GAME-18 | TRIG · live | sudden death (the generic battle card) |
| CM-GAME-19 | FOLD→CM-GAME-18 | outcome line |
| CM-GAME-20 | TRIG | first screen set on purpose |
| CM-GAME-21 | TRIG | first time screened (offense side) |
| CM-GAME-22/23 | TRIG | ONE card at the key warning; the whistle is the lesson's second half |
| CM-GAME-24/25 | TRIG | ONE card at the backcourt warning |
| CM-GAME-26/27 | TRIG | ONE card at first :06; the violation is its own consequence |
| CM-GAME-28/29 | TRIG · live | inbound, cutter line folded in |
| CM-GAME-30 | TRIG | long rebound, nobody home |
| CM-GAME-31/32 | LATER | pattern nudges |

### 12 · Defense · 18 rows become 4 tour steps + 7 triggers

| id | verdict | note |
|---|---|---|
| CM-DEF-01/02/03/04 | T3 | the four steps |
| CM-DEF-05/06/08 | TRIG | ONE card, first reach: the button, the two cards, a miss burns the slide |
| CM-DEF-07 | TRIG | first RIP OR GRIP by name |
| CM-DEF-09/10 | TRIG | first contest, chest-vs-closeout folded in |
| CM-DEF-11 | TRIG | first block card |
| CM-DEF-12 | TRIG | denied by perfect release: the feels-unfair one, MUST |
| CM-DEF-13/14 | TRIG | first rim battle, bigs' edge folded in |
| CM-DEF-15 | TRIG | screened on defense |
| CM-DEF-16 | TRIG | forced their clock: a win with no highlight |
| CM-DEF-17 | SCREEN | the board banner says it |
| CM-DEF-18 | LATER | pattern nudge |

### 13 · Cards · 14 rows become 1 tour + 5 triggers

| id | verdict | note |
|---|---|---|
| CM-CARD-01/02/03/09 | TT:FIRST-CARD | the 3-step tour owns anatomy, tier and clock |
| CM-CARD-04 | TRIG | first time the clock beats you |
| CM-CARD-05/06/07/08 | TRIG | one line EACH, first time each price is paid (brick · wasted move · out of bounds · what you gave up) |
| CM-CARD-10 | CUT | repeat-card handling is an engine question, not a speech |
| CM-CARD-11 | GUARD | three wrong in a row: kindness plus the handicap offer |
| CM-CARD-12 | SCREEN | the streak flourish is theatre, B5c's lane |
| CM-CARD-13 | PARKED | B11 |
| CM-CARD-14 | TRIG | handicap live: your cards and theirs differ, said once |

### 14 · Heat · 15 · Frame

| id | verdict | note |
|---|---|---|
| CM-HEAT-01 | TRIG | first pour |
| CM-HEAT-02 | SCREEN | the bar glows on its own |
| CM-HEAT-03 | TRIG | first drop: a quarter, never the lot |
| CM-HEAT-04/05 | TRIG · live | ON FIRE, payoff lines folded in |
| CM-HEAT-06/07/08 | TRIG | ONE card the first time a fire ends, whichever way: any bucket puts it out, including yours |
| CM-HEAT-09 | TRIG | the opponent catches fire |
| CM-HEAT-10 | LATER | needs score-state awareness |
| CM-HEAT-11 | PARKED | fouls |
| CM-HUD-01/02/03 | T1 | steps 1, 2, and the possession arrow rides step 1 |
| CM-HUD-04/05 | SCREEN | the quarter/half screens |
| CM-HUD-06 | TRIG | game point named |
| CM-HUD-07/08 | TRIG | sudden death: ONE two-line card as the board freezes |
| CM-HUD-09 | **T3:5** | replay. **OVERRULED BY AARON, 08-10:** *"replay should be one step in whatever tour makes most sense, maybe the scoreboard or something."* It was CUT on the reasoning that tapping ↺ is free and self-demonstrating, which is true and is not the point: a button nobody knows is there demonstrates nothing. He left the placement to me, so it is T3 step 5 rather than the scoreboard. Reason: on T1 the game has not started and there is nothing to replay, which is the teaching-against-a-blank-screen failure this project has already shipped once. By the first defensive turn the opponent HAS just moved, the ↺ has something in it, and "what did they just do" is the exact question the player is asking |
| CM-HUD-10/11 | CUT | coordinates and music explain themselves by being tapped. Overrule by id if either deserves a card |

### 16 · Ends · 17 · Interruptions · 18 · Jacket

| id | verdict | note |
|---|---|---|
| CM-END-01/02/07/08 | TT:END | the 3-step end tour, win/loss first line |
| CM-END-03 | GUARD | blowout: handicap and Gym, no lecture |
| CM-END-04/05/06 | SCREEN | the end screen's own theatre |
| CM-END-09 | TRIG | abandoning: nothing is lost, gently |
| CM-END-10 | LATER | needs settings memory |
| CM-INT-01 | TT:PAUSE | the 3-step pause tour |
| CM-INT-02/03/04/05/08/09 | SCREEN | survival states are banners and dialogs; the storage warning (INT-09) is the most important SCREEN line in the game |
| CM-INT-06/07 | SCREEN · live | install.js |
| CM-INT-10 | ENGINE RULE | suppressed tips re-arm; already half-true, finish it in the build |
| CM-JKT-01..05 | PARKED | the career's own tutor, when it exists |

---

## The count · computed from the table above, not recalled

Run `python3 tools/coachtours-count.py`; it also PROVES coverage (256 of 256
catalog rows filed, none twice, none invented; it exits red otherwise). Its
output the day this was written, by catalog ROW:

    101 rows → the screen        61 rows → single triggers
     27 rows → triggered tours   24 rows → cut outright
     14 rows → tour steps        10 rows → smart coach, later
      8 rows → parked             7 rows → guardrails
      6 rows → folds              1 ruled already · 1 engine rule
    (plus 10 trigger rows already live; re-run after the second batch,
     which moved CM-MENU-01 and CM-GYM-01 from triggers to tours)

Rows are not cards: several rows share one card (the key warning and its
whistle are one card, two rows). Counted by table LINE, the coach that
actually gets built is:

    3 opening tours (13 steps) · 9 triggered tours (26 steps)
    47 single trigger cards (8 already live) · 7 guardrails

**The first game now costs**: the hello, T1 (5), the first-card tour (3), T2
(4), T3 (4), THE CALL if you win the toss (2), and then triggers only as
things happen. About 90 seconds of tapped-through walking versus the old
list's seventy-seven MUSTs.

## What Aaron flagged, answered directly

- **"Jargon."** Guilty rows translated in place above (the Rolodex row, the
  BRAINS × BUCKETS row, "worth re-ruling"). Every tour line in this file is
  written to be heard cold.
- **"Repetitive."** The four wrong-answer prices appeared in three sections;
  now they are four one-line triggers and one drill (KNOW YOUR CARD).
  "You got screened" appeared per side; each side keeps exactly one card.
- **"Referencing what I wanted but I couldn't tell."** Correct: the scoreboard
  rows, the camera row and the card-anatomy rows were your tours, unnamed.
  They are now literally T1 and the FIRST CARD tour.

## Corrections from Aaron's first walkthrough (08-10, same day)

He caught two rules errors in the scripts and a voice tic. All three fixed
in place above; recorded here because the errors were instructive:

- **"Every player gets one free sidestep" was FALSE.** Checked against
  `game.js` (not memory): on a live possession you get ONE action a turn,
  moving anyone, and the ball-handler is never free, his drives into
  coverage cost a crossover card. Off-ball moves cost no QUESTION but do
  spend the turn. The only genuinely free extra move is the INBOUND cutter:
  one teammate, never the inbounder, once, answered by a defensive slide.
  T2 step 3 now teaches the shipped rule. **Doc drift found while checking,
  for Aaron to rule (item 5 below):** DESIGN.md § 3 still says "one free
  off-ball shuffle (1 square) + one main action" per offensive turn, which
  is NOT what shipped.
- **"Harder pays more" was FALSE**, and worse, this file already knew it:
  CM-GAME-13's own note says "cream line is WORTH, colour is HARD".
  `game.js` (§ the two-question split): POINTS come from the LINE (3 behind
  the cream arc and its corners, 2 inside), TIER comes from the SHOT. The
  badge's colour never changes what a bucket pays. FIRST CARD step 2 now
  says so.
- **"That's the whole war / whole game / whole deal"** is an AI voice tic
  Aaron has banned from all messaging. Swept from these scripts, from the
  shipped drill line in `coach.js`, and gated at 0 by `ai_tics` in
  `tools/audit.py` so it cannot creep back.

## The second batch (08-10, after "I love the tours!")

His words on the model: **"I love the tours!"** The device stands. His
catches and questions, each answered with a measurement, not a memory:

- **"Defense gets one slide, this is unfair, offense can move all their
  players but defense can only move one? We have to change that."** MEASURED
  in `game.js`: the premise is not what ships. Offense gets ONE action a
  turn (move one of the five, or pass, or shoot: `off-select` phase, one
  staged action, Confirm). Defense answers EVERY offensive action with one
  slide (`def-slide` phase), at the mover's speed minus one square
  (`defSlideRange`, minimum 1, and FULL speed when stranded in the
  backcourt). Defense also answers cards on crossovers, contests, blocks and
  steals, so it touches more questions than offense does. It is one action
  against one answer, not five against one. The unfair reading came from the
  first walkthrough's WRONG "free sidestep" line plus a T3 line that never
  said "same as you". T3 step 2 now says it. **No rules change made; if the
  economy still feels wrong knowing this, that is a design call and it is
  his.**
- **"You keep saying pay for it, idk what that means, and players won't
  either."** Right. Swept from the scripts: FIRST CARD step 1 now says what
  actually happens ("the play fails: shots miss, passes fly out, drives get
  stopped", which is `game.js`'s own outcome table: BRICK, SAILS AWAY,
  HE STUMBLES). Nothing else in the scripts says "pay" any more.
- **"Do we ever explain the rings?"** MEASURED: today the colours are
  decoded in exactly one place, the Rulebook's Screens topic. The screens
  DRILL shows a lane reopening but never names the colours; DR-14 "Reading
  the rings" is a MUST drill candidate, not built. And the old T3 step 3
  said "cut off, contest, or force the question", three jobs that do not
  even map onto the three shipped rings. T3 step 3 now decodes all three
  (amber gate · double red contest · broken teal screened) in the words the
  Rulebook already uses.
- **"Was replay-last-move covered in any tour?"** No, nowhere. I called that
  deliberate and CUT it, because tapping ↺ is free, safe and
  self-demonstrating.
  > **AARON OVERRULED IT THE SAME DAY:** *"replay should be one step in
  > whatever tour makes most sense, maybe the scoreboard or something."*
  > He is right and the original reasoning had a hole in it: a control
  > explains itself only to someone who already knows it is there. Now
  > **T3 step 5**, not the scoreboard, because T1 runs before the tip and a
  > replay button with nothing to replay teaches against a blank screen.
  > Checked before writing the line: `replayPlay()` does not touch the
  > clock, so the step says the twelve keeps running rather than claiming
  > it waits.
- **A fresh catch of my own while measuring his:** TT:SETUP step 2 said
  "guards move three". `RANGE={PG:3,SG:2,SF:2,PF:2,C:1}`: only POINT guards
  move three; a shooting guard moves two. The step now says it correctly.
- **RULED: skip skips that tour only.** His answer to open item 3. The
  Coach stays on for triggers after a skip; only Coach OFF (settings) kills
  everything.
  **EXTENDED 2026-08-11, and the extension is BUILT.** Aaron: *"If a person
  skips, make a pop-up appear that says, 'Skip remaining tips?' and
  sublettering, 'You can reference the rulebook in the pause menu or turn
  coach back on.'"* So reaching for the exit now asks, and the answer decides
  which of the two behaviours you get:
  - **Keep them on** is the 08-10 ruling, unchanged: this tour is skipped and
    the Coach stays live for triggers.
  - **Skip tips** is the bigger exit: the Coach goes off entirely, same state
    the Settings switch sets.
  The dialog is the only surface in the game that tells a player where the
  help went, which is the whole reason it exists. Both promises in its copy
  were checked against the shipped pause menu before it went in: **How to
  play** opens the screen titled The Rulebook, and **Settings** holds the
  Coach switch. `tools/skip-confirm-check.mjs` asserts both, so the copy
  cannot outlive the doors it points at.
  **Shipped on the TIP's Coach off button today** (which used to kill the
  Coach in a single tap, silently). `BKCoach.askSkip(onYes)` is the shared
  component, so B7's tour skip raises the same question rather than a second
  dialog that looks like it.
- **The writing law** for all coach copy is recorded at the top of the
  scripts section, in his words.

## Open for Aaron to rule

1. **The model itself** and the filing above (overrule any row by id). The
   tours device itself he has ruled on: "I love the tours!"
2. ~~**Tours replace the twelve-card budget**~~ **RULED 2026-08-11, Aaron:
   "Yes to the tours model."** So there is no coach-card budget number any
   more. The cap is structural instead: game one is the hello, three tours
   (14 steps, each skippable as a block, about 90 seconds combined), the
   first-card mini-tour, and after that only triggers as things happen, at
   most one per possession. **This unholds B7 and B14**, which were the two
   items waiting on it.
3. **The pass-the-phone curtain** for Local VS surfaced here as a real build
   item (it is UI, not coaching); it needs a home on a track if wanted.
4. ~~**DESIGN.md § 3 vs the shipped turn**~~ **MOVED, 08-10, and the move is
   the lesson.** This was written here, correctly, the day it was found. It
   then failed to surface when Aaron asked about that exact rule the next
   day, because `open-items.py` harvests the five root docs and `next.py`
   reads V0's tables, and this is neither. **Filed properly as `V0.md` D32
   (the contradiction, with a recommendation) and D33 (how the defence
   responds if the free move ships).** `open-items.py` now warns when a
   `design/` doc holds a section like this one. The Coach teaches the shipped
   rule either way.
5. **The action economy itself**, only if it still feels unfair with the
   real numbers in hand (see the second batch above). The Coach teaches
   whatever ships. Read beside D32: the numbers are fair for the turn the
   game SHIPS, and change the moment the free off-ball move lands.
6. ~~**Settings gets no tour**~~ **RULED, Aaron 08-10: "agree no tour for
   settings."** Stands as filed: eight of nine rows SCREEN or CUT, and the
   one moment that needs the Coach is switching the Coach off (CM-SET-02).

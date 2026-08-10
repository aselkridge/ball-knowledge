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

2. **TRIGGERED TOURS (7).** Aaron's second insight: a trigger can have
   multiple steps when a whole SCREEN arrives at once. First card ever, first
   time in the Daily Five, first Heat Check, the pause menu, the end screen,
   first setup flow, first online room. Same device, 2-3 steps, once per
   phone.

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

Every line here is written to be heard by someone who has never seen the game.
The subject in CAPS is what the spotlight cuts out of the dim.

### T1 · THE LAY OF THE LAND · before the toss-up · 5 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE SCOREBOARD | "Up top: your score, their score, and the clock. That's the whole war." |
| 2 | THE TARGET | "First to 11 wins tonight. Every game says its target right here." |
| 3 | YOUR SQUAD (the orange pieces) | "The orange five are yours. Guards cover ground, bigs own the paint." |
| 4 | A GREEN TILE, AN AMBER TILE, A RED TILE | "One rule to remember: colour means HOW HARD THE QUESTION IS. Green easy, amber medium, red hard. Everywhere, always." |
| 5 | THE COACH'S OWN CARD | "I'll pop in the first time things happen. Tap ⚙ and switch me off any time, no hard feelings." |

### T2 · YOUR FIRST POSSESSION · first time you have the ball · 4 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | YOUR BALL-HANDLER | "You've got the rock. Tap any of your five to pick them up." |
| 2 | THE LIT TILES | "Orange tiles are free moves. RED tiles mean somebody's in the way, and beating him costs a question." |
| 3 | THE WHOLE SQUAD | "Before your main move, every player gets one free sidestep. Use it: it's twice the offense for nothing." |
| 4 | THE CONFIRM BUTTON | "Nothing happens until you hit Confirm. Stray thumbs never cost you a possession." |

Then he goes quiet and the possession is theirs. The card that resolves their
first action is the FIRST CARD tour below, arriving exactly when a card first
matters.

### T3 · YOUR FIRST STOP · first defensive turn · 4 steps

| # | spotlight on | the Coach says |
|---|---|---|
| 1 | THE WHOLE BOARD | (won the tip:) "They've got it, so now you play the other half." (lost the tip:) "Lost the tip? Then defense is your first job tonight. Most people never expect that." |
| 2 | ONE OF YOUR DEFENDERS | "After each of their moves, you slide ONE defender. A step shorter than he'd run on offense." |
| 3 | THE RINGS AT THEIR FEET | "Read the feet. A ring tells you what each defender can do right now: cut off, contest, or force the question." |
| 4 | THE :12 | "Defense thinks fast: twelve seconds to slide. It pauses whenever a card is up." |

### The 7 triggered tours

| tour | fires when | steps |
|---|---|---|
| **FIRST CARD** | the first question card ever flips (the toss-up), clock held | 3: "Answer to play, that's the whole game" → the tier badge and points ("harder pays more") → the :15 ("it burns while you read") |
| **THE CALL** | you win the toss-up, choice on screen | 2: what you won → the two prizes, pick one |
| **PAUSE MENU** | first open, clock already stopped | 3: "clock's stopped, nothing is lost" → what each button does → "the Rulebook is safe to open mid-game, your board keeps" |
| **END SCREEN** | first game ends, win or lose (first line differs) | 3: (win:) "That's a win. The slam is yours." / (loss:) "They got you tonight. Every legend has an 0-1." → what the numbers meant → what's next: rematch, the Daily Five, the Gym |
| **DAILY FIVE** | first entry ever | 3: "ten cards, the same ten for everyone today" → "five shots, then five stops" → the clock and what running out costs |
| **HEAT CHECK** | first 10-for-10 sweep | 2: "guess the player from the clues" → "clues keep coming, earlier is worth more" |
| **SETUP** | first time in the vs-CPU setup flow | 3: "six quick calls, defaults are fine for a first game" → (on the squad screen) "position is speed: guards move three, centers one" → (on house rules) "these change how the game PLAYS; the drills teach each one" |

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
| CM-MENU-01 | TRIG | first menu: ONE card, pointing at the Daily Five |
| CM-MENU-02 | FOLD→CM-MENU-01 | same card |
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
| CM-GYM-01 | TRIG | one card: nothing counts in here |
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
| CM-HUD-09/10/11 | CUT | replay, coordinates and music explain themselves by being tapped |

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

    101 rows → the screen        63 rows → single triggers
     25 rows → triggered tours   24 rows → cut outright
     14 rows → tour steps        10 rows → smart coach, later
      8 rows → parked             7 rows → guardrails
      6 rows → folds              1 ruled already · 1 engine rule

Rows are not cards: several rows share one card (the key warning and its
whistle are one card, two rows). Counted by table LINE, the coach that
actually gets built is:

    3 opening tours (13 steps) · 7 triggered tours (~19 steps)
    49 single trigger cards (8 already live) · 7 guardrails

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

## Open for Aaron to rule

1. **The model itself** and the filing above (overrule any row by id).
2. **Tours replace the twelve-card budget** (recommended above).
3. **Skip behaviour**: "Skip the tour" skips that tour only; the Coach stays
   on for triggers. A returning player can kill everything with Coach off.
4. **The pass-the-phone curtain** for Local VS surfaced here as a real build
   item (it is UI, not coaching); it needs a home on a track if wanted.

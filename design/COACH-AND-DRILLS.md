# The Coach and the Drills · the two exhaustive lists

**Asked for by Aaron, 2026-08-09.**

> *"I need two lists and we need to go over them in great detail because I don't
> want to miss A THING! First list, everything you can do in the game that
> should be a drill, EVERYTHING, deeply scan for this, and be exhaustive, if you
> are not sure, include it, err on the side of too much is good. We can scale
> back safely but we can't afford misses. Second list, every single moment in
> the game when the coach should and might appear, every first, every thing
> needing explaining, every menu item, EVERYTHING, within every point of the
> game, break it up by each entry point, the main menu, the selection process,
> the daily 5, the game, everything! And again too much is better than too
> little, we can scale back afterwards."*

This file is the raw material for **B7** (the coach as a first-run guide) and
**B14** (the Gym as a room). It is a CANDIDATE list, not a decision. Nothing in
it is scoped until Aaron rules on it, and the rulings land here with his words
against them.

**It is deliberately too long.** That is the instruction. Everything has an id
so we can go line by line and you can say "kill 12 through 19" without either of
us losing our place.

---

## How this was built, so you know what it is worth

Not from memory. Read end to end: the sixteen Rulebook topics in
`docs/play/index.html`, the seven `DRILLS` and ten `TIP_TEXT` entries in
`coach.js`, the twenty-two screens, the twelve veils, every phase name in
`game.js`, `daily.js`, `install.js`, `audio.js`, and DESIGN.md sections 1 to 13.
Where I say a thing is not built, I ran the grep. Where I give a number, I
counted it.

**Counted before anything was written:**

```
  22   screens                     12   full-screen veils and overlays
  16   Rulebook topics              7   of them have a drill  ·  9 do not
   7   drills that exist today     10   TIP_TEXT lines that exist today
   4   more coach lines outside TIP_TEXT (fire, welcome, welcome-again, daily-resume)
   9   distinct board phases        4   spacing house rules
   5   knowledge levels             3   game formats            8   music tracks
```

**The one number that frames List One:** nine of the sixteen Rulebook topics
have no drill. Contests and blocks is one of them, and it is the whole of the
defence's counterplay.

---

## The test a drill has to pass

A drill is not an explanation. It is a sandbox, and `coach.js` says exactly what
one is made of:

```js
DRILLS.pass = { nm:'Passing', allow:['pass','slidemove'], steps:[ {say, done}, ... ] }
SETUPS.pass = { pieces:[...], holder:0, offense:0 }
```

So a candidate is a real drill only if it has all three:

1. **A board position** you can set up with a handful of pieces.
2. **An action set** to allow, and everything else to refuse.
3. **A done condition** a machine can evaluate.

If a candidate fails any of those, it is not a drill, it is a coach line or a
Rulebook paragraph, and I say which one instead of quietly dropping it. That
filter is the only thing keeping this list from being a list of every noun in
the game.

## The scale-back lever

Every row carries a weight, because "how much may the Coach say before he is
annoying" is the one question all of this hangs on, and it is unanswered:

- **MUST** · a player who misses this does not understand the game
- **SHOULD** · a player who misses this plays worse and does not know why
- **COULD** · genuinely nice, genuinely cuttable
- **NO** · listed because you said list everything, and I think it is wrong

Cutting is then one instruction: "MUST and SHOULD only" or "MUST only".

---
---

# LIST ONE · EVERY DRILL CANDIDATE

**66 candidates.** 7 built · 21 Tier A · 14 Tier B · 14 Tier C · 6 blocked on a
mechanic that does not exist · 4 that are not drills and are routed elsewhere.

## The seven that exist today

All seven run from the Rulebook right now, and nobody will ever find them there.
That is B14's entire reason to exist.

| id | drill | key in code | teaches |
|---|---|---|---|
| DR-01 | Moving the rock | `basics` | select, legal tiles, Confirm, the slide that answers you |
| DR-02 | Passing | `pass` | short is free, laser is medium, heave is hard, the lane matters |
| DR-03 | Shooting and the meter | `shoot` | zone difficulty, open versus contested, the meter is upside only |
| DR-04 | The crossover duel | `cross` | red tile, both answer, ankle battle |
| DR-05 | Setting a screen | `screen` | park a body beside a defender, diagonals count, red lanes reopen |
| DR-06 | Defense, slides and steals | `steal` | slide one, one tile less, reach costs the slide |
| DR-07 | Battling for the boards | `rebound` | misses are live, sudden death, closest gets the edge |

## Tier A · the mechanic exists and the drill is nearly free

Same engine, a different `SETUPS` line and three or four steps. These are cheap
because the hard part, the sandbox, is already built.

| id | drill | what it teaches, and why it is not already taught | weight |
|---|---|---|---|
| DR-08 | **Contests and blocks** | The biggest hole in the seven. Only a defender BETWEEN you and the rim contests. A man in your chest costs a full tier; a diagonal closeout leaves the shot cleaner but sharpens their block card. Rulebook topic 7 is the only mechanic topic with no drill | MUST |
| DR-09 | **Battle at the rim** | Shooter right AND blocker right goes to sudden death, and rim-protecting bigs get the edge on layups. Today you meet this for the first time in a real game with points on it | MUST |
| DR-10 | **RIP OR GRIP** | The steal's sudden death. Your card, then their protect-the-rock card, both right and it is first-miss-loses with the handler holding the edge. DR-06 mentions it and never makes you play one | MUST |
| DR-11 | **Inbounds** | Rulebook topic 9, no drill. The inbounder cannot move or shoot, you may set ONE cutter, the defense gets a slide to answer it. Every made basket runs this and it is the most common thing nobody is taught | MUST |
| DR-12 | **The three point line versus the difficulty colours** | The exact collision you caught from a screenshot: cream line means WORTH, green/amber/red means HARD. Two colour languages on one floor. A ninety second drill: shoot the same tier from two places and watch the number change | MUST |
| DR-13 | **The corner three** | A medium question worth three, the most efficient shot on the floor. Real basketball's best-known idea, currently one clause in a paragraph | SHOULD |
| DR-14 | **Reading the rings** | Broken teal means screened, double red means they contest, amber means they force a crossover. Three states, on every defender, every turn. Nothing teaches you to look at the feet | MUST |
| DR-15 | **The deep cross** | Carry it three or more tiles and the tile goes darker red and the card goes one tier harder. Winning still costs a step. Buried in the crossover paragraph | SHOULD |
| DR-16 | **Getting screened, from the defence** | Screens happen TO you. Anyone but the ball-handler can set one. Right now DR-05 only ever shows you the good side | SHOULD |
| DR-17 | **Three in the key** | Counts ACTIONS, not seconds. Warning at two, turnover at three. An invisible clock that ends possessions | MUST |
| DR-18 | **The backcourt line** | Cross half and going back is a live violation, dark red warning tiles, whistle if you commit | SHOULD |
| DR-19 | **The shot clock** | :24 to commit. Sit on it and you turn it over. The drills all run with no clock, so no drill has ever shown you one | SHOULD |
| DR-20 | **The defensive :12** | Half the offensive clock, and paused during cards and battles, which is not obvious. A defender who times out gives up a free slide | SHOULD |
| DR-21 | **Spacing: Open floor** | The default, and the most counter-intuitive rule in the game: a defender only guards squares they are SQUARE to, so a diagonal walks straight past. Measured at 102% to 57% when it went in | MUST |
| DR-22 | **Spacing: the other three** | Locked up, Pay the toll, One-on-one. One drill, three floors, same possession run three times. The house rules screen describes them in small type nobody reads | COULD |
| DR-23 | **The free off-ball shuffle** | DESIGN section 3: one free one-square shuffle PLUS the main action, every turn. If a player never learns this they are playing at half the tempo and nothing tells them | MUST |
| DR-24 | **Long rebound, nobody crashing** | Send nobody to the glass and the ball goes out, other team's ball. The punishment half of DR-07, which only ever shows you a contested board | SHOULD |
| DR-25 | **Building heat** | Easy cards drip, hard cards pour, the trailing team pours faster. Four segments of three. Watch the bar move while you answer | SHOULD |
| DR-26 | **Losing heat, and what puts a fire out** | A miss costs one quarter, never the lot. And the counter-intuitive one: ANY made basket ends the burn, including your own | SHOULD |
| DR-27 | **Playing while ON FIRE** | Minus one tier on every card and plus one tile for every player. It is a different game for a possession and you get about four of them a night | SHOULD |
| DR-28 | **Sudden death** | Tied at game point freezes the board and it goes to alternating cards, first clean hit against a miss ends it. This is how close games END and it is never rehearsed | MUST |

## Tier B · real drills, real work

The sandbox needs something it does not have yet: a scripted opponent, a clock
the drill can drive, a second possession, or state the drill has to fake.

| id | drill | what it needs | weight |
|---|---|---|---|
| DR-29 | **A full possession, end to end** | Shuffle, action, slide, card, shot, board. The graduation drill, and the only one that shows how the pieces connect. Needs a scripted CPU opponent | MUST |
| DR-30 | **A full defensive possession** | The mirror. Slide, contest, force the clock, secure the board. `steal` is the only defensive drill and it is one reach | MUST |
| DR-31 | **Driving the lane** | `driveChallenge` counts how many defenders a path crosses and the One-on-one floor closes a lane gated by two. Needs a crowded paint set up on purpose | SHOULD |
| DR-32 | **Reading the whole floor before you move** | Not a rule, a habit: check every ring, then pick. Needs a paused board and a question, closer to a puzzle than a drill | COULD |
| DR-33 | **The toss-up** | Buzz first, then answer. Needs an opponent buzzer to race, even a fake one, or there is nothing to learn | SHOULD |
| DR-34 | **THE CALL** | Winning the toss-up gives you plus two shuffles OR first pick, and you also suit up first. A real decision most people will make blind the first time | SHOULD |
| DR-35 | **The jump ball** | Slap your zone the moment you know it. Same need as DR-33, something to race | SHOULD |
| DR-36 | **The release meter, alone** | Currently the tail of DR-03. Its own thirty seconds: five contested shots, hit dead centre, watch the block card never arrive | SHOULD |
| DR-37 | **The question clock** | :15 and burning. Needs a drill that does not freeze its clocks, which is the opposite of every drill today | COULD |
| DR-38 | **What a wrong answer costs, per action** | Brick, steal, wasted move, ball out of bounds. Four different punishments, one card. Needs a drill that makes you get four wrong on purpose | SHOULD |
| DR-39 | **Where the points come from** | Layup two, mid two, three three, logo three. Same shot, four places, four cards. Needs scoring, which drills currently switch off | SHOULD |
| DR-40 | **Fatigue and the star tax** | DESIGN section 7: overusing a star raises his tiers until he rests. **Not built.** Listed here because it is Tier B the day it is | NO, until built |
| DR-41 | **Star signature skills** | DESIGN section 2: a signature activated by answering a question about that player's own career. **Not built.** Would be the best drill in the game | NO, until built |
| DR-42 | **Playing from behind** | Trailing heats faster and sudden death exists. A scenario drill, down four with two possessions. Closer to a puzzle mode than a tutorial | COULD |

## Tier C · marginal, listed because you said list everything

| id | candidate | verdict |
|---|---|---|
| DR-43 | Camera: drag rotates, pinch zooms, ↺ resets | **Not a drill.** A three second first-touch coach line. See CM-GAME-01 |
| DR-44 | The ↺ replay button | **Not a drill.** One line the first time somebody disputes a move |
| DR-45 | Reading the scoreboard | **Not a drill.** A tap-through overlay with four labels beats a sandbox |
| DR-46 | Tile coordinates on the edges | **Not a drill.** Genuinely lovely, genuinely a footnote |
| DR-47 | Reading a player card and full stats | Possible as a Gym station, but it is a menu skill, not a floor skill |
| DR-48 | Rarity, pips and what ★ means | Same. Better as a coach line on the squad screen |
| DR-49 | Reshuffle and the shuffle allowance | Better as a coach line. It is one number with a limit |
| DR-50 | Picking eras, and what it does to your cards | Better as a coach line on the era screen. Real consequence, no board |
| DR-51 | Packs, and how they widen the pile | Coach line on the league screen |
| DR-52 | Knowledge levels and the handicap | **Borderline.** Could be a genuinely good drill: same question, five levels, feel the difference. Would sell the handicap to mixed crews better than any sentence |
| DR-53 | Home court and colours | Not a drill. Cosmetic |
| DR-54 | Pass-and-play etiquette on one phone | Not a drill, but it IS a missing coach moment. See CM-LOCAL |
| DR-55 | The boombox and the soundtrack | Not a drill |
| DR-56 | Add to home screen | Not a drill. Already has its own prompt |

## Blocked · the mechanic does not exist yet

Each of these is in DESIGN.md and not in the code. Verified by grep, not by
memory: `foul` appears **zero** times in `game.js` and zero times in
`index.html`.

| id | drill | blocked on |
|---|---|---|
| DR-57 | Fouls | Fouls are not implemented at all |
| DR-58 | Free throws and the FT meter | Same |
| DR-59 | The timed block gamble, green blocks and red fouls | Same. The Rulebook already describes contests without it, so this is a DESIGN item, not a bug |
| DR-60 | Substitutions and the bench | Not implemented |
| DR-61 | Alley-oop | Not implemented |
| DR-62 | Heat check bomb and ON FIRE streak mode | Phase 2 of heat, spec'd, not built |

## Not a drill · and where each one goes instead

Listed so none of them can quietly vanish just because they failed the drill
test.

| id | thing | where it belongs |
|---|---|---|
| DR-63 | The Daily Five, all of it | Its own coach block, CM-DAILY. A drill inside a daily ritual is a contradiction |
| DR-64 | Online, codes, invites, reconnects | CM-ONLINE. Nothing to practise, plenty to explain |
| DR-65 | Quick Run (B9) | Not built. When it is, it needs one coach line, not a drill |
| DR-66 | THE JACKET, the career (B13 and beyond) | Not built. Its own tutor when it exists, not this one |

---
---

# LIST TWO · EVERY COACH MOMENT, BY ENTRY POINT

**256 moments across 19 entry points.** 14 of them are already live. 242 are new.

**Read the arithmetic before the list, because it changes what the list is
for.** Weighting every row and then counting the weights gives this:

```
  256   moments in the nineteen entry points
  109   MUST      71  SHOULD      54  COULD      14 already live      8 other
```

And on the path a first-time player actually walks, cold open to main menu to a
vs-CPU game to the final buzzer, ignoring the Daily Five, the Gym, online, local,
the Rulebook and Settings entirely:

```
   77   MUST      48  SHOULD      39  COULD
```

**Seventy-seven cards in one twenty-minute game is one every fifteen seconds.**
That is not a coach, that is a hostage situation. I could have quietly trimmed
the list before showing it to you, and that would have hidden the actual
finding, which is this: **the MUST weight failed.** Applied honestly to a game
with this many real mechanics, "a player who misses this does not understand the
game" is true of seventy-seven things, because the game genuinely has that many
moving parts. The weight sorts the list. It does not cut it.

So the list stays at full length, which is what you asked for, and the cut moves
to a budget instead. See **What this costs** at the end. The one thing I would
not do is pretend a 77-card first game was ever the plan.

## The fourteen that exist today

| id | trigger | where | weight |
|---|---|---|---|
| CM-EXIST-01 | `first` · the hello, fires ASAP, before the jumbotron | `coach.js` | live |
| CM-EXIST-02 | `select` · your possession, tap a player | `coach.js` | live |
| CM-EXIST-03 | `confirm` · nothing fires until Confirm | `coach.js` | live |
| CM-EXIST-04 | `card` · answer to play | `coach.js` | live |
| CM-EXIST-05 | `meter` · the release meter is pure bonus | `coach.js` | live |
| CM-EXIST-06 | `slide` · defense slides after every action | `coach.js` | live |
| CM-EXIST-07 | `cross` · red tile is a crossover duel | `coach.js` | live |
| CM-EXIST-08 | `battle` · sudden-death cards | `coach.js` | live |
| CM-EXIST-09 | `tip` · jump ball, slap your zone | `coach.js` | live |
| CM-EXIST-10 | `inbound` · the inbounder cannot move or shoot | `coach.js` | live |
| CM-EXIST-11 | `fire` · you caught fire | `game.js` 3641 | live |
| CM-EXIST-12 | `welcome` · the install prompt | `install.js` 279 | live |
| CM-EXIST-13 | `welcome-again` · the icon was deleted | `install.js` 279 | live |
| CM-EXIST-14 | `daily-resume` · your run is still going | `daily.js` 1225 | live |

**Two structural facts about all fourteen, both deliberate, both worth
re-ruling:** the Coach is silent in online games, always, because a tip over a
live clock costs real seconds. And every tip is once per phone forever, stored
in `bk_coach_seen`, re-armable from Settings. That second one is the open
`bk_install_seen` question wearing a different hat.

---

## 0 · Before anything · the cold open

| id | moment | weight |
|---|---|---|
| CM-COLD-01 | Very first open ever, before a single tap. Who he is, that he can be turned off, in one card | MUST |
| CM-COLD-02 | Second open, same day, nothing played. Not a repeat: a nudge toward the Daily Five | COULD |
| CM-COLD-03 | Returning after a week away. What changed, what is waiting | COULD |
| CM-COLD-04 | Opened from the home screen icon for the first time (installed, not a tab) | COULD |
| CM-COLD-05 | Opened from a shared invite link. Straight to the point: you are joining someone's room | MUST |
| CM-COLD-06 | Opened from the Daily Five icon shortcut | COULD |
| CM-COLD-07 | Offline, no network. Say what still works, which is nearly everything | SHOULD |

## 1 · The loading screen

| id | moment | weight |
|---|---|---|
| CM-LOAD-01 | Lacing 'em up runs long on a slow connection. One line so a stall does not read as broken | SHOULD |
| CM-LOAD-02 | First load ever: a one-liner on what this game is, while it loads. Free attention nobody is using | COULD |

## 2 · The main menu

The new menu has six destinations and the classic has seven. Not one of them is
explained anywhere except by its own subtitle.

| id | moment | weight |
|---|---|---|
| CM-MENU-01 | First time on the menu. Where to start, and it is the Daily Five, not the main event | MUST |
| CM-MENU-02 | The Daily Five stamp, unplayed today. Sixty seconds, everyone gets the same ten | MUST |
| CM-MENU-03 | The stamp, run in progress. Pick it up where you left off | SHOULD |
| CM-MENU-04 | The stamp, done today. What the streak is and why coming back matters | SHOULD |
| CM-MENU-05 | The stamp, a broken streak. Say it kindly, once | COULD |
| CM-MENU-06 | Quick Run, marked SOON. What it will be, so the tile is not a dead end | COULD |
| CM-MENU-07 | The Gym, first sight. Seven drills, no score, no clock | MUST |
| CM-MENU-08 | THE JACKET, marked SOON. One line on the career | COULD |
| CM-MENU-09 | The Rolodex, first sight. Three ways to play somebody | SHOULD |
| CM-MENU-10 | Vs the CPU. The main event, and what a first game costs in minutes | MUST |
| CM-MENU-11 | Online, first tap. The alpha gate exists, here is why | MUST |
| CM-MENU-12 | Local VS. Two squads, one phone, pass it back and forth | SHOULD |
| CM-MENU-13 | The boombox, first sight. It is a music player, not decoration | COULD |
| CM-MENU-14 | The ⚙ settings door | COULD |
| CM-MENU-15 | Switching between the new and classic menus. One line saying the switch is real and remembered | COULD |
| CM-MENU-16 | Back on the menu after your first finished game. What to do next | SHOULD |
| CM-MENU-17 | Back on the menu after your first ABANDONED game. Different line, no scolding | COULD |
| CM-MENU-18 | Three or more opens with no game started. Something is not landing, offer the Gym | COULD |

## 3 · The Gym · B14

The room does not exist yet. These are the moments it will need on the day it
does, so it does not ship mute.

| id | moment | weight |
|---|---|---|
| CM-GYM-01 | First entry. This is a practice court, nothing counts, leave whenever | MUST |
| CM-GYM-02 | The floor itself: each drill sits where that drill happens | SHOULD |
| CM-GYM-03 | Hovering or tapping a station before committing: what that drill covers | SHOULD |
| CM-GYM-04 | First drill finished. One down, six to go, and the progress is remembered | SHOULD |
| CM-GYM-05 | All seven finished. The diploma moment, and a push into a real game | MUST |
| CM-GYM-06 | Returning to the Gym with drills already done. Which ones are left | COULD |
| CM-GYM-07 | Quitting a drill halfway. No penalty, come back | SHOULD |
| CM-GYM-08 | Where the Rulebook went, if it becomes the eighth station | MUST, if that is the ruling |
| CM-GYM-09 | Arriving in the Gym from a game you were losing. A different, quieter line | COULD |

## 4 · The Rulebook

| id | moment | weight |
|---|---|---|
| CM-RULE-01 | First open. Sixteen topics, orange buttons run live drills | SHOULD |
| CM-RULE-02 | Opened DURING a game, over the board. The state is safe, you are not forfeiting | MUST |
| CM-RULE-03 | Opened on the exact topic you just lost a possession to. The single best-timed line in the game, and it needs the game to tell the Rulebook why it was opened | SHOULD |
| CM-RULE-04 | Nine topics have no drill. Say so rather than letting the pattern look random | COULD |

## 5 · Settings · the Control Room

| id | moment | weight |
|---|---|---|
| CM-SET-01 | First open. Everything here is per phone | COULD |
| CM-SET-02 | Turning the Coach OFF. Confirm it, say how to get him back, then go quiet. The last thing he ever says | MUST |
| CM-SET-03 | Turning the Coach ON having had him before. Tips already used up do not come back without Run the Coach again | MUST |
| CM-SET-04 | Run the Coach again, pressed. Everything is re-armed | SHOULD |
| CM-SET-05 | Theme switch, first use | COULD |
| CM-SET-06 | Music off. The soundtrack follows the moment, you are turning off six cues | COULD |
| CM-SET-07 | Sound FX off, during a game. Some feedback is audio only | SHOULD |
| CM-SET-08 | Reduced motion on. What visibly changes | COULD |
| CM-SET-09 | Start over. A destructive button that deserves one sentence more than a confirm | MUST |

## 6 · The Daily Five

Ten cards, five shots then five stops, a bonus round on a sweep. Today the
Coach says exactly one thing in the whole mode, CM-EXIST-14.

| id | moment | weight |
|---|---|---|
| CM-DAILY-01 | First ever entry. Ten cards, same ten for everybody, once a day | MUST |
| CM-DAILY-02 | The clock. What it is and what running out costs | MUST |
| CM-DAILY-03 | First card of round one. This half is SHOTS | MUST |
| CM-DAILY-04 | First right answer. The theatre B5c is meant to add, with a voice on it | SHOULD |
| CM-DAILY-05 | First wrong answer. What it costs, and that the run continues | MUST |
| CM-DAILY-06 | The round break, shots to stops. The mode changes and today the change is quiet | MUST |
| CM-DAILY-07 | First card of round two. This half is STOPS, and here is how it differs | MUST |
| CM-DAILY-08 | 10 for 10, the sweep. Into the Heat Check | MUST |
| CM-DAILY-09 | Heat Check first sight. Guess the player from clues, clues keep coming, earlier is worth more | MUST |
| CM-DAILY-10 | Heat Check, a near miss on the name. The matcher is forgiving, say so | SHOULD |
| CM-DAILY-11 | Heat Check solved | SHOULD |
| CM-DAILY-12 | Heat Check missed. No damage to the run | SHOULD |
| CM-DAILY-13 | The receipt. What each mark means | SHOULD |
| CM-DAILY-14 | The share button, first sight. What gets shared, and that it spoils nothing | SHOULD |
| CM-DAILY-15 | Coming back the same day, already done. Back tomorrow, and here is what to do now | MUST |
| CM-DAILY-16 | Resuming mid-run · **LIVE**, CM-EXIST-14 | live |
| CM-DAILY-17 | Streak hits two. The first moment the streak is real | COULD |
| CM-DAILY-18 | Streak hits seven | COULD |
| CM-DAILY-19 | Streak broken. Once, gently, never twice | SHOULD |
| CM-DAILY-20 | The calendar, first open. What the dots mean | SHOULD |
| CM-DAILY-21 | Tapping a past day. History, not a replay | COULD |
| CM-DAILY-22 | Leaving mid-run. The run is held, not lost | MUST |
| CM-DAILY-23 | A "did you know" blurb, first sight, when B11 ships | COULD |
| CM-DAILY-24 | Midnight rolls over while you are mid-run. The nastiest edge case in the mode | SHOULD |

## 7 · Vs the CPU · the whole setup flow

Six screens before a ball is thrown. Every one of them is a decision, and the
Coach currently says nothing on any of them.

### 7a · League and packs

| id | moment | weight |
|---|---|---|
| CM-CPU-01 | Step 1 first sight. What a league changes: the cards, not the basketball | MUST |
| CM-CPU-02 | Packs. Ticking one widens the pile, it does not narrow it | SHOULD |
| CM-CPU-03 | The card count as it moves. That number is your pile | SHOULD |
| CM-CPU-04 | Picking a league with a thin pile. Warn before, not after | MUST |
| CM-CPU-05 | Quick picks versus picking your own | COULD |

### 7b · Era

| id | moment | weight |
|---|---|---|
| CM-CPU-06 | Step 2 first sight. Eras filter the CARDS and the PLAYERS both | MUST |
| CM-CPU-07 | Mixing decades is allowed and encouraged | SHOULD |
| CM-CPU-08 | All-Time, and what it costs you in coherence | COULD |
| CM-CPU-09 | Picking one thin decade. The pool will be small and repetitive | MUST |

### 7c · Squad

| id | moment | weight |
|---|---|---|
| CM-CPU-10 | Step 3 first sight. These five are yours for the game | MUST |
| CM-CPU-11 | Position is movement DNA. PG moves 3, C moves 1, and that is the whole spine | MUST |
| CM-CPU-12 | Tap a card for full stats, first time | SHOULD |
| CM-CPU-13 | ★ and the rarity pips, first time | SHOULD |
| CM-CPU-14 | Reshuffle. There is an allowance and it is finite | MUST |
| CM-CPU-15 | Allowance running out. Warn at one left | MUST |
| CM-CPU-16 | Rolling a rare or legendary squad. Say so, it is a moment and it currently passes silently | SHOULD |
| CM-CPU-17 | Lock it in. This is final | SHOULD |

### 7d · Locker room

| id | moment | weight |
|---|---|---|
| CM-CPU-18 | First sight. Your floor, your colours, the machine dresses to contrast | COULD |
| CM-CPU-19 | Browse all 12 courts | COULD |
| CM-CPU-20 | Browse all 24 colourways | COULD |
| CM-CPU-21 | Picking colours close to the CPU's. The contrast logic handles it, say so | COULD |

### 7e · House rules

The single most under-explained screen in the game. Four spacing rules that
change the maths of every possession, in small grey type.

| id | moment | weight |
|---|---|---|
| CM-CPU-22 | Step 4 first sight. These change how the game PLAYS, not how it looks | MUST |
| CM-CPU-23 | Format: to 11, to 21, four quarters, and what each costs in real minutes | MUST |
| CM-CPU-24 | To 21 picked on a first ever game. That is a long night, gently | SHOULD |
| CM-CPU-25 | Knowledge level: same level versus handicap | MUST |
| CM-CPU-26 | The five levels, Casual to Legend, and how big the gap really is | MUST |
| CM-CPU-27 | Surprise Me. A fresh roll every card | SHOULD |
| CM-CPU-28 | Spacing, the concept, before the four options | MUST |
| CM-CPU-29 | Open floor, the default and the strange one: diagonals beat a square-on defender | MUST |
| CM-CPU-30 | Locked up | SHOULD |
| CM-CPU-31 | Pay the toll | SHOULD |
| CM-CPU-32 | One-on-one | SHOULD |
| CM-CPU-33 | Changing spacing mid-setup. What it does to the game you were picturing | COULD |

### 7f · Difficulty, versus, brains

| id | moment | weight |
|---|---|---|
| CM-CPU-34 | The CPU level. Rookie, Pro, All-Star, and what actually changes, which is meter denial and card play, not cheating | MUST |
| CM-CPU-35 | All-Star on a first game. Say it plainly | SHOULD |
| CM-CPU-36 | The versus screen. Last look before tip | COULD |
| CM-CPU-37 | The BRAINS × BUCKETS card, first time. It is skippable | COULD |

## 8 · Local VS · one phone, two squads

| id | moment | weight |
|---|---|---|
| CM-LOCAL-01 | First entry. One phone, pass it back and forth, and here is the etiquette | MUST |
| CM-LOCAL-02 | Names screen. Squad one holds the phone first | MUST |
| CM-LOCAL-03 | Saved squads, tap to change | COULD |
| CM-LOCAL-04 | Names ride the whole night: toss-up, scoreboard, victory slam | COULD |
| CM-LOCAL-05 | Colours screen, both squads at once | COULD |
| CM-LOCAL-06 | The first handover in a live game. The one moment that makes or breaks pass-and-play, and nothing marks it today | MUST |
| CM-LOCAL-07 | Handing over during a card. Do not let the other squad read it | MUST |
| CM-LOCAL-08 | Handicap in a local game. Each player sets their own, this is the mixed-crew fix | SHOULD |

## 9 · Online

| id | moment | weight |
|---|---|---|
| CM-ON-01 | The access gate. What it is, why it exists, that it is temporary | MUST |
| CM-ON-02 | Gate refused. What to do next, without a dead end | MUST |
| CM-ON-03 | Gate passed, first time | COULD |
| CM-ON-04 | The online screen. One of you creates, the other joins | MUST |
| CM-ON-05 | Room created. The code, and that the invite link carries the pass so nobody types anything | MUST |
| CM-ON-06 | The share sheet, first use. Fallback to clipboard if the phone has no share | SHOULD |
| CM-ON-07 | Waiting for the other phone. What the wait is, and that ~30 seconds on the first connect is the free server waking, not a hang | MUST |
| CM-ON-08 | Joining from a link, first time. You are already in, nothing to type | MUST |
| CM-ON-09 | The house screen. Nothing changes once you are in | SHOULD |
| CM-ON-10 | The pick screen. You are Orange, they are Blue | SHOULD |
| CM-ON-11 | You only see YOUR cards. They just see you sweating. Genuinely surprising and genuinely load-bearing | MUST |
| CM-ON-12 | The Coach is silent online, and here is why, said ONCE before tip-off | MUST |
| CM-ON-13 | Opponent drops. The room holds ~45 seconds | MUST |
| CM-ON-14 | You drop and reconnect | MUST |
| CM-ON-15 | Full refresh, offered a jump back in | SHOULD |
| CM-ON-16 | Opponent never returns. What happens to the game | MUST |
| CM-ON-17 | Leaving a room on purpose | SHOULD |
| CM-ON-18 | The server is cold on the very first tap. The B4 case, and the exact thing that loses a tester forever | MUST |

## 10 · The opening ceremony

| id | moment | weight |
|---|---|---|
| CM-OPEN-01 | The hello · **LIVE**, CM-EXIST-01 | live |
| CM-OPEN-02 | The jumbotron. Deliberately un-interrupted today, worth re-ruling | NO |
| CM-OPEN-03 | The toss-up, first sight. General knowledge, first buzz answers | MUST |
| CM-OPEN-04 | The 5·4·3·2·1. Buzz the second you know it | MUST |
| CM-OPEN-05 | Buzzing too early | SHOULD |
| CM-OPEN-06 | Winning the toss-up, and THE CALL: plus two shuffles or first pick | MUST |
| CM-OPEN-07 | Losing the toss-up. What you still get | SHOULD |
| CM-OPEN-08 | The jump ball · **LIVE**, CM-EXIST-09 | live |
| CM-OPEN-09 | Losing the tip. Your defence starts, and that is the half nobody expects to play first | MUST |

## 11 · In the game · offense

| id | moment | weight |
|---|---|---|
| CM-GAME-01 | The camera, first touch. Drag rotates, pinch zooms, ↺ resets | MUST |
| CM-GAME-02 | Your possession · **LIVE**, CM-EXIST-02 | live |
| CM-GAME-03 | Confirm · **LIVE**, CM-EXIST-03 | live |
| CM-GAME-04 | The free off-ball shuffle, first possession. Not taught anywhere, and it doubles your options | MUST |
| CM-GAME-05 | First pass attempt. Short free, laser medium, heave hard | MUST |
| CM-GAME-06 | First contested pass. The lane matters | SHOULD |
| CM-GAME-07 | A pass that sails out of bounds. Why | MUST |
| CM-GAME-08 | First shot attempt. Distance sets the tier | MUST |
| CM-GAME-09 | First OPEN look. No meter, straight splash | MUST |
| CM-GAME-10 | First CONTESTED look, and the meter · **LIVE**, CM-EXIST-05 | live |
| CM-GAME-11 | First perfect release. It denied their block card, say what just happened | MUST |
| CM-GAME-12 | Never tapping the meter. It cost you nothing, which nobody believes | MUST |
| CM-GAME-13 | First three attempt. The cream line is WORTH, the colour is HARD | MUST |
| CM-GAME-14 | Standing in a corner for the first time. Amber outside the line, three points, best shot on the floor | SHOULD |
| CM-GAME-15 | First logo-zone tile. Deep specialists only | COULD |
| CM-GAME-16 | First red tile · **LIVE**, CM-EXIST-07 | live |
| CM-GAME-17 | First DARK red tile, the deep cross | SHOULD |
| CM-GAME-18 | First ankle battle · **LIVE** via CM-EXIST-08 | live |
| CM-GAME-19 | Losing an ankle battle. It cost a step, not the ball | SHOULD |
| CM-GAME-20 | First screen you set on purpose | SHOULD |
| CM-GAME-21 | First time YOU are screened. Broken teal ring | MUST |
| CM-GAME-22 | Camping in the key, warning at two actions | MUST |
| CM-GAME-23 | Three in the key, turned over | MUST |
| CM-GAME-24 | Backcourt warning tiles appear | MUST |
| CM-GAME-25 | Backcourt violation committed | MUST |
| CM-GAME-26 | Shot clock under :06 for the first time | SHOULD |
| CM-GAME-27 | Shot clock violation | MUST |
| CM-GAME-28 | First inbound · **LIVE**, CM-EXIST-10 | live |
| CM-GAME-29 | Setting a cutter on an inbound, first time. The defence gets a slide to answer | SHOULD |
| CM-GAME-30 | Nobody crashing the glass, long rebound goes out | SHOULD |
| CM-GAME-31 | Three straight possessions with no shot. Something is stuck, offer help | COULD |
| CM-GAME-32 | Selecting the same player every possession. A nudge toward the other four | COULD |

## 12 · In the game · defense

| id | moment | weight |
|---|---|---|
| CM-DEF-01 | First defensive turn · **LIVE**, CM-EXIST-06 | live |
| CM-DEF-02 | Slide range is one tile LESS than that player's offensive speed, except in the backcourt | MUST |
| CM-DEF-03 | The rings, first defensive turn. Teal, double red, amber | MUST |
| CM-DEF-04 | The :12. Half the offensive clock, paused during cards | MUST |
| CM-DEF-05 | Standing next to the ball, Go for the steal appears | MUST |
| CM-DEF-06 | First steal attempt. Your card, then their protect-the-rock card | MUST |
| CM-DEF-07 | First RIP OR GRIP | MUST |
| CM-DEF-08 | Failed reach. It burned the slide | MUST |
| CM-DEF-09 | First contest. Only defenders between you and the rim contest | MUST |
| CM-DEF-10 | Man in the chest versus diagonal closeout. Two different trades | SHOULD |
| CM-DEF-11 | First block card | MUST |
| CM-DEF-12 | Block card denied by a perfect release. From YOUR side, this is the one that feels unfair until it is explained | MUST |
| CM-DEF-13 | First battle at the rim | MUST |
| CM-DEF-14 | Bigs get the edge on layups | SHOULD |
| CM-DEF-15 | Getting screened, from the defensive side | MUST |
| CM-DEF-16 | Forcing a shot clock violation for the first time. A defensive WIN with no highlight, so it needs a voice | SHOULD |
| CM-DEF-17 | Defensive rebound secured | SHOULD |
| CM-DEF-18 | Sliding the same defender every turn | COULD |

## 13 · In the game · the cards

| id | moment | weight |
|---|---|---|
| CM-CARD-01 | First card · **LIVE**, CM-EXIST-04 | live |
| CM-CARD-02 | The flip, the category, the tier badge, the points | MUST |
| CM-CARD-03 | The :15 burning clock | MUST |
| CM-CARD-04 | Clock ran out with no answer | MUST |
| CM-CARD-05 | First wrong answer, on a shot. Brick | MUST |
| CM-CARD-06 | First wrong answer, on a move. Wasted move, not a turnover | MUST |
| CM-CARD-07 | First wrong answer, on a pass. Out of bounds | MUST |
| CM-CARD-08 | First wrong answer, on defence. What you gave up | SHOULD |
| CM-CARD-09 | First HARD card. Three points is why | SHOULD |
| CM-CARD-10 | A card you have already seen this game | COULD |
| CM-CARD-11 | Three wrong in a row. One sentence of encouragement, and an offer to drop the level | SHOULD |
| CM-CARD-12 | Five right in a row. Name it | COULD |
| CM-CARD-13 | A "did you know" blurb, when B11 ships | COULD |
| CM-CARD-14 | Handicap in play: your card and theirs are different tiers, said once | MUST |

## 14 · In the game · the loud moments

| id | moment | weight |
|---|---|---|
| CM-HEAT-01 | First heat pour. That bar under your score is filling | MUST |
| CM-HEAT-02 | First segment full | SHOULD |
| CM-HEAT-03 | First heat DROP. One quarter, never the lot | MUST |
| CM-HEAT-04 | ON FIRE · **LIVE**, CM-EXIST-11 | live |
| CM-HEAT-05 | Playing the first possession while lit. Minus a tier, plus a tile | MUST |
| CM-HEAT-06 | Your own bucket ended your fire. The most counter-intuitive rule in the game | MUST |
| CM-HEAT-07 | Their bucket ended your fire | SHOULD |
| CM-HEAT-08 | Losing the ball while lit | SHOULD |
| CM-HEAT-09 | The OPPONENT catches fire. What is about to happen to you | MUST |
| CM-HEAT-10 | Trailing team heats faster, said once when it is helping you | COULD |
| CM-HEAT-11 | First and-one, if fouls ever ship | NO, until built |

## 15 · In the game · the frame around it

| id | moment | weight |
|---|---|---|
| CM-HUD-01 | The scoreboard, first look. Score, quarter, clock, possession | MUST |
| CM-HUD-02 | The target, first to 11, on the board | SHOULD |
| CM-HUD-03 | The possession marker | SHOULD |
| CM-HUD-04 | End of quarter, four-quarter format | SHOULD |
| CM-HUD-05 | Halftime | COULD |
| CM-HUD-06 | Game point reached | MUST |
| CM-HUD-07 | Tied at game point, sudden death begins | MUST |
| CM-HUD-08 | Sudden death, your card | MUST |
| CM-HUD-09 | The ↺ replay button, first dispute | COULD |
| CM-HUD-10 | Tile coordinates on the edges | COULD |
| CM-HUD-11 | The music changed because the moment changed | COULD |

## 16 · Ends

| id | moment | weight |
|---|---|---|
| CM-END-01 | First win ever | MUST |
| CM-END-02 | First loss ever. The line that decides whether they play a second time | MUST |
| CM-END-03 | A blowout loss. Offer the handicap, offer the Gym, do not lecture | MUST |
| CM-END-04 | A one-possession finish | COULD |
| CM-END-05 | Won on sudden death | COULD |
| CM-END-06 | The victory slam, first sight | COULD |
| CM-END-07 | Post-game: what to do next. Rematch, Daily Five, Gym | MUST |
| CM-END-08 | Post-game, first game ever: the feedback button, when B6 ships | MUST |
| CM-END-09 | Abandoning a game mid-way | SHOULD |
| CM-END-10 | Second game ever, same settings. Suggest one thing to change | COULD |

## 17 · Interruptions

| id | moment | weight |
|---|---|---|
| CM-INT-01 | The pause menu, first open. The clock is stopped, nothing is lost | MUST |
| CM-INT-02 | Browser back mid-game. What survives | MUST |
| CM-INT-03 | Phone slept and woke. Wake lock re-acquired, the game is where you left it | SHOULD |
| CM-INT-04 | App backgrounded and returned | SHOULD |
| CM-INT-05 | Rotating the phone | COULD |
| CM-INT-06 | The install prompt · **LIVE**, CM-EXIST-12 | live |
| CM-INT-07 | The icon was deleted · **LIVE**, CM-EXIST-13 | live |
| CM-INT-08 | Network dropped mid-CPU-game. Nothing is at risk, it is all local | SHOULD |
| CM-INT-09 | Storage full or blocked, private browsing. Progress will not save, say it BEFORE they lose a streak | MUST |
| CM-INT-10 | A tip was suppressed because a veil was up. Never lose the tip, re-arm it for the next clean moment | SHOULD |

## 18 · THE JACKET · not built

Listed so that when the career arrives it does not arrive mute.

| id | moment | weight |
|---|---|---|
| CM-JKT-01 | First entry into the career | later |
| CM-JKT-02 | Your room, first sight | later |
| CM-JKT-03 | The time machine, first use | later |
| CM-JKT-04 | Entering an era for the first time | later |
| CM-JKT-05 | Earning the jacket | later |

---
---

# What this costs, honestly

The seven drills that exist are roughly 60 lines of `coach.js` between them, so
**Tier A averages about 9 lines a drill.** Twenty-one Tier A drills is therefore
a couple of hundred lines and a day's work, not a project. Tier B is a different
animal because most of it needs a scripted opponent, which is one new capability
that then unlocks six drills at once.

The coach moments are cheaper per item and far more dangerous in aggregate.
Every one is a `TIP_TEXT` line plus a trigger, so the code is trivial. **The
cost is the noise**, and the noise does not scale with the weights, it scales
with the count.

**My recommendation, so you have something to react to rather than a blank
page:**

- **Drills: build all of Tier A, and cut Tier B to DR-29 and DR-30.** Tier A is
  the same engine with a different setup line, it is about nine lines a drill,
  and it closes the nine Rulebook topics that have no drill at all. The two
  full-possession drills in Tier B are worth building a scripted opponent for on
  their own, and that opponent then unlocks six more.

- **Coach: stop cutting by weight and set a BUDGET.** The weight cut does not
  work, and the arithmetic at the top of List Two is the proof: MUST alone is 77
  moments on the first-game path. So instead:

  **No more than twelve coach cards in a first game. Never two in the same
  possession. Anything that does not fit WAITS, it is never dropped.**

  That turns an impossible trimming job into a pleasant one: pick the twelve.
  The queue makes the rest self-managing, because a moment that never got its
  turn in game one is still armed in game two, and the tips that matter most are
  the ones that keep recurring. **The list stops being a script and becomes a
  priority queue**, which is what it should have been from the start.

- **A second axis is worth ruling while we are here: say it NOW versus say it
  WHEN IT BITES.** Most of the 77 are currently written as "first time you see
  X". A large share of them are better as "the first time X COSTS you
  something", which is both later and far more welcome. The three in the key
  turnover teaches more than the three in the key warning. That single re-aiming
  probably removes twenty cards from the opening ten minutes without deleting a
  single row from this file.

# Found while counting · verdicts attached

- **The Settings screen says the music is "5 tracks". `audio.js` has 8**
  (menu, game, win, lose, tutorial, paused, daily, cursed) and the Rulebook says
  "any of the eight". One of the two is wrong on the live site.
  **FILED**, here, as the first item in this file's own list, and cross-filed to
  V0's B12 polish row when it is next touched.
- **`foul` appears zero times in `game.js` and zero times in `index.html`**,
  while DESIGN.md section 5 specifies fouls, free throws, the bonus and fouling
  out. The Rulebook describes contests without them, so the shipped game is
  coherent. **RULED as a DESIGN gap rather than a bug**, and DR-57 to DR-59 stay
  blocked until it is closed.

# What I need from Aaron

1. **The weight cut.** MUST only, or MUST plus SHOULD? Answered once, it settles
   both lists.
2. **One coach card per possession, yes or no.**
3. **The Gym's eighth station**: does the Rulebook move into the room, or keep
   its own door? CM-GYM-08 and the whole Rulebook section depend on it.
4. **Does a completed drill show it?** About six lines, and it is the cheapest
   progress feeling in the game.
5. **Anything in List One you want that I marked NO**, and anything you want
   killed that I marked MUST. I would rather be overruled now than build 41 of
   these and find out.

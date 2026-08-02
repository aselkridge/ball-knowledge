# 22af RUN ONE — findings, plain English (2026-08-01, rewritten 08-02)

Viewable version (same content, styled):
https://claude.ai/code/artifact/569d98af-1bd6-4c4a-b602-77838e8dacbf

**How to read this.** We asked 11 questions about how other games solved
problems Ball Knowledge has right now. Everything the research claimed was then
fact-checked by three independent checkers whose job was to try to DISPROVE it;
a claim needed 2 of 3 checkers to fail at disproving it to survive. About half
of everything asserted (13 of 25 checked claims) was disproven and thrown out.
Only survivors are below.

**Verdict words, defined once:**
- **ADOPT** — take the idea as-is, it fits.
- **ADAPT** — the idea is right but needs reshaping for basketball.
- **REJECT** — other games tried this and it fails; don't.
- **OPEN** — promising but not proven; needs another research pass.

## THE SCORECARD

4 of 11 questions answered well. Graded against pass/fail criteria written
down BEFORE the results came back, so the grading couldn't go soft after.

| Question | Result | What it means for the build |
|---|---|---|
| How did tabletop sports games handle spacing & slow possessions? | ANSWERED | Best answers of the run — findings 1–6 |
| How do board games manage a crowded board? | ANSWERED | The crowding problem has known fixes — finding 2 |
| How do games make every piece worth moving? | ANSWERED | Fixable with rules, no timer — finding 4 |
| How should TV mode handle secret cards? | HALF | TV answer landed (finding 7); spectator design came back empty |
| How should the heat multiplier work? | ANSWERED by Run A | NBA Jam recipe + soft reset — findings A1–A3 |
| What makes games end on time? | ANSWERED by Run A | Speed the middle, escalate the end, keep 11 — findings A4–A5 |
| What do the best trivia games do? | EMPTY | Daily Five / repeats wait for Run B |
| Alternating turns or whole-team turns? | EMPTY ×2 | Two runs, zero evidence — labeled recommendation in A7; one more shot in Run B, then playtest |
| How do complex games teach without a manual? | EMPTY | Drills-as-tutorial call waits for Run B |
| Has anyone built trivia-meets-board-strategy? | NOT PROVEN | One near-miss found (finding 8); search not thorough enough to say "nobody" out loud yet |
| What do players complain is missing? | EMPTY | Waits for Run D, which must quote real threads |

**Why so many empties:** the research tool splits any request into five search
lanes no matter how many questions it gets. Eleven questions fought over five
lanes and seven starved. Measured now, not guessed. Re-runs go out in groups of
three or fewer.

## THE FINDINGS

Most good answers come from **Blood Bowl** — fantasy football as a board game,
played and refined since 1986. It is the most battle-tested "sport on a grid of
squares" design in existence: effectively a 40-year playtest of our problems.

### Finding 1 · Defenders shouldn't block shots — they should make them harder. (ADAPT)
**What we learned:** In Blood Bowl you can always move through defended squares;
each nearby defender just makes the move riskier, and failing can end your whole
turn. Defense makes actions COST MORE, never makes them impossible.
**Why it matters:** Our measured problem — defenders choke 102% of shooting
tiles, no open floor — only exists because our defenders FORBID instead of TAX.
**The move:** Try: shooting from a contested tile is always allowed, but the
question gets one tier harder (or the basket pays less). The crowd becomes a
pricing system instead of a wall.
**How solid:** Strongest finding of the run. Three checkers each failed to
disprove it; the dice math was re-derived by hand against the official rulebook.
Sources: https://grumbbl.co.uk/screening-in-blood-bowl/ ·
https://bbtactics.com/cage-basics/ · https://bbtactics.com/dodge/

### Finding 2 · The "Open floor" switch has four settings; we've only tried one. (ADAPT)
**What we learned:** War board games spent 50 years tuning how much a defender
controls nearby squares, and found four levels: hard stop (can't enter) ·
no chaining (can enter, but not move defended-square to defended-square) ·
pay a toll (defended squares cost extra) · trapped (can't leave).
**Why it matters:** Open floor (defenders lose their diagonal reach) is one
point on this dial, picked before we knew the dial existed.
**The move:** One afternoon of paper testing the alternatives before the V0
default locks. See THE ONE DECISION below.
**How solid:** Checkers traced it past Wikipedia to the 1977 industry rulebook
that coined the terms. Source: https://en.wikipedia.org/wiki/Zone_of_control

### Finding 3 · Good defense uses fewer bodies — spread out, two lines deep. (ADAPT)
**What we learned:** Blood Bowl's textbook defense leaves two empty squares
between defenders and adds a second row behind. Bodies cover a third of the
line; the DEPTH is what stops you.
**Why it matters:** "Is 5v5 too many pieces, or the board too small?" — maybe
neither. Change the gating rules (finding 1) and spacing may just happen.
**The move:** Don't touch roster size or board size yet. Change the defense
rules first, then look at the board.
**How solid:** Confirmed word-for-word, plus an independent second guide.
Sources: https://grumbbl.co.uk/screening-in-blood-bowl/ ·
https://lparchive.org/Blood-Bowl-(by-GNU-Order)/Update%2006/

### Finding 4 · One rule fixes idle pieces AND long possessions. No timer. (ADAPT)
**What we learned:** In Blood Bowl a failed risky action ends your ENTIRE
team's turn. So good players make every safe off-ball move first and save the
gamble for last. Every piece moves every turn — not forced by a rule, but
because moving them first is free and skipping them wastes the turn.
**Why it matters:** We already have the seed: a missed question ends the
scoring attempt. Missing is the ordering — cheap off-ball moves BEFORE the
shot, so a possession has a shape: set up, set up, then gamble.
**The move:** Structure the turn so off-ball positioning is free/safe before
the shot, and the shot is the possession-ending gamble taken last. Both
measured problems are downstream of this one shape.
**How solid:** Verified against the official rulebook; "safe moves first" is
universal advice across four separate strategy communities.
Sources: https://www.tabletopbattles.com/the-goonhammer-blood-bowl-combine-risk-management-basics ·
https://blood-bowl.leevigraham.com/rule-book

### Finding 5 · Give bench pieces jobs; never let defensive camping win. (ADAPT + REJECT camping)
**What we learned:** Protecting pieces have a concrete job every turn — end the
turn standing where no defender threatens, a spot that moves as the defense
moves. And every source agrees: a team that only sits back and covers space
LOSES, because it never forces mistakes.
**Why it matters:** "Pieces just sit there" isn't fixed by punishing sitting —
it's fixed by giving each piece a small job that refreshes every turn. If
blanket defense is ever our best strategy, the game is broken.
**The move:** Two rules to try: an "open man" bonus for off-ball pieces ending
the turn unguarded; a defensive role that rewards pressuring the ball over
parking in space.
**How solid:** Quotes confirmed word-for-word; settled community consensus
(labeled consensus, not official rules).
Sources: https://bbtactics.com/cage-basics/ ·
https://exit23.games/blogs/blood-bowl/defense-101 ·
https://www.goonhammer.com/blood-bowl-how-to-advance-your-cage/

### Finding 6 · Basketball board games feature ONE matchup per possession. (ADAPT)
**What we learned:** Strat-O-Matic Basketball — America's longest-running
basketball board game, built on real stats like ours — never gives all ten
players a job. A card flip picks the featured player and the possession
resolves through his duel with his defender. Everyone else is context.
**Why it matters:** We treated "most pieces have nothing to do" as a bug. The
closest game to ours treats it as how basketball works: each possession is a
story about one matchup.
**The move:** Design each turn around ball-handler vs nearest defender; the
off-ball rules from findings 4–5 carry everyone else. Warning: this game's
claims about court SPACING all failed fact-checking — take the spotlight idea
and nothing else.
**How solid:** Moderate. From the publisher's own product page — trust that the
mechanic exists, not that it's automatically fun. One of three checkers
dissented. Sources: https://www.strat-o-matic.com/board-games/ ·
https://www.strat-o-matic.com/product/basketball-advanced-action-deck/

### Finding 7 · TV mode: cards stay on phones, the reveal happens at the shot. (ADOPT)
**What we learned:** Jackbox (phones as controllers, game on the TV) solved our
exact problem in Push the Button: secrets live on each phone, the TV shows only
results, and the secret is revealed to the room at the dramatic moment. Their
engineer's point: the phone is the only controller that can whisper something
different to each player.
**Why it matters:** The worry was hidden cards make TV boring for watchers.
Answer: the hiding is fine — the REVEAL is what entertains the room.
**The move:** Board on TV, cards on phones, the question shown to the room the
moment the shot goes up. Don't leak it early; don't hide it forever.
**How solid:** Named Jackbox engineer on record + official product page. Caveat:
the only survivor on this question — spectator design in poker/card games came
back empty (Run B gets it).
Sources: https://www.builtinchicago.org/articles/jackbox-games-design-party-pack ·
https://www.jackboxgames.com/games/push-the-button

### Finding 8 · The moat: one near-miss found; nobody found on our square. (OPEN)
**What we learned:** Exactly one shipped game gates gameplay behind trivia the
way we do: Quiz RPG: The World of Mystic Wiz (Japan, 2013) — answering trivia
made your characters attack. 26M+ downloads, dead by 2017. It had NO BOARD and
NO POSITIONING — trivia-powered combat, not trivia-powered strategy.
**What it got wrong (steal the lessons):** its harshest review called it
shallow and greedy — pay-to-win grinding, and answers judged on SPEED rather
than knowledge. Our design already avoids both. The core loop was loved; the
wrapper killed it.
**The move:** Act as if the moat is real; don't SAY it publicly yet. The search
wasn't documented well enough to claim "nobody has done this" out loud. Run C
exists to make the claim solid — one question, the whole search to itself.
**How solid:** The game and its mechanic: triple-confirmed. The "nobody else
exists" half: NOT proven — the claim "no spatial layer anywhere" was itself
disproven 0-3, meaning the search missed things.
Sources: https://en.wikipedia.org/wiki/Quiz_RPG:_The_World_of_Mystic_Wiz ·
https://jayisgames.com/review/quiz-rpg-world-of-mystic-wiz.php ·
https://www.pcmag.com/article2/0,2817,2430225,00.asp

### Finding 9 · Six questions returned nothing. Don't decide those things yet. (HOLD)
Heat numbers, target score, turn order, tutorial approach, Daily Five design,
and the wishlist all returned ZERO claims that survived checking. Not weak
answers — no answers. **The move:** freeze those five decisions until the
re-runs report. Every one of the 13 disproven claims was on these questions —
the research tried and its answers didn't hold up. Better to know.

## THE ONE DECISION ONLY AARON CAN MAKE

The plan ships Open floor (defenders lose diagonal reach) as the V0 default.
Findings 1–2 push back: the best prior art keeps the defender's reach and makes
it a TAX, and there are two untried settings on that dial.
- **Option A — ship as planned.** Already built; measurably opens the board
  (102% choked → 57%). Test alternatives later.
- **Option B — one afternoon of paper testing first.** Printed board, pencil:
  "contested shot = harder question" vs Open floor. If the tax version feels
  better, the 20 testers never learn rules that then change under them.
Both defensible. B recommended only because changing core rules AFTER the
group learns the game costs more than an afternoon.

# RUN A FINDINGS — heat, game length, turn order (returned 2026-08-02)

Scorecard, same pre-set criteria: **heat ANSWERED · game length ANSWERED ·
turn order FAILED for the second run in a row.** Only 2 of 25 checked claims
were disproven this time (run one: 13 of 25) — three questions instead of
eleven got each one real search depth. Named gaps that stayed open: the
psychology of streak resets, and whether fouls actually shorten games anywhere.

### A1 · NBA Jam already wrote our heat recipe — and it's not a multiplier. (ADAPT)
**What we learned:** NBA Jam (1993, the direct ancestor): ON FIRE ignites after
exactly **3 makes in a row**; it ends when **the opponent scores** (not on a
timer, not on your own miss) or self-caps after 4 more makes. And the payout is
NOT bigger points — it's **abilities**: better accuracy, unlimited turbo,
goaltending immunity. The hot player becomes more CAPABLE, not worth more.
**Why it matters:** That shape is the verified answer to the runaway-leader
worry. If ON FIRE multiplied points, the leader snowballs; abilities make the
run FEEL huge without breaking the score race.
**The move:** 3 card wins in a row ignites · opponent score breaks it · payout
is an ability (easier tier in sweet spots, an extra attempt, unlock the logo
zone — pick in playtest) · self-cap so it can't run the whole game.
**How solid:** four claims, all survived 3-of-3 checking; the official SNES
manual is the primary source.
Sources: https://en.wikipedia.org/wiki/NBA_Jam_(1993_video_game) ·
https://www.world-of-nintendo.com/manuals/super_nes/nba_jam_tournament_edit.shtml ·
https://www.nba-live.com/ww-why-being-on-fire-was-so-cool-in-nba-jam/

### A2 · When the streak breaks, halve the heat — don't zero it. (ADOPT)
**What we learned:** Beat Saber (the best-selling rhythm game) steps its
multiplier 1x→2x→4x→8x, capped — and a break **halves** it (8x→4x) instead of
wiping it. The only shipped, verified data point on how harsh a reset should be.
**The move:** a missed question drops heat one tier. It never zeroes. Cap the
top. The cap prevents runaways; the halving keeps a player in it after a miss.
**How solid:** 3-of-3, from the game's own reference wiki.
Sources: https://bsmg.wiki/ranking-guide.html

### A3 · Do NOT multiply points in a race to 11. (REJECT the multiplier shape)
**What we learned:** Balatro's famous exponential scaling works because its
TARGETS are exponential (300 → 1,200,000). Our target is a flat 11. Exponential
payout against a flat target is the textbook runaway leader.
**The move:** heat payout stays flat or stepped, never multiplicative. Combined
with A1: this is why ON FIRE should grant abilities, not point multiples.
Sources: https://balatrowiki.org/w/Guide:_Scaling ·
https://balatrowiki.org/w/Blinds_and_Antes

### A4 · When shipped games ran long, designers pulled the SAME two levers — and nobody lowered the target. (ADOPT the pattern)
**What we learned:** Three independent studios, primary sources (patch notes,
designer memoir): Teamfight Tactics cut 10 seconds from five round types AND
added late-game damage aimed at "the .01% that just need to move on." Clash
Royale cut the match from 6 to 5 minutes AND tripled late-game resources. Sid
Meier fixed Civilization's pace by halving the MAP a month before ship. The
pattern: **speed up the middle of the game, escalate the end of the game.** No
verified case anywhere of lowering the win target to fix pace.
**Why it matters:** our instinct was "maybe 11 is too many points." The
evidence says: keep 11, attack the 11 interaction stops per possession and the
distance a possession travels, and let the endgame escalate.
**The move:** (1) count seconds, not points — trim the stops per possession;
(2) shrink distance-to-shot so possessions resolve in fewer turns (the Civ
translation); (3) escalate late — e.g. every tile worth +1 once someone
reaches 8, or a sudden-death trigger on game length.
**How solid:** the strongest-sourced findings in either run — official patch
notes + a designer memoir. Caveat carried: TFT and Clash each pulled BOTH
levers at once, so evidence supports the pair, not either lever alone.
Sources: https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/teamfight-tactics-patch-12-13-notes/ ·
https://supercell.com/en/games/clashroyale/blog/release-notes/november-update/ ·
https://www.pcgamesn.com/sid-meiers-memoir-civilization

### A5 · Sudden death is a repair, not a starting rule — and it must test the real skill. (ADOPT placement + the warning)
**What we learned:** Tennis invented the tiebreak (1965) explicitly to rescue
matches that had proven interminable — sudden death enters when a game has
gone long, it isn't how you start. And Smash Bros. shows the failure mode: its
sudden death makes hits so cheap that it rewards running away — a DIFFERENT
skill than the match tested — so tournaments literally ignore it and replay.
**The move:** trigger sudden death off a length condition (turn count or
clock), exactly as planned — and design it as "next made basket wins, every
tile costs one question." The core skill, made decisive. Never a version where
avoiding questions is the winning play.
**How solid:** 3-of-3 across tennis history (the 1954 83-game final verified)
and the Smash wiki + tournament rulesets.
Sources: https://www.tennis.com/news/articles/1970-the-tiebreaker-is-introduced ·
https://www.ssbwiki.com/Sudden_Death · https://www.ssbwiki.com/Tournament_rulesets_(SSBU)

### A6 · Still unknown — don't let anyone cite "research" for these. (HOLD)
No verified evidence anywhere on: how harsh a reset players will tolerate
(psychology), deckbuilder energy economies, or whether fouls/free-throws
measurably shorten games in any shipped title. The reset dial and the
fouls-fix-pace hypothesis get settled by OUR playtests, not by citation.

### A7 · Turn order: two research strikes — here's the recommendation, honestly labeled. (UNVERIFIED)
Zero claims about turn structure in shipped two-player games survived checking,
in either run. The recommendation below is design reasoning, not evidence:
**keep alternating possessions.** The 15-second question is the game's atomic
beat, so the waiting player's downtime is short and bounded — and if playtests
show they disengage anyway, the fix is to give the DEFENDER something to do
inside the question beat (answer the same question to contest or steal), not
to rebuild the turn system. Do not build team turns or simultaneous resolution
on research grounds; there are none.

## AARON'S RULINGS (2026-08-02, via artifact feedback — all filed)

1. **HEAT: DECIDED — abilities, not multiplier.** ("lovveeeee the abilities
   heat!!!") Locked in DESIGN.md §6; the V0 item and 22y idea 1 updated.
   Miss = drop one tier, never zero (A2 agreed). No point multiplication
   anywhere in heat (A3 agreed).
2. **OPEN FLOOR: DECIDED — ship Open floor as default now; build the gating
   rule as a parameter with the alternates behind a playtest toggle for Aaron
   + brother.** Not exposed to the 20-person group (feedback would splinter).
   Logged at 22ac item 22.
3. **TV MODE (F7): ADOPTED** as designed — cards on phones, reveal at the shot.
4. **Off-ball incentives (F5): loved, with a binding constraint — every
   incentive must be VISIBLE on screen.** Logged at 22ac item 25.
5. **No lowering the target score (A4): agreed.**
6. **Correction Aaron caught in F1's framing:** shots were NEVER forbidden in
   the game — a defender within 1 square makes a shot CONTESTED (block card in
   play), which is already "priced, not blocked." The real 102% problem is the
   tax being UNIFORM: everything contested equals nothing open, so positioning
   stops mattering. The F1 recommendation, corrected: keep blocks exactly as
   they are; make the PRICE graduated (more defenders nearby = harder
   question / weaker shot) so there's a difference between a bad shot and a
   terrible one. Artifact text fixed.
7. **New spec question from Aaron (F4):** if the final action is a PASS, does
   the defense get a beat before the catch-and-shoot? Today, per DESIGN.md:
   no — a pass that arrives to an open man can be shot, and contest depends
   only on defender adjacency at that moment. Aaron's instinct ("defense
   first before you can shoot, right?") = a closeout mechanic: defender gets
   a reaction slide toward the receiver, scaled by Defense rating, before the
   shot resolves. NOT decided — needs a spec + playtest. Filed as open.
8. **22ad team-turns toggle vs A7:** still open, low stakes — don't build
   both.

# RUN B FINDINGS — trivia, teaching, spectators, turn order (returned 2026-08-02)

Scorecard, same pre-set criteria: **trivia mechanics ANSWERED (3 of 4 halves) ·
teaching ANSWERED with the required recommendation · spectators FAILED ·
turn order FAILED a third time and is CLOSED — playtesting decides both.**
19 of 25 checked claims survived. Named refuted stats that must never be
quoted: Duolingo's "3.6x streak multiplier", Trivia Crack's "50M questions",
the fine-grained Wits & Wagers odds table.

### B1 · Repeats are a feature, and Duolingo proved it on 3.3 million people. (ADOPT — with a contradiction flag)
**What we learned:** Duolingo's entire learning engine schedules the SAME item
back at widening intervals (peer-reviewed paper + open-sourced code); their
improved scheduler raised daily engagement +12% in a 3.3M-student experiment.
Re-seeing a question is the mastery moment, not a bug.
**Why it matters:** "cards remember you" was designed as a NEVER-REPEAT list
(idea bank #6). The strongest evidence in this whole research program says the
opposite: track per-player history and schedule smart repeats.
**⚠ Aaron's call:** never-repeat (fresh-challenge feel) vs spaced-repeat
(you actually learn ball knowledge — the game's own name argues this side).
Sources: https://research.duolingo.com/papers/settles.acl16.pdf ·
https://github.com/duolingo/halflife-regression

### B2 · Two shipped answers to expert-vs-novice. (ADAPT both)
**Wits & Wagers:** nobody has to KNOW — everyone guesses, then bets on whose
guess looks right. A clueless player competes by reading people. Maps to: a
side-wager where the defender bets on whether the shooter makes it.
**LearnedLeague:** every match, you assign point values to the questions your
OPPONENT gets — you can answer better and still lose by misjudging what they
know. Maps to: defender picks which category the shooter faces.
Both feed the handicap system (idea bank #13).
Sources: https://en.wikipedia.org/wiki/Wits_and_Wagers ·
https://learnedleague.com/thorsten/primer.php

### B3 · The Daily Five: same five for everyone, forgiving streaks, seasons. (ADOPT)
**Wordle's creator, verbatim:** one-a-day wasn't the magic — *"if everybody was
getting a different word... it wouldn't have caught on."* The SHARED puzzle is
the habit. Confirms idea bank #4's "same five for everyone" with primary
evidence. Duolingo's A/Bs: streak FORGIVENESS (freezes) and milestone
celebrations measurably beat rigid streaks — if Daily Five ships a streak,
ship forgiveness day one. LearnedLeague's alternative: bounded SEASONS with
off-weeks (20 years of paid membership), which also solves lapsed-player
re-entry. **REJECT** guilt-trip notifications — Wordle's growth came from
demanding nothing.
Sources: https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/ ·
https://blog.duolingo.com/how-duolingo-streak-builds-habit

### B4 · Teaching: promote the drills into the tutorial. (ADOPT — scope flag)
The required recommendation, on a primary source (George Fan's GDC talk on
Plants vs Zombies — built to carry a complete non-gamer to the end with no
rulebook): tutorial-as-first-level, one rule per drill (move → tiers →
contest → fouls → heat), "not feel like a tutorial at all." The drills
already exist in the rulebook — this promotes them.
**⚠ Aaron's call:** drills-as-tutorial is currently in NOT-IN-V0 (your scope
ruling). The research now argues for promoting it. Scope is yours; the
evidence just moved.
Sources: https://www.gdcvault.com/play/1015541/How-I-Got-My-Mom

### B5 · Nothing verified on: teach-on-a-miss, spectator reveal timing, turn order. (HOLD)
Q1c (does showing the answer after a miss help or slow?): decide by feel —
idea bank #3 stays on instinct, honestly labeled. Q3 (when the room sees the
question in TV mode): zero prior art found even on poker's hole-card cam —
couch-playtest it; run one's Jackbox reveal-at-resolution finding stands as
the only evidence. Q4 (turn order): third strike, CLOSED FOREVER per the
brief — alternating stays, playtesting owns it now, and no future session
gets to reopen it as a research question.

## AARON'S RULINGS ON RUN B (2026-08-02, via artifact feedback — all filed)

1. **Repeats (B1): DECIDED, refined same day — EVERYTHING repeats; correct
   answers wait a lot longer.** Missed cards return soon and keep returning
   until beaten; made cards return on a much longer clock. Logged at 22ac 33.
2. **Wager/defense mechanics (B2): PLACED — options in handicap matches,**
   not core rules. Logged at 22ac 34.
3. **Daily (B3): shape RULED across two refinements — TWO ROUNDS OF FIVE.**
   Round 1: make five shots. Round 2: STOP five shots (block cards — the
   player defends). Perfect 10 unlocks the bonus round, unique question
   style (heat-check proposed). Both card types already exist in-game;
   the name Daily Five survives as five-per-round. Mock at v3.
4. **Drills (B4): RULED — "I love it."** Coach nudge at the main menu +
   sequenced drills become the front door; the rulebook wall-of-text
   relocates to a reference home (exact spot TBD). Logged at 22ac 36.
5. **Teach-on-a-miss (B5): DECIDED — never show the answer.** The card
   taunts on a miss ("I'LL ​BE BACK.") and its scheduled return is the second
   chance — keeps the player guessing and coming back. Turn order stays
   closed; TV reveal design reconfirmed.

## WHAT HAPPENS NEXT

- **RUN A — DONE (08-02).** Brief: `design/22af-runA-brief.md`.
- **RUN B — DONE (08-02).** Brief: `design/22af-runB-brief.md`. Findings above.
- **RUN C — LAUNCHING (Aaron pre-authorized "we will run c after b"):** the
  moat, alone, with documented scope.
- **RUN D — on request:** the player wishlist, quoting real threads.

## TECHNICAL LEDGER (the audit trail; safe to skip)

Run: 106 agents, ~4.7M tokens across original + stall-resume. Mixed models
(~2/3 Opus 5, remainder + synthesis Fable 5 after a mid-run switch). 109 claims
extracted → 25 fact-checked under budget (6 dropped unchecked — named per the
no-silent-caps rule) → 12 survived / 13 disproven (52% kill rate) → 9 findings
after merging duplicates. Weakest sourcing, flagged: finding 2 (single traced
source), finding 6 (publisher marketing), finding 7 (2-1 vote). Nothing
quarantined; no dead links among survivors. Scorecard criteria pre-registered
in `.claude/skills/design-research-brief/SKILL.md` Part 1b; by its decision
rule (7 of 11 failed ≥ 6) the run formally "did not do its job" — the four
passes are kept, only failures re-run.

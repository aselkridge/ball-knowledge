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
| How should the heat multiplier work? | EMPTY | Don't set heat numbers yet — Run A is on it |
| What makes games end on time? | EMPTY | Keep target 11 for now — Run A is on it |
| What do the best trivia games do? | EMPTY | Daily Five / repeats wait for Run B |
| Alternating turns or whole-team turns? | EMPTY | No recommendation yet — Run A must deliver one |
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

## WHAT HAPPENS NEXT

- **RUN A — RUNNING NOW (launched 08-02):** heat economy (NBA Jam's own on-fire
  rules, Balatro, deckbuilders) · what ends games on time · turn order, with a
  required recommendation. Brief: `design/22af-runA-brief.md`.
- **RUN B — on request:** trivia mechanics, teaching without a manual, and the
  spectator half TV mode still needs.
- **RUN C — on request:** the moat, alone, with documented search scope.
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

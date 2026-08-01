# 22af — RUN ONE brief (paste block)

Locked 2026-08-01. Written by `design-research-brief`. Question list is the
locked 11 in `BUILD.md` §22af — if that list changes, this file is regenerated,
not edited alongside it.

**Size note.** Eleven questions with a constraints preamble is a large single
run. If `/deep-research` caps out, split by QUESTION — questions 1–6 then 7–11 —
and paste the whole "The game" + "Output rules" sections into BOTH halves. Never
split by dropping the preamble; findings written without our constraints come
back as a reading list, which is the exact failure this brief exists to prevent.

---

## PASTE FROM HERE

I am designing a turn-based basketball strategy game and I want to know what
other games have already solved, so I stop re-deriving solved problems. This is
comparative design research, not fact-gathering. Study GAMES.

**THE GAME.** Ball Knowledge. Two players, turn-based, on a rectangular tile
grid court with a hoop at each end — think chess-like movement, basketball
shape. Every scoring attempt is gated by a basketball trivia question: the tile
you shoot from sets the difficulty and the points (layup zone = easy, 2 pts;
mid-range = medium, 2; three-point zone = hard, 3; logo zone = specialists only,
hard+, 3). Positioning, shot selection and skill timing decide close games;
knowledge gates whether you score at all. Design north star: *knowledge is your
athleticism, strategy is your coaching.* Pieces are real players; their ratings
bend the mechanics rather than adding points (a great handler crosses over from
further out; a great shooter gets one wrong answer greyed out in his sweet
spots). Cards drawn are private to each player. First release ships to a
20-person friend group.

**THE NUMBERS I AM DESIGNING AGAINST — these are measured, not vibes:**
- NBA 5v5 on the current 15x8 board: **44 tiles you can actually shoot from, and
  defensive coverage of 102% of them.** A defender gates his own tile plus all
  eight neighbours (9 tiles each, diagonals counting). There is no open floor.
- Dropping diagonal gating (orthogonal only) takes the same board to **57%**.
  That change — the "Open floor" toggle — is about to ship as the default and I
  want to know whether it is the right lever.
- 3v3 on a smaller 8x7 board runs at **71%**.
- Games run long: **games to 11 points routinely do not get finished.** A
  playtester: *"scoring takes a long time, I have never actually finished a game
  to 11."* There are 11 distinct places the game stops for an interaction.

**LIVE DECISIONS.** Every question below is attached to a call I am making now.
I need answers that let me DECIDE, not summaries.

1. **TABLETOP SPORTS GAMES — the closest prior art, and I want it first.**
   Strat-O-Matic, Blood Bowl, Statis Pro Basketball, APBA, Title Bout, and the
   wider tabletop-sports lineage. Somebody has abstracted basketball (or another
   invasion sport) onto a grid with cards or dice, probably many times. How did
   they handle SPACING, OFF-BALL MOVEMENT, and POSSESSION LENGTH — the exact
   three things measured as broken above? What did they do about the fact that
   most players on the floor have nothing to do on a given turn?
   → decides: the Open floor toggle, board size, piece count.

2. **DENSITY AND SPACING IN ABSTRACT GAMES.** Chess opens congested ON PURPOSE —
   32 pieces on 64 squares — and trading pieces is what opens the game up; the
   endgame is where the space is. Go inverts it: an empty board that fills. How
   do abstract games set piece count against board size, and do they design an
   ARC of density across a game rather than a constant? Is 102% saturation
   necessarily a bug, or is it an opening phase that needs an exit?
   → decides: whether I fix saturation with a smaller roster/bigger board, or
   design a density arc instead.

3. **IDLE PIECES.** Every turn-based tactics game faces "why would I move this
   guy?" Who solved it and how — zones of control, opportunity attacks, area
   objectives, per-piece resources, activation limits, pieces that decay if
   unused? I want mechanisms that make off-ball pieces matter WITHOUT adding a
   real-time timer.
   → decides: whether "pieces sitting still" is fixable structurally.

4. **REWARD CURVES AND ECONOMIES.** How do games price effort against payout?
   Roguelikes and deckbuilders have tuned this for decades — streak bonuses,
   escalating multipliers, risk-for-reward, when a multiplier resets and how
   harshly. I have a "heat" mechanic (build heat, get ON FIRE) and I am about to
   invent its exchange rate from scratch. What are the known-good shapes, and
   what are the known failure modes (runaway leaders, multiplier hoarding,
   players refusing to spend)?
   → decides: the heat multiplier numbers.

5. **PACING AND GAME LENGTH.** What ends a game ON TIME without a clock players
   resent? Race-to-N, escalating stakes, sudden-death endgames, phase changes,
   round limits, tightening economies. Specifically: when a game is too slow, is
   the fix usually LOWERING the target, SPEEDING each turn, or ESCALATING value
   late? What are the trade-offs of each, with named games?
   → decides: target score, whether fouls alone fix pace, where sudden death
   lives.

6. **TRIVIA MECHANICS, from the good ones.** Four sub-questions, each a live
   decision: (a) REPEATED QUESTIONS — how do quiz games handle a player seeing
   the same question twice, and is remembering it a bug or a feature? (b) MIXED
   KNOWLEDGE GROUPS — how does an expert play against a novice without either
   being bored? (c) TEACHING ON A WRONG ANSWER — who does this well, and does it
   slow the game down? (d) SOLO DAILY LOOPS — what makes a daily quiz a habit
   rather than a chore, and what kills it?
   → decides: The Daily Five, cards-remember-you, adaptive difficulty.

7. **TV + PHONE PARTY GAMES (the Jackbox lineage), and hidden information.** One
   shared screen, everyone's phone as a private controller. What makes the format
   work and where does it break — player counts, latency, dead air, spectators?
   And the part I care most about: our cards are PRIVATE, so on a TV the audience
   cannot see them. How do hidden-information games (poker, Stratego, Hanabi,
   social deduction) keep things FUN for the person who cannot see the hidden
   thing, rather than boring? What do broadcast/spectator versions reveal, and
   when?
   → decides: TV/couch mode, which is in the first release.

8. **TURN STRUCTURE: simultaneous vs alternating vs team turns.** Mario+Rabbids
   moves every piece each turn; XCOM alternates sides; some games resolve
   simultaneously. What does each do to PACE, to downtime, and to the feeling of
   control? **Give me a recommendation for a 2-player game where each turn
   contains a ~15-second question, not just a comparison** — I am deciding
   whether to move this up the build order based on your answer.

9. **TEACHING WITHOUT A MANUAL.** How do mechanically complex games onboard
   without a wall of text? Tutorials-as-first-level, drills, progressive rule
   reveal, AI-guided first games, teaching via constrained scenarios. What is the
   evidence on which approach retains players? **Give me a recommendation** — my
   rulebook is currently a wall of text with practice drills buried in it, and I
   am deciding whether to promote drills-as-tutorial into the first release.

10. **THE MOAT — the highest-value question in this run.** Who else has fused a
    KNOWLEDGE TEST with a POSITIONAL/SPATIAL GAME, where what you know determines
    what your piece can do on a board? Not trivia games with a board you move
    around as a scoreboard (Trivial Pursuit) — I mean trivia as the resolution
    mechanic for a tactical position. Search video games, board games, tabletop,
    educational games, arcade, and defunct/failed products, not just current hits.
    **A NEGATIVE RESULT IS THE MOST VALUABLE ANSWER HERE — if almost nobody has
    done this, say that plainly and show me the scope of what you searched.** Do
    not pad the list with near-misses to make it look fuller; instead, label each
    hit as (i) genuinely the same fusion, (ii) adjacent, or (iii) superficially
    similar. For every genuine or adjacent one: did it ship, how did it do, and
    WHAT DID IT GET WRONG?

11. **THE UNMET WISHLIST — demand, not supply.** Every other question asks what
    other people BUILT. This one asks what players ASK FOR and do not get. Mine
    reviews, forums, subreddits, Discords, and store one-star reviews for trivia
    games, sports games, turn-based strategy and party games: what do people
    repeatedly complain about, and what do they say they wish existed? I want the
    gap between what players say out loud and what the market serves. Cite the
    actual threads and reviews — a link to a real complaint beats a paraphrase of
    a trend.

**OUTPUT RULES — these matter more than the questions.**
- **Per finding: name the GAME, the PROBLEM it solved, and a VERDICT for me —
  ADOPT / ADAPT / REJECT — with a reason.** A finding without a verdict is not a
  finding.
- **If a finding cannot be tied to one of the decisions listed above, leave it
  out.** I want decisions, not a reading list. A shorter document that changes
  four calls beats a long one that changes none.
- **A clickable URL per claim.** For question 11, cite the actual thread or
  review, not a summary of the discourse.
- **Negative results are findings.** "Nobody does this", "this was tried and
  failed", "the consensus is against it" are all valuable — say them plainly
  rather than padding.
- **Say what you could not find.** If a question came back thin, name it as thin.
  Silence reads as coverage and I will act on it wrongly.
- Where sources disagree, show the disagreement rather than picking a side.

## PASTE TO HERE

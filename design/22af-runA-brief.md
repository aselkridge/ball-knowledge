# 22af RUN A — economy & pace (brief)

Generated 2026-08-02 by `design-research-brief`. Three questions from run one's
failure list (Q4, Q5, Q8), grouped per the coverage rule: 3-4 questions max so
each gets its own search angle. Findings return to `design/22af-runA-return`,
intake per the skill, then `design/22af-findings.md` is updated in place.

---

## PASTE FROM HERE

COMPARATIVE GAME-DESIGN RESEARCH, second pass, narrow and deep. Three questions
only. A previous broad sweep answered spatial/board questions but returned ZERO
verified evidence on these three — they are re-run here alone so each gets full
search depth. Study GAMES and shipped mechanics, not theory.

THE GAME (context, unchanged): Ball Knowledge — two-player, turn-based
basketball strategy on a tile-grid court. Every scoring attempt is gated by a
basketball trivia question; the tile sets difficulty and points (easy 2 / medium
2 / hard 3). Each turn contains a ~15-second question clock. Games race to a
target score (currently 11). Measured problem: games to 11 routinely do not get
finished — "scoring takes a long time, I have never actually finished a game to
11." The game already has: fouls + free throws, a planned sudden-death moment,
and a HEAT mechanic — winning cards during a possession builds heat toward an
ON FIRE state — whose exchange rate (how much heat per win, what ON FIRE pays,
when heat resets) is currently being invented from scratch. These three
questions exist to stop that.

QUESTION 1 — THE HEAT ECONOMY. How do shipped games price streaks and
multipliers? Study specifically: NBA Jam's own on-fire rules (the direct
ancestor — how many makes to ignite, what it grants, what extinguishes it),
Balatro's mult scaling, Slay the Spire / deckbuilder energy-and-scaling
economies, rhythm/arcade combo multipliers (how harshly a break resets you),
and any game with a "hot hand" mechanic. I need: (a) known-good SHAPES — linear
vs step vs exponential payout, reset-to-zero vs decay; (b) known FAILURE MODES
with named games — runaway leaders, hoarding, players refusing to risk the
streak; (c) the psychology finding, if documented, on how harsh a reset players
tolerate before they stop engaging. → decides: heat gain per card, ON FIRE
threshold and payout, reset severity.

QUESTION 2 — WHAT ENDS A GAME ON TIME. Race-to-N vs round caps vs escalating
value late vs sudden death. When a shipped game was TOO SLOW, what did the
designers actually change — lower the target, speed each turn, or make late
points bigger? Named examples with before/after where they exist (patch notes,
designer interviews, post-mortems are gold). Also: where does sudden death
belong — from the start (deuce/ad in tennis, overtime in sports) vs as a
repair for slow games? And do fouls/free-throw-style "cheap fast points"
mechanisms measurably shorten games anywhere? → decides: keep target 11 or
change it, whether fouls alone fix pace, where sudden death lives.

QUESTION 3 — TURN STRUCTURE, WITH A RECOMMENDATION. For a TWO-PLAYER game
where every turn contains a ~15-second question: alternating single
activations vs team turns (whole side moves, Mario+Rabbids style) vs
simultaneous/programmed resolution. What does each do to downtime, pace, and
feeling of control — in SHIPPED two-player games, not theory? The previous
sweep's claims here all failed verification; this time END WITH A
RECOMMENDATION and the reasoning chain, because a build-order decision hangs
on it. A conditional recommendation ("alternating unless X") is acceptable;
a comparison table alone is a FAIL.

OUTPUT RULES:
- Per finding: the GAME, the PROBLEM it solved, a VERDICT for Ball Knowledge —
  ADOPT / ADAPT / REJECT — with a reason.
- A clickable URL per claim. Designer post-mortems, patch notes, and interviews
  outrank strategy blogs; strategy blogs outrank forum vibes. Say which tier
  each claim rests on.
- NUMBERS over adjectives: if NBA Jam ignites on 3 makes, say 3, with source.
- Negative results are findings; say "nothing shipped does this" plainly.
- If a question comes back thin, name it as thin. Silence reads as coverage.
- Question 3 must end with a recommendation or it has failed.

## PASTE TO HERE

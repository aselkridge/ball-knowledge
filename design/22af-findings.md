# 22af RUN ONE — findings (intake passed 2026-08-01)

Run: `/deep-research`, 106 agents, ~4.7M tokens across original + resume.
Mixed-model run: ~two-thirds Opus 5, remainder + synthesis Fable 5 (session
model switched mid-run; script pins none). Verification: 109 claims extracted,
25 verified under budget cap, **12 confirmed / 13 refuted (52% kill rate)**,
0 unverified. Intake per `design-research-brief` Part 1b/2.

## THE SCORECARD (criteria fixed before the run came back)

| Q | Topic | Verdict | Why |
|---|---|---|---|
| 1 | Tabletop sports | **PASS** | 5 findings, multiple 3-0 votes, cross-checked vs BB2020 rulebook |
| 2 | Density/spacing | **PASS** | ZOC taxonomy traced to SPI 1977 primary source |
| 3 | Idle pieces | **PASS** | Turnover/opportunity-cost mechanism, 3-0, multi-source |
| 7 | TV + hidden info | **PASS, thin** | TV half answered (1 finding, 2-1 vote); hidden-info half (poker/Hanabi/spectators) returned nothing |
| 4 | Reward curves / heat | **FAIL** | zero surviving claims |
| 5 | Pacing beyond turnover | **FAIL** | target-score evidence refuted 0-3; no race-to-N findings |
| 6 | Trivia mechanics | **FAIL** | both claims refuted, one on a misread |
| 8 | Turn structure | **FAIL** | demanded a recommendation; got refutations only |
| 9 | Teaching w/o manual | **FAIL** | sole claim refuted 0-3 |
| 10 | THE MOAT | **FAIL by criterion** | one valuable adjacent hit, but search scope never documented — an undocumented negative is unusable as a moat claim |
| 11 | Unmet wishlist | **FAIL** | nothing survived; zero threads cited |

**7 of 11 fail → by the pre-registered rule, the run did not do its job.**
Aaron's instinct to split was right. Amendment to the rule as written: the four
passes are verified and paid for — only the seven failures go back out (see
re-run plan). The five-angle harness cannot carry eleven questions; this is now
measured, not predicted.

## WHAT SURVIVED — 8 findings + 1 negative

**F1 · Blood Bowl prices coverage, never blocks it (HIGH, 3-0 ×3).**
Entering covered squares is legal but costs a dodge roll (-1 per tackle zone;
a screen forces two -2 dodges ≈ 11% at AG3); failure = knockdown + turnover.
The 102% problem is an artifact of BINARY adjacency gating, which the closest
prior art does not use. **ADAPT:** contested tiles bump question tier or cut
points, rather than blocking. The run's strongest lever.
[grumbbl screening](https://grumbbl.co.uk/screening-in-blood-bowl/) ·
[bbtactics cage](https://bbtactics.com/cage-basics/) ·
[bbtactics dodge](https://bbtactics.com/dodge/)

**F2 · Zones of control are a severity SPECTRUM (HIGH, 3-0).**
Rigid / semi-rigid / fluid / locking — four dials, not on/off. The Open-floor
toggle (binary, orthogonal-only) is one blind point on this spectrum.
**ADAPT:** paper-test semi-rigid and fluid variants against the toggle before
the default locks. Caveat: ZOC dials are MOVEMENT dials; our 102% measures
SHOT-gating — transfer is analogical.
[ZOC taxonomy](https://en.wikipedia.org/wiki/Zone_of_control) (verifier traced
to SPI, *Introduction to War Gaming*, 1977, p.23)

**F3 · Depth beats saturation: the Column defends at ~1/3 body density
(MEDIUM, 3-0).** Two empty squares between defenders, robustness from a second
line. **ADAPT:** before shrinking rosters or growing the board, test whether
reduced-coverage RULES make spaced defense emerge — the problem may be gating,
not piece count.
[grumbbl](https://grumbbl.co.uk/screening-in-blood-bowl/) ·
[lparchive](https://lparchive.org/Blood-Bowl-(by-GNU-Order)/Update%2006/)

**F4 · One mechanism fixes possession length AND idle pieces, no clock
(HIGH, 3-0 ×2).** The Turnover rule: risky actions can end your whole turn, so
correct play spends early activations on safe off-ball positioning and saves
the ball action for last. Idle pieces punished by opportunity cost,
structurally. **ADAPT:** risk-ordered turns — off-ball moves safe and first,
the shot (trivia) last as the turn-ending gamble. A missed question already
resembles a turnover; the skeleton exists.
[goonhammer risk](https://www.tabletopbattles.com/the-goonhammer-blood-bowl-combine-risk-management-basics) ·
[BB2020 rules](https://blood-bowl.leevigraham.com/rule-book) ·
[goonhammer intermediate](https://www.goonhammer.com/blood-bowl-moving-from-beginner-to-intermediate/)

**F5 · Off-ball pieces carry per-turn JOBS; pure blanketing loses
(MEDIUM, 3-0 ×2).** Cage escorts must END each turn outside enemy tackle zones
(re-solved every turn); doctrine splits the roster into screeners + hunters and
marks all-passive coverage as a losing pattern. **ADAPT** the per-turn
positional constraint + active pressure role; **REJECT** any design where
full-court blanketing is dominant.
[bbtactics](https://bbtactics.com/cage-basics/) ·
[exit23 defense](https://exit23.games/blogs/blood-bowl/defense-101) ·
[goonhammer cage](https://www.goonhammer.com/blood-bowl-how-to-advance-your-cage/)

**F6 · Strat-O-Matic spotlights ONE matchup per possession (MEDIUM, 2-1).**
The closest basketball sim never gives all ten players a job per possession —
an Action Deck picks the key man and resolves through his matchup. **ADAPT:**
design the turn around the featured matchup, give the other pieces the cheap
F4/F5 jobs. **REJECT** drawing spacing lessons from it — all three of its
spacing claims were refuted 0-3. Caveat: publisher marketing copy; proves the
mechanic exists, not that it plays well.
[strat-o-matic](https://www.strat-o-matic.com/board-games/) ·
[action deck](https://www.strat-o-matic.com/product/basketball-advanced-action-deck/)

**F7 · Jackbox's Push the Button is the private-cards-on-TV template
(MEDIUM, 2-1, verifier-rated high).** Phone carries the private info, TV shows
derived output only, identity revealed AT RESOLUTION — the reveal beat is what
keeps hidden info fun to watch. **ADOPT** for TV mode: card on phone, board on
TV, card revealed at the shot. Only surviving Q7 claim — spectator design in
poker/Hanabi went unverified.
[Jackbox engineering](https://www.builtinchicago.org/articles/jackbox-games-design-party-pack) ·
[Push the Button](https://www.jackboxgames.com/games/push-the-button)

**F8 · THE MOAT, provisional (MEDIUM, 3-0 on the hit; scope undocumented).**
One verified adjacent product: **Quiz RPG: The World of Mystic Wiz** (Colopl
2013) — trivia answers make units attack; 26M+ downloads, dead by Jan 2017;
critics split (Kotaku "brilliant" vs PC Mag 2.5/5 "shallow, grindy"). What it
got wrong per the negative review: grind-heavy F2P economy and a speed-gated
answer timer. Category (ii) adjacent — no spatial layer found, BUT the claim
"no spatial layer anywhere" was itself refuted 0-3, and the search scope was
never documented. **Provisional moat, not proven.** Q10 re-runs alone.
[Wikipedia](https://en.wikipedia.org/wiki/Quiz_RPG:_The_World_of_Mystic_Wiz) ·
[jayisgames](https://jayisgames.com/review/quiz-rpg-world-of-mystic-wiz.php) ·
[PC Mag](https://www.pcmag.com/article2/0,2817,2430225,00.asp)

**F9 · NEGATIVE FINDING (HIGH):** Q4, Q5-beyond-turnover, Q6, Q8, Q9, Q11
returned zero surviving claims. **REJECT** deciding the heat exchange rate,
target score, turn structure, drills-as-tutorial, or Daily Five on this run's
evidence. Silence is not coverage.

## CONTRADICTION FLAG — Aaron's call, not adopted, not dropped

F1+F2 recommend against the **binary Open-floor toggle shipping as the V0
default** (BUILD.md V0 scope: "Open floor already ships as the default").
Research says the binary toggle is one blind point on a four-dial spectrum and
the strongest prior art prices coverage instead of blocking it. Options:
(a) ship the toggle as planned, paper-test graduated variants after;
(b) paper-test fluid/semi-rigid vs the toggle BEFORE the default locks.
Cheap test either way — a paper playtest, not a build. **Decision: Aaron.**

## RE-RUN PLAN (the 7 failures, grouped 3-4 max per the skill)

- **Run A — economy & pace:** Q4 heat/reward curves (Balatro, Slay the Spire,
  NBA Jam's own on-fire rules) · Q5 target score / race-to-N · Q8 turn
  structure (needs a RECOMMENDATION).
- **Run B — trivia & teaching:** Q6 (all four sub-questions) · Q9
  drills-as-tutorial · Q7's unanswered half (spectator design in
  poker/Hanabi/social deduction).
- **Run C — THE MOAT, alone:** Q10 with documented scope; sweep Quiz Magic
  Academy lineage, educational games, defunct arcade. One question, five
  angles — the shape that makes a negative credible.
- **Run D — THE WISHLIST, alone:** Q11; demand-mining needs its own angles
  (subreddits, store reviews, forums) and must cite actual threads.

Fable-vs-Opus A/B opportunity: run A and B on different session models, same
brief structure, compare. Run one was mixed-model, so it can't settle this.

## KILL / QUARANTINE LEDGER
- Claim-level kill rate 13/25 (52%) — the filter bit.
- Budget cap dropped 6 extracted claims unverified (harness `budgetDropped: 6`)
  — named per the no-silent-caps rule.
- Nothing quarantined: no dead URLs among survivors. Weakest sourcing carried
  with flags: F2 (single traced source), F6 (publisher copy), F7 (2-1 vote).

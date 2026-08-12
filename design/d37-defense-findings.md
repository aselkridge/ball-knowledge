# D37 findings · the defense's answer to a free team setup (v2, 2026-08-12)

Viewable version (same content, styled):
https://claude.ai/code/artifact/0b4a8e42-3bcd-4d86-a19c-ae8a52fe936e

**The one decision:** what the defense gets, and when, now that the whole
offense sets up for free each turn (V0 D37). Aaron ruled the offense half
("It should be all pieces move free") and rejected the first defensive
proposal ("one player moving 2 squares as response to the whole team feels
unfair"). Nothing ships until he rules on this return.

**How this research actually happened, all of it:** the /deep-research
workflow failed twice on a tool error, so run one was done by hand in-session
(eight searches, six fetches, ten findings, v1 of this file). Aaron re-ran
the brief; a custom nine-agent workflow (five search lanes, three adversarial
verify lenses, one merge) then ran, stalled once on a verifier error, and
completed on resume. The resumed verifiers hit a broken permission handler
and returned nothing usable, but the first attempt's two verifiers had
working tools and their verdicts were recovered from the run journal. Net
verification: the six load-bearing claims were checked for real, four
CONFIRMED, one REFUTED in its strong wording (mine), one stuck at fan-site
level. Raw return archived verbatim at
`design/archive/d37-workflow-return-2026-08-12.md`.

**What verification changed, named plainly:**
- **My Blood Bowl claim was REFUTED as written.** I said the interception was
  the defense's only in-opponent-turn reaction and involved no decisions.
  The 2020 rulebook has the defending coach NOMINATE the interceptor, and
  skills (Dump-Off, Diving Tackle) are defender-chosen mid-turn reactions.
  The structural point survives (no defensive activations, reactions few and
  small); the absolutes do not.
  https://bloodbowlbase.ru/bb2020/core_rules/the_rules_of_blood_bowl/ ·
  https://mordorbihan.fr/en/bloodbowl/skills/2020
- **The PC Gamer line I quoted was overstated.** The piece REPORTS that
  decision points "can take minutes to resolve while you sit there staring
  at a frozen pitch"; it does not measure, it is a feature not a review, and
  the waits are largely bugs in the reaction-prompt system. My "third of
  matches locking up" line had no source and is withdrawn. The corrected
  version is stronger for us, not weaker: BB3 is the one digital sports game
  that prompts the NON-ACTIVE player mid-turn, and that is exactly where it
  bleeds.
  https://www.pcgamer.com/blood-bowl-3-is-a-hot-mess-and-not-just-because-of-its-game-breaking-bugs/ ·
  https://steamcommunity.com/app/1016950/discussions/0/3784750482948693222
- **Kill Team's Counteract quotes spot-checked accurate** (2" cap, free 1AP,
  once per operative), which matters because the recommendation leans on it.
  https://wahapedia.ru/kill-team3/the-rules/core-rules/

**Verdict words** (defined in 22af, reused): ADOPT · ADAPT · REJECT · OPEN.

## THE SCORECARD, graded before the writing

Pass = at least one named game, a verdict for us, and two distinct sources.

| Question | Result | Key finding |
|---|---|---|
| 1 · The response economy | ANSWERED | Kill Team's Counteract is the shipped match |
| 2 · One reaction vs mirrored turns, on mobile | ANSWERED, strongest | Information beats movement; interrupts are poison |
| 3 · Basketball's own answer | ANSWERED | Defense is a CALL, never mirrored pieces |
| 4 · The telegraph shape | ANSWERED | Works when honest and coarse; hidden-simultaneous degenerates |
| 5 · The moat question | NEGATIVE, scope stated | Nobody has shipped this economy |

## Q1 · THE RESPONSE ECONOMY

**Blood Bowl (ADAPT the risk half, corrected).** The defense gets no
activations during the offense's turn; its reactions are few, small, and
choice-shaped (nominate the interceptor, declare a skill), and the real
counterweight is the TURNOVER rule: any failed offensive action ends the
turn instantly. Both sides of the player argument live in one Steam thread:
"instead of having 1 player downed, you have 11 players that can't play...
frustrating" vs a 1988-veteran calling turnover "THE core rule" that keeps
games fast. Payment in risk imposed on the offense is a real currency.
https://bbtactics.com/bb54/ ·
https://steamcommunity.com/app/1016950/discussions/0/4766584846449989531/

**DreadBall (REJECT the timing, ADOPT the sizing).** Mantic's answer to
5-action Rushes: "Run Interference," exactly one defending piece, one-space
cap, and stripping the ball ENDS the Rush. One interrupt, tightly capped,
big payoff. But it fires mid-turn, which is the shape mobile cannot carry.
Snippet-only sources (pages would not fetch):
https://www.manticgames.com/news/whats-changed-dreadball-second-edition/

**Kill Team 2024 (ADOPT, the closest shipped match).** When one side runs
out of activations and the other gets a long unanswered run, the
out-of-activations player takes one free capped action BETWEEN each enemy
activation: "Counteract," 2" move cap, once per operative per turning point,
resolving AFTER the enemy action with full information. Shipped and accepted
in the most-played skirmish game going. It reads as fair not because it
matches volume but because it moves LAST with full information.
https://wahapedia.ru/kill-team3/the-rules/core-rules/ (spot-checked) ·
https://www.warhammer-community.com/en-gb/articles/2hZROZgi/these-smart-activation-rules-make-your-kill-team-clashes-more-tactical-and-reactive/

**Guild Ball (the negative-space proof).** Every game that achieved true
move-for-move parity did it by abolishing the team turn (strict alternating
single-piece activations). We keep the team turn, so parity must come from
something other than matched movement.
https://guild-ball.fandom.com/wiki/Turn_Sequence

## Q2 · ONE REACTION VS MIRRORED MOVEMENT, ON MOBILE

**XCOM overwatch (REJECT blind pre-commitment as the primary).** The
pre-committed auto-shot must be penalized (x0.7 hit) or it dominates; the
player thread has both failure modes: "overwatch creeping across the map is
boring and ludicrously effective." A commitment made BLIND cannot answer a
setup it never saw, which recreates the rejected unfairness on rails.
https://xcom.fandom.com/wiki/Overwatch_(XCOM:_Enemy_Unknown) ·
https://steamcommunity.com/app/268500/discussions/0/1743342466031978874

**Into the Breach (ADOPT the principle).** Few, small, FULLY INFORMED moves
against a whole revealed enemy wave, praised for exactly that trade and
playable in coffee-break sessions on a phone. Information is the currency
that buys down action-count asymmetry. The cost is think time, so under a
15-second beat the informed reaction needs a SMALL legal-option set; one
defender, 1-2 squares, is right-sized.
https://store.steampowered.com/app/590380/Into_the_Breach/ ·
https://steamcommunity.com/app/590380/discussions/0/1728711392726992819

**Wargroove (REJECT mirrored full movement).** Mirrored whole-army turns
multiply the watching load: "I want slick, clean, fast, responsive game,
where I can focus on strategy and not on waiting."
https://steamcommunity.com/app/607050/discussions/0/1778261844038260916/

**Hero Academy and MTG Arena (REJECT several small reactions).** Hero
Academy's five-action turns were tolerable only under batch-confirm plus
rewind, a UI tax our 15-second beat forbids; MTG Arena's priority windows
(a reaction offer at every meaningful moment) draw "unbearable... so slow"
complaints. Interleaving a micro-slide after each off-ball step rebuilds
priority-passing inside a shot clock. Snippet-level sources, flagged:
https://youarecurrent.com/2012/03/27/review-hero-academy-ios/ ·
https://steamcommunity.com/app/2141910/discussions/0/3904116162873826270

## Q3 · BASKETBALL'S OWN ANSWER

**Basketball Strategy, Avalon Hill 1974 (ADAPT the core).** No defender
moves at all: each possession the defense makes ONE call, cross-referenced
against the offense's play on a results matrix (the engine family of
Football Strategy's 10-defenses-vs-20-plays table, CONFIRMED via Wikipedia
and codex99). One decision stands for the whole team, with the caveat that
the games also carry match-up assignments, so "one" slightly oversimplifies.
https://en.wikipedia.org/wiki/Computer_Football_Strategy ·
http://www.codex99.com/design/100.html ·
https://boardgamegeek.com/boardgame/5304/basketball-strategy

**Statis Pro Basketball (ADAPT the double-team).** No court, no
repositioning; defense is a per-player rating plus assignment-shaped
decisions (primary-defender cards, double-team rules). "Send help" as one
declared decision with an automatic cost elsewhere answers a whole-floor
setup without more moves. Fan-site level sources, flagged:
https://spbasketball.jimdofree.com/ ·
https://statsportsgames.wixsite.com/statispro-basketball/spb

**Hoop League Tactics (ADAPT with both caveats, the closest cousin).** The
shipped mobile game nearest ours made defense a standing scheme: "Defensively,
you watch the action unfold" with per-matchup pressure settings (Operation
Sports, fetched). The complaint side is verified verbatim on the App Store
page: "the defending system. It's an absolute nightmare. 20% of the time i
can actually block the ball but the other 80% i cant," and the version
history confirms the settings mechanism. Scheme can run bodies; the human
beat must stay the defender's input. Single-player only, so it never faced
our PvP fairness question.
https://www.operationsports.com/hoop-league-tactics-a-mobile-slam-dunk/ ·
https://apps.apple.com/us/app/hoop-league-tactics/id1484372351

**The prototypes (REJECT, and note the pattern).** Both itch basketball
tactics prototypes mirror offense and defense piece-for-piece, and both
stalled at prototype. Every found basketball design lands in one of three
buckets: a declared call resolved abstractly, assignments plus ratings, or
auto-positioned bodies under a standing setting. NEGATIVE RESULT: no game
found anywhere models help defense as on-board multi-defender rotation.
https://monstermanmfr.itch.io/hoop-tactics · https://i4n-t.itch.io/basketball-tactics

## Q4 · THE TELEGRAPH SHAPE

**Into the Breach (ADAPT, sides swapped).** The reacting side commits
visibly BEFORE the opponent acts, and the commitment executes as committed,
which is what makes out-reading it feel earned.
https://ubm-twvideo01.s3.amazonaws.com/o1/vault/gdc2019/presentations/Into%20the%20Breach%20Postmortem%20Final.pdf

**Slay the Spire (ADOPT the two rules).** Intents are HONEST (a player
accused the game of lying about intent changes; the community answer:
"There is nothing that causes any enemy to change its intent that isn't
clearly listed on its effects bar," and the accuser conceded) and COARSE
(type and number, never full detail). A telegraph the player can catch lying
destroys the contract; a telegraph that tells everything solves the turn.
https://slaythespire.wiki.gg/wiki/Intent ·
https://steamcommunity.com/app/646570/discussions/0/5015307809836759698/

**Tecmo Bowl (REJECT hidden-simultaneous).** Both sides pick hidden plays
and a correct defensive guess collapses the play: "basically a game of Rock,
Paper, Scissors." A VISIBLE call converts the coin flip into a read.
https://www.tecmobowl-vs-rbi.com/tecmo-strategy.html

**Madden coverage shells (ADAPT later, the stale-read fix).** When good
players read the aligned coverage every snap, Madden added bounded DISGUISE:
a shell that shows one coverage and rotates at the snap, a look but never a
lie. If playtests show stale reads: board-dependent payoffs first, coarseness
second, disguise as a scarce earned resource last, never free.
https://www.1v1me.com/blog/madden-26-coverage-shells-custom-stem-zones-route-commit

**Yomi / Sirlin (ADOPT as the menu test).** "The first step to making a
rock, paper, scissors mechanic interesting is to have way different payoffs
for winning with each option." Every coverage call must be best against a
different offensive shape; if two calls are interchangeable, cut one.
https://www.sirlin.net/articles/designing-yomi

**Hoplite (ADOPT the delivery).** Threats readable ON THE BOARD, whole turn
one tap. A defensive call must be drawn on the court as a shaded zone, never
announced in a modal; reading it costs the offense zero taps.
https://www.pocketgamer.com/hoplite/review/

**NEGATIVE RESULT:** searched both games' Steam forums and Reddit for
"telegraphs make it autopilot / solved" complaints and found none; the
puzzle feel is named approvingly. The shape holds when honesty and payoff
asymmetry are respected.

## Q5 · THE MOAT

**No.** Scope, stated exactly: App Store pages for all four named candidates;
web searches targeting TouchArcade, Pocket Gamer, Screen Dynamite, NLSC,
Operation Sports, Reddit, BoardGameGeek, and itch.io, plus my hand run's
sweep of the same ground. No mobile turn-based sports game pairs a free
whole-team offensive setup with a single-response defense, and no source
anywhere praises a single-response defense for fairness. The candidates:
Hoop League Tactics (no PvP, sliders, see Q3) · Football Tactics Arena
(symmetric whole-team orders, execution complaints on its own store page) ·
EA Sports FC Tactical (not spatial, paired-choice resolution, and EA shut it
down May 2026, single-source date, flagged) · "Basketball Tactics
Association" DOES NOT EXIST (store searches return only whiteboard apps) ·
Football, Tactics & Glory (closest living relative: defense fires
automatically by position during the attacker's action block, and its
balance record is "more reliance on luck than strategy", the lesson being
that zero-tap auto-defense is hard to tune and opaque when it fires).
https://apps.apple.com/us/app/football-tactics-arena/id1359885310 ·
https://www.destructoid.com/reviews/review-football-tactics-glory/ ·
https://store.steampowered.com/app/1591850/Wednesday_Basketball/

## THE RECOMMENDATION, REVISED (v1's Rotation is demoted, and here is why)

v1 of this file recommended the Rotation: one slide plus deterministic help
steps for the other defenders. The workflow's wider sweep turned up the two
closest shipped analogues to auto-moving defensive bodies, and both bleed:
Hoop League Tactics' delegated defense draws the verified "absolute
nightmare" complaint, and Football, Tactics & Glory's auto-firing zones read
as luck and are the game's named balance problem. Deterministic-and-visible
mitigates but does not erase that; nothing shipped supports multi-body
automation, and two things warn against it. Best option wins, so the
Rotation drops to second.

**RECOMMENDED: THE CALL AND THE SLIDE.** Two halves, one at each end of the
possession, buying fairness with information and risk instead of squares:

1. **At the handoff, BEFORE the offense's free setup: one visible coverage
   call.** One tap from a small menu (4-5 calls, each best against a
   different offensive shape per the Sirlin test: protect paint, chase arc,
   shadow the star, press the ball). The call paints a shaded zone on the
   court, Hoplite-style, no modal, no confirm. It is honest and coarse per
   Slay the Spire's two rules: it never lies, and it declares WHAT is
   covered, never square-exact endpoints. The offense then does its free
   setup SEEING the call, so the setup becomes read-and-punish (Into the
   Breach) instead of an unanswered race.
2. **After the main action resolves: the existing slide, unchanged.** One
   defender, 1-2 squares by position, now serving the declared call. This is
   Kill Team's Counteract shape exactly (informed, last-moving, small,
   capped), spot-checked accurate and shipped in the most-played skirmish
   game going. Zero new taps on the pacing heart.
3. **The equalizer is risk (Blood Bowl):** a missed question does not just
   fail the shot, it strands the whole setup; the free steps are spent and
   the defense keeps its slide.

Why this answers the rejected "one defender slides 2": that version was an
uninformed reactive crumb. The evidence says one move was never the problem;
blindness and timing were. Informed, last, and paired with a call that
frames the possession, one slide reads as tactical.

**Trade-offs, stated:** (a) the call adds one tap per possession, at the
cheapest moment but not zero; (b) stale reads if the offense learns to
counter every call, staged fixes in order: board-dependent payoffs,
coarseness, then Madden-style disguise as a scarce resource; (c) the
combination is unshipped (the moat), so it needs playtest against the
measured even baseline.

**Runner-up: the Rotation** (v1's shape: one slide, others take one
deterministic help step). Cheaper to learn, zero new systems, but carries
the automation-opacity warning above.

**Rejected outright by the evidence:** mirrored multi-defender movement
(Wargroove, Guild Ball's abolished team turn) · several small reaction
windows (MTG Arena, Hero Academy's confirm tax) · blind pre-commitment or
full automation (XCOM overwatch, FT&G auto-zones, HLT delegated defense) ·
hidden simultaneous calls (Tecmo's coin flip) · any mid-beat prompt to the
defender (BB3, the corrected finding, is the one digital sports game that
does it, and that is exactly where it bleeds).

**Not settled by this run:** the exact call menu (which 4-5 calls) and the
zone-painting language want a paper playtest before code, same precedent as
the 08-02 spacing call. Nothing ships until Aaron rules.

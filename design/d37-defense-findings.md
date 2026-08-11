# D37 findings · the defense's answer to a free team setup (2026-08-11)

Viewable version (same content, styled):
https://claude.ai/code/artifact/0b4a8e42-3bcd-4d86-a19c-ae8a52fe936e

**The one decision this run changes:** what the defense gets, and when, now
that the whole offense sets up for free each turn (V0 D37). Aaron ruled the
offense half ("It should be all pieces move free") and rejected the first
defensive proposal ("one player moving 2 squares as response to the whole team
feels unfair"). Nothing ships until he rules on this return.

**How this run actually happened, honestly:** the /deep-research workflow
failed twice on the same tool error (StructuredOutput retry cap), so I ran the
brief myself: eight searches and six source fetches across the five question
angles, same kill rule, same format. That is one pair of hands instead of five
parallel lanes, so the sweep is narrower than a real run. Where a claim rests
on a search snippet rather than a fetched page, the finding says so. Three
sources returned 403 to the fetcher (TouchArcade, NLSC forum, BoardGameGeek)
and are cited only for what their search snippets said.

**Verdict words** (defined in 22af, reused): ADOPT · ADAPT · REJECT · OPEN.

## THE SCORECARD, graded before the writing

Pass = at least one named game, a verdict for us, and two distinct sources.

| Question | Result | Where it landed |
|---|---|---|
| 1 · The response economy | ANSWERED | Findings 1, 2 |
| 2 · One reaction vs mirrored turns, on mobile | ANSWERED, strongest of the run | Findings 3, 4 |
| 3 · Basketball's own answer | ANSWERED, one leg thin | Findings 5, 6, 7 |
| 4 · The telegraph shape | ANSWERED | Findings 8, 9 |
| 5 · The moat question | NEGATIVE, scope stated | Finding 10 |

## THE FINDINGS

### 1 · Blood Bowl gives the watching side almost nothing, and that is a choice that works. (ADAPT)
**GAME:** Blood Bowl, 40 years of the best-tested sport-on-squares design.
**PROBLEM:** one side moves up to ELEVEN players a turn; what does the other
side get?
**HOW:** during your opponent's turn you get exactly one true reaction, the
pass interception attempt, and it resolves on a dice roll with no decisions.
Everything else the defense does is PASSIVE: your players' tackle zones make
every nearby offensive action riskier without you touching anything. Your
real answer is your own turn. The BB54 article calls interceptions "whilst a
fun aspect to the game... devastating," which is why there is only one.
**VERDICT FOR US:** ADAPT the shape. The defense's richness belongs on its own
beat, plus passive pressure while it waits (our contest tiers already do
this). Do not hand the defense mid-turn decisions.
**URLS:** https://bbtactics.com/bb54/ ·
https://www.dangermouse.net/games/bloodbowl/rules.html ·
https://www.thenaf.net/blood-bowl/rules/

### 2 · When Blood Bowl's economy felt unfair, the fix was restructuring the exchange, not adding reactions. (ADAPT)
**GAME:** Blood Bowl, the community BB54 variant.
**PROBLEM:** the classic structure let one team stall and consume the half,
"one team stalling for 15 turns and defending for 1 turn."
**HOW:** the fix was two 5-turn drives per half so both sides are GUARANTEED
meaningful offense and defense. They rebalanced the ledger across possessions
instead of inserting interrupts into the possession.
**VERDICT FOR US:** ADOPT the principle. Our possessions already alternate
(A7, locked), so our version of "rebalance the ledger" is making the
defense's one beat worth a whole team's setup, not adding beats.
**URL:** https://bbtactics.com/bb54/

### 3 · XCOM's overwatch: the reacting side pre-commits, and the reaction fires by itself. (ADOPT the auto-resolution rule)
**GAME:** XCOM (Enemy Unknown / XCOM 2).
**PROBLEM:** whole squads move on the opponent's turn; the watching player
needed agency without the game stopping to ask them questions.
**HOW:** overwatch is set on YOUR turn ("I cover this lane"), then fires
AUTOMATICALLY when the condition triggers on theirs. The watching player
never gets a mid-turn prompt; their decision was already made.
**VERDICT FOR US:** ADOPT the rule under the rule: any defensive answer must
resolve with ZERO input during the offense's beat. Set beforehand, fire by
itself.
**URLS:** https://www.gamedeveloper.com/design/overwatching-how-xcom-s-signature-move-changes-the-game ·
https://xcom.fandom.com/wiki/Overwatch_(XCOM:_Enemy_Unknown)

### 4 · The one mobile answer with a body count: input-interrupts ruin matches. (REJECT interrupts)
**GAME:** Blood Bowl 3 (the digital one, played on small screens and consoles).
**PROBLEM:** its reaction moves ("shadow or intercept") require the NON-ACTIVE
player's input mid-turn.
**HOW IT WENT:** the waiting is the top complaint thread: "certain moves a
player can make... stop any further actions," matches becoming "a staring
contest to see who quits first." PC Gamer measured decision points taking
minutes and about a third of singleplayer matches locking up entirely. The
mechanic is fine on a tabletop; as software prompts it is poison.
**VERDICT FOR US:** REJECT any defensive rule that asks the defender a
question during the offense's 15-second beat. This is the hard constraint the
recommendation is built around.
**URLS:** https://steamcommunity.com/app/1016950/discussions/0/3774617156474323795/ ·
https://www.pcgamer.com/blood-bowl-3-is-a-hot-mess-and-not-just-because-of-its-game-breaking-bugs/

### 5 · The old basketball sims never move defenders at all: defense is a NUMBER. (REJECT the pure version)
**GAME:** Statis Pro Basketball (Avalon Hill).
**PROBLEM:** modelling defense without doubling game length.
**HOW:** each player carries a defense rating that modifies the shooter's
percentages. No defender ever repositions in response to anything; the scheme
is priced into the dice.
**VERDICT FOR US:** REJECT as a whole (our defenders are pieces on a board,
their position IS the game), but it confirms the direction of travel: the
genre answers off-ball motion with MATH, not with mirrored movement. Thin
leg: rules text is fan-hosted and forum-described, not fetched first-hand.
**URLS:** https://boardgamegeek.com/boardgame/9407/statis-pro-basketball ·
https://statisprobasketball.proboards.com/

### 6 · The matrix games make defense one scheme call against the offense's play call. (ADAPT)
**GAME:** Avalon Hill's Strategy line (Football Strategy 1959, and Basketball
Strategy is the same engine family).
**PROBLEM:** a whole team's worth of coordination on each side, playable in
seconds per snap.
**HOW:** the defense picks ONE of ten formations, the offense one of twenty
plays, and the result is cross-indexed on a table. The defense never moves
eleven pieces; it moves ONE DECISION that stands for all eleven. This matrix
became "the basis for hundreds of titles."
**VERDICT FOR US:** ADAPT. This is basketball's (and football's) own answer
sixty years deep: the defense is a SYSTEM that reshapes, expressed as a single
choice. One defensive tap CAN legitimately stand for five bodies.
**URLS:** http://www.codex99.com/design/100.html ·
https://boardgamegeek.com/boardgame/5304/basketball-strategy

### 7 · The one modern mobile basketball tactics game got defense wrong by giving it too LITTLE agency. (the cautionary tale)
**GAME:** Hoop League Tactics (iOS/Android, 2019, XCOM-styled basketball).
**PROBLEM:** ours exactly: turn-based basketball on a phone, what does defense
feel like?
**HOW:** on defense your players are governed by aggression settings for
steal/block pressure, with risk/reward rolls (force the turnover, or foul and
be out of position). Set-and-watch, dice decide.
**HOW IT WENT:** App Store reviewers call the "defending system... an absolute
nightmare," a ~20% block success feel, turnovers that read as
difficulty-scaled RNG rather than skill.
**VERDICT FOR US:** ADAPT the warning. Defense-as-settings with dice on top
FEELS like no agency. Whatever the defense gets, the player must place it by
hand; the caution is against automating the CHOICE, not the resolution.
Slider claim rests on multiple search snippets (NLSC forum, gamersunite)
because the review pages 403'd; the complaint quotes are fetched first-hand
from the App Store page.
**URLS:** https://apps.apple.com/us/app/hoop-league-tactics/id1484372351 ·
https://forums.nba-live.com/viewtopic.php?f=72&t=108453

### 8 · Full telegraphs turn each round into a puzzle, and players love it. (ADAPT, second layer)
**GAME:** Into the Breach.
**PROBLEM:** make the reacting side's position fair against a whole enemy wave.
**HOW:** every enemy shows its exact intent BEFORE you move, so your turn is
read-and-punish: reposition to break as many told attacks as you can. The
round becomes a solvable puzzle, and that legibility is the most praised thing
about the game.
**VERDICT FOR US:** ADAPT, inverted for our seats: it is our DEFENSE that
would pre-declare, so the offense's free setup becomes a read instead of an
unanswered race. This directly answers Aaron's "feels unfair": the setup is
answered BEFORE it happens rather than after.
**URLS:** https://www.gamedeveloper.com/business/road-to-the-igf-subset-games-i-into-the-breach-i- ·
https://www.thinkygames.com/games/into-the-breach/

### 9 · What breaks telegraphs: perfect prediction goes stale. The shipped fix is partial information. (the guard rail)
**GAME:** Slay the Spire.
**PROBLEM:** if the player can predict and counter everything, the read stops
being a decision.
**HOW:** intents show the TYPE and number ("attacking for 12") but not every
detail, and enemy patterns are semi-random within known sets, so you plan
around a distribution, not a script. Designers copying the system (RPG Maker
forums, tabletop adaptations) converge on the same guard: telegraph the shape,
not the whole answer.
**VERDICT FOR US:** if we telegraph coverage, show the ZONE (which side is
shaded, which tile is doubled), never the full resolution table. And the
matrix games (finding 6) hold the other shipped fix: keep the pre-commit
HIDDEN until it matters. Either guard works; showing nothing is the current
game, showing everything is stale.
**URLS:** https://slaythespire.wiki.gg/wiki/Intent ·
https://gordianblade.com/reveal-enemy-intents-or-how-i-run-rpg-combats-like-slay-the-spire/ ·
https://forums.rpgmakerweb.com/threads/forecasting-enemy-intent-slay-the-spire-like-battle-flow.113080/

### 10 · THE MOAT: nobody found pairing free whole-team setup with a single-response defense. (NEGATIVE, scoped)
**WHERE I LOOKED:** web sweep (August 2026) across TouchArcade, Pocket Gamer,
148apps, the itch.io turn-based sports tag, the Apple App Store, Steam
discussions, BoardGameGeek, and the NLSC / Operation Sports forums, on
queries combining mobile + turn-based + basketball/football + free
movement/setup + defense response.
**WHAT EXISTS:** Hoop League Tactics (defense is settings + dice, no free
setup race), Football Tactics Arena and EA Sports FC Tactical (turn-based
soccer, per-turn orders, no free-setup-vs-single-response split), Basketball
Tactics Association (local multiplayer itch project). None of them is our
shape.
**VERDICT FOR US:** we are designing something new here, so the answer gets
decided by OUR playtest, not by longer searching. Same conclusion the 22af
Run C moat carried: the combination is the moat, and the burden it brings is
that nobody else's balance numbers can be borrowed.
**URLS:** https://itch.io/games/genre-sports/tag-turn-based ·
https://apps.apple.com/us/app/id1359885310 ·
https://www.techradar.com/gaming/ea-sports-fc-is-getting-a-turn-based-tactical-spin-off-game-in-early-2024 ·
https://toucharcade.com/2019/12/04/hoop-league-tactics-release-date/

## THE RECOMMENDATION (mine to propose, Aaron's to rule)

Every source family points the same direction, and it is not "more defender
moves." Basketball games answer motion with SCHEME (findings 5, 6). The
reaction games that work on screens resolve without asking the watcher
anything (findings 3, 4). The body-count fix that shipped rebalanced the
exchange rather than adding interrupts (finding 2).

**Proposed rule, "the rotation": the defense keeps exactly one slide per beat,
but the slide becomes a scheme action. The defender you slide moves 1-2 by
position as today, and every OTHER defender takes one free step by a fixed
help rule (each steps 1 toward the ball side if the attacker they were nearest
to has moved away, else holds).** One tap from the defending player, up to
five bodies answer, zero new confirms, zero mid-beat prompts. The economy
Aaron called unfair (4-5 free offensive steps vs 1 defensive slide) becomes
symmetric: whole team against whole team, one decision each.

Trade-offs, stated: the help rule is automation, and finding 7 warns that
automated defense can feel agency-less. The guard is that the PLACED slide
stays the player's, and the help steps are deterministic and visible (players
will learn to aim the rotation, which is real skill). Alternative shape if
Aaron prefers reads over rotations: the telegraph (findings 8, 9), where the
defense pre-declares a shaded zone before the offense's setup. It is a bigger
change (a new beat in the loop) and needs the staleness guard, so I rank it
second for V0 and worth revisiting for a mode.

**What this does NOT settle:** the exact help-rule text (toward ball side vs
toward rim vs follow-your-man) wants one paper playtest before code, same
precedent as the 08-02 spacing call. Nothing ships until Aaron rules.

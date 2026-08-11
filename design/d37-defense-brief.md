# D37 defense run — the paste-ready /deep-research block

Written 2026-08-11 under the design-research-brief skill. The locked question
list lives in BUILD.md § 22ag (added the same day, same commit). This run
exists to settle ONE decision: **V0 D37 — what the defense gets when the whole
offense can set up for free.** Aaron ruled the offense half ("It should be all
pieces move free") and rejected the first defensive proposal ("one player
moving 2 squares as response to the whole team feels unfair"). Nothing about
the defensive rule ships until this returns and he rules.

If /deep-research caps out: run questions 1-4 together and question 5 alone —
a moat question against all five search angles is the only shape that makes
its negative result credible. Never trim the constraints preamble to fit.

---- PASTE EVERYTHING BELOW THIS LINE INTO /deep-research ----

RESEARCH BRIEF — "the defense's answer to a free team setup" (turn-based
sports/tactics games)

WHAT OUR GAME IS, so answers land usable: Ball Knowledge is a turn-based
basketball strategy game played mostly on phones. Sides alternate possessions.
The atomic beat is a trivia question with a ~15-second clock; a :24 shot clock
bounds each offensive turn. The offense's NEW rule (just decided): before its
one main action (move / pass / shoot), EVERY off-ball attacker (up to 4
pieces) may step one square for free. The defense's CURRENT rule (now under
review): after the offense's main action resolves, the defense slides exactly
ONE defender, one or two squares by position. The designer has already
rejected "one defender slides 2 squares" as the answer to a whole-team setup:
it feels unfair. Our measured baseline: under the old one-action-for-one-slide
economy, offense and defense exchanged evenly. Hard constraints: mobile-first
(every extra confirm tap is real cost), the 15-second question beat is the
game's pacing heart, and alternating possessions are locked (do NOT propose
simultaneous turns or full team-turns; a prior run, filed, found zero
surviving evidence for rebuilding turn order).

THE ONE DECISION THIS RUN CHANGES: what the defense gets, and when, now that
the offense sets up its whole floor for free each turn. Every finding must tie
to that decision or it does not belong in the return — apply that kill rule to
your own output before returning it.

FORMAT, per finding: the GAME, the PROBLEM it solved, HOW the mechanic works
in one paragraph, a VERDICT FOR US (adopt / adapt / reject) with a reason, and
a CLICKABLE URL per claim. Player-facing claims (complaints, praise) must link
the actual thread or review, never a summary. Negative results are findings:
"almost nobody does this" is valuable IF you state where you looked.

THE QUESTIONS:

1. THE RESPONSE ECONOMY. In turn-based sports and tactics games where one side
   makes multiple free positioning moves per turn (Blood Bowl and its digital
   versions, Dreadball, Guild Ball, similar), what does the OTHER side get in
   response, and when does it get it — during the opponent's turn, after it,
   or only on its own turn? We need a RECOMMENDATION, not a survey: which
   response shape best fits a mobile game whose defense acts once per beat?

2. ONE REACTION VS MIRRORED TURNS, ON MOBILE. Compare games that give the
   reacting side a single interrupt or reaction (XCOM's overwatch, Into the
   Breach's telegraphed answers, tower-defense-style pre-commitment) against
   games that mirror full movement both ways. Which shape keeps turns SHORT on
   phones, and what do players actually complain about in each? Link real
   player threads/reviews. Decision served: whether our defense answers with
   one enriched reaction or several small ones.

3. BASKETBALL'S OWN ANSWER. How do turn-based or board basketball games
   (Basketball Strategy, Statis Pro Basketball, digital basketball tactics
   games) model HELP DEFENSE and ROTATIONS when the offense repositions?
   Basketball's real answer to off-ball motion is scheme (zones, switches,
   help rules), not more defender moves — has any game encoded "the defense
   is a SYSTEM that reshapes" rather than "the defense is pieces that slide"?
   Verdict for us either way.

4. THE TELEGRAPH SHAPE. Games where the reacting side PRE-COMMITS visibly
   (Into the Breach's intents, Slay the Spire's enemy intents, football
   play-calling games where the defense calls coverage first): could our
   defense declare its coverage BEFORE the offense's free setup, so the setup
   becomes a read-and-punish decision instead of an unanswered race? What
   breaks when designers do this (stale reads, rock-paper-scissors
   degeneration), and what fixes it? Recommendation required.

5. THE MOAT QUESTION (its own run if splitting). Is there ANY mobile
   turn-based sports game that pairs free whole-team setup with a
   single-response defense and is PRAISED for fairness? State exactly where
   you searched (stores, forums, review sites) — a negative result without
   stated scope is unusable, and a well-scoped "nobody has solved this" tells
   us we are designing something new and should playtest harder rather than
   search longer.

---- END OF PASTE ----

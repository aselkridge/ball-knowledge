# 22ai · The playbook run — the paste-ready /deep-research blocks

Written 2026-08-13 under the design-research-brief skill, on Aaron's Go.
Locked question list at BUILD 22ai. TWO runs, run separately: Run A is the
real coaching material, Run B is how games compress it. Never trim the
constraints preamble to fit.

---- RUN A · PASTE EVERYTHING BELOW INTO /deep-research ----

RESEARCH BRIEF — "the real play packages" (how basketball coaches set up
offense and defense, as material for a turn-based game)

WHAT OUR GAME IS, so answers land usable: Ball Knowledge is a turn-based
basketball strategy game played mostly on phones, on a grid court: 15 wide by
8 tall tiles for a full NBA court, two fixed baskets, real court lines. The
tile you shoot from sets both the points and the difficulty of a trivia
question that prices the shot. Sides alternate possessions. The design now
under construction: at every dead-ball inbound, EACH side picks a SETUP from
a short list, and the ten pieces take that shape instantly; the defense picks
first and visibly, the offense picks seeing it. After the setup, all movement
belongs to the players (free off-ball steps, one main action per beat, one
defensive slide per beat). THE SETUPS ARE STARTING SHAPES ONLY, never
scripted routes: the designer's rule, verbatim, is "all movement after setup
is the players."

THE ONE DECISION THIS RUN CHANGES: which real plays and schemes become the
two pickable lists (offense setups, defense setups), and what each is called.
Every finding must tie to that decision. Focus leagues: NBA and WNBA.

FORMAT, per play or scheme returned — this is the designer's own spec and a
finding that skips fields is incomplete:
- its real NAME (the vocabulary coaches actually use)
- the PROBLEM it solves on a real court (one sentence)
- the FULL PACKAGE: where the INBOUNDER stands (baseline/sideline and side),
  what POSITION inbounds, who RECEIVES first, where that receiver's DEFENDER
  is expected, and the starting spot of EVERY OTHER PLAYER on the floor,
  described precisely enough to place ten pieces on a grid (halfcourt
  regions: corners, wings, slots, elbows, blocks, short corner, top, dunker
  spot)
- WHAT IT IS BEST AGAINST or best for (the matchup logic, one sentence)
- a CLICKABLE URL per claim; coaching sites, published playbooks, league
  film breakdowns all qualify; name the source type

THE QUESTIONS:

1. THE OFFENSIVE PACKAGES. What are the named set plays and base offenses
   that recur across NBA and WNBA basketball: horns and its family, floppy,
   box and stack for baseline/sideline inbounds (BLOB/SLOB), Spain
   pick-and-roll, 5-out, Princeton looks, and whatever the sources say
   actually gets CALLED. Return 10-15 as full packages per the spec. Prefer
   plays whose names are established vocabulary, because the names will
   teach while they play.

2. THE DEFENSIVE PACKAGES. Same treatment for defense: the man-to-man
   shells and their pickup points, the zones (2-3, 3-2, 1-3-1, matchup),
   full and half-court presses, and the call vocabulary that modifies them
   (ice, drop, hedge, switch-everything, box-and-one). Return 8-12 as full
   packages. For each: what offensive shape it punishes and what beats it.

3. THE LEAGUE AND ERA LENS. Does WNBA play-calling vocabulary or scheme
   frequency genuinely differ from NBA (sources, not vibes)? And has the
   vocabulary shifted enough across eras (80s post play, 2000s iso, modern
   5-out) that era-flavoured play packages would read as authentic to fans
   of each era? A negative result ("the vocabulary is shared") is a finding
   if the search is scoped.

---- END OF RUN A ----

---- RUN B · PASTE EVERYTHING BELOW INTO /deep-research, SEPARATELY ----

RESEARCH BRIEF — "the playbook, compressed" (how games turn play-calling
into one timed choice)

CONTEXT, short: a turn-based basketball game on phones is adding
pick-a-setup moments at every inbound: the defense picks first and visibly
from a short list, the offense picks seeing it, both against the game's
pacing heart of ~15-second decisions. The real plays come from a parallel
run; THIS run decides how the choosing works and how long the lists can be.

THE ONE DECISION: the shape and size of the two pick lists on a phone.

FORMAT per finding: the GAME, the PROBLEM it solved, HOW its play-call flow
works in one paragraph, the VERDICT for us (adopt / adapt / reject) with a
reason, and a CLICKABLE URL per claim; player-facing complaints must link
the actual thread or review.

THE QUESTIONS:

4. THE COMPRESSION. How do Madden, the NCAA football games, and NBA 2K
   present playbooks holding dozens-to-hundreds of plays as an in-game
   choice made in seconds: suggested-plays rows, formation-then-play
   trees, quick-call wheels, coach suggestions, 2K's Playvision overlays.
   What do real players complain about in each flow (choice overload,
   stale suggestions, opponents memorising tendencies)? Which of these
   shapes survives on a PHONE where every extra tap is real cost?

5. THE COUNT. Across shipped games with timed tactical choices (sports
   play-calling, but also battler ability bars and roguelike draft picks),
   what option-count keeps a timed choice fast: 3, 5, 8? Cite shipped
   examples with their actual counts and any designer commentary or player
   threads about lists feeling too long. The deliverable is a NUMBER
   RANGE with evidence, because our lists' length is the decision.

---- END OF RUN B ----

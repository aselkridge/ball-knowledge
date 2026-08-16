# 22ai findings · the playbook, both runs (2026-08-16)

Raw returns, verbatim with full packages and every URL:
`design/archive/22ai-runA-return-2026-08-16.md` (the real plays) and
`design/archive/22ai-runB-return-2026-08-13.md` (the compression). This file
is the intake: scorecards, the shortlists for Aaron's choosing step, the
corrections, and what stays open.

**THE SETUP BOOK** (Aaron's ask 08-16, "that artifact that shows all the
defense and offense setups on the court, fine with a toggle"): every
shortlist setup drawn on the game's court geometry with the offense/defense
toggle: <https://claude.ai/code/artifact/22783545-84e0-4b46-ae29-476f5c290780>

## SCORECARD, against the brief's own spec

| Question | Result |
|---|---|
| Q1 offensive packages (10-15, full spec) | ANSWERED: 11 halfcourt + 6 inbound, every field, verdict-tagged |
| Q2 defensive packages (8-12) | ANSWERED: 10 packages + the PnR coverage dial (drop/ice/hedge/blitz/switch) |
| Q3 league and era lens | ANSWERED with corrections: vocabulary SHARED across NBA/WNBA (flavour by AI weighting, never renaming); eras stamp strongly enough for era packs |
| Q4 compression flows | ANSWERED: 10 games, verdicts each |
| Q5 the count | ANSWERED with a defended range |

Verification bite, both runs: Run A dropped "Line" as a duplicate of Stack
and quarantined five bad numbers (a wrong Finals year, a fabricated pace
table, a mislabeled 3PAr record among them); Run B refuted a fabricated 2K
slot count and a misattributed designer quote. Every package carries
CONFIRMED / THIN / INFERENCE / SNIPPET-ONLY so nothing over-claims.

## THE TWO SHORTLISTS (the research's slate; Aaron picks or overrules)

**Offense (8):** HORNS (one shape, many outcomes; the purest "starting
shapes only" fit) · FIVE-OUT/DELAY (all five on the arc; the anti-zone
pick) · FLOPPY (shooter under the rim; punishes denial) · SPAIN (stacked
middle lane; beats drop) · IVERSON 1-4 HIGH (four across the FT line;
beats star denial) · BOX BLOB (the canonical inbound square; safe vs man
AND zone) · 4-LOW BLOB (baseline flat; the pressure-relief pick) · ZIPPER
SLOB (the sideline organizer; beats pressure man).
Bench: Elevator, Stack, Chin, Pistol; Flex/Iso/Triangle held for era packs;
America's Play flagged for name ambiguity.

**Defense (6):** MAN-TO-MAN · PACK LINE (anti-drive) · 2-3 ZONE
(anti-impatience; the WNBA Golden State identity) · 1-3-1 TRAP (turnover
hunt with named soft spots) · BOX-AND-ONE (the star eraser; makes role
players answer the trivia) · DIAMOND PRESS 1-2-1-1 (the one defense specced
FROM the inbound, our exact moment). First off the bench: 2-2-1 (its foil:
concedes the inbound). The PnR coverage dial (drop/ice/hedge/blitz/switch)
layers on Man rather than being list entries, and WNBA team identities
(Vegas switch, Atlanta drop, Indiana ice) support flavouring AI opponents.

**Run B's sizing, defended:** defense picks from 3 (roguelike draft
standard + the practitioner mobile ceiling), offense from 4, at most 5
(Clash Royale's hand and Tecmo's mutual 4 at exactly phone-plus-seconds
scale; TFT's 5 as the shipped ceiling). Hard ceiling 6. So AARON'S PICK is
which 3 defensive setups and which 4-5 offensive setups form the DEFAULT
lists; the rest of the shortlist can rotate in via modes, eras, or unlocks.
Flow rules from B: everything visible at once, one tap, no scrolling, no
two-hop trees, authored sets never machine-ranked, graded payoffs balanced
for perfect information (the defense's pick is shown on purpose).

## LEAGUE AND ERA, the product answers
- ONE list serves NBA and WNBA (FastModel lists Aces/Sky horns beside
  Cavs/Knicks; confirmed). Flavour = AI opponents' pick WEIGHTING.
- Era packs read authentic: 80s Flex + post entry · 90s Triangle + Iso ·
  2000s Horns arrives · modern Spain + Five-Out. Direct premise gift,
  confirmed: Hammon drew three out-of-bounds plays in a playoff endgame
  and all three scored; dead-ball play selection is real coaching.

## OPEN BEFORE ANY OF IT SHIPS
1. Aaron's choosing step (BUILD desk item): the default 3 + the default 4-5.
2. Iso/clear-out alignment has no opened diagram source (era pack blocker
   only).
3. The Syracuse play-type direction graphic needs a read-images pass before
   any "WNBA leans X" claim ships.
4. Halfcourt sets' inbounder positions are grid adaptations marked
   INFERENCE; fine for setups (the shapes are the sourced part), named so
   nobody later quotes them as sourced.
5. thenexthoops.com film rooms 403'd and are the richest WNBA vocabulary
   source; worth one retry another day.

## INJECTION PROTOCOL, first live event, reported per the alert rule
One flag in Run A: a fetch of coachesclipboard.net/HornsOffense.html
appeared to contain an AI-addressed sentence. A targeted re-fetch found no
such text on the page: verdict, an artifact of the fetch tool's own
summarizer, not page content. The Horns verdict rests on a second source
regardless. No genuine attempts in either run; the unreachable-page ledgers
in both archives were filed, not scraped around.

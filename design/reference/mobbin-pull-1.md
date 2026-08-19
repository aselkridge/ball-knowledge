# Mobbin reference pull 1 · 2026-08-18

Pulled the night the plan went live, for B18 (feel) and B19 (guided menus).
Screens are Mobbin-hosted; we bank LINKS and READINGS, not copies. Each
reading says what the screen teaches for OUR surface, so the pull is usable
without reopening Mobbin.

## Pull A · turn-based match screens

- **Duolingo, chess match** · <https://mobbin.com/screens/d2ba4033-cd01-4450-bde7-ca00a032aaf7>
  THE TURN SIGNAL DONE WITH CLOCKS: both players' clocks sit side by side at
  the top; the ACTIVE one is dark-filled, the waiting one is ghosted. Whose
  turn it is = which pill is lit, glanceable from across a room. Relevant to
  our turn chip + strip family; a dual-clock read is a candidate for online
  play where both sides watch the same header.

- **NBA Play, trivia question** · <https://mobbin.com/screens/ff913374-40ca-42d8-93c7-a32541d041ee>
  The closest thing to our question card in the wild: full-bleed photo up
  top, thin progress bar with a count (1/5), the question as a HEADLINE in
  large type, four full-width white answer cards with generous padding and
  identical height. What it teaches vs ours: one question element per screen,
  no competing chrome while answering, and the progress strip replaces any
  spoken "question 2 of 5". Reference for the card polish pass.

- **Riot Mobile, match details** · <https://mobbin.com/screens/b4116f8d-3f99-42c1-a796-619c5652c061>
  Dark end-of-match scoreboard: hero image, score 13-7 in the header, MVP
  chip on the top performer, expandable per-player rows. Reference for our
  victory/receipt screen when it gets its polish pass.

- Quizlet timed match grid · <https://mobbin.com/screens/3c0c29f9-ddf7-4a17-b7fd-4311f44c1a54>
  A 2.5s timer headline over a card grid; timer placement top-center, small.

- Misses in this pull (kept for honesty): Alan health chat, Nibble puzzle,
  Tolan sandbox, 7-Eleven promo game. The query wants "match screen"; the
  library is thin on true turn-based sports boards.

## Pull B · setup and pre-match flows

- **Apple Games, onboarding (5 screens)** · <https://mobbin.com/flows/2de84bab-241f-40be-a344-94bb7eeca3dc>
  Dark ground, one idea per screen: big welcome + three benefit rows + one
  Continue; then a profile screen that is exactly our names screen (avatar,
  one nickname field, one dropdown, one Continue). The restraint is the
  lesson: each screen asks ONE thing and the primary button never moves.

- **Quizlet, game options (4 screens)** · <https://mobbin.com/flows/0f261575-d1a7-4d2c-b4cf-b1e1249f2c0c>
  A settings sheet where every option is label + CURRENT VALUE as a pill;
  tapping opens a bottom sheet with the choices. Compact alternative to our
  full-screen pickers for small options (target score, question packs).

- **Abode, Grid Master ready-up** · <https://mobbin.com/flows/2f1df5f9-4857-4527-a789-c41bd207c173>
  A SPLIT SCREEN where each player taps Ready Up on their own half (top
  half flipped toward the other person). Directly relevant to our hot-seat
  toss-up and THE CALL moments: the phone lying flat between two people is
  a design surface we already use and this is the cleanest version of it.

- Twitch stream-setup (14 screens) · <https://mobbin.com/flows/0b2e15e0-267f-4b49-b474-3fd9a910c2d9>
  Long guided flow; useful only as a counterexample: fourteen screens is
  what our Apple-checkout pattern (one growing page) avoids.

## What the pull changes

- B19's spec stays the Apple checkout pattern (his video); Apple Games
  onboarding confirms the one-ask-per-moment rule, and Quizlet's value-pill
  sheet is the candidate for SMALL options inside it.
- The Duolingo dual clock is filed as an online-play turn-signal candidate.
- The NBA Play card is the reference when the question card gets its feel
  pass (R4's card scale-in plus spacing).
- The Grid Master split ready-up is filed for the toss-up/THE CALL polish.

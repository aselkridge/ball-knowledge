---
name: compare
description: Build and publish a visual comparison Artifact. TWO MODES — (A) BEFORE/AFTER for a change to something that already exists, captured from the old code and the new code; (B) OPTION BOARD for many candidates at once — logo rounds, court scenes, colourways, songs, competing mockups. Use before merging any visual change, and whenever Aaron has to CHOOSE between more than one thing. If a screenshot would look different to a player, or if you are about to ask him to pick, run this.
---

# Compare — never ship a visual change you can't put next to what it replaced

Aaron, 2026-08-01: he should never have to ask for this. The rule is also in
CLAUDE.md; this skill is the version that **does the work** instead of hoping the
doc gets read.

**The case that earned it:** the corner-three fix shipped with correct geometry
and the WRONG COLOUR LANGUAGE — red meaning "worth 3" while red already meant
"hard" on every card. Aaron caught it from one screenshot in seconds. A
before/after would have shown the collision to me first.

## Two modes. Know which one you are in.

**A · BEFORE/AFTER — one thing changed.** The board, a screen, a colour meaning,
type, a flow. The comparison is the new state next to the old state.

**B · OPTION BOARD — many candidates, one choice.** Logo rounds, the 43 court
scenes, 24 colourways, song picks, competing mockups. There is often NO "before"
at all. Aaron, 2026-08-01: *"it's not always two sometimes its many remember the
logos."* Getting this wrong — forcing a 12-option logo round into a two-up
layout — makes a choice harder instead of easier.

### Mode B has its own rules, and they are not optional
- **Identical conditions for every option.** Same size, same background, same
  crop, same lighting. Any difference the eye can see must be a difference in the
  OPTION, never in how you presented it. A candidate shown bigger wins for the
  wrong reason.
- **Number them, and keep the numbers stable** across rounds. He will say "3 and
  7" — those had better still be 3 and 7 tomorrow.
- **Show them in context, not floating.** A logo has to be seen small, on the
  real dark ground, on the actual title screen. A court has to be seen with
  pieces on it. An option that only works in isolation is a trap.
- **A grid, not a carousel.** Comparison needs them all in one eyeful.
- **Say what is DIFFERENT between them in words**, one line each. "3 and 7 are
  the same mark at two weights" saves him from squinting to work it out.
- **Give him a way to send the pick back.** Tick or tap, then a copy-out button
  with the numbers. Learned the hard way: a chooser whose answers cannot leave
  his browser is a chooser that failed at its only job.
- **Do not pre-rank unless asked** — but DO say which you would pick and why, at
  the bottom, after he has seen them clean. Opinion is useful; a thumb on the
  scale before he looks is not.

## The one rule

**A lone "after" is a sales pitch.** If you cannot show the thing you replaced,
you have not checked your own work.

## Steps — MODE A (before/after)

### 1. Capture BOTH sides — the script does it, don't hand-roll
```
node tools/compare-shots.mjs <name> --routes /play/,/tape/ [--setup <js-file>]
```
It serves the CURRENT working tree, screenshots every route at **1440px and
390px**, then checks out `HEAD` into a temporary git worktree, serves that, and
screenshots the same routes again. Output lands in
`/tmp/.../scratchpad/compare-<name>/` as `before-*.png` / `after-*.png`.

- `--setup` runs a JS snippet on the page first, for anything behind a flow
  (start a game, open a veil, deal a squad). Reuse the drivers already in
  `tools/board-check.mjs` and `tools/playtest-fixes.mjs` rather than writing new
  ones — they know how to get past the Coach card and the tip-off countdown.
- If the "before" cannot be captured (the screen did not exist yet), say so in
  the artifact **in words**. Do not quietly ship a one-sided comparison.

### 2. Look at both yourself, before Aaron does
Read the PNGs. You are checking for the thing the diff cannot show you:
- Does any colour now mean two things at once? (the corner-three failure)
- Did contrast, tap-target size, or reading order get worse anywhere?
- Did something you did not intend to touch move?

### 3. Build the page and publish it
Load the `artifact-design` skill, then write the comparison as an HTML file and
publish it with the `Artifact` tool. It **must** contain:

- **Before and after side by side** for every route, at **both widths**, and in
  **both themes** where the surface has two.
- **What changed and WHY — one line each, with the measurement where one exists.**
  *"Corner tiles now pay 3; they were 2, on 4 tiles"* beats *"improved the shot
  zones"*.
- **What you deliberately left alone**, when a reader would expect it to have
  changed. Silence there reads as an oversight.
- **What you are unsure about.** Ask the question in the artifact where he is
  looking at the pixels, not three paragraphs into a chat message.

### 4. Then, and only then, merge
Put the artifact URL in the commit body so the comparison outlives the chat.

## Steps — MODE B (option board)

1. **Gather every candidate at the same fidelity.** If they came from an image
   generator, resize and crop them to one spec first. If they are screens,
   screenshot them through the same driver at the same viewport.
   `tools/compare-shots.mjs` is for mode A only — it compares two git states, and
   an option board is not two git states. Capture these yourself.
2. **Build the grid**, numbered, in context, with the one-line difference per
   option and a copy-out for his pick. Load `artifact-design` first.
3. **Publish, then say your own pick and your reason** — after the grid, not
   before it.
4. **When he chooses, write the decision AND THE NUMBER into BUILD.md** with the
   date. "Aaron picked 7" is worthless in a month if nobody kept the board.

## Do not

- Do not substitute a mockup for the shipped result. The comparison is of the
  REAL page, served and screenshotted.
- Do not skip mobile. Most of this game is played on a phone.
- Do not describe the change instead of showing it.
- Do not run this for changes a player could not see — it is for redesigns, not
  every commit. The test: *would a screenshot look different to a player?*

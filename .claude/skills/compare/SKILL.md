---
name: compare
description: Build and publish the before/after comparison Artifact for any visual change. Use whenever you change how something LOOKS or READS — a screen, the board, a colour meaning, type, layout, a flow — and ALWAYS before merging such a change. Captures the real page at desktop and mobile, both themes, from the OLD code and the NEW code, side by side. If a screenshot of your change would look different to a player, run this.
---

# Compare — never ship a visual change you can't put next to what it replaced

Aaron, 2026-08-01: he should never have to ask for this. The rule is also in
CLAUDE.md; this skill is the version that **does the work** instead of hoping the
doc gets read.

**The case that earned it:** the corner-three fix shipped with correct geometry
and the WRONG COLOUR LANGUAGE — red meaning "worth 3" while red already meant
"hard" on every card. Aaron caught it from one screenshot in seconds. A
before/after would have shown the collision to me first.

## The one rule

**A lone "after" is a sales pitch.** If you cannot show the thing you replaced,
you have not checked your own work.

## Steps

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

## Do not

- Do not substitute a mockup for the shipped result. The comparison is of the
  REAL page, served and screenshotted.
- Do not skip mobile. Most of this game is played on a phone.
- Do not describe the change instead of showing it.
- Do not run this for changes a player could not see — it is for redesigns, not
  every commit. The test: *would a screenshot look different to a player?*

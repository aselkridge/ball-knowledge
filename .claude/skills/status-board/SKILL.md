---
name: status-board
description: Regenerate Ball Knowledge's Build Status Board — the one all-inclusive page covering the two launch gates, the 27 pre-launch items, what is running now, Aaron's desk, future builds, the research queue, everything already done, and the reference material. Use whenever Aaron asks for a status report, phase report, "where are we", "what's left", or an update on the build. ALWAYS use this format; never invent a new one.
---

# Status Board — the ONE format for build reports

Aaron: *"every time I ask for it, it comes in a different format, which is
confusing... I want it to look a certain way."* **This skill is that format.**
Never freestyle a status report. Regenerate this board.

**Live artifact URL:** `https://claude.ai/code/artifact/89cb5a79-9c6d-4b3b-8842-b5954f5ceaec`
Republish to the SAME url so Aaron's link never changes and version history accrues.

## v2 — why the board was rebuilt (2026-08-06)

Aaron, on the v1 board: *"it feels like a mess, I can barely figure out how to
navigate it."* And, more damning: I read v1 back to him as though the launch
were close, when **10 of 27 pre-launch items are done**. A board you can
misread is a board that misinforms.

His brief for v2, verbatim: *"I would like a rebuilt status board (archive the
old one dont delete or rewrite) but I would like other sections included (they
can be collapsable or somethign) I still want our future build things on it as
they can move between things that need doing now and future, and the past
complete items should have a collapasable section too (maybe way at the end
lol) there should still be a defintions/where things live/ and scheduled
section too (collapsabile) (actually maybe this all needs to be a seprerate
artifact theats an all inclusive bk staus board)."*

So: **one all-inclusive page, everything on it, the parts you rarely need
folded away.** The v1 board is archived at
`tools/status-board/status-ARCHIVED-2026-08-02.html` and
`template-ARCHIVED-2026-08-02.html`, and its artifact URL
(`.../e1b36228-8718-48b9-a5cb-5b5676348bf8`) is **left untouched** — Aaron said
archive, not delete.

## How to regenerate

1. **Measure first, never recall.** Run `python3 tools/audit.py`,
   `python3 tools/open-items.py`, and read the real files. Every number on the
   board must be recomputed — the stale-numbers rule applies here more than
   anywhere, because this is the page Aaron reads to decide what to do next.
   The footer says *"Every number here was recomputed on <date>"* — that
   sentence is a promise, so make it true or change it.
2. **Edit `tools/status-board/template-v2.html`.** Never edit the built output.
   Fonts are `__ANTON__` / `__DSEG__` placeholders; the build script inlines them.
3. **Build:** `python3 tools/status-board/build.py` (defaults to
   `--tpl template-v2.html` → `status-v2.html`; validates div balance and
   reports section/item counts).
4. **Verify with real screenshots** — desktop and 390px, both themes, and with
   every `<details>` forced open. Check `scrollWidth == clientWidth` at 390px;
   sideways scroll on a phone is the failure mode this board keeps hitting.
5. **Publish** with the Artifact tool, passing `url` = the live URL above,
   favicon 🏀, and a one-line description.
6. **Commit the template** so the next regeneration starts from current truth.

## The format — do not restructure

Everything lives on one page. The order is fixed, and it runs newest-and-most-
urgent first, reference last:

| # | id | Contains | Folded? |
|---|---|---|---|
| — | `.gates` | **The two launch gates**, at the very top, each with a progress bar and a plain sentence about what is actually missing | open |
| — | `.board` | Six-tile DSEG7 scoreboard | open |
| 1 | `before` | **BEFORE THE 20** — every pre-launch item as a checklist, done / part / empty, plus the "ten that exist purely to make strangers play twice" callout | open |
| 2 | `now` | **RIGHT NOW** — what is live, what is on the branch and not live, what just shipped | open |
| 3 | `desk` | **YOUR DESK** — clicks only Aaron can make and decisions only he can take; every item ends in a `DO` or `DECIDE` block | open |
| 4 | `future` | **FUTURE BUILDS** — designed, not started. One `<details>` per idea | folded |
| 5 | `research` | **RESEARCH QUEUE** — running order table, next run first | table open |
| 6 | `done` | **ALREADY DONE** — this week, then earlier phases | folded |
| 7 | `ref` | **REFERENCE** — what the words mean · where things live · the source standard · scheduled | folded |

**Sections move between 1, 3 and 4.** That is the point of the design: Aaron
said future builds *"can move between things that need doing now and future."*
Promoting an item is a copy-paste from `#future` into `#before`, not a rewrite.

### Collapsing uses `<details>`, never JavaScript

Every folded block is a `<details>/<summary>`. Chat file previews run **no
JavaScript** (CLAUDE.md), and a board whose sections cannot be opened in a
preview is worse than one with no sections. Only progressive enhancement —
scroll-spy, smooth jumps — may live in script.

### The two gates are the masthead

Not a rail, not a phase timeline. Two cards, each with:
- the gate's number and target (`306 / 1,000` · `10 / 27`)
- a progress bar with the percentage as a DSEG7 numeral
- **one sentence naming what is genuinely missing**, not a status word.
  "Only 961 NBA/WNBA cards exist at all, so this needs ~150–200 NEW questions
  written" is the sentence. "In progress" is not.

Nothing ships to the twenty until both are green. Say that on the page.

### The repeating item pattern — every single item uses it

```html
<div class="item s-live|s-run|s-wait|s-queue">
  <div class="ihead">
    <span class="id">V7</span>            <!-- optional backlog id -->
    <h3>Title</h3>
    <span class="pill live|run|wait|queue">Status</span>
  </div>
  <p class="what">TECHNICAL description — real numbers, real file paths, real mechanics.</p>
  <div class="plain"><b>In plain terms</b>PLAIN-LANGUAGE explanation, no jargon.</div>
  <div class="cta"><b>DO|DECIDE</b>The concrete first move.</div>  <!-- #desk only -->
</div>
```

**Both the technical and plain lines are mandatory on every item.** Aaron asked
for technical AND plain language on every piece — an item with only one is
incomplete. The plain line never repeats the technical line in shorter words;
it says *why it matters* or *what it means for a player*.

### The checklist pattern (`#before` only)

```html
<ul class="ck">
  <li class="done">Verified-pack gate</li>
  <li class="part">Heat + ON FIRE <span class="note">sound missing</span></li>
  <li>Wake lock</li>
</ul>
```
Filled circle = done, half = part-done, empty = not started. **Check each one
against the code before marking it** — the 27-item count on 2026-08-06 came
from a grep of `docs/play/`, not from memory, and that is the only acceptable
way to produce it.

### Status vocabulary (colour is semantic, not decorative)

- `s-live` / `pill live` — shipped and on `main`
- `s-run` / `pill run` — running or actively next
- `s-wait` / `pill wait` — blocked on Aaron
- `s-queue` / `pill queue` — queued, not blocked
- `s-stop` / `pill stop` — failed or crashed. **Use it.** A run that died is
  reported as prominently as one that succeeded; hiding a failure behind
  "in progress" is the one thing this board must never do.

### Scoreboard cells (masthead)

Six metric tiles in DSEG7. Currently: cards dealt · cards read · checks green ·
awaiting you · not live yet (commits on the branch) · open items. Swap a tile
when a better number exists, but keep it to six and keep every one recomputed.

## Rules that keep it honest

- **Report failures and regressions as prominently as wins.** If the audit gate
  is failing, that goes in the gates card, not buried.
- **Never mark something shipped that isn't merged to `main`.** Branch state is
  its own item in `#now`, with the commit count.
- **Every desk item ends in a `DO` or `DECIDE` block** with a concrete first
  move — not "consider whether…" but "say X and I'll do Y".
- **A deferral is an item.** Anything the board describes as open must also
  exist in a file (`python3 tools/open-items.py` finds it). The board is a
  view, never the only record.

## Design (already built — match it, don't redesign)

Grounded in the game's own system: Anton display face and DSEG7 LED numerals
(the counter Aaron loves) inlined as data URIs; `#f5872e` arena orange as the
single accent; warm near-black `#100d0b` ground; semantic status colours kept
separate from the accent; both themes defined at token level with
`data-theme` overrides. Scoreboard/stat-sheet layout, not a generic dashboard.

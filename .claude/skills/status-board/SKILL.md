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

## v3 — the board is GENERATED now (2026-08-07)

Aaron on v2: *"I think you are missing ALOT from my future build stuff, idk why
it feels like so much from the other doc is left out. I want this doc to be
complete... Think of this artifact like a project management tool helping us
understand the roadmap, current asks, competed tasks, guides to know where to
get where, all that, no info missing."*

He was right, and the cause was structural rather than careless. **v2 was
written by hand, so it contained whatever I remembered while writing it.**
BUILD.md alone holds about ninety items; v2 showed a handful of them. No amount
of diligence fixes that, because the failure is silent: a missing item looks
exactly like a finished list.

**So the contents are no longer authored. `harvest.py` reads V0, BUILD,
RESEARCH-BACKLOG, DESIGN and TABLES and extracts every item it can find** —
211 on the first run, against 20 in v2. If something is absent from the board
now, it is absent from the docs, which is a different and far more useful
problem.

Three files, three jobs, and keeping them apart is the whole point:

| File | Decides |
|---|---|
| `harvest.py` | WHAT exists. Never edit the board to add an item; add it to its home doc. |
| `render.py` | How it reads. The curated blocks (Right now, Your desk, the roadmap, the guides) live here, because a script cannot know what is worth doing next. |
| `template-v3.html` | How it looks. A frame of `__SLOT__` placeholders. |

**`build.py` fails the build if the page renders fewer rows than the harvest
found.** A silently dropped item is the exact failure v3 exists to prevent, so
it is an error and not a warning.

The v1 board is archived at `tools/status-board/*-ARCHIVED-2026-08-06.html` with
its artifact URL frozen; v2's template is kept as `template-v2.html` for the
same reason. Aaron said archive, not delete.

## How to regenerate

1. **Update the DOC, not the board.** A new task, decision or open question goes
   into the file that owns it per the CLAUDE.md sources-of-truth table. The
   board picks it up on the next build. Editing the board to add an item is the
   one thing that breaks v3.
2. **Refresh the curated blocks in `render.py`** — `CURATED['now']`,
   `['desk']`, `['roadmap']`, `['guides']`, `['ref_words']`. These are the
   judgement calls: what is true today, what is waiting on Aaron, and the path
   from here to the twenty. Every one needs both a technical line and a plain
   line.
3. **Build:** `python3 tools/status-board/build.py`. It harvests, renders,
   inlines the fonts, converts to pure ASCII, checks div balance, and refuses to
   finish if rows < harvested.
4. **Verify with real screenshots** — desktop and 390px, both themes, and with
   every `<details>` forced open. Check `scrollWidth == clientWidth`.
   Then exercise the controls: Expand all, Collapse all, the filter, Only open,
   Only your calls.
5. **Publish** with the Artifact tool, passing `url` = the live URL above,
   favicon 🏀, and a one-line description.
6. **Commit `harvest.py`, `render.py` and `template-v3.html`.** Never commit a
   hand-edit to `status-v3.html`; it is output.

### Two traps this board has already fallen into

- **The output must be pure ASCII.** The artifact host supplies `<head>`, so the
  template cannot declare a charset, and any host that omits one guesses. Chrome
  guesses latin-1 and turns every `·` into `Â·`. `build.py` escapes to numeric
  character references at the end of the build.
- **CSS is not HTML.** A `content:"▸"` escaped to `&#9656;` renders the entity
  literally, because CSS does not decode HTML entities. Marker glyphs in the
  stylesheet use the CSS escape (`\25B8`) so the ASCII pass leaves them alone.

## The format — do not restructure

Aaron's brief for v3: a project-management tool. Roadmap, current asks,
completed work, and guides for how to get from here to there, with nothing
missing and nothing confusing. That means everything is present and almost
everything is folded.

| # | id | Contains | Folded? |
|---|---|---|---|
| — | `.gates` | The two launch gates, each with a bar and a sentence naming what is genuinely missing | open |
| — | `.board` | Six-tile DSEG7 scoreboard | open |
| — | `.controls` | Sticky: Expand all · Collapse all · Only open · Only your calls · a live text filter | open |
| 1 | `now` | **RIGHT NOW** — what is true today | open |
| 2 | `desk` | **YOUR DESK** — only Aaron can do these. Every item ends in a `Do` block | open |
| 3 | `roadmap` | **THE ROADMAP** — five stages from filling the bank to the big direction. One `<details>` each, the current stage open | stage 1 open |
| 4 | `owed` | **EVERYTHING OWED** — the generated tree. One group per doc, then items, then their children, each with `file:line` | folded |
| 5 | `research` | **RESEARCH QUEUE** — every run, open first | table open |
| 6 | `guides` | **HOW WE GET THERE** — the pipelines written as numbered steps | folded |
| 7 | `done` | **ALREADY DONE** — grouped by doc | folded |
| 8 | `ref` | **WHAT THE WORDS MEAN** — plain-language glossary | open |

### Collapsing uses `<details>`, never JavaScript

Every folded block is a `<details>/<summary>`. Chat file previews run **no
JavaScript**, and a board whose sections cannot be opened in a preview is worse
than one with no sections. The script at the bottom only ADDS: expand all,
collapse all, the filter, and hiding groups the filter has emptied.

### Headings are navigation, not tasks

An item with children at heading rank shows **how much open work is inside it**,
not a status pill. "2 · The player journey" wearing an OPEN badge reads as an
unfinished job when it is a place where jobs live. A superseded branch counts
zero and says Superseded, because a retired chapter should never advertise work.

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

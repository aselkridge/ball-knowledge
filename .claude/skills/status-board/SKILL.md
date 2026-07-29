---
name: status-board
description: Regenerate Ball Knowledge's Build Status Board — the exhaustive, fixed-format report of what's built, what's in progress, what's left, the full research queue by type, Aaron's action items, and scheduled runs. Use whenever Aaron asks for a status report, phase report, "where are we", "what's left", or an update on the build. ALWAYS use this format; never invent a new one.
---

# Status Board — the ONE format for build reports

Aaron: *"every time I ask for it, it comes in a different format, which is
confusing... I want it to look a certain way."* **This skill is that format.**
Never freestyle a status report. Regenerate this board.

**Live artifact URL:** `https://claude.ai/code/artifact/e1b36228-8718-48b9-a5cb-5b5676348bf8`
Republish to the SAME url so Aaron's link never changes and version history accrues.

## How to regenerate

1. **Measure first, never recall.** Run `python3 tools/audit.py` and read the
   real files. Every number on the board must be recomputed — the stale-numbers
   rule (LEARNINGS LOG #6) applies to this board more than anywhere, because it
   is the thing Aaron reads to decide what to do next.
2. **Edit `tools/status-board/template.html`.** Never edit the built output.
   Fonts are `__ANTON__` / `__DSEG__` placeholders; the build script inlines them.
3. **Build:** `python3 tools/status-board/build.py <out.html>` (validates div
   balance and reports section/item counts).
4. **Publish** with the Artifact tool, passing `url` = the live URL above,
   favicon 🏀, and a one-line description.
5. **Commit the template** so the next regeneration starts from current truth.

## The format — do not restructure

Eight sections, in this order. Section names and ids are fixed:

| # | id | Contains |
|---|---|---|
| 1 | `built` | Shipped phases, grouped: foundation/core · road-to-launch · this round · data integrity |
| 2 | `progress` | Running agents, unblocked-and-queued-next, branch state |
| 3 | `left` | Three tracks: finish the launch · after-launch phases · app & legal |
| 4 | `research` | The queue grouped by TYPE (A/B/C/D), with the skill named on every run |
| 5 | `skills` | The five skills, what each does, which runs use it |
| 6 | `desk` | Aaron's actions, numbered by unblocking power, each with an explicit CTA |
| 7 | `sched` | Recurring routines with exact dates, times (UTC + ET/PT), cron, trigger id |
| 8 | `truth` | Sources-of-truth map + the source standard in one line |

### The repeating item pattern — every single item uses it

```html
<div class="item s-live|s-run|s-wait|s-queue">
  <div class="ihead">
    <span class="id">V7</span>            <!-- optional backlog id -->
    <h3>Title</h3>
    <span class="pill live|run|wait|queue">Status</span>
    <span class="tag">context</span>       <!-- optional -->
  </div>
  <p class="what">TECHNICAL description — real numbers, real file paths, real mechanics.</p>
  <p class="plain"><b>In plain terms</b>PLAIN-LANGUAGE explanation, no jargon.</p>
  <div class="meta"><span class="tag">Type B · agents</span><span class="tag">skill: verify-facts</span></div>
</div>
```

**Both lines are mandatory on every item.** Aaron asked for technical AND plain
language on every piece — an item with only one is incomplete. The plain line
never repeats the technical line in shorter words; it says *why it matters* or
*what it means for a player*.

### The RIGHT NOW panel and the progress rail — required, at the very top

Aaron's second round of feedback: *"Its still hard to tell, where I am at and
what is next."* Two devices answer that and both are mandatory, placed ABOVE the
scoreboard:

1. **`.rightnow`** — three columns, orange-bordered: **Where the build is** ·
   **Your next move (exactly ONE thing)** · **My next move (at most two)**. Each
   column ends in a `.rn-jump` link to the relevant section. Never list five
   things in "your next move" — the whole point is to name the single next action.
2. **`.rail`** — a horizontal phase timeline. `.done` = green top-rule,
   `.now` = orange with an automatic "← YOU ARE HERE" label, unclassed = grey.
   Exactly one `.now`.

### Navigation must actually work

Anchor navigation can be swallowed inside the sandboxed artifact frame, so the
inline script at the bottom binds explicit `scrollIntoView` on every `nav a`,
`a.cell` and `a.rn-jump`, plus an IntersectionObserver-free scroll-spy that adds
`.active` to the current nav entry. **The scoreboard metric tiles are `<a>`
elements**, not divs — each jumps to the section that explains it. Keep it that
way; a metric you can't click is a dead end.

### Status vocabulary (colour is semantic, not decorative)

- `s-live` / `pill live` — shipped and on `main`
- `s-run` / `pill run` — running or actively next
- `s-wait` / `pill wait` — blocked on Aaron
- `s-queue` / `pill queue` — queued, not blocked
- `s-stop` / `pill stop` — failed or crashed. **Use it.** A run that died is
  reported as prominently as one that succeeded; hiding a failure behind
  "in progress" is the one thing this board must never do.

### Scoreboard cells (masthead)

Six metric tiles in DSEG7, drawn from `tools/audit.py` output plus the backlog.
Keep them to: questions sourced · players sourced · errors fixed · research runs
left · awaiting-Aaron count · next scheduled run.

## Rules that keep it honest

- **Report failures and regressions as prominently as wins.** If the audit gate
  is failing, that goes in the masthead, not buried.
- **Never mark something shipped that isn't merged to `main`.** Branch state is
  its own item in section 2.
- **Every research run names its skill.** If a run has no skill, that's a gap to
  flag, not to hide.
- **Every desk item ends in a `.cta` block** with a concrete first move — not
  "consider whether…" but "say X and I'll do Y" or "send the letter, then tell me."
- **Decisions vs actions are different.** Section 6 is actions only; answered
  decisions are recorded in section 4 under Type D so the record survives.

## Design (already built — match it, don't redesign)

Grounded in the game's own system: Anton display face and DSEG7 LED numerals
(the counter Aaron loves) inlined as data URIs; `#f5872e` arena orange as the
single accent; warm near-black `#100d0b` ground; semantic status colours kept
separate from the accent; both themes defined at token level with
`data-theme` overrides. Scoreboard/stat-sheet layout, not a generic dashboard.

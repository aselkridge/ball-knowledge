---
name: open-items
description: File every "still to do" into the doc that owns it, so it cannot be lost to a compaction. Run at the end of any work block, before a compact, whenever a reply contains the words "still open"/"not fixed"/"next step"/"worth doing later", and whenever Aaron asks what is left. Runs tools/open-items.py first so the list is harvested, not remembered.
---

# Open items — if it was only ever said, it does not exist

Aaron, 2026-08-04: *"Make sure you mark down every learning and everything that
is still left to do that you mentioned so we do not lose track. Maybe that needs
to be ANOTHER skill, that every time you come up with something that still needs
to be done that we are sure to add it to the list of to-dos so that it does not
get lost or forgotten."*

He was pointing at something that had just happened. One work block on 08-04
surfaced four real pieces of work — 40 source rows holding two urls, 3 unruled
sites, the wrong-page failure tiering cannot catch, a root-slug hole — and every
one of them existed **only as a sentence in a chat reply**. The commit did not
carry them. No file carried them. One compaction and all four are gone, and the
next session pays full price to rediscover them. That is not hypothetical here:
the 22u lesson was rediscovered twice.

CLAUDE.md already says the shape of the fix:

> *"when something is decided or a mistake is understood, it lands in a file in
> the SAME turn"* … *"the durable fix is turning a claim into a command — because
> scripts run and reminders don't."*

That rule existed and did not fire, for the same reason the learnings rule did
not fire: it was a reminder. This is the command version.

## Step 1 — harvest, do not recall

```
python3 tools/open-items.py            # the list + the drift checks
python3 tools/open-items.py --list     # just the list
```

**Never answer "what's left" from memory.** That is the failure this exists for.

## Step 2 — read back what you actually said this block

Scan your own replies in this session for the phrases that mean work:

- "still open" · "not fixed" · "found but not fixed" · "worth doing later"
- "I haven't checked" · "would need a separate pass" · "its own job"
- "next step" · "the real work is" · "before this ships"
- any number you reported as bad and did not then fix
- anything you talked Aaron OUT of doing now — a deferral is an item, and it is
  the kind most likely to vanish, because it feels resolved

For each one: **is it in the harvested list?** If not, it is unfiled. That is the
whole check.

## Step 3 — put it in the doc that already owns it

The sources-of-truth table in CLAUDE.md decides. This skill never does, and
**never starts a new file** — a parallel to-do list is how the real one dies.

| the item is about | its home |
|---|---|
| research, sourcing, verification debt | `RESEARCH-BACKLOG.md` (V/Q/S/P item) |
| something in V0 scope, or a gap in something just built | `V0.md` |
| build state, roadmap, anything needed FROM Aaron | `BUILD.md` |
| the data structure, schema debt | `TABLES.md` |
| a game rule left undecided | `DESIGN.md` |
| a lesson, not a task | `AI-LEARNINGS.md` / `MAKING.md` — use the `learnings` skill |

If two homes fit, pick the one someone would look in while doing that work, not
the one it was discovered in.

## Step 4 — write it so it survives you

The format is the markdown checkbox BUILD.md §5 has used since July:

```
- [ ] **V16 · 40 source rows hold TWO urls in one field.** Type C — mechanical.
  e.g. `basketball-reference.com/...fowlesy01w.html ; lynx.wnba.com/news/...`.
  Tiering reads the first url so nothing is over-rated, but the two-source rule
  counts ROWS, so these are undercounted. Count it:
  `python3 -c "...print(sum(1 for x in s if (x.get('url') or '').count('http')>1))"`
```

Four things make an item survive, and all four are cheap:

1. **The number, and the command that produces it.** "Some rows have two urls" is
   a feeling. `40`, plus the one-liner that recounts it, is a task. It also means
   the next session can tell whether it is still true.
2. **What it blocks.** An item with no consequence gets skipped forever and
   should probably not be written.
3. **Why it is not already done** — mechanical vs needs-a-ruling vs
   needs-research. This is what lets Aaron pick.
4. **The state it is safe in NOW.** "Nothing is currently over-rated because
   tiering reads the first url" stops a future session panicking and doing it
   badly at the wrong moment.

Close items in place — `- [x] ~~title~~ ✅ DONE 08-04 — what actually happened`.
Never delete one; a closed item is the record that it was considered.

## Step 5 — commit in the same turn

An item written and not committed is an item lost to the next compaction. Say in
the commit body what was filed, not just that a doc changed.

## Do not

- Do not open a new to-do file, board, or notes doc. Ever. There is one home per
  kind of thing and the map is in CLAUDE.md.
- Do not file a vague item to look thorough. "Improve the sources" is noise and
  makes the list unreadable, which is how lists die.
- Do not file something you could just do. If it is two minutes, do it.
- Do not silently renumber or delete an item because it looks wrong. On 08-04 V0
  said "9 runs" over a table of 8 — that got **marked in place**, because
  renumbering a plan mid-build is how two sessions end up discussing different
  R5s.
- Do not quote a count from an item without re-running its command. Items go
  stale; that is why each one carries the command.

# Ball Knowledge — operating instructions (read first, every session)

> **THE PLAN IS `V0.md`.** Read it before planning anything or answering "what's
> next". It is short and it is the only live scope. `BUILD.md` is the RECORD —
> its § 3 and § 4 are the superseded July 29 board. **Never assemble a plan from
> both.** Aaron, 2026-08-01: the sessions kept blending them and it cost him time.


## What this is
Turn-based basketball strategy where knowledge is your jumpshot. The full
ruleset and every locked decision live in **DESIGN.md** — read it before
touching gameplay code. If it's not in DESIGN.md, it's not decided.

## The medium-honesty rule (carried over from Aaronautics — non-negotiable)
Before building ANY visual element, state which medium it needs:
- **Vector / CSS / SVG / canvas geometry** (court, HUD, logos, cards, meters,
  figurine pieces, animation, type) → build it; this can be genuinely beautiful.
- **Illustrated / painterly / organic** (player portraits, card art, mascots,
  painterly scenes) → hand-coding has a hard ceiling. STOP, say so, and spec
  exactly what Aaron should source (subject, style, framing, transparent bg).
  Never over-promise and land at blocks.

### AND THERE IS A THIRD OPTION I KEEP MISSING: IT ALREADY EXISTS
**Before drawing anything, open `DESIGN.md` § 9 and look at what the game
already does.** Aaron, 2026-08-06: *"remember to reference the design file when
doing these things, I have standards to meet."*

The coming-soon page earned this. I hand-drew an SVG half court as a backdrop,
faded it so hard nobody could see it, and shipped it. Aaron: *"i cant even see
that basketball court and ball in the background."* The game's main menu has
painted an arena behind itself since day one (`#worldbg`, `arena-menu.jpg`,
brightness .4 / saturate .42, accent tint at `mix-blend-mode:color`, a 40s
drift). It is right there, it is licensed, it is already loaded, and it is
better than anything CSS strokes will produce.

So the medium question has three answers, not two: **build it · source it ·
or find it already built.** Check the third one first. A new surface should
look like it came out of the same building as the game, and the fastest way to
guarantee that is to reuse the device rather than reinvent it. When you do
reuse one, **copy the values and say so in a comment**, so the two move
together the day the original is retuned.

## Best option wins
On design decisions, present a genuine expert opinion AND the trade-offs, then
let Aaron pick. The goal is the best result for the game — including "source
this art" or "don't build my idea" — never the option that's merely easiest or
most fun to build. Ask, don't guess, on anything with real taste in it.

## Show before it goes live — and VERIFY
- Main branch = live site (GitHub Pages serves `docs/` on main). Feature work
  happens on branches; Aaron merges.
- Mockup first for big visual changes; real headless screenshots (desktop AND
  mobile viewport) verified before asking Aaron to look.
- HARD-LEARNED: file previews in chat may run NO JavaScript. Chat-previewable
  mockups must be static HTML/CSS. The real game (served from Pages, opened in
  a browser) runs JS fine — never confuse the two constraints.

## EVERY REDESIGN SHIPS A COMPARISON ARTIFACT (Aaron, 2026-08-01 — standing rule)
Aaron should never have to ask for this. **Any time you change how something
LOOKS or READS — a screen, the board, a colour meaning, type, layout, a flow —
build a side-by-side comparison and publish it as a private Artifact before it
merges.** Not a description of the change. The change, next to what it replaced.

What the comparison MUST contain:
- **Before and after, side by side**, from real headless screenshots of the real
  thing — never a mockup standing in for the shipped result, and never one
  without the other. A lone "after" is a sales pitch.
- **Desktop AND mobile (390px).** Most of this game is played on a phone.
- **Both light and dark**, wherever the surface has two.
- **What changed and WHY, in one line each** — and the measurement where one
  exists. "Corner tiles now pay 3 (they were 2, measured on 4 tiles)" beats
  "improved the shot zones".
- **What was deliberately left alone**, when a reader would reasonably expect it
  to have changed. Silence there reads as an oversight.

Why this is a rule and not a nicety: today the corner-three fix went out with the
right geometry and the WRONG COLOUR LANGUAGE — red meaning "worth 3" while red
already meant "hard" on every card. Aaron caught it from a screenshot in seconds.
A before/after would have made the collision obvious to me first. **A visual
change you cannot put next to what it replaced is a change you have not checked.**

Applies to redesigns, not to every commit. If in doubt: would a screenshot of
this look different to a player? Then it needs the comparison.

## MEASURE BEFORE YOU ASSERT (added 2026-07-31, after four failures in one day)
The most common way I mislead Aaron is stating something confident and specific
that I reasoned my way to instead of checking. In one session:
- told him BIG3/World were playable and College/Street weren't — built from
  `MODES`/`PACKS` without opening `LG_LEAGUES`, **the same mistake 22u already
  recorded the day before**
- told him a fixed fill order meant a player would "essentially never" land at
  centre. Measured: 55/45. He had already made a decision on the strength of it.
- copied `bkid.slug` instead of importing it, and claimed in a comment that it
  matched. It didn't, and would have re-split J.J. Redick from himself.

The rule, and it is cheap:
1. **Before stating any number, count or list about the shipped data or code,
   run the thing that produces it and show the output.** Not "roughly 80 cards"
   — run the count.
2. **Before describing the SIZE of an effect** (a bias, a distribution, an
   impact), measure it. "First in the list therefore usually wins" was
   arithmetic I never did.
3. **If a doc already covers what you're about to assert, open the doc.** A
   written learning does nothing if the next session doesn't read it — proved
   twice by 22u.
4. **If you can't show a number, say "I haven't checked."** That sentence is
   always available and costs nothing.

Honest limit, so this section isn't over-trusted: instructions alone did NOT
prevent the repeat of 22u. The durable fix is turning a claim into a command —
if a check can be a script (`audit.py`, `tables-verify.py`, a spec file), make it
one, because scripts run and reminders don't. This is a backstop, not the
mechanism.

## WRITE IT DOWN BEFORE THE CONTEXT GOES
A long session gets summarised, and anything decided in conversation but never
written to a FILE ceases to exist. This has already nearly cost a full day of
decisions. Two mechanisms, because a note asking nicely is not enough:
- A **PreCompact hook** (`.claude/settings.json`) fires before any compression
  and asks: decisions missing from the docs? learnings missing from
  `AI-LEARNINGS.md`? uncommitted work?
- **`python3 tools/learnings-check.py`** counts it instead of asking. It lists
  the code/data commits since the last learnings were written and says plainly
  whether either file was touched. Run it at the end of any work block; the
  `learnings` skill does the judgement the script cannot.
  Why it exists: Aaron asked on 08-03 whether learnings were being tracked.
  **Nine commits that day, zero touching either file** — including the ones that
  produced the best lessons in the project. The reminder below did not work, and
  this file already said reminders do not work. Now it is counted.
- **`python3 tools/open-items.py`** does the same for WORK STILL OWED. Every
  open item, harvested from the docs that own them, in one command — plus the
  counted debt nobody has written an item for, and how many work commits have
  gone by without a single item filed or closed. The `open-items` skill does the
  judgement.
  Why it exists: Aaron, 08-04 — *"every time you come up with something that
  still needs to be done... make sure it does not get lost or forgotten."* That
  day one work block surfaced four real tasks and **all four existed only as
  sentences in a chat reply.** Not in the commit, not in any file. One compaction
  from gone. Eleven were found unfiled when the tool was first run.
- **The standing rule:** when something is decided or a mistake is understood,
  it lands in a file in the SAME turn. Project decisions go to their home below.
  Lessons about working with AI *in general* go to `AI-LEARNINGS.md`, which is
  Aaron's portable file and is meant to outlive this project.
  **EVERY BUG GETS A VERDICT OUT LOUD: FIXED or FILED.** Aaron, 08-04: *"So when
  you find those bugs, do you fix them or are they now in the backlog? It's
  unclear."* It was. A day's work turned up seventeen defects and the reply
  described them all in the same voice, so there was no way to tell which ones
  were still bleeding. Never report a bug without one of these words attached:
  **FIXED** (done, in this commit), **FILED** (written to a named file, with the
  item id), or **RULED** (Aaron decided to live with it). "Half fixed" is a real
  answer and needs BOTH halves stated — what shipped, and what is filed. A bug
  with no verdict is a bug the reader has to chase.

  **And a to-do is the same kind of thing as a decision.** If a reply says
  "still open", "found but not fixed", "worth doing later", "its own job", or
  reports a bad number without fixing it — that is an item, and it lands in a
  file in the SAME turn or it does not exist. A deferral is the most fragile kind
  of item, because it FEELS resolved once it has been explained.

## Sources of truth — one home per thing, updated IN PLACE
| Thing | Its ONE home |
|---|---|
| How we work (this) | `CLAUDE.md` |
| Game rules & locked design decisions | `DESIGN.md` |
| Build state, roadmap, changelog | `BUILD.md` |
| Research method, data standards, LEARNINGS | `DEEPRESEARCH_KNOWLEDGE.md` |
| Research & verification queue | `RESEARCH-BACKLOG.md` |
| Links, services, logins | `PLACES.md` |
| Build status reports (the ONE format) | `.claude/skills/status-board/` |
| Pull requests (the ONE format) | `.github/pull_request_template.md` |
| The data structure (tables, keys, joins) | `TABLES.md` |
| Lessons about working with AI (portable, Aaron's) | `AI-LEARNINGS.md` |
| Everything still owed (the LIST, not a new file) | `python3 tools/open-items.py` — harvests V0 · RESEARCH-BACKLOG · BUILD · TABLES · DESIGN |

Everything else is reference (`APP-AND-MONEY.md`, `ART_PROMPTS.md`, `design/`)
or a pending action (`BLACKFIVES-OUTREACH.md`). Rules that keep this true:
- **New learnings OVERWRITE the relevant section in their home file.** Never
  start a parallel notes file; superseded text gets deleted, not stacked under.
- **The commit that makes a doc stale fixes the doc.** Never quote a coverage
  number without recomputing it from the files.
- **Data gate:** nothing merges into `questions.js`/`players.json` without the
  find → prove → merge pipeline in `DEEPRESEARCH_KNOWLEDGE.md` (source tiers,
  three outcomes, quarantine-never-delete, dateChecked).
- **Enforcement is code, not vibes:** `python3 tools/audit.py` gates every data
  change (baseline ratchet — old debt passes, NEW debt fails). Skills in
  `.claude/skills/` (`verify-facts`, `mine-questions`, `audit-bank`,
  `research-brief`, `tidy`) carry the procedures; the script carries the law.
  Regenerate `volatile-questions.json` via `tools/build-volatile-index.py`
  after any merge touching v:1 cards.

## House rules
- No CDNs. Everything self-hosted in this repo.
- Renderer and game rules stay separate (DESIGN.md §9) — the look can evolve
  without a rules rewrite.
- Economy guardrails (DESIGN.md §11): cards raise floors, never ceilings;
  stakes in credits, never real money.
- Commit with `user.email=noreply@anthropic.com`.

## MAKING.md — the build diary (added 2026-08-01)
Aaron is writing a making-of, possibly a book, about building a game with an AI
system. `MAKING.md` is that file. It is NOT BUILD.md (decisions), NOT
AI-LEARNINGS.md (portable method), NOT this file (rules). It is the story: what
went wrong, what it cost, what it felt like.

**When something instructive happens — an error, a wrong assumption caught, a
surprise, a thing that took far longer than it should have — add it to MAKING.md
in the same session.** Reconstructed later it will be too tidy, and the tidiness
is what makes build stories useless. Do not sanitise. The errors are the content.

# PLACES — where everything about Ball Knowledge lives

One page instead of a bookmark folder. If a service, login, or link matters to
this build, it belongs here. (Keep this updated when anything new joins the
stack.)

---

## 🏀 The game itself

| What | Where |
|---|---|
| **THE GAME (live)** | https://bk-ballknowledge.com/play/ |
| **THE TAPE — the data browser** | https://bk-ballknowledge.com/tape/ (unlisted, not private: noindex keeps it out of search, anyone with the path can open it. Spreadsheet export is passcode-gated; the tables themselves are public because the game fetches them.) |
| **COMING SOON — the link to share** | https://bk-ballknowledge.com/soon/ — **LIVE**, verified 2026-08-06 (served HTML byte-identical to the repo file). No link into the game; shares with a custom card (`share-soon.jpg`, 1200×630). The game's own painted arena behind it and one track, Ketsa's "Grounded", on a tap. |
| Front door / landing page | https://bk-ballknowledge.com — **the coming-soon page, swapped 2026-08-11 on Aaron's word ("Swap the front door")**. The old alpha door moved to <https://bk-ballknowledge.com/alpha/> (noindex, still one button into the game), and `/soon/` still serves for every link already shared. All three verified headless: every asset 200 on root, /alpha/ and /soon/. |
| Old URL (auto-redirects) | https://aselkridge.github.io/ball-knowledge/ |

Live = whatever is on the `main` branch, `docs/` folder. GitHub Pages deploys
it automatically ~30–60s after a push to main.

## 🗄️ Code — GitHub

| What | Where |
|---|---|
| Repo | https://github.com/aselkridge/ball-knowledge |
| Pages settings (domain + HTTPS) | https://github.com/aselkridge/ball-knowledge/settings/pages |

- `main` is LIVE. Work happens on a session branch and merges to main to ship.
- `docs/CNAME` holds the custom domain — GitHub manages it, don't delete it.

## 🖧 Server — Render (the online-play relay)

| What | Where |
|---|---|
| Dashboard | https://dashboard.render.com |
| Health check | https://ball-knowledge-rvbb.onrender.com/health |

- The relay runs rooms, friend codes, reconnects, and **THE GUEST LIST**.
- **Access codes live here**: service → Environment → `BK_ACCESS`
  (comma-separated codes; change the value to rotate — old codes die on the
  restart, ~1 minute). `/health` shows `"gate":true` when the list is on.
- Auto-deploys `server/` from the repo's main branch.
- Free tier: it naps between games — the game wakes it politely (Phase 1.5),
  nothing to manage.

## 🌐 Domain — Namecheap

| What | Where |
|---|---|
| Registrar dashboard | https://www.namecheap.com → Domain List → `bk-ballknowledge.com` → Manage |

- DNS lives under **Advanced DNS**: four `A` records `@` →
  `185.199.108.153 / .109. / .110. / .111.153` plus `CNAME www` →
  `aselkridge.github.io`. That's the whole config — don't add extras.
- Renews yearly. SSL is NOT bought here — GitHub Pages provides HTTPS free.

## 🎨 Art pipeline

| What | Where |
|---|---|
| Image generation | https://firefly.adobe.com/generate/image |
| **Generator settings per model (read this BEFORE pasting any prompt)** | `ART_PROMPTS.md` § the generator settings map |
| Prompts · courts and floors | `design/COURT-SKINS.md` in this repo |
| Prompts · the walkable places, career stages, cutscenes, shop | `design/PLACES-ART-BRIEF.md` |
| Drive — the Firefly settings panels these were read from | https://drive.google.com/drive/u/0/folders/1VXH3nUv04-eRYAO_ist_DJoX-v3TaQ6E |
| Drive — floors (round 2) | https://drive.google.com/drive/u/0/folders/1an6mxPvjMBH3wSVl6scKYXfF1W4XXOdf |
| Drive — court scenes (round 3, the 43) | https://drive.google.com/drive/u/0/folders/198nOhTLGaB8E5M8HLtncUKZ4PNRP-WFU |
| Committed game art | `docs/play/assets/courts/` |
| Unused candidates (banked, never lose art) | `design/art-bank/` |

Workflow: prompts from COURT-SKINS.md → Firefly → a shared Drive folder →
Claude pulls, composites in-engine, you pick → winners get committed.

## 🤖 Claude (the co-builder)

| What | Where |
|---|---|
| Claude Code sessions | https://claude.ai/code |
| This build's session (pinned 08-06; sessions roll, `git log` is the real index) | https://claude.ai/code/session_01R7grX6ywtAGtN8myw22kyx |
| Court-picker mockup (artifact) | https://claude.ai/code/artifact/54966040-773f-4e0b-9363-5f9f79e3bd86 |

Every commit's message ends with a session link — `git log` is the index of
which chat built what.

## 📚 The knowledge docs (in this repo)

**This table is the map, so it has to list every home.** It listed four of
them until 2026-08-17, which made it useless for its one job.
CLAUDE.md's sources-of-truth table is the authority; this repeats it with links.

| Doc | What it holds |
|---|---|
| `CLAUDE.md` | how we work · the standing rules · the sources-of-truth map |
| `V0.md` | **THE PLAN.** The two paths to the twenty. Query it with `python3 tools/next.py`, never by reading |
| `DESIGN.md` | the ruleset and every locked design decision, including what the brand marks mean |
| `BUILD.md` | build log, roadmap, changelog, the session records, Aaron's open action items in § 5 |
| `TABLES.md` | the data structure: tables, keys, joins |
| `DEEPRESEARCH_KNOWLEDGE.md` | the research-run playbook (5 run types, honesty rules, the injection protocol) |
| `RESEARCH-BACKLOG.md` | the research and verification queue |
| `LEGAL.md` | legal findings and open legal questions (added 08-15) |
| `AI-LEARNINGS.md` | Aaron's portable lessons about working with an AI system |
| `MAKING.md` | the build diary: what went wrong, what it cost, how it felt |
| `ART_PROMPTS.md` | the generator settings map + the logo and brand prompt round |
| `design/PLACES-ART-BRIEF.md` | the walkable places: gym, room, town, career stages, cutscenes, shop |
| `design/COURT-SKINS.md` | the court/art system: prompts, standards, verdicts |
| `design/SOUND-SHEET.md` | crowd beds, announcer barks, chants, the VS stinger (added 08-16) |
| `design/vs-stinger-takes.js` | the four alternative VS stinger takes, runnable |
| `PLACES.md` | this file |

## 📊 The Build Status Board

Exhaustive status report — built / in progress / left / research queue / your
actions / scheduled runs, with a technical AND a plain-language line on every
item. **One fixed format**, regenerated via the `status-board` skill.

| What | Where |
|---|---|
| **Live board** | https://claude.ai/code/artifact/89cb5a79-9c6d-4b3b-8842-b5954f5ceaec |
| What is on it | Harvested from the docs: **211 items** across V0, BUILD, RESEARCH-BACKLOG and DESIGN. Roadmap, your desk, research queue, guides, done, glossary. Collapsible and filterable. |
| The list | `tools/status-board/harvest.py` — reads the docs. **Add items to their home doc, never to the board.** |
| The words | `tools/status-board/render.py` — the curated blocks and the HTML |
| The look | `tools/status-board/template-v3.html` |
| Build script | `python3 tools/status-board/build.py` (fails if the page renders fewer rows than the harvest found) |
| Format standard | `.claude/skills/status-board/SKILL.md` |
| Archived v1 board | https://claude.ai/code/artifact/e1b36228-8718-48b9-a5cb-5b5676348bf8 — frozen 2026-08-06 with the gate-flip content, the last state it was published in. Aaron: *"archive the old one dont delete or rewrite."* Never republish over this url. Files: `tools/status-board/*-ARCHIVED-2026-08-06.html` |

Ask for "a status report" / "where are we" and it regenerates to the SAME URL.

### FOR THE LAWYER FRIEND

Aaron, 2026-08-07: *"I also have a lawyer friend, if I come to him with a
questions and a document to read to give me information, what can I give him."*

| What | Where |
|---|---|
| **The brief** | https://claude.ai/code/artifact/d44c2d83-6fa0-451a-8bf6-8022c939d0c4 |
| Build script | `python3 tools/lawyer-brief.py <out.html>` — **pulls every quote out of `research-v29b-licensing.json` and fails if a document it expects is missing.** Nothing is retyped; hand-transcribing a licence clause into a document meant for a lawyer is the error this repo keeps writing rules about. |
| Shape | Project facts · **7 questions ranked so the first two matter most** · what we already checked so he does not repeat it · every referenced clause verbatim with URL and read date |
| **ONE THING AARON MUST EDIT BEFORE SENDING** | The "Who runs it" row says `[AARON: add your state]`. Right of publicity varies enormously by state and question 5 cannot be answered without it. |
| Design note | Deliberately NOT the game's look: system serif, print stylesheet, sober. The audience is a professional doing a favour who may print and annotate it. Matching the treatment to the reader beats matching it to the other pages. |
| Caveat carried on its face | Not legal advice, not a request to act as counsel, and the quotes have not yet been re-read at their URLs (V42). |

### PENDING LETTERS — written, not sent

| Letter | File | Status |
|---|---|---|
| Black Fives Foundation, about the trademark | `BLACKFIVES-OUTREACH.md` | draft, Aaron sends. **Out of V0 scope** by his own call |
| Sports Reference, about the AI clause | `SPORTSREF-OUTREACH.md` | draft, Aaron sends. Ruled option C on 08-07. **63% of dealable cards cite them**, so this is the highest-value letter in the project |

### INSTALL GUIDE — the one to send the twenty

Aaron, 2026-08-07: *"Can you provide an instructions doc I can share with
people on how to do it and how to access shortcuts, etc."* Written for friends,
not developers: no jargon, no em dashes, fifteen seconds and four taps.

| What | Where |
|---|---|
| **The guide** | https://claude.ai/code/artifact/7eb29d75-1a3f-4280-b909-cee3f30ca094 |
| Build script | `python3 tools/howto-install.py <out.html>` — fails on an unreplaced placeholder OR on an em dash in the body |
| **It only works once the manifest is on `main`.** | The install metadata is on `claude/locked-brief-build-078n10` as of 08-07. Sending the guide before that merge means Android gets the degraded "add a bookmark" flow and the Daily 5 shortcut does not exist. iPhone steps work today. |
| The honest limit it documents | iOS does not support manifest shortcuts for home-screen web apps, so the Daily 5 long-press is Android only. The guide gives iPhone owners the real workaround instead: add `?go=daily` as its own second icon and rename it. |
| If it should live on the site instead | It is a standalone page with everything inlined, so dropping it at `docs/install/index.html` is a copy and a commit. Aaron's call. |

### THE ORDER, TWO TRACKS — the short one you open daily

The board is the whole project. **This is just the queue**: everything left
before the twenty friends, in the order to do it, data on one side and build on
the other. Aaron, 2026-08-07: *"Can you put those tracks in an artifact please
so it's referenceable lol."*

| What | Where |
|---|---|
| **The order** | https://claude.ai/code/artifact/2869b7a3-a9b1-4d05-b4e9-5e97deebaaf8 |

### THE PLACES art brief · the prompts, with copy buttons

| What | Where |
|---|---|
| **The brief** | https://claude.ai/code/artifact/1a35a96f-5a7a-46b4-8966-e8197e64e746 |

Source is `design/PLACES-ART-BRIEF.md`; the page is generated from it by
`python3 tools/artbrief-artifact.py <out.html>`, so edit the markdown and
republish, never the other way round.

### THE PLACES spike · one url, versioned in place

| What | Where |
|---|---|
| **The spike** (v3 live) | https://claude.ai/code/artifact/b85a3fd1-b835-4a64-9073-7db9759d4006 |

Never mint a new url for it. `python3 tools/spike-build.py` regenerates
`docs/dev/places-spike.html` (fonts and facing A carried forward, facing B
generated from `blacktop-b-bgwide.jpg`), `node tools/spike-check.mjs` proves it
at 390 and 1440, then republish to the url above. The `<title>` is the artifact's
name and beats the publish parameter, so the builder rewrites it.
| Its source of truth | `V0.md` → THE ORDER, TWO TRACKS. **The page is a VIEW.** Change V0, then rebuild — never edit the page to say something V0 does not. |
| Build script | `python3 tools/order-card.py <out.html>` — inlines the game's own four faces, fails on any unreplaced placeholder or row-count mismatch |
| The look | The game's palette copied verbatim from `docs/play/index.html` `:root`; Track A is HOME orange, Track B is the AWAY blue, because the game already has two teams |

### COMPARISONS — one page per visual change, before beside after

The standing rule is in `CLAUDE.md`: anything that changes how the game LOOKS or
READS ships a side-by-side before it merges. Each page is its own artifact and
its own build script, and they all share one set of page furniture — Anton
display, Space Mono utility, arena orange, before in muted grey and after ringed
in accent — so the whole series reads as one document.

| When | What changed | Where |
|---|---|---|
| 2026-08-08 | Menu re-ranked (Online to 02) · the coach stops the Daily Five clock · the `?daily=reset` testing door | https://claude.ai/code/artifact/2670a986-0718-429b-9a5f-424a3e2cb991 |
| 2026-08-08 | **THE MAIN MENU REDESIGN, build one.** Classic beside new, phone and desktop, both themes, plus the four bugs the comparison caught. Build: `node tools/menu2-shots.mjs` then `python3 tools/menu2-artifact.py shots/menu2.html` | https://claude.ai/code/artifact/b23c7e3d-357a-4878-9b2c-9aa8f6a9996d |
| 2026-08-09 | **THE PLACES, SPIKE V2.** Does a push-in feel like walking? Head bob, footsteps and a near layer as switches you can throw, a straight A/B against the v1 camera-only move, and turning demonstrated out of the same photograph. Build: `python3 tools/spike-build.py`, check with `node tools/spike-check.mjs` (42), measure the parallax with `node tools/spike-parallax.mjs <dir>` + `tools/pxdiff.py`. **The page IS the artifact**, published straight from `docs/dev/places-spike.html` | https://claude.ai/code/artifact/b85a3fd1-b835-4a64-9073-7db9759d4006 |
| 2026-08-09 | **PICK THE ONE-SHOTS (sfx audition).** 51 sliced candidates from the sound folder: play, Keep/Kill, copy verdicts. Rebuild: `node tools/sfx-slice.mjs` then `python3 tools/sfx-audition-build.py <out.html>` | https://claude.ai/code/artifact/6897b7dd-35c2-413e-99ac-8edb5d034f77 |
| 2026-08-09 | **THE DAILY FIVE, STAGED (B5c sample).** Playable: the arc + splash, the brick + carom, defense announcing itself, the three endings, and a today-mode toggle for contrast. Build: `python3 tools/theatre-sample-build.py`, check: `node tools/theatre-sample-check.mjs` | https://claude.ai/code/artifact/efc4fa3d-e5ac-4184-9bf8-34f9f1aa3809 |
| 2026-08-16 | **THE DAILY FIVE THEATRE, ported into the real mode.** The flight, the rings, the carom, the slam, Defend-the-Floor round two on the dusk court | https://claude.ai/code/artifact/035d493d-53fa-401b-bd6d-b9d33a4f5f16 |
| 2026-08-16 | **THE RIM SEAT.** Re-measured ring centres and the ball-radius seat, after his *"a bit off... also a bit low"* | https://claude.ai/code/artifact/eb5e88e9-9bdf-4b0f-b83e-63d75db4f2ed |
| 2026-08-16 | **THE FIVE RESPACED.** Round-one spot chips re-anchored to the painted court's own geography, with the deep-to-shallow collision clamp | https://claude.ai/code/artifact/98b35c77-89ca-452f-ab9b-90b369df4862 |
| 2026-08-16 | **THE VS STINGER AUDITION.** Four alternative takes on the lightning hit, after *"it's horrible"* | https://claude.ai/code/artifact/a9bee34b-239e-44fa-89f7-3d2b2e73cd43 |
| 2026-08-16 | **THE BANNER BOOK.** Every top-strip sentence in the game with keep / trim / cut verdicts, awaiting his red pen | https://claude.ai/code/artifact/5faef9fd-46e8-4943-9562-6bc7eeeca364 |
| 2026-08-16 | **WHEEL vs MENU.** The two shapes for the player's turn options side by side; he picked the menu | https://claude.ai/code/artifact/fb6283ae-ee6b-47ee-97aa-efe961db2aba |
| 2026-08-16 | **THE SETUP CAROUSEL.** The peeking picker he specified, replacing the stack of grey buttons | https://claude.ai/code/artifact/2527b1f2-70e6-4c22-a5c7-04ea1e39c1cb |
| 2026-08-16 | **THE PLACES ART BRIEF.** The career round: three room stages, the career gyms, the cutscenes, the shop | https://claude.ai/code/artifact/1a35a96f-5a7a-46b4-8966-e8197e64e746 |
| 2026-08-16 | **THE LANGUAGE REVIEW.** Twelve places the game explained itself to its author instead of to a player, every before and after | https://claude.ai/code/artifact/0937c0c6-3fef-4029-8534-ab954d993afd |
| 2026-08-17 | **THE CAP ON A SWEEP.** Crown versus stamp for the grad cap, twelve real frames; he ruled BOTH IN SEQUENCE | https://claude.ai/code/artifact/07a9e25c-5df5-4da4-94b3-e5001104c6fe |
| 2026-08-17 | **NAMED IT OR ICED IT.** Both Heat Check endings, four beats each, plus the two defects the shoot turned up | https://claude.ai/code/artifact/bba94895-6e33-4676-93ba-9fca2a88bcd8 |
| 2026-08-09 | **THE COACH AND THE DRILLS.** The Gym's half court before and after (invented lines beside real measurements), then both exhaustive lists: 66 drill candidates, 256 coach moments in 19 entry points, and the count that killed the priority scheme. Build: `git show 366ca2c:docs/dev/gym-sample.png > /tmp/before.png` then `python3 tools/coach-artifact.py /tmp/coach-lists.html /tmp/before.png`. Generated FROM `design/COACH-AND-DRILLS.md`, so republish after any edit to that file | https://claude.ai/code/artifact/26fb5cf8-5f2c-4d89-b860-65c8ba8ff7dd |

Build: `node tools/menu-order-compare.mjs` (needs `docs/` served on :8899) for the
shots, then `python3 tools/order-artifact.py shots/order.html`. The comparison
script mints the BEFORE tree out of git and deletes it again — never from a
working copy, and never from a `.bak`, which was used once here and already
contained two of the changes it was supposed to be the control for.


## ⏰ Scheduled Routines (claude.ai — manage in the Routines UI)

Three yearly **volatile refresh** runs (backlog V6, event-anchored). Each fires a
fresh Claude session that verifies the volatile card index + stale player
records, applies fixes on its own branch through `tools/audit.py`, pushes, and
sends a phone notification. **Never auto-merges — Aaron merges.**

| When | What it follows | Trigger id |
|---|---|---|
| Oct 25 · 14:00 UTC | WNBA Finals + awards | `trig_01PoKW2jfu8nmYZkg3A78MNs` |
| Feb 12 · 14:00 UTC | NBA trade deadline | `trig_01QHe6pTbf1iB4C4pGgwif5z` |
| Jul 15 · 14:00 UTC | NBA Finals + draft + free agency | `trig_019wBHiLQkh9n2v6ubamNUPA` |

First-ever firing: **Oct 25, 2026**. Sanity-check that first run's branch before
merging — it's the shakedown cruise.

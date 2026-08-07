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
| Front door / landing page | https://bk-ballknowledge.com — still the old "Play the alpha" door with a button straight into the game. Swapping it for the coming-soon page is Aaron's call, on his desk. |
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
| Prompts + the art system (paste-ready) | `design/COURT-SKINS.md` in this repo |
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
| This build's session | https://claude.ai/code/session_01R7grX6ywtAGtN8myw22kyx |
| Court-picker mockup (artifact) | https://claude.ai/code/artifact/54966040-773f-4e0b-9363-5f9f79e3bd86 |

Every commit's message ends with a session link — `git log` is the index of
which chat built what.

## 📚 The knowledge docs (in this repo)

| Doc | What it holds |
|---|---|
| `BUILD.md` | build log, roadmap, every shipped change |
| `DEEPRESEARCH_KNOWLEDGE.md` | the research-run playbook (5 run types, honesty rules, Aaron's expansion wishes) |
| `design/COURT-SKINS.md` | the court/art system: prompts, standards, verdicts |
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
| Its source of truth | `V0.md` → THE ORDER, TWO TRACKS. **The page is a VIEW.** Change V0, then rebuild — never edit the page to say something V0 does not. |
| Build script | `python3 tools/order-card.py <out.html>` — inlines the game's own four faces, fails on any unreplaced placeholder or row-count mismatch |
| The look | The game's palette copied verbatim from `docs/play/index.html` `:root`; Track A is HOME orange, Track B is the AWAY blue, because the game already has two teams |


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

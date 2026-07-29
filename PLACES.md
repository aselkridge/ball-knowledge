# PLACES — where everything about Ball Knowledge lives

One page instead of a bookmark folder. If a service, login, or link matters to
this build, it belongs here. (Keep this updated when anything new joins the
stack.)

---

## 🏀 The game itself

| What | Where |
|---|---|
| **THE GAME (live)** | https://bk-ballknowledge.com/play/ |
| Front door / landing page | https://bk-ballknowledge.com (the "coming soon" page — front-door build pending) |
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

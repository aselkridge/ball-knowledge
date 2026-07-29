# Ball Knowledge — going native, and the money question

Two asks from a friend playtest (2026-07-29):
1. *"They would love for this to be an app, it's hard to play continuously on a browser."*
2. *"It would be cool to put money on the line when playing with friends."*

They look like two features. They are not. **The second one changes the answer to
the first one**, and it changes it into a different company. Read Part 1 first.

> **I am not a lawyer and this is not legal advice.** Part 2 is a map of the terrain
> so you know what you'd be walking into and what to ask counsel. Every serious
> source on skill gaming says the same thing: get a written opinion from gaming
> counsel before a single dollar moves. That is not me being cautious, that is the
> actual standard practice in the industry.

---

# PART 1 — THE APP

## First: what is your friend actually complaining about?

"Hard to play continuously on a browser" is a symptom list, not one problem. On a
phone browser, this is what's happening to them:

| What they feel | What's actually happening | Fixed by |
|---|---|---|
| "I lose my game" | mobile Safari/Chrome evicts backgrounded tabs; state dies | service worker + saved state |
| "I can't find it" | no home-screen icon, they have to remember a URL | web app manifest |
| "The screen is tiny" | browser chrome eats ~15% of vertical space | `display: standalone` |
| "My screen keeps sleeping" | no wake lock during a match | Screen Wake Lock API |
| "It reloads forever" | 40MB of art + 1.2MB of JS, re-fetched | service worker cache |
| "I don't know it's my turn" | no push notifications | web push (iOS 16.4+) or native |

**Five of those six are fixable in days without an app store.** That matters,
because it means you can answer your friend's complaint almost completely before
deciding anything about native apps.

## Where the codebase actually is today

```
docs/play/index.html    200K   all CSS + markup inline
docs/play/game.js       264K   the engine
docs/play/players.js    436K   744 players
docs/play/questions.js  328K   1,526 cards
docs/play/{coach,audio,rosters}.js
docs/                    40M   mostly art assets
server/index.js                WebSocket relay, rooms, 45s reconnect grace
```

**No `manifest.json`. No service worker.** The PWA path is not started — which is
good news, because it means the cheapest fix is entirely unclaimed.

## The three paths

### Path A — PWA (Progressive Web App) · days · ~$0

Add a `manifest.json`, a service worker, wake lock, and offline caching. The site
becomes installable to the home screen, launches without browser chrome, keeps its
state, and works on a plane.

**What you get:** home-screen icon, standalone display, offline play, no reload
tax, persistent state, push notifications (with caveats below).

**What you don't get:** App Store / Play Store presence. Discoverability. The
credibility of "it's in the App Store."

**iOS status as of 2026 — much better than its reputation:**
- iOS 26 defaults home-screen sites to open as web apps.
- Push notifications have worked since iOS 16.4 (March 2023), **but only if
  installed via Safari → Share → Add to Home Screen.** An open tab does not count.
- Safari 18.4 added Declarative Web Push and Screen Wake Lock.
- **Still flaky:** push listeners can fail after device restarts, users get
  silently unsubscribed, notification clicks sometimes open the wrong URL.
- **EU caveat:** under the Digital Markets Act, Apple removed standalone PWA
  support in the EU — PWAs there open in a Safari tab with no push.

**Verdict: do this regardless.** It is the highest fun-per-hour change available
and it costs nothing. Even if you go native later, the PWA work is the foundation.

### Path B — Capacitor wrapper · weeks · $99/yr + $25

Same vanilla-JS codebase, wrapped in a native shell, shipped to both stores.
Capacitor (or similar) gives you native push, real app icon, store listing, and
no browser quirks — without rewriting the game.

**What it costs you beyond money:**
- **Release cadence collides with your model.** Your whole design is "new question
  pack every release." App review adds days per release. *Mitigation:* keep
  `questions.js` / `players.js` server-fetched so content ships without a review.
- Store compliance work: privacy nutrition labels, age rating, data disclosure.
- Two build pipelines to maintain.

**Verdict: do this when you have a reason** — a real user base, a marketing
push, or money (see Part 2, where it becomes mandatory).

### Path C — native rewrite (Swift/Kotlin or React Native) · months

**Don't.** Your game is DOM/canvas and vanilla JS. A rewrite buys you nearly
nothing and costs you everything, including the thing that makes this project
work: you can ship a change in minutes.

---

## The things nobody thinks about until they bite

These apply to Path B, and several apply to Path A too.

**1. There are no accounts.** Online play is 4-letter room codes and a
`BK_ACCESS` env var. An app needs identity, or players lose their record on
reinstall. That's a backend, auth, password reset, and account-deletion flow
(legally required by both stores).

**2. The relay has to be always-on.** `server/index.js` holds rooms in memory
with a 45-second grace window. Free hosting tiers sleep. A sleeping relay is dead
multiplayer, and in-memory rooms mean a restart drops every live game.

**3. COPPA — this one is real and it applies even with no money.** A basketball
trivia game will attract under-13s. Collecting *any* personal information from a
child under 13 without verifiable parental consent is FTC exposure with real
fines. You need an age gate and a data policy before you have accounts, not after.

**4. Art and music licensing.** You're sourcing art from image generators. A
personal webpage and a distributed commercial app are different risk profiles.
Confirm commercial-use rights for every asset and every font before shipping to a
store. Same for music when you get there.

**5. Trademark and likeness — the most likely letter you'd actually get.**
- Player **names and facts** in trivia: generally fine. Facts aren't ownable.
- Team **names and logos**: not fine in a commercial app. NBA/WNBA marks are
  actively enforced.
- Player **likenesses** (photos, illustrated portraits): a right-of-publicity
  problem, licensed through the NBPA/WNBPA.
- **"Ball Knowledge"** as a name: needs a trademark search before you build a
  brand on it.
- Also outstanding: the **Black Fives Foundation** permission letter
  (`BLACKFIVES-OUTREACH.md`) — "Black Fives" is a registered trademark and that
  ask matters more, not less, once this is a store-listed app.

**6. The 40MB of art** needs a real asset pipeline (compression, lazy loading,
per-scene bundles) before it goes in an app binary.

## Recommended sequence for Part 1

1. **PWA now.** Manifest, service worker, wake lock, offline cache, saved state.
   Days. Solves your friend's complaint almost entirely.
2. **Fix the relay.** Always-on host, rooms that survive restart.
3. **Accounts + age gate.** The prerequisite for everything after.
4. **Asset pipeline.** Get the 40MB honest.
5. **Capacitor wrap** when there's a reason to be in a store.

---

# PART 2 — THE MONEY

## The short version

**Note first: the design bible already ruled on this.** `DESIGN.md` §11's
economy guardrail — *"stakes in credits, never real money"* — is a locked
decision. Everything below explains what changing that ruling would actually
cost; the pride-economy recommendation is that ruling, kept.

**The exact thing your friend described — two friends putting $10 on a match — is
the single hardest version of this to do legally.** Not the easiest. Peer-to-peer
cash wagering is precisely what state gambling statutes are written to catch.

And it is not a feature. **It is a different company.** You would not be "adding
betting to a trivia game," you would be becoming a regulated gaming operator that
happens to own a trivia game. Budget, timeline, and daily work all change.

## The test everything turns on

US law calls something gambling when **all three** are present:

```
CONSIDERATION  (you pay to play)
     +
    CHANCE     (outcome isn't purely skill)
     +
     PRIZE     (you can win something of value)
     =
   GAMBLING
```

Remove any one and it isn't gambling. Your friend's idea requires consideration
and prize. **So the entire legal argument rests on removing chance** — proving
Ball Knowledge is a game of skill.

There are three tests and states use different ones:

| Test | What it asks | Risk to you |
|---|---|---|
| **Predominance / Dominant Factor** | does skill outweigh chance? | trivia probably passes |
| **Material Element** (~8 states) | does chance play a *material* role? | **risky for you** |
| **Any Chance** | is there *any* chance at all? | **fatal for you** |

## Here is the specific problem in your game

**Ball Knowledge has real chance in it, by design:**
- questions are drawn randomly from the bank
- squad reveal deals players randomly from the pack
- contest tiers and defender assignment have randomness

Under the "any chance" test, that's fatal. Under material element, it's genuinely
risky — because **which questions you draw affects who wins**, and that is chance
determining the outcome of a wagered contest.

**But you have an accidental defense already built.** Your netcode shares
questions **by index, not by content** — both players see the same questions in
the same order. That is exactly the architecture a skill-game argument needs:
identical conditions, outcome determined by who answers better. If you ever
pursue this, that design decision becomes a legal asset, and every remaining
source of asymmetric randomness (the squad deal, defender assignment) would have
to be made symmetric or removed from wagered matches.

**That's the real finding here: your game design and your legal exposure are the
same conversation.** A "wagered match" mode would need to be a deterministic,
mirror-image contest.

## What a real-money build actually requires

1. **Gaming counsel, first, before anything.** A 50-state skill-game opinion.
   Expect five figures. Every source says this is non-negotiable.
2. **Geofencing by GPS, not IP.** Skillz — the biggest skill-wagering platform —
   excludes **Arizona, Arkansas, Connecticut, Delaware, Louisiana, Montana,
   South Carolina, South Dakota, and Tennessee**, and restricts card games in
   Maine and Indiana. Treat that list as your floor, not your ceiling.
3. **18+ with real identity verification.** Not a checkbox. Skillz requires 18+
   and device location enabled.
4. **Money transmission — the expensive one.** If you hold user funds *at all*,
   even in escrow for the length of a match, that's money transmitter licensing
   in nearly every state. Per-state application fees, surety bonds from tens of
   thousands to over a million, net-worth minimums. Nationwide programs routinely
   pass seven figures. **The only sane path is a licensed payments partner who
   holds the funds so you never do.**
5. **KYC / AML program.**
6. **Tax reporting.** 1099s for winnings over $600.
7. **Apple: real-money gaming apps must be native, and you must show
   authorization/licensure.** This is where Part 1 and Part 2 collide — **a PWA
   or HTML5 wrapper is not an option once money is involved.** Apple has required
   native for gambling since 2019 and is the stricter of the two stores.
8. **Responsible gaming:** self-exclusion, deposit limits, problem-gambling
   resources, and the operational staff to honor them.

## The door that just closed

The classic workaround was the **sweepstakes / dual-currency model** — free "gold
coins" plus redeemable "sweeps coins," with an alternative method of entry. Two
years ago that was the sensible middle path.

**It has been dismantled, fast:**
- NY AG sent C&Ds to 26 operators (June 2025); NY banned it outright with
  **S5935A, signed Dec 5, 2025, effective immediately, no wind-down.**
- California **AB 831** signed, banning dual-currency sweepstakes casinos
  effective **Jan 1, 2026** — and extending liability to *vendors and suppliers*.
- Tennessee AG: C&Ds to ~40 operators, Dec 29, 2025.
- Illinois Gaming Board: 65 C&Ds, May 2026.
- **17+ states** have now banned or restricted it; six operators shut down
  permanently since Oct 2025.

The reasoning states used — virtual coins redeemable for cash are "something of
value," so the whole thing is unlicensed gambling — would apply to any version
you built. **I can't recommend this route. It used to be the answer and it isn't.**

Note the California detail: liability now reaches **vendors**. Being the small
guy in the stack stopped being protection.

## The ranking, honestly

| Option | Legal risk | Cost | Gets you |
|---|---|---|---|
| **1. Pride economy** | none | days | ~80% of the feeling |
| **2. You track it, they settle it** | gray — needs counsel | ~1 week | ~90% |
| **3. Real money, licensed partner** | managed, expensive | $100k+, 12–18mo | 100% |
| **4. Sweepstakes** | **closing/closed** | — | **don't** |

### Option 1 — the pride economy (build this)

No money touches the app. Instead: season-long head-to-head records, streaks,
rivalry pages, a standings table for a friend group, trophies, a "debt board"
that's purely cosmetic, trash-talk cards after a win. **In a group of friends this
lands nearly as hard as cash**, because the actual pleasure your friend is
describing is *stakes and consequence*, not currency.

This is also the version that makes the game better for everyone else. Zero legal
surface. Ship it.

### Option 2 — the ledger (the honest middle)

The app records "Marcus owes Aaron $10" as a **number on a screen**. You never
hold, transfer, or process a cent. They settle on Venmo like adults.

**This is safer, not safe.** Facilitating wagering can still draw scrutiny even
without custody of funds, and app stores may reject it on sight. This is exactly
the question to put to gaming counsel — it is a real, askable, answerable
question, and the answer might well be yes with conditions.

### Option 3 — the real thing

A genuine business decision, not a feature decision. If Ball Knowledge gets big
enough that this is worth $100k+ and 12–18 months, that's a wonderful problem and
the path above is the path. **Do not start here.**

---

## What I'd actually do

**Now:** PWA. It answers the friend's real complaint this week.

**Next:** the pride economy — rivalries, streaks, standings, a debt board with no
dollars in it. Ship it to the same friend and see whether the stakes itch is
actually scratched. **My honest guess is that it is**, and that "money" was the
nearest available word for "make it matter."

**If it isn't:** take Option 2 to a gaming lawyer as a specific, narrow question
before building anything.

**Meanwhile, decoupled from all of this:** the trademark/likeness question in
Part 1 is more likely to produce a real letter in the next year than anything in
Part 2, because it applies the moment this is a public app — money or no money.

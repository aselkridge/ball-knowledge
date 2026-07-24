# Ball Knowledge — Interaction & Motion proposal
*"Intuitive, centered, alive — never just words on a screen." The standard is
Orbit: I'm the engineer + design expert, you're the artist who won't accept
lazy. This is my thoughtful list — pick what excites you and I build it. Most
of these are CSS/SVG/canvas motion (my wheelhouse, no art needed); a few want
sourced art and I flag those honestly.*

## Already done from this thread
- **Back = a floating arrow**, top-left, everywhere (shipped v0.25).
- **Glass backboards + colored ownership glow** instead of "SCORES HERE" text (v0.26).
- **The Clash**: diagonal staircase + a lightning bolt that strikes last and
  makes everything jump (v0.25).

---

## 1 · Theme picker — a rotating scroller (you asked for this)
Not circles in a row. A **horizontal "record crate" flick-scroller**: theme cards
you swipe through, the centered one enlarged + glowing + named in big Anton, the
neighbors peeking in at reduced scale/opacity (a coverflow). Snap-to-center,
momentum flick on mobile, arrow-key/scroll on desktop. Each card previews its
palette live (a mini court + swatch). *Pure CSS scroll-snap + a little JS.*
- **Bolder variant:** a **turntable/wheel** — themes on the rim of a dial you
  spin; the one at 12-o'clock is active. More "signature," slightly more work.

## 2 · Era select — a timeline (you asked for this)
Replace the era boxes with a **horizontal timeline**: a glowing track from the
'50s → today, each decade a **node/station** you tap; selected nodes light up and
connect with a bright segment (so "'70s + 2000s" literally draws a path across
the timeline). A little draggable **playhead** or multi-select nodes. "ALL ERAS"
= the whole track lit. Reads instantly as *time*, not a menu. *SVG track + nodes.*

## 3 · Squad reveal — NOT bingo papers. My pitches (pick one):
- **A · Card deal / poker flick** *(my favorite)* — five face-down cards fly in
  from a "deck" off-screen and **flip** one-by-one to reveal each player (name +
  number + position), with a snap and a shuffle-riffle sound. Re-deal =
  the cards **flip back, riffle, and re-flick**. Feels like getting dealt a hand.
- **B · Slot-machine roster** — each position is a reel that **spin-blurs and
  ka-chunks** to a stop on your player, top→bottom. Shuffle = pull the lever,
  all five reels spin again. Very arcade.
- **C · Locker reveal** — five lockers slam open in sequence, a jersey/nameplate
  drops down in each. Shuffle = lockers slam shut and re-open. (Jersey art would
  make this sing — flag: better with a sourced jersey asset.)
- **Randomize effect (all variants):** a quick **motion-blur + light sweep** across
  the five, a rising *whoosh→snap*, and the new five **slam** into place.

## 4 · Desktop hover — comic-book pop (you asked for this)
On hover (desktop only, `@media (hover:hover)`), menu items and cards **pop
forward and tilt** toward the cursor (3D `perspective` + `rotateX/Y` following
the mouse), cast a hard **comic drop-shadow**, and snap a thin **halftone/ink
outline** — like a panel lifting off the page. Buttons get a **"POW" chunk** on
press. Cursor-reactive parallax on the menu backdrop too. *Pure CSS/JS.*

## 5 · More ideas (as many as I can — you asked)
**Menus / flow**
- **Number tickers**: scores, the shot clock, "FIRST TO 11" count **roll** like a
  mechanical split-flap / odometer instead of snapping.
- **Screen transitions**: screens **slide + skew** as one wipe (a "camera pan"),
  not instant swaps — so the whole app feels like one continuous broadcast.
- **The loading beat** could show a **rotating "scouting report"** card stack.
- **Toggle switches** (music/sfx/etc.) as real **physical sliding switches** that
  throw with a click, not ON/OFF pills.
- **Confirm/Cancel** as a **thumbs-up / thumbs-down** or a green ✓ / red ✗ that
  *stamp* down.

**In-game**
- **Selected player**: a **spotlight cone** drops on them + a soft ring pulse,
  instead of just an outline.
- **Legal tiles**: **ripple outward** from the selected player (stagger) rather
  than all lighting at once; the drive-lane tiles **flow** toward the rim.
- **Made bucket**: **net physically ripples**, a **swish streak**, the scoreboard
  digit **flips**, a short **crowd roar** swell.
- **Shot arc**: the ball leaves a **trail** and the rim **flashes** on a make /
  **rattles** (shake) on a miss.
- **Heat / ON FIRE**: the ball and the hot player **catch flame** (the flame-ball
  art from ART_PROMPTS), the HUD edges glow.
- **Steal / crossover cards**: they **fly in from the defender's side**, tint
  the screen their color, with a *record-scratch* on a failed handle.
- **Coordinate call-outs**: when you pick a tile, the **A1 coordinate stamps**
  briefly over it (ties into the future voice mode).

**Identity**
- **Scoreboard**: a real **arena scoreboard** slab (split-flap digits, team
  bugs, the shot clock built in) replacing the plain HUD text.
- **Intro sting**: once the new logo exists, a 1.5s **broadcast bumper**
  (light-sweep + logo assemble) — *after* we like the logo (removed for now).

Everything above is CSS/SVG/canvas except where I flagged "sourced art." I'll
build any of these to the Clash's bar. **Tell me your top 2–3 and I start.**

---

## 6 · The in-game tutorial system (your spec, captured for when we build it)
Ships **with tutorial/play mode**. Design locked so it's ready:

- **First-run prompt:** the first time someone starts a game (a `bk_tutorial_seen`
  localStorage flag, per phone), a popup: *"First time? Want the coach to walk
  you through it?"* → **Yes / No, I got this.**
- **If Yes — teachable moments, once each:** the FIRST time each of these
  situations arises, **the clock/turn freezes** and a **coach window** slides in
  pointing at exactly what's happening, with a "Got it ▸" to resume. Each fires
  **once ever**, then never again (tracked by a set of seen-keys):
  - first **move** / first **pass** / first **shot** (the trivia card)
  - first **crossover** (red tile) → and the **ankle-battle** tap-off
  - first **steal option** ("go for the steal") and the **play-the-gap** lane steal
  - first **screen** set / first **contest** / first **block card**
  - first **alley-oop** and first **dunk** window
  - first **rebound** tap-battle
  - first **sudden-death** / **tip-off** buzzer race
  - first **out of bounds** / **backcourt** / **3-in-the-key** violation
  - first **shot-clock** warning
- **Mechanics:** a `TUTORIAL` module with `seen = Set()`, a `teach(key, target,
  text)` that — only in tutorial mode, only if `!seen.has(key)` — pauses state,
  dims the board, spotlights `target`, shows the coach window, and on dismiss
  adds the key and resumes. Zero cost when tutorial mode is off.
- **Coach voice:** short, hype, plain-English ("See the RED tiles? That's a
  crossover — beat him with a question or he strips you."). Ties into the
  coach-tutorial replacing the how-to wall of text.

I've scaffolded the seen-key tracking hooks so wiring these is fast once the
tutorial/play mode lands.

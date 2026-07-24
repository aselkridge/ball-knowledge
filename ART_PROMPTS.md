# BALL KNOWLEDGE — Art Sourcing Prompts
*(same system as the Aaronautics portfolio: you paste these into an image
generator — Firefly / Midjourney / DALL·E / whatever — and hand me the
results; I key, layer, and composite them in. One prompt block per asset.)*

---

## Read this first — the rules that make the art usable

1. **Backgrounds must come in LAYERS.** A generator hands back ONE flat
   image — so for any scene, run the layer prompts separately (sky layer,
   midground layer, foreground layer). That's what lets me add parallax and
   life. For single props, always add: **"isolated on a plain solid
   background"** so I can key it clean.
2. **No text in the image** unless the prompt asks for it — generators
   mangle letters. Logos come back as SHAPES; I redraw the final logo as
   crisp vector (SVG) using the generated art as the reference. That's the
   pipeline: *generator finds the idea, I make it sharp at every size.*
3. **No watermarks, no real NBA/WNBA logos or jerseys** in generated art
   (real leagues' marks are trademarked — our vibe, our marks).
4. **Sizes:** backgrounds 16:9 or wider (mobile crops the sides); props
   square; logos square.
5. Every prompt below ends with the same **STYLE BLOCK** — keep it in;
   it's what makes everything feel like one game.

**THE STYLE BLOCK (appended to every prompt):**
> bold painterly anime style, thick confident shapes, dramatic rim lighting,
> deep warm shadows, palette of burnt orange #f5872e, cream #efe6d8, and
> near-black coffee brown #171210 with one cool blue accent #58a8d6,
> NBA-street-culture attitude, clean silhouette, no photorealism, no text,
> no watermark

---

## 0 · The 3D question, answered (menu + game backgrounds)

**Short version: paint the world, don't model it.** The game's court is
already fake-3D (my projection math), and the art direction (broadcast ×
anime × NBA Street) reads best as **painted 2D art in 2–3 depth layers** —
layered parallax gives the 3D *feeling* on every phone at zero engine cost,
which is exactly the trick AAA menus use.

**Your uploaded 3D graphics still matter — two ways I can use them:**
- If they're **rendered images** (PNG/JPG of a 3D scene or object): I
  composite them straight in as background or prop layers. Renders of 3D
  models often look GREAT as menu art — depth comes free.
- If they're **actual 3D model files** (.glb / .obj / .fbx): I pre-render
  them from the game's exact camera angle into sprites — same pipeline as
  the figurines — so a 3D hoop, bench, scoreboard, or crowd piece can sit
  ON the court and match its perspective perfectly. (True live 3D in the
  browser is possible but costs performance and fights the current
  renderer — pre-rendered sprites give the same look for free.)

I need your Drive folder access approved to inventory which of the two you
uploaded — then I'll map every file to a slot in this document.

---

## 1 · LOGOS

Logos are the one place the generator is only the *concept artist* — I
take the winner and rebuild it as vector so it's razor sharp as a favicon,
a jersey patch, and a title-screen mark.

> **⚠ LOGOS USE THEIR OWN STYLE BLOCK — not the painterly world one.**
> The shared block ("painterly, dramatic rim lighting, deep shadows") is for
> scenes; a logo needs to stay flat and stamp clean at 16px. For every logo
> prompt below, replace `+ STYLE BLOCK` with:
>
> **THE LOGO STYLE BLOCK:**
> > *flat bold vector emblem, thick confident outlines, high contrast, minimal
> > flat shading (no soft rendering, no rim light), reads clearly as a one-color
> > stamp AND at tiny favicon size, sports-team-crest energy, palette of burnt
> > orange #f5872e / cream #efe6d8 / near-black coffee brown #171210 with one cool
> > blue accent #58a8d6, clean silhouette, no photorealism, no gradients-heavy
> > lighting, no text, no watermark*
>
> This matches the current build (bold Anton type, graphic arcade energy) far
> better than a soft painterly mark would.

### 1A · THE BOOK (primary candidate — "the book of ball knowledge")
```
emblem logo concept: an ancient open book viewed slightly from above, a
glowing basketball rising out of the pages like a sun, rays of light and
tiny floating diagrams of basketball plays (X's, O's, arrows) drifting up
from the paper like sparks, circular badge composition, thick outlines,
flat rich colors, sports-team-crest energy, centered, isolated on a plain
dark background + STYLE BLOCK
```
*Variant worth one run:* swap "rising like a sun" for **"the basketball as
a full moon over the book, court-line constellations in the sky."*

### 1B · BK MONOGRAM (refresh of the current mark)
```
sports monogram logo concept: the letters shape "B" and "K" interlocked
like two players boxing out, the counter (hole) of the B formed by a
basketball with seam lines, chunky varsity-athletic letterforms with a
slight forward slant like a player driving, circular badge frame, flat
colors, thick outlines, centered, isolated on a plain dark background
+ STYLE BLOCK
```

### 1C · THE KNOWLEDGE BALL ("matrix ball")
```
icon concept: a basketball where the seam lines morph into glowing
circuit-board traces and constellation lines, small nodes of light at the
intersections like synapses, the ball floating with a soft halo,
mysterious and smart but still unmistakably a basketball, centered,
isolated on a plain dark background + STYLE BLOCK
```

### 1D · How we pick
Generate 3–4 of each, drop them in Drive, and tell me your gut ranking.
I vectorize the winner (primary) and the runner-up (alternate/app icon).

---

## 2 · MENU BACKDROP (title + setup screens) — 3 layers

The menus currently run on pure CSS mood. This upgrade puts a painted
world behind them. **Run each layer as its own prompt:**

**Layer 1 — the sky/depth (back):**
```
background layer: the inside of a dark basketball arena at night seen from
center court, upper bowl dissolving into darkness, thousands of tiny
out-of-focus crowd lights like city bokeh, one big warm spotlight cone
cutting down through haze, empty of people in the foreground, wide 16:9,
painted, atmospheric + STYLE BLOCK
```

**Layer 2 — the midground (arena bowl):**
```
background layer: silhouetted basketball arena mid-tier — jumbotron glow,
banner shapes hanging in the rafters, railing lines — everything in
near-black silhouette with rim light only, designed to sit OVER a darker
background layer, wide 16:9, painted + STYLE BLOCK
```

**Layer 3 — the foreground (court edge prop):**
```
foreground prop: the corner of a glossy hardwood basketball court floor
seen at a low dramatic angle, strong reflections of orange and blue arena
lights on the wood, painted, bottom-third composition with the upper part
plain dark for keying, wide 16:9 + STYLE BLOCK
```

*What I do with them:* stack all three with slow parallax drift + my CSS
light rays and floating dust — the menu breathes. **Tier A ambient motion,
my wheelhouse.** (If you only get ONE flat image, I can still ship it with
subtle zoom-drift — layers are better.)

---

## 3 · GAME ARENA BACKDROP (behind the live court) — 2 layers

The playing court stays MINE (canvas — it has to move, light up tiles,
rotate). What changes is the black void around it.

**Layer 1 — arena darkness:**
```
background layer: view from a basketball court out into a dark arena,
courtside seats in silhouette, faint crowd bokeh lights, a horizon line of
LED ad-board glow in warm orange, mostly very dark so game pieces pop,
wide 21:9, painted + STYLE BLOCK
```

**Layer 2 — atmosphere (optional but dope):**
```
overlay layer: soft volumetric spotlight haze and floating dust motes on a
pure black background, two light cones angled inward, subtle, designed to
overlay-blend on top of a dark arena image, wide 21:9 + STYLE BLOCK
```

*Keying tip that worked before: keep whatever must disappear PURE dark so
I can flood-fill from the borders without punching out highlights.*

---

## 4 · COURT SKIN (the floor itself)
```
texture: glossy maple basketball court floorboards seen straight from
above, warm honey tones with subtle plank variation and wear marks near
the center, painted (not photoreal), evenly lit, no court lines, no
markings, seamless-friendly, square + STYLE BLOCK
```
*I overlay my own lines, zones, and tile grid — the paint just replaces my
flat CSS-colored planks.*

---

## 5 · HERO BALL (title screen + loading)
```
prop: a single basketball with attitude — dramatic rim light, worn leather
texture with painted brushstrokes, faint glowing seam lines, slight motion
smear on one edge like it just finished spinning, isolated on a plain
solid dark background, square + STYLE BLOCK
```
*Variant:* **flame ball** — "wrapped in stylized anime blue-orange flames,
embers rising" (this becomes the ON FIRE indicator later).

### 5B · The loading spin (answers the "ball spinning on a finger" note)
A flat image can't truly spin on its vertical axis — for the real thing:
```
sprite sheet: a basketball rotating around its vertical axis, 8 evenly
spaced rotation frames in a row on one wide image, identical size and
lighting each frame, isolated on a plain solid dark background + STYLE BLOCK
```
*8 frames → I cycle them → a genuinely rotating painted ball, side view,
exactly like watching someone's finger-spin from beside them.*

---

## 6 · TRIVIA CARD BACK
```
trading card back design: ornate symmetrical frame like a vintage
basketball trading card crossed with a tarot card, center medallion of an
open book with a basketball, corner flourishes made of tiny court diagrams
and laurel leaves, rich flat colors, portrait 3:4, full-bleed + STYLE BLOCK
```
*This is what flips over when a question drops — right now it's CSS
gradient. This is a huge cheap win for the "collectible card" feeling.*

---

## 7 · Priority order (my recommendation)
1. **Menu backdrop layers** (§2) — biggest visible upgrade per minute
2. **Card back** (§6) — every single possession shows it
3. **Logo concepts** (§1) — identity locks everything else
4. **Game arena layers** (§3) + **court skin** (§4)
5. **Hero/flame ball + spin sheet** (§5)

Drop everything in the same Drive folder, tell me which prompt each file
came from, and I'll composite, key, and ship them same-day.

---

# LOGO CONCEPTS v2 — the "smart hooper" mark
*(Aaron's seeds + my additions, all generate-ready. The generator finds the
concept; I rebuild the winner as crisp vector. Each still gets the STYLE BLOCK.)*

**My read:** the through-line for every one of these is **intelligence × basketball**.
The strongest primary candidates are the **book-court** and the **head-silhouette-
with-a-ball-for-a-brain** — both instantly say "ball knowledge" and read at
favicon size. The **grad-cap-with-basketball-tassel** is perfect but should be the
**achievement / rank-up mark** (a reward, like you said), not the primary. Generate
3–4 of your top 2–3 and I'll vectorize the winner + an alt.

### A · The Book Court (leading candidate — your pick)
```
emblem logo: an open hardback book seen at a 3/4 angle, and the two open pages
together form a miniature basketball half-court — painted court lines, key, and
three-point arc drawn on the paper like a playbook diagram; a small glowing
basketball resting in the center circle; circular team-crest frame, thick
outlines, flat rich colors, centered, isolated on a plain dark background + STYLE BLOCK
```

### B · Head Silhouette, Ball for a Brain (leading candidate — my favorite for an icon)
```
emblem logo: a clean side-profile silhouette of a human head, and where the brain
would be there is a basketball with visible seam lines glowing softly through the
silhouette; minimal, iconic, high-contrast, works as a one-color stamp; circular
badge frame optional, centered, isolated on a plain dark background + STYLE BLOCK
```

### C · The Brain-Ball
```
icon logo: a basketball whose seam lines morph into the folds of a brain — the
curved grooves of a cerebrum drawn in the same ink as basketball seams, so it
reads as BOTH a basketball and a brain at once; single object, thick outlines,
warm leather tones with a subtle glow, centered, isolated on a plain dark background + STYLE BLOCK
```

### D · The Thinker, Spinning (your Socrates/"thinker" idea)
```
emblem logo: a classical marble "Thinker" statue bust in profile, but instead of
resting its chin on its fist it is balancing a spinning basketball on one
fingertip; carved-stone texture meets street-culture energy, motion lines around
the ball; circular medallion frame, centered, isolated on a plain dark background + STYLE BLOCK
```

### E · Library Card (your idea — great as a secondary/UI motif)
```
logo/badge: a vintage library checkout card, aged cream paper with ruled lines and
a due-date stamp grid, the header reading in bold stamped type; a basketball ink-
stamp mark in one corner; slightly askew, nostalgic, flat colors — designed as a
card-shaped badge, not a circular crest + STYLE BLOCK
```
*(This one's better as a collectible-card back or an "IQ card" UI element than the
primary mark — I'd use it inside the game, per the medium-honesty layering.)*

### F · IQ Meter Ball (your "IQ symbol + basketball" idea)
```
icon logo: a basketball with a small analog gauge/meter arc across its face, the
needle pinned to the top of the dial, tiny "IQ" mark — reads as a smart-meter
maxed out; OR alternatively an upward bar-graph made of basketballs of increasing
size; clean, iconic, thick outlines, centered, isolated on a plain dark background + STYLE BLOCK
```

### G · The Reward Mark — Grad Cap + Basketball Tassel (your idea — keep as achievement/rank)
```
emblem: a black graduation mortarboard cap seen at a 3/4 angle, and hanging from
the tassel cord is a tiny basketball instead of the usual tassel knot; gold cord,
celebratory, works as a small badge; centered, isolated on a plain dark background + STYLE BLOCK
```
*(NOT the primary logo — this is the "you leveled up / earned your degree in ball
knowledge" reward stamp. Save it for rank-ups and the collection.)*

### H · Extra swings from me (pick any to try)
- **Owl palming a rock:** a wise owl perched, one talon palming a basketball like a
  point guard — wisdom + handle.
- **Chalkboard play → ball:** a coach's X-and-O play diagram whose arrows curl
  around into the seams of a basketball.
- **Lightbulb bucket:** a glowing lightbulb where the glass bulb is a basketball —
  "the idea is the shot." (Pairs with the lightning-bolt Clash energy.)
- **Whistle + book:** a ref/coach whistle and an open book crossed like a crest.

**Recommendation:** generate **A (Book Court)** and **B (Head/Brain-Ball)** first —
those are your two strongest primary marks. **C (Brain-Ball)** is the best pure app
icon. **G (Grad Cap)** = reward stamp. Tell me your favorites and I'll vectorize.

---

## THE CLASH LIGHTNING BOLT (source this — my CSS one isn't good enough)
Aaron's sourcing this. It sits on the diagonal seam of The Clash, **behind** the
VS medallion, dividing the orange squad (upper-left) from the blue (lower-right).
Needs to run **top-right → bottom-left**, tapered and electric.

**Deliverable:** a **vertical PNG on a fully transparent background**, tall
(portrait, ~3:5), the bolt reaching from near the top-right to the bottom-left,
glowing, with a hot white core. No background, no scene — just the bolt.

```
a single dramatic lightning bolt isolated on a fully transparent background,
running diagonally from the top-right to the bottom-left of the frame, jagged
and tapering, blazing hot white core with an intense electric glow, the glow
shifting from burnt orange #f5872e at the top to cool electric blue #58a8d6 at
the bottom, thick and powerful at the center where it strikes and thinner at the
tips, energy sparks and small forks branching off, comic-book / sports-broadcast
energy, high contrast, no background, no text, no watermark, PNG with alpha
```
*Variants worth a run:* (a) **pure white-gold** bolt (I tint it per theme in
code); (b) a bolt with a **bright circular impact burst** baked at its center.
**Prefer variant (a) — a clean white/gold bolt on transparent — so it recolors
with every theme.** Drop it in Drive (or the repo `docs/play/assets/clash-bolt.png`)
and I'll swap it for the CSS bolt, keep it behind the VS, and wire the
strike/glow animation to the real art.

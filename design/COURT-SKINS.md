# Ball Knowledge — Court Skins (unlockable environments)

Courts are **unlockable skins**, same collectible spirit as player cards
(Common → Uncommon → Rare → Epic → Legendary → Mystic). Everyone starts on the
default **Hardwood Classic**; the rest unlock via credits, "Court Packs," or
milestone achievements, and ship over time as **versioned court-skin releases**.

## Anatomy of a court skin (data-driven)
Each skin is a record the render reads — so adding a skin later is data, not new
engine code:
```
{ id, name, rarity, unlock,           // economy
  bg:[ farLayer, midLayer, foreLayer ],// sourced painterly depth layers (parallax)
  surface:{ texture | canvasStyle, lineColor, glow }, // the playing floor
  palette:{ floor, line, home, away, accent },
  atmosphere:[ particles, godrays, caustics, ... ] }  // motion I build in canvas
```
- **Backgrounds = sourced art** (painterly/realistic scenes → image generator,
  ideally as 3 depth layers for parallax). This is the medium-honesty line: the
  rich scene is sourced; I build the interactive court shell, surface, lighting,
  and motion on top.
- **Surface** = a seamless tileable texture where realism matters (wood, asphalt,
  sand), or pure canvas where it's graphic (neon grid, cosmic glass).
- Selected court is stored per profile (localStorage now) and drives the render.
  A **Courts tab** lives inside "Packs & My Squad."

---

## THE MENU — approve / deny (⭐ = recommended launch 5)

### A · Grounded / real
1. ⭐ **Hardwood Classic** — pro arena, broadcast spotlights *(DEFAULT, free)*
2. **Indoor Gym** — high-school/Y, golden window sunbeams
3. **NBA-style Stadium** — packed bowl, jumbotron, banners
4. ⭐ **Sunset Blacktop** — streetball, chain net, graffiti, city glow
5. **Rooftop City Court** — NYC rooftop, skyline, water towers
6. **Venice Beach Boardwalk** — sand-side court, palms, ocean
7. **Driveway Hoop** — suburban garage, chalk, single bent rim
8. **Prison Yard** — chain-link, concrete, watchtower
9. **Retro Parquet ('70s/ABA)** — tie-dye, wood parquet, film grain

### B · Epic / fantastical
10. ⭐ **Cosmic Court** — floating platform, nebula, starfield *(on-brand: Aaronautics)*
11. **Sky Court** — above the clouds, godrays, marble + columns
12. **Lunar Court** — moon dust, Earthrise overhead, low-gravity
13. **Post-Apocalyptic Wasteland** — ruins, rusted rim, dust storms
14. ⭐ **Neon Grid / Synthwave** — Tron arcade, glowing grid, retro sun
15. **Cyberpunk Megacity** — Blade Runner rain, holograms, signage
16. **Volcano / Obsidian** — magma cracks, ember rain, heat haze
17. **Frozen Lake / Aurora** — ice court, northern lights, snow drift
18. **Roman Coliseum** — torches, marble, crowd of thousands
19. **Haunted Graveyard** — fog, jack-o'-lanterns, moonlight (Halloween drop)

### C · "Wrong place" (lol)
20. ⭐ **Underwater** — ocean floor, caustics, reef, bubbles, fish
21. **Jungle** — overgrown temple ruins, vines, mist, parrots
22. **Football Field (gridiron)** — 50-yard-line, goalposts, stadium
23. **Soccer Pitch** — center circle, nets, roaring stands
24. **Baseball Diamond** — pitcher's mound, outfield wall, dust
25. **Tennis Court** — clay/grass, umpire chair, net
26. **Ice Hockey Rink** — boards, blue lines, zamboni tracks
27. **Bowling Alley** — polished lane, pins, arcade neon
28. **The Library** — quiet stacks, reading lamps *(ties to "Ball KNOWLEDGE" — cute)*
29. **Rooftop Helipad** — the "H", city lights, wind sock
30. **Toy / Tabletop** — giant desk objects, playing on a mousepad

*(Add-anytime pool is open — new skins are just new records + a sourced scene.)*

---

## Launch 5 (the interesting mix I recommend)
Chosen to span the whole range so the first release feels diverse:
| # | Skin | Why it's in the starter set |
|---|------|------|
| 1 | **Hardwood Classic** | the grounded default everyone gets — broadcast polish |
| 2 | **Sunset Blacktop** | the NBA-Street soul of the game, warm + gritty |
| 3 | **Cosmic Court** | epic + painterly, and it's literally *Aaronautics* |
| 4 | **Neon Grid** | a graphic/stylized look, huge impact, cheap to build well |
| 5 | **Underwater** | one whimsical "wrong place" to show the fun range |

Spread = clean · gritty · epic-painterly · graphic-neon · whimsical.

---

## Art prompts for the launch 5

**Each court needs TWO separate images.** They are different jobs and must be
generated separately — this is the part that was hard to read before:

| | What | Looks like | Style block? |
|---|---|---|---|
| **ⓐ** | **SCENE** — the world behind/around the court | a painterly illustration, ideally 3 depth layers | **YES — append it** |
| **ⓑ** | **SURFACE** — the floor the game is played on | a flat seamless tile, lit evenly, no scenery | **NO — never** |

**Rules for every SCENE prompt:** no text, no readable logos/brands, no players
or ball (the court + pieces render on top); keep the **lower-center open/simple**
so the court reads; deliver a **tall 9:16** hero plus a **16:9** desktop crop;
depth layers on **transparent background** so they can be parallaxed.

**Rules for every SURFACE prompt:** it must **tile seamlessly**, be shot
**straight top-down**, and be lit **flat and evenly** — no shadows, no glow, no
scenery, no perspective. The lines, reflections and lighting get added in code.

---

### ⚠ SHARED STYLE BLOCK
Paste this onto the **end of every ⓐ SCENE prompt**. Do **not** put it on a ⓑ
surface tile — it would light the floor texture and break the tiling.

```text
...in a stylized painterly game-illustration style - bold clean shapes, warm cinematic lighting with strong rim-light and glow, a semi-realistic anime x NBA-Street mood, slightly graphic and saturated, NOT photorealistic. Atmosphere and depth over fine detail. Cohesive art direction so it reads as one game and sits under a stylized low-poly foreground.
```

*Why: the build is stylized, not photoreal — low-poly arcade pieces, flat bold
court, Anton type, comic-book energy. Photoreal backdrops would make the pieces
look like cheap toys sitting on a photograph. (This replaces the earlier
"photoreal" wording on Hardwood — everything is stylized illustration now.)*

---

## 1 · Hardwood Classic
*Common · the free default*

#### ⓐ SCENE  → *append the STYLE BLOCK*
```text
Interior of a professional basketball arena from courtside, warm stadium spotlights pooling down, dark upper bowl with a blurred cheering crowd, championship banners hanging in shadow, gentle atmospheric haze and lens bloom, cinematic broadcast lighting, warm amber-and-deep-brown palette, stylized painterly illustration. Horizon/crowd in the upper two-thirds; lower third simple.
```
**Ask for 3 layers:** far = crowd + upper bowl · mid = hanging banners + hoop
stanchion · fore = soft courtside blur

#### ⓑ SURFACE — seamless tile  → *NO style block*
```text
Seamless top-down polished maple hardwood basketball floor, honey tone, subtle plank seams and grain, faint reflective sheen, even neutral light.
```

> *Claude builds on top:* the grid, painted lines, crowd shimmer + bloom pulse,
> drifting spotlight god-rays, floor reflection, parallax on camera rotate.

---

## 2 · Sunset Blacktop
*Uncommon*

#### ⓐ SCENE  → *append the STYLE BLOCK*
```text
An outdoor streetball court at golden hour in a gritty city; chain-link fence, weathered brick walls with faded graffiti, one bent rim with a chain net, a warm orange sunset sky, long shadows, distant skyline silhouette, dust motes in sunbeams; NBA-Street mood, painterly-anime warmth, saturated oranges with teal shadows.
```
**Ask for 3 layers:** far = sunset sky + skyline · mid = fence + graffiti wall +
rim · fore = foreground fence links + weeds

#### ⓑ SURFACE — seamless tile  → *NO style block*
```text
Seamless top-down weathered asphalt/blacktop, dark charcoal with a faded painted key, cracks, patches, faint chalk dust, even light.
```

> *Claude builds on top:* dust in sunbeams, slow long-shadow drift, chain-net
> sway, parallax skyline, occasional leaf/ember drift.

---

## 3 · Cosmic Court
*Legendary · the Aaronautics flagship*

#### ⓐ SCENE  → *append the STYLE BLOCK*
```text
A basketball court on a translucent platform floating in deep space; a vast nebula in magenta, cyan and gold, dense starfields, a distant ringed planet and a faint galaxy spiral, cosmic dust and light rays; awe and silence, sci-fi painterly, deep indigo-violet with warm accent glows.
```
**Ask for 3 layers:** far = starfield · mid = nebula + ringed planet · fore =
drifting asteroids / glowing debris (transparent)

#### ⓑ SURFACE — **mostly built in code**
Only source this if you want to try it; otherwise skip — Claude builds the floor.
```text
Dark translucent glass court with a faint glowing energy grid, starlight reflections, deep blue-black with cyan/orange emissive lines.
```
*Optional extra:* a subtle seamless starfield-reflection overlay.

> *Claude builds on top:* parallax starfield, slow nebula drift, twinkling stars,
> floating asteroids, energy-grid pulse, low-gravity floaty bob on the pieces.

---

## 4 · Neon Grid
*Rare*

#### ⓐ SCENE  → *append the STYLE BLOCK*
```text
A retro-futuristic synthwave arena: an infinite dark reflective grid receding to a neon horizon, a giant setting sun sliced by horizontal scanlines, a magenta-to-cyan gradient sky, glowing wireframe mountains, sweeping laser beams; 80s Tron arcade aesthetic, high-contrast neon on near-black, chrome glints.
```
**Ask for 2 layers:** far = gradient sky + banded sun · mid = wireframe mountains
+ beams *(the grid floor is built in-engine)*

#### ⓑ SURFACE — **no art needed, skip it**
Pure CSS/canvas, built in code from this spec:
```text
near-black reflective floor with glowing magenta + cyan grid lines, subtle chrome reflection.
```

> *Claude builds on top:* grid scrolling toward the viewer, scanline sweep, neon
> flicker/pulse, sun shimmer, periodic beam sweeps.

---

## 5 · Underwater
*Epic · the "wrong place" showcase*

#### ⓐ SCENE  → *append the STYLE BLOCK*
```text
A basketball court impossibly on the ocean floor; sunlight caustics rippling down through deep blue-green water, a coral reef and swaying kelp, schools of tropical fish, rising bubble streams, a sunken shipwreck silhouette in the hazy distance; dreamy, surreal, painterly, teal-and-aqua with warm caustic light.
```
**Ask for 3 layers:** far = deep-water haze + godray shafts · mid = reef +
shipwreck · fore = kelp + fish + bubbles (transparent)

#### ⓑ SURFACE — seamless tile  → *NO style block*
```text
Seamless top-down sandy ocean-floor with a faintly painted key, pale rippled sand, scattered pebbles and shells.
```

> *Claude builds on top:* animated caustic light rippling over the floor, rising
> bubbles, swaying kelp, drifting fish, godray shafts, gentle floaty bob.

---

### Delivery checklist
| Court | ⓐ scene layers | ⓑ surface tile |
|---|---|---|
| Hardwood Classic | 3 | yes |
| Sunset Blacktop | 3 | yes |
| Cosmic Court | 3 | optional |
| Neon Grid | 2 | no — built in code |
| Underwater | 3 | yes |

Drop everything into `docs/play/assets/courts/<court-id>/` as
`far.png` / `mid.png` / `fore.png` / `surface.png`.

---

## Roadmap
1. Approve the launch 5 (swap any from the menu above).
2. Aaron sources the 5 scenes (depth layers) + any tileable surfaces from the
   prompts; I build the **court-skin system** (registry + selector + render hooks)
   with Hardwood as default and one more wired as the proof.
3. Composite each scene, build its atmosphere/motion, tune the surface + palette so
   the pieces and lines always stay readable on top.
4. Wire the **Courts tab** + unlock economy (shared with player packs).
5. Ship as versioned court-skin drops; keep expanding the menu forever.


---

# FINAL CALLS (2026-07-26 — Aaron's official verdicts, supersedes everything above in this pack)

Seen at full-court view, both viewports, all six scenes. Official:
**REDO scenes:** hardwood + neon (both aspects each).
**KEEP scenes:** blacktop, cosmic, underwater — current landscapes stay as the
desktop image; each needs only its 9:16 phone portrait added.
**FLOORS: DONE (2026-07-26).** Aaron generated 12 candidates (4 models x 3
floors, all square, all marking-free — the no-basketball rule works). Picked
in-engine and committed to `docs/play/assets/courts/`: blacktop = Gemini,
cosmic = Gemini, underwater = GPT. All 12 candidates banked in
`design/art-bank/floors-round2/`. The kept scene landscapes (blacktop /
cosmic / underwater bg) are committed alongside them. Remaining ask is the
**7 scene images** below (items 1a-5; floor prompts 6-8 are kept for
reference only).
**New taste rule:** courts and hoops IN the scene art are a feature — Aaron
likes them ("it's cool"). The no-basketball-vocabulary rule now applies to
FLOORS ONLY, where painted lines fight the engine's tiles.

## The two rules round 1 taught us
1. **Scenes: the money goes in the TOP HALF.** On a phone the court + scrim
   cover everything below ~45%.
2. **Floors: NEVER say "basketball" (or key/court/hoop).** The word summons
   painted lines every time, and our engine draws its own. Floors must be
   quiet, flat-lit, seamless. (Scenes are now EXEMPT — see the taste rule.)

## THE SIZE STANDARD (hard rule, applies to every scene forever)
Every scene ships as **TWO generations**:
- **9:16 portrait, >=1080x1920** — the phone hero. Money in the TOP HALF.
- **16:9 landscape, >=1920x1080** — desktop/tablet. Money in the upper two-thirds.
Floors are always **square, >=1024**. Don't chase 4K — everything is downscaled
for web weight anyway. The engine picks the right image by screen shape
(skinSet {bg, bgWide}), so both get used, nothing is a wasted crop.
The aspect is ALSO written into each prompt below, because requirements that
live outside the paste-block don't exist.

## THE SCENE PROMPT SYSTEM (v2 — 2026-07-26, after Aaron's continuity call)

Aaron: prompts must have CONTINUITY — no more "hoop" in one scene and "whole
court" in another. Codified:

**THE SUBJECT RULE (hard rule, every scene forever):**
- Every **16:9 wide** shows **a FULL BASKETBALL COURT** — "a full basketball
  court with a hoop at each end stretching across the middle distance."
  Desktop shows the venue as a place.
- Every **9:16 portrait** shows **ONE BASKETBALL HOOP** — "a basketball hoop
  ... towering high in the frame." Phone shows the hero object.
- The structural wording is IDENTICAL in every prompt; only the venue's
  materials change (glass rim / chain net / neon glow / floating platform /
  seaweed).

**THE TEMPLATE** (fixed skeleton, five fill-in slots, nothing else changes):

> [ASPECT] [VENUE]: [SUBJECT per the rule], [VENUE DETAILS], [PALETTE],
> stylized painterly game-art, bold shapes, NOT photoreal. All detail in the
> [TOP HALF / UPPER TWO THIRDS]; [bottom half / lower third] [SIMPLE GROUND],
> no players, no text.

New scenes later = fill the five slots, both prompts fall out. No meta-prompt
needed; this template IS the machine.

## THE ASK — 10 scene images, ALL scenes redone for continuity
(Floors are DONE and untouched. Hardwood's landed art came from ~the same
prompt as 1a below — harmonized wording, same vision, results should hold.)

### 1a · HARDWOOD — 9:16
```text
Tall vertical 9:16 interior of a packed basketball arena at night, seen from the floor: a basketball hoop with a glass backboard and orange rim towering high in the frame against the spotlights, glowing upper bowl crowd, hanging championship banners, giant light beams, scoreboard glow, warm amber palette, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the TOP HALF; bottom half simple dark floor, no players, no text.
```

### 1b · HARDWOOD — 16:9
```text
Wide 16:9 interior of a packed basketball arena at night, seen from the floor: a full basketball court with a glass hoop at each end stretching across the middle distance, glowing upper bowl crowd, hanging championship banners, giant light beams, scoreboard glow, warm amber palette, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the UPPER TWO THIRDS; lower third simple dark floor, no players, no text.
```

### 2a · BLACKTOP — 9:16
```text
Tall vertical 9:16 city streetball scene at golden hour: a basketball hoop with a weathered backboard and chain net towering high in the frame, chain-link fence, faded graffiti brick wall, warm orange sunset sky, distant city skyline silhouette, saturated oranges with teal shadows, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the TOP HALF; bottom half simple dark asphalt, no players, no text.
```

### 2b · BLACKTOP — 16:9
```text
Wide 16:9 city streetball scene at golden hour: a full basketball court with a chain-net hoop at each end stretching across the middle distance, chain-link fence, faded graffiti brick wall, warm orange sunset sky, distant city skyline silhouette, saturated oranges with teal shadows, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the UPPER TWO THIRDS; lower third simple dark asphalt, no players, no text.
```

### 3a · NEON — 9:16
```text
Tall vertical 9:16 retro-synthwave night scene: a basketball hoop outlined in glowing neon with a magenta rim and cyan net towering high in the frame, a huge chrome-pink striped sun behind it, laser-grid horizon, glowing wireframe mountains, palm silhouettes edged in neon, magenta-and-cyan on near-black, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the TOP HALF; bottom half a near-black gradient, no players, no text.
```

### 3b · NEON — 16:9
```text
Wide 16:9 retro-synthwave night scene: a full basketball court outlined in glowing neon light with a neon hoop at each end stretching across the middle distance, a huge chrome-pink striped sun behind it, laser-grid horizon, glowing wireframe mountains, palm silhouettes edged in neon, magenta-and-cyan on near-black, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the UPPER TWO THIRDS; lower third a near-black gradient, no players, no text.
```

### 4a · COSMIC — 9:16
```text
Tall vertical 9:16 deep space scene: a basketball hoop on a translucent floating platform towering high in the frame, a vast nebula in magenta, cyan and gold, a ringed planet, dense starfield, one galaxy spiral, glowing cosmic debris, deep indigo-violet with warm accent glows, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the TOP HALF; bottom half near-empty dark space, no players, no text.
```

### 4b · COSMIC — 16:9
```text
Wide 16:9 deep space scene: a full basketball court on a translucent platform floating in space with a hoop at each end stretching across the middle distance, a vast nebula in magenta, cyan and gold, a ringed planet, dense starfield, one galaxy spiral, glowing cosmic debris, deep indigo-violet with warm accent glows, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the UPPER TWO THIRDS; lower third near-empty dark space, no players, no text.
```

### 5a · UNDERWATER — 9:16
```text
Tall vertical 9:16 dreamy underwater scene: a sunken basketball hoop wrapped in seaweed towering high in the frame, sunlight caustics rippling through deep teal water, coral reef and swaying kelp at the edges, schools of tropical fish, rising bubble streams, a shipwreck silhouette in the haze, teal-and-aqua with warm caustic light, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the TOP HALF; bottom half open sandy seabed, no players, no text.
```

### 5b · UNDERWATER — 16:9
```text
Wide 16:9 dreamy underwater scene: a full sunken basketball court resting on the ocean floor with a hoop at each end stretching across the middle distance, sunlight caustics rippling through deep teal water, coral reef and swaying kelp at the edges, schools of tropical fish, rising bubble streams, a shipwreck silhouette in the haze, teal-and-aqua with warm caustic light, stylized painterly game-art, bold shapes, NOT photoreal. All detail in the UPPER TWO THIRDS; lower third open sandy seabed, no players, no text.
```

## Floor prompts (DONE — kept for reference only)

### 6 · BLACKTOP floor (redo)
```text
Seamless tileable texture, camera pointing straight down: weathered dark charcoal asphalt, fine grain, hairline cracks, faint sun-fade patches, thin tar repair lines, perfectly flat even lighting, no shadows, no painted markings, no objects, square image.
```

### 7 · COSMIC floor (redo)
```text
Seamless tileable texture, camera pointing straight down: dark indigo glass surface with tiny embedded star-like specks and a very subtle smoky nebula tint, gentle even sheen, perfectly flat lighting, low contrast, no lines, no grid, no drawings, no objects, square image.
```

### 8 · UNDERWATER floor (redo)
```text
Seamless tileable texture, camera pointing straight down: golden-tan rippled ocean sand with soft wavy caustic light patterns, a few tiny shells, medium tone (not pale, not white), flat even lighting, no shadows, no drawings, no markings, no objects, square image.
```

### 9 · NEON floor — no art needed
Engine job: the game draws the magenta/cyan glow AS the tile grid, so the grid
IS the board. Round 1 proved a pre-printed grid fights the projected tile grid.

## Delivery
Drop in the same Drive folder. Floors MUST be square. If a floor comes back
with any painted line on it, reroll — do not try to use it.


# ROUND 3 — LANDED. KEEP THEM ALL (2026-07-26, Aaron: "I am going crazy! We are keeping them all!")

43 images delivered, every slot in both aspects, prompt system v2 held (money
placement right, full courts in wides, hero hoops in portraits). TWO looks per
scene survive as A/B VARIANTS — 10 unlockable courts + the default. Committed
to docs/play/assets/courts/ as <scene>-<a|b>-bg.jpg (9:16) + -bgwide.jpg (16:9):

| Court | A (bg/bgWide artist) | B | Floor |
|---|---|---|---|
| Hardwood A/B | Gemini pair | GPT pair | hardwood-floor.jpg (now committed) |
| Blacktop A/B | Gemini pair | GPT pair | blacktop-floor.jpg |
| Neon A/B | GPT pair | Flux pair | ENGINE grid (no art) |
| Cosmic A/B | GPT pair | Gemini bg + Firefly-c bgWide (mixed — flag if it clashes) | cosmic-floor.jpg |
| Underwater A/B | Gemini pair | GPT pair | underwater-floor.jpg |

Kills: ng-m-gemini + ng-m-geminib (baked TEXT on the boards — no-text rule).
Resolution note: batch is 768x1376 / 1376x768 — under the standard's 1080p ask
but clean at cover-fit; re-gen individual images only if softness shows.
NEXT: the court picker build surfaces these (shared room setting + local
accessibility override), then the unlock economy.

# THE ENTRANCE TUNNELS (2026-08-31 — the intro cinematic's sourced art)

Aaron: *"for the entrance I need prompts... one prompt for each entry art,
so one for blacktop, one for hardwood, etc."* The cinematic (walkthrough
doc, row 103) opens inside a tunnel and the camera pushes straight into
the bright mouth, then crossfades to the overhead court. One tunnel per
court family; the mouth glimpses that family's court so the crossfade
lands.

**The rules, same law as every scene:**
- TWO generations per venue (the size standard above): 9:16 portrait
  >=1080x1920 and 16:9 landscape >=1920x1080. Same paste, only the lead
  words change.
- **Run the tool's 2x upscale on the PORTRAIT before delivery.** The
  camera pushes INTO this image; the Places arithmetic (PLACES-ART-BRIEF)
  floors a push-in source at 2400px tall, and 1920 misses it. 2x lands
  3840.
- The bright mouth DEAD CENTER, edges dark and simple: everything near
  the frame border flies off screen during the push.
- No people (the players and ref are the game's own layered figures),
  no text, no signage, no logos.
- Compact style block baked in; every paste measured under Firefly's
  1024 (counts below, from tools run 08-31).
- Save as `tunnel-<family>-p.jpg` (portrait) and `tunnel-<family>-w.jpg`.

**CLASSIC gets no photograph, deliberately.** The family's whole identity
is CLEAN, the one court with no photo behind it (the picker says so). Its
entrance stays a code-drawn tunnel in house colours, the demo's own
technique. Flagged for Aaron; generating one later is a single sitting if
he overrules.

**Delivery**: copy-button page at the artifact link in PLACES.md; this
section is the home.

## Hardwood · 9:16 portrait · 808 of 1024 chars

```text
Vertical 9:16 phone scene: Inside a dark pro-arena players' tunnel at eye level, looking straight down the corridor at its bright mouth dead center, where warm floodlight pours in and a glimpse of polished honey hardwood and towering stands shows beyond; smooth dark concrete walls, heavy ceiling beams and cable trays framing the opening, thin light haze in the doorway glow; completely empty, no people, no text, no signage, no logos; deep navy-teal shadows inside, hot amber-white light ahead; the glowing mouth dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

## Hardwood · 16:9 landscape · 798 of 1024 chars

```text
Wide 16:9 scene: Inside a dark pro-arena players' tunnel at eye level, looking straight down the corridor at its bright mouth dead center, where warm floodlight pours in and a glimpse of polished honey hardwood and towering stands shows beyond; smooth dark concrete walls, heavy ceiling beams and cable trays framing the opening, thin light haze in the doorway glow; completely empty, no people, no text, no signage, no logos; deep navy-teal shadows inside, hot amber-white light ahead; the glowing mouth dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```
**Hardwood b-look swap (Championship Night (b))**: replace "warm floodlight pours in" with "cold white championship spotlights blaze in".

## Blacktop · 9:16 portrait · 782 of 1024 chars

```text
Vertical 9:16 phone scene: Inside a shaded concrete underpass walkway leading to a city playground court, eye level, looking straight at the bright open chain-link gate dead center, where sunlit blacktop with faded paint and a glimpse of a chain-net hoop show beyond; chain-link panels and bare concrete framing the sides, hot daylight haze past the gate; completely empty, no people, no text, no signage, no logos; cool blue-grey shadow inside, hot golden daylight ahead; the bright gate dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

## Blacktop · 16:9 landscape · 772 of 1024 chars

```text
Wide 16:9 scene: Inside a shaded concrete underpass walkway leading to a city playground court, eye level, looking straight at the bright open chain-link gate dead center, where sunlit blacktop with faded paint and a glimpse of a chain-net hoop show beyond; chain-link panels and bare concrete framing the sides, hot daylight haze past the gate; completely empty, no people, no text, no signage, no logos; cool blue-grey shadow inside, hot golden daylight ahead; the bright gate dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```
**Blacktop b-look swap (Golden Hour (b))**: replace "hot daylight haze past the gate" with "low orange sunset light flooding past the gate".

## Neon · 9:16 portrait · 779 of 1024 chars

```text
Vertical 9:16 phone scene: Inside a dark synthwave tunnel of concentric glowing neon hoops at eye level, looking straight at its bright mouth dead center, where a glowing magenta-and-cyan grid court under a starry violet sky shows beyond; ring after ring of thin neon light framing the corridor, a faintly reflective black floor; completely empty, no people, no text, no signage, no logos; deep violet-black shadows, electric magenta, cyan and ultraviolet glow ahead; the glowing mouth dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

## Neon · 16:9 landscape · 769 of 1024 chars

```text
Wide 16:9 scene: Inside a dark synthwave tunnel of concentric glowing neon hoops at eye level, looking straight at its bright mouth dead center, where a glowing magenta-and-cyan grid court under a starry violet sky shows beyond; ring after ring of thin neon light framing the corridor, a faintly reflective black floor; completely empty, no people, no text, no signage, no logos; deep violet-black shadows, electric magenta, cyan and ultraviolet glow ahead; the glowing mouth dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```
**Neon b-look swap (Sunset Circuit (b))**: replace "starry violet sky" with "burning synthwave sunset sky".

## Cosmic · 9:16 portrait · 782 of 1024 chars

```text
Vertical 9:16 phone scene: Inside a dark space-station boarding corridor at eye level, looking straight at its bright round mouth dead center, where a basketball court floating on a glowing platform amid nebula clouds and stars shows beyond; ribbed metal walls and soft blue panel lights framing the corridor, faint drifting stardust in the beam; completely empty, no people, no text, no signage, no logos; deep indigo shadows, aurora teal and magenta nebula glow ahead; the glowing mouth dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

## Cosmic · 16:9 landscape · 772 of 1024 chars

```text
Wide 16:9 scene: Inside a dark space-station boarding corridor at eye level, looking straight at its bright round mouth dead center, where a basketball court floating on a glowing platform amid nebula clouds and stars shows beyond; ribbed metal walls and soft blue panel lights framing the corridor, faint drifting stardust in the beam; completely empty, no people, no text, no signage, no logos; deep indigo shadows, aurora teal and magenta nebula glow ahead; the glowing mouth dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```
**Cosmic b-look swap (Nebula Run (b))**: replace "aurora teal and magenta nebula glow" with "deep crimson and gold nebula glow".

## Underwater · 9:16 portrait · 809 of 1024 chars

```text
Vertical 9:16 phone scene: Inside a dark sunken stone-and-glass tunnel on the seafloor at eye level, looking straight at its bright mouth dead center, where a sunlit sunken basketball court between coral and swaying kelp shows beyond, light rays shafting down through blue water; rough stone arches and algae-softened glass framing the corridor, drifting bubbles and tiny fish silhouettes; completely empty, no people, no text, no signage, no logos; deep teal-navy shadows, bright aqua glow ahead; the glowing mouth dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

## Underwater · 16:9 landscape · 799 of 1024 chars

```text
Wide 16:9 scene: Inside a dark sunken stone-and-glass tunnel on the seafloor at eye level, looking straight at its bright mouth dead center, where a sunlit sunken basketball court between coral and swaying kelp shows beyond, light rays shafting down through blue water; rough stone arches and algae-softened glass framing the corridor, drifting bubbles and tiny fish silhouettes; completely empty, no people, no text, no signage, no logos; deep teal-navy shadows, bright aqua glow ahead; the glowing mouth dead center, edges dark and simple, nothing important near the frame border. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```
**Underwater b-look swap (Sunken Run (b))**: replace "sunlit sunken basketball court" with "moonlit sunken basketball court in darker water".

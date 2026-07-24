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
Paste each into the image generator. Ask for **3 separate depth layers** where
noted (far / mid / fore) on **transparent background** so I can parallax them.
Rules for every prompt: **no text, no readable logos/brands, no players or ball**
(the court + pieces render on top), keep the **lower-center open/simple** so the
court reads, deliver a **tall 9:16** hero plus a **16:9** desktop crop.

### ⚠ SHARED STYLE BLOCK — append to EVERY prompt (keeps courts cohesive + on-vibe)
The build is **stylized, not photoreal** — low-poly arcade pieces, flat bold court,
Anton type, comic-book energy. Photoreal backdrops would make the pieces look like
cheap toys sitting on a photograph. So every court uses one unified look:

> *"…in a **stylized painterly game-illustration** style — bold clean shapes, warm
> cinematic lighting with strong rim-light and glow, a semi-realistic **anime × NBA-
> Street** mood, slightly graphic and saturated, **NOT photorealistic**. Atmosphere
> and depth over fine detail. Cohesive art direction so it reads as one game and sits
> under a stylized low-poly foreground."*

(This replaces the earlier "photoreal" wording on Hardwood — everything is stylized
illustration now, tuned to the current build.)

### 1 · Hardwood Classic  *(Common · default)*
**Scene:** "Interior of a professional basketball arena from courtside, warm
stadium spotlights pooling down, dark upper bowl with a blurred cheering crowd,
championship banners hanging in shadow, gentle atmospheric haze and lens bloom,
cinematic broadcast lighting, warm amber-and-deep-brown palette, stylized painterly
illustration. Horizon/crowd in the upper two-thirds; lower third simple."
*Layers:* far = crowd + upper bowl; mid = hanging banners + hoop stanchion; fore =
soft courtside blur.
**Surface (tileable):** "Seamless top-down polished maple hardwood basketball
floor, honey tone, subtle plank seams and grain, faint reflective sheen, even
neutral light." (I add the grid + painted lines + reflections in canvas.)
**Motion I build:** crowd shimmer + bloom pulse, drifting spotlight god-rays, floor
reflection, subtle parallax on camera rotate.

### 2 · Sunset Blacktop  *(Uncommon)*
**Scene:** "An outdoor streetball court at golden hour in a gritty city; chain-link
fence, weathered brick walls with faded graffiti, one bent rim with a chain net, a
warm orange sunset sky, long shadows, distant skyline silhouette, dust motes in
sunbeams; NBA-Street mood, painterly-anime warmth, saturated oranges with teal
shadows."
*Layers:* far = sunset sky + skyline; mid = fence + graffiti wall + rim; fore =
foreground fence links + weeds.
**Surface (tileable):** "Seamless top-down weathered asphalt/blacktop, dark charcoal
with a faded painted key, cracks, patches, faint chalk dust, even light."
**Motion I build:** dust in sunbeams, slow long-shadow drift, chain-net sway,
parallax skyline, occasional leaf/ember drift.

### 3 · Cosmic Court  *(Legendary · the Aaronautics flagship)*
**Scene:** "A basketball court on a translucent platform floating in deep space; a
vast nebula in magenta, cyan and gold, dense starfields, a distant ringed planet
and a faint galaxy spiral, cosmic dust and light rays; awe and silence, sci-fi
painterly, deep indigo-violet with warm accent glows."
*Layers:* far = starfield; mid = nebula + ringed planet; fore = drifting
asteroids / glowing debris (transparent).
**Surface:** mostly canvas — "dark translucent glass court with a faint glowing
energy grid, starlight reflections, deep blue-black with cyan/orange emissive
lines." (Optional sourced: a subtle seamless starfield-reflection overlay.)
**Motion I build:** parallax starfield, slow nebula drift, twinkling stars, floating
asteroids, energy-grid pulse, low-gravity floaty bob on the pieces.

### 4 · Neon Grid  *(Rare)*
**Scene:** "A retro-futuristic synthwave arena: an infinite dark reflective grid
receding to a neon horizon, a giant setting sun sliced by horizontal scanlines, a
magenta-to-cyan gradient sky, glowing wireframe mountains, sweeping laser beams;
80s Tron arcade aesthetic, high-contrast neon on near-black, chrome glints."
*Layers:* far = gradient sky + banded sun; mid = wireframe mountains + beams; the
grid floor is built in-engine.
**Surface:** canvas — "near-black reflective floor with glowing magenta + cyan grid
lines, subtle chrome reflection." (Pure CSS/canvas, no art needed.)
**Motion I build:** grid scrolling toward the viewer, scanline sweep, neon
flicker/pulse, sun shimmer, periodic beam sweeps.

### 5 · Underwater  *(Epic · the "wrong place" showcase)*
**Scene:** "A basketball court impossibly on the ocean floor; sunlight caustics
rippling down through deep blue-green water, a coral reef and swaying kelp, schools
of tropical fish, rising bubble streams, a sunken shipwreck silhouette in the hazy
distance; dreamy, surreal, painterly, teal-and-aqua with warm caustic light."
*Layers:* far = deep-water haze + godray shafts; mid = reef + shipwreck; fore =
kelp + fish + bubbles (transparent).
**Surface (tileable):** "Seamless top-down sandy ocean-floor with a faintly painted
key, pale rippled sand, scattered pebbles and shells."
**Motion I build:** animated caustic light rippling over the floor, rising bubbles,
swaying kelp, drifting fish, godray shafts, gentle floaty bob on the pieces.

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

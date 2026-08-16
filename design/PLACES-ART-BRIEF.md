# THE PLACES · the art brief

**Written 2026-08-09 for Aaron to take to the image tool.**

> *"Okay I want to do this, but one of the things I want is the walk and then
> turn feature but we will get there, lets do this, lets get me some prompts so
> I can go get some art and come back."*

Everything here is settled by the three spikes, so nothing in it is a guess:
the crop is measured, the layers are ruled in, and the style block is the one
this project already locked for the court skins.

**Working version, built for a phone in one hand and a tool in the other:**
<https://claude.ai/code/artifact/1a35a96f-5a7a-46b4-8966-e8197e64e746>
Copy buttons on every prompt, the style block docked to the bottom of the
screen, and six ticks that survive a reload. Generated FROM this file by
`python3 tools/artbrief-artifact.py`, so it cannot disagree with it.

---

## READ THIS FIRST · what to generate, and what to leave alone

**Generate the four GYM facings, the FILM ROOM, and their near layers. Stop
there.**

That is 5 base images and 5 cutouts, ten generations. Everything else in THE
PLACES is held on purpose, and the reason is not caution, it is that **the Gym
proves the pipeline.** If the near-layer cutouts key out cleanly and the
facings actually match, the rest is a repeat. If they do not, we find out after
ten images instead of after twenty four.

*(Updated 2026-08-10. This brief originally said three facings and six images.
Aaron: "I need the prompts for the film room added... the player can turn 180
to get to it." The film room is the gym's fourth wall, so it joins THIS
sitting: this file's own rule is that facings generated weeks apart never
match.)*

| tier | what | when |
|---|---|---|
| **1 · DO NOW** | The Gym, four facings, eight images | **B14 is in V0.** The one blocking piece of art in the whole project |
| **1B · SAME SITTING** | The film room, two images | The room BUILD is after the twenty; it wears a COMING SOON mark until then, same as the gym room. Only the art rides now |
| **2 · after the Gym proves out** | Your room · the town | post-launch, but the prompts are below so a second sitting is not a fresh start |
| **3 · HOLD** | The time machine · the era rooms | Nothing is decided about them and generating now would waste the generations |

**Why the Gym is worth four facings when B14 only needs one.** The version
shipping to the twenty is flat: the gym photo sits behind a top-down court map
with seven markers on it. That needs ONE image. But the room you actually
described has the hoop straight ahead, a weight area to the right, a desk to
the left, and now the film room behind you, **the full circle of the
walk-and-turn feature.** The same facing-1 image serves both, so shooting all
four now costs one sitting instead of two and guarantees they match. Facings
generated weeks apart never match.

---

## THE SPEC · and the arithmetic behind every number

### Size, and why height is the number that matters

The phone frame is 9:14. The image fills it by HEIGHT, so what you see is a tall
slice out of the middle, and the rest of the width is the turn range.

```
  visible width  = image height x 0.643
  turn range     = image width / visible width          (in screen-widths)
  push-in at 2x  = visible width / 2  source pixels across the phone
```

A modern phone is 390 CSS px at 3x, which is **1170 real pixels**. So:

```
  height x 0.643 / 2  >=  1170     ->   height >= 3,640 px
```

**Target: 5400 x 3600 or larger, 3:2 landscape.**
That gives 2,315 px visible, a crisp 2x push-in, and **2.33 screen-widths of
turn range**. 3:2 beats 16:9 here: 16:9 gives more turn range but a narrower
visible slice, and the slice is what people actually look at.

**Almost no tool generates that natively, and that is fine.** Generate at the
largest native size your tool offers, then run its upscaler to 3600+ tall.
Upscaling is normally a compromise; here it is not, because the style block asks
for *"atmosphere and depth over fine detail"*. There is no fine detail to lose.

**Absolute floor: 2400 px tall.** Below that a push-in visibly softens, which is
what happened in spike v1 on a 768px source.

### Layers · the thing that cannot be added later

Every room is **a base plus a near cutout.** RULED by Aaron on 08-09 after
running spike v2: *"I def need the near layer."*

The near layer is whatever is closest to the camera. When you walk forward it
scales at **1.9x** the rate of everything behind it, and that difference is the
entire reason a push-in reads as a step instead of a zoom. Asked for at
generation time it is one extra prompt. Asked for after the rooms are finished
it is every room again.

**Generate the near layer as its OWN image**, not as a crop of the base:

- Transparent background if your tool supports it. Save as **PNG**.
- If it does not, ask for a **flat solid magenta `#FF00FF`** background and I
  will key it out. Magenta because nothing in this palette is near it.
- The object must be **whole and untouched by the frame edges**, so it can be
  positioned and scaled freely.
- No shadow on the background. The contact shadow gets added in code.

### The rules that apply to every base image

- **No people. The gym is empty.** A figure in a still image never moves and
  becomes furniture in about four seconds.
- **No text, no readable signage, no logos, no brands, no jersey numbers.**
- **Eye level, standing.** Not a drone shot, not a low hero angle. You are a
  person in a room.
- **Keep the lower third simple.** The seven drill markers and the court map sit
  there and must stay readable.
- **Nothing important in the outer thirds of the width.** Only the middle 43% is
  on screen before you turn.

---

## THE STYLE BLOCK · paste on the end of every BASE prompt

This is not new. It is the block already locked in `design/COURT-SKINS.md` and
used for all 27 court images in the repo, and reusing it verbatim is the only
thing that will make the rooms look like they came out of the same building as
the game.

```text
...in a stylized painterly game-illustration style - bold clean shapes, warm cinematic lighting with strong rim-light and glow, a semi-realistic anime x NBA-Street mood, slightly graphic and saturated, NOT photorealistic. Atmosphere and depth over fine detail. Cohesive art direction so it reads as one game and sits under a stylized low-poly foreground.
```

**Put it on the BASE prompts. Never on a near-layer cutout**, because it lights the
object for a scene it is not in, and the cutout has to stay neutral so it can be
lit by whatever is behind it.

---
---

# TIER 1 · THE GYM

**Do all eight in ONE sitting**, and if your tool has a style-reference or
image-to-image option, feed it facing 1 when generating facings 2, 3 and 4.
That is the difference between four views of one gym and four different gyms.

## GYM · FACING 1 · straight ahead, the hoop

*This is the one B14 actually needs. Everything else is future-proofing.*

```text
Interior of an empty high-school practice gymnasium, seen at eye level from someone standing at one end of the floor, looking straight down the court toward a single basketball hoop mounted on the far wall. Warm polished wood floor with faded painted lines, cinderblock and painted brick walls, tall clerestory windows high on the left throwing long warm bars of late-afternoon light across the floor, wooden bleachers folded flat against the right wall, a battered scoreboard dark and switched off, dust motes hanging in the light shafts. Completely empty, no people, no text, no signage, no logos. Warm amber and honey tones with deep teal shadows. Composition: the hoop and far wall in the upper middle, the floor open and uncluttered across the whole lower third.
```
**+ STYLE BLOCK** · 3:2 landscape · upscale to 3600+ tall
**Save as** `gym-1-base.jpg`

## GYM · FACING 1 · near layer

```text
A wheeled steel basketball ball rack half-full of worn orange basketballs, beside a low wooden bench with a folded towel over one end, seen from close and slightly above, the whole object isolated and complete with generous empty space around it, no background, no shadow, no floor, painterly game-illustration object, warm worn materials.
```
**NO style block** · transparent PNG, or flat `#FF00FF`
**Save as** `gym-1-near.png`

## GYM · FACING 2 · turn right, the weight area

```text
The same empty high-school practice gymnasium as the previous image, same warm late-afternoon light and the same wood floor and cinderblock walls, now seen at eye level turned ninety degrees to the right: an open weight and conditioning area along the side wall, a squat rack and a bench press, a rack of dumbbells, rolled blue floor mats stacked in a corner, a climbing rope hanging from the high ceiling, a scuffed mirror panel on the wall catching the window light. Completely empty, no people, no text, no signage, no logos. Same warm amber and teal palette. Composition: equipment in the middle band, floor open and uncluttered across the lower third.
```
**+ STYLE BLOCK** · 3:2 · same session as facing 1
**Save as** `gym-2-base.jpg`

## GYM · FACING 2 · near layer

```text
A stack of three rolled blue vinyl gym mats and a single worn medicine ball resting against them, seen from close and slightly above, the whole object isolated and complete with generous empty space around it, no background, no shadow, no floor, painterly game-illustration object.
```
**NO style block** · transparent PNG or `#FF00FF`
**Save as** `gym-2-near.png`

## GYM · FACING 3 · turn left, the coach's desk

*This is where the Rulebook lives. Aaron, 08-09: "the rulebook should def be its
own station at the gym."*

```text
The same empty high-school practice gymnasium as the previous images, same warm late-afternoon light and the same wood floor and cinderblock walls, now seen at eye level turned ninety degrees to the left: a coach's corner along the side wall, a battered wooden desk with a swivel chair, a clipboard and a thick worn three-ring binder lying open on it, a chalkboard on the wall covered in faint unreadable play diagrams of circles and arrows, a grey filing cabinet with a trophy on top, a jacket over the back of the chair. Completely empty, no people, no readable text, no signage, no logos. Same warm amber and teal palette. Composition: the desk and board in the middle band, floor open across the lower third.
```
**+ STYLE BLOCK** · 3:2 · same session
**Save as** `gym-3-base.jpg`

## GYM · FACING 3 · near layer

```text
A tall stack of stacked plastic gym chairs beside a rolled-up tactics whiteboard on a wheeled stand, seen from close and slightly above, the whole object isolated and complete with generous empty space around it, no background, no shadow, no floor, painterly game-illustration object.
```
**NO style block** · transparent PNG or `#FF00FF`
**Save as** `gym-3-near.png`

## GYM · FACING 4 · turn around, the film room door

*Added 2026-08-10, Aaron: "the player can turn 180 to get to it." This is the
wall at your back when you face the hoop: the way INTO the film room, and the
one facing where a cool light is allowed to enter the gym's warm palette.*

```text
The same empty high-school practice gymnasium as the previous images, same warm late-afternoon light and the same wood floor and cinderblock walls, now seen at eye level turned fully around, facing the end wall behind where you started: a pair of heavy double doors propped open in the middle of the wall, opening into a small dark film room where the pale blue-white glow of a projection screen is just visible in the darkness, the cool glow spilling a soft rectangle of light across the gym floor toward the viewer, a glass trophy case against the wall on one side of the doors and a folded table-tennis table leaning on the other, an exit sign shape above the doors left completely blank. Completely empty, no people, no text, no readable signage, no logos. Same warm amber and teal palette, with that one cool spill from the doorway. Composition: the doorway and its glow in the upper middle, floor open and uncluttered across the whole lower third.
```
**+ STYLE BLOCK** · 3:2 · same session, feed facing 1 as style reference
**Save as** `gym-4-base.jpg`

## GYM · FACING 4 · near layer

```text
A wheeled AV cart with an old CRT television strapped to the top shelf and a VCR and a coil of cable on the shelf below, seen from close and slightly above, the whole object isolated and complete with generous empty space around it, no background, no shadow, no floor, painterly game-illustration object, warm worn materials.
```
**NO style block** · transparent PNG or `#FF00FF`
**Save as** `gym-4-near.png`

---
---

# TIER 1B · THE FILM ROOM · through the doorway

**Same sitting, different light.** This is the room behind facing 4's doors,
where you land when you walk through. It is dark and lit by its own screen, so
it does not share the gym's matching problem: the only thing that has to agree
with the gym is the doorway you came through.

**What the film room DOES in the game is not decided yet, and the art does not
need to know.** It is a dark room with a glowing screen and chairs facing it,
and that stays true in every version of that decision. In the game it wears
the menus' one-word **COMING SOON** device until the feature is built, exactly
like the gym room before B14 lands: the door is on the wall from day one, the
room opens when it is ready.

## FILM ROOM · the room

```text
The inside of a small basketball film room seen at eye level from just inside the doorway: a pull-down projection screen on the far wall glowing pale blue-white with a soft blank rectangle of light, an old projector on a wheeled cart in the middle of the room throwing a visible cone of light through faint dust, a few rows of worn metal folding chairs facing the screen, a long side table stacked with videotapes and a clipboard, a whiteboard on the side wall with faint unreadable play diagrams of circles and arrows, dark cinderblock walls swallowing the corners, a thin bar of warm gym light falling in through the door edge behind the viewer. The room is lit only by the screen and the projector beam. Completely empty, no people, no readable text, no signage, no logos. Deep teal and navy shadows around a pale cool glow, one warm accent from the doorway. Composition: the screen centered in the upper middle band, chair backs and floor open across the lower third.
```
**+ STYLE BLOCK** · 3:2 landscape · upscale to 3600+ tall
**Save as** `film-1-base.jpg`

## FILM ROOM · near layer

```text
A worn metal folding chair with a clipboard resting on the seat and a stack of three videotapes on the floor beside one leg, seen from close and slightly above, the whole object isolated and complete with generous empty space around it, no background, no shadow, no floor, painterly game-illustration object.
```
**NO style block** · transparent PNG or `#FF00FF`
**Save as** `film-1-near.png`

---
---

# TIER 2 · only after the Gym proves out

Written down now so a second sitting starts warm, **not so it happens today.**

## YOUR ROOM · career, THE JACKET

```text
A teenager's bedroom at night, seen at eye level from just inside the doorway, looking across the room at the far wall: an unmade single bed under a window with city light coming through the blinds, a shelf of small basketball trophies and a folded jersey, an old TV on a low unit with a games console and two controllers, posters on the wall with no readable text, a desk lamp throwing a warm pool of light, sneakers on the floor. Nobody in the room. No text, no readable posters, no logos. Warm lamp-amber against cool blue window light. Composition: the wall and its objects in the middle band, floor open across the lower third.
```
**+ STYLE BLOCK** · 3:2 landscape · upscale to 3600+ tall
**Save as** `room-1-base.jpg`

## YOUR ROOM · near layer

```text
A rumpled duvet corner and a pair of worn basketball sneakers on a bedroom floor, seen from close and slightly above, the whole object isolated and complete with generous empty space around it, no background, no shadow, no floor, painterly game-illustration object.
```
**NO style block** · transparent PNG or `#FF00FF`
**Save as** `room-1-near.png`

## THE TOWN · career, top-down

**Different rules from every other image here.** This one is a map, not a room,
so it is genuinely top-down and it does NOT get the eye-level treatment.

```text
A small town seen from directly overhead at a slight angle, illustrated like a hand-painted game map: a basketball gym with a curved roof, a row of houses with one clearly the player's, a corner store, a park with an outdoor blacktop court, a diner, a strange windowless building with a domed roof set slightly apart from everything else, connected by streets with a few parked cars and trees. Warm late-afternoon light with long shadows falling one way. Nobody on the streets. No text, no signage, no logos. Warm amber and teal palette, clean readable shapes so each building is instantly distinguishable from the others.
```
**+ STYLE BLOCK** · square or 4:3 · at least 3000 px on the short edge
**Save as** `town-base.jpg` · no near layer, because a top-down map has no near field

The domed windowless building is the time machine. It is in the picture so it is
already there when we decide what it does, and it costs nothing to include now.

---
---

# WHAT TO DO WITH THEM WHEN YOU HAVE THEM

1. Drop everything into `docs/play/assets/places/` with the filenames above.
   Original resolution, do not resize or compress. I handle that.
2. Tell me which tool made them and whether the licence allows commercial use.
   Same rule as facts: **prefer the licence you can quote.**
3. Then I: key out the magenta if needed, cut the derivative sizes, convert to
   webp, wire facing 1 behind the Gym for B14, and rebuild the spike with real
   art so the pivot can finally be judged on two views of ONE place instead of
   two different courts.

**One thing I will check first and you should know it is coming:** whether the
four facings actually look like the same room. They probably will not, first
try. That is normal, it is why we are doing ten images instead of twenty four,
and the fix is usually one more generation with the first image fed back in as a
style reference rather than a rewrite of the prompt. The film room interior is
exempt from the matching check on purpose: it is a dark room lit by its own
screen, and the only join that has to hold is the doorway in facing 4.

---

## THE FIREFLY 1024 VARIANTS (added 2026-08-16)
Aaron, mid-generation: Firefly caps a prompt at **1024 characters**, so the
base prompts above + the style block do not fit. Every base prompt now has a
COMPRESSED variant with a COMPACT STYLE BLOCK baked in, each one MEASURED
under the limit at write time (counts below). The other three models keep
the full prompts above. Near layers were already under the limit.
Delivered with copy buttons + per-model settings on the Places artifact
(<https://claude.ai/code/artifact/1a35a96f-5a7a-46b4-8966-e8197e64e746>);
recorded here because an artifact is a delivery, not a home.
**The compact style block** (216 chars, baked into each variant below):

```text
Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

### GYM FACING 1 · Firefly paste · 812 of 1024 chars

```text
Empty high-school practice gym at eye level, standing at one end of the floor, looking straight down the court to a single hoop on the far wall. Warm polished wood floor with faded painted lines, cinderblock walls, tall windows high on the left throwing long bars of late-afternoon light, wooden bleachers folded flat on the right, a dark switched-off scoreboard, dust motes in the light shafts. Completely empty, no people, no text, no signage, no logos. Warm amber and honey tones with deep teal shadows. Hoop and far wall upper middle; floor open and uncluttered across the whole lower third. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

### GYM FACING 2 · Firefly paste · 730 of 1024 chars

```text
The same empty high-school gym, same warm late-afternoon light, wood floor and cinderblock walls, now turned ninety degrees right: a weight and conditioning area along the side wall, squat rack and bench press, dumbbell rack, rolled blue floor mats stacked in a corner, a climbing rope from the high ceiling, a scuffed mirror panel catching window light. Completely empty, no people, no text, no signage, no logos. Same warm amber and teal palette. Equipment in the middle band; floor open across the lower third. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

### GYM FACING 3 · Firefly paste · 786 of 1024 chars

```text
The same empty high-school gym, same warm light, wood floor and cinderblock walls, now turned ninety degrees left: a coach's corner along the side wall, a battered wooden desk with a swivel chair, a clipboard and a thick worn binder open on it, a chalkboard covered in faint unreadable play diagrams of circles and arrows, a grey filing cabinet with a trophy on top, a jacket over the chair back. Completely empty, no people, no readable text, no signage, no logos. Same warm amber and teal palette. Desk and board in the middle band; floor open across the lower third. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

### GYM FACING 4 · Firefly paste · 902 of 1024 chars

```text
The same empty high-school gym, same warm light, wood floor and cinderblock walls, now turned fully around to the end wall behind you: heavy double doors propped open mid-wall onto a small dark film room where the pale blue-white glow of a projection screen is just visible, the cool glow spilling a soft rectangle of light across the gym floor toward the viewer, a glass trophy case on one side of the doors, a folded table-tennis table leaning on the other, a blank exit-sign shape above. Completely empty, no people, no text, no readable signage, no logos. Warm amber and teal palette with that one cool spill. Doorway and glow upper middle; floor open across the whole lower third. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

### FILM ROOM · Firefly paste · 979 of 1024 chars

```text
A small basketball film room at eye level from just inside the doorway: a pull-down projection screen on the far wall glowing pale blue-white, an old projector on a wheeled cart throwing a visible cone of light through faint dust, rows of worn metal folding chairs facing the screen, a side table stacked with videotapes and a clipboard, a whiteboard with faint unreadable play diagrams, dark cinderblock walls swallowing the corners, a thin bar of warm gym light through the door edge behind the viewer. Lit only by the screen and projector beam. Completely empty, no people, no readable text, no logos. Deep teal and navy shadows around a pale cool glow, one warm doorway accent. Screen centered upper middle; chair backs and floor open across the lower third. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

### YOUR ROOM (Tier 2) · Firefly paste · 764 of 1024 chars

```text
A teenager's bedroom at night, eye level from just inside the doorway, looking at the far wall: an unmade single bed under a window with city light through the blinds, a shelf of small basketball trophies and a folded jersey, an old TV on a low unit with a games console and two controllers, posters with no readable text, a desk lamp throwing a warm pool of light, sneakers on the floor. Nobody in the room, no text, no logos. Warm lamp-amber against cool blue window light. Wall and objects in the middle band; floor open across the lower third. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

### THE TOWN (Tier 2) · Firefly paste · 770 of 1024 chars

```text
A small town from directly overhead at a slight angle, painted like a hand-made game map: a basketball gym with a curved roof, a row of houses with one clearly the player's, a corner store, a park with an outdoor blacktop court, a diner, a strange windowless domed building set slightly apart, streets connecting them with a few parked cars and trees. Warm late-afternoon light, long shadows one way. Nobody on the streets, no text, no signage, no logos. Warm amber and teal palette, clean readable shapes so every building is instantly distinguishable. Stylized painterly game illustration: bold clean shapes, warm cinematic light with strong rim-light and glow, semi-realistic anime x NBA-Street mood, graphic and saturated, not photorealistic, atmosphere over detail.
```

**Firefly settings for all of these:** Image 5 · 4:3 at 2K, crop to 3:2 after
(the town: 1:1 at 2K, no crop) · feed facing 1's winner into the single
reference slot when generating facings 2-4.

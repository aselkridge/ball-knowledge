# THE PLACES · the art brief

**Written 2026-08-09 for Aaron to take to the image tool.**

> *"Okay I want to do this, but one of the things I want is the walk and then
> turn feature but we will get there, lets do this, lets get me some prompts so
> I can go get some art and come back."*

Everything here is settled by the three spikes, so nothing in it is a guess:
the crop is measured, the layers are ruled in, and the style block is the one
this project already locked for the court skins.

---

## READ THIS FIRST · what to generate, and what to leave alone

**Generate the three GYM facings and their near layers. Stop there.**

That is 3 base images and 3 cutouts, six generations. Everything else in THE
PLACES is held on purpose, and the reason is not caution, it is that **the Gym
proves the pipeline.** If the near-layer cutouts key out cleanly and the three
facings actually match, the rest is a repeat. If they do not, we find out after
six images instead of after twenty four.

| tier | what | when |
|---|---|---|
| **1 · DO NOW** | The Gym, three facings, six images | **B14 is in V0.** The one blocking piece of art in the whole project |
| **2 · after the Gym proves out** | Your room · the town | post-launch, but the prompts are below so a second sitting is not a fresh start |
| **3 · HOLD** | The time machine · the era rooms | Nothing is decided about them and generating now would waste the generations |

**Why the Gym is worth three facings when B14 only needs one.** The version
shipping to the twenty is flat: the gym photo sits behind a top-down court map
with seven markers on it. That needs ONE image. But the room you actually
described has the hoop straight ahead, a weight area to the right and a desk to
the left, and **that is the walk-and-turn feature, exactly.** The same facing-1
image serves both, so shooting all three now costs one sitting instead of two
and guarantees they match. Facings generated weeks apart never match.

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

**Do all six in ONE sitting**, and if your tool has a style-reference or
image-to-image option, feed it facing 1 when generating facings 2 and 3. That is
the difference between three views of one gym and three different gyms.

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

---
---

# TIER 2 · only after the Gym proves out

Written down now so a second sitting starts warm, **not so it happens today.**

## YOUR ROOM · career, THE JACKET

```text
A teenager's bedroom at night, seen at eye level from just inside the doorway, looking across the room at the far wall: an unmade single bed under a window with city light coming through the blinds, a shelf of small basketball trophies and a folded jersey, an old TV on a low unit with a games console and two controllers, posters on the wall with no readable text, a desk lamp throwing a warm pool of light, sneakers on the floor. Nobody in the room. No text, no readable posters, no logos. Warm lamp-amber against cool blue window light. Composition: the wall and its objects in the middle band, floor open across the lower third.
```
**+ STYLE BLOCK** · 3:2 · upscale to 3600+ tall · `room-1-base.jpg`

**Near layer:** `A rumpled duvet corner and a pair of worn basketball sneakers on a bedroom floor, seen from close and slightly above, the whole object isolated and complete with generous empty space around it, no background, no shadow, painterly game-illustration object.`
→ `room-1-near.png`, no style block

## THE TOWN · career, top-down

**Different rules from every other image here.** This one is a map, not a room,
so it is genuinely top-down and it does NOT get the eye-level treatment.

```text
A small town seen from directly overhead at a slight angle, illustrated like a hand-painted game map: a basketball gym with a curved roof, a row of houses with one clearly the player's, a corner store, a park with an outdoor blacktop court, a diner, a strange windowless building with a domed roof set slightly apart from everything else, connected by streets with a few parked cars and trees. Warm late-afternoon light with long shadows falling one way. Nobody on the streets. No text, no signage, no logos. Warm amber and teal palette, clean readable shapes so each building is instantly distinguishable from the others.
```
**+ STYLE BLOCK** · square or 4:3 · **at least 3000 px on the short edge**
`town-base.jpg` · **no near layer** (a top-down map has no near field)

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
three facings actually look like the same room. They probably will not, first
try. That is normal, it is why we are doing six images instead of twenty four,
and the fix is usually one more generation with the first image fed back in as a
style reference rather than a rewrite of the prompt.

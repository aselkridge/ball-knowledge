# THE SOUND SHEET · crowd, chants, announcer (B17 theatre scope)

**Written 2026-08-16 on Aaron's ask:** *"I like porting in the sounds from
Daily 5 and I wonder how real we can get with crowd and announcer sounds?
Throughout the game, even chants and stuff too."*

The answer is three layers, cheapest first, all riding the measured-window
player that already ships (manifest offsets, synth fallback, sfx toggle and
volume honored). Nothing here invents a system; it feeds the one B5c built.

**The law stands:** sourced audio only, prefer the license you can quote,
everything self-hosted, no CDNs. Generated VOICE (Firefly can do it, filed in
ART_PROMPTS.md) needs Aaron's taste ruling before one syllable ships.

---

## LAYER 1 · THE CROWD BED (owned already, needs code not sounds)

Files on disk: `crowd-bed-pa`, `crowd-cheer`, `crowd-bed-squeaks`, plus the
measured roar windows (roarRise, roarMid, callBig). The realism upgrade is
STATE-DRIVING, not new audio:

| State | Bed behavior |
|---|---|
| Any live possession | murmur floor, never fully silent |
| Score differential shrinking late | bed gains volume a notch |
| Heat lit / a run alive | bed up two notches, squeak layer denser |
| Game point | bed drops to a HUSH (the loudest thing a crowd does) |
| Bucket at game point | roarRise, full send |
| Dead ball / card up | bed recedes behind the card |

The hush is the trick nobody expects: real arenas go quiet before the biggest
moments. A volume dip is free and reads as tension.

## LAYER 2 · THE CHANTS (source these, wire to state)

Short loopable crowd chants, licensed SFX libraries, 5 to 15 seconds each,
faded in under the bed. Search terms that find them: *crowd chant defense*,
*basketball arena chant*, *stomp stomp clap*, *crowd rhythmic clap*, *arena
airhorn crowd*, *crowd MVP chant*.

| Chant | Trigger (all hooks exist today) |
|---|---|
| DE-FENSE (clap clap) | you are DEFENDING at game point, or opponent ball on a 4+ point deficit late |
| Stomp-stomp-clap (the Queen pattern without the song) | your run is alive (2+ unanswered scores) |
| Rhythmic rising clap | shot clock under 8 with the opponent holding |
| MVP chant | a player hits their third made card of the game (needs the B8 store's per-game log; until then, third made SHOT by the same piece) |
| Single airhorn + crowd pop | ignite (heat fire lights) |

Rule: one chant at a time, never over the announcer, always under the bed.

## LAYER 3 · THE ANNOUNCER (the bark bank)

Not play-by-play. A bank of short, NAME-FREE calls fired by events, recorded
slightly off-mic so they sit IN the arena. Timing sells it; 30 lines feels
alive because the right line lands inside 300ms of the event.

### The bark list (v1, 30)

Makes: "BANG!" · "Count it!" · "SPLASH." · "Off the glass, kisses it home." ·
"Rains it in." · "From DEEP!" · "And-one energy!" · "He just walked into that
one." *(swap to "Walked into that one." for the neutral cut)*

Misses and stops: "Get that OUTTA here!" · "No. Not today." · "Front rim,
no love." · "Smothered." · "The window was closed." · "All iron."

Steals and boards: "Picked his pocket!" *(neutral cut: "Pocket. Picked.")* ·
"Ripped it clean!" · "Glass belongs to the big fella." · "Second chance,
second life."

Momentum: "This building is SHAKING." · "Somebody call the fire department."
· "He's got that look." · "The run is real." · "Answer time."

Clock and stakes: "Game point. Breathe." · "Every answer is the season." ·
"Sudden death. No net below." · "Halftime. Towel off." · "Winning time."

Cards: "Ball don't lie, brains don't either." · "Prove it." · "Big brain,
big bucket."

Notes on the list: no player names, no team names, no league marks (the
LEGAL.md naming question never touches audio this way). "Every answer is the
season" is deliberate: the banner already says it, the voice canonizes it.

### The trigger map (all existing code points)

| Event (code hook) | Bark pool |
|---|---|
| resolveShot true | Makes (weight FROM DEEP when pts=3) |
| resolveShot false, contested | Stops |
| steal resolved | Steals |
| grabBoard offensive | "Second chance, second life" |
| heat ignite | Momentum pool |
| game point reached | "Game point. Breathe." then the HUSH |
| startSuddenDeath | "Sudden death. No net below." |
| halftime (B17, when built) | "Halftime. Towel off." |

Cadence guard: minimum 9 seconds between barks, drama events exempt once.

### Three ways to get the voice, Aaron's pick

1. **Aaron records them.** A phone, a quiet room, a towel tent. 30 lines is
   one evening, three takes each. Free, legally spotless, and the game's
   voice is literally the maker's. RECOMMENDED for v1: nothing else makes
   the twenty smile like recognizing him.
2. **Firefly generated voice.** The capability is documented (ART_PROMPTS).
   Prompt shape: "Energetic basketball arena announcer, warm gravel, tight
   two-word call, slight arena reverb: 'BANG!'" Needs his TASTE ruling and a
   quotable license line before shipping, and capture the settings panel per
   the standing caution.
3. **Hired VO later.** Only if the bark bank proves out and the game grows
   past the twenty. Not a v1 question.

## Build order once sounds exist

1. Port the Daily 5 theatre player to the main game rims (B17, ruled YES).
2. Bed state-driving (volume tiers + the game-point hush).
3. Barks on the trigger map, cadence-guarded.
4. Chants last: they need the run/streak state from the arc work.

Everything lands in `docs/play/assets/sfx/` measured into the manifest, same
as every sound before it.

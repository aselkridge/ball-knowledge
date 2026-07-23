# BALL KNOWLEDGE — Full Screen-Flow Design Brief (v2)

*Paste this whole document into Claude design (or hand to any designer). It covers
every screen from first open through tip-off. v2 supersedes the earlier menu
brief: the game now exists, the flow is locked, and there is a shipped baseline
to beat.*

## The game, fast

**Ball Knowledge** — web game, live at a real URL. Turn-based basketball strategy
on a rotatable 3D court: move figurines like chess pieces, but scoring runs
through trivia (layups = easy questions, threes = hard) plus timing meters and
tap-battles. Leagues: **NBA 5v5 · WNBA 5v5 · Big3 3v3.** Play pass-and-play,
vs CPU, or online with friend codes. Every question arrives as a collectible
card that flips over. Tagline: *"Your basketball knowledge is your jumpshot."*

## The vibe formula (non-negotiable)

**Sports-broadcast polish × anime warmth × NBA Street swagger.**
Study these three and steal their confidence, not their pixels:
- **NBA Street Vol. 2** — menu attitude, hip-hop energy, character-select swagger.
- **Persona 5** — menus that show off: everything angled, everything moving,
  UI as hype. This is the motion/composition bar.
- **NBA Jam** — loading screens with personality and trash talk.
Secondary: Splatoon 3 (youth energy), THPS 1+2 (select screens), Marvel Snap
(collection polish, for later screens).

## Locked brand (do not replace; may be styled)

- **Logo:** "BK" circular badge — stroke-built letters, orange basketball at the
  K's crossover point, seam curves in the background. Shipped as logo + favicon.
- **Palette:** warm near-black ground `#100d0b` · panel `#1d1815` · cream ink
  `#efe6d8` · dim `#b3a894` · **basketball orange `#f5872e`** (deep `#c9641a`)
  · rival blue `#58a8d6` · tier colors green/amber/red `#6fbf73/#e8b84b/#d5524b`.
- **Type today:** heavy system sans (skewed, uppercase) + monospace scoreboard
  digits. Designer MAY propose display faces — self-hosted webfonts allowed,
  no CDN links in final build.

## The shipped baseline you're beating (v0.8, live)

Loading: light sweep → BK badge slams in with orange glow → spinning vector
ball + ticking :24 shot clock + rotating lines ("Icing the shooter…"); tap to
skip. Title: huge rotating ghost "BALL KNOW LEDGE" outline type, diagonal light
slashes, tilted badge, skewed slab buttons with hard offset shadows staggering
in like a lineup announcement, numbered 01–05. It's decent. Make it dope.

## THE FLOW — design each screen (phone-first)

### S1 · Loading / intro sting
First-open moment. Today: sweep → logo slam → ball + shot clock + NBA-idiom
loading lines. Wanted: more theater — think broadcast cold-open. Must stay
skippable and short (≤3s). Loading lines are a personality slot (NBA Jam
energy) — propose a visual treatment for them, not new copy.

### S2 · Main menu
Entries (locked): 01 PLAY · 02 HOW TO PLAY · 03 VS CPU · 04 PACKS & MY SQUAD
(locked/teasing) · 05 ONLINE · FRIEND CODES · settings gear. Locked items must
*build appetite*, never apologize. Room for a painterly venue backdrop behind
everything later (art being sourced — design with a placeholder layer).

### S3 · League select
Three big choices, each with its own personality: **NBA (5v5, full court) ·
WNBA (5v5, full court) · BIG3 (3v3, half court)**. League choice sets court,
roster size, AND which trivia you get asked — make the choice feel like
picking a world, not a radio button. This screen wants to be iconic.

### S4 · Decade / era select
Pick a decade (players + questions scope to it) or **FULL KNOWLEDGE** (all of
it — should feel like the heavyweight option). Think era-as-aesthetic: a '90s
chip should *feel* '90s. Horizontal swipe/carousel welcome.

### S5 · Squad reveal (v1 = randomized roster)
The player does NOT pick players yet — they're dealt a squad of real named
players from their league+decade. So design the REVEAL as the hype moment:
starting-lineup announcement energy — names hitting the screen one by one,
positions badged (PG/SG/SF/PF/C), figurine silhouettes with jersey numbers.
(Future version adds hand-picking from a collection — design the layout so a
"choose" variant can grow from it.)

### S6 · Rules / matchup screen
First-to-N selector (11/21), mode context (pass-and-play vs CPU vs online).
For VS CPU: difficulty select framed in-world — "who are you playing? A CASUAL
FAN · A SEASON-TICKET HOLDER · A HOOPS HISTORIAN" — the CPU's knowledge is the
difficulty. Make choosing an opponent feel like a fight-card matchup.

### S7 · Online path (two small screens)
- Sign-in: handle + friend code entry (invite codes the owner hands out).
  No passwords. Warm, exclusive, "you're on the list" energy.
- Room: create → big shareable room code; join → code entry. Waiting state
  ("warming up…") needs personality — free-throw practice animation, etc.

### S8 · The tip-off
Split-screen buzzer race: one question card center, both players' buzz zones
top/bottom (phone shared) or full-screen (online). Jump-rating head start.
Winner: ball. Loser: picks the venue. Design the "JUMP BALL" moment like a
title fight tip — this is the last screen before the court, send them in hot.

### S9 · Handoff to the court
The transition from menus into the live 3D court (dark arena, wood court,
figurines). Propose the cut: whistle + crowd swell + camera drop? One
orchestrated beat, not a fade.

## Constraints

- **Mobile-first portrait**; must compose on desktop. Thumb-reach for primary actions.
- Implementation is HTML/CSS/canvas by a solo dev — bold but achievable:
  layers, glows, skews, type, card flips, staggered entrances all welcome;
  particle storms and video, no.
- Dark warm world is home; no light theme needed.
- Everything self-hosted; no CDN assets in final build.
- Deliverables that help most: phone-size comps for S1–S6 + S8 (S7 stretch),
  with motion notes as simple annotations; color/type specs. The dev rebuilds
  in code — images or specs both work.

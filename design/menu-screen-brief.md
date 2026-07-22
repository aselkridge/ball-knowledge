# BALL KNOWLEDGE — Menu & Squad-Select Design Brief

*Paste-ready brief for a design tool or designer. The game exists and is playable;
this brief covers the front-of-house screens only.*

## The game, in three sentences

**Ball Knowledge** is a web-based, turn-based basketball strategy game where your
hoops knowledge is your jumpshot. Players move a squad on a 3D-perspective court
like chess pieces, but scoring runs through trivia — layups cost easy questions,
threes cost hard ones — with 2K-style timing meters for passes, dunks, and free
throws. Every question arrives as a collectible trading card that flips over to
reveal itself; win games to earn credits and rip player-card packs (Common →
Uncommon → Rare → Epic → Legendary → Mystic).

## The vibe (non-negotiable)

**Sports broadcast polish × anime warmth × NBA Street swagger.**
- *Broadcast*: scoreboard typography, lower-thirds, stat-chip crispness, tabular numerals.
- *Anime*: warm painterly light (golden gym sunbeams, sunset blacktops), atmosphere, heart.
- *NBA Street*: attitude, oversized graffiti-energy type on hype moments, ON-FIRE flames, trash-talk energy — playful, never corporate.
- It should feel like a game you *rip open*, not a website you visit.

## Brand foundations (already locked)

- **Logo**: "BK" monogram in a circular badge — letters built from thick rounded
  strokes, an orange basketball sitting at the K's crossover point, basketball
  seam curves in the badge background. (SVG exists; design may restyle its
  presentation, not replace the mark.)
- **Palette**: near-black warm ground `#100d0b` · panel `#1d1815` · cream ink
  `#efe6d8` · dim ink `#b3a894` · **basketball orange accent `#f5872e`** (deep
  `#c9641a`) · rival blue `#58a8d6` · difficulty greens/ambers/reds
  `#6fbf73 / #e8b84b / #d5524b`.
- **Type today**: system sans + monospace for scoreboard digits. Designer may
  propose display faces (self-hosted webfonts are allowed; no CDN links).
- **Tagline**: *"Your basketball knowledge is your jumpshot."*

## Screens to design

### 1 · Title / Main menu
Current state: centered logo, stacked buttons (Play, How to Play, locked Packs,
locked Online). Functional, zero swagger. Wanted:
- A title moment with *presence* — think game intro, not landing page.
- Menu options: **Play** (hotseat now; Friendly/Competitive later), **My Squad /
  Packs** (locked-but-teasing: show the pack rarities glowing), **Online — Friend
  Codes** (locked teaser), **All-Star Weekend** (locked teaser), **How to Play**, settings gear.
- Locked items should *build appetite*, not apologize (silhouetted packs, "coming
  soon" as a jersey-number countdown, etc. — designer's call).
- Room for a painterly venue backdrop behind everything (gym sunbeams / sunset
  blacktop — art being sourced separately; design with a placeholder).

### 2 · Squad-select ("the picking screen") — THE priority
This is the first interactive fun the player has. It must feel like a ritual, not
a form. Direction is open; ideas we're drawn to:
- Squad presented as **cards** (this game's soul object) — browse, flip, compare.
- Picking a player = a *moment*: card slams into your lineup slot, stat chips
  punch in, maybe a bark/quote line.
- A lineup rail showing your 3 (later 5) slots filling up; positions (PG/SG/C)
  clearly badged; team color choice (orange vs blue at minimum).
- Venue select as horizontal swipe of painterly backdrops.
- A **"LOCK IN"** confirm with real hype (stinger, flash, whistle) that hands off
  to the game's loading screen (already built: bouncing ball + shot clock +
  rotating NBA-idiom lines like "Icing the shooter…").
- Must scale from "pick 3 archetypes" today to "pick from your collected cards
  with rarities" later — design the card slot system with rarity frames in mind
  (Common → Mystic).

### 3 · (Stretch) Pack-rip moment
If the designer has juice left: the future pack-opening screen — tear animation,
rarity glow ramp, card reveal. Even a single concept frame guides us.

## Interaction & platform constraints

- **Mobile-first portrait**, must also compose on desktop. Thumb-reach for
  primary actions.
- Implementation target is HTML/CSS/canvas by a solo dev — prefer bold
  achievable compositions (layers, glows, type, card flips) over particle
  storms. Card flips, slides, and slams are all cheap and welcome.
- Everything self-hosted; no external font/asset CDN links in final build.
- Dark environment is home base; light theme not required.
- Deliverables that help most: phone-size comps of screens 1–2 (and any motion
  notes as simple annotations), plus color/type specs. Images or specs both
  fine — the dev will rebuild in code.

## References already in our world

- Warm painterly-anime venue art (golden-hour gym with god rays; sunset forest
  blacktop) — being sourced as backgrounds.
- NBA Jam / NBA Street energy for hype moments; 2K broadcast chrome for stats.
- The collector-card question flip is the game's signature visual: category art
  front → 3D flip → question with burning clock border.

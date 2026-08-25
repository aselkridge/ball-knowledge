# Sourcing round 1 · palette tools, type standards, fonts · 2026-08-25

Run for the decision board's round three, on Aaron's asks: a researched
palette from the logo orange, a type scale from true standards ("we dont
need to design around a broken system"), and fonts nailed down before
font decisions. Three researchers, then an adversarial fact-checker per
result; 66 load-bearing claims checked, 5 corrected before anything
reached the board. Readings live here; the visuals live on the board
(PLACES.md · the bible rulings artifact).

## A · Palette tools that build from #f5872e (D2)

The ones worth his time, all verified live, best first:

- **Realtime Colors** · <https://www.realtimecolors.com/?colors=efe6d8-141110-f5872e-2a201b-c9641a>
  The seeded link opens a realistic dark UI already wearing OUR colours;
  drag and see. The only tool where the deciding surface is a real page.
- **Radix custom palette** · <https://www.radix-ui.com/colors/custom?accent=f5872e&gray=8f8681&bg=141110>
  Accent + gray + our dark background in, full 12-step scales out, every
  step with a named job. The model our Candidate 2 ramp follows.
- **tints.dev** · <https://www.tints.dev/brand/F5872E> · 50-950 ladder
  with curve controls, OKLCH output.
- **UI Colors** · <https://uicolors.app/generate/f5872e> · same ladder
  idea with the best preview library (dashboard, components).
- **Adobe Leonardo** · <https://leonardocolor.io/> · generates by TARGET
  CONTRAST on our ground; second-tool material, steeper curve.
- Also verified: Accessible Palette (multi-hue consistency), Atmos (full
  workbench, freemium), Huemint (ML, "what sits NEXT to orange"),
  Material Theme Builder (tone lessons, Material look), Coolors
  (harmonies only), ColorBox (manual curves).

Methods, one line each: Radix = 12 steps with fixed jobs; Material 3 =
tonal palettes 0-100 from one source colour; Leonardo = pick contrast
ratios first, colours follow; Tailwind-style = 50-950 shade ladders;
OKLCH = the colour space where equal steps LOOK equal. Our three built
candidates (board, D2) use these: contrast-anchored four+five, a
12-step-style OKLCH ramp of the orange, and orange plus the cold
complement tuned against the existing away blue #58a8d6.

## B · Type standards (D5)

- **Material 3**: 15 roles; Display 57/45/36 · Headline 32/28/24 · Title
  22/16/14 · Body 16/14/12 · Label 14/12/11. Smallest shipped token is
  Label Small 11sp; no stated hard minimum.
- **Apple HIG (Large setting)**: Large Title 34 · Title 1 28 · Title 2 22
  · Title 3 20 · Body 17 · Callout 16 · Subhead 15 · Footnote 13 ·
  Caption 12/11; 11pt hard floor, 17pt body norm.
- **Modular scale practice**: one base x one ratio; phone-friendly band
  1.2-1.333.
- **WCAG**: no minimum size; text must survive 200% resize instead.
- **Our Mobbin evidence** (pull 3): real sports UIs run two tiers per
  screen, huge numerals plus small labels, almost no middles.
- Units transfer: 1 iOS pt = 1 Android sp = 1 CSS px at default settings.

The three fresh ladders derived from these (none from our 89 drifted
sizes) are drawn at true size on the board: A modular 16x1.25 (7 steps),
B two-tier broadcast 64/32/16/12, C standards-hybrid 57/28/20/16/14/12.
Researcher's pick: B for game surfaces with C's 20/14 as the utility
escape valve; ruling is Aaron's.

## C · The font round (D7/D8, row 8)

Free, self-hostable today: **Big Shoulders** is the one OFL family that
is a SYSTEM (condensed gothic, variable weight 100-900, 2025 redesign)
rather than a single frozen weight; Anton (incumbent, one weight, no
hierarchy), Bebas Neue (overused, one weight), Anybody at width 55 /
weight 900 (credible free Druk Condensed impression), Sofia Sans
Condensed (heavy top end, neutral voice), Oswald / League Gothic / Saira
/ Barlow Condensed / Teko (each a near miss, reasons on the board).

Paid, licences and prices verified on the day (quote-required stated
where not printed):

- **Druk** · Commercial Type · collection $600, families $150-200, styles
  from $50; web licence by unique monthly visitors, self-hosting REQUIRED
  by the EULA. The genre-definer (SLAM, Nike).
- **Tungsten** · Hoefler&Co via MyFonts · $209 per 8-style width family,
  $521 complete; pageview-tier webfont licence, self-hosting kit with
  reporting. The sports workhorse, warm rather than brutal.
- **Knockout** · Hoefler&Co via MyFonts · 9 widths x 4 weights; $35.40 a
  style, $177 a series, $839 complete. Vintage boxing-poster voice.
- **Industry** · Fort Foundry · self-hosted WOFF2 is the standard
  delivery, priced by pageviews; dollar amounts quote-required.
- **United** · House Industries · direct-only licensing (the old Adobe
  Fonts listing is gone); terms unverifiable to automated fetch (403).
- **Trade Gothic Next Compressed** · Monotype · $97.99 a style; reads
  editorial, too close to Archivo to justify.
- **Obviously** · OH no Type Co · family $599; base EULA excludes web,
  the separate web licence must be in the cart. The best modern Druk
  alternative for our warm palette.

Pairing law that emerged: the display face must be MORE condensed and
MORE heavy than Archivo and LESS quirky than Space Mono, or the trio
fights. Researcher's picks: Big Shoulders free, Tungsten Condensed paid.
Aaron shortlists; specimen renders on our screens come before any
purchase.

## Corrections the fact-check forced (kept for honesty)

An Apple-table source was an iOS-10-era mirror (re-sourced to the current
HIG); a claimed Material "14sp body minimum" does not exist (Body Small
is 12sp, no stated floor); a MyFonts licence article was misattributed;
Knockout's structure was inverted (it is 9 widths x 4 weights); United is
no longer on Adobe Fonts. All fixed above and on the board.

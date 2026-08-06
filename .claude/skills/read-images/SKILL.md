---
name: read-images
description: Read the FACTS THAT ARE PICTURES — diagrams, stat tables published as images, scanned records, screenshotted box scores. Use when a page is obviously about the right subject but the numbers are missing from its text, when verify-batch says a claim is unverifiable against a page that should hold it, or to work the image queue as its own pass. Pairs with verify-facts, which is text-only and blind to all of this.
---

# Read the facts that are pictures

## Why this exists

On 2026-08-06 three cards were declared unverifiable because the NBA's official
court-dimensions rule page contains none of the measurements in its text. Aaron
asked the question nobody had: *"And the court diagram gave u the numbers right?
So it's still a good source?"*

It did. Every number was in the diagram. `verify-batch.readable()` strips a page
to words and discards images — correct for an article, blind for anything drawn
— and **the failure reads exactly like the source not holding the fact.**

Aaron's instruction, same day: *"if a research tool won't read them but comes
across them it should put it to the side with the source for us to add another
skill to analyze all sourced pictures for fact data as well and be sure to store
them as sources related to the data tables."* This is that skill.

It matters far beyond one page. **Basketball's oldest and best records are
pictures**: Naismith's original thirteen rules, pre-war box scores, Black Fives
programmes, league record books published as PDFs and scans. A text-only
pipeline reports all of it as "no source available".

## The rule that governs everything here

**Looking at an image IS reading a source. Guessing what an image probably shows
is not.** Every rule from `verify-facts` applies unchanged: the fact must be
visible in the picture, a caption is not the picture, and "this diagram is
obviously about court dimensions" proves nothing about what number it states.
If the image is too low-resolution to read the digits, that is **unreadable**,
not verified — say so and move on.

## The pass

**1 · See what is there.**
```
python3 tools/image-scan.py            # ranked, with rejection counts
python3 tools/image-scan.py --cited    # only pages a card already rests on
```
It walks every cached page, pulls out `img` urls (including the lazy-loading
`data-src` attributes that hide the real one), and rejects furniture — logos,
avatars, share buttons, ad pixels — by name and alt text. Rejections are
**counted, never silently dropped**, so the filter can be argued with.

Ranking puts first: images NAMED like they hold data (`diagram`, `dimension`,
`chart`, `table`, `stat`, `bracket`, `rule`, `scan`), then those on pages
carrying the most cards, then by the page's tier.

**2 · Fetch a handful.**
```
python3 tools/image-scan.py --fetch 10
```
Downloads into `.cache/images/`. Anything under 2 KB is discarded as a tracking
pixel or an error page.

**3 · LOOK at them.** Read each file. This is the step no script can do, and the
whole point of the skill.

**4 · Give a verdict per card**, exactly as in `verify-facts`: verify · fix ·
quarantine · add-the-proving-source. Then apply, **and set `via`**:

```json
{"fact_id": "f-0766-...", "verdict": "verified", "date": "2026-08-06", "tier": 1,
 "add_source": ["https://official.nba.com/rule-no-1-court-dimensions-equipment/",
                "https://ak-static.cms.nba.com/.../NBA-Court-Dimensions-.png"],
 "via": "https://official.nba.com/rule-no-1-court-dimensions-equipment/",
 "source_title": "NBA Rule 1 court diagram — \"LENGTH 94 FEET (inside)\""}
```

Then the normal chain: `tier-sources.py --apply && tables-verify.py &&
tables-emit.py --apply && build-volatile-index.py && build-verified-index.py &&
audit.py`.

## `via` — and why forgetting it silently wastes the work

**An image is a source in its own right, and it arrives with a provenance
problem no other source has: publishers serve pictures from wherever they like.**
Wikipedia's are on `upload.wikimedia.org`, nba.com's newer ones on
`cdn.nba.com`, and any site can move to a CDN tomorrow. Judged on its own domain
an image is **untiered**, and an untiered source cannot lift a card to high
confidence — so the evidence is perfect and the plumbing throws it away.

`via` records the page the image was published on. `tier-sources.py` gives the
image that page's tier. It can only ever **inherit, never upgrade**: an image on
a Tier 3 page is Tier 3.

> The court diagram happens to resolve without `via`, because
> `ak-static.cms.nba.com` really does end in `.nba.com` and the flat map matches
> on a dot boundary. **Do not rely on that.** It is luck, not a rule, and most
> CDNs will not be so obliging.

Always quote the words or numbers you actually read off the image in
`source_title`. It is the only durable evidence that somebody looked, and the
next reader cannot re-run a glance the way they can re-run a grep.

## What to look for, in priority order

1. **Diagrams with dimensions** — court, key, three-point line, equipment.
2. **Stat tables published as images** — common on league and federation sites,
   and the single richest source of card material per picture.
3. **Scanned historical documents** — Naismith's thirteen rules, programmes,
   score sheets. Often the ONLY record, and always invisible to text tools.
4. **Award and record boards**, honour rolls, retired-number walls.
5. **Screenshotted box scores** in articles about a specific game.

Skip player photos, action shots and arena scenery — they carry no facts and
reading them is time the queue does not have.

## Known limits, stated so nobody re-discovers them

- **SVG is text underneath.** If the numbers are in `<text>` elements, a grep
  will find them and no image reading is needed. Check that first.
- **PDFs are not covered** by `image-scan.py` — it reads `img` tags. League
  record books are usually PDFs and are worth their own pass.
- **CSS background images are ignored** on purpose. They are almost never the
  evidence and chasing them triples the noise.
- **Resolution is a real ceiling.** A thumbnail of a stat table is not a stat
  table. Look for the full-size original before recording "unreadable" —
  Wikipedia's `/thumb/` urls almost always have one.

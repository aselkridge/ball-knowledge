# Ball Knowledge — the complete research & checking backlog

Answers Aaron's agenda item 6 (07-27): *"Deep-research debt list — many role
players have blank stats; enumerate what question/stat mining is still to be
done."*

**Every number below was computed from the actual files on 2026-07-29**, not
recalled. Where the playbook's own notes are stale, the stale figure is marked.

---

## THE FOUR TYPES — who does what

| Type | Who | What it is |
|---|---|---|
| **A · `/deep-research`** | **Aaron** | breadth gathering. Finds things I miss. |
| **B · agents** | **Claude** | verification, stat mining, player runs |
| **C · no research** | **Claude** | tagging, indexing, mining what's on file |
| **D · decision** | **Aaron** | blocks work until answered |

**The rule that matters more than the list: finding and proving are separate
jobs and must never be the same pass.** Type A finds. Type B proves. Nothing
merges that hasn't been through both.

---

## The method lives in ONE place now

Everything that used to sit here — the corrections log, claim-level exhaustion,
the three-outcome rule, find-vs-prove, the source tiers — moved to
**`DEEPRESEARCH_KNOWLEDGE.md`** (THE PIPELINE · LEARNINGS LOG · WHAT COUNTS AS
A SOURCE). That file is the single source of truth for method and learnings;
this file is the QUEUE and nothing else.

---

# TIER 0 — VERIFICATION DEBT

**Do this first.** This is the "wrong or badly sourced kills my app" category.
No new facts are gathered here. Every item is about proving what's already
shipped. Nothing in Tier 1–3 matters if this is rotten.

## V13–V18 · the source-integrity block (raised 2026-08-04, all OPEN)

Aaron: *"the validity and organization of the facts and questions are what
underpins my entire game, this has to be AIR TIGHT!!!"* The source register
(TABLES.md → `source_register`) sorted out **how good** each source is. Every
item below is something it CANNOT fix. Counts re-measured 08-04; re-run the
named command before quoting any of them.

- [x] **V24 · `goes_stale` was a permanent exclusion wearing a temporary label. FIXED 2026-08-06.**
  Aaron's ruling, same day: *"The stale tag can remain but there are other ways
  of dealing with it other than trashing good facts."* So the flag stays and now
  means what it says — this fact needs re-reading on a cycle.
  **What changed.** `build-verified-index.py` gained `STALE_WINDOW_DAYS = 180`
  and a `stale_overdue()` predicate. Inside the window a stale-able card ships;
  outside it the card is HELD (never shown wrong), with an accurate reason
  string: *"stale check overdue — re-read the source"*. `audit.py` gained a
  ratcheted `stale_overdue` metric, baselined at 0, so the re-reading bill is
  counted instead of silent.
  **Both proved by sabotage, not assumed:** aging Popovich's check to 2020 drops
  him out and `nba t0` falls 20→19; aging any proven stale-able card fails the
  audit `0 -> 1`. Restoring returns both to green.
  **Effect:** 22 proven cards unbinned. Deficit 26 → 22.
  **Why 180 days:** a season's scoring or wins leader can change inside one
  season, so a year is too slack; anything shorter makes 160 cards a monthly
  chore nobody does, and a chore nobody does is the same as no rule.
  **Still open, the better fix where it fits — V25 below.**
- [x] **V33 · THE PIPELINE IS BLIND TO IMAGES. I AM NOT. RESOLVED 2026-08-06.** Type C.
  Found while clearing the 33, then **corrected the same hour by Aaron**, who
  asked the obvious question I had not: *"And the court diagram gave u the
  numbers right? So it's still a good source?"*
  I had written that `official.nba.com/rule-no-1` was a bad citation because its
  5,119 characters of text contain no court measurements. That was wrong in an
  important way. The numbers are all there — in the court DIAGRAM. What I should
  have written is **"the answers are not in the text my tool extracts."**
  `verify-batch.readable()` strips a page to text and throws images away. That is
  correct for articles and blind for anything drawn.
  **The fix, and it is now part of the method:** pull the image out of the cached
  HTML, download it, and LOOK at it. Done here in three commands, and the diagram
  reads: *"LENGTH 94 FEET (inside)"*, *"WIDTH 50 FEET (inside)"*, *"22 FEET
  (OUTSIDE)"* at the corner, *"6 FEET RADIUS (OUTSIDE)"* at the centre circle.
  Three cards verified off it (f-0766, f-0790, f-0779) that I had just declared
  unverifiable. The rule-no-1 page is an excellent Tier 1 source.
  **The general lesson:** when a page is obviously about the right subject and the
  numbers are missing, ask whether they are in a picture before concluding they
  are absent. Diagrams, tables-as-images, scanned records and stat screenshots
  all fail the same way — and all of basketball's oldest records live in exactly
  that kind of document.
- [ ] **V34 · THE IMAGE PASS — read the 783 pictures we already have.** Type B,
  Aaron's instruction 2026-08-06: *"we need to include images, so if a research
  tool won't read them but comes across them it should put it to the side with
  the source for us to add another skill to analyze all sourced pictures for fact
  data as well and be sure to store them as sources related to the data tables."*
  **The machinery is built** (`tools/image-scan.py`, the `read-images` skill, the
  `via` field, tier inheritance). This item is the WORK.
  First scan, 08-06: **320 cached pages → 783 image candidates**, 32 named like
  they hold data, after rejecting 585 as furniture and 144 as non-images.
  What is already sitting in the queue:
  - the NBA court diagrams — **13 cards** rest on that page
  - offensive / defensive / frontcourt diagrams on Rule 10 — **7 cards each**
  - a scan of **Naismith's original rules of basketball** — 9 cards on that page
  - the 1960 Olympic team photo on the Rens' Hall of Fame page
  Order it the way the scanner ranks it: promising name, then most cards on the
  page, then best tier. Every verdict must set `via` or the image lands untiered
  and the work is wasted.
  **The prize is bigger than these 783.** Basketball's oldest records are
  pictures — pre-war box scores, Black Fives programmes, league record books as
  scans. A text-only pipeline has been reporting all of it as "no source
  available", which means the unsourceable pile is worth re-reading before anyone
  pays to replace it. Feeds V28 and V32 directly.
- [ ] **V32 · MINE THE PAGES WE ALREADY TRUST — the cheapest acquisition there is.** Type A,
  Aaron's idea, 2026-08-06: *"while we can find many more sources of course, we
  can also now reference any sources we have already labeled as tier 1 and
  explore them for more data."* Measured the same day, and it is bigger than it
  sounds:

  | | |
  |---|---|
  | distinct Tier 1 urls already trusted | **627** |
  | already downloaded, sitting in `.cache/verify/` | **191** |
  | cited for exactly **one** card | **158** |

  Those 158 are the mine. A page was opened, read, tiered and cached to settle a
  single claim — and then abandoned while still holding hundreds of facts:
  - `leaders/ast_career.html` — the entire all-time assists leaderboard, cited **once**
  - `leaders/pts_career.html`, `blk_career`, `stl_career`, `orb_career`, `trp_dbl_career` — same
  - `draft/NBA_2003.html`, `2002`, `2007`, `2012`, `2018`, `2023` — whole draft classes, one card each
  - `wnba/awards/dpoy.html`, `wnba/awards/roy.html`, `awards/roy.html` — every winner ever, one card each
  - `official.nba.com/rule-no-*` — the rulebook, a handful of cards across all of it

  Why this beats a fresh research run: **the expensive parts are already done.**
  The page is found, its tier is ruled, its publisher is registered, the bytes
  are on disk. What remains is extraction, and every fact out of it inherits a
  Tier 1 provenance that a new source would have to earn from scratch. It also
  directly feeds V28 — a leaderboard IS an enumeration of a closed set.
  Not a licence to skip proving: extracted rows still go through find → prove →
  merge, they just start at "found" with a good source attached.
- [ ] **V28 · THE COMPLETENESS CENSUS — how big is "all of it", actually?** Type A,
  raised 2026-08-06. Aaron: *"I don't want any rules history missing, I don't
  want any leagues history missing, and ALL major events and history in
  basketball."* Before any acquisition run, **enumerate the closed sets and count
  them**, so "complete" becomes a number instead of a feeling. Full reasoning in
  BUILD.md § 5b.1.
  Universes to size, each of which is finite:
  rule changes (NBA, WNBA, FIBA, NCAA — the shot clock, the 3-point line, the
  hand-check, the Elam ending) · leagues that have ever existed (BAA, NBA, ABA,
  ABL, NBL US, WNBA, WBL, Big3, EuroLeague, NBL Australia, CBA, the Black Fives
  circuit, barnstorming) · champions and Finals · All-Star selections · every
  major award, every year · Olympics and World Cups · expansions, relocations,
  mergers, folds, lockouts · Hall of Fame classes.
  Deliverable: a table of `universe → known size → how many we hold → the
  authoritative enumerating source`. That single table turns the ambition into a
  work plan and tells us the real completion percentage, which nobody currently
  knows.
  **Not a fact-proving run.** It is a counting run, and it should come before any
  attempt to fill the gaps.
- [~] **V29 · LANDSCAPE AND LICENSING — BOTH HALVES NOW RUN. Run A 2026-08-07 (question 1), Run B the same day (question 2). UNPROVEN until the quotes are re-read.**

  ### RUN B: COMPLETE, and the reshape worked
  Return filed at `docs/play/data/research-v29b-licensing.json`. **30 terms rows,
  72 law rows, 94 documents read, 8 unreachable and every one of them recorded
  as a row saying so.** Self-check passed on its own arithmetic (the script
  counted the rows rather than asking the model whether it had done enough).
  Findings written into **BUILD.md § 5b.1a-2** as the fourth acquisition
  constraint, which is where a licence finding belongs — never in the bank.

  **The diagnosis was right and it is worth keeping.** Run A's question 2
  returned zero rows because a harness built to find-and-verify claims has
  nothing to find when the documents are already known. Re-shaped as a fixed
  reading list — one agent per holder, one row per DOCUMENT, an explicit
  unreachable row, and a computed self-check — the same question returned 102
  rows. **Same model, same tools, same question. The shape was the whole
  difference.**

  **Three findings that change work, not just confirm it:**
  1. **SR's AI clause covers this project's method.** Using their Content for
     *"prompting, or instructing artificial intelligence models"* to generate
     *"answers, text, scores, statistics"*. Newer than every scraper in the
     never-enforced record. Needs Aaron's ruling, filed below as V41.
  2. **Wikidata CC0 is a sanctioned, uncapped bulk route** with dumps and SPARQL,
     carrying the player spine and the b-ref/NBA id crosswalk. A legally free
     INDEX, never a citable authority — cards still get proved against the
     references it cites.
  3. **Wikipedia's FACTS are free of even attribution** (WMF ToU § 7 waives sui
     generis database rights). Facts in, our own sentences out.

  **V32 survives in the shape it was already written in** — one page at a time,
  by hand, at the published ceiling, to prove a specific card. The prohibition
  is a SUBSTITUTION test, not a volume test.

  **STILL OWED, and the run is not finished until it is done:** re-read every
  quoted clause at its URL. A research tool can quote a cached copy of a page
  that has since changed, and terms pages change. Nothing here becomes policy
  before that pass. Filed as V42.

  ### RUN A (question 1), for the record

  Return filed at `docs/play/data/research-v29-licensing.json`. 106 agents, 5
  search angles, 24 sources fetched, 120 claims extracted, 25 adversarially
  verified, **13 confirmed and 12 killed.**

  ### Question 1: ANSWERED, and it holds up
  **Nobody publishes per-fact provenance of the four-part form we carry**
  (source + source-quality tier + confidence + date a human read it).
  - **Wikidata is the nearest thing anywhere**: references per statement plus a
    machine-readable retrieval date (P813). **No source tier, no confidence.**
    Its "ranks" are not a tier: they grade the VALUE, not the source, and the
    default rank explicitly disclaims epistemic content.
  - **Wikipedia proves published source TIERING is achievable** — a named
    five-level legend at *Reliable sources/Perennial sources* — but the tier
    attaches to a PUBLISHER (really publisher x topic x era), never to a fact,
    and carries no numeric confidence.
  - **Sports Reference publishes something genuinely unusual**: a machine-
    readable completeness ledger, per season per statistic, counting missing
    records. That is metadata about ABSENCE, not provenance. No citations, no
    tiers, no confidence, no verification dates.
  - **On the margins**, the Black Fives Foundation Online Museum is the leading
    holder for pre-1950 African American basketball and publishes narrative
    exhibitions with **no footnotes, no bibliography and no per-item
    provenance** on individual historical claims.

  **Confidence in the negative: MEDIUM, and that is the honest number.** A
  negative is only as good as the search behind it; this was broad, not
  exhaustive. Good enough to keep saying it, not good enough to say it is
  proven.

  ### Question 2: FAILED. Zero claims survived.
  **No terms of use were quoted. No robots.txt was read. No case law was
  verified.** The `terms` and `law` sections of the deliverable are empty and
  the file records them as empty rather than filling them with anything.

  So **nothing about bulk acquisition has been answered**, and the thing this
  run existed to de-risk is still open. V32 (mine the 158 Tier 1 pages) is still
  blocked on it, for the same reason it was blocked yesterday.

  **Why it probably failed, for whoever re-runs it:** a general research harness
  optimised for "find claims and verify them" is the wrong shape for "quote
  clause 4.2 of this specific page verbatim." The legal half is not a search
  problem, it is a READING problem against a known list of about eight URLs
  (Sports Reference terms + robots.txt, NBA terms + stats.nba.com robots.txt,
  Wikipedia/Wikidata licences, plus four named court opinions). **Re-run it as a
  targeted fetch-and-quote pass, not a search fan-out.** `design/V29-brief.md`
  already splits at exactly this seam: run A is question 1 and is now done, run
  B is question 2.

  **➜ RUN B IS WRITTEN AND PASTE-READY: `design/V29B-brief.md`** (2026-08-07).
  It is not a copy of question 2. It is reshaped for the failure above: a fixed
  reading list of twelve documents and seven named opinions, one return row per
  DOCUMENT rather than per claim, an explicit `fetched: no` row for anything
  unreachable, and a self-check that says **the run has FAILED if `terms` has
  fewer than 8 rows** — because the last one returned an empty array and
  reported success, which is the same vacuous-pass shape the test harness hit
  three times (`total: 0` printing GOOD). Rank 1 · item 1 in THE ORDER below.

- [ ] **V30 · ANSWERABILITY RATE — measure before building the natural-language tab.** Type A,
  raised 2026-08-06, cheap and decisive. Write ~50 realistic questions a player
  or a nerd would actually type into The Tape, then hand-classify each: can our
  schema serve it, partly, or not at all? Aaron's own example — *"all of Dell
  Curry's +30 games in the 90s"* — is **not answerable**, and not for want of a
  feature: we hold no game logs whatsoever. If the rate is ~10%, the tab is a
  research-backlog generator and must be named as one. If it is ~50%, it is a
  data browser. The number decides the build. See BUILD.md § 5b.2.
- [ ] **V31 · RATINGS DERIVATION — can the eight attributes be sourced rather than invented?** Type B,
  raised 2026-08-06, blocks the crossover duel (BUILD.md § 6). NBA Jam, NBA Live
  and NBA 2K all hand-assign their attributes; none publishes a formula; there is
  no sourced "handles" dataset to import. So the run is: for each of the eight
  levers in DESIGN.md § 2, find whether a **Tier 1 honour** (All-Defensive teams,
  DPOY, steals titles) or a **reproducible stat formula** (TS%, AST%, TRB%,
  DBPM) can carry it — and say plainly which ones cannot.
  Expected answer, to be confirmed: defense / rebounding / shooting / passing are
  sourceable; handles / speed / dunking / IQ are not, for most of history.
  Deliverable per attribute: the basis, the formula or award, the era coverage,
  and the honest gap.
- [ ] **V36 · THE SLANG CARDS MAY HAVE NO TIER 1 SOURCE AT ALL, AND THAT NEEDS A RULING.** Type D (Aaron decides), raised 2026-08-07 during the V15 pass.
  Working the Wikipedia block turned up a class of card the source standard has
  no answer for. **Roughly 20 in-scope cards ask about basketball VOCABULARY**,
  not rules and not records: *swingman*, *stretch four*, *charity stripe*,
  *brick*, *airball*, *cherry picking*, *the five*, *pick and roll*.

  The NBA rulebook is Tier 1 and it does not define any of them, because they
  are not rules. No league publishes a slang glossary. The honest sources are
  Wikipedia's `Glossary_of_basketball_terms` (Tier 3) and dictionaries, and
  Tier 3 never ships alone.

  So the options, and this is Aaron's call because it changes what the standard
  MEANS rather than how it is applied:
  1. **Accept a lexicographic Tier 2** — Merriam-Webster, the OED, a published
     basketball dictionary — and let two independent ones make high confidence,
     exactly as the rule already allows. Cheapest, and arguably correct: for a
     question about what a word means, a dictionary IS the record of fact.
  2. **Rule that vocabulary cards ship on Tier 3** as a named exception, with
     the exception recorded on the card.
  3. **Quarantine them.** Costs about 20 cards against a gate we are already
     393 short of.
  Recommendation: option 1. It needs no new rule, only the observation that a
  dictionary is a Tier 1-shaped source for a claim about language.

- [x] **V37 · THE SEASON SPINE. Built 2026-08-07, and I had the arithmetic backwards.**
  I filed this as "not worth it, do it when a batch needs five or more champion
  facts". Aaron overruled it the same hour: *"isn't all that data just fuel for
  soooo many more questions... ultimately we have unlimited questions we can
  ask, it's just how you rotate them per user."*

  He was right. I costed 80 fetches against ONE card. Costed against what the
  pages actually yield it is not close: each season page carries the champion,
  the beaten finalist, the series score, the MVP, the Rookie of the Year and the
  scoring leader, so 80 pages is a JOIN, not 80 facts.

  **Built:** `tools/season-sweep.py`, one request at a time 1.5s apart, every
  page cached so a re-run costs the site nothing. **77 of 80 seasons gathered**
  into `docs/play/data/research-seasons.json`. The three misses are 1947, 1948
  and 1949, which are BAA years living at a different url — counted, not
  skipped, and worth a follow-up.

  **First payoff, immediately:** f-0205 ("the only Finals MVP from a losing
  team") is now PROVEN rather than assumed. All 58 Finals MVPs were checked
  against their season's champion and exactly one exception exists: 1969 Jerry
  West, whose season page reads *"League Champion : Boston Celtics"* and
  *"Finals Boston Celtics over Los Angeles Lakers (4-3)"*.

  **Still owed on it:** the 77 rows are RESEARCH OUTPUT and unproven as a
  dataset. They are safe to use as an INDEX (which seasons to check) and as a
  cross-check for ONLY claims. Before any of it becomes card answers it needs
  the normal prove pass, and it should become real tables rather than a research
  file. The 1947-49 BAA gap needs closing at the same time.

- [ ] **V38 · THE CORPUS IS ALREADY MINED. Reaching 1,000 needs NEW research, not more digging. Measured 2026-08-07.**
  I told Aaron there was a mountain of unmined questions on disk. There is not,
  and the number shrank three times as I looked closer. Recording the whole
  descent, because the descent is the finding:

  ```
  ~24,000  first count, from a broken tool (counted leaves, checked shallow)
      102  question rows not already in the bank
       89  after removing ones parked or killed by the verifier on purpose
       17  after re-running the ORIGINAL dedupe rule against today's bank
  ```

  **72 of the 89 are near-duplicates of cards already live** — same fact and
  same answer, by `merge-questions.py`'s own signature rule. "Who is the NBA's
  all-time leader in career assists?" is already in there. Re-adding them would
  manufacture exactly the problem V26 is filed for (55 near-duplicate pairs,
  worst offender in the Daily Five).

  **So the strategic conclusion, and it reverses what I said an hour earlier:**
  the research files are not an untapped seam. Runs 1, 2 and 3 were merged
  properly and the leftovers are leftovers for good reasons. **The route to
  1,000 is new material: V32 (mine the 158 Tier 1 pages cited exactly once),
  V34 (the 783 cached images), fresh runs, and questions written against the
  eras `diversity.py --thin` names.** Digging the same hole deeper will not do
  it.

  **What IS still genuinely available on disk**, and it is a different shape
  from questions:
  - **17 well-formed questions** that pass the dedupe. Merge them.
  - **895 standalone FACT rows** with no question written against them yet.
    This is the real seam and it needs the `mine-questions` skill, not a merge
    script.
  - **609 season facts** from `research-seasons.json`, 88% already matched, but
    the runner-up, series score and Rookie of the Year fields are barely used.
  - Several thousand player and stat rows, which feed player records rather
    than cards.

  **The lesson, filed because it cost three corrections in one session:** a
  count of "things on disk" is not a count of "things we can use". Every filter
  the pipeline already applies — merged, parked, killed, deduped — has to be
  applied BEFORE quoting a number, or the number is a fantasy. The pipeline's
  own rules are the right filters and they were sitting in `merge-questions.py`
  the whole time.

- [ ] **V39 · ATTESTED CLAIMS — the column, the phrasing pass, and the disclaimer.** Type C then B. Raised and LOCKED by Aaron 2026-08-07, spec in DESIGN.md § 10a-2.
  The source standard assumes a documentary record exists. For the Black Fives
  era, streetball and pre-WNBA women's basketball it often does not, and not by
  accident. Applying the standard unchanged makes the bank most confident
  exactly where record-keeping was most privileged, which is the opposite of
  this project's point.

  Resolution: an attested card asserts *that the account exists and who tells
  it*, not that the event happened. Same rigour, different claim.

  Four jobs, in order:
  1. **`claim_type` column** on `facts`, defaulting to `documented` so nothing
     in the bank changes meaning. Type C, no research.
  2. **Phrasing pass** over existing streetball, Globetrotters and Black Fives
     cards: any card stating a legend as plain fact gets reworded to say what it
     is. Type C.
  3. **Selection-screen note** for eras and leagues that lean on attestation.
     Aaron: *"Those eras and times should have little disclaimers when selecting
     as well."* Not an apology, a frame.
  4. **`verify-facts` branch** that checks an attestation (who told it, where,
     when read) rather than an event, and an `audit.py` metric that fails an
     `attested` card whose question does not hedge.

  **Unblocks the H-runs.** H3 (Black Fives deep) and the streetball material
  have been quietly hard to merge because the standard had no room for them.
  This is the room.

- [ ] **V40 · ONE WORD PER STATE. The vocabulary for rejected cards is inconsistent and `facts` has no rejection state at all.** Type C. Raised by Aaron 2026-08-07: *"for all these cards and things that are being trashed per say, are we tagging them correctly with what we should call them?"*
  Measured the same day, and the answer is no. A rejected thing can currently
  end up in **six different places with three different vocabularies**:

  ```
  parked-questions.json          2 records   uses killReason + parkedAs
  quarantine-players.json        2 records   its own file, its own shape
  players-review.json            3 records   its own file, its own shape
  known-duplicate-people.json    3 records   its own file, its own shape
  kills[] inside research files 23 records   never promoted anywhere
  facts.killReason               0 records   the column exists and is unused
  ```

  **The dangerous part is what is NOT rejection.** `facts.confidence` is
  `low` on **1,054 cards**, and low does not mean rejected, it means *nobody has
  proved it yet*. Anyone reading the table without knowing that would conclude
  two thirds of the bank is junk. It is the opposite: it is a queue.
  Only about 25 things in the whole project have actually been looked at and
  turned down.

  **Proposed vocabulary, one word per state, on the fact itself.** Distinct from
  `confidence` (how good the source is) and `date_checked` (has a human read
  it), because those two answer different questions and conflating them is how
  the current mess happened:

  | `status` | means | today |
  |---|---|---|
  | `live` | proven and dealable | 318 |
  | `unproven` | written, not yet checked. THE DEFAULT, not a criticism | ~1,180 |
  | `parked` | good question, wrong right now (reveals its answer, needs rewording) | 2 |
  | `quarantined` | read and found wrong or unsupportable. Kept, never deleted | 0 recorded |
  | `superseded` | replaced by a better version of the same card | 0 recorded |

  Jobs: add the column defaulting to `unproven`; fold the four side-files and
  the 23 in-file kills into it; make `verify-batch --apply` write it on the
  quarantine verdict, which today only counts them; add an `audit.py` metric so
  the counts stop being invisible.

  **Nothing gets deleted by any of this** — that rule is already honoured in the
  code, this only gives the survivors a consistent name.

- [~] **V41 · THE AI CLAUSE — RULED BY AARON 2026-08-07: option C, ASK THEM.** Type D, now Type C. Raised by V29 Run B the same day.
  Aaron: *"This is difficult, let's go with C."* Draft letter written to
  `SPORTSREF-OUTREACH.md`, same shape as the Black Fives one: **written, not
  sent.** Aaron edits and sends.
  **Nothing about method changes while we wait**, and that is deliberate: the
  318 cards already banked are proved and dated, V32 sits behind other work
  anyway, and pausing the verify pass on an unproven reading of a clause would
  cost real progress against a risk the same research ranked as theoretical.
  **HOW MUCH THIS SOURCE MATTERS, measured rather than assumed** — the number
  that justified writing the letter at all:

  | | |
  |---|---|
  | source pages on a Sports Reference domain | 517 of 1,783 |
  | facts citing them at all | 204 of 1,526 (13%) |
  | **DEALABLE cards citing them** | **199 of 318 — 63%** |
  | **DEALABLE cards citing them and nothing else** | **128 of 318 — 40%** |
  | of the 705 pages cited exactly once (V32's mine) | 116 are theirs |

  **13% of the raw bank and 63% of everything verified.** The gap is the finding:
  they are the best Tier 1 source for the checking work, so the more the bank is
  proved the harder it leans here. The 90-card "one more publisher" block will
  lean harder still.
  **A trap I nearly walked into and am recording so nobody repeats it:** the
  first measurement returned *0%* and I almost reported it. `basketball-
  reference.com` is a SIBLING of `sports-reference.com`, not a subdomain, so
  `endswith('sports-reference.com')` matched 26 pages and missed 491. A domain
  filter that looks obviously right is exactly the kind of thing MEASURE BEFORE
  YOU ASSERT is about, because the wrong answer arrived first and looked clean.
  **The three answers are still on the table** and become live when a reply
  comes: A treat human-read as outside it, B treat it as reaching us, C ask.
  A written yes closes this item. A no makes B operative and the item becomes a
  method change, not a deletion — banked cards are unaffected either way.

  **(original entry, kept for the reasoning)**
- [ ] **V41 (original) · THE AI CLAUSE — a ruling Aaron owes, and it touches how we work TODAY.** Type D. Raised by V29 Run B, 2026-08-07.
  Sports Reference's terms, last updated 19 May 2023, bar using their Content
  *"for purposes of training, fine-tuning, PROMPTING, or INSTRUCTING artificial
  intelligence models or technologies in any manner, including without
  limitation for purposes of (i) generating answers, text, scores,
  statistics"*.
  **Read plainly, that describes reading a b-ref page into a model to write or
  check a card**, which is a normal step in this project's verify pass. It is
  newer than every scraper in the "nobody has ever been enforced against"
  record, so the comfort that record provides does not reach it.
  **The question the run could NOT settle, and it is the whole question:** does
  the clause reach a HUMAN who reads the page and then writes the card in their
  own words? The distinction the project would rely on is between *feeding a
  page to a model* and *a person learning a fact and writing a sentence*. That
  is Aaron's call and it should be made deliberately rather than by default.
  **Three shapes of answer, so it is a choice and not an essay:**
  - **A · treat human-read as outside it.** Change nothing about method; write
    the position down so it is deliberate. Keeps V32 and the whole verify pass.
  - **B · treat it as reaching us.** Then b-ref becomes read-by-human-only with
    no page text ever entering a model, which is slower and materially changes
    how verification is done.
  - **C · ask them.** Nobody has. The $5,000 figure everyone repeats is for
    CUSTOM DATASETS, a different request from "may we cite you". Their own
    § 20 routes disputes through a letter and a conversation first, and their
    SHARE page is the most permissive thing they publish: *"You are free to use
    this data anywhere, we would just ask that you include the citation."*
  *Claude's read: A, with C as a cheap and genuinely valuable follow-up.* Not
  acted on either way until Aaron rules.

- [ ] **V44 · SOURCE POSTURE — the axis the standard is missing.** Type C then B. Raised by Aaron 2026-08-07: *"what if we decide to move forward without this source... won't we run into the same problem? How can we find sources that don't have this issue?"*
  Right question, and the honest answer is that we would hit it again **only if we
  keep proving facts against DATABASES.** The restriction has a shape and it is a
  narrow one. Measured across the 318 dealable cards:

  | kind of source | citations | domains | posture |
  |---|---|---|---|
  | rival database (Sports Reference) | 199 | 1 | restrictive, READ |
  | league property (nba.com, wnba.com and kin) | 116 | 7 | restrictive, READ |
  | publisher / archive (ESPN, SI, CBS, Hall of Fame, universities) | 78 | 17 | **terms UNREAD** |
  | openly licensed (Wikipedia) | 74 | 1 | permissive, READ |

  **191 of 318 cards rest ONLY on a restrictive source. 127 already have a
  non-restrictive one.**

  **Why the problem does not simply recur everywhere.** Anti-compilation clauses
  come from organisations whose PRODUCT IS THE COMPILATION — a rival database, or
  a league selling its own stats. They restrict because a competing database
  threatens the business. A publisher of WRITING has no such clause aimed at
  facts: their terms protect their articles, which we never copy, and copyright
  does not reach facts at all (Feist). Eight domains in our pool are in the
  restrictive class. Seventeen are not.

  **THE PROPOSAL: `posture` as a second axis beside `tier`.** They answer
  different questions and conflating them would be a real bug, the same shape as
  the `confidence` / `contested` split already recorded in BUILD.md § 5b.1a:

  | field | question it answers |
  |---|---|
  | `tier` | how RELIABLE is this source? |
  | `posture` *(new)* | are we WELCOME here? open · publisher · restrictive · unread |

  The rule it buys: **where two sources prove a fact equally well, prefer the
  more permissive posture.** Not a ban on Basketball-Reference — it stays the best
  Tier 1 source in basketball and the standard still wants it. A tie-break, and a
  slow drift away from single-source concentration without losing a card.
  Depends on nothing and blocks nothing; do it alongside V17 (second sources),
  because that pass is already touching exactly these rows.

- [ ] **V45 · SEVENTEEN PUBLISHERS WHOSE TERMS NOBODY HAS READ.** Type A, cheap. Filed 2026-08-07.
  V29 Run B read the two restrictive classes properly and **never opened a single
  publisher's terms.** 78 citations in the dealable pool rest on 17 domains whose
  posture is an assumption: espn.com, si.com, cbssports.com, hoophall.com,
  springfield.edu, guinnessworldrecords.com, andscape.com, uconnhuskies.com, the
  NBC regional sports sites, and the team sites.
  **The assumption is probably right and that is exactly why it needs checking.**
  "Publishers do not have anti-database clauses" is a structural argument, not a
  measurement, and this project has a rule about the difference.
  Run it as V29B was run — a fixed reading list, one row per document, quote the
  clause, an explicit row for anything unreachable. It is a much smaller job than
  V29B: no case law, no bulk routes, one question per site.
  **Two rows matter more than the rest:** `hoophall.com` and `springfield.edu`
  are the Naismith Hall of Fame and its home, which is the natural backbone for
  exactly the pre-1980 material Track A · A5 is about to write. Knowing their
  posture before writing 200 cards against them is the cheap order.

- [ ] **V42 · THE PROVE PASS ON V29B — re-read every quoted clause at its URL.** Type B. Filed 2026-08-07.
  102 rows came back and **not one quote has been re-read.** This is step 1 of
  the prove pass in `design/V29B-brief.md` and the only one that cannot be
  skipped: a research tool can quote a cached copy of a page that has since
  changed, and terms pages change more often than sports records do.
  Scope is smaller than it sounds — the 30 `terms` rows are the ones that decide
  anything; the 72 `law` rows are court opinions, which do not change.
  **Nothing in BUILD.md § 5b.1a-2 becomes policy until this runs.** It is
  currently marked UNPROVEN in that section, and that word stays until this item
  closes.
  Also worth doing in the same pass: **9 rows came back flagged
  `quote_is_verbatim: false`** and were honest about it. Those are the first
  ones to check.

- [x] **V43 · OUR FETCHERS SPOOFED A BROWSER *AND RAN AT DOUBLE THE PUBLISHED RATE*. FIXED 2026-08-07.** Type C.
  Filed as a user-agent nit. It was worse than that, and Aaron found the worse
  half by quoting a sentence I had written back at me: *"'Automated fetches are
  rate-limited well below the published ceilings' — just give this quote a
  thought."*

  **Measured the same hour:**

  | | |
  |---|---|
  | `season-sweep.py` PAUSE | 1.5s = **40 requests/minute** |
  | basketball-reference `robots.txt` | `Crawl-delay: 3` = 20/minute |
  | sports-reference `bot-traffic.html` | 20/minute, *"in jail for up to a day"* |
  | the 429 page they actually serve | *"more than thirty pages in less than a minute"* |
  | `verify-batch.py` sleep | 3s = 20/minute, i.e. exactly AT the ceiling, not below |

  **We ran at twice the published ceiling, above their own stated block
  trigger, and fetched 80 pages that way.** Whether we were actually throttled
  is unknown; no 429 was recorded, but nobody was looking for one.

  **FIXED**, and not by editing two constants:
  - **`tools/politeness.py` is now the one home for the limit**, with the quote
    that sets each number sitting beside it. Both fetchers import it. The rule
    lived in two files before and drifted, which is exactly how 1.5 and 3 ended
    up in the repo with neither matching the ceiling.
  - **3.5s, so "below the ceiling" is TRUE** rather than "exactly at it".
    Measured: 17/minute against 20.
  - **Honest user-agent** naming the project with a contact URL, replacing the
    spoofed Chrome string. Wikimedia's policy names the practice specifically,
    and an identified agent gets 200 req/min there against 10 for an
    unidentified one, so honesty is also twenty times faster.
  - **`refuse()` blocks the hosts we must not touch at all.** `nba.com`
    robots.txt disallows `anthropic-ai`, `ClaudeBot` and `Claude-Web` with no
    exceptions. `season-sweep` now exits rather than fetching one.
  - **The lawyer brief was corrected in the same commit**, including the
    admission and its date, and the "a person opens a page and reads it"
    description was rewritten to say what actually happens. That sentence had
    quietly assumed the favourable answer to the very question the brief asks.

  Lesson written up as **AI-LEARNINGS 2.6n** — a claim about your own system
  feels like recall rather than a claim, so it never trips the checking
  instinct, and it errs in the flattering direction.

- [x] **V43 (original text) · OUR OWN FETCHERS SPOOF A BROWSER, AND THE RUN SAYS NOT TO.** Type C, mechanical, small. Filed 2026-08-07.
  `tools/season-sweep.py:45` and `tools/verify-batch.py:58` both send
  `Mozilla/5.0 (Macintosh...) Chrome/124.0 Safari/537.36`. V29 Run B quotes
  Wikimedia's user-agent policy naming exactly this: *"Do not copy a browser's
  user agent for your bot, as bot-like behavior with a browser's user agent will
  be assumed malicious."* Wikimedia's 2026 limits also give **200 req/min to a
  compliant identified agent against 10 to an unidentified one**, so an honest
  UA is not only more polite, it is twenty times faster.
  The fix is one constant in two files: a descriptive agent naming the project
  with a contact URL. **This repo already claims politeness on other people's
  servers as a standing rule** (one request at a time, 1.5s apart, everything
  cached) and a spoofed UA quietly contradicts it.
  Separately and in the same item: **`nba.com/robots.txt` disallows
  `anthropic-ai`, `ClaudeBot` and `Claude-Web` with no Allow exceptions.** No
  NBA-family host should be fetched by an agent identifying as any of those.
  Note the awkward corollary, recorded rather than exploited: an honest UA on
  those hosts is the one that gets refused. The answer is to not fetch them, not
  to hide.

- [ ] **V35 · THE V15 QUEUE, RE-MEASURED AND LINK-CHECKED 2026-08-07.** Type B.
  Before starting the Wikipedia conversion pass, the block was re-counted from
  the tables and every source page was fetched. Both numbers had moved and one
  finding is new.

  **Where the 961 in-scope cards actually stand** (nba, wnba, or untagged):
  ```
  305  dealable today
    2  high confidence, never date-stamped        <- one read each
   90  exactly one Tier 2 publisher                <- needs ONE more publisher
  210  Wikipedia-only, across 102 pages            <- V15, the readable block
  317  rest on a source row with NO url at all     <- see below
   37  other
  ```
  Recount, and it is a command now rather than a script in a chat window:
  **`python3 tools/gate-blockers.py`** (`--links` also fetches every source
  page, `--slice D` lists the cards in one bucket). Built 08-07 because this
  breakdown had been re-derived by hand three times in a week.

  **THE NO-URL ROWS ARE PLACEHOLDERS, NOT SOURCES.** 376 of 2,157 source rows
  carry a `source_id`, a `title` that is the id repeated back, and nothing else:
  no url, no publisher, no tier. Examples: `q3-corpus-flu-game-5`,
  `any-signal-traveling-rotating-fists`. TABLES.md line 299 already counts them
  under "NULL, label-only", and V15 lists them as the job after Wikipedia, so
  this is not new debt. What IS new is the framing: **these cards have no source
  to read, so no amount of reading moves them.** They are a FINDING job and
  belong with V32, not with V13.

  **Link check, 102 Wikipedia pages, 2026-08-07: 101 resolve, 1 does not.**
  `en.wikipedia.org/wiki/0.4_Shot` returns 404 and carries 1 card. That is V22's
  shape (link rot) arriving early. The suspicious-looking pages are real:
  `Bam_Adebayo's_83-point_game` and `2026_WNBA_season` both return 200.

  **What this changes about the order, and it is the important part.**
  Reading converts 302 cards at most (2 + 90 + 210). So the best case from
  verification alone is **305 + 302 = 607 against a gate of 1,000.**

  Two gaps, and quoting only the first flatters the position:
  - **floor: 39 new questions**, if every card in the bank including the 317
    with no url is eventually sourced.
  - **realistic: 393 more cards**, whether written fresh or rescued out of the
    no-url pile, because nothing in that pile has a page to be read from.

  **Verification cannot reach the gate even if every readable card converts
  perfectly.** Writing questions is not a later phase, it is a parallel one, and
  V0's Gate 1 should be read that way.

- [ ] **V27 · `goes_stale` is unreliable in BOTH directions — and one direction is dangerous.** Type C,
  raised 2026-08-06. The flag is hand-set and nothing has ever checked it.
  - **False positives — 6 found and cleared on 08-06**, including *"In basketball's
    most common two-man play … what is it called?"* Cost: a good card is hidden.
    Annoying, and self-announcing, because the pool count stays low.
  - **False negatives — ~16 suspected, and this is the direction that hurts.**
    Cards whose text describes a live record with no year pinning it, carrying no
    flag: *"Who holds the NBA record for most points scored in a single
    regular-season game?"*, *"Which country has won the most Olympic men's
    basketball golds?"*, *"Mike Krzyzewski retired with how many career Division
    I wins, the most ever…"*. Nothing holds these back and nothing will re-read
    them. They ship, and one day they are quietly wrong in front of a player —
    the exact failure the whole verified pack exists to prevent, and it is
    silent, which the false-positive direction never is.
  - Two were fixed in passing on 08-06 because this pass verified them and so
    knew they were live: Sue Bird's All-Star record and Breanna Stewart's MVP
    count, both now anchored and flagged.
  - **The scan is a regex and it over-flags** — *"Diana Taurasi retired as the
    WNBA's all-time leading scorer"* is fixed history, not a live record, and it
    gets caught. So this needs a human pass, not an automatic sweep. The regex
    lives in this entry's commit message; it is a work-list generator, not a
    verdict.
  - **Worth turning into a gate afterwards,** per §2.1 of AI-LEARNINGS: once the
    16 are triaged, an audit metric can hold the line so a new card cannot
    introduce an unpinned superlative without a flag.
- [ ] **V26 · 55 pairs of cards share an answer AND two proper nouns — some are outright twins.** Type B,
  raised 2026-08-06, spotted while rewording Popovich and then counted rather
  than eyeballed. Most of the 55 are innocent (Jordan's six titles and Jordan's
  draft team are different facts that happen to answer "Chicago Bulls"). A real
  slice are not:
  - *"Kobe Bryant dropped 81 points in 2006 against which team?"* (t3) and
    *"Kobe Bryant's 81-point game in 2006 came against which team?"* (t1) — the
    same card, rated two tiers apart, which also means one of the two
    difficulties is wrong.
  - *"Caitlin Clark was drafted #1 overall in 2024 by which team?"* and *"Which
    team did Caitlin Clark join as the 2024 #1 pick?"* — both t1.
  - *"Gregg Popovich coached which franchise from 1996 to 2025?"* (t2) and
    f-0892 (t0). Pre-existing, but the 08-06 rewording made them look more
    alike, so it is named here rather than left for someone to trip over.
  **Why it matters more than it looks:** the Daily Five draws five cards for
  everybody on the same day. Serving both Caitlin Clark cards in one set would
  be the most visible possible bug in the mode most people will play.
  Needs a human pass — an automatic dedupe would merge the Jordan pairs, which
  are fine. Recount with the scan in this entry's commit.
- [ ] **V25 · Reword the stale-able cards so they cannot rot at all. FIRST SLICE DONE 2026-08-06. RE-PRIORITISED 08-07: it is worth +20 DEALABLE CARDS and touches no website.**
  Measured 2026-08-07 when Aaron asked which data jobs need no fetching at all:
  **156 facts carry `goes_stale`, and 20 of them are otherwise fully dealable** —
  high confidence, date-stamped, and excluded from packs purely because the flag
  is set. Rewording those 20 to be date-anchored (*"as of the 2024-25 season"*)
  both retires the flag permanently and **puts the cards back in play: 317 → 337
  with zero requests to anybody's server.**
  That makes this the best no-fetch card gain on the board, and it was filed as
  upkeep. Pair it with **V27**, which is the same 156 rows read for the opposite
  error — six false positives were already found and cleared on 08-06, and
  nobody has looked at the rest.
  Type B, raised 2026-08-06 from Aaron's idea: *"Can't you just reword those to 'as of'
  and quote... the last season that these facts were present in?"* Right
  instinct — an anchored fact never needs re-reading, so it costs nothing
  forever, where the 180-day window costs a re-read twice a year.
  **The proof that this is real: 38 of the 160 are ALREADY time-anchored**, one
  of them literally opening *"As of 2026, how many NBA franchises have never
  reached the NBA Finals?"* — and the old gate binned it anyway, because the
  exclusion never looked at the wording. The wording fix only pays off now that
  V24 is done.
  Three distinct jobs, not one, and they need separating before any rewriting:
  **(a) mis-flagged** — the card is already anchored and the flag is simply
  wrong (the 2003 Finals "then-record crowd" card); clear the flag.
  **(b) volatile framing is DECORATION** — *"Gregg Popovich, the winningest
  coach in NBA history, spent his entire 29-season career with which team?"*
  The answer is "Spurs" and can never change; the rot is all in the setup.
  Delete it and the card gets shorter and better. Best outcome available.
  **(c) genuinely live** — *"A'ja Wilson has won four of which award, more than
  any player in WNBA history?"* Needs a real anchor.
  **WORDING SETTLED, Aaron 2026-08-06:** `Through the <last completed season>, …`
  and past tense. NBA takes the hyphenated season (`2025-26`), WNBA the single
  year (`2025`). Validated after the fact — the bank already contained *"Through
  the 2024-25 season, how many undefeated seasons had UConn's women
  completed?"*, so the house style existed before it was chosen. The checked
  DATE goes in `note`, never in the question.
  **DONE — the 13 cards in the three pools still short of the gate:**
  6 flags cleared as false positives (incl. the pick-and-roll definition, which
  cannot rot by any reading); 1 decoration cut to a `note` (Popovich's 1,390
  wins); 1 reframed from "who holds" to "who set" so it describes a past event;
  6 anchored. New fields `anchor` and `stale_note` (TABLES.md). Second window
  `ANCHORED_WINDOW_DAYS = 550`. New ratcheted metric `anchored_unreviewed`,
  baselined 0, proved by sabotage.
  **STILL OWED — 147 cards.** The same three-way sort, applied to the rest of
  the bank. No gate value (those pools are not short) so it is bank health and
  shrinking the recurring re-read bill, not deficit work. Do it in slices.
  Recount: `python3 -c "import json;F=json.load(open('docs/play/data/tables/facts.json'));print(sum(1 for f in F if f.get('goes_stale')), 'flagged;', sum(1 for f in F if f.get('anchor')), 'anchored')"`
- [x] **V24 (original text) · `goes_stale` is a permanent exclusion wearing a temporary label.** Type C,
  raised 2026-08-06. `build-verified-index.py:117` drops every card whose fact has
  `goes_stale` set, and it never looks at `date_checked`. The reason string it
  prints is **"can go stale — needs a refresh pass"**, which says a refresh would
  clear it. Nothing clears it. Found by checking Popovich (f-0892) against
  Basketball-Reference **today**, watching it reach `high` — and watching the pool
  not move.
  **Measured 08-06, the size of it:** 41 of the 352 cards in the five thin
  NBA/WNBA pools carry the flag and can never count, whatever anyone does to
  them. The gate is still reachable — every pool has ≥40 eligible cards against a
  target of 25 — so this is not blocking, it is misleading.
  Two honest fixes, and it is Aaron's call which:
  **(a)** a `goes_stale` card ships if `date_checked` is inside a window (90 days?),
  which is what the label already promises; **(b)** the label changes to say the
  card is permanently held, and the refresh language goes.
  Leaning (a) — the flag exists so a superlative gets re-read, not so it gets
  buried, and 41 cards is real inventory. But it changes what reaches players,
  so it is not mine to decide.
  Recount: `python3 tools/build-verified-index.py | grep "by cause"`
- [ ] **V13 · 08-06 — 327 of 1,526 facts checked. TIER 1, TIER 2 and the league-neutral slice all DONE; the STUCK-AT-MEDIUM pass is now the work.** Type B. `tools/verify-batch.py`
  works page-first, not fact-first: the V0-scope facts that already carry a
  Tier 1 link sit on far fewer pages than there are facts, so one MVP table
  settles seven cards.
  Running total 24 → 49 → 77; a `fixed` verdict sets `date_checked` too, which
  is why batch 2 moved the count by 25 and not 24.
  **Batch 1 — 24 verified, 0 wrong, 0 quarantined**, across 6 pages
  (NBA MVP · Finals MVP · Curry · WNBA champions · WNBA MVP · WNBA ROY).
  **Batch 2 — 24 verified, 1 fixed, 0 quarantined**, across 10 pages
  (Jordan · LeBron · Kareem · Catchings · WNBA ROY · Lakers · Shaq · the 73-win
  Warriors · Wilt's 100-point box score · Jerry West).
  What the two batches taught, and it is the same lesson twice:
  - **A superlative is almost never provable from the page it cites.** Catchings'
    own page shows five Defensive Player awards and says nothing about whether
    five is the most; the league's award history does, and had to be counted
    (Catchings 5 · Fowles 4 · Swoopes 3). Rose's "youngest MVP ever" ties Wes
    Unseld at 22 on Basketball-Reference's own age column and only birth dates
    settle it (Rose 22y211d · Unseld 23y32d).
  - **A comparison card needs every player's page, not one.** Both of the ones
    hit here already carried all of them — checked, not assumed.
  - So `--apply` gained a fourth outcome, `add_source`: the answer is right, the
    cited page does not show it, the proving page gets ADDED and the old one
    stays. 2 sources added so far. Verify/fix/quarantine had no slot for this
    and the honest alternative was leaving good cards unverified forever.
  - **One question was broken, not one answer.** `f-0158` asked which "duo"
    joined Curry and Thompson and offered four single players, all four of whom
    were on that team. Rewritten to something the cited page settles.
  **Batch 3 — 28 verified, 0 wrong, 0 quarantined**, across 19 pages (Kobe's
  draft · Russell · the WNBA's first season · Caitlin Clark · Sue Bird · Taurasi ·
  the playoff index · Robinson · Jokic · Larry O'Brien · Rodman · The Shot · the
  Flu Game · the 33-win Lakers). It found the worst failure so far and two more
  tool bugs, all three of the same shape — **a check that reported success
  because it could not tell the difference**:
  - **A CITED URL WAS DEAD.** `taurasdi01w` for `tauradi01w`, one letter. See V22;
    this is now its own item because nothing sweeps for it.
  - **A curly apostrophe hid a good source.** wnba.com writes "Women's" with ’
    and the fact stores '. `--sheet` reported *NO LINE ON THIS PAGE MENTIONS ANY
    OF IT — suspect the SOURCE*, which is the most misleading sentence the tool
    can produce. Now normalised on both sides.
  - **`--apply` matched sources by url-slug**, but a third of the bank's source
    rows carry hand-made ids from the original import (`v5-taurasi-vs-bird-ppg`).
    So `drop_source` unlinked nothing while its counter cheerfully reported two
    dead citations dropped, and `add_source` minted a second row for a page
    already cited. Both now resolve **by url**.
  Also: **counting beats reading, when a page will not say it.** The 1971-72
  Lakers roster page never mentions the 33-game streak, so the game log settled
  it instead — 97 games, 81-16, longest run of consecutive W results exactly 33.
  **Batch 4 — 20 verified, 0 wrong, 0 quarantined**, across 22 pages (Kobe's 81 ·
  A'ja Wilson · Taurasi · the skyhook · the Celtics' 18th · MSG · Dirk · Giannis ·
  Hakeem · Harden · Duncan · Zion · Phil Jackson · the Sonics · Stockton &
  Malone · Wembanyama · Barkley's 1993 · the 1995 Magic · Lillard's wave · Yao).
  **Counting settled four of them where reading could not**: the Celtics' season
  table ends "Won Finals" exactly 18 times, most recently 2023-24; Phil Jackson's
  record shows exactly six CHI seasons ending "NBA Champions"; Dirk has 21 season
  rows and one team; Stockton and Malone share exactly 18 Utah seasons (Malone
  1985-86→2002-03, Stockton 1984-85→2002-03). None of those four numbers is
  stated as a sentence on any page we cite.
  **Batches 5-8 — 51 verified, 0 wrong, 0 quarantined**, across ~55 pages, which
  finishes the slice. The tool broke twice more, both the same shape as batch 3's
  curly apostrophe — **the reader could not see evidence that was right there**:
  - **Accented names.** Basketball-Reference spells him Dončić and the bank
    spells him Doncic, so the search found nothing on the 2018 draft page.
    `norm()` now folds combining marks as well as smart quotes.
  - **Prose inside a script tag.** nba.com's team-history pages are a React app:
    the article lives as a string in `__NEXT_DATA__`, and `readable()` was
    throwing away every `<script>`. The Nate Thurmond page came back as ONE LINE
    — its own title — while "Thurmond" appeared 75 times in the raw bytes. It now
    digs long quoted strings out of scripts, but only when the markup yielded
    almost nothing, so a normal page gains no noise.
  **Counting keeps doing the heavy lifting**: 8 teams in the 1997 WNBA standings ·
  Cooper's four straight Finals MVPs · Wilt's 702 total assists in 1967-68 (the
  page's summary line says Robertson led in APG, which reads like a contradiction
  until you open the totals table) · Manute Bol's 2,086 blocks against 1,599
  points · Kareem's 20 seasons · the 2016 Finals actually going 3-1 down.
  **Two name variants nearly read as wrong answers.** bbref lists the first NBA
  Rookie of the Year as *Monk* Meineke; the card says *Don*. His player page
  gives "Donald E. Meineke" — same man. And a card that says "The Slim Reaper"
  against a page that says "Slim Reaper" is the same nickname.
  ⚠️ **THREE CARDS LEFT UNVERIFIED ON PURPOSE, and they are the whole reason this
  slice ends at 148 and not 151:**
  - `f-0447` *"Diana Taurasi became the first athlete in any team sport to win how
    many Olympic gold medals?"* — its source is `olympics.com`, which fails from
    here with an HTTP/2 stream error. Not a 404; simply unreadable. Needs
    another source. (`history.bulls.com` resets the connection the same way; that
    one was settled from a page we already hold.)
  - `f-0963` *"first WNBA player enshrined in the Naismith Hall of Fame, 2010"* —
    the Hall's own page proves Cynthia Cooper-Dyke is in it and shows 2010, and
    says nothing about FIRST. It is a genuinely contestable superlative: Nancy
    Lieberman was enshrined in 1996 and then played in the WNBA in 1997. Needs a
    ruling on what the card means before it can be proven.
  - `f-0015`, *"Who passed Kareem
  Abdul-Jabbar as the NBA's all-time scoring leader in 2023?"* The career points
  leaderboard proves the WHO (1. LeBron James, 2. Kareem Abdul-Jabbar) and says
  nothing about WHEN. nba.com's story on it 404s. Deriving the date from the
  2022-23 game log needs LeBron's exact career total entering the season and my
  parse of the totals table came back 34,811 against a true 37,062, so the
  derivation was wrong and got dropped rather than trusted. **It is not marked
  verified.** The honest options: find a Tier 1 page that dates the record, or
  cut "in 2023" from the question. Aaron's call which.
  **THE LEAGUE-NEUTRAL SLICE, 08-05 — 32 more proved, and a filter bug found.**
  `slice_t1()` read "V0 scope" as "carries an nba or wnba tag". 165 facts carry
  no tag at all — they are the SPORT (who invented it, the shot clock, the
  free-throw line), the game deals them in EVERY mode, and the gate counts them
  toward every league's pool. Not one had ever been read. The filter now admits
  untagged facts and still excludes flags/college/big3, measured. **This is not
  V19** — V19 is facts that should carry a league and don't.
  Mostly official.nba.com, which is as Tier 1 as a rules question gets. Nine
  held, filed as **V23** below. Effect on the verified gate, because an
  untagged card counts in both leagues at once:
  `nba t0 2→6 · nba t4 9→12 · wnba t0 1→5 · t1 11→21 · t2 13→22 · t3 8→14 · t4 4→7`
  **Deficit to flipping verified-only: 127 → 88 cards.**

  **TIER 2 FINISHED 08-05 — 135 facts, 0 wrong, 0 quarantined, 2 reworded.**
  `TIER=2 python3 tools/verify-batch.py` now reports 0 facts across 0 pages.
  Batches ran 8 → 43 → 38 → 19 → 25 → 2. What it cost and what it taught:

  - **espn.com was 45 of the 111 unchecked facts and curl could not fetch one
    of them.** Every request came back HTTP 202 with a 1,987-byte AWS WAF
    JavaScript challenge. No header combination beats a wall that wants a
    browser to RUN something, so `tools/fetch-hard.mjs` drives the Chromium
    that is already installed and writes the rendered DOM into the same
    `.cache/verify/<sha1(url)>.html` verify-batch reads. 98 of 99 outstanding
    pages downloaded in one pass. Use it for any publisher curl bounces off.
  - **Getting that browser online cost an hour and the first symptom lied.**
    Every https:// load died with ERR_CONNECTION_RESET *including
    example.com*, which is how I knew it was not ESPN. Tunnelling the CONNECT
    through an instrumented relay showed it: proxy answers CONNECT 200,
    Chromium sends a 1,753-byte ClientHello, proxy resets with zero bytes back.
    That is Chrome's post-quantum key share overflowing one TCP segment;
    curl's hello is ~400 bytes. `--ssl-version-max=tls1.2` drops the key_share
    and it fits. Certificate verification stays ON — turning it off would have
    "fixed" this too and would have been the wrong fix.
  - **Two classes of poison a length check waves through.** A bot wall
    (newsnationnow.com: 281 characters of "Access to this page has been
    denied") and a framework shell (si.com is Qwik, whose `<!--qv q:key=...-->`
    markers `readable()` was unwrapping into pages of fake prose because bbref
    hides real tables in comments). `--thin` lists the first; the comment rule
    now keeps only comments containing `<`, and both halves are asserted.
  - **The commonest real defect is not a wrong answer. It is a citation that
    stopped running before the record did.** f-0430 says A'ja Wilson finished
    2024 with 1,021 points and cited the night she was at 956; f-0429 says
    Angel Reese's streak reached 15 and cited the night it was 13; f-0962 says
    Cheryl Reeve passed Thibault and cited the night she tied him. All three
    pages mention the player, the year and a record. A pass that only asks
    "does the page mention this?" verifies all three.
  - **17 cards were right and pointing at the wrong page** and now carry a
    proving source alongside the old one (never instead of). The two reworded:
    f-0979 called the Great Western Forum's city Los Angeles when ESPN says
    Inglewood, and f-0265 asked about three DECADES while citing a Guinness
    record about three FRANCHISES.
  - **`tools/ev.py`** prints the words AROUND a match. `--grep` prints whole
    LINES and a modern article is one line 120,000 characters long; reading
    the first 800 characters of it told me twice that a good ESPN page had no
    article in it.

  Historical note from when this slice opened: `TIER=2` on any
  verify-batch command switches the slice; a fact carrying a better tier is
  excluded, so the passes cannot overlap. Two things are different one tier down:
  - **The pages are journalism, not record tables**, so they state the story and
    skip the number. nba.com's Popovich retirement piece says he left as "the
    league's all-time wins leader" and never once prints 1,390 — his coaching
    record does, in the career row. That card is now on a Tier 1 source and has
    left this slice entirely.
  - **They are React apps**, so the script-fallback built for the Thurmond page
    is load-bearing here rather than a one-off. It needed tightening the moment
    it met a Lakers page: the first version accepted any two words in a row and
    happily printed minified JavaScript as evidence. It now measures symbol
    density and average word length, because prose and bundled code differ on
    both and neither is a pattern you can guess at.
  Note the standard is NOT the same: one Tier 2 page proves the ANSWER, which is
  what `date_checked` means, but DEEPRESEARCH wants two independent publishers
  before a card calls itself high confidence. That second source is V17.
  **NEXT SLICE, re-measured 08-05 now that both tiers are done.** 1,243 facts
  are still unchecked. Only **103 of them have a readable Tier 1 or Tier 2
  source at all** — and **100 of those 103 are excluded from the pass purely by
  their league tags**, not by anything about the source:
  ```
  42 no league tag at all | 22 flags | 15 college | 9 flags+overseas
   6 fives | 4 big3 | 2 overseas          (only 3 remain inside nba/wnba)
  ```
  So **V19 is now the gate on V13, not a side quest.** The reading method has
  run out of road inside V0 scope; the next 100 provable cards are sitting
  behind a tagging job. Either re-tag (V19, by hand — regex was ruled out) or
  widen `slice_t1()`'s league filter, which is Aaron's call because it changes
  what "V0 scope" means.
  The other 1,140 need FINDING, not reading: **762 cite only a Tier 3 link (714
  of them Wikipedia — that is V15) and 378 carry no url at all.** Different job.

  Historical measurement from 08-04, kept for the recount snippet:
  **135 facts carry only a Tier 2 link** (readable the same way, one tier down)
  and **543 carry Tier 3 or no url at all** — 311 with NO url and 195 citing
  Wikipedia, which is V15. That pile needs FINDING, not reading, and is a
  different job. Recount:
  ```
  python3 -c "
  import json,collections
  D='docs/play/data/tables/'
  F={f['fact_id']:f for f in json.load(open(D+'facts.json'))}
  lg=collections.defaultdict(set)
  for r in json.load(open(D+'fact_leagues.json')): lg[r['fact_id']].add(r['league_id'])
  S={s['source_id']:s for s in json.load(open(D+'sources.json'))}
  fs=collections.defaultdict(list)
  for r in json.load(open(D+'fact_sources.json')): fs[r['fact_id']].append(S[r['source_id']])
  todo=[f for f in F.values() if lg[f['fact_id']] & {'nba','wnba'} and not f.get('date_checked')]
  t1=[f for f in todo if any(s.get('tier')==1 and s.get('url') for s in fs[f['fact_id']])]
  t2=[f for f in todo if f not in t1 and any(s.get('tier')==2 and s.get('url') for s in fs[f['fact_id']])]
  print(len(todo),'left;',len(t1),'tier1;',len(t2),'tier2;',len(todo)-len(t1)-len(t2),'need sourcing')"
  ```
  ⚠️ **Verifying the fact does not ship the card.** The gate also needs the
  source to be good enough; `python3 tools/build-verified-index.py` prints the
  pool the flip would leave (**102 NBA · 35 WNBA** today, up from 34 · 14).
  NBA t1 (34), t2 (36) are clear of the 25-per-bucket floor and t3 (24) is one
  card short; t0 (1) and t4 (7) are nowhere near, and WNBA is thin everywhere.
- [ ] **V13 (original) · NOT ONE ANSWER HAS EVER BEEN CHECKED AGAINST ITS SOURCE.** Type B.
  **0 of 1,526 facts carry `date_checked`** — verify with
  `python3 -c "import json;f=json.load(open('docs/play/data/tables/facts.json'));print(sum(1 for x in f if x.get('date_checked')))"`.
  DESIGN.md §10a says airtight needs BOTH a good-enough source AND a checked
  answer, so this alone keeps every card out of a verified pack. **This is the
  real work and everything else in this block is smaller than it.** Run the
  `verify-facts` skill over NBA/WNBA first — V0 scope.
- [ ] **V14 · The wrong-page failure — a good source that is not about the fact.**
  Type B. `big3.com/leadership/` is a legitimate official page, correctly Tier 1,
  and it is cited for *"BIG3 games are played in what format?"* — which a
  leadership page does not answer. Same shape as the Red Auerbach card citing a
  Phil Jackson biography. **Tiering fixes how good a source is; it cannot fix
  whether that source is about the fact.** Only reading each page against its own
  fact catches this. Folds into V13 — do not run it separately.
- [ ] **V15 · 724 Wikipedia citations are leads, never proof.** Type B. Measured
  08-04: **724 of 1,687 sourced rows** point at `en.wikipedia.org`, the single
  largest block, and Tier 3 never ships alone at any count. Aaron's own rule:
  *"Wikipedia says so is a lead, not proof — follow the citation and cite what IT
  cites."* Each one is converted by scrolling to References and citing the
  Basketball-Reference or league link underneath. Also here: **52 rows on
  `landofbasketball.com`**, a fan database, same treatment.

  **THIS IS NOW THE NEXT BATCH — re-measured 08-05, after Tier 1, Tier 2 and
  the league-neutral slice all closed.** What is left in V0 scope:
  ```
  10  Tier 1 stragglers  <- filed as V23, each needs its own decision
   1  Tier 2 straggler
 348  Tier 3, of which 311 are Wikipedia across 108 pages   <- THIS
 318  no url on any source at all                           <- then this
  ```
  So Wikipedia is not a footnote in the queue, it IS the queue: 311 of the 677
  unchecked in-scope facts, and the largest readable block left by a distance.

  **The method is different from every pass so far, and that is the point.**
  Tier 1 and Tier 2 were READING — open the page, find the sentence, done. A
  Wikipedia page cannot end a card, however good it looks, because Tier 3 never
  ships alone. But Wikipedia has already done the expensive half of the work:
  the claim is there and the footnote under it names a real source. So the pass
  is four steps, not two:
  1. open the Wikipedia page and find the claim
  2. follow its footnote to the underlying source
  3. verify the card against THAT page
  4. `add_source` the real one — the Wikipedia row stays (quarantine-never-
     delete, and it is still a fine lead)

  Two things to watch, both of which will bite:
  - **A footnote can point at another Tier 3 page**, or at a dead link, or at a
    book with no url. Those do not convert; they become finding jobs and should
    be counted, not quietly skipped.
  - **The temptation is to just read the Wikipedia sentence and tick it.** It
    will be right most of the time, which is exactly what makes it dangerous.
    `tools/tier-sources.py` keeps Wikipedia at Tier 3 and the confidence
    calculation counts distinct publishers, so a card whose only source is
    Wikipedia cannot reach high confidence no matter how many times it is read.

  **Why it is worth the build:** the verified-only gate needs 88 more cards to
  flip, and this is where they live.
- [x] ~~**V16 · 40 source rows hold TWO urls in one field.**~~ ✅ **DONE 08-04** —
  `tools/split-multi-source.py`. 40 rows → 64; 46 urls given their own row, of
  which **22 already existed** in the table and were reused rather than
  duplicated. The first url stays on the original row, so every existing join and
  the card's visible source are unchanged.
  Two classes turned up and they are not the same thing: **29 corroboration**
  rows (different publishers backing one claim) and **11 comparison** rows (one
  publisher, several pages, because the fact compares several players —
  `v5-west-top-avg-retired` cites four Basketball-Reference pages). Splitting the
  second kind must not manufacture independence, and cannot: confidence counts
  DISTINCT publishers. Pinned in the script's break-it proof.
  Two real repairs fell out. **Two facts went medium → high** — LeBron's and
  Curry's fourth rings — because a Tier 1 Basketball-Reference page had been
  stapled behind an `nba.com/news` url where nothing could see it. And a
  sports-reference college page had been **demoted to Tier 2 by the `/news/` in
  the SECOND url's address**: the annotation was punishing the source it was
  corroborating. `players_tier3_source` 257 → 246. Human prose in those fields
  was parked in `title`, not deleted.
- [ ] **V17 · Almost no fact has two sources.** Type B. Re-measured after V16:
  **1,515 facts still have exactly one source · 8 have two · 3 have four**, and
  of the 11 with more than one, only **4** draw on different publishers. So the
  "2 independent Tier 2 → high" path now fires for a handful instead of for
  nothing at all, and a single Tier 1 still carries the whole bank. Real movement
  needs R1 and a sourcing pass, not another mechanical fix.
  `python3 -c "import json,collections;fs=collections.Counter(r['fact_id'] for r in json.load(open('docs/play/data/tables/fact_sources.json')));print(collections.Counter(fs.values()))"`
- [ ] **V22 · Nobody has ever checked whether our source links still resolve.**
  Type C — mechanical, and it should be a script, not a pass. Found 08-04: two
  cards rested on
  `basketball-reference.com/wnba/players/t/taurasdi01w.html`, which is a typo for
  `tauradi01w` and has presumably always 404'd. Basketball-Reference answers a
  dead player id with a **91 KB page at HTTP status 200** whose title is "Page
  Not Found", so the fetcher cached an apology and the reading tool searched it
  for evidence. It was caught only because Diana Taurasi's name did not appear
  anywhere on Diana Taurasi's page.
  **And "dead" is not the only way a link fails.** Two more turned up at the end
  of the Tier-1 slice that are not 404s at all: `history.bulls.com` resets the
  connection, and `olympics.com` fails with an HTTP/2 stream error. Nothing is
  wrong with those pages in a browser — they simply cannot be read from here, so
  a sweep has to report THREE states (fine · dead · unreadable) and not two, or
  it will quietly mark good sources bad.
  **Measured so far: 2 dead out of the 56 distinct urls fetched.** That is a
  sample, not a rate — the fetched ones are the busiest pages and may be the
  healthiest. The bank holds **1,716 sourced rows over 1,366 distinct urls**.
  Recount the sample, and the population:
  ```
  python3 tools/audit.py | grep sources_dead
  python3 -c "import json;S=json.load(open('docs/play/data/tables/sources.json'));h=[s for s in S if (s.get('url') or '').startswith('http')];print(len(h),'sourced rows;',len({s['url'] for s in h}),'distinct urls')"
  ```
  **Safe today** only because `--sheet` now refuses to read an error page as
  evidence and `--plan` counts dead links up front. Nothing sweeps the other
  1,310 urls. The job: fetch each distinct url once, HEAD or GET, flag the ones
  whose title looks like an error, mark them `DEAD LINK` the way `--apply
  drop_source` does, and unlink the facts that cite them. Politeness matters —
  3s between requests means about 70 minutes for the lot, so it wants to be a
  background script with a resume file, not something typed at a prompt.
  **What it blocks:** every card citing a dead page reads as sourced and is not,
  which is the AIRTIGHT rule failing open in the quietest possible way.
- [x] ~~**V21 · 56 open-ended "who has the most" cards are tagged as never going
  stale.**~~ ✅ **RULED + MOSTLY DONE 08-04.** Aaron: *"tag em all."*
  `tools/tag-volatile.py --apply` tagged **46**; `goes_stale` 119 → 165.
  Two things the first run got wrong, both caught by the gate rather than by me:
  - **A YEAR IS NOT THE ONLY ANCHOR.** It tagged nine cards that cannot change,
    because a claim about a FINISHED career is finished: *"Who **retired** with
    11 championships as a head coach"*, *"...**retiring** as the career
    free-throw leader"*, *"Lew Alcindor **was named** MOP how many years in a
    row"*, *"which of these **retired** big men averaged the most blocks"*. The
    script now treats retired/retiring/was named as anchors too — which is the
    same shape V5 used when it rewrote thirteen cards into that form.
  - **5 are t:1 and the playbook forbids a volatile t:1 card** (V5: easy cards
    get asked most, so a stale easy card is the one people actually see). They
    are HELD BACK and printed by the script rather than tagged quietly, because
    tagging one is a decision about that CARD — reword, demote, or accept — and
    that is Aaron's. **Still open, listed below.**
- [ ] **V23 · nine rules cards the NBA rulebook does not settle.** Raised 08-05
  reading the league-neutral slice. 32 of 42 went through clean against
  official.nba.com; these nine did not, and each one is a different reason.
  **One needs Aaron. Six need a page. Two were already his call.**

  **NEEDS A RULING — f-0104,** *"How far is the free-throw line from the
  basket?" → 15 feet.* Rule 1: *"shall be 15' from the plane of the face of the
  backboard"*, and Rule 1 also defines the basket as the ring. Measured to the
  ring it is 13'9". So the famous number is right and the preposition is wrong.
  Same shape as the Great Western Forum card, but louder, because *"15 feet
  from the basket"* is how every commentator alive says it. Options: reword to
  *"from the backboard"* (true, provable, slightly odd to read), leave it and
  accept a knowledgeable player can catch it, or cut the card. **Aaron's call —
  this is taste, not data.**

  **NEEDS A PAGE — the rulebook genuinely does not carry these.**
  - `f-0766` 94 × 50 feet. Rule 1 says only *"as shown in the court diagram"*
    and the diagram is an image, so the numbers are not in any text we can read.
  - `f-0790` the corner three at 22 feet. Rule 1 gives *"parallel lines 3' from
    the sidelines"* and never the 22. Deriving it needs the 50-foot width, which
    is the same missing diagram — and a derivation off a number we could not
    read is exactly what went wrong with LeBron's career total.
  - `f-0798` five seconds with your back to the basket below the foul line.
  - `f-0814` three referees on the floor. Not in Rule 2, which is *Duties of
    the Officials* and describes what they do, not how many there are.
  - `f-0833` what happens when the shot clock expires. Rule 7 defines the
    violation; where the ball goes is elsewhere.
  - `f-0103` goaltending. Rule 11's readable text covers basket interference
    and stops before the downward-flight clause. Possibly a truncated page —
    worth a re-fetch before hunting a new source.
  - `f-0914` NCAA men get 10 seconds. **The NBA rulebook cannot ever prove
    this** — it is a card about a different league's rules citing ours. Needs
    an NCAA source, and it is the one genuine wrong-page of the nine.

  **ALREADY AARON'S, unchanged:** `f-0015` (the *"in 2023"* on the LeBron
  scoring record) and `f-0963` (Cooper as the first WNBA player in the Hall).

- [ ] **V21b · five easy cards make an open superlative claim.** Type D — needs a
  ruling. `python3 tools/tag-volatile.py` prints them with their answers:
  Olympic men's golds · Taurasi as a league's leading scorer · most points in a
  regular-season game · Women's World Cup golds · Luka as youngest EuroLeague
  MVP. Per V5 the three remedies are **reword to an anchored form** (e.g. add the
  year, or "retired as"), **demote a tier** so it is asked less, or **accept it**
  and raise the audit baseline. My view: reword. Two of them (Wilt's 100, Luka's
  age) only need a year added, and the answer does not change.
- [ ] **V20 · the game only reads ONE of a card's leagues.** Type C — mechanical,
  and it BLOCKS V19. `fact_leagues` is a join and 60 facts already carry two
  leagues (all `flags`+`overseas`); `tables-emit.py` writes only the first, so
  the second is dropped on every build. No impact on the daily today (measured: 0
  facts where an nba/wnba tag is not first) but it is why V19's re-tag keeps
  looking like a forced either/or. Scoped in TABLES.md → "one card, many
  leagues": 8 read sites, keep `l`, add `ls` when >1. **Do this before V19**, or
  the re-tag gets done twice.
- [~] **V19 · `l:any` is two different things wearing one label.** Type C/D.
  **35 OF THE 165 RE-TAGGED BY HAND, 08-05 — the mis-tagged ones.** Aaron asked
  for league-neutral cards back in the Daily Five; they had been pulled on
  08-04 because 36 of the 165 named another competition outright. Rather than
  filter at runtime, each was read and asked what ANSWERING it requires, not
  what it mentions: **14 → aba · 13 → college · 6 → fiba · 1 → globetrotters ·
  1 → wnba.** They now leave scope through the tag the same way Flags and
  Street do, with no special case in `daily.js`.
  **One deliberately left untagged:** f-0896, Senda Berenson and the earliest
  women's games. "Smith College" is where she worked, not a league you must
  know — the answer is a decade. Named as an exception in `daily-check.mjs`
  with the reasoning attached, because tagging it would be pattern-matching on
  a word.
  **130 remain untagged and that is correct** — the shot clock, the free-throw
  line, who invented it, the original 13 rules. What V19 still owes is the
  ~100 facts carrying OTHER leagues' tags that block the verification pass
  (see V13's NEXT SLICE); the untagged pile is no longer the problem.
  **RULED 08-04 (Aaron), and the rows now exist:** ABA, FIBA and the Harlem
  Globetrotters are each their own league at `status: "hidden"` — tags, not
  playable leagues, no roster run. Verified they stay out of the player-facing
  picker: `LG_LEAGUES` is generated from `leagues.json` and still lists the same
  seven. **This also unblocks the re-tag** — FIBA is no longer a forced choice
  between `flags` and `overseas`, so V20 is no longer in the way of it.
  ⚠️ **THE TAGGING ITSELF IS STILL OPEN, and must not be done by regex.** A
  keyword sweep over the 165 league-less facts proposes 14 ABA · 8 FIBA · 1
  Globetrotters · 15 college, and reading them shows why that is not good enough:
  *"Which coach won championships in three different pro leagues — the ABL, the
  ABA and the NBA?"* is not an ABA card, and *"How many personal fouls disqualify
  a player under NCAA and FIBA rules?"* is genuinely two leagues at once, which
  is V20 territory after all. Each one needs reading. Recount the candidates:
  ```
  python3 -c "
  import json,collections,re
  D='docs/play/data/tables/'
  F=json.load(open(D+'facts.json'))
  lg=collections.defaultdict(set)
  for r in json.load(open(D+'fact_leagues.json')): lg[r['fact_id']].add(r['league_id'])
  none=[f for f in F if not lg[f['fact_id']]]
  print(len(none),'facts have no league row at all')"
  ```
  Aaron asked on 08-04 whether the Daily Five really was NBA/WNBA only. Counted
  rather than answered: of the **165** in-scope cards tagged `l:any`, **36 are
  about a different competition entirely** — 12 on the ABA, the rest NCAA, FIBA
  and the Globetrotters. *"Which team won the first ABA championship, in 1968?"*
  was a live daily card, roughly one every five days across a year of sets.
  So `any` means BOTH "universal to basketball" (what goaltending is, how wide
  the lane is) AND "nobody got round to tagging this". The daily cannot tell
  them apart, so `any` has been **dropped from the Daily Five entirely** — an
  exact rule beats a 78%-true one, and the NBA/WNBA pools are healthy without it
  (t1 163 · t2 271 · t3 209 · t4 132).
  The fix is to re-tag those 36 to the league they are actually about. **It needs
  a ruling first:** there is no `aba` league row, and adding one puts ABA in the
  player-facing league picker (`LG_LEAGUES` is generated from `leagues.json`) —
  a product decision, not a data one. FIBA could be `flags` (nation vs nation) or
  `overseas`; the Globetrotters could be `street` or `fives`. Once tagged, put
  `any` back into `DAILY_LEAGUES` in one line.
  Separately: exactly **one** card in the whole bank tagged nba/wnba can only be
  answered by naming another league — #146, the red-white-and-blue ball, answer
  "The ABA". Framed as NBA merger history and famous, so left alone; the harness
  ratchets on it so a SECOND one fails the build.
- [ ] **V18 · Three sites nobody can place, and one hole no rule can close.**
  Type D — needs a ruling. `kosmagazin.com` (6 rows), `archivio.playitusa.com`
  (1), `wda.do` (1) are left NULL on purpose and sit safely at `low`. Separately:
  a bare slug at a site root — `nba.com/top-nba-finals-moments-steve-kerr-jumper-game-6-1997-finals`
  — is a feature article with nothing in its address to give it away, so it
  scores `default_tier` 1 and **only a person opening it can tell**. Recorded so
  the register is not over-trusted.

### V1 · ✅ DONE 07-29 — all 200 unsourced questions verified & applied
**`cards_unsourced` ratcheted 200 → 0. Every card in the bank now carries a
source.** Batch 1 (53 t:1) + batch 2 (147 t:2/t:3) by background agents,
applied through the gate. Totals: **194 verified (181 Tier-1) · 6 fixed · 0
quarantined.** The six fixes were live errors: the 1970 Finals MVP card's
shipped answer was WRONG (Frazier; it was Willis Reed — flipped); the Embiid
"71-point scoring race" card was doubly wrong (he scored 70 and did not win the
2023-24 scoring race — rebuilt as the franchise-record question); the Morant
card was stale (traded June 2026 — rephrased timeless); Geno's "11 titles" was
stale (12 as of April 2025 — made countless/timeless); Popovich "has coached
since 1996" → past tense (stepped down 2025); the 8-second halfcourt card was
tagged l:any while the NCAA answer (10) sat among its own distractors — scoped
to NBA. Near-duplicate pairs flagged for the dedupe pass: two Caitlin Clark
cards (batch 1), two BIG3 4-point-shot cards (batch 2).

### V1 (original) · questions with no source · Type B · IN PROGRESS (53/200 done 07-29)
Batch 1 (all 53 t:1 cards) verified by background agent + applied through the
gate: **52 sourced (48 Tier-1), 1 fixed** — the Ja Morant card had gone stale
(traded to Portland June 2026; the exact volatile-t:1 rot the playbook warns
about) and was rephrased timeless. Three present-tense survivors got v:1 and
the V5 demotion to t:2. Batch 2 (147 t:2/t:3) running in background.

### V1 (original) · 200 questions have no source at all · Type B
Of 1,526 shipped cards, **200 carry no `src`/`srcId`**.

| league | nba | wnba | world | college | any | big3 | fives |
|---|---|---|---|---|---|---|---|
| unsourced | 99 | 31 | 26 | 14 | 12 | 11 | 7 |

By tier: 89 are t:2, 58 are t:3, **53 are t:1**. The t:1 ones are the most-asked
questions in the game and the least defensible.
**The job:** three outcomes (see the rule above) — verified with a clickable
source · wrong detail fixed · **unverifiable → quarantined, never deleted.**
The quarantine file becomes the input to Q8.

### V2 · ✅ DONE 07-29 — 122 players verified by background agent, applied
**16 sourced · 19 FIXED · 86 accolades-verified with confidence · 1 quarantined.**
Every record stamped with source + dateChecked; `players_no_statsource` ratcheted
122 → 8 (the stragglers fold into V9). The 19 fixes were real errors live in the
game: Misaka's famous NIT-final lockdown was of KENTUCKY's Ralph Beard, not
"NYU's star"; Puggy Bell's first name is CLARENCE (and he was 1939 WPT MVP — the
record understated him); Khryapa's EuroLeague titles are 2008+2016 not 2006+2008;
Wang Zhizhi is 7x not 6x CBA champ; Fats Jenkins is HOF class of 2021 not 2022;
the Barkley/Coimbra "jersey swap" never happened (photo + a 1996 apology did);
plus nine Tier-1 stat corrections (Fowles, Catchings, Jackson, Cooper, Clark's
peak 31.6 not 31.8, and five active-player drift updates). Ron "Terminator"
Matthias's two unproven accolades → `quarantine-players.json` (Q8 input).
Marques Haynes and Goose Tatum appearing in BOTH fives and street is intentional
(the Globetrotters 1950 split, Aaron's ruling 07-28). NOTE for Aaron: Fats
Jenkins's accolade "star Negro Leagues baseball outfielder" is BASEBALL, where
that is the correct historical league name — left intact, flagged for your call.

### V2 (original) · 122 players have no `statSource` · Type B
622 of 744 records cite a source. **122 do not.** Those players' numbers appear
on cards and in stat questions with nothing behind them.
**The job:** three outcomes, same as V1. **Never strip a record** — quarantine
the unsourced stat block and keep the player playable on accolades. A player with
accolades and no fake numbers is honest; unsourced numbers are the liability.

### V3 · VERIFICATION COMPLETE 07-29 — 117/117 · Type B · not yet applied
**70 verified · 45 FIXED · 2 quarantined. A 38% correction rate** — against 3%
in the question bank and 16% in the player DB. This corpus was the weakest data
in the project and gating it was correct; **none of it ever reached the game.**
Results: `docs/play/data/research-v3-verification.json`. Confidence: 85 high,
30 medium, 2 low. 76 of 117 facts are high-stakes (draftable subjects or
superlatives).

Took three attempts, all logged as learnings #10-12: one agent given all 117
died at 246.7k tokens without writing output; a 7-slice workflow had all its
agents crippled by a broken permission handler (they refused to fabricate —
every one returned "TOOLING FAILURE, NOT A RESEARCH FINDING"); the third
attempt, plain background agents writing JSON files, worked.

**The corrections that matter most — two superlatives about now-draftable players
both broke:**
- Ann Meyers "first woman on a full four-year athletic scholarship" is FALSE
  unscoped — prior claimants at Chicago (fall 1972), Miami (early 1973) and
  Wayland Baptist. Correct scope: **at UCLA**.
- Ann Meyers "first four-time All-American in women's basketball" is FALSE — it
  dies on **Nera White**, AAU All-America 15 straight years (1955-69). Correct
  scope: **first four-time Kodak/collegiate All-American**. Note the shape of
  this: the person the corpus MISSED breaks the corpus's claim about someone
  else. Missing people are correctness risks, not just gaps.
- **Nancy Lieberman was never WBL MVP** — she was Rookie of the Year; Rosie
  Walker won it. hoophall.com's own bio says otherwise (see the Tier-1
  bios-vs-records rule).
- Lieberman was 38 not 39 at the WNBA's first tip; Woodard 37 not 38.
- Meyers' Pacers deal was a one-year **$50,000 personal-services contract**, not
  a "no-cut contract"; she never received the full sum.
- "First INDEPENDENT women's league" (ABL) is false — WBL 1978, WABA 1984, LBA
  1991 precede it. Rescope.
- Three of six named "1996 Olympians who signed with the ABL" were not 1996
  Olympians (Katie Smith, Yolanda Griffith, Kate Starbird). The true claim: nine
  of the twelve gold medalists signed — all but Swoopes, Leslie, Lobo.
- Teresa Edwards "oldest gold medalist" went stale — Sue Bird won at 40, Taurasi
  at 42. Date-anchor to 2000.
- WBL season two went 8 → **14** teams (not "doubled to 12"), and the Washington
  Metros were the relocated Dayton Rockettes, not an expansion club.
- Pearl Moore scored **27** not 22 in the 1980 WBL final; Hanes Hosiery's streak
  was **102** not 76; Cathy Rush coached Immaculata from **1970** not 1972;
  Berenson's 1901 rules allowed **five to ten** players, not nine; the AIAW was
  **not absorbed** by the NCAA — it sued under the Sherman Act and lost.

**A self-contradiction caught before it shipped:** Lieberman's "first woman in a
men's pro LEAGUE" and Woodard's "first woman GLOBETROTTER" are both true only at
those exact scopes. Woodard signed Oct 1985, before Lieberman's 1986 USBL debut,
and many outlets call Woodard the first woman on a men's pro TEAM. Lose either
card's precise wording and the two cards contradict each other in-game.

**Conflicts:** the 1997-98 ABL champion is RESOLVED (Columbus — AP 16 Mar 1998;
APBR's table always agreed, it had been misread) and Immaculata's years are
RESOLVED (1972-74). The corpus's "8 vs 9 team count" conflict was mis-attributed
to the ABL — it is the WBL's. Remaining conflicts running now.

**STILL OWED before merge:** the adversarial refutation pass over the 45 proposed
corrections (a correction is itself a claim), conflict settling, and the
completeness critic. Two of those three are running.

### V3 (original) · H1's 117 facts are unverified · Type B
The women's pre-WNBA corpus I built this week. Its sources say
`"Wikipedia: Lynette Woodard"` — an **article name, not a link**. You cannot
click and verify a single one, and nothing independent has challenged them.
**Do not merge H1 into `questions.js` until this pass runs.**
Its 9 recorded conflicts are the only part that's currently safe, because those
were explicitly left unresolved.

### V4 · `volatile-questions.json` does not exist · Type C
The playbook designs a refresh loop that reads
`docs/play/data/volatile-questions.json`. **That file has never been written.**
148 volatile cards are live with no index, which means **the refresh loop
cannot run as designed.**
**The job:** generate the index from the bank. Small, mechanical, unblocks V6.

### V5 · ✅ DONE 07-29 — 37 volatile t:1 cards resolved · was Type C/B
13 de-flagged (finished/anchored facts wrongly marked volatile) · 6 reworded to
anchored phrasing · 5 demoted to t:2 with v:1 kept (big-margin active
comparisons, refresh loop watches them) · 13 rewritten to retired/anchored
claims, each backed by a Tier-1-cited fact in
`docs/play/data/research-v5-rewrites.json` (three post-cutoff facts — Bam's 83,
Reeve's record, Griner passing Dydek — web-verified with URLs). `volatile_t1`
ratcheted 37 → 0 in the audit baseline. Original item follows for the record.

### V5 (original) · 37 volatile questions are t:1 — a rule violation
The playbook's own rule: *"Never write volatile t:1 questions. Easy questions get
asked most; a stale easy question is the most likely to be seen and the most
infuriating to miss."*
**There are 37 of them.** Volatile spread: t:1=37, t:2=49, t:3=35, t:4=22, t:0=5.
**The job:** rewrite each as timeless ("who retired as the leader in X?") or
demote it. Converting a volatile into a permanent is the preferred move.

### V6 · Volatile refresh pass · Type B · recurring
All 148 volatile cards re-verified against current sources. Blocked on V4.
**Cadence RULED 07-29: event-anchored, not calendar-interval** — three
scheduled runs/year: mid-July (post-NBA-Finals + free agency), late October
(post-WNBA-Finals), mid-February (post-trade-deadline). Recurring Routines
fire fresh sessions that verify the volatile index + stale active players,
apply on a branch through the gate, and report — **never auto-merge**.
The July 2026 checkpoint effectively ran on 07-29 (V1/V2/V5 passes).

### V7 · Corpus source upgrade — the run-1 corpus is 73% Wikipedia · Type B · BIG
**559 of 765 run-1 facts cite Wikipedia (Tier 3); only 13 cite
Basketball-Reference.** And because all 1,326 sourced cards point at corpus ids
(zero carry URLs directly), **the corpus's sourcing IS the shipped bank's
sourcing.** The job: follow each Wikipedia citation down to what it cites —
Tier 1, or two independent Tier 2 — stamp `dateChecked`, three outcomes.
Batchable by slice; the biggest single job on this list.

### V8 · Orphan-srcId audit · Type B
`questions.js` references **1,107 distinct srcIds** but run 1 holds only 765
facts — several hundred cards resolve to facts in the run-2/run-3 files, and
**`research-run3-questions.json` contains zero URLs; `research-run2-easy.json`
has eight.** `tools/audit.py` measured it exactly: **385 referenced srcIds
resolve to NO fact in any research file on disk.** Those cards' source chains
end in the void. Each gets the V1 treatment (verify / fix / quarantine).

### V9 · players.json source-tier upgrade · Type B
Beyond the 122 with nothing (V2): **163 cite Wikipedia and 50 cite
landofbasketball.com — Tier 3.** Upgrade to Basketball-Reference/official where
it exists; where no Tier 1 exists (world pre-EuroLeague, street, fives), keep
the best available and mark confidence honestly.

### V10 · Superlative audit — the Woodard class · Type B
**441 shipped cards (29%) use first/most/only/record/all-time language.** Each
needs the prior-claimant search the standard now requires; failures get scoped
("major-college record"), date-anchored, or quarantined. Runs naturally
alongside V7/V8 — same cards, same lookups, do them in one pass.

### V12 · Tier-economy violation · Type C · NEW EVIDENCE 07-29
**BIG3 is the worst offender and it is measurable: 10 of its 35 players are tagged
`superstar` — 29%.** Those are NBA role players and starters (Joe Johnson, Kenyon
Martin, Al Harrington, Michael Beasley, Rashard Lewis, Gerald Green). Stars within
BIG3, perhaps — but a 29% superstar rate makes a Legendary pack meaningless.
Spread: superstar 10 · allstar 15 · starter 6 · role 4 — an inverted pyramid.
Surfaced while building the S7 fill list.

### V12 (original) · superstars are not the smallest tier · Type C
The playbook's guardrail: *"superstar inflation breaks pack rarity — superstars
should be the SMALLEST tier."* Today: **99 superstars vs 42 deep.** Caught by
`tools/audit.py` (`superstar_not_smallest`). Either demote borderline superstars
or grow the deep bench (P2/P3 do the latter naturally — decide which before
tuning pack odds).

### V11 · `dateChecked` stamping · rule, not a run
Every source touched by ANY pass (V1, V2, V3, V6, V7, V8, V9) gets a
`dateChecked` stamp on the way through. No separate sweep — it rides the others.
Today the string appears **zero times** in the data files.

---

# TIER 1 — UNBLOCK FEATURES THAT ARE ALREADY SPEC'D

### Q6 · DATA HALF DONE 07-29 — 1,102 cards era-tagged, 883 player-tagged
Built `tools/era-tag.py` (re-runnable, `--dry` then `--apply`). Results on 1,526
cards: **1,102 carry `e:`, 883 carry `p:`, 173 correctly evergreen (no tag), 251
still need a lookup.** 80% resolved mechanically.

**The signal that did the heavy lifting was already on disk:** the corpus facts
carry their own `era` field, and under the became-true rule *the fact's era IS
the question's era.* That covered 776 cards (51%) with the highest possible
confidence — no inference at all. Explicit years in the stem or the CORRECT
answer (never decoys) added 267 more; 47 volatile present-tense cards got the
current decade per the 22q ruling; 12 came from single-era players.

**It declines to guess, by design.** "Michael Jordan won six championships" and
"LeBron won his fourth" come back UNTAGGED — multi-era player, no explicit year,
so the tool refuses. Untagged = always eligible, so an untagged card is safe,
just not scoped yet. The 251 are listed in `docs/play/data/era-tag-lookups.json`.

**Pool depth verified before shipping (22q demanded this):** every league × era
combination holds 133+ cards; the thinnest is fives/2010s at 133, the deepest
nba/2020s at 393. Nothing starves. Note pools are deep partly BECAUSE 424 cards
ride every era untagged — **era scoping will feel truer as the lookup pass
completes**, and pools will tighten honestly as it does.

Integrity: 1,526 cards unchanged, file parses, every `e:` a valid decade array,
every `p:` a valid slug, all 22 gate-spec cases still pass, audit gate PASS.

**✅ ENGINE HALF ALSO DONE 07-29.** `eraOk()` ANDed into the draw; era selection
now rides in `state.eras` (it previously existed only at setup time, which was
the actual bug); the counter gained the era term. The last-resort fallback
honours the era gate FIRST so a thin tier cannot become the hole an out-of-era
card climbs through. **Smoke-tested end-to-end: 400 draws in an NBA 1960s game,
ZERO out-of-era leaks, no starvation past exhaustion**, and All-Time correctly
draws from 11 decades. Counter behaviour measured: NBA 742 All-Time → 375 for
the '90s → 426 adding the '00s → 885 with two packs on All-Time.

**Thinnest REACHABLE pool** (counting only eras each picker actually offers —
BIG3 has none, WNBA starts at the 2000s): **22 cards, at tier 0 in NBA-1960s and
WNBA-2000s.** Playable, but this is the number 22q says to DISCLOSE at era-select
rather than silently widen. Do that when the 22r picker is built.

**NEXT:** the 22r combined league+era picker (mockup first, per house rules), and
the lookup pass on the 251 undated cards — which will tighten these pools and
make scoping truer.

#### Q6 · the feasibility measurement, kept

**Restored 2026-08-07.** This table was deleted by accident when the stale
plan section at the foot of this file was rewritten. It is measurement, not a
plan, so it belongs here in the entry that owns it. **The decision it asks for
was answered on 07-29 — D1, BUILD.md § 6 · 22q: rule A for players, and a
question is tagged with the decade its answer BECAME TRUE.** The "Awaiting
Aaron" at the foot of the block is preserved as it was written and is no longer
true; it is left visible because the rewrite that deleted this table also
carried that dead sentence forward as if it were live.

| | cards | % | |
|---|---|---|---|
| names a player already in `players.json` | 875 | 57.3% | pure join, no research |
| no name, but an explicit year/decade | 369 | 24.2% | regex, no research |
| reads evergreen (rules/origins) | 30 | 2.0% | no tag needed |
| **neither — unknown person/team/event** | **252** | **16.5%** | **needs lookups** |

~83% is mechanical; **252 cards genuinely need research.** I originally claimed
"no research" — that was overclaimed.

**The bigger issue is not research at all: 790 cards (51.8%) name a player who
spans more than one decade.** Jordan is tagged 80s/90s/00s — so which decade owns
"how many rings does Jordan have"? That is a design rule, not a fact.

- **Rule A — every decade the player played.** Generous pools, thin combinations
  never starve, but some questions will feel out of place.
- **Rule B — the decade they're identified with.** Feels right almost every time,
  but pools shrink and some era+league combos may not fill a tier. Needs a
  signature-era field on ~737 players, mostly obvious calls.

**Claude's recommendation: B.** The point of picking an era is that it feels like
that era, and 22q's own spec warns that silently widening pools is exactly what
broke league scoping. **Awaiting Aaron.**

### Q6 (original) · Era tagging — 22q · Type B/C · UNBLOCKED 07-29 (D1 ruled)
**The rule: players carry every decade they played (rule A); questions are
tagged with the decade their answer BECAME TRUE (never inherited from the
player's span).** Spanning facts multi-tag; aggregates tag their completing
decade; current-state volatile cards tag the current decade only; evergreen
stays untagged. Full ruling in BUILD.md 22q.
**Scope grown by 22s (Aaron, 07-29): the same tagging pass also writes
`p:[...]` player-id tags** — the card is being read and dated anyway, so both
tags land in one touch. Gate semantics + 22-case adversarial suite live in
`tools/gate-spec.mjs` (all passing); the engine gate ports those cases as its
tests when it lands.
**`e:` appears on 0 of 1,526 questions.** Era selection currently drives rosters
only, so picking the '90s can still hand you a Luka card.
~58% of cards can have era derived from the player named in the stem or the
correct answer (never the decoys); ~42% are evergreen and correctly get no tag.
**This also fixes the pack counter**, which is honest today and becomes a lie the
moment era scoping ships.
**Biggest win-per-effort item on the whole list.**

### Q5 · Off-court mining — 22p · Type A
`off:` appears on **0** questions. Needs genuinely new facts — what each player
is known for away from basketball — with the spec's tone guardrail: *celebratory,
never gossip; business, art, service, second acts; nothing about legal trouble,
health, or family drama.*
Corpus is dry, so this is a `/deep-research` run, not a mining pass.

### Q4 · BIG3 questions · Type A
77 cards today, target ~150. BIG3 was moved to IN THE LAB because its data can't
carry it. Pairs naturally with **S2** below — same run, questions + stats.

---

# TIER 2 — DATA RUNS (players & stats)

### S1 · World / FIBA stats · Type B
**ppg 39/101.** The single biggest stat hole. 44 of 101 have any career block.

### S2 · BIG3 stats · Type B
**ppg 11/35.** Gates BIG3 out of selectable leagues today.

### S3 · College stats · ~~Type B~~ **DONE — remove**
**ppg 28/29.** Already there. Stale entry on my earlier list.

### S7 · The STAT FILL RUN — Aaron's "second pass" instinct, measured · Type B · BIG
**Aaron, 07-29:** *"did one deep research pass really grab everything I need about
the players today? And I assume not... even standard role players that pop up are
missing info all together, and I assume that is the same for stars too."*
**He was right, including about the stars.** Measured, not recalled:

**The gap has a SHAPE — it is positional, not random.** Field presence in
nba/wnba degrades in the exact order stats are printed in a career line:
`ppg 100% · rpg 95% · g 92% · apg 84% · fg% 74% · ft%/pts 71% · bpg/spg ~54% ·
3P% 46%`. That signature means the runs captured the top of the row and thinned
out going down it — so a second pass is *predictably* productive, not a fishing
trip.

**The tier gradient runs against intuition.** Complete-on-all-fields, nba/wnba:
superstar 74% · allstar 58% · **starter 27% · role 24%** · deep 59%. The MIDDLE
is the hole, not the bottom. And a quarter of superstars are incomplete.

**But the raw gap was overstated — this list is ERA-HONEST.** A player appears
only if a stat is missing that the sport was *actually recording* in their era:
no 3P% before 1979-80 (103 players legitimately have none), no spg/bpg before
1973-74, nothing pre-1950, and **no chasing a center's meaningless career 3P%**
(Yao, Dwight). street/fives excluded — accolade-only by design.

**THE LIST: `docs/play/data/s7-fill-list.json` — 364 players, 2,007 field-fetches.**
Batched so each is bounded for one agent (learning #10):

| batch | players | | batch | players |
|---|---|---|---|---|
| nba-mid | 151 | | world-top | 47 |
| wnba-mid | 37 | | world-mid | 35 |
| big3-top | 25 | | nba-top | 18 |
| wnba-top | 17 | | college-top | 13 |
| big3-mid | 10 | | nba-low | 9 |

**Type B, NOT a `/deep-research` run — and that distinction is the point.** These
are known players with known Basketball-Reference pages missing a known column.
Discovery finds things you don't know exist; this is a lookup. Using
`/deep-research` here would be a telescope reading a receipt. Aaron's instinct
was right; only the instrument needed correcting.

**Where he DOES need a second discovery pass is BREADTH** — the 35 missing people
in `research-v3-critique.json`, whole absent categories. No lookup finds someone
whose name never came up. That is H3/Q8, his column.

**Mandatory, not optional: D7.** Ratings cannot be honest on 54% blocks data —
everyone grades a scorer, nobody a rim protector. S7 + S4 + S6 are the ratings
prerequisite Aaron already committed to.

### S6 · Per-era stat packages (`statsByEra`) · Type B · BIG · spec'd 07-29
The 22t schema: per-decade TOTALS (g, pts, reb, ast, stl, blk, fgm/fga,
3pm/3pa, ftm/fta) per player, so era-sliced games print era-true card stats
and multi-era games combine them exactly (games-weighted; see
`tools/player-spec.mjs`). **Mine totals, never rates** — rates can't be
recombined. Gate every merge on the self-consistency law (era packages sum to
the career block). NBA/WNBA first (Basketball-Reference season tables bucket
cleanly by decade); world where sources allow; street/fives stay accolade-only
by design. This is the data prerequisite for era-sliced player cards (22q
future-polish note) and it subsumes much of S4 — decade bucketing captures bpg
on the way through.

### S4 · The `bpg` hole — rim protectors · Type B · *new, not previously listed*
**bpg 321/744 — the weakest field in the DB.** The playbook warned about exactly
this: build ratings on lopsided fields and *everyone grades out as a scorer and
nobody as a rim protector.*
**This directly blocks Aaron's agenda item 7** ("stats + superstar skills in
gameplay — make rosters MATTER"). Ratings built today would be broken.
Also thin: apg 500/744.

### S5 · Accolade-only by design — *not a gap, a decision to record*
**street (10/47) and fives (8/20) should stay accolade-only.** Those box scores
largely were never kept. That is the honest answer, not a hole to fill or fake.

### P2–P8 · Player runs · Type B
Adds bodies, not numbers. From the playbook queue:
- **P2** NBA role & deep, '80s–'00s
- **P3** NBA role & deep, '50s–'70s + '10s–'20s
- **P4** WNBA full sweep (114 today)
- **P5** World/FIBA deep
- **P6** Streetball + Globetrotters + Black Fives deep *(Globetrotters split at
  1950 — competitive era vs modern exhibition act. Aaron's ruling, 07-28.)*
- **P7** College icons (29 today — thinnest league in the DB)
- **P8+** gap-fill from audits

### P9 · CROSS-LEAGUE CAREERS — the roster's biggest structural hole · Type B
**Found 07-30 when Aaron asked "only 7 people are in two leagues? How is that?"
He was right to be alarmed. This is data debt, not design.**

Measured: **7 of 744 records** belong to a person who holds a record in a second
league. Per-league overlap with the NBA roster:

| league | players | with an NBA record | reality |
|---|---|---|---|
| big3 | 35 | **0** | BIG3 is a *retired-pro* league — essentially all 35 are NBA alums |
| world | 101 | **0** | Gasol, Ginóbili, Scola, Rubio, Splitter, Petrović, Sabonis, Marčiulionis… |
| street | 47 | **0** | Rafer Alston, God Shammgod, Lloyd Daniels played in the NBA |
| fives | 20 | **0** | Chuck Cooper, Earl Lloyd, Nat Clifton were the NBA's FIRST Black players |
| college | 29 | 3 | Laettner, Sampson, Manning, Austin Carr, McDermott, Hansbrough, Misaka… |
| wnba | 114 | — | 8 World women (Penny Taylor, Brondello, Timms, Arcain, Valdemoro) lack a WNBA record |

**Objective floor: 70 records name "NBA"/"WNBA" in their own `accolades` or
`covers` text** — i.e. the record itself says the person played in a league where
the game says they do not exist. The true number is higher (BIG3 alone should be
~35).

**Root cause.** The roster was built as seven independent research passes, each
answering *"who belongs in THIS league's story."* No pass ever cross-referenced
another. The schema supports one person holding several records — the 7 prove the
mechanism works — but nothing ever CHECKED for it, so cross-league membership
happened only by coincidence, when two passes picked the same person.

**Blocker: there is no stable person ID.** The key is the raw `name` string, and
it is already inconsistent, which hid two duplicates from the count:
- `Goose Tatum` (fives) vs `Reece "Goose" Tatum` (street) — same man, two records
- `JJ Redick` (college) vs `J.J. Redick` (nba) — same man, two records

The dealer dedupes a squad with `used[pick.n]` on the raw name (game.js:4457), so
`JJ` and `J.J.` are two different people to the engine. **Give people a stable
`pid` before adding companion records**, or P9 manufactures duplicates at scale.

**Order of work:**
1. `pid` + a name-normaliser, and reconcile the two known duplicate pairs.
2. Audit metric `people_missing_companion_record` + `players_dupe_name` → ratchet.
3. Companion records league by league, cheapest first: **big3→nba** (35, all NBA
   alums with Basketball-Reference pages), then **fives→nba** (the integration
   generation), **world→nba/wnba**, **college→nba/wnba**, **street→nba**.
4. Each companion record is a real per-era stat package (see the 22t
   self-consistency law), NOT a copy of the other league's career line.

### P10 · The three league vocabularies disagree · Type B (data) + code
Found alongside P9. **`LG_LEAGUES` (the UI registry) and the data do not match:**
- `LG_LEAGUES`: nba, wnba, big3, world, college, **gleague**, street
- `players.json` / `questions.js`: nba, wnba, big3, world, college, **fives**, street

Two consequences, both live:
- **`fives` has no league card, so its 20 PLAYERS can never be dealt.** Its 58
  QUESTIONS are fine — `PACKS` (game.js:4070) offers them as "Early Black
  Basketball", also inside the "Hoop history" and "The whole gym" presets. So the
  split is exact: you can be ASKED about Bucky Lew and Pop Gates, but you can
  never PLAY as them. `PACKS` and `LG_LEAGUES` are separate registries and only
  `PACKS` knows `fives`. Same content H3's letter is chasing more of.
- **`gleague` has a card on the live league screen and ZERO data anywhere** — no
  player, no question, and it isn't in `PACKS` either. A promise with nothing
  behind it. Either commission a G League run or cut the card.
- Related, worth deciding with the above: `street` and `college` are in BOTH
  registries, so they are half-leagues today — askable as packs, unplayable as
  leagues. That is the same asymmetry as `fives`, just less severe because the
  card at least exists and says "in the lab."

Also note `MODES` (game.js) defines lineups for only nba/wnba/world/big3, so
unlocking college/street/fives/gleague needs a `MODES` entry each — a small code
change, but it must not be forgotten when the data lands.

**Measured era × position holes — the early game is nearly empty:**

| era | PG | SG | SF | PF | C | total |
|---|---|---|---|---|---|---|
| 1900s | 1 | 1 | **0** | **0** | **0** | 2 |
| 1910s | 2 | 2 | **0** | 1 | **0** | 5 |
| 1920s | 2 | 3 | **0** | 1 | 2 | 8 |
| 1930s | 3 | 3 | 2 | 3 | 4 | 15 |

**Three decades have no small forward at all.** Any era picker offering the
1900s–1920s cannot deal a squad. This is P6's job and it overlaps H3.

**Standing expansion dial (Aaron, 07-26 — do not forget):** future NBA/WNBA runs
chase **cult favorites, one-season wonders, and headline-makers** — the
dunk-contest guy, the playoff-run hero, the famous bust, the beloved enforcer.
Not a one-shot; another ring of depth every run.

---

# TIER 3 — HISTORY & TAXONOMY (`/deep-research`, Aaron runs these)

### H3 · BRIEF OWED — Claude writes it, Aaron runs it · Type A · TOP PRIORITY
**ACTION FOR CLAUDE (logged 07-29 at Aaron's request, not yet written):** produce
the paste-ready `/deep-research` block via the `research-brief` skill. It must carry:
- the source standard verbatim (1 Tier-1 or 2 INDEPENDENT Tier-2; Wikipedia is an
  index; statistics Tier-1 only; clickable URLs + dateChecked + sourceTier + confidence)
- **"enumerate before you narrate"** — start from the Black Fives Foundation's own
  team/player rolls and Hall of Fame membership lists, never link-following. This
  is the rule that would have caught Nera White.
- the superlative rule: every "first/most/only" needs an explicit prior-claimant
  search and must state the scope it holds in
- taxonomy guardrails: name the **Black Fives Era**; **no baseball vocabulary**
  (there was no "Negro League" in basketball); the **Original Celtics were a
  white team**; the internal tag is `fives`; Globetrotters split at 1950
- **the H1 completeness critique as required reading** — 35 named missing people
  in `docs/play/data/research-v3-critique.json`, with Black women's basketball
  before integration as the primary target: Ora Washington, the Philadelphia
  Tribune Girls, Bennett College, Tuskegee Golden Tigerettes, Philander Smith,
  Cheyney State, Isadore Channels, the Roamer Girls, Inez Patterson, Alice Coachman
- where no Tier-1 exists (most of this era), best-available + honest `confidence`,
  never faked certainty, never dropped for being hard

**Sequencing:** best sent AFTER the Black Fives Foundation letter goes out, so the
run happens under whatever terms they give — but not strictly blocked by it.

### H3 (original) · Black Fives Era deep · Type A · **highest priority of the four**
Aaron: *"this matters ALOT to me that we get this right."* 20 players, 58
questions today. Guardrails for the prompt: name the **Black Fives Era**; **no
baseball vocabulary** (there was no "Negro League" in basketball); the **Original
Celtics were a white team** (already corrected in the bank); tag is `fives`, and
the old word appears nowhere in the codebase.
Pairs with **P6** and with the **outreach letter** below.

### H2 · Early pro men's · Type A
ABL 1925–55, NBL, BAA, pre-1960 NBA. Feeds the same empty 1900s–1940s decades as
P6/H3. Also settles how the **ABA merges into `nba`** (Aaron's ruling).

### H4 · League & era model · Type A
The taxonomy run: which leagues get era pickers at all, and what the periods
are per league. **Blocked-ish on H1's decisions below.**

### H1 · Women's pre-WNBA · **gathering done, verification owed (V3)**
117 facts, 9 conflicts. Model includes a period I'd argue earns its place:
**"The Wilderness" (1982–1995)** — no American league existed, so the best
players in the world spent their primes in Italy, Spain, France and Japan.

---

# TIER 4 — CHECKING TASKS THAT AREN'T RESEARCH RUNS

These are verification jobs with legal or ethical weight. Type B unless noted.

### C1 · Team logos & player likenesses · **most likely to bite**
Names and facts in trivia: fine. **Team names/logos and player portraits in a
public app: not.** Needs an audit of every shipped asset before store listing.
More likely to produce a real letter in the next year than anything else here.

### C2 · Art & font licensing
Generator-sourced art + self-hosted fonts. Personal site vs distributed app are
different risk profiles. Confirm commercial-use rights per asset.

### C3 · "Ball Knowledge" trademark search
Before more brand is built on the name.

### C4 · Black Fives Foundation outreach · Type D (Aaron sends)
`BLACKFIVES-OUTREACH.md` is drafted as a permission request. "Black Fives" and
"Black Fives Era" are registered trademarks. **Should go out before H3**, so the
run is done under whatever terms they give.

### C5 · Gender-neutral sweep — re-check after every merge
Done once. Every new question run can reintroduce it. Add to the merge gate.

---

# DECISIONS · ✅ ALL RESOLVED 07-29 (rulings logged in BUILD.md 22q block)

1. Pre-1997 women: **draftable, marquee/greats only**, after V3 verification.
2. WNBA era picker gains **"Before the W"** (1892 → June 21, 1997, ABL included).
3. AIAW/AAU filing: **split by what the question is about** (college vs wnba).
4. Grads → `world`; Red Heads + Arkansas Travelers → `street`. League tags mean
   the COMPETITION, never the country (the Raptors principle).
5. V12 tier economy: **the honest fix** — evidence-based superstar audit +
   deep-bench growth; pack odds frozen until the pyramid is honest.
6. **Ratings are coming** → S6 and S4 are mandatory prerequisites; ratings get
   an executable spec (22t principle) before engine code.

---

# WHERE THE ORDER LIVES — and it is not in this file

**Rewritten 2026-08-07, after I got it wrong twice in one day.**

**This file is a QUEUE. It is not a plan.** It holds every research and
verification job anyone has ever noticed, written down in the order it was
noticed. That is a useful thing to have and a dangerous thing to read as a
priority list — reading the ids as a queue is how V29 nearly ended up
seventeenth.

**THE PLAN IS `V0.md` → THE ORDER, TWO TRACKS.** One home per thing, per
CLAUDE.md. If a job is between here and the twenty friends, its position is
decided there, not here.

What happened, recorded because the failure is instructive: asked to sort the
work by what should be done first, I sorted THIS file — a queue that is mostly
NOT in the launch scope — and published a competing "Rank 1, do this first"
underneath the real plan. Two plans in two files is the exact thing the top of
CLAUDE.md exists to prevent, and it took Aaron about a minute to spot.

## Which of these items are actually in the launch

V0's boundary is **NBA and WNBA only**, so most of this file is post-launch by
definition. The split, so the next session does not have to re-derive it:

**In V0 scope** (their order lives in `V0.md`, Track A):
V29 Run B · V36 · V13's remaining blocks · V15 / V35 · V17 · V19 · V20 · V22 ·
V25 · V26 · V27 · V32 · V34 · the era lookup pass

**NOT in V0** — real work, wrong side of the launch:
V28 (census) · V30 (answerability, gates the Tape's third tab) · V31 (ratings,
gates the crossover duel) · V39 in its Black Fives half · H2 · H3 · H4 · Q5 ·
P-runs beyond NBA/WNBA · C4 (the Black Fives letter — explicitly out per V0's
"NOT in V0" list)

**V39 is split and that matters.** Its *streetball and Black Fives* half is
post-launch. Its **pre-1997 women's half is IN V0**, because "Before the W"
ships as an era (V0 · D3) and that material is exactly as thinly documented.
An earlier draft of this section called V39 a blocker on the whole launch. It
is not. It blocks the "Before the W" cards and nothing else.

## The one measurement worth carrying forward

Measured 2026-08-07, `tools/gate-blockers.py`. It now lives in `V0.md` under
Gate 1, because it is a launch fact, not a queue fact:

```
 317   dealable and in scope today
 607   ceiling if EVERY readable card is verified
 393   cards that must therefore be NEWLY WRITTEN
```

**Verification is the road to 607, not to 1,000.** Every plan that says "finish
verifying, then start writing" is a dead end with a number attached.

---

## Summary count — recomputed 2026-08-07

Open items only. The July version of this table still counted V1, V2, V4 and V5
as pending; they finished on 07-29.

- **`/deep-research` runs owed by Aaron (Type A):** 7 — V29 Run B, V28, V30,
  V32, H2, H3, Q5 *(Q4 is Type A but small)*
- **Rulings owed by Aaron (Type D):** 4 — V36, V18, V21b, V23's one card.
  *(The era rule is NOT one of them — ruled 07-29, D1 / BUILD.md § 6 · 22q.)*
- **Claude verification runs (Type B):** V13's remaining blocks, V15 / V35, V17,
  V26, V34, V3, P6, P2–P8, S1, S2, S4, S6, S7
- **Claude mechanical (Type C):** V19, V20, V22, V25, V27, V39, V40
- **Checking tasks:** C1, C2, C3, C5 · **C4 is a letter and is out of V0 scope**
- **Recurring:** V6, C5

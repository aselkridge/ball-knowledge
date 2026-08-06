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
- [ ] **V25 · Reword the stale-able cards so they cannot rot at all. FIRST SLICE DONE 2026-08-06.**
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

# THE ORDER I'D ACTUALLY DO IT IN

**Phase 1 — make what's shipped defensible** *(Claude; verification research,
not discovery — no `/deep-research` run needed from Aaron)*
1. **V4** volatile index — *no sources touched*
2. ~~**V5**~~ ✅ done 07-29 — see Tier 0
3. **V1** 200 unsourced questions — verify / fix / **quarantine** *(3 outcomes)*
4. **V2** 122 unsourced players — same three outcomes; never strip a record,
   quarantine the stat block and keep the player playable on accolades
5. **Q6** era tagging — **blocked on Aaron's era rule (below)**

6. **V7+V8+V10 batched by slice** — re-source the corpus, trace every srcId,
   challenge every superlative, one pass per slice (they hit the same cards;
   doing them separately would triple the lookups). This is the long pole of
   Phase 1 — interleave it with Phase 2 rather than blocking on it.

**Then: Q8 — "the unverifiable list."** The quarantine files from V1+V2 become a
new **Type A** `/deep-research` run. This step was missing from the first draft
of this document; Aaron caught it.

### Q6 era tagging — measured feasibility, and the decision it needs

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

**Phase 2 — the run you care most about** *(Aaron + Claude)*
6. **C4** send the Black Fives letter
7. **H3** Black Fives deep — `/deep-research`, Aaron
8. **V-pass on H3** — Claude proves it before merge
9. **P6** Black Fives + streetball + Globetrotters players — Claude

**Phase 3 — close H1 and the early decades**
10. Answer decisions **1–4**
11. **V3** verify H1 → merge
12. **H2** early pro men's — `/deep-research`, Aaron
13. **P2/P3** NBA role & deep — Claude *(fills 1930s–40s holes)*

**Phase 4 — make rosters matter** *(agenda item 7)*
14. **S4** bpg — Claude
15. **S1** world stats · **S2 + Q4** BIG3 stats and questions
16. **P4** WNBA sweep · **P7** college

**Phase 5 — expansion & upkeep**
17. **Q5** off-court — `/deep-research`, Aaron
18. **H4** league/era model
19. **P5/P8** gap-fill, cult favorites dial
20. **V6** volatile refresh — recurring, 2×/year + after Finals

**Running in parallel, not blocking:** C1, C2, C3.

---

## Summary count

- **`/deep-research` runs for Aaron (Type A):** 5 — H2, H3, H4, Q4, Q5
- **Claude runs (Type B):** 17 — V1, V2, V3, V6, **V7, V8, V9, V10**, S1, S2, S4, P2–P8
- **Claude, no research (Type C):** 4 — ~~V4~~ (✅ done 07-29 — `volatile-questions.json` now builds from `tools/build-volatile-index.py`), V5, V12, Q6
- **Decisions (Type D):** 5
- **Checking tasks:** 5 — C1–C5
- **Removed as already done:** S3 college stats

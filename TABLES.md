# BALL KNOWLEDGE — THE TABLES

The data structure. This document is the source of truth for the SHAPE of the
data; `BUILD.md` stays the source of truth for everything else. It exists as its
own file, at Aaron's instruction, because the tables are brand new and all their
own.

Decided in conversation with Aaron on 2026-07-31. Decisions are also logged as
D8–D14 in `BUILD.md` §5 so the decision log stays complete in one place; the
detail lives here.

---

## 0 · The one idea everything rests on

**A column holds exactly one value.** Anything a person (or a fact) can have
SEVERAL of cannot be a column — it needs its own small table, one row per
pairing.

This is not theory. `players.json` has a single `league` column. Earl Lloyd
played in two leagues, one column cannot hold two, so he is in the file TWICE as
two unrelated strangers. Nine people are split that way. That single mistake is
what this whole restructure exists to fix, and it is the test to apply to every
new field: *can one person have more than one of these?*

    people          earl-lloyd | Earl Lloyd
    person_leagues  earl-lloyd | fives      <- two rows,
                    earl-lloyd | nba           one person

Aaron caught me violating my own rule two fields later — I applied it to leagues
and eras and then left `position` and `quality` as plain columns. Both change
over a career. Both are link tables now. If a field is ever added to `people`,
apply the test first.

---

## 1 · THINGS — each row is one real thing

### `leagues`
| column | notes |
|---|---|
| `league_id` **KEY** | `nba`, `wnba`, `college`… |
| `name` | display name |
| `plays` | `5v5-full` · `3v3-half` · `none` (can't field a squad) |
| `status` | `live` · `lab` · `hidden` |
| `first_year` / `last_year` | blank last_year = still going |
| `ball` | `classic`, `aba`, `molten`, `oatmeal`, `street` |
| `colour` | accent hex |

Replaces FOUR lists that disagreed with each other: `LG_LEAGUES` (the picker),
`MODES` (how it plays), `PACKS` (what you can bolt on), and the `league` field on
players. What that disagreement was hiding:

- **G League** existed ONLY in the picker — no players, no facts, no mode. A
  nameplate.
- **Early Black Basketball** existed everywhere EXCEPT the picker — 20 players
  and 58 facts reachable only if someone ticked it as an add-on.
- Only NBA and WNBA are unlocked. BIG3, World, College, G League and Street are
  all `lab`. BIG3 and World are gated on DATA, not code (BIG3 has no
  superstar-tier players; World has career stats for 3 of its 60) — their
  engines work. College and Street are gated on having no lineup at all.

`any` is NOT a league. It was a marker on facts meaning "universal" and it
becomes the `universal` flag on `facts`.

### `eras`
| column | notes |
|---|---|
| `era_id` **KEY** | `nba-1990s`, `wnba-1990s`, or bare `1890s` |
| `league_id` → leagues | **NULLABLE** |
| `decade` | `1990s` |

Aaron's idea, and the one that stops bad data being typeable rather than merely
detectable. A decade belongs to a league — a 1990s WNBA and a 1990s World are
different things. **`nba-1910s` does not exist as a row**, so the three Original
Celtics (Dutch Dehnert, Joe Lapchick, Nat Holman — tagged NBA + 1910s–1930s,
before the NBA existed) cannot be filed there by accident.

`league_id` is nullable because 38 universal facts carry a decade with no league
— "Who invented basketball in 1891?" is the 1890s and belongs to nobody. A bare
decade row serves those. This does NOT weaken the guarantee: `nba-1910s` still
doesn't exist.

### `people`
| column | notes |
|---|---|
| `person_id` **KEY** | `lebron-james` |
| `name` | |
| `also_known_as` | old spellings; 2 in use (JJ Redick, Goose Tatum) |
| `jersey` | |

735 people, not 744 rows. Deliberately has NO league, era, team, position or
quality column — see §0.

### `facts`
| column | notes |
|---|---|
| `fact_id` **KEY** | permanent; NEW |
| `difficulty` | 0–4 |
| `question` / `choices` / `answer` | |
| `category` | UNTOUCHED, see §4 |
| `universal` | was `l:"any"` — 165 facts |
| `goes_stale` | was `v:1` — 119 facts |
| `off_court` | own opt-in axis |
| `confidence` | `high` · `medium` · `low` — NEW |
| `date_checked` | NEW |
| `note` | optional "did you know" blurb — NEW 08-05, see below |

The permanent id is what lets two phones in an online game agree which question
they are both looking at. They currently agree by COUNTING POSITIONS IN A LIST —
insert a fact near the front and the two phones silently drift apart.

**`note` — the blurb, added 2026-08-05 on Aaron's ask.** *"A small blurb might
pop up telling the little story... this is all about learning and information
after all."* Two or three sentences of context, shown after a correct answer.

Four rules, and the first two are the ones that matter:

1. **A note is a CLAIM and needs a source like any other claim.** Gated:
   `audit.py`'s `notes_unsourced` fails if a fact carries a note without a
   `date_checked`. Ratcheted at 0 from the very first note, deliberately —
   a ratchet set after a pile exists grandfathers that pile forever. Nobody
   scores a blurb and nobody picks it in a multiple choice, so a wrong one can
   sit there for years reading beautifully. This is the field most likely to
   attract confident invention, so it is the field with the tightest gate.
2. **Optional, and most cards will never have one.** A note written because the
   column was empty is worse than no note. Write it only when the answer has a
   story the player would actually repeat to someone.
3. **Harvest it while the page is open.** A note costs almost nothing at the
   moment of verifying — the source is already open and already read. Written
   later it means re-reading everything, which is the whole cost again.
4. **It rides on the card** (`note:` in `questions.js`) rather than being
   fetched. It is two sentences and the game already loads the entire bank.

Display is a separate, unbuilt job — filed in V0.md. The field exists first so
that every verification pass from here can fill it in passing.

`confidence` and `date_checked` are new because the asymmetry was backwards:
people could say how sure we are (121 carry it) and facts — the things citing
1,326 sources that do not exist — could not. NOT the same axis as `difficulty`:
difficulty is how hard the question is, confidence is how sure we are it's true.

### `sources`
| column | notes |
|---|---|
| `source_id` **KEY** | |
| `title` / `url` / `publisher` / `date_checked` | `url` NULLABLE |
| `tier` | `1` · `2` · `3` · NULL — **BUILT 2026-08-03**, `tools/tier-sources.py` |

The worst of it. Facts carry 1,256 distinct source values; only **200 uses (149
distinct) are real links**. The other 1,326 are invented labels like
`nba-1947-first-baa-champion-warriors` that point at nothing. **87% of the bank
cites a source that was never written down.**

Label-only sources still get a row, with `url` NULL, so that (a) `fact_sources`
always resolves, (b) the gap is countable, and (c) the secret page can list
exactly which sources need a real link. Facts whose only source is a label get
`confidence: low`. **Do not invent URLs to close this gap.**

### Source tier — the spec, agreed 2026-08-03

**Where tier lives, and why only there.** A tier describes the DOCUMENT, not the
fact and not the question. Basketball-Reference is Tier 1 whatever you look up on
it; Wikipedia is Tier 3 whatever you look up on it. It never varies fact to fact,
so it belongs on `sources` and nowhere else. Putting it on a fact or a card would
mean writing the same answer down hundreds of times and watching it drift.

> **Two different things in this repo are called "tier". Do not confuse them.**
> **Player tier** — `superstar`/`allstar`/`starter`/`role`/`deep`, lives in
> `person_quality`. BUILT and filled; it drives pack rarity and the Heat Check
> pool. **Source tier** — this. The rule was written in
> `DEEPRESEARCH_KNOWLEDGE.md` §"the source standard" and the todo table has
> counted its absence as R3 since R0 shipped, but **the column has never
> existed**: 0 of 2,063 source rows carry a `tier` key, which is exactly why all
> 513 R3 rows fail. The rule and the counter were built. The storage was not.

**The values**, straight from the standard — this table restates, never redefines:

| tier | what it is | what ONE gives you |
|---|---|---|
| **1** | record of fact — Basketball-Reference, official league archives | proven on its own |
| **2** | reputable secondary — named journalism, named historians | NOT enough alone; needs a second, INDEPENDENT one |
| **3** | index — Wikipedia and the like | never enough, alone or stacked |

**The fact's verdict is CALCULATED, never typed.** `facts.confidence` already
exists and is already rule-driven (label-only source → `low`, which is why
exactly 1,326 facts read `low` — the same 1,326 label-only sources counted
above). This spec replaces that crude rule with the standard:

    any Tier 1 attached                     -> high
    2+ Tier 2 from DIFFERENT publishers     -> high
    exactly 1 Tier 2                        -> medium   (needs a second)
    only Tier 3, at any count               -> low      (never ships)
    no source, or label-only                -> low

"Independent" is judged by `publisher`, which already exists and is filled on 956
of 2,063 rows. Two Tier 2s from the SAME publisher do not count as two — that
pair is flagged for a human rather than passed quietly.

**The question inherits and stores nothing.** A card points at a fact. Fact
`high` -> the card may ship. That is the verified-pack gate, already built.

**Two sources on one fact needs no new structure** — `fact_sources` is a join and
has always allowed it. But measured 2026-08-03: **every one of the 1,526 facts has
exactly one source row. Not one has two.** So Tier 2 is currently unreachable for
the entire bank: the rule needs two and nothing has two. Today only a single
Tier 1 can produce `high`. That is the honest state, and it is the reason R1's
re-link matters — it is what puts a second row within reach.

**The trash path is a verdict, not a table.** A fact whose sources are all Tier 3
and for which no better source is found stays `low`, never passes the gate, and
appears in the todo table until it is either re-sourced or deleted. Nothing gets
silently dropped and nothing gets silently shipped.

**BUILT 2026-08-03 — the measured result.** `tools/tier-sources.py` (dry-run by
default) tiers a source ONLY where the standard names that publisher, and leaves
everything else NULL rather than guessing:

| | at first build | now (after R1 + spot-check + the register) |
|---|---|---|
| Tier 1 | 523 | **582** |
| Tier 2 | 22 | **237** |
| Tier 3 | 247 | **860** |
| NULL — label-only, no url to judge | 1,107 | **376** — R1 recovered the rest |
| NULL — a url the standard does not name | 8 | **8**, across 3 sites — genuinely unknown, listed by the script |

Facts: **213 high · 173 medium · 1,140 low** (first build: 151 · 8 · 1,367). So
**213 of 1,526 facts can ship** on the standard as written. That is the honest
number and it is the point of the exercise. R3 fell 513 → 3.

Re-run `python3 tools/tier-sources.py` before quoting any of these. Every number
in this table came out of that script, not out of an estimate.

Confidence is computed inside `tables-build.py` on every build rather than
written once, because a value written once is a value a rebuild reverts — the
first version of this change did exactly that and 151 high facts dropped back to
low without a word.

Nothing about gameplay changed: `tables-emit.py --check` reports the rebuilt
game files IDENTICAL. Tier and confidence are editorial metadata; no card moved.

**WHERE A RULING LIVES — Aaron's question, 2026-08-03.** He asked why erasing
the stored tiers changed nothing, and he was right to. The `tier` column is a
SAVED COPY; the record is the publisher map in `tools/tier-sources.py`, which
recomputes from the url every run. So:

> **Rulings go in the MAP, never in the column.** A tier typed into
> `sources.json` by hand is overwritten on the next run and is not a decision,
> it is a note that will be lost. To rule that Washington Post is Tier 2, add
> it to the map.

`tables-verify.py` now FAILS if the stored column and the map disagree, so the
copy can never quietly drift from the record. Proven: erasing the tier from all
423 basketball-reference rows fails that check with the count and an example.

**WHO SORTS A SITE INTO A TIER — settled 2026-08-03.** Aaron: *"how am I
supposed to determine the validity of 230 websites? I am not some database, I'm
just a guy building a game."* He was right and the previous ask was wrong.

The standard does not name individual sites; it names CATEGORIES — official
record books, journalism with editorial standards, fan databases and blogs.
**Sorting a named site into one of those is research, and research is the
assistant's job.** Refusing to do it was not caution; it was handing over 127
judgement calls to the person least equipped to make them.

The line that still holds: **inventing a category** would be overstepping;
**applying his categories** is not. Anything genuinely contested stays NULL and
gets named, and 3 sites do (`kosmagazin.com`, `archivio.playitusa.com`,
`wda.do` — 8 sources, all safely `low` until identified).

**SPOT-CHECKED 2026-08-03, and it found real errors.** Aaron asked what research
backed those rulings. The honest answer was NONE — they were pattern-matched
from prior knowledge with no page ever opened. So the 43 facts resting on them
were checked by actually fetching the cited pages:

- ✅ `springfield.edu` — institutional archive, documents the 13 rules and the
  peach baskets from its own holdings. Correct Tier 1.
- ❌ `big3.com/news/via-doombot-blog-the-basics-of-the-big3/` — a **guest blog
  post bylined "DOOMbot", by a member of an NFT community**, sitting on the
  league's own domain. Domain-level tiering called it a record of fact.
- ⚠️ `guinnessworldrecords.com` — a real record entry with the right figure
  (456 blocks, Mark Eaton) but it **names no source for the NBA statistic**. It
  is repeating the league's number, not holding it. The standard says statistics
  are Tier 1 only; Guinness is not that record. **Demoted to Tier 2.**
- ⚠️ `olympics.com/en/news/...` — editorial features, not results tables.

**The lesson: AN OFFICIAL DOMAIN IS NOT AN OFFICIAL DOCUMENT.** The standard
tiers documents, so the map now reads the PATH too: on an official site a
results/records/history/athlete page is the record, while `/news/`, `/blog/`,
`/story/`, `/feature`, `/opinion/` is that body's journalism — Tier 2 at best.

Cost of being right: shippable facts **301 → 216**. Facts resting on an
unverified judgement of mine: **43 → 16**, and those 16 are official results
pages, athlete profiles, hall-of-fame inductee pages and club history.

**A SECOND FAILURE MODE TIERING CANNOT TOUCH.** `big3.com/leadership/` is a
legitimate official page and correctly Tier 1 — and it is cited for *"Big3 games
are played in what format?"*, which a leadership page does not answer. Same
shape as the Red Auerbach card citing a Phil Jackson biography. **Tiering fixes
how good a source is; it cannot fix whether that source is about the fact.**
Only reading each page against its own fact catches that, and nothing in this
structure does it yet.

### `source_register` — one site, many tiers (Aaron's idea, built 2026-08-04)

Aaron, 2026-08-03: *"does tier two go on both sources? Does two sources get tied
to one fact?"* — and then the better idea underneath it: **a site is not one
tier.** The spot-check above had already proved it twice on official domains
before anyone wrote it down.

`docs/play/data/tables/source_register.json` is that idea as data. One row per
site we actually lean on, and inside it a rule per SECTION:

| column | notes |
|---|---|
| `site` | bare host, matched on the domain and its subdomains |
| `name` / `run_by` | who publishes it, in plain words |
| `covers` / `good_for` | which leagues, and what it is the right source FOR |
| `default_tier` | used when no section rule matches |
| `sections[]` | `match` (path fragment) · `tier` · `is` (what that section IS) · `note` (how to cite from it) |
| `watch_out` | the trap on this specific site |

**It is a navigation guide, not just a lookup.** `is` and `note` are there so the
next research run knows that a Basketball-Reference *player* page backs a career
number while a *leaderboard* page backs "who leads all time" and needs `v:1`.

**Two layers, in order.** The register is the authority; the flat map in
`tools/tier-sources.py` is the fallback for the long tail. Measured 2026-08-04:
14 sites and 40 section rules decide **1,408 of the 1,687 sourced rows (83%)**;
the flat map decides the remaining 271 across 127 sites. The script prints that
split every run, so promoting a long-tail site into the register is a visible
move rather than a silent one.

**Matching is anchored to path segments, and here is why that line exists.** The
first run of this matched `match` as a plain substring, so NBA.com's `/history`
rule fired inside the *slug*

    nba.com/news/history-3-pointer-evolution-larry-bird-stephen-curry

— a news feature — and longest-match-wins handed it Tier 1. Shippable facts went
**216 → 226**, and a rule written to be STRICTER made ten facts look better than
they were. Rules now have to consume whole `/segments/`. Direction of travel is
the tell: a tightening that raises the pass count is a bug until proven otherwise.

**Being registered must never mean being judged softly.** A registered Tier 1
site whose path matches no section falls to `default_tier`, which skipped the
editorial path check — `nba.com/article/2017/09/11/morning-tip-...` came back
Tier 1 purely because the register had no `/article` rule. There is now a
backstop: unruled + Tier 1 + editorial-looking path → 2. An EXPLICIT section
ruling is still trusted as written, which is how `big3.com/news/` holds at 3.

**Pinned so it cannot come back.** `python3 tools/tier-sources.py --selftest`
checks 12 real urls whose expected tier was set by opening the page, and
`tables-verify.py` runs it on every data change. Break-it-on-purpose, 2026-08-04:
reverting the anchoring fails it, deleting the backstop fails it, deleting the
register file stops the run with a readable message instead of silently
downgrading 1,408 rows. The backstop case is marked SYNTHETIC in the file —
**0 rows in the bank exercise it today**, and it was added precisely because
removing the backstop still scored 11/11.

Net effect on the bank: shippable facts **216 → 213**.

**ONE ROW PER DOCUMENT — fixed 2026-08-04 (`tools/split-multi-source.py`).** 40
source rows held two or more urls crammed into a single `url` field. The rule for
this table is now literal: **a source row is one document.** The first url stayed
on the original row so no join moved and no card's visible source changed; each
additional url became its own row, reusing an existing row where that url was
already in the table (22 of 46 were). Human prose around the urls was parked in
`title` rather than deleted — `emit` reads `url or title`, so a row with a url
never shows its title and nothing reaches the game.

Worth keeping in mind when reading the 40: **29 were corroboration** (different
publishers backing one claim) and **11 were comparison** (one publisher, several
pages, because the fact compares several players). Only the first kind can move a
fact's confidence, because independence is judged on DISTINCT `publisher`.

### One card, many leagues — supported, used, and silently dropped (08-04)

Aaron, 08-04: *"can't cards have two tags if they existed in both leagues or
eras? Why is this a question?"*

He was right, and asking it found a live bug. `fact_leagues` is a JOIN and has
always allowed many leagues per fact. **Sixty facts already use it** — every one
of them `flags` + `overseas`, which is correct: an Olympic card about Dirk
Nowitzki belongs to both the international game and to club ball abroad.

But `questions.js` has ONE league box, so `tables-emit.py` writes `lg[fid][0]`
and **the second tag has been dropped on every build**. The comment at that line
claimed the opposite — *"nothing has multiple yet, so this is lossless today"* —
which was true when written and has not been true for a while. Nothing broke
loudly because both leagues involved are outside V0 scope.

**Impact on the daily today: none.** Measured — 0 facts where an `nba`/`wnba` tag
sits anywhere but first, so nothing is wrongly excluded. This is a structural
bug, not a live one.

**Why it matters anyway.** It is the reason re-tagging the V19 cards keeps
looking like a forced single choice. A FIBA rules card is genuinely `flags` AND
`overseas`, because FIBA writes the rules for both. A Globetrotters card is
genuinely `fives` AND `street`. The moment the game reads all of a card's
leagues, those stop being either/or questions and become simple facts.

**The fix, scoped.** Eight places read a card's league (`grep "\.l||'any'"` —
6 in game.js, 1 in daily.js, 1 in the emitter). Backwards-compatible shape: keep
`l` as the primary and add `ls` only when a card has more than one, then teach
those eight reads to check `ls || [l]`. Small, and it should land before the V19
re-tag rather than after, or the re-tag has to be redone.

**Still open.**
- Two-source coverage is still almost nothing: **1,515 facts have exactly one
  source, 8 have two, 3 have four**, and only 4 facts draw on more than one
  publisher. The "2 independent Tier 2" path fires for a handful instead of for
  nothing — that is R1 and sourcing work, not a gap in this structure.
- 3 sites still unruled (`kosmagazin.com`, `archivio.playitusa.com`, `wda.do`).

### `teams`
`team_id` **KEY** · `name`. 337 distinct strings today, typed free-hand onto
players, so "Lakers" and "Los Angeles Lakers" are different teams as far as
anything can tell. Near-duplicates are REPORTED, never auto-merged.

### `packs`
`pack_id` **KEY** · `name` · `colour`. Aaron's call: its own table, not a flag on
`leagues`, so a pack can later be something other than a whole league — a themed
set, a decade, a run of facts — without inventing a fake league to hold it.

---

## 2 · LINKS — each row joins two things

This is where "belongs to more than one" lives, and every one of these is a join
the secret page can follow.

| table | columns | why it exists |
|---|---|---|
| `person_leagues` | person → league | Earl Lloyd is Early Black Basketball AND NBA |
| `person_eras` | person → era | era already knows its league, so a bad pair can't be written |
| `person_positions` | person → position, **league**, era NULLABLE | Magic is filed `PG` — the man who played centre in the 1980 Finals |
| `person_quality` | person → quality, **league**, era NULLABLE | 189 people span 3+ decades on ONE rating |
| `person_teams` | person → team | |
| `person_sources` | person → source | replaces TWO unreconciled fields: `statSource` (one link, 736 people) and `sources` (a list, 92) |
| `fact_leagues` | fact → league | 80 facts are filed under one league while plainly about another |
| `fact_eras` | fact → era | Larry Brown is College-1980s AND NBA-2000s |
| `fact_people` | fact → person | already exists, already works — drives the 3x roster draw |
| `fact_sources` | fact → source | both directions were broken, see below |

**On `fact_sources`.** Aaron asked whether a source can have many facts. It
already does — 226 source values are used by more than one fact, 496 facts share
a source with another (the Basketball Reference MVP page is cited by 7). But it
only works by accident: the source is retyped as text on each fact, so two facts
"share" one only if someone typed the identical string twice. Fix a typo in one
and they silently stop being the same source. The other direction — one fact
citing two sources — is impossible today, because there is one box.

**On `person_positions` and `person_quality`.** Both carry a `league_id` as well
as an era, and the league one is NOT hypothetical — building the tables proved
the variation is already in the data, hidden inside the duplicate rows:

    tom-gola      quality  college=allstar    nba=starter
                  position college=SF         nba=SG
    bill-walton   quality  college=superstar  nba=allstar

**Six of the nine duplicated people already disagree on quality across their two
leagues, and Tom Gola disagrees on position too.** That was real signal nobody
could see, because it was sitting in two rows that looked like two different
men. It is now first-class.

`era_id` stays NULL on first build, meaning *"applies to their whole career, not
yet broken down"*. Deliberate: writing today's single value onto every era would
assert that Allen Iverson was a superstar in the 2010s, which is false. NULL says
the work is undone and leaves it countable (744 rows each).

`person_stats` carries `league_id` for the same reason — Walton's college and NBA
careers are different numbers and would otherwise be indistinguishable.

**A warning for whoever extends the build.** The first version of
`tables-build.py` looked perfectly healthy by row count and had silently dropped
38 accolades and Walton's entire college career, because it processed only the
FIRST record of anyone holding two. Row counts do not catch that.
`tools/tables-verify.py` does, and it must stay passing.

---

## 3 · DETAIL

### `person_stats`
`person_id` → people · `kind` (`career` · `peak` · `high` · `era`) · `era_id` →
eras (when kind = `era`) · then one column each:

`ppg` 608 · `games` 568 · `rpg` 563 · `apg` 500 · `points` 460 · `fg_pct` 444 ·
`ft_pct` 432 · `bpg` 327 · `spg` 317 · `fg3_pct` 286

(those counts are how many people have each — the availability marker Aaron
asked for. Blocks per game is missing for 423 people; 8 have no stat source.)

Plus `covers` (free text), `source_id` → sources, `confidence`, `date_checked`.

`covers` matters more than it looks. Oscar Schmidt's reads: *"WARNING: this
games/average pair goes with 42,044 points, NOT the 49,737 already on file."*
That is a real trap and it needs somewhere to live.

**`kind: era` is the prerequisite for D7 (player ratings).** How is `superstar`
decided today? By hand — nothing computes it, someone typed it. D6 already calls
for an evidence-based audit and D7 names per-era stat packages as mandatory.
Once stats are bucketed per era, quality can be DERIVED instead of asserted, and
`person_quality` is per-era so the derived value has somewhere to land. This
table is the prerequisite for that job, not the job.

### `person_awards` / `person_award_years` / `person_notes`

Aaron asked whether every accolade can be split. **No — and that changes the
answer.** Of 2,446 accolades only ~55% are awards. The other ~44% is prose that
columns would destroy:

> "Mustachioed mid-major folk hero of the mid-2000s"
> "Feared shot-blocking big man of 1980s New York playground ball"
> "First woman to sign an NBA contract (Indiana Pacers tryout, 1979)"

So it is TWO tables, not one split table. Forcing the second kind into
award/year/count columns would mangle them or quietly bin them, and they are some
of the best writing in the database.

- **`person_awards`** — person → award · `times_won` · league NULLABLE. ONE ROW
  PER AWARD PER PERSON, so someone with All-Star, MVP and two championships has
  three rows. `times_won` is the `8x` in "8x All-Star" — 592 accolades are
  written that way.
- **`person_award_years`** — award_row → year. Of those 592, only **153 list
  their years**, and **57 of those already cross a decade boundary**. So years
  are rows, and the era follows from the YEAR, not from the person. Honest
  consequence: the other **439** have no years recorded anywhere and can be
  counted but NOT filtered by era. The secret page must say so rather than
  quietly dropping them.
- **`person_notes`** — person → text, kept exactly as written.

---

## 4 · Deliberately NOT in scope

**Category / topic / competition.** Aaron: *"Lets have a seperate planning
conversation about the category/topic/competition fields, because thats
confusing."* The `category` column is carried through UNCHANGED and untouched.

For that future conversation, the problem in numbers, re-counted 2026-08-04:
`category` is free text with **191 distinct values across 1,526 cards — 47 used
exactly once and 105 used three times or fewer**. Obvious drift on top of that:
`Deep Cut`/`Deep Cuts`, `Stats`/`stats`, `MVP`/`MVPs`, `Famous Courts`/`Famous
courts`, `Finals`/`The Finals`/`Finals Records`/`Finals Moments`, plus one-offs
(`Coach K`, `Yao Ming`, `Fab Five`, `The Shot`, `Hardware`). It cannot currently
be used to filter or balance anything.
**Safe today**: `category` is display-only — one read site, `game.js:3463`, which
prints it on the card face. Nothing selects, balances or gates on it, so the mess
is cosmetic until the moment someone tries to use it.
Recount, or see it live in The Tape as `facts count by category`:
```
python3 -c "import json,collections;F=json.load(open('docs/play/data/tables/facts.json'));c=collections.Counter(f.get('category') for f in F);print(len(c),'distinct;',sum(1 for v in c.values() if v==1),'used once;',sum(1 for v in c.values() if v<=3),'used <=3')"
```

**No alias/forwarding system for fact ids.** Aaron asked whether it was needed
with three players and no saved games. It is not — verified: the game persists
only court choice, team colours, a room password and a rejoin code. NOTHING
saved references a fact. Ids are assigned once and frozen; if we ever break that
rule we deal with it then. (`also_known_as` on `people` is different — it carries
two REAL merges, not a hypothetical.)

---

## 5 · The secret page

The payoff, and the reason the structure has to come first. A stripped-down
Looker for the basketball data: pick a table, filter, sort, and **join across the
links** — every arrow in §2 is a join you can follow. Aaron's examples: every
World player with no stat source; every fact about someone on the Lakers; every
source cited more than five times and what cites it.

Unbuildable on the current two flat files, because there is nothing on the far
end of the join to land on.

---

## 6 · How new research gets in (THE ONLY WAY)

    python3 tools/ingest.py <research-file.json>          # dry run, writes nothing
    python3 tools/ingest.py <research-file.json> --apply  # into the TABLES
    python3 tools/tables-emit.py                          # ALWAYS, or the game runs stale

`tools/ingest.py` is run-agnostic — hand it any research file in the shape
researchers already deliver (`players` and/or `questions` lists). It carries the
gates the old merge scripts established, because they were earned:

- schema: difficulty 0–4, a known league, exactly 4 distinct options, a `?`
- **`c[0]` arrives correct**, gets shuffled, and `a` records where it landed
- seeded, so the same input always gives the same result
- the verifier's **`kills` are dropped and its `fixes` applied first** — fixes
  come first because one may repair the very field a gate checks (16 of run 3's
  37 fixes rewrite the question text, which then correctly dedupes)
- dedupe on exact question stem; a person already present is never duplicated
- a fact with no real source link is ingested at `confidence: low` with its
  label kept. **It will not invent a URL to dodge that.**

**The six `merge-*.py` scripts are dead.** Each targeted one already-merged
research file and wrote straight to `players.json` / `questions.js`, which are
build output now — anything they wrote would be wiped by the next emit. All six
carry a DO-NOT-RUN banner and are kept only as the record of how those runs were
merged.

**Person ids come from `bkid.slug`, never from a copy of it.** `tables-build.py`
has its own slug for teams and sources that follows a *different* rule
(it strips punctuation; bkid turns it into a hyphen). `ingest.py` originally
copied that one to mint person ids and would have created `jj-redick` beside the
real `j-j-redick` — re-splitting the very person the migration merged. It now
imports bkid and, better, **looks people and teams up by name first**, because a
lookup cannot drift from however the id was originally made and a recomputation
always can.

## 7 · Build order

1. `tools/tables-build.py` — read `players.json` + `questions.js`, emit the
   tables to `docs/play/data/tables/`.
2. Tables become the SOURCE OF TRUTH; `players.js` / `players.json` /
   `questions.js` become generated build output, so the game keeps working
   unchanged and the restructure provably changes no gameplay.
3. Shuffle the squad fill order (D13).
4. Gate checks: every link id resolves on both sides, no orphans, generated files
   match the tables. Ratchet, then prove the gate FAILS on an injected break.

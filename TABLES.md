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

The permanent id is what lets two phones in an online game agree which question
they are both looking at. They currently agree by COUNTING POSITIONS IN A LIST —
insert a fact near the front and the two phones silently drift apart.

`confidence` and `date_checked` are new because the asymmetry was backwards:
people could say how sure we are (121 carry it) and facts — the things citing
1,326 sources that do not exist — could not. NOT the same axis as `difficulty`:
difficulty is how hard the question is, confidence is how sure we are it's true.

### `sources`
| column | notes |
|---|---|
| `source_id` **KEY** | |
| `title` / `url` / `publisher` / `date_checked` | `url` NULLABLE |

The worst of it. Facts carry 1,256 distinct source values; only **200 uses (149
distinct) are real links**. The other 1,326 are invented labels like
`nba-1947-first-baa-champion-warriors` that point at nothing. **87% of the bank
cites a source that was never written down.**

Label-only sources still get a row, with `url` NULL, so that (a) `fact_sources`
always resolves, (b) the gap is countable, and (c) the secret page can list
exactly which sources need a real link. Facts whose only source is a label get
`confidence: low`. **Do not invent URLs to close this gap.**

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

For that future conversation, the problem in numbers: `cat` is free text with
~180 distinct values and obvious drift — `Deep Cut`/`Deep Cuts`, `Stats`/`stats`,
`MVP`/`MVPs`, `Famous Courts`/`Famous courts`, `Finals`/`The Finals`/`Finals
Records`/`Finals Moments` — plus one-offs used a single time (`Coach K`,
`Yao Ming`, `Fab Five`). It cannot currently be used to filter or balance
anything.

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

## 6 · Build order

1. `tools/tables-build.py` — read `players.json` + `questions.js`, emit the
   tables to `docs/play/data/tables/`.
2. Tables become the SOURCE OF TRUTH; `players.js` / `players.json` /
   `questions.js` become generated build output, so the game keeps working
   unchanged and the restructure provably changes no gameplay.
3. Shuffle the squad fill order (D13).
4. Gate checks: every link id resolves on both sides, no orphans, generated files
   match the tables. Ratchet, then prove the gate FAILS on an injected break.

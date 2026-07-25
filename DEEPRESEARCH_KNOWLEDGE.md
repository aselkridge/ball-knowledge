# Ball Knowledge — Deep Research: the trivia ENGINE (corpus + questions)

This is not a one-shot question dump. Ball Knowledge ships **new question packs
forever** — every release expands the game. So this pull has to hand back **two
things**: (1) a reusable **research corpus** of sourced facts I can mine to write
new questions later, and (2) a first batch of finished questions. The corpus is
the gold — questions are infinite, but only if the underlying facts are on file,
organized, and de-dup-able.

Paste everything in the box into **/deep-research**. Run it once per league
section if it caps out — each section stands alone.

---

> **You are building the permanent knowledge base for a basketball trivia game
> that will release new question packs indefinitely. Return BOTH of the following.**
>
> ## PART 1 — THE RESEARCH CORPUS (the important part)
> A large, organized, **fact-checked** knowledge base of basketball facts, so a
> writer can generate hundreds of NEW questions later without re-researching and
> without repeating. Structure it as JSON:
> `{"id":"unique-slug", "league":"nba|wnba|world|negro|college|big3|street|any", "era":"1940s..2020s|alltime", "topic":"champions|mvps|records|drafts|moments|nicknames|rules|olympics|streetball|...", "subject":"the player/team/event this fact is ABOUT", "fact":"one verifiable fact stated plainly", "source":"where it's verified", "difficulty":1-4}`
> - **`id` is a unique slug** (e.g. `nba-1996-draft-kobe-13th`) — this is the
>   **de-dup key**. Never emit two facts with the same id; when I generate a
>   question from a fact, I record its id so future packs skip it.
> - **`subject`** lets the same TYPE of question be re-asked about a different
>   player without repeating (e.g. career-scoring-leader by decade).
> - Go **deep and wide**: hundreds of facts. The more granular, the more
>   questions we can mint later.
>
> ## PART 2 — A STARTER QUESTION BATCH
> From the corpus, write as many finished multiple-choice questions as you can
> (aim 150+), each:
> `{"t":1-4, "l":"<league>", "cat":"<category>", "q":"<question?>", "c":["correct","wrong","wrong","wrong"], "srcId":"<corpus id it came from>"}`
> - **Correct answer is ALWAYS `c[0]`** (I randomize order). Wrong answers must
>   be plausible.
> - `srcId` links each question to its corpus fact (my de-dup guarantee).
> - One sentence each. No question reveals its own answer. No duplicates.
>
> ## PART 3 — THE PLAYER DATABASE (EVERY player ever — for the squad/card system)
> The game deals squads and collectible player cards, so I need the FULL player
> population, **not just stars**. Return every notable player you can find across
> all leagues & eras — superstars AND all-stars AND ordinary starters AND role
> players, journeymen, bench guys, one-year cups of coffee. The deep bench is the
> POINT: commons make the stars feel rare. As JSON:
> `{"id":"slug", "name":"", "league":"nba|wnba|world|college|street|negro", "eras":["1990s","2000s"], "teams":["CHI","WAS"], "pos":"PG|SG|SF|PF|C", "tier":"superstar|allstar|starter|role|deep", "num":23, "traits":["scorer","lockdown-D"], "career":{"g":1072,"mpg":30.1,"ppg":22.5,"rpg":6.2,"apg":5.3,"spg":1.6,"bpg":0.8,"fg_pct":0.504,"fg3_pct":0.345,"ft_pct":0.735,"pts":32292}, "peak":{"season":"1996-97","ppg":29.6,"rpg":5.9,"apg":4.3}, "highs":{"pts":69,"reb":23,"ast":17}, "advanced":{"per":27.9,"ws":214.0}, "accolades":["6x champ","5x MVP","10x scoring title"]}`
> - **`tier`** is the card-rarity driver: `superstar → allstar → starter → role →
>   deep`. Be honest & granular — a whole league has only a handful of superstars;
>   most players are `starter`/`role`/`deep`. This tiering is what makes packs feel
>   earned (a Legendary pack = several superstars; a Common pack = one star + role
>   players).
> - **`pos`** = primary position (PG/SG/SF/PF/C); note a secondary in `traits` if
>   they swing. Every dealt squad needs **one player per position**, so I need
>   deep coverage at EVERY position in EVERY era — not just the famous names.
> - Include the streetball/AND1/Rucker legends and Globetrotters here too (league
>   `street`), and college stars (`college`) — with tiers.
> - **STATS ARE DUAL-PURPOSE — capture REAL numbers, not vibes:** they (a) seed
>   trivia questions (career/season/single-game numbers, leaders, splits) AND (b)
>   are what I derive each player's in-game **card ratings** from (shooting /
>   defense / handles / rebounding / playmaking) plus the stat line printed on the
>   card. So for every player give, at minimum: **career averages** (ppg/rpg/apg/
>   spg/bpg + FG% / 3P% / FT%), **career totals** (games, points), a **peak season**,
>   and **notable single-game highs**. Advanced (PER / win shares) where known.
>   Fact-check the numbers — wrong stats poison both the questions and the ratings.
> - **Breadth over polish**: hundreds/thousands of players; the journeymen matter
>   as much as the legends.
>
> ## DIFFICULTY — it scales to INFINITY, use all four tiers
> - **t:1 easy** — a casual fan gets it (but never insultingly obvious).
> - **t:2 medium** — a real fan.
> - **t:3 hard** — a historian / deep cut.
> - **t:4 IMPOSSIBLE** — ultra-obscure, the "how many points did this role player
>   average in his 1974 rookie season" tier. These are for players who WANT the
>   game brutal. Tag them honestly; supply plenty.
>
> ## COVER EVERYTHING (spread all 4 tiers across each):
> 1. **NBA** — every decade 1946→today: champions & Finals MVPs, MVPs, stat
>    leaders (pts/ast/reb/stl/blk, single-game & career), iconic games/shots,
>    dynasties, trades & drafts, relocations, nicknames, records, rookies,
>    coaches, rivalries, the ABA.
> 2. **WNBA** — 1997→today: champions, MVPs, scoring leaders, dynasties
>    (Comets, Lynx, Aces), expansion, Olympians, #1 picks, firsts, records.
> 3. **International / Olympics / FIBA** — men's & women's Olympic golds by year
>    & host, World Cup winners & MVPs, EuroBasket, the 1972 final, Dream Team,
>    Redeem Team, the great non-American stars & their nations.
> 4. **Negro Leagues & pre-integration history** — the New York Rens, original
>    Celtics, Harlem Globetrotters history, Black Fives pioneers, the first
>    Black NBA players (Lloyd, Cooper, Clifton), integration milestones.
> 5. **College** — NCAA champions & title-game moments (men's & women's), UCLA's
>    run, legendary coaches, stars pre-pro, March Madness upsets, the Final Four.
> 6. **Big3** — founders, format, champions, notable vets, the 4-point circles.
> 7. **STREETBALL & playground legends** — this is its own pillar; do NOT skip it
>    or fold it into "history." Cover explicitly:
>    · **Rucker Park** (Harlem) — the tournament, its playground legends (Earl
>      "The Goat" Manigault, Joe "The Destroyer" Hammond, Pee Wee Kirkland,
>      Herman "Helicopter" Knowings) AND the pros who played there (Wilt, Kareem,
>      Dr. J, Kyrie, Durant, Nate Robinson).
>    · **AND1 Mixtape Tour** — the era, the mixtapes/DVDs, and its stars (Rafer
>      "Skip 2 My Lou" Alston, Hot Sauce, The Professor, AO, Main Event, Escalade,
>      Half Man Half Amazing).
>    · **Harlem Globetrotters** — as streetball/entertainment icons: signature
>      routines, famous members (Goose Tatum, Curly Neal, Meadowlark Lemon,
>      Wilt's stint), the Washington Generals.
>    · **Famous courts & culture** — Venice Beach, The Cage / West 4th St (NYC),
>      Dyckman, streetball moves & lingo, mixtape era, playground-to-pro stories.
> 8. **Rules & universal** — dimensions, shot clock, violations, origin
>    (Naismith, peach baskets), positions, scoring, fouls.
> 9. **…and any category you discover** — this list is the FLOOR, not the ceiling.
>    If you hit a rich vein I didn't name (G League, EuroLeague/EuroBasket clubs,
>    coaching trees, broadcasting/announcers, sneaker & shoe history, specific
>    dynasties, halls of fame, awards beyond MVP, etc.), ADD it as its own
>    category and go just as deep. Do not limit yourself to the eight above.
>
> Season it with **fun/legendary** facts too: dunk & three-point contest winners,
> All-Star moments, jersey numbers, arena names, famous injuries/comebacks,
> one-game explosions.
>
> **Fact-check every single item. Prefer specific, dateable facts. No filler.**

---

## What I do with the return
1. Store the **corpus** JSON in the repo (`questions-corpus.json`) — the permanent
   fact base. Each release, I mine unused corpus ids into a new pack.
2. Validate & load the **starter questions** into `questions.js` (format, exactly
   one correct, no dupes vs the 200 already live).
3. Stand up **t:4 "Impossible"** as a real difficulty (feeds the hardest cards +
   a future "Historian" difficulty setting).
4. Promote **negro**, **college** & **street** (Street Legends) to selectable leagues.

The corpus is what makes "new question pack every release" real — questions are
infinite, the fact base is the engine.

---

# HOW THE PLAYER DATABASE GROWS — the multi-run playbook

**The rule of thumb Aaron needs: one research run ≈ 300–450 verified player
records.** "Every player ever" is thousands — it is ACCUMULATED across many
runs, not pulled in one. Each run researches a SLICE, the results merge into
one growing file, and the id/name dedupe guarantees runs only ever ADD.

## The loop (every run, same shape)
1. **Pick a slice** from the queue below (one league/era/tier band).
2. **Run it** — tell Claude "run the player-DB research on <slice>". Claude
   fans out researchers + adversarial stat-verifiers (the PART 3 rules above
   are baked in: honest tiers, ≥40% starter/role/deep, never-guess stats).
3. **Merge** — new records append into `docs/play/data/players.json`;
   duplicates (same name+league) are dropped, richer record wins.
4. **Audit** — after each merge Claude reports: total players, tier spread,
   position coverage per era (any PG-less decade = a gap for the next run).
5. **Wire-in is automatic** — the squad reveal + card systems read
   players.json; every run makes packs/questions richer with zero code changes.

## The run queue (build order toward the vision)
- ✅ **Run 1 — FOUNDATION** (this run): all leagues/eras at starter depth,
  ~350-450 players. Makes tiers/packs real.
- **Run 2 — NBA role & deep, '80s-'00s**: the connective tissue of the great
  teams (commons that make stars rare).
- **Run 3 — NBA role & deep, '50s-'70s + '10s-'20s**: same for the bookends.
- **Run 4 — WNBA full sweep**: every era, all positions, starter→deep.
- **Run 5 — World/FIBA deep**: EuroLeague icons, Olympic rosters, women's
  international.
- **Run 6 — Streetball + Globetrotters + Negro Leagues deep**: the culture
  pillar at full depth.
- **Run 7 — College icons** (college-stat identities, men's + women's).
- **Run 8+ — gap-filling**: whatever the audits flag (thin positions/eras),
  then refresh runs for current seasons (rookies, tier promotions).

## Rules that keep the database healthy
- **Never guess stats** — a run that returns fewer, verified players beats a
  big sloppy one. Verifiers exist to refute, not confirm.
- **Tier honesty is the economy** — superstar inflation breaks pack rarity.
  The audit's tier-spread check is the guardrail (superstars should be the
  SMALLEST tier).
- **Slices stay narrow** — "NBA '90s role players" out-performs "more NBA."
- Wrong data found later? Fix the record in players.json directly — it's the
  single source of truth for squads, cards, and stat questions.

---

# VOLATILE FACTS — how we keep the bank from going stale

Some answers change. "How many rings does LeBron have?" is true until it isn't;
"most threes in a season" is true until someone breaks it. These are **volatile**
facts, and if we don't track them the bank quietly rots — players get marked
WRONG for knowing something *more* current than the game does. That's the worst
possible failure in a knowledge game.

## The rule
Every corpus fact and question carries a **`volatile`** flag:
- `volatile: true` → the answer can change with time. Active-player career totals,
  "most ever" records under active chase, current champions/MVPs, active ring
  counts, youngest/oldest marks, "plays for which team" on active players.
  Facts also carry a **`volatileNote`** saying what changes it.
- omitted/false → timeless. History, finished careers, origins, rules, records
  that are effectively untouchable. **The bank should lean heavily timeless.**

In the shipped bank, volatile questions are written to `questions.js` with a
`v:1` field so they can be found instantly:  `grep -c 'v:1' docs/play/questions.js`

## The refresh loop (do this ~2x a year, and after any NBA/WNBA Finals)
1. **Pull the volatile set** — `docs/play/data/volatile-questions.json` is written
   by every research run and lists every volatile question + its source fact id.
2. **Re-verify only those** — tell Claude: *"refresh the volatile questions."*
   Claude runs a small verification pass (only the volatile subset, not the whole
   bank), checks each answer against current sources, and reports what moved.
3. **Three outcomes per question:**
   · still correct → leave it
   · answer changed → update the correct answer (and distractors if needed)
   · question became awkward ("who is the active leader in X" once they retire)
     → rewrite it as a timeless question ("who retired as the leader in X in
     20XX?") — this is the preferred move, it converts a volatile into a permanent.
4. **Same loop covers the player DB** — active players' stats/teams/tiers drift
   too (Run 1 already caught LeBron's July-2026 76ers signing). A refresh run
   re-checks active players only.

## Writing rules that reduce future churn
- **Prefer the timeless phrasing.** "Who scored 100 points in a game?" (forever)
  beats "who holds the single-game scoring record?" (chaseable).
- **Date-anchor when you must be current.** "As of the 2025-26 season, who…"
  makes a volatile fact honest instead of wrong.
- **Never write volatile t:1 questions.** Easy questions get asked most; a stale
  easy question is the most likely to be seen and the most infuriating to miss.

---

# THE FIVE KINDS OF RUN (read this before commissioning any research)

"A run" is not one thing. There are five, they fill different files, and mixing
them up wastes a run. Every future data push should say WHICH kind it is.

| # | Run type | Fills | Produces | Needs new research? |
|---|---|---|---|---|
| 1 | **Player run** | `data/players.json` | who exists — name, pos, era, tier, teams, accolades | yes |
| 2 | **Stats run** | `data/players.json` (same records) | the NUMBERS on players we already have | yes |
| 3 | **Fact run** | `data/research-runN-*.json` | the sourced fact corpus | yes |
| 4 | **Question run** | `questions.js` | playable questions FROM an existing corpus | **no** |
| 5 | **Refresh run** | any of the above | re-checks `v:1` volatile facts that go stale | yes, but small |

**The one that surprises people: a QUESTION run needs no new research.** Run 1
mined 765 facts and only used some of them; run 2 produced 307 more questions
from the SAME corpus with 156 facts still untouched. Squeeze the corpus before
commissioning new mining.

**Player run vs stats run is the other easy mix-up.** A player run adds BODIES.
A stats run adds NUMBERS to bodies already there. If the goal is player ratings,
the stats run is the one you want — ratings built on uneven fields produce
lopsided players (see below).

**Why stats can't just be downloaded.** Career averages for famous players are
widely published facts and fine to state with a citation — that's what a stats
run gathers. Bulk-copying a statistics *database* is a different thing: those are
licensed commercial products, and this is a static site with no backend to proxy
a licensed feed through anyway. And for streetball and the Negro Leagues no
archive helps — those box scores largely were never kept. Those players carry
accolades instead of numbers, and that is the honest answer, not a gap to fake.

**Coverage as of run 1 (why a stats run is next):**
career ppg 284/441 · rpg 250 · apg 200 · fg% 167 · spg 91 · **bpg 63**.
Build ratings on that and almost every player grades out as a scorer and nobody
as a rim protector — because scoring is the only stat reliably present.
By league: NBA 214/222 and WNBA 60/60 are solid; **World 3/60, streetball 2/47,
Negro Leagues 4/23** are effectively empty.

**Leagues are gated on DATA, not code.** BIG3 and World were moved to IN THE LAB
on 07-25: both engines work fine, but BIG3 has zero superstar-tier players (its
Legendary/Hall of Fame packs are cosmetic lies) and World has stats for 3 of 60.
NBA + WNBA are the honest testing set. Ungate a league when its data earns it.

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
> `{"id":"unique-slug", "league":"nba|wnba|world|negro|college|big3|any", "era":"1940s..2020s|alltime", "topic":"champions|mvps|records|drafts|moments|nicknames|rules|olympics|...", "subject":"the player/team/event this fact is ABOUT", "fact":"one verifiable fact stated plainly", "source":"where it's verified", "difficulty":1-4}`
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
> 6. **Big3** — founders, format, champions, notable vets.
> 7. **Rules & universal** — dimensions, shot clock, violations, origin
>    (Naismith, peach baskets), positions, scoring, fouls.
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
4. Promote **negro** & **college** to selectable leagues.

The corpus is what makes "new question pack every release" real — questions are
infinite, the fact base is the engine.

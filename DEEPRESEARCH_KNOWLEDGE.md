# Ball Knowledge — Deep Research prompt: the trivia mega-bank

Paste everything in the box below into **/deep-research**. It's built to hand
back questions already in our exact format so I can drop them straight into
`questions.js`. Run it once per league-section if it caps out — each section
stands alone.

---

> **You are building a fact-checked basketball trivia question bank for a game.
> Produce as MANY high-quality multiple-choice questions as you can — aim for
> 400+ — spanning the entire world of basketball. Every fact must be verifiable
> from a reputable source (Basketball-Reference, official league sites,
> Olympics/FIBA records, reputable outlets); include a source note per question.**
>
> **OUTPUT FORMAT — return questions as a JSON array, each object exactly:**
> `{"t":TIER, "l":"LEAGUE", "cat":"CATEGORY", "q":"QUESTION?", "c":["correct","wrong","wrong","wrong"], "src":"where it's verified"}`
> - `t` = difficulty: **1** easy (a casual fan knows it), **2** medium (a real
>   fan), **3** hard (a historian / deep cut).
> - `l` = one of: `"nba"`, `"wnba"`, `"world"` (Olympics/FIBA/international),
>   `"big3"`, `"negro"` (Black Fives / barnstorming / pre-integration &
>   Harlem Globetrotters history), `"college"`, `"any"` (rules & universal).
> - **The correct answer is ALWAYS the first item in `c`** (I randomize order
>   on my end). The 3 wrong answers must be plausible, not throwaways.
> - No duplicate questions. No "all of the above". No questions that reveal
>   their own answer. Keep questions ONE sentence.
>
> **COVER ALL OF THIS — spread difficulty 1/2/3 roughly evenly in each:**
> 1. **NBA** — every decade 1946→today: champions & Finals MVPs, regular-season
>    MVPs, scoring/assist/rebound/steal/block leaders, iconic games & shots,
>    dynasties, famous trades & drafts, franchise moves & relocations,
>    nicknames, records, rookies, coaches, rivalries, the ABA merger.
> 2. **WNBA** — 1997→today: champions, MVPs, scoring leaders, expansion, the
>    Comets dynasty, the Lynx dynasty, Aces back-to-back, record-setters,
>    Olympians, draft #1 picks, firsts.
> 3. **International / Olympics / FIBA** — men's & women's Olympic golds by
>    year & host city, FIBA World Cup winners & MVPs, EuroBasket, the 1972
>    final, the Dream Team & Redeem Team, the great non-American players and
>    their nations, current global stars' national teams.
> 4. **Negro Leagues & pre-integration basketball history** — the New York
>    Rens, the original Celtics, the Harlem Globetrotters (history, not the
>    comedy act), Black Fives era pioneers, the first Black NBA players
>    (Earl Lloyd, Chuck Cooper, Nat Clifton), integration milestones.
> 5. **College** — famous NCAA champions & title-game moments, UCLA's run,
>    legendary coaches, players before they went pro (men's & women's),
>    March Madness upsets, the Final Four.
> 6. **Big3** — the 3-on-3 league: founders, format, champions, notable vets.
> 7. **Rules & universal** — dimensions, the shot clock, violations,
>    the origin (Naismith, peach baskets), positions, scoring, fouls.
>
> **Also add a "fun/legendary" seasoning** across leagues: dunk-contest &
> three-point-contest winners, All-Star moments, jersey numbers, arena names,
> famous injuries/comebacks, one-game explosions.
>
> **Quality bar: no insultingly easy questions** (avoid "how many players on
> the court"). Even tier-1 should make a casual fan think for a second. Prefer
> specific, dateable facts over vague ones. Fact-check every single one.**

---

## After the research runs
Hand me back whatever it produces (the JSON array, even in chunks). I'll:
1. sanity-check every question (format, exactly one correct, no dupes vs. the
   132 already live),
2. add the two new leagues (`negro`, `college`) to the setup so they're
   playable, wiring their question scope like the others,
3. drop it all into `questions.js` and push.

No practical size limit on the bank — it's a plain array. See the note I sent
in chat on how many I can build vs. how many the research pull will.

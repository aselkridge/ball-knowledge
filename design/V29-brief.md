# V29 · LANDSCAPE AND LICENSING — the paste-ready brief

**Type A. Aaron runs this in `/deep-research`.** Filed 2026-08-07.
Backlog entry: `RESEARCH-BACKLOG.md` → V29.

## Why this run is first

Aaron's call, and the right one. Every other run in the queue spends effort
gathering data. This one asks **whether the thing we are gathering toward is
legal and whether it is actually distinctive**. Doing it after V32 mining and
V28 census would mean discovering the answer with the work already sunk.

The specific risk, flagged 2026-08-06 and still unanswered: there is a real
difference between **citing** basketball-reference to prove one card, which is
what the game does today and is fine, and **aggregating** basketball-reference
into a database that competes with it. Sports Reference's terms restrict bulk
reuse. If that line sits somewhere inside the plan for "the most complete
basketball record anybody has put in one place", it has to be found now.

## What is different about this brief

Every other run in this project gathers FACTS ABOUT BASKETBALL and gets checked
against the source standard in `DEEPRESEARCH_KNOWLEDGE.md`. This one gathers
**claims about documents** — terms of service, licences, statutes, case law —
and those rot faster than any sports record. So two extra rules:

1. **Quote the clause, do not summarise it.** A summary of a licence is an
   opinion. The deliverable must carry the operative sentence verbatim, in
   quotes, with the URL and the date it was read. This is the same lesson the
   court-diagram episode taught: *reading the thing is the work; describing what
   it probably says is not.*
2. **Terms change, so every claim is dated.** A licence read today is a fact
   about today. `date_read` is required on every row.

**This is not legal advice and the return must not pretend to be.** The
deliverable is *what the documents say*, sourced and quoted, so Aaron can decide
what to do and, if it matters, take it to somebody qualified.

---

## THE PASTE BLOCK

> I am building a basketball trivia game with a fact database behind it. Every
> fact in it carries a source URL, a source-quality tier, a confidence level and
> the date a human read the source. The long-term ambition is the most complete
> and most cross-referenced basketball knowledge base available anywhere,
> spanning the NBA, WNBA, ABA, BIG3, college, FIBA and international, overseas
> clubs, streetball, the Harlem Globetrotters, wheelchair basketball, and the
> early Black basketball leagues of 1904 to 1950.
>
> I need two questions answered before I invest further. **Answer both fully.
> Question 2 is the one that can hurt, so do not shortchange it.**
>
> ---
>
> ## QUESTION 1 — WHO ELSE IS DOING THIS, AND DOES ANYONE SHOW THEIR WORK?
>
> Map who currently holds structured basketball data or basketball knowledge.
> At minimum cover, and add anything you find:
>
> - **Sports Reference** (basketball-reference.com, and its college and WNBA
>   siblings)
> - **The NBA's own properties** — stats.nba.com, the undocumented NBA Stats
>   API, official.nba.com, NBA.com/history
> - **WNBA.com** and the league's own record keeping
> - **Wikidata and DBpedia** — what basketball entities and properties exist,
>   how complete, under what licence
> - **Kaggle and GitHub datasets** — the recurring NBA datasets, their
>   provenance, their licences
> - **Commercial feeds** — Sportradar, Stats Perform / Opta, Genius Sports,
>   SportsDataIO: what they sell, roughly what it costs, who they sell to
> - **Trivia and quiz products** — Sporcle, Immaculate Grid, HoopGrids, the NYT
>   games, any basketball trivia app of scale
> - **Historical and archival holders** — the Naismith Memorial Basketball Hall
>   of Fame, the Black Fives Foundation, the Women's Basketball Hall of Fame,
>   university and league archives, digitised newspaper archives
> - **Encyclopaedic and community efforts** — Wikipedia's basketball projects,
>   RealGM, Basketball Almanac, any fan-maintained database of scale
>
> For each one, tell me:
> 1. **What it actually holds** — box scores, career totals, biographies,
>    play-by-play, historical narrative, images. Be specific about coverage:
>    which leagues, which years, where it stops.
> 2. **How complete it is on the margins** — the WNBA before 2000, the ABA, the
>    Black Fives era, women's pre-WNBA basketball, streetball, international
>    club play, wheelchair basketball. **The centre of this field is
>    well-served; I care most about the edges.**
> 3. **Whether it publishes provenance per fact.** This is the crux of the
>    question. Not "does it have a sources page" — does an individual fact carry
>    a citation, a quality rating, a confidence level, or a date it was last
>    verified? Wikidata's references and Wikipedia's inline citations are the
>    closest things I know of. **Is there anyone who publishes a per-fact source
>    TIER and a per-fact CONFIDENCE?** If the answer is nobody, say so plainly
>    and say how confident you are in that negative, because a negative is only
>    as good as the search behind it.
> 4. **How you would characterise the gap**, in one sentence.
>
> Then answer directly: **is "every fact carries its source, its source's
> quality tier, its confidence, and the date a human read it" a genuinely
> unusual claim in this field, or am I describing something several people
> already do?** I would rather be told it is common than flatter myself.
>
> ---
>
> ## QUESTION 2 — WHAT IS LEGALLY USABLE IN BULK
>
> **This is the important half.** Draw a clear line between three different
> things, because I believe they are treated very differently and I need to know
> where each one sits:
>
> - **(a) CITING** a source to prove a single fact, with a link back. This is
>   what I do today.
> - **(b) EXTRACTING** individual facts from a source into my own database, by
>   hand or with tooling, and then citing the source.
> - **(c) AGGREGATING** a source at scale into a database that could be seen as
>   substituting for it.
>
> For each significant holder in Question 1, and especially for Sports
> Reference, the NBA Stats API, Wikipedia and Wikidata, tell me:
>
> 1. **The operative terms, QUOTED VERBATIM.** Not your summary. The actual
>    sentences from the terms of use, data-use policy, robots.txt, API terms or
>    licence that govern reuse, scraping, and redistribution. Give the URL and
>    the date you read it. If a site has a specific data-use or attribution
>    page, quote from that.
> 2. **What their robots.txt actually says** about automated access, quoted.
> 3. **Which of (a), (b) and (c) the terms appear to permit, restrict, or
>    prohibit**, with the clause each conclusion rests on.
> 4. **Whether they have ever enforced it**, publicly. Cease and desist letters,
>    lawsuits, blog posts, forum threads, API shutdowns, blocked scrapers.
>    Concrete incidents matter more than clause-reading.
>
> Then cover the law behind it, for a **US-based individual**, and separately
> flag where the **EU and UK** differ:
>
> 5. **Copyright in facts.** *Feist Publications v. Rural Telephone Service*
>    (1991) and the idea that facts themselves are not copyrightable, but a
>    creative selection or arrangement can be. What does that mean for a
>    database of individually-cited sports facts? Quote the standard.
> 6. **The EU and UK sui generis database right**, which has no US equivalent.
>    Does it change the answer for a site hosted in the US but readable in
>    Europe?
> 7. **Contract versus copyright.** Terms of service can forbid things copyright
>    would allow. How enforceable are browsewrap terms against someone who never
>    clicked anything? Note the direction of US case law, with cases named.
> 8. **The hot-news doctrine** and *NBA v. Motorola* (1997), which is directly
>    about basketball data. What survived it, and does it reach historical facts
>    or only live ones?
> 9. **Sports statistics specifically.** Any case law or settled practice on who
>    may republish scores, box scores and career totals. Include the fantasy
>    sports cases (*C.B.C. Distribution v. MLB Advanced Media*) and what they
>    established about names and statistics.
> 10. **Player names, likenesses and team marks.** Using real player names in
>     trivia questions, using team names, and where the line sits between
>     factual reference and implying endorsement. Right of publicity, and how
>     much it varies by state.
> 11. **The safest construction.** Given all of the above, what does a project
>     like mine look like if it is built to be defensible? Name the specific
>     practices: which sources to prefer, what attribution to carry, what to
>     avoid extracting at scale, whether there are public-domain or
>     openly-licensed holdings (Wikidata under CC0, government archives,
>     newspaper archives out of copyright) that should be the backbone instead.
>
> ---
>
> ## HOW TO ANSWER
>
> - **Quote, do not paraphrase**, anywhere you are telling me what a document
>   says. A paraphrase of a licence clause is an opinion; the clause is a fact.
> - **Date every claim.** Terms change. A licence read today is a fact about
>   today, and I need to know when you read it.
> - **Where you are uncertain, say so and say why.** "I could not find a
>   published data-use policy for X" is a useful and honest answer. A confident
>   guess is not.
> - **Separate what the documents say from what you think they mean.** Keep them
>   in different fields. I am not asking you to be my lawyer and you should not
>   pretend to be one; I am asking you to read the documents carefully and show
>   me what they say.
> - **Prefer primary sources**: the actual terms page, the actual robots.txt,
>   the actual court opinion. Secondary commentary is useful for finding things
>   and must never be the only citation for a claim about what a document says.
>
> ## RETURN FORMAT
>
> Prose analysis is welcome, but it must be accompanied by this JSON so I can
> file it:
>
> ```json
> {
>   "run": "V29",
>   "date_read": "YYYY-MM-DD",
>   "holders": [
>     {
>       "id": "sports-reference",
>       "name": "Sports Reference (basketball-reference.com)",
>       "url": "https://...",
>       "holds": "what it actually contains, specifically",
>       "coverage_gaps": "where it stops, especially on the margins",
>       "per_fact_provenance": "none | citations only | citations + quality | citations + quality + confidence",
>       "provenance_evidence": "what you saw that supports that answer, with a url",
>       "notes": ""
>     }
>   ],
>   "terms": [
>     {
>       "holder_id": "sports-reference",
>       "document": "Data Use / Terms of Use / robots.txt / API terms",
>       "url": "https://...",
>       "date_read": "YYYY-MM-DD",
>       "quote": "the operative sentence or sentences, verbatim",
>       "cite_one_fact": "permitted | restricted | prohibited | unclear",
>       "extract_facts": "permitted | restricted | prohibited | unclear",
>       "aggregate_at_scale": "permitted | restricted | prohibited | unclear",
>       "basis": "which quoted clause each verdict rests on",
>       "enforcement_history": "incidents with urls, or 'none found'"
>     }
>   ],
>   "law": [
>     {
>       "topic": "copyright in facts",
>       "authority": "Feist Publications v. Rural Telephone Service Co., 499 U.S. 340 (1991)",
>       "url": "https://...",
>       "quote": "the operative holding, verbatim",
>       "what_it_means_here": "your reading, kept separate from the quote",
>       "jurisdiction": "US",
>       "confidence": "high | medium | low"
>     }
>   ],
>   "verdict": {
>     "is_per_fact_provenance_unusual": "yes | no | partly",
>     "reasoning": "",
>     "search_confidence": "how sure you are of any negative finding, and what you searched",
>     "biggest_legal_risk": "",
>     "safest_construction": "",
>     "open_questions": ["things you could not settle and why"]
>   }
> }
> ```

---

## Expected size, and how to split it if it caps out

One run should carry it. If `/deep-research` truncates, split on the natural
seam, because the two halves share nothing:

- **Run A — Question 1 only.** The landscape and the per-fact-provenance
  question.
- **Run B — Question 2 only.** Terms, quotes, and the law. This is the half
  that matters more, so if only one can run, run this one.

## What happens to the return

**It is UNPROVEN until it has been through the prove pass.** File it as
`docs/play/data/research-v29-licensing.json`, never anywhere near the bank.

Then, and this run needs a different check from a fact run:

1. **Re-read every quoted clause at its URL.** A quote is only worth the
   re-reading. Terms pages change and a research tool can quote a cached copy.
2. **Anything that survives becomes a constraint written into
   `BUILD.md` § 5b.1a**, which already holds the three acquisition constraints
   Aaron set on 08-06. A licence finding is a fourth constraint of the same
   kind, not a fact for the bank.
3. **If the answer restricts bulk aggregation from a Tier 1 source**, that
   changes the shape of V32 (mine the 158 Tier 1 pages cited once) before V32
   runs. That is the whole reason this goes first.
4. **The competitor answer, whichever way it falls, lands in BUILD.md § 5b.1.**
   If per-fact provenance turns out to be common, the moat claim on the
   coming-soon page needs rewording, and that is worth knowing.

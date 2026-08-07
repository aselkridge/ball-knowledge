# V29 Run B · THE LEGAL HALF — the paste-ready brief

**Type A. Aaron runs this in `/deep-research`.** Written 2026-08-07.
Backlog entry: `RESEARCH-BACKLOG.md` → V29. Run A's brief: `design/V29-brief.md`.
Priority: **Rank 1 · item 1** in `RESEARCH-BACKLOG.md` → THE ORDER I'D ACTUALLY
DO IT IN.

## Why this is a second run and not a retry

Run A went out on 2026-08-07 with both questions in one brief. It came back with
Question 1 answered — 106 agents, 24 sources fetched, 120 claims extracted, 25
adversarially verified, 13 confirmed — and **Question 2 empty. Zero rows in
`terms`, zero in `law`.**

That is not the tool failing. It is the wrong tool. A general research harness is
built to *find claims across the web and then verify them*, and it is good at
that; Question 1 is exactly that shape. Question 2 is not a finding problem at
all. **We already know which documents matter.** The work is opening about a
dozen known URLs and quoting what is on them. A fan-out optimised for discovery
finds nothing to discover, extracts no claims, and returns an empty array — which
is what happened.

So Run B changes shape:

| Run A | Run B |
|---|---|
| search the field, then verify | **read a fixed list, then quote** |
| unit of work = a claim | **unit of work = a document** |
| done when the search is exhausted | **done when the LIST is exhausted** |
| a thin return means the field is thin | **a thin return means the run failed** |

**The reading list is in the paste block below.** It is not a suggestion of where
to look. It is the job.

## The rules carried over from Run A, unchanged

1. **Quote the clause, do not summarise it.** A summary of a licence is an
   opinion; the clause is a fact. Same lesson as the court diagram: reading the
   thing is the work, describing what it probably says is not.
2. **Terms change, so every claim is dated.** `date_read` on every row.
3. **This is not legal advice and the return must not pretend to be.** The
   deliverable is *what the documents say*, quoted and sourced, so Aaron can
   decide what to do and, if it matters, take it to somebody qualified.
4. **Primary sources only for what a document says.** Commentary is fine for
   finding a document and must never be the only citation for what it contains.
5. **Keep what documents SAY separate from what they MEAN.** Different fields,
   always.

---

## THE PASTE BLOCK

> I am building a basketball trivia game with a fact database behind it. Every
> fact carries a source URL, a source-quality tier, a confidence level, and the
> date a human read the source. Today the database has about 1,500 facts and
> every one of them cites a page. The ambition is to grow it into the most
> complete and most cross-referenced basketball knowledge base anywhere, across
> the NBA, WNBA, ABA, BIG3, college, FIBA and international, overseas clubs,
> streetball, the Harlem Globetrotters, wheelchair basketball, and the early
> Black basketball leagues of 1904 to 1950.
>
> **This is a READING task, not a search task.** I already know which documents
> matter and they are listed below. I do not want you to go looking for the
> landscape — a previous run covered that. I want you to open each document on
> the list, read it, and give me the operative sentences **verbatim, in quotes,
> with the URL and the date you read it.**
>
> **The single most important instruction: if you cannot fetch a document, say
> so and name the failure.** Do not fill the gap from memory, do not substitute
> a summary you found on a law blog, and do not quote a version you recall. An
> honest "could not retrieve, got a 403" is a useful answer. A confident quote
> that turns out to be a paraphrase of a 2019 version of the page is worse than
> nothing, because I will act on it.
>
> ---
>
> ## PART 1 — THE DOCUMENTS. Read every one.
>
> For each document: fetch it, quote the operative language, and record the
> date. Work through the whole list. If a URL has moved, find the current
> canonical location and say that you did.
>
> **Sports Reference — the one that matters most, because most of my citations
> point at it**
> 1. `https://www.sports-reference.com/termsofuse.html`
> 2. `https://www.sports-reference.com/data_use.html` — their data-use page, if
>    it still exists at that path
> 3. `https://www.basketball-reference.com/robots.txt`
> 4. Any bot, scraping, rate-limit or API statement they publish anywhere,
>    including in their FAQ or on their blog. Quote it.
>
> **The NBA**
> 5. `https://www.nba.com/termsofuse`
> 6. `https://stats.nba.com/robots.txt` and `https://www.nba.com/robots.txt`
> 7. Whatever governs the undocumented `stats.nba.com` endpoints. There may be
>    no published API terms at all — **if so, say that plainly**, because
>    "there is no document" is itself the finding, and quote whatever general
>    terms would cover it instead.
> 8. `https://www.wnba.com/terms-of-use` or wherever the WNBA's terms now live.
>
> **The openly-licensed holdings, which may turn out to be the backbone**
> 9. Wikimedia Foundation Terms of Use, and specifically what licence article
>    text carries — quote the licence clause, not the summary box.
> 10. `https://www.wikidata.org/wiki/Wikidata:Licensing` — quote the CC0
>     dedication as it applies to Wikidata's structured data, and be precise
>     about what is CC0 and what is not.
> 11. `https://en.wikipedia.org/robots.txt`
> 12. Any Wikimedia policy on automated access, bulk download, and the database
>     dumps. **Where an official bulk route exists (dumps, an API, a data
>     download), name it and quote its terms** — a sanctioned bulk path changes
>     my plan more than any prohibition does.
>
> For **each** document, tell me:
>
> - **The operative sentences, VERBATIM.** Not your summary. If the governing
>   language is spread across three clauses, quote all three.
> - **What it says about each of these three separate activities**, which I
>   believe are treated very differently:
>   - **(a) CITING** a page to prove one fact, with a link back. This is what I
>     do today, on every single card.
>   - **(b) EXTRACTING** individual facts into my own database, by hand or with
>     tooling, and then citing the source.
>   - **(c) AGGREGATING** at scale into a database that could be seen as
>     substituting for theirs.
>   For each of (a), (b), (c): permitted, restricted, prohibited, or unclear —
>   **and name the quoted clause each verdict rests on.** A verdict with no
>   clause under it is an opinion and I will treat it as one.
> - **What the robots.txt actually says** about automated access, quoted, with
>   the specific user-agent and path rules that apply.
> - **Whether they have ever enforced it.** Cease and desist letters, lawsuits,
>   API shutdowns, blocked scrapers, blog posts, forum threads, GitHub issues on
>   scraper projects. **Concrete incidents matter more to me than clause
>   reading.** Give URLs and dates.
>
> ---
>
> ## PART 2 — THE LAW. Read the opinions, quote the holdings.
>
> Same instruction: these are named authorities, not a search. Find each
> opinion, quote the operative holding **verbatim**, and keep your reading of it
> in a separate field. US law for a US-based individual, with EU and UK
> differences flagged separately where they exist.
>
> 13. **Copyright does not protect facts.** *Feist Publications, Inc. v. Rural
>     Telephone Service Co.*, 499 U.S. 340 (1991). Quote the standard on facts
>     versus creative selection and arrangement, and the "sweat of the brow"
>     rejection. Then: what does that mean for a database of individually-cited
>     sports facts, where the selection is "facts a trivia game can use"?
> 14. **Basketball data specifically.** *National Basketball Association v.
>     Motorola, Inc.*, 105 F.3d 841 (2d Cir. 1997). Quote what survived of the
>     hot-news doctrine and its elements. **Does it reach historical facts, or
>     only time-sensitive ones?** That distinction decides whether it touches me
>     at all.
> 15. **Names and statistics together.** *C.B.C. Distribution and Marketing,
>     Inc. v. Major League Baseball Advanced Media*, 505 F.3d 818 (8th Cir.
>     2007). Quote what it established about using real players' names and
>     statistics, and how the First Amendment interacted with right of
>     publicity there.
> 16. **Contract versus copyright — terms that forbid what copyright allows.**
>     How enforceable are browsewrap terms against someone who never clicked
>     anything? Name and quote the leading cases; *Specht v. Netscape*, 306 F.3d
>     17 (2d Cir. 2002) and *Nguyen v. Barnes & Noble*, 763 F.3d 1171 (9th Cir.
>     2014) are the two I know of. Tell me the direction of the case law and
>     what makes terms MORE enforceable, since some sites do more than others.
> 17. **Automated access and the computer-misuse statutes.** *hiQ Labs v.
>     LinkedIn* and *Van Buren v. United States*, 593 U.S. 374 (2021). Quote
>     what they settled about accessing publicly available pages with tooling,
>     and what they explicitly did NOT settle.
> 18. **The EU and UK sui generis database right**, which has no US equivalent.
>     Quote Article 7 of Directive 96/9/EC on extraction and re-utilisation of a
>     substantial part, and the *British Horseracing Board v. William Hill*
>     (C-203/02) holding on what counts as investment in *obtaining* versus
>     *creating* data. Does it change anything for a US-hosted site readable in
>     Europe?
> 19. **Player names, likenesses and team marks in a trivia game.** Using real
>     names in questions; using team names; where the line sits between factual
>     reference and implying endorsement. Right of publicity varies by state —
>     tell me which states are strictest and what the practical exposure looks
>     like for a small game. Quote statute or holding where you can.
>
> ---
>
> ## PART 3 — THE ANSWER I ACTUALLY NEED
>
> Having read the above, and keeping this clearly separated from the quotes:
>
> 20. **What does a project like mine look like if it is built to be
>     defensible?** Name specific practices, not principles. Which sources to
>     prefer and which to treat as citation-only. What attribution to carry and
>     where it should appear. What not to extract at scale. Whether there is an
>     openly-licensed or public-domain backbone — Wikidata under CC0, government
>     archives, newspapers out of copyright, official league record books — that
>     should carry the bulk while the restrictive sources are used only to
>     confirm single facts.
> 21. **Rank the risks.** Of everything above, what is most likely to actually
>     bite a small project, and what is theoretically true but never enforced
>     against anyone at my scale? Be honest about the difference. I would rather
>     hear "this clause exists and nobody has ever enforced it" than a list of
>     equally-weighted dangers.
> 22. **What would you tell me NOT to do**, given the ambition of "the most
>     complete basketball database anywhere"?
>
> ---
>
> ## HOW TO ANSWER
>
> - **Quote, do not paraphrase**, wherever you are telling me what a document
>   says.
> - **Date every claim.** A licence read today is a fact about today.
> - **Where you are uncertain, say so and say why.** "I could not find a
>   published data-use policy for X" is a useful answer. A confident guess is
>   not.
> - **Separate what the documents say from what you think they mean.** Different
>   fields. I am not asking you to be my lawyer and you should not pretend to be
>   one; I am asking you to read carefully and show me what is there.
> - **One row per DOCUMENT, not one row per claim.** The run is complete when
>   every document on the list has a row — including the ones you could not
>   fetch, which get a row saying so.
>
> ## SELF-CHECK BEFORE YOU RETURN
>
> A previous attempt at this returned an empty `terms` array and reported
> success. So, explicitly:
>
> - **If `terms` has fewer than 8 rows, the run has FAILED.** Say so at the top
>   of your answer rather than returning a partial result as though it were
>   complete.
> - **If `law` has fewer than 6 rows, the run has FAILED.** Same.
> - **A row whose `quote` field is your own words rather than the document's is
>   not a row.** Delete it, or mark `quote_is_verbatim: false` and explain.
> - Count your rows and state the counts in your answer.
>
> ## RETURN FORMAT
>
> Prose analysis is welcome and useful, but it must be accompanied by this JSON
> so I can file it:
>
> ```json
> {
>   "run": "V29B",
>   "date_read": "YYYY-MM-DD",
>   "terms": [
>     {
>       "holder_id": "sports-reference",
>       "document": "Terms of Use | Data Use | robots.txt | API terms | licence",
>       "url": "https://...",
>       "date_read": "YYYY-MM-DD",
>       "fetched": "yes | no",
>       "fetch_failure": "the error, if fetched is no",
>       "quote": "the operative sentence or sentences, VERBATIM",
>       "quote_is_verbatim": true,
>       "cite_one_fact": "permitted | restricted | prohibited | unclear",
>       "extract_facts": "permitted | restricted | prohibited | unclear",
>       "aggregate_at_scale": "permitted | restricted | prohibited | unclear",
>       "basis": "which quoted clause each verdict rests on",
>       "sanctioned_bulk_route": "dumps / API / download, with url and terms, or 'none published'",
>       "enforcement_history": "incidents with urls and dates, or 'none found'"
>     }
>   ],
>   "law": [
>     {
>       "topic": "copyright in facts",
>       "authority": "Feist Publications v. Rural Telephone Service Co., 499 U.S. 340 (1991)",
>       "url": "https://...",
>       "quote": "the operative holding, VERBATIM",
>       "quote_is_verbatim": true,
>       "what_it_means_here": "your reading, kept separate from the quote",
>       "jurisdiction": "US | EU | UK",
>       "reaches_historical_facts": "yes | no | unclear",
>       "confidence": "high | medium | low"
>     }
>   ],
>   "verdict": {
>     "biggest_legal_risk": "",
>     "most_likely_to_actually_bite": "",
>     "theoretically_true_never_enforced": "",
>     "safest_construction": "",
>     "openly_licensed_backbone": "what could carry the bulk, with licences",
>     "do_not_do": [""],
>     "documents_read": 0,
>     "documents_unreachable": [""],
>     "open_questions": ["things you could not settle, and why"]
>   }
> }
> ```

---

## What happens to the return

**It is UNPROVEN until it has been through the prove pass.** File it as
`docs/play/data/research-v29b-licensing.json`, alongside Run A's
`research-v29-licensing.json`, and never anywhere near the bank.

Then, and this run needs a different check from a fact run:

1. **Re-read every quoted clause at its URL.** A quote is only worth the
   re-reading, and a research tool can quote a cached copy. This is the one
   check that cannot be skipped: the failure mode here is a quote that was true
   in 2023.
2. **Every surviving finding becomes a constraint written into `BUILD.md`
   § 5b.1a**, which already holds the three acquisition constraints Aaron set on
   08-06. A licence finding is a fourth constraint of the same kind — it is not
   a fact for the bank and must never be merged as one.
3. **If bulk aggregation from a Tier 1 source turns out to be restricted, V32
   changes shape before it runs.** V32 is "mine the 158 Tier 1 pages we already
   trust", it is the cheapest acquisition on the board, and it is the specific
   thing this run exists to protect. Same for V34 (783 cached images) and S7.
4. **If a sanctioned bulk route exists** — Wikimedia dumps, an official data
   download, a free API tier — that is the most valuable single sentence the run
   can return, and it goes straight into V28 and V32 as the preferred path.
5. **Whatever the answer, the politeness standard does not move.** One request at
   a time, 1.5s apart, everything cached, per `tools/season-sweep.py`. That is
   the standard this repo holds regardless of what the terms permit.

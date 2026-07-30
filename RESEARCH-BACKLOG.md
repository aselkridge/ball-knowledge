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
- **`fives` (Black Fives) has NO league card — 20 players and 58 questions are
  unreachable in the game.** The hardest-won data in the project cannot be
  played. This is the same content H3's letter is chasing more of.
- **`gleague` has a card on the live league screen and ZERO data** — no player
  carries the tag, no question carries the tag. It is a promise with nothing
  behind it. Either commission a G League run or cut the card.

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

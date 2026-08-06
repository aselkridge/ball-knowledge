# WORKING WITH AI SYSTEMS — Aaron's field notes

Portable. Nothing here depends on Ball Knowledge; the examples come from it
because that is where the evidence was collected, but every lesson is meant to
travel to another project, another model, or a client engagement.

Started 2026-07-31. **This file is append-only in spirit: add, sharpen, and
correct, but do not quietly delete a lesson that was paid for.**

> **Where this lives.** Currently in a PUBLIC repo. If any of this becomes
> client-specific or commercially sensitive, move it — it is one `git mv` from
> anywhere and has no dependencies.

---

## 0 · The one-line version

**A model's confidence is uncorrelated with its correctness, and a written
instruction is not a mechanism.** Everything below is a consequence of those two
sentences.

---

## 1 · Failure modes I have actually observed

Each of these was caught in real work, not theorised.

### 1.1 It asserts before it measures — and sounds certain doing it
The dominant failure mode by a distance. In a single session:

| Claim | Reality |
|---|---|
| "BIG3 and World are playable; College and Street can't be the game" | Read from the wrong two lists. All four were locked. |
| "Magic would land at PG on nearly every deal and essentially never at centre" | Measured: 55/45. A decision was made on the strength of it. |
| A code comment saying "this slug matches the canonical one" | It didn't. Would have split one person into two. |

The tell is **confident + specific + no number shown**. If it says "roughly 80
cards" or "essentially never" or "this matches", ask *what did you run?*

**The counter-prompt that works:** *"Show me the command and its output."* Not
"are you sure" — it will say yes.

### 1.2 A written learning does nothing if the next session doesn't read it
The strongest single data point I have. A correction was written into the
project doc on one day — the exact mistake, the exact reason, a note explaining
how to avoid it. **The identical mistake was repeated the next day**, by a model
that had that file available and did not open it.

So: *documentation is a record, not a control.* Do not confuse the two.

A quieter version of the same failure, worth naming separately because it does
not look like an error: **it re-opens decisions you already made.** A design
question had been settled, refined twice, and written into the build doc with
the reasoning attached. A later session — same project, same file on disk —
presented it back as an open choice, complete with a recommendation. Nothing
was wrong on the page. It simply cost a round-trip to re-decide something that
was already decided, and it quietly invites you to contradict yourself.

This is more corrosive than a plain factual slip, because a confident "here's
the trade-off, your call" reads like diligence. The tell is that the model
offers you a decision without citing what you already said about it. A useful
demand, cheap to make and easy to check: **before asking me to choose
anything, quote the file and line where it is currently decided, or state that
it is not.** That converts an invisible omission into a visible one. Which
leads directly to:

### 1.2b It edits the file it can see, not the file that governs
A project had a build pipeline: tables were the source of truth and two data
files were GENERATED from them. The generating script said so in its own opening
line. Asked to fix the data, the model opened the generated file and started
rewriting it — work that the next build would have silently erased. The owner
caught it, not the model.

The tell is that the model never asked which direction the pipeline flowed. It
found a file containing the data, and a file containing the data looks exactly
like the file to edit. **Before changing any data, establish which artefact is
written BY HAND and which is written BY A SCRIPT** — and say which one you are
touching. "Where does this file come from?" costs one command.

### 1.2c A decision must live where a rebuild READS, not where it WRITES
The sharpest data-modelling lesson of the project, and it came from the owner
asking a question the model had not thought to ask: *"should the number have
dropped when I broke the label?"*

It hadn't, because the labels were a CACHED COPY — recomputed from a list on
every run. That is correct for derived data. But the same column was where a
human would naturally type a ruling, and a ruling typed there is overwritten on
the next run without a word. Two different kinds of thing were sharing one box:

- **Derived** — recomputable, safe to throw away, must never be hand-edited.
- **Decided** — a judgement that exists nowhere else, must never be regenerated.

They cannot live in the same column. The fix was to put rulings in the list (a
file the rebuild READS) and make a check fail the moment the copy and the list
disagree. **Ask of every field: if I delete this, can the machine work it out
again? If yes it is derived. If no it is a decision, and it needs a home a
rebuild cannot reach.**

### 1.2d A test that passes against a cache tests nothing
Same episode, and worth separating because it is a testing lesson, not a
modelling one. To prove a check worked, the model deliberately corrupted 423
stored values and expected a count to fall. It didn't move — because the code
recomputed those values from their real source before using them. The
sabotage was undone microseconds later by the program itself.

The model briefly read this as "the check is broken." It was not: **the wrong
thing had been sabotaged.** Breaking the actual source of truth — the list —
moved the number immediately, 151 to 43.

**When you break something to prove a test bites, break the thing the code
READS, not the thing the code WRITES.** Otherwise you have proved only that your
program recalculates correctly, and you will report a passing test as evidence
of something it never examined.

**It happened again the same week, in a different disguise.** Testing whether a
check would notice a missing visual marker, I deleted the marker from the
behaviour file and the suite passed — because the marker was defined in the
stylesheet, and the behaviour file never held it. The sabotage landed somewhere
real, just not anywhere the check was looking. A passing suite after a deliberate
break has exactly two explanations, and **"my test is fine"** is the one to
distrust: far more often the break missed. Before believing it, confirm the thing
you edited is the thing the failing path would read.

### 1.2f A test suite inherits the conditions its author happened to be working in
The same harness had thirty checks about where an element sits, several of them
phrased as guarantees — *"it sits just left of the title"* — and every one ran at
a desktop window size, because that is the size the machine that wrote them used.
The product is played mostly on phones. At phone width the element does not sit
left of the title at all; it stacks above it. The suite was not wrong so much as
**silently narrow**, and it had been reporting a guarantee it had never tested.

This generalises past screen size. A suite inherits whatever the author treated
as ambient: one locale, one timezone, an empty database, a fast network, a fresh
account. None of it is stated, so none of it gets questioned.

**The check: for each assertion, name the conditions it was run under, then ask
which of those a real user will not share.** Cheap, and it turns an unexamined
default into either a second test case or a written-down limit.

### 1.2g Inventing a vocabulary in one place does not update the places that already use it
In one sitting I gave a set of achievement marks meanings — gold for on time,
green for made up late — and built a calendar around them. It was careful work:
the marks differ in shape as well as colour precisely so colour is never doing
the job alone.

Two screens away, an older screen had been drawing a **green tick** for
"finished today" since long before that vocabulary existed. Nothing broke.
Nothing warned. The screen simply went on meaning what it had always meant,
while the word underneath it had been redefined an hour earlier. A player
finishing on time was shown the mark for being late.

The human found it by asking a plain question — *does the right mark show up on
the menu?* — which I could only answer by measuring, and the measurement was
embarrassing.

**Defining a term is a migration, not a definition.** The moment you assign a
meaning to a colour, an icon, a word or a status, the very next step is to search
for everywhere that thing is ALREADY used and make each one agree or change.
Skipping it does not produce an obvious bug — it produces two screens quietly
disagreeing, which no test catches because each one is internally consistent.

Two things make it durable. Have both surfaces call **one function** for the
meaning and the shape, so drift becomes impossible rather than unlikely. And
when you grep, grep for the VALUE as well as the name: this was a hard-coded
`#2f8f4a` in a stylesheet with no mention of the concept anywhere near it.

### 1.2h A test written by the code's author inherits the code's blind spots
The owner of this project asked, after finding six real bugs in a day by asking
plain questions: *"Why do I keep finding these bugs through random questions?
What is going on?"*

It was not random and it was not bad luck. **The checks and the code came out of
the same head, so they encode the same assumptions.** One check asserted that a
card was in scope if it was tagged `nba`, `wnba` or `any` — and it passed for
weeks, because the filter it was testing was built from the identical wrong
premise: that `any` was safe. A test cannot catch a belief it shares with the
thing it tests. It can only catch a slip.

That is the whole reason an outside question is worth more than another test
written by the same author. His questions had four recurring shapes, and every
bug found that day was one of them:

1. **"Is it really only X?"** — the rule you claim vs the rule that runs
2. **"Does it show right in every case?"** — all the states, or just the one built
3. **"Can it have two?"** — single-value code reading multi-value data
4. **"Can people just cheat?"** — the adversarial user nobody imagined

**Ask those four at your own work before someone else has to.** They are cheap,
they are mechanical, and they aim at the exact place your own tests cannot see —
not your mistakes, but your assumptions.

### 1.2i Bugs cluster where the ATTENTION is, not where the code is worst
The same day, before drawing any conclusion about quality, the coverage got
counted: the one component under active questioning carried **99 checks**, and
the entire rest of the product carried about **68 across twenty-one screens** —
seventeen of which had none at all.

So the component that looked buggiest was simply the only one being examined. The
honest reading is the uncomfortable one: *the other seventeen are not cleaner,
they are unobserved.* Confirmed immediately — the first cheap sweep across all of
them found real problems on eight.

**When a component seems to attract bugs, measure coverage before you conclude
anything about the code.** "Where are the bugs" and "where is anyone looking" are
the same graph until you separate them. And the fix is rarely more depth on the
thing already watched; it is a shallow check that runs EVERYWHERE. A cheap check
across the whole surface beats a thorough one on a tenth of it.

### 1.2j Asking for a feature that already exists is a bug report about finding it
Six notes came back on a data browser. One of them was *"can we have a sort by
feature?"* — and sorting had shipped a week earlier. Click a column heading; it
sorts, an arrow appears.

The dangerous reply is the true one: **"that already works."** It is accurate, it
closes the ticket, and it answers a question nobody asked. The person did not ask
whether the code contains a sort. They used the thing for an hour and never found
it. That is a finding, and it is a more valuable finding than a missing feature,
because a missing feature costs you a build and an undiscoverable one costs you
the build you already paid for.

What made it discoverable was not a label. It was making the feature **write its
own name into a place the person was already reading** — the query box that
already narrated every other action now gains a line, `sort ppg desc`, the moment
you click a heading. The mechanism that taught the rest of the language taught
this too. Nothing new to look at; one more thing said out loud.

**When told to build something that exists, never lead with "it already does
that."** Confirm what happens, then treat the ask as the defect it is: ask where
they looked, and put the answer *there*. Two cheap generalisations, both proved
in that same hour: an unlabelled control is invisible even to the person who
commissioned it, and a surface that already explains itself is the cheapest place
in the product to explain one more thing.

### 1.2l A verification tool's false NEGATIVE is its most dangerous output
One day of proving 148 facts against their sources broke the reading tool five
separate times, and every break had the same shape: **the evidence was on the
page and the tool could not see it.** In order of discovery —

1. **A curly apostrophe.** The publisher writes *Women’s* with U+2019; the stored
   answer uses U+0027. Zero matches.
2. **An accented name.** The reference site spells him *Dončić*; the question
   says *Doncic*. Zero matches, on the one row that settled the card.
3. **A 404 wearing a 200.** A mistyped id returned a 91 KB "Page Not Found" page
   at HTTP status 200. The size check waved it through and the tool searched an
   apology for evidence.
4. **Prose inside a `<script>` tag.** A modern news site renders from JSON in
   `__NEXT_DATA__`. The reader stripped every script as noise, so the page came
   back as a single line — its own title — while the subject's name appeared 75
   times in the raw bytes.
5. **Ranking by document order.** Matching lines were shown first-in-page, so the
   nav menu buried the one line that mattered.

What makes this a category rather than five bugs: **each one printed a confident
message, and the message pointed at the wrong culprit.** The tool said *NO LINE
ON THIS PAGE MENTIONS ANY OF IT — suspect the SOURCE*, and the source was fine
every time. A false positive survives contact with a careful reader, because a
careful reader looks at the evidence and rejects it. A false negative never gets
looked at: it closes the question before anyone opens the page.

**So build the negative path to be louder about its own limits than the positive
one.** Three cheap habits, all of which came out of this day:
- **Normalise both sides of any text comparison**, and treat every character a
  publisher renders differently — quotes, dashes, accents, non-breaking spaces —
  as a known enemy rather than an edge case. Two of the five were this.
- **A fetch is not a page.** Check that what came back is what was asked for,
  by title if nothing else. "It returned bytes" and "it returned the document"
  are different claims and only one of them was being made.
- **When a tool says "nothing found", the first suspect is the tool.** The cheap
  confirmation is a raw substring count against the untouched bytes: if the name
  is in the file 75 times and the reader shows zero, the reader is wrong. That
  one command would have caught three of the five immediately.

The corollary is about people, not code. A tool that cries wolf in the *negative*
direction trains its user to stop reading the source — which is the exact
behaviour verification exists to prevent.

### 1.2m When the page will not say it, count it off the page
Roughly a fifth of a day's verified claims could not be read anywhere, and were
settled by counting rows instead:

| the claim | what the page actually offered |
|---|---|
| a 33-game winning streak | a game log; the longest run of W results is exactly 33 |
| an 18th championship | a season table ending "Won Finals" 18 times |
| six titles as a head coach | a coaching record with six seasons marked champion |
| an 18-year partnership | two career tables sharing exactly 18 seasons |
| more blocks than points | two career totals, 2,086 against 1,599 |
| eight teams in a first season | a standings table with eight rows |

None of those sentences exists on any cited page. Every one of the numbers does,
one derivation away. **A source that does not state your claim may still contain
it**, and the reflex to declare "wrong page" is often just the reflex to stop at
prose.

Two guards, because a derivation is also a place to be quietly wrong:
- **Write down the derivation, not just the verdict** — "97 games, 81-16, longest
  run of consecutive W results exactly 33" is checkable by the next reader;
  "verified" is not.
- **Derive only what the page fully determines.** The same day, a career total
  was derived from a stats table and came out 34,811 against a true 37,062 —
  a parse that silently grabbed the wrong rows. That claim was left UNVERIFIED
  rather than shipped, which is the only correct ending for a derivation you
  cannot re-check. A wrong derivation is worse than a missing one, because it
  arrives wearing the costume of arithmetic.

### 1.2n A source can be honest, on-topic, and written too early
Checking 135 claims against their cited pages turned up zero wrong answers and
zero fabrications. The defect that actually recurred was subtler and I had no
name for it: **the page was published before the fact finished happening.**

- A card said a player finished the season with 1,021 points. Its source was
  the night she broke the season record — that story has her at 956 and "44
  points from becoming the first to reach 1,000."
- A card said a streak reached 15 games. Its source was the night it hit 13.
- A card said a coach *passed* the all-time wins leader. Its source was the
  night she *tied* him.

Every one of those pages mentions the right player, the right year, and the
right record. A verification pass that asks *"does the page mention this?"*
returns green on all three. So does a human skimming for the name. The check
that catches them is narrower and has to be asked deliberately: **does this
page assert the specific value on the card, in the tense the card uses?**

Two things follow. First, "verified" has to mean *the page states the claim*,
not *the page is about the claim* — and if you cannot quote the sentence, you
have not verified it. Second, this failure mode is created by good research
habits: you find the article about the event, and the article about the event
is usually written the day it started, not the day it ended. Records get
extended; the citation does not.

The same shape shows up wherever a claim has a final value and a running one —
totals, streaks, standings, counts, prices, versions.

### 1.2o Two ways a downloaded page can be empty, and neither trips a size check
A fetch that returns 20KB of HTML feels like a success. Two kinds of 20KB are
worthless, and both got through every guard the tool had:

- **A bot wall.** One publisher returned 281 characters of readable text
  reading "Access to this page has been denied." The tool duly reported
  *NO LINE ON THIS PAGE MENTIONS ANY OF IT — suspect the SOURCE* — aiming a
  careful reader at the citation when the problem was the download.
- **A framework shell.** Another publisher runs on a JS framework that litters
  the page with HTML comments like `<!--qv q:key=AxY3:3-->`. The reader
  un-wraps HTML comments on purpose, because one important source hides real
  data tables inside them. So every article from that publisher came out as
  pages of `qv q:key=` — and the relevance ranker cheerfully scored that
  garbage as the best evidence on the page.

The general lesson is about the *unit* of the guard. `len(body) > 500` measures
bytes, and bytes are not the thing you need; what you need is *readable text
relevant to the claim*. Measure the thing you will actually consume. And when
one rule exists to rescue one publisher (unwrap comments, for bbref), give it a
discriminator rather than letting it run everywhere — here, a comment
containing `<` is a stashed fragment and one without is a framework marker.
Both halves got an assertion, because a rescue rule that stops rescuing is as
bad as one that over-fires.

### 1.2q A guard has to fail CLOSED on its own incompleteness
Three times now in one project, a check has measured the right thing and not
stopped anything.

1. A metric was written, printed, and never added to the enforced list. It read
   correctly for weeks. The deliberate sabotage passed.
2. Fixed that, added the next metric to the enforced list, sabotaged it — and
   the gate still passed. The comparison loop said `if key in baseline`, and a
   brand-new metric is not in the baseline, so it was skipped. Silently.
3. The thing metric 2 was guarding — a generated file the game reads at
   runtime — had itself gone stale because the script that generates it was in
   no pipeline, no skill, and not in the "now run this" line the tool prints
   after every batch. What caught it was a git hook noticing a dirty file.

Same shape every time: **the guard was incomplete, and incompleteness looked
exactly like success.** Nothing is more dangerous than a green check that means
"I had nothing to compare against."

The rule that falls out is not "be careful", it is a design constraint:
**every skip path in a checker must be an explicit failure, not a silent
continue.** No baseline for a gated metric → fail and say so. Metric declared
but unenforced → fail and name it. File generated but ungenerated → fail. In
all three cases the message should name its own fix, because the person hitting
it is mid-task and will otherwise route around it.

And the meta-point, which is the reason this is written down a third time:
**a checker is code, and code you never break on purpose is code you have not
tested.** Every one of these was found by sabotage, none by reading. Break it,
watch it fail, put it back — and if the sabotage passes, the guard is
decorative no matter how right the number looks.

### 1.2p The first symptom of a network failure is usually about the wrong layer
A publisher was blocking every request, so I reached for a headless browser.
Every https:// load then died with ERR_CONNECTION_RESET, which reads exactly
like the publisher blocking harder. It was not. `example.com` failed too —
that one probe is what turned a site problem into an infrastructure problem,
and it cost nothing.

The real cause was three layers down and unguessable: the environment routes
HTTPS through a proxy, the browser sends a post-quantum TLS ClientHello of
~1,750 bytes, and the proxy resets anything that spills past one TCP segment.
curl's hello is ~400 bytes, so curl had never hit it. I only saw it by
tunnelling the browser's CONNECT through a 20-line logging relay and watching
"CONNECT → 200, client sends 1,753 bytes, upstream resets, zero bytes back."

Three transferable habits:
1. **Probe the boring case first.** If the thing you suspect is special fails,
   try something that cannot possibly be special. One request separates "they
   blocked me" from "nothing works."
2. **Get a byte count before theorising.** I burned two rounds guessing at
   browser feature flags. The relay log ended the guessing in one run, and
   1,753 bytes is a number you can search for.
3. **Reject the fix that would have worked for the wrong reason.** Disabling
   certificate verification also makes the error go away. It was the available
   fix, it was not the correct one, and the tool now carries a comment saying
   so — because the next person under time pressure will reach for it.

### 1.2r A test can fail for the reason you expected and still be broken
Fixing one bug produced two harness faults in ten minutes, and they point
opposite ways.

**The false FAIL.** The new harness walked four exit routes and three of them
failed exactly as the bug predicted. Very convincing. The navigation call was
`window.show && window.show('title')` — and `window.show` does not exist in
that app; the real handle is `BK._show`. The short-circuit made the call a
silent no-op, so those three routes never left the screen. They "failed"
because nothing happened. **A test that cannot perform its action reports the
same red as a test that performed it and found a bug**, and if the expected
answer is red, you will believe it.

**The false PASS, in the same file.** The music assertion read the track that
was actually playing. Headless never gets a gesture, so nothing plays, so the
value was always `null`, so `null !== 'tutorial'` passed — including under
deliberate sabotage. The fix was to ask the resolver that *decides* the track
rather than the speaker that plays it. It then reported `wants: tutorial` when
broken and `wants: menu` when fixed.

What these share is that neither was caught by writing the test carefully.
Both were caught by **running the suite against known-broken code and reading
every line of the output** — the false FAIL because three routes failed
identically and a real bug rarely lines up that neatly, the false PASS because
one assertion stayed green while its neighbours went red.

Three habits fall out:
1. **Sabotage is not a formality, and "it went red" is not the check.** Read
   *which* lines went red and whether the ones that stayed green had any right
   to.
2. **Assert against the thing that decides, not the thing that displays.**
   Resolvers are testable in a way that rendered output often is not.
3. **Verify your harness can do the thing before trusting it not to.** One
   assertion that the navigation actually moved the screen would have caught
   the first fault instantly — and is the same idea as loading `example.com`
   before believing a site is blocking you.

### 1.2k Fifty-one green checks on a walkthrough that taught against a blank screen
A guided tour got built for that same browser: nine steps, each highlighting the
control it describes. The harness was thorough by the standards of this file — it
walked every step, asserted the highlight landed on an element that was really on
screen, asserted no jargon in the copy, asserted the tour remembered itself and
replayed on demand. **Fifty-one checks, all green.**

Then I looked at the screenshot. The tour opened on the empty landing state. Six
of the nine steps were pointing at furniture that was not there — *"click a
column name to sort"* over a page with no columns, the highlight ringing an empty
panel. Every assertion was true. The feature was useless.

The check said *"the highlight is on a visible element"* and the empty-state panel
**is** a visible element. This is the general shape and it is not a bug in the
assertion: **automated checks confirm that behaviour happened; they cannot confirm
that it made sense.** Sense needs eyes, and the cost of the eyes is one
screenshot.

Two habits fall out, and the second is the load-bearing one:
- **Any feature whose output is a PICTURE gets looked at, however green the run
  is.** Not as a final flourish — as the step that decides whether the checks were
  asking about the right thing at all.
- **When looking finds something the suite missed, the fix is two fixes.** Repair
  the feature, then repair the check so it could have caught it. Here the tour
  learned to load an example before it starts, and the harness gained *"and loads
  an example first, so the steps point at something real"*, asserting rows and
  cells on screen. A screenshot that only fixes the product leaves the suite
  exactly as blind as it was.

The same session gave the miniature version of it. A text box that grows to fit
its contents was measured **while its tab was still hidden** — an element with no
layout reports a height of one line — so it shipped clipped, cutting three lines
off a four-line query on a phone. That is the third time in this project a
measurement was taken in a state where the thing being measured did not yet
exist. **A number read in the wrong state is worse than no number, because it
looks exactly like a number.** Say out loud when the reading is taken, not just
what it reads.

### 1.2e A tightening that RAISES the pass count is a bug until proven otherwise
The most useful catch in this project so far, and it was free.

The task was to make a quality rule stricter — instead of judging a whole
website, judge each section of it, so a news article on an official site stops
counting as an official record. Strictly more demanding. The model wired it up,
ran it, and the number of facts good enough to use went **UP**, 216 to 226.

It would have been extremely easy to accept that. There is always a story
available: *the new rules recognise some good pages the old ones missed.* The
story is even plausible. It was also wrong.

The rule matched section names as plain text anywhere in the web address, so the
rule for `/history` fired inside the *headline* of a news article —
`nba.com/news/history-3-pointer-evolution-larry-bird-stephen-curry` — and the
longest-match-wins tie-breaker then declared a news feature to be an official
record. Ten facts were promoted on the strength of a word appearing in a
headline.

**The check that caught it costs one sentence: which direction should this move
the number, and did it?** A rule that only removes things cannot add things. A
filter that only narrows cannot widen. When the arithmetic disagrees with the
intent, the arithmetic is describing a bug, and no amount of plausible
explanation outranks it.

This generalises past code. Any change with a KNOWN sign — stricter, cheaper,
fewer, smaller — comes with a free assertion. **State the expected direction
BEFORE running it**, out loud, so a surprise cannot be quietly reinterpreted
after the fact as a pleasant one. Stating it afterwards is worthless; by then the
number is the anchor and the mind is already writing the story.

The same run produced the mirror-image lesson. Adding the site to a "registered,
researched" list made it **less** strictly judged than an unregistered one,
because the careful path was written to trust its own list and skipped the crude
backstop the general path still ran. **Ask of any allowlist: is a member ever
checked LESS than a stranger?**

### 1.8 Jargon comes back hardest in the work it is proudest of
Named here because the story was in the build diary and the FAILURE MODE was
not — which is its own small lesson about where things get filed.

Flagged at least three times across one project: *"you fell back into jargon
again"*, *"what is a gate? what does bites mean?"*, *"too much jargon, plain
English simply please."* Each time it was fixed. Each time it came back.

The clearest relapse came the same day as a rule about it, in a sentence I was
pleased with: *"There are ~21 screens. 17 have no direct harness at all."* Every
word of that is true and it communicates nothing to the person paying for the
work. The plain version — *"the game has about 21 screens and 17 of them have no
automatic test watching them, so if one broke nothing would notice"* — is longer,
duller to write, and the only version that lets him check me.

**The pattern worth stealing: jargon creeps back hardest in the work the model
finds impressive.** The prouder it is of an analysis, the more it writes for
itself. Plain prose feels like a downgrade of clever work, so the clever work is
exactly where it stops.

**The check that binds better than a reminder:** make every deliverable pass
through fixed plain headings — *what we found / why it matters to you / your move
/ how sure we are.* Undefined terms have nowhere to hide in a sentence that has
to answer "why does this matter to you". And the cheaper personal version: **any
noun you would not say out loud to a friend gets three words of explanation the
first time it appears, every time, even the fourth time you have used it.**

### 1.3 Instructions are advisory; scripts are binding
Rules written in a config or instructions file get followed **sometimes** —
statistically better than nothing, but with no floor. A rule expressed as a
script that exits non-zero gets followed **every time**, because it isn't asking.

Rank order of durability, worst to best:
1. Said once in conversation — gone at the next compression
2. Written in an instructions file — read sometimes
3. Written as a check the model runs — read when it remembers to run it
4. **Wired into a gate that fails the build** — cannot be skipped

Push everything you actually care about to level 4.

> **If "gate", "fails the build", "regression" or "bites" aren't words you use,
> skip to §6 — it defines all of them and shows how to do this whether or not
> you write code. That appendix exists because the first draft of this file
> explained the idea in vocabulary the reader would need to already have, which
> is its own version of the mistake in §1.1.**

### 1.4 It defaults to the shape that works *today*
Left alone, a model reaches for flat files — one big JSON, one big list. This is
locally correct and globally expensive. It ships fast and then, at scale:

- the same person exists twice because a field could only hold one value
- nothing can be joined, filtered or counted properly
- fixing a name breaks every reference to it

**Nobody warns you.** The model isn't wrong, it's short-sighted, and short-
sightedness compounds silently. If a thing has *relationships* — people to
teams, facts to sources, anything to anything — say "model this as tables with
keys" **at the start**, not after 700 records.

### 1.5 It re-implements instead of importing
Given a helper file whose first line literally read *"Import this; never
re-implement it,"* the model wrote its own copy of that function — twice — and
got it subtly wrong both times, then wrote a comment claiming the copy matched.
Small divergences in an id-generating function are catastrophic and silent.

**Prompt to counter it:** *"Import the existing implementation. If you're about
to copy a function, stop and tell me why."*

### 1.6 "It ran without errors" is unrelated to "it's correct"
A data migration reported healthy row counts and had silently dropped a player's
entire career. Later, seven more distinct losses were found — all invisible to
counts. Correctness needs **value-by-value comparison**, done by a machine.

### 1.7 Context compression eats decisions — and it eats TO-DOS faster
Long sessions get summarised. Decisions made in conversation and never written
to a file **cease to exist**, and neither of you notices until you contradict
one. This is not a model flaw, it's a property of the medium — plan for it.

**The half of this I had to be told about.** I built a mechanism for decisions
and a mechanism for lessons, and neither covered the most fragile thing of all:
the work the session itself uncovers. One block of work turned up four real
tasks — a data defect counted at 40 rows, three unclassifiable sources, two
failure modes the new system could not catch — and reported all four to the
human in a tidy summary. None went into a file. The commit did not carry them.

**A to-do is more fragile than a decision, because explaining it feels like
handling it.** A decision gets revisited; someone eventually asks "what did we
settle?" Nobody asks "what did you mention in passing four hours ago?" And the
most fragile item of the lot is the one you talked them OUT of doing now — that
one has been discussed, justified, and agreed, which feels exactly like closure
and leaves nothing behind.

The fix is the same shape as everything else here: harvest the list with a
command, from the files that own the work, and never from memory. The trigger is
linguistic and worth stealing verbatim — **if a reply contains "still open",
"found but not fixed", "worth doing later", "its own job", or reports a bad
number without fixing it, that is an item, and it lands in a file in the same
turn.**

---

## 2 · What actually works

### 2.1 Turn every rule into a check that fails
The single highest-leverage move. A ratcheting gate — a script that records
today's numbers and fails if any metric gets worse — catches regressions no
review will.

**And verify the check bites.** A new check with no recorded baseline reported a
real problem and still *passed*, because it had nothing to compare against.
Break something on purpose and confirm the gate goes red. An unverified check is
worse than none: it grants false confidence.

### 2.2 Dry run by default
Every tool that mutates anything should write nothing unless explicitly told to.
`--apply` is a feature, not a formality. It converts "the model did something
unexpected" from an incident into a paragraph of output you read and discard.

### 2.3 Make the model prove things, not claim them
Ask for the artefact, not the assurance:
- "Run it and paste the output"
- "Measure the effect before you describe its size"
- "Break it on purpose and show me the failure"
- "Compare the values, not the counts"

### 2.4 One door for changes
When several tools could all write the same data, they eventually disagree.
Collapse them to one entry point and label the rest DO-NOT-RUN. The same
applies to ids: **derive once, then look it up.** Anything recalculated in two
places will diverge.

### 2.5 Name what is source and what is generated
The moment a file is machine-generated, editing it becomes a trap — your change
works, then vanishes on the next build. Say which files are source, which are
output, and have something shout when they drift apart.

### 2.6 Countable gaps beat filled ones
Given a hole, a model will helpfully fill it, and a guess that looks complete is
worse than a blank that is counted. Instruct explicitly: **do not invent; leave
it null and report how many.** "1,107 sources with no link" is a work item. A
plausible invented link is a landmine.

### 2.6a When the number won't move, interrogate the number — don't work harder
A gate had been stuck for days and the obvious reading was "check more facts".
Wrong. **33 items were already checked and correct, and were being rejected for
a reason nobody had read** — the gate wanted a source of a certain quality, not
a tick saying somebody looked. Reframing "verify more" as "find out why verified
things are being refused" turned a week of reading into an afternoon of
attaching better citations, and moved the number twice as fast.

The general shape: *effort that produces no movement is not insufficient effort,
it is effort aimed at the wrong requirement.* Before doing more of a thing, make
the model print the actual pass condition and check the work against it.

### 2.6b A small unexplained gap is the whole bug
Six items went in; the counter moved by five. That is exactly the size of
discrepancy that is easiest to wave off as rounding, a cache, "probably fine" —
and it was a real defect: one item carried a flag that excludes it **forever**,
under a label that reads *"needs a refresh pass"*, implying a refresh would
clear it. Nothing clears it. Forty-one items were silently in that state.

Chasing it cost one query. Not chasing it would have meant reporting progress
that wasn't there — for the third time in this project. Make the rule explicit:
**if in ≠ out, stop and find the missing one before writing the summary.**

### 2.6c Check the target is reachable before grinding toward it
Before committing to "26 more", ask what the ceiling is. Here: how many items
even *could* qualify, once the permanently-excluded ones are removed? Every pool
had at least 40 candidates against a target of 25, so the grind was worth
starting. Had one pool held 22, the correct move was to change the target, not
to work through the list and discover it at the end. **One query, asked before
the work rather than after it.**

### 2.6d Searching finds a page; only reading proves one
Web search returns confident summaries. They are not evidence — they are a
pointer to where evidence might be. In one batch three pages were rejected after
being fetched and read: a Hall-of-Fame bio that confirmed the event but never
contained the quoted phrase the question asked for; a second bio missing the
word entirely; and, the instructive one, an **official results page that was
actually a video index** — on-topic, substantial, listing "Women's Gold Medal
Game | France v USA", and never saying who won.

Add that to the catalogue of pages that arrive looking like successes: bot wall,
framework shell, duplicate not-found, 404-served-at-200, and now **the on-topic
page with the answer missing**. It is the most dangerous of the five, because
every keyword check passes.

Corollary learned the same hour: **a pattern that works twice is a lead, not a
rule.** The Hall-of-Fame URL shape settled two cards and then failed two. The
temptation after the second success is to stop opening the pages.

### 2.7 Write the test before the implementation — and make it adversarial
An executable spec with hostile cases, written first, is the cheapest quality
mechanism available. It also survives compression, which conversation doesn't.

**Then delete each guard and check the suite notices.** Twelve cases passed. To
prove they meant something, each protection was removed in turn to watch a case
fail. One deletion changed nothing — **eleven of eleven still passed with the
guard gone**, because the case written to cover it was passing off a different
rule that happened to produce the same answer. The suite had a hole exactly where
it looked strongest.

**A test suite tells you which guards are working. It cannot tell you which
guards are DEAD.** Only removing them one at a time does that, and it takes
minutes. Related but not the same as 1.2d: there the wrong thing was sabotaged;
here the right thing was sabotaged and the suite failed to react.

Two things follow. Cover each guard with a case that fails when ONLY that guard
is removed. And when a case has to be invented because no real data exercises it,
**mark it synthetic in the file and say so** — a guard protecting zero current
inputs is worth keeping and worth being honest about, and the next person needs
to know which of those they are looking at.

**Do not use `git checkout` to undo sabotage — restore from a copy.** This is
the same lesson as the paragraph below and it recurred THREE TIMES in one day
after being written down, which is the point: the instruction did not bind, so it
had to become a procedure. `cp file file.bak` before the break, `cp` back after.
`git checkout` reverts the whole file including work that has nothing to do with
the test, and it fails silently — the third time, it reverted a stylesheet while
leaving the matching markup in place, so the two sat out of sync for an hour
before a check caught it.

**Commit BEFORE you break things, every time.** Sabotage means editing a real
file and undoing it after, and the natural undo — `git checkout <file>` — throws
away every uncommitted change in that file, not just the sabotage. It did exactly
that here: a break-it run on a planning doc reverted forty minutes of unrelated
edits sitting in the same file. The work was reconstructible and it still cost
real time. **The habit is one line: commit, then break, then `git checkout`
undoes only the damage you meant to do.**

### 2.8 Ask it to say "I haven't checked"
Models don't volunteer uncertainty; they will use the phrase if you make it an
explicit, blessed option. Put it in the instructions verbatim.

---

## 3 · Prompting patterns that earned their keep

| Situation | What to say |
|---|---|
| It states a number | "What command produced that?" |
| It describes an effect's size | "Measure it. Show both conditions." |
| It's about to build data storage | "Model this as tables with keys, not flat files." |
| It's writing a helper | "Import the existing one. Don't copy." |
| A migration or bulk edit | "Prove nothing was lost — compare values, not counts." |
| It adds a check | "Now break it on purpose and show me it fails." |
| Anything destructive | "Dry run first." |
| A long session | "Write the decisions to a file now." |
| It sounds very sure | "Which of that did you verify?" |

---

## 4 · Architecture notes for AI-built systems

> **Aaron, 2026-08-04, after a day spent fixing instead of building:** *"Next
> time I will build cleanly from the start, designing skills and workflows to
> make sure we are auditing and recording everything as we build. If there is
> data that is referenced in multiple places and needs to be stored then build a
> database. We have to think deeply about these things... so we are not sitting
> here fixing bugs all day and all night instead of building."*
>
> This is the most valuable paragraph in this file and it was written by the
> person paying for the mistakes, not the machine making them. Everything below
> is a footnote to it. The three things he names — **audit as you build**,
> **a real store for anything referenced twice**, **decide the workflow before
> the work** — are each retrofits that cost this project a full day or more.
> A retrofit is never as good as the original: the tables went in weeks late and
> the game still reads only the first value out of half of them.

- **Relationships need tables from day one.** The test: *can one of these have
  more than one of those?* If yes, it cannot be a single field. Retrofitting
  this later cost a full day and surfaced eight data losses — and the retrofit
  was still incomplete months on, because the CONSUMERS were never updated to
  read more than one value. Fixing the storage is half the job; every place that
  reads it is the other half, and it is the half that gets forgotten.
- **Build the audit trail before the thing it audits.** Not the tests — the
  RECORD. What was decided, what is still owed, what was learned. Each of those
  became a script here only after the absence had already cost a day, and each
  script immediately found things that had been quietly lost for weeks.
- **Ids are the load-bearing thing.** Assign once, freeze, look up. Never let two
  code paths compute the same id.
- **Every mutation path needs a gate on the way out**, not a review on the way in.
- **Separate "what is true" from "what is displayed."** Keeping the original text
  alongside the parsed fields saved a silent product change where every award
  would have been reworded.
- **The model will optimise for the demo.** You supply the time horizon.

**Where the model actually lives (slash commands, background runs) — learned
2026-08-01, checked against a live run:**

- **A slash command is stored text, not a program.** Typing `/deep-research`
  pastes a saved prompt into the conversation; nothing else. It has no model,
  no engine, no settings of its own. Whichever model the session is set to at
  that moment is who does the work. "Which model should I run this command
  with" = "which model should the session be on when I send it."
- **A background run is a fleet of separate workers, and which model they use
  is written in the run's script file — a checkable file, not a mystery.**
  Checked on the 22af research run: `grep model <script>` → zero matches → no
  worker pins a model, so every worker inherits the session's model. Launched
  under Opus 5, so it is an Opus 5 sweep.
- **Do not switch the session model while a run is in flight if you care which
  model does the work.** Workers spawned after the switch may pick up the new
  model — unverified either way, and "unverified" is exactly why the rule is
  "don't create the ambiguity."
- **A background run does not make the foreground model dumber.** Its workers
  have their own separate context windows; nothing about their load degrades
  the quality of answers in the main conversation. What IS shared is the
  usage/rate-limit pool — a background sweep burns budget, not brains. The one
  real coupling: when the run finishes, its report lands in the main
  conversation's context, and a huge report crowds that window like any other
  long paste would.

---

## 5 · Keeping this file alive

Two mechanisms, because §1.2 says a note asking nicely will not work:

1. **A `PreCompact` hook** fires before the conversation is compressed and
   reminds both of us to write down anything learned but not yet recorded.
   Configured in `.claude/settings.json`.
2. **A standing rule in `CLAUDE.md`**: when a mistake is made and understood,
   the lesson lands *here* if it is about working with AI generally, and in the
   project's own docs if it is about the project.

**Bias toward adding.** A lesson that turns out to be obvious later costs one
paragraph. A lesson lost costs the mistake again.

---

## 6 · Plain-language appendix: what those words mean, and how to actually do it

Added because §1.3 and §2.1 are the most useful ideas in this file and were
written in words that assume a software background. If you are teaching from
this, teach from here.

### 6.1 The words

**Regression.** Something that used to be fine got worse. Not necessarily a new
bug — usually a *number moving the wrong way*. "We had 12 questions with no
source; now we have 19." That is a regression. The word just means *slid
backwards*.

**A gate.** A checkpoint that answers yes or no and stops you if the answer is
no. A bouncer. In practice it's a small program that looks at your work and
either says "fine, carry on" or "no, here's what's wrong."

**The build.** The automated run that checks and assembles your project — tests,
checks, packaging. On a small project it might just be "the one script I run
before I ship."

**Fails the build.** The gate said no, so everything stops and you see red. The
point is that it is *not a suggestion*. You cannot proceed by ignoring it, the
way you can ignore a note in a document.

**Bites.** My slang, sorry — it means *the check actually catches the thing it's
supposed to catch*. You prove it by breaking something on purpose and watching
the gate go red. A check nobody has seen fail is not known to work.

**Baseline / ratchet.** You record today's numbers, warts and all. From then on
the gate fails only if a number gets *worse*. Existing problems don't block you;
new ones do. "Ratchet" because it only turns one way — as you fix things, you
record the better number and it can never slide back.

**Exit code.** How a program says pass or fail: `0` means fine, anything else
means failed. That's the entire mechanism a gate runs on. It is not complicated
— it is one number.

### 6.2 If you don't write code

**You don't need to write the script. You need to know what to ask for, and how
to check you got it.** Four steps:

1. **Say the rule in plain words.** "Every question must have exactly four
   answer options." "No player should appear twice." "Every fact must cite a
   source that exists."
2. **Ask for it as a check, with the proof.** The prompt that works:
   > *"Write me a script that checks this rule and exits 1 if it fails. Then
   > break something on purpose and show me the script catching it."*
   That second sentence is the whole game — it is the difference between a check
   and a check that works. Do not skip it.
3. **Write the command down where the AI will see it** — your project's
   instructions file, your README, a pinned note. One line: `python3
   tools/check.py`.
4. **Make running it the definition of done.** "Run the check and show me the
   output" before you accept any change. If it can't show you a green result,
   it isn't finished.

That's the whole practice. The AI writes the code; **you own the rule and you
own demanding the proof.** Nothing in those four steps requires reading the
script.

### 6.3 If you do write code

Same idea, more teeth:

- Keep the recorded numbers in a small file next to the script (a "baseline").
  The script compares today against it and fails on anything worse.
- Add a `--update-baseline` switch for after a genuine fix, so the ratchet only
  turns toward better.
- Run it from a git pre-commit hook or CI so it fires without anyone
  remembering.
- **Beware the empty baseline.** A brand-new check has nothing to compare
  against, so it can report a real problem and still pass. This actually
  happened here: the check found the fault, printed it, and exited 0. Record the
  baseline, *then* re-break it, and confirm red.

### 6.4 The smallest useful gate, start to finish

Worth doing once on something trivial, just to feel the shape:

1. Rule: *"every question has four options."*
2. Ask the AI for a script that counts violations and exits 1 if any exist.
3. Run it. It says `0 violations`, exits 0. Green.
4. **Deliberately delete one option from one question.** Run it again. It says
   `1 violation`, exits 1. Red. *Now you know it bites.*
5. Put the option back. Green again.
6. Write the command in your instructions file.

Step 4 is the one everybody skips, and it is the only step that proves anything.

### 6.5 Why this beats writing rules down

A rule in a document is read *sometimes*. A gate runs *every time*, and doesn't
care how confident anyone is feeling. That is the entire argument, and §1.2 is
the evidence: a rule written into a project file in the clearest possible terms
was ignored the very next day — by a model that had the file available and
simply did not open it.

**Rules persuade. Gates enforce. Only one of those has a floor.**

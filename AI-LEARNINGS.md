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

**AND THE ERRORS ARE NOT RANDOM. THEY LEAN.** This is the part I had not seen
until a palette audit produced four unmeasured claims in one draft and I
checked all four at once:

| What I wrote | What it measured | Which way the error pointed |
|---|---|---|
| "next-closest league pair is 34" | 23.2 | milder |
| "correct-green sits 21 from easy-green" | 16.1 | milder |
| "every other neighbour pair is 55 to 61" | 55 to 69 | tidier |
| "the team blue and the rarity blue never share a screen" | they do, roughly one game in four | milder |

Four for four in the direction that made my own findings sound smaller and the
palette sound healthier. That is not sampling noise, it is a bias with a
mechanism: an unmeasured number gets filled in from what would be *unsurprising*,
and the unsurprising value for "how bad is this" is always "not that bad." The
same pull tidies a messy range into a neat one.

Two things follow, and they are more useful than "measure more":

1. **The flattering direction is the tell.** When it states a number it did not
   run, guess which way the error goes before checking: it will almost always be
   the direction that makes the current story hold together. If a claim would be
   *inconvenient* if wrong, that is exactly the one to run.
2. **"These never overlap" is an assertion, not a caveat.** The worst of the
   four was not a number at all, it was a scope claim used to DOWNGRADE a
   finding. Reasoning that ends "so it does not really matter" is doing the work
   of a measurement without being one. It took one harness argument to prove it
   backwards, and that harness argument now exists precisely because the claim
   was not checkable before.

**The fix that stuck:** the numbers are computed by the tool that writes the
page now, so they cannot be typed at all. A number you cannot type is a number
you cannot round in your own favour.

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

### 1.2c2 Filed into a document nothing reads is the same as not filed
The companion to 1.2c, and it caught me even though 1.2c was already written,
because the failure wears the clothes of success.

A contradiction between the design doc and the shipped game was found,
understood, and written down the same day, in the working document where the
thinking happened. Correct behaviour by every rule this project has. The next
day the owner asked about that exact rule, and it did not surface, because the
two commands that exist to answer "what is owed" read a fixed list of home
documents and a working doc is not on it. So the answer had to be rebuilt from
scratch, and the reconstruction is the expensive part.

**Writing it down is two requirements, not one: it has to be RECORDED, and it
has to be REACHABLE by whatever you will actually run next time.** A note in
the wrong file satisfies the first and fails the second, and it fails silently
forever, because nothing in the world reports a document that is never read.

The tell: you are writing an item into the file you happen to have open. That
is a convenience, not a decision about where it belongs.

Two fixes, and only the second is durable:
1. Move the item to the home the harvester reads. Necessary, but it relies on
   remembering, and the whole point is that nobody will.
2. **Make the harvester NAME the places it does not read.** It does not have to
   harvest them, which would wreck one-home-per-thing. It only has to say "this
   working doc has a section called Open For Aaron To Rule, containing six
   items, and none of them are counted above". A gap that announces itself is
   not a gap.

Generalises past to-do lists: any index built from a fixed list of sources
should be able to enumerate what it is NOT covering. **A tool that quietly
covers 80% reads exactly like a tool that covers everything.**

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

**The sharper version, and it is worse: the test can run in the one condition
where the bug it tests for CANNOT HAPPEN.** A card was overlapping a button, so
the fix moved the card and the test asserted no overlap. It passed. It also
passed with the fix removed, because it ran at phone width and the overlap only
exists on desktop, so "no overlap" was true for free. Not a narrow test · a
**vacuous** one, and a vacuous test is more dangerous than no test because it
prints a green tick next to the exact claim it never checked.

Narrowness and vacuity look identical from the outside: both are green. What
separates them is whether the assertion COULD have failed under those
conditions, and you cannot answer that by reading the test. You have to run it
against the broken code. **So the habit that catches this is not review, it is
sabotage: turn the fix off and require the test to go red before you believe it
green.** In this case the sabotage block was already in the file for other
reasons, and it is what reported "0 overlapping" where the fix's own assertion
had happily reported success.

Corollary for anything positional: an overlap, a collision, a wrap, a clip is a
claim about a GEOMETRY, so measure the geometry across the range first and pick
the test conditions from where the numbers say the problem lives. Measured here:
14px of overlap at 1440×760, 1px at 390×844, none at all at 390 for the case
first tested. Three viewports, three different answers, one of them useless.

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

### 1.2k2 A bug report names a SYMPTOM · your reading of the cause is a guess
The report was *"sometimes the coach covers an action, like a pass, when in the
passing drill, and selected another player."* Every noun in that sentence points
at the board: a pass, a drill, selecting a player. So I went hunting for the
card covering board TILES, and I would have shipped a fix for that.

Measured, the card never covers a tile on a phone · not in that drill, not in
any of them. What it covers is the row of buttons holding **CONFIRM**, by 14px
on desktop. "An action" did not mean an action on the court. It meant the
button that performs the action. The screenshot is almost funny: the card sits
across CONFIRM while its own text says *"hit Confirm ✓"*.

The trap is that my reading was not unreasonable · it was the most natural
reading of the words, it was specific, and it came with a plausible mechanism.
That is exactly what makes it dangerous. A wrong hypothesis that feels obvious
does not get tested, it gets implemented, and the resulting fix is real work
that changes nothing the reporter will notice.

**So treat the report as evidence about the SYMPTOM only, and enumerate the
candidates that could produce it before choosing one.** Here there were three
things the card could be covering · tiles, pieces, buttons · and measuring all
three took one script and about four minutes. Two of them were never covered at
all. The measurement did not confirm my reading, it replaced it.

The tell that you are guessing rather than knowing: you can describe the cause
but not state a number for it. "The card covers the board" has no number in it.
"14px at 1440×760, 1px at 390×844, 0 at 390 for tiles" is the same sentence
after the work has actually been done.

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

### 1.2s The player sees what RENDERS; the gate counted what was TYPED
The em-dash ban is enforced at the strongest level this file knows: a build
gate holding the count at zero, swept clean of 584 old debts in one pass, no
grandfathering. Two days later, eight em dashes were rendering to players —
while the gate stayed green. They were written `\u2014` inside JavaScript
strings: to the renderer that is an em dash, to a counter looking for the
literal character `—` it is six harmless ASCII bytes.

This is §1.2o's "unit of the guard" lesson wearing different clothes, and it
survived even a level-4 gate (§1.3), which is why it gets its own entry: **a
gate inherits the representation it reads.** Between the source a gate can
scan and the pixels a user consumes there is usually at least one decoding
step — string escapes, HTML entities (`&mdash;`), a build that emits files
the gate doesn't cover, a template that concatenates. Every one of those
steps is a tunnel under a gate that matches literally.

The check: when banning an OUTPUT, enumerate the spellings that produce it in
every language the repo writes it in, and count them all — or gate the layer
closest to the user (the rendered DOM, the emitted file) where the spellings
have already collapsed to one. The counter here now reads `\u2014` in copy
files as what it is: an em dash wearing a disguise.

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

**When one symptom gets several fixes, sabotage each fix ALONE.** A bug bad
enough usually collects a belt and braces — a cause fix, a guard, a cleanup
tick. Revert them one at a time and confirm the harness goes red each time;
one bug here took four fixes, and all four lone reverts sent it red.
Without that pass you cannot tell load-bearing from decoration, and the
decorative ones will be "simplified" away by a future session with the
harness still green.

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

### 2.6e A sentinel that is also a valid value is not a sentinel
A gate had a documented "final fallback" — *if everything else fails, return item
zero.* So the test asserted that getting item zero meant the fallback had fired.
It reported thirteen failures. All thirteen were in the same category, which was
the tell: **item zero was also a perfectly ordinary item** that the picker could
legitimately return at random. The system was fine; the test was measuring a
coincidence.

Two things to take from it. First, when failures cluster suspiciously — all one
type, all one tier, all one hour — suspect the instrument before the machine.
Second, and more useful: **test the property you actually care about, never a
magic value that stands in for it.** The real question was "was the thing the
user received a verified one?" — which is directly checkable and has no
false positives. "Did we hit the fallback?" was a proxy, and the proxy was
wrong.

### 2.6f The most dangerous test is the one that cannot fail
The same test's sabotage step reached into the page and overwrote a global to
make every item invalid, then asserted the system noticed. It reported success.
The global did not exist — the program never exposed it — so the sabotage
mutated nothing and the assertion passed on an untouched system.

A check that silently proves nothing is worse than no check, because it *buys
confidence*. Everything downstream is now resting on a green tick that was never
earned. This is the third time in one project that a check has been caught
measuring correctly and biting nothing.

The habit that catches it, and it is cheap: **a sabotage step must be
two-sided.** Do not only assert "with the guard on, nothing bad gets through."
Also assert "with the guard off, something bad DOES get through." If both hold,
the guard is real. If the second one fails, your test cannot fail either — and
you have just learned that before shipping instead of after.

### 2.6g "It's not on the page" often means "my tool can't see it"
A page was declared a bad source because the numbers the task needed were not in
its text. They were in a **diagram**. The extraction step strips a page to words
and silently discards every image, which is right for articles and blind for
anything drawn — and the failure reports identically to the source genuinely not
having the fact.

The tell is a page that is unmistakably about the right subject and yet appears
to be missing the one thing it exists to state. Before concluding the source is
bad: **pull the image out, download it, and look at it.** Modern models can read
a diagram; the text pipeline in front of them usually cannot.

This matters far beyond one page. Diagrams, tables published as pictures,
scanned documents and screenshotted statistics all fail this way, and the oldest
and most valuable records in almost any domain live in exactly those formats.
An "unsourceable" backlog is worth re-reading with this in mind before anyone
spends money commissioning replacements.

The wider habit: when a tool reports absence, separate **"the fact is not
there"** from **"my instrument cannot perceive it."** Those demand opposite
responses — the first means find another source, the second means find another
instrument.

### 2.6h "I tested it on mobile" is not a measurement. Which mobile?
A layout shipped with an empty grey rectangle on the user's phone. I had checked
it at 390px and it passed honestly: the rule was
`repeat(auto-fit,minmax(190px,1fr))`, two 190px columns do not fit inside 390px,
so the grid collapsed to one column and three panels filled it. **His phone
reports 440px.** Two columns fit, three panels leave a fourth cell empty, and
the container colour showed through the hole.

Two separate failures, and the second is the one worth keeping.

**The shallow one:** I picked a single width and called it "mobile". Phones in
use span roughly 320 to 440 CSS pixels, and the interesting behaviour lives at
the breakpoints between them. Testing one width tests one width.

**The real one:** the layout's correctness depended on **how many items happened
to be in it.** Three panels in two columns is broken; four is fine; five is
broken again. Nobody was ever going to remember that constraint while editing
copy. Raising the column floor to 195px would have "fixed" the screenshot and
left the trap armed for the next phone and the next panel.

So the fix was not a number. It was removing the dependency: separate cards with
their own borders, so an empty cell is invisible even if one appears, plus an
explicit column count so the count is always a multiple.

**And the check now asserts the arithmetic, not the appearance:**
`holes = (cols - cards % cols) % cols` must be 0, evaluated at nine widths. That
assertion cannot be satisfied by luck, and it fails on the exact configuration
that shipped. A screenshot review would have caught this instance; only the
arithmetic catches the class.

The general rule: **when a bug is found at one value of a parameter, ask what
the parameter is. If the answer is "a number I chose", the test must sweep the
range. If the answer is "a coincidence between two things that vary
independently", the fix is to remove the coupling, not to re-tune it.**

### 2.6i Before inventing a device, check whether the system already has one
Asked for a background on a new page, I hand-drew a court in SVG, faded it until
it was invisible, and shipped it. The owner's reply was that he could not see it.
The product's main screen had been painting a full illustrated backdrop behind
itself since the first release: a real image, already licensed, already loaded,
already tuned, with the exact treatment values sitting in a stylesheet twenty
lines long.

I never looked, because the request read as "make a background" and I can make
backgrounds. **Competence at the task is exactly what stops you asking whether
the task is necessary.**

Two costs, and the second is the expensive one. The wasted hour is trivial. The
real damage is that a surface built from scratch **looks like it came from
somewhere else** — different motif, different weight, different mood — and a
product that does not look like itself is a much harder thing to fix later than
a missing image.

The habit: when you are about to build a visual element, a state machine, a
retry policy, a date parser, anything, spend two minutes asking **"does this
system already solve this, and where?"** Grep for it. Open the design doc. Read
the screen that does the closest thing. The answer is yes far more often than
feels plausible, especially in a codebase you did not write and doubly so in one
you did.

And when you do reuse it: **copy the values across and say in a comment where
they came from.** A duplicated constant with no note is a fork waiting to
happen, and the fork shows up as drift the day somebody retunes the original.

### 2.6j A summary written from memory cannot be trusted to be complete
I hand-wrote a status board that was meant to be the one complete view of a
project, and the owner's reaction was that most of his backlog was missing. He
was right: the source documents held 211 items, the board showed about 20.

Nothing about that was careless. Each item on the board was accurate, well
written and correctly described. **The defect was not in what was there, it was
in the relationship between the board and its sources: there wasn't one.** I
read the docs, understood them, and wrote a page from that understanding, which
means the page's coverage was a function of my attention at one moment.

This is the specific failure mode worth naming: **an incomplete list is
indistinguishable from a complete one.** A wrong number gets challenged. A
missing row is invisible, to the writer most of all, because you cannot notice
the absence of something you did not think of. Every other quality habit
(measure before asserting, break the test on purpose) protects against being
WRONG. None of them protects against being INCOMPLETE.

The fix is not to try harder. It is to change what the artefact IS:

1. **Generate the list from the source, and print the count.** 211 versus 20 is
   an argument that ends immediately. A number nobody had was the whole problem.
2. **Fail the build when the output has fewer rows than the input.** A silently
   dropped item is exactly the failure the rebuild exists to prevent, so it
   should be an error and not a warning.
3. **Separate what exists from how it reads.** The harvester decides the
   contents, a renderer decides the wording, a template decides the look. Mixed
   together, the contents can only be as complete as the person writing the
   prose.
4. **Keep the curated parts, and keep them small.** A generated list cannot know
   what to do next or why it matters. Judgement still has to be written by hand;
   it just must not be the thing that determines coverage.

Generalises well past status boards: API documentation, test matrices,
changelogs, dependency inventories, security checklists. **If completeness is
the point of the artefact, the artefact must be derived, not composed.**

### 2.6k An empty field that means two things is a bug waiting for a wrong number
A column was serving double duty: a card with no era tag might be one nobody had
got to yet, or one that genuinely belongs to every era (today's rulebook, a
career-spanning record). Same empty field, opposite meanings.

Everything downstream then had to GUESS which was which. My progress metric did
it with a heuristic — category names plus phrases like "all-time" — and a
heuristic dressed as data will eventually be quoted as data. The owner spotted it
before I did and asked for the obvious fix: an explicit "all eras" value.

**The fix exposed a second bug immediately, and this is the part worth keeping.**
Adding the tag broke the filter. Those cards had previously passed the era filter
by having *no* tag; once tagged, they were checked against the list of decades,
did not match, and vanished. The code was relying on absence as a signal, so
supplying real data broke it. **Wherever a system treats "missing" as meaningful,
adding the missing information is a breaking change**, and that is deeply
counter-intuitive: you expect filling a gap to be safe.

Then a third thing, which is the one I keep repeating. My check for the fix
reported `total: 0` and still printed GOOD, because the guard compared `0 === 0`.
**A check whose subject is empty has proved nothing and must say INCONCLUSIVE,
never PASS.** Every assertion over a collection needs a non-empty precondition
before the assertion itself.

The habit worth taking away: when a field can be empty, write down what empty
MEANS. If it means more than one thing, that is not a documentation problem, it
is a missing value in the vocabulary, and the day you add it something will
break.

### 2.6l Rewriting a stale document launders its stale claims into fresh ones
I was asked to re-sort a priority list. The old version was nine days out of
date, which is why it was being replaced. So I read it, reorganised it, and
carried its content across into a new section stamped with today's date.

One of the lines I carried said a particular design question was **"Awaiting
Aaron."** It had been decided nine days earlier, by him, in writing, in another
file I have read. The old list was stale about it. My new list was *wrong* about
it — and worse, it was wrong in my own voice, at the top of the exact document
he reads to decide what to do next, with today's date on it. A reader would have
gone looking for a decision they had already made.

**The mechanism is worth naming, because it is invisible while you are doing
it.** Text you copy from an old document feels like text you are *preserving*,
so it does not trip the part of your brain that checks claims. But the reader
cannot see which sentences you wrote and which you inherited. Every sentence in
the new document is an assertion you are making today. Rewriting is not
copy-editing; **it is re-signing every line.**

What actually caught it was reading a different entry in the same file — an
older one, further up, that recorded the ruling. Not cleverness, just reading
more of the thing I was editing than the part I was replacing.

The habit: when you replace a stale document, **the parts you keep need checking
harder than the parts you change**, because the parts you change are already
getting your attention. Two cheap moves that would each have caught this: grep
for every "awaiting", "TBD", "open question" and "blocked on" you are carrying
forward and re-verify each one; and treat any inherited claim about *somebody
else's* pending decision as false until you find the decision or its absence.

### 2.6m A STATUS has a system of record. Ask the system, not the document.
The same day as 2.6l, and it looks like the same mistake until you look at the
mechanism, which is different and more common.

I wrote a launch plan from scratch. Its top build item was **"Merge the Daily
Five — built, 48 checks green, sitting on a branch,"** with a confident line
underneath: *finished work that is not live is the worst state anything can be
in, nothing new starts before this ships.* I published it as an artifact. Then I
went to do it and ran `git cat-file -e origin/main:docs/play/daily.js`.

It was already on main. It had merged that morning, in a merge I performed.

Nothing was inherited here — I wrote that row myself, today, in my own words.
What I inherited was a **status**, from a line in a planning doc that had been
true for about a day. And a status is a different kind of claim from an
argument or a design decision: **it describes the state of a system, and the
system can be asked directly.** Git knew. One command, no ambiguity, no
judgement, and it would have taken two seconds at any point in the several
hours between reading that line and publishing a page built on it.

**Why this is worth its own entry.** 2.6l says the lines you carry forward need
checking. This one is narrower and sharper: *a status line in a document is a
CACHE of something the system knows, and caches go stale silently.* Nobody
updates a planning doc at merge time; they update it when they next open it.

The generalisation, which is the useful part:

| The doc says | The system that actually knows |
|---|---|
| "not merged", "on a branch" | `git cat-file` / `git log origin/main` |
| "not started", "no such file" | `ls`, `find`, `grep` |
| "N cards passing" | run the counter |
| "the test is green" | run the test |
| "blocked on a decision" | the file where decisions live |

**The habit: before a status becomes the FIRST ITEM in a plan, ask its system.**
Not every status in the document — that is a tidy-up job. Just the ones load-
bearing enough that work is about to be sequenced around them. The cost of the
check is seconds; the cost of skipping it is that the plan's headline item is
already done, which quietly discredits every row under it.

And the compounding is the real damage: the stale line went into V0, V0's line
went into a plan, the plan went into a published page. **Three surfaces, one
unverified sentence, and each copy looked more authoritative than the last.**

### 2.6n The hardest claim to check is the one about YOURSELF
I wrote a document for Aaron's lawyer describing how the project gathers facts.
One sentence: *"A person opens a page, reads it, and writes one question from
it. No crawling, no bulk download. Automated fetches are rate-limited well below
the published ceilings."*

Aaron did not argue with it. He said: *"Just give this quote a thought."*

**All three clauses were false.**

| what I wrote | what was true |
|---|---|
| "a person opens a page, reads it" | the assistant fetches it, the assistant reads it, a person reviews the batch |
| "no crawling, no bulk download" | one automated pass had fetched **80 season pages** in sequence; 374 pages cached overall |
| "rate-limited well below the published ceilings" | **1.5s apart = 40 requests/minute, against a published ceiling of 20** and a robots.txt `Crawl-delay: 3`. Double, not below. |

**And I had both numbers in hand.** The 1.5 was in a file I had read that same
session. The 20-per-minute was in a research return I had filed myself two hours
earlier. I never put them next to each other. Two facts in hand and the
multiplication never done.

**Why self-description is a distinct failure mode**, and worse than the ordinary
kind. An external claim feels like a claim, so it triggers the instinct to
check. A claim about your own system feels like *recall*, and recall does not
trigger anything. So I wrote down what the code was DESIGNED to do — politely,
one at a time, a human in the loop, all of it true as an intention — and
presented it as behaviour. **The gap between intent and behaviour is invisible
from the inside, because the intent is the thing you can actually see.**

Three aggravations worth keeping:
1. **It was in the highest-stakes document I had produced.** Descriptions of
   your own conduct going to a lawyer are precisely the sentences that must be
   measured, and they are the ones least likely to feel like they need it.
2. **It flattered us.** Self-descriptions err in one direction. That is a
   detectable bias: if a sentence about yourself would be embarrassing to be
   wrong about, it is the one to check first.
3. **It quietly answered the question the document was asking.** Question 2 of
   that brief asks whether a clause about "prompting AI models" reaches a human
   using an assistant. Describing our method as "a person opens a page and reads
   it" assumes the favourable answer inside the fact pattern. A lawyer reading
   it would have answered a question about someone else's project.

**The habit: before describing your own system to anyone outside it, run the
thing.** Not "check the code says 1.5" — divide 60 by it and compare to their
number. And write self-descriptions in the least flattering accurate form
available, because the flattering version is the one that gets a wrong answer
back.

**The durable fix was not a better sentence, it was `tools/politeness.py`** —
the limit now lives in one file with the quote that sets it next to the number,
and both fetchers read from it. A rule that lives in two constants drifts and
nothing notices; that is how 1.5 and 3 ended up in two files, neither matching
the ceiling.

### 2.6o A shared verb that quietly no-ops for one caller is worse than no verb
The game has one way to pause: `BK.freeze()`. Every coach tip called it, and had
called it correctly for weeks. Then a second screen — the Daily Five — was built
beside the engine rather than on top of it, with its own shot clock.

`freeze()` still got called there. It still returned. **It just didn't do
anything,** because there was no engine game to hold. So for as long as that
screen existed, the coach could interrupt a timed question and the timer kept
running underneath him. The code read as correct at every single call site.

Aaron found it by playing: *"Make sure the coach popup pauses daily 5
gameplay."*

**The shape, and it is general.** A verb like *freeze*, *save*, *invalidate*,
*flush* gets defined against one subsystem and then becomes the vocabulary
everybody uses. When a second subsystem arrives that the verb does not reach,
nothing breaks — the call succeeds, the caller believes it worked, and the
failure is a silence. **A no-op is indistinguishable from success at the call
site, which is exactly why it survives review.** A `freeze()` that threw on a
screen it could not hold would have been found in a minute.

Three things that make it likelier, all of which were true here:
1. **The second subsystem was built later and deliberately kept separate** —
   which was the right call for the code and the wrong call for the vocabulary.
2. **The verb sounds global.** "Freeze" does not name what it freezes. `freeze()`
   reading `freezeEngine()` would have raised the question by itself.
3. **The no-op was intentional somewhere else.** Freeze is *supposed* to do
   nothing in online games — you cannot pause the other phone. So a documented,
   correct no-op existed already, and it taught everyone reading the code that a
   quiet freeze is normal.

**The fix that generalises is not "add a second call".** It is to make the
holding function ANSWER: `clockHold(true)` returns the milliseconds it parked,
or 0 if there was nothing running. The coach uses that answer to decide whether
it is even allowed to say *CLOCK STOPPED*. **A pause that reports what it paused
cannot silently pause nothing** — and the same return value turned out to be
the content of the message.

**The habit:** when you add a subsystem beside an existing one, grep the shared
verbs and ask of each, *does this reach the new thing?* And when you write a
function whose whole job is a side effect, have it return whether the effect
happened. The caller almost always has something useful to do with that, and the
day it returns 0 you find out.

### 2.6p If a comparison varies a parameter, prove the parameter varied
The before/after page for a UI change was supposed to show both of the game's
themes. The script set a `localStorage` key, took eight screenshots, printed a
clean report, and every check passed.

**Two of the files were byte-for-byte identical.** The key it wrote — `bk_theme`
— is not read by anything. The theme lives inside a settings object under a
different name and paints a body class. So four of the eight shots were the same
theme photographed twice and labelled as two.

Nothing failed. The comparison would have shipped, and it would have shipped a
*claim* — "both themes checked" — that was 50% false. **Worse than not checking,
because a comparison is the artefact that closes the question.**

The tell was mundane and I nearly walked past it: two file sizes matching to the
byte in an `ls`. Real screenshots of genuinely different renders do not do that.

**The rule: a test that varies an input must ASSERT the input actually varied,
in the output.** The script now reads the body class back off the page and
prints it beside every row — `phone/light(theme-whiteout)/after: …` — so a
mislabelled pair is visible in the log instead of hiding in the pixels. One line,
and it converts a silent lie into a loud one.

This generalises past screenshots. Any matrix run — themes, locales, viewports,
feature flags, model versions — should echo the *observed* value of the axis it
is varying, not the value it *set*. Setting is an intention. Observing is a
measurement. **The gap between them is where a whole passing test suite goes to
sleep.**

### 2.6q "It already exists" needs a mechanism, because reading it did not work
The project's own instructions say a visual element has three answers and not
two: **build it · source it · or find it already built**, and check the third
one first. That paragraph exists because I had already skipped it once.

I skipped it again. Asked for a room with a half court in it, I wrote five CSS
borders from scratch. Aaron looked at the picture and said "the court lines are
very wrong" in one sentence, without measuring anything, because a person who
has watched basketball can see a wrong court instantly.

Then the interesting part. I went to fix it by reusing the game's own court, as
the rule says. **The game's own court is three CSS boxes and it is also wrong.**
So the rule as written would have reproduced the bug with a clean conscience.

Both halves of that are worth keeping:

**A written rule you have read and agreed with does not fire.** Between reading
"check whether it already exists" and drawing an arc, the rule was simply not in
the room. Instructions lose to momentum every time, which this project has now
recorded three separate times, and all three times the fix was the same: turn
the check into a command that runs. The court is now `halfcourt.svg` with every
real dimension written into it, and the label layout has `gym-labels.py`, which
found three overlaps I had already looked at and called fine.

**And "reuse what exists" is not a synonym for "reuse what is correct."** The
existing thing is evidence about house style, not evidence about truth. When the
existing thing is decorative and the new use is load-bearing, reusing it
propagates an error into a place that can no longer afford it. The right move
was the third thing neither option named: build it properly ONCE, in a file, and
point both at it.

**The cheapest tell that I had invented rather than measured:** not one number
in that CSS could be traced to anything. `top:-10%`, `height:46%`, `left:31%`.
Numbers that come from somewhere can say where. Numbers that come from taste
cannot, and a block of untraceable constants describing a real-world object is
a confession if you read it as one.

### 2.6r A counter that walks its two halves differently, again, and in the same direction
Asked for two exhaustive lists, I wrote them, then wrote their summary line from
memory: *"168 moments, 41 of them essential."* Then I grepped the file I had
just written. **256 moments, 109 essential.**

This is the third time in this project that a self-reported count has been wrong
low, and it has never once been wrong high. That asymmetry is the whole lesson.
The error is not arithmetic. Under-counting your own output makes the output
sound reasonable, so it never triggers the second look that a shocking number
would.

And the true number was the actual finding. 109 essential coach moments, 77 of
them on a twenty minute path, is one interruption every fifteen seconds, which
means the priority scheme I had just invented does not work. **41 would have
sounded fine and shipped.** The wrong number was not a blemish on a correct
conclusion, it was hiding the conclusion.

**The rule, and it is embarrassingly cheap: if you are about to summarise a
document you just wrote, count it with a script, in the same turn, before you
write the sentence.** Ten seconds of grep. The thing you just wrote is exactly
the thing you are least able to see, because you remember intending it rather
than doing it.

### 2.6s The throwaway page is the one that reaches the person you need to convince
A mockup had no `<meta name="viewport">`. On a phone that means the layout
viewport is 980px and the whole page is rendered at desktop width and scaled
down. The tap targets, drawn at a correct 44px, arrived as **17.5px of actual
finger.** The user opened it on his phone, could not use it, and told me. On
desktop it was flawless.

The interesting part is the pattern, not the bug. **Every shipped page in that
project had the line. Every dev page and mockup was missing it, all seven.** Not
coincidence: the shipped pages get opened on phones, so the omission surfaced
and got fixed. The mockups only ever got opened by me, in a headless browser I
had told what size to be.

So the throwaway artefacts silently accumulate exactly the defects that the real
ones cannot keep. And that is backwards, because a mockup's entire job is to be
LOOKED AT by the person deciding, and that person is on a phone. **A mockup you
cannot open on a phone cannot be judged on a phone.** It does not matter that it
was going to be deleted.

The same seven files were also missing a charset, which showed up in a
screenshot as `Â·` where every separator should have been. Same shape, same
cause, found the same afternoon.

Two habits fall out. **Hold scratch output to the same head standards as
shipped output**, because "it's only a mockup" describes its lifespan and not
its audience. And **when you find one instance of an omission, immediately
enumerate the whole class** rather than fixing the one you were shown: one grep
turned a bug report into seven fixes and a gate.

### 2.6t Measure the layout, and then measure the glass
The check I wrote for that bug read the tap target with
`getBoundingClientRect()` and reported a comfortable **44px**. The finger was
getting 17.5. Both numbers are true: the element really is 44 layout pixels, and
the layout was scaled by 0.398 to fit the screen. My check measured the thing
that was correct and never touched the thing that was broken.

It only surfaced because I sabotaged the fix on purpose to watch the check fail,
and it did not fail. **A check that passes during a deliberate break is worse
than no check**, because it is now evidence.

The general shape, and it recurs everywhere: **a measurement taken in the
system's own coordinate space cannot see a bug in the transform between that
space and the user.** Layout pixels versus device pixels is one instance. Others
are logical versus wall-clock time, characters versus rendered width, and bytes
versus what the decoder produced. Whenever a number will be compared against a
HUMAN threshold, convert it into the human's units first and print both.

### 2.6u A measurement taken at the wrong moment is not a small error, it is the opposite answer
The near-field layer was supposed to make a camera move read as walking rather
than zooming. To find out whether it was visible at all, I screenshotted the
frame with the layer on and off and diffed the pixels. **0.3 percent different.**
The obvious reading is that the effect does nothing and should be cut.

I sampled the destination. At the destination the near field is correctly gone,
because you have walked past it. Sampled at rest it is 8 to 9 percent of the
frame, and sampled mid-move it is **over 80 percent**. The effect is enormous
and it exists only while you are moving, which is exactly when a walking cue
should exist.

Nothing about the method was wrong. The instrument was fine, the diff was
correct, the number was real. **The sampling moment carried the entire
conclusion, and I chose it without noticing I was choosing anything** — the
destination is simply where the animation stops, so it is where a screenshot
naturally lands.

The rule: **for anything that varies over time, ask what the number would be at
three moments before you quote it at one.** Start, middle, end. If they
disagree, the single number was never the answer, and the one you happened to
take is the one that fit in the tooling rather than the one that answers the
question.

### 2.6s A control can be the right size, in the right place, and unreachable
Three separate versions of the same bug in one afternoon, and none of them was a
rendering fault. Every one was a control that LOOKED correct in a screenshot and
could not be operated.

**One.** A prototype had no `<meta name="viewport">`. The user said "worked on
desktop, couldn't use it on mobile" and I would never have found it by looking,
because the screenshot is beautiful. Measured: with no viewport meta the layout
viewport is 980px, so a 390px phone renders the desktop page scaled by 0.398.
The 44px touch targets were **17.5px of actual finger.**

**Two.** The check I then wrote to catch it read `getBoundingClientRect().width`
and printed a confident `44px`. It passes with the bug still present, because
`getBoundingClientRect` measures the LAYOUT, and the layout was the thing that
was wrong. The fix is one multiplication: `width * (deviceWidth / layoutWidth)`.
**When a bug is about a coordinate system, a measurement taken inside that
coordinate system cannot see it.**

**Three.** Later the same day every hotspot became unclickable on desktop while
staying fine on a phone. Cause: the hotspots lived inside a
`transform-style: preserve-3d` element, and **inside a 3D rendering context
`z-index` is ignored** and everything is sorted by computed depth. At a 420px
frame the image landed a hair in front; at 358px it did not. A width-dependent
hit-testing failure is not something you reason your way to.

**The rule that covers all three: ask the browser what is actually on top.**
```js
const r = el.getBoundingClientRect();
const hit = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2);
// hit must be el, or inside el
```
Three lines, and it catches all three bugs plus every future overlay, scrim,
sticky header and stacking-context mistake, without knowing anything about the
cause. **Visible, correctly sized and positioned are three properties. Reachable
is a fourth, and it is the only one the user cares about.**

### 2.6t A prototype that regenerates from itself will preserve its own damage
A build script rewrote a large single-file prototype and carried the head of the
file forward verbatim, which was sensible: the head holds 350 KB of inlined
fonts. Then a deliberate sabotage stripped one line out of that head, and the
line stayed gone through **three** rebuilds, because rebuilding faithfully
preserved the deletion.

The fix is not "be careful". It is that a regenerating build must **assert** the
handful of lines the output cannot ship without, rather than trusting whatever
it found:

```python
if 'name="viewport"' not in head:
    head = re.sub(r'(</title>\s*\n)', r'\1<meta name="viewport" ...>\n', head, 1)
    print('  (re-inserted the missing viewport meta)')
```

The same shape bit twice more the same day, so it generalises past HTML: a
`<title>` carried forward from the previous build kept renaming a published page
back to its old version number, and a title tag beats the API parameter that
tries to override it. **Anything a build copies forward instead of generating is
state, and state drifts. Either generate it or check it, and print a line when
you had to repair it, so the repair is visible rather than silent.**

### 2.6u Asked "what is next", I rebuilt the plan instead of reading it
The project has a plan. Its first line, in bold, says it is the plan and warns
against assembling one from anywhere else. Asked what was left, I harvested a
to-do harvester, a build log and a handful of my own greps, and produced a
sensible, well-measured list that was **not the plan.** The owner corrected me
in nine words: *"This should be from the two paths to 20."*

Two things worth keeping, and the second is the useful one.

**One: this is the same failure as reinventing a thing that already exists**, in
the register of process rather than pixels. Same root, too: retrieving is work
with a boring feeling, and generating is work with a productive feeling, so when
both are available I generate. The tell is identical in both cases: **nothing in
what I produced could say where it came from.** A plan item can name its row. A
list I assembled cannot.

**Two, and this is why it is a separate lesson: reading the plan would ALSO have
been wrong.** Three shipped items had never been struck through in the tables.
So the honest diagnosis is not "I ignored the plan", it is that the plan had
quietly stopped being trustworthy, and an untrustworthy source is one you
unconsciously stop consulting. The drift and the staleness are the same problem
from two ends.

That reframes the fix. Discipline was never going to hold here, so:

1. **The plan gets a QUERY.** One command that prints the next open item and
   reads the plan and nothing else. A plan you cannot ask a question of is a
   plan that gets rebuilt from memory, every time, by whoever is holding it.
2. **The query is deliberately dumb.** No second source, no inference, no
   reconciliation against the code. If it returns a wrong answer, the PLAN is
   wrong and the plan is what gets fixed. A tool that silently compensates for a
   stale document guarantees the document stays stale forever.
3. **Fixing the stale rows was the actual repair**, not writing the tool. The
   tool only makes the staleness loud.

**Generalises past plans:** any document that is supposed to be authoritative
and is edited by hand will drift, and drift is silent. The countermeasure is not
a reminder to keep it current. It is to make the document answer a question
somebody asks daily, so that being stale becomes visibly, immediately annoying.

### 2.6v A missing sense is not a missing check
The owner shared seventeen sound files and then realised, a day later, that I
cannot hear. His fix was generous: he renamed every file by hand so I would know
what they were. Two lessons fell out, and they point in opposite directions.

**One: I had already faked the sense.** Asked to catalogue the files, I read
their FILENAMES and reported contents: this one is a swish, that one is
unclear, the rim clank is MISSING. The rim clank was not missing. A file called
`basketball-85872` was the rim all along, and the owner's rename said so in
four words. A filename is a label somebody once chose, not a measurement of
what is inside, and cataloguing by filename is confident perception of a thing
never perceived. The morning report shipped a wrong "missing" item because of
it.

**Two: the sense was never required.** Once the files were in the repo I
decoded every one with the same audio engine the product uses and measured
duration, peak, RMS and edge-silence. Those numbers caught everything that
mattered for the build: a cheer that opens with 804ms of dead air, a buzzer
that is one-third silence, one clipped file, and the loud/polite pairing the
spec wanted, which turned out to be a measurable 3.5 dB apart. None of that
needed ears. It needed the honesty to convert "I cannot perceive this" into
"what property do I actually need, and what instrument measures it?"

The general rule: **when you lack the sense a judgement seems to require,
split the judgement.** The aesthetic half goes to someone who has the sense,
explicitly, by name. The functional half almost always reduces to properties an
instrument can read, and shipping it unmeasured because "I can't hear/see/run
it" was never a real constraint, it was a stopping-too-early. The failure mode
to fear is not the missing sense; it is substituting an adjacent artifact (a
filename, a caption, a README) and calling it perception.

### 2.6w A green harness certifies the environment it ran in, not the one that ships

The owner played a sample page I had published and reported *"There were no
cheer sounds in the sample."* The wiring was there. The files were there. The
check harness had passed, twice, and it was not lying: on `file://`, where the
harness runs, the cheers played. The published page runs somewhere else — an
artifact host with a Content-Security-Policy — and there the loading call
(`fetch()` of a `data:` URI, of all things) was silently blocked. No error the
user could see, no failed check, just a retry loop spinning forever and
silence where the crowd should be.

The mechanism of the miss is worth naming precisely: **the harness and the
product ran the same code under different laws, and the check certified the
laws it happened to run under.** Every environment gap works like this —
CSP, CORS, autoplay policy, a sandboxed iframe, a proxy, file paths, an env
var — and a test suite is always silent about rules it is never subjected to.

Two fixes, in order of strength:
1. **Use the one code path that exists in BOTH environments.** Here that was
   decoding bytes directly (`atob` → `decodeAudioData`) instead of fetching a
   URL. When two APIs do the same job, prefer the one whose behaviour cannot
   differ between where you test and where you ship.
2. **Turn the environment difference into a static check.** The harness cannot
   run under the ship environment's CSP, but it CAN assert the page contains
   zero `fetch(` calls — a property checkable anywhere that guarantees the
   blocked API is never reached. Sabotage-proven: reintroducing a `fetch(`
   fails the run.

The general rule: when a user reports a failure your green tests say is
impossible, **suspect the environment before the code** — and when you find an
environment-only failure, the fix is not "test harder", it is either collapsing
the two environments onto one code path or finding the statically checkable
property that makes the difference irrelevant.

### 2.6x The document it wrote an hour ago does not protect it an hour later

The clearest demonstration yet that for an AI system, a fact RECORDED is not
a fact CONSULTED. It wrote a 256-row catalog of coaching lines, and row
CM-GAME-13 stated the scoring rule exactly: the line on the floor decides the
points, the colour only says how hard the question is. Forty rows later, in
the same file, in the same session, it wrote a player-facing script saying
the opposite: "harder pays more." The owner caught it in minutes by reading
one badge the way a player would.

The mechanism matters for anyone working with these systems. A person who
just wrote a rule down still has it loaded when they write the next
paragraph. The AI does not get that for free: each new sentence is produced
from what the whole context makes plausible, and "colour means harder means
more points" is plausible in a way the true rule is not. Its own document
sitting in context SHOULD have won, and did not. So proximity to the truth
is no defence, and "it literally wrote the correct rule today" predicts
nothing about the next claim.

What works, in order of strength:
1. **Check the claim against the CODE at the moment of use**, not against
   any prose, including prose the AI itself just wrote. The companion error
   that day (a free-move rule that had never shipped) fell to a four-minute
   read of the game file.
2. **A fresh-eyes read in the consumer's role.** The owner did not audit 256
   rows; he read one screen as a player and asked what EASY · 2 PTS could
   possibly mean. Nothing. No card says that. Author-mode rereading misses
   this because the author knows what it meant to say.
3. **Turn the rule into a gate where the rule is mechanical.** The same
   session banned a verbal tic; the ban became a zero-ratchet regex the same
   day, because section 2 of this file keeps proving that reminders decay
   and gates do not. And the gate had to match curly apostrophes: the one
   player-facing hit was typographic, and an ASCII-only pattern certified
   the product clean. A gate that matches less than the writer can type has
   a hole exactly the size of the miss.

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

### 1.2t Twenty-four checks asked what EXISTS; none asked what a player can SEE
A confirm dialog went in with a harness around it: the copy is verbatim, both
doors it promises really open, the coach is not turned off before the answer,
"keep them on" keeps the card, "skip" removes it, the buttons clear the 28px
touch floor, and it degrades safely with the markup deleted. Twenty-four
checks, all green, including a deliberate sabotage.

The dialog was invisible. The card that raises it is `z-index:49`; the dialog
had been given `47`, so the card stacked over its own confirm and buried the
sublettering and the primary button. A screenshot showed it in about a second.

Every one of those checks was a question about **existence or content** ·
is the element there, what does it say, what class does it have, what does
localStorage hold. Not one was a question about **presentation** · can this be
seen, is it on top, would a finger land on it. Those are different questions,
and a DOM query cannot tell them apart: an element covered by an opaque card is
present, sized, styled and completely useless.

**The cheap instrument is `elementFromPoint`.** At the centre of each control,
ask the browser who would receive the tap, and require the answer to be the
control. It is one line per control and it is the only DOM-level check that
speaks about the rendered stack rather than the tree. It now sits in that
harness at both viewports.

Two habits behind it:
- **After building any overlay, name what else is on screen and where each one
  sits in the stack.** The bug was not subtle arithmetic · 49 beats 47 · it was
  that the number was chosen without looking at the neighbours at all.
- **Screenshot anything with a new visual surface, even when the tests are
  green.** Green means the questions you thought to ask were answered. It says
  nothing about the ones you did not.

The pattern generalises past stacking. Presentation failures · covered,
clipped, off-screen, transparent, behind a scroll, zero-height parent · are
almost all invisible to assertions written about the tree, and almost all
obvious in a picture.

### 1.2u A screenshot cannot prove MOTION, and animated CSS can fail still-but-pretty
The iridescent treatment shipped with a keyframe that animates
`background-position` with TWO comma-separated values, because the button it
was written for paints two background layers. Reused on one-layer elements
(the gradient text, the chips), the browser applies the first value to the
only layer and pins it at `0 0`: the gradient renders in full colour and
simply never moves. Every screenshot of it looks perfect, because a screenshot
is one frame and the bug is the absence of a second frame.

The instrument is the same shape as 1.2t's `elementFromPoint`: ask the browser
for computed state TWICE and require it to have changed. Sample
`getComputedStyle(el).backgroundPosition`, wait most of a period, sample
again, assert inequality. One line more than asserting the property exists,
and it is the difference between testing the design and testing the render.

General rule: for anything whose correctness IS a change over time (an
animation, a poll, a countdown, a stream), a check that reads state once can
only ever prove the starting frame.

### 1.2v The verifier's first kill was my own cleanest claim
A research workflow failed twice, so I ran the brief by hand and filed ten
findings. When the workflow finally ran, its adversarial verify pass was
pointed at the new agents' claims AND at mine, and its first real verdict was
REFUTED, on my Blood Bowl finding: "the interception is the only reaction the
defense gets, and it involves no decisions." The rulebook says the defending
coach NOMINATES the interceptor, and two skills are defender-chosen mid-turn
reactions. A second claim fell the same hour: "PC Gamer measured decision
points taking minutes" was really "PC Gamer reports they can take minutes",
and my "a third of matches lock up" had no source at all; it was withdrawn.

Two tells, both cheap to check for:
- **The absolutes.** "Only", "never", "no decisions", "measured". The claim
  most likely to be wrong is the cleanest one, because cleanliness is what
  reasoning produces and reality does not.
- **The scope of the verification target set.** When a later pass checks new
  work, put the PRIOR work's load-bearing claims into the same target list,
  by name, claim by claim. My hand-run findings only got caught because the
  verify prompt carried them explicitly. A verifier that only sees the new
  material silently grandfathers the old.

The correction cut in our favour both times, which is the part worth
remembering when a refutation stings: the corrected Blood Bowl finding
(reactions exist but are few, small and choice-shaped) and the corrected BB3
finding (the one digital sports game that prompts the non-active player
mid-turn, and that is exactly where it bleeds) are both STRONGER evidence for
the design position than my overstatements were.

### 1.2w A dead run's partial results outlive the run · read the journal, not the report
The nine-agent run stalled once (one verifier errored) and was resumed. On
resume, all three verifiers re-ran into a broken permission handler, returned
nothing but UNVERIFIED, and the final synthesized report stated "both
fact-check lenses suffered total tool failure... nothing gained independent
confirmation." That sentence was false ABOUT ITS OWN RUN: before the stall,
two verifiers had completed with working tools, and their full verdicts
(four CONFIRMED, one REFUTED, URLs and all) were sitting in the run's journal
file. The report never saw them because the resume happened to re-run those
agents instead of reusing them.

The lesson is mechanical: an orchestrated run's summary is a lossy view of
its own history. When a run partially fails, or resumes, or reports that a
phase produced nothing, open the per-agent journal before believing it. The
recovery here cost one grep and turned "verification: zero verdicts" into
"verification: six real verdicts including a refutation of the orchestrator's
own claim", which changed the filed recommendation.

### 1.2x A ruling that arrives in chat closes an item in ZERO places by itself
Aaron, after a week of heavy rulings: "I'll go to try to do them, and then you
find out, well, this was done already. I thought we had built skills that
update things." The tools were not broken; they count and harvest exactly as
built. The failure has a narrower shape: a decision arrives in conversation,
gets filed as NEW text in one home (the standing rule), and its SHADOWS
elsewhere stay standing: the summary board's hand-written cards, a backlog
row's "needs a ruling" framing, a plan row written before the work ran. The
night this was named, six of nine desk cards on the status board described
already-ruled items, a backlog item still said "needs a ruling" about a card
whose fix had shipped a week prior, and a plan row still assigned work that
was 13/17 finished.

Two rules fall out, one for writing and one for building:
- **Filing the ruling is half the job; the other half is hunting its
  shadows.** grep for the item's id and its distinctive words across the
  repo before ending the turn. The one-home law prevents duplicate HOMES; it
  does not prevent SUMMARIES, and summaries are where readers actually look.
- **A curated summary is a copy, and copies rot on a schedule set by how
  fast decisions happen.** The durable fix is never discipline: make the
  summary generate from the rows, or make it carry pointers a build step
  verifies, so a stale card fails a render instead of waiting for a human to
  trip over it.

### 1.2y A gate that reads the SOURCE while the user reads the RENDER is blind exactly where it matters
The em-dash sweep removed 584 of them in one pass and ratcheted the gate at
zero, and everyone involved (me included) treated the law as enforced. Eight
days later a routine settings screenshot showed a player-visible em dash in
shipped copy. Five of them had survived the whole time, spelled `&mdash;`:
the HTML-entity spelling renders as the banned character to every player,
and the gate counted only the literal `—` in source text.

The general shape: any sweep or gate that enforces a rule about what the
USER experiences must count in the form the user receives, not the form the
repo stores. Encodings, entities, escapes, build-time concatenation and
templating all open the same gap, and the gap is invisible to the person who
ran the sweep, because the sweep reported zero and zero looked like victory.
Two corollaries:
- When a sweep closes a category of debt, spend one minute asking "what
  other SPELLINGS of this same thing exist?" before declaring the ratchet
  clean. The entity spellings were three grep terms away.
- A screenshot pass over real screens catches what source greps cannot,
  which is one more reason the show-before-it-goes-live rule earns its
  cost: this find came from a screenshot taken for a different purpose.

### 1.2z The first feature to use a primitive at a new SCALE finds the bug the primitive always had
Method B places nine pieces on the floor at once. The engine's animation
primitive had only ever moved ONE piece per callback, and its completion
loop had a latent bug for the plural case: when several animations finish in
the same frame, the second finisher overwrites the captured callback with
the null the first finisher just left behind, and the callback is lost. The
ritual hung on a dead phase, deterministically, on its very first run.

The lesson is about where to look when new code stalls on old machinery:
the primitive "worked for months" is evidence about the OLD usage pattern,
not about the primitive. A helper built under an implicit cardinality
(one mover, one caller, one completion per frame) carries that assumption
invisibly until the first plural caller arrives, and the plural caller's
author will naturally suspect their own new code first. The debug probe
that settled it in one pass printed the primitive's own state (anims
remaining, callback present, phase) rather than the new feature's, which
is the cheap generalisation: instrument the SHARED machinery, not the new
caller, the moment a hang reproduces deterministically.

### 1.2aa A synthetic .click() proves the handler, never the button · hit-test what a thumb touches
The double-check day's biggest find: an invisible full-screen div (a confetti
container with no pointer-events:none) sat over every answer button in the
Daily Five, and SEVEN harness suites passed over it, because Playwright's
.click() and element.click() dispatch straight to the element, bypassing the
hit-testing a real thumb goes through. The mode was unplayable by touch and
the checks were green.

The rule: any check that claims a control is USABLE must ask the question a
finger asks: document.elementFromPoint(centre of the control) must return
the control or a descendant. One line, and it catches the whole class of
overlay bugs (veils left up, z-index collisions, containers without
pointer-events) that synthetic events walk through. This extends 1.2t
(checks asked what EXISTS, not what a player can SEE): existence, then
visibility, then REACHABILITY, three different questions, three different
probes.

### 1.2bb A standalone sample carries its own little world · port the DEPENDENCIES, not just the code
B5c was built as a self-contained sample page first (its own CSS tokens, its
own .pow variants), approved, then ported into the real game. The port moved
the JS and the new CSS but not the sample's PRIVATE DEPENDENCIES: var(--cream)
existed only in the sample's :root, and .pow.cold/.pow.teal existed only in
the sample's sheet. Result: swish rings drawing with a wrong border and every
MISS slamming in celebration orange, while everything worked, because CSS
does not throw on an undefined variable or an unmatched class.

The rule: porting from a mock is a dependency-closure exercise. Before
calling a port done, grep the ported fragment for every var(--x), every
class it assigns, every id it touches, and prove each one resolves in the
DESTINATION sheet. CSS's silence makes this the porting analogue of the
copied-instead-of-imported bkid.slug bug: the copy LOOKS right and drifts.

### 1.2cc A verification that shares its yardstick with the code proves self-consistency, not truth
The Daily Five's ball was told to land on the painted rim. The rim's position
was a constant I measured off a coarse grid, and I misread the ring's right
edge as its centre. Then I "verified" with screenshots: ball, swish rings and
spot markers all agreed with each other perfectly, because every one of them
was positioned by the SAME wrong constant through the SAME map. The user
caught it from his phone in seconds, twice ("a bit off... also a bit low"),
because his eye compared the ball to the ART, the one thing in the frame my
verification never consulted.

Two mechanisms, both worth keeping:
1. **Measure at a zoom where the suspected error would be visible.** The
   first grid was legible to about 15px; the error was 27px but split across
   a fuzzy painted ellipse. An 8x zoom crop made it unmissable in one look.
2. **Never trust a rect taken during an animation.** The screen arrived
   behind a .44s door transition; the paint routine measured the stage rect
   mid-pan and baked the offset into everything positioned once. Elements
   that re-measured fresh (the flight) were right, so the bug was
   intermittent AND self-healing on the next repaint: green harnesses,
   wrong first card, every day. Position from a settle pass that waits for
   the rect to stop moving, and add a check that two things which must
   coincide actually do (the rings now assert they sit on the rim point).

### 1.2dd A feature can pass every functional check and still fail as a product, because state changes are silent
Method B was proven by 36 automated checks: the flag latched, the ritual
fired, the shapes landed. Its first human playtest returned "the switch
didn't work, nothing happened differently." Both were true. The harness
drove internal surfaces and asserted MECHANISMS; the player stood in front
of the same machine and got no signal that any of it was awake: the latch
was silent, a disqualified mode slept without a word, and the free-move
beat announced itself in a text strip built for a desktop eye.

The rule: for every state a feature can be in (on, off, asleep-with-reason,
your-turn-to-act), ask what on the SCREEN says so, and test THAT. The fix
here was three announcements through the game's own loudest device, and a
harness that now walks the player path (real settings switch, real menu)
instead of only the internals. A mechanism check proves the gears turn; a
product check proves somebody watching can tell.

### 1.2ee An allowlist of safe places is a list of hiding places
A modal card had a janitor that swept it whenever it was "orphaned", and
orphaned was defined as: not on the game screen AND not on the daily screen.
That reads like caution. It is actually an exemption list, and the bug lived
in the exemption: a card raised on the daily could walk into a game, where
both clauses were false, and it had nowhere to die. The user hit it twice.

The replacement is not a longer list, it is a relationship: **the card records
which screen raised it, and dies when that screen is not the one in front of
you.** No list to maintain, so a screen added next year cannot reopen the
hole. The general form: when a cleanup rule enumerates the contexts where a
thing may survive, invert it — make the thing carry its own claim to
existence, and check the claim.

Two things worth keeping from how this went:
1. **The old test defended a rule I was about to delete.** Replacing the
   allowlist made an existing check fail: it had been policing a DIFFERENT
   pathology (a card wearing "GAME PAUSED" when there is no game). My new
   rule was necessary but not sufficient, and the right answer was the union
   of both. Rewriting a rule is the moment old tests earn their keep, so
   never "fix" a failing legacy test by deleting the behavior it protects
   until you can say out loud what it was protecting.
2. **The headline check passed under sabotage until I reverted all three
   fixes.** One of the three (a hide call on the daily's exit path) was
   silently carrying it. A regression test that cannot fail against the
   original bug is decoration; the only way to know is to restore the exact
   broken code and watch it go red.

**A postscript to 1.2ee, because the same trap caught me twice in one hour.**
The regression check that replayed the user's exact journey PASSED against
the buggy code, and I nearly shipped it as proof. It slept 750ms between
steps; the broken janitor ticked at 700ms and cleaned up inside my own wait.
The check was measuring the backstop, not the fix. Retimed to 300ms, which is
what a thumb experiences, it fails against the old code exactly as it should.
**When you test a fix that made something FASTER or more immediate, your
sleep durations are part of the assertion.** A generous wait quietly converts
"never happens" into "eventually resolves", which is a different claim and
the one the user already rejected.

### 1.2ff When you cannot reproduce a user's bug, the gap between your machine and theirs IS the bug
A player reported music "playing over itself" at game start. It did not
happen in headless Chromium, on any path, at any speed. The temptation at
that point is to doubt the report or to go hunting for a race.

The productive move was to ask what is DIFFERENT about the platform he plays
on. iOS Safari treats `HTMLMediaElement.volume` as read-only: writes are
silently dropped and it stays at 1. The whole audio module was built on
"start it at volume 0 and fade it up", which is simply false there, so an
unlock routine that started two tracks quietly started two tracks LOUDLY.

The technique worth keeping: **emulate the single platform behaviour in a
test rather than acquiring the platform.** Four lines of `defineProperty`
turned an unreproducible phone bug into a red check on my own machine, and
that check now guards it forever. Judge the symptom the way the platform
does, too: the assertion is not "volume is low", it is "no two elements are
unpaused and unmuted at once", which is true everywhere.

Corollary, learned the embarrassing way in the same hour: I wrote a code
comment asserting the second bug I found (a playlist key with no file)
"killed all music for the session". It does not, the guard clause upstream
returns first. I had reasoned a mechanism and written it down as fact inside
the fix. The harness printed the real symptom, "SILENT: Follow My Soul", and
the comment was rewritten to match. A comment is an assertion; it earns the
same standard of proof as a claim made out loud.

### 1.2gg A fixed sleep is a GUESS at a window · install the observer before the trigger
The two Daily Five endings are built from effects that clean up after
themselves: a slam word that lives about 1.2 seconds, a panel flare that
lasts 1.5, a count-up that is finished in under a second. Verifying them by
the usual method (do the thing, wait, screenshot) produced a run of green
frames showing nothing at all, because a screenshot at a fixed delay is a
bet on where a window is, and every one of those bets was placed after the
window shut.

1.2u is the neighbour but not the same lesson. There the problem was that
one frame cannot show MOTION, and the fix was to sample twice. Here a single
frame would have been fine, if it had landed inside a window that is over
before you can aim at it. Sampling twice does not help when both samples are
late.

The instrument is to stop sampling and start RECORDING: install a
MutationObserver on the container BEFORE firing the trigger, push every
class and text change into an array, and assert against the array when the
run ends. It cannot be late, it does not care how long the effect lasts, and
it fails loudly when the effect never happens instead of quietly when the
camera is slow. The count-up check now prints the values it actually saw
(`1>6>9>13>...>24`), which is a far better artifact than a photograph of the
number 24 that cannot tell you whether it counted or simply appeared.

General rule: when correctness is a TRANSIENT, do not schedule an
observation, subscribe to one. And when a check that should be failing keeps
passing, suspect the clock before you suspect the code. Same day, the sweep
test passed against a code path it never reached, because the harness clock
expired before the game loop answered.

### 1.2hh Two unrelated things sharing a class name is a bug with a delay fuse
The Heat Check's clue label and the calendar's day number were both called
`.dvcn`. They live in different screens, they were written months apart, and
neither author (me, twice) had the other in mind. The calendar's rule sets
`position:absolute`, correct inside a cell that is `position:relative`. The
clue rows are not positioned, so all four clue prices anchored to the VIEWPORT
and stacked in the top-left corner at (5,3), and every locked clue rendered as
a blank bar.

What makes this worth recording is not the CSS, it is the failure shape. The
collision produced no error, no warning, and nothing that looked broken enough
to investigate: a small smear of text in a corner that reads as chrome, and
some empty rows that read as a design choice. It had been shipping. It only
surfaced because I was screenshotting the round for an unrelated reason and
looked at the picture.

Two things to keep:
- **Fix the name, not the symptom.** `.dvclue .dvcn{position:static}` would
  have fixed the render and left the trap armed for the next person to reuse
  the class. Renaming to `.dvcln` removes the collision itself.
- **The severity is in the SEMANTICS, not the pixels.** The visible bug was
  "some labels are in the wrong place". The actual bug was that the round's
  only decision, whether to spend two points on another clue, had no price
  attached to it on screen, next to a button reading "worth less" than what.
  Ask what a misplaced element was SAYING before grading how bad it looks.

General rule: a global class name is a global variable. In a codebase with no
build step and no scoping, the only defense is names specific enough that a
collision has to be deliberate.

### 1.2ii The reader defines plain · a validation step is the only honest passport for a model
Two lessons from one floor analysis, filed together because they were caught
hours apart on the same job.

**The jargon one.** Aaron read a defense write-up built around the words
"gate", "tier" and "no gate on the discount" and said plainly: *"I don't
understand 'no gate on the discount' at all, I don't even know what you are
talking about there."* Every one of those words has a precise meaning to the
writer and none to the reader, and the writer never notices, because jargon
does not feel like jargon from the inside. The fix is not simpler thoughts,
it is reader-tested words: "an automatic check that replays this so it can
never quietly break" carries the whole meaning of "a gate". The test from
CLAUDE.md's write-to-the-player rule generalises to every reader: could THIS
reader, with what is on their screen, tell what the sentence refers to?

**The model one.** The floor analysis needed numbers for board sizes the
game cannot be set to, so a Python copy of the movement geometry was built.
The copy's first draft read the board size off the variable declaration
(13x7) and missed that the game resizes per league (15x8 for NBA). The only
reason this shipped nowhere is that the model was REQUIRED to reproduce the
real game's classification of all 432 squares before being trusted anywhere
else, and it failed 30 of them on the first run. A model that has never
matched the real thing on ground both can stand on is an opinion with
decimals. Validate on the overlap, then extrapolate, never the reverse.

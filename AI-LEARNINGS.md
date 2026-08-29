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

### 1.2aaa Measure the noise floor before you quote a difference

I fixed one shape on a game piece, diffed a before against an after, and
reported "16,980 of 3,287,040 pixels differ, all of them heads" in a commit
message. The claim about WHERE was right. The number was worthless, and I had
everything needed to know that and never checked it.

The next day, proving an unrelated change, I shot the same build twice and
diffed it against itself: **24,491 pixels.** The floor was higher than the
signal. An idle animation, a piece bob of plus or minus 1.5 pixels, was never
gated on the reduce-motion class the harness sets, so every screenshot sampled
it at a different phase. Once the bob and two other steady-state loops obeyed
reduce-motion, the same self-diff came back **0**, and the real number for the
shape fix was **7,217**: less than half what I published.

- **A difference is only meaningful against the repeatability of the
  instrument.** Shoot the same thing twice and diff it. It is one extra run and
  it converts every later number from a guess into a measurement.
- **Do it FIRST, once, and keep it.** The floor is a property of the harness,
  not of the change, so it is measured once and reused, and it should be
  printed alongside every diff so nobody has to remember to ask.
- **A noisy harness does not fail; it flatters.** It never says "cannot tell".
  It hands back a big confident number that happens to include the noise, and
  a big number reads as strong evidence.
- **The fix usually improves the product too.** The animation that ruined the
  measurement was also ignoring an accessibility preference. A thing that will
  not hold still for a camera is often not behaving for a person either.

### 1.2bbb A cost you wrote down at planning time is a guess, and it ages into a fact

When I scoped turning the game board upright I listed the known costs
honestly, so that the job could not surprise anyone later. Two of them were:
the playing pieces face across the court and their orientation was tuned for
the old camera, so they will need re-aiming; and left and right become up and
down, so every place the game describes a direction has to move with it.

Both were wrong, and both took under five minutes to disprove.

The pieces are surfaces of revolution, a single curve spun around a vertical
axis. Turning one about its own axis cannot change its outline. I rendered it
with the rotation set to zero: **548 changed pixels out of 1,143,480, 0.05%**,
and that residual is sampling phase. The direction language was a grep: every
spatial left or right in the repo turned out to be a code COMMENT, so there
was nothing a player reads that carried a direction at all.

- **A cost list gets written when you know least about the job and consulted
  when you have stopped questioning it.** Between those two moments it quietly
  changes status from estimate to fact, because it is written down and written
  things look checked.
- **Re-read the cost list at the START of the work and try to kill each item.**
  It is the cheapest possible moment: the costs are what make a job look
  expensive, so deleting two of them can change whether it is worth doing.
- **The costs that survive scrutiny are worth more afterwards.** One item on
  that same list, "the overlap law needs re-proving", was real, bit exactly as
  predicted, and needed a new mechanism. A list where every item is load
  bearing is a list you can plan against.
- **Beware of costs that are really just unfamiliarity.** Both of mine came
  from reasoning about the change in the abstract ("everything rotates, so
  everything that depends on rotation must move") rather than from any property
  of this code. That shape of reasoning generates plausible costs endlessly.

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

### 1.2jj Believe the first sabotage · a guard can be provably useless in one scenario and load-bearing in the next
The one-defense build gave the CPU a rule: never tap a lane two defenders
close. The check for it said "wall the CPU in and assert it still acts."
Sabotage run one: guard removed, check GREEN. The machine escaped by jacking
a desperation shot that happened to exist from that square.

Two wrong conclusions were available right there, and both are tempting.
"The check is fine" (it just passed a sabotage, it is not fine), and "the
guard is pointless" (one scenario where other exits exist proves nothing).
The move that resolved it was closing the other exits: put the handler out
of shooting range with no pass target in reach, so the drive logic was the
only road. Guard removed again: the CPU tapped the wall four times in six
seconds and stalled the possession. The guard is load-bearing; the first
scenario just could not see it.

Two rules to keep:
- **A sabotage that stays green is a verdict on the CHECK, never on the
  guard.** Tighten the scenario until the guard is the only thing standing,
  then judge.
- **Assert the symptom the guard prevents, not survival.** "It eventually
  acts" was satisfiable by luck. "The refusal banner never appears during a
  machine turn" is the thing a player would actually see go wrong, and it
  cannot be satisfied by an accidental exit.

### 1.2kk Git is not an undo button for the last minute · revert sabotage by re-editing

The setup: proving a new check can fail means sabotaging the code on
purpose, watching the red, and putting the code back. Tonight the
"putting back" was `git checkout <file>`, typed on a file that ALSO
carried an evening of uncommitted real work under the sabotage. Git
restored the last commit, which was hours old. The sabotage went away
and so did the build step. The only reason it was caught immediately was
a reflexive `git diff --stat` right after, which showed the file
suspiciously clean.

- **`git checkout <file>` means "back to the last commit", never "back
  one step."** On a file with uncommitted work, those are different by
  exactly the amount of work you care about.
- **Sabotage on uncommitted work is reverted by re-applying the edit in
  reverse** (the same replace, swapped), or by committing the real work
  FIRST so git's "back" and yours agree. Either is fine; mixing them is
  the trap.
- **Run the cheap paranoid check right after the risky command, not when
  something feels wrong.** The diff cost one second and turned a silent
  loss into a ten-minute redo. The first red test suite would have
  arrived much later and pointed everywhere except the real cause.

### 1.2ll "Your shipped values" is a phrase to ban · non-objection while building is not approval

Defending a proposed animation scale, I anchored it on the game's existing
440ms screen transition and told Aaron it was "your own shipped number,
approved by your eyes for weeks." His correction, verbatim: "Stop saying MY
shipped values, YOU built them... I want a clean slate and polished HIGH
quality design... I am not the expert thank you."

- **The AI's defaults accumulate into "the way it is," and then get cited
  as the owner's taste.** Every unruled choice I make ships looking exactly
  as authoritative as a ruled one. Months of them become a house style
  nobody chose. Track which is which; here that is DESIGN.md rulings vs
  everything else.
- **Non-objection is not approval.** A solo founder shipping features is
  not reviewing pixel values. Silence while building means busy, not yes.
- **Incumbency is the laziest argument available to an assistant** because
  it always exists and never needs research. If a value is right, it can be
  defended from first principles and the best work in the field. If the
  only defense is "it's what's there," that is no defense.
- **"I am not the expert, thank you" cuts both ways.** He is trusting me to
  BE the expert, which forbids me from using his non-objection as cover.
  The expert's job is the best answer, then his taste rules on it.

### 1.2mm A polish sweep is a cascade raid · check every class you group before shipping the group

Wave 1 of the feel pass added press feedback with one grouped CSS rule
covering ten control families. Two of them (.mbcard, .cwc) already owned
richer transition declarations earlier in the stylesheet, and the later
grouped rule silently REPLACED them, dropping their border and shadow
eases. Caught by grepping each grouped class for existing `transition:`
before committing, not by any test: suites assert behavior, not easing.

- **In CSS, a later same-specificity rule replaces the whole property,
  it does not merge.** A grouped "everything gets X" rule is a raid on
  every member's existing declaration of the same property.
- **Before grouping N selectors, grep each for the property you are
  setting.** The members that already declare it get their own amended
  declaration instead of membership in the group.
- **Cosmetic regressions are invisible to functional suites.** The only
  gates that catch them are inspection and the before/after recording,
  which is one more reason the comparison law exists.

### 1.2nn Polishing the placeholder · check what the DEFAULT loads, not what the code can load

Asked to make a board that felt "low budget" feel real, I hand-drew plank
lines and grain onto the floor. The repo already held 4.9MB of sourced
floor textures and arena backdrops the owner had paid for. They never
appeared because the DEFAULT court short-circuits the art loader
(`if(court==='classic'){skinSet({});return}`), so every screenshot I had
ever taken, and every game he had ever played, was the placeholder.

- **Knowing an asset system EXISTS is not knowing it RUNS.** I had read
  the skin code, the COURTS table and the art folder before; what I never
  asked was which branch the default takes. One line decided that the
  whole art library was dead on arrival.
- **The check is one command: what does the shipped default actually
  load?** Not "is there art", not "can it load art" — what loads when a
  player presses Play having chosen nothing.
- **A polish pass on the wrong layer is worse than no pass**, because it
  produces small real improvements that make the underlying problem
  harder to see, and it burns the owner's trust when he asks the obvious
  question you should have asked first.
- Related failure mode already in CLAUDE.md ("IT ALREADY EXISTS"): that
  rule said check before DRAWING. Extend it: check what the default
  SERVES before diagnosing anything as ugly.

### 1.2oo A cosmetic bug is invisible to every suite · gate the LOOK with sampled pixels

Adding an "apron" to ground the court, I drew it as one filled rectangle
spanning from outside the court to outside the court. That rectangle
covers the playing surface too, so it painted over the sourced floor
texture that had rendered a moment earlier. Every court in the game
(hardwood, blacktop, cosmic, underwater) became the same brown deck.

Six suites and a design gate all stayed GREEN, because none of them look
at colour. I then published a comparison board built from the damaged
frames and did not notice, because I had never seen the courts correct.
The owner spotted it instantly: "why do all my floors look the same".

- **Suites assert behavior; they are blind to appearance.** Anything
  whose only symptom is "it looks wrong" needs its own kind of check.
- **The check is cheap: sample the canvas.** Seconds to write. But the
  version prescribed here, "fail if two families render the same average
  colour", WAS BUILT AND DID NOT CATCH THIS BUG. See 1.2pp: it is a
  relative test, and this bug moved every floor at once. The working
  version anchors on absolute colour.
- **A frame is four bands, never one filled rect.** If a shape is meant
  to surround a region, it must not be drawn as a shape that contains it.
- **The owner is the last line of a visual gate, and that is a failure of
  the process, not a success of his eye.** He should be ruling on taste,
  not finding regressions.

### 1.2pp A relative test cannot see a change that moves everything at once

The previous entry ends with the right instinct and the wrong check. I built
it: sample each floor, fail if any two render the same colour. Then I did the
one thing that turns a plausible check into a real one and re-introduced the
bug it was written for.

**It passed.** Not narrowly by luck, but structurally. The bug was a
translucent overlay painted across the whole court, and it darkened every
floor TOGETHER: hardwood went 202,139,68 to 68,52,32, but the others fell with
it, so the GAPS between them survived. My "are any two the same" rule measured
the gaps. Being translucent, it let the wood grain through, so my "does it
still have texture" rule passed too. The two rules I had chosen were the two
rules that specific failure could walk straight past.

The fix was to stop measuring the floors against each other and start
measuring them against **recorded absolute values** from a known-good build.
Same sabotage, six checks red, the worst off its anchor by 194 of a tolerance
of 24.

- **Name the failure mode before choosing the metric.** "All my floors look
  the same" is a COMMON-MODE change. Relative tests are blind to common mode
  by construction, which is a fact about the shape of the test, not about how
  carefully it was tuned.
- **Absolute anchors need a stability measurement or they become flaky and
  get deleted.** Thirty patches, median per channel so players and paint
  standing on the floor are discarded as outliers, measured twice in one
  session and once in a fresh browser: identical all three times. A tolerance
  of 24 against an observed drift of 0, catching a real break of 194.
- **Write the re-baseline procedure INTO the gate**, with the instruction
  never to widen the tolerance to clear a red. A gate whose numbers can be
  edited by whoever is annoyed by it is a comment.
- **The general form: a test that only compares siblings assumes the parent
  is fixed.** When the thing that broke IS the parent, every sibling
  comparison agrees, and agrees wrongly.

### 1.2qq A threshold calibrated against one background is a gate on the background

Changing the default court from a flat colour to sourced photographic art
turned another suite red, and the failing check was about FIRE, not floors: a
"does the ball leave a burning trail" probe that counts pixels brighter than
luminance 200 in a box behind the ball. A cold ball must leave that box dark.

The new floor is brighter than the old one (median 202,139,68 against
155,110,73). A cold pass now scored 234-306 bright pixels against a limit of
200. Nothing about the fire had changed. The probe had always been measuring
the floor as well as the flame; a dim floor just hid it.

The tempting move is to raise the limit until it goes green, which is how
gates rot. The honest move is to re-measure and pick a threshold that
separates the SIGNAL from the background rather than one that clears today's
number: at luminance 230, sampled three times on each of five courts, a cold
pass reads 0-9 everywhere and a lit one reads 707-1836. The gate got stricter
in the way that matters, its separation went from 72x to 78x, and it stopped
depending on which floor is loaded.

- **A pixel threshold is a claim about contrast, so it inherits everything
  behind the subject.** Re-derive it on every background the product can
  actually show, not the one that happened to be default the day it was
  written.
- **"The gate went red and nothing it tests changed" is a finding about the
  gate**, and it is worth the twenty minutes. It is also the exact moment
  the temptation to just nudge the number is strongest.
- **Say the separation out loud when you move a line.** "72x to 78x" is
  checkable; "I adjusted the threshold" hides which direction you went.
- And found in the same file: **it printed "1 FAILING" and exited 0.** A
  harness that reports failure only to a human reading the scrollback is
  green to every script that runs it. Every check script ends with a real
  exit code, and that gets proved once, like any other gate.

### 1.2rr Judge it on the device it is used on, or you will polish the wrong thing

Two rounds of work went into making a game board feel less "airy": grain,
contact shadows, plates behind the numbers, an apron around the edge. All of
it was judged on a desktop screenshot.

Then I shot the same build at phone size and measured the court through the
app's own projection rather than off the picture:

    390x844 phone     court 171px of 844  = 20.2%    279px of dead space below
    375x667 (SE)      court 164px of 667  = 24.5%
    430x932 (Max)     court 189px of 932  = 20.4%
    1280x860 desktop  court 574px of 860  = 66.7%

The board is three times bigger, proportionally, on the machine almost nobody
plays it on. Every fix in both rounds was detail work inside a container that
is the wrong size, rendering jersey numbers about four pixels tall. No amount
of shadow quality survives that.

- **"It feels cheap" is more often a LAYOUT diagnosis than a MATERIALS one.**
  Materials are the satisfying thing to work on and the easy thing to see in a
  diff, which is exactly why they get reached for first.
- **Screenshot the primary device before deciding what the problem is**, not
  after building the fix. One frame at 390px would have redirected both rounds.
- **Measure the container as a PERCENTAGE of the viewport, across sizes.** An
  absolute pixel count hides it, and one device can be dismissed as an outlier
  where three cannot.
- Related trap in the same session: screenshotting the canvas ALONE made the
  problem look even worse than it is, because the controls that cover part of
  it were cropped out. Judge the whole screen a person actually sees.

### 1.2ss Prove a visual claim by removing the thing, not by admiring it

I had described the contact shadows as grounding each piece and reading its
height. On the real floor something looked off, and the argument for and
against was going to be pure opinion.

The test that ended it in one frame: **render the shadow and skip the sprite.**
What appeared was a faint smudge. The shadow's dark core is sized to the
piece's own base, so the piece covers it completely, and all that escapes is a
small dot below that reads as a separate stain. The feature I had written up as
the centrepiece of the pass was contributing almost nothing.

- **For any "does this element do what I claim" question, delete the element or
  delete everything else.** Isolation converts a taste argument into a picture.
- **Do it in flight, never on disk.** These variants were produced by rewriting
  the source in the browser at request time, so a crashed run cannot leave the
  repo dirty. Earlier this same session a `git checkout` used to undo an
  experiment destroyed hours of uncommitted work (1.2kk).
- **A variant patch that fails to match must be a hard error.** My first
  "no plate" frame killed the plate's fill but left its outline, so it showed a
  worse plate rather than no plate. A half-applied patch argues for keeping a
  thing using a picture of it still being there.
- **Do not fix a taste question by shipping your preference.** The near-black
  figurine base is a chosen colour and a real weighted-base look; it is also
  what makes the board read as a checkers set. That one goes to the owner with
  both frames, not into a commit.

### 1.2tt A gate you wrote yesterday should be allowed to fail you today

Rebuilding a game's plain, art-less board, I picked a single wood colour to
replace the two-tone checkerboard it had been using. It looked good. The
colour gate I had written the day before went red: the new wood rendered 7
units away from a different court's floor, out of a threshold of 12. Two of
the six courts would have rendered as the same floor.

The tempting read was "my anchor is stale, I changed the floor on purpose,
re-baseline it." That read is half right and entirely dangerous. The anchor
for the court I changed WAS stale. But the rule that fired was a different
rule, about two courts colliding, and it was correct.

- **When a gate goes red after a deliberate change, separate the checks it
  contains before you touch any of them.** Mine holds four rules; one was
  obsolete and three were still doing their job. "Re-baseline" applied to
  exactly one.
- **Re-baselining around a failure is how a gate becomes a comment.** Had I
  recorded the new colour as the anchor, the collision would have been
  written into the baseline as expected behaviour, and the gate would then
  actively defend the bug.
- **The fix went in the CODE, not the threshold.** The floor was retoned to a
  paler value that sits 37 from its nearest neighbour.
- **Record the re-baseline with its date and its reason, in the file.** A bare
  number changing in a diff is indistinguishable from someone silencing a
  gate.
- And the part worth the most: this is a bug the owner would have caught by
  eye, days later, exactly as he caught its predecessor. **The gate moved the
  discovery from him to me, which is the entire point of having one.**

### 1.2uu A comment that quotes a measurement goes stale like any other number

The same gate's header said its tolerance was "loose against a drift of zero",
because when I wrote it, three runs of the same build had returned identical
values. True, and I checked it.

Then ordinary code changes elsewhere moved four of the five recorded values by
7 to 9. Still well inside tolerance, so nothing failed. But the header now
told the next reader that any drift at all was suspicious, which would make
them treat a normal 8 as a signal.

- **A measured claim in a comment has a shelf life, and nothing warns you when
  it expires.** The code around it can drift while the sentence stays put.
- **State what the measurement covered.** "Repeated runs of the SAME build
  drift by 0; across unrelated code changes it has been 7 to 9" is durable.
  "Drift is zero" was true about a narrower thing than it sounded.
- The same pass found a second stale line: a comment explaining that two
  particular courts were "genuinely similar warm woods, 21 apart", written
  before I retoned one of them to sit 37 away. **When you change a number,
  grep for the prose that describes it.**

### 1.2vv When the symptom survives the fix, the diagnosis was incomplete, not the fix

An owner circled dark lines running through a rendered game piece. I found the
light was inverted, fixed it, and told him so. He looked again: still there. I
found a second cause, a hard lighting clamp that made the silhouette dark by
construction, fixed that too, and told him so. He looked again: **still there.**

The third cause was not lighting at all. Two colour boundaries were set at
heights where the shape was still curving, so a cone that catches the full key
light got painted in the bright body colour and a wide disc got painted in a
contrasting one. Both read exactly like seeing through the object to its far
side.

What made the third one findable was a test that could only have been run
because the first two fixes had shipped: **move the light and see if the
symptom moves.** It barely did, which ruled out the entire family of
explanations I had been working in.

- **Two real fixes for a symptom do not mean the symptom is fixed.** Each one
  was correct and each one improved the piece. Neither was sufficient, and
  "I fixed the cause" is a claim about the symptom that only the symptom can
  settle.
- **Ask what would move it.** Once a hypothesis names a mechanism, there is
  usually a cheap perturbation that should change the result a lot. If it
  changes nothing, the mechanism is not the one operating.
- **Believe the person still pointing at it.** He said "still" three times.
  Each time I had a fresh, true, well-evidenced explanation, and each time the
  honest read of "still" was that my explanation was incomplete rather than
  that he was looking at the old build.
- **Check whether your own last change caused the new complaint.** He also
  reported a dip in the crown, right after I had resampled the profile curve.
  The obvious suspect was my spline. Rendering with the spline disabled showed
  the identical notch: it predated me by a long way and had simply been
  invisible while the surface was faceted. **A defect that becomes visible
  because you improved something is not a defect you introduced**, and the
  five minutes to tell those apart is what stops a good change being reverted.

### 1.2ww Paint the hypothesis onto the pixels

An owner kept reporting the same defect: dark lines running through a rendered
object, "like you can see through it to the other side". I produced two
confident diagnoses in a row, each with real evidence, each shipped as a real
fix, and each wrong about HIS symptom. He reported it a third time.

What broke the loop was not more reasoning. It was thirty seconds of code that
coloured every polygon by which half of the object it belonged to: near half
blue, far half red. One render, and there was a solid red band lying across
the middle of the piece. Far geometry drawing on top of near geometry. The
sort was broken, which is precisely and literally what he had been describing
all along.

- **When you cannot see a cause, render the cause.** Map the suspected variable
  to colour and draw it. Depth, ownership, which branch produced a pixel, which
  code path touched a row. The answer stops being an argument and becomes a
  picture.
- **The diagnostic is usually cheaper than the theory it replaces.** I had
  spent far longer reasoning about lighting models and colour boundaries than
  it took to write the two lines that settled it.
- **A wrong diagnosis is expensive in a way a wrong fix is not.** My second
  attempt changed values that were fine, and the owner had to notice both that
  the bug survived AND that something else had got worse. Revert those on the
  spot and say plainly they were wrong, rather than leaving them in because
  they were argued for at the time.
- **Corollary for the "it must be X" reflex:** if two independent, plausible,
  well-evidenced explanations both fail to remove a symptom, stop generating a
  third explanation of the same kind. The category is wrong, not the instance.

### 1.2xx A colour complaint can be a VALUE complaint wearing a disguise

An owner reported that "the brown makes its way a little bit through on the
edges" of an orange game piece. I read the word brown as evidence of a
different material bleeding in, went looking for geometry leaking past the
silhouette, and shipped a fix that culled thin polygons at the outline. It
chewed visible notches out of the shape and did not remove the fringe.

There was no brown. The piece is orange, roughly 214,112,40. The edges are
real surface turning away from the light. Orange at half brightness is
111,58,21, and 111,58,21 is brown. **A steep enough value ramp walks a hue out
of its own family, and the eye reports the destination, not the journey.**

The fix was in the shading, not the geometry: raise the ambient floor so the
turning edge bottoms out at 0.61 of full rather than 0.52, and it stays orange
while still reading round.

- **Before hunting for a source of colour X, check whether colour X is just
  colour Y underexposed.** Multiply the base colour by the darkest value your
  shading can produce and look at the result. It takes ten seconds and it
  would have saved a wrong fix here.
- **Non-technical reports name what the eye SEES, not what the renderer DID.**
  "Brown is showing through" is a completely accurate description of the
  pixels and a completely misleading description of the cause. Translate
  before you act.
- **The tell that I was on the wrong track was available immediately:** my fix
  removed geometry and the fringe stayed. If the thing you deleted was the
  cause, deleting it ends the symptom.

### 1.2yy One shape, never two: the only invisible join is at a slope-matched point

A 3D game piece had one defect at the top of its head: the profile curve that
gets spun into the shape stops at radius .02 instead of 0, leaving a pinhole
tube you can look down into. One number, off by .02.

I fixed it four times by ADDING A SECOND SHAPE. A cone on the end. Then a
dome. Then a spline driven through an added apex point. Then a quarter circle
off the last substantial ring. Each one was a better second shape than the
last, and each one was visibly wrong in the same way, because they all began
part-way down a taper where the existing slope is steep and non-zero. A cap's
curvature meeting a taper's curvature at an angle is a slope discontinuity,
and on a surface meant to be smooth the eye reads a slope discontinuity as a
seam between two objects. The owner named it exactly: *"like you put a milk
dud on the top half"* and *"the whole head should be a single shape, not two
put together to fix an issue."*

The fix was to stop capping and REBUILD. Find the widest ring of the head,
throw away everything above it, and regrow the top as a single half-ellipse
from there. **A new curve can join an existing one invisibly at exactly one
kind of place: where both slopes are the same. At the widest point of a
rounded form the slope is zero, and an ellipse is also flat at its widest, so
the tangents match and there is no join to see.** Everywhere else, the seam is
a property of the geometry and no amount of tuning the cap will hide it.

- **When a fix keeps producing the same class of artifact at higher and higher
  effort, the fix is the wrong KIND.** Four caps was three too many. The
  signal to stop was after the second one, when the bump moved but did not go.
- **A one-number defect deserves a one-number look before it deserves new
  geometry.** I never asked "can the curve simply be made to reach zero"
  before I started bolting things on, and the answer was yes: rebuild the last
  stretch of it.
- **Additive fixes are seductive because they are LOCAL.** Adding a cap does
  not disturb anything already working, so it feels safe. But a local fix at a
  place with the wrong boundary conditions cannot succeed, and its safety is
  what lets you retry it four times without noticing.
- **A landmark search needs an anchor, not a threshold.** Looking for "the
  widest ring above 60% height" found the SHOULDERS and turned the entire
  figure into a bullet. Finding the NECK first (the narrowest ring in a band),
  then the widest ring above THAT, is stable across all five body types.
  Caught in the render, not by reasoning: a geometry search that returns the
  wrong landmark returns a plausible number, never an error.

### 1.2zz A before/after with unseeded randomness is not a before/after

I shot two frames of the same game to show one geometry fix, cropped the same
region of both, and wrote underneath them: *"Same seed, same court, same
camera. Only the head profile differs."* Then I looked at the picture. The
left frame showed player number 6 standing on one tile and the right frame
showed number 17 standing on another, because the app picks its rosters at
random on every load and I had never seeded it. There was no seed. The
sentence was three claims and all three were mine to check.

The fix is four lines: install a fixed linear congruential generator over
`Math.random` from first paint, so every variant differs only in the patch
being judged.

- **The caption is a claim, and it needs the same evidence standard as a
  number.** "Same conditions except X" is a controlled-experiment assertion.
  If nothing in the harness enforces it, it is a wish.
- **Randomness that is invisible in one frame becomes obvious in two.** A
  single screenshot of a random layout looks authoritative. The comparison is
  what exposes it, which means comparisons should be the FIRST place you seed,
  not an afterthought.
- **I caught this only because I rendered the artifact and looked at it.** The
  generator ran clean, the images were valid, the page had no errors. Every
  automated signal was green on a page whose central claim was false.

### 1.2ccc Do not delete a good idea to avoid fixing its bad execution

An owner said a piece of my 3D work did not look right. I could not see how to
fix it, so I proposed three ways of REMOVING it, recommended the most aggressive
one, and shipped a version with the element cropped away. He came back:

> "I really liked the idea of the Stantion but it was just poorly made in my
> opinion so it just looked like weird cylinder tubes and stuff instead of a
> real basketball hoop frame."

Both halves of that were true and I had acted on neither. The idea was good.
The execution was bad in a specific, nameable, ten-minute way: every structural
member was drawn as a round-capped line, so each one rendered as a pipe, and no
arrangement of pipes reads as steel. Replacing the stroke with an actual
rectangular prism, four shaded faces built from the member's own direction,
fixed the whole complaint.

- **"I can't make this look right" and "this shouldn't be here" are different
  conclusions, and only one of them is mine to reach.** Deleting is the
  strongest possible edit and I was reaching for it because it was the one I
  knew how to execute.
- **Removal disguises itself as taste.** My write-up cited broadcast
  convention and screen real estate. Both were true. Neither was the reason;
  the reason was that I did not know how to draw a stanchion.
- **When something "doesn't look real", name the primitive before choosing a
  response.** Round cap versus flat face. Stroke versus fill. Truss versus
  mast. Those are answerable questions with cheap fixes. "It looks wrong" is
  not, and it invites amputation.
- **Ask what the thing is MADE of.** Twice in one hour the answer was
  transparency misused as a material: a backboard's rear pane and a foam base
  pad were both drawn with alpha, and both read as glass. Opacity is a claim
  about material, not a way to soften something.

**POSTSCRIPT, and it changes the lesson.** The rebuild described above was
rejected too, and the owner's verdict on it was *"omg that is so much worse...
just restore the old one."* Everything reverted.

So the diagnosis was probably right and it did not matter. Round caps do read
as pipes. An A-frame truss is not a shape that object has. Both true, both
fixed, and the result was still worse than what it replaced, because knowing
which primitive is wrong is not the same skill as being able to draw the thing.
I had three goes at one small object across one conversation and each one cost
him a round of looking at something he did not like.

- **Count the attempts, out loud, and change KIND after the second.** Three
  tries at the same class of solution is a pattern I have now hit twice in two
  days: four caps on a figurine head, three goes at a stanchion. The head one
  eventually worked, which is exactly what makes the pattern dangerous.
- **"Correct diagnosis, failed execution" is a real and common outcome, and it
  is a signal to stop, not to iterate.** When the third attempt is worse than
  the original, the honest report is that this is beyond what hand-built
  geometry will do here, and the medium question should be reopened: build it,
  source it, or leave it alone.
- **The revert is the deliverable at that point.** Getting back to exactly the
  prior state, quickly and provably, was worth more than any of the three
  attempts. Being able to say "restored from this commit, these five hunks,
  nothing else touched, suite green" is what made it a small loss instead of a
  scary one.

**SECOND POSTSCRIPT, and it is the real lesson.** After the revert the owner
said: *"I really did want to change the frames but you couldn't seem to get it.
And honestly I would have wanted to see some changes and then side by side
comparisons before you went making decisions."*

So I got two things wrong and only one of them was drawing.

**I closed the item.** Having failed three times, I marked the work done and
wrote "do not reopen" on it. He still wanted the change. **An item leaves the
list when the work is finished or when the owner rules it dead, never because I
ran out of ideas** — closing it converts my limit into his loss, silently, in
the one file he uses to know what is left.

**And I decided three times without showing him anything first.** This project
has had a written rule since day one that a visual change ships a side-by-side
comparison. I had been reading that as a receipt: decide, build, ship, then
publish the before-and-after. Read that way it is worthless as a control,
because every comparison I produced was of a decision already made.

- **A comparison is a STEERING WHEEL or it is a press release.** Before the
  decision it is how someone with taste picks. After it, it is me explaining
  myself. Same artifact, opposite value.
- **"I shipped my recommendation, it is one line to switch" is still deciding
  for them.** It asks them to react to a change rather than choose between
  equals, and it puts the burden of reversal on the person who did not make the
  choice.
- **When even the option list is a guess, show the LIST first.** Naming the four
  things you are about to build costs one message. Building the wrong four costs
  an afternoon and their patience.
- **Check what a rule says about TIMING.** This one said what to make and never
  said when, so I supplied the convenient answer for three sessions. Any rule
  that can be satisfied after the fact will be.

### 1.2ddd A stable id is a NAME, and it must never look like a position

I replaced eight tangled id schemes with one flat numbering: assigned once,
never changed, never reused, so a reference in an old commit always resolves.
That part was right and it fixed a real problem the owner had raised twice.

Then I filed a brand new item, number 97, into the second row of a list whose
other visible rows were 2, 3, 4 and 5. He came straight back: *"what is this
item 97/96 stuff I thought we had the single list thing."*

The list was fine. The placement was not. A reader scanning 2, 97, 3, 4, 5
concludes the numbering is broken, because **small ascending integers at the
left edge of a list look like positions, and people trust that shape more than
any documentation.** I had also said out loud that "96 was already taken",
which is internal bookkeeping leaking into a conversation with the person the
system is supposed to serve.

The fix is not renumbering, which would destroy the one property that made the
scheme worth having. It is a placement rule: **new items go at the BOTTOM of
their list with the next free number**, so reading top to bottom the numbers
mostly ascend and a stranger never appears near the top. Relatedness is
expressed in a note, not by physical adjacency, which is what tempted me to
insert it high in the first place.

- **Two properties are in tension here and only one is negotiable.** Stable ids
  are worth keeping. Sorted-looking output is worth keeping. Insertion order is
  not, so that is the one to give up.
- **Anything that LOOKS like an index will be read as one.** If ids are not
  positions, never let them appear out of order in front of a human.
- **Do not narrate the id allocator.** "That number was taken" is a fact about
  my bookkeeping. To the person reading the list it is noise that suggests the
  scheme is fragile.

### 1.2eee A boolean cannot see a collision

A layout change broke a feature, and 61 green checks went through it without a
flicker. One of those checks was written specifically to protect that feature
on that screen. It read:

    hint: !!document.querySelector('.install-hint')

The pill existed. It was also sitting on top of the product's name, having been
pushed there by a header that changed from a column to a row underneath it. The
assertion was true and useless in the same breath.

**An existence check protects an element from being deleted. It protects it
from nothing else.** Position, size, overlap, whether the thing next to it got
shoved off the screen: all of that is outside what a boolean can express, and
all of it is what a layout change actually does. The moment a check is about
something VISUAL, the assertion has to be a measurement, or it is asserting the
one failure mode that was never going to happen.

The rewritten checks read like this instead, and each one turns red under its
own separate sabotage: the pill does not overlap the wordmark's rect · it sits
below the lockup rather than inside it · it is under 300px wide, because
forcing the line break with flex makes a pill into a full-width bar · the
wordmark's right edge is still inside the viewport · the computed cursor is
`pointer`.

- **Ask what a check would still pass with.** If the answer includes the bug
  you are worried about, it is the wrong assertion. `!!el` passes with the
  element face down in the gutter.
- **A visual check has to read geometry or computed style.** `getBoundingClientRect`
  and `getComputedStyle` are the only two things that know what the screen
  looks like. Class names and DOM presence do not.
- **The second half of the same lesson: a feature that only exists on one class
  of device is invisible to every check that does not pretend to be one.** This
  offer only appears on a phone that can actually install, so every desktop
  screenshot was perfect and no run had ever opened the screen wearing a phone's
  user agent. Enumerate the device states a feature has, and drive each one.
- **The owner found it by asking, which is the tell.** He asked whether the
  thing still worked. I could not answer from the suite, only by going and
  measuring, and that gap between "green" and "I know" is exactly the size of
  the untested case.

### 1.2fff When the fixes all land and the thing is still broken, the unit of work was wrong

Someone described a screen as cluttered and named three things: a status strip
that never changed, a paragraph of prose during their turn, and some controls
that read as floating boxes. Three specific complaints, three specific fixes,
all three shipped, all three correct. I closed the items.

Three days later he sent five screenshots and said it was chaos.

Nothing I had built was wrong. The strip is gone. The prose is a beat that
fades. The controls are one panel. What I had missed is that those three
complaints were **samples from a population**, not the population. He was
pointing at a screen with too much on it and naming the three loudest
offenders, and I treated the list as exhaustive because a list is so much
easier to finish than a judgement.

The tell was there in his original words and I read past it. He had written
*"I don't think any well designed well respected game has text just all over
the place"*, which is a statement about the whole screen. I extracted the
three nouns and dropped the sentence they were in.

- **Count the complaints against the surface.** Three defects on one screen is
  a screen problem. Three defects across three screens is three defects. The
  same three items mean opposite things depending on how concentrated they are,
  and concentration is countable before any work starts.
- **A complaint that generalises is not a list.** "X is all over the place"
  and "these three Xs bother me" ask for different work. If the sentence would
  still be true after you fix every named item, you have not understood it yet.
- **Fixing every named item and asking "is this right now?" is cheap.** I did
  not ask. I closed the rows, because they were closable, and closable is not
  the same as done.
- **Local fixes can pass each other by.** Each of my three made its own thing
  better and none of them reduced the number of things competing on the screen,
  which was the actual complaint. Ask what the fix does to the WHOLE before
  asking whether it fixes the part.

And the second-order version, which is worse: a fix measured in one layout is
a fix in that layout. One of the three shipped correctly and then broke on its
own three days later, when an unrelated change made the court taller and the
controls collapsed to a strip with a third of them off screen. The verdict I
had written on that row was true when I wrote it and false by the time anyone
read it. **Nothing re-reads a verdict.** If a change can invalidate one, the
verdict needs a check under it, not a sentence.

### 1.2ggg A red check names two suspects · isolate the claim before you file

A harness that drives the product is itself a program, and when one of its
assertions goes red there are always two suspects: the product, and the
staging that drove it. The red does not say which. Filing without deciding is
worse than either error alone, because a defect row that turns out to be the
harness's own bug costs the reader a full investigation and teaches them to
trust the list a little less.

The week supplied both verdicts inside a single run. A pause-menu harness put
27 assertions against four navigation roads and three went red during
development. Two were the product: a road that strands the game frozen with
no menu, and a road that ends on no screen at all. Both filed, both real.
The third accused the game of ignoring a theme change made mid-match, and the
game was innocent twice over. The harness waited 900ms for an apply that
takes about 1.5s (a fixed sleep, the 1.2gg lesson, collecting again). And
after that was fixed it STILL failed, because the harness's own next action,
tapping the labels switch, ran a refresher that re-centers the theme carousel
on the stored theme and stomped the flick it had just made. The same week's
moment inventory had already produced the same shape: a "stale instruction
line" that was really my staging skipping the game's own painter.

- **The differential is a minimal probe.** Ten lines outside the harness,
  driving ONLY the failing claim: click the theme card, wait, read the body
  class. It passed, which convicted the harness. If it had failed, the
  product. Cheap, decisive, and it ends the argument before the filing.
- **The suspects hide in the staging's side effects, not just its timing.**
  The second layer was not a race: it was the harness doing two reasonable
  things in an order whose first thing was undone by the second. Read what
  every staged action DOES, not only when it runs.
- **False reds defame, false greens flatter, and they are found differently.**
  A flattering counter is caught by walking both halves the same way (the
  unmined.py lesson). A defaming red is caught by isolation. Knowing which
  direction an error runs tells you which tool finds it.
- **The check:** before a red becomes a filed defect, reproduce it in
  isolation once. Write which suspect the probe convicted into the filing.

### 1.2hhh "It doesn't exist" is a claim about the WORLD · the tracker only knows what is owed

The assistant told the owner, twice in one day, that a piece of research
"never ran": a reference pull that had been blocked by a paywall weeks
earlier. It proposed re-doing the work, filed a fresh row for it, and asked
him to reconnect the service. He scrolled back through an old chat on his
phone and found the session where the pull had run, succeeded, and been
committed. The file was in the assistant's own working tree the whole time:
one grep would have found it in two seconds. The owner's question was the
right one: "why can't you see the old one?"

Two failures stacked, and they are different lessons:

- **The record went stale at the moment of success.** The scrap note
  ("blocked by a paid plan") was true when written. The same night, the plan
  changed and the pull ran, and the session that ran it updated the diary
  but never the scrap note. A note that explains why something is dead is
  exactly the note nobody rereads after the thing comes back to life.
- **The tracker was trusted about a matter of FACT.** A work tracker is
  authoritative about intent: what is owed, what was decided, who owes it.
  It is merely a witness about the world: what exists, what ran, what is on
  disk. The assistant read "scrapped: paywall" and asserted "never ran"
  without checking the one system that could not be stale, the filesystem.

- **The check:** before asserting any "never happened / doesn't exist /
  was not done," search the artifact store for it: the repo, the disk, the
  commit log. Existence claims are grep-cheap, and the tracker's word on
  them is hearsay.
- **The deeper check:** when work that was blocked becomes unblocked, the
  FIRST question is "did a previous session already do this the moment it
  unblocked?" A freshly-opened door usually has footprints in it.
- The owner should not have to be the retrieval system. He found in
  phone-scrollback what the assistant had in its own checkout.

### 1.2iii The operator's tracker requirement, in his own words

After a day of catches (launch scope demoted against his recorded rulings,
banked research declared missing, a whole post-launch design living in prose
no list ever showed him), the owner named the requirement underneath all of
it, and it is portable to every project an AI system runs with a human:

> "I need to visually see a complete picture and be able to SEE what's done
> and what needs to be done. It's how I function it's how I learn, it's how
> I process. Nothing can just be hidden behind scenes. I will forget or feel
> an uncomfortable feeling that things are missing and that is what really
> leads to the endless list of things to do, the lack of tracking leads to
> more things."

The mechanism he identified is the important part: **hidden tracking does
not just lose items, it MANUFACTURES them.** A commitment the owner cannot
see reads as missing; missing gets re-asked; re-asked gets re-filed under a
new name; and now the list is longer AND less trusted. The endless list is
a symptom of invisibility, not of scope.

- **The complete picture is two halves on one page:** everything open, in
  ruled order, and everything done, as a ledger. Done-ness is half the
  picture; a board that only shows open work makes every closed item look
  like a disappearance.
- **Render, never re-write.** The one page is GENERATED from the working
  files (the list, the changelog), so it cannot drift into a second truth.
- **No planning surface off the board.** Any doc that holds a plan either
  renders onto the picture or it is a trap: the AI will believe the doc,
  the owner will see the board, and the two will diverge until trust breaks.
- He also named where this points: a project-management surface he can
  reuse on every project. The pieces built here (a plain-text list schema,
  a generator, a drift detector, a shipped ledger) are the seed of exactly
  that, and they are deliberately boring enough to travel.

### 1.2jjj "Start fresh" means the NUMBERS start fresh, not just the story

Caught by Aaron on the type-scale proposal (08-25): *"Is this type scale
based on any true deign standards? or is this just based on thwe sizes we
used? ... dont be afraid to start fresh, thats one of the rules remember,
we dont need to design around a broken system."* He was right. The
"nine-step ladder" I proposed was the existing 89 font sizes re-binned
into nine buckets: the broken system wearing reform's clothes. It LOOKED
like a fresh scale; its every value was inherited.

- **Check the provenance of your proposal's values.** If each number in
  the "new" system can be traced to a number in the old one, no design
  happened; only compression.
- **The honest order is: standards and references first, derive the
  candidate from those, and only THEN compare it against the incumbent.**
  Deriving from the incumbent and citing the standards afterwards is
  rationalisation.
- This is the same failure as justifying a choice by what is already
  shipped, one level deeper: justifying a choice by what is already
  *drifted*.

### 1.2kkk A ruling that comes back "I don't understand" was written in the writer's units

The ink-ladder decision (08-25) came back *"I dont understand this one."*
It had been written in MY units: contrast ratios, a 4.5:1 floor, token
names. The operator decides visually; the decision gave him arithmetic.

- **Rewrite in the decider's units: the actual effect, at actual size, on
  the actual background.** For text contrast that means lines of real
  text in each proposed ink drawn live on the real card colour, with the
  verdict beside each line, not a ratio table.
- **A demo the decider can experience beats a picture of the demo.** CSS
  drawn in the page IS the effect; a screenshot of it is one translation
  removed and drifts with compression.
- The tell that a decision is in the wrong units: every option needs a
  definition read before it can be voted on.

### 1.2lll The mockup must obey the law it advertises

The D4 radius render (08-25) squared the round Start over button because
the harness used a blanket `.ctrlbtn{border-radius:8px}` while the option
it illustrated said circles stay. Aaron asked the exactly right question:
"I dont understand why you said circles are fine but still changed the
'Start Over' Button." The rule and the picture disagreed, and the picture
was wrong. A render that violates its own option's law is worse than no
render: it teaches the decider a rule nobody proposed.

- **Over-broad selectors are how mockups lie.** Patch exactly the
  elements the option changes, exempt the ones it protects, and guard the
  exemptions: the re-shoot asserts the circle's computed border-radius is
  still 50% before the shot counts.
- **When the decider says the rule and the picture disagree, check the
  picture first.** The render is the newest, least-reviewed artifact in
  the room; the law was argued over.

### 1.2mmm "What does choosing this MEAN?" is answered by running the choice and measuring

Aaron on the palette decision (08-26): "I dont even know what choosing
more colors or a palette is going to really mean for the app visually."
The honest answer was an experiment, not an explanation: flip the entire
token layer to the candidate on the real build, screenshot both, diff the
pixels. Result: 1.0% of pixels moved, mean delta 3/255, invisible, because
296 colours are hardcoded past the tokens' reach. That number reframed the
whole decision: a palette is not a repaint, it is the law the sweeps
repaint by.

- A decision that feels abstract to the decider usually IS abstract: its
  visible consequences arrive later, through other work. Say when and
  through what, with the mechanism named (here: the sweeps, each with its
  before/after).
- The cheap experiment beats the careful description. One route-injected
  render plus a pixel diff answered what three paragraphs could not.

### 1.2nnn When a verified mechanism contradicts the artifact, check WHICH artifact you are reading

The free-Druk render (08-26) came out wide four times while every probe
said the narrow width axis worked: face loaded, computed style 55%, a
clean-room test 224px vs 636px. The mechanism was never broken. The
harness wrote screenshots to a RELATIVE path, later runs were launched
from a different working directory, and every "still wrong" verdict was
me re-reading the first run's stale file while the fixed shots piled up
in an unseen folder. Four debugging rounds spent on a correct system.

- **The order of checks was backwards.** Before debugging the mechanism,
  verify the chain of custody: is the file I am judging the file this
  run produced? A timestamp glance (`ls -la` against the run time) would
  have ended it in one round.
- **Harness output paths are absolute, always.** A relative output path
  is a landmine that detonates the day the launch directory changes;
  filed into the game-visuals harness conventions.
- Same family as 1.2hhh (the tracker said SCRAPPED while the file sat in
  the repo): the world and my picture of it diverged, and I debugged the
  world.

### 1.2ooo A "loaded live" font claim needs a metric guard, and one bad render can poison a taste ruling

Aaron judged Big Shoulders "thin" (08-26) from a board render in which the
font had never truly loaded: the Google Fonts stylesheet silently failed
in the harness context, Archivo painted the fallback, and the check that
was supposed to catch it (document.fonts.check) passed anyway. His taste
verdict was made on the wrong pixels. The re-shoot embeds the face as a
data URI (no external fetch to fail) and the guard now proves the RENDER,
not the load: it measures the target face against the fallback and fails
unless they are metrically distinct.

- **Guard the effect, not the precondition.** "The font is in
  document.fonts" is a precondition; "this text is narrower than the
  fallback would be" is the effect. Only the second catches a silent
  fallback.
- **When a decider's reaction surprises you ("thin"? it's a Black cut),
  check the evidence they were shown before debating the taste.** The
  disagreement was between him and a fallback font, not him and the face.
- External fetches inside a render harness are a reliability hole;
  data-URI the asset when the render IS the evidence.

### 1.2ppp A variable font inherits every stray weight the old single-cut let you ignore

First shipping attempt of Big Shoulders (08-26) used the variable file:
half the menu rendered Thin, because dozens of declarations still said
font-weight:400 and with single-cut Anton those numbers had been
meaningless for months. A variable font makes every forgotten weight
suddenly LOAD-BEARING. The fix shipped the ruled look as one static
Black cut declared to answer every weight request, the same single-cut
contract the code was written against; the weight axis can arrive later
as a deliberate act, when a ruling assigns jobs to weights.

- Before swapping in a variable font, census the weights the code
  already declares; each one becomes a visible decision.
- Matching the incumbent's CONTRACT (one cut, weight-blind) beats
  matching its file format. The renderer contract is part of the API.

### 1.2qqq A gate nobody runs is a comment, and a hand-picked gate list rots quietly

The music gate had been red for a day (08-25 to 08-26) and nothing said
so: the end-of-block routine listed six harnesses by name, the repo had
39, and the ruling that broke this one (the lit law hiding the tab's
badge) had no reason to be on the list's mind. Worse, the same ruling had
closed the pause menu's only door to the music player, and the gate that
would have said so was the one not being run. The runner exists now and
found four more gates guarding rules the game no longer has.

- If the completeness of a check depends on remembering which checks
  exist, it is not a check. Enumerate from the filesystem, never from
  memory: `readdirSync(tools).filter(endsWith('-check.mjs'))`.
- **When a ruling retires a law, the gate that asserts the old law is
  part of the ruling's blast radius.** Grep the gates for the behaviour
  you just changed, in the same commit that changes it.
- A red gate is not automatically a broken build. Four of the five reds
  here were the gate being behind the game; one was a real regression and
  one was a real data bug. The verdict has to be spoken per gate.
- Run the suite in lanes for speed, but re-run a red one ALONE before
  reporting it: install-check fails under four-way load and passes on its
  own, and a false red spends the same trust as a missed bug.

### 1.2rrr A centred column that overflows hides its own top

`display:flex; justify-content:center` on a scroll container is the
default way to centre a screen, and it silently deletes content when the
column outgrows the window: the overflow above the first line cannot be
scrolled to. The settings screen had been shipping without its title,
236px of it, on every phone size. Nobody had reported it, and I had
screenshotted that screen repeatedly without noticing, because a
screenshot of the top of the scroll region LOOKS like the top of the
screen.

- `justify-content:safe center` is the fix and it degrades safely:
  browsers that do not know the keyword keep the previous line.
- Sweep the whole class, never the one instance. Measuring every screen
  took one small harness and proved the other twenty were clean, which is
  what made the one-line fix safe to ship.
- A layout bug that removes content leaves no visible edge to notice.
  Reach for measurement (where is this element relative to the window?)
  on any screen that scrolls, rather than trusting the eye on a capture.

### 1.2sss Deleting a screen is a search-and-replace across the harnesses, not a delete

Retiring the numbered menu on 08-27 took four lines of markup deletion and
then eleven separate repairs: four gates pinned themselves to that screen
with `localStorage.setItem('bk_menu','classic')`, four event handlers bound
ids that no longer existed (the page threw on load and every one of the 39
gates went red in three seconds), and three gates read ids that only that
screen carried, `#dailyStamp`, `#dsMonth`, `#dsMark`. The whole suite going
red at once was the useful signal: a uniform failure is infrastructure, a
scattered one is content.

- Before deleting a screen, grep the harnesses for its id, for every id
  INSIDE it, and for any storage key that pins a test to it. That list is
  the real size of the job.
- `g('someId').addEventListener` throws on a missing element and takes the
  whole script with it. One dead id silently disabled the entire game.
- The ids that survive a screen merge are the ones written as data
  attributes. `[data-daily]` needed no repair anywhere, `#dailyStamp` needed
  four. Address a thing by what it IS, not by which screen it sits on.
- A gate that pins a precondition ("run me on the classic menu") is a gate
  that will outlive its precondition. Prefer reading the live state.

### 1.2ttt My first argument for a design position was measured wrong, and the measurement was three lines

Asked whether the feedback button could be dropped from the pause menu, I
reached for "a report from a menu loses the game's context" before checking.
It was false: the context builder reports all fifteen fields from the menu
too, because the game is still loaded behind it. Three lines in a harness
settled it, and the honest answer to him was better than the invented one:
the real difference is one tap versus two during a tester run.

- The instinct to defend a position arrives BEFORE the evidence for it.
  Treat your own first counter-argument as a hypothesis with a number
  attached, and go get the number.
- Telling him "my first argument was wrong, here is what is actually true"
  costs nothing and buys the credibility that makes the second argument
  worth reading.

### 1.2uuu A check can pass for the wrong reason, and that is worse than failing

Rewriting the turn-economy guard (08-27), three negative claims went green
on the first run: "the same player cannot step twice", "the ball carrier
never steps free", "beyond range is not free". All three were reading a
predicate that returns false whenever the game is outside the move phase,
and my probe had not staged one. They were not testing their claims at all;
they were testing that I had set up the state wrong, and agreeing.

The tell was a claim that should have been TRUE failing beside them. A
negative check that passes in a broken harness is invisible; only the
positive check next to it exposed the setup.

- For every check that asserts something is REFUSED, make sure a sibling
  check asserts something is ALLOWED through the same call. If the allow
  case fails, every refuse case beside it is meaningless.
- Ask a predicate the way the product asks it. `freeStepQualifies` is called
  from a staged move; a probe that calls it cold is asking a different
  question and getting a real answer to it.
- Green on the first run of a NEW check deserves suspicion, not relief.
  Sabotage is the cure and it is cheap: making the predicate say yes to
  everything turned exactly those three red.

### 1.2vvv A number typed into prose is a second copy of the data

Three separate reds this week were the same shape: a count written by hand
somewhere that the data could grow past. A gate wanted seven drills and the
gym holds eleven. A gate wanted 14 registered sites and the register holds
17, and the Tape's own description told the reader 14 as well, which was a
real bug shipped to the person who relies on that tool. A gate asserted a
switch "ships OFF" months after it was flipped on.

- Read the count, do not type it. `fetch` the table, `querySelectorAll` the
  things, compare the two halves to EACH OTHER: "the door promises exactly
  the number of drills behind it" cannot rot, "seven drills" rots the day
  the eighth lands.
- The same rule binds product copy. If a sentence contains a number that
  comes from data, either the sentence renders that number or the sentence
  does not get to mention it.
- When a check disagrees with the build, the check is the likelier liar,
  but say WHICH after looking, never before. Of five reds this week, four
  were the guard and one was the game.

### 1.2www A confirmation that rewrites text destroys a control made of anything else

The old re-arm button confirmed itself by swapping its own textContent to
"Re-armed ✓" and swapping back 1.6s later. That worked while the button WAS
text. Aaron picked an icon control, and the same line would have wiped the
arrow out of the DOM on first use, leaving an empty circle for a second and
a half, with nothing in the diff to hint at it: the CSS and the markup were
both correct.

- Feedback belongs on a CLASS, not on the content. `el.classList.add('done')`
  survives whatever the control is made of; `el.textContent = 'Done'` assumes
  the control is a word.
- When a design ruling changes what an element CONTAINS, grep the JS for
  writes to that element's text and innerHTML before shipping the CSS.
- The best version of that confirmation turned out not to be a flash at all:
  after the reset there is nothing to bring back, so the button goes dark on
  its own. State that changes honestly is a better receipt than a message.

### 1.2xxx Measure the overflow you actually have, not the one you pictured

I told Aaron the old Start over words "spill out both sides" of their circle,
and built a comparison guard around `scrollWidth > clientWidth`. The guard
failed on a build I could see was broken. The truth: the words WRAP to two
lines of 36px and 33px inside a 36px opening, so the text stack is 39px tall
in 36px of room and spills past the BOTTOM while running edge to edge across
the width. Same defect, wrong axis, and the check I wrote first could not see
it at all.

- `scrollWidth`/`scrollHeight` beat eyeballing, but check BOTH axes: text
  that wraps relieves the width and moves the problem to the height.
- A guard that fails on a build you can see is broken is telling you the
  guard is wrong, not the build. Read the numbers before adjusting the
  threshold.
- Say the measurement, not the impression, when reporting to someone who is
  going to repeat it. "Spills out both sides" was going to end up in his
  mouth in front of somebody.

### 1.2yyy The same blind spot twice means the instrument is wrong, not the run

A census counted the lit things on Aaron's menu and reported four. It was
five: the Quick Run tile's clock face is drawn with `color-mix`, which
computes to `color(srgb r g b)`, and the counter's regex only knew `rgb()`.
He ruled on the number I gave him. The identical blind spot had already cost
a ring assertion in lit-check on 08-26, and I fixed it THERE and nowhere
else, so the second instrument stayed blind for a day and then produced a
figure a decision was made on.

- Fixing a parser bug in one file is half a fix. Grep every harness for the
  same pattern the moment you find it: `grep -l "rgba\?(" tools/*.mjs` would
  have named the census that afternoon.
- Modern CSS emits at least two colour shapes and `color-mix` is everywhere
  in this codebase. Any colour reader gets both, or it is measuring a subset
  it cannot name.
- When a number you gave a decider turns out to be wrong, say so with the
  corrected number and what changed, in the same place the number was
  published. A quiet fix leaves them holding the old figure.

### 1.2zzz Removing the browser's default look removes what the default was doing for you

Repainting the volume rail meant `-webkit-appearance:none`, which also
silently discarded `accent-color`'s filled half: the coloured portion that
showed how loud the channel was. The knob still moved, so the control looked
fine in a screenshot and was worse to use, which is the failure mode a still
image cannot show.

- When you take over a native control's appearance, list what the native
  version was DOING (fill, focus ring, keyboard behaviour, high-contrast
  support) and re-provide each one deliberately.
- The replacement fill is a gradient stop driven by a custom property set by
  the same function that sets the value, so the paint cannot disagree with
  the number. Two places writing the same fact is the bug; one place writing
  both is the fix.

### 1.3a Deleting code needs two proofs, and the second one is pixels

Sweeping 34 dead CSS classes (08-27) could have been a one-line grep and a
confident delete. It took three passes instead, and each caught something the
one before it would have got wrong:

1. **Static**: styled here, never in markup, never in a JS string, never on
   another page. Produced 47 candidates.
2. **By hand**: 13 of those 47 were FALSE POSITIVES. Twelve `theme-*` classes
   are assembled at runtime as `'theme-' + name`, invisible to any search for
   the whole name, and `.woff2` was a file extension inside `@font-face`, not
   a class at all. Deleting those would have broken every theme in the game.
3. **Runtime**: a sweep of every screen, a live game, both veils and three
   theme changes recorded 437 distinct classes actually present in the DOM.
   Static analysis cannot see a class the app adds while running.

Then the delete itself was proved inert by screenshotting all 46 states
before and after. Eight moved, which looked alarming until the same build was
shot twice and the same eight moved against themselves: random rosters and
animations. Zero moved because of the cut.

- Any name a codebase BUILDS by concatenation is invisible to a search for
  the finished name. Before trusting a dead-code list, grep for the prefixes:
  `['"]([a-z-]+-)['"]\s*\+` found all four families in this codebase.
- A pixel diff across every screen turns "I believe this is unused" into
  "this changed nothing", and it costs one harness.
- When a diff shows movement, shoot the SAME build twice before blaming your
  change. Non-determinism looks exactly like a regression.

### 1.3b A receipt must never be able to fail a check that passed

tape-check died on its last line: a screenshot that waits for fonts, 30
seconds, timeout, exit 1, on a run where every single assertion had passed.
The page's fonts were fine (measured: three faces, all loaded, no failed
requests). A convenience screenshot took a green run red, and it wrote into
whatever directory the runner happened to be in.

- Separate ASSERTIONS from RECEIPTS. An assertion may fail a run; a receipt
  may not. Wrap receipts in try/catch, give them a short timeout, and print
  a note when one does not happen.
- The same rule that makes output paths absolute applies to receipts: they
  need a home chosen on purpose, not the current working directory.

### 1.3c Audit the flow, not the screens: three tries to get one picture

Row 192's audit was wrong twice before it was right, and each way was
instructive. First I jumped to each screen with `_show()` and reported on the
squad screen with no players on it, which is row 195's finding arriving in
person: a screen the flow FILLS is an empty room when you teleport into it.
Then I wrote a walker that pressed its way through, and assumed the flow
starts at the league picker. It starts at the names, and league, era, squad
and rules are the road a CPU game takes, not a local one. The walker also
stalled on the names screen and I nearly filed a bug: it had typed the same
tag into both squads and the game was correctly refusing a duplicate.

- A UI audit's first question is "how does a player get here", and the answer
  is discovered by walking, not assumed from the row's wording.
- Build the walker to follow the app: press the primary, read where you
  landed, audit THAT. An audit that names its screens in advance can only
  confirm what you already believed.
- When a harness cannot get past a validation, suspect the harness first. The
  game refusing bad input is the game working.
- Fill only the VISIBLE fields: a hidden input takes a 30 second click
  timeout and looks like a hang.

### 1.3d Three instruments disagreed with my fix, and all three were right

Housing the "floating blurb" took three passes, each stopped by a different
guard. I made it the table's header: the gate I had just written said the two
halves had a 9px hole between them, so they were still two boxes wearing one
colour. I closed the hole with a negative margin: the audit ratchet said the
fix had introduced two new distinct corner values to a codebase trying to
have fewer. And looking for a third way found the real problem with the whole
idea: the handicap screen puts a label between the blurb and its table, so a
joined pair could only ever have worked on one of the two screens it appears
on. The version that shipped, one small card of its own, satisfies all three.

- A fix that has to fight your own gates usually is not the right fix. Twice
  is a coincidence, three times is the design telling you something.
- Write the gate before the fix is finished. Mine caught the gap in the thing
  it was written to assert, minutes after I wrote it.
- Check every place a component appears before choosing a shape for it. The
  second instance is where the elegant answer goes to die.

### 1.3e My evidence showed a state the player never sees

Aaron said the era screen still reads "pick your era" twice and "mix your
eras" never. I had shipped that fix the day before, with a before/after
screenshot pair proving it. Both of us were right. The screen has two states:
the markup as authored, and the markup after the painter runs and writes the
league name into the heading. I fixed the authored state, and I photographed
the authored state, so my own evidence agreed with me and neither of us was
looking at the game. The duplicate lived in the painted state, which is the
only state that exists for a player.

- A screenshot is not evidence that a fix works. It is evidence that a fix
  works IN THE STATE THE SCREENSHOT DEPICTS. Name that state out loud before
  putting the picture in front of anyone.
- `_show('screen')` is a debugging door, not a player. Walk the flow by
  pressing what a player presses, or you will audit a screen the game never
  puts up. This is the third distinct bug this file has recorded from that
  one habit (1.3c was the first two).
- When a person says a thing you just fixed is still broken, the useful first
  question is not "am I wrong" but "are we looking at the same state".

### 1.3f Patching a screen a filed direction says should not exist

Two days of polish on the setup screens, then he asked for the setup to be
evaluated as a whole flow. The pattern he wants was already filed, on row 12,
with a five-mechanic spec I wrote in August from a video HE sent me, parked
behind the twenty on an ordering ruling made when the question was smaller.
Nothing was lost. But I had spent two days repairing the corners, contrast
and copy of screens that row 12 replaces with a single downward flow, and
never once opened the row that says so.

- Before a polish batch on any surface, grep the tracker for that surface.
  The tracker knows what is OWED, and a filed direction outranks a filed
  defect: fixing the paint on a wall scheduled for demolition is work that
  cannot be banked.
- An ordering ruling is made against the question as it stood that day. When
  the person who made it starts asking the bigger question again, the
  ordering is stale, and surfacing that is my job, not theirs.
- The spec was in the repo the whole time, in his own words, from his own
  footage. Searching my own notes before proposing new research would have
  saved the proposal.

### 1.3g A queue answers "what is next" and never "what does this destroy"

Asked to sanity-check the order of a 189-row plan, I found three collisions
that had been sitting in plain sight for days: an audit of a surface
scheduled three rows above the rebuild of that same surface; a ruled rule
change that two rows say never reached the coach, the drills, online or
half-court, while a whole wing of coach and drill work sat queued on top of
it; and a before-the-deadline row depending on an after-the-deadline row.
Every one of those facts was in a row I had written myself.

- A priority list has one axis and it is not enough. Before a batch of work,
  read the list a second time asking only: **which rows delete or rewrite the
  surface this one touches?** That question has a different answer from "what
  is most important", and it is the one that prevents wasted work.
- Rank the shape-setters first. A row that REPLACES a surface outranks every
  row that dresses it, regardless of how small or how ready the dressing is.
- When a rule is ruled, immediately audit what still runs the old rule.
  "Ruled" and "carried everywhere" are two different states, and the gap
  between them silently invalidates everything built in it.
- A dependency that crosses a release boundary in the wrong direction (a
  before-launch row needing an after-launch row) is a filing error, not a
  scheduling detail. Grep for it deliberately; nothing surfaces it on its own.

### 1.3h He asked what to do; I sent him why the list was wrong

I found three real ordering collisions in a 189-row plan and built a board
that laid out the reasoning: three findings with evidence, a live-generated
strip of the current order, five waves, four options. His reply was four
words about it being confusing, followed by the actual question: what is your
recommended order.

The analysis was not wasted, and the findings were right. The mistake was
handing over the working-out instead of the answer. He asks me to think so
that he does not have to; a page that makes him re-do the reasoning to reach
a decision has given him the job back.

- Lead with the recommendation. The evidence goes underneath it, for the
  person who wants to check, not in front of it, for the person who has to
  decide.
- Options are for choices that are genuinely his taste. An ordering that
  follows from measurable dependencies is not taste, it is a recommendation
  with a reason, and offering it as four options pretends otherwise.
- When the answer lands in four sentences of chat and the artifact took an
  hour, the artifact was the wrong shape. Rebuild it as the answer.

### 1.3i The row said three exclusions; the code said two

Row 128 read "Method B does not carry online or half-court" and I had been
treating it as a big build for a year of Mondays. Twenty minutes with the
latch turned it into two jobs of very different sizes, and one of them was
almost done already: the wire protocol sends every staged action, so the free
half of a Method B beat replicates today, and only three verbs are missing.

- Scope from the code, not the row. A row note is a memory of a diagnosis,
  and the diagnosis was made once, in a hurry, by someone who has since
  changed the code around it.
- Look for redundant clauses in a condition before planning work for each
  one. `!half && !net && lineup===5` looked like three exclusions; the third
  is true exactly when the first is, so a third of the plan did not exist.
- When one half of a row is code and the other half is design, split the row.
  They move at different speeds and need different people to unblock them.

### 1.3j A whole test fleet, and none of it had two players

Forty checks, every one driving a single page, for a game whose launch is a
group chat playing each other online. Nothing in the suite had ever watched
an event cross the wire. The gap was invisible because each individual check
was well made, and because the harness could only express what it had always
expressed.

- Ask what your instruments CANNOT see, not just whether they pass. A fleet
  that is all green in one dimension tells you nothing about the others.
- Build the instrument before the feature it verifies, and let it report
  honestly where it stops. A harness that reaches 80% of the road, with its
  stopping point and its ruled-out suspects written into the file, is worth
  more than a note saying online is hard to test.

### 1.3k A JS click goes through a veil a thumb cannot

The two-peer harness stalled on the colours screen for an hour of debugging,
and the product was never broken. After the winner locks their colours the
game correctly veils them ("your colors are locked, they're suiting up") and
waits. My harness drives elements with element.click() from page.evaluate,
which fires the handler regardless of what overlays the element, so it kept
pressing a button no human could reach, re-sending the event, and each
duplicate rebuilt the other peer's screen mid-pick, wiping the pick.

- A synthetic click is not a tap. pointer-events, overlays and z-order are
  all invisible to element.click(); when a walker presses what a player
  presses, it must first check what a player can SEE and reach.
- In any client-server UI, "stuck" has two readings: broken, or correctly
  waiting for the other side. Teach the walker the waiting states before
  concluding anything; here one rule (a veil is a turn boundary) turned a
  stall into a clean end-to-end run.
- Tap the wire before blaming either end. Wrapping ws.send on both peers
  showed the event crossing and the duplicates piling up, which named the
  culprit in one run after DOM-poking had named three innocents.

### 1.3l The sabotage found a hole in the sabotage

online-check's dead-relay sabotage set RELAY after importing the harness,
and the harness read RELAY at import time, so the "dead" run dialled the
live relay and came back green. The sabotage convention exists precisely to
catch this: a check that cannot be made to fail proves nothing.

- Module-scope configuration is read once, at import, which is almost never
  when you meant. Read environment at call time, or take it as an argument.
- When a sabotage run comes back green, the FIRST suspect is the sabotage's
  own plumbing, and fixing it usually hardens the real path too.

### 1.3m Two perfect players make a game that never ends

The online drive's first version answered every card correctly on both
phones, because correct answers felt like the fast path through the game.
Twenty rounds of trace later the two phones were still trading answers: a
contested rim finish between two sides that never miss is a rally with no
exit, and the game was faithfully playing it out. The fix was choreography,
not correctness: the offense answers right, the defense answers wrong, so
every threat resolves toward a bucket, and the dead ball the test needs
arrives on schedule.

- A harness that plays optimally does not explore the state you need; it
  explores the state optimal play reaches. Script the OUTCOME you are
  testing for, not the strongest moves.
- Read the loop before raising the cap. The first instinct was "40 rounds is
  not enough"; the trace showed rounds 13-32 were one unresolvable exchange,
  and no cap would have fixed that.
- The meter that "locks itself after 3s, never a shank" meant the right
  drive for it was NO drive: doing nothing is sometimes the correct action,
  and the harness needed a branch that says so explicitly.

### 1.3n The mute whose reason had expired

The coach was silenced in Method B games because "the rules are in flux"
and teaching a rule that might not survive the playtest writes bad habits.
The rules stopped being in flux on 08-17 when Aaron ruled Method B the
method. The mute then sat there for eleven days, and its cost was invisible:
with online excluded by an older rule and the half-court leagues locked,
the muted set was every reachable game, so the product's whole teaching
layer was dark and nothing on any list said so.

- A guard's REASON has a lifespan; the guard does not. When a ruling lands,
  grep for every guard whose comment cites the pre-ruling state, or the
  temporary protections quietly become permanent behaviour.
- Before lifting a mute, census what it was protecting the player from. The
  count here (9 of 11 tips already true) turned a feared rewrite into a
  two-line fix, the same lesson as row 128's latch.
- Two texts sharing one seen-flag is a quiet bug: whichever fires first
  spends the other's one chance forever. Variant lessons get variant keys.

### 1.3o Three reds, and every one was the probe's own hand

The CPU setup brain went red three times before green, and the brain was
right the whole time. Pinning Math.random globally froze the game, because
the renderer rolls dice every frame and the pin starved it. The live CPU
tick raced the probe's forced calls and ended the setup mid-animation. And
a cleanup line lost in an edit left the coach on, whose watch loop froze
the game with a tip while the brain's pieces were mid-step.

- In a live system a probe is a SECOND driver on the same wheel. Turn the
  real driver off (cpu.on false), or the test measures the argument between
  the two of them.
- Never pin global randomness across an await. Pin it for the synchronous
  call under test and restore before the world runs again.
- When an animation hangs, ask who FROZE the clock before asking what is
  wrong with the animation. Wrapping the freeze door and reading the stack
  named tipShow in one run, after four runs of guessing.
- The one real fix hiding among the three probe faults: commit through the
  phase the human commits through. A predicate that answers by phase makes
  a shortcut commit into a different KIND of action, silently.

### 1.3p The gate drove an order no real code path uses

The practice offer's CPU check called show('game') and THEN startGame, so
the coach captured the right owner screen and the check passed. The real
boot (endBeat) runs startGame FIRST, show('game') after, so on a real
phone the offer captured the dying brains screen, aborted itself on the
first poll tick, and burned its once-per-phone key. Forty-three gates
green, and the feature was dead on the road players actually walk. An
adversarial refute pass caught it in one read by asking "what calls this
in production?"

- A harness that sets up state by hand must copy the PRODUCTION ORDER of
  those calls, not a convenient order. The convenient order is a mock.
- When a check passes and a skeptic disagrees, diff the check's call
  sequence against the real caller's before trusting either.
- Once-per-anything flags must be handed back when the moment they paid
  for never happened. Burn on delivery, not on attempt.

### 1.3q A freeze-aware helper starved by its own caller's freeze

typeInto skips ticks while the game is frozen so a coach card can hold a
live question mid-type. The practice run then froze the game to hold the
tip-off and asked the same helper to type its practice question: the
helper obeyed the freeze and typed nothing, while the beat's fallback
clock marched on and told the player to buzz on a blank card.

- A guard written for one caller is a contract imposed on every future
  caller. When a new caller IS the freezer, it needs an explicit bypass
  (opts.always), not a copy of the helper.
- Completion should be an event, not an estimate: the handoff now rides a
  done() callback from the typer instead of a length-times-speed guess
  that can disagree with reality.
- Fairness holes hide in accessibility settings: reduce-motion made the
  typewriter instant on one phone and 2.8s on the other, and the delta
  arbiter would have crowned the setting. Online now shows the card whole.

# Making Ball Knowledge

*What it is actually like to build a game — the planning, the rethinking, the
being wrong in public, the measuring — with an AI system as the other half of
the team.*

Started 2026-08-01, mid-build, on purpose. Aaron: *"Mannnn building a game is
ALOT OF WORK!!! A lot of thinking, planning, strategizing, testing… sheesh, but
it's fun!!!"* That sentence is the reason this file exists.

---

## What this file is, and what it is NOT

The repo already has three documents and this is a fourth thing:

| file | what it holds | who it is for |
|---|---|---|
| `BUILD.md` | every decision, dated, with the reasoning | us, later |
| `AI-LEARNINGS.md` | portable method — works on any project | Aaron's consulting |
| `CLAUDE.md` | operating rules for this repo | the AI, every session |
| **`MAKING.md`** | **the story. what it FELT like, what went wrong, what it cost** | **a stranger who wants to build something** |

BUILD.md says *what* we decided. This says *what it was like to decide it*, and
what we'd tell someone about to do the same thing.

**Rule for this file: no cleaning it up.** A making-of that only shows the wins
is worthless to the person who needs it. The errors are the content.

---

## The shape of the work (so far)

Roughly, in the order it actually happened — not the order a plan would suggest:

1. **Invent the thing.** Basketball × chess × trivia. A concept that sounds
   simple and is three games in a trenchcoat.
2. **Build a playable slice fast.** Before art, before data, before polish.
3. **Playtest and be wrong.** Repeatedly. Every round of feedback broke something
   we thought was finished.
4. **Discover the data problem.** A trivia game is a database wearing a game.
   The database was never designed; it accreted.
5. **Stop and restructure the data properly.** Tables, IDs, sources, a gate.
6. **Discover the pacing problem.** From one sentence by one playtester.
7. **Discover that the pacing problem was a geometry problem.** By measuring.
8. *(you are here)*

The honest version: **steps 4 and 7 were both "we have been building on a wrong
assumption for weeks and nobody noticed."** That is not a failure mode you avoid.
It is the job. The only question is how fast you catch it.

---

## Things that turned out to be true

### Measure before you assert
This became a written rule (`CLAUDE.md`) because it was violated so often. The
pattern: something *feels* a certain way, a confident explanation gets offered,
and the explanation is wrong in a way that sends work in the wrong direction.

Examples from a single day:
- *"The music crossfade is bad."* Traced the actual volume curve — **the fade was
  working perfectly.** The problem was musical, not technical: two unrelated songs
  overlapping is mud, and uncorrelated audio does not sum back to full volume. The
  fix was to stop overlapping at all. A confident guess would have "improved" a
  fade that was already correct.
- *"Scoring takes too long."* Counted the card gates: **11 of them, most
  two-sided, ties escalating into chains.** One bucket can cost 6–10 correct
  answers and pays 2 against a target of 11. Nobody had ever set that exchange
  rate; it emerged.
- *"5v5 feels off, maybe too many pieces."* Computed it: **five defenders produce
  45 tile-covers over a 44-tile scoring area. 102% saturation.** There is
  mathematically no open space. The "feeling" was arithmetic all along.

That last one is the best argument for the rule. A vague unease got turned into a
number, and the number explained three separate complaints as one problem.

### The bug is usually one layer below where it hurts
- Corner threes paid 2 points. The bug was not the colour of the tile; it was that
  **shot value was computed as a circle** and a real three-point line is an arc
  with the corners cut off.
- Screens felt invisible. The rule was fine — **the screened state was computed
  and never drawn.**
- The paint violation policed a diamond nobody could see, because "the paint" and
  "the layup zone" were the same number.

Pattern: *two different concepts sharing one variable.* It is the most common
structural bug in this project by a wide margin. Shot value and shot difficulty.
Paint and layup range. Question difficulty and source reliability, one letter
apart. Every time, it looked fine until someone asked a question the merged
variable could not answer.

### Write it down or lose it
Twice, work was redone because a decision existed only in a conversation.
Aaron: *"please tell me you are keeping track of all of this in the repo."* The
answer at the time was no. BUILD.md is now enormous and that is correct.

A specific save: Aaron proposed a Mario+Rabbids turn structure and called his own
idea *"wack."* It was in BUILD.md from a week earlier, logged as a toggle to be
playtested. The file remembered better than either of us.

### The plan you write from memory is a guess wearing a list's clothes
Asked for a release checklist, I produced a confident 17-item board from the
conversation and from recall. Aaron asked one question — *"is the list
exhaustive?"* — and a single `grep` for open checkboxes in BUILD.md found **18
still-open items**, seven of which were nowhere on my board. One was marked HIGH
with the note *"matters to him personally."*

Worse: I had pitched an idea as fresh that was already parked in the file a week
earlier, **with the exact risk I failed to mention already written next to it by
Aaron.** I sold him his own idea back, minus the caveat.

The rule this earns: **sweep the record before writing any plan.** Not after, not
to double-check — first. A list assembled from memory looks identical to a list
assembled from evidence, which is exactly what makes it dangerous.

### A checklist that can't tell you the answer
Built a tickable board that saved to localStorage, handed it over, and only then
realised the answers could never leave his browser. The one job of a checklist is
telling someone what was decided. Ask "how does this information get back?" while
designing the thing, not after someone has already filled it in.

Then the export itself shipped inverted: ticking meant "yes, in" for one section
and printed as "not wanted" for another. Two meanings for one gesture, in a UI
built to remove ambiguity. Same structural bug as shot-value-and-difficulty
sharing a variable — it just moved from the game into the tooling.

### The AI will confidently re-implement something that already exists
`bkid.slug` — the one function that makes name tags — was re-implemented twice
from memory and got it wrong both times, which would have created a duplicate
person. The file now opens with: *"THE ONE PLACE name tags are made. Import this;
never re-implement it."*

Generalised: **if a rule matters, put the enforcement somewhere that cannot be
talked out of it.** Instructions get drifted from under momentum. A script does
not drift. `tools/audit.py` is the part of this project that cannot be persuaded.

### The doc said "Not started" about a tool that was finished and passing tests
Aaron asked what to work on while research ran; the plan said the Tape rebuild
was next, spec ready, "Not started." Chosen, agreed, about to begin — and the
first file opened was the finished tool. The session that built it (678 lines,
its own test script, all eleven checks passing) wrote a beautiful commit
message and never went back to update the three words in BUILD.md that said
the work didn't exist. Cost if unchecked: a full rebuild of a working tool,
plus whatever bugs the second version introduced. Caught only because the rule
is to open the file before building — measure before you assert applies to
your own todo list too. The standing rule this violated already existed in
CLAUDE.md, word for word: "the commit that makes a doc stale fixes the doc."
Rules persuade; they do not enforce.

### The same brief, written twice, in the same file
The 22af research run existed twice in BUILD.md: the fifteen-question draft, and
below it the eleven-question version Aaron and I had actually locked. Both under
the same tag. Nothing was wrong with either — the draft was just a fossil that
never got cleared. But a future session greps `22af`, hits the fossil first, and
runs a research sweep on questions that were deliberately cut, believing the
brief was never agreed. That is the *exact* failure this project has already
recorded twice under 22u: building from the wrong artifact without opening the
right one. It does not need a mistake to happen. It just needs two versions and
a grep. The rule earns its keep here: **superseded text gets deleted, not stacked
under.** Merging the two took four minutes; the sweep it would have wasted would
have taken a day.

The near-miss inside the near-miss: my first instinct was to *delete* the draft
outright. The draft held the reasoning for the whole run — the 102% saturation
finding that justified it, Aaron's own words, and the note that I had missed the
entire tabletop-sports lineage on the first pass. Deleting the stale thing is
right; deleting the reasoning attached to it is not. Merge, do not bulldoze.

### The skill that was the wrong shape, and nearly ran anyway
Asked to "run 22af", the obvious move was the `research-brief` skill — the one
whose whole job is writing research briefs. It would have been wrong. That skill
is built for FACT runs: it bakes in the source tiers, confidence ratings, unique
slug ids and JSON schema that guard the question bank. 22af studies other games.
Nothing it returns ever touches the bank. Running the fact standard over a design
run would have produced a brief demanding the wrong shape of answer, and it would
have looked entirely correct while doing it.

The interesting part is what the new skill should actually contain. The instinct
is that the valuable half is writing the prompt. It is not — a decent prompt can
be written from scratch any time. The half that needs to be written down is the
INTAKE: what happens to the research when it comes back. That is where a design
run rots, because "this is interesting, keep it" is the path of least resistance
and there is no script that fails when you take it. So the skill leads with a
kill pass: any finding not tied to a live decision is deleted, and the kill rate
gets reported. A filter that never rejects anything is not a filter.

### The research run that graded itself F, and why that was the win
The first comparative research run (22af) went out with eleven questions on a
harness built to split any request into exactly five search angles. Aaron asked,
mid-run, whether it should have been split into smaller groups. The honest
answer at that moment was "I can't know yet" — so instead of predicting, the
pass/fail criteria and the decision rule went into the skill file BEFORE the
results came back. That ordering was the whole trick: once findings arrive,
everything reads like coverage.

The run came back and failed its own exam: seven of eleven questions returned
zero surviving claims, and by the pre-registered rule that verdict was already
written — no negotiating with it after the fact. Aaron's instinct was right,
and better than right: the fix wasn't halves, it was groups of three or four,
with the moat question getting a run all to itself, because a negative result
("nobody has built this") is only worth something when the search behind it is
documented and undivided.

The other half of the story: what DID come back was better than expected —
Blood Bowl, of all things, turned out to have solved the exact three problems
the board arithmetic had just measured (coverage, idle pieces, possession
length) with one elegant mechanism, priced risk instead of blocked movement.
Four questions properly answered beat eleven thinly gestured at. The run also
got stopped once for a stall, resumed from cache, and briefly run on the wrong
model — none of which was visible in the final report, which is exactly why the
journal, not the report, is what got audited.

### The moat was real, and then it wasn't, and that was the good outcome
Three research runs built toward one question Aaron cared about more than any
other: has anyone else fused trivia with position? Run one found a near-miss
and was honest that its search was too shallow to say "nobody". Run C was
built to settle it — one question, six named search lanes, a mandatory scope
table, ~4.5 million tokens.

It refuted the claim. **Quiz Tonosama no Yabou**, Capcom, Japanese arcades,
1991: you choose which of 38 provinces to attack and the province you pick
sets how many correct answers you need to take it. Chosen position, stakes set
by position — the exact fusion. It was the 4th-biggest arcade game of its year.
Nobody has repeated it in 35 years, and nobody has done it on a tile grid, in
sports, for two players — so a narrower moat survives, and the narrow one is
worth more because it can actually be defended. But the sentence Aaron wanted
to say in public was false, and he now knows before saying it rather than
after.

Two things about that are worth keeping. First: **the run was built to be
capable of refuting its own sponsor's hope, and it did.** The value of research
isn't the answers it confirms. Second: the report named the two lanes it FAILED
to cover — sports+trivia hybrids, and the board-game taxonomy — and flagged
that those are precisely where a competitor would hide. A less honest report
would have called six lanes "searched" and let the negative stand.

### The fabrication that pointed at the answer we wanted
Buried in the same run: an automated summary of an academic paper invented two
sentences wholesale — that players "attack specific skeletal body parts
positioned to represent division problems" and that "the spatial arrangement of
skeleton anatomy encodes mathematical relationships." Neither exists in the
paper. Both, if true, would have made that game a category-(i) hit — evidence
FOR the thing the run was hunting. The adversarial checkers killed it 0-3.

That is the failure mode worth fearing most, and it is not laziness: it is
plausible, well-formed, subject-appropriate text that happens to be invented,
and it drifted toward what the questioner wanted. The only reason it died is
that a separate pass was paid to attack it. Summaries of sources are not
sources.

### A source tried to hijack the research
Also that run: a retro-gaming wiki served the fetching agent a prompt-injection
payload — text posing as instructions, telling it to delete and rearrange
files. It was refused, the domain yielded nothing, no repo file was touched.
Worth writing down anyway, because it is the first time this project met a page
that was actively hostile rather than merely wrong, and it will not be the last.
Anything an agent fetches is untrusted input, including the parts that look
like orders.

### "Lazy design is completely against my rules"
The heat mechanic shipped mechanically perfect — twelve passing checks, netcode
safe, every rule from the research — and visually dead: four tiny pips beside
the score and a sentence in a banner for the biggest moment the game has. Aaron
called all four failures in one message: pips instead of a filling bar, text
instead of a slam, nothing on the players, and a test screenshot that showed
the moment firing over the main menu. The bitter part: his own rule ("show the
stats winning — the numbers POP, they don't sit in a status line") was already
in the idea bank, quoted by me, days earlier. The AI treats juice as optional
polish; for a game it IS the product. The rebuild — a bar that gets more on
fire per quarter filled, an ON FIRE slam with a screen shake, a super-saiyan
aura on the ball-handler — took under an hour, which proves the first version
wasn't a budget decision. It was a taste failure.

### Jargon is a failure, not a shortcut
Repeatedly flagged: *"you fell back into jargon again"*, and later *"how do you do
it? what is a gate? what does bites mean?"* The habit hides thinking rather than
conveying it. Plain language is harder to write and it is the only way the person
you are working with can actually check you.

It happened AGAIN on 08-02, hours after the rule above was already in this file:
the first research-findings page shipped full of "binary adjacency gating," "3-0
votes," and "pre-registered criteria," and assumed the reader knew what Blood
Bowl was. Aaron: *"talk about jargon and confusing."* The rewrite cost a full
page; writing it plainly the first time would have cost nothing. The pattern to
notice: jargon creeps back hardest in work the AI finds impressive — the more
proud it is of the analysis, the more it writes for itself instead of the reader.
The fix that stuck: every finding forced through four plain headings — what we
learned / why it matters to your game / your move / how solid — so there is
nowhere for undefined terms to hide.

---

### The floor is orange (08-02)

The ball trail needed a test, and a test needs a number. The obvious one:
count the orange pixels behind the ball, expect lots when the team is ON FIRE
and none when it isn't. The lit case passed. The cold case *also* passed —
2,473 orange pixels behind a ball that wasn't burning at all.

The floor is orange hardwood. The check was measuring the court.

What makes this worth writing down is that the number was never wrong; the
question was. "Is there fire here" had been quietly translated into "is there
orange here," which is a different question with a different answer, and it
sailed through because the lit case confirmed it. A confirming result on a
badly-posed test is the most expensive kind of green there is — it buys
confidence and delivers nothing.

The fix was to go and *look* at what actually separates flame from floor
rather than reason about it: dump the luminance in the same box both ways.
Fire is additive, so fire is what's BRIGHT. Above luminance 200: 571 pixels
lit, 0 cold. The threshold got written into the check with the measurement
next to it, so the next person to touch it knows it was measured and not
picked.

The same session produced a smaller version of the same shape. The trail
probe reported zero fire, and the tempting conclusion was that the trail was
broken. It wasn't — the probe had never navigated to the game screen, so the
canvas was still 300×150, its untouched default. Two failures in a row where
the code was fine and the instrument was lying. That is roughly the ratio to
expect once you start measuring things: a decent share of red is the ruler.

### Grey everything, including the payoff (08-02)

The Daily 5 stamp greys out when you've played it, with a green tick — cross
the day off. First build: `filter: grayscale(1)` on the whole button. Which
greyed the tick too, because the tick is inside the button.

Technically correct, and it deletes the only satisfying part. The one element
that should survive the greying is the one you actually want to look at. The
fix is one line — grey the face, not the frame — but the instinct to notice
it only comes from looking at the render, not the rule. "Everything greys
out" was a faithful reading of what was asked for and the wrong build.

---

### The rebuild that came back thinner (08-03)

The tables are the source of truth; the game's data files are generated from
them. I'd added a new column and wanted to check it survived a rebuild, so I ran
the rebuild.

It came back with four fewer columns than it went in with.

`leagues.json` lost `tagline`, `genders`, `slam` and `colour_hi` — all added by
hand at some point after the rebuild script was last touched. The script only
knows the columns it was written to emit. Everything else it simply doesn't
write, and "doesn't write" looks exactly like "was never there." Two other tools
started throwing errors on a missing key, which is the only reason I noticed at
all. **Row counts were identical the whole time.** 22,762 rows in, 22,762 rows
out. If I'd checked the number of rows — the obvious check — I'd have declared
it fine.

Restored from git in one command, which is the only part of this that went well.
The script now opens with a warning in its first line naming the incident, and
the rule that came out of it: if you need to change one table, write one table.

The uncomfortable bit is the shape of the mistake. I ran a destructive operation
to verify that a change was safe. The verification was the damage.

### "Should the number have dropped?" (08-03)

Aaron asked the best question of the day and he asked it as a beginner, which is
what made it good: *"should the good questions have dropped when the trusted
label broke?"*

I had broken 423 stored labels to prove a check worked. Nothing moved. I'd
written that off as "correct — the labels are just a cached copy." Which was
true, and complete rubbish as a stopping point, because I hadn't asked the next
question: *then where does a human put a decision?*

The answer was nowhere. Any trust rating typed in by hand would be silently
overwritten on the next run. The column looked exactly like a place to record a
judgement and was in fact a place judgements went to die. I'd built that without
noticing, and I'd have kept not noticing if he hadn't been confused enough to
ask.

Two things I'd like to remember from it. The first is a real principle: derived
data and decisions cannot share a column, because one is meant to be regenerated
and the other must never be. The second is about how it surfaced. He wasn't
checking my work — he genuinely didn't follow, and following the confusion led
straight to a design hole. Several times now the useful question has come from
him not understanding something, rather than from either of us reviewing
anything.

### Nine commits, zero learnings (08-03)

Aaron: *"are you tracking all of the learnings... I thought we spoke about these
sorts of things going in AI Learnings and making.md and I thought there were
skills that did this regularly."*

I checked instead of answering. Nine commits that day. **Not one touched
AI-LEARNINGS.md or MAKING.md** — including the two entries directly above this
one, which are among the more useful things the project has turned up.

He also remembered skills that did this automatically. There are none. What
exists is a hook that fires only before the conversation gets summarised, and a
line in CLAUDE.md asking nicely for learnings to be written down in the same
turn they happen.

CLAUDE.md, on its own reliability: *"instructions alone did NOT prevent the
repeat... the durable fix is turning a claim into a command — because scripts
run and reminders don't."*

So the rule that was supposed to capture the lessons is itself the kind of rule
the document already predicted would fail. It failed exactly as described, for
nine commits, and was caught by the human rather than by any mechanism. The
learnings above exist because he asked, not because anything worked.

### The stricter rule that made everything better (08-04)

Aaron had been circling something for a day without quite naming it. He kept
asking where a quality rating should live — on the question? the fact? the
source? — and then, almost in passing, he said the thing that turned out to be
the whole answer: *"does tier two go on both sources?"*

Underneath the question was an observation nobody had written down. A website is
not one thing. Basketball-Reference's page for Michael Jordan is a record of
fact. Basketball-Reference's blog is a guy with opinions. Same site, same domain,
same little padlock in the address bar, completely different standing as
evidence. We had already proved this twice by accident — an official BIG3 page
that turned out to be a guest post by an NFT enthusiast writing as "DOOMbot", an
Olympics.com page about the Lithuanian team's Grateful Dead kit — and had
patched around it both times without noticing it was one problem, not two.

So: a source register. Fourteen sites, the ones actually carrying the bank, each
broken into sections with its own rating and a note saying what that section IS
and how to cite from it. Strictly more demanding than judging a whole website at
once. It can only take things away.

The number of facts good enough to ship went **up**. 216 to 226.

The honest thing to record is how comfortable that felt for a second. There was a
ready-made explanation sitting right there — *the finer-grained rules must be
recognising good pages the blunt version missed* — and it is not even a stupid
explanation. It is the kind of sentence that gets written into a summary,
believed by everyone including the person who wrote it, and never checked again.

It was wrong. The rules matched section names as plain text anywhere in the
address, so the rule for `/history` was firing inside the *headline* of a news
story:

    nba.com/news/history-3-pointer-evolution-larry-bird-stephen-curry

The word "history" in a headline about the three-point line, and a tie-breaker
that preferred the longest match, and a news feature was now an official record
of fact. Ten facts got promoted because of a word in a headline.

What caught it was not cleverness. It was one sentence, asked before looking at
the output: *this change can only remove things, so the number can only go down.*
When the number went up instead, there was nothing to debate. The arithmetic was
describing a bug and no story could outrank it.

Then the same run produced the opposite mistake, which is somehow funnier. Sites
in the new carefully-researched register were being judged **more leniently** than
sites that weren't in it. The register trusted its own list and skipped the crude
"does this look like a news article" check that the general path still ran — so
`nba.com/article/2017/09/11/morning-tip-...` sailed through as an official record
purely because the register happened to have no rule for `/article`. Being on the
vetted list made you *safer from vetting*.

Cost of getting it right, in the only currency that matters here: 216 shippable
facts before, 213 after. Three facts. A day of work to remove three facts, and it
is unambiguously the best trade in the project, because the alternative was a
system that quietly promoted news articles to evidence and reported the increase
as progress.

One more bit, because it is the part that will matter in six months. The fix got
pinned to twelve real URLs whose correct rating was set by *opening the page*,
and that test now runs on every data change. Breaking the anchoring fails it.
Deleting the register stops the run with an explanation instead of silently
downgrading 1,408 rows. And when the backstop was deleted to check that the test
would notice — it didn't. Eleven of eleven still passed, because the one case
meant to exercise the backstop was passing off a different rule entirely. The
test for the guard had to be built separately, and marked in the file as
synthetic, because **zero** rows in the bank exercise it today.

A test you have not tried to break is a test you have not written.

### The comment that promised something the code never did (08-04)

The Daily Five shows you nothing when you get a card wrong. Your answer goes red;
the other three sit there saying nothing. That was Aaron's ruling and the comment
in the code explained why:

> *the card comes back in a future daily until you beat it, and being told kills
> the reason to remember it*

It is a good rule with a good reason, and I had written that comment myself. While
putting together a plain-English write-up so Aaron could decide whether to ship, I
went looking for where a missed card gets remembered.

Nothing remembers it. The ten cards come from the date and nothing else. The game
stores two things: which day you played, and your score. There is no list of what
you got wrong, no per-player anything. A card you missed comes back exactly as
often as it comes back for someone who aced it — which is to say, by luck.

So the rule shipped and the reason did not. As built, a player can miss a question
and never find out the answer. That might still be the right game — "go and look it
up" is the entire spirit of the thing — but it was never chosen. It was inherited
from a sentence that described an intention as though it were a mechanism.

The uncomfortable part is that the comment was **more convincing than the code**.
Anyone reading that file — including me, twice — would come away believing the
feature existed. Documentation that describes what you meant to build is worse
than no documentation, because it stops the next person looking.

The same afternoon produced two smaller versions of the same disease. A test
asserting the calendar "sits just left of the title" had only ever run at desktop
size; on a phone it stacks above the title instead, and had done since the day it
shipped. And a screenshot of a perfect ten showed the shareable receipt rendering
five hollow outlines where five shields should be — a symbol Unicode treats as
text unless you ask it not to — so the best possible score would have gone into
twenty group chats looking like a zero.

Three defects, all found by making pictures of the thing and looking at them,
none by any of the fifty-three automatic checks that were passing the whole time.
The checks are still worth having. They just cannot tell you that the thing you
described is not the thing you built.

### Green meant two opposite things, one tap apart (08-04)

The streak calendar took an afternoon and I was pleased with it. Aaron had asked
for three marks — a green check for a day you went back and caught up, a gold
star for one you played on the day, a gold crown for a perfect eleven — and the
careful part was making sure the crown and the star, both gold, could be told
apart by shape, because at fourteen pixels gold is gold. That is the mistake this
project already made once, when red meant "worth 3 points" on one screen and
"hard" on every card.

Then Aaron asked a question that took four words to type and about a minute to
answer: *does the right stamp show up on the main menu?*

The menu stamp is a tear-off calendar page, and when you finish the day it takes
a green tick. It had done that since the day it was built, weeks before the word
"green" meant anything in particular. It still did. So a player who finished
today's rack was being shown, on the very first screen of the game, the mark that
now meant **you missed this and came back later**.

I had spent the afternoon being careful about gold against gold and never once
looked at what green already meant somewhere else. The vocabulary was new; the
screens using it were not.

The fix took twenty minutes and both surfaces now call the same function for the
mark and for the shape, so they cannot drift again. The lesson is cheaper than
the fix: **defining a term is a migration, not a definition.** The moment you
decide a colour means something, the next thing you do is find everywhere that
colour is already used.

Two smaller things fell out of it, and both are the kind of detail that only
shows up when you actually look at the picture. The crown came out solid black
the first time — the shared shapes paint with `currentColor`, so setting `fill`
on the parent element loses to the path's own attribute, and the stamp's dark
text colour won. And a solid crown at the tick's size is enormous; it needed to
run smaller to carry the same visual weight as a thin green stroke.

Then the sabotage test failed to fail. To prove the two screens really did share
one shape, I gave the stamp its own hand-written crown and expected the check to
scream. It passed. The check was comparing the shared function to itself and had
never once looked at what the stamp rendered. Third time this session I have
tested the ingredient instead of the thing.

### "Why do I keep finding these bugs?" (08-04)

Six bugs in a day, every one of them surfaced by Aaron asking something casual.
Is the daily really NBA only. Does the right stamp show up. Is there a timer.
Can't a card have two tags. What is the streak button. By the evening he had had
enough:

> *"Why do I keep finding these bugs and bad data through random questions? What
> is going on? Why is this stuff wrong over and over again... I feel like we will
> never get done."*

The tempting answer is reassurance. The true answer is more useful and worse.

He was not finding them at random. He was finding them because he was the only
one looking from outside. Every check in the repo was written by the same process
that wrote the code, which means every check encodes the same assumptions. One of
them asserted that a card counted as in-scope if it was tagged `nba`, `wnba` or
`any` — and passed happily for weeks, because the filter it was testing believed
exactly the same wrong thing. A test cannot catch a belief it shares. It can only
catch a slip.

Then I counted coverage, which was the part I did not expect. The Daily Five —
the thing he had been interrogating all day — had 99 automatic checks. The entire
rest of the game had about 68, spread across twenty-one screens, seventeen of
which had none at all.

So the Daily Five was not the buggy part of the game. It was the *observed* part.
Every question he asked bought a check, and the checks accumulated exactly where
his attention had been. The other seventeen screens were not cleaner. Nobody had
ever looked.

I wrote a smoke test that afternoon — a deliberately stupid one, which opens every
screen at desktop and phone size and complains about anything obviously wrong:
errors, empty screens, sideways scroll, the word "undefined" rendered on screen,
buttons too small to hit. It found real problems on eight screens on its first
run. None of them were subtle. They had just never been in front of anyone.

The tool then produced two bugs of its own, which felt about right for the day. It
called the title screen "0px tall" because it measured mid-transition, and its
tap-target check went wrong in both directions before it settled — first blind to
the fix, then flagging every button that merely had a neighbour. I ended up
choosing the dumbest possible version and ratcheting the number so it can only
improve, which is less satisfying than a clever check and considerably more
likely to still be working in a month.

The thing worth remembering: **the answer to "why do I keep finding bugs" was
never about the bugs.** It was that one person was doing all the looking, and the
fix is not to look harder at the same place.

### "What does this even mean" (08-04)

At the end of the longest day of the project, having just explained at length why
he kept finding bugs, I wrote this sentence:

> *"There are ~21 screens. 17 have no direct harness at all."*

Aaron's reply: **"What does this even mean:"**

Every word of it is true. It also communicates nothing to the person paying for
the work. "Harness" is jargon for a test script. The plain version — *the game has
about 21 screens, and 17 of them have no automatic test watching them, so if one
broke tomorrow nothing would notice* — is longer, duller to write, and the only
version he can actually check me on.

He has asked for plain English at least three times on this project. Each time it
got fixed and each time it came back. What makes this one worth writing down is
WHERE it came back: in the middle of an explanation I was rather pleased with,
about a measurement I thought was insightful. That is the pattern. **Jargon
returns hardest in the work the machine is proudest of** — plain prose feels like
a downgrade of clever analysis, so the clever analysis is exactly where it stops
being written for the reader.

In the same message he wrote the paragraph that is probably the most useful thing
anyone has written in this repo:

> *"Next time I will build cleanly from the start, designing skills and workflows
> to make sure we are auditing and recording everything as we build, if there is
> data that is referenced in multiple places and needs to be stored then build a
> database. We have to think deeply about these things."*

He is right, and the evidence is the entire day behind him. Every mechanism this
project now has — the audit script, the learnings check, the open-items harvest,
the smoke test — exists because its absence had already cost something. Not one
of them was designed in advance. They are all scar tissue.

And a retrofit is never as good as the original. The tables went in weeks late,
and even now half the game still reads only the first value out of a list that
can hold several — because fixing the storage was treated as the job, when the
storage was only half of it. Every place that READS the data was the other half,
and that half is still open.

---

## The feature he asked me to build twice

Aaron sat with The Tape — the browser that shows every table behind the game —
and came back with six notes. The first one was *"can we have a sort by
feature?"*

Sorting had shipped a week earlier. Click a column heading and it sorts. There is
even a little arrow.

My honest first instinct was to say so. It would have been true, it would have
taken one sentence, and it would have been one of the worse things I could have
done. He did not ask whether the code contains a sort. He used the thing for an
hour and never found it. **That is a better bug report than "sorting is
missing", because a missing feature costs you a build and an invisible one costs
you the build you already paid for.**

What is uncomfortable is that I would have been *right*. There is a particular
kind of unhelpfulness available only to someone with the facts on their side, and
an AI is unusually well equipped for it. The correction is a small rule with a
lot of range: when someone asks for something that exists, they are telling you
where they looked. Put it there.

Where it went, in the end, was not a label. The Tape already narrates itself —
every click writes the query in a box, so you learn the words for free without
being taught them. So the sort now writes itself into that same box: click the
heading, and `sort ppg desc` appears in the line you were already reading. It
cost about four lines. The surface that was already explaining things was the
cheapest place in the whole product to explain one more.

The rest of the notes were straightforward — hide columns, put a real example in
the empty query box, make SQL work, build a walkthrough. He also asked *"what
decides what goes under Things, Links or Detail?"*, which had a perfectly good
answer in `TABLES.md`, and a perfectly good answer in a document is not an
answer. It is now a grey line of text under each heading, on screen, where the
question gets asked.

### Then I built a tour of an empty room

The walkthrough is nine steps, each one lighting up the control it is talking
about. I wrote fifty-one automatic checks for it, which by this project's
standards is thorough: every step walked, every highlight verified to be sitting
on something really on screen, the copy scanned for jargon, the tour confirmed to
remember itself and to replay on demand.

All fifty-one passed.

Then I looked at the screenshot, and the tour was running on the blank landing
page. Six of the nine steps were pointing at furniture that did not exist —
*"click a column name to sort"*, with an orange ring around an empty panel and
the words "Pick a table on the left" in the middle of it.

Every assertion was true. The check asked whether the highlight was on a visible
element, and the empty panel **is** a visible element. Nothing lied. The tests
were answering a question that was slightly beside the point, and there is no
amount of care in writing them that fixes that, because the flaw was in the
question and not the answer.

This is the sharpest version of a thing this project keeps re-learning:
**automated checks can confirm that something happened. They cannot confirm that
it made sense.** Sense costs one screenshot, and I nearly did not take it,
because fifty-one green lines look so much like being finished.

The repair was two repairs, which is the part worth remembering. The tour now
loads an example before it starts. And the harness gained a check it did not have
— *"and loads an example first, so the steps point at something real"* — which
counts rows and cells on the screen. Fixing only the feature would have left the
suite exactly as blind as it was, and the next blank room would have passed too.

### And a footnote about honesty in comparisons

There is a standing rule here that any visual change ships next to a picture of
what it replaced. Building that page, I shot the "before" from a backup file I
had copied earlier in the session — and the backup was mid-flight. Two of the
improvements were already in it. The comparison quietly flattered nothing and
understated everything, and showed Aaron a "before" that had never existed
anywhere in the world.

I caught it by looking at the shot and seeing a button that was supposed to be
new. The rule that came out of it is embarrassingly obvious in hindsight: the
baseline comes out of git, never out of a file you saved yourself. A backup is a
snapshot of your own work in progress. The only honest before is the one the
other person could go and look at right now.

---

## The day the tool kept lying about the sources

The verification pass is the least glamorous work in this project and probably
the most important: 829 questions whose answers had never once been checked
against the page they cite. The method is dull on purpose. Fetch the page. Put
the claim next to it. Read.

What I did not expect is that the hard part would not be the facts. It would be
the reader.

It broke five times in a day, and every break was the same shape: **the evidence
was sitting on the page and the tool could not see it.**

A curly apostrophe, first. The WNBA writes *Women's* with the typographer's
quote; our data has the straight one. The search found nothing, and printed —
in capitals, because I had made the message emphatic — *NO LINE ON THIS PAGE
MENTIONS ANY OF IT — SUSPECT THE SOURCE*. A perfectly good citation, accused.

Then an accented name. Basketball-Reference spells him **Dončić**; the question
says Doncic. One row on the 2018 draft page settles that card, and the search
walked straight past it.

Then the worst one. Two cards cited a Diana Taurasi page whose URL had a typo —
one extra letter, `taurasdi01w` for `tauradi01w`. Basketball-Reference answers a
dead player id with a **91 kilobyte page at HTTP status 200** whose title is
"Page Not Found". My fetcher checked only that the response was longer than 500
bytes. So it cached an apology and then searched it for evidence, and would have
gone on doing that forever, because the only thing that gave it away was noticing
that Diana Taurasi's name did not appear anywhere on Diana Taurasi's page.

Then a whole article hidden inside a `<script>` tag, because nba.com's team pages
are a React app and the prose lives in a JSON blob. My reader stripped scripts as
noise. The Nate Thurmond page came back as a single line — its own title — while
the word "Thurmond" was in the raw bytes seventy-five times.

Five bugs, one lesson, and it is not "write better regexes". It is that **a
verification tool's false NEGATIVE is its most dangerous output**. A false
positive survives a careful reader: you look at the evidence and reject it. A
false negative never gets looked at. It closes the question before anyone opens
the page, and it does it while sounding certain — pointing, in every one of
these cases, at the wrong culprit. The message said "suspect the source." The
source was fine every single time.

The cheap check I did not have, and now do: when the tool says nothing was
found, count the raw substring in the untouched bytes. Seventy-five against zero
is not a subtle signal. That one command would have caught three of the five
immediately.

### Counting what nobody wrote down

The other surprise was more cheerful. Roughly a fifth of the claims could not be
read anywhere, and were settled by counting instead.

The 1971-72 Lakers won 33 straight. Their roster page does not say so. Their
*game log* does: 97 games, 81-16, and the longest unbroken run of W results is
exactly 33. The Celtics' eighteenth championship is not a sentence anywhere on
their franchise page — it is the eighteenth row ending "Won Finals". Stockton
and Malone's eighteen years together are two career tables with eighteen seasons
in common. Manute Bol finished with more blocks than points: 2,086 against 1,599,
two numbers that never appear in the same sentence.

**A source that does not state your claim may still contain it.** I had been
treating "the page doesn't say it" as the end of the road, and it is usually
just the end of the prose.

With one hard limit, learned the same afternoon. I tried to derive the date
LeBron passed Kareem by summing his career points and walking the season's game
log. The parse came back with 34,811 where the truth is 37,062 — it had grabbed
the wrong rows, and it had done so silently. I dropped it and left the card
unverified rather than ship a number I could not re-check. A wrong derivation is
worse than a missing one, because it arrives wearing the costume of arithmetic.

That card is still unverified. It is one of three, out of a hundred and forty
eight, and I would rather Aaron sees three honest gaps than a hundred and fifty
one confident ticks.

---

## An hour lost to 1,753 bytes

The next day's job was simple: keep checking cards against their sources. Then
ESPN stopped answering.

Not stopped exactly. Every request came back HTTP 202 with about two kilobytes
of JavaScript — a bot wall that wants to watch a browser solve a puzzle before
it hands over an article. There is no header you can send that beats that. And
ESPN was forty-five of the hundred and eleven cards left to check. Forty per
cent of the remaining work, behind one door.

Fine: there is a headless Chromium already installed in this environment, for
taking screenshots. Point it at ESPN, let it solve the puzzle, save what the
page becomes. Twenty lines.

Then every page failed with ERR_CONNECTION_RESET, which reads exactly like ESPN
blocking harder. I spent a while on that theory — user agents, feature flags,
disabling Chrome's newer TLS behaviour, a second attempt at the same idea with
different flag names. All of it wrong, and none of it cheap.

What ended it was the smallest possible test. I asked the browser to load
`example.com`. It failed too. Whatever this was, it had nothing to do with
ESPN, and one request had established that. I should have run it first.

The actual cause took a logging relay to see: this environment routes HTTPS
through a proxy, and the proxy accepted the browser's tunnel request, received
1,753 bytes of TLS handshake, and hung up without a word back. Chrome now sends
a post-quantum key exchange in its opening message, which pushes it past a
single network packet; curl's opening message is about four hundred bytes and
had sailed through all week. Cap the browser at the older TLS version, the
handshake shrinks, everything works. ESPN's wall fell over in one try.

Two things about that hour are worth keeping.

The first is that the wrong layer announces itself confidently. A site was
blocking me; then a *different* thing broke, and the story I already had in my
head absorbed it. The fix was not cleverness, it was a control — load a page
that cannot possibly be blocked and see what happens.

The second is uglier. There is another way to make ERR_CONNECTION_RESET go
away, and it is one line: tell the browser to stop verifying certificates. It
would have "worked." It was available the whole time. Under an hour of pressure
with a real deadline on the other side, that is exactly the fix a tired person
takes — and then a scraping tool that silently trusts anything is sitting in the
repo forever, and nobody who reads it later knows it was a shortcut rather than
a decision. The comment in that file now says, in as many words, that turning
verification off would also have fixed this and would have been wrong.

Certificate checking stayed on. It works fine on TLS 1.2.

---

## What surprised us

- **How much of a game is not the game.** Data structure, licensing, audio
  handoffs, colour meaning, where a number lives. The rules were the fun part and
  the small part.
- **How far one sentence of playtest feedback travels.** *"I have never actually
  finished a game to 11"* → card-gate count → exchange rate → board saturation →
  a rule change to defender adjacency. One person, one sentence, days of work.
- **How often the fix was to SEPARATE two things**, not to add anything.
- **That colour is a language you can accidentally contradict.** Red meaning
  "worth 3" on the floor while red meant "hard" on the card. The game had already
  settled the argument; the new code just did not know.

---

## Open questions this book should eventually answer

- Does an AI collaborator make you faster, or just make being wrong cheaper?
  (Current suspicion: the second one, and that the second one is worth more.)
- How do you keep taste when the other half of the team has none by default?
- What is the right amount of process for a project with one human on it?
- When is measuring the answer, and when is it procrastination?

---

## Chapters this wants to become

1. The idea, and why "simple" concepts are never simple
2. Build the slice before you build the world
3. Playtesting: how to hear what people actually mean
4. Your game is a database wearing a costume
5. The day the geometry was wrong
6. Working with an AI: what it is good at, what it will lie to you about
7. Rules that enforce themselves
8. Art, licensing, and the things you cannot code your way out of
9. Pacing is an exchange rate
10. Shipping, and knowing when a thing is done

## Six went in, five came out

*2026-08-06*

The verified-pack gate is a switch that makes the game deal only cards somebody
has actually checked. It needs 25 proven cards in each league-and-difficulty
pool, and it had been stuck for days. The obvious job was "go check more cards".

That was the wrong job. Thirty-three cards had already been read, were correct,
and still would not ship — because the gate does not want a tick saying somebody
looked, it wants a source of a certain quality, and one decent news article is
not enough. Nobody had read the pass condition closely. An afternoon of
attaching Basketball-Reference pages did more than a week of reading would have.

Then the interesting bit. Eleven cards went in. Six of them belonged to the same
pool, and that pool went up by five.

Five is not a suspicious number. It is exactly the size of gap you shrug at —
a cache, a rounding, probably fine, and the summary writes itself as "eleven
cards verified, good progress". This project has reported progress that was not
there twice already, both times because a number was accepted instead of
chased. So: one query.

Gregg Popovich. His card is flagged `goes_stale`, because "winningest coach in
NBA history" and "29 seasons" are both things that can stop being true. Fair
enough. What the flag actually does is exclude the card **permanently** — the
code never looks at how recently it was checked. And the reason it prints, in
plain English, to whoever runs the tool, is:

> can go stale — needs a refresh pass

A refresh had just happened. It changed nothing. It could never change anything.
Forty-one cards are sitting in that state, wearing a label that promises they
are one pass away from shipping.

Nobody wrote that to deceive. Somebody wrote a sensible exclusion and a sensible
string, on different days, and never stood where the reader stands. That is most
misleading software.

The other thing this day taught, and it cost three fetches to learn: a search
result is not evidence. Looking for a page proving the US women won gold in
Paris, the official Olympics results URL came back two thousand seven hundred
and ninety characters of real content, correctly titled, listing "Women's Gold
Medal Game | France v USA".

It was a video index. Highlights and replays. It never says who won.

Every keyword check passes on that page. "Olympics" yes, "basketball" yes,
"gold medal game" yes, "USA" yes. A tool that confirms facts by matching strings
would have marked it verified and moved on, and the card would have been right
by luck rather than by proof. There is already a list in this repo of pages that
arrive looking like successes — bot walls, framework shells, duplicate
not-found pages, 404s served at HTTP 200. This is a fifth kind, and the worst
of them, because it is a real page about exactly the right subject with the
answer simply absent.

The card stays unverified. That is the correct outcome and it still feels like
losing.

## The day the gate closed, and the test that lied about it

*2026-08-06*

The verified-only switch had been sitting off since the 4th. Not from caution —
from arithmetic. Twenty-three cards survived it. Five pools were empty outright.
A game to eleven cannot be dealt from twenty-three cards.

Today it went to 331 and every pool cleared, so the switch flipped. From now on
the game only asks questions somebody has personally read against a source.

Before flipping it I checked the one thing the tooling does not cover. The
report that says "no pool is thin" counts league against difficulty. It has
never looked at *era*, and the game lets you pick a decade. Pool of 331, filtered
by decade, could easily be nothing. It turned out to be fine, for a reason that
is pure luck rather than design: cards with no era tag pass every era filter, and
there are enough of those at every difficulty to act as a floor.

Then I wrote a test to prove the flip was safe, and the test was wrong twice.

The first version failed thirteen times. The game's own comment describes card
zero as "the final fallback and the ONE crack in the gate", so I asserted that
receiving card zero meant the picker had fallen through everything. Thirteen
failures, every single one at difficulty tier 1. That uniformity is what saved
it — real bugs are rarely that tidy. Card zero is `{t:1, l:"any"}`: tier one,
league-neutral, no era tag, verified. It is one of the most drawable cards in
the entire bank. Getting it once or twice in twelve draws is the arithmetic
working perfectly.

I had built a test that punished the game for behaving correctly, on the
strength of a comment I read too literally.

The second version was worse, and it passed. Its sabotage step overwrote a
global to mark every card unverified, then checked the game noticed. Green tick.
Except the global does not exist — the game never puts that map on the window —
so the sabotage rewrote nothing at all and the assertion sailed past an
untouched system. A test that cannot fail, reporting success, about the safety
of a change going to the live site.

That is the third time in this project a check has been caught measuring
correctly and biting nothing. The pattern is always the same: the check is
written, it goes green, and green is taken as evidence. Nobody asks the second
question — *would this have gone red if the thing were broken?*

The fix is embarrassingly small. Make the sabotage two-sided. Do not only prove
"with the guard on, nothing bad gets through". Also prove "with the guard off,
something bad does". The final version reports both numbers in one line:

    gate off: 195 unverified dealt  ·  gate on: 0

Two numbers, and the first one is the one that matters. Without it, the zero
means nothing at all.

---

*Entries get added as things happen, not reconstructed afterwards. Reconstructed
build stories are always too tidy, and the tidiness is exactly what makes them
useless.*


## The grey box, and the phone I did not own

Aaron sent a screenshot of the coming-soon page taken on his phone. In the
middle of it, beside the third panel, sat an empty grey rectangle. "The mobile
page is still wrong why is there that grey box?"

Still wrong. Because I had already fixed this once, that same day. The first
version had three panels in a grid set to `repeat(auto-fit,minmax(158px,1fr))`,
and at 390px two columns fit, leaving a hole. I raised the floor to 190px,
verified at 390px that the grid now collapsed to a single column, wrote a
four-line comment in the CSS doing the arithmetic, and shipped it feeling
thorough.

The comment is still in the git history and it is the most embarrassing thing in
this repo, because the arithmetic is correct:

> 190, not 158, ON PURPOSE. At 158 a 390px phone fits TWO columns, which leaves
> the third panel alone beside an empty box. 190 forces one column on a phone
> (2x190 > 346px of usable width).

Every word of that is true and the conclusion is wrong, because "a phone" is
doing enormous unearned work in that sentence. His iPhone reports 440 CSS
pixels. Two 190px columns fit inside 440 comfortably. The fix I was proud of
bought about fifty pixels of headroom and I never asked how many pixels I
needed.

What makes it a good story rather than just a bug is that raising the number
again would have worked. 195px, 210px, and the screenshot goes clean. I would
have shipped it, and it would have broken again the first time someone added a
fifth panel, or opened it on an iPad in portrait, or a foldable.

The number was never the bug. The bug was that the layout's correctness depended
on the panel count, which is a thing that changes when you edit copy, which is
the single most common edit anybody makes to a page like this. A constraint
nobody can see while doing the most likely edit is not a constraint, it is a
trap with a delay on it.

So the fix is structural: separate cards with their own borders, so an empty
cell cannot paint anything. And the check that guards it does not look at the
page at all. It computes `(cols - cards % cols) % cols` and demands zero, at
nine widths from 320 to 1280. That assertion cannot be satisfied by getting
lucky with a breakpoint.

The same session produced the other half of the lesson. Aaron also asked for
music. Adding it took twenty minutes; proving it took longer, because the
obvious check is to click the button and see if it turns orange. It does turn
orange. It turns orange whether or not a single sample reaches the speaker. So
the harness reads the audio element's own `paused` flag, and then neuters
`play()` and asserts that the button still lights up while the sound check goes
red. Two harnesses in this project have already been green while proving
nothing. Now the sabotage is part of the test rather than something I remember
to do.

The pattern across both: the thing I checked was downstream of the thing I cared
about, and the two agreed often enough to feel like the same thing.


## The backdrop that was already in the building

The coming-soon page needed something behind it. I drew a basketball court in
SVG: half court in the game's own proportions, key, free-throw circle, a shot
arc that travelled from the wing to the rim on a seven second loop. I was pleased
with it. Then I faded it to sixteen percent opacity so it would not fight the
text, put a vignette over it so the lines would not stop dead at the screen
edge, and shipped it.

Aaron: *"i cant even see that basketball court and ball in the background."*

He was being generous. It was invisible. And there is a lesson in the fading
itself, because I faded it for a good reason: the lines DID fight the text, and
a stroke that stops in mid air DOES look like a scratch on the screen. Every
individual decision was defensible and the result was nothing.

But the actual failure came earlier. The game's main menu has painted a full
arena behind itself since the first release. A warm, crowded, jumbotron-lit room
with god rays, silhouettes in the stands, and a hoop in the corner. It lives at
`docs/play/assets/arena-menu.jpg`. The stylesheet that treats it is twenty lines
long: `brightness(.4) saturate(.42)`, the accent colour laid over it with
`mix-blend-mode: color`, a radial darkening, and a forty second drift so it
breathes. DESIGN.md section 9b describes the whole lane in writing: code draws
everything dynamic, sourced illustration owns atmosphere.

I never looked. The request read as "make a background", and making backgrounds
is a thing I can do, so I did one.

That is the part worth writing down. It was not laziness and it was not
ignorance of the file. It was that being able to do the task is precisely what
stops you asking whether the task needs doing. A less capable tool would have
had to go looking for something to reuse.

Swapping it in took fifteen minutes and the page immediately looked like it came
from the same building as the game, which the SVG version never would have,
however good the geometry got. Then one more measurement earned its keep: the
painting is 16:9, and `cover` on a 440 pixel phone crops to about a third of its
width. What survives is the underside of the jumbotron. Abstract shapes. So
portrait gets a different rule, the whole picture as a band across the top
fading into black, rather than the same picture squeezed.

The wasted hour does not matter. What would have mattered is shipping a landing
page that looked like a different product than the thing it was advertising.

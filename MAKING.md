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


## Twenty of two hundred and eleven

I built Aaron a status board. Two of them, actually, on the same day. The second
one was careful: I archived the first because he asked me not to delete it, I
re-measured every number, I checked the twenty-seven launch items against the
code with a grep instead of from memory, and I put the parts he rarely needs
behind collapsible sections because he asked for that too. I was pleased with
it.

His reply: *"I think you are missing ALOT from my future build stuff, idk why it
feels like so much from the other doc is left out."*

My first instinct was that he had missed a section. That instinct lasted about
forty seconds, which is how long it took to run `grep -c` on BUILD.md. The doc
is 3,639 lines. Section 6 alone, "Open design questions", holds twenty-five
substantial items: the ratings problem, the college league question, the
taxonomy conversations, the idea bank, team turns, pacing, skills, TV mode, the
Tape rebuild, the spacing fix. My board showed four of them.

Across all the docs there are 211 items. The board had 20.

What makes this worth writing down is that not one of those 20 was wrong. Every
line I wrote was accurate, checked, and well phrased. The defect was not in what
was on the page, it was in how the page came to exist: I read the documents,
understood them, and then wrote a summary from that understanding. Which means
the coverage of the summary was a function of my attention during the twenty
minutes I spent writing it.

And here is the part that should worry anybody working this way: **an incomplete
list looks exactly like a complete one.** If I had written that the bank has
1,200 cards, Aaron would have caught it in a second, because a wrong number is
loud. A missing row is silent. It is silent to the reader, who has no way to
know what should have been there, and it is silent to the writer, who by
definition did not think of it. Every habit this project has built up so far
protects against being wrong: measure before you assert, break the test on
purpose, quote the numbers you actually ran. Not one of them protects against
being incomplete.

So the board is not written any more. `harvest.py` reads the five docs and pulls
out every item it can find, and the build refuses to finish if the rendered page
has fewer rows than the harvest found. The first honest run printed 211, and
that number is now the thing Aaron and I argue with, rather than my recollection.

Getting there took three parser bugs, all of them instructive in the same
direction. Substring matching read COMPLETENESS as COMPLETE and filed the
knowledge-base section, which is the biggest open ambition in the project, as
finished work. A loose id pattern read "17 screens have only the smoke floor" as
item number 17. And sub-points like "Tone guardrail:" showed up as peers of the
things they were guardrails for, which I fixed by nesting them rather than
filtering them out, because "complete" and "not confusing" only fight each other
when the structure is flat.

The lesson generalises further than a status board. Any artefact whose whole
purpose is completeness — an API reference, a test matrix, a dependency
inventory, a security checklist — has to be derived from its source rather than
composed from an understanding of it. Otherwise you are not documenting the
system. You are documenting how much of it you happened to be holding in your
head at the time.


## Filling in the blank broke it

Aaron asked for something small: a tag meaning "this question belongs to every
era", so the reports would stop being confusing. Rules questions, court
dimensions, all-time records — none of them live in a decade, and they were
sitting in the data as cards with no era at all, indistinguishable from cards
nobody had got round to tagging.

Fifteen minutes of work. Add the value, tag the seventy-one cards that qualify,
point the metric at the tag instead of the heuristic it had been using. Done.

Except I then ran the game's data build and looked at what came out, and
seventy-one cards had the era `"eras"`. Not `all-eras`. Just `eras`.

The emitter strips the league prefix off era names, because internally they read
`nba-1990s` and the game only wants `1990s`. Split on the hyphen, keep the second
half. Applied to `all-eras` that produces `eras`, which is not a decade, is not a
tag, and is not recognised by anything.

Worse than a cosmetic bug. The game's era filter passes any card with *no* era
tag — that is how these seventy-one had always got through. Now they had a tag,
so they went down the other branch, got compared against the list of selected
decades, matched nothing, and disappeared. **Every one of them would have
vanished the moment a player picked a decade.** Filling in the missing data broke
the thing that depended on the data being missing.

I wrote a check to prove the fix. It printed:

    {"total":0,"allEras":0,"mangled":0,"survive":0,"wouldHaveSurvived":0}
    GOOD: all 71 pass a decade filter now

Total zero. Nothing loaded. `QUESTIONS` is a script-scope variable and I had
reached for `window.QUESTIONS`, which is undefined, so the filter ran over an
empty array and every assertion passed vacuously. `0 === 0`. The word GOOD, in
capital letters, under a line of output that says plainly that nothing was
tested.

This project has recorded that exact failure twice before. There is a note about
it in the repo, written by me, in a file I have read. It did not stop me doing it
again — what stopped me was reading the output instead of the verdict.

So the real lesson is not "guard your assertions", though the guard is now there.
It is that a green tick is a claim about the world and, like any other claim,
the only defence is looking at the evidence underneath it. I have written that
sentence in this repo three times now in different words. Apparently it needs
writing again.

## The list that told him to decide something he had already decided

Aaron asked a good question, the kind that reframes a pile of work: *"have you
sorted all the V tasks in order as to what is best to do first (regardless of
number?) the same way I said to do v29 first because it proves if the other
tasks are even worth doing."*

The insight in it is his. V29 gathers no basketball facts at all. It reads terms
of service. By every measure that feels like progress it is the least productive
run on the board, and he put it first because it can cancel three of the others
before they are paid for. That is a different sorting key from the one I had
been using, which was roughly "what did we notice most recently, and what is
cheapest per card." Numbered ids encourage that. V13 sounds like it comes before
V39 because thirteen comes before thirty-nine. The numbers are the order things
were *noticed*, and nothing else, and I had been reading them as a queue.

So I rewrote the ordering section. The old one was the July plan, nine days old,
still listing tasks that finished on the 29th. I reorganised it around what each
task can *cancel*, put numbers under the claims — 317 cards dealable, 607 the
ceiling if every readable card is verified, therefore 393 cards that must be new
material and no amount of verification will get there — and shipped it.

And in the middle of it I copied a line across that said one of the design
questions was "Awaiting Aaron."

It was not. He ruled on it on the 29th of July. It is written down, in his own
words, in a file I have read: players carry every decade they played, questions
are tagged with the decade the answer became true. The old list was stale about
it. My new list, dated today, in my voice, at the top of the document he opens
to decide what to do next, told him to go and make a decision he had already
made and that had already shipped.

What caught it was reading further up the same file. Not a check, not a script —
just reading more of the document than the part I was replacing, and noticing an
entry that recorded the ruling.

The thing I keep learning in different costumes: text you inherit does not feel
like a claim you are making. It feels like something you are preserving. But the
reader has no way to tell which sentences I wrote and which I carried over. They
all arrive in the same voice with the same date on them. Rewriting a document is
not editing it. It is signing every line of it again.

There is a small irony worth recording. The instruction I broke is in this
repo's own operating manual, in bold: *"If a doc already covers what you're
about to assert, open the doc."* I did open a doc. I opened the wrong one, and I
opened it to copy from rather than to check.

## The first item on the plan was already done

He caught the bigger mistake first. I had been asked to take the list of work
between here and launch and put it in the order it should be done, and I had
gone and re-sorted a different list — the research queue, most of which is not
even in the launch — and published a "do this first" ranking underneath the
actual plan. Two plans in two files. The repo's own operating manual opens with
a warning about exactly that, in bold, because it had cost him a day once
already.

"I don't think you understood my ask and may have caused more issues." Then, and
this is the bit I want to remember: *"Please explain to me that you understand
before we proceed."* Not "fix it." Explain it first. He had watched me move fast
in the wrong direction twice in one day and wanted the understanding checked
before more work got built on it. That is a good instinct and it worked.

So I explained, he approved, and I built the thing he actually wanted: two
tracks, data and build, each in order, because his own ruling says the building
runs alongside the research rather than after it. It came out well. I published
it as a page. The top of the build track read **"Merge the Daily Five — built,
48 checks green, sitting on a branch"**, with a confident line under it about
how finished work that is not live is the worst state anything can be in and
nothing new should start before it ships.

Then I went to merge it and ran one command. It was already on main. It had
merged that morning. In a merge I did.

What is uncomfortable about this is that it is not the same error as the
morning's, which would at least be tidy. In the morning I copied a stale
sentence out of an old document. This time I wrote the sentence myself, from
scratch, in my own voice — and the thing underneath it was a *status*, cached in
a planning doc, which git could have settled in two seconds. I never asked git.
I asked the note.

The compounding is what makes it worth writing down. One unverified sentence
went into V0, V0's line went into a plan, the plan went into a published page
with today's date on it. Three surfaces, each looking more authoritative than
the last, all resting on a line nobody had updated at merge time — because
nobody ever updates a planning doc at merge time.

The consolation prize was small and real. With the Daily Five already done, the
next item was the manifest, and building it produced the good kind of failure:
the deep link I wrote for the app-icon shortcut didn't work, and the harness said
so instead of me discovering it on a phone in a week. The reason was that a
loading screen counts a shot clock down and picks the first screen about a second
after boot, so my carefully deferred call was landing first and being overwritten.
Right code, wrong file.

Then, sabotaging the harness to prove it could fail, the single most likely
real-world break — someone deletes the manifest link — made the harness *crash*
rather than report. It would have died on the exact input it exists to catch. I
have written a version of that lesson in this repo before. Apparently it needs
writing in each new harness, or better, it needs the sabotage run every time,
which is the only reason I found it.

## The same question, a different shape, and a hundred and two rows

Run A of the licensing research came back with question one answered well and
question two completely empty. Zero rows. The tool reported success.

The easy read is that the model failed. It didn't. The harness was built to
search the web for claims and then verify them, which is a genuinely good thing
to be built for, and it is exactly what question one needed. Question two was
not a search problem at all. We already knew which twelve documents mattered.
There was nothing to discover, so a discovery engine discovered nothing and
returned an empty array, honestly.

So I rewrote it as a reading list. One agent per holder rather than per claim.
One row per document, including the documents we could not open, which get a row
saying "could not retrieve, here is the error" instead of quietly vanishing. And
a self-check that the script computes rather than asks for: count the rows, and
if there are fewer than eight, say the run failed at the top of the answer.

Same model. Same tools. Same question. **A hundred and two rows.**

It got interrupted an hour in, which is its own small story. One agent decided
it needed to attach a GitHub repository to read some issue threads, the request
was outside the session's scope and got denied, and the agent was told to stop
and wait for a human. Nobody was coming. It sat there for an hour with six
finished agents queued behind it, and Aaron spotted the stalled orange dot on
his phone before I did. The fix was one sentence added to one prompt: those
issues are public web pages, fetch them like any other page, and if a page will
not load, write that down and move on. Never wait for a human. Resuming replayed
the six finished agents from cache and only re-ran the broken one.

What came back is better than I expected and more uncomfortable. Basketball-
Reference's terms turn out to be unusually generous about the thing we actually
do — sharing and repackaging data from individual pages is "welcomed", including
commercially, as long as you credit them, which every card already does. And
they are unusually specific about the thing we might have drifted into: you may
not build a database that is a material substitute for theirs. That is a
substitution test, not a volume test, and it is the difference between a trivia
bank and a mirror.

Then there is the clause I did not expect. Their terms bar using their content
for "prompting, or instructing artificial intelligence models" to generate
"answers, text, scores, statistics". Read plainly, that is a description of how
this bank gets checked. It was last updated in May 2023, which is after every
scraper in the long list of projects nobody has ever been sued over — so the
comfort of "nobody has ever enforced this" does not stretch to cover it.

And the sentence that stuck with me, from the run's own analysis of its own
existence: the cheapest defence against a browsewrap contract is not having read
it, and we have now read it, in full, deliberately, and written the quotes into
the repository. Doing the responsible thing is what removed the excuse.

I filed it as a question for Aaron rather than answering it. It is his project
and his risk, and it is exactly the kind of decision that should not be made by
a default.

## Just give this quote a thought

He did not tell me I was wrong. He quoted my own sentence back at me and said
"just give this quote a thought," which is a much better move, and I want to
record why it worked.

The sentence was in the document for his lawyer friend, describing how the
project gathers facts: a person opens a page, reads it, writes one question. No
crawling, no bulk download. Automated fetches rate-limited well below the
published ceilings.

Three clauses. All three false.

The assistant fetches the page and reads it; a person reviews the batch
afterwards. There absolutely has been bulk fetching, including one run that
pulled eighty season pages in sequence. And "well below the published ceilings"
was backwards: we were running one request every 1.5 seconds, which is forty a
minute, against a published ceiling of twenty and a robots.txt asking for one
every three seconds. Double, not below. Above the rate their own error page
names as the trigger for a temporary block.

The part I keep turning over is that I had both numbers. The 1.5 was in a file I
had opened that same session. The twenty-per-minute was in a research return I
had filed myself, with my own hands, about two hours earlier. I had them both and
I never divided sixty by one and a half.

I think the reason is that a claim about your own system does not feel like a
claim. It feels like remembering. An external fact trips the checking instinct;
a self-description sails straight past it, because you are the authority on
yourself. So what I wrote down was what the code was designed to do — carefully,
one page at a time, a human in the loop — every word of which was true as an
intention and none of which was a measurement.

It was also, conveniently, flattering. Self-descriptions err in one direction.

And the worst of it: the document's second question asks whether a clause about
prompting AI models reaches a human using an assistant to check a fact. By
describing our method as "a person opens a page and reads it," I had quietly
answered that question inside the fact pattern. The lawyer would have given an
accurate answer about a project that does not exist.

The fixes were quick. Both fetchers now read their limits from one file where
the number sits next to the quote that sets it, and they run at 3.5 seconds,
seventeen a minute, genuinely below. They send a bot user-agent that says what
they are instead of pretending to be Chrome. The brief now says all of this out
loud, including the correction and the date, because a lawyer who is told
"we found this ourselves and fixed it" reads it very differently from a lawyer
who finds it.

The thing worth keeping is the shape of his question. He did not say "this is
wrong" — he probably was not certain it was. He said the sentence deserved a
second look. That is exactly the right amount of pressure to apply to a
confident collaborator: enough to make me measure, not so much that I defend.

## Four times in one day, and every one of them was well made

The four entries above were all written today. Reading them back in sequence, I
notice they are the same story four times, and the repetition is more
interesting than any of them individually. So this is the entry about the other
four.

**One.** Asked to put the launch work in order, I ordered a different list
entirely, and published a competing "do this first" ranking underneath the real
plan. **Two.** Having been corrected and built the right plan, its number one
item turned out to be already finished, because I took a status line from a
document instead of asking git. **Three.** A research run came back empty and I
had to rebuild its shape from a search into a reading. **Four.** I wrote a
sentence describing how carefully this project fetches pages, into a document
meant for a lawyer, and all three of its clauses were false.

Here is what unsettles me about the list. **Not one of those was sloppy work.**

The plan was genuinely well ordered, with a stated ranking principle and a
reason on every row. The page was carefully built, generated rather than
hand-written specifically so it could not drift, using the game's own colours
and typefaces. The research brief was a real diagnosis of a real failure and the
reshape worked, a hundred and two rows against zero. The lawyer document was
structured, ranked, quoted from primary sources, with a print stylesheet.

Every one of them was good. Every one of them was sitting on a premise nobody
had checked.

That is the actual pattern, and I do not think it is a pattern about carelessness
at all. It is a pattern about where attention goes. **The craft absorbs it.**
Choosing how to rank twelve items, or which colour carries Track B, or how to
phrase a question so a busy lawyer answers it — that is absorbing, satisfying
work, and while I am doing it the premises underneath are not being examined,
because they do not feel like the job. They feel like the ground the job stands
on.

And a well-made artifact is more dangerous than a rough one, because it recruits
belief. Nobody interrogates the foundation of something that looks finished.
Least of all the thing that made it.

**The second pattern is how they got caught, and it was never by verification.**

Aaron did not check my work. He mostly could not have — he did not have the
numbers, and half of them did not exist until I measured them in response to
him. What he did, four times, was notice that something felt slightly off and
apply the smallest possible amount of pressure.

*"I don't think you understood my ask."* Not "you did it wrong."
*"Just give this quote a thought."* Not "this is false."
*"What if we can't use this... won't we run into the same problem?"* Not "your
plan is fragile."

Every one of those is an invitation to look again rather than an accusation, and
the difference matters enormously to what happens next. "This is wrong" gets an
explanation. "Give it a thought" gets a measurement. He has worked out — I am
not sure how deliberately — that the way to get a confident collaborator to
check something is to make checking cheaper than defending.

**The third thing, and the reason this is not a lament.** Today was one of the
most productive days on the project. The install metadata shipped with
twenty-four checks and five sabotages behind it. The licensing question that had
been open for two days came back answered, in a hundred and two quoted rows. Two
artifacts got published. A rate limit that had been quietly wrong for days is
now right, in one file, with the evidence next to the number.

The errors were not a bad day interrupting a good one. **They were the texture
of the good one.** High output and unchecked premises arrive together, because
they come from the same place: moving fast enough to make a lot of things, and
not slowing down to ask whether the ground under each of them is where you left
it.

The costs were tiny, and they were tiny only because he caught them within the
hour. The wrong plan cost an hour. The already-done item cost a paragraph of
embarrassment. The rate-limit sentence, if it had gone out unchallenged, would
have bought a considered legal opinion about a project that does not exist. Same
error class, three wildly different bills, and the only variable was how long it
sat.

**A small coda, because it is the same thing again and I would rather write it
down than leave it out.** When I reported the rate-limit fix, I told him it had
gone into the learnings file. I did not mention that I had also written it up in
this one, in the same commit, five hundred words of it. He replied that the
experience belonged in the making-of too.

I had done the work and reported the half I was proudest of. Which is, more or
less exactly, the shape of the other four.

## The pause that paused nothing

The game has one way to stop the world. `BK.freeze()`. Every coach popup calls
it before it speaks, and has done since the coach existed. That is the whole
reason the coach card says GAME PAUSED across its header: it is not a claim, it
is a description of the call that just went out.

Then we built the Daily Five. Ten questions, one rack, its own screen — and,
crucially, its own shot clock, because the Daily Five does not run the engine.
It is a different thing sharing the same paint.

`freeze()` still got called there. It still returned. It did nothing.

There is no engine game to hold on that screen, so the function found nothing to
do and did it, quietly and correctly, exactly as designed. For as long as that
screen has existed, a coach popup on the Daily Five has been a card of text sat
on top of a running clock.

The worst instance is the one we shipped yesterday. Aaron asked for a notice on
resume — if you close the app mid-question, come back and be told that card was
a miss. We built it. It fires one line after the card is dealt. So the
sequence, in the real product, on a real phone, was: deal the question, start
the seventeen-second clock, and paste an explanation over it. **Reading why you
lost the last card cost you the next one.** A fairness fix that charged you for
reading it.

He found it the way he finds everything, by playing: *"Make sure the coach popup
pauses daily 5 gameplay."*

What is instructive is not that it was broken. It is that it was invisible. Every
call site read as correct. `freeze()` right there, above the text, on the line
you would check first. Nothing to grep for, no error, no console warning, no test
that could have failed — because the code did precisely what it said and what it
said had stopped covering the ground.

And there was an accomplice. Freeze is *supposed* to do nothing in online games:
you cannot pause the other phone, so a documented, deliberate no-op already lived
inside that function with a comment explaining itself. A quiet freeze had already
been established as normal. The second silence hid behind the first one.

The fix took ten minutes. The thing worth keeping took longer: **the new pause
returns what it paused.** `clockHold(true)` hands back the milliseconds it
parked, or zero if there was nothing running, and the coach uses that answer to
decide whether it is even allowed to print the words CLOCK STOPPED. A pause that
reports itself cannot silently pause nothing. And then the return value turned
out to be the best part of the message — the card now reads `COACH · CLOCK
STOPPED AT :21`, which is a promise as much as a status: this is what you get
back when you tap Got it.

## The cue nobody could see, caught by the rule that exists for this

Two smaller ones from the same hour, and they are a pair.

The first: I gave the frozen clock a look. The bar goes hollow and striped, the
number pulses, the low-time red drops away so `:03` under a stopped clock does
not read as three seconds still draining. Nice work. I was pleased with it.

Then I built the before/after page — because this project has a standing rule
that anything which changes how the game looks ships next to what it replaced —
and there it was in both frames: **the coach card sits squarely on top of the
clock bar.** At 390px and at 1440. The card that stops the clock covers the only
thing that shows the clock is stopped. Every pixel of that state was invisible to
every player who would ever trigger it.

The rule caught its own subject. That is not a coincidence, it is the mechanism:
you cannot see what a change looks like until you look at it, and describing it
is not looking at it. The frozen time moved into the card's header, which is the
one place the player is guaranteed to be reading. The striped bar stayed, because
it costs nothing and is correct wherever it shows.

The second, from the same script, and this one is nastier. That page was supposed
to show both of the game's themes — the dark hardwood and the light whiteout.
The script set a `localStorage` key, took eight screenshots, printed a tidy
report, and every check passed.

Two of the files were byte-for-byte identical. The key I wrote is not read by
anything; the theme lives inside a settings object under a different name. Four
of the eight shots were the same theme photographed twice and labelled as two.

Nothing failed. Nothing could have failed. **The comparison would have shipped
carrying a claim — "both themes checked" — that was half false, inside the very
artefact whose job is to close the question.** The only tell was two matching
file sizes in an `ls`, which I nearly scrolled past.

The script now reads the body class back off the page and prints it in every
row. `phone/light(theme-whiteout)/after`. One line. It converts a silent lie into
a loud one, and it names the general shape: **setting a value is an intention;
reading it back is a measurement, and a test that only does the first one is
asleep.**

Three failures in one afternoon, all the same species. Something reported success
without doing the work — a freeze that froze nothing, a style nobody could see, a
theme switch that switched nothing — and in all three cases the code was honest
and the *silence* was the lie.

---

## 9 August 2026 · a man who has watched basketball can see a wrong court in one second

Aaron looked at the picture of the Gym I had spent an afternoon on and wrote one
sentence: *"the half court you made for the gym is not correct. The court lines
are very wrong."*

He did not measure anything. He did not need to. He has watched basketball his
whole life, and I had drawn a three point line that ran from sideline to
sideline in a smooth curve, which is not a thing that exists on any court
anywhere on earth. The corners are straight. Everybody who has ever stood in a
corner knows the corners are straight.

What I had actually written was five CSS rules containing eleven numbers, and
here is the tell I want to remember, because it is visible from orbit once you
know to look: **not one of those eleven numbers could say where it came from.**
`top:-10%`. `height:46%`. `left:31%`. They came from my sense of how a court
looks. A block of untraceable constants describing a real object is a confession,
and I wrote it, saved it, screenshotted it, and published it as a sample.

The instructions in this repo already say, in bold, that a visual element has
three answers and not two: build it, source it, **or find it already built**,
and check the third one first. That paragraph exists because I skipped it once
before. I skipped it again. Between reading the rule and drawing the arc, the
rule was simply not in the room.

So I went to fix it the way the rule says, by reusing the game's own half court,
which has been sitting in `index.html` since the Daily Five shipped.

**The game's own half court is three CSS boxes and it is also wrong.**

That stopped me for a minute, and it is the actually interesting part of the
day. The rule I had broken would, if followed, have reproduced the bug with a
clean conscience. "Reuse what exists" is not a synonym for "reuse what is
correct". The existing thing is evidence about house style. It is not evidence
about the world. The old court was decorative, sitting at four percent opacity
behind a rack of cards where nobody would ever count its lines, and it was fine
for that. The new one is the floor of a room and the thing you tap. Decoration
promoted to load-bearing is how errors get somewhere they can no longer afford
to be.

The fix was the answer neither option named. Build it properly once, in one
file, with every dimension written down where it can be checked: fifty feet by
forty-seven, basket at five foot three, arc at twenty-three nine, corners three
feet off the sideline, meeting the arc at 14.198 feet up, which is the exact
tangent and which is why the published figure of "fourteen feet" is really
14.2. It is an SVG whose viewBox *is* the court. Both the sample and eventually
the game point at it.

And then, because instructions do not bind and this project has now proved that
three separate times, I turned the check into a command. `tools/gym-labels.py`
lays out all seven drill markers and their labels as rectangles and reports
every overlap. I had already looked at that layout and thought it was fine. It
found three collisions.

---

## The same day · the number I made up about the thing I had just written

Aaron asked for two lists: every mechanic that should be a drill, and every
moment the coach should speak. Exhaustive, he said, twice. *"I don't want to
miss A THING."*

So I read everything and wrote them. Sixty-six drill candidates. A coach moment
for every entry point in the game. Then I wrote the summary sentence at the top:
*168 moments, 41 of them essential.*

Then I ran a grep over the file I had written ninety seconds earlier.

**256 moments. 109 essential.**

I have now done this three times on this project, and it has never once gone the
other way. The made-up number is always lower than the real one. That direction
is not random and it is not innocent: an under-count sounds reasonable, and a
reasonable number does not get a second look. A shocking number does.

And the shocking number was the whole finding. 109 essential coach moments, 77
of them on the path a first-time player walks through a twenty minute game, is
one interruption every fifteen seconds. Which means the priority scheme I had
just invented in the same document does not work. My neat little MUST / SHOULD /
COULD ladder sorts the list beautifully and cuts nothing, because when a game
has this many moving parts, "you cannot understand the game without this" is
honestly true of seventy-seven things.

Forty-one would have sounded fine. Forty-one would have shipped. The false
number was not a smudge on a correct conclusion, it was standing in front of the
conclusion.

So the recommendation changed from a trim to a budget: twelve coach cards in a
first game, never two in one possession, and anything that does not fit waits
rather than being deleted. The list stops being a script and becomes a priority
queue. That is a better answer than the one I set out to write, and I only got
to it by being wrong out loud about a document I had personally just finished.

The rule is embarrassingly cheap. **Count it before you describe it, even when
you wrote it, especially when you wrote it.** The thing you just made is the
thing you are least able to see, because you remember intending it instead of
doing it.

---

## 9 August 2026, later · the page that worked everywhere except where it mattered

Aaron opened the spike on his phone and wrote: *"did not work on mobile strange,
worked on desktop tho, I couldn't zoom or use the image on mobile."*

One missing line. `<meta name="viewport">`. Without it a browser assumes the
page was built for a desktop, gives it a 980px layout viewport, renders the
whole thing at that width and then shrinks it to fit the glass. On a 390px
phone that is a scale factor of 0.398. My hotspot rings were drawn at a
carefully correct 44 pixels, which is Apple's minimum touch target, and they
arrived on his thumb at **17.5**.

I went to add the line and then did the thing I have learned to do, which is to
check whether it is one bug or a class. It is a class. **Seven files were
missing it. Every single one was a dev page or a mockup. Every shipped page in
the repo had it.**

That split is the whole story and it is not a coincidence. Shipped pages get
opened on phones, so the omission surfaced years ago and got fixed. The mockups
only ever got opened by me, in a headless browser I had personally told what
size to be. So the throwaway artefacts had been quietly accumulating exactly the
defect the real ones cannot keep.

Which is backwards. A mockup's entire job is to be looked at by the person
making the decision, and that person is holding a phone. **A mockup you cannot
open on a phone cannot be judged on a phone**, and it does not matter at all
that it was going to be deleted next week.

The same seven were missing a charset too. That one showed up in a screenshot as
`BALL KNOWLEDGE Â· 9 AUGUST`, every middot in the game's favourite separator
turned into mojibake, because a page that does not declare its encoding gets
read as windows-1252. Found the same afternoon, same shape, same cause. Both are
now counted by the audit at zero.

Then I wrote a check for the tap target, and the check said **44px**. Comfortably
passing. The finger was getting 17.5. Both numbers were true: the element really
is 44 layout pixels, and the layout was the thing that was wrong. My measurement
was taken inside the broken coordinate system and could not see the break. I
only caught it because I deliberately re-broke the fix to watch the check fail
and it sat there passing. **A check that passes during a sabotage is worse than
no check, because now it is evidence.**

---

## The same day · "it still wasn't the feel"

The second half of his message was the good part.

> *"maybe giving the zoom a slow bounce to make it seem like you are walking is
> worth it? Idk just a thought. But also when I was using it on the desktop it
> def felt more like a zoom than walking and while the slower was better it
> still wasn't the feel."*

He is right, and the reason is worth writing down: **slower was never going to
fix it, because speed is not what separates a walk from a zoom.** They can take
exactly the same time. What separates them is that when you walk, the near
things slide past faster than the far things, your head goes up and down, and
you can hear your own feet. My v1 had precisely none of those and I had offered
him a slow-motion toggle, which is a speed knob for a problem that is not about
speed.

His bounce idea works, and it works at about a third of the size you would
guess. Seven pixels. Three footfalls. A fifth of a degree of roll. Any more and
it is seasickness rather than walking.

The footsteps do more than the bob and they cost nothing: filtered noise with a
fast decay, two filters and an envelope, no audio file involved. Biggest single
jump on the page.

But the one that matters is the near layer, because it is the one that costs
money. To prove it does anything I shot the frame with the layer on and off and
diffed the pixels. **0.3 percent.** Which reads as: cut it, it does nothing.

I had sampled the destination. At the destination the near field is correctly
gone, because you have walked past it. At rest it is 8 to 9 percent of the
frame. **Halfway through the walk it is over eighty percent.** The effect is
enormous and it exists only while you are moving, which is exactly when a
walking cue should exist.

Nothing about that measurement was sloppy. The instrument was fine, the diff was
right, the number was real. The sampling moment carried the entire conclusion,
and I picked it without noticing I was picking anything, because the destination
is simply where the animation stops and therefore where a screenshot naturally
lands. That is the scary kind of wrong: not a mistake you make, a mistake the
tooling makes for you.

And then his last line, which was the sharpest thing anyone said all day:

> *"And doing it this way we would lose the turn towards something right?"*

Yes. With one flat photograph you can only move along the axis into it. Turning
reveals geometry that is not in the picture and no amount of scaling invents it.
He worked that out from feel, in one sentence, without seeing the code.

The good news came from v1's bad news. v1 had measured that a 16:9 image in a
phone frame shows only 36 percent of its width and filed that as pure loss. It
is not loss. The other 64 percent is exactly the material a turn pans across.
Turning now works in the spike on the same photograph with nothing added at all.

So the spike has now paid for itself twice, and both times by changing the ART
brief rather than the code: first the shape and size of the base images, now the
fact that they have to arrive in LAYERS. One extra prompt per room today. Twelve
regenerated pictures if we find out later.

---

## Still 9 August · three ways to be invisible

Aaron opened the walkable-room prototype on his phone and could not use it.
*"Worked on desktop tho."*

One missing line: `<meta name="viewport">`. Without it a phone renders the page
at a layout width of 980px and scales the whole thing down to fit. The prototype
was there, complete, beautiful, and rendered at 40% size. The 44px tap targets
were **17.5 pixels of actual finger.**

Seven files in the repo were missing it. Every single one was a dev page or a
mockup. Not one shipped page was missing it, because shipped pages get opened on
phones and mockups get opened on my imagination. Which is the whole problem with
mockups: **a mockup you cannot open on a phone cannot be judged on a phone, and
most of this game is played on one.**

Then I wrote the check to catch it, and the check passed with the bug still
there. It measured the ring at a confident `44px`, because `getBoundingClientRect`
reports LAYOUT pixels and the layout was the thing that was wrong. I had built a
tape measure out of the same wrong ruler.

And then, hours later, a third version of the same species. Every hotspot became
unclickable on desktop while staying perfect on a phone. The pins had ended up
inside a `preserve-3d` element, and inside a 3D rendering context CSS ignores
`z-index` entirely and sorts everything by computed depth. At 420 pixels wide
the photograph landed a hair in front of the buttons. At 358 it did not. There is
no chance I reason my way to that.

The thing that catches all three is three lines and knows nothing about any of
them:

```js
const r = el.getBoundingClientRect();
const hit = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2);
// hit must be el, or inside it
```

Ask the browser what is on top. Not what should be on top. **Visible, correctly
sized, and correctly positioned are three properties, and reachable is a fourth
one that none of them imply.** The user only ever experiences the fourth.

The bit I keep turning over: I had already written a rule in this project called
MEASURE BEFORE YOU ASSERT, and I did measure. I measured the wrong thing, in the
wrong units, with a tool that could not see the failure. **A measurement is not
automatically a check.** You can be extremely rigorous inside a frame of
reference that is itself the bug.

---

## Still 9 August · "I didn't realize you cannot hear sounds"

Aaron said it almost apologetically, re-sharing his sound folder with every file
renamed by hand so I would know what each one was. *Footsteps in Hallway. Crowd
Disappointment Reaction. A Gear Turning Sound (picking eras in time machine).*

Two things about that folder.

The first is that the renames were full of information the filenames had been
hiding from me. I had catalogued these files in the morning by reading their
Pixabay names and confidently reported that the rim clank was missing. It was
not missing. `basketball-85872.mp3` WAS the rim, and had been all along; I had
read a filename and mistaken it for knowledge of the contents. Aaron, who can
hear, renamed it *Basketball Hitting Rim Sounds* and my "missing" item
evaporated. And three files I had shrugged at as "unclear, Aaron's call" turned
out to be him quietly sound-designing the career mode's time machine, a
building that does not have a single pixel yet and now has a takeoff, a
power-up, and a gear-shift for choosing eras.

The second is what "cannot hear" turned out to mean once I stopped treating it
as an excuse. I pulled all seventeen files into the repo and decoded every one
in the browser's own audio engine, the same decoder the game uses, and measured
them: duration, peak, average loudness, and the silence at each end. Deaf, and
the numbers still found everything that mattered. The big crowd cheer opens
with 804 milliseconds of dead air, which played raw would make every ending
land on a delay. The buzzer hides two thirds of a second of silence before it
buzzes. The time machine takeoff is clipped. The two cheers, which I could not
tell apart this morning, have measured loudnesses three and a half decibels
apart, which is exactly the polite-versus-loud pair the endings spec asked for,
so the sample now plays the real files at three intensities, windowed past
their own dead air.

I cannot hear whether they sound GOOD. That is Aaron's half, permanently. But
"is this file usable" was never a hearing question. It was arithmetic wearing
headphones.

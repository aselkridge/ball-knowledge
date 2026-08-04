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

---

*Entries get added as things happen, not reconstructed afterwards. Reconstructed
build stories are always too tidy, and the tidiness is exactly what makes them
useless.*

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

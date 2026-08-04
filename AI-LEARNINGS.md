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

### 1.7 Context compression eats decisions
Long sessions get summarised. Decisions made in conversation and never written
to a file **cease to exist**, and neither of you notices until you contradict
one. This is not a model flaw, it's a property of the medium — plan for it.

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

### 2.7 Write the test before the implementation — and make it adversarial
An executable spec with hostile cases, written first, is the cheapest quality
mechanism available. It also survives compression, which conversation doesn't.

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

- **Relationships need tables from day one.** The test: *can one of these have
  more than one of those?* If yes, it cannot be a single field. Retrofitting
  this later cost a full day and surfaced eight data losses.
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

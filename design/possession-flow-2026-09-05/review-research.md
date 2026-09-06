# The research lens on Aaron's 09-06 proposal

Written 2026-09-06 against the archive only. Nothing here is a new design. For each piece of his message I say what the archive has for it, what it has against it, which game said it, how good the evidence is, and a verdict. Where the archive is silent I say so and do not fill the gap with my own taste.

Files read, in order: design/possession-flow-2026-09-05/scout.md, design/22af-findings.md, design/d37-defense-findings.md and its raw return in design/archive/d37-workflow-return-2026-08-12.md, design/possession-flow-2026-09-05/lens-sports.md, lens-tactics.md, lens-rpg.md, MEMO.md, plus concept-actionpoints.md and critique-actionpoints.md (the three-move cap was drawn and judged there), critique-chess.md, concept-twobeat.md, TODO.md rows 238 and 239, BUILD.md idea bank items 13 and 14, V0.md D33, DESIGN.md sections 3 and 4.

**How the evidence is rated.** Verified: the archive fetched the page or checked the rulebook, or the claim survived the first run's three-checker pass. Thin: a search snippet, a single cite, or a page the verifiers could not open. From memory: the lens writer said so in the file. Design reasoning: nobody's game is behind it, it is an argument.

**The facts in the code today (checked 09-06, not by me, taken as given):** the 24 restarts every turn, offense and defense; nothing caps the turns in a possession; over-and-back is already a turnover; there is no half-court count; a failed steal costs only the slide; the defense cannot pick a pass lane; a pass through a defender's reach or off a pressured passer costs the passer a question.

## His proposal in the archive's words

So the mapping is out loud: it is flow B from the memo (one free move, then the ball acts, the turn ends on pass, crossover or shot), with the defense's answer widened from one step to a move plus maybe an action, a cap of three offensive turns on each side of half court (concept C's three balls, counted twice), Persona's One More in with a standing contest, the steal priced, and the play pick moved to each side's first offense and first defense. Alternating possessions stay, so the closed turn-order question (design/22af-findings.md, B5) is not reopened.

---

## 1. The three-turn shot clock with a half-court reset

**For.**
- design/22af-findings.md, A4 (verified, the strongest-sourced finding in the program: Teamfight Tactics and Clash Royale patch notes, Sid Meier's memoir): fix pace by counting seconds not points, trimming the stops per possession, and shrinking the distance to the shot "so possessions resolve in fewer turns." A hard cap on turns is a direct way to do the last part.
- design/22af-findings.md, Finding 4, Blood Bowl (verified against the rulebook): a possession should have a shape, "set up, set up, then gamble." A cap that forces the shot on the third turn guarantees the gamble comes last. But note V0.md's own caveat, quoted in scout.md section 1c: Finding 4 "names the SHAPE and never picks a NUMBER." Three is his number, not the research's.
- design/possession-flow-2026-09-05/critique-actionpoints.md, flaw 3 (design reasoning): the critic's fix for concept C's clock problem was "a per-beat offense clock of 10 to 12 seconds with the balls as the real cap." That is his pairing exactly: the existing per-turn 24 plus a turn cap as the true shot clock.
- Same file, flaw 2 (design reasoning): the critic found that three moves cannot cross the floor on a steal and proposed "the cap counts only from the first front-court touch." His half-court reset is that fix in his own words. He arrived at it independently, which is worth something.
- Football Tactics and Glory (thin: Nintendo Life review via search snippet, lens-sports.md section 6): "if you don't score within those three turns, the other team takes over." That is a possession cap counted in turns, the nearest shipped thing to his rule. Reviewers praise the three lit pips as learnable.
- design/possession-flow-2026-09-05/lens-rpg.md, Slay the Spire (verified, Wikipedia): the three-energy orb is "the cleanest cap picture in the family" if he wants a counter drawn.
- Blood Bowl (verified, lens-sports.md section 5): the only stop on a possession is the turn counter on the sideline, eight a half, plus the turnover risk. There is no shot clock. From memory, and not in the archive: stalling, holding the ball to run out the opponent's turns, is a well-known and complained-about Blood Bowl tactic. If that holds up, the archive's most-studied game has exactly the filibuster he is worried about, and only a turn count stops it. Candidate to verify, not a finding.
- scout.md section 5 item 8 (design reasoning) saw the same hole: "a 24 per side per move would make a possession minutes long." He is right that the per-turn clock caps nothing.

**Against.**
- The same A4 finding cuts the other way on the backcourt count. "Shrink distance-to-shot" means fewer turns before the shot. A counted backcourt phase of up to three offensive turns plus three defensive turns before the ball even crosses half court adds turns to every dead-ball possession. Every panel concept that touched it (concept-pokemon, concept-actionpoints, concept-twobeat, concept-matchup; design reasoning) skipped the walk-up after a made basket for that reason, and concept-pokemon's critic said the concept should win that point. His half-court count implies the walk-up is played turn by turn.
- The arithmetic (design reasoning, using critique-actionpoints.md Lens 2's measured-feeling numbers of 8 to 15 seconds per offensive decision and 6 to 8 per defensive one): a full-court possession at the cap is six offensive turns and six defensive turns, twelve hand-offs before the shot. Concept C had seven hand-offs and the critic called that "more hand-offs than any design on file." At two or three taps a turn each side that is roughly 30 to 45 taps and two minutes before the first card. Typical will be shorter, but nobody has counted typical.
- critique-actionpoints.md Lens 2 (design reasoning): the cap "does not shorten possessions, it rearranges" them. Legible, yes; faster, unproven.
- Hero Academy and Magic Arena (thin, snippet-level, design/d37-defense-findings.md Q2): several small reaction windows read as "unbearable." Six defensive windows in a full-court possession is the most of any flow drawn so far.
- The "three dribbles" coaching line is basketball teaching, not something the archive studied. Unstudied.

**Verdict: supported in shape, unstudied as a number, and contradicted on the backcourt count unless the walk-up is short.** The archive likes a visible cap that forces the gamble last; it never studied three as the number, and its best-sourced pace finding says fewer turns before the shot, which a counted backcourt works against.

---

## 2. One free off-ball move plus a ball action in one offensive turn

**For.**
- Marvel's Midnight Suns (verified, PlayStation Blog and Twinfinite, lens-tactics.md): one move per turn for the whole team, free, then the card plays, which are where the cost lives. The lens called it "the owner's law in someone else's game" and "the honest argument for B." His turn is that turn.
- V0.md D33 (verified on the game's own turn-economy check): the shipped rule since 08-11 is a free step that draws no slide, then a main action that draws exactly one, and "the one-for-one exchange measured fair on 08-10." His turn is the shipped turn with the phase ladder gone. DESIGN.md section 4, classic rule 1, "after each offensive action, slide one defender one square," is the same shape.
- Blood Bowl, Finding 4 (verified): safe moves first, the gamble last. Inside one of his turns, the off-ball move should come before the ball action for the same reason. Blood Bowl also rations move-then-act to once a team turn as the Blitz (verified, the 2020 cheat sheet, lens-sports.md section 5); its Pass action lets the thrower move before throwing (from memory). So "move, then do the one risky thing" is the shape Blood Bowl plays.

**Against.**
- Midnight Suns pays for its move-plus-actions turn with a whole enemy turn (verified). lens-tactics.md: "With a one-step defense, move-then-shoot in one turn leaves the step with nothing to answer." His answer is to give the defense more than a step (element 3), which is why the two elements have to be judged together.
- Hoop Tactics on itch.io (verified, fetched, design/archive/d37-workflow-return-2026-08-12.md Findings 3): "While playing offense you can Move and Shoot or Pass once per turn," mirrored by "On Defense you can Move and attempt to steal the ball once per turn." That is his grammar word for word, and it is the one place the archive has it. Both basketball prototypes with this shape stalled at prototype. The raw return is honest: "two data points, not proof." A jam game stalls for many reasons. It is still the only shipped or half-shipped example of his exact turn, and it is not encouraging.
- design/possession-flow-2026-09-05/concept-twobeat.md, weaknesses (design reasoning): a two-part offensive turn gives the defense one decision for every two of the offense's, "the number to measure in the first hot-seat games."
- Ambiguity the archive cannot resolve: whether a turn that is only an off-ball move (no pass, crossover or shot) still counts toward the three, and whether the free move must come before the ball action. He said the turn "is used up" on a pass, crossover or shot; he did not say what a move-only turn costs.

**Verdict: supported (Midnight Suns, the shipped D33 economy), with the defense's answer as the half that decides whether it stays fair.**

---

## 3. The defense getting a move plus an action

**For.**
- Kill Team's Counteract (verified, spot-checked at Wahapedia, d37 Q1): one free capped action after each enemy action, taken with full information, "reads as fair not because it matches volume but because it moves LAST with full information." His defensive move sits after the offensive turn and sees everything. That half is the archive's adopted shape.
- Blood Bowl, corrected (verified, 2020 rulebook and skills page, d37 preamble): the defending coach does make choices during the offense's turn: nominating the interceptor, Dump-Off, Diving Tackle. So "the defense chooses something while the offense plays" has a shipped home; the archive's original claim that it had none was refuted.
- design/22af-findings.md, A7 (design reasoning): if the waiting player disengages, "give the DEFENDER something to do." A steal attempt is something to do.
- The mid-beat ban is not broken. d37's standing rule is no prompts to the defender DURING the offense's input (Blood Bowl 3's bleeding point, DreadBall's Run Interference, both in d37 Q1). His defensive turn is between offensive turns, not inside one. It is the Counteract timing, not the interrupt timing.

**Against.**
- Counteract is ONE action (verified). Kill Team's parity device is one thing per enemy action, not a move and a second thing. The archive adopted one; it never studied two.
- Into the Breach (verified store page and Steam threads, d37 Q2): under a 15-second beat "the informed reaction needs a SMALL legal-option set; one defender, 1-2 squares, is right-sized," because an informed reaction with many options "imports the paralysis into a timed game" (a snippet has a player spending "5 minutes per turn with pen and paper"). Adding pick-a-lane or attempt-a-steal on top of the move widens the set every defensive turn. The panel's own defensive clock proposals (8 seconds, MEMO.md section 4 item 2) were sized for one step.
- Hero Academy (thin, snippet-level, d37 Q2): multi-action turns were bearable only with a confirm button and a rewind, a tax in taps the archive says "our 15-second beat forbids." A two-part defensive turn under a short clock is the shape that needed an undo.
- Magic Arena (thin, snippet): the complaint is about being offered a window at every moment. His windows always contain a move, so the complaint does not map cleanly; but the count of windows is the highest of any drawn flow (see element 1). critique-actionpoints.md flaw 9 dinged concept C for walking into "several small reaction windows" without saying so. His proposal should say so out loud.
- A steal attempt is a card. design/22af-findings.md A4 (verified): trim the stops per possession; BUILD.md 22y counted eleven stops in the shipped possession. A card on the defensive turn is a new stop, up to six a possession under the cap. And during that card the OFFENSE is the one waiting, a symmetric wait the archive never measured; every wait it measured was the defense's.
- Hoop League Tactics (verified, App Store page fetched, lens-sports.md section 7): "you can neither dribble nor pass without risk of having the ball stolen," making it "annoying to play." A steal available every defensive turn recreates that unless it costs. He has agreed it costs (the blow-by cut), which is the one thing standing between his rule and that complaint.
- Hoop Tactics on itch.io, again: move plus steal per defensive turn is exactly this, and it stalled (verified existence, weak inference).

**Verdict: the move is supported (Counteract, D33 measured fair). The action on top is unstudied except for one stalled prototype. The archive's real warnings are the size of the option set (Into the Breach) and the stops per possession (A4), not the mid-beat ban, which this does not break.**

---

## 4. The pass-lane steal, picked in secret

First, his question: it is not in the game. It is his own 07-23 idea, filed as BUILD.md idea bank item 13 (lane-guard steals: "special players can secretly pick a passing lane on their defensive turn... a pass down that lane triggers an interception challenge the passer can answer back") paired with item 14 (the no-look pass counter), rolled into TODO.md row 187, online-first because it needs hidden input. Today a pass through a defender's reach or off a pressured passer costs the passer a question, and that is all.

**For.**
- The archive's own carve-out (verified, design/archive/d37-workflow-return-2026-08-12.md Findings 2): XCOM's overwatch was rejected as the primary mechanic, then: "ADAPT later, at most, as a special deny stance set during your own possession at an overwatch-style penalty." A rationed, costed lane pick for special players is that sentence.
- Sirlin's Yomi test (verified, sirlin.net, d37 Q4): rock paper scissors is fine when "way different payoffs" attach to each option. Lane pick against no-look pass, with the defender yanked to the wrong tile when he bites (item 14), is a pair with different payoffs.
- Madden's coverage disguise (verified, 1v1me blog, d37 Q4): a bounded hidden layer on top of an honest visible base, allowed only "as a scarce earned resource, never free." That is the archive's rule for how much hiding a visible-defense game can carry.
- Blood Bowl's interception (verified, 2020 rulebook via the d37 correction): the defending coach nominates the interceptor WHEN the pass is thrown, with full information. That is a pass-lane steal that is not blind. Nobody in the archive weighed it as our shape. It is the third option his message does not name: pick the lane after the pass is called, not before.

**Against.**
- XCOM overwatch (verified, wiki and Steam thread, d37 Q2): a blind commitment "must be penalized or it dominates," and once penalized "it feels wasted"; "overwatch creeping across the map is boring and ludicrously effective." His lane pick is overwatch's exact shape: set after seeing the board, blind to the offense's next choice. The verified condition is that it needs a penalty, and the verified risk is that with the penalty it feels like a wasted turn. How strong: verified, but the raw return admits "the pre-commitment column therefore rests on the XCOM evidence alone" after tower-defense and Clash of Clans searches came back empty. One game, one thread, pointing one way.
- Tecmo Bowl (two writeups, medium and tecmobowl-vs-rbi, d37 Q4): hidden picks become "basically a game of Rock, Paper, Scissors." The archive rejected hidden simultaneous calls by name and DESIGN.md section 3 locks the defense's pick as visible. A secret lane is not simultaneous, but it is the first hidden thing in a defense the research built to be honest and coarse.
- Slay the Spire's honesty rule (verified thread, d37 Q4): a telegraph that can be caught lying destroys the contract. A secret is not a lie, so this is a tension, not a contradiction, but it means the visible defense and the hidden lane have to be drawn so a player never feels the board lied.
- Hoop League Tactics (verified): a steal risk on every pass is "annoying." His lane pick puts the risk on one lane of four, and a wrong pick costs the defender, two differences from Hoop League Tactics where the risk was on every pass and cost the defense nothing. It recreates the complaint only if the pick is free and available every turn.
- Hidden input needs online play or a pass-the-phone moment (BUILD.md item 13's own note). On one shared phone it does not exist.

**Verdict: contradicted as a free, every-turn option (XCOM verified, Tecmo, Hoop League Tactics); supported as a costed, rationed, signature thing (the archive's own "adapt later," Sirlin, Madden's scarce disguise). Blood Bowl's informed interception, choosing the lane when the pass is called, is unstudied and may be the cleaner version.**

---

## 5. A free pass after a blow-by outside shot range

**For.**
- Persona 5's Baton Pass (One More verified on Wikipedia; Baton Pass from memory, lens-rpg.md): the extra action can be handed to a teammate. lens-rpg.md already said "the One More can be spent on PASS, and the pass ends it." His rule is that sentence with a range condition.
- Blood Bowl Finding 1 (verified): the defense makes actions cost more, never impossible; a beaten first line that leaves the pass open is the tax working as designed.
- DESIGN.md line 79 already has a family for a pass that skips its card: "elite passers get limited no-look passes (skip the card)." So a card-free pass exists in the rules as an earned thing.
- lens-sports.md cut 2: a wrong steal answer gives "one free tile past the reacher, with no defensive answer." The blow-by as a reward already has two homes in the panel; his adds a third.

**Against.**
- lens-rpg.md's chain warning (design reasoning): "drive, pass, drive, shoot with the defense watching" is the exact thing he was afraid of on 09-05. His rule ends the turn after the pass, so the chain stops, provided the receiver cannot also shoot in that turn. He did not say.
- "Free" is not defined. Today a pass through a reach or off a pressured passer costs the passer a question. Free could mean no card, or no defensive answer, or both. Baton Pass gives the RECEIVER a bonus; his gives the passer a free throw of the ball and the receiver nothing until the next turn. The archive has no game that rewards a beaten man with a free pass specifically.
- "Outside shot range" needs a line on the board. The archive has no number for it.

**Verdict: supported by analogy (Baton Pass, from memory), unstudied as a rule. It needs a spec before a paper test, not more research.**

---

## 6. One More, with a standing big man still contesting

**For.**
- Persona 5 (verified, Wikipedia): strike a weakness, earn an extra action before the enemy moves. lens-rpg.md put it on his desk; he has taken it.
- design/22af-findings.md Finding 3, Blood Bowl (verified, two guides word for word): good defense is two lines deep, "the DEPTH is what stops you." His standing big man is the second line. The archive's own defense finding says that is where a beaten first line gets answered.
- Finding 1 (verified) and Aaron's 08-02 ruling 6: a contested shot is priced, graduated by bodies nearby, never blocked. A blow-by shot into a big man is a harder card, not a forbidden one. Consistent.
- Octopath Traveler's Break (verified, Wikipedia, lens-rpg.md): the beaten man loses his next turn, and it "reads fair when the condition is visible." His "people can build strategy around that understanding" is the same point: the contest condition must be readable before the drive.
- Slay the Spire's honesty rule (verified): the price of the next thing drawn before you choose. The big man's tile has to show that a blow-by toward it is still contested.
- Fire Emblem's counterattack and Paper Mario's guard press (lens-tactics.md, lens-rpg.md; the guard press verified on Super Mario Wiki): the target answers at the moment of the hit. The block card the standing big man holds is that, and the archive already accepted it as the waiting side's one reflex.

**Against.**
- concept-twobeat.md (design reasoning) proposed retiring the block card because it is "a prompt to the non-acting player in the middle of the other side's beat." d37's standing rule kept the question and the slide as the defender's input and the shipped block card lives inside the card beat. Not a contradiction of the research, but a live disagreement inside the panel about whether the contest should be a card or only a price.
- Nothing in the archive says how often a One More shot gets contested on a tile court, or what the offense does once it learns to drive away from the big. That is a number for the paper test.

**Verdict: supported (Finding 3's depth, Finding 1's tax, Persona, Octopath), no contradiction on file.**

---

## 7. Setups picked at each team's first offense and first defense

**For.**
- design/d37-defense-findings.md Q4 (verified: Tecmo writeups, Slay the Spire thread, Into the Breach postmortem) and DESIGN.md section 3: the defense picks first and its pick is shown; hidden simultaneous picks rejected by name. His rule fits IF, at each of the two moments, the defense reveals before the offense picks: after the tip, the team without the ball picks its defense, the team with the ball picks its offense seeing it; on the first flip, the same in reverse.
- Gloomhaven (rule-level, no complaint thread found, raw return Findings 4): whoever commits blind "eats the feel-bad," so "defense calls first BY DESIGN and is compensated with commitment power." The archive's answer to his 09-05 "blind or sighted" question is on file: sighted, defense first.
- design/22ai-findings.md (verified, per scout.md section 1a): everything visible, one tap, no two-hop tree; the count was loosened by row 238 because the pick is rare.
- Madden (from memory, lens-sports.md): the pre-snap adjustment ladder is the tap-tap-tap complaint at scale; pick-once keeps it out. His correction keeps pick-once.
- This also settles the 08-16 contradiction (scout.md section 5 item 2, "no pick after the jump ball") more cleanly than 09-05 did: the pick is not "after the tip," it is at each side's first possession, which is a dead-ball moment for the team on offense and a first-look moment for the team on defense.

**Against.**
- Unstudied: a setup pick that lands mid-game at the first flip is a stop the shipped game does not have. A4 says trim stops; once a game is cheap, but no game in the archive was read for how it presents a one-time mid-game pick.
- Unstudied: the information is uneven. The second team picks its defense having seen the first team's offense AND defense; the first team picks its defense having seen only the second team's defense. Nothing on file weighs that.
- Unstudied: how the hand-off and the pick screen read on a phone at that moment (scout.md section 3, the question about chess apps and phase banners, never asked).

**Verdict: supported, on the condition that defense-first-and-visible holds at both moments; the mid-game stop and the uneven information are unstudied.**

---

## The four places he asked for special care

**Football Tactics and Glory versus his shape.** Football Tactics and Glory alternates whole-team blocks: one side takes three actions in a row (move, pass, dribble, tackle, shoot, on any players), and during that block the other side does nothing but watch its zones fire automatically; the block ends on the third action or a shot, then the other side gets three. His shape alternates every turn: one offensive turn (one off-ball move plus one ball action), then one human defensive turn, then again, with three offensive turns as the cap. So the two complaints attached to Football Tactics and Glory, the wait (thin, search snippets of three reviews, lens-sports.md) and the luck (verified, Destructoid's "more reliance on luck than strategy," d37 Q5), attach to the two things his shape does not have: three unanswered actions and an automatic defense. What survives from that game for him: the visible counter of three is praised as learnable (thin), and "if you don't score within those three turns, the other team takes over" (thin) is the nearest shipped turn-count shot clock. One honest note on the archive itself: lens-sports.md retired concept C on this game's evidence, and MEMO.md repeats "C retired on evidence." C's three moves were each answered by a slide, so the analogy failed in the one respect that matters. C was retired on an analogy, not on evidence; the same caution applies to anyone who cites Football Tactics and Glory against his cap.

**Blood Bowl's turnover versus his turn end.** In Blood Bowl a whole team turn ends the moment any risky action fails (verified, rulebook). Safe moves are free precisely because the gamble might end everything, and that risk is what makes "safe moves first" a skill. His turn ends by rule after the ball action, succeed or fail; only a wrong card ends the possession (a live ball, as today). So he keeps Blood Bowl's turnover at the possession level and drops it at the turn level. What he loses: Finding 4's "every piece moves every turn," because one off-ball move a turn under a three-turn cap gives at most three off-ball jobs per half-court trip. Finding 5 (verified consensus) wants off-ball pieces to have a job each turn and an open-man bonus; under his cap the play picked once has to do most of that work, which is the same conclusion critique-actionpoints.md Lens 3 reached about C.

**The defense research's rule against several small windows and mid-beat prompts.** A defensive move plus a steal attempt in one turn does not break the mid-beat rule: the turn sits between offensive turns, which is the Counteract timing the archive adopted, not the Blood Bowl 3 interrupt it rejected. It does walk into "several small reaction windows," with up to six windows a possession under the half-court count, and that finding rests on snippet-level sources (scout.md section 2 says so plainly: "the strongest warning against the 09-05 direction rests on the weakest sourcing in that file"). What is verified and does bite: Into the Breach's warning about the size of each window's option set under a clock, and A4's stops-per-possession, because a steal card on the defensive turn is a new stop and it makes the offense wait, which nobody has measured.

**XCOM overwatch and Tecmo Bowl versus the secret lane.** The lane pick is overwatch's shape exactly: set with the board seen, blind to the opponent's next choice. The archive's finding is verified (wiki plus a Steam thread) but single-game, and the raw return says the whole pre-commitment column rests on it. The finding's two halves both matter here: unpenalized it dominates; penalized it "feels wasted." Tecmo's rejection is about hidden AND simultaneous picks (two writeups); his lane is hidden but sequential, which the archive never studied on its own. The archive's own escape hatch is the "adapt later" sentence: a special deny stance at a penalty. And Hoop League Tactics' verified complaint attaches only if the lane pick is free and always available; his steal-costing cut is what keeps it from being that.

---

## Verdict table

| Element | Best evidence for | Best evidence against | Rating of the deciding evidence | Verdict |
|---|---|---|---|---|
| Three-turn cap as shot clock | 22af A4 fewer turns to the shot; Blood Bowl gamble-last; the C critique's own fix | 22af A4 shrink distance (the backcourt count adds turns); C critique: rearranges, does not shorten | A4 verified; the number three unstudied | Supported in shape; number unstudied; backcourt count contradicted unless short |
| Half-court reset | critique-actionpoints flaw 2, his rule in other words | Every concept skipped the walk-up for pace | Design reasoning both ways | Unstudied; the fix for the fast break, the cost for dead balls |
| Off-ball move plus ball action | Midnight Suns; V0 D33 measured fair | Midnight Suns pays with a whole enemy turn; itch prototypes stalled | Verified both sides | Supported, conditional on the defense's answer |
| Defense move | Kill Team Counteract; D33 | none | Verified | Supported |
| Defense action on top | 22af A7 something to do; Blood Bowl's real reactions | Counteract is one action; Into the Breach option-set size; A4 stops; Hoop League Tactics | Verified against, thin for | Unstudied; the archive leans against a second thing every turn |
| Secret pass-lane pick | d37's "adapt later" carve-out; Sirlin; Madden's scarce disguise; his own filed items 13 and 14 | XCOM overwatch; Tecmo; Hoop League Tactics; visible-defense lock | XCOM verified, single game | Contradicted as a free every-turn option; supported as a costed signature skill; Blood Bowl's informed interception unstudied |
| Free pass after a blow-by outside range | Baton Pass; DESIGN.md no-look family | Chain warning; "free" undefined | From memory | Supported by analogy, unstudied as a rule |
| One More with a standing contest | Persona; 22af Finding 3 depth; Finding 1 tax; Octopath Break | Panel disagreement on the block card | Verified | Supported |
| Setups at first offense and first defense | d37 Q4 defense first, visible; Gloomhaven; 22ai one tap | none on file | Verified | Supported if defense reveals first at both moments; the mid-game stop unstudied |

---

## The three questions the archive cannot answer, and what would

**1. Does a possession of up to six exchanges, each side of half court, with two-part turns on both sides, feel like chess or like ping-pong, and what does it cost in hand-offs and seconds?** No game in the archive alternates two-part turns under a turn cap; the nearest, Hoop Tactics on itch.io, stalled before anyone measured it. A paper playtest answers this fastest: a printed court, two people, ten possessions, count hand-offs, taps and seconds per possession with the backcourt count on and then off, and note the first time either player says "again?" Games worth an hour each if a run goes out: Blood Bowl 3 (its turn timer and turn counter in play), Football Tactics and Glory on phone (seconds per action and how the pips read), a chess app with a move clock (the only shipped alternating game with a per-move clock and no possession).

**2. Does a secret lane pick with a cost read as a read or as a guess, and how often does it fire?** The archive has XCOM alone on blind commitment, Tecmo on hidden simultaneous picks, and Blood Bowl's informed interception unweighed. Paper playtest: the defender writes the lane on a slip each turn, count fires, misfires, and whether the offense changes its passing by possession five; then run the same possessions with the Blood Bowl version, the lane chosen after the pass is called, and compare. Games to study: Blood Bowl 2020's interception and Dump-Off rules, Madden's disguise shells, Space Hulk's command points (the raw return named it as the other pre-commitment game and never read it), Frozen Cortex (simultaneous planning, zero hits in the repo), Gloomhaven.

**3. What should the defense's turn contain, one thing or two, and what does a steal card on the defensive turn do to tempo?** The archive has one action (Kill Team) and one prototype with two (Hoop Tactics). Paper test: the same ten possessions three ways, defense move only, defense move or action, defense move and action; count stops, count who waits and for how long, and ask the offense afterward whether the steal felt like a gamble or a tax. Games to study: Kill Team's Counteract in a recorded game, DreadBall's Run Interference (snippet-only in the archive), Blood Bowl's interceptor nomination, and Hoop League Tactics' offense side, which the archive has never read even though it is the closest cousin.

One last note for the record. His observation about the clock is correct against the code: the 24 restarts every turn and nothing caps a possession. The archive saw the hole (scout.md section 5 item 8) and left it to him. The turn cap is one fix; a possession clock that only runs on the offense's turns (concept-chess, concept-pokemon, concept-matchup, all design reasoning) is the other; the two are not exclusive, and the C critique's flaw 3 argued for both at once.

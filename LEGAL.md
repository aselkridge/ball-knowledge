# LEGAL.md · legal findings and open questions (one home, updated in place)

**What this file is.** The single reference home for legal findings about Ball
Knowledge: naming, player identities, trademarks, right of publicity, and
whatever else surfaces. Raised by Aaron 2026-08-12 after a conversation with
his lawyer friend: *"all of this should be documented as findings... legal
findings and things like that need to be something that we can reference very
easily."*

**What this file is NOT.** Legal advice. Nothing here is from a retained
attorney. Aaron's friend was explicit that he was giving a generalized
opinion and still needs to do research; the case notes below were compiled by
an AI assistant from public sources and verified against the linked pages on
the date shown, but reading cases is not the same as applying them. Before
any release beyond the twenty testers, and before any money moves, a real
attorney reads this file and rules.

## The ruling in force (Aaron, 2026-08-12)

**"For the release to the twenty, I'm gonna keep the path."** League names
(NBA, WNBA, BIG3) stay in the league picker, player names stay in packs and
play-by-play popups, for the private release to the twenty testers. The
naming decision for anything bigger is OPEN and gated on real legal review.
The action item lives in BUILD.md § 5 so `open-items.py` sees it.

## The concerns raised (2026-08-12, from the lawyer friend's first read)

1. **League names under a "league" selector.** Selecting NBA / WNBA / BIG3
   under the word "league" may create a licensing problem; first thought to
   be a logo issue, suspected to be more than that.
2. **Player names outside the trivia itself:** rolling packs, and the
   play-by-play popups that name who passes to whom.
3. **Suggested fixes floated:** seek approval from the NBA and the players
   union, or genericize ("men's professional basketball" instead of NBA, no
   player rolling). Aaron's read, recorded because it is a design constraint:
   genericizing "kills the game", the game exists to teach the real history.
4. **Aaron's fallback theory:** not monetized, factual history, worst case a
   cease and desist. Plus his own catch that wrong facts could carry their
   own risk, so tiering and ranking must be impeccable.

## What the case law actually says (compiled and link-verified 2026-08-12)

### Finding 1 · Names plus stats, unlicensed, in a commercial game: litigated and WON
**C.B.C. Distribution & Marketing, Inc. v. MLB Advanced Media, L.P., 505
F.3d 818 (8th Cir. 2007), cert. denied 553 U.S. 1090 (2008).** A fantasy
baseball company used MLB player names and statistics with NO license. The
players' association claimed right of publicity. The Eighth Circuit held the
players' publicity rights WERE implicated, and were OUTWEIGHED by the First
Amendment because the names and statistics are information in the public
domain. The Supreme Court declined to disturb it. This is the closest case
in existence to "a game built on real players' names and factual records",
and the unlicensed side won it while charging money.
https://law.justia.com/cases/federal/appellate-courts/ca8/06-3358/063357p-2011-02-25.html ·
https://harvardlawreview.org/print/vol-121/eight-circuit-holds-that-the-first-amendment-protects-online-fantasy-baseball-providers-use-of-baseball-statistics-in-the-public-domain-ae-c-b-c-distribution-marketing-inc-v-major-lea/
A district court later applied the same logic to football (CBS Interactive
v. NFLPA, D. Minn. 2009; not independently verified this session, flagged).

### Finding 2 · Where sports games LOSE: recreating the player, not naming them
**Hart v. Electronic Arts, 717 F.3d 141 (3d Cir. 2013)** and **Keller v.
Electronic Arts (In re NCAA Student-Athlete Name & Likeness Licensing
Litigation), 724 F.3d 1268 (9th Cir. 2013).** EA lost both, and note what EA
was doing: building playable AVATARS with the player's height, weight, skin
tone, jersey number, hometown and playing style, WITHOUT even using names.
The courts held recreating the persona is not transformative and the First
Amendment does not save it. The line the two case families draw together:
**stating facts about a real player is protected; simulating the player is
not.** Ball Knowledge's pieces are anonymous position markers and its player
usage is factual (names, records, history), which is the protected side of
that line, and this separation is now a design law: no likenesses, no
photos, no signature-move simulation, ever.
https://www.studicata.com/case-briefs/case/hart-v-elec-arts-inc ·
https://www.quimbee.com/cases/in-re-ncaa-student-athlete-name-and-likeness-licensing-litigation-keller-v-electronic-arts-inc ·
https://btlj.org/2014/12/the-right-of-publicity-likeness-lawsuits-against-video-game-companies/

### Finding 3 · Using a league's NAME to refer to the league: nominative fair use
**New Kids on the Block v. News America Publishing, 971 F.2d 302 (9th Cir.
1992)** created the three-part test that governs using someone's trademark
to REFER to them: (1) the thing is not readily identifiable without the
mark (there is no way to ask an NBA history question without saying NBA);
(2) use only as much of the mark as necessary (the word, never the logo,
never team trade dress); (3) do nothing suggesting sponsorship or
endorsement. Trivia products, almanacs and sports books use league names
unlicensed under exactly this doctrine. The friend's instinct that "it's
more than a logo issue" is half right: the WORD is usable referentially,
and the risk concentrates in prong 3, anything that implies the league is
behind the product.
https://en.wikipedia.org/wiki/Nominative_use ·
https://www.americanbar.org/groups/intellectual_property_law/publications/landslide/2021-22/march-april/nominative-trademark-use-affirmative-negative-defense-infringement/

### Finding 4 · Two corrections to the framing, both cut against comfort
- **"I'm not making money off this" is NOT a shield.** CBC was a paying
  commercial product and won anyway; the shield was the First Amendment,
  not non-profit status. Conversely, trademark and publicity claims do not
  require the defendant to profit. Free distribution lowers damages and
  temperature, not liability. Do not lean on it.
- **The defamation worry is the smallest of these, not the biggest.** A
  wrong stat about a public figure is almost never defamatory: it needs a
  false statement of fact that harms reputation, and public figures must
  additionally prove actual malice (New York Times v. Sullivan, 376 U.S.
  254 (1964)). "The game said my rookie year was 1998 and it was 1997" harms
  nobody's reputation. Accuracy is a PRODUCT standard here (and the bank's
  verification pipeline is already built for it); it is not the legal
  exposure. https://en.wikipedia.org/wiki/New_York_Times_Co._v._Sullivan

### Finding 5 · The genuinely grey zone, named honestly: the PACKS
The trivia content is the strong ground. The league picker is strong ground
worded referentially. The greyest use is rolling PLAYERS as collectible
pack contents, because there the name is not conveying a fact, it is
functioning as a game asset. Two pulls in opposite directions: fantasy
sports (CBC) also lets you draft and "own" real players and is protected;
trading card companies (Topps, Panini) license names, but they print
PHOTOS and likenesses, which Ball Knowledge never does, and a name-only,
no-image, stats-linked card sits between the two precedents. This is THE
question for the real attorney, ahead of all others.

## Practical mitigations that do not kill the game (ready when wanted)
1. **Never any logos, team trade dress, player photos or likenesses.**
   Already the design; now recorded as load-bearing legal posture.
2. **A disclaimer surface**: "Ball Knowledge is not affiliated with,
   sponsored by, or endorsed by the NBA, WNBA, BIG3, or any player or
   players association; league and player names are used to identify the
   factual subjects of trivia questions." Directly serves New Kids prong 3.
   Cheap to add; worth shipping even for the twenty.
3. **Marks in content, never in identity**: league and player names stay
   inside gameplay and questions; the game's own name, icon, branding and
   any store listing stay clean of them.
4. **The credits economy already never touches real money** (DESIGN.md
   § 11), which keeps the packs question in its least-inflamed form.
5. **Revisit gates**: real legal review BEFORE any public/store release,
   and AGAIN before any monetization.

## Open questions for the real attorney (the friend's research list, plus ours)
1. The packs question (Finding 5), framed exactly as written there.
2. Which state's right-of-publicity law governs, and does it have a
   statutory carve-out for factual/newsworthy use.
3. Does the league picker wording need to change from "League: NBA" to a
   referential form ("Questions about: the NBA"), or does the disclaimer
   carry it.
4. App-store marketing rules if the game ever ships as an app: stores have
   their own IP takedown regimes that are cheaper for rightsholders than
   lawsuits, and a C&D-shaped complaint there can delist first and ask
   questions later.
5. Whether BIG3 (smaller, newer) and the WNBA differ from the NBA in any
   way that matters.

## Log
- **2026-08-12** · File created. Friend's first-read concerns recorded;
  Aaron's keep-the-path ruling for the twenty recorded; five findings
  compiled and link-checked; mitigations proposed (disclaimer surface
  recommended even for the twenty); attorney question list drafted.

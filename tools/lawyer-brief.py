#!/usr/bin/env python3
"""The document Aaron hands to his lawyer friend.

    python3 tools/lawyer-brief.py <out.html>

Why this exists
---------------
Aaron, 2026-08-07: *"I also have a lawyer friend, if I come to him with a
questions and a document to read to give me information, what can I give him,
can you spin up a doc?"*

WHO IT IS FOR, and it sets every choice on the page: somebody qualified, doing a
favour, with limited time. That means three things. **Ranked questions**, so if
they answer only the first two the most valuable ground is covered. **Every
clause quoted verbatim with its URL and the date it was read**, so they never
have to take our word for what a document says or go and fetch it themselves.
And **what we already believe**, stated plainly under each question, so they can
correct a position rather than build one from nothing, which is much faster.

THE QUOTES ARE PULLED FROM THE RESEARCH FILE, NEVER RETYPED. Transcribing a
licence clause by hand into a document destined for a lawyer is exactly the
error this project keeps writing rules about, so the script reads
research-v29b-licensing.json and fails if it cannot find a document it expects.

DESIGN, and it is a deliberate departure. Every other page in this repo wears
the game's face. This one is read by a professional, possibly printed and
annotated, so it takes Archivo for headings (the house tie) and a system serif
for body text, which is what long prose and paper both want. There is a print
stylesheet for the same reason. Matching the treatment to the audience beats
matching it to the other pages.

NOT LEGAL ADVICE and it says so on its face, twice: the deliverable is what
documents say plus what we currently assume, so a qualified person can correct
the assumptions.
"""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
RESEARCH = ROOT / 'docs/play/data/research-v29b-licensing.json'

# --- the project, in the facts a lawyer would ask for first ------------------
FACTS = [
    ('What it is', 'A turn-based basketball trivia game. You draft a squad and '
     'answer questions to take shots. Browser-based, no app store.'),
    ('Who runs it', 'One person, in the United States, as a personal project. '
     '[AARON: add your state, it changes the right-of-publicity answer.]'),
    ('Money', 'None. No purchases, no advertising, no subscription. The in-game '
     'economy is credits with no cash value and no way to buy or cash them out.'),
    ('Who can play it today', 'Nobody. It is about to go to roughly twenty '
     'friends for feedback. It is not linked publicly and not indexed.'),
    ('Size of the database', 'About 1,500 facts, of which 318 have passed '
     'verification and are in play.'),
    ('What makes it unusual', 'Every individual question carries the URL it was '
     'proved against, a rating of that source’s reliability, a confidence '
     'level, and the date a person read it. Not a credits page. Per card.'),
    ('How facts are gathered', 'A person opens a page, reads it, and writes one '
     'question from it. No crawling, no bulk download. Automated fetches are '
     'rate-limited well below the published ceilings and every page is cached '
     'so a repeat costs the source nothing.'),
    ('Where the facts come from', 'Across the 318 live cards: Basketball-'
     'Reference (199 citations), NBA and WNBA official sites (116), news and '
     'archive publishers such as ESPN and the Naismith Hall of Fame (78), and '
     'Wikipedia (74). Cards often cite more than one.'),
    ('AI involvement', 'The project is built with an AI coding assistant. The '
     'assistant also helps check facts: it reads a source page and confirms the '
     'answer matches before a question is accepted. No model is trained on '
     'anything, and no question ships without a person in the loop.'),
    ('What it publishes', 'Questions written in our own words, each with a link '
     'back to its source. No source’s sentences are copied or stored. There '
     'is no browsable statistics table and no bulk export of the database.'),
]

# --- the questions, ranked by what they unblock -------------------------------
Q = [
 ('Are we bound by terms we never clicked — and did reading them carefully '
  'make our position worse?',
  'Every site here uses browsewrap: terms linked in a footer, no account, no '
  'checkbox, nothing to agree to. We have now read Sports Reference’s terms '
  'in full, deliberately, and written the quotes into our own repository.',
  'We assume browsewrap is weakly enforceable in general, but that ACTUAL '
  'NOTICE is the thing that changes it, and we have just given ourselves actual '
  'notice by doing the responsible thing.',
  'If actual notice binds us where it would not bind a casual reader, that is '
  'worth knowing before we decide anything else on this list, because it is the '
  'foundation the other questions sit on.'),

 ('Does a clause prohibiting use of content for “prompting, or instructing '
  'artificial intelligence models” reach a person who uses an AI assistant '
  'to CHECK a fact they are reading?',
  'This is the live question and the reason for the whole document. Sports '
  'Reference’s terms were updated in May 2023 to add that language. The '
  'project’s normal method is: a person opens the page, the assistant reads '
  'it alongside them, and it confirms the number before the question is '
  'accepted.',
  'We believe the clause is aimed at bulk training and automated generation, '
  'not at a person verifying one fact. But we genuinely cannot tell from the '
  'wording, which is why we stopped rather than assumed.',
  'If it reaches us, verification becomes a person-only job on that site: '
  'slower, and a real change to how the project works. Nothing already banked '
  'would be affected either way — those facts are already proved and dated.'),

 ('Where is the line on “material substitute”, and is a cited trivia '
  'bank on the safe side of it?',
  'Sports Reference prohibits using their content to create a database that '
  '“competes with or constitutes a material substitute” for their site. '
  'They separately and expressly welcome sharing and repackaging data from '
  'individual pages, commercially included, as long as they are credited.',
  'We read that as a SUBSTITUTION test rather than a volume test. A quiz that '
  'asks “who led the league in rebounds in 1987” is not somewhere you '
  'would go INSTEAD of Basketball-Reference; a mirror of their season tables '
  'would be.',
  'If the line is really about volume rather than substitution, then the '
  'long-term plan — the most complete basketball database anywhere — '
  'needs rethinking now rather than at ten thousand facts.'),

 ('Should we write and ask them — or does asking make things worse?',
  'A letter is drafted and unsent. It describes what we do and asks whether it '
  'is welcome. Sports Reference’s own terms route disputes through written '
  'notice and negotiation before litigation.',
  'We are split. Asking converts a probable yes into a written yes. It also '
  'makes a project visible that is currently invisible, and a “no” in '
  'writing binds the person who asked in a way it does not bind the thousands '
  'who never did.',
  'This is the one question where a practitioner’s instinct is worth more '
  'than any amount of reading, and it is the decision immediately in front of '
  'us. The draft letter can be supplied if useful.'),

 ('Real players’ names and real team names in trivia questions — what '
  'is the exposure, and is C.B.C. v. MLB Advanced Media still good law?',
  'Every question names a real person. Many name a real team. There are no '
  'player photographs, no likenesses, and no player or team marks in the icon, '
  'the artwork, or any promotion.',
  'We believe factual use of names and statistics is protected, largely on the '
  'strength of C.B.C. (8th Cir. 2007), and that right of publicity varies '
  'considerably by state. We found no case anywhere about a trivia or quiz '
  'game specifically.',
  'The state variation is the part we cannot assess ourselves, and it is the '
  'one item on this list that scales with success: it barely matters at twenty '
  'players and matters much more at twenty thousand.'),

 ('What changes when this stops being twenty friends?',
  'Today: unlisted, free, no money anywhere. Plausible futures: public and '
  'free, public with cosmetic purchases, or an app store listing.',
  'We assume the private-to-public step matters more than the free-to-paid '
  'step, and that an app store listing introduces a reviewer who applies '
  'stricter rules than the law does.',
  'We would rather build in whatever the public version needs NOW than '
  'retrofit it. Cheap today, expensive later.'),

 ('Given all of the above, is there anything we should be doing structurally '
  'that is cheap now and expensive later?',
  'The project already carries per-card attribution with a link back, keeps '
  'question text original, and stores no source’s sentences.',
  'We do not know what we are missing. This is the open question and the most '
  'useful one if you have time for only one more.',
  'Concrete practices beat principles here: what to put in a footer, what to '
  'never extract, what to write down now.'),
]

# --- which quoted documents go in the appendix, and why each one is there -----
APPENDIX = [
    ('https://www.sports-reference.com/termsofuse.html',
     'The central document. Contains both the permission we rely on and the two '
     'clauses in questions 2 and 3.'),
    ('https://www.sports-reference.com/data_use.html',
     'Their own plain-language gloss on the same terms.'),
    ('https://www.sports-reference.com/sharing.html',
     'Included for balance: the most permissive thing they publish anywhere.'),
    ('https://www.basketball-reference.com/robots.txt',
     'What they tell automated clients, as distinct from what the terms say.'),
    ('https://www.nba.com/termsofuse',
     'The second restrictive class. Relevant to questions 3 and 5.'),
    ('https://www.wnba.com/terms-of-use',
     'Materially different from the NBA’s in places.'),
    ('https://www.wikidata.org/wiki/Wikidata:Licensing',
     'The permissive alternative, for contrast. CC0.'),
    ('https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use',
     'Section 7 waives database rights outright, which bears on question 3.'),
]

ALREADY = [
    'Read and quoted 94 documents on 2026-08-07, including all the terms, '
    'robots.txt files and data-use pages above.',
    'Read the leading authorities we could identify: Feist (1991), NBA v. '
    'Motorola (2d Cir. 1997), C.B.C. v. MLBAM (8th Cir. 2007), Specht (2d Cir. '
    '2002), Nguyen v. Barnes & Noble (9th Cir. 2014), Van Buren (2021), hiQ v. '
    'LinkedIn, and the EU database directive with British Horseracing Board.',
    'Searched for any enforcement action by Sports Reference, the NBA or the '
    'WNBA against anyone reusing their data, and found none on the public '
    'record. We are treating that as a measure of risk, not of rights.',
    'Established that the EU and UK database right does not appear to reach a '
    'US-made database, since the directive limits beneficiaries to EU nationals '
    'and establishments.',
    'NOT done: we have not re-read each quoted clause at its URL a second time '
    'to confirm the page has not changed since. Every quote below carries the '
    'date it was read so you can weigh that yourself.',
]


def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def main():
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'lawyer.html')
    data = json.loads(RESEARCH.read_text())
    rows = {t['url']: t for t in data['terms'] if t.get('fetched') == 'yes'}

    blocks = []
    for url, why in APPENDIX:
        r = rows.get(url)
        if not r:
            sys.exit(f'appendix wants a document the research file does not have: {url}')
        blocks.append(
            f'<article><h3>{esc(r["document"])}</h3>'
            f'<p class="why">{esc(why)}</p>'
            f'<p class="meta"><a href="{esc(url)}">{esc(url)}</a><br>'
            f'Read {esc(r["date_read"])}</p>'
            f'<blockquote>{esc(r["quote"])}</blockquote></article>')

    qs = ''.join(
        f'<li><h3>{esc(q)}</h3>'
        f'<p><b>The situation.</b> {esc(sit)}</p>'
        f'<p><b>What we currently believe.</b> {esc(bel)}</p>'
        f'<p class="stake"><b>Why it matters to us.</b> {esc(why)}</p></li>'
        for q, sit, bel, why in Q)

    page = TEMPLATE
    page = page.replace('__FACTS__', ''.join(
        f'<tr><th>{esc(k)}</th><td>{esc(v)}</td></tr>' for k, v in FACTS))
    page = page.replace('__QUESTIONS__', qs)
    page = page.replace('__ALREADY__', ''.join(f'<li>{esc(x)}</li>' for x in ALREADY))
    page = page.replace('__APPENDIX__', ''.join(blocks))
    page = page.replace('__NDOCS__', str(len(data['terms'])))
    page = page.replace('__NLAW__', str(len(data['law'])))

    left = re.findall(r'__[A-Z]+__', page)
    if left:
        sys.exit(f'unreplaced placeholders: {sorted(set(left))}')
    out.write_text(page, encoding='utf-8')
    print(f'{out}  {len(page)/1024:.0f}KB  ·  {len(Q)} questions, '
          f'{len(blocks)} documents quoted verbatim')


TEMPLATE = """<title>Ball Knowledge — questions for counsel</title>
<style>
:root{
  --paper:#fbfaf8;--ink:#16130f;--dim:#57503f;--faint:#8a8172;--rule:#ddd6c8;
  --accent:#8c3f0c;--quote:#f2eee6;
  --sans:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --serif:Georgia,'Iowan Old Style','Times New Roman',serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#14120f;--ink:#eee7db;--dim:#b9b0a0;--faint:#867d6e;--rule:#38322a;
  --accent:#e08a4a;--quote:#1e1a15;}}
:root[data-theme="dark"]{--paper:#14120f;--ink:#eee7db;--dim:#b9b0a0;
  --faint:#867d6e;--rule:#38322a;--accent:#e08a4a;--quote:#1e1a15;}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--serif);
  font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:750px;margin:0 auto;padding:clamp(24px,5vw,56px) clamp(18px,5vw,30px) 90px}
.eyebrow{font-family:var(--sans);font-size:11px;letter-spacing:.14em;font-weight:600;
  text-transform:uppercase;color:var(--faint);display:block;margin-bottom:12px}
h1{font-family:var(--sans);font-size:clamp(27px,4.6vw,38px);line-height:1.15;
  margin:0 0 6px;font-weight:700;letter-spacing:-.01em;text-wrap:balance}
.sub{margin:0 0 26px;color:var(--dim);font-size:17px}
h2{font-family:var(--sans);font-size:13px;letter-spacing:.12em;text-transform:uppercase;
  font-weight:700;color:var(--accent);margin:44px 0 12px;
  padding-bottom:7px;border-bottom:1px solid var(--rule)}
h3{font-family:var(--sans);font-size:18px;line-height:1.35;margin:0 0 10px;font-weight:700}
p{margin:0 0 11px}
.callout{border:1px solid var(--rule);border-left:4px solid var(--accent);
  background:var(--quote);padding:15px 18px;margin:0 0 8px;font-size:16px}
.callout p:last-child{margin-bottom:0}
table{width:100%;border-collapse:collapse;font-size:15.5px}
th{text-align:left;vertical-align:top;font-family:var(--sans);font-size:12.5px;
  letter-spacing:.03em;text-transform:uppercase;color:var(--faint);font-weight:700;
  width:34%;padding:9px 14px 9px 0;border-bottom:1px solid var(--rule)}
td{vertical-align:top;padding:9px 0;border-bottom:1px solid var(--rule)}
ol.q{counter-reset:q;list-style:none;margin:0;padding:0}
ol.q>li{counter-increment:q;margin:0 0 30px;padding-left:44px;position:relative}
ol.q>li::before{content:counter(q);position:absolute;left:0;top:1px;
  font-family:var(--sans);font-weight:700;font-size:15px;color:var(--paper);
  background:var(--accent);width:29px;height:29px;border-radius:50%;
  display:grid;place-items:center}
ol.q p{font-size:16px;margin-bottom:8px}
ol.q b{font-family:var(--sans);font-size:13px;letter-spacing:.02em;
  text-transform:uppercase;color:var(--faint);font-weight:700}
.stake{color:var(--dim)}
ul.plain{margin:0;padding-left:20px}
ul.plain li{margin-bottom:8px;font-size:16px}
article{margin:0 0 30px;padding-bottom:26px;border-bottom:1px solid var(--rule)}
article:last-child{border-bottom:0}
.why{font-size:15px;color:var(--dim);margin-bottom:8px}
.meta{font-family:var(--sans);font-size:12.5px;color:var(--faint);margin-bottom:10px;
  word-break:break-word}
blockquote{margin:0;background:var(--quote);border:1px solid var(--rule);
  border-radius:2px;padding:15px 17px;font-size:14.5px;line-height:1.62;
  white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--serif)}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@media print{
  :root{--paper:#fff;--ink:#000;--dim:#333;--faint:#555;--rule:#bbb;
        --accent:#000;--quote:#f4f4f4}
  body{font-size:11pt}
  .wrap{max-width:none;padding:0}
  h2{page-break-after:avoid}
  article,ol.q>li{page-break-inside:avoid}
  a{text-decoration:none}
}
</style>
<div class="wrap">
<span class="eyebrow">Ball Knowledge &middot; prepared 7 August 2026</span>
<h1>Questions for counsel</h1>
<p class="sub">A hobby basketball trivia project, the terms of the sites it
cites, and seven questions ranked so the first two matter most.</p>

<div class="callout">
<p><b>What is being asked.</b> An informal read and a steer. Nothing here is
urgent, nothing is in dispute, and nobody has contacted us.</p>
<p><b>What is not being asked.</b> This is not a request to act as counsel or to
produce anything written. If a question is one you would rather not answer
casually, skip it and say so.</p>
<p><b>How to use it.</b> The questions are ranked. Answering only the first two
covers the most valuable ground. Every clause referenced is quoted in full at
the end, with its URL and the date it was read, so nothing here has to be taken
on trust.</p>
</div>

<h2>The project, in the facts you would ask for</h2>
<table>__FACTS__</table>

<h2>The questions</h2>
<ol class="q">__QUESTIONS__</ol>

<h2>What has already been checked, so you do not repeat it</h2>
<ul class="plain">__ALREADY__</ul>
<p style="font-size:15px;color:var(--dim);margin-top:12px">The underlying
research read __NDOCS__ terms and licence documents and __NLAW__ legal
authorities. It was carried out by the project, is not a legal opinion, and is
the thing these questions exist to correct.</p>

<h2>Appendix: the clauses, verbatim</h2>
<p style="font-size:15px;color:var(--dim)">Quoted from the pages as read on the
dates shown, and reproduced here without editing. Line wrapping has been
normalised; wording has not.</p>
__APPENDIX__
</div>
"""


if __name__ == '__main__':
    main()

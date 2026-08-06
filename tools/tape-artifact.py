#!/usr/bin/env python3
"""Build the before/after comparison page for The Tape, images inlined.

CLAUDE.md standing rule: every redesign ships a side-by-side, built from real
headless screenshots of BOTH states, desktop AND 390. Artifacts are served under
a strict CSP with no external hosts, so every image and every font goes in as a
data: URI — which is also why this is a script and not a hand-written file.

Run tools/tape-compare.mjs first (it writes shots/).
"""
import base64, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'shots/tape-compare.html')


def b64(path, mime):
    with open(os.path.join(ROOT, path), 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


def img(name):
    return b64('shots/' + name, 'image/png')


def font(name):
    return b64('docs/play/assets/fonts/' + name, 'font/woff2')


def pair(before, after, alt):
    """One BEFORE/AFTER row. The two-column split is the whole point of the page,
    so it is the only structural device here — it encodes a real binary."""
    return f'''<div class="pair">
  <figure class="shot b"><figcaption><span class="tag">Before</span>{alt}</figcaption>
    <div class="frame"><img src="{img(before)}" alt="Before — {alt}"></div></figure>
  <figure class="shot a"><figcaption><span class="tag">After</span>{alt}</figcaption>
    <div class="frame"><img src="{img(after)}" alt="After — {alt}"></div></figure>
</div>'''


def solo(name, label, alt):
    return f'''<figure class="shot a solo"><figcaption><span class="tag">New</span>{label}</figcaption>
  <div class="frame"><img src="{img(name)}" alt="{alt}"></div></figure>'''


ASKS = [
    ('Can we have a sort by feature?',
     'It already worked — click a column name — and nobody could find it. Now the sort '
     'writes itself into the query as <code>sort ppg desc</code>, the walkthrough points '
     'straight at it, and you can type it.'),
    ('Can we hide columns?',
     'A <b>Columns</b> button. Per table, this visit only. A hidden column is still '
     'filtered and still copied — the button says how many are hidden.'),
    ('A sample pre-populated when you flip to Query',
     'The Query tab opens on a real query that returns 228 rows and uses all four '
     'clauses, so pressing Run once shows what each word did. It only fills an empty '
     'box, so it can never eat something half-typed.'),
    ('I was hoping it would just be SQL',
     'Now it is, for the shape you would actually type: '
     '<code>SELECT&nbsp;*&nbsp;FROM&nbsp;…&nbsp;JOIN&nbsp;…&nbsp;WHERE&nbsp;…&nbsp;ORDER&nbsp;BY&nbsp;…</code>. '
     'It is translated into the plain form in front of you. No <code>OR</code>, no '
     '<code>GROUP&nbsp;BY</code>, no sums or counts — it is a table browser, not a database.'),
    ('Create a coach for The Tape',
     'Nine steps, plain language, spotlighting the real control each one is about. '
     'It runs itself on a first visit and loads an example first so it is never '
     'pointing at an empty screen.'),
    ('A button that makes it replayable',
     '<b>? Show me how</b>, in the bar. Replaying never throws away the query you '
     'were in the middle of.'),
]

ANSWERS = [
    ('Is it one fact per question, or can one fact make several?',
     'One fact, one card. Measured, not assumed: <b>1,526</b> rows in <code>facts</code>, '
     '<b>1,526</b> distinct ids, <b>1,526</b> distinct question texts. There is nothing '
     'to split, which is why there is no separate Questions table to look for.'),
    ('What decides what goes under Things, Links or Detail?',
     'The rule now says itself on screen, under each heading. <b>Things</b> — one row is '
     'one real thing, with an id of its own. <b>Links</b> — one row is one connection '
     'between two things. <b>Detail</b> — many rows hanging off one thing, the way a '
     'player has forty seasons of stats.'),
    ('What is the "Copy as TSV" thing? Maybe hide it behind an admin control?',
     'It puts the rows on your clipboard for a spreadsheet — that was a naming problem, '
     'not a permissions one, so it is now <b>Copy for a spreadsheet</b> and stayed in the '
     'bar. Hiding it would have removed the most useful button on the page for anyone who '
     'does not write code, and there is nothing behind it to protect: The Tape is '
     'unlisted, and unlisted is not private.'),
]

FIXED = [
    ('A failed query left the old rows behind',
     'Ask for a table that does not exist and the screen honestly said so — while '
     '<b>Copy for a spreadsheet</b> quietly handed over 362 rows of whatever you were '
     'looking at before. Found by the check for the case nobody types on purpose.'),
    ('The query box shipped clipped on a phone',
     'The box is grown to fit its contents, and it was being measured while its tab was '
     'still hidden — so it measured one line and cut the other three off. At 390px the '
     'four-line query wraps to seven.'),
    ('<code>source_register</code> was not in The Tape at all',
     'The fourteen sites we trust, and the section-by-section rules that decide whether a '
     'page is good enough to ship a card on. It is a table like any other and was missing '
     'from the list; its nested rules also rendered as <code>[object Object]</code>, which '
     'is a table lying about its own contents.'),
]

LEFT = [
    ('The saved views, the chips, the ▾ filter dropdown',
     'Untouched. They were the answer to the last round of notes and nothing about them '
     'was reported broken.'),
    ('Hidden columns are not remembered between visits',
     'On purpose. A column you hid a week ago and forgot is a column you will later swear '
     'the data does not have.'),
    ('The Tape stays dark only',
     'It is one dark surface with no light pair, so there is no second theme to compare. '
     'That is unchanged, not overlooked.'),
    ('The look',
     'No new colours, no new type, no layout move. Everything here is a control that was '
     'missing or a sentence that was not being said — the one visible addition to the bar '
     'is two buttons.'),
]


def rows(items, cls=''):
    return '\n'.join(
        f'<div class="row {cls}"><h3>{a}</h3><p>{b}</p></div>' for a, b in items)


HTML = f'''<title>The Tape — what changed</title>
<style>
@font-face{{font-family:'Anton';src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
@font-face{{font-family:'Archivo';src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:block}}
@font-face{{font-family:'SpaceMono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:block}}

/* The palette is The Tape's own — CLAUDE.md says the project's existing system
   wins over anything invented here, and a report about a tool that reads in that
   tool's colours is easier to trust. The light ground is a warm paper biased
   toward the orange, not a neutral grey. */
:root{{
  --ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;
  --ink:#221a15;--muted:#5f5245;--dim:#877868;
  --accent:#b3590b;--cool:#0f6c65;--bad:#a8302a;
  --shadow:0 1px 0 rgba(34,26,21,.05),0 10px 30px -18px rgba(34,26,21,.5);
  --mono:'SpaceMono',ui-monospace,Menlo,monospace;
  --body:'Archivo',system-ui,-apple-system,sans-serif;
  --display:'Anton',Impact,sans-serif;
}}
@media (prefers-color-scheme:dark){{
  :root{{
    --ground:#141010;--panel:#1d1714;--sunk:#100c0b;--rule:#3a2e26;
    --ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;
    --accent:#f5872e;--cool:#6fd0c3;--bad:#d5524b;
    --shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000;
  }}
}}
:root[data-theme="light"]{{
  --ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;
  --ink:#221a15;--muted:#5f5245;--dim:#877868;
  --accent:#b3590b;--cool:#0f6c65;--bad:#a8302a;
  --shadow:0 1px 0 rgba(34,26,21,.05),0 10px 30px -18px rgba(34,26,21,.5);
}}
:root[data-theme="dark"]{{
  --ground:#141010;--panel:#1d1714;--sunk:#100c0b;--rule:#3a2e26;
  --ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;
  --accent:#f5872e;--cool:#6fd0c3;--bad:#d5524b;
  --shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000;
}}

*{{box-sizing:border-box}}
body{{margin:0;background:var(--ground);color:var(--ink);
  font-family:var(--body);font-size:17px;line-height:1.62;
  -webkit-font-smoothing:antialiased}}
.wrap{{max-width:1180px;margin:0 auto;padding:0 22px 90px;
  display:flex;flex-direction:column;gap:56px}}
.read{{max-width:66ch}}

header{{padding:66px 0 0;display:flex;flex-direction:column;gap:16px}}
.eyebrow{{font-family:var(--mono);font-size:.68rem;letter-spacing:.24em;text-transform:uppercase;
  color:var(--accent);margin:0}}
h1{{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:.01em;
  font-size:clamp(2.6rem,7vw,4.4rem);line-height:.94;margin:0;text-wrap:balance}}
h1 span{{color:var(--accent)}}
.stand{{font-size:1.12rem;color:var(--muted);margin:0;max-width:60ch;text-wrap:pretty}}

.meta{{display:flex;flex-wrap:wrap;gap:0;border:1px solid var(--rule);background:var(--panel);
  box-shadow:var(--shadow)}}
.meta div{{flex:1 1 150px;padding:14px 18px;border-right:1px solid var(--rule)}}
.meta div:last-child{{border-right:0}}
.meta dt{{font-family:var(--mono);font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;
  color:var(--dim);margin:0 0 3px}}
.meta dd{{margin:0;font-family:var(--display);font-size:1.5rem;letter-spacing:.02em;
  font-variant-numeric:tabular-nums;line-height:1.1}}
.meta dd small{{font-family:var(--body);font-size:.78rem;letter-spacing:0;color:var(--muted);
  display:block;margin-top:2px;line-height:1.4}}

section{{display:flex;flex-direction:column;gap:22px}}
h2{{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:.02em;
  font-size:clamp(1.5rem,3.4vw,2.1rem);line-height:1.05;margin:0;text-wrap:balance;
  padding-bottom:10px;border-bottom:2px solid var(--accent)}}
h2 em{{font-style:normal;color:var(--dim)}}

.row{{display:grid;grid-template-columns:minmax(0,22ch) minmax(0,1fr);gap:8px 30px;
  padding:16px 0;border-bottom:1px solid var(--rule)}}
.row:last-child{{border-bottom:0}}
.row h3{{margin:0;font-size:.95rem;line-height:1.4;color:var(--ink);font-weight:600}}
.row p{{margin:0;color:var(--muted);font-size:.95rem}}
.row.ask h3::before{{content:'“';color:var(--accent);font-family:var(--display)}}
.row.ask h3::after{{content:'”';color:var(--accent);font-family:var(--display)}}
.row.ask h3{{color:var(--accent);font-family:var(--mono);font-size:.86rem;line-height:1.55}}

code{{font-family:var(--mono);font-size:.86em;background:var(--sunk);color:var(--cool);
  padding:.1em .38em;border:1px solid var(--rule)}}
b{{font-weight:600;color:var(--ink)}}

.why{{font-family:var(--mono);font-size:.8rem;line-height:1.75;color:var(--muted);
  border-left:3px solid var(--accent);padding:2px 0 2px 16px;margin:0;max-width:78ch}}
.why b{{color:var(--accent);font-weight:400}}

.pair{{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}}
.shot{{margin:0;display:flex;flex-direction:column;gap:0;min-width:0}}
.shot figcaption{{font-family:var(--mono);font-size:.66rem;letter-spacing:.13em;
  text-transform:uppercase;color:var(--dim);display:flex;align-items:center;gap:9px;
  padding:0 0 8px}}
.tag{{font-family:var(--mono);font-size:.6rem;letter-spacing:.16em;padding:3px 8px;
  border:1px solid currentColor;line-height:1}}
.shot.b .tag{{color:var(--dim)}}
.shot.a .tag{{color:var(--accent)}}
.frame{{border:1px solid var(--rule);background:#141010;overflow:hidden;
  box-shadow:var(--shadow);line-height:0}}
.shot.a .frame{{border-color:var(--accent)}}
.frame img{{width:100%;height:auto;display:block}}
.solo{{max-width:none}}
.duo{{display:grid;grid-template-columns:1fr 390px;gap:18px;align-items:start}}

.terminal{{background:var(--sunk);border:1px solid var(--rule);padding:16px 18px;
  font-family:var(--mono);font-size:.76rem;line-height:1.85;color:var(--muted);
  overflow-x:auto;white-space:pre;box-shadow:var(--shadow)}}
.terminal b{{color:var(--cool);font-weight:400}}
.terminal i{{color:var(--accent);font-style:normal}}

footer{{border-top:1px solid var(--rule);padding-top:22px;font-family:var(--mono);
  font-size:.7rem;letter-spacing:.09em;color:var(--dim);line-height:1.9}}

@media(max-width:860px){{
  body{{font-size:16px}}
  .pair,.duo{{grid-template-columns:1fr}}
  .row{{grid-template-columns:1fr;gap:5px}}
  header{{padding-top:44px}}
  .wrap{{gap:44px}}
}}
@media(prefers-reduced-motion:reduce){{*{{transition:none!important;animation:none!important}}}}
</style>

<div class="wrap">

<header>
  <p class="eyebrow">Ball Knowledge · the data browser · 4 August 2026</p>
  <h1>The Tape<br><span>what changed</span></h1>
  <p class="stand">Six notes came back from one sitting with it. Five were things that
    were not there. The sixth — sorting — was already built and simply could not be
    found, which is the more useful kind of failure to have caught.</p>
</header>

<div class="meta">
  <div><dt>Asks</dt><dd>6 of 6<small>all shipped</small></dd></div>
  <div><dt>Checks</dt><dd>56<small>all passing, <code>tape-check.mjs</code></small></dd></div>
  <div><dt>Bugs found</dt><dd>3<small>all fixed, all found by the checks</small></dd></div>
  <div><dt>Tables listed</dt><dd>23<small>was 22 — one was missing</small></dd></div>
</div>

<section>
  <h2>The six asks <em>— and what shipped</em></h2>
  {rows(ASKS, 'ask')}
</section>

<section>
  <h2>Desktop <em>— the main view</em></h2>
  <p class="why"><b>The bar</b> gained two buttons: Columns, and ? Show me how.
Copy as TSV became Copy for a spreadsheet — same button, English name.
<b>The left rail</b> now says what each group IS, under its heading, and lists
source_register, which existed as a table and was not in the list.
<b>The query box</b> grows to fit — the before shot cuts "join people" off the
bottom, and adding "sort" made it a four-line language.</p>
  {pair('tape-before-desk.png', 'tape-after-desk.png', '1440 × 900 · saved view R2, joined to people')}
</section>

<section>
  <h2>Phone <em>— the Query tab</em></h2>
  <p class="why"><b>Before:</b> an empty box and a paragraph of syntax. There was
nothing to press Run on, so there was no way in.
<b>After:</b> a query that returns 228 rows and uses where, join and sort at once,
plus the SQL line — with its limits stated, because a half-true "SQL works" is
worse than none.</p>
  {pair('tape-before-query-390.png', 'tape-after-query-390.png', '390 × 844 · the Query tab, cold')}
</section>

<section>
  <h2>Phone <em>— the table list</em></h2>
  <p class="why"><b>Things, Links, Detail</b> were three headings with no key. The
grey line under each one is the whole answer, and it is on screen instead of in a
document.</p>
  {pair('tape-before-rail-390.png', 'tape-after-rail-390.png', '390 × 844 · the drawer, open')}
</section>

<section>
  <h2>The coach <em>— new, so there is no before</em></h2>
  <p class="why">Nine steps. It runs itself once, then lives behind <b>? Show me how</b>
forever. It loads an example before it starts — the first build of it opened on the
blank landing screen and spent six of its nine steps pointing at furniture that was
not there. On a phone, the step about the left rail opens the left rail; spotlighting
something nobody can see is the same bug as an invisible sort.</p>
  <div class="duo">
    {solo('tape-after-coach-desk.png', '1440 × 900 · step 5 of 9', 'The coach on desktop, spotlighting the table')}
    {solo('tape-after-coach-390.png', '390 × 844 · step 2 of 9', 'The coach on a phone, with the rail opened')}
  </div>
</section>

<section>
  <h2>The other three questions</h2>
  {rows(ANSWERS)}
</section>

<section>
  <h2>Three bugs, all fixed in this change</h2>
  {rows(FIXED)}
  <p class="why">All three were found by the checks, not by reading the code — which is
the argument for writing a check for the case nobody types on purpose.</p>
  <div class="terminal">— sort, and its break-it half —
  <b>PASS</b>  the query text can SET a sort   [ppg/-1]
  <b>PASS</b>  desc really is descending   [26.9 &gt; 25.3 &gt; 24.7 &gt; 23.9]
  <b>PASS</b>  and plain sort really is ascending   [2.8 &lt; 3.3 &lt; 4.2 &lt; 4.5]
  <b>PASS</b>  clicking a column header writes `sort` into the query

— SQL is a translation, so it must agree with the plain form —
  <b>PASS</b>  SELECT … is rewritten into the plain form, verbatim
  <b>PASS</b>  and returns the same rows   [228 vs 228]
  <b>PASS</b>  IS NOT NULL maps to col=* (24 facts are checked today)
  <i>PASS</i>  an unknown table fails visibly, not silently   <i>← caught the stale rows</i>

— hide columns —
  <b>PASS</b>  hiding drops it from the VIEW, not the data   [6 cols / 5 shown]
  <b>PASS</b>  a hidden column is still in the spreadsheet copy
  <b>PASS</b>  and a hidden column is still filterable   [48]

— on a phone —
  <b>PASS</b>  on a phone the rail step opens the rail it is pointing at
  <i>PASS</i>  and the whole query is readable, not clipped, at 390px   <i>[96px for 96px]</i></div>
</section>

<section>
  <h2>Left alone on purpose</h2>
  {rows(LEFT)}
</section>

<footer>
  Shots are real headless captures of both versions at 1440 × 900 and 390 × 844 ·
  the “before” is the version on main, re-served from its own committed source ·
  The Tape is dark only, so there is no light pair to show ·
  <code>tools/tape-check.mjs</code> · <code>tools/tape-compare.mjs</code>
</footer>

</div>
'''

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('%s  %.1f MB' % (OUT, os.path.getsize(OUT) / 1e6))

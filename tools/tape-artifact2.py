#!/usr/bin/env python3
"""Round two of the before/after page for The Tape — the four notes from 08-04.

Same rules as tape-artifact.py: real headless shots of BOTH states, desktop AND
390, everything inlined because Artifacts run under a CSP with no external hosts.
Run tools/tape-compare.mjs first (it mints the "before" out of git and deletes it
again afterwards).
"""
import base64, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'shots/tape-compare2.html')


def b64(path, mime):
    with open(os.path.join(ROOT, path), 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


def img(n):
    return b64('shots/' + n, 'image/png')


def font(n):
    return b64('docs/play/assets/fonts/' + n, 'font/woff2')


def pair(before, after, alt, tall=False):
    c = ' tall' if tall else ''
    return f'''<div class="pair{c}">
  <figure class="shot b"><figcaption><span class="tag">Before</span>{alt}</figcaption>
    <div class="frame"><img src="{img(before)}" alt="Before — {alt}"></div></figure>
  <figure class="shot a"><figcaption><span class="tag">After</span>{alt}</figcaption>
    <div class="frame"><img src="{img(after)}" alt="After — {alt}"></div></figure>
</div>'''


def solo(name, label, alt, tag='New'):
    return f'''<figure class="shot a solo"><figcaption><span class="tag">{tag}</span>{label}</figcaption>
  <div class="frame"><img src="{img(name)}" alt="{alt}"></div></figure>'''


NOTES = [
    ('“I clicked the arrows on the rows and just got a popup 🤷🏽‍♂️ no sorting”',
     'You were clicking the <b>filter</b>. An arrow in a table header means sort '
     'everywhere else in the world, and the thing that sorted — the column name — '
     'had no arrow on it until it was already sorted. Now the name carries a '
     'permanent <code>⇅</code> and the filter is a funnel, which is not an arrow. '
     'Both say what they do on hover.'),
    ('“Does a new sort take over the old one or sort secondary?”',
     'It took over, and there was no way to have a second. Now a plain click '
     'replaces, a <b>shift-click adds</b> a tie-breaker, and small <code>1</code> '
     'and <code>2</code> marks show the order. Clicking a column already in the '
     'sort flips just that one. The whole list writes itself into the query as '
     '<code>sort kind, ppg desc</code> — which is also how you do it on a phone, '
     'where there is no shift key.'),
    ('“I thought we were building a database and the website is the way to '
     'navigate it, like Looker to a Snowflake database”',
     'You are, and the line on screen was badly worded. The <b>data</b> is a '
     'database — 23 tables with keys and joins, and <code>TABLES.md</code> is its '
     'schema. What is not here is a SQL <b>engine</b>: the tables are files this '
     'page fetches, and about fifty lines translate your SQL into the plain form. '
     'The honest gap behind the line was that the language could not <b>count</b>. '
     'It can now.'),
    ('“In the coach you don’t need to say things like ‘it always worked’”',
     'Cut. That step was explaining itself to you rather than telling a player '
     'what to press. Rewritten, and the walkthrough gained a step for counting.'),
]

ENGINE = [
    ('Works', 'SELECT … FROM t · JOIN t · WHERE a=b AND c IS NULL · '
              'GROUP BY col · COUNT(*) · ORDER BY col DESC, col'),
    ('Doesn’t', 'OR · HAVING · subqueries · SUM / AVG / MIN / MAX · CASE · UNION'),
    ('Ignored', 'the SELECT list — pick columns with the Columns button instead'),
]

LEFT = [
    ('Hidden columns still are not remembered between visits',
     'Unchanged and still deliberate. A column you hid a week ago and forgot is a '
     'column you will later swear the data does not have.'),
    ('The saved views, the chips, the join picker',
     'Untouched. Nothing was reported wrong with them.'),
    ('<code>category</code> is still a mess, on purpose',
     'The first thing <b>count by</b> found: 191 distinct categories across 1,526 '
     'cards, 47 of them used exactly once. That is already parked in TABLES.md §4 '
     'awaiting a planning conversation you asked for, so it stays parked — the '
     'stale “~180” in that doc is now the measured 191. It is display-only today: '
     'one read site, on the card face. Nothing selects or balances on it.'),
]


def rows(items):
    return '\n'.join(f'<div class="row"><h3>{a}</h3><p>{b}</p></div>' for a, b in items)


HTML = f'''<title>The Tape — round two</title>
<style>
@font-face{{font-family:'Anton';src:url({font('anton-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
@font-face{{font-family:'Archivo';src:url({font('archivo-600.woff2')}) format('woff2');font-weight:600;font-display:block}}
@font-face{{font-family:'SpaceMono';src:url({font('spacemono-400.woff2')}) format('woff2');font-weight:400;font-display:block}}
:root{{
  --ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;
  --ink:#221a15;--muted:#5f5245;--dim:#877868;
  --accent:#b3590b;--cool:#0f6c65;
  --shadow:0 1px 0 rgba(34,26,21,.05),0 10px 30px -18px rgba(34,26,21,.5);
  --mono:'SpaceMono',ui-monospace,Menlo,monospace;
  --body:'Archivo',system-ui,-apple-system,sans-serif;
  --display:'Anton',Impact,sans-serif;
}}
@media (prefers-color-scheme:dark){{:root{{
  --ground:#141010;--panel:#1d1714;--sunk:#100c0b;--rule:#3a2e26;
  --ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;
  --accent:#f5872e;--cool:#6fd0c3;
  --shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000;}}}}
:root[data-theme="light"]{{
  --ground:#f5efe6;--panel:#fffcf7;--sunk:#efe7db;--rule:#ddd0be;
  --ink:#221a15;--muted:#5f5245;--dim:#877868;--accent:#b3590b;--cool:#0f6c65;
  --shadow:0 1px 0 rgba(34,26,21,.05),0 10px 30px -18px rgba(34,26,21,.5);}}
:root[data-theme="dark"]{{
  --ground:#141010;--panel:#1d1714;--sunk:#100c0b;--rule:#3a2e26;
  --ink:#f0e7d9;--muted:#b0a492;--dim:#867a6b;--accent:#f5872e;--cool:#6fd0c3;
  --shadow:0 1px 0 rgba(0,0,0,.4),0 14px 34px -20px #000;}}

*{{box-sizing:border-box}}
body{{margin:0;background:var(--ground);color:var(--ink);font-family:var(--body);
  font-size:17px;line-height:1.62;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:1180px;margin:0 auto;padding:0 22px 90px;
  display:flex;flex-direction:column;gap:54px}}
header{{padding:66px 0 0;display:flex;flex-direction:column;gap:15px}}
.eyebrow{{font-family:var(--mono);font-size:.68rem;letter-spacing:.24em;text-transform:uppercase;
  color:var(--accent);margin:0}}
h1{{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:.01em;
  font-size:clamp(2.6rem,7vw,4.4rem);line-height:.94;margin:0;text-wrap:balance}}
h1 span{{color:var(--accent)}}
.stand{{font-size:1.12rem;color:var(--muted);margin:0;max-width:62ch;text-wrap:pretty}}
.meta{{display:flex;flex-wrap:wrap;border:1px solid var(--rule);background:var(--panel);
  box-shadow:var(--shadow)}}
.meta div{{flex:1 1 160px;padding:14px 18px;border-right:1px solid var(--rule)}}
.meta div:last-child{{border-right:0}}
.meta dt{{font-family:var(--mono);font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;
  color:var(--dim);margin:0 0 3px}}
.meta dd{{margin:0;font-family:var(--display);font-size:1.5rem;letter-spacing:.02em;
  font-variant-numeric:tabular-nums;line-height:1.1}}
.meta dd small{{font-family:var(--body);font-size:.78rem;letter-spacing:0;color:var(--muted);
  display:block;margin-top:2px;line-height:1.4}}
section{{display:flex;flex-direction:column;gap:20px}}
h2{{font-family:var(--display);font-weight:400;text-transform:uppercase;letter-spacing:.02em;
  font-size:clamp(1.5rem,3.4vw,2.1rem);line-height:1.05;margin:0;text-wrap:balance;
  padding-bottom:10px;border-bottom:2px solid var(--accent)}}
h2 em{{font-style:normal;color:var(--dim)}}
.row{{display:grid;grid-template-columns:minmax(0,26ch) minmax(0,1fr);gap:8px 30px;
  padding:17px 0;border-bottom:1px solid var(--rule)}}
.row:last-child{{border-bottom:0}}
.row h3{{margin:0;font-family:var(--mono);font-size:.84rem;line-height:1.6;color:var(--accent);
  font-weight:400}}
.row p{{margin:0;color:var(--muted);font-size:.95rem}}
code{{font-family:var(--mono);font-size:.86em;background:var(--sunk);color:var(--cool);
  padding:.1em .38em;border:1px solid var(--rule)}}
b{{font-weight:600;color:var(--ink)}}
.why{{font-family:var(--mono);font-size:.8rem;line-height:1.75;color:var(--muted);
  border-left:3px solid var(--accent);padding:2px 0 2px 16px;margin:0;max-width:80ch}}
.why b{{color:var(--accent);font-weight:400}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}}
.pair.tall{{grid-template-columns:1fr;max-width:920px}}
.shot{{margin:0;display:flex;flex-direction:column;min-width:0}}
.shot figcaption{{font-family:var(--mono);font-size:.66rem;letter-spacing:.13em;
  text-transform:uppercase;color:var(--dim);display:flex;align-items:center;gap:9px;padding:0 0 8px}}
.tag{{font-family:var(--mono);font-size:.6rem;letter-spacing:.16em;padding:3px 8px;
  border:1px solid currentColor;line-height:1}}
.shot.b .tag{{color:var(--dim)}}
.shot.a .tag{{color:var(--accent)}}
.frame{{border:1px solid var(--rule);background:#141010;overflow:hidden;
  box-shadow:var(--shadow);line-height:0}}
.shot.a .frame{{border-color:var(--accent)}}
.frame img{{width:100%;height:auto;display:block}}
.duo{{display:grid;grid-template-columns:1fr 390px;gap:18px;align-items:start}}
.spec{{border:1px solid var(--rule);background:var(--panel);box-shadow:var(--shadow)}}
.spec div{{display:grid;grid-template-columns:minmax(0,11ch) minmax(0,1fr);gap:14px;
  padding:12px 18px;border-bottom:1px solid var(--rule);align-items:baseline}}
.spec div:last-child{{border-bottom:0}}
.spec dt{{font-family:var(--mono);font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--accent);margin:0}}
.spec dd{{margin:0;font-family:var(--mono);font-size:.78rem;line-height:1.7;color:var(--muted);
  overflow-wrap:anywhere}}
footer{{border-top:1px solid var(--rule);padding-top:22px;font-family:var(--mono);
  font-size:.7rem;letter-spacing:.09em;color:var(--dim);line-height:1.9}}
@media(max-width:860px){{
  body{{font-size:16px}}
  .pair,.duo{{grid-template-columns:1fr}}
  .row{{grid-template-columns:1fr;gap:5px}}
  .spec div{{grid-template-columns:1fr;gap:4px}}
  header{{padding-top:44px}} .wrap{{gap:42px}}
}}
@media(prefers-reduced-motion:reduce){{*{{transition:none!important;animation:none!important}}}}
</style>

<div class="wrap">

<header>
  <p class="eyebrow">Ball Knowledge · the data browser · round two · 4 August 2026</p>
  <h1>The Tape<br><span>four notes back</span></h1>
  <p class="stand">Two were things I got wrong — an arrow that filtered instead of
    sorting, and a sentence on screen that said the data was not a database. One
    was a fair question with a bad answer: a second sort threw the first away. One
    was the walkthrough talking to the wrong person.</p>
</header>

<div class="meta">
  <div><dt>Notes</dt><dd>4 of 4<small>all addressed</small></dd></div>
  <div><dt>Checks</dt><dd>74<small>was 56 — all passing</small></dd></div>
  <div><dt>New in the language</dt><dd>2<small><code>count by</code> · multi-column <code>sort</code></small></dd></div>
  <div><dt>Found by counting</dt><dd>191<small>distinct categories on 1,526 cards</small></dd></div>
</div>

<section>
  <h2>The four notes</h2>
  {rows(NOTES)}
</section>

<section>
  <h2>The column header <em>— the one you clicked</em></h2>
  <p class="why"><b>Before:</b> one arrow per column, and it filtered. The sort was
the column name, unmarked, so the only visible control did the other thing.
<b>After:</b> the name carries <b>⇅</b> and sorts; a funnel filters. Sorted columns
show ▲ or ▼, and when there is more than one key they are numbered.
<b>Read the chips in the before shot</b> — both sides were handed the same query,
<code>sort kind, ppg desc</code>, and the old parser turned it into two joins
("with people sort kind", "with ppg desc") because it had no idea what a second
sort key was. That is not a staged failure; it is the old build being honest
about a sentence it could not read.</p>
  {pair('tape-before-header.png', 'tape-after-header.png',
        '1000 × 420 · sorted by kind, then ppg descending', tall=True)}
</section>

<section>
  <h2>Counting <em>— the gap behind “not a database”</em></h2>
  <p class="why"><b>+ count them up</b> in the builder, <code>count by col</code> in the
query, <code>GROUP BY</code> in SQL. One row out per distinct value with how many
there are, biggest first, and the tally still filters, still sorts, still copies to
a spreadsheet. The first thing it was pointed at found 191 categories on 1,526
cards — see “left alone”, below.</p>
  <div class="duo">
    {solo('tape-after-tally.png', '1000 × 560 · facts count by category', 'The tally view')}
    {solo('tape-after-coach-390.png', '390 × 844 · the walkthrough, rewritten',
          'The coach on a phone, on the sorting step', tag='Revised')}
  </div>
</section>

<section>
  <h2>What the SQL door actually takes</h2>
  <p class="why">Worth writing down plainly, because “it’s a table browser, not a
database” was the wrong way to say it. These are the <b>translator’s</b> limits.
The tables are a database; this page is about fifty lines of rewriting on top of
them.</p>
  <div class="spec">
    {''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in ENGINE)}
  </div>
</section>

<section>
  <h2>Everything else <em>— unchanged, and shown anyway</em></h2>
  <p class="why">The two shots from the first round, re-taken against today’s build,
so a change nobody asked for cannot slip in behind the ones that were.</p>
  {pair('tape-before-desk.png', 'tape-after-desk.png', '1440 × 900 · saved view R2')}
  {pair('tape-before-query-390.png', 'tape-after-query-390.png', '390 × 844 · the Query tab')}
</section>

<section>
  <h2>Left alone on purpose</h2>
  {rows(LEFT)}
</section>

<footer>
  Real headless captures of both versions at 1440 × 900, 1000 × 420/560 and 390 × 844 ·
  the “before” is minted out of git by <code>tools/tape-compare.mjs</code> and deleted
  again, so it can never be a working copy · The Tape is dark only, so there is no
  light pair · <code>tools/tape-check.mjs</code>
</footer>

</div>
'''

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('%s  %.1f MB' % (OUT, os.path.getsize(OUT) / 1e6))

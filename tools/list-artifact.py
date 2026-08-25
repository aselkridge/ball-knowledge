#!/usr/bin/env python3
"""The whole list as one page: every row of every one of TODO.md's six lists.

Born 2026-08-24, the day the BUILD order was ruled: Aaron asked to "see an
artifact with all numbers and everything in each and every list". Generated
FROM TODO.md, never written by hand, so the page cannot drift from the file:
republish after any meaningful list change.

    python3 tools/list-artifact.py [out.html]

Writes the page (default: the path printed at the end) for publishing with
the Artifact tool.
"""
import re, sys, html as H

SRC = 'TODO.md'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/list-board.html'

LISTS = [
    ('1', 'BUILD · active', 'The road to the twenty. The ORDER is the plan, ruled 08-24: top row first.', True),
    ('2', 'RESEARCH · active', 'Getting to 1,000 dealable cards, and proving the ones we have.', False),
    ('3', 'BUILD · after the 20', 'Committed. Not before launch.', False),
    ('4', 'RESEARCH · after the 20', 'Committed. Not before launch.', False),
    ('5', 'NICE TO HAVE', 'Real ideas, no commitment.', False),
    ('6', 'SCRAPPED', 'Decided against. The note says why, so it does not get re-proposed.', False),
]


def md(t):
    """the small subset of markdown the notes actually use"""
    t = H.escape(t)
    t = re.sub(r'&lt;(https?://[^&]+)&gt;', r'<a href="\1">\1</a>', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'\*(.+?)\*', r'<i>\1</i>', t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    return t


def rows_of(src, num):
    m = re.search(r'## ' + num + r' · .*?\n(.*?)(?=\n## |\Z)', src, re.S)
    if not m:
        raise SystemExit('list ' + num + ' not found in ' + SRC)
    out = []
    for line in m.group(1).split('\n'):
        line = line.strip()
        if not line.startswith('|') or line.startswith('| # |') or line.startswith('|---'):
            continue
        c = [x.strip() for x in line.split('|')[1:-1]]
        if len(c) == 6:
            out.append(c)
    return out


src = open(SRC).read()
total = 0
sections = []
for num, name, sub, ranked in LISTS:
    rows = rows_of(src, num)
    total += len(rows)
    body = []
    for i, (rid, was, item, whose, status, note) in enumerate(rows, 1):
        rank = f'<span class="rank">{i}</span>' if ranked else ''
        wasx = f'<span class="was">was {H.escape(was)}</span>' if was and was != '—' else ''
        chips = (f'<span class="chip who {"aaron" if whose == "Aaron" else ""}">{H.escape(whose)}</span>'
                 f'<span class="chip st {H.escape(status)}">{H.escape(status)}</span>')
        notex = f'<div class="note">{md(note)}</div>' if note else ''
        body.append(
            f'<article class="row">{rank}<div class="rowin">'
            f'<div class="rowtop"><span class="id">#{H.escape(rid)}</span>{chips}{wasx}</div>'
            f'<div class="item">{md(item)}</div>{notex}</div></article>')
    sections.append(
        f'<section><div class="lh"><span class="ln">{num}</span><h2>{H.escape(name)}</h2>'
        f'<span class="count">{len(rows)} rows</span></div>'
        f'<p class="lsub">{H.escape(sub)}</p>{"".join(body)}</section>')

page = f"""<title>The Whole List</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Space+Mono:wght@400;700&display=swap">
<style>
:root{{--bg:#0d0906;--panel:#160f09;--line:rgba(255,176,58,.18);--ink:#efe6d5;
--faint:#b7a687;--dim:#8a7a5e;--accent:#ffb03a;--deep:#c9641a;--blue:#7fb2cc;
--mono:'Space Mono',ui-monospace,monospace}}
*{{box-sizing:border-box;margin:0}}
body{{background:var(--bg);color:var(--ink);font-family:'Archivo',system-ui,sans-serif;
font-variation-settings:'wdth' 96;line-height:1.5;padding:0 16px 90px}}
.wrap{{max-width:940px;margin:0 auto}}
header{{padding:52px 0 16px;border-bottom:1px solid var(--line)}}
.eyebrow{{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.28em;
text-transform:uppercase;color:var(--accent)}}
h1{{font-weight:900;font-variation-settings:'wdth' 78;font-size:clamp(34px,6vw,52px);
line-height:1.02;text-transform:uppercase;margin:10px 0 10px}}
.lede{{color:var(--faint);max-width:62ch;font-size:15.5px}}
.lede b{{color:var(--ink)}}
section{{margin-top:52px}}
.lh{{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}}
.ln{{font-family:var(--mono);font-weight:700;color:#1c0f02;background:var(--accent);
border-radius:8px;padding:2px 10px;font-size:14px}}
h2{{font-weight:900;font-variation-settings:'wdth' 80;font-size:clamp(20px,3.2vw,27px);
text-transform:uppercase}}
.count{{font-family:var(--mono);font-size:11px;color:var(--dim);letter-spacing:.14em}}
.lsub{{color:var(--dim);font-size:13.5px;margin:6px 0 16px}}
.row{{display:flex;gap:10px;margin:8px 0}}
.rank{{flex:0 0 34px;font-family:var(--mono);font-weight:700;font-size:15px;
color:var(--accent);text-align:right;padding-top:14px}}
.rowin{{flex:1;background:var(--panel);border:1px solid var(--line);border-radius:12px;
padding:11px 14px;min-width:0}}
.rowtop{{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px}}
.id{{font-family:var(--mono);font-weight:700;font-size:13px;color:var(--accent)}}
.was{{font-family:var(--mono);font-size:10px;color:var(--dim);letter-spacing:.08em}}
.chip{{font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.16em;
text-transform:uppercase;padding:2px 8px;border-radius:999px;border:1px solid var(--line);
color:var(--faint)}}
.chip.aaron{{color:var(--blue);border-color:rgba(127,178,204,.45)}}
.chip.st.doing{{color:#1c0f02;background:var(--accent);border-color:var(--accent)}}
.chip.st.blocked{{color:#d5a24b;border-color:rgba(213,162,75,.5)}}
.item{{font-size:15.5px}}
.item b{{color:var(--ink)}}
.note{{margin-top:6px;font-size:13px;color:var(--faint);line-height:1.55}}
.note a{{color:var(--accent);word-break:break-all}}
.note code{{font-family:var(--mono);font-size:12px;color:var(--ink);
background:rgba(255,176,58,.08);padding:0 4px;border-radius:4px}}
footer{{margin-top:60px;padding-top:16px;border-top:1px solid var(--line);
font-family:var(--mono);font-size:11px;color:var(--dim);line-height:1.9}}
</style>
<div class="wrap">
<header>
  <div class="eyebrow">Ball Knowledge · TODO.md rendered whole · {total} rows</div>
  <h1>The whole list</h1>
  <p class="lede">Every row of all six lists, numbers and notes included. <b>List 1 is in
  ruled order</b> (Aaron, 08-24): the rank on the left is the plan to the twenty, the
  <b>#number</b> is the row's permanent name and never changes when it moves.
  Generated from TODO.md, so if this page and the file ever disagree, the file wins
  and this page gets republished.</p>
</header>
{''.join(sections)}
<footer>generated by tools/list-artifact.py from TODO.md · gates: python3 tools/list.py --check ·
whose=AARON marks a row waiting on his call · blocked rows stay in their list and just change hands</footer>
</div>"""

open(OUT, 'w').write(page)
print(f'{OUT} · {total} rows · {round(len(page) / 1024)} KB')

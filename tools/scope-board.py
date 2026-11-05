#!/usr/bin/env python3
"""Build the fourteen-day scope board from the scope workflow's JSON result.

usage: python3 tools/scope-board.py <result.json> <out.html> [mypick.html]

The result is the return value of the fourteen-day-scope workflow (four
measurement reports, three composed scopes, six verdicts), kept in
design/scope-cut-2026-11-05/result.json so a container move cannot lose it.
The page speaks to Aaron as "you"; the readers wrote about him in the third
person, so their prose is re-voiced here and the verb agreement fixed. My own
pick, written by hand, is pasted in from mypick.html after the options, as the
option law requires (recommendation last, nothing ships until he picks).
"""
import collections, html, json, os, re, sys

R = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
PICK = sys.argv[3] if len(sys.argv) > 3 else ''
T, S, B, M, C, J = (R.get(k) for k in ('throughput', 'sizing', 'bank', 'mechanics', 'composed', 'judged'))
E = lambda x: html.escape(str(x), quote=True)


def days_fmt(d):
    return f"{d:g}"


# ---------- the arithmetic strip ----------
stats = [('14', 'days of work', 'from the day you restart')]
if T:
    # Only the period git can see: the clone is shallow (history starts 08-28), so
    # the Track B period's quiet-day count is an artefact and its row count an
    # undercount. The gameplay rebuild period is the measured one.
    p = next((p for p in T['periods'] if p['from'] >= '2026-08-22'), T['periods'][-1])
    stats.append((f"{p['per_ship_day']:.1f}", 'rows closed per ship day', f"{p['from'][5:]} to {p['to'][5:]} · {p['ship_days']} ship days in 24"))
    stats.append((f"{T['ruling_lag']['typical_days']:g}", 'day, ruling to built', f"median of {len(T['ruling_lag']['samples'])} rows"))
if S:
    stats.append((days_fmt(S['total_days']), 'build days on list 1', f"{S['count']} rows sized, one agent"))
if B:
    stats.append((str(B['now']['dealable']), 'cards dealable', f"of {B['now']['target']:,} ruled"))
    stats.append((str(B['now']['ceiling']), 'ceiling by reading', 'the rest must be written'))
stat_html = ''.join(f'<div class="cell"><b>{E(v)}</b><span>{E(k)}</span><i>{E(sub)}</i></div>' for v, k, sub in stats[:6])

# ---------- the scopes ----------
jud = {j['scope']: j['verdicts'] for j in (J or [])}


def late(s):
    d = s['day_of_14'].lower()
    return 'does not fit' in d or 'does not finish' in d or 'past day 14' in d or 'beyond day 14' in d


def scope_card(sc):
    fits = [s for s in sc['ships'] if not late(s)]
    falls = [s for s in sc['ships'] if late(s)]
    fit_days = sum(s['days'] for s in fits)
    fall_days = sum(s['days'] for s in falls)
    row = lambda s: f'<li><span class="rn">#{s["row"]}</span>{E(s["item"])}<span class="dd">{days_fmt(s["days"])}d · {E(s["day_of_14"])}</span></li>'
    ships = ''.join(row(s) for s in fits)
    lates = ''.join(row(s) for s in falls)
    cuts = ''.join(f'<li><span class="rn">#{c["row"]}</span>{E(c["item"])}<span class="why">{E(c["why"])}</span></li>' for c in sc['cut_to_list3'])
    rul = ''.join(f'<li>{E(r["what"])}<span class="dd">{E(r["by_day"])}</span></li>' for r in sc['rulings_needed'])
    vs = jud.get(sc['number'], [])
    verdicts = ''
    for v in vs:
        verdicts += (f'<div class="verdict"><b>{E(v["lens"])} · {"fits" if v["feasible"] else "does not fit"} · {v["score"]} of 5</b>'
                     f'<p>{E(v["arithmetic"])}</p>'
                     f'<p><em>What you would hate:</em> {E(v["what_he_would_hate"])}</p>'
                     f'<p><em>Missing:</em> {E(v["what_is_missing"])}</p>'
                     f'<p><em>The one change:</em> {E(v["change"])}</p></div>')
    ok = sc['build_days'] <= sc['days_available']
    vline = ' · '.join(f'{E(v["lens"])} {v["score"]} of 5' for v in vs)
    return f'''<article class="opt" data-n="{sc['number']}">
  <header><span class="num">{sc['number']}</span><h3>{E(sc['name'])}</h3></header>
  <p class="thesis">{E(sc['thesis'])}</p>
  <div class="arith {'ok' if ok else 'over'}"><b>{days_fmt(sc['build_days'])} build days</b> as composed, against the {sc['days_available']} it assumes{'' if ok else ' · over'}<br>{days_fmt(fit_days)} placed inside the fourteen days, {days_fmt(fall_days)} fall past them · judges: {vline}</div>
  <h4>Placed inside the fourteen days</h4><ol class="rows">{ships}</ol>
  <h4>Falls past day 14 as scheduled</h4><ul class="rows cuts">{lates or '<li>Nothing.</li>'}</ul>
  <h4>Moves to list 3, after the twenty</h4><ul class="rows cuts">{cuts}</ul>
  <h4>The bank rule it needs</h4><p class="rule">{E(sc['gate1_rule'])}</p>
  <h4>Rulings it needs from you, and when</h4><ul class="rows">{rul}</ul>
  <h4>What it asks you to overrule</h4><p class="over">{E(sc['overrules_himself'])}</p>
  <h4>The risk</h4><p>{E(sc['risk'])}</p>
  <details class="jd"><summary>The two judges</summary>{verdicts or '<p>No verdict landed.</p>'}</details>
  <label class="pick"><input type="radio" name="scope" value="{sc['number']}"> Scope {sc['number']}</label>
</article>'''


scopes_html = ''.join(scope_card(sc) for sc in (C['scopes'] if C else []))
differences = E(C['differences']) if C else ''
all_v = [v for vs in jud.values() for v in vs]
n_fit = sum(1 for v in all_v if v['feasible'])
verdict_line = ''
if all_v:
    verdict_line = (f'<div class="arith {"ok" if n_fit == len(all_v) else "over"}" style="margin-top:0;margin-bottom:14px"><b>{len(all_v)} verdicts, {n_fit} say the scope fits.</b> '
                    + ' · '.join(f'scope {n}: ' + ', '.join(f'{v["lens"]} {v["score"]} of 5' for v in vs) for n, vs in sorted(jud.items()))
                    + '. Each card below splits what its schedule places inside the fourteen days from what it lets fall past; the judges sit under each card.</div>')

# ---------- the bank rule options ----------
rules_html = bank_tables = gate_words = ''
if B:
    for i, o in enumerate(B['rule_options'], 1):
        letter = 'ABCDEFG'[i - 1]
        reach = o['reachable_in_14_days']
        rules_html += (f'<article class="opt small"><header><span class="num">{letter}</span><h3>{E(o["option"])}</h3></header>'
                       f'<p>{E(o["what_it_means"])}</p><p class="reach {"ok" if reach else "over"}">{"Reachable in fourteen days" if reach else "Not reachable in fourteen days"}</p>'
                       f'<label class="pick"><input type="radio" name="bank" value="{letter}"> Rule {letter}</label></article>')
    proj = ''.join(f'<tr><td>{E(p["effort"])}</td><td class="n">{p["dealable_by_day_14"]}</td><td>{E(p["assumptions"])}</td></tr>' for p in B['projections_14_days'])
    hist = ''.join(f'<tr><td>{E(h["date"])}</td><td class="n">{h["dealable"]}</td><td>{E(h["source"])}</td></tr>' for h in B['history'])
    bank_tables = f'''<div class="tw"><table><thead><tr><th>If, for fourteen days, we</th><th>dealable on day 14</th><th>assuming</th></tr></thead><tbody>{proj}</tbody></table></div>
<details><summary>How the count has moved</summary><div class="tw"><table><thead><tr><th>Date</th><th>Dealable</th><th>Where the number is recorded</th></tr></thead><tbody>{hist}</tbody></table></div></details>
<p class="note">{E(B['spread_rule'])}</p>'''
    gate_words = E(B['gate_text'])

# ---------- the mechanics ----------
mech_html = ''
if M:
    strip = lambda s: re.sub(r'^\s*\d+\.\s*', '', s)
    mb = ''.join(f'<li class="{E(x["state"])}">{E(x["what"])}<span class="why">{E(x["evidence"])}</span></li>' for x in M['must_be_true'])
    lb = ''.join(f'<li class="{"open" if x["on_main_today"] else "done"}">{E(x["what"])} <span class="rn">{E(x["row"])}</span><span class="why">{"on the live game today" if x["on_main_today"] else "not on the live game"}{" · fixed on the branch" if x["fixed_on_branch"] else ""}</span></li>' for x in M['live_blockers'])
    steps = ''.join('<li>' + E(strip(s)) + '</li>' for s in M['steps_to_send_link'])
    mech_html = f'''<h4>The date, as the record has it</h4><p class="note">{E(M['the_date'])}</p>
<h4>Must be true to send the link</h4><ul class="rows ck">{mb}</ul>
<h4>What a tester hits in the first ten minutes on the live game today</h4><ul class="rows ck">{lb}</ul>
<h4>The day itself</h4><ol class="rows">{steps}</ol>'''

# ---------- the sizing ----------
size_html = kind_html = ''
if S:
    by_kind = collections.OrderedDict()
    for r in S['rows']:
        d = by_kind.setdefault(r['kind'], [0, 0.0])
        d[0] += 1; d[1] += r['days']
    kind_rows = ''.join(f'<tr><td>{E(k)}</td><td class="n">{n}</td><td class="n">{days_fmt(d)}</td><td><div class="kb"><i style="width:{min(100, d / S["total_days"] * 100):.1f}%"></i></div></td></tr>'
                        for k, (n, d) in sorted(by_kind.items(), key=lambda kv: -kv[1][1]))
    waits = collections.Counter(r['needs'] for r in S['rows'])
    wait_rows = ''.join(f'<tr><td>{E(k)}</td><td class="n">{n}</td><td class="n">{days_fmt(sum(r["days"] for r in S["rows"] if r["needs"] == k))}</td></tr>' for k, n in waits.most_common())
    kind_html = f'''<p class="rq">Where the {days_fmt(S['total_days'])} build days on list 1 go, by the kind of work, and what each row waits on besides build time. One agent, your rulings arriving about once a day; a day here is a build day, not a calendar day.</p>
<div class="two">
<div class="tw"><table><thead><tr><th>Kind of work</th><th>Rows</th><th>Build days</th><th></th></tr></thead><tbody>{kind_rows}</tbody></table></div>
<div class="tw"><table><thead><tr><th>What the row needs first</th><th>Rows</th><th>Build days</th></tr></thead><tbody>{wait_rows}</tbody></table></div>
</div>'''
    rows = ''.join(f'<tr><td class="n">#{r["n"]}</td><td>{E(r["item"])}</td><td class="n">{r["size"]} · {days_fmt(r["days"])}d</td><td>{E(r["needs"])}{(" · " + E(r["depends_on"])) if r["depends_on"] else ""}</td><td>{E(r["kind"])}</td><td class="rs">{E(r["reason"])}</td></tr>' for r in S['rows'])
    size_html = f'<details><summary>Every open row on the road, sized ({S["count"]} rows, {days_fmt(S["total_days"])} build days in all)</summary><div class="tw"><table class="sz"><thead><tr><th>Row</th><th>Item</th><th>Size</th><th>Needs</th><th>Kind</th><th>Why that size</th></tr></thead><tbody>{rows}</tbody></table></div></details>'

pace_words = E(T['what_a_day_buys']) if T else ''
silence = E(T['silence']) if T and T.get('silence') else ''

page = f'''<title>The Fourteen-Day Cut</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Space+Mono:wght@400;700&display=swap">
<style>
:root{{--bg:#0d0906;--panel:#160f09;--line:rgba(255,176,58,.18);--ink:#efe6d5;--faint:#b7a687;--dim:#8a7a5e;--accent:#ffb03a;--blue:#7fb2cc;--ok:#7ff08a;--over:#ff8a6a;--mono:'Space Mono',ui-monospace,monospace}}
*{{box-sizing:border-box;margin:0}}
body{{background:var(--bg);color:var(--ink);font-family:'Archivo',system-ui,sans-serif;font-variation-settings:'wdth' 96;line-height:1.5;padding:0 16px 150px}}
.wrap{{max-width:1180px;margin:0 auto}}
header.top{{padding:48px 0 18px;border-bottom:1px solid var(--line)}}
.eyebrow{{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--accent)}}
h1{{font-weight:900;font-variation-settings:'wdth' 78;font-size:clamp(32px,6vw,54px);line-height:1.02;text-transform:uppercase;margin:10px 0}}
.lede{{color:var(--faint);max-width:66ch;font-size:15.5px}}.lede b{{color:var(--ink)}}
.board{{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-top:22px;grid-template-columns:repeat(2,1fr)}}
@media(min-width:720px){{.board{{grid-template-columns:repeat(3,1fr)}}}}@media(min-width:1000px){{.board{{grid-template-columns:repeat(6,1fr)}}}}
.cell{{background:var(--panel);padding:12px 13px;display:flex;flex-direction:column;gap:2px}}
.cell b{{font-family:var(--mono);font-size:24px;color:var(--accent);font-weight:700}}
.cell span{{font-family:var(--mono);font-size:9.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--faint)}}.cell i{{font-style:normal;font-family:var(--mono);font-size:9px;color:var(--dim)}}
section{{margin-top:54px}}
h2{{font-weight:900;font-variation-settings:'wdth' 80;font-size:clamp(20px,3.2vw,27px);text-transform:uppercase}}
.rq{{color:var(--faint);margin:6px 0 18px;max-width:66ch}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:16px;align-items:start}}
.opt{{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px;min-width:0}}
.opt header{{display:flex;align-items:center;gap:10px}}
.num{{font-family:var(--mono);font-weight:700;color:#1c0f02;background:var(--accent);border-radius:8px;padding:2px 10px;font-size:15px}}
.opt h3{{font-size:17px;font-weight:800}}.opt h4{{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-top:6px}}
.thesis{{font-size:15px;color:var(--ink)}}
.arith{{font-family:var(--mono);font-size:12px;padding:8px 10px;border-radius:8px;border:1px solid var(--line)}}.arith.ok{{color:var(--ok)}}.arith.over{{color:var(--over);border-color:rgba(255,138,106,.5)}}
.rows{{list-style:none;padding:0;display:flex;flex-direction:column;gap:5px;font-size:13.5px}}
.rows li{{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:baseline;border-top:1px solid var(--line);padding-top:5px}}
ol.rows{{counter-reset:n}}ol.rows li::before{{counter-increment:n;content:counter(n) ".";font-family:var(--mono);color:var(--dim);font-size:11px}}
.rn{{font-family:var(--mono);font-size:11px;color:var(--accent);font-weight:700}}
.dd{{font-family:var(--mono);font-size:10.5px;color:var(--dim);margin-left:auto;text-align:right;max-width:100%;overflow-wrap:anywhere}}
.why{{flex-basis:100%;font-size:12.5px;color:var(--faint)}}
.rows li,.why,.verdict,td,.rule,.over,.thesis,.note,blockquote,.my p,.my li,.diff{{overflow-wrap:anywhere;min-width:0}}
code{{font-family:var(--mono);font-size:.92em;color:var(--accent)}}
.cuts li{{opacity:.85}}.rule,.over{{font-size:13.5px;color:var(--faint)}}.over{{color:var(--ink)}}
.jd summary{{cursor:pointer;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}}
.verdict{{margin-top:8px;padding:10px;border-radius:8px;background:rgba(255,176,58,.06);font-size:13px;color:var(--faint)}}.verdict b{{color:var(--ink);font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase}}.verdict p{{margin-top:5px}}.verdict em{{color:var(--ink);font-style:normal}}
.pick{{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);cursor:pointer;padding:6px 0;margin-top:4px}}
.pick input{{accent-color:var(--accent);width:18px;height:18px}}
.opt:has(input:checked){{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}}
.opt.small p{{font-size:13.5px;color:var(--faint)}}.reach{{font-family:var(--mono);font-size:11px}}.reach.ok{{color:var(--ok)}}.reach.over{{color:var(--over)}}
.diff{{margin-top:18px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:var(--panel);max-width:80ch;color:var(--faint);font-size:14.5px}}
.tw{{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--panel);margin-top:12px}}
table{{border-collapse:collapse;width:100%;font-size:13px;min-width:520px}}th{{text-align:left;font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);padding:10px 12px;border-bottom:1px solid var(--line)}}td{{padding:8px 12px;border-bottom:1px solid var(--line);vertical-align:top;color:var(--faint)}}td.n{{font-family:var(--mono);color:var(--accent);white-space:nowrap}}td.rs{{font-size:12px}}
details>summary{{cursor:pointer;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-top:14px}}
.ck li.done{{color:var(--dim)}}.ck li.done::before{{content:"\\25CF";color:var(--ok)}}.ck li.open::before{{content:"\\25CB";color:var(--over)}}.ck li.unknown::before{{content:"?";color:var(--dim)}}
.note{{color:var(--dim);font-size:13px;margin-top:10px;max-width:80ch}}
.two{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:start}}.two .tw{{margin-top:0}}.two table{{min-width:0}}
.kb{{height:6px;min-width:60px;background:rgba(255,176,58,.12);border-radius:3px;overflow:hidden}}.kb i{{display:block;height:100%;background:var(--accent)}}
blockquote{{border-left:3px solid var(--accent);padding:6px 14px;color:var(--faint);font-size:14px;max-width:80ch;margin-top:10px}}
.my{{margin-top:54px;padding:18px 20px;border:1px solid var(--line);border-radius:14px;background:var(--panel);max-width:80ch}}.my h2{{font-size:18px;margin-bottom:8px}}.my p{{color:var(--faint);font-size:14.5px;margin-top:8px}}.my b{{color:var(--ink)}}.my ol{{margin-top:8px}}
.bar{{position:fixed;left:0;right:0;bottom:0;background:#1a120a;border-top:1px solid var(--line);padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;z-index:5}}
.bar .out{{font-family:var(--mono);font-size:13px;color:var(--ink);flex:1;min-width:220px}}
.bar label{{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);display:inline-flex;align-items:center;gap:8px}}
.bar input[type=date]{{font-family:var(--mono);font-size:13px;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:6px 8px}}
.bar button{{font-family:var(--mono);font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:12px;background:var(--accent);color:#1c0f02;border:0;border-radius:10px;padding:10px 16px;cursor:pointer}}.bar button:focus-visible,.bar input:focus-visible{{outline:3px solid #fff;outline-offset:2px}}
@media(prefers-reduced-motion:reduce){{*{{transition:none}}}}
</style>
<div class="wrap">
<header class="top">
  <div class="eyebrow">Ball Knowledge · the road to the twenty · built 11-05</div>
  <h1>The fourteen-day cut</h1>
  <p class="lede">You set November 1 on the night of October 18. It passed with no ruling, no cut and no launch, and nothing in the repo has moved since 10-18. This page is the arithmetic of fourteen days of work from whatever day you restart, measured against what the project has actually shipped per day since August, with every open row on the road sized against a comparable thing that already shipped. <b>Three rulings are yours here:</b> the scope (one of three cuts, or your own), the bank rule (what "1,000 verified cards" becomes with fourteen days), and the date. None of the three cuts fits the measured days as written, and each card says so; my own pick is at the bottom, after the options. Tap a scope and a rule, set the date, copy the line at the bottom, and send it, or write your own cut.</p>
</header>
<div class="board">{stat_html}</div>
<p class="note">{pace_words}</p>
<p class="note">{silence}</p>

<section>
  <h2>Round 1 · the scope</h2>
  <p class="rq">Three cuts, each a different thesis about what the twenty get on the day. Every row named is a row on list 1; its days come from the sizing table at the bottom; the schedule allows for your rulings arriving about once a day and for the measured quiet days. Two judges read each one: one for the arithmetic, one for what you have already said you want.</p>
  {verdict_line}
  <div class="grid">{scopes_html}</div>
  <div class="diff">{differences}</div>
</section>

<section>
  <h2>Round 2 · the bank rule</h2>
  <p class="rq">Your ruling on 08-06 and 08-07, in your words:</p>
  <blockquote>{gate_words}</blockquote>
  {bank_tables}
  <div class="grid" style="margin-top:18px">{rules_html}</div>
</section>

<section>
  <h2>The day itself</h2>
  <p class="rq">What the record says about the date that passed, what has to be true to send the link, what a tester hits today, and the steps on the day.</p>
  {mech_html}
</section>

<section>
  <h2>The sizing, row by row</h2>
  {kind_html}
  {size_html}
</section>

<div class="my" id="mypick">__MYPICK__</div>
</div>
<div class="bar">
  <span class="out" id="out">Scope: none · Bank rule: none · Date: none</span>
  <label>The new date <input type="date" id="date"></label>
  <button id="copy" type="button">Copy the picks</button>
</div>
<script>
(function(){{
  var out=document.getElementById('out');
  function line(){{var a=document.querySelector('input[name=scope]:checked'),b=document.querySelector('input[name=bank]:checked'),d=document.getElementById('date').value;return 'Scope: '+(a?a.value:'none')+' · Bank rule: '+(b?b.value:'none')+' · Date: '+(d||'none');}}
  document.addEventListener('change',function(){{out.textContent=line();}});
  document.getElementById('copy').addEventListener('click',function(){{var t=line();var done=function(){{out.textContent=t+'  (copied)';}};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,done);else done();}});
}})();
</script>
'''

# The readers wrote about Aaron in the third person (their reports are evidence);
# the page speaks to him. Convert the voice and fix verb agreement after "you".
VERB = {'is': 'are', 'was': 'were', 'has': 'have', 'does': 'do', 'says': 'say', 'rules': 'rule',
        'merges': 'merge', 'picks': 'pick', 'wants': 'want', 'sends': 'send', 'names': 'name',
        'plays': 'play', 'gives': 'give', 'opens': 'open', 'makes': 'make', 'taps': 'tap',
        'needs': 'need', 'keeps': 'keep', 'gets': 'get', 'sees': 'see', 'hits': 'hit',
        'reads': 'read', 'puts': 'put', 'asks': 'ask', 'calls': 'call', 'takes': 'take',
        'knows': 'know', 'moves': 'move', 'owes': 'owe', 'holds': 'hold', 'runs': 'run',
        'means': 'mean', 'adds': 'add', 'leaves': 'leave', 'comes': 'come', 'goes': 'go',
        'decides': 'decide', 'confirms': 'confirm', 'clicks': 'click', 'deletes': 'delete',
        'turns': 'turn', 'invites': 'invite', 'looks': 'look', 'finds': 'find', 'thinks': 'think',
        'feels': 'feel', 'likes': 'like', 'catches': 'catch', 'describes': 'describe',
        'answers': 'answer', 'judges': 'judge', 'sources': 'source', 'buys': 'buy', 'lets': 'let',
        'tells': 'tell', 'agrees': 'agree', 'approves': 'approve', 'accepts': 'accept',
        'starts': 'start', 'stops': 'stop', 'ships': 'ship', 'builds': 'build', 'writes': 'write',
        'pays': 'pay', 'loses': 'lose', 'wins': 'win', 'meets': 'meet', 'hates': 'hate',
        'misses': 'miss', 'ends': 'end', 'draws': 'draw', 'wakes': 'wake', 'expects': 'expect',
        'considers': 'consider', 'prefers': 'prefer', 'chooses': 'choose', 'signs': 'sign',
        'returns': 'return', 'arrives': 'arrive', 'rejects': 'reject', 'overrules': 'overrule',
        'reverses': 'reverse', 'carries': 'carry', 'wears': 'wear', 'plans': 'plan', 'hands': 'hand',
        'spends': 'spend', 'reaches': 'reach', 'speaks': 'speak', 'rates': 'rate', 'notes': 'note',
        'stays': 'stay', 'lives': 'live', 'rolls': 'roll', 'drives': 'drive', 'enters': 'enter',
        'joins': 'join', 'shares': 'share', 'forwards': 'forward', 'reopens': 'reopen', 'flips': 'flip',
        'skips': 'skip', 'nails': 'nail', 'pulls': 'pull', 'pushes': 'push', 'types': 'type',
        'lands': 'land', 'waits': 'wait', 'cuts': 'cut', 'sets': 'set', 'produces': 'produce',
        'uses': 'use', 'sits': 'sit', 'fills': 'fill', 'owns': 'own', 'comes': 'come', 'tries': 'try',
        'likes': 'like', 'opens': 'open', 'closes': 'close', 'fixes': 'fix', 'checks': 'check',
        'restarts': 'restart', 'resumes': 'resume', 'shows': 'show', 'allows': 'allow', 'intends': 'intend'}
ADV = r'(?:also|still|never|already|then|only|just|first|now|even|rarely|often|always|himself|yourself|actually|probably|clearly|simply|later|once|again)'


def you_voice(s):
    s = re.sub(r"\bAaron(,? (?:same day|0[89]-[0-9]{2}|1[01]-[0-9]{2}|2026-[0-9-]+))?: ([\"“'])", lambda m: 'your words' + (m.group(1) or '') + ': ' + m.group(2), s)
    s = re.sub(r"\"Aaron blocked\"", '"blocked on you"', s)
    s = re.sub(r"\bAaron's\b", 'your', s)
    s = re.sub(r"\bAaron\b", 'you', s)
    s = re.sub(r"\bhimself\b", 'yourself', s)
    s = re.sub(r"\bhis\b", 'your', s); s = re.sub(r"\bHis\b", 'Your', s)
    s = re.sub(r"\bhim\b", 'you', s)
    s = re.sub(r"\bhe\b", 'you', s); s = re.sub(r"\bHe\b", 'You', s)
    s = re.sub(r"\b([Yy]ou )([a-z]+)\b", lambda m: m.group(1) + VERB.get(m.group(2), m.group(2)), s)
    s = re.sub(r"\b([Yy]ou " + ADV + r" )([a-z]+)\b", lambda m: m.group(1) + VERB.get(m.group(2), m.group(2)), s)
    s = re.sub(r"(^|[.!?]\s+|\(\s*)you\b", lambda m: m.group(1) + 'You', s)
    return s


head, body = page.split('<div class="wrap">', 1)
body, tail = body.split('<div class="my" id="mypick">', 1)
page = head + '<div class="wrap">' + you_voice(body) + '<div class="my" id="mypick">' + tail
if PICK and os.path.exists(PICK):
    page = page.replace('__MYPICK__', open(PICK).read())
# the language law: no em dashes on anything written for Aaron; a quoted heading
# loses its dash to a comma, which reads the same
page = page.replace(' — ', ', ').replace('—', ', ').replace(' – ', ', ')
open(OUT, 'w').write(page)
left = sorted(set(m.group(0) for m in re.finditer(r"\b[Yy]ou (?:\w+ )?[a-z]+s\b", page)))
print(len(page) // 1024, 'KB', 'scopes', len(C['scopes']) if C else 0, 'rules', len(B['rule_options']) if B else 0,
      'rows', S['count'] if S else 0, '| em dashes left:', page.count('—'), '| placeholder left:', '__MYPICK__' in page)
print('review "you ...s":', left)

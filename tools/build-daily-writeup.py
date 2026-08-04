#!/usr/bin/env python3
"""Assemble the Daily Five write-up as one self-contained page.

Fonts and screenshots are inlined as data URIs — the Artifact CSP blocks every
external host, and a silent font fallback would make the page look nothing like
the game it is describing. Palette and type come straight from docs/play/index.html
so this reads as the same product, not a report about it.
"""
import base64, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = '/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/web'
FONTS = os.path.join(ROOT, 'docs/play/assets/fonts')
OUT = os.path.join(ROOT, 'design/daily-five-writeup.html')


def font(name):
    with open(os.path.join(FONTS, name), 'rb') as f:
        return 'data:font/woff2;base64,' + base64.b64encode(f.read()).decode()


def img(name):
    p = os.path.join(SHOTS, name + '.jpg')
    if not os.path.exists(p):
        print('MISSING', p, file=sys.stderr)
        return ''
    with open(p, 'rb') as f:
        return 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode()


def shot(name, cap):
    return (f'<figure class="shot"><img src="{img(name)}" alt="{cap}" loading="lazy">'
            f'<figcaption>{cap}</figcaption></figure>')


def pair(dname, mname, dcap, mcap):
    return (f'<div class="pair"><figure class="shot"><img src="{img(dname)}" alt="{dcap}" loading="lazy">'
            f'<figcaption><b>Desktop</b> {dcap}</figcaption></figure>'
            f'<figure class="shot phone"><img src="{img(mname)}" alt="{mcap}" loading="lazy">'
            f'<figcaption><b>Phone · 390px</b> {mcap}</figcaption></figure></div>')


CSS = """
@font-face{font-family:'Anton';font-weight:400;font-display:block;src:url(%(anton)s) format('woff2')}
@font-face{font-family:'Archivo';font-weight:600 900;font-display:block;src:url(%(archivo)s) format('woff2')}
@font-face{font-family:'SpaceMono';font-weight:400;font-display:block;src:url(%(mono)s) format('woff2')}
@font-face{font-family:'SpaceMono';font-weight:700;font-display:block;src:url(%(monob)s) format('woff2')}
@font-face{font-family:'Sedgwick';font-weight:400;font-display:block;src:url(%(sedgwick)s) format('woff2')}

:root{
  --ground:#100d0b; --panel:#1d1815; --panel2:#242019; --line:#3a332a;
  --ink:#efe6d8; --dim:#b3a894; --faint:#7d735f;
  --accent:#f5872e; --deep:#c9641a; --away:#58a8d6;
  --ok:#6fbf73; --call:#e8b84b; --no:#d5524b; --gold:#ffcf6a;
  --mono:'SpaceMono',ui-monospace,Menlo,monospace;
  --sans:'Archivo',system-ui,sans-serif;
  --display:'Anton','Archivo',sans-serif;
}
@media (prefers-color-scheme:light){
  :root{--ground:#e9e2d4;--panel:#fbf7ee;--panel2:#f1ead9;--line:#cdbfa6;
        --ink:#2a2118;--dim:#6a5c48;--faint:#9a8b73;--deep:#a4500f;
        --ok:#3f7d43;--call:#9a7413;--no:#a8352e;--gold:#8a6a12}
}
:root[data-theme="light"]{--ground:#e9e2d4;--panel:#fbf7ee;--panel2:#f1ead9;--line:#cdbfa6;
        --ink:#2a2118;--dim:#6a5c48;--faint:#9a8b73;--deep:#a4500f;
        --ok:#3f7d43;--call:#9a7413;--no:#a8352e;--gold:#8a6a12}
:root[data-theme="dark"]{--ground:#100d0b;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
        --ink:#efe6d8;--dim:#b3a894;--faint:#7d735f;--deep:#c9641a;
        --ok:#6fbf73;--call:#e8b84b;--no:#d5524b;--gold:#ffcf6a}

*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);
  font-weight:600;line-height:1.62;-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:0 24px 96px}
.col{max-width:68ch}

header.top{padding:64px 0 40px;border-bottom:1px solid var(--line);margin-bottom:8px}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.22em;text-transform:uppercase;
  color:var(--faint);margin:0 0 18px}
h1{font-family:'Sedgwick','Anton',cursive;font-weight:400;font-size:clamp(44px,8vw,86px);
  line-height:.94;margin:0 0 6px;text-wrap:balance}
h1 .b{color:var(--ink)} h1 .o{color:var(--accent)}
.sub{font-size:19px;color:var(--dim);margin:16px 0 0;max-width:60ch}

h2{font-family:var(--display);font-weight:400;font-size:clamp(26px,3.4vw,38px);
  letter-spacing:.005em;margin:72px 0 6px;text-transform:uppercase;text-wrap:balance}
h2 .n{color:var(--accent);font-size:.62em;vertical-align:.18em;margin-right:.5em;
  font-family:var(--mono);font-weight:700;letter-spacing:.1em}
h3{font-family:var(--sans);font-weight:800;font-size:19px;margin:34px 0 4px;letter-spacing:-.005em}
p{margin:14px 0}
a{color:var(--accent)}
strong{color:var(--ink);font-weight:800}
code,.k{font-family:var(--mono);font-size:.88em;background:var(--panel2);
  border:1px solid var(--line);border-radius:4px;padding:1px 5px;color:var(--gold)}

.lede{font-size:20px;color:var(--dim);border-left:3px solid var(--accent);
  padding-left:20px;margin:26px 0 0}

ul{padding-left:0;list-style:none;margin:16px 0}
ul li{position:relative;padding-left:22px;margin:9px 0}
ul li::before{content:"";position:absolute;left:2px;top:.62em;width:7px;height:7px;
  background:var(--accent);border-radius:50%%}

/* the status language is the GAME's difficulty language, on purpose */
.tag{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;padding:3px 9px;border-radius:3px;border:1px solid;
  display:inline-block;vertical-align:.15em}
.t-ok{color:var(--ok);border-color:var(--ok)}
.t-call{color:var(--call);border-color:var(--call)}
.t-no{color:var(--no);border-color:var(--no)}

.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;
  padding:24px 26px;margin:22px 0}
.card.flag{border-color:var(--call);background:color-mix(in srgb,var(--call) 7%%,var(--panel))}
.card.bad{border-color:var(--no);background:color-mix(in srgb,var(--no) 7%%,var(--panel))}
.card h3{margin-top:0}

.pair{display:grid;grid-template-columns:1fr 460px;gap:22px;align-items:start;margin:26px 0}
@media (max-width:900px){.pair{grid-template-columns:1fr}}
.shot{margin:0}
.shot img{width:100%%;height:auto;display:block;border:1px solid var(--line);
  border-radius:8px;background:#000}
.shot.phone img{max-width:340px}
figcaption{font-family:var(--mono);font-size:12px;color:var(--faint);margin-top:9px;line-height:1.5}
figcaption b{color:var(--dim);font-weight:700}

.strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;margin:26px 0}
.strip .shot img{border-radius:6px}

table{width:100%%;border-collapse:collapse;margin:20px 0;font-size:15px}
.scroll{overflow-x:auto}
th,td{text-align:left;padding:11px 14px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--faint);font-weight:700}
td.num{font-family:var(--mono);font-variant-numeric:tabular-nums;color:var(--gold);white-space:nowrap}

.q{border-top:1px solid var(--line);padding:26px 0 4px}
.q:last-child{border-bottom:1px solid var(--line);margin-bottom:8px}
.qh{display:flex;gap:14px;align-items:baseline;flex-wrap:wrap}
.qn{font-family:var(--mono);font-weight:700;color:var(--accent);font-size:13px;letter-spacing:.1em}
.qt{font-family:var(--sans);font-weight:800;font-size:20px;letter-spacing:-.01em}
.qb{color:var(--dim);margin:10px 0 0}
.qb .rec{color:var(--ink);font-weight:800}

footer{margin-top:80px;padding-top:26px;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:12px;color:var(--faint);line-height:1.9}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
"""


def build():
    css = CSS % {
        'anton': font('anton-400.woff2'),
        'archivo': font('archivo-600.woff2'),
        'mono': font('spacemono-400.woff2'),
        'monob': font('spacemono-700.woff2'),
        'sedgwick': font('sedgwick-400.woff2'),
    }
    body = open(os.path.join(ROOT, 'design/daily-five-body.html'), encoding='utf-8').read()
    body = body.replace('{{PAIR_MENU}}', pair(
        'desktop-1-menu-fresh', 'mobile-1-menu-fresh',
        'the stamp waiting, 198×204, tilted 6°, 13px from the wordmark',
        'the stamp stacks ABOVE the title here — 0px of shared height'))
    body = body.replace('{{PAIR_BEFORE}}', pair(
        'desktop-0-menu-before', 'mobile-0-menu-before',
        'the menu with the stamp hidden — what it looked like before',
        'same menu, no stamp — the logo sat at the top'))
    body = body.replace('{{PAIR_DONE}}', pair(
        'desktop-8-menu-done', 'mobile-8-menu-done',
        'crossed off: greyed, green tick, BACK TOMORROW, no bounce',
        'same treatment on the phone'))
    body = body.replace('{{STAMP}}', shot(
        'desktop-2-stamp-closeup', 'The stamp on its own.'))
    body = body.replace('{{PAIR_R1}}', pair(
        'desktop-3-round1-card', 'mobile-3-round1-card',
        'Round one. Five spots on the floor, easiest at the rim.',
        'the court and the card both fit without scrolling'))
    body = body.replace('{{PAIR_MISS}}', pair(
        'desktop-4-miss-no-reveal', 'mobile-4-miss-no-reveal',
        'a miss: your tap goes red, the other three say NOTHING',
        'same on the phone — no green anywhere'))
    body = body.replace('{{PAIR_R2}}', pair(
        'desktop-6-round2-card', 'mobile-6-round2-card',
        'Round two — now you are defending.',
        'the stop strip replaces the court'))
    body = body.replace('{{PAIR_RECEIPT}}', pair(
        'desktop-9-receipt-swept', 'mobile-9-receipt-swept',
        'a clean 24 of 24. The share block is the text that gets pasted.',
        'the receipt on a phone'))
    body = body.replace('{{PAIR_LOCKED}}', pair(
        'desktop-7-receipt-locked', 'mobile-7-receipt-locked',
        '9 of 10 — the bonus stays LOCKED and the receipt says so',
        'one miss is all it takes'))
    body = body.replace('{{PAIR_HEAT}}', pair(
        'desktop-10-heat-check', 'mobile-10-heat-check',
        'The Heat Check. Type the name, no options to guess between.',
        'the typing box sits above the fold on a phone'))
    body = body.replace('{{BREAK}}', shot(
        'desktop-5-round-break', 'Between the rounds.'))
    body = body.replace('{{STAMP_MARKS}}',
        '<div class="strip">'
        + shot('desktop-2b-stamp-star', 'Gold star — you played it today.')
        + shot('desktop-2b-stamp-crown', 'Gold crown — all eleven.')
        + '</div>')
    body = body.replace('{{PAIR_CAL}}', pair(
        'desktop-11-calendar', 'mobile-11-calendar',
        'crowns, stars, green checks — and dashed boxes you can still go back and play',
        'the same calendar on a phone'))

    html = ('<title>The Daily Five — where it stands</title>\n'
            f'<style>{css}</style>\n{body}')
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8').write(html)
    print(f'{OUT}  {os.path.getsize(OUT)/1024/1024:.2f} MB')


build()

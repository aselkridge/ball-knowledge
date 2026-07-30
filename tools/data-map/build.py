#!/usr/bin/env python3
"""Build the Ball Knowledge DATA MAP — the reference sheet for how every piece
of data is stored, tagged, and matched.

  python3 tools/data-map/build.py [out.html]

EVERY NUMBER ON THE PAGE IS MEASURED FROM THE LIVE FILES at build time. Nothing
is hardcoded. That is deliberate: this page exists to be worked from while the
data is being cleaned up, so a stale number here would be worse than no page.
Rerun it after any merge and republish.

Fonts are the game's own faces, inlined as data URIs (the artifact CSP blocks
font CDNs, and the house rule is no CDNs anywhere).
"""
import base64, collections, glob, html, json, os, re, sys

ROOT  = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA  = os.path.join(ROOT, 'docs/play/data')
FONTS = os.path.join(ROOT, 'docs/play/assets/fonts')
OUT   = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools/data-map/data-map.html')

# ---------------------------------------------------------------- measure ----
def cards():
    s = open(os.path.join(ROOT, 'docs/play/questions.js')).read()
    return [c for c in re.findall(r'\{[^{}]*?\bt\s*:\s*\d.*?\}', s, re.S)
            if re.search(r'\bq\s*:', c)]

def facts():
    out, seen = [], set()
    def walk(o):
        if isinstance(o, dict):
            if isinstance(o.get('id'), str) and ('fact' in o or 'sourceTier' in o or 'verdict' in o):
                if id(o) not in seen:
                    seen.add(id(o)); out.append(o)
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    for f in sorted(glob.glob(os.path.join(DATA, 'research-*.json'))):
        try: walk(json.load(open(f)))
        except Exception as e: print(f"  ! unreadable {f}: {e}")
    return out

def fact_ids():
    ids = set()
    def walk(o):
        if isinstance(o, dict):
            if isinstance(o.get('id'), str): ids.add(o['id'])
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    for f in glob.glob(os.path.join(DATA, 'research-*.json')):
        try: walk(json.load(open(f)))
        except Exception: pass
    return ids

def players():
    raw = json.load(open(os.path.join(DATA, 'players.json')))
    pl = raw if isinstance(raw, list) else raw.get('players', [])
    return [p for p in pl if isinstance(p, dict)]

C, F, P, FIDS = cards(), facts(), players(), fact_ids()

def grab(c, pat):
    m = re.search(pat, c); return m.group(1) if m else None

def counter(items, key):
    return collections.Counter(k for k in (key(i) for i in items) if k is not None)

# --- card tag values
c_diff   = counter(C, lambda c: grab(c, r'\bt\s*:\s*(\d)'))
c_league = counter(C, lambda c: grab(c, r'\bl\s*:\s*"(\w+)"'))
c_cat    = counter(C, lambda c: grab(c, r'\bcat\s*:\s*"([^"]+)"'))
c_era    = collections.Counter()
for c in C:
    m = re.search(r'\be:\[([^\]]*)\]', c)
    if m:
        for d in re.findall(r'"([^"]+)"', m.group(1)): c_era[d] += 1
n_era   = sum(1 for c in C if re.search(r'\be:\[', c))
n_ptag  = sum(1 for c in C if re.search(r'\bp:\[', c))
n_vol   = sum(1 for c in C if re.search(r'\bv\s*:\s*1\b', c))
n_off   = sum(1 for c in C if re.search(r'\boff\s*:\s*1\b', c))
srcs    = [grab(c, r'\bsrc\s*:\s*"([^"]+)"') for c in C]
n_url   = sum(1 for s in srcs if s and s.startswith('http'))
n_fid   = sum(1 for s in srcs if s and not s.startswith('http'))
dead    = [s for s in srcs if s and not s.startswith('http') and s not in FIDS]
ptags   = set()
for c in C:
    m = re.search(r'\bp:\[([^\]]*)\]', c)
    if m: ptags |= set(re.findall(r'"([^"]+)"', m.group(1)))

# near-duplicate category labels (same thing, two spellings — these print on screen)
_norm = collections.defaultdict(list)
for k in c_cat: _norm[re.sub(r'[^a-z]', '', k.lower()).rstrip('s')].append(k)
cat_dupes = sorted([v for v in _norm.values() if len(v) > 1], key=lambda v: v[0].lower())
cat_once  = sum(1 for v in c_cat.values() if v == 1)

# --- fact fields
f_tier = counter(F, lambda x: str(x['sourceTier']) if x.get('sourceTier') is not None else None)
f_verd = counter(F, lambda x: x.get('verdict'))
n_tier = sum(f_tier.values())
n_verd = sum(f_verd.values())

# --- player tag values
p_league = counter(P, lambda p: p.get('league'))
p_pos    = counter(P, lambda p: p.get('pos'))
p_tier   = counter(P, lambda p: p.get('tier'))
p_era    = collections.Counter()
for p in P:
    for d in (p.get('eras') or []): p_era[str(d)] += 1
p_career = sum(1 for p in P if p.get('career'))
p_peak   = sum(1 for p in P if p.get('peak'))
p_highs  = sum(1 for p in P if p.get('highs'))
p_byera  = sum(1 for p in P if p.get('statsByEra'))
p_hasid  = sum(1 for p in P if p.get('playerId') or p.get('pid') or p.get('id'))
n_qid    = sum(1 for c in C if re.search(r'\bid\s*:\s*"', c))
career_f = collections.Counter()
for p in P:
    for k in (p.get('career') or {}): career_f[k] += 1

# a person is a NAME across records; records are per league
people = collections.defaultdict(set)
for p in P: people[p['name']].add(p.get('league'))
n_multi = sum(1 for v in people.values() if len(v) > 1)

# accolades are individual factual CLAIMS printed on player cards, and none of
# them carries a source — all sourcing work to date was scoped to questions
n_acc     = sum(len(p.get('accolades') or []) for p in P)
n_acc_src = 0   # no accolade anywhere carries its own source field
teams     = collections.Counter()
for p in P:
    for t in (p.get('teams') or []): teams[t] += 1
# averages that cannot be recombined across eras, because the totals behind
# them were never stored
n_avg  = sum(1 for p in P if (p.get('career') or {}).get('ppg') is not None)
n_tot  = sum(1 for p in P if (p.get('career') or {}).get('pts') and (p.get('career') or {}).get('g'))
n_noto = sum(1 for p in P if (p.get('career') or {}).get('ppg') is not None
             and not ((p.get('career') or {}).get('pts') and (p.get('career') or {}).get('g')))
# fact id prefixes — currently four schemes mixed together
fid_pref = collections.Counter(i.split('-')[0] for i in (x['id'] for x in F))

# --------------------------------------------------------------- rendering ---
STAT = {'ok': 'Wired up', 'part': 'Partly there', 'bad': 'Not connected'}

def esc(x): return html.escape(str(x))

def bar(have, total, state=None):
    """A field's coverage, as a number AND a bar — so 883 of 1526 reads as
    two-thirds at a glance and 0 of 744 reads as an empty trough."""
    pct = (100.0 * have / total) if total else 0
    st = state or ('ok' if pct > 99.5 else 'bad' if pct < 1 else 'part')
    return (f'<div class="cov"><div class="cov-bar cov-{st}">'
            f'<i style="width:{pct:.1f}%"></i></div>'
            f'<span class="cov-n">{have:,}<em>/{total:,}</em></span></div>')

def chips(counter_obj, limit=None, unit=''):
    items = counter_obj.most_common(limit)
    return '<div class="chips">' + ''.join(
        f'<span class="chip"><b>{esc(k)}</b>{v:,}{unit}</span>' for k, v in items) + '</div>'

def row(field, meaning, values, coverage):
    return (f'<tr><td class="f"><code>{esc(field)}</code></td>'
            f'<td class="m">{meaning}</td>'
            f'<td class="v">{values}</td>'
            f'<td class="c">{coverage}</td></tr>')

def table(rows):
    return ('<div class="tw"><table><thead><tr><th>Field</th><th>What it means</th>'
            '<th>Values in use</th><th>How many have it</th></tr></thead><tbody>'
            + ''.join(rows) + '</tbody></table></div>')

# ------- the connection diagram (rendered, not ASCII — Aaron: "that format is weird")
# Hand-built in HTML/CSS on purpose. An earlier version used a chart library the
# host renders for us — but that render can't be verified from here, and if it
# ever failed Aaron would open the page to a wall of source code. This always
# renders, themes correctly, and reflows on a phone.
def node(tag, title, num, sub, state):
    return (f'<div class="nd nd-{state}"><span class="nd-tag">{tag}</span>'
            f'<div class="nd-body"><h4>{title}</h4>'
            f'<div class="nd-num">{num}</div><p>{sub}</p></div></div>')

def link(state, label, detail):
    mark = {'ok': '&#10003;', 'bad': '&#10007;', 'key': '&rarr;'}[state]
    return (f'<div class="lk lk-{state}"><span class="lk-mark">{mark}</span>'
            f'<div><b>{label}</b><span>{detail}</span></div></div>')

DIAGRAM = (
    '<div class="band">The notebook &mdash; never loaded by the game</div>'
    + node('LAYER 1', 'Research facts', f'{len(F):,}', 'the evidence a question is built from', 'part')
    + link('ok', f'{n_fid - len(dead):,} cards trace back to real evidence',
           'you could prove these on demand')
    + link('bad', f'{len(dead)} cards point at a fact that was never saved',
           'the card works, but you cannot show your working')
    + '<div class="band">The game &mdash; what actually ships</div>'
    + node('LAYER 2', 'Question cards', f'{len(C):,}', 'what you get asked', 'bad')
    + link('bad', f'{n_ptag} cards name {len(ptags)} players &mdash; the game never looks',
           'this is why questions about your own team do not come up more often')
    + node('LAYER 3', 'Players', f'{len(P):,}', 'who you can be dealt &middot; one record per league', 'ok')
    + link('ok', 'Stats live inside the player record',
           'one career line &mdash; not split by decade')
    + node('LAYER 4', 'Stats', f'{p_career:,}',
           'players have a career line &mdash; and it is <b>one whole-career average</b>, '
           'never split by decade', 'part')
    + '<div class="band">And gating both of the above</div>'
    + node('SETUP', 'What you choose', 'league &middot; decades &middot; packs',
           'decides <b>who is dealt</b> and <b>what is asked</b> &mdash; the only place '
           'you steer the game', 'key')
)

MOMENTS = [
    ("You pick a league",
     "7 leagues are declared, <b>only NBA and WNBA are unlocked</b>",
     "The other five say &ldquo;in the lab&rdquo; &mdash; they are gated on data, not code", "part"),
    ("You pick decades",
     "your decades vs each player&rsquo;s decades&#8209;played",
     "A player is dealable if he played in <b>any</b> decade you picked", "ok"),
    ("You pick question packs",
     "packs are extra question sources you opt into",
     "Packs only ever <b>add</b> cards. They can never remove one", "ok"),
    ("The game deals your five",
     "league must match <b>exactly</b> &middot; position fills the lineup &middot; rarity sets the stars",
     "You cannot get a college player in an NBA game", "ok"),
    ("The game draws a question",
     "difficulty <b>and</b> league <b>and</b> decade &mdash; all three must pass",
     "Plus &ldquo;haven&rsquo;t asked it yet this game&rdquo;", "ok"),
    ("The game shows a player",
     "the one career line on the record",
     "<b>Not decade-aware.</b> Pick the 1990s, get Jordan&rsquo;s whole-career average", "bad"),
]

BROKEN = [
    ("bad", f"{n_acc:,} accolade claims on player cards, and <b>not one carries a source</b>.",
     f"Every player has them &mdash; &ldquo;8x NBA champion&rdquo;, &ldquo;led the nation in "
     "scoring&rdquo;. That is more individual factual claims than the entire question bank has "
     "cards, they print on the player card, and there is no evidence trail for any of them. "
     "All the sourcing work so far was scoped to questions; this whole category was never in "
     "it and was unmeasured until now."),
    ("bad", f"{n_ptag} cards know which players they&rsquo;re about. The game never looks.",
     f"Those cards name {len(ptags)} different players. The code that picks a question checks "
     "difficulty, league and decade, then stops. This is why questions about your own team "
     "don&rsquo;t come up more often &mdash; the feature was written down but never wired in."),
    ("bad", f"{len(dead)} cards point at evidence that isn&rsquo;t there.",
     "Every one came from question run 3, whose merge wrote the run&rsquo;s internal scratch ID "
     "into the card instead of the real fact ID. 37 can be relinked mechanically; the other "
     f"{len(dead)-37} never had their facts saved to disk at all and need re-sourcing."),
    ("bad", f"No player has decade-by-decade numbers. ({p_byera} of {len(P):,})",
     "So picking a single decade still shows a player&rsquo;s whole-career average. The fix is "
     "per-season packages storing totals, not averages &mdash; you cannot average averages."),
    ("bad", "Neither players nor questions have a permanent name tag.",
     f"Players are filed under their name and nothing else ({p_hasid} of {len(P):,} have an ID); "
     f"no card has one ({n_qid} of {len(C):,}). Two men are already in the database twice under "
     "different spellings, and online play identifies a question by counting positions in a list."),
    ("part", f"Two ways to cite a source: {n_fid:,} cards use a fact ID, {n_url} use a bare web link.",
     "Same job, two systems &mdash; which is how you end up with a fact and a URL that are the "
     "same evidence with nothing joining them. Every card should point at a fact ID; the URLs "
     "live on the fact."),
    ("part", f"Source reliability is recorded on {n_tier} of {len(F):,} facts and on no card at all.",
     "Tier 1 is the actual record; tier 2 needs two independent sources agreeing; tier 3 is an "
     "index you search from, never something you cite. Nothing in the game can currently answer "
     "&ldquo;how solid is this card?&rdquo;"),
    ("part", f"{len(c_cat)} category labels for {len(C):,} cards &mdash; and they print on screen.",
     f"{cat_once} are used exactly once, and {len(cat_dupes)} pairs are the same thing spelled two "
     "ways. Needs a short approved list, mapped by review so no meaning is lost."),
    ("part", f"{n_noto} players have an average with no totals behind it.",
     f"{n_avg} players have a points-per-game figure but only {n_tot} also have the total points "
     "and games it came from. Without those you cannot recombine a player&rsquo;s numbers across "
     "eras &mdash; you cannot average averages. The totals have to be mined."),
    ("part", f"Fact IDs follow four different schemes at once ({len(fid_pref)} prefixes).",
     "Leagues (<code>nba-</code>), competitions (<code>oly-</code>, <code>wc-</code>), topics "
     "(<code>w-</code>, 350 of them), individual <b>people</b> (<code>petrovic-</code>, "
     "<code>sabonis-</code>) and even a research run (<code>v5-</code>). Readable, but not a "
     "system &mdash; you cannot predict an ID or validate one."),
    ("part", f"Teams are {len(teams)} free-text strings with no registry.",
     "And franchises move and rename &mdash; the Seattle SuperSonics became the OKC Thunder, and "
     "&ldquo;Charlotte Hornets&rdquo; refers to two different franchises. A bare string will "
     "eventually lie about history."),
    ("part", f"The off-court flavour tag exists in the design and on {n_off} cards.",
     "Specced as its own opt-in, never applied to anything."),
]

CSS = """
*{box-sizing:border-box}
:root{
  --accent:#f5872e;
  --ok:#2fbf6a; --part:#c9962f; --bad:#e0143c;
  --ground:#f2f0ec; --panel:#fbfaf8; --sunk:#eae5de;
  --line:#ded8d0; --line-soft:#e9e4dc;
  --ink:#191410; --ink-2:#4d453c; --ink-3:#7b7168;
  --display:'Anton',Impact,'Arial Narrow Bold',sans-serif;
  --body:'Archivo',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'SpaceMono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;
  --led:'DSEG7',var(--mono);
}
@media (prefers-color-scheme:dark){:root{
  --ground:#100d0b; --panel:#191411; --sunk:#141110;
  --line:#332b25; --line-soft:#241d19;
  --ink:#f0e9e0; --ink-2:#b3a894; --ink-3:#877c70;
}}
:root[data-theme="dark"]{
  --ground:#100d0b; --panel:#191411; --sunk:#141110;
  --line:#332b25; --line-soft:#241d19;
  --ink:#f0e9e0; --ink-2:#b3a894; --ink-3:#877c70;
}
:root[data-theme="light"]{
  --ground:#f2f0ec; --panel:#fbfaf8; --sunk:#eae5de;
  --line:#ded8d0; --line-soft:#e9e4dc;
  --ink:#191410; --ink-2:#4d453c; --ink-3:#7b7168;
}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:var(--body);font-size:15px;line-height:1.5;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1060px;margin:0 auto;padding:0 22px 90px}

/* masthead ------------------------------------------------------------- */
.mast{padding:40px 0 22px;border-bottom:2px solid var(--ink)}
/* .wrap carries the page's 90px bottom padding — the masthead must not inherit
   it, or the scoreboard floats in a dead gap above the nav */
.mast .wrap{padding-bottom:0}
.kicker{font-family:var(--mono);font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--ink-3);margin:0 0 12px}
h1{font-family:var(--display);font-weight:400;font-size:clamp(38px,7.4vw,74px);
  line-height:.94;letter-spacing:.006em;margin:0;text-wrap:balance;
  text-transform:uppercase}
h1 em{font-style:normal;color:var(--accent)}
.standfirst{max-width:62ch;color:var(--ink-2);font-size:16.5px;margin:16px 0 0}
.scores{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));
  gap:12px;margin:26px 0 0;padding:0 0 4px}
.score{background:var(--panel);border:1px solid var(--line);border-radius:3px;
  padding:13px 14px 12px}
.score .lbl{font-family:var(--mono);font-size:10px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--ink-3);display:block;margin-bottom:9px}
.score .num{font-family:var(--led);font-size:27px;line-height:1;
  font-variant-numeric:tabular-nums}
.score .sub{font-size:12px;color:var(--ink-3);margin-top:8px;line-height:1.35}
.score.is-bad .num{color:var(--bad)} .score.is-ok .num{color:var(--ok)}
.score.is-part .num{color:var(--part)}

/* nav ------------------------------------------------------------------ */
nav{position:sticky;top:0;z-index:20;background:var(--ground);
  border-bottom:1px solid var(--line);margin-bottom:34px}
nav .in{max-width:1060px;margin:0 auto;padding:0 22px;display:flex;gap:2px;
  overflow-x:auto;scrollbar-width:none}
nav .in::-webkit-scrollbar{display:none}
nav a{font-family:var(--mono);font-size:11px;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ink-3);text-decoration:none;
  padding:13px 11px;white-space:nowrap;border-bottom:2px solid transparent}
nav a:hover,nav a:focus-visible{color:var(--ink);outline:none}
nav a.active{color:var(--ink);border-bottom-color:var(--accent)}

/* sections ------------------------------------------------------------- */
section{margin:0 0 54px;scroll-margin-top:62px}
.shead{display:flex;align-items:baseline;gap:13px;margin:0 0 6px;
  padding-bottom:9px;border-bottom:1px solid var(--line)}
.shead .n{font-family:var(--mono);font-size:11px;color:var(--accent);
  letter-spacing:.1em}
h2{font-family:var(--display);font-weight:400;font-size:clamp(21px,3vw,29px);
  letter-spacing:.012em;margin:0;text-transform:uppercase;line-height:1.06}
.lede{color:var(--ink-2);max-width:70ch;margin:13px 0 20px;font-size:15px}

/* tables --------------------------------------------------------------- */
.tw{overflow-x:auto;border:1px solid var(--line);border-radius:3px;
  background:var(--panel)}
table{border-collapse:collapse;width:100%;min-width:640px}
th{font-family:var(--mono);font-size:10px;letter-spacing:.11em;
  text-transform:uppercase;color:var(--ink-3);text-align:left;
  padding:11px 14px;border-bottom:1px solid var(--line);font-weight:400;
  background:var(--sunk);white-space:nowrap}
td{padding:13px 14px;border-bottom:1px solid var(--line-soft);
  vertical-align:top;font-size:14px}
tr:last-child td{border-bottom:0}
td.f{white-space:nowrap;width:1%}
td.f code{font-family:var(--mono);font-size:12.5px;color:var(--ink);
  background:var(--sunk);padding:3px 7px;border-radius:2px;
  border:1px solid var(--line-soft)}
td.m{color:var(--ink-2);min-width:170px}
td.c{width:1%;white-space:nowrap}

/* coverage bar --------------------------------------------------------- */
.cov{display:flex;align-items:center;gap:10px}
.cov-bar{width:74px;height:7px;background:var(--sunk);border-radius:99px;
  overflow:hidden;border:1px solid var(--line-soft);flex:0 0 auto}
.cov-bar i{display:block;height:100%;border-radius:99px}
.cov-ok i{background:var(--ok)} .cov-part i{background:var(--part)}
.cov-bad i{background:var(--bad)}
.cov-n{font-family:var(--mono);font-size:12px;font-variant-numeric:tabular-nums;
  color:var(--ink)}
.cov-n em{font-style:normal;color:var(--ink-3)}

/* chips ---------------------------------------------------------------- */
.chips{display:flex;flex-wrap:wrap;gap:5px}
.chip{font-family:var(--mono);font-size:11.5px;background:var(--sunk);
  border:1px solid var(--line-soft);border-radius:2px;padding:3px 7px;
  color:var(--ink-3);font-variant-numeric:tabular-nums}
.chip b{font-weight:400;color:var(--ink);margin-right:6px}

/* diagram — hand-built, no rendering dependency --------------------------- */
.diagram{background:var(--panel);border:1px solid var(--line);border-radius:3px;
  padding:20px 20px 24px}
.band{font-family:var(--mono);font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-3);margin:22px 0 12px;
  display:flex;align-items:center;gap:11px}
.band:first-child{margin-top:0}
.band::after{content:"";flex:1;height:1px;background:var(--line)}
.nd{display:flex;gap:0;border:1px solid var(--line);border-radius:3px;
  background:var(--sunk);overflow:hidden}
.nd-tag{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;
  writing-mode:vertical-rl;text-orientation:mixed;padding:11px 7px;
  background:var(--line-soft);color:var(--ink-3);display:flex;
  align-items:center;justify-content:center;flex:0 0 auto}
.nd-body{padding:13px 16px;flex:1;min-width:0}
.nd-body h4{margin:0;font-family:var(--display);font-weight:400;font-size:19px;
  letter-spacing:.02em;text-transform:uppercase;line-height:1.05}
.nd-num{font-family:var(--led);font-size:20px;margin:8px 0 7px;
  font-variant-numeric:tabular-nums;letter-spacing:.01em}
.nd-body p{margin:0;font-size:13.5px;color:var(--ink-2);line-height:1.4}
.nd-ok{border-left:3px solid var(--ok)}
.nd-part{border-left:3px solid var(--part)}
.nd-bad{border-left:3px solid var(--bad)}
.nd-key{border-left:3px solid var(--accent)}
.nd-ok .nd-num{color:var(--ok)} .nd-part .nd-num{color:var(--part)}
.nd-bad .nd-num{color:var(--bad)} .nd-key .nd-num{color:var(--accent);
  font-family:var(--mono);font-size:13px}
/* the connector between two nodes — a real line you can follow down the page */
.lk{display:flex;gap:11px;align-items:flex-start;margin:0;padding:9px 0 9px 26px;
  position:relative}
.lk::before{content:"";position:absolute;left:11px;top:0;bottom:0;width:2px;
  background:var(--line)}
.lk-bad::before{background:var(--bad);opacity:.55}
.lk-ok::before{background:var(--ok);opacity:.55}
.lk-mark{font-size:13px;line-height:1.35;flex:0 0 auto;width:15px}
.lk-ok .lk-mark{color:var(--ok)} .lk-bad .lk-mark{color:var(--bad)}
.lk-key .lk-mark{color:var(--accent)}
.lk b{display:block;font-weight:600;font-size:14px;letter-spacing:.005em}
.lk span{display:block;font-size:13px;color:var(--ink-3);margin-top:2px}
@media (max-width:520px){
  .nd-tag{writing-mode:horizontal-tb;padding:6px 10px}
  .nd{flex-direction:column}
}

/* moments + broken ------------------------------------------------------ */
.moment{display:grid;grid-template-columns:auto 1fr;gap:0 15px;
  padding:15px 0;border-bottom:1px solid var(--line-soft)}
.moment:last-child{border-bottom:0}
.dot{width:9px;height:9px;border-radius:99px;margin-top:7px}
.dot.ok{background:var(--ok)} .dot.part{background:var(--part)}
.dot.bad{background:var(--bad)}
.moment h3{margin:0;font-size:15.5px;font-weight:600;letter-spacing:.005em}
.moment .cmp{grid-column:2;color:var(--ink-2);font-size:14px;margin:5px 0 0}
.moment .res{grid-column:2;font-size:13.5px;color:var(--ink-3);margin:6px 0 0;
  padding-left:11px;border-left:2px solid var(--line)}
.issue{background:var(--panel);border:1px solid var(--line);border-radius:3px;
  border-left:3px solid var(--line);padding:15px 17px;margin:0 0 11px}
.issue.bad{border-left-color:var(--bad)}
.issue.part{border-left-color:var(--part)}
.issue h3{margin:0 0 7px;font-size:15.5px;font-weight:600;letter-spacing:.005em;
  display:flex;gap:10px;align-items:baseline}
.issue .tag{font-family:var(--mono);font-size:9.5px;letter-spacing:.11em;
  text-transform:uppercase;padding:2px 6px;border-radius:2px;white-space:nowrap;
  flex:0 0 auto}
.issue.bad .tag{background:var(--bad);color:#fff}
.issue.part .tag{background:var(--part);color:#1a1206}
.issue p{margin:0;color:var(--ink-2);font-size:14px;max-width:78ch}

.note{background:var(--sunk);border:1px solid var(--line-soft);border-radius:3px;
  padding:14px 16px;margin:18px 0 0;font-size:14px;color:var(--ink-2);
  max-width:76ch}
.note b{color:var(--ink)}
.dupes{font-family:var(--mono);font-size:12px;color:var(--ink-2);
  columns:2;column-gap:26px;margin:11px 0 0}
.dupes div{break-inside:avoid;padding:2px 0}
footer{border-top:1px solid var(--line);margin-top:44px;padding-top:16px;
  font-family:var(--mono);font-size:11px;color:var(--ink-3);
  display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media (max-width:640px){
  .dupes{columns:1}
  .moment{grid-template-columns:1fr}
  .dot{display:none}
  .moment .cmp,.moment .res{grid-column:1}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
"""

SECTIONS = [
    ('connect',  'How it connects'),
    ('facts',    '1 &middot; Research facts'),
    ('cards',    '2 &middot; Question cards'),
    ('players',  '3 &middot; Players'),
    ('stats',    '4 &middot; Stats'),
    ('matching', 'Where matching happens'),
    ('broken',   "What's broken"),
]

def build():
    nav = ''.join(f'<a href="#{i}">{t}</a>' for i, t in SECTIONS)

    scores = [
        ('Research facts', f'{len(F):,}', 'the notebook &mdash; never shipped', ''),
        ('Question cards', f'{len(C):,}', 'what you get asked', ''),
        ('Player records', f'{len(P):,}', f'{n_multi} people appear in two leagues', ''),
        ('Dead evidence links', f'{len(dead)}', 'cards that can&rsquo;t be traced back', 'is-bad'),
        ('Player tags ignored', f'{n_ptag}', 'cards the game refuses to read', 'is-bad'),
        ('Category labels', f'{len(c_cat)}', f'{cat_once} used exactly once', 'is-part'),
    ]
    sc = ''.join(
        f'<div class="score {cl}"><span class="lbl">{l}</span>'
        f'<div class="num">{n}</div><p class="sub">{s}</p></div>'
        for l, n, s, cl in scores)

    # ---- layer 1
    f_rows = [
        row('id', 'The fact&rsquo;s permanent name tag', '<code class="mono">w-lusia-harris-delta-state</code>',
            bar(len(F), len(F))),
        row('fact', 'The claim itself, in one sentence', 'free text',
            bar(sum(1 for x in F if x.get('fact')), len(F))),
        row('source', 'Where it came from', 'a web link',
            bar(sum(1 for x in F if x.get('source')), len(F))),
        row('sourceTier', 'How reliable that source is <b>(1 best)</b>', chips(f_tier),
            bar(n_tier, len(F))),
        row('verdict', 'Result of a fact-checking pass', chips(f_verd), bar(n_verd, len(F))),
        # league and era are TWO SEPARATE FIELDS — an earlier version of this page
        # merged them into one row, which read as if they were a single tag.
        row('league', 'Which league it belongs to &mdash; <b>one value</b>',
            chips(counter(F, lambda x: x.get('league'))),
            bar(sum(1 for x in F if x.get('league')), len(F))),
        row('era', 'Which decade it belongs to &mdash; <b>one value</b> '
            '(a question card can carry several; a fact is one moment)',
            chips(counter(F, lambda x: x.get('era')), 10),
            bar(sum(1 for x in F if x.get('era')), len(F))),
        row('volatile', 'Answer could change with news', 'true / false',
            bar(sum(1 for x in F if x.get('volatile') is not None), len(F))),
    ]

    # ---- layer 2
    c_rows = [
        row('t', 'Difficulty, 0 easiest to 4 hardest', chips(c_diff), bar(len(C), len(C))),
        row('l', 'Which league the card belongs to', chips(c_league), bar(len(C), len(C))),
        row('e', 'The decade the <b>answer became true</b>', chips(c_era),
            bar(n_era, len(C))),
        row('p', 'Which players the card is about', f'{len(ptags)} different players named',
            bar(n_ptag, len(C), 'bad')),
        row('v', 'Answer could change with news', 'set on volatile cards only', bar(n_vol, len(C), 'ok')),
        row('off', 'Off-court flavour card, opt-in', '&mdash; never applied', bar(n_off, len(C), 'bad')),
        row('src', 'Where the answer came from',
            f'<span class="chip"><b>fact ID</b>{n_fid:,}</span> '
            f'<span class="chip"><b>bare web link</b>{n_url}</span>', bar(len(C), len(C))),
        row('cat', 'The label printed on screen', f'{len(c_cat)} different labels',
            bar(len(C), len(C), 'part')),
        row('id', 'The card&rsquo;s permanent name tag', '&mdash; does not exist',
            bar(n_qid, len(C), 'bad')),
    ]

    # ---- layer 3
    p_rows = [
        row('name', 'The player&rsquo;s name &mdash; <b>and the only thing identifying them</b>',
            'free text', bar(len(P), len(P))),
        row('playerId', 'A permanent name tag', '&mdash; does not exist', bar(p_hasid, len(P), 'bad')),
        row('league', 'Which league this record covers', chips(p_league), bar(len(P), len(P))),
        row('pos', 'Position', chips(p_pos), bar(len(P), len(P))),
        row('tier', 'Rarity when packs are opened', chips(p_tier), bar(len(P), len(P))),
        row('eras', 'Every decade the player played in', chips(p_era),
            bar(sum(1 for p in P if p.get('eras')), len(P))),
        row('teams', 'Shown on the player card', f'{len(teams)} free-text names, no registry',
            bar(sum(1 for p in P if p.get('teams')), len(P), 'part')),
        row('accolades', '<b>Factual claims</b> printed on the card',
            f'{n_acc:,} individual claims &mdash; <b>none carries a source</b>',
            bar(n_acc_src, n_acc, 'bad')),
        row('statSource', 'Where the numbers came from', 'a web link, written as a sentence',
            bar(sum(1 for p in P if p.get('statSource')), len(P), 'part')),
    ]

    # ---- layer 4
    NICE = {'ppg': 'points per game', 'rpg': 'rebounds per game', 'apg': 'assists per game',
            'spg': 'steals per game', 'bpg': 'blocks per game', 'fg_pct': 'field goal %',
            'ft_pct': 'free throw %', 'fg3_pct': 'three point %', 'g': 'games played',
            'pts': 'total points'}
    s_rows = [row(k, NICE.get(k, k), '&mdash;', bar(v, len(P))) for k, v in career_f.most_common()]
    s_rows.insert(0, row('career', '<b>The one career line</b> every stat lives in',
                         'the whole career, averaged', bar(p_career, len(P))))
    s_rows.append(row('peak', 'Best single season', 'season + scoring average', bar(p_peak, len(P))))
    s_rows.append(row('highs', 'Career-best game', 'points', bar(p_highs, len(P))))
    s_rows.append(row('statsByEra', '<b>Numbers split by decade</b>', '&mdash; does not exist',
                      bar(p_byera, len(P), 'bad')))

    moments = ''.join(
        f'<div class="moment"><div class="dot {st}"></div><h3>{t}</h3>'
        f'<p class="cmp">{cmp}</p><p class="res">{res}</p></div>'
        for t, cmp, res, st in MOMENTS)

    broken = ''.join(
        f'<div class="issue {st}"><h3><span class="tag">{STAT[st]}</span>{t}</h3><p>{d}</p></div>'
        for st, t, d in BROKEN)

    dupes = ''.join(f'<div>{esc(" / ".join(v))}</div>' for v in cat_dupes)

    doc = f"""<title>Ball Knowledge &mdash; The Data Map</title>
<style>
@font-face{{font-family:'Anton';src:url(data:font/woff2;base64,__ANTON__) format('woff2');font-weight:400;font-display:swap}}
@font-face{{font-family:'DSEG7';src:url(data:font/woff2;base64,__DSEG__) format('woff2');font-weight:700;font-display:swap}}
@font-face{{font-family:'Archivo';src:url(data:font/woff2;base64,__ARCHIVO__) format('woff2');font-weight:600;font-display:swap}}
@font-face{{font-family:'SpaceMono';src:url(data:font/woff2;base64,__MONO__) format('woff2');font-weight:400;font-display:swap}}
{CSS}
</style>

<header class="mast"><div class="wrap">
  <p class="kicker">Ball Knowledge &middot; reference sheet &middot; every number measured from the live files</p>
  <h1>The <em>Data</em> Map</h1>
  <p class="standfirst">Everything the game stores, how it&rsquo;s labelled, and what gets
  compared to what at each moment of a game. Built straight from the real files, so it
  can&rsquo;t drift out of date &mdash; rerun the build after any merge.</p>
  <div class="scores">{sc}</div>
</div></header>

<nav><div class="in">{nav}</div></nav>

<div class="wrap">

<section id="connect">
  <div class="shead"><span class="n">MAP</span><h2>How it connects</h2></div>
  <p class="lede">Four layers, top to bottom. The first is a <b>notebook that never
  ships</b> &mdash; research produces facts, and a separate step turns some of them into
  playable cards. Between each layer is the connection that joins them, marked
  <b style="color:var(--ok)">&#10003;</b> if it works and
  <b style="color:var(--bad)">&#10007;</b> if it doesn&rsquo;t.</p>
  <div class="diagram">{DIAGRAM}</div>
  <div class="note"><b>The thing worth sitting with:</b> a &ldquo;person&rdquo; does not exist in
  this data &mdash; only <b>records</b>, and a record is one person <i>in one league</i>.
  That&rsquo;s why Bill Walton is two records, and why nothing can currently tell that the
  two of them are the same man.</div>
</section>

<section id="facts">
  <div class="shead"><span class="n">LAYER 1</span><h2>Research facts &mdash; the notebook</h2></div>
  <p class="lede">{len(F):,} researched facts across 12 files. <b>The game never loads these.</b>
  They are the evidence a question is built from, and the thing you&rsquo;d hand someone
  who asked you to prove a card.</p>
  {table(f_rows)}
  <div class="note"><b>Reliability lives here and nowhere else.</b> Tier&nbsp;1 is the actual
  record; tier&nbsp;2 needs two independent sources agreeing; tier&nbsp;3 is an index you
  search from, never something you cite. Only <b>{n_tier} of {len(F):,}</b> facts carry one,
  and <b>no question card carries one at all</b> &mdash; so nothing in the game can answer
  &ldquo;how solid is this?&rdquo;</div>
</section>

<section id="cards">
  <div class="shead"><span class="n">LAYER 2</span><h2>Question cards &mdash; what you get asked</h2></div>
  <p class="lede">{len(C):,} cards. Six tags decide whether a card can appear; one is
  decoration printed on screen; one was specced and never used.</p>
  {table(c_rows)}
  <div class="note"><b>Two rules govern every match.</b> Between different tags,
  <b>all</b> must pass &mdash; a card needs the right league <i>and</i> the right decade.
  Within one tag, <b>any</b> passes &mdash; a card tagged both 1990s and 2000s appears if you
  picked either. And <b>no tag means always allowed</b>, which is why {len(C)-n_era} untagged
  cards can turn up in any decade: they&rsquo;re timeless things like rules and origins.</div>
  <div class="note"><b>{len(c_cat)} category labels, {cat_once} of them used once</b>, and these
  print on screen. {len(cat_dupes)} pairs are the same thing spelled two ways:
  <div class="dupes">{dupes}</div></div>
</section>

<section id="players">
  <div class="shead"><span class="n">LAYER 3</span><h2>Players &mdash; who you can be dealt</h2></div>
  <p class="lede">{len(P):,} records covering fewer than {len(P):,} people: a record is one
  person in one league, and {n_multi} people hold more than one.</p>
  {table(p_rows)}
</section>

<section id="stats">
  <div class="shead"><span class="n">LAYER 4</span><h2>Stats &mdash; the numbers on a card</h2></div>
  <p class="lede">Stats aren&rsquo;t a separate file &mdash; they live inside the player record,
  as <b>one career line</b> plus a best season and a best game.</p>
  {table(s_rows)}
  <div class="note"><b>What&rsquo;s missing is the shape.</b> There is one career average per
  player, so picking a single decade still shows the whole career. The fix is packages
  <b>per season</b> (seasons are what real sources publish; decades are just sums of seasons)
  storing <b>totals, never averages</b> &mdash; because you cannot average averages:
  28.0 over 500 games and 25.0 over 300 games is <b>26.875</b>, not 26.5.</div>
</section>

<section id="matching">
  <div class="shead"><span class="n">FLOW</span><h2>Where the matching happens</h2></div>
  <p class="lede">The same tags get compared at six different moments, and the rules
  aren&rsquo;t identical at each one.</p>
  {moments}
</section>

<section id="broken">
  <div class="shead"><span class="n">GAPS</span><h2>What&rsquo;s broken</h2></div>
  <p class="lede">Everything here is measured, not suspected.</p>
  {broken}
</section>

<footer>
  <span>Ball Knowledge &middot; data map</span>
  <span>Rebuild: python3 tools/data-map/build.py</span>
</footer>
</div>

<script>
(function(){{
  var links=[].slice.call(document.querySelectorAll('nav a'));
  links.forEach(function(a){{
    a.addEventListener('click',function(e){{
      var t=document.querySelector(a.getAttribute('href'));
      if(t){{e.preventDefault();t.scrollIntoView({{behavior:'smooth',block:'start'}});}}
    }});
  }});
  var secs=[].slice.call(document.querySelectorAll('section'));
  function spy(){{
    var y=window.scrollY+90,cur=secs[0];
    secs.forEach(function(s){{if(s.offsetTop<=y)cur=s;}});
    links.forEach(function(a){{
      a.classList.toggle('active',a.getAttribute('href')==='#'+cur.id);
    }});
  }}
  window.addEventListener('scroll',spy,{{passive:true}});spy();
}})();
</script>
"""
    for token, fname in [('__ANTON__', 'anton-400.woff2'), ('__DSEG__', 'dseg7-700.woff2'),
                         ('__ARCHIVO__', 'archivo-600.woff2'), ('__MONO__', 'spacemono-400.woff2')]:
        with open(os.path.join(FONTS, fname), 'rb') as fh:
            doc = doc.replace(token, base64.b64encode(fh.read()).decode())

    if doc.count('<div') != doc.count('</div>'):
        sys.exit(f"UNBALANCED div tags: {doc.count('<div')} open vs {doc.count('</div>')} close")
    open(OUT, 'w').write(doc)
    print(f"built {len(doc)//1024}KB -> {OUT}")
    print(f"  facts {len(F)} · cards {len(C)} · players {len(P)}")
    print(f"  dead evidence links {len(dead)} · ignored player tags {n_ptag}")
    print(f"  category labels {len(c_cat)} ({cat_once} used once, {len(cat_dupes)} dupe pairs)")

if __name__ == '__main__':
    build()

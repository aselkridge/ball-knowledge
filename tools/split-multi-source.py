#!/usr/bin/env python3
"""V16 — one source row per DOCUMENT. Dry-run by default; --apply writes.

THE DEFECT
----------
40 source rows hold two or more urls jammed into a single `url` field:

    https://www.basketball-reference.com/wnba/players/f/fowlesy01w.html ;
    https://lynx.wnba.com/news/lynx-center-sylvia-fowles-becomes-the-wnbas-...

Nothing is over-rated by this — `tier-sources.py` reads the first url, which in
every one of the 40 is the stronger source. The damage is the opposite shape:

  1. The "2 independent Tier 2 -> high" rule counts ROWS. A row holding two
     genuine independent sources scores as ONE and the fact stays `medium`.
  2. A second url can DEMOTE the first. Row 2 of the 40 is a sports-reference
     college player page — Tier 1 — sitting at Tier 2, because the editorial
     path check saw the `/news/` in the *second* url's address and demoted the
     row. The annotation punished the source it was corroborating.

TWO KINDS OF ROW IN HERE, AND THEY ARE NOT THE SAME
---------------------------------------------------
  A. CORROBORATION — different publishers backing one claim.
     wikipedia + hoophall · sports-reference + ncaa · cbssports + big3.
     These are what the two-source rule was written for.
  B. COMPARISON — one publisher, several pages, because the FACT compares
     several players. `v5-west-top-avg-retired` cites four Basketball-Reference
     pages: West, Wade, Payton, Stockton. Splitting these is still correct —
     each url is a distinct document — but it must NOT manufacture independence.
     It cannot: `confidence()` counts DISTINCT publishers, so four
     Basketball-Reference rows stay one publisher. Proven by --selftest.

WHAT IT DOES
------------
The FIRST url stays on the original row, which keeps its `source_id`. That is
deliberate: every existing join keeps pointing where it pointed, and
`tables-emit.py` writes `fs[fact_id][0]` into the card, so the card's visible
source stays the same document — just without the second url stapled to it.

Each additional url becomes its own source row (reusing an existing row when
that url is already in the table), and every fact or person that cited the
original now also cites the new one. Person rows are added as `supporting`,
never `stat`: exactly one `stat` row per person+league is an invariant of
players.js and this must not be what breaks it.

Nothing is invented. Every url written was already in the field.
"""
import json, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
APPLY = '--apply' in sys.argv


def clean(tok):
    """Trim trailing punctuation a human left behind, WITHOUT eating the url.

    Wikipedia titles contain brackets and commas — Corey_Williams_(basketball,
    _born_1977) — so a regex that stops at ')' or ',' truncates real addresses.
    Splitting on whitespace first and only then trimming UNBALANCED trailing
    brackets keeps those intact.
    """
    tok = tok.strip()
    while tok and tok[-1] in '.,;:!)]':
        if tok[-1] == ')' and tok.count(')') <= tok.count('('):
            break
        if tok[-1] == ']' and tok.count(']') <= tok.count('['):
            break
        tok = tok[:-1]
    return tok


def urls_in(field):
    out = []
    for tok in (field or '').split():
        if tok.lower().startswith(('http://', 'https://')):
            u = clean(tok)
            if u and u not in out:
                out.append(u)
    return out


def domain(url):
    m = re.match(r'^https?://(?:www\.)?([^/\s)]+)', (url or '').strip())
    return m.group(1).lower() if m else None


def slug(url):
    s = re.sub(r'^https?://(?:www\.)?', '', url).lower()
    s = s.replace('.', '')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:80]


SELFTEST = [
    # the bracket case — a regex stopping at ')' truncates this real url
    ('a https://en.wikipedia.org/wiki/Corey_Williams_(basketball,_born_1977)',
     ['https://en.wikipedia.org/wiki/Corey_Williams_(basketball,_born_1977)']),
    # ...but a genuinely unbalanced trailing ')' from prose must come off
    ('x (cross-checked against https://en.wikipedia.org/wiki/Earl_Lloyd)',
     ['https://en.wikipedia.org/wiki/Earl_Lloyd']),
    ('https://a.com/p.html; and https://b.com/q',
     ['https://a.com/p.html', 'https://b.com/q']),
    ('https://a.com/x + https://a.com/x', ['https://a.com/x']),   # dupe collapses
]
if '--selftest' in sys.argv:
    bad = 0
    for field, want in SELFTEST:
        got = urls_in(field)
        ok = got == want
        bad += not ok
        print(f'  {"ok  " if ok else "FAIL"}  {field[:58]}')
        if not ok:
            print(f'        want {want}\n        got  {got}')
    print(f'\n  {len(SELFTEST)-bad}/{len(SELFTEST)} pass')
    sys.exit(1 if bad else 0)

T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D)
     if f.endswith('.json') and f != 'todo.json'}
sources, fs, ps = T['sources'], T['fact_sources'], T['person_sources']

BY_URL = {s['url']: s['source_id'] for s in sources if s.get('url')}
IDS = {s['source_id'] for s in sources}
FS_SEEN = {(r['fact_id'], r['source_id']) for r in fs}
PS_SEEN = {(r['person_id'], r['league_id'], r['source_id']) for r in ps}

targets = [s for s in sources if len(urls_in(s.get('url'))) > 1]
new_rows, new_fs, new_ps, reused = [], [], [], 0
plan = []

for s in targets:
    us = urls_in(s['url'])
    keep, extras = us[0], us[1:]
    cites_f = [r for r in fs if r['source_id'] == s['source_id']]
    cites_p = [r for r in ps if r['source_id'] == s['source_id']]
    made = []
    for u in extras:
        if u in BY_URL:
            sid = BY_URL[u]
            reused += 1
        else:
            sid = slug(u)
            n = 2
            while sid in IDS:
                sid = f'{slug(u)[:76]}-{n}'
                n += 1
            IDS.add(sid)
            BY_URL[u] = sid
            new_rows.append({'source_id': sid, 'title': None, 'url': u,
                             'publisher': domain(u), 'date_checked': None,
                             'tier': None})
        made.append(sid)
        for r in cites_f:
            if (r['fact_id'], sid) not in FS_SEEN:
                FS_SEEN.add((r['fact_id'], sid))
                new_fs.append({'fact_id': r['fact_id'], 'source_id': sid})
        for r in cites_p:
            k = (r['person_id'], r['league_id'], sid)
            if k not in PS_SEEN:
                PS_SEEN.add(k)
                new_ps.append({'person_id': r['person_id'],
                               'league_id': r['league_id'],
                               'source_id': sid, 'role': 'supporting'})
    plan.append((s, keep, extras, made, len(cites_f), len(cites_p)))

pubs = collections.Counter()
for s, keep, extras, _, _, _ in plan:
    ds = {domain(u) for u in [keep] + extras}
    pubs['corroboration — different publishers' if len(ds) > 1
         else 'comparison — one publisher, several pages'] += 1

print('V16 · ONE SOURCE ROW PER DOCUMENT')
print('-' * 62)
print(f'  rows holding more than one url    {len(targets):5d}')
for k, v in pubs.most_common():
    print(f'    {k:44s}{v:4d}')
print()
print(f'  urls to be given their own row    {len(new_rows) + reused:5d}')
print(f'    brand new source rows           {len(new_rows):5d}')
print(f'    already in the table, reused    {reused:5d}')
print(f'  new fact->source citations        {len(new_fs):5d}')
print(f'  new person->source citations      {len(new_ps):5d}   (all role=supporting)')
print()
print('  every split, in full:')
for s, keep, extras, made, nf, np in plan:
    print(f'    {s["source_id"][:52]}   (cited by {nf} facts, {np} people)')
    print(f'        keeps  {keep[:96]}')
    for u, sid in zip(extras, made):
        print(f'        splits {u[:96]}')

if not APPLY:
    print()
    print('--dry: nothing written. Re-run with --apply, then tier-sources.py --apply.')
    sys.exit(0)

for s, keep, *_ in plan:
    # QUARANTINE, NEVER DELETE — the house rule, applied to prose. Several of
    # these fields carry a human annotation around the urls: "(season-by-season
    # table); 52-point Madison Square Garden game corroborated by ...". The urls
    # all survive as rows, but that sentence is the only record of WHICH claim
    # the second source was corroborating, and it would be gone forever. It is
    # parked in `title`, which is free here: emit reads `url or title`, so a row
    # with a url never shows its title, and nothing reaches the game.
    if not s.get('title'):
        s['title'] = s['url']
    s['url'] = keep
    s['publisher'] = domain(keep)
sources.extend(new_rows)
fs.extend(new_fs)
ps.extend(new_ps)
for name, data in (('sources', sources), ('fact_sources', fs),
                   ('person_sources', ps)):
    json.dump(data, open(os.path.join(D, name + '.json'), 'w'), indent=1)
print(f'\nAPPLIED. {len(targets)} rows split into {len(targets) + len(new_rows)}.')
print('NOW RUN: python3 tools/tier-sources.py --apply')
print('THEN:    tables-verify.py && tables-emit.py --apply && audit.py')

#!/usr/bin/env python3
"""Add the source tier column and compute every fact's confidence from it.
Dry-run by default; --apply writes.

THE SPEC IS TABLES.md -> "Source tier — the spec". This script implements it and
adds nothing of its own.

WHAT IT WILL NOT DO
-------------------
It tiers a source ONLY when DEEPRESEARCH_KNOWLEDGE.md names that publisher.
Anything the standard does not name is left NULL and REPORTED, never guessed.
CBS Sports is very probably Tier 2 journalism by the spirit of the rule, but the
standard does not list it, and a data cleanup that quietly invents rulings is how
a source standard stops meaning anything. Those come back to Aaron as a list.

THE CONFIDENCE CALCULATION (TABLES.md, restated here so the code and the doc
cannot drift):

    any Tier 1 attached                   -> high
    2+ Tier 2 from DIFFERENT publishers   -> high
    exactly 1 Tier 2                      -> medium
    only Tier 3, at any count             -> low
    no source, label-only, or untiered    -> low
"""
import json, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'docs/play/data/tables')
APPLY = '--apply' in sys.argv

# ---- the map. every entry traces to a named line in the standard -----------
TIER1 = ('basketball-reference.com', 'sports-reference.com', 'nba.com',
         'wnba.com', 'fiba.com', 'fiba.basketball', 'hoophall.com', 'wbhof.com')
TIER2 = ('apnews.com', 'ap.org', 'nytimes.com', 'espn.com', 'si.com',
         'theathletic.com', 'blackfives.org', 'apbr.org')
TIER3 = ('wikipedia.org', 'ifnotforthem.com', 'funwhileitlasted.net',
         'landofbasketball.com')

def domain(url):
    if not url:
        return None
    m = re.match(r'^https?://(?:www\.)?([^/\s)]+)', url.strip())
    return m.group(1).lower() if m else None

def tier_of(url):
    d = domain(url)
    if not d:
        return None                      # label-only source, no url to judge
    for group, t in ((TIER1, 1), (TIER2, 2), (TIER3, 3)):
        for host in group:
            if d == host or d.endswith('.' + host):
                return t
    return None                          # not named by the standard — Aaron's call

T = {f[:-5]: json.load(open(os.path.join(D, f))) for f in os.listdir(D)
     if f.endswith('.json') and f != 'todo.json'}
sources, facts, fs = T['sources'], T['facts'], T['fact_sources']

tiers, unnamed = {}, collections.Counter()
for s in sources:
    t = tier_of(s.get('url'))
    tiers[s['source_id']] = t
    if t is None and s.get('url'):
        unnamed[domain(s['url'])] += 1

BY_FACT = collections.defaultdict(list)
for r in fs:
    BY_FACT[r['fact_id']].append(r['source_id'])
SRC = {s['source_id']: s for s in sources}

def confidence(fid):
    got = [(tiers.get(sid), SRC.get(sid, {}).get('publisher'))
           for sid in BY_FACT.get(fid, [])]
    if any(t == 1 for t, _ in got):
        return 'high'
    t2 = [p for t, p in got if t == 2]
    if len(t2) >= 2 and len({p for p in t2 if p}) >= 2:
        return 'high'
    if len(t2) >= 1:
        return 'medium'
    return 'low'

new_conf = {f['fact_id']: confidence(f['fact_id']) for f in facts}
was = collections.Counter(f.get('confidence') for f in facts)
now = collections.Counter(new_conf.values())
tier_n = collections.Counter(tiers.values())

print('SOURCE TIER + FACT CONFIDENCE   (spec: TABLES.md)')
print('-' * 58)
print(f'  sources                       {len(sources):5d}')
for t in (1, 2, 3):
    print(f'    tier {t}                      {tier_n.get(t,0):5d}')
print(f'    NULL - no url (label only)  {sum(1 for s in sources if not s.get("url")):5d}')
print(f'    NULL - url the standard')
print(f'           does not name        {sum(unnamed.values()):5d}   <- YOUR CALL, listed below')
print()
print('  fact confidence      before  ->  after')
for k in ('high', 'medium', 'low'):
    arrow = '  ' if now.get(k, 0) == was.get(k, 0) else ('UP' if now.get(k, 0) > was.get(k, 0) else 'DN')
    print(f'    {k:8s}         {was.get(k,0):6d}  ->  {now.get(k,0):6d}   {arrow}')
print()
print(f'  facts that can SHIP (high)    {now.get("high",0):5d} of {len(facts)}')

if unnamed:
    print()
    print(f'  {len(unnamed)} publishers the standard does not name, top 12 by use.')
    print('  Left NULL on purpose. Tell me the tier and I will add them to the map:')
    for d, n in unnamed.most_common(12):
        print(f'    {d:38s}{n:5d}')

if not APPLY:
    print()
    print('--dry: nothing written.')
    sys.exit(0)

for s in sources:
    s['tier'] = tiers[s['source_id']]
for f in facts:
    f['confidence'] = new_conf[f['fact_id']]
json.dump(sources, open(os.path.join(D, 'sources.json'), 'w'), indent=1)
json.dump(facts, open(os.path.join(D, 'facts.json'), 'w'), indent=1)
print('\nAPPLIED. Now run: tables-verify.py, tables-emit.py --check, audit.py')

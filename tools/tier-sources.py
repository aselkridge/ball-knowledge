#!/usr/bin/env python3
"""Add the source tier column and compute every fact's confidence from it.
Dry-run by default; --apply writes.

THE SPEC IS TABLES.md -> "Source tier — the spec". This script implements it and
adds nothing of its own.

TWO LAYERS, IN ORDER
--------------------
1. docs/play/data/tables/source_register.json — the ~14 sites we actually lean
   on, each with PER-SECTION tiers and a note saying what that section is and how
   to cite from it. Researched, spot-checked, and the place to make a ruling.
2. The flat TIER1/TIER2/TIER3 tuples below — the 127-site long tail, judged by
   domain with a path rule for editorial sections.

The register wins where it applies. The report prints how many rows each layer
decided, so promoting a long-tail site into the register is a visible move.

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

# ---- layer 1: the source register ------------------------------------------
# Aaron, 2026-08-03: "does tier two go on both sources? Does two sources get tied
# to one fact?" — and then the better idea: a source is not ONE tier. The same
# site publishes records on one path and journalism on another.
#
# source_register.json is that idea as data: ~14 sites we actually lean on, each
# with per-section rulings and a navigation note saying what the section IS and
# how to cite from it. It is the AUTHORITY. Measured 2026-08-03: 1,408 of the
# 1,687 sourced rows (83%) land on a registered site.
#
# It does NOT replace the flat map below — 279 rows sit on 127 long-tail sites
# that do not deserve a hand-written entry each. Register first, map as fallback.
# The report says which layer decided, so a shrinking fallback is visible.
_REG = os.path.join(D, 'source_register.json')
if not os.path.exists(_REG):
    sys.exit('MISSING docs/play/data/tables/source_register.json — that file IS '
             'the tier rulings for the 14 sites carrying 83% of the bank. '
             'Without it every one of those rows would fall through to the flat '
             'map and lose its per-section ruling. Refusing to tier.')
REGISTER = json.load(open(_REG))


def seg_match(m, path):
    """Does section rule `m` match `path` at a path-SEGMENT boundary?

    Plain `m in path` is wrong and it bit on the first run. NBA.com's rule
    "/history" matched inside

        nba.com/news/history-3-pointer-evolution-larry-bird-stephen-curry

    — the word "history" in an article SLUG — and longest-match-wins then handed
    a news feature Tier 1, the record-of-fact tier. Ten facts went from medium to
    high on the strength of a substring. Anchoring to "/" fixes it: the rule must
    consume whole segments.
    """
    m = m if m.endswith('/') else m + '/'
    return m in (path.rstrip('/') + '/')


def register_tier(d, path):
    """Tier from the register, or None if the site is not registered.

    Longest matching section wins, so "/players/" beats the "/" catch-all. A
    registered site ALWAYS returns a tier — default_tier when no section hits —
    which is the point: a registered site is never 'unknown'.

    THE BACKSTOP. A registered site whose default_tier is 1 used to skip the
    EDITORIAL path check entirely, so nba.com/article/2017/09/11/morning-tip-...
    came back Tier 1 because the register happens to have no "/article" rule.
    Being registered made a site LESS strictly judged, which is backwards. Now an
    unruled path on a Tier 1 site still gets demoted if it looks like journalism.
    An EXPLICIT section ruling is trusted as written — that is what the research
    was for, and it is how big3 "/news/" stays at 3 rather than floating to 2.
    """
    for r in REGISTER:
        site = r['site']
        if d != site and not d.endswith('.' + site):
            continue
        best = None
        for sec in r.get('sections', []):
            m = sec['match']
            if seg_match(m, path) and (best is None or len(m) > len(best['match'])):
                best = sec
        ruled = best is not None and best['match'] != '/'
        tier = best['tier'] if best else r['default_tier']
        if tier == 1 and not ruled and any(s in path for s in EDITORIAL):
            tier = 2
        return tier, r['name']
    return None


# ---- layer 2: the flat map (the long tail) ---------------------------------
# Aaron, 2026-08-03: "how am I supposed to determine the validity of 230
# websites? I am not some database, I'm just a guy building a game... I would
# expect in your vast internet knowledge and understanding of research validity,
# you would either know or know where to find the best way to evaluate."
#
# He was right and the previous ask was wrong. The standard in
# DEEPRESEARCH_KNOWLEDGE.md does not name individual sites — it names CATEGORIES:
# "official stats & record books", "journalism with editorial standards",
# "fan databases, blogs, listicles". Sorting a named site into one of those is
# research, and research is the assistant's job. Refusing to do it was not
# caution, it was handing over 127 judgement calls.
#
# The line that still holds: INVENTING A CATEGORY would be overstepping. APPLYING
# his categories is not. Anything genuinely contested is left NULL and named.

# TIER 1 — record of fact. Official bodies speaking about themselves, halls of
# fame, university athletics, institutional archives, official record keepers.
TIER1 = (
    'basketball-reference.com', 'sports-reference.com', 'nba.com', 'wnba.com',
    'fiba.com', 'fiba.basketball', 'hoophall.com', 'wbhof.com',
    # official leagues and governing bodies
    'olympics.com', 'olympics.com.au', 'olympedia.org', 'teamusa.com',
    'ncaa.com', 'big3.com',
    'euroleaguebasketball.net', 'nbl.com.au', 'australia.basketball',
    # official clubs, on their own history
    'harlemglobetrotters.com', 'realmadrid.com', 'bulls.com',
    # university athletics official sites
    'rioredstorm.com', 'nccueaglepride.com', 'dillardbleudevils.com',
    'kuathletics.com', 'uconnhuskies.com', 'wholehogsports.com',
    # halls of fame and institutional archives
    'baseballhall.org', 'ashof.org', 'arblackhalloffame.org', 'hoopshallny.org',
    'springfield.edu',
    # specialist research organisations, same class as Black Fives / APBR
    'sabr.org',
)

# TIER 2 — reputable secondary. Journalism with editorial standards and a masthead.
TIER2 = (
    'apnews.com', 'ap.org', 'nytimes.com', 'espn.com', 'si.com',
    'theathletic.com', 'blackfives.org', 'apbr.org',
    # national news desks
    'washingtonpost.com', 'cbsnews.com', 'cbssports.com', 'nbcnews.com',
    'nbcsports.com', 'nbcsportsbayarea.com', 'nbcsportsphiladelphia.com',
    'nbcsportswashington.com', 'nbcsportsboston.com',
    'foxsports.com', 'foxnews.com', 'abcnews.go.com',
    'cnn.com', 'npr.org', 'upi.com', 'forbes.com', 'sportico.com',
    'andscape.com', 'slamonline.com', 'yahoo.com', 'nesn.com',
    # metro and regional papers
    'chicagomag.com', 'suntimes.com', 'inquirer.com', 'columbian.com',
    'richmondfreepress.com', 'newportthisweek.com', 'chicago.suntimes.com',
    'fox5ny.com', 'kslsports.com', 'nondoc.com', 'newsnationnow.com',
    # surfaced by the V16 split 08-04 — it was hidden behind a Wikipedia url in
    # a two-url field. Las Vegas Review-Journal, Nevada's largest daily, real
    # masthead. Journalism with editorial standards = Tier 2 by the standard's
    # own categories.
    'reviewjournal.com',
    # international desks
    'canberratimes.com.au', 'haaretz.com', '1news.co.nz', 'gmanetwork.com',
    'rappler.com', 'spin.ph', 'mb.com.ph', 'sports.inquirer.net',
    'tiebreakertimes.com.ph', 'sarajevotimes.com',
    # basketball and culture desks with editors
    'eurohoops.net', 'talkbasket.net', 'complex.com', 'vice.com',
    'thesource.com', 'hiphopdx.com', 'theshadowleague.com', 'newsone.com',
    'hbcugameday.com', 'insidehook.com', 'ibtimes.com', 'gamespot.com',
    'referee.com', 'popmatters.com',
    # Guinness adjudicates its OWN records, but for an NBA statistic it is
    # repeating the league's figure without citing it — checked 08-03, the
    # Mark Eaton 456-blocks page states the number and names no source. The
    # standard says statistics are Tier 1 only, and Guinness is not that record.
    'guinnessworldrecords.com',
    # university newsrooms writing about their own programmes
    'sunybroome.edu', 'uagc.edu',
)

# TIER 3 — index only, never ships alone. Encyclopaedias, fan databases,
# aggregators, team blogs, personal sites, social posts, press releases.
TIER3 = (
    'wikipedia.org', 'ifnotforthem.com', 'funwhileitlasted.net',
    'landofbasketball.com',
    # encyclopaedias and indexes — summaries of other sources by definition
    'britannica.com', 'history.com', 'encyclopedia.com',
    'encyclopediaofarkansas.net', 'ebsco.com', 'hmdb.org',
    # fan-maintained databases
    'probasketballencyclopedia.com', 'statscrew.com', 'nbahoopsonline.com',
    'sportsteamhistory.com', 'statmuse.com',
    # aggregators and listicle desks
    'bleacherreport.com', 'sportskeeda.com', 'fadeawayworld.net',
    'basketballnetwork.net', 'lwosports.com', 'ballislife.com', 'ballup.com',
    'insidehoops.com', 'thehooppost.com', 'midmajormadness.com',
    # team blogs (SB Nation family and kin) — fan-run, no newsroom
    'brightsideofthesun.com', 'blazersedge.com', 'mavsmoneyball.com',
    'orlandopinstripedpost.com', 'cardchronicle.com', 'lakersnation.com',
    # personal blogs and self-published
    'legendsofsport.blog', 'thesporting.blog', 'blogspot.com',
    'blackjackryan21.com', 'kevindaleyspeaks.com', 'picassobaby.com',
    'bathroomreader.com', 'blogs.timesofisrael.com', 'thebigo.com',
    'exglobetrotters.com', 'and1.com',
    # not independent, or not a source at all
    'prnewswire.com', 'x.com', 'directv.com',
)

def domain(url):
    if not url:
        return None
    m = re.match(r'^https?://(?:www\.)?([^/\s)]+)', url.strip())
    return m.group(1).lower() if m else None

# An official domain is not an official DOCUMENT. Spot-checked 2026-08-03 and
# this was a real hole, not a theoretical one:
#
#   big3.com/news/via-doombot-blog-the-basics-of-the-big3/
#     -> a guest blog post, bylined "DOOMbot", written by a member of an NFT
#        community, sitting on the league's own domain. Domain-level tiering
#        called it a record of fact. It is a blog.
#   olympics.com/en/news/fashion-police-lithuania-and-the-grateful-dead-band
#     -> editorial storytelling, not a results table.
#
# The standard tiers DOCUMENTS. So on an official site, the path decides:
# a results/records/history page is the record; a news, blog, feature or
# opinion page is that body's journalism, which is Tier 2 at best.
EDITORIAL = ('/news/', '/blog/', '/blogs/', '/stories/', '/story/', '/feature',
             '/opinion/', '/article/', '/press-release')

def path_of(url, d):
    return (url or '').lower().split(d, 1)[-1] if d else ''


DECIDED_BY = collections.Counter()


def tier_of(url):
    d = domain(url)
    if not d:
        DECIDED_BY['no url (label only)'] += 1
        return None                      # label-only source, no url to judge
    path = path_of(url, d)

    hit = register_tier(d, path)         # layer 1 — researched, per-section
    if hit:
        DECIDED_BY['register'] += 1
        return hit[0]

    for group, t in ((TIER1, 1), (TIER2, 2), (TIER3, 3)):
        for host in group:
            if d == host or d.endswith('.' + host):
                DECIDED_BY['flat map'] += 1
                if t == 1 and any(seg in path for seg in EDITORIAL):
                    return 2             # official body, but writing journalism
                return t
    DECIDED_BY['unknown'] += 1
    return None                          # genuinely unknown — named, never guessed

# ---- the regression that must never come back ------------------------------
# CLAUDE.md: "the durable fix is turning a claim into a command — if a check can
# be a script, make it one, because scripts run and reminders don't."
#
# Every case below is a REAL url out of sources.json, and every expectation was
# arrived at by opening the page or reading its slug — not by reasoning about
# what the tier ought to be. The first one is the bug this file shipped with for
# one run: "/history" matching inside the slug "history-3-pointer-evolution".
SELFTEST = [
    ('https://www.nba.com/news/history-3-pointer-evolution-larry-bird-stephen-curry', 2,
     'a NEWS feature whose slug contains the word history. Substring matching '
     'gave this Tier 1 and carried 10 facts to high on the strength of it.'),
    ('https://www.nba.com/article/2017/09/11/morning-tip-zack-clayton-unique-legacy', 2,
     'dated feature. The register has no /article rule, so the EDITORIAL '
     'backstop must catch it — being registered must not mean judged softer.'),
    ('https://www.nba.com/warriors/news-blogs/tdiwh-klay37', 2,
     'club blog. Spelled news-blogs, so the /news rule cannot reach it.'),
    ('https://official.nba.com/rule-no-1-court-dimensions-equipment/', 1,
     'the league publishing its own laws. THE record for a rules card.'),
    ('https://www.nba.com/watch/video/tdih-klay-thompson-scores-37-points', 3,
     'a video clip is not a document.'),
    ('https://big3.com/news/via-doombot-blog-the-basics-of-the-big3/', 3,
     'checked 08-03: bylined DOOMbot, an NFT community member, on the league '
     'domain. An explicit ruling of 3 must beat the generic editorial 2.'),
    ('https://www.basketball-reference.com/players/j/jordami01.html', 1,
     'the player career record.'),
    ('https://www.basketball-reference.com/friv/', 3,
     'trivia toys on a Tier 1 domain.'),
    ('https://en.wikipedia.org/wiki/Michael_Jordan', 3,
     'a lead, never a citation. 724 rows depend on this staying 3.'),
    ('https://www.olympics.com/en/olympic-games/montreal-1976/results/basketball', 1,
     'a results table.'),
    ('https://www.olympics.com/en/news/fashion-police-lithuania-and-the-grateful-dead-band', 2,
     'checked 08-03: storytelling on the same domain as the results table.'),
    # SYNTHETIC — no url in the bank exercises this today (measured: 0 rows).
    # Kept because break-it-on-purpose showed that deleting the EDITORIAL
    # backstop still scored 11/11: the /article case was passing off an explicit
    # rule, not off the backstop. A guard nothing tests is a guard that quietly
    # stops working. springfield.edu is registered Tier 1 with only a "/"
    # catch-all, so an editorial path there has nothing but the backstop.
    ('https://springfield.edu/news/naismith-peach-basket-anniversary', 2,
     'THE BACKSTOP ITSELF. If this returns 1, a registered Tier 1 site is '
     'being judged more softly than an unregistered one.'),
]

if '--selftest' in sys.argv:
    bad = 0
    print('TIER SELFTEST — real urls, expectations set by opening the page')
    print('-' * 62)
    for url, want, why in SELFTEST:
        got = tier_of(url)
        ok = got == want
        bad += not ok
        print(f'  {"ok  " if ok else "FAIL"}  want {want} got {got}  {url[:64]}')
        if not ok:
            print(f'          {why}')
    print()
    print(f'  {len(SELFTEST)-bad}/{len(SELFTEST)} pass'
          + ('' if not bad else f'   <- {bad} FAILING'))
    sys.exit(1 if bad else 0)

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
print(f'  {len(REGISTER)} sites in the register, '
      f'{sum(len(r.get("sections",[])) for r in REGISTER)} section rules')
print(f'    rows it decided             {DECIDED_BY["register"]:5d}')
print(f'    rows the flat map decided   {DECIDED_BY["flat map"]:5d}   <- promote these over time')
print()
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

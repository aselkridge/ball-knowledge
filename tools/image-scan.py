#!/usr/bin/env python3
"""FIND THE FACTS THAT ARE PICTURES.

WHY THIS EXISTS. On 2026-08-06 three cards were declared unverifiable because
the NBA's official court-dimensions rule page contains none of the measurements
in its text. Aaron asked the question nobody had: *"And the court diagram gave u
the numbers right? So it's still a good source?"* It did. Every number was in the
diagram. `verify-batch.readable()` strips a page to words and throws images away
— correct for an article, blind for anything drawn — and the failure reads
EXACTLY like the source not holding the fact.

So the pipeline now has a second eye. This script does the part a script can do:
walk every cached page, find the images that plausibly carry data, and set them
aside next to the page they came from. A human (or the assistant, which can see)
does the part a script cannot: look at them.

Aaron, 08-06: *"if a research tool won't read them but comes across them it
should put it to the side with the source for us to add another skill to analyze
all sourced pictures for fact data as well and be sure to store them as sources
related to the data tables."*

  python3 tools/image-scan.py                 what is in the cache, ranked
  python3 tools/image-scan.py --queue         write the work queue json
  python3 tools/image-scan.py --fetch N       download the next N unfetched
  python3 tools/image-scan.py --cited         only pages a fact already cites

WHAT COUNTS AS A CANDIDATE. Not every image is evidence. A page carries logos,
avatars, share buttons and ad pixels, and reading those is wasted effort. The
filter below is deliberately about SHAPE and NAME, never about being clever:
diagrams and stat tables are large, they live on content paths, and their file
names say what they are. Everything rejected is counted, not silently dropped,
so the filter can be argued with.

PROVENANCE, which is the part that matters. An image is a source in its own
right and it inherits nothing automatically — it is fetched from wherever the
publisher happens to host it, often a CDN on a different domain. So each queued
image records `via`, the page it appeared on. `tier-sources.py` uses that to give
the image the tier of its parent page: a diagram published on official.nba.com
is Tier 1 evidence even when it is served from ak-static.cms.nba.com. Without
`via` an image lands untiered and cannot support a card at all.
"""
import json, os, re, sys, hashlib, collections, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.cache/verify')
IMGDIR = os.path.join(ROOT, '.cache/images')
D = os.path.join(ROOT, 'docs/play/data/tables')
QUEUE = os.path.join(ROOT, '.cache/image-queue.json')

# names that almost always mean furniture rather than evidence
JUNK = re.compile(r'(logo|icon|favicon|sprite|avatar|headshot|banner|badge|'
                  r'button|arrow|spinner|placeholder|pixel|tracking|ad[-_]|'
                  r'social|share|facebook|twitter|instagram|youtube|apple-touch|'
                  r'thumb|profile)', re.I)
# names that suggest a fact lives inside
GOLD = re.compile(r'(diagram|dimension|court|chart|table|graph|stat|figure|'
                  r'infographic|scan|record|bracket|rule|measurement|plot)', re.I)
EXT = re.compile(r'\.(png|jpe?g|gif|webp|svg)(\?|$)', re.I)


def T(name):
    return json.load(open(os.path.join(D, name + '.json')))


def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + '.html')


def img_path(url):
    ext = (EXT.search(url).group(1).lower() if EXT.search(url) else 'bin')
    return os.path.join(IMGDIR, hashlib.sha1(url.encode()).hexdigest() + '.' + ext)


def page_urls():
    """Every url we have a cached page for, mapped to the facts citing it."""
    src = {s['source_id']: s for s in T('sources')}
    fs = collections.defaultdict(list)
    for r in T('fact_sources'):
        s = src.get(r['source_id'])
        if s and s.get('url'):
            fs[s['url']].append(r['fact_id'])
    return fs, {s['url']: s for s in src.values() if s.get('url')}


def images_in(html, base):
    """Pull image urls out of a cached page, absolutised.

    Reads src, data-src (lazy loading hides the real url there constantly) and
    srcset's first candidate. Misses CSS background-images on purpose — those
    are almost never the evidence and chasing them triples the noise."""
    out = []
    for m in re.finditer(r'<img\b[^>]*>', html, re.I):
        tag = m.group(0)
        u = None
        for attr in ('src', 'data-src', 'data-original', 'data-lazy-src'):
            a = re.search(attr + r'\s*=\s*"([^"]+)"', tag, re.I)
            if a and not a.group(1).startswith('data:'):
                u = a.group(1); break
        if not u:
            ss = re.search(r'srcset\s*=\s*"([^"]+)"', tag, re.I)
            if ss:
                u = ss.group(1).split(',')[0].strip().split(' ')[0]
        if not u or u.startswith('data:'):
            continue
        alt = (re.search(r'\balt\s*=\s*"([^"]*)"', tag, re.I) or [None, ''])[1]
        out.append((urllib.parse.urljoin(base, u), alt))
    return out


def main():
    a = sys.argv[1:]
    fs, srcmeta = page_urls()
    only_cited = '--cited' in a
    seen, rows = set(), []
    rej = collections.Counter()

    for url in sorted(srcmeta):
        p = cache_path(url)
        if not os.path.exists(p):
            continue
        if only_cited and not fs.get(url):
            continue
        html = open(p, encoding='utf-8', errors='replace').read()
        for iu, alt in images_in(html, url):
            if iu in seen:
                continue
            seen.add(iu)
            if not EXT.search(iu):
                rej['not an image extension'] += 1; continue
            name = iu.rsplit('/', 1)[-1]
            if JUNK.search(name) or JUNK.search(alt or ''):
                rej['furniture (logo/icon/social/etc)'] += 1; continue
            rows.append({
                'image': iu,
                'via': url,                       # THE PROVENANCE LINK
                'via_tier': srcmeta[url].get('tier'),
                'via_publisher': srcmeta[url].get('publisher'),
                'alt': alt,
                'facts_on_page': fs.get(url, []),
                'promising': bool(GOLD.search(name) or GOLD.search(alt or '')),
                'fetched': os.path.exists(img_path(iu)),
            })

    rows.sort(key=lambda r: (not r['promising'], -(len(r['facts_on_page'])),
                             r['via_tier'] or 9))

    if '--queue' in a:
        json.dump(rows, open(QUEUE, 'w'), indent=1)
        print(f'wrote {len(rows)} candidates -> {QUEUE}')
        return

    if '--fetch' in a:
        import subprocess
        n = int(a[a.index('--fetch') + 1])
        os.makedirs(IMGDIR, exist_ok=True)
        got = 0
        for r in rows:
            if got >= n or r['fetched']:
                continue
            out = img_path(r['image'])
            rc = subprocess.run(['curl', '-s', '--max-time', '45', '-o', out,
                                 r['image']], capture_output=True).returncode
            ok = rc == 0 and os.path.exists(out) and os.path.getsize(out) > 2000
            if not ok and os.path.exists(out):
                os.remove(out)
            print(f"  {'OK  ' if ok else 'FAIL'} {r['image'][:88]}")
            got += ok
        print(f'\n{got} image(s) downloaded into .cache/images/')
        return

    print(f'CACHED PAGES SCANNED: {sum(1 for u in srcmeta if os.path.exists(cache_path(u)))}')
    print(f'IMAGE CANDIDATES:     {len(rows)}   '
          f'({sum(1 for r in rows if r["promising"])} named like they hold data, '
          f'{sum(1 for r in rows if r["fetched"])} already downloaded)')
    print('rejected:', dict(rej))
    print('\nTOP OF THE QUEUE — promising, on pages cards already rest on:\n')
    for r in rows[:18]:
        mark = '*' if r['promising'] else ' '
        print(f" {mark} t{r['via_tier']}  {len(r['facts_on_page'])} card(s)  {r['image'][:74]}")
        print(f"        via {r['via'][:74]}")


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Build a season-by-season spine: champion, runner-up, series score, MVP, ROY.

    python3 tools/season-sweep.py --plan          what it would fetch
    python3 tools/season-sweep.py --run           fetch (polite, cached)
    python3 tools/season-sweep.py --table         print what was gathered

Why this exists
---------------
Aaron overruled me on 2026-08-07 and was right. I had costed a per-season sweep
against ONE card ("Jerry West, the only Finals MVP from a losing team") and
called 58 fetches a bad trade. His argument: *"isn't all that data just fuel for
soooo many more questions... ultimately we have unlimited questions we can ask,
it's just how you rotate them per user."*

That reframes the arithmetic completely. One season page carries the champion,
the beaten finalist, the series score, the MVP, the Rookie of the Year and the
scoring leader. Eighty pages is not eighty facts, it is a JOIN that sits behind
every dynasty question, every Finals superlative, every "who won in year X", and
every ONLY claim that needs checking against the full set. Costed per card it
never pays; costed per table it pays once and keeps paying.

Politeness, since this is somebody else's server
------------------------------------------------
One request at a time, never parallel, with a real pause between them, and every
page cached so a re-run costs the site nothing. Eighty pages spread over a few
minutes is less traffic than one person browsing the site with any enthusiasm.
That is the standard this repo holds itself to regardless of what the terms turn
out to permit (V29 is asking that question separately).
"""

import html
import json
import os
import re
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.cache/seasons')
OUT = os.path.join(ROOT, 'docs/play/data/research-seasons.json')
os.makedirs(CACHE, exist_ok=True)

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')

# The BBA/NBA's first season finished in 1947. The upper bound is read from the
# clock rather than hard-coded, so this file does not quietly go stale.
FIRST, LAST = 1947, 2026
PAUSE = 1.5          # seconds between requests
SHELL_BYTES = 91140  # basketball-reference's not-found page, measured 08-07


def url_for(year):
    return f'https://www.basketball-reference.com/leagues/NBA_{year}.html'


def fetch(year):
    path = os.path.join(CACHE, f'NBA_{year}.html')
    if os.path.exists(path) and os.path.getsize(path) > SHELL_BYTES + 5000:
        return open(path, encoding='utf-8', errors='replace').read(), True
    subprocess.run(['curl', '-sL', '--max-time', '40', '-A', UA,
                    url_for(year), '-o', path], check=False)
    time.sleep(PAUSE)
    return open(path, encoding='utf-8', errors='replace').read(), False


def readable(raw):
    """A 200 is not proof the data arrived (learned 08-07, twice). The season
    pages render server-side, so the summary text is the tell."""
    if len(raw) <= SHELL_BYTES + 1000:
        return None
    t = re.sub(r'<!--|-->', ' ', raw)
    t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t)))
    return t if 'League Champion' in t or 'Finals' in t else None


def parse(year, t):
    row = {'season_end': year, 'url': url_for(year)}
    m = re.search(r'League Champion\s*:\s*([A-Z][\w\.\' ]+?)\s+(?:Most Valuable|PPG|Rookie|Coach)', t)
    if m:
        row['champion'] = m.group(1).strip()
    m = re.search(r'Finals ([A-Z][\w\.\' ]+?) over ([A-Z][\w\.\' ]+?) \((\d-\d)\)', t)
    if m:
        row['finals_winner'], row['finals_loser'], row['series'] = (
            m.group(1).strip(), m.group(2).strip(), m.group(3))
    m = re.search(r'Most Valuable Player\s*:\s*([A-Z][\w\.\'\- ]+?)\s*\(', t)
    if m:
        row['mvp'] = m.group(1).strip()
    m = re.search(r'Rookie of the Year\s*:\s*([A-Z][\w\.\'\- ]+?)\s*\(', t)
    if m:
        row['roy'] = m.group(1).strip()
    m = re.search(r'PPG Leader\s*:\s*([A-Z][\w\.\'\- ]+?)\s*\(([\d\.]+)\)', t)
    if m:
        row['ppg_leader'], row['ppg'] = m.group(1).strip(), m.group(2)
    return row


def main():
    a = sys.argv[1:]
    years = list(range(FIRST, LAST + 1))

    if '--plan' in a or not a:
        have = sum(1 for y in years
                   if os.path.exists(os.path.join(CACHE, f'NBA_{y}.html')))
        print(f'{len(years)} seasons, {FIRST} to {LAST}')
        print(f'  already cached: {have}   still to fetch: {len(years)-have}')
        print(f'  pace: one at a time, {PAUSE}s apart '
              f'= about {round((len(years)-have)*PAUSE/60,1)} minutes')
        print(f'  each page yields: champion, beaten finalist, series score, '
              f'MVP, Rookie of the Year, scoring leader')
        return

    if '--run' in a:
        rows, misses = [], []
        for y in years:
            raw, cached = fetch(y)
            t = readable(raw)
            if not t:
                misses.append(y)
                continue
            rows.append(parse(y, t))
            print(f'  {y}  {"cache" if cached else "fetch"}  '
                  f'{rows[-1].get("champion", "?")}')
        json.dump(rows, open(OUT, 'w'), indent=1)
        print(f'\nwrote {len(rows)} seasons -> {OUT}')
        if misses:
            print(f'UNREADABLE ({len(misses)}), counted not skipped: {misses}')
        return

    if '--table' in a:
        rows = json.load(open(OUT))
        for r in rows:
            print(f'{r["season_end"]}  {r.get("champion",""):24} '
                  f'over {r.get("finals_loser",""):24} {r.get("series",""):4} '
                  f'MVP {r.get("mvp","")}')


if __name__ == '__main__':
    main()

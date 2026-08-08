#!/usr/bin/env python3
"""One home for how fast we are allowed to touch somebody else's server.

    from politeness import pause_for, UA
    time.sleep(pause_for(url))

Why this exists
---------------
Aaron, 2026-08-07, reading a sentence I had written into the document meant for
his lawyer: *"'Automated fetches are rate-limited well below the published
ceilings' — just give this quote a thought."*

I gave it a thought and it was false. Measured the same hour:

    season-sweep.py   PAUSE = 1.5s  ->  40 requests/minute
    basketball-reference robots.txt  ->  Crawl-delay: 3  (20/minute)
    sports-reference bot-traffic.html ->  20/minute, "in jail for up to a day"
    the 429 page they actually serve  ->  "more than thirty pages in less
                                           than a minute"

So the sweep ran at **twice the published ceiling**, above the rate their own
429 page names as the trigger, and twice as fast as their robots.txt asks. It
fetched 80 pages that way. Meanwhile verify-batch.py slept 3s, which is exactly
AT the ceiling rather than below it. Neither file was wrong on purpose; the
numbers were picked before anybody had read the limits, and then a document
described the intention instead of the behaviour.

**The reason this is a module and not two edited constants:** the same rule
lived in two files and drifted, and nothing would have caught the drift. A limit
that is somebody else's rule belongs in one place, with the quote that sets it
sitting next to the number, so the next person to change it has to look at the
evidence first.

Every number here is quoted from a page in docs/play/data/research-v29b-licensing.json
and dated. Re-read them before loosening anything, ever.
"""

from urllib.parse import urlparse

#: A descriptive agent, NOT a spoofed browser. Wikimedia's user-agent policy,
#: read 2026-08-07: "Do not copy a browser's user agent for your bot, as
#: bot-like behavior with a browser's user agent will be assumed malicious."
#: Both fetchers used to send a Chrome string. An honest agent is also the
#: faster one there: Wikimedia allows 200 req/min to an identified client and
#: 10 to an unidentified one.
UA = ('BallKnowledgeBot/1.0 (basketball trivia research; '
      'https://bk-ballknowledge.com/ ; one request at a time, cached)')

#: Seconds between requests, per host family. Each entry cites the document it
#: comes from. The default is deliberately the slowest, so an unlisted host is
#: treated cautiously rather than freely.
#:
#: sports-reference: robots.txt says "Crawl-delay: 3" and bot-traffic.html says
#:   20 requests/minute. Both mean 3.0s. We use 3.5 so that "below the published
#:   ceiling" is TRUE rather than "exactly at it", which is what verify-batch
#:   was doing and what I wrongly described as "well below".
#: wikimedia: 200 req/min for an identified agent, 3 concurrent connections.
#:   0.5s is comfortably inside it and we are nowhere near that volume anyway.
LIMITS = {
    'sports-reference': 3.5,
    'wikimedia': 0.5,
    'default': 3.5,
}

#: Hosts we do not fetch at all, with the reason. nba.com/robots.txt, read
#: 2026-08-07, carries "User-agent: anthropic-ai / Disallow: /" plus the same
#: for ClaudeBot and Claude-Web, with no Allow exceptions. An honest agent is
#: the one that gets refused there, so the answer is not to fetch, not to hide.
BLOCKED = {
    'nba.com': 'robots.txt disallows anthropic-ai, ClaudeBot and Claude-Web',
    'stats.nba.com': 'no terms document exists; datacenter IPs blocked wholesale',
    'wnba.com': 'same NBA-family robots.txt policy',
}


def family(url):
    h = (urlparse(url).netloc or '').lower().replace('www.', '')
    if h.endswith('-reference.com') or h in ('sports-reference.com', 'fbref.com',
                                             'stathead.com'):
        return 'sports-reference'
    if 'wikipedia.org' in h or 'wikimedia.org' in h or 'wikidata.org' in h:
        return 'wikimedia'
    return 'default'


def pause_for(url):
    """Seconds to sleep AFTER fetching this url, before the next request."""
    return LIMITS[family(url)]


def refuse(url):
    """Why we must not fetch this url at all, or None if it is fine."""
    h = (urlparse(url).netloc or '').lower().replace('www.', '')
    for bad, why in BLOCKED.items():
        if h == bad or h.endswith('.' + bad):
            return why
    return None


if __name__ == '__main__':
    for u in ['https://www.basketball-reference.com/leagues/NBA_1996.html',
              'https://en.wikipedia.org/wiki/Basketball',
              'https://www.nba.com/stats/',
              'https://www.espn.com/nba/']:
        r = refuse(u)
        print(f'{pause_for(u):4.1f}s  {"REFUSE: " + r if r else "ok"}  {u}')

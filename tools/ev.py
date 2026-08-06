#!/usr/bin/env python3
"""Print the words AROUND a match in a cached page. The evidence sheet's
partner tool.

WHY: --grep prints whole LINES, and a modern article is often one line
120,000 characters long — the nav, the article and the footer all welded
together. I read "1 of 10 lines matched", looked at the first 800 characters
of it (nav), and concluded twice that a perfectly good ESPN page had no
article in it. The page was fine; my window was 800 characters wide.

  python3 tools/ev.py <url-substring> <regex> [chars-of-context]
"""
import glob
import hashlib
import os
import re
import sys
import importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('vb', os.path.join(ROOT, 'tools/verify-batch.py'))
src = open(spec.origin, encoding='utf-8').read().replace('\nmain()', '')
vb = {'__name__': 'vb', '__file__': spec.origin}
exec(compile(src, spec.origin, 'exec'), vb)

need, pat = sys.argv[1], sys.argv[2]
pad = int(sys.argv[3]) if len(sys.argv) > 3 else 260

# the cache is keyed by sha1(url), so find the page by reading each file's
# own <link rel=canonical>/url is unreliable -- keep a url index instead
urls = []
for f in glob.glob(os.path.join(ROOT, 'docs/play/data/tables/sources.json')):
    import json
    urls = [s.get('url') for s in json.load(open(f)) if s.get('url')]
hit = [need] if need.startswith('http') else [u for u in urls if need in u]
if not hit:
    print('no source url contains', need); sys.exit(1)
for u in hit[:3]:
    p = os.path.join(ROOT, '.cache/verify',
                     hashlib.sha1(u.encode()).hexdigest() + '.html')
    if not os.path.exists(p):
        print('NOT CACHED', u); continue
    txt = vb['readable'](open(p, encoding='utf-8', errors='replace').read())
    print('=' * 78); print(u); print('=' * 78)
    ms = list(re.finditer(pat, txt, re.I))
    if not ms:
        print(f'  no match for /{pat}/ in {len(txt)} chars'); continue
    for m in ms[:12]:
        a, b = max(0, m.start() - pad), min(len(txt), m.end() + pad)
        print('  ...' + txt[a:b].replace('\n', ' ') + '...')
        print()
    if len(ms) > 12:
        print(f'  ({len(ms)-12} more matches)')

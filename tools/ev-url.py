#!/usr/bin/env python3
"""Print the words AROUND a regex match in a cached page, BY URL.

WHY THIS EXISTS ALONGSIDE ev.py. ev.py resolves its first argument against the
urls already in sources.json, which is exactly right when you are re-reading a
page a card already cites. It is useless for the opposite job: you have found a
page that is NOT yet a source and you need to read it before deciding whether to
attach it. That is the whole shape of the "stuck at medium" work -- the card has
been read and is correct, and what it needs is a Tier 1 page it does not cite
yet. Asking ev.py for that page returns "no source url contains ...", which
reads like the fetch failed when the fetch was fine.

  python3 tools/ev-url.py <full-url> <regex> [chars-of-context] [max-hits]
"""
import hashlib, os, re, sys, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location(
    'vb', os.path.join(ROOT, 'tools/verify-batch.py'))
vb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vb)

url, pat = sys.argv[1], sys.argv[2]
ctx = int(sys.argv[3]) if len(sys.argv) > 3 else 200
cap = int(sys.argv[4]) if len(sys.argv) > 4 else 6

p = os.path.join(ROOT, '.cache/verify',
                 hashlib.sha1(url.encode()).hexdigest() + '.html')
if not os.path.exists(p):
    print('NOT CACHED — fetch it first:', url); sys.exit(2)

raw = open(p, encoding='utf-8', errors='replace').read()
text = vb.readable(raw)
print(f'[{len(text)} chars of readable text]  {vb.title_of(raw)[:90]}')
hits = list(re.finditer(pat, text, re.I))
if not hits:
    print(f'NO MATCH for /{pat}/'); sys.exit(1)
print(f'{len(hits)} match(es); showing up to {cap}\n')
for m in hits[:cap]:
    a, b = max(0, m.start() - ctx), min(len(text), m.end() + ctx)
    print('  …' + text[a:b].replace('\n', ' ') + '…\n')

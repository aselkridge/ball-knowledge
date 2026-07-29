#!/usr/bin/env python3
"""Build the Ball Knowledge status board: inline the game's own fonts into the
template, emit a publishable HTML file.

  python3 tools/status-board/build.py [out.html]

The template is tools/status-board/template.html — EDIT THAT, never the output.
Fonts (Anton display, DSEG7 LED numerals) are the game's real faces, embedded as
data URIs because the artifact CSP blocks font CDNs.
"""
import base64, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TPL  = os.path.join(ROOT, 'tools/status-board/template.html')
FONTS = os.path.join(ROOT, 'docs/play/assets/fonts')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools/status-board/status.html')

s = open(TPL).read()
for token, fname in [('__ANTON__', 'anton-400.woff2'), ('__DSEG__', 'dseg7-700.woff2')]:
    if token not in s:
        continue  # already built
    with open(os.path.join(FONTS, fname), 'rb') as fh:
        s = s.replace(token, base64.b64encode(fh.read()).decode())

if s.count('<div') != s.count('</div>'):
    sys.exit(f"UNBALANCED div tags: {s.count('<div')} open vs {s.count('</div>')} close")

open(OUT, 'w').write(s)
print(f"built {len(s)//1024}KB -> {OUT}")
items = s.count(chr(34).join(["class=", "item"]))
print(f"sections: {s.count('<section id=')} · items: {items}")

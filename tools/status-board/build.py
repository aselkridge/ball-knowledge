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
# --tpl picks the template. TWO boards exist since 2026-08-06:
#   template.html     the ORIGINAL launch-focused board, ARCHIVED at Aaron's
#                     instruction ("archive the old one dont delete or rewrite").
#                     Its artifact url is frozen; do not republish over it.
#   template-v2.html  the all-inclusive board, with collapsible sections.
TPL_DEFAULT = 'tools/status-board/template-v2.html'
_a = sys.argv[1:]
TPL = os.path.join(ROOT, _a[_a.index('--tpl') + 1] if '--tpl' in _a else TPL_DEFAULT)
FONTS = os.path.join(ROOT, 'docs/play/assets/fonts')
_pos = [x for x in _a if not x.startswith('--') and x != (_a[_a.index('--tpl') + 1] if '--tpl' in _a else None)]
OUT = _pos[0] if _pos else os.path.join(ROOT, 'tools/status-board/status-v2.html')

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

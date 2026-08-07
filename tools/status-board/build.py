#!/usr/bin/env python3
"""Build the Ball Knowledge status board: inline the game's own fonts into the
template, emit a publishable HTML file.

  python3 tools/status-board/build.py [out.html]

The template is tools/status-board/template-v2.html — EDIT THAT, never the output.
Fonts (Anton display, DSEG7 LED numerals) are the game's real faces, embedded as
data URIs because the artifact CSP blocks font CDNs.
"""
import base64, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# --tpl picks the template. TWO boards exist since 2026-08-06:
#   template-ARCHIVED-2026-08-06.html
#                     the ORIGINAL launch-focused board, ARCHIVED at Aaron's
#                     instruction ("archive the old one dont delete or rewrite").
#                     Its artifact url is frozen; do not republish over it.
#   template-v2.html  the hand-written all-inclusive board. Superseded 08-06:
#                     written from memory, so it was missing most of BUILD.md.
#   template-v3.html  the CURRENT board. A frame with __SLOT__ placeholders that
#                     render.py fills from harvest.py, so the contents cannot
#                     drift from the docs.
TPL_DEFAULT = 'tools/status-board/template-v3.html'
_a = sys.argv[1:]
TPL = os.path.join(ROOT, _a[_a.index('--tpl') + 1] if '--tpl' in _a else TPL_DEFAULT)
FONTS = os.path.join(ROOT, 'docs/play/assets/fonts')
_pos = [x for x in _a if not x.startswith('--') and x != (_a[_a.index('--tpl') + 1] if '--tpl' in _a else None)]
OUT = _pos[0] if _pos else os.path.join(ROOT, 'tools/status-board/status-v3.html')

s = open(TPL).read()

# v3 is generated. Fill the content slots BEFORE the fonts, so a template with
# no slots (v1, v2) still builds unchanged.
model = None
if '__OWED__' in s:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import render
    s, model, measured = render.render(s)

for token, fname in [('__ANTON__', 'anton-400.woff2'), ('__DSEG__', 'dseg7-700.woff2')]:
    if token not in s:
        continue  # already built
    with open(os.path.join(FONTS, fname), 'rb') as fh:
        s = s.replace(token, base64.b64encode(fh.read()).decode())

# ASCII-ONLY OUTPUT.
# The artifact host supplies <head>, so the template cannot declare a charset of
# its own, and any host that serves this without one guesses. Chrome guesses
# latin-1, which turned every "·" into "Â·" and every "…" into "â€¦" in the
# first v3 screenshot. Numeric character references cannot be misread by any
# decoder, so the page stops depending on a header it does not control.
s = s.encode('ascii', 'xmlcharrefreplace').decode('ascii')

if s.count('<div') != s.count('</div>'):
    sys.exit(f"UNBALANCED div tags: {s.count('<div')} open vs {s.count('</div>')} close")

open(OUT, 'w').write(s)
print(f"built {len(s)//1024}KB -> {OUT}")
print(f"sections: {s.count('<section id=')} · collapsibles: {s.count('<details')}")
if model:
    c = model['counts']
    print(f"harvested: {c['total']} items from {len(c['by_doc'])} docs")
    for k, v in sorted(c['by_status'].items(), key=lambda x: -x[1]):
        print(f"    {v:4}  {k}")
    # Nothing may be dropped between the harvest and the page. A row that the
    # renderer skipped is exactly the failure v3 exists to prevent, so it is a
    # build error and not a warning.
    rendered = s.count('class="row') + s.count('class="item s-')
    if rendered < c['total']:
        sys.exit(f"DROPPED: harvested {c['total']} items, page renders {rendered}")
    print(f"rendered: {rendered} rows (>= {c['total']} harvested, no drops)")

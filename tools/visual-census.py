#!/usr/bin/env python3
"""The visual census: every colour, radius, type size, shadow and border the
product actually uses, counted. Born for item 111 (the design bible pass):
the motion half of THE FEEL STANDARD got its numbers measured before it got
its law (B18a), and the visual half gets the same treatment. A standard
written without this count would be taste; with it, the drift is arithmetic.

    python3 tools/visual-census.py            # human summary
    python3 tools/visual-census.py --json     # full counts for tooling

Counts distinct VALUES per property family and, for colours, how many uses
are raw literals versus var(--token) references. The gap between "values in
use" and "tokens in :root" is the debt the design bible has to either
absorb (make it a token) or outlaw (collapse it into one).
"""
import re, sys, json, collections

FILES = ['docs/play/index.html', 'docs/play/daily.js', 'docs/play/coach.js',
         'docs/play/feedback.js', 'docs/play/game.js']

css_chunks = []
for f in FILES:
    t = open(f, encoding='utf-8').read()
    if f.endswith('.html'):
        css_chunks += re.findall(r'<style[^>]*>(.*?)</style>', t, re.S)
        # inline style="" attributes are part of the product's look too
        css_chunks += re.findall(r'style="([^"]+)"', t)
    else:
        # JS paints through canvas fill/stroke styles and injected css text
        css_chunks += re.findall(r'''(?:fillStyle|strokeStyle|shadowColor)\s*=\s*['"]([^'"]+)['"]''', t)
        css_chunks += re.findall(r'''cssText\s*=\s*['"]([^'"]+)['"]''', t)
blob = '\n'.join(css_chunks)

hexes = collections.Counter(m.lower() for m in re.findall(r'#[0-9a-fA-F]{3,8}\b', blob))
rgbas = collections.Counter(re.findall(r'rgba?\([^)]+\)', blob))
radii = collections.Counter(re.findall(r'border-radius:\s*([^;"}]+)', blob))
# The radius ratchet exists to stop new arbitrary NUMBERS drifting off the
# ladder in DESIGN § 9. The CSS-wide keywords introduce no number at all:
# `inherit` means "whatever my subject already uses", which is by definition
# a value the ladder has already approved. Counting them as new debt is a
# false positive, and it fired the day the coach's ring was told to follow
# the shape of whatever it is ringing (08-29).
for _kw in ('inherit', 'initial', 'unset', 'revert', 'revert-layer'):
    radii.pop(_kw, None)
fsize = collections.Counter(re.findall(r'font-size:\s*([^;"}]+)', blob))
fams  = collections.Counter(re.findall(r'font-family:\s*([^;"}]+)', blob))
shad  = collections.Counter(re.findall(r'box-shadow:\s*([^;"}]+)', blob))
zind  = collections.Counter(re.findall(r'z-index:\s*([^;"}]+)', blob))
letsp = collections.Counter(re.findall(r'letter-spacing:\s*([^;"}]+)', blob))
varuse = len(re.findall(r'var\(--', blob))

# the token set: everything :root declares in index.html
html = open('docs/play/index.html', encoding='utf-8').read()
rootm = re.search(r':root\s*\{(.*?)\}', html, re.S)
tokens = dict(re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', rootm.group(1))) if rootm else {}
token_colors = {v.strip().lower() for v in tokens.values()
                if re.match(r'^#[0-9a-fA-F]{3,8}$', v.strip())}
raw_hex_uses = sum(c for h, c in hexes.items() if h not in token_colors)

out = {
    'distinct_hex_colors': len(hexes), 'hex_uses': sum(hexes.values()),
    'hex_uses_not_a_root_token': raw_hex_uses,
    'distinct_rgba': len(rgbas),
    'distinct_border_radius': len(radii),
    'distinct_font_sizes': len(fsize),
    'distinct_font_family_decls': len(fams),
    'distinct_box_shadows': len(shad),
    'distinct_z_indexes': len(zind),
    'distinct_letter_spacings': len(letsp),
    'var_references': varuse,
    'root_tokens': len(tokens),
    'root_color_tokens': len(token_colors),
    'top_hexes': hexes.most_common(20),
    'top_radii': radii.most_common(15),
    'top_font_sizes': fsize.most_common(20),
    'top_rgba': rgbas.most_common(15),
    'z_indexes': sorted(zind.items(), key=lambda x: -x[1])[:20],
}
if '--json' in sys.argv:
    print(json.dumps(out, indent=1)); sys.exit()

print('THE VISUAL CENSUS — what the product actually uses')
print('=' * 60)
for k in ['distinct_hex_colors', 'hex_uses', 'hex_uses_not_a_root_token',
          'distinct_rgba', 'distinct_border_radius', 'distinct_font_sizes',
          'distinct_box_shadows', 'distinct_z_indexes',
          'distinct_letter_spacings', 'var_references', 'root_tokens',
          'root_color_tokens']:
    print(f'  {k:34} {out[k]}')
print('\n  top hex colours:');   [print(f'    {h:10} x{c}') for h, c in out['top_hexes'][:12]]
print('\n  top radii:');         [print(f'    {r[:28]:30} x{c}') for r, c in out['top_radii'][:10]]
print('\n  top font sizes:');    [print(f'    {s[:28]:30} x{c}') for s, c in out['top_font_sizes'][:12]]

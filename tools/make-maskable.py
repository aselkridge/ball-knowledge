#!/usr/bin/env python3
"""Build the maskable app icon from the one we already have.

    python3 tools/make-maskable.py            write it
    python3 tools/make-maskable.py --proof    also write a masked preview

Why this exists
---------------
Android does not show an app icon as you drew it. It applies the launcher's own
mask -- a circle, a squircle, a rounded square depending on the phone -- and
anything outside a centred circle of 80% diameter gets cut off. `icon-512.png`
draws its cream ring almost edge to edge, so declaring it `purpose:"maskable"`
unchanged would slice the ring on every round-mask launcher.

Declaring nothing is the safe default and it is also the ugly one: the launcher
then drops the square icon into a white plate and shrinks it. So this makes the
variant properly, and it is GEOMETRY -- scale, composite, gradient -- which
CLAUDE.md's medium rule says to build rather than source. No new artwork is
invented: the mark is the mark, it is only re-seated on a bigger ground.

The ground is rebuilt rather than filled flat, because the source has a radial
vignette (#4e2e14 near the middle edges, #352111 in the corners) and a flat fill
would leave a visible square seam around the pasted circle.
"""

import pathlib
import sys

from PIL import Image, ImageDraw, ImageFilter

BRAND = pathlib.Path('docs/play/assets/brand')
SRC = BRAND / 'icon-512.png'
OUT = BRAND / 'icon-maskable-512.png'

SIZE = 512
SRC_RING_R = 210     # measured off icon-512: outer edge of the cream ring
SAFE_R = 205         # maskable safe zone is a centred circle of 80% diameter
TARGET_RING_R = 184  # comfortably inside SAFE_R, so no launcher mask can bite
FEATHER = 6

MID = (78, 46, 20)      # sampled at (256, 3)
CORNER = (53, 33, 17)   # sampled at (3, 3)


def ground():
    """The source's radial vignette, rebuilt at full canvas size."""
    g = Image.new('RGB', (SIZE, SIZE), CORNER)
    d = ImageDraw.Draw(g)
    steps = 96
    for i in range(steps, 0, -1):
        t = i / steps
        r = int(SIZE * 0.78 * t)
        c = tuple(round(CORNER[k] + (MID[k] - CORNER[k]) * (1 - t)) for k in range(3))
        d.ellipse([SIZE // 2 - r, SIZE // 2 - r, SIZE // 2 + r, SIZE // 2 + r], fill=c)
    return g.filter(ImageFilter.GaussianBlur(18))


def main():
    src = Image.open(SRC).convert('RGB')
    if src.size != (SIZE, SIZE):
        sys.exit(f'{SRC} is {src.size}, expected {(SIZE, SIZE)}')

    # Cut the mark out as a circle a little outside its ring, so the pixels at
    # the cut are already background and the composite has nothing to seam.
    cut = SRC_RING_R + 4
    mask = Image.new('L', (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).ellipse(
        [SIZE // 2 - cut, SIZE // 2 - cut, SIZE // 2 + cut, SIZE // 2 + cut], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(FEATHER))

    scale = TARGET_RING_R / SRC_RING_R
    n = round(SIZE * scale)
    small = src.resize((n, n), Image.LANCZOS)
    smask = mask.resize((n, n), Image.LANCZOS)

    out = ground()
    off = (SIZE - n) // 2
    out.paste(small, (off, off), smask)
    out.save(OUT, optimize=True)
    print(f'{OUT}  ring radius {TARGET_RING_R}px of a {SAFE_R}px safe zone')

    if '--proof' in sys.argv:
        # What a round-mask launcher actually shows. If the ring is cut in this
        # image, the icon is wrong -- that is the whole check.
        for name, r in [('circle', SIZE // 2), ('squircle-ish', SIZE // 2)]:
            p = out.copy().convert('RGBA')
            m = Image.new('L', (SIZE, SIZE), 0)
            ImageDraw.Draw(m).ellipse([0, 0, SIZE - 1, SIZE - 1], fill=255)
            p.putalpha(m)
            bg = Image.new('RGBA', (SIZE, SIZE), (240, 240, 240, 255))
            bg.alpha_composite(p)
            bg.convert('RGB').save(f'/tmp/maskproof-{name}.png')
            print(f'  proof: /tmp/maskproof-{name}.png')
            break


if __name__ == '__main__':
    main()

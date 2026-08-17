#!/usr/bin/env python3
"""Give the ON FIRE art real transparency, instead of faking it with a blend.

THE BUG (Aaron, 2026-08-17: "I need the 'on fire' not to have the black
background please"). The two stamps were sourced as bright flame on solid
black with no alpha channel, and the game leaned on `mix-blend-mode:screen`
to drop the black. That works right up until an ANCESTOR forms a stacking
context, because a blend only sees the backdrop inside its own group.
`.fs-stamp` carries `transform:rotate(-9deg)` for the tilt, which forms one,
so the img blended against nothing and the black square rendered. Measured,
not guessed: a walk up the parent chain reports `.fs-stamp forms=true`.

That means the black box was showing EVERYWHERE the slam fires, not only in
the Daily Five where he saw it.

THE FIX, and it is the asset rather than the CSS. Removing the transform
would fix today's symptom and leave the trap armed for the next person who
animates a parent. Real alpha cannot be broken by a stacking context.

THE KEY. Not a threshold, which would leave a hard jagged edge on artwork
that is mostly soft glow, and not luminance either, because luminance
weights red at 0.2126 and would make a pure-red flame 79% transparent.

    alpha = max(R, G, B)                  # black goes, saturated flame stays
    rgb   = rgb * 255 / alpha             # unpremultiply, so the colour holds

Over a dark background this composites to the same pixels the screen blend
produced, which is the point: the look does not change, only the mechanism.
Over a light one it now behaves like a proper glow instead of washing out.

TWO THINGS KEEP THE FILE SMALL, both found by measuring rather than guessing.
A straight unpremultiply turned every near-black pixel into saturated noise
and the file went 138KB -> 532KB, four times the size of the largest full
screen backdrop in the game, for one decorative slam. So the colour is faded
toward a single flame tint below alpha 96, where the hue is invisible anyway
and the noise was all of the cost; and webp's `alpha_quality` is turned down
separately from the colour, because a soft glow mask survives it and it is
worth more than any amount of colour quality here. Result is +25%, not +285%.

Originals are copied to design/art-bank/ first: quarantine-never-delete, and
the key always runs FROM the original so re-running cannot compound losses.
"""
import os, shutil, sys
import numpy as np
from PIL import Image

SRC = 'docs/play/assets/fire'
BANK = 'design/art-bank/fire-originals'
FILES = ['onfire-stamp-a.webp', 'onfire-stamp-b.webp']


KNEE = 96          # below this alpha the hue is noise, so fade it to TINT
TINT = np.array([255, 150, 52], dtype=np.float32)   # the flame's own average


def key(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    alpha = a.max(axis=2)
    scale = np.where(alpha > 0, 255.0 / np.maximum(alpha, 1), 0)[..., None]
    rgb = np.clip(a * scale, 0, 255)
    t = np.clip(alpha / KNEE, 0, 1)[..., None]
    out = np.dstack([rgb * t + TINT * (1 - t), alpha]).astype(np.uint8)
    total = alpha.size
    return (Image.fromarray(out, 'RGBA'),
            int((alpha == 0).sum()), int((alpha > 250).sum()), total)


os.makedirs(BANK, exist_ok=True)
for f in FILES:
    src = os.path.join(SRC, f)
    if not os.path.exists(src):
        sys.exit('missing ' + src)
    bank = os.path.join(BANK, f)
    if not os.path.exists(bank):
        shutil.copy2(src, bank)
    im, clear, opaque, total = key(bank)   # always key from the ORIGINAL
    before = os.path.getsize(src)
    im.save(src, 'WEBP', quality=80, alpha_quality=55, method=6, exact=True)
    after = os.path.getsize(src)
    print(f'{f}: {clear * 100 // total}% fully clear · '
          f'{opaque * 100 // total}% fully opaque · '
          f'{before // 1024}KB -> {after // 1024}KB')

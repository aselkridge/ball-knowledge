#!/usr/bin/env python3
"""Does anything on the Gym floor overlap anything else?

The Gym mockup puts seven drill stations on a half court inside a phone frame.
Seven labels on a 404 px wide court will collide unless somebody checks, and
"looks fine to me" is exactly the judgement that put the wrong court lines on
this page in the first place. So this lays every puck and every label out as a
rectangle and prints the overlaps.

    python3 tools/gym-labels.py

Reads the positions straight out of docs/dev/gym-sample.html, so it cannot
drift from the page it is checking. Exits 1 if anything overlaps or spills off
the court. The four .lb margin nudges in that file are what this found.
"""
import re, sys, pathlib

PAGE = pathlib.Path(__file__).resolve().parent.parent / 'docs/dev/gym-sample.html'

# The court box inside the phone frame, in CSS pixels, at the 430 px frame width
# the mockup is drawn at. .gym is 430 wide; .floor is left:3% right:3% of it and
# keeps aspect-ratio 500/470, which is the real half court, 50 ft by 47 ft.
FRAME_W = 430.0
COURT_W = FRAME_W * 0.94
COURT_H = COURT_W * 470 / 500

PUCK, GAP, LBH = 34, 5, 30        # .pk is 34 px, the flex gap is 5, .lb is ~30 tall

# label widths measured off a real render, and the .lb margin nudge in the CSS
LABEL = {
    'rebound': (200,   0), 'shoot': (152,  44/2), 'screen': (126, -44/2),
    'cross':   (136, -34/2), 'pass': ( 72,  34/2), 'basics': (124,   0),
    'steal':   (206,   0),
}

ST = re.compile(r'style="left:(\d+)%;top:(\d+)%"\s+data-k="(\w+)"')


def rects():
    html = PAGE.read_text(encoding='utf-8')
    out = []
    for xp, yp, key in ST.findall(html):
        xp, yp = float(xp), float(yp)
        lw, nudge = LABEL[key]
        cx, cy = xp / 100 * COURT_W, yp / 100 * COURT_H
        top = cy - (PUCK + GAP + LBH) / 2
        out.append((key, xp, yp,
                    (cx - PUCK / 2, cx + PUCK / 2, top, top + PUCK),
                    (cx - lw / 2 + nudge, cx + lw / 2 + nudge,
                     top + PUCK + GAP, top + PUCK + GAP + LBH)))
    return out


def main():
    rs = rects()
    if len(rs) != 7:
        print(f'FAIL  found {len(rs)} stations, expected 7'); return 1
    bad = 0
    for i in range(len(rs)):
        for j in range(i + 1, len(rs)):
            a, b = rs[i], rs[j]
            for an, ar in (('puck', a[3]), ('label', a[4])):
                for bn, br in (('puck', b[3]), ('label', b[4])):
                    ox = min(ar[1], br[1]) - max(ar[0], br[0])
                    oy = min(ar[3], br[3]) - max(ar[2], br[2])
                    if ox > 0 and oy > 0:
                        print(f'FAIL  {a[0]} {an} overlaps {b[0]} {bn} '
                              f'by {ox:.0f} x {oy:.0f} px')
                        bad += 1
    for key, xp, yp, puck, lab in rs:
        if lab[0] < -14 or lab[1] > COURT_W + 14 or lab[3] > COURT_H + 6:
            print(f'FAIL  {key} label spills off the court '
                  f'({lab[0]:.0f}..{lab[1]:.0f} of 0..{COURT_W:.0f}, '
                  f'bottom {lab[3]:.0f} of {COURT_H:.0f})')
            bad += 1
    print(f'\ncourt {COURT_W:.0f} x {COURT_H:.0f} px = 50 ft x 47 ft')
    for key, xp, yp, puck, lab in rs:
        print(f'  {key:8} {xp/100*50:5.1f} ft across, '
              f'{yp/100*47:5.1f} ft from the baseline')
    print(f'\n{"FAIL: " + str(bad) + " collisions" if bad else "PASS: nothing overlaps"}')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""
decisions.py -- every decision that is Aaron's to make, harvested.

Aaron, 2026-08-11: *"I have no idea where we are or what decisions I still
need to make."*

WHY THIS EXISTS, and why it is a script rather than a section in a doc.
`open-items.py` answers "what work is owed". `next.py` answers "what is next
on the two tracks". Neither answers "what is waiting on ME", and that is the
only question a person who is not doing the building actually needs answered.
It was being answered from memory, which means it was being answered
incompletely: a decision I did not happen to recall looks exactly like a
decision that was already made.

The board's own v3 note says the same thing about items, and the fix was the
same: harvest, never author.

HOW IT DECIDES SOMETHING IS A DECISION. Purely by the marker phrases the docs
already use, counted before this was written rather than invented for it:
"Aaron's call", "his call", "PICK PENDING", "DECISION FOR AARON", "awaiting
Aaron", "needs a ruling", "NOT DECIDED". Anything else is invisible here, on
purpose, so that adding a decision means writing one of these phrases and
nothing more.

CLOSED DECISIONS ARE SKIPPED, and the test is deliberately strict: a line is
closed only if it carries RULED / DECIDED / OVERRULED / struck through, in
which case the marker was left behind as history. When in doubt it stays on
the list, because a decision shown twice costs a glance and a decision shown
never costs a week.

    python3 tools/decisions.py            the list
    python3 tools/decisions.py --json     for the status board
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = ['V0.md', 'BUILD.md', 'DESIGN.md', 'RESEARCH-BACKLOG.md', 'TABLES.md']

# TWO CLASSES OF MARKER, because one pattern cannot do both jobs.
#
# STRONG markers state that a decision is outstanding. They are unambiguous
# and are taken at face value.
STRONG = re.compile(
    r"(pick pending|call pending|decision for aaron|awaiting aaron[’']?s? ?\w*|"
    r"waiting on aaron|needs? a ruling|not (?:yet )?decided|to be decided|"
    r"for aaron to rule|aaron has not (?:made|ruled|decided|picked)|"
    r"his call pending|aaron to pick)", re.I)

# WEAK markers only say a decision BELONGS to Aaron, which is equally true of
# every ruling he has already made. Left alone, "that is his call, recorded as
# his call, do not re-litigate" reads as an open question. The first version of
# this script returned 17 items for V0 and most were closed rulings wearing the
# phrase as history.
WEAK = re.compile(r"(aaron[’']s call|his call|aaron decides)", re.I)

# So a WEAK marker only counts when nothing nearby says it was already
# answered. Past tense is the tell: "was his call", "recorded as his call",
# "kept", "do not re-litigate".
PAST = re.compile(
    r"(was aaron[’']s call|was his call|recorded as (?:his|aaron[’']s) call|"
    r"that is (?:his|aaron[’']s) call|stays? (?:his|aaron[’']s) call|"
    r"do not re-?litigate|he (?:was shown|kept|chose|picked|ruled)|"
    r"already (?:his|ruled|decided)|which was aaron)", re.I)

# A line carrying one of these has been answered; the marker is the history of
# the question rather than a live ask.
CLOSED = re.compile(r"(\bRULED\b|\bDECIDED\b|\bOVERRULED\b|~~|\[x\]|"
                    r"\bANSWERED\b|\bSETTLED\b|\bSHIPPED\b)")

# Headings are places where decisions live, not decisions.
HEADING = re.compile(r'^\s*#{1,6}\s')

# Ids the docs use, so a row can be quoted back: D28, B9, V42, A3c, FL-2.6.
IDRE = re.compile(r'\b((?:[A-Z]{1,3})-?\d+[a-z]?)\b')


def context(lines, i):
    """The decision, as much of it as reads sensibly: the marker line plus
    following lines until the next blank or bullet. A one-line snippet is
    usually meaningless out of context, which is how a list like this gets
    ignored."""
    out = [lines[i].strip()]
    j = i + 1
    while j < len(lines) and len(' '.join(out)) < 420:
        nxt = lines[j].strip()
        if not nxt or re.match(r'^(#{1,6} |[-*] |\d+\. |\|)', nxt):
            break
        out.append(nxt)
        j += 1
    # if the marker landed mid-item, reach BACK to the bullet that owns it
    if not re.match(r'^([-*] |\d+\. |\*\*|#)', out[0]):
        k = i - 1
        back = []
        while k >= 0 and i - k < 8:
            prev = lines[k].strip()
            if not prev:
                break
            back.insert(0, prev)
            if re.match(r'^([-*] |\d+\. )', prev):
                out = back + out
                break
            k -= 1
    s = ' '.join(out)
    s = re.sub(r'^\s*[-*]\s*\[[ x]\]\s*', '', s)
    s = re.sub(r'^\s*[-*]\s*', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()


def clean(s):
    """markdown out, so the line reads the same in a terminal and on the board"""
    s = re.sub(r'`([^`]*)`', r'\1', s)
    s = re.sub(r'\*\*([^*]*)\*\*', r'\1', s)
    s = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'\1', s)
    s = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)
    return s.strip()


found, dropped = [], 0
for doc in DOCS:
    path = os.path.join(ROOT, doc)
    if not os.path.exists(path):
        continue
    lines = open(path, encoding='utf-8').read().split('\n')
    for i, ln in enumerate(lines):
        if HEADING.match(ln):
            continue
        m = STRONG.search(ln) or WEAK.search(ln)
        if not m:
            continue
        blob = context(lines, i)
        strong = bool(STRONG.search(ln))
        if CLOSED.search(blob) or (not strong and PAST.search(blob)):
            dropped += 1
            continue
        ids = IDRE.findall(blob[:120])
        found.append({
            'doc': doc, 'line': i + 1,
            'marker': m.group(0).lower(),
            'strong': strong,
            'id': ids[0] if ids else '',
            'text': clean(blob),
        })

# Same decision written in two places is one decision. Match on the first
# words, which is where the id and the claim live.
seen, uniq = set(), []
for f in found:
    key = re.sub(r'[^a-z0-9]', '', f['text'].lower())[:70]
    if key in seen:
        continue
    seen.add(key)
    uniq.append(f)

if '--json' in sys.argv:
    print(json.dumps(uniq, indent=1))
    sys.exit(0)

print()
print('DECISIONS WAITING ON AARON, harvested from the docs that hold them')
print('=' * 74)
print()
if not uniq:
    print('  None found. That is either true or the markers have drifted;')
    print('  the phrases this looks for are listed at the top of the script.')
    sys.exit(0)

bydoc = {}
for f in uniq:
    bydoc.setdefault(f['doc'], []).append(f)

for doc in DOCS:
    if doc not in bydoc:
        continue
    print(f'{doc}  ({len(bydoc[doc])})')
    print('-' * 74)
    for f in bydoc[doc]:
        head = f['id'] or ('!' if f['strong'] else ' ')
        body = f['text']
        print(f'  {head:<6} {body[:150]}')
        if len(body) > 150:
            for k in range(150, min(len(body), 460), 150):
                print(f'         {body[k:k+150]}')
        print(f'         {f["doc"]}:{f["line"]}')
        print()
    print()

print('=' * 74)
print(f'  {len(uniq)} open decisions.  {dropped} lines dropped as already answered.')
print()
print('  Found by marker phrase only, listed at the top of this script.')
print('  A decision written without one of those phrases is invisible here,')
print('  so write the phrase. A line saying RULED or DECIDED drops off.')

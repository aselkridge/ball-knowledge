#!/usr/bin/env python3
"""Harvest EVERY item out of the docs that own them, into one structured model.

Why this exists
---------------
Aaron, 2026-08-06, on the hand-written board: *"I think you are missing ALOT
from my future build stuff, idk why it feels like so much from the other doc is
left out. I want this doc to be complete."*

He was right, and the reason is structural. Version 2 of the board was authored
by hand, which means its contents were whatever I remembered while writing it.
BUILD.md alone is 3,639 lines with about twenty-five open design items in
section 6; the board showed four of them. No amount of care fixes an
authored-from-memory list, because the failure is silent: a missing item looks
exactly like a list that is finished.

So the board is GENERATED now. This file reads the docs, extracts every item it
can find, and reports the count. If something is missing from the board, it is
missing from the docs, and that is a fact worth knowing rather than a bug in the
board.

Run it on its own to see the harvest:
    python3 tools/status-board/harvest.py            # counts by doc and status
    python3 tools/status-board/harvest.py --json     # the whole model
    python3 tools/status-board/harvest.py --list     # every item, one per line
"""

import json, os, re, subprocess, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def read(name):
    with open(os.path.join(ROOT, name)) as f:
        return f.read().split('\n')


# --------------------------------------------------------------------------
# status vocabulary
#
# Inferred from the words the docs already use. Every doc in this repo writes
# its state INTO the title ("22x · THE SOUNDTRACK IS CAST AND WIRED (BUILT)"),
# which is lucky, because it means the status does not have to be maintained in
# a second place where it would immediately drift.
# --------------------------------------------------------------------------
DONE_WORDS = ('DONE', 'FIXED', 'BUILT', 'SHIPPED', 'RESOLVED', 'COMPLETE',
              'APPLIED', 'MERGED', '✅')
WAIT_WORDS = ('WAITING ON AARON', 'OWED TO AARON', 'AARON RUNS', 'AARON SENDS',
              'BLOCKING', 'AWAITING D1', 'AWAITING AARON', 'NEEDS AARON',
              'BRIEF OWED', 'AARON TO CLICK', 'ASK AARON')
DEAD_WORDS = ('SUPERSEDED', 'DROPPED', 'NOT A GAP')
SPEC_WORDS = ('SPEC\'D', 'SPECD', 'SPEC ', 'PARKED', 'NOT BUILT', 'PROPOSAL',
              'IDEA BANK', 'DESIGNED')


def _has(up, words):
    """Word-boundary match. Plain substring matching read COMPLETENESS as
    COMPLETE and filed "the knowledge base, COMPLETENESS not size" as finished
    work, which is close to the opposite of what that section says."""
    for w in words:
        if w.replace(' ', '').isalpha():
            if re.search(r'\b' + w + r'\b', up):
                return True
        elif w in up:
            return True
    return False


def classify(title, checked=None):
    """done | wait | spec | dead | open"""
    if checked is True:
        return 'done'
    up = title.upper()
    # "nothing dropped" is the opposite of dropped, and the AFTER LAUNCH block
    # says exactly that. Negations are checked before any keyword fires.
    negated = 'NOTHING DROPPED' in up or 'NOT DROPPED' in up
    if not negated and _has(up, DEAD_WORDS):
        return 'dead'
    # "DECIDED ... not built" is not done: the build is the part that matters.
    if _has(up, DONE_WORDS) and 'NOT BUILT' not in up:
        return 'done'
    if _has(up, WAIT_WORDS):
        return 'wait'
    if _has(up, SPEC_WORDS):
        return 'spec'
    if 'DECIDED' in up:
        return 'done'
    return 'open'


# Ids are a closed set, matched longest-first, and must be followed by a
# separator. The permissive version read "17 screens have only the smoke floor"
# as item 17, and "2 (Aaron, 07-31)" as item 2.
ID_RE = re.compile(
    r'^(5b(?:\.\d[a-z]?)?'
    r'|FL-\d(?:\.\d)?'
    r'|\d{2}[a-z]{1,3}(?:-[A-Z0-9]+)*'
    r'|[VQSHPCD]\d{1,2}(?:-[A-Z0-9]+)*'
    r'|P[01])'
    r'(?=[ ·:.—-]|$)[ ·.:—-]*')


def split_id(title):
    m = ID_RE.match(title.strip())
    if not m:
        return '', title.strip()
    return m.group(1), title[m.end():].strip(' ·.:—-')


def clean(s):
    """Markdown to plain-ish text, kept short enough to read in a list."""
    s = re.sub(r'`([^`]*)`', r'\1', s)
    s = re.sub(r'\*\*([^*]*)\*\*', r'\1', s)
    s = re.sub(r'\*([^*]*)\*', r'\1', s)
    s = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', s)
    return re.sub(r'\s+', ' ', s).strip()


def summarise(lines, i, limit=3):
    """The first real prose after an item, for the collapsed one-liner."""
    out, n = [], 0
    for ln in lines[i + 1:i + 26]:
        t = ln.strip()
        if not t:
            if out:
                break
            continue
        if t.startswith(('#', '- [', '|', '```')):
            break
        if t.startswith('- ') and out:
            break
        out.append(clean(t.lstrip('- ')))
        n += 1
        if n >= limit:
            break
    return ' '.join(out)[:420]


# --------------------------------------------------------------------------
# the harvesters, one per shape of item
# --------------------------------------------------------------------------
def harvest_checkboxes(doc, lines, section_of):
    """`- [ ] **V24 · title**` and its bare cousins."""
    out = []
    pat = re.compile(r'^(\s*)- \[([ xX])\]\s*(.*)$')
    for i, ln in enumerate(lines):
        m = pat.match(ln)
        if not m:
            continue
        indent, mark, rest = m.groups()
        title = clean(rest)
        if not title:
            continue
        iid, short = split_id(title)
        out.append(dict(doc=doc, line=i + 1, kind='task', id=iid,
                        title=short or title, raw=title,
                        status=classify(title, mark.lower() == 'x'),
                        section=section_of(i + 1),
                        detail=summarise(lines, i, 2),
                        nested=len(indent) > 0,
                        rank=RANK_SUB if indent else RANK_BULLET))
    return out


RANK_H2, RANK_H3, RANK_BULLET, RANK_SUB = 0, 1, 2, 3


def harvest_bold_bullets(doc, lines, section_of, first_line=0, last_line=10**9):
    """`- **22ac · IDEA BANK (…)**` , the shape BUILD.md section 6 uses.

    The title routinely wraps across two or three lines, so the opening `- **`
    is followed by everything up to the closing `**`. Reading only the first
    line here silently truncated a third of the titles on the first attempt.
    """
    out = []
    for i, ln in enumerate(lines):
        if not (first_line <= i + 1 <= last_line):
            continue
        if not ln.startswith('- **'):
            continue
        buf = ln[4:]
        j = i
        while '**' not in buf and j - i < 6:
            j += 1
            if j >= len(lines):
                break
            buf += ' ' + lines[j].strip()
        title = clean(buf.split('**')[0])
        if not title:
            continue
        iid, short = split_id(title)
        out.append(dict(doc=doc, line=i + 1, kind='design', id=iid,
                        title=short or title, raw=title,
                        status=classify(title), section=section_of(i + 1),
                        detail=summarise(lines, j, 3), nested=False,
                        rank=RANK_BULLET))
    return out


def harvest_headings(doc, lines, levels=(3,), first_line=0, last_line=10**9):
    """`### V7 · Corpus source upgrade · Type B · BIG`"""
    out = []
    for i, ln in enumerate(lines):
        if not (first_line <= i + 1 <= last_line):
            continue
        m = re.match(r'^(#{1,6}) +(.*)$', ln)
        if not m or len(m.group(1)) not in levels:
            continue
        title = clean(m.group(2))
        iid, short = split_id(title)
        out.append(dict(doc=doc, line=i + 1, kind='run', id=iid,
                        title=short or title, raw=title,
                        status=classify(title), section='',
                        detail=summarise(lines, i, 3), nested=False,
                        rank=RANK_H3 if len(m.group(1)) >= 3 else RANK_H2))
    return out


def section_indexer(lines, levels=(2, 3)):
    """Nearest preceding heading, so every item knows where it lives."""
    marks = []
    for i, ln in enumerate(lines):
        m = re.match(r'^(#{1,6}) +(.*)$', ln)
        if m and len(m.group(1)) in levels:
            marks.append((i + 1, clean(m.group(2))))

    def at(line):
        cur = ''
        for ln_no, name in marks:
            if ln_no <= line:
                cur = name
            else:
                break
        return cur
    return at


def dedupe(items):
    """Same id in the same doc twice means an item and its superseded original.
    Keep the FIRST, which the docs always write as the current one, and record
    that a history exists rather than dropping it silently."""
    seen, out = {}, []
    for it in items:
        key = (it['doc'], it['id'], it['title'][:40])
        if it['id'] and (it['doc'], it['id']) in seen:
            seen[(it['doc'], it['id'])]['history'] += 1
            continue
        if key in seen:
            continue
        it['history'] = 0
        seen[key] = it
        if it['id']:
            seen[(it['doc'], it['id'])] = it
        out.append(it)
    return out


def parent_pass(items):
    """Attach every item to the nearest preceding item of a higher rank in the
    same doc.

    This is the fix for the noise, and it is deliberately a DEMOTION and not a
    deletion. "Deliberately cross-league." and "Tone guardrail:" are real lines
    that belong to the off-court mining spec; listed as peers they are junk, and
    thrown away they are lost. Nested, they are what they always were: the
    detail inside an item. Aaron asked for complete and not confusing, and those
    two only conflict if the structure is flat.
    """
    by_doc = {}
    for it in items:
        by_doc.setdefault(it['doc'], []).append(it)
    for doc, group in by_doc.items():
        group.sort(key=lambda x: x['line'])
        stack = []
        for it in group:
            while stack and stack[-1]['rank'] >= it['rank']:
                stack.pop()
            it['parent'] = stack[-1]['key'] if stack else None
            it['key'] = f"{doc}:{it['line']}"
            it['children'] = []
            stack.append(it)
    index = {i['key']: i for i in items}
    for it in items:
        if it['parent'] and it['parent'] in index:
            index[it['parent']]['children'].append(it['key'])
    return items


# --------------------------------------------------------------------------
def build_model():
    model = {'items': [], 'generated': None, 'counts': {}}

    # ---- V0.md — the live scope -------------------------------------------
    v0 = read('V0.md')
    sec = section_indexer(v0)
    model['items'] += harvest_checkboxes('V0.md', v0, sec)

    # ---- BUILD.md ---------------------------------------------------------
    b = read('BUILD.md')
    bsec = section_indexer(b)
    ch = next(i for i, l in enumerate(b) if l.startswith('## 7 · Changelog'))
    # everything before the changelog: the changelog is history, not work owed
    model['items'] += harvest_bold_bullets('BUILD.md', b, bsec, 1, ch)
    model['items'] += harvest_checkboxes('BUILD.md', b[:ch], bsec)
    # Level 2 as well as 3. Without the section headings in the rank chain
    # there is nothing to close an h3, so "5b.2 The Tape" adopted all
    # twenty-nine design items in section 6 as its children.
    model['items'] += harvest_headings('BUILD.md', b, (2, 3), 1, ch)

    # ---- RESEARCH-BACKLOG.md ----------------------------------------------
    r = read('RESEARCH-BACKLOG.md')
    rsec = section_indexer(r, (1, 2))
    model['items'] += harvest_checkboxes('RESEARCH-BACKLOG.md', r, rsec)
    model['items'] += harvest_headings('RESEARCH-BACKLOG.md', r, (1, 2, 3))

    # ---- DESIGN.md / TABLES.md — open questions ---------------------------
    d = read('DESIGN.md')
    dsec = section_indexer(d)
    try:
        oq = next(i for i, l in enumerate(d) if l.startswith('## Open questions'))
        model['items'] += harvest_bold_bullets('DESIGN.md', d, dsec, oq, len(d))
        for i, ln in enumerate(d[oq:], start=oq):
            if ln.startswith('- ') and not ln.startswith('- **'):
                t = clean(ln[2:])
                if len(t) > 12:
                    model['items'].append(dict(
                        doc='DESIGN.md', line=i + 1, kind='design', id='',
                        title=t, raw=t, status='open', section='Open questions',
                        detail='', nested=False, history=0, rank=RANK_BULLET))
    except StopIteration:
        pass

    t = read('TABLES.md')
    tsec = section_indexer(t)
    model['items'] += harvest_checkboxes('TABLES.md', t, tsec)

    model['items'] = dedupe(model['items'])
    model['items'] = parent_pass(model['items'])

    # drop the noise a heading sweep always picks up
    NOISE = re.compile(r'^(the |what |why |how |a note|example|note$)', re.I)
    model['items'] = [i for i in model['items']
                      if len(i['title']) > 6 and not NOISE.match(i['title'])
                      or i['id']]

    by_doc, by_status = {}, {}
    for i in model['items']:
        by_doc[i['doc']] = by_doc.get(i['doc'], 0) + 1
        by_status[i['status']] = by_status.get(i['status'], 0) + 1
    model['counts'] = {'total': len(model['items']), 'by_doc': by_doc,
                       'by_status': by_status}
    model['generated'] = datetime.date.today().isoformat()
    return model


# --------------------------------------------------------------------------
# live numbers, recomputed. Never quote one of these from memory.
# --------------------------------------------------------------------------
def measure():
    m = {}

    def run(cmd):
        try:
            return subprocess.run(cmd, cwd=ROOT, capture_output=True,
                                  text=True, timeout=300).stdout
        except Exception:
            return ''

    out = run(['python3', 'tools/build-verified-index.py'])
    mm = re.search(r'unverified: (\d+) of (\d+) cards', out)
    if mm:
        m['unverified'] = int(mm.group(1))
        m['cards_total'] = int(mm.group(2))
        m['dealable'] = m['cards_total'] - m['unverified']

    a = run(['python3', 'tools/audit.py'])
    m['audit_pass'] = 'gate: PASS' in a
    for k in ('sources_dead', 'players_missing_companion', 'stale_overdue',
              'todo_open', 'anchored_unreviewed'):
        mk = re.search(rf'^\s*{k}\s+(\d+)', a, re.M)
        if mk:
            m[k] = int(mk.group(1))

    o = run(['python3', 'tools/open-items.py'])
    mo = re.search(r'(\d+) open · (\d+) closed', o)
    if mo:
        m['open_items'] = int(mo.group(1))
        m['closed_items'] = int(mo.group(2))

    try:
        m['commits_ahead'] = len(subprocess.run(
            ['git', 'log', '--oneline', 'origin/main..HEAD'], cwd=ROOT,
            capture_output=True, text=True).stdout.strip().split('\n')) \
            if subprocess.run(['git', 'log', '--oneline', 'origin/main..HEAD'],
                              cwd=ROOT, capture_output=True,
                              text=True).stdout.strip() else 0
    except Exception:
        m['commits_ahead'] = 0
    return m


if __name__ == '__main__':
    model = build_model()
    if '--json' in sys.argv:
        model['measured'] = measure()
        print(json.dumps(model, indent=1))
    elif '--list' in sys.argv:
        for i in sorted(model['items'], key=lambda x: (x['doc'], x['line'])):
            print(f"{i['status']:5} {i['doc']:22} :{i['line']:<5} "
                  f"{(i['id'] or '-'):10} {i['title'][:80]}")
    else:
        c = model['counts']
        print(f"\nHARVESTED {c['total']} items\n")
        print('  by doc')
        for k, v in sorted(c['by_doc'].items(), key=lambda x: -x[1]):
            print(f'    {v:4}  {k}')
        print('\n  by status')
        for k, v in sorted(c['by_status'].items(), key=lambda x: -x[1]):
            print(f'    {v:4}  {k}')
        print()

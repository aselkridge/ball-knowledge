#!/usr/bin/env python3
"""Count the coach-tour filing and PROVE it covers LIST TWO.

Reads design/COACH-TOURS-2026-08-10.md (the filing) and design/
COACH-AND-DRILLS.md LIST TWO (the catalog), expands every id shorthand
(CM-ON-01..10, CM-DAILY-01/02/03), and reports:
  - every verdict's count, one denominator, both halves walked the same way
  - any catalog row the filing missed, and any id filed twice
The unmined.py lesson is the reason this exists: a counter that walks its
two halves differently is always wrong, and wrong in the flattering
direction. This one dies loudly instead.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOURS = ROOT / 'design/COACH-TOURS-2026-08-10.md'
CATALOG = ROOT / 'design/COACH-AND-DRILLS.md'


def expand(cell):
    """'CM-ON-01..10, 13..18' / 'CM-DAILY-01/02/03' / 'CM-JKT-01..05' -> ids"""
    ids, prefix = [], None
    for tok in re.split(r'[,\s]+', cell.strip()):
        if not tok:
            continue
        m = re.match(r'^(CM-[A-Z]+)-([\d./]+.*)$', tok)
        if m:
            prefix, rest = m.group(1), m.group(2)
        elif prefix and re.match(r'^[\d./]+', tok):
            rest = tok
        else:
            continue
        for part in rest.split('/'):
            part = part.strip('.')
            r = re.match(r'^(\d+)\.\.(\d+)$', part)
            if r:
                ids += [f'{prefix}-{i:02d}' for i in range(int(r.group(1)), int(r.group(2)) + 1)]
            elif part.isdigit():
                ids.append(f'{prefix}-{int(part):02d}')
    return ids


def verdict_kind(v, idx, n):
    """classify one verdict cell; idx/n handle 'SCREEN / CUT / CUT' rows"""
    v = v.strip()
    if '/' in v and all(p.strip().split()[0].isupper() for p in v.split('/')):
        parts = [p.strip() for p in v.split('/')]
        if len(parts) == n:
            v = parts[idx]
    head = v.split('·')[0].strip()
    if head.startswith('T1') or head.startswith('T2') or head.startswith('T3'):
        return 'tour-step'
    if head.startswith('TT:') or 'TT:' in v:
        return 'triggered-tour'
    if head.startswith('TRIG'):
        return 'trigger-live' if 'live' in v else 'trigger'
    if head.startswith('GUARD'):
        return 'guardrail'
    if head.startswith('SCREEN'):
        return 'screen'
    if head.startswith('FOLD'):
        return 'fold'
    if head.startswith('LATER'):
        return 'later'
    if head.startswith('PARKED'):
        return 'parked'
    if head.startswith('CUT'):
        return 'cut'
    if head.startswith('RULED'):
        return 'ruled-done'
    if head.startswith('ENGINE'):
        return 'engine-rule'
    return f'?? {v}'


def main():
    filed, dupes, counts = {}, [], {}
    for line in TOURS.read_text(encoding='utf-8').splitlines():
        m = re.match(r'^\| (CM-[^|]+) \| ([^|]+) \|', line)
        if not m:
            continue
        ids = expand(m.group(1))
        for i, pid in enumerate(ids):
            kind = verdict_kind(m.group(2), i, len(ids))
            if pid in filed:
                dupes.append(pid)
            filed[pid] = kind
            counts[kind] = counts.get(kind, 0) + 1

    # the catalog's body rows: every | CM-... row in LIST TWO except the
    # fourteen CM-EXIST originals, which the body re-lists as aliases
    catalog = set()
    for line in CATALOG.read_text(encoding='utf-8').splitlines():
        m = re.match(r'^\| (CM-[A-Z]+-\d+) \|', line)
        if m and not m.group(1).startswith('CM-EXIST'):
            catalog.add(m.group(1))

    body = {k for k in filed if not k.startswith('CM-EXIST')}
    missing = sorted(catalog - body)
    invented = sorted(body - catalog)

    print(f'catalog body rows {len(catalog)} · filed body rows {len(body)} '
          f'· plus the {len(filed) - len(body)} EXIST aliases')
    for k in sorted(counts, key=lambda x: -counts[x]):
        print(f'  {counts[k]:4}  {k}')
    bad = False
    if dupes:
        print('FILED TWICE:', ', '.join(sorted(set(dupes)))); bad = True
    if missing:
        print('MISSING FROM THE FILING:', ', '.join(missing)); bad = True
    if invented:
        print('FILED BUT NOT IN THE CATALOG:', ', '.join(invented)); bad = True
    unknown = [k for k in counts if k.startswith('??')]
    if unknown:
        print('UNPARSED VERDICTS:', unknown); bad = True
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()

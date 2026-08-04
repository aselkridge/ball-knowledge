#!/usr/bin/env python3
"""Set The Tape's export passcode.

  python3 tools/tape-passcode.py "your new passcode"

Writes only the HASH into docs/tape/index.html. The passcode itself is never
stored anywhere in this repo, which is the whole point — the repo is public.

WHAT THIS PROTECTS, EXACTLY. It stops the person who finds the page, presses the
obvious button and walks off with the whole card bank in a spreadsheet. It does
not stop anyone who opens devtools, and it cannot: docs/play/data/tables/*.json
are served from the same public site because the game itself fetches them, and
the repo is public besides. Aaron overruled my objection to building this and he
was right to — most people only ever try the door — but a lock that is described
as more than it is becomes a reason not to fix the real thing later.

5,000 rounds of SHA-256 is not key-stretching in any serious sense; it just puts
a few seconds between an attacker and each dictionary word. Pick a passcode that
is not a dictionary word.
"""
import hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'docs/tape/index.html')
ROUNDS = 5000


def derive(pw):
    h = pw
    for _ in range(ROUNDS):
        h = hashlib.sha256(h.encode()).hexdigest()
    return h


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        cur = re.search(r"const LOCKHASH='([0-9a-f]{64})'", open(PAGE).read())
        print('current hash:', cur.group(1) if cur else 'NOT FOUND')
        return
    pw = sys.argv[1]
    if len(pw) < 8:
        print('Too short. Eight characters minimum — this one is guessable in an '
              'afternoon and the hash is public.')
        return
    h = derive(pw)
    s = open(PAGE, encoding='utf-8').read()
    s2, n = re.subn(r"const LOCKHASH='[0-9a-f]{64}'", f"const LOCKHASH='{h}'", s)
    if n != 1:
        print(f'Expected exactly one LOCKHASH line, found {n}. Nothing written.')
        return
    open(PAGE, 'w', encoding='utf-8').write(s2)
    print('Set. The passcode is not written anywhere — remember it.')
    print('  hash:', h)
    print('\nAnyone already unlocked in a browser STAYS unlocked; the old grant '
          'lives in their localStorage, not in the hash. To force everyone out, '
          'change the storage key bk_tape_export in docs/tape/index.html too.')


main()

#!/usr/bin/env python3
"""Step 1 — write a permanent name tag (playerId) onto every player record.

  python3 tools/pid-assign.py --dry     # report only, touches nothing
  python3 tools/pid-assign.py --apply   # write players.json + the shipped mirror

What it does:
  1. Canonicalises the two men who are in the database twice under different
     spellings (see tools/bkid.py CANONICAL), so each ends up as ONE person
     holding one record per league instead of two unrelated people.
  2. Writes `playerId` onto every record. The tag is DERIVED ONCE here and then
     stored; nothing should ever recompute it. Fixing a display name later must
     not move the tag, or the 883 question cards pointing at it break.
  3. Keeps the pre-existing spelling in `aka` when a name was canonicalised, so
     no information is lost and the old form stays searchable.
  4. Refuses to run if any question card's player tag would stop resolving.

Both copies of the database are written: docs/play/data/players.json (the
working copy) and docs/play/players.js (what the game actually loads). They must
never drift apart — the gate now checks that too.
"""
import json, os, re, sys, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bkid import slug, canonical_name, assign_player_ids, CANONICAL

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT, 'docs/play/data/players.json')
JS_PATH   = os.path.join(ROOT, 'docs/play/players.js')
BANK      = os.path.join(ROOT, 'docs/play/questions.js')

JS_HEADER = """/* Ball Knowledge — player database (runs 1-3: foundation + stats + depth).
   Generated + verifier-corrected; playbook in DEEPRESEARCH_KNOWLEDGE.md.
   %d players. Tiers drive pack rarity; career stats show on the cards and
   will feed player ratings. A player with NO stats genuinely has none —
   streetball and Black Fives Era box scores largely were never kept.

   Every record carries `playerId`, a PERMANENT name tag assigned by
   tools/pid-assign.py. It is stored, never recomputed: correcting a player's
   displayed name must not move their id, because question cards point at it.
   One person = one id = one record PER LEAGUE. */
"""


def load_players():
    raw = json.load(open(JSON_PATH))
    return raw if isinstance(raw, list) else raw.get('players', [])


def card_player_tags():
    s = open(BANK).read()
    tags = collections.Counter()
    for m in re.findall(r'\bp:\[([^\]]*)\]', s):
        for t in re.findall(r'"([^"]+)"', m):
            tags[t] += 1
    return tags


def main():
    dry = '--apply' not in sys.argv
    players = load_players()
    print(f"players on disk: {len(players)}")

    # --- 1. canonicalise the duplicated men -------------------------------
    renamed = []
    for p in players:
        canon = canonical_name(p['name'])
        if canon != p['name']:
            renamed.append((p['name'], canon, p.get('league')))
            aka = [a for a in (p.get('aka') or []) if a != canon]
            if p['name'] not in aka:
                aka.append(p['name'])
            p['aka'] = aka
            p['name'] = canon
    print(f"\ncanonicalised {len(renamed)} record(s) that spelled a name differently:")
    for old, new, lg in renamed:
        print(f"   {old!r} -> {new!r}   ({lg})")

    # --- 2. assign the tags ------------------------------------------------
    ids, report = assign_player_ids(players)
    for p, i in zip(players, ids):
        p['playerId'] = i

    print(f"\ndistinct people: {len(set(ids))}   records: {len(ids)}")
    print(f"people holding more than one league record: {len(report['shared'])}")
    for s in report['shared']:
        print(f"   {s['id']:26} {s['name']:26} {'+'.join(s['leagues'])}")
    if report['collisions']:
        print("\nDIFFERENT people who slug alike — suffixed so they stay separate:")
        for c in report['collisions']:
            print(f"   {c['base']}: {c['names']}")
    else:
        print("\nno collisions between different people")

    # --- 3. safety: every card's player tag must still resolve -------------
    # Canonicalising a name can move its tag (Goose Tatum -> reece-goose-tatum),
    # and a card may already point at the old one. Remap those card tags in the
    # SAME pass, so the two files are never out of step with each other. After
    # this initial assignment ids FREEZE — a later name fix must not move a tag,
    # it goes in `aka` instead.
    have = set(ids)
    remap = {}
    for old, new, _ in renamed:
        o, n = slug(old), slug(new)
        if o != n and n in have:
            remap[o] = n

    tags = card_player_tags()
    print(f"\nplayer tags used by question cards: {len(tags)} distinct, {sum(tags.values())} uses")
    moved = {t: n for t, n in tags.items() if t in remap}
    if moved:
        print("tags to remap (a canonicalised name moved its tag):")
        for t, n in sorted(moved.items()):
            print(f"   {t} -> {remap[t]}   ({n} card{'s' if n != 1 else ''})")

    broken = {t: n for t, n in tags.items() if t not in have and t not in remap}
    if broken:
        print("REFUSING TO WRITE — these card tags would stop resolving:")
        for t, n in sorted(broken.items()):
            print(f"   {t}  ({n} cards)")
        return 1
    print("every card player tag resolves (after remapping)")

    if dry:
        print("\n--dry: nothing written. Re-run with --apply to write.")
        return 0

    # --- 4. write BOTH copies ---------------------------------------------
    # key order: playerId first so a record reads identity-first
    ordered = []
    for p in players:
        o = {'playerId': p['playerId'], 'name': p['name']}
        if p.get('aka'): o['aka'] = p['aka']
        for k, v in p.items():
            if k not in o: o[k] = v
        ordered.append(o)

    json.dump(ordered, open(JSON_PATH, 'w'), ensure_ascii=False, indent=1)
    body = json.dumps(ordered, ensure_ascii=False, separators=(', ', ': '))
    open(JS_PATH, 'w').write((JS_HEADER % len(ordered)) + 'const PLAYERDB=' + body + ';\n')
    print(f"\nwrote {len(ordered)} records ->")
    print(f"   {JSON_PATH}")
    print(f"   {JS_PATH}")

    # rewrite the moved card tags — ONLY inside p:[...] arrays, never elsewhere
    if remap:
        s = open(BANK).read()
        def fix(m):
            inner = m.group(1)
            for old, new in remap.items():
                inner = re.sub(r'"%s"' % re.escape(old), '"%s"' % new, inner)
            return 'p:[' + inner + ']'
        s2 = re.sub(r'\bp:\[([^\]]*)\]', fix, s)
        if s2 != s:
            open(BANK, 'w').write(s2)
            print(f"   {BANK}  ({sum(moved.values())} card tag(s) remapped)")
    return 0


if __name__ == '__main__':
    sys.exit(main())

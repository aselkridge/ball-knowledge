#!/usr/bin/env python3
"""THE ONE PLACE name tags are made. Import this; never re-implement it.

A player's name tag is DERIVED ONCE from their name and then WRITTEN DOWN on the
record. It is never recalculated. That is the whole point: if we later fix how a
name is spelled, the tag does not move, so the 883 question cards pointing at it
keep working.

The rule below is not new — it is the convention tools/era-tag.py already used
when it wrote player tags onto the question bank, lifted here so exactly one
implementation exists. Measured against the shipped data before it was frozen:
all 332 tags in use resolve to a real player, and no two different people
collide.

It deliberately KEEPS quoted nicknames, because the shipped tags do:
    Nat 'Sweetwater' Clifton  ->  nat-sweetwater-clifton   (not nat-clifton)
Stripping them would break every card tagged the old way, and would also merge
people who must stay apart: Chuck Cooper and Charles 'Tarzan' Cooper are two
different men who both played in the same era.
"""
import re
import unicodedata

__all__ = ['slug', 'CANONICAL', 'canonical_name', 'assign_player_ids']


def slug(name):
    """A name -> its name tag. Accents folded, everything else to hyphens."""
    n = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')


# One man, two records, two spellings. The database held each of these twice and
# every name-keyed lookup counted them as two people — including the squad
# dealer, which could have put both copies of the same man on one team.
# Canonical spelling on the right. Full write-up in
# docs/play/data/known-duplicate-people.json.
CANONICAL = {
    'JJ Redick':   'J.J. Redick',
    'Goose Tatum': 'Reece "Goose" Tatum',
}


def canonical_name(name):
    return CANONICAL.get(name, name)


def assign_player_ids(players):
    """players: records carrying 'name' and 'league'.

    Returns (ids, report) where ids is a parallel list of name tags.

    Two records for the SAME person share one tag — that is correct and is how
    the people who played in more than one league already behave. Two DIFFERENT
    people who happen to slug alike get a numbered suffix, so a collision can
    never silently merge them into one person.
    """
    groups = {}
    for i, p in enumerate(players):
        groups.setdefault(slug(canonical_name(p['name'])), []).append(i)

    ids = [None] * len(players)
    report = {'shared': [], 'collisions': []}
    for base, idxs in sorted(groups.items()):
        names = sorted({canonical_name(players[i]['name']) for i in idxs})
        if len(names) == 1:
            for i in idxs:
                ids[i] = base
            if len(idxs) > 1:
                report['shared'].append({
                    'id': base, 'name': names[0],
                    'leagues': sorted(str(players[i].get('league')) for i in idxs)})
        else:
            for rank, nm in enumerate(names):
                tag = base if rank == 0 else f'{base}-{rank + 1}'
                for i in idxs:
                    if canonical_name(players[i]['name']) == nm:
                        ids[i] = tag
            report['collisions'].append({'base': base, 'names': names})
    return ids, report

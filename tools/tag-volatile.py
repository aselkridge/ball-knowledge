#!/usr/bin/env python3
"""V21: tag open-ended superlative cards as goes_stale. Aaron, 2026-08-04: "tag em all".

WHY IT IS A SCRIPT AND NOT A PASS. `goes_stale` is the only thing that puts a
card into volatile-questions.json and therefore into any refresh. 56 cards said
"who has the most X" with no year anchoring them and were tagged as permanent
truths, so nothing would ever have re-read them. A hand pass would fix today's
56 and miss the 57th written next week; this runs again.

THE ANCHOR TEST IS THE WHOLE RULE. A superlative with a year in it is a
historical statement and stays true forever -- "won a record 73 games in
2015-16" will read the same in 2050. A superlative with no year is a claim about
the present and expires the moment somebody beats it. The naive regex says 416
cards; the year filter says 56, and 56 is the honest number.

  python3 tools/tag-volatile.py            what would change, nothing written
  python3 tools/tag-volatile.py --apply    write it
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(ROOT, 'docs/play/data/tables/facts.json')

SUP = re.compile(r'\b(most|all-time|career leader|leader|youngest|oldest|'
                 r'winningest|holds the record|record for)\b', re.I)
YEAR = re.compile(r'\b(1[89]\d\d|20\d\d)\b|\b\d{4}[–-]\d{2}\b')
# A YEAR IS NOT THE ONLY ANCHOR, and the first version of this script believed it
# was. It tagged nine cards as volatile that cannot change, and the audit caught
# them because the playbook forbids volatile t:1 cards -- easy cards get asked
# most, so a stale easy card is the worst kind. Four of the nine were plainly
# closed claims:
#   "Who RETIRED with 11 championships as a head coach, the most ever?"
#   "...RETIRING as the NBA's career free-throw percentage leader"
#   "Lew Alcindor WAS NAMED MOP how many years in a row?"
#   "Which of these RETIRED big men averaged the most career blocks?"
# A claim about a finished career is finished. `retired`/`retiring` is the
# anchor V5 already used when it rewrote thirteen cards into that shape, so
# honouring it here is applying his rule, not inventing one.
CLOSED = re.compile(r'\b(retired|retiring|was named|finished (?:his|her) career|'
                    r'ended (?:his|her) career)\b', re.I)


def open_superlatives(facts):
    return [f for f in facts if SUP.search(f['question'])
            and not YEAR.search(f['question'])
            and not CLOSED.search(f['question'])]


def main():
    facts = json.load(open(F))
    hits = open_superlatives(facts)
    todo = [f for f in hits if not f.get('goes_stale')]
    # THE PLAYBOOK FORBIDS A VOLATILE t:1 CARD (backlog V5): easy cards get asked
    # most, so a stale easy card is the one people actually see. Tagging one is
    # therefore not a tagging decision, it is a decision about that CARD -- reword
    # it to an anchored claim, demote it, or accept it -- and that is Aaron's, not
    # this script's. They are held back and printed loudly rather than tagged
    # quietly or skipped silently.
    hold = [f for f in todo if f.get('difficulty') == 1]
    todo = [f for f in todo if f.get('difficulty') != 1]
    print(f'open superlatives (no year, no retirement anchor)  {len(hits)}')
    print(f'  already tagged goes_stale                       {len(hits) - len(todo) - len(hold)}')
    print(f'  would tag now                                   {len(todo)}')
    print(f'  HELD BACK, t:1 and would break the V5 rule       {len(hold)}\n')
    for f in todo[:60]:
        print('   ', f['question'][:96])
    if hold:
        print('\n  NEEDS A RULING -- each of these is an easy card making an open')
        print('  superlative claim. Reword to an anchored form, demote a tier, or')
        print('  accept it and raise the audit baseline:')
        for f in hold:
            print(f'    [{f["fact_id"]}]')
            print(f'      {f["question"][:92]}')
            print(f'      answer: {f["choices"][f["answer"]]}')
    if '--apply' not in sys.argv:
        print('\nDry run. Add --apply to write.')
        return
    for f in todo:
        f['goes_stale'] = True
    json.dump(facts, open(F, 'w'), indent=1)
    print(f'\nTagged {len(todo)}. Total goes_stale now '
          f'{sum(1 for f in facts if f.get("goes_stale"))}.')
    print('NOW RUN: tables-verify.py && tables-emit.py --apply && '
          'build-volatile-index.py && audit.py')


main()

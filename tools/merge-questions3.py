#!/usr/bin/env python3
"""Merge question run 3 (DB-stat trivia + corpus tail) into questions.js.

DRY RUN BY DEFAULT — writes nothing unless --apply is passed.

This run needed NO new research: every question was mined from players.json
(verified stats we already ship) or from unused run-1 corpus facts, and each
slice was adversarially verified inside the workflow (kills already dropped).
This script is the structural gate + deduper + answer shuffler:
  * schema gates: t 0-4, known league, 4 distinct options, question mark
  * verifier 'fixes' with a concrete field+value are applied
  * srcId dedupe within the run AND against the existing bank's src ids
  * exact-stem dedupe against the existing bank (same question text = drop)
  * seeded answer shuffle (c[0] arrives correct; 'a' records where it lands)

Deterministic (seeded): same inputs -> same bank.
"""
import json, re, sys, random, collections

REPO = '/workspace/ball-knowledge'
APPLY = '--apply' in sys.argv
random.seed(20260727)

run = json.load(open(f'{REPO}/docs/play/data/research-run3-questions.json'))

# ---- existing bank: parse the JS literal via node (it is not JSON) -------------
import subprocess
bank_json = subprocess.run(['node', '-e',
    "const s=require('fs').readFileSync('%s/docs/play/questions.js','utf8');"
    "eval(s.replace('const QUESTIONS','global.QUESTIONS'));"
    "console.log(JSON.stringify(QUESTIONS));" % REPO],
    capture_output=True, text=True, check=True).stdout
bank = json.loads(bank_json)
used_src = {q.get('src') for q in bank if q.get('src')}
used_stem = {re.sub(r'\s+', ' ', q['q']).strip().lower() for q in bank}

LEAGUES = {'any', 'nba', 'wnba', 'big3', 'college', 'world', 'negro', 'street'}
fixes = collections.defaultdict(list)
for f in run.get('fixes', []):
    if f.get('field') and f.get('correct') is not None:
        fixes[f['srcId']].append(f)

rep = collections.OrderedDict((k, 0) for k in
    ['admitted', 'fixes applied', 'dup srcId dropped', 'dup stem dropped',
     'rejected (bad schema)'])
rej_rows, seen_src = [], set()
added = []

for q in run['questions']:
    src = (q.get('srcId') or '').strip()
    # verifier fixes first — they may repair the very field the gates check
    for f in fixes.get(src, []):
        fld, val = f['field'], f['correct']
        if fld == 't':
            try: q['t'] = int(val); rep['fixes applied'] += 1
            except (TypeError, ValueError): pass
        elif fld == 'v':
            q['v'] = 1; rep['fixes applied'] += 1
        elif fld in ('q', 'l', 'cat'):
            q[fld] = str(val); rep['fixes applied'] += 1
        elif re.match(r'^c\[([123])\]$', str(fld)):   # a distractor swap (never c[0])
            q['c'][int(fld[2])] = str(val); rep['fixes applied'] += 1
    stem = re.sub(r'\s+', ' ', (q.get('q') or '')).strip()
    if (not src or not isinstance(q.get('t'), int) or not (0 <= q['t'] <= 4)
            or q.get('l') not in LEAGUES or not stem.endswith('?')
            or not isinstance(q.get('c'), list) or len(q['c']) != 4
            or len({str(x).strip() for x in q['c']}) != 4):
        rep['rejected (bad schema)'] += 1
        rej_rows.append((src or '(no srcId)', stem[:60])); continue
    if src in used_src or src in seen_src:
        rep['dup srcId dropped'] += 1; continue
    if stem.lower() in used_stem:
        rep['dup stem dropped'] += 1; continue

    correct = str(q['c'][0]).strip()
    opts = [str(x).strip() for x in q['c']]
    random.shuffle(opts)
    rec = {'t': q['t'], 'l': q['l'], 'cat': (q.get('cat') or 'stats'),
           'q': stem, 'c': opts, 'a': opts.index(correct)}
    if q.get('v'): rec['v'] = 1
    rec['src'] = src
    added.append(rec); seen_src.add(src); used_stem.add(stem.lower())
    rep['admitted'] += 1

print('QUESTION MERGE run 3 ' + ('(APPLIED)' if APPLY else '(DRY RUN — nothing written)'))
for k, v in rep.items(): print(f'  {k:26} {v}')
print()
newbank = bank + added
tiers = collections.Counter(q['t'] for q in newbank)
leagues = collections.Counter(q['l'] for q in added)
aspread = collections.Counter(q['a'] for q in newbank)
print('  admitted by league :', dict(leagues))
print('  bank tiers now     :', dict(sorted(tiers.items())))
print('  answer positions   :', dict(sorted(aspread.items())))
print('  bank size          :', len(bank), '->', len(newbank))
if rej_rows:
    print('\n  rejected:')
    for s, t in rej_rows[:8]: print(f'    {s[:32]:32} {t}')

if APPLY:
    def js(q):
        out = ['t:%d' % q['t'], 'l:%s' % json.dumps(q['l']),
               'cat:%s' % json.dumps(q['cat'], ensure_ascii=False),
               'q:%s' % json.dumps(q['q'], ensure_ascii=False),
               'c:%s' % json.dumps(q['c'], ensure_ascii=False),
               'a:%d' % q['a']]
        if q.get('v'): out.append('v:1')
        if q.get('src'): out.append('src:%s' % json.dumps(q['src']))
        return '  {' + ','.join(out) + '}'
    hdr = """/* Ball Knowledge — question bank v4 (research runs 1 + 2 + question-run 3)
   Question run 3 needed NO new research: mined from the verified player DB
   (players.json stats/accolades/numbers) + the unused tail of the run-1 corpus.
   t: 0 very easy (Casual) · 1 easy · 2 medium · 3 hard · 4 LEGENDARY
      t:0 questions are ALLOWED to hint at their own answer — that tier is for
      players who barely follow ball and just want to try. That is a feature.
   l: 'any' | 'nba' | 'wnba' | 'big3' | 'college' | 'world' | 'negro' | 'street'
   a: index of the correct answer — POSITIONS ARE SHUFFLED, never assume 0.
   v: 1 = volatile (can go stale — see the refresh loop in DEEPRESEARCH_KNOWLEDGE.md)
   src: id of the source fact (research-run{1,2}-*.json) or q3-* (player-DB mined) */
const QUESTIONS = [
"""
    body = ',\n'.join(js(q) for q in newbank)
    open(f'{REPO}/docs/play/questions.js', 'w').write(hdr + body + '\n];\n')
    print(f'\n  questions.js WRITTEN ({len(newbank)} questions)')
else:
    print('\n  (pass --apply to write)')

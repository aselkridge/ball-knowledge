#!/usr/bin/env python3
"""Assemble the fourteen-day-scope workflow's result from its journal.

usage: python3 tools/scope-assemble.py <journal.jsonl> <out.json>

The journal records each agent's start (with its label) and its result; the
workflow's own return value is the same six keys, so this rebuilds it even if
the tool result arrives truncated or the run is cut short. The output is
committed the moment it exists (AI-LEARNINGS 1.3ai).
"""
import collections, json, sys

labels, results = {}, {}
for ln in open(sys.argv[1]):
    try:
        e = json.loads(ln)
    except ValueError:
        continue
    if e.get('type') == 'started':
        labels[e['agentId']] = e['label']
    elif e.get('type') == 'result' and e.get('agentId') in labels:
        results[labels[e['agentId']]] = e['result']

out = {
    'throughput': results.get('measure:throughput'),
    'sizing': results.get('measure:sizing'),
    'bank': results.get('measure:bank'),
    'mechanics': results.get('measure:mechanics'),
    'composed': results.get('compose:scopes'),
}
judged = collections.OrderedDict()
for lab, r in results.items():
    if lab.startswith('judge:') and isinstance(r, dict):
        n = int(lab.rsplit(':', 1)[1])
        judged.setdefault(n, []).append(r)
out['judged'] = [{'scope': n, 'verdicts': v} for n, v in sorted(judged.items())]
json.dump(out, open(sys.argv[2], 'w'), indent=1, ensure_ascii=False)
missing = [k for k, v in out.items() if not v]
print('assembled; present:', [k for k, v in out.items() if v], 'missing:', missing,
      '| judges:', {n: len(v) for n, v in judged.items()})

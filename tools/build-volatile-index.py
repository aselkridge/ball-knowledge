#!/usr/bin/env python3
"""V4: generate docs/play/data/volatile-questions.json — the index the refresh
loop reads (DEEPRESEARCH_KNOWLEDGE.md, VOLATILE FACTS). Rerun after any merge
that adds or edits v:1 cards; the refresh pass (V6) walks this file only."""
import re, json, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(ROOT, 'docs/play/questions.js')).read()
cards = [c for c in re.findall(r'\{[^{}]*?\bt\s*:\s*\d.*?\}', s, re.S)
         if re.search(r'\bq\s*:', c) and re.search(r'\bv\s*:\s*1\b', c)]

def grab(c, pat):
    m = re.search(pat, c)
    return m.group(1) if m else None

out = {
    "note": "Index of every v:1 (volatile) card in questions.js. Built by "
            "tools/build-volatile-index.py — regenerate after any merge. The "
            "refresh loop (backlog V6) re-verifies ONLY these.",
    "built": None,  # stamped below so reruns are diffable
    "count": len(cards),
    "questions": [{
        "q": grab(c, r'\bq\s*:\s*"((?:[^"\\]|\\.)*)"'),
        # the bank stores SHUFFLED choices with the answer at index a — never c[0]
        "answer": (lambda ch, a: ch[int(a)] if ch and a is not None and int(a) < len(ch) else None)(
            re.findall(r'"((?:[^"\\]|\\.)*)"', (re.search(r'\bc\s*:\s*\[(.*?)\]', c, re.S) or [None] and re.search(r'\bc\s*:\s*\[(.*?)\]', c, re.S)).group(1)) if re.search(r'\bc\s*:\s*\[(.*?)\]', c, re.S) else [],
            grab(c, r'\ba\s*:\s*(\d)')),
        "choices": re.findall(r'"((?:[^"\\]|\\.)*)"', re.search(r'\bc\s*:\s*\[(.*?)\]', c, re.S).group(1)) if re.search(r'\bc\s*:\s*\[(.*?)\]', c, re.S) else [],
        "t": int(grab(c, r'\bt\s*:\s*(\d)') or 0),
        "l": grab(c, r'\bl\s*:\s*"(\w+)"'),
        "cat": grab(c, r'\bcat\s*:\s*"((?:[^"\\]|\\.)*)"'),
        "srcId": grab(c, r'src(?:Id)?\s*:\s*"([^"]+)"'),
    } for c in cards],
}
out["built"] = datetime.date.today().isoformat()
dst = os.path.join(ROOT, 'docs/play/data/volatile-questions.json')
json.dump(out, open(dst, 'w'), ensure_ascii=True, indent=1)
print(f"{len(cards)} volatile cards indexed -> {dst}")
t1 = sum(1 for q in out['questions'] if q['t'] == 1)
print(f"of which t:1 (rule violation, backlog V5): {t1}")

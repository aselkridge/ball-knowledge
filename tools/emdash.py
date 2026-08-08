#!/usr/bin/env python3
"""NO EM DASHES. ANYWHERE IN THE GAME. (Aaron, 2026-08-08 — a standing standard.)

    "please remove all em dashes throughout the game, EVERYWHERE!
     this is a standard of mine."

CLAUDE.md already carried half of this rule ("no em dashes in copy written for
friends"). He has now extended it to the whole product, so it stops being a
style note and becomes a gate: `--check` counts, `audit.py` ratchets it at 0,
and a new one cannot merge.

WHY THIS IS A SCRIPT AND NOT A SED. An em dash does four different jobs and each
one wants a different replacement:

    separator   "Casual — Rookie — Baller"        ->  ' · '   (the game's own device)
    apposition  "61 points vs Ohio — still a record" -> ', '
    definition  "one rule — everyone gets the same ten" -> ': '
    two sentences "He missed — the crowd went quiet"  -> '. ' + capital

Replacing all four with a comma produces comma splices; replacing all four with
a full stop chops phrases in half. So the rules below read what FOLLOWS the dash
and pick. Everything the rules are unsure about is printed by `--list` for a
human to look at, because the point of the standard is how the copy READS.

WHERE IT LOOKS, and the split matters:
  * hand-written UI copy  (game.js, daily.js, coach.js, install.js, index.html)
  * the DATA TABLES       (facts.json, person_*.json ...) — never the emitted
    questions.js / players.js, which are build output. Fixing the output would
    last exactly until the next `tables-emit.py` and then quietly come back.
  * code comments too, under --comments. "Throughout the game, EVERYWHERE" is
    what he said, and a comment is part of the game's source even if no player
    reads it.

todo.json is excluded on purpose: 2,231 of them, it is the internal work queue,
and no part of it is the product.

Usage:
    python3 tools/emdash.py --check      count what is left (exit 1 if any)
    python3 tools/emdash.py --list       every one, with context, for review
    python3 tools/emdash.py --fix        apply the rules to copy + data
    python3 tools/emdash.py --fix --comments   ... and to code comments too
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DASH = '—'

# hand-written copy the player reads. questions.js / players.js are OUTPUT and
# are deliberately absent: their source is docs/play/data/tables.
COPY = ['docs/play/game.js', 'docs/play/daily.js', 'docs/play/coach.js',
        'docs/play/install.js', 'docs/play/audio.js', 'docs/play/index.html',
        # THE SERVER TOO, and it was missed on the first sweep. The relay sends
        # four strings a player actually reads ("The bouncer checked the list
        # twice ..."), so "throughout the game" covers it and the first pass
        # simply did not look outside docs/play. Found on 2026-08-08 while
        # reading the same file for a different reason, which is the only
        # reason it was found at all.
        'server/index.js']
EMITTED = ['docs/play/questions.js', 'docs/play/players.js',
           'docs/play/data/players.json', 'docs/play/unverified-index.js',
           'docs/play/verified-index.js', 'docs/play/volatile-questions.json']
TABLES_DIR = 'docs/play/data/tables'
TABLES_SKIP = {'todo.json'}          # the work queue, not the product


def strip_comments(src, html=False):
    """What a PLAYER reads. Same definition audit.py already uses for
    ui_gendered, kept identical on purpose so the two metrics can never
    disagree about where the line is."""
    src = re.sub(r'/\*[\s\S]*?\*/', '', src)
    src = re.sub(r'(?m)^\s*//.*$', '', src)
    src = re.sub(r'<!--[\s\S]*?-->', '', src)
    return src


# ---------------------------------------------------------------- the rules --
REL = r'(who|which|that|whose|whom|where|when)\b'
CONJ = r'(and|but|so|or|then|yet|because|though|although|while|plus)\b'
# a clause that can stand alone: a subject-ish word followed by a verb-ish word
INDEP = re.compile(r'^(he|she|they|it|we|you|i|that|this|there|here|his|her|their|'
                   r'the|a|an|every|nobody|everyone|one)\s+\S+\s', re.I)
# a finite verb inside the first four words is the tell that a tail is a whole
# clause rather than a phrase hanging off the one before it
FINITE = re.compile(r'^(?:\S+\s+){0,3}(is|are|was|were|can|cannot|can\u2019t|can\'t|'
                    r'do|does|did|will|won\u2019t|won\'t|has|have|had|gets?|goes|'
                    r'takes?|beats?|costs?|means?|makes?|wins?|loses?|keeps?|'
                    r'never|always|only)\b', re.I)


def fix_text(t, soft=False):
    """Replace every em dash in one string. `soft` reports what it was unsure
    about rather than staying silent about it."""
    unsure = []
    if DASH not in t:
        return t, unsure

    def one(m):
        before, after = m.group(1), m.group(2)
        nxt = after.lstrip()
        low = nxt.lower()

        # 1 · SEPARATOR. A short label with no sentence punctuation is a list of
        #     parts, and this game already separates parts with a middot.
        if (len(t) <= 64 and not re.search(r'[.!?,;:]', t)
                and not re.match(r'^(a|an|the|it|he|she|they)\b', low)):
            return before + ' · ' + after

        # 2 · DEFINITION / RESTATEMENT. "one rule — everyone gets the same ten"
        if re.match(r'^(everyone|every|no |nothing|nobody|one |two |three |the only|'
                    r'pure |straight |first |last )', low):
            return before + ': ' + after

        # 3 · A TRAILING QUESTION IS ITS OWN SENTENCE. The bank is full of
        #     "... anchored the Spurs — who is he?" and "... lineage — which
        #     city got the team in 2002?". A comma there is limp and it is also
        #     wrong: that tail is a complete question. It needs a wh-word AND a
        #     verb right behind it, so "— the ABL, the ABA and the NBA?" (a
        #     list, not a clause) is left as an apposition.
        if t.rstrip().endswith('?') and re.match(
                r'^(who|which|what|whose|where|when|how|why)\s+\S+\s', low):
            return before.rstrip() + '. ' + nxt[0].upper() + nxt[1:]

        # 4 · RELATIVE OR CONJOINED CLAUSE. Always a comma; never a full stop,
        #     because "which" cannot open a statement.
        if re.match('^' + REL, low) or re.match('^' + CONJ, low):
            return before + ', ' + after

        # 5 · TWO INDEPENDENT CLAUSES -> two sentences. Only when what comes
        #     BEFORE also looks finished, otherwise a full stop truncates a
        #     phrase that was still going.
        #     A comma between two independent clauses is a splice, and this is
        #     the case that produced one on the first run: "Nothing fires until
        #     you hit Confirm, stray thumbs can't burn a possession." So the
        #     test is not a fixed list of pronouns, it is whether a FINITE VERB
        #     shows up in the first few words of the tail.
        #     INDEP alone is NOT enough and was removed after it fired on
        #     "— the ABL, the ABA and the NBA?" and split a LIST off its own
        #     question. "the X Y" is a noun phrase; only a verb makes a clause.
        if FINITE.match(nxt) and len(before.strip()) > 18 \
                and re.search(r'\w[.)\]"\']?$', before.strip()):
            return before.rstrip() + '. ' + nxt[0].upper() + nxt[1:]

        # 5 · DEFAULT: apposition, which a comma carries.
        if soft:
            unsure.append(t.strip()[:110])
        return before + ', ' + after

    # ONE DASH AT A TIME, left to right, re-reading the string each pass. A
    # single global re.sub cannot do this: rule 1 asks about the length and
    # punctuation of the WHOLE string, and that string changes as earlier
    # dashes are replaced.
    # NO FIXED ITERATION CAP. It was 12, and the Rulebook is a single 30,000
    # character line carrying 31 of them, so twelve left nineteen behind and the
    # count did not explain why. Loop until clean, with a bound only as a
    # runaway guard.
    out = t
    for _ in range(500):
        if DASH not in out:
            break
        out = re.sub(r'([^' + DASH + r']*?)\s*' + DASH + r'\s*(.*)$',
                     lambda m: one(m), out, count=1)
    out = re.sub(r'\s+([,.:])', r'\1', out)
    out = re.sub(r',\s*,', ',', out)
    return out, unsure


# ------------------------------------------------------------------ walking --
def each_string_in(obj, path=()):
    if isinstance(obj, str):
        yield path, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from each_string_in(v, path + (k,))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from each_string_in(v, path + (i,))


def map_strings(obj, fn):
    if isinstance(obj, str):
        return fn(obj)
    if isinstance(obj, dict):
        return {k: map_strings(v, fn) for k, v in obj.items()}
    if isinstance(obj, list):
        return [map_strings(v, fn) for v in obj]
    return obj


def table_files():
    return [p for p in sorted(glob.glob(os.path.join(ROOT, TABLES_DIR, '*.json')))
            if os.path.basename(p) not in TABLES_SKIP]


def count():
    """(copy, data, comments) — the three numbers, never one blended total."""
    copy = data = comments = 0
    for f in COPY:
        src = open(os.path.join(ROOT, f), encoding='utf-8').read()
        vis = strip_comments(src)
        copy += vis.count(DASH)
        comments += src.count(DASH) - vis.count(DASH)
    for f in EMITTED:
        p = os.path.join(ROOT, f)
        if os.path.exists(p):
            copy += strip_comments(open(p, encoding='utf-8').read()).count(DASH)
    for p in table_files():
        data += open(p, encoding='utf-8').read().count('\\u2014') + \
                open(p, encoding='utf-8').read().count(DASH)
    return copy, data, comments


def listing():
    rows = []
    for f in COPY:
        vis = strip_comments(open(os.path.join(ROOT, f), encoding='utf-8').read())
        for line in vis.split('\n'):
            if DASH in line:
                rows.append((f, line.strip()[:150]))
    for p in table_files():
        d = json.load(open(p, encoding='utf-8'))
        for path, s in each_string_in(d):
            if DASH in s:
                rows.append((os.path.basename(p) + ':' + '.'.join(str(x) for x in path[-2:]),
                             s[:150]))
    return rows


def fix(do_comments):
    changed = []
    for f in COPY:
        p = os.path.join(ROOT, f)
        src = open(p, encoding='utf-8').read()
        if DASH not in src:
            continue
        js = f.endswith('.js')
        if do_comments:
            # line-scoped over EVERYTHING, comments included. Still line-scoped,
            # because the reflow bug had nothing to do with which parts were in
            # scope and everything to do with matching across newlines.
            new = _fix_lines(src, js=False)
        else:
            # rebuild only the non-comment parts, leaving comments byte-identical
            new = _fix_outside_comments(src, js=js)
        if new != src:
            open(p, 'w', encoding='utf-8').write(new)
            changed.append((f, src.count(DASH) - new.count(DASH)))
    for p in table_files():
        d = json.load(open(p, encoding='utf-8'))
        raw = json.dumps(d, ensure_ascii=False)
        if DASH not in raw:
            continue
        d2 = map_strings(d, lambda s: fix_text(s)[0])
        if d2 != d:
            json.dump(d2, open(p, 'w', encoding='utf-8'),
                      ensure_ascii=False, indent=1)
            open(p, 'a', encoding='utf-8').write('\n')
            changed.append((os.path.relpath(p, ROOT),
                            raw.count(DASH) - json.dumps(d2, ensure_ascii=False).count(DASH)))
    return changed


COMMENT_RE = re.compile(r'(/\*[\s\S]*?\*/|^[ \t]*//.*$|<!--[\s\S]*?-->)', re.M)
STR_RE = re.compile(r"'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"|`(?:\\.|[^`\\])*?`")


def _fix_outside_comments(src, js=True):
    """LINE-SCOPED, AND IN JS ALSO QUOTE-SCOPED. Both constraints are scar
    tissue from the first version, which ran the rules over whole multi-line
    SEGMENTS of source between comments.

    That regex could not match a tail containing a newline, so the engine slid
    forward to the LAST dash in the segment, made `before` everything above it,
    and let `\s*` swallow the newline and indentation in between. Result: it
    replaced almost nothing and silently reflowed the file, joining pairs of
    source lines together. Nothing was deleted (coach.js and daily.js came back
    with a non-whitespace delta of exactly 0, which is how that was established
    rather than assumed) but it was still a rewrite nobody asked for.

    Working one LINE at a time makes joining structurally impossible, and in
    JavaScript working only inside string literals means the rules can never
    touch an operator, a regex or a key."""
    out, last = [], 0
    for m in COMMENT_RE.finditer(src):
        out.append(_fix_lines(src[last:m.start()], js))
        out.append(m.group(0))
        last = m.end()
    out.append(_fix_lines(src[last:], js))
    return ''.join(out)


def _fix_lines(seg, js):
    if DASH not in seg:
        return seg
    lines = seg.split('\n')
    for i, line in enumerate(lines):
        if DASH not in line:
            continue
        if js:
            lines[i] = STR_RE.sub(
                lambda m: (m.group(0)[0] + fix_text(m.group(0)[1:-1])[0] + m.group(0)[-1])
                if DASH in m.group(0) else m.group(0), line)
        else:
            # HTML: text nodes AND attributes are both read by a player, and a
            # dash never appears in a tag name, so the whole line is fair game
            lines[i] = fix_text(line)[0]
    return '\n'.join(lines)


if __name__ == '__main__':
    a = sys.argv[1:]
    if '--list' in a:
        for where, line in listing():
            print(f'{where:34} {line}')
        sys.exit(0)
    if '--fix' in a:
        for f, n in fix('--comments' in a):
            print(f'  {f:44} -{n}')
        print()
    c, d, k = count()
    print(f'  player-facing copy   {c}')
    print(f'  data tables          {d}')
    print(f'  code comments        {k}')
    print('\n  ' + ('CLEAN' if c + d == 0 else 'NOT CLEAN: %d left in the product'
                    % (c + d)))
    sys.exit(0 if c + d == 0 else 1)

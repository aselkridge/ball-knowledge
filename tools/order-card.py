#!/usr/bin/env python3
"""Publish THE ORDER, TWO TRACKS as a referenceable page.

    python3 tools/order-card.py <out.html>

Why this exists
---------------
Aaron, 2026-08-07: *"Can you put those tracks in an artifact please so it's
referenceable lol."*

**This is a VIEW, not a plan.** The plan is `V0.md` -> THE ORDER, TWO TRACKS,
and today taught the reason that distinction matters: asked to order the launch
work, I ordered a different file and left two competing plans in the repo. So
this is a script rather than a hand-written page. When V0 changes, the rows
below change and the page is rebuilt, instead of quietly drifting from the file
it is supposed to be showing.

The look is not invented either. CLAUDE.md's third option: before drawing
anything, check whether the game already does it. Every colour below is copied
verbatim out of `docs/play/index.html` :root, and all four faces are the game's
own woff2 files inlined from `docs/play/assets/fonts/`. Two tracks are drawn as
HOME orange and AWAY blue because the game already has a home team and an away
team, and reusing that beats inventing a second colour language.
"""

import base64
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONTS = ROOT / 'docs/play/assets/fonts'
DATE = '7 AUGUST 2026'

# --- the arithmetic that sets the order (tools/gate-blockers.py, 08-07) -------
SCORE = [
    ('317', 'DEALABLE NOW'),
    ('1000', 'THE GATE'),
    ('607', 'VERIFY CEILING'),
    ('393', 'MUST BE NEW'),
]
SCORE_NOTE = ('Verifying every readable card lands at 607. Verification is the '
              'road to 607, not to 1,000, so writing new cards starts at A5 '
              'and not at the end.')

NEXT = [
    ('a', 'YOUR NEXT MOVE',
     'Paste <code>design/V29B-brief.md</code> into /deep-research, and rule on the '
     'slang cards. Two things, one sitting.'),
    ('b', 'MY NEXT MOVE',
     'B3, the invite link, and retiring the access code. The last thing standing '
     'between a friend tapping your link and actually playing.'),
]

# --- TRACK A · data -----------------------------------------------------------
A = [
    ('A1', 'V29 Run B, the licensing read', 'aaron', '',
     'Your own sequencing call: do not spend weeks gathering only to find we '
     'cannot use it. Costs one paste, then runs while everything below happens.'),
    ('A2', 'The slang ruling', 'aaron', '',
     'About 20 vocabulary cards may have no Tier 1 source anywhere on earth. '
     'One sentence from you, and it sets the precedent for a whole class.'),
    ('A3', 'The era lookup pass', 'claude', '',
     '321 facts carry no era tag, 43 of them dealable. The rule was settled in '
     'July, so this is tagging, not research, and no research is needed.'),
    ('A4', '90 cards, one more publisher each', 'claude', '',
     'Best cards-per-hour on the board. Every one already has a real source; '
     'the job is finding a second publisher, not starting from nothing.'),
    ('A5', 'Write the pre-1980 cards', 'claude', 'both halves of gate 1',
     'The only item that adds cards AND fills the six thin eras at once. The '
     'season spine already holds 609 facts and exactly one has been used.'),
    ('A6', 'Mine the 158 pages we already trust', 'claude', 'waits on A1',
     'Cheapest new cards that exist: page found, tier ruled, bytes cached, only '
     'the extraction left. Held back because it is what A1 is about.'),
    ('A7', '198 Wikipedia-only cards', 'claude', '',
     'Follow the footnote and cite what it cites. The biggest single block, and '
     'honest work rather than clever work.'),
    ('A8', 'Link checker, multi-league emit, l:any', 'claude', '',
     'Mechanical multipliers. Everything above assumes links resolve, and two '
     'cards already rested on a typo nothing caught.'),
    ('A9', 'The 55 twin pairs, and second sources', 'claude', '',
     'A pool with twins in it is smaller than it counts itself as, and the gate '
     'is a count. Pool honesty, not pool growth.'),
    ('A10', '37 weak-tier, then 317 with no URL', 'claude', '',
     'Last on purpose: the 317 are a finding job rather than a reading one, and '
     'the most expensive card on the board.'),
    ('A11', 'Attested claims for Before the W', 'claude', '',
     'Pre-1997 women’s basketball is thinly documented by design. Needed '
     'before those cards can merge. The Black Fives half is post-launch.'),
    ('A12', 'Reword the stale-able, and the upkeep', 'claude', '',
     'The good kind of work: an anchored fact never needs re-reading, so this '
     'deletes future work instead of doing it faster.'),
]

# --- TRACK B · build ----------------------------------------------------------
B = [
    ('B1', 'Merge the Daily Five', 'done', 'done',
     'Already on main when I wrote this row, and I had not checked. It merged '
     'with the rest of the branch earlier the same day.'),
    ('B2', 'Add to home screen', 'done', 'done 7 aug',
     'Manifest, the iOS meta tags Safari needs instead of it, a maskable icon '
     'built for the launcher mask, and an icon shortcut into the Daily Five.'),
    ('B3', 'An invite link that works, kill the access code', 'claude',
     'biggest drop-off risk',
     'Twenty people who owe you nothing will not fight an access code. Every '
     'hour above this improves a game some of them never reach.'),
    ('B4', 'Sleeping server, and the wake lock', 'claude', '',
     'Both are "the game appeared broken" bugs. A cold server on first tap '
     'loses a tester for good; a sleeping screen ends the session.'),
    ('B5', 'The playthrough defects, worst first', 'claude', 'you found these',
     'The coach card covering the board, drills allowing off-drill moves, the '
     'rulebook items. Broken things in shipped features beat new features.'),
    ('B6', 'In-game feedback button', 'claude', '',
     'The entire point of the twenty is feedback. Without it, it happens in a '
     'group chat, out of context, or not at all.'),
    ('B7', 'Cards remember you, and play logging', 'claude', '',
     'Progression is the second-play reason, and logging is how you find out '
     'what actually happened across those twenty games.'),
    ('B8', 'Quick Run', 'claude', '',
     'A game to 11 is the barrier you named yourself. A four-minute mode is the '
     'answer and it costs far less than the alternatives.'),
    ('B9', 'The heat sound', 'claude', 'one third of a shipped feature',
     'V0 asked for popup, sound and readout. Two landed. heatCard() plays '
     'nothing and there is no heat cue in audio.js.'),
    ('B10', 'Did-you-know blurbs in the Daily Five', 'claude', 'database half done',
     'The note column ships, the emitter carries it, the audit guards it. Only '
     'the display is left, and the notes get written for free during Track A.'),
    ('B11', 'Name tags, lazy questions, CPU-vs-CPU test', 'claude', '',
     'Polish and the safety net. The CPU-vs-CPU test is the one that catches '
     'what twenty humans would otherwise find for you.'),
    ('B12', 'Player skills, couch mode, chat, trash talk', 'claude', 'your call, kept',
     'The four you pulled forward and kept after seeing the cost. Last because '
     'they are the biggest, not because they are optional.'),
]

DESK = ('Also yours, a sentence each: the three unplaceable sites, the five open '
        'superlative claims, one rules card. Plus two clicks nobody else can do '
        'for you: branch protection on main, and deleting the three stale branches.')

OUT_OF_SCOPE = [
    ('Everything outside NBA and WNBA', 'college, BIG3, streetball, overseas, '
     'Flags, Early Black Basketball stay in the tables and out of the packs'),
    ('The Black Fives letter and the H3 run', 'your own NOT-in-V0 list'),
    ('The census, the Tape’s third tab, duel ratings',
     'real work, wrong side of the launch'),
    ('The Daily Five leaderboard', '"Leaderboard is long term vision"'),
    ('Streak rewards', 'all four accepted, all four post-launch'),
    ('Drills as tutorial, scoreboard redesign, hype sheet v2', 'later'),
]


def font(name):
    return base64.b64encode((FONTS / name).read_bytes()).decode()


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def rows(items, side):
    out = []
    for rid, title, who, tag, why in items:
        # <code> is written literally in a couple of reasons, so unescape it back
        w = esc(why).replace('&lt;code&gt;', '<code>').replace('&lt;/code&gt;', '</code>')
        t = (f'<span class="tag">{esc(tag)}</span>' if tag else '')
        out.append(
            f'<li class="row {side}">'
            f'<span class="rid">{rid}</span>'
            f'<div class="rbody">'
            f'<h3>{esc(title)}{t}</h3>'
            f'<p>{w}</p></div>'
            f'<span class="who w-{who}">'
            f'{ {"aaron": "YOU", "claude": "ME", "done": "DONE"}[who] }</span>'
            f'</li>')
    return '\n'.join(out)


PAGE = """<title>Two Tracks to the Twenty</title>
<style>
/* FACES AND COLOURS ARE THE GAME'S OWN, copied so the two move together.
   Palette lifted verbatim from docs/play/index.html :root (accent #f5872e,
   ground #100d0b, the away blue #58a8d6). Fonts are the same four woff2 files
   the game loads. If the game is ever retuned, retune this in the same commit. */
@font-face{font-family:'Anton';src:url(data:font/woff2;base64,__ANTON__) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Archivo';src:url(data:font/woff2;base64,__ARCHIVO__) format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:'SpaceMono';src:url(data:font/woff2;base64,__MONO4__) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'SpaceMono';src:url(data:font/woff2;base64,__MONO7__) format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'DSEG7';src:url(data:font/woff2;base64,__DSEG__) format('woff2');font-weight:700;font-display:swap}

/* LIGHT is the bare :root, per the three-state rule: no data-theme stamp and a
   light OS must still resolve to a complete palette. */
:root{
  --ground:#f4efe6;--panel:#fffdf8;--panel2:#ece4d6;--line:#d9cdb9;
  --ink:#17120f;--ink-dim:#5b5044;--ink-faint:#8b8073;
  --accent:#b8560f;--away:#1f6288;
  --ok:#3f7d43;--warn:#a3761b;
  --mono:'SpaceMono',ui-monospace,Menlo,Consolas,monospace;
  --sans:'Archivo',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --display:'Anton','Archivo',system-ui,sans-serif;
  --shadow:0 1px 0 rgba(23,18,15,.05);
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --ground:#100d0b;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
    --ink:#efe6d8;--ink-dim:#b3a894;--ink-faint:#7d735f;
    --accent:#f5872e;--away:#58a8d6;--ok:#6fbf73;--warn:#e8b84b;
    --shadow:0 1px 0 rgba(0,0,0,.4);
  }
}
:root[data-theme="dark"]{
  --ground:#100d0b;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
  --ink:#efe6d8;--ink-dim:#b3a894;--ink-faint:#7d735f;
  --accent:#f5872e;--away:#58a8d6;--ok:#6fbf73;--warn:#e8b84b;
  --shadow:0 1px 0 rgba(0,0,0,.4);
}

*{box-sizing:border-box}
body{
  margin:0;background:var(--ground);color:var(--ink);
  font-family:var(--sans);font-weight:600;line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
.wrap{max-width:1180px;margin:0 auto;padding:clamp(20px,4vw,52px) clamp(16px,4vw,32px) 72px}

/* masthead */
.eyebrow{
  font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:var(--ink-faint);display:block;margin-bottom:10px
}
h1{
  font-family:var(--display);font-weight:400;letter-spacing:.02em;
  font-size:clamp(38px,8.5vw,74px);line-height:.94;margin:0;text-wrap:balance;
}
h1 em{font-style:normal;color:var(--accent)}
.dek{
  margin:14px 0 0;max-width:62ch;color:var(--ink-dim);font-weight:600;
  font-size:clamp(15px,1.6vw,17px)
}
.dek b{color:var(--ink)}

/* the scoreboard: DSEG7 because it is the counter already in the game */
.score{
  display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);
  border:1px solid var(--line);border-radius:3px;overflow:hidden;margin:30px 0 12px
}
.tile{background:var(--panel);padding:16px 14px 13px;text-align:center}
.tile .n{
  font-family:'DSEG7',var(--mono);font-weight:700;color:var(--accent);
  font-size:clamp(24px,4.6vw,40px);line-height:1;font-variant-numeric:tabular-nums;
  display:block
}
.tile .l{
  display:block;margin-top:9px;font-family:var(--mono);font-size:9.5px;
  font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-faint)
}
.score-note{
  margin:0 0 34px;font-size:14px;color:var(--ink-dim);max-width:70ch;
  border-left:2px solid var(--accent);padding-left:12px
}

/* next move */
.next{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:38px}
.nx{
  background:var(--panel);border:1px solid var(--line);border-radius:3px;
  padding:16px 18px;box-shadow:var(--shadow);border-top:3px solid var(--accent)
}
.nx.b{border-top-color:var(--away)}
.nx h2{
  font-family:var(--mono);font-size:10.5px;font-weight:700;letter-spacing:.15em;
  text-transform:uppercase;color:var(--ink-faint);margin:0 0 8px
}
.nx p{margin:0;font-size:15px;color:var(--ink)}
code{
  font-family:var(--mono);font-size:.88em;background:var(--panel2);
  padding:1px 5px;border-radius:2px;color:var(--accent)
}

/* the two tracks, side by side because that IS the point */
.tracks{display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2.4vw,30px)}
.track{min-width:0}
.thead{
  display:flex;align-items:baseline;gap:10px;padding-bottom:10px;
  border-bottom:3px solid var(--accent);margin-bottom:2px
}
.track.b .thead{border-bottom-color:var(--away)}
.thead h2{
  font-family:var(--display);font-weight:400;font-size:clamp(22px,3.4vw,31px);
  letter-spacing:.02em;margin:0;line-height:1
}
.thead .sub{
  font-family:var(--mono);font-size:10.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink-faint)
}
ol.list{list-style:none;margin:0;padding:0}
.row{
  display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:start;
  padding:15px 4px 15px 0;border-bottom:1px solid var(--line)
}
.rid{
  font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.04em;
  color:var(--accent);padding-top:2px;font-variant-numeric:tabular-nums
}
.row.b .rid{color:var(--away)}
.rbody{min-width:0}
.rbody h3{
  margin:0 0 4px;font-size:15.5px;font-weight:600;line-height:1.3;color:var(--ink);
  text-wrap:balance
}
.rbody p{margin:0;font-size:13.5px;color:var(--ink-dim);line-height:1.5}
.tag{
  display:inline-block;margin-left:8px;font-family:var(--mono);font-size:9.5px;
  font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--warn);
  border:1px solid currentColor;border-radius:2px;padding:1px 5px;
  vertical-align:2px;white-space:nowrap
}
.who{
  font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.11em;
  border-radius:2px;padding:3px 6px;white-space:nowrap;margin-top:2px
}
.w-aaron{background:var(--accent);color:var(--ground)}
.w-claude{color:var(--ink-faint);border:1px solid var(--line)}
.w-done{background:var(--ok);color:var(--ground)}
.row:has(.w-done) .rbody h3{text-decoration:line-through;text-decoration-thickness:1px;
  text-decoration-color:var(--ink-faint);color:var(--ink-dim)}
.row:has(.w-done) .tag{color:var(--ok)}

.desk{
  margin:26px 0 0;background:var(--panel2);border:1px solid var(--line);
  border-radius:3px;padding:14px 16px;font-size:13.5px;color:var(--ink-dim)
}
.desk b{color:var(--ink)}

/* what is deliberately not here */
.out{margin-top:48px;border-top:1px solid var(--line);padding-top:26px}
.out h2{
  font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.15em;
  text-transform:uppercase;color:var(--ink-faint);margin:0 0 4px
}
.out .lede{margin:0 0 16px;font-size:13.5px;color:var(--ink-dim);max-width:66ch}
.out ul{list-style:none;margin:0;padding:0;display:grid;
  grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}
.out li{
  font-size:13.5px;color:var(--ink-dim);border-left:2px solid var(--line);
  padding-left:11px
}
.out li b{display:block;color:var(--ink);font-size:14px;margin-bottom:1px}

footer{
  margin-top:42px;padding-top:18px;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:11px;color:var(--ink-faint);line-height:1.7
}
footer b{color:var(--ink-dim)}

@media (max-width:820px){
  .tracks,.next{grid-template-columns:1fr}
  .score{grid-template-columns:repeat(2,1fr)}
  .track.b{margin-top:34px}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="wrap">
  <span class="eyebrow">Ball Knowledge &middot; the order &middot; __DATE__</span>
  <h1>Two tracks<br>to the <em>twenty</em></h1>
  <p class="dek">Everything left before the game goes to the twenty friends,
  in the order it should be done. <b>Two tracks, not one list</b>, because the
  build runs alongside the research rather than after it. Do the top open item
  on each. The plan itself lives in <code>V0.md</code> and this page is a view of it.</p>

  <div class="score">__SCORE__</div>
  <p class="score-note">__SCORENOTE__</p>

  <div class="next">__NEXT__</div>

  <div class="tracks">
    <section class="track a">
      <div class="thead"><h2>Track A</h2><span class="sub">Data &middot; to 1,000 diverse cards</span></div>
      <ol class="list">__ROWSA__</ol>
    </section>
    <section class="track b">
      <div class="thead"><h2>Track B</h2><span class="sub">Build &middot; the 27 items</span></div>
      <ol class="list">__ROWSB__</ol>
    </section>
  </div>

  <p class="desk">__DESK__</p>

  <div class="out">
    <h2>Not on either track, on purpose</h2>
    <p class="lede">Recorded so it cannot creep back in as "surely this is launch
    work". All of it is real, and all of it is the wrong side of the launch.</p>
    <ul>__OUT__</ul>
  </div>

  <footer>
    Source of truth: <b>V0.md &rarr; THE ORDER, TWO TRACKS</b>. Numbers measured
    __DATE__ with <b>tools/gate-blockers.py</b> and <b>tools/diversity.py</b>.<br>
    Regenerate with <b>python3 tools/order-card.py &lt;out.html&gt;</b> &mdash; this is a
    view, so it is rebuilt rather than edited.
  </footer>
</div>
"""


def main():
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'order.html')
    s = PAGE
    s = s.replace('__SCORE__', ''.join(
        f'<div class="tile"><span class="n">{n}</span><span class="l">{l}</span></div>'
        for n, l in SCORE))
    s = s.replace('__SCORENOTE__', SCORE_NOTE)
    s = s.replace('__NEXT__', ''.join(
        f'<div class="nx {side}"><h2>{h}</h2><p>{p}</p></div>' for side, h, p in NEXT))
    s = s.replace('__ROWSA__', rows(A, 'a'))
    s = s.replace('__ROWSB__', rows(B, 'b'))
    s = s.replace('__DESK__', DESK)
    s = s.replace('__OUT__', ''.join(
        f'<li><b>{esc(t)}</b>{esc(d)}</li>' for t, d in OUT_OF_SCOPE))
    s = s.replace('__DATE__', DATE)
    for tok, fname in [('__ANTON__', 'anton-400.woff2'),
                       ('__ARCHIVO__', 'archivo-600.woff2'),
                       ('__MONO4__', 'spacemono-400.woff2'),
                       ('__MONO7__', 'spacemono-700.woff2'),
                       ('__DSEG__', 'dseg7-700.woff2')]:
        s = s.replace(tok, font(fname))

    # A placeholder that survives into the output is a silent font fallback, and
    # a silent font fallback is exactly the bug the design rules warn about.
    left = re.findall(r'__[A-Z0-9]+__', s)
    if left:
        sys.exit(f'unreplaced placeholders: {sorted(set(left))}')
    a_ids = re.findall(r'class="rid">(A\d+)<', s)
    b_ids = re.findall(r'class="rid">(B\d+)<', s)
    if len(a_ids) != len(A) or len(b_ids) != len(B):
        sys.exit(f'row count mismatch: {len(a_ids)}/{len(A)} A, {len(b_ids)}/{len(B)} B')

    out.write_text(s, encoding='utf-8')
    print(f'{out}  {len(s)/1024:.0f}KB  ·  {len(a_ids)} Track A rows, '
          f'{len(b_ids)} Track B rows')


if __name__ == '__main__':
    main()

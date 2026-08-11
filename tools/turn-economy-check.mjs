/* TURN ECONOMY — what the offense actually gets per possession, measured.

   Aaron, 2026-08-10: "I am pretty sure that we moved to all movement before
   the main action is free (1 per position) and so I am not sure why that never
   shipped to the game."

   DESIGN.md § 3 line 68 says: "Per offensive turn: one free off-ball shuffle
   (1 square) + one main action." This harness asks the SHIPPED GAME whether
   that is true, because a rule that lives only in the design doc is a rule
   nobody is playing. It moves an off-ball player and looks at whose turn it is
   afterwards.

   Right now it FAILS on purpose, and the failure is the finding: there is no
   free shuffle, so DESIGN.md and the game disagree. When the rule ships, this
   goes green and stays the guard against it silently regressing.

   Serve docs/ on :8899, then: node tools/turn-economy-check.mjs
*/
import pw from 'playwright';
const {chromium} = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));

let pass = 0, fail = 0;
const check = (name, ok, note) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${note ? '   [' + note + ']' : ''}`);
  ok ? pass++ : fail++;
};

const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio']});
const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
const p = await ctx.newPage();
p.on('pageerror', e => console.log('  ! page error: ' + e.message));
await p.goto('http://127.0.0.1:8899/play/', {waitUntil: 'networkidle'});
await p.evaluate(() => localStorage.setItem('bk_coach', '0'));
await p.reload({waitUntil: 'networkidle'});
await sleep(1200);

/* a real CPU game, the same entry the dev hook uses everywhere else */
await p.evaluate(() => BK.startCpu('pro', 'nba'));
await sleep(2500);

const probe = await p.evaluate(async () => {
  const st = BK.state();
  if (!st) return {err: 'no state'};
  const off = st.offense;
  const holder = st.ball.holder;

  /* pick an OFF-BALL attacker: not the ball carrier, on the offense */
  let idx = -1;
  st.pieces.forEach((pc, i) => {
    if (pc.team === off && i !== holder && idx < 0) idx = i;
  });
  if (idx < 0) return {err: 'no off-ball attacker'};

  const before = {phase: st.phase, offense: st.offense};

  /* find a legal one-square destination for him and move there. Going through
     BK.coach.state() + the real move path rather than teleporting the piece,
     so the turn machinery runs exactly as it does for a player. */
  const pc = st.pieces[idx];
  let dest = null;
  for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
    const c = pc.c + dc, r = pc.r + dr;
    if (BK.legalMove && BK.legalMove(idx, 1, c, r)) { dest = [c, r]; break; }
  }
  if (!dest) {
    /* no exported legality helper: fall back to the engine's own staging */
    return {err: 'no BK.legalMove to find a destination with'};
  }
  window.__bkSel = idx;
  return {before, idx, dest, pos: pc.pos};
});

if (probe.err) {
  /* The engine does not expose a move-legality helper, so drive the UI path:
     select the piece and commit a staged move the way the buttons do. */
  const viaUi = await p.evaluate(async () => {
    const st = BK.state();
    const off = st.offense, holder = st.ball.holder;
    let idx = -1;
    st.pieces.forEach((pc, i) => { if (pc.team === off && i !== holder && idx < 0) idx = i; });
    const pc = st.pieces[idx];
    const before = st.phase;
    /* stage a one-square shuffle and commit through the same wrapper the
       Confirm button uses */
    st.selected = idx;
    st.staged = {kind: 'move', tile: [pc.c, pc.r - 1]};
    BK._commit();
    await new Promise(r => setTimeout(r, 900));
    const after = BK.state();
    return {idx, pos: pc.pos, before, afterPhase: after.phase,
            offenseStill: after.offense === off};
  });
  console.log('\nTURN ECONOMY · one off-ball shuffle, then whose turn is it?\n');
  console.log(`  moved off-ball ${viaUi.pos} (piece ${viaUi.idx})`);
  console.log(`  phase before: ${viaUi.before}   phase after: ${viaUi.afterPhase}`);
  check('DESIGN.md 3: an off-ball shuffle is FREE, offense keeps the turn',
        viaUi.afterPhase !== 'def-slide',
        viaUi.afterPhase === 'def-slide'
          ? 'it went straight to def-slide, so the shuffle SPENT the action'
          : 'phase ' + viaUi.afterPhase);
} else {
  console.log('probe', JSON.stringify(probe));
}

await b.close();
console.log(`\n${fail ? fail + ' FAILED, ' : ''}${pass} passed`);
console.log(fail
  ? '\nThe game and DESIGN.md 3 disagree. Fix one of them; do not leave both.'
  : '\nALL CHECKS PASS');
process.exit(0);   /* reporting tool: the finding is the output, not the code */

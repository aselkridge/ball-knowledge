/* TURN ECONOMY — what the offense actually gets per possession, measured.

   HISTORY: this harness was born failing on purpose. DESIGN.md § 3 promised
   "one free off-ball shuffle (1 square) + one main action" and the shipped
   game gave no free shuffle, so the one check here proved the doc and the
   game disagreed (V0 D32). On 2026-08-11 Aaron ruled "Design free off ball
   movement please" and the rule shipped, so this file flipped from the
   finding to the guard: it now asserts the WHOLE economy, edges included,
   because a free move with a leaky boundary is a different game.

   The five claims, each of which was false either before the fix or under a
   naive version of it:
     1. an off-ball 1-square step is FREE, offense keeps the turn
     2. the SECOND step in the same turn is NOT free (it spends the action)
     3. the BALL CARRIER never gets a free step
     4. an off-ball move of 2+ squares is a main action, not a step
     5. after the free step, the main action still hands the defense its slide
        (D33: the defense answers the action, never the step)

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

/* A CPU game gives a real board, but the CPU must not act while we probe, so
   freeze its driver by turning it off after setup: we only need the state
   machine, not an opponent. */
await p.evaluate(() => {
  BK.startCpu('pro', 'nba');
});
await sleep(2500);
await p.evaluate(() => { BK.coach.cpu.on = false; });

/* helper: run one staged move through the REAL commit path and report what
   the turn machine did with it */
const move = (idx, dc, dr) => p.evaluate(async ([idx, dc, dr]) => {
  const st = BK.state();
  const pc = st.pieces[idx];
  const before = {phase: st.phase, used: !!st.shuffleUsed};
  st.phase = 'off-move';
  st.selected = idx;
  st.staged = {kind: 'move', tile: [pc.c + dc, pc.r + dr]};
  const freeSaid = BK._freeStep(idx, [pc.c + dc, pc.r + dr]);
  BK._commit();
  await new Promise(r => setTimeout(r, 1000));
  const after = BK.state();
  return {before, freeSaid, afterPhase: after.phase, used: !!after.shuffleUsed,
          pos: pc.pos};
}, [idx, dc, dr]);

const pieces = await p.evaluate(() => {
  const st = BK.state();
  return {offense: st.offense, holder: st.ball.holder,
          list: st.pieces.map((pc, i) => ({i, team: pc.team, pos: pc.pos,
                                           c: pc.c, r: pc.r}))};
});
const offBall = pieces.list.filter(x => x.team === pieces.offense &&
                                        x.i !== pieces.holder);
/* pick a mover with a clearly-legal neighbour square (not at board edge);
   direction chosen per piece below */
const dirFor = pc => (pc.r > 1 ? [0, -1] : [0, 1]);

console.log('\nTURN ECONOMY · the five claims\n');

/* 1 · the free step */
{
  const m = offBall[0], [dc, dr] = dirFor(m);
  const r = await move(m.i, dc, dr);
  check('1 · an off-ball 1-square step is FREE (offense keeps the turn)',
        r.freeSaid && r.afterPhase === 'off-select' && r.used,
        `label said free=${r.freeSaid}, phase after=${r.afterPhase}`);
}

/* 2 · no second free step in the same turn */
{
  const m = offBall[1] || offBall[0];
  const fresh = await p.evaluate(i => {
    const st = BK.state(); const pc = st.pieces[i];
    return {c: pc.c, r: pc.r};
  }, m.i);
  const [dc, dr] = fresh.r > 1 ? [0, -1] : [0, 1];
  const r = await move(m.i, dc, dr);
  check('2 · the SECOND step the same turn is NOT free (spends the action)',
        !r.freeSaid && r.afterPhase === 'def-slide',
        `label free=${r.freeSaid}, phase after=${r.afterPhase}`);
}

/* the defense owes a slide now; skip it to get a fresh offensive beat, which
   also proves the resetter: a new beat mints a new free step */
{
  await p.evaluate(() => BK._skip ? BK._skip() : window.BKDrill && null);
  const reset = await p.evaluate(async () => {
    // drive the real skip the way the button does
    const btn = document.getElementById('aSkip');
    if (btn) btn.click();
    await new Promise(r => setTimeout(r, 700));
    const st = BK.state();
    return {phase: st.phase, used: !!st.shuffleUsed};
  });
  check('   (reset) a fresh offensive beat mints a fresh free step',
        reset.phase === 'off-select' && !reset.used,
        `phase=${reset.phase}, shuffleUsed=${reset.used}`);
}

/* 3 · the carrier never steps free */
{
  const h = await p.evaluate(() => {
    const st = BK.state(); const pc = st.pieces[st.ball.holder];
    return {i: st.ball.holder, c: pc.c, r: pc.r};
  });
  const said = await p.evaluate(([i, c, r]) =>
    BK._freeStep(i, [c, r > 1 ? r - 1 : r + 1]), [h.i, h.c, h.r]);
  check('3 · the ball carrier NEVER gets a free step', said === false,
        'freeStepQualifies(holder)=' + said);
}

/* 4 · a 2-square off-ball move is a main action */
{
  const m = await p.evaluate(() => {
    const st = BK.state();
    let idx = -1;
    st.pieces.forEach((pc, i) => {
      if (pc.team === st.offense && i !== st.ball.holder && idx < 0 &&
          pc.r > 2) idx = i;
    });
    if (idx < 0) return null;
    const pc = st.pieces[idx];
    return {i: idx, c: pc.c, r: pc.r,
            said: BK._freeStep(idx, [pc.c, pc.r - 2])};
  });
  check('4 · an off-ball move of 2+ squares is NOT a step (main action)',
        m && m.said === false,
        m ? 'freeStepQualifies(2 squares)=' + m.said : 'no mover with room');
}

/* 5 · D33: after a free step, the main action still hands the defense its
       slide — the step drew no response, the action draws exactly one */
{
  const seq = await p.evaluate(async () => {
    const st = BK.state();
    let idx = -1;
    st.pieces.forEach((pc, i) => {
      if (pc.team === st.offense && i !== st.ball.holder && idx < 0 &&
          pc.r > 1) idx = i;
    });
    const pc = st.pieces[idx];
    st.phase = 'off-move'; st.selected = idx;
    st.staged = {kind: 'move', tile: [pc.c, pc.r - 1]};
    BK._commit();                       /* the free step */
    await new Promise(r => setTimeout(r, 900));
    const midPhase = BK.state().phase;  /* must still be offense */
    const st2 = BK.state();
    let idx2 = -1;                      /* second off-ball man, main action */
    st2.pieces.forEach((pc2, i) => {
      if (pc2.team === st2.offense && i !== st2.ball.holder && i !== idx &&
          idx2 < 0 && pc2.r > 1) idx2 = i;
    });
    const pc2 = st2.pieces[idx2];
    st2.phase = 'off-move'; st2.selected = idx2;
    st2.staged = {kind: 'move', tile: [pc2.c, pc2.r - 1]};
    BK._commit();                       /* the main action */
    await new Promise(r => setTimeout(r, 900));
    return {midPhase, endPhase: BK.state().phase};
  });
  check('5 · D33: the step drew no slide, the main action drew exactly one',
        seq.midPhase === 'off-select' && seq.endPhase === 'def-slide',
        `after step=${seq.midPhase}, after action=${seq.endPhase}`);
}

/* THE NUDGE (Aaron, 08-11): first main action attempted with the free step
   unused raises the coach once, and the action is NOT taken. The second
   attempt must go through — a nudge that swallows the action forever is a
   trap, and exactly that bug exists if the seen-check is skipped, because
   tip() silently no-ops on a seen key while the nudge keeps returning true. */
{
  const r = await p.evaluate(async () => {
    localStorage.setItem('bk_coach', '1');          /* coach ON for this one */
    localStorage.removeItem('bk_coach_seen');
    const st = BK.state();
    st.shuffleUsed = false;
    st.phase = 'off-move';
    st.selected = st.ball.holder;
    const pc = st.pieces[st.ball.holder];
    st.staged = {kind: 'move', tile: [pc.c, pc.r > 1 ? pc.r - 1 : pc.r + 1]};
    BK._commit();                                   /* attempt 1: nudged */
    await new Promise(r => setTimeout(r, 600));
    const nudged = !!document.querySelector('#coachTip.on');
    const stillStaged = !!BK.state().staged;
    if (document.querySelector('#coachTip .ct-ok'))
      document.querySelector('#coachTip .ct-ok').click();
    await new Promise(r => setTimeout(r, 400));
    BK._commit();                                   /* attempt 2: plays */
    /* poll to the SETTLED phase: a fixed wait sampled mid-anim and read
       'anim' as a failure when the move was in fact playing through */
    let endPhase = BK.state().phase;
    for (let i = 0; i < 30 && (endPhase === 'anim' || endPhase === 'off-move'); i++) {
      await new Promise(r => setTimeout(r, 200));
      /* With the coach ON, unrelated once-per-phone tips can fire mid-anim and
         FREEZE the game, which parks the phase at 'anim' forever and read as
         the nudge trapping the action. Dismiss strays each poll: tipHide thaws
         and the anim resumes. Coach stays ON on purpose: turning it off here
         would pass the no-trap check for the wrong reason (no coach, no trap),
         which is the vacuity bug this suite already caught once today. */
      window.BKCoach && BKCoach.hide && BKCoach.hide();
      endPhase = BK.state().phase;
    }
    localStorage.setItem('bk_coach', '0');
    return {nudged, stillStaged, endPhase};
  });
  check('nudge · first bare main action asks "free step first?"', r.nudged);
  check('nudge · and the staged action survives the question', r.stillStaged);
  check('nudge · the SECOND attempt plays through (no trap)',
        r.endPhase === 'def-slide', 'phase=' + r.endPhase);
}

/* sabotage: the harness must be able to fail. Pretend the step already
   happened and claim the same move is free — the predicate must refuse. */
{
  const s = await p.evaluate(() => {
    const st = BK.state();
    st.shuffleUsed = true;
    let idx = -1;
    st.pieces.forEach((pc, i) => {
      if (pc.team === st.offense && i !== st.ball.holder && idx < 0) idx = i;
    });
    const pc = st.pieces[idx];
    st.phase = 'off-move';
    return BK._freeStep(idx, [pc.c, pc.r > 1 ? pc.r - 1 : pc.r + 1]);
  });
  check('sabotage · with the step spent, the predicate refuses', s === false,
        'freeStepQualifies=' + s);
}

await b.close();
console.log(`\n${fail ? fail + ' FAILED, ' : ''}${pass} passed`);
console.log(fail
  ? '\nThe turn economy leaks. Do not ship until this is green.'
  : '\nDESIGN.md 3 and the game agree: one free off-ball step, one main action.');
process.exit(fail ? 1 : 0);

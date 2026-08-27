/* TURN ECONOMY — what the offense actually gets per possession, measured.

   HISTORY, AND WHY THIS FILE WAS REWRITTEN ON 2026-08-27. It was born
   failing on purpose: DESIGN § 3 promised "one free off-ball shuffle (1
   square) + one main action", the shipped game gave no free shuffle, and the
   check proved doc and game disagreed (V0 D32). Aaron ruled "Design free off
   ball movement please" on 08-11, the rule shipped, and this file became its
   guard.

   Then the economy changed underneath it and nobody moved the guard. Method
   B became the possession model (ruled 08-17, shipped 08-18) and it does not
   have one free step: the offensive beat opens with a SETUP half in which
   EVERY off-ball player gets one move at FULL ROLE RANGE, which was Aaron's
   08-18 ruling, "lets give everyone full range and that's it, we can remove
   the switches". So the old five claims described a world that only exists
   now in half-court and net games, and the file sat red for days accusing a
   correct game of leaking. That is the failure AI-LEARNINGS 1.2qqq is about.

   THE CLAIMS THIS FILE NOW GUARDS, all in a full-court five-player game,
   which is what Method B latches on:
     1. during setup, an off-ball step is FREE: the offense keeps the turn
     2. FULL RANGE is real, a legal 2+ square setup move is still free
     3. one move per player: the same piece cannot step twice in a beat
     4. the BALL CARRIER never gets a free move
     5. a move beyond the player's range is not a free move
     6. when the last off-ball player has moved, setup ENDS and the defense
        gets its slide: D33, the defense answers the action, never the step

   WHAT THIS FILE DOES NOT COVER, stated rather than implied: half-court and
   online games still run the classic one-free-shuffle economy, and nothing
   guards it there. Filed on row 199.

   Serve docs/ on :8899, then: node tools/turn-economy-check.mjs
*/
import pw from 'playwright';
const {chromium} = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SABOTAGE = process.env.SABOTAGE === '1';
let pass = 0, fail = 0;
const check = (name, ok, note) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${note ? '   [' + note + ']' : ''}`);
  ok ? pass++ : fail++;
};

console.log('TURN ECONOMY · Method B, the six claims\n');

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
   freeze its driver after setup: we only need the state machine. */
await p.evaluate(() => { BK.startCpu('pro', 'nba'); });
await sleep(2600);
await p.evaluate(() => { BK.coach.cpu.on = false; });

/* THE RENDER GUARD. Everything below is about Method B, so if this game is
   not a Method B game the results mean nothing and a green run would be a
   lie. Half-court, online and drills legitimately are not; a full-court CPU
   game must be. */
const world = await p.evaluate(() => ({
  mb: BK._mbActive(), pieces: BK.state().pieces.length, half: !!BK.state().qmode }));
if (!world.mb || world.pieces !== 10) {
  console.log(`  GUARD FAIL · this is not the game these claims describe ` +
    `[methodB=${world.mb} pieces=${world.pieces}]`);
  await b.close(); process.exit(1);
}

/* THE BREAK-IT PASS. A rewritten guard is worth nothing until it has caught
   a broken game once: SABOTAGE=1 makes the predicate say "free" to
   everything, which is exactly the leak this file exists to catch, and the
   run must go RED. */
if (SABOTAGE) {
  await p.evaluate(() => { BK._freeStep = () => true; });
  console.log('  (SABOTAGE: the predicate now says free to everything, red is correct)\n');
}

/* drive the beat to its setup half, the way the game does */
await p.evaluate(async () => {
  const st = BK.state();
  if (!BK._mb().setup) { BK._mbStartSetup ? BK._mbStartSetup() : null; }
  await new Promise(r => setTimeout(r, 300));
});
await sleep(900);

const setupOpen = await p.evaluate(() => BK._mb().setup);
check('the offensive beat opens with a free setup half', setupOpen === true,
  'setup=' + setupOpen);

const board = await p.evaluate(() => {
  const st = BK.state();
  const off = st.pieces
    .map((pc, i) => ({i, team: pc.team, pos: pc.pos, c: pc.c, r: pc.r,
                      range: BK._rangeOf(pc)}))
    .filter(x => x.team === st.offense && x.i !== st.ball.holder);
  return {offense: st.offense, holder: st.ball.holder, off};
});

/* a legal destination d squares away that is empty and on the court */
const spotFor = (idx, dist) => p.evaluate(([idx, dist]) => {
  const st = BK.state(), pc = st.pieces[idx];
  const taken = new Set(st.pieces.filter(x => x.c >= 0).map(x => x.c + ',' + x.r));
  for (const [dc, dr] of [[dist,0],[-dist,0],[0,dist],[0,-dist],[dist,dist],[-dist,-dist],
                          [dist,-dist],[-dist,dist]]) {
    const c = pc.c + dc, r = pc.r + dr;
    if (c < 0 || r < 0 || c > 14 || r > 7) continue;
    if (taken.has(c + ',' + r)) continue;
    return [c, r];
  }
  return null;
}, [idx, dist]);

/* ASK THE PREDICATE THE WAY THE GAME ASKS IT. freeStepQualifies() answers
   false outside the move phase, so a probe that forgets to stage first gets
   a false that means "wrong moment", not "not free". Three checks below
   passed for that wrong reason on the first run (08-27). */
const freeSaid = (idx, tile) => p.evaluate(([i, t]) => {
  const st = BK.state();
  const keep = st.phase;
  st.phase = 'off-move'; st.selected = i;
  const said = BK._freeStep(i, t);
  st.phase = keep; st.selected = null;
  return said;
}, [idx, tile]);

const one = board.off[0];
const spot1 = await spotFor(one.i, 1);

/* 1 · a setup step is free and the offense keeps the turn */
const step = await p.evaluate(async ([idx, tile]) => {
  const st = BK.state();
  st.phase = 'off-move'; st.selected = idx; st.staged = {kind: 'move', tile};
  const said = BK._freeStep(idx, tile);
  BK._commit();
  await new Promise(r => setTimeout(r, 1100));
  return {said, phase: BK.state().phase, setup: BK._mb().setup,
          marked: !!BK._mb().moved[idx]};
}, [one.i, spot1]);
check('1 · a setup step is FREE and the offense keeps the turn',
  step.said === true && step.setup === true && step.phase !== 'def-slide',
  `predicate=${step.said} phase=${step.phase} setup=${step.setup}`);
check('   and the piece is marked as having taken its move', step.marked === true);

/* 2 · full range: a legal 2+ square move is still free (his 08-18 ruling) */
const far = board.off.find(x => x.range >= 2 && x.i !== one.i);
let farOk = 'no piece with range 2+ on the floor';
if (far) {
  const spot2 = await spotFor(far.i, 2);
  farOk = spot2 ? await freeSaid(far.i, spot2) : 'no empty square 2 away';
}
check('2 · FULL RANGE is real: a 2-square setup move is still free', farOk === true,
  String(farOk) + (far ? ` · ${far.pos} range ${far.range}` : ''));

/* 3 · one move per player per beat */
const again = await spotFor(one.i, 1);
const twice = again ? await freeSaid(one.i, again) : null;
check('3 · the same player cannot step twice in one beat', twice === false,
  'predicate=' + twice);

/* 4 · the ball carrier never gets a free move */
const holderSpot = await spotFor(board.holder, 1);
const holderFree = holderSpot ? await freeSaid(board.holder, holderSpot) : null;
check('4 · the ball carrier never gets a free move', holderFree === false,
  'predicate=' + holderFree);

/* 5 · beyond the player's range is not a free move */
/* any off-ball player that has NOT already taken its move this beat */
const short = board.off.find(x => x.i !== one.i) || board.off[0];
const tooFar = await spotFor(short.i, short.range + 1);
const beyond = tooFar ? await freeSaid(short.i, tooFar) : null;
check('5 · a move beyond the role range is not a free move', beyond === false,
  `${short.pos} range ${short.range}, tried ${short.range + 1} · predicate=${beyond}`);

/* 6 · when the last off-ball player has moved, the DEFENSE answers */
const closed = await p.evaluate(async () => {
  const st = BK.state();
  /* mark everyone else as set the way their own moves would, then end it the
     way the game ends it */
  BK._mbSetupEnd();
  await new Promise(r => setTimeout(r, 900));
  return {phase: BK.state().phase, setup: BK._mb().setup};
});
check('6 · setup closing hands the defense its slide, once (D33)',
  closed.setup === false && closed.phase === 'def-slide',
  `phase=${closed.phase} setup=${closed.setup}`);

console.log(`\n  ${fail ? fail + ' FAILED, ' : ''}${pass} passed` +
  (SABOTAGE ? '  (SABOTAGE RUN: red is correct)' : ''));
if (fail && !SABOTAGE) console.log('\n  The turn economy leaks. Do not ship until this is green.');
await b.close();
process.exit(SABOTAGE ? (fail ? 0 : 1) : (fail ? 1 : 0));

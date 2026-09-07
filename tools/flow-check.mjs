/* FLOW CHECK: the possession mock-up (row 239, the rules ruled 09-07)

   Drives the real game with ?flow=local (one phone, both sides by hand) and
   asserts the eleven ruled sentences one by one on the live board: the
   balls (two to cross, then three; crossing wipes the crossing balls), the
   free move (one, skippable, off-ball only), the ball action ending the
   turn, End turn spending a ball, the defense doing one thing with a ten
   second step, the two-question steal with the reacher knocked aside, ONE
   MORE after a blow-by, three seconds counted in turns, the glide after a
   made basket, and the two violations.

   Serve docs/ on :8899, then: node tools/flow-check.mjs
   SABOTAGE=1 breaks the crossing rule and the step clock; the run must go red.
   Every check has a render guard: the mock must actually be on. */
import pw from 'playwright';
const {chromium} = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SABOTAGE = process.env.SABOTAGE === '1';
const SHOTS = process.env.SHOTS || '';
let pass = 0, fail = 0;
const check = (name, ok, note) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${note ? '   [' + note + ']' : ''}`); ok ? pass++ : fail++; };

console.log('FLOW CHECK · the possession mock-up\n');
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
await ctx.addInitScript(() => {
  window.__bkNoCine = 1;
  localStorage.setItem('bk_coach', '0');
  localStorage.setItem('bk_coach_seen', JSON.stringify({tipHow: 1, tossupOffer: 1, tuHow: 1}));
});
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => { errs.push(e.message); console.log('  ! page error: ' + e.message); });
await p.goto('http://127.0.0.1:8899/play/?flow=local', {waitUntil: 'networkidle'});

if (SABOTAGE) {
  await p.evaluate(() => { BK.flow.inFront = () => false; BK.flow.setClk = () => {}; });
  console.log('  (SABOTAGE: crossing can never happen and the step clock stays 24; red is correct)\n');
}

/* the jump ball: buzz for squad one, answer right */
await p.waitForFunction(() => document.getElementById('tipveil').classList.contains('on'), null, {timeout: 20000});
/* the buzz only counts once the question has typed itself out: press until it lands */
for (let i = 0; i < 25; i++) {
  await p.keyboard.press('a');
  await sleep(700);
  if (await p.evaluate(() => document.querySelectorAll('#tipAns .ans').length === 4)) break;
}
await p.waitForFunction(() => document.querySelectorAll('#tipAns .ans').length === 4, null, {timeout: 5000});
await p.click('#tipAns .ans[data-ok="1"]');
await p.waitForFunction(() => window.BKFLOW && BKFLOW.on && BKFLOW.T() && BKFLOW.T().phase !== 'idle' || document.getElementById('mbCar'), null, {timeout: 15000});

/* the two first picks, both by hand under ?flow=local: tap a card, RUN IT */
async function runPick() {
  await p.waitForFunction(() => !!document.getElementById('mbCar'), null, {timeout: 8000});
  await sleep(300);
  await p.click('#mbCar .mbcard');
  await sleep(300);
  await p.click('#mbCar .mbcard.on .mbc-go');
  await sleep(400);
}
await runPick(); await runPick();
await p.waitForFunction(() => BKFLOW.T() && BKFLOW.T().phase === 'off', null, {timeout: 8000});
await sleep(500);

/* render guard */
const guard = await p.evaluate(() => ({on: BKFLOW.on, mode: BKFLOW.mode, phase: BKFLOW.T().phase, stphase: BK.state().phase, pieces: BK.state().pieces.length, dock: !!document.querySelector('#stagebox .flballs')}));
if (!guard.on || guard.phase !== 'off' || guard.pieces !== 10 || !guard.dock) {
  console.log('  GUARD FAIL · the mock is not running ' + JSON.stringify(guard));
  await b.close(); process.exit(1);
}

const T = () => p.evaluate(() => JSON.parse(JSON.stringify(BKFLOW.T())));
const S = () => p.evaluate(() => { const s = BK.state(); return {offense: s.offense, holder: s.ball.holder, phase: s.phase, selected: s.selected, clock: s.clock, pieces: s.pieces.map(x => ({team: x.team, pos: x.pos, c: x.c, r: x.r}))}; });
/* a hair below the tile centre: the sprites stand up from their squares, so a tap on the centre of a square in front of a piece can hit the piece */
const tapTile = (c, r) => p.evaluate(([c, r]) => { const t = BK.tileToScreen(c, r); const D = BK.flow.dims(); const t2 = BK.tileToScreen(c, r + 1 < D.ROWS ? r + 1 : r - 1); const dy = Math.abs(t2.y - t.y); BK._tapAt(t.x, t.y + dy * 0.22); }, [c, r]);
const tapPiece = i => p.evaluate(i => { const pc = BK.state().pieces[i]; const t = BK.tileToScreen(pc.c, pc.r); BK._tapAt(t.x, t.y - 10); }, i);
const setPos = (i, c, r) => p.evaluate(([i, c, r]) => BK._set(i, c, r), [i, c, r]);
const waitPhase = async (ph, ms = 6000) => { try { await p.waitForFunction(ph => BKFLOW.T() && BKFLOW.T().phase === ph && BK.state().phase !== 'anim' && BK.state().phase !== 'anim2', ph, {timeout: ms}); } catch (e) { const dbg = await p.evaluate(() => ({T: BKFLOW.T().phase, st: BK.state().phase, log: BKFLOW.log().slice(-6).map(x => x.k + (x.kind ? ':' + x.kind : ''))})); throw new Error('waitPhase(' + ph + ') ' + JSON.stringify(dbg)); } };
const logHas = k => p.evaluate(k => BKFLOW.log().some(e => e.k === k), k);
const logLast = k => p.evaluate(k => BKFLOW.log().filter(e => e.k === k).pop(), k);
/* the count is real, so a scenario that needs more turns tops it up by hand */
const refill = n => p.evaluate(n => { const T = BKFLOW.T(); T.crossed = true; T.balls.cross = 0; T.balls.shoot = n; }, n);
const shot = async name => { if (SHOTS) await p.screenshot({path: SHOTS + '/' + name + '.png'}); };
/* answer the card that is up: flip it, then tap the right or wrong answer */
async function answer(ok) {
  await p.waitForFunction(() => document.getElementById('qveil').classList.contains('on'), null, {timeout: 6000});
  await sleep(300);
  await p.click('#cardfront');
  await sleep(500);
  await p.click('#qanswers .ans[data-ok="' + (ok ? '1' : '0') + '"]');
  await sleep(2100);
}
/* a legal empty square next to piece i, preferring the direction toward/away from the rim */
async function squareNear(i, want) {
  return p.evaluate(([i, want]) => {
    const s = BK.state(), pc = s.pieces[i], D = BK.flow.dims();
    let best = null, bd = 1e9;
    for (let r = 0; r < D.ROWS; r++) for (let c = 0; c < D.COLS; c++) {
      if (!BK.flow.legalMove(pc, BK.flow.rangeOf(pc), c, r)) continue;
      if (want === 'free' && pc.team === s.offense && i === s.ball.holder) {
        if (BK.flow.driveChallenge(pc.c, pc.r, c, r, s.offense) >= 0) continue;
        if (BKFLOW.T().crossed && !BK.flow.inFront(s.offense, c, r)) continue;
      }
      if (want === 'stay' && BK.flow.inFront(s.offense, c, r)) continue;
      if (want === 'cross' && !BK.flow.inFront(s.offense, c, r)) continue;
      const d = Math.abs(c - pc.c) + Math.abs(r - pc.r);
      if (d < bd) { bd = d; best = [c, r]; }
    }
    return best;
  }, [i, want]);
}

/* 1. the live ball after the tip: two to cross, then three */
let t = await T(), s = await S();
check('after the tip the count is two to cross then three, not yet over half court', t.balls.cross === 2 && t.balls.shoot === 3 && t.crossed === false, JSON.stringify(t.balls));
check('the offense clock is the 24', s.clock.kind === 'off' && s.clock.t > 20 && s.clock.t <= 24, 't=' + s.clock.t.toFixed(1));
await shot('01-live-ball');

/* 2. the free move: an off-ball teammate, one square, the turn goes on */
const off = s.offense, mates = s.pieces.map((x, i) => i).filter(i => s.pieces[i].team === off && i !== s.holder);
const mate = mates[0];
await tapPiece(mate); await sleep(200);
let sq = await squareNear(mate, 'any');
await tapTile(sq[0], sq[1]); await sleep(700);
t = await T(); s = await S();
check('the free move moves an off-ball teammate and the turn goes on', t.phase === 'off' && t.freeUsed === true && s.pieces[mate].c === sq[0] && s.pieces[mate].r === sq[1], 'freeUsed=' + t.freeUsed);
check('the free move spends no ball', t.balls.cross === 2 && t.balls.shoot === 3);
/* a second free move is refused */
await tapPiece(mates[1]); await sleep(200);
s = await S();
check('a second free move is refused', s.selected == null, 'selected=' + s.selected);
await shot('02-free-move');

/* 3. a dribble that stays in the backcourt spends a crossing ball, then the defense steps */
await tapPiece(s.holder); await sleep(200);
sq = await squareNear(s.holder, 'stay');
if (sq) { await tapTile(sq[0], sq[1]); await waitPhase('def'); }
t = await T(); s = await S();
check('a dribble ends the turn and spends one crossing ball', sq && t.phase === 'def' && t.balls.cross === 1 && t.crossed === false, JSON.stringify(t.balls));
check('the defense clock is ten seconds', s.clock.kind === 'def' && s.clock.t <= 10 && s.clock.t > 7, 't=' + (s.clock.t || 0).toFixed(1));
await shot('03-defense-turn');

/* 4. the defense: End turn hands it straight back */
await p.click('#flEnd'); await waitPhase('off');
t = await T();
check('the defense can end its turn with nothing', t.phase === 'off' && t.balls.cross === 1);

/* 5. crossing: the unused crossing ball vanishes, three to shoot */
s = await S();
await tapPiece(s.holder); await sleep(200);
sq = await squareNear(s.holder, 'cross');
if (!sq) { /* walk it up first */ sq = await squareNear(s.holder, 'free'); }
await tapTile(sq[0], sq[1]); await waitPhase('def');
t = await T();
if (!t.crossed) { /* one more dribble to get over */
  await p.click('#flEnd'); await waitPhase('off'); s = await S();
  await tapPiece(s.holder); await sleep(200); sq = await squareNear(s.holder, 'cross'); await tapTile(sq[0], sq[1]); await waitPhase('def'); t = await T();
}
check('crossing half court wipes the crossing balls and leaves three to shoot', t.crossed === true && t.balls.cross === 0 && t.balls.shoot === 3, JSON.stringify(t.balls));
await shot('04-crossed');

/* 6. the defensive step: one defender moves, then the offense again */
s = await S();
const defs = s.pieces.map((x, i) => i).filter(i => s.pieces[i].team !== off);
await tapPiece(defs[0]); await sleep(200);
sq = await squareNear(defs[0], 'any');
await tapTile(sq[0], sq[1]); await waitPhase('off');
s = await S();
check('the defense steps one defender and the turn comes back', s.pieces[defs[0]].c === sq[0] && s.pieces[defs[0]].r === sq[1] && (await T()).phase === 'off');

/* 7. End turn on offense spends a shooting ball */
await p.click('#flEnd'); await waitPhase('def');
t = await T();
check('End turn on offense spends a ball', t.balls.shoot === 2, 'shoot=' + t.balls.shoot);
await p.click('#flEnd'); await waitPhase('off');

/* 8. the steal: put a defender next to the ball, take the steal, miss it */
s = await S();
const hold = s.pieces[s.holder];
let adjSq = await p.evaluate(h => { const s = BK.state(); for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) { const c = h.c + dc, r = h.r + dr; if (c >= 0 && r >= 0 && c < BK.flow.dims().COLS && r < BK.flow.dims().ROWS && BK.flow.pieceAt(c, r) < 0) return [c, r]; } return null; }, hold);
await setPos(defs[1], adjSq[0], adjSq[1]);
await p.click('#flEnd'); await waitPhase('def'); await sleep(300);
const stealLit = await p.evaluate(() => { const b = document.getElementById('flSteal'); return b && !b.disabled; });
check('Steal lights only when a defender is already next to the ball', stealLit === true);
await p.click('#flSteal');
await answer(false);
await waitPhase('off'); await sleep(200);
const miss = await logLast('stealmiss'); s = await S();
const movedAside = miss && miss.to && s.pieces[miss.def].c === miss.to[0] && s.pieces[miss.def].r === miss.to[1];
check('a wrong steal answer knocks the reacher aside and the offense plays on', !!miss && movedAside && (await T()).phase === 'off', JSON.stringify(miss && miss.to));
await shot('05-steal-missed');

/* 9. the steal, both right: nothing happens */
await refill(3);
await setPos(defs[1], adjSq[0], adjSq[1]);
t = await T();
await p.click('#flEnd'); await waitPhase('def'); await sleep(300);
await p.click('#flSteal');
await answer(true); await answer(true);
await waitPhase('off');
check('both right on a steal: nothing happens, the offense plays on', (await logHas('stealheld')) && (await S()).offense === off);

/* 10. three seconds: a defender parked in the key is walked out on his third turn */
s = await S();
const keySq = await p.evaluate(off => { const rim = BK.flow.defendedRim(1 - off), D = BK.flow.dims(); for (let c = 0; c < D.COLS; c++) for (let r = 0; r < D.ROWS; r++) if (BK.flow.inPaint(c, r, rim) && BK.flow.pieceAt(c, r) < 0) return [c, r]; return null; }, off);
await setPos(defs[2], keySq[0], keySq[1]);
await refill(4);
/* three defensive turns with him standing there: End turn each time; the fourth End turn runs the count out */
const vioBefore = await p.evaluate(() => BKFLOW.log().filter(e => e.k === 'violation').length);
for (let i = 0; i < 4; i++) {
  t = await T(); if (t.phase !== 'off') break;
  await p.click('#flEnd');
  await p.waitForFunction(n => BKFLOW.T().phase === 'def' || BKFLOW.log().filter(e => e.k === 'violation').length > n, vioBefore, {timeout: 6000});
  if (await p.evaluate(n => BKFLOW.log().filter(e => e.k === 'violation').length > n, vioBefore)) break;
  await sleep(250); await p.click('#flEnd');
  await p.waitForFunction(() => BKFLOW.T().phase === 'off' && BK.state().phase !== 'anim', null, {timeout: 6000}); await sleep(300);
}
const walked = await logLast('threeseconds');
check('a defender in the key for three defensive turns is walked out by the game', !!walked && walked.i === defs[2], JSON.stringify(walked));
await shot('06-three-seconds');

/* those End turns also ran the offense out of shooting balls: the violation */
const vio = await logLast('violation');
await p.waitForFunction(() => BKFLOW.T().phase === 'off' && BK.state().phase !== 'anim', null, {timeout: 6000}); await sleep(300);
check('running out of shooting balls with no shot is a SHOT CLOCK VIOLATION and the ball changes teams', !!vio && vio.kind === 'shot' && (await S()).offense !== off, JSON.stringify(vio) + ' offense ' + off + ' to ' + (await S()).offense);
await shot('07-violation');

/* 11. a made basket: the glide, three balls, the other team on offense */
s = await S(); const off2 = s.offense;
/* stand the holder under the rim, alone, and shoot */
const rimSq = await p.evaluate(off => { const rim = BK.flow.attackedRim(off), D = BK.flow.dims(); let best = null, bd = 1e9; for (let c = 0; c < D.COLS; c++) for (let r = 0; r < D.ROWS; r++) { if (BK.flow.pieceAt(c, r) >= 0) continue; const tc = BK.flow.tileCenter(c, r), d = Math.hypot(tc[0] - rim[0], tc[1] - rim[1]); if (d < bd && BK.flow.zoneOf(c, r, off) && BK.flow.zoneOf(c, r, off).z === 'layup') { bd = d; best = [c, r]; } } return best; }, off2);
await setPos(s.holder, rimSq[0], rimSq[1]);
/* clear any contester */
const contest = await p.evaluate(([c, r, off]) => BK.flow.adjDefenderIdx(c, r, off), [rimSq[0], rimSq[1], off2]);
if (contest >= 0) await setPos(contest, 0, 0);
await p.evaluate(() => BKFLOW.repaint()); await sleep(200);
await p.click('#flShoot');
await answer(true);
await p.waitForFunction(() => BKFLOW.log().some(e => e.k === 'make'), null, {timeout: 8000});
await p.waitForFunction(() => BKFLOW.T().phase === 'off' && BK.state().phase !== 'anim', null, {timeout: 12000});
t = await T(); s = await S();
check('after a made basket the other team has the ball with three to shoot, already over half court', s.offense !== off2 && t.balls.cross === 0 && t.balls.shoot === 3 && t.crossed === true, JSON.stringify(t.balls));
check('after the glide the ball is in the point guard\'s hands', s.pieces[s.holder].pos === 'PG' && s.pieces[s.holder].team === s.offense);
await shot('08-after-glide');

/* 12. ONE MORE: a crossover the handler wins and the defender loses */
s = await S(); const off3 = s.offense;
/* put a lone defender straight in front of the handler, toward the rim */
const front = await p.evaluate(off => { const s = BK.state(), h = s.pieces[s.ball.holder], rim = BK.flow.attackedRim(off); const dir = rim[0] > BK.flow.tileCenter(h.c, h.r)[0] ? 1 : -1; const c = h.c + dir, r = h.r; return (BK.flow.pieceAt(c, r) < 0) ? [c, r, h.c + 2 * dir, h.r] : null; }, off3);
const dIdx = s.pieces.map((x, i) => i).filter(i => s.pieces[i].team !== off3)[0];
if (front) {
  await setPos(dIdx, front[0], front[1]);
  await p.evaluate(() => BKFLOW.repaint()); await sleep(100);
  await tapPiece(s.holder); await sleep(200);
  /* the square past him */
  const past = await p.evaluate(([c, r]) => BK.flow.pieceAt(c, r) < 0 ? [c, r] : null, [front[2], front[3]]);
  /* a teammate standing next to the defender screens him, and a screened man gates nothing; a second defender near the line closes it: clear everyone else into the backcourt first */
  await p.evaluate(([off, keep]) => { const s = BK.state(), D = BK.flow.dims(); s.pieces.forEach((pc, i) => { if (i === s.ball.holder || i === keep) return; for (let c = 0; c < D.COLS; c++) for (let r = 0; r < D.ROWS; r++) { if (BK.flow.pieceAt(c, r) < 0 && !BK.flow.inFront(off, c, r)) { BK._set(i, c, r); return; } } }); }, [off3, dIdx]);
  const gated = await p.evaluate(([c, r, off]) => { const s = BK.state(), h = s.pieces[s.ball.holder]; return BK.flow.driveChallenge(h.c, h.r, c, r, off); }, [past[0], past[1], off3]);
  if (gated >= 0) {
    await tapTile(past[0], past[1]);
    await sleep(400);
    const dbg = await p.evaluate(() => ({T: BKFLOW.T().phase, st: BK.state().phase, sel: BK.state().selected, pending: BK._pending(), card: document.getElementById('qveil').classList.contains('on'), log: BKFLOW.log().slice(-4).map(x => x.k), tap: BKFLOW.lastTap, holder: BK.state().pieces[BK.state().ball.holder]}));
    if (!dbg.card) console.log('  ! crossover did not deal a card: ' + JSON.stringify(dbg) + ' past=' + JSON.stringify(past) + ' front=' + JSON.stringify(front));
    await answer(true);   /* the handler's crossover card */
    await answer(false);  /* the defender fails to stay in front */
    await p.waitForFunction(() => BKFLOW.T().phase === 'onemore', null, {timeout: 8000}); await sleep(300);
    t = await T();
    const dockOne = await p.evaluate(() => /ONE MORE/.test(document.getElementById('stagebox').textContent));
    check('a blow-by earns ONE MORE: shoot or pass, no defensive turn between', t.phase === 'onemore' && t.beaten === dIdx && dockOne);
    await shot('09-one-more');
    const noFree = await p.evaluate(() => !document.getElementById('flEnd'));
    check('ONE MORE offers no free move and no End turn', noFree);
  } else {
    check('a crossover square could be set up for the ONE MORE check', false, 'driveChallenge saw no gate');
  }
} else check('a crossover square could be set up for the ONE MORE check', false, 'no free square in front');

console.log(`\n${pass} passed, ${fail} failed${errs.length ? ', ' + errs.length + ' page errors' : ''}`);
await b.close();
process.exit(fail || errs.length ? 1 : 0);

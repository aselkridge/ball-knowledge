/* FLOW OPTIONS BOARD (row 252): the two option rounds photographed on the
   real court at phone size, by the game itself, under ?flow=new.

   Round A, who am I on the board: options 1-5 shot twice, on your turn and
   on the machine's turn. Round B, how the machine's move shows: options 1-4
   shot half a second after a planted machine step. Option 0 in each round
   is the board as it is today.

   Serve docs/ on :8899, then: node tools/flow-options-board.mjs <outdir> */
import pw from 'playwright';
import fs from 'node:fs';
const {chromium} = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = process.argv[2];
if (!OUT) { console.log('usage: node tools/flow-options-board.mjs <absolute outdir>'); process.exit(1); }
fs.mkdirSync(OUT, {recursive: true});
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
await ctx.addInitScript(() => { window.__bkNoCine = 1; localStorage.setItem('bk_coach', '0'); localStorage.setItem('bk_coach_seen', JSON.stringify({tipHow: 1, tossupOffer: 1, tuHow: 1})); });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('  ! page error: ' + e.message));
await p.goto('http://127.0.0.1:8899/play/?flow=new', {waitUntil: 'networkidle'});
await p.waitForFunction(() => document.getElementById('tipveil').classList.contains('on'), null, {timeout: 20000});
for (let i = 0; i < 25; i++) { await p.keyboard.press('a'); await sleep(700); if (await p.evaluate(() => document.querySelectorAll('#tipAns .ans').length === 4)) break; }
await p.click('#tipAns .ans[data-ok="1"]');
await p.waitForFunction(() => !!document.getElementById('mbCar'), null, {timeout: 15000});
await sleep(400); await p.click('#mbCar .mbcard'); await sleep(300); await p.click('#mbCar .mbcard.on .mbc-go');
await p.waitForFunction(() => BKFLOW.T() && BKFLOW.T().phase === 'off' && BK.state().phase !== 'anim', null, {timeout: 10000});
await p.evaluate(() => { BKFLOW.demo = {hold: true}; document.body.classList.add('reduce-motion'); });
/* identical conditions for every frame: the clocks hold, the readout line is gone */
const still = () => p.evaluate(() => { BK.flow.clockStop(); const bx = document.getElementById('banner'); if (bx) bx.classList.add('bk-gone'); });
await still(); await sleep(3200);
const guard = await p.evaluate(() => ({side: BKFLOW.T().side, human: BK.flow.humanTeam(), phase: BKFLOW.T().phase}));
if (guard.side !== guard.human || guard.phase !== 'off') { console.log('GUARD FAIL ' + JSON.stringify(guard)); await b.close(); process.exit(1); }

const shot = async name => { await p.screenshot({path: OUT + '/' + name + '.png'}); console.log('  shot ' + name); };
const setOpt = (who, move) => p.evaluate(([w, m]) => { BKFLOW.opt.who = w; BKFLOW.opt.move = m; BKFLOW.repaint(); }, [who, move]);

/* round A on your turn */
for (const w of [0, 1, 2, 3, 4, 5]) { await setOpt(w, 0); await still(); await sleep(350); await shot('who' + w + '-you'); }
/* hand the turn to the machine's defense: End turn; the hold keeps it still */
await setOpt(0, 0);
await p.click('#flEnd');
await p.waitForFunction(() => BKFLOW.T().phase === 'def', null, {timeout: 6000});
await still(); await sleep(3200);
for (const w of [0, 1, 2, 3, 4, 5]) { await setOpt(w, 0); await still(); await sleep(350); await shot('who' + w + '-them'); }

/* round B: plant a machine step, two squares toward the ball */
await setOpt(0, 0);
const planted = await p.evaluate(() => {
  const s = BK.state(), T = BKFLOW.T(), d = 1 - T.side, h = s.pieces[s.ball.holder], D = BK.flow.dims();
  let best = null, bd = 1e9;
  s.pieces.forEach((pc, i) => {
    if (pc.team !== d) return;
    for (let c = 0; c < D.COLS; c++) for (let r = 0; r < D.ROWS; r++) {
      if (!BK.flow.legalMove(pc, BK.flow.rangeOf(pc), c, r)) continue;
      const step = Math.max(Math.abs(c - pc.c), Math.abs(r - pc.r));
      if (step !== 2) continue;
      const dist = Math.max(Math.abs(c - h.c), Math.abs(r - h.r));
      if (dist < bd && dist >= 1) { bd = dist; best = {i, from: [pc.c, pc.r], to: [c, r]}; }
    }
  });
  if (!best) return null;
  BK._set(best.i, best.to[0], best.to[1]);
  BKFLOW.demo = {hold: true, move: {i: best.i, from: best.from, to: best.to, t: Date.now(), team: d}};
  return best;
});
if (!planted) { console.log('no step to plant'); await b.close(); process.exit(1); }
console.log('  planted ' + JSON.stringify(planted));
for (const m of [0, 1, 2, 3, 4]) {
  await p.evaluate(m => { BKFLOW.opt.who = 0; BKFLOW.opt.move = m; BKFLOW.demo.move.t = Date.now() - 500; BKFLOW.repaint(); }, m);
  await still(); await sleep(300);
  await shot('move' + m);
}
await b.close();
console.log('done');

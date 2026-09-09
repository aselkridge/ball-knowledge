/* FLOW CPU CHECK: the possession mock-up against the machine (?flow=new)

   The human side is played by a dumb thumb (End turn, Shoot when it can,
   answer cards at random); the machine plays the other side under the new
   rules. The claims: the machine takes its turns without stalling, the ball
   changes teams, the machine's actions are legal ones (dribble, pass, shoot,
   step, steal) and no page error fires in two minutes of play.

   Serve docs/ on :8899, then: node tools/flow-cpu-check.mjs */
import pw from 'playwright';
const {chromium} = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, ok, note) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${note ? '   [' + note + ']' : ''}`); ok ? pass++ : fail++; };
console.log('FLOW CPU CHECK · the mock-up against the machine\n');
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
/* the coach is ON for this run: under the mock its turn tips must stay silent (row 251) */
await ctx.addInitScript(() => { window.__bkNoCine = 1; localStorage.setItem('bk_coach', '1'); localStorage.setItem('bk_coach_seen', JSON.stringify({tipHow: 1, tossupOffer: 1, tuHow: 1})); });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => { errs.push(e.message); console.log('  ! page error: ' + e.message); });
await p.goto('http://127.0.0.1:8899/play/?flow=new', {waitUntil: 'networkidle'});
await p.waitForFunction(() => document.getElementById('tipveil').classList.contains('on'), null, {timeout: 20000});
for (let i = 0; i < 25; i++) { await p.keyboard.press('a'); await sleep(700); if (await p.evaluate(() => document.querySelectorAll('#tipAns .ans').length === 4)) break; }
await p.click('#tipAns .ans[data-ok="1"]');
/* the human's pick (the machine picks its own) */
await p.waitForFunction(() => !!document.getElementById('mbCar'), null, {timeout: 15000});
await sleep(400); await p.click('#mbCar .mbcard'); await sleep(300); await p.click('#mbCar .mbcard.on .mbc-go');
await p.waitForFunction(() => BKFLOW.T() && BKFLOW.T().phase === 'off', null, {timeout: 10000});

const guard = await p.evaluate(() => ({on: BKFLOW.on, mode: BKFLOW.mode, cpu: BK.coach.cpu.on, team: BK.coach.cpu.team}));
if (!guard.on || guard.mode !== 'cpu' || !guard.cpu) { console.log('  GUARD FAIL ' + JSON.stringify(guard)); await b.close(); process.exit(1); }

/* the dumb thumb, for two minutes */
const t0 = Date.now();
let thumbActs = 0, machineTurnsSeen = 0, machineButtons = 0, coachCards = 0;
while (Date.now() - t0 < 120000) {
  await sleep(600);
  const st = await p.evaluate(() => { const T = BKFLOW.T(); const s = BK.state(); const ct = document.getElementById('coachTip'); return {T: T && T.phase, st: s.phase, side: T && T.side, card: document.getElementById('qveil').classList.contains('on'), shoot: !!(document.getElementById('flShoot') && !document.getElementById('flShoot').disabled), end: !!document.getElementById('flEnd'), car: !!document.getElementById('mbCar'), buttons: document.querySelectorAll('#flShoot,#flEnd,#flSteal,#stagebox .flchip').length, coach: !!(ct && ct.classList.contains('on'))}; });
  if (st.coach) { coachCards++; await p.click('#coachTip .ct-ok').catch(() => {}); await sleep(300); continue; }
  /* the machine's turn: no controls on the human's screen (row 250) */
  const machineTurn = (st.T === 'off' || st.T === 'onemore') ? st.side === 1 : (st.T === 'def' ? st.side === 0 : false);
  if (machineTurn && !st.card && !st.car) { machineTurnsSeen++; if (st.buttons > 0) machineButtons++; }
  if (st.car) { await p.click('#mbCar .mbcard').catch(() => {}); await sleep(200); await p.click('#mbCar .mbcard.on .mbc-go').catch(() => {}); continue; }
  if (st.card) {
    /* whoever's card it is, the thumb answers it (the machine answers its own inside the card system) */
    const mine = await p.evaluate(() => !!document.querySelector('#qanswers .ans'));
    if (mine) { await p.click('#cardfront').catch(() => {}); await sleep(400); const ok = Math.random() < 0.6; await p.click('#qanswers .ans[data-ok="' + (ok ? '1' : '0') + '"]').catch(() => {}); await sleep(2000); thumbActs++; }
    continue;
  }
  if (st.st === 'anim' || st.st === 'anim2') continue;
  const humanTurn = (st.T === 'off' || st.T === 'onemore') ? st.side === 0 : (st.T === 'def' ? st.side === 1 : false);
  if (!humanTurn) continue;
  if (st.shoot && Math.random() < 0.5) { await p.click('#flShoot').catch(() => {}); thumbActs++; continue; }
  if (st.end) { await p.click('#flEnd').catch(() => {}); thumbActs++; continue; }
  if (st.T === 'onemore') { await p.click('#flShoot').catch(() => {}); thumbActs++; }
}
const log = await p.evaluate(() => BKFLOW.log());
const kinds = {};
log.forEach(e => { kinds[e.k] = (kinds[e.k] || 0) + 1; });
const cpuTurns = log.filter(e => e.k === 'turn' && ((e.side === 'off' && e.team === 1) || (e.side === 'def' && e.team === 1))).length;
const lives = log.filter(e => e.k === 'live' || e.k === 'make').length;
const cpuActs = log.filter(e => ['dribble', 'pass', 'shoot', 'step', 'steal', 'cross', 'free'].includes(e.k)).length;
console.log('  log: ' + JSON.stringify(kinds));
check('the machine took turns under the new rules', cpuTurns >= 6, 'cpu turns=' + cpuTurns);
check('the ball changed teams more than twice in two minutes', lives >= 3, 'flips=' + lives);
check('the machine did legal things: dribbles, passes, shots, steps', cpuActs >= 8, 'acts=' + cpuActs);
check('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
const stuck = await p.evaluate(() => { const T = BKFLOW.T(); return T ? T.phase : 'none'; });
check('the game is still live at the end', ['off', 'def', 'onemore', 'glide', 'dead'].includes(stuck), 'phase=' + stuck);
/* row 250: the machine's turn shows no controls, its moves come at a person's pace, the readout says them */
check('the machine\'s turn puts no buttons on the human\'s screen', machineTurnsSeen >= 5 && machineButtons === 0, 'machine turns sampled=' + machineTurnsSeen + ' with buttons=' + machineButtons);
const gaps = [];
for (let i = 1; i < log.length; i++) {
  const a = log[i - 1], b = log[i];
  if (a.k === 'turn' && ((a.side === 'off' && a.team === 1) || (a.side === 'def' && a.team === 1)) && b.k !== 'turn') gaps.push(b.t - a.t);
}
const minGap = gaps.length ? Math.min(...gaps) : -1;
check('the machine thinks before it moves (at least 1.5 s after its turn starts)', gaps.length >= 4 && minGap >= 1500, 'gaps=' + gaps.length + ' min=' + minGap + 'ms');
const said = log.filter(e => e.k === 'say').length;
check('the readout says what the machine did', said >= 5, 'sentences=' + said);
/* row 251: the coach's turn tips never fire under the mock; the card tip may */
const seenKeys = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('bk_coach_seen') || '{}')));
const turnTips = seenKeys.filter(k => ['select', 'slide', 'slideMB', 'inbound', 'inboundMB', 'confirm', 'cross', 'tip'].includes(k));
check('the coach\'s turn tips stay silent under the mock', turnTips.length === 0, 'seen=' + JSON.stringify(seenKeys) + ' cards dismissed=' + coachCards);
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);

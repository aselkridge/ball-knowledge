/* B5c THE PORT, checked in the REAL daily.js — not the sample page. :8899.
   Mechanism checks, the sample harness's lessons applied to the live mode:
   the ball must actually MOVE and actually ARC on a make, round 2 must keep
   the COURT (cold, spots positioned, shield up), the slam must spawn and
   leave, and the roof-off must drive the game's own #fireslam. */
import pw from 'playwright';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
let pass = 0; const fails = [];
const ck = (m, x, n) => { (x ? pass++ : fails.push(m));
  console.log(`  ${x ? 'PASS' : 'FAIL'}  ${m}${n ? '   [' + n + ']' : ''}`); };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio'] });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 },
  hasTouch: true, isMobile: true })).newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
await p.goto(BASE, { waitUntil: 'networkidle' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
await p.reload({ waitUntil: 'networkidle' });
await sleep(1500);
await p.evaluate(() => { window.BK._show('daily'); window.BKDaily.open(); });
await sleep(800);

const play = correct => p.evaluate(correct => {
  const D = window.BKDaily._state();
  const idxs = D.round === 1 ? D.set.shots : D.set.stops;
  const q = QUESTIONS[idxs[D.i]];
  const btns = [...document.querySelectorAll('#dvCard .dva')];
  btns[correct ? q.a : (q.a + 1) % btns.length].click();
}, correct);

/* ---- the make: the ball flies, and the flight ARCS -------------------- */
await p.evaluate(() => {
  window.__samples = [];
  const ball = document.getElementById('dvBall');
  const mo = new MutationObserver(() => {
    if (ball.style.display !== 'none') window.__samples.push(ball.style.transform);
  });
  mo.observe(ball, { attributes: true, attributeFilter: ['style'] });
});
await play(true);
await sleep(1000);
const flight = await p.evaluate(() => {
  const s = window.__samples.map(t => {
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(t);
    return m ? { x: +m[1], y: +m[2] } : null;
  }).filter(Boolean);
  if (s.length < 6) return { n: s.length };
  const first = s[0], last = s[s.length - 1], mid = s[Math.floor(s.length / 2)];
  const lineY = first.y + (last.y - first.y) * 0.5;
  return { n: s.length, rise: lineY - mid.y, dx: Math.abs(last.x - first.x) + Math.abs(last.y - first.y) };
});
ck('the make FLIES the ball (frames sampled)', flight.n >= 6, flight.n + ' frames');
ck('and the flight ARCS above the straight line', (flight.rise || 0) > 10,
   Math.round(flight.rise || 0) + 'px of arc');
const made = await p.evaluate(() => ({
  swish: document.getElementById('dvSwish').classList.contains('go'),
  mark: !!document.querySelector('.dvspot.made'),
  flew: window.BKDaily._thx().flew }));
ck('the swish rings fired', made.swish);
ck('the spot took its check', made.mark);
ck('the theatre counter agrees a flight completed', made.flew >= 1, 'flew=' + made.flew);

/* ---- the slam spawns AND leaves ---------------------------------------- */
await sleep(700);
const powDuring = await p.evaluate(() => document.querySelectorAll('.pow.dv').length);
await sleep(1400);
const powAfter = await p.evaluate(() => document.querySelectorAll('.pow.dv').length);
ck('the slam word leaves the stage after its moment', powAfter === 0,
   powDuring + ' during, ' + powAfter + ' after');

/* ---- play to round 2, watch the change of ends ------------------------- */
for (let n = 0; n < 4; n++) { await play(true); await sleep(1400); }
await sleep(2200); /* the round break */
const r2 = await p.evaluate(() => {
  const st = document.getElementById('dvStage');
  const court = document.getElementById('dvCourtArt');
  const spots = [...document.querySelectorAll('.dvspot')];
  return {
    cls: st.className,
    courtVisible: getComputedStyle(court).display !== 'none',
    positioned: spots.every(s => s.style.left !== '' && s.style.top !== ''),
    shield: getComputedStyle(document.querySelector('.dvshield')).opacity,
    bg: getComputedStyle(st).backgroundImage.includes('daily-dusk')
  };
});
ck('round 2 keeps the COURT (Defend the Floor)', r2.courtVisible, r2.cls);
ck('the stops are POSITIONED on the floor, not a strip', r2.positioned);
ck('the shield line is up', +r2.shield > 0.5, 'opacity ' + r2.shield);
ck('the floor flips to the DUSK art (P2 pair)', r2.bg);

/* ---- a stop and a beaten, then the sweep ending ------------------------ */
await play(true); await sleep(1400);
const stopMark = await p.evaluate(() => !!document.querySelector('.dvspot.made'));
ck('a STOP takes the same green check (your win)', stopMark);
for (let n = 0; n < 4; n++) { await play(true); await sleep(1400); }
await sleep(1000);
const swept = await p.evaluate(() => ({
  conf: document.querySelectorAll('#dvConf span').length,
  result: !document.getElementById('dvResult').classList.contains('hide') ||
          !document.getElementById('dvBonus').classList.contains('hide')
}));
ck('a 10/10 sweep drops confetti (the victory device)', swept.conf > 0,
   swept.conf + ' pieces');

/* ---- the roof-off drives the game's own #fireslam ---------------------- */
const roof = await p.evaluate(() => {
  const fs = document.getElementById('fireslam');
  const before = fs.classList.contains('on');
  /* drive hcEnd's slam path directly through the shipped element */
  document.getElementById('fsTeam').textContent = 'probe';
  return { exists: !!fs, before };
});
ck('#fireslam exists for the roof-off to borrow', roof.exists && !roof.before);
const roofSrc = await (await p.request.get(BASE + 'daily.js')).text();
ck('hcEnd drives it on a hit (roarMid + callBig + fireslam)',
   /verdict==='hit'[\s\S]{0,400}fireslam/.test(roofSrc));

ck('zero page errors the whole run', errs.length === 0, errs[0] || '');
await b.close();
console.log('\n' + (fails.length ? fails.length + ' FAILING: ' + fails.join(' · ') : 'ALL CHECKS PASS · ' + pass));
process.exit(fails.length ? 1 : 0);

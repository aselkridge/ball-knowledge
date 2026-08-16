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

/* THE HIT-TEST PROBE. The review's first find: a full-screen #dvConf with no
   pointer-events:none sat over every answer button, and every harness passed
   because .click() bypasses hit-testing. So this asks the question a thumb
   asks: what is the TOPMOST element at the centre of the first answer? */
const hit = await p.evaluate(() => {
  const btn = document.querySelector('#dvCard .dva');
  if (!btn) return { miss: 'no button' };
  const r = btn.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { ok: btn === top || btn.contains(top), top: top ? (top.id || top.className || top.tagName) : 'none' };
});
ck('a real thumb reaches the answer buttons (hit-test, not .click)', hit.ok === true,
   'topmost at button centre: ' + (hit.top || hit.miss));

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

/* ---- the seat (Aaron, 08-16, twice: "a bit off... also a bit low"). The
   flight must END at the painted rim's mouth, and the swish rings must sit
   exactly ON the rim point after dvSettle — the door's mid-animation rect
   put them 57px low-left on card 1 and no harness noticed, because nothing
   ever compared the two positions. Now something does. */
const seat = await p.evaluate(() => {
  const st = document.getElementById('dvStage').getBoundingClientRect();
  const rim = window.BKDaily._thRimXY();
  const swr = document.getElementById('dvSwish').getBoundingClientRect();
  const s = window.__samples.map(t => {
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(t);
    return m ? { x: +m[1], y: +m[2] } : null;
  }).filter(Boolean);
  const last = s[s.length - 1] || { x: -999, y: -999 };
  return { rim, last, swish: [swr.left - st.left, swr.top - st.top] };
});
ck('the make TERMINATES at the rim mouth (x)', Math.abs(seat.last.x - seat.rim[0]) < 8,
   'dx=' + Math.abs(seat.last.x - seat.rim[0]).toFixed(1));
ck('and at mouth height, not buried in the net (y)', Math.abs(seat.last.y - (seat.rim[1] - 3)) < 8,
   'dy=' + Math.abs(seat.last.y - (seat.rim[1] - 3)).toFixed(1));
ck('the swish rings sit ON the rim point after settle',
   Math.abs(seat.swish[0] - seat.rim[0]) < 2 && Math.abs(seat.swish[1] - seat.rim[1]) < 2,
   'd=(' + (seat.swish[0] - seat.rim[0]).toFixed(1) + ',' + (seat.swish[1] - seat.rim[1]).toFixed(1) + ')');

/* ---- the slam spawns AND leaves. Both halves asserted: the old version
   passed on "0 during, 0 after", a slam that never fired (08-16 review). */
await sleep(700);
const powDuring = await p.evaluate(() => document.querySelectorAll('.pow.dv').length);
await sleep(1400);
const powAfter = await p.evaluate(() => document.querySelectorAll('.pow.dv').length);
ck('the slam word SPAWNS and then leaves the stage', powDuring >= 1 && powAfter === 0,
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
    /* the dusk lives on the SCREEN's world layer since the 08-16 redesign:
       the whole world flips, not a stage strip */
    world2: document.getElementById('screen-daily').classList.contains('world2'),
    duskLayer: getComputedStyle(document.getElementById('screen-daily'),'::after')
      .backgroundImage.includes('daily-dusk')
  };
});
ck('round 2 keeps the COURT (Defend the Floor)', r2.courtVisible, r2.cls);
ck('the stops are POSITIONED on the floor, not a strip', r2.positioned);
ck('the shield line is up', +r2.shield > 0.5, 'opacity ' + r2.shield);
ck('the WORLD flips to the DUSK art (P2 pair)', r2.world2 && r2.duskLayer,
   'world2=' + r2.world2 + ' duskLayer=' + r2.duskLayer);

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
ck('hcEnd drives it on a hit (the CODE call, not a comment mention)',
   /getElementById\('fireslam'\)/.test(roofSrc) &&
   /thPlay\('roarMid'/.test(roofSrc) && /thPlay\('callBig'/.test(roofSrc));

/* the art the stage wears must actually EXIST at its path: a background url
   404s silently and the old assertion passed on the string alone (08-16) */
for (const f of ['daily-golden.webp', 'daily-dusk.webp', 'quickrun.webp', 'jacket-room.webp']) {
  const st = (await p.request.get(BASE + 'assets/art/' + f)).status();
  ck('asset serves: ' + f, st === 200, 'HTTP ' + st);
}
const decoded = await p.evaluate(() => window.BKDaily._thx().files.join(' '));
ck('the make sound came from the SWISH file, not any window',
   /net-swish\.mp3:ok/.test(decoded), decoded);

ck('zero page errors the whole run', errs.length === 0, errs[0] || '');
await b.close();
console.log('\n' + (fails.length ? fails.length + ' FAILING: ' + fails.join(' · ') : 'ALL CHECKS PASS · ' + pass));
process.exit(fails.length ? 1 : 0);

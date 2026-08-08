/* D10 — leaving the Daily Five mid-question. Serve docs/ on :8899.

   AARON'S RULE, and it is the reason this file is short: leave mid-question and
   that question is simply WRONG; you come back at the next one. He rejected
   freeze-on-leave himself ("too gameable") and he was right — freezing turns
   backgrounding the app into free thinking time on a timed card.

   The rule is also unfalsifiable by eye. To see it fail you have to leave a run,
   come back, and know what the score SHOULD have been. So every case below
   drives a real run, leaves by a real route, and reads the real state. */
import pw from 'playwright';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
let pass = 0; const fails = [];
const ck = (m, x, n) => { (x ? pass++ : fails.push(m));
  console.log(`  ${x ? 'PASS' : 'FAIL'}  ${m}${n ? '   [' + n + ']' : ''}`); };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 },
                                 hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(BASE, { waitUntil: 'networkidle' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
await p.reload({ waitUntil: 'networkidle' });
await sleep(1700);

const openDaily = () => p.evaluate(() => { window.BK._show('daily'); window.BKDaily.open(); });
const state = () => p.evaluate(() => {
  const D = window.BKDaily._state();
  return { round: D.round, i: D.i, pts: D.pts, shots: D.shots.slice(),
           stops: D.stops.slice(), phase: D.phase };
});
const answerRight = () => p.evaluate(() => {
  const D = window.BKDaily._state();
  const list = D.round === 1 ? D.set.shots : D.set.stops;
  const q = QUESTIONS[list[D.i]];
  document.querySelectorAll('#dvCard .dva')[q.a].click();
});

await openDaily(); await sleep(800);
await answerRight(); await sleep(1500);
await answerRight(); await sleep(1500);
const before = await state();
ck('two answered, sitting on the third', before.i === 2, JSON.stringify(before.shots));

/* leave by navigating inside the app — the route a player actually takes */
await p.evaluate(() => window.BK._show('title'));
await sleep(400);
const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('bk_daily5p') || 'null'));
ck('leaving writes the run down', !!saved, JSON.stringify(saved && saved.shots));
ck('the card you walked out on is scored WRONG',
   !!saved && saved.shots[2] === 0, saved ? JSON.stringify(saved.shots) : '');
ck('and you are moved past it', !!saved && saved.i === 3, saved ? 'i=' + saved.i : '');
ck('the two you got are still yours',
   !!saved && saved.shots[0] === 1 && saved.shots[1] === 1);

/* come back */
await openDaily(); await sleep(900);
const back = await state();
ck('reopening resumes, it does not restart', back.i === 3 && back.round === 1,
   `round ${back.round} card ${back.i}`);
ck('the score came back with it', back.pts === before.pts, `${back.pts} vs ${before.pts}`);
/* the arrays fill by index and stay short until the round ends, which is the
   existing shape -- not padded to five. */
ck('and the marks came back', JSON.stringify(back.shots) === JSON.stringify([1,1,0]),
   JSON.stringify(back.shots));

/* a full reload is the same story */
/* A RELOAD IS A LEAVE. Card 3 was live when the page went away, so it costs
   exactly ONE card -- not three, which is what happened before the guard, and
   not zero, which would make refresh the way to dodge a question you cannot
   answer. */
await p.reload({ waitUntil: 'networkidle' }); await sleep(1700);
const afterReloadRun = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('bk_daily5p') || 'null'));
ck('a reload costs exactly ONE card, not three',
   !!afterReloadRun && afterReloadRun.round === 1 && afterReloadRun.i === 4,
   afterReloadRun ? `round ${afterReloadRun.round} card ${afterReloadRun.i}` : 'none');
await openDaily(); await sleep(900);
const afterReload = await state();
ck('and it resumes there rather than restarting',
   afterReload.i === 4 && afterReload.round === 1, `i=${afterReload.i}`);

/* leaving with the tab, not the app */
/* backgrounding the tab is the mobile route and must behave identically */
const beforeHide = await state();
await p.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
});
await sleep(300);
const hidden = await p.evaluate(() => JSON.parse(localStorage.getItem('bk_daily5p') || 'null'));
/* Count the position across the whole run, not the index inside a round: card
   4 of round 1 advances to card 0 of round 2, which is +1 overall and looked
   like -4 to the first version of this check. */
const pos = s => (s.round - 1) * 5 + s.i;
ck('backgrounding the tab abandons the live card too, and only it',
   !!hidden && pos(hidden) === pos(beforeHide) + 1,
   hidden ? `pos ${pos(beforeHide)} -> ${pos(hidden)}` : 'nothing saved');

/* YESTERDAY SCORES AS IT STOOD */
/* Set the stale run AFTER the reload, not before: a reload fires the leave
   handlers, which would write today's run straight over it. That is correct
   behaviour and it ate the first version of this test. */
await p.reload({ waitUntil: 'networkidle' }); await sleep(1700);
await p.evaluate(() => {
  localStorage.setItem('bk_daily5p', JSON.stringify(
    { day: '2020-01-02', round: 2, i: 3, pts: 9, shots: [1,1,0,1,0], stops: [1,0,0,0,0] }));
});
await openDaily(); await sleep(900);
const hist = await p.evaluate(() => window.BKDaily._hist()['2020-01-02']);
ck('an unfinished run from an earlier day is BANKED, not resumed',
   !!hist && hist.p === 9, JSON.stringify(hist));
ck('and it scores exactly as it stood',
   !!hist && JSON.stringify(hist.s) === JSON.stringify([1,1,0,1,0]),
   hist ? JSON.stringify(hist.s) : '');
ck('the stale run is cleared so it cannot come back',
   !(await p.evaluate(() => localStorage.getItem('bk_daily5p'))));

ck('no page errors', errs.length === 0, errs[0]);
await b.close();
console.log(`\n  ${pass} passed, ${fails.length} failed`);
if (fails.length) { fails.forEach(f => console.log('   FAILED: ' + f)); process.exit(1); }
console.log('  ALL CHECKS PASS');

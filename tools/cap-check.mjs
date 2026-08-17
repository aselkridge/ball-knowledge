/* THE GRAD CAP MEANS YOU WON IT. :8899.

   game.js endShow() has kept one rule since the logo shipped: the cap crowns
   the winner and never the machine. A mark that shows up on an ordinary day
   means nothing the next time it appears, so the Daily Five inherits the rule
   rather than a second opinion about it.

   This gate is deliberately placement-AGNOSTIC. Aaron has not yet ruled on
   crown (on the PERFECT slam) versus stamp (on the receipt), so asserting
   either one would be a check that has to be rewritten the day he picks.
   What it asserts is the rule underneath both: a sweep carries the cap, a
   non-sweep never does, and wherever it lands it does not sit on the type.

   Sabotage-proved: dropping the `swept &&` guard in paintResult turns check 2
   red (cap on a 4/10 day); removing the thCapStamp/thPow cap call turns 1 red. */
import pw from 'playwright';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
let pass = 0; const fails = [];
const ck = (m, x, n) => { (x ? pass++ : fails.push(m));
  console.log(`  ${x ? 'PASS' : 'FAIL'}  ${m}${n ? '   [' + n + ']' : ''}`); };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio'] });
const errs = [];

/* plays a full ten, right or wrong to order, and reports what the ending drew.
   ALL TEN ANSWERS MATTER: "wrong" here means wrong on the last five only, so
   the run still reaches the same result panel by the same road. */
async function run(perfect) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1500);
  await p.evaluate(() => { window.BK._show('daily'); window.BKDaily.open(); });
  await sleep(900);
  /* the cap can be transient (crown) so it is RECORDED, not sampled: the
     same lesson as the count-up, AI-LEARNINGS 1.2gg. */
  await p.evaluate(() => {
    window.__cap = { seen: false, where: '' };
    new MutationObserver(ms => ms.forEach(m => [...m.addedNodes].forEach(n => {
      if (n.nodeType !== 1) return;
      const hit = n.matches && n.matches('.dv-cap,.dv-stamp') ? n
        : (n.querySelector && n.querySelector('.dv-cap,.dv-stamp'));
      if (hit) { window.__cap.seen = true; window.__cap.where = hit.className; }
    }))).observe(document.body, { childList: true, subtree: true });
  });
  /* DRIVE THE RUN BY ITS STATE, NEVER BY A STOPWATCH. The first version
     answered on a 1400ms metronome, which is long enough for a make and NOT
     long enough for a miss (the miss has its own beat), so the wrong-answer
     run desynced: it double-clicked the same card, landed 5 answers instead
     of 10, never reached the result panel, and the "no cap on an ordinary
     day" check passed on a screen that had no ending on it at all. A check
     that cannot fail is decoration. This waits for a genuinely NEW question
     (round:index changed) before answering, and the caller asserts that the
     run reached its ending, so a vacuous pass has to announce itself. */
  let last = null, guard = 0;
  while (guard++ < 140) {
    const st = await p.evaluate(() => {
      const D = window.BKDaily._state();
      return { phase: D.phase, round: D.round, i: D.i,
        up: !!document.querySelector('#dvCard .dva') &&
            !document.getElementById('dvCard').classList.contains('hide') };
    });
    if (st.phase === 'result') break;
    const key = st.round + ':' + st.i;
    if (st.up && key !== last) {
      /* round 1 is always answered right, so both runs reach the ending the
         same way and the only variable is the sweep itself */
      await p.evaluate(ok => {
        const D = window.BKDaily._state();
        const idxs = D.round === 1 ? D.set.shots : D.set.stops;
        const q = QUESTIONS[idxs[D.i]];
        const btns = [...document.querySelectorAll('#dvCard .dva')];
        btns[ok ? q.a : (q.a + 1) % btns.length].click();
      }, st.round === 1 ? true : perfect);
      last = key;
    }
    await sleep(250);
  }
  await sleep(2400);
  const out = await p.evaluate(() => {
    const cap = window.__cap;
    const el = document.querySelector('.dv-stamp,.dv-cap');
    let clash = 'n/a', bounds = 'n/a';
    if (el) {
      const r = el.getBoundingClientRect();
      clash = [...document.querySelectorAll('.dvresult .dvbig,.dvresult .dvptslbl,' +
        '.dvresult .dvsub,.dvresult .dvreceipt,.dvresult .dvbtn')].filter(e => {
        const t = e.getBoundingClientRect();
        return r.left < t.right && t.left < r.right && r.top < t.bottom && t.top < r.bottom;
      }).map(e => e.className).join(',') || 'clear';
      bounds = (r.left >= 0 && r.right <= window.innerWidth && r.top >= 0)
        ? 'inside' : `out l=${r.left.toFixed(0)} r=${(window.innerWidth - r.right).toFixed(0)} t=${r.top.toFixed(0)}`;
    }
    return { cap, clash, bounds, pts: (document.querySelector('.dvbig') || {}).textContent,
             /* the anti-vacuum field: did this run actually END? */
             ended: window.BKDaily._state().phase === 'result' &&
                    !document.getElementById('dvResult').classList.contains('hide'),
             mode: window.BKDaily._capMode() };
  });
  await ctx.close();
  return out;
}

const swept = await run(true);
const ord = await run(false);
/* BOTH ENDINGS FIRST, before anything is read off them. Without this the
   negative check below is satisfied by a run that simply never finished. */
ck('both runs reached an ending at all (or the rest of this proves nothing)',
   swept.ended === true && ord.ended === true,
   'sweep=' + swept.ended + ' ordinary=' + ord.ended);
ck('a 10/10 sweep carries the grad cap', swept.cap.seen === true,
   swept.mode + ' · ' + (swept.cap.where || 'no cap drawn') + ' · ' + swept.pts + ' pts');
ck('an ordinary day does NOT (the mark has to mean you won it)',
   ord.cap.seen === false && ord.ended === true,
   ord.pts + ' pts, cap=' + ord.cap.seen);
ck('the cap sits clear of the panel type', swept.clash === 'clear' || swept.clash === 'n/a',
   swept.clash);
ck('and fully inside the phone viewport', swept.bounds !== 'n/a' ? swept.bounds === 'inside' : true,
   swept.bounds);
ck('zero page errors', errs.length === 0, errs.join(' | ') || 'clean');

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED:\n  ` + fails.join('\n  ')
  : `\nALL ${pass} PASS`);
process.exit(fails.length ? 1 : 0);

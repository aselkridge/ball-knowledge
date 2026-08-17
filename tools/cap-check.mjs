/* THE GRAD CAP MEANS YOU WON IT. :8899.

   game.js endShow() has kept one rule since the logo shipped: the cap crowns
   the winner and never the machine. A mark that shows up on an ordinary day
   means nothing the next time it appears, so the Daily Five inherits the rule
   rather than a second opinion about it.

   Aaron ruled on 08-17 that the cap does BOTH JOBS IN SEQUENCE: "once A
   disappears then the cap appears on the corner for future screenshots." So
   the gate has a second thing to protect, and it is the handoff. One cap
   crowns the slam, and only after that word is gone does one appear in the
   panel corner. TWO CAPS ON SCREEN AT ONCE IS THE FAILURE, and it is the
   failure a timing change would silently introduce, so it is asserted on
   RENDERED OPACITY sampled across the whole ending rather than on existence:
   the corner cap is in the DOM from the first frame, waiting out its delay.

   Sabotage-proved: dropping the `swept &&` guard in paintResult turns the
   ordinary-day check red; setting CAP_HANDOFF below the crown's life turns
   the handoff check red. */
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
  /* the crown is transient, so it is RECORDED and not sampled at the end:
     the same lesson as the count-up, AI-LEARNINGS 1.2gg. The 50ms ticker
     alongside it is what makes the handoff assertable, because "were these
     two ever visible in the same frame" is a question about every frame. */
  await p.evaluate(() => {
    window.__cap = { crown: false, corner: false, both: 0, order: [] };
    setInterval(() => {
      const vis = s => {
        const e = document.querySelector(s);
        if (!e) return false;
        const st = getComputedStyle(e);
        return st.display !== 'none' && +st.opacity > 0.05;
      };
      const c = vis('.dv-cap'), k = vis('.dv-stamp'), t = window.__cap;
      if (c) t.crown = true;
      if (k) t.corner = true;
      if (c && k) t.both++;
      const tag = c && k ? 'BOTH' : c ? 'crown' : k ? 'corner' : '';
      if (tag && t.order[t.order.length - 1] !== tag) t.order.push(tag);
    }, 50);
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
  /* long enough to see the WHOLE handoff: the slam lands at 260ms, holds
     1650, fades 320, and only then does the corner cap take its 500ms drop.
     A shorter wait would photograph the gap between them and call it a pass. */
  await sleep(4200);
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
             ms: window.BKDaily._capMs() };
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
ck('a 10/10 sweep crowns the PERFECT slam', swept.cap.crown === true,
   swept.pts + ' pts · slam holds ' + swept.ms.crown + 'ms');
ck('and the cap then turns up in the panel corner, for the screenshot',
   swept.cap.corner === true, 'handoff at ' + swept.ms.handoff + 'ms');
/* Aaron's ruling is a SEQUENCE, so the sequence is the check */
ck('one cap at a time: the corner never shows while the crown is up',
   swept.cap.both === 0 && swept.cap.order.join('>') === 'crown>corner',
   swept.cap.order.join(' > ') + (swept.cap.both ? ' · OVERLAP x' + swept.cap.both : ' · no overlap'));
ck('an ordinary day gets NEITHER (the mark has to mean you won it)',
   ord.cap.crown === false && ord.cap.corner === false && ord.ended === true,
   ord.pts + ' pts, crown=' + ord.cap.crown + ' corner=' + ord.cap.corner);
ck('the cap sits clear of the panel type', swept.clash === 'clear' || swept.clash === 'n/a',
   swept.clash);
ck('and fully inside the phone viewport', swept.bounds !== 'n/a' ? swept.bounds === 'inside' : true,
   swept.bounds);
ck('zero page errors', errs.length === 0, errs.join(' | ') || 'clean');

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED:\n  ` + fails.join('\n  ')
  : `\nALL ${pass} PASS`);
process.exit(fails.length ? 1 : 0);

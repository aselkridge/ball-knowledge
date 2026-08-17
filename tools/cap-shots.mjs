/* THE GRAD CAP ON A SWEEP · the comparison shoot (Aaron, 08-17: "maybe we
   stamp my chosen grad cap logo?"). Three placements, two viewports, real
   sweeps played end to end, no posed screenshots: the harness answers ten
   questions correctly and photographs whatever the game actually does.

   'none' is the control and it is not optional. A lone "after" is a sales
   pitch (CLAUDE.md), so the board carries the ending as it ships today next
   to each candidate.

   Shots land in design/shots/cap/. :8899. */
import pw from 'playwright';
import fs from 'fs';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
const OUT = 'design/shots/cap';
fs.mkdirSync(OUT, { recursive: true });

const VIEWS = [
  { key: 'phone', width: 390, height: 844, mobile: true },
  { key: 'desk', width: 1280, height: 860, mobile: false },
];
const MODES = ['none', 'crown', 'stamp'];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio'] });
const errs = [];
const notes = [];

for (const v of VIEWS) {
  for (const mode of MODES) {
    const ctx = await b.newContext({ viewport: { width: v.width, height: v.height },
      hasTouch: v.mobile, isMobile: v.mobile });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(v.key + '/' + mode + ': ' + String(e).slice(0, 140)));
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
    await p.reload({ waitUntil: 'networkidle' });
    await sleep(1500);
    await p.evaluate(m => {
      window.BKDaily._setCapMode(m);
      window.BK._show('daily'); window.BKDaily.open();
    }, mode);
    await sleep(900);

    /* play a clean ten */
    const play = () => p.evaluate(() => {
      const D = window.BKDaily._state();
      const idxs = D.round === 1 ? D.set.shots : D.set.stops;
      const q = QUESTIONS[idxs[D.i]];
      [...document.querySelectorAll('#dvCard .dva')][q.a].click();
    });
    for (let n = 0; n < 5; n++) { await play(); await sleep(1400); }
    await sleep(2200);                       /* the round break */
    for (let n = 0; n < 4; n++) { await play(); await sleep(1400); }
    await play();                            /* the tenth, and the ending */

    /* THE CROWN LIVES 1.65s, so a fixed sleep after the last answer is a bet
       on where that window is and the first run lost it: every 'crown' cell
       came back empty because the shot landed 2.1s late (AI-LEARNINGS 1.2gg,
       learned on this same screen yesterday and repeated here anyway).
       So WAIT FOR THE ENDING, then shoot. Polling for .pow was the SECOND
       wrong answer: every correct answer slams one too, so the first fix
       photographed a mid-run word with the tenth card still on screen. The
       unambiguous marker for "the run is over" is the result panel, and the
       crown is fully landed 980ms after it (260 slam + 300 delay + 420 drop). */
    for (let t = 0; t < 80; t++) {
      if (await p.evaluate(() =>
        !document.getElementById('dvResult').classList.contains('hide'))) break;
      await sleep(80);
    }
    await sleep(1000);
    await p.screenshot({ path: `${OUT}/${v.key}-${mode}-beat.png` });
    /* and the panel a player is actually left looking at. 7s, not 3: the
       confetti runs up to 6.4s (2.4-4.8s fall + 1.6s stagger) and the first
       pass shot through it, which made every rest frame a picture of the
       confetti rather than of the cap being compared. */
    await sleep(7000);
    await p.screenshot({ path: `${OUT}/${v.key}-${mode}-rest.png` });

    const seen = await p.evaluate(() => ({
      crown: !!document.querySelector('.dv-cap'),
      stamp: !!document.querySelector('.dv-stamp'),
      /* does the stamp clear the type it sits beside? */
      clash: (() => {
        const s = document.querySelector('.dv-stamp');
        if (!s) return 'n/a';
        const r = s.getBoundingClientRect();
        const hits = [...document.querySelectorAll('.dvresult .dvbig,.dvresult .dvptslbl,' +
          '.dvresult .dvsub,.dvresult .dvreceipt,.dvresult .dvbtn')].filter(e => {
          const t = e.getBoundingClientRect();
          return r.left < t.right && t.left < r.right && r.top < t.bottom && t.top < r.bottom;
        }).map(e => e.className);
        return hits.length ? hits.join(',') : 'clear';
      })(),
      onscreen: (() => {
        const s = document.querySelector('.dv-stamp') || document.querySelector('.dv-cap');
        if (!s) return 'n/a';
        const r = s.getBoundingClientRect();
        return (r.left >= 0 && r.right <= window.innerWidth && r.top >= 0) ? 'fully on screen'
          : `clipped l=${r.left.toFixed(0)} r=${(window.innerWidth - r.right).toFixed(0)} t=${r.top.toFixed(0)}`;
      })(),
    }));
    notes.push(`${v.key}/${mode}: crown=${seen.crown} stamp=${seen.stamp} ` +
      `overlap=${seen.clash} bounds=${seen.onscreen}`);
    console.log('  shot  ' + v.key + ' · ' + mode + '   ' + notes[notes.length - 1]);
    await ctx.close();
  }
}
await b.close();
console.log('\n' + notes.join('\n'));
console.log(errs.length ? '\nPAGE ERRORS:\n' + errs.join('\n') : '\nzero page errors');

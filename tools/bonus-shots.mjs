/* THE HEAT CHECK ENDINGS, both of them (Aaron, 08-17: "Can you show me the
   bonus round ending, right and wrong answer"). :8899.

   Real runs only: sweep the ten, unlock the bonus, then either type the right
   name or a wrong one. The right name is read from the game's own hcPlayer()
   for the day, so the shoot cannot drift from the answer the mode expects.

   FOUR MOMENTS per outcome, because the ending is a sequence and one frame of
   it is a claim about the rest:
     1 the bonus screen with the clue up, before the buzz
     2 the verdict itself (THE ROOF IS OFF, or the reveal)
     3 the result panel it lands on
     4 the same panel once every effect has cleaned itself up

   Shots land in design/shots/bonus/. */
import pw from 'playwright';
import fs from 'fs';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
const OUT = 'design/shots/bonus';
fs.mkdirSync(OUT, { recursive: true });

const VIEWS = [
  { key: 'phone', width: 390, height: 844, mobile: true },
  { key: 'desk', width: 1280, height: 860, mobile: false },
];
const notes = [], errs = [];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio'] });

for (const v of VIEWS) {
  for (const right of [true, false]) {
    const tag = v.key + '-' + (right ? 'hit' : 'iced');
    const ctx = await b.newContext({ viewport: { width: v.width, height: v.height },
      hasTouch: v.mobile, isMobile: v.mobile });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(tag + ': ' + String(e).slice(0, 140)));
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
    await p.reload({ waitUntil: 'networkidle' });
    await sleep(1500);
    await p.evaluate(() => { window.BK._show('daily'); window.BKDaily.open(); });
    await sleep(900);

    /* sweep the ten, driven off state so a miss beat cannot desync it */
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
        await p.evaluate(() => {
          const D = window.BKDaily._state();
          const idxs = D.round === 1 ? D.set.shots : D.set.stops;
          const q = QUESTIONS[idxs[D.i]];
          [...document.querySelectorAll('#dvCard .dva')][q.a].click();
        });
        last = key;
      }
      await sleep(250);
    }
    await sleep(3200);                                  /* let the sweep settle */
    await p.click('#dvGo');                             /* Unlock the Heat Check */
    await sleep(1100);
    await p.screenshot({ path: `${OUT}/${tag}-1-clue.png` });

    /* the right name comes from the game, never from a list kept here */
    const answer = await p.evaluate(() => window.BKDaily._player(window.BKDaily._key()).name);
    const typed = right ? answer : 'Steve Nash';
    await p.fill('#dvGuess', typed);
    await p.click('#dvBuzz');
    await sleep(750);
    await p.screenshot({ path: `${OUT}/${tag}-2-verdict.png` });

    /* THE SIX POINTS NOW CLIMB (Aaron 08-17: "yes I want it to count up to
       30"), so the panel is RECORDED from the frame it appears, not sampled
       after: a 700ms count is over before a fixed sleep lands on it. */
    /* the recorder goes up BEFORE the panel does. Started after the poll it
       missed the first 360ms and reported the climb beginning at 26, which
       would have read as "it starts from the wrong number". */
    await p.evaluate(() => {
      window.__climb = [];
      setInterval(() => {
        const e = document.querySelector('.dvbig');
        if (!e) return;
        const v = e.textContent.trim();
        if (window.__climb[window.__climb.length - 1] !== v) window.__climb.push(v);
      }, 40);
    });
    for (let t = 0; t < 60; t++) {
      if (await p.evaluate(() =>
        !document.getElementById('dvResult').classList.contains('hide'))) break;
      await sleep(120);
    }
    await sleep(340);                    /* mid-climb, on purpose */
    await p.screenshot({ path: `${OUT}/${tag}-3-panel.png` });
    await sleep(6000);
    await p.screenshot({ path: `${OUT}/${tag}-4-rest.png` });

    const read = await p.evaluate(() => {
      const r = document.getElementById('dvResult');
      return {
        pts: (document.querySelector('.dvbig') || {}).textContent,
        receipt: (document.getElementById('dvReceipt') || {}).textContent || '',
        corner: !!document.querySelector('.dv-stamp'),
        hc: (window.BKDaily._state().hc || {}),
        climb: window.__climb || [],
        hidden: r.classList.contains('hide'),
      };
    });
    const hcline = (read.receipt.split('\n').find(l => l.startsWith('heat check')) || '?');
    notes.push(`${tag}: answered "${typed}" (real answer ${answer}) · ` +
      `${read.pts} pts · ${hcline} · got=${read.hc.got} clue=${read.hc.clue} · ` +
      `corner cap=${read.corner} · climb ${read.climb.join('>') || 'none'}`);
    console.log('  ' + notes[notes.length - 1]);
    await ctx.close();
  }
}
await b.close();
console.log('\n' + notes.join('\n'));
console.log(errs.length ? '\nPAGE ERRORS:\n' + errs.join('\n') : '\nzero page errors');

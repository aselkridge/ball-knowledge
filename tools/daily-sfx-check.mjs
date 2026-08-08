/* D3 + D1 — the Daily Five makes noise, and hover does not stick. :8899.

   The sound assertions do NOT listen for audio, which cannot be done headlessly
   and would be testing the browser rather than us. They record what the game
   ASKS FOR by wrapping BKAudio.sfx, which is the decision this change makes.
   Whether a swish sounds like a swish is Aaron's ear, not a harness. */
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

/* record every sound the game asks for, without playing any */
await p.evaluate(() => {
  window.__sfx = [];
  const real = window.BKAudio.sfx;
  window.BKAudio.sfx = n => { window.__sfx.push(n); };
  window.__realSfx = real;
});

await p.evaluate(() => { window.BK._show('daily'); window.BKDaily.open(); });
await sleep(900);
const started = await p.evaluate(() => !!document.querySelector('#dvCard .dva'));
ck('the Daily Five opens', started);

/* answer the first card correctly, then a later one wrongly */
const first = await p.evaluate(() => {
  const D = window.BKDaily._state();
  /* bare QUESTIONS, not window.QUESTIONS: questions.js declares it with
     const, which is a global binding but is NOT a property of window. */
  const idxs = D.set.shots, q = QUESTIONS[idxs[D.i]];
  const btns = [...document.querySelectorAll('#dvCard .dva')];
  btns[q.a].click();
  return { picked: q.a };
});
await sleep(300);
let heard = await p.evaluate(() => window.__sfx.slice());
ck('tapping a choice makes a sound', heard.includes('select'), heard.join(','));
ck('a RIGHT answer swishes', heard.includes('net'), heard.join(','));

await sleep(1400);
await p.evaluate(() => { window.__sfx = []; });
const wrong = await p.evaluate(() => {
  const D = window.BKDaily._state();
  const q = QUESTIONS[D.set.shots[D.i]];
  const btns = [...document.querySelectorAll('#dvCard .dva')];
  const bad = [0,1,2,3].find(i => i !== q.a && btns[i]);
  btns[bad].click();
  return bad;
});
await sleep(300);
heard = await p.evaluate(() => window.__sfx.slice());
ck('a WRONG answer bricks', heard.includes('brick'), heard.join(','));
ck('and does NOT swish', !heard.includes('net'), heard.join(','));

/* the module asks for a buzzer when the clock runs out, not a brick */
const src = await (await p.request.get(BASE + 'daily.js')).text();
ck('running out of time gets its own sound, not the brick',
   /ci===-1 \? 'buzzer'/.test(src));
ck('a perfect ten gets the horn', /swept \? 'horn'/.test(src));
ck('the round change is announced', /sfx\('whistle'\)/.test(src));

/* D1 — the hover rule is gated */
const gated = await p.evaluate(() => {
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const r of rules) {
      if (r.conditionText && /hover\s*:\s*hover/.test(r.conditionText)) {
        for (const inner of (r.cssRules || [])) {
          if (inner.selectorText && inner.selectorText.includes('.dva:hover')) return true;
        }
      }
    }
  }
  return false;
});
ck('D1 · the answer hover rule only applies to real pointers', gated);
const stuck = await p.evaluate(() => {
  const el = document.querySelector('#dvCard .dva');
  if (!el) return 'no button';
  return getComputedStyle(el).borderColor;
});
ck('D1 · a freshly built button is not wearing a hover border', !!stuck, stuck);

/* D2 — the voice. Every line lives in one block now, so assert on the block. */
const lines = await p.evaluate(() => {
  const D = window.BKDaily;
  return D._lines ? D._lines() : null;
});
ck('D2 · every spoken line is reachable in one block', !!lines);
if (lines) {
  const all = Object.values(lines).flat();
  ck('D2 · "I\'ll be back" is gone everywhere',
     !all.some(t => /be back/i.test(t)), all.filter(t=>/be back/i.test(t)).join(','));
  ck('D2 · misses get as many lines as makes',
     lines.miss1.length === lines.hit1.length &&
     lines.miss2.length === lines.hit2.length,
     `${lines.miss1.length}/${lines.hit1.length}`);
  ck('D2 · out-of-time has its own set per round, and rotates',
     lines.out1.length >= 4 && lines.out2.length >= 4 &&
     lines.out1[0] !== lines.out2[0]);
  ck('D2 · the bonus has hit, miss and out-of-time sets',
     lines.hc.length >= 4 && lines.hcNo.length >= 4 && lines.hcOut.length >= 4);
  ck('D2 · nothing promises the card will return',
     !all.some(t => /again|return|next time|come back/i.test(t)),
     all.filter(t=>/again|return|next time|come back/i.test(t)).join(','));
}
ck('no page errors', errs.length === 0, errs[0]);
await b.close();
console.log(`\n  ${pass} passed, ${fails.length} failed`);
if (fails.length) { fails.forEach(f => console.log('   FAILED: ' + f)); process.exit(1); }
console.log('  ALL CHECKS PASS');

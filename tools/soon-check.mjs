/* soon-check.mjs — the coming-soon page, checked instead of eyeballed.
   node tools/soon-check.mjs        (needs: python3 -m http.server 8899 in docs/)

   Why this file exists
   --------------------
   On 2026-08-06 the page shipped with an empty grey rectangle beside the third
   panel on Aaron's phone. I had verified it at 390px and it passed, because at
   390px two 190px columns do not fit and the grid collapses to one. His phone
   reports 440px. Two columns fit at 440, three items leave a fourth cell empty,
   and the empty cell painted grey.
   The bug was not the width I picked. The bug was that the layout depended on
   the item count at all, and that "I checked it on a phone" meant one phone.
   So this file checks the WIDTHS THAT EXIST, not the one I happened to open.

   And it checks SOUND BY ITS STATE, never by the button's colour. The button
   turning orange proves the click handler ran. It does not prove a single
   sample reached the speaker. Neutering play() (the last check below) makes the
   difference visible: the button still lights up, the audio is still silent. */

import { chromium } from 'playwright';

const URL = process.env.BK_URL || 'http://localhost:8899/soon/';
const EXE = '/opt/pw-browsers/chromium';

/* 320 is the smallest phone still in the wild; 440 is Aaron's; 768 and 1280
   straddle the two-column breakpoint. A width is only worth listing if it can
   fail differently from its neighbours. */
const WIDTHS = [320, 360, 390, 414, 440, 540, 768, 1024, 1280];

let pass = 0, fail = 0;
const ok  = (m, x) => { (x ? pass++ : fail++); console.log(`  ${x ? 'PASS' : 'FAIL'}  ${m}`); };

const b = await chromium.launch({ executablePath: EXE,
  args: ['--autoplay-policy=user-gesture-required'] });

/* ---------- layout, at every width ---------- */
console.log('\nLAYOUT');
for (const w of WIDTHS) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL, { waitUntil: 'load' });
  await p.waitForTimeout(350);

  const r = await p.evaluate(() => {
    const de = document.documentElement;
    const grid = document.querySelector('.four');
    const cards = [...grid.children];
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    /* THE ACTUAL BUG: a grid whose cell count is not a multiple of its column
       count leaves a hole. Assert the arithmetic, not the appearance. */
    const holes = (cols - (cards.length % cols)) % cols;
    const snd  = document.querySelector('.snd').getBoundingClientRect();
    const chip = document.querySelector('.chip').getBoundingClientRect();
    const collide = !(snd.right < chip.left || snd.left > chip.right ||
                      snd.bottom < chip.top || snd.top > chip.bottom);
    return { sideways: de.scrollWidth > de.clientWidth + 1, cols, cards: cards.length,
             holes, collide,
             tiny: [...document.querySelectorAll('.card p, .moat p')]
                     .some(e => parseFloat(getComputedStyle(e).fontSize) < 12) };
  });

  ok(`${String(w).padStart(4)}px  no sideways scroll`,        !r.sideways);
  ok(`${String(w).padStart(4)}px  grid has no empty cell   [${r.cards} cards / ${r.cols} cols]`, r.holes === 0);
  ok(`${String(w).padStart(4)}px  sound button clears the chip`, !r.collide);
  ok(`${String(w).padStart(4)}px  body text >= 12px`,          !r.tiny);
  ok(`${String(w).padStart(4)}px  no console errors`,          errs.length === 0);
  await p.close();
}

/* ---------- the words Aaron asked to be gone ---------- */
console.log('\nCOPY');
{
  const p = await b.newPage({ viewport: { width: 440, height: 900 } });
  await p.goto(URL, { waitUntil: 'load' });
  const t = await p.evaluate(() => document.documentElement.outerHTML);
  ok('no em dash anywhere        (Aaron, 08-06)', !t.includes('—'));
  ok('no en dash anywhere',                        !t.includes('–'));
  ok('"timing hands" is gone     (Aaron, 08-06)',  !/timing hands/i.test(t));
  ok('the Ketsa credit is on the page (CC BY 4.0 requires it)', /Ketsa/.test(t));
  ok('no link into the game      (it is a coming-soon page)',
     await p.$$eval('a', as => as.every(a => !/\/play\/?($|[?#])/.test(a.getAttribute('href') || ''))));
  await p.close();
}

/* ---------- sound, by its state ---------- */
console.log('\nSOUND');
{
  const p = await b.newPage({ viewport: { width: 440, height: 900 } });
  const mp3 = [];
  p.on('request', r => r.url().endsWith('.mp3') && mp3.push(r.url()));
  const state = () => p.evaluate(() => {
    const a = window.BKSOON && window.BKSOON.audio;
    return { on: document.querySelector('.snd').classList.contains('on'),
             exists: !!a, playing: !!a && !a.paused, vol: a ? a.volume : 0 };
  });

  await p.goto(URL, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  ok('3.2 MB track is NOT fetched until asked for', mp3.length === 0);

  await p.click('.snd'); await p.waitForTimeout(2200);
  let s = await state();
  ok('tap starts real playback  (not just the button)', s.playing);
  ok('volume faded up, no hard cut',                    s.vol > 0.4);
  ok('the track was fetched exactly once',              mp3.length === 1);

  await p.click('.snd'); await p.waitForTimeout(800);
  s = await state();
  ok('tap again actually stops it', !s.playing);

  await p.reload({ waitUntil: 'load' }); await p.mouse.click(220, 760);
  await p.waitForTimeout(1000);
  s = await state();
  ok('a "no" is remembered, page stays silent', !s.exists && !s.on);

  await p.click('.snd'); await p.waitForTimeout(400);
  await p.reload({ waitUntil: 'load' }); await p.mouse.click(220, 760);
  await p.waitForTimeout(1800);
  s = await state();
  ok('a "yes" is remembered, resumes on first touch', s.playing && s.on);
  await p.close();
}

/* ---------- break it on purpose ---------- */
console.log('\nBROKEN ON PURPOSE');
{
  const p = await b.newPage({ viewport: { width: 440, height: 900 } });
  await p.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.resolve(); });
  await p.goto(URL, { waitUntil: 'load' });
  await p.click('.snd'); await p.waitForTimeout(1500);
  const s = await p.evaluate(() => {
    const a = window.BKSOON && window.BKSOON.audio;
    return { looksOn: document.querySelector('.snd').classList.contains('on'),
             playing: !!a && !a.paused };
  });
  ok('with play() neutered the button STILL lights up', s.looksOn);
  ok('...and the sound check goes red anyway, so it bites', !s.playing);
  await p.close();
}

await b.close();
console.log(`\nsoon-check: ${pass} passed, ${fail} failed`);
console.log(fail ? '\nFAILURES ABOVE' : '\nALL CHECKS PASS');
process.exit(fail ? 1 : 0);

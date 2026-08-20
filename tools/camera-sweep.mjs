/* WHAT WOULD ACTUALLY MAKE THE BOARD BIGGER ON A PHONE (V0 row 22).

   The court is 20% of a 390x844 screen because at phone width the fit is
   WIDTH-limited and a basketball court is a wide, short shape: it can only be
   as tall as its aspect allows. So the question is which camera change buys
   back the most height, and the answer has to be measured, not modelled.

   I tried modelling it first and the model said the court was 324px tall when
   the real renderer says 171. Rather than debug a model whose only job is to
   predict something I can just measure, this drives the real thing: patch RZ
   and RX in flight, render, and ask the game how tall its court came out.

   RZ turns the court on the floor (-30 is the shipped three-quarter view, -90
   points it up the screen lengthwise). RX is the tilt measured from OVERHEAD,
   so SMALLER is more top-down and larger is more edge-on. I had that backwards
   once already. */
import pw from 'playwright';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const src = fs.readFileSync('docs/play/game.js', 'utf8');
const FIND = 'var RZ=-30*Math.PI/180,RX=57*Math.PI/180,PERSP=1400;';
if (src.indexOf(FIND) < 0) { console.error('camera line not found'); process.exit(1); }

const CAMS = [
  ['as it ships', -30, 57], ['more overhead', -30, 45], ['more overhead', -30, 38],
  ['more overhead', -30, 30], ['turned upright', -55, 57], ['turned upright', -55, 45],
  ['turned upright', -55, 38], ['lengthwise', -80, 45], ['lengthwise', -80, 38],
  ['lengthwise', -90, 42],
];

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });
let base = 0;
console.log('measured on a real 390x844 render, court height from the game\'s own projection\n');
console.log('camera'.padEnd(34) + 'court h'.padStart(9) + 'vs now'.padStart(8) + '% screen'.padStart(10));
for (const [lab, rz, rx] of CAMS) {
  const body = src.replace(FIND, `var RZ=${rz}*Math.PI/180,RX=${rx}*Math.PI/180,PERSP=1400;`);
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.route('**/play/game.js*', r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
  await page.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await page.reload({ waitUntil: 'networkidle' });
  await sleep(1100);
  await page.evaluate(() => {
    const B = window.BK, K = B.coach;
    K.applyColors({ nm: 'Lakers', ab: 'LAL' }, { nm: 'Celtics', ab: 'BOS' });
    K.startGame({ league: 'nba', decade: 'ANY', target: 11, rosters: K.pickRosters('nba', 'ANY') }, true);
    B._show('game');
  });
  await sleep(2400);
  await page.evaluate(() => document.body.classList.add('reduce-motion'));
  await sleep(500);
  const h = await page.evaluate(() => { const s = window.BK._courtY(); return s.bottom - s.top; });
  if (!base) base = h;
  const tag = `${lab}  RZ ${rz} / RX ${rx}`;
  console.log(tag.padEnd(34) + (Math.round(h) + 'px').padStart(9) +
    (h / base).toFixed(2).padStart(7) + 'x' + (h / 844 * 100).toFixed(1).padStart(9) + '%');
  await page.screenshot({ path: `design/shots/board2/cam-${rz}-${rx}.png` });
  await ctx.close();
}
await b.close();

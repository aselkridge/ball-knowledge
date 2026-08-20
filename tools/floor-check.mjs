/* THE FLOOR GATE (Aaron ruled it 08-19, after catching a bug six suites
   missed: "why do all my floors look the same... what has happened?!!!
   This is devastating").

   Suites assert BEHAVIOR and are blind to colour, so the day an overlay
   painted across the court every court family rendered as the same brown
   mush and every gate stayed green. This one looks at pixels.

   THE FIRST VERSION OF THIS GATE FAILED ITS OWN SABOTAGE PROOF, and the
   reason is worth keeping. It only compared the floors to EACH OTHER:
   are any two families the same colour, and does each have some grain.
   Re-introducing the real bug left both rules green, because the overlay
   darkened all five floors TOGETHER (hardwood 202,139,68 -> 68,52,32)
   so the gaps between them survived, and it was semi-transparent so the
   grain bled through. A relative test cannot see a change that moves
   everything at once. So this version anchors on ABSOLUTE colour.

   What it holds:
   1. The DEFAULT court loads real art. Hardwood since his 08-19 ruling,
      and hardwood must not render as the art-less Classic.
   2. Every family renders the colour its ART renders, within tolerance of
      a recorded anchor. This is the rule with teeth: anything painting
      over the deck moves these numbers a long way.
   3. No two families collapse onto each other.
   4. The floor keeps its grain. A photographed court varies; a patch with
      no spread is a solid fill wearing a floor's name.

   HOW THE ANCHORS ARE MEASURED, and why they are trustworthy: thirty 14px
   patches across the deck, MEDIAN per channel. The median is what makes it
   stable, because it throws away the players, the paint and the lines
   standing on those patches. Measured twice in one session and once in a
   fresh browser with new rosters, all three runs returned identical RGB.
   So the tolerance below is loose against a drift of zero, and tight
   against the bug, which moved hardwood by 189.

   RE-BASELINING IS DELIBERATE, never a reflex. If art is legitimately
   retuned this gate goes red, and that is the gate working. Re-measure
   with tools/floor-check.mjs --anchors, read the numbers, and paste them
   in with the date. Never widen the tolerance to make a red go away.

   Serve docs/ on :8899, run from the repo root. */
import pw from 'playwright';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fails = [];
const ck = (c, m, x) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m + (x ? '   [' + x + ']' : '')); if (!c) fails.push(m); };

/* measured 2026-08-19 on the four-band apron, hardwood default.
   rgb is the median of the deck; sp is the median grain of a patch. */
const ANCHOR = {
  'classic-a':    { rgb: [155, 110, 73], sp: 15.5 },
  'hardwood-a':   { rgb: [202, 139, 68], sp: 21.8 },
  'blacktop-a':   { rgb: [88, 75, 66],   sp: 17.5 },
  'cosmic-a':     { rgb: [42, 34, 47],   sp: 8.4 },
  'underwater-a': { rgb: [160, 123, 76], sp: 21.6 },
};
const TOL = 24;   /* total RGB distance. Observed run-to-run drift: 0. */
const SPTOL = 5;  /* grain may wobble a little; a flattening will not. */
const ANCHORS_ONLY = process.argv.includes('--anchors');

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });
const page = await (await b.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 140)));
await page.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
await page.reload({ waitUntil: 'networkidle' });
await sleep(1100);

/* 1 · the DEFAULT, with nothing chosen: whatever a fresh phone gets */
const dflt = await page.evaluate(() => window.BK._cfg().court);
if (!ANCHORS_ONLY) ck(dflt === 'hardwood-a', 'default · a fresh phone starts on the sourced hardwood court', dflt);

await page.evaluate(() => {
  const B = window.BK, K = B.coach;
  K.startGame({ league: 'nba', decade: 'ANY', target: 11, rosters: K.pickRosters('nba', 'ANY') }, true);
  B._show('game');
});
await sleep(1800);

/* thirty patches across the deck, median per channel */
async function floor(court) {
  return await page.evaluate(async k => {
    window.BK._court(k);
    await new Promise(r => setTimeout(r, 2300));
    const c = document.getElementById('court'), cx = c.getContext('2d');
    const R = [], G = [], B2 = [], SP = [];
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 6; gx++) {
      const x = Math.round(c.width * (.13 + .74 * (gx + .5) / 6)) - 7;
      const y = Math.round(c.height * (.22 + .58 * (gy + .5) / 5)) - 7;
      const px = cx.getImageData(x, y, 14, 14).data;
      let r = 0, g = 0, bb = 0; const v = [];
      for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; bb += px[i + 2]; v.push(px[i]); }
      const n = px.length / 4, mr = r / n;
      R.push(mr); G.push(g / n); B2.push(bb / n);
      SP.push(Math.sqrt(v.reduce((a, q) => a + (q - mr) * (q - mr), 0) / n));
    }
    const med = a => { const s = a.slice().sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
    return { rgb: [Math.round(med(R)), Math.round(med(G)), Math.round(med(B2))], sp: Math.round(med(SP) * 10) / 10 };
  }, court);
}

const dist = (a, z) => Math.abs(a[0] - z[0]) + Math.abs(a[1] - z[1]) + Math.abs(a[2] - z[2]);
const FAMS = Object.keys(ANCHOR);
const seen = {};
for (const f of FAMS) seen[f] = await floor(f);

if (ANCHORS_ONLY) {
  console.log('  re-baseline · paste these in with today\'s date:');
  for (const f of FAMS) console.log("  '" + f + "':".padEnd(18) + '{ rgb: [' + seen[f].rgb.join(', ') + '], sp: ' + seen[f].sp + ' },');
  await b.close();
  process.exit(0);
}

/* 2 · the rule with teeth: each floor renders the colour its art renders */
for (const f of FAMS) {
  const d = dist(seen[f].rgb, ANCHOR[f].rgb);
  ck(d <= TOL, 'art · ' + f + ' renders its own floor, nothing painted over it',
    'rgb ' + seen[f].rgb.join(',') + '  off anchor by ' + d + ' of ' + TOL);
}

/* 3 · and no two families collapse onto each other. The threshold is low
   on purpose: Classic and Underwater are genuinely similar warm woods
   (21 apart at their anchors), so this catches a collapse, not a clash.
   Rule 2 is what holds each one honest. */
let worst = 1e9, pair = '';
for (let i = 0; i < FAMS.length; i++) for (let j = i + 1; j < FAMS.length; j++) {
  const d = dist(seen[FAMS[i]].rgb, seen[FAMS[j]].rgb);
  if (d < worst) { worst = d; pair = FAMS[i] + ' vs ' + FAMS[j]; }
}
ck(worst >= 12, 'distinct · no two court families collapse onto one floor', 'closest ' + pair + ' = ' + worst);

/* 4 · still a photograph, not a fill */
for (const f of FAMS) {
  const g = seen[f].sp;
  ck(Math.abs(g - ANCHOR[f].sp) <= SPTOL && g >= 4,
    'grain · ' + f + ' keeps the variation of a real floor', 'spread ' + g + ' vs ' + ANCHOR[f].sp);
}

ck(errs.length === 0, 'zero page errors', errs.join(' | '));
await b.close();
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nALL CHECKS PASS');
process.exit(fails.length ? 1 : 0);

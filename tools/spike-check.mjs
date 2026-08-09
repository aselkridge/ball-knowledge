/* THE PLACES spike, checked. Version one shipped a page Aaron could not use on
 * a phone and I did not find out until he told me, because nothing here
 * measured it. So this measures it.
 *
 *   node tools/spike-check.mjs
 *
 * The checks that matter are the MECHANISM ones, not the "does it load" ones.
 * A parallax that isn't parallax still renders beautifully, so the near layer's
 * scale is read back off the element and compared to the world's. Set
 * NEAR_RATE to 1 in tools/spike-build.py and rebuild: checks 9 and 10 fail.
 */
import { chromium } from 'playwright';

const URL = 'file://' + process.cwd() + '/docs/dev/places-spike.html';
let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}${detail ? '  ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? '  ' + detail : ''}`); }
};
const scaleOf = m => {                       // "matrix(a,b,c,d,e,f)" -> a
  const n = /matrix\(([-\d.]+)/.exec(m);
  return n ? +n[1] : (m === 'none' ? 1 : NaN);
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox', '--mute-audio'] });

for (const [tag, w, h, mobile] of [['phone', 390, 844, true], ['desktop', 1440, 900, false]]) {
  console.log(`\n== ${tag} ${w}x${h} ==`);
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile,
                                 hasTouch: mobile, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(URL);
  await p.waitForTimeout(500);

  // ---- 1-4  the bug Aaron actually hit -------------------------------------
  const lay = await p.evaluate(() => ({
    meta: !!document.querySelector('meta[name=viewport]'),
    charset: document.characterSet,
    middot: (document.querySelector('.eyebrow')||{}).textContent||'',
    layout: document.documentElement.clientWidth,
    place: document.getElementById('pl').getBoundingClientRect().width,
    ring: document.querySelector('.hs .ring').getBoundingClientRect().width,
    turn: document.getElementById('tr').getBoundingClientRect().width,
  }));
  // ON GLASS, not in layout pixels. A 44px ring inside a 980px layout viewport
  // squeezed onto a 390px phone is 17.5px of actual finger, and the first
  // version of this check happily passed it at "44px". getBoundingClientRect
  // measures the layout, and the layout is the thing that was wrong.
  const onGlass = v => v * (w / lay.layout);
  ok('viewport meta present', lay.meta);
  // the encoding half of the same bug. A page with no declared charset is read
  // as windows-1252 and every middot in this game's favourite separator turns
  // into "Â·". It showed up in a screenshot before it showed up in a check.
  ok('the document is UTF-8', lay.charset === 'UTF-8', lay.charset);
  ok('no mojibake in the eyebrow', !/\u00c2/.test(lay.middot),
     JSON.stringify(lay.middot.slice(0, 34)));
  ok('layout viewport is the device', lay.layout === w, `${lay.layout}px`);
  ok('the frame fills the phone', tag !== 'phone' || lay.place > 330, `${lay.place.toFixed(0)}px`);
  ok('hotspot ring is a real touch target ON GLASS', onGlass(lay.ring) >= 44,
     `${onGlass(lay.ring).toFixed(1)}px of finger (${lay.ring}px in layout)`);
  ok('turn arrow is a real touch target ON GLASS', onGlass(lay.turn) >= 36,
     `${onGlass(lay.turn).toFixed(1)}px`);

  // ---- 5-8  the picture and the layers exist -------------------------------
  const has = await p.evaluate(() => ({
    cam: getComputedStyle(document.querySelector('.fa .cam')).backgroundImage.startsWith('url("data:image/webp'),
    near: getComputedStyle(document.querySelector('.fa .near')).backgroundImage.includes('svg'),
    parOn: document.getElementById('pl').classList.contains('par'),
    fonts: getComputedStyle(document.querySelector('h1')).fontFamily.includes('Anton'),
    hs: document.querySelectorAll('.hs').length,
  }));
  ok('the world layer has the photograph', has.cam);
  ok('the near layer has its cutout', has.near);
  ok('and it is ON by default, which Aaron ruled on 08-09', has.parOn);
  ok('the display face loaded', has.fonts);
  ok('three hotspots', has.hs === 3, `${has.hs}`);
  // THE CHECK THAT WOULD HAVE CAUGHT IT. A hotspot can be the right size, in
  // the right place, and still be unreachable, because inside a 3D rendering
  // context z-index is ignored and everything sorts by depth. Ask the browser
  // what is actually on top at the middle of each ring.
  const top = await p.evaluate(() => [...document.querySelectorAll('.hs')].map(e => {
    const r = e.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return hit && e.contains(hit) ? 'ok' : (hit ? hit.className : 'nothing');
  }));
  ok('every hotspot is the topmost thing at its own centre',
     top.every(t => t === 'ok'), top.join(' / '));

  // ---- 9-10  THE MECHANISM. the near field must move FURTHER ---------------
  await p.click('.hs[data-nm="The gate"]');
  await p.waitForTimeout(1400);
  const sc = await p.evaluate(() => ({
    cam: getComputedStyle(document.querySelector('.fa .cam')).transform,
    near: getComputedStyle(document.querySelector('.fa .near')).transform,
    api: window.BKSpike(),
  }));
  const zc = scaleOf(sc.cam), zn = scaleOf(sc.near);
  ok('the world scaled in', zc > 1.5, `world ${zc.toFixed(3)}`);
  ok('the near field scaled FURTHER than the world', zn > zc + 0.3,
     `near ${zn.toFixed(3)} vs world ${zc.toFixed(3)}  (ratio ${(( zn - 1) / (zc - 1)).toFixed(2)})`);

  // ---- 11-12  the bob fires and then stops ---------------------------------
  await p.click('#bk'); await p.waitForTimeout(120);
  const mid = await p.evaluate(() => document.getElementById('rig').classList.contains('walking'));
  await p.waitForTimeout(1400);
  const end = await p.evaluate(() => document.getElementById('rig').classList.contains('walking'));
  ok('the head bobs during the move', mid);
  ok('and stops when you arrive', !end);

  // ---- 13-15  turning, which is the thing a flat push-in cannot do ----------
  const before = await p.evaluate(() => ({
    x: getComputedStyle(document.querySelector('.fa .cam')).backgroundPositionX,
    pins: getComputedStyle(document.getElementById('pins')).transform,
  }));
  await p.click('#tr'); await p.waitForTimeout(1400);
  const after = await p.evaluate(() => ({
    x: getComputedStyle(document.querySelector('.fa .cam')).backgroundPositionX,
    pins: getComputedStyle(document.getElementById('pins')).transform,
    pan: window.BKSpike().pan,
  }));
  ok('turning pans the world', before.x !== after.x, `${before.x} -> ${after.x}`);
  ok('the hotspots pan with it', before.pins !== after.pins);
  ok('and the pan is bounded', after.pan > 50 && after.pan <= 100, `pan ${after.pan}`);

  // ---- 16-17  the A/B really is an A/B -------------------------------------
  await p.click('#bk'); await p.waitForTimeout(1300);
  await p.click('#bz'); await p.waitForTimeout(200);
  const zoomState = await p.evaluate(() => ({
    walking: document.getElementById('rig').classList.contains('walking'),
    par: document.getElementById('pl').classList.contains('par'),
  }));
  ok('ZOOM turns the bob off', !zoomState.walking);
  ok('ZOOM turns the near layer off', !zoomState.par);
  await p.waitForTimeout(1500);
  const restored = await p.evaluate(() => window.BKSpike());
  ok('and gives them back afterwards', restored.bob && restored.par && restored.steps);

  // ---- THE PIVOT. Three modes, and each one has to actually reach facing B
  // and actually come back. The near-miss this guards is a mode that LOOKS
  // like it turned because the class flipped, while the face underneath never
  // changed and you are still staring at the same photograph.
  await p.click('#bk'); await p.waitForTimeout(1400);
  const faceBg = i => p.evaluate(n => getComputedStyle(
      document.querySelectorAll('.face')[n].querySelector('.cam')).backgroundImage.slice(0, 60),
      i);
  const [bgA, bgB] = [await faceBg(0), await faceBg(1)];
  ok('the two facings are two different pictures', bgA !== bgB && bgB.startsWith('url("data:image/webp'));

  for (const [id, mode] of [['#ms', 'swing'], ['#mw', 'whip'], ['#mc', 'cut']]) {
    await p.click(id); await p.waitForTimeout(200);
    const start = await p.evaluate(() => window.BKSpike());
    await p.click('#pv'); await p.waitForTimeout(1600);
    const mid = await p.evaluate(() => ({ s: window.BKSpike(),
      cls: document.getElementById('pl').className }));
    await p.click('#pv'); await p.waitForTimeout(1600);
    const end = await p.evaluate(() => window.BKSpike());
    ok(`${mode}: starts on facing A`, start.face === 0 && start.mode === mode);
    ok(`${mode}: pivots to facing B`, mid.s.face === 1 && / b( |$)/.test(' ' + mid.cls + ' '),
       `face ${mid.s.face}`);
    ok(`${mode}: pivots back to A`, end.face === 0, `face ${end.face}`);
  }
  // switching mode must not strand you on the far side
  await p.click('#pv'); await p.waitForTimeout(1600);
  await p.click('#ms'); await p.waitForTimeout(200);
  const afterSwitch = await p.evaluate(() => window.BKSpike());
  ok('changing mode returns you to facing A', afterSwitch.face === 0 && afterSwitch.z === 1);

  await c.close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

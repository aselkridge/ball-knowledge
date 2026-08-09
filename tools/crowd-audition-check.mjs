/* Checks for the crowd audition page (docs/dev/crowd-audition.html).
 *
 *   node tools/crowd-audition-check.mjs [path.html]
 *
 * What a muted headless CAN prove: the page boots, every inlined source
 * decodes through the atob path (the CSP-proof one, AI-LEARNINGS 2.6w),
 * playing a candidate actually starts playback, picks persist and copy out,
 * and every control is reachable and finger-sized on a phone. Whether any
 * candidate SOUNDS like the right crowd is Aaron's half, by design.
 */
import { chromium } from 'playwright';

const PAGE = 'file://' + (process.argv[2]
  ? new URL(process.argv[2], 'file://' + process.cwd() + '/').pathname
  : process.cwd() + '/docs/dev/crowd-audition.html');

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${extra ? '  ' + extra : ''}`);
  cond ? pass++ : fail++;
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });

for (const [label, vp] of [['phone 390x844', { width: 390, height: 844 }],
                           ['desktop 1280x950', { width: 1280, height: 950 }]]) {
  console.log(`\n== ${label} ==`);
  const c = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const p = await c.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(PAGE);
  await p.waitForTimeout(400);

  ok('page boots with no errors', errs.length === 0, errs[0] || '');
  ok('viewport meta + UTF-8', await p.evaluate(() =>
    !!document.querySelector('meta[name="viewport"]') &&
    /utf-8/i.test(document.characterSet)));
  // the CSP lesson, enforced here too: zero fetch( anywhere in page scripts
  ok('no fetch() in any script: CSP-proof audio path', await p.evaluate(() =>
    [...document.querySelectorAll('script')]
      .map(s => s.textContent).join('').split('fetch(').length - 1 === 0),
    (await p.evaluate(() => [...document.querySelectorAll('script')]
      .map(s => s.textContent).join('').split('fetch(').length - 1)) + ' found');
  ok('no horizontal overflow', await p.evaluate(() =>
    document.documentElement.scrollWidth <= innerWidth),
    await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) + 'px');

  const counts = await p.evaluate(() => ({
    rows: document.querySelectorAll('.row').length,
    sections: document.querySelectorAll('section').length,
    srcs: BKCrowd._srcs.length,
  }));
  ok('9 candidates x 3 endings, 4 sources', counts.rows === 27 &&
     counts.sections === 3 && counts.srcs === 4,
     `${counts.rows} rows, ${counts.sections} sections, ${counts.srcs} srcs`);

  // every source decodes through the atob path, and playing counts a play
  await p.evaluate(() => {
    BKCrowd.play('fin', 'roar-rise');   // crowd-cheer
    BKCrowd.play('fin', 'react-a');     // crowd-cheer-reacting
    BKCrowd.play('fin', 'pa-swell');    // crowd-bed-pa
    BKCrowd.play('fin', 'squeak-a');    // crowd-bed-squeaks
  });
  await p.waitForFunction(() => Object.keys(BKCrowd._bufs()).length === 4,
                          null, { timeout: 15000 }).catch(() => {});
  const bufs = await p.evaluate(() => BKCrowd._bufs());
  ok('all four sources decode in the page', Object.keys(bufs).length === 4,
     JSON.stringify(bufs));
  ok('durations match the manifest measurements',
     Math.abs((bufs['crowd-cheer.mp3'] || 0) - 16.27) < 0.5 &&
     Math.abs((bufs['crowd-bed-pa.mp3'] || 0) - 111.84) < 0.5);
  ok('plays actually started', await p.evaluate(() => BKCrowd._plays()) >= 1,
     'plays=' + await p.evaluate(() => BKCrowd._plays()));

  // picks persist and copy out
  await p.evaluate(() => localStorage.removeItem('bk_crowd_picks'));
  await p.click('#s-fin .row[data-c="react-b"] .pick');
  await p.click('#s-roof .row[data-c="roar-rise"] .pick');
  const st = await p.evaluate(() => ({
    bar: document.getElementById('st').textContent,
    onRows: document.querySelectorAll('.row.on').length,
    stored: JSON.parse(localStorage.getItem('bk_crowd_picks') || '{}'),
  }));
  ok('a pick lights its row and lands in the bar', st.onRows === 2 &&
     /reacting crowd, second swell/.test(st.bar) && /SWEPT: –/.test(st.bar));
  ok('picks persist', st.stored.fin === 'react-b' && st.stored.roof === 'roar-rise');
  await p.reload(); await p.waitForTimeout(300);
  ok('...across a reload', await p.evaluate(() =>
    document.querySelectorAll('.row.on').length) === 2);

  // every control reachable at its centre and >=30px on glass
  const ctrls = await p.evaluate(() => {
    const dw = Math.min(390, innerWidth), scale = Math.min(1, dw / document.documentElement.scrollWidth);
    return [...document.querySelectorAll('button')].map(el => {
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { reach: el.contains(hit) || (hit && hit.contains(el)),
               glass: Math.min(r.width, r.height) * scale };
    });
  });
  ok('every control is reachable at its own centre',
     ctrls.every(x => x.reach), `${ctrls.length} controls`);
  if (vp.width === 390)
    ok('every control clears 30px of finger on glass',
       ctrls.every(x => x.glass >= 30),
       'smallest ' + Math.min(...ctrls.map(x => x.glass)).toFixed(1) + 'px');

  await c.close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

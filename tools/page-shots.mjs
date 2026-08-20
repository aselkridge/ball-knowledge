/* Shoot a LOCAL HTML page (an artifact, a mockup) at both viewports in both
   themes, so a comparison page gets the same verification the game does before
   Aaron is asked to look at it.

   Every artifact tool here was re-writing this loop inline or, worse, skipping
   it and publishing unseen. An artifact is a visual deliverable: it has to be
   checked at 390 and in dark, where the house tokens actually get exercised.

   usage:  node tools/page-shots.mjs design/head-compare.html design/shots/head
   Run from the repo root, otherwise node cannot resolve playwright. */
import pw from 'playwright';
import fs from 'fs';
import path from 'path';

const [file, outdir] = process.argv.slice(2);
if (!file || !outdir) { console.error('usage: node tools/page-shots.mjs <file.html> <outdir>'); process.exit(1); }
if (!fs.existsSync(file)) { console.error('no such file: ' + file); process.exit(1); }
fs.mkdirSync(outdir, { recursive: true });

const VIEWS = { desk: { width: 1280, height: 900 }, phone: { width: 390, height: 844 } };
const url = 'file://' + path.resolve(file);
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let bad = 0;

for (const [vk, vp] of Object.entries(VIEWS)) {
  for (const theme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, colorScheme: theme });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e).slice(0, 140)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    /* A page that scrolls sideways is broken on a phone, and it is the single
       most common way these comparison pages fail, because a wide screenshot
       inside a grid does not shrink on its own. */
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 1) { console.error(`  ${vk}/${theme} SCROLLS SIDEWAYS by ${over}px`); bad++; }
    if (errs.length) { console.error(`  ${vk}/${theme} page errors: ` + errs.join(' | ')); bad++; }
    await page.screenshot({ path: `${outdir}/${vk}-${theme}.png`, fullPage: true });
    console.log(`  ${vk}-${theme}`);
    await ctx.close();
  }
}
await b.close();
console.log(bad ? `FAIL: ${bad} problem(s)` : 'clean: no sideways scroll, no page errors');
process.exit(bad ? 1 : 0);

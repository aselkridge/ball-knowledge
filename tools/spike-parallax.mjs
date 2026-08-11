/* HOW MUCH OF THE SCREEN IS THE NEAR LAYER ACTUALLY WORTH?
 *
 *   node tools/spike-parallax.mjs <outdir>
 *   python3 tools/pxdiff.py <outdir>/near-home-on.png <outdir>/near-home-off.png home
 *   python3 tools/pxdiff.py <outdir>/near-mid-on.png  <outdir>/near-mid-off.png  mid
 *
 * spike-check.mjs proves the near layer SCALES further than the world. That is
 * the mechanism and it is not the same question as whether you can SEE it.
 * This shoots the frame with the layer on and off at three moments and diffs
 * the pixels.
 *
 * The first version of this measured only the DESTINATION and reported 0.3%,
 * which reads as "the parallax does nothing". It was measuring the one moment
 * where the near field is correctly gone, because you have walked past it.
 * Measured 2026-08-09 at 390px:
 *
 *     at rest, at home     8 to 9% of the frame,  worst channel delta 131
 *     mid walk            over 80% of the frame,  worst channel delta 220
 *     arrived              0.3% of the frame      (correct: it is behind you)
 *
 * The mid-walk figure is a sample of a moving thing, taken 450ms in, so it
 * varies a point or two between runs. Quoted as "over 80%" for that reason
 * rather than to one decimal place it has not earned.
 *
 * A measurement taken at the wrong moment is not a small error. It is the
 * opposite answer.
 */
import {chromium} from 'playwright';
import fs from 'node:fs';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const p=await c.newPage(); await p.goto('file:///home/user/ball-knowledge/docs/dev/places-spike.html');
await p.waitForTimeout(600);
fs.mkdirSync(SP,{recursive:true});
const shot=async n=>{fs.writeFileSync(`${SP}/near-${n}.png`, await p.locator('#pl').screenshot());};
for (const [tag, prep] of [['home', async()=>{}],
                           ['mid',  async()=>{await p.click('.hs[data-nm="The gate"]'); await p.waitForTimeout(450);}]]) {
  await p.evaluate(()=>{document.getElementById('bk').click()}); await p.waitForTimeout(1300);
  await p.evaluate(()=>{if(!window.BKSpike().par)document.getElementById('cp').click()}); await p.waitForTimeout(400);
  await prep(); await shot(tag+'-on');
  await p.evaluate(()=>document.getElementById('cp').click()); await p.waitForTimeout(60);
  await shot(tag+'-off');
  await p.evaluate(()=>document.getElementById('cp').click());
}
await b.close();

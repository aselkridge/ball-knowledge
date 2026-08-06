/* Before/after for the title screen: the phantom scroll cue and the Daily
 * Five stamp's resting affordance.
 * The BEFORE is minted out of git, never from a working copy -- a .bak was
 * used as a baseline once here and it already contained two of the changes
 * it was supposed to be the control for. */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const REF = process.env.REF || 'HEAD';
const OUT = process.env.OUT || 'docs/dev/menu';
fs.mkdirSync(OUT, { recursive: true });
const TMP = 'docs/play/_before.html';
fs.writeFileSync(TMP, execSync(`git show ${REF}:docs/play/index.html`, { encoding: 'utf8' }));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox', '--mute-audio'] });
const VPS = [['desktop', 1440, 900], ['phone', 390, 844]];
const report = [];
for (const [tag, w, h] of VPS) {
  for (const [side, file] of [['before', TMP], ['after', 'docs/play/index.html']]) {
    const c = await b.newContext({ viewport: { width: w, height: h } });
    const p = await c.newPage();
    await p.goto('file:///home/user/ball-knowledge/' + file);
    await p.waitForTimeout(2000);
    const m = await p.evaluate(() => {
      const sc = document.getElementById('screen-title');
      const hint = document.getElementById('scrollHint');
      const st = document.getElementById('dailyStamp');
      return { overflow: sc.scrollHeight - sc.clientHeight,
               hintOn: hint.classList.contains('on'),
               stampShadow: st ? getComputedStyle(st).boxShadow.slice(0, 60) : null };
    });
    report.push(`${tag}/${side}: overflow ${m.overflow}px · chevron ${m.hintOn ? 'SHOWN' : 'hidden'}`);
    await p.screenshot({ path: `${OUT}/${tag}-${side}.png` });
    /* and the stamp on its own, hovered, because the affordance is the point */
    if (tag === 'desktop') {
      /* clip a PADDED region, not the element: box-shadow lives outside the
         element box, so an element screenshot crops off the very halo this
         change is about. That is how the first pass looked like it had done
         nothing. */
      const box = await p.evaluate(() => {
        const r = document.getElementById('dailyStamp').getBoundingClientRect();
        const pad = 34;
        return { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad),
                 width: r.width + pad * 2, height: r.height + pad * 2 };
      });
      /* both ends of the breath, so the range is visible and not one lucky frame */
      for (const [when, delay] of [['dim', 0], ['lit', 1400]]) {
        await p.evaluate(() => {
          const st = document.getElementById('dailyStamp');
          st.style.animation = 'none'; void st.offsetWidth; st.style.animation = '';
        });
        await p.waitForTimeout(delay);
        await p.screenshot({ path: `${OUT}/stamp-${side}-${when}.png`, clip: box });
      }
      const st = await p.$('#dailyStamp');
      if (st) { await st.hover(); await p.waitForTimeout(500);
        await p.screenshot({ path: `${OUT}/stamp-${side}-hover.png`, clip: box }); }
    }
    await c.close();
  }
}
await b.close();
fs.unlinkSync(TMP);
console.log(report.join('\n'));

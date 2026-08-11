/* Before/after shots of round 2: stop strip (HEAD) vs defend-the-floor (tree).
   Baseline comes from `git show HEAD:` per the compare skill, never a saved copy. */
import { chromium } from 'playwright';
const SCRATCH = '/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/compare-defense';
const PAGES = {
  before: SCRATCH + '/before.html',
  after: process.cwd() + '/docs/dev/daily-theatre.html',
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
for (const [side, path] of Object.entries(PAGES)) {
  for (const [tag, vp] of [['390', { width: 390, height: 780 }],
                           ['1440', { width: 1440, height: 900 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.goto('file://' + path);
    await p.waitForTimeout(500);
    const shoot = async name => {
      const box = await p.evaluate(() => {
        const el = document.getElementById('ph').closest('.frame') || document.getElementById('ph');
        el.scrollIntoView({ block: 'start' });
        const r = el.getBoundingClientRect();
        return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8),
                 width: Math.min(innerWidth, r.width + 16), height: Math.min(innerHeight, r.height + 16) };
      });
      await p.screenshot({ path: `${SCRATCH}/${side}-${name}-${tag}.png`, clip: box });
    };
    await p.evaluate(() => BKTheatre.round2());
    await p.waitForTimeout(1800);                    // settled: pow gone, spots in
    await shoot('round2');
    if (side === 'after') {                          // the two NEW outcomes
      await p.evaluate(() => BKTheatre.make());
      await p.waitForTimeout(700);
      await shoot('denied');
      await p.waitForTimeout(900);
      await p.evaluate(() => BKTheatre.miss());
      await p.waitForTimeout(700);
      await shoot('beaten');
    }
    await ctx.close();
  }
}
await b.close();
console.log('shots done');

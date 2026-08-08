/* BEFORE/AFTER for two visual changes shipped 2026-08-08:
 *   1. the main menu re-ranked — Online moved to 02, directly under Vs the CPU
 *   2. the Daily Five clock's new HELD state, while the coach has the floor
 *
 * The BEFORE is minted out of git, never from the working copy — a .bak was
 * used as a baseline once in this repo and it already contained two of the
 * changes it was supposed to be the control for.
 *
 * Both themes, both viewports, both surfaces. The held clock has no BEFORE
 * screenshot to stand next to because before today the clock simply kept
 * running under the card; the honest control is the SAME card with the clock
 * live, which is what /before/ is for that pair.
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const REF = process.env.REF || 'HEAD';
const OUT = process.env.OUT || 'docs/dev/order';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* the before tree: index.html + the three scripts, all from the same commit */
const BDIR = 'docs/play/_before';
fs.mkdirSync(BDIR, { recursive: true });
for (const f of ['index.html', 'game.js', 'daily.js', 'coach.js', 'install.js'])
  fs.writeFileSync(`${BDIR}/${f}`, execSync(`git show ${REF}:docs/play/${f}`, { encoding: 'utf8' }));
/* everything else (assets, questions.js, players.js, audio.js …) is unchanged,
   so the before page links back up one level for it */
fs.writeFileSync(`${BDIR}/index.html`,
  fs.readFileSync(`${BDIR}/index.html`, 'utf8')
    .replace(/(src|href)="(?!https?:|\/|#|data:)(?!index\.html|game\.js|daily\.js|coach\.js|install\.js)/g, '$1="../'));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox', '--mute-audio'] });
const VPS = [['desktop', 1440, 900], ['phone', 390, 844]];
const SIDES = [['before', 'play/_before/'], ['after', 'play/']];
const rows = [];

for (const [tag, w, h] of VPS) {
  for (const theme of ['dark', 'light']) {
    for (const [side, path] of SIDES) {
      const c = await b.newContext({ viewport: { width: w, height: h } });
      const p = await c.newPage();
      await p.goto(`http://127.0.0.1:8899/${path}`);
      /* THE THEME IS A GAME SETTING, NOT A CSS MEDIA QUERY. It lives inside
         bk_settings and paints a body class — `hardwood` is the dark house
         look, `whiteout` is the light one. The first cut of this file wrote a
         `bk_theme` key that nothing reads, and the giveaway was in the output:
         the dark and light BEFORE shots came out byte-identical. Two shots of
         the same theme labelled as two themes is worse than one shot. */
      await p.evaluate(t => {
        const s = JSON.parse(localStorage.getItem('bk_settings') || '{}');
        s.theme = t; s.music = false;
        localStorage.setItem('bk_settings', JSON.stringify(s));
        localStorage.setItem('bk_coach', '0');
      }, theme === 'light' ? 'whiteout' : 'hardwood');
      await p.reload({ waitUntil: 'networkidle' });
      await sleep(1600);
      const order = await p.evaluate(() =>
        [...document.querySelectorAll('#screen-title .menu .mbtn')]
          .map(e => (e.querySelector('.idx') || {}).textContent + ' ' +
                    (e.querySelector('.lbl') || {}).textContent).join(' | '));
      const body = await p.evaluate(() => document.body.className.match(/theme-\w+/)[0]);
      rows.push(`${tag}/${theme}(${body})/${side}: ${order}`);
      await p.screenshot({ path: `${OUT}/menu-${tag}-${theme}-${side}.png` });
      await c.close();
    }
  }
}

/* ---- the held clock, after only, with its live-clock control alongside ---- */
for (const [tag, w, h] of VPS) {
  const c = await b.newContext({ viewport: { width: w, height: h } });
  const p = await c.newPage();
  await p.goto('http://127.0.0.1:8899/play/');
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('bk_settings') || '{}');
    s.theme = 'hardwood'; s.music = false;
    localStorage.setItem('bk_settings', JSON.stringify(s));
    localStorage.setItem('bk_coach', '1');
    localStorage.removeItem('bk_coach_seen');
    ['bk_daily5','bk_daily5r','bk_daily5p','bk_daily5h'].forEach(k => localStorage.removeItem(k));
  });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1500);
  await p.evaluate(() => document.getElementById('dailyStamp').click());
  await sleep(500);
  /* clock LIVE, no coach — the control */
  await p.screenshot({ path: `${OUT}/clock-${tag}-live.png` });
  /* walk out mid-card and come back: the resume notice, clock held */
  await p.evaluate(() => BKDaily._leaving());
  await sleep(200);
  await p.evaluate(() => document.getElementById('dailyStamp').click());
  await sleep(600);
  const held = await p.evaluate(() => ({
    held: document.getElementById('dvClockWrap').classList.contains('held'),
    num: document.getElementById('dvClockNum').textContent,
    who: document.querySelector('#coachTip .ct-who').textContent }));
  rows.push(`${tag}/held: ${held.who} · clock ${held.num} · held=${held.held}`);
  await p.screenshot({ path: `${OUT}/clock-${tag}-held.png` });
  await c.close();
}

await b.close();
fs.rmSync(BDIR, { recursive: true, force: true });
console.log(rows.join('\n'));
console.log('\nshots in ' + OUT);

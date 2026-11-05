// Photograph the scope board (tools/scope-board.py) at phone and desktop widths and
// report overflow, card counts and the pick line. usage: node tools/scope-board-check.mjs <page.html> <outdir>
import { chromium } from 'playwright';
const [,, file, outdir] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, w, h] of [['phone', 390, 844], ['desktop', 1280, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts/.test(m.text())) errors.push(m.text()); });
  await p.goto('file://' + file);
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => ({
    title: document.title,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    scopes: document.querySelectorAll('input[name=scope]').length,
    rules: document.querySelectorAll('input[name=bank]').length,
    verdicts: document.querySelectorAll('.verdict').length,
    mypick: (document.getElementById('mypick') || {}).textContent?.trim().slice(0, 60),
    height: document.documentElement.scrollHeight,
  }));
  await p.screenshot({ path: `${outdir}/scope-${name}-top.png`, fullPage: false });
  const s = await p.$('input[name=scope][value="3"]'); if (s) await s.check();
  const k = await p.$('input[name=bank][value="D"]'); if (k) await k.check();
  await p.fill('#date', '2026-11-20');
  await p.$eval('#date', el => el.dispatchEvent(new Event('change', { bubbles: true })));
  r.outAfter = await p.evaluate(() => document.getElementById('out').textContent);
  await p.screenshot({ path: `${outdir}/scope-${name}-full.png`, fullPage: true });
  if (name === 'desktop') { const g = await p.$('.grid'); if (g) await g.screenshot({ path: `${outdir}/scope-cards.png` }); }
  console.log(name, JSON.stringify(r), 'errors:', errors.length, errors.slice(0, 3));
  await p.close();
}
await b.close();

/* Board shots for the ONE DEFENSE comparison (Aaron ruled 08-18). Stages the
   floor-analysis scenarios on the real board with the point guard selected so
   the move tiles light, and photographs what a player is offered. Run with
   `before` or `after` as the label; same scenarios both times, so the only
   thing that changes between the two shoots is the shipped paint. :8899. */
import pw from 'playwright';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const label = process.argv[2];
if (!['before', 'after'].includes(label)) {
  console.error('usage: node tools/defense-shots.mjs before|after');
  process.exit(1);
}
const scen = JSON.parse(fs.readFileSync('design/floor-scenarios.json', 'utf8'));
const OUT = 'design/shots/defense';
fs.mkdirSync(OUT, { recursive: true });

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio'] });
for (const view of [{ k: 'desk', w: 1280, h: 860 }, { k: 'phone', w: 390, h: 844, m: true }]) {
  const ctx = await b.newContext({ viewport: { width: view.w, height: view.h },
    hasTouch: !!view.m, isMobile: !!view.m });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 100)));
  await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1200);
  for (const name of ['HORNS vs 2-3 ZONE', 'HORNS vs MAN']) {
    const sc = scen.find(s => s.name === name);
    // boot first and let the start-of-game timers finish BEFORE selecting:
    // they clear the selection, which shot an unlit board on the first try
    await p.evaluate(() => {
      if (window.__defshot) return;
      const B = window.BK, K = B.coach;
      K.applyColors({ nm: 'You', ab: 'YOU' }, { nm: 'Them', ab: 'THM' });
      K.startGame({ league: 'nba', decade: 'ANY', target: 11,
        rosters: K.pickRosters('nba', 'ANY') }, true);
      B._show('game');
      window.__defshot = 1;
    });
    await sleep(1400);
    await p.evaluate((sc) => {
      const B = window.BK, S = B.state();
      for (const pl of sc.pieces) {
        const i = S.pieces.findIndex(q => q.team === pl.team && q.pos === pl.pos);
        B._set(i, pl.c, pl.r);
      }
      const hi = S.pieces.findIndex(q => q.team === 0 && q.pos === 'PG');
      S.ball.holder = hi; S.offense = 0; S.front = null;
      S.phase = 'off-move'; S.selected = hi; S.staged = null;
    }, sc);
    await sleep(600);
    const tag = name.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase();
    await p.screenshot({ path: `${OUT}/${label}-${view.k}-${tag}.png` });
    console.log(`  shot ${label}-${view.k}-${tag}` + (errs.length ? '  ERRS ' + errs[0] : ''));
  }
  await ctx.close();
}
await b.close();

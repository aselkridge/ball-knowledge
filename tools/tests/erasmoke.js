// End-to-end smoke: play a real NBA 1960s game and prove every question the
// engine actually serves respects the era gate. The thinnest reachable pool
// (t:0, 1960s, 22 cards) is deliberately the one under test.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 390, height: 780 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8899/play/', { waitUntil: 'load' });
  await pg.waitForTimeout(700);
  let fail = 0; const ok = m => console.log('✓ ' + m); const no = m => { console.log('✗ ' + m); fail++; };

  const r = await pg.evaluate(() => {
    BK.coach.cpu.on = true; BK.coach.cpu.team = 1;
    BK.coach.startGame({ league: 'nba', decade: ['60s'], target: 11,
                         rosters: BK.coach.pickRosters('nba', ['60s']) });
    const out = { eras: BK.state().eras, drawn: [], leaks: [], tiers: {} };
    // hammer the real picker across every tier, past the point of exhaustion
    for (let t = 0; t <= 4; t++) {
      out.tiers[t] = 0;
      for (let i = 0; i < 80; i++) {
        const q = BK._pickQ(t);
        if (!q) continue;
        out.tiers[t]++;
        out.drawn.push(q.q.slice(0, 40));
        if (q.e && q.e.length && !q.e.includes('1960s')) out.leaks.push({ q: q.q.slice(0, 60), e: q.e });
      }
    }
    return out;
  });

  console.log(`drew ${r.drawn.length} questions across 5 tiers in an NBA 1960s game`);
  JSON.stringify(r.eras) === '["60s"]' ? ok('era selection reached the game state') : no('eras: ' + JSON.stringify(r.eras));
  r.drawn.length >= 380 ? ok('every draw returned a card (no starvation past exhaustion)') : no('only ' + r.drawn.length + ' draws returned');
  if (r.leaks.length === 0) ok('ZERO out-of-era leaks across 400 draws');
  else { no(r.leaks.length + ' out-of-era cards leaked'); r.leaks.slice(0,3).forEach(l => console.log('     ', l.e, l.q)); }
  errs.length === 0 ? ok('no page errors') : no('page errors: ' + errs.slice(0,2).join(' | '));

  // and All-Time must NOT be gated
  const all = await pg.evaluate(() => {
    BK.coach.startGame({ league: 'nba', decade: ['FULL'], target: 11,
                         rosters: BK.coach.pickRosters('nba', ['FULL']) });
    const seen = new Set();
    for (let t = 0; t <= 4; t++) for (let i = 0; i < 60; i++) {
      const q = BK._pickQ(t); if (q && q.e) q.e.forEach(d => seen.add(d));
    }
    return [...seen].sort();
  });
  console.log('All-Time game drew cards from eras:', all.join(', '));
  all.length >= 5 ? ok('All-Time draws across many decades (no era gate applied)') : no('All-Time looks gated: ' + all.join(','));

  await b.close();
  console.log(fail ? `\n${fail} FAILURES` : '\nERA SMOKE TEST: ALL PASS');
  process.exitCode = fail ? 1 : 0;
})();

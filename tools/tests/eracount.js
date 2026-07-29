const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 390, height: 780 } });
  pg.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await pg.goto('http://localhost:8899/play/', { waitUntil: 'load' });
  await pg.waitForTimeout(700);
  let fail = 0; const ok = m => console.log('✓ ' + m); const no = m => { console.log('✗ ' + m); fail++; };

  const r = await pg.evaluate(() => {
    const P = BK._poolCount;
    return {
      nbaAll:  P('nba', [], ['FULL']),
      nba90:   P('nba', [], ['90s']),
      nba60:   P('nba', [], ['60s']),
      nba9000: P('nba', [], ['90s','00s']),
      nbaPacks:P('nba', ['fives','street'], ['FULL']),
      nba90Packs: P('nba', ['fives','street'], ['90s']),
      wnbaAll: P('wnba', [], ['FULL']),
      wnba20:  P('wnba', [], ['20s']),
    };
  });
  console.log('\nLED COUNTER — what the player would actually see:');
  console.log(`  NBA · All-Time                 ${r.nbaAll}`);
  console.log(`  NBA · '90s only                ${r.nba90}`);
  console.log(`  NBA · '60s only                ${r.nba60}`);
  console.log(`  NBA · '90s + '00s              ${r.nba9000}`);
  console.log(`  NBA · All-Time + 2 packs       ${r.nbaPacks}`);
  console.log(`  NBA · '90s + 2 packs           ${r.nba90Packs}`);
  console.log(`  WNBA · All-Time                ${r.wnbaAll}`);
  console.log(`  WNBA · '20s only               ${r.wnba20}`);

  r.nba90 < r.nbaAll ? ok("picking an era DROPS the counter (era means something, visibly)") : no('counter did not drop');
  r.nba9000 > r.nba90 ? ok('adding a second era RAISES it back') : no('multi-era did not raise the count');
  r.nbaPacks > r.nbaAll ? ok('packs still ADD on top') : no('packs no longer add');
  r.nba90Packs > r.nba90 ? ok('packs and eras compose (AND across axes, both applied)') : no('packs+era did not compose');
  r.nba90 > 100 ? ok(`'90s NBA pool is playable (${r.nba90} cards, no starvation)`) : no('pool too thin: ' + r.nba90);
  await b.close();
  console.log(fail ? `\n${fail} FAILURES` : '\nALL COUNTER CHECKS PASS');
  process.exitCode = fail ? 1 : 0;
})();

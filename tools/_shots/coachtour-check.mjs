/* The Coach's Tours demo, second batch: thirteen chapters, ten mock scenes,
   the Coldest Call spotlight that MOVES, step counters, back/skip,
   tour-vs-trigger contrast, and the one-off lists parsed from the plan.
   Run: node tools/_shots/coachtour-check.mjs <page.html> */
import { chromium } from 'playwright-core';

const page_path = process.argv[2];
if (!page_path) { console.error('usage: coachtour-check.mjs <page.html>'); process.exit(2); }

let n = 0, bad = 0;
function ok(cond, name, extra) {
  n++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${n} ${name}${extra ? '  ' + extra : ''}`);
  if (!cond) bad++;
}
const spotBox = pg => pg.evaluate(() => {
  const s = document.getElementById('spot');
  return { on: s.classList.contains('on'), x: s.style.left, y: s.style.top, w: s.style.width };
});
const sceneOn = (pg, id) => pg.evaluate(i =>
  document.getElementById(i).classList.contains('on'), id);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

{
  const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(400);

  ok(await pg.locator('.chip').count() === 13, 'thirteen chapters on the picker');
  ok(await sceneOn(pg, 'scn-menu'), 'the page opens on the main-menu scene');
  ok((await pg.locator('#twho').innerText()) === 'COACH · 1 OF 4',
     'the menu tour opens by itself with a step counter');
  ok(await pg.locator('#tback').isHidden(), 'no Back on step one');

  const b1 = await spotBox(pg);
  ok(b1.on, 'the spotlight is up');
  await pg.locator('#tnext').click();
  const b2 = await spotBox(pg);
  ok(b2.on && (b1.x !== b2.x || b1.y !== b2.y || b1.w !== b2.w),
     'Next MOVES the spotlight to the next subject', `${b1.x},${b1.y} -> ${b2.x},${b2.y}`);
  ok((await pg.locator('#twho').innerText()) === 'COACH · 2 OF 4', 'the counter follows');
  ok(await pg.locator('#tback').isVisible(), 'Back appears after step one');
  await pg.locator('#tback').click();
  ok((await pg.locator('#twho').innerText()) === 'COACH · 1 OF 4', 'and Back goes back');

  /* walk the menu tour out (from step 1: three advances, then Done) */
  for (let i = 0; i < 4; i++) { await pg.locator('#tnext').click(); await pg.waitForTimeout(120); }
  ok((await pg.locator('.chip').first().innerText()).startsWith('✓'),
     'finishing a tour marks its chapter ✓');
  ok(!(await sceneOn(pg, 'scn-menu')), 'and the scene comes down with it');

  /* T1 still walks the game screen, card opposite its subject */
  await pg.locator('.chip', { hasText: 'T1' }).click();
  ok((await pg.locator('#twho').innerText()) === 'COACH · 1 OF 5', 'T1 has its 5 steps');
  const low = await pg.evaluate(() => document.getElementById('tcard').style.bottom !== '');
  ok(low, 'a top subject (the scoreboard) pushes the card to the bottom');

  /* every scene chapter raises its own mock */
  const scenes = [
    ['FIRST SETUP', 'scn-setup'], ['THE FIRST CARD', 'cardveil'],
    ['THE CALL', 'scn-call'], ['THE PAUSE MENU', 'pauseveil'],
    ['THE FINAL BUZZER', 'scn-end'], ['THE DAILY FIVE', 'scn-daily'],
    ['THE HEAT CHECK', 'scn-heat'], ['THE GYM', 'scn-gym']];
  for (const [chip, id] of scenes) {
    await pg.locator('.chip', { hasText: chip }).first().click();
    ok(await sceneOn(pg, id), `${chip} raises its scene (${id})`);
  }

  /* the :15 line survives, parsed from the plan */
  await pg.locator('.chip', { hasText: 'THE FIRST CARD' }).click();
  await pg.locator('#tnext').click(); await pg.locator('#tnext').click();
  ok((await pg.locator('#ttxt').innerText()).includes('burns while you read'),
     'the :15 step says its line from the plan');

  /* T3's ring step decodes all three rings, and the mock wears all three */
  await pg.locator('.chip', { hasText: 'T3' }).click();
  await pg.locator('#tnext').click(); await pg.locator('#tnext').click();
  const ringTxt = await pg.locator('#ttxt').innerText();
  ok(ringTxt.includes('Amber') && ringTxt.includes('Double red') && ringTxt.includes('teal'),
     'the ring step decodes amber, double red and teal');
  for (const cls of ['ring-amber', 'ring-red', 'ring-teal'])
    ok(await pg.locator('.pc.' + cls).count() === 1, `the mock wears ${cls}`);

  /* skip closes without marking done */
  await pg.locator('.chip', { hasText: 'THE PAUSE MENU' }).click();
  await pg.locator('#tskip').click();
  ok(!(await sceneOn(pg, 'pauseveil'))
     && !(await pg.locator('.chip', { hasText: 'THE PAUSE MENU' }).innerText()).startsWith('✓'),
     'Skip closes the tour WITHOUT marking it done');

  /* the single trigger reads differently on purpose */
  await pg.locator('.chip', { hasText: 'SINGLE TRIGGER' }).click();
  ok((await pg.locator('#twho').innerText()).includes('SAID ONCE'),
     'a trigger says SAID ONCE, EVER instead of a counter');
  ok((await pg.locator('#tnext').innerText()).includes('Got it'),
     'and its button is Got it, not Next');
  ok((await pg.locator('#tskip').innerText()).includes('Coach off'),
     'and its escape hatch is Coach off');

  /* the one-off lists are there and roughly the right size */
  const trigN = await pg.locator('#oneoffs ul').first().locator('li').count();
  const guardN = await pg.locator('#oneoffs ul').nth(1).locator('li').count();
  ok(trigN >= 40, 'the trigger list is the full list', `${trigN} rows`);
  ok(guardN === 7, 'seven guardrails listed', `${guardN}`);
  ok((await pg.locator('#oneoffs h2').innerText()).includes(String(trigN)),
     'the heading count matches the list it heads');

  /* no tour SCRIPT says "pay" any more. The page may still QUOTE the
     complaint in the report section; the scripts are what players hear. */
  const raw = (await import('fs')).readFileSync(page_path, 'utf8');
  const data = JSON.parse(raw.match(/var CH=(\[.*?\]);\n/s)[1]);
  const allSay = data.flatMap(c => c.steps.map(s => s.say)).join(' ').toLowerCase();
  ok(!allSay.includes('pay for it') && !allSay.includes('you pay'),
     'no tour script says pay-for-it', `${data.length} chapters scanned`);
  await pg.close();
}

/* ---------- phone 390 ---------- */
{
  const pg = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(400);
  ok(await pg.locator('#tcard').isVisible(), 'phone: the tour card is up');
  const a = await spotBox(pg);
  await pg.locator('#tnext').click();
  const b = await spotBox(pg);
  ok(a.on && b.on && (a.x !== b.x || a.y !== b.y || a.w !== b.w),
     'phone: the spotlight moves too');
  await pg.locator('#stage').scrollIntoViewIfNeeded();
  await pg.screenshot({ path: 'tools/_shots/coachtour-phone.png' });
  await pg.close();
}

await browser.close();
console.log(bad ? `\n${bad} of ${n} FAILED` : `\nall ${n} checks pass`);
process.exit(bad ? 1 : 0);

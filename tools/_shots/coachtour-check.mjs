/* The Coach's Tours demo: chapters, the Coldest Call spotlight that MOVES,
   step counters, back/skip, tour-vs-trigger contrast, the card that sits
   opposite its subject, and the scenes (question card, pause menu).
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

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

{
  const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(400);

  ok(await pg.locator('.chip').count() === 6, 'six chapters on the picker');
  ok((await pg.locator('#twho').innerText()) === 'COACH · 1 OF 5',
     'T1 opens by itself with a step counter');
  ok(await pg.locator('#tback').isHidden(), 'no Back on step one');

  const b1 = await spotBox(pg);
  ok(b1.on, 'the spotlight is up');
  await pg.locator('#tnext').click();
  const b2 = await spotBox(pg);
  ok(b2.on && (b1.x !== b2.x || b1.y !== b2.y || b1.w !== b2.w),
     'Next MOVES the spotlight to the next subject', `${b1.x},${b1.y} -> ${b2.x},${b2.y}`);
  ok((await pg.locator('#twho').innerText()) === 'COACH · 2 OF 5', 'the counter follows');
  ok(await pg.locator('#tback').isVisible(), 'Back appears after step one');
  await pg.locator('#tback').click();
  ok((await pg.locator('#twho').innerText()) === 'COACH · 1 OF 5', 'and Back goes back');

  /* the card sits opposite its subject: scoreboard (top) puts the card low */
  const low = await pg.evaluate(() => document.getElementById('tcard').style.bottom !== '');
  ok(low, 'a top subject pushes the card to the bottom');

  /* walk T1 to the end (from step 1: four advances, then Done) */
  for (let i = 0; i < 5; i++) { await pg.locator('#tnext').click(); await pg.waitForTimeout(120); }
  ok((await pg.locator('.chip').first().innerText()).startsWith('✓'),
     'finishing a tour marks its chapter ✓');
  ok(await pg.evaluate(() => !document.getElementById('spot').classList.contains('on')),
     'and the lights come back up');

  /* FIRST CARD: the scene changes and the last step rings the :15 */
  await pg.locator('.chip', { hasText: 'FIRST CARD' }).click();
  ok(await pg.locator('#cardveil.on').count() === 1, 'the first-card chapter raises the card scene');
  await pg.locator('#tnext').click(); await pg.locator('#tnext').click();
  ok((await pg.locator('#ttxt').innerText()).includes('burns while you read'),
     'the :15 step says its line from the plan');
  await pg.locator('#tnext').click();
  ok(await pg.locator('#cardveil.on').count() === 0, 'finishing restores the game scene');

  /* PAUSE: his multi-step trigger example */
  await pg.locator('.chip', { hasText: 'PAUSE MENU' }).click();
  ok(await pg.locator('#pauseveil.on').count() === 1, 'the pause chapter raises the pause menu');
  await pg.locator('#tskip').click();
  ok(await pg.locator('#pauseveil.on').count() === 0
     && !(await pg.locator('.chip', { hasText: 'PAUSE MENU' }).innerText()).startsWith('✓'),
     'Skip closes the tour WITHOUT marking it done');

  /* the single trigger reads differently on purpose */
  await pg.locator('.chip', { hasText: 'SINGLE TRIGGER' }).click();
  ok((await pg.locator('#twho').innerText()).includes('SAID ONCE'),
     'a trigger says SAID ONCE, EVER instead of a counter');
  ok((await pg.locator('#tnext').innerText()).includes('Got it'),
     'and its button is Got it, not Next');
  ok((await pg.locator('#tskip').innerText()).includes('Coach off'),
     'and its escape hatch is Coach off');
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

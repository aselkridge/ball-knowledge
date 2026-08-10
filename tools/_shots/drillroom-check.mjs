/* The Drill Room example: Aaron's sections as drills, a parts rail that
   checks off and crosses out, jump to any line, redo never un-clears,
   off-drill actions refuse with a reason, locked parts stay out of the
   count, diploma at the end. Desktop rail + phone parts-chip both walked.
   Run: node tools/_shots/drillroom-check.mjs <page.html> */
import { chromium } from 'playwright-core';

const page_path = process.argv[2];
if (!page_path) { console.error('usage: drillroom-check.mjs <page.html>'); process.exit(2); }

let n = 0, bad = 0;
function ok(cond, name, extra) {
  n++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${n} ${name}${extra ? '  ' + extra : ''}`);
  if (!cond) bad++;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

/* ---------- desktop: the rail ---------- */
{
  const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(250);

  ok(await pg.locator('.dcard').count() === 10, 'shelf shows 7 drills + 3 trays',
     `cards=${await pg.locator('.dcard').count()}`);
  ok((await pg.locator('.dcard .sub').first().innerText()).includes('NEXT UP'),
     'the first unfinished drill carries the NEXT UP pointer');

  /* open BOARDS (the hero drill) and play DR-07: brick on purpose */
  await pg.locator('.dcard', { hasText: 'BOARDS' }).click();
  ok(await pg.locator('#drill.on').count() === 1, 'a drill screen opens');
  ok(await pg.locator('#rail .pline').count() === 3, 'the rail lists all three parts');
  ok(await pg.locator('#rail .pline.cur').count() === 1, 'exactly one line is current');

  /* gating: MOVE is outside this drill; tapping it must refuse, not act */
  await pg.locator('#bmove').click();
  ok(await pg.locator('#bmove.off').count() === 1
     && (await pg.locator('#say').innerText()).includes('Stick to the drill'),
     'an off-drill action refuses with the coach saying why');

  await pg.locator('#pg').click();
  await pg.locator('#bshoot').click();
  ok(await pg.locator('#qveil.on').count() === 1, 'SHOOT raises the question card');
  /* the twist: answering RIGHT is refused, this part needs a brick */
  await pg.locator('#qcard button[data-ok="1"]').click();
  ok(await pg.locator('#qveil.on').count() === 1
     && (await pg.locator('#say').innerText()).includes('On PURPOSE'),
     'answering right in the brick drill is refused');
  await pg.locator('#qcard button[data-ok="0"]').first().click();
  await pg.waitForTimeout(4200);
  ok(await pg.locator('#rail .pline.done').count() === 1,
     'the cleared part checks off',
     `done=${await pg.locator('#rail .pline.done').count()}`);
  ok(await pg.evaluate(() =>
      getComputedStyle(document.querySelector('#rail .pline.done .nm'))
        .textDecorationLine.includes('line-through')),
     'and crosses out');

  /* jump: click line 3 (DR-24) out of order */
  await pg.locator('#rail .pline').nth(2).click();
  ok(await pg.locator('#rail .pline').nth(2).evaluate(el => el.classList.contains('cur')),
     'clicking a line jumps the drill to that part');

  /* redo a cleared line: replay must NOT un-clear it */
  await pg.locator('#rail .pline').nth(0).click();
  ok(await pg.locator('#rail .pline.done').count() === 1,
     'replaying a cleared part keeps its checkmark');

  /* finish the drill: DR-07 done; DR-24 then DR-09 */
  await pg.locator('#rail .pline').nth(2).click();
  await pg.locator('#bshoot').click();
  await pg.waitForTimeout(4500);
  await pg.locator('#bshoot').click();          /* DR-09 auto-advanced to cur */
  await pg.locator('#qcard button[data-ok="1"]').click();
  await pg.waitForTimeout(4800);
  ok(await pg.locator('#dd.on').count() === 1, 'clearing every part raises the diploma');
  ok((await pg.locator('#ddSub').innerText()).toUpperCase().includes('BOARDS'),
     'the diploma names the drill');
  await pg.locator('#ddBack').click();
  ok((await pg.locator('.dcard', { hasText: 'BOARDS' }).innerText()).includes('3/3'),
     'the shelf card now reads 3/3');

  /* persistence: reload keeps the cleared drill */
  await pg.reload(); await pg.waitForTimeout(250);
  ok((await pg.locator('.dcard', { hasText: 'BOARDS' }).innerText()).includes('3/3'),
     'progress survives a reload');

  /* locked parts: Violations shows 3 live + 2 locked, locked out of count */
  await pg.locator('.dcard', { hasText: 'VIOLATIONS' }).click();
  ok(await pg.locator('#rail .pline.locked').count() === 2,
     'fouls and free throws are dashed + locked');
  await pg.locator('#rail .pline.locked').first().click();
  ok((await pg.locator('#say').innerText()).includes('waiting on the game'),
     'tapping a locked line explains the wait');
  ok((await pg.locator('#partchip').innerText()).includes('/3'),
     'locked lines stay out of the progress denominator');

  /* redo drill resets */
  await pg.locator('#back').click();
  await pg.locator('.dcard', { hasText: 'BOARDS' }).click();
  await pg.locator('#cbRestart').click();
  ok(await pg.locator('#rail .pline.done').count() === 0, '↺ Restart clears the marks');
  await pg.close();
}

/* ---------- phone 390: the chip and the sheet ---------- */
{
  const pg = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(250);
  await pg.locator('.dcard', { hasText: 'BOARDS' }).click();
  ok(await pg.locator('#rail').isHidden(), 'phone: the rail folds away');
  ok(await pg.locator('#partchip').isVisible(), 'phone: the parts chip appears');
  await pg.locator('#partchip').click();
  ok(await pg.locator('#psheet.on').count() === 1, 'the chip opens the parts sheet');
  ok(await pg.locator('#psheet .pline').count() === 3, 'with the same three lines');
  await pg.locator('#psheet .pline').nth(1).click();
  ok(await pg.locator('#psheet.on').count() === 0, 'picking a line closes the sheet');
  const chip = await pg.locator('#partchip').innerText();
  ok(/0\/3/.test(chip), 'the chip carries the running count', chip);
  /* trays: not drills, and they say so */
  await pg.locator('#back').click();
  await pg.locator('.dcard.tray', { hasText: 'MAIN MENU' }).click();
  ok((await pg.locator('#tray .tp').innerText()).includes('these are coaches'),
     'the menu tray says where its ten really go');
  await pg.screenshot({ path: 'tools/_shots/drillroom-phone.png', fullPage: false });
  await pg.close();
}

await browser.close();
console.log(bad ? `\n${bad} of ${n} FAILED` : `\nall ${n} checks pass`);
process.exit(bad ? 1 : 0);

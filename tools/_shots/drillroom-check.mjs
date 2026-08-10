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

/* ---------- desktop: the two views, then the rail ---------- */
{
  const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(250);

  /* v2: the suggested room is the default, his board is one tap away */
  ok(await pg.locator('.vchip').count() === 2, 'two view chips exist');
  ok((await pg.locator('.vchip.on').innerText()).includes('SUGGESTIONS'),
     'the suggested view is the default (he asked to see it)');
  ok(await pg.locator('.dcard').count() === 16,
     'advised shelf: 11 drills + 3 parked + 2 trays',
     `cards=${await pg.locator('.dcard').count()}`);
  ok(await pg.locator('.dcard:not(.tray):not(.park)', { hasText: 'KNOW YOUR CARD' }).count() === 1,
     'the missing section exists (S1)');
  ok((await pg.locator('.dcard', { hasText: 'LOCKDOWN' }).innerText()).includes('gains DR-09'),
     'LOCKDOWN says it gained DR-09 (S3)');
  ok(await pg.locator('.dcard.park').count() === 3, 'three parked builds on their own shelf (S2/S8)');
  ok(await pg.locator('.dcard', { hasText: 'UNSURE' }).count() === 0,
     'Unsure is gone from the advised view (S2)');

  /* the new drill plays: KNOW YOUR CARD part 1 is DR-38, a card part */
  await pg.locator('.dcard:not(.tray):not(.park)', { hasText: 'KNOW YOUR CARD' }).click();
  ok(await pg.locator('#rail .pline').count() === 3, 'KNOW YOUR CARD holds its three parts');
  ok(await pg.locator('#qveil.on').count() === 1, 'part one raises the card straight away');
  await pg.locator('#qcard button').first().click();
  await pg.waitForTimeout(2200);
  ok(await pg.locator('#rail .pline.done').count() === 1, 'and clears like any other part');

  /* SHOW ME (S10) */
  ok(await pg.locator('#cbShow').isVisible(), 'the SHOW ME button rides the coach band');
  await pg.locator('#cbShow').click();
  ok((await pg.locator('#say').innerText()).includes('glow'), 'and it points at the target');

  /* THE WHISTLE: both clocks live + the foul family locked (S5, S2) */
  await pg.locator('#back').click();
  await pg.locator('.dcard', { hasText: 'THE WHISTLE' }).click();
  ok(await pg.locator('#rail .pline').count() === 7
     && await pg.locator('#rail .pline.locked').count() === 3,
     'THE WHISTLE: four live parts, three locked foul-family slots');
  ok((await pg.locator('#rail').innerText()).includes('The shot clock'),
     'the offensive :24 moved in beside the :12');
  await pg.locator('#back').click();

  /* THE GLASS lost DR-09 */
  await pg.locator('.dcard', { hasText: 'THE GLASS' }).click();
  ok(await pg.locator('#rail .pline').count() === 2
     && !(await pg.locator('#rail').innerText()).includes('Battle at the rim'),
     'THE GLASS holds two parts, Battle at the rim moved out');
  await pg.locator('#back').click();

  /* a parked card explains itself */
  await pg.locator('.dcard.park', { hasText: 'ROTATION' }).click();
  ok((await pg.locator('#tray .tp').innerText()).includes('Parked, not lost'),
     'a parked build explains the wait');
  await pg.locator('#back').click();

  /* the moves table is boundary crossings only */
  ok(await pg.locator('#moves tbody tr').count() === 12,
     'the moves table lists exactly the 12 boundary crossings',
     `rows=${await pg.locator('#moves tbody tr').count()}`);

  /* flip to his board: everything from round one still holds */
  await pg.locator('.vchip', { hasText: 'AS FILED' }).click();
  await pg.waitForTimeout(200);

  ok(await pg.locator('.dcard').count() === 10, 'his shelf: 7 drills + 3 trays, untouched',
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

/* ---------- phone 390: the chip and the sheet, in the advised room ---------- */
{
  const pg = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pg.addInitScript(() => localStorage.clear());   /* fresh phone, default view */
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(250);
  await pg.locator('.dcard', { hasText: 'THE GLASS' }).click();
  ok(await pg.locator('#rail').isHidden(), 'phone: the rail folds away');
  ok(await pg.locator('#partchip').isVisible(), 'phone: the parts chip appears');
  await pg.locator('#partchip').click();
  ok(await pg.locator('#psheet.on').count() === 1, 'the chip opens the parts sheet');
  ok(await pg.locator('#psheet .pline').count() === 2, 'with THE GLASS’s two lines');
  await pg.locator('#psheet .pline').nth(1).click();
  ok(await pg.locator('#psheet.on').count() === 0, 'picking a line closes the sheet');
  const chip = await pg.locator('#partchip').innerText();
  ok(/0\/2/.test(chip), 'the chip carries the running count', chip);
  /* trays: not drills, and they say so */
  await pg.locator('#back').click();
  await pg.locator('.dcard.tray', { hasText: 'MAIN MENU' }).click();
  ok((await pg.locator('#tray .tp').innerText()).includes('these are coaches'),
     'the menu tray says where its nine really go');
  /* the toggle exists on the phone too, and flipping shows his board */
  await pg.locator('#back').click();
  await pg.locator('.vchip', { hasText: 'AS FILED' }).click();
  ok(await pg.locator('.dcard', { hasText: 'BOARDS' }).count() === 1,
     'his board is one tap away on the phone');
  await pg.screenshot({ path: 'tools/_shots/drillroom-phone.png', fullPage: false });
  await pg.close();
}

await browser.close();
console.log(bad ? `\n${bad} of ${n} FAILED` : `\nall ${n} checks pass`);
process.exit(bad ? 1 : 0);

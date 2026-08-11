/* The board on the coach artifact: sections Aaron names, file by tap or drag,
   an item can live in ONE section only, and three export channels. Replaces
   picker-check.mjs (the checkbox era died when the sandbox ate the clipboard).
   Run: node tools/_shots/board-check.mjs <page.html> */
import { chromium } from 'playwright-core';

const page_path = process.argv[2];
if (!page_path) { console.error('usage: board-check.mjs <page.html>'); process.exit(2); }

let n = 0, bad = 0;
function ok(cond, name, extra) {
  n++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${n} ${name}${extra ? '  ' + extra : ''}`);
  if (!cond) bad++;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

/* ---------- phone: the tap path ---------- */
{
  const pg = await browser.newPage({ viewport: { width: 390, height: 844 } });
  /* seed the OLD picker key first, so migration is provable */
  await pg.addInitScript(() => {
    if (!localStorage.getItem('bk_coach_board_v1'))
      localStorage.setItem('bk_coach_picks', JSON.stringify({ 'DR-01': 1, 'DR-02': 1 }));
  });
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(300);
  /* rows live inside collapsed <details>; a player would have opened one */
  await pg.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));

  const st0 = await pg.evaluate(() => JSON.parse(localStorage.getItem('bk_coach_board_v1')));
  ok(st0 && st0.secs.length === 1 && st0.secs[0].name === 'Picked earlier'
     && st0.secs[0].items.length === 2, 'old checkbox picks migrate into one section');
  ok(await pg.evaluate(() => !localStorage.getItem('bk_coach_picks')),
     'and the old key is gone');

  /* tap a row -> sheet -> new section by name */
  await pg.locator('tr[data-id="DR-03"]').first().click();
  ok(await pg.locator('#sheet').isVisible(), 'tapping a row opens the file-it sheet');
  await pg.fill('#sheetname', 'Ball movement and passing');
  await pg.locator('#sheetform button').click();
  let st = await pg.evaluate(() => JSON.parse(localStorage.getItem('bk_coach_board_v1')));
  const sec = st.secs.find(s => s.name === 'Ball movement and passing');
  ok(!!sec && sec.items.includes('DR-03'), 'Add + file creates his section and files the row');
  ok(await pg.locator('#sheet').isHidden(), 'and the sheet closes');
  ok(await pg.locator('tr[data-id="DR-03"] .tag').first().isVisible(),
     'the filed row wears its section tag');

  /* the invariant: filing DR-03 somewhere else must MOVE it */
  await pg.locator('tr[data-id="DR-03"]').first().click();
  await pg.locator('#sheetsecs button', { hasText: 'Picked earlier' }).click();
  st = await pg.evaluate(() => JSON.parse(localStorage.getItem('bk_coach_board_v1')));
  const homes = st.secs.filter(s => s.items.includes('DR-03'));
  ok(homes.length === 1 && homes[0].name === 'Picked earlier',
     'refiling MOVES the item: exactly one home', `homes=${homes.length}`);

  /* dedup: adding a section under an existing name reuses it */
  await pg.locator('#secplus').click();
  await pg.fill('#secname', 'ball movement and passing');
  await pg.locator('#secform button').click();
  st = await pg.evaluate(() => JSON.parse(localStorage.getItem('bk_coach_board_v1')));
  ok(st.secs.filter(s => /ball movement/i.test(s.name)).length === 1,
     'same name (any case) reuses the section instead of duplicating it');

  /* board panel: unfile, rename, delete-returns-items */
  await pg.locator('#boardbtn').click();
  ok(await pg.locator('#boardp').isVisible(), 'BOARD opens the panel');
  await pg.locator('[data-rm="DR-01"]').click();
  st = await pg.evaluate(() => JSON.parse(localStorage.getItem('bk_coach_board_v1')));
  ok(!st.secs.some(s => s.items.includes('DR-01')), 'the little x unfiles an item');
  const del = pg.locator('[data-del]').first();
  await del.click();                                  /* arms */
  st = await pg.evaluate(() => JSON.parse(localStorage.getItem('bk_coach_board_v1')));
  ok(st.secs.length === 2, 'first delete tap only arms, nothing deleted yet');
  await del.click();                                  /* fires */
  st = await pg.evaluate(() => JSON.parse(localStorage.getItem('bk_coach_board_v1')));
  ok(st.secs.length === 1, 'second tap deletes the section');
  ok(!st.secs.some(s => s.items.includes('DR-02')) &&
     await pg.locator('tr[data-id="DR-02"] .h').first().count() === 1,
     'its items go back to the pool with their handle restored');

  /* export text: sections, counts, unsorted line */
  const txt = await pg.evaluate(() => {
    document.getElementById('expcopy').click();
    return document.getElementById('exptxt').value ||
      /* execCommand may have succeeded and hidden the ta; rebuild via print fill */
      (window.__t || '');
  });
  /* whatever copy did, the print fill must carry the board */
  await pg.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  const printed = await pg.evaluate(() => document.getElementById('printout').innerText);
  /* by now everything has been unfiled again: 336 fileable rows (66 drills,
     256 moments, 14 already-live moments), 0 filed */
  ok(/Coach board/.test(printed) && /Ball movement and passing \(0\)/i.test(printed)
     && /Unsorted \(336\)/.test(printed),
     'print layout carries sections, counts and the unsorted line');

  /* the panel is still open from the delete checks; that IS the shot */
  await pg.screenshot({ path: 'tools/_shots/board-phone.png' });
  await pg.close();
}

/* ---------- desktop: the drag path ---------- */
{
  const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.goto('file://' + page_path);
  await pg.waitForTimeout(300);
  await pg.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
  await pg.locator('#secplus').click();
  await pg.fill('#secname', 'Defense');
  await pg.locator('#secform button').click();

  /* HTML5 drag needs synthetic events under headless playwright */
  const dropped = await pg.evaluate(() => {
    const row = document.querySelector('tr[data-id="DR-05"]');
    const chip = document.querySelector('.dchip');
    const dt = new DataTransfer();
    row.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
    chip.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    chip.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    row.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    const st = JSON.parse(localStorage.getItem('bk_coach_board_v1'));
    return st.secs.find(s => s.name === 'Defense').items;
  });
  ok(dropped.length === 1 && dropped[0] === 'DR-05',
     'dragging a row onto a dock chip files it');
  await pg.close();
}

await browser.close();
console.log(`\n${n - bad} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);

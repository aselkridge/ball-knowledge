import { chromium } from 'playwright';
const SC = '/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + SC + '/coach-lists.html');
await p.waitForTimeout(600);
console.log('errors:', errs.length ? errs : 'none');
// open the first details, tick two boxes + one whole-row tap
const r = await p.evaluate(() => {
  document.querySelectorAll('details').forEach(d => d.open = true);
  const boxes = [...document.querySelectorAll('input[data-id]')];
  boxes[0].click(); boxes[5].click();
  boxes[10].closest('tr').querySelector('td:nth-child(3)').click();  // row tap
  const bar = document.getElementById('pickbar');
  return { n: document.getElementById('pickn').textContent,
           barShown: !bar.hidden,
           rowPainted: boxes[0].closest('tr').classList.contains('picked'),
           persisted: JSON.parse(localStorage.getItem('bk_coach_picks')||'{}') };
});
console.log(JSON.stringify(r));
// the copy payload, via the prompt fallback path
await p.evaluate(() => { navigator.clipboard.writeText = undefined; window.prompt = (m, t) => { window.__copy = t; }; });
await p.click('#pickcopy');
console.log('--- copy payload ---');
console.log(await p.evaluate(() => window.__copy));
await p.screenshot({ path: 'tools/_shots/picker-phone.png' });
await b.close();

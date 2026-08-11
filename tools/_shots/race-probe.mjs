import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--mute-audio'] });
const p = await (await b.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true })).newPage();
p.on('pageerror', e => console.log('PAGEERR', e.message));
await p.goto('http://localhost:8899/play/');
await p.waitForTimeout(900);
const probe = await p.evaluate(() => new Promise(res => {
  const out = { teardowns: [] };
  const orig = BKDrill.teardown;
  BKDrill.teardown = function(){ out.teardowns.push(new Error('t').stack.split('\n').slice(1,5).join(' | ')); return orig.apply(this,arguments) };
  localStorage.setItem('bk_coach','1');
  BKDrill.start(BKDrill.list[0]);
  setTimeout(() => res(out), 600);
}));
console.log(JSON.stringify(probe, null, 1));
await b.close();

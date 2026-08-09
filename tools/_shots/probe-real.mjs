import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const p = await (await b.newContext()).newPage();
p.on('pageerror', e => console.log('PAGEERR', e.message));
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await p.goto('file:///home/user/ball-knowledge/docs/dev/daily-theatre.html');
await p.waitForTimeout(400);
console.log('start', await p.evaluate(() => ({ snd: BKTheatre._snd(), plays: BKTheatre._realPlays() })));
await p.evaluate(() => BKTheatre.make());
let t = 0;
for (const ms of [700, 900, 1200, 1800, 3000]) {
  await p.waitForTimeout(ms - t); t = ms;
  console.log(ms + 'ms', await p.evaluate(() => window.__realPlays || 0));
}
await b.close();

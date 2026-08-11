import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--mute-audio'] });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await p.goto('file:///home/user/ball-knowledge/docs/dev/daily-theatre.html');
await p.waitForTimeout(600);
await p.screenshot({ path: 'tools/_shots/theatre-phone.png', fullPage: false });
await b.close();
console.log('shot saved');

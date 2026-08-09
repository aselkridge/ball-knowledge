import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--mute-audio'] });
const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage();
await p.goto('file:///home/user/ball-knowledge/docs/dev/crowd-audition.html');
await p.waitForTimeout(500);
await p.screenshot({ path: 'tools/_shots/crowd-phone.png' });
await b.close();
console.log('shot saved');

import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:470,height:760},deviceScaleFactor:2});
await p.goto('file:///home/user/ball-knowledge/docs/dev/gym-sample.html');
await p.waitForTimeout(700);
await p.locator('.gym').screenshot({path:'docs/dev/gym-sample.png'});
await b.close();

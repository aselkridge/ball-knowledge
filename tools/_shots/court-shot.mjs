import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:600,height:620},deviceScaleFactor:2});
await p.goto('file:///home/user/ball-knowledge/docs/dev/_courtprobe.html');
await p.waitForTimeout(400);
await p.screenshot({path:'/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/court.png'});
await b.close();

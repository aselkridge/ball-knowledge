import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const c=await b.newContext({viewport:{width:430,height:1500},colorScheme:'dark',deviceScaleFactor:2});
const p=await c.newPage(); await p.goto('file://'+SP+'/coach-lists.html'); await p.waitForTimeout(500);
await p.evaluate(()=>document.querySelector('#ruled').scrollIntoView());
await p.waitForTimeout(250); await p.screenshot({path:`${SP}/art/ruled.png`});
await b.close();

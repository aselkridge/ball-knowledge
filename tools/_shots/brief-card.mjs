import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const c=await b.newContext({viewport:{width:390,height:1050},colorScheme:'dark',deviceScaleFactor:2});
const p=await c.newPage(); await p.goto('file://'+SP+'/artbrief.html'); await p.waitForTimeout(400);
await p.evaluate(()=>document.querySelector('h2.tier').scrollIntoView());
await p.waitForTimeout(200); await p.screenshot({path:`${SP}/art/brief-card.png`});
await b.close();

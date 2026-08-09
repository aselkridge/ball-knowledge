import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const [tag,w,h,theme] of [['desk-count',1440,900,'dark'],['phone-count',390,844,'light']]){
  const c=await b.newContext({viewport:{width:w,height:h},colorScheme:theme,deviceScaleFactor:2});
  const p=await c.newPage(); await p.goto('file://'+SP+'/coach-lists.html'); await p.waitForTimeout(500);
  await p.evaluate(()=>document.querySelector('#count').scrollIntoView());
  await p.waitForTimeout(200); await p.screenshot({path:`${SP}/art/${tag}.png`});
  await c.close();
}
await b.close();

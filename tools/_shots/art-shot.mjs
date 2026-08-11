import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const [tag,w,h] of [['phone',390,844],['desktop',1440,900]])
 for(const theme of ['dark','light']){
  const c=await b.newContext({viewport:{width:w,height:h},colorScheme:theme,deviceScaleFactor:2});
  const p=await c.newPage();
  await p.goto('file://'+SP+'/coach-lists.html');
  await p.waitForTimeout(600);
  const seen=await p.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  const over=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  console.log(`${tag}/${theme}  body-bg ${seen}  h-overflow ${over}px`);
  await p.screenshot({path:`${SP}/art/${tag}-${theme}.png`});
  await p.evaluate(()=>document.querySelector('#two').scrollIntoView());
  await p.evaluate(()=>document.querySelectorAll('#two details').forEach((d,i)=>{if(i<3)d.open=true}));
  await p.waitForTimeout(250);
  await p.screenshot({path:`${SP}/art/${tag}-${theme}-lists.png`});
  await c.close();
 }
await b.close();

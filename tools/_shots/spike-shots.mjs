import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
for(const [tag,w,h,mob] of [['phone',390,844,true],['desktop',1180,900,false]]){
  const c=await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob,deviceScaleFactor:2});
  const p=await c.newPage(); await p.goto('file:///home/user/ball-knowledge/docs/dev/places-spike.html');
  await p.waitForTimeout(700);
  await p.screenshot({path:`${SP}/art/spike2-${tag}-home.png`});
  await p.click('.hs[data-nm="The gate"]'); await p.waitForTimeout(1500);
  await p.screenshot({path:`${SP}/art/spike2-${tag}-deep.png`});
  await c.close();
}
await b.close();

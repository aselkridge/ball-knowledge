import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
for(const [tag,w,h,m] of [['phone',390,844,true],['desktop',1440,900,false]]){
  const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m,deviceScaleFactor:2});
  const p=await c.newPage(); await p.goto('file:///home/user/ball-knowledge/docs/dev/places-spike.html');
  await p.waitForTimeout(500);
  const box=await p.evaluate(()=>{const e=document.querySelector('.hs[data-nm="The gate"]');
    const r=e.getBoundingClientRect(); return {x:r.x|0,y:r.y|0,w:r.width|0,h:r.height|0,
    top:(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)||{}).className}});
  await p.click('.hs[data-nm="The gate"]').catch(e=>console.log(tag,'CLICK FAILED'));
  await p.waitForTimeout(1400);
  const st=await p.evaluate(()=>({cls:document.getElementById('pl').className, s:window.BKSpike()}));
  console.log(tag, JSON.stringify(box), '->', st.cls, 'z='+st.s.z);
  await c.close();
}
await b.close();

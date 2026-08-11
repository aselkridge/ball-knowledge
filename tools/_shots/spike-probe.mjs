import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const [tag,w,h,mobile] of [['iphone-390',390,844,true],['desktop-1440',1440,900,false]]){
  const c=await b.newContext({viewport:{width:w,height:h},isMobile:mobile,hasTouch:mobile,
    deviceScaleFactor:2, userAgent: mobile?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15':undefined});
  const p=await c.newPage();
  await p.goto('file:///home/user/ball-knowledge/docs/dev/places-spike.html');
  await p.waitForTimeout(700);
  const r=await p.evaluate(()=>{
    const pl=document.getElementById('pl'), cam=document.getElementById('cam');
    const hs=document.querySelector('.hs'), ring=document.querySelector('.hs .ring');
    const R=e=>{const b=e.getBoundingClientRect();return {w:+b.width.toFixed(1),h:+b.height.toFixed(1),x:+b.x.toFixed(0),y:+b.y.toFixed(0)}};
    return {
      layoutW: document.documentElement.clientWidth,
      innerW: window.innerWidth,
      hasViewportMeta: !!document.querySelector('meta[name=viewport]'),
      place: R(pl), cam: R(cam), hotspot: R(hs), ring: R(ring),
      camBg: getComputedStyle(cam).backgroundImage.slice(0,40),
      ringVisible: ring.getBoundingClientRect().width>0
    };
  });
  console.log(tag, JSON.stringify(r,null,1));
  await c.close();
}
await b.close();

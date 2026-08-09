import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const p=await c.newPage(); await p.goto('http://localhost:8899/play/'); await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{
  const pv=document.getElementById('pauseveil'); pv.classList.add('on');
  const btn=document.querySelector('#pauseveil .fb-open');
  const r=btn.getBoundingClientRect();
  const hit=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
  return {btn:{x:r.x|0,y:r.y|0,w:r.width|0,h:r.height|0},
          pvDisplay:getComputedStyle(pv).display,
          menuH:document.querySelector('#pauseveil .menu').getBoundingClientRect().height|0,
          hit:hit?(hit.id||hit.className):'null',
          vh:window.innerHeight};
}));
await b.close();

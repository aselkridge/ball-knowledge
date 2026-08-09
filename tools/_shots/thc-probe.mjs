import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
await p.goto('file:///home/user/ball-knowledge/docs/dev/daily-theatre.html');
await p.waitForTimeout(400);
console.log(await p.evaluate(()=>[...document.querySelectorAll('.ctl button, .dva')].map(e=>{
  const r=e.getBoundingClientRect();
  const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
  return {t:e.textContent.slice(0,18), reach:!!(hit&&(e.contains(hit)||hit===e)),
    hit:hit?(hit.id||hit.className||hit.tagName):'null', y:r.y|0, h:r.height|0};
})));
await b.close();

import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const [tag,w,h,theme] of [['phone',390,844,'dark'],['phone',390,844,'light'],['desktop',1440,1000,'dark']]){
  const c=await b.newContext({viewport:{width:w,height:h},colorScheme:theme,deviceScaleFactor:2,
    permissions:[]});
  const p=await c.newPage(); await p.goto('file://'+SP+'/artbrief.html'); await p.waitForTimeout(500);
  const r=await p.evaluate(()=>({
    bg:getComputedStyle(document.body).backgroundColor,
    over:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    cards:document.querySelectorAll('article.card').length,
    prompts:document.querySelectorAll('pre.p').length,
    copyBtns:document.querySelectorAll('button.cp').length,
    styleLen:document.getElementById('styleblock').textContent.length,
    prog:document.getElementById('prog').textContent,
    // every prompt must be non-empty and every card must name a file
    empties:[...document.querySelectorAll('pre.p')].filter(e=>e.textContent.trim().length<80).length,
    noSave:[...document.querySelectorAll('article.card')].filter(c=>!/\.(jpg|png)/i.test(c.textContent)).length,
    hit:[...document.querySelectorAll('button.cp')].every(e=>{
      const r=e.getBoundingClientRect();
      const t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      return !t||e.contains(t)||t===e;}),
  }));
  console.log(`${tag}/${theme}`, JSON.stringify(r));
  await p.screenshot({path:`${SP}/art/brief-${tag}-${theme}.png`});
  // tick two boxes, reload, confirm they survive
  if(tag==='phone'&&theme==='dark'){
    await p.click('article[data-id=c0] .tick input');
    await p.click('article[data-id=c1] .tick input');
    const before=await p.evaluate(()=>document.getElementById('prog').textContent);
    await p.reload(); await p.waitForTimeout(400);
    const after=await p.evaluate(()=>document.getElementById('prog').textContent);
    console.log('  ticks persist:', before===after, JSON.stringify(after));
  }
  await c.close();
}
await b.close();

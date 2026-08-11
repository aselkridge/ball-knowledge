import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const p=await c.newPage();
let errs=0; p.on('pageerror',e=>{errs++;console.log('PAGE ERROR',e.message)});
await p.goto('file://'+SP+'/audition.html'); await p.waitForTimeout(600);
const r=await p.evaluate(async ()=>{
  const rows=[...document.querySelectorAll('.row')];
  // every audio must DECODE: load metadata and demand a real duration
  let decoded=0, bad=[];
  for(const row of rows){
    const a=row.querySelector('audio');
    await new Promise(res=>{
      a.addEventListener('loadedmetadata',res,{once:true});
      a.addEventListener('error',res,{once:true});
      a.load(); setTimeout(res,1500);
    });
    if(a.duration>0.04&&a.duration<2) decoded++; else bad.push(row.dataset.k);
  }
  // vote, reload persistence tested outside
  rows[0].querySelector('.keep').click();
  rows[1].querySelector('.kill').click();
  return {rows:rows.length, decoded, bad:bad.slice(0,4),
    over:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    nk:document.getElementById('nk').textContent,
    canv:[...document.querySelectorAll('.wv')].every(c2=>c2.width===120)};
});
console.log(JSON.stringify(r));
await p.reload(); await p.waitForTimeout(500);
const kept=await p.evaluate(()=>({
  keep:document.querySelectorAll('.row.keep').length,
  kill:document.querySelectorAll('.row.kill').length}));
console.log('after reload:',JSON.stringify(kept),'pageErrors:',errs);
await p.screenshot({path:`${SP}/audition.png`});
await b.close();

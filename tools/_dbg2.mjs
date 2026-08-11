import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,140))});
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>localStorage.clear());
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{
  window.BK._srRoll('nba',0);
  const el=document.querySelector('.sr-rar');
  return {screen:document.querySelector('.screen.on')?.id,
          rar:!!el, label:el?el.querySelector('.rl').textContent:null,
          slot:!!document.getElementById('srRarSlot')};
}));
await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{
  const el=document.querySelector('.sr-rar');
  return {screen:document.querySelector('.screen.on')?.id, rar:!!el,
          label:el?el.querySelector('.rl').textContent.trim():null};
}));
await b.close();

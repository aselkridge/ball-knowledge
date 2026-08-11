import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
mkdirSync('tools/_shots/out/palette',{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>localStorage.clear());
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1100);
// the knowledge-level ladder lives on the rules screen
await p.evaluate(()=>window.BK._show('rules')); await p.waitForTimeout(600);
await p.evaluate(()=>document.getElementById('klRulesWild').click());
await p.waitForTimeout(900);
await p.screenshot({path:'tools/_shots/out/palette/wild-selected.png'});
// and the ladder with Legend picked, to see the new purple next to its siblings
await p.evaluate(()=>{const r=document.getElementById('klRulesRow');
  [...r.children].forEach(b=>{if(/legend/i.test(b.textContent))b.click();});});
await p.waitForTimeout(700);
await p.screenshot({path:'tools/_shots/out/palette/legend-selected.png'});
console.log('ok');
await b.close();

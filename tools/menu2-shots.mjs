/* The new main menu, real captures. classic vs new, both viewports, both
 * themes — the comparison Aaron gets to judge it on. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT='docs/dev/menu2'; fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
for (const [tag,w,h] of [['phone',390,844],['desktop',1440,900]])
  for (const theme of ['dark','light'])
    for (const menu of ['classic','new']) {
      const c=await b.newContext({viewport:{width:w,height:h},hasTouch:w<900,isMobile:w<900});
      const p=await c.newPage();
      await p.goto('http://127.0.0.1:8899/play/');
      await p.evaluate(a=>{const s=JSON.parse(localStorage.getItem('bk_settings')||'{}');
        s.theme=a.t;s.music=false;localStorage.setItem('bk_settings',JSON.stringify(s));
        localStorage.setItem('bk_coach','0');localStorage.setItem('bk_menu',a.m);
        ['bk_daily5','bk_daily5r','bk_daily5p','bk_daily5h'].forEach(k=>localStorage.removeItem(k));},
        {t:theme==='light'?'whiteout':'hardwood',m:menu});
      await p.reload({waitUntil:'networkidle'}); await sleep(2100);
      const body=await p.evaluate(()=>document.body.className.match(/theme-\w+/)[0]);
      const on=await p.evaluate(()=>[...document.querySelectorAll('.screen.on')].map(s=>s.id).join(','));
      console.log(`${tag}/${theme}(${body})/${menu}: ${on}`);
      await p.screenshot({path:`${OUT}/${tag}-${theme}-${menu}.png`});
      await c.close();
    }
await b.close();
console.log('\nshots in '+OUT);

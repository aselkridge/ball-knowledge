import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
mkdirSync('tools/_shots/out/palette',{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
for (const want of ['legendary','epic','halloffame']) {
  const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>localStorage.clear());
  await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1100);
  // force the rarity: reroll until the wanted one lands, capped so it cannot hang
  const got=await p.evaluate(async w=>{
    for(let i=0;i<400;i++){
      window.BK._srRoll('nba',0);
      const el=document.querySelector('.sr-rar');
      const t=el?el.querySelector('.rl').textContent.trim().toLowerCase()
                  .replace(/ pack$/,'').replace(/ /g,''):'';
      if(t===w){window.BK._show('squad');return t;}
    }
    return 'MISS';
  },want);
  await p.waitForTimeout(1400);
  // flip the cards up so the tier badges are visible under the rarity chip
  await p.evaluate(()=>document.querySelectorAll('.sr-card.down').forEach(c=>c.classList.remove('down')));
  await p.waitForTimeout(900);
  await p.screenshot({path:`tools/_shots/out/palette/reveal-${want}.png`});
  console.log(want,'->',got);
  await p.context().close();
}
await b.close();

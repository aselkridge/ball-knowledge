/* Before/after for Aaron's 2026-08-11 colour rulings. The "before" is the SAME
 * page with the old values pushed back into the live palette objects and the
 * paint re-run, so each pair differs only by the ruling. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const OUT='tools/_shots/out/palette'; mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});

const BEFORE_CSS=`
  .klwild.sel{border-style:solid;border-color:#b98cff!important;color:#b98cff!important;
    background:linear-gradient(180deg,#241a33,#1d1815)!important;animation:none!important}
  .klwild.sel .kw-t{background:none!important;color:#b98cff!important;-webkit-background-clip:border-box!important;animation:none!important}
  .kl-chip.wild{background-image:none!important;color:#b98cff!important;border-color:#b98cff!important;animation:none!important}
`;
const BEFORE_JS=()=>{  // old hexes into the live objects
  window.BK._TIERS[4].c='#ffcf6a';
  window.BK._BRACKETS.legend.col='#ffcf6a';
  window.BK._BRACKETS.wild.col='#b98cff';
  window.BK._SR_RC.epic='#b98cff';
  window.BK._SR_RC.legendary='#ffcf6a';
};

async function fresh(){
  const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>localStorage.clear());
  await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1100);
  return p;
}

/* A+B · the knowledge ladder, Legend picked and wild picked */
for (const state of ['after','before']) {
  const p=await fresh();
  if(state==='before')await p.evaluate(BEFORE_JS);
  if(state==='before')await p.addStyleTag({content:BEFORE_CSS});
  await p.evaluate(()=>window.BK._show('rules')); await p.waitForTimeout(500);
  await p.evaluate(()=>{const r=document.getElementById('klRulesRow');
    [...r.children].forEach(b=>{if(/legend/i.test(b.textContent))b.click();});});
  await p.waitForTimeout(600);
  await p.screenshot({path:`${OUT}/kl-legend-${state}.png`,clip:{x:0,y:230,width:390,height:420}});
  await p.evaluate(()=>document.getElementById('klRulesWild').click());
  await p.waitForTimeout(700);
  await p.screenshot({path:`${OUT}/kl-wild-${state}.png`,clip:{x:0,y:230,width:390,height:420}});
  await p.context().close();
  console.log('ladder',state,'ok');
}

/* C+D · the reveal at legendary and epic: roll once, shoot after, then push the
   old palette into the SAME rolled squad and shoot before. Same players. */
for (const want of ['legendary','epic']) {
  const p=await fresh();
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
  if(got==='MISS'){console.log(want,'MISS');await p.context().close();continue;}
  await p.waitForTimeout(1400);
  await p.evaluate(()=>document.querySelectorAll('.sr-card.down').forEach(c=>c.classList.remove('down')));
  await p.waitForTimeout(900);
  await p.screenshot({path:`${OUT}/reveal-${want}-after.png`,clip:{x:0,y:180,width:390,height:500}});
  await p.evaluate(w=>{  // repaint the chip in the old colour, same squad
    const old={legendary:'#ffcf6a',epic:'#b98cff'}[w];
    document.querySelector('.sr-rar').style.setProperty('--rc',old);
  },want);
  await p.waitForTimeout(300);
  await p.screenshot({path:`${OUT}/reveal-${want}-before.png`,clip:{x:0,y:180,width:390,height:500}});
  await p.context().close();
  console.log('reveal',want,'ok (same squad both frames)');
}
await b.close();

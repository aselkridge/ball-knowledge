/* Before/after shots for B5's drill defects. BEFORE is produced by turning the
 * fixes back off in the live page (dodge removed, pointer-events restored,
 * greying stripped), so both frames come from the same build and the only
 * difference is the fix itself. A hand-made "before" would be a drawing. */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const OUT='tools/_shots/out/b5'; mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--mute-audio']});

/* Put the three defects back. This MUST be done with CSS, not by clearing the
 * classes: the drill's 400ms poll calls panelDodge() internally, so a stubbed
 * BKDrill._dodge and a removed .hi are both undone within half a second, and
 * the first run of this script produced a "before" frame that was silently
 * showing the FIXED behaviour. A before/after where the before is really the
 * after is worse than no comparison at all. */
const UNFIX=()=>{
  const s=document.createElement('style');
  s.textContent='#coachPanel.hi{bottom:66px!important;top:auto!important}'+
                '#coachPanel{pointer-events:auto!important}'+
                '.bigbtn.drill-off{filter:none!important;opacity:1!important}';
  document.head.appendChild(s);
};

for (const [w,h,tag] of [[1440,760,'desktop'],[390,844,'phone']]) {
  for (const state of ['before','after']) {
    const p=await (await b.newContext({viewport:{width:w,height:h},
      deviceScaleFactor:2})).newPage();
    await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
    await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
    await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1200);
    await p.evaluate(()=>window.BKDrill.start('basics'));
    await p.waitForTimeout(1300);
    /* stage a move so the Confirm row -- the thing the card was covering -- is
       actually on screen, and put a gated SHOOT button next to it */
    await p.evaluate(()=>{
      const s=window.BK.state(), me=s.pieces[s.ball.holder];
      let t=window.BK.tileToScreen(me.c,me.r); window.BK._tap(t.x,t.y);
      t=window.BK.tileToScreen(me.c,me.r+1);   window.BK._tap(t.x,t.y);
    });
    await p.waitForTimeout(500);
    if (state==='before') await p.evaluate(UNFIX);
    else await p.evaluate(()=>{window.BKDrill._dodge();window.BKDrill._grey();});
    await p.waitForTimeout(400);
    await p.screenshot({path:`${OUT}/${tag}-${state}.png`});
    console.log(tag,state,'ok');
    await p.context().close();
  }
}
/* and one of each new drill, so the three additions are visible not just claimed */
for (const d of ['contest','inbound','fire']) {
  const p=await (await b.newContext({viewport:{width:390,height:844},
    deviceScaleFactor:2})).newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1200);
  await p.evaluate(x=>window.BKDrill.start(x),d);
  await p.waitForTimeout(1600);
  await p.screenshot({path:`${OUT}/drill-${d}.png`});
  console.log('drill',d,'ok');
  await p.context().close();
}
await b.close();

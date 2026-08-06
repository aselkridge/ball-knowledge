/* LEAVING A DRILL MUST END THE DRILL, BY EVERY ROUTE.
 * Aaron, 08-05: the coach card was still on the main menu saying "Now tap a
 * teammate", with Restart and End drill on it, and the boombox still reading
 * IRONY. Two symptoms, one cause -- the cleanup lived inside the one exit that
 * also navigated, so every other exit left DRILL.on true.
 * This walks each route out and asserts the same three things every time. */
import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--mute-audio']});
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};

async function state(p){return p.evaluate(()=>({
  screen:document.querySelector('.screen.on')?.id,
  coach:!!document.querySelector('#coachPanel.on'),
  hud:(document.getElementById('hudMid')||{}).textContent||'',
  /* ASK THE RESOLVER, NOT THE SPEAKER. The first version read the track that
   * was actually PLAYING, which is null in headless because nothing has been
   * allowed to start -- so the music assertion passed under sabotage and was
   * testing nothing. BK._musicWant() is the function that decides the track
   * and it reads DRILL.on directly, which is the thing this bug was about. */
  want:(window.BK&&window.BK._musicWant&&window.BK._musicWant())||null
}));}

/* window.show does NOT exist -- the nav function is BK._show, "the same fn the
 * buttons call". The first version of this harness used window.show&&... , which
 * short-circuits to undefined and navigates NOWHERE, so all four routes
 * "failed" identically while testing nothing at all. A route that cannot move
 * is not a route that found a bug. */
const go=(p,name)=>p.evaluate(n=>window.BK._show(n),name);
const ROUTES={
  'the drill’s own End drill':async p=>p.evaluate(()=>window.BKDrill.end()),
  'straight to the main menu' :async p=>go(p,'title'),
  'to the rulebook'           :async p=>go(p,'how'),
  'to settings then the menu' :async p=>{await go(p,'settings');await go(p,'title')},
};
for(const [name,leave] of Object.entries(ROUTES)){
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1100);
  await p.evaluate(()=>window.BKDrill.start(window.BKDrill.list[0]));
  await p.waitForTimeout(1500);
  const inD=await state(p);
  ck(inD.coach&&/DRILL/.test(inD.hud),'drill actually started  ('+name+')',inD.hud.trim());
  await leave(p); await p.waitForTimeout(1400);
  const out=await state(p);
  ck(!out.coach, 'coach card is gone       ('+name+')');
  ck(!/DRILL/.test(out.hud),'the DRILL banner is gone ('+name+')',JSON.stringify(out.hud));
  ck(out.want!=='tutorial','music leaves the drill track ('+name+')','resolver wants: '+out.want);
  await p.close();
}
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));
process.exit(fails.length?1:0);

/* B4 · THE WAKE LOCK. Serve docs/ on :8899 first.
 *
 * Two things are asserted separately on purpose. INTENT (WAKE.want) is ours and
 * must be exactly right. HELD is the browser's answer and a real phone can
 * refuse it on low battery, so a test that only checked "held" would be
 * testing Chromium's mood rather than our logic.
 */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});
const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
await p.reload({waitUntil:'networkidle'});await sleep(1800);

/* SHOW AND READ IN ONE EVALUATE. Split across two, the read landed before the
   request promise resolved and every "held" check failed while the feature
   worked perfectly, which cost a probe to find. The wait belongs INSIDE the
   page, next to the thing it is waiting for. */
const at=async n=>p.evaluate(async x=>{
  window.BK._show(x);
  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,40));
    const w=BKWake();
    if(!w.want||w.held)return w;      /* settled either way */
  }
  return BKWake();
},n);

ck(!(await at('title2')).want,'MENU · no lock on the main menu, it is a battery cost');
ck(!(await at('how')).want,'MENU · none in the Rulebook either');
const g=await at('game');
ck(g.want,'GAME · the lock is wanted the moment a game is up');
ck(g.held,'GAME · and the browser actually granted it');
const d=await at('daily');
ck(d.want&&d.held,'DAILY FIVE · held too, because ten timed cards is watching without touching',
   JSON.stringify(d));
ck((await at('versus')).want,'VERSUS · held through the cinematic, which is pure watching');
const back=await at('title2');
ck(!back.want&&!back.held,'LEAVING · walking back to the menu RELEASES it',JSON.stringify(back));

/* THE ONE THAT MATTERS. The browser takes the lock back whenever the page is
   hidden and never returns it, so without a re-acquire the lock works exactly
   once: switch apps to check a score, come back, and the screen sleeps again. */
await at('game');
await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',
  {value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await sleep(200);
ck(!(await p.evaluate(()=>BKWake())).held,'HIDDEN · the lock is let go when the tab hides');
ck((await p.evaluate(()=>BKWake())).want,'HIDDEN · but the INTENT survives, so it can come back');
await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',
  {value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
for(let i=0;i<30;i++){await sleep(40);if((await p.evaluate(()=>BKWake())).held)break}
ck((await p.evaluate(()=>BKWake())).held,
   'RETURNING · it is re-acquired, so the lock works more than once');

/* BREAK IT: a phone with no wakeLock at all must behave exactly as before */
{
  const c2=await b.newContext({viewport:{width:390,height:844}});
  const p2=await c2.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));
  await p2.addInitScript(()=>{try{delete navigator.wakeLock}catch(e){}
    Object.defineProperty(navigator,'wakeLock',{get(){return undefined}})});
  await p2.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await sleep(1800);
  await p2.evaluate(()=>window.BK._show('game'));await sleep(300);
  const w=await p2.evaluate(()=>BKWake());
  ck(w.want&&!w.held,'BREAK · no wakeLock API: intent stands, nothing held, nothing thrown',
     JSON.stringify(w));
  ck(e2.length===0,'BREAK · and not one page error',e2.slice(0,1).join(''));
  await c2.close();
}
ck(errs.length===0,'no page errors',errs.slice(0,2).join(' | '));
console.log('\n  '+(fails.length?fails.length+' FAILED':'ALL CHECKS PASS'));
fails.forEach(f=>console.log('   - '+f));
await b.close();
process.exit(fails.length?1:0);

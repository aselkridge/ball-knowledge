/* THE DAILY FIVE STAMP — proof the calendar behaves. Serve docs/ on :8899. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>{localStorage.removeItem('bk_daily5');localStorage.setItem('bk_coach','0')});
await p.reload({waitUntil:'networkidle'});await sleep(900);

const fresh=await p.evaluate(()=>{const e=document.getElementById('dailyStamp');
  return {exists:!!e,done:e.classList.contains('done'),
    day:document.getElementById('dsDay').textContent,
    month:document.getElementById('dsMonth').textContent,
    today:String(new Date().getDate())};});
ck(fresh.exists,'the stamp exists on the main menu');
ck(!fresh.done,'a fresh day is NOT greyed out');
ck(fresh.day===fresh.today,'it shows today\'s real date',fresh.month+' '+fresh.day);

await p.evaluate(()=>document.getElementById('dailyStamp').click());
await sleep(300);
const after=await p.evaluate(()=>({done:document.getElementById('dailyStamp').classList.contains('done'),
  stored:localStorage.getItem('bk_daily5')}));
ck(after.done,'playing it greys the stamp and shows the check');
ck(/^\d{4}-\d{2}-\d{2}$/.test(after.stored||''),'today is stored as a date string',after.stored);

// survives a reload — the whole point of a daily
await p.reload({waitUntil:'networkidle'});await sleep(800);
const reload=await p.evaluate(()=>document.getElementById('dailyStamp').classList.contains('done'));
ck(reload,'still done after a reload');

// a NEW day re-arms it
await p.evaluate(()=>localStorage.setItem('bk_daily5','2020-01-01'));
await p.reload({waitUntil:'networkidle'});await sleep(800);
const rolled=await p.evaluate(()=>document.getElementById('dailyStamp').classList.contains('done'));
ck(!rolled,'a new day re-arms the stamp');
/* VERSION B: it has to be a DRAW, not a corner ornament. Three things Aaron
   asked for, each measured rather than eyeballed: it sits beside the title,
   it slams a word like every other live button, and it tilts. */
const geom=await p.evaluate(()=>{
  const st=document.getElementById('dailyStamp');
  const h1=document.querySelector('#screen-title h1');
  const a=st.getBoundingClientRect(),b=h1.getBoundingClientRect();
  const cs=getComputedStyle(st);
  return {w:Math.round(a.width),h:Math.round(a.height),
    leftOfTitle:a.right<=b.left+4,
    gap:Math.round(b.left-a.right),
    vOverlap:Math.round(Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)),
    tilt:cs.getPropertyValue('--dsTilt').trim(),
    pow:st.getAttribute('data-pow'),
    sq:+(a.width/a.height).toFixed(2)};
});
ck(geom.leftOfTitle&&geom.gap<70,'it sits just left of the BALL KNOWLEDGE title',
   geom.gap+'px gap');
ck(geom.vOverlap>60,'it lines up beside the title, not above it',
   geom.vOverlap+'px of shared height');
ck(geom.w>=170,'bigger than version A (was 120px wide)',geom.w+'px wide');
ck(geom.sq>0.8&&geom.sq<1.2,'and roughly square, not a tall page',geom.sq+':1');
ck(geom.tilt!=='' && geom.tilt!=='0deg','it is tilted off the grid',geom.tilt);

/* the slam: a real click has to spawn a .pow with the stamp's own word, and
   a crossed-off stamp must NOT slam — measured by counting .pow nodes. */
const slam=await p.evaluate(async()=>{
  const st=document.getElementById('dailyStamp');
  const grab=()=>[...document.querySelectorAll('#screen-title .pow')].map(x=>x.textContent);
  st.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:200,clientY:300}));
  const fresh=grab();
  const shook=document.querySelector('.title-wrap').classList.contains('shake');
  await new Promise(r=>setTimeout(r,700));
  st.classList.add('done');
  st.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:200,clientY:300}));
  const afterDone=grab();
  st.classList.remove('done');
  return {fresh:fresh,shook:shook,afterDone:afterDone.length};
});
ck(slam.fresh.length===1&&slam.fresh[0]==='CLOCK IN!','clicking it slams a word',
   slam.fresh.join(',')||'nothing slammed');
ck(slam.shook,'and shakes the title block, like the menu buttons shake the menu');
ck(slam.afterDone===0,'a stamp already crossed off does not slam again',
   slam.afterDone+' extra slams');

ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

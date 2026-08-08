/* THE COACH STOPS THE CLOCK, THE RESET DOOR CLEARS THE DAY, AND THE MENU IS
 * RE-RANKED. Three of Aaron's asks from 2026-08-08, one harness, because all
 * three are things a screenshot cannot prove: a stopped clock and a slow clock
 * look identical in a still.
 *
 * Serve docs/ on :8899 first.
 *
 * The pause test is the reason this file exists. "The clock pauses" is a claim
 * about TIME, so it is measured in time: read the remaining milliseconds, hold
 * the world for a second and a half, read it again, and demand the difference
 * be under a frame or two. A version that only checked for a CSS class would
 * have passed against a clock that never stopped counting.
 */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));

/* ---------------------------------------------------------------- MENU ORDER */
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
/* D18's re-ranking is a CLASSIC-menu change, and from 2026-08-08 the classic
   menu is not the default — so pin it. A hidden screen reports every element at
   top:0, which made "they run down the page in order" fail for a reason that
   has nothing to do with the order. */
await p.evaluate(()=>{localStorage.setItem('bk_coach','0');
                      localStorage.setItem('bk_menu','classic')});
await p.reload({waitUntil:'networkidle'});await sleep(1400);

const menu=await p.evaluate(()=>[...document.querySelectorAll('#screen-title .menu .mbtn')]
  .map(e=>({id:e.id||null,
            idx:(e.querySelector('.idx')||{}).textContent||'',
            lbl:(e.querySelector('.lbl')||{}).textContent||'',
            top:Math.round(e.getBoundingClientRect().top)})));
ck(menu.length===5,'five things on the menu',menu.length+'');
ck(menu[0].id==='btnCpu'&&menu[1].id==='btnOnline',
   'Online sits DIRECTLY below Vs the CPU',menu.map(m=>m.lbl.split(' ·')[0]).join(' > '));
ck(menu.map(m=>m.idx).join(',')==='01,02,03,04,05',
   'the printed numbers were renumbered with the move',menu.map(m=>m.idx).join(','));
/* the numbers must agree with the geometry — a list that reads 01,02,03 down
   the page while the DOM says otherwise is worse than either alone */
ck(menu.every((m,i)=>i===0||m.top>menu[i-1].top),
   'and they run down the page in that same order',
   menu.map(m=>m.top).join(','));
ck(menu[4].lbl.indexOf('Packs')===0,'the locked tease is still last',menu[4].idx+' '+menu[4].lbl);

/* -------------------------------------------------------- THE COACH'S PAUSE */
/* Coach ON, seen-memory cleared, and a run walked out on so the resume notice
   has a reason to fire. Everything below drives the REAL functions. */
await p.evaluate(()=>{
  localStorage.setItem('bk_coach','1');
  localStorage.setItem('bk_menu','classic');
  localStorage.removeItem('bk_coach_seen');
  ['bk_daily5','bk_daily5r','bk_daily5p','bk_daily5h'].forEach(k=>localStorage.removeItem(k));
});
await p.reload({waitUntil:'networkidle'});await sleep(1400);
await p.evaluate(()=>{document.getElementById('dailyStamp').click()});
await sleep(400);
/* answer two, then walk out mid-third */
/* REPORT, NEVER CRASH. A harness that throws on a missing button tells you
   nothing about the twelve checks that were going to run after it — this file
   has already cost that once. tap() returns false instead. */
const tap=async correct=>p.evaluate(async correct=>{
  const D=BKDaily._state();if(!D||D.phase!=='card')return false;
  const idxs=D.round===1?D.set.shots:D.set.stops;
  const q=QUESTIONS[idxs[D.i]];
  const btns=document.querySelectorAll('#dvCard .dva');
  if(!btns.length||!q)return false;
  btns[correct?q.a:(q.a+1)%btns.length].click();
  return true;
},correct);
/* Play the rest of the run out, wherever it currently stands. WRONG on purpose
   throughout: a sweep opens the Heat Check, which is a typed answer and a
   different screen, and this test is about the reset door — not about how the
   bonus round ends. */
async function playOut(){
  for(let n=0;n<40;n++){
    const st=await p.evaluate(()=>{const D=BKDaily._state();
      return D?{phase:D.phase,cards:document.querySelectorAll('#dvCard .dva').length}:null});
    if(!st||st.phase==='result')return true;
    if(st.cards===4&&st.phase==='card'){await tap(false);await sleep(1800);}
    else await sleep(600);
  }
  return false;
}
await tap(true);await sleep(1900);
await tap(true);await sleep(1900);
await p.evaluate(()=>BKDaily._leaving());
await sleep(200);

/* reopen: showCard deals card 3 and starts its clock, then the coach speaks */
await p.evaluate(()=>{document.getElementById('coachTip')&&BKCoach.hide();document.getElementById('dailyStamp').click()});
await sleep(500);

const held0=await p.evaluate(()=>{
  const w=document.getElementById('dvClockWrap');
  const t=document.getElementById('coachTip');
  const v=document.getElementById('coachVeil');
  return {tipOn:!!(t&&t.classList.contains('on')),
          who:(t&&t.querySelector('.ct-who').textContent)||'',
          modal:!!(t&&t.classList.contains('modal')),
          veil:!!(v&&v.classList.contains('on')),
          held:!!(w&&w.classList.contains('held')),
          num:(document.getElementById('dvClockNum')||{}).textContent||''};
});
ck(held0.tipOn,'RESUME · the coach card is up');
ck(held0.held,'PAUSE · the clock is marked HELD',held0.num);
ck(held0.who.indexOf('CLOCK STOPPED')>=0,'PAUSE · and the card SAYS the clock is stopped',held0.who);
ck(held0.modal&&held0.veil,'PAUSE · the veil is up, so the board is blocked too');

/* THE MEASUREMENT. Two reads a second and a half apart. */
const t0=await p.evaluate(()=>document.getElementById('dvClockNum').textContent);
const w0=Date.now();
await sleep(1600);
const t1=await p.evaluate(()=>document.getElementById('dvClockNum').textContent);
ck(t0===t1,'PAUSE · '+Math.round((Date.now()-w0)/100)/10+'s of real time cost ZERO clock',
   t0+' -> '+t1);

/* and the answer buttons are genuinely unreachable, not merely covered */
const blocked=await p.evaluate(()=>{
  const btn=document.querySelector('#dvCard .dva');if(!btn)return 'no card';
  const r=btn.getBoundingClientRect();
  const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return hit===btn?'REACHABLE':(hit&&hit.id)||(hit&&hit.className)||'?';
});
ck(blocked!=='REACHABLE','PAUSE · a tap on an answer lands on the veil, not the answer',blocked);

/* dismiss: the clock takes back the time it had, not a fresh full clock */
const before=await p.evaluate(()=>document.getElementById('dvClockNum').textContent);
await p.evaluate(()=>document.querySelector('#coachTip .ct-ok').click());
await sleep(120);
const after=await p.evaluate(()=>({
  num:document.getElementById('dvClockNum').textContent,
  held:document.getElementById('dvClockWrap').classList.contains('held')}));
ck(!after.held,'RESUME · dismissing the card releases the clock');
ck(after.num===before,'RESUME · and it restarts on the seconds it had, not a fresh clock',
   before+' -> '+after.num);
await sleep(1400);
const running=await p.evaluate(()=>document.getElementById('dvClockNum').textContent);
ck(running!==after.num,'RESUME · and it is actually counting again',after.num+' -> '+running);

/* -------------------------------------------------------- THE RESET DOOR */
/* Play the day out so there is a receipt, a stamp and a history row to clear. */
await p.evaluate(()=>{BKCoach.set(false)});
ck(await playOut(),'SETUP · the run plays out to a result');
const done=await p.evaluate(()=>({
  stamp:localStorage.getItem('bk_daily5'),
  receipt:!!localStorage.getItem('bk_daily5r'),
  hist:Object.keys(JSON.parse(localStorage.getItem('bk_daily5h')||'{}')).length,
  today:BKDaily._key()}));
ck(done.stamp===done.today&&done.receipt&&done.hist>=1,
   'SETUP · the day is played, stamped and banked',
   'stamp '+done.stamp+' · '+done.hist+' day(s) of history');

await p.goto('http://127.0.0.1:8899/play/?daily=reset',{waitUntil:'networkidle'});
await sleep(1600);
const reset=await p.evaluate(()=>({
  stamp:localStorage.getItem('bk_daily5'),
  receipt:localStorage.getItem('bk_daily5r'),
  run:localStorage.getItem('bk_daily5p'),
  histToday:!!JSON.parse(localStorage.getItem('bk_daily5h')||'{}')[BKDaily._key()],
  onDaily:document.getElementById('screen-daily').classList.contains('on'),
  answers:document.querySelectorAll('#dvCard .dva').length,
  toast:(document.getElementById('bkToast')||{}).textContent||'',
  toastOn:!!(document.getElementById('bkToast')||{classList:{contains:()=>false}}).classList.contains('on'),
  coachSeen:Object.keys(JSON.parse(localStorage.getItem('bk_coach_seen')||'{}')).length}));
ck(!reset.stamp&&!reset.receipt&&!reset.run,'RESET · the stamp, receipt and any half-run are gone');
ck(!reset.histToday,'RESET · today is out of the history too');
ck(reset.onDaily&&reset.answers===4,'RESET · and it lands you on a live card',reset.answers+' answers');
ck(reset.toastOn&&/reset/i.test(reset.toast),'RESET · it says so on screen',reset.toast);
ck(reset.coachSeen>0,'RESET · but it does NOT re-arm the coach — that is what wipe is for',
   reset.coachSeen+' tips still marked seen');

await p.goto('http://127.0.0.1:8899/play/?daily=wipe',{waitUntil:'networkidle'});
await sleep(1600);
const wiped=await p.evaluate(()=>({
  hist:localStorage.getItem('bk_daily5h'),
  coachSeen:Object.keys(JSON.parse(localStorage.getItem('bk_coach_seen')||'{}')).length,
  toast:(document.getElementById('bkToast')||{}).textContent||'',
  streak:(document.getElementById('dvStreakPill')||{}).textContent||''}));
ck(!wiped.hist,'WIPE · the whole history goes',String(wiped.hist));
ck(wiped.coachSeen===0,'WIPE · and every coach tip is re-armed',wiped.coachSeen+' seen');
ck(wiped.streak==='0','WIPE · the streak reads zero again',wiped.streak);
ck(/WIPED/.test(wiped.toast),'WIPE · and it says which one it did',wiped.toast);

/* BREAK IT ON PURPOSE: an unknown value must do NOTHING, not fall through to
   some half-reset. A door this destructive gets exactly two keys. */
await p.evaluate(()=>{localStorage.setItem('bk_daily5','2026-01-01');
  localStorage.setItem('bk_daily5h','{"2026-01-01":{"p":1,"s":[1,0,0,0,0],"t":[0,0,0,0,0],"h":0,"L":1}}')});
await p.goto('http://127.0.0.1:8899/play/?daily=yes',{waitUntil:'networkidle'});
await sleep(1500);
const junk=await p.evaluate(()=>({stamp:localStorage.getItem('bk_daily5'),
  hist:localStorage.getItem('bk_daily5h'),
  which:([...document.querySelectorAll('.screen.on')].map(s=>s.id).join(',')),
  onTitle:/screen-title/.test([...document.querySelectorAll('.screen.on')].map(s=>s.id).join(','))}));
ck(junk.stamp==='2026-01-01'&&!!junk.hist,'BREAK · ?daily=yes touches nothing',junk.stamp);
/* "the title screen" is whichever menu is live — from 2026-08-08 there are two
   and the new one is the default. Asking specifically for #screen-title would
   be asserting a menu choice inside a test about the reset door. */
ck(junk.onTitle,'BREAK · and leaves you on the title screen like any other visit',
   junk.which||'');

ck(errs.length===0,'no page errors',errs.slice(0,2).join(' | '));

console.log('\n  '+(fails.length?fails.length+' FAILED':'ALL CHECKS PASS'));
fails.forEach(f=>console.log('   - '+f));
await b.close();
process.exit(fails.length?1:0);

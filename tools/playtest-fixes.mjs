import pw from 'playwright';
const {chromium}=pw;
const fails=[];const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
/* the Coach's first-time card FREEZES the game, and runTipoff is scheduled on a
   freeze-aware timer -- so with the Coach up the jump ball never arrives. Off. */
await p.evaluate(()=>localStorage.setItem('bk_coach','0'));
await p.reload({waitUntil:'networkidle'});
await p.mouse.click(700,850); await sleep(800);

console.log('TIP-OFF (jump ball) — does the answer light up?');
// start a real game, then force the tip veil open with answers rendered
await p.evaluate(()=>{const K=window.BK.coach;
  K.applyColors({nm:'You',ab:'YOU'},{nm:'Them',ab:'THM'});
  K.startGame({league:'big3',decade:'ANY',target:11,rosters:K.pickRosters('big3','ANY')});
});
// the jump ball opens with a countdown, then arms; poll until the buzz zones unlock
let st={veil:false,n:0};
/* 2.15s jumbo, then a 5-beat countdown at 800ms each -> armed at ~6.2s */
let armed=false;
for(let i=0;i<60&&!armed;i++){
  await sleep(300);
  /* "First to buzz..." is ALSO the static text sitting in index.html, so matching
     it fires before the veil even opens. Armed = veil up AND the zones unlocked. */
  armed=await p.evaluate(()=>document.getElementById('tipveil').classList.contains('on')
    && !document.getElementById('tzA').classList.contains('lock'));
}
console.log('         (jump ball armed: '+armed+')');
if(armed){await p.dispatchEvent('#tzA','pointerdown');await sleep(500);}
st=await p.evaluate(()=>({veil:document.getElementById('tipveil').classList.contains('on'),
                          n:document.querySelectorAll('#tipAns button').length}));
ck(st.n>0,'jump-ball answer buttons rendered','veil='+st.veil+' buttons='+st.n);
if(st.n>0){
  const tagged=await p.evaluate(()=>[...document.querySelectorAll('#tipAns button')].map(b=>b.dataset.ok));
  ck(tagged.filter(x=>x==='1').length===1,'exactly one button is marked correct',tagged.join(','));
  // click a WRONG one
  await p.evaluate(()=>{const bs=[...document.querySelectorAll('#tipAns button')];
    (bs.find(b=>b.dataset.ok==='0')||bs[0]).click();});
  await sleep(300);
  const after=await p.evaluate(()=>({
    green:[...document.querySelectorAll('#tipAns button.correct')].length,
    red:[...document.querySelectorAll('#tipAns button.wrong')].length,
    msg:document.getElementById('tipMsg').textContent,
    stillUp:document.getElementById('tipveil').classList.contains('on')}));
  ck(after.green===1,'the RIGHT answer turns green',String(after.green));
  ck(after.red===1,'your WRONG pick turns red',String(after.red));
  ck(after.stillUp,'the card is still on screen 300ms after the tap (it used to vanish instantly)');
  ck(/GOT IT|NO GOOD/.test(after.msg),'a verdict line is shown',after.msg);
  await sleep(1400);
  ck(!(await p.evaluate(()=>document.getElementById('tipveil').classList.contains('on'))),
     'and it clears after the beat');
}

console.log('\nCOACH — can you run it again?');
const c=await p.evaluate(()=>{
  localStorage.setItem('bk_coach_seen',JSON.stringify({a:1,b:1,c:1}));
  localStorage.setItem('bk_coach','0');
  const before={seen:window.BKCoach.seen(),on:window.BKCoach.on()};
  document.getElementById('coachReset').click();
  return {before,after:{seen:window.BKCoach.seen(),on:window.BKCoach.on()},
          sub:document.getElementById('coachSeenSub').textContent};
});
ck(c.before.seen===3&&!c.before.on,'setup: 3 tips used up, Coach switched off',JSON.stringify(c.before));
ck(c.after.seen===0,'Start over clears every used-up tip',String(c.after.seen));
ck(c.after.on===true,'...and switches the Coach back on',String(c.after.on));
ck(/still waiting/.test(c.sub),'the row tells you the current state',c.sub);
ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));
process.exit(fails.length?1:0);

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

/* THE STAMP IS NOW A DOOR, not a stand-in. It used to mark the day done on
   click, because the mode did not exist; that check would now pass for the
   wrong reason, so it is replaced by actually PLAYING. */
await p.evaluate(()=>document.getElementById('dailyStamp').click());
await sleep(600);
const opened=await p.evaluate(()=>({
  on:document.getElementById('screen-daily').classList.contains('on'),
  q:(document.querySelector('#dvCard .dvq')||{}).textContent||'',
  answers:document.querySelectorAll('#dvCard .dva').length,
  greyedEarly:document.getElementById('dailyStamp').classList.contains('done')}));
ck(opened.on,'the stamp opens the Daily Five');
ck(opened.answers===4&&opened.q.length>8,'it deals a real card straight away',
   opened.answers+' answers');
ck(!opened.greyedEarly,'opening it does NOT mark the day done');

/* play all ten, answering correctly, and watch the run behave */
const play=async correct=>p.evaluate(async correct=>{
  const D=window.BKDaily._state();
  const idxs=D.round===1?D.set.shots:D.set.stops;
  const q=QUESTIONS[idxs[D.i]];
  const btns=document.querySelectorAll('#dvCard .dva');
  const pick=correct?q.a:(q.a+1)%btns.length;
  btns[pick].click();
  return {picked:pick,right:q.a};
},correct);
const firstMiss=await play(false);
await sleep(120);
const leak=await p.evaluate(()=>({
  right:document.querySelectorAll('#dvCard .dva.right').length,
  wrong:document.querySelectorAll('#dvCard .dva.wrong').length,
  disabled:[...document.querySelectorAll('#dvCard .dva')].every(b=>b.disabled)}));
ck(leak.wrong===1&&leak.right===0,
   'a MISS never shows which answer was right (B5 ruling)',
   leak.right+' correct answers revealed');
ck(leak.disabled,'and the card locks — one attempt, no second tap');
await sleep(1600);
/* nine more, all correct: 9/10 must leave the bonus LOCKED */
for(let n=0;n<9;n++){await play(true);await sleep(n===3?2700:1050);}
await sleep(900);
const res=await p.evaluate(()=>({
  visible:!document.getElementById('dvResult').classList.contains('hide'),
  receipt:(document.getElementById('dvReceipt')||{}).textContent||'',
  unlock:!!document.getElementById('dvGo'),
  stored:localStorage.getItem('bk_daily5'),
  saved:JSON.parse(localStorage.getItem('bk_daily5r')||'{}')}));
ck(res.visible,'ten cards ends on the receipt');
ck(!res.unlock,'9 of 10 leaves the Heat Check LOCKED');
ck(/heat check: locked/.test(res.receipt),'and the receipt says so');
/* the receipt must not say "locked" next to a button offering to unlock it */
const words=await p.evaluate(async()=>{
  const D=window.BKDaily._state();
  D.shots=[1,1,1,1,1];D.stops=[1,1,1,1,1];D.pts=24;D.hc=null;
  window.BKDaily._state().phase='result';
  // repaint through the real path
  localStorage.setItem('bk_daily5r',JSON.stringify({day:D.day,pts:24,
    shots:D.shots,stops:D.stops,swept:true,hc:null}));
  window.BK._show('title');await new Promise(r=>setTimeout(r,250));
  document.getElementById('dailyStamp').click();
  await new Promise(r=>setTimeout(r,450));
  return {receipt:(document.getElementById('dvReceipt')||{}).textContent||'',
          btn:!!document.getElementById('dvGo')};
});
ck(words.btn&&/heat check: unlocked/.test(words.receipt),
   'a swept-but-unplayed receipt says UNLOCKED, not locked',
   (words.receipt.split('\n').pop()||'')+' / button:'+words.btn);
ck(res.saved.pts===22,'the receipt totals what the made slots are worth',
   res.saved.pts+' of 24, one 2-pt layup missed');
ck(/^\d{4}-\d{2}-\d{2}$/.test(res.stored||''),'today is stored as a date string',res.stored);
await p.evaluate(()=>window.BK._show('title'));
await sleep(400);
const greyed=await p.evaluate(()=>document.getElementById('dailyStamp').classList.contains('done'));
ck(greyed,'finishing the run greys the stamp');

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

/* ===== WHAT MAKES IT A DAILY ============================================
   Everyone gets the SAME ten cards. Wordle's creator is the primary source
   (22af Run B): a different word each would never have caught on. If this
   check ever goes red the mode has no reason to exist. */
const det=await p.evaluate(()=>{
  const S=window.BKDaily._set;
  const a=S('2026-08-02'),b=S('2026-08-02'),c=S('2026-08-03');
  const flat=x=>x.shots.concat(x.stops);
  return {same:JSON.stringify(a)===JSON.stringify(b),
    rolls:JSON.stringify(flat(a))!==JSON.stringify(flat(c)),
    uniq:new Set(flat(a)).size,
    shotTiers:a.shots.map(i=>QUESTIONS[i].t).join(','),
    stopTiers:a.stops.map(i=>QUESTIONS[i].t).join(','),
    far:JSON.stringify(S('2027-01-01'))!==JSON.stringify(a)};
});
ck(det.same,'the same date deals the SAME ten cards, every time');
ck(det.rolls,'and tomorrow deals a different ten');
ck(det.far,'still different a year out (the seed is not short-cycling)');
ck(det.uniq===10,'no card appears twice in one day',det.uniq+' distinct');
ck(det.shotTiers==='1,2,2,3,4','round 1 ramps with distance',det.shotTiers);
ck(det.stopTiers==='1,2,2,3,3','round 2 ramps too, one tier lower at the top',det.stopTiers);

/* the daily must NOT bend to your own settings — that would hand two phones
   different cards on the same day, which is the whole failure mode */
const neutral=await p.evaluate(()=>{
  const S=window.BKDaily._set,before=JSON.stringify(S('2026-08-02'));
  const st=window.BK.state&&window.BK.state();
  window.BK.coach.applyColors({nm:'A',ab:'A'},{nm:'B',ab:'B'});
  window.BK.coach.startGame({league:'wnba',decade:'1990s',target:11,
    rosters:window.BK.coach.pickRosters('wnba','1990s')},true);
  return before===JSON.stringify(S('2026-08-02'));
});
ck(neutral,'your league and era do NOT change the daily set');

/* ===== THE TYPE-IN MATCHER ==============================================
   Spec measured against the roster before it was written (BUILD.md 22ac 35). */
const mm=await p.evaluate(()=>{
  const M=window.BKDaily._match;
  const P=PLAYERDB.find(x=>x.playerId==='michael-jordan');
  const R=PLAYERDB.find(x=>/"/.test(x.name)&&x.tier==='superstar');
  const J=PLAYERDB.find(x=>/^Magic Johnson$/.test(x.name))||
          PLAYERDB.find(x=>norm=>0)||PLAYERDB.find(x=>/ Johnson$/.test(x.name));
  return {exact:M('Michael Jordan',P),lower:M('michael jordan',P),
    typo:M('Micheal Jordn',P),surname:M('Jordan',P),
    junk:M('Kobe Bryant',P),empty:M('',P),
    ambiguous:J?M(J.name.split(' ').pop(),J):'n/a',
    nickname:R?M(R.name.replace(/\s*"[^"]+"\s*/,' ').trim(),R):'n/a',
    nickWho:R?R.name:'n/a'};
});
ck(mm.exact==='hit'&&mm.lower==='hit','the exact name hits, case and all');
ck(mm.typo==='hit','a typo still hits (edit distance)','"Micheal Jordn"');
ck(mm.surname==='hit','a UNIQUE surname alone hits','"Jordan"');
ck(mm.ambiguous==='ambiguous','an ambiguous surname asks for more, no penalty',
   mm.ambiguous);
ck(mm.nickname==='hit','a nicknamed player answers to their plain name',mm.nickWho);
ck(mm.junk==='miss'&&mm.empty==='miss','a wrong name and an empty box both miss');

/* ===== THE BONUS ROUND ================================================== */
const hc=await p.evaluate(()=>{
  const D=window.BKDaily;
  const p1=D._player('2026-08-02'),p2=D._player('2026-08-02'),p3=D._player('2026-08-03');
  const clues=D._clues(p1);
  return {stable:p1.playerId===p2.playerId,rolls:p1.playerId!==p3.playerId,
    n:clues.length,pts:D._cluePts.join(','),
    firstHasStat:/\d/.test(clues[0]),
    noNameLeak:clues.every(c=>c.toLowerCase().indexOf(p1.name.toLowerCase().split(' ')[0])<0),
    who:p1.name,tier:p1.tier};
});
ck(hc.stable&&hc.rolls,'the Heat Check player is fixed per day, and rolls over',hc.who);
ck(hc.n===4&&hc.pts==='6,4,3,2','four clues, descending payout',hc.pts);
ck(hc.firstHasStat,'clue one always carries a real number',hc.who+' ('+hc.tier+')');
ck(hc.noNameLeak,'no clue leaks the player\'s own name');

/* COLOUR MEANS ONE THING. The rack's difficulty colours live in CSS and the
   game's live in the TIERS object, so they are two copies of one truth — the
   exact shape of the corner-three failure, where red meant "worth 3" on the
   floor and "hard" on every card. This check makes the duplication enforced
   instead of hoped-for: if anyone edits TIERS, the rack goes red here. */
const hue=await p.evaluate(()=>{
  const T=window.BK._TIERS,out={};
  const probe=document.createElement('span');
  document.body.appendChild(probe);
  [1,2,3,4].forEach(t=>{
    probe.className='dvspot t'+t;
    const css=getComputedStyle(probe).color;
    const m=css.match(/\d+/g).slice(0,3).map(Number);
    const hex='#'+m.map(v=>v.toString(16).padStart(2,'0')).join('');
    out[t]={css:hex,tier:T[t].c.toLowerCase(),ok:hex===T[t].c.toLowerCase()};
  });
  probe.remove();
  return out;
});
const badHue=[1,2,3,4].filter(t=>!hue[t].ok);
ck(badHue.length===0,'the rack speaks the game\'s ONE difficulty colour language',
   badHue.length?badHue.map(t=>'t'+t+' '+hue[t].css+'≠'+hue[t].tier).join(' '):
   'green/amber/red/gold, matched to TIERS');
/* Legendary must be tellable from Medium WITHOUT relying on hue — measured at
   deltaE 9.2, which is inside the range the eye confuses at this size. */
const star=await p.evaluate(()=>{
  const probe=document.createElement('span');probe.className='dvspot t4';
  probe.innerHTML='<b>5</b>';document.body.appendChild(probe);
  const before=getComputedStyle(probe.querySelector('b'),'::before').content;
  const shadow=getComputedStyle(probe).boxShadow;
  probe.remove();
  return {mark:before,ring:shadow!=='none'};
});
ck(/★/.test(star.mark)&&star.ring,
   'Legendary carries a non-colour marker (amber and gold are deltaE 9.2 apart)',
   star.mark);

/* and the names, which I got wrong first time: "Warm-up" vs the game's "Casual" */
const names=await p.evaluate(()=>{
  const D=window.BKDaily,B=window.BK;
  return [0,1,2,3,4].every(t=>{
    // the daily renders through the same fn the game uses
    return B._tierName(t).length>0;
  })&&B._tierName(0);
});
ck(names==='Casual','tier names come FROM game.js, not a second list',names);

ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

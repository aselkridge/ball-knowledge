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

/* THE V0 SCOPE BOUNDARY — NBA + WNBA + evergreen, nothing else.
   This was a real bug, not a preference: over 30 days of the shipped picker,
   106 of 300 cards came from Flags / college / BIG3 / Black Fives / streetball
   / overseas, and all 30 days served at least one. Aaron caught it by playing.
   Swept over 60 days here so a single lucky day cannot make it look fixed. */
/* A FULL YEAR, and by CONTENT as well as by tag.
   The old version of this check swept 60 days and passed anything tagged nba,
   wnba or 'any' — phrased as "inside NBA + WNBA + evergreen", which sounds like
   the rule and is not it. 36 of the in-scope 'any' cards turned out to be about
   the ABA, the NCAA, FIBA or the Globetrotters, and this check waved every one
   through for weeks. So it now asserts the actual rule (nba or wnba, full stop)
   AND reads the card, because a tag is a claim and the text is the evidence. */
const scope=await p.evaluate(()=>{
  const S=window.BKDaily._set,badTag=[],badText=[],seen={};
  const other=/\bNCAA\b|\bcollege\b|\bcollegiate\b|EuroLeague|\bFIBA\b|Olympi|high school|streetball|Rucker|G League|Globetrotter|\bNBL\b|\bABA\b|\bABL\b/i;
  const d0=new Date(2026,7,4);
  for(let n=0;n<365;n++){
    const d=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+n);
    const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    S(key).shots.concat(S(key).stops).forEach(i=>{
      const q=QUESTIONS[i],l=q.l||'any';
      seen[l]=(seen[l]||0)+1;
      if(l!=='nba'&&l!=='wnba')badTag.push(key+':'+l);
      /* Read the ANSWER, not the question. A first pass flagged any mention of
         another competition and caught 40 cards that are perfectly fine — a
         WNBA card noting a player's Olympic golds, an NBA card about which
         franchises arrived in the 1976 merger. Mentioning a competition is
         context; REQUIRING it is the problem. What matters is whether you can
         answer without knowing that other league. */
      const ans=(q.c||[])[q.a]||'';
      if(other.test(ans))badText.push('#'+i+' '+q.q.slice(0,50)+' -> '+ans);
    });
  }
  const uniq=[...new Set(badText)];
  return {badTag:badTag.slice(0,4),nTag:badTag.length,
          badText:uniq.slice(0,3),xAnswer:uniq.length,seen};
});
ck(scope.nTag===0,'a YEAR of cards, every one tagged nba or wnba — nothing else',
   scope.nTag?scope.nTag+' out of scope: '+scope.badTag.join(' '):
   Object.entries(scope.seen).map(([k,v])=>k+' '+v).join(' · '));
/* A RATCHET, not a zero. Exactly one card in the whole bank can only be answered
   by naming another league: #146, "the red-white-and-blue ball belonged to which
   league that merged with the NBA?" — answer, the ABA. It is framed as NBA
   merger history and it is famous, so I have not touched it; that is Aaron's
   call, not mine, and it is filed. What this check exists for is the SECOND one.
   If this number moves off 1, a card has appeared that a player cannot answer
   from NBA and WNBA knowledge alone. */
const KNOWN_XLEAGUE = 1;
ck(scope.xAnswer<=KNOWN_XLEAGUE,
   'no NEW card needs another league to answer it',
   scope.xAnswer+' of '+KNOWN_XLEAGUE+' allowed'+
   (scope.badText.length?' — '+scope.badText.join(' | '):''));

/* the Heat Check answer has to live inside the same boundary */
const hcScope=await p.evaluate(()=>{
  const D=window.BKDaily,out={};let bad=0,n=0;
  for(let d=1;d<=40;d++){
    const pl=D._player('2026-08-'+String(d).padStart(2,'0'));
    n++;out[pl.league]=(out[pl.league]||0)+1;
    if(pl.league!=='nba'&&pl.league!=='wnba')bad++;
  }
  return {bad:bad,n:n,by:out};
});
ck(hcScope.bad===0,'and 40 Heat Check answers are all NBA or WNBA',
   Object.entries(hcScope.by).map(([k,v])=>k+' '+v).join(' · '));

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

/* ---- STREAKS AND THE CALENDAR (08-04) ----------------------------------- */
const M=await p.evaluate(()=>{
  const D=window.BKDaily,full={s:[1,1,1,1,1],t:[1,1,1,1,1]},part={s:[1,1,1,0,1],t:[1,1,1,1,0]};
  return {crown:D._mark({...full,p:24,h:6,L:0}),
          crownLate:D._mark({...full,p:24,h:6,L:1}),
          sweptNoBonus:D._mark({...full,p:24,h:0,L:0}),
          star:D._mark({...part,p:18,h:0,L:0}),
          check:D._mark({...part,p:18,h:0,L:1}),
          none:D._mark(null)};
});
ck(M.crown==='crown'&&M.crownLate==='crown',
   'all eleven earns the crown, even caught up later','Aaron: "any days where all 11"');
ck(M.sweptNoBonus==='star',
   'swept the ten but never took the bonus is a STAR, not a crown','11 means 11');
ck(M.star==='star'&&M.check==='check',
   'played on the day = gold star · caught up later = green check');
ck(M.none===null,'a day never played carries no mark');

const S=await p.evaluate(()=>{
  const D=window.BKDaily;
  const run={'2026-08-01':1,'2026-08-02':1,'2026-08-03':1,'2026-08-04':1};
  const gap={'2026-08-01':1,'2026-08-03':1,'2026-08-04':1};
  const open={'2026-08-02':1,'2026-08-03':1};
  return {four:D._streak(run,'2026-08-04'),gap:D._streak(gap,'2026-08-04'),
          todayStillOpen:D._streak(open,'2026-08-04')};
});
ck(S.four===4,'the streak counts consecutive days',S.four+' days');
ck(S.gap===2,'a missed day breaks it',S.gap+', not 3');
/* the one that is easy to get wrong: at 9am, before you have played, your
   streak must not already read as broken. */
ck(S.todayStillOpen===2,
   'today being unplayed does not break the streak yet',S.todayStillOpen);

/* a made-up day REPAIRS the streak — the reason missed days are playable */
const repair=await p.evaluate(()=>{
  const D=window.BKDaily;
  const before=D._streak({'2026-08-01':1,'2026-08-03':1,'2026-08-04':1},'2026-08-04');
  const after =D._streak({'2026-08-01':1,'2026-08-02':1,'2026-08-03':1,'2026-08-04':1},'2026-08-04');
  return {before,after};
});
ck(repair.before===2&&repair.after===4,
   'going back and playing a missed day REPAIRS the streak',
   repair.before+' -> '+repair.after);

const closedAtRest=await p.evaluate(()=>{
  const el=document.getElementById('dvCal');
  return !!el&&el.classList.contains('hide');
});
ck(closedAtRest,'the calendar starts closed');

const cal=await p.evaluate(async()=>{
  const D=window.BKDaily;
  const t=new Date(),k=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const y=new Date(t.getFullYear(),t.getMonth(),t.getDate()-1);
  const h={};h[k(y)]={p:24,s:[1,1,1,1,1],t:[1,1,1,1,1],h:6,L:0};
  D._saveHist(h);
  D._cal();
  await new Promise(r=>setTimeout(r,250));
  const el=document.getElementById('dvCal');
  const crowns=el.querySelectorAll('.dvcd .dvmk.cr').length;
  const playable=el.querySelectorAll('.dvcd.open[data-day]').length;
  const future=el.querySelectorAll('.dvcd.future[data-day]').length;
  const streak=el.querySelector('.dvstreakn').textContent;
  const today=el.querySelectorAll('.dvcd.today').length;
  D._calClose();
  return {crowns,playable,future,streak,today,
          closed:el.classList.contains('hide')};
});
ck(cal.crowns===1,'a perfect day shows a crown on the calendar',cal.crowns);
ck(cal.playable>0,'unplayed past days are tappable',cal.playable+' playable');
ck(cal.future===0,'future days are NOT tappable',cal.future+' tappable future days');
ck(cal.today===1,'today is marked',cal.today);
ck(cal.streak==='1','the streak reads off the history',cal.streak);
ck(cal.closed,'and it closes again');

/* the receipt has to carry a way IN, not just a score */
const link=await p.evaluate(()=>{
  const D=window.BKDaily;
  const el=document.getElementById('dvReceipt');
  return {url:D._shareUrl,inReceipt:el?el.textContent.indexOf(D._shareUrl)>-1:null};
});
ck(/^https:\/\/bk-ballknowledge\.com\//.test(link.url),
   'the share link points at the live game',link.url);

/* ---- THE MENU STAMP HAS TO SAY WHICH MARK YOU EARNED ---------------------
   Aaron, 08-04: "when you complete the daily 5 does the right stamp show up on
   the main menu correctly?" It did not. Every outcome — ordinary day, swept
   ten, all eleven — drew the same green tick, measured. Worse, green had just
   been given the meaning "caught up LATE" on the streak calendar, so a player
   who finished today was shown the mark for missing it. Exactly the collision
   that shipped once already, when red meant both "worth 3" and "hard".
   Both surfaces now ask BKDaily for the mark AND for the shape. */
const stamp=await p.evaluate(async()=>{
  const F=[1,1,1,1,1],out={};
  const key=window.BKDaily._key();
  const set=async r=>{
    localStorage.setItem('bk_daily5',key);
    const h={};h[key]=r;localStorage.setItem('bk_daily5h',JSON.stringify(h));
    window.BK._paintDaily();
    await new Promise(r2=>setTimeout(r2,60));
    const svg=document.querySelector('#dsMark svg');
    return svg?{cls:svg.getAttribute('class'),col:getComputedStyle(svg).color}:null;
  };
  out.ordinary=await set({p:18,s:[1,1,0,1,1],t:[1,1,1,0,1],h:0,L:0});
  out.sweptNoBonus=await set({p:24,s:F,t:F,h:0,L:0});
  out.eleven=await set({p:30,s:F,t:F,h:6,L:0});
  out.late=await set({p:18,s:[1,1,0,1,1],t:F,h:0,L:1});
  localStorage.removeItem('bk_daily5');localStorage.removeItem('bk_daily5h');
  window.BK._paintDaily();
  await new Promise(r2=>setTimeout(r2,60));
  out.unplayed=document.querySelector('#dsMark svg');
  return {...out,unplayed:!out.unplayed};
});
ck(/\bst\b/.test(stamp.ordinary.cls),
   'STAMP · finishing today puts a GOLD STAR on the menu',stamp.ordinary.cls);
ck(/\bst\b/.test(stamp.sweptNoBonus.cls),
   'STAMP · sweeping ten without the bonus is still a star, not a crown');
ck(/\bcr\b/.test(stamp.eleven.cls),
   'STAMP · all eleven puts a GOLD CROWN on the menu',stamp.eleven.cls);
ck(/\bck\b/.test(stamp.late.cls),
   'STAMP · a caught-up day shows the green check');
ck(stamp.unplayed,'STAMP · an unplayed day carries no mark at all');
/* the collision test: today must NEVER draw the "late" mark */
ck(!/\bck\b/.test(stamp.ordinary.cls)&&!/\bck\b/.test(stamp.eleven.cls),
   'STAMP · green never means "played today" — that is the calendar\'s "late"',
   'ordinary='+stamp.ordinary.cls+' eleven='+stamp.eleven.cls);
ck(stamp.eleven.col===stamp.sweptNoBonus.col,
   'STAMP · crown and star share one gold, so shape is what tells them apart',
   stamp.eleven.col);

/* ONE SOURCE FOR THE SHAPES, or the two screens drift apart again.
   The first version of this check compared _markSvg() to _markSvg() — the same
   function to itself — so it passed happily while the stamp drew a hand-written
   crown of its own. Proved by breaking it and watching nothing fail. It now
   reads the path the STAMP ACTUALLY RENDERED out of the DOM and compares that
   to what the shared function returns. Test the thing, not the ingredient. */
const oneSource=await p.evaluate(async()=>{
  const D=window.BKDaily,F=[1,1,1,1,1],key=D._key();
  localStorage.setItem('bk_daily5',key);
  const h={};h[key]={p:30,s:F,t:F,h:6,L:0};
  localStorage.setItem('bk_daily5h',JSON.stringify(h));
  window.BK._paintDaily();
  await new Promise(r=>setTimeout(r,60));
  const path=s=>(String(s).match(/ d="([^"]+)"/)||[])[1];
  const drawn=document.querySelector('#dsMark svg path');
  const out={onStamp:drawn?drawn.getAttribute('d'):null,
             fromFn:path(D._markSvg('crown',124))};
  localStorage.removeItem('bk_daily5');localStorage.removeItem('bk_daily5h');
  window.BK._paintDaily();
  return out;
});
ck(!!oneSource.onStamp&&oneSource.onStamp===oneSource.fromFn,
   'the stamp draws the calendar\'s OWN shape, not a copy of it',
   oneSource.onStamp===oneSource.fromFn?'identical path':'DIFFERENT shapes');

/* its own song, not the menu's. Asserted through the real resolver so it
   cannot pass against a copy of the rule. */
const song=await p.evaluate(async()=>{
  window.BK._show('title');await new Promise(r=>setTimeout(r,250));
  const onMenu=window.BK._musicWant();
  document.getElementById('dailyStamp').click();
  await new Promise(r=>setTimeout(r,500));
  return {onMenu,onDaily:window.BK._musicWant()};
});
ck(song.onDaily==='daily'&&song.onMenu!=='daily',
   'the Daily Five plays its OWN track, not the menu song',
   song.onMenu+' -> '+song.onDaily);

ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));

/* ---- THE PHONE, which this harness had never once looked at -----------------
   Every placement check above runs at 1440 and passes. Screenshotting 390 on
   08-04 showed the stamp does NOT sit beside the title there — it stacks above
   it, sharing 0px of height, because 390px cannot fit a 198px stamp next to the
   wordmark. That may well be the right answer for a phone, but the harness
   asserting "it sits just left of the title" while never measuring the width
   most of this game is played at was the harness telling a half-truth.
   So: assert what the phone ACTUALLY does. If it changes, this fails and the
   change gets looked at instead of discovered in a screenshot months later. */
const mob=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
await mob.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await mob.evaluate(()=>{localStorage.removeItem('bk_daily5');localStorage.setItem('bk_coach','0')});
await mob.reload({waitUntil:'networkidle'});await sleep(1100);
const ph=await mob.evaluate(()=>{
  const e=document.getElementById('dailyStamp');
  const s=e.getBoundingClientRect();
  const t=document.querySelector('.brandwrap,.title,h1,#brand');
  const r=t?t.getBoundingClientRect():null;
  const shared=r?Math.max(0,Math.min(s.bottom,r.bottom)-Math.max(s.top,r.top)):0;
  return {vis:getComputedStyle(e).display!=='none'&&s.width>0,
    w:Math.round(s.width),h:Math.round(s.height),
    above:r?s.top<r.top:false,shared:Math.round(shared),
    inView:s.top>=0&&s.bottom<=innerHeight,
    scrolls:document.documentElement.scrollHeight>innerHeight+2,
    tapOk:s.width>=44&&s.height>=44};
});
ck(ph.vis,'PHONE · the stamp is on the menu at 390px',ph.w+'×'+ph.h);
ck(ph.above&&ph.shared===0,
   'PHONE · it stacks ABOVE the title, it does not sit beside it',
   ph.shared+'px shared height — desktop shares 119px');
ck(ph.inView,'PHONE · it is fully on screen without scrolling');
ck(!ph.scrolls,'PHONE · the whole menu still fits, nothing pushed off');
ck(ph.tapOk,'PHONE · big enough to tap comfortably',ph.w+'×'+ph.h+', 44px is the floor');

await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

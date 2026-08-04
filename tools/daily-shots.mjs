/* Screenshots of the Daily Five, for Aaron to look at. Serve docs/ on :8899.
   Desktop 1440 and phone 390, every state the mode has. Writes to design/shots/daily/. */
import pw from 'playwright';
import fs from 'fs';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT='design/shots/daily';
fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});

const shot=async(p,name)=>{await p.screenshot({path:`${OUT}/${name}.png`});console.log('  '+name+'.png');};

for(const [tag,w,h] of [['desktop',1440,900],['mobile',390,844]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});
  const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.removeItem('bk_daily5');localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'});await sleep(1200);

  // 1 — the menu, stamp waiting
  await shot(p,`${tag}-1-menu-fresh`);

  // 2 — the stamp itself, close up (desktop only; it is the thing under review)
  if(tag==='desktop'){
    const el=await p.$('#dailyStamp');
    await el.screenshot({path:`${OUT}/${tag}-2-stamp-closeup.png`});
    console.log(`  ${tag}-2-stamp-closeup.png`);
  }

  // 3 — round one, first card
  await p.evaluate(()=>document.getElementById('dailyStamp').click());
  await sleep(900);
  await shot(p,`${tag}-3-round1-card`);

  /* Wait for a live card before answering. The fixed sleeps were enough for the
     first run and NOT for the sweep after a reload — the round break makes the
     gap uneven, and a hard-coded delay answered a card that was not on screen
     yet. Waiting on the DOM instead of on the clock removes the guesswork. */
  const play=async correct=>{
    await p.waitForFunction(()=>{
      const bs=document.querySelectorAll('#dvCard .dva');
      return bs.length===4&&[...bs].every(b=>!b.disabled)&&window.BKDaily;
    },{timeout:15000});
    return p.evaluate(async correct=>{
      const D=window.BKDaily._state();
      const idxs=D.round===1?D.set.shots:D.set.stops;
      const q=QUESTIONS[idxs[D.i]];
      const btns=document.querySelectorAll('#dvCard .dva');
      btns[correct?q.a:(q.a+1)%btns.length].click();
    },correct);
  };

  // 4 — a miss, mid-run: nothing revealed
  await play(false);await sleep(400);
  await shot(p,`${tag}-4-miss-no-reveal`);
  await sleep(1400);

  // 5 — the round break
  for(let n=0;n<4;n++){await play(true);await sleep(1100);}
  await sleep(900);
  await shot(p,`${tag}-5-round-break`);
  await sleep(1900);

  // 6 — round two, the stops
  await shot(p,`${tag}-6-round2-card`);

  // 7 — the receipt, 9 of 10, Heat Check locked
  for(let n=0;n<5;n++){await play(true);await sleep(1100);}
  await sleep(1400);
  await shot(p,`${tag}-7-receipt-locked`);

  // 8 — the menu after, stamp crossed off
  await p.evaluate(()=>{const f=document.querySelector('#screen-daily .dvdone .btn, #screen-daily .btn');if(f)f.click();});
  await sleep(700);
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});await sleep(1200);
  await shot(p,`${tag}-8-menu-done`);

  await ctx.close();

  /* 9 — a clean sweep, in a BRAND NEW context.
     Reusing the played-out page kept timing out. Traced it rather than adding
     another sleep: on a fresh page the ten answers land perfectly, so the fault
     was leftover state from the finished run, not the pacing. A new context
     costs one second and removes the whole class of problem. */
  const ctx2=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});
  const p2=await ctx2.newPage();
  await p2.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p2.evaluate(()=>{localStorage.removeItem('bk_daily5');localStorage.setItem('bk_coach','0')});
  await p2.reload({waitUntil:'networkidle'});await sleep(1200);
  await p2.evaluate(()=>document.getElementById('dailyStamp').click());
  await sleep(900);
  const play2=async correct=>p2.evaluate(correct=>{
    const D=window.BKDaily._state();
    const idxs=D.round===1?D.set.shots:D.set.stops;
    const q=QUESTIONS[idxs[D.i]];
    document.querySelectorAll('#dvCard .dva')[correct?q.a:(q.a+1)%4].click();
  },correct);
  for(let n=0;n<10;n++){await play2(true);await sleep(n===4?3000:1200);}
  await sleep(1600);
  await shot(p2,`${tag}-9-receipt-swept`);
  const hc=await p2.$('#dvGo');
  if(hc){await hc.click();await sleep(1200);await shot(p2,`${tag}-10-heat-check`);}
  else console.log(`  (${tag}: no heat-check button on the receipt)`);
  await ctx2.close();
}

/* ---- the streak calendar, with a month of plausible history --------------
   Seeded rather than played, because playing 20 days in a headless browser to
   photograph a calendar is 20 minutes of nothing. The RECORDS are real shapes —
   the same objects saveResult writes — so the calendar is rendering production
   data, not a mock. */
for(const [tag,w,h] of [['desktop',1440,900],['mobile',390,844]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});
  const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'});await sleep(1100);
  await p.evaluate(()=>{
    const t=new Date(),H={};
    const k=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const rec=(p,s,st,hc,L)=>({p,s,t:st,h:hc,L});
    const F=[1,1,1,1,1];
    // a month with a bit of everything: perfect days, ordinary days, a caught-up
    // day, and two genuine gaps that are still open to play
    /* LAST month, fully in the past, so the picture actually shows the range:
       crowns, stars, a caught-up day and two genuine GAPS still open to play.
       Seeding only the current month showed nothing but the first few days. */
    const plan={1:'crown',2:'star',3:'star',4:'check',5:'crownlate',6:'star',
                8:'star',9:'crown',10:'star',11:'check',12:'star',13:'crownlate',
                15:'star',16:'star',17:'crown',18:'star',19:'check',
                20:'star',22:'crown',23:'star',24:'crownlate',25:'check',26:'star'};
    for(const day in plan){
      const d=new Date(t.getFullYear(),t.getMonth()-1,+day);
      const kind=plan[day];
      H[k(d)]= kind==='crown'     ? rec(30,F,F,6,0)
             : kind==='crownlate' ? rec(30,F,F,6,1)
             : kind==='check'     ? rec(17,[1,1,0,1,1],[1,1,1,0,1],0,1)
             :                      rec(20,[1,1,1,0,1],F,0,0);
    }
    // and a live streak running into today
    for(let i=1;i<=3;i++){
      const d=new Date(t.getFullYear(),t.getMonth(),t.getDate()-i);
      H[k(d)]=rec(22,[1,1,1,1,1],[1,1,0,1,1],0,0);
    }
    localStorage.setItem('bk_daily5h',JSON.stringify(H));
  });
  // the calendar lives INSIDE the daily screen, so that screen has to be up
  await p.evaluate(()=>document.getElementById('dailyStamp').click());
  await sleep(900);
  await p.evaluate(()=>{window.BKDaily._cal();
    // step back a month so the fully-played month is what is photographed
    document.querySelector('#dvCal .dvcalprev').click();});
  await sleep(700);
  await shot(p,`${tag}-11-calendar`);
  await ctx.close();
}

await b.close();
console.log('\ndone -> '+OUT);

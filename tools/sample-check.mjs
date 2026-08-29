/* THE PRACTICE TOSS-UP (Aaron's walkthrough, stops 2+3, 08-28) and the
   TYPEWRITER (buzz races only). Serve docs/ on :8899, run from repo root.

   PROPERTIES, in order:
   1. The coach offers a test run at the two quiet moments: local, right
      after the "How it works" ready tap; CPU, inside the jumbotron window
      with the tip held frozen. NEVER online (the 07-29 law): a live NET
      flag refuses the offer even when called directly.
   2. The nine beats drive end to end by real taps: countdown explained
      first, card and BOTH buzzers the same instant with the question
      empty, coach before typing, the question typing itself out, the
      handoff to the bottom buzzer (always you), the right answer lit,
      the result, and "Run it again" looping without a seen-key burn.
   3. The typewriter runs on the REAL toss-up and REAL tip-off reveals and
      nowhere else; the question grows over time on both.
   4. The offer is once per phone (seen-key tossupOffer), and Coach off
      means no offer at all.

   SABOTAGE=netgate strips the netOn refusal from sampleOffer in flight;
   the never-online check must go red or it has no teeth. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const SAB=process.env.SABOTAGE||'';

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const ctx=await b.newContext({viewport:{width:390,height:844}});
const page=await ctx.newPage();
const errs=[];
page.on('pageerror',e=>errs.push(String(e).slice(0,160)));

if(SAB==='netgate'){
  /* strip the online refusal from sampleOffer; a missed patch is a hard error */
  let hit=false;
  await page.route('**/play/coach.js',async route=>{
    const body=await(await fetch(route.request().url())).text();
    const pat="if(netOn())return false;                     /* never online, 07-29 law */";
    if(body.indexOf(pat)<0){console.log('SABOTAGE PATCH MISSED');process.exit(2);}
    hit=true;
    route.fulfill({contentType:'application/javascript',body:body.replace(pat,'')});
  });
  page.on('load',()=>{if(!hit)console.log('  (sabotage route not yet hit)')});
}

async function boot(seed){
  await page.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await page.evaluate(s=>{localStorage.clear();for(const k in (s||{}))localStorage.setItem(k,s[k]);},seed||{});
  await page.reload({waitUntil:'networkidle'});
  await sleep(900);
  /* the first-run welcome card would otherwise sit over the title */
  await page.evaluate(()=>{const c=document.querySelector('#coachTip .ct-ok');if(c)c.click();});
}
async function toTossup(){
  await page.evaluate(()=>{
    const btns=[...document.querySelectorAll('button,.mbtn')];
    const b=btns.find(x=>/local|friend|pass/i.test(x.textContent));
    b.click();
  });
  await sleep(900);
  await page.evaluate(()=>document.getElementById('nmGo').click());
  await sleep(900);
  await page.click('#tuReady',{force:true});
  await sleep(600);
}
/* THE DOUBLE BLINK, measured rather than eyeballed. A countdown number must
   punch in once and HOLD until the next replaces it. The bug Aaron caught
   was a 600ms animation ending at opacity 0 inside an 800ms beat: with no
   fill-mode the element reverts to its own visible base for the leftover
   200ms, so every number appeared, vanished, reappeared and vanished again.
   The signature is a FALL THEN RISE while the SAME number is on screen, so
   that is exactly what this counts. Runs during waits the gate already
   spends, never as extra wall time. */
async function blinks(numSel,ms){
  return page.evaluate(async function(a){
    var sel=a[0],dur=a[1];
    var el=document.querySelector(sel);
    if(!el)return {err:'no element',blinks:-1};
    var out=[],t0=performance.now();
    await new Promise(function(res){
      var s=setInterval(function(){
        out.push([el.textContent.trim(),+getComputedStyle(el).opacity]);
        if(performance.now()-t0>dur){clearInterval(s);res();}
      },40);
    });
    var n=0,cur=null,fell=false,seen=0;
    for(var i=0;i<out.length;i++){
      var txt=out[i][0],op=out[i][1];
      if(txt!==cur){cur=txt;fell=false;seen++;continue;}
      if(op<0.1)fell=true;
      else if(fell&&op>0.9){n++;fell=false;}
    }
    return {blinks:n,numbers:seen,samples:out.length};
  },[numSel,ms]);
}
const sam=()=>page.evaluate(()=>window.BKCoach._sample());
const btn=re=>page.evaluate(r=>{
  const b=[...document.querySelectorAll('#tsmBtns button')].find(x=>new RegExp(r,'i').test(x.textContent));
  if(b){b.click();return true}return false;},re.source);

/* ---- the local road, the nine beats ---- */
if(!SAB){
await boot();
await toTossup();
let s=await sam();
ck(s.active&&s.mode==='local','1 local road: the offer interposes after the ready tap');
const seenNow=await page.evaluate(()=>JSON.parse(localStorage.getItem('bk_coach_seen')||'{}'));
ck(seenNow.tossupOffer===1,'2 the offer burns its one seen-key (tossupOffer)');
/* painted, not just flagged: the coach card has real size */
const cb=await page.evaluate(()=>{const c=document.getElementById('tsmCoach');const r=c.getBoundingClientRect();return r.height;});
ck(cb>60,'render guard: the offer card is painted','h='+Math.round(cb));
await btn(/show me/);
await sleep(400);
const cd=await page.evaluate(()=>({lit:document.getElementById('tsmCd').classList.contains('lit'),
  on:document.querySelector('.tsm-cd').classList.contains('on'),
  say:document.getElementById('tsmSay').textContent}));
ck(cd.on&&cd.lit&&/countdown/i.test(cd.say),'3 beat 1: the 5 up and lit, the coach explaining it');
await btn(/go/);
/* the 5..1 at 800ms, spent measuring instead of idling */
const pb=await blinks('#tsmCdn',4200);
ck(pb.blinks===0,'3b the PRACTICE countdown holds each number, no double blink',
  'blinks='+pb.blinks+' over '+pb.numbers+' numbers');
await sleep(200);
const card=await page.evaluate(()=>({
  card:document.getElementById('tsmCard').classList.contains('on'),
  top:document.getElementById('tsmTop').classList.contains('on'),
  bot:document.getElementById('tsmBot').classList.contains('on'),
  q:document.getElementById('tsmQ').textContent,
  botDis:document.getElementById('tsmBot').disabled,
  h:document.getElementById('tsmCard').getBoundingClientRect().height}));
ck(card.card&&card.top&&card.bot&&card.q===''&&card.botDis,
  '4 beat 2: card empty, BOTH buzzers up the same instant, nothing buzzable yet');
ck(card.h>40,'render guard: the practice card is painted','h='+Math.round(card.h));
await btn(/got it/);
await sleep(800);
const t1=await page.evaluate(()=>document.getElementById('tsmQ').textContent.length);
await sleep(700);
const t2=await page.evaluate(()=>document.getElementById('tsmQ').textContent.length);
ck(t1>0&&t2>t1,'5 beat 4: the practice question types itself out','len '+t1+' -> '+t2);
await sleep(1600);                       /* finish typing + handoff */
const bz=await page.evaluate(()=>({
  botDis:document.getElementById('tsmBot').disabled,
  topDis:document.getElementById('tsmTop').disabled,
  botLit:document.getElementById('tsmBot').classList.contains('lit'),
  say:document.getElementById('tsmSay').textContent}));
ck(!bz.botDis&&bz.topDis&&bz.botLit&&/buzz/i.test(bz.say),
  '6 beat 5: only the bottom buzzer (you) is live and lit');
await page.click('#tsmBot',{force:true});
await sleep(1100);
const an=await page.evaluate(()=>({
  n:document.querySelectorAll('#tsmAns button').length,
  right:!!document.getElementById('tsmRightA'),
  lit:document.getElementById('tsmRightA')&&document.getElementById('tsmRightA').classList.contains('lit'),
  live:document.getElementById('tsmRightA')&&!document.getElementById('tsmRightA').disabled,
  others:[...document.querySelectorAll('#tsmAns button')].filter(b=>b.id!=='tsmRightA').every(b=>b.disabled)}));
ck(an.n===4&&an.right&&an.lit&&an.live&&an.others,
  '7 beat 7: four answers, the right one lit and the only one live');
await page.click('#tsmRightA',{force:true});
await sleep(700);
const res=await page.evaluate(()=>({on:document.getElementById('tsmRes').classList.contains('on'),
  t:document.getElementById('tsmRes').textContent}));
ck(res.on&&/win/i.test(res.t),'8 beat 8: the result line lands','"'+res.t+'"');
await sleep(1300);
/* run it again must LOOP: back to the countdown explain, no key burned */
await page.evaluate(()=>document.body.classList.add('reduce-motion')); /* second lap, fast */
await btn(/again/);
await sleep(500);
const again=await page.evaluate(()=>({cd:document.querySelector('.tsm-cd').classList.contains('on'),
  say:document.getElementById('tsmSay').textContent,active:window.BKCoach._sample().active}));
ck(again.active&&again.cd&&/countdown/i.test(again.say),'9 "Run it again" loops back to the countdown');
/* sprint the reduced-motion lap to the wrap */
await btn(/go/);await sleep(400);
await btn(/got it/);await sleep(700);
await page.click('#tsmBot',{force:true});await sleep(600);
await page.click('#tsmRightA',{force:true});await sleep(600);
await page.evaluate(()=>document.body.classList.remove('reduce-motion'));
await sleep(200);
await btn(/ready/);
await sleep(600);
const done=await page.evaluate(()=>({sam:document.getElementById('tuSam').classList.contains('on'),
  cd:document.getElementById('tuCd').classList.contains('on'),active:window.BKCoach._sample().active}));
ck(!done.sam&&!done.active&&done.cd,'10 "I\'m ready" tears down into the REAL countdown');
/* HIS 08-29 CATCH, on the real one: the number must not blink twice */
const rb=await blinks('#tuCdn',3600);
ck(rb.blinks===0,'10b the REAL toss-up countdown holds each number, no double blink',
  'blinks='+rb.blinks+' over '+rb.numbers+' numbers');
await sleep(700);
const r1=await page.evaluate(()=>document.getElementById('tuQ').textContent.length);
await sleep(600);
const r2=await page.evaluate(()=>document.getElementById('tuQ').textContent.length);
ck(r1>0&&r2>r1,'11 the REAL toss-up question types itself out','len '+r1+' -> '+r2);

/* ---- once per phone ---- */
await page.evaluate(()=>document.getElementById('tuBack').click());
await sleep(900);
await toTossup();
const re=await page.evaluate(()=>({sam:document.getElementById('tuSam').classList.contains('on'),
  cd:document.getElementById('tuCd').classList.contains('on')}));
ck(!re.sam&&re.cd,'12 second visit: no offer, straight to the countdown');

/* ---- coach off means no offer ---- */
await boot({bk_coach:'0'});
await toTossup();
const off=await page.evaluate(()=>{const s=document.getElementById('tuSam');
  return {sam:!!(s&&s.classList.contains('on')),
  cd:document.getElementById('tuCd').classList.contains('on')};});
ck(!off.sam&&off.cd,'13 Coach off: no offer, the countdown untouched');
}

/* ---- never online, even called point-blank ---- */
await boot();
const netRefuse=await page.evaluate(()=>{
  window.BK.coach.net.on=true;
  const took=window.BKCoach.sampleOffer('local',null);
  const active=window.BKCoach._sample().active;
  window.BK.coach.net.on=false;
  return {took,active};
});
ck(!netRefuse.took&&!netRefuse.active,'14 a live NET flag refuses the offer outright');

/* ---- the decline path: the offer folds into the real countdown ---- */
if(!SAB){
await boot();
await toTossup();
const dec0=await sam();
await btn(/good/);
await sleep(500);
const dec=await page.evaluate(()=>{const s=document.getElementById('tuSam');
  return {sam:!!(s&&s.classList.contains('on')),cd:document.getElementById('tuCd').classList.contains('on')};});
ck(dec0.active&&!dec.sam&&dec.cd,"15 \"I'm good\" folds the offer straight into the real countdown");

/* ---- the CPU road: offer over the jumbotron, frozen tip, the nine beats
   UNDER the freeze, typed tip-off after. Drives the REAL boot order
   (startGame first, show('game') after, exactly endBeat's), the order
   that exposed the owner-capture bug the first build shipped. ---- */
await boot();
await page.evaluate(()=>{
  const C=window.BK.coach;
  C.cpu.on=true;C.cpu.team=1;C.cpu.level='rookie';
  C.startGame({league:'big3',decade:'ANY',target:11,rosters:C.pickRosters('big3','ANY')},false);
  C.show('game');
});
await sleep(700);
let cs=await sam();
const frz=await page.evaluate(()=>window.BK.coach.frozen());
ck(cs.active&&cs.mode==='cpu','16 CPU road: the offer rides the jumbotron window (real boot order)');
ck(cs.froze&&frz,'17 the tip is HELD: the game is frozen under the offer');
/* the poll must NOT abort the offer: two ticks pass, still standing */
await sleep(900);
cs=await sam();
ck(cs.active,'18 the offer survives the brains-to-game handover (no self-abort)');
/* walk the beats with the game still frozen underneath */
await btn(/show me/);
await sleep(400);
await btn(/go/);
await sleep(4400);
await btn(/got it/);
await sleep(800);
const f1=await page.evaluate(()=>({len:document.getElementById('tsmQ').textContent.length,
  frz:window.BK.coach.frozen()}));
await sleep(700);
const f2=await page.evaluate(()=>document.getElementById('tsmQ').textContent.length);
ck(f1.frz&&f1.len>0&&f2>f1.len,'19 the practice question types UNDER the freeze','len '+f1.len+' -> '+f2);
await sleep(1600);
await page.click('#tsmBot',{force:true});
await sleep(1100);
await page.click('#tsmRightA',{force:true});
await sleep(700);
const resCpu=await page.evaluate(()=>document.getElementById('tsmRes').textContent);
await sleep(1400);
ck(/ball/i.test(resCpu),'20 the CPU road result speaks its road (the ball, not the toss-up)','"'+resCpu+'"');
await btn(/ready/);
await sleep(400);
cs=await sam();
/* frozen() itself is NOT asserted false here: on a fresh phone the hello
   card can rise on the next watch tick and hold the game again, correctly.
   The sample's own claim is released; checks 22-23 prove the tip then runs. */
ck(!cs.active&&!cs.froze,'21 finishing releases the sample and its freeze claim');
/* on a FRESH phone the coach's once-ever hello rises the moment the sample
   ends (the ASAP law) and holds the tip again, correctly. Tap it through. */
await sleep(900);
await page.evaluate(()=>{const c=document.querySelector('#coachTip.on .ct-ok');if(c)c.click();});
/* the held runTipoff fires; wait for the veil, then the typed question */
let veilUp=false;
for(let i=0;i<40;i++){
  veilUp=await page.evaluate(()=>document.getElementById('tipveil').classList.contains('on'));
  if(veilUp)break;await sleep(200);
}
ck(veilUp,'22 the tip-off arrives after the practice ends');
/* ride out the 5..1 (chained fTimeout, 800ms) then watch the type-out */
let g1=0,g2=0;
for(let i=0;i<40;i++){
  g1=await page.evaluate(()=>document.getElementById('tipQ').textContent.length);
  if(g1>0)break;await sleep(200);
}
await sleep(500);
g2=await page.evaluate(()=>document.getElementById('tipQ').textContent.length);
ck(g1>0&&g2>g1,'23 the REAL tip-off question types itself out','len '+g1+' -> '+g2);
}

ck(errs.length===0,'no page errors end to end',errs.join(' | '));
console.log('');
console.log(fails.length?('RED: '+fails.length+' failing'):'GREEN: sample-check clean');
await b.close();
process.exit(fails.length?1:0);

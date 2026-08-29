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
/* WAIT FOR THE BEAT, NOT A GUESSED NUMBER OF MILLISECONDS. The practice
   question grew by 31 characters on 08-29 and every fixed sleep after the
   typewriter silently fell short, turning three product checks red for a
   product that was fine. Poll the thing the beat actually changes. */
async function waitFor(fn,ms,arg){
  const t0=Date.now();
  while(Date.now()-t0<(ms||9000)){
    if(await page.evaluate(fn,arg))return true;
    await sleep(120);
  }
  return false;
}
/* NEVER CLICK INTO THE VOID. A wait that fails and then clicks anyway turns
   a missing beat into a 30s Playwright timeout that names the element rather
   than the beat, and kills the run before any later check can speak. This
   waits, and if the beat never lands it says WHICH beat and walks on, so the
   report reaches the end and the red line is the truth (same law the sweep
   learned on 08-28: the walk is transport, the guards do the judging). */
/* the coach's own buttons, tapped only once they are on the card */
async function btnWhen(re,what,then,ms){
  const ok=await waitFor(r=>[...document.querySelectorAll('#tsmBtns button')]
    .some(b=>new RegExp(r,'i').test(b.textContent)),ms||12000,re.source);
  if(!ok){
    /* say what WAS on screen: a missing beat is only useful if the report
       names where the walk actually stopped */
    const at=await page.evaluate(()=>({
      btns:[...document.querySelectorAll('#tsmBtns button')].map(b=>b.textContent),
      say:document.getElementById('tsmSay').textContent.slice(0,40),
      card:document.getElementById('tsmCard').classList.contains('on'),
      ans:document.getElementById('tsmAns').classList.contains('on'),
      res:document.getElementById('tsmRes').classList.contains('on'),
      botDis:document.getElementById('tsmBot').disabled}));
    ck(false,'BEAT MISSING · '+what+' never offered its button',JSON.stringify(at));
    return false;}
  const hit=await btn(re);
  if(then&&!await waitFor(then,ms||12000)){
    const at=await page.evaluate(()=>({
      btns:[...document.querySelectorAll('#tsmBtns button')].map(b=>b.textContent),
      say:document.getElementById('tsmSay').textContent.slice(0,40)}));
    ck(false,'TAP DID NOT TAKE · '+what,JSON.stringify(at));
    return false;
  }
  return hit;
}
async function tapWhen(sel,cond,what,then,ms){
  if(!await waitFor(cond,ms||12000)){
    ck(false,'BEAT MISSING · '+what+' never arrived, so '+sel+' was not tapped');
    return false;
  }
  await page.click(sel,{force:true});
  if(then&&!await waitFor(then,ms||12000)){
    const at=await page.evaluate(()=>({
      btns:[...document.querySelectorAll('#tsmBtns button')].map(b=>b.textContent),
      say:document.getElementById('tsmSay').textContent.slice(0,40)}));
    ck(false,'TAP DID NOT TAKE · '+sel+' at '+what,JSON.stringify(at));
    return false;
  }
  return true;
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
/* HIS RING, option 1 off the 08-29 board. Asserted on the PAINTED pseudo,
   never on the class: the 08-29 ghost card taught that a class says what
   the code meant and only the computed style says what he can see. */
const cdRing=await page.evaluate(()=>{
  const cs=getComputedStyle(document.getElementById('tsmCdn'),'::after');
  return {w:parseFloat(cs.borderTopWidth)||0,col:cs.borderTopColor,op:+cs.opacity,
          r:cs.borderRadius,gen:cs.content};
});
/* `content` is the property that decides whether the pseudo GENERATES A BOX
   at all. Leaving it out was the first version's hole: computed style still
   reports a 2px border on a pseudo that draws nothing, so a sabotage that
   removed the ring sailed through green. Declared is not painted. */
ck(cdRing.w>=1&&/^rgb/.test(cdRing.col)&&cdRing.op>0.1&&/%|50/.test(cdRing.r)&&cdRing.gen!=='none',
  '3c HIS RING · the countdown glyph wears a painted round ring',
  cdRing.w+'px '+cdRing.col+' op='+cdRing.op.toFixed(2)+' content='+cdRing.gen);
await btn(/go/);
/* the 5..1 at 800ms, spent measuring instead of idling */
const pb=await blinks('#tsmCdn',4200);
ck(pb.blinks===0,'3b the PRACTICE countdown holds each number, no double blink',
  'blinks='+pb.blinks+' over '+pb.numbers+' numbers');
await waitFor(()=>document.getElementById('tsmCard').classList.contains('on'),9000);
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
/* HIS CALL, 08-29: "those three rings should just be one large one around
   all three items." When the coach points at the whole stage the stage is
   the subject, so one ring wraps the lot and the members wear none. */
const grp=await page.evaluate(()=>{
  const w=document.querySelector('#tuSam .tsm-wrap');
  const g=getComputedStyle(w,'::after');
  const m=getComputedStyle(document.getElementById('tsmBot'),'::after');
  return {grouped:w.classList.contains('lit-group'),
    bw:parseFloat(g.borderTopWidth)||0,col:g.borderTopColor,gen:g.content,mem:m.content};
});
ck(grp.grouped&&grp.bw>=1&&/^rgb/.test(grp.col)&&grp.gen!=='none'&&grp.mem==='none',
  '4b HIS CALL · three subjects wear ONE ring around the lot, not a ring each',
  'group='+grp.gen+' '+grp.bw+'px member='+grp.mem);
await btn(/got it/);
await sleep(800);
const t1=await page.evaluate(()=>document.getElementById('tsmQ').textContent.length);
await sleep(700);
const t2=await page.evaluate(()=>document.getElementById('tsmQ').textContent.length);
ck(t1>0&&t2>t1,'5 beat 4: the practice question types itself out','len '+t1+' -> '+t2);
/* the typer finishes, then the coach hands off to the buzzer */
const handoff=await waitFor(()=>{
  const b=document.getElementById('tsmBot');
  return !b.disabled&&b.classList.contains('lit');
},10000);
ck(handoff,'5a the handoff to the buzzer arrives after the typing');
/* HIS CATCH, 08-29: the answer 5 is only true of a standard game, and this
   practice runs in front of BIG3, which is three a side. The qualifier is
   the difference between teaching the rule and teaching the wrong number. */
const qTxt=await page.evaluate(()=>document.getElementById('tsmQ').textContent);
ck(/^in a standard/i.test(qTxt.trim()),
  '5b the practice question qualifies itself, so BIG3 is not taught 5',
  JSON.stringify(qTxt.slice(0,34)));
const bz=await page.evaluate(()=>({
  botDis:document.getElementById('tsmBot').disabled,
  topDis:document.getElementById('tsmTop').disabled,
  botLit:document.getElementById('tsmBot').classList.contains('lit'),
  say:document.getElementById('tsmSay').textContent}));
ck(!bz.botDis&&bz.topDis&&bz.botLit&&/buzz/i.test(bz.say),
  '6 beat 5: only the bottom buzzer (you) is live and lit');
const bzRing=await page.evaluate(()=>{
  const on=getComputedStyle(document.getElementById('tsmBot'),'::after');
  const off=getComputedStyle(document.getElementById('tsmTop'),'::after');
  return {w:parseFloat(on.borderTopWidth)||0,col:on.borderTopColor,op:+on.opacity,
          gen:on.content,offW:parseFloat(off.borderTopWidth)||0,offC:off.content};
});
ck(bzRing.w>=1&&/^rgb/.test(bzRing.col)&&bzRing.op>0.1&&bzRing.gen!=='none',
  '6b HIS RING · the lit buzzer wears a painted ring',
  bzRing.w+'px '+bzRing.col+' op='+bzRing.op.toFixed(2)+' content='+bzRing.gen);
ck(bzRing.offW===0||bzRing.offC==='none',
  '6c HIS RING · and the buzzer he is NOT pointing at wears none',
  'unlit border='+bzRing.offW+'px content='+bzRing.offC);
await page.click('#tsmBot',{force:true});
await waitFor(()=>{const r=document.getElementById('tsmRightA');
  return !!r&&!r.disabled&&r.classList.contains('lit');},12000);
const an=await page.evaluate(()=>({
  n:document.querySelectorAll('#tsmAns button').length,
  right:!!document.getElementById('tsmRightA'),
  lit:document.getElementById('tsmRightA')&&document.getElementById('tsmRightA').classList.contains('lit'),
  live:document.getElementById('tsmRightA')&&!document.getElementById('tsmRightA').disabled,
  others:[...document.querySelectorAll('#tsmAns button')].filter(b=>b.id!=='tsmRightA').every(b=>b.disabled)}));
ck(an.n===4&&an.right&&an.lit&&an.live&&an.others,
  '7 beat 7: four answers, the right one lit and the only one live');
await tapWhen('#tsmRightA',()=>{const r=document.getElementById('tsmRightA');
  return !!r&&!r.disabled;},'the answers');
await waitFor(()=>document.getElementById('tsmRes').classList.contains('on'),9000);
const res=await page.evaluate(()=>({on:document.getElementById('tsmRes').classList.contains('on'),
  t:document.getElementById('tsmRes').textContent}));
ck(res.on&&/win/i.test(res.t),'8 beat 8: the result line lands','"'+res.t+'"');
/* the wrap lands 1400ms after the result, and waiting 1300 for it was how
   the sprint lap below ended up driving the wrong screen: "Run it again"
   did not exist yet, the click hit nothing, and the failure surfaced twelve
   seconds later pointing at a disabled buzzer. Wait for the button. */
await waitFor(()=>[...document.querySelectorAll('#tsmBtns button')]
  .some(b=>/again/i.test(b.textContent)),9000);
/* run it again must LOOP: back to the countdown explain, no key burned */
await page.evaluate(()=>document.body.classList.add('reduce-motion')); /* second lap, fast */
await btn(/again/);
await waitFor(()=>document.querySelector('.tsm-cd').classList.contains('on'),9000);
const again=await page.evaluate(()=>({cd:document.querySelector('.tsm-cd').classList.contains('on'),
  say:document.getElementById('tsmSay').textContent,active:window.BKCoach._sample().active}));
ck(again.active&&again.cd&&/countdown/i.test(again.say),'9 "Run it again" loops back to the countdown');
/* sprint the reduced-motion lap to the wrap */
/* the sprint lap was the most brittle stretch in the file: four beats
   driven on 400/700/600/600ms guesses. Each step now waits for the thing
   the beat actually creates, so lane contention slows it instead of
   breaking it. */
/* the regexes are ANCHORED. /^let|go/ reads as "starts with let OR contains
   go", and "Got it" contains go, so a loose pattern can tap the next beat's
   button and put the whole walk one step out of phase (08-29). */
await btnWhen(/let.s go/,'the sprint lap countdown',
  ()=>document.getElementById('tsmCard').classList.contains('on'));
await btnWhen(/^got it/,'the sprint lap card',
  ()=>!document.getElementById('tsmBot').disabled);
await tapWhen('#tsmBot',()=>!document.getElementById('tsmBot').disabled,
  'the sprint lap handoff',
  ()=>{const r=document.getElementById('tsmRightA');return !!r&&!r.disabled;});
await tapWhen('#tsmRightA',()=>{const r=document.getElementById('tsmRightA');
  return !!r&&!r.disabled;},'the sprint lap answers',
  ()=>document.getElementById('tsmRes').classList.contains('on'));
/* motion back ON before the real countdown is asked for: tuCountdown skips
   the overlay entirely under reduce-motion, so leaving it set would make
   check 10 red for a countdown that was never meant to draw. */
await page.evaluate(()=>document.body.classList.remove('reduce-motion'));
await btnWhen(/ready/,'the sprint lap wrap');
await waitFor(()=>!document.getElementById('tuSam').classList.contains('on'),9000);
const done=await page.evaluate(()=>({sam:document.getElementById('tuSam').classList.contains('on'),
  cd:document.getElementById('tuCd').classList.contains('on'),active:window.BKCoach._sample().active}));
ck(!done.sam&&!done.active&&done.cd,'10 "I\'m ready" tears down into the REAL countdown',
  'sam='+done.sam+' active='+done.active+' realCd='+done.cd);
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
/* the CPU road's own beats, on their signals rather than on guesses: the
   last stretch in this file still sleeping, and the question growing by 31
   characters was enough to walk it off the end (08-29). */
await tapWhen('#tsmBot',()=>!document.getElementById('tsmBot').disabled,
  'the CPU road handoff',
  ()=>{const r=document.getElementById('tsmRightA');return !!r&&!r.disabled;});
await tapWhen('#tsmRightA',()=>{const r=document.getElementById('tsmRightA');
  return !!r&&!r.disabled;},'the CPU road answers',
  ()=>document.getElementById('tsmRes').classList.contains('on'));
const resCpu=await page.evaluate(()=>document.getElementById('tsmRes').textContent);
ck(/ball/i.test(resCpu),'20 the CPU road result speaks its road (the ball, not the toss-up)','"'+resCpu+'"');
await btnWhen(/ready/,'the CPU road wrap');
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

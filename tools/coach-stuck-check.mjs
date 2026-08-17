/* THE COACH CARD MUST NEVER OUTLIVE ITS SCREEN. :8899.
   Aaron reported this twice before it was fixed (08-16): "the coach in daily
   5 got stuck and wouldn't go away, and persisted all the way into
   gameplay." The old janitor rule was an ALLOWLIST that exempted the game
   and daily screens, so the daily was a hiding place and a card raised there
   could walk into a game with nowhere to die.
   The rule now: a card belongs to the screen that raised it. This suite
   drives real transitions and proves it, on every pairing the old rule got
   wrong, plus the janitor path that show() cannot see.
   SABOTAGE-PROVED: deleting the hideUnless call in show() fails check 2. */
import pw from 'playwright';
const { chromium } = pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--mute-audio'] });
const p = await (await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,140)));
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','1')});
await p.reload({waitUntil:'networkidle'}); await sleep(1600);
const card=()=>p.evaluate(()=>{const t=document.getElementById('coachTip'),v=document.getElementById('coachVeil');
  return {on:!!t&&t.classList.contains('on'),veil:!!v&&v.classList.contains('on'),
    owner:t?(t.dataset.screen||''):'',
    here:([].slice.call(document.querySelectorAll('.screen.on')).filter(s=>!s.classList.contains('sOut'))[0]||{}).id||''};});
let pass=0,fail=[];
const ck=(m,x,n)=>{x?pass++:fail.push(m);console.log(`  ${x?'PASS':'FAIL'}  ${m}${n?'   ['+n+']':''}`)};

// THE REPORTED BUG: daily -> game
await p.evaluate(()=>{window.BK._show('daily');window.BKDaily.open()}); await sleep(900);
await p.evaluate(()=>window.BKCoach.say('r1','<b>Test</b> daily card.')); await sleep(350);
let c=await card();
ck('a daily card raises and records the daily as its owner', c.on&&c.owner==='screen-daily', c.owner);
await p.evaluate(()=>window.BK._show('game')); await sleep(700);
c=await card();
ck('THE REPORTED BUG · it does NOT follow you into gameplay', !c.on&&!c.veil, 'on='+c.on+' veil='+c.veil);

// every other screen the card could be dragged onto
for (const [from,to] of [['daily','title'],['daily','settings'],['title','game'],['game','title'],['title','daily']]) {
  await p.evaluate(s=>window.BK._show(s), from); await sleep(500);
  await p.evaluate(()=>window.BKCoach.say('k'+Math.random(),'<b>Test</b> card.')); await sleep(300);
  const before=await card();
  await p.evaluate(s=>window.BK._show(s), to); await sleep(700);
  const after=await card();
  ck(`card raised on ${from} dies on the way to ${to}`, before.on&&!after.on, 'raised='+before.on+' after='+after.on);
}

// the janitor still catches a card whose screen changed WITHOUT show()
await p.evaluate(()=>{window.BK._show('daily')}); await sleep(500);
await p.evaluate(()=>window.BKCoach.say('j1','<b>Test</b> janitor.')); await sleep(300);
await p.evaluate(()=>{ // move screens behind show()'s back
  document.getElementById('screen-daily').classList.remove('on');
  document.getElementById('screen-title2').classList.add('on'); });
await sleep(1800);
c=await card();
ck('the janitor still sweeps a card whose screen moved behind show()', !c.on, 'on='+c.on);

// and the game is actually PLAYABLE after (nothing left frozen)
await p.evaluate(()=>{const C=window.BK.coach;C.show('game');
  C.startGame({league:'nba',decade:['FULL'],target:11,rosters:C.pickRosters('nba',['FULL'])},true)});
await sleep(1200);
const live=await p.evaluate(()=>{const st=window.BK.state();
  const t=document.getElementById('coachTip'),v=document.getElementById('coachVeil');
  return {phase:st.phase, card:!!t&&t.classList.contains('on'), owner:t?t.dataset.screen:'',
          veil:!!v&&v.classList.contains('on')}});
/* the real invariant: a veil may only be up while a card OWNED BY THIS SCREEN
   is up. A veil with no card is the horror; a veil under the legitimate
   first-run tip is the coach doing his job. */
ck('no veil is ever up without a card behind it',
   !live.veil||(live.card&&live.owner==='screen-game'),
   'veil='+live.veil+' card='+live.card+' owner='+live.owner);

/* ---- the OTHER half of his report: "wouldn't go away". A card that cannot
   be dismissed by the button it offers is the same bug wearing a different
   coat, so Got it is hit-tested and fired on every surface a card can sit
   on, including the calendar popup, which is INSIDE the daily and must
   therefore KEEP its card (ownership) while staying dismissible. */
for (const scr of ['daily','game','title','settings']) {
  await p.evaluate(s=>window.BK._show(s), scr); await sleep(550);
  await p.evaluate(()=>window.BKCoach.say('g'+Math.random(),'<b>Dismiss</b> me.')); await sleep(300);
  const reach = await p.evaluate(()=>{
    const okb=document.querySelector('#coachTip .ct-ok'); if(!okb)return {r:false,t:'no button'};
    const b=okb.getBoundingClientRect(), top=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
    return {r:okb===top||okb.contains(top), t:top?(top.className||top.id||top.tagName):'none'};
  });
  ck(`Got it is reachable by a thumb on ${scr}`, reach.r, 'topmost: '+reach.t);
  await p.evaluate(()=>document.querySelector('#coachTip .ct-ok').click()); await sleep(250);
  const g2=await card();
  ck(`Got it actually dismisses on ${scr}`, !g2.on&&!g2.veil, 'on='+g2.on+' veil='+g2.veil);
}

/* the calendar is a popup inside the daily: the card must SURVIVE it
   (ownership is per screen, not per popup) and still be dismissible */
await p.evaluate(()=>{window.BK._show('daily');window.BKDaily.open()}); await sleep(800);
await p.evaluate(()=>window.BKCoach.say('cal1','<b>Calendar</b> case.')); await sleep(300);
await p.evaluate(()=>{if(window.BKDaily._cal)window.BKDaily._cal()}); await sleep(650);
let cc=await card();
ck('a daily card survives the calendar popup (same screen, not a new one)', cc.on, 'on='+cc.on);
await p.evaluate(()=>document.querySelector('#coachTip .ct-ok').click()); await sleep(250);
cc=await card();
ck('and Got it still dismisses it from over the calendar', !cc.on&&!cc.veil, 'on='+cc.on);

/* his screenshot showed "CLOCK STOPPED AT :23" over a clock reading :16: a
   card outliving its run tells a lie about the clock. While the card belongs
   to the live run the two must agree. */
await p.evaluate(()=>{window.BK._show('daily');window.BKDaily.open()}); await sleep(800);
await p.evaluate(()=>window.BKCoach.say('clk1','<b>Clock</b> claim.')); await sleep(300);
const claim=await p.evaluate(()=>{
  const who=document.querySelector('#coachTip .ct-who');
  const clk=document.getElementById('dvClock')||document.getElementById('dvClockWrap');
  const m=(who?who.textContent:'').match(/:(\d\d)/), c=(clk?clk.textContent:'').match(/:(\d\d)/);
  return {header:m?m[1]:'', clock:c?c[1]:'', raw:(who?who.textContent.trim():'')};
});
ck('the card never lies about the clock it claims to hold',
   !claim.header||claim.header===claim.clock, claim.raw+' vs clock :'+claim.clock);
await p.evaluate(()=>{const b=document.querySelector('#coachTip .ct-ok'); if(b)b.click()}); await sleep(200);

/* ---- AARON'S EXACT WALK, from the five screenshots he sent (08-16 3:43 to
   3:45): the card rode the daily, the results screen, the calendar, the
   menu, and finally a Method B game. Replayed as one continuous sequence,
   because five passing unit cases do not prove the journey.
   It tracks the card's IDENTITY, not merely whether A card is up: the game
   screen legitimately raises its OWN tip, and a first version of this check
   called that a failure. What must never happen is the DAILY's card showing
   up somewhere it does not belong. */
await p.evaluate(()=>{localStorage.setItem('bk_coach','1')});
await p.evaluate(()=>{window.BK._show('daily');window.BKDaily.open()}); await sleep(800);
const MARK='RESUME NOTICE from the daily';
await p.evaluate(m=>window.BKCoach.say('walk','<b>'+m+'</b>'), MARK); await sleep(300);
const body=()=>p.evaluate(()=>{const t=document.getElementById('coachTip');
  return (t&&t.classList.contains('on'))?t.querySelector('.ct-txt').textContent:'';});
let trail=[], leaked=[];
for (const step of ['daily(calendar)','title','game']) {
  if(step==='daily(calendar)') await p.evaluate(()=>{if(window.BKDaily._cal)window.BKDaily._cal()});
  else await p.evaluate(s=>window.BK._show(s), step);
  /* 300ms: show()'s synchronous work has run, the 700ms janitor tick has NOT.
     This measures what a thumb experiences (tap, and it is gone) rather than
     eventual cleanup. The first version slept 750ms and therefore PASSED
     against the buggy code, because the old janitor got a tick in: a check
     that waits for the backstop is measuring the backstop, not the fix. */
  await sleep(300);
  const t=await body(), mine=t.indexOf(MARK)>=0;
  trail.push(step+'='+(mine?'DAILY CARD':(t?'own tip':'clear')));
  if(step!=='daily(calendar)'&&mine) leaked.push(step);
}
ck("HIS WALK · the daily's card never reaches the menu or the game",
   leaked.length===0, trail.join(' · '));

ck('zero page errors across the whole run', errs.length===0, errs[0]||'');
console.log('\n'+(fail.length? fail.length+' FAILING: '+fail.join(' · ') : 'ALL '+pass+' PASS'));
await b.close(); process.exit(fail.length?1:0);

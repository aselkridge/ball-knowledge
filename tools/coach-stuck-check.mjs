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
ck('zero page errors across the whole run', errs.length===0, errs[0]||'');
console.log('\n'+(fail.length? fail.length+' FAILING: '+fail.join(' · ') : 'ALL '+pass+' PASS'));
await b.close(); process.exit(fail.length?1:0);

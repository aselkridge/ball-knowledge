/* THE DOME AND THE LOUD BUZZ (rows 13+214, his picks 08-31). Serve docs/
   on :8899, run from repo root.

   PROPERTIES, in order:
   1. The toss-up race on the friend road is the SANDWICH: stacked painted
      domes, the top end rotated to face its player, the question and the
      moment's name reading both directions, the screen bared to buzzers +
      card. The mirrored reading tracks the typewriter tick for tick.
   2. The buzz is theatre on both races: the winner's dome slams and
      flares, the loser's goes dark, the stamp lands, the buzzin sting
      rings, and the answers HOLD a beat before appearing.
   3. The jump ball wears the same device: dome zones, you at the bottom
      of a CPU game, the toss-up's card language (no graffiti title), the
      CPU road's own How-it-works card, and the CPU's win playing the
      identical theatre instead of an 11px whisper.

   SABOTAGE=geometry strips the stacking orders from the CSS in flight;
   the sandwich checks must go red or the geometry law has no teeth.
   SABOTAGE=silent strips the buzzin sting from tipBuzz in flight; the
   sting-spy check must go red or the silent-defect fix has no witness.
   A missed patch is a hard error, never a quiet green.

   Runs at default motion; reduce-motion parity for these surfaces rides
   the fleet's existing reduce-motion sweeps. */
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

if(SAB==='geometry'){
  /* strip the declaration the sandwich actually stands on. The first
     version stripped the top dome's order:1 and stayed green, because a
     missing order is order 0 and 0 sorts first anyway: a sabotage must
     kill the thing the layout depends on, not a redundant sibling. */
  let hit=false;
  await page.route('**/play/',async route=>{
    const body=await(await fetch(route.request().url())).text();
    const pat='.tu-buzzes{display:contents}';
    if(body.indexOf(pat)<0){console.log('SABOTAGE PATCH MISSED');process.exit(2);}
    hit=true;
    route.fulfill({contentType:'text/html',body:body.replace(pat,'.tu-buzzes{display:flex}')});
  });
  page.on('load',()=>{if(!hit)console.log('  (geometry sabotage not yet hit)')});
}
if(SAB==='silent'){
  let hit=false;
  await page.route('**/play/game.js',async route=>{
    const body=await(await fetch(route.request().url())).text();
    const pat="if(window.BKAudio)BKAudio.sfx('buzzin');";
    if(body.indexOf(pat)<0){console.log('SABOTAGE PATCH MISSED');process.exit(2);}
    hit=true;
    route.fulfill({contentType:'application/javascript',body:body.replace(pat,'')});
  });
  page.on('load',()=>{if(!hit)console.log('  (silent sabotage not yet hit)')});
}

async function boot(seed){
  await page.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await page.evaluate(s=>{localStorage.clear();for(const k in (s||{}))localStorage.setItem(k,s[k]);},seed||{});
  await page.reload({waitUntil:'networkidle'});
  await sleep(900);
  await page.evaluate(()=>{const c=document.querySelector('#coachTip .ct-ok');if(c)c.click();});
  await sleep(200);
  /* the sting spy: every sfx call lands in a list the checks can read */
  await page.evaluate(()=>{window.__sfx=[];
    if(window.BKAudio){const o=BKAudio.sfx;
      BKAudio.sfx=function(n){window.__sfx.push(n);return o.apply(this,arguments)};}});
}
async function waitFor(fn,ms){const t0=Date.now();
  while(Date.now()-t0<(ms||12000)){if(await page.evaluate(fn))return true;await sleep(120);}return false;}
const BURNED={bk_coach_seen:JSON.stringify({met:1,tossupOffer:1})};

/* ================= 1 · the friend-road toss-up sandwich ================= */
await boot(BURNED);
await page.evaluate(()=>{const btns=[...document.querySelectorAll('button,.mbtn')];
  btns.find(x=>/local|friend|pass/i.test(x.textContent)).click();});
await sleep(900);
await page.evaluate(()=>document.getElementById('nmGo').click());
await sleep(900);
await page.click('#tuReady',{force:true});
const live=await waitFor(()=>{const cd=document.getElementById('tuCd');
  return cd&&!cd.classList.contains('on')&&document.getElementById('tuQ').textContent.length>2;},20000);
ck(live,'1 the race goes live after the countdown (suspects: tuCountdown, this probe)');
/* mid-typewriter: the mirror must already match, tick for tick */
const mid=await page.evaluate(()=>({q:document.getElementById('tuQ').textContent,
  m:document.getElementById('tuQflip').textContent,
  mv:getComputedStyle(document.getElementById('tuQflip')).display!=='none'}));
ck(mid.q===mid.m&&mid.q.length>2,'2 the mirrored reading tracks the typewriter mid-word',
  'len='+mid.q.length);
ck(mid.mv,'2b the mirror is PAINTED in a friend match, not merely synced');
const geo=await page.evaluate(()=>{
  const p=document.getElementById('tuPlay');
  const o=p.querySelector('.tu-buzz.o'),bl=p.querySelector('.tu-buzz.b');
  const or_=o.getBoundingClientRect(),br=bl.getBoundingClientRect(),
        qr=p.querySelector('.tu-q').getBoundingClientRect();
  const oc=getComputedStyle(o),bc=getComputedStyle(bl);
  return {shared:p.classList.contains('race-shared'),
    sandwich:br.top<qr.top&&qr.top<or_.top,
    roundO:oc.borderRadius,wO:or_.width,hO:or_.height,
    flip:bc.transform&&bc.transform!=='none',
    header:getComputedStyle(document.querySelector('#screen-tossup>.setup-h')).display,
    tagTop:getComputedStyle(document.querySelector('#tuPlay .rt-top')).transform,
    tagBot:getComputedStyle(document.querySelector('#tuPlay .rt-bot')).display};
});
ck(geo.shared&&geo.sandwich,'3 the sandwich: their end, the card, your end, in that order',
  'shared='+geo.shared+' sandwich='+geo.sandwich);
ck(geo.roundO==='50%'&&geo.wO>110&&Math.abs(geo.wO-geo.hO)<2,
  'render guard: the dome is painted round at real size',
  geo.roundO+' '+Math.round(geo.wO)+'x'+Math.round(geo.hO));
ck(geo.flip,'4 the top end is rotated to face its player','matrix='+String(geo.flip).slice(0,24));
ck(geo.header==='none','5 the race screen is bared: the header is gone (his ruling)');
ck(geo.tagTop!=='none'&&geo.tagBot!=='none',
  '6 the moment is named BOTH ways (rotated top tag, painted bottom tag)');
const tagFs=await page.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('#tuPlay .rt-top')).fontSize));
ck(tagFs>=14,'6b the moment\'s name reads at his bigger size (14px floor)','fs='+tagFs+'px');
/* the buzz: theatre, sting, held beat */
await page.evaluate(()=>{window.__sfx.length=0;});
await page.click('.tu-buzz.o',{force:true});
await sleep(220);
const th=await page.evaluate(()=>{
  const won=document.querySelector('.tu-buzz.o'),lost=document.querySelector('.tu-buzz.b');
  return {wonCls:won.classList.contains('dome-won'),
    lostOp:+getComputedStyle(lost).opacity,
    flare:getComputedStyle(won).boxShadow.length,
    who:document.getElementById('tuWho').classList.contains('on'),
    whoH:document.getElementById('tuWho').getBoundingClientRect().height,
    sting:window.__sfx.indexOf('buzzin')>=0,
    ansEarly:document.getElementById('tuAns').classList.contains('on'),
    mirror:document.getElementById('tuQflip').textContent===document.getElementById('tuQ').textContent};
});
ck(th.wonCls&&th.flare>60,'7 the winner\'s dome slams and FLARES (painted, not classed)',
  'shadow chars='+th.flare);
ck(th.lostOp<0.3,'8 the loser\'s dome goes dark','opacity='+th.lostOp.toFixed(2));
ck(th.who&&th.whoH>20,'9 the who-buzzed stamp lands, painted','h='+Math.round(th.whoH));
ck(th.sting,'10 the buzzin sting rings on the buzz (suspects: tuShowBuzzer, the spy)');
ck(!th.ansEarly,'11 the answers HOLD for the beat: nothing at +220ms');
ck(th.mirror,'11b typeFinish reached the mirror too: both readings complete');
const ansAfter=await waitFor(()=>document.getElementById('tuAns').classList.contains('on'),3000);
ck(ansAfter,'12 the answers land after the held beat');

/* ================= 2 · the CPU-road jump ball ================= */
await boot(BURNED);
await page.evaluate(()=>{
  const C=window.BK.coach;
  C.cpu.on=true;C.cpu.team=1;C.cpu.level='rookie';
  C.startGame({league:'big3',decade:'ANY',target:11,rosters:C.pickRosters('big3','ANY')},false);
  C.show('game');
});
const howed=await waitFor(()=>document.getElementById('tipveil').classList.contains('howing'),9000);
ck(howed,'13 the CPU road opens its jump ball on the How-it-works card (his B ruling)');
await page.click('#tipReady',{force:true});
const armed=await waitFor(()=>{const q=document.getElementById('tipQ');
  return q.textContent.length>2&&!document.getElementById('tzA').classList.contains('lock');},25000);
ck(armed,'14 the race arms after the ready tap (once-key burned: no offer between)');
const cgeo=await page.evaluate(()=>{
  const tv=document.getElementById('tipveil');
  const a=document.getElementById('tzA').getBoundingClientRect();
  const b2=document.getElementById('tzB').getBoundingClientRect();
  const dome=document.querySelector('#tzA .buzz'),dc=getComputedStyle(dome),dr=dome.getBoundingClientRect();
  const card=document.querySelector('#tipveil .tipcard'),cc=getComputedStyle(card);
  return {youA:tv.classList.contains('you-a'),below:a.top>b2.top,
    round:dc.borderRadius,w:dr.width,h:dr.height,
    tt:!!tv.querySelector('.tt'),
    cardR:cc.borderRadius,cardB:cc.borderTopWidth,
    tag:getComputedStyle(document.querySelector('#tipveil .rt-top')).display,
    mirrorHidden:getComputedStyle(document.getElementById('tipQflip')).display==='none'};
});
ck(cgeo.youA&&cgeo.below,'15 YOUR dome takes the bottom end of a CPU game (you were on top before)');
ck(cgeo.round==='50%'&&cgeo.w>110&&Math.abs(cgeo.w-cgeo.h)<2,
  'render guard: the jump ball dome is painted round at real size',
  cgeo.round+' '+Math.round(cgeo.w)+'x'+Math.round(cgeo.h));
ck(!cgeo.tt,'16 the graffiti Jump Ball! title is gone: the toss-up\'s language won');
ck(cgeo.cardR==='16px'&&parseFloat(cgeo.cardB)>=1,
  '17 the question rides the toss-up\'s own card (.tu-q values)',
  'radius='+cgeo.cardR+' border='+cgeo.cardB);
ck(cgeo.tag!=='none','18 the moment is named on the card: Jump Ball, the mono tag');
ck(cgeo.mirrorHidden,'19 no mirrored reading in a solo game: one player, one direction');
/* the CPU's win is watched, not whispered */
await page.evaluate(()=>{window.__sfx.length=0;});
const cbuzz=await waitFor(()=>document.getElementById('tipWho').classList.contains('on'),30000);
ck(cbuzz,'20 the CPU buzzes and the stamp lands (suspects: the CPU clock, tipBuzz)');
const cth=await page.evaluate(()=>({
  won:document.querySelector('#tzB .buzz').classList.contains('dome-won'),
  flare:getComputedStyle(document.querySelector('#tzB .buzz')).boxShadow.length,
  lostOp:+getComputedStyle(document.querySelector('#tzA')).opacity,
  sting:window.__sfx.indexOf('buzzin')>=0,
  who:document.getElementById('tipWho').textContent}));
ck(cth.won&&cth.flare>60,'21 the CPU\'s dome slams and flares: you SEE it win','shadow chars='+cth.flare);
ck(cth.lostOp<0.5,'22 your zone goes dark under its win','op='+cth.lostOp.toFixed(2));
ck(cth.sting,'23 the sting rings for the CPU\'s buzz too: the silent tipBuzz defect is dead');
ck(/buzzed/i.test(cth.who),'24 the stamp speaks the winner','"'+cth.who+'"');

/* ================= 3 · wide screens run left/right, you on the LEFT
   (his 08-31 ruling). A desk has no ends: nothing rotates, nothing
   mirrors, and A/L still mean left/right. ================= */
const wctx=await b.newContext({viewport:{width:1440,height:900}});
const wpage=await wctx.newPage();
wpage.on('pageerror',e=>errs.push('wide: '+String(e).slice(0,140)));
if(SAB==='flat'){
  /* push the wide breakpoint out of reach: the wide checks must go red.
     Registered on the WIDE page: a route on the phone context would never
     touch this context and the sabotage would be theatre (lesson 1.3z). */
  let whit=false;
  await wpage.route('**/play/',async route=>{
    const body=await(await fetch(route.request().url())).text();
    const pat='@media (min-width:700px){';
    if(body.indexOf(pat)<0){console.log('SABOTAGE PATCH MISSED');process.exit(2);}
    whit=true;
    route.fulfill({contentType:'text/html',body:body.replace(pat,'@media (min-width:70000px){')});
  });
  wpage.on('load',()=>{if(!whit)console.log('  (flat sabotage not yet hit)')});
}
async function wwait(fn,ms){const t0=Date.now();
  while(Date.now()-t0<(ms||20000)){if(await wpage.evaluate(fn))return true;await sleep(120);}return false;}
await wpage.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await wpage.evaluate(s=>{localStorage.clear();for(const k in s)localStorage.setItem(k,s[k]);},BURNED);
await wpage.reload({waitUntil:'networkidle'});
await sleep(900);
await wpage.evaluate(()=>{const c=document.querySelector('#coachTip .ct-ok');if(c)c.click();});
await wpage.evaluate(()=>{const btns=[...document.querySelectorAll('button,.mbtn')];
  btns.find(x=>/local|friend|pass/i.test(x.textContent)).click();});
await sleep(900);
await wpage.evaluate(()=>document.getElementById('nmGo').click());
await sleep(900);
await wpage.click('#tuReady',{force:true});
const wlive=await wwait(()=>{const cd=document.getElementById('tuCd');
  return cd&&!cd.classList.contains('on')&&document.getElementById('tuQ').textContent.length>2;});
ck(wlive,'25 wide: the race goes live (suspects: tuCountdown, this probe)');
const wgeo=await wpage.evaluate(()=>{
  const o=document.querySelector('.tu-buzz.o').getBoundingClientRect();
  const bl=document.querySelector('.tu-buzz.b').getBoundingClientRect();
  const q=document.querySelector('.tu-q').getBoundingClientRect();
  const m=new DOMMatrix(getComputedStyle(document.querySelector('.tu-buzz.b')).transform);
  return {row:o.right<q.left&&q.right<bl.left,upright:m.a>0&&m.d>0,
    mirror:getComputedStyle(document.getElementById('tuQflip')).display==='none',
    cardW:Math.round(q.width)};
});
ck(wgeo.row,'26 wide: your dome LEFT, the card CENTER, theirs RIGHT');
ck(wgeo.upright,'27 wide: nothing rotates on a desk (no ends to face)');
ck(wgeo.mirror,'28 wide: nothing mirrors on a desk');
ck(wgeo.cardW>360,'render guard: the wide card is a real column, not a crushed strip','w='+wgeo.cardW);
await wpage.evaluate(()=>{
  const C=window.BK.coach;
  C.cpu.on=true;C.cpu.team=1;C.cpu.level='rookie';
  C.startGame({league:'big3',decade:'ANY',target:11,rosters:C.pickRosters('big3','ANY')},false);
  C.show('game');
});
await wwait(()=>document.getElementById('tipveil').classList.contains('howing'),9000);
await wpage.click('#tipReady',{force:true});
await wwait(()=>{const q=document.getElementById('tipQ');
  return q.textContent.length>2&&!document.getElementById('tzA').classList.contains('lock');},25000);
const wjb=await wpage.evaluate(()=>{
  const a=document.getElementById('tzA').getBoundingClientRect();
  const b2=document.getElementById('tzB').getBoundingClientRect();
  return {youLeft:a.right<b2.left};
});
ck(wjb.youLeft,'29 wide jump ball: YOUR zone takes the left of a CPU game');
await wctx.close();

ck(errs.length===0,'no page errors end to end',errs.join(' | '));
console.log('');
console.log(fails.length?('RED: '+fails.length+' failing'):'GREEN: dome-check clean');
await b.close();
process.exit(fails.length?1:0);

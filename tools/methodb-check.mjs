/* METHOD B (V0 B16) — the possession rework behind the staging flag.
   Serve docs/ on :8899, run from the repo root.

   TWO PROPERTIES, in order of importance:
   1. FLAG OFF = THE SHIPPED GAME, byte for byte. The revert architecture is
      the flag, so the first half of this harness plays the old rules with
      the flag off and asserts nothing changed: one free step only, slide
      after the action, cutter offer on the inbound, coach tips willing.
   2. FLAG ON = AARON'S METHOD. Defense picks first and visibly, offense
      picks seeing it, shapes land on the floor, the beat runs
      setup -> slide -> action, both toggles bite, no ritual on live balls.

   Driven through the REAL surfaces: window.BK.coach.startGame, the real
   inbound(), the real stagebox buttons. No copies of the rules anywhere. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const page=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];
page.on('pageerror',e=>errs.push(String(e).slice(0,160)));

async function boot(flag){
  await page.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await page.evaluate(f=>{
    localStorage.clear();
    localStorage.setItem('bk_coach','0');       /* tips answered separately */
    if(f)localStorage.setItem('bk_methodb','1');
  },flag);
  await page.reload({waitUntil:'networkidle'});
  await sleep(900);
}
/* start a real NBA (15x8) local game without the tip-off theatre */
async function startNba(){
  await page.evaluate(()=>{
    const C=window.BK.coach;
    C.show('game');
    C.startGame({league:'nba',decade:['FULL'],target:11,
      rosters:C.pickRosters('nba',['FULL'])},true);
  });
  await sleep(400);
}
async function settle(){ /* wait out any piece animation */
  for(let i=0;i<40;i++){
    const ph=await page.evaluate(()=>window.BK.state().phase);
    if(ph!=='anim'&&ph!=='anim2')break;
    await sleep(120);
  }
}
const S=()=>page.evaluate(()=>({ph:window.BK.state().phase,
  holder:window.BK.state().ball.holder,off:window.BK.state().offense,
  shuffleUsed:window.BK.state().shuffleUsed,inbPending:window.BK.state().inbPending}));
const stagebtns=()=>page.evaluate(()=>[...document.querySelectorAll('#stagebox button')]
  .map(x=>x.textContent.trim()));

console.log('\n=== FLAG OFF · the shipped game must be untouched ===');
await boot(false);
await startNba();
ck(await page.evaluate(()=>window.BK._mbActive()===false),'flag off · mbActive() is false');
/* dead ball -> classic inbound, no ritual, cutter offered */
await page.evaluate(()=>window.BK._inbound(1,'L','<b>test</b>'));
await settle();
let s=await S();
ck(s.ph==='inbound','flag off · dead ball goes straight to the classic inbound',s.ph);
let btns=await stagebtns();
ck(btns.some(t=>/cutter/i.test(t)),'flag off · the cutter offer still stands',btns.join(' | ')||'none');
/* classic free step: one square, once, and the turn stays live */
const probe=await page.evaluate(()=>{
  const st=window.BK.state();st.phase='off-move';
  let one=null,two=null,idx=-1;
  for(let i=0;i<st.pieces.length&&idx<0;i++){
    const p=st.pieces[i];
    if(p.team!==st.offense||i===st.ball.holder)continue;
    idx=i;one=window.BK._freeStep(i,[p.c+1,p.r]);two=window.BK._freeStep(i,[p.c+2,p.r]);
  }
  st.phase='inbound';
  return {one,two};
});
ck(probe.one===true&&probe.two===false,'flag off · free step is exactly one square',JSON.stringify(probe));
/* slide range: the CLASSIC rule must hold with the flag off — asserted, not
   just printed (the print-only version could not fail; 08-16 review find) */
const clArr=await page.evaluate(()=>window.BK.state().pieces
  .map((p,i)=>({i,pos:p.pos,team:p.team})).filter(p=>p.team===1)
  .map(p=>({pos:p.pos,r:window.BK.defRange(p.i)})));
const clMap={};clArr.forEach(x=>clMap[x.pos]=x.r);
ck(clMap.PG===3&&clMap.C===1&&clMap.SG===1&&clMap.SF===1&&clMap.PF===1,
   'flag off · classic slide ranges hold (deep PG sprints 3, shell slides 1)',
   clArr.map(x=>x.pos+':'+x.r).join(' '));
ck(await page.evaluate(()=>!document.getElementById('mbChip')||
  document.getElementById('mbChip').style.display==='none'),
  'flag off · no prototype chip anywhere');
ck(errs.length===0,'flag off · zero page errors',errs[0]||'');

console.log('\n=== FLAG ON · the ritual and the beat ===');
await boot(true);
await startNba();
ck(await page.evaluate(()=>window.BK._mbActive()===true),'flag on · mbActive() latches for NBA local');
ck(await page.evaluate(()=>{const c=document.getElementById('mbChip');
  return !!c&&c.style.display!=='none'&&/PROTOTYPE/.test(c.textContent)}),
  'flag on · the PROTOTYPE chip is up');
/* the contextual menus, from the real table */
const menus=await page.evaluate(()=>({
  score:window.BK._mbMenus('score'),base:window.BK._mbMenus('baseline'),
  side:window.BK._mbMenus('sideline'),back:window.BK._mbMenus('back')}));
ck(menus.score.off.length===3&&menus.score.def.length===4&&
   menus.score.def.includes('DIAMOND PRESS'),
   'menus · made basket: offense 3, defense 3 + DIAMOND PRESS');
ck(menus.base.off.length===5&&menus.base.off.includes('BOX')&&menus.base.off.includes('4-LOW')
   &&menus.base.def.length===3,'menus · baseline: the three + BOX + 4-LOW, defense 3');
ck(menus.side.off.length===4&&menus.side.off.includes('ZIPPER'),
   'menus · sideline: the three + ZIPPER');
ck(menus.back.off.length===3&&menus.back.def.length===3,
   'menus · backcourt dead ball: universal three only');

/* THE RITUAL: made basket -> defense menu first, visibly. Team 1 attacks
   the LEFT rim, so its own end (where the bucket dropped) is 'R'. */
await page.evaluate(()=>window.BK._inbound(1,'R','<b>bucket</b>'));
await sleep(300);
s=await S();
ck(s.ph==='mb-pick','ritual · dead ball opens the pick phase, not the pass',s.ph);
/* the picker is the CAROUSEL now (Aaron's ruling 08-16 late): cards with
   court diagrams, tap = live preview on the board, RUN IT = commit */
const cards=()=>page.evaluate(()=>[...document.querySelectorAll('#mbCar .mbcard')]
  .map(x=>x.getAttribute('data-mb')));
const defPos=()=>page.evaluate(()=>window.BK.state().pieces
  .filter(p=>p.team===0).map(p=>p.c+','+p.r).join(' '));
const previewSettle=async()=>{ /* previews animate outside phase 'anim' */
  await sleep(700)};
let ks=await cards();
ck(ks.length===4&&ks.includes('DIAMOND PRESS'),
   'ritual · DEFENSE carousel first: 4 cards at a made basket',ks.join(' | '));
ck(await page.evaluate(()=>[...document.querySelectorAll('#mbCar .mbcard')]
   .every(c=>c.querySelectorAll('svg circle').length>=5)),
   'ritual · every card wears its court diagram (5+ dots from the real table)');
const banner1=await page.evaluate(()=>document.getElementById('bannerTxt').textContent);
ck(/calls defense first/i.test(banner1),'ritual · the banner says defense picks first',banner1.slice(0,70));
/* preview: trying MAN moves the defense but commits NOTHING */
const posBefore=await defPos();
await page.click('#mbCar [data-mb="MAN"]');
await previewSettle();
s=await S();
ck(s.ph==='mb-pick','preview · trying a card leaves the pick OPEN',s.ph);
const posMan=await defPos();
ck(posMan!==posBefore,'preview · the board wears the tried shape before any confirm');
/* browsing never drifts: MAN -> 2-3 ZONE -> MAN lands exactly where MAN did */
await page.click('#mbCar [data-mb="2-3 ZONE"]');
await previewSettle();
await page.click('#mbCar [data-mb="MAN"]');
await previewSettle();
ck(await defPos()===posMan,
   'preview · browsing shapes never drifts the team (re-preview = first preview)');
/* defense locks MAN */
await page.click('#mbCar .mbcard.on .mbc-go');
await settle();await sleep(300);
ks=await cards();
ck(ks.length===3&&ks.includes('HORNS'),
   'ritual · then the OFFENSE carousel: the universal three',ks.join(' | '));
const banner2=await page.evaluate(()=>document.getElementById('bannerTxt').textContent);
ck(/shows MAN/i.test(banner2),'ritual · offense picks SEEING the call',banner2.slice(0,70));
/* offense tries HORNS then locks it -> two-part advance shape */
await page.click('#mbCar [data-mb="HORNS"]');
await previewSettle();
await page.click('#mbCar .mbcard.on .mbc-go');
await settle();await sleep(300);await settle();
ck(await page.evaluate(()=>!document.getElementById('mbCar')),
   'ritual · the carousel leaves the screen once both sides lock');
s=await S();
ck(s.ph==='inbound','ritual · shapes land, then the normal inbound arms',s.ph);
const shape=await page.evaluate(()=>{
  const st=window.BK.state();const out={front:0,back:0,mid:Math.floor(15/2)};
  st.pieces.forEach((p,i)=>{
    if(p.team!==st.offense||i===st.ball.holder)return;
    /* offense 1 attacks the LEFT rim (cols < 7 are its frontcourt) */
    if(p.c<7)out.front++;else out.back++;
  });
  return out;
});
ck(shape.front===3&&shape.back===1,
  'ritual · two-part shape: 3 pre-stationed frontcourt, 1 receiver back',
  shape.front+' front / '+shape.back+' back');
btns=await stagebtns();
ck(!btns.some(t=>/cutter/i.test(t)),'ritual · no lone-cutter offer in Method B',btns.join(' | ')||'none');
/* pass it in -> the first beat begins with the FREE SETUP */
await page.evaluate(()=>{
  const st=window.BK.state();
  let best=-1,bd=1e9;const h=st.pieces[st.ball.holder];
  st.pieces.forEach((p,i)=>{if(p.team!==st.offense||i===st.ball.holder)return;
    const d=Math.max(Math.abs(p.c-h.c),Math.abs(p.r-h.r));if(d<bd){bd=d;best=i}});
  st.selected=st.ball.holder;
  window.BK.coach.state().staged={kind:'pass',toIdx:best};
  window.BK._commit();
});
await settle();await sleep(700);await settle();
s=await S();
const mb=await page.evaluate(()=>window.BK._mb());
ck(s.ph==='off-select'&&mb.setup===true,
  'beat · ball in, the free setup opens (not the defense)',s.ph+' setup='+mb.setup);
btns=await stagebtns();
ck(btns.some(t=>/Done setting up/.test(t)),'beat · Done button is up',btns.join(' | '));
/* every off-ball player qualifies for one setup move (toggle off = 1 square) */
const q=await page.evaluate(()=>{
  const st=window.BK.state();st.phase='off-move';
  const out={ok:0,twoSq:0,carrier:null};
  st.pieces.forEach((p,i)=>{
    if(p.team!==st.offense)return;
    if(i===st.ball.holder){st.selected=i;out.carrier=window.BK._freeStep(i,[p.c+1,p.r]);return}
    if(window.BK._freeStep(i,[p.c+1,p.r])||window.BK._freeStep(i,[p.c-1,p.r])
     ||window.BK._freeStep(i,[p.c,p.r+1])||window.BK._freeStep(i,[p.c,p.r-1]))out.ok++;
    if(window.BK._freeStep(i,[p.c+2,p.r]))out.twoSq++;
  });
  st.phase='off-select';st.selected=null;
  return out;
});
ck(q.ok===4&&q.carrier===false,'beat · all 4 off-ball qualify, the carrier never does',JSON.stringify(q));
ck(q.twoSq===0,'beat · toggle OFF: setup move is one square');
/* flip the setup toggle live: full range */
const q2=await page.evaluate(()=>{
  window.BK._mb().t.setupFull=true;
  const st=window.BK.state();st.phase='off-move';
  let two=0;
  st.pieces.forEach((p,i)=>{
    if(p.team!==st.offense||i===st.ball.holder)return;
    if(p.pos!=='C'&&(window.BK._freeStep(i,[p.c+2,p.r])||window.BK._freeStep(i,[p.c-2,p.r])))two++;
  });
  st.phase='off-select';window.BK._mb().t.setupFull=false;
  return two;
});
ck(q2>0,'beat · toggle ON: full-range setup moves qualify',q2+' pieces reach 2 squares');
/* Done -> the slide, BEFORE any action */
await page.click('#aMbDone');
await sleep(200);
s=await S();
ck(s.ph==='def-slide','beat · Done hands the defense its slide, before the action',s.ph);
/* slide range: capped 1-2 with toggle off, full role range with it on */
const ranges=await page.evaluate(()=>{
  const st=window.BK.state();const out={capped:[],full:[]};
  st.pieces.forEach((p,i)=>{if(p.team===st.offense)return;out.capped.push(p.pos+':'+window.BK.defRange(i))});
  window.BK._mb().t.slideFull=true;
  st.pieces.forEach((p,i)=>{if(p.team===st.offense)return;out.full.push(p.pos+':'+window.BK.defRange(i))});
  window.BK._mb().t.slideFull=false;
  return out;
});
ck(ranges.capped.every(x=>+x.split(':')[1]<=2),'beat · slide toggle OFF: capped at 2',ranges.capped.join(' '));
ck(ranges.full.some(x=>x==='PG:3'),'beat · slide toggle ON: full role range (PG 3)',ranges.full.join(' '));
/* stay put -> the MAIN ACTION, and the legacy free step is dead */
await page.click('#aSkip');
await sleep(200);
s=await S();
ck(s.ph==='off-select'&&s.shuffleUsed===true,
  'beat · after the slide comes the main action, no legacy free step',s.ph+' shuffleUsed='+s.shuffleUsed);
const b3=await page.evaluate(()=>document.getElementById('bannerTxt').textContent);
ck(/Main action/i.test(b3),'beat · the banner says so',b3.slice(0,60));
/* B17 · the tray ticks and the carrier menu prices (his rulings, built) */
const tray=await page.evaluate(()=>{
  const t=document.getElementById('mbTray');
  if(!t)return {exists:false};
  return {exists:true,on:(t.querySelector('.mbt-step.on')||{}).textContent||'',
    done:[...t.querySelectorAll('.mbt-step.done')].length};
});
ck(tray.exists&&tray.on==='ACTION'&&tray.done>=3,
  'tray · stands at ACTION with the earlier beats ticked',JSON.stringify(tray));
const menu=await page.evaluate(()=>{
  const st=window.BK.state();
  st.selected=st.ball.holder;
  window.BK._offer();
  const rows=[...document.querySelectorAll('#stagebox .mbm-row')];
  return {n:rows.length,txt:rows.map(r=>r.textContent.trim()).join(' | ')};
});
/* the MOVE row's wording changed with THE ONE DEFENSE (08-18): duel tiles
   wear the colour of the card they deal, so the row says that instead of
   the old flat "red = crossover duel" */
ck(menu.n===3&&/SHOOT/.test(menu.txt)&&/\d open · \d covered/.test(menu.txt)&&/its colour is the card it deals/.test(menu.txt),
  'menu · the carrier sees SHOOT, PASS with honest counts, MOVE with the price-on-the-tile line',menu.txt.slice(0,110));

/* NO RESET ON LIVE BALLS: a defensive board continues play, no ritual. The
   phase is parked on def-slide FIRST, so the assertion can only pass if
   grabBoard itself moved it (the old version pre-set the value it then
   asserted; 08-16 review find). */
const live=await page.evaluate(()=>{
  const st=window.BK.state();
  let d=-1;st.pieces.forEach((p,i)=>{if(p.team!==st.offense&&d<0)d=i});
  window.BK.coach.state().phase='def-slide';
  window.BK._grabBoard(1-st.offense,d);
  return window.BK.state().phase;
});
ck(live==='off-select','live ball · a defensive board continues play, NO ritual',live);

/* the coach stays silent in prototype mode even with tips ON */
await page.evaluate(()=>{localStorage.setItem('bk_coach','1');localStorage.removeItem('bk_coach_seen')});
const tipped=await page.evaluate(()=>{
  window.BKCoach.tip('mbtest','<b>should never render</b>',true);
  const el=document.getElementById('coachTip');
  return !!(el&&el.classList.contains('on'));
});
ck(tipped===false,'silence · BKCoach.tip renders nothing during Method B');
/* ...and the silence ends AT THE GAME SCREEN'S EDGE. MB.game latches per
   game, so without the curScreen check the coach stayed muted on the Daily
   Five (and everywhere) after one Method B game (08-16 coach trace find). */
const dailyVoice=await page.evaluate(()=>{
  window.BK._show('daily');window.BKDaily.open();
  return new Promise(res=>setTimeout(()=>{
    window.BKCoach.tip('mbdailyprobe','<b>probe</b>',true);
    const el=document.getElementById('coachTip');
    res({proto:window.MBPROTO(),
      tipShows:!!(el&&getComputedStyle(el).display!=='none')});
  },700));
});
ck(dailyVoice.proto===false&&dailyVoice.tipShows===true,
  'silence · ends at the game screen: the coach SPEAKS on the daily after an MB game',
  'proto='+dailyVoice.proto+' tip='+dailyVoice.tipShows);
ck(errs.length===0,'flag on · zero page errors',errs[0]||'');

/* HALF COURT: the flag must NOT latch on BIG3 */
await page.evaluate(()=>{
  const C=window.BK.coach;
  C.startGame({league:'big3',decade:['FULL'],target:11,
    rosters:C.pickRosters('big3',['FULL'])},true);
});
await sleep(400);
ck(await page.evaluate(()=>window.BK._mbActive()===false),
  'scope · BIG3 half court never latches the prototype');

await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));
process.exit(fails.length?1:0);

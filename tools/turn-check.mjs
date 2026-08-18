/* TURN CLARITY (V0 B17, Aaron's seven rulings off the 08-18 mock).
   Serve docs/ on :8899, run from the repo root.

   What must be true, in his words where he gave them:
   1. The slam fires on POSSESSION FLIPS only, speaking you/they in a solo
      game and the squad's own name at a shared phone.
   2. While the other side plays: lights down, THE FLOOR STAYS LIT ("the
      player needs to watch the board"), and a quiet strip holds the
      bottom. Buttons there = your turn, that is the whole grammar.
   3. THE OVERLAP LAW ("just make sure the controls never block the
      board"): on BOTH phone heights, no dock state may cover a single
      tile; the dock goes slim before that ever happens. Tile-level,
      via the same projection the game draws with.
   4. The dock opens the turn ON the free moves with a live count, DONE is
      the only door to the action (covered in methodb-check, spot-checked
      here through the real beat).
   5. Duplicate squad names are refused at setup, name AND scoreboard tag,
      with the ruled copy.
   6. A question card owns the whole screen: dock and tray gone while the
      veil is up.
   7. Trash talk: big moments only, 20s spacing, a hard per-game cap, and
      the Settings switch kills it entirely.

   Driven through the real surfaces; the overlap probe uses BK._boardHit,
   which walks every tile through proj() exactly as the renderer does. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});

async function newPage(vw,vh){
  const ctx=await b.newContext({viewport:{width:vw,height:vh},hasTouch:true,isMobile:vw<800});
  const page=await ctx.newPage();
  page.on('pageerror',e=>errs.push(String(e).slice(0,160)));
  await page.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await page.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await page.reload({waitUntil:'networkidle'});
  await sleep(1000);
  return {ctx,page};
}
async function startNba(page,cpu){
  await page.evaluate(c=>{
    const B=window.BK,K=B.coach;
    K.applyColors({nm:'Showtime',ab:'SHO'},{nm:'The Bricks',ab:'BRK'});
    K.startGame({league:'nba',decade:'ANY',target:11,
      colors:[{nm:'Showtime',ab:'SHO'},{nm:'The Bricks',ab:'BRK'}],
      rosters:K.pickRosters('nba','ANY')},true);
    if(c){const C=B._cpu();C.on=true;C.team=1;C.level='pro';C.busy=true;}
    B._show('game');
  },cpu);
  await sleep(1700);   /* start-of-game timers clear selections; let them die */
}
const errs=[];

console.log('\n=== THE SLAM · possession flips only, the right words ===');
let {ctx,page}=await newPage(390,844);
await startNba(page,true);
/* seed: the poll must see the first offense before any flip counts */
await page.evaluate(()=>{const S=window.BK.state();S.offense=0;S.phase='off-select';});
await sleep(800);
await page.evaluate(()=>{g=id=>document.getElementById(id);g('callout').textContent='';});
/* flip to the machine */
await page.evaluate(()=>{window.BK.state().offense=1});
await sleep(700);
let co=await page.evaluate(()=>document.getElementById('callout').textContent);
ck(/THEY’RE UP/.test(co),'slam · flip to the machine says THEY’RE UP',JSON.stringify(co));
/* in-possession churn must NOT slam: setup -> slide -> action, same offense */
await page.evaluate(()=>{document.getElementById('callout').textContent='';
  const S=window.BK.state();S.phase='def-slide';});
await sleep(800);
await page.evaluate(()=>{window.BK.state().phase='off-select'});
await sleep(800);
co=await page.evaluate(()=>document.getElementById('callout').textContent);
ck(!/THEY’RE UP|YOUR TURN/.test(co),'slam · beats inside a possession stay silent',JSON.stringify(co));
/* flip back to the human */
await page.evaluate(()=>{window.BK.state().offense=0});
await sleep(700);
co=await page.evaluate(()=>document.getElementById('callout').textContent);
ck(/YOUR TURN/.test(co),'slam · flip to you says YOUR TURN',JSON.stringify(co));

console.log('\n=== THE WAITING LOOK · lights down, floor lit, strip up ===');
await page.evaluate(()=>{const S=window.BK.state();S.offense=1;S.phase='off-select';
  S.selected=null;S.staged=null;window.BK.coach.state().staged=null;
  document.getElementById('stagebox').classList.remove('on');
  document.getElementById('stagebox').innerHTML='';});
await sleep(900);
const wait1=await page.evaluate(()=>{
  const li=document.getElementById('lights'),sb=document.getElementById('stagebox');
  const cs=getComputedStyle(li);
  const y=window.BK._courtY();
  const wrap=document.getElementById('court-wrap').getBoundingClientRect();
  return {lightsOn:li.classList.contains('on'),op:cs.opacity,
    ct:parseFloat(li.style.getPropertyValue('--ct')),
    cb:parseFloat(li.style.getPropertyValue('--cb')),
    top:y.top,bottom:y.bottom,wrapH:wrap.height,
    strip:(sb.querySelector('.bkstrip')||{textContent:''}).textContent.trim()};
});
ck(wait1.lightsOn&&+wait1.op>0.9,'lights · ON during the machine’s possession','opacity '+wait1.op);
ck(wait1.ct<wait1.top&&wait1.cb>wait1.bottom,
  'lights · the clear band brackets the projected court (floor stays lit)',
  'band '+Math.round(wait1.ct)+'..'+Math.round(wait1.cb)+' court '+Math.round(wait1.top)+'..'+Math.round(wait1.bottom));
ck(/THEY’RE UP/.test(wait1.strip),'strip · quiet THEY’RE UP holds the dock’s place',wait1.strip);
/* your turn: lights up, the strip flips to your colourway and call */
await page.evaluate(()=>{window.BK.state().offense=0});
await sleep(900);
const wait2=await page.evaluate(()=>({
  lightsOn:document.getElementById('lights').classList.contains('on'),
  strip:(document.querySelector('#stagebox .bkstrip')||{textContent:''}).textContent.trim()}));
ck(!wait2.lightsOn,'lights · OFF the moment the ball is yours');
ck(/YOUR TURN/.test(wait2.strip),'strip · your empty moment says YOUR TURN · TAP A PLAYER',wait2.strip);

console.log('\n=== THE CARD OWNS THE SCREEN ===');
const cardHide=await page.evaluate(()=>{
  document.getElementById('qveil').classList.add('on');
  const sb=getComputedStyle(document.getElementById('stagebox')).display;
  const tray=document.getElementById('mbTray');
  const tr=tray?getComputedStyle(tray).display:'none';
  document.getElementById('qveil').classList.remove('on');
  return {sb,tr};
});
ck(cardHide.sb==='none'&&cardHide.tr==='none',
  'card · veil up = dock and tray gone',JSON.stringify(cardHide));

console.log('\n=== TRASH TALK · big moments, spaced, capped, killable ===');
const bark1=await page.evaluate(()=>{
  const B=window.BK,K=B._barkState();
  K.used=0;K.last=0;
  B._bark('cpu_big');
  const el=document.getElementById('barkBub');
  const first=el&&el.classList.contains('on')?el.textContent:'';
  B._bark('iced');            /* 0s later: the 20s gap must eat this one */
  return {first,used:K.used};
});
ck(/./.test(bark1.first)&&bark1.used===1,'bark · a big play speaks once, the follow-up inside 20s is eaten',
  JSON.stringify(bark1.first)+' used='+bark1.used);
const bark2=await page.evaluate(()=>{
  const B=window.BK,K=B._barkState();
  K.used=0;K.last=0;
  let shown=0;
  for(let i=0;i<9;i++){K.last=0;const u=K.used;B._bark('cpu_big');if(K.used>u)shown++;}
  return shown;
});
ck(bark2===6,'bark · the per-game cap holds at 6 even with the clock reset',bark2+' lines');
const bark3=await page.evaluate(()=>{
  localStorage.setItem('bk_talk','0');
  const B=window.BK,K=B._barkState();
  K.used=0;K.last=0;
  const el=document.getElementById('barkBub');
  if(el)el.classList.remove('on');
  B._bark('cpu_big');
  const out={used:K.used,on:!!(el&&el.classList.contains('on'))};
  localStorage.setItem('bk_talk','1');
  return out;
});
ck(bark3.used===0&&!bark3.on,'bark · the Settings switch is a real kill switch',JSON.stringify(bark3));
ck(await page.evaluate(()=>!!document.getElementById('setTalk')),
  'bark · the switch exists in Settings');
await ctx.close();

console.log('\n=== HOT SEAT · the slam speaks the squad name in its colour ===');
({ctx,page}=await newPage(390,844));
await startNba(page,false);
await page.evaluate(()=>{const S=window.BK.state();S.offense=0;S.phase='off-select';});
await sleep(800);
await page.evaluate(()=>{document.getElementById('callout').textContent='';
  window.BK.state().offense=1;});
await sleep(700);
const hs=await page.evaluate(()=>({txt:document.getElementById('callout').textContent,
  col:document.getElementById('callout').style.color}));
ck(/THE BRICKS BALL/.test(hs.txt),'hot seat · the slam names the squad',JSON.stringify(hs.txt));
ck(!!hs.col,'hot seat · and wears a team colour',hs.col);
await ctx.close();

console.log('\n=== THE OVERLAP LAW · no dock state covers a tile, both phone heights + desktop ===');
for(const [vw,vh] of [[390,844],[390,667],[1280,860]]){
  const v=await newPage(vw,vh);
  await startNba(v.page,false);
  /* the dock states a player actually sees, staged through the real
     paints, WITH the lean-in camera (selection zooms the floor) */
  await v.page.evaluate(()=>{const B=window.BK,S=B.state();
    S.offense=0;S.phase='off-select';S.selected=S.ball.holder;B._offer();});
  await sleep(1100);   /* let the camera lean all the way in */
  let hit=await v.page.evaluate(()=>{
    window.BK._dockFit();
    const r=document.getElementById('stagebox').getBoundingClientRect();
    const t=document.getElementById('mbTray');
    const tr=t?t.getBoundingClientRect():null;
    return {dock:window.BK._boardHit(r),
      tray:tr?window.BK._boardHit(tr):false,
      slim:document.getElementById('stagebox').classList.contains('slim')};
  });
  ck(!hit.dock,'law@'+vw+'x'+vh+' · the action menu never covers a tile'+(hit.slim?' (went slim)':''),JSON.stringify(hit));
  ck(!hit.tray,'law@'+vw+'x'+vh+' · the tray never covers a tile');
  /* free-moves dock, through the real setup painter */
  await v.page.evaluate(()=>{const B=window.BK,S=B.state();
    S.selected=null;S.staged=null;B._mb().setup=true;B._mb().moved={};
    S.phase='off-select';B._mbSetupStage();});
  await sleep(700);
  hit=await v.page.evaluate(()=>{
    window.BK._dockFit();
    const sb=document.getElementById('stagebox');
    const r=sb.getBoundingClientRect();
    return {dock:sb.classList.contains('on')?window.BK._boardHit(r):false,
      rows:sb.textContent.slice(0,40)};
  });
  ck(/FREE MOVES/.test(hit.rows)&&!hit.dock,
    'law@'+vw+'x'+vh+' · the free-moves dock never covers a tile',hit.rows);
  await v.ctx.close();
}

console.log('\n=== THE NAME BLOCK · duplicates are refused at setup ===');
({ctx,page}=await newPage(390,844));
await page.evaluate(()=>{
  const card=document.querySelector('.mm-card[data-go="local"]');
  if(card)card.click();else window.BK._show('names');
});
await sleep(1400);
const nb=await page.evaluate(()=>{
  const g=id=>document.getElementById(id);
  const out={};
  g('nmA').value='Showtime';g('nmAb').value='SHO';
  g('nmB').value='showtime';g('nmBb').value='SHW';
  g('nmGo').click();
  out.nameDup=g('nmErr').textContent;
  g('nmB').value='Mad Dogs';g('nmBb').value='SHO';
  g('nmGo').click();
  out.abDup=g('nmErr').textContent;
  g('nmB').value='Mad Dogs';g('nmBb').value='MAD';
  return out;
});
ck(nb.nameDup==='Taken. The other squad got here first.',
  'names · same name (any case) refused with the ruled copy',JSON.stringify(nb.nameDup));
ck(nb.abDup==='Taken. The other squad got here first.',
  'names · same scoreboard tag refused too',JSON.stringify(nb.abDup));
const nb2=await page.evaluate(()=>{
  document.getElementById('nmGo').click();
  return {names:JSON.stringify((window.BK._cfg().names||[]).map(n=>n&&n.nm))};
});
ck(/Showtime.*Mad Dogs/.test(nb2.names),
  'names · two real names sail through to the toss-up',nb2.names);
await ctx.close();

ck(errs.length===0,'zero page errors across every scene',errs[0]||'');
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));
process.exit(fails.length?1:0);

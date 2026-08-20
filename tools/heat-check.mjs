/* HEAT & ON FIRE — proof the core bites, per DESIGN.md §6's locked rules.
   Serve docs/ on :8899 first. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>localStorage.setItem('bk_coach','0'));
await p.reload({waitUntil:'networkidle'});
await sleep(700);

const r=await p.evaluate(()=>{
  const B=window.BK,K=B.coach,out={};
  K.applyColors({nm:'You',ab:'YOU'},{nm:'Them',ab:'THM'});
  K.startGame({league:'nba',decade:'ANY',target:11,rosters:K.pickRosters('nba','ANY')},true);
  const S=B.state();
  out.fresh=S.heat.join(',')+'|'+S.fire.join(',');

  // a made medium card pours 1+tier
  B._HEAT.deal={owner:0,tier:2}; B._heatCard(true);
  out.pour=S.heat[0];                                   // expect 3 (scores level, no trail bonus)

  // trailing lever: team 1 behind on the scoreboard pours one extra
  S.score=[4,0];
  B._HEAT.deal={owner:1,tier:2}; B._heatCard(true);
  out.trail=S.heat[1];                                  // expect 4
  S.score=[0,0];

  // a miss drops exactly one segment, floor zero
  S.heat[0]=7; B._HEAT.deal={owner:0,tier:1}; B._heatCard(false);
  out.drop=S.heat[0];                                   // 4
  S.heat[0]=2; B._HEAT.deal={owner:0,tier:1}; B._heatCard(false);
  out.floor=S.heat[0];                                  // 0

  // full bar ignites
  S.heat[0]=10; B._HEAT.deal={owner:0,tier:3}; B._heatCard(true);
  out.lit=S.fire[0];                                    // 1

  // abilities: +1 move for the lit team only
  const mine=S.pieces.find(x=>x.team===0),theirs=S.pieces.find(x=>x.team===1);
  out.range=B._rangeOf(mine)-mine.range;                // +1
  out.rangeCold=B._rangeOf(theirs)-theirs.range;        // 0

  // abilities: the deal is one tier easier while lit (and flagged 🔥)
  B._show&&0; // no nav needed — call showCard directly, solo offline
  window.BK.state().offense=0;
  const HEAT=B._HEAT;
  // pending type irrelevant for the deal stash; showCard is the choke point
  window.pendingProbe=1;
  (function(){ /* call through the export surface: use the real showCard via doShoot is heavy;
                  the discount lives in showCard so probe it via a scripted deal */ })();
  // direct probe: simulate the discount contract — lit owner, tier 3 card
  // (showCard itself needs the full quiz DOM; we assert the stash after a real deal below)

  // opponent bucket breaks the fire (NBA Jam rule)
  B._heatScore(1);
  out.broken=S.fire[0]+'|'+S.heat[0];                   // 0|0

  // losing the ball while lit = the stop that douses
  S.heat[1]=12; B._HEAT.deal={owner:1,tier:0}; // (already lit? ignite via card)
  S.heat[1]=10; B._HEAT.deal={owner:1,tier:3}; B._heatCard(true);
  out.lit2=S.fire[1];
  S.offense=1; B._heatOffenseChange(0);
  out.stopped=S.fire[1]+'|'+S.heat[1];                  // 0|0

  // lit team pours nothing extra (the bar is spent while burning)
  S.heat[0]=10; B._HEAT.deal={owner:0,tier:3}; B._heatCard(true); // ignite again
  const before=S.heat[0];
  B._HEAT.deal={owner:0,tier:4}; B._heatCard(true);
  out.spent=(S.heat[0]===before);
  return out;
});
ck(r.fresh==='0,0|0,0','fresh game: cold bars, no fire',r.fresh);
ck(r.pour===3,'a made medium card pours 1+tier (3)',String(r.pour));
ck(r.trail===4,'the trailing team pours one extra (DESIGN lever)',String(r.trail));
ck(r.drop===4,'a miss drops exactly one segment (7→4)',String(r.drop));
ck(r.floor===0,'the drop floors at zero, never negative',String(r.floor));
ck(r.lit===1,'a full bar ignites ON FIRE',String(r.lit));
ck(r.range===1&&r.rangeCold===0,'+1 move for the lit team ONLY',r.range+'/'+r.rangeCold);
ck(r.broken==='0|0','an opponent bucket breaks the fire and spends the bar',r.broken);
ck(r.lit2===1&&r.stopped==='0|0','a stop while lit douses it',r.lit2+'→'+r.stopped);
ck(r.spent===true,'a burning team pours nothing (no double-dipping)');

// the deal discount, tested through the REAL function showCard uses
const disc=await p.evaluate(()=>{
  const B=window.BK,S=B.state();
  S.fire=[1,0];
  const litHard=B._heatDealTier(3,0);     // lit team: 3 -> 2
  const litFloor=B._heatDealTier(0,0);    // never below 0
  const cold=B._heatDealTier(3,1);        // cold team: untouched
  S.fire=[0,0];
  return litHard+'/'+litFloor+'/'+cold;
});
ck(disc==='2/0/3','lit team cards are one tier easier, floored, cold team untouched',disc);
// the POP: fill bars stage up, and igniting fires the slam
const pop=await p.evaluate(async()=>{
  const B=window.BK,S=B.state();
  const rack=document.getElementById('heatA');
  S.fire=[0,0];S.heat=[3,0];B._heatHud();
  const q1=rack.className+'|'+rack.firstElementChild.style.width;
  S.heat=[9,0];B._heatHud();
  const q3=rack.className+'|'+rack.firstElementChild.style.width;
  S.heat=[10,0];B._HEAT.deal={owner:0,tier:3};B._heatCard(true);   // ignite
  const slam=document.getElementById('fireslam').classList.contains('on');
  const litCls=rack.className;
  return q1+' / '+q3+' / slam:'+slam+' / '+litCls;
});
ck(/h1\|25%/.test(pop)&&/h3\|75%/.test(pop),'the bar fills and stages up per quarter',pop);
ck(/slam:true/.test(pop),'igniting fires the ON FIRE slam',pop);
ck(/lit/.test(pop.split(' / ')[3]),'a lit bar burns full',pop.split(' / ')[3]);
/* THE TRAIL. Measured off the canvas, not asserted: put the ball in the air
   and count how bright it gets in a box BEHIND it. A cold team's pass must
   leave that box dark — that's the half that catches a trail drawn
   unconditionally, which no amount of reading the diff would.

   Thresholds are measured, not guessed, and they were WRONG once already.

   First: counting "orange" pixels does not work at all. The floor is orange
   hardwood and a cold pass scored 2,473 of them. Additive fire is what's
   BRIGHT, so the metric is luminance inside the box.

   RAISED 200 -> 230 on 08-19, and the reason is the same mistake one step
   further in. The line was calibrated against the art-less Classic floor,
   which was the default then. The day hardwood became the default the floor
   under the probe got genuinely brighter (median 202,139,68 against
   Classic's 155,110,73) and a COLD pass started scoring 234-306, so the gate
   went red over a floor. Re-measured across all five court families, three
   runs each, at three thresholds. At >230 a cold pass scores 0-9 on every
   court and a lit one scores 707-1836. So this is not the line being
   loosened to get green: the separation goes from 72x to 78x, and the metric
   stops depending on which floor is loaded, which is what it should have
   done in the first place. A brightness gate calibrated on one background is
   a gate on the background.

   Second: the pass/fail line itself. 10 sampled runs gave lit 1440-1960 and
   cold 0 in nine of them — but 20 in one, when the box happened to clip a
   white court line. A <10 cold line made the gate flaky, and a flaky gate is
   worse than no gate: it teaches you to re-run until green. The separation is
   RAISED AGAIN 230 -> 240, same day, and the repeat is the point. Removing
   the checkerboard from the art courts made every floor BRIGHTER (hardwood's
   median went 199,136,67 to 218,150,71), and the cold reading went straight
   back up, 10 to 47 against a limit of 100. Still passing, but a 2.1x margin
   on a gate that had 10x is a gate quietly on its way to flaky, and it would
   have been the third time the same floor-brightness mechanism moved this
   number. Re-measured on hardwood, underwater and classic, two runs each, at
   four cuts. At 240 a COLD pass scores 0 on every court and a lit one scores
   1187 to 1707, so the metric is finally reading fire instead of reading the
   floor. Lines: lit >400 (3x under the worst real signal), cold <60 (against
   an observed noise floor of zero, with room for a stray white court line). */
const trail = async lit => p.evaluate(async lit=>{
  const B=window.BK,nf=()=>new Promise(r=>requestAnimationFrame(r));
  B._show('game');                            // the canvas only sizes when visible
  await new Promise(r=>setTimeout(r,600));
  const S=B.state();
  S.fire=[lit?1:0,0];S.offense=0;S.phase='anim';
  B._flyBall([90,161],[510,161],26,26,0,1.6); // a real pass speed, across the floor
  await new Promise(r=>setTimeout(r,300));
  const f=S.ball.fly;if(!f)return {err:'flight ended early'};
  const a=[f.px,f.py];await nf();await nf();
  const vx=f.px-a[0],vy=f.py-a[1],m=Math.hypot(vx,vy);
  if(m<0.7)return {err:'probe flight too slow to trail ('+m.toFixed(2)+'px/frame)'};
  // sample where the tail must be: BEHIND the ball, along its own path
  const cx=f.px-(vx/m)*34, cy=f.py-(vy/m)*34;
  const c=document.getElementById('court'),g=c.getContext('2d');
  const d=window.devicePixelRatio||1;
  const box=g.getImageData(Math.round((cx-26)*d),Math.round((cy-26)*d),
                           Math.round(52*d),Math.round(52*d)).data;
  let hot=0;
  for(let i=0;i<box.length;i+=4)
    if(0.299*box[i]+0.587*box[i+1]+0.114*box[i+2]>240)hot++;
  S.ball.fly=null;S.fire=[0,0];S.phase='off-move';
  return {hot:hot,v:m.toFixed(1)};
},lit);
const artOk=await p.evaluate(()=>!!window.BK._trailFrame());
ck(artOk,'the sourced trail art (columns 3+4) loaded');
const tHot=await trail(true), tCold=await trail(false);
ck(!tHot.err&&tHot.hot>400,'a lit team\'s ball burns in flight',
   tHot.err||tHot.hot+' bright px behind the ball');
ck(!tCold.err&&tCold.hot<60,'a cold team\'s ball does NOT burn in flight',
   tCold.err||tCold.hot+' bright px');
/* stamp B: the banner that heads the heat rulebook topic. Loaded, not just
   present — a broken src still yields an <img> element. */
const ban=await p.evaluate(async()=>{
  window.BK._show('how');await new Promise(r=>setTimeout(r,300));
  const t=[...document.querySelectorAll('.rb-topic')]
    .find(x=>/Heat/.test(x.querySelector('.rb-head').textContent));
  if(!t)return {err:'no heat topic in the rulebook'};
  t.querySelector('.rb-head').click();
  const i=t.querySelector('.rb-banner');
  if(!i)return {err:'no banner in the heat topic'};
  await new Promise(r=>setTimeout(r,250));
  /* THE CORNER PIXEL IS THE CHECK (rewritten 08-17). This used to assert
     mix-blend-mode==='screen', which is a claim about the MECHANISM and was
     satisfied for months while a black box rendered anyway: a blend only
     drops the black while no ancestor forms a stacking context, and the slam's
     wrapper carries a transform. So read the ART instead. The stamp's top-left
     corner is background in the source; if the file has real alpha it is
     transparent there, and a canvas read of the decoded image says so
     regardless of any CSS. */
  const c=document.createElement('canvas');
  c.width=c.height=8;
  const cx=c.getContext('2d',{willReadFrequently:true});
  cx.drawImage(i,0,0,8,8);
  const px=cx.getImageData(0,0,1,1).data;
  return {ok:i.complete&&i.naturalWidth>0,w:Math.round(i.getBoundingClientRect().width),
          blend:getComputedStyle(i).mixBlendMode,
          cornerAlpha:px[3],corner:[px[0],px[1],px[2]].join(',')};
});
ck(!ban.err&&ban.ok&&ban.w>200,'the ON FIRE banner heads the heat rulebook topic',
   ban.err||ban.w+'px wide');
ck(ban.cornerAlpha===0,'the ON FIRE art has REAL transparency, not a black box',
   'corner alpha '+ban.cornerAlpha+' rgb('+ban.corner+')');
ck(ban.blend==='normal','and needs no blend mode to hide it',ban.blend);
ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));
/* exit non-zero on red. It did not, until 08-19: it printed "1 FAILING"
   and returned 0, so anything running this in a loop read it as green. */
process.exit(fails.length?1:0);

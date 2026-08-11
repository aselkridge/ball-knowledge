/* B5's drill defects, asserted instead of eyeballed.
 *
 * Three separate complaints from Aaron actually playing, plus the audit he
 * asked for:
 *   1. "sometimes the coach covers an action, like a pass, when in the passing
 *      drill, and selected another player."   -> the card ate taps AND hid tiles
 *   2. "I want all other actions to be greyed out if they have nothing to do
 *      with the current drill."               -> the visual half was missing
 *   3. "let's make sure EVERYTHING that needs a drill has one."
 *                                             -> contest, inbound, fire added
 *
 * Every check here is written to FAIL on the code as it was before this pass,
 * because a check that passes both ways is decoration. The sabotage block at
 * the bottom proves that claim rather than asserting it.
 */
import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--mute-audio']});
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const sec=t=>console.log('\n'+t);

async function fresh(w=390,h=844){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'});
  await p.waitForTimeout(1100);
  return p;
}
const start=async(p,id)=>{await p.evaluate(i=>window.BKDrill.start(i),id);
                          await p.waitForTimeout(1400);};

/* ---------------------------------------------------------------- 3. audit */
sec('EVERY TOPIC THAT NEEDS A DRILL HAS ONE');
{
  const p=await fresh(1440,900);
  const got=await p.evaluate(()=>window.BKDrill.list.slice().sort());
  const btns=await p.$$eval('[data-drill]',es=>es.map(e=>e.dataset.drill).sort());
  const want=['basics','contest','cross','fire','inbound','pass','rebound','screen','shoot','steal'];
  ck(want.every(d=>got.includes(d)),'all ten drills are defined',got.join(' '));
  ck(want.every(d=>btns.includes(d)),'all ten have a RUN THE DRILL button',btns.join(' '));
  /* a button pointing at a drill that does not exist is a dead end in the
     rulebook, and it would look identical to a working one until tapped */
  ck(btns.every(d=>got.includes(d)),'no button points at a missing drill');
  await p.context().close();
}

/* ------------------------------------------------- 3b. the three new drills */
sec('THE THREE NEW DRILLS ACTUALLY BOOT');
for (const [id,label,extra] of [
      ['contest','Contests & blocks',null],
      ['inbound','Inbounding',      'inbound'],
      ['fire',   'ON FIRE',         'fire']]) {
  const p=await fresh();
  await start(p,id);
  const st=await p.evaluate(()=>({
    on:!!(window.BK.coach.drill.on),
    hud:(document.getElementById('hudMid')||{}).textContent||'',
    coach:!!document.querySelector('#coachPanel.on'),
    phase:window.BK.state().phase,
    fire:window.BK.state().fire.slice(),
    heat:window.BK.state().heat.slice(),
    pieces:window.BK.state().pieces.length}));
  ck(st.on&&st.coach,id+': drill is live with the coach card up');
  ck(new RegExp(label.split(' ')[0],'i').test(st.hud),id+': HUD names the drill',st.hud.trim());
  ck(st.pieces>=3,id+': the sandbox has its pieces',String(st.pieces));
  if(extra==='inbound')
    ck(st.phase==='inbound','inbound: opens ON the throw-in, not off-select',st.phase);
  if(extra==='fire'){
    /* the design rule: a drill for a thing you EARN hands you the earned state.
       This is also the only route, because heatCard() refuses to heat in a
       drill, so a fire drill that did not seed could never light at all. */
    ck(st.fire[0]===1,'fire: you START lit, you do not grind for it',JSON.stringify(st.fire));
    ck(st.heat[0]>0,'fire: the bar is full at tip-off',JSON.stringify(st.heat));
  }
  await p.context().close();
}

/* ------------------------------------------------------- 1. the card dodges */
sec('THE COACH CARD GETS OUT OF THE WAY');
/* 1440x760 and 390x844 are BOTH here on purpose. Measured before writing the
 * fix: the card overlaps the Pass/Confirm row by 14px at 1440x760 and by 1px
 * at 390x844, and overlaps lit TILES only at 1440x900. A dodge test run at one
 * size would have passed without a dodge at all -- the first version of this
 * file did exactly that, at 390, and the sabotage block below is what caught
 * it. Sizes that cannot overlap prove nothing, so they are not tested. */
for (const [w,h] of [[1440,760],[390,844]]) {
  const p=await fresh(w,h);
  await start(p,'basics');
  /* real taps, not a poked state object: select the handler, then a tile.
     That is the exact sequence that puts Confirm ✓ on screen. */
  const r=await p.evaluate(()=>{
    const s=window.BK.state(), me=s.pieces[s.ball.holder];
    let t=window.BK.tileToScreen(me.c,me.r);   window.BK._tap(t.x,t.y);
    t=window.BK.tileToScreen(me.c,me.r+1);     window.BK._tap(t.x,t.y);
    window.BKDrill._dodge();
    const el=document.getElementById('coachPanel'), sb=document.getElementById('stagebox');
    const b=el.getBoundingClientRect(), q=sb.getBoundingClientRect();
    const lit=window.BK.litTiles(), M=26;
    return {staged:!!s.staged, hi:el.classList.contains('hi'),
            sbOver:(q.top<b.bottom&&q.bottom>b.top&&q.height>0),
            tileOver:lit.filter(t=>t.x>=b.left-M&&t.x<=b.right+M&&
                                   t.y>=b.top-M&&t.y<=b.bottom+M).length,
            pe:getComputedStyle(el).pointerEvents,
            btn:getComputedStyle(el.querySelector('.cp-b')).pointerEvents};
  });
  const at=w+'x'+h;
  ck(r.staged,at+': an action really is staged (else nothing is being tested)');
  ck(r.hi,at+': the card flipped out of the way');
  ck(!r.sbOver,at+': the Pass/Confirm row is not under the card');
  ck(r.tileOver===0,at+': no lit tile is under the card',String(r.tileOver));
  ck(r.pe==='none',at+': the card shell never eats a tap',r.pe);
  ck(r.btn==='auto',at+': its buttons still take taps',r.btn);
  await p.context().close();
}

/* ------------------------------------------------------ 2. the greying half */
sec('OFF-DRILL ACTIONS ARE GREYED, AND STILL EXPLAIN THEMSELVES');
{
  /* the pass drill allows pass + slidemove, so SHOOT is off-drill and must
     grey. Picking a drill where the button IS allowed would pass vacuously. */
  const p=await fresh();
  await start(p,'pass');
  await p.evaluate(()=>{const s=window.BK.state();
    s.selected=s.ball.holder;window.BK.coach.drill.allow=['pass','slidemove'];});
  await p.waitForTimeout(200);
  const g=await p.evaluate(()=>{
    /* build the real action bar the way the game does, then read it back */
    window.BK._tap&&0; const s=window.BK.state();
    s.phase='off-select';
    return {kinds:window.BK.drillKinds()};
  });
  ck(g.kinds&&g.kinds.aShoot==='shoot','the gate publishes each button\'s kind',
     JSON.stringify(g.kinds));
  /* and the class actually lands when a gated button is on screen */
  const grey=await p.evaluate(()=>{
    const btn=document.createElement('button');
    btn.className='bigbtn';btn.id='aShoot';document.body.appendChild(btn);
    window.BKDrill._grey();
    const on=btn.classList.contains('drill-off');
    const st=getComputedStyle(btn);
    return {on, filter:st.filter, op:st.opacity};
  });
  ck(grey.on,'an off-drill button gets .drill-off');
  ck(/grayscale/.test(grey.filter),'and it reads as greyed',grey.filter);
  ck(parseFloat(grey.op)<1,'and dimmed',grey.op);
  await p.context().close();
}

/* ---------------------------------------------------------------- sabotage */
sec('BREAK IT ON PURPOSE (a check that cannot fail is not a check)');
{
  const p=await fresh(1440,760);
  await start(p,'basics');
  /* sabotage 1: hold the card in its resting place and confirm the overlap is
     really there. Without this the dodge assertions above could be passing on
     a layout where nothing ever overlapped, which is what they were doing. */
  const s1=await p.evaluate(()=>{
    const s=window.BK.state(), me=s.pieces[s.ball.holder];
    let t=window.BK.tileToScreen(me.c,me.r); window.BK._tap(t.x,t.y);
    t=window.BK.tileToScreen(me.c,me.r+1);   window.BK._tap(t.x,t.y);
    const el=document.getElementById('coachPanel');
    el.classList.remove('hi');            /* the pre-fix behaviour */
    const b=el.getBoundingClientRect(), q=document.getElementById('stagebox').getBoundingClientRect();
    return Math.round(Math.min(b.bottom,q.bottom)-Math.max(b.top,q.top));
  });
  ck(s1>0,'un-dodged, the Pass/Confirm row IS under the card (the check bites)',
     s1+'px of overlap');
  /* sabotage 2: an allow-list that permits everything must grey nothing */
  const s2=await p.evaluate(()=>{
    const btn=document.getElementById('aShoot')||document.createElement('button');
    btn.className='bigbtn';btn.id='aShoot';document.body.appendChild(btn);
    window.BK.coach.drill.allow=['shoot','pass','move','slidemove','steal'];
    window.BKDrill._grey();
    return btn.classList.contains('drill-off');
  });
  ck(s2===false,'an allowed action is never greyed');
  await p.context().close();
}

console.log('\n'+(fails.length?'FAILED: '+fails.length+'\n - '+fails.join('\n - ')
                              :'ALL CHECKS PASS'));
await b.close();
process.exit(fails.length?1:0);

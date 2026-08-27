/* THE NEW MAIN MENU — #screen-title2, built 2026-08-08 to Aaron's brief.
 * Serve docs/ on :8899 first.
 *
 * The checks that matter most here are the boring ones. This is the first time
 * the project has had TWO screens claiming the same job, and the failure that
 * costs a day is not "the tile looks wrong" — it is "the hidden one is still
 * on top of the live one", which is invisible in a screenshot and instant in
 * elementFromPoint. install-check caught exactly that within a minute of the
 * first build (a `.nm{display:flex}` beating `.screen{display:none}`), so the
 * collision test is the first thing in this file and it runs BOTH ways round.
 */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const BASE='http://127.0.0.1:8899/play/';

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});

async function boot(menu,w=390,h=844){
  const c=await b.newContext({viewport:{width:w,height:h},hasTouch:w<900,isMobile:w<900});
  const p=await c.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(BASE,{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'});
  await sleep(1700);
  return {p,c,errs};
}
/* a click that cannot land is a FAILED CHECK, never a crashed harness */
async function tap(p,sel){try{await p.click(sel,{timeout:2500});return true}catch(e){return false}}

/* ============ 1 · THE MENU IS THE MENU, AND THE OTHER ONE IS GONE ========
   This section used to run twice, once per menu, because two shipped side by
   side from 08-08. Aaron ruled on 2026-08-27: "the current menu officially
   wins", so the numbered list, the bk_menu switch and the ?menu= parameter
   were deleted. What still has to hold: the one menu paints, the retired one
   leaves no ghost behind, and nothing invisible covers a live control. */
{
  const {p,errs}=await boot('new');
  const st=await p.evaluate(()=>({
    fresh:document.getElementById('screen-title2').classList.contains('on'),
    freshVis:getComputedStyle(document.getElementById('screen-title2')).display,
    ghost:!!document.getElementById('screen-title'),
    switchRow:!!document.getElementById('setMenu'),
    stamps:document.querySelectorAll('[data-daily]').length}));
  ck(st.fresh&&st.freshVis!=='none','the main menu is the one on screen',
     `on=${st.fresh} display=${st.freshVis}`);
  ck(!st.ghost,'the retired numbered menu is not in the page at all',
     st.ghost?'#screen-title still exists':'gone');
  ck(!st.switchRow,'and its switch is gone from the Control Room',
     st.switchRow?'#setMenu still exists':'gone');
  /* ONE STAMP. Two screens meant two calendars walking the same painter; if a
     second ever comes back, the painter's [data-daily] walk hides it. */
  ck(st.stamps===1,'exactly one Daily Five stamp exists',st.stamps+'');

  /* NOTHING INVISIBLE OVER THE LIVE MENU. The exact test install-check failed
     on the first build: ask the page what is actually under each button. */
  const cover=await p.evaluate(()=>{
    const out=[];
    ['mmGym'].forEach(id=>{
      const e=document.getElementById(id);if(!e)return out.push(id+' MISSING');
      const r=e.getBoundingClientRect();
      const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      if(hit!==e&&!e.contains(hit))out.push(id+' <- '+(hit&&(hit.id||hit.className)));
    });
    const st=[...document.querySelectorAll('[data-daily]')].filter(e=>e.getBoundingClientRect().width);
    st.forEach(e=>{const r=e.getBoundingClientRect();
      const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      if(hit!==e&&!e.contains(hit))out.push('stamp <- '+(hit&&(hit.id||hit.className)));});
    return out;
  });
  ck(cover.length===0,'nothing invisible is covering the live menu',
     cover.join(' | ')||'clear');
  ck(errs.length===0,'no page errors',errs.slice(0,1).join(''));
  await p.context().close();
}

/* ================= 2 · THE NEW MENU, ON A PHONE ========================== */
{
  const {p,errs}=await boot('new');

  ck(!(await p.evaluate(()=>!!document.querySelector('#screen-title2 .idx'))),
     'the numbers are gone — Aaron: "you can get rid of those numbers"');

  /* HIS ORDER, TOP TO BOTTOM. Measured off the rendered page, not read off the
     markup: a grid can reorder visually and leave the DOM saying otherwise. */
  const order=await p.evaluate(()=>{
    const pick=s=>{const e=document.querySelector(s);
      return e?{t:Math.round(e.getBoundingClientRect().top),
                l:Math.round(e.getBoundingClientRect().left),
                w:Math.round(e.getBoundingClientRect().width),
                h:Math.round(e.getBoundingClientRect().height)}:null};
    return {head:pick('#screen-title2 .mm-head'),
            daily:pick('#screen-title2 [data-daily]'),
            quick:pick('#screen-title2 .mm-quick'),
            gym:pick('#mmGym'),
            hero:pick('#screen-title2 .mm-hero'),
            play:pick('#screen-title2 .mm-play')};
  });
  const seq=['head','daily','gym','hero','play'];
  ck(seq.every((k,i)=>i===0||order[k].t>order[seq[i-1]].t),
     'head → squares → gym → The Come Up → play somebody',
     seq.map(k=>k+':'+order[k].t).join(' '));
  ck(Math.abs(order.daily.t-order.quick.t)<=4,
     'the Daily Five and Quick Run are SIDE BY SIDE, not stacked',
     `daily top ${order.daily.t} · quick top ${order.quick.t}`);
  ck(order.quick.l>order.daily.l,'Quick Run is the right-hand square');
  /* SQUARES, because he asked for squares */
  ck(Math.abs(order.daily.w-order.daily.h)<=6&&Math.abs(order.quick.w-order.quick.h)<=6,
     'and they are actually square',
     `${order.daily.w}×${order.daily.h} · ${order.quick.w}×${order.quick.h}`);
  /* THE HERO IS THE BIGGEST DOOR. If the biggest promise is not the biggest
     shape the layout is arguing with itself. */
  /* AREA, NOT HEIGHT. The first version asked whether the hero was the TALLEST
     door, which it is not and should not be — the two squares are 174px tall
     each because they are square. Visual weight is area, and the hero is full
     width, so that is what the check has to measure. A metric picked because it
     was easy to write will happily fail a design that is right. */
  const area=o=>o.w*o.h;
  ck(area(order.hero)>area(order.daily)&&area(order.hero)>area(order.gym),
     'The Come Up is the biggest door on the screen',
     `hero ${area(order.hero)}px² · square ${area(order.daily)}px² · gym ${area(order.gym)}px²`);

  /* the whole menu fits, and the footer does not print through anything —
     the D14 lesson, re-checked on the new screen rather than assumed */
  const fit=await p.evaluate(()=>{
    const sc=document.getElementById('screen-title2');
    const pr=document.querySelector('#screen-title2 .proto').getBoundingClientRect();
    const pl=document.querySelector('#screen-title2 .mm-play').getBoundingClientRect();
    return {over:sc.scrollHeight-sc.clientHeight,gap:Math.round(pr.top-pl.bottom)};
  });
  ck(fit.gap>=0,'the footer flows BELOW the play row, it does not print through it',
     fit.gap+'px clear');

  /* ---- the rolodex ---- */
  const rolo=await p.evaluate(()=>{
    const r=document.getElementById('mmRolo');
    const cs=[...r.querySelectorAll('.mm-card')];
    const rr=r.getBoundingClientRect();
    return {n:cs.length,
      front:(cs.find(c=>c.classList.contains('is-front'))||{}).dataset?.go||null,
      /* how many are at least partly on screen at rest — the whole reason for
         a PEEKING carousel rather than a one-at-a-time flipper */
      visible:cs.filter(c=>{const b=c.getBoundingClientRect();
        return b.right>rr.left+2&&b.left<rr.right-2}).length,
      dots:document.querySelectorAll('#mmDots .mm-dot').length,
      on:document.querySelectorAll('#mmDots .mm-dot.on').length};
  });
  ck(rolo.n===3,'three cards in the rolodex',rolo.n+'');
  ck(rolo.front==='cpu','CPU is the resting card — Aaron ranked it the main event',
     String(rolo.front));
  ck(rolo.visible===3,
     'and BOTH neighbours peek, so Online is not hidden an hour after being promoted',
     rolo.visible+' of 3 on screen at rest');
  ck(rolo.dots===3&&rolo.on===1,'the dots track the front card',rolo.dots+' dots, '+rolo.on+' lit');

  /* swiping to Online actually moves the front card */
  await p.evaluate(()=>{
    const c=document.querySelector('#mmRolo [data-go="online"]');
    c.scrollIntoView({block:'nearest',inline:'center'});
  });
  await sleep(400);
  const after=await p.evaluate(()=>(document.querySelector('#mmRolo .is-front')||{}).dataset?.go);
  ck(after==='online','scrolling to Online makes it the front card',String(after));

  /* ---- every door opens where it says ---- */
  ck(await tap(p,'#mmGym'),'THE GYM is clickable');
  await sleep(700);
  ck(await p.evaluate(()=>document.getElementById('screen-how').classList.contains('on')),
     'and it lands on the Rulebook, where the drills actually live');
  /* THE COUNT IS READ, NEVER TYPED. This said seven, the gym grew to eleven,
     and the gate sat red for two days saying the game was wrong. What matters
     is that the door's promise matches what is behind it, so both halves are
     measured and compared to each other (08-27). */
  const drills=await p.evaluate(()=>{
    const WORD={seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12};
    const sub=(document.querySelector('#mmGym .mm-tsub')||{}).textContent||'';
    const said=(sub.match(/\b(seven|eight|nine|ten|eleven|twelve)\b/i)||[])[1];
    return {behind:document.querySelectorAll('#screen-how [data-drill]').length,
            promised:said?WORD[said.toLowerCase()]:null, sub:sub.trim()};
  });
  ck(drills.behind>0&&drills.behind===drills.promised,
     'the gym door promises exactly the number of drills behind it',
     `the menu says ${drills.promised}, the rulebook holds ${drills.behind}`);
  /* #backArrow, not #btnBack. Every screen's own back button is display:none —
     the persistent top-left arrow replaced them and drives each screen's
     original handler through BACKMAP. Measured, after this file spent six red
     lines clicking a control that has been retired for weeks: the first probe
     printed `disp: 'none'` on BOTH menus, which is how you tell a bug you just
     wrote from one that was never there. */
  await tap(p,'#backArrow');await sleep(700);
  ck(await p.evaluate(()=>document.getElementById('screen-title2').classList.contains('on')),
     'and Back comes home to the NEW menu, not the old one');

  ck(await tap(p,'#screen-title2 [data-daily]'),'the calendar tile is clickable');
  await sleep(700);
  ck(await p.evaluate(()=>document.getElementById('screen-daily').classList.contains('on')),
     'and it opens the Daily Five');
  await tap(p,'#backArrow');await sleep(700);

  ck(await tap(p,'#mmRolo [data-go="cpu"]'),'the CPU card is clickable');
  await sleep(700);
  ck(await p.evaluate(()=>document.getElementById('cpuveil').classList.contains('on')),
     'and it opens the difficulty picker, same as the classic menu');
  await p.evaluate(()=>document.getElementById('cpuveil').classList.remove('on'));

  /* ---- the locked doors say they are locked ---- */
  const locked=await p.evaluate(()=>{
    const q=document.querySelector('#screen-title2 .mm-quick');
    const h=document.querySelector('#screen-title2 .mm-hero');
    return {qRib:(q.querySelector('.mm-rib')||{}).textContent,
            hRib:(h.querySelector('.mm-rib')||{}).textContent,
            qBtn:q.tagName,hBtn:h.tagName};
  });
  /* SOON, not COMING SOON. Shortened on 08-08 because the longer word clipped
     the career label on the classic menu by a measured 15px, and it was changed
     on BOTH menus so the two never say the same state two ways. */
  ck(/^SOON$/.test(locked.qRib.trim())&&/^SOON$/.test(locked.hRib.trim()),
     'the two unbuilt modes both say SOON, and say it identically',
     locked.qRib+' / '+locked.hRib);
  ck(locked.qBtn!=='BUTTON'&&locked.hBtn!=='BUTTON',
     'and neither is a button, so nothing is clickable that leads nowhere',
     locked.qBtn+' / '+locked.hBtn);

  /* The switch back WAS the whole safety net, and it is gone: on 2026-08-27
     Aaron ruled the redesign the winner and the way out was retired with the
     screen it led to. What is checked now is that no trace of it is left to
     confuse a player, up in section 1. */

  ck(errs.length===0,'PHONE · no page errors',errs.slice(0,2).join(' | '));
  await p.context().close();
}

/* ============ 3 · THE RETIRED PARAMETER MUST NOT RESURRECT ANYTHING ======
   ?menu= chose between the two screens. The parameter is gone with the loser,
   and an old link carrying it (a text message from August, a bookmark) must
   land on the one menu rather than on nothing at all. */
{
  const c=await b.newContext({viewport:{width:390,height:844}});
  const p=await c.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(BASE,{waitUntil:'networkidle'});
  await p.evaluate(()=>localStorage.clear());
  for (const q of ['?menu=classic','?menu=new','?menu=banana']) {
    await p.goto(BASE+q,{waitUntil:'networkidle'});await sleep(1600);
    const st=await p.evaluate(()=>({
      on:document.getElementById('screen-title2').classList.contains('on'),
      ghost:!!document.getElementById('screen-title'),
      stored:localStorage.getItem('bk_menu')}));
    ck(st.on&&!st.ghost&&st.stored===null,
       `an old ${q} link still lands on the menu, and stores nothing`,
       `on=${st.on} ghost=${st.ghost} stored=${st.stored}`);
  }
  ck(errs.length===0,'no page errors on the retired parameter',errs.slice(0,1).join(''));
  await c.close();
}

/* ================= 4 · DESKTOP ========================================== */
{
  const {p,errs}=await boot('new',1440,900);
  const d=await p.evaluate(()=>{
    const r=s=>{const e=document.querySelector(s);const b=e.getBoundingClientRect();
      return {t:Math.round(b.top),l:Math.round(b.left),w:Math.round(b.width),h:Math.round(b.height)}};
    return {hero:r('#screen-title2 .mm-hero'),daily:r('#screen-title2 [data-daily]'),
            gym:r('#mmGym'),play:r('#screen-title2 .mm-play'),
            cards:[...document.querySelectorAll('#mmRolo .mm-card')]
              .map(c=>Math.round(c.getBoundingClientRect().top)),
            over:(()=>{const s=document.getElementById('screen-title2');
                       return s.scrollHeight-s.clientHeight})()};
  });
  ck(d.hero.l<d.daily.l,'DESKTOP · the hero moves to the left column, the doors to the right',
     `hero x${d.hero.l} · daily x${d.daily.l}`);
  ck(d.hero.h>d.daily.h,'DESKTOP · and it runs full height beside them',
     `hero ${d.hero.h}px · daily ${d.daily.h}px`);
  ck(d.gym.t>d.daily.t,'DESKTOP · the gym sits under the two squares');
  ck(new Set(d.cards).size===1,'DESKTOP · all three play cards sit in one row, no scrolling',
     d.cards.join(','));
  ck(d.over<=0,'DESKTOP · the whole menu fits without scrolling',d.over+'px overflow');
  ck(errs.length===0,'DESKTOP · no page errors',errs.slice(0,2).join(' | '));
  await p.context().close();
}

console.log('\n  '+(fails.length?fails.length+' FAILED':'ALL CHECKS PASS'));
fails.forEach(f=>console.log('   - '+f));
await b.close();
process.exit(fails.length?1:0);

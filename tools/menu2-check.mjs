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
  await p.evaluate(m=>{localStorage.clear();localStorage.setItem('bk_menu',m);
                       localStorage.setItem('bk_coach','0')},menu);
  await p.reload({waitUntil:'networkidle'});
  await sleep(1700);
  return {p,c,errs};
}
/* a click that cannot land is a FAILED CHECK, never a crashed harness */
async function tap(p,sel){try{await p.click(sel,{timeout:2500});return true}catch(e){return false}}

/* ================= 1 · ONLY ONE MENU IS EVER ON SCREEN =================== */
for (const menu of ['new','classic']) {
  const {p,errs}=await boot(menu);
  const st=await p.evaluate(()=>({
    classic:document.getElementById('screen-title').classList.contains('on'),
    fresh:document.getElementById('screen-title2').classList.contains('on'),
    classicVis:getComputedStyle(document.getElementById('screen-title')).display,
    freshVis:getComputedStyle(document.getElementById('screen-title2')).display}));
  const want=menu==='new';
  ck(st.fresh===want&&st.classic===!want,
     `bk_menu=${menu} · the right menu is the one marked on`,
     `classic=${st.classic} new=${st.fresh}`);
  /* .on is a class; display is the truth. A screen can carry the class and be
     hidden, or drop it and still be painted — only one of those is checkable
     from a screenshot and it is the wrong one. */
  ck((want?st.classicVis:st.freshVis)==='none',
     `bk_menu=${menu} · and the other one is display:none, not merely unmarked`,
     `classic ${st.classicVis} · new ${st.freshVis}`);

  /* NOTHING INVISIBLE OVER THE LIVE MENU. The exact test install-check failed
     on the first build: ask the page what is actually under each button. */
  const cover=await p.evaluate(w=>{
    const ids=w?['mmGym']:['btnCpu','btnPlay','btnHow','btnOnline'];
    const out=[];
    ids.forEach(id=>{
      const e=document.getElementById(id);if(!e)return out.push(id+' MISSING');
      const r=e.getBoundingClientRect();
      const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      if(hit!==e&&!e.contains(hit))out.push(id+' <- '+(hit&&(hit.id||hit.className)));
    });
    /* the stamps too, whichever menu they are on */
    const st=[...document.querySelectorAll('[data-daily]')].filter(e=>e.getBoundingClientRect().width);
    st.forEach(e=>{const r=e.getBoundingClientRect();
      const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      if(hit!==e&&!e.contains(hit))out.push('stamp <- '+(hit&&(hit.id||hit.className)));});
    return out;
  },want);
  ck(cover.length===0,`bk_menu=${menu} · nothing invisible is covering the live menu`,
     cover.join(' | ')||'clear');
  ck(errs.length===0,`bk_menu=${menu} · no page errors`,errs.slice(0,1).join(''));
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
     'and it lands on the Rulebook, where the seven drills actually live');
  ck(await p.evaluate(()=>document.querySelectorAll('#screen-how [data-drill]').length)===7,
     'seven live drills behind that door',
     String(await p.evaluate(()=>document.querySelectorAll('#screen-how [data-drill]').length)));
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

  /* ---- the switch back, which is the whole safety net ---- */
  await p.evaluate(()=>{document.getElementById('btnSettings2').click()});
  await sleep(600);
  const swOn=await p.evaluate(()=>document.getElementById('setMenu').classList.contains('on'));
  ck(swOn,'the Control Room switch reads ON while the new menu is up');
  await p.evaluate(()=>document.getElementById('setMenu').click());
  await sleep(500);
  const flipped=await p.evaluate(()=>({store:localStorage.getItem('bk_menu'),
    sw:document.getElementById('setMenu').classList.contains('on')}));
  ck(flipped.store==='classic'&&!flipped.sw,'flipping it OFF stores classic',flipped.store);
  await tap(p,'#backArrow');await sleep(700);
  ck(await p.evaluate(()=>document.getElementById('screen-title').classList.contains('on')&&
                          !document.getElementById('screen-title2').classList.contains('on')),
     'and you are back on the original menu without a reload');

  ck(errs.length===0,'PHONE · no page errors',errs.slice(0,2).join(' | '));
  await p.context().close();
}

/* ================= 3 · ?menu= AND THE BREAK-IT PASS ====================== */
{
  const c=await b.newContext({viewport:{width:390,height:844}});
  const p=await c.newPage();
  await p.goto(BASE,{waitUntil:'networkidle'});
  await p.evaluate(()=>localStorage.clear());
  await p.goto(BASE+'?menu=classic',{waitUntil:'networkidle'});await sleep(1700);
  ck(await p.evaluate(()=>localStorage.getItem('bk_menu'))==='classic'&&
     await p.evaluate(()=>document.getElementById('screen-title').classList.contains('on')),
     '?menu=classic lands on the original and remembers it');
  await p.goto(BASE+'?menu=new',{waitUntil:'networkidle'});await sleep(1700);
  ck(await p.evaluate(()=>document.getElementById('screen-title2').classList.contains('on')),
     '?menu=new lands on the new one');
  /* a value that is neither must not silently pick one */
  await p.goto(BASE+'?menu=banana',{waitUntil:'networkidle'});await sleep(1700);
  ck(await p.evaluate(()=>localStorage.getItem('bk_menu'))==='new',
     'BREAK · ?menu=banana changes nothing, it leaves the stored choice alone',
     String(await p.evaluate(()=>localStorage.getItem('bk_menu'))));
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

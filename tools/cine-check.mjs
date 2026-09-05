/* THE OPENING (rows 217-222, his playthrough 09-04). Serve docs/ on :8899,
   run from repo root.

   PROPERTIES, in order:
   1. The road: matchup, Brains x Buckets, then out of the GAME screen the
      walk up the tunnel (the family's own art, portrait on a tall screen,
      wide on a wide one) pushes and blooms; the layer lifts onto the REAL
      court seen from high above with the pieces already in jump-ball
      formation and the ref at centre; the game's own camera drops onto the
      sideline (his pick: option 1) and lands tight on the two centres and
      the ref; the jump ball opens there, the court showing through the
      veil. No jumbotron on this road.
   2. The card is the fork: Try one runs the practice, Jump ball goes to
      the race; Try one shows only while the practice is still owed.
   3. The winner is called over the close view and the camera pulls back
      to the playing view, the formation dissolving as it lands, the
      finger unlocked. Whoosh at the lift, whistle with the countdown.
   4. Skip is a real exit (straight to the landing). Online hides it.
      Reduce-motion cuts the walk AND the camera. Classic walks the built
      frames. The ref's stripes follow the screen's shape.

   SABOTAGE=art strips the src assignment in flight (check 2 must go red);
   SABOTAGE=push freezes the scale at 1 (check 3 must go red);
   SABOTAGE=skip strips the skip handler (check 12 must go red);
   SABOTAGE=cam freezes the camera tween (check 6 must go red);
   SABOTAGE=chrome strips the opening's screen class (check 5c must go red);
   SABOTAGE=once strips the first-game check on the card (check 17 must go red).
   A missed patch is a hard error, never a quiet green. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const SAB=process.env.SABOTAGE||'';

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});

const PATCH={
  art:{pat:"if(src){art.src=src;}",rep:"if(src){}"},
  push:{pat:"art.style.transform='scale('+(1+ease*1.6).toFixed(4)+')';",rep:"art.style.transform='scale(1)';"},
  skip:{pat:"g('cineSkip').onclick=function(){if(window.BKAudio)BKAudio.sfx('click');finish(true);};",rep:"g('cineSkip').onclick=null;"},
  cam:{pat:"  camSet({rz:f.rz+(t.rz-f.rz)*s,rx:f.rx+(t.rx-f.rx)*s,z:f.z+(t.z-f.z)*zf,k:f.k+(t.k-f.k)*s});",rep:"  camSet(f);"},
  chrome:{pat:"  document.body.classList.add('opening');",rep:""},
  once:{pat:"    if(howSeen()){startRace();return;}",rep:""},
};
async function arm(page){
  if(!SAB)return;
  const p=PATCH[SAB];if(!p){console.log('unknown SABOTAGE '+SAB);process.exit(2);}
  let hit=false;
  await page.route('**/play/game.js',async route=>{
    const body=await(await fetch(route.request().url())).text();
    if(body.indexOf(p.pat)<0){console.log('SABOTAGE PATCH MISSED');process.exit(2);}
    hit=true;
    route.fulfill({contentType:'application/javascript',body:body.replace(p.pat,p.rep)});
  });
  page.on('load',()=>{if(!hit)console.log('  ('+SAB+' sabotage not yet hit)')});
}
async function mkPage(view){
  const ctx=await b.newContext({viewport:view});
  const page=await ctx.newPage();
  page.__errs=[];page.on('pageerror',e=>page.__errs.push(String(e).slice(0,160)));
  await arm(page);
  return page;
}
async function boot(page,seed){
  await page.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await page.evaluate(s=>{localStorage.clear();for(const k in (s||{}))localStorage.setItem(k,s[k]);},seed||{});
  await page.reload({waitUntil:'networkidle'});
  await sleep(900);
  await page.evaluate(()=>{const c=document.querySelector('#coachTip .ct-ok');if(c)c.click();});
  await sleep(200);
  await page.evaluate(()=>{window.__sfx=[];
    if(window.BKAudio){const o=BKAudio.sfx;
      BKAudio.sfx=function(n){window.__sfx.push([n,performance.now()]);return o.apply(this,arguments)};}});
}
async function waitFor(page,fn,ms){const t0=Date.now();
  while(Date.now()-t0<(ms||12000)){if(await page.evaluate(fn))return true;await sleep(80);}return false;}
const SEED={bk_court:'hardwood-a'};
const BURNED={bk_court:'hardwood-a',bk_coach_seen:JSON.stringify({tossupOffer:1})};
async function toWalk(page){
  await page.evaluate(()=>{
    const C=window.BK.coach;
    C.cpu.on=true;C.cpu.team=1;C.cpu.level='rookie';
    window.BK._versus({league:'big3',decade:'ANY',target:11,rosters:C.pickRosters('big3','ANY')},true);
  });
  const vs=await waitFor(page,()=>document.getElementById('screen-versus').classList.contains('on'),3000);
  if(!vs)throw new Error('the matchup screen never came up');
}
const cam=async page=>page.evaluate(()=>window.BK._cam());
const scaleOf=async page=>page.evaluate(()=>{const m=/scale\(([\d.]+)\)/.exec(document.getElementById('cineArt').style.transform);return m?+m[1]:1;});
const near=(a,b,t)=>Math.abs(a-b)<=t;

/* ---------- 1. the road and the walk, phone ---------- */
console.log('\n[1] the opening, phone 390x844, hardwood-a');
const page=await mkPage({width:390,height:844});
await boot(page,SEED);
await toWalk(page);
const brainsFirst=await waitFor(page,()=>document.getElementById('screen-brains').classList.contains('on')&&!document.getElementById('cine').classList.contains('on'),6000);
ck(brainsFirst,'1 the matchup hands to the loading beat BEFORE the walk (row 218)');
const on=await waitFor(page,()=>document.getElementById('cine').classList.contains('on')&&document.getElementById('screen-game').classList.contains('on'),6000);
ck(on,'1b the walk opens out of the GAME screen, already on underneath');
const t0=Date.now();
await sleep(420);
const art=await page.evaluate(()=>{const a=document.getElementById('cineArt');const r=a.getBoundingClientRect();
  return {src:a.getAttribute('src')||'',nw:a.naturalWidth,w:r.width,h:r.height,op:getComputedStyle(document.getElementById('cineTunnel')).opacity};});
ck(/tunnel-hardwood-a-p\.jpg$/.test(art.src),'2 the phone wears the family\'s PORTRAIT tunnel',art.src.split('/').pop());
ck(art.nw>0&&art.w>=389&&art.h>=843&&art.op==='1','render guard: the art is loaded and covers the screen','nat='+art.nw+' '+Math.round(art.w)+'x'+Math.round(art.h));
const form0=await page.evaluate(()=>!!window.BK._tipForm());
ck(form0,'2b the formation is up under the walk (pieces set for the jump ball before the court is seen)');
const s1=await scaleOf(page);
await sleep(1700);
const s2=await scaleOf(page);
ck(s2>s1+0.15,'3 the push: the art grows toward the mouth',s1.toFixed(2)+' -> '+s2.toFixed(2));
await sleep(1000);
const bloom=await page.evaluate(()=>+document.getElementById('cineBloom').style.opacity||0);
ck(bloom>0.5,'4 the mouth blooms to light at the end of the walk','bloom='+bloom.toFixed(2));
/* the lift: the layer goes and the real camera is HIGH */
const lifted=await waitFor(page,()=>document.getElementById('cine').classList.contains('lift')||!document.getElementById('cine').classList.contains('on'),2500);
const c1=await cam(page);
ck(lifted&&c1.rx<30&&c1.z<1.05&&c1.lock,'5 the light becomes the real court seen from high above (tilt '+c1.rx.toFixed(0)+'deg, zoom '+c1.z.toFixed(2)+', finger locked)');
const jumbo=await page.evaluate(()=>document.getElementById('jumboveil').classList.contains('on'));
ck(!jumbo,'5b no jumbotron on this road (row 218)');
const chrome=await page.evaluate(()=>{const v=id=>getComputedStyle(document.getElementById(id)).visibility;
  return {hud:v('hud'),banner:v('banner'),actions:v('actions'),strip:v('stagebox'),music:v('boombox'),opening:document.body.classList.contains('opening')};});
ck(chrome.hud==='visible'&&chrome.banner==='hidden'&&chrome.actions==='hidden'&&chrome.strip==='hidden'&&chrome.music==='hidden','5c the rig stays through the drop, everything else waits (his rule)',JSON.stringify(chrome));
const skips=await page.evaluate(()=>{const hb=document.getElementById('hud').getBoundingClientRect().bottom;
  const ws=document.getElementById('cineSkip').getBoundingClientRect(),ds=document.getElementById('dropSkip');const dr=ds.getBoundingClientRect();
  return {hudBottom:hb,walkTop:ws.top,dropOn:ds.classList.contains('on'),dropTop:dr.top,dropDisplay:getComputedStyle(ds).display};});
ck(skips.walkTop>=skips.hudBottom-1&&skips.dropOn&&skips.dropDisplay!=='none'&&skips.dropTop>=skips.hudBottom-1,'5d both Skips sit just below the rig, never on it','hud '+Math.round(skips.hudBottom)+' walk '+Math.round(skips.walkTop)+' drop '+Math.round(skips.dropTop));
await sleep(1200);
const c2=await cam(page);
ck(c2.tween&&c2.rx>c1.rx+8&&c2.z>c1.z+0.2,'6 the camera drops: tilt and zoom on their way to the sideline','tilt '+c1.rx.toFixed(0)+'->'+c2.rx.toFixed(0)+' zoom '+c1.z.toFixed(2)+'->'+c2.z.toFixed(2));
const landed=await waitFor(page,()=>{const c=window.BK._cam(),t=window.BK._tipcam();return !c.tween&&Math.abs(c.rz-t.rz)<0.5&&Math.abs(c.rx-t.rx)<0.5&&Math.abs(c.z-t.z)<0.01;},5000);
const tc=await page.evaluate(()=>window.BK._tipcam());
ck(landed,'7 the landing is the ruled close view: sideline, '+tc.rx+' degrees, '+tc.z+'x');
const dsGone=await page.evaluate(()=>!document.getElementById('dropSkip').classList.contains('on'));
ck(dsGone,'7a the drop\'s Skip leaves with the landing');
const howed=await waitFor(page,()=>document.getElementById('tipveil').classList.contains('howing')&&document.getElementById('tipveil').classList.contains('cam'),4000);
ck(howed,'7b the jump ball opens on the card over a SEE-THROUGH veil (the close view is the backdrop)');
const veilA=await page.evaluate(()=>getComputedStyle(document.getElementById('tipveil')).backgroundColor);
ck(/0\.4\d\)?$/.test(veilA)||/, 0\.45\)/.test(veilA),'7c the veil sits at half its old darkness',veilA);
const took=Date.now()-t0;
ck(took>6500&&took<10000,'7d walk plus drop run their length',took+'ms');
const fork=await page.evaluate(()=>({tryV:getComputedStyle(document.getElementById('tipTry')).display,goV:getComputedStyle(document.getElementById('tipGo')).display,
  tryT:document.getElementById('tipTry').textContent.trim(),goT:document.getElementById('tipGo').textContent.trim()}));
ck(fork.tryV!=='none'&&fork.goV!=='none'&&/^Try one$/.test(fork.tryT)&&/^Jump ball/.test(fork.goT),'8 the card is the fork: Try one and Jump ball, his words (row 221)',fork.tryT+' / '+fork.goT);
/* the ref: drawn at centre, in the phone's wide stripes, dark and light pixels both present around the centre of the court */
const refPix=await page.evaluate(()=>{
  const cv=document.getElementById('court'),c=cv.getContext('2d');const dpr=cv.width/cv.getBoundingClientRect().width;
  const at=window.BK._refAt();const sh=170*at.s,sw=120*at.s;   /* the sprite box, from the piece maths */
  const x0=Math.round((at.x-sw/2)*dpr),y0=Math.round((at.y-sh)*dpr),w=Math.round(sw*dpr),h=Math.round(sh*dpr);
  const d=c.getImageData(x0,y0,w,h).data;let dark=0,light=0;
  for(let i=0;i<d.length;i+=4){const v=(d[i]+d[i+1]+d[i+2])/3;if(v<40&&Math.abs(d[i]-d[i+2])<14)dark++;else if(v>190&&Math.abs(d[i]-d[i+2])<16)light++;}
  return {dark,light,box:[x0,y0,w,h]};});
ck(refPix.dark>40&&refPix.light>40,'9 the referee stands at centre: black AND white stripes on the canvas','dark='+refPix.dark+' light='+refPix.light);
const chromeHid=await page.evaluate(()=>getComputedStyle(document.getElementById('tipveil')).display);
/* Jump ball: countdown, whistle after whoosh */
await page.click('#tipGo',{force:true});
const cd=await waitFor(page,()=>document.getElementById('tipCd').classList.contains('on'),3000);
ck(cd,'10 Jump ball goes straight to the countdown');
const sfx=await page.evaluate(()=>window.__sfx||[]);
const iw=sfx.findIndex(x=>x[0]==='whoosh'&&x[1]>0),iwh=sfx.findIndex(x=>x[0]==='whistle');
ck(iw>=0&&iwh>=0&&sfx[iwh][1]>sfx[iw][1],'10b the whoosh rides the lift and the whistle lands AFTER, with the countdown',sfx.map(x=>x[0]).join(','));
const armed=await waitFor(page,()=>!document.getElementById('tzA').classList.contains('lock')&&document.getElementById('tipQ').textContent.length>0,9000);
ck(armed,'10c the race arms over the close view');
const cHold=await cam(page);
ck(!cHold.tween&&near(cHold.rx,tc.rx,0.5)&&cHold.lock,'10d the camera holds the close view through the race, finger still locked');
/* buzz, answer, the winner, the pull-back */
await page.evaluate(()=>{document.getElementById('tzA').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));});
await sleep(1100);
await page.evaluate(()=>{const q=window.BK._q;const btns=[...document.querySelectorAll('#tipAns button,#tipAns .ans')];(btns[q&&q.a!=null?q.a:0]||btns[0]).click();});
const backing=await waitFor(page,()=>{const c=window.BK._cam();return c.tween&&c.rx<70;},4000);
ck(backing,'11 the winner is called and the camera pulls back');
const home=await waitFor(page,()=>{const c=window.BK._cam();return !c.tween&&!c.lock&&c.k<0.001&&Math.abs(c.z-1)<0.001;},4000);
const cHome=await cam(page),formEnd=await page.evaluate(()=>!!window.BK._tipForm()),phase=await page.evaluate(()=>window.BK.state().phase);
ck(home&&near(cHome.rz,-80,0.5)&&near(cHome.rx,38,0.5)&&!formEnd,'11b the camera is home on the playing view, the formation is gone, the finger is free','rz '+cHome.rz.toFixed(0)+' rx '+cHome.rx.toFixed(0)+' phase '+phase);
const back=await page.evaluate(()=>({opening:document.body.classList.contains('opening'),strip:getComputedStyle(document.getElementById('stagebox')).visibility}));
ck(!back.opening&&back.strip==='visible','11c the game\'s own chrome arrives WITH the camera: the strip is back',JSON.stringify(back));
ck(page.__errs.length===0,'no page errors through the opening',page.__errs.join(' | '));

/* ---------- 2. skip ---------- */
console.log('\n[2] skip');
await boot(page,BURNED);
await toWalk(page);
await waitFor(page,()=>document.getElementById('cine').classList.contains('on'),9000);
await sleep(600);
const skipVis=await page.evaluate(()=>{const s=document.getElementById('cineSkip');const r=s.getBoundingClientRect();
  return getComputedStyle(s).display!=='none'&&r.width>40&&r.height>=36;});
ck(skipVis,'12a the skip is on screen and thumb-sized');
await page.click('#cineSkip',{force:true});
const skipped=await waitFor(page,()=>{const c=window.BK._cam(),t=window.BK._tipcam();return !document.getElementById('cine').classList.contains('on')&&!c.tween&&Math.abs(c.rx-t.rx)<0.5&&document.getElementById('tipveil').classList.contains('howing');},1500);
ck(skipped,'12 skip: the layer is gone within a beat, the camera is AT the landing, the card is up');
const tryHidden=await page.evaluate(()=>getComputedStyle(document.getElementById('tipTry')).display==='none');
ck(tryHidden,'12b Try one is hidden once the practice key is burned (once ever)');
ck(page.__errs.length===0,'no page errors on skip',page.__errs.join(' | '));

/* ---------- 2b. skip during the drop ---------- */
console.log('\n[2b] skip during the drop');
await boot(page,BURNED);
await toWalk(page);
await waitFor(page,()=>document.getElementById('dropSkip').classList.contains('on'),12000);
await sleep(400);
await page.click('#dropSkip',{force:true});
const dskipped=await waitFor(page,()=>{const c=window.BK._cam(),t=window.BK._tipcam();return !c.tween&&Math.abs(c.rx-t.rx)<0.5&&Math.abs(c.z-t.z)<0.01&&document.getElementById('tipveil').classList.contains('howing');},2200);   /* the cut plus the 300ms hold plus a frame; 1500 flaked once under load */
ck(dskipped,'12c skip during the drop: the camera cuts to the landing and the card is up');

/* ---------- 3. reduce-motion ---------- */
console.log('\n[3] reduce-motion');
await boot(page,BURNED);
await page.evaluate(()=>document.body.classList.add('reduce-motion'));
await toWalk(page);
const rmHow=await waitFor(page,()=>document.getElementById('tipveil').classList.contains('howing'),9000);
const rm=await page.evaluate(()=>({cine:document.getElementById('cine').classList.contains('on'),c:window.BK._cam(),t:window.BK._tipcam()}));
ck(rmHow&&!rm.cine&&!rm.c.tween&&Math.abs(rm.c.rx-rm.t.rx)<0.5,'13 reduce-motion: no layer, no tween, the camera CUT to the landing, the card up',JSON.stringify(rm));

/* ---------- 4. online hides the skip ---------- */
console.log('\n[4] online: no skip');
await boot(page,BURNED);
const net=await page.evaluate(()=>new Promise(res=>{
  window.BK._netObj.on=true;
  window.BK._entrance(function(){});
  setTimeout(()=>{const v=document.getElementById('cine');
    res({net:v.classList.contains('net'),skip:getComputedStyle(document.getElementById('cineSkip')).display});
    window.BK._netObj.on=false;},200);
}));
ck(net.net&&net.skip==='none','14 online, both phones watch together: the skip is hidden');

/* ---------- 5. wide ---------- */
console.log('\n[5] wide 1440x900');
const wpage=await mkPage({width:1440,height:900});
await boot(wpage,BURNED);
await toWalk(wpage);
await waitFor(wpage,()=>document.getElementById('cine').classList.contains('on'),9000);
await sleep(400);
const wsrc=await wpage.evaluate(()=>document.getElementById('cineArt').getAttribute('src')||'');
ck(/tunnel-hardwood-a-w\.jpg$/.test(wsrc),'15 a wide screen wears the family\'s WIDE tunnel',wsrc.split('/').pop());
const wland=await waitFor(wpage,()=>{const c=window.BK._cam(),t=window.BK._tipcam();return document.getElementById('tipveil').classList.contains('howing')&&!c.tween&&Math.abs(c.rx-t.rx)<0.5&&Math.abs(c.z-3.0)<0.01;},14000);
ck(wland,'15b the desk lands on its own tip camera (3x)');
const wref=await wpage.evaluate(()=>{
  const cv=document.getElementById('court'),c=cv.getContext('2d');const dpr=cv.width/cv.getBoundingClientRect().width;
  const at=window.BK._refAt();const sh=170*at.s,sw=120*at.s;
  const x0=Math.round((at.x-sw/2)*dpr),y0=Math.round((at.y-sh)*dpr),w=Math.round(sw*dpr),h=Math.round(sh*dpr);
  const d=c.getImageData(x0,y0,w,h).data;let dark=0,light=0;
  for(let i=0;i<d.length;i+=4){const v=(d[i]+d[i+1]+d[i+2])/3;if(v<40&&Math.abs(d[i]-d[i+2])<14)dark++;else if(v>190&&Math.abs(d[i]-d[i+2])<16)light++;}
  return {dark,light};});
ck(wref.dark>40&&wref.light>40,'15c the ref on a desk: stripes on the canvas','dark='+wref.dark+' light='+wref.light);

/* ---------- 5b. the second game on this phone: no card, no fork ---------- */
console.log('\n[5b] the second game: straight to the countdown');
await boot(page,{bk_court:'hardwood-a',bk_coach_seen:JSON.stringify({tossupOffer:1,tipHow:1})});
await page.evaluate(()=>document.body.classList.add('reduce-motion'));
await toWalk(page);
const second=await waitFor(page,()=>document.getElementById('tipveil').classList.contains('on')&&document.getElementById('tipveil').classList.contains('cam')&&!document.getElementById('tipveil').classList.contains('howing')&&document.getElementById('tipQ').textContent.length>0,10000);
ck(second,'17 from the second game on, the card and Try one are gone: straight to the race (his ruling 09-05)');
/* and the first game marks it: a fresh phone shows the card, tapping Jump ball burns the key */
await boot(page,BURNED);
await page.evaluate(()=>document.body.classList.add('reduce-motion'));
await toWalk(page);
await waitFor(page,()=>document.getElementById('tipveil').classList.contains('howing'),10000);
await page.click('#tipGo',{force:true});
const marked=await page.evaluate(()=>{try{return !!JSON.parse(localStorage.getItem('bk_coach_seen')||'{}').tipHow}catch(e){return false}});
ck(marked,'17b the first game\'s tap remembers the card in the coach\'s own store (Start over brings it back)');

/* ---------- 6. classic ---------- */
console.log('\n[6] classic: the built frames');
await boot(page,{bk_coach_seen:JSON.stringify({tossupOffer:1}),bk_court:'classic-a'});
await toWalk(page);
await waitFor(page,()=>document.getElementById('cine').classList.contains('on'),9000);
await sleep(400);
const cl=await page.evaluate(()=>({src:document.getElementById('cineArt').getAttribute('src'),
  rings:document.querySelectorAll('#cineRings .cine-ring').length,
  artShown:getComputedStyle(document.getElementById('cineArt')).display}));
ck(cl.src===null&&cl.rings>=9&&cl.artShown==='none','16 classic has no photograph: the built frames walk instead','rings='+cl.rings);

await b.close();
console.log('\n'+(fails.length?'RED '+fails.length+' failing':'GREEN all checks'));
process.exit(fails.length?1:0);

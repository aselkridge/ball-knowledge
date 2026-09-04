/* THE ENTRANCE (row 103, his 08-28 ask, built 09-04 on "build it and let me
   see it in game"). Serve docs/ on :8899, run from repo root.

   PROPERTIES, in order:
   1. The matchup screen hands off to the walk (his catch 09-04, row 217:
      "the tunnel should happen after this screen"): the family's own tunnel art
      (portrait on a tall screen, wide on a wide one) pushes toward the
      mouth and blooms to light, the light becomes the sky, ONE camera
      tilts down to the side view of centre court with the ref between the
      two squads in their own colours, and the layer lifts onto the
      brains beat, then the arena. The whoosh rides the cut to the sky;
      the whistle lands WITH the countdown, after the walk, not before it.
   2. Skip is a real exit: the layer is gone within a beat and the brains
      beat is up. Online hides it (both phones watch together).
   3. Reduce-motion never shows the layer at all. Classic, which has no
      photograph, gets the built frames instead of a blank.

   SABOTAGE=art strips the src assignment in flight (check 2 must go red);
   SABOTAGE=push freezes the scale at 1 (check 3 must go red);
   SABOTAGE=skip strips the skip handler (check 8 must go red).
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
  skip:{pat:"g('cineSkip').onclick=function(){if(window.BKAudio)BKAudio.sfx('click');finish();};",rep:"g('cineSkip').onclick=null;"},
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
/* the CPU road from the matchup screen: the versus beat holds 3.4s and
   then hands off to the entrance. The practice offer is already seen so
   the later ready tap goes straight to the countdown. */
const SEED={bk_coach_seen:JSON.stringify({tossupOffer:1}),bk_court:'hardwood-a'};
async function toWalk(page){
  await page.evaluate(()=>{
    const C=window.BK.coach;
    C.cpu.on=true;C.cpu.team=1;C.cpu.level='rookie';
    window.BK._versus({league:'big3',decade:'ANY',target:11,rosters:C.pickRosters('big3','ANY')},true);
  });
  const vs=await waitFor(page,()=>document.getElementById('screen-versus').classList.contains('on'),3000);
  if(!vs)throw new Error('the matchup screen never came up');
}
const brainsOn=()=>document.getElementById('screen-brains').classList.contains('on');
const scaleOf=async page=>page.evaluate(()=>{const m=/scale\(([\d.]+)\)/.exec(document.getElementById('cineArt').style.transform);return m?+m[1]:1;});
const tiltOf=async page=>page.evaluate(()=>parseFloat(document.getElementById('cinePlane').style.getPropertyValue('--tilt'))||0);

/* ---------- 1. the walk, phone ---------- */
console.log('\n[1] the walk, phone 390x844, hardwood-a');
const page=await mkPage({width:390,height:844});
await boot(page,SEED);
await toWalk(page);
const on=await waitFor(page,()=>document.getElementById('cine').classList.contains('on'),6500);
ck(on,'1 the matchup screen hands off to the entrance');
const t0=Date.now();
await sleep(420);
const art=await page.evaluate(()=>{const a=document.getElementById('cineArt');const r=a.getBoundingClientRect();
  return {src:a.getAttribute('src')||'',nw:a.naturalWidth,w:r.width,h:r.height,
    op:getComputedStyle(document.getElementById('cineTunnel')).opacity};});
ck(/tunnel-hardwood-a-p\.jpg$/.test(art.src),'2 the phone wears the family\'s PORTRAIT tunnel',art.src.split('/').pop());
ck(art.nw>0&&art.w>=389&&art.h>=843&&art.op==='1','render guard: the art is loaded and covers the screen','nat='+art.nw+' '+Math.round(art.w)+'x'+Math.round(art.h));
const s1=await scaleOf(page);
await sleep(1700);
const s2=await scaleOf(page);
ck(s2>s1+0.15,'3 the push: the art grows toward the mouth',s1.toFixed(2)+' -> '+s2.toFixed(2));
await sleep(1000);
const bloom=await page.evaluate(()=>+document.getElementById('cineBloom').style.opacity||0);
ck(bloom>0.5,'4 the mouth blooms to light at the end of the walk','bloom='+bloom.toFixed(2));
const flew=await waitFor(page,()=>document.getElementById('cineFly').classList.contains('on'),2500);
ck(flew,'5 the light becomes the sky: the drop scene takes over');
await sleep(300);
const tl1=await tiltOf(page);
await sleep(1500);
const tl2=await tiltOf(page);
ck(tl2>tl1+10,'5b one camera: the tilt runs from overhead toward the side view',tl1.toFixed(0)+'deg -> '+tl2.toFixed(0)+'deg');
const fig=await page.evaluate(()=>{const pl=document.getElementById('cinePlane');
  const fa=pl.style.getPropertyValue('--fa').trim(),fb=pl.style.getPropertyValue('--fb').trim();
  return {fa,fb,n:pl.querySelectorAll('.cine-fg').length,bg:pl.style.backgroundImage};});
ck(fig.n===3&&fig.fa&&fig.fb&&fig.fa!==fig.fb,'6 centre court: ref between two squads in two colours',fig.fa+' / '+fig.fb);
ck(/hardwood-floor/.test(fig.bg),'6b the plane wears the family\'s own floor');
const landed=await waitFor(page,()=>!document.getElementById('cine').classList.contains('on')&&document.getElementById('screen-brains').classList.contains('on'),6000);
const took=Date.now()-t0;
ck(landed,'7 the layer lifts onto the brains beat, the road to the arena','took '+took+'ms');
ck(took>7000&&took<11000,'7b the walk runs its full length (push+drop+hold)',took+'ms');
/* on to the arena: brains, jumbotron, the card, the ready tap, the countdown */
const howed=await waitFor(page,()=>document.getElementById('tipveil').classList.contains('howing'),14000);
ck(howed,'7d after the walk the arena opens on the How-it-works card as before');
await page.click('#tipReady',{force:true});
await waitFor(page,()=>document.getElementById('tipCd').classList.contains('on'),3000);
const sfx=await page.evaluate(()=>window.__sfx||[]);
const iw=sfx.findIndex(x=>x[0]==='whoosh'&&x[1]>0),iwh=sfx.findIndex(x=>x[0]==='whistle');
ck(iw>=0&&iwh>=0&&sfx[iwh][1]>sfx[iw][1],'7c the whoosh rides the cut to the sky and the whistle lands AFTER, with the countdown',sfx.map(x=>x[0]).join(','));
ck(sfx.filter(x=>x[0]==='whoosh').length>=2,'7e the matchup keeps its own whoosh and the walk adds one at the sky');
ck(page.__errs.length===0,'no page errors on the walk',page.__errs.join(' | '));

/* ---------- 2. skip ---------- */
console.log('\n[2] skip');
await boot(page,SEED);
await toWalk(page);
await waitFor(page,()=>document.getElementById('cine').classList.contains('on'),6500);
await sleep(600);
const skipVis=await page.evaluate(()=>{const s=document.getElementById('cineSkip');const r=s.getBoundingClientRect();
  return getComputedStyle(s).display!=='none'&&r.width>40&&r.height>=36;});
ck(skipVis,'8a the skip is on screen and thumb-sized');
await page.click('#cineSkip',{force:true});
const gone=await waitFor(page,()=>!document.getElementById('cine').classList.contains('on')&&document.getElementById('screen-brains').classList.contains('on'),900);
ck(gone,'8 skip: the layer is gone within a beat and the brains beat is up');
ck(page.__errs.length===0,'no page errors on skip',page.__errs.join(' | '));

/* ---------- 3. reduce-motion ---------- */
console.log('\n[3] reduce-motion');
await boot(page,SEED);
await page.evaluate(()=>{document.body.classList.add('reduce-motion');window.__cineSeen=false;
  new MutationObserver(()=>{if(document.getElementById('cine').classList.contains('on'))window.__cineSeen=true;}).observe(document.getElementById('cine'),{attributes:true});});
await toWalk(page);
const rmb=await waitFor(page,()=>document.getElementById('screen-brains').classList.contains('on'),6500);
const rm=await page.evaluate(()=>({cine:document.getElementById('cine').classList.contains('on'),seen:!!window.__cineSeen}));
ck(rmb&&!rm.cine&&!rm.seen,'9 reduce-motion: no layer at all, the matchup goes straight to the brains beat');

/* ---------- 4. online hides the skip ---------- */
console.log('\n[4] online: no skip');
await boot(page,SEED);
const net=await page.evaluate(()=>new Promise(res=>{
  window.BK._netObj.on=true;
  window.BK._entrance(function(){});
  setTimeout(()=>{const v=document.getElementById('cine');
    res({net:v.classList.contains('net'),skip:getComputedStyle(document.getElementById('cineSkip')).display});
    window.BK._netObj.on=false;},200);
}));
ck(net.net&&net.skip==='none','10 online, both phones watch together: the skip is hidden');

/* ---------- 5. wide ---------- */
console.log('\n[5] wide 1440x900');
const wpage=await mkPage({width:1440,height:900});
await boot(wpage,SEED);
await toWalk(wpage);
await waitFor(wpage,()=>document.getElementById('cine').classList.contains('on'),6500);
await sleep(400);
const wsrc=await wpage.evaluate(()=>document.getElementById('cineArt').getAttribute('src')||'');
ck(/tunnel-hardwood-a-w\.jpg$/.test(wsrc),'11 a wide screen wears the family\'s WIDE tunnel',wsrc.split('/').pop());
/* layout width, not the transformed rect: at this beat the camera still holds the plane at zoom .55 */
const wplane=await wpage.evaluate(()=>document.getElementById('cinePlane').offsetWidth);
ck(wplane>400,'11b the court plane grows with the screen','w='+Math.round(wplane));

/* ---------- 6. classic ---------- */
console.log('\n[6] classic: the built frames');
await boot(page,{bk_coach_seen:JSON.stringify({tossupOffer:1}),bk_court:'classic-a'});
await toWalk(page);
await waitFor(page,()=>document.getElementById('cine').classList.contains('on'),6500);
await sleep(400);
const cl=await page.evaluate(()=>({src:document.getElementById('cineArt').getAttribute('src'),
  rings:document.querySelectorAll('#cineRings .cine-ring').length,
  artShown:getComputedStyle(document.getElementById('cineArt')).display}));
ck(cl.src===null&&cl.rings>=9&&cl.artShown==='none','12 classic has no photograph: the built frames walk instead','rings='+cl.rings);

await b.close();
console.log('\n'+(fails.length?'RED '+fails.length+' failing':'GREEN all checks'));
process.exit(fails.length?1:0);

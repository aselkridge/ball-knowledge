/* THE REFEREE OPTIONS (row 220): four colour rules on the real figurine
   lathe, patched in flight (no product change), standing at centre court
   between the two centres on the real hardwood court, phone and desk. */
import pw from 'playwright';
import fs from 'fs';
const {chromium}=pw;
const OUT='/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/ref';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});

/* the four rules. y runs 0 (base) to 1 (top of head); body is .155-.655, band .79-.845 */
const RULES=`
var REF_W=[236,236,230],REF_K=[24,24,26],REF_G=[112,116,122];
function refColor(y,opt,ang,seg){
  if(y<0.155)return [58,42,28];
  if(y>=0.79&&y<=0.845)return opt===3?[30,30,32]:REF_K;   /* the collar: black on every option */
  if(y>=0.655)return [116,80,58];
  if(opt===1)return (seg%2)?REF_W:REF_K;                    /* zebra: 22 stripes round the body */
  if(opt===2)return (Math.floor((y-0.155)/0.0625)%2)?REF_W:REF_K;  /* hoops: 8 bands up the body */
  if(opt===3)return REF_G;                                   /* modern NBA charcoal */
  return (Math.floor(seg/4)%2)?REF_W:REF_K;                  /* wide zebra: 5 or 6 bold stripes */
}
function pieceColor(y,team,ang,seg){
  if(typeof team==='string'&&team.slice(0,3)==='ref')return refColor(y,+team.slice(3),ang,seg);
  return pieceColor0(y,team);
}
window.__refPlace=function(opt){
  var spr=makeSprite('ref'+opt,'SF');
  state.pieces=state.pieces.filter(function(p){return !p.ref});
  var cA=state.pieces.find(function(p){return p.team===0&&p.pos==='C'}),
      cB=state.pieces.find(function(p){return p.team===1&&p.pos==='C'});
  var mc=Math.floor(MODE.cols/2),mr=Math.floor((MODE.rows-1)/2);
  cA.c=mc-1;cA.r=mr;cB.c=mc+1;cB.r=mr;
  state.pieces.push({team:0,pos:'SF',c:mc,r:mr,range:0,name:'Ref',short:'Ref',num:'',pid:null,spr:spr,ref:true});
  fitDirty=true;
  ['tipveil','jumboveil'].forEach(function(id){var v=document.getElementById(id);v.classList.remove('on','howing');});
  var tc=tileCenter(mc,mr),pp=proj(tc[0],tc[1],0),rc=canvas.getBoundingClientRect();
  return {mc:mc,mr:mr,cols:MODE.cols,rows:MODE.rows,x:rc.x+pp.x,y:rc.y+pp.y,s:pp.s};
};
window.__refSprite=function(opt){return makeSprite('ref'+opt,'SF').toDataURL()};
`;
async function mkPage(view,dpr){
  const ctx=await b.newContext({viewport:view,deviceScaleFactor:dpr});
  await ctx.addInitScript(()=>{window.__bkNoCine=1});
  const page=await ctx.newPage();
  page.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,200)));
  await page.route('**/play/game.js',async route=>{
    let body=await(await fetch(route.request().url())).text();
    const p1='var col=pieceColor((p0[0]+p1[0])/2,team);';
    const p2='function pieceColor(y,team){';
    if(body.indexOf(p1)<0||body.indexOf(p2)<0){console.log('PATCH MISSED');process.exit(2);}
    const p3='function smoothProfile(p,mult){';
    if(body.indexOf(p3)<0){console.log('PATCH MISSED 3');process.exit(2);}
    /* the rules go INSIDE the game's own scope (game.js is one closure), so
       the renamed original and state/MODE/makeSprite resolve */
    body=body.replace(p1,'var col=pieceColor((p0[0]+p1[0])/2,team,(a0+a1)/2,s);')
             .replace(p2,'function pieceColor0(y,team){')
             .replace(p3,RULES+'\n'+p3);
    route.fulfill({contentType:'application/javascript',body});
  });
  await page.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await page.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0');localStorage.setItem('bk_court','hardwood-a');});
  await page.reload({waitUntil:'networkidle'});
  await sleep(800);
  await page.evaluate(()=>{const c=document.querySelector('#coachTip .ct-ok');if(c)c.click();});
  await page.evaluate(()=>{document.body.classList.add('reduce-motion');
    const C=window.BK.coach;C.cpu.on=true;C.cpu.team=1;C.cpu.level='rookie';
    C.startGame({league:'nba',decade:['FULL'],target:11,rosters:C.pickRosters('nba',['FULL'])},false);C.show('game');});
  await sleep(1200);
  /* the arena beat: drop the jumbotron and the tip veil so the court is bare */
  await page.evaluate(()=>{document.getElementById('jumboveil').classList.remove('on');document.getElementById('tipveil').classList.remove('on');});
  await sleep(300);
  return page;
}
const report={};
for(const [tag,view,dpr] of [['phone',{width:390,height:844},2],['desk',{width:1440,height:900},1]]){
  const page=await mkPage(view,dpr);
  for(let opt=1;opt<=4;opt++){
    const r=await page.evaluate(o=>window.__refPlace(o),opt);
    await sleep(350);
    await page.screenshot({path:`${OUT}/${tag}-${opt}.png`});
    report[`${tag}-${opt}`]=r;
  }
  for(let opt=1;opt<=4;opt++){
    const spr=await page.evaluate(o=>window.__refSprite(o),opt);
    fs.writeFileSync(`${OUT}/sprite-${opt}.png`,Buffer.from(spr.split(',')[1],'base64'));
  }
  /* the ref's screen position, from the live projection */
  const pos=await page.evaluate(()=>{
    const cv=document.getElementById('court');const r=cv.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});
  report[`${tag}-court`]=pos;
  await page.context().close();
}
fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report));console.log(JSON.stringify(report));
await b.close();

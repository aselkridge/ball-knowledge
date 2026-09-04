/* THE DROP OPTIONS (row 219): four camera moves on the REAL renderer,
   patched in flight (no product change). The pieces stand in a jump-ball
   formation with the zebra ref at centre court; each move runs from a high,
   turned, overhead pose down to the close view of the jump ball. Frames go
   to the scratchpad; the board turns them into moving previews. */
import pw from 'playwright';
import fs from 'fs';
const {chromium}=pw;
const OUT='/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/cam';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});

const RULES=`
var REF_W=[236,236,230],REF_K=[24,24,26];
function refColor(y,opt,ang,seg){
  if(y<0.155)return [58,42,28];
  if(y>=0.79&&y<=0.845)return REF_K;
  if(y>=0.655)return [116,80,58];
  return (seg%2)?REF_W:REF_K;
}
function pieceColor(y,team,ang,seg){
  if(team==='ref')return refColor(y,1,ang,seg);
  return pieceColor0(y,team);
}
/* the jump-ball formation on the 15x8 court: centres on the circle, the
   rest ringed outside it, the ref at the exact centre (LW/2, LH/2) */
window.__form=function(){
  state.pieces=state.pieces.filter(function(p){return !p.ref});
  var F={0:{PG:[5,2],SG:[5,5],SF:[4,3],PF:[4,4],C:[6,3]},1:{PG:[9,5],SG:[9,2],SF:[10,4],PF:[10,3],C:[8,3]}};
  state.pieces.forEach(function(p){var f=F[p.team][p.pos];if(f){p.c=f[0];p.r=f[1];}});
  state.pieces.push({team:0,pos:'SF',c:7,r:3,range:0,name:'Ref',short:'Ref',num:'',pid:null,spr:makeSprite('ref','SF'),ref:true});
  state.ball.holder=-1;
  ['tipveil','jumboveil'].forEach(function(id){var v=document.getElementById(id);v.classList.remove('on','howing');});
  fitDirty=true;
};
window.__cam=function(o){
  window.__camOn=true;
  RZ=o.rz*Math.PI/180;RX=o.rx*Math.PI/180;
  FOCUS.x=o.fx;FOCUS.y=o.fy;FOCUS.z=o.zoom;FOCUS.k=1;FOCUS.tk=1;
  SKIN.scrim=o.scrim;SKIN.cacheKey='';fitDirty=true;
};
window.__camPlay=function(){var c=camTall?CAM_TALL:CAM_WIDE;return {rz:c.rz,rx:c.rx,LW:LW,LH:LH,tall:camTall};};
window.__veil=function(alpha){var v=document.getElementById('tipveil');v.style.background='rgba(8,5,3,'+alpha+')';v.classList.add('on');v.classList.remove('howing');
  document.getElementById('tipCd').classList.add('on');document.getElementById('tipCd').textContent='5';document.getElementById('tipMsg').textContent='get ready to buzz…';};
`;
async function mkPage(view,dpr){
  const ctx=await b.newContext({viewport:view,deviceScaleFactor:dpr});
  await ctx.addInitScript(()=>{window.__bkNoCine=1});
  const page=await ctx.newPage();
  page.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,200)));
  await page.route('**/play/game.js',async route=>{
    let body=await(await fetch(route.request().url())).text();
    const P=[
      ['var col=pieceColor((p0[0]+p1[0])/2,team);','var col=pieceColor((p0[0]+p1[0])/2,team,(a0+a1)/2,s);'],
      ['function pieceColor(y,team){','function pieceColor0(y,team){'],
      ['function smoothProfile(p,mult){',RULES+'\nfunction smoothProfile(p,mult){'],
      ['function drawnPos(p){','function drawnPos(p){\n  if(p.ref)return {x:LW/2,y:LH/2,h:0};'],
      ['var tox=w/2-FP.x*zs, toy=hu*0.46-FP.y*zs;','var tox=w/2-FP.x*zs, toy=hu*(window.__camOn?0.5:0.46)-FP.y*zs;'],
      ['if(lowest>hu-m)fit.oy-=(lowest-(hu-m));','if(!window.__camOn&&lowest>hu-m)fit.oy-=(lowest-(hu-m));'],
    ];
    for(const [a,c] of P){if(body.indexOf(a)<0){console.log('PATCH MISSED: '+a.slice(0,40));process.exit(2);}body=body.replace(a,c);}
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
  await sleep(2600);   /* let the jumbotron and runTipoff fire, then take them down */
  await page.evaluate(()=>window.__form());
  await sleep(200);
  return page;
}
/* easings */
const ss=x=>x*x*(3-2*x), ci=x=>x*x*x;
const back=(x,c)=>1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);   /* easeOutBack, overshoot grows with c */
function pose(opt,t,P){
  /* every option lands on the SAME close view: turned toward the sideline so the
     two centres stand left and right of the ref, lower, zoomed on the circle */
  const CL=P.tall?{rz:-30,rx:52,z:2.1}:{rz:-62,rx:62,z:2.0};
  const Zs=P.tall?0.72:0.8, fx=P.LW/2, fy=P.LH/2, top=8;
  let o;
  if(opt===1){ /* his words: the board as played, from high above, turning down into the close view */
    const s=ss(t);o={rz:P.rz+(CL.rz-P.rz)*s,rx:top+(CL.rx-top)*s,zoom:Zs+(CL.z-Zs)*ci(t)*0.6+ (CL.z-Zs)*0.4*s,scrim:0.7-0.35*s};}
  else if(opt===2){ /* the descent: start turned the other way, sweep through the playing view and on into the close view */
    const s=ss(t),a=P.rz-(CL.rz-P.rz)*0.8;o={rz:a+(CL.rz-a)*s,rx:top+(CL.rx-top)*s,zoom:Zs+(CL.z-Zs)*s,scrim:0.7-0.35*s};}
  else if(opt===3){ /* the orbit: half a turn round the court while dropping */
    const s=ss(t);o={rz:CL.rz+180*(1-s),rx:6+(CL.rx-6)*s,zoom:0.6+(CL.z-0.6)*ci(t),scrim:0.7-0.35*s};}
  else{ /* two beats: down onto the playing view first, a breath, then the swing in */
    if(t<0.5){const s=ss(t/0.5);o={rz:P.rz+30*(1-s),rx:12+(P.rx-12)*s,zoom:0.7+0.3*s,scrim:0.7-0.35*s};}
    else if(t<0.6)o={rz:P.rz,rx:P.rx,zoom:1,scrim:0.35};
    else{const s=ss((t-0.6)/0.4);o={rz:P.rz+(CL.rz-P.rz)*s,rx:P.rx+(CL.rx-P.rx)*s,zoom:1+(CL.z-1)*s,scrim:0.35};}
  }
  return Object.assign(o,{fx,fy});
}
function closePose(P){const CL=P.tall?{rz:-30,rx:52,z:2.1}:{rz:-62,rx:62,z:2.0};return {rz:CL.rz,rx:CL.rx,zoom:CL.z,scrim:0.35,fx:P.LW/2,fy:P.LH/2};}
const FPS=12, DUR=3.6, N=Math.round(FPS*DUR);
const meta={};
for(const [tag,view,dpr,motion] of [['phone',{width:390,height:844},1,true],['desk',{width:1440,height:900},1,false]]){
  const page=await mkPage(view,dpr);
  const P=await page.evaluate(()=>window.__camPlay());
  meta[tag]=P;
  for(let opt=1;opt<=4;opt++){
    const dir=`${OUT}/${tag}-${opt}`;fs.mkdirSync(dir,{recursive:true});
    const keys=motion?[...Array(N+1).keys()]:[0,9,18,27,36,43];
    for(const i of keys){
      const t=Math.min(1,i/N);
      await page.evaluate(o=>window.__cam(o),pose(opt,t,P));
      await sleep(45);
      await page.screenshot({path:`${dir}/f${String(i).padStart(3,'0')}.png`});
    }
    console.log(tag,opt,'done');
  }
  /* where it lands: the close view with the buzzers over it at a lighter veil */
  await page.evaluate(o=>window.__cam(o),closePose(P));
  await page.evaluate(()=>window.__veil(0.45));
  await sleep(120);
  await page.screenshot({path:`${OUT}/${tag}-landing.png`});
  await page.evaluate(()=>{const v=document.getElementById('tipveil');v.classList.remove('on');v.style.background='';});
  if(motion){
    const dir=`${OUT}/${tag}-back`;fs.mkdirSync(dir,{recursive:true});
    const C=closePose(P),M=Math.round(FPS*2.0);
    for(let i=0;i<=M;i++){const k=ss(i/M);
      await page.evaluate(o=>window.__cam(o),{rz:C.rz+(P.rz-C.rz)*k,rx:C.rx+(P.rx-C.rx)*k,zoom:C.zoom+(1-C.zoom)*k,scrim:0.35,fx:P.LW/2,fy:P.LH/2});
      await sleep(45);await page.screenshot({path:`${dir}/f${String(i).padStart(3,'0')}.png`});}
  }
  /* and the resting playing view, for reference */
  await page.evaluate(o=>window.__cam(o),{rz:P.rz,rx:P.rx,zoom:1,scrim:0.35,fx:P.LW/2,fy:P.LH/2});
  await sleep(120);
  await page.screenshot({path:`${OUT}/${tag}-play.png`});
  await page.context().close();
}
fs.writeFileSync(`${OUT}/meta.json`,JSON.stringify(meta));
console.log(JSON.stringify(meta));
await b.close();

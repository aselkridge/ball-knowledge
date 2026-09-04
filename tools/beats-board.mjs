/* THE OPENING, BEAT BY BEAT: what is on screen at each moment (his 09-04
   ask: "the only wording and buttons that should be on the screen at any
   beat are the things relevant to the player at that time"). Rendered by
   the game through route interception, no product change: the camera and
   the formation from cam-board, the chrome stripped per beat. */
import pw from 'playwright';
import fs from 'fs';
const {chromium}=pw;
const OUT='/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/beats';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});

const RULES=`
var REF_W=[236,236,230],REF_K=[24,24,26];
function refColor(y,opt,ang,seg){
  if(y<0.155)return [58,42,28];
  if(y>=0.79&&y<=0.845)return REF_K;
  if(y>=0.655)return [116,80,58];
  return camTall?((Math.floor(seg/4)%2)?REF_W:REF_K):((seg%2)?REF_W:REF_K);
}
function pieceColor(y,team,ang,seg){
  if(team==='ref')return refColor(y,1,ang,seg);
  return pieceColor0(y,team);
}
window.__form=function(on){
  state.pieces=state.pieces.filter(function(p){return !p.ref});
  if(on){
    var F={0:{PG:[5,2],SG:[5,5],SF:[4,3],PF:[4,4],C:[6,3]},1:{PG:[9,5],SG:[9,2],SF:[10,4],PF:[10,3],C:[8,3]}};
    state.pieces.forEach(function(p){var f=F[p.team][p.pos];if(f){p.c=f[0];p.r=f[1];}});
    state.pieces.push({team:0,pos:'SF',c:7,r:3,range:0,name:'Ref',short:'Ref',num:'',pid:null,spr:makeSprite('ref','SF'),ref:true});
    state.ball.holder=-1;
  }else{
    state.pieces.forEach(function(p,i){var t=p.team,k=MODE.lineup.indexOf(p.pos);var s=MODE.starts[t][k];p.c=s[0];p.r=s[1];});
    state.ball.holder=0;
  }
  fitDirty=true;
};
window.__cam=function(o){
  window.__camOn=!!o.on;
  RZ=o.rz*Math.PI/180;RX=o.rx*Math.PI/180;
  FOCUS.x=LW/2;FOCUS.y=LH/2;FOCUS.z=o.zoom;FOCUS.k=o.on?1:0;FOCUS.tk=FOCUS.k;
  SKIN.scrim=0.35;SKIN.cacheKey='';fitDirty=true;
};
window.__camPlay=function(){var c=camTall?CAM_TALL:CAM_WIDE;return {rz:c.rz,rx:c.rx,tall:camTall};};
window.__chrome=function(o){
  ['hud','banner','actions','stagebox','boombox','viewReset'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.visibility=(o&&o[id])?'':'hidden';});
  var s=document.getElementById('__skip');
  if(o&&o.skip){if(!s){s=document.createElement('button');s.id='__skip';s.className='cine-skip';s.textContent='Skip ▸';s.style.cssText='position:fixed;top:calc(14px + env(safe-area-inset-top));right:14px;z-index:60';document.body.appendChild(s);}}
  else if(s)s.remove();
};
window.__veilState=function(kind){
  var v=document.getElementById('tipveil');v.classList.remove('on','howing');v.style.background='';
  document.getElementById('tipCd').classList.remove('on');
  if(kind==='card'||kind==='race'){v.style.background='rgba(8,5,3,.45)';v.classList.add('on');}
  if(kind==='card'){v.classList.add('howing');
    var r=document.getElementById('tipReady');
    if(r&&!document.getElementById('__fork')){var d=document.createElement('div');d.id='__fork';d.style.cssText='display:flex;gap:12px;justify-content:center;margin-top:22px';
      d.innerHTML='<button class="tu-ready" style="margin:0;animation:none;background:none;color:var(--accent);box-shadow:none;border:2px solid var(--accent);padding:13px 26px">Try one</button><button class="tu-ready" style="margin:0">Jump ball →</button>';
      r.style.display='none';r.parentNode.appendChild(d);}
  }
  if(kind==='race'){document.getElementById('tipCd').classList.add('on');document.getElementById('tipCd').textContent='5';document.getElementById('tipMsg').textContent='get ready to buzz…';}
  if(kind==='won'){callout('ORANGE BALL<small>won the jump ball</small>','#f5872e');bkStrip(0,true);
    document.getElementById('bannerTxt').innerHTML='<b>WINS THE JUMP BALL!</b> Orange ball · Magic brings it up.';}
};
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
  await sleep(2600);
  await page.evaluate(()=>{['tipveil','jumboveil'].forEach(id=>document.getElementById(id).classList.remove('on','howing'));});
  return page;
}
const HIGH=P=>({on:true,rz:P.rz,rx:8,zoom:P.tall?0.72:0.8});
const CLOSE=P=>({on:true,rz:0,rx:72,zoom:P.tall?3.2:3.0});
const PLAY=P=>({on:false,rz:P.rz,rx:P.rx,zoom:1});
for(const [tag,view,dpr] of [['phone',{width:390,height:844},1],['desk',{width:1440,height:900},1]]){
  const page=await mkPage(view,dpr);
  const P=await page.evaluate(()=>window.__camPlay());
  const shot=async(name)=>{await sleep(120);await page.screenshot({path:`${OUT}/${tag}-${name}.png`});};
  /* A: the drop begins. Two versions: scoreboard kept, scoreboard gone */
  await page.evaluate(()=>window.__form(true));
  await page.evaluate(o=>window.__cam(o),HIGH(P));
  await page.evaluate(()=>window.__veilState('none'));
  await page.evaluate(()=>window.__chrome({hud:true,skip:true}));await shot('A1-drop-scoreboard');
  await page.evaluate(()=>window.__chrome({skip:true}));await shot('A2-drop-bare');
  /* B: the landing, the card with the fork */
  await page.evaluate(o=>window.__cam(o),CLOSE(P));
  await page.evaluate(()=>window.__veilState('card'));
  await page.evaluate(()=>window.__chrome({}));await shot('B-card');
  /* C: the race */
  await page.evaluate(()=>window.__veilState('race'));await shot('C-race');
  /* D: the winner, the camera home, the game's own chrome back */
  await page.evaluate(()=>window.__veilState('none'));
  await page.evaluate(()=>window.__form(false));
  await page.evaluate(o=>window.__cam(o),PLAY(P));
  await page.evaluate(()=>window.__veilState('won'));
  await page.evaluate(()=>window.__chrome({hud:true,stagebox:true,boombox:true}));await shot('D-won');
  await page.evaluate(()=>window.__chrome({hud:true,banner:true,stagebox:true,boombox:true}));await shot('D3-won-thrice');
  /* E: today, for the record: the same landing with everything the build currently leaves on */
  await page.evaluate(()=>window.__form(true));
  await page.evaluate(o=>window.__cam(o),CLOSE(P));
  await page.evaluate(()=>window.__veilState('race'));
  await page.evaluate(()=>window.__chrome({hud:true,banner:true,actions:true,stagebox:true,boombox:true}));await shot('E-today');
  await page.context().close();
  console.log(tag,'done');
}
await b.close();

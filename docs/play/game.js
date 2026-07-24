/* Ball Knowledge — v0.20 (reconnect, more questions, menu backs)
   Leagues & modes: NBA/WNBA 5v5 full court, Big3 3v3 half court w/ check-ups.
   Setup flow (league -> decade -> squad reveal -> rules), randomized real-name
   rosters w/ numbered figurines, tip-off buzzer race, league-scoped questions. */
(function(){
"use strict";

/* ========== shared SVG bits ========== */
function ballSVG(size){
  return '<svg viewBox="0 0 100 100" width="'+size+'" height="'+size+'">'+
  '<defs><radialGradient id="bg'+size+'" cx="35%" cy="28%" r="80%">'+
  '<stop offset="0%" stop-color="#ffb976"/><stop offset="45%" stop-color="#ef8330"/>'+
  '<stop offset="80%" stop-color="#c05f14"/><stop offset="100%" stop-color="#8a430c"/>'+
  '</radialGradient></defs>'+
  '<circle cx="50" cy="50" r="48" fill="url(#bg'+size+')"/>'+
  '<g fill="none" stroke="#4a2408" stroke-width="2.6" opacity=".85">'+
  '<path d="M2 50 H98"/><path d="M50 2 V98"/>'+
  '<path d="M15 15 Q50 40 85 15" transform="rotate(90 50 50)"/>'+
  '<path d="M15 85 Q50 60 85 85" transform="rotate(90 50 50)"/></g>'+
  '<ellipse cx="35" cy="27" rx="16" ry="10" fill="#fff" opacity=".18" transform="rotate(-24 35 27)"/>'+
  '</svg>';
}
function logoSVG(){
  return '<svg viewBox="0 0 240 240" width="120" height="120" aria-label="Ball Knowledge logo">'+
  '<circle cx="120" cy="120" r="112" fill="#1d1815" stroke="#c9641a" stroke-width="4"/>'+
  '<path d="M20 168 Q120 118 220 168" fill="none" stroke="#2a221b" stroke-width="7"/>'+
  '<path d="M20 84 Q120 134 220 84" fill="none" stroke="#2a221b" stroke-width="7"/>'+
  '<g stroke="#efe6d8" stroke-width="19" stroke-linecap="round" fill="none">'+
  '<path d="M62 68 V172"/><path d="M62 68 H74 A24 24 0 0 1 74 116 H62"/>'+
  '<path d="M62 118 H80 A27 27 0 0 1 80 172 H62"/>'+
  '<path d="M138 68 V172"/><path d="M144 116 L186 70"/><path d="M144 124 L186 170"/></g>'+
  '<circle cx="146" cy="120" r="21" fill="#f5872e" stroke="#241000" stroke-width="3"/>'+
  '<path d="M125 120 H167 M146 99 V141" fill="none" stroke="#241000" stroke-width="2.4"/>'+
  '</svg>';
}
function g(id){return document.getElementById(id)}
/* ldBall is a pure-CSS side-spin sphere now — no SVG injection */
g('logo').innerHTML=logoSVG();
g('cardEmblem').innerHTML=ballSVG(74);

/* ========== screens ========== */
var screens={load:g('screen-load'),title:g('screen-title'),how:g('screen-how'),
  settings:g('screen-settings'),
  online:g('screen-online'),pick:g('screen-pick'),versus:g('screen-versus'),
  league:g('screen-league'),decade:g('screen-decade'),squad:g('screen-squad'),
  rules:g('screen-rules'),game:g('screen-game')};
function show(name){
  for(var k in screens)screens[k].classList.toggle('on',k===name);
  if(window.BKAudio&&name!=='settings')
    BKAudio.music((name==='game'||name==='versus')?'game':'menu');
}

var LD_LINES=["Lacing 'em up…","Chalk toss…","Setting the screen…","Icing the shooter…",
  "Painting the key…","Calling bank…","Checking the tape…","Squeaking the sneakers…"];
(function(){
  g('stingLogo').innerHTML=logoSVG();
  var done=false,li=null,ci=null;
  function toTitle(){
    if(done)return;done=true;
    if(li)clearInterval(li);if(ci)clearInterval(ci);
    show('title');
  }
  g('screen-load').addEventListener('pointerup',toTitle);  /* tap to skip */
  setTimeout(function(){
    if(done)return;
    g('stingLogo').classList.add('done');
    g('ldMain').classList.remove('hide');
    var i=0,clock=24;
    var lineEl=g('ldLine'),clockEl=g('ldClock');
    li=setInterval(function(){i++;lineEl.textContent=LD_LINES[i%LD_LINES.length]},420);
    ci=setInterval(function(){clock--;clockEl.textContent=':'+(clock<10?'0':'')+clock;
      if(clock<=19)toTitle()},340);
  },1500);
})();
g('btnHow').addEventListener('click',function(){show('how')});
g('btnBack').addEventListener('click',function(){
  if(howFromPause){howFromPause=false;
    screens.how.classList.remove('on','ontop');return}
  show('title');
});
g('btnMenu').addEventListener('click',function(){
  g('endveil').classList.remove('on');
  if(NET.on)leaveRoom();
  show('title');
});
g('btnPlay').addEventListener('click',function(){show('league')});
g('btnAgain').addEventListener('click',function(){
  if(NET.on&&NET.role!==0){banner('<b>Host calls the rematch.</b>');return}
  g('endveil').classList.remove('on');
  if(NET.on)netEv({a:'start',cfg:lastCfg});
  startGame();
});
g('btnPause').addEventListener('click',function(){if(state)g('pauseveil').classList.add('on')});
g('pResume').addEventListener('click',function(){g('pauseveil').classList.remove('on')});
g('pRestart').addEventListener('click',function(){
  if(NET.on&&NET.role!==0){banner('<b>Host calls the rematch.</b>');g('pauseveil').classList.remove('on');return}
  g('pauseveil').classList.remove('on');
  if(NET.on)netEv({a:'start',cfg:lastCfg});
  startGame();
});
g('pExit').addEventListener('click',function(){
  g('pauseveil').classList.remove('on');
  if(NET.on)leaveRoom();
  show('title');
});

/* the BROWSER must never zoom — only our court camera does */
['gesturestart','gesturechange','gestureend'].forEach(function(gev){
  document.addEventListener(gev,function(e){e.preventDefault()},{passive:false});
});

/* ========== FL-4 alpha: online rooms (friend codes) ========== */
var NET={on:false,role:null,ws:null,code:null,frozen:false};
function netURL(){
  var q=null;
  try{q=new URLSearchParams(location.search).get('server')}catch(e){}
  return q||'wss://ball-knowledge-rvbb.onrender.com';
}
function netSend(o){if(NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify(o))}
function netEv(o){if(NET.on)netSend({t:'ev',ev:o})}
function markGame(on){
  try{
    if(on&&NET.on)sessionStorage.setItem('bk_rejoin',JSON.stringify({code:NET.code,role:NET.role}));
    else sessionStorage.removeItem('bk_rejoin');
  }catch(e){}
}
function netVeil(html){
  var el=g('netveil');
  if(!html){el.classList.remove('on');return;}
  g('netveilMsg').innerHTML=html;el.classList.add('on');
}
function oStatus(msg){var el=g('oStatus');if(el)el.innerHTML=msg}
function netConnect(cb){
  if(NET.ws){try{NET.ws.onclose=null;NET.ws.close()}catch(e){}}
  var url=netURL();
  /* poke the http side first — the free server naps and takes ~30s to wake */
  try{fetch(url.replace(/^ws/,'http')+'/health',{mode:'no-cors'}).catch(function(){})}catch(e){}
  var ws=new WebSocket(url);
  NET.ws=ws;
  var opened=false;
  ws.onopen=function(){opened=true;cb(null)};
  ws.onerror=function(){if(!opened)cb('err')};
  ws.onmessage=function(m){
    var d;try{d=JSON.parse(m.data)}catch(e){return}
    netMsg(d);
  };
  ws.onclose=function(){
    if(NET.on&&!NET._rejoining){
      /* our own line dropped — the server holds our seat; offer to climb back in */
      NET.frozen=true;
      netVeil('<b>Connection dropped.</b><br>The room is held for a moment.'+
        '<div class="row"><button class="bigbtn" id="nvRejoin">Reconnect</button>'+
        '<button class="bigbtn ghost" id="nvQuit">Quit</button></div>');
      var rj=g('nvRejoin'),qz=g('nvQuit');
      if(rj)rj.onclick=function(){netVeil('');attemptRejoin()};
      if(qz)qz.onclick=function(){leaveRoom();show('title')};
    }
  };
}
function netMsg(d){
  if(d.t==='room'){
    NET.code=d.code;NET.role=d.role;
    if(d.role===0)oStatus('ROOM CODE: <b style="font-size:30px;letter-spacing:.3em;color:var(--accent)">'+d.code+
      '</b><br>Text it to your friend — waiting for them to join…');
    return;
  }
  if(d.t==='nope'){oStatus('❌ '+d.why);return}
  if(d.t==='ready'){
    NET.on=true;
    if(NET.role===0){oStatus('Friend connected! Set the matchup.');setTimeout(function(){show('league')},600)}
    else oStatus('✅ Connected — you are <b style="color:var(--away)">BLUE</b>.<br>Your friend is setting the matchup…');
    return;
  }
  if(d.t==='peer-dropped'){
    /* the OTHER player dropped — freeze and wait out the grace window */
    NET.frozen=true;
    var secs=d.grace||45;
    netVeil('<b>Opponent dropped.</b><br>Holding the game for up to '+secs+'s…'+
      '<div class="row"><button class="bigbtn ghost" id="nvGiveup">Leave</button></div>');
    var gu=g('nvGiveup');if(gu)gu.onclick=function(){leaveRoom();show('title')};
    return;
  }
  if(d.t==='peer-back'){
    /* survivor: our opponent reconnected — push them the live board */
    netVeil('<b>Opponent reconnected.</b><br>Syncing the game…');
    netEv({a:'resync',snap:snapshot()});
    setTimeout(function(){NET.frozen=false;netVeil('');},400);
    return;
  }
  if(d.t==='rejoined'){
    /* us: back in our seat — the survivor will send a snapshot next */
    NET.on=true;NET._rejoining=false;NET.frozen=true;
    markGame(true);
    netVeil('<b>Back in!</b><br>Pulling the current game…');
    return;
  }
  if(d.t==='peer-left'){
    NET.on=false;markGame(false);netVeil('');
    callout('OPPONENT LEFT');
    setTimeout(function(){show('title')},1400);
    return;
  }
  if(d.t==='ev')netApply(d.ev);
}
function leaveRoom(){
  if(NET.on)netEv({a:'left'});
  NET.on=false;NET.frozen=false;markGame(false);netVeil('');
  try{if(NET.ws){NET.ws.onclose=null;NET.ws.close()}}catch(e){}
}
function actingTeam(){
  if(!state)return -1;
  var ph=state.phase;
  if(ph==='def-slide')return 1-state.offense;
  if(ph==='shooting'&&pending){
    var defTypes={contest:1,crossdef:1,crosssteal:1,stealtry:1};
    return defTypes[pending.type]?1-state.offense:state.offense;
  }
  return state.offense;
}
function myAction(){return !NET.on||actingTeam()===NET.role}
function safePhase(){
  var stable={'off-select':1,'off-move':1,'def-slide':1,'inbound':1,'inbound-move':1};
  if(stable[state.phase])return state.phase;
  /* dropped mid-card/meter/battle — resume at a clean point for the acting team */
  return state.phase==='def-slide'?'def-slide':'off-select';
}
function snapshot(){
  return {
    cfg:lastCfg,
    score:state.score.slice(), offense:state.offense, front:state.front,
    ballHolder:state.ball.holder, phase:safePhase(),
    pos:state.pieces.map(function(p){return [p.c,p.r]}),
    qmode:state.qmode,q:state.q,qposs:state.qposs,possTeam:state.possTeam,
    inbPending:state.inbPending,inbMoved:state.inbMoved,
    clock:{t:state.clock?state.clock.t:0,kind:state.clock?state.clock.kind:null,warned:-1}
  };
}
function applySnapshot(sn){
  startGame(sn.cfg,true);            /* rebuild pieces + sprites, no tip-off */
  state.score=sn.score.slice();
  state.offense=sn.offense;state.front=sn.front;
  state.ball.holder=sn.ballHolder;
  sn.pos.forEach(function(pr,i){if(state.pieces[i]){state.pieces[i].c=pr[0];state.pieces[i].r=pr[1];}});
  state.qmode=sn.qmode;state.q=sn.q;state.qposs=sn.qposs;state.possTeam=sn.possTeam;
  state.inbPending=sn.inbPending;state.inbMoved=sn.inbMoved;
  state.clock=sn.clock||{t:0,kind:null,warned:-1};
  pending=null;battle=null;sd=null;meter=null;
  g('ptsA').textContent=state.score[0];g('ptsB').textContent=state.score[1];
  if(state.qmode)updateQHud();
  NET.frozen=false;netVeil('');
  show('game');
  if(sn.phase==='def-slide'){
    state.phase='def-slide';
    banner('<b>Back in — '+teamName(1-state.offense)+' on defense.</b> Slide a defender — or stay put.');
    stagebox('<button class="bigbtn ghost" id="aSkip">Stay put ▸</button>');
    var sk=g('aSkip');if(sk)sk.addEventListener('click',skipEmit);
    actions('<span class="note">'+teamName(1-state.offense)+' — tap a defender</span>');
  }else{
    state.phase='off-select';
    banner('<b>Back in — '+teamName(state.offense)+' ball.</b> Tap one of your players.');
    actions('<span class="note">Tap a player to act</span>');
  }
}
function attemptRejoin(){
  var saved=null;
  try{saved=JSON.parse(sessionStorage.getItem('bk_rejoin')||'null')}catch(e){}
  if(!saved){show('title');return;}
  NET._rejoining=true;NET.role=saved.role;NET.code=saved.code;
  netVeil('<b>Reconnecting…</b><br>Waking the server can take a few seconds.');
  netConnect(function(err){
    if(err){netVeil('<b>Couldn\u2019t reach the server.</b><br>'+
      '<div class="row"><button class="bigbtn" id="nvRetry">Try again</button>'+
      '<button class="bigbtn ghost" id="nvQuit2">Quit</button></div>');
      var rt=g('nvRetry'),q2=g('nvQuit2');
      if(rt)rt.onclick=attemptRejoin;
      if(q2)q2.onclick=function(){leaveRoom();show('title')};
      return;}
    netSend({t:'rejoin',code:saved.code,role:saved.role});
  });
}
function netApply(ev){
  switch(ev.a){
    case 'start':startGame(ev.cfg);markGame(true);show('game');break;
    case 'pick':enterPick(ev.cfg);break;
    case 'squad':
      if(pickCfg){pickCfg.cfg.rosters[ev.team]=ev.roster;renderPick();pickStatusLine();}
      break;
    case 'lock':
      if(pickCfg){pickCfg.locked[ev.team]=true;pickStatusLine();checkLocked();}
      break;
    case 'act':applyAct(ev);break;
    case 'shoot':state.selected=ev.sel;doShoot();break;
    case 'stayput':endDefSlide();break;
    case 'steal':startStealTry(ev.def);break;
    case 'clockv':applyClockV(ev.kind);break;
    case 'card':stagebox('');resolvePending(ev.correct);break;
    case 'meter':meterResolve(ev.pos);break;
    case 'tap':
      if(battle&&!battle.over){
        battle.counts[ev.team]++;
        g(ev.team===0?'cntA':'cntB').textContent=battle.counts[ev.team];
      }
      break;
    case 'battle':(function ap(){if(battle)finishBattle(ev.w);else setTimeout(ap,250)})();break;
    case 'buzz':tipBuzz(ev.team);break;
    case 'tip':tipAnswer(ev.ok);break;
    case 'resync':applySnapshot(ev.snap);break;
    case 'left':
      leaveRoom();callout('OPPONENT LEFT');
      setTimeout(function(){show('title')},1400);
      break;
  }
}

/* ========== modes ========== */
var MODES={
  nba:{cols:15,rows:8,half:false,label:'NBA',lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  wnba:{cols:15,rows:8,half:false,label:'WNBA',lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  world:{cols:15,rows:8,half:false,label:'WORLD',lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  big3:{cols:8,rows:7,half:true,label:'BIG3',lineup:['PG','SF','C'],
    starts:[[[2,3],[1,1],[1,5]],[[4,3],[5,1],[5,5]]]}
};
var RANGE={PG:3,SG:2,SF:2,PF:2,C:1};
var MODE=MODES.big3;

/* ========== projection (RZ is live — the court rotates) ========== */
var COLS=13,ROWS=7,TILE=46;
var LW=COLS*TILE,LH=ROWS*TILE;
function applyMode(l){
  MODE=MODES[l];
  COLS=MODE.cols;ROWS=MODE.rows;
  LW=COLS*TILE;LH=ROWS*TILE;
  RIM_L=[-14,LH/2];RIM_R=[LW+14,LH/2];
}
var RZ=-30*Math.PI/180,RX=57*Math.PI/180,PERSP=1400;
var wrapW=0,wrapH=0;
var fit={s:1,ox:0,oy:0};
/* tap a player -> the camera leans in on him; tap away -> it breathes back out */
var FOCUS={k:0,tk:0,x:0,y:0,z:1.5};
function setFocus(px,py){FOCUS.x=px;FOCUS.y=py;FOCUS.tk=1;fitDirty=true}
function clearFocus(){FOCUS.tk=0;fitDirty=true}
function rawProj(lx,ly,h){
  var x=lx-LW/2,y=ly-LH/2,z=h||0;
  var x1=x*Math.cos(RZ)-y*Math.sin(RZ), y1=x*Math.sin(RZ)+y*Math.cos(RZ);
  var y2=y1*Math.cos(RX)-z*Math.sin(RX), z2=y1*Math.sin(RX)+z*Math.cos(RX);
  var s=PERSP/(PERSP-z2);
  return {x:x1*s,y:y2*s,s:s,z:z2};
}
function proj(lx,ly,h){
  var p=rawProj(lx,ly,h);
  return {x:p.x*fit.s+fit.ox, y:p.y*fit.s+fit.oy, s:p.s*fit.s, z:p.z};
}
var canvas=g('court'),ctx=canvas.getContext('2d'),DPR=Math.min(2,window.devicePixelRatio||1);
function computeFit(){
  var w=wrapW,hgt=wrapH;
  var pts=[],ext=[[-46,LH/2,0],[LW+46,LH/2,0],[0,0,0],[LW,0,0],[0,LH,0],[LW,LH,0],
           [-40,LH/2,95],[LW+40,LH/2,95],[LW/2,0,80],[LW/2,LH,80]];
  for(var i=0;i<ext.length;i++)pts.push(rawProj(ext[i][0],ext[i][1],ext[i][2]));
  var minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
  pts.forEach(function(p){minx=Math.min(minx,p.x);maxx=Math.max(maxx,p.x);
    miny=Math.min(miny,p.y);maxy=Math.max(maxy,p.y)});
  var m=18;
  fit.s=Math.min((w-2*m)/(maxx-minx),(hgt-2*m)/(maxy-miny))*ZOOM;
  fit.ox=w/2-(minx+maxx)/2*fit.s;
  fit.oy=hgt/2-(miny+maxy)/2*fit.s;
  if(FOCUS.k>0.001){
    var FP=rawProj(FOCUS.x,FOCUS.y,0);
    var zs=fit.s*(1+(FOCUS.z-1)*FOCUS.k);
    var tox=w/2-FP.x*zs, toy=hgt*0.46-FP.y*zs;
    fit.ox=fit.ox+(tox-fit.ox)*FOCUS.k;
    fit.oy=fit.oy+(toy-fit.oy)*FOCUS.k;
    fit.s=zs;
  }
}
function refit(){
  var wrap=g('court-wrap');
  wrapW=wrap.clientWidth;wrapH=wrap.clientHeight;
  if(!wrapW||!wrapH){requestAnimationFrame(refit);return}
  canvas.width=wrapW*DPR;canvas.height=wrapH*DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  computeFit();
}
window.addEventListener('resize',refit);

function tileCenter(c,r){return [ (c+0.5)*TILE, (r+0.5)*TILE ]}
var RIM_L=[-14,LH/2], RIM_R=[LW+14,LH/2], RIM_H=44, REB_R=130;
function attackedRim(team){return MODE.half?RIM_R:(team===0?RIM_R:RIM_L)}

function zoneOf(c,r,team){
  var tc=tileCenter(c,r), rim=attackedRim(team);
  var d=Math.hypot(tc[0]-rim[0],tc[1]-rim[1]);
  if(d<=95)return {z:'layup',tier:1,pts:2,label:'Layup · easy · 2'};
  if(d<=185)return {z:'mid',tier:2,pts:2,label:'Mid-range · medium · 2'};
  if(d<=278)return {z:'three',tier:3,pts:3,label:'Three · hard · 3'};
  return null;
}

/* ========== figurine sprites ========== */
var PROFILES={
  PG:[[0,.30],[.05,.32],[.11,.25],[.15,.155],[.20,.125],[.34,.165],[.52,.19],[.62,.175],
      [.655,.115],[.695,.06],[.73,.095],[.80,.12],[.875,.105],[.935,.06],[.965,.02]],
  SG:[[0,.33],[.05,.35],[.11,.27],[.15,.17],[.20,.14],[.33,.19],[.51,.22],[.61,.20],
      [.655,.13],[.695,.065],[.73,.10],[.80,.13],[.875,.11],[.935,.06],[.965,.02]],
  SF:[[0,.34],[.05,.36],[.11,.28],[.15,.175],[.20,.15],[.33,.20],[.51,.235],[.61,.21],
      [.655,.135],[.695,.07],[.73,.105],[.80,.135],[.875,.115],[.935,.065],[.965,.02]],
  PF:[[0,.36],[.05,.38],[.11,.30],[.15,.19],[.20,.16],[.32,.22],[.50,.255],[.61,.23],
      [.655,.145],[.70,.072],[.735,.11],[.805,.14],[.88,.12],[.94,.068],[.97,.02]],
  C: [[0,.37],[.05,.39],[.11,.31],[.15,.20],[.20,.17],[.31,.235],[.50,.27],[.61,.245],
      [.66,.155],[.70,.075],[.735,.115],[.805,.145],[.88,.125],[.94,.07],[.97,.02]]
};
var HEIGHTS={PG:.94,SG:1,SF:1.02,PF:1.06,C:1.1};
function pieceColor(y,team){
  if(y<0.155)return [58,42,28];
  if(y<0.655)return team===0?[224,120,32]:[74,152,200];
  if(y>=0.79&&y<=0.845)return [250,240,225];
  return [116,80,58];
}
function makeSprite(team,pos){
  var prof=PROFILES[pos],SEG=24,scaleH=HEIGHTS[pos];
  var W=120,H=170,cvs=document.createElement('canvas');
  cvs.width=W*2;cvs.height=H*2;
  var c2=cvs.getContext('2d');c2.scale(2,2);
  var HGT=128*scaleH,RAD=128,cx=W/2,base=H-6;
  var yaw=team===0?0.55:-0.55,tilt=-0.30,F=700;
  function norm(v){var l=Math.hypot(v[0],v[1],v[2]);return[v[0]/l,v[1]/l,v[2]/l]}
  var L=norm([-0.45,0.72,0.53]);
  function rot(v){
    var x=v[0]*Math.cos(yaw)+v[2]*Math.sin(yaw),
        z=-v[0]*Math.sin(yaw)+v[2]*Math.cos(yaw),
        y=v[1]*Math.cos(tilt)-z*Math.sin(tilt);
    z=v[1]*Math.sin(tilt)+z*Math.cos(tilt);
    return [x,y,z];
  }
  var out=[];
  for(var i=0;i<prof.length-1;i++){
    for(var s=0;s<SEG;s++){
      var a0=s/SEG*2*Math.PI,a1=(s+1)/SEG*2*Math.PI,p0=prof[i],p1=prof[i+1];
      function v(p,a){return [Math.cos(a)*p[1]*RAD,-p[0]*HGT,Math.sin(a)*p[1]*RAD]}
      var vs=[v(p0,a0),v(p0,a1),v(p1,a1),v(p1,a0)],pts=[],z=0;
      for(var j=0;j<4;j++){var r=rot(vs[j]);z+=r[2];
        var pr=F/(F+r[2]+320);pts.push([cx+r[0]*pr,r[1]*pr]);}
      var e1=[pts[1][0]-pts[0][0],pts[1][1]-pts[0][1]],
          e2=[pts[3][0]-pts[0][0],pts[3][1]-pts[0][1]];
      if(e1[0]*e2[1]-e1[1]*e2[0]<0)continue;
      var a=[vs[1][0]-vs[0][0],vs[1][1]-vs[0][1],vs[1][2]-vs[0][2]],
          b=[vs[3][0]-vs[0][0],vs[3][1]-vs[0][1],vs[3][2]-vs[0][2]];
      var n=rot(norm([a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]));
      var sh=.34+.66*Math.max(0,n[0]*L[0]+n[1]*L[1]+n[2]*L[2]);
      var col=pieceColor((p0[0]+p1[0])/2,team);
      out.push({z:z,pts:pts,c:'rgb('+(col[0]*sh|0)+','+(col[1]*sh|0)+','+(col[2]*sh|0)+')'});
    }
  }
  var maxy=-1e9;out.forEach(function(q){q.pts.forEach(function(p){maxy=Math.max(maxy,p[1])})});
  var dy=base-maxy;
  out.sort(function(a,b){return b.z-a.z});
  out.forEach(function(q){
    c2.fillStyle=q.c;c2.strokeStyle=q.c;c2.lineWidth=.5;
    c2.beginPath();c2.moveTo(q.pts[0][0],q.pts[0][1]+dy);
    for(var m2=1;m2<4;m2++)c2.lineTo(q.pts[m2][0],q.pts[m2][1]+dy);
    c2.closePath();c2.fill();c2.stroke();
  });
  return cvs;
}
var SPRITES={};
['PG','SG','SF','PF','C'].forEach(function(pos){
  SPRITES['0'+pos]=makeSprite(0,pos);
  SPRITES['1'+pos]=makeSprite(1,pos);
});

/* ========== state ========== */
var state=null,usedQ={1:[],2:[],3:[]},pending=null,battle=null,tip=null,lastCfg=null;
function pickSquad(league,decade,excludeNames){
  var src=ROSTERS[league],lineup=MODES[league].lineup;
  var pool={};lineup.forEach(function(p){pool[p]=[]});
  var decs=Array.isArray(decade)?decade.slice():[decade];
  if(!decs.length||decs.indexOf('FULL')>=0)decs=Object.keys(src);
  decs=decs.filter(function(d){return src[d]});
  if(!decs.length)decs=Object.keys(src);
  decs.forEach(function(d){lineup.forEach(function(p){
    (src[d][p]||[]).forEach(function(pl){pool[p].push(pl)});
  })});
  var used={};
  (excludeNames||[]).forEach(function(n){used[n]=true});
  var r={};
  lineup.forEach(function(p){
    var opts=pool[p].filter(function(pl){return !used[pl.n]});
    var pick=opts.length?opts[Math.floor(Math.random()*opts.length)]:pool[p][0];
    used[pick.n]=true;r[p]=pick;
  });
  return r;
}
function pickRosters(league,decade){
  var a=pickSquad(league,decade,[]);
  var names=MODES[league].lineup.map(function(p){return a[p].n});
  return [a,pickSquad(league,decade,names)];
}
function numberedSprite(team,pos,num){
  var base=SPRITES[team+pos];
  var cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height;
  var c=cv.getContext('2d');c.drawImage(base,0,0);
  c.save();c.scale(2,2);
  c.font='700 19px ui-monospace,Menlo,monospace';c.textAlign='center';
  c.strokeStyle='rgba(20,8,0,.55)';c.lineWidth=3;
  c.fillStyle='rgba(255,248,238,.95)';
  var y=164-128*HEIGHTS[pos]*0.42;
  c.strokeText(num,60,y);c.fillText(num,60,y);
  c.restore();return cv;
}
function startGame(cfg,resume){
  cfg=cfg||lastCfg||{league:'big3',decade:'ANY',target:11,rosters:pickRosters('big3','ANY')};
  lastCfg=cfg;
  applyMode(cfg.league);
  state={
    score:[0,0], offense:0, phase:'off-select', selected:null,
    pieces:[], ball:{holder:0,fly:null}, animCb:null,
    front:false,inbMoved:false,inbPending:false,staged:null,paintCt:null,paintFor:-1,
    qmode:cfg.target==='Q', q:1, qposs:1, possTeam:null,
    clock:{t:0,kind:null,warned:-1},
    league:cfg.league, target:cfg.target==='Q'?9999:cfg.target
  };
  [0,1].forEach(function(t){
    MODE.lineup.forEach(function(pos,i){
      var pl=cfg.rosters[t][pos];
      var pc={team:t,pos:pos,c:MODE.starts[t][i][0],r:MODE.starts[t][i][1],
        range:RANGE[pos],name:pl.n,short:pl.n.split(' ').pop(),num:pl.num};
      pc.spr=numberedSprite(t,pos,pl.num);
      state.pieces.push(pc);
    });
  });
  state.ball.holder=0;
  usedQ={1:[],2:[],3:[]};pending=null;battle=null;tip=null;
  if(qTimer){clearTimeout(qTimer);qTimer=null}
  g('rebveil').classList.remove('on');
  g('qveil').classList.remove('on');
  g('pauseveil').classList.remove('on');
  g('tipveil').classList.remove('on');
  g('meterveil').classList.remove('on');meter=null;
  stagebox('');g('callout').classList.remove('show');
  FOCUS.k=0;FOCUS.tk=0;lastPlay=null;sd=null;
  g('ptsA').textContent='0';g('ptsB').textContent='0';
  g('hudMid').textContent=(state.qmode?'Q1 · POSS 1/6':MODE.label+' · FIRST TO '+cfg.target)+
    (NET.on?' · YOU ARE '+(NET.role===0?'ORANGE':'BLUE'):'');
  refit();
  if(!resume)runTipoff();
}
function pieceAt(c,r){for(var i=0;i<state.pieces.length;i++){var p=state.pieces[i];
  if(p.c===c&&p.r===r)return i}return -1}
function teamName(t){return t===0?'Orange':'Blue'}
function banner(html){g('banner').innerHTML=html}
function actions(html){g('actions').innerHTML=html}
function defendedRim(team){return MODE.half?RIM_R:(team===0?RIM_L:RIM_R)}
function defSlideRange(p){
  var rim=defendedRim(p.team),tc=tileCenter(p.c,p.r);
  /* stranded deep = sprint at full offensive speed; otherwise defense moves
     one square LESS than the player's offensive range (min 1) */
  return Math.hypot(tc[0]-rim[0],tc[1]-rim[1])>LW*0.52 ? p.range : Math.max(1,p.range-1);
}
function adjDefenderIdx(c,r,offTeam){
  var rim=attackedRim(offTeam);
  var sc=tileCenter(c,r),sRim=Math.hypot(sc[0]-rim[0],sc[1]-rim[1]);
  var best=-1,bestC=false;
  state.pieces.forEach(function(p,i){
    if(p.team===offTeam)return;
    if(Math.max(Math.abs(p.c-c),Math.abs(p.r-r))>1)return;
    /* only a defender BETWEEN you and the rim contests — beside or behind
       can't affect the look (chase-downs = future signature skill) */
    var dc=tileCenter(p.c,p.r);
    if(Math.hypot(dc[0]-rim[0],dc[1]-rim[1])>=sRim-TILE*0.2)return;
    if(best<0||(p.pos==='C'&&!bestC)){best=i;bestC=p.pos==='C'}
  });
  return best;
}
function segDist(px,py,ax,ay,bx,by){
  var dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;
  var t=L2?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/L2)):0;
  return Math.hypot(px-(ax+dx*t),py-(ay+dy*t));
}
function laneDefenders(fc,fr,tc2,tr2,offTeam){
  var a=tileCenter(fc,fr),b=tileCenter(tc2,tr2),n=0;
  state.pieces.forEach(function(p){
    if(p.team===offTeam)return;
    /* a defender pressuring the PASSER doesn't clog the lane — only bodies
       along the flight path or contesting the catch do */
    if(Math.max(Math.abs(p.c-fc),Math.abs(p.r-fr))<=1)return;
    var c=tileCenter(p.c,p.r);
    if(segDist(c[0],c[1],a[0],a[1],b[0],b[1])<=TILE*1.15)n++;
  });
  return n;
}
function inFront(team,c,r){var x=tileCenter(c,r)[0];return team===0?x>LW/2:x<LW/2}
/* screens v1: a defender with an off-ball offensive body adjacent is screened —
   his zone stops gating drives */
function screenedSet(offTeam){
  var s={};
  state.pieces.forEach(function(d,di){
    if(d.team===offTeam)return;
    state.pieces.forEach(function(o,oi){
      if(o.team!==offTeam||oi===state.ball.holder)return;
      if(Math.max(Math.abs(o.c-d.c),Math.abs(o.r-d.r))<=1)s[di]=true;
    });
  });
  return s;
}
/* direction-aware drive gate:
   - lateral / retreating moves are ALWAYS free
   - advancing while a (front-or-level, unscreened) defender marks you = crossover
   - driving past an unscreened helper on the line = crossover
   - approaching to stop in front of a NEW defender = free */
function driveChallenge(fc,fr,tc2,tr2,offTeam,ignoreScreens){
  var rim=attackedRim(offTeam);
  var a=tileCenter(fc,fr),b=tileCenter(tc2,tr2);
  var sRim=Math.hypot(a[0]-rim[0],a[1]-rim[1]);
  var prog=sRim-Math.hypot(b[0]-rim[0],b[1]-rim[1]);
  if(prog<=4)return -1;
  var scr=ignoreScreens?{}:screenedSet(offTeam);
  /* several defenders can gate one drive — the DUEL is against whichever
     unscreened man sits closest to your driving line (cut between two and
     it's the tighter one) */
  var best=-1,bd=1e9;
  state.pieces.forEach(function(p,i){
    if(p.team===offTeam||scr[i])return;
    var dc=tileCenter(p.c,p.r);
    var lineD=segDist(dc[0],dc[1],a[0],a[1],b[0],b[1]);
    var gate=false;
    var marking=Math.max(Math.abs(p.c-fc),Math.abs(p.r-fr))<=1;
    if(marking&&Math.hypot(dc[0]-rim[0],dc[1]-rim[1])<sRim+TILE*0.6)gate=true;
    else if(Math.max(Math.abs(p.c-tc2),Math.abs(p.r-tr2))<=1){
      var dRim=Math.hypot(dc[0]-rim[0],dc[1]-rim[1]);
      var tRim=Math.hypot(b[0]-rim[0],b[1]-rim[1]);
      if(tRim<dRim-TILE*0.3)gate=true; /* slipping BEHIND him — that's a cross */
    }
    else if(lineD<=TILE*1.15)gate=true;
    if(gate&&lineD<bd){bd=lineD;best=i}
  });
  return best;
}
function nearestPiece(team,lx,ly){
  var best=-1,bd=1e9;
  state.pieces.forEach(function(p,i){
    if(p.team!==team)return;
    var tc=tileCenter(p.c,p.r),d=Math.hypot(tc[0]-lx,tc[1]-ly);
    if(d<bd){bd=d;best=i}
  });
  return {i:best,d:bd};
}

/* replay-last-move: visual re-run of the last hop/pass, state untouched */
var lastPlay=null;
function recordPlay(steps){lastPlay=steps}
function replayPlay(){
  if(!lastPlay||!state)return;
  if(state.phase==='anim'||state.phase==='shooting'||state.phase==='meter'||state.ball.fly)return;
  lastPlay.forEach(function(st){
    if(st.k==='hop'){
      var p=state.pieces[st.i];
      if(p.c===st.to[0]&&p.r===st.to[1]&&!p.anim)
        p.anim={fc:st.from[0],fr:st.from[1],tc:st.to[0],tr:st.to[1],t:0,dur:0.55};
    }else if(st.k==='ball'){
      flyBall(st.from,st.to,26,26,60,0.7,null);
    }
  });
  banner('<b>↺ Replay</b> — the last move, one more time.');
}

/* piece movement animation (the hop) */
function movePieceAnim(i,c,r,dur,done){
  var p=state.pieces[i];
  p.anim={fc:p.c,fr:p.r,tc:c,tr:r,t:0,dur:dur||0.28};
  p.c=c;p.r=r;
  state.phase='anim';
  state.animCb=done||null;
}

/* ========== rendering ========== */
var t0=performance.now(),lastTs=0;
function drawnPos(p){
  if(p.anim){
    var a=p.anim,f=tileCenter(a.fc,a.fr),t=tileCenter(a.tc,a.tr);
    var k=Math.min(1,a.t);
    return {x:f[0]+(t[0]-f[0])*k, y:f[1]+(t[1]-f[1])*k, h:Math.sin(Math.PI*k)*12};
  }
  var tc=tileCenter(p.c,p.r);
  return {x:tc[0],y:tc[1],h:0};
}
function render(ts){
  var dt=lastTs?Math.min(.05,(ts-lastTs)/1000):.016;lastTs=ts;
  if(Math.abs(FOCUS.k-FOCUS.tk)>0.002){FOCUS.k+=(FOCUS.tk-FOCUS.k)*Math.min(1,dt*7);fitDirty=true}
  else if(FOCUS.k!==FOCUS.tk){FOCUS.k=FOCUS.tk;fitDirty=true}
  if(fitDirty){computeFit();fitDirty=false}
  var now=(performance.now()-t0)/1000;
  var w=canvas.width/DPR,h=canvas.height/DPR;
  ctx.clearRect(0,0,w,h);
  var grad=ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,'#0b0908');grad.addColorStop(.5,'#171210');grad.addColorStop(1,'#241b13');
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);

  quad(-28,-14,LW+28,LH+14,0,'#241708');
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
    var wood=((c+r)%2===0)?'#a8794e':'#9c6f45';
    var x0=c*TILE,y0=r*TILE;
    quad(x0,y0,x0+TILE,y0+TILE,0,wood);
    if(state){
      var z=zoneOf(c,r,state.offense);
      if(z){var tint=z.z==='layup'?'rgba(111,191,115,.20)':z.z==='mid'?'rgba(232,184,75,.16)':'rgba(213,82,75,.14)';
        quad(x0,y0,x0+TILE,y0+TILE,0,tint);}
    }
  }
  ctx.strokeStyle='rgba(20,10,4,.35)';ctx.lineWidth=1;
  for(var c2=0;c2<=COLS;c2++)line(c2*TILE,0,c2*TILE,LH);
  for(var r2=0;r2<=ROWS;r2++)line(0,r2*TILE,LW,r2*TILE);
  ctx.strokeStyle='rgba(244,236,220,.55)';ctx.lineWidth=2.5;
  line(0,0,LW,0);line(LW,0,LW,LH);line(LW,LH,0,LH);line(0,LH,0,0);
  line(LW/2,0,LW/2,LH);
  circle(LW/2,LH/2,52);
  /* chess-style coordinates: letters across, numbers up the sides —
     call "C to E4!" (voice mode someday) */
  if(!(window.BKAudio&&BKAudio.settings.coords===false)){
  ctx.fillStyle='rgba(244,236,220,.42)';
  ctx.font='700 '+Math.max(8,Math.round(10*fit.s))+'px ui-monospace,Menlo,monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(var lc=0;lc<COLS;lc++){
    var lch=String.fromCharCode(65+lc);
    var pT=proj((lc+0.5)*TILE,-15,0),pB=proj((lc+0.5)*TILE,LH+15,0);
    ctx.fillText(lch,pT.x,pT.y);ctx.fillText(lch,pB.x,pB.y);
  }
  for(var lr=0;lr<ROWS;lr++){
    var pLe=proj(-30,(lr+0.5)*TILE,0),pRi=proj(LW+30,(lr+0.5)*TILE,0);
    ctx.fillText(lr+1,pLe.x,pLe.y);ctx.fillText(lr+1,pRi.x,pRi.y);
  }
  }
  /* whose hoop is whose: each rim wears its attacker's color, always */
  if(state&&!MODE.half){
    ctx.lineWidth=3.5;
    ctx.strokeStyle='rgba(245,135,46,.5)';line(LW,0,LW,LH);
    ctx.strokeStyle='rgba(88,168,214,.5)';line(0,0,0,LH);
    [[RIM_R,'rgba(245,135,46,.15)'],[RIM_L,'rgba(88,168,214,.15)']].forEach(function(RA){
      var gp3=proj(RA[0][0],RA[0][1],0);
      ctx.fillStyle=RA[1];
      ctx.beginPath();ctx.ellipse(gp3.x,gp3.y,30*fit.s,12*fit.s,0,0,7);ctx.fill();
    });
  }
  /* which way am I attacking? the target rim glows in your color */
  if(state){
    var arim=attackedRim(state.offense);
    var gp2=proj(arim[0],arim[1],0);
    var pulse=0.22+0.12*Math.sin(now*3);
    ctx.fillStyle=(state.offense===0?'rgba(245,135,46,':'rgba(88,168,214,')+pulse+')';
    ctx.beginPath();ctx.ellipse(gp2.x,gp2.y,26*fit.s,10*fit.s,0,0,7);ctx.fill();
  }

  if(state&&state.selected!=null&&
     (state.phase==='off-move'||state.phase==='def-slide'||state.phase==='inbound-move')){
    var sel=state.pieces[state.selected];
    var range=state.phase==='def-slide'?defSlideRange(sel):sel.range;
    var isCar=state.phase==='off-move'&&state.selected===state.ball.holder;
    for(var rr=0;rr<ROWS;rr++)for(var cc=0;cc<COLS;cc++){
      var d=Math.max(Math.abs(cc-sel.c),Math.abs(rr-sel.r));
      if(d>0&&d<=range&&pieceAt(cc,rr)===-1){
        if(isCar&&state.front&&!inFront(state.offense,cc,rr)){
          quad(cc*TILE+3,rr*TILE+3,(cc+1)*TILE-3,(rr+1)*TILE-3,0,'rgba(96,22,16,.42)');
          continue; /* backcourt: dark red = legal tap, but it's a turnover */
        }
        var col;
        if(state.phase==='def-slide')col='rgba(88,168,214,.38)';
        else if(isCar&&driveChallenge(sel.c,sel.r,cc,rr,state.offense)>=0){
          var dd2=Math.max(Math.abs(cc-sel.c),Math.abs(rr-sel.r));
          col=dd2>=3?'rgba(168,32,58,.62)':'rgba(213,82,75,.45)'; /* darker = DEEP cross */
        }
        else col='rgba(245,135,46,.38)';
        quad(cc*TILE+3,rr*TILE+3,(cc+1)*TILE-3,(rr+1)*TILE-3,0,col);
      }
    }
  }
  if(state&&state.staged&&state.staged.tile){
    var stT=state.staged.tile;
    quad(stT[0]*TILE+3,stT[1]*TILE+3,(stT[0]+1)*TILE-3,(stT[1]+1)*TILE-3,0,
      'rgba(255,255,255,'+(0.24+0.14*Math.sin(now*6))+')');
  }

  var draws=[];
  if(!MODE.half)draws.push({z:rawProj(-24,LH/2,0).z, fn:function(){drawGoal(-1)}});
  draws.push({z:rawProj(LW+24,LH/2,0).z, fn:function(){drawGoal(1)}});
  state&&state.pieces.forEach(function(p,i){
    var dp=drawnPos(p);
    draws.push({z:rawProj(dp.x,dp.y,0).z, fn:(function(p,i,dp){return function(){
      var spr=p.spr||SPRITES[p.team+p.pos];
      var ptF=proj(dp.x,dp.y,0), ptH=proj(dp.x,dp.y,dp.h);
      var bob=p.anim?0:Math.sin(now*2.4+i)*1.5;
      var scl=ptF.s*0.62;
      var sw=120*scl,sh=170*scl;
      ctx.fillStyle='rgba(0,0,0,.35)';
      ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,20*scl*2,7*scl*2,0,0,7);ctx.fill();
      if(state.selected===i){
        ctx.strokeStyle=p.team===0?'#f5872e':'#58a8d6';ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,24*scl*2,9*scl*2,0,0,7);ctx.stroke();
      }
      if(state.staged&&state.staged.kind==='pass'&&state.staged.toIdx===i){
        ctx.strokeStyle='rgba(255,255,255,'+(0.6+0.3*Math.sin(now*6))+')';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,27*scl*2,10*scl*2,0,0,7);ctx.stroke();
      }
      ctx.drawImage(spr,ptH.x-sw/2,ptH.y-sh+bob,sw,sh);
      if(state.ball.holder===i&&!state.ball.fly){
        drawBall(ptH.x+16*scl*2,ptH.y-24*scl*2+bob,8*Math.max(.6,scl*2));
      }
    }})(p,i,dp)});
  });
  if(state&&state.ball.fly){
    var f=state.ball.fly;
    draws.push({z:rawProj(f.x,f.y,f.h).z-1,fn:(function(f){return function(){
      var pt=proj(f.x,f.y,f.h);
      drawBall(pt.x,pt.y,8*Math.max(.6,pt.s));
    }})(f)});
  }
  draws.sort(function(a,b){return a.z-b.z});
  draws.forEach(function(d){d.fn()});

  if(meter&&!meter.done)meter.el.style.left=(meterPos()*100)+'%';
  var ckEl=g('shotclock');
  if(state&&clockTickable()){
    var ck=state.clock;
    ck.t-=dt;
    var disp=Math.max(0,Math.ceil(ck.t));
    ckEl.style.display='block';
    ckEl.textContent=':'+(disp<10?'0':'')+disp;
    ckEl.classList.toggle('hot',ck.t<=5);
    if(ck.t<=5&&ck.t>0&&disp!==ck.warned){ck.warned=disp;if(window.BKAudio)BKAudio.sfx('tap');}
    if(ck.t<=0){var kk=ck.kind;ck.kind=null;ckEl.style.display='none';clockExpire(kk);}
  }else if(ckEl.style.display!=='none')ckEl.style.display='none';

  /* advance animations */
  if(state){
    var doneCb=null,animating=false;
    state.pieces.forEach(function(p){
      if(p.anim){
        p.anim.t+=dt/p.anim.dur;
        if(p.anim.t>=1){delete p.anim;doneCb=state.animCb;state.animCb=null}
        else animating=true;
      }
    });
    if(doneCb)doneCb();
    if(state.ball.fly){
      var f2=state.ball.fly;
      f2.t+=dt/f2.dur;
      if(f2.t>=1){var cb=f2.done;state.ball.fly=null;cb&&cb();}
      else{
        f2.x=f2.x0+(f2.x1-f2.x0)*f2.t;
        f2.y=f2.y0+(f2.y1-f2.y0)*f2.t;
        f2.h=f2.h0+(f2.h1-f2.h0)*f2.t+Math.sin(Math.PI*f2.t)*f2.peak;
      }
    }
  }
  requestAnimationFrame(render);
}
function quad(x0,y0,x1,y1,h,fill){
  var a=proj(x0,y0,h),b=proj(x1,y0,h),c=proj(x1,y1,h),d=proj(x0,y1,h);
  ctx.fillStyle=fill;ctx.beginPath();
  ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);
  ctx.closePath();ctx.fill();
}
function line(x0,y0,x1,y1){var a=proj(x0,y0,0),b=proj(x1,y1,0);
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
function circle(lx,ly,rad){
  ctx.beginPath();
  for(var i=0;i<=36;i++){var a=i/36*2*Math.PI;
    var p=proj(lx+Math.cos(a)*rad,ly+Math.sin(a)*rad,0);
    i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}
  ctx.stroke();
}
function drawBall(x,y,r){
  var gr=ctx.createRadialGradient(x-r*.3,y-r*.35,r*.2,x,y,r);
  gr.addColorStop(0,'#ffb976');gr.addColorStop(.6,'#ef8330');gr.addColorStop(1,'#8a430c');
  ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
  ctx.strokeStyle='rgba(60,25,5,.7)';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke();
}
function drawGoal(side){
  var bx=side<0?-24:LW+24, rx=side<0?RIM_L[0]:RIM_R[0], cy=LH/2;
  var pb=proj(bx,cy,0),pt=proj(bx,cy,52);
  ctx.strokeStyle='#55555b';ctx.lineWidth=Math.max(2,4*pb.s);
  ctx.beginPath();ctx.moveTo(pb.x,pb.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();
  var c1=proj(bx,cy-34,34),c2=proj(bx,cy+34,34),c3=proj(bx,cy+34,78),c4=proj(bx,cy-34,78);
  ctx.fillStyle='rgba(232,235,240,.92)';
  ctx.beginPath();ctx.moveTo(c1.x,c1.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(c3.x,c3.y);ctx.lineTo(c4.x,c4.y);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='#2c2c30';ctx.lineWidth=2;ctx.stroke();
  var s1=proj(bx,cy-11,40),s2=proj(bx,cy+11,40),s3=proj(bx,cy+11,58),s4=proj(bx,cy-11,58);
  ctx.strokeStyle=MODE.half?'#c9641a':(side>0?'#c9641a':'#3f7f9c');ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(s1.x,s1.y);ctx.lineTo(s2.x,s2.y);ctx.lineTo(s3.x,s3.y);ctx.lineTo(s4.x,s4.y);
  ctx.closePath();ctx.stroke();
  ctx.strokeStyle='#f5872e';ctx.lineWidth=3;
  ctx.beginPath();
  for(var i=0;i<=24;i++){var a=i/24*2*Math.PI;
    var p=proj(rx+Math.cos(a)*11,cy+Math.sin(a)*11,RIM_H);
    i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}
  ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.2;
  for(var k=0;k<6;k++){var a2=k/6*2*Math.PI;
    var top=proj(rx+Math.cos(a2)*10,cy+Math.sin(a2)*10,RIM_H);
    var bot=proj(rx+Math.cos(a2)*4,cy+Math.sin(a2)*4,RIM_H-18);
    ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.lineTo(bot.x,bot.y);ctx.stroke();
  }
  if(!MODE.half){
    var tp=proj(bx,cy,100);
    ctx.fillStyle=side>0?'rgba(245,135,46,.9)':'rgba(88,168,214,.9)';
    ctx.font='800 '+Math.max(9,Math.round(10.5*fit.s))+'px ui-monospace,Menlo,monospace';
    ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText(side>0?'ORANGE SCORES HERE':'BLUE SCORES HERE',tp.x,tp.y);
  }
}

/* ========== input: drag rotates, tap selects ========== */
var drag=null,fitDirty=false,ptrs={},pinch=null,ZOOM=1;
canvas.addEventListener('pointerdown',function(ev){
  ptrs[ev.pointerId]={x:ev.clientX,y:ev.clientY};
  if(canvas.setPointerCapture)try{canvas.setPointerCapture(ev.pointerId)}catch(e){}
  var ids=Object.keys(ptrs);
  if(ids.length===2){
    /* second finger down = pinch; kill any tap/drag in progress */
    var a=ptrs[ids[0]],b=ptrs[ids[1]];
    pinch={ids:ids,d0:Math.max(24,Math.hypot(a.x-b.x,a.y-b.y)),z0:ZOOM};
    drag=null;
  }else if(ids.length===1&&!pinch){
    drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,rz:RZ,moved:false};
  }
});
canvas.addEventListener('pointermove',function(ev){
  var pt=ptrs[ev.pointerId];
  if(pt){pt.x=ev.clientX;pt.y=ev.clientY}
  if(pinch){
    var a=ptrs[pinch.ids[0]],b=ptrs[pinch.ids[1]];
    if(a&&b){
      var d=Math.hypot(a.x-b.x,a.y-b.y);
      ZOOM=Math.max(0.75,Math.min(1.6,pinch.z0*d/pinch.d0));
      fitDirty=true;
    }
    return;
  }
  if(!drag||ev.pointerId!==drag.id)return;
  var dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)>14)drag.moved=true;  /* jitter-proof taps */
  if(drag.moved){RZ=drag.rz-dx*0.005;fitDirty=true;}
});
function liftPtr(ev){
  var wasPinch=pinch&&pinch.ids.indexOf(String(ev.pointerId))>=0;
  delete ptrs[ev.pointerId];
  if(wasPinch){pinch=null;drag=null}
  return wasPinch;
}
canvas.addEventListener('pointerup',function(ev){
  if(liftPtr(ev))return;
  if(!drag||ev.pointerId!==drag.id)return;
  var wasDrag=drag.moved;drag=null;
  if(wasDrag)return;
  if(!state||state.phase==='shooting'||state.phase==='anim'||state.phase==='tip'||state.ball.fly)return;
  var rect=canvas.getBoundingClientRect();
  tapAt(ev.clientX-rect.left,ev.clientY-rect.top);
});
canvas.addEventListener('pointercancel',function(ev){
  liftPtr(ev);
  if(drag&&ev.pointerId===drag.id)drag=null;
});
function tapAt(px,py){
  var best=-1,bd=1e9;
  state.pieces.forEach(function(p,i){
    var tc=tileCenter(p.c,p.r),pt=proj(tc[0],tc[1],0);
    var d=Math.hypot(px-pt.x,py-(pt.y-16));
    if(d<bd){bd=d;best=i}
  });
  var bt=null,btd=1e9;
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
    var tc2=tileCenter(c,r),pt2=proj(tc2[0],tc2[1],0);
    var d2=Math.hypot(px-pt2.x,py-pt2.y);
    if(d2<btd){btd=d2;bt=[c,r]}
  }
  var pa=proj(bt[0]*TILE+TILE/2,bt[1]*TILE+TILE/2,0);
  var pb=proj((bt[0]+1)*TILE+TILE/2,bt[1]*TILE+TILE/2,0);
  var pitch=Math.hypot(pa.x-pb.x,pa.y-pb.y);
  handleTap({pi:best,pd:bd,tile:bt,td:btd,pitch:pitch});
}
function legalMove(sel,range,c,r){
  var d=Math.max(Math.abs(c-sel.c),Math.abs(r-sel.r));
  return d>0&&d<=range&&pieceAt(c,r)===-1;
}
function handleTap(o){
  if(NET.frozen)return;            /* game is held (reconnecting) */
  if(NET.on&&!myAction())return;   /* not your turn, not your taps */
  var ph=state.phase;
  var pieceR=Math.min(30,Math.max(17,o.pitch*0.55)); /* finger-sized floor */
  var tileR=o.pitch*0.66;
  var hitPiece=o.pd<pieceR?o.pi:-1;
  var pieceWins=hitPiece>=0&&o.pd<=o.td;
  if(ph==='off-select'||ph==='off-move'){
    if(pieceWins&&state.pieces[hitPiece].team===state.offense){
      if(ph==='off-move'&&state.selected===state.ball.holder&&hitPiece!==state.selected){
        stageAction({kind:'pass',toIdx:hitPiece});return;
      }
      state.selected=hitPiece;state.phase='off-move';
      offerActions();return;
    }
    if(ph==='off-move'&&state.selected!=null&&o.td<tileR){
      var sel=state.pieces[state.selected];
      if(legalMove(sel,sel.range,o.tile[0],o.tile[1])){stageAction({kind:'move',tile:o.tile});return}
    }
    if(hitPiece>=0&&state.pieces[hitPiece].team===state.offense){
      if(ph==='off-move'&&state.selected===state.ball.holder&&hitPiece!==state.selected){
        stageAction({kind:'pass',toIdx:hitPiece});return;
      }
      state.selected=hitPiece;state.phase='off-move';
      offerActions();return;
    }
    if(ph==='off-move'&&state.selected!=null&&o.tile){
      var s2=state.pieces[state.selected];
      if(legalMove(s2,s2.range,o.tile[0],o.tile[1])){stageAction({kind:'move',tile:o.tile});return}
    }
    if(ph==='off-move'&&state.selected!=null){
      /* tapped away from the action — release the player, pull the camera out */
      state.selected=null;state.staged=null;state.phase='off-select';
      clearFocus();stagebox('');
      banner('<b>'+teamName(state.offense)+' ball.</b> Tap one of your players.');
      actions('<span class="note">Tap a player to act</span>');
      return;
    }
  }
  else if(ph==='inbound'){
    if(hitPiece>=0&&state.pieces[hitPiece].team===state.offense&&hitPiece!==state.ball.holder){
      stageAction({kind:'pass',toIdx:hitPiece});return;
    }
  }
  else if(ph==='inbound-move'){
    if(hitPiece>=0&&state.pieces[hitPiece].team===state.offense&&hitPiece!==state.ball.holder){
      state.selected=hitPiece;
      banner('<b>Position the cutter:</b> tap a lit tile.');
      return;
    }
    if(state.selected!=null&&o.tile&&o.td<tileR){
      var sp=state.pieces[state.selected];
      if(legalMove(sp,sp.range,o.tile[0],o.tile[1])){
        stageAction({kind:'cut',tile:o.tile});return;
      }
    }
  }
  else if(ph==='def-slide'){
    if(pieceWins&&state.pieces[hitPiece].team!==state.offense){
      state.selected=hitPiece;offerActions();return;
    }
    if(state.selected!=null&&o.tile&&o.td<tileR){
      var sd=state.pieces[state.selected];
      if(legalMove(sd,defSlideRange(sd),o.tile[0],o.tile[1])){
        stageAction({kind:'slide',tile:o.tile});return;
      }
      var whyR=defSlideRange(sd);
      banner('<b>Can’t.</b> '+(pieceAt(o.tile[0],o.tile[1])!==-1?'That square is occupied. ':'Too far — ')+
        (sd.short||sd.pos)+' slides up to '+whyR+(whyR>1?' squares':' square')+' on defense.');
      return;
    }
    if(hitPiece>=0&&state.pieces[hitPiece].team!==state.offense){
      state.selected=hitPiece;offerActions();return;
    }
    if(state.selected!=null&&o.tile){
      var sd2=state.pieces[state.selected];
      if(legalMove(sd2,defSlideRange(sd2),o.tile[0],o.tile[1])){
        stageAction({kind:'slide',tile:o.tile});return;
      }
      state.selected=null;clearFocus();
      banner('<b>'+teamName(1-state.offense)+' defense:</b> slide one defender — or stay put.');
      return;
    }
  }
}
/* ---------- mid-screen prompt box + event callouts ---------- */
function stagebox(html,force){
  if(html&&!force&&NET.on&&state&&!myAction())
    html='<div class="stitle">⏳ '+teamName(actingTeam())+' is on the move…</div>';
  var el=g('stagebox');
  el.innerHTML=html||'';
  el.classList.toggle('on',!!html);
}
function teamCol(t){return t===0?'#f5872e':'#58a8d6'}
function callout(html,color){
  var el=g('callout');
  el.innerHTML=html;
  el.style.color=color||'#efe6d8';
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
}
/* winning a crossover still costs a step: land one square short when there's room */
function crossLanding(mover,tile){
  var p=state.pieces[mover];
  var dc=tile[0]-p.c,dr=tile[1]-p.r;
  if(Math.max(Math.abs(dc),Math.abs(dr))<=1)return tile;
  var lc=tile[0]-Math.sign(dc),lr=tile[1]-Math.sign(dr);
  if((lc===p.c&&lr===p.r)||pieceAt(lc,lr)!==-1)return tile;
  return [lc,lr];
}

/* ---------- confirm step: touch is sensitive, moves are final ---------- */
function coordName(c,r){return String.fromCharCode(65+c)+(r+1)}
function stagedViolation(a){
  if(MODE.half||!state.front)return false;
  if(a.kind==='move'&&state.selected===state.ball.holder)
    return !inFront(state.offense,a.tile[0],a.tile[1]);
  if(a.kind==='pass'){
    var to=state.pieces[a.toIdx];
    return !inFront(state.offense,to.c,to.r);
  }
  return false;
}
function stageAction(a){
  state.staged=a;
  /* tapping a teammate can mean two things — so we ask */
  var choice=a.kind==='pass'&&state.phase==='off-move';
  var t;
  if(a.kind==='pass')t='Pass to '+(state.pieces[a.toIdx].short||state.pieces[a.toIdx].pos);
  else if(a.kind==='move'){
    t='Move to '+coordName(a.tile[0],a.tile[1]);
    if(state.selected===state.ball.holder){
      var selp=state.pieces[state.selected];
      var dP=driveChallenge(selp.c,selp.r,a.tile[0],a.tile[1],state.offense);
      if(dP>=0){
        var dist=Math.max(Math.abs(a.tile[0]-selp.c),Math.abs(a.tile[1]-selp.r));
        t+=' · '+(dist>=3?'DEEP CROSSOVER':'crossover')+' vs '+
          (state.pieces[dP].short||state.pieces[dP].pos);
      }
    }
  }
  else if(a.kind==='slide')t='Slide to '+coordName(a.tile[0],a.tile[1]);
  else t='Send the cutter to '+coordName(a.tile[0],a.tile[1]);
  stagebox('<div class="stitle">'+t+'</div>'+
    (stagedViolation(a)?'<div class="swarn">⚠️ Backcourt — turnover if you do it!</div>':'')+
    '<div class="row"><button class="bigbtn" id="aGo">'+(a.kind==='pass'?'Pass ✓':'Confirm ✓')+'</button>'+
    (choice?'<button class="bigbtn ghost" id="aSel">Move him ▸</button>':'')+
    '<button class="bigbtn ghost" id="aNo">Cancel ✗</button></div>');
  g('aGo').addEventListener('click',commitStaged);
  g('aNo').addEventListener('click',cancelStaged);
  var sb=g('aSel');
  if(sb)sb.addEventListener('click',function(){
    if(!state.staged)return;
    var to=state.staged.toIdx;state.staged=null;
    state.selected=to;offerActions();
  });
  actions('<span class="note">'+(choice?'Pass it — or move him instead':'Lock it in, or cancel')+'</span>');
  banner('<b>'+t+'</b> — confirm?');
}
function cancelStaged(){
  if(!state.staged)return;
  var a=state.staged;state.staged=null;
  if(state.phase==='inbound'){
    banner('<b>'+teamName(state.offense)+' inbounds.</b> Pass it in — tap a teammate.');
    inboundActions();return;
  }
  if(a.kind==='cut'){
    banner('<b>Position the cutter:</b> tap a lit tile.');
    stagebox('');
    actions('<span class="note">Tap a teammate to reposition</span>');return;
  }
  offerActions();
}
function commitStaged(){
  if(!state.staged)return;
  var a=state.staged;state.staged=null;
  var ev={a:'act',k:a.kind,tile:a.tile||null,toIdx:(a.toIdx!=null?a.toIdx:null),sel:state.selected};
  netEv(ev);
  applyAct(ev);
}
function applyAct(ev){
  state.staged=null;
  state.selected=ev.sel;
  if(ev.k==='move')doMove(ev.tile);
  else if(ev.k==='pass')doPass(ev.toIdx);
  else if(ev.k==='slide'){
    var sp2=state.pieces[state.selected];
    recordPlay([{k:'hop',i:state.selected,from:[sp2.c,sp2.r],to:[ev.tile[0],ev.tile[1]]}]);
    clearFocus();
    movePieceAnim(state.selected,ev.tile[0],ev.tile[1],0.28,endDefSlide);
  }
  else if(ev.k==='cut'){
    state.inbMoved=true;
    var cp2=state.pieces[state.selected];
    recordPlay([{k:'hop',i:state.selected,from:[cp2.c,cp2.r],to:[ev.tile[0],ev.tile[1]]}]);
    clearFocus();
    movePieceAnim(state.selected,ev.tile[0],ev.tile[1],0.3,function(){
      state.selected=null;
      state.phase='def-slide';
      clockStart('def');
      banner('<b>Cutter set.</b> '+teamName(1-state.offense)+': slide one defender — or stay put.');
      stagebox('<button class="bigbtn ghost" id="aSkip">Stay put ▸</button>');
      var sk=g('aSkip');if(sk)sk.addEventListener('click',skipEmit);
      actions('<span class="note">Defense — tap a defender to slide</span>');
    });
  }
}
function skipEmit(){netEv({a:'stayput'});endDefSlide()}
function stealEmit(i){netEv({a:'steal',def:i});startStealTry(i)}
function startStealTry(i){
  /* the on-ball steal: your card, then his card, then hands (uses your slide) */
  state.selected=null;clearFocus();
  var d=state.pieces[i];
  var t=({PG:2,SG:2,SF:3,PF:3,C:3})[d.pos];
  pending={type:'stealtry',def:i};
  banner('<b>'+teamName(d.team)+'</b> goes in for the steal!');
  showCard(t,'RIP IT','Go in for the steal',
    d.pos==='C'?'Big mitts, slow mitts':'Quick hands eat',true);
}
function shootEmit(){netEv({a:'shoot',sel:state.selected});doShoot()}
function offerActions(){
  state.staged=null;
  var sel=state.pieces[state.selected];
  var tcF=tileCenter(sel.c,sel.r);
  setFocus(tcF[0],tcF[1]);
  if(state.phase==='def-slide'){
    var rng=defSlideRange(sel);
    var rim0=defendedRim(sel.team),tc0=tileCenter(sel.c,sel.r);
    var deep0=Math.hypot(tc0[0]-rim0[0],tc0[1]-rim0[1])>LW*0.52;
    var hold=state.pieces[state.ball.holder];
    var canSteal=sel.team!==hold.team&&
      Math.max(Math.abs(sel.c-hold.c),Math.abs(sel.r-hold.r))<=1;
    stagebox((canSteal?'<button class="bigbtn" id="aSteal">🖐 Go for the steal</button>':'')+
      '<button class="bigbtn ghost" id="aSkip">Stay put ▸</button>');
    var sk2=g('aSkip');if(sk2)sk2.addEventListener('click',skipEmit);
    var stl=g('aSteal');
    if(stl)stl.addEventListener('click',function(){stealEmit(state.selected)});
    actions('<span class="note">Tap a lit tile to slide '+(sel.short||sel.pos)+
      (canSteal?' · or reach for the rock':'')+'</span>');
    banner('<b>'+teamName(1-state.offense)+' defense:</b> '+(sel.short||sel.pos)+
      (deep0?' is deep — <b>sprint back</b> up to '+rng+' tiles.':
       ' slides up to '+rng+(rng>1?' tiles':' tile')+'.'));
    return;
  }
  var isCarrier=state.selected===state.ball.holder;
  if(isCarrier){
    var z=zoneOf(sel.c,sel.r,state.offense);
    if(z){
      stagebox('<button class="bigbtn shoot" id="aShoot">🏀 SHOOT · '+z.label+'</button>');
      var shb=g('aShoot');if(shb)shb.addEventListener('click',shootEmit);
    }else stagebox('');
    actions('<span class="note">Tap a lit tile to move · tap a teammate to pass'+(z?' · or LET IT FLY':'')+'</span>');
  }else{
    stagebox('');
    actions('<span class="note">Tap a lit tile to move '+sel.pos+'</span>');
  }
  banner('<b>'+teamName(state.offense)+':</b> '+(sel.short||sel.pos)+' ('+sel.pos+') at <b>'+
    String.fromCharCode(65+sel.c)+(sel.r+1)+'</b>.');
}

/* ========== actions ========== */
function flyBall(fromLxy,toLxy,h0,h1,peak,dur,done){
  state.ball.fly={x0:fromLxy[0],y0:fromLxy[1],x1:toLxy[0],y1:toLxy[1],
    x:fromLxy[0],y:fromLxy[1],h:h0,h0:h0,h1:h1,peak:peak,dur:dur,t:0,done:done};
}
function executeMove(i,tile,verb){
  var sel=state.pieces[i];
  recordPlay([{k:'hop',i:i,from:[sel.c,sel.r],to:[tile[0],tile[1]]}]);
  clearFocus();
  state.selected=null;
  var dd=Math.max(Math.abs(tile[0]-sel.c),Math.abs(tile[1]-sel.r));
  movePieceAnim(i,tile[0],tile[1],0.24+0.1*dd,function(){
    afterOffenseAction((sel.short||sel.pos)+' '+(verb||'moves.'));
  });
}
function doMove(tile){
  var i=state.selected;
  var sel=state.pieces[i];
  if(i===state.ball.holder&&state.front&&!inFront(state.offense,tile[0],tile[1])){
    backcourtViolation();return;
  }
  if(i===state.ball.holder){
    var def=driveChallenge(sel.c,sel.r,tile[0],tile[1],state.offense);
    if(def>=0){
      pending={type:'cross',tile:tile,land:crossLanding(i,tile),mover:i,def:def};
      var dist=Math.max(Math.abs(tile[0]-sel.c),Math.abs(tile[1]-sel.r));
      var deep=dist>=3;
      var ct=Math.min(3,{PG:1,SG:2,SF:2,PF:3,C:3}[sel.pos]+(deep?1:0));
      showCard(ct,deep?'DEEP CROSSOVER':'CROSSOVER','Beat your defender',
        sel.pos==='C'?'Big-man handles… good luck':(deep?'Carrying it far costs more':'Shake him'));
      return;
    }
    /* was a screen the reason it's clean? give the teamwork its shoutout */
    if(driveChallenge(sel.c,sel.r,tile[0],tile[1],state.offense,true)>=0){
      executeMove(i,tile,'uses the screen and drives!');
      return;
    }
  }
  executeMove(i,tile);
}
function doPass(toIdx){
  var from=state.pieces[state.ball.holder],to=state.pieces[toIdx];
  if(state.front&&!inFront(state.offense,to.c,to.r)){
    backcourtViolation();return;
  }
  if(state.phase==='inbound')state.inbPending=false;
  var d=Math.max(Math.abs(to.c-from.c),Math.abs(to.r-from.r));
  var f=tileCenter(from.c,from.r),t=tileCenter(to.c,to.r);
  var lane=laneDefenders(from.c,from.r,to.c,to.r,state.offense);
  /* ball pressure: a defender within a tile of the passer AND between him and
     the rim contests every forward / diagonal-forward pass — sideways and
     backward passes stay free */
  var rim=attackedRim(state.offense);
  var pRim=Math.hypot(f[0]-rim[0],f[1]-rim[1]),tRim2=Math.hypot(t[0]-rim[0],t[1]-rim[1]);
  var pressured=false;
  state.pieces.forEach(function(pp){
    if(pp.team===state.offense)return;
    if(Math.max(Math.abs(pp.c-from.c),Math.abs(pp.r-from.r))>1)return;
    var dc=tileCenter(pp.c,pp.r);
    if(Math.hypot(dc[0]-rim[0],dc[1]-rim[1])<pRim-TILE*0.2)pressured=true;
  });
  var fwd=tRim2<pRim-TILE*0.25;
  /* short passes, and medium passes with a CLEAN lane, are automatic —
     distance sets stakes, defenders set risk. Heaves are always hard. */
  if((d<=3||(d<=6&&lane===0))&&!(pressured&&fwd)){
    recordPlay([{k:'ball',from:f,to:t}]);
    clearFocus();
    state.phase='anim2';
    flyBall(f,t,26,26,d<=3?40:70,d<=3?0.5:0.6,function(){
      state.ball.holder=toIdx;
      afterOffenseAction((from.short||'')+
        (d<=3?' swings it to ':' whips it cross-court to ')+(to.short||to.pos)+
        (d>3?' — wide open!':'.'));
    });
    return;
  }
  var tier=d>6?3:2;
  var label=d>6?'Full-court heave':(pressured&&fwd&&d<=3?'Pressured dish':'Contested laser');
  pending={type:'pass',toIdx:toIdx,tier:tier,plabel:label};
  showCard(tier,label,'Complete the pass',
    d>6?'Near impossible':(label==='Pressured dish'?'A hand right in the passing lane':'A defender lurks in the lane'));
}
function backcourtViolation(){
  /* over and back: the whistle blows and it's simply the other team's ball.
     (An "easy mode" that BLOCKS illegal moves rides with the coach tutorial.) */
  state.staged=null;state.selected=null;clearFocus();
  callout('OVER &amp; BACK!<small>turnover — '+teamName(1-state.offense)+' ball</small>',teamCol(1-state.offense));
  if(window.BKAudio)BKAudio.sfx('buzzer');
  var side=state.offense===0?'L':'R';
  inbound(1-state.offense,side,'<b>OVER AND BACK!</b> Backcourt violation — turnover.');
}
function paintCheck(){
  /* offensive 3-in-the-key: any of your players camping the paint for 3 of
     your actions in a row = whistle, turnover */
  if(!state.paintCt||state.paintFor!==state.offense){
    state.paintCt={};state.paintFor=state.offense;
  }
  var rim=attackedRim(state.offense),vio=-1,warn=-1;
  state.pieces.forEach(function(p,i){
    if(p.team!==state.offense)return;
    var tc=tileCenter(p.c,p.r);
    if(Math.hypot(tc[0]-rim[0],tc[1]-rim[1])<=95){
      state.paintCt[i]=(state.paintCt[i]||0)+1;
      if(state.paintCt[i]>=3)vio=i;
      else if(state.paintCt[i]===2&&warn<0)warn=i;
    }else state.paintCt[i]=0;
  });
  return vio>=0?{vio:vio}:(warn>=0?{warn:warn}:null);
}
function afterOffenseAction(msg){
  clearFocus();
  var car=state.pieces[state.ball.holder];
  if(!MODE.half&&inFront(state.offense,car.c,car.r))state.front=true;
  var pc=paintCheck();
  if(pc&&pc.vio!=null){
    var vp=state.pieces[pc.vio];
    callout('3 IN THE KEY!<small>'+(vp.short||vp.pos)+' camped — turnover</small>',teamCol(1-state.offense));
    if(window.BKAudio)BKAudio.sfx('whistle');
    state.selected=null;state.staged=null;
    var vside=state.offense===0?'R':'L';
    inbound(1-state.offense,vside,'<b>THREE IN THE KEY!</b> '+(vp.short||vp.pos)+
      ' camped the paint — turnover.');
    return;
  }
  if(pc&&pc.warn!=null){
    var wp=state.pieces[pc.warn];
    msg+=' ⚠️ '+(wp.short||wp.pos)+' is camping the key (2 of 3)!';
  }
  state.selected=null;
  state.phase='def-slide';
  clockStart('def');
  banner('<b>'+msg+'</b> '+teamName(1-state.offense)+' defense: slide one defender — or stay put.');
  stagebox('<button class="bigbtn ghost" id="aSkip">Stay put ▸</button>');
  var sk1=g('aSkip');if(sk1)sk1.addEventListener('click',skipEmit);
  actions('<span class="note">'+teamName(1-state.offense)+' — tap a defender to slide</span>');
}
function inboundActions(){
  stagebox(state.inbMoved?'':'<button class="bigbtn ghost" id="aSetup">Set up a cutter</button>');
  actions('<span class="note">INBOUND — tap a teammate to pass it in</span>');
  var b=g('aSetup');
  if(b)b.addEventListener('click',function(){
    state.phase='inbound-move';
    stagebox('');
    banner('<b>Set the cutter:</b> tap a teammate, then a lit tile. (One setup move.)');
    actions('<span class="note">Tap a teammate to reposition</span>');
  });
}
function endDefSlide(){
  state.selected=null;
  stagebox('');clearFocus();
  clockStart('off');
  if(state.inbPending){
    state.phase='inbound';
    banner('<b>'+teamName(state.offense)+':</b> pass it in.');
    inboundActions();
    return;
  }
  state.phase='off-select';
  banner('<b>'+teamName(state.offense)+' ball.</b> Tap one of your players.');
  actions('<span class="note">Tap a player to act</span>');
}

/* ---------- the card ---------- */
var qTimer=null;
function leagueOk(q){
  var l=q.l||'any',lg=state?state.league:'nba';
  if(l==='any')return true;
  /* history/college facts are US-basketball canon — surface them in the
     domestic + world pools until they get their own selectable leagues */
  if(lg==='nba')return l==='nba'||l==='college'||l==='negro';
  if(lg==='big3')return l==='big3'||l==='nba'||l==='college';
  if(lg==='world')return l==='world'||l==='nba'||l==='negro';
  if(lg==='wnba')return l==='wnba'||l==='college';
  return l===lg;
}
function pickQuestion(tier,noFilter){
  var pool=[];
  for(var i=0;i<QUESTIONS.length;i++)
    if(QUESTIONS[i].t===tier&&(noFilter||leagueOk(QUESTIONS[i]))&&usedQ[tier].indexOf(i)<0)pool.push(i);
  if(!pool.length){
    usedQ[tier]=[];
    for(var j=0;j<QUESTIONS.length;j++)
      if(QUESTIONS[j].t===tier&&(noFilter||leagueOk(QUESTIONS[j])))pool.push(j);
    if(!pool.length)return pickQuestion(tier,true);
  }
  var idx=pool[Math.floor(Math.random()*pool.length)];
  usedQ[tier].push(idx);
  return QUESTIONS[idx];
}
function showCard(tier,stakeLabel,stakeText,subText,defense){
  state.phase='shooting';
  stagebox('');clearFocus();
  var owner=defense?1-state.offense:state.offense;
  if(NET.on&&owner!==NET.role){
    /* their card — you just get to sweat */
    banner('<b>'+teamName(owner)+'</b> is on the clock…');
    stagebox('<div class="stitle">🃏 '+teamName(owner)+' answering a '+
      (tier===1?'EASY':tier===2?'MEDIUM':'HARD')+' card…</div>',true);
    return;
  }
  var q=pickQuestion(tier);
  window.BK&&(window.BK._q=q);
  var tierName=tier===1?'Easy':tier===2?'Medium':'Hard';
  g('qcat').textContent=(defense?'🛡 DEFENSE · ':'')+q.cat;
  g('qtier').textContent=tierName+' · '+stakeLabel;
  g('qtier').style.background=defense?'#58a8d6':(tier===1?'#6fbf73':tier===2?'#e8b84b':'#d5524b');
  g('qchip').textContent=tierName;
  g('qchip').className='chip t'+tier;
  g('qstake').textContent=stakeText+(subText?' · '+subText:'');
  g('qtext').textContent=q.q;
  g('qresult').textContent='';g('qresult').className='result';
  var wrap=g('cardwrap');wrap.classList.remove('flipped');
  var order=[0,1,2,3].sort(function(){return Math.random()-.5});
  var ansEl=g('qanswers');ansEl.innerHTML='';
  order.forEach(function(oi){
    var b=document.createElement('button');
    b.className='ans';b.textContent=q.c[oi];
    b.addEventListener('click',function(){answer(oi===q.a,b,q)});
    ansEl.appendChild(b);
  });
  var tfill=g('qtimer');tfill.style.transition='none';tfill.style.width='100%';
  g('qveil').classList.add('on');
  g('cardfront').onclick=function(){
    wrap.classList.add('flipped');
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      tfill.style.transition='width 15s linear';tfill.style.width='0%';
    })});
    qTimer=setTimeout(function(){answer(false,null,q)},15000);
  };
}
function doShoot(){
  var sel=state.pieces[state.selected];
  var z=zoneOf(sel.c,sel.r,state.offense);
  if(!z)return;
  var defIdx=adjDefenderIdx(sel.c,sel.r,state.offense);
  /* contest QUALITY reads position: square in your chest (orthogonal) is a
     smother — your shot goes a tier up; a diagonal closeout leaves you
     cleaner, but the late angle makes HIS block card harder */
  var tight=false;
  if(defIdx>=0){
    var dpc=state.pieces[defIdx];
    tight=(dpc.c===sel.c||dpc.r===sel.r);
  }
  var eff=Math.min(3,z.tier+(defIdx>=0&&tight?1:0));
  var ctier=0;
  if(defIdx>=0){
    var dp=state.pieces[defIdx];
    ctier=z.z==='layup'?(dp.pos==='C'?1:2):(z.z==='mid'?2:3);
    if(!tight)ctier=Math.min(3,ctier+1);
  }
  pending={type:'shot',z:z,def:defIdx,ctier:ctier};
  showCard(eff,(defIdx>=0?(tight?'SMOTHERED · ':'CONTESTED · '):'')+z.pts+' pts',z.pts+' points',
    defIdx>=0?(tight?'Right in your chest':'Late closeout — a touch of daylight'):'');
}
function answer(correct,btn,q){
  if(qTimer){clearTimeout(qTimer);qTimer=null}
  netEv({a:'card',correct:!!correct});
  var els=document.querySelectorAll('.ans');
  els.forEach(function(e){e.disabled=true;
    if(e.textContent===q.c[q.a])e.classList.add('correct')});
  if(btn&&!correct)btn.classList.add('wrong');
  var res=g('qresult');
  var t=pending?pending.type:'shot';
  var GOOD={shot:'BUCKET INCOMING',pass:'THREADED',contest:'REJECTED!',cross:'HE BIT!',crossdef:'WALLED OFF',crosssteal:'PICKED CLEAN',stealtry:'HANDS HOT',stealdef:'ROCK PROTECTED'};
  var BAD={shot:'BRICK',pass:'SAILS AWAY',contest:'TOO SLOW — IT COUNTS',cross:'HE STUMBLES…',crossdef:'ANKLES GONE',crosssteal:'HANDS TOO SLOW',stealtry:'ALL REACH',stealdef:'RIPPED AWAY'};
  if(correct){res.textContent=GOOD[t];res.className='result good'}
  else{res.textContent=btn?BAD[t]:'CLOCK — '+BAD[t];res.className='result bad'}
  setTimeout(function(){
    g('qveil').classList.remove('on');
    resolvePending(correct);
  },1400);
}
function resolvePending(correct){
  var p=pending;pending=null;
  if(!p)return;
  if(p.type==='sd'){
    sd.answers[p.team]=correct;
    sd.asked++;
    if(sd.asked<2){setTimeout(sdNext,400);return}
    var a0=sd.answers[0],a1=sd.answers[1];
    if(a0!==a1){endGameSD(a0?0:1);return}
    sd.round++;sd.asked=0;sd.answers=[null,null];
    callout(a0?'BOTH SURVIVE!<small>round '+sd.round+'</small>':'BOTH MISSED!<small>round '+sd.round+'</small>');
    banner('<b>Round '+sd.round+'.</b>'+(sd.round>=2?' The cards go HARD now.':'')+' Sudden death continues.');
    setTimeout(sdNext,1600);
    return;
  }
  if(p.type==='shot'){
    if(!correct){resolveShot(false,p.z);return}
    var sp=p;
    startMeter({title:'RELEASE!',sub:'Tap at the top of the jump',cb:function(q){
      if(q==='shank'){
        banner('<b>Right answer, rushed release</b> — off the side of the iron!');
        resolveShot(false,sp.z);return;
      }
      if(sp.def>=0&&q!=='perfect'){
        var defTeam=1-state.offense;
        pending={type:'contest',z:sp.z,defPos:state.pieces[sp.def].pos};
        banner('<b>CONTESTED!</b> '+teamName(defTeam)+' — block this shot.');
        showCard(sp.ctier,'BLOCK IT',teamName(defTeam)+' defends','',true);
        return;
      }
      if(sp.def>=0)banner('<b>PERFECT RELEASE</b> — rises clean over the contest!');
      resolveShot(true,sp.z);
    }});
    return;
  }
  if(p.type==='contest'){
    if(correct){
      /* both answered right — settle it at the rim with a tap-off.
         Rim-protecting Centers get the edge on layups; otherwise the shooter. */
      var closer=(p.z.z==='layup'&&p.defPos==='C')?(1-state.offense):state.offense;
      var zz=p.z;
      startTapBattle({title:'AT THE RIM!',
        sub:'Shot vs block — tap it out! '+teamName(closer)+' has the edge',
        closer:closer,
        onWin:function(w){
          if(w===state.offense){banner('<b>THROUGH THE CONTACT!</b>');resolveShot(true,zz)}
          else{banner('<b>STUFFED AT THE SUMMIT!</b>');resolveShot(false,zz)}
        }});
    }
    else resolveShot(true,p.z);
    return;
  }
  if(p.type==='cross'){
    if(correct){
      /* the handle landed — now the DEFENDER answers to stay in front.
         Quick feet get an easier card; bigs on skates get a brutal one. */
      var dp2=state.pieces[p.def];
      var dt=({PG:2,SG:2,SF:2,PF:3,C:3})[dp2.pos];
      pending={type:'crossdef',mover:p.mover,tile:p.tile,land:p.land,def:p.def};
      banner('<b>HE BIT!</b> '+teamName(dp2.team)+' — stay in front.');
      showCard(dt,'STAY IN FRONT','Wall off the drive',
        dp2.pos==='C'?'Big man on skates — hang on':'Slide those feet',true);
    }else{
      /* the handle got loose — but a steal must be EARNED with a card too;
         miss it and the crossover is simply a wasted move */
      var d=state.pieces[p.def];
      var st=({PG:2,SG:2,SF:3,PF:3,C:3})[d.pos];
      pending={type:'crosssteal',mover:p.mover,def:p.def};
      banner('<b>HE STUMBLES!</b> '+teamName(d.team)+' — pick the pocket.');
      showCard(st,'PICK THE POCKET','Rip the loose handle',
        d.pos==='C'?'Big hands, slow hands':'Quick hands eat',true);
    }
    return;
  }
  if(p.type==='stealtry'){
    if(!correct){
      callout('REACHED!<small>nothing there</small>');
      banner('<b>All reach, no rock.</b> The gamble burns the defense’s slide.');
      endDefSlide();
      return;
    }
    var hd=state.pieces[state.ball.holder];
    var ht=({PG:1,SG:2,SF:2,PF:3,C:3})[hd.pos];
    pending={type:'stealdef',def:p.def};
    banner('<b>HANDS IN!</b> '+teamName(hd.team)+' — protect the rock.');
    showCard(ht,'PROTECT THE ROCK','Keep your dribble alive',
      hd.pos==='C'?'Big-man handles under fire':'Shake the reach');
    return;
  }
  if(p.type==='stealdef'){
    var sd3=p;
    var stealNow=function(){
      var d3=state.pieces[sd3.def];
      if(newPossession(d3.team))return;
      clockStart('off');
      state.ball.holder=sd3.def;
      state.offense=d3.team;
      state.front=!MODE.half&&inFront(d3.team,d3.c,d3.r);
      state.selected=null;state.phase='off-select';
      callout('RIPPED!',teamCol(d3.team));
      if(window.BKAudio)BKAudio.sfx('steal');
      banner('<b>RIPPED AWAY!</b> '+teamName(d3.team)+' — live ball.');
      actions('<span class="note">'+teamName(d3.team)+' — tap a player</span>');
    };
    if(!correct){stealNow();return}
    startTapBattle({title:'RIP OR GRIP!',
      sub:'Steal vs handle — tap it out! '+teamName(state.offense)+' has the edge',
      closer:state.offense,
      onWin:function(w){
        if(w===state.offense){
          callout('HELD ON!',teamCol(state.offense));
          banner('<b>Rock secured.</b> The reach cost the defense its slide.');
          endDefSlide();
        }else stealNow();
      }});
    return;
  }
  if(p.type==='crosssteal'){
    var dd=state.pieces[p.def];
    if(correct){
      if(newPossession(dd.team))return;
      clockStart('off');
      state.ball.holder=p.def;
      state.offense=dd.team;
      state.front=!MODE.half&&inFront(dd.team,dd.c,dd.r);
      state.selected=null;state.phase='off-select';
      callout('PICKED CLEAN!',teamCol(dd.team));
      if(window.BKAudio)BKAudio.sfx('steal');
      banner('<b>PICKED CLEAN!</b> '+teamName(dd.team)+' rips the handle — live ball.');
      actions('<span class="note">'+teamName(dd.team)+' — tap a player</span>');
    }else{
      callout('NO STEAL<small>move wasted</small>');
      afterOffenseAction((state.pieces[p.mover].short||'')+
        ' loses the handle but scoops it back up — the move is wasted.');
    }
    return;
  }
  if(p.type==='crossdef'){
    var mv=p;
    if(correct){
      /* both answered right — settle it with hands and feet */
      startTapBattle({title:'ANKLE BATTLE!',
        sub:'Handles vs feet — tap it out! '+teamName(state.offense)+' has the edge',
        closer:state.offense,
        onWin:function(w){
          var slow=mv.land[0]!==mv.tile[0]||mv.land[1]!==mv.tile[1];
          if(w===state.offense){
            callout('ANKLES!<small>he breaks free</small>',teamCol(state.offense));
            executeMove(mv.mover,mv.land,'FINALLY shakes loose'+(slow?' — a step short!':' and drives!'));
          }else{
            callout('LOCKED UP!',teamCol(1-state.offense));
            afterOffenseAction((state.pieces[mv.mover].short||'')+' gets walled off — nowhere to go.');
          }
        }});
    }else{
      var slow2=mv.land[0]!==mv.tile[0]||mv.land[1]!==mv.tile[1];
      callout('CROSSED HIM!',teamCol(state.offense));
      executeMove(mv.mover,mv.land,'leaves him grasping'+(slow2?' — the cross costs a step!':' at air!'));
    }
    return;
  }
  /* pass */
  var from=state.pieces[state.ball.holder],to=state.pieces[p.toIdx];
  var f=tileCenter(from.c,from.r),t=tileCenter(to.c,to.r);
  function completePass(perfect){
    recordPlay([{k:'ball',from:f,to:t}]);
    clearFocus();
    state.phase='anim2';
    flyBall(f,t,26,26,70,0.6,function(){
      state.ball.holder=p.toIdx;
      afterOffenseAction((perfect?'ON THE MONEY — ':'')+p.plabel+' finds '+(to.short||to.pos)+'!');
    });
  }
  function sailPass(msg){
    callout('OUT OF BOUNDS!<small>turnover</small>');
    state.phase='anim2';
    var dx=t[0]-f[0],dy=t[1]-f[1],len=Math.hypot(dx,dy)||1;
    var ox=t[0]+dx/len*80,oy=t[1]+dy/len*80;
    flyBall(f,[ox,oy],26,10,70,0.7,function(){
      var side=t[0]>LW/2?'R':'L';
      inbound(1-state.offense,side,msg);
    });
  }
  if(!correct){sailPass('<b>The '+p.plabel.toLowerCase()+' sails out of bounds!</b>');return}
  startMeter({title:'THREAD IT!',sub:'Tap to hit him in the hands',cb:function(q){
    if(q==='shank')sailPass('<b>Right read, bad delivery</b> — it skips out of bounds!');
    else completePass(q==='perfect');
  }});
}
function resolveShot(made,z){
  var sel=state.pieces[state.ball.holder];
  var f=tileCenter(sel.c,sel.r);
  var side=MODE.half?'R':(state.offense===0?'R':'L');
  var rim=attackedRim(state.offense);
  state.phase='anim2';
  flyBall(f,[rim[0],rim[1]],26,RIM_H+4,made?70:80,0.8,function(){
    if(made){
      state.score[state.offense]+=z.pts;
      g('ptsA').textContent=state.score[0];
      g('ptsB').textContent=state.score[1];
      if(state.score[state.offense]>=state.target){endGame();return}
      if(state.score[0]===state.score[1]&&state.score[0]>=state.target-1){
        startSuddenDeath();return;
      }
      callout('SPLASH!<small>+'+z.pts+' '+teamName(state.offense)+'</small>',teamCol(state.offense));
      if(window.BKAudio)BKAudio.sfx('net');
      inbound(1-state.offense,side,'<b>SPLASH! +'+z.pts+' '+teamName(state.offense)+'.</b>');
    }else{
      /* live miss — ball caroms off the rim into the rebound area */
      callout('OFF THE IRON!<small>live ball</small>');
      if(window.BKAudio)BKAudio.sfx('brick');
      var bx=rim[0]+(side==='R'?-1:1)*(40+Math.random()*50);
      var by=rim[1]+(Math.random()-0.5)*90;
      flyBall([rim[0],rim[1]],[bx,by],RIM_H+4,20,26,0.45,function(){
        reboundFlow(side);
      });
    }
  });
}

/* ---------- release meter: knowledge earns the look, touch finishes it ---------- */
var meter=null;
function startMeter(cfg){
  state.phase='meter';
  stagebox('');clearFocus();
  meter={t0:performance.now(),done:false,cb:cfg.cb,dur:1050,el:g('mmark')};
  var owner=state.offense;
  var box=document.querySelector('#meterveil .mbox');
  if(box)box.style.borderColor=teamCol(owner);
  g('mtitle').textContent=cfg.title;
  g('mtitle').style.color=teamCol(owner);
  var ms=g('msub');
  if(NET.on&&owner!==NET.role){
    /* opponent's touch — you just watch the marker land */
    meter.done=true;meter.remote=true;
    ms.textContent=teamName(owner)+' is timing it — hands off';ms.className='msub';
    g('meterveil').classList.add('on');
    return;
  }
  ms.textContent='🖐 '+teamName(owner).toUpperCase()+' ONLY — tap to lock · dead center = perfect';
  ms.className='msub';
  g('meterveil').classList.add('on');
  meter.timeout=setTimeout(function(){meter&&!meter.done&&gradeMeter(0)},3000);
}
function meterPos(){
  var e=(performance.now()-meter.t0)/meter.dur,k=e%2;
  return k<1?k:2-k;
}
function gradeMeter(pos){
  if(!meter||meter.done)return;
  meter.done=true;clearTimeout(meter.timeout);
  netEv({a:'meter',pos:pos});
  meterResolve(pos);
}
function meterResolve(pos){
  if(!meter)return;
  meter.done=true;
  meter.el.style.left=(pos*100)+'%';
  var off=Math.abs(pos-0.5);
  var q=off<=0.07?'perfect':(off<=0.36?'good':'shank');
  var ms=g('msub');
  ms.textContent=q==='perfect'?'BUTTER.':(q==='good'?'GOOD LOOK':'SHANKED IT');
  ms.className='msub '+(q==='shank'?'bad':'good');
  var cb=meter.cb;
  setTimeout(function(){
    g('meterveil').classList.remove('on');meter=null;cb(q);
  },650);
}
g('meterveil').addEventListener('pointerdown',function(){meter&&!meter.done&&gradeMeter(meterPos())});

/* ---------- shot clock: :24 to make your move, :12 to answer on D ---------- */
var CLK_OFF=24,CLK_DEF=12;
function clockStart(kind){
  if(!state)return;
  state.clock={t:kind==='off'?CLK_OFF:CLK_DEF,kind:kind,warned:-1};
}
function clockStop(){if(state)state.clock={t:0,kind:null,warned:-1}}
function clockTickable(){
  if(!state||!state.clock||!state.clock.kind)return false;
  var ph=state.phase;
  if(state.clock.kind==='off')
    return ph==='off-select'||ph==='off-move'||ph==='inbound'||ph==='inbound-move';
  return ph==='def-slide';
}
function clockExpire(kind){
  if(NET.on){
    var actor=kind==='off'?state.offense:1-state.offense;
    if(actor!==NET.role)return;   /* only the phone on the clock blows the whistle */
    netEv({a:'clockv',kind:kind});
  }
  applyClockV(kind);
}
function applyClockV(kind){
  if(kind==='off'){
    callout('24!<small>shot-clock violation — turnover</small>',teamCol(1-state.offense));
    if(window.BKAudio)BKAudio.sfx('buzzer');
    state.staged=null;state.selected=null;clearFocus();stagebox('');
    var side=state.offense===0?'R':'L';
    inbound(1-state.offense,side,'<b>SHOT CLOCK!</b> 24 seconds of nothing — turnover.');
  }else{
    callout('DEFENSE SLEEPS<small>play on</small>');
    if(window.BKAudio)BKAudio.sfx('whistle');
    endDefSlide();
  }
}
/* quarters: 6 possessions a quarter, 4 quarters, tie after Q4 = sudden death */
function updateQHud(){
  if(!state.qmode)return;
  g('hudMid').textContent='Q'+state.q+' · POSS '+state.qposs+'/6'+
    (NET.on?' · YOU ARE '+(NET.role===0?'ORANGE':'BLUE'):'');
}
function newPossession(team){
  if(!state.qmode){state.possTeam=team;return false}
  if(state.possTeam===team)return false;
  state.possTeam=team;
  state.qposs++;
  if(state.qposs>6){
    if(state.q>=4){
      clockStop();
      if(state.score[0]===state.score[1]){startSuddenDeath();return true}
      callout('FINAL BUZZER!<small>'+state.score[0]+'–'+state.score[1]+'</small>');
      if(window.BKAudio)BKAudio.sfx('horn');
      endGame();
      return true;
    }
    state.q++;state.qposs=1;
    callout('END OF Q'+(state.q-1)+'!<small>'+state.score[0]+'–'+state.score[1]+' · Q'+state.q+' up next</small>');
    if(window.BKAudio)BKAudio.sfx('buzzer');
  }
  updateQHud();
  return false;
}

/* ---------- rebounds ---------- */
function reboundFlow(side){
  var rim=side==='R'?RIM_R:RIM_L;
  var near={0:null,1:null};
  state.pieces.forEach(function(p,i){
    var tc=tileCenter(p.c,p.r),d=Math.hypot(tc[0]-rim[0],tc[1]-rim[1]);
    if(d<=REB_R&&(!near[p.team]||d<near[p.team].d))near[p.team]={i:i,d:d};
  });
  var o=state.offense,dTeam=1-o;
  if(!near[0]&&!near[1]){
    inbound(dTeam,side,'<b>Long rebound — off the iron and out of bounds!</b>');
    return;
  }
  if(near[0]&&!near[1]){grabBoard(0,near[0].i);return}
  if(near[1]&&!near[0]){grabBoard(1,near[1].i);return}
  var closer=(near[0].d<=near[1].d)?0:1;
  startTapBattle({title:'Crash the boards!',
    sub:teamName(closer)+' has the box-out position',closer:closer,
    onWin:function(w){banner('<b>'+teamName(w)+' rips it down!</b>');grabBoard(w,near[w].i)}});
}
function grabBoard(team,pieceIdx){
  if(newPossession(team))return;
  callout(teamName(team).toUpperCase()+' BOARD!',teamCol(team));
  state.ball.holder=pieceIdx;
  state.selected=null;
  clockStart('off');
  if(team===state.offense){
    state.phase='off-select';
    banner('<b>OFFENSIVE BOARD!</b> '+teamName(team)+' keeps the possession alive — go again.');
    actions('<span class="note">Second chance — tap a player</span>');
  }else{
    state.offense=team;
    var gp=state.pieces[pieceIdx];
    state.front=!MODE.half&&inFront(team,gp.c,gp.r);
    state.phase='off-select';
    banner('<b>'+teamName(team)+' cleans the glass.</b> Live ball — go!');
    actions('<span class="note">'+teamName(team)+' — tap a player</span>');
  }
}
function startTapBattle(cfg){
  stagebox('');
  battle={counts:[0,0],closer:cfg.closer,over:false,onWin:cfg.onWin};
  g('cntA').textContent='0';g('cntB').textContent='0';
  g('rtitle').textContent=cfg.title;
  g('rsub').textContent=cfg.sub;
  var rf=g('rfill');rf.style.transition='none';rf.style.width='100%';
  g('rebveil').classList.add('on');
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    rf.style.transition='width 2.5s linear';rf.style.width='0%';
  })});
  setTimeout(endBattle,2500);
}
function endBattle(){
  if(!battle||battle.over)return;
  if(NET.on&&NET.role!==0)return;   /* guest waits for the host's whistle */
  battle.over=true;
  var settle=function(){
    if(!battle)return;
    var s0=battle.counts[0]*(battle.closer===0?1.3:1);
    var s1=battle.counts[1]*(battle.closer===1?1.3:1);
    var winner=s0===s1?battle.closer:(s0>s1?0:1);
    netEv({a:'battle',w:winner});
    finishBattle(winner);
  };
  if(NET.on)setTimeout(settle,400);  /* grace for taps still in flight */
  else settle();
}
function finishBattle(w){
  g('rebveil').classList.remove('on');
  var b=battle;battle=null;
  if(b)b.onWin(w);
}
function battleTap(team){
  if(!battle||battle.over)return;
  if(NET.on&&NET.role!==team)return;  /* that side of the screen isn't yours */
  battle.counts[team]++;
  g(team===0?'cntA':'cntB').textContent=battle.counts[team];
  if(window.BKAudio)BKAudio.sfx('tap');
  netEv({a:'tap',team:team});
}
g('rzA').addEventListener('pointerdown',function(){battleTap(0)});
g('rzB').addEventListener('pointerdown',function(){battleTap(1)});

/* ---------- inbounding ---------- */
function inbound(team,side,msg){
  if(newPossession(team))return;
  state.offense=team;
  state.selected=null;
  state.front=false;state.inbMoved=false;state.inbPending=true;
  var col=MODE.half?0:(side==='R'?COLS-1:0);
  var mid=Math.floor(ROWS/2);
  var pg=-1;
  state.pieces.forEach(function(p,i){if(p.team===team&&p.pos==='PG')pg=i});
  var spots=[[col,mid],[col,mid-1],[col,mid+1],[col+(col===0?1:-1),mid]];
  var spot=null;
  for(var i=0;i<spots.length;i++){
    var occ=pieceAt(spots[i][0],spots[i][1]);
    if(occ===-1||occ===pg){spot=spots[i];break}
  }
  spot=spot||[col,3];
  state.ball.holder=pg;
  var p=state.pieces[pg];
  var dist=Math.max(Math.abs(spot[0]-p.c),Math.abs(spot[1]-p.r));
  banner(msg+' <b>'+teamName(team)+(MODE.half?' checks it up top.':' takes it out under the rim.')+'</b>');
  function armInbound(){
    state.phase='inbound';
    state.selected=null;
    clockStart('off');
    banner('<b>'+teamName(team)+' inbounds.</b> Pass it in — tap a teammate'+
      (state.inbMoved?'':' · or set up a cutter first')+'.');
    inboundActions();
  }
  if(dist===0){armInbound();return}
  movePieceAnim(pg,spot[0],spot[1],Math.min(0.9,0.2+dist*0.08),armInbound);
}

function endGame(){
  clockStop();markGame(false);
  var winner=state.score[0]===state.score[1]?1:(state.score[0]>state.score[1]?0:1);
  g('endTitle').textContent=teamName(winner)+' wins '+state.score[0]+'–'+state.score[1];
  g('endTitle').style.color=winner===0?'#f5872e':'#58a8d6';
  g('endLine').textContent='Ball knowledge don’t lie.';
  if(window.BKAudio)BKAudio.sfx('horn');
  g('endveil').classList.add('on');
}

/* ========== sudden death: tied at game point — pure ball knowledge ========== */
var sd=null;
function startSuddenDeath(){
  clockStop();
  sd={round:1,first:1-state.offense,answers:[null,null],asked:0};
  state.phase='shooting';
  state.selected=null;state.staged=null;stagebox('');clearFocus();
  callout('SUDDEN DEATH!<small>tied at '+state.score[0]+' — miss and it\u2019s over</small>','#d5524b');
  if(window.BKAudio)BKAudio.sfx('buzzer');
  banner('<b>SUDDEN DEATH.</b> Alternating cards until someone misses. Every answer is the season.');
  setTimeout(sdNext,1800);
}
function sdNext(){
  if(!sd)return;
  var team=sd.asked===0?sd.first:1-sd.first;
  state.offense=team;                    /* card ownership rides on offense */
  pending={type:'sd',team:team};
  var tier=sd.round>=2?3:2;
  showCard(tier,'SUDDEN DEATH','Round '+sd.round+' — answer to survive',
    sd.asked===0?'Scored on, so you answer first':'Match it — or take the crown');
}
function endGameSD(winner){
  callout('GAME OVER!<small>sudden death</small>',teamCol(winner));
  if(window.BKAudio)BKAudio.sfx('horn');
  g('endTitle').textContent=teamName(winner)+' wins in SUDDEN DEATH';
  g('endTitle').style.color=teamCol(winner);
  g('endLine').textContent='Tied at '+state.score[0]+' — settled by pure ball knowledge.';
  g('endveil').classList.add('on');
  sd=null;
}

/* ========== tip-off buzzer race ========== */
function runTipoff(){
  state.phase='tip';
  var q=pickQuestion(2);
  window.BK&&(window.BK._q=q);
  tip={q:q,buzz:-1};
  g('tipQ').textContent=q.q;
  g('tipAns').innerHTML='';
  g('tipMsg').textContent='First to buzz answers for the ball';
  g('tzA').classList.remove('lock');g('tzB').classList.remove('lock');
  if(NET.on)g(NET.role===0?'tzB':'tzA').classList.add('lock'); /* only YOUR buzzer */
  if(window.BKAudio)BKAudio.sfx('whistle');
  g('tipveil').classList.add('on');
}
function tipBuzz(team){
  if(!tip||tip.buzz>=0)return;
  tip.buzz=team;
  g('tipMsg').textContent=teamName(team).toUpperCase()+' BUZZED — answer it!';
  g('tzA').classList.add('lock');g('tzB').classList.add('lock');
  if(NET.on&&team!==NET.role)return;  /* their buzz, their sweat — you wait */
  var q=tip.q,order=[0,1,2,3].sort(function(){return Math.random()-.5});
  var el=g('tipAns');
  order.forEach(function(oi){
    var b=document.createElement('button');
    b.className='ans';b.textContent=q.c[oi];
    b.addEventListener('click',function(){netEv({a:'tip',ok:oi===q.a});tipAnswer(oi===q.a)});
    el.appendChild(b);
  });
}
function tipAnswer(ok){
  if(!tip)return;
  var winner=ok?tip.buzz:1-tip.buzz;
  tip=null;
  g('tipveil').classList.remove('on');
  callout(teamName(winner).toUpperCase()+' BALL<small>'+(ok?'won the tip':'missed it — other way')+'</small>',teamCol(winner));
  if(window.BKAudio)BKAudio.sfx(ok?'net':'buzzer');
  state.offense=winner;
  state.possTeam=winner;
  state.ball.holder=winner*MODE.lineup.length;  /* winner's PG */
  state.phase='off-select';
  clockStart('off');
  updateQHud();
  var pgName=state.pieces[state.ball.holder].short;
  banner((ok?'<b>WINS THE TIP!</b> ':'<b>Missed it — other way!</b> ')+
    teamName(winner)+' ball — '+pgName+' brings it up. Drag to rotate.');
  actions('<span class="note">'+teamName(winner)+' — tap a player</span>');
}
function buzzEmit(t){
  if(!tip||tip.buzz>=0)return;
  if(NET.on&&NET.role!==t)return;
  netEv({a:'buzz',team:t});
  tipBuzz(t);
}
g('tzA').addEventListener('pointerdown',function(){buzzEmit(0)});
g('tzB').addEventListener('pointerdown',function(){buzzEmit(1)});

/* ========== setup flow ========== */
var setupCfg={league:null,decade:null,target:11,rosters:null};
document.querySelectorAll('#screen-league .lgcard').forEach(function(b){
  b.addEventListener('click',function(){
    if(b.classList.contains('lab')){
      /* expansion league still cooking — give it a friendly rattle */
      b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');
      return;
    }
    setupCfg.league=b.getAttribute('data-league');
    if(Object.keys(ROSTERS[setupCfg.league]).length<=1){
      setupCfg.decade=['FULL'];afterEras();
    }else buildDecadeScreen();
  });
});
function buildDecadeScreen(){
  var grid=g('decadeGrid');grid.innerHTML='';
  var chips=[];
  var allB=document.createElement('button');
  function syncDec(){
    var sel=chips.filter(function(c){return c.classList.contains('sel')})
      .map(function(c){return c.getAttribute('data-era')});
    if(!sel.length){allB.classList.add('sel');setupCfg.decade=['FULL'];}
    else setupCfg.decade=sel;
  }
  Object.keys(ROSTERS[setupCfg.league]).forEach(function(k){
    var b=document.createElement('button');
    b.className='dchip';
    b.setAttribute('data-era',k);
    b.textContent='THE ’'+k+(k==='20s'?' · NOW':'');
    b.addEventListener('click',function(){
      b.classList.toggle('sel');
      allB.classList.remove('sel');
      syncDec();
    });
    chips.push(b);grid.appendChild(b);
  });
  allB.className='dchip full sel';
  allB.textContent='FULL KNOWLEDGE · ALL ERAS';
  allB.addEventListener('click',function(){
    chips.forEach(function(c){c.classList.remove('sel')});
    allB.classList.add('sel');syncDec();
  });
  grid.appendChild(allB);
  syncDec();
  g('decadeTitle').innerHTML=MODES[setupCfg.league].label+
    ' · mix your <span style="color:var(--accent)">eras</span>';
  show('decade');
}
g('btnDecGo').addEventListener('click',afterEras);
function afterEras(){
  if(NET.on){
    /* online: squads get picked by BOTH players after house rules */
    setupCfg.rosters=pickRosters(setupCfg.league,setupCfg.decade);
    show('rules');
    return;
  }
  buildSquadScreen();
}
function buildSquadScreen(){
  setupCfg.rosters=pickRosters(setupCfg.league,setupCfg.decade);
  [0,1].forEach(function(t){
    var el=g(t===0?'squadA':'squadB');el.innerHTML='';
    MODES[setupCfg.league].lineup.forEach(function(p){
      var pl=setupCfg.rosters[t][p];
      var d=document.createElement('div');
      d.className='sqrow '+(t===0?'oj':'bl');
      d.innerHTML='<span class="sp">'+p+'</span><span class="sn">'+pl.n+'</span><span class="snum">#'+pl.num+'</span>';
      el.appendChild(d);
    });
  });
  show('squad');
}
g('lgBack').addEventListener('click',function(){show('title')});
g('decBack').addEventListener('click',function(){show('league')});
g('sqBack').addEventListener('click',function(){show(Object.keys(ROSTERS[setupCfg.league]||{}).length<=1?'league':'decade')});
g('rulesBack').addEventListener('click',function(){
  if(NET.on)show(Object.keys(ROSTERS[setupCfg.league]||{}).length<=1?'league':'decade');
  else show('squad');
});
g('btnReroll').addEventListener('click',buildSquadScreen);
g('btnSquadGo').addEventListener('click',function(){show('rules')});
document.querySelectorAll('.tgtbtn').forEach(function(b){
  b.addEventListener('click',function(){
    document.querySelectorAll('.tgtbtn').forEach(function(x){x.classList.remove('sel')});
    b.classList.add('sel');
    var tv=b.getAttribute('data-target');
    setupCfg.target=tv==='Q'?'Q':parseInt(tv,10);
  });
});
g('btnTip').addEventListener('click',function(){
  var cfg={league:setupCfg.league,decade:setupCfg.decade,
    target:setupCfg.target,rosters:setupCfg.rosters};
  if(NET.on){netEv({a:'pick',cfg:cfg});enterPick(cfg);}
  else showVersus(cfg,true);
});

/* ========== squad check (online) + versus screen ========== */
var pickCfg=null;
function squadRow(team,pos,pl){
  var d=document.createElement('div');
  d.className='sqrow '+(team===0?'oj':'bl');
  d.innerHTML='<span class="sp">'+pos+'</span><span class="sn">'+pl.n+'</span><span class="snum">#'+pl.num+'</span>';
  return d;
}
function renderPick(){
  var me=NET.role,r=pickCfg.cfg.rosters[me];
  var el=g('pickList');el.innerHTML='';
  MODES[pickCfg.cfg.league].lineup.forEach(function(p){el.appendChild(squadRow(me,p,r[p]))});
  g('pickWho').textContent='You are '+(me===0?'ORANGE':'BLUE');
  g('pickWho').style.color=teamCol(me);
}
function pickStatusLine(){
  var mine=pickCfg.locked[NET.role],other=pickCfg.locked[1-NET.role];
  g('pickStatus').innerHTML=(mine?'✅ <b>Locked.</b> ':'Shuffle until it feels right — then lock it. ')+
    (other?'<b style="color:var(--accent)">Opponent LOCKED.</b>':'Opponent is still picking…');
}
function enterPick(cfg){
  pickCfg={cfg:cfg,locked:[false,false]};
  g('btnLock').disabled=false;g('btnShuffle').disabled=false;
  renderPick();pickStatusLine();
  show('pick');
}
function checkLocked(){
  if(!pickCfg||!pickCfg.locked[0]||!pickCfg.locked[1])return;
  showVersus(pickCfg.cfg,NET.role===0);
}
g('btnShuffle').addEventListener('click',function(){
  if(!pickCfg||pickCfg.locked[NET.role])return;
  var lineup=MODES[pickCfg.cfg.league].lineup;
  var ex=lineup.map(function(p){return pickCfg.cfg.rosters[1-NET.role][p].n});
  var r=pickSquad(pickCfg.cfg.league,pickCfg.cfg.decade,ex);
  pickCfg.cfg.rosters[NET.role]=r;
  renderPick();
  netEv({a:'squad',team:NET.role,roster:r});
});
g('pickLeave').addEventListener('click',function(){leaveRoom();show('title')});
g('btnLock').addEventListener('click',function(){
  if(!pickCfg||pickCfg.locked[NET.role])return;
  pickCfg.locked[NET.role]=true;
  g('btnLock').disabled=true;g('btnShuffle').disabled=true;
  pickStatusLine();
  netEv({a:'lock',team:NET.role});
  checkLocked();
});
function buildVersus(cfg){
  [0,1].forEach(function(t){
    var el=g(t===0?'vsA':'vsB');el.innerHTML='';
    MODES[cfg.league].lineup.forEach(function(p){el.appendChild(squadRow(t,p,cfg.rosters[t][p]))});
  });
}
function showVersus(cfg,launcher){
  buildVersus(cfg);
  show('versus');
  if(launcher)setTimeout(function(){
    netEv({a:'start',cfg:cfg});
    startGame(cfg);markGame(true);show('game');
  },3400);
}

/* ========== settings + music buttons ========== */
function syncMusicBtns(){
  var on=!window.BKAudio||BKAudio.settings.music;
  ['btnMusic','btnMusicG'].forEach(function(id){
    var b=g(id);if(!b)return;
    b.textContent=on?'♪':'♪̸';
    b.classList.toggle('off',!on);
  });
}
function toggleMusic(){if(window.BKAudio)BKAudio.toggleMusic();syncMusicBtns();refreshSettings();}
g('btnMusic').addEventListener('click',toggleMusic);
g('btnMusicG').addEventListener('click',toggleMusic);

var setFrom='title';
function tgl(id,on){var b=g(id);if(!b)return;b.classList.toggle('on',!!on);b.textContent=on?'ON':'OFF';}
function refreshSettings(){
  if(!window.BKAudio)return;
  var S=BKAudio.settings;
  document.querySelectorAll('#swatches .swatch').forEach(function(sw){
    sw.classList.toggle('sel',sw.getAttribute('data-theme')===S.theme);
  });
  tgl('setMusic',S.music);tgl('setSfx',S.sfx);tgl('setCoords',S.coords);tgl('setMotion',S.motion);
  var vm=g('volMusic'),vs=g('volSfx');
  if(vm)vm.value=Math.round(S.musicVol*100);
  if(vs)vs.value=Math.round(S.sfxVol*100);
  syncMusicBtns();
}
function openSettings(from){setFrom=from;refreshSettings();show('settings');}
g('btnSettings').addEventListener('click',function(){openSettings('title')});
g('pSettings').addEventListener('click',function(){g('pauseveil').classList.remove('on');openSettings('pause')});
g('setBack').addEventListener('click',function(){
  if(setFrom==='pause'){show('game');g('pauseveil').classList.add('on');}
  else show('title');
});
document.querySelectorAll('#swatches .swatch').forEach(function(sw){
  sw.addEventListener('click',function(){
    if(window.BKAudio)BKAudio.set('theme',sw.getAttribute('data-theme'));
    refreshSettings();
  });
});
g('setMusic').addEventListener('click',function(){if(window.BKAudio)BKAudio.set('music',!BKAudio.settings.music);refreshSettings();});
g('setSfx').addEventListener('click',function(){if(window.BKAudio)BKAudio.set('sfx',!BKAudio.settings.sfx);refreshSettings();});
g('setCoords').addEventListener('click',function(){if(window.BKAudio)BKAudio.set('coords',!BKAudio.settings.coords);refreshSettings();});
g('setMotion').addEventListener('click',function(){if(window.BKAudio)BKAudio.set('motion',!BKAudio.settings.motion);refreshSettings();});
g('volMusic').addEventListener('input',function(){if(window.BKAudio)BKAudio.set('musicVol',this.value/100);});
g('volSfx').addEventListener('input',function(){if(window.BKAudio)BKAudio.set('sfxVol',this.value/100);if(window.BKAudio)BKAudio.sfx('tap');});
syncMusicBtns();

/* ========== online screen wiring ========== */
g('btnOnline').addEventListener('click',function(){
  oStatus('Pick one — the free server takes ~30s to wake if it was napping.');
  show('online');
});
g('oBack').addEventListener('click',function(){
  if(NET.ws){try{NET.ws.onclose=null;NET.ws.close()}catch(e){}}
  NET.on=false;NET.ws=null;
  show('title');
});
g('oCreate').addEventListener('click',function(){
  oStatus('☎️ Calling the server… (free tier stretches first — up to ~30s)');
  netConnect(function(err){
    if(err){oStatus('❌ Could not reach the server. Give it ~30s to wake and try again.');return}
    netSend({t:'create'});
  });
});
g('oJoin').addEventListener('click',function(){
  var code=(g('oCode').value||'').toUpperCase().trim();
  if(code.length!==4){oStatus('Enter the 4-letter code your friend sent you.');return}
  oStatus('☎️ Calling the server… (free tier stretches first — up to ~30s)');
  netConnect(function(err){
    if(err){oStatus('❌ Could not reach the server. Give it ~30s to wake and try again.');return}
    netSend({t:'join',code:code});
  });
});

/* ========== quick help ========== */
var HINTS={
  league:['Leagues','NBA & WNBA are 5-on-5 full court. BIG3 is 3-on-3 half court with check-ups. WORLD runs Olympic & FIBA legends, 5-on-5. The dashed cards are in the lab — new leagues cooking for a future drop.'],
  decade:['Eras','Tap one era or MIX several — ’70s + 2000s? Go wild. FULL KNOWLEDGE deals from every era. Your squads come from whatever you pick.'],
  squad:['Squads','Both starting squads are dealt at random from your league & eras. Hate the hand? Re-deal as many times as you like, then lock it in.'],
  rules:['House rules','First to 11 is a quick run. First to 21 is the full war. Buckets are 2s and 3s, park rules.'],
  game:['Quick help','Tap YOUR player, then a lit tile to move. RED tile = crossover duel to get there. Tap a teammate to pass, SHOOT when you’re in a zone — every bucket runs through a trivia card. Court squares are lettered A1-style. Drag rotates the court, pinch zooms. Full rulebook: ☰ → How to play.']
};
function showHint(k){
  g('hintTitle').textContent=HINTS[k][0];
  g('hintBody').textContent=HINTS[k][1];
  g('hintveil').classList.add('on');
}
document.querySelectorAll('.qbtn').forEach(function(b){
  b.addEventListener('click',function(){showHint(b.getAttribute('data-hint'))});
});
g('hintOk').addEventListener('click',function(){g('hintveil').classList.remove('on')});
g('btnHelp').addEventListener('click',function(){showHint('game')});
g('btnReplay').addEventListener('click',replayPlay);
var howFromPause=false;
g('pHow').addEventListener('click',function(){
  g('pauseveil').classList.remove('on');
  howFromPause=true;
  screens.how.classList.add('on','ontop');
});

/* boot: was a live online game interrupted by a refresh? offer to rejoin */
refit();
requestAnimationFrame(render);
(function(){
  var saved=null;try{saved=JSON.parse(sessionStorage.getItem('bk_rejoin')||'null')}catch(e){}
  if(saved&&saved.code){
    netVeil('<b>You were mid-game.</b><br>Jump back into room '+saved.code+'?'+
      '<div class="row"><button class="bigbtn" id="nvBack">Rejoin</button>'+
      '<button class="bigbtn ghost" id="nvNo">No thanks</button></div>');
    var nb=g('nvBack'),nn=g('nvNo');
    if(nb)nb.onclick=function(){netVeil('');attemptRejoin()};
    if(nn)nn.onclick=function(){markGame(false);netVeil('')};
  }
})();

/* test hooks */
window.BK={
  state:function(){return state},
  mode:function(){return {league:MODE.label,cols:COLS,rows:ROWS,half:MODE.half}},
  tipAnswer:tipAnswer,
  tileToScreen:function(c,r){var tc=tileCenter(c,r);return proj(tc[0],tc[1],0)},
  rz:function(){return RZ},
  defRange:function(i){return defSlideRange(state.pieces[i])},
  _set:function(i,c,r){state.pieces[i].c=c;state.pieces[i].r=r},
  _tap:tapAt,_zoom:function(z){ZOOM=z;fitDirty=true},
  _meter:function(){return meter},_grade:gradeMeter,
  _net:function(){return NET},_pick:function(){return pickCfg},
  _settings:function(){return window.BKAudio?BKAudio.settings:null},
  _focus:function(){return FOCUS},_last:function(){return lastPlay},_replay:replayPlay,
  _poss:newPossession,_clock:function(){return state&&state.clock},
  _cfg:function(){return setupCfg},
  start:startGame, show:show
};
})();

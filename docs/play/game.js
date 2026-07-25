/* Ball Knowledge — v0.24 (real 3D ball, lightning clash)
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
var _lg=g('logo');if(_lg)_lg.innerHTML=logoSVG();
g('cardEmblem').innerHTML=ballSVG(74);

/* ========== screens ========== */
var screens={load:g('screen-load'),title:g('screen-title'),how:g('screen-how'),
  settings:g('screen-settings'),brains:g('screen-brains'),
  online:g('screen-online'),pick:g('screen-pick'),versus:g('screen-versus'),
  league:g('screen-league'),decade:g('screen-decade'),squad:g('screen-squad'),
  rules:g('screen-rules'),tossup:g('screen-tossup'),game:g('screen-game'),
  house:g('screen-house'),handicap:g('screen-handicap')};
var curScreen='load';
/* one persistent back arrow (top-left) drives each screen's existing back action */
var BACKMAP={how:'btnBack',settings:'setBack',online:'oBack',league:'lgBack',
  decade:'decBack',squad:'sqBack',rules:'rulesBack',pick:'pickLeave',tossup:'tuBack',
  house:'hsBack'};
var _sOutTimer=null,_sInTimer=null;
function show(name){
  if(name==='rules'&&typeof klRulesSync==='function')klRulesSync();
  var incoming=screens[name],prev=screens[curScreen];
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animate=prev&&prev!==incoming&&curScreen!=='load'&&!reduce;
  for(var k in screens){
    var s=screens[k];
    if(s===incoming)continue;
    if(animate&&s===prev){
      s.classList.remove('sIn');s.classList.add('sOut');
      if(_sOutTimer)clearTimeout(_sOutTimer);
      (function(sc){_sOutTimer=setTimeout(function(){sc.classList.remove('on','sOut');},440);})(s);
    }else{
      s.classList.remove('on','sIn','sOut');
    }
  }
  incoming.classList.remove('sOut');
  incoming.classList.add('on');
  if(animate){
    incoming.classList.remove('sIn');void incoming.offsetWidth;incoming.classList.add('sIn');
    if(_sInTimer)clearTimeout(_sInTimer);
    _sInTimer=setTimeout(function(){incoming.classList.remove('sIn');},460);
  }else{incoming.classList.remove('sIn');}
  curScreen=name;
  var ba=g('backArrow');
  if(ba)ba.classList.toggle('on',!!BACKMAP[name]);
  document.body.classList.toggle('worldbg-on',
    ['title','league','decade','squad','rules','settings','online','how','tossup'].indexOf(name)>=0);
  bbScreen(name);
  if(window.BKAudio&&name!=='settings')
    BKAudio.music((name==='game'||name==='versus')?'game':'menu');
}
/* let the slam + shake breathe before we slide to the next screen
   (instant when reduced-motion is on — no slam to wait for) */
function navSlam(fn){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){fn();return;}
  /* the deferred nav is STALE if any other show() happened while the slam played —
     e.g. tap ONLINE and the join handshake lands the house-rules screen inside the
     440ms window; the old timer then stomped it back to the online screen. If the
     screen moved on without us, drop the navigation instead of rewinding theirs. */
  var from=curScreen;
  setTimeout(function(){if(curScreen===from)fn();},440);
}
/* boombox: hidden on load, collapsed to a tab during play OR whenever the screen
   is too small to fit the open player clear of the menu — guaranteeing it never
   covers menu items. Only auto-opens when there's real room beside the menu. */
var bbManual=false;
function bbRoomy(){return window.innerWidth>=760&&window.innerHeight>=620;}
function bbScreen(name){
  var bb=g('boombox');if(!bb)return;
  bbManual=false;                               /* new screen = fresh auto state */
  bb.style.display=(name==='load')?'none':'';
  var play=(name==='game'||name==='versus'||name==='brains');
  if(play||!bbRoomy())bb.classList.add('mini');
  else bb.classList.remove('mini');
}
/* ===== boombox controller ===== */
(function(){
  var bb=g('boombox');if(!bb)return;
  bb.style.display='none';
  var PLAY='<svg viewBox="0 0 24 24"><path d="M7 4l14 8-14 8z"/></svg>';
  var PAUSE='<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  var playBtn=g('bbPlay'),trackEl=g('bbTrack'),vol=g('bbVol');
  function curV(){var v=parseFloat(getComputedStyle(vol).getPropertyValue('--v'));return isNaN(v)?0.5:v;}
  function setV(v){v=Math.max(0,Math.min(1,v));vol.style.setProperty('--v',v.toFixed(3));vol.setAttribute('aria-valuenow',Math.round(v*100));if(window.BKAudio)BKAudio.set('musicVol',v);}
  function marquee(){
    trackEl.classList.remove('bb-roll');trackEl.style.removeProperty('--mqd');
    var over=trackEl.scrollWidth-trackEl.parentNode.clientWidth;
    if(over>2){trackEl.style.setProperty('--mqd',over+'px');trackEl.classList.add('bb-roll');}
  }
  function render(st){
    bb.classList.toggle('playing',!!st.playing);
    playBtn.innerHTML=st.playing?PAUSE:PLAY;
    trackEl.textContent=st.broken?'No audio file':st.name;
    if(st.vol!=null)vol.style.setProperty('--v',st.vol);
    if(bb.style.display!=='none'&&!bb.classList.contains('mini'))marquee();
  }
  /* re-measure the marquee when the player is opened */
  g('bbTab').addEventListener('click',function(){setTimeout(marquee,30);});
  if(window.BKAudio&&BKAudio.mpOnChange)BKAudio.mpOnChange(render);
  if(window.BKAudio&&BKAudio.settings)vol.style.setProperty('--v',BKAudio.settings.musicVol);
  g('bbPlay').addEventListener('click',function(){if(window.BKAudio)BKAudio.toggleMusic();});
  g('bbNext').addEventListener('click',function(){if(window.BKAudio)BKAudio.mpCycle(1);});
  g('bbPrev').addEventListener('click',function(){if(window.BKAudio)BKAudio.mpCycle(-1);});
  g('bbToggle').addEventListener('click',function(){bb.classList.add('mini');bbManual=true;});
  g('bbTab').addEventListener('click',function(){bb.classList.remove('mini');bbManual=true;});
  /* on resize/orientation change, re-apply the safe auto state (unless the user
     explicitly opened/closed it on this screen) */
  window.addEventListener('resize',function(){if(!bbManual)bbScreen(curScreen);});
  var dragging=false,startY=0,startV=.5;
  vol.addEventListener('pointerdown',function(e){dragging=true;startY=e.clientY;startV=curV();try{vol.setPointerCapture(e.pointerId);}catch(x){}e.preventDefault();});
  vol.addEventListener('pointermove',function(e){if(!dragging)return;setV(startV+(startY-e.clientY)/120);});
  vol.addEventListener('pointerup',function(){dragging=false;});
  vol.addEventListener('wheel',function(e){e.preventDefault();setV(curV()-e.deltaY/1000);},{passive:false});
  vol.addEventListener('keydown',function(e){
    var d=(e.key==='ArrowUp'||e.key==='ArrowRight')?.05:(e.key==='ArrowDown'||e.key==='ArrowLeft')?-.05:0;
    if(d){e.preventDefault();setV(curV()+d);}
  });
})();
(function(){var ba=document.getElementById('backArrow');
  if(ba)ba.addEventListener('click',function(){
    var id=BACKMAP[curScreen]; var btn=id&&document.getElementById(id);
    if(btn)btn.click();
  });
})();

var LD_LINES=["Lacing 'em up…","Chalk toss…","Setting the screen…","Icing the shooter…",
  "Painting the key…","Calling bank…","Checking the tape…","Squeaking the sneakers…"];
(function(){
  var done=false,li=null,ci=null;
  function toTitle(){
    if(done)return;done=true;
    if(li)clearInterval(li);if(ci)clearInterval(ci);
    show('title');
  }
  g('screen-load').addEventListener('pointerup',toTitle);  /* tap to skip */
  g('ldMain').classList.remove('hide');  /* ball + clock straight away, no logo */
  var i=0,clock=24;
  var lineEl=g('ldLine'),clockEl=g('ldClock');
  li=setInterval(function(){i++;lineEl.textContent=LD_LINES[i%LD_LINES.length]},420);
  ci=setInterval(function(){clock--;clockEl.textContent=':'+(clock<10?'0':'')+clock;
    if(clock<=20)toTitle()},300);
})();
g('btnHow').addEventListener('click',function(){navSlam(function(){show('how')})});
g('btnBack').addEventListener('click',function(){
  if(howFromPause){howFromPause=false;
    screens.how.classList.remove('on','ontop');return}
  show('title');
});
g('btnMenu').addEventListener('click',function(){
  g('endveil').classList.remove('on');
  if(NET.on)leaveRoom();
  leaveGame();
  show('title');
});
g('btnPlay').addEventListener('click',function(){navSlam(function(){CPU.on=false;startTossup()})});
g('btnCpu').addEventListener('click',function(){navSlam(function(){g('cpuveil').classList.add('on')})});
g('cvBack').addEventListener('click',function(){g('cpuveil').classList.remove('on')});
document.querySelectorAll('#cpuveil .cv-card').forEach(function(b){
  b.addEventListener('click',function(){
    CPU.on=true;CPU.team=1;CPU.level=b.getAttribute('data-lvl')||'pro';CPU.busy=false;
    setupCfg.theCall=null;               /* no toss-up vs the machine (v1) */
    g('cpuveil').classList.remove('on');
    show('league');
  });
});
/* menu comic-book FX: cursor tilt + POW burst on the live buttons */
(function menuFX(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover:hover)').matches;
  var btns=document.querySelectorAll('#screen-title .mbtn.live');
  btns.forEach(function(btn){
    if(fine&&!reduce){
      btn.addEventListener('pointermove',function(e){
        var r=btn.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width-0.5, py=(e.clientY-r.top)/r.height-0.5;
        btn.style.setProperty('--ry',(px*15).toFixed(1)+'deg');
        btn.style.setProperty('--rx',(-py*12).toFixed(1)+'deg');
      });
      btn.addEventListener('pointerleave',function(){
        btn.style.setProperty('--ry','0deg'); btn.style.setProperty('--rx','0deg');
      });
    }
    btn.addEventListener('pointerdown',function(e){
      if(reduce)return;
      /* the burst lives on the SCREEN layer so it slams + spills past the button */
      var host=document.getElementById('screen-title');
      var pow=document.createElement('span'); pow.className='pow';
      pow.textContent=btn.getAttribute('data-pow')||'POW!';
      pow.style.left=e.clientX+'px'; pow.style.top=e.clientY+'px';
      pow.style.setProperty('--pr',(((e.clientX|0)%9)-4)+'deg');
      host.appendChild(pow);
      var menu=btn.closest('.menu');
      if(menu){menu.classList.remove('shake');void menu.offsetWidth;menu.classList.add('shake');
        setTimeout(function(){menu.classList.remove('shake')},460);}
      setTimeout(function(){if(pow.parentNode)pow.parentNode.removeChild(pow);},600);
    });
  });
})();
g('btnAgain').addEventListener('click',function(){
  if(NET.on&&NET.role!==0){banner('<b>Host calls the rematch.</b>');return}
  g('endveil').classList.remove('on');
  if(NET.on)netEv({a:'start',cfg:lastCfg});
  startGame();
});
g('btnPause').addEventListener('click',function(){
  if(!state)return;
  /* NO TIMEOUTS MID-QUESTION (Aaron's rule): pausing on a live card would let you
     stop the clock and think — or google. Same for the meter, battles and the
     tip-off. Finish the play, then call timeout. */
  var live=['qveil','meterveil','rebveil','tipveil'].some(function(id){
    var el=g(id);return el&&el.classList.contains('on');
  });
  if(live){callout('NO TIMEOUTS<small>finish the play first</small>');return;}
  g('pauseveil').classList.add('on');
});
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
    if(d.role===0){
      var fc=g('frCode');if(fc)fc.textContent=d.code.split('').join(' ');
      var cp=g('frCopy');if(cp){cp.dataset.code=d.code;cp.textContent='⧉ Copy code';}
      var fr=g('frReveal');if(fr){fr.classList.remove('on');void fr.offsetWidth;fr.classList.add('on');}
      oStatus('');
    }
    return;
  }
  if(d.t==='nope'){oStatus('❌ '+d.why);return}
  if(d.t==='ready'){
    NET.on=true;CPU.on=false;
    /* write the rejoin ticket the moment the room PAIRS, not at game start.
       A drop on the house screen / toss-up / handicap pick is still a live room —
       without this ticket the refreshed phone boots to the title with no way
       back, and the survivor waits out the grace window for nobody. */
    markGame(true);
    oStatus('✅ Connected — you are <b style="color:'+(NET.role===0?'var(--team-oj)':'var(--away)')+'">'+
      (NET.role===0?'ORANGE':'BLUE')+'</b>.');
    if(NET.role===0){
      /* the host already set the house rules — send them so the guest can see
         exactly what they're walking into before the game starts */
      netEv({a:'house',house:houseRules()});
      oStatus('✅ Connected. Showing your friend the house rules…');
    }
    /* the guest waits for {a:'house'} and confirms; the host waits for {a:'housed'} */
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
    /* survivor: our opponent reconnected — push them the live board.
       The snapshot alone is not enough: the rejoiner refreshed the page, so their
       setupCfg is factory-default. House rules ride along, ALWAYS — without them a
       handicap room desyncs its mode and a rejoining HOST has league:null. */
    var snap=snapshot();
    netEv({a:'resync',snap:snap,house:houseRules()});
    if(!snap){
      /* pre-game drop: no board to restore. Re-run the whole house handshake —
         the rejoiner re-sees the rules and re-accepts, then BOTH enter the
         toss-up through the same door as a fresh join. The 'housed' reply
         clears this veil. */
      netVeil('<b>Opponent is back.</b><br>Waiting for them to re-confirm the house rules…');
      NET.frozen=false;
      return;
    }
    netVeil('<b>Opponent reconnected.</b><br>Syncing the game…');
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
  tipPendQ=null;                    /* don't carry a dead room's question into the next one */
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
  if(!state)return null;          /* pre-game (toss-up/setup) — nothing to snapshot */
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
function applySnapshot(sn,house){
  if(house)applyHouse(house);        /* rejoiner refreshed — restore the room's rules first */
  if(!sn){
    /* pre-game drop: back through the front door. Re-accepting the house rules
       sends {a:'housed'}, which starts the toss-up on BOTH phones — same path a
       fresh join takes, so there is only one way into the toss-up. */
    NET.frozen=false;netVeil('');
    showHouse(house||houseRules());
    return;
  }
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
    case 'start':startBeat(ev.cfg);break;
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
    case 'house':showHouse(ev.house);break;
    case 'housed':                       /* the other side accepted — both open the toss-up */
      NET.frozen=false;netVeil('');
      oStatus('\u2705 Your friend is in. Toss-up incoming\u2026');
      setTimeout(function(){startTossup()},600);
      break;
    case 'hcpick':
      if(pickHc){pickHc[ev.team]=ev.k;setupCfg.brackets[ev.team]=ev.k;hcStatus();}
      break;
    case 'tipq':tipSetQ(ev.qi);break;
    case 'tipbuzz':tipHostBuzz(ev.team,ev.delta);break;
    case 'tipbuzzwin':tipApplyBuzzWin(ev.winner,ev.noBuzz);break;
    case 'tip':tipAnswer(ev.ok);break;
    /* ---- online toss-up ---- */
    case 'tuready':tuMarkReady(ev.team);break;
    case 'tugo':tuGo(ev.qi);break;
    case 'tubuzz':tuHostBuzz(ev.team,ev.delta);break;
    case 'tubuzzwin':tuApplyBuzzWin(ev.winner,ev.noBuzz);break;
    case 'tuans':tuResolveAnswer(ev.ok,ev.side);break;
    case 'tucall':tuApplyCall(ev.pick);break;
    case 'resync':applySnapshot(ev.snap,ev.house);break;
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
var BALLIMG=new Image();BALLIMG.src='assets/ball-hero.png';var ballReady=false;
BALLIMG.onload=function(){ballReady=true};
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
var state=null,usedQ={0:[],1:[],2:[],3:[],4:[]},pending=null,battle=null,tip=null,lastCfg=null;
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
  /* difficulty rides in cfg, so the guest resolves the SAME brackets the host set.
     A bracket that only lived on one client would draw different cards per phone. */
  if(cfg.brackets)setupCfg.brackets=cfg.brackets.slice();
  if(cfg.bracketMode)setupCfg.bracketMode=cfg.bracketMode;
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
  /* NB: tipPendQ is deliberately NOT cleared here. The brains screen is tap-to-skip,
     so the host's tipq often lands while the guest is still on it — clearing here
     would throw away the very pick the guest is waiting for. runTipoff consumes it. */
  usedQ={0:[],1:[],2:[],3:[],4:[]};pending=null;battle=null;tip=null;
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
    (NET.on?' · YOU ARE '+(NET.role===0?'ORANGE':'BLUE'):'')+cpuHudTag();
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
  if(ballReady){
    var d=r*2.15;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=r*0.5;ctx.shadowOffsetY=r*0.35;
    ctx.drawImage(BALLIMG,x-d/2,y-d/2,d,d);
    ctx.restore();
    return;
  }
  var gr=ctx.createRadialGradient(x-r*.3,y-r*.35,r*.2,x,y,r);
  gr.addColorStop(0,'#ffb976');gr.addColorStop(.6,'#ef8330');gr.addColorStop(1,'#8a430c');
  ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
}
function drawGoal(side){
  var bx=side<0?-24:LW+24, rx=side<0?RIM_L[0]:RIM_R[0], cy=LH/2;
  var team=MODE.half?(state?state.offense:0):(side>0?0:1);  /* whose hoop this is */
  var col=team===0?'245,135,46':'88,168,214';
  var now2=(performance.now()-t0)/1000;
  var pb=proj(bx,cy,0),pt=proj(bx,cy,52);
  var c1=proj(bx,cy-34,34),c2=proj(bx,cy+34,34),c3=proj(bx,cy+34,78),c4=proj(bx,cy-34,78);
  var bcx=(c1.x+c2.x+c3.x+c4.x)/4,bcy=(c1.y+c2.y+c3.y+c4.y)/4;
  var brad=Math.hypot(c1.x-c3.x,c1.y-c3.y)*1.05;
  /* --- ownership light: a colored glow blooming BEHIND the backboard --- */
  var pulse=(state&&attackedRim(state.offense)[0]===rx)?0.35+0.18*Math.sin(now2*3):0.28;
  var gb=ctx.createRadialGradient(bcx,bcy,brad*0.12,bcx,bcy,brad);
  gb.addColorStop(0,'rgba('+col+','+pulse+')');
  gb.addColorStop(1,'rgba('+col+',0)');
  ctx.fillStyle=gb;ctx.beginPath();ctx.arc(bcx,bcy,brad,0,7);ctx.fill();
  /* pole */
  ctx.strokeStyle='#55555b';ctx.lineWidth=Math.max(2,4*pb.s);
  ctx.beginPath();ctx.moveTo(pb.x,pb.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();
  /* CLEAR GLASS backboard — translucent, you can see the arena through it */
  ctx.beginPath();ctx.moveTo(c1.x,c1.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(c3.x,c3.y);ctx.lineTo(c4.x,c4.y);ctx.closePath();
  ctx.fillStyle='rgba(198,220,240,.12)';ctx.fill();
  var sheen=ctx.createLinearGradient(c1.x,c1.y,c3.x,c3.y);
  sheen.addColorStop(0,'rgba(255,255,255,.16)');sheen.addColorStop(.5,'rgba(255,255,255,.02)');sheen.addColorStop(1,'rgba('+col+',.10)');
  ctx.fillStyle=sheen;ctx.fill();
  ctx.strokeStyle='rgba(232,242,255,.9)';ctx.lineWidth=2;ctx.stroke();
  /* shooter's square in the owner's color */
  var s1=proj(bx,cy-11,40),s2=proj(bx,cy+11,40),s3=proj(bx,cy+11,58),s4=proj(bx,cy-11,58);
  ctx.strokeStyle='rgba('+col+',.95)';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(s1.x,s1.y);ctx.lineTo(s2.x,s2.y);ctx.lineTo(s3.x,s3.y);ctx.lineTo(s4.x,s4.y);ctx.closePath();ctx.stroke();
  /* rim + net */
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
  /* colored light pool on the floor beneath the rim (ownership, not text) */
  var fp=proj(rx,cy,0);
  var fg=ctx.createRadialGradient(fp.x,fp.y,2,fp.x,fp.y,40*Math.max(.4,pb.s));
  fg.addColorStop(0,'rgba('+col+','+(pulse*0.8)+')');fg.addColorStop(1,'rgba('+col+',0)');
  ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(fp.x,fp.y,40*Math.max(.4,pb.s),16*Math.max(.4,pb.s),0,0,7);ctx.fill();
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
  /* history/college/streetball facts are US-basketball canon — surface them in
     the domestic + world pools until they get their own selectable leagues.
     Streetball rides with NBA and BIG3 especially: Rucker/AND1 culture is the
     same lineage, and BIG3 is half-court ex-NBA ball. */
  if(lg==='nba')return l==='nba'||l==='college'||l==='negro'||l==='street';
  if(lg==='big3')return l==='big3'||l==='nba'||l==='college'||l==='street';
  if(lg==='world')return l==='world'||l==='nba'||l==='negro';
  if(lg==='wnba')return l==='wnba'||l==='college';
  return l===lg;
}
function pickQuestionIdx(tier,noFilter){
  var pool=[];
  for(var i=0;i<QUESTIONS.length;i++)
    if(QUESTIONS[i].t===tier&&(noFilter||leagueOk(QUESTIONS[i]))&&usedQ[tier].indexOf(i)<0)pool.push(i);
  if(!pool.length){
    usedQ[tier]=[];
    for(var j=0;j<QUESTIONS.length;j++)
      if(QUESTIONS[j].t===tier&&(noFilter||leagueOk(QUESTIONS[j])))pool.push(j);
    if(!pool.length)return noFilter?0:pickQuestionIdx(tier,true);
  }
  var idx=pool[Math.floor(Math.random()*pool.length)];
  usedQ[tier].push(idx);
  return idx;
}
/* the INDEX is the shareable form — anything both phones must see draws by index */
function pickQuestion(tier,noFilter){return QUESTIONS[pickQuestionIdx(tier,noFilter)]}
function markQUsed(tier,idx){if(usedQ[tier]&&usedQ[tier].indexOf(idx)<0)usedQ[tier].push(idx)}
/* difficulty names/colors live in ONE place — tier 4 (Legendary) borrows the
   gold from the Legendary squad pack so the game speaks one rarity language */
var TIERS={0:{n:'Casual',c:'#8fd0ff'},1:{n:'Easy',c:'#6fbf73'},2:{n:'Medium',c:'#e8b84b'},
           3:{n:'Hard',c:'#d5524b'},4:{n:'Legendary',c:'#ffcf6a'}};
function tierName(t){return (TIERS[t]||TIERS[3]).n}
function tierCol(t){return (TIERS[t]||TIERS[3]).c}

/* ===== difficulty brackets =====================================================
   A bracket is a CURVE, not a fixed difficulty. The game already decides how hard
   a card should be from what you're attempting — a layup is easier than a deep
   three, a C's crossover is harder than a PG's, a smothered shot is harder than an
   open one. The bracket slides that whole curve up or down for one player.

   It is applied in exactly ONE place: the top of showCard(). Every card in the
   game routes through there — shots, crossovers, passes, steals, blocks, stay-in-
   front, protect-the-rock, sudden death — so a bracket automatically covers all of
   them instead of nine call sites each needing to remember. It also runs BEFORE
   the label is drawn, so a shifted card shows the difficulty it actually is.

   Casual is the only bracket that reaches the very-easy t:0 pool — see BRACKETS.lo. */
/* `lo` is a per-bracket FLOOR, not one global minimum. Only Casual is allowed to
   reach the very-easy t:0 pool — otherwise unlocking Casual would silently drag
   Rookie's layups down to t:0 too and blur the two levels into each other. */
var BRACKETS={
  casual:{lbl:'Casual',off:-2,lo:0,col:'#8fd0ff',blurb:'You just have to want to try'},
  rookie:{lbl:'Rookie',off:-1,lo:1,col:'#6fbf73',blurb:'You watch some ball'},
  baller:{lbl:'Baller',off: 0,lo:1,col:'#e8b84b',blurb:'You know the game'},
  pro:   {lbl:'Pro',   off:+1,lo:1,col:'#d5524b',blurb:'You been watching a long time'},
  legend:{lbl:'Legend',off:+2,lo:1,col:'#ffcf6a',blurb:'Deep cuts, every trip down'},
  wild:  {lbl:'Surprise me',off:null,lo:1,col:'#b98cff',blurb:'Every card rolls its own difficulty'}
};
var BRACKET_ORDER=['casual','rookie','baller','pro','legend','wild'];
var TIER_HI=4;
function bracketKey(team){
  var b=setupCfg.brackets;
  if(!b)return 'baller';
  return BRACKETS[b[team]]?b[team]:'baller';
}
function bracketOf(team){return BRACKETS[bracketKey(team)]}
function shiftTier(base,team){
  var b=bracketOf(team);
  if(!b)return base;
  var lo=(b.lo==null?1:b.lo);
  if(b.off==null)return lo+Math.floor(Math.random()*(TIER_HI-lo+1)); /* surprise me */
  return Math.max(lo,Math.min(TIER_HI,base+b.off));
}
/* ---- handicap: each player sets their OWN level, then both lock ---- */
var pickHc=null;
function hcStatus(){
  if(!pickHc)return;
  var mine=NET.on?NET.role:0,other=1-mine;
  g('hcStatus').textContent=pickHc[other]
    ? 'Your friend locked '+(BRACKETS[pickHc[other]]||{}).lbl+'.'
    : 'Waiting on your friend\u2026';
  if(pickHc[0]&&pickHc[1]&&NET.role===0)hcDone();
}
function hcDone(){
  if(!pickHc)return;
  setupCfg.brackets=[pickHc[0],pickHc[1]];
  pickHc=null;
  if(tuOnline())beginMatch(); else show('league');
}
function startHandicap(){
  pickHc=[null,null];
  var mine=NET.on?NET.role:0;
  g('hcLock').disabled=false;g('hcLock').textContent='Lock it in \u2713';
  g('hcStatus').textContent='';
  klMount({row:'klHcRow',wild:'klHcWild',blurb:'klHcBlurb',map:'klHcMap'},
    function(){return setupCfg.brackets[mine]},
    function(k){setupCfg.brackets[mine]=k;});
  show('handicap');
}
g('hcLock').addEventListener('click',function(){
  var mine=NET.on?NET.role:0;
  this.disabled=true;this.textContent='Locked \u2713';
  pickHc=pickHc||[null,null];
  pickHc[mine]=setupCfg.brackets[mine];
  if(NET.on)netEv({a:'hcpick',team:mine,k:setupCfg.brackets[mine]});
  hcStatus();
});

/* ---- house rules: set by the room creator, shown to the joiner before they commit ---- */
function houseRules(){
  return {league:setupCfg.league,decade:setupCfg.decade,target:setupCfg.target,
          bracketMode:setupCfg.bracketMode,brackets:setupCfg.brackets.slice()};
}
function eraLabel(dec){
  if(!dec||!dec.length||dec.indexOf('FULL')>=0)return 'Full knowledge';
  return dec.join(' · ');
}
function applyHouse(h){
  if(!h)return;
  setupCfg.league=h.league;setupCfg.decade=h.decade;setupCfg.target=h.target;
  setupCfg.bracketMode=h.bracketMode||'same';
  if(h.brackets)setupCfg.brackets=h.brackets.slice();
}
function showHouse(h){
  applyHouse(h);
  var lg=(MODES[h.league]||{}).label||String(h.league||'').toUpperCase();
  var len=h.target==='Q'?'4 quarters':('First to '+h.target);
  var hc=h.bracketMode==='handicap';
  var lvl=hc?'Handicap':(BRACKETS[h.brackets&&h.brackets[0]]||BRACKETS.baller).lbl;
  var lvlSub=hc?'You pick your own level before tip-off'
               :(BRACKETS[h.brackets&&h.brackets[0]]||BRACKETS.baller).blurb;
  var rows=[['League',lg,''],['Era',eraLabel(h.decade),''],['Game',len,''],
            ['Knowledge',lvl,lvlSub],
            ['Opens with','The Toss-Up','One question decides the prize']];
  /* a HOST only ever sees this screen when re-entering their own room after a
     drop — don't tell them it's Blue's */
  g('hsWho').textContent=NET.role===0?'Your room':'Orange\u2019s room';
  g('hsRole').textContent=NET.role===0?'You\u2019re Orange \u00b7 confirm to re-enter'
                                      :'You\u2019ll be Blue';
  g('hsRows').innerHTML=rows.map(function(r){
    return '<div class="hs-row"><span class="k">'+r[0]+'</span><span class="v">'+r[1]+
      (r[2]?'<small>'+r[2]+'</small>':'')+'</span></div>';
  }).join('');
  var go=g('hsGo');go.disabled=false;go.textContent='I\u2019m in \u2192';  /* reshown after a rejoin */
  show('house');
}
g('hsGo').addEventListener('click',function(){
  this.disabled=true;this.textContent='Locking in\u2026';
  netEv({a:'housed'});
  startTossup();
});
g('hsBack').addEventListener('click',function(){
  leaveRoom();show('title');
});

/* ---- bracket picker UI (shared by house rules, room settings, handicap pick) ---- */
function klPreview(key){
  /* say plainly what this level turns each attempt into — no one should have to guess */
  var b=BRACKETS[key];if(!b)return '';
  var rows=[['Layup',1],['Mid-range',2],['Three',3],['Sudden death',4]];
  return rows.map(function(r){
    if(b.off==null)
      return '<div class="r"><span class="z">'+r[0]+'</span><span class="kl-chip wild">any tier</span></div>';
    var t=Math.max((b.lo==null?1:b.lo),Math.min(TIER_HI,r[1]+b.off));
    return '<div class="r"><span class="z">'+r[0]+'</span><span class="kl-chip" style="--cc:'+
      tierCol(t)+'">'+tierName(t)+'</span></div>';
  }).join('');
}
function klMount(ids,get,set){
  var row=g(ids.row),wild=g(ids.wild),blurb=g(ids.blurb),map=g(ids.map);
  function paint(){
    var cur=get();
    row.innerHTML='';
    BRACKET_ORDER.forEach(function(k){
      if(k==='wild')return;                    /* the wildcard is not a rung on the ladder */
      var b=BRACKETS[k];
      if(b.locked)return;                      /* Casual waits on the very-easy questions */
      var btn=document.createElement('button');
      btn.className='klbtn'+(cur===k?' sel':'');
      btn.style.setProperty('--kc',b.col);
      btn.textContent=b.lbl;
      btn.addEventListener('click',function(){set(k);paint();if(window.BKAudio)BKAudio.sfx('click')});
      row.appendChild(btn);
    });
    if(wild){
      wild.classList.toggle('sel',cur==='wild');
      wild.style.setProperty('--kc',BRACKETS.wild.col);
    }
    if(blurb)blurb.textContent=(BRACKETS[cur]||{}).blurb||'';
    if(map)map.innerHTML=klPreview(cur);
  }
  if(wild)wild.addEventListener('click',function(){set('wild');paint();if(window.BKAudio)BKAudio.sfx('click')});
  paint();
  return paint;
}
function showCard(tier,stakeLabel,stakeText,subText,defense){
  state.phase='shooting';
  stagebox('');clearFocus();
  var owner=defense?1-state.offense:state.offense;
  tier=shiftTier(tier,owner);        /* the answerer's bracket bends their own cards */
  if(NET.on&&owner!==NET.role){
    /* their card — you just get to sweat */
    banner('<b>'+teamName(owner)+'</b> is on the clock…');
    stagebox('<div class="stitle">🃏 '+teamName(owner)+' answering a '+
      tierName(tier).toUpperCase()+' card…</div>',true);
    return;
  }
  if(CPU.on&&owner===CPU.team){
    /* the machine takes its card off-screen — you just watch the verdict */
    banner('<b>'+teamName(owner)+' (CPU)</b> is on the clock…');
    stagebox('<div class="stitle">🤖 CPU answering a '+
      tierName(tier).toUpperCase()+' card…</div>',true);
    var ok=cpuRollCard(tier);
    CPU.busy=true;
    setTimeout(function(){
      CPU.busy=false;stagebox('');
      callout(ok?'CPU NAILS IT<small>right answer</small>':'CPU BRICKS THE CARD<small>wrong answer</small>',teamCol(owner));
      resolvePending(ok);
    },900+cpuRnd(cpuLvl().think));
    return;
  }
  var q=pickQuestion(tier);
  window.BK&&(window.BK._q=q);
  var tn=tierName(tier);
  g('qcat').textContent=(defense?'🛡 DEFENSE · ':'')+q.cat;
  g('qtier').textContent=tn+' · '+stakeLabel;
  g('qtier').style.background=defense?'#58a8d6':tierCol(tier);
  g('qchip').textContent=tn;
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
  if(CPU.on&&owner===CPU.team){
    meter.done=true;meter.remote=true;   /* human taps bounce off */
    ms.textContent='🤖 CPU is timing it…';ms.className='msub';
    g('meterveil').classList.add('on');
    setTimeout(function(){if(meter)meterResolve(cpuMeterPos())},700+Math.random()*500);
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
var CLK_OFF=24,CLK_DEF=24;
function clockStart(kind){
  if(!state)return;
  state.clock={t:kind==='off'?CLK_OFF:CLK_DEF,kind:kind,warned:-1};
}
function clockStop(){if(state)state.clock={t:0,kind:null,warned:-1}}
/* tear down anything time-based when leaving a game, so nothing fires on the menu */
function leaveGame(){
  clockStop();
  if(typeof qTimer!=='undefined'&&qTimer){clearTimeout(qTimer);qTimer=null;}
  if(typeof meter!=='undefined'&&meter&&meter.timeout){clearTimeout(meter.timeout);}
  if(state){state.staged=null;state.selected=null;}
  if(typeof clearFocus==='function')clearFocus();
  var ck=g('shotclock'); if(ck)ck.style.display='none';
  CPU.on=false;CPU.busy=false;          /* the machine clocks out with you */
  markGame&&markGame(false);
}
function clockTickable(){
  /* never tick off the game screen — a lingering clock must not fire over the menu */
  if(!state||curScreen!=='game'||!state.clock||!state.clock.kind)return false;
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
    (NET.on?' · YOU ARE '+(NET.role===0?'ORANGE':'BLUE'):'')+cpuHudTag();
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
  if(CPU.on){                       /* the machine mashes its own side */
    var n=Math.round(cpuRnd(cpuLvl().taps)),gap=2300/Math.max(1,n);
    for(var i=0;i<n;i++)setTimeout(function(){battleTap(CPU.team)},150+i*gap);
  }
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

function endShow(winner,line){
  var wc=teamCol(winner),human=CPU.on?(1-CPU.team):-1;
  var ev=g('endveil');ev.style.setProperty('--wc',wc);
  g('endEy').textContent='Final · '+MODE.label+(CPU.on?' · vs CPU '+cpuLvl().name:'');
  var slamTxt=teamName(winner)+' wins!';
  if(CPU.on)slamTxt=(winner===human)?'You beat the machine!':'The machine got you';
  g('endSlam').innerHTML='<b>'+slamTxt+'</b>';
  g('evNameA').textContent=teamName(0);g('evNameB').textContent=teamName(1);
  g('evPtsA').textContent=state.score[0];g('evPtsB').textContent=state.score[1];
  g('evPtsA').className='ev-num'+(winner===0?' win':'');
  g('evPtsB').className='ev-num'+(winner===1?' win':'');
  g('endLine').textContent=line;
  /* confetti in the winner's colors */
  var cf=g('endConfetti');cf.innerHTML='';
  if(!document.body.classList.contains('reduce-motion')){
    var cols=[wc,'#fff5e2',winner===0?'#c9641a':'#3f7f9c'];
    for(var i=0;i<44;i++){
      var s=document.createElement('span');
      s.style.left=(Math.random()*100)+'%';
      s.style.background=cols[i%cols.length];
      s.style.animationDuration=(2.4+Math.random()*2.4)+'s';
      s.style.animationDelay=(Math.random()*1.6)+'s';
      s.style.width=(6+Math.random()*7)+'px';
      s.style.height=(10+Math.random()*9)+'px';
      cf.appendChild(s);
    }
  }
  if(window.BKAudio)BKAudio.sfx('horn');
  g('endveil').classList.add('on');
}
function endGame(){
  clockStop();markGame(false);
  var winner=state.score[0]===state.score[1]?1:(state.score[0]>state.score[1]?0:1);
  var human=CPU.on?(1-CPU.team):-1;
  var line=CPU.on?(winner===human?'Ball knowledge don’t lie — '+cpuLvl().name+' handled.'
                                 :'The '+cpuLvl().name+' CPU studied up. Run it back.')
                 :'Ball knowledge don’t lie.';
  endShow(winner,line);
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
  /* the ladder already escalates medium -> hard; round 3 goes LEGENDARY.
     Two players who've traded haymakers this long have earned it. */
  var tier=sd.round>=3?4:(sd.round>=2?3:2);
  showCard(tier,'SUDDEN DEATH','Round '+sd.round+' — answer to survive',
    sd.asked===0?'Scored on, so you answer first':'Match it — or take the crown');
}
function endGameSD(winner){
  callout('GAME OVER!<small>sudden death</small>',teamCol(winner));
  endShow(winner,'Tied at '+state.score[0]+' — settled in SUDDEN DEATH by pure ball knowledge.');
  sd=null;
}

/* ========== tip-off buzzer race ========== */
/* the host's pick can land before the guest has even built its `tip` — hold it */
var tipPendQ=null;
function tipSetQ(qi){
  if(!tip){tipPendQ=qi;return;}
  tip.qi=qi;tip.q=QUESTIONS[qi];markQUsed(2,qi);
  window.BK&&(window.BK._q=tip.q);
}
function runTipoff(){
  state.phase='tip';
  tip={q:null,qi:-1,buzz:-1,armed:false,decided:false,sent:false,buzzes:null,revealAt:0,
       arbTimer:null,noBuzzTimer:null};
  /* ONE question for both phones. Drawing it locally on each client means the two
     players race to buzz on questions the other never saw — you buzz fast because
     yours was easy. So the HOST draws the index and broadcasts it; the guest waits. */
  if(tipPendQ!=null){var pq=tipPendQ;tipPendQ=null;tipSetQ(pq);}
  else if(!(tipOnline()&&NET.role!==0)){
    var pi=pickQuestionIdx(2);
    tipSetQ(pi);
    if(tipOnline())netEv({a:'tipq',qi:pi});
  }
  var waited=0;
  g('tipQ').textContent='';
  g('tipAns').innerHTML='';
  g('tzA').classList.add('lock');g('tzB').classList.add('lock');  /* nobody buzzes the countdown */
  if(window.BKAudio)BKAudio.sfx('whistle');
  g('tipveil').classList.add('on');
  var armTip=function(){
    if(!tip)return;
    if(!tip.q){                        /* host's pick still in flight — never arm blind */
      waited+=120;
      if(waited<8000){g('tipMsg').textContent='syncing the question…';setTimeout(armTip,120);return;}
      tipSetQ(pickQuestionIdx(2));     /* last resort: a mismatched question beats a hung room */
    }
    tip.armed=true;
    tip.revealAt=Date.now();          /* this phone's own reaction clock starts HERE */
    g('tipCd').classList.remove('on');
    g('tipQ').textContent=tip.q.q;
    g('tipMsg').textContent='First to buzz answers for the ball';
    g('tzA').classList.remove('lock');g('tzB').classList.remove('lock');
    if(NET.on)g(NET.role===0?'tzB':'tzA').classList.add('lock'); /* only YOUR buzzer */
    if(tipOnline()&&NET.role===0){
      /* safety net: if neither phone buzzes, don't hang the room on the jump ball */
      tip.noBuzzTimer=setTimeout(function(){
        if(!tip||tip.decided)return;
        tipDecide(1,true);   /* default to the guest — the host already had the call */
      },TIP_NOBUZZ_MS);
    }
    if(CPU.on){
      g(CPU.team===0?'tzA':'tzB').classList.add('lock');         /* CPU's buzzer is its own */
      setTimeout(function(){
        if(!tip||tip.buzz>=0)return;
        tipBuzz(CPU.team);
        g('tipAns').innerHTML='';
        g('tipMsg').textContent='🤖 CPU BUZZED — it’s answering…';
        setTimeout(function(){if(tip)tipAnswer(Math.random()<cpuLvl().tip)},900+Math.random()*700);
      },cpuRnd(cpuLvl().buzz));
    }
  };
  if(document.body.classList.contains('reduce-motion')){armTip();return;}
  var cd=g('tipCd'),n=5;
  cd.textContent=n;cd.classList.add('on');cd.classList.remove('tick');void cd.offsetWidth;cd.classList.add('tick');
  g('tipMsg').textContent='get ready to buzz…';
  var iv=setInterval(function(){
    n--;
    if(!tip){clearInterval(iv);cd.classList.remove('on');return;}
    if(n<=0){clearInterval(iv);armTip();return;}
    cd.textContent=n;cd.classList.remove('tick');void cd.offsetWidth;cd.classList.add('tick');
  },800);
}
function tipBuzz(team){
  if(!tip||tip.buzz>=0)return;
  if(!tip.armed)return;              /* countdown still running — no early slaps */
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
function tipAnswer(ok,noBuzz){
  if(!tip)return;
  var winner=ok?tip.buzz:1-tip.buzz;
  if(tip.arbTimer)clearTimeout(tip.arbTimer);
  if(tip.noBuzzTimer)clearTimeout(tip.noBuzzTimer);
  tip=null;
  g('tipveil').classList.remove('on');
  callout(teamName(winner).toUpperCase()+' BALL<small>'+
    (noBuzz?'nobody buzzed':(ok?'won the tip':'missed it — other way'))+'</small>',teamCol(winner));
  if(window.BKAudio)BKAudio.sfx(ok?'net':'buzzer');
  state.offense=winner;
  state.possTeam=winner;
  state.ball.holder=winner*MODE.lineup.length;  /* winner's PG */
  state.phase='off-select';
  clockStart('off');
  updateQHud();
  var pgName=state.pieces[state.ball.holder].short;
  banner((noBuzz?'<b>No buzz!</b> ':(ok?'<b>WINS THE TIP!</b> ':'<b>Missed it — other way!</b> '))+
    teamName(winner)+' ball — '+pgName+' brings it up. Drag to rotate.');
  actions('<span class="note">'+teamName(winner)+' — tap a player</span>');
}
/* ---- tip-off buzz: host-arbitrated, lag-fair (same model as the Toss-Up) ----
   The jump ball is a SIMULTANEOUS race, so near-tied buzzes are the normal case,
   not an edge case. Resolving it locally forks the game on the very first
   possession: each phone sees its OWN buzz at zero latency, awards itself the
   tip, and the two clients disagree about who has the ball forever after.
   So: each phone times its OWN reaction (ms from ITS reveal to ITS tap) and
   sends that delta; the host compares DELTAS — never arrival order, so a slow
   connection can't steal a tip — and broadcasts ONE winner both sides apply. */
var TIP_ARB_MS=500;        /* host holds the window open for the other buzz */
var TIP_NOBUZZ_MS=15000;   /* nobody buzzed — award by default, don't hang */
function tipOnline(){return NET.on&&!CPU.on}
function buzzEmit(t){
  if(!tip||!tip.armed||tip.buzz>=0||tip.decided)return;
  if(NET.on&&NET.role!==t)return;
  if(CPU.on&&t===CPU.team)return;   /* hands off the machine's buzzer */
  if(!tipOnline()){tipBuzz(t);return;}
  if(tip.sent)return;               /* one buzz per phone */
  tip.sent=true;
  var delta=tip.revealAt?(Date.now()-tip.revealAt):0;
  if(window.BKAudio)BKAudio.sfx('buzzer');
  g('tzA').classList.add('lock');g('tzB').classList.add('lock');
  g('tipMsg').textContent='Buzzed in '+(delta/1000).toFixed(2)+'s — waiting on the call…';
  if(NET.role===0)tipHostBuzz(0,delta);
  else netEv({a:'tipbuzz',team:NET.role,delta:delta});
}
function tipHostBuzz(team,delta){
  if(NET.role!==0||!tip||tip.decided)return;
  tip.buzzes=tip.buzzes||{};
  if(tip.buzzes[team]==null)tip.buzzes[team]=delta;
  if(tip.arbTimer)return;                   /* window already open */
  tip.arbTimer=setTimeout(function(){
    if(!tip||tip.decided)return;
    var a=tip.buzzes[0],b=tip.buzzes[1],win;
    if(a==null)win=1; else if(b==null)win=0; else win=(a<=b)?0:1;
    tipDecide(win,false);
  },TIP_ARB_MS);
}
function tipDecide(winner,noBuzz){
  if(!tip||tip.decided)return;
  netEv({a:'tipbuzzwin',winner:winner,noBuzz:!!noBuzz});
  tipApplyBuzzWin(winner,noBuzz);
}
function tipApplyBuzzWin(winner,noBuzz){
  if(!tip||tip.decided)return;
  tip.decided=true;
  if(tip.arbTimer){clearTimeout(tip.arbTimer);tip.arbTimer=null;}
  if(tip.noBuzzTimer){clearTimeout(tip.noBuzzTimer);tip.noBuzzTimer=null;}
  if(noBuzz){tip.buzz=winner;tipAnswer(true,true);return;}
  tipBuzz(winner);
}
g('tzA').addEventListener('pointerdown',function(){buzzEmit(0)});
g('tzB').addEventListener('pointerdown',function(){buzzEmit(1)});

/* ========== setup flow ========== */
var setupCfg={league:null,decade:null,target:11,rosters:null,
  /* bracketMode 'same' = one level for the room · 'handicap' = each player their own.
     brackets[team] is a BRACKETS key. Set at room creation; the guest is shown it. */
  bracketMode:'same',brackets:['baller','baller']};

/* ===== The Toss-Up (versus opener → THE CALL) — knowledge earns the setup rights =====
   ONLINE FAIRNESS MODEL: the relay server is a dumb pipe, so the HOST (role 0)
   arbitrates — the same pattern the rebound battle already uses. Each phone
   measures its OWN reaction time (ms from ITS question reveal to ITS buzz) and
   sends that delta; the host compares DELTAS, never arrival times, so network
   lag can never steal a buzz. Host opens a short window after the first buzz so
   a slower packet still gets counted. */
var TU={winner:0};
var TU_ARB_MS=500;      /* how long the host waits for the other buzz */
var TU_NOBUZZ_MS=15000; /* nobody buzzed — award by default (documented, rare) */
function tuOnline(){return NET.on&&!CPU.on}
function tuPickQI(){
  var pool=[];
  for(var i=0;i<QUESTIONS.length;i++)if(QUESTIONS[i].l==='any'&&QUESTIONS[i].t<=2)pool.push(i);
  if(!pool.length)for(var j=0;j<QUESTIONS.length;j++)if(QUESTIONS[j].l==='any')pool.push(j);
  if(!pool.length)for(var k=0;k<QUESTIONS.length;k++)pool.push(k);
  return pool[Math.floor(Math.random()*pool.length)];
}
function tuReset(){
  g('tuHow').classList.add('on');g('tuPlay').classList.remove('on');g('tuCall').classList.remove('on');
  g('tuWho').classList.remove('on');var an=g('tuAns');an.classList.remove('on');an.innerHTML='';
  var bz=g('tuBuzzes');bz.style.display='';
  var bs=bz.querySelectorAll('.tu-buzz');for(var i=0;i<bs.length;i++){bs[i].classList.remove('dim');bs[i].disabled=false;}
  g('tuHint').textContent='Slap your buzzer the second you know it.';
  var op=g('screen-tossup').querySelector('.tu-pow');if(op)op.remove();
  var cl=g('tuCall').querySelectorAll('.tu-call');for(var j=0;j<cl.length;j++)cl[j].classList.remove('pick');
  g('tuCd').classList.remove('on');
  var rb=g('tuReady');if(rb){rb.disabled=false;rb.textContent="I'm ready →";}
}
function startTossup(){
  if(TU.arbTimer)clearTimeout(TU.arbTimer);
  if(TU.noBuzzTimer)clearTimeout(TU.noBuzzTimer);
  TU={winner:0,ready:{},buzzes:{},decided:false};
  tuReset();
  if(tuOnline()){
    g('tuHint').textContent='Only YOUR buzzer works — your friend has theirs.';
    /* dim the opponent's slab: you can only buzz your own side */
    var mine=NET.role,bs=g('tuBuzzes').querySelectorAll('.tu-buzz');
    for(var i=0;i<bs.length;i++){
      var side=+bs[i].dataset.side;
      if(side!==mine){bs[i].classList.add('dim');bs[i].disabled=true;}
    }
  }
  show('tossup');
}
g('tuBack').addEventListener('click',function(){
  if(tuOnline())return;      /* no bailing out of a live room mid-toss-up */
  show('title');
});
function tuCountdown(then){
  if(document.body.classList.contains('reduce-motion')){then();return;}
  var ov=g('tuCd'),el=g('tuCdn'),n=5;
  el.textContent=n;ov.classList.add('on');el.classList.remove('tick');void el.offsetWidth;el.classList.add('tick');
  var iv=setInterval(function(){
    n--;
    if(n<=0){clearInterval(iv);ov.classList.remove('on');then();return;}
    el.textContent=n;el.classList.remove('tick');void el.offsetWidth;el.classList.add('tick');
  },800);
}
g('tuReady').addEventListener('click',function(){
  if(tuOnline()){
    /* both players must ready up; the host fires the question when both are in */
    this.disabled=true;this.textContent='Waiting for your friend…';
    tuMarkReady(NET.role);
    if(NET.role!==0)netEv({a:'tuready',team:NET.role});
    return;
  }
  g('tuHow').classList.remove('on');
  tuCountdown(function(){TU.qi=tuPickQI();tuShowQuestion();});
});
function tuMarkReady(team){
  TU.ready=TU.ready||{};TU.ready[team]=true;
  if(NET.role!==0)return;                      /* only the host starts the beat */
  if(!(TU.ready[0]&&TU.ready[1]))return;
  var qi=tuPickQI();
  netEv({a:'tugo',qi:qi});
  tuGo(qi);
}
function tuGo(qi){
  TU.qi=qi;
  g('tuHow').classList.remove('on');
  tuCountdown(function(){tuShowQuestion();});
}
function tuShowQuestion(){
  TU.q=QUESTIONS[TU.qi]||QUESTIONS[0];
  TU.revealAt=Date.now();
  g('tuQ').textContent=TU.q.q;
  g('tuPlay').classList.add('on');
  if(tuOnline()&&NET.role===0){
    /* safety net: if neither phone buzzes, don't hang the room */
    TU.noBuzzTimer=setTimeout(function(){
      if(TU.decided)return;
      tuDecide(1,true);      /* default to the guest — the host already got setup */
    },TU_NOBUZZ_MS);
  }
}
(function(){
  var bs=g('tuBuzzes').querySelectorAll('.tu-buzz');
  for(var i=0;i<bs.length;i++){(function(bz){
    bz.addEventListener('click',function(){
      var side=+bz.dataset.side;
      if(tuOnline()&&side!==NET.role)return;        /* not your buzzer */
      if(TU.decided||TU.buzzed!=null)return;
      var delta=TU.revealAt?(Date.now()-TU.revealAt):0;
      if(window.BKAudio)BKAudio.sfx('buzzer');
      if(!tuOnline()){                               /* local: first tap wins outright */
        TU.buzzed=side;tuShowBuzzer(side);tuRenderAnswers(side);return;
      }
      TU.buzzed=side;
      var all=g('tuBuzzes').querySelectorAll('.tu-buzz');
      for(var k=0;k<all.length;k++){all[k].classList.add('dim');all[k].disabled=true;}
      g('tuHint').textContent='Buzzed in '+(delta/1000).toFixed(2)+'s — waiting on the call…';
      if(NET.role===0)tuHostBuzz(0,delta);
      else netEv({a:'tubuzz',team:NET.role,delta:delta});
    });
  })(bs[i]);}
})();
/* ---- host-side arbitration ---- */
function tuHostBuzz(team,delta){
  if(NET.role!==0||TU.decided)return;
  TU.buzzes=TU.buzzes||{};
  if(TU.buzzes[team]==null)TU.buzzes[team]=delta;
  if(TU.arbTimer)return;                    /* window already open */
  TU.arbTimer=setTimeout(function(){
    if(TU.decided)return;
    var a=TU.buzzes[0],b=TU.buzzes[1],win;
    if(a==null)win=1; else if(b==null)win=0; else win=(a<=b)?0:1;
    tuDecide(win,false);
  },TU_ARB_MS);
}
function tuDecide(winner,noBuzz){
  if(TU.decided)return;
  TU.decided=true;
  if(TU.arbTimer){clearTimeout(TU.arbTimer);TU.arbTimer=null;}
  if(TU.noBuzzTimer){clearTimeout(TU.noBuzzTimer);TU.noBuzzTimer=null;}
  netEv({a:'tubuzzwin',winner:winner,noBuzz:!!noBuzz});
  tuApplyBuzzWin(winner,noBuzz);
}
function tuApplyBuzzWin(winner,noBuzz){
  TU.decided=true;TU.buzzWinner=winner;
  if(TU.arbTimer){clearTimeout(TU.arbTimer);TU.arbTimer=null;}
  if(TU.noBuzzTimer){clearTimeout(TU.noBuzzTimer);TU.noBuzzTimer=null;}
  var all=g('tuBuzzes').querySelectorAll('.tu-buzz');
  for(var k=0;k<all.length;k++){all[k].classList.add('dim');all[k].disabled=true;}
  tuShowBuzzer(winner,noBuzz);
  var mine=tuOnline()?NET.role:winner;
  if(winner===mine)tuRenderAnswers(winner);
  else g('tuHint').textContent=(winner===0?'Orange':'Blue')+' is answering…';
}
function tuShowBuzzer(side,noBuzz){
  g('tuBuzzes').style.display='none';
  var who=g('tuWho');
  who.textContent=noBuzz?((side===0?'Orange':'Blue')+' gets it — no buzz!')
                        :((side===0?'Orange':'Blue')+' buzzed!');
  who.classList.add('on');
  if(!noBuzz)g('tuHint').textContent=(side===0?'Orange':'Blue')+' — lock in your answer.';
}
function tuRenderAnswers(side){
  var q=TU.q,ans=g('tuAns');ans.innerHTML='';
  var idx=[0,1,2,3];
  for(var i=idx.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=idx[i];idx[i]=idx[j];idx[j]=t;}
  var correct=(q.a||0);
  idx.forEach(function(ci){
    if(q.c[ci]===undefined)return;
    var b=document.createElement('button');b.textContent=q.c[ci];b.dataset.ok=(ci===correct)?'1':'0';
    b.addEventListener('click',function(){
      var btns=ans.querySelectorAll('button');for(var m=0;m<btns.length;m++)btns[m].disabled=true;
      var ok=b.dataset.ok==='1';
      b.classList.add(ok?'good':'bad');
      if(!ok)for(var n2=0;n2<btns.length;n2++)if(btns[n2].dataset.ok==='1')btns[n2].classList.add('good');
      if(tuOnline())netEv({a:'tuans',ok:ok,side:side});
      tuResolveAnswer(ok,side);
    });
    ans.appendChild(b);
  });
  ans.classList.add('on');
}
function tuResolveAnswer(ok,side){
  if(ok){g('tuHint').innerHTML='✓ Got it!';tuWin(side);}
  else{
    g('tuHint').textContent='Brick! '+(side===0?'Blue':'Orange')+' steals THE CALL.';
    setTimeout(function(){tuWin(side===0?1:0);},1000);
  }
}
function tuWin(side){
  TU.winner=side;setupCfg.tossWinner=side;
  var mine=tuOnline()?NET.role:side;
  g('tuWonEy').textContent=(side===0?'Orange':'Blue')+' won the toss-up';
  var slam=g('tuCall').querySelector('.tu-won .big');
  if(slam)slam.textContent=(!tuOnline()||side===mine)?"You've got the Call!"
                                                    :(side===0?'Orange':'Blue')+' has the Call';
  var hint=g('tuCall').querySelector('.tu-hint2');
  if(hint)hint.textContent=(!tuOnline()||side===mine)?'tap one · it slams · your friend gets the other'
                                                     :'waiting on their pick…';
  setTimeout(function(){g('tuPlay').classList.remove('on');g('tuCall').classList.add('on');},800);
}
function tuBurst(w){var host=g('screen-tossup'),o=host.querySelector('.tu-pow');if(o)o.remove();
  var p=document.createElement('div');p.className='tu-pow';p.innerHTML='<b>'+w+'</b>';host.appendChild(p);
  setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p);},900);}
function tuApplyCall(pick){
  var cs=g('tuCall').querySelectorAll('.tu-call');
  for(var k=0;k<cs.length;k++){
    cs[k].classList.remove('pick');
    if(cs[k].dataset.k===pick)cs[k].classList.add('pick');
  }
  setupCfg.theCall={winner:TU.winner,pick:pick};
  tuBurst('Locked!');
  var advance=function(){
    /* league/era/length were locked by the room creator BEFORE the code existed,
       so there is no matchup left to pick — the winner's prize is the only thing
       decided here. Going back to the league screen would re-ask a settled
       question. Handicap rooms pick levels first, then straight into the match. */
    if(setupCfg.bracketMode==='handicap'){startHandicap();return;}
    if(!tuOnline()){show('league');return;}   /* local hot-seat still walks setup */
    beginMatch();
  };
  if(document.body.classList.contains('reduce-motion')){advance();return;}
  setTimeout(function(){navSlam(advance);},900);
}
(function(){
  var cs=g('tuCall').querySelectorAll('.tu-call');
  for(var i=0;i<cs.length;i++){(function(c){
    c.addEventListener('click',function(){
      if(tuOnline()&&TU.winner!==NET.role)return;   /* only the winner picks */
      var pick=c.dataset.k;
      if(tuOnline())netEv({a:'tucall',pick:pick});
      tuApplyCall(pick);
    });
  })(cs[i]);}
})();
/* ---- league ROLODEX (Step 1): realistic balls + Sedgwick slam language ---- */
var LG_LEAGUES=[
  {id:'nba',    name:'NBA',            fmt:'5v5 · full court', graf:'THE SHOW', ball:'classic', rc:'#f5872e', gr:'#ff9a48', play:'nba'},
  {id:'wnba',   name:'WNBA',           fmt:'5v5 · full court', graf:'THE W',    ball:'oatmeal', rc:'#e6a7b4', gr:'#ffb6c6', play:'wnba'},
  /* BIG3 and World are IN THE LAB until their data is honest. BIG3 has zero
     superstar-tier players, so its Legendary/Hall of Fame packs are cosmetic
     lies right now; World has career stats for 3 of its 60 players. Both are
     fully playable engines — they're gated on the player DB, not on code. */
  {id:'big3',   name:'BIG3',           fmt:'3v3 · half court', graf:"3'S UP",   ball:'aba',     rc:'#d8b25a', gr:'#ffd76a', lock:1},
  {id:'world',  name:'World',          fmt:'5v5 · FIBA rules', graf:'GLOBAL',   ball:'molten',  rc:'#6fd0c3', gr:'#7fe4d6', lock:1},
  {id:'college',name:'College',        fmt:'the dance',        graf:'MADNESS',  ball:'classic', rc:'#8fa8d0', gr:'#a9c2ee', lock:1},
  {id:'gleague',name:'G League',       fmt:'the grind',        graf:'NEXT UP',  ball:'classic', rc:'#b3a08a', gr:'#cfc0a0', lock:1},
  {id:'street', name:'Street Legends', fmt:'no refs',          graf:'NO REFS',  ball:'street',  rc:'#c08a5a', gr:'#e0a86a', lock:1}
];
function lrSeams(){return '<g fill="none" stroke="#170f05" stroke-width="2.5" stroke-linecap="round" opacity=".92"><circle cx="50" cy="50" r="45.5"/><path d="M50 5V95"/><path d="M6.5 50H93.5"/><path d="M20 17.5Q50 43 80 17.5"/><path d="M20 82.5Q50 57 80 82.5"/></g>';}
function lrSphere(id,l,b,d){return '<defs><radialGradient id="'+id+'" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="'+l+'"/><stop offset="52%" stop-color="'+b+'"/><stop offset="100%" stop-color="'+d+'"/></radialGradient></defs><circle cx="50" cy="50" r="45.5" fill="url(#'+id+')"/>';}
function lrBall(type,uid){
  var id='lrg'+uid, s='<svg class="lr-ball" viewBox="0 0 100 100">';
  if(type==='classic'){s+=lrSphere(id,'#f0a05a','#d4712b','#8f4614')+lrSeams();}
  else if(type==='oatmeal'){s+=lrSphere(id,'#f0a05a','#d4712b','#8f4614')+'<clipPath id="lrc'+uid+'"><circle cx="50" cy="50" r="45.5"/></clipPath><g clip-path="url(#lrc'+uid+')"><rect x="50" y="0" width="50" height="100" fill="#e7d5ab"/><rect x="50" y="0" width="50" height="100" fill="#cbb684" opacity=".35"/></g>'+lrSeams();}
  else if(type==='aba'){s+='<clipPath id="lrc'+uid+'"><circle cx="50" cy="50" r="45.5"/></clipPath><g clip-path="url(#lrc'+uid+')"><rect x="0" y="0" width="34" height="100" fill="#c4362f"/><rect x="34" y="0" width="32" height="100" fill="#e9e4d8"/><rect x="66" y="0" width="34" height="100" fill="#2f5aa0"/><circle cx="50" cy="50" r="45.5" fill="url(#lrsh'+uid+')"/></g><defs><radialGradient id="lrsh'+uid+'" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="55%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".3"/></radialGradient></defs>'+lrSeams();}
  else if(type==='molten'){s+=lrSphere(id,'#f4a94f','#e07a24','#9c4e12')+'<clipPath id="lrc'+uid+'"><circle cx="50" cy="50" r="45.5"/></clipPath><g clip-path="url(#lrc'+uid+')" fill="#ecdcb4"><path d="M20 17.5Q50 43 80 17.5L80 -6 20 -6Z" opacity=".92"/><path d="M20 82.5Q50 57 80 82.5L80 106 20 106Z" opacity=".92"/></g>'+lrSeams();}
  else if(type==='street'){s+=lrSphere(id,'#c68a54','#a86a3e','#5e3a20')+'<clipPath id="lrc'+uid+'"><circle cx="50" cy="50" r="45.5"/></clipPath><g clip-path="url(#lrc'+uid+')" opacity=".5"><ellipse cx="30" cy="70" rx="13" ry="7" fill="#7a5030" opacity=".5"/><ellipse cx="70" cy="34" rx="10" ry="6" fill="#d9ab7c" opacity=".4"/><circle cx="62" cy="66" r="2.4" fill="#4c2f18"/><circle cx="40" cy="30" r="1.8" fill="#4c2f18"/><circle cx="74" cy="58" r="1.5" fill="#e0b98c" opacity=".7"/></g><g fill="none" stroke="#221408" stroke-width="2.5" stroke-linecap="round" opacity=".8"><circle cx="50" cy="50" r="45.5"/><path d="M50 5V95"/><path d="M6.5 50H93.5"/><path d="M20 17.5Q50 43 80 17.5"/><path d="M20 82.5Q50 57 80 82.5"/></g>';}
  return s+'</svg>';
}
var lgRolo=g('lgRolo');
function lrClearPows(){var ps=lgRolo.querySelectorAll('.lr-pow');for(var i=0;i<ps.length;i++)ps[i].remove();}
function lrShakeRolo(){lgRolo.classList.remove('shake');void lgRolo.offsetWidth;lgRolo.classList.add('shake');}
function lrSlam(d){d.classList.remove('slam');void d.offsetWidth;d.classList.add('slam');}
function lrOpen(d){
  lrClearPows();
  var cs=lgRolo.querySelectorAll('.lr-card');
  for(var i=0;i<cs.length;i++){cs[i].classList.remove('active','slam','committed');cs[i].style.zIndex=cs[i].dataset.z;}
  d.classList.add('active');d.style.zIndex=300;lrSlam(d);
  setTimeout(lrShakeRolo,430);
}
function lrBurst(d,word){
  lrClearPows();
  var rot=(((d.dataset.z|0)%2)?-1:1)*(10+((d.dataset.z|0)%8));
  var pow=document.createElement('div');pow.className='lr-pow';
  pow.innerHTML='<b style="--rot:'+rot+'deg">'+word+'</b>';
  d.appendChild(pow);
  setTimeout(function(){pow.style.opacity='0';setTimeout(function(){if(pow.parentNode)pow.parentNode.removeChild(pow);},320);},900);
}
function lrCommit(d){
  var lg=d.dataset.play;if(!lg)return;
  d.classList.add('committed');lrSlam(d);setTimeout(lrShakeRolo,430);
  lrBurst(d,"LET'S BALL!");
  var go=d.querySelector('.lr-go');if(go)go.innerHTML='LOCKED IN <span class="arw">✓</span>';
  setTimeout(function(){
    setupCfg.league=lg;
    if(Object.keys(ROSTERS[lg]).length<=1){setupCfg.decade=['FULL'];afterEras();}
    else buildDecadeScreen();
  },520);
}
(function buildLeagueRolo(){
  LG_LEAGUES.forEach(function(x,i){
    var d=document.createElement('div');
    d.className='lr-card'+(x.lock?' lock':'');
    d.style.setProperty('--rc',x.rc);d.style.setProperty('--gr',x.gr);
    d.dataset.z=100-i;d.style.zIndex=100-i;
    if(x.play)d.dataset.play=x.play;
    var two=(x.graf.indexOf(' ')>0&&x.graf.length>7);
    var g2=two?x.graf.replace(' ','<span class="l2">')+'</span>':x.graf;
    d.innerHTML=lrBall(x.ball,i)
      +'<div class="lr-mid"><div class="lr-name">'+x.name+'</div></div>'
      +'<div class="lr-tag'+(two?' two':'')+'">'+g2+'</div>'
      +'<div class="lr-fmt">'+x.fmt+'</div>'
      +(x.lock?'':'<button class="lr-go">LET\'S BALL <span class="arw">→</span></button>')
      +'<div class="lr-tab">'+(x.lock?'<span class="lk">🔒 In the lab</span>':'<span>tap</span>')+'</div>';
    d.addEventListener('click',function(){
      if(x.lock){d.classList.remove('wiggle');void d.offsetWidth;d.classList.add('wiggle');return;}
      if(d.classList.contains('active')){lrCommit(d);return;}
      lrOpen(d);
    });
    var go=d.querySelector('.lr-go');
    if(go)go.addEventListener('click',function(e){e.stopPropagation();lrCommit(d);});
    lgRolo.appendChild(d);
  });
})();
var ERA_NICK={'50s':'Territorial','60s':'Pioneers','70s':'ABA Days','80s':'Showtime',
  '90s':'Hand-Check','00s':'Iso Ball','10s':'Splash','20s':'Now'};
function buildDecadeScreen(){
  var beads=g('decadeGrid');beads.innerHTML='';
  var tl=g('etTL'),cap=g('etCap'),fullB=g('etFull');
  var eraKeys=Object.keys(ROSTERS[setupCfg.league]);
  var sel={};
  function isFull(){return tl.classList.contains('full');}
  function syncCfg(){
    var keys=eraKeys.filter(function(k){return sel[k];});
    setupCfg.decade=(isFull()||!keys.length)?['FULL']:keys;
  }
  function render(){
    if(isFull())cap.innerHTML='<b>Full Knowledge</b> — every era in play';
    else{
      var order=eraKeys.filter(function(k){return sel[k];}).map(function(k){return '’'+k;});
      cap.innerHTML=order.length?'Mixing: <b>'+order.join(' · ')+'</b>':'';
    }
    syncCfg();
  }
  function setFull(){
    tl.classList.add('full');fullB.classList.add('on');sel={};
    var bs=beads.querySelectorAll('.et-bead');for(var i=0;i<bs.length;i++)bs[i].classList.add('on');
    render();
  }
  eraKeys.forEach(function(k){
    var d=document.createElement('div');d.className='et-bead';d.setAttribute('data-era',k);
    var nick=ERA_NICK[k]||('The ’'+k);
    d.innerHTML='<div class="et-dot">'+(k==='20s'?'<span class="et-now"></span>':'')+'’'+k.replace('s','')+'</div>'
      +'<div class="et-lab">'+nick+'</div>';
    d.addEventListener('click',function(){
      if(isFull()){tl.classList.remove('full');fullB.classList.remove('on');sel={};
        var bs=beads.querySelectorAll('.et-bead');for(var i=0;i<bs.length;i++)bs[i].classList.remove('on');}
      if(sel[k]){delete sel[k];d.classList.remove('on');}
      else{sel[k]=true;d.classList.add('on');d.classList.remove('slam');void d.offsetWidth;d.classList.add('slam');}
      if(!eraKeys.filter(function(x){return sel[x];}).length)setFull();
      else render();
    });
    beads.appendChild(d);
  });
  fullB.onclick=setFull;
  g('decadeTitle').innerHTML=MODES[setupCfg.league].label+
    ' · mix your <span style="color:var(--accent)">eras</span>';
  g('etSub').textContent='tap the timeline — mix any decades';
  setFull();
  show('decade');
}
function etBurst(word){
  var host=g('screen-decade'),old=host.querySelector('.et-pow');if(old)old.remove();
  var pow=document.createElement('div');pow.className='et-pow';pow.innerHTML='<b>'+word+'</b>';
  host.appendChild(pow);
  setTimeout(function(){if(pow.parentNode)pow.parentNode.removeChild(pow);},700);
}
g('btnDecGo').addEventListener('click',function(){
  if(document.body.classList.contains('reduce-motion')){afterEras();return;}
  etBurst('Run it!');setTimeout(afterEras,470);
});
function afterEras(){
  if(NET.on||ROOMSET){
    /* online: squads get picked by BOTH players after house rules */
    setupCfg.rosters=pickRosters(setupCfg.league,setupCfg.decade);
    show('rules');
    return;
  }
  buildSquadScreen();
}
/* ===== Squad reveal — pack-rarity starting five (per-team, EDGE locks first) =====
   INTERIM tiering: current rosters are all stars, so tier = superstar (curated
   set) vs all-star, and rarity = superstar DENSITY. The true role tier + real
   "1 star + 4 role" commons light up when the deep-research player DB lands. */
var SR_SUPERSTARS={};
("Michael Jordan|LeBron James|Kareem Abdul-Jabbar|Magic Johnson|Larry Bird|Bill Russell|Wilt Chamberlain|Shaquille O'Neal|Tim Duncan|Kobe Bryant|Hakeem Olajuwon|Stephen Curry|Kevin Durant|Oscar Robertson|Jerry West|Moses Malone|Karl Malone|David Robinson|Charles Barkley|Kevin Garnett|Dirk Nowitzki|Allen Iverson|Julius Erving|Elgin Baylor|John Stockton|Isiah Thomas|Scottie Pippen|Dwyane Wade|Steve Nash|Patrick Ewing|Giannis Antetokounmpo|Nikola Jokic|Bob Pettit|Rick Barry|Elvin Hayes|Walt Frazier|Willis Reed|Nate Archibald|Pete Maravich|Reggie Miller|Ray Allen|Chris Paul|James Harden|Russell Westbrook|Anthony Davis|Damian Lillard|Kawhi Leonard|Paul Pierce|Vince Carter|Carmelo Anthony|Tracy McGrady|Yao Ming|Dwight Howard|Gary Payton|Clyde Drexler|Dominique Wilkins|Kevin McHale|Robert Parish|Diana Taurasi|Sheryl Swoopes|Lisa Leslie|Maya Moore|Cynthia Cooper|Sue Bird|Tamika Catchings|Candace Parker|Breanna Stewart|A'ja Wilson").split("|").forEach(function(n){SR_SUPERSTARS[n]=1;});
var SR_DB={};   /* name -> tier letter from the research player DB (players.js) */
(function(){
  if(typeof PLAYERDB==='undefined')return;
  for(var i=0;i<PLAYERDB.length;i++){
    var p=PLAYERDB[i],t=p.tier==='superstar'?'S':(p.tier==='allstar'?'A':'R');
    /* keep the STRONGEST tier if a name spans leagues (NBA identity wins) */
    var rk={S:3,A:2,R:1};
    if(!(p.name in SR_DB)||rk[t]>rk[SR_DB[p.name]])SR_DB[p.name]=t;
  }
})();
/* ===== player stat lines (Phase 2.1) =====================================
   Real career numbers straight off the research DB. A player with no verified
   stats shows an ACCOLADE instead — streetball and Negro League box scores
   largely were never kept, and an honest "led the nation in scoring" beats a
   fabricated average. Never invent a number to fill the slot. */
var SR_STATS={};
(function(){
  if(typeof PLAYERDB==='undefined')return;
  for(var i=0;i<PLAYERDB.length;i++){
    var p=PLAYERDB[i],c=p.career||{};
    var have=Object.keys(c).length;
    var rec={c:c,peak:p.peak||null,acc:(p.accolades||[])[0]||'',_n:have};
    /* a name can span leagues — keep the record with the most complete line */
    var keys=[p.name];
    /* the DB stores some players with their nickname inline ("Nate 'Tiny'
       Archibald") while the roster uses the plain name. Index BOTH. This strips
       a quoted nickname only — it never guesses at a different person. */
    var plain=p.name.replace(/\s*["'\u2018\u2019\u201c\u201d][^"'\u2018\u2019\u201c\u201d]+["'\u2018\u2019\u201c\u201d]\s*/g,' ')
                    .replace(/\s+/g,' ').trim();
    if(plain&&plain!==p.name)keys.push(plain);
    for(var q=0;q<keys.length;q++){
      var k=keys[q],prev=SR_STATS[k];
      if(!prev||have>prev._n)SR_STATS[k]=rec;
    }
  }
})();
function srStatLine(name,pos){
  var e=SR_STATS[name];if(!e)return null;
  var c=e.c||{},out=[];
  function add(k,lbl,dp){
    if(c[k]==null)return;
    out.push({v:(dp===0?Math.round(c[k]):Number(c[k]).toFixed(1)),l:lbl});
  }
  add('ppg','PPG');
  /* the second and third slots follow what the position is actually about */
  if(pos==='C'||pos==='PF'){add('rpg','RPG');add('bpg','BPG');add('apg','APG');}
  else if(pos==='PG'){add('apg','APG');add('rpg','RPG');add('spg','SPG');}
  else {add('rpg','RPG');add('apg','APG');add('spg','SPG');}
  return out.length?out.slice(0,3):null;
}
function srAccolade(name){
  var e=SR_STATS[name];
  if(!e||!e.acc)return '';
  var a=e.acc;
  return a.length>46?a.slice(0,44).replace(/[\s,;:]+$/,'')+'\u2026':a;
}
/* full stat sheet for the inspect flip. srStatLine gives the ONE hero number that
   fits on a 69px card; this gives everything we actually have. */
function srFullStats(name,pos){
  var e=SR_STATS[name];if(!e)return null;
  var c=e.c||{},rows=[];
  var ORDER=[['ppg','Points'],['rpg','Rebounds'],['apg','Assists'],['spg','Steals'],
             ['bpg','Blocks'],['fg_pct','FG%'],['fg3_pct','3P%'],['ft_pct','FT%'],
             ['g','Games'],['pts','Career pts']];
  ORDER.forEach(function(o){
    var k=o[0],v=c[k];if(v==null)return;
    var out;
    if(k==='g'||k==='pts')out=String(v).replace(/\B(?=(\d{3})+(?!\d))/g,',');
    else if(k.indexOf('_pct')>0)out=(v<=1?(v*100).toFixed(1):Number(v).toFixed(1))+'%';
    else out=Number(v).toFixed(1);
    rows.push({k:o[1],v:out});
  });
  return {rows:rows,peak:e.peak||null,acc:e.acc||''};
}
function srSheetHTML(name,pos,tier){
  var f=srFullStats(name,pos);
  var tc=SR_TC[tier]||'#b3a894';
  var h='<div class="ins-card" style="--tc:'+tc+'">';
  h+='<div class="ins-top"><span class="ins-pos">'+pos+'</span>'+
     '<span class="ins-tier">'+(tier==='S'?'Superstar':tier==='A'?'All-Star':'Role')+'</span></div>';
  h+='<div class="ins-nm">'+name+'</div>';
  if(f&&f.rows.length){
    h+='<div class="ins-lbl">Career</div><div class="ins-rows">';
    f.rows.forEach(function(r){
      h+='<div class="ins-r"><span>'+r.k+'</span><b>'+r.v+'</b></div>';});
    h+='</div>';
    if(f.peak&&f.peak.season)
      h+='<div class="ins-peak"><span>Peak</span><b>'+f.peak.season+
         (f.peak.ppg!=null?' \u00b7 '+Number(f.peak.ppg).toFixed(1)+' ppg':'')+'</b></div>';
  }else{
    h+='<div class="ins-none">No verified box score for this player yet.</div>';
  }
  if(f&&f.acc)h+='<div class="ins-acc">'+f.acc+'</div>';
  h+='<div class="ins-hint">tap to close</div></div>';
  return h;
}
var INS=null;
function srInspect(name,pos,tier){
  var v=g('insveil');if(!v)return;
  v.innerHTML=srSheetHTML(name,pos,tier);
  v.classList.add('on');
  requestAnimationFrame(function(){v.classList.add('flip')});
  if(window.BKAudio)BKAudio.sfx('click');
  INS=name;
}
function srInspectClose(){
  var v=g('insveil');if(!v)return;
  v.classList.remove('flip');v.classList.remove('on');INS=null;
}
function srTierOf(n){
  if(SR_DB[n])return SR_DB[n];                 /* real research tier */
  return SR_SUPERSTARS[n]?'S':'A';             /* interim fallback for unmatched names */
}
var SR_TC={S:'#ffcf6a',A:'#b98cff',R:'#9a8f7c'};
var SR_RC={common:'#9a8f7c',rare:'#58a8d6',epic:'#b98cff',legendary:'#ffcf6a',halloffame:'#ffd76a'};
/* RARITY = SUPERSTAR DENSITY, and the labels must say so.
   'stars' is how many of the five slots are reserved for a SUPERSTAR. The other
   slots are filled from everyone else — and in the current rosters that is almost
   entirely All-Stars: the pool is 69 superstars, 104 all-stars and just THREE
   role players. So a Common pack cannot deliver "role support"; it hands you one
   superstar and four all-stars, which is exactly what it should say it does.
   When depth players land in the DB, Common can mean role support again. */
var SR_RARITY=[
  {k:'common',lbl:'Common',desc:'1 superstar · 4 all-stars',stars:1,w:40},
  {k:'rare',lbl:'Rare',desc:'2 superstars · a real one-two',stars:2,w:28},
  {k:'epic',lbl:'Epic',desc:'3 superstars · the big three',stars:3,w:20},
  {k:'legendary',lbl:'Legendary',desc:'4 superstars · stacked',stars:4,w:9},
  {k:'halloffame',lbl:'Hall of Fame',desc:'all five · the immortals',stars:5,w:3}
];
function srRollRarity(){
  var tot=0;SR_RARITY.forEach(function(r){tot+=r.w;});var x=Math.random()*tot;
  for(var i=0;i<SR_RARITY.length;i++){x-=SR_RARITY[i].w;if(x<=0)return SR_RARITY[i];}
  return SR_RARITY[0];
}
function srPickSquad(starCount,exclude){
  var league=setupCfg.league,decade=setupCfg.decade,src=ROSTERS[league],lineup=MODES[league].lineup;
  var decs=Array.isArray(decade)?decade.slice():[decade];
  if(!decs.length||decs.indexOf('FULL')>=0)decs=Object.keys(src);
  decs=decs.filter(function(d){return src[d]});if(!decs.length)decs=Object.keys(src);
  var pool={};lineup.forEach(function(p){pool[p]=[]});
  decs.forEach(function(d){lineup.forEach(function(p){(src[d][p]||[]).forEach(function(pl){pool[p].push(pl)})})});
  var used={};(exclude||[]).forEach(function(n){used[n]=true});
  var idxs=lineup.map(function(_,i){return i;});
  for(var i=idxs.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=idxs[i];idxs[i]=idxs[j];idxs[j]=t;}
  var starSlots={};for(var k=0;k<Math.min(starCount,lineup.length);k++)starSlots[idxs[k]]=true;
  var r={};
  lineup.forEach(function(p,i){
    var wantS=!!starSlots[i];
    var avail=pool[p].filter(function(pl){return !used[pl.n];});
    var tiered=avail.filter(function(pl){return (srTierOf(pl.n)==='S')===wantS;});
    var opts=tiered.length?tiered:(avail.length?avail:pool[p]);
    var pick=opts[Math.floor(Math.random()*opts.length)]||pool[p][0];
    used[pick.n]=true;r[p]={n:pick.n,num:pick.num,tier:srTierOf(pick.n)};
  });
  return r;
}
var SR_SHUFFLES=5;
var SR={order:[0,1],idx:0,squads:[null,null],shuffles:SR_SHUFFLES,rar:null,squad:null};
function srDetermineOrder(){
  /* THE CALL: the winner takes ONE prize. Take 'first' and you pick first. Take
     'shuffles' and you traded the order away — the loser goes first instead.
     The loser never gets a bonus, just whichever slot is left over. */
  var tc=setupCfg.theCall;
  if(tc){
    var first=(tc.pick==='first')?tc.winner:(1-tc.winner);
    return [first,1-first];
  }
  return [0,1];
}
function srShuffleAllowance(team){
  var tc=setupCfg.theCall;
  return (tc&&tc.pick==='shuffles'&&tc.winner===team)?SR_SHUFFLES+2:SR_SHUFFLES;
}
function srRoll(){
  var other=SR.order[SR.order.length-1-SR.idx];
  var ex=[],lockedOther=SR.squads[other];
  if(lockedOther)MODES[setupCfg.league].lineup.forEach(function(p){ex.push(lockedOther[p].n);});
  SR.rar=srRollRarity();SR.squad=srPickSquad(SR.rar.stars,ex);srRender();
}
function srRenderPips(){
  var cap=srShuffleAllowance(SR.order[SR.idx]);
  var s='';for(var i=0;i<cap;i++)s+='<span class="sr-pip'+(i<(cap-SR.shuffles)?' used':'')+'"></span>';
  g('srPips').innerHTML='<span style="margin-right:6px">'+(SR.shuffles>0?SR.shuffles+' shuffles left':'no shuffles left')+'</span>'+s;
}
function srRender(){
  var team=SR.order[SR.idx],lineup=MODES[setupCfg.league].lineup,col=(team===0?'#f5872e':'#58a8d6'),nm=(team===0?'Orange':'Blue');
  var scr=g('screen-squad');scr.style.setProperty('--tcol',col);
  g('srTeamH').innerHTML=nm+"'s Starting <span style=\"color:"+col+"\">Five</span>";
  /* THE CALL now trades order against shuffles, so whoever is first isn't
     necessarily the winner — say which it is rather than always crowing 'EDGE'. */
  var tc=setupCfg.theCall,edgeNote='';
  if(tc&&SR.idx===0){
    edgeNote=(tc.pick==='first'&&tc.winner===team)
      ? ' · <b style="color:'+col+'">FIRST PICK — you won it</b>'
      : (tc.pick==='shuffles'&&tc.winner!==team)
        ? ' · <b style="color:'+col+'">you pick first</b>' : '';
  }
  g('srTurn').innerHTML='<b>'+nm+'</b> is on the clock'+edgeNote;
  var R=SR.rar;
  g('srRarSlot').innerHTML='<div class="sr-rar'+(R.k==='halloffame'?' hof':'')+'" style="--rc:'+SR_RC[R.k]+'"><div class="rl">'+R.lbl+' Pack</div><div class="rd">'+R.desc+'</div></div>';
  var five=g('srFive');five.innerHTML='';
  lineup.forEach(function(p,i){
    var pl=SR.squad[p],tier=pl.tier,tc=SR_TC[tier];
    var c=document.createElement('div');c.className='sr-card down'+((tier==='S'||tier==='A')?' star':'');
    c.style.setProperty('--tc',tc);
    var st=srStatLine(pl.n,p),statHTML;
    if(st){
      /* ONE hero stat on the card. Five cards sit side by side on a phone at ~69px
         each — three stats ran together into "20.98.06.9" and clipped their own
         labels. The full line belongs in the inspect panel, not here. */
      statHTML='<div class="sr-st"><b>'+st[0].v+'</b><i>'+st[0].l+'</i></div>';
    }else{
      /* No verified stats. Show an accolade if we have one, otherwise show NOTHING.
         Do not editorialise about why — "no box score kept" is true for a Rucker
         Park legend and false for an NBA player we simply haven't researched yet,
         and the card can't tell the difference. Silence beats a false claim. */
      var acc=srAccolade(pl.n);
      statHTML=acc?'<div class="sr-acc">'+acc+'</div>':'';
    }
    c.innerHTML='<div class="sr-face sr-front"><div class="sr-pos">'+p+'</div><div class="sr-jer"><span class="num">'+pl.num+'</span><span class="ball"></span></div><div class="sr-nm">'+pl.n+'</div>'+statHTML+'<div class="sr-tb">'+(tier==='S'?'Superstar':tier==='A'?'All-Star':'Role')+'</div></div><div class="sr-face sr-back"><b>BK</b></div>';
    c.addEventListener('click',function(){srInspect(pl.n,p,tier)});
    c.style.cursor='pointer';
    five.appendChild(c);
    if(document.body.classList.contains('reduce-motion'))c.classList.remove('down');
    else setTimeout(function(){c.classList.remove('down');},150+i*160);
  });
  var pls='';lineup.forEach(function(p){pls+='<span>'+p+'</span>';});g('srPosLabels').innerHTML=pls;
  srRenderPips();
  var sh=g('srShuffle');sh.disabled=(SR.shuffles<=0);sh.textContent=SR.shuffles>0?'↻ Reshuffle':'No shuffles left';
  var cap=srShuffleAllowance(team);
  g('srOdds').innerHTML='dealt a five + <b>'+cap+' reshuffles</b>'+
    (cap>SR_SHUFFLES?' <span style="color:'+col+'">(+2 from THE CALL)</span>':'')+
    ' · rarity = how many <b>superstars</b> you land'+
    '<br>Common 40 · Rare 28 · Epic 20 · Legendary 9 · Hall of Fame 3';
}
function buildSquadScreen(){
  var order=CPU.on?[1-CPU.team]:srDetermineOrder();   /* vs CPU: only the human reveals */
  SR={order:order,idx:0,squads:[null,null],shuffles:srShuffleAllowance(order[0]),
      rar:null,squad:null};
  srRoll();show('squad');
}
g('insveil').addEventListener('click',srInspectClose);
g('srShuffle').addEventListener('click',function(){ if(SR.shuffles<=0)return;SR.shuffles--;srRoll(); });
g('srLock').addEventListener('click',function(){
  var team=SR.order[SR.idx];SR.squads[team]=SR.squad;
  if(SR.idx<SR.order.length-1){SR.idx++;SR.shuffles=srShuffleAllowance(SR.order[SR.idx]);srRoll();}
  else{
    if(CPU.on){                          /* the machine draws its five in silence */
      var ex=[],hs=SR.squads[1-CPU.team];
      MODES[setupCfg.league].lineup.forEach(function(p){ex.push(hs[p].n)});
      SR.squads[CPU.team]=cpuAutoSquad(ex);
      callout('CPU LOCKS ITS FIVE<small>'+cpuLvl().name+' is ready</small>',teamCol(CPU.team));
    }
    setupCfg.rosters=[SR.squads[0],SR.squads[1]];show('rules');
  }
});
g('lgBack').addEventListener('click',function(){show('title')});
g('decBack').addEventListener('click',function(){show('league')});
g('sqBack').addEventListener('click',function(){show(Object.keys(ROSTERS[setupCfg.league]||{}).length<=1?'league':'decade')});
g('rulesBack').addEventListener('click',function(){
  if(NET.on)show(Object.keys(ROSTERS[setupCfg.league]||{}).length<=1?'league':'decade');
  else buildSquadScreen();
});
document.querySelectorAll('.tgtbtn').forEach(function(b){
  b.addEventListener('click',function(){
    document.querySelectorAll('.tgtbtn').forEach(function(x){x.classList.remove('sel')});
    b.classList.add('sel');
    var tv=b.getAttribute('data-target');
    setupCfg.target=tv==='Q'?'Q':parseInt(tv,10);
  });
});
/* house rules: in solo/CPU this is where you set your level. Online rooms set it at
   creation instead (the guest has to be told before they commit), so it hides there. */
(function(){
  var box=g('klModes');if(!box)return;
  var bs=box.querySelectorAll('.klmode');
  for(var i=0;i<bs.length;i++){(function(b){
    b.addEventListener('click',function(){
      for(var k=0;k<bs.length;k++)bs[k].classList.remove('sel');
      b.classList.add('sel');
      setupCfg.bracketMode=b.dataset.mode;
      klRulesSync();
      if(window.BKAudio)BKAudio.sfx('click');
    });
  })(bs[i]);}
})();
/* in a handicap room the creator doesn't pick ONE level — each player picks their
   own after the toss-up — so the ladder collapses to a note instead of lying */
function klRulesSync(){
  var hc=setupCfg.bracketMode==='handicap';
  g('klRulesRow').style.display=hc?'none':'';
  g('klRulesWild').style.display=hc?'none':'';
  g('klRulesMap').style.display=hc?'none':'';
  g('klRulesBlurb').textContent=hc
    ? 'Each player picks their own level after the toss-up.'
    : ((BRACKETS[setupCfg.brackets[0]]||{}).blurb||'');
  g('klModes').style.display=(ROOMSET||NET.on)?'':'none';   /* solo has no opponent to handicap */
  g('btnTip').textContent=ROOMSET?'Get my code →':'Tip-off 🏀';
}
var klRulesPaint=klMount({row:'klRulesRow',wild:'klRulesWild',blurb:'klRulesBlurb',map:'klRulesMap'},
  function(){return setupCfg.brackets[0]},
  function(k){setupCfg.brackets[0]=k;setupCfg.brackets[1]=k;});
function beginMatch(){
  var cfg={league:setupCfg.league,decade:setupCfg.decade,
    target:setupCfg.target,
    rosters:setupCfg.rosters||pickRosters(setupCfg.league,setupCfg.decade),
    bracketMode:setupCfg.bracketMode,brackets:setupCfg.brackets.slice()};
  setupCfg.rosters=cfg.rosters;
  if(NET.on){
    if(NET.role===0){netEv({a:'pick',cfg:cfg});enterPick(cfg);}
    else{show('online');oStatus('\u2705 <b>THE CALL is set.</b><br>Dealing the squads\u2026');}
    return;
  }
  showVersus(cfg,true);
}
g('btnTip').addEventListener('click',function(){
  if(ROOMSET){roomsetFinish();return;}          /* setting up a room — go get the code */
  beginMatch();
});

/* ========== squad check (online) + versus screen ========== */
var pickCfg=null;
function squadRow(team,pos,pl){
  var d=document.createElement('div');
  d.className='sqrow '+(team===0?'oj':'bl');
  d.innerHTML='<span class="sp">'+pos+'</span><span class="sn">'+pl.n+'</span><span class="snum">#'+pl.num+'</span>';
  /* online never sees the shuffle reveal, so the roster rows are the only place
     to inspect a player there — same sheet, same tap. */
  d.style.cursor='pointer';
  d.addEventListener('click',function(){srInspect(pl.n,pos,srTierOf(pl.n))});
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
  if(window.BKAudio){setTimeout(function(){BKAudio.sfx('whoosh')},300);setTimeout(function(){BKAudio.sfx('zap')},520);setTimeout(function(){BKAudio.sfx('horn')},950);}
  if(launcher)setTimeout(function(){
    netEv({a:'start',cfg:cfg});
    startBeat(cfg);
  },3400);
}
var BEAT_LINES=['LACING UP YOUR CEREBELLUM…','SMART BALL ONLY','IQ WARMING UP…',
  'ICING THE SHOOTER…','CHALKING THE BRAIN…','LOADING THE PLAYBOOK…'];
var beatT=null,beatTick=null,beatCfg=null;
function startBeat(cfg){
  beatCfg=cfg;
  show('brains');
  var i=0,el=g('brainsTick');
  if(beatTick)clearInterval(beatTick);
  beatTick=setInterval(function(){i++;el.textContent=BEAT_LINES[i%BEAT_LINES.length]},700);
  if(beatT)clearTimeout(beatT);
  beatT=setTimeout(endBeat,2600);
}
function endBeat(){
  if(!beatCfg)return;
  if(beatTick){clearInterval(beatTick);beatTick=null}
  if(beatT){clearTimeout(beatT);beatT=null}
  var cfg=beatCfg;beatCfg=null;
  startGame(cfg);markGame(true);show('game');
}
g('screen-brains').addEventListener('pointerup',endBeat);  /* tap to skip */

/* the 'start' net event now routes through the loading beat too */

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
function tgl(id,on){var b=g(id);if(!b)return;b.classList.toggle('on',!!on);}
function refreshSettings(){
  if(!window.BKAudio)return;
  var S=BKAudio.settings;
  if(window._bkCenterTheme)_bkCenterTheme();
  tgl('setMusic',S.music);tgl('setSfx',S.sfx);tgl('setCoords',S.coords);tgl('setMotion',!S.motion);
  var vm=g('volMusic'),vs=g('volSfx');
  if(vm)vm.value=Math.round(S.musicVol*100);
  if(vs)vs.value=Math.round(S.sfxVol*100);
  syncMusicBtns();
}
function openSettings(from){setFrom=from;show('settings');refreshSettings();}
g('btnSettings').addEventListener('click',function(){openSettings('title')});
g('pSettings').addEventListener('click',function(){g('pauseveil').classList.remove('on');openSettings('pause')});
g('setBack').addEventListener('click',function(){
  if(setFrom==='pause'){show('game');g('pauseveil').classList.add('on');}
  else show('title');
});
/* theme coverflow: flick the crate, the centered card previews + applies its theme */
(function(){
  var crate=g('stCrate');if(!crate)return;
  var cards=[].slice.call(crate.querySelectorAll('.st-tcard'));
  var nameEl=g('themeName'),settle=null;
  function centered(){
    var cr=crate.getBoundingClientRect(),cx=cr.left+cr.width/2,best=null,bd=1e9;
    cards.forEach(function(c){var r=c.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-cx);if(d<bd){bd=d;best=c;}});
    return best;
  }
  function paint(){
    var best=centered();
    cards.forEach(function(c){c.classList.toggle('center',c===best);});
    if(best&&nameEl){nameEl.textContent=best.dataset.name;nameEl.style.color=getComputedStyle(best).getPropertyValue('--a');}
  }
  function applyCentered(){
    var best=centered();if(!best)return;
    if(window.BKAudio&&BKAudio.settings.theme!==best.dataset.theme)BKAudio.set('theme',best.dataset.theme);
  }
  crate.addEventListener('scroll',function(){
    window.requestAnimationFrame(paint);
    if(settle)clearTimeout(settle);settle=setTimeout(applyCentered,170);
  });
  cards.forEach(function(c){c.addEventListener('click',function(){c.scrollIntoView({inline:'center',behavior:'smooth'});});});
  window._bkCenterTheme=function(){
    var th=window.BKAudio?BKAudio.settings.theme:'hardwood';
    var card=cards.filter(function(c){return c.dataset.theme===th;})[0];
    if(card){card.scrollIntoView({inline:'center'});setTimeout(paint,20);}
  };
})();
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
  var fr=g('frReveal');if(fr)fr.classList.remove('on');   /* fresh entry — no stale code */
  var ob=g('frOtp');if(ob){var bs=ob.querySelectorAll('input');for(var i=0;i<bs.length;i++){bs[i].value='';bs[i].classList.remove('filled');}}
  var hc=g('oCode');if(hc)hc.value='';
  navSlam(function(){show('online')});
});
g('oBack').addEventListener('click',function(){
  if(NET.ws){try{NET.ws.onclose=null;NET.ws.close()}catch(e){}}
  NET.on=false;NET.ws=null;
  show('title');
});
/* HOUSE RULES ARE SET BEFORE THE CODE EXISTS.
   League, era, game length and knowledge level are things you'd want to know
   BEFORE agreeing to play, so the room creator locks them first and the joiner is
   shown them before committing. The toss-up prize is a separate thing entirely.
   We walk the REAL setup screens rather than a cut-down copy — same rolodex, same
   era timeline — and just land on "get my code" instead of "tip-off". */
var ROOMSET=false;
function roomsetBegin(){
  ROOMSET=true;CPU.on=false;
  var fr=g('frReveal');if(fr)fr.classList.remove('on');
  oStatus('');
  setupCfg.rosters=null;
  show('league');
}
function roomsetFinish(){
  ROOMSET=false;
  show('online');
  oStatus('☎️ Calling the server… (free tier stretches first — up to ~30s)');
  netConnect(function(err){
    if(err){oStatus('❌ Could not reach the server. Give it ~30s to wake and try again.');
      return}
    netSend({t:'create'});
  });
}
g('oCreate').addEventListener('click',roomsetBegin);
g('oJoin').addEventListener('click',function(){
  CPU.on=false;
  var code=(g('oCode').value||'').toUpperCase().trim();
  if(code.length!==4){oStatus('Enter the 4-letter code your friend sent you.');return}
  oStatus('☎️ Calling the server… (free tier stretches first — up to ~30s)');
  netConnect(function(err){
    if(err){oStatus('❌ Could not reach the server. Give it ~30s to wake and try again.');return}
    netSend({t:'join',code:code});
  });
});
/* OTP code entry — auto-advance + sync into the hidden #oCode, plus copy button */
(function(){
  var otp=g('frOtp');if(!otp)return;
  var boxes=otp.querySelectorAll('input'),hidden=g('oCode');
  function sync(){var c='';for(var j=0;j<boxes.length;j++)c+=boxes[j].value;if(hidden)hidden.value=c;}
  for(var i=0;i<boxes.length;i++){(function(inp,idx){
    inp.addEventListener('input',function(){
      inp.value=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
      inp.classList.toggle('filled',!!inp.value);
      if(inp.value&&boxes[idx+1])boxes[idx+1].focus();
      sync();
    });
    inp.addEventListener('keydown',function(e){if(e.key==='Backspace'&&!inp.value&&boxes[idx-1])boxes[idx-1].focus();});
  })(boxes[i],i);}
  var cp=g('frCopy');
  if(cp)cp.addEventListener('click',function(){
    var c=cp.dataset.code||'';
    try{if(navigator.clipboard)navigator.clipboard.writeText(c);}catch(e){}
    cp.textContent='✓ Copied '+c;
  });
})();

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

/* ================= CPU OPPONENT =================
   CONTRACT (keep forever): the CPU is an INPUT LAYER, never a rules engine.
   It only picks among options the engine already computes for a human
   (legalMove, zoneOf, driveChallenge, defSlideRange) and drives the SAME
   entry points a tap would (commitStaged/applyAct, doShoot, endDefSlide,
   startStealTry, tipBuzz/tipAnswer, meterResolve, battleTap, resolvePending).
   New rules: engine stops offering an option → CPU stops taking it, free.
   New DECISION TYPES: add one small heuristic here; until then the safe
   fallback (first stagebox button / plain legal action) keeps it alive.
   All CPU brains live in THIS section only. */
var CPU={on:false,team:1,level:'pro',busy:false,timer:null};
var CPU_LEVELS={
  rookie:{name:'Rookie', card:[0.72,0.50,0.32], tip:0.50, buzz:[1500,2800],
          meter:[0.12,0.55], taps:[7,13], think:[800,1500], smart:0.35, steal:0.12},
  pro:   {name:'Pro',    card:[0.88,0.70,0.50], tip:0.72, buzz:[900,1900],
          meter:[0.28,0.60], taps:[12,19], think:[650,1200], smart:0.70, steal:0.28},
  allstar:{name:'All-Star',card:[0.97,0.88,0.72], tip:0.90, buzz:[500,1100],
          meter:[0.48,0.47], taps:[17,26], think:[500,900], smart:0.95, steal:0.45}
};
function cpuLvl(){return CPU_LEVELS[CPU.level]||CPU_LEVELS.pro}
function cpuRnd(a){return a[0]+Math.random()*(a[1]-a[0])}
function cpuThink(fn){CPU.busy=true;setTimeout(function(){CPU.busy=false;fn()},cpuRnd(cpuLvl().think))}
function cpuRollCard(tier){var acc=cpuLvl().card;return Math.random()<(acc[Math.min(tier,3)-1]||0.4)}
function cpuMeterPos(){
  var m=cpuLvl().meter,r=Math.random();
  if(r<m[0])return 0.5;                                  /* perfect */
  if(r<m[0]+m[1])return 0.5+(Math.random()<0.5?-1:1)*(0.09+Math.random()*0.25); /* good */
  return Math.random()<0.5?0.04:0.96;                    /* shank */
}
/* ---- the turn watcher: acts only when the engine is idle, waiting on the CPU ---- */
function cpuTick(){
  if(!CPU.on||!state||NET.on||CPU.busy)return;
  if(pending||battle||meter||tip||state.ball.fly)return;
  if(curScreen!=='game')return;
  var ph=state.phase;
  if((ph==='off-select'||ph==='off-move')&&state.offense===CPU.team)cpuThink(cpuOffense);
  else if(ph==='inbound'&&state.offense===CPU.team)cpuThink(cpuInbound);
  else if(ph==='inbound-move'&&state.offense===CPU.team)cpuThink(cpuInbound);
  else if(ph==='def-slide'&&(1-state.offense)===CPU.team)cpuThink(cpuDefense);
}
setInterval(cpuTick,700);
function cpuAct(a,sel){                    /* commit through the human door */
  state.selected=(sel!=null?sel:state.selected);
  state.staged=a;commitStaged();
}
function cpuRimDist(c,r){var tc=tileCenter(c,r),rim=attackedRim(CPU.team);
  return Math.hypot(tc[0]-rim[0],tc[1]-rim[1]);}
function cpuLegalTiles(i,range){
  var p=state.pieces[i],out=[];
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++)
    if(legalMove(p,range,c,r))out.push([c,r]);
  return out;
}
function cpuOffense(){
  if(!state||state.phase!=='off-select'&&state.phase!=='off-move')return;
  if(state.offense!==CPU.team)return;
  var lvl=cpuLvl(),hi=state.ball.holder,hp=state.pieces[hi];
  var z=zoneOf(hp.c,hp.r,CPU.team);
  var defAdj=adjDefenderIdx(hp.c,hp.r,CPU.team);
  /* 1) shoot? — closer + uncontested = more likely; rookies jack anyway */
  if(z){
    var want=(z.tier===1?0.9:z.tier===2?0.55:0.35);
    if(defAdj>=0)want*= (lvl.smart>0.8?0.45:0.75);   /* smart CPUs pass out of contests */
    if(Math.random()<want*(0.55+0.45*lvl.smart)+((1-lvl.smart)*0.18)){
      state.selected=hi;doShoot();return;
    }
  }
  /* 2) pass to a teammate in a better spot (short lanes only) */
  var best=-1,bestGain=0;
  state.pieces.forEach(function(p,i){
    if(p.team!==CPU.team||i===hi)return;
    var d=Math.max(Math.abs(p.c-hp.c),Math.abs(p.r-hp.r));
    if(d>4)return;                                    /* keep lanes sane */
    var gain=cpuRimDist(hp.c,hp.r)-cpuRimDist(p.c,p.r);
    if(gain>bestGain){bestGain=gain;best=i;}
  });
  if(best>=0&&bestGain>40&&Math.random()<0.35+0.45*lvl.smart){
    cpuAct({kind:'pass',toIdx:best},hi);return;
  }
  /* 3) drive the carrier toward the rim (smart CPUs avoid crossover tolls) */
  var tiles=cpuLegalTiles(hi,hp.range);
  if(tiles.length){
    tiles.sort(function(a,b){return cpuRimDist(a[0],a[1])-cpuRimDist(b[0],b[1])});
    var pickT=null;
    for(var k=0;k<tiles.length;k++){
      var t=tiles[k];
      if(state.front&&!inFront(CPU.team,t[0],t[1]))continue;      /* never backcourt */
      var chal=driveChallenge(hp.c,hp.r,t[0],t[1],CPU.team);
      if(chal>=0&&Math.random()<lvl.smart*0.8&&(hp.pos==='PF'||hp.pos==='C'))continue;
      pickT=t;break;
    }
    if(!pickT)for(var k2=0;k2<tiles.length;k2++){var t2=tiles[k2];
      if(!(state.front&&!inFront(CPU.team,t2[0],t2[1]))){pickT=t2;break;}}
    if(pickT){cpuAct({kind:'move',tile:pickT},hi);return;}
  }
  /* 4) fallback: move any teammate toward the rim */
  for(var i2=0;i2<state.pieces.length;i2++){
    var p2=state.pieces[i2];
    if(p2.team!==CPU.team||i2===hi)continue;
    var ts=cpuLegalTiles(i2,p2.range);
    if(ts.length){ts.sort(function(a,b){return cpuRimDist(a[0],a[1])-cpuRimDist(b[0],b[1])});
      cpuAct({kind:'move',tile:ts[0]},i2);return;}
  }
  if(z){state.selected=hi;doShoot();}                  /* cornered: let it fly */
}
function cpuInbound(){
  if(!state)return;
  if(state.phase==='inbound-move'){                    /* never bothers with a cutter */
    var sk=g('aSkip');if(sk){sk.click();return;}
    state.phase='inbound';inboundActions();return;
  }
  if(state.phase!=='inbound'||state.offense!==CPU.team)return;
  var hi=state.ball.holder,hp=state.pieces[hi],best=-1,bd=1e9;
  state.pieces.forEach(function(p,i){
    if(p.team!==CPU.team||i===hi)return;
    var d=Math.max(Math.abs(p.c-hp.c),Math.abs(p.r-hp.r));
    if(d<bd){bd=d;best=i;}
  });
  if(best>=0)cpuAct({kind:'pass',toIdx:best},hi);
}
function cpuDefense(){
  if(!state||state.phase!=='def-slide'||(1-state.offense)!==CPU.team)return;
  var lvl=cpuLvl(),hi=state.ball.holder,hp=state.pieces[hi];
  /* steal chance if already adjacent */
  var adjIdx=-1;
  state.pieces.forEach(function(p,i){
    if(p.team!==CPU.team)return;
    if(Math.max(Math.abs(p.c-hp.c),Math.abs(p.r-hp.r))<=1)adjIdx=i;
  });
  if(adjIdx>=0&&Math.random()<lvl.steal){startStealTry(adjIdx);return;}
  /* slide the best defender toward the ball–rim line */
  var rim=attackedRim(state.offense);
  var bestI=-1,bestT=null,bestScore=1e9;
  state.pieces.forEach(function(p,i){
    if(p.team!==CPU.team)return;
    var ts=cpuLegalTiles(i,defSlideRange(p));
    ts.forEach(function(t){
      var tc=tileCenter(t[0],t[1]);
      var dBall=Math.hypot(tc[0]-tileCenter(hp.c,hp.r)[0],tc[1]-tileCenter(hp.c,hp.r)[1]);
      var dRim=Math.hypot(tc[0]-rim[0],tc[1]-rim[1]);
      var score=dBall+dRim*0.55;
      if(score<bestScore){bestScore=score;bestI=i;bestT=t;}
    });
  });
  var curBest=1e9;
  if(bestI>=0){var bp=state.pieces[bestI],btc=tileCenter(bp.c,bp.r);
    curBest=Math.hypot(btc[0]-tileCenter(hp.c,hp.r)[0],btc[1]-tileCenter(hp.c,hp.r)[1])+
            Math.hypot(btc[0]-rim[0],btc[1]-rim[1])*0.55;}
  if(bestI>=0&&bestT&&bestScore<curBest-8&&Math.random()<0.4+0.55*lvl.smart){
    cpuAct({kind:'slide',tile:bestT},bestI);return;
  }
  endDefSlide();                                        /* stay put */
}
/* CPU squad: one silent roll, auto-locked */
function cpuAutoSquad(exclude){
  var rar=srRollRarity();
  return srPickSquad(rar.stars,exclude||[]);
}
function cpuHudTag(){return CPU.on?' · CPU '+cpuLvl().name.toUpperCase():''}
window.BKCPU={state:CPU,levels:CPU_LEVELS};

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
  _cpu:function(){return CPU},
  _tu:function(){return TU},
  _end:function(){endGame()},
  /* dev/test hooks MUST go through the same *Emit wrappers the real buttons use.
     A hook that calls the local half only (doShoot vs shootEmit) silently skips
     the wire and makes a harness invent desyncs that don't exist in the game.
     netEv() is a no-op offline, so these stay safe for solo/CPU tests. */
  _commit:function(){commitStaged()},
  _shoot:function(){shootEmit()},
  _stay:function(){skipEmit()},
  _steal:function(i){stealEmit(i)},
  _zone:function(c,r){return state?zoneOf(c,r,state.offense):null},
  _card:function(t){showCard(t,'TEST CARD','test stake','',false)},  /* dev: eyeball a tier */
  _stat:srStatLine,_acc:srAccolade,
  startCpu:function(level,league){
    /* dev/test entry: instant CPU game — real menu flow comes with the mode UI */
    CPU.on=true;CPU.team=1;CPU.level=level||'pro';
    var lg=league||'nba';setupCfg.league=lg;setupCfg.decade=['FULL'];
    var a=srPickSquad(2,[]),ex=[];
    MODES[lg].lineup.forEach(function(p){ex.push(a[p].n)});
    var b=cpuAutoSquad(ex);
    startGame({league:lg,decade:['FULL'],target:11,rosters:[a,b]});
    markGame(true);show('game');
  },
  start:startGame, show:show
};
})();

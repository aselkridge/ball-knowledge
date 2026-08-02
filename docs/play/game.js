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

/* DRILL mode (coach.js drives it): frozen clocks, t:0 cards, sandbox board */
var DRILL={on:false,id:null,step:0,allow:null,deny:null};
/* drills lock the lesson: off-script actions bounce (coach.js sets allow/deny) */
function drillAllow(kind){
  if(!DRILL.on||!DRILL.allow||DRILL.allow.indexOf(kind)>=0)return true;
  if(DRILL.deny)DRILL.deny(kind);
  return false;
}

/* inline-SVG icon refs for JS-built HTML (symbols live in index.html) */
function ICO(n){return '<svg class="ic"><use href="#i-'+n+'"/></svg>'}

/* ========== screens ========== */
var screens={load:g('screen-load'),title:g('screen-title'),how:g('screen-how'),
  settings:g('screen-settings'),brains:g('screen-brains'),
  online:g('screen-online'),pick:g('screen-pick'),versus:g('screen-versus'),
  league:g('screen-league'),decade:g('screen-decade'),squad:g('screen-squad'),
  rules:g('screen-rules'),courts:g('screen-courts'),colors:g('screen-colors'),tossup:g('screen-tossup'),game:g('screen-game'),names:g('screen-names'),
  house:g('screen-house'),handicap:g('screen-handicap'),locker:g('screen-locker')};
var curScreen='load';
/* one persistent back arrow (top-left) drives each screen's existing back action */
var BACKMAP={how:'btnBack',settings:'setBack',online:'oBack',league:'lgBack',
  decade:'decBack',squad:'sqBack',rules:'rulesBack',pick:'pickLeave',tossup:'tuBack',names:'nmBack',
  courts:'crtBack',colors:'cwBack',house:'hsBack',locker:'lkBack'};
var _sOutTimer=null,_sInTimer=null;
function show(name){
  if(name==='rules'&&typeof klRulesSync==='function')klRulesSync();
  /* the calendar re-reads the date every time you land on the menu, so a
     session left open across midnight shows a fresh stamp without a reload */
  if(name==='title'&&typeof paintDaily==='function')paintDaily();
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
  var canBack=!!BACKMAP[name]&&!(name==='squad'&&NET.on&&!CPU.on)&&!(name==='names'&&NET.on)
    &&!(name==='courts'&&typeof CRT!=='undefined'&&CRT.mode==='tossup'&&NET.on)
    &&!(name==='colors'&&typeof CW!=='undefined'&&CW.mode!=='rules'&&NET.on);
  if(ba)ba.classList.toggle('on',canBack);
  document.body.classList.toggle('worldbg-on',
    ['title','league','decade','squad','rules','settings','online','how','tossup','courts','colors','locker'].indexOf(name)>=0);
  bbScreen(name);
  if(name==='game')setTimeout(function(){if(typeof sbFit==='function')sbFit();},40);
  if(name!=='settings')musicSync();
}
/* ================= which song the moment calls for =================
   One resolver instead of music() calls sprinkled through the code. Anything
   that changes the MOMENT — pause, final buzzer, a drill starting — calls
   musicSync() and the right track fades in. Order matters: the checks run
   most-specific first, because a drill and a pause both happen ON the game
   screen, and the end veil sits on top of everything. */
var endMood=null;         /* 'win' or 'lose', set by endShow, cleared on leaving */
function musicWant(){
  var ev=g('endveil'),pv=g('pauseveil');
  if(ev&&ev.classList.contains('on'))return endMood||'win';
  if(pv&&pv.classList.contains('on'))return 'paused';
  if(DRILL.on)return 'tutorial';
  /* brains is the loading beat BETWEEN versus and the game — it keeps the game
     track. Leaving it out flipped back to the menu song for ~2.6s mid-hype. */
  if(curScreen==='game'||curScreen==='versus'||curScreen==='brains')return 'game';
  return 'menu';
}
function musicSync(){
  if(!window.BKAudio)return;
  BKAudio.music(musicWant(),true);   /* true = automatic, so a hand-picked track wins */
}
/* The pause and end veils are opened and closed from TEN different places
   (resume, rematch, settings-from-pause, rulebook-from-pause, reconnect...).
   Calling musicSync at each one means the eleventh, written next month, is
   silently wrong. Watching the class instead can't drift. */
(function(){
  if(!window.MutationObserver)return;
  var mo=new MutationObserver(function(){musicSync();});
  ['pauseveil','endveil'].forEach(function(id){
    var el=g(id);
    if(el)mo.observe(el,{attributes:true,attributeFilter:['class']});
  });
})();
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
g('btnPlay').addEventListener('click',function(){navSlam(function(){CPU.on=false;startNames()})});
/* ===== THE DAILY FIVE STAMP (Aaron 08-02) ================================
   A daily ritual is not a game mode, so it does not live in the numbered
   menu — it is a torn calendar page pinned opposite the ♪/⚙ controls. Tap
   it, play it, and it greys out with a tick like a day crossed off, until
   local midnight rolls the date over.
   Storage is a plain date string, so "have I played today" is a string
   compare against the phone's own clock — no timers, no server, and a
   phone that sits open past midnight still re-arms on the next repaint. */
function dailyKey(d){d=d||new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+
         String(d.getDate()).padStart(2,'0');}
function dailyDone(){try{return localStorage.getItem('bk_daily5')===dailyKey()}catch(e){return false}}
function dailyMark(){try{localStorage.setItem('bk_daily5',dailyKey())}catch(e){}paintDaily();}
function paintDaily(){
  var el=g('dailyStamp');if(!el)return;
  var d=new Date();
  var M=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  g('dsMonth').textContent=M[d.getMonth()];
  g('dsDay').textContent=d.getDate();
  var done=dailyDone();
  el.classList.toggle('done',done);
  el.setAttribute('aria-disabled',done?'true':'false');
  el.setAttribute('aria-label',done
    ? 'The Daily Five — already played today, back tomorrow'
    : 'The Daily Five — today\'s five shots and five stops');
}
(function(){
  var el=g('dailyStamp');if(!el)return;
  el.addEventListener('click',function(){
    if(dailyDone()){
      banner('<b>Today\'s Daily Five is done.</b> A fresh rack lands at midnight.');
      return;
    }
    if(window.BKAudio)BKAudio.sfx('click');
    /* the mode itself is not built yet — the stamp, its state and its rollover
       are. Marking it done here is deliberate so the greyed state is real and
       testable rather than a mock; swap this for the mode launch when the
       Daily Five ships. */
    dailyMark();
    banner('<b>The Daily Five is coming.</b> Five shots, five stops, same rack for everyone — the stamp works, the mode lands next.');
  });
  paintDaily();
  /* re-check on every return to the menu and whenever the tab wakes: a phone
     left open overnight must re-arm without a reload */
  document.addEventListener('visibilitychange',function(){if(!document.hidden)paintDaily()});
})();
g('btnCpu').addEventListener('click',function(){navSlam(function(){g('cpuveil').classList.add('on')})});
g('cvBack').addEventListener('click',function(){g('cpuveil').classList.remove('on')});
document.querySelectorAll('#cpuveil .cv-card').forEach(function(b){
  b.addEventListener('click',function(){
    CPU.on=true;CPU.team=1;CPU.level=b.getAttribute('data-lvl')||'pro';CPU.busy=false;
    setupCfg.theCall=null;               /* no toss-up vs the machine (v1) */
    g('cpuveil').classList.remove('on');
    startNames('solo');                  /* name the squad FIRST, then pick it */
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
g('hudMore').addEventListener('click',function(){
  g('hudTray').classList.toggle('on');
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
  g('hudTray').classList.remove('on');
  var pv=g('pvScore');
  if(pv&&state)pv.innerHTML=
    '<span style="color:'+cwTextSafe(TEAM[0].p)+'">'+TEAM[0].nm+'</span> <b>'+state.score[0]+'</b>'+
    ' \u2014 <b>'+state.score[1]+'</b> <span style="color:'+cwTextSafe(TEAM[1].p)+'">'+TEAM[1].nm+'</span>'+
    '<small>'+(state.qmode?('Q'+state.q):('First to '+state.target))+' \u00b7 '+courtName(setupCfg.court)+'</small>';
  g('pauseveil').classList.add('on');
  freezeGame();      /* a timeout that doesn't stop the clock isn't a timeout */
});
g('pResume').addEventListener('click',function(){g('pauseveil').classList.remove('on');thawGame()});
g('pRestart').addEventListener('click',function(){
  if(NET.on&&NET.role!==0){banner('<b>Host calls the rematch.</b>');g('pauseveil').classList.remove('on');thawGame();return}
  g('pauseveil').classList.remove('on');thawGame();
  if(NET.on)netEv({a:'start',cfg:lastCfg});
  startGame();
});
g('pExit').addEventListener('click',function(){
  g('pauseveil').classList.remove('on');
  leaveGame();
  if(NET.on)leaveRoom();
  show('title');
});

/* scroll affordance: any setup screen with content below the fold gets a
   bobbing chevron; it dies at the bottom (and never on the game board) */
(function(){
  var el=g('scrollHint');
  el.addEventListener('click',function(){
    var sc=screens[curScreen];
    if(sc)sc.scrollBy({top:sc.clientHeight*0.7,behavior:'smooth'});
  });
  setInterval(function(){
    var sc=screens[curScreen];
    var show=sc&&curScreen!=='game'&&curScreen!=='load'&&
      sc.classList.contains('on')&&
      (sc.scrollHeight-sc.clientHeight-sc.scrollTop)>48;
    if(show){
      /* sticky lock bars own the bottom edge — the chevron floats above them */
      var bar=sc.querySelector('.crt-bar');
      el.style.bottom=bar?Math.round(bar.getBoundingClientRect().height+16)+'px':'12px';
    }
    el.classList.toggle('on',!!show);
  },450);
})();

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
/* ===== Phase 1.5: the server naps — wake it FOR the player =================
   The free relay sleeps between games and cold-starts in 30-60s. Rule: the
   player NEVER retries by hand. We poke the http side the moment the online
   screen opens (the wake begins while they read or type the code), then dial
   the socket on a patient loop with a living, honest status line until the
   arena answers. A real failure only shows after the full wake window. */
function netPoke(){
  try{fetch(netURL().replace(/^ws/,'http')+'/health',{mode:'no-cors'}).catch(function(){})}catch(e){}
}
var DIAL={tok:0,max:85};
var DIAL_MSGS=[
  [0,'Calling the arena…'],
  [5,''+ICO('key')+' Waking the server — it naps between games to stay free.'],
  [15,''+ICO('hoop')+' Gym’s unlocking… lights coming on rack by rack.'],
  [30,''+ICO('ball')+' Rolling out the ball rack — usually awake by now.'],
  [45,'Still stretching — a cold start can take a minute.'],
  [62,'Big yawn. Any second now…']];
function netDial(paint,cb){
  var tok=++DIAL.tok,t0=Date.now(),done=false;
  netPoke();
  function secs(){return Math.floor((Date.now()-t0)/1000)}
  function msg(){
    var e=secs(),m=DIAL_MSGS[0][1];
    for(var i=0;i<DIAL_MSGS.length;i++)if(e>=DIAL_MSGS[i][0])m=DIAL_MSGS[i][1];
    return m+' <small style="opacity:.7">'+e+'s</small>';
  }
  var tick=setInterval(function(){
    if(tok!==DIAL.tok||done){clearInterval(tick);return}
    paint(msg());
  },1000);
  function finish(err){
    if(done||tok!==DIAL.tok)return;
    done=true;clearInterval(tick);cb(err);
  }
  function attempt(){
    if(done||tok!==DIAL.tok)return;
    if(secs()>DIAL.max){finish('err');return}
    var mine=true;
    /* a cold server can leave the socket HANGING (no error, no open) — after
       10s we abandon that dial and place a fresh call; netConnect closes the
       stale socket itself */
    var guard=setTimeout(function(){mine=false;attempt()},10000);
    netConnect(function(err){
      clearTimeout(guard);
      if(!mine||done||tok!==DIAL.tok)return;
      if(!err){finish(null);return}
      setTimeout(attempt,3000);
    });
  }
  paint(msg());
  attempt();
}
function netHangUp(){DIAL.tok++}
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
  if(d.t==='access'){
    if(GATE.probe){
      GATE.probe=false;
      if(d.gate&&!d.ok){passSet('');gateShow(null,'');}
      else oStatus(d.gate?'<b style="color:#5fd06a">✓</b> You’re on the list — pick one.':'Pick one — server’s awake.');
      return;
    }
    if(d.ok)gatePassed();else gateDenied();return}
  if(d.t==='nope'){
    if(d.access){
      passSet('');
      if(NET._rejoining){NET._rejoining=false;netVeil('');show('online');
        gateShow({k:'rejoin'},'Access code changed while you were out &mdash; enter the current one to slide back into your game.');
      }else gateShow(GATE.pend,'');
      return;
    }
    oStatus('<b style="color:#ff7a5c">✗</b> '+d.why);return}
  if(d.t==='ready'){
    NET.on=true;CPU.on=false;
    /* write the rejoin ticket the moment the room PAIRS, not at game start.
       A drop on the house screen / toss-up / handicap pick is still a live room —
       without this ticket the refreshed phone boots to the title with no way
       back, and the survivor waits out the grace window for nobody. */
    markGame(true);
    if(setupCfg.names&&setupCfg.names[NET.role])netEv({a:'name',team:NET.role,id:setupCfg.names[NET.role]});
    oStatus('<b style="color:#5fd06a">✓</b> Connected — you are <b style="color:'+(NET.role===0?'var(--team-oj)':'var(--away)')+'">'+
      teamName(NET.role).toUpperCase()+'</b>.');
    if(NET.role===0){
      /* the host already set the house rules — send them so the guest can see
         exactly what they're walking into before the game starts */
      netEv({a:'house',house:houseRules()});
      oStatus('<b style="color:#5fd06a">✓</b> Connected. Showing your friend the house rules…');
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
  netHangUp();
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
    heat:state.heat.slice(),fire:state.fire.slice(),
    clock:{t:state.clock?state.clock.t:0,kind:state.clock?state.clock.kind:null,warned:-1}
  };
}
function applySnapshot(sn,house){
  if(house)applyHouse(house);        /* rejoiner refreshed — restore the room's rules first */
  applyCourt(setupCfg.court);
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
  state.heat=(sn.heat||[0,0]).slice();state.fire=(sn.fire||[0,0]).slice();
  state.clock=sn.clock||{t:0,kind:null,warned:-1};
  pending=null;battle=null;sd=null;meter=null;
  g('ptsA').textContent=state.score[0];g('ptsB').textContent=state.score[1];
  hudPoss();
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
  netDial(function(m){netVeil('<b>Reconnecting…</b><br>'+m)},function(err){
    if(err){netVeil('<b>Couldn\u2019t reach the server.</b><br>'+
      '<div class="row"><button class="bigbtn" id="nvRetry">Try again</button>'+
      '<button class="bigbtn ghost" id="nvQuit2">Quit</button></div>');
      var rt=g('nvRetry'),q2=g('nvQuit2');
      if(rt)rt.onclick=attemptRejoin;
      if(q2)q2.onclick=function(){leaveRoom();show('title')};
      return;}
    netSend({t:'rejoin',code:saved.code,role:saved.role,pass:passGet()});
  });
}
function netApply(ev){
  switch(ev.a){
    case 'start':startBeat(ev.cfg);break;
    case 'pick':enterPick(ev.cfg);break;
    case 'squad':
      if(pickCfg){pickCfg.cfg.rosters[ev.team]=ev.roster;renderPick();pickStatusLine();}
      break;
    case 'srlock':                       /* their five is locked — now it's our turn */
      SR.squads[ev.team]=ev.roster;
      srAdvanceTurn();
      break;
    case 'lock':
      if(pickCfg){pickCfg.locked[ev.team]=true;pickStatusLine();checkLocked();}
      break;
    case 'act':applyAct(ev);break;
    case 'shoot':state.selected=ev.sel;doShoot();break;
    case 'stayput':endDefSlide();break;
    case 'steal':startStealTry(ev.def);break;
    case 'clockv':applyClockV(ev.kind);break;
    /* 'card' resolves 1400ms AFTER it arrives — the same beat the answering
       phone spends showing its result before ITS resolvePending. Without the
       matching delay this side resolves early, and on plays with no meter
       round-trip (open-look splashes, completed risky passes) it would flip
       possession and act while the answerer is still reading the result — a
       live desync. The old build only survived because every one of these
       plays had a meter barrier hiding the skew. */
    case 'card':setTimeout(function(){stagebox('');resolvePending(ev.correct)},1800);break; /* mirrors answer()'s beat — change BOTH */
    /* the owner's tap can outrun our delayed card resolution — wait for our
       meter to exist (same pattern as 'battle') instead of dropping the pos */
    case 'meter':(function mp(){if(meter)meterResolve(ev.pos);else setTimeout(mp,120)})();break;

    case 'battle':(function ap(){if(battle)finishBattle(ev.w);else setTimeout(ap,250)})();break;
    case 'house':showHouse(ev.house);break;
    case 'bstep':battleApplyStep(ev.r,ev.ba);break;
    case 'bwin':battleWin(ev.w,ev.why);break;
    case 'name':
      setupCfg.names=setupCfg.names||[null,null];
      setupCfg.names[ev.team]=ev.id;
      if(!setupCfg.cw||!setupCfg.cw[0])applyColors(setupCfg.names[0],setupCfg.names[1]);
      if(screens.tossup.classList.contains('on')){
        g('tuBzA').innerHTML=ICO('bell')+' '+teamName(0);
        g('tuBzB').innerHTML=teamName(1)+' '+ICO('bell');
        g('tuRowA').textContent='\u25cf '+teamName(0);
        g('tuRowB').textContent=teamName(1)+' \u25cf';
      }
      if(screens.house.classList.contains('on'))g('hsWho').textContent=teamName(0)+'\u2019s room';
      break;
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
    /* the buzzing phone now holds 1400ms on the green/red reveal, so the
       WATCHING phone has to hold the same beat or the two screens drift.
       Same rule as netApply 'card': change one number, change both. */
    case 'tip':(function(ok){g('tipMsg').textContent=ok?'GOT IT.':'NO GOOD.';
      setTimeout(function(){tipAnswer(ok)},1400);})(ev.ok);break;
    /* ---- online toss-up ---- */
    case 'tuready':tuMarkReady(ev.team);break;
    case 'tugo':tuGo(ev.qi);break;
    case 'tubuzz':tuHostBuzz(ev.team,ev.delta);break;
    case 'tubuzzwin':tuApplyBuzzWin(ev.winner,ev.noBuzz);break;
    case 'tuans':tuResolveAnswer(ev.ok,ev.side);break;
    case 'cw':
      setupCfg.cw[ev.team]=ev.cw;
      cwAdvance();
      break;
    case 'court':
      setupCfg.court=ev.court;
      afterCourtCall();
      break;
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
  nba:{cols:15,rows:8,half:false,label:"NBA",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  wnba:{cols:15,rows:8,half:false,label:"WNBA",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  big3:{cols:8,rows:7,half:true,label:"BIG3",lineup:['PG','SF','C'],
    starts:[[[2,3],[1,1],[1,5]],[[4,3],[5,1],[5,5]]]},
  flags:{cols:15,rows:8,half:false,label:"FLAGS",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  overseas:{cols:15,rows:8,half:false,label:"OVERSEAS",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  college:{cols:15,rows:8,half:false,label:"COLLEGE",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  gleague:{cols:15,rows:8,half:false,label:"G LEAGUE",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  street:{cols:15,rows:8,half:false,label:"STREET LEGENDS",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  fives:{cols:15,rows:8,half:false,label:"EARLY BLACK BASKETBALL",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]},
  fiba3x3:{cols:8,rows:7,half:true,label:"FIBA 3X3",lineup:['PG','SF','C'],
    starts:[[[2,3],[1,1],[1,5]],[[4,3],[5,1],[5,5]]]},
  wheelchair:{cols:15,rows:8,half:false,label:"WHEELCHAIR",lineup:['PG','SG','SF','PF','C'],
    starts:[[[5,4],[4,1],[4,6],[6,2],[6,5]],[[9,3],[10,6],[10,1],[8,5],[8,2]]]}
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
/* ===== COURT SKINS (seed of the Phase-4 system) ==========================
   A skin = a painted SCENE behind the arena + a FLOOR texture under the tiles.
   The floor can't be one affine drawImage — proj() has a perspective divide —
   so it's strip-mapped (2 triangles per strip) into an offscreen cache that
   only re-renders when rotation/fit change. Inert until skinSet() is called. */
var SKIN={on:false,bgImg:null,floorImg:null,bgOk:false,floorOk:false,
          cache:null,cacheKey:'',tileAlpha:0.16,scrim:0.35};
function skinSet(o){
  o=o||{};
  SKIN.on=!!(o.bg||o.floor||o.neon);
  SKIN.neon=!!o.neon;
  SKIN.bgOk=SKIN.floorOk=false;SKIN.cacheKey='';
  SKIN.tileAlpha=(o.tileAlpha!=null?o.tileAlpha:0.16);
  SKIN.scrim=(o.scrim!=null?o.scrim:0.35);
  if(o.bg){SKIN.bgImg=new Image();SKIN.bgImg.onload=function(){SKIN.bgOk=true;fitDirty=true};SKIN.bgImg.src=o.bg;}
  else SKIN.bgImg=null;
  /* THE STANDARD: every scene ships twice — 9:16 for phones, 16:9 for wide.
     bg = portrait, bgWide = landscape; the render picks by the screen's shape. */
  SKIN.bgWideOk=false;
  if(o.bgWide){SKIN.bgWideImg=new Image();SKIN.bgWideImg.onload=function(){SKIN.bgWideOk=true;fitDirty=true};SKIN.bgWideImg.src=o.bgWide;}
  else SKIN.bgWideImg=null;
  if(o.floor){SKIN.floorImg=new Image();SKIN.floorImg.onload=function(){SKIN.floorOk=true;SKIN.cacheKey='';fitDirty=true};SKIN.floorImg.src=o.floor;}
  else SKIN.floorImg=null;
}
/* ===== HOME COURTS (the picker's registry) ================================
   A court = scene art pair {bg 9:16, bgWide 16:9} + a floor (or the engine's
   neon grid), in two looks (a/b). Classic is pure engine: look b ("Midnight
   Run") retints the default board — no art, just palette. The court is a
   ROOM SETTING online: the creator picks it with the house rules and both
   phones render the same world. */
var COURT_ART='assets/courts/';
var COURTS={
 classic:{fam:'Classic',tag:'THE DEFAULT',
   a:{nm:'Classic Run'},
   b:{nm:'Midnight Run',tint:{bg:['#080b12','#10141f','#131b2b'],apron:'#101a2e',
      tileA:'#4a6598',tileB:'#425b8c'}}},
 hardwood:{fam:'Hardwood',tag:'ARENA',floor:'hardwood-floor.jpg',
   a:{nm:'The Cathedral'},b:{nm:'Championship Night'}},
 blacktop:{fam:'Blacktop',tag:'STREET',floor:'blacktop-floor.jpg',
   a:{nm:'The Cage'},b:{nm:'Golden Hour'}},
 neon:{fam:'Neon',tag:'SYNTHWAVE',neon:true,
   a:{nm:'Midnight Grid'},b:{nm:'Sunset Circuit'}},
 cosmic:{fam:'Cosmic',tag:'DEEP SPACE',floor:'cosmic-floor.jpg',
   a:{nm:'The Float'},b:{nm:'Nebula Run'}},
 underwater:{fam:'Underwater',tag:'THE DEEP',floor:'underwater-floor.jpg',
   a:{nm:'Reef Court'},b:{nm:'Sunken Run'}}
};
var TINT=null;
function courtParts(ck){var pp=String(ck||'classic-a').split('-');
  return {C:COURTS[pp[0]]||COURTS.classic,id:COURTS[pp[0]]?pp[0]:'classic',look:pp[1]==='b'?'b':'a'};}
function courtName(ck){var c=courtParts(ck);return c.C[c.look].nm;}
function applyCourt(ck){
  var c=courtParts(ck);
  TINT=(c.C[c.look]&&c.C[c.look].tint)||null;
  if(c.id==='classic'){skinSet({});return;}
  var o={bg:COURT_ART+c.id+'-'+c.look+'-bg.jpg',bgWide:COURT_ART+c.id+'-'+c.look+'-bgwide.jpg'};
  if(c.C.neon)o.neon=true;else o.floor=COURT_ART+c.C.floor;
  skinSet(o);
}
function texTri(c2d,img,x0,y0,x1,y1,x2,y2,u0,v0,u1,v1,u2,v2){
  var d=u0*(v1-v2)+u1*(v2-v0)+u2*(v0-v1);
  if(!d)return;
  c2d.save();
  c2d.beginPath();c2d.moveTo(x0,y0);c2d.lineTo(x1,y1);c2d.lineTo(x2,y2);c2d.closePath();c2d.clip();
  var a=(x0*(v1-v2)+x1*(v2-v0)+x2*(v0-v1))/d,
      b=(y0*(v1-v2)+y1*(v2-v0)+y2*(v0-v1))/d,
      c=(x0*(u2-u1)+x1*(u0-u2)+x2*(u1-u0))/d,
      e=(y0*(u2-u1)+y1*(u0-u2)+y2*(u1-u0))/d;
  c2d.transform(a,b,c,e,x0-a*u0-c*v0,y0-b*u0-e*v0);
  c2d.drawImage(img,0,0);
  c2d.restore();
}
function skinFloor(w,h){
  /* cached: strips only re-map when rotation / fit / size change */
  var key=[RZ.toFixed(4),fit.s.toFixed(3),fit.ox|0,fit.oy|0,w,h].join('|');
  if(SKIN.cache&&SKIN.cacheKey===key)return SKIN.cache;
  var cv=SKIN.cache||document.createElement('canvas');
  cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);
  var c2=cv.getContext('2d');
  c2.setTransform(DPR,0,0,DPR,0,0);
  c2.clearRect(0,0,w,h);
  var img=SKIN.floorImg,iw=img.naturalWidth,ih=img.naturalHeight;
  /* the apron is WIDE on purpose: the coordinate letters/numbers live out
     there, and they must sit on FLOOR, not on the painted scene — plus it
     reads as a real out-of-bounds strip for inbounding */
  var MX=40,MY=36;   /* deep enough for a sideline inbounder to stand on floor */
  var N=26;                                  /* strips — perspective error ~0 */
  for(var i=0;i<N;i++){
    var ya=-MY+(LH+2*MY)*i/N, yb=-MY+(LH+2*MY)*(i+1)/N;
    var va=(ya+MY)/(LH+2*MY)*ih, vb=(yb+MY)/(LH+2*MY)*ih;
    var A=proj(-MX,ya,0),B=proj(LW+MX,ya,0),C=proj(LW+MX,yb,0),D=proj(-MX,yb,0);
    texTri(c2,img,A.x,A.y,B.x,B.y,D.x,D.y,0,va,iw,va,0,vb);
    texTri(c2,img,B.x,B.y,C.x,C.y,D.x,D.y,iw,va,iw,vb,0,vb);
  }
  SKIN.cache=cv;SKIN.cacheKey=key;
  return cv;
}

var BALLIMG=new Image();BALLIMG.src='assets/ball-hero.png';var ballReady=false;
BALLIMG.onload=function(){ballReady=true};
/* ===== SOURCED FIRE ART (Aaron, 08-02) ==================================
   Painted flame art becomes the ball-handler's aura, drawn into a FIXED
   destination box so the frames share one silhouette and the variation
   BETWEEN them reads as the flame moving, rather than one image pulsing in
   scale. Black is the transparency: these composite with 'lighter', so no
   alpha channel is needed or wanted. Falls back to the hand-drawn cone until
   the art loads, so a slow phone never shows a bald ball-handler.

   ONLY COLUMNS 1 AND 2 FEED THE AURA. They share a proportion (0.67 and
   0.56), so cycling them reads as one flame. Columns 3 and 4 are far
   narrower (0.25, 0.12) and normalising them into the same box turned the
   pillar into a wisp floating over the player's head — measured and fixed
   08-02. They are kept for the ball trail, where narrow is correct.
   Mirroring the two doubles the cycle to four apparent frames for free. */
var FIREIMG=[],fireFrames=0;
['column-1','column-2','column-3','column-4'].forEach(function(n,i){
  var im=new Image();
  im.onload=function(){fireFrames++};
  im.src='assets/fire/'+n+'.webp';
  FIREIMG[i]=im;
});
var AURA_SEQ=[{i:0,flip:false},{i:1,flip:false},{i:0,flip:true},{i:1,flip:true}];
/* own clock on purpose: t0 is declared ~700 lines below this and var-hoisting
   would hand us the NAME with no value — the exact bug that once killed the
   whole script via setupCfg. Never reach forward for a value in this file. */
var FIRE_T0=performance.now();
function fireFrame(){   /* ~8fps cycle, independent of framerate */
  if(fireFrames<2)return null;
  var f=AURA_SEQ[Math.floor((performance.now()-FIRE_T0)/125)%AURA_SEQ.length];
  return {img:FIREIMG[f.i],flip:f.flip};
}
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
/* one place that turns a TIERS hex into a canvas rgba, so tier colours are
   never re-typed as literals anywhere on the floor */
function hexA(h,a){return 'rgba('+parseInt(h.slice(1,3),16)+','+
  parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)+','+a+')';}
var RIM_L=[-14,LH/2], RIM_R=[LW+14,LH/2], RIM_H=44, REB_R=130;
function attackedRim(team){return MODE.half?RIM_R:(team===0?RIM_R:RIM_L)}

/* ===== WHAT A TILE IS WORTH vs HOW HARD IT IS (rewritten 2026-08-01) ========
   AARON: "there is no way a corner three should be a two point shot... Is there
   a difference between difficulty and shot value?"

   There was not. `tier` (question difficulty) and `pts` (score) were separate
   fields both read off ONE number -- straight-line distance to the rim -- so
   they could never disagree. But a real three-point line is not a circle: it is
   an arc CUT OFF by two straight lines down the sides, which is exactly why the
   corner three is 22ft while the top of the key is 23'9". A radius rule calls
   the corner tiles mid-range, and four tiles on the floor were paying 2.

   Now they are two questions with two answers:
     PTS  comes from the LINE  -- arc plus corner cut-offs, the real shape
     TIER comes from the SHOT  -- how hard it actually is from there
   which lets the corner three be what it is in real basketball: three points at
   mid-range difficulty, the most efficient shot on the floor. That is a real
   strategic idea the old model could not express at all.

   The arc radius (185) is GAME-TUNED, not to scale -- true scale on a 13x7 grid
   puts the line inside the second column and there is no floor left to play on.
   The SHAPE is real; the size is playable. Both are deliberate. */
var CORNER_DEPTH=2.5;      /* how far the corner strip runs from the baseline, in tiles */
function isCorner3(c,r,rim,tc){
  /* On a 7-row board the outer lane IS the corner: the tile spans from the
     sideline to ~18ft off centre, so most of it lies beyond a real corner line.
     Keyed off the row index rather than a pixel threshold so it stays true if
     the grid ever changes size. */
  return (r===0||r===ROWS-1) && Math.abs(tc[0]-rim[0])<=CORNER_DEPTH*TILE;
}
function zoneOf(c,r,team){
  var tc=tileCenter(c,r), rim=attackedRim(team);
  var d=Math.hypot(tc[0]-rim[0],tc[1]-rim[1]);
  if(d>278)return null;                                  /* out of range, still a heave */
  if(isCorner3(c,r,rim,tc))
    return {z:'corner3',tier:2,pts:3,label:'Corner three · medium · 3'};
  if(d<=95)return {z:'layup',tier:1,pts:2,label:'Layup · easy · 2'};
  if(d<=185)return {z:'mid',tier:2,pts:2,label:'Mid-range · medium · 2'};
  return {z:'three',tier:3,pts:3,label:'Three · hard · 3'};
}
/* THE KEY, as a rectangle. It used to be the same circle as the layup zone, so
   the 3-in-the-key rule policed a diamond nobody could see. A real lane is
   16ft wide by 19ft deep; on this grid that is three rows by three columns. */
function inPaint(c,r,rim){
  var tc=tileCenter(c,r);
  return Math.abs(tc[1]-rim[1])<=1.5*TILE && Math.abs(tc[0]-rim[0])<=3*TILE;
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
/* ===== TEAM COLORS (the colorway system) ==================================
   24 colorways cover the NBA / WNBA / FIBA / BIG3 palettes with overlapping
   looks collapsed into one. THE CALL rule: the toss-up winner picks jersey
   colors FIRST; the loser picks second behind a clash guard (same color
   family = blocked). Defaults stay Orange/Blue until anyone picks. */
var COLORWAYS=[
 {id:'showtime',nm:'Showtime',p:'#552583',a:'#FDB927',tag:'LA purple & gold'},
 {id:'shamrock',nm:'The Shamrock',p:'#007A33',a:'#F1F1EA',tag:'Boston green'},
 {id:'redblack',nm:'Red & Black',p:'#CE1141',a:'#141414',tag:'Chicago / Portland / BIG3'},
 {id:'bay',nm:'The Bay',p:'#1D428A',a:'#FFC72C',tag:'Golden State royal & gold'},
 {id:'valley',nm:'The Valley',p:'#E56020',a:'#5F259F',tag:'Phoenix orange & purple'},
 {id:'garden',nm:'The Garden',p:'#006BB6',a:'#F58426',tag:'New York blue & orange'},
 {id:'silverblack',nm:'Silver & Black',p:'#9EA8B0',a:'#101010',tag:'Spurs / Nets energy'},
 {id:'buzz',nm:'Buzz Teal',p:'#00788C',a:'#1D1160',tag:'Charlotte teal & purple'},
 {id:'classic',nm:'The Classic',p:'#ED174C',a:'#0046AD',tag:'Red-white-&-blue — Sixers / Pistons / USA'},
 {id:'wine',nm:'Wine & Gold',p:'#860038',a:'#FDBB30',tag:'Cleveland'},
 {id:'boiler',nm:'Boiler Gold',p:'#002D62',a:'#FDBB30',tag:'Indiana navy & gold'},
 {id:'cream',nm:'Cream City',p:'#00471B',a:'#EEE1C6',tag:'Milwaukee green & cream'},
 {id:'vice',nm:'Vice Red',p:'#98002E',a:'#F9A01B',tag:'Miami heat'},
 {id:'sactown',nm:'Sactown',p:'#5A2D81',a:'#8E9AA3',tag:'Sacramento purple & silver'},
 {id:'note',nm:'The Note',p:'#002B5C',a:'#F9A01B',tag:'Utah navy & note-gold'},
 {id:'milehigh',nm:'Mile High',p:'#0E2240',a:'#FEC524',tag:'Denver midnight & gold'},
 {id:'north',nm:'North Green',p:'#0C2340',a:'#78BE20',tag:'Minnesota — Wolves & Lynx'},
 {id:'dino',nm:'The Dino',p:'#753BBD',a:'#BAC3C9',tag:'Toronto retro purple'},
 {id:'seafoam',nm:'Liberty Seafoam',p:'#6ECEB2',a:'#101820',tag:'New York W seafoam'},
 {id:'sky',nm:'Sky Blue',p:'#418FDE',a:'#FFCD00',tag:'Chicago Sky blue & gold'},
 {id:'storm',nm:'Storm Green',p:'#2C5234',a:'#FE5000',tag:'Seattle dark green & orange'},
 {id:'roja',nm:'La Roja',p:'#AA151B',a:'#F1BF00',tag:'Spain red & gold'},
 {id:'boomer',nm:'Boomer Gold',p:'#00843D',a:'#FFCD00',tag:'Australia green & gold'},
 {id:'tricolore',nm:'Tricolore',p:'#0055A4',a:'#EF4135',tag:'France bleu'}
];
function cwHexArr(h){h=h.replace('#','');
  return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function cwHsl(h){var v=cwHexArr(h),r=v[0]/255,gg=v[1]/255,b=v[2]/255;
  var mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2,d=mx-mn,hu=0,sa=0;
  if(d){sa=d/(1-Math.abs(2*l-1));
    hu=mx===r?((gg-b)/d)%6:mx===gg?(b-r)/d+2:(r-gg)/d+4;hu=(hu*60+360)%360;}
  return {h:hu,s:sa,l:l};}
/* clash = same color FAMILY (close hue, both saturated) or near-identical */
function cwClash(pa,pb){
  var A=cwHsl(pa),B=cwHsl(pb);
  var dh=Math.abs(A.h-B.h);if(dh>180)dh=360-dh;
  if(dh<36&&A.s>0.14&&B.s>0.14)return true;
  if(A.s<=0.14&&B.s<=0.14&&Math.abs(A.l-B.l)<0.22)return true;
  return Math.abs(A.l-B.l)<0.08&&dh<14;
}
function cwGet(id){for(var i=0;i<COLORWAYS.length;i++)if(COLORWAYS[i].id===id)return COLORWAYS[i];return null;}
var CW_DEFAULT=[
 {id:null,nm:'Orange',ab:'ORG',p:'#f5872e',a:'#2a1608',rgb:'245,135,46',body:[224,120,32],band:[250,240,225]},
 {id:null,nm:'Blue',ab:'BLU',p:'#58a8d6',a:'#0d2233',rgb:'88,168,214',body:[74,152,200],band:[250,240,225]}];
var TEAM=[CW_DEFAULT[0],CW_DEFAULT[1]];
/* auto-abbreviation: "The Garden" -> GAR, "Showtime" -> SHO */
function cwAbbrev(nm){
  var w=String(nm||'').replace(/^the\s+/i,'').replace(/[^A-Za-z0-9 ]/g,'').trim();
  var parts=w.split(/\s+/);
  var ab=parts.length>=2?(parts[0][0]+parts[1][0]+(parts[1][1]||'')):w.slice(0,3);
  return (ab||'BK').toUpperCase().slice(0,3);
}
/* KEEP IT CLEAN: names travel to the other phone. Leet-normalized blocklist —
   honest limits: no filter beats determined creativity, this catches the real
   stuff. Substring match on the normalized text. */
var CW_BLOCK=['fuck','shit','bitch','cunt','asshole','dick','pussy','whore','slut',
 'nigg','fag','spic','chink','kike','wetback','tranny','retard','rape','nazi',
 'hitler','coon','porch','beaner','gook','dyke','molest','pedo','cock','jizz','cum'];
function cwNameOk(t){
  var n=String(t||'').toLowerCase()
    .replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4/g,'a')
    .replace(/5/g,'s').replace(/7/g,'t').replace(/8/g,'b').replace(/\$/g,'s')
    .replace(/@/g,'a').replace(/!/g,'i').replace(/[^a-z]/g,'');
  for(var i=0;i<CW_BLOCK.length;i++)if(n.indexOf(CW_BLOCK[i])>=0)return false;
  return true;
}
/* accepts a colorway id string OR {id,nm,ab} (custom squad identity) */
function teamFromCw(ent,slot){
  var id=(ent&&typeof ent==='object')?ent.id:ent;
  var c=id&&cwGet(id);
  if(!c){
    /* named but not yet suited up (pass&play pre-call): default colors, their name */
    if(ent&&typeof ent==='object'&&(ent.nm||ent.ab)){
      var d=CW_DEFAULT[slot];
      return {id:d.id,nm:ent.nm||d.nm,ab:ent.ab||d.ab,p:d.p,a:d.a,rgb:d.rgb,body:d.body,band:d.band};
    }
    return CW_DEFAULT[slot];
  }
  var b=cwHexArr(c.p);
  var nm=(ent&&typeof ent==='object'&&ent.nm)?ent.nm:c.nm;
  var ab=(ent&&typeof ent==='object'&&ent.ab)?ent.ab:cwAbbrev(c.nm);
  return {id:c.id,nm:nm,ab:ab,p:c.p,a:c.a,rgb:b.join(','),body:b,band:cwHexArr(c.a)};
}
function teamRGB(t){return TEAM[t].rgb}
/* UI text needs LIGHT ink — a Mile High navy hex is a great jersey and an
   unreadable HUD label. Boost lightness for the CSS vars; pieces keep truth. */
function cwTextSafe(hex){
  var H=cwHsl(hex);
  var l=Math.max(H.l,0.62),sN=H.s,c=(1-Math.abs(2*l-1))*sN,x=c*(1-Math.abs((H.h/60)%2-1)),m=l-c/2;
  var r=[c,x,0,0,x,c][Math.floor(H.h/60)%6],g=[x,c,c,x,0,0][Math.floor(H.h/60)%6],b=[0,0,x,c,c,x][Math.floor(H.h/60)%6];
  function u(v){return ('0'+Math.round((v+m)*255).toString(16)).slice(-2)}
  return '#'+u(r)+u(g)+u(b);
}
function applyColors(c0,c1){
  TEAM[0]=teamFromCw(c0,0);TEAM[1]=teamFromCw(c1,1);
  var rs=document.documentElement.style;
  rs.setProperty('--team-oj',cwTextSafe(TEAM[0].p));rs.setProperty('--away',cwTextSafe(TEAM[1].p));
  rs.setProperty('--team-a-true',TEAM[0].p);rs.setProperty('--team-b-true',TEAM[1].p);
  rebuildSprites();
  /* board plates carry the FULL squad name — sbFit shrinks it to the plate,
     falling back to the abbrev below the legibility floor */
  var hA=g('hudNmA'),hB=g('hudNmB');
  if(hA){hA.dataset.full=(TEAM[0].nm||'').toUpperCase();hA.dataset.ab=TEAM[0].ab||'';}
  if(hB){hB.dataset.full=(TEAM[1].nm||'').toUpperCase();hB.dataset.ab=TEAM[1].ab||'';}
  sbFit();
}
/* the little ball dot under whoever has the rock */
function hudPoss(){
  var a=g('possA'),b=g('possB');
  if(!a||!b)return;
  var off=state?state.offense:-1;
  a.classList.toggle('on',off===0);b.classList.toggle('on',off===1);
  if(typeof heatHud==='function')heatHud();  /* pips ride every HUD refresh */
}
/* ===== whose-turn spotlight: banner chip + court glow + HUD dim ==========
   Derived from the live phase on a timer — not sprinkled at every turn seam —
   so it can never drift from the truth. def-slide = the defense is up; anim /
   cards / battles HOLD the current spotlight (the card itself says who answers). */
var _turnLast=null;
function actingTeam(){
  if(!state)return null;
  var ph=state.phase;
  if(ph==='tip')return null;                       /* jump ball — nobody owns it yet */
  if(ph==='def-slide')return 1-state.offense;
  if(ph==='off-select'||ph==='off-move'||ph==='inbound'||ph==='inbound-move')return state.offense;
  return _turnLast;
}
setInterval(function(){
  var chip=g('turnChip'),glow=g('turnGlow');
  if(!chip||!glow)return;
  var t=(curScreen==='game'&&state)?actingTeam():null;
  _turnLast=t;
  /* each squad owns two board plates (name + score) — dim both */
  var hudA=document.querySelectorAll('#hud .team.oj'),hudB=document.querySelectorAll('#hud .team.bl');
  if(t===null){
    chip.classList.remove('on');glow.style.boxShadow='none';
    hudA.forEach(function(el){el.classList.remove('idle')});
    hudB.forEach(function(el){el.classList.remove('idle')});
    return;
  }
  var col=TEAM[t].p;
  chip.textContent='▶ '+(TEAM[t].ab||TEAM[t].nm);
  chip.style.background=col;
  chip.style.color=cwHsl(col).l>0.55?'#17110a':'#fff7ec';
  chip.classList.add('on');
  glow.style.boxShadow='inset 0 0 110px 12px rgba('+teamRGB(t)+',.34)';
  hudA.forEach(function(el){el.classList.toggle('idle',t!==0)});
  hudB.forEach(function(el){el.classList.toggle('idle',t!==1)});
},350);
/* ===== the n-7 scoreboard rig: LED fitting · match clock · n-8 jumbotron =====
   Overlays sit at % of the board art; fonts in cqw ride the strip's width.
   fitLedsIn sizes ghost+live digits from the SOCKET BOX (ghost width caps it,
   data-scale trims AFTER the fit — scaling before the fit gets cancelled). */
function fitLedsIn(root){
  if(!root)return;
  root.querySelectorAll('.ledstack').forEach(function(st){
    var box=st.getBoundingClientRect();if(!box.width)return;
    var f=box.height*1.05;
    var els=st.querySelectorAll('.ghost,.live');
    els.forEach(function(el){el.style.fontSize=f+'px'});
    var gh=st.querySelector('.ghost');
    var over=gh.scrollWidth/box.width;
    if(over>1)f=f/over*0.98;
    f=f*(parseFloat(st.dataset.scale)||1);
    els.forEach(function(el){el.style.fontSize=f+'px'});
  });
}
/* names shrink to their plate; below the 55% legibility floor they fall back
   to the squad abbrev */
function fitNamesIn(root){
  if(!root)return;
  root.querySelectorAll('.nmfit').forEach(function(el){
    var full=el.dataset.full||el.textContent;el.dataset.full=full;
    el.textContent=full;el.style.transform='';
    var box=el.parentElement.getBoundingClientRect();if(!box.width)return;
    var k=box.width/el.scrollWidth*0.94;
    if(k>=1)return;
    /* ratio floor from the artifact tuning, PLUS a hard px floor — 55% of a
       phone-sized plate is unreadable, so tiny results also fall to the abbrev */
    var eff=parseFloat(getComputedStyle(el).fontSize||'0')*k;
    if(k>=0.55&&eff>=8){el.style.transform='scale('+k+')';el.style.transformOrigin='center';return;}
    var ab=(el.dataset.ab||full.replace(/^THE\s+/i,'')).slice(0,3).toUpperCase();
    el.textContent=ab;
    var k2=box.width/el.scrollWidth*0.94;
    if(k2<1){el.style.transform='scale('+k2+')';el.style.transformOrigin='center';}
  });
}
function sbFit(){fitLedsIn(g('hud'));fitNamesIn(g('hud'));}
window.addEventListener('resize',sbFit);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){setTimeout(sbFit,50)});
/* the board's match clock: real elapsed game time, arena-style. Drills stay
   frozen (the Rulebook promises "no clock"). */
var sbT0=null;
setInterval(function(){
  if(curScreen!=='game'||!state||DRILL.on)return;
  var el=g('gclk');if(!el)return;
  var s=sbT0?Math.floor((Date.now()-sbT0-FRZ.held-(FRZ.on?Date.now()-FRZ.at:0))/1000):0;
  var mm=Math.floor(s/60)%100,ss=s%60;
  el.textContent=(mm<10?'0':'')+mm+':'+(ss<10?'0':'')+ss;
  var pe=g('gper');if(pe)pe.textContent=state.qmode?String(sd?5:state.q):'1';
  var jc=g('jclk');
  if(jc&&g('jumboveil').classList.contains('on'))jc.textContent=el.textContent;
},1000);
/* the n-8 jumbotron beat: dress the big board in live game state, hold, fade */
var jumboTmr=null;
function showJumbo(ms){
  if(DRILL.on)return;
  var v=g('jumboveil');if(!v||!state)return;
  [0,1].forEach(function(t){
    var nm=g(t===0?'jnmA':'jnmB'),sc=g(t===0?'jptsA':'jptsB'),
        jj=g(t===0?'jjerA':'jjerB'),gl=g(t===0?'jglowA':'jglowB');
    nm.dataset.full=(TEAM[t].nm||'').toUpperCase();nm.dataset.ab=TEAM[t].ab||'';
    nm.style.color=cwTextSafe(TEAM[t].p);
    sc.textContent=String(state.score[t]);
    jj.style.setProperty('--p',TEAM[t].p);jj.style.setProperty('--a',TEAM[t].a);
    var mono=jj.querySelector('i');
    if(mono)mono.textContent=(TEAM[t].ab||TEAM[t].nm||'?').charAt(0).toUpperCase();
    gl.style.setProperty('--tg','rgba('+teamRGB(t)+',.38)');
  });
  g('jper').textContent=state.qmode?String(sd?5:state.q):'1';
  var gc=g('gclk');g('jclk').textContent=gc?gc.textContent:'00:00';
  var off=state.offense;
  g('jarrL').classList.toggle('on',off===0);
  g('jarrR').classList.toggle('on',off===1);
  v.classList.add('on');
  fitLedsIn(g('jumbo'));fitNamesIn(g('jumbo'));
  if(jumboTmr)clearTimeout(jumboTmr);
  jumboTmr=setTimeout(function(){v.classList.remove('on')},ms||2400);
}
function hideJumbo(){
  if(jumboTmr){clearTimeout(jumboTmr);jumboTmr=null;}
  var v=g('jumboveil');if(v)v.classList.remove('on');
}
/* mobile tray buttons proxy their dock twins (one set of handlers) */
[['btnPauseT','btnPause'],['btnReplayT','btnReplay'],['btnMusicT','btnMusicG'],
 ['btnHelpT','btnHelp'],['btnCoachT','btnCoachG']].forEach(function(pair){
  var t=g(pair[0]);
  if(t)t.addEventListener('click',function(){
    g('hudTray').classList.remove('on');
    var d=g(pair[1]);if(d)d.click();
  });
});
/* dock whistle: quick Coach on/off without digging into settings */
function coachDockPaint(){
  var on=!!(window.BKCoach&&BKCoach.on());
  ['btnCoachG','btnCoachT'].forEach(function(id){var b=g(id);if(b)b.classList.toggle('live',on)});
}
var cg=g('btnCoachG');
if(cg)cg.addEventListener('click',function(){
  if(!window.BKCoach)return;
  var on=!BKCoach.on();BKCoach.set(on);coachDockPaint();
  callout(on?'COACH ON<small>tips on the next play</small>'
            :'COACH OFF<small>you’re on your own</small>');
});
window.addEventListener('load',coachDockPaint);
/* CPU / auto second pick: the farthest hue that doesn't clash */
function cwContrast(otherId){
  if(otherId&&typeof otherId==='object')otherId=otherId.id;
  /* no pick yet = the other side wears default ORANGE — contrast against
     that, not against Blue (or the CPU lands beside the player's real look) */
  var other=cwGet(otherId)||CW_DEFAULT[otherId?1:0];
  var best=null,bd=-1;
  COLORWAYS.forEach(function(c){
    if(c.id===otherId||cwClash(c.p,other.p))return;
    var A=cwHsl(c.p),B=cwHsl(other.p);
    var dh=Math.abs(A.h-B.h);if(dh>180)dh=360-dh;
    var d=dh+A.s*40;
    if(d>bd){bd=d;best=c;}
  });
  return best?best.id:null;
}
function pieceColor(y,team){
  if(y<0.155)return [58,42,28];
  if(y<0.655)return TEAM[team].body;
  if(y>=0.79&&y<=0.845)return TEAM[team].band;
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
function rebuildSprites(){
  ['PG','SG','SF','PF','C'].forEach(function(pos){
    SPRITES['0'+pos]=makeSprite(0,pos);
    SPRITES['1'+pos]=makeSprite(1,pos);
  });
}
rebuildSprites();

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
  if(num==null)return base;   /* no verified number -> a clean back, not a fake one */
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
  if(cfg.court)setupCfg.court=cfg.court;
  applyCourt(setupCfg.court);        /* the room's world, both phones alike */
  applyColors(cfg.colors&&cfg.colors[0],cfg.colors&&cfg.colors[1]);
  applyMode(cfg.league);
  state={
    score:[0,0], offense:0, phase:'off-select', selected:null,
    pieces:[], ball:{holder:0,fly:null}, animCb:null,
    front:false,inbMoved:false,inbPending:false,staged:null,paintCt:null,paintFor:-1,
    qmode:cfg.target==='Q', q:1, qposs:1, possTeam:null,
    clock:{t:0,kind:null,warned:-1},
    league:cfg.league, packs:(cfg.packs||[]).slice(), target:cfg.target==='Q'?9999:cfg.target,
    /* the era selection rides in state so the QUESTION gate can see it — it used
       to exist only at setup time and drive rosters, which is exactly why picking
       the '90s could still hand you a Luka card (22q) */
    eras:(cfg.decade||['FULL']).slice(),
    heat:[0,0],fire:[0,0]            /* the bar and the burn — see HEAT block */
  };
  [0,1].forEach(function(t){
    MODE.lineup.forEach(function(pos,i){
      var pl=cfg.rosters[t][pos];
      var pc={team:t,pos:pos,c:MODE.starts[t][i][0],r:MODE.starts[t][i][1],
        range:RANGE[pos],name:pl.n,short:pl.n.split(' ').pop(),num:pl.num,
        /* the permanent player id rides onto the court with the piece. This is
           the authoritative "who is on your team" — setupCfg.rosters gets nulled
           by several setup paths (online, rematch), so weighting must not read
           it. Fall back to a name lookup for squads dealt by the older
           hand-built rosters, which predate ids. */
        pid:pl.pid||pidByName(pl.n)};
      pc.spr=numberedSprite(t,pos,pl.num);
      state.pieces.push(pc);
    });
  });
  state.ball.holder=0;
  /* NB: tipPendQ is deliberately NOT cleared here. The brains screen is tap-to-skip,
     so the host's tipq often lands while the guest is still on it — clearing here
     would throw away the very pick the guest is waiting for. runTipoff consumes it. */
  usedQ={0:[],1:[],2:[],3:[],4:[]};pending=null;battle=null;tip=null;
  freezeReset();      /* a fresh game never inherits a held clock or a stale coach card */
  if(qTimer){fClear(qTimer);qTimer=null}
  if(qTick){clearInterval(qTick);qTick=null}
  g('rebveil').classList.remove('on');
  g('qveil').classList.remove('on');
  g('pauseveil').classList.remove('on');
  g('tipveil').classList.remove('on');
  g('meterveil').classList.remove('on');meter=null;
  stagebox('');g('callout').classList.remove('show');
  FOCUS.k=0;FOCUS.tk=0;lastPlay=null;sd=null;
  g('ptsA').textContent='0';g('ptsB').textContent='0';hudPoss();
  g('hudMid').textContent=(state.qmode?'Q1 · POSS 1/6':MODE.label+' · FIRST TO '+cfg.target)+
    (NET.on?' · YOU ARE '+teamName(NET.role).toUpperCase():'')+cpuHudTag();
  hideJumbo();
  sbT0=Date.now();
  var gc0=g('gclk');if(gc0)gc0.textContent='00:00';
  var gp0=g('gper');if(gp0)gp0.textContent='1';
  refit();
  setTimeout(sbFit,60);
  /* arena beat: the jumbotron introduces the matchup, then the tip */
  if(!resume){showJumbo(2100);fTimeout(runTipoff,2150);}
}
function pieceAt(c,r){for(var i=0;i<state.pieces.length;i++){var p=state.pieces[i];
  if(p.c===c&&p.r===r)return i}return -1}
function teamName(t){return TEAM[t].nm}
function banner(html){g('bannerTxt').innerHTML=html}   /* the turn chip keeps its slot */
function actions(html){g('actions').innerHTML=html}
function defendedRim(team){return MODE.half?RIM_R:(team===0?RIM_L:RIM_R)}
function defSlideRange(p){
  var rim=defendedRim(p.team),tc=tileCenter(p.c,p.r);
  /* stranded deep = sprint at full offensive speed; otherwise defense moves
     one square LESS than the player's offensive range (min 1) */
  return Math.hypot(tc[0]-rim[0],tc[1]-rim[1])>LW*0.52 ? rangeOf(p) : Math.max(1,rangeOf(p)-1);
}
/* ===== SPACING: WHICH NEIGHBOURS A DEFENDER ACTUALLY GUARDS ================
   House rule, room-level, default OPEN FLOOR (Aaron 08-01; four settings
   Aaron 08-02, built from 22af findings F1/F2 — the research's "zone of
   control" dial, translated).
     OPEN FLOOR  — only the 4 he is SQUARE to. 102% -> 57%, better spacing than
                   BIG3 has today, without touching the board or the squad.
     LOCKED UP   — all 8 neighbours gate, full price. 5v5 measures 102%
                   saturation: no open space before anyone moves.
     PAY THE TOLL— all 8 gate, but corner coverage charges LESS: a crossover
                   forced by a diagonal defender is one tier easier (priced in
                   doMove). The research's "fluid" setting: coverage graduated,
                   never binary. Contests were already graduated (see doShoot).
     ONE-ON-ONE — all 8 gate, but no lane may be gated by TWO defenders at
                   once: those moves are refused, you beat men one at a time
                   (enforced in doMove via driveChallenge.count). The
                   research's "semi-rigid" setting.
   SCREENS ARE NOT AFFECTED in any mode — a body diagonal to a defender still
   screens him, because a body is a body. screenedSet() keeps king-move
   adjacency. */
function guards(dc,dr,c,r){
  var ax=Math.abs(dc-c),ay=Math.abs(dr-r);
  if(Math.max(ax,ay)>1)return false;
  if(setupCfg.spacing==='open')return ax+ay<=1;     /* square-on only */
  return true;             /* locked / toll / chain: corners included */
}
function adjDefenderIdx(c,r,offTeam){
  var rim=attackedRim(offTeam);
  var sc=tileCenter(c,r),sRim=Math.hypot(sc[0]-rim[0],sc[1]-rim[1]);
  var best=-1,bestC=false;
  state.pieces.forEach(function(p,i){
    if(p.team===offTeam)return;
    if(!guards(p.c,p.r,c,r))return;
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
/* ---- WHAT IS EACH DEFENDER DOING TO ME? (08-01) --------------------------
   AARON: "it's really hard to understand screening in gameplay, several times a
   player was able to go past one of my players because of a 'screen' and I have
   no idea where that screen was." He was right and it was not a rule bug: the
   screened state was COMPUTED and never DRAWN. On offence you could infer it
   from your own tiles changing colour; on defence there was no signal at all.
   Three states, three different marks at the defender's feet:
     screened  — his coverage is broken, drive right past him   (teal, BROKEN ring)
     contest   — he is in your chest and will contest the shot   (red, SOLID ring)
     gate      — drive past him and he forces a crossover        (amber, ring + pips)
   Recomputed per frame from the same helpers the rules use, so the marks can
   never disagree with what actually happens. */
function defenderMarks(){
  var m={};
  if(!state||!state.pieces||state.ball.fly)return m;
  var off=state.offense;
  /* PRIORITY: contest > screened > gate, and the order is not cosmetic.
     A screen only stops a defender GATING A DRIVE -- it does not stop him
     contesting a SHOT (adjDefenderIdx never consults screens). Marking a
     screened man as merely "screened" while he is standing in your chest would
     be the display telling you he is beaten when he is about to challenge the
     shot. The most urgent true thing wins. */
  var scr=screenedSet(off);
  for(var k in scr)m[k]='screened';
  /* contest + gate are read from whoever is holding or selected — that is the
     player whose options the marks are describing */
  var si=(state.selected!=null&&state.pieces[state.selected]&&
          state.pieces[state.selected].team===off)?state.selected:state.ball.holder;
  var sel=state.pieces[si];
  if(!sel||sel.team!==off)return m;
  state.pieces.forEach(function(d,di){
    if(d.team===off||m[di])return;
    if(Math.max(Math.abs(d.c-sel.c),Math.abs(d.r-sel.r))>1)return;
    m[di]='gate';
  });
  var ci=adjDefenderIdx(sel.c,sel.r,off);
  if(ci>=0)m[ci]='contest';        /* overrides 'screened' on purpose — see above */
  return m;
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
  var best=-1,bd=1e9,n=0;
  state.pieces.forEach(function(p,i){
    if(p.team===offTeam||scr[i])return;
    var dc=tileCenter(p.c,p.r);
    var lineD=segDist(dc[0],dc[1],a[0],a[1],b[0],b[1]);
    var gate=false;
    var marking=guards(p.c,p.r,fc,fr);
    if(marking&&Math.hypot(dc[0]-rim[0],dc[1]-rim[1])<sRim+TILE*0.6)gate=true;
    else if(guards(p.c,p.r,tc2,tr2)){
      var dRim=Math.hypot(dc[0]-rim[0],dc[1]-rim[1]);
      var tRim=Math.hypot(b[0]-rim[0],b[1]-rim[1]);
      if(tRim<dRim-TILE*0.3)gate=true; /* slipping BEHIND him — that's a cross */
    }
    else if(lineD<=TILE*1.15)gate=true;
    if(gate){n++;if(lineD<bd){bd=lineD;best=i}}
  });
  /* how many distinct men gate this drive — the ONE-ON-ONE house rule refuses
     the move at 2+, so callers read it right after the call */
  driveChallenge.count=n;
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
  if(SKIN.on&&(SKIN.bgOk||SKIN.bgWideOk)){
    /* painted scene, cover-fit, biased upward so the horizon sits high.
       Wide screens get the 16:9 art when the skin ships one. */
    var wantWide=w>h*1.1;
    var bi=(wantWide&&SKIN.bgWideOk)?SKIN.bgWideImg:(SKIN.bgOk?SKIN.bgImg:SKIN.bgWideImg);
    var bw=bi.naturalWidth,bh=bi.naturalHeight;
    var sc=Math.max(w/bw,h/bh),dw=bw*sc,dh=bh*sc;
    ctx.drawImage(bi,(w-dw)/2,Math.min(0,(h-dh)*0.28),dw,dh);
    /* scrim: the game must stay readable ON TOP of art — darken edges, not center */
    var sg=ctx.createLinearGradient(0,0,0,h);
    sg.addColorStop(0,'rgba(6,4,3,'+(SKIN.scrim*1.15)+')');
    sg.addColorStop(.42,'rgba(6,4,3,'+(SKIN.scrim*0.45)+')');
    sg.addColorStop(1,'rgba(6,4,3,'+(SKIN.scrim)+')');
    ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
  }else{
    var grad=ctx.createLinearGradient(0,0,0,h);
    var TB=TINT?TINT.bg:['#0b0908','#171210','#241b13'];
    grad.addColorStop(0,TB[0]);grad.addColorStop(.5,TB[1]);grad.addColorStop(1,TB[2]);
    ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  }

  if(SKIN.on&&SKIN.neon){
    /* THE NEON FLOOR IS CODE, NOT ART. A pre-printed glow grid fights the
       projected tile grid (round-1 lesson) — so the floor is plain dark gloss
       and the GAME's own grid carries the neon. One grid, and it's the board. */
    var nA=proj(-40,-22,0),nB=proj(LW+40,-22,0),nC=proj(LW+40,LH+22,0),nD=proj(-40,LH+22,0);
    ctx.beginPath();ctx.moveTo(nA.x,nA.y);ctx.lineTo(nB.x,nB.y);ctx.lineTo(nC.x,nC.y);ctx.lineTo(nD.x,nD.y);ctx.closePath();
    var ng=ctx.createLinearGradient(0,Math.min(nA.y,nB.y),0,Math.max(nC.y,nD.y));
    ng.addColorStop(0,'#101018');ng.addColorStop(.55,'#0a0a10');ng.addColorStop(1,'#14101c');
    ctx.fillStyle=ng;ctx.fill();
    /* a soft horizon sheen, like the sun catching the gloss */
    var sh=ctx.createLinearGradient(0,Math.min(nA.y,nB.y),0,(Math.min(nA.y,nB.y)+Math.max(nC.y,nD.y))/2);
    sh.addColorStop(0,'rgba(255,120,190,.10)');sh.addColorStop(1,'rgba(255,120,190,0)');
    ctx.fillStyle=sh;ctx.fill();
  }else if(SKIN.on&&SKIN.floorOk){
    ctx.drawImage(skinFloor(w,h),0,0,w,h);
    /* the out-of-bounds strip sits a shade darker than the playing floor —
       boundary reads at a glance and the coordinates get their contrast */
    [[-40,-22,LW+40,0],[-40,LH,LW+40,LH+22],[-40,0,0,LH],[LW,0,LW+40,LH]]
      .forEach(function(q4){quad(q4[0],q4[1],q4[2],q4[3],0,'rgba(8,5,3,.34)');});
  }else{
    quad(-40,-22,LW+40,LH+22,0,TINT?TINT.apron:'#241708');
  }
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
    var x0=c*TILE,y0=r*TILE;
    if(SKIN.on&&(SKIN.floorOk||SKIN.neon)){
      /* the texture IS the floor — keep only a whisper of checker so move
         range still reads tile-by-tile */
      quad(x0,y0,x0+TILE,y0+TILE,0,((c+r)%2===0)
        ?'rgba(255,244,224,'+SKIN.tileAlpha*0.55+')'
        :'rgba(10,6,3,'+SKIN.tileAlpha+')');
    }else{
      var wood=((c+r)%2===0)?(TINT?TINT.tileA:'#a8794e'):(TINT?TINT.tileB:'#9c6f45');
      quad(x0,y0,x0+TILE,y0+TILE,0,wood);
    }
    if(state){
      var z=zoneOf(c,r,state.offense);
      /* AARON 08-01: "the squares are not clear enough at all". They were .14-.20
         alpha washes laid over a checkerboard AND, with a court skin on, over
         painted art -- three ways to lose a colour at once. Fill is up, and the
         real fix is the OUTLINE pass below: one bold border around each zone
         instead of 40 tinted squares arguing with the tiling. */
      /* COLOUR MEANS DIFFICULTY. FULL STOP. (corrected 08-01)
         I had fill=value / outline=difficulty. Aaron: "colors tend to represent
         difficulty not value... these are questions." He is right, and the game
         already settled this argument -- TIERS defines green/amber/red for
         Easy/Medium/Hard on every card, so a red tile that meant "worth 3" was
         fighting the game's own vocabulary.
         VALUE is carried by the cream THREE-POINT LINE instead, which is how a
         real court does it: nobody tints the three-point area, the line tells
         you. Outside the line is worth three. No legend, no new language. */
      if(z){quad(x0,y0,x0+TILE,y0+TILE,0,hexA(TIERS[z.tier].c,.26));}
    }
  }
  if(SKIN.on&&SKIN.neon){
    /* the tile grid IS the synthwave grid: wide soft bloom, then a bright core */
    var NEON=[['rgba(64,224,255,',  'v'],['rgba(255,64,190,','h']];
    [[ 'rgba(64,224,255,.14)',5.5],['rgba(64,224,255,.65)',1.6]].forEach(function(pass){
      ctx.strokeStyle=pass[0];ctx.lineWidth=pass[1];
      for(var cN=0;cN<=COLS;cN++)line(cN*TILE,0,cN*TILE,LH);
    });
    [['rgba(255,64,190,.14)',5.5],['rgba(255,64,190,.65)',1.6]].forEach(function(pass){
      ctx.strokeStyle=pass[0];ctx.lineWidth=pass[1];
      for(var rN=0;rN<=ROWS;rN++)line(0,rN*TILE,LW,rN*TILE);
    });
  }else{
    ctx.strokeStyle='rgba(20,10,4,.35)';ctx.lineWidth=1;
    for(var c2=0;c2<=COLS;c2++)line(c2*TILE,0,c2*TILE,LH);
    for(var r2=0;r2<=ROWS;r2++)line(0,r2*TILE,LW,r2*TILE);
  }
  /* ---- THE FLOOR EXPLAINS ITSELF (08-01) -----------------------------------
     Three layers, each a signal a basketball player already knows:
       1. difficulty outline — green easy / amber medium / red hard
       2. THE THREE-POINT LINE — the border of everything worth 3, in court cream
       3. THE KEY — the box the 3-second rule actually polices
     Layers 2 and 3 are traced from isCorner3/zoneOf/inPaint themselves, by
     walking tiles and stroking only the edges where the answer CHANGES. So the
     line on the floor cannot drift from the rule that scores the shot — the one
     failure mode that made the corner three wrong in the first place. */
  if(state){
    var edges=function(test,style,w,dash){
      ctx.strokeStyle=style;ctx.lineWidth=w;
      if(dash)ctx.setLineDash(dash);
      for(var rE=0;rE<ROWS;rE++)for(var cE=0;cE<COLS;cE++){
        if(!test(cE,rE))continue;
        var X=cE*TILE,Y=rE*TILE;
        if(!test(cE,rE-1))line(X,Y,X+TILE,Y);
        if(!test(cE,rE+1))line(X,Y+TILE,X+TILE,Y+TILE);
        if(!test(cE-1,rE))line(X,Y,X,Y+TILE);
        if(!test(cE+1,rE))line(X+TILE,Y,X+TILE,Y+TILE);
      }
      if(dash)ctx.setLineDash([]);
    };
    var onB=function(c5,r5){return c5>=0&&r5>=0&&c5<COLS&&r5<ROWS};
    var tierAt=function(c5,r5){
      if(!onB(c5,r5))return null;
      var zz=zoneOf(c5,r5,state.offense);return zz?zz.tier:null;
    };
    /* 1. difficulty — halo then core, so it survives on a painted court */
    /* same tier colours as the card header — ONE definition, TIERS, so the
       floor and the question can never disagree about what "hard" looks like */
    [[6,.18],[2.4,.85]].forEach(function(pass){
      [1,2,3].forEach(function(t){
        edges(function(c5,r5){return tierAt(c5,r5)===t},
              hexA(TIERS[t].c,pass[1]),pass[0]);
      });
    });
    /* 2. the three-point line — painted on the floor like the real thing */
    var worth3=function(c5,r5){
      if(!onB(c5,r5))return false;
      var zz=zoneOf(c5,r5,state.offense);return !!zz&&zz.pts===3;
    };
    edges(worth3,'rgba(0,0,0,.45)',7);
    edges(worth3,'rgba(250,244,230,.92)',3);
    /* 3. the key — both ends, because the rule follows possession */
    [RIM_L,RIM_R].forEach(function(rm){
      if(MODE.half&&rm!==RIM_R)return;
      var key=function(c5,r5){return onB(c5,r5)&&inPaint(c5,r5,rm)};
      for(var rK=0;rK<ROWS;rK++)for(var cK=0;cK<COLS;cK++)
        if(key(cK,rK))quad(cK*TILE,rK*TILE,cK*TILE+TILE,rK*TILE+TILE,0,'rgba(232,140,60,.13)');
      edges(key,'rgba(0,0,0,.40)',6);
      edges(key,'rgba(250,244,230,.85)',2.5);
    });
  }
  if(SKIN.on&&SKIN.neon){
    /* boundary + halfcourt burn white-hot */
    ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=6;
    line(0,0,LW,0);line(LW,0,LW,LH);line(LW,LH,0,LH);line(0,LH,0,0);line(LW/2,0,LW/2,LH);
    circle(LW/2,LH/2,52);
  }
  ctx.strokeStyle='rgba(244,236,220,'+(SKIN.on&&SKIN.neon?'.95':'.55')+')';ctx.lineWidth=2.5;
  line(0,0,LW,0);line(LW,0,LW,LH);line(LW,LH,0,LH);line(0,LH,0,0);
  line(LW/2,0,LW/2,LH);
  circle(LW/2,LH/2,52);
  /* chess-style coordinates: letters across, numbers up the sides —
     call "C to E4!" (voice mode someday) */
  if(!(window.BKAudio&&BKAudio.settings.coords===false)){
  /* over painted art the letters need a halo or they drown — shadow only
     costs when a skin is active */
  if(SKIN.on){ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=4;
    ctx.fillStyle='rgba(250,243,228,.85)';}
  else ctx.fillStyle='rgba(244,236,220,.42)';
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
  ctx.shadowBlur=0;
  }
  /* whose hoop is whose: each rim wears its attacker's color, always */
  if(state&&!MODE.half){
    ctx.lineWidth=3.5;
    ctx.strokeStyle='rgba('+teamRGB(0)+',.5)';line(LW,0,LW,LH);
    ctx.strokeStyle='rgba('+teamRGB(1)+',.5)';line(0,0,0,LH);
    [[RIM_R,'rgba('+teamRGB(0)+',.15)'],[RIM_L,'rgba('+teamRGB(1)+',.15)']].forEach(function(RA){
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
    ctx.fillStyle='rgba('+teamRGB(state.offense)+','+pulse+')';
    ctx.beginPath();ctx.ellipse(gp2.x,gp2.y,26*fit.s,10*fit.s,0,0,7);ctx.fill();
  }

  if(state&&state.selected!=null&&
     (state.phase==='off-move'||state.phase==='def-slide'||state.phase==='inbound-move')){
    var sel=state.pieces[state.selected];
    var range=state.phase==='def-slide'?defSlideRange(sel):rangeOf(sel); /* ON FIRE: +1 */
    var isCar=state.phase==='off-move'&&state.selected===state.ball.holder;
    for(var rr=0;rr<ROWS;rr++)for(var cc=0;cc<COLS;cc++){
      var d=Math.max(Math.abs(cc-sel.c),Math.abs(rr-sel.r));
      if(d>0&&d<=range&&pieceAt(cc,rr)===-1){
        if(isCar&&state.front&&!inFront(state.offense,cc,rr)){
          quad(cc*TILE+3,rr*TILE+3,(cc+1)*TILE-3,(rr+1)*TILE-3,0,'rgba(96,22,16,.42)');
          continue; /* backcourt: dark red = legal tap, but it's a turnover */
        }
        var col;
        if(state.phase==='def-slide')col='rgba('+teamRGB(1-state.offense)+',.38)';
        else if(isCar&&driveChallenge(sel.c,sel.r,cc,rr,state.offense)>=0){
          var dd2=Math.max(Math.abs(cc-sel.c),Math.abs(rr-sel.r));
          if(setupCfg.spacing==='chain'&&driveChallenge.count>=2)
            col='rgba(96,22,16,.42)'; /* one-on-one: two gaters = lane CLOSED —
              same dark do-not-tap as the backcourt, tapping it just explains */
          else col=dd2>=3?'rgba(168,32,58,.62)':'rgba(213,82,75,.45)'; /* darker = DEEP cross */
        }
        else col='rgba('+teamRGB(state.offense)+',.38)';
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
  /* the goal nearest the camera GHOSTS: half-transparent, like every real
     basketball game — it never blocks the play or dominates the frame */
  var gsl=proj(-24,LH/2,44).s, gsr=proj(LW+24,LH/2,44).s;
  var ghostL=(!MODE.half&&gsl>gsr*1.12), ghostR=(gsr>gsl*1.12);
  if(!MODE.half)draws.push({z:rawProj(-24,LH/2,0).z, fn:function(){
    if(ghostL)ctx.globalAlpha=0.45; drawGoal(-1); ctx.globalAlpha=1;}});
  draws.push({z:rawProj(LW+24,LH/2,0).z, fn:function(){
    if(ghostR)ctx.globalAlpha=0.45; drawGoal(1); ctx.globalAlpha=1;}});
  var DEFMARK=state?defenderMarks():{};   /* once per frame, not once per piece */
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
      /* ON FIRE aura — the super-saiyan beat (Aaron 08-02). Drawn AFTER the
         drop shadow: painting it first let the shadow bury the teammates'
         ember rings, which is exactly why the effect read as "too subtle" in
         the first screenshots. Additive blending so it GLOWS on any court. */
      if(heatFireOn(p.team)){
        var still=document.body.classList.contains('reduce-motion');
        var fk=still?1:(0.86+0.14*Math.sin(now*9+i*2));
        var holder=(state.ball.holder===i&&!state.ball.fly);
        ctx.save();ctx.globalCompositeOperation='lighter';
        if(holder){
          var fr=42*scl*2*fk;
          var fg=ctx.createRadialGradient(ptF.x,ptF.y,2,ptF.x,ptF.y,fr*1.6);
          fg.addColorStop(0,'rgba(255,225,150,.85)');
          fg.addColorStop(0.35,'rgba(245,135,46,.55)');
          fg.addColorStop(1,'rgba(245,135,46,0)');
          ctx.fillStyle=fg;
          ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,fr*1.6,fr*0.62,0,0,7);ctx.fill();
          /* THE PILLAR — painted flame art (Aaron sourced it 08-02), drawn
             into a fixed box so the four frames share one silhouette and
             their differences read as the flame MOVING. Falls back to the
             hand-drawn cone while the art is still loading. */
          var ch=sh*(1.3+(still?0:0.14*Math.sin(now*13+i)));
          var fr=still?{img:FIREIMG[0],flip:false}:fireFrame();
          var art=fr&&fr.img;
          if(art&&art.complete&&art.naturalWidth){
            /* MEASURED against the sprite, not invented: the sprite is
               120x170*scl, so the flame is ~1.4x his width and ~1.25x his
               height, bottom anchored just under the feet. Earlier this was
               1.5x TALL and sprite-width narrow, which read as a wisp
               floating over his head instead of fire he is standing in. */
            var pw=168*scl*fk, phh=212*scl*(still?1:1+0.06*Math.sin(now*13+i));
            ctx.globalAlpha=still?0.92:0.84+0.16*Math.sin(now*10+i);
            ctx.save();
            if(fr.flip){ctx.translate(ptF.x,0);ctx.scale(-1,1);ctx.translate(-ptF.x,0)}
            ctx.drawImage(art,ptF.x-pw/2,ptF.y+5*scl-phh,pw,phh);
            ctx.restore();
            ctx.globalAlpha=1;
          }else{
            var cg=ctx.createLinearGradient(0,ptH.y-ch,0,ptF.y);
            cg.addColorStop(0,'rgba(255,225,150,0)');
            cg.addColorStop(0.45,'rgba(255,170,60,'+(still?0.3:0.24+0.14*Math.sin(now*11))+')');
            cg.addColorStop(1,'rgba(255,190,90,.62)');
            ctx.fillStyle=cg;
            ctx.beginPath();
            ctx.moveTo(ptF.x-34*scl*2*fk,ptF.y);
            ctx.quadraticCurveTo(ptF.x-16*scl*2,ptH.y-ch*0.6,ptF.x,ptH.y-ch);
            ctx.quadraticCurveTo(ptF.x+16*scl*2,ptH.y-ch*0.6,ptF.x+34*scl*2*fk,ptF.y);
            ctx.closePath();ctx.fill();
          }
          /* embers peeling off the flame — the detail that sells "burning" */
          if(!still)for(var e=0;e<5;e++){
            var ep=(now*0.55+e*0.2)%1;
            var ex=ptF.x+Math.sin(now*3+e*2.1)*20*scl*2*(0.4+ep);
            var ey=ptF.y-ep*ch*0.95;
            var er=(2.6-ep*1.7)*Math.max(.6,scl*2);
            ctx.fillStyle='rgba(255,'+Math.round(200-ep*70)+',110,'+(0.85*(1-ep))+')';
            ctx.beginPath();ctx.arc(ex,ey,Math.max(0.4,er),0,7);ctx.fill();
          }
        }else{
          /* teammates: a glowing ember ring + soft floor bloom — they hold the
             +1 move too, so they must read as lit, not merely outlined */
          var tr=27*scl*2*fk;
          var tg=ctx.createRadialGradient(ptF.x,ptF.y,1,ptF.x,ptF.y,tr*1.35);
          tg.addColorStop(0,'rgba(245,135,46,.42)');
          tg.addColorStop(1,'rgba(245,135,46,0)');
          ctx.fillStyle=tg;
          ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,tr*1.35,tr*0.5,0,0,7);ctx.fill();
          ctx.strokeStyle='rgba(255,190,90,'+(still?0.75:0.6+0.3*Math.sin(now*7+i*1.7))+')';
          ctx.lineWidth=3;
          ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,tr,tr*0.37,0,0,7);ctx.stroke();
        }
        ctx.restore();
      }
      var mk=DEFMARK[i];
      if(mk){
        var MC={screened:'111,208,195', contest:'224,71,60', gate:'232,184,75'}[mk];
        var rx=25*scl*2, ry=9.5*scl*2;
        /* a soft floor-glow first so the ring survives on a painted court */
        var gr=ctx.createRadialGradient(ptF.x,ptF.y,1,ptF.x,ptF.y,rx*1.25);
        gr.addColorStop(0,'rgba('+MC+',.34)');gr.addColorStop(1,'rgba('+MC+',0)');
        ctx.fillStyle=gr;
        ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,rx*1.25,ry*1.25,0,0,7);ctx.fill();
        ctx.strokeStyle='rgba('+MC+',.95)';
        if(mk==='screened'){
          /* BROKEN ring — the coverage itself is broken. Reads at a glance and
             cannot be mistaken for the solid contest ring even in greyscale. */
          ctx.lineWidth=3.5;ctx.setLineDash([9*Math.max(.5,scl*2),7*Math.max(.5,scl*2)]);
          ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,rx,ry,0,0,7);ctx.stroke();
          ctx.setLineDash([]);
        }else if(mk==='contest'){
          ctx.lineWidth=4;
          ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,rx,ry,0,0,7);ctx.stroke();
          ctx.lineWidth=2;                       /* double ring = he is RIGHT there */
          ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,rx*0.72,ry*0.72,0,0,7);ctx.stroke();
        }else{
          ctx.lineWidth=3;
          ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,rx,ry,0,0,7);ctx.stroke();
        }
      }
      if(state.selected===i){
        ctx.strokeStyle=teamCol(p.team);ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,24*scl*2,9*scl*2,0,0,7);ctx.stroke();
      }
      if(state.staged&&state.staged.kind==='pass'&&state.staged.toIdx===i){
        ctx.strokeStyle='rgba(255,255,255,'+(0.6+0.3*Math.sin(now*6))+')';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,27*scl*2,10*scl*2,0,0,7);ctx.stroke();
      }
      ctx.drawImage(spr,ptH.x-sw/2,ptH.y-sh+bob,sw,sh);
      if(state.ball.holder===i&&!state.ball.fly){
        var bx=ptH.x+16*scl*2,by=ptH.y-24*scl*2+bob,br=8*Math.max(.6,scl*2);
        if(heatFireOn(p.team)){
          /* the ball itself burns while the team is lit — additive, with a
             comet tail, so it is the brightest thing on the floor */
          var still2=document.body.classList.contains('reduce-motion');
          var gr2=br*(still2?3.4:3+1*Math.sin(now*12));
          ctx.save();ctx.globalCompositeOperation='lighter';
          var bg=ctx.createRadialGradient(bx,by,1,bx,by,gr2);
          bg.addColorStop(0,'rgba(255,244,200,.95)');
          bg.addColorStop(0.3,'rgba(255,170,60,.7)');
          bg.addColorStop(1,'rgba(245,135,46,0)');
          ctx.fillStyle=bg;
          ctx.beginPath();ctx.arc(bx,by,gr2,0,7);ctx.fill();
          if(!still2)for(var be=0;be<4;be++){
            var bp=(now*0.9+be*0.25)%1;
            var bex=bx+Math.sin(now*4+be*1.9)*br*1.1;
            var bey=by-bp*br*3.4;
            ctx.fillStyle='rgba(255,'+Math.round(210-bp*80)+',120,'+(0.9*(1-bp))+')';
            ctx.beginPath();ctx.arc(bex,bey,Math.max(0.4,(1.9-bp*1.3)*Math.max(.6,scl*2)),0,7);ctx.fill();
          }
          ctx.restore();
        }
        drawBall(bx,by,br);
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

  if(meter&&!meter.done&&!gameFrozen())meter.el.style.left=(meterPos()*100)+'%';
  var vr=g('viewReset');if(vr)vr.classList.toggle('on',Math.abs(ZOOM-1)>0.02);
  var ckEl=g('shotclock');
  if(state&&clockTickable()){
    var ck=state.clock;
    ck.t-=dt;
    var disp=Math.max(0,Math.ceil(ck.t));
    ckEl.style.display='flex';   /* the wing ledstack centers via flex */
    ckEl.textContent=(disp<10?'0':'')+disp;
    ckEl.classList.toggle('hot',ck.t<=5);
    if(ck.t<=5&&ck.t>0&&disp!==ck.warned){ck.warned=disp;if(window.BKAudio)BKAudio.sfx('tap');}
    if(ck.t<=0){var kk=ck.kind;ck.kind=null;ckEl.style.display='none';clockExpire(kk);}
  }else if(ckEl.style.display!=='none')ckEl.style.display='none';

  /* advance animations — this block is the engine's real play-resolver: the
     completion callbacks score buckets, flip possession and can end the game,
     so it holds with everything else while the game is frozen (the canvas
     above still draws, the ball just hangs where it was) */
  if(state&&!gameFrozen()){
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
  var col=teamRGB(team);
  var now2=(performance.now()-t0)/1000;
  var pb=proj(bx,cy,0);
  var c1=proj(bx,cy-34,34),c2=proj(bx,cy+34,34),c3=proj(bx,cy+34,78),c4=proj(bx,cy-34,78);
  var bcx=(c1.x+c2.x+c3.x+c4.x)/4,bcy=(c1.y+c2.y+c3.y+c4.y)/4;
  var brad=Math.hypot(c1.x-c3.x,c1.y-c3.y)*1.05;
  /* --- ownership light: a colored glow blooming BEHIND the backboard --- */
  var pulse=(state&&attackedRim(state.offense)[0]===rx)?0.35+0.18*Math.sin(now2*3):0.28;
  var gb=ctx.createRadialGradient(bcx,bcy,brad*0.12,bcx,bcy,brad);
  gb.addColorStop(0,'rgba('+col+','+pulse+')');
  gb.addColorStop(1,'rgba('+col+',0)');
  ctx.fillStyle=gb;ctx.beginPath();ctx.arc(bcx,bcy,brad,0,7);ctx.fill();
  /* ---- arena stanchion: padded base -> boom arm -> overhead drop-mount ----
     Modeled on portable pro units: the arm hangs the board from ABOVE, the
     weight lives in a padded base sitting well behind the baseline, and the
     whole rig wears the team's livery (base pads + boom repaint with col). */
  var dirA=(side<0?-1:1), ss=Math.max(.5,pb.s);
  function member(x0,y0,z0,x1,y1,z1,wSteel,wCol,liv){   /* one structural tube */
    var A=proj(x0,y0,z0),B=proj(x1,y1,z1);
    ctx.lineCap='round';
    ctx.strokeStyle='#26262c';ctx.lineWidth=wSteel*ss;
    ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();
    if(liv){ctx.strokeStyle='rgb('+col+')';ctx.lineWidth=wCol*ss;
      ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();}
    ctx.strokeStyle='rgba(255,255,255,'+(liv?'.28':'.35')+')';ctx.lineWidth=1.1*ss;
    ctx.beginPath();ctx.moveTo(A.x,A.y-wCol*ss*.28);ctx.lineTo(B.x,B.y-wCol*ss*.28);ctx.stroke();
  }
  /* padded base: dark skirt low, team-color pad above, slight top sheen */
  var b0=bx+dirA*20,b1=bx+dirA*44;
  var k1=proj(b0,cy-15,0),k2=proj(b1,cy-15,0),k3=proj(b1,cy+15,0),k4=proj(b0,cy+15,0);
  var t1=proj(b0,cy-13,14),t2=proj(b1,cy-13,14),t3=proj(b1,cy+13,14),t4=proj(b0,cy+13,14);
  ctx.beginPath();ctx.moveTo(k1.x,k1.y);ctx.lineTo(k2.x,k2.y);ctx.lineTo(k3.x,k3.y);ctx.lineTo(k4.x,k4.y);ctx.closePath();
  ctx.fillStyle='#141418';ctx.fill();                       /* floor shadow slab */
  /* pad walls: both court-facing sides so it looks solid from any camera turn */
  [[k4,k3,t3,t4],[k1,k4,t4,t1],[k2,k3,t3,t2]].forEach(function(F,fi){
    ctx.beginPath();ctx.moveTo(F[0].x,F[0].y);ctx.lineTo(F[1].x,F[1].y);
    ctx.lineTo(F[2].x,F[2].y);ctx.lineTo(F[3].x,F[3].y);ctx.closePath();
    var padG=ctx.createLinearGradient(F[0].x,F[0].y,F[3].x,F[3].y);
    padG.addColorStop(0,'rgba('+col+','+(fi?'.38':'.55')+')');
    padG.addColorStop(1,'rgba('+col+','+(fi?'.72':'1')+')');
    ctx.fillStyle=padG;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.2;ctx.stroke();
  });
  ctx.beginPath();ctx.moveTo(t1.x,t1.y);ctx.lineTo(t2.x,t2.y);ctx.lineTo(t3.x,t3.y);ctx.lineTo(t4.x,t4.y);ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,.14)';ctx.fill();          /* top face sheen */
  /* A-frame boom: TWO legs out of the base, converging as they climb, then
     two hanger arms reaching over to grip the board from above (photo ref) */
  var eX=bx+dirA*5,eZ=90;                                    /* elbow, overhead */
  [-1,1].forEach(function(sy){
    member(bx+dirA*36,cy+sy*10,12,eX,cy+sy*4,eZ,8,5.4,true); /* main leg        */
    member(eX,cy+sy*4,eZ,bx,cy+sy*3,79,6.5,4.2,true);        /* hanger arm      */
  });
  /* cross-bracing rungs tie the legs into one truss */
  [0.3,0.55,0.8].forEach(function(tt){
    var xx=bx+dirA*36+(eX-(bx+dirA*36))*tt, zz=12+(eZ-12)*tt, yy=10+(4-10)*tt;
    member(xx,cy-yy,zz,xx,cy+yy,zz,4.5,2.6,true);
  });
  /* CLEAR GLASS backboard — a SLAB with thickness, so when the camera swings
     edge-on it reads as a pane of glass, not a spear through the net */
  var bs=Math.max(.6,pb.s), xf=bx-dirA*1.8, xb2=bx+dirA*1.8;
  function bq(xx){return [proj(xx,cy-34,34),proj(xx,cy+34,34),proj(xx,cy+34,78),proj(xx,cy-34,78)];}
  function pathQ(Q){ctx.beginPath();ctx.moveTo(Q[0].x,Q[0].y);ctx.lineTo(Q[1].x,Q[1].y);
    ctx.lineTo(Q[2].x,Q[2].y);ctx.lineTo(Q[3].x,Q[3].y);ctx.closePath();}
  var F=bq(xf),Bk=bq(xb2);
  pathQ(Bk);ctx.fillStyle='rgba(198,220,240,.09)';ctx.fill();       /* back pane */
  ctx.strokeStyle='rgba(232,242,255,.4)';ctx.lineWidth=1.5*bs;ctx.stroke();
  ctx.beginPath();ctx.moveTo(F[3].x,F[3].y);ctx.lineTo(F[2].x,F[2].y);  /* top edge */
  ctx.lineTo(Bk[2].x,Bk[2].y);ctx.lineTo(Bk[3].x,Bk[3].y);ctx.closePath();
  ctx.fillStyle='rgba(224,238,252,.32)';ctx.fill();
  pathQ(F);ctx.fillStyle='rgba(198,220,240,.12)';ctx.fill();        /* front pane */
  var sheen=ctx.createLinearGradient(F[0].x,F[0].y,F[2].x,F[2].y);
  sheen.addColorStop(0,'rgba(255,255,255,.16)');sheen.addColorStop(.5,'rgba(255,255,255,.02)');sheen.addColorStop(1,'rgba('+col+',.10)');
  ctx.fillStyle=sheen;ctx.fill();
  ctx.strokeStyle='rgba(232,242,255,.9)';ctx.lineWidth=3*bs;ctx.lineJoin='round';ctx.stroke();
  /* bottom edge padding — the safety pad every pro board wears, in team color.
     Butt caps + a back pass: a slab end, never a tapering point. */
  ctx.lineCap='butt';
  var eb1=proj(xb2,cy-33,33),eb2=proj(xb2,cy+33,33);
  ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=6*bs;
  ctx.beginPath();ctx.moveTo(eb1.x,eb1.y);ctx.lineTo(eb2.x,eb2.y);ctx.stroke();
  var e1=proj(xf,cy-33,33),e2=proj(xf,cy+33,33);
  ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=7*bs;
  ctx.beginPath();ctx.moveTo(e1.x,e1.y);ctx.lineTo(e2.x,e2.y);ctx.stroke();
  ctx.strokeStyle='rgb('+col+')';ctx.lineWidth=5.2*bs;
  ctx.beginPath();ctx.moveTo(e1.x,e1.y);ctx.lineTo(e2.x,e2.y);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1.4*bs;
  ctx.beginPath();ctx.moveTo(e1.x,e1.y-1.6*bs);ctx.lineTo(e2.x,e2.y-1.6*bs);ctx.stroke();
  ctx.lineCap='round';
  /* shooter's square in the owner's color, on the court-facing pane */
  var s1=proj(xf,cy-11,40),s2=proj(xf,cy+11,40),s3=proj(xf,cy+11,58),s4=proj(xf,cy-11,58);
  ctx.strokeStyle='rgba('+col+',.95)';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(s1.x,s1.y);ctx.lineTo(s2.x,s2.y);ctx.lineTo(s3.x,s3.y);ctx.lineTo(s4.x,s4.y);ctx.closePath();ctx.stroke();
  /* ---- rim + net v2: bracket, a rim with depth, a woven net that sways ----
     The old rim was one 3px ellipse and six straight strings — it read as a
     wire circle. Order matters for depth: bracket, BACK arc, net, FRONT arc. */
  var rs=Math.max(.45,pb.s), dirR=(rx>bx?1:-1);
  /* mounting bracket: board -> back of rim, steel with a highlight */
  var m0=proj(bx,cy,46),m1=proj(rx-dirR*10,cy,RIM_H+1);
  ctx.strokeStyle='#3c3c44';ctx.lineWidth=4*rs;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(m0.x,m0.y);ctx.lineTo(m1.x,m1.y);ctx.stroke();
  ctx.strokeStyle='rgba(210,215,230,.5)';ctx.lineWidth=1.4*rs;
  ctx.beginPath();ctx.moveTo(m0.x,m0.y);ctx.lineTo(m1.x,m1.y);ctx.stroke();
  /* rim ring, sampled once */
  var RP=[];for(var i=0;i<=28;i++){var a=i/28*2*Math.PI;
    RP.push(proj(rx+Math.cos(a)*11,cy+Math.sin(a)*11,RIM_H));}
  var rimCY=0;for(var i2=0;i2<28;i2++)rimCY+=RP[i2].y/28;
  /* back half first (darker, thinner) */
  ctx.lineCap='round';
  ctx.strokeStyle='#b8591b';ctx.lineWidth=3*rs;
  ctx.beginPath();var pen=false;
  for(var i3=0;i3<=28;i3++){var P=RP[i3];
    if(P.y<=rimCY){pen?ctx.lineTo(P.x,P.y):ctx.moveTo(P.x,P.y);pen=true;}else pen=false;}
  ctx.stroke();
  /* the net: two lower rings + a diamond weave, breathing a little */
  var sway=Math.sin(now2*1.6+rx*0.13)*1.1;
  function netPt(ang,rr,hh,k){
    return proj(rx+Math.cos(ang)*rr+sway*k*0.4,cy+Math.sin(ang)*rr,hh);
  }
  var NA=10;
  ctx.strokeStyle='rgba(255,255,255,.62)';ctx.lineWidth=1.25*rs;
  for(var n=0;n<NA;n++){
    var a0=n/NA*2*Math.PI,aHalf=(n+0.5)/NA*2*Math.PI,aPrev=(n-0.5)/NA*2*Math.PI;
    var top=netPt(a0,10.2,RIM_H,0),
        wA=netPt(aHalf,6.8,RIM_H-13,1),wB=netPt(aPrev,6.8,RIM_H-13,1),
        bot=netPt(a0,4.6,RIM_H-23,1.6);
    ctx.beginPath();ctx.moveTo(top.x,top.y);
    ctx.quadraticCurveTo((top.x+wA.x)/2+1.2*rs,(top.y+wA.y)/2,wA.x,wA.y);
    ctx.lineTo(bot.x,bot.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(top.x,top.y);
    ctx.quadraticCurveTo((top.x+wB.x)/2-1.2*rs,(top.y+wB.y)/2,wB.x,wB.y);
    ctx.lineTo(bot.x,bot.y);ctx.stroke();
  }
  /* waist + bottom rings tie the weave together */
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.1*rs;
  [[6.8,RIM_H-13,1],[4.6,RIM_H-23,1.6]].forEach(function(rg){
    ctx.beginPath();
    for(var q=0;q<=20;q++){var aq=q/20*2*Math.PI;
      var Pq=netPt(aq,rg[0],rg[1],rg[2]);
      q?ctx.lineTo(Pq.x,Pq.y):ctx.moveTo(Pq.x,Pq.y);}
    ctx.stroke();
  });
  /* FRONT arc over the net: bright, thick, with a specular kiss */
  ctx.strokeStyle='#ff8f38';ctx.lineWidth=4.4*rs;
  ctx.beginPath();pen=false;
  for(var i4=0;i4<=28;i4++){var P2=RP[i4];
    if(P2.y>=rimCY){pen?ctx.lineTo(P2.x,P2.y):ctx.moveTo(P2.x,P2.y);pen=true;}else pen=false;}
  ctx.stroke();
  ctx.strokeStyle='rgba(255,236,204,.85)';ctx.lineWidth=1.5*rs;
  ctx.beginPath();pen=false;
  for(var i5=0;i5<=28;i5++){var P3=RP[i5];
    if(P3.y>=rimCY){pen?ctx.lineTo(P3.x,P3.y-1.6*rs):ctx.moveTo(P3.x,P3.y-1.6*rs);pen=true;}else pen=false;}
  ctx.stroke();
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
/* the zoom escape hatch: whenever the camera leaves 1×, a visible way back */
g('viewReset').addEventListener('click',function(){
  ZOOM=1;pinch=null;drag=null;fitDirty=true;
  if(window.BKAudio)BKAudio.sfx('click');
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
      if(legalMove(sel,rangeOf(sel),o.tile[0],o.tile[1])){stageAction({kind:'move',tile:o.tile});return}
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
      if(legalMove(s2,rangeOf(s2),o.tile[0],o.tile[1])){stageAction({kind:'move',tile:o.tile});return}
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
      if(legalMove(sp,rangeOf(sp),o.tile[0],o.tile[1])){
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
function teamCol(t){return TEAM[t].p}
function teamInk(t){return cwTextSafe(TEAM[t].p)}
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
    (stagedViolation(a)?'<div class="swarn">⚠ Backcourt — turnover if you do it!</div>':'')+
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
  var dk=(state.phase==='def-slide')?'slidemove':(state.staged.kind==='pass'?'pass':'move');
  if(!drillAllow(dk))return;   /* stage survives — Cancel still works */
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
  if(!drillAllow('steal'))return;
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
    var canSteal=sel.team!==hold.team&&onCourt(hold.c,hold.r)&&   /* no ripping the inbounder */
      Math.max(Math.abs(sel.c-hold.c),Math.abs(sel.r-hold.r))<=1;
    stagebox((canSteal?'<button class="bigbtn" id="aSteal">'+ICO('hand')+' Go for the steal</button>':'')+
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
      stagebox('<button class="bigbtn shoot" id="aShoot">'+ICO('ball')+' SHOOT · '+z.label+'</button>');
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
      /* ONE-ON-ONE house rule: a lane gated by two men at once is closed.
         Refused, not duelled — beat them one at a time. */
      if(setupCfg.spacing==='chain'&&driveChallenge.count>=2){
        banner('<b>One-on-one floor:</b> two defenders gate that lane — take them on one at a time.');
        return;
      }
      pending={type:'cross',tile:tile,land:crossLanding(i,tile),mover:i,def:def};
      var dist=Math.max(Math.abs(tile[0]-sel.c),Math.abs(tile[1]-sel.r));
      var deep=dist>=3;
      var ct=Math.min(3,{PG:1,SG:2,SF:2,PF:3,C:3}[sel.pos]+(deep?1:0));
      /* PAY THE TOLL: corner coverage charges less — a crossover forced by a
         defender DIAGONAL to the handler is one tier easier (22af F1). */
      var dpc=state.pieces[def];
      var toll=setupCfg.spacing==='toll'&&dpc.c!==sel.c&&dpc.r!==sel.r;
      if(toll)ct=Math.max(1,ct-1);
      showCard(ct,deep?'DEEP CROSSOVER':'CROSSOVER','Beat your defender',
        toll?'Corner coverage — the toll is a tier lighter'
            :sel.pos==='C'?'Big-man handles… good luck':(deep?'Carrying it far costs more':'Shake him'));
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
    var passer=state.ball.holder;
    state.phase='anim2';
    flyBall(f,t,26,26,d<=3?40:70,d<=3?0.5:0.6,function(){
      state.ball.holder=toIdx;
      inbStepIn(passer,function(){
        afterOffenseAction((from.short||'')+
          (d<=3?' swings it to ':' whips it cross-court to ')+(to.short||to.pos)+
          (d>3?' — wide open!':'.'));
      });
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
  callout('OVER &amp; BACK!<small>turnover — '+teamName(1-state.offense)+' ball</small>',teamInk(1-state.offense));
  if(window.BKAudio)BKAudio.sfx('buzzer');
  var side=state.offense===0?'L':'R';
  var car=state.pieces[state.ball.holder];
  inbound(1-state.offense,side,'<b>OVER AND BACK!</b> Backcourt violation — turnover.',[car.c,car.r]);
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
    if(!onCourt(p.c,p.r))return;   /* an inbounder in the OOB strip isn't camping */
    if(inPaint(p.c,p.r,rim)){       /* the drawn key, not a hidden circle */
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
    callout('3 IN THE KEY!<small>'+(vp.short||vp.pos)+' camped — turnover</small>',teamInk(1-state.offense));
    if(window.BKAudio)BKAudio.sfx('whistle');
    state.selected=null;state.staged=null;
    var vside=state.offense===0?'R':'L';
    inbound(1-state.offense,vside,'<b>THREE IN THE KEY!</b> '+(vp.short||vp.pos)+
      ' camped the paint — turnover.',[vp.c,vp.r]);
    return;
  }
  if(pc&&pc.warn!=null){
    var wp=state.pieces[pc.warn];
    msg+=' ⚠ '+(wp.short||wp.pos)+' is camping the key (2 of 3)!';
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
var qTimer=null,qTick=null;
/* THE LEAGUE GATE (tightened 07-28 — Aaron picked NBA and got streetball and
   college cards: "this def should not be happening").
   The old gate deliberately widened every league into its neighbours so the
   pools would feel bigger. The cost was that the league you PICKED stopped
   meaning anything. It means something now: your league, plus the
   league-neutral pool ('any' — origins, rules, the sport itself), and nothing
   else. The bank carries it comfortably: every playable league clears 240
   cards with 'any' included, and NBA clears 700.
   college / fives / street are NOT selectable leagues (they're the locked
   "in the lab" cards), so those questions now wait for the leagues that will
   own them instead of leaking into everybody else's game. */
function leagueOk(q){
  var l=q.l||'any',lg=(state&&state.league)?state.league:null;
  if(l==='any')return true;      /* the sport itself belongs to every league */
  if(!lg)return false;           /* no league set: league-neutral cards only */
  if(l===lg)return true;
  /* QUESTION PACKS (07-28): opt-in extra sources chosen at league select. They
     only ever ADD — your own league is never removable — so a pack can't thin a
     tier or make a room unfair, and an empty set is exactly the strict gate. */
  var pk=state&&state.packs;
  return !!(pk&&pk.length&&pk.indexOf(l)>=0);
}
/* THE ERA GATE (22q — Aaron's BECAME-TRUE ruling, 07-29).
   A question carries e:[decades] = when its ANSWER became true, never the named
   player's whole span. So Jordan's sixth ring is a '90s card that will NOT
   surface in a 2000s game, while Jordan himself still deals into every decade
   he played (rule A for players — "it would be crazy to be doing the 2020s and
   be unable to get LeBron").
   AND across the axes with leagueOk, OR within this one: a card tagged
   ["1990s","2000s"] rides if EITHER decade is selected. Untagged = evergreen or
   not yet dated = ALWAYS eligible, exactly like l:"any", so the 251 cards still
   awaiting a lookup are safe rather than silently dropped. */
var DEC_FULL={'50s':'1950s','60s':'1960s','70s':'1970s','80s':'1980s',
              '90s':'1990s','00s':'2000s','10s':'2010s','20s':'2020s'};
function decadesFull(sel){
  if(!sel||!sel.length||sel.indexOf('FULL')>=0)return null;   /* All-Time: no era gate */
  var out=[];
  for(var i=0;i<sel.length;i++){
    var f=DEC_FULL[sel[i]]||sel[i];
    if(out.indexOf(f)<0)out.push(f);
  }
  return out.length?out:null;
}
function eraOk(q){
  var sel=decadesFull(state&&state.eras);
  if(!sel)return true;
  if(!q.e||!q.e.length)return true;
  for(var i=0;i<q.e.length;i++)if(sel.indexOf(q.e[i])>=0)return true;
  return false;
}
/* how many cards a given source holds — counted from the live bank, never
   hardcoded, so the picker's number stays true as the bank grows */
var Q_COUNT=null;
function qCount(l){
  if(!Q_COUNT){
    Q_COUNT={};
    for(var i=0;i<QUESTIONS.length;i++){
      var k=QUESTIONS[i].l||'any';Q_COUNT[k]=(Q_COUNT[k]||0)+1;
    }
  }
  return Q_COUNT[l]||0;
}
/* the pile you'd face: your league + the sport itself + whatever packs are on,
   NARROWED BY THE ERAS YOU PICKED. Aaron: the counting numbers "really do a lot
   for the game" but "Era has to mean something!" — both, by making the LED the
   instrument that SHOWS era meaning something. Counted over the live bank rather
   than summed from per-league tallies, because the era term cannot be
   pre-aggregated. Memoised per (league|packs|eras) so the picker stays snappy. */
var POOL_MEMO={};
function packTotal(lg,packs,eras){
  var decs=decadesFull(eras||(state&&state.eras));
  var key=lg+'|'+((packs||[]).slice().sort().join(','))+'|'+(decs?decs.slice().sort().join(','):'ALL');
  if(POOL_MEMO[key]!==undefined)return POOL_MEMO[key];
  var srcs={any:1};srcs[lg]=1;
  (packs||[]).forEach(function(p){srcs[p]=1});
  var n=0;
  for(var i=0;i<QUESTIONS.length;i++){
    var q=QUESTIONS[i];
    if(!srcs[q.l||'any'])continue;
    if(decs&&q.e&&q.e.length){
      var hit=false;
      for(var j=0;j<q.e.length;j++)if(decs.indexOf(q.e[j])>=0){hit=true;break}
      if(!hit)continue;
    }
    n++;
  }
  POOL_MEMO[key]=n;
  return n;
}
/* THE 3x ROSTER WEIGHTING (22s — spec'd 07-29, written into the data the same
   day, and until now never read by the engine at all).
   A card tagged with a player ON YOUR TEAM is drawn three times as often. It
   NEVER filters: an unweighted card stays just as reachable, and the setup
   screen's pool counter (packTotal) is untouched, so the number you were shown
   remains true. Weighting changes the odds, never the pool.
   Which roster biases the draw: the team currently on offense, because that is
   who the question is being asked of. Before offense is set — the opening
   toss-up, where both players race the buzzer — both squads count.
   Executable ruling + invariants: tools/gate-spec.mjs. */
function rosterPids(){
  var out=[];
  if(!state||!state.pieces)return out;
  /* the team on offense is the one being asked, so their five bias the draw.
     Before offense is set — the opening toss-up, where both players race the
     buzzer — every piece on the floor counts. */
  var t=(typeof state.offense==='number')?state.offense:null;
  for(var i=0;i<state.pieces.length;i++){
    var pc=state.pieces[i];
    if(t!==null&&pc.team!==t)continue;
    if(pc.pid&&out.indexOf(pc.pid)<0)out.push(pc.pid);
  }
  return out;
}
function qWeight(q,pids){
  if(!pids.length||!q.p||!q.p.length)return 1;
  for(var i=0;i<q.p.length;i++)if(pids.indexOf(q.p[i])>=0)return 3;
  return 1;
}
/* ===== THE VERIFIED-PACK GATE (V0 build item, mechanism 08-02) ============
   Ships OFF. When ON, packs serve only cards that can inherit verification —
   a card whose src does not resolve to a fact row (R1) or whose volatile fact
   is overdue (R6) is excluded. The exclusion list is unverified-index.js,
   built by tools/build-verified-index.py from the same todo table The Tape
   shows; a missing file gates nothing. DO NOT flip verifiedOnly until that
   script's report says the pool survives (PACKGATE, not the online access
   GATE — that name was already taken and the collision cost a debug cycle):
   measured 08-02, flipping today
   zeroes the NBA and WNBA pools outright (835 of 1,526 cards excluded, all
   R1) — the gate waits for R1's relink work, by design. */
var PACKGATE={verifiedOnly:false};   /* NOT the online access GATE below — packs only */
var UNVERIFIED=(typeof BK_UNVERIFIED!=='undefined')?BK_UNVERIFIED:{};
function gateOk(q){return !PACKGATE.verifiedOnly||!UNVERIFIED[q.q]}
function pickQuestionIdx(tier,noFilter){
  var pool=[],pids=rosterPids();
  for(var i=0;i<QUESTIONS.length;i++)
    if(QUESTIONS[i].t===tier&&gateOk(QUESTIONS[i])&&(noFilter||(leagueOk(QUESTIONS[i])&&eraOk(QUESTIONS[i])))&&usedQ[tier].indexOf(i)<0)
      for(var w=qWeight(QUESTIONS[i],pids);w>0;w--)pool.push(i);
  if(!pool.length){
    usedQ[tier]=[];
    /* the recycle pass weights too — otherwise the bias silently switches off
       the moment a tier wraps around, which is exactly the kind of quiet
       inconsistency that hides for weeks */
    for(var j=0;j<QUESTIONS.length;j++)
      if(QUESTIONS[j].t===tier&&gateOk(QUESTIONS[j])&&(noFilter||(leagueOk(QUESTIONS[j])&&eraOk(QUESTIONS[j]))))
        for(var wj=qWeight(QUESTIONS[j],pids);wj>0;wj--)pool.push(j);
    /* last resort: never re-open the whole bank (that would leak every league
       back in the moment one tier ran thin) — fall back to the league-neutral
       pool at any tier, and only then to card 0.
       The era gate is honoured here FIRST (07-29): a thin tier must not become
       the hole an out-of-era card climbs through. Only if even the evergreen
       'any' pool is empty for this era do we drop the era check. */
    if(!pool.length){
      for(var k=0;k<QUESTIONS.length;k++)
        if(gateOk(QUESTIONS[k])&&(QUESTIONS[k].l||'any')==='any'&&eraOk(QUESTIONS[k]))pool.push(k);
      if(!pool.length)
        for(var k2=0;k2<QUESTIONS.length;k2++)
          if(gateOk(QUESTIONS[k2])&&(QUESTIONS[k2].l||'any')==='any')pool.push(k2);
      /* card 0 is the final fallback and the ONE crack in the gate: if the
         gate ever empties even the 'any' pool, we serve card 0 rather than
         crash. The build script's thin-pool report exists so we never get
         here with the gate on. */
      if(!pool.length)return 0;
    }
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
  if(DRILL.on)return 0;      /* coach's cards are layups */
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
/* SPACING picker on the house-rules screen. Room-level by design — see the
   comment on setupCfg.spacing. Both states are NAMED rather than on/off so the
   playtest is not biased by branding today's game as the broken one. */
setTimeout(function(){          /* deferred: setupCfg is declared FURTHER DOWN the
   file, so running this inline read `undefined.spacing` and killed the whole
   script. var-hoisting gives you the name, never the value. */
  var box=g('spModes');if(!box)return;
  function paint(){
    box.querySelectorAll('.klmode').forEach(function(b){
      b.classList.toggle('sel',b.dataset.sp===setupCfg.spacing);
    });
  }
  box.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.klmode');if(!b)return;
    setupCfg.spacing=b.dataset.sp;paint();
    if(window.BKAudio)BKAudio.sfx('select');
  });
  paint();
  window.BK&&(window.BK._paintSpacing=paint);
},0);
function houseRules(){
  return {league:setupCfg.league,decade:setupCfg.decade,target:setupCfg.target,
          packs:(setupCfg.packs||[]).slice(),spacing:setupCfg.spacing,
          bracketMode:setupCfg.bracketMode,brackets:setupCfg.brackets.slice(),
          court:setupCfg.court||'classic-a'};
}
function eraLabel(dec){
  if(!dec||!dec.length||dec.indexOf('FULL')>=0)return 'All-Time';
  return dec.join(' · ');
}
function applyHouse(h){
  if(!h)return;
  setupCfg.league=h.league;setupCfg.decade=h.decade;setupCfg.target=h.target;
  setupCfg.packs=(h.packs||[]).slice();
  setupCfg.bracketMode=h.bracketMode||'same';
  if(h.brackets)setupCfg.brackets=h.brackets.slice();
  if(h.court)setupCfg.court=h.court;
  if(h.spacing)setupCfg.spacing=h.spacing;   /* the room's rule wins */
}
function showHouse(h){
  applyHouse(h);
  g('hsWho').textContent=teamName(0)+'\u2019s room';
  g('hsRole').textContent='You\u2019ll be '+teamName(1);
  var lg=(MODES[h.league]||{}).label||String(h.league||'').toUpperCase();
  var len=h.target==='Q'?'4 quarters':('First to '+h.target);
  var hc=h.bracketMode==='handicap';
  var lvl=hc?'Handicap':(BRACKETS[h.brackets&&h.brackets[0]]||BRACKETS.baller).lbl;
  var lvlSub=hc?'You pick your own level before tip-off'
               :(BRACKETS[h.brackets&&h.brackets[0]]||BRACKETS.baller).blurb;
  var SP_LBL={open:['Open floor','defenders only guard straight-on'],
    locked:['Locked up','defenders guard every direction'],
    toll:['Pay the toll','every direction guarded — diagonal crossovers a tier easier'],
    chain:['One-on-one','every direction guarded — no lane gated by two men at once']};
  var spl=SP_LBL[h.spacing]||SP_LBL.open;
  var rows=[['League',lg,''],['Era',eraLabel(h.decade),''],['Game',len,''],
    ['Spacing',spl[0],spl[1]]];
  /* list the league's OWN pack alongside the extras: the sub-line counts the
     whole pile, so the row has to name the whole pile too (Aaron 07-28) */
  if(h.packs&&h.packs.length)
    rows.push(['Packs',[h.league].concat(h.packs).map(packName).join(' · '),
      packTotal(h.league,h.packs,h.decade).toLocaleString()+' cards in the pile']);
  rows=rows.concat([
            ['Knowledge',lvl,lvlSub],
            ['Court',courtName(h.court),'Toss-up loser gets the final say'],
            ['Opens with','The Toss-Up','One question decides the prize']]);
  /* a HOST only ever sees this screen when re-entering their own room after a
     drop — don't tell them it's Blue's */
  g('hsWho').textContent=NET.role===0?'Your room':teamName(0)+'\u2019s room';
  g('hsRole').textContent=NET.role===0?'You\u2019re '+teamName(0)+' \u00b7 confirm to re-enter'
                                      :'You\u2019ll be '+teamName(1);
  g('hsRows').innerHTML=rows.map(function(r){
    return '<div class="hs-row"><span class="k">'+r[0]+'</span><span class="v">'+r[1]+
      (r[2]?'<small>'+r[2]+'</small>':'')+'</span></div>';
  }).join('');
  var go=g('hsGo');go.disabled=false;go.textContent='I\u2019m in \u2192';  /* reshown after a rejoin */
  show('house');
}
g('hsGo').addEventListener('click',function(){
  this.disabled=true;this.textContent='Locking in\u2026';
  startNames('guest');   /* name first — housed fires once they're named */
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
/* ===== HEAT & ON FIRE — core (V0, built 08-02) =============================
   DESIGN.md §6, LOCKED by Aaron 08-02 on the 22af Run A evidence:
   abilities, never point multipliers · a miss drops ONE TIER, never wipes ·
   opponent's score breaks it · self-limiting. NBA Jam shape, verified.

   MODEL — every number here is a tuning knob, all in one place:
     bar = 0..HEAT_MAX, four segments of HEAT_SEG. A correct card pours
     1+tier (easy drips, hard pours; trailing team +1 — DESIGN's lever).
     A miss drops one segment. Full bar = ON FIRE: every card your team
     answers is ONE TIER EASIER and every piece moves ONE TILE FURTHER,
     until the burn ends — any made basket ends any live fire (yours ended
     your possession; theirs is the NBA Jam break), and losing the ball
     while lit puts it out (the "stop" in DESIGN §6).

   NETCODE: heat mutates ONLY in code both phones already run identically —
   showCard (the deal) and resolvePending (the verdict), which 'card' events
   mirror with the same 1800ms beat. Battles (sd/cbat) are HOST-stepped, so
   they are deliberately heat-neutral: hooking them would desync the guest.
   No new net messages exist for heat; the snapshot carries it for rejoins.

   PHASE 2, deliberately NOT built (DESIGN §6 keeps the spec): streak mode
   (shoot till you miss), the heat-check logo bomb, posterize draining the
   victim, pass/dunk window widening, flaming-ball art. */
var HEAT_MAX=12,HEAT_SEG=3;
var HEAT={deal:null};   /* {owner,tier} stashed at the deal, spent at the verdict */
function heatFireOn(t){return !!(state&&state.fire&&state.fire[t])}
function rangeOf(p){return p.range+(heatFireOn(p.team)?1:0)}
/* the ability payout at the deal: a lit team's card is one tier easier */
function heatDealTier(tier,owner){return heatFireOn(owner)&&tier>0?tier-1:tier}
function heatHud(){
  if(!state||!state.heat)return;
  [0,1].forEach(function(t){
    var rack=g(t?'heatB':'heatA');if(!rack)return;
    var pct=Math.min(100,Math.round(state.heat[t]/HEAT_MAX*100));
    var lit=heatFireOn(t);
    rack.firstElementChild.style.width=(lit?100:pct)+'%';
    /* more on fire each quarter it fills — Aaron's spec, verbatim */
    var stage=lit?'lit':pct>=100?'h4':pct>=75?'h3':pct>=50?'h2':pct>=25?'h1':'';
    rack.className='heatrack'+(stage?' '+stage:'');
  });
}
/* THE SLAM — a bang, not a sentence (Aaron 08-02: "what we need is a bang
   ON FIRE slam onto the screen"). Restarts its own animations per firing. */
function fireSlam(t){
  var fs=g('fireslam');if(!fs)return;
  g('fsTeam').textContent=teamName(t);
  fs.classList.remove('on','out');void fs.offsetWidth;   /* restart keyframes */
  fs.classList.add('on');
  var cw=g('court-wrap');
  if(cw){cw.classList.remove('quake');void cw.offsetWidth;cw.classList.add('quake')}
  fTimeout(function(){fs.classList.add('out');
    fTimeout(function(){fs.classList.remove('on','out')},380)},1900);
}
function heatIgnite(t){
  state.fire[t]=1;
  fireSlam(t);
  if(window.BKAudio)BKAudio.sfx('buzzer');
  heatHud();
  /* the slam carries NO copy — the Coach explains it once, then never again
     (Aaron 08-02). After that it lives in the rulebook. Fires after the stamp
     has had its moment. */
  if(window.BKCoach&&BKCoach.tip)fTimeout(function(){
    BKCoach.tip('fire','<b>You caught fire.</b> Three cards won in a row lights '+
      'you up: every question your squad answers drops a tier, and every player '+
      'moves one tile further. It burns until someone scores or takes the ball '+
      'off you.',true);
  },2100);
}
function heatDouse(t,why){
  if(!heatFireOn(t))return;
  state.fire[t]=0;state.heat[t]=0;
  banner('<b>The fire is out.</b> '+why);
  heatHud();
}
/* the verdict: called from resolvePending for every mirrored (non-battle) card */
function heatCard(correct){
  var d=HEAT.deal;HEAT.deal=null;
  if(!d||!state||!state.heat)return;
  if(typeof DRILL!=='undefined'&&DRILL.on)return;   /* practice never heats */
  var t=d.owner;
  if(correct){
    if(heatFireOn(t))return;                        /* lit = the bar is spent */
    var gain=1+d.tier+((state.score[t]<state.score[1-t])?1:0); /* trailing lever */
    state.heat[t]=Math.min(HEAT_MAX,state.heat[t]+gain);
    if(state.heat[t]>=HEAT_MAX)heatIgnite(t);
  }else{
    state.heat[t]=Math.max(0,state.heat[t]-HEAT_SEG); /* one segment, never a wipe */
  }
  heatHud();
}
/* any made basket ends any live fire: the scorer's burn completed its
   possession; the conceder's burn is broken by the opponent score (NBA Jam) */
function heatScore(scorer){
  heatDouse(scorer,teamName(scorer)+' cashed it in.');
  heatDouse(1-scorer,teamName(scorer)+' answered back — the opponent bucket breaks it.');
}
/* losing the ball while lit = the stop that puts it out (DESIGN §6) */
function heatOffenseChange(newTeam){
  if(!state||!state.fire)return;
  var was=state.offense;
  if(was!==newTeam&&heatFireOn(was))heatDouse(was,teamName(newTeam)+' got the stop.');
}
function showCard(tier,stakeLabel,stakeText,subText,defense){
  state.phase='shooting';
  stagebox('');clearFocus();
  var owner=defense?1-state.offense:state.offense;
  /* HEAT: while lit, every card your team answers is one tier easier — the
     ability payout (never points). Stash the deal; resolvePending spends it. */
  var ht=heatDealTier(tier,owner);
  if(ht<tier)stakeLabel='🔥 '+stakeLabel;
  tier=ht;
  HEAT.deal={owner:owner,tier:tier};
  tier=shiftTier(tier,owner);        /* the answerer's bracket bends their own cards */
  if(NET.on&&owner!==NET.role){
    /* their card — you just get to sweat */
    banner('<b>'+teamName(owner)+'</b> is on the clock…');
    stagebox('<div class="stitle">'+ICO('card')+' '+teamName(owner)+' answering a '+
      tierName(tier).toUpperCase()+' card…</div>',true);
    return;
  }
  if(CPU.on&&owner===CPU.team){
    /* the machine takes its card off-screen — you just watch the verdict */
    banner('<b>'+teamName(owner)+' (CPU)</b> is on the clock…');
    stagebox('<div class="stitle">'+ICO('robot')+' CPU answering a '+
      tierName(tier).toUpperCase()+' card…</div>',true);
    var ok=cpuRollCard(tier);
    CPU.busy=true;
    fTimeout(function(){
      CPU.busy=false;stagebox('');
      callout(ok?'CPU NAILS IT<small>right answer</small>':'CPU BRICKS THE CARD<small>wrong answer</small>',teamInk(owner));
      resolvePending(ok);
    },900+cpuRnd(cpuLvl().think));
    return;
  }
  var q=pickQuestion(tier);
  window.BK&&(window.BK._q=q);
  var tn=tierName(tier);
  g('qcat').innerHTML=(defense?ICO('shield')+' DEFENSE · ':'')+q.cat;
  g('qtier').textContent=tn+' · '+stakeLabel;
  g('qtier').style.background=defense?teamCol(state?1-state.offense:1):tierCol(tier);
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
    b.dataset.ok=(oi===q.a)?'1':'0';   /* marked at BIRTH — the reveal must
                                          never re-derive this from text */
    b.addEventListener('click',function(){answer(oi===q.a,b,q)});
    ansEl.appendChild(b);
  });
  var tfill=g('qtimer');tfill.style.transition='none';tfill.style.width='100%';
  g('qveil').classList.add('on');
  g('cardfront').onclick=function(){
    if(wrap.classList.contains('flipped'))return;   /* one flip: a double tap used to
                                                       orphan a live 15s timer that then
                                                       auto-missed a LATER play */
    wrap.classList.add('flipped');
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      if(gameFrozen())return;      /* held card: qClockThaw starts the bar */
      tfill.style.transition='width 15s linear';tfill.style.width='0%';
    })});
    /* fTimeout, not setTimeout: a coach card can land on top of a live question
       and the deadline has to HOLD, not run out and answer it wrong for you */
    qTimer=fTimeout(function(){answer(false,null,q)},15000);
    /* the LED readout — freezing up IS a wrong answer, so say it loud */
    var qc=g('qClock');
    qc.textContent=':15';qc.classList.remove('hot');
    if(qTick)clearInterval(qTick);
    qTick=setInterval(function(){
      var r=Math.max(0,Math.ceil(fLeft(qTimer)/1000));
      qc.textContent=':'+(r<10?'0':'')+r;
      qc.classList.toggle('hot',r<=5);
      if(r<=0){clearInterval(qTick);qTick=null;}
    },200);
  };
}
function doShoot(){
  if(!drillAllow('shoot'))return;
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
  if(qTimer){fClear(qTimer);qTimer=null}
  if(qTick){clearInterval(qTick);qTick=null}
  netEv({a:'card',correct:!!correct});
  var els=document.querySelectorAll('.ans');
  els.forEach(function(e){e.disabled=true;
    /* dataset, not text comparison — twin choice strings used to mislight */
    if(e.dataset.ok==='1')e.classList.add('correct')});
  if(btn&&!correct)btn.classList.add('wrong');
  var res=g('qresult');
  var t=pending?pending.type:'shot';
  var GOOD={shot:'BUCKET INCOMING',pass:'THREADED',contest:'REJECTED!',cross:'HE BIT!',crossdef:'WALLED OFF',crosssteal:'PICKED CLEAN',stealtry:'HANDS HOT',stealdef:'ROCK PROTECTED'};
  var BAD={shot:'BRICK',pass:'SAILS AWAY',contest:'TOO SLOW — IT COUNTS',cross:'HE STUMBLES…',crossdef:'ANKLES GONE',crosssteal:'HANDS TOO SLOW',stealtry:'ALL REACH',stealdef:'RIPPED AWAY'};
  if(correct){res.textContent=GOOD[t];res.className='result good'}
  else{res.textContent=btn?BAD[t]:'CLOCK — '+BAD[t];res.className='result bad'}
  fTimeout(function(){
    g('qveil').classList.remove('on');
    resolvePending(correct);
  },1800);   /* the right/wrong BEAT gets room to land — netApply 'card'
                mirrors this number; change BOTH or online desyncs */
}
function resolvePending(correct){
  var p=pending;pending=null;
  if(!p)return;
  /* HEAT verdict — mirrored cards only. Battles (sd/cbat) are host-stepped
     and stay heat-neutral by design (see the HEAT block); their stashed deal
     is discarded so it can't leak onto the next card. */
  if(p.type==='sd'||p.type==='cbat')HEAT.deal=null;
  else heatCard(correct);
  if(p.type==='sd'){
    sd.answers[p.team]=correct;
    sd.asked++;
    if(sd.asked<2){fTimeout(sdNext,400);return}
    var a0=sd.answers[0],a1=sd.answers[1];
    if(a0!==a1){endGameSD(a0?0:1);return}
    sd.round++;sd.asked=0;sd.answers=[null,null];
    callout(a0?'BOTH SURVIVE!<small>round '+sd.round+'</small>':'BOTH MISSED!<small>round '+sd.round+'</small>');
    banner('<b>Round '+sd.round+'.</b>'+(sd.round>=2?' The cards go HARD now.':'')+' Sudden death continues.');
    fTimeout(sdNext,1600);
    return;
  }
  if(p.type==='cbat'){
    if(!battle)return;
    /* ONLINE: the HOST alone steps the battle (netcode invariant #1) —
       the guest answers cards but waits for bstep/bwin to move */
    if(NET.on&&NET.role!==0)return;
    if(!correct){battleDecide(battle.asked===0?battle.closer:(1-battle.closer),'first miss');return}
    if(battle.asked===0){battleStep(battle.round,1);return}
    if(battle.round>=3){battleDecide(battle.closer,'edge');return}  /* 3 rounds survived — the edge settles it */
    battleStep(battle.round+1,0);
    return;
  }
  if(p.type==='shot'){
    if(!correct){resolveShot(false,p.z);return}
    var sp=p;
    /* UPSIDE-ONLY METER (Aaron, 07-27): the only thing that can erase a right
       answer is the opponent's right answer. Open look → straight splash, no
       meter. Contested look → the meter can only ADD: dead center denies the
       defender's block card; anything else and the contest plays out on cards.
       There is no shank — a right answer can never be reflexed into a miss. */
    if(sp.def<0){resolveShot(true,sp.z);return}
    startMeter({title:'RELEASE!',sub:'Tap at the top of the jump',cb:function(q){
      if(q==='perfect'){
        banner('<b>PERFECT RELEASE</b> — the block is denied, rises clean!');
        resolveShot(true,sp.z);return;
      }
      var defTeam=1-state.offense;
      pending={type:'contest',z:sp.z,defPos:state.pieces[sp.def].pos};
      banner('<b>CONTESTED!</b> '+teamName(defTeam)+' — block this shot.');
      showCard(sp.ctier,'BLOCK IT',teamName(defTeam)+' defends','',true);
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
      heatOffenseChange(d3.team);
      state.offense=d3.team;
      state.front=!MODE.half&&inFront(d3.team,d3.c,d3.r);
      state.selected=null;state.phase='off-select';
      callout('RIPPED!',teamInk(d3.team));
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
          callout('HELD ON!',teamInk(state.offense));
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
      heatOffenseChange(dd.team);
      state.offense=dd.team;
      state.front=!MODE.half&&inFront(dd.team,dd.c,dd.r);
      state.selected=null;state.phase='off-select';
      callout('PICKED CLEAN!',teamInk(dd.team));
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
            callout('ANKLES!<small>he breaks free</small>',teamInk(state.offense));
            executeMove(mv.mover,mv.land,'FINALLY shakes loose'+(slow?' — a step short!':' and drives!'));
          }else{
            callout('LOCKED UP!',teamInk(1-state.offense));
            afterOffenseAction((state.pieces[mv.mover].short||'')+' gets walled off — nowhere to go.');
          }
        }});
    }else{
      var slow2=mv.land[0]!==mv.tile[0]||mv.land[1]!==mv.tile[1];
      callout('CROSSED HIM!',teamInk(state.offense));
      executeMove(mv.mover,mv.land,'leaves him grasping'+(slow2?' — the cross costs a step!':' at air!'));
    }
    return;
  }
  /* pass */
  var from=state.pieces[state.ball.holder],to=state.pieces[p.toIdx];
  var f=tileCenter(from.c,from.r),t=tileCenter(to.c,to.r);
  function completePass(){
    recordPlay([{k:'ball',from:f,to:t}]);
    clearFocus();
    var passer=state.ball.holder;
    state.phase='anim2';
    flyBall(f,t,26,26,70,0.6,function(){
      state.ball.holder=p.toIdx;
      inbStepIn(passer,function(){
        afterOffenseAction(p.plabel+' finds '+(to.short||to.pos)+'!');
      });
    });
  }
  function sailPass(msg){
    callout('OUT OF BOUNDS!<small>turnover</small>');
    state.phase='anim2';
    var dx=t[0]-f[0],dy=t[1]-f[1],len=Math.hypot(dx,dy)||1;
    var ox=t[0]+dx/len*80,oy=t[1]+dy/len*80;
    flyBall(f,[ox,oy],26,10,70,0.7,function(){
      var side=t[0]>LW/2?'R':'L';
      inbound(1-state.offense,side,msg,[to.c,to.r]);   /* dead where it sailed */
    });
  }
  if(!correct){sailPass('<b>The '+p.plabel.toLowerCase()+' sails out of bounds!</b>');return}
  /* right answer = the pass connects, period (Aaron, 07-27) — the card WAS the
     risk. No delivery meter: passes have no contest interplay, so a meter there
     was pure downside on an already-earned read. */
  completePass();
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
      heatScore(state.offense);   /* any bucket ends any live fire, both rules */
      g('ptsA').textContent=state.score[0];hudPoss();
      g('ptsB').textContent=state.score[1];
      if(state.score[state.offense]>=state.target){endGame();return}
      if(state.score[0]===state.score[1]&&state.score[0]>=state.target-1){
        startSuddenDeath();return;
      }
      callout('SPLASH!<small>+'+z.pts+' '+teamName(state.offense)+'</small>',teamInk(state.offense));
      if(window.BKAudio)BKAudio.sfx('net');
      if(DRILL.on){state.phase='off-select';return}  /* drills freeze after the bucket */
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

/* ---------- release meter: upside only — touch can add, never take away ----------
   Fires ONLY on contested shots after a right answer. Dead center = the block
   card is DENIED; anywhere else (including never tapping) = the contest plays
   out on cards. The old shank zone is gone: reflexes cannot erase knowledge. */
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
    ms.innerHTML=ICO('robot')+' CPU is timing it…';ms.className='msub';
    g('meterveil').classList.add('on');
    fTimeout(function(){if(meter)meterResolve(cpuMeterPos())},700+Math.random()*500);
    return;
  }
  ms.innerHTML=ICO('hand')+' '+teamName(owner).toUpperCase()+' ONLY — tap to lock · dead center denies the block';
  ms.className='msub';
  g('meterveil').classList.add('on');
  /* no tap = no deny — the marker locks wherever the sweep stands. Never a shank. */
  meter.timeout=fTimeout(function(){meter&&!meter.done&&gradeMeter(meterPos())},3000);
}
function meterPos(){
  var e=(performance.now()-meter.t0)/meter.dur,k=e%2;
  return k<1?k:2-k;
}
function gradeMeter(pos){
  if(!meter||meter.done)return;
  meter.done=true;fClear(meter.timeout);
  netEv({a:'meter',pos:pos});
  meterResolve(pos);
}
function meterResolve(pos){
  if(!meter)return;
  meter.done=true;
  meter.el.style.left=(pos*100)+'%';
  var off=Math.abs(pos-0.5);
  var q=off<=0.07?'perfect':'good';
  var ms=g('msub');
  ms.textContent=q==='perfect'?'BUTTER — BLOCK DENIED':'NO DENY — THE CONTEST IS LIVE';
  ms.className='msub '+(q==='perfect'?'good':'');
  var cb=meter.cb;
  fTimeout(function(){
    g('meterveil').classList.remove('on');meter=null;cb(q);
  },650);
}
g('meterveil').addEventListener('pointerdown',function(){meter&&!meter.done&&gradeMeter(meterPos())});

/* ================= THE FREEZE ==============================================
   A modal Coach card says "COACH · GAME PAUSED" — so the game has to actually
   stop. Before this, only the :24 honored it, and everything else played on
   behind the card: the CPU took whole possessions, the 15-second answer clock
   ran out and marked you WRONG for reading the tutorial, the jump ball buzzed
   and answered itself. One flag now, read by every timed system.

   THE CONTRACT
   · Deadlines RESUME, never restart. An offline tip has no time limit (it
     waits for a tap), so restarting a clock would hand out free seconds and
     letting it run is the bug being fixed. Every fTimeout keeps the ms it had
     left; the shot clock's dt-decrement already worked this way.
   · NEVER freezes ONLINE. The coach card is deliberately non-modal there —
     stopping one phone would desync the room — and the arbitrated buzz
     windows and resume pollers must keep running.
   · NEVER freezes DRILLS. The drill poller is the only thing that advances a
     drill, so freezing it would deadlock the tutorial.
   · Rendering, audio and the canvas keep going; only the mutation sites hold.
   Both the Coach and the Pause menu route through it — two features that mean
   "the game is held" should not be two different half-implementations. */
var FRZ={on:false,at:0,pat:0,held:0,list:[]};
function gameFrozen(){return FRZ.on}
function fArm(t){t.at=Date.now();t.id=setTimeout(function(){t.id=null;fDrop(t);t.fn()},Math.max(0,t.left));}
function fDrop(t){var i=FRZ.list.indexOf(t);if(i>=0)FRZ.list.splice(i,1)}
function fTimeout(fn,ms){          /* a setTimeout that survives a pause */
  var t={fn:fn,left:ms,id:null,at:0};
  FRZ.list.push(t);
  if(!FRZ.on)fArm(t);              /* armed on thaw if we're already held */
  return t;
}
function fClear(t){if(!t)return;if(t.id)clearTimeout(t.id);fDrop(t);}
function fLeft(t){return !t?0:(FRZ.on?t.left:Math.max(0,t.left-(Date.now()-t.at)))}
function freezeGame(){
  if(FRZ.on||NET.on||DRILL.on)return;
  FRZ.on=true;FRZ.at=Date.now();FRZ.pat=performance.now();
  FRZ.list.forEach(function(t){
    if(!t.id)return;
    t.left=Math.max(0,t.left-(Date.now()-t.at));
    clearTimeout(t.id);t.id=null;
  });
  qClockFreeze();
}
function thawGame(){
  if(!FRZ.on)return;
  var heldP=performance.now()-FRZ.pat;
  FRZ.held+=Date.now()-FRZ.at;          /* the arena match clock must not lie */
  FRZ.on=false;
  if(meter&&!meter.done)meter.t0+=heldP; /* the sweep picks up where it stopped */
  FRZ.list.slice().forEach(function(t){if(!t.id)fArm(t)});
  qClockThaw();
}
function freezeReset(){                 /* leaving a game: drop every held deadline */
  FRZ.list.slice().forEach(fClear);
  FRZ.on=false;FRZ.held=0;
  if(window.BKCoach&&BKCoach.hide)BKCoach.hide();
}
/* the question card's deadline is half CSS, so it needs its own hold */
function qClockFreeze(){
  var tf=g('qtimer');if(!tf||!qTimer)return;
  var w=tf.getBoundingClientRect().width,
      pw=tf.parentElement?tf.parentElement.getBoundingClientRect().width:0;
  tf.style.transition='none';
  tf.style.width=(pw?(w/pw*100):0)+'%';
}
function qClockThaw(){
  var tf=g('qtimer');if(!tf||!qTimer)return;
  var left=fLeft(qTimer);if(left<=0)return;
  void tf.offsetWidth;
  tf.style.transition='width '+left+'ms linear';
  tf.style.width='0%';
}

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
  freezeReset();      /* never leave the app frozen, or holding a stale deadline */
  if(typeof qTimer!=='undefined'&&qTimer){fClear(qTimer);qTimer=null;}
  if(typeof qTick!=='undefined'&&qTick){clearInterval(qTick);qTick=null;}
  if(typeof meter!=='undefined'&&meter&&meter.timeout){fClear(meter.timeout);}
  if(state){state.staged=null;state.selected=null;}
  if(typeof clearFocus==='function')clearFocus();
  var ck=g('shotclock'); if(ck)ck.style.display='none';
  if(typeof hideJumbo==='function')hideJumbo();
  CPU.on=false;CPU.busy=false;          /* the machine clocks out with you */
  markGame&&markGame(false);
}
function clockTickable(){
  if(DRILL.on)return false;   /* drills never tick */
  if(gameFrozen())return false;   /* reading > racing (coach card / pause menu) */
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
    callout('24!<small>shot-clock violation — turnover</small>',teamInk(1-state.offense));
    if(window.BKAudio)BKAudio.sfx('buzzer');
    state.staged=null;state.selected=null;clearFocus();stagebox('');
    var side=state.offense===0?'R':'L';
    var shp=state.pieces[state.ball.holder];
    inbound(1-state.offense,side,'<b>SHOT CLOCK!</b> 24 seconds of nothing — turnover.',[shp.c,shp.r]);
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
    (NET.on?' · YOU ARE '+teamName(NET.role).toUpperCase():'')+cpuHudTag();
}
function newPossession(team){
  setTimeout(hudPoss,0);
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
    showJumbo(2600);   /* quarter-break beat on the big board */
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
  callout(teamName(team).toUpperCase()+' BOARD!',teamInk(team));
  state.ball.holder=pieceIdx;
  state.selected=null;
  clockStart('off');
  if(team===state.offense){
    state.phase='off-select';
    banner('<b>OFFENSIVE BOARD!</b> '+teamName(team)+' keeps the possession alive — go again.');
    actions('<span class="note">Second chance — tap a player</span>');
  }else{
    heatOffenseChange(team);
    state.offense=team;
    var gp=state.pieces[pieceIdx];
    state.front=!MODE.half&&inFront(team,gp.c,gp.r);
    state.phase='off-select';
    banner('<b>'+teamName(team)+' cleans the glass.</b> Live ball — go!');
    actions('<span class="note">'+teamName(team)+' — tap a player</span>');
  }
}
/* SUDDEN-DEATH CARD BATTLE — replaced the tap-off mash (Aaron + testers,
   07-27): the team WITHOUT the edge answers first, and the first wrong
   answer loses the battle outright. Both right = next round, cards one
   tier harder (capped legendary). Works everywhere the mash did: boards,
   ankle battles, rip-or-grip, at the rim. FUTURE (logged in §5/AL-2):
   player ratings bend these battles — order and tiers — once stats land. */
function startTapBattle(cfg){
  stagebox('');clearFocus();
  battle={closer:cfg.closer,onWin:cfg.onWin,round:1,asked:0,over:false,title:cfg.title};
  battleArm();     /* pending goes LIVE synchronously — a fast opponent answer
                      arriving over the wire can never outrun the deal timer */
  callout(cfg.title+'<small>sudden-death cards \u00b7 '+teamName(cfg.closer)+' has the edge</small>',teamInk(cfg.closer));
  if(window.BKAudio)BKAudio.sfx('buzzer');
  battleShowLater(1500);
}
function battleTeam(){return battle.asked===0?(1-battle.closer):battle.closer}
function battleArm(){pending={type:'cbat',team:battleTeam()};}
function battleShowLater(ms){
  var r=battle.round,a=battle.asked;
  fTimeout(function(){
    if(!battle||battle.over||battle.round!==r||battle.asked!==a)return;  /* already advanced */
    battleShowCard();
  },ms);
}
function battleShowCard(){
  var team=battleTeam();
  var tier=Math.min(4,1+battle.round);        /* r1 medium, r2 hard, r3+ legendary */
  showCard(tier,battle.title,'Round '+battle.round+' \u2014 first miss loses',
    battle.asked===0?teamName(team)+' answers first \u00b7 survive':teamName(team)+' \u2014 match it or lose it',
    team!==state.offense);
}
function battleStep(r,a){
  netEv({a:'bstep',r:r,ba:a});
  battleApplyStep(r,a);
}
function battleApplyStep(r,a){
  if(!battle)return;
  var newRound=r!==battle.round;
  battle.round=r;battle.asked=a;battleArm();
  if(newRound)callout('BOTH SURVIVE!<small>round '+r+' \u2014 the cards go harder</small>');
  battleShowLater(newRound?1500:700);
}
function battleDecide(w,why){
  netEv({a:'bwin',w:w,why:why});
  battleWin(w,why);
}
function battleWin(w,why){
  var f=battle&&battle.onWin;
  if(why==='edge'&&battle)callout('DEADLOCK!<small>'+teamName(w)+'\u2019s edge settles it</small>',teamInk(w));
  battle=null;stagebox('');
  if(f)fTimeout(function(){f(w)},900);
}
/* ===== desktop keyboard buzzers ============================================
   One mouse can't do a buzz-off. Squad ONE = A, Squad TWO = L, on the two
   races left in the game: the toss-up buzz and the jump-ball slap. (Boards,
   rip-or-grip, ankle battles and the rim all settle on sudden-death CARDS
   now — reflex only ever decides who answers first.) Never fires while
   typing, never drives the CPU's side, never drives the other phone's side
   online. */
document.addEventListener('keydown',function(e){
  if(e.repeat)return;
  if(gameFrozen())return;   /* a keypress must not reach through the veil and
                               spend a buzz the player can't even see */
  var tg=e.target&&e.target.tagName;
  if(tg==='INPUT'||tg==='TEXTAREA')return;
  var k=e.key.toLowerCase();
  var side=(k==='a'||k==='q')?0:((k==='l'||k==='p')?1:-1);
  if(side<0)return;
  if(CPU.on&&side===CPU.team)return;
  if(NET.on&&side!==NET.role)return;
  if(screens.tossup.classList.contains('on')&&g('tuBuzzes').style.display!=='none'){
    var bz=g('tuBuzzes').querySelector('.tu-buzz[data-side="'+side+'"]');
    if(bz&&!bz.disabled&&!bz.classList.contains('dim')){bz.click();e.preventDefault();}
    return;
  }
  if(g('tipveil').classList.contains('on')){
    var z=g(side===0?'tzA':'tzB');
    if(z&&!z.classList.contains('lock')){buzzEmit(side);e.preventDefault();}
    return;
  }
});

/* ---------- inbounding ---------- */
function onCourt(c,r){return c>=0&&r>=0&&c<COLS&&r<ROWS}
/* whistle reset: anyone still standing in the out-of-bounds strip (a sailed
   inbound pass, a quarter turn) snaps to the nearest open court tile */
function inbRestore(){
  if(!state)return;
  state.pieces.forEach(function(p){
    if(onCourt(p.c,p.r))return;
    var c=Math.max(0,Math.min(COLS-1,p.c)),r=Math.max(0,Math.min(ROWS-1,p.r));
    var cand=[[c,r],[c,r-1],[c,r+1],[c,r-2],[c,r+2],[c+(c===0?1:-1),r]];
    for(var i=0;i<cand.length;i++){
      if(onCourt(cand[i][0],cand[i][1])&&pieceAt(cand[i][0],cand[i][1])===-1){c=cand[i][0];r=cand[i][1];break}
    }
    p.c=c;p.r=r;delete p.anim;
  });
}
/* the inbounder stands OUT of bounds and steps in after the pass. Real spots:
   made bucket / board out = behind the baseline beside the stanchion;
   dead ball (violation / sailed pass) = just outside the line nearest where
   the ball died. Big3 half court keeps its on-floor check-up. */
function inbound(team,side,msg,deadTile){
  inbRestore();
  if(newPossession(team))return;
  heatOffenseChange(team);
  state.offense=team;
  state.selected=null;
  state.front=false;state.inbMoved=false;state.inbPending=true;
  var mid=Math.floor(ROWS/2);
  var pg=-1;
  state.pieces.forEach(function(p,i){if(p.team===team&&p.pos==='PG')pg=i});
  var spot=null,line='';
  if(MODE.half){
    var spots=[[0,mid],[0,mid-1],[0,mid+1],[1,mid]];
    for(var i=0;i<spots.length;i++){
      var occ=pieceAt(spots[i][0],spots[i][1]);
      if(occ===-1||occ===pg){spot=spots[i];break}
    }
    spot=spot||[0,3];line=' checks it up top.';
  }else if(deadTile){
    var dc=Math.max(0,Math.min(COLS-1,deadTile[0])),dr=Math.max(0,Math.min(ROWS-1,deadTile[1]));
    var edges=[[dc+1,'L',[-1,dr]],[COLS-dc,'R',[COLS,dr]],[dr+1,'T',[dc,-1]],[ROWS-dr,'B',[dc,ROWS]]];
    edges.sort(function(a,b){return a[0]-b[0]});
    spot=edges[0][2];
    var baseline=edges[0][1]==='L'||edges[0][1]==='R';
    /* a baseline spot at the middle rows would stand IN the rim — sidestep it */
    if(baseline&&Math.abs(spot[1]-mid)<=1)spot[1]=spot[1]<=mid?mid-2:mid+2;
    line=baseline?' takes it out on the baseline, where it died.':' takes it out on the sideline, where it died.';
  }else{
    spot=[side==='R'?COLS:-1,mid-2];
    line=' takes it out under the rim.';
  }
  state.ball.holder=pg;
  try{window.__inbDbg={spot:spot.slice(),dead:deadTile?[deadTile[0],deadTile[1]]:null}}catch(e){}
  var p=state.pieces[pg];
  var dist=Math.max(Math.abs(spot[0]-p.c),Math.abs(spot[1]-p.r));
  banner(msg+' <b>'+teamName(team)+line+'</b>');
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
/* after the inbound pass is away, the inbounder steps onto the floor */
function inbStepIn(idx,then){
  var p=state.pieces[idx];
  if(!p||onCourt(p.c,p.r)){then();return}
  var c=Math.max(0,Math.min(COLS-1,p.c)),r=Math.max(0,Math.min(ROWS-1,p.r));
  var cand=[[c,r],[c,r-1],[c,r+1],[c,r-2],[c,r+2],[c+(c===0?1:-1),r]];
  var t=null;
  for(var i=0;i<cand.length;i++){
    if(onCourt(cand[i][0],cand[i][1])&&pieceAt(cand[i][0],cand[i][1])===-1){t=cand[i];break}
  }
  if(!t){p.c=c;p.r=r;then();return}
  movePieceAnim(idx,t[0],t[1],0.3,then);
}

function endShow(winner,line){
  var wc=teamCol(winner),human=CPU.on?(1-CPU.team):-1;
  var ev=g('endveil');ev.style.setProperty('--wc',wc);
  g('endEy').textContent='Final · '+MODE.label+(CPU.on?' · vs CPU '+cpuLvl().name:'');
  var slamTxt=teamName(winner)+' wins!';
  if(CPU.on)slamTxt=(winner===human)?'You beat the machine!':'The machine got you';
  /* grad cap crowns the winner — but never the CPU */
  var cap=(CPU.on&&winner!==human)?'':'<img class="ev-cap" src="assets/brand/gradcap.png" alt="">';
  g('endSlam').innerHTML='<b>'+slamTxt+cap+'</b>';
  g('evNameA').textContent=teamName(0);g('evNameB').textContent=teamName(1);
  g('evNameA').style.color=cwTextSafe(TEAM[0].p);g('evNameB').style.color=cwTextSafe(TEAM[1].p);
  g('evPtsA').textContent=state.score[0];g('evPtsB').textContent=state.score[1];
  g('evPtsA').className='ev-num'+(winner===0?' win':'');
  g('evPtsB').className='ev-num'+(winner===1?' win':'');
  g('endLine').textContent=line;
  /* confetti in the winner's colors */
  var cf=g('endConfetti');cf.innerHTML='';
  if(!document.body.classList.contains('reduce-motion')){
    var cols=[wc,'#fff5e2',TEAM[winner].a];
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
  /* Sad Soul only plays when THIS phone lost. Vs CPU and online both know who
     "you" are; on a hot-seat 1v1 the winner is standing right here, so that is
     a win in the room and Sum of the All plays. Never mourn a stranger. */
  var me=CPU.on?human:(NET.on?NET.role:-1);
  endMood=(me>=0&&winner!==me)?'lose':'win';
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
  showJumbo(2200);   /* the big board holds the tied score before the cards */
  fTimeout(sdNext,2600);
}
function sdNext(){
  if(!sd)return;
  var team=sd.asked===0?sd.first:1-sd.first;
  heatOffenseChange(team);
  state.offense=team;                    /* card ownership rides on offense */
  pending={type:'sd',team:team};
  /* the ladder already escalates medium -> hard; round 3 goes LEGENDARY.
     Two players who've traded haymakers this long have earned it. */
  var tier=sd.round>=3?4:(sd.round>=2?3:2);
  showCard(tier,'SUDDEN DEATH','Round '+sd.round+' — answer to survive',
    sd.asked===0?'Scored on, so you answer first':'Match it — or take the crown');
}
function endGameSD(winner){
  callout('GAME OVER!<small>sudden death</small>',teamInk(winner));
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
  /* slap zones wear the squad names (+ desktop keys for whoever's human) */
  var kA=(!NET.on&&!(CPU.on&&CPU.team===0))?'<kbd class="kbd">A</kbd>':'';
  var kB=(!NET.on&&!(CPU.on&&CPU.team===1))?'<kbd class="kbd">L</kbd>':'';
  g('tvNmA').innerHTML=ICO('hand')+' '+teamName(0)+kA;
  g('tvNmB').innerHTML=ICO('hand')+' '+teamName(1)+kB;
  g('tipveil').classList.add('on');
  var armTip=function(){
    if(!tip)return;
    if(!tip.q){                        /* host's pick still in flight — never arm blind */
      waited+=120;
      if(waited<8000){g('tipMsg').textContent='syncing the question…';fTimeout(armTip,120);return;}
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
      fTimeout(function(){
        if(!tip||tip.buzz>=0)return;
        tipBuzz(CPU.team);
        g('tipAns').innerHTML='';
        g('tipMsg').innerHTML=ICO('robot')+' CPU BUZZED — it’s answering…';
        fTimeout(function(){if(tip)tipAnswer(Math.random()<cpuLvl().tip)},900+Math.random()*700);
      },(function(){
        /* the machine reads at HUMAN speed: it may never buzz before a person
           could plausibly finish reading THIS card — its edge is knowledge,
           not robot eyes (Aaron 07-27) */
        var readMs=1400+((tip&&tip.q)?tip.q.q.length:80)*32;
        return readMs+cpuRnd(cpuLvl().buzz);
      })());
    }
  };
  if(document.body.classList.contains('reduce-motion')){armTip();return;}
  var cd=g('tipCd'),n=5;
  cd.textContent=n;cd.classList.add('on');cd.classList.remove('tick');void cd.offsetWidth;cd.classList.add('tick');
  g('tipMsg').textContent='get ready to buzz…';
  /* chained fTimeout, not setInterval: the ready-set-go must HOLD under a coach
     card instead of counting down to a jump ball nobody can see */
  (function step(){
    fTimeout(function(){
      n--;
      if(!tip){cd.classList.remove('on');return;}
      if(n<=0){armTip();return;}
      cd.textContent=n;cd.classList.remove('tick');void cd.offsetWidth;cd.classList.add('tick');
      step();
    },800);
  })();
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
    b.dataset.ok=(oi===q.a)?'1':'0';
    b.addEventListener('click',function(){
      /* THE JUMP BALL USED TO JUST VANISH. Every other card in the game lights
         the right answer green and your wrong pick red, then holds; this one
         dismissed the veil on the same tick, so you never learned whether you
         got it. Aaron, 08-01: "it's confusing if you got it right or not".
         Same treatment, same 1.4s beat, then the tip resolves. */
      var ok=oi===q.a;
      var btns=el.querySelectorAll('button');
      for(var m=0;m<btns.length;m++){
        btns[m].disabled=true;
        if(btns[m].dataset.ok==='1')btns[m].classList.add('correct');
      }
      if(!ok)b.classList.add('wrong');
      g('tipMsg').textContent=ok?'GOT IT.':'NO GOOD.';
      netEv({a:'tip',ok:ok});
      setTimeout(function(){tipAnswer(ok)},1400);
    });
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
    (noBuzz?'nobody buzzed':(ok?'won the tip':'missed it — other way'))+'</small>',teamInk(winner));
  if(window.BKAudio)BKAudio.sfx(ok?'net':'buzzer');
  heatOffenseChange(winner);
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
var setupCfg={league:null,decade:null,target:11,rosters:null,packs:[],
  /* 'open' (default) or 'locked' — see guards(). Room-level, NOT per phone:
     two phones disagreeing about who guards what would fork the game. */
  spacing:'open',
  /* bracketMode 'same' = one level for the room · 'handicap' = each player their own.
     brackets[team] is a BRACKETS key. Set at room creation; the guest is shown it. */
  bracketMode:'same',brackets:['baller','baller'],
  court:(function(){try{return localStorage.getItem('bk_court')||'classic-a'}catch(e){return 'classic-a'}})(),
  cw:[(function(){try{var v=localStorage.getItem('bk_cw');if(!v)return null;
    return v[0]==='{'?JSON.parse(v):v;}catch(e){return null}})(),null]};

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
  /* buzzers + scoreline wear the squad names (pass&play names them pre-tip) */
  var kbA=tuOnline()?'':'<kbd class="kbd">A</kbd>',kbB=tuOnline()?'':'<kbd class="kbd">L</kbd>';
  g('tuBzA').innerHTML=ICO('bell')+' '+teamName(0)+kbA;
  g('tuBzB').innerHTML=kbB+teamName(1)+' '+ICO('bell');
  g('tuRowA').textContent='\u25cf '+teamName(0);
  g('tuRowB').textContent=teamName(1)+' \u25cf';
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
  else g('tuHint').textContent=teamName(winner)+' is answering…';
}
function tuShowBuzzer(side,noBuzz){
  g('tuBuzzes').style.display='none';
  var who=g('tuWho');
  who.textContent=noBuzz?(teamName(side)+' gets it — no buzz!')
                        :(teamName(side)+' buzzed!');
  who.classList.add('on');
  if(!noBuzz)g('tuHint').textContent=teamName(side)+' — lock in your answer.';
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
  /* The good news used to get LESS time than the bad news: a right answer went
     straight to tuWin (panel gone 800ms later) while a wrong one held 1000ms
     first. So the green flash you earned was the one you couldn't see. Both
     beats are now the same 1000ms. */
  if(ok){
    g('tuHint').innerHTML='✓ Got it!';
    setTimeout(function(){tuWin(side);},1000);
  }else{
    g('tuHint').textContent='Brick! '+teamName(1-side)+' steals THE CALL.';
    setTimeout(function(){tuWin(side===0?1:0);},1000);
  }
}
function tuWin(side){
  TU.winner=side;setupCfg.tossWinner=side;
  var mine=tuOnline()?NET.role:side;
  g('tuWonEy').textContent=teamName(side)+' won the toss-up';
  var slam=g('tuCall').querySelector('.tu-won .big');
  if(slam)slam.textContent=(!tuOnline()||side===mine)?"You've got the Call!"
                                                    :teamName(side)+' has the Call';
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
       decided here. ONLINE the toss-up pays BOTH ways now: winner takes THE
       CALL, loser sets the scene (the court pick is the consolation prize).
       Handicap levels come after the court. */
    if(!tuOnline()){localColorCall();return;}  /* hot-seat: winner suits up, then loser */
    startColorCall();
  };
  if(document.body.classList.contains('reduce-motion')){advance();return;}
  setTimeout(function(){navSlam(advance);},900);
}
/* the loser's consolation: they pick the court both phones play on */
function startCourtCall(){
  var loser=1-setupCfg.theCall.winner;
  if(NET.role===loser){
    buildCourtsScreen('tossup');
    show('courts');
  }else{
    netVeil('<b>'+teamName(loser)+' lost the tip — so they set the scene.</b><br>Waiting on their court pick…');
  }
}
function afterCourtCall(){
  netVeil('');
  if(setupCfg.bracketMode==='handicap'){startHandicap();return;}
  beginMatch();
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
/* GENERATED from docs/play/data/tables/leagues.json by
   tools/tables-emit.py. Do not hand-edit: the table is the only
   place a league is defined (TABLES.md). */
var LG_LEAGUES=[
  {id:'nba', name:'NBA', fmt:'5v5 · full court', graf:"THE SHOW", ball:'classic', rc:'#f5872e', gr:'#ff9a48', play:'nba'},
  {id:'wnba', name:'WNBA', fmt:'5v5 · full court', graf:"THE W", ball:'oatmeal', rc:'#e6a7b4', gr:'#ffb6c6', play:'wnba'},
  {id:'big3', name:'BIG3', fmt:'3v3 · half court', graf:"3'S UP", ball:'aba', rc:'#d8b25a', gr:'#ffd76a', lock:1},
  {id:'flags', name:'Flags', fmt:'nation vs nation', graf:"FOR COUNTRY", ball:'molten', rc:'#6fd0c3', gr:'#7fe4d6', lock:1},
  {id:'overseas', name:'Overseas', fmt:'club ball, everywhere else', graf:"OVERSEAS", ball:'molten', rc:'#4e9c93', gr:'#63bfb3', lock:1},
  {id:'college', name:'College', fmt:'the dance', graf:"MADNESS", ball:'classic', rc:'#8fa8d0', gr:'#a9c2ee', lock:1},
  {id:'street', name:'Street Legends', fmt:'no refs', graf:"NO REFS", ball:'street', rc:'#c08a5a', gr:'#e0a86a', lock:1}
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
  if(d.dataset.play)pkShow(d.dataset.play);else pkHide();
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
    setupCfg.packs=pkList();     /* whatever they ticked under this card */
    if(Object.keys(ROSTERS[lg]).length<=1){setupCfg.decade=['FULL'];afterEras();}
    else buildDecadeScreen();
  },520);
}
/* ===== QUESTION PACKS =====================================================
   Aaron 07-28: "some people may genuinely want to quiz on a combo of Big3, NBA
   and streetball, but can't as it stands." League still decides the board and
   the player pool — that link is the point of the league picker and it stays.
   Packs are trivia only, they only ever ADD, and they open in place under the
   card you just picked so nobody who doesn't care ever meets them.
   Side effect worth naming: College, Street Legends and the Black Fives Era have
   questions but no rosters and no board, so they were unreachable in every
   game. As trivia they need neither — this is how those 270 cards ship. */
var PACKS=[
  {id:'nba', nm:'NBA', rc:'#f5872e'},
  {id:'wnba', nm:'WNBA', rc:'#e6a7b4'},
  {id:'big3', nm:'BIG3', rc:'#d8b25a'},
  {id:'flags', nm:'Flags', rc:'#6fd0c3'},
  {id:'overseas', nm:'Overseas', rc:'#4e9c93'},
  {id:'college', nm:'College', rc:'#8fa8d0'},
  {id:'street', nm:'Street Legends', rc:'#c08a5a'}
];
var PACK_PRESETS=[
  {k:'none', lbl:'Just my league', ids:[]},
  {k:'roots',lbl:'Hoop history',   ids:['fives','college','street']},
  {k:'pro',  lbl:'Pro circuit',    ids:['nba','wnba','world','big3']},
  {k:'all',  lbl:'The whole gym',  ids:['nba','wnba','world','college','street','big3','fives']}
];
function packName(id){
  for(var i=0;i<PACKS.length;i++)if(PACKS[i].id===id)return PACKS[i].nm;
  return String(id||'').toUpperCase();
}
var pkOn={},pkLeague=null,pkShown=0,pkRaf=null;
function pkList(){return PACKS.filter(function(p){return p.id!==pkLeague&&pkOn[p.id]})
  .map(function(p){return p.id})}
function pkRoll(to){
  var el=g('pkNum'),led=g('pkLed');if(!el)return;
  if(pkRaf)cancelAnimationFrame(pkRaf);
  var from=pkShown,t0=performance.now(),dur=460;
  if(document.body.classList.contains('reduce-motion')){pkShown=to;el.textContent=to;return}
  (function step(now){
    var k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);
    pkShown=Math.round(from+(to-from)*e);el.textContent=pkShown;
    if(k<1)pkRaf=requestAnimationFrame(step);else{pkShown=to;el.textContent=to}
  })(t0);
  if(led){led.classList.remove('bump');void led.offsetWidth;led.classList.add('bump')}
}
function pkPaint(animate){
  if(!pkLeague)return;
  var chosen=pkList(),total=packTotal(pkLeague,chosen,setupCfg.decade);
  var grid=g('pkGrid');
  if(grid)Array.prototype.forEach.call(grid.children,function(el){
    var on=!!pkOn[el.dataset.pk];
    el.classList.toggle('on',on);el.setAttribute('aria-pressed',on?'true':'false');
  });
  var pres=g('pkPresets');
  if(pres)Array.prototype.forEach.call(pres.children,function(c){
    var want=(PACK_PRESETS[c.dataset.i|0].ids||[]).filter(function(x){return x!==pkLeague}).slice().sort().join(',');
    c.classList.toggle('on',want===chosen.slice().sort().join(','));
  });
  var sub=g('pkSub');
  if(sub)sub.textContent=chosen.length
    ? (packName(pkLeague)+' + '+chosen.length+' pack'+(chosen.length>1?'s':''))
    : 'Just your league for now';
  var sum=g('pkSum');
  if(sum)sum.innerHTML=chosen.length
    ? 'You\u2019ll get <b>'+packName(pkLeague)+'</b> questions, the sport\u2019s own basics, and <b>'+
      chosen.map(packName).join('</b>, <b>')+'</b>. Same board, same squads \u2014 a wider pile of cards.'
    : 'You\u2019ll get <b>'+packName(pkLeague)+'</b> questions and the sport\u2019s own basics. Tick a pack to widen the pile.';
  if(animate===false){pkShown=total;var el=g('pkNum');if(el)el.textContent=total}
  else pkRoll(total);
  setupCfg.packs=chosen;
}
function pkBuild(){
  var pres=g('pkPresets'),grid=g('pkGrid');
  if(!pres||!grid)return;
  pres.innerHTML='';
  PACK_PRESETS.forEach(function(P,i){
    var b=document.createElement('button');
    b.className='qchip';b.type='button';b.dataset.i=i;b.textContent=P.lbl;
    b.addEventListener('click',function(){
      pkOn={};P.ids.forEach(function(id){if(id!==pkLeague)pkOn[id]=true});
      if(window.BKAudio)BKAudio.sfx('click');
      pkPaint();
    });
    pres.appendChild(b);
  });
  var CHECK='<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.4L4.6 9 10 3.2" stroke="#151211" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  grid.innerHTML='';
  PACKS.forEach(function(P){
    if(P.id===pkLeague)return;                 /* your own league is implicit */
    var b=document.createElement('button');
    b.className='qpk';b.type='button';b.dataset.pk=P.id;
    b.style.setProperty('--rc',P.rc);
    b.setAttribute('aria-pressed','false');
    b.innerHTML='<span class="box">'+CHECK+'</span><span><span class="pn">'+P.nm+
      '</span><span class="pc">+'+qCount(P.id)+' cards</span></span>';
    b.addEventListener('click',function(){
      pkOn[P.id]=!pkOn[P.id];
      if(window.BKAudio)BKAudio.sfx('click');
      pkPaint();
    });
    grid.appendChild(b);
  });
}
/* the panel appears under whichever league card is open, and re-bases on it */
function pkShow(lg){
  pkLeague=lg;
  var wrap=g('lgPacks');if(!wrap)return;
  pkBuild();
  wrap.classList.add('show');
  pkShown=packTotal(lg,pkList(),setupCfg.decade);
  pkPaint(false);
}
function pkHide(){
  var wrap=g('lgPacks');if(!wrap)return;
  wrap.classList.remove('show','open');
  var t=g('pkTrig');if(t)t.setAttribute('aria-expanded','false');
}
function pkReset(){pkOn={};pkLeague=null;setupCfg.packs=[];pkHide();}
(function(){
  var t=g('pkTrig');
  if(t)t.addEventListener('click',function(){
    var w=g('lgPacks'),o=w.classList.toggle('open');
    t.setAttribute('aria-expanded',o?'true':'false');
    if(window.BKAudio)BKAudio.sfx('click');
  });
})();
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
      +'<div class="lr-tab">'+(x.lock?'<span class="lk">'+ICO('lock')+' In the lab</span>':'<span>tap</span>')+'</div>';
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
    if(isFull())cap.innerHTML='<b>All-Time</b> — every era in play';
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
   Tiers come straight from the research DB (744 players); the curated superstar
   list below is only a fallback for names the DB hasn't met. Packs deal from
   the full DB — see dbPickSquad — so "1 star + 4 role" commons are real now. */
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
   stats shows an ACCOLADE instead — streetball and Black Fives Era box scores
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
   'stars' is how many of the five slots are reserved for a SUPERSTAR. The rest
   deal from the FULL database, weighted toward role players and starters — so
   a Common pack finally means what it says: one star carrying real role support. */
var SR_RARITY=[
  {k:'common',lbl:'Common',desc:'1 superstar · role support',stars:1,w:40},
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
/* ===== DEAL FROM THE DATABASE (Phase 2 payoff) ============================
   Packs now deal from the FULL research DB — 744 players — filtered by league
   + era + position, so ~270 depth players finally enter play and a Common
   pack hands you real role support instead of four all-stars in a trenchcoat.
   The hand-built rosters stay as the FALLBACK dealer for any pool the DB
   can't honestly fill (small leagues, thin era slices). */
var DB_ERA={'60s':'1960s','70s':'1970s','80s':'1980s','90s':'1990s',
            '00s':'2000s','10s':'2010s','20s':'2020s'};
var DB_DEAL={};    /* league -> {pos -> [{n,num,tier,eras:{}}]} built once */
/* name -> permanent player id, built once. Only for code paths that still deal
   by name (the hand-built fallback rosters). Anything reading the player DB
   should carry `pid` directly instead of looking it up. */
var PID_BY_NAME=null;
function pidByName(n){
  if(!PID_BY_NAME){
    PID_BY_NAME={};
    if(typeof PLAYERDB!=='undefined')
      for(var i=0;i<PLAYERDB.length;i++)
        if(PLAYERDB[i].playerId&&!PID_BY_NAME[PLAYERDB[i].name])
          PID_BY_NAME[PLAYERDB[i].name]=PLAYERDB[i].playerId;
  }
  return PID_BY_NAME[n]||null;
}
function dbDealPool(league){
  if(DB_DEAL[league])return DB_DEAL[league];
  var pool={};
  if(typeof PLAYERDB!=='undefined'){
    for(var i=0;i<PLAYERDB.length;i++){
      var p=PLAYERDB[i];
      if(p.league!==league||!p.pos)continue;
      var eras={};(p.eras||[]).forEach(function(e){eras[String(e)]=1;});
      /* pid = the player's PERMANENT name tag, carried all the way through the
         dealer so the question picker can tell WHO is on your team rather than
         only what they are called. That missing link is exactly why the 3x
         roster weighting (22s) was written into the data but never ran. Names
         are for display; pids are for matching. */
      (pool[p.pos]=pool[p.pos]||[]).push({n:p.name,pid:p.playerId,num:p.num,
                                          tier:p.tier,eras:eras});
    }
  }
  DB_DEAL[league]=pool;return pool;
}
/* non-superstar slots lean toward the guys who make a Common pack feel real */
var DB_TIER_W={allstar:1,starter:2,role:3,deep:1};
function dbWeighted(opts){
  var tot=0,i;for(i=0;i<opts.length;i++)tot+=(DB_TIER_W[opts[i].tier]||1);
  var x=Math.random()*tot;
  for(i=0;i<opts.length;i++){x-=(DB_TIER_W[opts[i].tier]||1);if(x<=0)return opts[i];}
  return opts[opts.length-1];
}
function dbPickSquad(starCount,exclude){
  var league=setupCfg.league,lineup=MODES[league].lineup,pool=dbDealPool(league);
  var decs=Array.isArray(setupCfg.decade)?setupCfg.decade.slice():[setupCfg.decade];
  var full=!decs.length||decs.indexOf('FULL')>=0||decs.indexOf('ANY')>=0;
  var want={};decs.forEach(function(d){if(DB_ERA[d])want[DB_ERA[d]]=1;});
  if(!Object.keys(want).length)full=true;
  function inEra(pl){if(full)return true;for(var e in want)if(pl.eras[e])return true;return false;}
  /* honesty guard: only deal from the DB when every position has a real pool */
  for(var gi=0;gi<lineup.length;gi++){
    var gp=(pool[lineup[gi]]||[]).filter(inEra);
    if(gp.length<4)return null;
  }
  var used={};(exclude||[]).forEach(function(n){used[n]=true;});
  var idxs=lineup.map(function(_,i){return i;});
  for(var i=idxs.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=idxs[i];idxs[i]=idxs[j];idxs[j]=t;}
  var starSlots={};for(var k=0;k<Math.min(starCount,lineup.length);k++)starSlots[idxs[k]]=true;
  var r={};
  /* FILL IN SHUFFLED ORDER (D13). The lineup used to be walked in fixed order
     PG,SG,SF,PF,C and only the STAR slots were shuffled. That is harmless while
     a player sits in exactly one position bucket, but the moment positions can
     overlap (D11 — Magic is a PG and a C) the first slot gets first refusal on
     every multi-position player, so Magic lands at PG on nearly every deal and
     centre becomes the leftovers drawer. Shuffling which slot picks first is
     what makes versatility actually feel like versatility.
     `idxs` is already a shuffled list of slot indexes — reuse it rather than
     rolling a second one, so the star slots and the fill order stay consistent
     with each other. */
  idxs.forEach(function(i){
    var p=lineup[i];
    var avail=(pool[p]||[]).filter(function(pl){return inEra(pl)&&!used[pl.n];});
    if(!avail.length)avail=(pool[p]||[]).filter(function(pl){return !used[pl.n];});
    var wantS=!!starSlots[i];
    var tiered=avail.filter(function(pl){return (pl.tier==='superstar')===wantS;});
    var opts=tiered.length?tiered:avail;
    var pick=wantS?opts[Math.floor(Math.random()*opts.length)]:dbWeighted(opts);
    used[pick.n]=true;
    r[p]={n:pick.n,pid:pick.pid,num:pick.num,tier:srTierOf(pick.n)};
  });
  return r;
}
function rosterPickSquad(starCount,exclude){
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
  /* shuffled fill order here too (D13) — the fallback dealer had the identical
     fixed-order flaw, and a squad dealt by it must not behave differently */
  idxs.forEach(function(i){
    var p=lineup[i];
    var wantS=!!starSlots[i];
    var avail=pool[p].filter(function(pl){return !used[pl.n];});
    var tiered=avail.filter(function(pl){return (srTierOf(pl.n)==='S')===wantS;});
    var opts=tiered.length?tiered:(avail.length?avail:pool[p]);
    var pick=opts[Math.floor(Math.random()*opts.length)]||pool[p][0];
    /* the hand-built fallback rosters predate player ids, so resolve the tag by
       name here — otherwise a squad dealt by the fallback would silently lose
       its 3x weighting */
    used[pick.n]=true;
    r[p]={n:pick.n,pid:pidByName(pick.n),num:pick.num,tier:srTierOf(pick.n)};
  });
  return r;
}
function srPickSquad(starCount,exclude){
  return dbPickSquad(starCount,exclude)||rosterPickSquad(starCount,exclude);
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
  var team=SR.order[SR.idx],lineup=MODES[setupCfg.league].lineup,col=teamCol(team),nm=teamName(team);
  var scr=g('screen-squad');scr.style.setProperty('--tcol',col);
  var tap=scr.querySelector('.sr-tap');if(tap)tap.style.display='';   /* your turn — taps are live again */
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
    /* a depth player without a VERIFIED jersey number shows none — never invent */
    c.innerHTML='<div class="sr-face sr-front"><div class="sr-pos">'+p+'</div><div class="sr-jer"><span class="num">'+(pl.num!=null?pl.num:'')+'</span><span class="ball"></span></div><div class="sr-nm">'+pl.n+'</div>'+statHTML+'<div class="sr-tb">'+(tier==='S'?'Superstar':tier==='A'?'All-Star':'Role')+'</div></div><div class="sr-face sr-back"><b>BK</b></div>';
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
function srOnline(){return NET.on&&!CPU.on}
function buildSquadScreen(){
  var order=CPU.on?[1-CPU.team]:srDetermineOrder();   /* vs CPU: only the human reveals */
  SR={order:order,idx:0,squads:[null,null],shuffles:srShuffleAllowance(order[0]),
      rar:null,squad:null};
  srBeginTurn();show('squad');
}
/* ONLINE USES THE SAME REVEAL, TAKING TURNS.
   It used to have its own stripped screen: no pack rarity, no guaranteed
   superstar, and UNLIMITED shuffles — which also made THE CALL's "+2 shuffles"
   prize completely inert in the mode that matters most. Order comes from THE
   CALL (srDetermineOrder), so whoever won first-pick genuinely picks from the
   full pool and the other player's roll excludes those five. */
function srBeginTurn(){
  var team=SR.order[SR.idx];
  if(srOnline()&&team!==NET.role){srWaitTurn(team);return;}
  srRoll();
}
function srWaitTurn(team){
  var nm=teamName(team),col=teamCol(team);
  /* it is NOT your five on screen — say so, and don't invite taps on face-down cards */
  g('srTeamH').innerHTML='<span style="color:'+col+'">'+nm+'</span> is on the clock';
  g('srTurn').innerHTML='Their five is being dealt…';
  var tap=document.querySelector('#screen-squad .sr-tap');if(tap)tap.style.display='none';
  g('srRarSlot').innerHTML='';
  var five=g('srFive');five.innerHTML='';
  MODES[setupCfg.league].lineup.forEach(function(){
    var c=document.createElement('div');c.className='sr-card down';
    c.style.setProperty('--tc','#3a332a');
    c.innerHTML='<div class="sr-face sr-front"></div><div class="sr-face sr-back"><b>BK</b></div>';
    five.appendChild(c);
  });
  var pls='';MODES[setupCfg.league].lineup.forEach(function(p){pls+='<span>'+p+'</span>'});
  g('srPosLabels').innerHTML=pls;
  g('srPips').innerHTML='';
  g('srShuffle').disabled=true;g('srShuffle').textContent='Their turn';
  g('srLock').disabled=true;
  g('srOdds').innerHTML='You\u2019re up next — their five will be off the board.';
}
function srAdvanceTurn(){
  if(SR.idx<SR.order.length-1){
    SR.idx++;SR.shuffles=srShuffleAllowance(SR.order[SR.idx]);
    g('srShuffle').disabled=false;g('srLock').disabled=false;
    srBeginTurn();
    return;
  }
  if(CPU.on){
    /* the machine picking is its OWN quick beat — a waiting veil, not a
       callout slammed over the next screen (Aaron 07-27) */
    var ex=[],hs=SR.squads[1-CPU.team];
    MODES[setupCfg.league].lineup.forEach(function(p){ex.push(hs[p].n)});
    SR.squads[CPU.team]=cpuAutoSquad(ex);
    netVeil(ICO('robot')+' <b>'+cpuLvl().name.toUpperCase()+' is picking its five\u2026</b>');
    setTimeout(function(){
      netVeil(ICO('robot')+' <b>'+cpuLvl().name.toUpperCase()+' LOCKED ITS FIVE.</b><br>Your house rules, coach.');
      if(window.BKAudio)BKAudio.sfx('click');
      setTimeout(function(){
        netVeil('');
        setupCfg.rosters=[SR.squads[0],SR.squads[1]];
        buildLocker();show('locker');   /* dress the night before the rules */
      },900);
    },1300);
    return;
  }
  setupCfg.rosters=[SR.squads[0],SR.squads[1]];
  if(srOnline()){
    /* both fives are locked and identical on each phone — straight to the floor */
    showVersus({league:setupCfg.league,decade:setupCfg.decade,target:setupCfg.target,
      rosters:setupCfg.rosters,bracketMode:setupCfg.bracketMode,
      brackets:setupCfg.brackets.slice(),court:setupCfg.court,
      colors:setupCfg.cw.slice()},NET.role===0);
    return;
  }
  /* pass&play dresses in the locker too (Aaron 08-02) — court gets its
     showcase instead of hiding as a row at the bottom of the rules screen.
     The jersey square goes display-only there: jerseys are the toss-up's
     prize, and a tappable picker here would be the dead control again. */
  buildLocker();show('locker');
}
g('insveil').addEventListener('click',srInspectClose);
g('srShuffle').addEventListener('click',function(){
  if(SR.shuffles<=0)return;
  if(srOnline()&&SR.order[SR.idx]!==NET.role)return;   /* not your turn */
  SR.shuffles--;srRoll();
});
g('srLock').addEventListener('click',function(){
  var team=SR.order[SR.idx];
  if(srOnline()&&team!==NET.role)return;        /* not your turn — can't lock theirs */
  SR.squads[team]=SR.squad;
  if(srOnline())netEv({a:'srlock',team:team,roster:SR.squad});
  srAdvanceTurn();
});
g('lgBack').addEventListener('click',function(){show('title')});
g('decBack').addEventListener('click',function(){show('league')});
g('sqBack').addEventListener('click',function(){
  if(srOnline())return;        /* no bailing out of a live room mid-reveal */
  show(Object.keys(ROSTERS[setupCfg.league]||{}).length<=1?'league':'decade');
});
g('rulesBack').addEventListener('click',function(){
  if(NET.on)show(Object.keys(ROSTERS[setupCfg.league]||{}).length<=1?'league':'decade');
  else{buildLocker();show('locker');}   /* CPU and pass&play both dress here now */
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
  crtSyncRow();cwSyncRow();
  var hc=setupCfg.bracketMode==='handicap';
  g('klRulesRow').style.display=hc?'none':'';
  g('klRulesWild').style.display=hc?'none':'';
  g('klRulesMap').style.display=hc?'none':'';
  g('klRulesBlurb').textContent=hc
    ? 'Each player picks their own level after the toss-up.'
    : ((BRACKETS[setupCfg.brackets[0]]||{}).blurb||'');
  g('klModes').style.display=(ROOMSET||NET.on)?'':'none';   /* solo has no opponent to handicap */
  g('btnTip').innerHTML=ROOMSET?'Get my code →':'Tip-off '+ICO('ball');
  /* BOTH showcase rows are hidden EVERYWHERE now (08-02, Aaron):
     TEAM COLORS — every mode decides jerseys later. CPU dresses in the
     locker, online makes them a toss-up prize, and pass&play suits up at
     the call, where localColorCall() WIPES cw[] — a pre-pick here was a
     dead control that painted the versus marquee and got thrown away.
     HOME COURT — the court now gets its LOCKER showcase in CPU and
     pass&play alike ("the court hides on the bottom again and I'm not a
     fan of that"); online it is the toss-up loser's final say. */
  g('cwOpen').style.display='none';
  g('crtOpen').style.display='none';
}
var klRulesPaint=klMount({row:'klRulesRow',wild:'klRulesWild',blurb:'klRulesBlurb',map:'klRulesMap'},
  function(){return setupCfg.brackets[0]},
  function(k){setupCfg.brackets[0]=k;setupCfg.brackets[1]=k;});
/* ===== HOME COURT picker (screen) ========================================
   Cards are built from the COURTS registry; art lazy-loads so nobody pays
   for worlds they don't visit. Solo remembers the pick per phone; a room
   creator's pick rides the house rules to the other phone. */
var CRT={pick:null,mode:'rules'};
function crtCardHTML(id){
  var C=COURTS[id];
  if(id==='classic'){
    return '<button class="crt-card crt-classic" data-id="classic" data-look="a">'+
      '<div class="crt-art"><div class="cl-chk"></div><div class="cl-str"></div></div>'+
      '<div class="crt-plate"><div class="crt-tag">'+C.tag+'</div>'+
      '<div class="crt-nm">'+C.a.nm+'</div>'+
      '<div class="crt-lks">'+
      '<span class="crt-lk on" data-k="a"><span class="sw" style="--s1:#241b13;--s2:#f5872e"></span><i>A</i></span>'+
      '<span class="crt-lk" data-k="b"><span class="sw" style="--s1:#0d1424;--s2:#3f7fd6"></span><i>B</i></span>'+
      '</div></div><div class="crt-stamp">HOME COURT</div></button>';
  }
  var A=COURT_ART+id+'-a-bg.jpg',B=COURT_ART+id+'-b-bg.jpg';
  return '<button class="crt-card" data-id="'+id+'" data-look="a">'+
    '<div class="crt-art"><img loading="lazy" src="'+A+'" data-a="'+A+'" data-b="'+B+'" alt=""></div>'+
    '<div class="crt-plate"><div class="crt-tag">'+C.tag+'<b>'+C.fam.toUpperCase()+'</b></div>'+
    '<div class="crt-nm">'+C.a.nm+'</div>'+
    '<div class="crt-lks">'+
    '<span class="crt-lk on" data-k="a"><img loading="lazy" src="'+A+'"><i>A</i></span>'+
    '<span class="crt-lk" data-k="b"><img loading="lazy" src="'+B+'"><i>B</i></span>'+
    '</div></div><div class="crt-stamp">HOME COURT</div></button>';
}
function crtSelect(card){
  document.querySelectorAll('.crt-card').forEach(function(c){c.classList.remove('sel')});
  card.classList.add('sel');
  CRT.pick=card.dataset.id+'-'+card.dataset.look;
  g('crtPickNm').textContent=courtName(CRT.pick);
}
function buildCourtsScreen(mode){
  CRT.mode=mode||'rules';
  g('screen-courts').scrollTop=0;   /* rebuilds must start the picker at the top */
  var call=CRT.mode==='tossup';
  g('crtBack').style.display=(call&&NET.on)?'none':'';   /* hot-seat can step back */
  g('crtLock').textContent=call?'Set the scene →':'Lock it in →';
  var sub=document.querySelector('#screen-courts .crt-sub');
  if(sub)sub.textContent=call
    ?(NET.on?'You lost the tip — so YOU set the scene. Both phones play your pick.':'You lost the tip — so YOU set the scene.')
    :'Same game, twelve looks. Every court has an A and a B.';
  var grid=g('crtGrid');
  grid.innerHTML=Object.keys(COURTS).map(crtCardHTML).join('');
  CRT.pick=setupCfg.court||'classic-a';
  var cur=courtParts(CRT.pick);
  grid.querySelectorAll('.crt-card').forEach(function(card){
    var C=COURTS[card.dataset.id];
    if(card.dataset.id===cur.id&&cur.look==='b'){
      card.dataset.look='b';
      card.querySelector('.crt-nm').textContent=C.b.nm;
      card.querySelectorAll('.crt-lk').forEach(function(l){l.classList.toggle('on',l.dataset.k==='b')});
      var im=card.querySelector('.crt-art img');if(im)im.src=im.dataset.b;
      if(card.dataset.id==='classic')card.classList.add('blue');
    }
    if(card.dataset.id===cur.id)crtSelect(card);
    card.addEventListener('click',function(e){
      var lk=e.target.closest('.crt-lk');
      if(lk){
        var k=lk.dataset.k;
        card.dataset.look=k;
        card.querySelectorAll('.crt-lk').forEach(function(l){l.classList.toggle('on',l.dataset.k===k)});
        card.querySelector('.crt-nm').textContent=C[k].nm;
        var im2=card.querySelector('.crt-art img');if(im2)im2.src=im2.dataset[k];
        if(card.dataset.id==='classic')card.classList.toggle('blue',k==='b');
      }
      crtSelect(card);
      if(window.BKAudio)BKAudio.sfx('click');
    });
  });
}
function crtSyncRow(){var el=g('crtCur');if(el)el.textContent=courtName(setupCfg.court);}
g('crtOpen').addEventListener('click',function(){buildCourtsScreen();show('courts');});
g('crtLock').addEventListener('click',function(){
  setupCfg.court=CRT.pick||'classic-a';
  if(window.BKAudio)BKAudio.sfx('score');
  if(CRT.mode==='tossup'){
    /* room-level pick: broadcast, don't overwrite this phone's solo default */
    netEv({a:'court',court:setupCfg.court});
    applyCourt(setupCfg.court);
    if(!NET.on){   /* hot-seat: setup continues from here */
      if(setupCfg.bracketMode==='handicap'){startHandicap();return;}
      show('league');return;
    }
    afterCourtCall();
    return;
  }
  try{localStorage.setItem('bk_court',setupCfg.court)}catch(e){}
  crtSyncRow();
  if(lockerReturn())return;
  show('rules');
});
g('crtBack').addEventListener('click',function(){
  if(CRT.mode!=='tossup'){if(lockerReturn())return;show('rules');return;}
  if(NET.on)return;                /* online consolation is synced — no back */
  var w=setupCfg.theCall?setupCfg.theCall.winner:0;
  buildColorsScreen('lose',setupCfg.cw[w]);show('colors');
});
/* ===== LOCKER ROOM (CPU mode) — court + colors as their own showcase =====
   Tapping a square opens the existing picker; LK.ret routes the picker's
   lock/back straight back here instead of the rules screen. */
var LK={ret:false};
function buildLocker(){
  var ck=setupCfg.court||'classic-a';
  var c=courtParts(ck);
  var art=g('lkCourtArt');
  if(c.id==='classic'){
    art.style.backgroundImage='';
    art.className='lk-art classic'+(c.look==='b'?' blue':'');
  }else{
    art.className='lk-art';
    art.style.backgroundImage='url('+COURT_ART+c.id+'-'+c.look+'-bg.jpg)';
  }
  g('lkCourtNm').textContent=courtName(ck);
  var e0=setupCfg.cw&&setupCfg.cw[0];
  var cw=e0?cwGet(typeof e0==='object'?e0.id:e0):null;
  var jer=g('lkJer'),stage=g('lkStage');
  if(cw){
    jer.style.setProperty('--p',cw.p);jer.style.setProperty('--a',cw.a);
    stage.style.setProperty('--jglow','rgba('+cwHexArr(cw.p).join(',')+',.45)');
    g('lkJerNm').textContent=cw.nm;
  }else{
    jer.style.setProperty('--p','#f5872e');jer.style.setProperty('--a','#241000');
    stage.style.setProperty('--jglow','rgba(245,135,46,.4)');
    g('lkJerNm').textContent='Classic Orange';
  }
  var nm=setupCfg.names&&setupCfg.names[0]&&setupCfg.names[0].nm;
  g('lkJerKick').textContent='Team colors'+(nm?' · '+nm:'');
  /* pass&play: the jersey square is a SHOWCASE, not a picker — jerseys are
     won at the toss-up (winner suits up first, loser answers with contrast).
     Tappable only in CPU mode, where you genuinely dress here. */
  var jSq=g('lkJersey'),local=!CPU.on;
  jSq.style.pointerEvents=local?'none':'';
  jSq.style.opacity=local?'.62':'';
  jSq.setAttribute('aria-disabled',local?'true':'false');
  var jSwap=jSq.querySelector('.lk-swap');
  if(local){
    g('lkJerKick').textContent='Jerseys · won at the toss-up';
    g('lkJerNm').textContent='Winner suits up first';
    if(jSwap)jSwap.style.display='none';  /* "Browse all 24" invites a tap the
                                             square no longer takes */
    jSq.setAttribute('aria-label','Jerseys are won at the toss-up — winner suits up first');
  }else{
    if(jSwap)jSwap.style.display='';
    jSq.setAttribute('aria-label','Team colors — open the jersey picker');
  }
  /* the eyebrow/sub were written for CPU mode — tell the truth per mode */
  var scr=g('screen-locker');
  var eye=scr.querySelector('.setup-eyebrow'),sub=scr.querySelector('.crt-sub');
  if(eye)eye.textContent=local?'Step 3 · Pass-n-play':'Step 3 · Vs the machine';
  if(sub)sub.textContent=local?'Your floor tonight. Jerseys get settled at the toss-up.'
                              :'Your floor. Your colors. The machine dresses to contrast.';
}
g('lkCourt').addEventListener('click',function(){LK.ret=true;buildCourtsScreen('rules');show('courts');});
g('lkJersey').addEventListener('click',function(){LK.ret=true;buildColorsScreen('rules');show('colors');});
g('lkGo').addEventListener('click',function(){show('rules');});
g('lkBack').addEventListener('click',function(){buildSquadScreen();});
/* pickers opened FROM the locker return TO the locker */
function lockerReturn(){
  if(!LK.ret)return false;
  LK.ret=false;buildLocker();show('locker');return true;
}

/* ===== TEAM COLORS picker + THE CALL color flow ==========================
   modes: 'rules' (solo/room default — saves this phone's colorway),
          'win'   (online: toss-up winner picks first),
          'lose'  (online: loser picks second — clash guard + no stealing). */
var CW={mode:'rules',pick:null};
function cwCardHTML(c){
  return '<button class="cwc" data-id="'+c.id+'" style="--p:'+c.p+';--a:'+c.a+'">'+
    '<span class="cw-jer"><i>23</i></span>'+
    '<span class="cw-nm">'+c.nm+'</span><span class="cw-tag" data-tag="'+c.tag+'">'+c.tag+'</span></button>';
}
function buildColorsScreen(mode,againstId){
  CW.mode=mode||'rules';CW.against=againstId||null;
  g('screen-colors').scrollTop=0;   /* second picker must not inherit the first picker's scroll */
  var call=CW.mode!=='rules';
  var pickT=CW.mode==='win'?setupCfg.theCall.winner:(CW.mode==='lose'?1-setupCfg.theCall.winner:0);
  /* pass&play named their squads before the toss-up — address the picker by name */
  var preset=(call&&setupCfg.names&&setupCfg.names[pickT])?setupCfg.names[pickT]:null;
  if(!call&&setupCfg.names&&setupCfg.names[0])preset=setupCfg.names[0];
  CW.preset=preset;
  /* names are chosen up front in every mode now — the colors screen is
     jerseys ONLY when an identity already exists */
  g('cwNameBox').style.display=preset?'none':'';
  g('cwBack').style.display=(call&&NET.on)?'none':'';   /* hot-seat can step back */
  g('cwLock').textContent=CW.mode==='win'?'Suit up →':(CW.mode==='lose'?'Suit up →':'Lock it in →');
  g('cwEyebrow').textContent=CW.mode==='win'
    ?('The Call · '+(preset?preset.nm:'Winner')+' suits up first'+(!NET.on?' — grab the phone':''))
    :(CW.mode==='lose'?((preset?preset.nm:'Your colors')+' — suit up'):'House rules · Suit up');
  g('cwSub').textContent=CW.mode==='lose'
    ?'Their look is locked — anything in the same color family is off the rack.'
    :'24 colorways — NBA, WNBA, FIBA and BIG3, overlaps collapsed.';
  var grid=g('cwGrid');
  grid.innerHTML=COLORWAYS.map(cwCardHTML).join('');
  var againstId=(CW.against&&typeof CW.against==='object')?CW.against.id:CW.against;
  var other=againstId?cwGet(againstId):null;
  CW.pick=null;
  /* stepping BACK into a call picker restores that squad's earlier pick */
  var s0=call?setupCfg.cw[pickT]:setupCfg.cw[0];
  var start=s0?(typeof s0==='object'?s0.id:s0):null;
  grid.querySelectorAll('.cwc').forEach(function(card){
    var c=cwGet(card.dataset.id);
    if(other){
      var tagEl=card.querySelector('.cw-tag');
      if(c.id===other.id){card.classList.add('taken');tagEl.textContent='locked by them';}
      else if(cwClash(c.p,other.p)){card.classList.add('clash');tagEl.textContent='too close to theirs';}
    }
    if(start&&c.id===start&&!card.classList.contains('clash')&&!card.classList.contains('taken')){
      card.classList.add('sel');CW.pick=c.id;g('cwPickNm').textContent=c.nm;
    }
    card.addEventListener('click',function(){
      if(card.classList.contains('clash')||card.classList.contains('taken'))return;
      grid.querySelectorAll('.cwc').forEach(function(x){x.classList.remove('sel')});
      card.classList.add('sel');CW.pick=c.id;
      g('cwPickNm').textContent=c.nm;
      if(!CW.preset){g('cwName').value=c.nm;g('cwAb').value=cwAbbrev(c.nm);}
      g('cwNameErr').textContent='';
      if(window.BKAudio)BKAudio.sfx('click');
    });
  });
  /* restore this phone's saved squad identity (rules mode) — the names screen wins */
  var saved=(CW.mode==='rules'&&setupCfg.cw[0]&&typeof setupCfg.cw[0]==='object')?setupCfg.cw[0]:null;
  if(CW.mode==='rules'&&setupCfg.names&&setupCfg.names[0])saved=setupCfg.names[0];
  if(CW.preset){
    g('cwName').value=CW.preset.nm;g('cwAb').value=CW.preset.ab;
    if(!CW.pick)g('cwPickNm').textContent='—';
  }else if(CW.pick){
    var pc=cwGet(CW.pick);
    g('cwName').value=(saved&&saved.nm)||pc.nm;
    g('cwAb').value=(saved&&saved.ab)||cwAbbrev(pc.nm);
  }else{g('cwPickNm').textContent='—';g('cwName').value='';g('cwAb').value='';}
  g('cwNameErr').textContent='';
}
/* squad identity off the inputs — clean or it doesn't fly */
function cwIdent(){
  if(!CW.pick)return {err:'pick a colorway first'};
  if(CW.preset)return {id:CW.pick,nm:CW.preset.nm,ab:CW.preset.ab};
  var nm=(g('cwName').value||'').trim();
  var ab=(g('cwAb').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  var pc=cwGet(CW.pick);
  if(!nm)nm=pc.nm;
  if(ab.length<2)ab=cwAbbrev(nm);
  if(nm.length<2)return {err:'name needs at least 2 characters'};
  if(!cwNameOk(nm)||!cwNameOk(ab))return {err:'keep it clean — that one won\u2019t fly'};
  return {id:CW.pick,nm:nm.slice(0,18),ab:ab.slice(0,3)};
}
function cwDeny(msg){
  var box=g('cwNameBox');box.classList.remove('deny');void box.offsetWidth;box.classList.add('deny');
  g('cwNameErr').textContent=msg;
  if(window.BKAudio)BKAudio.sfx('miss');
}
function cwSyncRow(){var el=g('cwCur');if(!el)return;var e0=setupCfg.cw[0];
  el.textContent=e0?(typeof e0==='object'?e0.nm:(cwGet(e0)||{}).nm):'Orange';}
g('cwOpen').addEventListener('click',function(){buildColorsScreen('rules');show('colors');});
g('cwLock').addEventListener('click',function(){
  if(CW.mode!=='rules'||CW.pick){
    var ident=cwIdent();
    if(ident.err){cwDeny(ident.err);return;}
  }
  if(window.BKAudio)BKAudio.sfx('score');
  if(CW.mode==='win'){
    setupCfg.cw[setupCfg.theCall.winner]=ident;
    netEv({a:'cw',team:setupCfg.theCall.winner,cw:ident});
    cwAdvance();
    return;
  }
  if(CW.mode==='lose'){
    var loser=1-setupCfg.theCall.winner;
    setupCfg.cw[loser]=ident;
    netEv({a:'cw',team:loser,cw:ident});
    cwAdvance();
    return;
  }
  setupCfg.cw[0]=CW.pick?ident:null;         /* rules mode: null = classic Orange */
  try{CW.pick?localStorage.setItem('bk_cw',JSON.stringify(ident)):localStorage.removeItem('bk_cw')}catch(e){}
  cwSyncRow();
  if(lockerReturn())return;
  show('rules');
});
g('cwBack').addEventListener('click',function(){
  if(CW.mode==='rules'){if(lockerReturn())return;show('rules');return;}
  if(NET.on)return;                /* online spoils are synced — no stepping back */
  if(CW.mode==='lose'){buildColorsScreen('win');show('colors');return;}
  show('tossup');                  /* winner reconsiders THE CALL */
});
/* ===== NAME YOUR SQUADS (pass&play, before the toss-up) ===== */
function startNames(mode){
  NAMES_MODE=mode||'local';
  var one=NAMES_MODE!=='local';   /* every mode but hot-seat names ONE squad here */
  g('nmCardB').style.display=one?'none':'';
  g('screen-names').querySelector('.setup-eyebrow').textContent=
    NAMES_MODE==='solo'?'Vs CPU · Squad first'
    :NAMES_MODE==='host'?'Online · Your squad first'
    :NAMES_MODE==='guest'?'Online · Suit up':'Local VS · Squads first';
  g('nmCardA').querySelector('.who').textContent=
    NAMES_MODE==='solo'?'Your squad · the machine names itself'
    :NAMES_MODE==='host'?'Your squad · your friend names theirs on their phone'
    :NAMES_MODE==='guest'?'Your squad · the room is waiting'
    :'Squad one · holds the phone first';
  g('nmGo').textContent=NAMES_MODE==='local'?'To the toss-up →':(NAMES_MODE==='guest'?'Lock it in →':'To the picking →');
  /* guests suggest a different name than hosts — two empty phones must never
     fall back to the same squad */
  g('nmA').placeholder=NAMES_MODE==='guest'?'The Bricks':'Showtime';
  g('nmAb').placeholder=NAMES_MODE==='guest'?'BRK':'SHO';
  if(NAMES_MODE!=='guest')setupCfg.names=null;   /* guests keep the host's name */
  var saved=null;try{saved=JSON.parse(localStorage.getItem('bk_cw')||'null')}catch(e){}
  g('nmA').value=(saved&&saved.nm)||'';g('nmAb').value=(saved&&saved.ab)||'';
  g('nmSaved').style.display=(saved&&saved.nm)?'':'none';
  g('nmB').value='';g('nmBb').value='';
  g('nmErr').textContent='';
  show('names');
}
function nmIdent(nEl,abEl,fallback){
  var nm=(g(nEl).value||'').trim();
  var ab=(g(abEl).value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  var sug=!nm;   /* empty field = take the advertised suggestion, abbrev included */
  if(!nm)nm=fallback;
  if(ab.length<2)ab=(sug&&g(abEl).placeholder)||cwAbbrev(nm);
  if(nm.length<2)return {err:'names need at least 2 characters'};
  if(!cwNameOk(nm)||!cwNameOk(ab))return {err:'keep it clean \u2014 that one won\u2019t fly'};
  return {nm:nm.slice(0,18),ab:ab.slice(0,3)};
}
/* the tag says "tap to change" — once they do, it's their entry, not a memory */
['nmA','nmAb'].forEach(function(id){
  g(id).addEventListener('input',function(){g('nmSaved').style.display='none';});
});
g('nmGo').addEventListener('click',function(){
  var solo=NAMES_MODE!=='local';
  /* empty fields fall back to the PLACEHOLDER names the screen advertises —
     never to Orange/Blue (Aaron: squad two rode as BLUE through all of setup) */
  var a=nmIdent('nmA','nmAb',g('nmA').placeholder),b=solo?{nm:'',ab:''}:nmIdent('nmB','nmBb',g('nmB').placeholder);
  var err=a.err||b.err;
  if(!err&&!solo&&a.nm.toLowerCase()===b.nm.toLowerCase())err='two squads, two names';
  if(err){
    g('nmErr').textContent=err;
    var card=a.err?g('nmCardA'):g('nmCardB');
    card.classList.remove('deny');void card.offsetWidth;card.classList.add('deny');
    if(window.BKAudio)BKAudio.sfx('miss');
    return;
  }
  var me=(NAMES_MODE==='guest')?1:0;
  setupCfg.names=setupCfg.names||[null,null];
  if(NAMES_MODE==='local'){setupCfg.names=[a,b];}else{setupCfg.names[me]=a;}
  applyColors(setupCfg.names[0],setupCfg.names[1]);
  if(window.BKAudio)BKAudio.sfx('score');
  if(NAMES_MODE==='guest'){
    netEv({a:'name',team:1,id:a});
    netEv({a:'housed'});
    navSlam(startTossup);
  }else if(NAMES_MODE==='local'){navSlam(startTossup);}
  else{navSlam(function(){show('league')});}
});
var NAMES_MODE='local';
g('nmBack').addEventListener('click',function(){show('title')});
/* the online color sequence: winner -> loser -> the loser's court pick */
function startColorCall(){
  setupCfg.cw=[null,null];
  var winner=setupCfg.theCall.winner;
  if(NET.role===winner){buildColorsScreen('win');show('colors');}
  else netVeil('<b>'+teamName(winner)+' won the tip.</b><br>They suit up first — THE CALL…');
}
function cwAdvance(){
  var winner=setupCfg.theCall.winner,loser=1-winner;
  if(setupCfg.cw[winner]&&!setupCfg.cw[loser]){
    /* winner locked — loser picks against them */
    if(!NET.on){buildColorsScreen('lose',setupCfg.cw[winner]);show('colors');return;}
    if(NET.role===loser){netVeil('');buildColorsScreen('lose',setupCfg.cw[winner]);show('colors');}
    else netVeil('<b>Your colors are locked.</b><br>'+teamName(loser)+' is suiting up…');
    return;
  }
  if(setupCfg.cw[winner]&&setupCfg.cw[loser]){
    applyColors(setupCfg.cw[0],setupCfg.cw[1]);
    if(!NET.on){
      /* parity with online: the toss-up LOSER sets the scene here too */
      buildCourtsScreen('tossup');show('courts');return;
    }
    startCourtCall();
  }
}
/* pass&play: both squads suit up right after the call — winner first */
function localColorCall(){
  setupCfg.cw=[null,null];
  buildColorsScreen('win');show('colors');
}
function beginMatch(){
  /* ONLINE: both phones run the real squad reveal, taking turns in the order THE
     CALL decided. This is where the "+2 shuffles" prize finally pays out — it was
     inert while online used its own stripped pick screen. */
  if(srOnline()){setupCfg.rosters=null;buildSquadScreen();return;}
  /* solo / hot-seat: your saved colorway leads, the other side auto-contrasts —
     but a hot-seat SECOND PICK from the call is sacred, never recomputed */
  var myCw=setupCfg.cw[0]||(setupCfg.names&&setupCfg.names[0])||null;
  var cfg={league:setupCfg.league,decade:setupCfg.decade,
    packs:(setupCfg.packs||[]).slice(),
    target:setupCfg.target,
    rosters:setupCfg.rosters||pickRosters(setupCfg.league,setupCfg.decade),
    bracketMode:setupCfg.bracketMode,brackets:setupCfg.brackets.slice(),
    court:setupCfg.court,
    colors:[myCw,(function(){
      if(setupCfg.cw[1])return setupCfg.cw[1];   /* hot-seat loser picked this */
      var myId=(typeof myCw==='object'&&myCw)?myCw.id:myCw;
      /* names-only still gets a REAL colorway identity — the CPU must never
         ride as "Blue" (contrast handles a null pick vs default orange) */
      var oid=cwContrast(myId);
      var oc=oid&&cwGet(oid);
      return oc?{id:oc.id,nm:oc.nm,ab:cwAbbrev(oc.nm)}:null;})()]};
  setupCfg.rosters=cfg.rosters;
  /* suit both squads up NOW — the versus screen reads TEAM[], and startGame's
     own applyColors comes too late for it (CPU showed as Blue on the marquee) */
  applyColors(cfg.colors[0],cfg.colors[1]);
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
  d.innerHTML='<span class="sp">'+pos+'</span><span class="sn">'+pl.n+'</span><span class="snum">'+(pl.num!=null?'#'+pl.num:'')+'</span>';
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
  g('pickWho').textContent='You are '+teamName(me).toUpperCase();
  g('pickWho').style.color=teamCol(me);
}
function pickStatusLine(){
  var mine=pickCfg.locked[NET.role],other=pickCfg.locked[1-NET.role];
  g('pickStatus').innerHTML=(mine?'<b style="color:#5fd06a">✓</b> <b>Locked.</b> ':'Shuffle until it feels right — then lock it. ')+
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
  var vA=g('vsNmA'),vB=g('vsNmB');
  if(vA)vA.textContent=teamName(0);
  if(vB)vB.textContent=teamName(1);
  /* the lightning strikes in the squads' REAL colors: each arm hue-rotates
     from its baked base (orange arm ~28deg, blue arm ~212deg) to the team hue */
  var bA=g('boltA'),bB=g('boltB');
  if(bA&&bB){
    bA.style.setProperty('--tint',Math.round(cwHsl(TEAM[0].p).h-28)+'deg');
    bB.style.setProperty('--tint',Math.round(cwHsl(TEAM[1].p).h-212)+'deg');
  }
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
  if(window.BKCoach)tgl('setCoach',BKCoach.on());
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
  netPoke();   /* start waking the server NOW — it warms while they read/type */
  var gt=g('glGate');if(gt)gt.classList.remove('on','leaving');
  oStatus('Pick one — I’m already waking the server for you.');
  var fr=g('frReveal');if(fr)fr.classList.remove('on');   /* fresh entry — no stale code */
  var ob=g('frOtp');if(ob){var bs=ob.querySelectorAll('input');for(var i=0;i<bs.length;i++){bs[i].value='';bs[i].classList.remove('filled');}}
  var hc=g('oCode');if(hc)hc.value='';
  navSlam(function(){show('online');gateProbe();});
});
/* ask the bouncer at the DOOR — nobody walks all of room setup just to get
   carded at the end. Quietly dials, sends the stored pass; if the run is
   invite-only and the pass doesn't fly, the gate drops immediately. */
function gateProbe(){
  GATE.probe=true;
  netDial(oStatus,function(err){
    if(err){GATE.probe=false;return;}   /* unreachable — create/join will surface it */
    netSend({t:'access',code:passGet()});
  });
}
g('oBack').addEventListener('click',function(){
  netHangUp();                       /* walking away cancels any dial loop */
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
  netPoke();   /* creator walks league->era->rules first — perfect warm-up time */
  ROOMSET=true;CPU.on=false;
  var fr=g('frReveal');if(fr)fr.classList.remove('on');
  oStatus('');
  setupCfg.rosters=null;
  startNames('host');   /* the game never says Orange — name first, every mode */
}
function dialFail(retry){
  oStatus('<b style="color:#ff7a5c">✗</b> <b>Couldn’t wake the server.</b> Rare, but it happens — '+
    '<u id="oRedial" style="cursor:pointer">tap to redial</u>.');
  var rd=g('oRedial');if(rd)rd.onclick=retry;
}
function dialCreate(){
  GATE.pend={k:'create'};
  netDial(oStatus,function(err){
    if(err){dialFail(dialCreate);return}
    netSend({t:'create',pass:passGet()});
  });
}
function dialJoin(code){
  GATE.pend={k:'join',code:code};
  netDial(oStatus,function(err){
    if(err){dialFail(function(){dialJoin(code)});return}
    netSend({t:'join',code:code,pass:passGet()});
  });
}
function roomsetFinish(){
  ROOMSET=false;
  show('online');
  dialCreate();
}
/* ===== THE GUEST LIST (access gate) =======================================
   Online play can be invite-only: the relay holds the list (BK_ACCESS env).
   The client stays permissive — create/join go straight through carrying the
   stored pass, and the gate only DROPS IN when the bouncer actually says no.
   Checking a code doubles as the server wake (the dial runs underneath). */
function passGet(){try{return localStorage.getItem('bk_pass')||''}catch(e){return ''}}
function passSet(v){try{v?localStorage.setItem('bk_pass',v):localStorage.removeItem('bk_pass')}catch(e){}}
var GATE={pend:null,try:''};
function gateShow(pend,note){
  GATE.pend=pend||null;
  var gt=g('glGate'),cards=document.querySelector('#screen-online .fr-cards'),rv=g('frReveal');
  if(cards)cards.classList.add('fr-hidden');
  if(rv)rv.classList.remove('on');
  gt.classList.remove('leaving');gt.classList.add('on');
  g('glCard').classList.remove('stamped','deny');
  g('glStatus').innerHTML=note||'';
  oStatus('');
  var inp=g('glCode');inp.value='';setTimeout(function(){inp.focus()},350);
}
function gateHide(){
  var gt=g('glGate');
  gt.classList.add('leaving');
  setTimeout(function(){
    gt.classList.remove('on','leaving');
    var cards=document.querySelector('#screen-online .fr-cards');
    if(cards)cards.classList.remove('fr-hidden');
  },430);
}
function gateSubmit(){
  var code=(g('glCode').value||'').toUpperCase().trim();
  var card=g('glCard');
  if(!code){card.classList.remove('deny');void card.offsetWidth;card.classList.add('deny');return;}
  GATE.try=code;
  g('glGo').disabled=true;
  netDial(function(m){g('glStatus').innerHTML='Checking the list&hellip; '+m},function(err){
    if(err){g('glGo').disabled=false;
      g('glStatus').innerHTML='&#10060; <b>Couldn&rsquo;t reach the bouncer.</b> Try again in a moment.';return;}
    netSend({t:'access',code:code});
  });
}
function gatePassed(){
  passSet(GATE.try);
  var card=g('glCard');card.classList.remove('deny');card.classList.add('stamped');
  g('glStatus').innerHTML='&#127903;&#65039; <b>You&rsquo;re in.</b>';
  if(window.BKAudio)BKAudio.sfx('score');
  setTimeout(function(){
    gateHide();g('glGo').disabled=false;
    var pd=GATE.pend;GATE.pend=null;
    /* the access dial left the socket OPEN — fire the held action through it */
    if(pd&&pd.k==='create')netSend({t:'create',pass:passGet()});
    else if(pd&&pd.k==='join')netSend({t:'join',code:pd.code,pass:passGet()});
    else if(pd&&pd.k==='rejoin')attemptRejoin();
  },950);
}
function gateDenied(){
  g('glGo').disabled=false;
  var card=g('glCard');card.classList.remove('deny');void card.offsetWidth;card.classList.add('deny');
  g('glStatus').innerHTML='&#128683; <b>Not on the list.</b> Check the code with Aaron &mdash; it has to be current.';
  if(window.BKAudio)BKAudio.sfx('miss');
}
(function(){
  var go=g('glGo'),inp=g('glCode');
  if(!go)return;
  go.addEventListener('click',gateSubmit);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')gateSubmit();});
  inp.addEventListener('input',function(){this.value=this.value.toUpperCase();});
})();
g('oCreate').addEventListener('click',roomsetBegin);
g('oJoin').addEventListener('click',function(){
  CPU.on=false;
  var code=(g('oCode').value||'').toUpperCase().trim();
  if(code.length!==4){oStatus('Enter the 4-letter code your friend sent you.');return}
  dialJoin(code);
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
  decade:['Eras','Tap one era or MIX several — ’70s + 2000s? Go wild. ALL-TIME deals from every era. Your squads come from whatever you pick.'],
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
   startStealTry, tipBuzz/tipAnswer, meterResolve, resolvePending; card
   battles ride showCard/resolvePending like every other card).
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
/* the machine thinks on a pausable clock, and re-checks on landing: a decision
   scheduled just before a coach card appeared must not commit behind it */
function cpuThink(fn){CPU.busy=true;CPU.timer=fTimeout(function(){CPU.busy=false;CPU.timer=null;if(!CPU.on||gameFrozen())return;fn()},cpuRnd(cpuLvl().think))}
function cpuRollCard(tier){var acc=cpuLvl().card;return Math.random()<(acc[Math.min(tier,3)-1]||0.4)}
function cpuMeterPos(){
  /* upside-only meter: this only fires on the CPU's CONTESTED shots, and its
     perfect-rate (meter[0]) is its chance to DENY your block card. Rookie
     almost never takes that card away; the All-Star often will. Anything
     short of perfect just means the contest plays out — same rule you play by. */
  var m=cpuLvl().meter;
  if(Math.random()<m[0])return 0.5;                      /* perfect — block denied */
  return 0.5+(Math.random()<0.5?-1:1)*(0.09+Math.random()*0.38); /* the contest is live */
}
/* ---- the turn watcher: acts only when the engine is idle, waiting on the CPU ---- */
function cpuTick(){
  if(!CPU.on||!state||NET.on||CPU.busy)return;
  if(gameFrozen())return;    /* it does not get to play your opponent's turn
                                while the screen says GAME PAUSED */
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
  var tiles=cpuLegalTiles(hi,rangeOf(hp));
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
    var ts=cpuLegalTiles(i2,rangeOf(p2));
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
  coach:{startGame:startGame,pickRosters:pickRosters,applyColors:applyColors,
    show:show,refit:refit,drill:DRILL,cpu:CPU,net:NET,screens:screens,
    state:function(){return state},battle:function(){return battle},startBattle:startTapBattle,
    freeze:freezeGame,thaw:thawGame,frozen:gameFrozen},
  mode:function(){return {league:MODE.label,cols:COLS,rows:ROWS,half:MODE.half}},
  tipAnswer:tipAnswer,
  tileToScreen:function(c,r){var tc=tileCenter(c,r);return proj(tc[0],tc[1],0)},
  rz:function(){return RZ},
  defRange:function(i){return defSlideRange(state.pieces[i])},
  _set:function(i,c,r){state.pieces[i].c=c;state.pieces[i].r=r},
  _tap:tapAt,_zoom:function(z){ZOOM=z;fitDirty=true},
  _meter:function(){return meter},_grade:gradeMeter,
  freeze:freezeGame,thaw:thawGame,frozen:gameFrozen,
  /* the question gate, exposed for the harness: era scoping is the one thing a
     screenshot cannot prove, so it has to be assertable */
  _eraOk:eraOk,_leagueOk:leagueOk,_poolCount:packTotal,_pickQ:pickQuestion,
  _qWeight:qWeight,_rosterPids:rosterPids,_pickQIdx:pickQuestionIdx,
  _frz:function(){return {on:FRZ.on,live:FRZ.list.length,armed:FRZ.list.filter(function(t){return !!t.id}).length}},
  _pickQ:function(t){return pickQuestion(t)},_tuPick:tuPickQI,
  _pending:function(){return pending?pending.type:null},
  _net:function(){return NET},_pick:function(){return pickCfg},
  _settings:function(){return window.BKAudio?BKAudio.settings:null},
  _focus:function(){return FOCUS},_last:function(){return lastPlay},_replay:replayPlay,
  _poss:newPossession,_clock:function(){return state&&state.clock},
  _cfg:function(){return setupCfg},
  _deal:function(s,ex){return srPickSquad(s,ex||[])},
  _court:applyCourt,_courtName:courtName,_tint:function(){return TINT},
  _colors:applyColors,_team:function(){return TEAM},_nameOk:cwNameOk,
  _dialCfg:function(){return DIAL},
  _dealDb:function(s,ex){return dbPickSquad(s,ex||[])},
  _cpu:function(){return CPU},
  _tu:function(){return TU},
  _end:function(){endGame()},
  /* soundtrack: which song the current moment calls for, and the real endShow
     so the win/lose choice can be asserted without playing out a whole game */
  _musicWant:musicWant,_endShow:endShow,_endMood:function(){return endMood},
  _defMarks:defenderMarks,_screened:screenedSet,_guards:guards,
  _driveChallenge:driveChallenge,
  _show:show, /* screen nav for harnesses/screenshots — same fn the buttons call */
  _buildLocker:buildLocker,
  _gate:PACKGATE,_gateOk:gateOk,_pickQuestionIdx:pickQuestionIdx,
  _heatCard:heatCard,_heatScore:heatScore,_heatOffenseChange:heatOffenseChange,
  _HEAT:HEAT,_rangeOf:rangeOf,_heatDealTier:heatDealTier,_heatHud:heatHud,
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
  _skin:skinSet,   /* dev/preview: court skins — {bg,floor,tileAlpha,scrim} */
  _stat:srStatLine,_acc:srAccolade,
  startCpu:function(level,league){
    /* dev/test entry: instant CPU game — real menu flow comes with the mode UI */
    CPU.on=true;CPU.team=1;CPU.level=level||'pro';
    var lg=league||'nba';setupCfg.league=lg;setupCfg.decade=['FULL'];setupCfg.packs=[];
    var a=srPickSquad(2,[]),ex=[];
    MODES[lg].lineup.forEach(function(p){ex.push(a[p].n)});
    var b=cpuAutoSquad(ex);
    startGame({league:lg,decade:['FULL'],target:11,rosters:[a,b]});
    markGame(true);show('game');
  },
  start:startGame, show:show
};
})();

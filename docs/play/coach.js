/* ============================================================================
   COACH — the tutorial layer. Two halves:
   1. COACH TIPS: first-time pop-ups during real games. Non-blocking card,
      each situation fires ONCE per phone (bk_coach_seen), master toggle in
      the Control Room + "coach off" on every tip (bk_coach, default ON).
   2. DRILLS: from the Rulebook, RUN THE DRILL boots a sandbox (Big3 half
      court, real engine, resume-mode so no tip-off, frozen clocks, t:0
      cards) and the Coach — the Philosopher — walks the player through it,
      advancing by WATCHING the live state (no engine forks).
   Load order: after game.js — leans on its globals (state, g, show,
   startGame, pickRosters, applyColors, DRILL, ICO).
   ========================================================================== */
(function(){
'use strict';
function $(id){return document.getElementById(id)}
function K(){return window.BK&&BK.coach}
function S(){var k=K();return k?k.state():null}

/* ---------- persistence ---------- */
function coachOn(){try{return localStorage.getItem('bk_coach')!=='0'}catch(e){return true}}
function coachSet(v){try{localStorage.setItem('bk_coach',v?'1':'0')}catch(e){} paintCoachSwitch();}
function seen(){try{return JSON.parse(localStorage.getItem('bk_coach_seen')||'{}')}catch(e){return {}}}
function markSeen(k){var s=seen();s[k]=1;try{localStorage.setItem('bk_coach_seen',JSON.stringify(s))}catch(e){}}
window.BKCoach={on:coachOn,set:coachSet,replay:coachReplay,seen:coachSeenCount,
  tipUp:function(){return !!(tipEl&&tipEl.classList.contains('on')&&tipEl.dataset.pause==='1')},
  /* EVENT-DRIVEN tips: the poller can't see a moment that has already passed,
     so the engine calls this for one-shot beats (ON FIRE). Same seen-once
     store, same pause rules — Aaron 08-02: "have the coach pop up and explain
     on fire the first time, and then not after". */
  tip:function(key,txt,sticky){tipShow(key,txt,sticky)},
  /* THE COACH ON A MENU SCREEN, added 08-07 for the first-run welcome.
     Same card, same seen-once store, same Coach-off button — deliberately, so
     there is ONE coach and not a second thing that looks like him. What it
     does NOT do is freeze: tipShow pauses the engine because a tip mid-game
     must stop the clock, and calling freeze() on the title screen would be
     asking the game to pause a game that is not running. So `menu` is a third
     mode alongside modal and quiet-corner, not a flag on an existing one. */
  say:function(key,txt,action,spot){tipShow(key,txt,true,true,action,spot)},
  hide:function(){tipHide()}};   /* the engine force-hides on restart / exit */

/* ---------- the tip card ---------- */
var tipEl=null,tipVeil=null,tipTimer=null;
function netOn(){return K()&&K().net&&K().net.on}
function tipShow(key,txt,sticky,menu,action,spot){
  if(!coachOn()||(K()&&K().drill.on))return;
  var s=seen();if(s[key])return;markSeen(key);
  if(!tipEl){
    tipVeil=document.createElement('div');tipVeil.id='coachVeil';
    document.body.appendChild(tipVeil);
    tipEl=document.createElement('div');tipEl.id='coachTip';
    tipEl.innerHTML='<img src="assets/brand/philosopher.png" alt="" class="ct-face">'+
      '<div class="ct-body"><div class="ct-who">COACH · GAME PAUSED</div><div class="ct-txt"></div>'+
      '<div class="ct-row"><button class="ct-ok">Got it →</button>'+
      '<button class="ct-off">Coach off</button></div></div>';
    document.body.appendChild(tipEl);
    tipEl.querySelector('.ct-ok').addEventListener('click',tipHide);
    tipEl.querySelector('.ct-off').addEventListener('click',function(){coachSet(false);tipHide();});
  }
  /* solo & hot-seat: a REAL pause — backdrop blocks the game and the whole
     engine holds (BK.coach.freeze). Online: a quiet corner card, nothing
     frozen, because stopping one phone would desync the room. */
  /* menu: modal LOOK (it should command the screen on an empty title page)
     without touching the engine, because there is no game to freeze. */
  var pause=!menu&&!netOn();
  tipEl.classList.toggle('modal',pause||!!menu);
  tipEl.classList.toggle('onmenu',!!menu);
  tipEl.dataset.pause=pause?'1':'0';
  tipEl.querySelector('.ct-who').textContent=
    menu?'COACH':(pause?'COACH · GAME PAUSED':'COACH');
  /* THE VEIL, AND THE HOLE IN IT.
     First version dimmed the whole menu and the harness caught it instantly:
     the card says "tap the logo" and the veil was sitting on the logo. The
     answer was NOT to drop the veil -- it is Aaron's own Coldest Call pattern,
     filed in V0 on 08-05 and asked for by name on 08-07: *"the screen should
     blur or fade and the thing we are referencing should be highlighted"*.
     So the world dims AND the subject is cut out of the dim and ringed. One
     target for the eye, and the target is still tappable. */
  if(pause){tipVeil.classList.add('on');K()&&K().freeze&&K().freeze();}
  else if(!spot)tipVeil.classList.remove('on');
  spotlight(spot);
  tipEl.querySelector('.ct-txt').innerHTML=txt;
  /* AND GIVE THEM THE BUTTON. Telling somebody to go and tap something else is
     a worse offer than doing it for them, so a menu tip may carry one primary
     action. The logo stays the permanent handle afterwards; this is the
     first-run shortcut, not a replacement for it. */
  var old=tipEl.querySelector('.ct-do');if(old)old.remove();
  if(action&&action.label){
    var btn=document.createElement('button');
    btn.className='ct-do';btn.type='button';btn.textContent=action.label;
    btn.addEventListener('click',function(){tipHide();action.fn&&action.fn();});
    tipEl.querySelector('.ct-row').insertBefore(btn,tipEl.querySelector('.ct-ok'));
    tipEl.querySelector('.ct-ok').textContent='Not now';
  }else{
    tipEl.querySelector('.ct-ok').textContent='Got it \u2192';
  }
  tipEl.classList.add('on');
  if(tipTimer)clearTimeout(tipTimer);
  if(!sticky&&!pause)tipTimer=setTimeout(tipHide,12000);  /* paused tips wait for YOU */
}
/* ---------- the spotlight (Coldest Call, part 1 and 2) ---------- */
var spotEl=null,spotSel=null,spotRaf=null;
function spotlight(sel){
  spotSel=sel||null;
  if(!spotSel){
    if(spotEl)spotEl.classList.remove('on');
    if(tipEl)tipEl.classList.remove('below');
    window.removeEventListener('resize',spotMove);
    return;
  }
  if(!spotEl){
    spotEl=document.createElement('div');spotEl.id='coachSpot';
    spotEl.setAttribute('aria-hidden','true');
    document.body.appendChild(spotEl);
  }
  spotEl.classList.add('on');
  window.addEventListener('resize',spotMove);
  spotMove();
  /* Follow for a beat: the title screen animates in, so a rect measured at
     frame zero is the wrong rect by frame thirty. Cheap and it stops. */
  var t0=Date.now();
  (function follow(){
    spotMove();
    if(Date.now()-t0<1400)spotRaf=requestAnimationFrame(follow);
  })();
}
function spotMove(){
  if(!spotEl||!spotSel)return;
  var t=document.querySelector(spotSel);
  if(!t){spotEl.classList.remove('on');return}
  var r=t.getBoundingClientRect();
  var pad=12,d=Math.max(r.width,r.height)+pad*2;
  spotEl.style.width=spotEl.style.height=d+'px';
  spotEl.style.left=(r.left+r.width/2-d/2)+'px';
  spotEl.style.top=(r.top+r.height/2-d/2)+'px';
  /* Part 4 of the pattern: the card MOVES to its subject. If the hole is in
     the top half, the card sits below it; otherwise above. Either way it never
     parks on the thing it is pointing at. */
  if(tipEl)tipEl.classList.toggle('below',r.top+r.height/2<window.innerHeight*0.5);
}

function tipHide(){
  spotlight(null);
  if(spotRaf){cancelAnimationFrame(spotRaf);spotRaf=null;}
  if(tipEl)tipEl.classList.remove('on');
  if(tipVeil)tipVeil.classList.remove('on');
  if(tipTimer){clearTimeout(tipTimer);tipTimer=null;}
  if(K()&&K().thaw)K().thaw();     /* play resumes with the time it had left */
}

/* ---------- situation watcher (real games only) ---------- */
var veil=function(id){var e=$(id);return e&&e.classList.contains('on')};
var TIP_TEXT={
  first:'First time? I’ll chime in as things come up — or hit <b>Coach off</b> and run solo. (You can flip me back on in ⚙ Settings.)',
  select:'<b>Your possession.</b> Tap one of your players — their reachable tiles light up. Orange = free, <b>red = a crossover challenge</b>.',
  confirm:'Nothing fires until you hit <b>Confirm ✓</b> — stray thumbs can’t burn a possession.',
  card:'<b>Answer to play.</b> Right answer = the move happens. Wrong = brick, steal, or wasted move — depends on the play.',
  meter:'<b>The release meter — pure bonus.</b> Tap to lock the sweeping marker: dead center DENIES the defender’s block card and rises clean. Anywhere else, the contest plays out on cards. It can’t shank your shot — only knowledge takes points off the board.',
  slide:'<b>Defense slides after every action.</b> Move one defender (up to one tile less than his speed) — or go for a steal if you’re next to the ball.',
  cross:'<b>Red tile = crossover duel.</b> You answer, then the defender answers to stay in front. Both right → ANKLE BATTLE tap-off.',
  battle:'<b>Sudden-death cards.</b> The team without the edge answers first — the FIRST wrong answer loses the battle. Both right? Harder cards, again.',
  tip:'<b>Jump ball.</b> Slap your zone the moment you know the answer — first buzz gets first crack at it.',
  inbound:'<b>Inbound.</b> The inbounder can’t move or shoot — set up ONE cutter if you like, then tap a teammate to put it in play.'
};
setInterval(function(){
  if(!coachOn()||(K()&&K().drill.on))return;
  if(!K()||!K().screens.game.classList.contains('on'))return;
  if(tipEl&&tipEl.classList.contains('on'))return;   /* one tip at a time */
  /* never stack a tip on a screen that is already holding the player: the
     pause menu, the victory screen, the help card, or the Rulebook opened
     over the game. A tip buried under those burns its one-time flag unseen. */
  if(veil('pauseveil')||veil('endveil')||veil('hintveil'))return;
  if(document.querySelector('.screen.ontop'))return;
  var st=S();if(!st)return;
  var cpu=K().cpu;
  /* ONLINE: no coach, full stop. The freeze is a deliberate no-op in net games
     (you can't pause the other phone), so a tip would sit over a LIVE clock
     and cost real seconds. Teaching happens in CPU/local/drills. (Aaron 07-29) */
  if(netOn())return;
  var s=seen();
  /* the coach says hello ASAP — BEFORE the jumbotron and jump ball, not after
     (Aaron 07-29: "the coach should show up ASAP"; the old off-select wait made
     the hello arrive minutes late whenever the CPU won the tip). The whole
     tip-off chain runs on fTimeout, so the freeze HOLDS it mid-cinematic. */
  if(!s.first){tipShow('first',TIP_TEXT.first,true);return;}
  /* the rest of the opening is cinematic — jumbotron, whistle, jump ball.
     Nothing there needs a tip, and firing one used to blanket the tip-off. */
  if(veil('jumboveil'))return;
  if(veil('tipveil'))return (cpu.on?null:tipShow('tip',TIP_TEXT.tip));
  if(veil('qveil'))return tipShow('card',TIP_TEXT.card);
  if(veil('meterveil'))return tipShow('meter',TIP_TEXT.meter);
  if(K().battle&&K().battle())return tipShow('battle',TIP_TEXT.battle);
  var sb=$('stagebox');
  if(sb&&/crossover/i.test(sb.textContent))return tipShow('cross',TIP_TEXT.cross);
  if(sb&&/Confirm/.test(sb.textContent))return tipShow('confirm',TIP_TEXT.confirm);
  /* same CPU guard slide/select always had: don't hand the player instructions
     for a turn that isn't theirs (and don't burn the one-time tip on it) */
  if(st.inbPending&&!(cpu.on&&cpu.team===st.offense))return tipShow('inbound',TIP_TEXT.inbound);
  if(st.phase==='def-slide'&&!(cpu.on&&cpu.team===1-st.offense))return tipShow('slide',TIP_TEXT.slide);
  if(st.phase==='off-select'&&!(cpu.on&&cpu.team===st.offense))return tipShow('select',TIP_TEXT.select);
},700);

/* ---------- the Control Room switch ---------- */
function paintCoachSwitch(){var sw=$('setCoach');if(sw)sw.classList.toggle('on',coachOn());paintCoachSeen();}
/* AARON, 08-01: "is there a feature to reactivate the coach if you have already
   had the coach before?" There was not. The on/off switch only gated FUTURE
   tips -- every tip that had already fired was marked seen forever in
   bk_coach_seen, so switching the Coach back on brought nothing back and the
   setting looked broken. This clears that memory, which is what "again" means. */
function coachSeenCount(){var n=0,s=seen();for(var k in s)n++;return n;}
function paintCoachSeen(){
  var sub=$('coachSeenSub');if(!sub)return;
  var n=coachSeenCount();
  sub.textContent=n?(n+' tip'+(n===1?'':'s')+' already used up on this phone — this re-arms them all')
                   :'nothing used up yet — every tip is still waiting';
}
function coachReplay(){
  try{localStorage.removeItem('bk_coach_seen')}catch(e){}
  if(!coachOn())coachSet(true);            /* "again" implies ON */
  paintCoachSwitch();
  var b=$('coachReset');
  if(b){var t=b.textContent;b.textContent='Re-armed \u2713';
        setTimeout(function(){b.textContent=t},1600);}
  if(window.BKAudio)BKAudio.sfx('select');
}
document.addEventListener('DOMContentLoaded',function(){
  var sw=$('setCoach');
  if(sw){sw.addEventListener('click',function(){coachSet(!coachOn())});paintCoachSwitch();}
  var rb=$('coachReset');
  if(rb)rb.addEventListener('click',coachReplay);
});

/* ============================ DRILLS ==================================== */
/* Each drill: Big3 sandbox vs THE COACH. steps advance when done(state)
   turns true; the last step completing shows the diploma. */
function pc(team,pos,c,r){return {team:team,pos:pos,c:c,r:r}}
var DRILLS={
  basics:{nm:'Moving the rock',allow:['move','slidemove'],steps:[
    {say:'This is your squad (orange). <b>Tap your point guard</b> — his reachable tiles light up.',
     done:function(){return S().selected!=null&&S().pieces[S().selected].team===0}},
    {say:'Orange tiles are free. <b>Tap one, then hit Confirm ✓</b>.',
     done:function(){return S().phase==='def-slide'||S().phase!=='off-select'&&!S().staged&&S().selected==null}},
    {say:'See that? After every offensive action the DEFENSE slides one man. In a real game your opponent does this — here, just hit <b>Stay put ▸</b>.',
     done:function(){return S().phase==='off-select'}},
    {say:'That’s the rhythm: you act, they slide. Class dismissed. 🎓',done:function(){return true}}]},
  pass:{nm:'Passing',allow:['pass','slidemove'],steps:[
    {say:'<b>Tap your ball-handler</b> (he’s got the rock under him).',
     done:function(){return S().selected===S().ball.holder}},
    {say:'Now <b>tap a teammate</b> — choose <b>Pass ✓</b> when it asks. Short passes are automatic; long ones ask a question.',
     done:function(){return S().ball.holder!==0||S().phase==='def-slide'}},
    {say:'Ball moved. Lane risk is real in games: a lurking defender near the lane turns a free swing into a question. Dismissed. 🎓',done:function(){return true}}]},
  shoot:{nm:'Shooting + the meter',allow:['shoot'],steps:[
    {say:'You’re parked in the paint — green means layup range — but Coach’s big man is CAMPED between you and the rim. A contested look. <b>Tap your man with the ball.</b>',
     done:function(){return S().selected===S().ball.holder}},
    {say:'Hit the big <b>SHOOT</b> button.',
     done:function(){return veil('qveil')}},
    {say:'<b>Answer the card.</b> Coach’s cards are layups — in real games the shot distance sets the difficulty. An OPEN look would splash right here; the big man is why the meter comes next.',
     done:function(){return !veil('qveil')}},
    {say:'The <b>release meter</b> — pure bonus. Dead center <b>DENIES the block card</b>. Anywhere else, Coach gets his say with a card. It can NOT shank your shot. Tap!',
     done:function(){return !veil('meterveil')&&(S().score[0]>0||veil('qveil')||S().phase==='off-select'||!!(K().battle&&K().battle()))}},
    {say:'That’s the whole deal: your right answer earned the look, and only a right answer can take it away. Perfect touch just silences the block. Dismissed. 🎓',done:function(){return true}}]},
  cross:{nm:'The crossover duel',allow:['move'],steps:[
    {say:'A defender is parked in your path — tiles PAST him glow <b>red</b>. <b>Tap your ball-handler.</b>',
     done:function(){return S().selected===S().ball.holder}},
    {say:'<b>Tap a red tile</b> behind the defender and Confirm — that’s a crossover challenge.',
     done:function(){return veil('qveil')}},
    {say:'<b>Answer up.</b> Beat it and HE answers to stay in front. Both right = ANKLE BATTLE.',
     done:function(){return !veil('qveil')&&!veil('rebveil')||S().phase==='off-select'||S().phase==='def-slide'}},
    {say:'However it fell — that’s the duel. Guards eat these; bigs on skates don’t. Dismissed. 🎓',done:function(){return true}}]},
  screen:{nm:'Setting a screen',allow:['move','slidemove'],steps:[
    {say:'Your handler’s lane is closed — red tiles past his man. Watch: <b>tap your OTHER player</b> (no ball).',
     done:function(){return S().selected!=null&&S().selected!==S().ball.holder&&S().pieces[S().selected]&&S().pieces[S().selected].team===0}},
    {say:'<b>Move him NEXT TO the defender</b> guarding your handler, choose Move ▸, Confirm. That body is a screen.',
     done:function(){var d=S().pieces.find(function(p){return p.team===1});
       return S().pieces.some(function(p){return p.team===0&&p!==S().pieces[S().ball.holder]&&d&&Math.max(Math.abs(p.c-d.c),Math.abs(p.r-d.r))===1})}},
    {say:'Look at the lane — <b>red tiles reopened</b>. A screened man can’t challenge the drive. Dismissed. 🎓',done:function(){return true}}]},
  steal:{nm:'Defense: slides & steals',allow:['steal'],offtrack:function(){return S().phase==='off-select'},steps:[
    {say:'You’re BLUE this time — defense. Orange just acted, so it’s your slide. <b>Tap your defender next to the ball-handler.</b>',
     done:function(){return S().selected!=null&&S().pieces[S().selected]&&S().pieces[S().selected].team===1}},
    {say:'See <b>'+'Go for the steal</b>? Hit it. You answer a card; then the handler answers to protect the rock.',
     done:function(){return veil('qveil')}},
    {say:'<b>Answer the card.</b> Both of you right = RIP OR GRIP tap-off, edge to the handler.',
     done:function(){return !veil('qveil')}},
    {say:'Steals are EARNED, never free — miss your reach and the slide is burned. Dismissed. 🎓',done:function(){return true}}]},
  rebound:{nm:'Battling for the boards',allow:['shoot'],steps:[
    {say:'Rebounds live off MISSES — so brick one on purpose. <b>Tap your handler, hit SHOOT, and answer WRONG.</b> Coach won’t tell.',
     done:function(){return !!(K().battle&&K().battle())}},
    {say:'<b>Sudden-death cards for the board.</b> Closest body gets the edge (answers second). You’re playing BOTH seats here — feel each one. First miss loses the glass.',
     done:function(){return !(K().battle&&K().battle())}},
    {say:'Knowledge wins the glass now — no thumb-mashing. Dismissed. 🎓',done:function(){return true}}]}
};
/* sandbox layouts (Big3 8×7 half court, single rim right side) */
var LAYOUT={
  basics:{pieces:[pc(0,'PG',1,3),pc(0,'SF',1,5),pc(1,'C',5,3)],holder:0,offense:0},
  pass:{pieces:[pc(0,'PG',2,2),pc(0,'SF',3,5),pc(0,'C',5,3),pc(1,'C',6,4)],holder:0,offense:0},
  /* shoot: the big man sits between shooter and rim (diagonal closeout) so the
     drill teaches the meter on a genuinely CONTESTED look — open looks skip it */
  shoot:{pieces:[pc(0,'PG',6,3),pc(1,'C',7,4)],holder:0,offense:0},
  cross:{pieces:[pc(0,'PG',3,3),pc(1,'SF',4,3),pc(1,'C',6,4)],holder:0,offense:0},
  screen:{pieces:[pc(0,'PG',2,3),pc(0,'C',2,5),pc(1,'SF',3,3)],holder:0,offense:0},
  steal:{pieces:[pc(1,'PG',3,4),pc(0,'PG',3,3),pc(0,'C',5,2)],holder:1,offense:0,defDrill:true},
  rebound:{pieces:[pc(0,'PG',5,2),pc(0,'C',6,4),pc(1,'C',6,2)],holder:0,offense:0}
};
var panel=null,exitBtn=null;
function coachPanel(html){
  if(!panel){
    panel=document.createElement('div');panel.id='coachPanel';
    panel.innerHTML='<img src="assets/brand/philosopher.png" alt="" class="ct-face">'+
      '<div class="cp-mid"><div class="cp-txt"></div></div>'+
      '<div class="cp-btns"><button class="cp-b" id="cpRestart">↺ Restart</button>'+
      '<button class="cp-b ghost" id="cpEnd">✕ End drill</button></div>';
    document.body.appendChild(panel);
    exitBtn=panel;  /* controls live IN the panel now */
    panel.querySelector('#cpRestart').addEventListener('click',function(){startDrill(K().drill.id)});
    panel.querySelector('#cpEnd').addEventListener('click',endDrill);
  }
  panel.querySelector('.cp-txt').innerHTML=html;
  panel.classList.add('on');
  panel.classList.remove('pop');void panel.offsetWidth;panel.classList.add('pop');
}
function coachHide(){if(panel)panel.classList.remove('on');}
var drillPoll=null;
function startDrill(id){
  var D=DRILLS[id],L=LAYOUT[id];if(!D||!L)return;
  tipHide();
  K().drill.on=true;K().drill.id=id;K().drill.step=0;
  K().drill.allow=D.allow||null;
  K().drill.deny=function(){
    if(window.BKAudio)BKAudio.sfx('miss');
    var st=D.steps[K().drill.step];
    coachPanel('<b>Stick to the drill!</b> '+(st?st.say:''));
    panel.classList.remove('shake');void panel.offsetWidth;panel.classList.add('shake');
  };
  K().cpu.on=false;K().net.on=false;
  var saved=null;try{saved=JSON.parse(localStorage.getItem('bk_cw')||'null')}catch(e){}
  K().applyColors(saved||{nm:'You',ab:'YOU'},{nm:'The Coach',ab:'CCH'});
  var cfg={league:'big3',decade:'ANY',target:11,rosters:K().pickRosters('big3','ANY')};
  K().startGame(cfg,true);   /* resume-mode: no tip-off */
  /* carve the sandbox: only the drill's pieces, placed exactly */
  var byPos={};S().pieces.forEach(function(p){byPos[p.team+p.pos]=p});
  var keep=[];
  L.pieces.forEach(function(spec){
    var p=byPos[spec.team+spec.pos]||S().pieces.find(function(x){return x.team===spec.team&&keep.indexOf(x)<0});
    if(!p)return;
    p.c=spec.c;p.r=spec.r;keep.push(p);
  });
  S().pieces=keep;
  S().ball.holder=L.holder;
  S().offense=L.offense;
  S().phase=(L.defDrill?'def-slide':'off-select');
  S().selected=null;S().staged=null;S().inbPending=false;S().inbMoved=true;
  $('hudMid').textContent='DRILL · '+D.nm.toUpperCase();
  K().show('game');
  K().refit();
  stepShow();
  if(drillPoll)clearInterval(drillPoll);
  drillPoll=setInterval(function(){
    if(!K().drill.on){clearInterval(drillPoll);return}
    if(K().drill.step>=D.steps.length-1)return;   /* the sign-off line runs on a timer */
    if(D.offtrack){var off=false;try{off=D.offtrack()}catch(e){}
      if(off){coachPanel('That play got away from us — <b>running it back…</b>');
        var rid=id;setTimeout(function(){if(K().drill.on&&K().drill.id===rid)startDrill(rid)},1700);
        return;}}
    var st=D.steps[K().drill.step],ok=false;
    try{ok=st.done()}catch(e){}
    if(ok){
      K().drill.step++;
      stepShow();
      if(K().drill.step===D.steps.length-1){
        var at=K().drill.step;
        setTimeout(function(){if(K().drill.on&&K().drill.step===at)diploma();},3400);
      }
    }
  },400);
}
function stepShow(){
  var D=DRILLS[K().drill.id],st=D&&D.steps[K().drill.step];
  if(st)coachPanel(st.say);
}
function diploma(){
  if(drillPoll){clearInterval(drillPoll);drillPoll=null;}
  coachHide();
  var v=document.createElement('div');v.id='drillDone';
  v.innerHTML='<div class="dd-card"><img src="assets/brand/gradcap.png" class="dd-cap" alt="">'+
    '<div class="dd-h">DRILL COMPLETE</div><div class="dd-sub">'+DRILLS[K().drill.id].nm+'</div>'+
    '<button class="mbtn" id="ddBack">Back to the Rulebook</button>'+
    '<button class="mbtn ghost" id="ddStay">Keep shooting around</button></div>';
  document.body.appendChild(v);
  if(window.BKAudio)BKAudio.sfx('score');
  $('ddBack').addEventListener('click',function(){v.remove();endDrill();});
  $('ddStay').addEventListener('click',function(){v.remove();coachPanel('Shoot around as long as you like — <b>✕ End drill</b> when you’re done.');});
}
/* TEARING THE DRILL DOWN IS SEPARATE FROM NAVIGATING AWAY FROM IT.
   Aaron, 08-05, with a screenshot of the main menu: the coach card still up
   saying "Now tap a teammate", Restart and End drill still on it, and the
   boombox still reading IRONY.
   endDrill() was correct and was never the problem -- it cleans up and THEN
   goes to the rulebook, so the drill's own ✕ End drill button always worked.
   Every other way out did not, because the cleanup only existed inside the
   one exit that also happened to navigate. Leave by the back arrow or the
   menu and the drill was still running: DRILL.on stayed true, which keeps
   musicWant() returning 'tutorial', and the coach panel was simply never
   told to hide.
   So the cleanup is its own function now and show() calls it on any move off
   the game screen. Two symptoms, one cause, one place to fix it -- and the
   next exit route someone adds gets it for free instead of being the third
   report. */
function drillTeardown(){
  if(!K().drill.on)return false;
  K().drill.on=false;K().drill.id=null;K().drill.allow=null;K().drill.deny=null;
  if(drillPoll){clearInterval(drillPoll);drillPoll=null;}
  coachHide();
  var dd=$('drillDone');if(dd)dd.remove();
  var hm=$('hudMid');if(hm&&/^DRILL/.test(hm.textContent))hm.textContent='';
  return true;
}
function endDrill(){
  drillTeardown();
  K().show('how');
}
/* Rulebook wiring: topics fold open, [data-drill] buttons boot drills */
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-drill]');
  if(b){startDrill(b.dataset.drill);return;}
  var h=e.target.closest&&e.target.closest('.rb-head');
  if(h){h.parentElement.classList.toggle('open');
    if(window.BKAudio)BKAudio.sfx('click');}
});
window.BKDrill={start:startDrill,end:endDrill,teardown:drillTeardown,
                list:Object.keys(DRILLS)};
})();

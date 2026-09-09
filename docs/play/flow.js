/* ============================================================================
   THE POSSESSION MOCK · the new turn engine, behind ?flow=new
   Row 239. The rules are the eleven sentences Aaron ruled on 7 September
   (DESIGN § 8a, the walkthrough page). This file keeps the real court, the
   pieces, the camera, the HUD, the question cards and the audio, and replaces
   the turn rules only while BKFLOW.on is true. With the flag off, nothing in
   game.js behaves differently: every hook there is guarded on BKFLOW.on.

   ?flow=new   a game against the machine, you are The Town (team 0)
   ?flow=local one phone, both sides tapped by hand

   Offline only: the mock never runs in an online room.
   ========================================================================== */
(function(){
"use strict";
var F=window.BKFLOW={on:false,mode:'cpu'};
var K=null;            /* BK.flow, the engine's internals, bound at start */
var st=function(){return BK.state()};
var T=null;            /* the possession: side, balls, turn flags */
var shapes={0:{off:null,def:null},1:{off:null,def:null}};
var picked={0:{off:false,def:false},1:{off:false,def:false}};
var cpu={busy:false,timer:null};
var CLK_DEF=10;        /* the defense's step, ruled 09-07 */
var LOG=[];            /* what happened, for the harness */
function log(k,o){LOG.push(Object.assign({k:k,t:Date.now()},o||{}));if(LOG.length>400)LOG.shift()}
F.log=function(){return LOG.slice()};
F.T=function(){return T};
F.repaint=function(){if(T)paint()};
F.shapes=function(){return shapes};
F.PICK_MS=20000;       /* a pick gets twenty seconds (row 249); the harness shortens it */
/* the board's match clock runs only while a possession is live (row 248):
   not through the picks, not through a dead-ball beat */
F.clockRuns=function(){return !!T&&T.phase!=='idle'&&st().phase!=='mb-pick'};

/* ---------- small helpers ---------- */
function P(i){return st().pieces[i]}
function holder(){return st().ball.holder}
function side(){return T.side}
function defTeam(){return 1-T.side}
function dist(a,b){return Math.max(Math.abs(a.c-b.c),Math.abs(a.r-b.r))}
function pgOf(team){var ps=st().pieces;for(var i=0;i<ps.length;i++)if(ps[i].team===team&&ps[i].pos==='PG')return i;return team*5}
function human(team){
  if(F.mode==='local')return true;
  return team!==K.CPU.team;
}
function ink(t){return K.teamInk(t)}
function nm(t){return K.teamName(t)}
function sfx(n){if(window.BKAudio)BKAudio.sfx(n)}
function tag(i){var p=P(i);return (p.num!=null?'#'+p.num+' ':'')+(p.short||p.pos)}
/* THE READOUT SAYS WHAT THE MACHINE DID (row 250). A human taps and sees his
   own move; the machine's move needs a sentence up top, the announcer line
   he liked 09-05 (row 242): "LeBron dribbles to the wing". Only the machine
   is narrated; two people on one phone watch each other's thumbs. */
function say(team,txt){if(human(team))return;K.banner('<b>'+nm(team)+'</b> · '+txt);log('say',{team:team,txt:txt})}
/* the machine moves at a person's pace, off the difficulty table (row 250,
   Aaron 09-08: "CPU should move at the speed of a human moving not super
   fast, this can change based on difficulty too"): Rookie slowest */
function thinkMs(){return 700+K.cpuRnd(K.cpuLvl().think)*2}
function moveDur(team){return human(team)?0.3:0.55}
function rimDist(c,r,team){var tc=K.tileCenter(c,r),rim=K.attackedRim(team);return Math.hypot(tc[0]-rim[0],tc[1]-rim[1])}
/* a defender who can contest a shot from (c,r): next to the shooter and
   between him and the rim; the man just beaten is out (ONE MORE rule) */
function contestIdx(c,r,team,exclude){
  var s=st(),rim=K.attackedRim(team),tc=K.tileCenter(c,r),sRim=Math.hypot(tc[0]-rim[0],tc[1]-rim[1]);
  var best=-1,bestC=false,D=K.dims();
  s.pieces.forEach(function(p,i){
    if(p.team===team||i===exclude)return;
    if(!K.guards(p.c,p.r,c,r))return;
    var dc=K.tileCenter(p.c,p.r);
    if(Math.hypot(dc[0]-rim[0],dc[1]-rim[1])>=sRim-D.TILE*0.2)return;
    if(best<0||(p.pos==='C'&&!bestC)){best=i;bestC=p.pos==='C'}
  });
  return best;
}
function adjToBall(team){
  var s=st(),h=P(holder()),out=[];
  s.pieces.forEach(function(p,i){if(p.team===team&&dist(p,h)<=1)out.push(i)});
  return out;
}
function inKey(p,team){return K.inPaint(p.c,p.r,K.defendedRim(team))}
function emptyNear(c,r,pred){
  /* nearest empty on-court square to (c,r) that satisfies pred, spiral out */
  var D=K.dims(),best=null,bd=1e9;
  for(var rr=0;rr<D.ROWS;rr++)for(var cc=0;cc<D.COLS;cc++){
    if(K.pieceAt(cc,rr)>=0)continue;
    if(pred&&!pred(cc,rr))continue;
    var d=Math.max(Math.abs(cc-c),Math.abs(rr-r));
    if(d<bd){bd=d;best=[cc,rr]}
  }
  return best;
}
function slide(i,c,r,dur,then){
  /* a piece slides with no rule side effects; the renderer ticks it */
  var p=P(i);
  if(p.c===c&&p.r===r){if(then)then();return}
  K.movePieceAnim(i,c,r,dur||0.35,then||null);
}
function glideMany(moves,dur,then){
  /* several pieces at once, one callback when the last lands (mbPlaceTeam's shape) */
  var s=st(),any=false;
  moves.forEach(function(m){var p=s.pieces[m.i];if(p.c===m.c&&p.r===m.r)return;
    p.anim={fc:p.c,fr:p.r,tc:m.c,tr:m.r,t:0,dur:dur||0.9};p.c=m.c;p.r=m.r;any=true});
  if(!any){if(then)then();return}
  s.phase='anim';s.animCb=then||null;
}

/* ---------- the dock ---------- */
function ballsHtml(){
  var h='';
  for(var i=0;i<T.balls.cross;i++)h+='<i class="flb c"></i>';
  if(T.balls.cross>0)h+='<i class="flb half"></i>';
  for(var j=0;j<T.balls.shoot;j++)h+='<i class="flb"></i>';
  return '<span class="flballs">'+h+'</span>';
}
function paint(){
  var s=st();if(!s)return;
  var html='',ph=T.phase,me=side();
  var who=function(t){var m=K.humanTeam();return F.mode==='local'?nm(t):(t===m?'You':nm(t))};
  /* THE MACHINE'S CONTROLS STAY OFF YOUR SCREEN (row 250, Aaron 09-08: "I
     see all of opposing teams options when they are picking... not good").
     The dock used to paint the offense's Shoot, End turn and every pass
     chip whoever the offense was. On the machine's turn it is a watching
     dock: its name, the balls, no buttons. */
  var turnTeam=ph==='def'?defTeam():me;
  if((ph==='off'||ph==='onemore'||ph==='def')&&!human(turnTeam)){
    var cnt=T.crossed?T.balls.shoot+' to shoot':T.balls.cross+' to cross';
    html='<div class="stitle">'+nm(turnTeam)+' · '+(ph==='def'?'on defense':'has the ball')+'<span class="flthink"> …</span></div>'
      +'<div class="flrow">'+ballsHtml()+'<span class="flhint">'+(ph==='def'?'your ':'their ')+cnt+'</span></div>';
    K.stagebox(html,true);K.actions('');
    return;
  }
  if(ph==='off'||ph==='onemore'){
    var h=P(holder()),sel=s.selected!=null?P(s.selected):null;
    var title;
    if(ph==='onemore')title='ONE MORE · shoot or pass';
    else if(sel&&s.selected===holder())title=(h.short||h.pos)+' · dribble, pass or shoot';
    else if(sel)title='Free move · tap a square';
    else if(!T.freeUsed)title=who(me)+' · free move, or tap '+(h.short||h.pos);
    else title=who(me)+' · tap '+(h.short||h.pos);
    var last=T.crossed&&T.balls.shoot<=1;
    html+='<div class="stitle">'+title+(last?' · <span class="fllast">LAST TURN</span>':'')+'</div>';
    html+='<div class="flrow">'+ballsHtml()+'<span class="flhint">'+(T.crossed?T.balls.shoot+' to shoot':T.balls.cross+' to cross · then 3')+'</span></div>';
    /* pass chips: every teammate with the price the ring would show. The
       chip reads the jersey number and the name that are ON THE PIECE and
       the row says PASS TO (row 252, Aaron 09-08: "I loved the names being
       there for passes, but I didn't even know what that meant, and the
       numbers should be there too since that's what's on the board"). */
    var chips='';
    s.pieces.forEach(function(p,i){
      if(p.team!==me||i===holder())return;
      var pr=passPrice(holder(),i);
      chips+='<button class="bigbtn ghost flchip" data-pass="'+i+'"'+(ph==='onemore'&&last?' disabled':'')+'>'
        +(p.num!=null?'<b>#'+p.num+'</b> ':'')+(p.short||p.pos).toUpperCase()+'<small>'+pr.label+'</small></button>';
    });
    var z=K.zoneOf(h.c,h.r,me),ci=z?contestIdx(h.c,h.r,me,T.beaten):-1;
    var shootSub=z?(z.pts+' · '+['casual','easy','medium','hard','legendary'][Math.min(3,z.tier+(ci>=0?1:0))]+(ci>=0?' · contested':'')):'too far';
    html+='<div class="row flacts"><button class="bigbtn" id="flShoot"'+(z?'':' disabled')+'>Shoot<small>'+shootSub+'</small></button>'
      +(ph==='onemore'?'':'<button class="bigbtn ghost" id="flEnd">End turn</button>')+'</div>';
    html+='<div class="row flpass"><span class="fllbl">PASS TO</span>'+chips+'</div>';
  }else if(ph==='def'){
    var adj=adjToBall(defTeam()),h2=P(holder());
    var due=dueOut();
    var title2=who(defTeam())+' · step one defender';
    if(due>=0)title2=(P(due).short||P(due).pos)+' must leave the key this turn';
    html+='<div class="stitle">'+title2+'</div>';
    html+='<div class="flrow">'+ballsHtml()+'<span class="flhint">their '+(T.crossed?T.balls.shoot+' to shoot':T.balls.cross+' to cross')+'</span></div>';
    html+='<div class="row flacts"><button class="bigbtn" id="flSteal"'+(adj.length?'':' disabled')+'>Steal<small>'+(adj.length?(P(adj[0]).short||P(adj[0]).pos)+' is next to the ball':'nobody next to the ball')+'</small></button>'
      +'<button class="bigbtn ghost" id="flEnd">End turn</button></div>';
  }else if(ph==='glide'){
    html+='<div class="stitle">'+who(me)+' ball · setting up</div><div class="flrow"><span class="flhint">tap a square past half court to start '+(P(holder()).short||'the point guard')+' there</span></div>';
  }else{html=''}
  K.stagebox(html,true);
  K.actions('');
  var b;
  if((b=K.g('flShoot')))b.addEventListener('click',shoot);
  if((b=K.g('flEnd')))b.addEventListener('click',endTurnTap);
  if((b=K.g('flSteal')))b.addEventListener('click',stealTap);
  [].forEach.call(document.querySelectorAll('#stagebox .flchip'),function(el){
    el.addEventListener('click',function(){pass(+el.getAttribute('data-pass'))});
  });
}
/* piece tags drawn by the renderer's hook: the key count and the beaten man */
F.label=function(ctx,i,pt,scl,sh,bob){
  if(!T)return;
  var p=P(i),tag=null,bg='#ffe9b0',fg='#111';
  if(p.team===defTeam()&&T.keyTurns[i]>0){
    var n=T.keyTurns[i];
    if(n>=2){tag='STEP OUT';bg='#ff8a6a';}
    else{tag='KEY '+n+' OF 2';}
  }
  if(i===T.beaten){tag='BEATEN';bg='#8a7a5e';fg='#fff';}
  if(T.phase==='def'&&adjToBall(defTeam()).indexOf(i)>=0&&!tag){tag='NEXT TO BALL';bg='#7ff08a';}
  if(!tag)return;
  ctx.save();
  var fs=Math.max(8,9*scl*2);ctx.font='800 '+fs+'px ui-monospace,Menlo,monospace';
  var w=ctx.measureText(tag).width+8,x=pt.x-w/2,y=pt.y-sh+bob-fs-4;
  ctx.fillStyle=bg;ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;
  ctx.beginPath();ctx.rect(x,y,w,fs+4);ctx.fill();ctx.stroke();
  ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(tag,pt.x,y+(fs+4)/2);
  ctx.restore();
};

/* ---------- the count (the balls are the shot clock) ---------- */
function spend(){
  if(T.crossed)T.balls.shoot--;else T.balls.cross--;
}
function noteCrossing(){
  var h=P(holder());
  if(!T.crossed&&K.inFront(side(),h.c,h.r)){
    T.crossed=true;T.balls.cross=0;
    K.banner('<b>Over half court.</b> Three turns to shoot.');
    log('crossed');
  }
}
function violation(kind){
  var s=st();
  if(kind==='half'){K.callout('HALF-COURT VIOLATION<small>turnover</small>',ink(defTeam()));}
  else if(kind==='shot'){K.callout('SHOT CLOCK VIOLATION<small>no shot in three turns</small>',ink(defTeam()));}
  else{K.callout('OVER AND BACK<small>turnover</small>',ink(defTeam()));}
  sfx('buzzer');log('violation',{kind:kind});
  T.phase='dead';K.stagebox('',true);
  /* the other team's ball, live, where the ball lies (the mock's dead ball) */
  var h=P(holder());
  var near=K.nearestPiece(defTeam(),K.tileCenter(h.c,h.r)[0],K.tileCenter(h.c,h.r)[1]);
  setTimeout(function(){beginLive(defTeam(),near.i,'ball')},900);
}

/* ---------- possession starts ---------- */
function resetPoss(team){
  T={side:team,phase:'idle',freeUsed:false,oneMore:false,beaten:-1,
     balls:{cross:2,shoot:3},crossed:false,keyTurns:{},stealAdj:-1,lastMove:null};
}
function beginLive(team,holderIdx,why){
  var s=st();
  if(K.newPossession(team))return;         /* quarter or game over */
  if(s.offense!==team)K.heatOffenseChange(team);
  s.offense=team;s.ball.holder=holderIdx;s.selected=null;s.staged=null;
  resetPoss(team);
  var h=P(holderIdx);
  T.crossed=K.inFront(team,h.c,h.r);
  if(T.crossed)T.balls.cross=0;
  K.hudPoss();
  log('live',{team:team,holder:holderIdx,why:why,crossed:T.crossed});
  startOff();
}
F.afterMake=function(z){
  /* the score is already on the board (resolveShot). The glide: both teams
     into their plays at the other end, the ball in the point guard's hands. */
  var s=st(),team=1-s.offense;
  log('make',{pts:z.pts,by:s.offense});
  if(K.newPossession(team))return;
  K.heatOffenseChange(team);
  s.offense=team;s.selected=null;s.staged=null;
  resetPoss(team);T.crossed=true;T.balls.cross=0;   /* idle until the glide: the clock holds through a pick */
  K.hudPoss();
  var go=function(){
    T.phase='glide';
    K.callout(nm(team).toUpperCase()+' BALL',K.teamCol(team));sfx(team===K.humanTeam()?'whistle':'whoosh');
    var pg=pgOf(team);s.ball.holder=pg;
    var moves=[];
    K.mbSpots(team,shapes[team].off,{}).forEach(function(m){var t=K.mbFreeTile(m[1][0],m[1][1],m[0]);moves.push({i:m[0],c:t[0],r:t[1]})});
    K.mbSpots(1-team,shapes[1-team].def,{}).forEach(function(m){var t=K.mbFreeTile(m[1][0],m[1][1],m[0]);moves.push({i:m[0],c:t[0],r:t[1]})});
    paint();
    glideMany(moves,1.1,function(){
      /* the optional tap (row 245) lives during the clip: a short window */
      setTimeout(function(){if(T&&T.phase==='glide')startOff()},1400);
    });
  };
  /* first offense, first defense: the picks come before the first glide */
  firstPicks(team,go);
};
function firstPicks(team,then){
  var d=1-team;
  var stepDef=function(next){
    if(picked[d].def)return next();
    pick(d,'def',function(k){shapes[d].def=k;picked[d].def=true;next()});
  };
  var stepOff=function(next){
    if(picked[team].off)return next();
    pick(team,'off',function(k){shapes[team].off=k;picked[team].off=true;next()});
  };
  stepDef(function(){stepOff(then)});
}
function pick(team,kind,cb){
  var tab=K.shapes(),list=kind==='off'?['HORNS','FIVE-OUT','BOX']:['MAN','2-3 ZONE','BOX-AND-ONE'];
  var sh=kind==='off'?tab.off:tab.def;
  var s=st();
  if(!human(team)){
    /* the machine picks off screen at its own pace, and the readout says
       what it picked: the defense's pick is meant to be seen (ruled 09-07) */
    var k=list[Math.floor(Math.random()*list.length)];
    K.stagebox('<div class="stitle">'+nm(team)+' · picking '+(kind==='off'?'an offense':'a defense')+'<span class="flthink"> …</span></div>',true);
    setTimeout(function(){K.banner('<b>'+nm(team)+'</b> picks '+k+'.');log('pick',{team:team,shape:k});cb(k)},900+K.cpuRnd(K.cpuLvl().think));
    return;
  }
  /* A PICK HAS A CLOCK (row 249; Aaron 09-05 and 09-08: "you can sit and set
     up for as long as you want... still no timer for... picking setup").
     Twenty seconds with the count in the dock title; time up takes the card
     he had lit, or one at random if none. fTimeout, so a pause holds it. */
  s.phase='mb-pick';
  var what=kind==='off'?'offense':'defense';
  var title=function(left){return '<div class="stitle">'+nm(team)+' · pick your '+what
    +(left!=null?' · <span class="flclk'+(left<=5?' hot':'')+'">:'+(left<10?'0':'')+left+'</span>':'')+'</div>'};
  K.stagebox(title(Math.ceil(F.PICK_MS/1000)),true);
  K.banner('<b>'+nm(team)+'</b>, pick your '+what+'. Tap a card, then RUN IT.');
  var chosen=false,tm=null,iv=null;
  var finish=function(k){
    if(chosen)return;chosen=true;
    if(tm)K.fClear(tm);if(iv)clearInterval(iv);
    K.mbCarKill();
    /* the pick is remembered; the pieces go back where they stood (the
       preview moved them) and the glide places them when a basket falls */
    (K.MB.pvBase||[]).forEach(function(b){var p=P(b.i);delete p.anim;p.c=b.c;p.r=b.r});
    s.phase='off-select';log('pick',{team:team,shape:k});cb(k);
  };
  K.mbCarShow(team,list,sh,{},finish);
  tm=K.fTimeout(function(){
    var on=document.querySelector('#mbCar .mbcard.on');
    var k=on?on.getAttribute('data-mb'):list[Math.floor(Math.random()*list.length)];
    K.callout('TIME<small>'+k+' it is</small>',ink(team));sfx('whistle');log('picktime',{team:team,shape:k});
    finish(k);
  },F.PICK_MS);
  iv=setInterval(function(){
    if(chosen)return;
    var left=Math.max(0,Math.ceil(K.fLeft(tm)/1000));
    var box=K.g('stagebox'),el=box&&box.querySelector('.stitle');
    if(el)el.outerHTML=title(left);
  },250);
}
F.start=function(winner){
  /* the tip is won: the ball is with the winner's point guard at mid-court.
     The loser picks its defense first (shown), then the winner its offense,
     then the live ball begins with two turns to cross. */
  var s=st();
  K.setClk(24,CLK_DEF);
  resetPoss(winner);
  firstPicks(winner,function(){
    beginLive(winner,winner*5,'tip');
  });
};

/* ---------- the offensive turn ---------- */
function startOff(){
  var s=st();
  T.phase='off';T.freeUsed=false;T.oneMore=false;T.beaten=-1;
  s.selected=null;s.staged=null;s.phase='off-select';
  K.clockStart('off');
  K.clearFocus();
  K.banner('');
  paint();
  log('turn',{side:'off',team:side(),balls:JSON.parse(JSON.stringify(T.balls)),crossed:T.crossed});
  cpuSoon();
}
function selectPiece(i){
  var s=st();s.selected=i;s.phase='off-move';paint();
}
function freeMove(i,c,r){
  var s=st();
  T.freeUsed=true;s.selected=null;s.phase='off-select';
  log('free',{i:i,to:[c,r]});
  say(side(),tag(i)+' moves without the ball.');
  K.recordPlay([{k:'hop',i:i,from:[P(i).c,P(i).r],to:[c,r]}]);
  slide(i,c,r,moveDur(side()),function(){s.phase='off-select';paint();cpuSoon()});
}
function dribble(c,r){
  var s=st(),i=holder(),h=P(i);
  if(T.crossed&&!K.inFront(side(),c,r)){violation('back');return}
  var dci=K.driveChallenge(h.c,h.r,c,r,side());
  if(dci>=0){
    var cnt=K.driveChallenge.count;
    if(cnt>=2){K.banner('<b>Closed lane.</b> Two defenders on it.');return}
    var pr=K.crossPrice(h,dci,Math.max(Math.abs(c-h.c),Math.abs(r-h.r)));
    spend();
    s.selected=null;
    K.setPending({type:'fl-cross',mover:i,tile:[c,r],def:dci,tier:pr.tier});
    log('cross',{tile:[c,r],def:dci,tier:pr.tier});
    say(side(),tag(i)+' goes at '+tag(dci)+'.');
    K.showCard(pr.tier,pr.deep?'DEEP CROSSOVER':'CROSSOVER','Beat your defender',
      P(dci).pos==='C'?'A big man in the lane':'He is squared up',false);
    return;
  }
  spend();
  s.selected=null;
  log('dribble',{to:[c,r]});
  say(side(),tag(i)+' dribbles '+(rimDist(c,r,side())<rimDist(h.c,h.r,side())?'toward the rim.':'across.'));
  K.recordPlay([{k:'hop',i:i,from:[h.c,h.r],to:[c,r]}]);
  slide(i,c,r,moveDur(side()),function(){afterBall('dribble')});
}
function passPrice(from,to){
  var s=st(),f=P(from),t=P(to),me=f.team;
  var d=dist(f,t);
  var lane=K.laneDefenders(f.c,f.r,t.c,t.r,me);
  var rim=K.attackedRim(me),fc=K.tileCenter(f.c,f.r),tc=K.tileCenter(t.c,t.r);
  var pRim=Math.hypot(fc[0]-rim[0],fc[1]-rim[1]),tRim=Math.hypot(tc[0]-rim[0],tc[1]-rim[1]);
  var D=K.dims(),pressured=false;
  s.pieces.forEach(function(p){if(p.team===me)return;if(dist(p,f)>1)return;var dc=K.tileCenter(p.c,p.r);if(Math.hypot(dc[0]-rim[0],dc[1]-rim[1])<pRim-D.TILE*0.2)pressured=true});
  var fwd=tRim<pRim-D.TILE*0.25;
  var free=(d<=3||(d<=6&&lane===0))&&!(pressured&&fwd);
  if(free)return {free:true,label:'free',tier:0};
  var tier=d>6?3:2;
  var label=d>6?'Full-court heave':(pressured&&fwd&&d<=3?'Pressured dish':'Contested laser');
  return {free:false,label:(d>6?'hard':'medium')+' question',tier:tier,name:label};
}
function pass(to){
  var s=st(),from=holder();
  if(to===from||P(to).team!==side())return;
  if(T.phase!=='off'&&T.phase!=='onemore')return;
  var t=P(to);
  if(T.crossed&&!K.inFront(side(),t.c,t.r)){violation('back');return}
  var pr=passPrice(from,to);
  var oneMore=T.phase==='onemore';
  if(!oneMore)spend();
  s.selected=null;
  say(side(),tag(from)+' passes to '+tag(to)+'.');
  var f=K.tileCenter(P(from).c,P(from).r),tt=K.tileCenter(t.c,t.r);
  if(pr.free){
    log('pass',{to:to,free:true,onemore:oneMore});
    K.recordPlay([{k:'ball',from:f,to:tt}]);
    s.phase='anim2';
    K.flyBall(f,tt,26,26,dist(P(from),t)<=3?40:70,0.5,function(){s.ball.holder=to;afterBall('pass')});
    return;
  }
  K.setPending({type:'fl-pass',toIdx:to,label:pr.name,onemore:oneMore});
  log('pass',{to:to,free:false,tier:pr.tier,onemore:oneMore});
  K.showCard(pr.tier,pr.name,'Complete the pass',pr.tier>=3?'Near impossible':'A defender lurks in the lane',false);
}
function shoot(){
  var s=st(),i=holder(),h=P(i),me=side();
  if(T.phase!=='off'&&T.phase!=='onemore')return;
  var z=K.zoneOf(h.c,h.r,me);
  if(!z){K.banner('<b>Too far.</b> No shot from here.');return}
  var def=contestIdx(h.c,h.r,me,T.beaten);
  var tight=def>=0&&(P(def).c===h.c||P(def).r===h.r);
  var eff=Math.min(3,z.tier+(def>=0&&tight?1:0));
  var ctier=0;
  if(def>=0){ctier=z.z==='layup'?(P(def).pos==='C'?1:2):(z.z==='mid'?2:3);if(!tight)ctier=Math.min(3,ctier+1)}
  if(T.phase!=='onemore')spend();
  s.selected=null;
  K.setPending({type:'fl-shoot',z:z,def:def,ctier:ctier});
  log('shoot',{zone:z.z,def:def,tier:eff,onemore:T.phase==='onemore'});
  say(me,tag(i)+' shoots for '+z.pts+'.');
  K.showCard(eff,(def>=0?(tight?'SMOTHERED · ':'CONTESTED · '):'')+z.pts+' pts',z.pts+' points',
    def>=0?(tight?'Right in your chest':'Late closeout, a touch of daylight'):'',false);
}
function endTurnTap(){
  if(T.phase==='off'){spend();log('endturn',{side:'off'});say(side(),tag(holder())+' holds the ball.');afterBall('end');}
  else if(T.phase==='def'){log('endturn',{side:'def'});say(defTeam(),'stays put.');endDef();}
}
function afterBall(kind){
  /* the ball action is done: the turn ends, the count is checked, the defense steps */
  var s=st();
  noteCrossing();
  if(!T.crossed&&T.balls.cross<=0){violation('half');return}
  if(T.crossed&&T.balls.shoot<=0){violation('shot');return}
  startDef();
}
function oneMore(){
  var s=st();
  T.phase='onemore';T.freeUsed=true;
  s.selected=holder();s.phase='off-select';
  K.callout('ONE MORE<small>shoot or pass, no defense between</small>',ink(side()));
  sfx('whoosh');
  K.clockStart('off');
  noteCrossing();
  paint();log('onemore');cpuSoon();
}

/* ---------- the defensive turn ---------- */
function startDef(){
  var s=st();
  T.phase='def';s.selected=null;s.staged=null;s.phase='def-slide';T.beaten=-1;
  K.clockStart('def');
  K.clearFocus();
  K.banner('');
  paint();
  log('turn',{side:'def',team:defTeam()});
  cpuSoon();
}
function dueOut(){
  var s=st(),out=-1;
  s.pieces.forEach(function(p,i){if(p.team===defTeam()&&T.keyTurns[i]>=2&&inKey(p,defTeam()))out=i});
  return out;
}
function step(i,c,r){
  var s=st();
  s.selected=null;
  log('step',{i:i,to:[c,r]});
  say(defTeam(),tag(i)+' steps '+(dist({c:c,r:r},P(holder()))<=1?'up on the ball.':'over.'));
  K.recordPlay([{k:'hop',i:i,from:[P(i).c,P(i).r],to:[c,r]}]);
  slide(i,c,r,moveDur(defTeam()),endDef);
}
function endDef(){
  /* three seconds, counted in turns: count who is in the key at the end of
     the defensive turn; a man on his third turn is walked out by the game */
  var s=st(),d=defTeam(),walk=-1;
  s.pieces.forEach(function(p,i){
    if(p.team!==d)return;
    if(inKey(p,d)){
      T.keyTurns[i]=(T.keyTurns[i]||0)+1;
      if(T.keyTurns[i]>=3)walk=i;
    }else T.keyTurns[i]=0;
  });
  if(walk>=0){
    var p=P(walk),to=emptyNear(p.c,p.r,function(c,r){return !K.inPaint(c,r,K.defendedRim(d))});
    T.keyTurns[walk]=0;
    K.callout('THREE SECONDS<small>'+(p.short||p.pos)+' is walked out of the paint</small>',ink(side()));
    sfx('whistle');log('threeseconds',{i:walk,to:to});
    if(to){slide(walk,to[0],to[1],0.5,startOff);s.phase='anim';return}
  }
  startOff();
}
function stealTap(){
  if(T.phase!=='def')return;
  var adj=adjToBall(defTeam());if(!adj.length)return;
  var s=st(),def=adj[0];
  if(s.selected!=null&&adj.indexOf(s.selected)>=0)def=s.selected;
  var st_={PG:2,SG:2,SF:3,PF:3,C:3}[P(def).pos];
  s.selected=null;
  K.setPending({type:'fl-steal',def:def});
  log('steal',{def:def});
  say(defTeam(),tag(def)+' reaches for the ball.');
  K.showCard(st_,'RIP IT','Go in for the steal',P(def).pos==='C'?'Big hands, slow hands':'Quick hands eat',true);
}

/* ---------- cards ---------- */
F.resolve=function(p,ok){
  var s=st();
  if(p.type==='fl-shoot'){
    if(!ok){K.resolveShot(false,p.z);return}
    if(p.def<0){K.resolveShot(true,p.z);return}
    K.setPending({type:'fl-block',z:p.z});
    K.showCard(p.ctier,'BLOCK IT',nm(defTeam())+' defends','',true);
    return;
  }
  if(p.type==='fl-block'){
    if(ok){K.callout('BLOCKED!<small>swatted away</small>',ink(defTeam()));log('block');K.resolveShot(false,p.z);}
    else K.resolveShot(true,p.z);
    return;
  }
  if(p.type==='fl-cross'){
    if(ok){
      var dt={PG:2,SG:2,SF:2,PF:3,C:3}[P(p.def).pos];
      K.setPending({type:'fl-crossdef',mover:p.mover,tile:p.tile,def:p.def});
      K.banner('<b>'+(P(p.def).short||P(p.def).pos).toUpperCase()+' BIT!</b> Stay in front.');
      K.showCard(dt,'STAY IN FRONT','Wall off the drive',P(p.def).pos==='C'?'Big man on skates · hang on':'Slide those feet',true);
    }else{
      K.callout('STUMBLES<small>the move is wasted</small>');log('crossfail');
      afterBall('cross');
    }
    return;
  }
  if(p.type==='fl-crossdef'){
    if(ok){K.callout('WALLED OFF<small>nowhere to go</small>',ink(defTeam()));log('walled');afterBall('cross');}
    else{
      K.callout('CROSSED HIM!',ink(side()));log('blowby',{def:p.def});
      var mv=p.mover;
      slide(mv,p.tile[0],p.tile[1],0.35,function(){T.beaten=p.def;oneMore()});
    }
    return;
  }
  if(p.type==='fl-steal'){
    if(!ok){
      /* knocked to the side: one square off the line between him and the ball */
      var d=P(p.def),h=P(holder());
      var to=emptyNear(d.c,d.r,function(c,r){return Math.max(Math.abs(c-d.c),Math.abs(r-d.r))===1&&Math.max(Math.abs(c-h.c),Math.abs(r-h.r))>=2})
            ||emptyNear(d.c,d.r,function(c,r){return Math.max(Math.abs(c-d.c),Math.abs(r-d.r))===1});
      K.callout('REACHED!<small>knocked aside, the lane is open</small>',ink(side()));log('stealmiss',{def:p.def,to:to});
      if(to){slide(p.def,to[0],to[1],0.3,startOff);}else startOff();
      return;
    }
    var ht={PG:1,SG:2,SF:2,PF:3,C:3}[P(holder()).pos];
    K.setPending({type:'fl-stealdef',def:p.def});
    K.banner('<b>HANDS IN!</b> '+nm(side())+', protect the rock.');
    K.showCard(ht,'PROTECT THE ROCK','Keep your dribble alive',P(holder()).pos==='C'?'Big-man handles under fire':'Shake the reach',false);
    return;
  }
  if(p.type==='fl-stealdef'){
    if(ok){K.callout('ROCK PROTECTED<small>the reach is spent</small>',ink(side()));log('stealheld');startOff();}
    else{K.callout('RIPPED!',ink(defTeam()));sfx('steal');log('stolen',{by:p.def});beginLive(defTeam(),p.def,'steal');}
    return;
  }
  if(p.type==='fl-pass'){
    var from=holder(),t=P(p.toIdx),f=K.tileCenter(P(from).c,P(from).r),tt=K.tileCenter(t.c,t.r);
    if(ok){
      K.recordPlay([{k:'ball',from:f,to:tt}]);
      s.phase='anim2';
      K.flyBall(f,tt,26,26,70,0.6,function(){s.ball.holder=p.toIdx;afterBall('pass')});
    }else{
      K.callout('OUT OF BOUNDS!<small>turnover</small>',ink(defTeam()));log('sailed');
      var dx=tt[0]-f[0],dy=tt[1]-f[1],len=Math.hypot(dx,dy)||1;
      s.phase='anim2';
      K.flyBall(f,[tt[0]+dx/len*60,tt[1]+dy/len*60],26,10,70,0.7,function(){
        var near=K.nearestPiece(defTeam(),tt[0],tt[1]);
        beginLive(defTeam(),near.i,'sailed');
      });
    }
    return;
  }
};
F.afterMiss=function(side_,at){
  /* the rebound: nearest piece to where the ball landed, within reach */
  var s=st(),D=K.dims();
  var a=K.nearestPiece(0,at[0],at[1]),b=K.nearestPiece(1,at[0],at[1]);
  var win=(a.d<=b.d)?{team:0,i:a.i,d:a.d}:{team:1,i:b.i,d:b.d};
  if(win.d>D.REB_R*1.4){win=(a.d<=b.d)?{team:0,i:a.i}:{team:1,i:b.i}}
  T.phase='dead';K.stagebox('',true);
  if(win.team===side()){
    K.callout(nm(win.team).toUpperCase()+' BOARD!<small>two more turns</small>',ink(win.team));
    s.ball.holder=win.i;T.balls.shoot=2;T.crossed=true;T.balls.cross=0;T.keyTurns={};
    log('oreb',{i:win.i});
    setTimeout(startOff,700);
  }else{
    K.callout(nm(win.team).toUpperCase()+' BOARD!<small>live ball</small>',ink(win.team));
    log('dreb',{i:win.i});
    setTimeout(function(){beginLive(win.team,win.i,'rebound')},700);
  }
};

/* ---------- clocks ---------- */
F.tickable=function(){
  var s=st();if(!T)return false;
  if(s.clock.kind==='off')return (T.phase==='off'||T.phase==='onemore')&&(s.phase==='off-select'||s.phase==='off-move');
  return T.phase==='def'&&s.phase==='def-slide';
};
F.clockOut=function(kind){
  if(!T)return;
  if(kind==='off'){
    K.callout('TIME<small>that turn is gone</small>',ink(defTeam()));sfx('buzzer');log('clock',{side:'off'});
    if(T.phase==='onemore'){afterBall('end');return}
    spend();afterBall('end');
  }else{
    K.callout('TIME<small>no step</small>',ink(side()));sfx('whistle');log('clock',{side:'def'});
    endDef();
  }
};

/* ---------- taps ---------- */
F.tap=function(o){
  var s=st();if(!T)return;
  F.lastTap=o;
  var pieceR=Math.min(30,Math.max(17,o.pitch*0.55)),tileR=o.pitch*0.66;
  var hit=o.pd<pieceR?o.pi:-1,pieceWins=hit>=0&&o.pd<=o.td;
  var tile=o.tile,me=side();
  /* a tap that lands near an OPPONENT's body is a tap on the square behind
     him: the square past a defender is the crossover square, and the sprite
     stands up over it. Tapping an opponent does nothing on your turn anyway. */
  var turnTeam=T.phase==='def'?defTeam():me;
  if(pieceWins&&P(hit).team!==turnTeam&&tile&&o.td<tileR*1.6)pieceWins=false;
  if(T.phase==='glide'){
    if(tile&&K.inFront(me,tile[0],tile[1])&&K.pieceAt(tile[0],tile[1])<0){
      var pg=holder();var p=P(pg);
      p.anim={fc:p.c,fr:p.r,tc:tile[0],tr:tile[1],t:0,dur:0.5};p.c=tile[0];p.r=tile[1];
      log('startsquare',{to:tile});
    }
    return;
  }
  if(T.phase==='off'||T.phase==='onemore'){
    if(!human(me))return;
    if(pieceWins){
      var p2=P(hit);
      if(p2.team!==me)return;
      if(hit===holder()){if(T.phase==='off')selectPiece(hit);return}
      if(s.selected===holder()||T.phase==='onemore'){pass(hit);return}
      if(T.freeUsed){K.banner('<b>Free move used.</b> Tap '+(P(holder()).short||'the ball')+' to pass, dribble or shoot.');return}
      selectPiece(hit);return;
    }
    if(T.phase==='onemore')return;
    if(s.selected!=null&&tile){
      var sel=P(s.selected);
      if(K.legalMove(sel,K.rangeOf(sel),tile[0],tile[1])){
        if(s.selected===holder())dribble(tile[0],tile[1]);else freeMove(s.selected,tile[0],tile[1]);
        return;
      }
    }
    s.selected=null;s.phase='off-select';paint();
    return;
  }
  if(T.phase==='def'){
    if(!human(defTeam()))return;
    if(pieceWins){
      if(P(hit).team!==defTeam())return;
      s.selected=hit;s.phase='def-slide';paint();return;
    }
    if(s.selected!=null&&tile){
      var sd=P(s.selected);
      if(K.legalMove(sd,K.rangeOf(sd),tile[0],tile[1])){step(s.selected,tile[0],tile[1]);return}
    }
    s.selected=null;paint();
  }
};

/* ---------- the machine (a legal player, not a clever one) ---------- */
function cpuSoon(){
  if(F.mode==='local')return;
  var s=st();
  var turnTeam=T.phase==='def'?defTeam():side();
  if(human(turnTeam))return;
  if(cpu.timer)clearTimeout(cpu.timer);
  cpu.timer=setTimeout(cpuAct,thinkMs());
}
function cpuAct(){
  cpu.timer=null;
  var s=st();if(!T||s.phase==='shooting'||s.phase==='anim'||s.phase==='anim2'||s.ball.fly)return cpuSoon();
  if(T.phase==='off'||T.phase==='onemore'){
    var me=side(),i=holder(),h=P(i);
    var z=K.zoneOf(h.c,h.r,me),ci=z?contestIdx(h.c,h.r,me,T.beaten):-1;
    var last=T.crossed&&T.balls.shoot<=1;
    /* free move first: one off-ball teammate a square closer to the rim */
    if(T.phase==='off'&&!T.freeUsed&&Math.random()<0.7){
      var best=null,bd=1e9,D=K.dims();
      s.pieces.forEach(function(p,j){if(p.team!==me||j===i)return;
        for(var rr=0;rr<D.ROWS;rr++)for(var cc=0;cc<D.COLS;cc++){
          if(!K.legalMove(p,K.rangeOf(p),cc,rr))continue;
          var d=rimDist(cc,rr,me);if(d<bd&&d>60){bd=d;best={j:j,c:cc,r:rr}}
        }});
      if(best){freeMove(best.j,best.c,best.r);return}
    }
    /* shoot when it is good or when it is the last turn */
    if(z&&(last||(z.z==='layup'&&ci<0)||(ci<0&&z.tier<=2&&Math.random()<0.6))){shoot();return}
    if(T.phase==='onemore'){if(z){shoot();return}}
    /* pass to an open man nearer the rim */
    var bp=null,bpd=1e9;
    s.pieces.forEach(function(p,j){if(p.team!==me||j===i)return;
      var pr=passPrice(i,j);if(!pr.free)return;
      if(T.crossed&&!K.inFront(me,p.c,p.r))return;
      var d=rimDist(p.c,p.r,me);if(d<bpd&&d<rimDist(h.c,h.r,me)-20){bpd=d;bp=j}});
    if(bp!=null&&(T.phase==='onemore'||Math.random()<0.75)){pass(bp);return}
    if(T.phase==='onemore'){if(z)shoot();else afterBall('end');return}
    /* dribble toward the rim on a free square, or a crossover for a guard */
    var bt=null,btd=rimDist(h.c,h.r,me),D2=K.dims();
    for(var rr2=0;rr2<D2.ROWS;rr2++)for(var cc2=0;cc2<D2.COLS;cc2++){
      if(!K.legalMove(h,K.rangeOf(h),cc2,rr2))continue;
      if(T.crossed&&!K.inFront(me,cc2,rr2))continue;
      var dci=K.driveChallenge(h.c,h.r,cc2,rr2,me),cnt=K.driveChallenge.count;
      if(dci>=0&&(cnt>=2||(h.pos!=='PG'&&h.pos!=='SG')||Math.random()<0.5))continue;
      var d2=rimDist(cc2,rr2,me);if(d2<btd){btd=d2;bt=[cc2,rr2]}
    }
    if(bt){dribble(bt[0],bt[1]);return}
    if(z){shoot();return}
    spend();say(me,tag(i)+' holds the ball.');afterBall('end');
    return;
  }
  if(T.phase==='def'){
    var d_=defTeam(),h2=P(holder());
    var due=dueOut();
    if(due>=0){var pd=P(due),to=emptyNear(pd.c,pd.r,function(c,r){return !K.inPaint(c,r,K.defendedRim(d_))&&K.legalMove(pd,K.rangeOf(pd),c,r)});if(to){step(due,to[0],to[1]);return}}
    var adj=adjToBall(d_);
    if(adj.length&&Math.random()<0.35){stealTap();return}
    /* step the nearest defender to a square next to the ball, rim side */
    var rim=K.attackedRim(side()),hc=K.tileCenter(h2.c,h2.r);
    var bestI=-1,bestT=null,bd2=1e9,D3=K.dims();
    s.pieces.forEach(function(p,j){if(p.team!==d_)return;
      for(var rr=0;rr<D3.ROWS;rr++)for(var cc=0;cc<D3.COLS;cc++){
        if(!K.legalMove(p,K.rangeOf(p),cc,rr))continue;
        var tc=K.tileCenter(cc,rr);
        var dBall=Math.max(Math.abs(cc-h2.c),Math.abs(rr-h2.r));
        var between=Math.hypot(tc[0]-rim[0],tc[1]-rim[1])<Math.hypot(hc[0]-rim[0],hc[1]-rim[1]);
        var score=dBall*10+(between?0:15)+Math.hypot(tc[0]-hc[0],tc[1]-hc[1])/40;
        if(score<bd2){bd2=score;bestI=j;bestT=[cc,rr]}
      }});
    if(bestI>=0&&bestT){step(bestI,bestT[0],bestT[1]);return}
    say(d_,'stays put.');endDef();
  }
}

/* ---------- switch on ---------- */
F.arm=function(mode){
  F.on=true;F.mode=mode||'cpu';K=BK.flow;
  K.NET.on=false;
  K.MB.game=true;K.MB.setup=false;K.MB.moved={};
  if(F.mode==='local'){K.CPU.on=false}
  var css=document.createElement('style');css.id='flowcss';
  css.textContent='.flballs{display:inline-flex;gap:5px;align-items:center}'
    +'.flb{display:inline-block;width:12px;height:12px;border-radius:50%;background:#ffb03a;border:1.5px solid #1c0f02}'
    +'.flb.c{background:#b7a687}.flb.half{width:3px;height:14px;border-radius:2px;background:#efe6d5;border:0}'
    +'.flrow{display:flex;align-items:center;gap:10px;font-size:12px;color:#b7a687;padding:2px 4px 6px}'
    +'.fllast{color:#ff8a6a}.flhint{letter-spacing:.04em}'
    +'#stagebox .flacts .bigbtn,#stagebox .flpass .bigbtn{display:flex;flex-direction:column;align-items:center;gap:2px}'
    +'#stagebox .bigbtn small{display:block;font-size:10px;font-weight:600;opacity:.8;text-transform:none;letter-spacing:0}'
    +'#stagebox .flpass{flex-wrap:wrap;gap:6px}#stagebox .flchip{padding:6px 10px;font-size:12px}'
    +'#stagebox .bigbtn:disabled{opacity:.35;filter:grayscale(.6)}'
    +'#stagebox .flchip b{font-weight:800;opacity:.85}'
    +'.fllbl{font-size:10px;font-weight:700;letter-spacing:.16em;color:#b7a687;align-self:center;padding:0 4px 0 2px}'
    +'.flclk{font-family:ui-monospace,Menlo,monospace;color:#ffb03a}.flclk.hot{color:#ff8a6a}'
    +'.flthink{opacity:.6}';
  document.head.appendChild(css);
};
/* the deep link: ?flow=new (against the machine) or ?flow=local (one phone).
   Called by the loader once the title is up, so the game lands on top. */
F.deepLink=function(q){
  if(q!=='new'&&q!=='local')return false;
  if(!window.BK||!BK.flow)return false;
  F.arm(q==='local'?'local':'cpu');
  BK.startCpu('pro','nba');
  if(q==='local')BK.flow.CPU.on=false;
  return true;
};
})();

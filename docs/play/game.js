/* Ball Knowledge — playable prototype slice v0.1
   3v3 hotseat · move/pass/shoot · trivia shots · defensive slides · first to 11 */
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
document.getElementById('ldBall').innerHTML=ballSVG(70);
document.getElementById('logo').innerHTML=logoSVG();
document.getElementById('cardEmblem').innerHTML=ballSVG(74);

/* ========== screens ========== */
var screens={load:g('screen-load'),title:g('screen-title'),how:g('screen-how'),game:g('screen-game')};
function g(id){return document.getElementById(id)}
function show(name){for(var k in screens)screens[k].classList.toggle('on',k===name)}

/* loading sequence */
var LD_LINES=["Lacing 'em up…","Chalk toss…","Setting the screen…","Icing the shooter…",
  "Painting the key…","Calling bank…","Checking the tape…","Squeaking the sneakers…"];
(function(){
  var i=0,clock=24;
  var lineEl=g('ldLine'),clockEl=g('ldClock');
  var li=setInterval(function(){i++;lineEl.textContent=LD_LINES[i%LD_LINES.length]},520);
  var ci=setInterval(function(){clock--;clockEl.textContent=':'+(clock<10?'0':'')+clock;
    if(clock<=18){clearInterval(li);clearInterval(ci);show('title')}},380);
})();
g('btnHow').addEventListener('click',function(){show('how')});
g('btnBack').addEventListener('click',function(){show('title')});
g('btnMenu').addEventListener('click',function(){g('endveil').classList.remove('on');show('title')});
g('btnPlay').addEventListener('click',function(){startGame();show('game')});
g('btnAgain').addEventListener('click',function(){g('endveil').classList.remove('on');startGame()});

/* ========== projection ========== */
var COLS=13,ROWS=7,TILE=46;
var LW=COLS*TILE,LH=ROWS*TILE;           /* local court 598x322 */
var RZ=-30*Math.PI/180,RX=57*Math.PI/180,PERSP=1400;
var fit={s:1,ox:0,oy:0};
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
function refit(){
  var wrap=g('court-wrap');
  var w=wrap.clientWidth,hgt=wrap.clientHeight;
  if(!w||!hgt){requestAnimationFrame(refit);return}
  canvas.width=w*DPR;canvas.height=hgt*DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  /* bound the projected extents incl. hoops + piece height headroom */
  var pts=[],ext=[[-46,LH/2,0],[LW+46,LH/2,0],[0,0,0],[LW,0,0],[0,LH,0],[LW,LH,0],
           [-40,LH/2,95],[LW+40,LH/2,95],[LW/2,0,80],[LW/2,LH,0]];
  for(var i=0;i<ext.length;i++)pts.push(rawProj(ext[i][0],ext[i][1],ext[i][2]));
  var minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
  pts.forEach(function(p){minx=Math.min(minx,p.x);maxx=Math.max(maxx,p.x);
    miny=Math.min(miny,p.y);maxy=Math.max(maxy,p.y)});
  var m=18;
  fit.s=Math.min((w-2*m)/(maxx-minx),(hgt-2*m)/(maxy-miny));
  fit.ox=w/2-(minx+maxx)/2*fit.s;
  fit.oy=hgt/2-(miny+maxy)/2*fit.s;
}
window.addEventListener('resize',refit);

function tileCenter(c,r){return [ (c+0.5)*TILE, (r+0.5)*TILE ]}

/* rims (local coords) */
var RIM_L=[-14,LH/2], RIM_R=[LW+14,LH/2], RIM_H=44;

/* zones: distance from attacked rim */
function zoneOf(c,r,team){ /* team 0 attacks RIGHT rim, team 1 attacks LEFT */
  var tc=tileCenter(c,r), rim=team===0?RIM_R:RIM_L;
  var d=Math.hypot(tc[0]-rim[0],tc[1]-rim[1]);
  if(d<=95)return {z:'layup',tier:1,pts:2,label:'Layup · easy · 2'};
  if(d<=185)return {z:'mid',tier:2,pts:2,label:'Mid-range · medium · 2'};
  if(d<=278)return {z:'three',tier:3,pts:3,label:'Three · hard · 3'};
  return null;
}

/* ========== figurine sprites (lathe, prerendered) ========== */
var PROFILES={
  PG:[[0,.30],[.05,.32],[.11,.25],[.15,.155],[.20,.125],[.34,.165],[.52,.19],[.62,.175],
      [.655,.115],[.695,.06],[.73,.095],[.80,.12],[.875,.105],[.935,.06],[.965,.02]],
  SG:[[0,.33],[.05,.35],[.11,.27],[.15,.17],[.20,.14],[.33,.19],[.51,.22],[.61,.20],
      [.655,.13],[.695,.065],[.73,.10],[.80,.13],[.875,.11],[.935,.06],[.965,.02]],
  C: [[0,.37],[.05,.39],[.11,.31],[.15,.20],[.20,.17],[.31,.235],[.50,.27],[.61,.245],
      [.66,.155],[.70,.075],[.735,.115],[.805,.145],[.88,.125],[.94,.07],[.97,.02]]
};
var HEIGHTS={PG:.94,SG:1,C:1.1};
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
        var pr=F/(F+r[2]+320);pts.push([cx+r[0]*pr,base-HGT*0+ (r[1]*pr) + HGT*0]);}
      /* anchor: base of figure sits at 'base' — shift by projected origin */
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
  /* vertical placement: shift everything so lowest point = base */
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
['PG','SG','C'].forEach(function(pos){
  SPRITES['0'+pos]=makeSprite(0,pos);
  SPRITES['1'+pos]=makeSprite(1,pos);
});

/* ========== game state ========== */
var state=null,anim=null,usedQ={1:[],2:[],3:[]};
function startGame(){
  state={
    score:[0,0], offense:0, phase:'off-select',   /* off-select | off-move | def-slide | shooting | anim */
    selected:null, defMoved:false,
    pieces:[
      {team:0,pos:'PG',c:4,r:3,range:3},
      {team:0,pos:'SG',c:3,r:1,range:2},
      {team:0,pos:'C', c:3,r:5,range:1},
      {team:1,pos:'PG',c:8,r:3,range:3},
      {team:1,pos:'SG',c:9,r:1,range:2},
      {team:1,pos:'C', c:9,r:5,range:1}
    ],
    ball:{holder:0,fly:null}                       /* holder = piece index */
  };
  usedQ={1:[],2:[],3:[]};
  g('ptsA').textContent='0';g('ptsB').textContent='0';
  refit();
  banner('<b>Orange ball.</b> Tap one of your players.');
  actions('<span class="note">Tap a player to start</span>');
}
function pieceAt(c,r){for(var i=0;i<state.pieces.length;i++){var p=state.pieces[i];
  if(p.c===c&&p.r===r)return i}return -1}
function teamName(t){return t===0?'Orange':'Blue'}
function banner(html){g('banner').innerHTML=html}
function actions(html){g('actions').innerHTML=html}

/* ========== rendering ========== */
var t0=performance.now();
function render(){
  var now=(performance.now()-t0)/1000;
  var w=canvas.width/DPR,h=canvas.height/DPR;
  ctx.clearRect(0,0,w,h);
  /* arena backdrop */
  var grad=ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,'#0b0908');grad.addColorStop(.5,'#171210');grad.addColorStop(1,'#241b13');
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);

  /* apron */
  quad(-28,-14,LW+28,LH+14,0,'#241708');
  /* tiles */
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
    var wood=((c+r)%2===0)?'#a8794e':'#9c6f45';
    var x0=c*TILE,y0=r*TILE;
    quad(x0,y0,x0+TILE,y0+TILE,0,wood);
    /* zone tints for CURRENT offense */
    if(state){
      var z=zoneOf(c,r,state.offense);
      if(z){var tint=z.z==='layup'?'rgba(111,191,115,.20)':z.z==='mid'?'rgba(232,184,75,.16)':'rgba(213,82,75,.14)';
        quad(x0,y0,x0+TILE,y0+TILE,0,tint);}
    }
  }
  /* grid lines */
  ctx.strokeStyle='rgba(20,10,4,.35)';ctx.lineWidth=1;
  for(var c2=0;c2<=COLS;c2++)line(c2*TILE,0,c2*TILE,LH);
  for(var r2=0;r2<=ROWS;r2++)line(0,r2*TILE,LW,r2*TILE);
  /* court chalk: border, half line, center circle */
  ctx.strokeStyle='rgba(244,236,220,.55)';ctx.lineWidth=2.5;
  line(0,0,LW,0);line(LW,0,LW,LH);line(LW,LH,0,LH);line(0,LH,0,0);
  line(LW/2,0,LW/2,LH);
  circle(LW/2,LH/2,52);

  /* highlights */
  if(state&&state.selected!=null&&(state.phase==='off-move'||state.phase==='def-slide')){
    var sel=state.pieces[state.selected];
    var range=state.phase==='def-slide'?1:sel.range;
    for(var rr=0;rr<ROWS;rr++)for(var cc=0;cc<COLS;cc++){
      var d=Math.max(Math.abs(cc-sel.c),Math.abs(rr-sel.r));
      if(d>0&&d<=range&&pieceAt(cc,rr)===-1){
        var col=state.phase==='def-slide'?'rgba(88,168,214,.38)':'rgba(245,135,46,.38)';
        quad(cc*TILE+3,rr*TILE+3,(cc+1)*TILE-3,(rr+1)*TILE-3,0,col);
      }
    }
  }

  /* hoops + pieces + ball, depth sorted */
  var draws=[];
  draws.push({z:rawProj(-24,LH/2,0).z, fn:function(){drawGoal(-1)}});
  draws.push({z:rawProj(LW+24,LH/2,0).z, fn:function(){drawGoal(1)}});
  state&&state.pieces.forEach(function(p,i){
    var tc=tileCenter(p.c,p.r), pt=proj(tc[0],tc[1],0);
    draws.push({z:rawProj(tc[0],tc[1],0).z, fn:(function(p,i,pt){return function(){
      var spr=SPRITES[p.team+p.pos];
      var bob=Math.sin(now*2.4+i)*1.5;
      var scl=pt.s*0.62;
      var sw=120*scl,sh=170*scl;
      /* selection ring + shadow */
      ctx.fillStyle='rgba(0,0,0,.35)';
      ctx.beginPath();ctx.ellipse(pt.x,pt.y,20*scl*2,7*scl*2,0,0,7);ctx.fill();
      if(state.selected===i){
        ctx.strokeStyle=p.team===0?'#f5872e':'#58a8d6';ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(pt.x,pt.y,24*scl*2,9*scl*2,0,0,7);ctx.stroke();
      }
      ctx.drawImage(spr,pt.x-sw/2,pt.y-sh+bob,sw,sh);
      /* ball marker on holder */
      if(state.ball.holder===i&&!state.ball.fly){
        drawBall(pt.x+16*scl*2,pt.y-24*scl*2+bob,8*Math.max(.6,scl*2));
      }
    }})(p,i,pt)});
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

  /* advance ball animation */
  if(state&&state.ball.fly){
    var f2=state.ball.fly;
    f2.t+=1/60/f2.dur;
    if(f2.t>=1){var cb=f2.done;state.ball.fly=null;cb&&cb();}
    else{
      f2.x=f2.x0+(f2.x1-f2.x0)*f2.t;
      f2.y=f2.y0+(f2.y1-f2.y0)*f2.t;
      f2.h=f2.h0+(f2.h1-f2.h0)*f2.t+Math.sin(Math.PI*f2.t)*f2.peak;
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
function drawGoal(side){ /* side -1 left, +1 right */
  var bx=side<0?-24:LW+24, rx=side<0?RIM_L[0]:RIM_R[0], cy=LH/2;
  /* pole */
  var pb=proj(bx,cy,0),pt=proj(bx,cy,52);
  ctx.strokeStyle='#55555b';ctx.lineWidth=Math.max(2,4*pb.s);
  ctx.beginPath();ctx.moveTo(pb.x,pb.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();
  /* backboard: vertical quad in the court plane's baseline orientation */
  var c1=proj(bx,cy-34,34),c2=proj(bx,cy+34,34),c3=proj(bx,cy+34,78),c4=proj(bx,cy-34,78);
  ctx.fillStyle='rgba(232,235,240,.92)';
  ctx.beginPath();ctx.moveTo(c1.x,c1.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(c3.x,c3.y);ctx.lineTo(c4.x,c4.y);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='#2c2c30';ctx.lineWidth=2;ctx.stroke();
  /* shooter square */
  var s1=proj(bx,cy-11,40),s2=proj(bx,cy+11,40),s3=proj(bx,cy+11,58),s4=proj(bx,cy-11,58);
  ctx.strokeStyle='#c9641a';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(s1.x,s1.y);ctx.lineTo(s2.x,s2.y);ctx.lineTo(s3.x,s3.y);ctx.lineTo(s4.x,s4.y);
  ctx.closePath();ctx.stroke();
  /* rim: ellipse around rim point at height */
  ctx.strokeStyle='#f5872e';ctx.lineWidth=3;
  ctx.beginPath();
  for(var i=0;i<=24;i++){var a=i/24*2*Math.PI;
    var p=proj(rx+Math.cos(a)*11,cy+Math.sin(a)*11,RIM_H);
    i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}
  ctx.stroke();
  /* net */
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.2;
  for(var k=0;k<6;k++){var a2=k/6*2*Math.PI;
    var top=proj(rx+Math.cos(a2)*10,cy+Math.sin(a2)*10,RIM_H);
    var bot=proj(rx+Math.cos(a2)*4,cy+Math.sin(a2)*4,RIM_H-18);
    ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.lineTo(bot.x,bot.y);ctx.stroke();
  }
}

/* ========== input ========== */
canvas.addEventListener('pointerup',function(ev){
  if(!state||state.phase==='shooting'||state.ball.fly)return;
  var rect=canvas.getBoundingClientRect();
  var px=ev.clientX-rect.left,py=ev.clientY-rect.top;
  /* nearest piece anchor */
  var best=-1,bd=1e9;
  state.pieces.forEach(function(p,i){
    var tc=tileCenter(p.c,p.r),pt=proj(tc[0],tc[1],0);
    var d=Math.hypot(px-pt.x,py-(pt.y-16));
    if(d<bd){bd=d;best=i}
  });
  /* nearest tile */
  var bt=null,btd=1e9;
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
    var tc2=tileCenter(c,r),pt2=proj(tc2[0],tc2[1],0);
    var d2=Math.hypot(px-pt2.x,py-pt2.y);
    if(d2<btd){btd=d2;bt=[c,r]}
  }
  /* projected tile pitch at the tapped spot (for scale-aware hit radii) */
  var pa=proj(bt[0]*TILE+TILE/2,bt[1]*TILE+TILE/2,0);
  var pb=proj((bt[0]+1)*TILE+TILE/2,bt[1]*TILE+TILE/2,0);
  var pitch=Math.hypot(pa.x-pb.x,pa.y-pb.y);
  handleTap({pi:best,pd:bd,tile:bt,td:btd,pitch:pitch});
});
function legalMove(sel,range,c,r){
  var d=Math.max(Math.abs(c-sel.c),Math.abs(r-sel.r));
  return d>0&&d<=range&&pieceAt(c,r)===-1;
}
function handleTap(o){
  var ph=state.phase;
  var pieceR=Math.min(30,o.pitch*0.55);   /* piece tap zone scales with screen */
  var tileR=o.pitch*0.66;
  var hitPiece=o.pd<pieceR?o.pi:-1;
  /* whichever target the finger is closest to wins: figure body = piece,
     tile floor = tile. Prevents figurines stealing taps aimed at tiles AND
     tiles stealing taps aimed at teammates. */
  var pieceWins=hitPiece>=0&&o.pd<=o.td;
  if(ph==='off-select'||ph==='off-move'){
    /* PRIORITY 1: tap landed on a friendly figure itself */
    if(pieceWins&&state.pieces[hitPiece].team===state.offense){
      if(ph==='off-move'&&state.selected===state.ball.holder&&hitPiece!==state.selected){
        doPass(hitPiece);return;
      }
      state.selected=hitPiece;state.phase='off-move';
      offerActions();return;
    }
    /* PRIORITY 2: a legal destination tile */
    if(ph==='off-move'&&state.selected!=null&&o.td<tileR){
      var sel=state.pieces[state.selected];
      if(legalMove(sel,sel.range,o.tile[0],o.tile[1])){doMove(o.tile);return}
    }
    /* PRIORITY 3: near-miss on a friendly piece */
    if(hitPiece>=0&&state.pieces[hitPiece].team===state.offense){
      if(ph==='off-move'&&state.selected===state.ball.holder&&hitPiece!==state.selected){
        doPass(hitPiece);return;
      }
      state.selected=hitPiece;state.phase='off-move';
      offerActions();return;
    }
    /* PRIORITY 3: forgiving fallback — nearest tile if it's legal */
    if(ph==='off-move'&&state.selected!=null&&o.tile){
      var s2=state.pieces[state.selected];
      if(legalMove(s2,s2.range,o.tile[0],o.tile[1])){doMove(o.tile);return}
    }
  }
  else if(ph==='def-slide'){
    if(pieceWins&&state.pieces[hitPiece].team!==state.offense){
      state.selected=hitPiece;offerActions();return;
    }
    /* legal slide tile next */
    if(state.selected!=null&&o.tile&&o.td<tileR){
      var sd=state.pieces[state.selected];
      if(legalMove(sd,1,o.tile[0],o.tile[1])){
        sd.c=o.tile[0];sd.r=o.tile[1];endDefSlide();return;
      }
    }
    if(hitPiece>=0&&state.pieces[hitPiece].team!==state.offense){
      state.selected=hitPiece;offerActions();return;
    }
    if(state.selected!=null&&o.tile){
      var sd2=state.pieces[state.selected];
      if(legalMove(sd2,1,o.tile[0],o.tile[1])){
        sd2.c=o.tile[0];sd2.r=o.tile[1];endDefSlide();return;
      }
    }
  }
}
function offerActions(){
  var sel=state.pieces[state.selected];
  if(state.phase==='def-slide'){
    actions('<button class="abtn ghost" id="aSkip">Skip slide</button>');
    g('aSkip').addEventListener('click',endDefSlide);
    banner('<b>'+teamName(1-state.offense)+' defense:</b> tap a highlighted tile to slide '+sel.pos+' — or skip.');
    return;
  }
  var html='';
  var isCarrier=state.selected===state.ball.holder;
  if(isCarrier){
    var z=zoneOf(sel.c,sel.r,state.offense);
    if(z)html+='<button class="abtn shoot" id="aShoot">Shoot · '+z.label+'</button>';
    html+='<span class="note">Tap a lit tile to move · tap a teammate to pass'+(z?' · or let it fly':'')+'</span>';
  }else{
    html+='<span class="note">Tap a lit tile to move '+sel.pos+'</span>';
  }
  actions(html);
  var sb=g('aShoot');if(sb)sb.addEventListener('click',doShoot);
  banner('<b>'+teamName(state.offense)+':</b> '+sel.pos+' selected.');
}

/* ========== actions ========== */
function flyBall(fromLxy,toLxy,h0,h1,peak,dur,done){
  state.ball.fly={x0:fromLxy[0],y0:fromLxy[1],x1:toLxy[0],y1:toLxy[1],
    x:fromLxy[0],y:fromLxy[1],h:h0,h0:h0,h1:h1,peak:peak,dur:dur,t:0,done:done};
}
function doMove(tile){
  var sel=state.pieces[state.selected];
  sel.c=tile[0];sel.r=tile[1];
  afterOffenseAction(teamName(state.offense)+' moved '+sel.pos+'.');
}
function doPass(toIdx){
  var from=state.pieces[state.ball.holder],to=state.pieces[toIdx];
  var f=tileCenter(from.c,from.r),t=tileCenter(to.c,to.r);
  state.phase='anim';
  flyBall(f,t,26,26,40,0.5,function(){
    state.ball.holder=toIdx;
    afterOffenseAction(teamName(state.offense)+' swings it to '+to.pos+'.');
  });
}
function afterOffenseAction(msg){
  state.selected=null;
  state.phase='def-slide';
  state.defSel=null;
  banner('<b>'+msg+'</b> '+teamName(1-state.offense)+': slide one defender 1 tile.');
  actions('<button class="abtn ghost" id="aSkip">Skip slide</button>');
  g('aSkip').addEventListener('click',endDefSlide);
}
function endDefSlide(){
  state.selected=null;
  state.phase='off-select';
  banner('<b>'+teamName(state.offense)+' ball.</b> Tap one of your players.');
  actions('<span class="note">Tap a player to act</span>');
}

/* ---------- shooting & questions ---------- */
var qTimer=null;
function pickQuestion(tier){
  var pool=[];
  for(var i=0;i<QUESTIONS.length;i++)if(QUESTIONS[i].t===tier&&usedQ[tier].indexOf(i)<0)pool.push(i);
  if(!pool.length){usedQ[tier]=[];return pickQuestion(tier)}
  var idx=pool[Math.floor(Math.random()*pool.length)];
  usedQ[tier].push(idx);
  return QUESTIONS[idx];
}
function doShoot(){
  var sel=state.pieces[state.selected];
  var z=zoneOf(sel.c,sel.r,state.offense);
  if(!z)return;
  state.phase='shooting';
  var q=pickQuestion(z.tier);
  window.BK&&(window.BK._q=q);
  var tierName=z.tier===1?'Easy':z.tier===2?'Medium':'Hard';
  g('qcat').textContent=q.cat;
  g('qtier').textContent=tierName+' · '+z.pts+' pts';
  g('qtier').style.background=z.tier===1?'#6fbf73':z.tier===2?'#e8b84b':'#d5524b';
  g('qchip').textContent=tierName;
  g('qchip').className='chip t'+z.tier;
  g('qstake').textContent=z.pts+' points';
  g('qtext').textContent=q.q;
  g('qresult').textContent='';g('qresult').className='result';
  var wrap=g('cardwrap');wrap.classList.remove('flipped');
  /* shuffled answers */
  var order=[0,1,2,3].sort(function(){return Math.random()-.5});
  var ansEl=g('qanswers');ansEl.innerHTML='';
  order.forEach(function(oi){
    var b=document.createElement('button');
    b.className='ans';b.textContent=q.c[oi];
    b.addEventListener('click',function(){answer(oi===q.a,b,q,z)});
    ansEl.appendChild(b);
  });
  var tfill=g('qtimer');tfill.style.transition='none';tfill.style.width='100%';
  g('qveil').classList.add('on');
  g('cardfront').onclick=function(){
    wrap.classList.add('flipped');
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      tfill.style.transition='width 15s linear';tfill.style.width='0%';
    })});
    qTimer=setTimeout(function(){answer(false,null,q,z)},15000);
  };
}
function answer(correct,btn,q,z){
  if(qTimer){clearTimeout(qTimer);qTimer=null}
  var els=document.querySelectorAll('.ans');
  els.forEach(function(e){e.disabled=true;
    if(e.textContent===q.c[q.a])e.classList.add('correct')});
  if(btn&&!correct)btn.classList.add('wrong');
  var res=g('qresult');
  if(correct){res.textContent='BUCKET INCOMING';res.className='result good'}
  else{res.textContent=btn?'BRICK — turnover':'SHOT CLOCK — turnover';res.className='result bad'}
  setTimeout(function(){
    g('qveil').classList.remove('on');
    resolveShot(correct,z);
  },1500);
}
function resolveShot(made,z){
  var sel=state.pieces[state.ball.holder];
  var f=tileCenter(sel.c,sel.r);
  var rim=state.offense===0?RIM_R:RIM_L;
  state.phase='anim';
  flyBall(f,[rim[0],rim[1]],26,RIM_H+4,made?70:80,0.8,function(){
    if(made){
      state.score[state.offense]+=z.pts;
      g('ptsA').textContent=state.score[0];
      g('ptsB').textContent=state.score[1];
      if(state.score[state.offense]>=11){endGame();return}
      changePossession('<b>SPLASH! +'+z.pts+' for '+teamName(state.offense)+'.</b>');
    }else{
      changePossession('<b>Off the iron.</b> Turnover.');
    }
  });
}
function changePossession(msg){
  state.offense=1-state.offense;
  /* ball to new offense's PG */
  var pg=-1;
  state.pieces.forEach(function(p,i){if(p.team===state.offense&&p.pos==='PG')pg=i});
  state.ball.holder=pg;
  state.selected=null;
  state.phase='off-select';
  banner(msg+' '+teamName(state.offense)+' ball — tap a player.');
  actions('<span class="note">'+teamName(state.offense)+' — tap a player</span>');
}
function endGame(){
  var winner=state.score[0]>=11?0:1;
  g('endTitle').textContent=teamName(winner)+' wins '+state.score[0]+'–'+state.score[1];
  g('endTitle').style.color=winner===0?'#f5872e':'#58a8d6';
  g('endLine').textContent='Ball knowledge don’t lie.';
  g('endveil').classList.add('on');
}

/* boot */
refit();
requestAnimationFrame(render);

/* test hooks */
window.BK={
  state:function(){return state},
  tileToScreen:function(c,r){var tc=tileCenter(c,r);return proj(tc[0],tc[1],0)},
  start:startGame, show:show
};
})();

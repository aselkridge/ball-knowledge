/* Ball Knowledge — audio & settings (v0.16).
   MUSIC: real self-hosted tracks (the portfolio method) — Kevin MacLeod,
   incompetech.com, CC BY 4.0, credit in the rulebook. Menu + in-game tracks
   crossfade by screen. SFX stay synthesized (Web Audio — no files).
   Settings persist per-phone in localStorage. */
(function(){
"use strict";

var DEF={music:true,sfx:true,musicVol:0.5,sfxVol:0.55,theme:'hardwood',coords:true,motion:true};
function load(){
  var d={};for(var k in DEF)d[k]=DEF[k];
  try{var j=JSON.parse(localStorage.getItem('bk_settings')||'{}');
    for(var k2 in j)if(k2 in d)d[k2]=j[k2];}catch(e){}
  return d;
}
var S=load();
function save(){try{localStorage.setItem('bk_settings',JSON.stringify(S));}catch(e){}}

/* ---------- theme ---------- */
function applyTheme(name){
  S.theme=name;save();
  var b=document.body;
  b.className=b.className.replace(/\btheme-\w+/g,'').trim();
  b.classList.add('theme-'+name);
  b.classList.toggle('reduce-motion',!S.motion);
}

/* ================= MUSIC: real tracks ================= */
var TRACKS={               /* all Kevin MacLeod, incompetech.com, CC BY 4.0 */
  menu:'audio/menu-funkorama.mp3',      /* Funkorama */
  game:'audio/game-funk-game-loop.mp3', /* Funk Game Loop */
  funky:'audio/funky-chunk.mp3',        /* Funky Chunk */
  pursuit:'audio/hot-pursuit.mp3',      /* Hot Pursuit */
  marty:'audio/marty-plan.mp3'          /* Marty Gots a Plan */
};
var els={},curTrack=null,intended='menu',booted=false,filesBroken=false;

function getEl(name){
  if(els[name])return els[name];
  var a=new Audio(TRACKS[name]);
  a.loop=true;a.preload='auto';a.volume=0;
  a.addEventListener('error',function(){filesBroken=true;});
  els[name]=a;
  return a;
}
function fadeTo(el,target,ms,pauseAtZero){
  if(el._fade){clearInterval(el._fade);el._fade=null;}
  var steps=Math.max(1,Math.round(ms/40)),i=0,from=el.volume;
  el._fade=setInterval(function(){
    i++;
    var v=from+(target-from)*(i/steps);
    el.volume=Math.max(0,Math.min(1,v));
    if(i>=steps){
      clearInterval(el._fade);el._fade=null;
      if(pauseAtZero&&target===0){el.pause();}
    }
  },40);
}
function music(track){
  intended=track;
  if(!booted)return;             /* first tap will start it */
  if(!S.music)return;
  if(filesBroken)return;         /* no fallback noise — silence beats bad chiptune */
  var el=getEl(track);
  if(curTrack===track&&!el.paused)return;   /* already grooving — never restart */
  for(var k in els)if(k!==track&&!els[k].paused)fadeTo(els[k],0,350,true);
  var p=el.play();
  if(p&&p.catch)p.catch(function(){});
  fadeTo(el,S.musicVol,600,false);
  curTrack=track;
  notify();
}
function stopMusic(){
  for(var k in els)if(!els[k].paused)fadeTo(els[k],0,250,true);
  curTrack=null;
  notify();
}

/* ---------- music-player (boombox) API ---------- */
var NAMES={menu:'Funkorama',game:'Funk Game Loop',funky:'Funky Chunk',pursuit:'Hot Pursuit',marty:'Marty Gots a Plan'};
var ORDER=['menu','game','funky','pursuit','marty'];   /* boombox playlist order */
var _mpCb=null;
function mpState(){var el=curTrack&&els[curTrack];
  return {playing:!!(S.music&&el&&!el.paused&&!filesBroken),
          name:NAMES[curTrack||intended]||'Music',
          vol:S.musicVol,muted:!S.music,broken:filesBroken};}
function notify(){if(_mpCb){try{_mpCb(mpState());}catch(e){}}}
function mpOnChange(fn){_mpCb=fn;notify();}
function mpCycle(dir){
  var cur=curTrack||intended,i=ORDER.indexOf(cur);if(i<0)i=0;
  var key=ORDER[(i+dir+ORDER.length)%ORDER.length];
  if(!S.music){S.music=true;save();}
  intended=key;curTrack=null;music(key);
  notify();
}

/* ---------- SFX (synthesized — these earned their keep) ---------- */
var AC=null,sfxGain,noiseBuf=null;
function ensure(){
  if(AC)return AC;
  try{
    var C=window.AudioContext||window.webkitAudioContext;
    AC=new C();
    sfxGain=AC.createGain();sfxGain.gain.value=S.sfx?S.sfxVol:0;
    sfxGain.connect(AC.destination);
    noiseBuf=AC.createBuffer(1,Math.floor(AC.sampleRate*0.4),AC.sampleRate);
    var d=noiseBuf.getChannelData(0);
    for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }catch(e){AC=null;}
  return AC;
}
function nf(n){return 440*Math.pow(2,(n-69)/12);}
function env(g,t,a,dec,peak){
  g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(peak,t+a);
  g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);
}
function blip(f,a,d,type){
  if(!AC)return;var o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'square';o.frequency.value=f;env(g,AC.currentTime,a,d,0.5);
  o.connect(g);g.connect(sfxGain);o.start();o.stop(AC.currentTime+a+d+0.05);
}
function sweep(from,to,d,type){
  if(!AC)return;var t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'sawtooth';o.frequency.setValueAtTime(from,t);
  o.frequency.exponentialRampToValueAtTime(to,t+d);env(g,t,0.005,d,0.4);
  o.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+d+0.05);
}
function arpg(notes,gap,dur){
  if(!AC)return;var t=AC.currentTime;
  notes.forEach(function(n,i){
    var o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=nf(n);
    env(g,t+i*gap,0.005,dur,0.4);o.connect(g);g.connect(sfxGain);
    o.start(t+i*gap);o.stop(t+i*gap+dur+0.05);
  });
}
function noiseHit(freq,d){
  if(!AC||!noiseBuf)return;var s=AC.createBufferSource();s.buffer=noiseBuf;
  var f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;f.Q.value=1.2;
  var g=AC.createGain();env(g,AC.currentTime,0.004,d,0.5);
  s.connect(f);f.connect(g);g.connect(sfxGain);s.start();s.stop(AC.currentTime+d+0.05);
}
function sfx(name){
  if(!ensure()||!S.sfx)return;
  switch(name){
    case 'click':blip(880,0.004,0.05,'square');break;
    case 'select':blip(1320,0.004,0.06,'triangle');break;
    case 'net':arpg([76,81,88],0.05,0.09);break;
    case 'buzzer':sweep(300,150,0.35,'sawtooth');break;
    case 'brick':noiseHit(400,0.14);break;
    case 'steal':arpg([64,57,48],0.055,0.09);break;
    case 'tap':blip(660,0.002,0.04,'square');break;
    case 'whistle':blip(2100,0.01,0.14,'square');break;
    case 'whoosh':sweep(900,1600,0.16,'triangle');break;
    case 'horn':arpg([53,53,60],0.12,0.28);break;
    case 'zap':sweep(1800,180,0.18,'sawtooth');noiseHit(3200,0.1);break;
  }
}

/* ---------- one-time unlock: browsers block audio until the FIRST tap.
   Runs exactly once, unlocks BOTH tracks, then removes itself — so later
   taps never touch the music again (that was the restart bug). ---------- */
function boot(){
  if(booted)return;
  booted=true;
  window.removeEventListener('pointerdown',boot,true);
  window.removeEventListener('keydown',boot,true);
  ensure();
  if(AC&&AC.state==='suspended'){try{AC.resume();}catch(e){}}
  ['menu','game'].forEach(function(k){
    var el=getEl(k);
    var p=el.play();
    if(p&&p.then)p.then(function(){
      if(k!==intended||!S.music){el.pause();el.currentTime=0;}
    }).catch(function(){});
  });
  if(S.music)music(intended);
}
window.addEventListener('pointerdown',boot,true);
window.addEventListener('keydown',boot,true);

/* subtle UI click */
document.addEventListener('pointerdown',function(e){
  var t=e.target;
  if(t&&t.closest&&t.closest('.mbtn,.bigbtn,.abtn,.lgcard,.lr-card,.lr-go,.dchip,.tgtbtn,.qbtn,.pbtn,.toggle,.swatch,.ans,.ctrlbtn'))
    sfx('click');
},true);

/* ---------- public API ---------- */
function set(key,val){
  S[key]=val;save();
  if(key==='theme'){applyTheme(val);return;}
  if(key==='motion'){document.body.classList.toggle('reduce-motion',!val);return;}
  if(key==='musicVol'){
    for(var k in els)if(!els[k].paused&&!els[k]._fade)els[k].volume=val;
    notify();return;
  }
  if(key==='music'){
    if(val){var t=intended;curTrack=null;music(t);}
    else stopMusic();
    notify();return;
  }
  if(key==='sfxVol'){if(AC&&S.sfx)sfxGain.gain.value=val;return;}
  if(key==='sfx'){if(AC)sfxGain.gain.value=val?S.sfxVol:0;return;}
}
function toggleMusic(){set('music',!S.music);return S.music;}
function toggleSfx(){set('sfx',!S.sfx);return S.sfx;}

applyTheme(S.theme);

window.BKAudio={
  settings:S,music:music,sfx:sfx,set:set,
  toggleMusic:toggleMusic,toggleSfx:toggleSfx,applyTheme:applyTheme,
  mpCycle:mpCycle,mpState:mpState,mpOnChange:mpOnChange,
  _els:els,_booted:function(){return booted}
};
})();

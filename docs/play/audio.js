/* Ball Knowledge, audio & settings (v0.17).
   MUSIC: real self-hosted tracks, Ketsa (ketsa.uk), album "Concrete Flowers",
   CC BY 4.0, credit in the rulebook. Eight tracks, six of which have a JOB:
   the moment the game is in decides the song, and they HAND OFF (see music()).
   SFX stay synthesized (Web Audio: no files).
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

/* ================= MUSIC: real tracks =================
   Every key here is a ROLE, a moment in the game, not a song title. Aaron
   cast them 2026-08-01. Two tracks have no role: they only exist in the
   boombox, for anyone who wants to run their own soundtrack.
   All eight: Ketsa, "Concrete Flowers", CC BY 4.0. */
var TRACKS={
  menu:    'audio/grounded.mp3',        /* Grounded, the first thing anyone hears */
  game:    'audio/mole-soul.mp3',       /* Mole Soul, while you play */
  win:     'audio/sum-of-the-all.mp3',  /* Sum of the All. You win */
  lose:    'audio/sad-soul.mp3',        /* Sad Soul. You lose */
  tutorial:'audio/irony.mp3',           /* Irony, drills */
  paused:  'audio/soul-up.mp3',         /* Soul Up, the pause menu */
  /* Aaron asked for a song of its own for the Daily Five, 08-04. Two tracks
     were sitting with no role, so this needed no new sourcing: "Follow My Soul"
     is the calmer of the pair and the daily is a two-minute ritual rather than
     a game, which is why it gets this and not the menu's hype. One line to
     swap if he wants the other, and a genuinely NEW song is a sourcing job, 
     Ketsa has more albums under the same licence, but I cannot write one. */
  daily:   'audio/follow-my-soul.mp3',  /* Follow My Soul, the Daily Five */
  cursed:  'audio/cursed-without.mp3'   /* Cursed Without. Boombox only */
};
var els={},curTrack=null,intended='menu',booted=false,filesBroken=false;
/* Picking a song by hand in the boombox is a statement. From then on the game
   stops choosing for you: no screen change yanks your song away, until you
   hit the ♪ toggle, which hands the wheel back. */
var manual=false;

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
    /* cosine ease, linear volume ramps read as a hard cut at both ends */
    var t=i/steps,e=.5-.5*Math.cos(Math.PI*t);
    el.volume=Math.max(0,Math.min(1,from+(target-from)*e));
    if(i>=steps){
      clearInterval(el._fade);el._fade=null;
      if(pauseAtZero&&target===0){el.pause();}
    }
  },40);
}
/* HANDOFF, NOT CROSSFADE (fixed 2026-08-01 after Aaron: "really bad").
   The old version overlapped the two songs for ~1.3s. Measured, the fade curves
   were fine -- the problem is musical, not technical. Two unrelated songs played
   over each other are mud, and because they are uncorrelated their amplitudes do
   NOT sum back to full: both sitting at 0.12 mid-fade reads as a hole in the
   middle, so you hear a dip AND a smear at the same time.
   Crossfading only ever works between takes of the same music. So: the old song
   leaves, there is a short breath of air, the new one arrives. Total 1.65s --
   FASTER than the old 1.8s, and clean. The air is the point; do not close it. */
var OUT_MS = 600, AIR_MS = 220, IN_MS = 830;
var pendingIn = null;
function music(track,auto){
  if(auto&&manual)return;        /* the player chose, the game doesn't overrule it */
  if(!TRACKS[track])return;
  intended=track;
  if(!booted)return;             /* first tap will start it */
  if(!S.music)return;
  if(filesBroken)return;         /* no fallback noise. Silence beats bad chiptune */
  var el=getEl(track);
  if(curTrack===track&&!el.paused)return;   /* already grooving. Never restart */
  /* a switch already queued is stale the moment a newer one arrives */
  if(pendingIn){clearTimeout(pendingIn);pendingIn=null;}
  var leaving=false;
  for(var k in els)if(k!==track&&!els[k].paused){fadeTo(els[k],0,OUT_MS,true);leaving=true;}
  curTrack=track;
  function bringIn(){
    pendingIn=null;
    if(curTrack!==track||!S.music)return;   /* changed its mind while we waited */
    var p=el.play();
    if(p&&p.catch)p.catch(function(){});
    el.volume=0;
    fadeTo(el,S.musicVol,IN_MS,false);
    notify();
  }
  /* nothing was playing (first boot, or music just switched on) -> no dead air */
  if(leaving)pendingIn=setTimeout(bringIn,OUT_MS+AIR_MS); else bringIn();
  notify();
}
function stopMusic(){
  if(pendingIn){clearTimeout(pendingIn);pendingIn=null;}   /* or a queued song
     lands AFTER you hit mute -- the exact bug the handoff timer invites */
  for(var k in els)if(!els[k].paused)fadeTo(els[k],0,250,true);
  curTrack=null;
  notify();
}

/* ---------- music-player (boombox) API ---------- */
var NAMES={menu:'Grounded',game:'Mole Soul',win:'Sum of the All',lose:'Sad Soul',
           tutorial:'Irony',paused:'Soul Up',follow:'Follow My Soul',cursed:'Cursed Without'};
/* boombox playlist order, all eight, so the two role-less tracks are reachable */
var ORDER=['menu','game','win','lose','tutorial','paused','follow','cursed'];
var _mpCb=null;
function mpState(){var el=curTrack&&els[curTrack];
  return {playing:!!(S.music&&el&&!el.paused&&!filesBroken),
          name:NAMES[curTrack||intended]||'Music',
          vol:S.musicVol,muted:!S.music,broken:filesBroken,manual:manual};}
function notify(){if(_mpCb){try{_mpCb(mpState());}catch(e){}}}
function mpOnChange(fn){_mpCb=fn;notify();}
function mpCycle(dir){
  var cur=curTrack||intended,i=ORDER.indexOf(cur);if(i<0)i=0;
  var key=ORDER[(i+dir+ORDER.length)%ORDER.length];
  if(!S.music){S.music=true;save();}
  manual=true;                    /* hand-picked, hold it until ♪ is toggled */
  intended=key;curTrack=null;music(key);
  notify();
}

/* ---------- SFX (synthesized. These earned their keep) ---------- */
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
/* THE BOLT (Aaron, 08-16: "the sound of the lightning at the VS screen it's
   horrible"). He was right, and the diagnosis is in the old recipe: a
   sawtooth sweeping 1800Hz down to 180 is the textbook retro laser, and it
   ran 115ms on the game's biggest screen. Cheap and tiny.
   This is three layers doing three jobs, 343ms total:
     1 the SNAP · broadband noise whose highpass collapses downward. A
       strike's brightness falls; its PITCH does not, and a falling pitch is
       exactly what made the old one a "pew".
     2 the BODY · a sub sine dropping 80 to 30Hz, the rumble under it.
     3 the ARC · a quiet chopped-noise tail so it reads electric.
   The 0.43 trim is MEASURED, not guessed: rendered in an OfflineAudioContext
   this hit +5.4 dBFS and clipped; the trim lands it at -2. Audition of five
   takes: the VS Stinger artifact, 08-16. */
function boltHit(){
  if(!AC||!noiseBuf)return;
  var t=AC.currentTime;
  var bus=AC.createGain();bus.gain.value=0.43;bus.connect(sfxGain);
  /* 1 · the snap */
  var s=AC.createBufferSource();s.buffer=noiseBuf;
  var hp=AC.createBiquadFilter();hp.type='highpass';
  hp.frequency.setValueAtTime(3000,t);
  hp.frequency.exponentialRampToValueAtTime(220,t+0.26);
  var g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(0.8,t+0.003);
  g.gain.exponentialRampToValueAtTime(0.05,t+0.14);
  g.gain.exponentialRampToValueAtTime(0.0001,t+0.40);
  s.connect(hp);hp.connect(g);g.connect(bus);s.start(t);s.stop(t+0.44);
  /* 2 · the body */
  var o=AC.createOscillator(),og=AC.createGain();
  o.type='sine';
  o.frequency.setValueAtTime(80,t+0.01);
  o.frequency.exponentialRampToValueAtTime(30,t+0.50);
  og.gain.setValueAtTime(0.0001,t+0.01);
  og.gain.exponentialRampToValueAtTime(0.85,t+0.03);
  og.gain.exponentialRampToValueAtTime(0.0001,t+0.58);
  o.connect(og);og.connect(bus);o.start(t+0.01);o.stop(t+0.62);
  /* 3 · the arc tail */
  var s2=AC.createBufferSource();s2.buffer=noiseBuf;
  var bp=AC.createBiquadFilter();bp.type='bandpass';
  bp.frequency.setValueAtTime(2400,t+0.05);bp.Q.value=2.2;
  var g2=AC.createGain();
  g2.gain.setValueAtTime(0.0001,t+0.05);
  g2.gain.exponentialRampToValueAtTime(0.22,t+0.07);
  g2.gain.exponentialRampToValueAtTime(0.0001,t+0.30);
  var lfo=AC.createOscillator(),lg=AC.createGain();
  lfo.type='square';lfo.frequency.value=42;lg.gain.value=0.16;
  lfo.connect(lg);lg.connect(g2.gain);lfo.start(t+0.05);lfo.stop(t+0.32);
  s2.connect(bp);bp.connect(g2);g2.connect(bus);s2.start(t+0.05);s2.stop(t+0.34);
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
    case 'zap':boltHit();break;
  }
}

/* ---------- one-time unlock: browsers block audio until the FIRST tap.
   Runs exactly once, unlocks BOTH tracks, then removes itself, so later
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
    /* ♪ off then on hands the wheel back to the game, the one clean way out
       of a hand-picked track without hunting for the song you started on. */
    if(val){manual=false;var t=intended;curTrack=null;music(t);}
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

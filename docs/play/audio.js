/* Ball Knowledge — audio & settings (v0.15).
   Every sound is SYNTHESIZED live with the Web Audio API — no files, no CDNs.
   Two looping arcade grooves (menu + in-game) + procedural SFX. Settings
   (theme, music, sfx, court labels, motion) persist per-phone in localStorage. */
(function(){
"use strict";

var DEF={music:true,sfx:true,musicVol:0.42,sfxVol:0.55,theme:'hardwood',coords:true,motion:true};
function load(){
  var d={};for(var k in DEF)d[k]=DEF[k];
  try{var j=JSON.parse(localStorage.getItem('bk_settings')||'{}');
    for(var k2 in j)if(k2 in d)d[k2]=j[k2];}catch(e){}
  return d;
}
var S=load();
function save(){try{localStorage.setItem('bk_settings',JSON.stringify(S));}catch(e){}}

/* ---------- theme (applied before the menus paint) ---------- */
function applyTheme(name){
  S.theme=name;save();
  var b=document.body;
  b.className=b.className.replace(/\btheme-\w+/g,'').trim();
  b.classList.add('theme-'+name);
  b.classList.toggle('reduce-motion',!S.motion);
}

/* ---------- audio graph (created lazily, on first gesture) ---------- */
var AC=null,master,musicGain,sfxGain,noiseBuf=null;
function ensure(){
  if(AC)return AC;
  try{
    var C=window.AudioContext||window.webkitAudioContext;
    AC=new C();
    master=AC.createGain();master.gain.value=0.85;master.connect(AC.destination);
    musicGain=AC.createGain();musicGain.gain.value=S.music?S.musicVol:0;musicGain.connect(master);
    sfxGain=AC.createGain();sfxGain.gain.value=S.sfx?S.sfxVol:0;sfxGain.connect(master);
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

/* ---------- instrument voices ---------- */
function kick(t){
  var o=AC.createOscillator(),g=AC.createGain();o.type='sine';
  o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(46,t+0.12);
  env(g,t,0.005,0.17,1);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+0.22);
}
function hat(t,open){
  var s=AC.createBufferSource();s.buffer=noiseBuf;
  var f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=7200;
  var g=AC.createGain();env(g,t,0.002,open?0.11:0.028,0.28);
  s.connect(f);f.connect(g);g.connect(musicGain);s.start(t);s.stop(t+0.14);
}
function snare(t){
  var s=AC.createBufferSource();s.buffer=noiseBuf;
  var f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1900;f.Q.value=0.8;
  var g=AC.createGain();env(g,t,0.003,0.14,0.5);
  s.connect(f);f.connect(g);g.connect(musicGain);s.start(t);s.stop(t+0.2);
}
function bass(t,n,dur){
  var o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();
  o.type='square';o.frequency.value=nf(n);f.type='lowpass';f.frequency.value=540;
  env(g,t,0.006,dur,0.42);o.connect(f);f.connect(g);g.connect(musicGain);
  o.start(t);o.stop(t+dur+0.05);
}
function lead(t,n,dur,peak){
  var o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain();
  o.type='square';o2.type='square';o.frequency.value=nf(n);o2.frequency.value=nf(n)*1.006;
  env(g,t,0.006,dur,peak||0.22);o.connect(g);o2.connect(g);g.connect(musicGain);
  o.start(t);o2.start(t);o.stop(t+dur+0.05);o2.stop(t+dur+0.05);
}

/* ---------- tracks (32 steps = 2 bars of 16ths) ---------- */
function arr(list){var a=[];for(var i=0;i<32;i++)a.push(0);
  if(list.length&&typeof list[0]==='number')list.forEach(function(i){a[i]=1});
  else for(var k in list)a[k]=list[k];return a;}
function hats(evenVal,opens){var a=[];for(var i=0;i<32;i++)a.push(i%2===0?evenVal:0);
  opens.forEach(function(i){a[i]=2});return a;}

var TR={
  menu:{tempo:94,
    k:arr([0,8,11,16,24,27]),s:arr([4,12,20,28]),h:hats(1,[6,14,22,30]),
    b:arr({0:45,4:45,6:48,8:52,10:52,12:50,14:48,16:45,20:45,22:43,24:48,26:52,28:50,30:48}),
    l:arr({16:69,18:72,20:76,23:72,26:69,28:67})},
  game:{tempo:126,
    k:arr([0,4,8,12,16,20,24,28]),s:arr([4,12,20,28]),h:hats(1,[14,30]),
    b:arr({0:45,2:45,4:45,6:45,8:45,10:45,12:43,14:45,16:45,18:45,20:48,22:48,24:45,26:45,28:43,30:43}),
    l:arr({0:69,2:72,4:76,6:72,8:69,12:67,16:69,18:72,20:76,22:79,24:76,28:72})}
};

/* ---------- lookahead sequencer ---------- */
var timer=null,step=0,nextT=0,curTrack=null,intended=null;
function playStep(track,i,t){
  var T=TR[track],e8=60/T.tempo/4*2;
  if(T.k[i])kick(t);
  if(T.s[i])snare(t);
  if(T.h[i])hat(t,T.h[i]===2);
  if(T.b[i])bass(t,T.b[i],e8);
  if(T.l[i])lead(t,T.l[i],e8,track==='game'?0.2:0.15);
}
function tick(){
  if(!AC||!curTrack)return;
  var spb=60/TR[curTrack].tempo/4;
  while(nextT<AC.currentTime+0.12){playStep(curTrack,step,nextT);nextT+=spb;step=(step+1)%32;}
}
function startSeq(){if(timer||!AC)return;step=0;nextT=AC.currentTime+0.06;timer=setInterval(tick,25);}
function stopSeq(){if(timer){clearInterval(timer);timer=null;}}

function music(track){
  intended=track;
  if(!AC||!S.music)return;
  if(curTrack===track&&timer)return;
  var now=AC.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(Math.max(0.0001,musicGain.gain.value),now);
  musicGain.gain.linearRampToValueAtTime(0.0001,now+0.12);
  setTimeout(function(){
    if(!AC)return;
    curTrack=track;step=0;nextT=AC.currentTime+0.06;startSeq();
    var n2=AC.currentTime;
    musicGain.gain.cancelScheduledValues(n2);
    musicGain.gain.setValueAtTime(0.0001,n2);
    musicGain.gain.linearRampToValueAtTime(S.musicVol,n2+0.25);
  },140);
}

/* ---------- SFX ---------- */
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
    case 'net':arpg([76,81,88],0.05,0.09);break;      /* swish, rising */
    case 'buzzer':sweep(300,150,0.35,'sawtooth');break;
    case 'brick':noiseHit(400,0.14);break;
    case 'steal':arpg([64,57,48],0.055,0.09);break;   /* descending rip */
    case 'tap':blip(660,0.002,0.04,'square');break;
    case 'whistle':blip(2100,0.01,0.14,'square');break;
    case 'whoosh':sweep(900,1600,0.16,'triangle');break;
    case 'horn':arpg([53,53,60],0.12,0.28);break;     /* end-of-game horn */
  }
}

/* ---------- first-gesture bootstrap (browsers block audio until a tap) ---------- */
function boot(){
  if(ensure()){
    if(AC.state==='suspended')try{AC.resume();}catch(e){}
    if(intended){curTrack=null;music(intended);}
  }
}
window.addEventListener('pointerdown',boot,true);
window.addEventListener('keydown',boot,true);
/* subtle click on any UI control */
document.addEventListener('pointerdown',function(e){
  var t=e.target;
  if(t&&t.closest&&t.closest('.mbtn,.bigbtn,.abtn,.lgcard,.dchip,.tgtbtn,.qbtn,.pbtn,.toggle,.swatch,.ans,.ctrlbtn'))
    sfx('click');
},true);

/* ---------- public API ---------- */
function set(key,val){
  S[key]=val;save();
  if(key==='theme'){applyTheme(val);return;}
  if(key==='motion'){document.body.classList.toggle('reduce-motion',!val);return;}
  if(!AC)return;
  if(key==='musicVol'){if(S.music){musicGain.gain.value=val;}}
  else if(key==='sfxVol'){if(S.sfx){sfxGain.gain.value=val;}}
  else if(key==='music'){
    musicGain.gain.value=val?S.musicVol:0;
    if(val){if(intended)music(intended);} else stopSeq(),curTrack=null;
  }
  else if(key==='sfx'){sfxGain.gain.value=val?S.sfxVol:0;}
}
function toggleMusic(){set('music',!S.music);return S.music;}
function toggleSfx(){set('sfx',!S.sfx);return S.sfx;}

/* apply saved theme immediately */
applyTheme(S.theme);

window.BKAudio={
  settings:S,music:music,sfx:sfx,set:set,
  toggleMusic:toggleMusic,toggleSfx:toggleSfx,applyTheme:applyTheme
};
})();

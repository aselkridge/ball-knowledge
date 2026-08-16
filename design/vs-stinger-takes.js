/* VS-SCREEN STINGER CANDIDATES · one function per take.
   Every one is REAL Web Audio, written the way audio.js writes sound, so
   whatever Aaron picks is pasted in rather than reinterpreted. Each takes
   (ac, out) so the same code renders offline for measurement and online
   for the audition page. */
window.VSC = {
/* TRIMS measured, not guessed: each candidate was rendered in an
   OfflineAudioContext and its peak read. crack came back at +4.1 dBFS and
   combo at +5.4, both clipping; these factors land every take near -2. */
_trim: {current:1, crack:0.50, impact:0.85, arc:1.70, combo:0.43},
_out: function(ac, out, name){
  var g = ac.createGain(); g.gain.value = VSC._trim[name] || 1;
  g.connect(out); return g;
},

/* A · WHAT SHIPS TODAY (the one he called horrible). Kept as the reference
   so the audition compares against the real thing, not a memory of it. */
current: function(ac, out0, t0){
  var t = t0 !== undefined ? t0 : ac.currentTime;
  var out = VSC._out(ac, out0, 'current');
  var o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(1800, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.18);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.4, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.23);
  var s = ac.createBufferSource(), f = ac.createBiquadFilter(), ng = ac.createGain();
  s.buffer = VSC._noise(ac); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 1.2;
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.5, t + 0.004);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  s.connect(f); f.connect(ng); ng.connect(out); s.start(t); s.stop(t + 0.15);
},

/* B · THE CRACK. What a strike actually is: a broadband transient whose
   brightness collapses downward, over a sub that drops away as the rumble.
   No pitch sweep, because a pitch sweep is what makes a laser a laser. */
crack: function(ac, out0, t0){
  var t = t0 !== undefined ? t0 : ac.currentTime;
  var out = VSC._out(ac, out0, 'crack');
  var s = ac.createBufferSource(); s.buffer = VSC._noise(ac);
  var hp = ac.createBiquadFilter(); hp.type = 'highpass';
  hp.frequency.setValueAtTime(2400, t);
  hp.frequency.exponentialRampToValueAtTime(160, t + 0.30);
  var g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.85, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.16);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.46);
  s.connect(hp); hp.connect(g); g.connect(out); s.start(t); s.stop(t + 0.5);
  var o = ac.createOscillator(), og = ac.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(88, t);
  o.frequency.exponentialRampToValueAtTime(34, t + 0.42);
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.75, t + 0.012);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.52);
  o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.56);
},

/* C · ARENA IMPACT. Not lightning at all: the deep hit sports broadcasts
   use when two logos slam together. Sub boom + a short metallic thwack. */
impact: function(ac, out0, t0){
  var t = t0 !== undefined ? t0 : ac.currentTime;
  var out = VSC._out(ac, out0, 'impact');
  var o = ac.createOscillator(), og = ac.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(72, t);
  o.frequency.exponentialRampToValueAtTime(27, t + 0.55);
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.9, t + 0.015);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
  o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.66);
  var s = ac.createBufferSource(); s.buffer = VSC._noise(ac);
  var bp = ac.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.value = 1100; bp.Q.value = 0.7;
  var g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  s.connect(bp); bp.connect(g); g.connect(out); s.start(t); s.stop(t + 0.16);
},

/* D · ELECTRIC ARC. The bolt as electricity, not weather: bandpass noise
   chopped by a fast LFO so it crackles, with a bright shimmer on top. */
arc: function(ac, out0, t0){
  var t = t0 !== undefined ? t0 : ac.currentTime;
  var out = VSC._out(ac, out0, 'arc');
  var s = ac.createBufferSource(); s.buffer = VSC._noise(ac);
  var bp = ac.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.setValueAtTime(2800, t);
  bp.frequency.exponentialRampToValueAtTime(900, t + 0.34);
  bp.Q.value = 2.4;
  var g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.7, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
  /* the crackle: an audio-rate LFO chopping the gain */
  var lfo = ac.createOscillator(), lg = ac.createGain();
  lfo.type = 'square'; lfo.frequency.setValueAtTime(58, t);
  lfo.frequency.exponentialRampToValueAtTime(19, t + 0.34);
  lg.gain.value = 0.55;
  lfo.connect(lg); lg.connect(g.gain);
  lfo.start(t); lfo.stop(t + 0.4);
  s.connect(bp); bp.connect(g); g.connect(out); s.start(t); s.stop(t + 0.4);
},

/* E · THE COMBO (my pick). The crack's transient, the impact's sub, and a
   short arc tail so the bolt reads as electric without turning into a
   laser. Three layers, 0.6s, one gesture. */
combo: function(ac, out0, t0){
  var t = t0 !== undefined ? t0 : ac.currentTime;
  var out = VSC._out(ac, out0, 'combo');
  /* 1 · the transient */
  var s = ac.createBufferSource(); s.buffer = VSC._noise(ac);
  var hp = ac.createBiquadFilter(); hp.type = 'highpass';
  hp.frequency.setValueAtTime(3000, t);
  hp.frequency.exponentialRampToValueAtTime(220, t + 0.26);
  var g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.8, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.14);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.40);
  s.connect(hp); hp.connect(g); g.connect(out); s.start(t); s.stop(t + 0.44);
  /* 2 · the body */
  var o = ac.createOscillator(), og = ac.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(80, t + 0.01);
  o.frequency.exponentialRampToValueAtTime(30, t + 0.50);
  og.gain.setValueAtTime(0.0001, t + 0.01);
  og.gain.exponentialRampToValueAtTime(0.85, t + 0.03);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.58);
  o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.62);
  /* 3 · the arc tail, quiet and short */
  var s2 = ac.createBufferSource(); s2.buffer = VSC._noise(ac);
  var bp = ac.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.setValueAtTime(2400, t + 0.05); bp.Q.value = 2.2;
  var g2 = ac.createGain();
  g2.gain.setValueAtTime(0.0001, t + 0.05);
  g2.gain.exponentialRampToValueAtTime(0.22, t + 0.07);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.30);
  var lfo = ac.createOscillator(), lg = ac.createGain();
  lfo.type = 'square'; lfo.frequency.value = 42; lg.gain.value = 0.16;
  lfo.connect(lg); lg.connect(g2.gain); lfo.start(t + 0.05); lfo.stop(t + 0.32);
  s2.connect(bp); bp.connect(g2); g2.connect(out); s2.start(t + 0.05); s2.stop(t + 0.34);
},

_noise: function(ac){
  if(ac.__nb) return ac.__nb;
  var len = Math.floor(ac.sampleRate * 1.2);
  var b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
  /* deterministic noise so offline measurement and playback agree */
  var seed = 12345;
  for(var i = 0; i < len; i++){
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    d[i] = (seed / 0x3fffffff) - 1;
  }
  ac.__nb = b; return b;
}
};

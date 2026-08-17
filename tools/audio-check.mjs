/* THE MUSIC MUST NEVER PLAY OVER ITSELF. :8899.
   Aaron, 08-16, on an iPhone: "when the game starts it's like the song starts
   three times and is playing over itself, and it sounds chaotic."

   Headless Chromium could NOT reproduce it, and that was the finding: iOS
   Safari treats HTMLMediaElement.volume as READ-ONLY. Writes are silently
   dropped and it stays at 1. Every "keep it quiet with volume 0" assumption
   in audio.js is therefore false on the platform he plays on.

   So this suite emulates that ONE behaviour and judges audibility the way iOS
   does: a track is audible when it is unpaused and unmuted, never mind what
   .volume claims. Under that lens the old boot unlock played the menu AND the
   game track at full volume at the first tap.

   SABOTAGE-PROVED: restoring the old unlock (play both, pause the wrong one
   in a .then) turns check 1 red with "grounded.mp3 + mole-soul.mp3". */
import pw from 'playwright';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
let pass = 0; const fails = [];
const ck = (m, x, n) => { (x ? pass++ : fails.push(m));
  console.log(`  ${x ? 'PASS' : 'FAIL'}  ${m}${n ? '   [' + n + ']' : ''}`); };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 },
  hasTouch: true, isMobile: true });
await ctx.addInitScript(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
    get() { return 1; }, set() { /* iOS drops this */ }, configurable: true });
  window.__auds = []; window.__overlap = []; window.__ev = [];
  const NA = window.Audio;
  window.Audio = function (s) { const a = new NA(s); window.__auds.push(a); return a; };
  window.Audio.prototype = NA.prototype;
  const op = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    window.__ev.push((this.src || '').split('/').pop() + (this.muted ? ' (muted)' : ''));
    return op.apply(this, arguments);
  };
  setInterval(() => {
    const on = window.__auds.filter(a => !a.paused && !a.muted)
      .map(a => (a.src || '').split('/').pop());
    if (on.length > 1) window.__overlap.push(on.join(' + '));
  }, 50);
});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
await p.goto(BASE, { waitUntil: 'networkidle' });
await sleep(1300);

/* the first tap is what unlocks audio, and on his phone it is often the very
   tap that starts a game, so this is the moment under test */
await p.evaluate(() => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
await sleep(2000);
await p.evaluate(() => window.BK._show('versus')); await sleep(300);
await p.evaluate(() => window.BK._show('game'));   await sleep(2600);
await p.evaluate(() => window.BK._show('daily'));  await sleep(2000);
await p.evaluate(() => window.BK._show('title'));  await sleep(2000);

const ov = await p.evaluate(() => window.__overlap);
ck('no two tracks are ever audible at once (iOS rules: unpaused + unmuted)',
   ov.length === 0, ov.length ? ov.length + ' samples, first: ' + ov[0] : 'clean');

const unlock = await p.evaluate(() => window.__ev.slice(0, 2));
ck('the boot unlock is MUTED, so it cannot be heard',
   unlock.length >= 2 && unlock.every(e => /muted/.test(e)), unlock.join(' | '));

/* the boombox pointed at a key with no file. Measured symptom: music() bails
   on an unknown key before touching getEl, so nothing broke loudly, it just
   showed a song name over silence while the previous track kept playing. */
const keys = await p.evaluate(() => ({
  order: window.BKAudio._order ? window.BKAudio._order() : null,
  names: window.BKAudio._names ? window.BKAudio._names() : null,
  tracks: window.BKAudio._tracks ? window.BKAudio._tracks() : null }));
if (keys.order && keys.tracks) {
  const bad = keys.order.filter(k => !keys.tracks[k]);
  ck('every boombox track resolves to a real file', bad.length === 0, bad.join(',') || 'all 8 resolve');
  const badN = keys.order.filter(k => !keys.names[k]);
  ck('every boombox track has a display name', badN.length === 0, badN.join(',') || 'all named');
} else {
  ck('every boombox track resolves to a real file', false, 'no debug surface exposed');
}

/* and the whole playlist survives a walk: one bad key used to poison it all */
const walk = await p.evaluate(async () => {
  const seen = [], dead = [];
  for (let i = 0; i < 8; i++) {
    window.BKAudio.mpCycle(1);
    await new Promise(r => setTimeout(r, 1100));
    const st = window.BKAudio.mpState();
    seen.push(st.name);
    if (!st.playing) dead.push(st.name);
  }
  return { seen, dead, broken: window.BKAudio.mpState().broken };
});
/* asserts PLAYING, not merely named: the old playlist listed a key with no
   file, and music() bailed on it before doing anything, so the boombox showed
   "Follow My Soul" over silence while the previous song kept running. A name
   check would have shrugged at that; this does not. */
ck('every boombox entry actually plays when selected',
   !walk.broken && walk.dead.length === 0,
   (walk.broken ? 'BROKEN · ' : '') + (walk.dead.length ? 'SILENT: ' + walk.dead.join(',') : walk.seen.join(' > ')));

ck('zero page errors', errs.length === 0, errs[0] || '');
await b.close();
console.log('\n' + (fails.length ? fails.length + ' FAILING: ' + fails.join(' · ') : 'ALL ' + pass + ' PASS'));
process.exit(fails.length ? 1 : 0);

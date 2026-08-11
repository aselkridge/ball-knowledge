/* D25, the coach card that would not leave, checked.
 *
 *   node tools/coach-first-check.mjs       (needs docs/ served on :8899)
 *   python3 -m http.server 8899 -d docs &
 *
 * Tester #1's phone (V0 D25, screenshots in BUILD.md 6c): the first-run card
 * fired onto the Rulebook as he came out of a drill, wore a "CLOCK STOPPED AT
 * :16" header borrowed from a daily clock that had leaked, and stayed parked
 * over every screen he visited. Four causes, four fixes, each checked here:
 *
 *   1  the 440ms/700ms race: show() keeps the outgoing game screen 'on' while
 *      it slides out, the watcher ticked into that window after endDrill()
 *      -> watcher now holds its tongue while any .screen.sOut exists
 *   2  the daily clock leak: clockHold(true) vouched for a timer whose screen
 *      was gone -> leaving() clockStop()s; hold(true) off-screen kills + 0
 *   3  storage-dead re-fire: markSeen into broken localStorage never sticks,
 *      the card is reborn every 700ms -> memSeen keeps the session honest
 *   4  no zombie survives: whatever births a stuck modal card off its screen,
 *      the watcher's janitor tick tears it down; Coach off always wins
 *
 * Break-it, proven on 2026-08-10 (each reverted alone, run goes red):
 *   drop the .screen.sOut guard in coach.js        -> checks 4-6 fail
 *   drop the scr.classList check in clockHold      -> checks 8-9 fail
 *   drop memSeen from seen()                       -> check 12 fails
 *   drop the janitor block                         -> checks 14-16 fail
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8899/play/';
let pass = 0, fail = 0;
const ok = (n, c, d = '') => {
  if (c) { pass++; console.log(`  ok   ${n}${d ? '  ' + d : ''}`); }
  else { fail++; console.log(`  FAIL ${n}${d ? '  ' + d : ''}`); }
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox', '--mute-audio'] });
const c = await b.newContext({ viewport: { width: 390, height: 844 },
                               isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const p = await c.newPage();
p.on('pageerror', e => { fail++; console.log('  FAIL page error  ' + e.message); });
await p.goto(BASE);
/* The load screen advances ITSELF ~1.2s after boot (the :24 clock ticking to
   :20 fires show('title')), and that show() tears down any drill a too-eager
   harness has started. The first version of this file waited a flat 900ms and
   its opening laps raced the loader. Wait for the menu, not for a number. */
await p.waitForFunction(() =>
  !document.getElementById('screen-load').classList.contains('on'), { timeout: 8000 });
await p.waitForTimeout(400);

const tipOn = () => p.evaluate(() =>
  !!(document.getElementById('coachTip') &&
     document.getElementById('coachTip').classList.contains('on')));

// ---- 1-3  the race window exists exactly as diagnosed ----------------------
// End a drill for real and stand in the 440ms slide-out: before the fix the
// watcher fired 'first' here ~63% of the time. Loop it so a pass is proof,
// not luck: 5 exits, zero cards.
const gates = await p.evaluate(() => ({
  drill: !!window.BKDrill, coach: !!window.BKCoach,
  daily: !!(window.BKDaily && BKDaily._hold),
}));
ok('1 BKDrill api up', gates.drill);
ok('2 BKCoach api up', gates.coach);
ok('3 BKDaily._hold up', gates.daily);

// A real drill exit first (builds the game state every other gate needs, and
// smoke-tests the live path), then the window held OPEN by hand: the real
// race gives the watcher a 440ms target on a 700ms cadence, which makes a
// wall-clock check a coin flip in BOTH directions. Pinning the exact gate
// state (game screen 'on'+'sOut', drill off, 'first' unseen) and waiting out
// two guaranteed ticks decides it deterministically: fixed code stays silent,
// unguarded code fires within one tick, every run.
await p.evaluate(() => { localStorage.setItem('bk_coach', '1'); BKDrill.start(BKDrill.list[0]); });
await p.waitForTimeout(400);
await p.evaluate(() => BKDrill.end());
await p.waitForTimeout(1200);                    // transition fully settled
ok('4 real drill exit leaves no card behind', !(await tipOn()));
await p.evaluate(() => {                         // hold Malik's window open
  localStorage.removeItem('bk_coach_seen');
  document.getElementById('screen-game').classList.add('on', 'sOut');
});
await p.waitForTimeout(1600);                    // two watcher ticks, guaranteed
const inWindow = await tipOn();
await p.evaluate(() =>
  document.getElementById('screen-game').classList.remove('on', 'sOut'));
ok('5 watcher holds its tongue while a screen slides out', !inWindow);
await p.waitForTimeout(800);
ok('6 and still no card once the window closes', !(await tipOn()));

// ---- 7-9  the daily clock cannot vouch off-screen --------------------------
// A REAL armed clock, not a staged one: ?daily=wipe lands on a fresh run with
// the first card dealt and clockStart() live. The first version of this block
// never armed anything, which made its checks decorative (the B6 lesson), and
// the arming check (7) is what proves the other two are testing something.
await p.goto(BASE + '?daily=wipe');
await p.waitForTimeout(1200);
let armed = 0;
for (let i = 0; i < 10 && !armed; i++) {          // poll: deal animations vary
  armed = await p.evaluate(() => {
    const h = BKDaily._hold(true);
    if (h) BKDaily._hold(false);                  // hands off, just probing
    return h;
  });
  if (!armed) await p.waitForTimeout(400);
}
ok('7 fresh daily run arms a real clock', armed > 0, `${armed}ms live`);
const held = await p.evaluate(() => {
  window.BK._show('title');                       // walk out mid-card
  return new Promise(res => setTimeout(() => res(BKDaily._hold(true)), 500));
});
ok('8 _hold(true) off the daily screen returns 0', held === 0, `got ${held}`);
const relock = await p.evaluate(() => BKDaily._hold(true));
ok('9 and again after the kill, still 0', relock === 0);

// ---- 10-12  storage-dead phones cannot loop the card -----------------------
const loop = await p.evaluate(() => new Promise(res => {
  localStorage.removeItem('bk_coach_seen');
  const realSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function () { throw new Error('quota'); }; // private-mode phone
  BKCoach.tip('probe1', 'storage-dead probe', true);
  const shownOnce = document.getElementById('coachTip').classList.contains('on');
  document.querySelector('#coachTip .ct-ok').click();
  const hid = !document.getElementById('coachTip').classList.contains('on');
  BKCoach.tip('probe1', 'storage-dead probe', true);   // same key: must NOT return
  const reborn = document.getElementById('coachTip').classList.contains('on');
  Storage.prototype.setItem = realSet;
  res({ shownOnce, hid, reborn });
}));
ok('10 card shows with storage dead', loop.shownOnce);
ok('11 Got it dismisses with storage dead', loop.hid);
ok('12 same key never re-fires in the session', !loop.reborn);

// ---- 13-16  the janitor: no zombie survives, Coach off always wins ---------
await p.evaluate(() => {   // resurrect Malik's exact zombie by hand
  localStorage.removeItem('bk_coach_seen');
  localStorage.setItem('bk_coach', '1');
  BKCoach.tip('probe2', 'zombie probe', true);         // modal pause card
  window.BK._show('title');                            // walk away from it
});
ok('13 zombie staged (card on, menu up)', await tipOn());
await p.waitForTimeout(1600);                          // two janitor ticks
ok('14 janitor tears down the orphaned modal card', !(await tipOn()));
const offWins = await p.evaluate(() => new Promise(res => {
  BKCoach.tip('probe3', 'coach-off probe', true);
  localStorage.setItem('bk_coach', '0');               // Coach off by any path
  setTimeout(() => res(
    !document.getElementById('coachTip').classList.contains('on')), 1600);
}));
ok('15 Coach off kills a visible card within two ticks', offWins);
const menuTipSafe = await p.evaluate(() => new Promise(res => {
  localStorage.setItem('bk_coach', '1');
  BKCoach.say('probe4', 'menu card probe', null, null); // legit menu card
  setTimeout(() => res(
    document.getElementById('coachTip').classList.contains('on')), 1600);
}));
ok('16 a legitimate MENU card is NOT janitored', menuTipSafe);

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);

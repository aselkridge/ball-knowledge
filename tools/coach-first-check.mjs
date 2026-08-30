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

// ---- 17-18  NO FIRST-TIME COACH ONLINE (Aaron ruled it, 2026-08-23) --------
// The gate sits in tipShow above markSeen, so an online game must neither
// show a tip nor burn its one-time flag. NET.on is flipped by hand because a
// real room needs a second phone; the gate only reads the flag.
const online = await p.evaluate(() => new Promise(res => {
  localStorage.setItem('bk_coach', '1');
  BKCoach.hide();   // check 16 leaves its menu card up; a stale ON reads as a leak
  const net = window.BK.coach.net;
  net.on = true;
  BKCoach.tip('probe5', 'online probe', true);
  setTimeout(() => {
    const shown = document.getElementById('coachTip').classList.contains('on');
    const burned = BKCoach.seenKey('probe5');
    net.on = false;
    res({ shown, burned });
  }, 900);
}));
ok('17 ONLINE: no tip is shown', !online.shown);
ok('18 ONLINE: and the one-time flag is NOT burned', !online.burned);

/* ---- HE INTRODUCES HIMSELF BY TEACHING (Aaron 08-29) --------------------
   He used to open with a card about himself, and the install card opened
   with the same three words one screen earlier: "it reads as cheaply
   designed." The rule now, and the rest of the coach already obeyed it: his
   first words are a LESSON, the situating line rides quietly under it once
   ever, and no two coach surfaces share an opener. */
{
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const p2 = await (await b.newContext({ viewport:{width:390,height:844},
    hasTouch:true, isMobile:true,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) '+
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
  })).newPage();
  await p2.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p2.evaluate(()=>localStorage.clear());
  await p2.reload({waitUntil:'networkidle'});
  /* the title card, which on a phone offers the home screen */
  let title='';
  for(let i=0;i<30;i++){await sleep(200);
    title=await p2.evaluate(()=>{const e=document.getElementById('coachTip');
      return e&&e.classList.contains('on')?e.querySelector('.ct-txt').textContent.trim():'';});
    if(title)break;}
  ok('19 the title card still greets a phone', !!title, title.slice(0,40));
  await p2.evaluate(()=>{const c=document.querySelector('#coachTip.on .ct-ok');if(c)c.click();});
  /* his first words in play */
  await p2.evaluate(()=>{const C=window.BK.coach;C.show('game');
    C.startGame({league:'nba',decade:['FULL'],target:11,rosters:C.pickRosters('nba',['FULL'])},true);});
  let lesson=null;
  for(let i=0;i<40&&!lesson;i++){await sleep(200);
    lesson=await p2.evaluate(()=>{const e=document.getElementById('coachTip');
      if(!e||!e.classList.contains('on'))return null;
      const sub=e.querySelector('.ct-txt .ct-sub');
      return {txt:e.querySelector('.ct-txt').textContent.replace(/\s+/g,' ').trim(),
        sub:!!sub, subN:e.querySelectorAll('.ct-txt .ct-sub').length};});}
  ok('20 his first words in play are a LESSON, not a card about himself',
     !!lesson && !/first time\?|chime in as things|coach off and run solo/i.test(lesson.txt),
     lesson ? lesson.txt.slice(0,52) : 'no card');
  ok('21 the situating line rides UNDER it, exactly once',
     !!lesson && lesson.sub && lesson.subN===1, lesson ? 'subs='+lesson.subN : '-');
  /* THE COLLISION HE CAUGHT: two systems opening with the same words */
  /* compared as WORDS, not characters. A 14-character slice called "First
     time here." and "First time? I'll" different, which is exactly the
     collision he was pointing at, so the sabotage sailed through green
     until this was fixed (08-29). A reader hears the opening words. */
  const words=t=>t.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(Boolean).slice(0,2).join(' ');
  const openA=words(title), openB=lesson?words(lesson.txt):'';
  ok('22 the title card and his first lesson do NOT share an opener',
     openA && openB && openA!==openB, JSON.stringify(openA)+' vs '+JSON.stringify(openB));
  /* and never again */
  await p2.evaluate(()=>{const c=document.querySelector('#coachTip.on .ct-ok');if(c)c.click();});
  await sleep(400);
  await p2.evaluate(()=>window.BKCoach.tip('probe-second','<b>Answer to play.</b> Right answer, the move happens.',true));
  await sleep(500);
  const second=await p2.evaluate(()=>{const e=document.getElementById('coachTip');
    return {on:e.classList.contains('on'),sub:e.querySelectorAll('.ct-txt .ct-sub').length};});
  ok('23 and no card after it repeats the situating line',
     second.on && second.sub===0, 'subs='+second.sub);
  await p2.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);

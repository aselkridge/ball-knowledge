/* B6, the in-game feedback button, checked.
 *
 *   node tools/feedback-check.mjs          (needs docs/ served on :8899)
 *   python3 -m http.server 8899 -d docs &
 *
 * The three things that would make this feature worthless while still looking
 * finished, and all three are checked:
 *   the context reports "undefined" for the fields that matter, because it
 *     guessed at the accessor names instead of reading game.js
 *   the card opens UNDERNEATH the veil whose button opened it
 *   a report is lost when the share sheet is dismissed
 *
 * Break-it: change `st.score` to `st.pts` in feedback.js and checks 12-15 fail.
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
await c.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:8899' });
const p = await c.newPage();
p.on('pageerror', e => { fail++; console.log('  FAIL page error  ' + e.message); });
await p.goto(BASE);
await p.waitForTimeout(900);

// ---- 1-4  it mounted, everywhere it was supposed to ------------------------
const mounted = await p.evaluate(() => ({
  api: !!window.BKFeedback,
  kinds: window.BKFeedback ? window.BKFeedback._kinds.length : 0,
  veil: !!document.getElementById('fbveil'),
  pause: !!document.querySelector('#pauseveil .fb-open'),
  end: !!document.querySelector('#endveil .fb-open'),
  settings: !!document.querySelector('#screen-settings .fb-open'),
  // the pause entry must sit ABOVE Exit to menu: a feedback button under the
  // door people leave through is a button nobody presses.
  beforeExit: (() => {
    const m = document.querySelector('#pauseveil .menu');
    if (!m) return false;
    const k = [...m.children];
    return k.indexOf(m.querySelector('.fb-open')) < k.indexOf(document.getElementById('pExit'));
  })(),
}));
ok('BKFeedback exists', mounted.api);
ok('three kinds, not a form', mounted.kinds === 3, `${mounted.kinds}`);
ok('mounted in the pause menu, above Exit', mounted.pause && mounted.beforeExit);
ok('mounted on the end veil', mounted.end);
ok('mounted in Settings', mounted.settings);

// ---- 5-9  the card opens, and opens ON TOP ---------------------------------
await p.evaluate(() => BKFeedback.open());
await p.waitForTimeout(250);
const open1 = await p.evaluate(() => {
  const v = document.getElementById('fbveil');
  const r = v.getBoundingClientRect();
  const hit = document.elementFromPoint(r.width / 2, r.height / 2);
  return {
    on: v.classList.contains('on'),
    z: +getComputedStyle(v).zIndex,
    pausez: +getComputedStyle(document.getElementById('pauseveil')).zIndex,
    topmost: !!(hit && v.contains(hit)),
    sendDisabled: document.getElementById('fbSend').disabled,
    rows: document.querySelectorAll('#fbRows div').length,
  };
});
ok('the card opens', open1.on);
ok('above the pause veil', open1.z > open1.pausez, `${open1.z} vs ${open1.pausez}`);
ok('and is the topmost thing at its centre', open1.topmost);

// SABOTAGE FOUND THIS ONE TOO. Dropping the z-index to 30 failed the numeric
// check and PASSED the topmost check, because nothing was actually above it:
// the pause veil was closed. A stacking check with nothing to stack against is
// decorative. So raise the veil first, then open the card from inside it.
const stacked = await p.evaluate(() => {
  BKFeedback.close();          /* it is open from the probe above, and an open
                                  card covers the button it was opened from */
  const pv = document.getElementById('pauseveil');
  pv.classList.add('on');
  /* order matters and the first version got it wrong: with the card already
     open it covers the very button it was opened from, so "unreachable" was
     the probe's own doing. Check the button with the veil up and the card
     CLOSED, then open the card and check the card. */
  const btn = document.querySelector('#pauseveil .fb-open');
  const br = btn.getBoundingClientRect();
  const bhit = document.elementFromPoint(br.x + br.width / 2, br.y + br.height / 2);
  const btnReachable = !!(bhit && btn.contains(bhit));
  BKFeedback.open();
  const v = document.getElementById('fbveil');
  const r = v.getBoundingClientRect();
  const hit = document.elementFromPoint(r.width / 2, r.height / 2);
  const out = { topmost: !!(hit && v.contains(hit)), btnReachable: btnReachable };
  BKFeedback.close();
  pv.classList.remove('on');
  return out;
});
ok('topmost WITH the pause veil actually raised', stacked.topmost);
ok('and the pause menu button is reachable in the first place', stacked.btnReachable);
await p.evaluate(() => BKFeedback.open());   /* the stacked probe closed it */
await p.waitForTimeout(150);
ok('Send is disabled until a kind is picked', open1.sendDisabled);
ok('the attached context is SHOWN, not hidden', open1.rows >= 5, `${open1.rows} rows`);

// ---- 10-11  picking a kind arms it ----------------------------------------
await p.click('.fb-kind[data-k=bug]');
await p.waitForTimeout(120);
const armed = await p.evaluate(() => ({
  on: document.querySelectorAll('.fb-kind.on').length,
  send: !document.getElementById('fbSend').disabled,
  ph: document.getElementById('fbText').placeholder,
}));
ok('exactly one kind selects', armed.on === 1, `${armed.on}`);
ok('Send arms, and the prompt changes to match', armed.send && /went wrong/i.test(armed.ph));

// ---- 12-15  THE CONTEXT IS REAL. This is the one that catches a guessed
// accessor: start an actual CPU game and demand real values, not "undefined".
await p.evaluate(() => BKFeedback.close());
await p.evaluate(() => {
  BK._srRoll('nba');
  BK.coach.startGame();
});
await p.waitForTimeout(2600);
const ctx = await p.evaluate(() => BKFeedback._ctx());
const body = await p.evaluate(() => BKFeedback._report('bug', 'test note', BKFeedback._ctx()));
ok('score is a real scoreline', /^\d+ - \d+$/.test(ctx.score || ''), JSON.stringify(ctx.score));
ok('mode, phase and possession are all set',
   !!ctx.mode && !!ctx.phase && !!ctx.possession,
   `${ctx.mode} / ${ctx.phase} / ${ctx.possession}`);
ok('the target is named', /first to \d+|4 quarters/.test(ctx.target || ''), JSON.stringify(ctx.target));
// SABOTAGE FOUND THIS CHECK WAS SOFT. Swapping state.score for state.pts made
// grab() return null, which DROPS the field rather than writing "undefined", so
// the no-undefined test sailed through on 14 fields instead of 15. A count floor
// is what actually bites: a silently vanished field is the failure mode here,
// not a visible "undefined".
ok('nothing reports undefined', !/undefined/.test(JSON.stringify(ctx)) && !/undefined/.test(body),
   Object.keys(ctx).length + ' fields');
ok('and no field silently vanished', Object.keys(ctx).length >= 15,
   Object.keys(ctx).length + ' of 15 expected in a live game');
ok('the report carries the note and the context',
   body.includes('test note') && body.includes('phase:'));

// ---- 16-18  nothing is lost -----------------------------------------------
await p.evaluate(() => BKFeedback.clear());
await p.evaluate(() => BKFeedback.open());
await p.click('.fb-kind[data-k=idea]');
await p.fill('#fbText', 'the corner three should pay more');
// no navigator.share in headless chromium, so this exercises the clipboard path
await p.click('#fbSend');
await p.waitForTimeout(500);
const stored = await p.evaluate(() => BKFeedback.all());
ok('the report is stored before it is sent', stored.length === 1, `${stored.length} stored`);
ok('with its kind and its words',
   stored[0] && stored[0].kind === 'idea' && /corner three/.test(stored[0].text));
ok('and its context', stored[0] && !!stored[0].ctx && !!stored[0].ctx.where);

// ---- 19-20  it survives a reload, and dumps ---------------------------------
await p.reload(); await p.waitForTimeout(900);
const after = await p.evaluate(() => ({ n: BKFeedback.all().length, dump: BKFeedback.dump() }));
ok('it survives a reload', after.n === 1, `${after.n}`);
ok('and dumps as readable text', /BALL KNOWLEDGE/.test(after.dump) && /corner three/.test(after.dump));

// ---- 21-22  touch targets, on glass ----------------------------------------
const glass = await p.evaluate(() => {
  const layout = document.documentElement.clientWidth;
  BKFeedback.open();
  const sizes = [...document.querySelectorAll('.fb-kind, #fbSend, .fb-x')]
    .map(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height) * (390 / layout); });
  return { layout, min: Math.min(...sizes), n: sizes.length };
});
ok('layout viewport is the device', glass.layout === 390, `${glass.layout}px`);
ok('every control clears 30px of finger', glass.min >= 30,
   `smallest ${glass.min.toFixed(1)}px of ${glass.n}`);

await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

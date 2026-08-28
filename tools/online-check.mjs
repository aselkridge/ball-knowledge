/* THE ONLINE GATE (row 207): two real phones, one real relay, one shared
   game. Until 08-28 nothing in the fleet had ever watched an event cross the
   wire, in a project whose launch is a group chat playing online.

   What it asserts, on the walked road (no _show teleports):
     1 · both peers reach screen-game with zero page errors
     2 · the identities crossed: each side knows both squad names
     3 · both agree whose ball it is and what the score is
     4 · both are running the SAME possession model, read by behaviour
         (an mb-pick phase seen = Method B; none seen = classic).
         Row 128 shipped 08-28: online full-court IS Method B, and this
         gate holds the carry (the ritual's 'mbset'/'mbdone' verbs).

   Run:      node tools/online-check.mjs         (site :8899, relay :8901)
   Sabotage: SABOTAGE=relay  · the relay port is dead, the join must fail red
             SABOTAGE=split  · the guest's state is forged after landing, the
                               cross-peer comparison must catch it red */
import { twoPeer, toGame } from '/home/user/ball-knowledge/tools/two-peer.mjs';
import { spawn } from 'child_process';
import http from 'http';

/* the gate brings its own relay, so gates.mjs needs no setup step: if
   nothing answers on :8901 it spawns server/index.js and kills it on exit */
let relayProc = null;
const relayUp = () => new Promise(res => {
  const rq = http.get('http://127.0.0.1:8901/health', r => { r.resume(); res(r.statusCode === 200); });
  rq.on('error', () => res(false)); rq.setTimeout(1500, () => { rq.destroy(); res(false); });
});
if (!(await relayUp())) {
  relayProc = spawn('node', ['/home/user/ball-knowledge/server/index.js'],
    { env: { ...process.env, PORT: '8901' }, stdio: 'ignore' });
  for (let i = 0; i < 20 && !(await relayUp()); i++) await new Promise(r => setTimeout(r, 500));
  if (!(await relayUp())) { console.log('  FAIL the relay would not start'); process.exit(1); }
}
process.on('exit', () => { if (relayProc) try { relayProc.kill(); } catch (e) {} });

const SAB = process.env.SABOTAGE || '';
if (SAB === 'relay') process.env.RELAY = '8990';   /* nothing listens there */
const MODEL_WANT = 'methodb';                      /* flipped 08-28, row 128 shipped */

let ok = 0, fail = 0;
const t2 = (name, cond, got) => {
  if (cond) ok++;
  else { fail++; console.log('  FAIL ' + name + (got !== undefined ? ' · got ' + got : '')); }
};

let t;
try {
  t = await twoPeer();
} catch (e) {
  /* no room, no game: red unless that IS the sabotage */
  console.log((SAB === 'relay' ? '' : '  FAIL ') + 'the road never opened: ' + String(e).slice(0, 90));
  console.log(SAB === 'relay' ? '0 ok · 1 fail (SABOTAGE RUN: red is correct)' : '0 ok · 1 fail');
  process.exit(SAB === 'relay' ? 0 : 1);
}
if (SAB === 'relay') { console.log('SABOTAGE=relay reached a room, which must never happen'); process.exit(1); }

/* watch every phase both sides pass through, so the possession model is read
   from behaviour rather than from a variable the page does not export */
for (const p of t.pages) await p.evaluate(() => {
  window.__phases = new Set();
  const tick = () => {
    try { const s = window.BK.coach.state(); if (s && s.phase) window.__phases.add(s.phase); } catch (e) {}
    requestAnimationFrame(tick);
  };
  tick();
});

const road = await toGame(t, 22);

/* 1 · both landed, cleanly */
const at = [];
for (const p of t.pages) at.push(await p.evaluate(() => (document.querySelector('.screen.on') || {}).id));
t2('both peers reach the game on the walked road', at.every(x => x === 'screen-game'),
  at.join(' / ') + '  (' + road.map(r => r.length + ' stops').join(', ') + ')');
t2('zero page errors on either phone', t.errs[0].length + t.errs[1].length === 0,
  (t.errs[0][0] || t.errs[1][0] || '').slice(0, 80));

if (SAB === 'split') await t.guest.evaluate(() => { window.BK.coach.state().offense ^= 1; });

/* ---- the tip: host buzzes its own zone and answers right ---------------- */
await t.until(t.host, () => document.getElementById('tipveil') &&
  document.getElementById('tipveil').classList.contains('on') ? true : null, 'the tip veil', 20000)
  .catch(() => {});
await t.host.evaluate(() => { const z = document.getElementById('tzA'); if (z) z.click(); });
await t.until(t.host, () => document.querySelector('#tipAns .ans') ? true : null,
  'the tip answers', 8000).catch(() => {});
await t.host.evaluate(() => {
  const b = document.querySelector('#tipAns .ans[data-ok="1"]'); if (b) b.click(); });
await t.sleep(2200);

/* ---- read both sides of the wire at rest -------------------------------- */
const view = [];
for (const p of t.pages) view.push(await p.evaluate(() => {
  const s = window.BK.coach.state();
  return { offense: s.offense, score: (s.score || []).join('-'),
    mbGame: window.BK._mb().game, phases: [...window.__phases] };
}));
const names = [];
for (const p of t.pages) names.push(await p.evaluate(() =>
  (document.getElementById('hudNmA') || {}).textContent + '|' +
  (document.getElementById('hudNmB') || {}).textContent));

t2('both squads are on both scoreboards, identically', !!names[0] && names[0] === names[1], names.join(' vs '));
t2('both agree whose ball it is', view[0].offense === view[1].offense,
  view[0].offense + ' vs ' + view[1].offense);
t2('both agree on the score', view[0].score === view[1].score,
  view[0].score + ' vs ' + view[1].score);
t2('the Method B latch is up on both phones (row 128)',
  view.every(v => v.mbGame === true), view.map(v => v.mbGame).join('/'));

/* ---- drive real beats until the ritual has crossed ---------------------- */
/* Each phone acts only where a player could: the offense phone stages through
   the same commit hinge the confirm button presses, cards are answered on
   whichever phone shows them, the defense phone presses its own Stay put, and
   the shape carousel is driven card-then-RUN-IT. Everything crosses the wire
   as the product's own events; the check never reaches into the other phone. */
const act = (p, role) => p.evaluate(async myRole => {
  const BK = window.BK, st = BK.coach.state(), mb = BK._mb();
  const vis = e => e && e.getBoundingClientRect().width > 0;
  const out = x => ({ did: x });
  /* a question card outranks everything. THE DRIVE'S HOUSE STYLE: the
     offense answers right, the defense answers wrong, so every threat
     resolves toward a bucket and the dead ball the ritual needs (a defense
     that answers right spawns rim tap-off battles that can rally forever,
     which is exactly what round 13-32 of the first traced run did). */
  const qv = document.getElementById('qveil');
  if (qv && qv.classList.contains('on')) {
    const want = st.offense === myRole ? '1' : '0';
    const b = document.querySelector('#qveil .ans[data-ok="' + want + '"]');
    if (b && !b.disabled) { b.click(); return out('answered-' + (want === '1' ? 'right' : 'wrong')); }
    return out('card-wait');
  }
  /* the release meter locks itself after 3s ('good'), never a shank */
  if (st.phase === 'meter') return out('meter-wait');
  /* the shape carousel, when it is this phone's pick */
  const car = document.getElementById('mbCar');
  if (car) {
    const card = car.querySelector('.mbcard');
    if (card) { card.click();
      await new Promise(r => setTimeout(r, 700));
      const go = car.querySelector('.mbc-go');
      if (go) { go.click(); return out('ran-shape'); } }
    return out('carousel-wait');
  }
  if (st.phase === 'mb-pick') return out('ritual-wait');
  /* my defense: stay put so the beat advances */
  const skip = document.getElementById('aSkip');
  if (st.phase === 'def-slide' && st.offense !== myRole && vis(skip)) {
    skip.click(); return out('stayput'); }
  /* my setup half: Done (the free moves are proven by turn-economy solo) */
  const done = document.getElementById('aMbDone');
  if (mb.setup && st.offense === myRole && vis(done)) { done.click(); return out('done'); }
  /* my action, through the REAL tap path (BK._tapAt is the same fn a finger
     reaches, so myAction(), selection, menus and staging all render for real):
     select the carrier, SHOOT if the menu offers it, else step one square
     toward the attacked rim and confirm. One gesture per round. */
  if (st.offense === myRole && (st.phase === 'off-select' || st.phase === 'off-move') && !mb.setup) {
    const h = st.ball.holder, pc = st.pieces[h];
    const ts = (c, r) => { const q = BK.tileToScreen(c, r); return [q.x, q.y]; };
    const sBtn = document.getElementById('aShoot');
    if (vis(sBtn)) { sBtn.click(); return out('shoot'); }
    const go = document.getElementById('aGo');
    if (vis(go)) { go.click(); return out('confirm'); }
    if (st.selected !== h) { BK._tapAt(...ts(pc.c, pc.r)); return out('select-carrier'); }
    const rimRight = st.offense === 0;
    const dc = rimRight ? 1 : -1;
    const taken = new Set(st.pieces.filter(x => x.c >= 0).map(x => x.c + ',' + x.r));
    for (const [c, r] of [[pc.c + dc, pc.r], [pc.c + dc, pc.r + 1], [pc.c + dc, pc.r - 1], [pc.c, pc.r + 1]]) {
      if (c < 0 || r < 0 || c > 14 || r > 7 || taken.has(c + ',' + r)) continue;
      BK._tapAt(...ts(c, r)); return out('tap-move ' + c + ',' + r);
    }
    return out('boxed-in');
  }
  return out('wait:' + st.phase);
}, role);

let setupSeen = [false, false], doneHeld = [null, null];
for (let round = 0; round < 60; round++) {
  for (const [k, p] of t.pages.entries()) {
    const r = await act(p, t.roles[k].role);
    if (process.env.TRACE) console.log('   ', round, k, r.did);
  }
  await t.sleep(1300);
  const st = [];
  for (const p of t.pages) st.push(await p.evaluate(() => ({
    setup: window.BK._mb().setup, phase: window.BK.coach.state().phase,
    done: !!document.getElementById('aMbDone'),
    dSet: window.BK._mb().dSet, oSet: window.BK._mb().oSet })));
  st.forEach((x, k) => { if (x.setup) { setupSeen[k] = true;
    if (doneHeld[0] === null) doneHeld = [st[0].done, st[1].done]; } });
  /* stop when the ritual has fully crossed: both shapes set on both phones */
  if (st.every(x => x.dSet && x.oSet)) break;
}

/* the possession model, by behaviour, now that beats have been played */
const after = [];
for (const p of t.pages) after.push(await p.evaluate(() => ({
  phases: [...window.__phases], dSet: window.BK._mb().dSet, oSet: window.BK._mb().oSet,
  score: (window.BK.coach.state().score || []).join('-') })));

t2('one action opens the free-setup half on BOTH phones',
  setupSeen[0] && setupSeen[1], setupSeen.join('/'));
t2('and only the offense phone held the Done',
  doneHeld[0] !== null && (doneHeld[0] !== doneHeld[1]), doneHeld.join('/'));
const model = after.map(v => v.phases.some(ph => /^mb-/.test(ph)) ? 'methodb' : 'classic');
t2('both phones run the same possession model', model[0] === model[1], model.join(' vs '));
t2(`and that model online is ${MODEL_WANT} (the dead-ball ritual reached both phones)`,
  model.every(m => m === MODEL_WANT), model.join('/') + ' · phases: ' + after[0].phases.join(','));
t2('the shape picks CROSSED: both phones hold the same defense call',
  after[0].dSet && after[0].dSet === after[1].dSet, after.map(a => a.dSet).join(' vs '));
t2('and the same offense answer',
  after[0].oSet && after[0].oSet === after[1].oSet, after.map(a => a.oSet).join(' vs '));
t2('and the game is still one game (scores agree after the drive)',
  after[0].score === after[1].score, after.map(a => a.score).join(' vs '));

console.log(`${ok} ok · ${fail} fail` + (SAB ? ` (SABOTAGE=${SAB}: red is correct)` : ''));
await t.browser.close();
process.exit(SAB ? (fail ? 0 : 1) : (fail ? 1 : 0));

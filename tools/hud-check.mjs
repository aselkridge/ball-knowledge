/* THE TWO-CONTROL HUD, gated (item 103, his rulings of 08-22: pause as the
   symbol, replay beside it with grey/orange availability, the roomy inset,
   64px on desktop, 30px floor untouched on the phone).

   What is asserted, per viewport:
     - the dock holds exactly two controls: pause then replay, no tray, no ⋯
     - the buttons sit INSIDE the board's left panel (interior measured off
       hud-n7.webp: 1.95% to 26.95% of the art; the old dock started before it)
     - the ruled sizes: 30px on the phone, 64px on desktop
     - replay availability is painted: spent at game start, orange the moment
       a move is recorded, spent again when a new game resets the record
     - pause still opens the pause menu

     node tools/hud-check.mjs

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';

const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  console.log((cond ? '  ok  ' : '  FAIL') + ' ' + name + (extra ? '   [' + extra + ']' : ''));
  cond ? pass++ : fail++;
};

const b = await pw.chromium.launch({
  executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'],
});

for (const view of [{ k: 'phone', w: 390, h: 844, m: true, size: 30 },
                    { k: 'desk', w: 1280, h: 860, size: 64 }]) {
  console.log(view.k.toUpperCase());
  const ctx = await b.newContext({
    viewport: { width: view.w, height: view.h }, deviceScaleFactor: 2,
    hasTouch: !!view.m, isMobile: !!view.m,
  });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1150);
  await p.evaluate(() => {
    const B = window.BK, K = B.coach;
    K.applyColors({ nm: 'Showtime', ab: 'SHO' }, { nm: 'The Bricks', ab: 'BRK' });
    K.startGame({ league: 'nba', decade: 'ANY', target: 11,
      rosters: K.pickRosters('nba', 'ANY') }, true);
    B._show('game');
  });
  await sleep(1650);

  const rendered = await p.evaluate(() => {
    const h = document.getElementById('hud'), a = document.querySelector('#hud img.sbart');
    return !!h && h.getBoundingClientRect().height > 30 && !!a && a.naturalWidth > 0;
  });
  ok('1 the HUD painted (render guard)', rendered);
  if (!rendered) { await ctx.close(); continue; }

  const dock = await p.evaluate(() => {
    const d = document.getElementById('sbDock');
    const hud = document.getElementById('hud').getBoundingClientRect();
    const kids = [...d.children].map(e => {
      const r = e.getBoundingClientRect();
      return { id: e.id, w: Math.round(r.width), h: Math.round(r.height),
        x: r.x, right: r.x + r.width,
        visible: getComputedStyle(e).display !== 'none' && r.width > 0 };
    });
    const db = d.getBoundingClientRect();
    return { kids, hudX: hud.x, hudW: hud.width, box: [db.x, db.width],
      gone: ['hudMore', 'hudTray', 'btnMusicG', 'btnCoachG']
        .filter(id => document.getElementById(id)) };
  });
  ok('2 exactly two controls, pause then replay',
    dock.kids.length === 2 && dock.kids[0].id === 'btnPause' &&
    dock.kids[1].id === 'btnReplay', dock.kids.map(k => k.id).join(','));
  ok('3 both visible on this viewport', dock.kids.every(k => k.visible));
  ok('4 tray, more-button and dock toggles are gone from the DOM',
    dock.gone.length === 0, dock.gone.join(','));
  /* the artwork panel interior is 1.95%..26.95% of the art; both buttons must
     sit inside it with clearance, which is the whole edge-collision ruling */
  const lo = dock.hudX + dock.hudW * 0.0195, hi = dock.hudX + dock.hudW * 0.2695;
  ok('5a buttons sit inside the board panel interior',
    dock.kids.every(k => k.x > lo + 2 && k.right < hi - 2),
    'panel ' + Math.round(lo) + '..' + Math.round(hi) + ' buttons ' +
    dock.kids.map(k => Math.round(k.x) + '..' + Math.round(k.right)).join(' '));
  /* 5a alone is NOT enough, found by its own sabotage: two centred buttons
     stay inside the panel band even at the old broken left:1.8%, so the box
     itself is held to the ruled numbers (roomy, l:3.4% w:22%) directly */
  ok('5b the dock box IS the ruled inset',
    Math.abs(dock.box[0] - (dock.hudX + dock.hudW * 0.034)) <= 2 &&
    Math.abs(dock.box[1] - dock.hudW * 0.22) <= dock.hudW * 0.005,
    'x ' + Math.round(dock.box[0]) + ' want ' +
    Math.round(dock.hudX + dock.hudW * 0.034) + ' · w ' + Math.round(dock.box[1]) +
    ' want ' + Math.round(dock.hudW * 0.22));
  ok('6 ruled size, ' + view.size + 'px on ' + view.k,
    dock.kids.every(k => Math.abs(k.w - view.size) <= 1 && Math.abs(k.h - view.size) <= 1),
    dock.kids.map(k => k.w + 'x' + k.h).join(' '));

  /* replay availability: spent -> live -> spent, driven at the same seam the
     game itself uses (recordPlay / the new-game reset) */
  const st0 = await p.evaluate(() => {
    const b = document.getElementById('btnReplay');
    return { on: b.classList.contains('rep-on'), off: b.classList.contains('rep-off'),
      dis: b.disabled };
  });
  ok('7 at game start replay is SPENT and disabled', !st0.on && st0.off && st0.dis);
  const st1 = await p.evaluate(() => {
    window.BK._recordPlay([{ k: 'hop', i: 0, from: [2, 2], to: [3, 2] }]);
    const b = document.getElementById('btnReplay');
    return { on: b.classList.contains('rep-on'), off: b.classList.contains('rep-off'),
      dis: b.disabled };
  });
  ok('8 a recorded move turns it ORANGE and live', st1.on && !st1.off && !st1.dis);
  const st2 = await p.evaluate(() => {
    const K = window.BK.coach;
    K.startGame({ league: 'nba', decade: 'ANY', target: 11,
      rosters: K.pickRosters('nba', 'ANY') }, true);
    const b = document.getElementById('btnReplay');
    return { on: b.classList.contains('rep-on'), off: b.classList.contains('rep-off') };
  });
  ok('9 a new game resets it to SPENT', !st2.on && st2.off);

  await sleep(900);
  await p.evaluate(() => document.getElementById('btnPause').click());
  await sleep(500);
  ok('10 pause still opens the pause menu', await p.evaluate(() =>
    document.getElementById('pauseveil').classList.contains('on')));
  ok('11 no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

console.log('\n' + pass + ' ok · ' + fail + ' fail');
await b.close();
process.exit(fail ? 1 : 0);

/* SABOTAGE LOG (run 2026-08-24, then restored):
   1. check 6 told to expect 34px on desk -> FAIL with [64x64 64x64]. Proves
      the size read is the rendered box, not the stylesheet.
   2. replayPaint's recordPlay call removed in game.js -> 8 FAILS on both
      viewports (button stays spent after a recorded move). Proves 8
      exercises the real seam.
   3. dock left restored to the old broken 1.8% -> did NOT go red at first:
      5a passed, because two CENTRED buttons stay inside the panel band even
      in the wrong box. The sabotage convicted the check, so 5b was added to
      hold the dock box itself to the ruled numbers; re-run, 5b FAILS on both
      viewports [x 7 want 13 / x 23 want 44]. Believe the first sabotage. */

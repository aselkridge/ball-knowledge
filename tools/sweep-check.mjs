/* THE SCREEN SWEEP, made honest (row 195). The 08-25 audit shipped five
   setup captures and the versus shell to its auditors with their JS content
   missing, and the VERIFY stage caught it instead of the harness. This is
   the harness catching it: every solo-reachable screen is reached by the
   road a player takes, every capture carries a CONTENT GUARD that fails
   loud, and the captures land in design/shots/sweep/ for the audits to
   reuse, so no audit ever again photographs an unpainted room.

   What it does NOT sweep, and says so instead of shipping voids: the
   online-only rooms (house, pick, handicap) belong to tools/online-check.mjs,
   which walks them with two real phones over the real relay.

   Run:      node tools/sweep-check.mjs            (site on :8899)
   Desk too: SWEEP_DESK=1 node tools/sweep-check.mjs   (guards run at phone
             size, the product's first citizen; desk adds captures only)
   Sabotage: SABOTAGE=1 empties the league picker in flight, the audit's own
             original symptom; the sweep must go red on it. */
import pw from '/home/user/ball-knowledge/node_modules/playwright/index.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SABOTAGE = process.env.SABOTAGE === '1';
const OUT = '/home/user/ball-knowledge/design/shots/sweep';
fs.mkdirSync(OUT, { recursive: true });

let ok = 0, fail = 0;
const t = (name, cond, got) => {
  if (cond) ok++;
  else { fail++; console.log('  FAIL ' + name + (got !== undefined ? ' · got ' + got : '')); }
};

/* WHAT "PAINTED" MEANS, screen by screen. Each guard runs in the page with
   the screen up and answers {ok, why}: a specific thing its JS must have
   built, not a generic pixel count, because the audit's empty captures all
   had their static chrome and lacked exactly this. */
const GUARDS = {
  load: () => ({ ok: true, why: 'static by design' }),
  title2: () => { const n = document.querySelectorAll('#mmRolo [data-go]').length;
    return { ok: n >= 3, why: n + ' menu cards' }; },
  how: () => { const n = (document.querySelector('#screen-how').textContent || '').length;
    return { ok: n > 400, why: n + ' chars of rulebook' }; },
  daily: () => { const el = document.querySelector('#screen-daily');
    const digits = /\d/.test(el.textContent);
    return { ok: digits, why: digits ? 'calendar has numbers' : 'no dates painted' }; },
  settings: () => { const n = document.querySelectorAll('#screen-settings .st-block').length;
    return { ok: n >= 3, why: n + ' setting blocks' }; },
  online: () => { const n = [...document.querySelectorAll('#screen-online .fr-btn')]
      .filter(e => e.getBoundingClientRect().width > 0).length;
    return { ok: n >= 2, why: n + ' room buttons' }; },
  names: () => { const n = [...document.querySelectorAll('#screen-names input')]
      .filter(e => e.getBoundingClientRect().width > 0).length;
    return { ok: n >= 2, why: n + ' name fields' }; },
  league: () => { const n = document.querySelectorAll('#screen-league .lr-card').length;
    return { ok: n >= 4, why: n + ' league rows' }; },
  decade: () => { const n = document.querySelectorAll('#decadeGrid .et-yr, #decadeGrid .et-dot, #decadeGrid *').length;
    return { ok: n >= 5, why: n + ' timeline beads' }; },
  squad: () => { const cards = [...document.querySelectorAll('#screen-squad [class*="card"], #screen-squad .sr-card')];
    const named = (document.querySelector('#screen-squad').textContent.match(/PPG/g) || []).length;
    return { ok: named >= 5, why: named + ' dealt players (PPG lines)' }; },
  locker: () => { const c = document.getElementById('lkCourtNm'), j = document.getElementById('lkJerNm');
    const okv = c && j && c.textContent.trim() && j.textContent.trim();
    return { ok: !!okv, why: okv ? c.textContent + ' / ' + j.textContent : 'court or jersey unnamed' }; },
  rules: () => { const tg = document.querySelectorAll('#screen-rules .tgtbtn').length;
    const lv = document.querySelectorAll('#klRulesRow *').length;
    return { ok: tg === 3 && lv >= 5, why: tg + ' formats, ' + lv + ' levels' }; },
  courts: () => { const n = document.querySelectorAll('#crtGrid *').length;
    return { ok: n >= 6, why: n + ' court tiles' }; },
  colors: () => { const n = document.querySelectorAll('#screen-colors .cwc').length;
    return { ok: n >= 12, why: n + ' colorways' }; },
  tossup: () => { const parts = document.querySelectorAll('#screen-tossup .tu-part').length;
    const q = document.getElementById('tuReady');
    return { ok: parts >= 3 && !!q, why: parts + ' parts' }; },
  versus: () => { const txt = document.querySelector('#screen-versus').textContent;
    /* built WITH a cfg: the road's own squads are on the card ("Squad VS
       Squad" is the static heading and proves nothing either way) */
    const cfg = /Showtime/i.test(txt);
    return { ok: cfg, why: cfg ? 'the road\'s squads are on the card' : 'no cfg painted' }; },
  brains: () => ({ ok: true, why: 'cinematic, content is the animation' }),
  game: () => { const cv = document.querySelector('#court-wrap canvas');
    const r = cv ? cv.getBoundingClientRect() : { width: 0, height: 0 };
    return { ok: r.width > 200 && r.height > 200, why: Math.round(r.width) + 'x' + Math.round(r.height) + ' court' }; },
};
/* held by the two-peer gate, named so the gap is loud instead of silent */
const DELEGATED = { house: 'online-check walks it with two phones',
  pick: 'online-only squad check, online-check territory',
  handicap: 'online-only bracket pick, online-check territory' };

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });

async function newPage(view, mobile) {
  const ctx = await b.newContext({ viewport: view, deviceScaleFactor: 2,
    hasTouch: mobile, isMobile: mobile });
  if (SABOTAGE) {
    await ctx.route('**/play/', async route => {
      const res = await route.fetch(); let html = await res.text();
      const before = html.length;
      /* the audit's own symptom, manufactured: the league picker's JS
         content vanishes just after it paints */
      html = html.replace('</head>',
        '<script>setInterval(function(){var r=document.getElementById("lgRolo");' +
        'if(r&&r.children.length)r.innerHTML="";},250)</script></head>');
      if (html.length === before) throw new Error('MISSED PATCH');
      await route.fulfill({ response: res, body: html,
        headers: { ...res.headers(), 'content-type': 'text/html' } });
    });
  }
  await ctx.addInitScript(() => { window.__bkNoCine = 1; });  /* the entrance has its own gate (cine-check) */
  const p = await ctx.newPage();
  p.__errs = [];
  p.on('pageerror', e => p.__errs.push(String(e)));
  await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1500);
  await p.evaluate(() => document.body.classList.add('reduce-motion'));
  return [ctx, p];
}

const screen = () => (document.querySelector('.screen.on') || {}).id || 'none';
async function settle(p) {
  let last = null, n = 0;
  for (let k = 0; k < 50; k++) {
    const id = await p.evaluate(screen);
    n = id === last ? n + 1 : 0; last = id;
    if (n >= 3 && k > 4) break;
    await sleep(250);
  }
  return last;
}

/* the walk is TRANSPORT, the guards are the assertions: a screen the
   sabotage emptied must fail its guard and still let the sweep limp on to
   report, never crash mid-road */
const press = (p, fn) => p.evaluate(fn).catch(e => { console.log('  (walk: ' +
  String(e).split('\n')[0].slice(0, 70) + ')'); });

const swept = new Set();
async function grab(p, kind, name) {
  const g = GUARDS[name];
  const r = g ? await p.evaluate(g) : { ok: false, why: 'NO GUARD WRITTEN for ' + name };
  t(`${name} · painted (${kind})`, r.ok, r.why);
  await p.screenshot({ path: `${OUT}/${kind}-${name}.png` });
  swept.add(name);
  return r.ok;
}

/* ---- the roads, phone first (guards live here) -------------------------- */
const [ctx, p] = await newPage({ width: 390, height: 844 }, true);

/* 1 · the menu family: shown by the same fn the buttons call, each PROVED
   painted by its guard rather than assumed */
for (const s of ['load', 'title2', 'how', 'daily', 'settings']) {
  await p.evaluate(id => window.BK._show(id), s);
  await sleep(800);
  await grab(p, 'phone', s);
}

/* 2 · the online room screen, by its real menu card */
await p.evaluate(() => window.BK._show('title2')); await sleep(500);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('#mmRolo [data-go]')];
  const on = c.find(x => x.getAttribute('data-go') === 'online'); if (on) on.click();
});
await settle(p);
await grab(p, 'phone', 'online');

/* 3 · the CPU setup road, pressed like a thumb: the five screens the audit
   captured empty, now walked to their painted state */
await p.evaluate(() => window.BK._show('title2')); await sleep(500);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('#mmRolo [data-go]')];
  (c.find(x => x.getAttribute('data-go') === 'cpu') || c[0]).click();
});
await sleep(900);
await p.evaluate(() => { const c = document.querySelector('#cpuveil .cv-card'); if (c) c.click(); });
await settle(p);
const vals = ['Showtime', 'SHO', 'The Bricks', 'BRK'];
for (const [i, el] of (await p.locator('#screen-names input:visible').all()).entries()) {
  await el.click(); await el.fill(vals[i] || ('X' + i));
}
await p.evaluate(() => document.activeElement && document.activeElement.blur());
await sleep(300);
await grab(p, 'phone', 'names');
await press(p, () => document.getElementById('nmGo').click()); await settle(p);
await grab(p, 'phone', 'league');
await press(p, () => document.querySelector('.lr-card:not(.lock)').click()); await sleep(900);
await press(p, () => document.querySelector('.lr-card:not(.lock)').click()); await settle(p);
await grab(p, 'phone', 'decade');
await press(p, () => document.getElementById('btnDecGo').click()); await settle(p);
await grab(p, 'phone', 'squad');
await press(p, () => document.getElementById('srLock').click()); await settle(p); await sleep(900);
await grab(p, 'phone', 'locker');

/* 3b · courts and colors by the locker's own two big buttons */
await press(p, () => document.getElementById('lkCourt').click()); await settle(p);
await grab(p, 'phone', 'courts');
await press(p, () => document.getElementById('crtBack').click()); await settle(p);
await press(p, () => document.getElementById('lkJersey').click()); await settle(p);
await grab(p, 'phone', 'colors');
await press(p, () => document.getElementById('cwBack').click()); await settle(p);

/* 3c · on to the rules, versus WITH the road's own cfg, brains, the floor */
await press(p, () => document.getElementById('lkGo').click());
let at = await settle(p);
if (at === 'screen-locker') { await sleep(600);
  await press(p, () => document.getElementById('lkGo').click()); at = await settle(p); }
await grab(p, 'phone', 'rules');
await press(p, () => document.getElementById('btnTip').click()); await settle(p);
await grab(p, 'phone', 'versus');
/* versus and brains are cinematics with no controls: they advance on their
   own clock, so the sweep WAITS instead of hunting for a button */
const waitFor = async id => { for (let k = 0; k < 40; k++) {
  if (await p.evaluate(screen) === id) return true; await sleep(400); } return false; };
if (await waitFor('screen-brains')) await grab(p, 'phone', 'brains');
if (await waitFor('screen-game')) { await sleep(1200); await grab(p, 'phone', 'game'); }
/* since 08-31 the CPU jump ball opens on its How-it-works card and WAITS,
   so the tipveil no longer clears itself: left up, its fixed overlay
   intercepts every later click on the local road (this gate's 08-31 red).
   While the card shows, nothing is armed and no timers are pending, so
   the sweep sets the veil down and walks on; the races themselves are
   dome-check's and sample-check's job, not this walker's. */
await p.evaluate(() => { const tv = document.getElementById('tipveil');
  if (tv && tv.classList.contains('howing')) tv.classList.remove('on'); });

/* 4 · the local road's toss-up (versus-CPU never shows it) */
await p.evaluate(() => window.BK._show('title2')); await sleep(500);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('#mmRolo [data-go]')];
  const lc = c.find(x => x.getAttribute('data-go') === 'local'); if (lc) lc.click();
});
await settle(p);
for (const [i, el] of (await p.locator('#screen-names input:visible').all()).entries()) {
  await el.click(); await el.fill(vals[i] || ('X' + i));
}
await p.evaluate(() => document.activeElement && document.activeElement.blur());
await sleep(300);
await press(p, () => document.getElementById('nmGo').click()); await settle(p);
/* the slam animation carries the handoff, so the road gets a real wait */
for (let k = 0; k < 20 && (await p.evaluate(screen)) !== 'screen-tossup'; k++) await sleep(400);
if (await p.evaluate(screen) === 'screen-tossup') await grab(p, 'phone', 'tossup');

/* ---- the ledger: nothing slips through in silence ----------------------- */
const all = await p.evaluate(() => [...document.querySelectorAll('.screen')]
  .map(s => s.id.replace('screen-', '')));
const missing = all.filter(s => !swept.has(s) && !DELEGATED[s]);
t('every screen is swept or loudly delegated', missing.length === 0,
  missing.length ? 'unswept and unexplained: ' + missing.join(', ') : 'all accounted for');
for (const [s, why] of Object.entries(DELEGATED))
  console.log(`  not swept  ${s} · ${why}`);
t('zero page errors across the sweep', p.__errs.length === 0, (p.__errs[0] || '').slice(0, 90));
await ctx.close();

/* ---- desk captures on demand, guards stay phone-side -------------------- */
if (process.env.SWEEP_DESK === '1' && !SABOTAGE) {
  const [dctx, dp] = await newPage({ width: 1280, height: 860 }, false);
  for (const s of ['load', 'title2', 'how', 'daily', 'settings']) {
    await dp.evaluate(id => window.BK._show(id), s);
    await sleep(700);
    await dp.screenshot({ path: `${OUT}/desk-${s}.png` });
  }
  await dctx.close();
  console.log('  desk captures banked for the menu family');
}

console.log(`${ok} ok · ${fail} fail` + (SABOTAGE ? ' (SABOTAGE RUN: red is correct)' : ''));
await b.close();
process.exit(SABOTAGE ? (fail ? 0 : 1) : (fail ? 1 : 0));

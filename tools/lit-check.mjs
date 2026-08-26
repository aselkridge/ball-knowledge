/* THE LIT LAW's standing gate (D1 ruled 08-25, sweep row 189).
   One glow per screen, earned: this asserts the computed values on the live
   build for every surface the law has reached, so a future change cannot
   silently un-light it. Run: node tools/lit-check.mjs  (server on :8899)
   Sabotage proof: SABOTAGE=1 node tools/lit-check.mjs must go red. */
import pw from '/home/user/ball-knowledge/node_modules/playwright/index.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SABOTAGE = process.env.SABOTAGE === '1';
const SAB_CSS = `.lr-card.lock{filter:none!important}
  .dvsbn{color:var(--accent)!important}
  .et-full.on{box-shadow:0 0 18px var(--accent)!important}`;

let ok = 0, fail = 0;
const t = (name, cond, got) => {
  if (cond) { ok++; }
  else { fail++; console.log('  FAIL ' + name + (got !== undefined ? ' · got ' + got : '')); }
};

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2, hasTouch: true, isMobile: true });
if (SABOTAGE) {
  await ctx.route('**/play/', async route => {
    const res = await route.fetch(); let html = await res.text();
    html = html.replace('</head>', `<style>${SAB_CSS}</style></head>`);
    await route.fulfill({ response: res, body: html,
      headers: { ...res.headers(), 'content-type': 'text/html' } });
  });
}
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
await p.reload({ waitUntil: 'networkidle' });
await sleep(1400);

/* render guard: the app must actually be painted */
const painted = await p.evaluate(() => document.body.getBoundingClientRect().height > 100);
if (!painted) { console.log('DEAD: app never painted'); process.exit(1); }

/* 1 · the league rolodex: live leagues lit, locked leagues ghosts */
await p.evaluate(id => window.BK._show(id), 'league');
await sleep(700);
const lg = await p.evaluate(() => {
  const locks = [...document.querySelectorAll('.lr-card.lock')];
  const lives = [...document.querySelectorAll('.lr-card:not(.lock)')];
  return { nLock: locks.length, nLive: lives.length,
    lockFilter: locks.length ? getComputedStyle(locks[0]).filter : '',
    liveShadow: lives.length ? getComputedStyle(lives[0]).boxShadow : '' };
});
t('league: five locked leagues present', lg.nLock === 5, lg.nLock);
t('league: two live leagues present', lg.nLive === 2, lg.nLive);
t('league: locked leagues are ghosts (saturate .25)', /saturate\(0\.25\)/.test(lg.lockFilter), lg.lockFilter);
t('league: live leagues wear the lit ring', /color\(srgb/.test(lg.liveShadow), lg.liveShadow.slice(0, 60));

/* 2 · settings: word floor + quiet dead channels */
await p.evaluate(id => window.BK._show(id), 'settings');
await sleep(700);
const st = await p.evaluate(() => {
  const sub = document.querySelector('.st-rsub');
  const dead = document.querySelector('.st-swrow:has(.psw:not(.on))+.vol');
  return { sub: getComputedStyle(sub).color,
    dead: dead ? getComputedStyle(dead).filter : 'NO DEAD CHANNEL' };
});
t('settings: sub-labels at the ink-mid word floor', st.sub === 'rgb(154, 143, 122)', st.sub);
t('settings: a dead channel goes quiet (saturate .15)', /saturate\(0\.15\)/.test(st.dead), st.dead);

/* 3 · the decade screen: All-Time is a toggle, not a second primary */
await p.evaluate(id => window.BK._show(id), 'decade');
await sleep(700);
const et = await p.evaluate(() => {
  const f = document.querySelector('.et-full');
  if (!f) return { missing: true };
  f.classList.add('on');
  const cs = getComputedStyle(f);
  return { shadow: cs.boxShadow, bgImage: cs.backgroundImage };
});
t('era: All-Time toggle has no glow', !et.missing && et.shadow === 'none', et.shadow);
t('era: All-Time toggle wears no primary gradient', !et.missing && et.bgImage === 'none', et.bgImage);

/* 4 · the squad screen: Reshuffle is ghost, Lock it in is the one primary */
const sq = await p.evaluate(() =>
  document.getElementById('srShuffle')?.classList.contains('ghost'));
t('squad: Reshuffle demoted to ghost', sq === true, String(sq));

/* 5 · the names screen: exactly one non-ghost primary (compliance check) */
const nm = await p.evaluate(() =>
  [...document.querySelectorAll('#screen-names .setup-actions .mbtn:not(.ghost)')].length);
t('names: exactly one lit primary', nm === 1, nm);

/* 6 · the streak chip: zero does not glow, one does */
await p.evaluate(id => window.BK._show(id), 'daily');
await sleep(900);
const stk = await p.evaluate(() => {
  const pill = document.getElementById('dvStreakPill');
  const btn = document.getElementById('dvStreakBtn');
  if (!pill || !btn) return { missing: true };
  const zero = getComputedStyle(pill).color;
  btn.classList.add('lit');
  const lit = getComputedStyle(pill).color;
  btn.classList.remove('lit');
  return { zero, lit, hasLitNow: btn.classList.contains('lit'), n: pill.textContent };
});
t('streak: zero wears ink-dim, not the accent', !stk.missing && stk.zero === 'rgb(179, 168, 148)', stk.zero);
t('streak: the accent is earned at .lit', !stk.missing && stk.lit === 'rgb(245, 135, 46)', stk.lit);
t('streak: fresh storage starts unlit', !stk.missing && stk.hasLitNow === false && stk.n === '0', `${stk.n}/${stk.hasLitNow}`);

/* 7 · the music tab: ghost chrome in play, gone under veils */
await p.reload({ waitUntil: 'networkidle' });
await sleep(1400);
await p.evaluate(() => {
  const B = window.BK, K = B.coach;
  K.applyColors({ nm: 'Showtime', ab: 'SHO' }, { nm: 'The Bricks', ab: 'BRK' });
  K.startGame({ league: 'nba', decade: 'ANY', target: 11,
    rosters: K.pickRosters('nba', 'ANY') }, true);
  B._show('game');
});
await sleep(1700);
const fab = await p.evaluate(() => {
  const tab = document.querySelector('#boombox.mini .bb-tab');
  const badge = document.querySelector('#boombox .bb-badge');
  return { border: tab ? getComputedStyle(tab).borderColor : 'NO TAB',
    badge: badge ? getComputedStyle(badge).display : 'none' };
});
t('fab: ghost chrome during play (line border)', fab.border === 'rgb(58, 51, 42)', fab.border);
t('fab: no badge during play', fab.badge === 'none', fab.badge);
/* AMENDED 08-26: the fold applies to MOMENTS, not to menus. The pause menu is
   the only door to the player and carries no music control of its own, so the
   tab has to survive there; the end line is a moment, so it does not. */
await p.evaluate(() => { document.body.classList.add('reduce-motion');
  document.getElementById('btnPause').click(); });
await sleep(700);
const paused = await p.evaluate(() => {
  const bb = document.getElementById('boombox');
  const cs = getComputedStyle(bb);
  return { op: cs.opacity, pe: cs.pointerEvents };
});
t('fab: the pause menu keeps its door to the player', paused.op === '1' && paused.pe !== 'none',
  `opacity ${paused.op} · pointer-events ${paused.pe}`);
await p.evaluate(() => { document.getElementById('pauseveil').classList.remove('on');
  document.getElementById('endveil').classList.add('on'); });
await sleep(700);
const ended = await p.evaluate(() =>
  getComputedStyle(document.getElementById('boombox')).opacity);
t('fab: gone under the end veil', ended === '0', ended);

console.log(`${ok} ok · ${fail} fail` + (SABOTAGE ? ' (SABOTAGE RUN: red is correct)' : ''));
await b.close();
process.exit(fail && !SABOTAGE ? 1 : (SABOTAGE && !fail ? 1 : 0));

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
  .et-full.on{box-shadow:0 0 18px var(--accent)!important}
  #stThemeBlock{border-color:var(--accent)!important;box-shadow:0 0 24px -4px rgba(245,135,46,.5)!important}
  .rearm svg{stroke:var(--accent)!important}`;

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

/* 8 · the settings screen after his 08-27 walk: the theme block does not
   wear the light, the SELECTED court does, and the re-arm control lights
   only when it has something to bring back */
await p.evaluate(id => window.BK._show(id), 'settings');
await sleep(1100);
const themed = await p.evaluate(() => {
  const blk = document.getElementById('stThemeBlock');
  const c = getComputedStyle(blk);
  const centre = document.querySelector('.st-tcard.center .st-mini');
  const cc = centre ? getComputedStyle(centre) : null;
  return { border: c.borderColor, shadow: c.boxShadow, anim: c.animationName,
    centreGlow: cc ? cc.boxShadow : 'NO CENTRE CARD' };
});
/* the accent, in every form it could sneak back as */
const HOT = /245,\s*135,\s*46|255,\s*163,\s*97/;
t('theme block: no accent border', !HOT.test(themed.border), themed.border);
t('theme block: no glow', !HOT.test(themed.shadow), themed.shadow.slice(0, 60));
t('theme block: no pulse', themed.anim === 'none', themed.anim);
t('theme block: the SELECTED court still carries a light',
  themed.centreGlow !== 'none' && themed.centreGlow !== 'NO CENTRE CARD',
  themed.centreGlow.slice(0, 50));

const dark = await p.evaluate(() => {
  const e = document.getElementById('coachReset');
  return { lit: e.classList.contains('lit'), off: e.disabled,
    stroke: getComputedStyle(e.querySelector('svg')).stroke,
    w: Math.round(e.getBoundingClientRect().width),
    fits: e.scrollWidth <= e.clientWidth + 1 };
});
t('re-arm: dark and out of reach with nothing to bring back',
  dark.lit === false && dark.off === true, `lit=${dark.lit} disabled=${dark.off}`);
/* the CLASS being off is not the law, the light being off is: a stylesheet
   that lights the mark regardless of state has to fail here */
t('re-arm: and its mark carries no accent while it is dark',
  !HOT.test(dark.stroke), dark.stroke);
t('re-arm: clears the 44px thumb floor', dark.w >= 44, dark.w + 'px');
t('re-arm: its mark fits inside its own button', dark.fits === true);

await p.evaluate(() => localStorage.setItem('bk_coach_seen', JSON.stringify({ select: 1, shoot: 1 })));
await p.reload({ waitUntil: 'networkidle' });
await sleep(1400);
await p.evaluate(id => window.BK._show(id), 'settings');
await sleep(1000);
const alive = await p.evaluate(() => {
  const e = document.getElementById('coachReset');
  return { lit: e.classList.contains('lit'), off: e.disabled,
    stroke: getComputedStyle(e.querySelector('svg')).stroke,
    aria: e.getAttribute('aria-label') };
});
t('re-arm: lights up once a tip has been used', alive.lit === true && alive.off === false,
  `lit=${alive.lit} disabled=${alive.off}`);
t('re-arm: and its mark takes the accent', alive.stroke === 'rgb(245, 135, 46)', alive.stroke);
t('re-arm: it says how many are coming back', /2 tips/.test(alive.aria || ''), alive.aria);

/* 9 · the crate hint names the gesture THIS device has (08-27) */
const hintTouch = await p.evaluate(() => {
  const el = document.querySelector('.st-cratehint');
  const vis = s => { const e = el.querySelector(s);
    return e ? getComputedStyle(e).display !== 'none' : null; };
  return { touch: vis('.hint-touch'), point: vis('.hint-point'),
    text: el.innerText.replace(/\s+/g, ' ').trim() };
});
t('crate hint: a touch phone is offered a swipe', hintTouch.touch === true, JSON.stringify(hintTouch.text));
t('crate hint: and is NOT offered arrow keys', hintTouch.point === false,
  JSON.stringify(hintTouch.text));

/* 10 · and the other half of that hint, on a machine with a mouse. One
   context cannot answer a media query about the OTHER kind of device, so
   this opens a real pointer:fine one rather than assuming symmetry. */
const dctx = await b.newContext({ viewport: { width: 1280, height: 860 },
  deviceScaleFactor: 2, hasTouch: false, isMobile: false });
if (SABOTAGE) {
  await dctx.route('**/play/', async route => {
    const res = await route.fetch(); let html = await res.text();
    html = html.replace('</head>', `<style>${SAB_CSS}</style></head>`);
    await route.fulfill({ response: res, body: html,
      headers: { ...res.headers(), 'content-type': 'text/html' } });
  });
}
const dp = await dctx.newPage();
await dp.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
await dp.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
await dp.reload({ waitUntil: 'networkidle' });
await sleep(1400);
await dp.evaluate(id => window.BK._show(id), 'settings');
await sleep(1000);
const hintDesk = await dp.evaluate(() => {
  const el = document.querySelector('.st-cratehint');
  const vis = s2 => { const e = el.querySelector(s2);
    return e ? getComputedStyle(e).display !== 'none' : null; };
  return { touch: vis('.hint-touch'), point: vis('.hint-point'),
    text: el.innerText.replace(/\s+/g, ' ').trim() };
});
t('crate hint: a machine with a mouse is offered the arrow keys',
  hintDesk.point === true, JSON.stringify(hintDesk.text));
t('crate hint: and is not told to swipe', hintDesk.touch === false,
  JSON.stringify(hintDesk.text));
await dctx.close();

console.log(`${ok} ok · ${fail} fail` + (SABOTAGE ? ' (SABOTAGE RUN: red is correct)' : ''));
await b.close();
process.exit(fail && !SABOTAGE ? 1 : (SABOTAGE && !fail ? 1 : 0));

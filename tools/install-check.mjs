/* ADD TO HOME SCREEN, the in-game half. Serve docs/ on :8899.

   node tools/install-check.mjs

   THE CHECK THIS FILE EXISTS FOR is Aaron's rule, 2026-08-07: *"clicking the
   logo to download to Home Screen should not work once it's on the Home
   Screen. Same for if clicking the logo surfaces instructions on iOS."*

   That rule is impossible to eyeball, because to see it fail you have to
   actually install the app and come back. So every installed-state case below
   is driven by stubbing `matchMedia('(display-mode: standalone)')` and
   `navigator.standalone` BEFORE the page loads, which is exactly what the
   browser reports to a launched home-screen app.

   It is not enough that the click does nothing. A logo that still looks
   tappable and then ignores you is a worse bug than no feature, so the checks
   assert the affordance is gone too: no pointer class, no role, no tabindex,
   no hint pill. */
import pw from 'playwright';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
let pass = 0; const fails = [];
const ck = (m, x, note) => {
  (x ? pass++ : fails.push(m));
  console.log(`  ${x ? 'PASS' : 'FAIL'}  ${m}${note ? '   [' + note + ']' : ''}`);
};

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 '
             + '(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IOS_CHROME = IPHONE.replace('Version/17.5 Mobile/15E148 Safari/604.1',
                                  'CriOS/126.0 Mobile/15E148 Safari/604.1');
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 '
              + '(KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
              + '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

/* Boot a page pretending to be a given device, optionally already installed. */
async function open({ ua, mobile = true, standalone = false, wipe = true }) {
  const ctx = await b.newContext({
    userAgent: ua,
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 860 },
    hasTouch: mobile, isMobile: mobile,
  });
  if (standalone) {
    /* What a launched home-screen app actually reports. Both flags, because
       Android answers with display-mode and iOS with navigator.standalone. */
    await ctx.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = q =>
        /display-mode:\s*(standalone|fullscreen)/.test(q)
          ? { matches: true, media: q, addEventListener() {}, removeEventListener() {},
              addListener() {}, removeListener() {}, onchange: null }
          : real(q);
      Object.defineProperty(navigator, 'standalone', { value: true, configurable: true });
    });
  }
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  if (wipe) {
    await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await p.reload({ waitUntil: 'networkidle' });
  }
  await sleep(1600);                       /* past the load screen */
  return { p, ctx, errs };
}

/* A click that cannot land must be a FAILED CHECK, never a crashed harness.
   Proven the hard way: putting the coach's veil back over the logo made this
   file die on a TimeoutError instead of printing a red line, which is the
   second time today a harness has failed to report the exact input it exists
   to catch. Short timeout, swallow the throw, return the truth. */
async function tap(p, sel) {
  try { await p.click(sel, { timeout: 2500 }); return true; }
  catch (e) { return false; }
}

const look = p => p.evaluate(() => {
  const l = document.getElementById('logo');
  return {
    offer: window.BKInstall ? window.BKInstall._offer() : 'NO BKInstall',
    can: !!(l && l.classList.contains('can-install')),
    role: l && l.getAttribute('role'),
    tab: l && l.getAttribute('tabindex'),
    label: l && l.getAttribute('aria-label'),
    hint: !!document.getElementById('installHint'),
    sheet: (() => { const e = document.getElementById('installSheet');
                    return !!e && e.classList.contains('on'); })(),
  };
});

/* ---- 1. iPhone, Safari, NOT installed: the logo is live ------------------ */
{
  const { p, ctx, errs } = await open({ ua: IPHONE });
  const s = await look(p);
  ck('iOS Safari · offers the instruction sheet', s.offer === 'ios', s.offer);
  ck('iOS Safari · logo is a control', s.can && s.role === 'button' && s.tab === '0');
  ck('iOS Safari · the hint pill is shown', s.hint);
  const tapped = await tap(p, '#logo'); await sleep(400);
  ck('iOS Safari · the logo is actually clickable (nothing covers it)', tapped);
  const open1 = await p.evaluate(() => {
    const el = document.getElementById('installSheet');
    return !!el && el.classList.contains('on');
  });
  ck('iOS Safari · tapping the logo opens the sheet', open1);
  const txt = await p.evaluate(() => {
    const el = document.getElementById('installSheet');
    return el ? el.innerText : '';
  });
  ck('iOS Safari · the sheet names Share and Add to Home Screen',
     /Share/.test(txt) && /Add to Home Screen/.test(txt));
  await tap(p, '#installSheet .is-x'); await sleep(300);
  ck('iOS Safari · it closes', !(await p.evaluate(() => {
     const el = document.getElementById('installSheet');
     return !!el && el.classList.contains('on');
  })));
  ck('iOS Safari · no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

/* ---- 2. THE RULE: iPhone, ALREADY installed ------------------------------ */
{
  const { p, ctx, errs } = await open({ ua: IPHONE, standalone: true });
  const s = await look(p);
  ck('INSTALLED iOS · offers nothing', s.offer === null, String(s.offer));
  ck('INSTALLED iOS · logo is NOT a control',
     !s.can && !s.role && !s.tab && !s.label);
  ck('INSTALLED iOS · no hint pill', !s.hint);
  await tap(p, '#logo'); await sleep(500);
  const opened = await p.evaluate(() => {
    const el = document.getElementById('installSheet');
    return !!el && el.classList.contains('on');
  });
  ck('INSTALLED iOS · tapping the logo does NOTHING', !opened);
  const coach = await p.evaluate(() => {
    const c = document.getElementById('coachTip');
    return !!c && c.classList.contains('on');
  });
  ck('INSTALLED iOS · the coach does not tell you to install it', !coach);
  ck('INSTALLED iOS · no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

/* ---- 3. Android, prompt available, then installed ------------------------ */
{
  const { p, ctx } = await open({ ua: ANDROID });
  /* Chromium headless does not fire beforeinstallprompt, so hand the module a
     stand-in shaped exactly like the real event and watch the REAL code path. */
  await p.evaluate(() => {
    window.__prompted = 0;
    window.BKInstall._setDeferred({
      prompt() { window.__prompted++; },
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });
  });
  await sleep(200);
  const s = await look(p);
  ck('Android · offers the real install dialog', s.offer === 'prompt', s.offer);
  ck('Android · logo is a control', s.can && s.role === 'button');
  const tapA = await tap(p, '#logo'); await sleep(400);
  ck('Android · the logo is actually clickable', tapA);
  ck('Android · tapping the logo calls prompt()',
     (await p.evaluate(() => window.__prompted)) === 1);
  const after = await look(p);
  ck('Android · a used prompt leaves nothing to offer',
     after.offer === null && !after.can, String(after.offer));
  await ctx.close();
}
{
  const { p, ctx } = await open({ ua: ANDROID, standalone: true });
  await p.evaluate(() => window.BKInstall._setDeferred({
    prompt() { window.__prompted = 1; }, userChoice: Promise.resolve({}) }));
  await sleep(200);
  const s = await look(p);
  ck('INSTALLED Android · offers nothing even WITH a live prompt event',
     s.offer === null && !s.can, String(s.offer));
  await tap(p, '#logo'); await sleep(300);
  ck('INSTALLED Android · the logo does not fire the dialog',
     !(await p.evaluate(() => window.__prompted)));
  await ctx.close();
}

/* ---- 4. iOS in a non-Safari browser -------------------------------------- */
{
  const { p, ctx } = await open({ ua: IOS_CHROME });
  const s = await look(p);
  ck('iOS Chrome · offers the open-in-Safari nudge', s.offer === 'ios-other', s.offer);
  await tap(p, '#logo'); await sleep(400);
  const t = await p.evaluate(() => {
    const el = document.getElementById('installSheet');
    return el ? el.innerText : '';
  });
  ck('iOS Chrome · the sheet says to use Safari', /Safari/.test(t));
  await ctx.close();
}

/* ---- 5. Desktop is left alone -------------------------------------------- */
{
  const { p, ctx } = await open({ ua: DESKTOP, mobile: false });
  const s = await look(p);
  ck('desktop · offers nothing', s.offer === null, String(s.offer));
  ck('desktop · logo is not a control', !s.can && !s.hint);
  await ctx.close();
}

/* ---- 6. the coach says it once, and only once ---------------------------- */
{
  const { p, ctx } = await open({ ua: IPHONE });
  const first = await p.evaluate(() => {
    const c = document.getElementById('coachTip');
    return { up: !!c && c.classList.contains('on'), txt: c ? c.innerText : '' };
  });
  ck('first run · the coach welcomes you', first.up);
  ck('first run · and points at the logo', /logo/i.test(first.txt), first.txt.slice(0, 60));
  ck('first run · it is not pretending to pause a game',
     !(await p.evaluate(() => {
       const c = document.getElementById('coachTip');
       return !!c && c.dataset.pause === '1';
     })));
  ck('first run · the veil does NOT cover the logo it points at',
     !(await p.evaluate(() => {
       const v = document.getElementById('coachVeil');
       return !!v && v.classList.contains('on');
     })));
  ck('first run · the card carries a button, not just an instruction',
     !!(await p.evaluate(() => document.querySelector('#coachTip .ct-do'))));
  await p.evaluate(() => document.querySelector('#coachTip .ct-ok').click());
  await p.reload({ waitUntil: 'networkidle' }); await sleep(1900);
  ck('second run · the coach stays quiet',
     !(await p.evaluate(() => {
       const c = document.getElementById('coachTip');
       return !!c && c.classList.contains('on');
     })));
  await ctx.close();
}

/* ---- 7. coach off means off ---------------------------------------------- */
{
  const ctx = await b.newContext({ userAgent: IPHONE, viewport: { width: 390, height: 844 },
                                   hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' }); await sleep(1900);
  ck('coach off · no welcome card', !(await p.evaluate(() => {
    const c = document.getElementById('coachTip');
    return !!c && c.classList.contains('on');
  })));
  const s = await look(p);
  ck('coach off · the logo still works (the offer is not the coach)',
     s.offer === 'ios' && s.can);
  await ctx.close();
}

await b.close();
console.log(`\n  ${pass} passed, ${fails.length} failed`);
if (fails.length) { fails.forEach(f => console.log('   FAILED: ' + f)); process.exit(1); }
console.log('  ALL CHECKS PASS');

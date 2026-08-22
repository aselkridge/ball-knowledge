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
async function open({ ua, mobile = true, standalone = false, wipe = true, menu = 'classic' }) {
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
  /* WHICH MENU THIS FILE DRIVES, stated rather than inherited. From 2026-08-08
     there are two main menus and the new one is the default, so every check
     below that CLICKS something (#logo, #btnCpu) would otherwise be aiming at a
     hidden screen — which is how twelve checks went red without a single thing
     being broken. Pinning it to classic keeps all of them honest controls; the
     new menu's own click paths are covered at the bottom of this file and in
     tools/menu2-check.mjs. */
  await p.evaluate(m => localStorage.setItem('bk_menu', m), menu);
  await p.reload({ waitUntil: 'networkidle' });
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
    /* the chip is per-LOGO now (two main menus, two logos), so it is found by
       class inside the classic menu rather than by a page-unique id. Same
       assertion, same element — only the lookup changed. */
    hint: !!document.querySelector('#screen-title .install-hint'),
    /* and the new menu's logo must carry the identical offer, because a
       home-screen prompt that works on one menu and not the other is the exact
       failure this file was written for */
    hint2: !!document.querySelector('#screen-title2 .install-hint'),
    can2: !!document.querySelector('#screen-title2 [data-install-logo].can-install'),
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
  ck('iOS Safari · and the NEW menu\'s logo carries the same offer',
     s.can2 && s.hint2);
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
  /* Aaron photographed his own share sheet: Add to Home Screen is NOT on the
     visible row, it hides behind View More. A guide that omits that loses
     people at exactly that step. */
  ck('iOS Safari · the sheet warns about View More', /View More/.test(txt));
  ck('iOS Safari · the fake home screen shows the REAL icon',
     await p.evaluate(() => {
       const i = document.querySelector('#installSheet .is-phone .real img');
       return !!i && /icon-192\.png$/.test(i.getAttribute('src')) && i.naturalWidth > 0;
     }));
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
  ck('INSTALLED iOS · and none on the new menu either', !s.hint2 && !s.can2);
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
  ck('INSTALLED iOS · no spotlight either', await p.evaluate(() => {
    const s = document.getElementById('coachSpot');
    return !s || !s.classList.contains('on');
  }));
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
  /* WAIT FOR THE REPAINT, do not guess at it. _setDeferred triggers paint(),
     which now walks every [data-install-logo] across TWO menus, and a fixed
     200ms lost that race about one run in four: three Android checks went red
     while the same file passed 54/54 on the next three runs. A flaky check is
     worse than no check, because it teaches you to ignore the output. Poll for
     the state the test is actually about. */
  for (let i = 0; i < 40; i++) {
    const on = await p.evaluate(() =>
      !!document.querySelector('#screen-title [data-install-logo].can-install'));
    if (on) break;
    await sleep(50);
  }
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
  /* THE COLDEST CALL PATTERN. The world dims, the subject is cut out of the
     dim and ringed, and the card moves off it. All three, measured. */
  const spot = await p.evaluate(() => {
    const s = document.getElementById('coachSpot');
    const l = document.getElementById('logo');
    if (!s || !l) return null;
    const a = s.getBoundingClientRect(), b = l.getBoundingClientRect();
    return {
      on: s.classList.contains('on'),
      through: getComputedStyle(s).pointerEvents === 'none',
      dx: Math.abs((a.left + a.width / 2) - (b.left + b.width / 2)),
      dy: Math.abs((a.top + a.height / 2) - (b.top + b.height / 2)),
      covers: a.width >= b.width && a.height >= b.height,
      moved: document.getElementById('coachTip').classList.contains('below'),
    };
  });
  ck('spotlight · it is up', !!spot && spot.on);
  ck('spotlight · centred on the logo', !!spot && spot.dx < 3 && spot.dy < 3,
     spot ? `${spot.dx.toFixed(1)},${spot.dy.toFixed(1)}px off` : 'no spot');
  ck('spotlight · the hole is bigger than the thing in it', !!spot && spot.covers);
  ck('spotlight · you can still TAP through it', !!spot && spot.through);
  ck('spotlight · the card moved off its subject', !!spot && spot.moved);
  /* The first version dimmed the coach card too: the spot's shadow covers the
     whole viewport and the card shared its z-index, so the thing doing the
     talking was behind the darkness. Order matters and is now asserted. */
  ck('spotlight · the CARD is above the darkness, not under it',
     await p.evaluate(() => {
       const z = e => +getComputedStyle(document.getElementById(e)).zIndex || 0;
       return z('coachTip') > z('coachSpot') && z('coachSpot') > z('coachVeil');
     }));
  ck('first run · "tap the logo any time" is its own bold line',
     await p.evaluate(() => {
       const e = document.querySelector('#coachTip .ct-anytime');
       return !!e && /logo/i.test(e.textContent);
     }));
  ck('the logo is tappable WITH the spotlight up', await tap(p, '#logo'));
  await tap(p, '#installSheet .is-x');
  /* AARON'S BUG, and it shipped: dismiss the coach and the menu must WORK.
     The hidden card kept .onmenu, that class turned pointer events on, and an
     invisible card sat across the middle of the screen eating every tap. Assert
     on what is actually on top of the buttons, because "the class is gone" is a
     proxy and this is the thing players hit. */
  await p.evaluate(() => document.querySelector('#coachTip .ct-ok').click());
  await sleep(500);
  const blockers = await p.evaluate(() => {
    const out = [];
    for (const id of ['btnCpu', 'btnPlay', 'btnHow', 'btnOnline', 'dailyStamp']) {
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!(top === el || el.contains(top) || top.contains(el)))
        out.push(id + ' <- ' + (top ? (top.id || top.className) : 'null'));
    }
    return out;
  });
  ck('DISMISSED · nothing invisible is covering the menu buttons',
     blockers.length === 0, blockers.join(' | '));
  ck('DISMISSED · Play vs CPU actually starts', await tap(p, '#btnCpu'));
  await p.evaluate(() => document.querySelector('#coachTip .ct-ok').click());
  await p.reload({ waitUntil: 'networkidle' }); await sleep(1900);
  ck('second run · the coach stays quiet',
     !(await p.evaluate(() => {
       const c = document.getElementById('coachTip');
       return !!c && c.classList.contains('on');
     })));
  await ctx.close();
}

/* ---- 6b. THEY DELETED THE ICON. Does the offer come back? ---------------- */
/* Aaron's question, and it has two halves that must be tested apart:
   somebody who REMOVED it should be re-offered; somebody who simply said no
   the first time must NOT be nagged on every visit afterwards. */
{
  /* install (standalone), which records "this phone has had it" ... */
  const { p, ctx } = await open({ ua: ANDROID, standalone: true });
  const had = await p.evaluate(() => localStorage.getItem('bk_install_had'));
  ck('installed · the phone remembers it has it', had === '1', String(had));
  await ctx.close();
}
{
  /* ... then come back in a browser tab with that memory and no app. */
  const ctx = await b.newContext({ userAgent: ANDROID, viewport: { width: 390, height: 844 },
                                   hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('bk_install_had', '1');   /* had it */
    localStorage.setItem('bk_install_seen', '1');  /* and was welcomed once */
  });
  await p.reload({ waitUntil: 'networkidle' });
  await p.evaluate(() => window.BKInstall._setDeferred({
    prompt() {}, userChoice: new Promise(() => {}) }));
  await sleep(1900);
  const back = await p.evaluate(() => {
    const c = document.getElementById('coachTip');
    return { up: !!c && c.classList.contains('on'), txt: c ? c.innerText : '',
             had: localStorage.getItem('bk_install_had') };
  });
  ck('REMOVED · the coach comes back', back.up);
  ck('REMOVED · and does not say "first time here"',
     !/first time/i.test(back.txt), back.txt.slice(0, 46));
  ck('REMOVED · the memory is cleared so it fires ONCE, not every visit',
     back.had === null, String(back.had));
  await ctx.close();
}
{
  /* the other half: dismissed, never installed. Must stay quiet. */
  const ctx = await b.newContext({ userAgent: ANDROID, viewport: { width: 390, height: 844 },
                                   hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('bk_install_seen', '1');   /* said no, never installed */
  });
  await p.reload({ waitUntil: 'networkidle' });
  await p.evaluate(() => window.BKInstall._setDeferred({
    prompt() {}, userChoice: new Promise(() => {}) }));
  await sleep(1900);
  ck('DECLINED · someone who just said no is NOT nagged again',
     !(await p.evaluate(() => {
       const c = document.getElementById('coachTip');
       return !!c && c.classList.contains('on');
     })));
  const s = await look(p);
  ck('DECLINED · but the logo still offers it, quietly, forever',
     s.offer === 'prompt' && s.can && s.hint);
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

/* ================= THE NEW MAIN MENU (2026-08-08) =========================
   Aaron asked whether the home-screen offer and the coach still work on the new
   menu. They mostly did, and the one that did not could only be found by
   measuring: the spotlight was cut at -12,-12 with a 24px diameter, parked off
   the corner of the screen, because querySelector returns the FIRST
   [data-install-logo] and that is the CLASSIC menu's, which is display:none
   whenever the new menu is up. A hole pointing at nothing, on the exact card
   that says "tap the logo". Nothing threw and nothing looked wrong in code. */
{
  const { p, errs } = await open({ ua: IPHONE, menu: 'new' });
  await sleep(900);
  const w = await p.evaluate(() => {
    const tip = document.getElementById('coachTip');
    const spot = document.getElementById('coachSpot');
    const live = document.querySelector('#screen-title2 [data-install-logo]');
    const lr = live ? live.getBoundingClientRect() : null;
    const sr = spot ? spot.getBoundingClientRect() : null;
    const covers = !!(sr && lr && sr.left <= lr.left + 2 && sr.top <= lr.top + 2 &&
                      sr.right >= lr.right - 2 && sr.bottom >= lr.bottom - 2);
    return {
      welcome: !!(tip && tip.classList.contains('on')),
      txt: tip ? tip.querySelector('.ct-txt').textContent.slice(0, 38) : '',
      can: !!(live && live.classList.contains('can-install')),
      hint: !!document.querySelector('#screen-title2 .install-hint'),
      spotOn: !!(spot && spot.classList.contains('on')),
      spotRect: sr ? [Math.round(sr.left), Math.round(sr.top), Math.round(sr.width)] : null,
      covers,
    };
  });
  ck('NEW MENU · the coach still says hello on a fresh phone', w.welcome, w.txt);
  ck('NEW MENU · the logo still carries the offer', w.can && w.hint);
  ck('NEW MENU · the spotlight is ON', w.spotOn);
  ck('NEW MENU · and it is cut over the VISIBLE logo, not the hidden one',
     w.covers, JSON.stringify(w.spotRect));
  ck('NEW MENU · the logo is clickable with the spotlight up',
     await tap(p, '#screen-title2 [data-install-logo]'));
  await sleep(400);
  ck('NEW MENU · tapping it opens the how-to sheet',
     await p.evaluate(() => {
       const e = document.getElementById('installSheet');
       return !!e && e.classList.contains('on');
     }));
  ck('NEW MENU · no page errors', errs.length === 0, errs.slice(0, 1).join(''));
  await p.context().close();
}

/* ============ THE HEADER IS A LAYOUT THE OFFER HAS TO FIT IN (2026-08-20) ===
   Everything above asks whether the offer EXISTS. It can exist and still be
   ruined by the header around it, and on 08-20 it was: the menu header became
   a row, and install.js inserts the pill as the LOGO'S NEXT SIBLING, so the
   pill landed BETWEEN the mark and the name and pushed the wordmark sideways.

   Nothing here caught it, and the reason is worth keeping. Section 9 asserted
   `hint2` was TRUE, which it was. A boolean cannot see a collision. The pill
   was present, correct, and sitting on top of the game's name.

   So these are MEASUREMENTS, not booleans, and they are written against the
   contract install.js actually depends on rather than against one layout:
   the pill is inserted after the logo and must end up BELOW the lockup with
   its own width, whatever the header is built out of. Forcing that with a
   flex line break costs the pill its shape (a full-width flex item fills its
   line and a pill becomes a bar), which is why the width check is here too.

   The affordance check is the OTHER half of the same bug: `.can-install` was
   styled on `#logo` alone, the classic menu's id, so on the live menu the
   mark was a working control that did not look like one. install.js had
   walked [data-install-logo] since 08-08 for exactly this reason. The CSS
   never caught up, and no check had ever read a computed style. */
{
  const { p, errs } = await open({ ua: IPHONE, menu: 'new' });
  const geo = await p.evaluate(() => {
    const r = e => { if (!e) return null; const q = e.getBoundingClientRect();
      return { x: Math.round(q.x), y: Math.round(q.y),
               w: Math.round(q.width), h: Math.round(q.height) }; };
    const l = document.querySelector('#screen-title2 [data-install-logo]');
    return {
      logo: r(l), word: r(document.querySelector('#screen-title2 .mm-h1')),
      pill: r(document.querySelector('#screen-title2 .install-hint')),
      cursor: l ? getComputedStyle(l).cursor : null,
      vw: window.innerWidth,
    };
  });
  const hit = (a, b2) => !!(a && b2) && a.x < b2.x + b2.w && a.x + a.w > b2.x &&
                                        a.y < b2.y + b2.h && a.y + a.h > b2.y;
  ck('HEADER · the live mark LOOKS like a control, not just behaves like one',
     geo.cursor === 'pointer', 'cursor ' + geo.cursor);
  ck('HEADER · the pill never lands on top of the wordmark',
     !hit(geo.pill, geo.word),
     JSON.stringify(geo.pill) + ' vs ' + JSON.stringify(geo.word));
  ck('HEADER · it sits BELOW the lockup, where install.js expects to put it',
     !!(geo.pill && geo.word) && geo.pill.y >= geo.word.y + geo.word.h - 2,
     geo.pill ? 'pill y ' + geo.pill.y + ', lockup ends ' + (geo.word.y + geo.word.h)
              : 'no pill');
  ck('HEADER · and it keeps its own width instead of stretching to a bar',
     !!geo.pill && geo.pill.w < 300, geo.pill ? geo.pill.w + 'px' : 'no pill');
  ck('HEADER · the wordmark is still fully on screen',
     !!geo.word && geo.word.x + geo.word.w <= geo.vw,
     geo.word ? 'right edge ' + (geo.word.x + geo.word.w) + ' of ' + geo.vw : 'none');
  ck('HEADER · no page errors', errs.length === 0, errs.slice(0, 1).join(''));
  await p.context().close();
}

/* and the reverse, on the machine with nothing to offer: a dead mark must not
   look alive. The classic menu's rule from the top of this file, applied to
   the menu players actually see. */
{
  const { p } = await open({ ua: DESKTOP, mobile: false, menu: 'new' });
  const s = await p.evaluate(() => {
    const l = document.querySelector('#screen-title2 [data-install-logo]');
    return { cursor: l ? getComputedStyle(l).cursor : null,
             can: !!(l && l.classList.contains('can-install')),
             pill: !!document.querySelector('#screen-title2 .install-hint'),
             word: !!document.querySelector('#screen-title2 .mm-h1') };
  });
  ck('HEADER · nothing to offer: no class', !s.can);
  ck('HEADER · nothing to offer: no pill', !s.pill);
  ck('HEADER · nothing to offer: no pointer cursor', s.cursor !== 'pointer',
     'cursor ' + s.cursor);
  ck('HEADER · and the header still renders', s.word);
  await p.context().close();
}


await b.close();
console.log(`\n  ${pass} passed, ${fails.length} failed`);
if (fails.length) { fails.forEach(f => console.log('   FAILED: ' + f)); process.exit(1); }
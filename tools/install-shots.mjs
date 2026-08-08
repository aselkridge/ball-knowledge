/* Every state of the add-to-home-screen flow, for Aaron to look at before it
   merges. Serve docs/ on :8899.  node tools/install-shots.mjs

   House rule: any change to how something LOOKS ships a comparison. The
   "before" here is main, where the logo is decoration and nothing prompts. */
import pw from 'playwright';
import fs from 'fs';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = 'design/shots/install';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:8899/play/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 '
             + '(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IOS_CHROME = IPHONE.replace('Version/17.5 Mobile/15E148 Safari/604.1',
                                  'CriOS/126.0 Mobile/15E148 Safari/604.1');
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 '
              + '(KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
              + '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function boot({ ua, mobile = true, standalone = false, seen = false }) {
  const ctx = await b.newContext({
    userAgent: ua,
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 860 },
    hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 2,
    reducedMotion: 'reduce',            /* still frames, no mid-animation blur */
  });
  if (standalone) {
    await ctx.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = q => /display-mode:\s*(standalone|fullscreen)/.test(q)
        ? { matches: true, media: q, addEventListener() {}, removeEventListener() {},
            addListener() {}, removeListener() {}, onchange: null }
        : real(q);
      Object.defineProperty(navigator, 'standalone', { value: true, configurable: true });
    });
  }
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(s => {
    localStorage.clear();
    if (s) localStorage.setItem('bk_install_seen', '1');
  }, seen);
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1900);
  return { p, ctx };
}
const shot = async (p, n) => { await p.screenshot({ path: `${OUT}/${n}.png` });
                               console.log('  ' + n + '.png'); };

/* 1 — iPhone, first ever open: the coach speaks, the logo glows */
{ const { p, ctx } = await boot({ ua: IPHONE });
  await shot(p, '1-iphone-first-run'); await ctx.close(); }

/* 2 — the sheet the coach's button opens */
{ const { p, ctx } = await boot({ ua: IPHONE });
  await p.click('#coachTip .ct-do', { force: true }); await sleep(500);
  await shot(p, '2-iphone-sheet'); await ctx.close(); }

/* 3 — a later visit: no coach, the logo still carries the hint */
{ const { p, ctx } = await boot({ ua: IPHONE, seen: true });
  await shot(p, '3-iphone-later-visit'); await ctx.close(); }

/* 4 — THE RULE. Installed: no coach, no hint, an inert logo. */
{ const { p, ctx } = await boot({ ua: IPHONE, standalone: true });
  await shot(p, '4-iphone-INSTALLED'); await ctx.close(); }

/* 5 — Android with a live install event: same hint, real dialog behind it */
{ const { p, ctx } = await boot({ ua: ANDROID, seen: true });
  await p.evaluate(() => window.BKInstall._setDeferred({
    prompt() {}, userChoice: new Promise(() => {}) }));
  await sleep(300); await shot(p, '5-android-hint'); await ctx.close(); }

/* 6 — iOS in a browser that cannot do it */
{ const { p, ctx } = await boot({ ua: IOS_CHROME, seen: true });
  /* force: this file only wants a picture, and the title screen has a slow
     ambient drift that Playwright reads as "element is not stable". The honest
     click is proven in install-check.mjs; here it would only cost a timeout. */
  await p.click('#logo', { force: true }); await sleep(500);
  await shot(p, '6-ios-chrome-sheet'); await ctx.close(); }

/* 7 — desktop, untouched */
{ const { p, ctx } = await boot({ ua: DESKTOP, mobile: false });
  await shot(p, '7-desktop-untouched'); await ctx.close(); }

await b.close();
console.log(`\nwrote 7 states to ${OUT}/`);

/* ADD TO HOME SCREEN — proof the install metadata is real. Serve docs/ on :8899.

   node tools/pwa-check.mjs

   Why this is a harness and not a look-at-it. Install metadata fails SILENTLY.
   A manifest with a typo'd icon path, a scope that excludes its own start_url,
   or a shortcut pointing at a url the app ignores all look perfect in the
   source and do nothing on a phone. Nobody notices until somebody installs it,
   and the twenty friends are the people who would notice.

   Every check here loads the real page, reads what the browser actually
   resolved, and FETCHES every icon rather than trusting the string. */
import pw from 'playwright';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
let pass = 0; const fails = [];
const ck = (m, x, note) => {
  (x ? pass++ : fails.push(m));
  console.log(`  ${x ? 'PASS' : 'FAIL'}  ${m}${note ? '   [' + note + ']' : ''}`);
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(BASE, { waitUntil: 'networkidle' });
await sleep(600);

/* ---- 1. the head actually declares it, as the BROWSER sees it ------------ */
const head = await p.evaluate(() => {
  const m = n => (document.querySelector(`meta[name="${n}"]`) || {}).content || null;
  const link = document.querySelector('link[rel="manifest"]');
  return {
    manifestHref: link ? link.href : null,
    theme: m('theme-color'),
    appleCapable: m('apple-mobile-web-app-capable'),
    appleBar: m('apple-mobile-web-app-status-bar-style'),
    appleTitle: m('apple-mobile-web-app-title'),
    touchIcon: (document.querySelector('link[rel="apple-touch-icon"]') || {}).href || null,
  };
});
/* MBASE, not head.manifestHref, and the break-it proof is why. Deleting the
   <link rel="manifest"> made this harness CRASH on `new URL(x, null)` instead of
   reporting a failure — so the one sabotage most likely to happen in real life
   produced a stack trace rather than a red line. A harness that dies on the
   input it exists to catch is not a harness. Every resolution below goes
   through MBASE, which always has a value; only the check on the next line
   looks at the raw href, because that is the thing being tested. */
const MBASE = head.manifestHref || new URL('manifest.webmanifest', BASE).href;
ck('a manifest is linked from the head', !!head.manifestHref, head.manifestHref);
ck('theme-color is set', head.theme === '#100d0b', head.theme);
ck('iOS is told it is app-capable', head.appleCapable === 'yes', head.appleCapable);
ck('iOS status bar is "black", never black-translucent',
   head.appleBar === 'black', head.appleBar);
ck('iOS has a home-screen title', !!head.appleTitle, head.appleTitle);
ck('the apple-touch-icon is still declared', !!head.touchIcon);

/* ---- 2. the manifest parses and says the right things -------------------- */
const mres = await p.request.get(MBASE);
ck('the manifest fetches 200', mres.ok(), String(mres.status()));
let mf = null;
try { mf = await mres.json(); } catch (e) { /* reported below */ }
ck('the manifest is valid JSON', !!mf);

if (mf) {
  ck('it has a name', !!mf.name, mf.name);
  ck('it has a short_name', !!mf.short_name, mf.short_name);
  ck('display is standalone', mf.display === 'standalone', mf.display);
  ck('background_color matches the game ground',
     mf.background_color === '#100d0b', mf.background_color);
  ck('theme_color matches the head tag',
     mf.theme_color === head.theme, `${mf.theme_color} vs ${head.theme}`);

  /* start_url must live INSIDE scope, or the installed app opens out of its own
     window on first launch. Resolve both against the manifest's own url the way
     a browser does, rather than eyeballing the strings. */
  const start = new URL(mf.start_url, MBASE).href;
  const scope = new URL(mf.scope, MBASE).href;
  ck('start_url is inside scope', start.startsWith(scope), `${start} in ${scope}`);

  /* ---- 3. EVERY icon is fetched. A path typo is the classic silent break. */
  const icons = mf.icons || [];
  ck('there is a 192 and a 512',
     icons.some(i => (i.sizes || '').includes('192')) &&
     icons.some(i => (i.sizes || '').includes('512')),
     icons.map(i => i.sizes).join(' '));
  ck('one icon is declared maskable',
     icons.some(i => (i.purpose || '').split(/\s+/).includes('maskable')));

  for (const ic of icons) {
    const u = new URL(ic.src, MBASE).href;
    const r = await p.request.get(u);
    const buf = r.ok() ? await r.body() : null;
    ck(`icon resolves: ${ic.src} (${ic.sizes})`,
       r.ok() && buf && buf.length > 500, r.ok() ? `${buf.length}B` : String(r.status()));
  }

  /* ---- 4. a shortcut that points nowhere is a lie shipped in config ------ */
  for (const sc of (mf.shortcuts || [])) {
    const u = new URL(sc.url, MBASE).href;
    const r = await p.request.get(u);
    ck(`shortcut url loads: ${sc.url}`, r.ok(), String(r.status()));
    for (const ic of (sc.icons || [])) {
      const ir = await p.request.get(new URL(ic.src, MBASE).href);
      ck(`shortcut icon resolves: ${ic.src}`, ir.ok(), String(ir.status()));
    }
  }
}

/* ---- 5. THE SHORTCUT ACTUALLY DOES SOMETHING --------------------------- */
/* The manifest promising ?go=daily is worth nothing if the app ignores it.
   Drive the real url and check the real screen, not a flag. */
const dp = await ctx.newPage();
await dp.goto(BASE + '?go=daily', { waitUntil: 'networkidle' });
await sleep(1100);
const onDaily = await dp.evaluate(() => {
  const s = document.querySelector('#screen-daily');
  const vis = s && getComputedStyle(s).display !== 'none' && s.offsetParent !== null;
  return { exists: !!s, vis: !!vis,
           shown: (document.querySelector('.screen.on') || {}).id || null };
});
ck('?go=daily lands on the Daily Five, not the menu',
   onDaily.vis || onDaily.shown === 'screen-daily', JSON.stringify(onDaily));

/* and the guard: a live game being rejoined must NOT be hijacked */
const gp = await ctx.newPage();
await gp.goto(BASE, { waitUntil: 'networkidle' });
await gp.evaluate(() => sessionStorage.setItem('bk_rejoin', JSON.stringify({ role: 'host', code: 'TEST' })));
await gp.goto(BASE + '?go=daily', { waitUntil: 'networkidle' });
await sleep(1100);
const hijacked = await gp.evaluate(() =>
  (document.querySelector('.screen.on') || {}).id === 'screen-daily');
ck('a rejoin in progress is NOT hijacked by the deep link', !hijacked);
await gp.evaluate(() => sessionStorage.removeItem('bk_rejoin'));

/* ---- 6. no console explosions from any of it --------------------------- */
ck('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));

await b.close();
console.log(`\n  ${pass} passed, ${fails.length} failed`);
if (fails.length) { fails.forEach(f => console.log('   FAILED: ' + f)); process.exit(1); }
console.log('  ALL CHECKS PASS');

/* THE RESERVED BAND's standing gate (row 190): floating chrome never sits on
   copy. Asserts geometry on the live build: the band is reserved on scrollable
   screens, bottom-rest content clears the chrome, and the open boombox folds
   rather than cover a card. Run: node tools/band-check.mjs (server on :8899)
   Sabotage proof: SABOTAGE=1 node tools/band-check.mjs must go red. */
import pw from '/home/user/ball-knowledge/node_modules/playwright/index.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SABOTAGE = process.env.SABOTAGE === '1';
const SAB = `<style>.screen.chrome-band{padding-bottom:20px!important}</style>
<script>addEventListener('load',()=>setTimeout(()=>{
  const bb=document.getElementById('boombox');bb&&bb.classList.remove('mini');},1800));</script>`;

let ok = 0, fail = 0;
const t = (name, cond, got) => {
  if (cond) ok++;
  else { fail++; console.log('  FAIL ' + name + (got !== undefined ? ' · got ' + got : '')); }
};
const rectsClear = (a, c, pad = 4) =>
  a.left > c.right + pad || a.right < c.left - pad || a.top > c.bottom + pad || a.bottom < c.top - pad;

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });

async function page(view) {
  const ctx = await b.newContext({ viewport: view, deviceScaleFactor: 2,
    hasTouch: view.width < 800, isMobile: view.width < 800 });
  if (SABOTAGE) {
    await ctx.route('**/play/', async route => {
      const res = await route.fetch(); let html = await res.text();
      html = html.replace('</head>', SAB + '</head>');
      await route.fulfill({ response: res, body: html,
        headers: { ...res.headers(), 'content-type': 'text/html' } });
    });
  }
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1400);
  return [ctx, p];
}

/* 1 · phone settings: band reserved, bottom-rest content clears the chrome */
{
  const [ctx, p] = await page({ width: 390, height: 844 });
  await p.evaluate(id => window.BK._show(id), 'settings');
  await sleep(1200);                      /* the 450ms interval must tick */
  const r = await p.evaluate(() => {
    const sc = document.querySelector('.screen.on');
    sc.scrollTop = sc.scrollHeight;       /* full scroll: the rest state */
    const pad = parseFloat(getComputedStyle(sc).paddingBottom);
    const cards = [...sc.querySelectorAll('.st-block')].map(e => {
      const c = e.getBoundingClientRect();
      return { left: c.left, right: c.right, top: c.top, bottom: c.bottom };
    });
    const tabEl = document.querySelector('#boombox .bb-tab');
    const tc = tabEl.getBoundingClientRect();
    return { banded: sc.classList.contains('chrome-band'), pad,
      cards, tab: { left: tc.left, right: tc.right, top: tc.top, bottom: tc.bottom } };
  });
  t('settings: scrollable screen wears the chrome band', r.banded === true, r.banded);
  t('settings: the band is at least 96px', r.pad >= 96, r.pad);
  const clash = r.cards.filter(c => !rectsClear(r.tab, c));
  t('settings: at bottom rest, no card sits under the music tab', clash.length === 0, clash.length + ' cards');
  await ctx.close();
}

/* 2 · phone locker: same law on the audit's original crime scene */
{
  const [ctx, p] = await page({ width: 390, height: 844 });
  await p.evaluate(id => window.BK._show(id), 'locker');
  await sleep(1200);
  await p.evaluate(() => {
    const sc = document.querySelector('.screen.on');
    sc.scrollTop = sc.scrollHeight;
  });
  await sleep(1000);                       /* let the 450ms interval see it */
  const r = await p.evaluate(() => {
    const sc = document.querySelector('.screen.on');
    const scrollable = sc.scrollHeight > sc.clientHeight + 8;
    const hint = document.getElementById('scrollHint');
    const scrim = document.getElementById('scrollScrim');
    return { scrollable, banded: sc.classList.contains('chrome-band'),
      hintAtBottom: hint.classList.contains('on'),
      scrimExists: !!scrim };
  });
  if (r.scrollable) {
    t('locker: scrollable screen wears the chrome band', r.banded === true, r.banded);
    t('locker: the chevron hides at the bottom rest', r.hintAtBottom === false, r.hintAtBottom);
  } else {
    t('locker: not scrollable at this size (band not required)', true);
    t('locker: chevron law not applicable', true);
  }
  t('locker: the scrim element exists for the chevron to live in', r.scrimExists, r.scrimExists);
  await ctx.close();
}

/* 3 · desktop settings: the open boombox folds instead of covering a card */
{
  const [ctx, p] = await page({ width: 1280, height: 860 });
  await p.evaluate(id => window.BK._show(id), 'settings');
  await sleep(2400);                       /* give the sabotage script time too */
  const r = await p.evaluate(() => {
    const bb = document.getElementById('boombox');
    const mini = bb.classList.contains('mini');
    if (mini) return { mini, clash: 0 };
    const a = bb.getBoundingClientRect();
    const clash = [...document.querySelectorAll('.screen.on .st-block')].filter(e => {
      const c = e.getBoundingClientRect();
      return !(a.left > c.right + 4 || a.right < c.left - 4 || a.top > c.bottom + 4 || a.bottom < c.top - 4);
    }).length;
    return { mini, clash };
  });
  t('desk settings: the boombox never covers a settings card',
    r.mini === true || r.clash === 0, `mini=${r.mini} clash=${r.clash}`);
  await ctx.close();
}

console.log(`${ok} ok · ${fail} fail` + (SABOTAGE ? ' (SABOTAGE RUN: red is correct)' : ''));
await b.close();
process.exit(fail && !SABOTAGE ? 1 : (SABOTAGE && !fail ? 1 : 0));

/* THE SETUP FLOW's standing gate (row 192). Four laws that were broken on
   08-25's audit and fixed on 08-27, asserted on the live build so they cannot
   drift back: nothing overlaps its neighbour on the league rows, the small
   print clears the ruled 4.5:1 floor, the three format buttons are one
   control, and the level blurb belongs to the table it describes.
   Run: node tools/setup-check.mjs   (server on :8899)
   Sabotage proof: SABOTAGE=1 node tools/setup-check.mjs must go red. */
import pw from '/home/user/ball-knowledge/node_modules/playwright/index.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SABOTAGE = process.env.SABOTAGE === '1';
const SAB = `<style>
  .lr-card.lock .lr-mid{padding-right:0!important}
  .lr-card.lock .lr-name{font-size:25px!important}
  #lgPacks .plab{color:var(--ink-faint)!important}
  .tgtbtn:nth-child(3){font-size:15px!important}
  .kl-blurb{background:transparent!important;border:0!important;border-radius:0!important}
</style>`;

let ok = 0, fail = 0;
const t = (name, cond, got) => {
  if (cond) ok++;
  else { fail++; console.log('  FAIL ' + name + (got !== undefined ? ' · got ' + got : '')); }
};

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });

async function open(width) {
  const ctx = await b.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2,
    hasTouch: true, isMobile: true });
  if (SABOTAGE) {
    await ctx.route('**/play/', async route => {
      const res = await route.fetch(); let html = await res.text();
      const before = html.length;
      html = html.replace('</head>', SAB + '</head>');
      if (html.length === before) throw new Error('MISSED PATCH');
      await route.fulfill({ response: res, body: html,
        headers: { ...res.headers(), 'content-type': 'text/html' } });
    });
  }
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1500);
  await p.evaluate(() => document.body.classList.add('reduce-motion'));
  return [ctx, p];
}

/* the contrast reader, the ruled floor is 4.5:1 (D3) */
const READER = () => {
  window.__bg = el => { let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c;
      n = n.parentElement; }
    return 'rgb(16, 13, 11)'; };
  window.__ratio = (fg, bg) => {
    const g = v => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v || ''); if (!m) return null;
      const f = x => { x = +x / 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); };
      return .2126 * f(m[1]) + .7152 * f(m[2]) + .0722 * f(m[3]); };
    const a = g(fg), b2 = g(bg); if (a == null || b2 == null) return null;
    const hi = Math.max(a, b2), lo = Math.min(a, b2);
    return +((hi + .05) / (lo + .05)).toFixed(2); };
};

/* 1 · THE LEAGUE ROWS: a name and its pill never share pixels, at any width
   a phone actually has. The audit found STREET LEGENDS running into "In the
   lab"; the row box overlapped by 111px on every locked league. */
for (const width of [360, 390, 430]) {
  const [ctx, p] = await open(width);
  await p.evaluate(() => window.BK._show('league'));
  await sleep(900);
  const rows = await p.evaluate(() => [...document.querySelectorAll('#screen-league .lr-card')]
    .map(c => { const nm = c.querySelector('.lr-name'), tab = c.querySelector('.lr-tab');
      if (!nm || !tab) return null;
      const a = nm.getBoundingClientRect(), t2 = tab.getBoundingClientRect();
      return { name: nm.textContent.trim(), gap: Math.round(t2.left - a.right) }; })
    .filter(Boolean));
  const worst = rows.reduce((m, r) => r.gap < m.gap ? r : m, rows[0]);
  t(`league ${width}px: no name touches its pill`, worst.gap > 0,
    `${worst.name} clears by ${worst.gap}px`);
  await ctx.close();
}

/* 2 · THE WORD FLOOR on the pack drawer's labels (D3, 4.5:1) */
{
  const [ctx, p] = await open(390);
  await p.evaluate(READER);
  await p.evaluate(() => window.BK._show('league'));
  await sleep(900);
  const labels = await p.evaluate(() => ['.plab', '.sub', '.cardword', '.pc']
    .map(s => { const e = document.querySelector('#lgPacks ' + s);
      if (!e) return null;
      return { s, ratio: window.__ratio(getComputedStyle(e).color, window.__bg(e)) }; })
    .filter(Boolean));
  for (const l of labels)
    t(`league: ${l.s} clears the 4.5:1 word floor`, l.ratio >= 4.5, l.ratio + ':1');
  await ctx.close();
}

/* 3 · THE FORMAT PICKER is one control, not two siblings and a cousin */
{
  const [ctx, p] = await open(360);
  await p.evaluate(READER);
  await p.evaluate(() => window.BK._show('rules'));
  await sleep(900);
  const r = await p.evaluate(() => {
    const t2 = [...document.querySelectorAll('.tgtbtn')];
    return { sizes: t2.map(e => getComputedStyle(e).fontSize),
      radii: t2.map(e => getComputedStyle(e).borderRadius),
      lines: t2.map(e => Math.round(e.getBoundingClientRect().height)),
      overflow: t2.map(e => e.scrollWidth > e.clientWidth + 1) };
  });
  t('rules: the three formats share one type size', new Set(r.sizes).size === 1, r.sizes.join('/'));
  t('rules: and one corner', new Set(r.radii).size === 1, r.radii.join('/'));
  t('rules: and none of them overflows at 360px', r.overflow.every(x => !x), r.overflow.join('/'));

  /* 4 · the blurb belongs to the table it describes */
  const j = await p.evaluate(() => {
    const bl = document.querySelector('.kl-blurb'), mp = document.querySelector('.kl-map');
    const br = bl.getBoundingClientRect(), mr = mp.getBoundingClientRect();
    return { gap: Math.round(mr.top - br.bottom),
      blurbBg: getComputedStyle(bl).backgroundColor,
      blurbBorder: getComputedStyle(bl).borderTopWidth,
      blurbRadius: getComputedStyle(bl).borderRadius,
      mapRadius: getComputedStyle(mp).borderRadius,
      mapBg: getComputedStyle(mp).backgroundColor,
      wildRatio: window.__ratio(getComputedStyle(document.querySelector('.klwild')).color,
        window.__bg(document.querySelector('.klwild'))) };
  });
  /* HOUSED, not joined. The first fix made the blurb the table's header, and
     that only worked on this screen: the handicap screen puts a label between
     the two. So the law is that the line has a card of its own, in the same
     material as the table, rather than floating on the screen. */
  t('rules: the level line is housed, not floating',
    j.blurbBg === j.mapBg && j.blurbBorder !== 'none' && j.blurbRadius === j.mapRadius,
    `${j.blurbBg} / border ${j.blurbBorder} / radius ${j.blurbRadius}`);
  t('rules: Surprise me clears the word floor', j.wildRatio >= 4.5, j.wildRatio + ':1');
  await ctx.close();
}

/* 5 · THE RADIUS LADDER (D4): the main button is on the button step */
{
  const [ctx, p] = await open(390);
  await p.evaluate(() => window.BK._show('rules'));
  await sleep(700);
  const rad = await p.evaluate(() => {
    const btn = document.querySelector('.mbtn');
    const root = getComputedStyle(document.documentElement);
    return { btn: getComputedStyle(btn).borderRadius, step: root.getPropertyValue('--r-btn').trim() };
  });
  t('the main button wears the ladder\'s button step', rad.btn === rad.step,
    `${rad.btn} vs ${rad.step}`);
  await ctx.close();
}

console.log(`${ok} ok · ${fail} fail` + (SABOTAGE ? ' (SABOTAGE RUN: red is correct)' : ''));
await b.close();
process.exit(fail && !SABOTAGE ? 1 : (SABOTAGE && !fail ? 1 : 0));

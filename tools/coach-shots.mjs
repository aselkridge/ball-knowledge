/* THE COACH BUTTON, under the shot clock. And the music button, as it is.

   Aaron, 2026-08-22: "In the top right (not in the hud) but under the
   shotclock, there should be a litttle question mark or the coach icon/logo
   and if you click it it activates the coach or at least pops up with the
   question 'do you need help?'... I assume the music should stay in the
   bottom right corner where it always is for continuity, but I could be
   wrong, can I see the coach where I stated and the music too, as it is now
   and what my recommendations are."

   Variants injected in flight; the repo is untouched and nothing is shipped.
   A patch that fails to match is a hard error, and there is a render guard,
   because a dead server still fulfils patched HTML and produces frames that
   look like a successful run.

     node tools/coach-shots.mjs

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';
import fs from 'fs';

const OUT = 'design/shots/coach';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* THE WHISTLE IS NOT HERE, and that is a finding rather than an omission.
   Four whistle glyphs were drawn and rendered at 19px, the size this button
   ships at, and none of them read as a whistle: two looked like a keyhole,
   one like a padlock, one like a squiggle. A whistle is the coach's own
   object and the sound design already uses one, so it was worth trying twice.
   It is below the resolution where the shape survives. The two icons here are
   the two Aaron named, and both are legible instantly. */
const ICONS = {
  ask: '<svg class="ic" style="stroke-width:2.6"><use href="#i-ask"/></svg>',
  bell: '<svg class="ic"><use href="#i-bell"/></svg>',
};
const SPRITE = `
  <symbol id="i-ask" viewBox="0 0 24 24">
    <path d="M9.1 9a3 3 0 1 1 3.9 2.9c-.8.3-1 .9-1 1.7v.8"/>
    <circle cx="12" cy="17.6" r="1.2" fill="currentColor" stroke="none"/></symbol>`;

/* Sits under the shot clock, in the court area, NOT in the HUD, which is what
   he specified. Mirrors the music button's own geometry at the other corner
   so the two read as a pair: same size, same round shape, same inset. */
const CSS = `
  #coachAsk{position:absolute;z-index:7;top:12px;right:14px;
    width:44px;height:44px;border-radius:50%;display:grid;place-items:center;
    background:rgba(16,10,6,.92);border:1px solid var(--line);color:var(--ink-dim);
    cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.45)}
  #coachAsk .ic{width:21px;height:21px;fill:none;stroke:currentColor}
  /* LIVE, when the coach has something to say. Copies the values of the
     shipped .dbtn.live rule rather than inventing a second orange:
     color #ffb03a, border rgba(255,176,58,.7), glow 0 0 8px rgba(...,.35) */
  #coachAsk.live{color:#ffb03a;border-color:rgba(255,176,58,.7);
    box-shadow:0 0 8px rgba(255,176,58,.35),0 4px 14px rgba(0,0,0,.45)}
  /* the ask, in the coach's own voice and answerable in one tap */
  #coachPop{position:absolute;z-index:7;top:64px;right:14px;width:216px;
    background:rgba(16,10,6,.96);border:1px solid rgba(255,176,58,.45);
    border-radius:12px;padding:13px 14px 11px;box-shadow:0 10px 30px rgba(0,0,0,.55)}
  #coachPop p{margin:0 0 11px;font-size:13.5px;line-height:1.4;color:var(--ink)}
  #coachPop .cp-row{display:flex;gap:8px}
  #coachPop button{flex:1;font-family:var(--mono);font-size:10.5px;font-weight:700;
    letter-spacing:.1em;padding:7px 0;border-radius:7px;cursor:pointer}
  #coachPop .yes{background:var(--accent);border:0;color:#1a1008}
  #coachPop .no{background:transparent;border:1px solid var(--line);color:var(--ink-dim)}`;

const BTN = ico => '<button id="coachAsk" aria-label="Need help?">' + ICONS[ico] + '</button>';
const BTN_LIVE = ico => '<button id="coachAsk" class="live" aria-label="Need help?">' +
  ICONS[ico] + '</button>';
const POP = '<div id="coachPop"><p>Need a hand with this one?</p>' +
  '<div class="cp-row"><button class="yes">YES</button>' +
  '<button class="no">NOT NOW</button></div></div>';

/* THE MUSIC BUTTON IS NOT THE SAME SHAPE, measured: it is 52px with a 10px
   right inset, and the coach as first drawn is 44px with 14px. Two round dark
   buttons at opposite corners that are almost but not quite a pair is worse
   than either choice made on purpose, so the matched geometry is its own
   variant rather than a silent correction. */
const MATCH = '#coachAsk{width:52px;height:52px;right:10px;top:10px}' +
  '#coachAsk .ic{width:24px;height:24px}';

const VARIANTS = [
  { key: 'now', label: 'as it is now', add: '' },
  { key: 'ask', label: 'question mark, resting', add: BTN('ask') },
  { key: 'ask-live', label: 'question mark, coach has something', add: BTN_LIVE('ask') },
  { key: 'ask-pop', label: 'question mark, tapped', add: BTN_LIVE('ask') + POP },
  { key: 'bell', label: 'coach bell, resting', add: BTN('bell') },
  { key: 'bell-live', label: 'coach bell, coach has something', add: BTN_LIVE('bell') },
  { key: 'ask-match', label: 'question mark, matched to the music button',
    add: BTN_LIVE('ask'), css: MATCH },
];

const ANCHOR = '<button id="viewReset">';
const SPRITE_ANCHOR = '<symbol id="i-ball"';

const b = await pw.chromium.launch({
  executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'],
});

for (const view of [{ k: 'phone', w: 390, h: 844, m: true },
                    { k: 'desk', w: 1280, h: 860 }]) {
  for (const v of VARIANTS) {
    const ctx = await b.newContext({
      viewport: { width: view.w, height: view.h }, deviceScaleFactor: 2,
      hasTouch: !!view.m, isMobile: !!view.m,
    });
    if (v.add) {
      await ctx.route('**/play/', async route => {
        const res = await route.fetch();
        let html = await res.text();
        if (!html.includes(ANCHOR)) throw new Error('viewReset anchor missing: ' + v.key);
        if (!html.includes(SPRITE_ANCHOR)) throw new Error('sprite anchor missing');
        html = html.replace(ANCHOR, v.add + ANCHOR);
        html = html.replace(SPRITE_ANCHOR, SPRITE + '<symbol id="i-ball"');
        html = html.replace('</head>',
          '<style>' + CSS + (v.css || '') + '</style></head>');
        await route.fulfill({ response: res, body: html,
          headers: { ...res.headers(), 'content-type': 'text/html' } });
      });
    }
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
    await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
    await p.reload({ waitUntil: 'networkidle' });
    await sleep(1100);
    await p.evaluate(() => {
      const B = window.BK, K = B.coach;
      K.applyColors({ nm: 'Showtime', ab: 'SHO' }, { nm: 'The Bricks', ab: 'BRK' });
      K.startGame({ league: 'nba', decade: 'ANY', target: 11,
        rosters: K.pickRosters('nba', 'ANY') }, true);
      B._show('game');
    });
    await sleep(1600);
    await p.evaluate(() => {
      const B = window.BK, S = B.state();
      S.offense = 0; S.phase = 'off-select'; S.inbPending = null;
      S.selected = S.ball.holder; S.staged = null;
      B._offer();
      document.body.classList.add('reduce-motion');
    });
    await sleep(700);

    const ok = await p.evaluate(() => {
      const c = document.getElementById('court');
      const a = document.querySelector('#hud img.sbart');
      return !!c && c.getBoundingClientRect().height > 100 && !!a && a.naturalWidth > 0;
    });
    if (!ok) { console.error('DID NOT RENDER: ' + v.key + ' ' + view.k); process.exit(1); }

    /* does the new button collide with anything already up there? The banner
       is centred across the top of the court, and the shot clock overlay sits
       in the same corner. Measured, not eyeballed. */
    const geo = await p.evaluate(() => {
      const bx = i => { const e = typeof i === 'string' ? document.getElementById(i) : i;
        if (!e) return null; const r = e.getBoundingClientRect();
        return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
      const hit = (a, c) => !!(a && c) && a[0] < c[0] + c[2] && a[0] + a[2] > c[0] &&
        a[1] < c[1] + c[3] && a[1] + a[3] > c[1];
      const ask = bx('coachAsk'), ban = bx('banner'), music = bx('bbTab'),
        rst = bx('viewReset'), sc = bx('shotclock'), hud = bx('hud'),
        pop = bx('coachPop');
      /* the POPUP has to be measured too. It was not in the first version of
         this list and the first render put it straight over the banner, which
         is the same class of miss as the setup carousel over the turn tray. */
      return { ask, banner: ban, music, viewReset: rst, shotclock: sc, pop,
        vw: innerWidth,
        clash: { banner: hit(ask, ban), music: hit(ask, music),
                 viewReset: hit(ask, rst), shotclock: hit(ask, sc),
                 popOverBanner: hit(pop, ban),
                 insideHud: !!(ask && hud && ask[1] < hud[1] + hud[3]) } };
    });
    console.log(`  ${view.k.padEnd(6)} ${v.key.padEnd(10)} ask ${JSON.stringify(geo.ask)}` +
      `  music ${JSON.stringify(geo.music)}  clashes ` +
      Object.entries(geo.clash).filter(([, x]) => x).map(([k]) => k).join(',') || '  clashes none');

    await p.screenshot({ path: `${OUT}/${view.k}-${v.key}.png` });
    await ctx.close();
  }
}
await b.close();

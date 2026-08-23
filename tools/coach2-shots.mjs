/* WHERE THE COACH LIVES: bottom left opposite the music, or in the pause menu.

   Aaron, 2026-08-22: "place the coach icon (the guy who pops up when a coach
   hint appears) in the bottom-left-hand corner opposite music, or place him in
   the pause menu to the left of the score. Let's see both."

   THE ICON IS NOT DRAWN, IT ALREADY EXISTS. He named it himself: the guy who
   pops up is `assets/brand/philosopher.png`, a classical bust with a raised
   finger on an orange disc, already on the coach card at 34, 46 and 56px, and
   already loaded on this screen. That is better than the question mark or the
   bell from the last round, and it is the third answer to the medium question
   (build it, source it, or find it already built) that CLAUDE.md says to check
   first. Both placements here use him.

   Variants injected in flight. Repo untouched, nothing shipped, a patch that
   fails to match is a hard error, and there is a render guard.

     node tools/coach2-shots.mjs

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';
import fs from 'fs';

const OUT = 'design/shots/coach2';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FACE = 'assets/brand/philosopher.png';

/* A · BOTTOM LEFT. Mirrors the music button exactly: same 52px, same 10px
   inset, same round shape, so the two corners read as a deliberate pair. The
   measurement that made that the right number is from the last round: music
   is 52px at 10px, and 44px at 14px looked like a mistake beside it. */
const CSS_BL = `
  #coachBtn{position:fixed;z-index:41;left:10px;bottom:10px;
    width:52px;height:52px;border-radius:50%;padding:0;overflow:hidden;
    border:1px solid var(--accent-deep);background:#0e0b08;cursor:pointer;
    box-shadow:0 6px 16px rgba(0,0,0,.5),inset 0 2px 0 rgba(255,240,220,.12);
    display:grid;place-items:center}
  #coachBtn img{width:100%;height:100%;object-fit:cover;display:block}
  /* RESTING is quieter than the music button on purpose: music is always
     doing something, the coach usually is not. Grey ring, portrait dimmed. */
  #coachBtn img{filter:saturate(.55) brightness(.72)}
  #coachBtn{border-color:var(--line)}
  /* LIVE: he has something to say. Copies the shipped .dbtn.live values
     rather than inventing a second orange:
     border rgba(255,176,58,.7), glow 0 0 8px rgba(255,176,58,.35) */
  #coachBtn.live{border-color:rgba(255,176,58,.7);
    box-shadow:0 0 10px rgba(255,176,58,.4),0 6px 16px rgba(0,0,0,.5)}
  #coachBtn.live img{filter:none}`;

/* B · IN THE PAUSE MENU, left of the score. The score block is centred, so the
   coach and the score become one row rather than the coach being bolted to the
   side of a centred column. */
const CSS_PV = `
  .pv-coachrow{display:flex;align-items:center;justify-content:center;gap:14px}
  .pv-coachrow .pv-score{text-align:left}
  #pvCoach{width:58px;height:58px;border-radius:50%;padding:0;overflow:hidden;
    flex:0 0 auto;border:1px solid rgba(255,176,58,.7);background:#0e0b08;
    cursor:pointer;box-shadow:0 0 10px rgba(255,176,58,.3);display:grid;place-items:center}
  #pvCoach img{width:100%;height:100%;object-fit:cover;display:block}
  #pvCoach .pv-cl{position:absolute}`;

const BTN_BL = live => '<button id="coachBtn"' + (live ? ' class="live"' : '') +
  ' aria-label="Coach"><img src="' + FACE + '" alt=""></button>';

const b = await pw.chromium.launch({
  executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'],
});

const VARIANTS = [
  { key: 'now', label: 'as it is now' },
  { key: 'bl-rest', label: 'A · bottom left, resting', bl: BTN_BL(false), css: CSS_BL },
  { key: 'bl-live', label: 'A · bottom left, he has something', bl: BTN_BL(true), css: CSS_BL },
  { key: 'pv-now', label: 'the pause menu as it is', paused: true },
  { key: 'pv-coach', label: 'B · in the pause menu, left of the score',
    paused: true, pvCoach: true, css: CSS_PV },
  { key: 'both', label: 'both at once, to see if that is too much',
    bl: BTN_BL(true), css: CSS_BL + CSS_PV, pvCoach: true, paused: true },
];

const PV_SCORE = '<div class="pv-score" id="pvScore"></div>';

for (const view of [{ k: 'phone', w: 390, h: 844, m: true },
                    { k: 'desk', w: 1280, h: 860 }]) {
  for (const v of VARIANTS) {
    const ctx = await b.newContext({
      viewport: { width: view.w, height: view.h }, deviceScaleFactor: 2,
      hasTouch: !!view.m, isMobile: !!view.m,
    });
    if (v.css) {
      await ctx.route('**/play/', async route => {
        const res = await route.fetch();
        let html = await res.text();
        if (v.bl) {
          const A = '<button id="viewReset">';
          if (!html.includes(A)) throw new Error('viewReset anchor missing: ' + v.key);
          html = html.replace(A, v.bl + A);
        }
        if (v.pvCoach) {
          if (!html.includes(PV_SCORE)) throw new Error('pvScore anchor missing: ' + v.key);
          html = html.replace(PV_SCORE,
            '<div class="pv-coachrow"><button id="pvCoach" aria-label="Coach">' +
            '<img src="' + FACE + '" alt=""></button>' + PV_SCORE + '</div>');
        }
        html = html.replace('</head>', '<style>' + v.css + '</style></head>');
        await route.fulfill({ response: res, body: html,
          headers: { ...res.headers(), 'content-type': 'text/html' } });
      });
    }
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 130)));
    await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
    await p.reload({ waitUntil: 'networkidle' });
    await sleep(1150);
    await p.evaluate(() => {
      const B = window.BK, K = B.coach;
      K.applyColors({ nm: 'Showtime', ab: 'SHO' }, { nm: 'The Bricks', ab: 'BRK' });
      K.startGame({ league: 'nba', decade: 'ANY', target: 11,
        rosters: K.pickRosters('nba', 'ANY') }, true);
      B._show('game');
    });
    await sleep(1650);
    await p.evaluate(() => {
      const B = window.BK, S = B.state();
      S.score[0] = 7; S.score[1] = 4;
      S.offense = 0; S.phase = 'off-select'; S.inbPending = null;
      S.selected = S.ball.holder; S.staged = null;
      B._offer();
      document.body.classList.add('reduce-motion');
    });
    await sleep(600);
    if (v.paused) {
      await p.evaluate(() => document.getElementById('btnPause').click());
      await sleep(800);
    }

    const ok = await p.evaluate(() => {
      const c = document.getElementById('court');
      return !!c && c.getBoundingClientRect().height > 100;
    });
    if (!ok) { console.error('DID NOT RENDER: ' + v.key + ' ' + view.k); process.exit(1); }

    /* does the new button land on anything? The dock and the bottom
       instruction line both live down there, and the last round's lesson was
       that a collision has to be asserted, not eyeballed. */
    const geo = await p.evaluate(() => {
      const bx = i => { const e = document.getElementById(i); if (!e) return null;
        const r = e.getBoundingClientRect();
        return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
      const hit = (a, c) => !!(a && c) && a[0] < c[0] + c[2] && a[0] + a[2] > c[0] &&
        a[1] < c[1] + c[3] && a[1] + a[3] > c[1];
      const coach = bx('coachBtn'), music = bx('bbTab'), dock = bx('stagebox'),
        note = (() => { const e = document.querySelector('#actions .note');
          if (!e) return null; const r = e.getBoundingClientRect();
          return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })();
      const faceOk = (() => { const im = document.querySelector('#coachBtn img,#pvCoach img');
        return im ? im.naturalWidth > 0 : null; })();
      /* the MUSIC button is measured against the same things, because a
         collision the shipped game already has is not one the coach caused,
         and reporting it as new would be blaming the wrong change. */
      return { coach, music, pvCoach: bx('pvCoach'), faceOk, note,
        clash: [['dock', hit(coach, dock)], ['note', hit(coach, note)],
                ['music', hit(coach, music)]].filter(x => x[1]).map(x => x[0]),
        musicClash: [['dock', hit(music, dock)], ['note', hit(music, note)]]
                .filter(x => x[1]).map(x => x[0]) };
    });
    console.log(`  ${view.k.padEnd(6)} ${v.key.padEnd(9)} coach ${JSON.stringify(geo.coach)}` +
      ` pv ${JSON.stringify(geo.pvCoach)} music ${JSON.stringify(geo.music)}` +
      ` face=${geo.faceOk}` +
      (geo.clash.length ? '  coachClash ' + geo.clash.join(',') : '  coachClash none') +
      '  musicClash ' + (geo.musicClash.length ? geo.musicClash.join(',') : 'none') +
      '  note ' + JSON.stringify(geo.note) +
      (errs.length ? '  ERR ' + errs[0] : ''));

    await p.screenshot({ path: `${OUT}/${view.k}-${v.key}.png` });
    await ctx.close();
  }
}
await b.close();

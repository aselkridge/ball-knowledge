/* THE COACH BUTTON'S TAP: his speed dial, or one tap = one tip.

   Aaron, 2026-08-23, with a reference image of a floating action button
   fanning out into satellite circles: "it would have two circular pop outs
   when you click it. above it a popout would say need a tip? And one out to
   the right would say turn first time coach back on? or off if it's on."

   Both candidates start from the same resting button: the philosopher,
   bottom left, dimmed until he has something. What differs is the TAP.

     DIAL  his: the button fans out into two satellites, TIP above and
           COACH ON/OFF to the right, each a 44px circle with a label chip.
     TIP   one tap plays the coach's existing card with a line about the
           current moment. No intermediate menu. The card here is a static
           replica of the real #coachTip so the frame is honest about what
           a player would see.

   Variants injected in flight. Repo untouched, nothing shipped, a patch that
   fails to match is a hard error, and there is a render guard.

     node tools/coach3-shots.mjs

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';
import fs from 'fs';

const OUT = 'design/shots/coach3';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FACE = 'assets/brand/philosopher.png';

const CSS = `
  #coachBtn{position:fixed;z-index:41;left:10px;bottom:10px;
    width:52px;height:52px;border-radius:50%;padding:0;overflow:hidden;
    border:1px solid var(--line);background:#0e0b08;cursor:pointer;
    box-shadow:0 6px 16px rgba(0,0,0,.5);display:grid;place-items:center}
  #coachBtn img{width:100%;height:100%;object-fit:cover;display:block;
    filter:saturate(.55) brightness(.72)}
  #coachBtn.open img,#coachBtn.live img{filter:none}
  #coachBtn.open,#coachBtn.live{border-color:rgba(255,176,58,.7);
    box-shadow:0 0 10px rgba(255,176,58,.4),0 6px 16px rgba(0,0,0,.5)}

  /* THE SPEED DIAL. Satellites are 44px, the floor for a finger, with the
     label as a chip beside/above each rather than words crammed inside a
     circle: his reference image uses icon-only satellites, but his own copy
     ("need a tip?") does not fit a 44px circle at a readable size, and a
     dial whose options you cannot read is chaos again. */
  .cd-sat{position:fixed;z-index:41;width:44px;height:44px;border-radius:50%;
    border:1px solid rgba(255,176,58,.7);background:rgba(16,10,6,.96);
    color:#ffb03a;display:grid;place-items:center;cursor:pointer;
    box-shadow:0 0 8px rgba(255,176,58,.3),0 6px 14px rgba(0,0,0,.5)}
  .cd-sat svg{width:20px;height:20px;fill:none;stroke:currentColor;
    stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}
  /* ABOVE THE DOCK, measured not guessed: the action strip sits at y741 on a
     390x844 phone (bottom offset 103px), and the first render put the upper
     satellite and the tip card straight through it, which is the carousel-
     over-the-tray bug wearing a new outfit. Popouts clear the dock band; the
     real build must anchor off the dock's live rect the way dockFit does,
     since the dock moves between its slim, side and full states. */
  #cdTip{left:14px;bottom:118px}
  #cdTog{left:74px;bottom:14px}
  .cd-chip{position:fixed;z-index:41;font-family:var(--mono);font-size:10px;
    font-weight:700;letter-spacing:.09em;text-transform:uppercase;
    color:var(--ink);background:rgba(16,10,6,.94);border:1px solid var(--line);
    border-radius:999px;padding:4px 10px;white-space:nowrap}
  #cdTipChip{left:64px;bottom:129px}
  #cdTogChip{left:124px;bottom:26px}
  /* the veil behind an open dial, so a stray tap closes it instead of
     hitting the court through the gaps */
  #cdVeil{position:fixed;inset:0;z-index:40;background:rgba(8,5,3,.45)}

  /* ONE TAP = ONE TIP: a static replica of the real #coachTip card, the
     corner (non-modal) shape it uses online, anchored above the button. */
  #tipCard{position:fixed;z-index:41;left:10px;bottom:118px;
    width:min(300px,80vw);display:flex;gap:10px;align-items:flex-start;
    background:rgba(16,10,6,.97);border:1px solid rgba(255,176,58,.5);
    border-radius:14px;padding:12px 13px;box-shadow:0 10px 30px rgba(0,0,0,.6)}
  #tipCard img{width:34px;height:34px;border-radius:50%;flex:0 0 auto}
  #tipCard .tw{font-family:var(--mono);font-size:9px;letter-spacing:.2em;
    text-transform:uppercase;color:var(--accent);margin-bottom:4px}
  #tipCard .tt{font-size:13.5px;line-height:1.45;color:var(--ink)}`;

const BTN = cls => '<button id="coachBtn"' + (cls ? ' class="' + cls + '"' : '') +
  ' aria-label="Coach"><img src="' + FACE + '" alt=""></button>';

const DIAL =
  '<div id="cdVeil"></div>' +
  '<button class="cd-sat" id="cdTip" aria-label="Need a tip?">' +
  '<svg viewBox="0 0 24 24"><path d="M9.5 18h5M10 21h4M12 3a6 6 0 0 1 3.5 10.9' +
  'c-.7.5-1 1.3-1 2.1h-5c0-.8-.3-1.6-1-2.1A6 6 0 0 1 12 3Z"/></svg></button>' +
  '<span class="cd-chip" id="cdTipChip">Need a tip?</span>' +
  '<button class="cd-sat" id="cdTog" aria-label="Coach on or off">' +
  '<svg viewBox="0 0 24 24"><path d="M12 3.6a5.4 5.4 0 0 1 5.4 5.4v3.6l1.9 3.2H4.7' +
  'L6.6 12.6V9A5.4 5.4 0 0 1 12 3.6ZM10.2 19.4a1.9 1.9 0 0 0 3.6 0"/></svg></button>' +
  '<span class="cd-chip" id="cdTogChip">Coach off</span>';

const TIPCARD =
  '<div id="tipCard"><img src="' + FACE + '" alt="">' +
  '<div><div class="tw">Coach</div>' +
  '<div class="tt">Reed is standing in a paint zone. A shot from there runs ' +
  'through an easier card.</div></div></div>';

const VARIANTS = [
  { key: 'rest', label: 'at rest, both options look like this', add: BTN('') },
  { key: 'dial', label: 'his speed dial, open', add: BTN('open') + DIAL },
  { key: 'tip', label: 'one tap, one tip', add: BTN('live') + TIPCARD },
];

const ANCHOR = '<button id="viewReset">';

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
    await ctx.route('**/play/', async route => {
      const res = await route.fetch();
      let html = await res.text();
      if (!html.includes(ANCHOR)) throw new Error('anchor missing: ' + v.key);
      html = html.replace(ANCHOR, v.add + ANCHOR);
      html = html.replace('</head>', '<style>' + CSS + '</style></head>');
      await route.fulfill({ response: res, body: html,
        headers: { ...res.headers(), 'content-type': 'text/html' } });
    });
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

    const ok = await p.evaluate(() => {
      const c = document.getElementById('court');
      const im = document.querySelector('#coachBtn img');
      return !!c && c.getBoundingClientRect().height > 100 && !!im && im.naturalWidth > 0;
    });
    if (!ok) { console.error('DID NOT RENDER: ' + v.key + ' ' + view.k); process.exit(1); }

    /* what does an open dial or a tip card sit on top of? Measured against
       the dock strip and the music button, the two live objects down there. */
    const geo = await p.evaluate(() => {
      const bx = sel => { const e = document.querySelector(sel); if (!e) return null;
        const r = e.getBoundingClientRect();
        return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
      const hit = (a, c) => !!(a && c) && a[0] < c[0] + c[2] && a[0] + a[2] > c[0] &&
        a[1] < c[1] + c[3] && a[1] + a[3] > c[1];
      const dock = bx('#stagebox'), music = bx('#bbTab');
      const pieces = { sat1: bx('#cdTip'), sat2: bx('#cdTog'),
        chip1: bx('#cdTipChip'), chip2: bx('#cdTogChip'), card: bx('#tipCard') };
      const clashes = [];
      for (const k in pieces) {
        if (hit(pieces[k], dock)) clashes.push(k + '/dock');
        if (hit(pieces[k], music)) clashes.push(k + '/music');
      }
      return { ...pieces, dock, clashes };
    });
    console.log(`  ${view.k.padEnd(6)} ${v.key.padEnd(5)} dock ${JSON.stringify(geo.dock)}` +
      ` sat1 ${JSON.stringify(geo.sat1)} card ${JSON.stringify(geo.card)}` +
      (geo.clashes.length ? '  CLASH ' + geo.clashes.join(',') : '  clash none') +
      (errs.length ? '  ERR ' + errs[0] : ''));

    await p.screenshot({ path: `${OUT}/${view.k}-${v.key}.png` });
    await ctx.close();
  }
}
await b.close();

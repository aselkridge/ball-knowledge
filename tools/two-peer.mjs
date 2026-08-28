/* TWO REAL PEERS, ONE ROOM. Row 128 cannot be proved without this: online is
   the launch, and until now every check in the fleet drove a single page, so
   nothing in the suite has ever watched an event cross the wire.

   It runs the local relay (server/index.js) and two headless phones through
   the real online road: host a room, join by code, both squads locked, into
   a live 5v5. Then it reports which possession model each side is running.

   Run:  node tools/two-peer.mjs            (game on :8899, relay on :8901)
   Env:  RELAY=8901 SITE=8899 KEEP=1        (KEEP leaves the browser open)

   WHERE IT REACHES TODAY: a real room over the real relay, both roles
   assigned, the house rules accepted, and the toss-up played end to end
   (ready, buzz, answer, the winner's prize, the loser's hand-off). It then
   STOPS on the colours screen with both peers on it and no error showing.
   Three things were ruled out by measurement, so whoever picks this up does
   not have to redo them: the swatches do respond (clicking one directly sets
   `cwc sel` and writes the name into "Your colors"), `taken` and `clash`
   swatches refuse the tap and are skipped, and the squad name box is filled
   before Suit up is pressed, with `.cw-nb-err` empty afterwards. So the
   remaining blocker is in cwLock/cwAdvance's online path, not in the pick.
   Finishing this is row 207.

   NOTHING HERE PATCHES THE PRODUCT: the relay address is the `?server=`
   parameter the build already reads, and every step presses a control a
   player presses.

   Export: `twoPeer()` hands back both pages so a check can drive them, and
   `toGame(t)` walks them as far as the road currently goes. */
import pw from '/home/user/ball-knowledge/node_modules/playwright/index.mjs';

const SITE = process.env.SITE || '8899';
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* poll until a predicate holds, so the harness waits on the GAME rather than
   on a guessed number of milliseconds (the flake that made install-check
   unreliable, row 101) */
async function until(page, fn, what, ms = 15000, arg) {
  const t0 = Date.now();
  for (;;) {
    let v;
    try { v = await page.evaluate(fn, arg); } catch (e) { v = null; }
    if (v) return v;
    if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}`);
    await sleep(200);
  }
}

const screen = () => (document.querySelector('.screen.on') || {}).id || 'none';

/* the id that carries a screen forward, or null if you advance by picking */
const FORWARD = { 'screen-names': '#nmGo', 'screen-decade': '#btnDecGo',
  'screen-squad': '#srLock', 'screen-locker': '#lkGo', 'screen-rules': '#btnTip',
  'screen-colors': '#cwLock', 'screen-courts': '#crtLock', 'screen-handicap': '#hcLock' };

async function settle(p) {
  let last = null, n = 0;
  for (let k = 0; k < 50; k++) {
    const id = await p.evaluate(screen);
    n = id === last ? n + 1 : 0; last = id;
    if (n >= 3 && k > 4) break;
    await sleep(250);
  }
  return last;
}

/* Press whatever this screen's way onward is, filling the names if it asks.
   The league screen is the odd one: no forward button, you tap a card to
   open it and tap the pill inside. */
async function walkSetup(p, names, stop = 'screen-online', max = 12) {
  const road = [];
  for (let i = 0; i < max; i++) {
    const id = await settle(p);
    road.push(id.replace('screen-', ''));
    if (id === stop || id === 'screen-game' || id === 'none') break;
    if (id === 'screen-names') {
      const f = await p.locator('#screen-names input:visible').all();
      for (const [k, el] of f.entries()) { await el.click(); await el.fill(names[k] || ('X' + k)); }
      await p.evaluate(() => document.activeElement && document.activeElement.blur());
      await sleep(300);
    }
    const sel = FORWARD[id];
    const hit = sel && await p.evaluate(s => {
      const e = document.querySelector(s);
      if (!e || getComputedStyle(e).display === 'none') return false;
      e.scrollIntoView({ block: 'center' }); e.click(); return true; }, sel);
    if (!hit) await p.evaluate(() => {
      const sc = document.querySelector('.screen.on');
      const card = sc.querySelector('.lr-card:not(.lock)');
      if (card) { card.click(); return; }
      const m = [...sc.querySelectorAll('.mbtn:not(.ghost)')]
        .filter(e => getComputedStyle(e).display !== 'none');
      if (m.length) m[m.length - 1].click(); });
    await sleep(600);
  }
  return road;
}

export async function twoPeer(opts = {}) {
  /* read at CALL time, not import time: online-check sets RELAY for its
     dead-relay sabotage AFTER importing this module, and a load-time read
     made that sabotage silently dial the real relay and go green */
  const RELAY = opts.relay || process.env.RELAY || '8901';
  const browser = await pw.chromium.launch({
    executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });
  const pages = [], ctxs = [], errs = [[], []];
  for (let i = 0; i < 2; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs[i].push(String(e)));
    /* the server override is a real query param the build already reads, so
       nothing here patches the product to make the test pass */
    await p.goto(`http://127.0.0.1:${SITE}/play/?server=ws://127.0.0.1:${RELAY}`,
      { waitUntil: 'networkidle' });
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
    await p.reload({ waitUntil: 'networkidle' });
    await sleep(1400);
    await p.evaluate(() => document.body.classList.add('reduce-motion'));
    ctxs.push(ctx); pages.push(p);
  }
  const [host, guest] = pages;

  /* 1 · both open the online room screen */
  for (const p of pages) {
    await p.evaluate(() => window.BK._show('title'));
    await sleep(500);
    await p.evaluate(() => {
      const c = [...document.querySelectorAll('#mmRolo [data-go]')];
      const on = c.find(x => x.getAttribute('data-go') === 'online');
      (on || c[0]).click();
    });
  }
  await until(host, screen, 'the host on the online screen').catch(() => {});
  await sleep(700);

  /* 2 · the host walks the setup BEFORE the room exists. roomsetBegin sends
     them to names, league, era and rules first ("perfect warm-up time" says
     the code), and only roomsetFinish dials the relay. */
  await host.evaluate(() => document.getElementById('oCreate').click());
  await walkSetup(host, ['Showtime', 'SHO']);
  const code = await until(host, () => {
    const el = document.getElementById('frCode');
    const t = (el ? el.textContent : '').replace(/[^A-Z0-9]/gi, '');
    return t.length === 4 ? t : null;
  }, 'a room code');

  /* 3 · guest types it and joins */
  await guest.evaluate(c => {
    const box = document.getElementById('oCode');
    box.value = c;
    box.dispatchEvent(new Event('input', { bubbles: true }));
    const otp = [...document.querySelectorAll('#frOtp input')];
    otp.forEach((el, i) => { el.value = c[i];
      el.dispatchEvent(new Event('input', { bubbles: true })); });
    document.getElementById('oJoin').click();
  }, code);

  /* 4 · both sides report the socket is up and they know their role */
  const roles = [];
  for (const p of pages)
    roles.push(await until(p, () => (window.BK && window.BK._net && window.BK._net().on)
      ? window.BK._net() : null, 'the socket to come up', 20000));

  return { browser, ctxs, pages, host, guest, code, roles, errs,
    until, sleep, settle, walkSetup, screen };
}

/* one step of the toss-up, whichever part of it is showing */
async function tossUp(p, who) {
  const part = await p.evaluate(() => {
    const on = [...document.querySelectorAll('#screen-tossup .tu-part')]
      .find(e => e.classList.contains('on'));
    return on ? on.id : null;
  });
  if (part === 'tuHow') {
    await p.evaluate(() => document.getElementById('tuReady').click());
  } else if (part === 'tuPlay') {
    /* buzz on our own side, then take the first answer offered */
    const hit = await p.evaluate(w => {
      const b = document.querySelector(`#tuBuzzes .tu-buzz[data-side="${w}"]`);
      if (b && getComputedStyle(b).display !== 'none' && !b.disabled) { b.click(); return 'buzz'; }
      const a = [...document.querySelectorAll('#tuAns button')]
        .filter(e => getComputedStyle(e).display !== 'none');
      if (a.length) { a[0].click(); return 'answer'; }
      return null;
    }, who);
    if (!hit) await sleep(700);
  } else if (part === 'tuCall') {
    /* the prize cards are DIVS with data-k, not buttons, and only the winner
       gets to tap one; the loser waits for the `tucall` event */
    await p.evaluate(() => {
      const c = [...document.querySelectorAll('#tuCall .tu-call')]
        .filter(e => e.getBoundingClientRect().width > 0);
      if (c.length) c[0].click();
    });
  }
  await sleep(600);
}

/* Both peers press their way from the room to a live game, in step, because
   an online screen only advances when the other side has done its half. */
export async function toGame(t, max = 16) {
  const road = [[], []];
  for (let i = 0; i < max; i++) {
    const at = [];
    for (const p of t.pages) at.push(await settle(p));
    at.forEach((id, k) => { if (road[k][road[k].length - 1] !== id) road[k].push(id.replace('screen-', '')); });
    if (at.every(id => id === 'screen-game')) break;
    for (const [k, p] of t.pages.entries()) {
      if (at[k] === 'screen-game') continue;
      /* THE WAIT VEIL IS A TURN BOUNDARY, not a stuck screen. After the
         colours winner suits up, cwAdvance veils them while the loser picks;
         a JS click() goes straight through that veil (a thumb cannot), and
         mashing Suit up under it re-sent `cw` and REBUILT the loser's screen
         mid-pick. That was the whole colours stall. */
      const veiled = await p.evaluate(() => {
        const v = document.getElementById('netveil');
        return !!(v && v.classList.contains('on'));
      });
      if (veiled) continue;
      /* THE TOSS-UP IS THE DOOR INTO THE GAME and it is not a mbtn: both
         sides say ready, a question comes up, somebody slaps a buzzer and
         answers, and the winner picks. Each of those is its own control. */
      if (at[k] === 'screen-tossup') { await tossUp(p, k); continue; }
      /* the colours screen wants a swatch picked before its Lock appears */
      if (at[k] === 'screen-colors') {
        /* PICK, THEN LOCK, in that order. Lock is on screen from the start,
           so reaching for it first pressed a button that does nothing and the
           peer sat on the colours screen forever. And a swatch marked `taken`
           or `clash` belongs to the other squad's family and refuses the tap,
           so the pick has to skip those or it never lands. */
        await p.evaluate(() => {
          const sw = [...document.querySelectorAll('#screen-colors .cwc')]
            .filter(e => e.getBoundingClientRect().width > 0);
          if (sw.some(e => e.classList.contains('sel'))) {
            /* cwIdent() refuses an incomplete identity and cwDeny just shakes
               the box, so an empty name box is a silent dead end */
            const box = [...document.querySelectorAll('.cw-namebox input')]
              .filter(e => e.getBoundingClientRect().width > 0);
            const want = ['Showtime', 'SHO'];
            let filled = false;
            box.forEach((el, j) => {
              if (el.value.trim()) return;
              el.value = want[j] || ('X' + j);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              filled = true;
            });
            if (filled) return;
            const lock = document.getElementById('cwLock');
            if (lock) lock.click();
            return;
          }
          const free = sw.find(e => !e.classList.contains('taken') && !e.classList.contains('clash'));
          if (free) free.click();
        });
        await sleep(500);
        continue;
      }
      if (at[k] === 'screen-names') {
        const f = await p.locator('#screen-names input:visible').all();
        const nm = k ? ['The Bricks', 'BRK'] : ['Showtime', 'SHO'];
        for (const [j, el] of f.entries()) { await el.click(); await el.fill(nm[j] || ('X' + j)); }
        await p.evaluate(() => document.activeElement && document.activeElement.blur());
        await sleep(300);
      }
      const sel = FORWARD[at[k]];
      const hit = sel && await p.evaluate(s => { const e = document.querySelector(s);
        if (!e || getComputedStyle(e).display === 'none') return false;
        e.scrollIntoView({ block: 'center' }); e.click(); return true; }, sel);
      if (!hit) await p.evaluate(() => {
        const sc = document.querySelector('.screen.on');
        const card = sc.querySelector('.lr-card:not(.lock), .cv-card, [data-go]');
        if (card) { card.click(); return; }
        const m = [...sc.querySelectorAll('.mbtn:not(.ghost)')]
          .filter(e => getComputedStyle(e).display !== 'none');
        if (m.length) m[m.length - 1].click(); });
    }
    await sleep(700);
  }
  return road;
}

/* ---- run directly: report what the road actually does ------------------ */
if (import.meta.url === `file://${process.argv[1]}`) {
  const t = await twoPeer();
  console.log(`room ${t.code} · host role ${t.roles[0].role} · guest role ${t.roles[1].role}`);
  const road = await toGame(t);
  road.forEach((r, k) => console.log(`  peer ${k}: ${r.join(' -> ')}`));
  for (const [i, p] of t.pages.entries()) {
    const st = await p.evaluate(() => {
      if (!window.BK || !window.BK.coach || !window.BK.coach.state()) return null;
      const s = window.BK.coach.state();
      return { phase: s.phase, offense: s.offense, pieces: s.pieces.length,
        mb: window.BK._mb ? window.BK._mb() : 'not exposed' };
    });
    console.log(`  peer ${i}: ${await p.evaluate(screen)} · ${JSON.stringify(st)}`
      + ` · errors ${t.errs[i].length}` + (t.errs[i][0] ? ' · ' + t.errs[i][0].slice(0, 70) : ''));
  }
  if (!process.env.KEEP) await t.browser.close();
}

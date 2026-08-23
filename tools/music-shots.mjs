/* THE MUSIC BUTTON IN A LIVE GAME: a stop/play toggle, not a door.

   Aaron, 2026-08-22: "I want the in-game to just display a Stop and Play
   button for the music because players can't afford to spend time skipping
   and configuring music in-game anyway, as the clock will run down. But if
   they pause the game, they can click the music icon in the bottom right to
   open the boombox like normal."

   What already happens, checked before anything was drawn: during play the
   boombox is forced to `mini`, so at REST it is already the small round tab.
   What it does not do is stay that way. Tapping it runs
   `bb.classList.remove('mini')` and the whole player opens over the court
   with the clock running. So this is a change to what the TAP does, and to
   what the glyph says, not to the button's size or position.

   Variants injected in flight. Repo untouched, nothing shipped, a patch that
   fails to match is a hard error, and there is a render guard.

     node tools/music-shots.mjs

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';
import fs from 'fs';

const OUT = 'design/shots/music';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Stop is a square and play is a triangle, which is what he asked for. The
   ONE thing worth a second look: the HUD is about to carry a PAUSE glyph for
   the game, and two different "make it stop" symbols on one screen is a real
   question, so the pause-glyph version is built too rather than argued about. */
const GLYPH = {
  stop: '<svg viewBox="0 0 24 24"><rect x="6.6" y="6.6" width="10.8" height="10.8" rx="2.2" ' +
        'fill="currentColor" stroke="none"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8.4 5.6 18.6 12 8.4 18.4Z" ' +
        'fill="currentColor" stroke="none" stroke-linejoin="round"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><g fill="currentColor" stroke="none">' +
         '<rect x="7.4" y="6.2" width="3.4" height="11.6" rx="1.3"/>' +
         '<rect x="13.2" y="6.2" width="3.4" height="11.6" rx="1.3"/></g></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M9 17V5l10-2v12"/>' +
        '<circle cx="6.5" cy="17" r="2.6"/><circle cx="16.5" cy="15" r="2.6"/></svg>',
};

/* B keeps the note so the button still says MUSIC, and puts the state in a
   small badge. Costs a little clarity on the action, buys the category. */
const BADGE = g => '<span class="bb-badge">' + GLYPH[g] + '</span>';

const CSS = `
  /* the glyph swap only: same 52px circle, same corner, same ring */
  #boombox .bb-tab svg{width:24px;height:24px}
  #boombox .bb-tab svg[fill]{stroke:none}
  .bb-badge{position:absolute;right:-2px;bottom:-2px;width:22px;height:22px;
    border-radius:50%;display:grid;place-items:center;
    background:var(--accent);border:2px solid #0f0c0a}
  /* the badge glyph needs to beat "#boombox .bb-tab svg", which is id +
     class + element. A bare ".bb-badge svg" loses to it, so the badge drew
     its 11px glyph at 24px and the circle clipped it into a wedge. */
  #boombox .bb-tab .bb-badge svg{width:11px;height:11px;color:#1a1008;stroke:none}
  .bb-tab{position:relative;overflow:visible}`;

/* The live tap must NOT open the player. Modelled here by stripping the
   listener that removes `mini`, which is the exact line the real change would
   guard. Nothing else about the boombox is touched. */
const LOCK = `
  <script>window.addEventListener('load',function(){
    setTimeout(function(){
      var t=document.getElementById('bbTab');
      if(!t)return;
      var c=t.cloneNode(true);t.parentNode.replaceChild(c,t);
    },900);
  });<\/script>`;

const VARIANTS = [
  { key: 'now-rest', label: 'today, at rest during play' },
  { key: 'now-open', label: 'today, after one tap during play', open: true },
  { key: 'a-playing', label: 'A · stop square, music on', tab: GLYPH.stop, lock: true },
  { key: 'a-stopped', label: 'A · play triangle, music off', tab: GLYPH.play, lock: true },
  { key: 'b-playing', label: 'B · note plus a state badge, music on',
    tab: GLYPH.note + BADGE('stop'), lock: true },
  { key: 'b-stopped', label: 'B · note plus a state badge, music off',
    tab: GLYPH.note + BADGE('play'), lock: true },
  { key: 'c-playing', label: 'C · pause bars instead of a stop square, music on',
    tab: GLYPH.pause, lock: true },
  { key: 'paused-open', label: 'paused, the boombox opens as normal',
    open: true, paused: true },
];

const TAB_RE = /<button class="bb-tab" id="bbTab"[\s\S]*?<\/button>/;

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
    if (v.tab || v.lock) {
      await ctx.route('**/play/', async route => {
        const res = await route.fetch();
        let html = await res.text();
        if (!TAB_RE.test(html)) throw new Error('bb-tab anchor missing: ' + v.key);
        if (v.tab) {
          html = html.replace(TAB_RE,
            '<button class="bb-tab" id="bbTab" aria-label="Music on or off">' +
            v.tab + '</button>');
        }
        html = html.replace('</head>', '<style>' + CSS + '</style></head>');
        if (v.lock) html = html.replace('</body>', LOCK + '</body>');
        await route.fulfill({ response: res, body: html,
          headers: { ...res.headers(), 'content-type': 'text/html' } });
      });
    }
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 130)));
    await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
    await p.reload({ waitUntil: 'networkidle' });
    await sleep(1200);
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
      S.score[0] = 7; S.score[1] = 4;
      S.offense = 0; S.phase = 'off-select'; S.inbPending = null;
      S.selected = S.ball.holder; S.staged = null;
      B._offer();
      document.body.classList.add('reduce-motion');
    });
    /* .playing brightens the tab's ring, so it must match the state the frame
       is claiming. Forcing it on every frame made a "music off" variant show
       a lit ring, which is the opposite of the thing being judged. */
    await p.evaluate(on => {
      document.getElementById('boombox').classList.toggle('playing', on);
    }, !/stopped/.test(v.key));
    await sleep(600);
    /* #btnPause is display:none on a phone and #btnPauseT lives in a rail
       that has to be opened first, so the pause is invoked rather than
       clicked. It is the same handler either way. */
    if (v.paused) {
      await p.evaluate(() => document.getElementById('btnPause').click());
      await sleep(800);
    }
    if (v.open) { await p.evaluate(() => document.getElementById('bbTab').click()); await sleep(700); }

    const ok = await p.evaluate(() => {
      const c = document.getElementById('court'), bb = document.getElementById('boombox');
      return !!c && c.getBoundingClientRect().height > 100 && !!bb;
    });
    if (!ok) { console.error('DID NOT RENDER: ' + v.key + ' ' + view.k); process.exit(1); }

    const geo = await p.evaluate(() => {
      const bb = document.getElementById('boombox');
      const tab = document.getElementById('bbTab');
      const bx = e => { if (!e) return null; const r = e.getBoundingClientRect();
        return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
      return { mini: bb.classList.contains('mini'), tab: bx(tab), box: bx(bb),
        paused: document.getElementById('pauseveil').classList.contains('on'),
        covers: (() => { const r = bb.getBoundingClientRect();
          const c = document.getElementById('court').getBoundingClientRect();
          return !(r.right < c.left || r.left > c.right || r.bottom < c.top || r.top > c.bottom); })() };
    });
    console.log(`  ${view.k.padEnd(6)} ${v.key.padEnd(12)} mini=${String(geo.mini).padEnd(5)}` +
      ` paused=${String(geo.paused).padEnd(5)} box ${JSON.stringify(geo.box)}` +
      ` overCourt=${geo.covers}` + (errs.length ? '  ERR ' + errs[0] : ''));

    await p.screenshot({ path: `${OUT}/${view.k}-${v.key}.png` });
    await ctx.close();
  }
}
await b.close();

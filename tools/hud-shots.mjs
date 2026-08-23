/* HUD OPTION BOARD: pause as a symbol or as the word, replay beside it.

   Aaron, 2026-08-22, opening the gameplay redesign: "Lets make the pause
   button the pause symbol for the word pause (lets see both. and then put the
   replay last move button next to it up there and make it the reply icon that
   circle arrow thing... Also the replay last move can grey out when not able
   to be used and turn orange or highlighted when available."

   So: two layouts, two replay states each, plus the shipped HUD as the before.
   Nothing here is shipped. The variants are injected by rewriting index.html
   in flight, so what is photographed is the real scoreboard art with the real
   overlays on top, and the repo is untouched.

   A PATCH THAT DOES NOT MATCH IS A HARD ERROR. Silently shooting the shipped
   HUD five times and captioning them as five options is the exact failure
   this project has already had once.

     node tools/hud-shots.mjs            all five, phone and desktop

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';
import fs from 'fs';

const OUT = 'design/shots/hud';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- the two icons, drawn for this and rendered before they were chosen ---
   The replay glyph was picked by looking at four candidates at 19px, which is
   the size it actually ships at: one of my four was broken trigonometry that
   drew a chevron instead of an arc, and one pointed CLOCKWISE, which is the
   redo symbol and means the opposite thing. Pause is filled rather than
   stroked because two 2.1px strokes read as hairlines at 19px. */
const SPRITE = `
  <symbol id="i-pause" viewBox="0 0 24 24"><g fill="currentColor" stroke="none">
    <rect x="7.4" y="5.6" width="3.6" height="12.8" rx="1.4"/>
    <rect x="13" y="5.6" width="3.6" height="12.8" rx="1.4"/></g></symbol>
  <symbol id="i-replay" viewBox="0 0 24 24">
    <path d="M4 12a8 8 0 1 0 2.34-5.66"/><path d="M3.8 4.4v4.3h4.3"/></symbol>`;

/* available and unavailable, as Aaron described them. The ON state copies the
   values of the shipped `.dbtn.live` rule rather than inventing a second
   orange, so the two move together the day that one is retuned:
     color #ffb03a · border rgba(255,176,58,.7) · glow 0 0 8px rgba(...,.35) */
const CSS = `
  #sbDock{gap:5px;justify-content:flex-start;padding-left:2px}
  /* THE PHONE RULE HAS TO BE BEATEN ON ITS OWN TERMS. The shipped sheet says
     "@media (max-width:699.9px){#sbDock .dbtn:not(#hudMore){display:none}}",
     which is id + class + pseudo-class, so a plain "#sbDock .dbtn" loses and
     the first phone run photographed an empty dock six times. Same selector,
     same media query, later in the cascade. */
  @media (max-width:699.9px){
    #sbDock .dbtn:not(#hudMore){display:flex}
  }
  /* THE DOCK FILLS ITS ICONS. ".dbtn .ic{fill:currentColor}" overrides the
     base ".ic{fill:none;stroke:currentColor}", which is right for the solid
     glyphs already in the sprite and turned the stroked replay arrow into an
     orange blob on the first render. Pause is unaffected because its fill is
     inline on the group. Stroke restored for this dock only. */
  #sbDock .ic{fill:none;stroke:currentColor;stroke-width:2.1;
    stroke-linecap:round;stroke-linejoin:round}
  #sbDock #btnPause .ic{fill:currentColor;stroke:none}
  .dbtn.rep-on{color:#ffb03a;border-color:rgba(255,176,58,.7);
    box-shadow:0 0 8px rgba(255,176,58,.35),inset 0 1px 0 rgba(255,255,255,.06)}
  /* UNAVAILABLE: dimmer ink, no border light, no glow. Not opacity on the
     whole button, which would fade the panel it sits on as well and make the
     HUD look damaged rather than the control look spent. */
  .dbtn.rep-off{color:#6b5a44;border-color:rgba(255,176,58,.10);
    background:rgba(10,7,4,.45);box-shadow:none;cursor:default}
  .dbtn-word{width:auto;padding:0 9px;font-family:var(--mono);font-weight:700;
    font-size:clamp(9px,1.35cqw,11px);letter-spacing:.1em}`;

/* game.js wires every dock button by id at init and throws on a missing one,
   which killed window.BK and took the whole page with it the first time this
   ran. The buttons a variant does not show are kept in the DOM and hidden, so
   the REAL wiring still runs and only the layout is under test. */
const KEEP = ['hudMore', 'btnMusicG', 'btnHelp', 'btnCoachG']
  .map(id => '<button class="dbtn" id="' + id + '" style="display:none"></button>').join('');

/* the two layouts. `slots` is what goes inside #sbDock, in order. */
const PAUSE_ICON = '<button class="dbtn" id="btnPause" aria-label="Pause">' +
  '<svg class="ic"><use href="#i-pause"/></svg></button>';
const PAUSE_WORD = '<button class="dbtn dbtn-word" id="btnPause">PAUSE</button>';
const REPLAY = s => '<button class="dbtn rep-' + s + '" id="btnReplay" ' +
  'aria-label="Replay last move"' + (s === 'off' ? ' disabled' : '') +
  '><svg class="ic"><use href="#i-replay"/></svg></button>';
/* the third slot only exists in the icon layout, and that is the finding:
   99px of dock holds three 30px buttons with 1px to spare, or the word and
   the replay and nothing else. */
const MORE = '<button class="dbtn" id="hudMoreV" aria-label="More">' +
  '<svg class="ic" style="stroke-width:2.6"><use href="#i-tap"/></svg></button>';

const VARIANTS = [
  { key: 'now', label: 'shipped', patch: null },
  { key: 'icon-on', label: 'A · symbol, replay available',
    slots: PAUSE_ICON + REPLAY('on') },
  { key: 'icon-off', label: 'A · symbol, replay spent',
    slots: PAUSE_ICON + REPLAY('off') },
  { key: 'word-on', label: 'B · the word, replay available',
    slots: PAUSE_WORD + REPLAY('on') },
  { key: 'word-off', label: 'B · the word, replay spent',
    slots: PAUSE_WORD + REPLAY('off') },
  { key: 'icon3-on', label: 'A+ · symbol, replay, and the third slot',
    slots: PAUSE_ICON + REPLAY('on') + MORE },
];

const DOCK_RE = /<div id="sbDock">[\s\S]*?<\/div>/;
const SPRITE_ANCHOR = '<symbol id="i-ball"';

const b = await pw.chromium.launch({
  executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'],
});

for (const view of [{ k: 'phone', w: 390, h: 844, m: true },
                    { k: 'desk', w: 1280, h: 860 }]) {
  for (const v of VARIANTS) {
    const ctx = await b.newContext({
      viewport: { width: view.w, height: view.h }, deviceScaleFactor: 3,
      hasTouch: !!view.m, isMobile: !!view.m,
    });
    if (v.patch !== null && v.slots) {
      await ctx.route('**/play/', async route => {
        const res = await route.fetch();
        let html = await res.text();
        if (!DOCK_RE.test(html)) throw new Error('sbDock anchor missing: ' + v.key);
        if (!html.includes(SPRITE_ANCHOR)) throw new Error('sprite anchor missing');
        html = html.replace(DOCK_RE, '<div id="sbDock">' + v.slots + KEEP + '</div>');
        html = html.replace(SPRITE_ANCHOR, SPRITE + '<symbol id="i-ball"');
        html = html.replace('</head>', '<style>' + CSS + '</style></head>');
        await route.fulfill({ response: res, body: html,
          headers: { ...res.headers(), 'content-type': 'text/html' } });
      });
    }
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
    p.on('requestfailed', r => errs.push('404? ' + r.url().split('/').pop()));
    await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
    if (errs.length) console.error('   early errors on ' + v.key + ': ' + errs.join(' | '));
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
    await sleep(1500);
    await p.evaluate(() => document.body.classList.add('reduce-motion'));
    await sleep(200);

    /* RENDER GUARD, and it is not optional. A dead server still fulfils the
       patched HTML, so the page "loads" while every script 404s and the HUD
       never paints. That failure once produced five identical empty frames
       that all looked like a successful run. */
    const ok = await p.evaluate(() => {
      const h = document.getElementById('hud');
      const a = document.querySelector('#hud img.sbart');
      return !!h && h.getBoundingClientRect().height > 30 && !!a && a.naturalWidth > 0;
    });
    if (!ok) { console.error('HUD DID NOT RENDER: ' + v.key + ' ' + view.k); process.exit(1); }

    const geo = await p.evaluate(() => {
      const d = document.getElementById('sbDock');
      const bx = e => { if (!e) return null; const r = e.getBoundingClientRect();
        return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
      const kids = [...d.children].filter(e => e.offsetParent !== null || e.getBoundingClientRect().width)
        .map(e => ({ id: e.id, box: bx(e) }));
      const used = kids.length ? Math.max(...kids.map(k => k.box[0] + k.box[2])) - d.getBoundingClientRect().x : 0;
      return { dock: bx(d), kids, used: Math.round(used) };
    });
    console.log(`  ${view.k.padEnd(6)} ${v.key.padEnd(10)} dock ${JSON.stringify(geo.dock)}` +
      `  used ${geo.used}px  ${geo.kids.map(k => k.id + ':' + k.box[2]).join(' ')}` +
      (errs.length ? '  ERR ' + errs[0] : ''));

    const hud = await p.$('#hud');
    await hud.screenshot({ path: `${OUT}/${view.k}-${v.key}.png` });
    await ctx.close();
  }
}
await b.close();

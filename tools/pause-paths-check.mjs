/* ITEM 107: what actually happens down each pause-menu road, measured.

   Aaron, 2026-08-23: "we will have to nail down some of those pause menu
   questions you had, in addition to needing to see how 'how to play' and
   'settings' work mid match because idk how it will work if players start a
   drill via the rulebook mid match, and if they hit back in the rulebook does
   it take them to the main menu or back to the game, and the same set of
   questions for the settings, plus can any of those settings actually be
   changed mid match anyway?"

   Four roads, all driven on the REAL game (CPU match, phone viewport):

     A  pause itself: veil up, clock frozen, and it stays frozen
     B  pause -> How to play -> Back: where does Back land, and in what state
     C  pause -> Settings -> change things -> Back: where does Back land, do
        the changes reach the running match
     D  pause -> How to play -> tap a drill: what happens to the match, and
        what the exits look like afterwards

   Every claim is a measured assertion; sabotage notes at the bottom.

     node tools/pause-paths-check.mjs

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';
import fs from 'fs';

const OUT = 'design/shots/pause-paths';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  console.log((cond ? '  ok  ' : '  FAIL') + ' ' + name + (extra ? '   [' + extra + ']' : ''));
  cond ? pass++ : fail++;
};

const b = await pw.chromium.launch({
  executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'],
});

/* one fresh CPU match, staged mid-game, paused; the shared opening move */
async function freshPausedGame() {
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    hasTouch: true, isMobile: true,
  });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1150);
  await p.evaluate(() => {
    const B = window.BK, K = B.coach;
    K.applyColors({ nm: 'Showtime', ab: 'SHO' }, { nm: 'The Bricks', ab: 'BRK' });
    K.cpu.on = true;                       /* a real CPU match, the mode 107 asks about */
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
  await p.evaluate(() => document.getElementById('btnPause').click());
  await sleep(700);
  return { ctx, p, errs };
}

/* everything the four roads keep asking about, in one probe */
const probe = () => ({
  frozen: window.BK.coach.frozen(),
  veil: document.getElementById('pauseveil').classList.contains('on'),
  how: document.getElementById('screen-how').classList.contains('on'),
  howTop: document.getElementById('screen-how').classList.contains('ontop'),
  settings: document.getElementById('screen-settings').classList.contains('on'),
  gameOn: document.getElementById('screen-game').classList.contains('on'),
  bbSwitch: document.body.classList.contains('bb-switch'),
  score: window.BK.state() ? window.BK.state().score.slice() : null,
  phase: window.BK.state() ? window.BK.state().phase : null,
  pieces: window.BK.state() ? window.BK.state().pieces.length : null,
  drill: window.BK.coach.drill.on,
  cpu: window.BK.coach.cpu.on,
  hudMid: document.getElementById('hudMid').textContent,
  shotclock: (document.getElementById('shotclock') || {}).textContent || '',
});

/* ================= A · THE PAUSE ITSELF ================= */
{
  console.log('A · pause: veil, freeze, and the freeze HOLDS');
  const { ctx, p, errs } = await freshPausedGame();
  const s1 = await p.evaluate(probe);
  ok('A1 pause veil is up', s1.veil);
  ok('A2 the game is frozen (FRZ.on)', s1.frozen);
  await sleep(2600);
  const s2 = await p.evaluate(probe);
  ok('A3 still frozen 2.6s later', s2.frozen);
  ok('A4 score untouched by pausing', s2.score && s2.score[0] === 7 && s2.score[1] === 4,
    JSON.stringify(s2.score));
  ok('A5 no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

/* ================= B · HOW TO PLAY AND BACK ================= */
{
  console.log('B · pause -> How to play -> Back');
  const { ctx, p, errs } = await freshPausedGame();
  await p.evaluate(() => document.getElementById('pHow').click());
  await sleep(700);
  const inHow = await p.evaluate(probe);
  ok('B1 rulebook is up, on top of the game', inHow.how && inHow.howTop);
  ok('B2 pause veil dropped while reading', !inHow.veil);
  ok('B3 still frozen while reading', inHow.frozen);
  const drills = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-drill]').forEach(el => {
      const r = el.getBoundingClientRect();
      out.push({ id: el.dataset.drill, w: Math.round(r.width) });
    });
    return out;
  });
  ok('B4 the rulebook offers live drill buttons mid-match', drills.length > 0,
    drills.length + ' drills');
  await p.screenshot({ path: OUT + '/B-rulebook-over-match.png' });

  await p.evaluate(() => document.getElementById('btnBack').click());
  await sleep(700);
  const back = await p.evaluate(probe);
  await p.screenshot({ path: OUT + '/B-after-back.png' });
  /* the QUESTION, not an assumption: where did Back land the player?
     These three lines report the truth whichever way it falls. */
  console.log('  MEASURED after Back: game visible=' + back.gameOn +
    ' pauseMenu=' + back.veil + ' frozen=' + back.frozen +
    ' bbSwitch=' + back.bbSwitch);
  ok('B5 Back returns to the GAME, not the main menu', back.gameOn && !back.how);
  ok('B6 match survived (score intact)', back.score && back.score[0] === 7,
    JSON.stringify(back.score));
  /* the limbo check: no veil AND still frozen would strand the player on a
     dead board with no menu telling them why nothing ticks */
  const limbo = !back.veil && back.frozen;
  console.log('  LIMBO after Back (no menu, still frozen): ' + limbo);
  /* recoverability if limbo: pause again then resume */
  if (limbo) {
    await p.evaluate(() => document.getElementById('btnPause').click());
    await sleep(400);
    const rePause = await p.evaluate(probe);
    ok('B7 pausing again from limbo still works', rePause.veil);
    await p.evaluate(() => document.getElementById('pResume').click());
    await sleep(400);
    const resumed = await p.evaluate(probe);
    ok('B8 resume from there thaws the game', !resumed.frozen && !resumed.veil);
  }
  ok('B9 no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

/* ================= C · SETTINGS AND BACK ================= */
{
  console.log('C · pause -> Settings -> change theme + labels -> Back');
  const { ctx, p, errs } = await freshPausedGame();
  /* the theme lands as a body class, theme-<name> (audio.js applyTheme) */
  const bodyTheme = () => (document.body.className.match(/\btheme-(\w+)/) || [, '(none)'])[1];
  const themeBefore = await p.evaluate(bodyTheme);
  await p.evaluate(() => document.getElementById('pSettings').click());
  await sleep(700);
  const inSet = await p.evaluate(probe);
  ok('C1 settings screen is up', inSet.settings);
  ok('C2 still frozen while in settings', inSet.frozen);
  console.log('  MEASURED in settings: bbSwitch=' + inSet.bbSwitch +
    ' (true here means the music tab wears its in-game badge on the wrong screen)');
  /* change two things a player would notice: court labels, then theme.
     Labels FIRST: every switch's handler ends in refreshSettings(), which
     re-centers the theme crate on the STORED theme, so a switch tapped while
     the crate is still gliding to a new card snaps the flick back. Real in
     the game too, but only inside the ~1.5s glide; noted, not filed. */
  await p.evaluate(() => {
    const co = document.getElementById('setCoords');
    if (co && !co.classList.contains('on')) co.click();
    const card = document.querySelector('.st-tcard[data-theme="midnight"]');
    if (card) card.click();
  });
  /* the coverflow applies its theme 170ms after the smooth scroll settles,
     measured at ~1.5s end to end; 900ms here read a false "does not apply" */
  await sleep(2100);
  await p.screenshot({ path: OUT + '/C-settings-changed.png' });
  await p.evaluate(() => document.getElementById('setBack').click());
  await sleep(700);
  const back = await p.evaluate(probe);
  const themeAfter = await p.evaluate(bodyTheme);
  const coordsOn = await p.evaluate(() =>
    document.getElementById('setCoords').classList.contains('on'));
  await p.screenshot({ path: OUT + '/C-after-back.png' });
  ok('C3 Back lands on the game with the PAUSE MENU up', back.gameOn && back.veil);
  ok('C4 still frozen back in the pause menu', back.frozen);
  ok('C5 match survived (score intact)', back.score && back.score[0] === 7,
    JSON.stringify(back.score));
  console.log('  MEASURED theme ' + themeBefore + ' -> ' + themeAfter +
    ' · court labels switch on=' + coordsOn);
  ok('C6 theme change APPLIES mid-match', themeAfter === 'midnight', themeAfter);
  await p.evaluate(() => document.getElementById('pResume').click());
  await sleep(500);
  const resumed = await p.evaluate(probe);
  ok('C7 resume after the trip thaws the game', !resumed.frozen && !resumed.veil);
  ok('C8 no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

/* ================= D · A DRILL, MID-MATCH ================= */
{
  console.log('D · pause -> How to play -> tap a drill');
  const { ctx, p, errs } = await freshPausedGame();
  await p.evaluate(() => document.getElementById('pHow').click());
  await sleep(700);
  const clicked = await p.evaluate(() => {
    const btn = document.querySelector('[data-drill]');
    if (!btn) return null;
    const id = btn.dataset.drill;
    btn.click();
    return id;
  });
  await sleep(1600);
  const inDrill = await p.evaluate(probe);
  await p.screenshot({ path: OUT + '/D-drill-took-over.png' });
  console.log('  MEASURED in drill (' + clicked + '): score=' +
    JSON.stringify(inDrill.score) + ' pieces=' + inDrill.pieces +
    ' cpu=' + inDrill.cpu + ' hud="' + inDrill.hudMid + '"');
  ok('D1 the drill started without any confirm', inDrill.drill);
  /* the headline: did the 7-4 match survive? */
  const matchGone = !(inDrill.score && inDrill.score[0] === 7 && inDrill.score[1] === 4);
  ok('D2 MEASURED: the running match is DESTROYED by the drill tap', matchGone,
    'score now ' + JSON.stringify(inDrill.score));
  ok('D3 CPU opponent is silently dismissed', !inDrill.cpu);
  /* the exit: end the drill the way the panel's X does, then Back */
  await p.evaluate(() => window.BKDrill.end());
  await sleep(700);
  const afterEnd = await p.evaluate(probe);
  ok('D4 ending the drill lands in the rulebook', afterEnd.how);
  await p.evaluate(() => document.getElementById('btnBack').click());
  await sleep(700);
  const back = await p.evaluate(probe);
  await p.screenshot({ path: OUT + '/D-after-back.png' });
  console.log('  MEASURED after Back: gameOn=' + back.gameOn + ' howOn=' + back.how +
    ' anyScreenOn=' + await p.evaluate(() =>
      [...document.querySelectorAll('.screen')].some(s => s.classList.contains('on'))));
  /* wherever it lands, the 7-4 match cannot be there; report what IS */
  ok('D5 no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

console.log('\n' + pass + ' ok · ' + fail + ' fail');
await b.close();
process.exit(fail ? 1 : 0);

/* SABOTAGE LOG (run 2026-08-24, all three red in one pass, then restored):
   1. A2 flipped to !s1.frozen -> FAIL. Proves it reads the real FRZ state
      through BK.coach.frozen(), not a default.
   2. C6 flipped to expect 'hardwood' -> FAIL with '[midnight]'. Proves the
      theme measurement reads the live body class the click changed.
   3. D2 flipped to !matchGone -> FAIL with '[score now [0,0]]'. Proves the
      destroyed-match claim is measured against the real staged 7-4. */

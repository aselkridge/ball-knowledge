/* THE PAUSE-MENU ROADS, measured and now GATED.

   Born as item 107's investigation (Aaron, 08-23: how do "how to play" and
   "settings" work mid match, what happens if a drill starts from the
   rulebook, where does Back go, can settings change mid match). The
   investigation found two defects, 108 and 109; both are fixed and this
   harness now holds the fixed behaviour:

     A  pause itself: veil up, clock frozen, and it stays frozen
     B  pause -> How to play -> Back RETURNS TO THE PAUSE MENU (the 108 fix;
        it used to strand a frozen board with no menu)
     C  pause -> Settings -> change things -> Back: returns to the pause
        menu, the changes reach the running match
     D  mid-match the rulebook is a reference: NO drill launchers offered
        (the 109 fix; one tap used to destroy the running match)
     E  from the main menu the drills still work, and their exit always
        lands on a screen (the black-screen half of 109)

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
  const drills = await p.evaluate(() =>
    document.querySelectorAll('[data-drill]').length);
  ok('B4 the drill buttons exist in the book (D proves they are withheld here)',
    drills > 0, drills + ' drills');
  await p.screenshot({ path: OUT + '/B-rulebook-over-match.png' });

  await p.evaluate(() => document.getElementById('btnBack').click());
  await sleep(700);
  const back = await p.evaluate(probe);
  await p.screenshot({ path: OUT + '/B-after-back.png' });
  /* THE 108 FIX, gated: Back returns to the TIMEOUT it came from, the same
     landing the Settings road always had. Before the fix this road stranded
     the player on a frozen board with no menu (measured 08-24, filed 108). */
  ok('B5 Back lands on the game with the PAUSE MENU up', back.gameOn && back.veil && !back.how);
  ok('B6 match survived (score intact)', back.score && back.score[0] === 7,
    JSON.stringify(back.score));
  ok('B7 still properly frozen, a timeout is a timeout', back.frozen);
  await p.evaluate(() => document.getElementById('pResume').click());
  await sleep(400);
  const resumed = await p.evaluate(probe);
  ok('B8 resume from that menu thaws the game', !resumed.frozen && !resumed.veil);
  ok('B8b and the music tab is a switch again (badge repainted)', resumed.bbSwitch);
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

/* ================= D · DRILLS, MID-MATCH AND FROM THE MENU =================
   THE 109 FIX, gated. Mid-match the rulebook is a reference: its drill
   launchers are not offered at all (they are leaving the rulebook for the
   gym anyway, Aaron 08-24, so the tap that destroyed a running match earns
   removal here, not a confirm dialog). From the main menu the drills work
   exactly as before. */
{
  console.log('D · mid-match the rulebook offers no drills; from the menu it still does');
  const { ctx, p, errs } = await freshPausedGame();
  await p.evaluate(() => document.getElementById('pHow').click());
  await sleep(700);
  /* the topics are an accordion and sit collapsed, where EVERY drill button
     measures 0 wide whether or not the mid-run CSS works. Opening a topic
     first is what makes "0 visible" a claim about the fix and not about the
     fold: without it this check stayed green with the CSS deleted. */
  await p.evaluate(() => document.querySelector('.rb-head').click());
  await sleep(600);
  const mid = await p.evaluate(() => {
    const all = [...document.querySelectorAll('[data-drill]')];
    const note = document.querySelector('.rb-note-drills');
    return {
      total: all.length,
      visible: all.filter(b => b.getBoundingClientRect().width > 0).length,
      openTopic: !!document.querySelector('.rb-topic.open'),
      noteShown: !!note && note.getBoundingClientRect().width > 0,
      midRun: document.getElementById('screen-how').classList.contains('mid-run'),
    };
  });
  ok('D0 a topic is folded open for the measurement', mid.openTopic);
  ok('D1 the rulebook is stamped mid-run', mid.midRun);
  ok('D2 every drill button is withheld (' + mid.total + ' in the book)',
    mid.total > 0 && mid.visible === 0, mid.visible + ' visible');
  ok('D3 the header stops advertising drill buttons too', !mid.noteShown);
  await p.screenshot({ path: OUT + '/D-rulebook-mid-match.png' });
  /* the JS backstop behind the CSS: force one button visible and tap it;
     the guard must still refuse while mid-run is stamped */
  const forced = await p.evaluate(() => new Promise(res => {
    const btn = document.querySelector('[data-drill]');
    btn.style.setProperty('display', 'flex', 'important');
    btn.click();
    setTimeout(() => res({ drill: window.BK.coach.drill.on,
      score: window.BK.state().score.slice() }), 900);
  }));
  ok('D4 even a forced-visible button cannot boot a drill mid-match',
    !forced.drill && forced.score[0] === 7, JSON.stringify(forced));
  /* Back after all that: pause menu, match alive */
  await p.evaluate(() => document.getElementById('btnBack').click());
  await sleep(600);
  const back = await p.evaluate(probe);
  ok('D5 Back still lands on the pause menu with the match alive',
    back.gameOn && back.veil && back.score[0] === 7);
  ok('D6 no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

/* the MENU road: drills must still work, and their exit must land somewhere */
{
  console.log('E · the menu road keeps its drills, and the exit shows a screen');
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
  await p.evaluate(() => window.BK._show('how'));
  await sleep(600);
  /* same accordion truth as D: open a topic before counting */
  await p.evaluate(() => document.querySelector('.rb-head').click());
  await sleep(600);
  const menuRoad = await p.evaluate(() => {
    const open = document.querySelector('.rb-topic.open');
    const all = open ? [...open.querySelectorAll('[data-drill]')] : [];
    return { visible: all.filter(x => x.getBoundingClientRect().width > 0).length,
      midRun: document.getElementById('screen-how').classList.contains('mid-run') };
  });
  ok('E1 from the menu the open topic offers its drills', menuRoad.visible > 0 && !menuRoad.midRun,
    menuRoad.visible + ' visible');
  await p.evaluate(() =>
    document.querySelector('.rb-topic.open [data-drill]').click());
  await sleep(1600);
  const inDrill = await p.evaluate(probe);
  ok('E2 the drill boots from the menu road', inDrill.drill);
  await p.evaluate(() => window.BKDrill.end());
  await sleep(700);
  const afterEnd = await p.evaluate(probe);
  ok('E3 ending it lands in the rulebook', afterEnd.how);
  await p.evaluate(() => document.getElementById('btnBack').click());
  await sleep(700);
  const someScreen = await p.evaluate(() =>
    [...document.querySelectorAll('.screen')].filter(s => s.classList.contains('on'))
      .map(s => s.id));
  await p.screenshot({ path: OUT + '/E-after-back.png' });
  ok('E4 Back from there shows a SCREEN, never the void', someScreen.length > 0,
    someScreen.join(','));
  ok('E5 no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}

console.log('\n' + pass + ' ok · ' + fail + ' fail');
await b.close();
process.exit(fail ? 1 : 0);

/* SABOTAGE LOG
   Investigation round (08-24, then restored): A2 flipped -> FAIL (reads the
   real FRZ state); C6 told to expect hardwood -> FAIL [midnight] (reads the
   live body class); D2 flipped -> FAIL (the destroyed-match claim was
   measured against the real staged 7-4).
   Fix round (08-24, after 108/109 shipped, then restored):
   1. pHow's mid-run stamp removed in game.js -> D1 through D5 all FAIL
      (buttons offered, forced tap boots the drill and kills the 7-4).
      Proves D reads the real stamp and the real guard, and that the CSS and
      the JS backstop are BOTH keyed to the same stamp.
   2. btnBack's landing block removed -> B5 and D5 FAIL (game on, no veil).
      Proves B5 gates the 108 fix itself, not the old landing.
   And the check that got convicted on the way in: counting visible drill
   buttons without opening a topic first stayed green with the CSS deleted,
   because the accordion folds every button to 0 wide anyway. D0/E1 now open
   a topic before counting. */

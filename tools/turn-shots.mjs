/* Turn-clarity comparison shots (V0 B17, Aaron's "Go build it" 08-18).
   Photographs the three moments the redesign touches, so the comparison
   artifact can put each next to what it replaced:
     1. names-dup  · both squads typed the same name, Go tapped
     2. action     · your turn, the ball carrier's options up
     3. waiting    · the machine's possession, what YOU see while you wait
   Run with `before` or `after`; same staging both times, only the shipped
   game changes between the shoots. Serve docs/ on :8899, run from repo root. */
import pw from 'playwright';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const label = process.argv[2];
if (!['before', 'after'].includes(label)) {
  console.error('usage: node tools/turn-shots.mjs before|after');
  process.exit(1);
}
const OUT = 'design/shots/turn';
fs.mkdirSync(OUT, { recursive: true });

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio'] });
for (const view of [{ k: 'desk', w: 1280, h: 860 }, { k: 'phone', w: 390, h: 844, m: true }]) {
  const ctx = await b.newContext({ viewport: { width: view.w, height: view.h },
    hasTouch: !!view.m, isMobile: !!view.m });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
  const shot = async tag => {
    await p.screenshot({ path: `${OUT}/${label}-${view.k}-${tag}.png` });
    console.log(`  shot ${label}-${view.k}-${tag}` + (errs.length ? '  ERRS ' + errs[0] : ''));
  };
  await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1200);

  /* 1 · the names screen refusing a duplicate, reached the way a player
     reaches it (menu card -> pass-n-play) so the header is the real one */
  await p.evaluate(() => {
    const card = document.querySelector('.mm-card[data-go="local"]');
    if (card) card.click(); else window.BK._show('names');
  });
  await sleep(1400);
  await p.evaluate(() => {
    const g = id => document.getElementById(id);
    g('nmA').value = 'Showtime'; g('nmAb').value = 'SHO';
    g('nmB').value = 'Showtime'; g('nmBb').value = 'SHO';
    g('nmGo').click();
  });
  await sleep(500);
  await shot('names-dup');

  /* 2 · your turn: main action moment, carrier selected, options offered.
     Boot, then let the start-of-game timers finish BEFORE staging (they
     clear the selection; the defense shoot learned this the hard way). */
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
  });
  await sleep(700);
  await shot('action');

  /* 3 · the machine's possession: what the waiting player sees. busy=true
     parks the CPU brain so the moment holds still for the camera. */
  await p.evaluate(() => {
    const B = window.BK, S = B.state();
    const C = B._cpu(); C.on = true; C.team = 1; C.level = 'pro'; C.busy = true;
    S.offense = 1; S.phase = 'off-select'; S.selected = null; S.staged = null;
    S.inbPending = null;
    document.getElementById('stagebox').classList.remove('on');
    document.getElementById('stagebox').innerHTML = '';
  });
  await sleep(900);
  await shot('waiting');

  /* two states that only exist after the rebuild: the free-moves dock and
     the handoff slam mid-air. Shot for the comparison's "new" panels. */
  if (label === 'after') {
    /* ball comes back to the human: YOUR TURN slam fires, then dies down,
       then the free-moves dock is the standing state worth photographing */
    await p.evaluate(() => {
      const B = window.BK, S = B.state();
      S.offense = 0; S.phase = 'off-select'; S.selected = null; S.staged = null;
      B._mb().setup = true; B._mb().moved = {};
      B._mbSetupStage();
    });
    await sleep(2000);   /* let the slam finish so the dock stands alone */
    await shot('setup-dock');
    await p.evaluate(() => {
      const B = window.BK, S = B.state();
      B._mb().setup = false;
      S.selected = null; S.staged = null;
      document.getElementById('stagebox').classList.remove('on');
      document.getElementById('stagebox').innerHTML = '';
      S.offense = 1;    /* flip: the slam fires over the lights coming down */
    });
    await sleep(450);
    await shot('slam');
  }

  await ctx.close();
}
await b.close();

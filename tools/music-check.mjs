/* THE MUSIC TAB IS A SWITCH ON THE CLOCK AND A DOOR WHEN PAUSED.

   Aaron, 2026-08-22: "I want the in-game to just display a Stop and Play
   button for the music because players can't afford to spend time skipping
   and configuring music in-game anyway, as the clock will run down. But if
   they pause the game, they can click the music icon in the bottom right to
   open the boombox like normal." And: "it should play from where it left off."

   Three things this asserts, because all three can break independently:
     1. WHAT THE TAP DOES. Live, it must not open the player. Paused, it must.
     2. WHAT THE BADGE SAYS. It exists only while the tap is a switch, and it
        shows the action, not the state: a square while music plays, because
        the tap stops it.
     3. THAT THE TRACK RESUMES. Not restarts. This is the one a reader would
        assume rather than check, and it is checked here off the real audio
        element's currentTime.

   AUDIO IS GATED ON A REAL GESTURE (audio.js: `if(!booted)return`), so every
   reading before a genuine click is a reading of nothing. The first version
   of this probe reported an empty element map and looked like a clean pass.

     node tools/music-check.mjs

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = [];
function ck(ok, name, detail) {
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '   [' + detail + ']' : ''));
  if (!ok) fails.push(name);
}

const b = await pw.chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--autoplay-policy=no-user-gesture-required'],
});

for (const view of [{ k: 'phone', w: 390, h: 844, m: true },
                    { k: 'desk', w: 1280, h: 860 }]) {
  console.log('\n=== ' + view.k + ' ' + view.w + 'x' + view.h + ' ===');
  const ctx = await b.newContext({
    viewport: { width: view.w, height: view.h },
    hasTouch: !!view.m, isMobile: !!view.m,
  });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
  await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1100);
  await p.mouse.click(Math.round(view.w / 2), Math.round(view.h * 0.82));  /* boot audio */
  await sleep(300);
  await p.evaluate(() => {
    const B = window.BK, K = B.coach;
    K.applyColors({ nm: 'Showtime', ab: 'SHO' }, { nm: 'The Bricks', ab: 'BRK' });
    K.startGame({ league: 'nba', decade: 'ANY', target: 11,
      rosters: K.pickRosters('nba', 'ANY') }, true);
    B._show('game');
  });
  await sleep(1800);

  const look = () => p.evaluate(() => {
    const bb = document.getElementById('boombox');
    const badge = document.getElementById('bbBadge');
    const els = (window.BKAudio && window.BKAudio._els) || {};
    /* PREFER THE ONE THAT IS ACTUALLY PLAYING. Picking the highest
       currentTime instead caught the parked MENU track, which sits at about a
       second from the title screen and outranked a game track that had only
       just started. The reading was of the wrong element and the check failed
       for a reason that had nothing to do with the game. */
    let track = null;
    for (const k in els) {
      const e = els[k];
      if (e.paused && e.currentTime === 0) continue;
      const cand = { k: k, t: e.currentTime, paused: e.paused };
      if (!track) { track = cand; continue; }
      if (track.paused && !cand.paused) { track = cand; continue; }
      if (track.paused === cand.paused && cand.t > track.t) track = cand;
    }
    return {
      live: window.BKBBLive ? window.BKBBLive() : null,
      switchClass: document.body.classList.contains('bb-switch'),
      mini: bb.classList.contains('mini'),
      playing: bb.classList.contains('playing'),
      musicOn: window.BKAudio.settings.music,
      badgeShown: !!badge && getComputedStyle(badge).display !== 'none',
      badgeGlyph: badge ? (badge.querySelector('rect') ? 'stop' :
                           badge.querySelector('path') ? 'play' : 'none') : 'no badge',
      paused: document.getElementById('pauseveil').classList.contains('on'),
      track,
    };
  });

  ck((await look()).live === true, 'a running game counts as live');
  let s = await look();
  ck(s.switchClass, 'the body carries bb-switch, so the badge is shown');
  ck(s.badgeShown, 'the badge is visible on the tab');
  ck(s.badgeGlyph === 'stop', 'and it shows a SQUARE while music plays, because the tap stops it',
     s.badgeGlyph);
  ck(s.mini, 'the tab is collapsed, as it already was');
  ck(!!s.track && !s.track.paused, 'a track is actually playing',
     s.track ? s.track.k + ' at ' + s.track.t.toFixed(2) + 's' : 'nothing playing');

  /* ---- 1. the live tap is a switch, not a door -------------------------- */
  await sleep(1400);
  const before = (await look()).track;
  await p.click('#bbTab'); await sleep(700);
  s = await look();
  ck(s.mini, 'THE LIVE TAP DOES NOT OPEN THE PLAYER');
  ck(!s.musicOn, 'it turns the music off', 'music=' + s.musicOn);
  ck(s.badgeGlyph === 'play', 'and the badge flips to a triangle', s.badgeGlyph);

  /* ---- 2. and it resumes, rather than restarting ------------------------ */
  const parked = (await look()).track;
  ck(!!parked && parked.paused, 'the track is paused, not stopped and rewound',
     parked ? parked.t.toFixed(2) + 's' : 'gone');
  await sleep(1200);
  const held = (await look()).track;
  ck(!!held && Math.abs(held.t - parked.t) < 0.15,
     'it holds its place while off', held ? held.t.toFixed(2) + 's' : 'gone');
  await p.click('#bbTab'); await sleep(900);
  s = await look();
  ck(s.musicOn, 'a second tap turns it back on');
  ck(s.mini, 'and still does not open the player');
  ck(!!s.track && s.track.t >= parked.t - 0.05,
     'IT PICKS UP FROM WHERE IT LEFT OFF, not from the top',
     s.track ? 'parked ' + parked.t.toFixed(2) + 's, resumed at ' + s.track.t.toFixed(2) + 's'
             : 'gone');
  ck(!!before && !!s.track && s.track.t > before.t, 'the clock on the track really moved');

  /* ---- 3. paused, the tab is a door again ------------------------------- */
  await p.evaluate(() => document.getElementById('btnPause').click());
  await sleep(800);
  s = await look();
  ck(s.paused, 'the pause menu is up');
  ck(s.live === false, 'and the game no longer counts as live');
  ck(!s.switchClass, 'bb-switch is dropped');
  ck(!s.badgeShown, 'so the badge is hidden, because the tap is a door again');
  await p.click('#bbTab'); await sleep(700);
  s = await look();
  ck(!s.mini, 'THE PAUSED TAP OPENS THE BOOMBOX, as it always did');

  /* ---- 4. and off the game screen nothing changed ----------------------- */
  await p.evaluate(() => { window.BK._show('title'); });
  await sleep(700);
  s = await look();
  ck(s.live === false, 'the menu is not a live game');
  ck(!s.badgeShown, 'no badge on a menu');

  ck(errs.length === 0, 'no page errors', errs[0]);
  await ctx.close();
}

await b.close();
console.log('\n' + (fails.length ? fails.length + ' FAILING' : 'ALL CHECKS PASS') + '\n');
process.exit(fails.length ? 1 : 0);

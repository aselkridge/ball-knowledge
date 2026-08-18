/* THE GROUND TRUTH for the floor analysis. Places the nine setup pairings on
   the REAL board and asks the game's own functions, never a copy, what every
   tile within the handler's reach offers: a free move, a duel against one man
   (head-on or diagonal), or a lane two men gate. Screens are OFF (the sixth
   argument), stated in every artifact this feeds: screens only ever open
   lanes, so these maps are the floor at its worst for the offense.

   Reads design/floor-scenarios.json (from floor-analysis.py --emit), writes
   design/floor-truth.json. The Python model must match this exactly on the
   real NBA board (15x8, set by applyMode when the league loads; the 13x7 at
   the top of game.js is only the pre-game default, which the first draft of
   this pair learned the hard way) before its bigger boards mean anything.
   :8899. */
import pw from 'playwright';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const scen = JSON.parse(fs.readFileSync('design/floor-scenarios.json', 'utf8'));

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio'] });
const p = await (await b.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
await p.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
await p.reload({ waitUntil: 'networkidle' });
await sleep(1200);

const out = await p.evaluate((scen) => {
  const B = window.BK, K = B.coach;
  K.applyColors({ nm: 'You', ab: 'YOU' }, { nm: 'Them', ab: 'THM' });
  K.startGame({ league: 'nba', decade: 'ANY', target: 11,
    rosters: K.pickRosters('nba', 'ANY') }, true);
  const S = B.state();
  B._cfg().spacing = 'locked';          // all eight directions guard, no pricing here
  const res = [];
  for (const sc of scen) {
    // map each placement onto the real piece with that team and position
    for (const pl of sc.pieces) {
      const i = S.pieces.findIndex(q => q.team === pl.team && q.pos === pl.pos);
      B._set(i, pl.c, pl.r);
    }
    const hi = S.pieces.findIndex(q => q.team === 0 && q.pos === 'PG');
    const h = S.pieces[hi];
    S.ball.holder = hi; S.offense = 0; S.front = null;
    const rng = h.range;
    const tiles = {};
    for (let r = 0; r < 8; r++) for (let c = 0; c < 15; c++) {
      const d = Math.max(Math.abs(c - h.c), Math.abs(r - h.r));
      if (d === 0 || d > rng) continue;
      if (S.pieces.some(q => q.c === c && q.r === r)) { tiles[c + ',' + r] = 'occupied'; continue; }
      const duel = B._driveChallenge(h.c, h.r, c, r, 0, true);   // screens OFF
      const gaters = B._driveChallenge.count;
      if (duel < 0) { tiles[c + ',' + r] = 'free'; continue; }
      const dp = S.pieces[duel];
      const diag = dp.c !== h.c && dp.r !== h.r;
      tiles[c + ',' + r] = gaters >= 2 ? 'closed' : (diag ? 'diag' : 'headon');
    }
    res.push({ name: sc.name, pieces: sc.pieces, range: rng,
      handler: [h.c, h.r], tiles });
  }
  return { scenarios: res, ranges: S.pieces.map(q => q.pos + ':' + q.range).slice(0, 5) };
}, scen);

fs.writeFileSync('design/floor-truth.json', JSON.stringify(out, null, 1));
console.log('wrote design/floor-truth.json ·', out.scenarios.length, 'scenarios ·',
  'ranges', out.ranges.join(' '), errs.length ? '· ERRS ' + errs[0] : '· zero page errors');
await b.close();

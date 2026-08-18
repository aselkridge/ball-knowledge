/* THE ONE DEFENSE, checked end to end (Aaron ruled it 08-18). Replaces
   spacing-check.mjs, which guarded the four house-rule settings this build
   retired; its one lasting complaint ("the discount is priced at the card,
   not here") is answered: pricing is asserted here, through the REAL commit
   path, and the card and the tile colour share one function so they cannot
   drift apart.

   What must hold, and stays red if it stops holding:
   1  a head-on crossover charges full price (SG base = Medium)
   2  the same duel forced from the corner charges one step less
   3  deep + corner compose (base +1 deep, -1 corner)
   4  a lane two defenders gate is refused, with the plain banner
   5  defenders guard all eight squares (the old open-floor square-only
      guarding is gone)
   6  the four-way spacing picker is really gone from the page
   7  the rulebook teaches the one defense and no longer sells the dead
      momentum tax ("Winning still costs a step" shipped for two days after
      the rule died)
   8  the CPU treats a two-man lane as a wall: with its best path closed it
      acts without ever TAPPING the wall. The tell is the refusal banner
      showing up during a machine turn: a human never sees the machine get
      told no. (First draft only asserted "it eventually acts", and the
      sabotage run proved that too weak: even guardless, the CPU escapes by
      passing or shooting a few seconds later. The banner is the honest
      signal.)
   Sabotage-proved: dropping the count>=2 guard in doMove turns 4 red;
   removing the CPU's closed-skip fires the refusal banner and turns 8 red.
   :8899. */
import pw from 'playwright';
import fs from 'fs';
const { chromium } = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BK_URL || 'http://127.0.0.1:8899/play/';
let pass = 0; const fails = [];
const ck = (m, x, n) => { (x ? pass++ : fails.push(m));
  console.log(`  ${x ? 'PASS' : 'FAIL'}  ${m}${n ? '   [' + n + ']' : ''}`); };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--mute-audio'] });
const errs = [];

async function freshGame() {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e).slice(0, 120)));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
  await p.reload({ waitUntil: 'networkidle' });
  await sleep(1100);
  await p.evaluate(() => {
    const B = window.BK, K = B.coach;
    K.applyColors({ nm: 'You', ab: 'YOU' }, { nm: 'Them', ab: 'THM' });
    K.startGame({ league: 'nba', decade: 'ANY', target: 11,
      rosters: K.pickRosters('nba', 'ANY') }, true);
    B._show('game');
  });
  await sleep(1200);
  return { ctx, p };
}

/* stage the handler + defenders, commit a move through the human door,
   report what the deal charged. Same probe shape that measured the toll. */
async function price(p, defenders, target) {
  return p.evaluate(({ defenders, target }) => {
    const B = window.BK, S = B.state();
    S.pieces.forEach((pc, i) => B._set(i, pc.team === 0 ? i : 14 - i, pc.team === 0 ? 0 : 7));
    const h = S.pieces.findIndex(pc => pc.team === 0);
    B._set(h, 7, 3); S.pieces[h].pos = 'SG';
    S.ball.holder = h; S.offense = 0; S.front = null;
    let di = 0;
    S.pieces.forEach((pc, i) => {
      if (pc.team !== 0 && di < defenders.length) { B._set(i, defenders[di][0], defenders[di][1]); di++; }
    });
    S.phase = 'off-move'; S.selected = h; S.staged = { kind: 'move', tile: target };
    B._commit();
    const deal = B._HEAT.deal || {};
    return { pending: B._pending(), tier: deal.tier,
      banner: (document.getElementById('bannerTxt') || {}).textContent || '' };
  }, { defenders, target });
}

{
  const { ctx, p } = await freshGame();
  const headOn = await price(p, [[8, 3]], [9, 3]);
  ck('a head-on crossover charges full price (SG = Medium)',
     headOn.pending === 'cross' && headOn.tier === 2,
     'pending=' + headOn.pending + ' card tier ' + headOn.tier);
  await ctx.close();
}
{
  const { ctx, p } = await freshGame();
  const corner = await price(p, [[8, 2]], [9, 3]);
  ck('the same duel forced from the corner charges one step less',
     corner.pending === 'cross' && corner.tier === 1,
     'card tier ' + corner.tier);
  await ctx.close();
}
{
  const { ctx, p } = await freshGame();
  const deep = await price(p, [[8, 2]], [10, 3]);
  ck('deep + corner compose: one step up, one step back',
     deep.pending === 'cross' && deep.tier === 2, 'card tier ' + deep.tier);
  await ctx.close();
}
{
  const { ctx, p } = await freshGame();
  const closed = await price(p, [[8, 3], [8, 2]], [9, 3]);
  ck('a lane two defenders gate is REFUSED, not duelled',
     closed.pending === null && /Two defenders/.test(closed.banner),
     'pending=' + closed.pending + ' · "' + closed.banner.trim().slice(0, 48) + '"');
  const g8 = await p.evaluate(() => window.BK._guards(8, 2, 7, 3));
  ck('defenders guard all eight squares (corner included)', g8 === true, String(g8));
  const dom = await p.evaluate(() => ({
    picker: !!document.getElementById('spModes'),
    label: (document.body.innerHTML.match(/kl-lbl">Spacing</) || []).length,
  }));
  ck('the four-way spacing picker is gone from the page',
     dom.picker === false && dom.label === 0, JSON.stringify(dom));
  await ctx.close();
}

/* the rulebook: reads the served page source, the same bytes players get */
{
  const html = fs.readFileSync('docs/play/index.html', 'utf8');
  ck('the rulebook teaches the one defense',
     /Every defender guards all eight squares/.test(html) &&
     /two defenders<\/b> stand on is closed/.test(html));
  ck('the four settings and the dead momentum tax are out of the rulebook',
     !/Spacing<\/b> has four settings/.test(html) &&
     !/Winning still costs a step/.test(html) && !/Pay the toll/.test(html));
  const js = fs.readFileSync('docs/play/game.js', 'utf8');
  ck('one price source: the card and the tile both read crossPrice()',
     /crossPrice\(sel,def,dist\)/.test(js) && /crossPrice\(sel,dci,/.test(js) &&
     !/rgba\(213,82,75,\.45\)/.test(js));
}

/* the CPU faces a walled best path and must still act */
{
  const { ctx, p } = await freshGame();
  const out = await p.evaluate(async () => {
    const B = window.BK, S = B.state();
    /* park everyone, then build the wall: handler's rim-ward neighbours are
       double-gated, the sideways outs stay open */
    /* handler parked OUT of shooting range on purpose: the first draft put
       him at (9,3) where a desperation heave exists, and the machine escaped
       the wall by jacking it, which made the sabotage flaky. At (7,3) there
       is no shot and no pass target within four squares, so the drive logic
       is the only road, every tick. */
    S.pieces.forEach((pc, i) => B._set(i, pc.team === 0 ? i : 14 - i, pc.team === 0 ? 0 : 7));
    const h = S.pieces.findIndex(pc => pc.team === 0);
    B._set(h, 7, 3);
    const defs = [[8, 3], [8, 2], [8, 4]];
    let di = 0;
    S.pieces.forEach((pc, i) => {
      if (pc.team !== 0 && di < defs.length) { B._set(i, defs[di][0], defs[di][1]); di++; }
    });
    S.ball.holder = h; S.offense = 0; S.front = null;
    S.phase = 'off-move'; S.selected = null; S.staged = null;
    /* record every banner the machine's turn produces: the refusal line
       appearing here means the CPU tapped the wall */
    const seen = [];
    const bt = document.getElementById('bannerTxt');
    const mo = new MutationObserver(() => seen.push(bt.textContent));
    mo.observe(bt, { childList: true, subtree: true, characterData: true });
    const cpu = B._cpu();
    cpu.on = true; cpu.team = 0;
    const t0 = Date.now();
    let acted = false, ph = '';
    while (Date.now() - t0 < 6000) {
      await new Promise(r => setTimeout(r, 200));
      ph = S.phase;
      if (ph !== 'off-move' && ph !== 'off-select') { acted = true; break; }
    }
    cpu.on = false; mo.disconnect();
    return { acted, ph, ms: Date.now() - t0,
      walled: seen.some(t => /Two defenders/.test(t)), banners: seen.slice(0, 4) };
  });
  ck('the CPU treats a two-man wall as a wall: acts, and never taps it',
     out.acted === true && out.walled === false,
     (out.acted ? out.ph + ' after ' + out.ms + 'ms' : 'STALLED') +
     (out.walled ? ' · TAPPED THE WALL: ' + out.banners.join(' | ') : ' · never told no'));
  await ctx.close();
}

ck('zero page errors', errs.length === 0, errs.join(' | ') || 'clean');
await b.close();
console.log(fails.length ? `\n${fails.length} FAILED:\n  ` + fails.join('\n  ')
  : `\nALL ${pass} PASS`);
process.exit(fails.length ? 1 : 0);

/* Real screenshots of the screens where the LABELLING COLOURS actually appear,
   for the palette artifact. Not mockups: these are the shipped surfaces, served
   from docs/ and driven to the state where two systems collide on one screen.

   The squad reveal is the one that matters most, because the pack-rarity chip
   and the player-tier badge are painted from two different tables that share
   three of their colours exactly. You cannot argue about that from a hex list;
   you can see it in one shot.

   Writes to design/shots/labels/. Serve docs/ on :8899 first. */
import pw from 'playwright';
import fs from 'fs';
const {chromium} = pw;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = 'design/shots/labels';
fs.mkdirSync(OUT, {recursive: true});

const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium',
  args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio']});

for (const [tag, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('  ! page error: ' + e.message));
  await p.goto('http://127.0.0.1:8899/play/', {waitUntil: 'networkidle'});
  await p.evaluate(() => {localStorage.setItem('bk_coach', '0');});
  await p.reload({waitUntil: 'networkidle'});
  await sleep(1200);

  /* THE SQUAD REVEAL, twice, because it holds two different collisions.
       orange + Legendary -> the gold pack chip above the gold Superstar badges
       blue   + Rare      -> team blue and rarity blue, the same hex three times
     Rerolling beats stubbing here: srRollRarity is a closure and is not
     reachable from out here. Legendary is 9 of 100 and Rare is 28, so a few
     hundred tries is plenty and each one is cheap. Bail LOUDLY rather than
     shooting a Common and captioning it Legendary. */
  const reveal = async (team, want, name) => {
    const r = await p.evaluate(([team, want]) => {
      if (!window.BK || !BK._srRoll) return 'no BK._srRoll';
      try {
        BK._show('squad');
        for (let i = 0; i < 600; i++) {
          BK._srRoll('nba', team);
          const lbl = document.querySelector('#srRarSlot .rl');
          if (lbl && new RegExp('^' + want).test(lbl.textContent)) {
            const head = document.getElementById('srTeamH');
            const span = head && head.querySelector('span');
            return {ok: 1,
                    head: span ? getComputedStyle(span).color : null,
                    chip: getComputedStyle(lbl).color};
          }
        }
        return 'never rolled ' + want + ' in 600 tries';
      } catch (e) { return 'threw: ' + e.message; }
    }, [team, want]);
    if (!r || !r.ok) { console.log(`  ${tag}-${name}: ${r}`); return; }
    /* The measurement is the point of the blue shot, so print it: if the two
       ever stop matching, this line is how the next session finds out. */
    console.log(`  ${tag}-${name}: header ${r.head} · chip ${r.chip}` +
                (r.head === r.chip ? '   SAME COLOUR' : ''));
    await sleep(1200);
    await p.evaluate(() => {   /* land the cards face-up, no waiting on the flip */
      document.querySelectorAll('.sr-card.down').forEach(c => c.classList.remove('down'));
    });
    await sleep(600);
    await p.screenshot({path: `${OUT}/${tag}-${name}.png`});
  };
  await reveal(0, 'Legendary', 'squad-legendary');
  await reveal(1, 'Rare', 'squad-rare-blue');

  /* The other surfaces where a whole system is on screen at once. `house` holds
     the knowledge-level ladder (all six brackets), `league` the seven league
     accents, `colors` the colourway grid. */
  for (const [scr, name] of [['house', 'levels'], ['league', 'leagues'],
                             ['colors', 'colourways'], ['rules', 'rulebook']]) {
    const r = await p.evaluate(s => {
      try { BK._show(s); return 'ok'; } catch (e) { return 'threw: ' + e.message; }
    }, scr);
    if (r !== 'ok') { console.log(`  ${tag}-${name}: ${r}`); continue; }
    await sleep(800);
    await p.screenshot({path: `${OUT}/${tag}-${name}.png`});
    console.log(`  ${tag}-${name}.png`);
  }

  await ctx.close();
}
await b.close();
console.log('done');

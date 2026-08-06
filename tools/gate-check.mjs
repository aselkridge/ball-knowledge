#!/usr/bin/env node
/* THE VERIFIED GATE, exercised in the real game rather than argued about.
 *
 * WHY THIS EXISTS. build-verified-index.py reports thin pools by league x tier.
 * It does NOT look at ERA, and the game filters by era too — so the report can
 * be all-clear while some (league, era, tier) combination has nothing good to
 * deal. Table arithmetic cannot settle that; only driving the real picker can.
 *
 * Written 2026-08-06, the day PACKGATE.verifiedOnly was flipped to true.
 *
 * THE FIRST VERSION OF THIS FILE WAS WRONG AND IS WORTH RECORDING.
 * game.js calls card 0 "the final fallback and the ONE crack in the gate", so
 * the first draft asserted that a returned index of 0 meant the picker had
 * fallen through. It reported 13 failures. All 13 were tier 1, which was the
 * tell. QUESTIONS[0] is `{t:1, l:"any", ...}` — league-neutral, era-untagged
 * and verified — so it is a perfectly legal random draw at tier 1 for every
 * league and every era. Getting it 1-2 times in 12 draws is the arithmetic
 * working, not breaking.
 * The lesson, kept because it will happen again: A SENTINEL THAT IS ALSO A
 * VALID VALUE IS NOT A SENTINEL. Test the property you actually care about —
 * here, "was the card the player got verified?" — never a magic index.
 *
 *   node tools/gate-check.mjs        (needs the local server on :8899)
 */
import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:8899/play/';
const TIERS = [0, 1, 2, 3, 4];
const LEAGUES = ['nba', 'wnba'];
const DECADES = ['1940s', '1950s', '1960s', '1970s', '1980s',
                 '1990s', '2000s', '2010s', '2020s'];
const DRAWS = 12;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox'] });
const page = await (await b.newContext()).newPage();
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto(URL, { waitUntil: 'networkidle' });

let pass = 0, fail = 0;
const bad = [], notes = [];

/* 1 · the gate must be ON by default, or nothing below means anything */
if (await page.evaluate(() => BK._gate.verifiedOnly)) pass++;
else { fail++; bad.push('PACKGATE.verifiedOnly is FALSE by default'); }

/* 2 · THE PROPERTY THAT MATTERS: across every league x era x tier a player can
   select, every single card dealt must be one a human has verified. */
let dealt = 0, eraDropped = 0;
for (const lg of LEAGUES) {
  for (const era of DECADES) {
    for (const t of TIERS) {
      const r = await page.evaluate(([lg, era, t, n]) => {
        window.state = window.state || {};
        state.league = lg; state.eras = [era];
        if (window.setupCfg) setupCfg.league = lg;
        let unver = 0, offEra = 0, drawn = 0;
        const seen = new Set();
        for (let i = 0; i < n; i++) {
          const q = QUESTIONS[BK._pickQuestionIdx(t)];
          drawn++; seen.add(q.q);
          if (!BK._gateOk(q)) unver++;
          /* an era-tagged card that does not match the selection means the
             picker had to drop the era filter — legal (documented fallback),
             but worth counting rather than hiding */
          if (q.e && q.e.length && q.e.indexOf(era) < 0) offEra++;
        }
        return { unver, offEra, drawn, distinct: seen.size };
      }, [lg, era, t, DRAWS]);
      dealt += r.drawn; eraDropped += r.offEra;
      const label = `${lg} ${era} t${t}`;
      if (r.unver > 0) { fail++; bad.push(`${label}: dealt ${r.unver} UNVERIFIED card(s)`); }
      else pass++;
      if (r.distinct <= 2) notes.push(`${label}: only ${r.distinct} distinct card(s) in ${DRAWS} draws`);
    }
  }
}

/* 3 · TWO-SIDED PROOF that the gate is doing work rather than sitting inert.
   Off, the picker must reach at least one unverified card; on, it must reach
   none. Same picker, same draws, only the flag changes. */
/* NOTE ON HOW UNVERIFIED-NESS IS TESTED HERE, learned the hard way: game.js's
   `UNVERIFIED` map is NOT reachable as window.UNVERIFIED, and an earlier draft
   that tried to sabotage it was silently mutating a variable the game never
   reads — it "passed" while proving nothing. The only honest oracle is the
   game's own BK._gateOk, which returns !UNVERIFIED[q.q] *while the gate is on*.
   So: collect the cards first, then turn the gate on and judge them. */
const both = await page.evaluate(() => {
  window.state = window.state || {}; state.league = 'nba'; state.eras = null;
  const draw = () => {
    const out = [];
    for (let t = 0; t < 5; t++)
      for (let i = 0; i < 60; i++) out.push(QUESTIONS[BK._pickQuestionIdx(t)]);
    return out;
  };
  BK._gate.verifiedOnly = false; const offCards = draw();
  BK._gate.verifiedOnly = true;  const onCards  = draw();
  const unverified = qs => qs.filter(q => !BK._gateOk(q)).length;  // gate is ON now
  return { off: unverified(offCards), on: unverified(onCards) };
});
if (both.off > 0) pass++;
else { fail++; bad.push('gate OFF dealt zero unverified cards — the check cannot bite'); }
if (both.on === 0) pass++;
else { fail++; bad.push(`gate ON dealt ${both.on} unverified cards`); }

if (errs.length) { fail++; bad.push(`${errs.length} JS error(s): ${errs[0]}`); }

await b.close();
console.log(`gate-check: ${pass} passed, ${fail} failed  (${dealt} cards dealt; ` +
            `era filter dropped on ${eraDropped}; gate off/on unverified ${both.off}/${both.on})`);
notes.forEach(x => console.log('  note  ' + x));
bad.forEach(x => console.log('  FAIL  ' + x));
console.log(fail ? `\n${fail} FAILING` : '\nALL CHECKS PASS');
process.exit(fail ? 1 : 0);

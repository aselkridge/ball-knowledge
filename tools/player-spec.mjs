// THE PLAYER / STATS-PACKAGE SPEC — executable ruling (BUILD.md 22t).
// Players are objects with the same three-axis tags as questions (league,
// eras, identity), and STATS ARE OBJECTS TOO: one package per era, stored as
// TOTALS (never rates), combined by games-weighting when a game selects
// multiple eras. This file defines dealable() and statlineFor() exactly as
// the engine must implement them, plus Aaron's required adversarial suite.
// Run: node tools/player-spec.mjs
//
// statsByEra: { "2000s": {g, pts, reb, ast, fgm, fga}, ... }  ← TOTALS ONLY.
// Rates (ppg, fg%) are DERIVED at read time. Two traps this kills:
//   · average-of-averages (28.0 over 500g + 25.0 over 300g is 26.875, not 26.5)
//   · percentage-averaging (must recombine from makes/attempts)
// Self-consistency law: sum of ALL era packages == the career block.

export function eraSetFor(leagueKey, cfg) {
  if (!cfg.eras) return "all";                       // FULL KNOWLEDGE
  return cfg.eras[leagueKey] ?? "all";               // absent league = All-Time
}
export function dealable(p, cfg) {                   // rule A: any overlap deals
  if (p.league !== cfg.league) return false;         // rosters come from the primary league
  const set = eraSetFor(p.league, cfg);
  if (set === "all") return true;
  return (p.eras || []).some(d => set.includes(d));
}
export function combine(pkgs) {                      // totals add; that's the whole trick
  const out = {};
  for (const pkg of pkgs) for (const [k, v] of Object.entries(pkg)) out[k] = (out[k] || 0) + v;
  return out;
}
export function rates(t) {                           // derive, never store
  const g = t.g || 0;
  return {
    ppg: g ? t.pts / g : 0, rpg: g ? t.reb / g : 0, apg: g ? t.ast / g : 0,
    fg_pct: t.fga ? t.fgm / t.fga : 0,
  };
}
export function statlineFor(p, cfg) {
  const set = eraSetFor(p.league, cfg);
  if (set === "all" || !p.statsByEra)
    return { totals: p.careerTotals || null, basis: p.statsByEra ? "career" : "career-fallback" };
  const have = set.filter(d => p.statsByEra[d]);
  if (!have.length) return { totals: p.careerTotals || null, basis: "career-fallback" };
  return { totals: combine(have.map(d => p.statsByEra[d])),
           basis: have.length === set.length ? "era-exact" : "era-partial" };
}
export const show1 = x => (Math.round(x * 10) / 10).toFixed(1);   // display rule: 1 decimal

// ---------------- adversarial suite ----------------
const LBJ = {  // synthetic but shape-true: totals per era, career = the sum
  id: "lebron-james", league: "nba", eras: ["2000s", "2010s", "2020s"],
  statsByEra: {
    "2000s": { g: 500, pts: 14000, reb: 3500, ast: 3400, fgm: 5000,  fga: 10000 },
    "2010s": { g: 700, pts: 18900, reb: 5320, ast: 5460, fgm: 7000,  fga: 13720 },
    "2020s": { g: 300, pts:  7500, reb: 2250, ast: 2400, fgm: 2600,  fga:  5200 },
  },
  careerTotals: { g: 1500, pts: 40400, reb: 11070, ast: 11260, fgm: 14600, fga: 28920 },
};
const RENS = { id: "clarence-fats-jenkins", league: "fives", eras: ["1920s","1930s"] }; // accolade-only: no stats, by design
let fail = 0;
const T = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log(`✗ ${name}\n    got ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`); }
  else console.log(`✓ ${name}`);
};

// dealable — rule A
T("2020s game deals LeBron (Aaron's law)", dealable(LBJ, {league:"nba", eras:{nba:["2020s"]}}), true);
T("1990s game does NOT deal LeBron (drafted 2003)", dealable(LBJ, {league:"nba", eras:{nba:["1990s"]}}), false);
T("All-Time deals him", dealable(LBJ, {league:"nba", eras:null}), true);
T("wrong primary league never deals him", dealable(LBJ, {league:"wnba", eras:null}), false);
T("multi-era ORs: 90s+2000s deals him via one overlap", dealable(LBJ, {league:"nba", eras:{nba:["1990s","2000s"]}}), true);

// statlineFor — the math traps
const single = statlineFor(LBJ, {league:"nba", eras:{nba:["2000s"]}});
T("single era returns that package verbatim", single.totals, LBJ.statsByEra["2000s"]);
const multi = statlineFor(LBJ, {league:"nba", eras:{nba:["2000s","2020s"]}});
T("multi-era ppg is GAMES-WEIGHTED (26.875), never average-of-averages (26.5)",
  rates(multi.totals).ppg, 26.875);
T("percentages recombine from makes/attempts",
  Number(rates(multi.totals).fg_pct.toFixed(4)), Number((7600/15200).toFixed(4)));
T("SELF-CONSISTENCY LAW: all eras combined == career block",
  statlineFor(LBJ, {league:"nba", eras:{nba:["2000s","2010s","2020s"]}}).totals, LBJ.careerTotals);
T("All-Time uses the career block directly (basis 'career')",
  statlineFor(LBJ, {league:"nba", eras:null}).basis, "career");
T("era with no package falls back to career, FLAGGED — honesty, never fabrication",
  statlineFor({...LBJ, statsByEra:{"2010s":LBJ.statsByEra["2010s"]}}, {league:"nba", eras:{nba:["2000s"]}}).basis,
  "career-fallback");
T("partially covered selection is flagged 'era-partial', not passed off as exact",
  statlineFor({...LBJ, statsByEra:{"2000s":LBJ.statsByEra["2000s"]}}, {league:"nba", eras:{nba:["2000s","2010s"]}}).basis,
  "era-partial");
T("accolade-only player (fives/street) has NO numbers to fake",
  statlineFor(RENS, {league:"fives", eras:{fives:["1930s"]}}).totals, null);
T("display rounds at the last moment only", show1(26.875), "26.9");
console.log(fail ? `\n${fail} FAILING` : `\nALL 14 CASES PASS`);
process.exit(fail ? 1 : 0);

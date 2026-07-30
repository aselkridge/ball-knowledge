// THE UNIFIED TAG GATE — executable spec + test oracle (BUILD.md 22s).
// This file IS the ruling: eligible() defines the semantics the engine must
// match when the gate lands in game.js, and the case table below is the
// adversarial suite Aaron required. Run: node tools/gate-spec.mjs
//
// Card schema: { l:"nba", e:["2000s"], p:["lebron-james"], off:1, v:1 }
//   l  — home league (required; "any" = universal)
//   e  — decades the fact BECAME TRUE (omitted = evergreen, always era-ok)
//   p  — player ids the card is ABOUT (WEIGHTS the draw; NEVER filters)
//   off— off-court flavour card (own opt-in axis, 22p)
// Config: { league:"nba", packs:["fives"], eras:{nba:["2000s"],fives:"all"},
//           offcourt:false, roster:["lebron-james"] }
//   eras — PER-LEAGUE sets (22r); "all"/missing league key = All-Time for it;
//          eras:null = FULL KNOWLEDGE (no era gate anywhere).

export function leagueOk(q, cfg) {
  const l = q.l || "any";
  if (l === "any") return true;
  if (l === cfg.league) return true;
  return !!(cfg.packs && cfg.packs.includes(l));
}
export function eraOk(q, cfg) {
  if (!cfg.eras) return true;                    // FULL KNOWLEDGE
  if (!q.e || !q.e.length) return true;          // evergreen
  const owner = (q.l && q.l !== "any") ? q.l : cfg.league;
  const set = cfg.eras[owner] ?? "all";          // league absent from map = All-Time
  if (set === "all") return true;
  return q.e.some(d => set.includes(d));         // OR within the axis
}
export function offOk(q, cfg) { return !q.off || !!cfg.offcourt; }
export function eligible(q, cfg) {               // AND across the axes
  return leagueOk(q, cfg) && eraOk(q, cfg) && offOk(q, cfg);
}
export function weight(q, cfg) {                 // p: biases, never gates
  if (!cfg.roster || !cfg.roster.length || !q.p) return 1;
  return q.p.some(id => cfg.roster.includes(id)) ? 3 : 1;
}
// THE POOL a game may draw from. Weighting must NEVER change its size — the
// setup screen's counter reads this number, so if weighting shrank or grew it,
// the counter would start lying. Eligibility decides membership; weight only
// decides how often a member gets picked.
export function poolCount(cards, cfg) {
  return cards.filter(q => eligible(q, cfg)).length;
}
// What the engine actually draws from: every eligible card repeated `weight`
// times. Membership is unchanged; only each member's share of the draw moves.
// An INELIGIBLE card is never in the bag — weighting cannot rescue one.
export function drawBag(cards, cfg) {
  const bag = [];
  for (const q of cards) {
    if (!eligible(q, cfg)) continue;
    for (let i = weight(q, cfg); i > 0; i--) bag.push(q);
  }
  return bag;
}

// ---------------- the adversarial case table ----------------
const NBA2000s = { league:"nba", packs:[], eras:{nba:["2000s"]} };
const CASES = [
 // -- basics: league axis
 ["NBA game takes an NBA card",            {l:"nba"}, {league:"nba",packs:[],eras:null}, true],
 ["NBA game rejects a WNBA card",          {l:"wnba"}, {league:"nba",packs:[],eras:null}, false],
 ["l:any rides every game",                {l:"any"}, {league:"fives",packs:[],eras:null}, true],
 ["pack admits its league",                {l:"fives"}, {league:"nba",packs:["fives"],eras:null}, true],
 ["non-packed league still rejected",      {l:"street"}, {league:"nba",packs:["fives"],eras:null}, false],
 // -- era axis: the became-true rule
 ["2009 draft fact rides a 2000s game",    {l:"nba",e:["2000s"]}, NBA2000s, true],
 ["2016 Finals MVP locked out of 2000s",   {l:"nba",e:["2010s"]}, NBA2000s, false],
 ["Jordan's 6th ring (90s) not dragged into 2000s by Wizards years",
                                           {l:"nba",e:["1990s"]}, NBA2000s, false],
 ["evergreen (no e:) rides every era",     {l:"nba"}, NBA2000s, true],
 ["spanning fact ORs across its tags",     {l:"nba",e:["1990s","2000s"]}, NBA2000s, true],
 ["current-state volatile (2020s-only) locked out of 2000s",
                                           {l:"nba",e:["2020s"],v:1,p:["lebron-james"]}, NBA2000s, false],
 ["multi-select eras OR on the config side",{l:"nba",e:["2010s"]},
                                           {league:"nba",packs:[],eras:{nba:["1990s","2010s"]}}, true],
 ["FULL KNOWLEDGE ignores era entirely",   {l:"nba",e:["1950s"]}, {league:"nba",packs:[],eras:null}, true],
 // -- multilayered: per-league era sets (22r), packs + eras together
 ["NBA-2000s + fives-All-Time: a 1930s Rens card RIDES via its own league's set",
   {l:"fives",e:["1930s"]}, {league:"nba",packs:["fives"],eras:{nba:["2000s"],fives:"all"}}, true],
 ["same game: a 1930s fives card is REJECTED when fives is era-narrowed too",
   {l:"fives",e:["1930s"]}, {league:"nba",packs:["fives"],eras:{nba:["2000s"],fives:["1940s"]}}, false],
 ["same game: NBA card still obeys the NBA set",
   {l:"nba",e:["1990s"]}, {league:"nba",packs:["fives"],eras:{nba:["2000s"],fives:"all"}}, false],
 ["pack league ABSENT from the era map defaults to All-Time",
   {l:"fives",e:["1930s"]}, {league:"nba",packs:["fives"],eras:{nba:["2000s"]}}, true],
 ["l:any evergreen survives the gnarliest config",
   {l:"any"}, {league:"wnba",packs:["college","fives"],eras:{wnba:["2020s"],college:["1970s"]}}, true],
 // -- p: tags weight, never filter
 ["card about a player NOT on your roster is still ELIGIBLE",
   {l:"nba",e:["2000s"],p:["kobe-bryant"]}, {...NBA2000s,roster:["lebron-james"]}, true],
 ["off-court card hidden until the toggle",  {l:"nba",off:1}, {league:"nba",packs:[],eras:null,offcourt:false}, false],
 ["off-court card rides with the toggle on", {l:"nba",off:1}, {league:"nba",packs:[],eras:null,offcourt:true}, true],
];
let fail = 0;
for (const [name,q,cfg,want] of CASES) {
  const got = eligible(q,cfg);
  if (got !== want) { fail++; console.log(`✗ ${name}  (got ${got}, want ${want})`); }
  else console.log(`✓ ${name}`);
}
// ---------------- weighting: the 3x roster bias (22s) ----------------
// Written BEFORE the engine change, per the standing rule: prove it, then build
// it. These cases are what game.js must satisfy.
const ROSTER = {...NBA2000s, roster:["lebron-james","stephen-curry"]};
const W_CASES = [
 ["card about a roster player weighs 3",
   {l:"nba",e:["2000s"],p:["lebron-james"]}, ROSTER, 3],
 ["card about a stranger weighs 1",
   {l:"nba",e:["2000s"],p:["kobe-bryant"]}, ROSTER, 1],
 ["card naming BOTH a roster player and a stranger weighs 3",
   {l:"nba",e:["2000s"],p:["kobe-bryant","stephen-curry"]}, ROSTER, 3],
 ["card with no player tags at all weighs 1",
   {l:"nba",e:["2000s"]}, ROSTER, 1],
 ["no roster set (e.g. before the squad is dealt) — everything weighs 1",
   {l:"nba",e:["2000s"],p:["lebron-james"]}, NBA2000s, 1],
 ["EMPTY roster behaves like no roster",
   {l:"nba",e:["2000s"],p:["lebron-james"]}, {...NBA2000s,roster:[]}, 1],
 ["a second roster player is weighted too, not just the first",
   {l:"nba",e:["2000s"],p:["stephen-curry"]}, ROSTER, 3],
];
for (const [name,q,cfg,want] of W_CASES) {
  const got = weight(q,cfg);
  if (got !== want) { fail++; console.log(`✗ ${name}  (got ${got}, want ${want})`); }
  else console.log(`✓ ${name}`);
}

// ---------------- the two invariants the engine MUST hold ----------------
const BANK = [
  {l:"nba",e:["2000s"],p:["lebron-james"]},   // roster, eligible
  {l:"nba",e:["2000s"],p:["kobe-bryant"]},    // stranger, eligible
  {l:"nba",e:["2000s"]},                      // untagged, eligible
  {l:"wnba",e:["2000s"],p:["lebron-james"]},  // roster BUT wrong league
  {l:"nba",e:["1970s"],p:["lebron-james"]},   // roster BUT wrong era
];
const bare = poolCount(BANK, NBA2000s);
const weighted = poolCount(BANK, ROSTER);
if (bare === weighted && bare === 3)
  console.log(`✓ INVARIANT 1 — weighting does not change the counted pool (${bare} either way);` +
              ` the setup counter stays honest`);
else { fail++; console.log(`✗ INVARIANT 1 broken: pool ${bare} bare vs ${weighted} weighted (want 3 and 3)`); }

const bag = drawBag(BANK, ROSTER);
const rescued = bag.some(q => !eligible(q, ROSTER));
const shares = {roster: bag.filter(q => q.p && q.p.includes("lebron-james")).length,
                stranger: bag.filter(q => q.p && q.p.includes("kobe-bryant")).length};
if (!rescued && shares.roster === 3 * shares.stranger)
  console.log(`✓ INVARIANT 2 — an ineligible card is never drawn, and a roster card takes` +
              ` ${shares.roster}/${bag.length} of the bag vs ${shares.stranger}/${bag.length}` +
              ` for a stranger (3x)`);
else { fail++; console.log(`✗ INVARIANT 2 broken: rescued=${rescued} shares=${JSON.stringify(shares)}`); }

const total = CASES.length + W_CASES.length + 2;
console.log(fail ? `\n${fail} FAILING` : `\nALL ${total} CASES PASS`);
process.exit(fail ? 1 : 0);

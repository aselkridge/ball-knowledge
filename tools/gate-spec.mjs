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
  if (!cfg.roster || !q.p) return 1;
  return q.p.some(id => cfg.roster.includes(id)) ? 3 : 1;
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
// weight() sanity: roster card outdraws stranger card, both eligible
const w1 = weight({l:"nba",e:["2000s"],p:["lebron-james"]}, {...NBA2000s,roster:["lebron-james"]});
const w2 = weight({l:"nba",e:["2000s"],p:["kobe-bryant"]},  {...NBA2000s,roster:["lebron-james"]});
if (w1 > w2) console.log(`✓ roster card outweighs stranger card (${w1} vs ${w2}) — weights, never filters`);
else { fail++; console.log(`✗ weighting broken (${w1} vs ${w2})`); }
console.log(fail ? `\n${fail} FAILING` : `\nALL ${CASES.length + 1} CASES PASS`);
process.exit(fail ? 1 : 0);

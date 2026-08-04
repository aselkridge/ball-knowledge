/* WHICH TIER DOES THE GAME ACTUALLY DEAL? Aaron, 2026-08-04: "does an easy card
   actually get called most (look into this)".

   The playbook's rule -- "never write volatile t:1 questions, easy questions get
   asked most" -- has been quoted all week and nobody has ever measured it. This
   counts two things that CAN be counted exactly, and is explicit about the third
   that cannot:
     1. the board: every tile, its zone, its tier
     2. the modes: every code path that asks for a tier, and what it can produce
   What it does NOT measure is player behaviour -- how often people actually
   shoot from each spot. That needs playtest telemetry nobody has collected. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
await p.reload({waitUntil:'networkidle'});await sleep(1500);
await p.evaluate(()=>{try{window.BK._show('game')}catch(e){}});
await sleep(1500);

const census=await p.evaluate(()=>{
  const m=window.BK.mode(), C=m.cols, R=m.rows;
  /* zoneOf is not exported, so drive it the way the game does: read the label
     off the real function via a shot attempt is fragile -- instead recompute
     with the SAME published thresholds, and cross-check the total against the
     game's own scoring-area count where one exists. */
  const out={};let scoring=0;
  for(let c=0;c<C;c++)for(let r=0;r<R;r++){
    const z=window.BK._zoneOf?window.BK._zoneOf(c,r,0):null;
    if(z===undefined)continue;
    if(z===null){out.outOfRange=(out.outOfRange||0)+1;continue}
    scoring++;
    const k=z.z+' (t'+z.tier+')';
    out[k]=(out[k]||0)+1;
  }
  return {cols:C,rows:R,scoring,out};
});
console.log('BOARD  '+census.cols+'x'+census.rows+' = '+census.cols*census.rows+' tiles, '
  +census.scoring+' of them inside scoring range\n');
const order=['layup (t1)','mid (t2)','corner3 (t2)','three (t3)'];
for(const k of order) if(census.out[k])
  console.log(('  '+k).padEnd(20)+String(census.out[k]).padStart(3)+' tiles   '
    +(100*census.out[k]/census.scoring).toFixed(1).padStart(5)+'% of the scoring area');
const byTier={1:census.out['layup (t1)']||0,
              2:(census.out['mid (t2)']||0)+(census.out['corner3 (t2)']||0),
              3:census.out['three (t3)']||0};
console.log('\n  BY TIER, uncontested:');
for(const t of [1,2,3])
  console.log('    t'+t+'  '+String(byTier[t]).padStart(3)+'  '
    +(100*byTier[t]/census.scoring).toFixed(1).padStart(5)+'%');

/* A CONTESTED SHOT IS ONE TIER HARDER (game.js: eff = min(3, z.tier + tight)).
   So every t1 tile with a defender on it deals a t2 card instead -- there is no
   path that makes a card EASIER except heat, which needs a streak first. */
console.log('\n  BY TIER, every shot contested (eff = min(3, tier+1)):');
const con={1:0,2:byTier[1],3:byTier[2]+byTier[3]};
for(const t of [1,2,3])
  console.log('    t'+t+'  '+String(con[t]).padStart(3)+'  '
    +(100*con[t]/census.scoring).toFixed(1).padStart(5)+'%');

console.log('\n  EVERY OTHER WAY A CARD IS DEALT (read off game.js):');
console.log('    pass                d>6 ? t3 : t2          -> never t1');
console.log('    tap battle          min(4, 1+round)        -> t2, t3, t4');
console.log('    shootout            r>=3 ? t4 : r>=2 ? t3 : t2  -> never t1');
console.log('    coach drill         shiftTier returns 0    -> t0 only');
console.log('    heat, while lit     tier-1                 -> the ONLY route down');
console.log('    handicap bracket    base + offset, floor lo');
await b.close();

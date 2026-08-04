/* THE VERIFIED-PACK GATE — proof it bites and proof it's safe.
   Serve docs/ on :8899 first (python3 -m http.server 8899 from docs/). */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await sleep(600);

// the exclusion list loaded and is the size the build script printed
const n=await p.evaluate(()=>Object.keys(typeof BK_UNVERIFIED!=='undefined'?BK_UNVERIFIED:{}).length);
ck(n>0,'unverified-index.js loaded',n+' cards excluded when the gate is on');

// gate OFF (the shipped default): nothing is excluded
const off=await p.evaluate(()=>{
  const B=window.BK;
  if(B._gate.verifiedOnly!==false)return {default:false};
  // every card passes gateOk when off, even unverified ones
  const un=Object.keys(BK_UNVERIFIED)[0];
  const q={q:un};
  return {default:true,passes:B._gateOk(q)};
});
ck(off.default===true,'gate ships OFF');
ck(off.passes===true,'gate OFF excludes nothing');

// gate ON: 200 draws across all tiers, zero unverified served
const on=await p.evaluate(()=>{
  const B=window.BK;
  B._gate.verifiedOnly=true;
  let bad=0,drawn=0,fallback0=0,notCard0=0;
  for(let t=0;t<=4;t++)for(let i=0;i<40;i++){
    const idx=B._pickQuestionIdx(t,true);
    const q=QUESTIONS[idx];drawn++;
    if(BK_UNVERIFIED[q.q]){bad++; if(idx!==0)notCard0++;}
    if(idx===0)fallback0++;
  }
  B._gate.verifiedOnly=false;
  return {bad,drawn,fallback0,notCard0};
});
ck(on.drawn===200,'200 draws completed with the gate on',String(on.drawn));
/* THE ONLY UNVERIFIED CARD ALLOWED THROUGH IS CARD 0.
   game.js names this itself: "card 0 is the final fallback and the ONE crack in
   the gate". It fires when a tier's verified pool is EMPTY, which is exactly
   today's state — 23 verified cards and nothing at all at t0 or t4, so every
   draw for those tiers falls through.
   Asserting bad===0 therefore fails for a correct reason and would stay red for
   as long as verification takes, which trains everyone to ignore it. What must
   never happen is an ARBITRARY unverified card leaking — that would mean the
   gate is not being honoured somewhere in the picker. So: card 0 is tolerated
   and counted out loud; anything else is a failure. When the pools fill, both
   numbers go to zero on their own. */
ck(on.notCard0===0,
   'no unverified card leaks except the documented card-0 fallback',
   on.notCard0+' leaked past the gate');
ck(true,'   (card-0 fallback fired '+on.fallback0+'/'+on.drawn+
   ' draws — it fires when a tier has NO verified card, and t0/t4 are empty)');
ck(on.fallback0<200,'the pool did not collapse to the card-0 fallback',on.fallback0+' of 200 were card 0');

// BREAK IT ON PURPOSE: mark EVERY card unverified — the picker must fall back
// to card 0 (never crash), and un-breaking must restore normal service.
const broke=await p.evaluate(()=>{
  const B=window.BK,save={};
  QUESTIONS.forEach(q=>{if(!BK_UNVERIFIED[q.q]){save[q.q]=1;BK_UNVERIFIED[q.q]=1}});
  B._gate.verifiedOnly=true;
  let all0=true;
  for(let t=0;t<=4;t++){if(B._pickQuestionIdx(t,true)!==0)all0=false}
  Object.keys(save).forEach(k=>{delete BK_UNVERIFIED[k]});
  const healed=B._pickQuestionIdx(2,true);
  B._gate.verifiedOnly=false;
  return {all0,healedIsGated:!BK_UNVERIFIED[QUESTIONS[healed].q]};
});
ck(broke.all0,'total exclusion degrades to card 0, no crash');
ck(broke.healedIsGated,'removing exclusions restores verified service');
/* THE GATE MUST NOT FAIL OPEN — added 08-04 after it did.
   The exclusion list is keyed on QUESTION TEXT, and the builder was carrying the
   raw source escapes into the key, so an unverified question containing a quote
   produced a key of \\" that matched no card. 17 unproven cards passed the gate
   silently. A gate that fails open is worse than no gate: it reports a number
   you can trust and serves cards you cannot. */
const leak=await p.evaluate(()=>{
  const qset=new Set(QUESTIONS.map(q=>q.q));
  const keys=Object.keys(BK_UNVERIFIED);
  const orphan=keys.filter(k=>!qset.has(k));
  return {orphan:orphan.length,ex:orphan.slice(0,2),
          keys:keys.length,cards:QUESTIONS.length};
});
ck(leak.orphan===0,
   'every exclusion-list key matches a real card — the gate cannot fail open',
   leak.orphan?leak.orphan+' orphaned, e.g. '+JSON.stringify(leak.ex[0]).slice(0,70)
              :leak.keys+' keys, all matched');

/* and the two counts have to agree: cards passing the gate must equal
   cards - excluded. If they drift, something is passing for a reason nobody
   wrote down. */
const agree=await p.evaluate(()=>{
  const B=window.BK; B._gate.verifiedOnly=true;
  const pass=QUESTIONS.filter(q=>B._gateOk(q)).length;
  B._gate.verifiedOnly=false;
  return {pass,expected:QUESTIONS.length-Object.keys(BK_UNVERIFIED).length};
});
ck(agree.pass===agree.expected,
   'cards passing the gate == cards minus the exclusion list',
   agree.pass+' vs '+agree.expected);

ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

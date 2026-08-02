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
  let bad=0,drawn=0,fallback0=0;
  for(let t=0;t<=4;t++)for(let i=0;i<40;i++){
    const idx=B._pickQuestionIdx(t,true);
    const q=QUESTIONS[idx];drawn++;
    if(BK_UNVERIFIED[q.q])bad++;
    if(idx===0)fallback0++;
  }
  B._gate.verifiedOnly=false;
  return {bad,drawn,fallback0};
});
ck(on.drawn===200,'200 draws completed with the gate on',String(on.drawn));
ck(on.bad===0,'ZERO unverified cards served through the gate',on.bad+' leaked');
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
ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

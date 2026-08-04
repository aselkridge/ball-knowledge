/* BEFORE/AFTER shots for The Tape, 2026-08-04. CLAUDE.md standing rule: any
   change to how something LOOKS or READS ships a side-by-side built from REAL
   headless screenshots of both, desktop AND 390. The old file is served from
   docs/tape/_before/ (a copy of index.html.bak with its data path re-pointed)
   and deleted straight after — a "before" you cannot re-shoot is a claim, not a
   comparison. The Tape is dark only (color-scheme:dark), so there is no light
   pair to take. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

async function shot(where,path,vw,vh,fn){
  const pg=await (await b.newContext({viewport:{width:vw,height:vh}})).newPage();
  await pg.goto('http://127.0.0.1:8899'+where,{waitUntil:'networkidle'});
  await pg.evaluate(()=>{try{localStorage.setItem('bk_tape_coach','1')}catch(e){}});
  await pg.reload({waitUntil:'networkidle'});await sleep(500);
  if(fn)await fn(pg);
  await pg.screenshot({path:'shots/'+path});
  console.log('  '+path);
  await pg.close();
}
const view2=async pg=>{pg.evaluate(()=>document.querySelector('[data-v="2"]').click());
  await sleep(2000)};
const queryTab=async pg=>{await pg.evaluate(()=>document.getElementById('tabQuery').click());
  await sleep(500)};

for(const [tag,dir] of [['before','/tape/_before/?nocoach=1'],['after','/tape/?nocoach=1']]){
  await shot(dir,'tape-'+tag+'-desk.png',1440,900,view2);
  await shot(dir,'tape-'+tag+'-query-390.png',390,844,queryTab);
  await shot(dir,'tape-'+tag+'-rail-390.png',390,844,async pg=>{
    await pg.evaluate(()=>document.getElementById('menuBtn').click());await sleep(400)});
}
/* the coach has no before — it did not exist */
await shot('/tape/','tape-after-coach-desk.png',1440,900,async pg=>{
  await pg.evaluate(async()=>{window.TAPE.setQuery(window.TAPE.sample());await window.TAPE.run()});
  await sleep(1500);await pg.evaluate(()=>window.TAPE.coach(4));await sleep(400)});
await shot('/tape/','tape-after-coach-390.png',390,844,async pg=>{
  await pg.evaluate(async()=>{window.TAPE.setQuery(window.TAPE.sample());await window.TAPE.run()});
  await sleep(1500);await pg.evaluate(()=>window.TAPE.coach(1));await sleep(400)});
await b.close();

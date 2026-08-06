/* BEFORE/AFTER shots for The Tape, 2026-08-04. CLAUDE.md standing rule: any
   change to how something LOOKS or READS ships a side-by-side built from REAL
   headless screenshots of both, desktop AND 390. The old file is served from
   docs/tape/_before/, minted out of git below and deleted at the end — a "before"
   you cannot re-shoot is a claim, not a comparison. The Tape is dark only
   (color-scheme:dark), so there is no light pair to take.

   BEFORE_REF=<sha> picks a different baseline; it defaults to HEAD, which is what
   Aaron is looking at right now. */
import pw from 'playwright';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* THE BASELINE COMES OUT OF GIT, and this script mints it so nobody can do it
   the other way. On 08-04 the "before" was shot from an index.html.bak copied
   earlier in the same session — it was mid-flight, already carried two of the
   improvements, and showed a state that had never existed anywhere. A backup you
   made is a snapshot of your own work in progress. Torn down at the end, because
   a stale _before/ is the same trap wearing a different name. */
const REF=process.env.BEFORE_REF||'HEAD';
fs.mkdirSync('docs/tape/_before',{recursive:true});
fs.writeFileSync('docs/tape/_before/index.html',
  execSync(`git show ${REF}:docs/tape/index.html`,{encoding:'utf8'})
    .replace(/'\.\.\/play\//g,"'../../play/"));
console.log(`  before = ${REF} (${execSync(`git rev-parse --short ${REF}`,{encoding:'utf8'}).trim()})`);

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
const header=async pg=>{await pg.evaluate(()=>{window.TAPE.setQuery(
  'person_stats where league_id=wnba join people sort kind, ppg desc');return window.TAPE.run()});
  await sleep(2200)};
const tally=async pg=>{await pg.evaluate(()=>{window.TAPE.setQuery('facts count by category');
  return window.TAPE.run()});await sleep(2200)};
const queryTab=async pg=>{await pg.evaluate(()=>document.getElementById('tabQuery').click());
  await sleep(500)};

for(const [tag,dir] of [['before','/tape/_before/?nocoach=1'],['after','/tape/?nocoach=1']]){
  await shot(dir,'tape-'+tag+'-desk.png',1440,900,view2);
  await shot(dir,'tape-'+tag+'-query-390.png',390,844,queryTab);
  await shot(dir,'tape-'+tag+'-rail-390.png',390,844,async pg=>{
    await pg.evaluate(()=>document.getElementById('menuBtn').click());await sleep(400)});
  await shot(dir,'tape-'+tag+'-header.png',1000,420,header);
  await shot(dir,'tape-'+tag+'-tally.png',1000,560,tally);
}
/* the coach has no before — it did not exist */
await shot('/tape/','tape-after-coach-desk.png',1440,900,async pg=>{
  await pg.evaluate(async()=>{window.TAPE.setQuery(window.TAPE.sample());await window.TAPE.run()});
  await sleep(1500);await pg.evaluate(()=>window.TAPE.coach(4));await sleep(400)});
await shot('/tape/','tape-after-coach-390.png',390,844,async pg=>{
  await pg.evaluate(async()=>{window.TAPE.setQuery(window.TAPE.sample());await window.TAPE.run()});
  await sleep(1500);await pg.evaluate(()=>window.TAPE.coach(4));await sleep(400)});
fs.rmSync('docs/tape/_before',{recursive:true,force:true});
console.log('  _before/ removed');
await b.close();

/* THE TAPE — headless check. Serve docs/ on :8899 first.

   Aaron asked for six things on 2026-08-04: sort, hide columns, a pre-filled
   query sample, SQL, a coach, and a replay button. Five of the six are things
   you can only trust by DRIVING them, and the sixth (sort) already existed and
   was invisible — which is exactly the failure this file is meant to catch, so
   every check below asserts the thing HAPPENED, not that the code for it is
   present. A check that a button exists is not a check.

   Each block also does the break-it half where there is one to do: descending
   must actually reverse, a hidden column must still export, the sample must not
   eat typed text, and the SQL door must return the SAME ROWS as the plain form
   rather than merely running without error. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
try{await ctx.grantPermissions(['clipboard-read','clipboard-write'],
  {origin:'http://127.0.0.1:8899'})}catch(e){}
const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
/* nocoach=1 keeps the first-visit walkthrough out of the way of everything that
   is not the walkthrough. It gets its own section at the bottom, on a fresh page. */
await p.goto('http://127.0.0.1:8899/tape/?nocoach=1',{waitUntil:'networkidle'});
await sleep(400);

const run=async q=>{await p.evaluate(t=>{document.getElementById('tabQuery').click();
  document.getElementById('qtext2').value=t;document.getElementById('runBtn2').click()},q);
  await sleep(900);return p.evaluate(()=>window.TAPE.state())};
const colOf=name=>p.evaluate(c=>{
  const th=[...document.querySelectorAll('th')].map(t=>
    t.innerText.trim().replace(/[▲▼▾⇅0-9\s]+$/,''));
  const i=th.indexOf(c);if(i<0)return null;
  return [...document.querySelectorAll('table tr')].slice(1)
    .map(r=>r.children[i]&&r.children[i].innerText.trim());},name);

console.log('\n— the builder still works —');
await p.evaluate(()=>{document.getElementById('tabBuild').click();
  document.querySelector('[data-v="2"]').click()});
await sleep(1800);
let s=await p.evaluate(()=>({...window.TAPE.state(),
  txt:document.getElementById('qtext').value,
  first:[...document.querySelectorAll('table tr')][1]?.innerText.slice(0,90)}));
ck(s.rows>0,'saved view R2 returns rows',String(s.rows));
ck(s.joined.includes('people.name'),'the join brought in the readable column',s.joined.join(','));
ck(/where run=R2/.test(s.txt)&&/join people/.test(s.txt),'the builder wrote the query text',JSON.stringify(s.txt));
ck(/[A-Z]/.test(s.first||''),'a real name appears in the row',s.first);

await p.evaluate(()=>document.querySelector('[data-fil="kind"]').click());
await sleep(300);
const pop=await p.evaluate(()=>({open:document.getElementById('pop').classList.contains('on'),
  items:[...document.querySelectorAll('#poplist button')].map(b=>b.innerText.replace(/\n/g,' ')).slice(0,4)}));
ck(pop.open,'column dropdown opens');
ck(pop.items.length>1,'it lists real values with counts',pop.items.join(' | '));
await p.evaluate(()=>[...document.querySelectorAll('#poplist button')][1].click());
await sleep(700);
s=await p.evaluate(()=>({...window.TAPE.state(),txt:document.getElementById('qtext').value}));
ck(s.Q.where.length===2&&s.Q.where[1].col==='kind','picking a value ADDS a filter, keeping the view\'s own',JSON.stringify(s.Q.where));
ck(/kind=/.test(s.txt),'and the query text updated',JSON.stringify(s.txt));

s=await run('leagues where status=live');
ck(s.Q.table==='leagues'&&s.rows===2,'typed query runs (2 live leagues)',s.Q.table+'/'+s.rows);
s=await run('leagues where first_year=');
ck(s.rows===11,'col= finds empty values (11 leagues have no first_year)',String(s.rows));

console.log('\n— sort, and its break-it half —');
s=await run('person_stats where league_id=wnba join people sort ppg desc');
const desc=(await colOf('ppg')).filter(v=>v&&v!=='—').map(Number);
ck(s.sort.length===1&&s.sort[0].col==='ppg'&&s.sort[0].dir===-1,'the query text can SET a sort',JSON.stringify(s.sort));
ck(desc.length>5&&desc.every((v,i)=>i===0||desc[i-1]>=v),'desc really is descending',
   desc.slice(0,4).join(' > '));
s=await run('person_stats where league_id=wnba join people sort ppg');
const asc=(await colOf('ppg')).filter(v=>v&&v!=='—').map(Number);
ck(asc.every((v,i)=>i===0||asc[i-1]<=v),'and plain sort really is ascending',asc.slice(0,4).join(' < '));
ck(asc[0]!==desc[0],'the two orders are not the same list',asc[0]+' vs '+desc[0]);
/* the discoverability fix: clicking a column NAME must write itself into the text */
await p.evaluate(()=>{document.getElementById('tabBuild').click();
  document.querySelector('[data-sort="season"]').click()});
await sleep(800);
s=await p.evaluate(()=>({...window.TAPE.state(),txt:document.getElementById('qtext').value}));
ck(/sort season/.test(s.txt),'clicking a column header writes `sort` into the query',JSON.stringify(s.txt));
ck(/[▲▼]|&#9650;|▲/.test(await p.evaluate(()=>
  [...document.querySelectorAll('th')].map(t=>t.innerText).join(''))),'an arrow marks the sorted column');

console.log('\n— SQL is a translation, so it must agree with the plain form —');
const plain=await run('person_stats where league_id=wnba join people sort ppg desc');
const sql=await run("SELECT * FROM person_stats JOIN people ON person_stats.person_id=people.person_id WHERE league_id='wnba' ORDER BY ppg DESC");
ck(sql.text===plain.text,'SELECT … is rewritten into the plain form, verbatim',JSON.stringify(sql.text));
ck(sql.rows===plain.rows&&sql.rows>0,'and returns the same rows',plain.rows+' vs '+sql.rows);
/* Compared against the plain form rather than pinned to a number. The first
   version asserted "24 facts are checked" and broke the same afternoon, because
   the verification pass checked 24 more — a check that fails when the DATA is
   correct is a check that trains you to ignore it. */
const nn=await run('SELECT * FROM facts WHERE date_checked IS NOT NULL');
const nn2=await run('facts where date_checked=*');
ck(nn.rows===nn2.rows&&nn.rows>0,'IS NOT NULL maps to col=*',nn.rows+' vs '+nn2.rows);
const nl=await run('SELECT * FROM facts WHERE date_checked IS NULL');
ck(nl.rows+nn.rows===(await run('facts')).rows,'IS NULL and IS NOT NULL partition the table',
   nl.rows+' + '+nn.rows);
const isn=await run('SELECT * FROM facts WHERE confidence != "low" AND date_checked IS NULL');
ck(isn.Q.where.length===2&&isn.Q.where[0].op==='!=','!= and IS NULL survive the AND split',
   JSON.stringify(isn.Q.where));
/* This one deliberately asks for a table that does not exist, so the 404 it
   provokes is the harness's own and gets subtracted from the console-error count
   at the bottom. It is here because the first time it ran it caught a real bug:
   rows survived the failure and the spreadsheet copy still held them. */
const junk=await run('SELECT count(*) FROM nothing_at_all');
ck(junk.rows===0&&junk.Q.table==='nothing_at_all','an unknown table fails visibly, not silently',
   junk.Q.table+'/'+junk.rows);
ck((await p.evaluate(()=>document.getElementById('scroll').innerText)).includes('nothing_at_all'),
   'and says so on screen');

console.log('\n— sorting stacks, and the header says which is which —');
s=await run('person_stats where league_id=wnba join people sort kind, ppg desc');
ck(s.sort.length===2&&s.sort[0].col==='kind'&&s.sort[1].dir===-1,
   'the query takes several sort keys, in order',JSON.stringify(s.sort));
/* index BY HEADER NAME. The first version hard-coded children[1] and children[8]
   and was reading `kind` against `spg` — the assertion was real, the columns were
   not, and it failed on correct data. */
const twoCol=await p.evaluate(()=>{
  const th=[...document.querySelectorAll('th')].map(t=>
    t.innerText.trim().replace(/[▲▼▾⇅0-9\s]+$/,''));
  const a=th.indexOf('kind'),b=th.indexOf('ppg');
  return [...document.querySelectorAll('table tr')].slice(1,40)
    .map(r=>[r.children[a].innerText.trim(),r.children[b].innerText.trim()]);});
const ordered=twoCol.every((v,i)=>{
  if(!i)return true;
  const pv=twoCol[i-1];
  return pv[0]<v[0] || (pv[0]===v[0] && (parseFloat(pv[1])||0)>=(parseFloat(v[1])||0));});
ck(ordered,'the SECOND key really breaks the first key\'s ties',
   twoCol.slice(0,4).map(x=>x.join('/')).join(' , '));
/* the affordance Aaron actually hit: he clicked the arrow and got a filter */
const hdr=await p.evaluate(()=>{const th=document.querySelector('th');
  return {sortTxt:th.querySelector('[data-sort]').innerText,
          sortTitle:th.querySelector('[data-sort]').title,
          filHasSvg:!!th.querySelector('[data-fil] svg'),
          filTxt:th.querySelector('[data-fil]').innerText.trim(),
          filTitle:th.querySelector('[data-fil]').title};});
ck(/⇅|▲|▼/.test(hdr.sortTxt),'the SORT control carries the arrow',JSON.stringify(hdr.sortTxt));
ck(hdr.filHasSvg&&hdr.filTxt==='','the FILTER control is a funnel, not an arrow',
   JSON.stringify(hdr.filTxt));
ck(/[Ss]ort/.test(hdr.sortTitle)&&/[Ff]ilter/.test(hdr.filTitle),'and each one says what it does',
   hdr.sortTitle+' | '+hdr.filTitle);
/* plain click replaces, shift-click adds — the question Aaron asked */
await p.evaluate(()=>{document.getElementById('tabBuild').click();
  document.querySelector('[data-sort="season"]').click()});
await sleep(700);
s=await p.evaluate(()=>window.TAPE.state());
ck(s.sort.length===1&&s.sort[0].col==='season','a plain click REPLACES the sort',JSON.stringify(s.sort));
await p.evaluate(()=>{const ev=new MouseEvent('click',{bubbles:true,shiftKey:true});
  document.querySelector('[data-sort="ppg"]').dispatchEvent(ev)});
await sleep(700);
s=await p.evaluate(()=>({...window.TAPE.state(),txt:document.getElementById('qtext').value}));
ck(s.sort.length===2&&s.sort[1].col==='ppg','a shift-click ADDS a second key',JSON.stringify(s.sort));
ck(/sort season, ppg/.test(s.txt),'and both land in the query text',JSON.stringify(s.txt));
ck(/1/.test(await p.evaluate(()=>document.querySelector('.rank')?.innerText||'')),
   'the header numbers the sort order when there is more than one');
await p.evaluate(()=>document.querySelector('[data-sort="season"]').click());
await sleep(700);
s=await p.evaluate(()=>window.TAPE.state());
ck(s.sort.length===2&&s.sort[0].dir===-1,'clicking a column already in the sort FLIPS it, keeps the rest',
   JSON.stringify(s.sort));

console.log('\n— count by: the gap that made "not a database" true —');
s=await run('facts count by confidence');
ck(s.grouped&&s.cols.join(',')==='confidence,how many','count by returns a tally, not rows',
   s.cols.join(','));
const tally=await p.evaluate(()=>[...document.querySelectorAll('table tr')].slice(1)
  .map(r=>[r.children[0].innerText.trim(),+r.children[1].innerText.replace(/[^0-9]/g,'')]));
ck(tally.length===3,'three confidence values in the bank',JSON.stringify(tally));
const total=tally.reduce((n,x)=>n+x[1],0);
ck(total===(await run('facts')).rows,'the tally adds up to the whole table',String(total));
ck(tally[0][1]>=tally[1][1],'biggest group first by default',tally.map(x=>x.join(':')).join(' '));
const g1=await run('SELECT confidence, COUNT(*) FROM facts GROUP BY confidence');
ck(/count by confidence/.test(g1.text)&&g1.grouped,'GROUP BY translates to count by',
   JSON.stringify(g1.text));
ck(/sort how many desc/.test(g1.text),'and a tally sorts itself biggest-first, in writing',
   JSON.stringify(g1.text));
const g2=await run('facts where confidence=high count by category');
ck(g2.grouped&&g2.rows>0&&g2.rows<(await run('facts count by category')).rows,
   'a filter narrows the tally too',String(g2.rows));

console.log('\n— hide columns —');
s=await run('sources');
const before=s.cols.length;
await p.evaluate(()=>{document.getElementById('colsBtn').click()});
await sleep(250);
await p.evaluate(()=>{const b=[...document.querySelectorAll('#poplist button')]
  .find(x=>x.innerText.trim().endsWith('publisher'));b.click()});
await sleep(300);
await p.evaluate(()=>document.getElementById('pop').classList.remove('on'));
s=await p.evaluate(()=>window.TAPE.state());
ck(s.cols.length===before&&s.shown.length===before-1,'hiding drops it from the VIEW, not the data',
   s.cols.length+' cols / '+s.shown.length+' shown');
ck(!(await colOf('publisher')),'the column is gone from the table');
/* case-insensitive on purpose: the bar is text-transform:uppercase, so innerText
   comes back "COLUMNS (1 HIDDEN)". The first version of this line failed on the
   capital letters and looked exactly like a broken feature for a minute. */
ck(/1 hidden/i.test(await p.evaluate(()=>document.getElementById('colsBtn').innerText)),
   'the button says how many are hidden');
/* break-it: the promise on the popup is that a hidden column is STILL exported
   and STILL filterable. Both are easy to get wrong and neither is visible.
   Unlock first — export is behind a passcode now (see the lock section). */
await p.evaluate(()=>{localStorage.setItem('bk_tape_export','1')});
await p.reload({waitUntil:'networkidle'});await sleep(600);
await p.evaluate(()=>{document.getElementById('tabQuery').click();
  document.getElementById('qtext2').value='sources';document.getElementById('runBtn2').click()});
await sleep(900);
await p.evaluate(()=>{document.getElementById('colsBtn').click()});
await sleep(250);
await p.evaluate(()=>{const b=[...document.querySelectorAll('#poplist button')]
  .find(x=>x.innerText.trim().endsWith('publisher'));b.click()});
await sleep(300);
await p.evaluate(()=>document.getElementById('pop').classList.remove('on'));
const tsv=await p.evaluate(async()=>{document.getElementById('copy').click();
  await new Promise(r=>setTimeout(r,250));
  try{return await navigator.clipboard.readText()}catch(e){return 'CLIPBOARD:'+e.message}});
ck(/^[^\n]*\bpublisher\b/.test(tsv),'a hidden column is still in the spreadsheet copy',
   tsv.split('\n')[0]||tsv.slice(0,80));
s=await run('sources where publisher=NBA.com');
ck(s.rows>0,'and a hidden column is still filterable',String(s.rows));
s=await run('facts');
ck(s.shown.length===s.cols.length,'hiding is per table — facts is untouched',
   s.shown.length+'/'+s.cols.length);

console.log('\n— the export lock —');
{
  const lp=await ctx.newPage();
  const lerrs=[];lp.on('pageerror',e=>lerrs.push(String(e)));
  await lp.goto('http://127.0.0.1:8899/tape/?nocoach=1',{waitUntil:'networkidle'});
  await lp.evaluate(()=>localStorage.removeItem('bk_tape_export'));
  await lp.reload({waitUntil:'networkidle'});await sleep(500);
  await lp.evaluate(()=>{document.getElementById('tabQuery').click();
    document.getElementById('qtext2').value='leagues';document.getElementById('runBtn2').click()});
  await sleep(900);
  ck(await lp.evaluate(()=>window.TAPE.locked()),'a fresh visitor lands LOCKED');
  ck(/\uD83D\uDD12|🔒/.test(await lp.evaluate(()=>document.getElementById('copy').textContent)),
     'and the button shows it',await lp.evaluate(()=>document.getElementById('copy').textContent));
  ck(await lp.evaluate(()=>document.getElementById('lockBtn').hidden),
     'the Lock button hides while already locked');
  /* the whole point: pressing it must NOT hand over the data */
  await lp.evaluate(()=>document.getElementById('copy').click());
  await sleep(300);
  ck(await lp.evaluate(()=>document.getElementById('pop').classList.contains('on')),
     'pressing it asks for a passcode instead of copying');
  ck(!!(await lp.evaluate(()=>document.getElementById('passin'))),'there is a passcode field');
  /* a wrong passcode must fail CLOSED */
  await lp.evaluate(()=>{document.getElementById('passin').value='not-the-passcode';
    document.getElementById('passgo').click()});
  await sleep(2500);
  ck(await lp.evaluate(()=>window.TAPE.locked()),'a wrong passcode leaves it locked');
  ck(/not it/i.test(await lp.evaluate(()=>document.getElementById('passmsg').innerText)),
     'and says so',await lp.evaluate(()=>document.getElementById('passmsg').innerText));
  /* everything that is NOT the export must be untouched by the lock */
  const st=await lp.evaluate(()=>window.TAPE.state());
  ck(st.rows>0,'the data is still fully readable while locked',String(st.rows));
  ck(!(await lp.evaluate(()=>document.getElementById('colsBtn').disabled)),
     'and Columns, sort and filter are not gated');
  /* the right one opens it, and it sticks */
  await lp.evaluate(()=>{document.getElementById('copy').click()});
  await sleep(300);
  await lp.evaluate(()=>{document.getElementById('passin').value='press-triangle-rebound';
    document.getElementById('passgo').click()});
  await sleep(3000);
  ck(!(await lp.evaluate(()=>window.TAPE.locked())),'the right passcode unlocks it');
  ck(!/🔒/.test(await lp.evaluate(()=>document.getElementById('copy').textContent)),
     'and the padlock goes',await lp.evaluate(()=>document.getElementById('copy').textContent));
  await lp.reload({waitUntil:'networkidle'});await sleep(500);
  ck(!(await lp.evaluate(()=>window.TAPE.locked())),'it stays unlocked on the next visit');
  ck(!(await lp.evaluate(()=>document.getElementById('lockBtn').hidden)),
     'and a Lock button appears, so you can shut it again');
  await lp.evaluate(()=>document.getElementById('lockBtn').click());
  await sleep(200);
  ck(await lp.evaluate(()=>window.TAPE.locked()),'Lock re-locks it');
  /* THE HONEST LIMIT, asserted so nobody mistakes this for security: the raw
     tables are on the same public site and the game fetches them in the clear */
  const raw=await lp.evaluate(async()=>{
    const r=await fetch('/play/data/tables/leagues.json');return (await r.json()).length});
  ck(raw>0,'THE DATA IS STILL PUBLIC — the json fetches fine with the export locked',
     raw+' leagues, straight off the wire');
  ck(!/press-triangle-rebound/.test(await lp.content()),'the passcode is not in the page source');
  ck(lerrs.length===0,'the lock throws nothing',lerrs.slice(0,2).join(' | '));
  await lp.close();
}

console.log('\n— the pre-filled sample —');
const p2=await ctx.newPage();
await p2.goto('http://127.0.0.1:8899/tape/?nocoach=1',{waitUntil:'networkidle'});
await sleep(400);
await p2.evaluate(()=>document.getElementById('tabQuery').click());
await sleep(200);
let box=await p2.evaluate(()=>document.getElementById('qtext2').value);
ck(box.trim().length>0,'flipping to Query lands on a filled box, not an empty one',JSON.stringify(box));
await p2.evaluate(()=>document.getElementById('runBtn2').click());
await sleep(1600);
let s2=await p2.evaluate(()=>window.TAPE.state());
ck(s2.rows>0,'the sample is a query that WORKS, not decoration',String(s2.rows));
ck(s2.Q.where.length>0&&s2.Q.join.length>0&&s2.sort,'and it demonstrates where, join and sort at once',
   JSON.stringify(s2.text));
/* break-it: the sample must never eat something half-typed */
await p2.evaluate(()=>{document.getElementById('tabBuild').click();
  document.getElementById('qtext2').value='people where';
  document.getElementById('tabQuery').click()});
box=await p2.evaluate(()=>document.getElementById('qtext2').value);
ck(box==='people where','it only fills an EMPTY box — typed text survives a tab flip',JSON.stringify(box));

console.log('\n— nested values render as values —');
s2=await run('source_register');
const cells=await p.evaluate(()=>[...document.querySelectorAll('td')].map(t=>t.innerText).join(' '));
ck(s2.rows===14,'source_register is visible at all (14 sites)',String(s2.rows));
ck(!/\[object Object\]/.test(cells),'no [object Object] — nested rules print as text');
ck(/basketball-reference/.test(cells),'and a real site is in there');

console.log('\n— the coach —');
const p3=await ctx.newPage();
const cerrs=[];p3.on('pageerror',e=>cerrs.push(String(e)));
await p3.goto('http://127.0.0.1:8899/tape/',{waitUntil:'networkidle'});
await p3.evaluate(()=>localStorage.removeItem('bk_tape_coach'));
await p3.reload({waitUntil:'networkidle'});await sleep(2600);
const auto=await p3.evaluate(()=>({on:document.getElementById('ccard').classList.contains('on'),
  step:window.TAPE.state().step,h:document.getElementById('ch').innerText,
  rows:window.TAPE.state().rows,
  tds:document.querySelectorAll('td').length}));
ck(auto.on&&auto.step===0,'it runs itself on a first visit',auto.h);
/* the first build of this pointed at a table that was not on screen yet */
ck(auto.rows>0&&auto.tds>0,'and loads an example first, so the steps point at something real',
   auto.rows+' rows / '+auto.tds+' cells');
/* walk every step and demand the spotlight land on something a person can SEE —
   the phone rail is slid off screen, so a step pointing at it must open it */
let steps=0,badSpot=null,jargon=null;
const JARGON=/\b(harness|schema|foreign key|FK|primary key|serialise|refactor|idempotent|regex|DOM)\b/i;
for(let i=0;i<40;i++){
  const st=await p3.evaluate(()=>{
    const el=document.querySelector('.spot');
    return {step:window.TAPE.state().step,on:document.getElementById('ccard').classList.contains('on'),
      h:document.getElementById('ch').innerText,body:document.getElementById('cp').innerText,
      spot:el?el.id:null,vis:el?(el.getBoundingClientRect().width>20&&
        el.getBoundingClientRect().right>0):true};});
  if(!st.on)break;
  steps++;
  if(!st.vis)badSpot=st.h+' → '+st.spot;
  if(JARGON.test(st.body))jargon=st.h+': '+st.body.slice(0,60);
  await p3.evaluate(()=>document.getElementById('cnext').click());
  await sleep(220);
}
ck(steps===10,'Next walks all ten steps and then closes',String(steps));
ck(!badSpot,'every spotlight lands on something on screen',badSpot||'');
ck(!jargon,'no jargon in the copy',jargon||'');
let done=await p3.evaluate(()=>({on:document.getElementById('ccard').classList.contains('on'),
  spot:!!document.querySelector('.spot'),seen:localStorage.getItem('bk_tape_coach')}));
ck(!done.on&&!done.spot,'finishing clears the card AND the highlight');
ck(done.seen==='1','and it remembers, so it does not reopen every visit');
ck((await p3.evaluate(()=>document.getElementById('paneBuild').hidden))===false,
   'and finishing puts the tab back where it found it');
await p3.reload({waitUntil:'networkidle'});await sleep(700);
ck(!(await p3.evaluate(()=>document.getElementById('ccard').classList.contains('on'))),
   'second visit opens straight into the data');
/* THE REPLAY BUTTON — Aaron asked for it by name */
await p3.evaluate(()=>{document.getElementById('tabQuery').click();
  document.getElementById('qtext2').value='leagues where status=live';
  document.getElementById('runBtn2').click()});
await sleep(900);
await p3.evaluate(()=>document.getElementById('coachBtn').click());
await sleep(700);
const replay=await p3.evaluate(()=>({on:document.getElementById('ccard').classList.contains('on'),
  step:window.TAPE.state().step,table:window.TAPE.state().Q.table}));
ck(replay.on&&replay.step===0,'the button replays it from step 1',JSON.stringify(replay));
ck(replay.table==='leagues','a replay does NOT throw away the query you were on',replay.table);
await p3.evaluate(()=>document.getElementById('cnext').click());await sleep(200);
await p3.evaluate(()=>document.getElementById('cback').click());await sleep(200);
ck((await p3.evaluate(()=>window.TAPE.state().step))===0,'Back goes back');
await p3.keyboard.press('Escape');await sleep(200);
ck(!(await p3.evaluate(()=>document.getElementById('ccard').classList.contains('on'))),'Escape closes it');
ck(cerrs.length===0,'coach throws nothing',cerrs.slice(0,2).join(' | '));

console.log('\n— the music player —');
{
  const mpp=await ctx.newPage();
  const merr=[];mpp.on('pageerror',e=>merr.push(String(e)));
  await mpp.goto('http://127.0.0.1:8899/tape/?nocoach=1',{waitUntil:'networkidle'});
  await sleep(500);
  ck(!!(await mpp.$('#mp')),'the player is on the page');
  let m=await mpp.evaluate(()=>window.TAPE.music());
  ck(m.n===8,'eight tracks',String(m.n));
  ck(!m.playing&&!m.src,'it starts SILENT and loads nothing',JSON.stringify({playing:m.playing,src:m.src}));
  /* the whole point of preload:none — reading a table must not cost 8 MB */
  const before=[];mpp.on('response',r=>{if(/\.mp3$/.test(r.url()))before.push(r.url())});
  await mpp.evaluate(()=>{document.getElementById('mpNext').click();
    document.getElementById('mpPrev').click()});
  await sleep(400);
  ck(before.length===0,'skipping tracks while paused downloads nothing',String(before.length));
  /* press play — headless chromium has no audio device, so assert the ELEMENT
     took the source and the UI flipped, not that sound came out */
  await mpp.evaluate(()=>document.getElementById('mpPlay').click());
  await sleep(900);
  m=await mpp.evaluate(()=>window.TAPE.music());
  ck(/\/play\/audio\/.+\.mp3$/.test(m.src||''),'play loads a real track off the game folder',m.src||'none');
  ck(/PAUSE|M3 2h4/.test(await mpp.evaluate(()=>document.getElementById('mpPlay').innerHTML))
     ||(await mpp.evaluate(()=>document.getElementById('mpPlay').title))==='Pause',
     'and the button becomes a pause',await mpp.evaluate(()=>document.getElementById('mpPlay').title));
  const t1=m.track;
  await mpp.evaluate(()=>document.getElementById('mpNext').click());
  await sleep(500);
  m=await mpp.evaluate(()=>window.TAPE.music());
  ck(m.track!==t1,'next moves to another track',t1+' -> '+m.track);
  await mpp.evaluate(()=>document.getElementById('mpPrev').click());
  await sleep(400);
  ck((await mpp.evaluate(()=>window.TAPE.music())).track===t1,'and prev comes back');
  /* volume must actually reach the element, and survive a reload */
  await mpp.evaluate(()=>{const v=document.getElementById('mpVol');v.value=20;
    v.dispatchEvent(new Event('input'))});
  await sleep(200);
  ck((await mpp.evaluate(()=>window.TAPE.music())).vol===20,'the slider sets the real volume',
     String((await mpp.evaluate(()=>window.TAPE.music())).vol));
  await mpp.reload({waitUntil:'networkidle'});await sleep(500);
  ck((await mpp.evaluate(()=>document.getElementById('mpVol').value))==='20',
     'and it is remembered next visit');
  /* it must not sit on top of the walkthrough card */
  const clash=await mpp.evaluate(()=>{
    window.TAPE.coach(0);
    const a=document.getElementById('mp').getBoundingClientRect();
    const b=document.getElementById('ccard').getBoundingClientRect();
    return !(a.right<b.left||a.left>b.right||a.bottom<b.top||a.top>b.bottom);
  });
  ck(!clash,'it does not overlap the walkthrough card at 1440');
  await mpp.close();
  const sm=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  await sm.goto('http://127.0.0.1:8899/tape/?nocoach=1',{waitUntil:'networkidle'});
  await sleep(500);
  const box=await sm.evaluate(()=>{const r=document.getElementById('mp').getBoundingClientRect();
    return {w:Math.round(r.width),h:Math.round(r.height),right:Math.round(r.right),
      vol:getComputedStyle(document.getElementById('mpVol')).display}});
  ck(box.right<=390&&box.w<250,'it fits on a phone',JSON.stringify(box));
  ck(box.vol==='none','the volume slider drops out at 390 rather than squashing',box.vol);
  const clash2=await sm.evaluate(()=>{
    window.TAPE.coach(0);
    const a=document.getElementById('mp').getBoundingClientRect();
    const b=document.getElementById('ccard').getBoundingClientRect();
    return !(a.right<b.left||a.left>b.right||a.bottom<b.top||a.top>b.bottom);
  });
  ck(!clash2,'and does not overlap the walkthrough card at 390');
  ck(merr.length===0,'the player throws nothing',merr.slice(0,2).join(' | '));
  await sm.close();
}

console.log('\n— on a phone —');
const mp=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const merrs=[];mp.on('pageerror',e=>merrs.push(String(e)));
await mp.goto('http://127.0.0.1:8899/tape/',{waitUntil:'networkidle'});
await mp.evaluate(()=>localStorage.removeItem('bk_tape_coach'));
await mp.reload({waitUntil:'networkidle'});await sleep(2600);
await mp.evaluate(()=>window.TAPE.coach(1));   // the step that points at the rail
await sleep(400);
const railSeen=await mp.evaluate(()=>{const r=document.getElementById('rail');
  return r.getBoundingClientRect().left>=0&&r.classList.contains('spot')});
ck(railSeen,'on a phone the rail step opens the rail it is pointing at');
await mp.screenshot({path:'shot-tape-coach-390.png'});
await mp.evaluate(()=>window.TAPE.coachEnd());
await mp.evaluate(()=>{document.getElementById('tabQuery').click()});
await sleep(300);
ck((await mp.evaluate(()=>document.getElementById('qtext2').value)).trim().length>0,
   'the sample is there on a phone too');
/* it shipped CLIPPED once — grown while its pane was still hidden, so it measured
   one line and cut the last three off at 390px where the query wraps hardest */
const fit=async(pg,id)=>pg.evaluate(i=>{const t=document.getElementById(i);
  return {h:t.clientHeight,need:t.scrollHeight}},id);
let f=await fit(mp,'qtext2');
ck(f.h>=f.need-2,'and the whole query is readable, not clipped, at 390px',f.h+'px for '+f.need+'px');
f=await fit(p,'qtext2');
ck(f.h>=f.need-2,'and at 1440px',f.h+'px for '+f.need+'px');
await mp.screenshot({path:'shot-tape-390.png'});
ck(merrs.length===0,'no errors at 390px',merrs.slice(0,2).join(' | '));

/* the ONE expected 404 is the unknown table this file asks for on purpose */
const real=errs.filter(e=>!/404|Failed to load resource/i.test(e));
ck(errs.some(e=>/404/.test(e)),'the deliberate bad table really did 404');
ck(real.length===0,'no other console errors anywhere',real.slice(0,3).join(' | '));
await p.evaluate(()=>{document.getElementById('tabBuild').click();
  document.querySelector('[data-v="2"]').click()});
await sleep(1500);
await p.screenshot({path:'shot-tape.png'});
await p3.evaluate(async()=>{window.TAPE.setQuery(window.TAPE.sample());await window.TAPE.run()});
await sleep(1600);
await p3.evaluate(()=>window.TAPE.coach(4));await sleep(400);
await p3.screenshot({path:'shot-tape-coach.png'});
await p3.evaluate(()=>window.TAPE.coach(0));await sleep(400);
await p3.screenshot({path:'shot-tape-coach1.png'});
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));
if(fails.length)process.exit(1);

import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:8899/tape/',{waitUntil:'networkidle'});
await sleep(400);

// saved view: R2 thin stats joined to people
await p.evaluate(()=>document.querySelector('[data-v="2"]').click());
await sleep(1800);
let s=await p.evaluate(()=>({...window.TAPE.state(),
  txt:document.getElementById('qtext').value,
  first:[...document.querySelectorAll('tbody tr, table tr')][1]?.innerText.slice(0,90)}));
ck(s.rows>0,'saved view R2 returns rows',String(s.rows));
ck(s.joined.includes('people.name'),'the join brought in the readable column',s.joined.join(','));
ck(/where run=R2/.test(s.txt)&&/join people/.test(s.txt),'the builder wrote the query text',JSON.stringify(s.txt));
ck(/[A-Z]/.test(s.first||''),'a real name appears in the row',s.first);

// the dropdown: real values with counts
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

// typed query on the Query tab
await p.evaluate(()=>{document.getElementById('tabQuery').click();
  document.getElementById('qtext2').value='leagues where status=live';
  document.getElementById('runBtn2').click();});
await sleep(900);
s=await p.evaluate(()=>window.TAPE.state());
ck(s.Q.table==='leagues'&&s.rows===2,'typed query runs (2 live leagues)',s.Q.table+'/'+s.rows);

// empty-value filter
await p.evaluate(()=>{document.getElementById('qtext2').value='leagues where first_year=';
  document.getElementById('runBtn2').click();});
await sleep(600);
s=await p.evaluate(()=>window.TAPE.state());
ck(s.rows===11,'col= finds empty values (11 leagues have no first_year)',String(s.rows));
ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await p.evaluate(()=>{document.getElementById('tabBuild').click();
  document.querySelector('[data-v="2"]').click()});
await sleep(1500);
await p.screenshot({path:'shot-tape.png'});
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

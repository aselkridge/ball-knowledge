import pw from 'playwright';
const {chromium}=pw;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
async function go(fn,out,w,h){
  const pg=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await pg.goto('http://127.0.0.1:8899/tape/?nocoach=1',{waitUntil:'networkidle'});
  await pg.evaluate(()=>{localStorage.setItem('bk_tape_coach','1');
    localStorage.removeItem('bk_tape_export')});
  await pg.reload({waitUntil:'networkidle'});await sleep(500);
  await pg.evaluate(()=>{document.getElementById('tabQuery').click();
    document.getElementById('qtext2').value='facts count by confidence';
    document.getElementById('runBtn2').click()});
  await sleep(1400);
  if(fn)await fn(pg);
  await pg.screenshot({path:'shots/'+out});
  console.log('  '+out); await pg.close();
}
await go(null,'lock-bar.png',1000,300);
await go(async pg=>{await pg.evaluate(()=>document.getElementById('copy').click());
  await sleep(400)},'lock-ask.png',1000,520);
await b.close();

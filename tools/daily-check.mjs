/* THE DAILY FIVE STAMP — proof the calendar behaves. Serve docs/ on :8899. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>{localStorage.removeItem('bk_daily5');localStorage.setItem('bk_coach','0')});
await p.reload({waitUntil:'networkidle'});await sleep(900);

const fresh=await p.evaluate(()=>{const e=document.getElementById('dailyStamp');
  return {exists:!!e,done:e.classList.contains('done'),
    day:document.getElementById('dsDay').textContent,
    month:document.getElementById('dsMonth').textContent,
    today:String(new Date().getDate())};});
ck(fresh.exists,'the stamp exists on the main menu');
ck(!fresh.done,'a fresh day is NOT greyed out');
ck(fresh.day===fresh.today,'it shows today\'s real date',fresh.month+' '+fresh.day);

await p.evaluate(()=>document.getElementById('dailyStamp').click());
await sleep(300);
const after=await p.evaluate(()=>({done:document.getElementById('dailyStamp').classList.contains('done'),
  stored:localStorage.getItem('bk_daily5')}));
ck(after.done,'playing it greys the stamp and shows the check');
ck(/^\d{4}-\d{2}-\d{2}$/.test(after.stored||''),'today is stored as a date string',after.stored);

// survives a reload — the whole point of a daily
await p.reload({waitUntil:'networkidle'});await sleep(800);
const reload=await p.evaluate(()=>document.getElementById('dailyStamp').classList.contains('done'));
ck(reload,'still done after a reload');

// a NEW day re-arms it
await p.evaluate(()=>localStorage.setItem('bk_daily5','2020-01-01'));
await p.reload({waitUntil:'networkidle'});await sleep(800);
const rolled=await p.evaluate(()=>document.getElementById('dailyStamp').classList.contains('done'));
ck(!rolled,'a new day re-arms the stamp');
ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

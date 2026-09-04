/* THE OPENING, frame by frame, for the before/after comparison. Drives the
   real road from the matchup screen on whichever build is served on PORT
   (a git worktree for the BEFORE), shoots at fixed times, taps whichever
   card button the build has, buzzes, answers, and shoots the return.
   node tools/opening-frames.mjs <port> <phone|desk> <outdir> */
import pw from 'playwright';
import fs from 'fs';
const {chromium}=pw;
const [port,tag,out]=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});
const view=tag==='phone'?{width:390,height:844}:{width:1440,height:900};
const page=await (await b.newContext({viewport:view,deviceScaleFactor:1})).newPage();
await page.goto(`http://127.0.0.1:${port}/play/`,{waitUntil:'networkidle'});
await page.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_court','hardwood-a');localStorage.setItem('bk_coach_seen',JSON.stringify({tossupOffer:1}));});
await page.reload({waitUntil:'networkidle'});await sleep(900);
await page.evaluate(()=>{const c=document.querySelector('#coachTip .ct-ok');if(c)c.click();});
await page.evaluate(()=>{const C=window.BK.coach;C.cpu.on=true;C.cpu.team=1;C.cpu.level='rookie';
  window.BK._versus({league:'nba',decade:['FULL'],target:11,rosters:C.pickRosters('nba',['FULL'])},true);});
const t0=Date.now();
const at=async(ms,name)=>{const w=ms-(Date.now()-t0);if(w>0)await sleep(w);await page.screenshot({path:`${out}/${tag}-${name}.png`});};
await at(500,'01-matchup');await at(4200,'02-beat1');await at(6600,'03-beat2');await at(8200,'04-beat3');
await at(10200,'05-beat4');await at(11800,'06-beat5');await at(13600,'07-beat6');
/* the card, whichever build */
let up=false;for(let i=0;i<60&&!up;i++){up=await page.evaluate(()=>document.getElementById('tipveil').classList.contains('howing'));if(!up)await sleep(200);}
await page.screenshot({path:`${out}/${tag}-08-card.png`});
await page.evaluate(()=>{const g=document.getElementById('tipGo')||document.getElementById('tipReady');if(g)g.click();});
await sleep(1300);await page.screenshot({path:`${out}/${tag}-09-countdown.png`});
let armed=false;for(let i=0;i<50&&!armed;i++){armed=await page.evaluate(()=>!document.getElementById('tzA').classList.contains('lock')&&document.getElementById('tipQ').textContent.length>0);if(!armed)await sleep(200);}
await sleep(600);await page.screenshot({path:`${out}/${tag}-10-question.png`});
await page.evaluate(()=>{document.getElementById('tzA').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));});
await sleep(1100);await page.screenshot({path:`${out}/${tag}-11-buzzed.png`});
await page.evaluate(()=>{const q=window.BK._q;const btns=[...document.querySelectorAll('#tipAns button,#tipAns .ans')];(btns[q&&q.a!=null?q.a:0]||btns[0]).click();});
await sleep(1700);await page.screenshot({path:`${out}/${tag}-12-winner.png`});
await sleep(1100);await page.screenshot({path:`${out}/${tag}-13-return.png`});
await sleep(1500);await page.screenshot({path:`${out}/${tag}-14-play.png`});
await b.close();console.log(tag,'done');

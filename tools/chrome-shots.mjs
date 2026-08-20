/* In-game chrome before/after (V0 rows 18-19). Three moments on the phone:
   the action dock with the mode strip and banner up, a fresh event beat, and
   the free-moves dock. Same staging both runs. :8899, run from repo root. */
import pw from 'playwright';
import fs from 'fs';
const label=process.argv[2];
if(!['before','after'].includes(label)){console.error('usage: before|after');process.exit(1);}
const OUT='design/shots/chrome';fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});
for(const view of [{k:'phone',w:390,h:844,m:true},{k:'desk',w:1280,h:860}]){
  const ctx=await b.newContext({viewport:{width:view.w,height:view.h},hasTouch:!!view.m,isMobile:!!view.m});
  const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'});await sleep(1100);
  await p.evaluate(()=>{const B=window.BK,K=B.coach;
    K.applyColors({nm:'Showtime',ab:'SHO'},{nm:'The Bricks',ab:'BRK'});
    K.startGame({league:'nba',decade:'ANY',target:11,
      colors:[{nm:'Showtime',ab:'SHO'},{nm:'The Bricks',ab:'BRK'}],
      rosters:K.pickRosters('nba','ANY')},true);
    B._show('game');});
  await sleep(1800);
  /* 1 · your turn, carrier selected, the dock up */
  await p.evaluate(()=>{const B=window.BK,S=B.state();
    S.score=[7,4];const g=id=>document.getElementById(id);
    g('ptsA').textContent='7';g('ptsB').textContent='4';
    S.offense=0;S.phase='off-select';S.inbPending=null;S.selected=S.ball.holder;S.staged=null;
    B._offer();});
  await sleep(900);
  await p.screenshot({path:`${OUT}/${label}-${view.k}-action.png`});
  /* 2 · the free-moves dock */
  await p.evaluate(()=>{const B=window.BK,S=B.state();
    S.selected=null;S.staged=null;B._mb().setup=true;B._mb().moved={};
    S.phase='off-select';B._mbSetupStage();});
  await sleep(900);
  await p.screenshot({path:`${OUT}/${label}-${view.k}-setup.png`});
  console.log('  shot',label,view.k,errs.length?('ERRS '+errs[0]):'');
  await ctx.close();
}
await b.close();

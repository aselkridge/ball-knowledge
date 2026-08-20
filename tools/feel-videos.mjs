/* Motion before/after clips for the wave-1 feel comparison (B18).
   Records three short phone clips of the real game: a screen change, the
   turn dock appearing, and a banner change. Run with before|after; same
   staging both times. Serve docs/ on :8899, run from repo root. */
import pw from 'playwright';
import fs from 'fs';
const label=process.argv[2];
if(!['before','after'].includes(label)){console.error('usage: before|after');process.exit(1);}
const OUT='design/shots/feel';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});

async function clip(name,fn){
  const ctx=await b.newContext({viewport:{width:390,height:700},hasTouch:true,isMobile:true,
    recordVideo:{dir:OUT,size:{width:390,height:700}}});
  const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'});
  await sleep(1200);
  await fn(p);
  const v=p.video();
  await ctx.close();
  const path=await v.path();
  fs.renameSync(path,`${OUT}/${label}-${name}.webm`);
  console.log('  clip',`${label}-${name}`);
}

/* 1 · screen change: menu -> settings -> back */
await clip('screens',async p=>{
  await sleep(400);
  await p.evaluate(()=>window.BK._show('settings'));
  await sleep(900);
  await p.evaluate(()=>window.BK._show('title'));
  await sleep(900);
});

/* 2 · the dock arriving: boot a game, select the carrier, options appear */
await clip('dock',async p=>{
  await p.evaluate(()=>{const B=window.BK,K=B.coach;
    K.startGame({league:'nba',decade:'ANY',target:11,
      colors:[{nm:'Showtime',ab:'SHO'},{nm:'The Bricks',ab:'BRK'}],
      rosters:K.pickRosters('nba','ANY')},true);
    B._show('game');});
  await sleep(1700);
  await p.evaluate(()=>{const B=window.BK,S=B.state();
    S.offense=0;S.phase='off-select';S.inbPending=null;
    document.getElementById('stagebox').classList.remove('on');
    document.getElementById('stagebox').innerHTML='';});
  await sleep(700);
  await p.evaluate(()=>{const B=window.BK,S=B.state();
    S.selected=S.ball.holder;B._offer();});
  await sleep(1000);
  /* and the banner changing its sentence */
  await p.evaluate(()=>{window.BK._show('game');
    document.getElementById('bannerTxt').innerHTML='<b>Setup done.</b> Their defense · one slide.';});
  await sleep(300);
  await p.evaluate(()=>{
    const g=id=>document.getElementById(id);
    if(window.BKBanner){}
    g('bannerTxt').innerHTML='<b>Your ball.</b> Main action: move, pass, or shoot.';});
  await sleep(900);
});
await b.close();

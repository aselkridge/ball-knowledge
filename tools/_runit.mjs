import pw from 'playwright';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const p=await ctx.newPage();
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
await p.reload({waitUntil:'networkidle'});await sleep(1200);
await p.evaluate(()=>{const B=window.BK,K=B.coach;
 K.applyColors({nm:'Showtime',ab:'SHO'},{nm:'The Bricks',ab:'BRK'});
 K.startGame({league:'nba',decade:'ANY',target:11,rosters:K.pickRosters('nba','ANY')},true);B._show('game');});
await sleep(1700);
await p.evaluate(()=>{const B=window.BK,S=B.state();const C=B._cpu();C.on=true;C.team=1;C.level='pro';
 S.offense=1;S.selected=null;S.staged=null;B._mb().setup=false;B._mbRitual(1,'score',function(){});});
await sleep(1700);
console.log(JSON.stringify(await p.evaluate(()=>{
  const car=document.getElementById('mbCar');
  const cr=car?car.getBoundingClientRect():null;
  const cs=car?getComputedStyle(car):null;
  const gos=[...document.querySelectorAll('.mbc-go')].map(g=>{
    const r=g.getBoundingClientRect(),s=getComputedStyle(g);
    return {text:g.textContent.trim(),x:Math.round(r.x),y:Math.round(r.y),
      w:Math.round(r.width),h:Math.round(r.height),display:s.display,opacity:s.opacity,vis:s.visibility};
  });
  const card=document.querySelector('.mbcard');
  const kr=card?card.getBoundingClientRect():null;
  const tray=document.getElementById('mbTray');
  const tr=tray?tray.getBoundingClientRect():null;
  return {vh:innerHeight,vw:innerWidth,
    carousel:cr?{x:Math.round(cr.x),y:Math.round(cr.y),w:Math.round(cr.width),h:Math.round(cr.height),
      scrollW:car.scrollWidth,clientW:car.clientWidth,overflowX:cs.overflowX}:null,
    firstCard:kr?{y:Math.round(kr.y),h:Math.round(kr.height),bottom:Math.round(kr.bottom)}:null,
    tray:tr?{y:Math.round(tr.y),h:Math.round(tr.height),w:Math.round(tr.width)}:null,
    runIt:gos};
}),null,1));
await b.close();

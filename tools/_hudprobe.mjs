import pw from 'playwright';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});
for(const v of [{k:'phone',w:390,h:844,m:true},{k:'se',w:375,h:667,m:true},{k:'desk',w:1280,h:860}]){
const ctx=await b.newContext({viewport:{width:v.w,height:v.h},hasTouch:!!v.m,isMobile:!!v.m});
const p=await ctx.newPage();
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
await p.reload({waitUntil:'networkidle'});await sleep(1200);
await p.evaluate(()=>{const B=window.BK,K=B.coach;
 K.applyColors({nm:'Showtime',ab:'SHO'},{nm:'The Bricks',ab:'BRK'});
 K.startGame({league:'nba',decade:'ANY',target:11,rosters:K.pickRosters('nba','ANY')},true);B._show('game');});
await sleep(1500);
const r=await p.evaluate(()=>{const g=i=>document.getElementById(i);
 const bx=e=>{if(!e)return null;const q=e.getBoundingClientRect();
   return [Math.round(q.x),Math.round(q.y),Math.round(q.width),Math.round(q.height)]};
 return {hud:bx(g('hud')),sbDock:bx(g('sbDock')),hudMore:bx(g('hudMore')),
   art:bx(document.querySelector('#hud img.sbart')),
   ticker:bx(g('sbTicker')),tray:bx(g('hudTray')),
   moreFont:getComputedStyle(g('hudMore')).fontSize,
   dockGap:getComputedStyle(g('sbDock')).gap};});
console.log(v.k.padEnd(6),JSON.stringify(r));
await ctx.close();}
await b.close();

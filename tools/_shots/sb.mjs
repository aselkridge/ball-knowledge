import pw from 'playwright';
const {chromium}=pw;
const F='file:///home/user/ball-knowledge/tools/status-board/status-v3.html';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [tag,w,theme] of [['desk',1440,'dark'],['desk-l',1440,'light'],['ph',390,'dark']]){
  const ctx=await b.newContext({viewport:{width:w,height:1200},deviceScaleFactor:1.3,colorScheme:theme==='light'?'light':'dark'});
  const p=await ctx.newPage();
  p.on('console',m=>{if(m.type()==='error')console.log('ERR '+m.text())});
  p.on('pageerror',e=>console.log('PAGEERR '+e.message));
  await p.goto(F,{waitUntil:'networkidle'});
  await p.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
  await new Promise(r=>setTimeout(r,500));
  const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  console.log(tag,JSON.stringify(m),m.sw>m.cw+1?'!! H-SCROLL':'ok');
  for(const [n,y] of [['1',0],['2',1150],['3',2300]]){
    await p.evaluate(v=>window.scrollTo(0,v),y);await new Promise(r=>setTimeout(r,220));
    await p.screenshot({path:`sb-${tag}-${n}.png`});
  }
  // all details open
  await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
  await new Promise(r=>setTimeout(r,400));
  const m2=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  console.log('  all-open',JSON.stringify(m2),m2.sw>m2.cw+1?'!! H-SCROLL':'ok');
  await ctx.close();
}
await b.close();

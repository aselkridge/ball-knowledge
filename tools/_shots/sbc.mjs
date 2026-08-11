import pw from 'playwright';
const {chromium}=pw;
const F='file:///home/user/ball-knowledge/tools/status-board/status-v3.html';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1440,height:1100},deviceScaleFactor:1.3});
const p=await ctx.newPage();
p.on('pageerror',e=>console.log('PAGEERR '+e.message));
await p.goto(F,{waitUntil:'networkidle'});
// target the BUTTON, not any text node: "Expand all" also appears in the
// intro paragraph, and .first() was clicking the prose.
const btn=async(txt)=>{await p.locator(`.controls button:has-text("${txt}")`).first().click();await new Promise(r=>setTimeout(r,350));};
const vis=()=>p.evaluate(()=>({items:[...document.querySelectorAll('.item')].filter(e=>e.offsetParent!==null).length,
  open:[...document.querySelectorAll('details')].filter(d=>d.open).length}));
console.log('start      ',JSON.stringify(await vis()));
await btn('Expand all');  console.log('expand all ',JSON.stringify(await vis()));
await btn('Collapse all');console.log('collapse   ',JSON.stringify(await vis()));
await btn('Only your calls');console.log('your calls ',JSON.stringify(await vis()));
await btn('Only your calls');console.log('untoggled  ',JSON.stringify(await vis()));
await p.fill('input','legendary');await new Promise(r=>setTimeout(r,400));
console.log('filter     ',JSON.stringify(await vis()));
await p.fill('input','');await new Promise(r=>setTimeout(r,300));
// light theme, desk section
await p.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
await p.evaluate(()=>{const d=document.getElementById('desk');d&&d.scrollIntoView()});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:'sb-light-desk.png'});
await b.close();

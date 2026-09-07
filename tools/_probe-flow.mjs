import pw from 'playwright';
const {chromium}=pw;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
await ctx.addInitScript(()=>{window.__bkNoCine=1;localStorage.setItem('bk_coach','0');localStorage.setItem('bk_coach_seen',JSON.stringify({tipHow:1,tossupOffer:1,tuHow:1}));});
const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await p.goto('http://127.0.0.1:8899/play/?flow=local',{waitUntil:'networkidle'});
for(let i=0;i<8;i++){await sleep(1500);
 console.log(await p.evaluate(()=>{const tv=document.getElementById('tipveil');return {t:Date.now()%100000,on:!!(window.BKFLOW&&BKFLOW.on),mode:window.BKFLOW&&BKFLOW.mode,screen:[...document.querySelectorAll('.screen.on,[class*=screen].on')].map(e=>e.id).join(','),tip:tv.className,tipMsg:(document.getElementById('tipMsg')||{}).textContent,ans:document.querySelectorAll('#tipAns .ans').length,buzz:[...document.querySelectorAll('#tipveil button')].map(x=>x.id||x.className).slice(0,6).join('|'),phase:BK.state()&&BK.state().phase,cpu:BK.coach.cpu.on}}));
 if(i===3)await p.keyboard.press('a');
}
await p.screenshot({path:'/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/mock/probe.png'});
await b.close();

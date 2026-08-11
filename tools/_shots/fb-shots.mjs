import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
for(const theme of ['dark','light']){
  const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const p=await c.newPage(); await p.goto('http://localhost:8899/play/'); await p.waitForTimeout(900);
  if(theme==='light') await p.evaluate(()=>{document.body.classList.add('theme-whiteout')});
  await p.evaluate(()=>{BK._srRoll('nba');BK.coach.startGame()});
  await p.waitForTimeout(2600);
  await p.evaluate(()=>BKFeedback.open());
  await p.click('.fb-kind[data-k=bug]');
  await p.fill('#fbText','the shot meter popped when nobody was near me');
  await p.evaluate(()=>document.querySelector('.fb-ctx').open=true);
  await p.waitForTimeout(300);
  const cls=await p.evaluate(()=>document.body.className);
  console.log(theme,'body class:',JSON.stringify(cls));
  await p.screenshot({path:`${SP}/art/fb-${theme}.png`});
  await c.close();
}
await b.close();

import {chromium} from 'playwright';
const SP=process.argv[2];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
const c=await b.newContext({viewport:{width:430,height:900},deviceScaleFactor:2});
const p=await c.newPage(); await p.goto('file:///home/user/ball-knowledge/docs/dev/daily-theatre.html');
await p.waitForTimeout(600);
// mid-splash: catch the pow on screen
await p.evaluate(()=>BKTheatre.make()); await p.waitForTimeout(700);
await p.locator('.phone').screenshot({path:`${SP}/tht-splash.png`});
await p.waitForTimeout(900);
await p.evaluate(()=>{BKTheatre.reset();BKTheatre.round2()}); await p.waitForTimeout(600);
await p.locator('.phone').screenshot({path:`${SP}/tht-defense.png`});
await p.evaluate(()=>{BKTheatre.reset();BKTheatre.ending(2)}); await p.waitForTimeout(1000);
await p.locator('.phone').screenshot({path:`${SP}/tht-roof.png`});
await b.close();

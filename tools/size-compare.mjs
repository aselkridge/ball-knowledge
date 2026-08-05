/* Before/after for "this text is too small" — Aaron, 08-05, three places on
 * Pick Your Roster plus the boombox on desktop.
 * BEFORE is minted from git, never from the working copy. */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const REF=process.env.REF||'HEAD', OUT=process.env.OUT||'docs/dev/size';
fs.mkdirSync(OUT,{recursive:true});
const TMP='docs/play/_before.html';
fs.writeFileSync(TMP,execSync(`git show ${REF}:docs/play/index.html`,{encoding:'utf8'}));

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--mute-audio']});
const rows=[];
for(const [tag,w,h] of [['desktop',1440,900],['wide',1920,1080],['phone',390,844]]){
  for(const [side,file] of [['before',TMP],['after','index.html']]){
    const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
    await p.goto('http://127.0.0.1:8899/play/'+(side==='before'?'_before.html':''),
                 {waitUntil:'networkidle'});
    await p.waitForTimeout(1300);
    /* DEAL A ROSTER, don't just open the screen. The first version showed
       'squad' directly and shot an EMPTY board -- no cards, no shuffle pips,
       no odds line, i.e. none of the three things this change is about. The
       computed font sizes were still right, which is exactly why a number can
       agree with you while the picture shows nothing. */
    /* DEAL A ROSTER, don't just open the screen. The first version showed
       'squad' directly and shot an EMPTY board -- no cards, no shuffle pips,
       no odds line, i.e. none of the three things this change is about. The
       computed font sizes were still correct, which is exactly how a number
       agrees with you while the picture shows nothing. */
    await p.evaluate(()=>{window.BK._show('squad');window.BK._srRoll('nba');});
    await p.waitForTimeout(1100);
    const dealt=await p.evaluate(()=>(document.getElementById('srFive')||{children:[]}).children.length);
    if(!dealt)console.log('  !! '+tag+'/'+side+' dealt no cards');
    const m=await p.evaluate(()=>{
      const px=s=>{const e=document.querySelector(s);return e?Math.round(parseFloat(getComputedStyle(e).fontSize)):null};
      const bb=document.getElementById('boombox').getBoundingClientRect();
      return {pips:px('.sr-pips'),tap:px('.sr-tap'),odds:px('.sr-odds'),
              bbW:Math.round(bb.width),bbH:Math.round(bb.height)};
    });
    rows.push(`${tag}/${side}  pips ${m.pips}px · tap ${m.tap}px · odds ${m.odds}px · boombox ${m.bbW}x${m.bbH}`);
    await p.screenshot({path:`${OUT}/${tag}-${side}.png`});
    await c.close();
  }
}
await b.close();
fs.unlinkSync(TMP);
console.log(rows.join('\n'));

/* BEFORE/AFTER for the six small HUD controls. Aaron, 2026-08-04: "Can I see the
   before and after please". Same rule as tape-compare.mjs — the baseline is
   minted out of git, never from a working copy. */
import pw from 'playwright';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const REF=process.env.BEFORE_REF||'HEAD';
fs.mkdirSync('docs/play/_before',{recursive:true});
for(const f of ['index.html','game.js','daily.js','questions.js','players.js']){
  try{fs.writeFileSync('docs/play/_before/'+f,
    execSync(`git show ${REF}:docs/play/${f}`,{encoding:'utf8'}))}catch(e){}
}
/* the _before copy sits one level deeper, so its relative asset paths need a hop */
let h=fs.readFileSync('docs/play/_before/index.html','utf8')
  .replace(/(["'(])(assets\/|data\/)/g,'$1../$2');
fs.writeFileSync('docs/play/_before/index.html',h);
console.log(`  before = ${execSync(`git rev-parse --short ${REF}`,{encoding:'utf8'}).trim()}`);

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});

async function shot(dir,out){
  const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(String(e).slice(0,100)));
  await pg.goto('http://127.0.0.1:8899'+dir,{waitUntil:'networkidle'});
  await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await pg.reload({waitUntil:'networkidle'});await sleep(1400);
  await pg.evaluate(()=>{try{window.BK._show('game')}catch(e){}});
  await sleep(1400);
  /* FIVE OF THE SIX LIVE BEHIND THE ⋯, so a shot with the tray shut shows one
     button changing by six pixels and hides the actual change. Open it. */
  await pg.evaluate(()=>{const m=document.getElementById('hudMore');if(m)m.click()});
  await sleep(600);
  /* MEASURE, do not eyeball. The drawn box of every control on the screen. */
  const m=await pg.evaluate(()=>{
    const el=document.getElementById('screen-game');
    const ctl=[...el.querySelectorAll('button,[role="button"],a[href]')]
      .map(n=>{const r=n.getBoundingClientRect();
        return {id:n.id||n.className||n.tagName,w:Math.round(r.width),h:Math.round(r.height)}})
      .filter(x=>x.w>0&&x.h>0);
    return {small:ctl.filter(x=>x.w<28||x.h<28),total:ctl.length};
  });
  await pg.screenshot({path:'shots/'+out,clip:{x:0,y:0,width:390,height:330}});
  console.log(`  ${out}  ${m.small.length} of ${m.total} controls under 28px`);
  m.small.forEach(x=>console.log(`      ${x.w}x${x.h}  ${String(x.id).slice(0,40)}`));
  await pg.close();
  return m;
}
const before=await shot('/play/_before/','hud-before-390.png');
const after=await shot('/play/','hud-after-390.png');
fs.rmSync('docs/play/_before',{recursive:true,force:true});
await b.close();
console.log(`\n  small controls: ${before.small.length} -> ${after.small.length}`);

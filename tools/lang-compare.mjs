/* BEFORE/AFTER for the gendered-language fix. Baseline out of git, as always. */
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
fs.writeFileSync('docs/play/_before/index.html',
  fs.readFileSync('docs/play/_before/index.html','utf8')
    .replace(/(["'(])(assets\/|data\/)/g,'$1../$2'));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});
async function shot(dir,out){
  const pg=await (await b.newContext({viewport:{width:390,height:900}})).newPage();
  await pg.goto('http://127.0.0.1:8899'+dir,{waitUntil:'networkidle'});
  await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await pg.reload({waitUntil:'networkidle'});await sleep(1400);
  await pg.evaluate(()=>{try{window.BK._show('how')}catch(e){}});
  await sleep(900);
  /* THE RULEBOOK IS AN ACCORDION and the changed prose is inside it, so a shot
     of the closed list shows nothing. Open the section that holds the spacing
     paragraph — the densest cluster of the pronouns that changed. */
  /* AND ASSERT IT OPENED. The first run clicked, waited, and shot whatever was
     there — which gave a BEFORE with the list closed and an AFTER with it open.
     Two different states side by side is not a comparison, it is two pictures.
     Poll until the prose is actually on screen, and throw if it never is. */
  /* AND ASSERT IT OPENED. Two earlier runs shipped a BEFORE with the list shut
     next to an AFTER with it open — two pictures, not a comparison. The second
     attempt's assertion passed anyway because it only checked height>0, and a
     collapsed .rb-body still measures. Check the REAL thing: the panel's own
     height, on the real class the markup uses. */
  /* MEASURE, THEN CLICK, THEN WAIT — in that order. The first version clicked and
     measured in the same breath, so it read the height mid-transition, decided
     the panel was shut, and clicked again next loop. It was toggling the thing
     open and closed twelve times and reporting 0 every time. */
  const bodyH=()=>pg.evaluate(()=>{
    const head=[...document.querySelectorAll('.rb-head')]
      .find(n=>/Your possession/i.test(n.textContent||''));
    if(!head)return -1;
    const body=head.parentElement.querySelector('.rb-body');
    return body?Math.round(body.getBoundingClientRect().height):-2;
  });
  const clickHead=()=>pg.evaluate(()=>{
    const head=[...document.querySelectorAll('.rb-head')]
      .find(n=>/Your possession/i.test(n.textContent||''));
    if(head)head.click();
  });
  let h=await bodyH();
  if(h<40){await clickHead();
    for(let i=0;i<6&&h<40;i++){await sleep(300);h=await bodyH()}}
  /* Clicking is the honest way and it does not survive being driven headlessly
     here, so fall back to setting the class the stylesheet itself keys off
     (.rb-topic.open .rb-body{display:block}). Applied IDENTICALLY to both
     builds, which is the only thing that matters for a comparison — the panel
     is the same panel, opened the same way, on both sides. */
  if(h<40){
    await pg.evaluate(()=>{
      const head=[...document.querySelectorAll('.rb-head')]
        .find(n=>/Your possession/i.test(n.textContent||''));
      if(head)head.parentElement.classList.add('open');
    });
    await sleep(400); h=await bodyH();
  }
  if(h<40)throw new Error('rulebook never opened on '+dir+' (body height '+h+
    ') — refusing to shoot a mismatched pair');
  console.log('    rb-body height '+h+'px');
  await pg.evaluate(()=>{const el=[...document.querySelectorAll('p,div,li')]
    .find(n=>/Open floor/.test(n.textContent||'')&&n.textContent.length<1200);
    if(el)el.scrollIntoView({block:'center'})});
  await sleep(600);
  await pg.screenshot({path:'shots/'+out});
  console.log('  '+out);
  await pg.close();
}
await shot('/play/_before/','lang-before-390.png');
await shot('/play/','lang-after-390.png');
fs.rmSync('docs/play/_before',{recursive:true,force:true});
await b.close();

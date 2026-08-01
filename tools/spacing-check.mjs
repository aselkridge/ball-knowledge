import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>localStorage.setItem('bk_coach','0'));
await p.reload({waitUntil:'networkidle'});
await p.mouse.click(700,850); await sleep(700);

const d=await p.evaluate(()=>window.BK._cfg().spacing);
ck(d==='open','defaults to OPEN FLOOR',d);

// the rule: which neighbours guard, in each mode
const g=await p.evaluate(()=>{
  const G=window.BK._guards, C=window.BK._cfg();
  const probe=()=>({ square:G(5,4,5,5), diag:G(5,4,6,5), far:G(5,4,8,8) });
  C.spacing='open';   const open=probe();
  C.spacing='locked'; const locked=probe();
  C.spacing='open';
  return {open,locked};
});
ck(g.open.square&&!g.open.diag,'OPEN FLOOR: square-on guards, diagonal does NOT',JSON.stringify(g.open));
ck(g.locked.square&&g.locked.diag,'LOCKED UP: both guard',JSON.stringify(g.locked));
ck(!g.open.far&&!g.locked.far,'a distant defender never guards');

// screens must be untouched by the toggle
const scr=await p.evaluate(()=>{
  const K=window.BK.coach;
  K.applyColors({nm:'You',ab:'YOU'},{nm:'Them',ab:'THM'});
  K.startGame({league:'nba',decade:'ANY',target:11,rosters:K.pickRosters('nba','ANY')},true);
  const S=window.BK.state(), off=S.offense, h=S.ball.holder;
  const offs=S.pieces.map((x,i)=>i).filter(i=>S.pieces[i].team===off);
  const defs=S.pieces.map((x,i)=>i).filter(i=>S.pieces[i].team!==off);
  offs.forEach((i,n)=>{if(i!==h)window.BK._set(i,1,n)});
  defs.forEach((i,n)=>window.BK._set(i,14,n));
  window.BK._set(offs.find(i=>i!==h),1,1);
  window.BK._set(defs[0],2,2);            // DIAGONAL to that off-ball body
  const C=window.BK._cfg();
  C.spacing='open';   const o=Object.keys(window.BK._screened(off)).length;
  C.spacing='locked'; const l=Object.keys(window.BK._screened(off)).length;
  C.spacing='open';
  return {open:o,locked:l};
});
ck(scr.open===scr.locked&&scr.open>0,'screens are IDENTICAL in both modes (a body is a body)',JSON.stringify(scr));

// the picker exists and drives the config
await p.evaluate(()=>window.BK.coach.show('rules'));
await sleep(400);
const ui=await p.evaluate(()=>{
  const bs=[...document.querySelectorAll('#spModes .klmode')];
  const sel=bs.find(b=>b.classList.contains('sel'));
  bs.find(b=>b.dataset.sp==='locked').click();
  return {n:bs.length,defaultSel:sel&&sel.dataset.sp,after:window.BK._cfg().spacing,
          labels:bs.map(b=>b.firstChild.textContent)};
});
ck(ui.n===2,'two named choices on the House Rules screen',ui.labels.join(' / '));
ck(ui.defaultSel==='open','Open floor is pre-selected',String(ui.defaultSel));
ck(ui.after==='locked','tapping a choice changes the rule',ui.after);
const h=await p.evaluate(()=>window.BK._house?window.BK._house().spacing:null);
ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

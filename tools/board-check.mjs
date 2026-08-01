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
await p.mouse.click(700,850); await sleep(600);
await p.evaluate(()=>{const K=window.BK.coach;
  K.applyColors({nm:'You',ab:'YOU'},{nm:'Them',ab:'THM'});
  K.startGame({league:'nba',decade:'ANY',target:11,rosters:K.pickRosters('nba','ANY')},true);
  K.show('game');});
await sleep(1200);
// park a defender next to an offensive off-ball body so a screen definitely exists
const marks=await p.evaluate(()=>{
  const S=window.BK.state(), off=S.offense;
  const idx=S.pieces.map((p,i)=>i);
  const offs=idx.filter(i=>S.pieces[i].team===off);
  const defs=idx.filter(i=>S.pieces[i].team!==off);
  const h=S.ball.holder;
  /* isolate everything: only the pairs under test are near each other, so a
     stray neighbour cannot manufacture a screen and hide the result */
  offs.forEach((i,n)=>{ if(i!==h) window.BK._set(i, 1, n); });
  defs.forEach((i,n)=>window.BK._set(i, 14, n));
  window.BK._set(h, 7, 4);
  const offBall=offs.find(i=>i!==h);
  window.BK._set(offBall, 1, 1);
  window.BK._set(defs[0], 2, 1);              // beside an OFF-BALL body -> screened
  S.selected=h;
  /* "only a defender BETWEEN YOU AND THE RIM contests" -- which side that is
     depends on which basket this team attacks, so try all four and keep the
     one the engine actually calls a contest */
  let got=null;
  for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
    window.BK._set(defs[1], 7+dc, 4+dr);
    const m=window.BK._defMarks();
    if(m[defs[1]]&&m[defs[1]]!=='screened'){got=m;break;}
  }
  return got||window.BK._defMarks();
});
console.log('  marks:',JSON.stringify(marks));
const vals=Object.values(marks);
ck(vals.includes('screened'),'a screened defender is detected',vals.join(','));
ck(vals.includes('contest')||vals.includes('gate'),'a contesting/gating defender is detected',vals.join(','));
ck(new Set(vals).size>=2,'the states are distinct, not one bucket',[...new Set(vals)].join(','));
await sleep(700);
await p.screenshot({path:'shot-board.png'});
const el=await p.$('#court, canvas');
if(el)await el.screenshot({path:'shot-court.png'});
ck(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

/* METHOD B screenshots: the ritual and the beat, desktop + phone.
   Serve docs/ on :8899, run from repo root. Frames land in the scratchpad. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=process.argv[2]||'.';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});

for(const [tag,w,h] of [['desk',1440,900],['phone',390,844]]){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0');
    localStorage.setItem('bk_methodb','1')});
  await p.reload({waitUntil:'networkidle'});await sleep(900);
  await p.evaluate(()=>{const C=window.BK.coach;C.show('game');
    C.startGame({league:'nba',decade:['FULL'],target:11,rosters:C.pickRosters('nba',['FULL'])},true)});
  await sleep(500);
  await p.evaluate(()=>window.BK._inbound(1,'R','<b>BUCKET!</b> Fresh trip.'));
  await sleep(400);
  await p.screenshot({path:`${OUT}/mb-${tag}-1-defmenu.png`});
  await p.click('#stagebox [data-mb="DIAMOND PRESS"]');
  await sleep(900);
  await p.screenshot({path:`${OUT}/mb-${tag}-2-offmenu.png`});
  await p.click('#stagebox [data-mb="HORNS"]');
  await sleep(1200);
  await p.screenshot({path:`${OUT}/mb-${tag}-3-shapes.png`});
  /* pass it in to the nearest teammate, then the free setup */
  await p.evaluate(()=>{
    const st=window.BK.state();const hp=st.pieces[st.ball.holder];
    let best=-1,bd=1e9;
    st.pieces.forEach((q,i)=>{if(q.team!==st.offense||i===st.ball.holder)return;
      const d=Math.max(Math.abs(q.c-hp.c),Math.abs(q.r-hp.r));if(d<bd){bd=d;best=i}});
    st.selected=st.ball.holder;st.staged={kind:'pass',toIdx:best};window.BK._commit();
  });
  await sleep(1600);
  await p.screenshot({path:`${OUT}/mb-${tag}-4-setup.png`});
  await p.close();
}
await b.close();
console.log('shots done');

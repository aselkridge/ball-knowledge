/* Prove the soundtrack actually follows the moment — in a real browser, on the
   real files. Every assertion reads what the audio engine says is PLAYING, not
   what the code intended. */
import pw from 'playwright';
const {chromium}=pw;
/* Run: start a static server on docs/ at :8899, then node tools/music-check.mjs */

const BASE='http://127.0.0.1:8899';
const fails=[];
function check(cond,msg,extra){
  console.log((cond?'  PASS  ':'  FAIL  ')+msg+(extra?'   ['+extra+']':''));
  if(!cond)fails.push(msg);
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const browser=await chromium.launch({
  executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});

async function open(w,h){
  const ctx=await browser.newContext({viewport:{width:w,height:h}});
  const page=await ctx.newPage();
  const errs=[];
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push(String(e)));
  return {ctx,page,errs};
}

/* the engine's own answer to "what is playing right now" */
const now=p=>p.evaluate(()=>{
  const s=window.BKAudio.mpState();
  return {name:s.name,playing:s.playing,broken:s.broken,manual:s.manual,
          want:window.BK._musicWant(),mood:window.BK._endMood()};
});
const settle=async p=>{await sleep(500);return now(p)};

console.log('THE GAME — does the song follow the moment?\n');
{
  const {page,errs}=await open(1440,900);
  await page.goto(BASE+'/play/',{waitUntil:'networkidle'});
  await page.mouse.click(700,850);            /* the tap that unlocks audio */
  await sleep(900);

  let s=await now(page);
  check(!s.broken,'the eight audio files load (nothing 404s)');
  check(s.name==='Grounded'&&s.playing,'menu  -> Grounded is PLAYING',s.name+' playing='+s.playing);

  /* a real game, so every later state is the real thing and not a stub */
  await page.evaluate(()=>{const K=window.BK.coach;
    K.applyColors({nm:'You',ab:'YOU'},{nm:'Them',ab:'THM'});
    K.startGame({league:'big3',decade:'ANY',target:11,
                 rosters:K.pickRosters('big3','ANY')},true);
    K.show('game');});
  s=await settle(page);
  check(s.name==='Mole Soul'&&s.playing,'game  -> Mole Soul',s.name);

  /* pause — veil only, no music call anywhere: the observer has to catch it */
  await page.evaluate(()=>document.getElementById('pauseveil').classList.add('on'));
  s=await settle(page);
  check(s.name==='Soul Up'&&s.playing,'pause -> Soul Up (via the class observer)',s.name);

  await page.evaluate(()=>document.getElementById('pauseveil').classList.remove('on'));
  s=await settle(page);
  check(s.name==='Mole Soul','resume -> back to Mole Soul',s.name);

  /* a drill, on the same game screen — must beat the game track */
  await page.evaluate(()=>{window.BK.coach.drill.on=true;window.BK.coach.show('game')});
  s=await settle(page);
  check(s.name==='Irony','drill -> Irony (beats the game track on the same screen)',s.name);
  await page.evaluate(()=>{window.BK.coach.drill.on=false});

  /* the final buzzer, both ways, through the REAL endShow */
  await page.evaluate(()=>{window.BK.coach.cpu.on=true;window.BK.coach.cpu.team=1;
                           window.BK._endShow(0,'test')});          /* human=0 wins */
  s=await settle(page);
  check(s.mood==='win'&&s.name==='Sum of the All','you win  -> Sum of the All',s.name+'/'+s.mood);

  await page.evaluate(()=>{document.getElementById('endveil').classList.remove('on');
                           window.BK._endShow(1,'test')});          /* human=0 loses */
  s=await settle(page);
  check(s.mood==='lose'&&s.name==='Sad Soul','you lose -> Sad Soul',s.name+'/'+s.mood);

  /* hot-seat 1v1: nobody at this phone lost, so never Sad Soul */
  await page.evaluate(()=>{document.getElementById('endveil').classList.remove('on');
                           window.BK.coach.cpu.on=false;window.BK.coach.net.on=false;
                           window.BK._endShow(1,'test')});
  s=await settle(page);
  check(s.mood==='win','hot-seat 1v1 -> the winner is in the room, so it is a win',s.mood);

  await page.evaluate(()=>document.getElementById('endveil').classList.remove('on'));

  /* a hand-picked track must survive every screen change */
  await page.evaluate(()=>{window.BKAudio.mpCycle(1);window.BKAudio.mpCycle(1)});
  const picked=(await settle(page)).name;
  await page.evaluate(()=>{window.BK.coach.show('title');window.BK.coach.show('game')});
  s=await settle(page);
  check(s.manual&&s.name===picked,'hand-picked track survives screen changes',picked+' -> '+s.name);

  await page.evaluate(()=>{window.BKAudio.set('music',false);window.BKAudio.set('music',true)});
  s=await settle(page);
  check(!s.manual,'toggling the note off/on hands the wheel back to the game','manual='+s.manual);

  /* every one of the eight is reachable in the boombox */
  const seen=[];
  for(let i=0;i<8;i++){
    await page.evaluate(()=>window.BKAudio.mpCycle(1));
    seen.push((await now(page)).name);
  }
  check(new Set(seen).size===8,'all eight tracks reachable in the player',seen.join(', '));

  check(errs.length===0,'no console errors',errs.slice(0,2).join(' | '));

  await page.evaluate(()=>{window.BKAudio.set('music',false);window.BKAudio.set('music',true);
                           window.BK.coach.show('title')});
  await sleep(700);
  await page.screenshot({path:'shot-game-desktop.png'});
  await page.context().close();
}

console.log('\nTHE VOTE PAGE — 8 tracks off the shared folder');
for(const [label,w,h] of [['desktop',1440,900],['mobile',390,844]]){
  const {page,errs}=await open(w,h);
  const bad=[];
  page.on('response',r=>{if(r.url().includes('/audio/')&&r.status()>=400)bad.push(r.url())});
  await page.goto(BASE+'/vote/',{waitUntil:'networkidle'});
  await sleep(1200);
  const m=await page.evaluate(()=>{
    const t=document.querySelectorAll('.track');
    const n=document.querySelector('.name'),b=document.querySelector('.play');
    return {tracks:t.length,
            name:getComputedStyle(n).fontSize,btn:getComputedStyle(b).width,
            overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
            durs:[...document.querySelectorAll('.time span:last-child')].map(e=>e.textContent)};
  });
  check(m.tracks===8,label+': 8 tracks on the page',String(m.tracks));
  check(m.overflow<=0,label+': no horizontal overflow',m.overflow+'px');
  const gotDur=m.durs.filter(d=>/^\d+:\d\d$/.test(d)).length;
  check(gotDur===8,label+': all 8 files resolve (durations read off the real mp3s)',
        gotDur+'/8 '+m.durs.join(' '));
  check(bad.length===0,label+': no audio 404s',bad.join(','));
  console.log('         title '+m.name+' · play button '+m.btn);
  await page.screenshot({path:'shot-vote-'+label+'.png',fullPage:label==='mobile'});
  await page.context().close();
}

await browser.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));
process.exit(fails.length?1:0);

/* B3 · THE INVITE LINK. Serve docs/ on :8899 first.
 *
 * The relay is not running in here, so this tests everything up to the dial and
 * not the room itself: the URL that gets built, the pass riding in it, what a
 * tapped link does to the client, and what a malformed one does NOT do.
 * The join handshake itself is the relay's job and is covered by playing it.
 */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const BASE='http://127.0.0.1:8899/play/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--mute-audio']});

async function boot(url,pass){
  const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const p=await c.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(BASE);
  await p.evaluate(k=>{localStorage.clear();localStorage.setItem('bk_coach','0');
    if(k)localStorage.setItem('bk_pass',k)},pass||null);
  await p.goto(url,{waitUntil:'networkidle'});
  await sleep(1900);
  return {p,c,errs};
}

/* ---- 1 · the URL the host sends ---------------------------------------- */
{
  const {p,errs}=await boot(BASE,'LETMEIN');
  const withPass=await p.evaluate(()=>BK._invite('ABCD'));
  ck(/\?join=ABCD&k=LETMEIN$/.test(withPass),
     'the link carries the room code AND the pass, so nobody types either',withPass);
  ck(withPass.startsWith('http://127.0.0.1:8899/play/'),
     'and it points at the real game, not a relative path',withPass.slice(0,34));
  const noPass=await p.evaluate(()=>{localStorage.removeItem('bk_pass');return BK._invite('WXYZ')});
  ck(/\?join=WXYZ$/.test(noPass)&&!/k=/.test(noPass),
     'with the gate off it carries no key at all, rather than an empty one',noPass);
  ck(errs.length===0,'no page errors building it',errs.slice(0,1).join(''));
  await p.context().close();
}

/* ---- 2 · what a tapped link does --------------------------------------- */
{
  const {p,errs}=await boot(BASE+'?join=abcd&k=SECRET');
  const st=await p.evaluate(()=>({
    online:document.getElementById('screen-online').classList.contains('on'),
    title:document.getElementById('screen-title').classList.contains('on')||
          document.getElementById('screen-title2').classList.contains('on'),
    pass:localStorage.getItem('bk_pass'),
    status:(document.getElementById('oStatus')||{}).textContent||''}));
  ck(st.online&&!st.title,'a tapped invite lands on the online screen, not the menu');
  ck(st.pass==='SECRET','the pass is STORED, so reconnects and refreshes work too',st.pass);
  /* NOT a test for my wording. netDial replaces the first line with its own
     live countdown ("Calling the arena... 1s"), which is better copy for
     somebody staring at a cold server than anything static. The thing that
     matters is that the screen is never SILENT while a tapped link is
     dialling, so that is what is asserted. */
  ck(st.status.trim().length>6,
     'and the screen is never silent while it dials',st.status.slice(0,44));
  ck(errs.length===0,'no page errors on the invite path',errs.slice(0,1).join(''));
  await p.context().close();
}
/* lowercase in the URL must still work: people retype links badly */
{
  const {p}=await boot(BASE+'?join=WxYz');
  ck(await p.evaluate(()=>document.getElementById('screen-online').classList.contains('on')),
     'the code is case insensitive, because a hand typed link will be mixed');
  await p.context().close();
}

/* ---- 3 · BREAK IT ------------------------------------------------------- */
for (const bad of ['?join=ABC','?join=ABCDE','?join=12$4','?join=','?k=SECRET']) {
  const {p}=await boot(BASE+bad);
  const st=await p.evaluate(()=>({
    online:document.getElementById('screen-online').classList.contains('on'),
    menu:document.getElementById('screen-title').classList.contains('on')||
         document.getElementById('screen-title2').classList.contains('on')}));
  ck(!st.online&&st.menu,`BREAK · ${bad||'(nothing)'} lands on the menu and dials nobody`);
  await p.context().close();
}
/* a key with no room must not quietly grant access */
{
  const {p}=await boot(BASE+'?k=SNEAKY');
  ck(await p.evaluate(()=>localStorage.getItem('bk_pass'))===null,
     'BREAK · a key with no room code is NOT stored',
     String(await p.evaluate(()=>localStorage.getItem('bk_pass'))));
  await p.context().close();
}

/* ---- 4 · the share button ---------------------------------------------- */
{
  const {p}=await boot(BASE,'LETMEIN');
  const shared=await p.evaluate(async()=>{
    let got=null;
    navigator.share=function(o){got=o;return Promise.resolve()};
    const cp=document.getElementById('frCopy');
    cp.dataset.code='QRST';cp.dataset.label='send';
    cp.click();
    await new Promise(r=>setTimeout(r,60));
    return {url:got&&got.url,text:got&&got.text,label:cp.textContent};
  });
  ck(/\?join=QRST&k=LETMEIN$/.test(shared.url||''),
     'the button shares the LINK, not the four letters',String(shared.url));
  ck(/Sent/.test(shared.label||''),'and it confirms it went',shared.label);
  await p.context().close();
}

console.log('\n  '+(fails.length?fails.length+' FAILED':'ALL CHECKS PASS'));
fails.forEach(f=>console.log('   - '+f));
await b.close();
process.exit(fails.length?1:0);

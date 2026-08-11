/* THE COACH'S EXIT ASKS FIRST, AND SAYS WHERE THE HELP WENT.
 *
 * Aaron, 2026-08-11: "If a person skips, make a pop-up appear that says
 * 'Skip remaining tips?' and sublettering, 'You can reference the rulebook in
 * the pause menu or turn coach back on.'"
 *
 * The copy makes two promises about the pause menu, so this checks the PAUSE
 * MENU, not just the words. A reassurance that points at a door which is not
 * there is worse than no reassurance: it spends the player's trust and then
 * strands them.
 */
import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--mute-audio']});
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const sec=t=>console.log('\n'+t);

async function fresh(w=390,h=844){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>localStorage.clear());
  await p.reload({waitUntil:'networkidle'});
  await p.waitForTimeout(1000);
  return p;
}
/* Raise a real tip through the real API, INSIDE A REAL GAME.
 *
 * Two wrong setups came before this one, and both looked like product bugs:
 *   1. On the MAIN MENU the tip vanished on its own. The D25 janitor reaps any
 *      modal pause-card while the game screen is down, which is exactly the
 *      zombie tester #1 saw parked over the menu for four minutes. The janitor
 *      was right; the harness was raising an illegitimate card.
 *   2. In a DRILL no card appeared at all. tipShow returns early while
 *      drill.on, by design, so the drill's panel is the only coach on screen.
 * A real game is the one condition where a tip legitimately exists, so that is
 * what the harness sets up. */
let probeN=0;
const raiseTip=async p=>{
  await p.evaluate(()=>{
    if(document.getElementById('screen-game').classList.contains('on'))return;
    const K=window.BK.coach;
    K.startGame({league:'big3',decade:'ANY',target:11,
                 rosters:K.pickRosters('big3','ANY')},true);
    K.show('game');
  });
  await p.waitForTimeout(700);
  /* A DRILL WILL NOT DO. tipShow returns early while drill.on, by design, so
     the drill's own panel is the only coach on screen. The first version of
     this harness raised the probe in a drill and got no card at all.
     A real game is the condition a tip actually exists in.
     Each probe needs a fresh key too: tips are seen-once, so reusing one key
     silently no-ops the second call and the test reads as a vanished card. */
  await p.evaluate(n=>{
    window.BKCoach.tip('probe'+n,'<b>Probe.</b> A tip so the exit exists.',true);
  },++probeN);
};

sec('THE COPY IS EXACTLY WHAT AARON WROTE');
{
  const p=await fresh();
  const t=await p.evaluate(()=>{
    const v=document.getElementById('skipveil');
    return {h:v.querySelector('h3').textContent.trim(),
            s:v.querySelector('p').textContent.trim(),
            yes:v.querySelector('#skipYes').textContent.trim(),
            no:v.querySelector('#skipNo').textContent.trim()};
  });
  ck(t.h==='Skip remaining tips?','the heading is his, verbatim',t.h);
  ck(t.s==='You can reference the rulebook in the pause menu or turn coach back on.',
     'the sublettering is his, verbatim',t.s);
  ck(!/[—]/.test(t.h+t.s),'no em dash');
  ck(t.yes&&t.no,'both answers are labelled',t.yes+' / '+t.no);
  await p.context().close();
}

sec('BOTH PROMISES IN THE COPY ARE TRUE OF THE SHIPPED PAUSE MENU');
{
  const p=await fresh();
  const menu=await p.evaluate(()=>{
    const v=document.getElementById('pauseveil');
    return [...v.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean);
  });
  /* promise 1: the rulebook is reachable from the pause menu. The BUTTON is
     labelled "How to play"; the screen it opens is titled "The Rulebook". */
  /* pHow OVERLAYS the rulebook (.on + .ontop) rather than switching screens,
     so `.screen.on` still matches the menu underneath. Reading the first
     match returned the main menu and looked like a navigation failure. Ask
     the how screen directly. */
  const how=await p.evaluate(()=>{
    const b=document.getElementById('pHow'); if(!b)return null;
    b.click();
    const s=document.getElementById('screen-how');
    if(!s||!s.classList.contains('on'))return 'DID NOT OPEN';
    return (s.querySelector('h2')||{}).textContent||'(no title)';
  });
  ck(menu.some(m=>/how to play/i.test(m)),'the pause menu has the rulebook door',
     menu.join(' · '));
  ck(/rulebook/i.test(how||''),'and it really opens the rulebook',String(how));
  /* promise 2: the coach switch exists and is reachable from the pause menu */
  const sw=await p.evaluate(()=>{
    const b=document.getElementById('pSettings');
    const el=document.getElementById('setCoach');
    return {inMenu:!!b, exists:!!el};
  });
  ck(sw.inMenu,'the pause menu has the settings door');
  ck(sw.exists,'and settings really holds the Coach switch');
  await p.context().close();
}

sec('COACH OFF NO LONGER KILLS THE COACH IN ONE TAP');
{
  const p=await fresh();
  await raiseTip(p); await p.waitForTimeout(500);
  const before=await p.evaluate(()=>localStorage.getItem('bk_coach'));
  await p.evaluate(()=>document.querySelector('#coachTip .ct-off').click());
  await p.waitForTimeout(350);
  const mid=await p.evaluate(()=>({
    veil:!!document.querySelector('#skipveil.on'),
    coach:localStorage.getItem('bk_coach'),
    tipStillUp:!!document.querySelector('#coachTip.on')}));
  ck(mid.veil,'tapping Coach off raises the question');
  ck(mid.coach!=='0','and does NOT turn the coach off yet',
     'bk_coach='+String(mid.coach)+' (was '+String(before)+')');

  /* "Keep them on" leaves everything as it was, tip included */
  await p.evaluate(()=>document.getElementById('skipNo').click());
  await p.waitForTimeout(300);
  const kept=await p.evaluate(()=>({
    veil:!!document.querySelector('#skipveil.on'),
    coach:localStorage.getItem('bk_coach'),
    tip:!!document.querySelector('#coachTip.on')}));
  ck(!kept.veil,'Keep them on closes the question');
  ck(kept.coach!=='0','the coach stays on','bk_coach='+String(kept.coach));
  ck(kept.tip,'and the tip that was open stays open');

  /* "Skip tips" is the one that actually does it */
  await p.evaluate(()=>document.querySelector('#coachTip .ct-off').click());
  await p.waitForTimeout(300);
  await p.evaluate(()=>document.getElementById('skipYes').click());
  await p.waitForTimeout(350);
  const off=await p.evaluate(()=>({
    veil:!!document.querySelector('#skipveil.on'),
    coach:localStorage.getItem('bk_coach'),
    tip:!!document.querySelector('#coachTip.on')}));
  ck(!off.veil,'Skip tips closes the question');
  ck(off.coach==='0','and the coach is off','bk_coach='+String(off.coach));
  ck(!off.tip,'and the open tip goes with it');
  await p.context().close();
}

sec('IT ASKS EVERY TIME, AND THE SWITCH STILL BRINGS HIM BACK');
{
  const p=await fresh();
  /* turn off via the confirm, back on via the real Settings switch, then off
     again: the second attempt must ask too. "Once only" is a change Aaron can
     ask for; silently behaving that way is not. */
  await raiseTip(p); await p.waitForTimeout(400);
  await p.evaluate(()=>document.querySelector('#coachTip .ct-off').click());
  await p.waitForTimeout(250);
  await p.evaluate(()=>document.getElementById('skipYes').click());
  await p.waitForTimeout(250);
  await p.evaluate(()=>document.getElementById('setCoach').click());
  await p.waitForTimeout(250);
  const backOn=await p.evaluate(()=>localStorage.getItem('bk_coach'));
  ck(backOn!=='0','the Settings switch turns the coach back on','bk_coach='+String(backOn));
  await raiseTip(p); await p.waitForTimeout(400);
  await p.evaluate(()=>document.querySelector('#coachTip .ct-off').click());
  await p.waitForTimeout(300);
  ck(await p.evaluate(()=>!!document.querySelector('#skipveil.on')),
     'the second Coach off asks again');
  await p.context().close();
}

sec('NOTHING IS STACKED ON TOP OF IT');
/* The checks above all passed while the coach card sat squarely over this
 * dialog, hiding the sublettering and the Skip tips button. Every one of them
 * asked whether an element EXISTED or what it SAID; none asked whether a
 * player could see it. elementFromPoint is the question they were all missing:
 * at the centre of each control, who actually gets the tap? */
for (const [w,h] of [[390,844],[1440,900]]) {
  const p=await fresh(w,h);
  await raiseTip(p); await p.waitForTimeout(400);
  await p.evaluate(()=>document.querySelector('#coachTip .ct-off').click());
  await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{
    const hit=id=>{
      const e=document.getElementById(id), b=e.getBoundingClientRect();
      const top=document.elementFromPoint(b.left+b.width/2, b.top+b.height/2);
      return {mine:e===top||e.contains(top), got:top?(top.id||top.className||top.tagName):'null'};
    };
    const veil=document.getElementById('skipveil');
    const box=veil.querySelector('.hintbox').getBoundingClientRect();
    const sub=document.elementFromPoint(box.left+box.width/2, box.top+box.height/2);
    return {yes:hit('skipYes'), no:hit('skipNo'),
            insideBox:veil.contains(sub), got:sub?(sub.id||sub.className):'null'};
  });
  const at=w+'x'+h;
  ck(r.yes.mine,at+': Skip tips is the thing you actually tap',r.yes.got);
  ck(r.no.mine,at+': Keep them on is the thing you actually tap',r.no.got);
  ck(r.insideBox,at+': nothing covers the middle of the dialog',r.got);
  await p.context().close();
}

sec('IT IS TAPPABLE ON A PHONE');
{
  const p=await fresh(390,844);
  await raiseTip(p); await p.waitForTimeout(400);
  await p.evaluate(()=>document.querySelector('#coachTip .ct-off').click());
  await p.waitForTimeout(350);
  const r=await p.evaluate(()=>{
    const q=id=>{const e=document.getElementById(id).getBoundingClientRect();
      return {h:Math.round(e.height),w:Math.round(e.width),
              on:e.top>=0&&e.bottom<=innerHeight};};
    return {yes:q('skipYes'), no:q('skipNo'),
      overlap:(()=>{const a=document.getElementById('skipYes').getBoundingClientRect(),
                          c=document.getElementById('skipNo').getBoundingClientRect();
        return a.bottom>c.top&&a.top<c.bottom&&a.right>c.left&&a.left<c.right;})()};
  });
  /* 28px is the floor smoke-check.mjs already enforces on every control */
  ck(r.yes.h>=28,'Skip tips clears the 28px control floor',r.yes.h+'px');
  ck(r.no.h>=28,'Keep them on clears it too',r.no.h+'px');
  ck(!r.overlap,'the two answers do not overlap');
  ck(r.yes.on&&r.no.on,'both are on screen at 390x844');
  await p.context().close();
}

sec('BREAK IT ON PURPOSE');
{
  const p=await fresh();
  /* with the markup gone the code must still let the player out, never trap
     them behind a confirm that cannot render */
  const escaped=await p.evaluate(()=>{
    document.getElementById('skipveil').remove();
    window.BKCoach.tip('probeX','<b>Probe.</b>',true);
    document.querySelector('#coachTip .ct-off').click();
    return localStorage.getItem('bk_coach');
  });
  ck(escaped==='0','no markup, no trap: Coach off still works','bk_coach='+String(escaped));
}

console.log('\n'+(fails.length?'FAILED: '+fails.length+'\n - '+fails.join('\n - ')
                              :'ALL CHECKS PASS'));
await b.close();
process.exit(fails.length?1:0);

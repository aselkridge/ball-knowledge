/* SMOKE — every screen in the game, opened and looked at. Serve docs/ on :8899.

   WHY THIS EXISTS. Aaron, 2026-08-04: "Why do I keep finding these bugs and bad
   data through random questions?" Counted rather than answered: the Daily Five
   carried 99 checks and the ENTIRE REST OF THE GAME carried about 68, across
   ~21 screens. Seventeen of them had no harness at all.

   So the bugs were never concentrated in the daily — the ATTENTION was. This is
   the missing floor: it does not know what any screen is supposed to do, it just
   opens every one and reports anything obviously broken. A cheap check that runs
   everywhere beats a thorough check that runs in one place. */
import pw from 'playwright';
const {chromium}=pw;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* KNOWN SMALL CONTROLS, 2026-08-04. Every one of these is pre-existing and each
   already carries a transparent 44px tap area (index.html, .dbtn/.pbtn::after),
   so they are easier to hit than their size suggests. The numbers are a CEILING:
   the check fails the moment a screen grows a new one. Lower them by making a
   control bigger; never raise one to make a failure go away. */
/* MEASURED with the box check, which is the one that shipped. The first version
   of this list was copied from the over-sensitive probe check and grandfathered
   SEVEN screens that actually have zero — a ceiling of 2 on a screen with 0 is
   not a ratchet, it is permission to add two. Baselines must be taken with the
   check that will enforce them. */
/* 6 -> 0 on 2026-08-04. The transparent 44px tap area shipped weeks ago and made
   these easy to HIT; the boxes themselves stayed 24-26px and read as specks on a
   phone. Aaron asked to see the before and after, saw it, and the floor went up:
   .dbtn clamp minimum 24px -> 30px, .pbtn padding 3px -> 7px. Nothing on desktop
   moved — only the clamp's LOWER bound did. Zero is now the ceiling, so a
   seventh can never appear. */
const SMALL_BASELINE={};
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});

for(const [tag,w,h] of [['desktop',1440,900],['phone',390,844]]){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  const errs=[];
  p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,120))});
  await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bk_coach','0')});
  await p.reload({waitUntil:'networkidle'});await sleep(1200);

  const screens=await p.evaluate(()=>[...document.querySelectorAll('.screen[id^="screen-"]')]
    .map(s=>s.id.replace('screen-','')));
  console.log('\n=== '+tag+' ('+w+'px) · '+screens.length+' screens ===');

  for(const s of screens){
    const before=errs.length;
    const r=await p.evaluate(async id=>{
      try{window.BK._show(id)}catch(e){return {threw:String(e).slice(0,90)}}
      /* WAIT FOR IT TO SETTLE, do not guess at a duration. A fixed 320ms
         reported the title screen as 0px tall on its first run — the screen was
         mid-transition, not broken. A flaky check is worse than no check: it
         trains you to ignore the output. Poll for a stable height instead. */
      const el0=document.getElementById('screen-'+id);
      let last=-1,stable=0;
      for(let i=0;i<40&&stable<3;i++){
        await new Promise(r=>setTimeout(r,50));
        const hNow=el0?Math.round(el0.getBoundingClientRect().height):0;
        stable=(hNow===last&&hNow>0)?stable+1:0; last=hNow;
      }
      const el=document.getElementById('screen-'+id);
      if(!el)return {missing:true};
      const box=el.getBoundingClientRect();
      // anything that spills past the right edge makes the page scroll sideways
      const wide=[...el.querySelectorAll('*')].filter(n=>{
        const b=n.getBoundingClientRect();
        return b.width>0&&b.right>innerWidth+2&&getComputedStyle(n).position!=='fixed';
      }).length;
      /* CONTROLS SMALLER THAN A THUMB.
         Deliberately the SIMPLE measure — the drawn box against 28px — after two
         cleverer versions failed in opposite directions. Measuring the box alone
         could not see the transparent ::after that widens the real tap area, so
         it under-reported the fix; probing a 40px square around each control
         then OVER-reported, because the probe lands on the legitimately adjacent
         button next to it and calls normal layout a bug.
         So: count them, and RATCHET on the count the way audit.py does. It
         cannot tell you a control is fine, but it can guarantee the number never
         grows, which is the property that actually protects the game. */
      const small=[...el.querySelectorAll('button,[role="button"]')].filter(n=>{
        const b=n.getBoundingClientRect();
        return b.width>0&&b.height>0&&(b.height<28||b.width<28);
      }).length;
      // text that renders as the literal word undefined/null/NaN
      const junk=(el.innerText||'').match(/\b(undefined|NaN|\[object Object\])\b/g);
      return {on:el.classList.contains('on'),h:Math.round(box.height),
              wide,small,junk:junk?junk.length:0,
              scrollsX:document.documentElement.scrollWidth>innerWidth+2};
    },s);
    const newErrs=errs.slice(before);
    const label=(tag+' · '+s).padEnd(20);
    if(r.threw){ck(false,label+'opens',r.threw);continue}
    if(r.missing){ck(false,label+'exists');continue}
    ck(r.on&&r.h>40,label+'opens and has content',r.h+'px tall');
    ck(newErrs.length===0,label+'no errors',newErrs[0]||'');
    ck(!r.scrollsX,label+'does not scroll sideways');
    ck(r.junk===0,label+'no undefined/NaN on screen',r.junk?r.junk+' found':'');
    if(tag==='phone'){
      const cap=SMALL_BASELINE[s]||0;
      ck(r.small<=cap,label+'no NEW controls under 28px',
        r.small+' of '+cap+' allowed');
    }
  }
  /* THE SCROLL CUE MUST NEVER POINT AT DECORATION.
     Aaron, 08-05, from a desktop screenshot: a bobbing "scroll for more"
     chevron on the main menu with nothing below to scroll to. The chevron was
     right -- the title screen carried 233px of scrollable overflow and every
     pixel belonged to a rotated decorative slash, whose transformed box ran
     251px past the last real content.
     This asserts the shape of the bug rather than the number: on the title
     screen, nothing may sit below the last piece of REAL content. A future
     decoration that overflows again fails here instead of shipping a chevron
     that lies. */
  await p.evaluate(()=>{const t=document.getElementById('screen-title');
    if(t&&!t.classList.contains('on')){document.querySelectorAll('.screen.on')
      .forEach(x=>x.classList.remove('on'));t.classList.add('on')}});
  await sleep(700);
  const ph=await p.evaluate(()=>{
    const sc=document.getElementById('screen-title');
    const real=[...sc.children].filter(el=>!el.classList.contains('slashes')
      && !el.classList.contains('bg-type'));
    const low=Math.max(...real.map(el=>el.getBoundingClientRect().bottom));
    const srt=sc.getBoundingClientRect().top;
    return {over:sc.scrollHeight-sc.clientHeight,
            contentOver:Math.max(0,Math.round(low-srt+sc.scrollTop-sc.clientHeight)),
            hint:document.getElementById('scrollHint').classList.contains('on')};
  });
  ck(ph.over===0||ph.contentOver>0,'  '+tag+' · title  scroll cue never points at decoration',
     'screen overflows '+ph.over+'px, real content overflows '+ph.contentOver+'px');
  ck(!ph.hint||ph.contentOver>0,'  '+tag+' · title  chevron only when there IS something below',
     ph.hint?'chevron shown':'chevron hidden');

  /* AND THE DAILY FIVE STAMP MUST LOOK LIKE A CONTROL WHILE STANDING STILL.
     The old pulse lit the ring for ~0.4s of every 3.4s, so five sixths of the
     time it was a paper calendar with no affordance. Animations are disabled
     for this check on purpose: whatever is asserted here is what a player sees
     in a still glance, in a screenshot, and under reduce-motion. */
  const st=await p.evaluate(()=>{
    const el=document.getElementById('dailyStamp');
    if(!el||el.classList.contains('done'))return null;
    el.style.animation='none';
    return getComputedStyle(el).boxShadow;
  });
  if(st!==null){
    const ring=/rgba?\(\s*245,\s*135,\s*46/.test(st);
    ck(ring,'  '+tag+' · stamp  carries its accent ring with animation OFF',
       ring?'resting state is a control':'no accent in the resting shadow');
  }

  /* THE STAMP'S LABEL MUST BE A VERB, AND MUST NOT BE ONE ONCE IT IS PLAYED.
     Aaron, 08-05: "it's clear to click and run it or play it". A noun on a
     control is the defect he described; an instruction on a finished control
     is the one screenshotting the done state turned up. Both asserted. */
  const lbl=await p.evaluate(()=>{
    const el=document.getElementById('dailyStamp');if(!el)return null;
    const go=el.querySelector('.ds-go');
    const rest=go?getComputedStyle(go).display:'none';
    el.classList.add('done');
    const done=go?getComputedStyle(go).display:'none';
    el.classList.remove('done');
    return {rest:rest,done:done,text:(go&&go.textContent||'').trim()};
  });
  if(lbl){
    ck(lbl.rest!=='none'&&/\w/.test(lbl.text),
       '  '+tag+' · stamp  label says what pressing it DOES','"'+lbl.text+' Daily 5"');
    ck(lbl.done==='none','  '+tag+' · stamp  drops the call to action once played',
       'done state hides it');
  }

  /* TEXT HAS A FLOOR TOO. The existing check measures CONTROLS under 28px and
     has never looked at type, which is how three lines sat at 9px mono on the
     roster screen until Aaron read them on a desktop. 11px is the floor: below
     that, letterspaced uppercase mono stops being readable at arm's length.
     Measured on a screen with a real five dealt on it -- an empty roster
     screen reports the same font sizes while showing none of the lines. */
  await p.evaluate(()=>{window.BK._show('squad');window.BK._srRoll&&window.BK._srRoll('nba')});
  await sleep(900);
  const tiny=await p.evaluate(()=>{
    const out=[];
    ['.sr-pips','.sr-tap','.sr-odds'].forEach(sel=>{
      const e=document.querySelector(sel);if(!e)return;
      const fs=parseFloat(getComputedStyle(e).fontSize);
      if(fs<11)out.push(sel+' '+Math.round(fs)+'px');
    });
    return out;
  });
  ck(tiny.length===0,'  '+tag+' · roster  no instruction text under 11px',
     tiny.length?tiny.join(' · '):'pips/tap/odds all >= 11px');

  await p.close();
}
await b.close();
console.log('\n'+(fails.length?fails.length+' FAILING':'ALL CHECKS PASS'));

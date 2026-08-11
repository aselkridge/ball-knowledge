/* AARON'S COLOUR RULINGS, 2026-08-11, asserted against the running game.
 *
 *   "Surprise me" -> iridescent
 *   Question difficulty Legendary -> purple
 *   Knowledge level Legendary -> purple
 *   Pack rarity: Epic a positive-looking red, Legendary purple, HoF stays gold
 *
 * Two kinds of check here, and the second kind is the one that earns its keep.
 * Anyone can assert a hex. What a hex cannot tell you is whether the shimmer
 * SHIMMERS: a multi-stop gradient that never animates renders identically in a
 * screenshot to one that does. The first cut of the CSS had exactly that bug
 * (a two-value background-position keyframe on a one-layer element pins it at
 * 0 0), so these checks sample the computed position over time and require it
 * to have moved.
 */
import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--mute-audio']});
const fails=[];
const ck=(c,m,x)=>{console.log((c?'  PASS  ':'  FAIL  ')+m+(x?'   ['+x+']':''));if(!c)fails.push(m)};
const sec=t=>console.log('\n'+t);

const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
await p.goto('http://127.0.0.1:8899/play/',{waitUntil:'networkidle'});
await p.evaluate(()=>localStorage.clear());
await p.reload({waitUntil:'networkidle'});
await p.waitForTimeout(1100);

sec('THE HEXES ARE WHAT HE ASKED FOR');
{
  const v=await p.evaluate(()=>({
    difLegend:window.BK._TIERS[4].c,
    packs:JSON.parse(JSON.stringify(window.BK._SR_RC||{})),
    brackets:window.BK._BRACKETS?
      Object.fromEntries(Object.entries(window.BK._BRACKETS).map(([k,o])=>[k,o.col])):null
  }));
  ck(v.difLegend==='#a45cff','question difficulty Legendary is purple',v.difLegend);
  if(v.brackets){
    ck(v.brackets.legend==='#a45cff','knowledge level Legend is the SAME purple',v.brackets.legend);
    ck(v.brackets.wild!=='#b98cff','Surprise me is off the old All-Star purple',v.brackets.wild);
  }
  if(v.packs&&v.packs.epic){
    ck(v.packs.epic==='#ff4f7a','pack Epic is the rose red',v.packs.epic);
    ck(v.packs.legendary==='#a45cff','pack Legendary is the same purple',v.packs.legendary);
    ck(v.packs.halloffame==='#ffd76a','Hall of Fame keeps its gold',v.packs.halloffame);
  }
}

sec('GOLD NO LONGER MEANS FIVE THINGS');
{
  /* The point of the ruling. #ffcf6a used to be worn by question difficulty
     Legendary, knowledge Legend, pack Legendary, player Superstar and Heat
     ON FIRE at once. Only the last two may keep it. */
  const wearers=await p.evaluate(()=>{
    const out=[];
    if(window.BK._TIERS[4].c==='#ffcf6a')out.push('difficulty Legendary');
    const B=window.BK._BRACKETS;
    if(B&&B.legend.col==='#ffcf6a')out.push('knowledge Legend');
    const R=window.BK._SR_RC;
    if(R&&R.legendary==='#ffcf6a')out.push('pack Legendary');
    return out;
  });
  ck(wearers.length===0,'no ladder still paints Legendary in Superstar gold',
     wearers.join(' · ')||'none');
}

sec('THE SHIMMER ACTUALLY MOVES');
{
  await p.evaluate(()=>window.BK._show('rules'));
  await p.waitForTimeout(500);
  await p.evaluate(()=>document.getElementById('klRulesWild').click());
  await p.waitForTimeout(400);
  const probe=async sel=>p.evaluate(s=>{
    const e=document.querySelector(s); if(!e)return null;
    const cs=getComputedStyle(e);
    return {pos:cs.backgroundPosition, img:cs.backgroundImage,
            anim:cs.animationName, clip:cs.webkitBackgroundClip||cs.backgroundClip};
  },sel);
  for (const [sel,name] of [['.klwild.sel .kw-t','the Surprise Me label'],
                            ['.kl-chip.wild','an ANY TIER chip'],
                            ['.klwild.sel','the Surprise Me button']]) {
    const a=await probe(sel);
    if(!a){ck(false,name+' is on screen');continue;}
    /* a real spectrum: count the colour stops in the gradient */
    const stops=(a.img.match(/rgb/g)||[]).length;
    ck(stops>=5,name+' paints a full spectrum',stops+' stops');
    await p.waitForTimeout(900);
    const c=await probe(sel);
    ck(a.pos!==c.pos,name+' MOVES over 900ms',a.pos+'  ->  '+c.pos);
  }
}

sec('AND IT HOLDS STILL WHEN THE PLAYER ASKED FOR THAT');
{
  await p.evaluate(()=>document.body.classList.add('reduce-motion'));
  await p.waitForTimeout(300);
  const r=await p.evaluate(()=>['.klwild.sel','.klwild.sel .kw-t','.kl-chip.wild']
    .map(s=>{const e=document.querySelector(s);
      return e?getComputedStyle(e).animationName:'missing'}));
  ck(r.every(x=>x==='none'),'reduce-motion stops every sheen',r.join(' · '));
  /* but the rainbow stays: many-colours-at-once is the MEANING, not the motion */
  const still=await p.evaluate(()=>{
    const e=document.querySelector('.klwild.sel .kw-t');
    return (getComputedStyle(e).backgroundImage.match(/rgb/g)||[]).length;});
  ck(still>=5,'and the spectrum is still there when it is still',still+' stops');
  await p.evaluate(()=>document.body.classList.remove('reduce-motion'));
}

sec('THE LADDERS SEPARATE, MEASURED THE WAY THE AUDIT MEASURES');
{
  /* label-colours.py owns the arithmetic; this only asserts the three ladders
     Aaron retuned are no longer flagged. Running the tool here would duplicate
     its Lab maths in JS, which is the copy-instead-of-import mistake. */
  const { execSync } = await import('child_process');
  const out=execSync('python3 tools/label-colours.py',{encoding:'utf8'});
  const A=out.split('A. WITHIN')[1].split('B. ACROSS')[0];
  for (const sys of ['Pack rarity','Question difficulty','Knowledge level']) {
    const line=A.split('\n').find(l=>l.trim().startsWith(sys));
    ck(line&&!/too close/.test(line),sys+' is no longer flagged too close',
       (line||'').trim().slice(0,64));
  }
}

console.log('\n'+(fails.length?'FAILED: '+fails.length+'\n - '+fails.join('\n - ')
                              :'ALL CHECKS PASS'));
await b.close();
process.exit(fails.length?1:0);

/* RE-JUDGING THE BOARD ON THE REAL FLOOR (Aaron, 08-19: "re-judge the board
   on hardwood first").

   Pass one grounded the court while the DEFAULT was the art-less Classic, so
   four fixes were judged against a placeholder. Hardwood is the default now,
   and a photographed floor already supplies most of what two of those fixes
   were hand-drawing. This shoots each one ON and OFF over the real art so the
   question is answered by looking, not by arguing.

   NOTHING ON DISK IS EDITED. Each variant is a string patch applied to
   game.js in flight via route interception, so the repo cannot be left dirty
   by a crashed run. That matters: the last time this session reverted a
   render experiment with git, it took hours of uncommitted work with it. */
import pw from 'playwright';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = 'design/shots/board2';
fs.mkdirSync(OUT, { recursive: true });

/* Each variant names one substring in game.js and what to replace it with.
   A patch that does not match is a HARD FAIL, never a silent no-op: a shot
   labelled "shadows off" that quietly still has shadows is worse than no
   shot at all, because it argues for keeping something using a picture of
   it already being kept. */
const VARIANTS = {
  ship: [],
  /* the plate is a FILL and a hairline STROKE. Killing only the fill leaves a
     light outline floating where the plate was, which is not "no plate", it
     is a worse plate. Both go. */
  'no-plate': [
    ["c.fillStyle='rgba(14,8,4,.42)';", "c.fillStyle='rgba(14,8,4,0)';"],
    ["c.strokeStyle='rgba(255,240,220,.16)';", "c.strokeStyle='rgba(255,240,220,0)';"]],
  /* DIAGNOSTIC: draw the shadow, then skip the sprite. If the shadow is doing
     the work pass one claimed, this frame shows a soft grounded pool under
     every piece. If it shows almost nothing, the shadow's dark core has been
     hiding under the figurine's own near-black base all along. */
  'shadow-only': [[
    "ctx.drawImage(spr,", "if(0)ctx.drawImage(spr,"]],
  'no-contact': [[
    "var lift=Math.max(0,dp.h||0)/44;",
    "var lift=Math.max(0,dp.h||0)/44; if(1){ctx.fillStyle='rgba(0,0,0,.35)';" +
    "ctx.beginPath();ctx.ellipse(ptF.x,ptF.y,20*scl*2,7*scl*2,0,0,7);ctx.fill();return;}"]],
  'no-apron': [[
    "var bands=[[-AP,-AP,LW+AP,0],[-AP,LH,LW+AP,LH+AP],",
    "var bands=[];var _unused=[[-AP,-AP,LW+AP,0],[-AP,LH,LW+AP,LH+AP],"]],
  /* THE PROPOSAL. Three changes, each answering one measured defect:
     1. the shadow is sized to the piece's own base, so the base eclipses it
        entirely (proved by shadow-only). Widen it past the base and push it
        along the light the sprite is already lit by, so it reads as cast.
     2. its darkness all sits in a core nobody can see. Hold the tone out to
        0.72 of the radius, then fall off.
     3. the piece stands on a near-black plinth (measured luminance 15 against
        a floor at 148), which is the thing that actually reads as pasted on.
        Lift the ambient floor so the base is dark wood, not a hole. */
  proposed: [
    ["var rx=20*scl*2*(1+lift*0.5), ry=7*scl*2*(1+lift*0.5);\n" +
     "        var sg=ctx.createRadialGradient(ptF.x,ptF.y,0,ptF.x,ptF.y,rx);",
     "var rx=34*scl*2*(1+lift*0.5), ry=12*scl*2*(1+lift*0.5);\n" +
     "        var sox=ptF.x+7*scl, soy=ptF.y+2.5*scl;\n" +
     "        var sg=ctx.createRadialGradient(sox,soy,0,sox,soy,rx);"],
    ["sg.addColorStop(0.55,'rgba(0,0,0,'+(core*0.55).toFixed(3)+')');",
     "sg.addColorStop(0.72,'rgba(0,0,0,'+(core*0.62).toFixed(3)+')');"],
    ["ctx.save();ctx.translate(ptF.x,ptF.y);ctx.scale(1,ry/rx);ctx.translate(-ptF.x,-ptF.y);\n" +
     "        ctx.fillStyle=sg;ctx.beginPath();ctx.arc(ptF.x,ptF.y,rx,0,7);ctx.fill();",
     "ctx.save();ctx.translate(sox,soy);ctx.scale(1,ry/rx);ctx.translate(-sox,-soy);\n" +
     "        ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sox,soy,rx,0,7);ctx.fill();"],
    ["var sh=.34+.66*Math.max(0,", "var sh=.55+.45*Math.max(0,"],
    ["SKIN.tileAlpha=(o.tileAlpha!=null?o.tileAlpha:0.16);", "SKIN.tileAlpha=0.05;"],
  ],
  /* Same as proposed, plus the plinth lifted out of near-black. Kept SEPARATE
     because it is a taste question and not a defect: [58,42,28] is a chosen
     colour, and a dark weighted base is what a real tournament figurine has.
     It is also what makes the board read "checkers set" instead of "arena".
     Aaron rules this one; I am not deciding it by shipping it. */
  'proposed-warmbase': [
    ["var rx=20*scl*2*(1+lift*0.5), ry=7*scl*2*(1+lift*0.5);\n" +
     "        var sg=ctx.createRadialGradient(ptF.x,ptF.y,0,ptF.x,ptF.y,rx);",
     "var rx=34*scl*2*(1+lift*0.5), ry=12*scl*2*(1+lift*0.5);\n" +
     "        var sox=ptF.x+7*scl, soy=ptF.y+2.5*scl;\n" +
     "        var sg=ctx.createRadialGradient(sox,soy,0,sox,soy,rx);"],
    ["sg.addColorStop(0.55,'rgba(0,0,0,'+(core*0.55).toFixed(3)+')');",
     "sg.addColorStop(0.72,'rgba(0,0,0,'+(core*0.62).toFixed(3)+')');"],
    ["ctx.save();ctx.translate(ptF.x,ptF.y);ctx.scale(1,ry/rx);ctx.translate(-ptF.x,-ptF.y);\n" +
     "        ctx.fillStyle=sg;ctx.beginPath();ctx.arc(ptF.x,ptF.y,rx,0,7);ctx.fill();",
     "ctx.save();ctx.translate(sox,soy);ctx.scale(1,ry/rx);ctx.translate(-sox,-soy);\n" +
     "        ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sox,soy,rx,0,7);ctx.fill();"],
    ["if(y<0.155)return [58,42,28];", "if(y<0.155)return [104,76,52];"],
    ["SKIN.tileAlpha=(o.tileAlpha!=null?o.tileAlpha:0.16);", "SKIN.tileAlpha=0.05;"],
  ],
  'checker-05': [[
    "SKIN.tileAlpha=(o.tileAlpha!=null?o.tileAlpha:0.16);",
    "SKIN.tileAlpha=0.05;"]],
  'checker-00': [[
    "SKIN.tileAlpha=(o.tileAlpha!=null?o.tileAlpha:0.16);",
    "SKIN.tileAlpha=0;"]],
};

const VIEWS = { desk: { width: 1280, height: 860 }, phone: { width: 390, height: 844 } };
const src = fs.readFileSync('docs/play/game.js', 'utf8');

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });

/* optional filter: node tools/board2-shots.mjs proposed-warmbase ship */
const only = process.argv.slice(2);
for (const [name, patches] of Object.entries(VARIANTS)) {
  if (only.length && !only.includes(name)) continue;
  let body = src;
  for (const [find, rep] of patches) {
    if (body.indexOf(find) < 0) { console.error('PATCH MISS in ' + name + ': ' + find.slice(0, 50)); process.exit(1); }
    body = body.replace(find, rep);
  }
  for (const [vk, vp] of Object.entries(VIEWS)) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.route('**/play/game.js*', r => r.fulfill({ status: 200, contentType: 'application/javascript', body }));
    await page.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(1200);
    await page.evaluate(() => {
      const B = window.BK, K = B.coach;
      K.applyColors({ nm: 'Lakers', ab: 'LAL' }, { nm: 'Celtics', ab: 'BOS' });
      K.startGame({ league: 'nba', decade: 'ANY', target: 11, rosters: K.pickRosters('nba', 'ANY') }, true);
      B._show('game');
    });
    await sleep(2600);
    /* reduce-motion so the ambient drift cannot make two shots differ for a
       reason that has nothing to do with the thing being judged */
    await page.evaluate(() => document.body.classList.add('reduce-motion'));
    await sleep(700);
    const el = await page.$('#court');
    await el.screenshot({ path: `${OUT}/${name}-${vk}.png` });
    /* and the WHOLE screen, because the canvas alone is a lie: the dock and
       the HUD cover its lower third in play, so a bare-canvas crop makes the
       board look far more marooned than a player ever sees it. */
    await page.screenshot({ path: `${OUT}/${name}-${vk}-full.png` });
    console.log('  ' + name + '-' + vk);
    await ctx.close();
  }
}
await b.close();
console.log('shot ' + Object.keys(VARIANTS).length * 2 + ' frames into ' + OUT);

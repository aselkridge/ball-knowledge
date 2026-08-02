/* compare-shots — capture the SAME routes from the new code and the old code.
 *
 * The point of a before/after is that the "before" is real. Reconstructing it
 * from memory or from a mockup is how you end up shipping a change nobody
 * checked. So this serves the working tree, screenshots it, then checks HEAD out
 * into a throwaway git worktree, serves THAT, and screenshots the same routes at
 * the same sizes. Two sets of pixels, one command, no reconstruction.
 *
 *   node tools/compare-shots.mjs <name> --routes /play/,/tape/ [--setup file.js]
 *                                        [--base <ref>] [--state <name>=<js> ...]
 *
 * --base compares against any ref instead of HEAD. Needed whenever BOTH sides are
 * already committed — e.g. a redesign that landed on a branch across two commits,
 * where "before" is a commit and not the working tree.
 *
 * --state captures an extra pass with a JS snippet applied and reloaded first, so
 * a surface with more than one state (played / unplayed, empty / full) gets both
 * sides of BOTH states. Repeatable.
 *
 * --setup runs a JS snippet on the page before the shot, for anything behind a
 * flow. Reuse the drivers in tools/board-check.mjs / tools/playtest-fixes.mjs;
 * they already know how to get past the Coach card and the tip-off countdown.
 */
import pw from 'playwright';
import {execSync} from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
const {chromium}=pw;

const args=process.argv.slice(2);
const name=args[0];
const arg=k=>{const i=args.indexOf(k);return i<0?null:args[i+1]};
if(!name||name.startsWith('--')){
  console.error('usage: node tools/compare-shots.mjs <name> --routes /play/,/tape/ [--setup file.js]');
  process.exit(1);
}
const routes=(arg('--routes')||'/play/').split(',').map(s=>s.trim()).filter(Boolean);
const setup=arg('--setup')?fs.readFileSync(arg('--setup'),'utf8'):null;
const BASE=arg('--base')||'HEAD';
/* --state fresh= --state done=localStorage.setItem(...) — one extra pass each */
const states=[['',null]].concat(args.reduce((a,v,i)=>{
  if(v==='--state'){const t=args[i+1]||'';const k=t.indexOf('=');
    a.push([t.slice(0,k),t.slice(k+1)])}
  return a},[]));
const SIZES=[['desktop',1440,900],['mobile',390,844]];
const ROOT=execSync('git rev-parse --show-toplevel').toString().trim();
const OUT=path.join(process.env.TMPDIR||'/tmp','compare-'+name);
fs.mkdirSync(OUT,{recursive:true});

const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml',
  '.woff2':'font/woff2','.mp3':'audio/mpeg','.webp':'image/webp'};
function serve(dir,port){
  const s=http.createServer((req,res)=>{
    let p=decodeURIComponent(req.url.split('?')[0]);
    if(p.endsWith('/'))p+='index.html';
    const f=path.join(dir,p);
    if(!f.startsWith(dir)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end()}
    res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r=>s.listen(port,()=>r(s)));
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function shoot(browser,port,label){
  for(const route of routes){
   for(const [stName,stJs] of states){
    for(const [sz,w,h] of SIZES){
      const ctx=await browser.newContext({viewport:{width:w,height:h}});
      const page=await ctx.newPage();
      const errs=[];
      page.on('pageerror',e=>errs.push(String(e).slice(0,120)));
      try{
        await page.goto('http://127.0.0.1:'+port+route,{waitUntil:'networkidle',timeout:20000});
        /* the Coach card freezes the game and the tip-off never arrives behind it */
        await page.evaluate(()=>{try{localStorage.setItem('bk_coach','0')}catch(e){}});
        await page.reload({waitUntil:'networkidle'});
        if(stJs){ await page.evaluate(stJs); await page.reload({waitUntil:'networkidle'}); }
        /* 700ms was not enough: the title screen's staggered entry was still
           running, so a "before" shot caught the menu half-faded and the
           comparison read as a contrast change it never made. Settle first. */
        if(setup){ await page.evaluate(setup); await sleep(1600); } else await sleep(1800);
        const slug=route.replace(/\W+/g,'')||'root';
        const tag=stName?'-'+stName:'';
        await page.screenshot({path:path.join(OUT,`${label}-${slug}${tag}-${sz}.png`)});
        console.log(`  ${label.padEnd(6)} ${route.padEnd(10)} ${(stName||'default').padEnd(8)} ${sz.padEnd(8)}`+
                    (errs.length?'  ⚠ '+errs[0]:''));
      }catch(e){ console.log(`  ${label.padEnd(6)} ${route.padEnd(10)} ${sz.padEnd(8)}  FAILED: ${e.message.slice(0,60)}`); }
      await ctx.close();
    }
   }
  }
}

const browser=await chromium.launch({
  executablePath:'/opt/pw-browsers/chromium',
  args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});

console.log('AFTER — the working tree');
const sA=await serve(path.join(ROOT,'docs'),8951);
await shoot(browser,8951,'after');
sA.close();

/* HEAD in a throwaway worktree. A worktree, not a stash: stashing touches the
   files you are mid-change on, and losing someone's work to take a screenshot
   would be an unforgivable way to fail. */
console.log('\nBEFORE — '+BASE+', in a temporary worktree');
const WT=path.join(process.env.TMPDIR||'/tmp','compare-wt-'+name);
let made=false;
try{
  execSync(`git worktree add --detach -f "${WT}" ${BASE}`,{cwd:ROOT,stdio:'pipe'});
  made=true;
  const sB=await serve(path.join(WT,'docs'),8952);
  await shoot(browser,8952,'before');
  sB.close();
}catch(e){
  console.log('  could not build the BEFORE side: '+e.message.slice(0,90));
  console.log('  SAY SO IN THE ARTIFACT. Do not quietly ship a one-sided comparison.');
}finally{
  if(made)try{execSync(`git worktree remove --force "${WT}"`,{cwd:ROOT,stdio:'pipe'})}catch(e){}
}
await browser.close();

const shots=fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).sort();
console.log(`\n${shots.length} screenshots -> ${OUT}`);
shots.forEach(f=>console.log('   '+f));
console.log('\nNow: look at both sides yourself, then build the artifact (skill: compare).');

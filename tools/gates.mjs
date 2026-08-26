/* EVERY GATE, EVERY TIME. Runs all tools/*-check.mjs against the live build.

   Why this exists: on 08-26 the music gate was found red and had been red
   since 08-25, because the end-of-block gate list was picked by hand and the
   ruling that broke it (row 189's lit law) was not on the list's mind. A gate
   nobody runs is a comment. Hand-picking is now a script.

   Run: node tools/gates.mjs            (all of them)
        node tools/gates.mjs lit band   (only the ones whose name matches)
   Needs docs/ served on :8899; starts nothing, checks first and says so. */
import { readdirSync } from 'fs';
import { spawn } from 'child_process';

const ROOT = '/home/user/ball-knowledge';
const LANES = 4;                    /* four browsers at once stays civil */
const TIMEOUT = 240000;

const server = await fetch('http://127.0.0.1:8899/play/').then(r => r.ok).catch(() => false);
if (!server) {
  console.log('the build is not being served on :8899.');
  console.log('  cd docs && setsid nohup python3 -m http.server 8899 >/tmp/srv8899.log 2>&1 &');
  process.exit(2);
}

const want = process.argv.slice(2);
const gates = readdirSync(`${ROOT}/tools`)
  .filter(f => f.endsWith('-check.mjs'))
  .filter(f => !want.length || want.some(w => f.includes(w)))
  .sort();

if (!gates.length) { console.log('no gate matched ' + want.join(' ')); process.exit(2); }
console.log(`${gates.length} gates · ${LANES} at a time\n`);

const run = gate => new Promise(res => {
  const t0 = Date.now();
  const ch = spawn('node', [`${ROOT}/tools/${gate}`], { cwd: ROOT, env: process.env });
  let out = '';
  const kill = setTimeout(() => { ch.kill('SIGKILL'); }, TIMEOUT);
  ch.stdout.on('data', d => out += d);
  ch.stderr.on('data', d => out += d);
  ch.on('close', code => {
    clearTimeout(kill);
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    /* THE GATES DO NOT SPEAK ONE LANGUAGE. Four verdict lines are in use plus
       plain FAIL rows, so read every dialect before believing a silence: the
       first draft of this runner called four green gates red because they say
       "18 passed, 0 failed" instead of "ok · fail". */
    const say = [
      /(\d+) ok · (\d+) fail/, /(\d+) passed, (\d+) failed/,
    ].map(re => re.exec(out)).find(Boolean);
    const failWord = /(\d+) FAIL(?:ING|ED)\b/.exec(out);
    const failRows = (out.match(/^\s*FAIL\b/gm) || []).length;
    const said = say ? +say[2] === 0
      : failWord ? +failWord[1] === 0
      : /ALL CHECKS PASS/.test(out) ? true
      : failRows ? false
      /* the quiet ones: rows of PASS, no summary line, nothing failed */
      : (code === 0 && /^\s*(PASS|ok)\b/m.test(out)) ? true
      : null;
    const okd = code === 0 && said !== false;
    const why = code !== 0 ? (/Cannot find module/.test(out) ? 'the harness file is missing'
        : /ECONNREFUSED|net::ERR/.test(out) ? 'could not reach the build'
        : `exit ${code}`)
      : said === false ? `${say ? say[2] : failWord ? failWord[1] : failRows} failing`
      : said === null ? 'exit 0, but the gate never said it passed' : '';
    res({ gate, ok: okd && said !== null, secs, why, out });
  });
});

const results = [];
const suspects = [];
for (let i = 0; i < gates.length; i += LANES) {
  const batch = await Promise.all(gates.slice(i, i + LANES).map(run));
  for (const r of batch) {
    if (r.ok) {
      results.push(r);
      console.log(` ok  ${r.gate.replace('-check.mjs', '').padEnd(18)} ${String(r.secs).padStart(3)}s`);
    } else suspects.push(r);
  }
}

/* A RED UNDER LOAD NAMES TWO SUSPECTS: the build, or four browsers fighting
   over one machine. install-check went red in a lane and green on its own
   (08-26), so nothing is called red until it has failed with the floor to
   itself. */
if (suspects.length) {
  console.log(`\n${suspects.length} to re-run alone before calling them red\n`);
  for (const s of suspects) {
    const r = await run(s.gate);
    results.push(r);
    console.log(`${r.ok ? ' ok ' : 'RED '} ${r.gate.replace('-check.mjs', '').padEnd(18)} ${String(r.secs).padStart(3)}s ` +
      (r.ok ? '· green on its own, the lane was the problem' : '· ' + r.why));
  }
}

const red = results.filter(r => !r.ok);
console.log(`\n${results.length - red.length} green · ${red.length} red`);
for (const r of red) {
  console.log(`\n--- ${r.gate} ---`);
  const lines = r.out.split('\n').filter(l => /FAIL|Error|✗|not ok/i.test(l)).slice(0, 6);
  console.log(lines.length ? lines.join('\n') : r.out.split('\n').slice(-8).join('\n'));
}
process.exit(red.length ? 1 : 0);

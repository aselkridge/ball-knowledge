/* Find cheer SWELLS in the crowd files, by measurement.
 *
 *   node tools/crowd-swells.mjs
 *
 * Aaron, 08-09, on the endings: "the plain Finished crowd isnt even cheering
 * and it ends on this weird PA announcement getting cut off, lets try a
 * different crowd sound... give me a set to listen to for each ending and
 * Ill pick."
 *
 * The failure this fixes: I picked the FINISHED window (crowd-cheer-reacting,
 * 0.05s) by lead-silence numbers alone. Silence numbers say where SOUND
 * starts, not where CHEERING starts, and that file opens on ambience and PA
 * talk. A cheer is a SWELL: sustained energy RISING above the crowd bed and
 * decaying back. That is measurable, so every swell in every crowd file gets
 * found and ranked here, and the CHOOSING is Aaron's, on the audition page.
 *
 * Method, all numbers no ears:
 *   envelope   RMS in 50ms hops, smoothed by a 500ms moving average
 *   bed        20th percentile of the smoothed envelope: the crowd's idle
 *   swell      a region where the envelope holds above bed + 40% of
 *              (peak - bed); merged if gaps are under 700ms
 *   bounds     expanded to where energy last crossed bed * 1.15, so the rise
 *              is included and a window never starts mid-roar
 *   rank       by mean energy over the swell, then by rise above the bed
 *
 * Output: crowd-swells.json next to the sfx (committed: these numbers are
 * the real build's cheer bank once Aaron picks), one row per swell with
 * offset, duration, mean/peak dB and rise. Nothing here decides what ships.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'docs/play/assets/sfx';
const FILES = [
  'crowd-cheer.mp3',           // the loud one (16s)
  'crowd-cheer-reacting.mp3',  // the polite one, today's FINISHED source
  'crowd-bed-pa.mp3',          // 112s of live game: swells live in here
  'crowd-bed-whistles.mp3',    // live game with whistles
  'crowd-bed-squeaks.mp3',     // live game with squeaks + announcer
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox', '--mute-audio'] });
const p = await (await b.newContext()).newPage();
await p.goto('about:blank');

const out = {};
for (const file of FILES) {
  const b64 = fs.readFileSync(path.join(SRC, file)).toString('base64');
  const res = await p.evaluate(async b64 => {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const ac = new OfflineAudioContext(1, 1, 44100);
    const buf = await ac.decodeAudioData(bin.buffer);
    const sr = buf.sampleRate, n = buf.length;
    const mono = new Float32Array(n);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) mono[i] += d[i] / buf.numberOfChannels;
    }
    const HOP = 0.05, hop = Math.round(sr * HOP);
    const raw = new Float32Array(Math.floor(n / hop));
    for (let h = 0; h < raw.length; h++) {
      let s = 0;
      for (let i = h * hop; i < (h + 1) * hop; i++) s += mono[i] * mono[i];
      raw[h] = Math.sqrt(s / hop);
    }
    // 500ms moving average, so one ball-strike or word does not read as a swell
    const W = 10, env = new Float32Array(raw.length);
    for (let h = 0; h < raw.length; h++) {
      let s = 0, c2 = 0;
      for (let k = Math.max(0, h - W / 2); k < Math.min(raw.length, h + W / 2); k++) { s += raw[k]; c2++; }
      env[h] = s / c2;
    }
    const sorted = [...env].sort((a, b2) => a - b2);
    const bed = Math.max(sorted[Math.floor(env.length * 0.2)], 1e-5);
    const peak = sorted[env.length - 1];
    const TH = bed + (peak - bed) * 0.4;
    // regions above TH, merged across gaps under 700ms
    const regs = [];
    let start = -1;
    for (let h = 0; h <= env.length; h++) {
      const on = h < env.length && env[h] >= TH;
      if (on && start < 0) start = h;
      if (!on && start >= 0) {
        const last = regs[regs.length - 1];
        if (last && start - last.e < 14) last.e = h; else regs.push({ s: start, e: h });
        start = -1;
      }
    }
    // expand each region back/forward to the bed crossing: include the RISE
    const LO = bed * 1.15;
    const dB = v => v <= 0 ? -120 : +(20 * Math.log10(v)).toFixed(1);
    const swells = regs.map(r => {
      let s = r.s; while (s > 0 && env[s - 1] > LO) s--;
      let e = r.e; while (e < env.length - 1 && env[e + 1] > LO) e++;
      let mean = 0, pk = 0;
      for (let h = r.s; h < r.e; h++) { mean += env[h]; if (env[h] > pk) pk = env[h]; }
      mean /= Math.max(1, r.e - r.s);
      return { off: +(s * HOP).toFixed(2), dur: +((e - s) * HOP).toFixed(2),
               meanDb: dB(mean), peakDb: dB(pk),
               riseDb: +(20 * Math.log10(pk / bed)).toFixed(1) };
    }).filter(x => x.dur >= 1.5)
      .sort((a, b2) => b2.meanDb - a.meanDb);
    return { seconds: +buf.duration.toFixed(2), bedDb: dB(bed), swells };
  }, b64);
  out[file] = res;
  console.log(`${file.padEnd(26)} bed ${res.bedDb} dB, ${res.swells.length} swells`
    + res.swells.slice(0, 5).map(s =>
        `\n    at ${String(s.off).padStart(6)}s  ${String(s.dur).padStart(5)}s`
      + `  mean ${s.meanDb} dB  rise +${s.riseDb} dB`).join(''));
}
await b.close();
fs.writeFileSync(path.join(SRC, 'crowd-swells.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`\nwrote ${path.join(SRC, 'crowd-swells.json')}`);

/* Slice the multi-hit sfx files into one-shot candidates, by measurement.
 *
 *   node tools/sfx-slice.mjs
 *
 * Aaron, 08-09: "idk if you can cut the footsteps and the basketball bouncing
 * correctly either." The honest split: WHERE a hit starts and ends is
 * arithmetic (a footstep is an energy spike over a noise floor; a cut point is
 * a valley), so the cutting is mine. WHICH take sounds best is his, so every
 * slice goes to an audition page and nothing ships until he picks.
 *
 * Method, all numbers no ears:
 *   envelope   RMS in 5ms hops over the decoded mono signal
 *   floor      median envelope value: the room, not the hits
 *   onset      envelope crosses max(4x floor, 12% of peak) rising, with a
 *              120ms refractory gap so a bounce's own rattle is not ten hits
 *   start      walk BACK from the onset to the last sub-floor sample, minus
 *              10ms, so the attack transient is never clipped
 *   end        first 60ms stretch back under 2x floor, or the next hit's
 *              start, capped at 1.3s
 *   fades      3ms in, 25ms out, so no cut ever clicks
 *
 * Output: WAV slices (16-bit mono, source sample rate) + slices.json with
 * per-slice measurements, into the scratchpad. NOT into the game: candidates
 * do not ship, keepers do, and keepers need Aaron's ears.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'docs/play/assets/sfx';
const OUT = process.env.SLICE_OUT ||
  '/tmp/claude-0/-home-user-ball-knowledge/dcbe106b-efee-5072-b188-e1ecfdda184f/scratchpad/slices';
fs.mkdirSync(OUT, { recursive: true });

// file -> how many candidates to keep (ranked by isolation + level), and a
// human word for what one hit is called on the audition page
const JOBS = {
  'steps-hallway.mp3':  { keep: 8,  unit: 'step'   },
  'steps-concrete.mp3': { keep: 10, unit: 'step'   },
  'ball-bounce.mp3':    { keep: 8,  unit: 'bounce' },
  'ball-drop-a.mp3':    { keep: 8,  unit: 'bounce' },
  'ball-drop-b.mp3':    { keep: 6,  unit: 'bounce' },
  'rim-hits.mp3':       { keep: 6,  unit: 'clank'  },
  'net-swish.mp3':      { keep: 5,  unit: 'swish'  },
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox', '--mute-audio'] });
const p = await (await b.newContext()).newPage();
await p.goto('about:blank');

const index = {};
for (const [file, job] of Object.entries(JOBS)) {
  const b64 = fs.readFileSync(path.join(SRC, file)).toString('base64');
  const res = await p.evaluate(async ({ b64, keep }) => {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const ac = new OfflineAudioContext(1, 1, 44100);
    const buf = await ac.decodeAudioData(bin.buffer);
    const sr = buf.sampleRate, n = buf.length;
    const mono = new Float32Array(n);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) mono[i] += d[i] / buf.numberOfChannels;
    }
    // ---- envelope, 5ms hops ----
    const hop = Math.round(sr * 0.005);
    const env = new Float32Array(Math.floor(n / hop));
    for (let h = 0; h < env.length; h++) {
      let s = 0;
      for (let i = h * hop; i < (h + 1) * hop; i++) s += mono[i] * mono[i];
      env[h] = Math.sqrt(s / hop);
    }
    const sorted = [...env].sort((a, b) => a - b);
    const floor = Math.max(sorted[env.length >> 1], 1e-5);
    const peak = sorted[env.length - 1];
    const TH = Math.max(floor * 4, peak * 0.12);
    // ---- onsets, 120ms refractory ----
    const refr = Math.round(0.12 / 0.005);
    const onsets = [];
    for (let h = 1; h < env.length; h++)
      if (env[h] >= TH && env[h - 1] < TH &&
          (!onsets.length || h - onsets[onsets.length - 1] >= refr))
        onsets.push(h);
    // ---- slice bounds ----
    const raw = onsets.map((oh, k) => {
      let s = oh;                                    // back to quiet, then 10ms
      while (s > 0 && env[s] > floor * 2) s--;
      let start = Math.max(0, s * hop - Math.round(sr * 0.01));
      let endH = oh, quiet = 0;
      const lim = k + 1 < onsets.length ? onsets[k + 1] - 2 : env.length - 1;
      for (let h = oh; h <= lim; h++) {
        if (env[h] < floor * 2) { if (++quiet >= 12) { endH = h; break; } }
        else quiet = 0;
        endH = h;
      }
      let end = Math.min(n, endH * hop + hop, start + Math.round(sr * 1.3));
      return { start, end, oh };
    }).filter(x => x.end - x.start > sr * 0.05);
    // ---- rank: prefer loud, well-isolated hits ----
    const scored = raw.map((x, i) => {
      let pk = 0, sum = 0;
      for (let i2 = x.start; i2 < x.end; i2++) {
        const a = Math.abs(mono[i2]); if (a > pk) pk = a; sum += mono[i2] * mono[i2];
      }
      const gapBefore = i === 0 ? 9 : (x.start - raw[i - 1].end) / sr;
      const gapAfter = i === raw.length - 1 ? 9 : (raw[i + 1].start - x.end) / sr;
      return { ...x, pk, rms: Math.sqrt(sum / (x.end - x.start)),
               iso: Math.min(gapBefore, gapAfter, 1) };
    });
    const kept = [...scored].sort((a, b2) => (b2.pk * (0.5 + b2.iso)) - (a.pk * (0.5 + a.iso)))
                            .slice(0, keep)
                            .sort((a, b2) => a.start - b2.start);
    // ---- render WAVs with fades + a 60px peak strip for the waveform ----
    const dB = v => v <= 0 ? -120 : +(20 * Math.log10(v)).toFixed(1);
    const out = kept.map(x => {
      const len = x.end - x.start;
      const pcm = new Int16Array(len);
      const fi = Math.round(sr * 0.003), fo = Math.round(sr * 0.025);
      for (let i = 0; i < len; i++) {
        let v = mono[x.start + i];
        if (i < fi) v *= i / fi;
        if (i > len - fo) v *= (len - i) / fo;
        pcm[i] = Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
      }
      const hdr = new ArrayBuffer(44); const dv = new DataView(hdr);
      const w = (o, s2) => { for (let i = 0; i < s2.length; i++) dv.setUint8(o + i, s2.charCodeAt(i)); };
      w(0, 'RIFF'); dv.setUint32(4, 36 + len * 2, true); w(8, 'WAVEfmt ');
      dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
      dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true);
      dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, 'data');
      dv.setUint32(40, len * 2, true);
      const all = new Uint8Array(44 + len * 2);
      all.set(new Uint8Array(hdr)); all.set(new Uint8Array(pcm.buffer), 44);
      let s2 = ''; const CH = 0x8000;
      for (let i = 0; i < all.length; i += CH)
        s2 += String.fromCharCode.apply(null, all.subarray(i, i + CH));
      const strip = [];
      for (let k = 0; k < 60; k++) {
        let m = 0;
        for (let i = Math.floor(k * len / 60); i < Math.floor((k + 1) * len / 60); i++) {
          const a = Math.abs(mono[x.start + i]); if (a > m) m = a;
        }
        strip.push(+m.toFixed(3));
      }
      return { wav: btoa(s2), at: +(x.start / sr).toFixed(3),
               sec: +(len / sr).toFixed(3), peakDb: dB(x.pk), rmsDb: dB(x.rms),
               iso: +x.iso.toFixed(2), strip };
    });
    return { sr, hits: onsets.length, kept: out,
             floorDb: dB(floor), thDb: dB(TH) };
  }, { b64, keep: job.keep });

  const base = file.replace('.mp3', '');
  index[file] = { unit: job.unit, sampleRate: res.sr, hitsFound: res.hits,
                  floorDb: res.floorDb, onsetThresholdDb: res.thDb, slices: [] };
  res.kept.forEach((k, i) => {
    const name = `${base}-${String(i + 1).padStart(2, '0')}.wav`;
    fs.writeFileSync(path.join(OUT, name), Buffer.from(k.wav, 'base64'));
    const { wav, ...meta } = k;
    index[file].slices.push({ name, ...meta });
  });
  console.log(`${file.padEnd(22)} ${String(res.hits).padStart(3)} hits found, `
            + `${res.kept.length} kept  (floor ${res.floorDb} dB, gate ${res.thDb} dB)`);
}
await b.close();
fs.writeFileSync(path.join(OUT, 'slices.json'), JSON.stringify(index, null, 1));
const total = Object.values(index).reduce((a, f) => a + f.slices.length, 0);
console.log(`\n${total} candidate one-shots -> ${OUT}`);

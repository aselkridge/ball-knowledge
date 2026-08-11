/* Measure every file in docs/play/assets/sfx/ and write the manifest.
 *
 *   node tools/sfx-measure.mjs
 *
 * I cannot hear. Aaron found that out on 08-09 ("I didn't realize you cannot
 * hear sounds") and it does not excuse shipping unmeasured audio: a file can be
 * silent, clipped, twenty seconds long or padded with two seconds of nothing,
 * and every one of those is a NUMBER. So this decodes each mp3 with Chromium's
 * own WebAudio decoder (the same one the game uses at runtime) and records:
 *
 *   seconds     real decoded duration, not a guess from the byte size
 *   peak        loudest sample, dBFS. 0 = full scale; above -1 risks clipping
 *   rms         average loudness, dBFS. THE number for comparing two cheers
 *   lead/tail   silence below -50 dBFS at each end. A one-shot with 800ms of
 *               lead silence plays LATE, and late is the difference between a
 *               swish and a sound effect about a swish
 *
 * Output merges into docs/play/assets/sfx/manifest.json beside provenance.json.
 * Judging how they SOUND stays Aaron's job. Judging whether they are usable
 * one-shots is now arithmetic.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'docs/play/assets/sfx';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.mp3')).sort();
const prov = JSON.parse(fs.readFileSync(path.join(DIR, 'provenance.json'), 'utf8'));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox', '--mute-audio'] });
const p = await (await b.newContext()).newPage();
await p.goto('about:blank');

const manifest = {};
console.log(`${'file'.padEnd(26)} ${'sec'.padStart(6)} ${'peak dB'.padStart(8)} `
          + `${'rms dB'.padStart(7)} ${'lead ms'.padStart(8)} ${'tail ms'.padStart(8)}`);
for (const f of files) {
  const b64 = fs.readFileSync(path.join(DIR, f)).toString('base64');
  const m = await p.evaluate(async (b64) => {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const ac = new OfflineAudioContext(1, 1, 44100);
    const buf = await ac.decodeAudioData(bin.buffer);
    const n = buf.length, sr = buf.sampleRate, chs = buf.numberOfChannels;
    let peak = 0, sum = 0;
    const mono = new Float32Array(n);
    for (let c = 0; c < chs; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) mono[i] += d[i] / chs;
    }
    for (let i = 0; i < n; i++) {
      const a = Math.abs(mono[i]);
      if (a > peak) peak = a;
      sum += mono[i] * mono[i];
    }
    const TH = Math.pow(10, -50 / 20);               // -50 dBFS
    let lead = 0; while (lead < n && Math.abs(mono[lead]) < TH) lead++;
    let tail = n - 1; while (tail > 0 && Math.abs(mono[tail]) < TH) tail--;
    const dB = v => v <= 0 ? -120 : 20 * Math.log10(v);
    return {
      seconds: +(n / sr).toFixed(2),
      sampleRate: sr, channels: chs,
      peakDb: +dB(peak).toFixed(1),
      rmsDb: +dB(Math.sqrt(sum / n)).toFixed(1),
      leadSilenceMs: Math.round(lead / sr * 1000),
      tailSilenceMs: Math.round((n - 1 - tail) / sr * 1000),
    };
  }, b64);
  manifest[f] = { ...(prov[f] || {}), ...m };
  console.log(`${f.padEnd(26)} ${String(m.seconds).padStart(6)} `
            + `${String(m.peakDb).padStart(8)} ${String(m.rmsDb).padStart(7)} `
            + `${String(m.leadSilenceMs).padStart(8)} ${String(m.tailSilenceMs).padStart(8)}`);
}
await b.close();
fs.writeFileSync(path.join(DIR, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`\nwrote ${DIR}/manifest.json  (${files.length} files measured)`);

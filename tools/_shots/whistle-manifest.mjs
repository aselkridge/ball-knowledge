import {chromium} from 'playwright';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const p=await (await b.newContext()).newPage(); await p.goto('about:blank');
for(const f of ['whistle-coach.mp3','whistle-ref-kit.mp3']){
  const b64=fs.readFileSync('docs/play/assets/sfx/'+f).toString('base64');
  const r=await p.evaluate(async b64=>{
    const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const ac=new OfflineAudioContext(1,1,44100);
    const buf=await ac.decodeAudioData(bin.buffer);
    const n=buf.length, mono=new Float32Array(n);
    for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);
      for(let i=0;i<n;i++)mono[i]+=d[i]/buf.numberOfChannels}
    let peak=0,sum=0;for(let i=0;i<n;i++){const a=Math.abs(mono[i]);if(a>peak)peak=a;sum+=mono[i]*mono[i]}
    const th=peak*0.02;
    let lead=0;while(lead<n&&Math.abs(mono[lead])<th)lead++;
    let tail=n-1;while(tail>0&&Math.abs(mono[tail])<th)tail--;
    const dB=v=>+(20*Math.log10(v)).toFixed(1);
    return {seconds:+buf.duration.toFixed(2),sampleRate:buf.sampleRate,channels:buf.numberOfChannels,
      peakDb:dB(peak),rmsDb:dB(Math.sqrt(sum/n)),
      leadSilenceMs:Math.round(lead/buf.sampleRate*1000),tailSilenceMs:Math.round((n-tail)/buf.sampleRate*1000)};
  },b64);
  console.log(f, JSON.stringify(r));
}
await b.close();

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
    const d=buf.getChannelData(0), sr=buf.sampleRate;
    const hop=Math.round(sr*0.005); const env=[];
    for(let h=0;h<Math.floor(d.length/hop);h++){let s=0;
      for(let i=h*hop;i<(h+1)*hop;i++)s+=d[i]*d[i];env.push(Math.sqrt(s/hop))}
    const peak=Math.max(...env), th=peak*0.1;
    let lead=env.findIndex(v=>v>th)*0.005;
    // count blasts: crossings with 150ms refractory
    let blasts=0,last=-99;const on=[];
    env.forEach((v,h)=>{if(v>th&&env[h-1]<=th&&h-last>30){blasts++;last=h;on.push(+(h*0.005).toFixed(2))}});
    return {dur:+buf.duration.toFixed(2), lead:+lead.toFixed(3), blasts, at:on.slice(0,10),
            peakDb:+(20*Math.log10(peak)).toFixed(1)};
  },b64);
  console.log(f, JSON.stringify(r));
}
await b.close();

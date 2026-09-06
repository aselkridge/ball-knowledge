/* Concept-board drawing kit for the possession-flow memo. Draws phone frames
   (390x844 scaled) from a beat spec: a top-down 15x8 court, pieces, the lit
   ball handler, one move arrow, the announcer line, the clock chip, the
   bottom choice row, an optional hand-off slam. Not product code. */
(function(){
  const COLS=15, ROWS=8;
  const OFF_COL='#f0a83a', DEF_COL='#5b8fd6', OFF_DARK='#7a4a0a', DEF_DARK='#1f3a6e';
  function court(w,h,pad){
    // vertical court on a tall phone: columns run top->bottom (rim at top = attacked rim)
    const cw=(w-pad*2)/ROWS, ch=(h-pad*2)/COLS;
    const X=r=>pad+(r+0.5)*cw, Y=c=>pad+(COLS-1-c+0.5)*ch;
    let s='';
    s+=`<rect x="${pad}" y="${pad}" width="${w-pad*2}" height="${h-pad*2}" rx="6" fill="#c8924f"/>`;
    // tiles
    for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){
      const zone=c>=12?'#d9a45c':(c>=9?'#cf9852':'#c8924f');
      s+=`<rect x="${pad+r*cw}" y="${pad+(COLS-1-c)*ch}" width="${cw}" height="${ch}" fill="${zone}" stroke="rgba(0,0,0,.18)" stroke-width=".6"/>`;
    }
    // lines: halfcourt, circle, both keys and arcs
    const midY=pad+(h-pad*2)/2;
    s+=`<line x1="${pad}" y1="${midY}" x2="${w-pad}" y2="${midY}" stroke="#fff" stroke-width="1.6"/>`;
    s+=`<circle cx="${w/2}" cy="${midY}" r="${cw*1.2}" fill="none" stroke="#fff" stroke-width="1.6"/>`;
    for(const top of [true,false]){
      const y0=top?pad:h-pad, dir=top?1:-1;
      const kw=cw*3, kh=ch*4.2;
      s+=`<rect x="${w/2-kw/2}" y="${top?y0:y0-kh}" width="${kw}" height="${kh}" fill="none" stroke="#fff" stroke-width="1.6"/>`;
      s+=`<path d="M ${pad+cw*0.5} ${y0} L ${pad+cw*0.5} ${y0+dir*ch*2.2} A ${cw*3.5} ${ch*4.3} 0 0 ${top?0:1} ${w-pad-cw*0.5} ${y0+dir*ch*2.2} L ${w-pad-cw*0.5} ${y0}" fill="none" stroke="#fff" stroke-width="1.6"/>`;
      s+=`<circle cx="${w/2}" cy="${y0+dir*ch*1.1}" r="${cw*0.42}" fill="none" stroke="#ffd9a0" stroke-width="2"/>`;
      s+=`<line x1="${w/2-cw*0.9}" y1="${y0+dir*ch*0.55}" x2="${w/2+cw*0.9}" y2="${y0+dir*ch*0.55}" stroke="#fff" stroke-width="3"/>`;
    }
    return {svg:s,X,Y,cw,ch};
  }
  function piece(g,p){
    const x=g.X(p.r), y=g.Y(p.c), R=g.cw*0.36;
    const col=p.team==='off'?OFF_COL:DEF_COL, dark=p.team==='off'?OFF_DARK:DEF_DARK;
    let s='';
    if(p.dim)s+=`<g opacity=".45">`;
    if(p.halo)s+=`<circle cx="${x}" cy="${y}" r="${R*1.9}" fill="none" stroke="#fff" stroke-width="3" opacity=".95"/><circle cx="${x}" cy="${y}" r="${R*1.9}" fill="#fff" opacity=".18"/>`;
    if(p.target)s+=`<circle cx="${x}" cy="${y}" r="${R*1.6}" fill="none" stroke="#7ff08a" stroke-width="2.5" stroke-dasharray="4 3"/>`;
    s+=`<ellipse cx="${x}" cy="${y+R*0.9}" rx="${R*1.1}" ry="${R*0.45}" fill="rgba(0,0,0,.35)"/>`;
    s+=`<circle cx="${x}" cy="${y}" r="${R}" fill="${col}" stroke="${dark}" stroke-width="2"/>`;
    if(p.n!=null)s+=`<text x="${x}" y="${y+R*0.42}" text-anchor="middle" font-size="${R*1.15}" font-weight="800" fill="${dark}" font-family="Archivo,system-ui,sans-serif">${p.n}</text>`;
    if(p.ball)s+=`<circle cx="${x+R*0.95}" cy="${y-R*0.8}" r="${R*0.5}" fill="#e8622a" stroke="#3a1a08" stroke-width="1.5"/>`;
    if(p.tag){const tw=p.tag.length*6.2+10;const tc=p.tagCol||'#111';const tb=p.tagBg||'#ffe9b0';
      const ty=p.c>=13?y+R*1.45:y-R*2.55;s+=`<rect x="${x-tw/2}" y="${ty}" width="${tw}" height="15" rx="4" fill="${tb}" stroke="rgba(0,0,0,.35)"/><text x="${x}" y="${ty+11}" text-anchor="middle" font-size="9.5" font-weight="800" fill="${tc}" font-family="'Space Mono',monospace">${p.tag}</text>`;}
    if(p.dim)s+=`</g>`;
    return s;
  }
  function arrow(g,a){
    const x1=g.X(a.from[1]),y1=g.Y(a.from[0]),x2=g.X(a.to[1]),y2=g.Y(a.to[0]);
    const col=a.col||'#fff';
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${a.dash?'6 5':'0'}" marker-end="url(#ah)"/>`;
  }
  function tiles(g,list,col){
    return list.map(t=>`<rect x="${g.X(t[1])-g.cw/2}" y="${g.Y(t[0])-g.ch/2}" width="${g.cw}" height="${g.ch}" fill="${col||'rgba(127,240,138,.45)'}" stroke="#7ff08a" stroke-width="1.5"/>`).join('');
  }
  function zone(g,list,col){
    return list.map(t=>`<rect x="${g.X(t[1])-g.cw/2}" y="${g.Y(t[0])-g.ch/2}" width="${g.cw}" height="${g.ch}" fill="${col||'rgba(91,143,214,.35)'}"/>`).join('');
  }
  /* frame spec: {title, announcer, clock:{game,shot,q}, whose:'you'|'them'|null,
     pieces:[{team,c,r,n,ball,halo,dim,target}], arrows:[], tiles:[], zones:[],
     choices:[{label,sub,primary,dim}], note, slam:'YOUR BALL'|..., card:{q,answers},
     camera:'full'|'tight', dimCourt:bool} */
  window.drawFrame=function(f,opts){
    opts=opts||{}; const scale=opts.scale||0.5;
    const W=390,H=844;
    const courtH=f.card?300:((f.header||f.balls)?520:560), courtW=W-24;
    const g=court(courtW,courtH,10);
    let svg=`<svg viewBox="0 0 ${courtW} ${courtH}" width="${courtW}" height="${courtH}"><defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#fff"/></marker></defs>${g.svg}`;
    if(f.zones)svg+=zone(g,f.zones);
    if(f.lastMove){const col=f.lastMove.col||'rgba(91,143,214,.5)';svg+=zone(g,[f.lastMove.from,f.lastMove.to],col);}
    if(f.duel){const a=f.duel[0],b=f.duel[1];svg+=`<line x1="${g.X(a[1])}" y1="${g.Y(a[0])}" x2="${g.X(b[1])}" y2="${g.Y(b[0])}" stroke="#ff6a5a" stroke-width="2.5" stroke-dasharray="3 4" opacity=".9"/>`;}
    if(f.tiles)svg+=tiles(g,f.tiles);
    if(f.ptiles)svg+=f.ptiles.map(t=>`<rect x="${g.X(t[1])-g.cw/2}" y="${g.Y(t[0])-g.ch/2}" width="${g.cw}" height="${g.ch}" fill="rgba(255,150,40,.55)" stroke="#ffb03a" stroke-width="1.5"/>`).join('');
    if(f.xtiles)svg+=f.xtiles.map(t=>`<rect x="${g.X(t[1])-g.cw/2}" y="${g.Y(t[0])-g.ch/2}" width="${g.cw}" height="${g.ch}" fill="rgba(0,0,0,.6)"/>`).join('');
    (f.pieces||[]).forEach(p=>svg+=piece(g,p));
    (f.arrows||[]).forEach(a=>svg+=arrow(g,a));
    if(f.dimCourt)svg+=`<rect x="0" y="0" width="${courtW}" height="${courtH}" fill="rgba(0,0,0,.55)"/>`;
    svg+='</svg>';
    const clock=f.clock||{};
    const whoseCls=f.whose==='you'?'you':(f.whose==='them'?'them':'none');
    const shotBig=clock.shot!=null&&clock.shot<=5;
    let h=`<div class="phone" style="--s:${scale}"><div class="ph-in">`;
    h+=`<div class="hud"><div class="score"><span class="tm off">TOWN</span><b>${clock.you??0}</b><span class="gc">${clock.game||'6:12'}</span><b>${clock.them??0}</b><span class="tm def">CREAM</span></div>`;
    h+=`<div class="shot ${shotBig?'hot':''} ${clock.shot==null?'off':''} ${clock.side==='them'?'blue':''} ${clock.frozen?'frozen':''}">${clock.shot==null?'':clock.shot}</div></div>`;
    h+=`<div class="ann ${whoseCls}">${f.announcer||''}</div>`;
    h+=`<div class="courtwrap ${f.camera==='tight'?'tight':''}">${svg}`;
    if(f.slam)h+=`<div class="slam ${whoseCls}">${f.slam}</div>`;
    if(f.qclock!=null)h+=`<div class="qclock">${f.qclock}</div>`;
    h+=`</div>`;
    if(f.card){
      h+=`<div class="card"><div class="cq">${f.card.q}</div>${(f.card.answers||[]).map((a,i)=>`<div class="ca ${a.pick?'pick':''}">${a.t||a}</div>`).join('')}</div>`;
    }
    h+=`<div class="dock ${whoseCls} ${f.header||f.balls?'tall':''}">`;
    if(f.header||f.balls){h+=`<div class="hdr"><span>${f.header||''}</span>${f.balls?`<b class="balls">${f.balls}</b>`:''}</div>`;}
    if(f.choices&&f.choices.length){
      h+=`<div class="choices n${f.choices.length}">`+f.choices.map(c=>`<button class="ch ${c.primary?'primary':''} ${c.dim?'dim':''}">${c.label}${c.sub?`<small>${c.sub}</small>`:''}</button>`).join('')+`</div>`;
    } else if(f.strip){
      h+=`<div class="strip">${f.strip}</div>`;
    } else if(f.wait){
      h+=`<div class="wait">${f.wait}</div>`;
    }
    h+=`</div>`;
    if(f.topRow){h+=`<div class="toprow"><div class="hdr"><span>${f.topRow.header||''}</span></div><div class="choices n${f.topRow.choices.length}">`+f.topRow.choices.map(c=>`<button class="ch ${c.primary?'primary':''} ${c.dim?'dim':''}">${c.label}${c.sub?`<small>${c.sub}</small>`:''}</button>`).join('')+`</div></div>`;}
    h+=`</div>`;
    h+=`<div class="cap"><b>${f.beat!=null?'Moment '+f.beat+' · ':''}${f.title||''}</b>${f.note?`<span>${f.note}</span>`:''}${f.meta?`<em>${f.meta}</em>`:''}</div></div>`;
    return h;
  };
  window.FLOWKIT_CSS=`
  .phone{display:inline-block;vertical-align:top;width:calc(390px*var(--s));margin:6px}
  .ph-in{width:390px;height:844px;transform:scale(var(--s));transform-origin:0 0;background:#14100c;border-radius:34px;overflow:hidden;position:relative;font-family:Archivo,system-ui,sans-serif;color:#efe6d5;box-shadow:0 0 0 6px #2a221a,0 12px 30px rgba(0,0,0,.6)}
  .phone{height:calc(844px*var(--s) + 74px)}
  .hud{height:72px;background:#1d1610;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 16px;border-bottom:1px solid rgba(255,176,58,.25)}
  .score{display:flex;align-items:center;gap:10px;font-family:'Space Mono',monospace;font-size:18px}
  .score b{font-size:26px;color:#ffb03a}.score .gc{font-size:15px;color:#b7a687;padding:0 6px}
  .score .tm{font-size:11px;letter-spacing:.14em;font-weight:700}.tm.off{color:#f0a83a}.tm.def{color:#7fb2cc}
  .shot{font-family:'Space Mono',monospace;font-size:28px;font-weight:700;color:#ffb03a;background:#0d0906;border:2px solid rgba(255,176,58,.5);border-radius:10px;padding:2px 10px;min-width:56px;text-align:center;transition:all .2s}
  .shot.hot{color:#fff;background:#d1361f;border-color:#ff8a6a;font-size:34px;box-shadow:0 0 22px #ff5a3a}
  .shot.off{opacity:.25}
  .shot.blue{color:#7fb2cc;border-color:rgba(127,178,204,.6)}
  .shot.frozen{opacity:.45}
  .ann{height:54px;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 22px;font-size:19px;font-weight:700;line-height:1.15;background:#0d0906}
  .ann.you{color:#ffb03a}.ann.them{color:#7fb2cc}.ann.none{color:#b7a687;font-weight:500}
  .courtwrap{position:relative;padding:6px 12px 0;background:radial-gradient(ellipse at 50% 30%,#2a3b4a,#0d1218 70%)}
  .courtwrap.tight svg{transform:scale(1.55) translateY(14%);transform-origin:50% 0}
  .courtwrap{overflow:hidden}
  .slam{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-6deg);font-size:54px;font-weight:900;letter-spacing:.02em;text-transform:uppercase;text-shadow:0 6px 0 #000,0 0 30px rgba(0,0,0,.8);white-space:nowrap}
  .slam.you{color:#ffb03a}.slam.them{color:#7fb2cc}.slam.none{color:#fff}
  .qclock{position:absolute;right:20px;top:14px;font-family:'Space Mono',monospace;font-size:30px;font-weight:700;color:#fff;background:#d1361f;border-radius:50%;width:64px;height:64px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px #ff5a3a}
  .card{margin:10px 14px 0;background:#1d1610;border:1.5px solid #ffb03a;border-radius:16px;padding:14px}
  .cq{font-size:20px;font-weight:800;text-transform:uppercase;text-align:center;margin-bottom:10px;line-height:1.15}
  .ca{background:#2a221a;border-radius:10px;padding:10px 12px;margin:6px 0;font-size:16px}
  .ca.pick{background:#ffb03a;color:#1c0f02;font-weight:700}
  .dock{position:absolute;left:0;right:0;bottom:0;height:150px;padding:14px 14px 22px;background:linear-gradient(transparent,#14100c 30%)}
  .choices{display:flex;gap:10px;height:100%}
  .choices .ch{flex:1;border-radius:16px;border:2px solid rgba(255,176,58,.5);background:#2a221a;color:#efe6d5;font:800 20px Archivo,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.04em;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
  .choices .ch small{font:600 12px Archivo,system-ui,sans-serif;text-transform:none;letter-spacing:0;color:#b7a687}
  .choices .ch.primary{background:#ffb03a;color:#1c0f02;border-color:#ffb03a}.choices .ch.primary small{color:#5a3a10}
  .choices .ch.dim{opacity:.35}
  .dock.them .choices .ch{border-color:rgba(127,178,204,.5)}.dock.them .choices .ch.primary{background:#7fb2cc;border-color:#7fb2cc}
  .wait{height:100%;display:flex;align-items:center;justify-content:center;color:#8a7a5e;font-size:16px;letter-spacing:.12em;text-transform:uppercase;border:1.5px dashed rgba(255,255,255,.12);border-radius:16px}
  .dock.tall{height:190px}
  .hdr{display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:700;color:#efe6d5;padding:0 4px 8px}
  .dock.them .hdr{color:#7fb2cc}.dock.you .hdr{color:#ffb03a}
  .balls{font-family:'Space Mono',monospace;font-size:18px;letter-spacing:.1em}
  .strip{height:56px;margin-top:auto;display:flex;align-items:center;justify-content:center;border-radius:14px;background:#1d1610;border:1.5px solid rgba(127,178,204,.35);color:#7fb2cc;font:700 15px Archivo,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
  .dock.you .strip{border-color:rgba(255,176,58,.35);color:#ffb03a}
  .dock.none .strip{color:#8a7a5e;border-style:dashed}
  .toprow{position:absolute;left:0;right:0;top:72px;padding:8px 14px 10px;background:linear-gradient(#14100c 60%,transparent);transform:rotate(180deg)}
  .toprow .choices{height:64px}.toprow .ch{font-size:15px}.toprow .hdr{font-size:13px;color:#7fb2cc;padding-bottom:6px}
  .cap{width:calc(390px*var(--s));font:13px/1.35 Archivo,system-ui,sans-serif;color:#b7a687;padding:6px 2px}
  .cap b{display:block;color:#efe6d5;font-size:13.5px}.cap span{display:block;margin-top:2px}.cap em{display:block;color:#8a7a5e;font-style:normal;font-family:'Space Mono',monospace;font-size:11px;margin-top:3px}
  `;
})();

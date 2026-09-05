/* The play-pick screen the owner described on 09-05: the list takes most of
   the screen, a small top-down board above it moves the pieces into the shape
   of whichever play is tapped. Concept mock, not product code. */
(function(){
  const COLS=15, ROWS=8;
  /* the shapes shipped in game.js (MB_OFF / MB_DEF), attacking the right rim */
  const OFF={
    'HORNS':   {PG:[9,3], SG:[13,0],SF:[13,7],PF:[11,5],C:[11,2]},
    'FIVE-OUT':{PG:[9,3], SG:[10,1],SF:[10,6],PF:[13,0],C:[13,7]},
    'FLOPPY':  {PG:[9,3], SG:[13,4],SF:[10,1],PF:[12,5],C:[12,2]},
    'BOX':     {PG:[9,3], SG:[11,2],SF:[11,5],PF:[13,2],C:[13,5]},
    '4-LOW':   {PG:[9,3], SG:[13,0],SF:[13,2],PF:[13,5],C:[13,7]},
    'ZIPPER':  {PG:[9,3], SG:[12,3],SF:[13,7],PF:[10,1],C:[11,3]}
  };
  const DEF={
    'MAN TO MAN':   {PG:[10,3],SG:[11,1],SF:[11,6],PF:[12,5],C:[12,2]},
    '2-3 ZONE':     {PG:[11,2],SG:[11,5],SF:[13,6],PF:[13,1],C:[12,3]},
    'BOX AND ONE':  {PG:[10,4],SG:[11,2],SF:[11,5],PF:[13,2],C:[13,5]},
    'FULL COURT PRESS':{PG:[0,2], SG:[3,1], SF:[3,5], PF:[7,4], C:[11,3]}
  };
  /* player-language one-liners: what the shape DOES, no coaching vocabulary */
  const BLURB={
    'HORNS':'Two big men up high, shooters in both corners. Lots of ways to score.',
    'FIVE-OUT':'Everyone spread around the arc. Open lanes to drive, threes everywhere.',
    'FLOPPY':'Your best shooter starts under the rim and runs out for a look.',
    'BOX':'A tight square under the rim. Safe against any defense.',
    '4-LOW':'Four along the baseline, one ball handler up top. Room to work.',
    'ZIPPER':'A stacked line that unzips into an open shot.',
    'MAN TO MAN':'Everyone guards one player. Honest, no gaps.',
    '2-3 ZONE':'Two up, three back. The paint is packed; the arc is open.',
    'BOX AND ONE':'Four in a box, one player shadowing their star.',
    'FULL COURT PRESS':'Pressure from the inbound. Steals, or a fast break the other way.'
  };
  const ROLES=['PG','SG','SF','PF','C'];
  function miniCourt(w,h,pad,half){
    /* landscape: columns left to right; half = right half only (attacking) */
    const c0=half?7:0, nC=COLS-c0;
    const cw=(w-pad*2)/nC, ch=(h-pad*2)/ROWS;
    const X=c=>pad+(c-c0+0.5)*cw, Y=r=>pad+(r+0.5)*ch;
    let s=`<rect x="${pad}" y="${pad}" width="${w-pad*2}" height="${h-pad*2}" rx="4" fill="#c8924f"/>`;
    for(let c=c0;c<COLS;c++)for(let r=0;r<ROWS;r++){
      const zone=c>=12?'#d9a45c':(c>=9?'#cf9852':'#c8924f');
      s+=`<rect x="${pad+(c-c0)*cw}" y="${pad+r*ch}" width="${cw}" height="${ch}" fill="${zone}" stroke="rgba(0,0,0,.16)" stroke-width=".5"/>`;
    }
    const xr=w-pad, yc=h/2;
    s+=`<rect x="${xr-cw*4.2}" y="${yc-ch*1.5}" width="${cw*4.2}" height="${ch*3}" fill="none" stroke="#fff" stroke-width="1.3"/>`;
    s+=`<path d="M ${xr} ${pad+ch*0.5} L ${xr-cw*2.2} ${pad+ch*0.5} A ${cw*4.3} ${ch*3.5} 0 0 0 ${xr-cw*2.2} ${h-pad-ch*0.5} L ${xr} ${h-pad-ch*0.5}" fill="none" stroke="#fff" stroke-width="1.3"/>`;
    s+=`<circle cx="${xr-cw*1.1}" cy="${yc}" r="${ch*0.3}" fill="none" stroke="#ffd9a0" stroke-width="1.6"/>`;
    if(!half){s+=`<line x1="${w/2}" y1="${pad}" x2="${w/2}" y2="${h-pad}" stroke="#fff" stroke-width="1.3"/>`;}
    return {svg:s,X,Y,cw,ch};
  }
  function dot(g,x,y,col,dark,label,r){
    return `<g class="pc" style="transform:translate(${x}px,${y}px)"><circle r="${r}" fill="${col}" stroke="${dark}" stroke-width="1.5"/><text y="${r*0.38}" text-anchor="middle" font-size="${r*0.95}" font-weight="800" fill="${dark}" font-family="Archivo,system-ui,sans-serif">${label}</text></g>`;
  }
  /* static frame for the board: {side:'off'|'def', pick:'HORNS', scale} */
  window.drawPickScreen=function(o){
    const side=o.side||'off', shapes=side==='off'?OFF:DEF, other=side==='off'?DEF:OFF;
    const pick=o.pick||Object.keys(shapes)[0];
    const otherPick=o.otherPick||(side==='off'?'MAN TO MAN':'HORNS');
    const scale=o.scale||0.5;
    const W=390, bw=362, bh=200;
    const g=miniCourt(bw,bh,8,true);
    let svg=`<svg viewBox="0 0 ${bw} ${bh}" width="${bw}" height="${bh}" class="mini">${g.svg}`;
    const mine=shapes[pick], theirs=other[otherPick];
    ROLES.forEach(k=>{const p=theirs[k]; if(p[0]>=7) svg+=dot(g,g.X(p[0]),g.Y(p[1]),side==='off'?'#5b8fd6':'#f0a83a',side==='off'?'#1f3a6e':'#7a4a0a',k,g.ch*0.36);});
    ROLES.forEach(k=>{const p=mine[k]; svg+=dot(g,g.X(p[0]),g.Y(p[1]),side==='off'?'#f0a83a':'#5b8fd6',side==='off'?'#7a4a0a':'#1f3a6e',k,g.ch*0.4);});
    svg+='</svg>';
    let h=`<div class="phone" style="--s:${scale}"><div class="ph-in pick ${side}">`;
    h+=`<div class="pk-head"><div class="pk-eyebrow">${o.when||'Start of the quarter'}</div><div class="pk-title">${side==='off'?'Pick your offense':'Pick your defense'}</div></div>`;
    h+=`<div class="pk-board">${svg}<div class="pk-boardcap">${o.boardcap||(side==='off'?'How your five will line up against their defense':'How your five will line up against their offense')}</div></div>`;
    h+=`<div class="pk-list">`;
    Object.keys(shapes).forEach(k=>{
      const on=k===pick;
      h+=`<div class="pk-card ${on?'on':''}"><div class="pk-name">${k}</div><div class="pk-blurb">${BLURB[k]}</div>${on?'<div class="pk-check">✓</div>':''}</div>`;
    });
    h+=`</div>`;
    h+=`<div class="pk-dock"><button class="pk-go">${o.go||('Run '+pick.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())+' ▸')}</button></div>`;
    h+=`</div><div class="cap"><b>${o.title||''}</b>${o.note?`<span>${o.note}</span>`:''}</div></div>`;
    return h;
  };
  window.PICK_CSS=`
  .ph-in.pick{background:#14100c}
  .pk-head{padding:26px 22px 8px}
  .pk-eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#ffb03a}
  .pk-title{font-size:30px;font-weight:900;text-transform:uppercase;letter-spacing:.01em;color:#efe6d5;line-height:1}
  .pick.def .pk-eyebrow{color:#7fb2cc}
  .pk-board{margin:6px 14px 0;background:#0d1218;border-radius:14px;padding:6px 0 4px;text-align:center}
  .pk-board svg{display:block;margin:0 auto}
  .pk-boardcap{font-size:12px;color:#8a7a5e;padding:4px 0 2px}
  .pk-list{padding:10px 14px 0;display:flex;flex-direction:column;gap:8px}
  .pk-card{position:relative;background:#1d1610;border:1.5px solid rgba(255,176,58,.22);border-radius:14px;padding:10px 54px 10px 14px}
  .pk-card.on{border-color:#ffb03a;background:#2a1e0f}
  .pick.def .pk-card.on{border-color:#7fb2cc;background:#14202b}
  .pk-name{font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:.03em;color:#efe6d5}
  .pk-blurb{font-size:13.5px;color:#b7a687;line-height:1.3;margin-top:2px}
  .pk-check{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;background:#ffb03a;color:#1c0f02;font-weight:900;display:flex;align-items:center;justify-content:center}
  .pick.def .pk-check{background:#7fb2cc}
  .pk-dock{position:absolute;left:0;right:0;bottom:0;padding:12px 14px 22px;background:linear-gradient(transparent,#14100c 35%)}
  .pk-go{width:100%;height:60px;border:0;border-radius:16px;background:#ffb03a;color:#1c0f02;font:900 20px Archivo,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.04em}
  .pick.def .pk-go{background:#7fb2cc}
  .pc{transition:transform .5s cubic-bezier(.2,.8,.2,1)}
  `;
})();

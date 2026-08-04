/* THE DAILY FIVE — two rounds of five, and a bonus round on a sweep.
   ====================================================================
   Shape locked by Aaron 2026-08-02 across two refinements (BUILD.md 22ac 35,
   design/22af-findings.md B3, mock at design/daily-five-mock.html v3):

     Round 1 — MAKE five shots. Shot cards, difficulty ramping with distance.
     Round 2 — STOP five shots. You are the rim protector now.
     10 for 10 — unlocks THE HEAT CHECK, a question style that lives only here.

   His framing, and the reason this is cheap to build: "ultimately they are all
   questions lol". The rounds are the costume. Both come off the existing bank,
   so nothing new had to be researched or merged to ship the mode.

   THE ONE THING THAT MAKES IT A DAILY: everyone gets the SAME ten cards.
   Wordle's creator is the primary source on this (22af Run B) — a different
   word each would never have caught on. So the picker is SEEDED BY THE DATE
   and touches no player state: not your roster, not your league, not your era
   filter. Two phones on the same calendar day deal the same ten cards or the
   mode is pointless.

   It lives in its own file on purpose. game.js owns the match; this owns a
   ritual that never touches the court, and keeping them apart means the daily
   can change without a rules rewrite (DESIGN §9). */
(function(){
'use strict';
var g=function(id){return document.getElementById(id)};

/* ---------- deterministic randomness -------------------------------------
   Math.random() is forbidden in here. Everything that picks anything draws
   from a stream seeded by the date string, so the set is reproducible on any
   device, in any timezone offset, forever. xmur3 + mulberry32: 20 lines,
   self-hosted, no CDN (house rule). */
function xmur3(str){
  var h=1779033703^str.length;
  for(var i=0;i<str.length;i++){
    h=Math.imul(h^str.charCodeAt(i),3432918353);
    h=h<<13|h>>>19;
  }
  return function(){
    h=Math.imul(h^h>>>16,2246822507);
    h=Math.imul(h^h>>>13,3266489909);
    return (h^=h>>>16)>>>0;
  };
}
function mulberry32(a){
  return function(){
    a|=0;a=a+0x6D2B79F5|0;
    var t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
function rngFor(seed){return mulberry32(xmur3(seed)())}

/* ---------- the ramps ----------------------------------------------------
   TUNING LEVER, and the first thing to move if the daily feels wrong.

   Shots ramp 1→4: the logo three is LEGENDARY, because a logo three should
   be. Stops top out at 3, one tier below, for two reasons — on defence you
   are reacting rather than choosing your spot, and a sweep has to stay
   reachable or the Heat Check never gets seen by anyone. Measured pools at
   build time: t1 324, t2 393, t3 402, t4 268 cards, so every slot is deep.

   Points are what the shot is worth on a real floor. Stops pay what they
   denied — you get the bucket you took away. Max 12 + 12, plus up to 6 from
   the Heat Check. */
/* cx is a PERCENT across the floor, y is pixels down from the rim, so the rack
   reads like a real court at any width: the layup sits on the rim and every
   step down the list is further out. The first pass copied the mock's absolute
   pixel offsets and put the layup out on the left wing. */
var SHOTS=[
  {k:'layup', lbl:'LAYUP',    t:1,pts:2,cx:38,y:26},
  {k:'elbow', lbl:'ELBOW',    t:2,pts:2,cx:68,y:58},
  {k:'wing',  lbl:'WING',     t:2,pts:2,cx:20,y:86},
  {k:'corner',lbl:'CORNER 3', t:3,pts:3,cx:87,y:118},
  {k:'logo',  lbl:'LOGO',     t:4,pts:3,cx:46,y:148}
];
var STOPS=[
  {k:'s1',lbl:'CONTEST',   t:1,pts:2},
  {k:'s2',lbl:'CLOSE OUT', t:2,pts:2},
  {k:'s3',lbl:'HELP SIDE', t:2,pts:2},
  {k:'s4',lbl:'AT THE RIM',t:3,pts:3},
  {k:'s5',lbl:'THE BLOCK', t:3,pts:3}
];
var MAXPTS=0;SHOTS.concat(STOPS).forEach(function(s){MAXPTS+=s.pts});
var HC_CLUE_PTS=[6,4,3,2];         /* answer on clue one for the full six */

/* ---------- the daily set ------------------------------------------------
   Deliberately NOT pickQuestionIdx: that one weights by your roster, filters
   by your era, and rolls Math.random. Every one of those would hand two
   players different cards on the same day. This honours exactly TWO filters,
   and no others.

   1. THE VERIFIED-PACK GATE — a card the gate rejects must never reach anyone
      by any door.

   2. THE V0 SCOPE BOUNDARY: NBA + WNBA + evergreen, and nothing else.
      This was missing and it was a bug, not a preference. Measured over 30 real
      days of the shipped picker: 106 of 300 cards (35%) came from outside the
      scope V0 locked — Flags, college, BIG3, Black Fives, streetball, overseas
      — and EVERY ONE of the 30 days served at least one. Worst day: 8 of 10.
      Aaron felt it as a player: "it's not fun to be asked about something you
      have no understanding of."

      The fix is NOT a per-player league setting. A setting would split twenty
      testers into twenty different games on day one and kill the only thing a
      daily has — "did you get today's?". Everyone still gets the identical ten;
      the ten just stay inside the scope that is already locked.

      Cost of restricting, measured: nothing. Thinnest slot is the tier-4 logo
      shot at 156 cards, so 156 days before anything could repeat. The other
      leagues come back when their own research lands, which is exactly what
      V0's scope boundary says. */
function gateOk(q){
  var BK=window.BK;
  return (BK&&BK._gateOk)?BK._gateOk(q):true;
}
/* 'any' is evergreen — rules, history, general basketball. It is in scope
   because it belongs to no league in particular, not because it slipped through. */
var DAILY_LEAGUES={nba:1,wnba:1,any:1};
function inScope(q){return !!DAILY_LEAGUES[q.l||'any']}
function dailyOk(q){return inScope(q)&&gateOk(q)}
function dailySet(key){
  var rnd=rngFor('bk-daily-'+key),used={},out={shots:[],stops:[]};
  function draw(tier){
    var pool=[];
    for(var i=0;i<QUESTIONS.length;i++)
      if(QUESTIONS[i].t===tier&&!used[i]&&dailyOk(QUESTIONS[i]))pool.push(i);
    if(!pool.length){                     /* a tier this thin is a data bug, not a daily */
      for(var j=0;j<QUESTIONS.length;j++)if(!used[j]&&dailyOk(QUESTIONS[j]))pool.push(j);
    }
    if(!pool.length)return 0;
    var idx=pool[Math.floor(rnd()*pool.length)];
    used[idx]=1;return idx;
  }
  SHOTS.forEach(function(s){out.shots.push(draw(s.t))});
  STOPS.forEach(function(s){out.stops.push(draw(s.t))});
  return out;
}

/* ---------- the Heat Check -----------------------------------------------
   Who am I, typed, no multiple choice, four clues at descending points. The
   candidate has to be recognisable (superstar/allstar) AND carry enough
   fields to build four clues that get progressively more specific. */
function hcCandidates(){
  if(typeof PLAYERDB==='undefined')return [];
  /* MEASURED, then tightened, because the first play-through served
     Larry "Bone Collector" Williams with one usable clue. The old filter
     (superstar OR allstar, ppg OR accolades) gave 378 candidates — including
     23 streetball and 6 Black Fives players whose box scores were never kept,
     so their clue one read "I played in the 2000s. A point guard." and their
     fame is real but league-local. That is a coin flip, not a bonus round.

     Requiring SUPERSTAR + career ppg + two accolades leaves 86: Bill Russell,
     Allen Iverson, Cheryl Miller, Caitlin Clark, Pete Maravich. It keeps the
     range that matters — 51 NBA, 14 WNBA, 4 college, 6 international, 6 flag
     — while guaranteeing four clues that actually narrow.

     THE COST, said out loud: the Heat Check will rarely surface a Black Fives
     or streetball legend, because the historical record does not carry their
     numbers. Those players belong in the regular bank, where a written
     question can carry the context a four-clue guess cannot. */
  /* Same V0 boundary as the cards. Was 86 candidates across seven leagues;
     NBA+WNBA leaves 65 (51 NBA, 14 WNBA) — still 65 days before a repeat, and
     the bonus round stops asking about leagues the daily never covers. */
  return PLAYERDB.filter(function(p){
    return p.tier==='superstar'&&(p.league==='nba'||p.league==='wnba')&&
      p.eras&&p.eras.length&&p.pos&&p.teams&&p.teams.length&&
      p.career&&p.career.ppg&&p.accolades&&p.accolades.length>=2;
  });
}
/* Every way a person might reasonably type this player. 40 records in the DB
   carry a quoted nickname (Rafer "Skip 2 My Lou" Alston) — before this, typing
   the plain "Rafer Alston" failed every branch and the card was unanswerable. */
function hcNames(p){
  var out=[p.name].concat(p.aka||[]);
  var m=p.name.match(/^(.*?)\s*"([^"]+)"\s*(.*)$/);
  if(m){
    out.push((m[1]+' '+m[3]).replace(/\s+/g,' ').trim());   /* Rafer Alston */
    out.push(m[2]);                                          /* Skip 2 My Lou */
  }
  return out;
}
function hcPlayer(key){
  var pool=hcCandidates();
  if(!pool.length)return null;
  pool=pool.slice().sort(function(a,b){return a.playerId<b.playerId?-1:1});
  return pool[Math.floor(rngFor('bk-heatcheck-'+key)()*pool.length)];
}
/* clues go vague → specific, and NEVER name the player or a team he is the
   only person to have played for in one clue that also names his number */
function hcClues(p){
  var c=[],car=p.career||{},pk=p.peak||{},hi=p.highs||{};
  var eras=p.eras.length>1?(p.eras[0]+' into the '+p.eras[p.eras.length-1]):p.eras[0];
  var one='I played '+(p.eras.length>1?'from the ':'in the ')+eras+'. '+posWord(p.pos)+'.';
  if(pk.ppg)one+=' My best year I averaged '+pk.ppg+' a night.';
  else if(car.ppg)one+=' I averaged '+car.ppg+' for my career.';
  c.push(one);
  if(p.accolades&&p.accolades.length)
    c.push(p.accolades.slice(0,3).join(' · '));
  else c.push('No banners, but '+(car.g||'plenty of')+' games in the league.');
  c.push('I wore it for '+listOf(p.teams)+'.');
  var four=[];
  if(p.num||p.num===0)four.push('Number '+p.num);
  if(car.ppg)four.push(car.ppg+' points a game, career');
  if(hi.pts)four.push('career high '+hi.pts);
  c.push(four.length?four.join(' · '):'The league leaders page has me on it.');
  return c;
}
function posWord(pos){
  var m={PG:'A point guard',SG:'A shooting guard',SF:'A small forward',
    PF:'A power forward',C:'A center',G:'A guard',F:'A forward'};
  return m[pos]||('A '+pos);
}
function listOf(a){
  if(a.length===1)return 'the '+a[0];
  if(a.length===2)return 'the '+a[0]+' and the '+a[1];
  return 'the '+a.slice(0,-1).join(', the ')+', and the '+a[a.length-1];
}

/* ---------- the type-in matcher ------------------------------------------
   Spec written by Aaron 08-02 and MEASURED against the real roster before it
   was written down (BUILD.md 22ac 35): normalize, forgive typos by edit
   distance, accept a surname alone only when it is unique in the DB — 540 of
   608 surnames are, but "Johnson" is ten different people, so an ambiguous
   surname gets a no-penalty nudge and NEVER a candidate list. A list would
   hand over the answer. */
function norm(s){
  return String(s||'').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')   /* strip accents */
    .replace(/[^a-z0-9 ]/g,'')                          /* J.J. -> jj */
    .replace(/\s+/g,' ').trim();
}
/* Damerau-Levenshtein (optimal string alignment), NOT plain Levenshtein: a
   TRANSPOSITION has to cost 1, not 2. Two swapped letters is the typo people
   actually make, and "Micheal Jordn" — one transposition, one dropped letter —
   scored 3 under plain Levenshtein and blew a budget of 2. Anyone who types
   that means Michael Jordan. */
function editDist(a,b){
  if(a===b)return 0;
  var m=a.length,n=b.length,d=[],i,j;
  for(i=0;i<=m;i++){d[i]=[];d[i][0]=i}
  for(j=0;j<=n;j++)d[0][j]=j;
  for(i=1;i<=m;i++)for(j=1;j<=n;j++){
    var cost=a[i-1]===b[j-1]?0:1;
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+cost);
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])
      d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);      /* swapped pair: one edit */
  }
  return d[m][n];
}
var SURNAMES=null;
function surnameCount(sn){
  if(!SURNAMES){
    SURNAMES={};
    if(typeof PLAYERDB!=='undefined')PLAYERDB.forEach(function(p){
      var parts=norm(p.name).split(' ');
      var last=parts[parts.length-1];
      if(last)SURNAMES[last]=(SURNAMES[last]||0)+1;
    });
  }
  return SURNAMES[sn]||0;
}
/* returns 'hit' | 'miss' | 'ambiguous' — ambiguous costs the player nothing */
function hcMatch(guess,player){
  var gn=norm(guess);if(!gn)return 'miss';
  var names=hcNames(player);
  for(var i=0;i<names.length;i++){
    var target=norm(names[i]);
    if(gn===target)return 'hit';
    var tol=target.length>10?2:1;
    if(Math.abs(gn.length-target.length)<=tol&&editDist(gn,target)<=tol)return 'hit';
  }
  /* surname alone */
  var plain=hcNames(player)[hcNames(player).length>2?2:0];
  var parts=norm(plain).split(' '),last=parts[parts.length-1];
  if(gn===last||(last.length>4&&editDist(gn,last)<=1)){
    return surnameCount(last)===1?'hit':'ambiguous';
  }
  return 'miss';
}

/* ---------- storage ------------------------------------------------------
   bk_daily5 keeps its original contract — the date string, and nothing else —
   because the menu stamp and daily-check.mjs both read it. The result rides
   alongside in bk_daily5r so the receipt survives a reload without changing
   what "done" means to anything already depending on it. */
function todayKey(d){
  d=d||new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+
         String(d.getDate()).padStart(2,'0');
}
function loadResult(){
  try{
    var r=JSON.parse(localStorage.getItem('bk_daily5r')||'null');
    return (r&&r.day===todayKey())?r:null;
  }catch(e){return null}
}
function saveResult(r){
  try{
    localStorage.setItem('bk_daily5r',JSON.stringify(r));
    localStorage.setItem('bk_daily5',r.day);      /* the stamp's contract */
  }catch(e){}
  if(window.BK&&window.BK._paintDaily)window.BK._paintDaily();
}

/* ---------- run state ---------------------------------------------------- */
var D=null;
function fresh(){
  var key=todayKey(),set=dailySet(key);
  return {day:key,set:set,round:1,i:0,shots:[],stops:[],pts:0,
    hc:null,phase:'card',locked:false};
}

/* ---------- rendering ---------------------------------------------------- */
/* IMPORT the difficulty names, never restate them. My first pass hardcoded
   this list and called tier 0 "Warm-up" when the whole rest of the game calls
   it "Casual" — one screen quietly speaking a second dialect, which is exactly
   how a colour or a word comes to mean two things. game.js owns TIERS. */
function tierName(t){
  var BK=window.BK;
  return (BK&&BK._tierName)?BK._tierName(t):'Medium';
}
function tierCls(t){return ['t0','t1','t2','t3','t4'][t]||'t2'}

function paintRack(){
  var rack=g('dvRack');if(!rack)return;
  rack.innerHTML='';
  var list=D.round===1?SHOTS:STOPS,marks=D.round===1?D.shots:D.stops;
  list.forEach(function(s,i){
    var el=document.createElement('span');
    el.className='dvspot '+(D.round===1?'sh':'st')+' '+tierCls(s.t);
    if(marks[i]!=null)el.classList.add(marks[i]?'made':'missed');
    else if(i===D.i&&!D.locked)el.classList.add('live');
    el.innerHTML='<b>'+(i+1)+'</b><small>'+s.lbl+' · '+s.pts+'</small>';
    if(D.round===1){el.style.left=s.cx+'%';el.style.top=s.y+'px'}
    rack.appendChild(el);
  });
}
function paintTabs(){
  var t=g('dvTabs');if(!t)return;
  var done1=D.shots.filter(function(x){return x!=null}).length;
  var done2=D.stops.filter(function(x){return x!=null}).length;
  var swept=D.shots.filter(Boolean).length===5&&D.stops.filter(Boolean).length===5;
  t.innerHTML=
    '<div class="dvtab'+(D.round===1?' on':'')+'"><b>ROUND 1</b>make 5 · '+done1+'/5</div>'+
    '<div class="dvtab'+(D.round===2?' on':'')+'"><b>ROUND 2</b>stop 5 · '+done2+'/5</div>'+
    '<div class="dvtab gold'+(D.phase==='bonus'?' on':'')+(swept?'':' off')+
      '"><b>BONUS</b>'+(swept?'unlocked':'go 10/10')+'</div>';
}
function showCard(){
  var list=D.round===1?SHOTS:STOPS;
  var idxs=D.round===1?D.set.shots:D.set.stops;
  var slot=list[D.i],q=QUESTIONS[idxs[D.i]];
  g('dvStage').className='dvstage r'+D.round;
  paintRack();paintTabs();
  var head=D.round===1
    ? '<span class="dvtier '+tierCls(slot.t)+'">'+slot.lbl+' · '+tierName(slot.t)+'</span>'
    : '<span class="dvtier def '+tierCls(slot.t)+'">🛡 '+slot.lbl+' · '+tierName(slot.t)+'</span>';
  g('dvCard').innerHTML=
    '<div class="dvqtop">'+head+'<span class="dvworth">'+slot.pts+' pts</span></div>'+
    '<div class="dvq"></div><div class="dvans"></div>';
  g('dvCard').querySelector('.dvq').textContent=q.q;
  var ans=g('dvCard').querySelector('.dvans');
  q.c.forEach(function(choice,ci){
    var b=document.createElement('button');
    b.className='dva';b.type='button';b.textContent=choice;
    b.addEventListener('click',function(){answer(ci)});
    ans.appendChild(b);
  });
  g('dvCard').classList.remove('hide');
  g('dvResult').classList.add('hide');
  g('dvBonus').classList.add('hide');
}
function answer(ci){
  if(D.locked)return;
  D.locked=true;
  var list=D.round===1?SHOTS:STOPS;
  var idxs=D.round===1?D.set.shots:D.set.stops;
  var slot=list[D.i],q=QUESTIONS[idxs[D.i]];
  var right=ci===q.a;
  /* ONE attempt, and the answer is NEVER shown on a miss — Aaron's B5 ruling:
     being told kills the reason to go and find out.

     ⚠️ THE SECOND HALF OF THAT RULING IS NOT BUILT, and this comment used to
     claim it was: "the card comes back in a future daily until you beat it."
     Nothing tracks a miss. The set is seeded from the DATE alone
     (rngFor('bk-daily-'+key)) and storage holds two things — the date and the
     receipt. So a card you missed returns only if the seed happens to deal it
     again, exactly as it would for someone who aced it.
     That matters because the ruling's justification RESTS on the card coming
     back. As built, a player can miss a card and simply never learn the answer.
     Filed for Aaron in V0.md; do not re-add the claim without the mechanism. */
  var btns=g('dvCard').querySelectorAll('.dva');
  btns[ci].classList.add(right?'right':'wrong');
  for(var b=0;b<btns.length;b++)btns[b].disabled=true;
  if(right)D.pts+=slot.pts;
  (D.round===1?D.shots:D.stops)[D.i]=right?1:0;
  paintRack();paintTabs();
  taunt(right,D.round);
  setTimeout(function(){
    D.locked=false;D.i++;
    if(D.i<5){showCard();return}
    if(D.round===1){D.round=2;D.i=0;roundBreak();return}
    finish();
  },right?900:1500);
}
function taunt(right,round){
  var el=g('dvTaunt');if(!el)return;
  var msg=right
    ? (round===1?['Wet.','Cash.','All net.','Splash.']:['Denied.','Not tonight.','Get that outta here.','Wall.'])
    : (round===1?['Brick. I\'ll be back.','Off the iron. I\'ll be back.']
                :['Bucket. I\'ll be back.','Scored on. I\'ll be back.']);
  el.textContent=msg[Math.floor(D.i%msg.length)];
  el.className='dvtaunt on '+(right?'good':'bad');
  setTimeout(function(){el.className='dvtaunt'},right?900:1500);
}
function roundBreak(){
  g('dvCard').innerHTML='<div class="dvbreak"><b>ROUND 2</b>'+
    '<span>Now you protect the rim. Five shots coming at you — answer to deny them.</span></div>';
  paintRack();paintTabs();
  setTimeout(function(){if(D.phase==='card')showCard()},1600);
}

/* ---------- the receipt -------------------------------------------------- */
function line(marks,made,missed){
  return marks.map(function(m){return m?made:missed}).join('');
}
function finish(){
  D.phase='result';
  var made=D.shots.filter(Boolean).length,stopped=D.stops.filter(Boolean).length;
  var swept=made===5&&stopped===5;
  var res={day:D.day,pts:D.pts,shots:D.shots.slice(),stops:D.stops.slice(),
    swept:swept,hc:D.hc};
  saveResult(res);
  paintResult(res);
}
function paintResult(res){
  var made=res.shots.filter(Boolean).length,stopped=res.stops.filter(Boolean).length;
  var swept=made===5&&stopped===5;
  g('dvCard').classList.add('hide');
  g('dvBonus').classList.add('hide');
  var r=g('dvResult');r.classList.remove('hide');
  /* three states, not two: never played it, swept but not taken yet, or done.
     Saying "locked" next to a button offering to unlock it is nonsense. */
  var hcTxt=res.hc?('heat check: '+(res.hc.got?res.hc.pts+' pts':'iced'))
    :(swept?'heat check: unlocked':'heat check: locked');
  var receipt='Ball Knowledge · The Daily Five\n'+
    prettyDay(res.day)+' · '+res.pts+' pts\n'+
    /* the shield carries U+FE0F. It is the ONLY one of these four glyphs that
       Unicode defaults to TEXT presentation, so without the selector a perfect
       5/5 renders as five hollow outlines and the receipt reads like you got
       none. Caught on a screenshot 08-04. Do not 'clean up' the invisible
       character. */
    'shots '+line(res.shots,'🏀','🧱')+'\n'+
    'stops '+line(res.stops,'🛡️','🚨')+'\n'+hcTxt;
  r.innerHTML=
    '<div class="dvbig">'+res.pts+' <span>PTS</span></div>'+
    '<div class="dvsub">'+made+'/5 shooting · '+stopped+'/5 stops · out of '+MAXPTS+'</div>'+
    '<pre class="dvreceipt" id="dvReceipt"></pre>'+
    (swept&&!res.hc?'<button class="dvbtn gold" id="dvGo">🔥 Unlock the Heat Check</button>':'')+
    '<button class="dvbtn" id="dvShare">Share the receipt</button>'+
    '<button class="dvbtn ghost" id="dvBack2">Back to the menu</button>';
  g('dvReceipt').textContent=receipt;
  paintTabs();
  var go=g('dvGo');if(go)go.addEventListener('click',startBonus);
  g('dvShare').addEventListener('click',function(){share(receipt,this)});
  g('dvBack2').addEventListener('click',function(){window.BK&&window.BK._show('title')});
}
function prettyDay(k){
  var p=k.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]);
  return d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
}
function share(txt,btn){
  var done=function(){btn.textContent='Copied ✓';
    setTimeout(function(){btn.textContent='Share the receipt'},1800)};
  if(navigator.share){navigator.share({text:txt}).then(done).catch(function(){});return}
  if(navigator.clipboard){navigator.clipboard.writeText(txt).then(done).catch(function(){});return}
  done();
}

/* ---------- the bonus round ---------------------------------------------- */
var HC=null;
function startBonus(){
  var p=hcPlayer(D.day);
  if(!p){finish();return}
  D.phase='bonus';
  HC={p:p,clues:hcClues(p),open:1,over:false};
  paintBonus();
}
function paintBonus(){
  g('dvCard').classList.add('hide');
  g('dvResult').classList.add('hide');
  var b=g('dvBonus');b.classList.remove('hide');
  paintTabs();
  var html='<div class="dvhk">THE HEAT <span>CHECK</span></div>'+
    '<p class="dvsub">Type the name. No choices to lean on. '+
    'Answer on clue one for the full '+HC_CLUE_PTS[0]+'.</p><div class="dvclues">';
  HC.clues.forEach(function(c,i){
    var open=i<HC.open;
    html+='<div class="dvclue'+(open?' open':'')+'">'+
      '<span class="dvcn">Clue '+(i+1)+' · '+HC_CLUE_PTS[i]+' pts'+(open?'':' 🔒')+'</span>'+
      (open?'<span class="dvct"></span>':'')+'</div>';
  });
  html+='</div>'+
    '<div class="dvtype"><input id="dvGuess" type="text" autocomplete="off" '+
      'autocapitalize="words" placeholder="Type the player…" aria-label="Type the player">'+
      '<button class="dvbuzz" id="dvBuzz" type="button">BUZZ</button></div>'+
    '<div class="dvnote" id="dvNote"></div>'+
    '<button class="dvbtn ghost" id="dvNext">Next clue (worth less)</button>';
  b.innerHTML=html;
  /* textContent, not innerHTML — a clue is data and must never be markup */
  var slots=b.querySelectorAll('.dvct');
  for(var i=0;i<slots.length;i++)slots[i].textContent=HC.clues[i];
  g('dvBuzz').addEventListener('click',guess);
  g('dvGuess').addEventListener('keydown',function(e){if(e.key==='Enter')guess()});
  var nx=g('dvNext');
  if(HC.open>=HC.clues.length)nx.classList.add('hide');
  nx.addEventListener('click',function(){
    if(HC.open<HC.clues.length){HC.open++;paintBonus();g('dvGuess').focus()}
  });
  g('dvGuess').focus();
}
function guess(){
  if(HC.over)return;
  var v=g('dvGuess').value;
  var verdict=hcMatch(v,HC.p);
  if(verdict==='ambiguous'){
    /* no penalty, no candidate list — a list would hand over the answer */
    g('dvNote').textContent='Need more than the family name.';
    g('dvNote').className='dvnote warn';
    return;
  }
  HC.over=true;
  var pts=verdict==='hit'?HC_CLUE_PTS[HC.open-1]:0;
  D.hc={pts:pts,got:verdict==='hit',clue:HC.open};
  D.pts+=pts;
  g('dvNote').className='dvnote '+(verdict==='hit'?'good':'bad');
  g('dvNote').textContent=verdict==='hit'
    ? 'Heat check. '+HC.p.name+' — '+pts+' pts.'
    : 'Ice cold. It was '+HC.p.name+'.';
  g('dvBuzz').disabled=true;g('dvGuess').disabled=true;
  var nx=g('dvNext');if(nx)nx.classList.add('hide');
  setTimeout(function(){
    var res=loadResult()||{day:D.day,shots:D.shots,stops:D.stops,swept:true};
    res.pts=D.pts;res.hc=D.hc;saveResult(res);paintResult(res);
  },2200);
}

/* ---------- entry -------------------------------------------------------- */
function open(){
  var prev=loadResult();
  if(prev){                            /* already played today: the receipt */
    D={day:prev.day,set:dailySet(prev.day),round:2,i:5,
       shots:prev.shots,stops:prev.stops,pts:prev.pts,hc:prev.hc,
       phase:'result',locked:true};
    g('dvDate').textContent=prettyDay(prev.day);
    paintRack();paintResult(prev);
    return;
  }
  D=fresh();
  g('dvDate').textContent=prettyDay(D.day);
  g('dvTaunt').className='dvtaunt';
  showCard();
}

window.BKDaily={
  open:open,
  /* test surface — the harness drives the real functions, never a copy */
  _set:dailySet,_key:todayKey,_inScope:inScope,_match:hcMatch,_player:hcPlayer,_clues:hcClues,
  _shots:SHOTS,_stops:STOPS,_max:MAXPTS,_cluePts:HC_CLUE_PTS,
  _state:function(){return D},_answer:answer,_norm:norm
};
})();

/* THE DAILY FIVE: two rounds of five, and a bonus round on a sweep.
   ====================================================================
   Shape locked by Aaron 2026-08-02 across two refinements (BUILD.md 22ac 35,
   design/22af-findings.md B3, mock at design/daily-five-mock.html v3):

     Round 1, MAKE five shots. Shot cards, difficulty ramping with distance.
     Round 2, STOP five shots. You are the rim protector now.
     10 for 10, unlocks THE HEAT CHECK, a question style that lives only here.

   His framing, and the reason this is cheap to build: "ultimately they are all
   questions lol". The rounds are the costume. Both come off the existing bank,
   so nothing new had to be researched or merged to ship the mode.

   THE ONE THING THAT MAKES IT A DAILY: everyone gets the SAME ten cards.
   Wordle's creator is the primary source on this (22af Run B), a different
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
   be. Stops top out at 3, one tier below, for two reasons, on defence you
   are reacting rather than choosing your spot, and a sweep has to stay
   reachable or the Heat Check never gets seen by anyone. Measured pools at
   build time: t1 324, t2 393, t3 402, t4 268 cards, so every slot is deep.

   Points are what the shot is worth on a real floor. Stops pay what they
   denied, you get the bucket you took away. Max 12 + 12, plus up to 6 from
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
/* Round 2 defends the FLOOR now (B5c): the stops are the opponent's five
   attack spots on the same court, tighter to the rim because that is where
   scoring is stopped. cx/y use round 1's grammar exactly. */
var STOPS=[
  {k:'s1',lbl:'CONTEST',   t:1,pts:2,cx:82,y:124},
  {k:'s2',lbl:'CLOSE OUT', t:2,pts:2,cx:16,y:118},
  {k:'s3',lbl:'HELP SIDE', t:2,pts:2,cx:27,y:60},
  {k:'s4',lbl:'AT THE RIM',t:3,pts:3,cx:50,y:34},
  {k:'s5',lbl:'THE BLOCK', t:3,pts:3,cx:74,y:64}
];
/* ---------- THE WORLD (Aaron, 08-16: T5+T6 mixed, "done correctly") --------
   The P2 art stops being a texture behind a stage and becomes the COURT:
   full-bleed on the screen, the five spots pinned to its painted floor, and
   the ball flying to its painted rim. That only works if the art is a
   MEASURED COORDINATE SYSTEM, which is what the T6 mock could not fake and
   why its boxes drifted: everything below maps image fractions to screen
   pixels through the same cover-crop math the CSS uses (cover, centered,
   top-anchored), so the rim lands where the paint says at every viewport.
   wx/wy are fractions of the IMAGE, not the screen. */
/* Rim MEASURED TWICE (08-16). Aaron caught the first measurement: "a bit
   off... also a bit low." The first pass read a coarse grid and landed on
   each ring's RIGHT EDGE, then the flight buried the ball a radius deep in
   the net. Second pass, 6-8x zoomed grids plus a colour scan of the iron:
   golden ring spans x 353-409 with its top plane at y 461, dusk spans
   x 363-419 with the plane at y 477. rim = the CENTRE of the iron's top
   plane; the ball-radius seat lives at the flight terminus (BALL_R), not
   here, so the swish rings can stay pinned to the mouth itself. */
var WORLD={
  golden:{iw:768,ih:1376,rim:{x:0.496,y:0.335}},
  dusk:  {iw:768,ih:1376,rim:{x:0.509,y:0.347}}
};
/* Round-1 spots RESPACED (Aaron, 08-16 late: layup sat on elbow, and the
   five should FEEL like their court spots). Anchored to the painted floor,
   which only begins at fy ~.52 (everything above is fence): LAYUP at the
   pole's base, ELBOW on the right end of the painted key line (fy .55),
   WING at that line's left reach, CORNER where the arc meets the right
   sideline, LOGO sitting on the painted centre circle. Chip is 62px wide
   CENTRED on x, top-anchored on y; every pair is >=62px apart in x or
   >=47px in y at 390x844, measured before shipping, and the harness now
   asserts no two chips intersect. */
var W_SHOTS=[{x:0.500,y:0.505},{x:0.680,y:0.545},{x:0.220,y:0.545},
             {x:0.845,y:0.578},{x:0.500,y:0.578}];
var W_STOPS=[{x:0.780,y:0.505},{x:0.300,y:0.505},{x:0.400,y:0.432},
             {x:0.558,y:0.394},{x:0.710,y:0.432}];
function dvArt(){return D&&D.round===2?WORLD.dusk:WORLD.golden}
function worldMap(fx,fy){
  /* cover, centered horizontally, anchored to the top: the one crop the CSS
     pseudo-layers use, reproduced exactly */
  var a=dvArt(),vw=window.innerWidth,vh=window.innerHeight;
  var s=Math.max(vw/a.iw,vh/a.ih);
  return [ (vw-a.iw*s)/2 + fx*a.iw*s, fy*a.ih*s ];
}
var MAXPTS=0;SHOTS.concat(STOPS).forEach(function(s){MAXPTS+=s.pts});
var HC_CLUE_PTS=[6,4,3,2];         /* answer on clue one for the full six */

/* ---------- the daily set ------------------------------------------------
   Deliberately NOT pickQuestionIdx: that one weights by your roster, filters
   by your era, and rolls Math.random. Every one of those would hand two
   players different cards on the same day. This honours exactly TWO filters,
   and no others.

   1. THE VERIFIED-PACK GATE, a card the gate rejects must never reach anyone
      by any door.

   2. THE V0 SCOPE BOUNDARY: NBA + WNBA + evergreen, and nothing else.
      This was missing and it was a bug, not a preference. Measured over 30 real
      days of the shipped picker: 106 of 300 cards (35%) came from outside the
      scope V0 locked, Flags, college, BIG3, Black Fives, streetball, overseas
, and EVERY ONE of the 30 days served at least one. Worst day: 8 of 10.
      Aaron felt it as a player: "it's not fun to be asked about something you
      have no understanding of."

      The fix is NOT a per-player league setting. A setting would split twenty
      testers into twenty different games on day one and kill the only thing a
      daily has, "did you get today's?". Everyone still gets the identical ten;
      the ten just stay inside the scope that is already locked.

      Cost of restricting, measured: nothing. Thinnest slot is the tier-4 logo
      shot at 156 cards, so 156 days before anything could repeat. The other
      leagues come back when their own research lands, which is exactly what
      V0's scope boundary says. */
function gateOk(q){
  var BK=window.BK;
  return (BK&&BK._gateOk)?BK._gateOk(q):true;
}
/* NBA, WNBA, AND THE SPORT ITSELF. Aaron, 08-05: "I do want league neutral
   questions in the daily 5."

   THE REASON THEY WERE OUT, AND WHY IT NO LONGER APPLIES. On 08-04 'any' was
   dropped because it was two things wearing one label: genuinely universal
   cards (what goaltending is, how wide the lane is) AND cards nobody had got
   round to tagging. Measured then and again today: 36 of the 165 named another
   competition outright, "Which team won the first ABA championship, in 1968?"
   was a live daily card. A rule that is 78% true is not a rule, so the whole
   pile came out.
   Rather than filter them at runtime, the 35 were TAGGED, by reading each one
   and asking what answering it REQUIRES you to know: 14 to aba, 13 to college,
   6 to fiba, one to globetrotters, one to wnba. They now fall out of scope the
   same way Flags and Street do, through the tag, with no special case.
   130 genuinely neutral cards remain and they are the sport's own basics, the
   shot clock, the free-throw line, who invented it, the original 13 rules, 
   which is exactly the material a daily should open with. Many of them were
   verified against official.nba.com today, so they are among the best-sourced
   cards in the bank.
   ONE IS DELIBERATELY LEFT NEUTRAL: f-0896, Senda Berenson organising the
   earliest women's games in the 1890s. "Smith College" is where she worked,
   not a league you must know. The answer is a decade. Tagging it college
   would be pattern-matching on a word.

   The old note, kept because the reasoning still governs what may come back:
   NBA AND WNBA. NOTHING ELSE. Aaron's rule, and it now means what it says.

   This used to include 'any' on the reasoning that 'any' means evergreen, 
   rules, history, general basketball. Aaron asked on 08-04 whether the daily
   really was NBA/WNBA only, so I counted instead of answering: of the 165
   in-scope cards tagged l:any, THIRTY-SIX are about a different competition
   entirely. Twelve on the ABA, the rest NCAA, FIBA and the Globetrotters, 
   "Which team won the first ABA championship, in 1968?" was a live daily card.
   Over a year of sets that is roughly one every five days.

   So 'any' is two things wearing one label: genuinely universal cards (what
   goaltending is, how wide the lane is) AND cards nobody got round to tagging.
   Until those 165 are re-tagged properly, the daily cannot tell them apart, and
   a rule that is 78% true is not a rule.

   Dropping 'any' costs 165 cards and buys a guarantee that needs no judgement
   to check: the daily serves cards tagged nba or wnba, and that is the entire
   test. Pools stay healthy, measured 08-04, NBA+WNBA alone gives
   t1 163 · t2 271 · t3 209 · t4 132, against a need of at most 4 from one tier
   per day. Put 'any' back in one line once RESEARCH-BACKLOG V19 has re-tagged
   it, and not before. */
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
     (superstar OR allstar, ppg OR accolades) gave 378 candidates, including
     23 streetball and 6 Black Fives players whose box scores were never kept,
     so their clue one read "I played in the 2000s. A point guard." and their
     fame is real but league-local. That is a coin flip, not a bonus round.

     Requiring SUPERSTAR + career ppg + two accolades leaves 86: Bill Russell,
     Allen Iverson, Cheryl Miller, Caitlin Clark, Pete Maravich. It keeps the
     range that matters, 51 NBA, 14 WNBA, 4 college, 6 international, 6 flag
, while guaranteeing four clues that actually narrow.

     THE COST, said out loud: the Heat Check will rarely surface a Black Fives
     or streetball legend, because the historical record does not carry their
     numbers. Those players belong in the regular bank, where a written
     question can carry the context a four-clue guess cannot. */
  /* Same V0 boundary as the cards. Was 86 candidates across seven leagues;
     NBA+WNBA leaves 65 (51 NBA, 14 WNBA), still 65 days before a repeat, and
     the bonus round stops asking about leagues the daily never covers. */
  return PLAYERDB.filter(function(p){
    return p.tier==='superstar'&&(p.league==='nba'||p.league==='wnba')&&
      p.eras&&p.eras.length&&p.pos&&p.teams&&p.teams.length&&
      p.career&&p.career.ppg&&p.accolades&&p.accolades.length>=2;
  });
}
/* Every way a person might reasonably type this player. 40 records in the DB
   carry a quoted nickname (Rafer "Skip 2 My Lou" Alston), before this, typing
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
   distance, accept a surname alone only when it is unique in the DB, 540 of
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
   actually make, and "Micheal Jordn": one transposition, one dropped letter, 
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
/* returns 'hit' | 'miss' | 'ambiguous'. Ambiguous costs the player nothing */
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
   bk_daily5 keeps its original contract, the date string, and nothing else, 
   because the menu stamp and daily-check.mjs both read it. The result rides
   alongside in bk_daily5r so the receipt survives a reload without changing
   what "done" means to anything already depending on it. */
function todayKey(d){
  d=d||new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+
         String(d.getDate()).padStart(2,'0');
}
/* ---------- A RUN IN PROGRESS (D10) -----------------------------------------
   Aaron, 2026-08-07: *"if you leave daily five in the middle of it, the player
   gets to start over, that's not good."* It is a fairness hole, and in the one
   mode whose entire premise is that everyone faced the same ten under the same
   conditions.

   HIS RULE, and it is better than the two I offered him: **leave mid-question
   and that question is simply wrong. You come back at the NEXT one.** He got
   there by rejecting freeze-on-leave himself -- *"I want to say freeze on leave
   but it's too gameable"* -- and he is right, because freezing turns
   backgrounding the app into free thinking time on a timed card.

   It is also the simplest of the three to build, which is worth noticing. There
   is no remaining-clock to store, no resume-the-timer, no divergence between
   what the clock said when you left and what it says when you return. The
   awkward state cannot exist because leaving RESOLVES the card instead of
   suspending it.

   bk_daily5p is the in-progress key. It is separate from bk_daily5 (the date
   the stamp reads) and bk_daily5r (the finished receipt) on purpose: those two
   have contracts other code depends on, and an unfinished run is neither. */
function loadRun(){
  try{
    var r=JSON.parse(localStorage.getItem('bk_daily5p')||'null');
    return (r&&r.day&&r.shots&&r.stops)?r:null;
  }catch(e){return null}
}
function saveRun(){
  if(!D||D.phase==='result')return;
  try{
    localStorage.setItem('bk_daily5p',JSON.stringify({
      day:D.day,round:D.round,i:D.i,pts:D.pts,
      shots:D.shots.slice(),stops:D.stops.slice()
    }));
  }catch(e){}
}
function clearRun(){try{localStorage.removeItem('bk_daily5p')}catch(e){}}

/* THE CARD YOU WALKED OUT ON. Called when the tab is hidden or closed while a
   card is live: score it wrong, step past it, and write that down -- all
   synchronously, because pagehide gives you no second chance and a phone that
   simply sleeps may give you nothing at all.
   Deliberately NOT answer(-1): that path paints, taunts, plays a buzzer and
   sets a timer, none of which can be trusted to finish on a page going away,
   and all of which would be theatre for a screen nobody is looking at. */
function abandonCard(){
  if(!D||D.phase!=='card'||D.locked)return;
  /* ONCE PER CARD, and this guard is the whole reason the function is safe to
     wire to three different events.
     I wrote "it is idempotent" in the comment above and did not check. It was
     not: a page RELOAD fires pagehide AND beforeunload (and visibilitychange
     on some browsers), so one refresh abandoned THREE cards -- measured,
     round 1 card 3 came back as round 2 card 1. The harness caught it; the
     comment claiming the property did not.
     D.gone is cleared by showCard(), so the next live card can be abandoned in
     its turn and no more than once. */
  if(D.gone)return;
  D.gone=true;
  (D.round===1?D.shots:D.stops)[D.i]=0;
  D.i++;
  if(D.i>=5&&D.round===1){D.round=2;D.i=0;}
  saveRun();
}

function loadResult(){
  try{
    var r=JSON.parse(localStorage.getItem('bk_daily5r')||'null');
    return (r&&r.day===todayKey())?r:null;
  }catch(e){return null}
}

/* ---------- the history, added 08-04 for streaks -------------------------
   bk_daily5h is a map of dateKey -> a small record. It is deliberately SEPARATE
   from the two keys above rather than replacing them: bk_daily5 is the stamp's
   contract and daily-check.mjs reads it, bk_daily5r is today's receipt. Adding
   a third key means nothing that already works has to change.

   Kept tiny on purpose, because this grows by one entry a day forever:
     p  points        s  the five shot marks     t  the five stop marks
     h  heat check pts, or 0        L  1 if it was played LATE, not on the day
   A year is about 60 characters a day. Ten years still fits in localStorage. */
function loadHist(){
  try{return JSON.parse(localStorage.getItem('bk_daily5h')||'{}')||{}}
  catch(e){return {}}
}
function saveHist(h){
  try{localStorage.setItem('bk_daily5h',JSON.stringify(h))}catch(e){}
}
function histAdd(res){
  var h=loadHist();
  h[res.day]={p:res.pts,s:res.shots.slice(),t:res.stops.slice(),
              h:(res.hc&&res.hc.got)?res.hc.pts:0,
              L:res.day===todayKey()?0:1};
  saveHist(h);
  return h;
}

/* THE THREE MARKS, in one place so the calendar and any future screen cannot
   disagree about what a day earned.
     crown  all eleven · swept the ten AND took the Heat Check
     star   played ON the day itself, whatever the score
     check  played, but caught up later
   Ranked, not exclusive: a made-up day that goes 11/11 still earns the crown,
   because Aaron's rule was "any days where all 11 were completed". */
/* FOUR STATES, because there are two questions and each has two answers:
   did you get all eleven, and did you do it on the day?

                       not all eleven        all eleven
     on the day        gold star             gold crown, filled
     caught up later   green check           green crown, hollow

   Aaron caught this on 08-04: the first cut collapsed the top-right and
   bottom-right into one gold crown, so catching up a perfect day looked exactly
   like nailing it on the day. Two axes, four cells, and the legend has to show
   all four or the language is only half-taught.

   COLOUR SAYS WHEN, SHAPE SAYS WHAT. Gold means you were there on the day;
   green means you came back for it. Crown means all eleven; star and check mean
   you played. That way neither channel has to carry the whole message, which is
   the rule this project keeps relearning. */
function markFor(rec){
  if(!rec)return null;
  var made=rec.s.filter(Boolean).length+rec.t.filter(Boolean).length;
  var lvl=(made===10&&rec.h>0)?'crown':(made===10?'star':'check');
  return rec.L?lvl+'late':lvl;
}


/* The streak is consecutive days ending today (or yesterday, so a day you have
   not played yet does not read as a broken streak before you have had a chance).
   A day you go back and make up REPAIRS the streak, that is what makes missed
   days worth keeping playable, and it is why this counts history rather
   than tracking a running number that can only ever go down. */
function streakFrom(h,today){
  var d=new Date(today+'T00:00:00'),n=0;
  if(!h[keyOf(d)])d.setDate(d.getDate()-1);      /* today still open */
  while(h[keyOf(d)]){n++;d.setDate(d.getDate()-1)}
  return n;
}
function keyOf(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+
         String(d.getDate()).padStart(2,'0');
}

function saveResult(r){
  try{
    /* Only TODAY touches the stamp's two keys. Catching up on the 2nd of the
       month must not tell the menu you have done the 4th, and must not replace
       the receipt the 4th is showing. Every day, today or not, lands in the
       history. */
    if(r.day===todayKey()){
      localStorage.setItem('bk_daily5r',JSON.stringify(r));
      localStorage.setItem('bk_daily5',r.day);    /* the stamp's contract */
    }
  }catch(e){}
  histAdd(r);
  if(window.BK&&window.BK._paintDaily)window.BK._paintDaily();
}

/* ---------- run state ---------------------------------------------------- */
var D=null;
function fresh(key){
  key=key||todayKey();
  return {day:key,set:dailySet(key),round:1,i:0,shots:[],stops:[],pts:0,
    hc:null,phase:'card',locked:false};
}

/* ---------- rendering ---------------------------------------------------- */
/* IMPORT the difficulty names, never restate them. My first pass hardcoded
   this list and called tier 0 "Warm-up" when the whole rest of the game calls
   it "Casual": one screen quietly speaking a second dialect, which is exactly
   how a colour or a word comes to mean two things. game.js owns TIERS. */
function tierName(t){
  var BK=window.BK;
  return (BK&&BK._tierName)?BK._tierName(t):'Medium';
}
function tierCls(t){return ['t0','t1','t2','t3','t4'][t]||'t2'}

function paintRack(){
  var rack=g('dvRack');if(!rack)return;
  /* THE STAGE CLASS BELONGS HERE, with the thing it governs.
     Aaron, 2026-08-07, describing it exactly: "the court with the five
     questions but all the squares pushed to the left and then suddenly the
     defense screen shows".
     BOTH rounds are absolutely positioned on the court from their own cx/y
     now (B5c, 08-16): round 2 stopped being a static strip when Defend the
     Floor shipped, and the r2 class only flips the floor to dusk. The
     history that put the class HERE still governs: it used to be set only
     inside showCard(), so roundBreak(), which flips D.round and repaints
     the rack, left the stage saying r1 for the whole 1600ms of the break.
     Setting it here means the stage and the spots are written by the same
     function and cannot disagree.
     I FIXED THE CARD HEIGHT FOR THIS REPORT YESTERDAY AND CALLED IT DONE. The
     height snap was real and was one of two problems; I never opened paintRack.
     A symptom that survives the fix means the diagnosis was partial. */
  g('dvStage').className='dvstage r'+D.round;
  /* THE WORLD rides the round too: the whole screen flips golden -> dusk at
     the change of ends (a real crossfade, two pseudo-layers trading opacity,
     which also closes the hard-cut item the 08-16 review filed) */
  var scr=document.getElementById('screen-daily');
  if(scr){scr.classList.add('world');scr.classList.toggle('world2',D.round===2)}
  rack.innerHTML='';
  var list=D.round===1?SHOTS:STOPS,marks=D.round===1?D.shots:D.stops;
  var wlist=D.round===1?W_SHOTS:W_STOPS;
  var srect=g('dvStage').getBoundingClientRect();
  list.forEach(function(s,i){
    var el=document.createElement('span');
    el.className='dvspot '+(D.round===1?'sh':'st')+' '+tierCls(s.t);
    if(marks[i]!=null)el.classList.add(marks[i]?'made':'missed');
    else if(i===D.i&&!D.locked)el.classList.add('live');
    el.innerHTML='<b>'+(i+1)+'</b><small>'+s.lbl+' · '+s.pts+'</small>';
    /* both rounds live on the court now (B5c), pinned to the ART's painted
       floor: image fractions through the cover-crop map, then into stage
       space. The old cx/y grammar stays on the rows for a clean revert. */
    var w=wlist[i],pt=worldMap(w.x,w.y);
    el.dataset.wx=w.x;el.dataset.wy=w.y;
    el.style.left=(pt[0]-srect.left)+'px';el.style.top=(pt[1]-srect.top)+'px';
    rack.appendChild(el);
  });
  /* the swish rings live at the ART's rim now, not a CSS court's */
  var a=dvArt(),rp=worldMap(a.rim.x,a.rim.y),sw=g('dvSwish');
  if(sw){sw.style.left=(rp[0]-srect.left)+'px';sw.style.top=(rp[1]-srect.top)+'px';
    sw.style.marginLeft='0'}
  /* THE SHEET IS A CEILING (Aaron, 08-16, from his phone: "logo question 5
     is sitting on top of the timer"), AND THE DOOR IS A LIAR (his second
     phone catch, same day: rings and spots sat low-left of where the ball
     landed). open() paints while the .44s screen pan is still running, so
     the stage rect measured above is a MID-ANIMATION rect; the ball never
     drifted because the flight measures fresh at takeoff. So the paint above
     is only a first guess, and dvSettle below is the authority: it waits for
     the stage rect to stop moving, re-pins every spot and the rings from
     their stored fractions, then clamps to the sheet's lip. */
  requestAnimationFrame(function(){requestAnimationFrame(function(){dvSettle(0)})});
}
function dvSettle(tries){
  var scr=document.getElementById('screen-daily');
  if(!scr||!scr.classList.contains('world'))return;
  var st=g('dvStage');if(!st)return;
  var r=st.getBoundingClientRect();
  var key=r.left.toFixed(1)+','+r.top.toFixed(1)+','+r.width.toFixed(1);
  if(key!==dvSettle._last&&tries<12){
    dvSettle._last=key;
    setTimeout(function(){dvSettle(tries+1)},130);return}
  dvSettle._last=null;
  [].forEach.call(document.querySelectorAll('.dvspot'),function(s){
    if(s.dataset.wx==null)return;
    var pt=worldMap(+s.dataset.wx,+s.dataset.wy);
    s.style.left=(pt[0]-r.left)+'px';s.style.top=(pt[1]-r.top)+'px';
  });
  var a=dvArt(),rp=worldMap(a.rim.x,a.rim.y),sw=g('dvSwish');
  if(sw){sw.style.left=(rp[0]-r.left)+'px';sw.style.top=(rp[1]-r.top)+'px'}
  var clock=g('dvClockWrap'),card=g('dvCard');
  var lip=Math.min(
    (clock&&!clock.classList.contains('hide'))?clock.getBoundingClientRect().top:Infinity,
    (card&&card.offsetParent)?card.getBoundingClientRect().top:Infinity);
  if(!isFinite(lip))return;
  /* The lift alone flattened every deep chip onto ONE row on short phones
     and stacked layup on the logo (found at 390x667 the night the spots
     were respaced). So the clamp is two passes: lift anything under the
     lip, then resolve collisions DEEP-TO-SHALLOW, so the deepest shots
     (logo, corner) keep the row at the lip and nearer shots stack ABOVE
     them. Aaron rejected the first version, which walked the other way and
     put the half-court shot above the layup: on a court, closer to the rim
     is higher on this screen, and the clamp is not allowed to break that. */
  var spots=[].slice.call(document.querySelectorAll('.dvspot'));
  spots.forEach(function(s){
    var sr=s.getBoundingClientRect(),over=sr.bottom-(lip-8);
    if(over>0)s.style.top=(parseFloat(s.style.top||'0')-over)+'px';
  });
  spots.sort(function(a,b){return (+b.dataset.wy||0)-(+a.dataset.wy||0)});
  var placed=[];
  spots.forEach(function(s){
    var guard=10;
    for(;;){
      var sr=s.getBoundingClientRect(),hit=null;
      for(var i=0;i<placed.length;i++){var p=placed[i];
        if(sr.left<p.right&&p.left<sr.right&&sr.top<p.bottom&&p.top<sr.bottom){hit=p;break}}
      if(!hit||--guard<0)break;
      s.style.top=(parseFloat(s.style.top||'0')-(sr.bottom-hit.top)-4)+'px';
    }
    placed.push(s.getBoundingClientRect());
  });
}
/* the map is viewport-shaped, so a rotate or resize re-pins everything */
window.addEventListener('resize',function(){
  var scr=document.getElementById('screen-daily');
  if(scr&&scr.classList.contains('on')&&D&&D.phase==='card')paintRack();
});
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
/* ---------- the clock ---------------------------------------------------
   Aaron, 08-04: "is there a timer on the daily? Otherwise people can just take
   time and look this stuff up... I don't mind if the timer is a little generous
   that's fine but just a little."

   There was none. The main game gives 15s a question (game.js). The daily gets
   MORE, and the number came from measuring rather than taste: across 696 cards
   in the daily pool the median card is 20 words including its four answers, the
   95th is 30, and the longest is 53, which is 17.7 SECONDS just to READ at 180
   wpm. A 15s clock would not be testing knowledge on that card, it would be
   testing reading speed. 25s leaves the longest card ~7s to think and the median
   card ~18s, and it is nowhere near enough to switch apps, type a query, and
   read a result.

   THE HEAT CHECK gets one 45s clock for the WHOLE round rather than per clue,
   which is the more interesting rule: asking for another clue already costs you
   points, and now it costs you time too. */
/* EVERY PLAYER GETS THE SAME TIME TO THINK, whatever the card and whatever
   their reading speed. Aaron, 08-04: "be generous with the timer but not too
   generous, also some people are slow readers and that's okay."

   That sentence killed the flat clock, and the measurement is why. A flat 25s
   across the 711-card daily pool leaves a SLOW reader (120wpm) this much time to
   actually think:

       20 words (median)   15.0s
       30 words (95th)     10.0s
       53 words (longest)  -1.5s      <- cannot finish READING it

   A flat clock is not one rule, it is a different rule per card, and the person
   it punishes hardest is the slow reader on the longest question. So the clock
   is READING TIME PLUS THINKING TIME:

       clock = 12s to think + however long the card takes to read at 120wpm

   120wpm is deliberately a slow reader's pace, not an average one, the whole
   point is that the floor holds for them. The result: everybody gets at least
   12 seconds of thinking on every card, and a fast reader on a short card is
   given LESS than the old flat clock (17s, not 25), not more. Generous where it
   has to be, tighter where it does not. Range across the pool is 17s to 39s,
   median 22s.

   It is still nowhere near enough to switch apps, type a query and read a
   result, which was the point of having a clock at all. */
var THINK_MS=12000, READ_WPM=120;
var HC_THINK_MS=25000;
function readMs(txt){
  var words=String(txt||'').trim().split(/\s+/).length;
  return Math.round(words/READ_WPM*60000);
}
function cardMs(q){
  return THINK_MS+readMs(q.q+' '+(q.c||[]).join(' '));
}
var clockT=null,clockRaf=null,clockEnd=0,clockTotal=0,clockOut=null,clockHeld=0;

/* PAINT AND ARM ARE THEIR OWN FUNCTIONS, because there are now two ways for a
   clock to start running: fresh from clockStart, and again from clockHold(false)
   after the coach has stopped it. The tick used to be an anonymous closure
   inside clockStart, which meant resuming would have needed a second copy of
   it, and a second copy of the bar arithmetic is exactly how a resumed clock
   comes to disagree with a fresh one about what 50% looks like. */
function clockPaint(){
  var w=g('dvClockWrap'),fill=g('dvClockFill'),num=g('dvClockNum');
  if(!w||!fill||!num)return 0;
  var left=Math.max(0,clockEnd-Date.now());
  fill.style.width=Math.min(100,left/clockTotal*100)+'%';
  num.textContent=':'+String(Math.ceil(left/1000)).padStart(2,'0');
  w.classList.toggle('low',left<=5000);
  return left;
}
function clockArm(){
  /* driven off the wall clock, not off a frame counter: a backgrounded tab
     stops painting, and a bar that pauses while the deadline does not is worse
     than no bar at all. */
  (function tick(){
    if(clockPaint()>0)clockRaf=requestAnimationFrame(tick);
    else clockRaf=null;
  })();
  clockT=setTimeout(function(){clockStop();clockOut()},
                    Math.max(0,clockEnd-Date.now()));
}
function clockStop(){
  if(clockT){clearTimeout(clockT);clockT=null}
  if(clockRaf){cancelAnimationFrame(clockRaf);clockRaf=null}
  clockHeld=0;
  var w=g('dvClockWrap');if(w){w.classList.add('hide');w.classList.remove('held')}
  var sb=g('dvStreakBtn');if(sb)sb.disabled=false;
}
function clockStart(ms,onOut){
  clockStop();
  var w=g('dvClockWrap');
  if(!w)return;
  w.classList.remove('hide');
  /* THE PAUSE LOOPHOLE. The streak button sits in the header and is reachable
     mid-card; opening the calendar over a live question would be a free timeout
     to go and look the answer up. The player cannot stop this clock, so the
     honest fix is to take the door away while a card is live rather than let
     someone stop the world with it. (The COACH can stop it, see clockHold, 
     but the coach is not a door the player can open.) */
  var sb=g('dvStreakBtn');if(sb)sb.disabled=true;
  clockTotal=ms;clockOut=onOut;
  clockEnd=Date.now()+ms;
  clockArm();
}
/* ---------- THE COACH STOPS THE CLOCK (Aaron, 2026-08-08) -------------------
   *"Make sure the coach popup pauses daily 5 gameplay."*

   He is right and the old behaviour was indefensible: the resume notice fires
   straight after showCard(), so the very first thing a returning player saw was
   a card of the coach's text sitting on top of a question whose clock was
   already burning. Reading the explanation for why you lost a card cost you the
   next one.

   Why this is NOT the pause loophole the comment above refuses to open. That
   one is about a door the PLAYER can open at will, tap the streak button, stop
   the world, go and look the answer up. Nobody can summon a coach card: they
   fire from code, once per phone, and the one that fires here is a report on
   something that has already happened. The clock stopping is the game admitting
   it interrupted you, not the player buying time.

   Hold, not stop. clockStop() ends the card; this parks the remaining time and
   hands it straight back, so a 17s card interrupted at:11 resumes at:11, 
   the bar total never changes, which is why clockTotal is left alone.

   Holding returns the MILLISECONDS parked, or 0 if there was no live clock to
   hold. coach.js uses that answer twice: to decide whether to say CLOCK STOPPED
   at all (a menu tip on the title screen holds nothing and must not claim to),
   and to print the frozen time on the card.
   Printing it there is not decoration. The bar grows a striped HELD state, and
   the before/after screenshots showed the coach card sitting squarely on top of
   it at 390px AND at 1440, so the one place the player is definitely looking
   is the only place the number is guaranteed to be readable. A cue nobody can
   see is not a cue. */
function clockHold(on){
  var w=g('dvClockWrap');
  if(on){
    if(!clockT||clockHeld)return 0;             /* nothing live, or already held */
    /* A clock nobody can see is not a clock anybody can hold. The coach card
       prints whatever this returns in its header, so vouching for a leaked
       timer while another screen is up produced "CLOCK STOPPED AT :16" over
       the Rulebook (tester #1, V0 D25). Screen off -> the timer is a leak,
       not a stake: kill it and report nothing held. */
    var scr=g('screen-daily');
    if(!scr||!scr.classList.contains('on')){clockStop();return 0}
    clockHeld=Math.max(1,clockEnd-Date.now());
    clearTimeout(clockT);clockT=null;
    if(clockRaf){cancelAnimationFrame(clockRaf);clockRaf=null}
    if(w)w.classList.add('held');
    return clockHeld;
  }
  if(!clockHeld)return false;
  clockEnd=Date.now()+clockHeld;clockHeld=0;
  if(w)w.classList.remove('held');
  clockArm();
  return true;
}
/* Opening another Heat Check clue hands back exactly the time it takes to READ
   that clue, and not a second of thinking time. Otherwise a slow reader who
   needs a third clue is paying for it twice, once in points, once in a clock
   that never accounted for the words it just put on screen. */
function clockExtend(ms){
  /* A held clock has no timeout to re-arm, the time lives in clockHeld, so
     that is the number the extension has to land on. Extending the deadline of
     a clock that is not counting would have been silently thrown away on
     resume, which is the quiet kind of wrong. */
  if(clockHeld){clockHeld+=ms;clockTotal+=ms;return}
  if(!clockT)return;
  clockEnd+=ms;clockTotal+=ms;
  clearTimeout(clockT);
  clockT=setTimeout(function(){clockStop();clockOut()},Math.max(0,clockEnd-Date.now()));
}

function showCard(){
  if(D)D.gone=false;      /* a fresh card is abandonable in its own right */
  /* theatre back on ONLY if the screen is actually up: the advance timer can
     deal the next card after the player has left, and an unconditional
     re-arm here would hand the leak right back (08-16 review find) */
  thLive=!!(g('screen-daily')&&g('screen-daily').classList.contains('on'));
  var list=D.round===1?SHOTS:STOPS;
  var idxs=D.round===1?D.set.shots:D.set.stops;
  var slot=list[D.i],q=QUESTIONS[idxs[D.i]];
  paintRack();paintTabs();
  var head=D.round===1
    ? '<span class="dvtier '+tierCls(slot.t)+'">'+slot.lbl+' · '+tierName(slot.t)+'</span>'
    : '<span class="dvtier def '+tierCls(slot.t)+'">🛡 '+slot.lbl+' · '+tierName(slot.t)+'</span>';
  g('dvCard').innerHTML=
    '<div class="dvqtop">'+head+'<span class="dvworth">'+slot.pts+' pts</span></div>'+
    '<div class="dvq"></div><div class="dvans"></div>';
  g('dvCard').querySelector('.dvq').textContent=q.q;
  cardSwapped();
  var ans=g('dvCard').querySelector('.dvans');
  q.c.forEach(function(choice,ci){
    var b=document.createElement('button');
    b.className='dva';b.type='button';b.textContent=choice;
    b.addEventListener('click',function(){sfx('select');answer(ci)});
    ans.appendChild(b);
  });
  g('dvCard').classList.remove('hide');
  g('dvResult').classList.add('hide');
  g('dvBonus').classList.add('hide');
  /* running out IS a wrong answer, answer(-1) matches no choice, so it scores
     a miss and still reveals nothing, exactly like a wrong tap. */
  clockStart(cardMs(q),function(){answer(-1)});
}
/* ---------- sound -----------------------------------------------------------
   Aaron, 2026-08-07: *"Do we have quick sounds too? Like for right or wrong?
   Maybe a swish and a bad buzzer or something... do I need to source those?"*

   No, and that is the finding. This file had ZERO BKAudio calls -- not
   the wrong sounds, none at all -- while audio.js has SYNTHESISED every one of
   them since day one, in code, with no files to source: `net` is an arpeggio
   that reads as a swish, `brick` is a noise hit, `buzzer` is the falling sweep
   that is exactly the shot-clock sound he described.

   One wrapper rather than scattered calls, so the mode's whole voice is
   readable in eight lines and the settings toggle keeps working for free
   (BKAudio.sfx already respects it). */
function sfx(name){ if(window.BKAudio) BKAudio.sfx(name); }

/* ---------- THE THEATRE (B5c, sample approved 08-11) -----------------------
   The mode used to REPORT results; now it STAGES them. Every device is the
   game's own, credited: the flight is flyBall's sine arc, the make/miss story
   is resolveShot's (arc then swish, or arc then a carom off the iron), the
   slam is the menu's .pow, the confetti is the victory screen's .ev-confetti,
   the roof-off is #fireslam, and the sounds are Aaron's SOURCED files played
   as measured WINDOWS of the originals (offsets from tools/sfx-measure.mjs,
   the same numbers the approved sample used). The synth in audio.js stays as
   the fallback voice for the first tap while a file is still decoding, and
   for any environment where fetch/decode fails: the moment never goes silent.

   Windows, cited in seconds into each file (sfx/crowd-swells.json + manifest):
     net-swish.mp3        swish 1.62+0.95 · bank 4.99+1.15
     rim-hits.mp3         clank 3.19+1.10 (the full ring)
     ball-bounce.mp3      5.99+0.50
     whistle-coach.mp3    0.13+1.30 (both blasts)
     crowd-bed-pa.mp3     102.5+5.0  · FINISHED, the late swell (his pick)
     crowd-cheer.mp3      0.85+6.5 rise · 3.5+6.5 rolling (SWEPT / ROOF)
     crowd-bed-squeaks    14.2+6.5   · ROOF layer, the announcer swell    */
var THX={
  swish:  {f:'net-swish.mp3',    off:1.62, dur:0.95},
  bank:   {f:'net-swish.mp3',    off:4.99, dur:1.15},
  rim:    {f:'rim-hits.mp3',     off:3.19, dur:1.10},
  bounce: {f:'ball-bounce.mp3',  off:5.99, dur:0.50},
  whistle:{f:'whistle-coach.mp3',off:0.13, dur:1.30},
  paSwell:{f:'crowd-bed-pa.mp3', off:102.5,dur:5.0},
  roarRise:{f:'crowd-cheer.mp3', off:0.85, dur:6.5},
  roarMid:{f:'crowd-cheer.mp3',  off:3.5,  dur:6.5},
  callBig:{f:'crowd-bed-squeaks.mp3',off:14.2,dur:6.5}
};
var thAC=null,thFiles={};
function thCtx(){
  if(!thAC){var C=window.AudioContext||window.webkitAudioContext;
    if(!C)return null;thAC=new C()}
  if(thAC.state==='suspended')thAC.resume();
  return thAC;
}
function thWarm(k){
  var w=THX[k];if(!w)return;
  var slot=thFiles[w.f];
  if(slot&&(slot.buf||slot.loading))return;
  var c=thCtx();if(!c)return;
  thFiles[w.f]={loading:true};
  fetch('assets/sfx/'+w.f).then(function(r){return r.arrayBuffer()})
    .then(function(a){return c.decodeAudioData(a)})
    .then(function(b){thFiles[w.f]={buf:b}})
    .catch(function(){thFiles[w.f]={dead:true}});
}
/* play the real window, or fall back to the named synth so the moment is
   never silent. Respects the SFX switch AND the SFX volume slider, the same
   two dials BKAudio.sfx honours: a theatre that ignores the volume knob is
   a second voice the settings cannot reach (08-16 review find). A file
   still DECODING gets one short retry before the synth speaks, so the very
   first ending is not silently swallowed by a race it would win 300ms
   later; a DEAD file falls back at once. */
function thPlay(k,gain,fallback,isRetry){
  if(!thLive)return;
  if(window.BKAudio&&BKAudio.settings&&!BKAudio.settings.sfx)return;
  var w=THX[k],c=thCtx(),slot=w&&thFiles[w.f];
  if(!w||!c||!slot||slot.dead){
    if(w&&!slot)thWarm(k);
    if(fallback)sfx(fallback);
    return;
  }
  if(!slot.buf){
    if(isRetry){if(fallback)sfx(fallback);return}
    thWarm(k);
    setTimeout(function(){thPlay(k,gain,fallback,true)},300);
    return;
  }
  var vol=1;
  if(window.BKAudio&&BKAudio.settings&&typeof BKAudio.settings.sfxVol==='number')
    vol=BKAudio.settings.sfxVol;
  var g0=(gain||1)*vol;
  if(g0<=0)return;
  var s=c.createBufferSource();s.buffer=slot.buf;
  var g2=c.createGain(),t=c.currentTime,fade=Math.min(0.6,w.dur*0.3);
  g2.gain.setValueAtTime(g0,t);
  g2.gain.setValueAtTime(g0,t+w.dur-fade);
  g2.gain.exponentialRampToValueAtTime(0.001,t+w.dur);
  s.connect(g2);g2.connect(c.destination);
  s.start(t,w.off,w.dur+0.1);
  THX._plays=(THX._plays||0)+1;
}
/* the theatre speaks and moves ONLY while the mode is on stage: set by
   open(), cleared by leaving(). Without this a flight's rAF kept running
   and its swish landed while the player stood on the main menu (08-16
   review find). */
var thLive=false;
function reduceMotion(){
  return document.body.classList.contains('reduce-motion')||
    (window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
}
/* THE FLIGHT: flyBall's own math (game.js), height as sin(pi t)*peak off the
   straight line. Skipped whole under reduce-motion: the marks still land. */
function thFly(fx,fy,tx,ty,peak,dur,done){
  var ball=g('dvBall');
  if(!ball||reduceMotion()){if(done)done();return}
  ball.style.display='block';
  var t0=null;
  function step(ts){
    if(!thLive){ball.style.display='none';return}   /* the player left */
    if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/dur);
    var x=fx+(tx-fx)*t, base=fy+(ty-fy)*t, y=base-Math.sin(Math.PI*t)*peak;
    ball.style.transform='translate('+x+'px,'+y+'px) scale('+(1-.25*t)+')';
    if(t<1)requestAnimationFrame(step);else{THX._flew=(THX._flew||0)+1;if(done)done()}
  }
  requestAnimationFrame(step);
}
function thSpotXY(){
  var st=g('dvStage'),s=st&&st.querySelector('.dvspot.live');
  if(!s)return [st?st.clientWidth/2:160,120];
  var r=s.getBoundingClientRect(),gr=st.getBoundingClientRect();
  return [r.left-gr.left+r.width/2, r.top-gr.top+6];
}
function thRimXY(){
  /* the ART's rim, in stage-local coordinates: the same map the spots use,
     so the flight lands on the painted iron at every viewport */
  var st=g('dvStage');if(!st)return [160,12];
  var a=dvArt(),p=worldMap(a.rim.x,a.rim.y),r=st.getBoundingClientRect();
  return [p[0]-r.left,p[1]-r.top];
}
function thBallOff(){var b=g('dvBall');if(b)b.style.display='none'}
function thSwish(){var s=g('dvSwish');if(!s)return;
  s.classList.remove('go');void s.offsetWidth;s.classList.add('go')}
function thRimHit(){var r=g('dvRim');if(!r)return;
  r.classList.remove('hit');void r.offsetWidth;r.classList.add('hit')}
function thQuake(){if(reduceMotion())return;var st=g('dvStage');if(!st)return;
  st.classList.remove('quake');void st.offsetWidth;st.classList.add('quake')}
/* the slam word: the menu's own .pow, worn at stage size */
function thPow(word,cls){
  var st=g('dvStage');if(!st)return;
  var p=document.createElement('div');
  p.className='pow dv'+(cls?' '+cls:'');
  p.textContent=word;
  p.style.left='50%';p.style.top='40%';
  p.style.setProperty('--pr',(Math.random()*14-8).toFixed(1)+'deg');
  st.appendChild(p);
  setTimeout(function(){p.classList.add('out');
    setTimeout(function(){p.remove()},320)},950);
}
function thPts(txt){
  var st=g('dvStage');if(!st)return;
  var e=document.createElement('div');e.className='dvpts';e.textContent=txt;
  e.style.left='calc(50% + 26px)';e.style.top='4px';
  st.appendChild(e);setTimeout(function(){e.remove()},950);
}
/* the victory screen's confetti device, over the whole screen, endings only */
function thConfetti(n){
  var w=g('dvConf');if(!w)return;
  w.className='ev-confetti';
  var cols=['#f5872e','#fff5e2','#ffcf6a'];
  w.innerHTML='';
  for(var i=0;i<n;i++){var s=document.createElement('span');
    s.style.left=(Math.random()*100)+'%';
    s.style.background=cols[i%cols.length];
    s.style.animationDuration=(2.4+Math.random()*2.4)+'s';
    s.style.animationDelay=(Math.random()*1.2)+'s';
    s.style.width=(6+Math.random()*7)+'px';
    s.style.height=(10+Math.random()*9)+'px';
    w.appendChild(s)}
  setTimeout(function(){w.innerHTML=''},5600);
}
/* the four staged outcomes. The words are the SAME voice block the taunt
   speaks (LINES); the slam is the size, not a second script. */
var BALL_R=11;   /* #dvBall is 22px; a ball that ENDS with its centre on the
   rim plane hangs half inside the net, which is the "a bit low" Aaron saw.
   A make vanishes AT the mouth (through the iron is correct physics), but
   iron contact seats the ball a full radius up, resting ON the ring. */
function thStage(right,round,out,line,pts,fromXY){
  if(out){thPow(line,'cold');return}            /* the clock: no shot to show */
  var a=fromXY||thSpotXY(),b=thRimXY();
  var mouth=b[1]-3,iron=b[1]-BALL_R;
  if(round===1&&right){
    thFly(a[0],a[1],b[0],mouth,64,620,function(){
      thBallOff();thSwish();
      thPlay(Math.random()<0.25?'bank':'swish',0.9,'net');
      thPts('+'+pts);thPow(line);
    });
  }else if(round===1&&!right){
    thFly(a[0],a[1],b[0]-8,iron,64,620,function(){
      thRimHit();thPlay('rim',1.0,'brick');
      setTimeout(function(){thPlay('bounce',0.5)},430);
      thQuake();
      thFly(b[0]-8,iron,b[0]-70-Math.random()*40,150,26,430,thBallOff);
      thPow(line,'cold');
    });
  }else if(round===2&&right){                    /* THE STOP: their shot dies at the iron */
    thFly(a[0],a[1],b[0]-6,iron,56,560,function(){
      thRimHit();thPlay('rim',0.9,'brick');thPlay('paSwell',0.35);
      thQuake();
      thFly(b[0]-6,iron,b[0]-90-Math.random()*30,150,30,460,thBallOff);
      thPts('+'+pts);thPow(line,'teal');
    });
  }else{                                         /* BEATEN: their swish, dry, no cheer */
    thFly(a[0],a[1],b[0],mouth,56,560,function(){
      thBallOff();thSwish();thPlay('swish',0.6,'net');
      thPow(line,'cold');
    });
  }
}

function answer(ci){
  if(D.locked)return;
  D.locked=true;
  clockStop();
  var list=D.round===1?SHOTS:STOPS;
  var idxs=D.round===1?D.set.shots:D.set.stops;
  var slot=list[D.i],q=QUESTIONS[idxs[D.i]];
  var right=ci===q.a;
  /* ONE attempt, and the answer is NEVER shown on a miss, Aaron's B5 ruling:
     being told kills the reason to go and find out.

     ⚠️ THE SECOND HALF OF THAT RULING IS NOT BUILT, and this comment used to
     claim it was: "the card comes back in a future daily until you beat it."
     Nothing tracks a miss. The set is seeded from the DATE alone
     (rngFor('bk-daily-'+key)) and storage holds two things, the date and the
     receipt. So a card you missed returns only if the seed happens to deal it
     again, exactly as it would for someone who aced it.
     That matters because the ruling's justification RESTS on the card coming
     back. As built, a player can miss a card and simply never learn the answer.
     Filed for Aaron in V0.md; do not re-add the claim without the mechanism. */
  var btns=g('dvCard').querySelectorAll('.dva');
  /* ci is -1 when the clock ran out. There is no button to mark, and marking
     one would be a lie about what the player did. Everything else is identical
     to a wrong tap, including revealing nothing. */
  if(btns[ci])btns[ci].classList.add(right?'right':'wrong');
  /* The clock keeps its own voice (D3). Make/miss/stop/beaten sounds now ride
     the THEATRE with the synth as fallback, so they are not doubled here. */
  if(ci===-1)sfx('buzzer');
  for(var b=0;b<btns.length;b++)btns[b].disabled=true;
  if(right)D.pts+=slot.pts;
  /* the flight starts from the LIVE spot, read before the repaint retires it */
  var fromXY=thSpotXY();
  (D.round===1?D.shots:D.stops)[D.i]=right?1:0;
  saveRun();
  paintRack();paintTabs();
  var spoken=taunt(right,D.round,ci===-1);
  thStage(right,D.round,ci===-1,spoken,slot.pts,fromXY);
  /* a beat longer than the old report, so the flight and the slam land before
     the next card: make = 620ms arc + the splash · miss adds the carom.
     The timer holds the RUN it was armed for: opening the calendar and
     switching days inside this window replaces D, and a stale advance on
     the new day's rack would skip its cards (08-16 review find). */
  var armedFor=D;
  setTimeout(function(){
    if(D!==armedFor)return;
    D.locked=false;D.i++;
    saveRun();
    if(D.i<5){showCard();return}
    if(D.round===1){D.round=2;D.i=0;roundBreak();return}
    finish();
  },right?1100:1600);
}
/* ---------- what the game says to you ---------------------------------------
   EVERY LINE THE DAILY FIVE SPEAKS IS IN THIS ONE BLOCK, on purpose. It used to
   be four ternaries in two functions, which is how the wrong-answer lines drifted
   out of voice without anyone noticing.

   THE VOICE, and Aaron named it by noticing it was broken: the right-hand lines
   are pure BASKETBALL OUTCOME -- Wet, Splash, Denied, Wall. The shot going in IS
   the "you got it right"; nothing has to say so. The wrong lines used to start
   in that voice and then switch to the game talking about scheduling -- "Brick.
   I'll be back." -- which was a second voice AND a promise the mode cannot keep,
   because the set is seeded from the date so everyone gets the same ten and
   nothing can come back for you specifically. Aaron, 2026-08-07: *"we aren't
   doing that for daily 5 remember because it ruins the everybody gets the same
   questions."* So the misses are now as purely basketball as the makes. D2.

   FOUR OF EACH. Right used to have four and wrong only two, so repeats showed up
   twice as fast on misses -- exactly when you are paying most attention. */
var LINES={
  /* round 1: you have the ball */
  hit1 :['Wet.','Cash.','All net.','Splash.'],
  miss1:['Brick.','Iron.','Airball.','Rimmed out.'],
  /* round 2: you are guarding the rim */
  hit2 :['Denied.','Not tonight.','Get that outta here.','Wall.'],
  miss2:['Bucket.','And one.','Cooked.','Posterized.'],
  /* THE CLOCK BEAT YOU, which is not the same as being wrong and should not
     sound like it -- it already has its own buzzer (D3). Round 1 is never
     getting the shot off; round 2 is being late, which is how defence loses. */
  out1 :['Shot clock.','Never got it off.','Buzzer beat you.','Too late.'],
  out2 :['Beaten to the spot.','Late rotation.','Caught watching.','Too slow.'],
  /* the bonus round: heat language, because that is what it is */
  hc   :['On fire.','Heat check, cash.','Unconscious.','Called it.'],
  hcNo :['Ice cold.','Cooled off.','Bricked the bonus.','Not this time.'],
  hcOut:['Out of time.','Clock got you.','Buzzer.','Ran out of runway.']
};
/* The bonus fires once a day, so cycling on a per-card index would show the
   same line forever. Vary it by DATE instead, from the day key the set is
   already seeded from. */
function dayPick(list){
  var k=String(D.day||''),h=0;
  for(var i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))>>>0;
  return list[h%list.length];
}

function taunt(right,round,out){
  var el=g('dvTaunt');
  var set=out ? (round===1?LINES.out1:LINES.out2)
              : right ? (round===1?LINES.hit1:LINES.hit2)
                      : (round===1?LINES.miss1:LINES.miss2);
  var line=set[D.i%set.length];
  if(el){
    el.textContent=line;
    el.className='dvtaunt on '+(right?'good':'bad');
    /* a make flashes, a miss lingers -- you need a beat longer to feel it */
    setTimeout(function(){el.className='dvtaunt'},right?900:1500);
  }
  /* the same line is what the theatre slams big: one voice, two sizes */
  return line;
}
/* Fade whatever just got written into the card. Called by BOTH writers, so a
   third one added later has an obvious thing to call. */
function cardSwapped(){
  var el=g('dvCard');if(!el)return;
  el.classList.remove('swap');void el.offsetWidth;el.classList.add('swap');
}
function roundBreak(){
  g('dvCard').innerHTML='<div class="dvbreak"><b>ROUND 2</b>'+
    '<span>Now you protect the rim. Five shots coming at you, answer to deny them.</span></div>';
  cardSwapped();
  paintRack();paintTabs();
  /* B5c: the change of ENDS is staged now, not just whistled. The stage class
     paintRack set flips the floor cold, the shield line fades in, and the
     call slams in the defense's own teal. The whistle is the real one. */
  thPlay('whistle',0.8,'whistle');
  setTimeout(function(){thPow('Defense!','teal')},260);
  /* warm the ending cheers NOW: round 2 is the last stretch of runway long
     enough to decode them, and a FINISHED/SWEPT that fires before its cheer
     has decoded used to play silence on its one chance (08-16 review find) */
  ['paSwell','roarRise','roarMid','callBig'].forEach(thWarm);
  setTimeout(function(){if(D.phase==='card')showCard()},1600);
}

/* ---------- the receipt -------------------------------------------------- */
/* The live game. PLACES.md is the home for this; if it moves, it moves there
   first. Never location.href, see the note where it is used. */
var SHARE_URL='https://bk-ballknowledge.com/play/';
function line(marks,made,missed){
  return marks.map(function(m){return m?made:missed}).join('');
}
function finish(){
  D.phase='result';
  clearRun();          /* finished runs live in the receipt, not here */
  var made=D.shots.filter(Boolean).length,stopped=D.stops.filter(Boolean).length;
  var swept=made===5&&stopped===5;
  /* THE ENDINGS ARE TIERS NOW (B5c, "visibly different from each other").
     FINISHED: the whistle and the PA bed's late swell, a building acknowledging
     a run. SWEPT: the horn, the big roar from its rise, confetti in the game's
     own device, and a quake. The third tier, ROOF OFF, lives in hcEnd: it only
     exists past a sweep. Cheers are Aaron's own audition picks (08-09). */
  if(swept){
    sfx('horn');thPlay('roarRise',0.75);
    if(!reduceMotion()){thConfetti(44);thQuake()}
  }else{
    thPlay('whistle',0.6,'whistle');
    thPlay('paSwell',0.5);
  }
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
    'stops '+line(res.stops,'🛡️','🚨')+'\n'+hcTxt+
    /* THE LINK. Without it the receipt is a score with no way in, a friend
       reads it and has nowhere to go. Hard-coded to the live address rather
       than location.href on purpose: this text gets pasted by someone who might
       be on localhost, on a preview build, or on the old github.io address, and
       every one of those would send their friends somewhere that is not the
       game. PLACES.md owns this url. */
    '\n\n'+SHARE_URL;
  r.innerHTML=
    '<div class="dvbig">'+res.pts+' <span>PTS</span></div>'+
    '<div class="dvsub">'+made+'/5 shooting · '+stopped+'/5 stops · out of '+MAXPTS+'</div>'+
    '<pre class="dvreceipt" id="dvReceipt"></pre>'+
    (swept&&!res.hc?'<button class="dvbtn gold" id="dvGo">🔥 Unlock the Heat Check</button>':'')+
    '<button class="dvbtn" id="dvShare">Share the receipt</button>'+
    '<button class="dvbtn ghost" id="dvCalBtn">📅 Your streak</button>'+
    '<button class="dvbtn ghost" id="dvBack2">Back to the menu</button>';
  g('dvReceipt').textContent=receipt;
  paintTabs();
  var go=g('dvGo');if(go)go.addEventListener('click',startBonus);
  g('dvShare').addEventListener('click',function(){share(receipt,this)});
  g('dvCalBtn').addEventListener('click',calOpen);
  g('dvBack2').addEventListener('click',function(){window.BK&&window.BK._show('title')});
}
function prettyDay(k){
  var p=k.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]);
  return d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
}
/* ---------- the calendar ------------------------------------------------
   Aaron, 08-04: "a calendar popup that shows streak and playable missed days
   that get a green check, daily 5s completed the day of should get a gold star
   and any days where all 11 were completed get a gold crown".

   ON THE ART. The star and the crown are drawn here as SVG geometry, not
   sourced. That is the honest side of the medium line: a five-point star and a
   three-point crown are flat vector shapes with clean silhouettes, which is
   exactly what code does well, the same class of thing as the court, the HUD
   and the shot spots. If either wants to be a PAINTED object with texture and
   depth, that is illustration and hand-coding has a hard ceiling there; it would
   need sourcing and I would say so rather than shipping a lumpy approximation.
   These read at 14px, which is the size that actually matters here. */
function mark(kind,size){
  var sz=size||15;
  var late=/late$/.test(kind), lvl=kind.replace(/late$/,'');
  /* colour = WHEN. gold you were there on the day, green you came back for it.
     fill   = WHEN too, doubled up on purpose: filled today, hollow if caught up.
     shape  = WHAT. tick played, star swept the ten, crown all eleven.
     The check is the one exception to the fill rule and cannot help it, a tick
     is a stroke, there is nothing to hollow out. It carries the colour instead. */
  var cls='dvmk '+({check:'ck',star:'st',crown:'cr'}[lvl])+(late?' late':' gold');
  var open='<svg class="'+cls+'" viewBox="0 0 24 24" width="'+sz+'" height="'+sz+
           '" aria-hidden="true">';
  /* a hairline outline vanishes at 14px and the cell just reads empty, so the
     hollow marks are stroked heavy */
  var ink=late?'fill="none" stroke="currentColor" stroke-width="2.2" '+
               'stroke-linejoin="round"':'fill="currentColor"';
  if(lvl==='check')
    return open+'<path d="M4 13l5.2 5.2L20 6.6" fill="none" stroke="currentColor" '+
      'stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if(lvl==='star')
    return open+'<path d="M12 2.4l2.95 5.98 6.6.96-4.775 4.655 1.127 6.573'+
      'L12 17.47l-5.902 3.098 1.127-6.573L2.45 9.34l6.6-.96z" '+ink+'/></svg>';
  /* the crown: three points and a band. Symmetric, at this size an asymmetric
     crown just reads as a smudge. Same path filled or hollow, never a second
     crown, so a caught-up eleven is plainly the SAME achievement arriving late. */
  return open+
    '<path d="M2.6 7.2l3.9 3.3L12 3.4l5.5 7.1 3.9-3.3-1.5 10.4H4.1z" '+ink+'/>'+
    '<rect x="4.1" y="18.6" width="15.8" height="2.6" rx="1.1" '+ink+'/></svg>';
}


var CAL={y:0,m:0};
function calOpen(){
  var t=new Date();CAL.y=t.getFullYear();CAL.m=t.getMonth();
  var el=g('dvCal');if(!el)return;
  el.classList.remove('hide');el.setAttribute('aria-hidden','false');
  calPaint();
  var c=el.querySelector('.dvcalbox');if(c)c.focus();
}
function calClose(){
  var el=g('dvCal');if(!el)return;
  el.classList.add('hide');el.setAttribute('aria-hidden','true');
}
function calPaint(){
  var el=g('dvCal');if(!el)return;
  var h=loadHist(),today=todayKey();
  var first=new Date(CAL.y,CAL.m,1),lead=first.getDay();
  var days=new Date(CAL.y,CAL.m+1,0).getDate();
  var n=streakFrom(h,today);
  var played=Object.keys(h).length;
  /* BOTH crowns count as perfect. All eleven is all eleven, the hollow crown
     says you got there a day late, not that you got less. Counting only the
     filled one made a caught-up perfect day worth nothing in the total, which
     the screenshot caught: 23 played, 4 perfect, with seven crowns on screen. */
  var crowns=Object.keys(h).filter(function(k){
    var m=markFor(h[k]);return m==='crown'||m==='crownlate';}).length;

  var cells='';
  for(var i=0;i<lead;i++)cells+='<div class="dvcd pad"></div>';
  for(var d=1;d<=days;d++){
    var key=keyOf(new Date(CAL.y,CAL.m,d));
    var rec=h[key],mk=markFor(rec);
    var future=key>today, isToday=key===today;
    var cls='dvcd'+(future?' future':'')+(isToday?' today':'')+(mk?' has '+mk:'')
           +(!rec&&!future?' open':'');
    var label=future?'':(rec?prettyDay(key)+', '+rec.p+' points':
                              prettyDay(key)+', not played, tap to play it');
    cells+='<'+(future?'div':'button')+' class="'+cls+'"'+
      (future?'':' data-day="'+key+'" aria-label="'+label+'"')+'>'+
      '<span class="dvcn">'+d+'</span>'+(mk?mark(mk):'')+
      '</'+(future?'div':'button')+'>';
  }

  el.querySelector('.dvcalgrid').innerHTML=cells;
  /* the key draws itself from _markSvg, so a shape can never appear in the
     legend that the calendar does not actually use */
  var keys=el.querySelectorAll('.dvcalkey td[data-k]');
  for(var q=0;q<keys.length;q++)
    keys[q].innerHTML=mark(keys[q].getAttribute('data-k'),14);
  el.querySelector('.dvcalmon').textContent=
    first.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  el.querySelector('.dvstreakn').textContent=n;
  el.querySelector('.dvstreakw').textContent=n===1?'day':'days';
  el.querySelector('.dvcalfoot').innerHTML=
    played+' played · '+crowns+' perfect';
  /* forward is barred at the current month. There is nothing to see there */
  var fwd=el.querySelector('.dvcalnext');
  var atNow=(CAL.y===new Date().getFullYear()&&CAL.m===new Date().getMonth());
  fwd.disabled=atNow;

  var btns=el.querySelectorAll('.dvcd[data-day]');
  for(var b=0;b<btns.length;b++)btns[b].addEventListener('click',function(){
    var k=this.getAttribute('data-day');
    calClose();
    if(window.BK&&window.BK._show)window.BK._show('daily');
    open(k);
  });
}
function calStep(dir){
  CAL.m+=dir;
  if(CAL.m<0){CAL.m=11;CAL.y--}
  if(CAL.m>11){CAL.m=0;CAL.y++}
  calPaint();
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
  /* ONE clock for the whole round, not one per clue. Asking for another clue
     already costs points; now it costs time too, which makes "take another
     clue" a real decision instead of a free one. 45s is generous for a name
     you know and nowhere near enough to go and look one up. */
  clockStart(HC_THINK_MS+readMs(HC.clues[0]),function(){
    /* running out is exactly "iced", the same end the wrong-name path reaches,
       reached through the same code, so the receipt, the score and the saved
       history cannot disagree with a hand-rolled timeout branch. */
    if(HC&&!HC.over)hcEnd('miss',true);
  });
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
  /* textContent, not innerHTML. A clue is data and must never be markup */
  var slots=b.querySelectorAll('.dvct');
  for(var i=0;i<slots.length;i++)slots[i].textContent=HC.clues[i];
  g('dvBuzz').addEventListener('click',guess);
  g('dvGuess').addEventListener('keydown',function(e){if(e.key==='Enter')guess()});
  var nx=g('dvNext');
  if(HC.open>=HC.clues.length)nx.classList.add('hide');
  nx.addEventListener('click',function(){
    if(HC.open<HC.clues.length){clockExtend(readMs(HC.clues[HC.open]));
      HC.open++;paintBonus();g('dvGuess').focus()}
  });
  g('dvGuess').focus();
}
function guess(){
  if(HC.over)return;
  var v=g('dvGuess').value;
  var verdict=hcMatch(v,HC.p);
  if(verdict==='ambiguous'){
    /* no penalty, no candidate list, a list would hand over the answer */
    g('dvNote').textContent='Need more than the family name.';
    g('dvNote').className='dvnote warn';
    return;
  }
  hcEnd(verdict,false);
}
/* ONE ending for the bonus round, whether you named them, missed them, or ran
   out of clock. A separate timeout branch is how the score, the receipt and the
   saved history quietly start disagreeing with each other. */
function hcEnd(verdict,timedOut){
  if(HC.over)return;
  HC.over=true;clockStop();
  var pts=verdict==='hit'?HC_CLUE_PTS[HC.open-1]:0;
  D.hc={pts:pts,got:verdict==='hit',clue:HC.open};
  D.pts+=pts;
  sfx(verdict==='hit' ? 'net' : (timedOut ? 'buzzer' : 'brick'));
  /* ROOF OFF, the third ending tier: only reachable past a 10/10 sweep, so it
     outranks SWEPT on purpose. The slam is #fireslam, the game's own ON FIRE
     stamp, driven the same way fireSlam() drives it; the sound is the roar
     already rolling LAYERED with the announcer crowd's big moment, Aaron's
     own combo pick from the audition. */
  if(verdict==='hit'){
    thPlay('roarMid',1.0);thPlay('callBig',1.25);
    var fs=document.getElementById('fireslam');
    if(fs&&!reduceMotion()){
      var ft=document.getElementById('fsTeam');if(ft)ft.textContent='THE ROOF IS OFF';
      fs.classList.remove('on','out');void fs.offsetWidth;fs.classList.add('on');
      thConfetti(72);
      setTimeout(function(){fs.classList.add('out');
        setTimeout(function(){fs.classList.remove('on','out')},380)},1900);
    }
  }
  g('dvNote').className='dvnote '+(verdict==='hit'?'good':'bad');
  /* Same voice block as the rounds, and the name always follows: the reveal IS
     the payoff of the bonus, win or lose. */
  g('dvNote').textContent=verdict==='hit'
    ? dayPick(LINES.hc)+' '+HC.p.name+' · '+pts+' pts.'
    : (timedOut?dayPick(LINES.hcOut):dayPick(LINES.hcNo))+' It was '+HC.p.name+'.';
  g('dvBuzz').disabled=true;g('dvGuess').disabled=true;
  var nx=g('dvNext');if(nx)nx.classList.add('hide');
  setTimeout(function(){
    var res=loadResult()||{day:D.day,shots:D.shots,stops:D.stops,swept:true};
    res.pts=D.pts;res.hc=D.hc;saveResult(res);paintResult(res);
  },2200);
}

/* ---------- entry -------------------------------------------------------- */
/* open() with no argument is today, exactly as before. With a date key it opens
   that day's rack, the "playable missed days" Aaron asked for. A day already in
   the history opens on its receipt instead, so tapping a finished day is a way
   to look back at it rather than a way to re-roll a score. */
function paintStreakPill(){
  var el=g('dvStreakPill');if(!el)return;
  el.textContent=streakFrom(loadHist(),todayKey());
}
function open(key){
  var today=todayKey();
  if(key&&key>today)return;                 /* no playing tomorrow */
  paintStreakPill();
  /* warm the theatre's decoders now, so the first splash has no lag; the
     synth fallback still covers a first tap that beats the network. The
     ending cheers warm later, at the round break, closer to their moment. */
  thLive=true;
  ['swish','rim','whistle'].forEach(thWarm);
  var day=key||today;
  var prev=(day===today)?loadResult():null;
  if(!prev){
    var rec=loadHist()[day];
    if(rec)prev={day:day,pts:rec.p,shots:rec.s.slice(),stops:rec.t.slice(),
                 swept:rec.s.filter(Boolean).length===5&&rec.t.filter(Boolean).length===5,
                 hc:rec.h?{got:true,pts:rec.h}:null};
  }
  if(prev){                            /* already played: show the receipt */
    D={day:prev.day,set:dailySet(prev.day),round:2,i:5,
       shots:prev.shots,stops:prev.stops,pts:prev.pts,hc:prev.hc,
       phase:'result',locked:true};
    g('dvDate').textContent=prettyDay(prev.day);
    paintRack();paintResult(prev);
    return;
  }
  /* AN UNFINISHED RUN. Two cases, and Aaron ruled both.
     TODAY: pick it up where you left off -- the card you walked out on is
     already scored wrong and stepped past, so there is nothing to resume INTO
     and no clock to restore.
     ANY EARLIER DAY: *"yesterday scores as it stood."* Bank it as that day's
     result so the calendar shows what actually happened, then clear it. The
     alternative -- letting it sit forever, or reopening it tomorrow -- would
     mean a day's card set staying live long after everyone else has moved on,
     which is the same fairness hole one door along. */
  var run=loadRun();
  if(run&&run.day!==today){
    var stale={day:run.day,pts:run.pts,shots:run.shots,stops:run.stops,
               swept:false,hc:null};
    histAdd(stale);
    clearRun();
    run=null;
  }
  if(run&&run.day===day){
    D={day:day,set:dailySet(day),round:run.round,i:run.i,pts:run.pts,
       shots:run.shots.slice(),stops:run.stops.slice(),hc:null,
       phase:'card',locked:false};
    g('dvDate').textContent=prettyDay(D.day);
    g('dvTaunt').className='dvtaunt';
    paintRack();paintTabs();
    if(D.round>2||(D.round===2&&D.i>=5)){finish();return}
    showCard();
    /* SAY WHAT HAPPENED. Aaron, 2026-08-07: "there needs to be something that
       pops up to let a player know they closed out during the last card and so
       it's wrong and they start the new card."
       He is right, and it is the difference between a rule and a mystery. The
       rule is fair; silently resuming one card further along with a mark you
       did not make is indistinguishable from a bug, and a player who thinks the
       game lost their answer stops trusting the score.
       It fires on EVERY resume, not once per phone, because it is a report on
       what just happened rather than a tip about how the game works. The coach
       only speaks if he is switched on; the score is already visibly marked
       either way. */
    if(window.BKCoach&&BKCoach.say){
      var lost=(run.round===1?run.shots:run.stops)[run.i-1];
      BKCoach.say('daily-resume-'+day+'-'+run.round+'-'+run.i,
        '<b>You left mid-question.</b> That one goes down as a miss: the '+
        'clock does not wait and everybody gets the same ten. '+
        '<span class="ct-sub">Picking you back up at card '+
        ((run.round-1)*5+run.i+1)+' of 10.</span>');
    }
    return;
  }

  D=fresh(day);
  g('dvDate').textContent=prettyDay(D.day)+(day===today?'':' · catching up');
  g('dvTaunt').className='dvtaunt';
  showCard();
}

/* ---------- leaving ---------------------------------------------------------
   THREE listeners, not one, because no single event fires everywhere:
     visibilitychange -- switching apps or tabs. The reliable one on mobile.
     pagehide         -- iOS Safari's actual "this page is going away".
     beforeunload     -- desktop closing a tab.
   All three land on the same function, and it is idempotent: once the card is
   abandoned D.phase is still 'card' but D.i has moved, so a second call scores
   the NEXT card only if one is genuinely live. Leaving the daily by navigating
   inside the app is handled too -- game.js's show() fires it. */
function leaving(){
  abandonCard();
  /* And no timer survives the exit, whatever phase we were in. Tester #1's
     phone had a daily clock still armed minutes after the Daily Five: the
     coach card then trusted it ("CLOCK STOPPED AT :16" over the Rulebook,
     V0 D25), and an armed clockT off-screen would eventually fire a phantom
     time-up into whatever screen came next. abandonCard only acts during
     phase 'card', so it alone cannot guarantee this. clockStop is idempotent. */
  clockStop();
  /* the theatre goes quiet too: no flight lands and no swish fires on
     whatever screen comes next. showCard re-arms it, so an app-switch that
     comes back mid-run gets its theatre back with the next card. */
  thLive=false;
  /* and the coach goes with it. show() already clears a card that does not
     belong to the incoming screen, but leaving() is also the app-switch path
     (visibilitychange / pagehide), which never touches show(): backgrounding
     the phone mid-tip used to park a modal card over whatever came back. */
  if(window.BKCoach&&BKCoach.hide)BKCoach.hide();
}
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='hidden')leaving();
});
window.addEventListener('pagehide',leaving);
window.addEventListener('beforeunload',leaving);

/* calendar controls, bound once, not on every paint, so reopening the popup
   does not stack a second handler on the same arrow. */
(function(){
  var el=g('dvCal');if(!el)return;
  var x=g('dvCalX');if(x)x.addEventListener('click',calClose);
  var sb=g('dvStreakBtn');if(sb)sb.addEventListener('click',calOpen);
  var pv=el.querySelector('.dvcalprev'),nx=el.querySelector('.dvcalnext');
  if(pv)pv.addEventListener('click',function(){calStep(-1)});
  if(nx)nx.addEventListener('click',function(){calStep(1)});
  /* click the dimmed surround to dismiss, but not a click that started inside */
  el.addEventListener('click',function(e){if(e.target===el)calClose()});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!el.classList.contains('hide'))calClose();
  });
})();

/* ---------- THE RESET DOOR (Aaron, 2026-08-08) -------------------------------
   *"I want to test again after you fix, can you reset the daily five somehow?"*

   Deliberately a URL, not a button in the Control Room. A visible "replay
   today" control is a re-roll: the whole premise of the mode is that everybody
   got the same ten under the same conditions once, and a streak you can repair
   by tapping a settings switch is not a streak. A query string is reachable in
   two seconds when you know it is there and invisible when you do not.

   Two depths, because they undo different things:
     ?daily=reset  today only, the receipt, the stamp, any half-finished run,
                   and today's row in the history. Yesterday's streak survives.
                   Same ten cards, because the set is a function of the date.
     ?daily=wipe   all of it: every day of history, plus the coach's
                   seen-once memory, so every tip fires again like a new phone.
                   This is the one to use for testing a first run; it also makes
                   every past day playable again, which is how you get a FRESH
                   ten instead of the ten you just memorised.
   Both land you on the Daily Five with the run already cleared. */
function resetDaily(mode){
  var today=todayKey(),wipe=(mode==='wipe');
  try{
    localStorage.removeItem('bk_daily5');      /* the stamp's contract */
    localStorage.removeItem('bk_daily5r');     /* today's receipt */
    localStorage.removeItem('bk_daily5p');     /* a run in progress */
    if(wipe){localStorage.removeItem('bk_daily5h');localStorage.removeItem('bk_coach_seen');}
    else{var h=loadHist();delete h[today];saveHist(h);}
  }catch(e){}
  D=null;
  if(window.BK&&window.BK._paintDaily)window.BK._paintDaily();
  return wipe?'wipe':'reset';
}

window.BKDaily={
  open:open,
  _reset:resetDaily,
  /* coach.js calls this; see clockHold. Exposed on the public surface rather
     than the test surface because it is real behaviour, not a harness hook. */
  _hold:clockHold,
  /* test surface, the harness drives the real functions, never a copy */
  _set:dailySet,_key:todayKey,_inScope:inScope,_match:hcMatch,_player:hcPlayer,_clues:hcClues,
  _shots:SHOTS,_stops:STOPS,_max:MAXPTS,_cluePts:HC_CLUE_PTS,
  _state:function(){return D},_answer:answer,_norm:norm,
  _hist:loadHist,_saveHist:saveHist,_mark:markFor,_streak:streakFrom,
  _loadRun:loadRun,_saveRun:saveRun,_clearRun:clearRun,_abandon:abandonCard,
  _leaving:leaving,
  _cal:calOpen,_calClose:calClose,_shareUrl:SHARE_URL,_markSvg:mark,
  _ms:function(){return {think:THINK_MS,wpm:READ_WPM,hcThink:HC_THINK_MS}},
  /* B5c theatre test surface: real functions, live counters, never a copy */
  _thStage:thStage,_thWarm:thWarm,_thPlay:thPlay,_thRimXY:thRimXY,_ballR:BALL_R,
  _thx:function(){return {plays:THX._plays||0,flew:THX._flew||0,
    files:Object.keys(thFiles).map(function(k){return k+':'+(thFiles[k].buf?'ok':thFiles[k].dead?'dead':'loading')})}},
  _cardMs:cardMs,_readMs:readMs,_lines:function(){return LINES},
  /* TEST HOOK, and the only thing it changes is the LENGTH of the clock. The
     timeout still runs through answer(-1) and hcEnd('miss',true), the real
     paths, so a harness can watch a card actually expire in a second instead
     of sitting there for twenty-five. Shortening the fuse is not the same as
     replacing the bomb. */
  _setMs:function(c,h){if(c)THINK_MS=c;if(h)HC_THINK_MS=h;if(c)READ_WPM=1e9}
};

/* game.js paints the stamp at boot, BEFORE this file exists, so the first paint
   of a played day would have no mark. Repaint now that the mark function is
   available. One line, and it is why paintDaily does not need a fallback shape
   of its own, a second copy of the shapes is exactly how the two screens would
   drift apart again. */
if(window.BK&&window.BK._paintDaily)window.BK._paintDaily();

/* The ?go=daily deep link used to live here and it was in the wrong place: the
   load screen chooses the first screen about 1.2s after boot, so anything set
   from this file was overwritten. It now lives in game.js as
   firstScreenDeepLink(), called by the loader itself. See the note there. */
})();

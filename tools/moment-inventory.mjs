/* WHAT IS ON THE SCREEN AT EACH MOMENT OF A TURN, counted rather than recalled.

   Aaron, 2026-08-22, on five screenshots of live play: "it's unclear what's a
   button, what's a notification, I mean it's chaos... What does a player need
   to know and do at each point?"

   This answers the second half of that question with a census. It drives a
   real game into each moment of a possession, then walks the DOM and records
   every element a player can actually SEE: its rect, its words, its type size,
   and whether the browser thinks it is a control.

   Two things it does NOT do, said out loud because both are judgement:
     · it does not decide whether an element deserves to be there
     · it does not know what the player needs to KNOW at each moment
   Those two columns get written by hand against this output. The census is the
   floor under that argument, so the argument is about a list of real elements
   rather than a memory of a screenshot.

   THE ONE INFERENCE IT DOES MAKE is the button question, because that is
   Aaron's own complaint and it is measurable: an element is counted as
   LOOKING tappable if it has a pointer cursor, a border or a filled panel;
   and as BEING tappable if it is a button, has role=button, is in the tab
   order, or carries a click handler the page registered. The two sets should
   be the same set. Where they differ, that is the defect he named.

     node tools/moment-inventory.mjs              phone, JSON to stdout
     node tools/moment-inventory.mjs --desk       1280x860 instead
     node tools/moment-inventory.mjs --shot       also save a frame per moment

   Needs docs/ served on :8899. Run from the repo root. */
import pw from 'playwright';
import fs from 'fs';

const DESK = process.argv.includes('--desk');
const SHOT = process.argv.includes('--shot');
const VIEW = DESK ? { width: 1280, height: 860 } : { width: 390, height: 844 };
const OUT = 'design/shots/moments';
if (SHOT) fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- the census, run inside the page ----------------------------------- */
/* Deliberately walks EVERY element rather than a list of known ids. A list of
   known ids can only find what I already remember is there, and "there is more
   on this screen than I think" is the thing being measured. */
function census() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const out = [];
  const seen = new Set();

  const onScreen = r => r.width > 1 && r.height > 1 &&
    r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;

  /* the words this element contributes ITSELF, not the words of everything
     inside it. Without this a wrapper reports the whole screen as its text
     and every count is inflated. */
  const ownText = el => [...el.childNodes]
    .filter(n => n.nodeType === 3).map(n => n.textContent).join(' ')
    .replace(/\s+/g, ' ').trim();

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (parseFloat(cs.opacity) < 0.06) continue;
    const r = el.getBoundingClientRect();
    if (!onScreen(r)) continue;

    const tag = el.tagName.toLowerCase();
    const text = ownText(el);
    const isCanvas = tag === 'canvas';
    const isImg = tag === 'img' || tag === 'svg';
    /* only count things that carry meaning on their own: words, a picture, or
       a control. A positioning div with no text of its own is scaffolding. */
    const control = tag === 'button' || el.getAttribute('role') === 'button' ||
      el.hasAttribute('onclick') || el.tabIndex >= 0;
    /* A PANEL WITH NO WORDS OF ITS OWN IS STILL AN OBJECT ON THE SCREEN, and
       it is precisely the kind that gets printed over. The turn tray was
       invisible to the first version of this census because its words live in
       child spans, so the overlap Aaron photographed did not register. */
    const panelish = (r.width > 80 && r.height > 16) &&
      (!/^(rgba\(0, 0, 0, 0\)|transparent)$/.test(cs.backgroundColor) ||
       parseFloat(cs.borderTopWidth) > 0.4) && (el.id || '') !== '';
    if (!text && !isCanvas && !isImg && !control && !panelish) continue;

    /* dedupe a label wrapped in its own span: same words, same box */
    const key = text + '|' + Math.round(r.x) + '|' + Math.round(r.y) +
      '|' + Math.round(r.width);
    if (text && seen.has(key)) continue;
    if (text) seen.add(key);

    const bordered = ['Top', 'Right', 'Bottom', 'Left']
      .some(s => parseFloat(cs['border' + s + 'Width']) > 0.4);
    const filled = !/^(rgba\(0, 0, 0, 0\)|transparent)$/.test(cs.backgroundColor);
    const disabled = el.disabled === true ||
      el.classList.contains('dis') || el.classList.contains('disabled');

    /* A FALSE AFFORDANCE HAS TO CHECK ANCESTORS, or the number is a lie.
       The first version of this counted 20 mismatches on the setup screen and
       almost all of them were the NAME and the DIAGRAM inside a card that is
       itself a button. Those inherit the pointer cursor and are supposed to:
       tapping them taps the card. Counting them made the defect look four
       times worse than it is, which is the flattering direction, which is
       exactly the direction a bad counter always errs in. */
    let inControl = false;
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      if (p.tagName.toLowerCase() === 'button' || p.getAttribute('role') === 'button' ||
          p.hasAttribute('onclick') || p.tabIndex >= 0) { inControl = true; break; }
    }

    /* clipped: the element has more content than it shows, and on a phone
       there is no scrollbar to say so. THRESHOLD 12px, not 1: every round
       icon button in this game reports 4px of overflow from centring its
       glyph, and the scoreboard ghosts report 2px. Counting those made all
       six moments report "8 clipped" and none of the eight were real, which
       is a counter measuring its own noise. */
    const rawClip = el.scrollWidth - el.clientWidth;
    const clip = rawClip > 12 ? rawClip : 0;
    const offRight = Math.round(r.x + r.width) > vw + 1;

    out.push({
      el,                     /* stripped before the record leaves the page */
      tag,
      id: el.id || '',
      cls: (typeof el.className === 'string' ? el.className : '').trim().slice(0, 48),
      text: text.slice(0, 72),
      x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height),
      font: Math.round(parseFloat(cs.fontSize) * 10) / 10,
      cursor: cs.cursor,
      /* the two halves of Aaron's question, kept separate on purpose */
      looksTappable: cs.cursor === 'pointer' || ((bordered || filled) && !!text),
      isTappable: control && !disabled,
      inControl,
      disabled,
      clippedBy: clip,
      offRight,
      /* how far from the top, as a share of the screen: an instruction at 96%
         is a different object from the same words at 20% */
      down: Math.round((r.y / vh) * 100),
    });
  }
  /* reading order, which is also roughly attention order */
  out.sort((a, b) => a.y - b.y || a.x - b.x);

  /* WHAT PRINTS ON TOP OF WHAT. Aaron's first named defect. Only compares
     PANELS, the boxes that carry their own background, because two words
     inside one panel overlapping is just a layout and two panels overlapping
     is the bug he photographed. */
  /* NESTING IS NOT OVERLAP. A banner sits on top of its own text and the HUD
     sits on its own scoreboard art: both report a large intersection and
     neither is a defect. Six "overlaps" became four once ancestors were
     excluded, and the two dropped were the two largest by area, which is how
     an uncorrected version of this would have led with its worst evidence. */
  const panels = out.filter(i => i.w > 60 && i.h > 14 && i.tag !== 'canvas' &&
    (i.id || i.cls) && !i.inControl || (i.isTappable && i.w > 60));
  const nested = (p, q) => p.el && q.el && (p.el.contains(q.el) || q.el.contains(p.el));
  const overlaps = [];
  for (let a = 0; a < panels.length; a++) {
    for (let b2 = a + 1; b2 < panels.length; b2++) {
      const p = panels[a], q = panels[b2];
      const ox = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x);
      const oy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
      if (ox > 8 && oy > 8 && !nested(p, q)) {
        overlaps.push({
          a: p.id || p.cls, aText: p.text.slice(0, 30),
          b: q.id || q.cls, bText: q.text.slice(0, 30),
          area: ox * oy,
        });
      }
    }
  }
  out.forEach(i => { delete i.el; });   /* a DOM node cannot cross the bridge */
  return { vw, vh, items: out, overlaps };
}

/* ---- staging ------------------------------------------------------------ */
const b = await pw.chromium.launch({
  executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'],
});
const ctx = await b.newContext({
  viewport: VIEW, deviceScaleFactor: 2,
  hasTouch: !DESK, isMobile: !DESK,
});
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push(String(e).slice(0, 140)));

await page.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
await page.reload({ waitUntil: 'networkidle' });
await sleep(1200);

async function boot() {
  await page.evaluate(() => {
    const B = window.BK, K = B.coach;
    K.applyColors({ nm: 'Showtime', ab: 'SHO' }, { nm: 'The Bricks', ab: 'BRK' });
    K.startGame({ league: 'nba', decade: 'ANY', target: 11,
      rosters: K.pickRosters('nba', 'ANY') }, true);
    B._show('game');
  });
  await sleep(1700);
}
await boot();

/* Each moment is staged through the game's OWN functions wherever one exists,
   so what gets counted is the real screen and not a mock of it. Where a moment
   could only be reached by faking state, that is recorded on the moment. */
const MOMENTS = [
  {
    key: 'setups-def',
    name: 'Choosing a defensive setup',
    real: true,
    /* defense is called first, so this is what the human sees when the OTHER
       side has the ball. mbRitual runs the whole pick flow; the census is
       taken while its first carousel is up. */
    stage: async () => {
      await page.evaluate(() => {
        const B = window.BK, S = B.state();
        const C = B._cpu(); C.on = true; C.team = 1; C.level = 'pro';
        S.offense = 1; S.selected = null; S.staged = null;
        B._mb().setup = false;
        B._mbRitual(1, 'score', function () {});
      });
      await sleep(1600);
    },
  },
  {
    key: 'setups-off',
    name: 'Choosing an offensive setup',
    real: true,
    /* your ball: the machine calls its defense first (800ms), then your own
       carousel opens. Waiting through that is what a player does too. */
    stage: async () => {
      await page.evaluate(() => {
        const B = window.BK, S = B.state();
        const C = B._cpu(); C.on = true; C.team = 1; C.level = 'pro';
        S.offense = 0; S.selected = null; S.staged = null;
        B._mb().setup = false;
        B._mbRitual(0, 'score', function () {});
      });
      await sleep(2600);
    },
  },
  {
    key: 'ballin',
    name: 'Inbound, passing it in',
    real: true,
    stage: async () => {
      /* through the game's own painter. offerActions() reads
         state.pieces[state.selected] and throws on a null selection, so the
         inbound moment has to be staged the way the game reaches it: set
         inbPending and let inboundActions() paint. */
      await page.evaluate(() => {
        const B = window.BK, S = B.state();
        S.offense = 0; S.selected = null; S.staged = null;
        S.inbPending = true; S.inbMoved = false;
        B._mb().setup = false;
        S.phase = 'inbound';
        B._inboundActions();
      });
      await sleep(900);
    },
  },
  {
    key: 'freemoves',
    name: 'Free moves, stepping teammates',
    real: true,
    stage: async () => {
      await page.evaluate(() => {
        const B = window.BK, S = B.state();
        S.offense = 0; S.phase = 'off-select'; S.selected = null; S.staged = null;
        /* the REAL entry, not just the dock painter. mbSetupStage() only
           repaints the dock; mbStartSetup() is what the game calls, and it
           also sets the banner and the bottom instruction line. Staging the
           shortcut left the previous moment's instruction on screen and I
           nearly reported that stale line as a game bug. It was mine. */
        B._mbStartSetup();
      });
      await sleep(2100);   /* past the slam so the standing state is counted */
    },
  },
  {
    key: 'action',
    name: 'Your main action, carrier selected',
    real: true,
    stage: async () => {
      await page.evaluate(() => {
        const B = window.BK, S = B.state();
        S.offense = 0; S.phase = 'off-select'; S.inbPending = null;
        B._mb().setup = false;
        S.selected = S.ball.holder; S.staged = null;
        B._offer();
      });
      await sleep(900);
    },
  },
  {
    key: 'waiting',
    name: 'Their possession, you wait',
    real: true,
    /* the one moment forced rather than played into: parking the CPU brain is
       the only way to hold it still for a census. Everything here is real
       except the bottom instruction line, which the real handover would have
       repainted and this staging does not. */
    noteVerified: false,
    stage: async () => {
      await page.evaluate(() => {
        const B = window.BK, S = B.state();
        const C = B._cpu(); C.on = true; C.team = 1; C.level = 'pro'; C.busy = true;
        S.offense = 1; S.phase = 'off-select'; S.selected = null; S.staged = null;
        S.inbPending = null;
        const sb = document.getElementById('stagebox');
        sb.classList.remove('on'); sb.innerHTML = '';
      });
      await sleep(1100);
    },
  },
];

const report = { view: VIEW, when: null, moments: [] };
for (const m of MOMENTS) {
  await boot();
  await m.stage();
  await page.evaluate(() => document.body.classList.add('reduce-motion'));
  await sleep(250);
  const c = await page.evaluate(census);
  if (SHOT) {
    await page.screenshot({ path: `${OUT}/${DESK ? 'desk' : 'phone'}-${m.key}.png` });
  }
  report.moments.push({ key: m.key, name: m.name, real: m.real,
    noteVerified: m.noteVerified !== false, ...c });
  const n = (a) => String(a).padStart(2);
  const falseAfford = c.items.filter(i => i.looksTappable && !i.inControl);
  const hiddenCtl = c.items.filter(i => i.isTappable && i.cursor !== 'pointer');
  console.error(
    `  ${m.key.padEnd(13)} ${String(c.items.length).padStart(3)} visible  ` +
    `${n(c.items.filter(i => i.isTappable).length)} tappable  ` +
    `${n(falseAfford.length)} look-but-are-not  ` +
    `${n(hiddenCtl.length)} are-but-look-not  ` +
    `${n(c.items.filter(i => i.offRight).length)} off right  ` +
    `${n(c.items.filter(i => i.clippedBy).length)} clipped  ` +
    `${n(c.overlaps.length)} panel overlaps`);
}
report.errors = errs;
console.log(JSON.stringify(report, null, 1));
await b.close();

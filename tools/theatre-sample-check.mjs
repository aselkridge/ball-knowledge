/* The B5c sample, checked. node tools/theatre-sample-check.mjs
 *
 * Mechanism checks, not does-it-load checks: the ball must actually MOVE and
 * actually ARC (a flight whose y never rises above the straight line is a
 * slide, not a shot), the stamps must spawn AND leave, the endings must be
 * three visibly different states, and every control must be the topmost thing
 * at its own centre, measured on glass. All of those are today's lessons
 * applied on purpose.
 */
import { chromium } from 'playwright';

const URL = 'file://' + process.cwd() + '/docs/dev/daily-theatre.html';
let pass = 0, fail = 0;
const ok = (n, c, d = '') => {
  if (c) { pass++; console.log(`  ok   ${n}${d ? '  ' + d : ''}`); }
  else { fail++; console.log(`  FAIL ${n}${d ? '  ' + d : ''}`); }
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
                                  args: ['--no-sandbox', '--mute-audio'] });
for (const [tag, w, h, mobile] of [['phone', 390, 844, true], ['desktop', 1280, 950, false]]) {
  console.log(`\n== ${tag} ${w}x${h} ==`);
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile,
                                 hasTouch: mobile, deviceScaleFactor: 2 });
  const p = await c.newPage();
  p.on('pageerror', e => { fail++; console.log('  FAIL page error  ' + e.message); });
  await p.goto(URL); await p.waitForTimeout(500);

  // ---- the frame ------------------------------------------------------------
  const lay = await p.evaluate(() => ({
    meta: !!document.querySelector('meta[name=viewport]'),
    charset: document.characterSet,
    layout: document.documentElement.clientWidth,
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    fonts: getComputedStyle(document.querySelector('.dvtitle')).fontFamily,
    fire: document.querySelector('.fs-stamp img').src.startsWith('data:image/webp'),
    spots: document.querySelectorAll('.spot').length,
    stops: document.querySelectorAll('.stop').length,
  }));
  ok('viewport meta + UTF-8', lay.meta && lay.charset === 'UTF-8');
  ok('layout viewport is the device', lay.layout === w, `${lay.layout}px`);
  ok('no horizontal overflow', lay.over === 0, `${lay.over}px`);
  ok('Sedgwick carries the slam register', /Sedgwick/.test(lay.fonts));
  ok('the ON FIRE stamp art is inlined', lay.fire);
  ok('five spots and five stops', lay.spots === 5 && lay.stops === 5);

  // every control topmost at its own centre, ON GLASS
  // elementFromPoint returns null OUTSIDE the viewport, so a control below the
  // fold reads as unreachable when it is merely unscrolled. Bring each one on
  // screen before asking who is on top; the question is occlusion, not scroll.
  const controls = await p.evaluate(async () => {
    const layout = document.documentElement.clientWidth;
    const out = [];
    for (const e of document.querySelectorAll('.ctl button, .dva')) {
      e.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise(r => requestAnimationFrame(r));
      const r = e.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      out.push({ reach: !!(hit && (e.contains(hit) || hit === e)),
                 glass: Math.min(r.width, r.height) * (390 / layout) });
    }
    window.scrollTo(0, 0);
    return out;
  });
  ok('every control is reachable at its own centre',
     controls.every(x => x.reach), `${controls.length} controls`);
  if (tag === 'phone')
    ok('every control clears 30px of finger on glass',
       controls.every(x => x.glass >= 30),
       `smallest ${Math.min(...controls.map(x => x.glass)).toFixed(1)}px`);

  // ---- THE FLIGHT. It must move, and it must ARC ------------------------------
  const flight = await p.evaluate(() => new Promise(res => {
    const ball = document.getElementById('ball');
    const ys = [], xs = [];
    const iv = setInterval(() => {
      if (ball.style.display !== 'none') {
        const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(ball.style.transform);
        if (m) { xs.push(+m[1]); ys.push(+m[2]); }
      }
    }, 16);
    BKTheatre.make();
    setTimeout(() => {
      clearInterval(iv);
      const made = document.querySelectorAll('.spot.made').length;
      const pow = !!document.querySelector('.pow');
      // arc test: the midpoint of the flight must sit ABOVE (smaller y than)
      // the straight line between its first and last samples.
      let arced = false;
      if (ys.length > 4) {
        const mid = Math.floor(ys.length / 2);
        const straight = ys[0] + (ys[ys.length - 1] - ys[0]) * (mid / (ys.length - 1));
        arced = ys[mid] < straight - 8;
      }
      res({ samples: ys.length, arced, made, pow,
            travelled: xs.length ? Math.abs(xs[xs.length - 1] - xs[0]) : 0 });
    }, 900);
  }));
  ok('the ball actually flies', flight.samples > 6 && flight.travelled > 40,
     `${flight.samples} samples, ${flight.travelled.toFixed(0)}px of travel`);
  ok('and actually ARCS, not slides', flight.arced);
  ok('the spot flips to made', flight.made === 1);
  ok('a SPLASH stamp spawned', flight.pow);
  await p.waitForTimeout(1300);
  ok('and the stamp LEAVES', await p.evaluate(() => !document.querySelector('.pow')));

  // ---- the miss -------------------------------------------------------------
  await p.evaluate(() => BKTheatre.reset());
  await p.evaluate(() => BKTheatre.miss());
  await p.waitForTimeout(750);
  const missState = await p.evaluate(() => ({
    missed: document.querySelectorAll('.spot.missed').length,
    cold: !!document.querySelector('.pow.cold'),
    rimHit: document.getElementById('rim').classList.contains('hit'),
  }));
  ok('a miss flips the spot, coldly', missState.missed === 1 && missState.cold);
  ok('and the rim takes the hit', missState.rimHit);

  // ---- round 2 announces itself ----------------------------------------------
  await p.waitForTimeout(900);
  await p.evaluate(() => BKTheatre.round2());
  await p.waitForTimeout(500);
  const r2 = await p.evaluate(() => ({
    def: document.getElementById('stage').classList.contains('def'),
    stopsVisible: getComputedStyle(document.querySelector('.stops')).display === 'grid',
    courtGone: +getComputedStyle(document.querySelector('.court')).opacity === 0,
    teal: !!document.querySelector('.pow.teal'),
    tab: document.getElementById('tabD').classList.contains('on'),
  }));
  ok('round 2 is a change of ENDS: floor flips, court yields, stops appear',
     r2.def && r2.stopsVisible && r2.courtGone);
  ok('and it says the word', r2.teal && r2.tab);
  // the colour law: tiles keep the difficulty scale even on defense. The first
  // cut painted all five stops teal, which is the corner-three collision.
  const lawful = await p.evaluate(() =>
    [...document.querySelectorAll('.stop')].map(e =>
      getComputedStyle(e).borderTopColor));
  ok('the stop tiles keep the DIFFICULTY colours, not a defense colour',
     new Set(lawful).size === 3, `${new Set(lawful).size} tiers of colour`);

  // ---- the three endings are three different states ---------------------------
  const tiers = [];
  for (const t of [0, 1, 2]) {
    await p.evaluate(() => BKTheatre.reset());
    await p.evaluate(n => BKTheatre.ending(n), t);
    await p.waitForTimeout(t === 2 ? 2700 : 700);
    tiers.push(await p.evaluate(() => ({
      fin: document.getElementById('fin').classList.contains('on'),
      confetti: document.querySelectorAll('#conf span').length,
      big: document.getElementById('finBig').textContent,
      cheer: document.getElementById('finCheer').textContent,
    })));
  }
  ok('FINISHED: receipt moment, no confetti, the cheer slot is labelled',
     tiers[0].fin && tiers[0].confetti === 0 && /crowd cheer/.test(tiers[0].cheer));
  ok('SWEPT: confetti rains', tiers[1].fin && tiers[1].confetti === 44,
     `${tiers[1].confetti} pieces`);
  ok('ROOF OFF: more again, and the fire slam ran',
     tiers[2].fin && tiers[2].confetti === 72 && /ROOF/.test(tiers[2].big));
  ok('the three tiers are visibly three', new Set(tiers.map(t => t.big)).size === 3
     && new Set(tiers.map(t => t.confetti)).size === 3);

  // ---- the contrast toggle really is today's whisper ---------------------------
  await p.evaluate(() => BKTheatre.reset());
  await p.click('#bToday');
  await p.evaluate(() => BKTheatre.make());
  await p.waitForTimeout(350);
  const today = await p.evaluate(() => ({
    whisper: document.getElementById('whis').textContent,
    pow: !!document.querySelector('.pow'),
    ball: document.getElementById('ball').style.display,
  }));
  ok("TODAY mode: the whisper and nothing else, which is Aaron's complaint",
     /GOOD/.test(today.whisper) && !today.pow && today.ball !== 'block');

  await c.close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

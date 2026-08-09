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
  // THE CSP LESSON. The cheers were wired, the harness passed on file://, and
  // Aaron heard silence, because fetch() of a data: URI is blocked inside the
  // artifact's CSP and nothing here could see that. The page now decodes with
  // atob only, and this check makes the regression loud: no fetch( anywhere
  // outside a comment.
  const fetches = await p.evaluate(() =>
    [...document.querySelectorAll('script')].map(sc => sc.textContent)
      .join('').split('fetch(').length - 1);
  ok('no fetch() in any script: CSP-proof audio path', fetches === 0, `${fetches} found`);
  ok('layout viewport is the device', lay.layout === w, `${lay.layout}px`);
  ok('no horizontal overflow', lay.over === 0, `${lay.over}px`);
  ok('Sedgwick carries the slam register', /Sedgwick/.test(lay.fonts));
  ok('the ON FIRE stamp art is inlined', lay.fire);
  // Aaron, 08-09: "I don't like the black background on 'on fire'". The plate
  // is keyed out at build time, so PROVE it: draw the stamp to a canvas and
  // demand a transparent corner. A veil can hide a plate from a screenshot;
  // it cannot hide it from the pixels.
  const plate = await p.evaluate(() => new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      const cx = cv.getContext('2d');
      cx.drawImage(img, 0, 0);
      const corner = cx.getImageData(2, 2, 1, 1).data;
      const centre = cx.getImageData(img.width >> 1, img.height >> 1, 1, 1).data;
      res({ cornerAlpha: corner[3], centreAlpha: centre[3] });
    };
    img.src = document.querySelector('.fs-stamp img').src;
  }));
  ok('the black plate is GONE: stamp corner is transparent',
     plate.cornerAlpha === 0, `corner alpha ${plate.cornerAlpha}`);
  ok('while the flames themselves are solid', plate.centreAlpha > 200,
     `centre alpha ${plate.centreAlpha}`);
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
      // arc test: some sample must sit ABOVE (smaller y than) the chord from
      // first to last sample. Parameterized by x, not by sample index: under
      // main-thread jank the samples space unevenly in time, and an
      // index-midpoint can land past the apex where a real arc has already
      // come down. The x position cannot lie about where the ball was.
      let arced = false;
      if (ys.length > 4) {
        const x0 = xs[0], x1 = xs[xs.length - 1], y0 = ys[0], y1 = ys[ys.length - 1];
        for (let i = 1; i < ys.length - 1; i++) {
          const chord = y0 + (y1 - y0) * ((xs[i] - x0) / ((x1 - x0) || 1));
          if (ys[i] < chord - 8) { arced = true; break; }
        }
      }
      res({ samples: ys.length, arced, made, pow,
            travelled: xs.length ? Math.abs(xs[xs.length - 1] - xs[0]) : 0 });
    }, 900);
  }));
  // the first play lazily decodes the file, so the counter ticks a beat after
  // the splash (measured: ~900ms from make). Wait for it, bounded: the claim
  // is "the make plays a real file", not "the decode is instant".
  await p.waitForFunction(() => BKTheatre._realPlays() > 0, null, { timeout: 4000 })
         .catch(() => {});
  ok('a REAL sound played on the make (default mode is YOURS)',
     await p.evaluate(() => BKTheatre._snd() === 'real' && BKTheatre._realPlays() > 0),
     'realPlays=' + await p.evaluate(() => BKTheatre._realPlays()));
  await p.evaluate(() => BKTheatre._setSnd('arcade'));
  await p.evaluate(() => { BKTheatre.reset(); BKTheatre.make(); });
  await p.waitForTimeout(750);
  const arcadePlays = await p.evaluate(() => BKTheatre._realPlays());
  await p.evaluate(() => BKTheatre._setSnd('real'));
  ok('and ARCADE mode leaves the real files silent',
     await p.evaluate(c => BKTheatre._realPlays() === c, arcadePlays));
  await p.evaluate(() => BKTheatre.reset());
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
    // tier 2's fire slam resolves its nested timeouts at 2400ms on paper;
    // give the decode of two big cheer files room to jank the clock.
    await p.waitForTimeout(t === 2 ? 3300 : 700);
    tiers.push(await p.evaluate(() => ({
      fin: document.getElementById('fin').classList.contains('on'),
      confetti: document.querySelectorAll('#conf span').length,
      big: document.getElementById('finBig').textContent,
      cheer: document.getElementById('finCheer').textContent,
    })));
  }
  ok('FINISHED: receipt moment, no confetti, and the REAL cheer is named',
     tiers[0].fin && tiers[0].confetti === 0 && /crowd-cheer-reacting/.test(tiers[0].cheer));
  ok('SWEPT: confetti rains', tiers[1].fin && tiers[1].confetti === 44,
     `${tiers[1].confetti} pieces`);
  ok('ROOF OFF: more again, and the fire slam ran',
     tiers[2].fin && tiers[2].confetti === 72 && /ROOF/.test(tiers[2].big));
  ok('the three tiers are visibly three', new Set(tiers.map(t => t.big)).size === 3
     && new Set(tiers.map(t => t.confetti)).size === 3);

  // ---- THE REAL CHEER. Muted headless cannot prove sound reached a speaker,
  // but it CAN prove the sourced file decodes, that its duration matches the
  // manifest's measurement, and that the endings actually started playback.
  const cheerState = await p.evaluate(() => new Promise(res => {
    BKTheatre._cheerLoad('loud'); BKTheatre._cheerLoad('soft');
    let n = 0;
    const iv = setInterval(() => {
      const l = BKTheatre._cheer('loud'), s2 = BKTheatre._cheer('soft');
      if ((l.loaded && s2.loaded) || ++n > 40) {
        clearInterval(iv);
        res({ loud: l, soft: s2, plays: BKTheatre._cheerPlays() });
      }
    }, 250);
  }));
  ok('both sourced cheers decode in the page', cheerState.loud.loaded && cheerState.soft.loaded);
  ok('the big cheer is the 16s file, played from past its lead silence',
     Math.abs(cheerState.loud.seconds - 16.27) < 0.5 && cheerState.loud.offset > 0.8,
     `${cheerState.loud.seconds.toFixed(2)}s, offset ${cheerState.loud.offset}s`);
  ok('the endings actually started cheer playback', cheerState.plays >= 3,
     `${cheerState.plays} plays across the three endings`);

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

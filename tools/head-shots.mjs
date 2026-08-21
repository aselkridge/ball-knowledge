/* THE MENU HEADER (list item 3). Aaron 08-19: "I love the logo but 'ball
   knowledge' and the little quote are cool but they look sooo plain and
   crowded... just like the title of a word doc not the title of a game at the
   top of a main menu."

   Variants are CSS + markup patched into index.html in flight, so the repo is
   never edited and a patch that fails to match is a hard error rather than a
   silent no-op showing the wrong candidate. */
import pw from 'playwright';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = 'design/shots/head3';
fs.mkdirSync(OUT, { recursive: true });
const src = fs.readFileSync('docs/play/index.html', 'utf8');

const HEAD = `    <div class="mm-head">
      <img class="mm-logo" data-install-logo src="assets/brand/mark.png" alt="">
      <h1 class="mm-h1">Ball<span class="k">Knowledge</span></h1>
      <div class="mm-tag">Your knowledge is your jumpshot</div>
    </div>`;

function css(rules){ return ['</head>', '<style>'+rules+'</style></head>']; }
function head(inner, cls){ return [HEAD,
  '    <div class="mm-head '+cls+'">\n'+inner+'\n    </div>']; }
const LOGO = '      <img class="mm-logo" data-install-logo src="assets/brand/mark.png" alt="">';
const WORD = '      <h1 class="mm-h1">Ball<span class="k">Knowledge</span></h1>';
const TAG  = '      <div class="mm-tag">Your knowledge is your jumpshot</div>';

const VARIANTS = {
  now: [],

  /* B · LOCKUP LEFT. The crest and the wordmark on ONE line, pushed to the
     left edge of the content column, tagline gone. Centred stacks are what
     documents do; a lockup with air to its right is what a product does. It
     also starts the doors higher, which a phone has no spare room for. */
  'b-lockup': [
    head(LOGO+'\n'+WORD, 'hb'),
    css(`.mm-head.hb{flex-direction:row;align-items:center;justify-content:flex-start;
      gap:13px;text-align:left;padding:4px 0 10px}
      .mm-head.hb .mm-logo{width:clamp(56px,8.6vh,74px);height:auto}
      .mm-head.hb .mm-h1{font-size:min(clamp(26px,7.8vw,34px),4.2vh);line-height:.84}`)],

  /* C · CREST HERO. The mark is the best thing we own, so it gets to be big,
     and the name becomes one wide-tracked line underneath rather than two
     stacked slabs. Wordmark demoted to a caption for the crest. */
  'c-crest': [
    head(LOGO+'\n'+WORD, 'hc'),
    css(`.mm-head.hc{gap:0;padding:6px 0 12px}
      .mm-head.hc .mm-logo{width:clamp(96px,16vh,132px);height:auto}
      .mm-head.hc .mm-h1{font-size:clamp(14px,4.1vw,18px);letter-spacing:.30em;
        line-height:1;margin-top:11px;text-shadow:0 2px 0 rgba(0,0,0,.4)}
      .mm-head.hc .mm-h1 .k{display:inline;margin-left:.3em}`)],

  /* D · POSTER. No crest in the header at all: it is already the app icon, the
     tab icon and the install card, so the menu does not have to introduce it.
     The name goes big and tight, the way a title card does, and the line under
     it earns its place by being the only small thing on the screen. */
  'd-poster': [
    head(WORD+'\n'+TAG, 'hd'),
    css(`.mm-head.hd{gap:0;padding:10px 0 12px}
      .mm-head.hd .mm-h1{font-size:min(clamp(46px,15.5vw,70px),9.2vh);line-height:.79;
        letter-spacing:-.012em;text-shadow:0 4px 0 rgba(0,0,0,.5)}
      .mm-head.hd .mm-tag{margin-top:9px;font-size:9.5px;opacity:.85}`)],

  /* E · BROADCAST BUG. The smallest possible claim: a compact lockup sitting
     top left opposite the two round buttons, so the top of the screen reads as
     a bar rather than a title block, and the doors get the room back. */
  'e-bug': [
    head(LOGO+'\n'+WORD, 'he'),
    css(`.mm-head.he{flex-direction:row;align-items:center;justify-content:flex-start;
      gap:9px;text-align:left;padding:0 0 6px}
      .mm-head.he .mm-logo{width:40px;height:40px}
      .mm-head.he .mm-h1{font-size:19px;line-height:.85;letter-spacing:.02em;
        text-shadow:0 2px 0 rgba(0,0,0,.45)}`)],
};

const src0 = src;
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--mute-audio'] });
const only = process.argv.slice(2);
for (const [name, patches] of Object.entries(VARIANTS)) {
  if (only.length && !only.includes(name)) continue;
  let body = src0;
  for (const [find, rep] of patches) {
    if (body.indexOf(find) < 0) { console.error('PATCH MISS in ' + name + ': ' + find.slice(0, 60)); process.exit(1); }
    body = body.replace(find, rep);
  }
  for (const [vk, vp] of Object.entries({ phone: { width: 390, height: 844 }, desk: { width: 1280, height: 860 } })) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: vp.width < 900, isMobile: vp.width < 900 });
    const page = await ctx.newPage();
    await page.route('**/play/', r => r.fulfill({ status: 200, contentType: 'text/html', body }));
    await page.route('**/play/index.html', r => r.fulfill({ status: 200, contentType: 'text/html', body }));
    await page.goto('http://127.0.0.1:8899/play/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('bk_coach', '0'); });
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(1500);
    await page.evaluate(() => document.body.classList.add('reduce-motion'));
    await sleep(500);
    /* A DEAD SERVER IS A SILENT WRONG SCREENSHOT, not an error. Route
       interception fulfils the HTML itself, so if :8899 is down the page still
       "loads": only the scripts 404, the menu screen is never shown, and every
       variant photographs an identical empty backdrop. That happened once and
       cost a round of confused looking, so the header has to be measurably on
       screen before anything is saved. */
    const seen = await page.evaluate(() => {
      const h = document.querySelector('.mm-head');
      if (!h) return null;
      const r = h.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (!seen || seen.w < 40 || seen.h < 20) {
      console.error('NOTHING RENDERED for ' + name + '-' + vk + ': ' + JSON.stringify(seen) +
                    '. Is docs/ served on :8899?');
      process.exit(1);
    }
    /* The header's real cost is where the first DOOR starts. Measured, not
       eyeballed, because "feels tighter" is exactly the kind of claim this
       repo keeps catching itself making. */
    const m = await page.evaluate(() => {
      /* .dailystamp's viewport rect reads 0 here because the menu lives in a
         transformed container, so measure the gap the honest way: the header's
         own height, and the offset from the header's top to the first door
         inside the same offsetParent. */
      const h = document.querySelector('.mm-head').getBoundingClientRect();
      const d = document.querySelector('.mm-row2').getBoundingClientRect();
      return { head: Math.round(h.height), gap: Math.round(d.top - h.top) };
    });
    await page.screenshot({ path: `${OUT}/${name}-${vk}.png` });
    console.log('  ' + (name + '-' + vk).padEnd(18) +
                'header ' + String(m.head).padStart(3) + 'px   doors start ' +
                String(m.gap).padStart(3) + 'px lower');
    await ctx.close();
  }
}
await b.close();

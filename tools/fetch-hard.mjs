#!/usr/bin/env node
/* Fetch pages curl cannot reach, into the cache verify-batch.py reads.
 *
 * WHY THIS EXISTS. espn.com is 45 of the 111 unchecked Tier 2 facts — 40% of
 * the remaining verification queue — and every curl of it comes back
 * "HTTP 202, 1987 bytes": an AWS WAF JavaScript challenge, not an article.
 * verify-batch.py's `len(body) < 500` guard called that FAIL, correctly, and
 * there is no header combination that gets past it, because the wall wants a
 * browser to RUN something. So run a browser. Chromium is already here.
 *
 * It writes to .cache/verify/<sha1(url)>.html — the exact path
 * verify-batch.py:cache_path() computes — so --sheet, --show and --apply all
 * work afterwards with no idea a different program filled the cache. One
 * cache, one reader, two writers.
 *
 * It saves the RENDERED DOM (document.documentElement.outerHTML), not the
 * response body, which is the whole point on a React page: nba.com ships its
 * prose inside __NEXT_DATA__ and verify-batch has a scraper for that; here the
 * text is simply in the DOM by the time we ask.
 *
 *   node tools/fetch-hard.mjs <url> [url...]     fetch these
 *   node tools/fetch-hard.mjs --from <file>      one url per line
 *   --force                                      refetch even if cached
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, '.cache/verify');
fs.mkdirSync(CACHE, { recursive: true });

const cachePath = u => path.join(CACHE, createHash('sha1').update(u).digest('hex') + '.html');

const argv = process.argv.slice(2);
const force = argv.includes('--force');
let urls = argv.filter(x => x.startsWith('http'));
const fi = argv.indexOf('--from');
if (fi >= 0) {
  urls = urls.concat(
    fs.readFileSync(argv[fi + 1], 'utf8').split('\n').map(s => s.trim()).filter(s => s.startsWith('http')));
}
if (!urls.length) { console.error('nothing to fetch'); process.exit(2); }

/* A challenge page is short and has no article in it. Rather than sniff for
 * WAF vendors — there are many and they change — judge the thing we actually
 * need: is there enough visible text to verify a claim against? */
const THIN = 1200;

/* TWO environment facts, both of which cost an hour to find, so they are
 * written down rather than remembered.
 *
 * 1. Outbound HTTPS goes through an agent proxy. curl reads $HTTPS_PROXY by
 *    itself; Chromium does not. Pass it explicitly.
 *
 * 2. Even with the proxy set, every https:// load died with
 *    ERR_CONNECTION_RESET — including example.com, which is how I knew it was
 *    not ESPN blocking us. Tunnelling the CONNECT through an instrumented
 *    relay showed the shape of it: the proxy answers CONNECT with 200, Chromium
 *    sends a 1753-byte ClientHello, and the proxy resets with zero bytes back.
 *    That is Chrome's post-quantum key share (X25519MLKEM768), which pushes the
 *    ClientHello past one TCP segment; curl's is ~400 bytes and sails through.
 *    Capping at TLS 1.2 removes the key_share extension and the handshake fits.
 *
 *    Note what this does NOT do: verification stays ON (no ignoreHTTPSErrors —
 *    the proxy CA is already in the browser's NSS store, and ESPN loads clean
 *    with strict TLS). Turning off certificate checking would have "fixed" this
 *    too, and would have been the wrong fix.
 *
 *    --disable-features=PostQuantumKyber,UseMLKEM does NOT work on this build;
 *    it was tried first and the reset persisted. Don't re-litigate it. */
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || '';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--ssl-version-max=tls1.2'],
  ...(PROXY ? { proxy: { server: PROXY } } : {}),
});
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  locale: 'en-US',
  viewport: { width: 1280, height: 900 },
});

let ok = 0, thin = 0, fail = 0;
for (const url of urls) {
  const p = cachePath(url);
  if (!force && fs.existsSync(p)) { console.log(`  CACHED       ${url.slice(0, 74)}`); continue; }
  const page = await ctx.newPage();
  /* Images and fonts are bytes we never read. Stylesheets stay: a blocked
   * stylesheet is a signal some walls check for. */
  await page.route('**/*', r => ['image', 'media', 'font'].includes(r.request().resourceType())
    ? r.abort() : r.continue());
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    /* The WAF challenge solves itself and then navigates. Wait for the text to
     * show up rather than for a fixed idle event, which fires on the challenge
     * page too. */
    await page.waitForFunction(
      n => (document.body?.innerText || '').length > n, THIN, { timeout: 25000 }
    ).catch(() => {});
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const text = await page.evaluate(() => document.body?.innerText || '');
    if (text.length < THIN) {
      thin++;
      console.log(`  THIN ${String(text.length).padStart(5)}  ${url.slice(0, 74)}`);
    } else {
      fs.writeFileSync(p, html);
      ok++;
      console.log(`  OK   ${String(text.length).padStart(5)}  ${url.slice(0, 74)}`);
    }
  } catch (e) {
    fail++;
    console.log(`  FAIL         ${url.slice(0, 62)}  ${String(e.message).split('\n')[0].slice(0, 60)}`);
  }
  await page.close();
  await new Promise(r => setTimeout(r, 2500));   // somebody else's server
}
await browser.close();
console.log(`\n${ok} saved, ${thin} too thin to verify against, ${fail} failed.`);

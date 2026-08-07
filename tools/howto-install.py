#!/usr/bin/env python3
"""The page Aaron sends his friends: how to put the game on a phone.

    python3 tools/howto-install.py <out.html>

Why this exists
---------------
Aaron, 2026-08-07: *"Can you provide an instructions doc I can share with people
on how to do it and how to access shortcuts, etc."*

WHO IT IS FOR, and it changes every word on the page: twenty friends, not
developers. Nobody reading this knows what a manifest is, cares what a PWA is,
or wants to hear the phrase "progressive web app". The whole job is: fifteen
seconds, four taps, done. No em dashes either, same as the coming-soon page.

THE ONE THING THIS PAGE MUST NOT DO IS OVERPROMISE. iOS does not support the
icon shortcuts that Android does. Telling an iPhone owner to long-press for the
Daily 5 sends them hunting for something that is not there, and then the doc is
the thing that feels broken. So the iPhone section gets the honest workaround
instead: add the Daily 5 as its OWN second icon, which works because the game
answers ?go=daily.

Look is the game's, copied the same way tools/order-card.py does it: palette
verbatim from docs/play/index.html :root, faces from docs/play/assets/fonts/.
"""

import base64
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONTS = ROOT / 'docs/play/assets/fonts'
GAME = 'bk-ballknowledge.com/play/'

IPHONE = [
    ('Open the link in <b>Safari</b>',
     'It has to be Safari. If you tap the link from inside another app and it '
     'opens somewhere else, tap the little compass icon to reopen it in Safari.'),
    ('Tap the <b>Share</b> button',
     'The square with an arrow coming out of the top. It is at the bottom of the '
     'screen on most iPhones, or up in the top right on an iPad.'),
    ('Scroll down and tap <b>Add to Home Screen</b>',
     'It is a little way down the list, past the sharing options.'),
    ('Tap <b>Add</b>',
     'That is it. The icon is on your home screen with the rest of your apps.'),
]

ANDROID = [
    ('Open the link in <b>Chrome</b>',
     'Most Android phones do this already. Samsung Internet works too and the '
     'steps are near enough the same.'),
    ('Tap the <b>three dots</b> in the corner',
     'Top right. You might see a banner offering to install it before you even '
     'get there, in which case just tap that.'),
    ('Tap <b>Install app</b>, or <b>Add to Home screen</b>',
     'Depending on your phone it says one or the other. Then confirm.'),
]

WHY = [
    ('It opens like a real app', 'No address bar, no tabs, no browser buttons '
     'taking up the top of your screen. Just the game.'),
    ('It is on your home screen', 'You do not have to find the link again, or go '
     'digging through a group chat from three weeks ago.'),
    ('It is not an App Store download', 'Nothing to approve, nothing taking up '
     'space, no account. It is the same web page, wearing an icon.'),
]

TROUBLE = [
    ('I do not see "Add to Home Screen"',
     'You are almost certainly not in Safari. Chrome and Firefox on an iPhone '
     'have their own versions of this and they are fiddlier, so it is worth '
     'reopening the link in Safari. Private browsing tabs also hide the option.'),
    ('I tapped it and nothing happened',
     'Check your home screen pages, including the last one. New icons go to the '
     'end, and if you have a lot of apps that can be a few swipes away.'),
    ('The icon is there but it opens the browser',
     'That happens if a shortcut got saved as a plain bookmark. Delete it, then '
     'go through the steps again from the top.'),
    ('Do I need to do this to play?',
     'No. The link works perfectly well in a browser. This just makes it nicer '
     'and easier to get back to.'),
]


def font(name):
    return base64.b64encode((FONTS / name).read_bytes()).decode()


PAGE = """<title>Put Ball Knowledge on your phone</title>
<style>
/* Same faces and colours as the game, copied from docs/play/index.html :root
   and docs/play/assets/fonts/ so this page looks like it came out of the same
   building. Retune both together. */
@font-face{font-family:'Anton';src:url(data:font/woff2;base64,__ANTON__) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Archivo';src:url(data:font/woff2;base64,__ARCHIVO__) format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:'SpaceMono';src:url(data:font/woff2;base64,__MONO7__) format('woff2');font-weight:700;font-display:swap}

:root{
  --ground:#f4efe6;--panel:#fffdf8;--panel2:#ece4d6;--line:#d9cdb9;
  --ink:#17120f;--ink-dim:#544a3f;--ink-faint:#8b8073;
  --accent:#b8560f;--away:#1f6288;--ok:#3f7d43;
  --mono:'SpaceMono',ui-monospace,Menlo,Consolas,monospace;
  --sans:'Archivo',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --display:'Anton','Archivo',system-ui,sans-serif;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --ground:#100d0b;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
    --ink:#efe6d8;--ink-dim:#c2b7a3;--ink-faint:#7d735f;
    --accent:#f5872e;--away:#58a8d6;--ok:#6fbf73;
  }
}
:root[data-theme="dark"]{
  --ground:#100d0b;--panel:#1d1815;--panel2:#242019;--line:#3a332a;
  --ink:#efe6d8;--ink-dim:#c2b7a3;--ink-faint:#7d735f;
  --accent:#f5872e;--away:#58a8d6;--ok:#6fbf73;
}

*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:var(--sans);font-weight:600;line-height:1.55;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:720px;margin:0 auto;padding:clamp(22px,5vw,56px) clamp(18px,5vw,28px) 80px}

.eyebrow{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:var(--ink-faint);display:block;margin-bottom:10px}
h1{font-family:var(--display);font-weight:400;letter-spacing:.02em;
  font-size:clamp(36px,9vw,60px);line-height:.96;margin:0;text-wrap:balance}
h1 em{font-style:normal;color:var(--accent)}
.lede{margin:16px 0 0;font-size:clamp(16px,2vw,18px);color:var(--ink-dim);max-width:56ch}
.lede b{color:var(--ink)}

.linkbox{display:block;margin:26px 0 40px;background:var(--panel);
  border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:3px;
  padding:15px 18px;text-decoration:none;color:inherit}
.linkbox .k{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-faint);display:block;margin-bottom:5px}
.linkbox .u{font-family:var(--mono);font-size:clamp(15px,3.4vw,19px);font-weight:700;
  color:var(--accent);word-break:break-all}
.linkbox:hover .u,.linkbox:focus-visible .u{text-decoration:underline}

h2{font-family:var(--display);font-weight:400;letter-spacing:.02em;
  font-size:clamp(25px,5vw,34px);margin:0 0 4px;line-height:1.05}
.h2note{margin:0 0 18px;font-size:14px;color:var(--ink-faint)}
section{margin-bottom:44px}

ol.steps{list-style:none;margin:0;padding:0;counter-reset:s}
ol.steps li{counter-increment:s;display:grid;grid-template-columns:38px 1fr;
  gap:14px;padding:13px 0;border-bottom:1px solid var(--line)}
ol.steps li::before{content:counter(s);font-family:var(--mono);font-weight:700;
  font-size:15px;color:var(--ground);background:var(--accent);border-radius:50%;
  width:30px;height:30px;display:grid;place-items:center;margin-top:1px}
section.android ol.steps li::before{background:var(--away)}
.steps h3{margin:0 0 3px;font-size:17px;font-weight:600;line-height:1.35}
.steps p{margin:0;font-size:14.5px;color:var(--ink-dim)}

.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:3px;padding:14px 16px}
.card b{display:block;font-size:15px;margin-bottom:4px}
.card span{font-size:14px;color:var(--ink-dim)}

.qa{border-left:2px solid var(--line);padding-left:14px;margin-bottom:16px}
.qa b{display:block;font-size:15.5px;margin-bottom:2px}
.qa span{font-size:14.5px;color:var(--ink-dim)}

.note{background:var(--panel2);border:1px solid var(--line);border-radius:3px;
  padding:14px 16px;font-size:14.5px;color:var(--ink-dim);margin-top:16px}
.note b{color:var(--ink)}
code{font-family:var(--mono);font-size:.86em;background:var(--panel2);
  padding:1px 5px;border-radius:2px;color:var(--accent);word-break:break-all}

footer{margin-top:20px;padding-top:20px;border-top:1px solid var(--line);
  font-size:14px;color:var(--ink-faint)}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="wrap">
  <span class="eyebrow">Ball Knowledge</span>
  <h1>Put it on your <em>phone</em></h1>
  <p class="lede">There is no App Store download and no account to make.
  <b>It takes about fifteen seconds</b> and afterwards the game sits on your
  home screen with a proper icon, and opens full screen like any other app.</p>

  <a class="linkbox" href="https://__GAME__">
    <span class="k">The link</span>
    <span class="u">__GAME__</span>
  </a>

  <section class="iphone">
    <h2>On an iPhone or iPad</h2>
    <p class="h2note">Roughly fifteen seconds. Safari only.</p>
    <ol class="steps">__IPHONE__</ol>
  </section>

  <section class="android">
    <h2>On an Android phone</h2>
    <p class="h2note">Even quicker. Chrome, or Samsung Internet.</p>
    <ol class="steps">__ANDROID__</ol>
  </section>

  <section>
    <h2>Shortcuts</h2>
    <p class="h2note">Jumping straight to the bit you want.</p>
    <p class="lede" style="margin-bottom:16px"><b>On Android</b>, press and hold
    the icon on your home screen. A little menu pops out with
    <b>Run your Daily 5</b> on it, which drops you straight into today's ten
    questions instead of the main menu. You can also drag that shortcut out and
    leave it on your home screen as its own button.</p>
    <p class="lede"><b>On an iPhone</b>, Apple does not do those pop-out menus
    for web apps, so there is nothing to hold down. You can get the same result
    another way though, and it is arguably better: add the Daily 5 as its own
    separate icon.</p>
    <div class="note"><b>The iPhone version, step by step.</b> Open
    <code>https://__GAME__?go=daily</code> in Safari, then Share, then Add to
    Home Screen, and before you tap Add, rename it to <b>Daily 5</b>. You now
    have two icons: one for the full game, one that goes straight to today's
    questions.</div>
  </section>

  <section>
    <h2>Why bother</h2>
    <div class="cards">__WHY__</div>
  </section>

  <section>
    <h2>If something goes wrong</h2>
    __TROUBLE__
  </section>

  <footer>
    Nothing here installs anything or asks for a login. If you would rather just
    play it in a browser tab, that works exactly the same.
    Problems, or something looks broken? Tell Aaron, that is the whole point of
    you having it early.
  </footer>
</div>
"""


def main():
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'howto.html')
    s = PAGE
    steps = lambda rows: ''.join(
        f'<li><div><h3>{t}</h3><p>{d}</p></div></li>' for t, d in rows)
    s = s.replace('__IPHONE__', steps(IPHONE))
    s = s.replace('__ANDROID__', steps(ANDROID))
    s = s.replace('__WHY__', ''.join(
        f'<div class="card"><b>{t}</b><span>{d}</span></div>' for t, d in WHY))
    s = s.replace('__TROUBLE__', ''.join(
        f'<div class="qa"><b>{q}</b><span>{a}</span></div>' for q, a in TROUBLE))
    s = s.replace('__GAME__', GAME)
    for tok, fname in [('__ANTON__', 'anton-400.woff2'),
                       ('__ARCHIVO__', 'archivo-600.woff2'),
                       ('__MONO7__', 'spacemono-700.woff2')]:
        s = s.replace(tok, font(fname))

    left = re.findall(r'__[A-Z0-9]+__', s)
    if left:
        sys.exit(f'unreplaced placeholders: {sorted(set(left))}')
    # An em dash in a page written for his friends is the thing he asked twice
    # for it not to have.
    if '—' in s.split('</style>')[-1]:
        sys.exit('em dash in the body copy')
    out.write_text(s, encoding='utf-8')
    print(f'{out}  {len(s)/1024:.0f}KB  ·  {len(IPHONE)} iPhone steps, '
          f'{len(ANDROID)} Android steps, {len(TROUBLE)} answers')


if __name__ == '__main__':
    main()

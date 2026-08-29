/* ============================================================================
   ADD TO HOME SCREEN, the in-game half of it.

   The manifest (B2) makes the game INSTALLABLE. This file makes anyone
   actually notice, which is a different problem: nobody browsing a web page
   thinks "I should check my browser menu".

   Aaron, 2026-08-07: *"Could clicking the logo in the top left hand corner
   prompt adding to Home Screen? And maybe that could be the first thing the
   'coach' says to do!?"* Both, and they fix each other's weakness, the coach
   makes it DISCOVERABLE once, the logo makes it PERMANENT after that. Nobody
   taps a logo unprompted; nobody remembers a one-off tip.

   THE TWO PLATFORMS DO GENUINELY DIFFERENT THINGS, and pretending otherwise is
   how this ships broken:
     Android/Chrome, the browser fires `beforeinstallprompt`. We stash it and
       the logo replays it, which is a REAL one-tap install dialog.
     iOS/Safari, there is NO API. None. Apple exposes no way to trigger or
       even detect installability, so the most any button can honestly do is
       point at the Share icon. We show a sheet that does exactly that.
     iOS/other, Chrome and Firefox on iOS cannot add to the home screen
       in the way Safari can, so the honest answer is "open this in Safari".

   AARON'S RULE, 2026-08-07, and it is enforced in one place:
   *"clicking the logo to download to Home Screen should not work once it's on
   the Home Screen. Same for if clicking the logo surfaces instructions on
   iOS."* So `offer()` is the single gate, `installed()` is checked first, and
   when there is nothing to offer the logo is not merely inert. It loses the
   cursor, the hint, the aria-label and its place in the tab order, because a
   control that looks live and does nothing is worse than no control.
   ========================================================================== */
(function () {
'use strict';

var LOGO = 'logo', SHEET = 'installSheet';
/* TWO MAIN MENUS, TWO LOGOS, ONE OFFER (2026-08-08). The logo is the permanent
   handle for "add me to your home screen", and on 08-08 a second main menu
   appeared with its own mark. Both carry [data-install-logo], and everything
   here walks that selector instead of one id, otherwise the affordance would
   have been correct on whichever menu I happened to be looking at and dead on
   the other, which is the failure this whole file exists to avoid. */
var LOGO_SEL = '[data-install-logo]';
function logos() { return [].slice.call(document.querySelectorAll(LOGO_SEL)); }
/* the VISIBLE one, for focus and for the spotlight to point at: the hidden
   menu's logo has a zero-size rect, so "the first one on screen" is a
   measurement rather than a guess about which menu is up */
function liveLogo() {
  var ls = logos();
  for (var i = 0; i < ls.length; i++) {
    var r = ls[i].getBoundingClientRect();
    if (r.width && r.height) return ls[i];
  }
  return ls[0] || null;
}
var deferred = null;          /* the Android beforeinstallprompt event */
var SEEN_KEY = 'bk_install_seen';
var HAD_KEY = 'bk_install_had';   /* "this phone has had it installed before" */

function $(id) { return document.getElementById(id); }

/* ---------- who and where -------------------------------------------------- */
function isIOS() {
  /* iPadOS 13+ reports as a Mac, so the touch-point check is not optional. */
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function isSafari() {
  var ua = navigator.userAgent;
  /* On iOS every browser is WebKit, so sniff the wrappers OUT rather than
     trying to sniff Safari in. CriOS = Chrome, FxiOS = Firefox, EdgiOS = Edge,
     OPiOS/OPT = Opera, and in-app webviews announce themselves too. */
  return !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|FBAN|FBAV|Instagram|Line\//.test(ua);
}
function installed() {
  /* Two different browsers, two different answers, and neither alone is
     enough: display-mode is the standard and iOS Safari uses its own flag. */
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
  } catch (e) { /* old browser, fall through */ }
  return navigator.standalone === true;
}
function phoneish() {
  /* Desktop users are not adding this to a home screen. Offering it there is
     noise, and on desktop Chrome the install dialog produces a window nobody
     asked for. */
  return isIOS() || /Android/.test(navigator.userAgent) ||
         (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
}

/* ---------- what, if anything, we can offer -------------------------------- */
/* ONE gate. Every entry point asks this and nothing bypasses it. */
function offer() {
  if (installed()) return null;          /* Aaron's rule, first line, always */
  if (!phoneish()) return null;
  if (deferred) return 'prompt';         /* Android: the real thing */
  if (isIOS()) return isSafari() ? 'ios' : 'ios-other';
  return null;                           /* Android before the event fires */
}

/* ---------- the sheet (iOS, and the Safari nudge) -------------------------- */
function sheet(kind) {
  var el = $(SHEET);
  if (!el) {
    el = document.createElement('div');
    el.id = SHEET;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Add Ball Knowledge to your home screen');
    document.body.appendChild(el);
  }
  /* THE FAKE HOME SCREEN. Aaron asked for it and then asked whether it was
     overkill; it is not. "Add to Home Screen" is abstract until you have seen
     what you end up with, and the icon in the mock is the REAL icon file, so
     the picture and the outcome cannot drift. */
  var phone =
    '<div class="is-phone"><div class="ph"><div class="isl"></div>' +
    '<div class="grid">' +
      '<div class="tile"></div><div class="tile"></div>' +
      '<div class="tile real"><img src="assets/brand/icon-192.png" alt=""></div>' +
      '<div class="tile"></div>' +
      '<div class="tile"></div><div class="tile"></div>' +
      '<div class="tile"></div><div class="tile"></div>' +
    '</div><div class="cap">Ball Knowledge</div></div>' +
    '<div class="lede2">what you get</div></div>';

  var steps = kind === 'ios'
    ? '<div class="is-body">' + phone + '<ol class="is-steps">' +
      '<li><span class="is-n">1</span><div>Tap the <b>Share</b> button' +
      '<span class="is-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 15V3"/><path d="M8 7l4-4 4 4"/>' +
      '<path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg></span>' +
      '<em>at the bottom of the screen</em></div></li>' +
      /* STEP 2 IS THE ONE PEOPLE GET STUCK ON, and we only know because Aaron
         sent a photograph of his own share sheet: the second row ends
         "Copy · Add to Bookmarks · Add to Reading List · View More", and
         Add to Home Screen is not on it. It lives behind View More. A guide
         that says "scroll down" and stops is a guide that loses people at
         exactly this step. */
      '<li><span class="is-n">2</span><div>Scroll down the grey list. ' +
      '<b>Do not see it?</b> Tap <b>View More</b> at the end of the row of ' +
      'circles<em>it is hiding behind there</em></div></li>' +
      '<li><span class="is-n">3</span><div>Tap ' +
      '<b>Add to Home Screen</b>, then <b>Add</b>. Done.</div></li>' +
      '</ol></div>' +
      '<p class="is-foot">Nothing downloads and there is no account. ' +
      'It is the same game, wearing an icon.</p>'
    : '<p class="is-lead">This browser cannot add the game to your home ' +
      'screen, but <b>Safari</b> can.</p>' +
      '<p class="is-foot">Open <b>bk-ballknowledge.com/play/</b> in Safari, ' +
      'then tap Share and Add to Home Screen. Takes about fifteen seconds.</p>';

  el.innerHTML =
    '<div class="is-card">' +
      '<button class="is-x" aria-label="Close">&times;</button>' +
      '<h2>Put it on your phone</h2>' + steps +
    '</div>';
  el.querySelector('.is-x').addEventListener('click', close);
  el.addEventListener('click', function (e) { if (e.target === el) close(); });
  document.addEventListener('keydown', esc);
  el.classList.add('on');
  el.querySelector('.is-x').focus();
  if (window.BKAudio) BKAudio.sfx('click');
}
function esc(e) { if (e.key === 'Escape') close(); }
function close() {
  var el = $(SHEET);
  if (el) el.classList.remove('on');
  document.removeEventListener('keydown', esc);
  var l = liveLogo(); if (l) l.focus();
}

/* ---------- the logo ------------------------------------------------------- */
function go() {
  var kind = offer();
  if (!kind) return;                     /* the rule, enforced at the click too */
  if (kind === 'prompt') {
    if (window.BKAudio) BKAudio.sfx('click');
    deferred.prompt();
    deferred.userChoice.then(function () {
      /* The event is single-use whatever they chose. Drop it and repaint, so a
         second tap does not silently do nothing. */
      deferred = null;
      paint();
    });
    return;
  }
  sheet(kind);
}

function paint() { logos().forEach(paintOne); }
function paintOne(l) {
  if (!l) return;
  var kind = offer();
  /* the hint chip belongs to its own logo, not to the page: two menus means
     two of them, and a single id would have left the hidden menu's chip
     stranded next to nothing */
  var hint = l.parentNode ? l.parentNode.querySelector('.install-hint') : null;

  if (!kind) {
    /* Nothing to offer. Strip EVERY affordance, not just the handler: no
       pointer, no hint, no label, and out of the tab order. */
    l.classList.remove('can-install');
    l.removeAttribute('role');
    l.removeAttribute('tabindex');
    l.removeAttribute('aria-label');
    l.setAttribute('alt', '');
    if (hint) hint.remove();
    return;
  }

  l.classList.add('can-install');
  l.setAttribute('role', 'button');
  l.setAttribute('tabindex', '0');
  l.setAttribute('aria-label', 'Add Ball Knowledge to your home screen');
  l.setAttribute('alt', 'Ball Knowledge');
  if (!hint) {
    hint = document.createElement('button');
    /* class, not id, there is one of these per logo now, and duplicate ids
       are how the second one becomes invisible to every querySelector */
    hint.className = 'install-hint';
    hint.type = 'button';
    hint.innerHTML = '<span class="ih-plus" aria-hidden="true">+</span>' +
                     '<span class="ih-txt">Add to home screen</span>';
    hint.addEventListener('click', function (e) { e.stopPropagation(); go(); });
    l.insertAdjacentElement('afterend', hint);
  }
}

/* ---------- did they have it, and lose it? --------------------------------- */
/* Aaron, 2026-08-07: *"someone could remove it from their screen accidentally
   and if that happens when they visit the site it should come up for them
   again, can we handle that?"*

   Partly, and the honest split matters more than the code:

   ANDROID: fully. Chrome stops firing `beforeinstallprompt` while the app is
   installed and starts again once it is removed, so a fresh event after we have
   recorded an install IS a removal, definitively.

   iOS: only sometimes, and it is Apple's fault rather than ours. A home-screen
   web app on iOS gets its OWN storage, separate from the Safari tab, and there
   is no API anywhere that lets a browser tab ask "is this site already on the
   home screen". So a phone that installs, then deletes, then returns via Safari
   may genuinely have no memory of the install to find.

   WHICH IS WHY THIS IS A BONUS AND NOT THE MECHANISM. The thing that always
   works is `offer()`: the moment the app is not installed, the logo becomes a
   control again and the hint pill returns, on every platform, with no memory
   required. The coach re-appearing is the louder version, not the only one. */
function markHad() {
  try { if (installed()) localStorage.setItem(HAD_KEY, '1'); } catch (e) {}
}
function checkRemoved() {
  try {
    if (installed() || !localStorage.getItem(HAD_KEY)) return false;
    /* Had it, does not have it now. Re-arm the coach and forget the install,
       so this fires ONCE per removal rather than on every visit afterwards. */
    localStorage.removeItem(HAD_KEY);
    localStorage.removeItem(SEEN_KEY);
    return true;
  } catch (e) { return false; }
}

/* ---------- the coach's first word ----------------------------------------- */
/* Fires ONCE, on the title screen, and only when there is something to offer.
   Telling somebody to tap a logo that will not respond is worse than silence. */
function welcome() {
  if (!offer()) return;
  var again = checkRemoved();
  try { if (localStorage.getItem(SEEN_KEY)) return; } catch (e) { return; }
  if (!window.BKCoach || !BKCoach.say || !BKCoach.on()) return;
  try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* private mode */ }
  var ios = offer() !== 'prompt';
  /* A different first sentence when it is a RETURN. Being greeted with "first
     time here" by something you have already installed once reads as a bug. */
  BKCoach.say(again ? 'welcome-again' : 'welcome',
    (again
      ? '<b>Looks like the icon went missing.</b> Want it back? '
      : '<b>First time here.</b> ') +
    'Let me put this on your home screen. It opens ' +
    'full screen after that, like a real app, and you never have to find the ' +
    'link again. ' +
    /* The grey reassurance line ("Fifteen seconds, nothing downloads, no
       account") is GONE, Aaron 08-29, reading the card on his phone. Three
       promises nobody asked for, under a card that already made its offer
       in two sentences. The card keeps the offer and the anytime line. */
    /* Aaron 08-07: "let's make the tap the icon anytime thing bolder." It was
       a clause inside the small grey line; it is now its own line, in the
       accent, right above the buttons, because it is the sentence that has to
       survive being dismissed. */
    '<span class="ct-anytime">Or tap the logo any time. It is always ' +
    'up there.</span>',
    /* The button, not just the instruction, and the logo keeps working
       afterwards, which is what the second sentence is for. */
    { label: ios ? 'Show me how' : 'Add it now', fn: go },
    /* the subject of the sentence, cut out of the dim and ringed */
    LOGO_SEL);
}

/* ---------- wiring --------------------------------------------------------- */
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();       /* stop Chrome's own banner; the logo owns this */
  deferred = e;
  paint();
});
window.addEventListener('appinstalled', function () {
  deferred = null;
  try { localStorage.setItem(HAD_KEY, '1'); } catch (e) {}
  close();
  paint();                  /* the logo goes inert the moment it lands */
});

(function () {
  logos().forEach(function (l) {
    l.addEventListener('click', go);
    l.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
  markHad();                /* record it on every launch of the installed app */
  paint();
  /* welcome() is NOT called here. game.js's loader calls it the moment the
     title screen is actually up, because "wait 2.2 seconds and hope" is a race
     dressed as a delay -- and it lost, in the harness, on the first run. */
})();

window.BKInstall = {
  /* test surface, the harness drives the real functions, never a copy */
  _offer: offer, _installed: installed, _paint: paint, _go: go,
  _sheet: sheet, _close: close, _welcome: welcome,
  _markHad: markHad, _checkRemoved: checkRemoved,
  _ios: isIOS, _safari: isSafari,
  _setDeferred: function (v) { deferred = v; paint(); }
};
})();

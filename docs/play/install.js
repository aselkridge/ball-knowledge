/* ============================================================================
   ADD TO HOME SCREEN — the in-game half of it.

   The manifest (B2) makes the game INSTALLABLE. This file makes anyone
   actually notice, which is a different problem: nobody browsing a web page
   thinks "I should check my browser menu".

   Aaron, 2026-08-07: *"Could clicking the logo in the top left hand corner
   prompt adding to Home Screen? And maybe that could be the first thing the
   'coach' says to do!?"* Both, and they fix each other's weakness — the coach
   makes it DISCOVERABLE once, the logo makes it PERMANENT after that. Nobody
   taps a logo unprompted; nobody remembers a one-off tip.

   THE TWO PLATFORMS DO GENUINELY DIFFERENT THINGS, and pretending otherwise is
   how this ships broken:
     Android/Chrome — the browser fires `beforeinstallprompt`. We stash it and
       the logo replays it, which is a REAL one-tap install dialog.
     iOS/Safari     — there is NO API. None. Apple exposes no way to trigger or
       even detect installability, so the most any button can honestly do is
       point at the Share icon. We show a sheet that does exactly that.
     iOS/other      — Chrome and Firefox on iOS cannot add to the home screen
       in the way Safari can, so the honest answer is "open this in Safari".

   AARON'S RULE, 2026-08-07, and it is enforced in one place:
   *"clicking the logo to download to Home Screen should not work once it's on
   the Home Screen. Same for if clicking the logo surfaces instructions on
   iOS."* So `offer()` is the single gate, `installed()` is checked first, and
   when there is nothing to offer the logo is not merely inert — it loses the
   cursor, the hint, the aria-label and its place in the tab order, because a
   control that looks live and does nothing is worse than no control.
   ========================================================================== */
(function () {
'use strict';

var LOGO = 'logo', HINT = 'installHint', SHEET = 'installSheet';
var deferred = null;          /* the Android beforeinstallprompt event */
var SEEN_KEY = 'bk_install_seen';

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
  var steps = kind === 'ios'
    ? '<ol class="is-steps">' +
      '<li><span class="is-n">1</span><div>Tap the <b>Share</b> button' +
      '<span class="is-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 15V3"/><path d="M8 7l4-4 4 4"/>' +
      '<path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg></span>' +
      '<em>at the bottom of the screen</em></div></li>' +
      '<li><span class="is-n">2</span><div>Scroll down and tap ' +
      '<b>Add to Home Screen</b></div></li>' +
      '<li><span class="is-n">3</span><div>Tap <b>Add</b>. That is it.</div></li>' +
      '</ol>' +
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
  var l = $(LOGO); if (l) l.focus();
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

function paint() {
  var l = $(LOGO);
  if (!l) return;
  var kind = offer();
  var hint = $(HINT);

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
    hint.id = HINT;
    hint.className = 'install-hint';
    hint.type = 'button';
    hint.innerHTML = '<span class="ih-plus" aria-hidden="true">+</span>' +
                     '<span class="ih-txt">Add to home screen</span>';
    hint.addEventListener('click', function (e) { e.stopPropagation(); go(); });
    l.insertAdjacentElement('afterend', hint);
  }
}

/* ---------- the coach's first word ----------------------------------------- */
/* Fires ONCE, on the title screen, and only when there is something to offer.
   Telling somebody to tap a logo that will not respond is worse than silence. */
function welcome() {
  if (!offer()) return;
  try { if (localStorage.getItem(SEEN_KEY)) return; } catch (e) { return; }
  if (!window.BKCoach || !BKCoach.say || !BKCoach.on()) return;
  try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* private mode */ }
  var ios = offer() !== 'prompt';
  BKCoach.say('welcome',
    '<b>First time here.</b> Let me put this on your home screen. It opens ' +
    'full screen after that, like a real app, and you never have to find the ' +
    'link again. ' +
    '<span class="ct-sub">Fifteen seconds, nothing downloads, no account. ' +
    'Not now? <b>Tap the logo</b> any time.</span>',
    /* The button, not just the instruction — and the logo keeps working
       afterwards, which is what the second sentence is for. */
    { label: ios ? 'Show me how' : 'Add it now', fn: go });
  var l = $(LOGO);
  if (l) l.classList.add('nudge');
  setTimeout(function () { if (l) l.classList.remove('nudge'); }, 6000);
}

/* ---------- wiring --------------------------------------------------------- */
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();       /* stop Chrome's own banner; the logo owns this */
  deferred = e;
  paint();
});
window.addEventListener('appinstalled', function () {
  deferred = null;
  close();
  paint();                  /* the logo goes inert the moment it lands */
});

(function () {
  var l = $(LOGO);
  if (l) {
    l.addEventListener('click', go);
    l.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  }
  paint();
  /* welcome() is NOT called here. game.js's loader calls it the moment the
     title screen is actually up, because "wait 2.2 seconds and hope" is a race
     dressed as a delay -- and it lost, in the harness, on the first run. */
})();

window.BKInstall = {
  /* test surface — the harness drives the real functions, never a copy */
  _offer: offer, _installed: installed, _paint: paint, _go: go,
  _sheet: sheet, _close: close, _welcome: welcome,
  _ios: isIOS, _safari: isSafari,
  _setDeferred: function (v) { deferred = v; paint(); }
};
})();

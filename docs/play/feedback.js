/* ============================================================================
   B6 · THE IN-GAME FEEDBACK BUTTON.

   V0 says it plainly: "The entire point of the twenty is feedback. Without this
   it happens in a group chat, out of context, or not at all." The out-of-context
   part is the expensive half. "the shot thing was weird" costs an hour of
   guessing; the same sentence with the screen, the mode, the quarter, the score
   and the house rules attached costs a minute.

   THREE DESIGN CALLS, and each one is the reason this needed no decision from
   Aaron before it could be built:

   1 · IT SENDS BY SHARE, NOT BY SERVER. navigator.share hands the report to
       whatever the tester already uses to talk to Aaron: Messages, WhatsApp,
       mail, whatever is on their phone. No endpoint to stand up, no endpoint to
       go down, no address to leak, and it works the same on a phone that has
       never heard of this game. Clipboard fallback where share is missing,
       exactly like shareInvite() already does for the invite link. If a server
       endpoint is ever wanted, the capture is already here and it is one fetch.

   2 · THE CONTEXT IS SHOWN BEFORE IT IS SENT. A "feedback" button that quietly
       harvests the screen, the mode and the user agent is a tracker with a
       friendly name. Everything attached is on screen, in a box, readable,
       before anybody taps send. That is not politeness, it is the difference
       between a feature and a dark pattern.

   3 · NOTHING IS LOST IF THEY BAIL. Every report is written to localStorage the
       moment it is composed, whether or not the share completes, because a share
       sheet is dismissable and a tester who gives up mid-send has still done the
       work. BKFeedback.dump() prints them, and The Tape can carry them later.

   Entry points are the three moments an opinion actually exists: the pause menu
   (something just went wrong), the final buzzer (the whole thing is fresh), and
   Settings (they went looking).
   ========================================================================== */
(function () {
  'use strict';
  var KEY = 'bk_feedback';
  var K = function () { return window.BK || null; };
  var $ = function (id) { return document.getElementById(id); };

  /* ---- what kind of feedback. Three, because a list of ten is a form and a
     form is a thing people close. Every one of them is a different JOB for
     Aaron: broken means fix, confusing means explain, idea means decide. ---- */
  var KINDS = [
    { k: 'bug',   ic: '&#9888;', nm: 'Something broke',  hint: 'What were you doing when it went wrong?' },
    { k: 'lost',  ic: '&#63;',   nm: 'I was confused',   hint: 'What did you expect to happen instead?' },
    { k: 'idea',  ic: '&#9733;', nm: "I've got an idea", hint: 'What would you add or change?' }
  ];

  /* ---------------------------------------------------------------- context */
  /* Read defensively, every single field. This runs on a phone that may be
     mid-crash, which is exactly when feedback matters most and exactly when
     half the game state does not exist. A feedback button that throws while
     reporting a bug is the worst possible version of this feature. */
  function grab(fn, dflt) { try { var v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } }

  function whereAmI() {
    var v = ['pauseveil', 'endveil', 'qveil', 'meterveil', 'rebveil', 'tipveil',
             'jumboveil', 'cpuveil', 'insveil', 'netveil'];
    for (var i = 0; i < v.length; i++) {
      var e = $(v[i]);
      if (e && (e.classList.contains('on') || getComputedStyle(e).display !== 'none')) return v[i];
    }
    var on = document.querySelector('.screen.on');
    return on ? on.id.replace('screen-', '') : 'unknown';
  }

  /* Every accessor below is the REAL test surface on window.BK, not a guess at
     one. state.score, not state.pts. setupCfg.target, not setupCfg.format.
     CPU.level, not cpuLvl. Checked against game.js rather than remembered,
     because a context block that silently reports "undefined" for the one field
     that mattered is worse than reporting nothing. */
  function context() {
    var k = K(), st = grab(function () { return k.state(); }, null);
    var cfg = grab(function () { return k._cfg(); }, null) || {};
    var cpu = grab(function () { return k._cpu(); }, null) || {};
    var net = grab(function () { return k._net(); }, null) || {};
    var c = {
      when: new Date().toISOString(),
      where: whereAmI(),
      screen: window.innerWidth + 'x' + window.innerHeight +
              ' @' + (window.devicePixelRatio || 1) + 'x',
      installed: grab(function () {
        return matchMedia('(display-mode: standalone)').matches ||
               navigator.standalone === true; }, false),
      ua: navigator.userAgent
    };
    if (st) {
      c.mode = cpu.on ? 'vs CPU' : (net.on ? 'online' : 'local');
      c.score = grab(function () { return st.score[0] + ' - ' + st.score[1]; }, null);
      c.target = st.qmode ? '4 quarters' : ('first to ' + st.target);
      c.quarter = st.qmode ? st.q : null;
      c.phase = st.phase;
      c.possession = st.offense === 0 ? 'orange' : 'blue';
      /* eras is a list in some modes and a single word ("ANY") in others.
         Calling join on the word threw, grab() swallowed it, and the field
         vanished from every bug report a tester sent (found 08-26 by the
         feedback gate's count floor, which is exactly what it was built for). */
      c.eras = grab(function () {
        return Array.isArray(st.eras) ? st.eras.join(' ') : String(st.eras); }, null);
      c.league = st.league;
      if (cpu.on) c.cpuLevel = cpu.level;
      if (net.on) c.room = net.code;
    }
    if (cfg.spacing) c.spacing = cfg.spacing;
    if (cfg.packs && cfg.packs.length) c.packs = cfg.packs.join(' ');
    c.court = grab(function () { return cfg.court || localStorage.getItem('bk_court'); }, null);
    c.coach = grab(function () { return window.BKCoach && BKCoach.on() ? 'on' : 'off'; }, null);
    c.dailyToday = grab(function () {
      return window.BKDaily && BKDaily.doneToday && BKDaily.doneToday() ? 'yes' : 'no'; }, null);
    /* drop the empties so the box a tester reads is short */
    var out = {};
    for (var key in c) if (c[key] !== null && c[key] !== undefined && c[key] !== '') out[key] = c[key];
    return out;
  }

  function contextLines(c) {
    var order = ['where', 'mode', 'score', 'target', 'quarter', 'phase',
                 'possession', 'league', 'eras', 'packs', 'spacing', 'cpuLevel',
                 'room', 'court', 'coach', 'dailyToday', 'screen', 'installed',
                 'when', 'ua'];
    var rows = [];
    order.forEach(function (k) { if (k in c) rows.push([k, String(c[k])]); });
    for (var k2 in c) if (order.indexOf(k2) < 0) rows.push([k2, String(c[k2])]);
    return rows;
  }

  /* ------------------------------------------------------------------ store */
  function all() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function keep(rec) {
    try {
      var a = all(); a.push(rec);
      while (a.length > 40) a.shift();          /* a phone is not an archive */
      localStorage.setItem(KEY, JSON.stringify(a));
    } catch (e) {}
    return rec;
  }

  function report(kind, text, c) {
    var k = KINDS.filter(function (x) { return x.k === kind; })[0] || KINDS[0];
    var lines = ['BALL KNOWLEDGE · ' + k.nm.toUpperCase(), '', (text || '(no note)'), ''];
    contextLines(c).forEach(function (r) { lines.push(r[0] + ': ' + r[1]); });
    return lines.join('\n');
  }

  /* --------------------------------------------------------------------- UI */
  var el, kind = null, sent = false;

  function build() {
    if (el) return el;
    el = document.createElement('div');
    el.id = 'fbveil';
    el.innerHTML =
      '<div class="fb-card" role="dialog" aria-modal="true" aria-label="Send feedback">' +
        '<button class="fb-x" id="fbX" aria-label="Close">&times;</button>' +
        '<h3>Tell Aaron</h3>' +
        '<p class="fb-sub">This game is being tested. Anything you say here goes ' +
          'straight to him, in your own messages.</p>' +
        '<div class="fb-kinds" id="fbKinds"></div>' +
        '<textarea id="fbText" rows="3" placeholder="What happened?"></textarea>' +
        '<details class="fb-ctx"><summary>What gets attached <span id="fbN"></span></summary>' +
          '<div class="fb-rows" id="fbRows"></div></details>' +
        '<div class="fb-act">' +
          '<button class="mbtn" id="fbSend">Send it</button>' +
          '<button class="mbtn ghost" id="fbCancel">Not now</button>' +
        '</div>' +
        '<p class="fb-note" id="fbNote"></p>' +
      '</div>';
    document.body.appendChild(el);

    var kb = $('fbKinds');
    KINDS.forEach(function (x) {
      var b = document.createElement('button');
      b.className = 'fb-kind'; b.dataset.k = x.k;
      b.innerHTML = '<i>' + x.ic + '</i><span>' + x.nm + '</span>';
      b.addEventListener('click', function () { pick(x.k); });
      kb.appendChild(b);
    });
    $('fbX').addEventListener('click', close);
    $('fbCancel').addEventListener('click', close);
    $('fbSend').addEventListener('click', send);
    el.addEventListener('click', function (e) { if (e.target === el) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.classList.contains('on')) close();
    });
    return el;
  }

  function pick(k) {
    kind = k;
    var hint = (KINDS.filter(function (x) { return x.k === k; })[0] || KINDS[0]).hint;
    [].forEach.call(el.querySelectorAll('.fb-kind'), function (b) {
      b.classList.toggle('on', b.dataset.k === k);
    });
    $('fbText').placeholder = hint;
    $('fbSend').disabled = false;
    try { $('fbText').focus(); } catch (e) {}
    if (window.BKAudio) BKAudio.sfx('select');
  }

  function open() {
    build();
    kind = null; sent = false;
    $('fbText').value = '';
    $('fbNote').textContent = '';
    $('fbSend').disabled = true;
    [].forEach.call(el.querySelectorAll('.fb-kind'), function (b) { b.classList.remove('on'); });

    var c = context(), rows = contextLines(c);
    $('fbN').textContent = '(' + rows.length + ')';
    $('fbRows').innerHTML = rows.map(function (r) {
      return '<div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>';
    }).join('');
    el.dataset.ctx = JSON.stringify(c);
    el.classList.add('on');
    /* the pause veil already froze the clock; nothing else here touches state */
  }

  function close() { if (el) el.classList.remove('on'); }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function send() {
    if (!kind) return;
    var text = $('fbText').value.trim();
    var c = {};
    try { c = JSON.parse(el.dataset.ctx || '{}'); } catch (e) {}
    var body = report(kind, text, c);

    /* KEEP IT FIRST. A share sheet is dismissable and a tester who bails
       halfway has still done the work of noticing and typing. */
    keep({ kind: kind, text: text, ctx: c, at: c.when });
    sent = true;

    var done = function (how) {
      $('fbNote').textContent = how;
      if (window.BKAudio) BKAudio.sfx('net');
      setTimeout(close, how.indexOf('Copied') === 0 ? 1500 : 700);
    };
    if (navigator.share) {
      navigator.share({ title: 'Ball Knowledge feedback', text: body })
        .then(function () { done('Sent. Thank you.'); })
        .catch(function (e) {
          /* AbortError means they closed the sheet on purpose. Saying "copied"
             then would be a lie, and offering nothing would lose the report. */
          if (e && e.name === 'AbortError') { $('fbNote').textContent = 'Saved. Send it whenever.'; return; }
          copy(body, done);
        });
    } else copy(body, done);
  }

  function copy(body, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(body)
        .then(function () { done('Copied. Paste it to Aaron.'); })
        .catch(function () { done('Saved on this phone.'); });
    } else done('Saved on this phone.');
  }

  /* ------------------------------------------------------------------ wiring */
  function addButton(host, label, cls) {
    if (!host || host.querySelector('.fb-open')) return null;
    var b = document.createElement('button');
    b.className = 'mbtn ' + (cls || 'ghost') + ' fb-open';
    b.innerHTML = label;
    b.addEventListener('click', function (e) { e.stopPropagation(); open(); });
    host.appendChild(b);
    return b;
  }

  function mount() {
    build();
    /* the pause menu: something just went wrong and they reached for the menu */
    var pv = document.querySelector('#pauseveil .menu');
    if (pv) {
      var exit = $('pExit');
      var b = addButton(pv, 'Send feedback');
      if (b && exit) pv.insertBefore(b, exit);       /* above Exit, not below */
    }
    /* the final buzzer: the whole game is fresh and they have an opinion */
    addButton(document.querySelector('#endveil .ev-menu'), 'Send feedback');
    /* Settings: they went looking for it */
    var set = document.querySelector('#screen-settings .wrap') ||
              $('screen-settings');
    if (set && !set.querySelector('.fb-open')) {
      var w = document.createElement('div');
      w.className = 'fb-settings';
      w.innerHTML = '<div class="fb-slab">Found something? Tell Aaron. It goes ' +
                    'to him in your own messages, with what you were doing attached.</div>';
      addButton(w, 'Send feedback', '');
      set.appendChild(w);
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.BKFeedback = {
    open: open, close: close,
    all: all,
    dump: function () { return all().map(function (r) { return report(r.kind, r.text, r.ctx); }).join('\n\n---\n\n'); },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
    _ctx: context, _report: report, _sent: function () { return sent; },
    _kinds: KINDS.map(function (k) { return k.k; })
  };
})();

/* Island Readers sample: core helpers (state, audio, DOM, icons). No frameworks. */
(function () {
  'use strict';
  const D = window.IR_DATA;
  const KEY = 'ir_sample_ng_v1';
  const CHUNK_COLORS = { ang: '#D9502B', ing: '#0E8584', ong: '#6B45B8', ung: '#A06A00' };

  /* ---------- small DOM helpers ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function colorWord(w) {
    const m = /(ang|ing|ong|ung)$/.exec(w);
    if (!m) return document.createTextNode(w);
    const s = h('span', null, w.slice(0, m.index), h('span', { class: 'chunk', style: 'color:' + CHUNK_COLORS[m[1]] }, m[1]));
    return s;
  }

  /* ---------- icons ---------- */
  const ICON = {
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    starOutline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></g></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 018 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 2.8l1.5 2.5 2.9-.6.7 2.9 2.7 1.2-1 2.8 1.9 2.2-2.2 1.9.2 3-3 .2-1.5 2.5-2.7-1.2-2.7 1.2-1.5-2.5-3-.2.2-3-2.2-1.9 1.9-2.2-1-2.8 2.7-1.2.7-2.9 2.9.6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5h4l5-4.2v13.4l-5-4.2h-4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.6 5.9a9 9 0 010 12.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4.5" width="4.2" height="15" rx="1" fill="currentColor"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bucket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16l-1.8 11.2a2 2 0 01-2 1.8H7.8a2 2 0 01-2-1.8z" fill="currentColor"/><path d="M7 8a5 5 0 0110 0" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    badge: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 38L12 60l12-5 8 7 8-7 12 5-8-22z" fill="#E8603C"/><circle cx="32" cy="26" r="22" fill="#F4B63F" stroke="#B87800" stroke-width="3"/><circle cx="32" cy="26" r="15" fill="#FFE08A" stroke="#B87800" stroke-width="2"/><path d="M32 15l3.2 6.6 7.2.9-5.3 5 1.4 7.2L32 31.2l-6.5 3.5 1.4-7.2-5.3-5 7.2-.9z" fill="#E8603C"/></svg>'
  };
  function icon(name, cls) { return h('span', { class: 'ico ' + (cls || ''), html: ICON[name] }); }


  /* ---------- end-of-lesson / end-of-check celebration: Zip + Frill bounce, confetti stars, text only ("Great job!") ---------- */
  const reduced = () => document.body.classList.contains('calm') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function celebration(big) {
    const still = reduced();
    const wrap = h('div', { class: 'celeb' + (big ? ' big' : '') + (still ? ' still' : ''), 'aria-hidden': 'true' });
    const cols = ['#F4B63F', '#E8603C', '#1FA6A6', '#7E57C2', '#E0457B', '#2E9E6B'];
    const n = big ? 28 : 14;
    for (let i = 0; i < n; i++) {
      const st = h('span', { class: 'cstar', style: 'left:' + (4 + (i * 97 / n + (i % 3) * 3)) % 96 + '%;animation-delay:' + ((i % 7) * 0.12).toFixed(2) + 's;animation-duration:' + (2.2 + (i % 5) * 0.25).toFixed(2) + 's;color:' + cols[i % cols.length] + ';--s:' + (0.7 + (i % 4) * 0.22).toFixed(2) }, icon('star'));
      wrap.append(st);
    }
    wrap.append(h('div', { class: 'dancers' }, h('img', { class: 'dz', src: 'img/zip.webp', alt: '' }), h('img', { class: 'df', src: 'img/frill.webp', alt: '' })));
    return wrap;
  }

  /* ---------- persistent state (localStorage, with in-memory fallback) ---------- */
  const blank = () => ({
    v: 1, lessons: {}, check: { best: null, last: null, attempts: 0 }, sticker: false, badge: false,
    streak: { count: 0, last: null, restWeek: null }, heart: {}, reads: {}, settings: { calm: false, openAll: false }
  });
  let mem = null;
  function load() {
    try { const r = localStorage.getItem(KEY); if (r) return Object.assign(blank(), JSON.parse(r)); } catch (e) { /* ignore */ }
    return mem || blank();
  }
  let S = load();
  function save() {
    mem = S;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked: keep in memory */ }
  }
  function resetAll() { S = blank(); save(); applySettings(); }
  function dayNum(d) { return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000); }
  function isoWeekKey(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return t.getUTCFullYear() + '-' + Math.ceil(((t - y0) / 86400000 + 1) / 7);
  }
  /* Zip's Streak: one free rest day each week never breaks it. */
  function touchStreak() {
    const now = new Date(); const today = dayNum(now); const st = S.streak;
    if (st.last == null) { st.count = 1; }
    else {
      const diff = today - st.last;
      if (diff === 0) { /* already counted today */ }
      else if (diff === 1) st.count += 1;
      else if (diff === 2 && st.restWeek !== isoWeekKey(now)) { st.count += 1; st.restWeek = isoWeekKey(now); }
      else st.count = 1;
    }
    st.last = today; save();
  }
  function streakInfo() {
    const st = S.streak; if (st.last == null) return { count: 0, active: false };
    const diff = dayNum(new Date()) - st.last;
    return { count: st.count, active: diff <= 2 };
  }
  function totalStars() {
    let n = 0;
    for (const k in S.lessons) n += S.lessons[k].stars || 0;
    if (S.check.best != null) n += S.check.best >= 9 ? 3 : S.check.best >= 7 ? 2 : 1;
    return n;
  }
  function applySettings() { document.body.classList.toggle('calm', !!S.settings.calm); }

  /* ---------- audio: recorded voice only ----------
     ONE shared <audio> element is reused for everything (iOS/Android only need the first tap to unlock it; a brand-new Audio()
     per sound is blocked by Safari when it starts outside a tap, which silenced Story Time, the Check and long chains).
     play() rejections are never swallowed: they show a small "Sound off? Tap to enable" button that unlocks and replays. */
  const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
  const Snd = {
    el: null, id: 0, unlocked: false, last: null, blocked: false, log: [],
    init() {
      if (this.el) return this.el;
      const a = document.createElement('audio'); a.preload = 'auto'; a.setAttribute('playsinline', ''); a.style.display = 'none';
      document.body.append(a); this.el = a;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
      const unlock = () => {
        if (this.unlocked) return; this.unlocked = true;
        if (!this.playing) { try { a.src = SILENT; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* */ } }
        ['pointerdown', 'touchend', 'click', 'keydown'].forEach((ev) => document.removeEventListener(ev, unlock, true));
      };
      ['pointerdown', 'touchend', 'click', 'keydown'].forEach((ev) => document.addEventListener(ev, unlock, true));
      return a;
    },
    stop() {
      this.id++; this.playing = false;
      if (this.el) { try { this.el.pause(); } catch (e) { /* */ } }
      $$('.playing').forEach((e) => e.classList.remove('playing')); $$('.vtile.lit').forEach((e) => e.classList.remove('lit'));
    },
    showFallback() {
      this.blocked = true; if ($('#soundfix')) return;
      const b = h('button', { id: 'soundfix', class: 'soundfix', type: 'button', 'aria-label': 'Sound is off. Tap to turn sound on.' }, icon('speaker'), 'Sound off? Tap to enable');
      b.addEventListener('click', () => { const l = this.last; b.remove(); this.blocked = false; this.unlocked = true; if (l) l(); else this.play(A.ng); });
      document.body.append(b);
    },
    hideFallback() { this.blocked = false; const b = $('#soundfix'); if (b) b.remove(); },
    /* Resolves true when it finished, false on error/rejection. If another sound stops it, it never resolves (the old flow is cancelled). */
    play(src, opts) {
      opts = opts || {}; const a = this.init();
      if (!opts.keep) this.stop();
      const id = this.id; this.log.push(src); this.last = () => this.play(src, opts);
      return new Promise((resolve) => {
        let done = false, raf = 0, timer = 0, lastT = -1, stuck = 0;
        const cleanup = () => { done = true; cancelAnimationFrame(raf); clearInterval(timer); ['ended', 'error', 'playing'].forEach((e, i) => a.removeEventListener(e, hs[i])); };
        const fin = (ok) => { if (done) return; cleanup(); this.playing = false; resolve(ok); };
        const hs = [() => { if (this.id === id) fin(true); }, () => { if (this.id === id) fin(false); }, () => { this.hideFallback(); }];
        a.addEventListener('ended', hs[0]); a.addEventListener('error', hs[1]); a.addEventListener('playing', hs[2]);
        this.playing = true;
        try { a.src = src; a.currentTime = 0; } catch (e) { /* */ }
        if (opts.onTime) { const tick = () => { if (done || this.id !== id) return; opts.onTime(a.currentTime); raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); }
        /* watchdog: 'ended' is not reliable on every device; also detect a stalled or never-started element */
        timer = setInterval(() => {
          if (this.id !== id) { cleanup(); return; }
          const d = a.duration;
          if (a.ended || (isFinite(d) && d > 0 && a.currentTime >= d - 0.03)) return fin(true);
          if (a.currentTime === lastT && !a.paused) stuck += 100; else if (a.currentTime !== lastT) stuck = 0;
          if (a.paused && a.currentTime === 0) stuck += 100;
          lastT = a.currentTime; if (stuck > 6000) { this.showFallback(); fin(false); }
        }, 100);
        let p; try { p = a.play(); } catch (e) { p = Promise.reject(e); }
        if (p && p.catch) p.catch((e) => { if (this.id !== id) return; if (e && e.name === 'AbortError') return; this.showFallback(); fin(false); });
      });
    },
    async seq(list, gap) {
      this.stop(); const id = this.id;
      for (const s of list) {
        if (this.id !== id) return false;
        const ok = await this.play(s, { keep: true });
        if (this.id !== id) return false;
        if (ok === false) return false;
        await sleep(gap == null ? 140 : gap);
      }
      return true;
    }
  };
  const A = {
    word: (w) => 'audio/w_' + w + '.mp3',
    prompt: (id) => 'audio/p_' + id + '.mp3',
    chunk: (c) => 'audio/' + c + '.mp3',
    sfx: { ding: 'audio/sfx_ding.mp3', tryagain: 'audio/sfx_try.mp3', done: 'audio/sfx_done.mp3', gong: 'audio/sfx_gong.mp3', tap: 'audio/sfx_tap.mp3' },
    ng: 'audio/ng.mp3'
  };
  function sayWord(w) { return Snd.play(A.word(w)); }
  const ding = (w) => Snd.seq(w ? [A.sfx.ding, A.word(w)] : [A.sfx.ding], 90);
  const tryAgain = (w) => Snd.seq(w ? [A.sfx.tryagain, w] : [A.sfx.tryagain], 150);

  /* screen token so async flows stop when the child leaves */
  let screenId = 0;
  function newScreen() { screenId++; Snd.stop(); const id = screenId; return { ok: () => id === screenId }; }

  function speakerBtn(onClick, label) {
    const b = h('button', { class: 'speaker', type: 'button', 'aria-label': label || 'Hear it' }, icon('speaker'));
    b.addEventListener('click', () => {
      b.classList.add('playing');
      const r = onClick();
      Promise.resolve(r).finally(() => b.classList.remove('playing'));
    });
    return b;
  }

  window.IR = { celebration, ding, tryAgain, D, S: () => S, save, resetAll, load, h, $, $$, sleep, shuffle, pick, colorWord, icon, ICON, CHUNK_COLORS,
    touchStreak, streakInfo, totalStars, applySettings, Snd, A, sayWord, newScreen, speakerBtn };
})();

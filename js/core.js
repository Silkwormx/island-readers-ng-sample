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

  /* ---------- audio: recorded voice only ---------- */
  const Snd = {
    cur: null, id: 0,
    stop() {
      this.id++;
      if (this.cur) { try { this.cur.pause(); } catch (e) { /* */ } this.cur = null; }
      $$('.playing').forEach((e) => e.classList.remove('playing'));
    },
    /* Resolves true when finished, false on error. If stopped by something else it never resolves (the flow is cancelled). */
    play(src, opts) {
      opts = opts || {};
      if (!opts.keep) this.stop();
      const id = this.id;
      return new Promise((resolve) => {
        const a = new Audio(src); this.cur = a; let raf = 0;
        const fin = (ok) => { cancelAnimationFrame(raf); if (this.cur === a) this.cur = null; resolve(ok); };
        a.addEventListener('ended', () => fin(true));
        a.addEventListener('error', () => fin(false));
        if (opts.onTime) {
          const tick = () => { if (this.id !== id || this.cur !== a) return; opts.onTime(a.currentTime); raf = requestAnimationFrame(tick); };
          raf = requestAnimationFrame(tick);
        }
        const p = a.play(); if (p && p.catch) p.catch(() => fin(false));
      });
    },
    async seq(list, gap) {
      this.stop(); const id = this.id;
      for (const s of list) {
        if (this.id !== id) return false;
        await this.play(s, { keep: true });
        if (this.id !== id) return false;
        await sleep(gap == null ? 140 : gap);
      }
      return true;
    }
  };
  const A = {
    word: (w) => 'audio/w_' + w + '.mp3',
    prompt: (id) => 'audio/p_' + id + '.mp3',
    ng: 'audio/ng.mp3'
  };
  const GOOD = ['g1', 'g2', 'g3', 'g4', 'g5'];
  function say(id) { return Snd.play(A.prompt(id)); }
  function sayWord(w) { return Snd.play(A.word(w)); }

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

  window.IR = { D, S: () => S, save, resetAll, load, h, $, $$, sleep, shuffle, pick, colorWord, icon, ICON, CHUNK_COLORS,
    touchStreak, streakInfo, totalStars, applySettings, Snd, A, GOOD, say, sayWord, newScreen, speakerBtn };
})();

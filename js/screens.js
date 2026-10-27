/* Screens + router: Home sky map, Island 3 trail, lesson shell, grown-up corner, cartoon. */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $, $$, sleep, icon, Snd, A, say } = IR;
  const app = $('#app'); const modalRoot = $('#modal-root');
  const LESSONS = IR.LESSONS;
  /* The whole world in order: Ground Level, Islands 1-10, two Review Reefs, four treasure boxes (after Islands 2, 4, 6, 8). Only the ng unit (Island 3) and the wooden chest are playable. */
  const WORLD = [
    { id: 'ground', kind: 'ground', title: 'Ground Level', sub: 'Where the journey starts' },
    { id: 'i1', kind: 'island', n: 1, title: 'Blends and Floss' }, { id: 'i2', kind: 'island', n: 2, title: 'Digraphs' },
    { id: 'chest1', kind: 'chest', style: 'wood', title: 'Wooden chest', sub: 'Level 1 \u00b7 Word games', href: '#/chest1' },
    { id: 'i3', kind: 'island', n: 3, title: 'Glued Sounds', sub: 'ng, nk', href: '#/island3' },
    { id: 'i4', kind: 'island', n: 4, title: 'Silent e and Word Endings' },
    { id: 'chest2', kind: 'chest', style: 'shell', title: 'Seashell chest', sub: 'Level 2' },
    { id: 'i5', kind: 'island', n: 5, title: 'Longer Words' }, { id: 'reef1', kind: 'reef', title: 'Review Reef', sub: 'After Island 5' },
    { id: 'i6', kind: 'island', n: 6, title: 'Bossy r' },
    { id: 'chest3', kind: 'chest', style: 'drum', title: 'Drum chest', sub: 'Level 3' },
    { id: 'i7', kind: 'island', n: 7, title: 'Vowel Teams' }, { id: 'i8', kind: 'island', n: 8, title: 'Other Vowels' },
    { id: 'chest4', kind: 'chest', style: 'gold', title: 'Golden chest', sub: 'Level 4' },
    { id: 'i9', kind: 'island', n: 9, title: 'Word Parts' }, { id: 'i10', kind: 'island', n: 10, title: 'Spelling Patterns' },
    { id: 'reef2', kind: 'reef', title: 'Review Reef', sub: 'After Island 10' }
  ];

  /* ---------- shared bits ---------- */
  function toast(msg) {
    $$('.toast').forEach((t) => t.remove());
    const t = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(t); setTimeout(() => t.remove(), 3200);
  }
  function chips() {
    const s = IR.streakInfo();
    return h('div', { class: 'chips-top' },
      h('div', { class: 'pill star', 'aria-label': IR.totalStars() + ' stars' }, icon('star'), h('b', { id: 'starcount' }, IR.totalStars())),
      h('div', { class: 'pill streak' }, icon('sun'), s.active && s.count ? 'Zip\u2019s Streak: ' + s.count + (s.count === 1 ? ' day' : ' days') : 'Start a streak today!'));
  }
  function gearButton() {
    const b = h('button', { class: 'gear', type: 'button', 'aria-label': 'Grown-ups: press and hold' }, icon('gear'));
    let t = null;
    const start = () => { b.classList.add('holding'); t = setTimeout(() => { b.classList.remove('holding'); openGrownups(); }, 800); };
    const stop = () => { b.classList.remove('holding'); clearTimeout(t); };
    b.addEventListener('pointerdown', start); b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop); b.addEventListener('pointercancel', stop);
    b.addEventListener('click', () => toast('Grown-ups: press and hold this button.'));
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter') openGrownups(); });
    return b;
  }
  function openModal(content, cls) {
    modalRoot.innerHTML = '';
    const close = () => { modalRoot.innerHTML = ''; };
    const box = h('div', { class: 'modal ' + (cls || ''), role: 'dialog', 'aria-modal': 'true' }, content);
    const x = h('button', { class: 'modal-x', type: 'button', 'aria-label': 'Close' }, icon('close')); x.addEventListener('click', () => { close(); if (cls === 'video') $$('video', box).forEach((v) => v.pause()); });
    box.prepend(x);
    modalRoot.append(h('div', { class: 'scrim' }, box)); return { close };
  }
  /* ---- cartoon player with word-by-word captions (CC on by default, remembered) ---- */
  const CC_KEY = 'ir_cc_on';
  function ccGet() { try { const r = localStorage.getItem(CC_KEY); return r === null ? true : r === '1'; } catch (e) { return true; } }
  function ccSet(on) { try { localStorage.setItem(CC_KEY, on ? '1' : '0'); } catch (e) { /* ignore */ } }
  let ccCache = null;
  function loadCaptions() {
    if (ccCache) return Promise.resolve(ccCache);
    return fetch('video/ng_cartoon_captions.json').then((r) => r.json()).then((d) => { ccCache = d; return d; }).catch(() => []);
  }
  function captionPlayer(v, box, cues) {
    let on = ccGet(); let curCue = -2; let curWord = -2; let spans = []; let raf = 0;
    const overlay = h('div', { class: 'cc-overlay', 'aria-hidden': 'true' });
    const toggle = h('button', { class: 'btn small ghost cc-toggle', type: 'button', 'aria-pressed': String(on) });
    const setToggle = () => { toggle.textContent = on ? 'CC: on' : 'CC: off'; toggle.setAttribute('aria-pressed', String(on)); overlay.classList.toggle('off', !on); };
    function findCue(t) { let lo = 0; let hi = cues.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; const c = cues[m]; if (t < c.start) hi = m - 1; else if (t >= c.end) lo = m + 1; else return m; } return -1; }
    function render() {
      const t = v.currentTime; const ci = findCue(t);
      if (ci !== curCue) {
        curCue = ci; curWord = -2; overlay.innerHTML = ''; spans = [];
        if (ci >= 0) {
          const c = cues[ci];
          const who = h('span', { class: 'cc-who cc-' + c.speaker.toLowerCase() }, c.speaker + ':');
          overlay.append(who);
          c.words.forEach((w) => { const sp = h('span', { class: 'cc-w' }, w.w); spans.push(sp); overlay.append(' ', sp); });
        }
        overlay.classList.toggle('empty', ci < 0);
      }
      if (ci >= 0) {
        const ws = cues[ci].words; let wi = -1;
        for (let i = 0; i < ws.length; i++) { if (t >= ws[i].start && t < ws[i].end) { wi = i; break; } }
        if (wi !== curWord) { if (curWord >= 0 && spans[curWord]) spans[curWord].classList.remove('on'); if (wi >= 0) spans[wi].classList.add('on'); curWord = wi; }
      }
    }
    function loop() { render(); if (!v.paused && !v.ended) raf = requestAnimationFrame(loop); else raf = 0; }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    ['play', 'playing', 'seeking', 'seeked', 'timeupdate', 'pause', 'ended', 'loadedmetadata'].forEach((ev) => v.addEventListener(ev, () => { render(); if (!v.paused) kick(); }));
    toggle.addEventListener('click', () => { on = !on; ccSet(on); setToggle(); });
    setToggle(); render();
    const fsBtn = (box.requestFullscreen || box.webkitRequestFullscreen) ? h('button', { class: 'btn small ghost', type: 'button' }, 'Full screen') : null;
    if (fsBtn) fsBtn.addEventListener('click', () => { const f = box.requestFullscreen ? box.requestFullscreen() : box.webkitRequestFullscreen(); if (f && f.catch) f.catch(() => {}); });
    return { overlay, toggle, fsBtn, stop: () => { cancelAnimationFrame(raf); raf = 0; } };
  }
  IR.openCartoon = function () {
    Snd.stop();
    const v = h('video', { controls: true, playsinline: true, preload: 'metadata', poster: 'img/island3_banner.jpg', controlslist: 'nofullscreen', 'aria-label': 'Zip and Frill cartoon with captions' }, h('source', { src: 'video/ng_cartoon_small.mp4', type: 'video/mp4' }));
    const wrap = h('div', { class: 'vwrap' }, v);
    const bar = h('div', { class: 'row center cc-row' });
    openModal(h('div', null, h('h2', null, 'Zip and Frill: The Nose Hum'), wrap, bar, h('p', { class: 'small' }, 'Optional cartoon, 2 min 27 s. Captions highlight each word as it is spoken.')), 'video');
    { const mb = $('.modal.video'); if (mb) mb.append(h('div', { class: 'row center', style: 'margin-top:.8rem' }, h('button', { class: 'btn big back', type: 'button', 'aria-label': 'Back', onclick: () => { $$('video', modalRoot).forEach((v) => v.pause()); modalRoot.innerHTML = ''; } }, icon('back'), 'Back'), h('button', { class: 'btn big next', type: 'button', 'aria-label': 'Next: start the lessons', onclick: () => { $$('video', modalRoot).forEach((v) => v.pause()); modalRoot.innerHTML = ''; const n = nextUp(); location.hash = n ? n.href : '#/home'; } }, 'Next', icon('next')))); }
    loadCaptions().then((cues) => {
      if (!cues || !cues.length) return;
      const cp = captionPlayer(v, wrap, cues);
      wrap.append(cp.overlay); bar.append(cp.toggle); if (cp.fsBtn) bar.append(cp.fsBtn);
      window.__irCC = cp;
    });
  };
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
  function openGrownups() {
    const S = IR.S();
    const calm = h('input', { type: 'checkbox', id: 'opt-calm' }); calm.checked = !!S.settings.calm;
    calm.addEventListener('change', () => { S.settings.calm = calm.checked; IR.save(); IR.applySettings(); });
    const open = h('input', { type: 'checkbox', id: 'opt-open' }); open.checked = !!S.settings.openAll;
    open.addEventListener('change', () => { S.settings.openAll = open.checked; IR.save(); });
    const reset = h('button', { class: 'btn small warn', type: 'button' }, 'Reset all progress');
    reset.addEventListener('click', () => {
      if (reset.dataset.sure) { IR.resetAll(); modalRoot.innerHTML = ''; location.hash = '#/home'; route(); toast('Progress cleared.'); }
      else { reset.dataset.sure = 1; reset.textContent = 'Tap again to clear everything'; }
    });
    const inst = h('button', { class: 'btn small', type: 'button' }, 'Install on this device');
    inst.addEventListener('click', async () => { if (deferredInstall) { deferredInstall.prompt(); } else toast('Use your browser menu: Add to Home Screen / Install app.'); });
    const hearNg = h('button', { class: 'btn small', type: 'button' }, icon('speaker'), 'Play the ng sound (check by ear)');
    hearNg.addEventListener('click', () => Snd.play(A.ng));
    const sc = S.check;
    openModal(h('div', { class: 'grown' },
      h('h2', null, 'Grown-up corner'),
      h('p', null, 'This is a small sample of the Island Readers app: the ng stop on Island 3. Progress is saved only on this device. Nothing is sent anywhere.'),
      h('p', null, 'Check best score: ' + (sc.best == null ? 'not taken yet' : sc.best + ' of 10') + (sc.attempts ? ' (' + sc.attempts + ' tries)' : '') + '.'),
      h('label', { class: 'opt' }, calm, ' Calm motion (fish hold still, no wiggles)'),
      h('label', { class: 'opt' }, open, ' Open every lesson and the check (for testing)'),
      h('div', { class: 'row' }, hearNg, inst, reset),
      h('p', { class: 'small' }, 'The app cannot listen to a child read. Reading aloud stays with a grown-up. Check the isolated ng sound by ear before sharing.')));
  }

  /* ---------- HOME: the world map. Small part at a time: the current island is big, everything else is a folded, locked row. ---------- */
  function homeScreen() {
    const S = IR.S(); IR.newScreen();
    const head = h('header', { class: 'home-head' }, h('div', { class: 'logo' }, h('span', { class: 'logo-a' }, 'Island'), ' Readers'), IR.ui.chips(), IR.ui.gearButton());
    const doneN = unitSections().filter((r) => r.done).length; const complete = unitComplete();
    const artFor = (w) => w.kind === 'chest' ? IR.chestSVG(w.style) : w.kind === 'reef' ? IR.reefSVG() : IR.islandSVG(w.kind === 'ground' ? 0 : w.n);
    const list = h('ol', { class: 'worldlist' });
    WORLD.forEach((w) => {
      const playable = !!w.href; const lit = w.id === 'i4' && complete;
      const label = (w.kind === 'island' ? 'Island ' + w.n + ': ' : '') + w.title;
      if (w.id === 'i3') {
        const card = h('div', { class: 'wnode current', 'data-n': 3, 'data-id': 'i3' },
          h('img', { class: 'island3img', src: 'img/island3.webp', alt: '' }),
          h('div', { class: 'cur-t' }, h('span', { class: 'cur-tag' }, 'You are here'), h('b', null, 'Island 3 \u00b7 Glued Sounds'), h('small', null, 'ng, nk \u00b7 the ng stop is ready to play'),
            h('span', { class: 'cur-prog' }, doneN + ' of ' + unitSections().length + ' stars')),
          h('button', { class: 'btn big primary', type: 'button', onclick: () => { location.hash = '#/island3'; } }, doneN === 0 ? 'Start here' : complete ? 'Play again' : 'Continue', icon('next')));
        if (S.sticker) card.append(h('span', { class: 'sticker', 'aria-label': 'ng sticker earned' }, 'ng'));
        list.append(h('li', { class: 'wrow cur' }, card)); return;
      }
      const cls = 'wnode folded k-' + w.kind + (playable ? ' playable' : ' locked') + (lit ? ' lit' : '');
      const side = playable ? h('span', { class: 'wside play' }, icon('play'), 'Open') : lit ? h('span', { class: 'wside' }, icon('star'), 'Unlocked') : h('span', { class: 'wside' }, icon('lock'), 'Coming soon');
      const sub = lit ? 'Unlocked \u00b7 coming soon in the full app' : (w.sub || (playable ? '' : 'Coming soon'));
      const btn = h('button', { class: cls, type: 'button', 'data-id': w.id, 'data-kind': w.kind, 'aria-label': label + '. ' + (playable ? 'Open.' : lit ? 'Unlocked, coming soon in the full app.' : 'Locked. Coming soon.') },
        h('span', { class: 'wart', html: artFor(w) }), h('span', { class: 'wtxt' }, h('b', null, w.kind === 'island' ? 'Island ' + w.n : w.title), h('small', null, w.kind === 'island' ? w.title + (sub && sub !== 'Coming soon' ? ' \u00b7 ' + sub : '') : sub)), side);
      btn.addEventListener('click', () => { if (playable) { location.hash = w.href; } else { Snd.stop(); toast(lit ? 'Island 4 is lit! It is coming soon in the full app.' : label + ' is coming soon!'); } });
      list.append(h('li', { class: 'wrow' }, btn));
    });
    const nav = h('div', { class: 'lesson-nav trail-nav' },
      h('button', { class: 'btn big back', type: 'button', 'aria-label': 'Back to Island 3', onclick: () => { location.hash = '#/island3'; } }, icon('back'), 'Back'),
      h('button', { class: 'btn big next', type: 'button', 'aria-label': 'Next: the wooden chest', onclick: () => { location.hash = '#/chest1'; } }, 'Next', icon('next')));
    app.append(h('div', { class: 'screen home worldscreen' }, head, h('div', { class: 'worldwrap' }, h('h1', { class: 'worldtitle' }, 'World map'), h('p', { class: 'worldsub' }, 'Ground Level, 10 islands, 2 review reefs and 4 treasure boxes. Only Island 3 and the wooden chest are open for now.'), list), nav));
    requestAnimationFrame(() => { const c = $('.wrow.cur'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center' }); });
  }


  /* ---------- "In this unit" progress sheet: quiet toggle on every unit screen, collapsed by default ---------- */
  /* The unit in its recommended order, in two groups. Numbers run 1-9 straight across both groups. */
  const GROUPS = [{ id: 'lesson', title: 'Lesson', ids: ['intro', 'listen'] }, { id: 'activities', title: 'Activities', ids: ['hear', 'fish', 'build', 'trace', 'sentence', 'story', 'check'] }];
  function unitSections() {
    const items = LESSONS.map((L, i) => ({ id: L.id, title: L.title, blurb: L.blurb, href: '#/lesson/' + (i + 1), color: L.color }))
      .concat([{ id: 'check', title: 'Zip\u2019s Check', blurb: '10 quick questions with Zip', href: '#/check', color: '#2b2540' }]);
    items.forEach((r, i) => { r.num = i + 1; r.done = IR.isDone(r.id); r.stars = IR.activityStars(r.id); r.group = GROUPS.find((g) => g.ids.includes(r.id)).id; });
    return items;
  }
  const unitComplete = () => unitSections().every((r) => r.done);
  IR.unitComplete = unitComplete;
  const nextUp = () => unitSections().find((r) => !r.done) || null;
  function unitButton(currentId) {
    const btn = h('button', { class: 'unitbtn', type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-label': 'In this unit: show the lesson map' }, icon('list'), h('span', { class: 'ulab' }, 'In this unit'));
    let open = null;
    function close() { if (!open) return; document.removeEventListener('keydown', open.onKey); open.el.remove(); open = null; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    function show() {
      if (open) return close();
      const secs = unitSections(); let lastG = null; const rows = [];
      secs.forEach((r) => {
        if (r.group !== lastG) { lastG = r.group; rows.push(h('li', { class: 'ugroup', 'aria-hidden': 'true' }, GROUPS.find((g) => g.id === r.group).title)); }
        rows.push(rowFor(r));
      });
      function rowFor(r) {
        const cur = r.id === currentId;
        const status = r.done ? h('span', { class: 'ustar', 'aria-hidden': 'true' }, icon('star')) : cur ? h('span', { class: 'udot', 'aria-hidden': 'true' }, icon('next')) : h('span', { class: 'ucircle', 'aria-hidden': 'true' });
        return h('li', null, h('button', { class: 'urow' + (cur ? ' cur' : '') + (r.done ? ' done' : ''), type: 'button', 'data-id': r.id, 'aria-current': cur ? 'step' : null,
          'aria-label': r.title + ', ' + (r.done ? 'done' : cur ? 'you are here' : 'to do'),
          onclick: () => { Snd.stop(); const same = cur; close(); if (!same) location.hash = r.href; } }, status, h('span', { class: 'ut' }, r.title)));
      }
      const x = h('button', { class: 'ush-x', type: 'button', 'aria-label': 'Close', onclick: () => close() }, icon('close'));
      const el = h('div', { class: 'usheet-scrim', onclick: (e) => { if (e.target === e.currentTarget) close(); } },
        h('div', { class: 'usheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'In this unit' }, h('div', { class: 'ush-head' }, h('h2', null, 'In this unit'), x), h('ol', { class: 'ush-list' }, ...rows)));
      const onKey = (e) => { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', onKey); modalRoot.append(el); open = { el, onKey }; btn.setAttribute('aria-expanded', 'true');
      const first = el.querySelector('.urow.cur') || el.querySelector('.urow'); if (first) first.focus();
    }
    btn.addEventListener('click', show);
    return btn;
  }
  /* ---------- Unit page (opens the app): Start here, then the whole unit as one path ---------- */
  function trailScreen() {
    const S = IR.S(); IR.newScreen();
    const secs = unitSections(); const nx = nextUp(); const doneN = secs.filter((r) => r.done).length; const total = secs.length; const complete = doneN === total;
    const back = h('button', { class: 'back', type: 'button', onclick: () => { location.hash = '#/home'; } }, icon('back'), 'World map');
    const startLabel = doneN === 0 ? 'Start here' : complete ? 'Play again' : 'Continue';
    const target = nx || secs[2];                       /* all done: replaying means the practice, never the lesson */
    const startBtn = h('button', { class: 'btn big primary startbtn', type: 'button', onclick: () => { location.hash = target.href; } }, startLabel, icon('next'));
    const hero = h('section', { class: 'unithero' },
      h('div', { class: 'ut-title' }, h('span', { class: 'ut-isle' }, 'Island 3 \u00b7 ng'), h('h1', null, 'The ng sound')),
      h('div', { class: 'ut-prog', 'aria-label': doneN + ' of ' + total + ' stars' }, ...secs.map((r) => h('i', { class: r.done ? 'on' : '' }, icon(r.done ? 'star' : 'starOutline'))), h('span', { class: 'ut-count' }, doneN + ' of ' + total)),
      startBtn);
    function stopFor(r) {
      const isLesson = r.group === 'lesson'; const isNext = nx && nx.id === r.id;
      const side = r.done ? (isLesson ? 'Review lesson' : 'Play again') : isNext ? 'Next up' : (isLesson ? 'Lesson' : 'Play');
      const card = h('button', { class: 'stopcard ' + (isLesson ? 'lessonstop' : 'gamestop') + (r.done ? ' done' : '') + (isNext ? ' nextup' : ''), type: 'button', 'data-id': r.id, 'data-group': r.group,
        'aria-label': r.num + '. ' + r.title + '. ' + (isLesson ? 'Lesson. ' : 'Activity. ') + (r.done ? 'Done, star earned.' : isNext ? 'Next up.' : 'Not done yet.'), 'aria-current': isNext ? 'step' : null,
        onclick: () => { Snd.stop(); location.hash = r.href; } },
        h('span', { class: 'snum', 'aria-hidden': 'true' }, String(r.num)),
        h('span', { class: 'sico', 'aria-hidden': 'true' }, icon(isLesson ? 'book' : 'play')),
        h('span', { class: 'stxt' }, h('b', null, r.title), h('small', null, r.blurb)),
        h('span', { class: 'sside' }, h('span', { class: 'sstar' + (r.done ? ' on' : ''), 'aria-hidden': 'true' }, icon(r.done ? 'star' : 'starOutline')), h('span', { class: 'slabel' }, side)));
      return h('li', null, card);
    }
    const group = (g) => h('section', { class: 'ugrp ' + g.id },
      h('h2', { class: 'ugrp-t' }, icon(g.id === 'lesson' ? 'book' : 'play'), g.title, h('small', null, g.id === 'lesson' ? 'Learn it once' : 'Play as often as you like')),
      h('ol', { class: 'stoplist' }, ...secs.filter((r) => r.group === g.id).map(stopFor)));
    const i4 = h('section', { class: 'island4 ' + (complete ? 'open' : 'locked'), 'aria-live': 'polite' },
      h('span', { class: 'i4ico', 'aria-hidden': 'true' }, icon(complete ? 'star' : 'lock')),
      h('span', { class: 'i4txt' }, h('b', null, 'Island 4'), h('small', null, complete ? 'Unlocked! The bridge is lit.' : 'Finish all stars to unlock')),
      h('span', { class: 'i4count' }, doneN + ' of ' + total));
    const cartoon = h('button', { class: 'btn', type: 'button', onclick: () => IR.openCartoon() }, icon('play'), 'Watch the cartoon (optional)');
    app.append(h('div', { class: 'screen trailscreen unitpage' },
      h('header', { class: 'top2' }, back, chips(), unitButton(null), gearButton()),
      h('div', { class: 'unitwrap' }, hero, group(GROUPS[0]), group(GROUPS[1]), i4, h('div', { class: 'row center' }, cartoon)),
      h('div', { class: 'lesson-nav trail-nav' },
        h('button', { class: 'btn big back', type: 'button', 'aria-label': 'Back to the world map', onclick: () => { location.hash = '#/home'; } }, icon('back'), 'Back'),
        h('button', { class: 'btn big next', type: 'button', 'aria-label': nx ? 'Next: ' + nx.title : 'Next: the world map', onclick: () => { location.hash = nx ? nx.href : '#/home'; } }, 'Next', icon('next')))));
  }

  /* ---------- lesson shell ---------- */
  function lessonScreen(idx) {
    const L = LESSONS[idx]; if (!L) { location.hash = '#/island3'; return; }
    const scr = IR.newScreen(); const S = IR.S();
    let mistakes = 0; let prog = 0; const totalSteps = LESSONS.length + 1;
    const fill = h('i'); const bar = h('div', { class: 'pbar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100 }, fill,
      ...LESSONS.map((_, k) => h('em', { style: `left:${(k + 1) / totalSteps * 100}%` })));
    const instrText = h('span', { class: 'itext' }); const instrBox = h('div', { class: 'instr' });
    const stage = h('div', { class: 'stage' });
    const starTop = h('div', { class: 'pill star' }, icon('star'), h('b', null, IR.totalStars()));
    const x = h('button', { class: 'xbtn', type: 'button', 'aria-label': 'Back to the trail', onclick: () => { location.hash = '#/island3'; } }, icon('close'));
    function setBar() { const v = Math.round(((idx + prog) / totalSteps) * 100); fill.style.width = v + '%'; bar.setAttribute('aria-valuenow', v); }
    const ctx = {
      scr, stage, miss() { mistakes++; },
      progress(f) { prog = Math.max(0, Math.min(1, f)); setBar(); },
      setInstr(text, pid) {
        instrBox.innerHTML = ''; if (!text) { instrBox.style.display = 'none'; return; } instrBox.style.display = '';
        instrBox.append(IR.speakerBtn(() => Snd.play(A.prompt(pid.replace(/^p_/, 'p_'))), 'Hear the directions'), h('span', { class: 'itext' }, text));
      },
      finish() { complete(); },
      /* Back: a lesson registers setBack(fn) (fn returns true if it stepped back inside the lesson). Otherwise Back goes to the previous lesson, or the trail from the first one. */
      setBack(fn) { backHandler = fn; },
      goBack() { Snd.stop(); if (backHandler && backHandler()) return; location.hash = idx > 0 ? '#/lesson/' + idx : '#/island3'; },
      /* Next: a lesson may register setNext(fn) (fn returns true if it stepped forward inside the lesson). Otherwise Next SKIPS AHEAD to the next mini lesson (or Zip's Check) and never marks this one complete. */
      setNext(fn) { nextHandler = fn; },
      goNext() { Snd.stop(); if (nextHandler && nextHandler()) return; location.hash = idx === LESSONS.length - 1 ? '#/check' : '#/lesson/' + (idx + 2); },
      setNextLabel(txt) { nextLabel.firstChild.textContent = txt; },
      showNav(on) { nav.style.display = on === false ? 'none' : ''; }
    };
    let backHandler = null; let nextHandler = null;
    const backBtn0 = h('button', { class: 'btn big back', type: 'button', 'aria-label': idx > 0 ? 'Back to the previous lesson' : 'Back to the trail', onclick: () => ctx.goBack() }, icon('back'), 'Back');
    const nextBtn0 = h('button', { class: 'btn big next', type: 'button', 'aria-label': idx === LESSONS.length - 1 ? 'Next: Zip\u2019s Check' : 'Next lesson', onclick: () => ctx.goNext() }, 'Next', icon('next'));
    const nextLabel = nextBtn0; const nav = h('div', { class: 'lesson-nav' }, backBtn0, nextBtn0);
    function complete() {
      const stars = (L.id === 'listen' || L.id === 'intro') ? 3 : mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1;
      const prev = S.lessons[L.id] || {};
      S.lessons[L.id] = { done: true, stars: Math.max(prev.stars || 0, stars), tries: (prev.tries || 0) + 1 };
      IR.recordActivity(L.id, stars);
      IR.touchStreak(); IR.save();
      starTop.lastChild.textContent = IR.totalStars();
      const last = idx === LESSONS.length - 1;
      const nextBtn = h('button', { class: 'btn big primary', type: 'button', onclick: () => { location.hash = last ? '#/check' : '#/lesson/' + (idx + 2); } }, last ? 'On to Zip\u2019s Check' : 'Next lesson', icon('next'));
      const backBtn = h('button', { class: 'btn big back', type: 'button', onclick: () => { location.hash = '#/island3'; } }, icon('back'), 'Back to the trail');
      ctx.progress(1);
      const ov = h('div', { class: 'complete' }, h('div', { class: 'cbox' },
        IR.celebration(false),
        h('h1', null, 'Great job!'), h('p', { class: 'lead' }, L.title),
        h('div', { class: 'bigstars', 'aria-label': stars + ' stars' }, ...[1, 2, 3].map((k) => icon(k <= stars ? 'star' : 'starOutline', (k <= stars ? 'on' : 'off') + ' k' + k))),
        h('div', { class: 'row' }, backBtn, nextBtn)));
      app.append(ov); Snd.play(A.sfx.done);
    }
    app.append(h('div', { class: 'screen lessonscreen', style: '--c:' + L.color }, h('header', { class: 'lesson-top' }, x, bar, starTop, unitButton(L.id)), instrBox, stage, nav));
    setBar(); L.run(ctx);
  }

  function checkScreen() {
    const scr = IR.newScreen(); const stage = h('div', { class: 'stage' });
    const fill = h('i'); const bar = h('div', { class: 'pbar' }, fill); const instrBox = h('div', { class: 'instr' });
    const x = h('button', { class: 'xbtn', type: 'button', 'aria-label': 'Back to the trail', onclick: () => { location.hash = '#/island3'; } }, icon('close'));
    const ctx = { scr, stage, miss() {}, progress(f) { fill.style.width = Math.round(((LESSONS.length + f) / (LESSONS.length + 1)) * 100) + '%'; }, setInstr(text, pid) { instrBox.innerHTML = ''; instrBox.style.display = text ? '' : 'none'; if (text) instrBox.append(IR.speakerBtn(() => Snd.play(A.prompt(pid)), 'Hear'), h('span', { class: 'itext' }, text)); }, finish() {} };
    let backHandler = null;
    ctx.setBack = (fn) => { backHandler = fn; };
    ctx.goBack = () => { Snd.stop(); if (backHandler && backHandler()) return; location.hash = '#/island3'; };
    let nextHandler = null; ctx.setNext = (fn) => { nextHandler = fn; };
    ctx.goNext = () => { Snd.stop(); if (nextHandler && nextHandler()) return; location.hash = '#/island3'; };
    const nav = h('div', { class: 'lesson-nav' }, h('button', { class: 'btn big back', type: 'button', 'aria-label': 'Back', onclick: () => ctx.goBack() }, icon('back'), 'Back'),
      h('button', { class: 'btn big next', type: 'button', 'aria-label': 'Next question', onclick: () => ctx.goNext() }, 'Next', icon('next')));
    app.append(h('div', { class: 'screen lessonscreen checkscreen', style: '--c:#2b2540' }, h('header', { class: 'lesson-top' }, x, bar, h('div', { class: 'pill star' }, icon('star'), h('b', null, IR.totalStars())), unitButton('check')), instrBox, stage, nav));
    ctx.progress(0); IR.runCheck(ctx);
  }

  IR.ui = { chips, gearButton, toast, modalRoot, app };
  /* ---------- router ---------- */
  function route() {
    const hash = location.hash || '#/island3'; modalRoot.innerHTML = '';
    app.innerHTML = ''; window.scrollTo(0, 0);
    let m;
    if ((m = /^#\/lesson\/(\d+)/.exec(hash))) lessonScreen(parseInt(m[1], 10) - 1);
    else if (hash.startsWith('#/chest1')) IR.chest.render(hash, app);
    else if (hash.startsWith('#/island3')) trailScreen();
    else if (hash.startsWith('#/check')) checkScreen();
    else if (hash.startsWith('#/result')) { IR.newScreen(); app.append(h('div', { class: 'screen resultscreen' })); IR.renderResult($('.resultscreen')); $('.resultscreen').prepend(h('div', { class: 'unitbar' }, unitButton('check'))); }
    else homeScreen();
  }
  window.addEventListener('hashchange', route);
  IR.applySettings();
  route();
  window.addEventListener('error', (e) => { window.__irErrors = (window.__irErrors || []).concat(String(e.message)); });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();

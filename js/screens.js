/* Screens + router: Home sky map, Island 3 trail, lesson shell, grown-up corner, cartoon. */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $, $$, sleep, icon, Snd, A, say } = IR;
  const app = $('#app'); const modalRoot = $('#modal-root');
  const LESSONS = IR.LESSONS;
  const ISLANDS = [
    [0, 'Sunrise Landing', 'Starter (optional)'], [1, 'Tide Pool Isle', 'Sounds + blends'], [2, 'Turtle Cove', 'FLOSS + digraphs'],
    [3, 'Sanshin Isle', 'ng, nk + Review 1'], [4, 'Lantern Grove', 'Silent e'], [5, 'Fishing Boat Bay', 'Endings, -tch, -dge'],
    [6, 'Mangrove Maze', 'y, -le + Review 2'], [7, 'Shisa Gate', 'r-controlled vowels'], [8, 'Kite Cliff', 'Vowel teams'],
    [9, 'Blue Cave', 'Other vowels + Review 3'], [10, 'Treasure Summit', 'Prefixes, suffixes']
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

  /* ---------- HOME: sky map ---------- */
  function homeScreen() {
    const S = IR.S(); const scr = IR.newScreen();
    const head = h('header', { class: 'home-head' }, h('div', { class: 'logo' }, h('span', { class: 'logo-a' }, 'Island'), ' Readers'), chips(), gearButton());
    const map = h('div', { class: 'skymap', id: 'skymap' });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'bridges'); svg.setAttribute('aria-hidden', 'true');
    map.append(svg);
    const STEP = 250, TOPPAD = 160;
    const total = ISLANDS.length;
    map.style.height = (total * STEP + TOPPAD + 120) + 'px';
    const pos = {};
    ISLANDS.forEach(([n, name, sub]) => {
      const y = (total - 1 - n) * STEP + TOPPAD; const xp = n % 2 === 0 ? 28 : 72; pos[n] = { y, xp };
      const unlocked = n === 3;
      const art = n === 3 ? h('img', { class: 'island3img', src: 'img/island3.webp', alt: '' }) : h('div', { class: 'islandart', html: IR.islandSVG(n) });
      const btn = h('button', { class: 'island' + (unlocked ? ' open' : ' locked'), type: 'button', style: `top:${y}px;left:${xp}%`, 'data-n': n,
        'aria-label': 'Island ' + n + ', ' + name + (unlocked ? '. Open.' : '. Coming soon.') },
        art,
        unlocked ? h('img', { class: 'zipmini', src: 'img/zip.webp', alt: '' }) : h('span', { class: 'lockbadge' }, icon('lock')),
        h('span', { class: 'ilabel' }, h('b', null, 'Island ' + n), h('span', null, name), h('small', null, unlocked ? sub : 'Coming soon')));
      btn.addEventListener('click', () => {
        if (unlocked) location.hash = '#/island3';
        else { toast('Zip says: Island ' + n + ' is coming soon! Finish Island 3 first.'); Snd.stop(); }
      });
      if (unlocked) btn.append(h('span', { class: 'here' }, 'Zip is here! Tap to play'));
      map.append(btn);
    });
    function drawBridges() {
      const w = map.clientWidth; svg.setAttribute('width', w); svg.setAttribute('height', map.clientHeight);
      let d = '';
      for (let n = 0; n < total - 1; n++) {
        const a = pos[n], b = pos[n + 1]; const x1 = a.xp / 100 * w, y1 = a.y + 40, x2 = b.xp / 100 * w, y2 = b.y + 40;
        const lit = n === 3 && S.badge; const my = (y1 + y2) / 2;
        d += `<path d="M${x1} ${y1} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2}" class="bridge ${lit ? 'lit' : ''}" fill="none"/>`;
      }
      svg.innerHTML = d;
    }
    app.append(h('div', { class: 'screen home' }, head, map));
    drawBridges(); window.addEventListener('resize', drawBridges, { once: false });
    // open scrolled to Island 3
    requestAnimationFrame(() => {
      const sc = $('.home'); const y = pos[3].y - 120;
      sc.scrollTop = Math.max(0, y);
    });
    if (S.badge) map.append(h('div', { class: 'lit-note', style: `top:${pos[3].y - 56}px;left:72%` }, 'The bridge to Island 4 is lit!'));
    if (S.sticker) $('.island[data-n="3"]').append(h('span', { class: 'sticker', 'aria-label': 'ng sticker earned' }, 'ng'));
    if (S.badge) $('.island[data-n="3"]').append(h('span', { class: 'islandbadge', html: IR.ICON.badge }));
  }

  /* ---------- Island 3 trail ---------- */
  function lessonStars(id) { const l = IR.S().lessons[id]; return l ? l.stars || 0 : 0; }
  function allDone() { return LESSONS.every((l) => IR.S().lessons[l.id] && IR.S().lessons[l.id].done); }
  function nextLessonIdx() { const i = LESSONS.findIndex((l) => !(IR.S().lessons[l.id] && IR.S().lessons[l.id].done)); return i; }
  function trailScreen() {
    const S = IR.S(); IR.newScreen();
    const done = LESSONS.filter((l) => S.lessons[l.id] && S.lessons[l.id].done).length;
    const back = h('button', { class: 'back', type: 'button', onclick: () => { location.hash = '#/home'; } }, icon('back'), 'Sky map');
    const banner = h('div', { class: 'banner' }, h('img', { src: 'img/island3_banner.jpg', alt: 'Sanshin Isle, a floating island with a red-tiled house' }),
      h('div', { class: 'banner-t' }, h('b', null, 'Island 3 \u00b7 Sanshin Isle'), h('span', null, 'ng, nk and Review 1')));
    const ni = nextLessonIdx();
    const startLabel = done === 0 ? 'Start' : (done >= LESSONS.length ? 'Play again' : 'Continue');
    const startBtn = h('button', { class: 'btn big primary', type: 'button', onclick: () => { location.hash = '#/lesson/' + ((ni < 0 ? 0 : ni) + 1); } }, startLabel, icon('next'));
    const stop1 = h('div', { class: 'stop open' },
      h('div', { class: 'stopn' }, 'Stop 1'), h('div', { class: 'stopname' }, 'ng'), h('div', { class: 'stopsub' }, 'ang \u00b7 ing \u00b7 ong \u00b7 ung'),
      h('div', { class: 'stopprog' }, done + ' of ' + LESSONS.length + ' mini lessons'),
      S.sticker ? h('div', { class: 'sticker big', 'aria-label': 'ng sticker' }, 'ng') : h('div', { class: 'stickerslot' }, 'sticker'),
      startBtn);
    const lockedStop = (n, name, sub) => h('div', { class: 'stop locked' }, h('div', { class: 'stopn' }, 'Stop ' + n), h('div', { class: 'stopname' }, name), h('div', { class: 'stopsub' }, sub), icon('lock', 'lk'), h('div', { class: 'soon' }, 'Coming soon'));
    const trail = h('div', { class: 'trail' }, stop1, h('div', { class: 'conn' }), lockedStop(2, 'nk', 'ank \u00b7 ink \u00b7 onk \u00b7 unk'), h('div', { class: 'conn' }), lockedStop(3, 'Review 1', 'mixed practice'),
      h('div', { class: 'conn' }),
      h('div', { class: 'stop end' + (S.badge ? ' got' : '') }, h('div', { class: 'badgeart sm' + (S.badge ? '' : ' dim'), html: IR.ICON.badge }), h('div', { class: 'stopname sm' }, 'Island badge'),
        h('div', { class: 'stopsub' }, S.badge ? 'Earned! Bridge to Island 4 is lit.' : 'Earn it with a 9 or 10 on the check')));
    const open = S.settings.openAll;
    const list = h('ol', { class: 'lessonlist' });
    LESSONS.forEach((l, i) => {
      const st = lessonStars(l.id); const isDone = S.lessons[l.id] && S.lessons[l.id].done;
      const li = h('li', null, h('button', { class: 'lesson-item' + (isDone ? ' done' : '') + (i === ni ? ' next' : ''), type: 'button', style: '--c:' + l.color, onclick: () => { location.hash = '#/lesson/' + (i + 1); } },
        h('span', { class: 'num' }, i + 1), h('span', { class: 'ltxt' }, h('b', null, l.title), h('small', null, l.blurb)),
        h('span', { class: 'lstars', 'aria-label': st + ' of 3 stars' }, ...[1, 2, 3].map((k) => icon(k <= st ? 'star' : 'starOutline', k <= st ? 'on' : 'off')))));
      list.append(li);
    });
    const ready = allDone() || open;
    const chk = S.check.best;
    const checkBtn = h('button', { class: 'lesson-item check' + (ready ? '' : ' disabled'), type: 'button', style: '--c:#2b2540', onclick: () => { if (ready) location.hash = '#/check'; else toast('Finish the 8 mini lessons first. You can do it!'); } },
      h('span', { class: 'num' }, '\u2605'), h('span', { class: 'ltxt' }, h('b', null, 'Zip\u2019s Check'), h('small', null, chk == null ? '10 questions \u00b7 ' + (ready ? 'ready!' : 'opens after the lessons') : 'Best: ' + chk + ' of 10')));
    const cartoon = h('button', { class: 'btn', type: 'button', onclick: () => IR.openCartoon() }, icon('play'), 'Watch the cartoon (optional)');
    app.append(h('div', { class: 'screen trailscreen' },
      h('header', { class: 'top2' }, back, chips(), gearButton()), banner, trail,
      h('section', { class: 'inside' }, h('h2', null, 'Inside the ng stop'), h('p', { class: 'small' }, 'Short mini lessons. Each one takes 2 to 4 minutes.'), list, h('ol', { class: 'lessonlist single' }, h('li', null, checkBtn)), h('div', { class: 'row center' }, cartoon))));
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
      showNav(on) { nav.style.display = on === false ? 'none' : ''; }
    };
    let backHandler = null;
    const backBtn0 = h('button', { class: 'btn big back', type: 'button', 'aria-label': idx > 0 ? 'Back to the previous lesson' : 'Back to the trail', onclick: () => ctx.goBack() }, icon('back'), 'Back');
    const nav = h('div', { class: 'lesson-nav' }, backBtn0);
    function complete() {
      const stars = (L.id === 'listen' || L.id === 'intro') ? 3 : mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1;
      const prev = S.lessons[L.id] || {};
      S.lessons[L.id] = { done: true, stars: Math.max(prev.stars || 0, stars), tries: (prev.tries || 0) + 1 };
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
    app.append(h('div', { class: 'screen lessonscreen', style: '--c:' + L.color }, h('header', { class: 'lesson-top' }, x, bar, starTop), instrBox, stage, nav));
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
    const nav = h('div', { class: 'lesson-nav' }, h('button', { class: 'btn big back', type: 'button', 'aria-label': 'Back', onclick: () => ctx.goBack() }, icon('back'), 'Back'));
    app.append(h('div', { class: 'screen lessonscreen checkscreen', style: '--c:#2b2540' }, h('header', { class: 'lesson-top' }, x, bar, h('div', { class: 'pill star' }, icon('star'), h('b', null, IR.totalStars()))), instrBox, stage, nav));
    ctx.progress(0); IR.runCheck(ctx);
  }

  /* ---------- router ---------- */
  function route() {
    const hash = location.hash || '#/home'; modalRoot.innerHTML = '';
    app.innerHTML = ''; window.scrollTo(0, 0);
    let m;
    if ((m = /^#\/lesson\/(\d+)/.exec(hash))) lessonScreen(parseInt(m[1], 10) - 1);
    else if (hash.startsWith('#/island3')) trailScreen();
    else if (hash.startsWith('#/check')) checkScreen();
    else if (hash.startsWith('#/result')) { IR.newScreen(); app.append(h('div', { class: 'screen resultscreen' })); IR.renderResult($('.resultscreen')); }
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

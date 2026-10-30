/* Screens + router: Home sky map, Island 3 trail, lesson shell, grown-up corner, cartoon. */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $, $$, sleep, icon, Snd, A, say } = IR;
  const app = $('#app'); const modalRoot = $('#modal-root');
  const LESSONS = IR.LESSONS;
  /* The whole world in order: Ground Level, Islands 1-10, two Review Reefs, four treasure boxes (after Islands 2, 4, 6, 8). Only the ng unit (Island 3) and treasure chest 1 are playable. */
  const WORLD = [
    { id: 'ground', kind: 'ground', title: 'Ground Level', sub: 'Where the journey starts' },
    { id: 'i1', kind: 'island', n: 1, title: 'Blends and Floss' }, { id: 'i2', kind: 'island', n: 2, title: 'Digraphs' },
    { id: 'chest1', kind: 'chest', n: 1, title: 'Treasure chest 1', sub: 'Level 1 \u00b7 Word games', href: '#/chest1' },
    { id: 'i3', kind: 'island', n: 3, title: 'Glued Sounds', sub: 'ng, nk', href: '#/island3' },
    { id: 'i4', kind: 'island', n: 4, title: 'Silent e and Word Endings' },
    { id: 'chest2', kind: 'chest', n: 2, title: 'Treasure chest 2', sub: 'Level 2 \u00b7 Word games', href: '#/chest2' },
    { id: 'i5', kind: 'island', n: 5, title: 'Longer Words' }, { id: 'reef1', kind: 'reef', title: 'Review Reef', sub: 'After Island 5' },
    { id: 'i6', kind: 'island', n: 6, title: 'Bossy r' },
    { id: 'chest3', kind: 'chest', n: 3, title: 'Treasure chest 3', sub: 'Level 3' },
    { id: 'i7', kind: 'island', n: 7, title: 'Vowel Teams' }, { id: 'i8', kind: 'island', n: 8, title: 'Other Vowels' },
    { id: 'chest4', kind: 'chest', n: 4, title: 'Treasure chest 4', sub: 'Level 4' },
    { id: 'i9', kind: 'island', n: 9, title: 'Word Parts' }, { id: 'i10', kind: 'island', n: 10, title: 'Spelling Patterns' },
    { id: 'reef2', kind: 'reef', title: 'Review Reef', sub: 'After Island 10' }
  ];

  /* ---------- shared bits ---------- */
  function toast(msg) {
    $$('.toast').forEach((t) => t.remove());
    const t = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(t); setTimeout(() => t.remove(), 3200);
  }
  /* The star count and streak chips were removed from every top bar. */
  function chips() { return null; }
  /* Standard Home button (house icon + "Home") on the top bar of every unit, lesson, activity and game screen: back to the world map. */
  function homeButton() {
    return h('button', { class: 'back homebtn', type: 'button', 'aria-label': 'Home: the world map', onclick: () => { Snd.stop(); location.hash = '#/home'; } }, icon('home'), h('span', null, 'Home'));
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
  /* The cartoon is configured in data.js (D.cartoon) so the file can be swapped later: change src / captions (or set captions to null) / poster / title / note, rebuild. */
  const CARTOON = () => Object.assign({ src: 'video/ng_cartoon_small.mp4', captions: 'video/ng_cartoon_captions.json', poster: 'img/island3_banner.jpg', title: 'Zip and Frill: The Nose Hum', note: 'Optional cartoon, 2 min 27 s. Captions highlight each word as it is spoken.' }, D.cartoon || {});
  function loadCaptions() {
    if (ccCache) return Promise.resolve(ccCache);
    if (!CARTOON().captions) return Promise.resolve([]);
    return fetch(CARTOON().captions).then((r) => r.json()).then((d) => { ccCache = d; return d; }).catch(() => []);
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
    const C = CARTOON();
    const v = h('video', { controls: true, playsinline: true, preload: 'metadata', poster: C.poster, controlslist: 'nofullscreen', 'aria-label': C.title + ' cartoon' }, h('source', { src: C.src, type: /\.webm$/i.test(C.src) ? 'video/webm' : 'video/mp4' }));
    const wrap = h('div', { class: 'vwrap' }, v);
    const bar = h('div', { class: 'row center cc-row' });
    openModal(h('div', null, h('h2', null, C.title), wrap, bar, h('p', { class: 'small' }, C.note)), 'video');
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
      IR.chest && IR.chest.checklist ? IR.chest.checklist() : null,
      h('p', { class: 'small' }, 'The app cannot listen to a child read. Reading aloud stays with a grown-up. Check the isolated ng sound by ear before sharing.')));
  }


  /* ---------- ISLAND PICKER (panel over the map): the island's units + Island Review, all from D.islands (data.js) ----------
     Rules: unit 1 is open; the next unit opens when the previous unit has all its stars; Island Review opens when every unit is done;
     the next island opens when Island Review is done. A unit with no content yet (ready:false) shows "Coming soon" instead. */
  function islandItems(id) {
    const cfg = (D.islands || {})[id]; if (!cfg) return null;
    const list = cfg.units.map((u) => Object.assign({ kind: 'unit' }, u)).concat(cfg.review ? [Object.assign({ kind: 'review' }, cfg.review)] : []);
    let prevDone = true; let prev = null;
    list.forEach((u, i) => {
      if (u.id === 'ng') { const secs = unitSections(); u.total = secs.length; u.done = secs.filter((r) => r.done).length; u.min = secs.reduce((a, r) => a + r.min, 0); }
      else { const pr = IR.nkProgress && IR.nkProgress(u.id); if (pr) { u.total = pr.total; u.done = pr.done; u.min = pr.min; } else { u.total = u.stars || 1; u.done = 0; u.min = u.minutes || 0; } }       /* progress for the other units is wired up when their content exists */
      u.complete = u.ready && u.done >= u.total;
      const before = list.slice(0, i); const need = u.kind === 'review' ? before : (prev ? [prev] : []);
      const needDone = need.every((x) => x.complete);
      u.state = !needDone && !IR.S().settings.openAll ? 'locked' : !u.ready ? 'soon' : 'open';
      u.lockMsg = !needDone ? (u.kind === 'review' ? 'Unlocks when ' + before.map((x) => x.name).join(' and ') + ' are done' : 'Unlocks when ' + prev.name + ' has all ' + prev.total + ' stars') : u.state === 'soon' ? 'Coming soon' : '';
      prev = u;
    });
    return { cfg, list, done: list.every((x) => x.complete) };
  }
  const islandDone = (id) => { const r = islandItems(id); return !!r && r.done; };
  IR.islandDone = islandDone;
  function openIsland(id) {
    const w = WORLD.find((x) => x.id === id); const info = islandItems(id); if (!info) return;
    Snd.stop();
    const imgs = (u) => h('div', { class: 'uimg' }, ...u.img.map((n) => h('img', { src: 'img/' + n + '.webp', alt: '' })), u.state === 'open' ? null : h('span', { class: 'lk' }, icon('lock')));
    const stars = (u) => h('div', { class: 'dots', 'aria-hidden': 'true' }, ...Array.from({ length: u.total }, (_, k) => h('span', { class: 'sstar' + (k < u.done ? ' on' : '') }, icon('star'))));
    const cards = info.list.map((u) => {
      const title = u.kind === 'review' ? 'Review' : u.name;
      const kind = u.kind === 'review' ? 'Unit ' + w.n + ' Review' : 'Lesson ' + w.n + '.' + (info.list.indexOf(u) + 1);   /* naming standard: Unit 3 = Island 3; ng = Lesson 3.1, nk = Lesson 3.2 */
      const body = h('div', { class: 'ubody' }, h('div', { class: 'uk' }, kind), h('h2', null, title),
        h('div', { class: 'umin' }, u.min ? 'About ' + u.min + ' min' : ''), u.desc ? h('div', { class: 'rvd' }, u.desc) : null, stars(u),
        u.state === 'open' ? h('div', { class: 'uprog' }, u.done + ' of ' + u.total + ' stars') : h('div', { class: 'uprog lockmsg' }, icon('lock'), u.lockMsg));
      const card = h('div', { class: 'ucard ' + (u.state === 'open' ? 'open' : 'locked') + (u.kind === 'review' ? ' rv' : ''), 'data-unit': u.id, 'data-state': u.state, role: 'group',
        'aria-label': (u.kind === 'review' ? 'Unit ' + w.n + ' Review' : 'Lesson ' + w.n + '.' + (info.list.indexOf(u) + 1) + ': ' + u.name) + '. ' + (u.state === 'open' ? u.done + ' of ' + u.total + ' stars. Open.' : 'Locked. ' + u.lockMsg + '.') }, imgs(u), body);
      if (u.state === 'open') {
        const b = h('button', { class: 'obtn', type: 'button', onclick: () => { modalRoot.innerHTML = ''; location.hash = u.href; } }, 'Open unit'); body.append(b);
        card.addEventListener('click', (e) => { if (e.target.closest('button')) return; b.click(); });
      } else { card.tabIndex = 0; card.addEventListener('click', () => toast(u.lockMsg + '.')); }
      return card;
    });
    const nextIs = WORLD[WORLD.indexOf(w) + 1];
    const note = nextIs && nextIs.kind === 'island' ? h('div', { class: 'pnote' }, icon(info.done ? 'star' : 'lock'), info.done ? 'Island ' + nextIs.n + ' is unlocked!' : 'Island ' + nextIs.n + ' unlocks when Island Review is done') : null;
    const close = () => { modalRoot.innerHTML = ''; document.removeEventListener('keydown', onKey); const b = $('.island[data-id="' + id + '"]'); if (b) b.focus({ preventScroll: true }); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const panel = h('div', { class: 'panel picker', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Island ' + w.n + ': ' + w.title + '. Pick a unit.', 'data-island': id },
      h('div', { class: 'ph' }, h('button', { class: 'home', type: 'button', onclick: close }, icon('home'), 'Home'),
        h('h1', null, 'Island ' + w.n + ': ' + w.title, h('small', null, 'Pick a unit')),
        h('button', { class: 'x', type: 'button', 'aria-label': 'Close', onclick: close }, icon('close'))),
      h('div', { class: 'pcards' }, ...cards), note);
    modalRoot.innerHTML = '';
    const scrim = h('div', { class: 'scrim picker-scrim' }, panel); scrim.addEventListener('click', (e) => { if (e.target === scrim) close(); });
    modalRoot.append(scrim);
    const first = $('.ucard.open .obtn', panel); (first || $('.x', panel)).focus({ preventScroll: true });
  }
  IR.openIsland = openIsland;

  /* ---------- HOME: the world map. Small part at a time: the current island is big, everything else is a folded, locked row. ---------- */
  function homeScreen() {
    const S = IR.S(); IR.newScreen();
    const head = h('header', { class: 'home-head' }, h('div', { class: 'logo' }, h('span', { class: 'logo-a' }, 'Island'), ' Readers'), IR.ui.gearButton());
    const doneN = unitSections().filter((r) => r.done).length; const complete = islandDone('i3');   /* Island 3 = ng + nk + Island Review */
    const map = h('div', { class: 'skymap', id: 'skymap' });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'bridges'); svg.setAttribute('aria-hidden', 'true');
    map.append(svg);
    /* The path climbs from Ground Level (bottom) to the top. Islands and reefs zigzag left and right; treasure chests sit in the middle of the path between islands. */
    const HT = { ground: 300, island: 300, reef: 250, chest: 235 }; const ANCH = { ground: 80, island: 80, reef: 70, chest: 40 };
    const TOPPAD = 130; let cum = TOPPAD; const pos = {};
    let zig = 0; const xs = {};
    WORLD.forEach((w) => { if (w.kind === 'chest') xs[w.id] = 50; else { xs[w.id] = zig % 2 === 0 ? 30 : 70; zig++; } });
    for (let i = WORLD.length - 1; i >= 0; i--) { const w = WORLD[i]; pos[w.id] = { y: cum, xp: xs[w.id], a: ANCH[w.kind] }; cum += HT[w.kind] + (w.id === 'i3' ? 150 : w.id === 'chest1' ? 80 : 0); }
    map.style.height = (cum + 110) + 'px';
    WORLD.forEach((w) => {
      const playable = !!w.href; const lit = w.id === 'i4' && islandDone('i3'); const p = pos[w.id]; const isl = !!(D.islands || {})[w.id];
      const label = (w.kind === 'island' ? 'Island ' + w.n + ': ' : '') + w.title;
      const art = w.id === 'i3' ? h('img', { class: 'island3img', src: 'img/island3.webp', alt: '' })
        : h('div', { class: 'islandart', html: w.kind === 'chest' ? IR.chestSVG(w.n) : w.kind === 'reef' ? IR.reefSVG() : IR.islandSVG(w.kind === 'ground' ? 0 : w.n) });
      const name = w.kind === 'island' ? 'Island ' + w.n : w.title;
      const sub = w.kind === 'island' ? (playable ? w.title + ' \u00b7 ' + w.sub : w.title) : w.sub;
      const note = playable ? '' : lit ? 'Unlocked' : '';     /* locked islands show the lock only, no extra text */
      const btn = h('button', { class: 'island ' + w.kind + 'node' + (playable ? ' open' : ' locked') + (lit ? ' lit' : '') + (w.id === 'i3' && !complete ? ' current' : ''), type: 'button', 'data-id': w.id, 'data-kind': w.kind, 'data-n': w.n || '',
        style: `top:${p.y}px;left:${p.xp}%`,
        'aria-label': label + (w.id === 'i3' ? (complete ? '. Finished, all stars earned. Replay: opens the unit picker.' : '. You are here. Opens the unit picker.') : playable ? '. Open.' : lit ? '. Unlocked, coming soon in the full app.' : '. Locked. Coming soon.') },
        art,
        playable ? (w.id === 'i3' && !complete ? h('img', { class: 'zipmini', src: 'img/zip.webp', alt: '' }) : null) : h('span', { class: 'lockbadge' }, icon('lock')),
        h('span', { class: 'ilabel' }, h('b', null, name), h('span', null, w.kind === 'island' ? w.title : w.sub || ''), h('small', null, w.kind === 'island' ? (playable ? w.sub : note) : (note || (w.kind === 'chest' && playable ? 'Word games' : '')))));
      btn.addEventListener('click', () => {
        if (isl) openIsland(w.id); else if (playable) location.hash = w.href;
        else { Snd.stop(); toast(lit ? 'Island 4 is lit! It is coming soon in the full app.' : (w.kind === 'chest' ? 'This treasure chest is coming soon!' : label + ' is coming soon!') + (w.kind === 'island' ? ' Finish Island 3 first.' : '')); }
      });
      if (w.id === 'i3' && !complete) btn.append(h('span', { class: 'starttag' }, 'You are here'));     /* only the current island gets a tag; Zip stands on it */
      if (w.id === 'i3' && complete) btn.append(h('span', { class: 'replaytag' }, 'Replay'));
      if (w.id === 'i3' && complete) btn.append(h('span', { class: 'islandstars', 'aria-hidden': 'true' }, icon('star'), icon('star'), icon('star')));   /* completed island: stars */
      map.append(btn);
    });
    const btns = $$('.island', map);
    function drawBridges() {
      const wdt = map.clientWidth; svg.setAttribute('width', wdt); svg.setAttribute('height', map.clientHeight);
      let d = '';
      for (let i = WORLD.length - 1; i > 0; i--) {
        const A = pos[WORLD[i - 1].id], B = pos[WORLD[i].id]; const x1 = A.xp / 100 * wdt, y1 = A.y + A.a, x2 = B.xp / 100 * wdt, y2 = B.y + B.a;
        const lit = WORLD[i - 1].id === 'i3' && islandDone('i3'); const my = (y1 + y2) / 2;
        d += `<path d="M${x1} ${y1} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2}" class="bridge ${lit ? 'lit' : ''}" fill="none"/>`;
      }
      svg.innerHTML = d;
    }
    app.append(h('div', { class: 'screen home worldscreen' }, head, map));
    drawBridges(); window.addEventListener('resize', drawBridges);
    if (islandDone('i3')) map.append(h('div', { class: 'lit-note', style: `top:${pos.i3.y - 40}px;left:${pos.i3.xp}%` }, 'The way to Island 4 is lit!'));
    if (S.sticker) { const t = $('.island[data-id="i3"]', map); if (t) t.append(h('span', { class: 'sticker', 'aria-label': 'ng sticker earned' }, 'ng')); }
    if (S.nkSticker) { const t = $('.island[data-id="i3"]', map); if (t) t.append(h('span', { class: 'sticker nksticker', 'aria-label': 'nk sticker earned' }, 'nk')); }
    // open scrolled so Island 3 (where Zip is) sits near the middle of the screen
    requestAnimationFrame(() => { const sc = $('.home'); if (sc) sc.scrollTop = Math.max(0, pos.i3.y - sc.clientHeight / 2 + sc.clientHeight * 0.3); });
  }


  /* ---------- "In this unit" progress sheet: quiet toggle on every unit screen, collapsed by default ---------- */
  /* The unit in its recommended order, in three groups: Lesson (Meet ng), Story (Story Time), Activities (numbered Activity 1, 2, 3 ...). */
  const GROUPS = [{ id: 'lesson', title: 'Lesson', sub: 'Learn it once', ids: ['intro'] }, { id: 'story', title: 'Story', sub: 'Listen and read along', ids: ['listen'] },
    { id: 'activities', title: 'Activities', sub: 'Play as often as you like', ids: ['hear', 'fish', 'build', 'trace', 'sentence', 'story', 'check'] }];
  const GICON = { lesson: 'book', story: 'speaker', activities: 'play' };
  function unitSections() {
    const items = LESSONS.map((L, i) => ({ id: L.id, title: L.title, blurb: L.blurb, href: '#/lesson/' + (i + 1), color: L.color }))
      .concat([{ id: 'check', title: 'Zip\u2019s Check', blurb: '10 quick questions with Zip', href: '#/check', color: '#2b2540' }]);
    items.forEach((r, i) => { r.num = i + 1; r.done = IR.isDone(r.id); r.stars = IR.activityStars(r.id); r.group = GROUPS.find((g) => g.ids.includes(r.id)).id; });
    items.filter((r) => r.group === 'activities').forEach((r, k) => { r.act = k + 1; r.label = 'Activity ' + (k + 1) + ': ' + r.title; });
    items.forEach((r) => { if (!r.label) r.label = r.title; r.min = (D.minutes || {})[r.id] || 3; });
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
          'aria-label': r.label + ', ' + (r.done ? 'done' : cur ? 'you are here' : 'to do'),
          onclick: () => { Snd.stop(); const same = cur; close(); if (!same) location.hash = r.href; } }, status, h('span', { class: 'ut' }, r.act ? h('span', { class: 'uact' }, 'Activity ' + r.act) : null, r.title)));
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
  /* ---------- Unit page (Option A): Lesson + Story boxes on the left, numbered Activities with minutes on the right, total time on top ---------- */
  function trailScreen() {
    const S = IR.S(); IR.newScreen();
    const secs = unitSections(); const nx = nextUp(); const doneN = secs.filter((r) => r.done).length; const total = secs.length; const complete = doneN === total;
    const totalMin = secs.reduce((a, r) => a + r.min, 0);
    const star = (on) => h('span', { class: 'sstar' + (on ? ' on' : ''), 'aria-hidden': 'true' }, icon(on ? 'star' : 'starOutline'));
    const aria = (r, extra) => r.label + '. ' + r.min + ' minutes. ' + extra + (r.done ? ' Done, star earned.' : nx && nx.id === r.id ? ' Next up.' : '');
    function bigBox(r) {
      const isNext = nx && nx.id === r.id; const lesson = r.group === 'lesson';
      const rev = r.done ? (lesson ? 'Review lesson' : 'Read again') : isNext ? 'Next' : '';
      return h('li', { class: 'bigli' }, h('button', { class: 'stopcard bigbox ' + (lesson ? 'lessonstop' : 'storystop') + (r.done ? ' done' : '') + (isNext ? ' nextup' : ''), type: 'button', 'data-id': r.id, 'data-group': r.group,
        'aria-label': aria(r, lesson ? 'Lesson.' : 'Story.'), 'aria-current': isNext ? 'step' : null, onclick: () => { Snd.stop(); location.hash = r.href; } },
        h('span', { class: 'bkind' }, lesson ? 'Lesson' : 'Story'),
        r.done ? h('span', { class: 'bstar' }, star(true)) : null,
        h('img', { class: 'bimg', src: lesson ? 'img/zip.webp' : 'img/frill.webp', alt: '' }),
        h('span', { class: 'stxt bbot' }, h('b', null, r.title), h('span', { class: 'smin' }, r.min + ' min'),
          h('span', { class: 'sside' }, h('span', { class: 'slabel ' + (r.done ? 'rev' : isNext ? 'tag' : 'none') }, rev)))));
    }
    function actRow(r) {
      const isNext = nx && nx.id === r.id;
      return h('li', null, h('button', { class: 'stopcard arow gamestop' + (r.done ? ' done' : '') + (isNext ? ' nextup' : ''), type: 'button', 'data-id': r.id, 'data-group': 'activities',
        'aria-label': aria(r, 'Activity ' + r.act + '.'), 'aria-current': isNext ? 'step' : null, onclick: () => { Snd.stop(); location.hash = r.href; } },
        h('span', { class: 'snum', 'aria-hidden': 'true' }, String(r.act)),
        h('span', { class: 'stxt' }, h('b', null, r.title)),
        h('span', { class: 'smin' }, r.min + ' min'),
        h('span', { class: 'sside' }, star(r.done), h('span', { class: 'slabel ' + (isNext ? 'tag' : 'none') }, isNext ? 'Next' : ''))));
    }
    const left = h('ul', { class: 'uA-left' }, ...secs.filter((r) => r.group !== 'activities').map(bigBox));
    const right = h('section', { class: 'uA-right' }, h('h2', { class: 'uA-h' }, 'Activities'), h('ol', { class: 'stoplist uA-acts' }, ...secs.filter((r) => r.group === 'activities').map(actRow)));
    const foot = h('footer', { class: 'uA-foot island4 ' + (complete ? 'open' : 'locked'), 'aria-live': 'polite' },
      h('span', { class: 'i4ico', 'aria-hidden': 'true' }, icon(complete ? 'star' : 'lock')),
      h('span', { class: 'i4txt' }, h('b', null, 'Island 4'), h('small', null, complete ? 'Unlocked! The bridge is lit.' : 'Finish all stars to unlock')),
      h('span', { class: 'i4count' }, doneN + ' of ' + total));
    app.append(h('div', { class: 'screen trailscreen unitpage unitA' },
      h('header', { class: 'uA-top' }, homeButton(), h('h1', { class: 'uA-title' }, h('small', null, 'Island 3 \u00b7 '), 'The ng sound'),
        h('button', { class: 'cartoonpill', type: 'button', 'aria-label': 'Welcome cartoon, optional. Opens a video.', onclick: () => IR.openCartoon() }, icon('play'), h('span', { class: 'cp-long' }, 'Welcome Cartoon (optional)'), h('span', { class: 'cp-short' }, 'Cartoon')),
        h('span', { class: 'uA-time', 'aria-label': 'About ' + totalMin + ' minutes in total' }, h('span', { class: 't-long' }, 'About ' + totalMin + ' min total'), h('span', { class: 't-short' }, totalMin + ' min')), gearButton()),
      h('main', { class: 'uA-main' }, left, right), foot));
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
    const starTop = homeButton();
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
    app.append(h('div', { class: 'screen lessonscreen checkscreen', style: '--c:#2b2540' }, h('header', { class: 'lesson-top' }, x, bar, homeButton(), unitButton('check')), instrBox, stage, nav));
    ctx.progress(0); IR.runCheck(ctx);
  }

  IR.ui = { chips, gearButton, homeButton, toast, modalRoot, app };
  /* ---------- router ---------- */
  function route() {
    const hash = location.hash || '#/home'; modalRoot.innerHTML = '';
    app.innerHTML = ''; window.scrollTo(0, 0);
    let m;
    if (IR.nkRoute && IR.nkRoute(hash, app)) { /* nk unit + Island Review (js/nk.js) */ }
    else if ((m = /^#\/lesson\/(\d+)/.exec(hash))) lessonScreen(parseInt(m[1], 10) - 1);
    else if (/^#\/chest[12]/.test(hash)) IR.chest.render(hash, app);
    else if (hash.startsWith('#/island3')) trailScreen();
    else if (hash.startsWith('#/check')) checkScreen();
    else if (hash.startsWith('#/result')) { IR.newScreen(); app.append(h('div', { class: 'screen resultscreen' })); IR.renderResult($('.resultscreen')); $('.resultscreen').prepend(h('div', { class: 'unitbar' }, homeButton(), unitButton('check'))); }
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

/* Level 1 wooden chest: a game menu with 3 short games on 30 Dolch pre-primer words. Replayable, never blocks progress, no timers, no scores to lose. */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $$, sleep, shuffle, icon, Snd, A } = IR;
  const WORDS = D.dolch;
  const GAMES = [
    { id: 'flip', title: 'Flip and Match', blurb: 'Turn two cards. Find the pair.', icon: 'play' },
    { id: 'catch', title: 'Catch the Word', blurb: 'Hear a word. Catch it as it floats by.', icon: 'play' },
    { id: 'find', title: 'Find the Word', blurb: 'Look at the word. Find it in the box.', icon: 'play' }
  ];
  const state = () => { const S = IR.S(); if (!S.chest1) S.chest1 = { plays: {}, read: {} }; return S.chest1; };
  const taught = (w) => D.heart.some((x) => x.w === w) && (!!IR.S().heart[w] || IR.isDone('listen'));     /* heart words already taught show a star */
  const rounds = (gameId, n) => { const st = state(); const k = st.plays[gameId] || 0; const out = []; for (let i = 0; i < n; i++) out.push(WORDS[(k * n + i * 7 + k) % WORDS.length]); return Array.from(new Set(out)).length === n ? out : WORDS.slice(0, n); };
  const starMark = (w) => taught(w) ? h('span', { class: 'hstar', 'aria-label': 'heart word you learned' }, icon('star')) : null;
  const wordCard = (w, cls) => { const b = h('button', { class: 'wcard ' + (cls || ''), type: 'button', 'data-w': w }, h('span', { class: 'wtext' }, w)); const st = starMark(w); if (st) b.append(st); return b; };

  /* optional grown-up check: read the words aloud, tick the ones that were read. Never required. */
  function adultCheck(words) {
    const st = state(); const root = IR.ui.modalRoot;
    const rows = words.map((w) => { const cb = h('input', { type: 'checkbox', id: 'rd_' + w }); cb.checked = !!st.read[w]; cb.addEventListener('change', () => { st.read[w] = cb.checked; IR.save(); });
      return h('label', { class: 'rdrow', for: 'rd_' + w }, cb, h('span', { class: 'rdw' }, w), h('button', { class: 'btn small', type: 'button', 'aria-label': 'Hear ' + w, onclick: (e) => { e.preventDefault(); IR.sayWord(w); } }, icon('speaker'))); });
    const x = h('button', { class: 'btn big primary', type: 'button', onclick: () => { Snd.stop(); el.remove(); } }, 'Done');
    const el = h('div', { class: 'usheet-scrim', onclick: (e) => { if (e.target === e.currentTarget) { Snd.stop(); el.remove(); } } },
      h('div', { class: 'usheet adult', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Read it aloud' },
        h('h2', null, 'Read it aloud'), h('p', { class: 'small' }, 'Optional, for a grown-up. Ask the child to read each word aloud. Tick the ones they read. Tap the speaker to hear a word.'), h('div', { class: 'rdlist' }, ...rows), x));
    root.append(el); const f = el.querySelector('input'); if (f) f.focus();
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { el.remove(); document.removeEventListener('keydown', esc); } });
  }

  /* shared screen frame: X (back to chest), title, Back/Next footer */
  function frame(app, { title, backHref, nextHref, backLabel, nextLabel, body, cls }) {
    const x = h('button', { class: 'xbtn', type: 'button', 'aria-label': 'Back to the chest', onclick: () => { location.hash = '#/chest1'; } }, icon('close'));
    const nav = h('div', { class: 'lesson-nav' },
      h('button', { class: 'btn big back', type: 'button', 'aria-label': backLabel || 'Back', onclick: () => { Snd.stop(); location.hash = backHref; } }, icon('back'), 'Back'),
      h('button', { class: 'btn big next', type: 'button', 'aria-label': nextLabel || 'Next', onclick: () => { Snd.stop(); location.hash = nextHref; } }, 'Next', icon('next')));
    app.append(h('div', { class: 'screen lessonscreen chestscreen ' + (cls || ''), style: '--c:#A9693B' },
      h('header', { class: 'lesson-top' }, x, h('div', { class: 'chest-title' }, h('span', { class: 'chestmini', html: IR.chestSVG(1) }), title), h('div', { class: 'pill star' }, icon('star'), h('b', null, IR.totalStars()))), h('div', { class: 'stage' }, body), nav));
  }
  function endCard(app, game, words, again) {       /* short, non-verbal praise: stars + a chime, no spoken words, never blocks anything */
    const idx = GAMES.findIndex((g) => g.id === game); const nxt = GAMES[idx + 1];
    const box = h('div', { class: 'complete chestdone' }, h('div', { class: 'cbox' }, IR.celebration(false),
      h('div', { class: 'bigstars', 'aria-hidden': 'true' }, ...[1, 2, 3].map((k) => icon('star', 'on k' + k))),
      h('div', { class: 'row' }, h('button', { class: 'btn big', type: 'button', onclick: () => { box.remove(); again(); } }, icon('replay'), 'Play again'),
        h('button', { class: 'btn big next primary', type: 'button', onclick: () => { location.hash = nxt ? '#/chest1/' + nxt.id : '#/chest1'; } }, nxt ? 'Next game' : 'Back to the chest', icon('next'))),
      h('button', { class: 'btn small', type: 'button', onclick: () => adultCheck(words) }, icon('speaker'), 'Read it aloud (optional)')));
    app.append(box); Snd.play(A.sfx.done);
  }

  /* ---- menu ---- */
  function menu(app) {
    const cards = GAMES.map((g, i) => h('li', null, h('button', { class: 'stopcard gamestop', type: 'button', 'data-game': g.id, onclick: () => { location.hash = '#/chest1/' + g.id; }, 'aria-label': (i + 1) + '. ' + g.title + '. ' + g.blurb },
      h('span', { class: 'snum', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'sico', 'aria-hidden': 'true' }, icon('play')),
      h('span', { class: 'stxt' }, h('b', null, g.title), h('small', null, g.blurb)), h('span', { class: 'sside' }, h('span', { class: 'slabel' }, 'Play')))));
    const chips = h('div', { class: 'wordchips', 'aria-label': 'The 30 words' }, ...WORDS.map((w) => { const b = wordCard(w, 'mini'); b.addEventListener('click', () => IR.sayWord(w)); return b; }));
    const x = h('button', { class: 'back', type: 'button', onclick: () => { location.hash = '#/home'; } }, icon('back'), 'World map');
    app.append(h('div', { class: 'screen trailscreen unitpage chestmenu' },
      h('header', { class: 'top2' }, x, IR.ui.chips(), IR.ui.gearButton()),
      h('div', { class: 'unitwrap' },
        h('section', { class: 'unithero' }, h('div', { class: 'chestbig', html: IR.chestSVG(1) }), h('div', { class: 'ut-title' }, h('span', { class: 'ut-isle' }, 'Level 1 treasure'), h('h1', null, 'Treasure chest 1')),
          h('p', { class: 'small' }, '30 little words. Play the games as often as you like. They never hold anything up.')),
        h('section', { class: 'ugrp activities' }, h('h2', { class: 'ugrp-t' }, icon('play'), 'Games', h('small', null, 'Play as often as you like')), h('ol', { class: 'stoplist' }, ...cards)),
        h('section', { class: 'ugrp' }, h('h2', { class: 'ugrp-t' }, 'The words', h('small', null, 'A star means a heart word you learned. Tap a word to hear it.')), chips,
          h('div', { class: 'row center' }, h('button', { class: 'btn', type: 'button', onclick: () => adultCheck(WORDS) }, icon('speaker'), 'Read it aloud (optional)')))),
      h('div', { class: 'lesson-nav trail-nav' },
        h('button', { class: 'btn big back', type: 'button', 'aria-label': 'Back to the world map', onclick: () => { location.hash = '#/home'; } }, icon('back'), 'Back'),
        h('button', { class: 'btn big next', type: 'button', 'aria-label': 'Next: Flip and Match', onclick: () => { location.hash = '#/chest1/flip'; } }, 'Next', icon('next')))));
  }

  /* ---- game 1: Flip and Match (4 pairs of word cards) ---- */
  function flip(app) {
    const scr = IR.newScreen(); const words = rounds('flip', 4); let open = []; let matched = 0; let busy = false;
    const grid = h('div', { class: 'flipgrid' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Turn a card. Find its twin.');
    shuffle(words.concat(words)).forEach((w, i) => {
      const face = h('span', { class: 'ffront' }, w); const back = h('span', { class: 'fback', 'aria-hidden': 'true' }, '?'); const st = starMark(w); if (st) face.append(st);
      const c = h('button', { class: 'fcard', type: 'button', 'data-w': w, 'aria-label': 'Card ' + (i + 1) + ', face down' }, back, face);
      c.addEventListener('click', async () => {
        if (busy || c.classList.contains('up') || c.classList.contains('got')) return;
        c.classList.add('up'); c.setAttribute('aria-label', w); IR.sayWord(w); open.push(c);
        if (open.length < 2) return; busy = true; const [a, b] = open; open = [];
        if (a.dataset.w === b.dataset.w) {
          await sleep(700); if (!scr.ok()) return; a.classList.add('got'); b.classList.add('got'); matched++; status.textContent = 'A pair!'; busy = false;
          if (matched === words.length) { await sleep(500); if (scr.ok()) { state().plays.flip = (state().plays.flip || 0) + 1; IR.save(); endCard(app, 'flip', words, () => { state(); location.hash = '#/chest1/flip'; route(); }); } }
        } else { status.textContent = 'Not a pair. Try again.'; await sleep(1300); if (!scr.ok()) return; a.classList.remove('up'); b.classList.remove('up'); a.setAttribute('aria-label', 'face down'); b.setAttribute('aria-label', 'face down'); busy = false; }
      });
      grid.append(c);
    });
    frame(app, { title: 'Flip and Match', backHref: '#/chest1', nextHref: '#/chest1/catch', backLabel: 'Back to the chest', nextLabel: 'Next game: Catch the Word', body: h('div', { class: 'activity' }, grid, status) });
  }

  /* ---- game 2: Catch the Word (word bubbles drift slowly; tap the one you hear) ---- */
  function catchGame(app) {
    const scr = IR.newScreen(); const targets = rounds('catch', 5); let r = 0; const stage = h('div', { class: 'activity' });
    const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const w = targets[r]; let locked = false; const pool = shuffle([w].concat(shuffle(WORDS.filter((x) => x !== w)).slice(0, 4)));
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word'); spk.classList.add('huge');
      const sea = h('div', { class: 'bubblesea' });
      pool.forEach((x, i) => {
        const b = h('button', { class: 'bword', type: 'button', 'data-w': x, style: `--i:${i};--d:${7 + i * 1.3}s;top:${6 + i * 17}%` }, x); const st = starMark(x); if (st) b.append(st);
        b.addEventListener('click', async () => {
          if (locked || b.classList.contains('tried')) return;
          if (x === w) { locked = true; b.classList.add('right'); status.textContent = 'Yes! ' + w; sea.classList.add('paused'); await IR.ding(w); if (!scr.ok()) return; await sleep(500); if (!scr.ok()) return; r++; if (r < targets.length) round(); else { state().plays.catch = (state().plays.catch || 0) + 1; IR.save(); endCard(app, 'catch', targets, () => { location.hash = '#/chest1/catch'; route(); }); } }
          else { b.classList.add('tried'); status.textContent = 'Not that one. Listen again.'; await IR.tryAgain(A.word(w)); }
        }); sea.append(b);
      });
      stage.innerHTML = ''; stage.append(h('p', { class: 'small' }, 'Word ' + (r + 1) + ' of ' + targets.length), spk, sea, status); IR.sayWord(w);
    }
    frame(app, { title: 'Catch the Word', backHref: '#/chest1/flip', nextHref: '#/chest1/find', backLabel: 'Back: Flip and Match', nextLabel: 'Next game: Find the Word', body: stage }); round();
  }

  /* ---- game 3: Find the Word (read the word, find it in the box) ---- */
  function findGame(app) {
    const scr = IR.newScreen(); const targets = rounds('find', 4); let r = 0; const stage = h('div', { class: 'activity' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const w = targets[r]; let locked = false; const pool = shuffle([w].concat(shuffle(WORDS.filter((x) => x !== w)).slice(0, 5)));
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word');
      const grid = h('div', { class: 'findgrid' });
      pool.forEach((x) => { const b = wordCard(x, 'find'); b.addEventListener('click', async () => {
        if (locked || b.classList.contains('tried')) return;
        if (x === w) { locked = true; b.classList.add('right'); status.textContent = 'Found it!'; await IR.ding(w); if (!scr.ok()) return; await sleep(500); if (!scr.ok()) return; r++; if (r < targets.length) round(); else { state().plays.find = (state().plays.find || 0) + 1; IR.save(); endCard(app, 'find', targets, () => { location.hash = '#/chest1/find'; route(); }); } }
        else { b.classList.add('tried'); status.textContent = 'Not that one. Look again.'; await IR.tryAgain(A.word(w)); } }); grid.append(b); });
      stage.innerHTML = ''; stage.append(h('p', { class: 'small' }, 'Word ' + (r + 1) + ' of ' + targets.length), h('div', { class: 'findtarget' }, spk, h('span', { class: 'bigword' }, w)), grid, status); IR.sayWord(w);
    }
    frame(app, { title: 'Find the Word', backHref: '#/chest1/catch', nextHref: '#/chest1', backLabel: 'Back: Catch the Word', nextLabel: 'Next: back to the chest', body: stage }); round();
  }
  let route = () => {};
  function render(hash, app) {
    route = () => { app.innerHTML = ''; render(location.hash, app); };
    const m = /^#\/chest1\/(\w+)/.exec(hash); const g = m ? m[1] : null;
    if (g === 'flip') flip(app); else if (g === 'catch') catchGame(app); else if (g === 'find') findGame(app); else { IR.newScreen(); menu(app); }
  }
  IR.chest = { render, WORDS, GAMES };
})();

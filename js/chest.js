/* Treasure chests 1 and 2: one game menu with 10 games per chest, on that chest's 50 words (D.box1, D.box2). Rounds are 6 to 10 words; every game can Keep going round after round. Replayable, never blocks progress, no timers, no scores to lose. */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $$, sleep, shuffle, icon, Snd, A } = IR;
  function make(N, WORDS, FILL, HEARTW, SOUNDW) {
  const P = '#/chest' + N;
  const GAMES = [
    { id: 'flip', title: 'Flip and Match', blurb: 'Turn two cards. Find the pair.', icon: 'play' },
    { id: 'catch', title: 'Catch the Word', blurb: 'Hear a word. Catch it as it floats by.', icon: 'play' },
    { id: 'find', title: 'Find the Word', blurb: 'Look at the word. Find it in the box.', icon: 'play' },
    { id: 'pop', title: 'Word Pop', blurb: 'Hear a word. Pop the matching bubble.', icon: 'play' },
    { id: 'build', title: 'Build the Word', blurb: 'Hear a word. Tap the letters to spell it.', icon: 'play' },
    { id: 'missing', title: 'Missing Letter', blurb: 'One letter is missing. Tap the right one.', icon: 'play' },
    { id: 'spell', title: 'Spell It', blurb: 'Hear a word. Zip helps you build it letter by letter.', icon: 'play' },
    { id: 'sort', title: 'Word Sort', blurb: 'Hear a word. Tap the group it belongs to.', icon: 'play' },
    { id: 'sentence', title: 'Sentence Fill-in', blurb: 'Hear a sentence. Tap the word that fits.', icon: 'play' },
    { id: 'trace', title: 'Trace and Say', blurb: 'Trace the dotted word. Then say it.', icon: 'play' }
  ];
  /* Back/Next chain across all games: chest menu, 1 .. 6, chest menu */
  const navFor = (id) => { const i = GAMES.findIndex((g) => g.id === id); const pv = GAMES[i - 1], nx = GAMES[i + 1];
    return { backHref: pv ? P + '/' + pv.id : P, backLabel: pv ? 'Back: ' + pv.title : 'Back to the chest', nextHref: nx ? P + '/' + nx.id : P, nextLabel: nx ? 'Next game: ' + nx.title : 'Next: back to the chest' }; };
  const LETTERS = 'abcdefghijklmnopqrstuvwxyz'; const VOWELS = 'aeiou';
  const poolOf = (min, max) => WORDS.filter((w) => w.length >= min && w.length <= max && w !== 'I');
  const state = () => { const S = IR.S(); const k = 'chest' + N; if (!S[k]) S[k] = { plays: {}, read: {} }; return S[k]; };
  const taught = (w) => D.heart.some((x) => x.w === w) && (!!IR.S().heart[w] || IR.isDone('listen'));     /* heart words already taught show a star */
  /* Round words: every game walks through its own fixed shuffled order of the pool, n words at a time, so the words in one round are unique, each replay moves to the next n words, and the whole pool is used before any word comes round again. */
  const seeded = (str) => { let s = 0; for (const c of str) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const orderOf = (gameId, pool) => { const rnd = seeded(gameId); const a = pool.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const rounds = (gameId, n, pool) => { pool = pool || WORDS; n = Math.min(n, pool.length); const k = state().plays[gameId] || 0; const o = orderOf(gameId, pool); const out = []; for (let i = 0; i < n; i++) out.push(o[(k * n + i) % o.length]); return out; };
  const ROUND = { flip: 6, catch: 8, find: 10, pop: 10, build: 8, missing: 10, spell: 8, sort: 8, sentence: 8, trace: 6 };      /* words (or pairs) per round */
  const keepNext = {};                                                                          /* set when the child taps "Keep going" on an end card */
  const starMark = (w) => taught(w) ? h('span', { class: 'hstar', 'aria-label': 'heart word you learned' }, icon('star')) : null;
  const wordCard = (w, cls) => { const b = h('button', { class: 'wcard ' + (cls || ''), type: 'button', 'data-w': w }, h('span', { class: 'wtext' }, w)); const st = starMark(w); if (st) b.append(st); return b; };

  /* Grown-up check (lives in the Grown-up corner, never shown to the child): tick the words the child read aloud. Never required. */
  function checklist() {
    const st = state();
    const rows = WORDS.map((w) => { const cb = h('input', { type: 'checkbox', id: 'rd_' + w }); cb.checked = !!st.read[w]; cb.addEventListener('change', () => { st.read[w] = cb.checked; IR.save(); });
      return h('label', { class: 'rdrow', for: 'rd_' + w }, cb, h('span', { class: 'rdw' }, w), h('button', { class: 'btn small', type: 'button', 'aria-label': 'Hear ' + w, onclick: (e) => { e.preventDefault(); IR.sayWord(w); } }, icon('speaker'))); });
    return h('details', { class: 'rdcheck' }, h('summary', null, 'Treasure chest ' + N + ': words read aloud (' + WORDS.length + ')'),
      h('p', { class: 'small' }, 'Optional. Ask the child to read each word aloud and tick the ones they read. Tap the speaker to hear a word.'), h('div', { class: 'rdlist' }, ...rows));
  }

  /* "Hear the words": plays the game's words aloud one after another, highlighting each; the same button turns into Stop. */
  function hearWords(words) {
    let run = 0;
    const its = words.map((x) => typeof x === 'string' ? { k: x, t: x, src: A.word(x) } : { k: String(x.id), t: x.text, src: 'audio/sf_' + x.id + '.mp3' });    /* words, or whole sentences (Sentence Fill-in) */
    const list = h('div', { class: 'hearlist', hidden: true, 'aria-live': 'polite' }, ...its.map((x) => h('span', { class: 'hw', 'data-w': x.k }, x.t)));
    const btn = h('button', { class: 'btn small hearbtn', type: 'button' });
    const set = (on) => { btn.dataset.on = on ? '1' : ''; btn.textContent = ''; btn.append(icon(on ? 'pause' : 'speaker'), on ? 'Stop' : 'Hear the words'); btn.setAttribute('aria-label', on ? 'Stop' : 'Hear the words'); };
    const clear = () => list.querySelectorAll('.hw.hl').forEach((e) => e.classList.remove('hl'));
    const stop = () => { run++; Snd.stop(); clear(); set(false); };
    btn.addEventListener('click', async () => {
      if (btn.dataset.on) { stop(); return; }
      const my = ++run; set(true); list.hidden = false;
      for (const x of its) {
        if (my !== run) return; clear(); const el = list.querySelector('.hw[data-w="' + x.k + '"]'); if (el) el.classList.add('hl');
        await Snd.play(x.src); if (my !== run) return; await sleep(350);
      }
      if (my === run) { clear(); set(false); }
    });
    set(false);
    return { btn, list, stop };
  }

  /* shared screen frame: X (back to chest), title, Back/Next footer */
  function frame(app, { title, backHref, nextHref, backLabel, nextLabel, body, cls }) {
    const x = h('button', { class: 'xbtn', type: 'button', 'aria-label': 'Back to the chest', onclick: () => { location.hash = P; } }, icon('close'));
    const nav = h('div', { class: 'lesson-nav' },
      h('button', { class: 'btn big back', type: 'button', 'aria-label': backLabel || 'Back', onclick: () => { Snd.stop(); location.hash = backHref; } }, icon('back'), 'Back'),
      h('button', { class: 'btn big next', type: 'button', 'aria-label': nextLabel || 'Next', onclick: () => { Snd.stop(); location.hash = nextHref; } }, 'Next', icon('next')));
    app.append(h('div', { class: 'screen lessonscreen chestscreen ' + (cls || ''), style: '--c:#A9693B' },
      h('header', { class: 'lesson-top' }, x, h('div', { class: 'chest-title' }, h('span', { class: 'chestmini', html: IR.chestSVG(N) }), title), IR.ui.homeButton()), h('div', { class: 'stage' }, body), nav));
  }
  /* One play session of a game: tracks the round, keeps the words fresh, and runs "Keep going" (rounds follow each other until the child taps Stop or Home). Nothing here can block or take anything away. */
  function session(app, id, pool, n, gen) {
    const scr = IR.newScreen(); const S = { id, endless: !!keepNext[id], stopped: false, roundNo: 1, r: 0, last: [], extra: null };
    keepNext[id] = false; S.targets = gen ? gen() : rounds(id, n, pool);
    S.ok = () => scr.ok() && !S.stopped;
    S.again = () => { location.hash = P + '/' + id; route(); };
    S.keep = () => { keepNext[id] = true; S.again(); };
    S.stopBtn = () => S.endless ? h('button', { class: 'btn small stopbtn', type: 'button', onclick: () => S.stop() }, icon('pause'), 'Stop') : null;
    S.head = () => h('div', { class: 'roundhead' }, h('p', { class: 'small' }, (S.noun || 'Word') + ' ' + (S.r + 1) + ' of ' + S.targets.length + (S.endless ? ' \u00b7 Round ' + S.roundNo : '')), S.stopBtn());
    S.stop = () => { S.stopped = true; Snd.stop(); const w = S.r > 0 ? S.targets.slice(0, S.r) : (S.last.length ? S.last : S.targets); endCard(app, id, w, S); };
    /* a round is finished: count it, then either show the end card or glide straight into the next round (Keep going) */
    S.finish = async (next) => {
      const st = state(); st.plays[id] = (st.plays[id] || 0) + 1; IR.save(); S.last = S.targets;
      if (!S.endless) { endCard(app, id, S.targets, S); return; }
      const toast = h('div', { class: 'roundtoast', role: 'status' }, h('div', { class: 'bigstars', 'aria-hidden': 'true' }, ...[1, 2, 3].map((k) => icon('star', 'on k' + k))), h('b', null, 'Round ' + S.roundNo + ' done. Here come new words.'));
      app.append(toast); Snd.play(A.sfx.done); await sleep(1700); toast.remove(); if (!S.ok()) return;
      S.roundNo++; S.targets = gen ? gen() : rounds(id, n, pool); S.r = 0; next();
    };
    S.advance = (next) => { S.r++; if (S.r < S.targets.length) next(); else S.finish(next); };
    return S;
  }
  function endCard(app, game, words, S) {       /* short, non-verbal praise: stars + a chime, no spoken words, never blocks anything */
    const idx = GAMES.findIndex((g) => g.id === game); const nxt = GAMES[idx + 1]; const hw = hearWords(words);
    const go = (fn) => () => { hw.stop(); box.remove(); fn(); };
    const extra = (S.extra ? S.extra() : []).map((x) => h('button', { class: 'btn big', type: 'button', onclick: go(x.run) }, x.label));
    const box = h('div', { class: 'complete chestdone' }, h('div', { class: 'cbox' }, IR.celebration(false),
      h('div', { class: 'bigstars', 'aria-hidden': 'true' }, ...[1, 2, 3].map((k) => icon('star', 'on k' + k))),
      h('div', { class: 'row' }, h('button', { class: 'btn big primary keepbtn', type: 'button', onclick: go(S.keep) }, icon('play'), 'Keep going'), h('button', { class: 'btn big', type: 'button', onclick: go(S.again) }, icon('replay'), 'Play again')),
      h('div', { class: 'row' }, ...extra, h('button', { class: 'btn big next', type: 'button', onclick: () => { hw.stop(); location.hash = nxt ? P + '/' + nxt.id : P; } }, nxt ? 'Next game' : 'Back to the chest', icon('next'))),
      hw.btn, hw.list));
    app.append(box); Snd.play(A.sfx.done);
  }

  /* ---- menu ---- */
  function menu(app) {
    const cards = GAMES.map((g, i) => h('li', null, h('button', { class: 'stopcard gamestop', type: 'button', 'data-game': g.id, onclick: () => { location.hash = P + '/' + g.id; }, 'aria-label': (i + 1) + '. ' + g.title + '. ' + g.blurb },
      h('span', { class: 'snum', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'sico', 'aria-hidden': 'true' }, icon('play')),
      h('span', { class: 'stxt' }, h('b', null, g.title), h('small', null, g.blurb)), h('span', { class: 'sside' }, h('span', { class: 'slabel' }, 'Play')))));
    const chips = h('div', { class: 'wordchips', 'aria-label': 'The ' + WORDS.length + ' words' }, ...WORDS.map((w) => { const b = wordCard(w, 'mini'); b.addEventListener('click', () => IR.sayWord(w)); return b; }));
    const x = IR.ui.homeButton();
    app.append(h('div', { class: 'screen trailscreen unitpage chestmenu' },
      h('header', { class: 'top2' }, x, IR.ui.gearButton()),
      h('div', { class: 'unitwrap' },
        h('section', { class: 'unithero' }, h('div', { class: 'chestbig', html: IR.chestSVG(N) }), h('div', { class: 'ut-title' }, h('span', { class: 'ut-isle' }, 'Level ' + N + ' treasure'), h('h1', null, 'Treasure chest ' + N)),
          h('p', { class: 'small' }, WORDS.length + ' words. Play the games as often as you like. They never hold anything up.')),
        h('section', { class: 'ugrp activities' }, h('h2', { class: 'ugrp-t' }, icon('play'), 'Games', h('small', null, 'Play as often as you like')), h('ol', { class: 'stoplist' }, ...cards)),
        h('section', { class: 'ugrp' }, h('h2', { class: 'ugrp-t' }, 'The words', h('small', null, 'A star means a heart word you learned. Tap a word to hear it.')), chips)),
      h('div', { class: 'lesson-nav trail-nav' },
        h('button', { class: 'btn big back', type: 'button', 'aria-label': 'Back to the world map', onclick: () => { location.hash = '#/home'; } }, icon('back'), 'Back'),
        h('button', { class: 'btn big next', type: 'button', 'aria-label': 'Next: Flip and Match', onclick: () => { location.hash = P + '/flip'; } }, 'Next', icon('next')))));
  }


  /* ---- game 1: Flip and Match (6 pairs of word cards; after finishing, an optional harder board of 8 pairs is offered) ---- */
  function flip(app) {
    const pairs = state().flipPairs === 8 ? 8 : 6; const S = session(app, 'flip', WORDS, pairs);
    const grid = h('div', { class: 'flipgrid p' + pairs }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Turn a card. Find its twin.');
    S.extra = () => [pairs === 6 ? { label: 'Try 8 pairs (a bit harder)', run: () => { state().flipPairs = 8; IR.save(); S.again(); } } : { label: 'Back to 6 pairs', run: () => { state().flipPairs = 6; IR.save(); S.again(); } }];
    function board() {
      const words = S.targets; let open = []; let matched = 0; let busy = false; grid.innerHTML = ''; status.textContent = 'Turn a card. Find its twin.';
      shuffle(words.concat(words)).forEach((w, i) => {
        const face = h('span', { class: 'ffront' }, w); const back = h('span', { class: 'fback', 'aria-hidden': 'true' }, '?'); const st = starMark(w); if (st) face.append(st);
        const c = h('button', { class: 'fcard', type: 'button', 'data-w': w, 'aria-label': 'Card ' + (i + 1) + ', face down' }, back, face);
        c.addEventListener('click', async () => {
          if (busy || !S.ok() || c.classList.contains('up') || c.classList.contains('got')) return;
          c.classList.add('up'); c.setAttribute('aria-label', w); IR.sayWord(w); open.push(c);
          if (open.length < 2) return; busy = true; const [a, b] = open; open = [];
          if (a.dataset.w === b.dataset.w) {
            await sleep(700); if (!S.ok()) return; a.classList.add('got'); b.classList.add('got'); matched++; status.textContent = 'A pair!'; busy = false;
            if (matched === words.length) { await sleep(500); if (S.ok()) S.finish(board); }
          } else { status.textContent = 'Not a pair. Try again.'; await sleep(1300); if (!S.ok()) return; a.classList.remove('up'); b.classList.remove('up'); a.setAttribute('aria-label', 'face down'); b.setAttribute('aria-label', 'face down'); busy = false; }
        });
        grid.append(c);
      });
    }
    frame(app, { title: 'Flip and Match', ...navFor('flip'), body: h('div', { class: 'activity' }, S.endless ? h('div', { class: 'roundhead' }, h('p', { class: 'small' }, 'Keep going'), S.stopBtn()) : null, grid, status) }); board();
  }

  /* ---- game 2: Catch the Word (word bubbles drift slowly; tap the one you hear) ---- */
  function catchGame(app) {
    const S = session(app, 'catch', WORDS, ROUND.catch); const stage = h('div', { class: 'activity' });
    const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const w = S.targets[S.r]; let locked = false; const pool = shuffle([w].concat(shuffle(WORDS.filter((x) => x !== w)).slice(0, 4)));
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word'); spk.classList.add('huge');
      const sea = h('div', { class: 'bubblesea' });
      pool.forEach((x, i) => {
        const b = h('button', { class: 'bword', type: 'button', 'data-w': x, style: `--i:${i};--d:${7 + i * 1.3}s;top:${6 + i * 17}%` }, x); const st = starMark(x); if (st) b.append(st);
        b.addEventListener('click', async () => {
          if (locked || b.classList.contains('tried')) return;
          if (x === w) { locked = true; b.classList.add('right'); status.textContent = 'Yes! ' + w; sea.classList.add('paused'); await IR.ding(w); if (!S.ok()) return; await sleep(500); if (!S.ok()) return; S.advance(round); }
          else { b.classList.add('tried'); status.textContent = 'Not that one. Listen again.'; await IR.tryAgain(A.word(w)); }
        }); sea.append(b);
      });
      stage.innerHTML = ''; stage.append(S.head(), spk, sea, status); IR.sayWord(w);
    }
    frame(app, { title: 'Catch the Word', ...navFor('catch'), body: stage }); round();
  }

  /* ---- game 3: Find the Word (read the word, find it in the box) ---- */
  function findGame(app) {
    const S = session(app, 'find', WORDS, ROUND.find); const stage = h('div', { class: 'activity' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const w = S.targets[S.r]; let locked = false; const pool = shuffle([w].concat(shuffle(WORDS.filter((x) => x !== w)).slice(0, 5)));
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word');
      const grid = h('div', { class: 'findgrid' });
      pool.forEach((x) => { const b = wordCard(x, 'find'); b.addEventListener('click', async () => {
        if (locked || b.classList.contains('tried')) return;
        if (x === w) { locked = true; b.classList.add('right'); status.textContent = 'Found it!'; await IR.ding(w); if (!S.ok()) return; await sleep(500); if (!S.ok()) return; S.advance(round); }
        else { b.classList.add('tried'); status.textContent = 'Not that one. Look again.'; await IR.tryAgain(A.word(w)); } }); grid.append(b); });
      stage.innerHTML = ''; stage.append(S.head(), h('div', { class: 'findtarget' }, spk, h('span', { class: 'bigword' }, w)), grid, status); IR.sayWord(w);
    }
    frame(app, { title: 'Find the Word', ...navFor('find'), body: stage }); round();
  }

  /* ---- game 4: Word Pop (hear a word, pop the matching bubble) ---- */
  function popGame(app) {
    const S = session(app, 'pop', WORDS, ROUND.pop); const stage = h('div', { class: 'activity' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const w = S.targets[S.r]; let locked = false; const pool = shuffle([w].concat(shuffle(WORDS.filter((x) => x !== w)).slice(0, 3)));
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word'); spk.classList.add('huge');
      const field = h('div', { class: 'popfield' });
      pool.forEach((x, i) => { const b = h('button', { class: 'popb', type: 'button', 'data-w': x, style: '--i:' + i }, h('span', { class: 'wtext' }, x));
        b.addEventListener('click', async () => {
          if (locked || b.classList.contains('tried')) return;
          if (x === w) { locked = true; b.classList.add('right', 'popped'); status.textContent = 'Pop! ' + w; await IR.ding(w); if (!S.ok()) return; await sleep(500); if (!S.ok()) return; S.advance(round); }
          else { b.classList.add('tried'); status.textContent = 'Not that one. Listen again.'; await IR.tryAgain(A.word(w)); } }); field.append(b); });
      stage.innerHTML = ''; stage.append(S.head(), spk, field, status); IR.sayWord(w);
    }
    frame(app, { title: 'Word Pop', ...navFor('pop'), body: stage }); round();
  }

  /* ---- game 5: Build the Word (tap the letters in order; the word is spoken, no picture) ---- */
  function buildGame(app) {
    const pool = poolOf(2, 4); const S = session(app, 'build', pool, ROUND.build); const stage = h('div', { class: 'activity' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const w = S.targets[S.r]; const L = w.toLowerCase().split(''); let at = 0; let done = false;
      const extra = shuffle(LETTERS.split('').filter((c) => !L.includes(c))).slice(0, 2);
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word'); spk.classList.add('huge');
      const slots = h('div', { class: 'lslots', 'aria-label': 'The word has ' + L.length + ' letters' }, ...L.map((c, i) => h('span', { class: 'lslot' + (i === 0 ? ' now' : ''), 'data-i': i }, '')));
      const tray = h('div', { class: 'tray' });
      shuffle(L.concat(extra)).forEach((c) => { const t = h('button', { class: 'ltile', type: 'button', 'data-l': c, 'aria-label': 'Letter ' + c }, c);
        t.addEventListener('click', async () => {
          if (done || t.classList.contains('used') || t.classList.contains('tried')) return;
          if (c === L[at]) {
            t.classList.add('used'); const sl = slots.children[at]; sl.textContent = c; sl.classList.remove('now'); sl.classList.add('filled'); at++; Snd.play(A.sfx.tap, { keep: false });
            if (at < L.length) { slots.children[at].classList.add('now'); status.textContent = '\u00a0'; return; }
            done = true; slots.classList.add('right'); status.textContent = w; await IR.ding(w); if (!S.ok()) return; await sleep(600); if (!S.ok()) return;
            S.advance(round);
          } else { t.classList.add('tried'); status.textContent = 'Not that letter. Try another.'; await IR.tryAgain(); }
        }); tray.append(t); });
      stage.innerHTML = ''; stage.append(S.head(), spk, slots, tray, status); IR.sayWord(w);
    }
    frame(app, { title: 'Build the Word', ...navFor('build'), body: stage }); round();
  }

  /* ---- game 6: Missing Letter (one letter is missing; tap the right one; the word is spoken) ---- */
  function missingGame(app) {
    const pool = poolOf(2, 5); const S = session(app, 'missing', pool, ROUND.missing); const stage = h('div', { class: 'activity' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const w = S.targets[S.r]; const L = w.toLowerCase().split(''); let locked = false;
      const k = state().plays.missing || 0; const miss = (S.r * 2 + k) % L.length; const need = L[miss];
      const same = (VOWELS.includes(need) ? VOWELS : LETTERS.replace(new RegExp('[' + VOWELS + ']', 'g'), '')).split('').filter((c) => c !== need);
      const opts = shuffle([need].concat(shuffle(same).slice(0, 2)));
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word'); spk.classList.add('huge');
      const word = h('div', { class: 'lslots mword', 'aria-label': 'A word with one missing letter' }, ...L.map((c, i) => i === miss ? h('span', { class: 'lslot now blank', 'data-blank': '1' }, '') : h('span', { class: 'lslot filled' }, c)));
      const tray = h('div', { class: 'tray' });
      opts.forEach((c) => { const t = h('button', { class: 'ltile', type: 'button', 'data-l': c, 'aria-label': 'Letter ' + c }, c);
        t.addEventListener('click', async () => {
          if (locked || t.classList.contains('tried')) return;
          if (c === need) { locked = true; t.classList.add('used'); const b = word.querySelector('[data-blank]'); b.textContent = c; b.classList.remove('now'); b.classList.add('filled'); word.classList.add('right'); status.textContent = w; await IR.ding(w); if (!S.ok()) return; await sleep(600); if (!S.ok()) return;
            S.advance(round); }
          else { t.classList.add('tried'); status.textContent = 'Not that letter. Try another.'; await IR.tryAgain(A.word(w)); } }); tray.append(t); });
      stage.innerHTML = ''; stage.append(S.head(), spk, word, tray, status); IR.sayWord(w);
    }
    frame(app, { title: 'Missing Letter', ...navFor('missing'), body: stage }); round();
  }

  /* ---- game 7: Spell It. Hear the word (audio only). Zip the gecko catches each letter you place and a flower fills in petal by petal.
     Level 1 "Letter Sort": tap the scrambled letters (nothing extra) in order. Level 2 "Hide and Spell" (harder): the word shows for 3 seconds, hides, and you rebuild it from memory.
     A gentle Hint is always there. A wrong tile only wiggles. Nothing is lost. ---- */
  const scramble = (L) => { if (new Set(L).size < 2) return L.slice(); let t; let n = 0; do { t = shuffle(L.slice()); n++; } while (t.join('') === L.join('') && n < 20); return t; };
  let spellPicked = null;                               /* 'sort' | 'hide' | null (null = show the level picker); kept for Play again / Keep going */
  const flowerSVG = (n) => { const pet = []; for (let i = 0; i < n; i++) { const a = (i / n) * 360; pet.push('<ellipse class="petal" data-i="' + i + '" cx="50" cy="24" rx="11" ry="17" transform="rotate(' + a.toFixed(1) + ' 50 50)"/>'); }
    return '<svg viewBox="0 0 100 100" class="flowersvg" aria-hidden="true" focusable="false">' + pet.join('') + '<circle class="fcenter" cx="50" cy="50" r="11"/></svg>'; };
  function spellPick(app) {
    IR.newScreen();
    const card = (mode, title, blurb) => h('button', { class: 'levelcard', type: 'button', 'data-mode': mode, onclick: () => { spellPicked = mode; route(); } },
      h('span', { class: 'lvl-t' }, title), h('span', { class: 'lvl-b' }, blurb), h('span', { class: 'slabel' }, 'Play'));
    frame(app, { title: 'Spell It', ...navFor('spell'), body: h('div', { class: 'activity levelpick' },
      h('img', { class: 'zipspell', src: 'img/zip.webp', alt: '' }), h('p', { class: 'bigprompt' }, 'Zip needs your help. Pick how to play.'),
      h('div', { class: 'levelrow' },
        card('sort', 'Letter Sort', 'Hear the word. Put its mixed-up letters in order.'),
        card('hide', 'Hide and Spell', 'Harder. See the word for 3 seconds. Then build it from memory.'))) });
  }
  function spellGame(app) {
    if (!spellPicked) { spellPick(app); return; }
    const hideMode = spellPicked === 'hide'; const pool = poolOf(3, 6); const S = session(app, 'spell', pool, ROUND.spell); const stage = h('div', { class: 'activity spellact' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    S.extra = () => [{ label: 'Change level', run: () => { spellPicked = null; S.again(); } }];
    async function round() {
      const w = S.targets[S.r]; const L = w.toLowerCase().split(''); let at = 0; let done = false; let ready = !hideMode; let peekRun = 0;
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word'); spk.classList.add('huge');
      const zip = h('img', { class: 'zipspell', src: 'img/zip.webp', alt: '' });
      const flower = h('span', { class: 'flowerbox', 'aria-label': 'A flower that fills in as you build the word', role: 'img', html: flowerSVG(L.length) });
      const slots = h('div', { class: 'lslots spellslots', role: 'group', 'aria-label': 'Put the letters in order. The word has ' + L.length + ' letters' }, ...L.map((c, i) => h('span', { class: 'lslot' + (i === 0 && ready ? ' now' : ''), 'data-i': i }, '')));
      const tray = h('div', { class: 'tray spelltray' });
      const hint = h('button', { class: 'btn big hintbtn', type: 'button', 'aria-label': 'Hint: show the next letter' }, icon('star'), 'Hint');
      const peekword = h('div', { class: 'peekword', 'aria-live': 'polite' }, '\u00a0');
      const peek = hideMode ? h('button', { class: 'btn small peekbtn', type: 'button' }, icon('replay'), 'Show it again') : null;
      const showFor = async (ms) => { const my = ++peekRun; peekword.textContent = w; peekword.classList.add('on'); await sleep(ms); if (my === peekRun && S.ok()) { peekword.textContent = '\u00a0'; peekword.classList.remove('on'); } };
      const place = async (t, c, hinted) => {
        t.classList.add('used'); const sl = slots.children[at]; sl.textContent = c; sl.classList.remove('now'); sl.classList.add('filled', 'just'); if (hinted) sl.classList.add('hinted');
        flower.querySelector('.petal[data-i="' + at + '"]').classList.add('on'); zip.classList.remove('hop'); void zip.offsetWidth; zip.classList.add('hop'); at++; Snd.play(A.sfx.tap, { keep: false });
        if (at < L.length) { slots.children[at].classList.add('now'); status.textContent = 'Zip caught \u201c' + c + '\u201d.'; return; }
        done = true; hint.disabled = true; if (peek) peek.disabled = true; peekRun++; peekword.textContent = '\u00a0'; peekword.classList.remove('on');
        slots.classList.add('right'); flower.classList.add('bloom'); status.textContent = w; await IR.ding(w); if (!S.ok()) return; await sleep(900); if (!S.ok()) return;
        S.advance(round);
      };
      scramble(L).forEach((c) => { const t = h('button', { class: 'ltile sort', type: 'button', 'data-l': c, 'aria-label': 'Letter ' + c }, c);
        t.addEventListener('click', () => {
          if (done || !ready || t.classList.contains('used')) return;
          if (c === L[at]) place(t, c, false);
          else { t.classList.remove('wiggle'); void t.offsetWidth; t.classList.add('wiggle'); status.textContent = 'Not that one yet. Try another letter.'; Snd.play(A.sfx.tap, { keep: false }); }
        }); tray.append(t); });
      hint.addEventListener('click', () => { if (done || !ready) return; const t = [...tray.querySelectorAll('.ltile:not(.used)')].find((x) => x.dataset.l === L[at]); if (t) place(t, L[at], true); });
      if (peek) peek.addEventListener('click', () => { if (!done && ready) showFor(3000); });
      const ctrl = h('div', { class: 'spellctrl' }, h('div', { class: 'spellrow' }, spk, hint), peek);
      stage.innerHTML = ''; stage.append(S.head(), h('div', { class: 'spellscene' }, zip, ctrl, flower), peekword, slots, tray, status);
      const heard = IR.sayWord(w);
      if (hideMode) {                                   /* look first: the word shows for 3 seconds, then hides and the letters appear */
        tray.classList.add('waiting'); hint.disabled = true; peek.disabled = true; status.textContent = 'Look at the word. Remember it.'; peekword.textContent = w; peekword.classList.add('on');
        await sleep(3000); if (!S.ok()) return; peekword.textContent = '\u00a0'; peekword.classList.remove('on'); tray.classList.remove('waiting'); ready = true; hint.disabled = false; peek.disabled = false; slots.children[0].classList.add('now'); status.textContent = 'Now build it from memory.';
      }
    }
    frame(app, { title: 'Spell It', ...navFor('spell'), body: stage }); round();
  }
  /* ---- game 8: Word Sort (tap the group a word belongs to; the group pairs rotate every round) ---- */
  const SORT_BOARDS = [
    { id: 'len', A: { name: '2 or 3 letters', words: WORDS.filter((w) => w.length <= 3), key: 'two' }, B: { name: '5 or more letters', words: WORDS.filter((w) => w.length >= 5), key: 'four' }, ask: 'How many letters?' },
    { id: 'heart', A: { name: 'Heart word (tricky part)', words: HEARTW, key: 'heart' }, B: { name: 'Sound it out', words: SOUNDW, key: 'sound' }, ask: 'Heart word or sound it out?' },
    { id: 'vowel', A: { name: 'Starts with a vowel', words: WORDS.filter((w) => /^[aeiouAEIOU]/.test(w)), key: 'vowel' }, B: { name: 'Starts with another letter', words: WORDS.filter((w) => !/^[aeiouAEIOU]/.test(w)), key: 'other' }, ask: 'What does it start with?' }
  ];
  const sortWords = () => { const k = state().plays.sort || 0; const b = SORT_BOARDS[k % SORT_BOARDS.length]; const visit = Math.floor(k / SORT_BOARDS.length);
    const oa = orderOf('sort' + b.id + 'A', b.A.words), ob = orderOf('sort' + b.id + 'B', b.B.words); const out = [];
    for (let i = 0; i < 4; i++) { out.push(oa[(visit * 4 + i) % oa.length]); out.push(ob[(visit * 4 + i) % ob.length]); }
    const t = out[1]; out[1] = out[2]; out[2] = t; return { board: b, words: out }; };                    /* A B B A A B B A feel: mixed, not strictly alternating */
  function sortGame(app) {
    let cur = sortWords(); const S = session(app, 'sort', WORDS, 8, () => { cur = sortWords(); return cur.words; }); S.targets = cur.words;
    const stage = h('div', { class: 'activity sortact' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const b = cur.board; const w = S.targets[S.r]; const inA = b.A.words.includes(w); let locked = false;
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word'); spk.classList.add('huge');
      const card = h('div', { class: 'sortcard' }, h('span', { class: 'bigword' }, w)); const st = starMark(w); if (st) card.append(st);
      const mk = (side) => { const g = b[side]; const bin = h('button', { class: 'sortbin ' + side, type: 'button', 'data-side': side, 'data-key': g.key, 'aria-label': 'Group: ' + g.name }, h('span', { class: 'bin-t' }, g.name), h('span', { class: 'bin-chips' }));
        bin.addEventListener('click', async () => {
          if (locked) return;
          if ((side === 'A') === inA) { locked = true; bin.classList.add('right'); status.textContent = 'Yes! ' + w; bin.querySelector('.bin-chips').append(h('span', { class: 'bchip' }, w)); await IR.ding(w); if (!S.ok()) return; await sleep(400); if (!S.ok()) return; S.advance(round); }
          else { bin.classList.remove('shake'); void bin.offsetWidth; bin.classList.add('shake'); status.textContent = 'Not that group. Try the other one.'; await IR.tryAgain(A.word(w)); }
        }); return bin; };
      const binA = mk('A'), binB = mk('B');
      /* keep the words already sorted in this round visible in their groups */
      S.targets.slice(0, S.r).forEach((x) => { (b.A.words.includes(x) ? binA : binB).querySelector('.bin-chips').append(h('span', { class: 'bchip' }, x)); });
      stage.innerHTML = ''; stage.append(S.head(), h('p', { class: 'sortask' }, b.ask), h('div', { class: 'sortrow' }, spk, card), h('div', { class: 'sortbins' }, binA, binB), status); IR.sayWord(w);
    }
    frame(app, { title: 'Word Sort', ...navFor('sort'), body: stage }); round();
  }

  /* ---- game 9: Sentence Fill-in (a short sentence is read to you with one word missing; tap the word that fits) ---- */
  
  function sentenceGame(app) {
    const S = session(app, 'sentence', FILL, ROUND.sentence); S.noun = 'Sentence'; const stage = h('div', { class: 'activity fillact' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    async function round() {
      const it = S.targets[S.r]; let locked = false; const cap = (x) => (it.pre ? x : x[0].toUpperCase() + x.slice(1)); const sq = 'audio/sq_' + it.id + '.mp3', sf = 'audio/sf_' + it.id + '.mp3';
      const spk = IR.speakerBtn(() => Snd.play(sq), 'Hear the sentence'); spk.classList.add('huge');
      const blank = h('span', { class: 'sblank', 'data-blank': '1' }, '');
      const punct = /^[!.?]/.test(it.post);
      const sent = h('p', { class: 'fillsent', 'data-id': it.id }, it.pre ? it.pre + ' ' : '', blank, punct ? '' : ' ', it.post);
      const opts = shuffle(it.choices.map((x) => x)); const row = h('div', { class: 'findgrid sentchoices' });
      opts.forEach((x) => { const b = wordCard(x, 'find'); b.addEventListener('click', async () => {
        if (locked || b.classList.contains('tried')) return;
        if (x === it.ans) { locked = true; b.classList.add('right'); blank.textContent = x; blank.classList.add('filled'); status.textContent = 'Yes! ' + it.text; await Snd.seq([A.sfx.ding, sf], 90); if (!S.ok()) return; await sleep(500); if (!S.ok()) return; S.advance(round); }
        else { b.classList.add('tried'); status.textContent = 'Not that one. Listen again.'; await Snd.seq([A.sfx.tryagain, sq], 150); } }); row.append(b); });
      stage.innerHTML = ''; stage.append(S.head(), spk, sent, row, status); Snd.play(sq);
    }
    frame(app, { title: 'Sentence Fill-in', ...navFor('sentence'), body: stage }); round();
  }

  /* ---- game 10: Trace and Say (trace the dotted word with a finger or the mouse, then hear it) ---- */
  function traceGame(app) {
    const S = session(app, 'trace', WORDS, ROUND.trace); const stage = h('div', { class: 'activity traceact' }); const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
    const W = 720, H = 260;
    async function round() {
      const w = S.targets[S.r]; let done = false; let drew = false; let last = null; let raf = 0;
      const spk = IR.speakerBtn(() => IR.sayWord(w), 'Hear the word'); spk.classList.add('huge');
      const mk = (cls) => h('canvas', { class: cls, width: W, height: H });
      const under = mk('tr-under'), ink = mk('tr-ink'), raw = document.createElement('canvas'); raw.width = W; raw.height = H; const mask = document.createElement('canvas'); mask.width = W; mask.height = H;
      const fam = getComputedStyle(document.body).fontFamily || 'Andika, sans-serif'; const px = Math.min(215, Math.floor(W * 0.9 / Math.max(2.2, w.length * 0.62)));
      const setFont = (c) => { c.font = '700 ' + px + 'px ' + fam; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; };
      const ty = Math.round(H / 2 + px * 0.34);
      let samples = [];
      const drawBase = () => {
        const u = under.getContext('2d'); u.clearRect(0, 0, W, H); setFont(u); u.fillStyle = '#FFF3D0'; u.fillText(w, W / 2, ty); u.setLineDash([2, 11]); u.lineCap = 'round'; u.lineWidth = 5; u.strokeStyle = '#7a6a3a'; u.strokeText(w, W / 2, ty);
        const m = mask.getContext('2d'); m.clearRect(0, 0, W, H); setFont(m); m.fillStyle = '#000'; m.fillText(w, W / 2, ty); m.lineWidth = 8; m.strokeStyle = '#000'; m.lineJoin = 'round'; m.strokeText(w, W / 2, ty);
        const d = mask.getContext('2d').getImageData(0, 0, W, H).data; samples = []; for (let y = 4; y < H; y += 6) for (let x = 4; x < W; x += 6) if (d[(y * W + x) * 4 + 3] > 200) samples.push([x, y]);
      };
      const paint = () => { const c = ink.getContext('2d'); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); c.drawImage(raw, 0, 0); c.globalCompositeOperation = 'destination-in'; c.drawImage(mask, 0, 0); c.globalCompositeOperation = 'source-over'; };
      const coverage = () => { const d = ink.getContext('2d').getImageData(0, 0, W, H).data; let n = 0; for (const [x, y] of samples) if (d[(y * W + x) * 4 + 3] > 40) n++; return samples.length ? n / samples.length : 0; };
      const bar = h('div', { class: 'tracebar', 'aria-hidden': 'true' }, h('span', { class: 'tracefill' }));
      const finish = async () => {
        if (done) return; done = true; cancelAnimationFrame(raf); bar.firstChild.style.width = '100%'; under.classList.add('solid'); ink.classList.add('solid'); status.textContent = 'You traced ' + w + '. Now say it!'; await IR.ding(w); if (!S.ok()) return; await sleep(1100); if (!S.ok()) return; S.advance(round);
      };
      const check = () => { raf = 0; const cv = coverage(); bar.firstChild.style.width = Math.min(100, Math.round(cv / 0.75 * 100)) + '%'; if (cv >= 0.75) finish(); };
      const pt = (e) => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
      const brush = (a, b) => { const c = raw.getContext('2d'); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 44; c.strokeStyle = '#2E9E6B'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); paint(); drew = true; clearBtn.disabled = false; doneBtn.disabled = false; if (!raf) raf = requestAnimationFrame(check); };
      ink.addEventListener('pointerdown', (e) => { if (done) return; e.preventDefault(); try { ink.setPointerCapture(e.pointerId); } catch (x) { /* synthetic events */ } last = pt(e); brush(last, last); });
      ink.addEventListener('pointermove', (e) => { if (done || !last) return; e.preventDefault(); const p = pt(e); brush(last, p); last = p; });
      const up = () => { last = null; if (!done && drew) setTimeout(check, 30); };
      ink.addEventListener('pointerup', up); ink.addEventListener('pointercancel', up);
      const clearBtn = h('button', { class: 'btn big', type: 'button', disabled: true, onclick: () => { if (done) return; raw.getContext('2d').clearRect(0, 0, W, H); paint(); drew = false; clearBtn.disabled = true; doneBtn.disabled = true; bar.firstChild.style.width = '0%'; status.textContent = '\u00a0'; } }, icon('replay'), 'Trace again');
      const doneBtn = h('button', { class: 'btn big primary', type: 'button', disabled: true, onclick: () => finish() }, icon('next'), 'I traced it');
      const box = h('div', { class: 'wtrace' }, under, ink);
      stage.innerHTML = ''; stage.append(S.head(), h('div', { class: 'spellrow top' }, spk, h('p', { class: 'small traceask' }, 'Trace the word with your finger. Then say it.')), box, bar, h('div', { class: 'spellrow' }, clearBtn, doneBtn), status);
      const go = () => { if (!S.ok()) return; drawBase(); paint(); IR._chestTrace = { W, H, samples, word: w, ink, coverage }; IR.sayWord(w); };
      if (document.fonts && document.fonts.load) document.fonts.load('700 40px Andika').then(go, go); else go();
    }
    frame(app, { title: 'Trace and Say', ...navFor('trace'), body: stage }); round();
  }
  let route = () => {};
  function render(hash, app) {
    route = () => { app.innerHTML = ''; render(location.hash, app); };
    const m = new RegExp('^#/chest' + N + '/(\\w+)').exec(hash); const g = m ? m[1] : null; if (g !== 'spell') spellPicked = null;
    if (g === 'flip') flip(app); else if (g === 'catch') catchGame(app); else if (g === 'find') findGame(app); else if (g === 'pop') popGame(app); else if (g === 'build') buildGame(app); else if (g === 'missing') missingGame(app); else if (g === 'spell') spellGame(app); else if (g === 'sort') sortGame(app); else if (g === 'sentence') sentenceGame(app); else if (g === 'trace') traceGame(app); else { IR.newScreen(); menu(app); }
  }
  return { render, WORDS, GAMES, checklist, ROUND, rounds };
  }
  /* Word Sort "Heart word (tricky part)" vs "Sound it out" (fully decodable with skills through Island 3: short vowels, digraphs, blends, ng/nk). Words that fit neither cleanly (e.g. long vowel or r-controlled) stay out of that board. */
  const H1 = ['of', 'give', 'live', 'put', 'some', 'were', 'know', 'other', 'people', 'water', 'word', 'walk', 'from'];
  const S1 = ['an', 'as', 'ask', 'had', 'has', 'him', 'his', 'if', 'just', 'let', 'stop', 'them', 'then', 'thank', 'think', 'when'];
  const H2 = ['again', 'any', 'could', 'every', 'once', 'through', 'great', 'goes', 'gave', 'read', 'means', 'years'];
  const S2 = ['best', 'end', 'fast', 'its', 'men', 'man', 'much', 'off', 'set', 'sit', 'such', 'us', 'sing', 'things'];
  const boxes = { 1: make(1, D.box1, D.fillin || [], H1, S1), 2: make(2, D.box2, D.fillin2 || [], H2, S2) };
  IR.chests = boxes;
  IR.chest = { render: (hash, app) => boxes[/^#\/chest2/.test(hash) ? 2 : 1].render(hash, app), checklist: () => h('div', null, boxes[1].checklist(), boxes[2].checklist()), WORDS: D.box1, GAMES: boxes[1].GAMES, ROUND: boxes[1].ROUND, rounds: boxes[1].rounds };
})();

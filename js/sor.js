/* Science-of-reading additions (Oct 31 2026): Ears-only warm-up + quick review (start of Meet ng), hear-it-spell-it (end of Build-a-Word),
   20-second breathing break (after Build-a-Word), heart-word mapping data, story questions + optional beat-your-own-time reread (Now You Read It).
   Folded into existing lessons by wrapping their run(); no new top-level screens. */
(function () {
  'use strict';
  const IR = window.IR;
  const { h, $$, sleep, shuffle, icon, Snd, A, sayWord, speakerBtn } = IR;
  const P = (id) => 'audio/p_sor_' + id + '.mp3';
  const SND = { b: 'audio/nk_l_b.mp3', a: 'audio/nk_l_a.mp3', w: 'audio/nk_l_w.mp3', i: 'audio/nk_l_i.mp3', ng: A.ng };
  const SOR = IR.SOR = {
    /* oral items: no letters on screen */
    ears: [
      { type: 'blend', sounds: ['w', 'i', 'ng'], word: 'wing', choices: ['wing', 'win', 'wig'] },
      { type: 'blend', sounds: ['b', 'a', 'ng'], word: 'bang', choices: ['bag', 'bang', 'ban'] },
      { type: 'seg', sounds: ['w', 'i', 'ng'], word: 'wing' },
      { type: 'seg', sounds: ['b', 'a', 'ng'], word: 'bang' }
    ],
    review: [
      { g: 'sh', key: 'ship' }, { g: 'ch', key: 'chip' }, { g: 'th', key: 'thing' }, { g: 'ck', key: 'sock' }, { g: 'u', key: 'mug' }
    ],
    spell: [
      { word: 'king', extra: ['a', 'm'] }, { word: 'song', extra: ['u', 't'] }, { word: 'hung', extra: ['i', 'p'] }
    ],
    /* heart words: [start, end) of the part to learn by heart, plus a one-line note */
    heart: {
      I: { t: [0, 1], note: 'I is a word all by itself. It says its name.' },
      to: { t: [1, 2], note: 't is regular. The o says /oo/.' },
      what: { t: [2, 3], note: 'wh and t are regular. The a says /u/.' },
      is: { t: [1, 2], note: 'i is regular. The s says /z/.' },
      the: { t: [2, 3], note: 'th is regular. The e says /u/.' },
      a: { t: [0, 1], note: 'When a is a word by itself, it often says /u/.' }
    },
    questions: [
      { q: 'Who swung up to the bell on a string?', a: 'Frill', audio: P('q1'), choices: [{ id: 'Zip', img: 'img/zipA.webp' }, { id: 'Frill', img: 'img/frillC.webp' }] },
      { q: 'What was stuck in the bell?', a: 'twigs and moss', audio: P('q2'), choices: [{ id: 'twigs and moss', img: 'img/ob_p4.jpg' }, { id: 'a ring thing', img: 'img/ob_p6.jpg' }, { id: 'Zip', img: 'img/zipA.webp' }] }
    ]
  };

  /* heart word with the tricky part marked */
  IR.heartWord = function (w) {
    const m = SOR.heart[w]; if (!m) return h('span', { class: 'word' }, w);
    return h('span', { class: 'word hw' }, w.slice(0, m.t[0]), h('span', { class: 'tricky' }, w.slice(m.t[0], m.t[1])), w.slice(m.t[1]));
  };

  const playSounds = async (list) => { Snd.stop(); const id = Snd.id; for (const s of list) { if (Snd.id !== id) return; await Snd.play(SND[s], { keep: true }); if (Snd.id !== id) return; await sleep(420); } };

  /* ---------- warm-up: Quick review only. The Ears-only items were removed Oct 31 2026 (the isolated sound audio was not good enough). ---------- */
  SOR.ears = [];
  function warmup(ctx, done) {
    const stage = ctx.stage; let step = 0; const N = SOR.ears.length + 1;
    ctx.showNav(true);
    const go = (k) => { Snd.stop(); step = k; if (step >= N) { done(); return; } render(); };
    ctx.setBack(() => { if (step > 0) { go(step - 1); return true; } return false; });
    ctx.setNext(() => { go(step + 1); return true; });
    function header(tag, title) { return h('div', { class: 'sor-head' }, h('span', { class: 'sor-tag' }, tag), h('h2', null, title)); }
    function render() {
      stage.innerHTML = ''; stage.scrollTop = 0; ctx.progress(step / (N + 4));
      if (step < SOR.ears.length) return ears(SOR.ears[step]);
      review();
    }
    function ears(it) {
      const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
      const wrap = h('div', { class: 'activity sor' }, header('Ears only \u00b7 ' + (step + 1) + ' of ' + SOR.ears.length, it.type === 'blend' ? 'Blend the sounds' : 'Count the sounds'));
      if (it.type === 'blend') {
        ctx.setInstr('Listen to the sounds. Which word do they make?', 'sor_ears');
        const hear = h('button', { class: 'btn big primary', type: 'button', onclick: () => playSounds(it.sounds) }, icon('speaker'), 'Hear the sounds');
        const dots = h('div', { class: 'sounddots', 'aria-hidden': 'true' }, ...it.sounds.map(() => h('i')));
        const grid = h('div', { class: 'earchoices' }); let locked = false;
        shuffle(it.choices).forEach((w, k) => {
          const b = h('button', { class: 'earcard', type: 'button', 'aria-label': 'Word ' + (k + 1) }, icon('speaker'), h('span', null, 'Word ' + (k + 1)));
          const pickBtn = h('button', { class: 'btn small pickit', type: 'button' }, 'This one');
          b.addEventListener('click', () => sayWord(w));
          pickBtn.addEventListener('click', async () => {
            if (locked) return;
            if (w === it.word) { locked = true; b.classList.add('right'); status.textContent = 'Yes! The sounds make ' + w + '.'; await IR.ding(w); if (ctx.scr.ok()) { await sleep(400); if (ctx.scr.ok()) go(step + 1); } }
            else { ctx.miss(); b.classList.add('tried'); status.textContent = 'Not that one. Hear the sounds again.'; await IR.tryAgain(); }
          });
          grid.append(h('div', { class: 'earcol' }, b, pickBtn));
        });
        wrap.append(dots, hear, grid, status, h('p', { class: 'small' }, 'Tap a card to hear the word. Then tap \u201cThis one.\u201d'));
        stage.append(wrap);
        Snd.seq([P('ears')], 200).then((ok) => { if (ok && ctx.scr.ok()) playSounds(it.sounds); });
      } else {
        ctx.setInstr('Listen to the word. Tap one box for each sound.', 'sor_seg');
        const hear = h('button', { class: 'btn big primary', type: 'button', onclick: () => sayWord(it.word) }, icon('speaker'), 'Hear the word');
        let n = 0;
        const boxes = h('div', { class: 'soundboxes' }, ...it.sounds.map((s, k) => {
          const b = h('button', { class: 'sbox', type: 'button', 'aria-label': 'Sound box ' + (k + 1) });
          b.addEventListener('click', async () => {
            if (k !== n) return; b.classList.add('on'); n++; await Snd.play(SND[s]);
            if (n === it.sounds.length && ctx.scr.ok()) { status.textContent = it.sounds.length + ' sounds!'; await sleep(300); await IR.ding(it.word); if (ctx.scr.ok()) { await sleep(400); if (ctx.scr.ok()) go(step + 1); } }
          });
          return b;
        }));
        wrap.append(hear, boxes, status, h('p', { class: 'small' }, 'Say the word slowly. Tap a box each time the sound changes.'));
        stage.append(wrap);
        Snd.seq([P('seg'), A.word(it.word)], 250);
      }
    }
    function review() {
      ctx.setInstr('Quick review. Say the sound, then tap the card to check.', 'sor_review');
      let seen = 0;
      const row = h('div', { class: 'revcards' }, ...SOR.review.map((r) => {
        const keyEl = h('span', { class: 'revkey' }, '\u00a0');
        const c = h('button', { class: 'revcard', type: 'button', 'aria-label': r.g + '. Tap to check.' }, h('span', { class: 'revg' }, r.g), keyEl);
        c.addEventListener('click', () => {
          if (!c.classList.contains('seen')) { seen++; ctx.progress((SOR.ears.length + 1 + 3 * seen / SOR.review.length) / (N + 4)); }
          c.classList.add('seen'); keyEl.innerHTML = '';
          const i = r.key.indexOf(r.g); keyEl.append(r.key.slice(0, i), h('b', null, r.g), r.key.slice(i + r.g.length));
          sayWord(r.key);
        });
        return c;
      }));
      const next = h('button', { class: 'btn big primary', type: 'button', onclick: () => go(step + 1) }, 'Start the lesson', icon('next'));
      stage.append(h('div', { class: 'activity sor' }, header('Quick review', 'Sounds you know'), row, next));
      Snd.play(P('review'));
    }
    render();
  }

  /* ---------- Hear it, spell it ---------- */
  function spelling(ctx) {
    return new Promise((resolve) => {
      const stage = ctx.stage; let r = 0;
      ctx.setInstr('Hear it, spell it. Tap the letters in order.', 'sor_spell');
      ctx.setNext(() => { Snd.stop(); r++; if (r < SOR.spell.length) round(); else resolve(); return true; });
      function round() {
        const R = SOR.spell[r]; stage.innerHTML = ''; let misses = 0; ctx.progress(0.6 + 0.4 * r / SOR.spell.length);
        const spk = speakerBtn(() => sayWord(R.word), 'Hear the word'); spk.classList.add('huge');
        const slotsEl = h('div', { class: 'slots spell' }); const bankEl = h('div', { class: 'bank' });
        const status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Spell ' + (r + 1) + ' of ' + SOR.spell.length);
        const letters = R.word.split('').concat(R.extra);
        const tiles = shuffle(letters.map((l, i) => ({ id: 'l' + i, text: l, cls: 'onset' })));
        IR.TileBoard({ tiles, nSlots: R.word.length, slotsEl, bankEl, onFull: async (texts, b) => {
          b.locked = true;
          if (texts.join('') === R.word) {
            slotsEl.classList.add('right'); status.textContent = 'Yes! ' + R.word; await IR.ding(R.word);
            if (!ctx.scr.ok()) return; await sleep(500); if (!ctx.scr.ok()) return;
            r++; if (r < SOR.spell.length) round(); else resolve();
          } else {
            misses++; ctx.miss(); slotsEl.classList.add('almost'); status.textContent = 'Almost. Say it slowly and try again.';
            await IR.tryAgain(A.word(R.word)); if (!ctx.scr.ok()) return;
            slotsEl.classList.remove('almost'); b.slots.fill(null); if (misses >= 2) b.hint = 'l0'; b.locked = false; b.render();
          }
        } });
        stage.append(h('div', { class: 'activity' }, h('div', { class: 'sor-head' }, h('span', { class: 'sor-tag' }, 'Hear it, spell it')), spk, slotsEl, bankEl, status));
        Snd.seq([P('spell'), A.word(R.word)], 250);
      }
      round();
    });
  }

  /* ---------- 20-second breathing break (skippable) ---------- */
  function breathe() {
    return new Promise((resolve) => {
      const left = h('b', null, '20'); const word = h('p', { class: 'breathword', 'aria-live': 'polite' }, 'Breathe in');
      let t = 20; let timer = 0;
      const finish = () => { clearInterval(timer); Snd.stop(); el.remove(); resolve(); };
      const el = h('div', { class: 'complete breakpop', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Breathing break' }, h('div', { class: 'cbox' },
        h('h1', null, 'Quick break'), h('div', { class: 'breathring', 'aria-hidden': 'true' }, h('i')), word,
        h('p', { class: 'small' }, left, ' seconds'),
        h('div', { class: 'row center' }, h('button', { class: 'btn big', type: 'button', onclick: finish }, 'Skip break'))));
      document.body.append(el); Snd.play(P('break'));
      timer = setInterval(() => { t--; left.textContent = String(Math.max(0, t)); word.textContent = (t % 8) >= 4 ? 'Breathe in' : 'Breathe out'; if (t <= 0) finish(); }, 1000);
    });
  }
  IR.sorBreak = breathe;

  /* ---------- 2 story questions ---------- */
  function questions(ctx) {
    return new Promise((resolve) => {
      const stage = ctx.stage; let q = 0; ctx.showNav(true);
      ctx.setInstr('Think about the story.', null);
      ctx.setBack(() => false);
      ctx.setNext(() => { Snd.stop(); q++; if (q < SOR.questions.length) ask(); else resolve(); return true; });
      function ask() {
        const Q = SOR.questions[q]; stage.innerHTML = ''; let locked = false;
        const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
        const grid = h('div', { class: 'picchoices' });
        Q.choices.forEach((c) => {
          const b = h('button', { class: 'picchoice', type: 'button' }, h('img', { src: c.img, alt: '' }), h('span', null, c.id));
          b.addEventListener('click', async () => {
            if (locked) return;
            if (c.id === Q.a) { locked = true; b.classList.add('right'); status.textContent = 'Yes!'; await IR.ding(); if (ctx.scr.ok()) { await sleep(500); if (ctx.scr.ok()) { q++; if (q < SOR.questions.length) ask(); else resolve(); } } }
            else { ctx.miss(); b.classList.add('tried'); status.textContent = 'Look back at the story. Try again.'; await IR.tryAgain(); }
          });
          grid.append(b);
        });
        stage.append(h('div', { class: 'activity sor' }, h('div', { class: 'sor-head' }, h('span', { class: 'sor-tag' }, 'Story check \u00b7 ' + (q + 1) + ' of ' + SOR.questions.length), h('h2', null, Q.q)),
          h('div', { class: 'row center' }, speakerBtn(() => Snd.play(Q.audio), 'Hear the question')), grid, status));
        Snd.play(Q.audio);
      }
      ask();
    });
  }

  /* ---------- optional "beat your own time" reread (shown from the 3rd read) ---------- */
  function timedRead(stage) {
    const S = IR.S(); S.fluency = S.fluency || { best: null, last: null };
    const box = h('div', { class: 'timedread' });
    function render() {
      box.innerHTML = '';
      const n = S.reads.story || 0;
      if (n < 2) { box.style.display = 'none'; return; }
      box.style.display = '';
      const best = S.fluency.best;
      const out = h('span', { class: 'tr-time', 'aria-live': 'polite' }, best ? 'Your best: ' + best + ' s' : 'Optional');
      const btn = h('button', { class: 'btn small', type: 'button' }, icon('play'), 'Time my read');
      let t0 = 0; let tick = 0;
      btn.addEventListener('click', () => {
        if (!t0) { t0 = Date.now(); btn.lastChild.textContent = 'Stop'; tick = setInterval(() => { out.textContent = Math.round((Date.now() - t0) / 1000) + ' s'; }, 250); return; }
        clearInterval(tick); const s = Math.round((Date.now() - t0) / 1000); t0 = 0; btn.lastChild.textContent = 'Time my read';
        const prev = S.fluency.best; S.fluency.last = s; if (!prev || s < prev) S.fluency.best = s; IR.save();
        out.textContent = s + ' s' + (prev ? (s < prev ? ' \u2014 faster than your best (' + prev + ' s)!' : ' \u2014 your best is ' + prev + ' s') : ' \u2014 your first time');
      });
      box.append(h('span', { class: 'tr-lab' }, 'Beat your own time'), btn, out, h('p', { class: 'small' }, 'Read smooth, not rushed. You only race yourself.'));
    }
    render();
    return { el: box, render };
  }

  /* ---------- wire into the existing lessons ---------- */
  const L = (id) => IR.LESSONS.find((x) => x.id === id);
  const intro = L('intro'); const introRun = intro.run;
  intro.run = function (ctx) { warmup(ctx, () => { if (!ctx.scr.ok()) return; ctx.stage.innerHTML = ''; ctx.setInstr('', null); ctx.setNext(null); introRun.call(this, ctx); }); };

  const build = L('build'); const buildRun = build.run;
  build.run = function (ctx) {
    const c2 = Object.create(ctx);
    c2.progress = (f) => ctx.progress(f * 0.6);
    c2.finish = async () => { await spelling(ctx); if (!ctx.scr.ok()) return; await breathe(); if (ctx.scr.ok()) ctx.finish(); };
    buildRun.call(this, c2);
  };

  const story = L('story'); const storyRun = story.run;
  story.run = function (ctx) {
    const c2 = Object.create(ctx);
    c2.finish = async () => { await questions(ctx); if (ctx.scr.ok()) ctx.finish(); };
    storyRun.call(this, c2);
    const tr = timedRead(ctx.stage); const act = ctx.stage.querySelector('.activity.story'); if (act) act.append(tr.el);
    ctx.stage.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.btn.good')) setTimeout(tr.render, 0); });
  };
})();

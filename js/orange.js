/* Unit 3 orange bell update (Oct 31 2026): orange accents for the ng lesson, "Make the bell ring" (replaces Fish Pond),
   new mascots (Zip A, Frill C) in this lesson. Loaded after sor.js, before screens.js. */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $$, sleep, shuffle, colorWord, icon, Snd, A, sayWord } = IR;
  const ORANGE = ['#C95A10', '#E8731C', '#D9631A', '#B85410', '#E07B22', '#CC6A14', '#BF5E12', '#D46A1A'];
  IR.LESSONS.forEach((L, i) => { L.color = ORANGE[i % ORANGE.length]; });
  const L = (id) => IR.LESSONS.find((x) => x.id === id);
  L('listen').blurb = 'Heart words, then the bell story';
  L('story').blurb = 'Read the bell story, then read it 3 times';

  const bells = {
    id: 'bells', title: 'Make the bell ring', blurb: 'Read a bell word, light the bell', color: '#E8731C',
    run(ctx) {
      const stage = ctx.stage; const words = D.bells || ['ring', 'bang', 'sing', 'gong', 'clang'];
      const order = shuffle(words); let r = 0; const lit = new Set();
      ctx.setInstr('Read the word out loud. Then tap the bell with the same word.', 'p_bells');
      const row = h('div', { class: 'bellrow' });
      const bellEls = {};
      words.forEach((w) => {
        const b = h('button', { class: 'bellbtn', type: 'button', 'aria-label': 'Bell: ' + w },
          h('img', { src: 'img/bell_unlit.png', alt: '' }), h('span', null, w));
        b.addEventListener('click', () => tapBell(w, b));
        bellEls[w] = b; row.append(b);
      });
      const card = h('div', { class: 'bellcard' });
      const hint = h('p', { class: 'small' }, 'ng is glued: say it as one sound.');
      const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
      const hear = h('button', { class: 'btn big', type: 'button', onclick: () => sayWord(order[r]) }, icon('speaker'), 'Hear it');
      stage.append(h('div', { class: 'activity bellgame' },
        h('div', { class: 'bellscene', style: 'background-image:url(img/ob_scene.jpg)' }), row, card, hint, h('div', { class: 'row center' }, hear), status));
      function show() {
        ctx.progress(lit.size / words.length); card.innerHTML = ''; card.append(h('span', { class: 'bigword' }, colorWord(order[r])));
        status.textContent = '\u00a0';
      }
      async function tapBell(w, b) {
        if (lit.has(w)) { sayWord(w); return; }
        if (w !== order[r]) { ctx.miss(); b.classList.add('nudge'); setTimeout(() => b.classList.remove('nudge'), 500); status.textContent = 'Look again. Find the bell that says ' + order[r] + '.'; await IR.tryAgain(); return; }
        lit.add(w); b.classList.add('lit'); b.querySelector('img').src = 'img/bell_lit.png'; status.textContent = w + '! The bell lights up.';
        await IR.ding(w); if (!ctx.scr.ok()) return;
        r++;
        if (r >= order.length) { ctx.progress(1); status.textContent = 'All the bells are lit!'; await Snd.play(A.sfx.gong); if (ctx.scr.ok()) ctx.finish(); return; }
        await sleep(300); if (ctx.scr.ok()) show();
      }
      ctx.setNext(() => { if (r < order.length - 1) { Snd.stop(); r++; show(); return true; } return false; });
      show(); Snd.seq([A.prompt('p_bells')], 100);
    }
  };
  const fi = IR.LESSONS.findIndex((x) => x.id === 'fish');
  if (fi >= 0) IR.LESSONS.splice(fi, 1, bells);
})();

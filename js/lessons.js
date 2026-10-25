/* Mini lessons 1-4: Meet ng, Hear and Pick, Fish Pond, Build-a-Word */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $, $$, sleep, shuffle, pick, colorWord, icon, Snd, A, GOOD, say, sayWord, speakerBtn, CHUNK_COLORS } = IR;
  const LESSONS = (IR.LESSONS = []);
  const goodSound = () => say(pick(GOOD));
  const calm = () => document.body.classList.contains('calm') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- 1. Meet ng (Zip and Frill) ---------- */
  LESSONS.push({
    id: 'intro', title: 'Meet ng', blurb: 'Zip and Frill glue n and g', color: '#1FA6A6',
    run(ctx) {
      const stage = ctx.stage; ctx.setInstr('', null);
      const beats = [
        { who: 'zip', p: 'i1', show: 'apart' }, { who: 'frill', p: 'i2', show: 'apart' },
        { who: 'zip', p: 'i3', show: 'glue' }, { who: 'frill', p: 'i4', show: 'say' },
        { who: 'zip', p: 'i5', show: 'hum' }, { who: 'frill', p: 'i6', show: 'chips' }, { who: 'zip', p: 'i7', show: 'go' }
      ];
      let i = 0;
      const bubble = h('div', { class: 'bubble' });
      const visual = h('div', { class: 'visual' });
      const zip = h('img', { class: 'char zip', src: 'img/zip.webp', alt: 'Zip the gecko inventor' });
      const frill = h('img', { class: 'char frill', src: 'img/frill.webp', alt: 'Frill the nudibranch' });
      const nextBtn = h('button', { class: 'btn big', type: 'button' }, 'Next', icon('next'));
      const wrap = h('div', { class: 'intro' }, bubble, visual, h('div', { class: 'chars' }, zip, frill), h('div', { class: 'intro-actions' }, nextBtn));
      stage.append(wrap);

      const ngPill = (joined) => h('div', { class: 'ngpill' + (joined ? ' joined' : '') },
        h('span', { class: 'l n' }, 'n'), h('span', { class: 'l g' }, 'g'));

      async function show() {
        const b = beats[i]; ctx.progress(i / beats.length);
        const pr = D.prompts[b.p];
        bubble.className = 'bubble ' + b.who;
        bubble.innerHTML = '';
        bubble.append(h('b', { class: 'who' }, b.who === 'zip' ? 'Zip' : 'Frill'), h('p', null, pr.text),
          speakerBtn(() => playBeat(b), 'Hear this again'));
        zip.classList.toggle('speaking', b.who === 'zip'); frill.classList.toggle('speaking', b.who === 'frill');
        visual.innerHTML = '';
        if (b.show === 'apart') visual.append(ngPill(false));
        if (b.show === 'glue') { const p = ngPill(false); visual.append(p, h('p', { class: 'cap' }, 'n + g = one sound')); setTimeout(() => p.classList.add('joined'), 900); }
        if (b.show === 'say') visual.append(ngPill(true), h('button', { class: 'btn', type: 'button', onclick: () => Snd.play(A.ng) }, icon('speaker'), 'Hear it'));
        if (b.show === 'hum') {
          const p = ngPill(true); p.classList.add('hum');
          visual.append(p, h('button', { class: 'btn', type: 'button', onclick: () => { p.classList.add('buzz'); Snd.play(A.ng).then(() => p.classList.remove('buzz')); } }, icon('speaker'), 'Hum it with me'));
        }
        if (b.show === 'chips') {
          const row = h('div', { class: 'chips' });
          D.introWords.forEach((w) => row.append(h('button', { class: 'chip', type: 'button', onclick: (e) => { e.currentTarget.classList.add('seen'); sayWord(w); } }, colorWord(w))));
          visual.append(row);
        }
        if (b.show === 'go') visual.append(h('button', { class: 'btn ghost', type: 'button', onclick: () => IR.openCartoon() }, icon('play'), 'Watch the Zip and Frill cartoon (optional)'));
        nextBtn.firstChild.textContent = i === beats.length - 1 ? "Let's practice" : 'Next';
        playBeat(b);
      }
      async function playBeat(b) {
        const list = [A.prompt(b.p)]; if (b.show === 'say') list.push(A.ng);
        await Snd.seq(list, 250);
      }
      nextBtn.addEventListener('click', () => { if (i < beats.length - 1) { i++; show(); } else { Snd.stop(); ctx.progress(1); ctx.finish(); } });
      show();
    }
  });

  /* ---------- 2. Hear and Pick ---------- */
  LESSONS.push({
    id: 'hear', title: 'Hear and Pick', blurb: 'Listen, then tap the word', color: '#7E57C2',
    run(ctx) {
      ctx.setInstr('Listen. Tap the word you hear.', 'p_hear');
      const rounds = D.hear; let r = 0;
      const stage = ctx.stage;
      async function round() {
        const R = rounds[r]; ctx.progress(r / rounds.length);
        stage.innerHTML = '';
        let misses = 0; let locked = false;
        const spk = speakerBtn(() => sayWord(R.word), 'Hear the word'); spk.classList.add('huge');
        const grid = h('div', { class: 'choices' });
        const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
        shuffle(R.choices).forEach((w) => {
          const b = h('button', { class: 'choice', type: 'button', 'data-w': w }, w);
          b.addEventListener('click', async () => {
            if (locked || b.classList.contains('tried')) return;
            if (w === R.word) {
              locked = true; b.classList.add('right'); b.innerHTML = ''; b.append(colorWord(w), icon('check'));
              $$('.choice', grid).forEach((o) => { if (o !== b) o.classList.add('fade'); });
              status.textContent = 'Yes! ' + w;
              await Snd.seq([A.word(w), A.prompt(pick(GOOD))], 150);
              if (!ctx.scr.ok()) return;
              await sleep(500); if (!ctx.scr.ok()) return;
              r++; if (r < rounds.length) round(); else { ctx.progress(1); ctx.finish(); }
            } else {
              misses++; ctx.miss(); b.classList.add('tried'); status.textContent = 'Not that one. Listen again.';
              await Snd.seq([A.prompt('again'), A.word(R.word)], 150);
              if (misses >= 2) $$('.choice', grid).forEach((o) => { if (o.dataset.w === R.word) o.classList.add('hint'); });
            }
          });
          grid.append(b);
        });
        stage.append(h('div', { class: 'activity' }, spk, grid, status));
        sayWord(R.word);
      }
      round();
    }
  });

  /* ---------- 3. Fish Pond: tap the ng fish ---------- */
  LESSONS.push({
    id: 'fish', title: 'Fish Pond', blurb: 'Catch the fish with ng', color: '#1F8FD6',
    run(ctx) {
      ctx.setInstr('Tap the fish that have the ng hum.', 'p_fish');
      const need = D.fish.need; let caught = 0;
      const stage = ctx.stage;
      const words = shuffle(D.fish.ng.map((w) => ({ w, ng: true })).concat(D.fish.other.map((w) => ({ w, ng: false }))));
      const status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Tap a fish to hear its word.');
      const counter = h('div', { class: 'catchcount' }, icon('bucket'), h('b', null, '0'), ' of ' + need + ' ng fish');
      const pond = h('div', { class: 'pond' });
      const pauseBtn = h('button', { class: 'btn small', type: 'button' }, icon('pause'), 'Pause fish');
      pauseBtn.addEventListener('click', () => {
        const p = pond.classList.toggle('paused'); pauseBtn.innerHTML = '';
        pauseBtn.append(icon(p ? 'play' : 'pause'), p ? 'Swim again' : 'Pause fish');
      });
      const hues = ['#F6A15A', '#4DB6AC', '#F26E86', '#8E7CC3', '#F2C14E', '#5BA7E5'];
      const lanes = 5;
      words.forEach((f, idx) => {
        const lane = idx % lanes;
        const fish = h('button', { class: 'fish', type: 'button', 'data-w': f.w, 'aria-label': 'fish with the word ' + f.w },
          '');
        fish.innerHTML = '<svg class="fishsvg" viewBox="0 0 200 110" aria-hidden="true"><path d="M170 55 L198 28 Q190 55 198 82Z" fill="' + hues[idx % hues.length] + '"/><ellipse cx="95" cy="55" rx="85" ry="46" fill="' + hues[idx % hues.length] + '"/><path d="M60 14 Q95 -2 130 14 Q95 22 60 14Z" fill="#00000022"/><circle cx="38" cy="42" r="8" fill="#fff"/><circle cx="36" cy="42" r="4" fill="#2b2540"/><path d="M26 66 Q36 74 46 66" stroke="#2b2540" stroke-width="3" fill="none" stroke-linecap="round"/></svg><span class="fw">' + f.w + '</span>';
        fish.style.setProperty('--lane', lane);
        const dur = 30 + lane * 3.5; const round = Math.floor(idx / lanes);
        fish.style.setProperty('--dur', dur + 's');
        fish.style.setProperty('--delay', '-' + (dur * (0.5 * round + lane * 0.13)).toFixed(1) + 's');
        fish.style.top = (2 + lane * 19) + '%';
        fish.addEventListener('click', async () => {
          if (fish.classList.contains('caught')) return;
          if (f.ng) {
            fish.classList.add('caught'); caught++; counter.querySelector('b').textContent = caught;
            status.textContent = 'Yes! ' + f.w + ' has ng.'; ctx.progress(caught / need);
            const done = caught >= need;
            await Snd.seq([A.word(f.w), done ? A.prompt('fishdone') : A.prompt(pick(GOOD))], 150);
            if (!ctx.scr.ok()) return;
            if (done) { await sleep(500); if (ctx.scr.ok()) ctx.finish(); }
          } else {
            ctx.miss(); fish.classList.add('wiggle'); setTimeout(() => fish.classList.remove('wiggle'), 800);
            status.textContent = f.w + ': no ng hum in that one. Keep looking!';
            await Snd.seq([A.word(f.w), A.prompt('nohum')], 150);
          }
        });
        pond.append(fish);
      });
      stage.append(h('div', { class: 'activity fishgame' }, h('div', { class: 'fishhead' }, counter, pauseBtn), pond, status));
      Snd.seq([A.prompt('p_fish')], 100);
    }
  });

  /* ---------- 4. Build-a-Word ---------- */
  LESSONS.push({
    id: 'build', title: 'Build-a-Word', blurb: 'Glue tiles into a word', color: '#E8603C',
    run(ctx) {
      ctx.setInstr('Listen. Build the word with the tiles.', 'p_build');
      const rounds = D.build; let r = 0; const stage = ctx.stage;
      function round() {
        const R = rounds[r]; ctx.progress(r / rounds.length); stage.innerHTML = '';
        let misses = 0;
        const spk = speakerBtn(() => sayWord(R.word), 'Hear the word'); spk.classList.add('huge');
        const slotsEl = h('div', { class: 'slots' }); const bankEl = h('div', { class: 'bank' });
        const status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Tap or drag tiles into the boxes.');
        const mk = (id, text, kind) => ({ id, text, cls: kind, style: kind === 'chunk' ? 'color:' + CHUNK_COLORS[text] + ';border-color:' + CHUNK_COLORS[text] : '' });
        const tiles = shuffle([mk('o1', R.onset, 'onset'), mk('o2', R.altOnset, 'onset'), mk('c1', R.chunk, 'chunk'), mk('c2', R.altChunk, 'chunk')]);
        const board = IR.TileBoard({
          tiles, nSlots: 2, slotsEl, bankEl,
          onFull: async (texts, b) => {
            b.locked = true;
            if (texts.join('') === R.word) {
              status.textContent = 'Yes! ' + R.word;
              slotsEl.classList.add('right');
              await Snd.seq([A.word(R.word), A.prompt(pick(GOOD))], 150);
              if (!ctx.scr.ok()) return; await sleep(500); if (!ctx.scr.ok()) return;
              r++; if (r < rounds.length) round(); else { ctx.progress(1); ctx.finish(); }
            } else {
              misses++; ctx.miss(); status.textContent = 'Almost! Listen again and try again.';
              slotsEl.classList.add('almost');
              await Snd.seq([A.prompt('again'), A.word(R.word)], 150);
              if (!ctx.scr.ok()) return;
              slotsEl.classList.remove('almost'); b.slots.fill(null);
              if (misses >= 2) b.hint = 'o1';
              b.locked = false; b.render();
            }
          }
        });
        stage.append(h('div', { class: 'activity' }, spk, slotsEl, bankEl, status));
        sayWord(R.word);
      }
      round();
    }
  });
})();

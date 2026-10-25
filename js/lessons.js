/* Mini lessons 1-5: Meet ng (sound first), Story Time (listen only), Hear and Pick, Fish Pond, Build-a-Word */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $, $$, sleep, shuffle, pick, colorWord, icon, Snd, A, sayWord, speakerBtn, CHUNK_COLORS } = IR;
  const LESSONS = (IR.LESSONS = []);
  const calm = () => document.body.classList.contains('calm') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);


  /* ---------- 1. Meet ng (Zip and Frill) ---------- */
  LESSONS.push({
    id: 'intro', title: 'Meet ng', blurb: 'Zip and Frill glue n and g', color: '#1FA6A6',
    run(ctx) {
      const stage = ctx.stage; ctx.setInstr('', null);
      /* Order: the SOUND first (hear it, mouth cue, hum), then the vowel + ng idea (ang, ing, ong, ung), and only then words. */
      const beats = [
        { who: 'zip', p: 'i1', show: 'apart' }, { who: 'frill', p: 'i2', show: 'apart' },
        { who: 'zip', p: 'i3', show: 'glue' }, { who: 'frill', p: 'i4', show: 'say' },
        { who: 'zip', p: 'i5b', show: 'mouth' }, { who: 'zip', p: 'i5', show: 'hum' },
        { who: 'frill', p: 'v1', show: 'vowels' }, { who: 'frill', p: 's1', show: 'swords' },
        { who: 'frill', p: 'i6', show: 'chips' }, { who: 'zip', p: 'i7', show: 'go' }
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

      const mouthPic = () => h('div', { class: 'mouthpic' }, h('div', { html:
        '<svg viewBox="0 0 300 190" role="img" aria-label="Side view of a head. The back of the tongue lifts up to the soft roof of the mouth and the sound hums out of the nose.">' +
        '<path d="M30 92 Q30 18 110 18 L196 18 Q232 18 238 44 L264 64 Q272 72 252 78 L250 100 Q256 112 242 118 L240 134 Q236 176 188 176 L92 176 Q30 172 30 92Z" fill="#FFE7D1" stroke="#2B2540" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="M238 120 L136 108 Q92 102 88 140" fill="none" stroke="#2B2540" stroke-width="4.5" stroke-linecap="round"/>' +
        '<path d="M232 146 Q190 156 150 150 Q118 142 106 116 Q90 122 88 148 L88 164 L232 164Z" fill="#F4727F" stroke="#2B2540" stroke-width="4.5" stroke-linejoin="round"/>' +
        '<circle cx="104" cy="114" r="9" fill="#FFD84D" stroke="#2B2540" stroke-width="3"/>' +
        '<path d="M196 70 Q214 54 244 60" fill="none" stroke="#1FA6A6" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 10"/>' +
        '<path d="M276 58 q10 6 0 12 M288 52 q14 12 0 24" fill="none" stroke="#1FA6A6" stroke-width="5" stroke-linecap="round"/></svg>' }),
        h('p', { class: 'cap' }, 'The back of the tongue lifts up. The hum goes out the nose.'));

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
        if (b.show === 'mouth') {
          visual.append(mouthPic(), h('button', { class: 'btn', type: 'button', onclick: () => Snd.play(A.ng) }, icon('speaker'), 'Hear the ng sound'));
        }
        if (b.show === 'vowels' || b.show === 'swords') {
          const sw = b.show === 'swords';           /* vowels: a/i/o/u + ng -> ang ing ong ung;  swords: s + ang/ing/ong/ung -> sang sing song sung */
          const row = h('div', { class: 'vtiles' + (sw ? ' swordrow' : '') });
          const play = (c) => (sw ? A.word('s' + c) : A.chunk(c));
          D.chunks.forEach((c) => {
            const col = IR.CHUNK_COLORS[c];
            row.append(h('button', { class: 'vtile' + (sw ? ' stile' : ''), type: 'button', style: 'border-color:' + col, 'aria-label': sw ? 's' + c : c, onclick: (e) => {
              const el = e.currentTarget; el.classList.add('seen', 'pop'); setTimeout(() => el.classList.remove('pop'), 500);
              Snd.play(play(c));
            } }, sw ? [h('span', { class: 'vv', style: 'color:#2B2540' }, 's'), h('span', { class: 'vv', style: 'color:' + col }, c[0]), h('span', { class: 'vng' }, 'ng'), h('span', { class: 'vsum' }, 's' + c)]
                    : [h('span', { class: 'vv', style: 'color:' + col }, c[0]), h('span', { class: 'vng' }, 'ng'), h('span', { class: 'vsum' }, c)]));
          });
          const chant = h('button', { class: 'btn', type: 'button', onclick: async () => {
            Snd.stop(); const id = Snd.id; const tiles = $$('.vtile', row);
            for (let k = 0; k < D.chunks.length; k++) {      /* slow chant: one clear sound at a time, 480 ms gap, the matching tile lights up */
              if (Snd.id !== id) return; tiles.forEach((t) => t.classList.remove('lit')); tiles[k].classList.add('lit', 'seen');
              await Snd.play(play(D.chunks[k]), { keep: true }); if (Snd.id !== id) return; await sleep(480);
            }
            tiles.forEach((t) => t.classList.remove('lit'));
          } }, icon('speaker'), sw ? 'Hear them in a row' : 'Hear them slowly');
          visual.append(row, chant);
        }
        if (b.show === 'chips') {
          const row = h('div', { class: 'chips' });
          D.mixWords.forEach((w) => row.append(h('button', { class: 'chip', type: 'button', onclick: (e) => { e.currentTarget.classList.add('seen'); sayWord(w); } }, colorWord(w))));
          visual.append(row);
        }
        if (b.show === 'go') visual.append(h('button', { class: 'btn ghost', type: 'button', onclick: () => IR.openCartoon() }, icon('play'), 'Watch the Zip and Frill cartoon (optional)'));
        nextBtn.firstChild.textContent = i === beats.length - 1 ? 'Story time' : 'Next';
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

  /* ---------- 2. Story Time: heart-word peek, then the comic in listen-only mode ---------- */
  LESSONS.push({
    id: 'listen', title: 'Story Time', blurb: 'Hear heart words, then listen to the comic', color: '#8E5BD6',
    run(ctx) {
      const stage = ctx.stage; ctx.setInstr('', null);
      /* part A: heart-word peek (tap to hear, nothing to answer) */
      function heartPeek() {
        ctx.progress(0); stage.innerHTML = '';
        ctx.setInstr('Tap each heart word to hear it.', 'p_listen1');
        const seen = new Set();
        const go = h('button', { class: 'btn big primary', type: 'button' }, 'Listen to the story', icon('next'));
        const row = h('div', { class: 'hearts' });
        D.heart.forEach((it) => {
          row.append(h('button', { class: 'heartchip', type: 'button', onclick: (e) => {
            e.currentTarget.classList.add('seen'); seen.add(it.w); ctx.progress(0.4 * seen.size / D.heart.length);
            Snd.seq([A.word(it.w), 'audio/hx_' + it.w + '.mp3'], 200);
          } }, h('span', { class: 'heartmark', 'aria-hidden': 'true' }, '\u2665'), h('span', { class: 'word' }, it.w)));
        });
        go.addEventListener('click', () => { Snd.stop(); storyListen(); });
        stage.append(h('div', { class: 'activity' }, h('p', { class: 'bigprompt' }, 'Heart words'), row, h('div', { class: 'row center' }, go)));
        Snd.seq([A.prompt('p_listen1')], 100);
      }
      /* part B: the comic, read aloud. The child only listens and follows the highlight. */
      function storyListen() {
        stage.innerHTML = ''; ctx.setInstr('Listen to the story and follow along.', 'p_listen2');
        const pages = D.story; let p = 0; let auto = true; let token = 0; let finished = false;
        const picEl = h('img', { class: 'panel', alt: '' });
        const sentEl = h('p', { class: 'sentence', 'aria-live': 'polite' });
        const dots = h('div', { class: 'pagedots' }, ...pages.map(() => h('i')));
        const prev = h('button', { class: 'btn small', type: 'button' }, icon('back'), 'Back');
        const toggle = h('button', { class: 'btn small', type: 'button' }, icon('pause'), 'Pause');
        const next = h('button', { class: 'btn small primary', type: 'button' }, 'Next', icon('next'));
        const setToggle = () => { toggle.innerHTML = ''; toggle.append(icon(auto ? 'pause' : 'play'), auto ? 'Pause' : 'Keep listening'); };
        function setPage(i) {
          p = i; const pg = pages[p]; picEl.src = pg.img; sentEl.innerHTML = '';
          pg.words.forEach((w, k) => sentEl.append(h('span', { class: 'w', 'data-k': k }, w), ' '));
          $$('i', dots).forEach((d, k) => { d.classList.toggle('cur', k === p); d.classList.toggle('seen', k <= p); });
          prev.disabled = p === 0; next.firstChild.textContent = p === pages.length - 1 ? 'Finish' : 'Next';
          ctx.progress(0.4 + 0.6 * p / (pages.length - 1));
        }
        function playPage() {
          const pg = pages[p]; const ws = $$('.w', sentEl);
          return Snd.play('audio/s_' + pg.n + '.mp3', { onTime: (t) => {
            pg.t.forEach((tt, k) => { const el = ws[k]; if (!el) return; el.classList.toggle('hl', t >= tt[0] - 0.04 && t < (pg.t[k + 1] ? pg.t[k + 1][0] - 0.04 : 99)); el.classList.toggle('read', t >= tt[1]); });
          } }).then((ok) => { ws.forEach((e) => e.classList.remove('hl', 'read')); return ok; });
        }
        async function run() {          /* auto-advance read-aloud from the current page */
          const my = ++token;
          while (auto && my === token && ctx.scr.ok()) {
            await playPage(); if (my !== token || !auto || !ctx.scr.ok()) return;
            await sleep(500); if (my !== token || !auto || !ctx.scr.ok()) return;
            if (p < pages.length - 1) setPage(p + 1); else { await end(); return; }
          }
        }
        async function end() {
          if (finished) return; finished = true; token++; auto = false; Snd.stop(); ctx.progress(1);
          await sleep(500); if (ctx.scr.ok()) ctx.finish();
        }
        prev.addEventListener('click', () => { if (p > 0) { token++; Snd.stop(); setPage(p - 1); if (auto) run(); else playPage(); } });
        next.addEventListener('click', () => { if (p < pages.length - 1) { token++; Snd.stop(); setPage(p + 1); if (auto) run(); else playPage(); } else end(); });
        toggle.addEventListener('click', () => { auto = !auto; setToggle(); if (auto) run(); else { token++; Snd.stop(); } });
        stage.append(h('div', { class: 'activity story listenmode' },
          h('div', { class: 'panelwrap' }, picEl), h('div', { class: 'sentrow' }, sentEl), dots, h('div', { class: 'row' }, prev, toggle, next)));
        setPage(0); setToggle();
        Snd.seq([A.prompt('p_listen2')], 200).then(() => { if (ctx.scr.ok() && auto) run(); });
      }
      heartPeek();
    }
  });

  /* ---------- 3. Hear and Pick ---------- */
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
              await IR.ding(w);
              if (!ctx.scr.ok()) return;
              await sleep(500); if (!ctx.scr.ok()) return;
              r++; if (r < rounds.length) round(); else { ctx.progress(1); ctx.finish(); }
            } else {
              misses++; ctx.miss(); b.classList.add('tried'); status.textContent = 'Not that one. Listen again.';
              await IR.tryAgain(A.word(R.word));
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

  /* ---------- 4. Fish Pond: tap the ng fish ---------- */
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
        fish.innerHTML = '<span class="fishbody"><svg class="fishsvg" viewBox="0 0 200 110" aria-hidden="true"><path d="M170 55 L198 28 Q190 55 198 82Z" fill="' + hues[idx % hues.length] + '"/><ellipse cx="95" cy="55" rx="85" ry="46" fill="' + hues[idx % hues.length] + '"/><path d="M60 14 Q95 -2 130 14 Q95 22 60 14Z" fill="#00000022"/><circle cx="38" cy="42" r="8" fill="#fff"/><circle cx="36" cy="42" r="4" fill="#2b2540"/><path d="M26 66 Q36 74 46 66" stroke="#2b2540" stroke-width="3" fill="none" stroke-linecap="round"/></svg></span><span class="fw">' + f.w + '</span>';
        fish.style.setProperty('--lane', lane);
        /* fish swim back and forth inside the pond; the sprite faces left in the art, so it is mirrored while it swims right */
        const dur = 15 + lane * 2.4; const round = Math.floor(idx / lanes); const rev = lane % 2 === 1;
        fish.classList.toggle('rev', rev);
        fish.style.setProperty('--dur', dur + 's');
        fish.style.setProperty('--delay', '-' + ((dur * 2) * ((0.31 * round + lane * 0.19 + 0.07) % 1)).toFixed(2) + 's');
        fish.style.top = (2 + lane * 19) + '%';
        fish.addEventListener('click', async () => {
          if (fish.classList.contains('caught')) return;
          if (f.ng) {
            fish.classList.add('caught'); caught++; counter.querySelector('b').textContent = caught;
            status.textContent = 'Yes! ' + f.w + ' has ng.'; ctx.progress(caught / need);
            const done = caught >= need;
            await IR.ding(f.w);
            if (!ctx.scr.ok()) return;
            if (done) { await sleep(500); if (ctx.scr.ok()) ctx.finish(); }
          } else {
            ctx.miss(); fish.classList.add('wiggle'); setTimeout(() => fish.classList.remove('wiggle'), 800);
            status.textContent = f.w + ': no ng hum in that one. Keep looking!';
            await IR.tryAgain(A.word(f.w));
          }
        });
        pond.append(fish);
      });
      stage.append(h('div', { class: 'activity fishgame' }, h('div', { class: 'fishhead' }, counter, pauseBtn), pond, status));
      Snd.seq([A.prompt('p_fish')], 100);
    }
  });

  /* ---------- 5. Build-a-Word ---------- */
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
              await IR.ding(R.word);
              if (!ctx.scr.ok()) return; await sleep(500); if (!ctx.scr.ok()) return;
              r++; if (r < rounds.length) round(); else { ctx.progress(1); ctx.finish(); }
            } else {
              misses++; ctx.miss(); status.textContent = 'Almost! Listen again and try again.';
              slotsEl.classList.add('almost');
              await IR.tryAgain(A.word(R.word));
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

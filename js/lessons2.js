/* Mini lessons 6-8: Trace Trail, Sentence Bridge, Now You Read It (comic). Heart words now live in Story Time (lesson 1). */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $, $$, sleep, shuffle, pick, colorWord, icon, Snd, A, GOOD, say, sayWord, speakerBtn, CHUNK_COLORS } = IR;
  const LESSONS = IR.LESSONS;

  /* ---------- 5. Trace Trail ---------- */
  LESSONS.push({
    id: 'trace', title: 'Trace Trail', blurb: 'Trace n and g with your finger', color: '#D98E00',
    run(ctx) {
      ctx.setInstr('Trace the n and the g with your finger.', 'p_trace');
      const W = 900, H = 440, FS = 340, BRUSH = 34;
      const guide = h('canvas', { class: 'cv guide', width: W, height: H });
      const ink = h('canvas', { class: 'cv ink', width: W, height: H, 'aria-label': 'Trace the letters ng here', role: 'img' });
      const box = h('div', { class: 'tracebox' }, guide, ink);
      const meter = h('div', { class: 'meter' }, h('i'));
      const status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Start with n, then g. Use your finger or the mouse.');
      const clear = h('button', { class: 'btn small', type: 'button' }, 'Start over');
      const doneBtn = h('button', { class: 'btn small primary', type: 'button' }, icon('check'), 'I traced it');
      ctx.stage.append(h('div', { class: 'activity' }, box, meter, status, h('div', { class: 'row' }, clear, doneBtn)));

      const gctx = guide.getContext('2d'); const ictx = ink.getContext('2d');
      const font = 'bold ' + FS + 'px Andika, "Comic Sans MS", "Trebuchet MS", sans-serif';
      let mask = null, samples = [], finished = false;
      function drawGuide() {
        gctx.clearRect(0, 0, W, H); gctx.font = font; gctx.textBaseline = 'alphabetic';
        const nW = gctx.measureText('n').width, gW = gctx.measureText('g').width, tot = nW + gW + 14;
        const x0 = (W - tot) / 2, y0 = H * 0.66;
        gctx.fillStyle = '#CDEBEA'; gctx.fillText('n', x0, y0);
        gctx.fillStyle = '#E3D6F5'; gctx.fillText('g', x0 + nW + 14, y0);
        gctx.lineWidth = 3; gctx.setLineDash([10, 9]); gctx.strokeStyle = '#8a7f9c';
        gctx.strokeText('n', x0, y0); gctx.strokeText('g', x0 + nW + 14, y0); gctx.setLineDash([]);
        // mask from same glyphs
        const m = document.createElement('canvas'); m.width = W; m.height = H; const mc = m.getContext('2d');
        mc.font = font; mc.fillStyle = '#000'; mc.fillText('n', x0, y0); mc.fillText('g', x0 + nW + 14, y0);
        mask = mc.getImageData(0, 0, W, H).data; samples = [];
        for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) if (mask[(y * W + x) * 4 + 3] > 128) samples.push(x, y);
      }
      function measure() {
        const d = ictx.getImageData(0, 0, W, H).data; let hit = 0;
        for (let i = 0; i < samples.length; i += 2) if (d[(samples[i + 1] * W + samples[i]) * 4 + 3] > 40) hit++;
        let ink = 0, out = 0;
        for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) if (d[(y * W + x) * 4 + 3] > 40) { ink++; if (mask[(y * W + x) * 4 + 3] < 30) out++; }
        return { cover: samples.length ? hit / (samples.length / 2) : 0, outside: ink ? out / ink : 0 };
      }
      let cover = 0;
      function update() {
        const m = measure(); cover = m.cover; meter.firstChild.style.width = Math.min(100, Math.round(cover / 0.6 * 100)) + '%';
        return m;
      }
      async function succeed() {
        if (finished) return; finished = true; meter.firstChild.style.width = '100%';
        status.textContent = 'Beautiful tracing!'; ctx.progress(1);
        await Snd.seq([A.prompt('tracegood'), A.ng], 200);
        if (ctx.scr.ok()) ctx.finish();
      }
      // drawing
      let drawing = false, last = null;
      const pos = (e) => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
      ink.addEventListener('pointerdown', (e) => {
        if (finished) return; e.preventDefault(); drawing = true; ink.setPointerCapture(e.pointerId);
        last = pos(e); ictx.fillStyle = '#E39A00'; ictx.beginPath(); ictx.arc(last[0], last[1], BRUSH / 2, 0, 7); ictx.fill();
      });
      ink.addEventListener('pointermove', (e) => {
        if (!drawing) return; const p = pos(e);
        ictx.strokeStyle = '#E39A00'; ictx.lineWidth = BRUSH; ictx.lineCap = 'round'; ictx.lineJoin = 'round';
        ictx.beginPath(); ictx.moveTo(last[0], last[1]); ictx.lineTo(p[0], p[1]); ictx.stroke(); last = p;
      });
      const up = () => { if (!drawing) return; drawing = false; const m = update(); if (m.cover >= 0.6 && m.outside <= 0.6) succeed(); };
      ink.addEventListener('pointerup', up); ink.addEventListener('pointercancel', up);
      clear.addEventListener('click', () => { ictx.clearRect(0, 0, W, H); update(); status.textContent = 'Fresh start. Trace n, then g.'; });
      doneBtn.addEventListener('click', async () => {
        const m = update();
        if (m.cover >= 0.4 && m.outside <= 0.75) succeed();
        else { ctx.miss(); status.textContent = 'Nice start! Trace a little more.'; await say('tracemore'); }
      });
      // test hook (used by automated tests only)
      IR._traceTest = { W, H, samples: () => samples, ink, update, succeed };
      (document.fonts && document.fonts.load ? document.fonts.load(font).catch(() => {}) : Promise.resolve()).then(() => { if (ctx.scr.ok()) { drawGuide(); update(); } });
      Snd.seq([A.prompt('p_trace')], 100);
    }
  });

  /* ---------- 7. Sentence Bridge ---------- */
  LESSONS.push({
    id: 'sentence', title: 'Sentence Bridge', blurb: 'Build a sentence, build a bridge', color: '#2E9E6B',
    run(ctx) {
      ctx.setInstr('Listen. Put the words in order to make a sentence.', 'p_sent');
      const rounds = D.sentences; let r = 0; const stage = ctx.stage;
      function round() {
        const R = rounds[r]; ctx.progress(r / rounds.length); stage.innerHTML = ''; let misses = 0;
        const audio = 'audio/b_' + R.n + '.mp3';
        const spk = speakerBtn(() => Snd.play(audio), 'Hear the sentence');
        const slotsEl = h('div', { class: 'slots sent' }); const bankEl = h('div', { class: 'bank' });
        const status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Tap or drag the words into the boxes.');
        const tiles = shuffle(R.words.map((w, i) => ({ id: 'w' + i, text: w, cls: 'word' })));
        const bridge = h('div', { class: 'bridgebar' }, ...R.words.map(() => h('i')));
        const board = IR.TileBoard({
          tiles, nSlots: R.words.length, slotsEl, bankEl,
          onChange: (b) => { $$('i', bridge).forEach((el, k) => el.classList.toggle('on', b.slots[k] != null)); },
          onFull: async (texts, b) => {
            b.locked = true;
            if (texts.join(' ') === R.text) {
              status.textContent = 'Yes! The bridge is built.'; slotsEl.classList.add('right'); bridge.classList.add('lit');
              await Snd.seq([audio, A.prompt(pick(GOOD))], 300);
              if (!ctx.scr.ok()) return; await sleep(500); if (!ctx.scr.ok()) return;
              r++; if (r < rounds.length) round(); else { ctx.progress(1); ctx.finish(); }
            } else {
              misses++; ctx.miss(); status.textContent = 'Almost! Listen again and try again.'; slotsEl.classList.add('almost');
              await Snd.seq([A.prompt('again'), audio], 200);
              if (!ctx.scr.ok()) return; slotsEl.classList.remove('almost'); b.slots.fill(null);
              if (misses >= 2) b.hint = tiles.find((t) => t.text === R.words[0]).id;
              b.locked = false; b.render();
            }
          }
        });
        stage.append(h('div', { class: 'activity sentact' },
          h('div', { class: 'pic' }, h('img', { src: R.img, alt: 'A picture from the story' })),
          h('div', { class: 'row center' }, spk), slotsEl, bridge, bankEl, status));
        Snd.play(audio);
      }
      round();
    }
  });

  /* ---------- 8. Now You Read It (comic read-along with the read-3-times tracker) ---------- */
  LESSONS.push({
    id: 'story', title: 'Now You Read It', blurb: 'Read the comic yourself, then read it 3 times', color: '#8E5BD6',
    run(ctx) {
      ctx.setInstr('Tap a speaker to hear a sentence. Then you read it!', 'p_story');
      const pages = D.story; let p = 0; let reached = 0; const stage = ctx.stage; let auto = false; const S = IR.S();
      const picEl = h('img', { class: 'panel', alt: '' });
      const sentEl = h('p', { class: 'sentence', 'aria-live': 'polite' });
      const dots = h('div', { class: 'pagedots' }, ...pages.map(() => h('i')));
      const spk = speakerBtn(() => playPage(false), 'Hear this sentence'); spk.classList.add('huge');
      const prev = h('button', { class: 'btn small', type: 'button' }, icon('back'), 'Back');
      const next = h('button', { class: 'btn small primary', type: 'button' }, 'Next', icon('next'));
      const allBtn = h('button', { class: 'btn small', type: 'button' }, icon('play'), 'Play the whole story');
      const reads = h('div', { class: 'reads' });
      const readBtn = h('button', { class: 'btn small good', type: 'button' }, icon('check'), 'I read it to a grown-up');
      function renderReads() {
        const n = S.reads.story || 0; reads.innerHTML = '';
        reads.append(h('span', null, 'Read it 3 times: '), ...[0, 1, 2].map((k) => h('i', { class: 'rd' + (k < n ? ' on' : '') })));
      }
      readBtn.addEventListener('click', () => { S.reads.story = Math.min(3, (S.reads.story || 0) + 1); IR.save(); renderReads(); });
      function setPage(i) {
        p = i; reached = Math.max(reached, p); const pg = pages[p];
        picEl.src = pg.img; sentEl.innerHTML = '';
        pg.words.forEach((w, k) => sentEl.append(h('span', { class: 'w', 'data-k': k }, w), ' '));
        $$('i', dots).forEach((d, k) => { d.classList.toggle('cur', k === p); d.classList.toggle('seen', k <= reached); });
        prev.disabled = p === 0; next.firstChild.textContent = p === pages.length - 1 ? 'Finish' : 'Next';
        ctx.progress(reached / (pages.length - 1));
      }
      function playPage(keepAuto) {
        if (!keepAuto) auto = false;
        const pg = pages[p]; const ws = $$('.w', sentEl);
        return Snd.play('audio/s_' + pg.n + '.mp3', { onTime: (t) => {
          pg.t.forEach((tt, k) => { const el = ws[k]; if (!el) return; el.classList.toggle('hl', t >= tt[0] - 0.04 && t < (pg.t[k + 1] ? pg.t[k + 1][0] - 0.04 : 99)); el.classList.toggle('read', t >= tt[1]); });
        } }).then((ok) => { ws.forEach((e) => e.classList.remove('hl', 'read')); return ok; });
      }
      prev.addEventListener('click', () => { auto = false; if (p > 0) { setPage(p - 1); playPage(false); } });
      next.addEventListener('click', async () => {
        auto = false;
        if (p < pages.length - 1) { setPage(p + 1); playPage(false); }
        else { Snd.stop(); await Snd.seq([A.prompt('storyread'), A.prompt('storydone')], 200); if (ctx.scr.ok()) { ctx.progress(1); ctx.finish(); } }
      });
      allBtn.addEventListener('click', async () => {
        auto = true; setPage(0);
        for (let i = 0; i < pages.length && auto && ctx.scr.ok(); i++) { setPage(i); await playPage(true); await sleep(350); }
        auto = false;
      });
      stage.append(h('div', { class: 'activity story' },
        h('div', { class: 'panelwrap' }, picEl), h('div', { class: 'sentrow' }, spk, sentEl), dots,
        h('div', { class: 'row' }, prev, allBtn, next), h('div', { class: 'row' }, readBtn, reads)));
      renderReads(); setPage(0);
      Snd.seq([A.prompt('p_story')], 100).then(() => {});
    }
  });
})();

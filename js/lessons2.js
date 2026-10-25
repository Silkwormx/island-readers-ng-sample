/* Mini lessons 6-8: Trace Trail, Sentence Bridge, Now You Read It (comic). Heart words now live in Story Time (lesson 1). */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $, $$, sleep, shuffle, pick, colorWord, icon, Snd, A, sayWord, speakerBtn, CHUNK_COLORS } = IR;
  const LESSONS = IR.LESSONS;

  /* ---------- 6. Trace Trail: numbered green start dots, direction arrows, "watch me", forward-only tracing ---------- */
  LESSONS.push({
    id: 'trace', title: 'Trace Trail', blurb: 'Trace n and g: follow the green dots', color: '#D98E00',
    run(ctx) {
      ctx.setInstr('Trace the n and the g. Start at the green dot.', 'p_trace');
      const W = 900, H = 440, BRUSH = 30, NS = 'http://www.w3.org/2000/svg';
      /* ---- stroke guide paths (manuscript, ball-and-stick). Canvas coords; baseline y=290, x-height line y=110. ---- */
      const bez = (p0, p1, p2, p3, n) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t;
        o.push([u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]]); } return o; };
      const line = (a, b, n) => { const o = []; for (let i = 0; i <= n; i++) o.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); return o; };
      const join = (...parts) => parts.reduce((acc, p) => acc.concat(acc.length ? p.slice(1) : p), []);
      const circle = (cx, cy, rx, ry, a0, a1, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return o; };
      const STROKES = [
        { letter: 'n', num: 1, pts: line([160, 110], [160, 290], 36) },                                   /* n 1: straight down the stem */
        { letter: 'n', num: 2, pts: join(bez([160, 190], [160, 150], [186, 110], [224, 110], 14), bez([224, 110], [264, 110], [282, 140], [282, 195], 14), line([282, 195], [282, 290], 19)) }, /* n 2: back up, over the hump, down */
        { letter: 'g', num: 1, pts: circle(640, 200, 76, 90, -85, -445, 70) },                           /* g 1: start at the top, counter-clockwise round the bowl */
        { letter: 'g', num: 2, pts: join(line([716, 110], [716, 348], 48), bez([716, 348], [716, 404], [690, 414], [648, 414], 12), bez([648, 414], [610, 414], [582, 396], [574, 370], 10)) } /* g 2: straight down, hook to the left */
      ];
      STROKES.forEach((s) => { let L = 0; s.cum = [0]; for (let i = 1; i < s.pts.length; i++) { L += Math.hypot(s.pts[i][0] - s.pts[i-1][0], s.pts[i][1] - s.pts[i-1][1]); s.cum.push(L); } s.len = L; });
      const at = (s, d) => { let i = 1; while (i < s.cum.length - 1 && s.cum[i] < d) i++; const a = s.pts[i-1], b = s.pts[i]; const f = (d - s.cum[i-1]) / ((s.cum[i] - s.cum[i-1]) || 1); return [a[0] + (b[0]-a[0]) * f, a[1] + (b[1]-a[1]) * f, Math.atan2(b[1]-a[1], b[0]-a[0]) * 180 / Math.PI]; };
      const d = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      const el = (name, attrs, parent) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; };

      const under = el('svg', { class: 'cv', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' });
      const ink = h('canvas', { class: 'cv ink', width: W, height: H, 'aria-label': 'Trace the letters n and g here', role: 'img' });
      const over = el('svg', { class: 'cv over', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' });
      const box = h('div', { class: 'tracebox' }, under, ink, over);
      const meter = h('div', { class: 'meter' }, h('i'));
      const status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Put your finger on the green 1 and follow the arrows.');
      const watch = h('button', { class: 'btn small', type: 'button' }, icon('play'), 'Watch me');
      const clear = h('button', { class: 'btn small', type: 'button' }, 'Start over');
      const skip = h('button', { class: 'btn small ghost', type: 'button' }, 'Skip');
      ctx.stage.append(h('div', { class: 'activity' }, box, meter, status, h('div', { class: 'row' }, watch, clear, skip)));

      /* ribbons + dotted centre lines (under the ink) */
      const ribbons = STROKES.map((s) => {
        const g = el('g', {}, under);
        el('path', { d: d(s.pts), fill: 'none', stroke: '#E4F1EF', 'stroke-width': 44, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        el('path', { d: d(s.pts), fill: 'none', stroke: '#8a7f9c', 'stroke-width': 3, 'stroke-dasharray': '2 11', 'stroke-linecap': 'round' }, g);
        return g;
      });
      /* arrows + numbered start dots (over the ink) */
      const marks = STROKES.map((s) => {
        const g = el('g', { class: 'strokemark' }, over);
        for (let dist = 70; dist < s.len - 30; dist += 82) { const p = at(s, dist); if (STROKES.some((o) => Math.hypot(o.pts[0][0] - p[0], o.pts[0][1] - p[1]) < 48)) continue;
          el('path', { d: 'M-9 -11 L9 0 L-9 11', fill: 'none', stroke: '#0E7C7C', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ') rotate(' + p[2].toFixed(0) + ')' }, g); }
        const dot = el('g', { class: 'startdot', transform: 'translate(' + s.pts[0][0] + ' ' + s.pts[0][1] + ')' }, g);
        el('circle', { r: 25, fill: '#1E9E5A', stroke: '#fff', 'stroke-width': 4 }, dot);
        const t = el('text', { 'text-anchor': 'middle', y: 9, 'font-size': 28, 'font-weight': 700, fill: '#fff', 'font-family': 'Andika, sans-serif' }, dot); t.textContent = s.num;
        return g;
      });
      const sprite = el('circle', { r: 17, fill: '#FFD84D', stroke: '#2B2540', 'stroke-width': 4, class: 'watchdot', visibility: 'hidden' }, over);

      const ictx = ink.getContext('2d');
      let sIdx = 0, prog = 0, drawing = false, last = null, snap = null, watching = 0, finished = false;
      const START_R = 78, TOL = 58, LOOK = 70;           /* start must be near the dot; moves count only when they go forward along the path */
      const Pn = (s) => s.pts.length;
      function refresh() {
        STROKES.forEach((s, i) => { marks[i].classList.toggle('now', i === sIdx && !finished); marks[i].classList.toggle('later', i > sIdx); marks[i].classList.toggle('done', i < sIdx || finished); });
        meter.firstChild.style.width = Math.round(100 * (finished ? 4 : sIdx) / 4) + '%'; ctx.progress((finished ? 4 : sIdx) / 4);
      }
      function snapPath(s, color) { ictx.strokeStyle = color; ictx.lineWidth = BRUSH; ictx.lineCap = 'round'; ictx.lineJoin = 'round'; ictx.beginPath(); s.pts.forEach((p, i) => (i ? ictx.lineTo(p[0], p[1]) : ictx.moveTo(p[0], p[1]))); ictx.stroke(); }
      async function succeed() {
        if (finished) return; finished = true; refresh(); status.textContent = 'Beautiful tracing!';
        await IR.ding(); if (ctx.scr.ok()) ctx.finish();
      }
      function strokeDone() {
        const s = STROKES[sIdx]; ictx.putImageData(snap, 0, 0); snapPath(s, '#2E9E6B'); sIdx++; drawing = false; prog = 0; Snd.play(A.sfx.tap);
        if (sIdx >= STROKES.length) { succeed(); return; }
        refresh(); status.textContent = STROKES[sIdx].letter !== s.letter ? 'Now the g! Start at the green 1.' : 'Good! Now the green ' + STROKES[sIdx].num + '.';
      }
      const pos = (e) => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
      ink.addEventListener('pointerdown', (e) => {
        if (finished || watching) return; e.preventDefault();
        const s = STROKES[sIdx], p = pos(e);
        if (Math.hypot(p[0] - s.pts[0][0], p[1] - s.pts[0][1]) > START_R) {
          const dot = marks[sIdx].querySelector('.startdot circle'); dot.classList.remove('nudge'); void dot.getBoundingClientRect(); dot.classList.add('nudge');
          status.textContent = 'Start at the green ' + s.num + '.'; return; }
        try { ink.setPointerCapture(e.pointerId); } catch (err) { /* */ }
        drawing = true; prog = 0; last = p; snap = ictx.getImageData(0, 0, W, H);
        ictx.fillStyle = '#E39A00'; ictx.beginPath(); ictx.arc(p[0], p[1], BRUSH / 2, 0, 7); ictx.fill();
      });
      ink.addEventListener('pointermove', (e) => {
        if (!drawing) return; const p = pos(e), s = STROKES[sIdx];
        ictx.strokeStyle = '#E39A00'; ictx.lineWidth = BRUSH; ictx.lineCap = 'round'; ictx.beginPath(); ictx.moveTo(last[0], last[1]); ictx.lineTo(p[0], p[1]); ictx.stroke(); last = p;
        let best = prog;                                   /* forward only: look ahead along the path, never back */
        for (let j = prog + 1; j <= Math.min(Pn(s) - 1, prog + LOOK); j++) if (Math.hypot(p[0] - s.pts[j][0], p[1] - s.pts[j][1]) <= TOL) best = j;
        prog = best; if (prog >= Pn(s) - 4) strokeDone();
      });
      const up = () => { if (!drawing) return; drawing = false; ictx.putImageData(snap, 0, 0); prog = 0;
        status.textContent = 'Keep going along the arrows to the end. Try the green ' + STROKES[sIdx].num + ' again.'; };
      ink.addEventListener('pointerup', up); ink.addEventListener('pointercancel', up);
      clear.addEventListener('click', () => { if (watching) return; ictx.clearRect(0, 0, W, H); sIdx = 0; prog = 0; drawing = false; finished = false; refresh(); status.textContent = 'Fresh start. Put your finger on the green 1.'; });
      skip.addEventListener('click', () => { ctx.miss(); ctx.miss(); succeed(); });

      /* "Watch me": a yellow dot draws the strokes of the current letter, in order, along the arrows */
      const calm = () => document.body.classList.contains('calm') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
      async function watchMe(auto) {
        if (watching || finished || drawing) return; const my = ++watching; const letter = STROKES[Math.min(sIdx, 3)].letter;
        const list = STROKES.map((s, i) => i).filter((i) => STROKES[i].letter === letter && i >= (letter === 'n' ? 0 : 2));
        if (!auto) Snd.play(A.prompt('p_watch'));
        if (calm()) { list.forEach((i) => marks[i].classList.add('flash')); await sleep(1200); list.forEach((i) => marks[i].classList.remove('flash')); watching = 0; return; }
        sprite.setAttribute('visibility', 'visible');
        for (const i of list) {
          const s = STROKES[i]; const t0 = performance.now(); const dur = Math.max(900, s.len / 0.28);
          await new Promise((res) => { const step = (now) => { if (!ctx.scr.ok()) return res(); const f = Math.min(1, (now - t0) / dur); const p = at(s, f * s.len); sprite.setAttribute('cx', p[0]); sprite.setAttribute('cy', p[1]); if (f < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
          await sleep(350);
        }
        sprite.setAttribute('visibility', 'hidden'); watching = 0;
      }
      watch.addEventListener('click', () => watchMe(false));
      IR._traceTest = { W, H, strokes: STROKES.map((s) => s.pts), ink, state: () => ({ sIdx, finished, watching }), succeed, watchMe };
      refresh(); Snd.seq([A.prompt('p_trace')], 100);
      setTimeout(() => { if (ctx.scr.ok() && sIdx === 0 && !calm()) watchMe(true); }, 2200);
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
              await Snd.seq([A.sfx.ding, audio], 200);
              if (!ctx.scr.ok()) return; await sleep(500); if (!ctx.scr.ok()) return;
              r++; if (r < rounds.length) round(); else { ctx.progress(1); ctx.finish(); }
            } else {
              misses++; ctx.miss(); status.textContent = 'Almost! Listen again and try again.'; slotsEl.classList.add('almost');
              await IR.tryAgain(audio);
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
        else { Snd.stop(); if (ctx.scr.ok()) { ctx.progress(1); ctx.finish(); } }
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

/* Unit 7 (nk) on Island 3 + the Island 3 Review. Own routes: #/nk (unit page), #/nk/<step>, #/nk/result, #/review3.
   Reuses the ng look (same classes) and adds two reusable activity types: Story Check (comprehension) and Rhyme Time. */
(function () {
  'use strict';
  const IR = window.IR; const N = window.IR_DATA_NK; if (!N) return;
  const { h, $, $$, sleep, shuffle, icon, Snd, speakerBtn } = IR;
  const AU = { w: (w) => 'audio/nk_w_' + w + '.mp3', p: (k) => 'audio/nk_p_' + k + '.mp3', c: (c) => 'audio/nk_c_' + c + '.mp3', l: (l) => 'audio/nk_l_' + l + '.mp3', nk: 'audio/nk_sound.mp3' };
  const say = (w) => Snd.play(AU.w(w));
  const NKCOL = '#C2408A';
  function colorNk(w) {           /* nk (and ng in the mixed items) in its own colour */
    const m = /(nk|ng)$/.exec(w); if (!m) return document.createTextNode(w);
    return h('span', null, w.slice(0, m.index), h('span', { class: 'chunk', style: 'color:' + (m[1] === 'nk' ? NKCOL : '#0E8584') }, m[1]));
  }
  const PIC = {   /* simple original pictures for words with no story art */
    sink: '<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M58 18 v-8 h22 v8" stroke="#8a93a6" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="54" y="22" width="10" height="16" rx="3" fill="#8a93a6"/><path d="M14 40 h92 q0 40 -46 40 q-46 0 -46 -40z" fill="#dfe8f2" stroke="#2b2540" stroke-width="4"/><ellipse cx="60" cy="44" rx="40" ry="6" fill="#9fd3f0"/><rect x="52" y="78" width="16" height="16" fill="#8a93a6"/></svg>',
    ink: '<svg viewBox="0 0 120 100" aria-hidden="true"><rect x="38" y="10" width="44" height="14" rx="3" fill="#2b2540"/><path d="M32 26 h56 v54 q0 10 -10 10 h-36 q-10 0 -10 -10z" fill="#3b4bd6" stroke="#2b2540" stroke-width="4"/><rect x="40" y="46" width="40" height="22" rx="4" fill="#fff8e7"/><path d="M96 70 q8 12 0 18 q-8 -6 0 -18z" fill="#3b4bd6"/></svg>',
    'face:glad': '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="#FFD76A" stroke="#2b2540" stroke-width="4"/><circle cx="36" cy="42" r="5" fill="#2b2540"/><circle cx="64" cy="42" r="5" fill="#2b2540"/><path d="M30 60 q20 22 40 0" stroke="#2b2540" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
    'face:sad': '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="#A9D4F5" stroke="#2b2540" stroke-width="4"/><circle cx="36" cy="42" r="5" fill="#2b2540"/><circle cx="64" cy="42" r="5" fill="#2b2540"/><path d="M32 72 q18 -18 36 0" stroke="#2b2540" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
    'face:mad': '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="#F59A8B" stroke="#2b2540" stroke-width="4"/><path d="M26 32 l18 8 M74 32 l-18 8" stroke="#2b2540" stroke-width="5" stroke-linecap="round"/><circle cx="37" cy="46" r="5" fill="#2b2540"/><circle cx="63" cy="46" r="5" fill="#2b2540"/><path d="M34 70 h32" stroke="#2b2540" stroke-width="5" stroke-linecap="round"/></svg>'
  };
  const picFor = (w, src) => { src = src || ({ skunk: 'img/nk_c_skunk.webp', trunk: 'img/nk_c_trunk.webp' })[w] || w;
    return /^img\//.test(src) ? h('img', { class: 'nkpic', src, alt: '' }) : h('span', { class: 'nkpic svgpic', html: PIC[src] || '' }); };

  /* ---------- the unit: steps in the approved order ---------- */
  const STEPS = [
    { id: 'meet', title: 'Meet nk', group: 'lesson', run: runMeet, color: '#1FA6A6' },
    { id: 'ido', title: 'Watch Zip Blend', group: 'activities', run: runIdo, color: '#1F8FD6' },
    { id: 'wedo', title: 'Blend With Me', group: 'activities', run: runWedo, color: '#E8603C' },
    { id: 'youdo', title: 'Hear and Pick', group: 'activities', run: runYoudo, color: '#7E57C2' },
    { id: 'ngnk', title: 'ng or nk?', group: 'activities', run: runNgnk, color: '#2E9E6B' },
    { id: 'heart', title: 'Heart Words', group: 'activities', run: runHeart, color: '#E0476B' },
    { id: 'listen', title: 'Story Time', group: 'story', run: runListen, color: '#8E5BD6' },
    { id: 'read', title: 'Now You Read It', group: 'activities', run: runRead, color: '#8E5BD6' },
    { id: 'comp', title: 'Story Check', group: 'activities', run: runComp, color: '#D98E00' },
    { id: 'rhyme', title: 'Rhyme Time', group: 'activities', run: runRhyme, color: '#C2408A' },
    { id: 'check', title: 'Zip\u2019s Check', group: 'activities', run: runCheck, color: '#2b2540' }
  ];
  const pid = (s) => 'nk_' + s.id;
  function sections() {
    const items = STEPS.map((s, i) => ({ id: s.id, title: s.title, group: s.group, href: '#/nk/' + s.id, num: i + 1, done: IR.isDone(pid(s)), min: (N.minutes || {})[s.id] || 3 }));
    items.filter((r) => r.group === 'activities').forEach((r, k) => { r.act = k + 1; r.label = 'Activity ' + (k + 1) + ': ' + r.title; });
    items.forEach((r) => { if (!r.label) r.label = r.title; }); return items;
  }
  IR.nk = { sections, steps: STEPS };
  /* progress for the island picker */
  IR.nkProgress = (id) => {
    if (id === 'nk') { const s = sections(); return { total: s.length, done: s.filter((r) => r.done).length, min: s.reduce((a, r) => a + r.min, 0) }; }
    if (id === 'review') return { total: 1, done: IR.isDone('i3_review') ? 1 : 0, min: 6 };
    return null;
  };
  const nextUp = () => sections().find((r) => !r.done) || null;

  /* ---------- unit page (same layout as the ng unit page) ---------- */
  function unitPage(app) {
    IR.newScreen(); const secs = sections(); const nx = nextUp(); const doneN = secs.filter((r) => r.done).length; const total = secs.length;
    const totalMin = secs.reduce((a, r) => a + r.min, 0);
    const star = (on) => h('span', { class: 'sstar' + (on ? ' on' : ''), 'aria-hidden': 'true' }, icon(on ? 'star' : 'starOutline'));
    const go = (r) => () => { Snd.stop(); location.hash = r.href; };
    const big = (r) => { const isNext = nx && nx.id === r.id; const lesson = r.group === 'lesson';
      return h('li', { class: 'bigli' }, h('button', { class: 'stopcard bigbox ' + (lesson ? 'lessonstop' : 'storystop') + (r.done ? ' done' : '') + (isNext ? ' nextup' : ''), type: 'button', 'data-id': r.id, 'aria-label': r.label + '. ' + r.min + ' minutes.', onclick: go(r) },
        h('span', { class: 'bkind' }, lesson ? 'Lesson' : 'Story'), r.done ? h('span', { class: 'bstar' }, star(true)) : null,
        h('img', { class: 'bimg', src: lesson ? 'img/zip.webp' : 'img/frill.webp', alt: '' }),
        h('span', { class: 'stxt bbot' }, h('b', null, r.title), h('span', { class: 'smin' }, r.min + ' min'),
          h('span', { class: 'sside' }, h('span', { class: 'slabel ' + (r.done ? 'rev' : isNext ? 'tag' : 'none') }, r.done ? (lesson ? 'Review lesson' : 'Read again') : isNext ? 'Next' : ''))))); };
    const row = (r) => { const isNext = nx && nx.id === r.id;
      return h('li', null, h('button', { class: 'stopcard arow gamestop' + (r.done ? ' done' : '') + (isNext ? ' nextup' : ''), type: 'button', 'data-id': r.id, 'aria-label': r.label + '. ' + r.min + ' minutes.', onclick: go(r) },
        h('span', { class: 'snum', 'aria-hidden': 'true' }, String(r.act)), h('span', { class: 'stxt' }, h('b', null, r.title)), h('span', { class: 'smin' }, r.min + ' min'),
        h('span', { class: 'sside' }, star(r.done), h('span', { class: 'slabel ' + (isNext ? 'tag' : 'none') }, isNext ? 'Next' : '')))); };
    const left = h('ul', { class: 'uA-left' }, ...secs.filter((r) => r.group !== 'activities').map(big));
    const right = h('section', { class: 'uA-right' }, h('h2', { class: 'uA-h' }, 'Activities'), h('ol', { class: 'stoplist uA-acts' }, ...secs.filter((r) => r.group === 'activities').map(row)));
    const complete = doneN === total;
    const foot = h('footer', { class: 'uA-foot island4 ' + (complete ? 'open' : 'locked') }, h('span', { class: 'i4ico', 'aria-hidden': 'true' }, icon(complete ? 'star' : 'lock')),
      h('span', { class: 'i4txt' }, h('b', null, 'Unit 3 Review'), h('small', null, complete ? 'Unlocked! Mix ng and nk.' : 'Finish all stars to unlock')), h('span', { class: 'i4count' }, doneN + ' of ' + total));
    app.append(h('div', { class: 'screen trailscreen unitpage unitA nkunit' },
      h('header', { class: 'uA-top' }, IR.ui.homeButton(), h('h1', { class: 'uA-title' }, h('small', null, 'Unit 3 \u00b7 Lesson 3.2 \u00b7 '), 'nk'),
        h('span', { class: 'uA-time' }, h('span', { class: 't-long' }, 'About ' + totalMin + ' min total'), h('span', { class: 't-short' }, totalMin + ' min')), IR.ui.gearButton()),
      h('main', { class: 'uA-main' }, left, right), foot));
  }

  /* ---------- step shell (same top bar / instructions / Back-Next as the ng lessons) ---------- */
  function stepScreen(app, idx, OV) {
    const S0 = OV || STEPS[idx]; const scr = IR.newScreen(); let mistakes = 0;
    const fill = h('i'); const bar = h('div', { class: 'pbar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100 }, fill, ...STEPS.slice(1).map((_, k) => h('em', { style: `left:${(k + 1) / STEPS.length * 100}%` })));
    const instrBox = h('div', { class: 'instr' }); const stage = h('div', { class: 'stage' });
    let backH = null, nextH = null;
    const ctx = {
      scr, stage, miss() { mistakes++; },
      progress(f) { const v = Math.round(((idx + Math.max(0, Math.min(1, f))) / STEPS.length) * 100); fill.style.width = v + '%'; bar.setAttribute('aria-valuenow', v); },
      setInstr(text, p) { instrBox.innerHTML = ''; instrBox.style.display = text ? '' : 'none'; if (text) instrBox.append(speakerBtn(() => Snd.play(AU.p(p)), 'Hear the directions'), h('span', { class: 'itext' }, text)); },
      setBack(fn) { backH = fn; }, setNext(fn) { nextH = fn; },
      goBack() { Snd.stop(); if (backH && backH()) return; location.hash = idx > 0 ? '#/nk/' + STEPS[idx - 1].id : '#/nk'; },
      goNext() { Snd.stop(); if (nextH && nextH()) return; location.hash = idx < STEPS.length - 1 ? '#/nk/' + STEPS[idx + 1].id : '#/nk'; },
      setNextLabel(t) { nextBtn.firstChild.textContent = t; }, showNav(on) { nav.style.display = on === false ? 'none' : ''; },
      finish(starsOverride) {
        const stars = starsOverride || ((S0.id === 'meet' || S0.id === 'listen' || S0.id === 'ido') ? 3 : mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1);
        IR.recordActivity(S0.rec || pid(S0), stars); IR.touchStreak(); IR.save(); ctx.progress(1);
        const last = !!OV || idx === STEPS.length - 1; const nx = STEPS[idx + 1];
        const ov = h('div', { class: 'complete' }, h('div', { class: 'cbox' }, IR.celebration(false), h('h1', null, 'Great job!'), h('p', { class: 'lead' }, S0.title),
          h('div', { class: 'bigstars', 'aria-label': stars + ' stars' }, ...[1, 2, 3].map((k) => icon(k <= stars ? 'star' : 'starOutline', (k <= stars ? 'on' : 'off') + ' k' + k))),
          h('div', { class: 'row' }, h('button', { class: 'btn big back', type: 'button', onclick: () => { location.hash = '#/nk'; } }, icon('back'), 'Back to the trail'),
            h('button', { class: 'btn big primary', type: 'button', onclick: () => { location.hash = OV ? '#/home' : last ? '#/nk' : '#/nk/' + nx.id; } }, OV ? 'See the sky map' : last ? 'Back to the unit' : 'Next: ' + nx.title, icon('next')))));
        app.append(ov); Snd.play(IR.A.sfx.done);
      }
    };
    const nextBtn = h('button', { class: 'btn big next', type: 'button', 'aria-label': 'Next', onclick: () => ctx.goNext() }, 'Next', icon('next'));
    const nav = h('div', { class: 'lesson-nav' }, h('button', { class: 'btn big back', type: 'button', 'aria-label': 'Back', onclick: () => ctx.goBack() }, icon('back'), 'Back'), nextBtn);
    const x = h('button', { class: 'xbtn', type: 'button', 'aria-label': 'Back to the unit', onclick: () => { location.hash = '#/nk'; } }, icon('close'));
    app.append(h('div', { class: 'screen lessonscreen nkstep nk-' + S0.id, style: '--c:' + S0.color }, h('header', { class: 'lesson-top' }, x, bar, IR.ui.homeButton(), unitSheetBtn(S0.id)), instrBox, stage, nav));
    ctx.progress(0); S0.run(ctx);
  }
  function unitSheetBtn(cur) {
    const btn = h('button', { class: 'unitbtn', type: 'button', 'aria-label': 'In this unit: show the lesson map' }, icon('list'), h('span', { class: 'ulab' }, 'In this unit'));
    btn.addEventListener('click', () => {
      const close = () => el.remove();
      const rows = sections().map((r) => h('li', null, h('button', { class: 'urow' + (r.id === cur ? ' cur' : '') + (r.done ? ' done' : ''), type: 'button', onclick: () => { Snd.stop(); close(); location.hash = r.href; } },
        r.done ? h('span', { class: 'ustar' }, icon('star')) : h('span', { class: 'ucircle' }), h('span', { class: 'ut' }, r.act ? h('span', { class: 'uact' }, 'Activity ' + r.act) : null, r.title))));
      const el = h('div', { class: 'usheet-scrim', onclick: (e) => { if (e.target === e.currentTarget) close(); } }, h('div', { class: 'usheet', role: 'dialog', 'aria-label': 'In this unit' },
        h('div', { class: 'ush-head' }, h('h2', null, 'In this unit'), h('button', { class: 'ush-x', type: 'button', 'aria-label': 'Close', onclick: close }, icon('close'))), h('ol', { class: 'ush-list' }, ...rows)));
      IR.ui.modalRoot.append(el);
    });
    return btn;
  }
  const nkCard = (big) => h('div', { class: 'ngpill joined nkcard' + (big ? '' : ' small') }, h('span', { class: 'l n' }, 'n'), h('span', { class: 'l g' }, 'k'));

  /* 1. Meet the sound */
  function runMeet(ctx) {
    ctx.setInstr('', null); const st = ctx.stage; let i = 0;
    const beats = [{ who: 'zip', p: 'm1', img: 'img/nk_p1.webp' }, { who: 'frill', p: 'm2', img: 'img/nk_p3.webp', tap: true }, { who: 'zip', p: 'm3', img: 'img/nk_p2.webp', tap: true }];
    const show = () => { const b = beats[i]; ctx.progress(i / beats.length); st.innerHTML = '';
      const card = nkCard(true); const tapBtn = h('button', { class: 'nkcardbtn', type: 'button', 'aria-label': 'Hear the nk sound', onclick: () => { card.classList.add('buzz'); Snd.play(AU.nk).then(() => card.classList.remove('buzz')); } }, card);
      st.append(h('div', { class: 'activity nkmeet' }, h('div', { class: 'bubble ' + b.who }, h('b', { class: 'who' }, b.who === 'zip' ? 'Zip' : 'Frill'), h('p', null, N.prompts[b.p].text), speakerBtn(() => Snd.play(AU.p(b.p)), 'Hear this again')),
        h('div', { class: 'meetrow' }, h('div', { class: 'panelwrap small' }, h('img', { class: 'panel', src: b.img, alt: '' })), tapBtn),
        h('p', { class: 'cap' }, 'nk says /ngk/, like in sink'),
        h('div', { class: 'chips' }, ...['sink', 'pink', 'bank', 'junk'].map((w) => h('button', { class: 'chip', type: 'button', onclick: () => say(w) }, colorNk(w))))));
      ctx.setNextLabel(i === beats.length - 1 ? 'Finish' : 'Next');
      Snd.seq(b.tap ? [AU.p(b.p), AU.nk] : [AU.p(b.p)], 250); };
    ctx.setNext(() => { if (i < beats.length - 1) { i++; show(); } else ctx.finish(); return true; });
    ctx.setBack(() => { if (i > 0) { i--; show(); return true; } return false; });
    show();
  }
  const parts = (w) => w.match(/nk|th|./g);
  function tilesFor(w) { return h('div', { class: 'blendrow' }, ...parts(w).map((l) => h('button', { class: 'btile' + (l === 'nk' ? ' nk' : ''), type: 'button', 'data-l': l, onclick: () => Snd.play(AU.l(l)) }, l))); }
  /* 2. I do: Zip blends sound by sound */
  function runIdo(ctx) {
    ctx.setInstr('Watch me. I say each sound, then I blend them.', 'ido'); const st = ctx.stage; let i = 0; const W = N.ido;
    const show = async () => { const w = W[i]; ctx.progress(i / W.length); st.innerHTML = ''; const row = tilesFor(w); const out = h('p', { class: 'blendout' }, '\u00a0');
      const play = async () => { Snd.stop(); const id = Snd.id; const ts = $$('.btile', row); out.textContent = '\u00a0';
        for (const t of ts) { if (Snd.id !== id) return; ts.forEach((x) => x.classList.remove('lit')); t.classList.add('lit'); await Snd.play(AU.l(t.dataset.l), { keep: true }); await sleep(350); }
        if (Snd.id !== id) return; ts.forEach((x) => x.classList.add('lit')); out.innerHTML = ''; out.append(colorNk(w)); await Snd.play(AU.w(w), { keep: true }); };
      st.append(h('div', { class: 'activity' }, h('div', { class: 'zipsays' }, h('img', { class: 'char zip mini', src: 'img/zip.webp', alt: 'Zip' }), h('span', null, 'Zip blends: ' + w)), row, out,
        h('button', { class: 'btn', type: 'button', onclick: play }, icon('replay'), 'Watch again')));
      ctx.setNextLabel(i === W.length - 1 ? 'Finish' : 'Next'); await Snd.seq([AU.p('ido')], 200); if (ctx.scr.ok()) play(); };
    ctx.setNext(() => { if (i < W.length - 1) { i++; show(); } else ctx.finish(); return true; });
    ctx.setBack(() => { if (i > 0) { i--; show(); return true; } return false; });
    show();
  }
  /* 3. We do: tap each letter, then blend */
  function runWedo(ctx) {
    ctx.setInstr('Tap each letter. Then tap Blend it.', 'wedo'); const st = ctx.stage; let i = 0; const W = N.wedo;
    const show = () => { const w = W[i]; ctx.progress(i / W.length); st.innerHTML = ''; const row = tilesFor(w); const out = h('p', { class: 'blendout' }, '\u00a0');
      const blend = h('button', { class: 'btn big primary', type: 'button', disabled: true }, icon('speaker'), 'Blend it');
      $$('.btile', row).forEach((t) => t.addEventListener('click', () => { t.classList.add('lit'); if ($$('.btile', row).every((x) => x.classList.contains('lit'))) { blend.disabled = false; blend.classList.add('glow'); } }));
      blend.addEventListener('click', async () => { out.innerHTML = ''; out.append(colorNk(w)); await IR.ding(); await Snd.play(AU.w(w)); if (!ctx.scr.ok()) return; await sleep(500); if (!ctx.scr.ok()) return; if (i < W.length - 1) { i++; show(); } else ctx.finish(); });
      st.append(h('div', { class: 'activity' }, h('p', { class: 'bigprompt' }, 'Word ' + (i + 1) + ' of ' + W.length), row, out, blend)); };
    ctx.setNext(() => { if (i < W.length - 1) { i++; show(); return true; } return false; });
    ctx.setBack(() => { if (i > 0) { i--; show(); return true; } return false; });
    Snd.play(AU.p('wedo')); show();
  }
  /* generic "hear it, tap the right choice" round runner (used by You do, ng or nk?, Review) */
  function pickRounds(ctx, rounds, build, onAll) {
    let r = 0; const got = new Set(); const st = ctx.stage;
    const round = () => { const R = rounds[r]; ctx.progress(got.size / rounds.length); st.innerHTML = ''; let locked = false, misses = 0;
      const status = h('p', { class: 'status', 'aria-live': 'polite' }, '\u00a0');
      const { body, buttons } = build(R);
      buttons.forEach(({ el, ok, word }) => el.addEventListener('click', async () => {
        if (locked || el.classList.contains('tried')) return;
        if (ok) { locked = true; el.classList.add('right'); buttons.forEach((b) => { if (b.el !== el) b.el.classList.add('fade'); }); status.textContent = 'Yes! ' + R.word;
          await IR.ding(); await say(R.word); if (!ctx.scr.ok()) return; await sleep(400); if (!ctx.scr.ok()) return;
          got.add(r); if (got.size >= rounds.length) { onAll ? onAll() : ctx.finish(); } else { r = (r + 1) % rounds.length; while (got.has(r)) r = (r + 1) % rounds.length; round(); } }
        else { misses++; ctx.miss(); el.classList.add('tried'); status.textContent = 'Not that one. Listen again.'; await IR.tryAgain(AU.w(R.word)); if (misses >= 2) buttons.forEach((b) => { if (b.ok) b.el.classList.add('hint'); }); }
      }));
      const spk = speakerBtn(() => say(R.word), 'Hear the word'); spk.classList.add('huge');
      st.append(h('div', { class: 'activity' }, spk, body, status)); say(R.word); };
    ctx.setBack(() => { if (r > 0) { r--; round(); return true; } return false; });
    ctx.setNext(() => { if (r < rounds.length - 1) { r++; round(); return true; } return false; });
    round();
  }
  /* 4. You do: picture choice */
  function runYoudo(ctx) {
    ctx.setInstr('Listen. Tap the picture of the word you hear.', 'youdo');
    pickRounds(ctx, N.youdo, (R) => { const buttons = shuffle(R.choices).map((w) => ({ word: w, ok: w === R.word, el: h('button', { class: 'choice picchoice', type: 'button', 'data-w': w, 'aria-label': w }, picFor(w), h('span', { class: 'pw' }, w)) }));
      return { body: h('div', { class: 'choices pics3' }, ...buttons.map((b) => b.el)), buttons }; });
  }
  /* 5. ng or nk? */
  function runNgnk(ctx) {
    ctx.setInstr('Listen. Does it end with ng or nk? Tap the ending.', 'ngnk');
    pickRounds(ctx, N.ngnk, (R) => { const slot = h('span', { class: 'chunkslot' }, '?');
      const buttons = ['ng', 'nk'].map((e) => { const el = h('button', { class: 'choice endchoice', type: 'button', 'data-w': e, style: 'color:' + (e === 'nk' ? NKCOL : '#0E8584') }, e); el.addEventListener('click', () => { if (e === R.answer) { slot.textContent = e; slot.style.color = el.style.color; } }); return { word: e, ok: e === R.answer, el }; });
      return { body: h('div', null, h('div', { class: 'wordframe' }, h('span', { class: 'onset' }, R.onset), slot), h('div', { class: 'choices two' }, ...buttons.map((b) => b.el))), buttons }; });
  }
  /* 6. Heart words */
  function runHeart(ctx) {
    ctx.setInstr('Tap each heart word to hear it.', 'heart'); const seen = new Set();
    const row = h('div', { class: 'hearts' }, ...N.heart.map((it) => h('button', { class: 'heartchip', type: 'button', onclick: (e) => {
      e.currentTarget.classList.add('seen'); seen.add(it.w); ctx.progress(seen.size / N.heart.length); Snd.seq([AU.w(it.w), 'audio/nk_hx_' + it.w + '.mp3'], 200);
      if (seen.size === N.heart.length) done.classList.add('glow'); } }, h('span', { class: 'heartmark', 'aria-hidden': 'true' }, '\u2665'), h('span', { class: 'word' }, it.w))));
    const done = h('button', { class: 'btn big primary', type: 'button', onclick: () => ctx.finish(3) }, 'I know my heart words', icon('check'));
    ctx.stage.append(h('div', { class: 'activity' }, h('p', { class: 'bigprompt' }, 'Heart words'), row, h('div', { class: 'row center' }, done)));
    Snd.play(AU.p('heart'));
  }
  function wordsInto(el, pg) { el.innerHTML = ''; pg.words.forEach((w, k) => el.append(h('span', { class: 'w', 'data-k': k }, w), ' ')); }
  function hl(pg, ws) { return (t) => pg.t.forEach((tt, k) => { const e = ws[k]; if (!e) return; e.classList.toggle('hl', t >= tt[0] - 0.04 && t < (pg.t[k + 1] ? pg.t[k + 1][0] - 0.04 : 99)); e.classList.toggle('read', t >= tt[1]); }); }
  /* 7. Story Time: same behaviour as ng Story Time (auto-read each page, Read again / Next page / Previous page, Finish, tap-to-hear fallback) */
  function runListen(ctx) {
    ctx.setInstr('Listen to the story and follow along.', 'listen'); const st = ctx.stage;
    const pages = N.story; let p = 0, token = 0, mode = 'reading', finished = false; const heard = new Set();
    const picEl = h('img', { class: 'panel', alt: '' }); const sentEl = h('p', { class: 'sentence', 'aria-live': 'polite' });
    const dots = h('div', { class: 'pagedots' }, ...pages.map(() => h('i'))); const label = h('p', { class: 'small story-say' }); const ctl = h('div', { class: 'row center story-ctl' });
    const allHeard = () => heard.size >= pages.length; const firstUnheard = () => pages.findIndex((_, k) => !heard.has(k));
    const btn = (cls, ico, text, fn) => { const b = h('button', { class: 'btn big ' + cls, type: 'button' }, ico ? icon(ico) : null, text); b.addEventListener('click', fn); return b; };
    function renderCtl() { ctl.innerHTML = ''; const last = p === pages.length - 1; const prev = p > 0 ? btn('story-prev', 'back', 'Previous page', () => goPage(p - 1)) : null;
      if (mode === 'reading') { label.textContent = 'Page ' + (p + 1) + ' of ' + pages.length + '. Listening\u2026'; ctl.append(...[prev, btn('story-stop', 'pause', 'Stop', () => { halt(); mode = 'stopped'; renderCtl(); })].filter(Boolean)); }
      else if (mode === 'blocked') { label.textContent = 'Page ' + (p + 1) + ' of ' + pages.length; ctl.append(...[prev, btn('primary story-tap', 'speaker', 'Tap to hear this page', () => playPage())].filter(Boolean)); }
      else { label.textContent = 'Page ' + (p + 1) + ' of ' + pages.length + '. Read it again, or go on.'; const u = firstUnheard(); let t = 'Next page', fn = () => goPage(p + 1);
        if (last) { if (allHeard()) { t = 'Finish'; fn = finishNow; } else { t = 'Hear page ' + (u + 1); fn = () => goPage(u); } }
        const nb = btn('primary story-nextpage glow', null, t, fn); nb.append(icon('next')); ctl.append(...[prev, btn('story-again', 'replay', 'Read again', () => playPage()), nb].filter(Boolean)); } }
    function setPage(i) { p = i; picEl.src = pages[p].img; wordsInto(sentEl, pages[p]); $$('i', dots).forEach((d, k) => { d.classList.toggle('cur', k === p); d.classList.toggle('seen', heard.has(k)); }); ctx.progress(heard.size / pages.length); }
    function playPage() { const pg = pages[p]; const ws = $$('.w', sentEl); const my = ++token; mode = 'reading'; Snd.hideFallback(); renderCtl();
      return Snd.play(pg.audio, { onTime: hl(pg, ws) }).then((ok) => { ws.forEach((e) => e.classList.remove('hl', 'read')); if (my !== token || !ctx.scr.ok()) return;
        if (ok) { heard.add(p); mode = 'done'; } else { mode = 'blocked'; Snd.hideFallback(); } setPage(p); renderCtl(); }); }
    const halt = () => { token++; Snd.stop(); };
    const finishNow = () => { if (finished) return; finished = true; halt(); ctx.finish(3); };
    const goPage = (i) => { halt(); setPage(i); playPage(); };
    ctx.setBack(() => { if (p > 0) { goPage(p - 1); return true; } return false; });
    ctx.setNext(() => { if (p < pages.length - 1) { goPage(p + 1); return true; } if (allHeard()) { finishNow(); return true; } return false; });
    st.append(h('div', { class: 'activity story listenmode' }, h('div', { class: 'panelwrap' }, picEl), h('div', { class: 'sentrow' }, sentEl), dots, label, ctl));
    setPage(0); playPage();
    IR._nkStory = { heardAll: () => { pages.forEach((_, k) => heard.add(k)); mode = 'done'; setPage(pages.length - 1); renderCtl(); } };
  }
  /* 8. Now You Read It (same as ng) */
  function runRead(ctx) {
    ctx.setInstr('Tap a speaker to hear a sentence. Then you read it!', 'read'); ctx.showNav(false);
    const pages = N.story; let p = 0, reached = 0; const heard = new Set(); const S = IR.S(); S.reads = S.reads || {};
    const picEl = h('img', { class: 'panel', alt: '' }); const sentEl = h('p', { class: 'sentence' }); const dots = h('div', { class: 'pagedots' }, ...pages.map(() => h('i')));
    const spk = speakerBtn(() => play(), 'Hear this sentence'); spk.classList.add('huge');
    const prev = h('button', { class: 'btn small back', type: 'button' }, icon('back'), 'Back'); const next = h('button', { class: 'btn small primary next', type: 'button' }, 'Next', icon('next'));
    const reads = h('div', { class: 'reads' }); const readBtn = h('button', { class: 'btn small good', type: 'button' }, icon('check'), 'I read it to a grown-up');
    const readIt = () => heard.size >= pages.length || (S.reads.nk || 0) > 0;
    const renderReads = () => { const n = S.reads.nk || 0; reads.innerHTML = ''; reads.append(h('span', null, 'Read it 3 times: '), ...[0, 1, 2].map((k) => h('i', { class: 'rd' + (k < n ? ' on' : '') }))); };
    const setLbl = () => { next.firstChild.textContent = p === pages.length - 1 ? (readIt() ? 'Finish' : 'Next') : 'Next'; };
    readBtn.addEventListener('click', () => { S.reads.nk = Math.min(3, (S.reads.nk || 0) + 1); IR.save(); renderReads(); setLbl(); });
    function setPage(i) { p = i; reached = Math.max(reached, p); picEl.src = pages[p].img; wordsInto(sentEl, pages[p]); $$('i', dots).forEach((d, k) => { d.classList.toggle('cur', k === p); d.classList.toggle('seen', k <= reached); }); setLbl(); ctx.progress(reached / (pages.length - 1)); }
    function play() { const pg = pages[p]; const ws = $$('.w', sentEl); return Snd.play(pg.audio, { onTime: hl(pg, ws) }).then((ok) => { ws.forEach((e) => e.classList.remove('hl', 'read')); if (ok) { heard.add(p); setLbl(); } }); }
    prev.addEventListener('click', () => { if (p > 0) { setPage(p - 1); play(); } else ctx.goBack(); });
    next.addEventListener('click', () => { if (p < pages.length - 1) { setPage(p + 1); play(); } else { Snd.stop(); if (readIt()) ctx.finish(); else location.hash = '#/nk/comp'; } });
    ctx.stage.append(h('div', { class: 'activity story' }, h('div', { class: 'panelwrap' }, picEl), h('div', { class: 'sentrow' }, spk, sentEl), dots, h('div', { class: 'row' }, prev, next), h('div', { class: 'row' }, readBtn, reads)));
    renderReads(); setPage(0); Snd.play(AU.p('read'));
  }
  /* 9. Story Check (reusable comprehension type): question read aloud, 3 picture+word answers, gentle hint with the story page, no penalties */
  IR.runComprehension = function (ctx, items, opts) {
    let q = 0; const st = ctx.stage; const pages = opts.pages;
    const step = () => { const it = items[q]; ctx.progress(q / items.length); st.innerHTML = ''; let locked = false;
      const hint = h('div', { class: 'comphint', 'aria-live': 'polite' });
      const grid = h('div', { class: 'choices pics3' }, ...it.choices.map(([w, img]) => { const b = h('button', { class: 'choice picchoice', type: 'button', 'data-w': w, 'aria-label': w }, picFor(w, img), h('span', { class: 'pw' }, w));
        b.addEventListener('click', async () => { if (locked || b.classList.contains('tried')) return;
          if (w === it.answer) { locked = true; b.classList.add('right'); hint.innerHTML = ''; hint.append(h('p', { class: 'status' }, 'Yes! ' + w + '.')); await IR.ding(); await say(w); if (!ctx.scr.ok()) return; await sleep(500); if (!ctx.scr.ok()) return; q++; if (q < items.length) step(); else ctx.finish(3); }
          else { b.classList.add('tried'); const pg = pages[it.page - 1]; hint.innerHTML = '';
            hint.append(h('img', { class: 'hintthumb', src: pg.img, alt: 'Story page ' + it.page }), h('div', null, h('p', { class: 'hinttxt' }, opts.hintText(it, q)), h('p', { class: 'hintpage' }, 'Page ' + it.page + ': ' + pg.text)));
            Snd.seq([IR.A.sfx.tryagain, opts.hintAudio(q)], 150); } }); return b; }));
      st.append(h('div', { class: 'activity comp' }, h('p', { class: 'small' }, 'Question ' + (q + 1) + ' of ' + items.length), h('div', { class: 'compq' }, speakerBtn(() => Snd.play(opts.qAudio(q)), 'Hear the question'), h('p', { class: 'bigprompt' }, it.q)), grid, hint));
      Snd.play(opts.qAudio(q)); };
    ctx.setBack(() => { if (q > 0) { q--; step(); return true; } return false; });
    ctx.setNext(() => { if (q < items.length - 1) { q++; step(); return true; } return false; });
    step();
  };
  const HINTS = { recall: 'Look at this page again. Who pulls out what?', cause: 'Look at this page again. What hops out of the trunk?', sequence: 'Look at this page again. This came out first.', feeling: 'Look at this page again. Is the skunk glad, sad, or mad?' };
  function runComp(ctx) {
    ctx.setInstr('Think about the story. Listen, then tap the answer.', 'comp');
    IR.runComprehension(ctx, N.comp, { pages: N.story, qAudio: (q) => AU.p('q' + (q + 1)), hintAudio: (q) => AU.p('qh' + (q + 1)), hintText: (it) => HINTS[it.kind] });
  }
  /* 10. Rhyme Time (reusable): each line read aloud, child taps the rhyming word, small Zip/Frill reaction, then the whole poem plays back for read-along */
  IR.runRhymeTime = function (ctx, lines, opts) {
    let i = 0; const st = ctx.stage; const done = [];
    /* couplets: L.lead (read aloud, always shown) + L.line (ends in ___ = the tap word). Old single-line items (no lead) still work. */
    const tail = (L) => L.line.split('___');
    const poemBox = () => h('div', { class: 'poem' }, ...lines.flatMap((L, k) => { const shown = k < done.length || k === i; const out = [];
      if (L.lead) out.push(h('p', { class: 'pline lead' + (k === i ? ' cur' : ''), 'data-k': k }, shown ? L.lead : ''));
      out.push(h('p', { class: 'pline' + (k < done.length ? ' got' : '') + (k === i ? ' cur' : ''), 'data-k': k },
        k < done.length ? [tail(L)[0], h('b', { class: 'rw' }, L.answer), tail(L)[1]] : k === i ? [tail(L)[0], h('span', { class: 'blank' }, '\u00a0?\u00a0'), tail(L)[1]] : ''));
      return out; }));
    const step = () => { const L = lines[i]; ctx.progress(i / lines.length); st.innerHTML = ''; let locked = false;
      const react = h('div', { class: 'rreact', 'aria-live': 'polite' });
      const grid = h('div', { class: 'choices three' }, ...shuffle(L.choices).map((w) => { const b = h('button', { class: 'choice', type: 'button', 'data-w': w }, colorNk(w));
        b.addEventListener('click', async () => { if (locked || b.classList.contains('tried')) return; say(w);
          if (w === L.answer) { locked = true; b.classList.add('right'); done.push(w); const who = i % 2 ? 'frill' : 'zip';
            react.innerHTML = ''; react.append(h('img', { class: 'rchar ' + who, src: 'img/' + who + '.webp', alt: '' }), h('span', { class: 'rbubble' }, who === 'zip' ? 'Yes! That rhymes!' : 'Nice rhyme!'));
            await sleep(500); await Snd.seq([IR.A.sfx.ding, opts.yay(who), opts.full(i)], 150); if (!ctx.scr.ok()) return; await sleep(400); if (!ctx.scr.ok()) return; i++; if (i < lines.length) step(); else finale(); }
          else { b.classList.add('tried'); ctx.miss(); await sleep(300); Snd.seq([IR.A.sfx.tryagain, opts.line(i)], 150); } }); return b; }));
      st.append(h('div', { class: 'activity rhyme' }, h('p', { class: 'bigprompt' }, 'Rhyme Time'), poemBox(), h('div', { class: 'compq' }, speakerBtn(() => Snd.play(opts.line(i)), 'Hear the line again'), h('span', { class: 'small' }, 'Tap the word that rhymes.')), grid, react));
      Snd.play(opts.line(i)); };
    const finale = () => { ctx.progress(0.95); st.innerHTML = ''; i = lines.length; ctx.setNextLabel('Finish'); const box = poemBox();
      const playAll = async () => { Snd.stop(); const id = Snd.id; const ps = $$('.pline', box); await Snd.play(opts.end, { keep: true });
        for (let k = 0; k < ps.length; k++) { if (Snd.id !== id) return; ps.forEach((x) => x.classList.remove('hlline')); ps[k].classList.add('hlline'); await Snd.play(opts.pline && lines[0].lead ? opts.pline(k) : opts.full(k), { keep: true }); await sleep(300); }
        ps.forEach((x) => x.classList.remove('hlline')); };
      st.append(h('div', { class: 'activity rhyme' }, h('p', { class: 'bigprompt' }, 'Read the whole poem!'), box,
        h('div', { class: 'row center' }, h('button', { class: 'btn', type: 'button', onclick: playAll }, icon('replay'), 'Play the poem'), h('button', { class: 'btn primary', type: 'button', onclick: () => ctx.finish() }, 'Finish', icon('next')))));
      playAll(); };
    ctx.setBack(() => { if (i > 0 && i < lines.length) { i--; done.length = Math.min(done.length, i); step(); return true; } return false; });
    ctx.setNext(() => { if (i < lines.length - 1) { done.push(lines[i].answer); i++; step(); return true; } if (i === lines.length - 1) { done.push(lines[i].answer); finale(); return true; } if (i >= lines.length) { ctx.finish(); return true; } return false; });
    step();
  };
  function runRhyme(ctx) {
    ctx.setInstr('Listen to each line. Tap the word that rhymes.', 'rhyme');
    IR.runRhymeTime(ctx, N.rhyme, { line: (k) => AU.p('r' + (k + 1)), full: (k) => AU.p('rf' + (k + 1)), yay: (who) => AU.p(who === 'zip' ? 'yay_z' : 'yay_f'), end: AU.p('rhyme_end'), pline: (k) => AU.p('rl' + (k + 1)) });
  }
  /* 11. Zip's Check: 10 items, 9-10 move on, 7-8 review, <=6 re-teach, sticker on the map */
  function runCheck(ctx) {
    const items = N.check; let q = 0, tok = 0; const recs = []; const st = ctx.stage; ctx.setInstr('', null);
    const finish = () => { const S = IR.S(); const score = recs.filter(Boolean).length; S.nkCheck = S.nkCheck || { best: null, attempts: 0 };
      S.nkCheck.last = score; S.nkCheck.attempts++; S.nkCheck.best = Math.max(S.nkCheck.best || 0, score); if (score >= 9) S.nkSticker = true;
      IR.recordActivity('nk_check', score >= 9 ? 3 : score >= 7 ? 2 : 1); IR.touchStreak(); IR.save(); location.hash = '#/nk/result'; };
    const step = () => { if (q >= items.length) return finish(); const it = items[q]; const my = ++tok; ctx.progress(q / items.length); st.innerHTML = '';
      const status = h('p', { class: 'status' }, 'Question ' + (q + 1) + ' of ' + items.length); let locked = false;
      const ans = async (ok, b) => { if (locked) return; locked = true; recs[q] = !!ok; b.classList.add('picked'); $$('.choice', st).forEach((x) => { if (x !== b) x.classList.add('fade'); });
        status.textContent = 'Thank you! Next one.'; Snd.play(IR.A.sfx.tap); const qq = q; await sleep(700); if (!ctx.scr.ok() || my !== tok || q !== qq) return; q++; step(); };
      const body = h('div', { class: 'activity' });
      if (it.silly) body.append(h('div', { class: 'sillytag' }, h('img', { src: 'img/zip.webp', alt: '' }), h('span', null, 'Zip\u2019s silly word!')));
      if (it.type === 'pick') { const spk = speakerBtn(() => say(it.word), 'Hear the word'); spk.classList.add('huge');
        body.append(spk, h('div', { class: 'choices' }, ...shuffle(it.choices).map((w) => { const b = h('button', { class: 'choice', type: 'button', 'data-w': w }, w); b.addEventListener('click', () => ans(w === it.word, b)); return b; }))); say(it.word); }
      else if (it.type === 'end') { const spk = speakerBtn(() => say(it.word), 'Hear the word'); spk.classList.add('huge'); const slot = h('span', { class: 'chunkslot' }, '?');
        body.append(spk, h('div', { class: 'wordframe' }, h('span', { class: 'onset' }, it.onset), slot), h('div', { class: 'choices two' }, ...['ng', 'nk'].map((e) => { const b = h('button', { class: 'choice', type: 'button', 'data-w': e }, e); b.addEventListener('click', () => { slot.textContent = e; ans(e === it.answer, b); }); return b; })));
        Snd.seq([AU.p('end'), AU.w(it.word)], 200); }
      else { body.append(h('p', { class: 'bigprompt' }, 'Tap the word that has nk.'), speakerBtn(() => Snd.play(AU.p('which')), 'Hear the question'),
          h('div', { class: 'choices' }, ...shuffle(it.choices).map((w) => { const b = h('button', { class: 'choice', type: 'button', 'data-w': w }, w); b.addEventListener('click', () => ans(w === it.answer, b)); return b; }))); Snd.play(AU.p('which')); }
      body.append(status); st.append(body); };
    let inQ = false;
    ctx.setNext(() => { if (!inQ) { inQ = true; step(); return true; } tok++; if (q < items.length - 1) { q++; step(); return true; } if (items.every((_, k) => recs[k] !== undefined)) { finish(); return true; } return false; });
    ctx.setBack(() => { if (!inQ) return false; tok++; if (q > 0) { q--; step(); } else { inQ = false; intro(); } return true; });
    const intro = () => { st.innerHTML = ''; ctx.progress(0); st.append(h('div', { class: 'activity' }, h('p', { class: 'bigprompt' }, 'Zip\u2019s Check'), h('p', null, '10 quick questions. There is no rush!'),
      h('button', { class: 'btn big primary', type: 'button', onclick: () => { inQ = true; step(); } }, 'Start the check', icon('next')))); };
    intro(); Snd.play(AU.p('check'));
  }
  function resultPage(app) {
    IR.newScreen(); const S = IR.S(); const score = (S.nkCheck && S.nkCheck.last) || 0; const wrap = h('div', { class: 'result' });
    const trail = h('button', { class: 'btn big back', type: 'button', onclick: () => { location.hash = '#/nk'; } }, icon('back'), 'Back to the trail');
    const again = h('button', { class: 'btn big next', type: 'button', onclick: () => { location.hash = '#/nk/check'; } }, 'Try the check again');
    const home = h('button', { class: 'btn big primary next', type: 'button', onclick: () => { location.hash = '#/home'; } }, 'See the sky map');
    if (score < 7) wrap.append(h('img', { class: 'char zip big', src: 'img/zip.webp', alt: 'Zip' }));
    if (score >= 9) wrap.append(h('div', { class: 'badgeart', html: IR.ICON.badge }), h('h1', null, 'nk sticker!'), h('p', { class: 'lead' }, 'Your nk sticker is on the map.'), h('p', null, 'You got ' + score + ' out of 10.'), h('div', { class: 'row' }, home, trail));
    else if (score >= 7) wrap.append(h('h1', null, 'Review islet'), h('p', { class: 'lead' }, 'Good work! Let\u2019s practice a little more, then try again.'), h('p', null, 'You got ' + score + ' out of 10. Replay Hear and Pick or ng or nk?, then take the check again.'), h('div', { class: 'row' }, trail, again));
    else wrap.append(h('h1', null, 'Re-teach islet'), h('p', { class: 'lead' }, 'Thank you for trying! Let\u2019s learn nk again with a grown-up.'), h('p', null, 'You got ' + score + ' out of 10. A grown-up can teach the nk sound again with you, then try the check again.'), h('div', { class: 'row' }, trail, again));
    if (score >= 7) wrap.prepend(IR.celebration(score >= 9));
    app.append(h('div', { class: 'screen resultscreen' }, h('div', { class: 'unitbar' }, IR.ui.homeButton()), wrap)); Snd.play(score >= 9 ? IR.A.sfx.gong : IR.A.sfx.done);
  }
  /* Island 3 Review: ng and nk mixed */
  function reviewPage(app) {
    const fake = { id: 'review', rec: 'i3_review', title: 'Unit 3 Review', color: '#0E8584', run: (ctx) => {
      ctx.setInstr('Listen. Is it ng or nk? Tap the word you hear.', 'review');
      pickRounds(ctx, N.review, (R) => { const buttons = shuffle(R.choices).map((w) => ({ word: w, ok: w === R.word, el: h('button', { class: 'choice', type: 'button', 'data-w': w }, colorNk(w)) }));
        return { body: h('div', { class: 'choices two' }, ...buttons.map((b) => b.el)), buttons }; }, () => ctx.finish());
      Snd.play(AU.p('review')); } };
    stepScreen(app, STEPS.length - 1, fake);
    $('.nkstep').classList.add('reviewstep'); $('.nkstep .pbar').style.display = 'none';
  }
  IR.nkRoute = function (hash, app) {
    let m;
    if (hash === '#/nk' || hash === '#/nk/') { unitPage(app); return true; }
    if (hash.startsWith('#/nk/result')) { resultPage(app); return true; }
    if ((m = /^#\/nk\/(\w+)/.exec(hash))) { const i = STEPS.findIndex((s) => s.id === m[1]); if (i < 0) return false; stepScreen(app, i); return true; }
    if (hash.startsWith('#/review3')) { reviewPage(app); return true; }
    return false;
  };
})();

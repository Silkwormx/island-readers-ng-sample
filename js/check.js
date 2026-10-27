/* Zip's Check: 10 items, scored, gentle outcomes. Positive messages only. */
(function () {
  'use strict';
  const IR = window.IR;
  const { D, h, $$, sleep, shuffle, icon, Snd, A, speakerBtn, colorWord, CHUNK_COLORS } = IR;

  function runCheck(ctx) {
    const items = D.check; let q = 0, qtoken = 0; const stage = ctx.stage; const recs = [];   /* recs[q] = was the answer right; Back never throws recorded answers away */
    ctx.setInstr("Zip's check. Do your best. Take your time.", 'p_check');
    function finish() {
      const S = IR.S(); const score = recs.filter(Boolean).length;
      S.check.last = score; S.check.attempts = (S.check.attempts || 0) + 1;
      S.check.best = Math.max(S.check.best == null ? 0 : S.check.best, score);
      if (score >= 9) { S.sticker = true; S.badge = true; }
      IR.recordActivity('check', score >= 9 ? 3 : score >= 7 ? 2 : 1);
      IR.touchStreak(); IR.save();
      location.hash = '#/result';
    }
    function step() {
      if (q >= items.length) return finish();
      const it = items[q]; const my = ++qtoken; ctx.progress(q / items.length); stage.innerHTML = '';
      const status = h('p', { class: 'status' }, 'Question ' + (q + 1) + ' of ' + items.length);
      let locked = false;
      const answered = async (ok, btn) => {
        if (locked) return; locked = true; recs[q] = !!ok;
        btn.classList.add('picked'); $$('.choice', stage).forEach((b) => { if (b !== btn) b.classList.add('fade'); });
        status.textContent = 'Thank you! Next one.';
        Snd.play(A.sfx.tap); const qq = q; await sleep(700); if (!ctx.scr.ok() || my !== qtoken || q !== qq) return; q++; step();
      };
      const body = h('div', { class: 'activity' });
      if (it.silly) body.append(h('div', { class: 'sillytag' }, h('img', { src: 'img/zip.webp', alt: '' }), h('span', null, 'Zip\u2019s silly word!')));
      if (it.type === 'pick') {
        const spk = speakerBtn(() => IR.sayWord(it.word), 'Hear the word'); spk.classList.add('huge');
        const grid = h('div', { class: 'choices' });
        shuffle(it.choices).forEach((w) => { const b = h('button', { class: 'choice', type: 'button' }, w); b.addEventListener('click', () => answered(w === it.word, b)); grid.append(b); });
        body.append(spk, grid); IR.sayWord(it.word);
      } else if (it.type === 'chunk') {
        const spk = speakerBtn(() => IR.sayWord(it.word), 'Hear the word'); spk.classList.add('huge');
        const slot = h('span', { class: 'chunkslot' }, '?');
        const grid = h('div', { class: 'choices chunks' });
        shuffle(D.chunks).forEach((c) => {
          const b = h('button', { class: 'choice', type: 'button', style: 'color:' + CHUNK_COLORS[c] }, c);
          b.addEventListener('click', () => { slot.textContent = c; slot.style.color = CHUNK_COLORS[c]; answered(c === it.answer, b); }); grid.append(b);
        });
        body.append(spk, h('div', { class: 'wordframe' }, h('span', { class: 'onset' }, it.onset), slot), grid);
        Snd.seq([A.prompt('p_chunk'), A.word(it.word)], 200);
      } else {
        const grid = h('div', { class: 'choices' });
        shuffle(it.choices).forEach((w) => { const b = h('button', { class: 'choice', type: 'button' }, w); b.addEventListener('click', () => answered(w === it.answer, b)); grid.append(b); });
        body.append(h('p', { class: 'bigprompt' }, 'Tap the word that has the ng hum.'), speakerBtn(() => Snd.play(A.prompt('p_which')), 'Hear the question'), grid);
        Snd.play(A.prompt('p_which'));
      }
      body.append(status); stage.append(body);
    }
    ctx.setInstr('', null);
    let inQuestions = false;
    /* Next = skip ahead: moves to the next question WITHOUT scoring or recording anything (unanswered stays not-yet-answered); on the last question it opens the result only if every question was answered, else it returns to the trail */
    ctx.setNext(() => {
      if (!inQuestions) { inQuestions = true; step(); return true; }
      qtoken++;
      if (q < items.length - 1) { q++; step(); return true; }
      if (items.every((_, k) => recs[k] !== undefined)) { finish(); return true; }
      return false;
    });
    ctx.setBack(() => { if (!inQuestions) return false; qtoken++; if (q > 0) { q--; step(); } else { inQuestions = false; intro(); } return true; });
    function intro() {
      stage.innerHTML = ''; ctx.progress(0); ctx.setInstr('', null);
      stage.append(h('div', { class: 'activity' }, h('p', { class: 'bigprompt' }, 'Zip\u2019s Check'), h('p', null, '10 quick questions. There is no rush!'),
        h('button', { class: 'btn big primary', type: 'button', onclick: () => { inQuestions = true; step(); } }, 'Start the check', icon('next'))));
    }
    intro();
    Snd.play(A.prompt('p_check'));
  }

  function renderResult(root) {
    const S = IR.S(); const score = S.check.last == null ? 0 : S.check.last;
    const wrap = h('div', { class: 'result' });
    const home = h('button', { class: 'btn big primary next', type: 'button', onclick: () => { location.hash = '#/home'; } }, 'See the sky map');
    const trail = h('button', { class: 'btn big back', type: 'button', onclick: () => { location.hash = '#/island3'; } }, icon('back'), 'Back to the trail');
    const again = h('button', { class: 'btn big next', type: 'button', onclick: () => { location.hash = '#/check'; } }, 'Try the check again');
    if (score < 7) wrap.append(h('img', { class: 'char zip big', src: 'img/zip.webp', alt: 'Zip' }));
    if (score >= 9) {
      wrap.append(h('div', { class: 'badgeart', html: IR.ICON.badge }),
        h('h1', null, 'Island badge!'), h('p', { class: 'lead' }, IR.unitComplete() ? 'The bridge lights up!' : 'Get every star to light the bridge.'),
        h('p', null, 'You got ' + score + ' out of 10. Your ng sticker is on the map.'),
        h('div', { class: 'bridge-demo' }, h('i'), h('i'), h('i'), h('i'), h('i')),
        h('div', { class: 'row' }, home, trail));
    } else if (score >= 7) {
      wrap.append(h('h1', null, 'Review islet'), h('p', { class: 'lead' }, 'Good work! Let\u2019s practice a little more, then try again.'),
        h('p', null, 'You got ' + score + ' out of 10. Replay Hear and Pick or Build-a-Word, then take the check again.'),
        h('div', { class: 'row' }, trail, again));
    } else {
      wrap.append(h('h1', null, 'Re-teach islet'), h('p', { class: 'lead' }, 'Thank you for trying! Let\u2019s learn ng again with a grown-up.'),
        h('p', null, 'You got ' + score + ' out of 10. A grown-up can teach the ng sound again with you. Then you can start a fresh trail and try the check again.'),
        h('div', { class: 'row' }, trail, again));
    }
    if (score >= 7) wrap.prepend(IR.celebration(score >= 9));
    root.append(wrap); try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } Snd.play(score >= 9 ? A.sfx.gong : A.sfx.done);
  }
  IR.runCheck = runCheck; IR.renderResult = renderResult;
})();

/* Tap-or-drag tile board used by Build-a-Word and Sentence Bridge. */
(function () {
  'use strict';
  const { h, $$ } = window.IR;

  /* opts: tiles [{id,text,cls,style}], nSlots, slotsEl, bankEl, onFull(texts, board), onChange() */
  function TileBoard(opts) {
    const board = {
      tiles: opts.tiles, slots: new Array(opts.nSlots).fill(null), locked: false, hint: null,
      texts() { return this.slots.map((id) => (id == null ? null : this.tiles.find((t) => t.id === id).text)); },
      clear() { this.slots.fill(null); render(); },
      render: () => render()
    };
    function tileEl(t) {
      const el = h('button', { type: 'button', class: 'tile ' + (t.cls || ''), 'data-id': t.id, style: t.style || '' }, t.text);
      if (board.hint === t.id) el.classList.add('hint');
      attach(el, t.id);
      return el;
    }
    function render() {
      opts.slotsEl.innerHTML = ''; opts.bankEl.innerHTML = '';
      board.slots.forEach((id, i) => {
        const slot = h('div', { class: 'slot' + (id != null ? ' filled' : ''), 'data-i': i });
        if (id != null) slot.append(tileEl(board.tiles.find((t) => t.id === id)));
        opts.slotsEl.append(slot);
      });
      board.tiles.filter((t) => !board.slots.includes(t.id)).forEach((t) => opts.bankEl.append(tileEl(t)));
      if (opts.onChange) opts.onChange(board);
    }
    function tap(id) {
      if (board.locked) return;
      const si = board.slots.indexOf(id);
      if (si >= 0) board.slots[si] = null;
      else { const e = board.slots.indexOf(null); if (e < 0) return; board.slots[e] = id; }
      render(); checkFull();
    }
    function dropOn(id, slotIdx) {
      const old = board.slots.indexOf(id);
      if (old >= 0) board.slots[old] = null;
      board.slots[slotIdx] = id; render(); checkFull();
    }
    function checkFull() {
      if (board.slots.every((s) => s != null) && opts.onFull) opts.onFull(board.texts(), board);
    }
    function slotAt(x, y) {
      const els = $$('.slot', opts.slotsEl);
      for (let i = 0; i < els.length; i++) {
        const r = els[i].getBoundingClientRect();
        if (x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 10) return i;
      }
      return null;
    }
    function attach(el, id) {
      el.addEventListener('click', (e) => { if (e.detail === 0) tap(id); }); /* assistive tech / keyboard activation */
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(id); } });
      el.addEventListener('pointerdown', (e) => {
        if (board.locked || e.button > 0) return;
        const sx = e.clientX, sy = e.clientY; let ghost = null, moved = false;
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* */ }
        const move = (ev) => {
          if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 9) {
            moved = true; ghost = el.cloneNode(true); ghost.classList.add('ghost'); document.body.append(ghost); el.classList.add('dragging');
          }
          if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
        };
        const up = (ev) => {
          el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
          if (!moved) { tap(id); return; }
          ghost.remove();
          const tgt = slotAt(ev.clientX, ev.clientY);
          if (tgt != null) dropOn(id, tgt);
          else { const si = board.slots.indexOf(id); if (si >= 0) { board.slots[si] = null; } render(); }
        };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      });
    }
    render();
    return board;
  }
  window.IR.TileBoard = TileBoard;
})();

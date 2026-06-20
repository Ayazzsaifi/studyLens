const Flashcards = (() => {
  async function make() {
    const text = State.summary || document.getElementById('notes-input').value.trim();
    if (!text) { UI.showToast('Summarize notes first!', 'info'); return; }
    UI.goto('flashcards', document.querySelector('[data-page="flashcards"]'));
    const area = document.getElementById('fc-area'), ctrl = document.getElementById('fc-controls');
    area.innerHTML = `<div class="card">${UI.loadingHTML('Creating flashcards…')}</div>`;
    if (ctrl) ctrl.style.display = 'none';
    try {
      State.flashcards = await API.generateFlashcards(text);
      State.fcFlipped = new Set();
      document.getElementById('fc-count').textContent = State.flashcards.length;
      if (ctrl) ctrl.style.display = 'flex';
      render();
      Dashboard.addActivity('Flashcards created', State.subject, State.flashcards.length + ' cards', 'blue');
      UI.showToast('🃏 ' + State.flashcards.length + ' flashcards ready!', 'success');
    } catch (e) {
      area.innerHTML = `<div class="card"><p style="color:var(--danger);font-size:14px;">Could not generate flashcards.<br><small>${e.message}</small></p></div>`;
    }
  }

  function render() {
    const area = document.getElementById('fc-area');
    if (!State.flashcards.length) { area.innerHTML = `<div class="card"><div class="empty-state">No flashcards loaded.</div></div>`; return; }
    const total = State.flashcards.length, pct = Math.round(State.fcFlipped.size / total * 100);
    let html = `<div class="card" style="padding:16px 20px;"><div class="fc-progress">
      <span style="font-size:12px;color:var(--text2);">${State.fcFlipped.size} / ${total} reviewed</span>
      <div class="fc-progress-bar"><div class="fc-progress-fill" style="width:${pct}%"></div></div>
      <span style="font-size:12px;color:var(--text3);">${pct}%</span></div></div><div class="fc-grid">`;
    State.flashcards.forEach((fc, i) => {
      const flipped = State.fcFlipped.has(i) ? ' flipped' : '';
      html += `<div class="fc-wrap${flipped}" id="fc-${i}" onclick="Flashcards.flip(${i})"><div class="fc-inner">
        <div class="fc-face fc-front"><div class="fc-card-num">CARD ${i+1} / ${total}</div>
        <div style="font-weight:500;font-size:14px;">${fc.front}</div><div class="fc-hint">tap to flip ↓</div></div>
        <div class="fc-face fc-back"><div class="fc-card-num">ANSWER</div>
        <div style="font-size:13px;line-height:1.6;">${fc.back}</div></div></div></div>`;
    });
    html += '</div>';
    area.innerHTML = html;
  }

  function flip(i) {
    const card = document.getElementById('fc-' + i);
    if (!card) return;
    const wasFlipped = State.fcFlipped.has(i);
    card.classList.toggle('flipped');
    if (!wasFlipped) {
      State.fcFlipped.add(i);
      State.fcReviewed++;
      document.getElementById('d-cards').textContent = State.fcReviewed;
      State.persist();
    } else { State.fcFlipped.delete(i); }
    const total = State.flashcards.length, pct = Math.round(State.fcFlipped.size / total * 100);
    const fill = document.querySelector('.fc-progress-fill');
    const label = document.querySelector('.fc-progress span:first-child');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = State.fcFlipped.size + ' / ' + total + ' reviewed';
    const pctLbl = document.querySelector('.fc-progress span:last-child');
    if (pctLbl) pctLbl.textContent = pct + '%';
  }

  function shuffleAll() {
    if (!State.flashcards.length) return;
    const arr = [...State.flashcards];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    State.flashcards = arr; State.fcFlipped = new Set();
    render();
    UI.showToast('🔀 Cards shuffled!', 'info');
  }

  function resetAll() { State.fcFlipped = new Set(); render(); UI.showToast('↺ Cards reset!', 'info'); }

  return { make, render, flip, shuffleAll, resetAll };
})();

const Tutor = (() => {

  function _notesText() {
    return State.summary || document.getElementById('notes-input').value.trim();
  }

  async function start() {
    const notes = _notesText();
    if (!notes) { UI.showToast('Add notes on the Notes page first!', 'info'); return; }
    State.tutorNotes = notes;
    State.tutorAsked = [];
    State.tutorCorrect = 0;
    State.tutorTotal = 0;
    document.getElementById('tutor-area').innerHTML = '';
    UI.goto('tutor', document.querySelector('[data-page="tutor"]'));
    await _askNext();
  }

  async function _askNext() {
    const area = document.getElementById('tutor-area');
    const loadingId = 'tutor-loading-' + Date.now();
    area.insertAdjacentHTML('beforeend', `<div class="card" id="${loadingId}">${UI.loadingHTML('Thinking of a question…')}</div>`);
    area.scrollIntoView({ behavior: 'smooth', block: 'end' });

    try {
      const q = await API.tutorQuestion(State.tutorNotes, State.tutorAsked);
      State.tutorCurrent = q;
      State.tutorAsked.push(q.question);
      document.getElementById(loadingId).remove();

      area.insertAdjacentHTML('beforeend', `
        <div class="tutor-msg ai">
          <strong>🧑‍🏫 Question ${State.tutorTotal + 1}:</strong><br>${q.question}
          <div class="tutor-input-row">
            <input type="text" id="tutor-answer-input" placeholder="Type your answer…" onkeydown="if(event.key==='Enter')Tutor.submitAnswer()">
            <button class="btn btn-primary" onclick="Tutor.submitAnswer()">Submit</button>
          </div>
        </div>`);
      document.getElementById('tutor-answer-input').focus();
    } catch (e) {
      document.getElementById(loadingId).innerHTML = `<p style="color:var(--danger);font-size:14px;">⚠ Could not generate question: ${e.message}</p>`;
    }
  }

  async function submitAnswer() {
    const input = document.getElementById('tutor-answer-input');
    if (!input) return;
    const answer = input.value.trim();
    if (!answer) { UI.showToast('Type an answer first!', 'info'); return; }

    input.disabled = true;
    const row = input.closest('.tutor-input-row');
    row.innerHTML = `<span style="color:var(--text3);font-size:13px;">Checking your answer…</span>`;

    const q = State.tutorCurrent;
    try {
      const result = await API.tutorEvaluate(State.tutorNotes, q.question, q.idealAnswer, q.sourceHint, answer);
      State.tutorTotal++;
      const cls = result.verdict === 'correct' ? 'correct' : 'wrong';
      const icon = result.verdict === 'correct' ? '✅' : result.verdict === 'partial' ? '🟡' : '❌';
      if (result.verdict === 'correct') State.tutorCorrect++;

      const area = document.getElementById('tutor-area');
      area.insertAdjacentHTML('beforeend', `
        <div class="tutor-msg ${cls}">
          <strong>${icon} Your answer:</strong> "${answer}"<br><br>
          ${result.feedback}
        </div>`);
      area.scrollIntoView({ behavior: 'smooth', block: 'end' });

      Dashboard.addActivity('Tutor session', State.subject, State.tutorCorrect + '/' + State.tutorTotal, result.verdict === 'correct' ? 'green' : 'amber');

      area.insertAdjacentHTML('beforeend', `
        <div class="btn-row" style="margin-bottom:14px;">
          <button class="btn btn-primary" onclick="Tutor.next()">➡ Next Question</button>
          <button class="btn" onclick="Tutor.finish()">🏁 Finish Session</button>
        </div>`);
    } catch (e) {
      row.innerHTML = `<span style="color:var(--danger);font-size:13px;">Error: ${e.message}</span>`;
    }
  }

  async function next() {
    document.querySelectorAll('#tutor-area .btn-row').forEach(el => el.remove());
    await _askNext();
  }

  function finish() {
    const area = document.getElementById('tutor-area');
    const pct = State.tutorTotal ? Math.round(State.tutorCorrect / State.tutorTotal * 100) : 0;
    area.insertAdjacentHTML('beforeend', `
      <div class="quiz-score">
        <div class="big">${State.tutorCorrect} <span style="font-size:28px;color:var(--text3);">/ ${State.tutorTotal}</span></div>
        <div class="score-label">${pct}% correct this session</div>
        <div class="btn-row" style="justify-content:center;margin-top:18px;">
          <button class="btn btn-primary" onclick="Tutor.start()">🔄 New Session</button>
        </div>
      </div>`);
    area.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  return { start, submitAnswer, next, finish };
})();

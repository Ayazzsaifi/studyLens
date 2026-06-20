const Quiz = (() => {
  async function make() {
    const text = State.summary || document.getElementById('notes-input').value.trim();
    if (!text) { UI.showToast('Summarize notes first!', 'info'); return; }
    UI.goto('quiz', document.querySelector('[data-page="quiz"]'));
    const area = document.getElementById('quiz-area'), subBadge = document.getElementById('quiz-subject-badge');
    area.innerHTML = `<div class="card">${UI.loadingHTML('Generating 5-question quiz…')}</div>`;
    State.quizAnswers = {};
    if (State.subject) { subBadge.textContent = '📚 ' + State.subject; subBadge.style.display = 'inline-flex'; }
    try {
      State.quizData = await API.generateQuiz(text);
      render();
      UI.showToast('🎯 Quiz ready!', 'success');
    } catch (e) {
      area.innerHTML = `<div class="card"><p style="color:var(--danger);font-size:14px;">⚠ Could not generate quiz.<br><small>${e.message}</small></p></div>`;
    }
  }

  function render() {
    const area = document.getElementById('quiz-area');
    if (!State.quizData.length) { area.innerHTML = `<div class="card"><div class="empty-state">No quiz loaded yet.</div></div>`; return; }
    const totalAnswered = Object.keys(State.quizAnswers).length, totalQ = State.quizData.length;

    let pipsHTML = '<div class="quiz-q-progress">';
    State.quizData.forEach((q, i) => {
      const answered = State.quizAnswers[i] !== undefined, correct = answered && State.quizAnswers[i] === q.answer;
      pipsHTML += `<div class="quiz-q-pip${answered ? (correct ? ' correct' : ' wrong') : ''}"></div>`;
    });
    pipsHTML += '</div>';
    let html = pipsHTML;

    State.quizData.forEach((q, qi) => {
      const answered = State.quizAnswers[qi] !== undefined;
      const opts = q.options.map((opt, oi) => {
        let cls = 'quiz-opt';
        if (answered) { if (oi === q.answer) cls += ' correct'; else if (State.quizAnswers[qi] === oi) cls += ' wrong'; }
        return `<button class="${cls}" onclick="Quiz.answer(${qi},${oi})" ${answered ? 'disabled' : ''}>
          <span style="opacity:.5;margin-right:6px;font-size:12px;">${String.fromCharCode(65+oi)}</span> ${opt}</button>`;
      }).join('');
      const explanation = (answered && q.explanation) ? `<div class="quiz-explanation">💡 ${q.explanation}</div>` : '';
      html += `<div class="quiz-block"><div class="quiz-q-num">Question ${qi+1} of ${totalQ}</div><div class="quiz-q">${q.q}</div>${opts}${explanation}</div>`;
    });

    if (totalAnswered === totalQ) {
      const score = State.quizData.filter((_, i) => State.quizAnswers[i] === State.quizData[i].answer).length;
      const pct = Math.round(score / totalQ * 100);
      const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📖';
      const msg = pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort! Review what you missed.' : 'Review your notes and try again.';
      html += `<div class="quiz-score"><div class="big">${score} <span style="font-size:28px;color:var(--text3);">/ ${totalQ}</span></div>
        <div class="score-label">${pct}% correct</div><div class="score-msg">${emoji} ${msg}</div>
        <div class="btn-row" style="justify-content:center;margin-top:18px;">
          <button class="btn btn-green btn-sm" onclick="Quiz.save(${score})">💾 Save Quiz</button>
          <button class="btn btn-sm" onclick="Quiz.make()">🔄 New Quiz</button></div></div>`;
      Dashboard.addActivity('Quiz completed', State.subject, score + '/' + totalQ, pct >= 70 ? 'green' : 'amber');
    }
    area.innerHTML = html;
  }

  function answer(qi, oi) {
    if (State.quizAnswers[qi] !== undefined) return;
    State.quizAnswers[qi] = oi;
    render();
  }

  function save(score) {
    const pct = Math.round(score / State.quizData.length * 100);
    State.quizzesSaved++;
    document.getElementById('d-quizzes').textContent = State.quizzesSaved;
    const scoreEl = document.getElementById('d-score');
    const current = parseInt(scoreEl.textContent) || 0;
    scoreEl.textContent = Math.round((current + pct) / (current ? 2 : 1)) + '%';
    Dashboard.updateSubjectBar(State.subject, pct);
    State.persist();
    UI.showToast('✅ Quiz saved!', 'success');
  }

  return { make, render, answer, save };
})();

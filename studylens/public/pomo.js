const Pomo = (() => {
  const FOCUS = 25*60, BREAK = 5*60;
  let secondsLeft = FOCUS, totalSeconds = FOCUS, interval = null, running = false, isBreak = false;

  function toggle() { running ? pause() : start(); }

  function start() {
    running = true;
    document.getElementById('pomo-btn').textContent = 'Pause';
    interval = setInterval(() => {
      secondsLeft--;
      _render();
      if (secondsLeft <= 0) {
        clearInterval(interval); running = false;
        if (!isBreak) {
          UI.showToast('⏰ Focus session done! Take a 5-min break.', 'success');
          isBreak = true; secondsLeft = BREAK; totalSeconds = BREAK;
          document.getElementById('pomo-btn').textContent = 'Start Break';
        } else {
          UI.showToast('✅ Break over! Ready to focus?', 'info');
          isBreak = false; secondsLeft = FOCUS; totalSeconds = FOCUS;
          document.getElementById('pomo-btn').textContent = 'Start';
        }
        _render();
      }
    }, 1000);
  }

  function pause() { running = false; clearInterval(interval); document.getElementById('pomo-btn').textContent = 'Resume'; }

  function reset() {
    running = false; isBreak = false; clearInterval(interval);
    secondsLeft = FOCUS; totalSeconds = FOCUS;
    document.getElementById('pomo-btn').textContent = 'Start';
    _render();
  }

  function _render() {
    const mins = String(Math.floor(secondsLeft/60)).padStart(2,'0');
    const secs = String(secondsLeft%60).padStart(2,'0');
    const pct = ((totalSeconds - secondsLeft)/totalSeconds)*100;
    const timeEl = document.getElementById('pomo-time'), fillEl = document.getElementById('pomo-fill');
    if (timeEl) timeEl.textContent = `${mins}:${secs}`;
    if (fillEl) fillEl.style.width = pct + '%';
    document.title = running ? `${mins}:${secs} — StudyLens` : 'StudyLens — AI Study Platform';
  }

  return { toggle, start, pause, reset };
})();

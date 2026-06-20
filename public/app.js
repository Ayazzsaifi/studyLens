document.addEventListener('DOMContentLoaded', () => {
  State.load();

  document.getElementById('d-uploads').textContent = State.uploadsCount;
  document.getElementById('d-quizzes').textContent = State.quizzesSaved;
  document.getElementById('d-cards').textContent = State.fcReviewed;

  UI.updateWordCount('');

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const notesInput = document.getElementById('notes-input');
      if (document.activeElement === notesInput || notesInput.value.trim()) Notes.runSummarize();
    }
    if (e.key === 'Escape') UI.closeSidebar();
  });

  console.log('%c📚 StudyLens', 'font-size:20px;font-weight:bold;color:#4f8ef7;');
});

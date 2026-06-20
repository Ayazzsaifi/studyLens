const State = {
  summary: "", subject: "",
  quizData: [], quizAnswers: {},
  flashcards: [], fcFlipped: new Set(),
  quizzesSaved: 0, uploadsCount: 0, fcReviewed: 0,
  tutorNotes: "", tutorAsked: [], tutorCurrent: null, tutorCorrect: 0, tutorTotal: 0,

  persist() {
    try {
      localStorage.setItem('studylens_state', JSON.stringify({
        quizzesSaved: this.quizzesSaved, uploadsCount: this.uploadsCount, fcReviewed: this.fcReviewed
      }));
    } catch(_) {}
  },
  load() {
    try {
      const s = JSON.parse(localStorage.getItem('studylens_state') || '{}');
      if (s.quizzesSaved) this.quizzesSaved = s.quizzesSaved;
      if (s.uploadsCount) this.uploadsCount = s.uploadsCount;
      if (s.fcReviewed)  this.fcReviewed  = s.fcReviewed;
    } catch(_) {}
  }
};

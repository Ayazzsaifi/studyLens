/**
 * api.js — calls OUR backend (/api/claude), which holds the secret key
 * and forwards to Anthropic. No key ever touches the browser.
 */
const API = (() => {

  async function callAI(prompt, maxTokens = 700) {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, maxTokens })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return (data.text || '').trim();
  }

  async function summarize(notes) {
    return callAI(
      `You are a smart study assistant. Summarize these study notes into 5-7 clear, concise bullet points.
Each bullet captures one key concept. Use "• " to start each bullet. Be specific and student-friendly.

Notes:
${notes}`, 800);
  }

  async function detectSubject(text) {
    const raw = await callAI(
      `Identify the academic subject of this text. Reply with ONLY the subject name (e.g. Biology, Physics, Chemistry, History, Mathematics, Computer Science). Single word or short phrase only.

Text:
${text.substring(0, 600)}`, 20);
    return raw.replace(/[^a-zA-Z\s]/g, '').trim();
  }

  async function extractKeywords(notes) {
    const raw = await callAI(
      `Extract 8-12 important key terms from these notes. Return ONLY a comma-separated list, nothing else.

Notes:
${notes.substring(0, 1200)}`, 130);
    return raw.split(',').map(k => k.trim()).filter(Boolean);
  }

  async function generateQuiz(text) {
    const raw = await callAI(
      `Create a 5-question multiple choice quiz based on these study notes.
Return ONLY a valid JSON array, no markdown, no backticks.
Format: [{"q":"question text","options":["A","B","C","D"],"answer":0,"explanation":"why correct, referencing the relevant concept"}]
The "answer" field is the 0-based index of the correct option.

Notes: ${text}`, 1100);
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  async function generateFlashcards(text) {
    const raw = await callAI(
      `Create 8 study flashcards from these notes. Return ONLY a valid JSON array, no markdown, no backticks:
[{"front":"term or short question","back":"definition or answer (1-2 sentences max)"}]

Notes: ${text}`, 900);
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  }

  async function tutorQuestion(notes, askedSoFar) {
    const raw = await callAI(
      `You are a patient AI tutor teaching from the student's own notes below.
Ask ONE question testing understanding of a concept from the notes that hasn't been asked yet (avoid repeating: ${askedSoFar.join(' | ') || 'none yet'}).
Return ONLY valid JSON, no markdown: {"question":"...","idealAnswer":"short correct answer","sourceHint":"the specific line/concept from the notes this question is based on"}

Notes:
${notes.substring(0, 3000)}`, 400);
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  }

  async function tutorEvaluate(notes, question, idealAnswer, sourceHint, studentAnswer) {
    const raw = await callAI(
      `You are a kind, encouraging AI tutor. The student was asked: "${question}"
The ideal answer is: "${idealAnswer}" (based on this part of their notes: "${sourceHint}")
The student answered: "${studentAnswer}"

Judge if the student's answer is correct, partially correct, or wrong.
Return ONLY valid JSON, no markdown:
{"verdict":"correct|partial|wrong","feedback":"2-3 sentences, simple language, encouraging tone. If wrong or partial, explain the correct concept clearly and point them back to the specific part of their notes (quote sourceHint)."}`, 350);
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  }

  return { callAI, summarize, detectSubject, extractKeywords, generateQuiz, generateFlashcards, tutorQuestion, tutorEvaluate };
})();

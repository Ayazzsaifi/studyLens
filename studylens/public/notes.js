const Notes = (() => {

  function onInput(textarea) { UI.updateWordCount(textarea.value); }

  function handleFile(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      _readPdf(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('notes-input').value = e.target.result;
        UI.updateWordCount(e.target.result);
        UI.showToast('📄 File loaded: ' + file.name, 'success');
      };
      reader.readAsText(file);
    }
    input.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    document.getElementById('upload-zone').classList.remove('drag');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      _readPdf(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('notes-input').value = ev.target.result;
        UI.updateWordCount(ev.target.result);
        UI.showToast('📄 Dropped: ' + file.name, 'success');
      };
      reader.readAsText(file);
    }
  }

  async function _readPdf(file) {
    const statusEl = document.getElementById('pdf-status');
    statusEl.textContent = '⏳ Extracting text from PDF…';
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(it => it.str).join(' ') + '\n\n';
      }
      document.getElementById('notes-input').value = fullText.trim();
      UI.updateWordCount(fullText);
      statusEl.textContent = `✅ Extracted ${pdf.numPages} page(s) from ${file.name}`;
      UI.showToast('📄 PDF loaded: ' + file.name, 'success');
    } catch (err) {
      statusEl.textContent = '⚠ Could not read PDF: ' + err.message;
      UI.showToast('Could not read PDF', 'error');
    }
  }

  function clearAll() {
    document.getElementById('notes-input').value = '';
    document.getElementById('summary-card').style.display = 'none';
    document.getElementById('pdf-status').textContent = '';
    State.summary = ''; State.subject = '';
    UI.updateWordCount('');
    UI.showToast('Cleared!', 'info');
  }

  async function runSummarize() {
    const text = document.getElementById('notes-input').value.trim();
    if (!text) { UI.showToast('Please paste or upload some notes first!', 'info'); return; }

    const card = document.getElementById('summary-card'), out = document.getElementById('summary-out'),
          btn = document.getElementById('btn-summarize'), badge = document.getElementById('subject-badge'),
          kwRow = document.getElementById('keyword-row');

    card.style.display = 'block';
    out.innerHTML = UI.loadingHTML('Summarizing your notes…');
    badge.style.display = 'none';
    kwRow.innerHTML = '';
    btn.disabled = true;
    UI.showProgress('Calling Claude AI…');

    try {
      const [summary, subject] = await Promise.all([API.summarize(text), API.detectSubject(text)]);
      State.summary = summary; State.subject = subject; State.uploadsCount++;

      out.textContent = '';
      UI.typewrite(out, summary, 8);
      badge.textContent = '📚 ' + subject;
      badge.style.display = 'inline-flex';

      document.getElementById('d-uploads').textContent = State.uploadsCount;
      Dashboard.addActivity('Summarized notes', subject, 'Summary', 'purple');
      UI.showToast('✨ Summary ready!', 'success');
      State.persist();
    } catch (e) {
      out.textContent = '⚠ Error: ' + e.message;
    } finally {
      btn.disabled = false;
      UI.hideProgress();
    }
  }

  async function extractKeywords() {
    const text = document.getElementById('notes-input').value.trim();
    if (!text) { UI.showToast('Paste notes first!', 'info'); return; }
    const row = document.getElementById('keyword-row'), card = document.getElementById('summary-card');
    card.style.display = 'block';
    row.innerHTML = UI.loadingHTML('Extracting keywords…');
    UI.showProgress('Extracting keywords…');
    try {
      const keywords = await API.extractKeywords(text);
      row.innerHTML = '';
      keywords.forEach(kw => {
        const span = document.createElement('span');
        span.className = 'kw-tag';
        span.textContent = kw;
        row.appendChild(span);
      });
      UI.showToast('🏷 Keywords extracted!', 'success');
    } catch (e) {
      row.innerHTML = `<span style="color:var(--danger);font-size:13px;">Error: ${e.message}</span>`;
    } finally { UI.hideProgress(); }
  }

  function copySummary() {
    if (!State.summary) return;
    navigator.clipboard.writeText(State.summary)
      .then(() => UI.showToast('📋 Summary copied!', 'success'))
      .catch(() => UI.showToast('Could not copy', 'error'));
  }

  return { onInput, handleFile, handleDrop, clearAll, runSummarize, extractKeywords, copySummary };
})();

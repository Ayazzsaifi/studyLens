const UI = (() => {
  function goto(page, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    if (btn) btn.classList.add('active');
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  }
  let toastTimer = null;
  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast'), icon = document.getElementById('toast-icon'), text = document.getElementById('toast-msg');
    const icons = { success: '✓', info: 'ℹ', error: '✕', warning: '⚠' };
    icon.textContent = icons[type] || '✓';
    text.textContent = msg;
    t.className = `toast show ${type}`;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  }
  function loadingHTML(msg = 'Processing…') {
    return `<div class="loading-bar"><div class="ldot"></div><div class="ldot"></div><div class="ldot"></div><span>${msg}</span></div>`;
  }
  function showProgress(msg) {
    const el = document.getElementById('ai-progress'), lbl = document.getElementById('ai-progress-label');
    if (el) { el.style.display = 'flex'; lbl.textContent = msg; }
  }
  function hideProgress() {
    const el = document.getElementById('ai-progress');
    if (el) el.style.display = 'none';
  }
  function typewrite(el, text, speed = 8) {
    el.textContent = '';
    let i = 0;
    const tick = () => { if (i < text.length) { el.textContent += text[i++]; setTimeout(tick, speed); } };
    tick();
  }
  function updateWordCount(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const wc = document.getElementById('word-counter'), cc = document.getElementById('char-counter');
    if (wc) wc.textContent = words.toLocaleString() + ' word' + (words !== 1 ? 's' : '');
    if (cc) cc.textContent = text.length.toLocaleString() + ' chars';
  }
  return { goto, toggleSidebar, closeSidebar, showToast, loadingHTML, showProgress, hideProgress, typewrite, updateWordCount };
})();

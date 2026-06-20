const Dashboard = (() => {
  function addActivity(title, subject, badge, color) {
    const list = document.getElementById('activity-list');
    if (!list) return;
    if (list.querySelector('.empty-state')) list.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'hist-row';
    div.style.animation = 'fadeUp 0.3s ease';
    div.innerHTML = `<div><div class="hist-title">${title}</div><div class="hist-meta">${subject || 'General'} · just now</div></div><span class="badge badge-${color}">${badge}</span>`;
    list.insertBefore(div, list.firstChild);
    if (list.children.length > 8) list.removeChild(list.lastChild);
  }

  function updateSubjectBar(subject, pct) {
    if (!subject) return;
    const bars = document.getElementById('subject-bars');
    if (!bars) return;
    const existing = bars.querySelectorAll('.bar-subject');
    for (let el of existing) {
      if (el.textContent.trim() === subject) {
        const fill = el.nextElementSibling.firstChild;
        const pctEl = el.nextElementSibling.nextElementSibling;
        fill.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';
        return;
      }
    }
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div class="bar-subject">${subject}</div><div class="bar-track"><div class="bar-fill" style="width:0%"></div></div><div class="bar-pct">${pct}%</div>`;
    bars.appendChild(row);
    setTimeout(() => { row.querySelector('.bar-fill').style.width = pct + '%'; }, 50);
  }

  return { addActivity, updateSubjectBar };
})();

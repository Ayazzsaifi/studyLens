// auth.js — Supabase session guard
// Loaded as the FIRST script in index.html
// Redirects to login if not authenticated, shows user info + logout in topbar

(async () => {
  const SUPABASE_URL = 'https://ktaatiqlcofsvsdvjlgm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWF0aXFsY29mc3ZzZHZqbGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTMwMTMsImV4cCI6MjA5NzUyOTAxM30.UMVVlABIKxrswLvO2nisNdpId-6U2KJoXLLePtHHJlY';

  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Check session
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    window.location.href = '/login.html';
    return;
  }

  const user = data.session.user;

  // Expose logout globally
  window.sbLogout = async () => {
    await sb.auth.signOut();
    window.location.href = '/login.html';
  };

  // Inject user email + logout button into topbar (mobile) and sidebar (desktop)
  document.addEventListener('DOMContentLoaded', () => {
    // Sidebar user block (desktop)
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      const userBlock = document.createElement('div');
      userBlock.style.cssText = `
        position: absolute; bottom: 20px; left: 14px; right: 14px;
        background: var(--bg); border: 1px solid var(--border);
        border-radius: 12px; padding: 10px 12px;
      `;
      userBlock.innerHTML = `
        <div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Signed in as</div>
        <div style="font-size:12px;color:var(--text2);word-break:break-all;margin-bottom:8px;">${user.email}</div>
        <button onclick="sbLogout()" style="
          width:100%;background:none;border:1px solid var(--border);
          color:var(--text2);padding:6px 10px;border-radius:8px;
          font-size:12px;cursor:pointer;font-family:var(--font);
        ">🚪 Logout</button>
      `;
      sidebar.appendChild(userBlock);
    }

    // Topbar user (mobile)
    const topbar = document.querySelector('.topbar');
    if (topbar) {
      const btn = document.createElement('button');
      btn.onclick = sbLogout;
      btn.style.cssText = `
        margin-left:auto; background:none; border:1px solid var(--border);
        color:var(--text2); padding:5px 12px; border-radius:8px;
        font-size:12px; cursor:pointer;
      `;
      btn.textContent = 'Logout';
      topbar.appendChild(btn);
    }
  });
})();

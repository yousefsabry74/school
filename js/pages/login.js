// ============================================================
//  PAGES/LOGIN.JS — Login Page Logic
//  منصة التعلم الذكية
// ============================================================

(function () {
  'use strict';

  // ── Redirect if already logged in ──
  if (AUTH.isLoggedIn()) {
    const user = AUTH.getUser();
    window.location.href = user.role === 'teacher' ? 'teacher.html' : 'home.html';
    return;
  }

  // ── DOM refs ──
  const roleTeacherBtn = document.getElementById('role-teacher');
  const roleStudentBtn = document.getElementById('role-student');
  const usernameInput  = document.getElementById('username-input');
  const passwordInput  = document.getElementById('password-input');
  const loginBtn       = document.getElementById('login-btn');
  const errorBox       = document.getElementById('login-error');
  const demoGrid       = document.getElementById('demo-grid');

  // ── Role switching ──
  let activeRole = 'student';
  function setRole(role) {
    activeRole = role;
    roleTeacherBtn.classList.toggle('active', role === 'teacher');
    roleStudentBtn.classList.toggle('active', role === 'student');
    renderDemoButtons();
    usernameInput.value = '';
    passwordInput.value = '';
    hideError();
  }

  roleTeacherBtn?.addEventListener('click', () => setRole('teacher'));
  roleStudentBtn?.addEventListener('click', () => setRole('student'));

  // ── Demo buttons ──
  function renderDemoButtons() {
    if (!demoGrid) return;
    const demos = USERS.filter(u => u.role === activeRole);
    demoGrid.innerHTML = demos.map(u => `
      <button class="demo-btn" data-user="${u.username}" data-pass="${u.password}">
        <span class="demo-avatar">${u.avatar}</span>
        <div class="demo-info">
          <div class="demo-name">${u.name}</div>
          <div class="demo-creds">${u.username} / ${u.password}</div>
        </div>
        <span class="demo-role badge-purple badge">${u.role === 'teacher' ? 'معلم' : 'طالب'}</span>
      </button>
    `).join('');

    // Event delegation for demo buttons
    demoGrid.addEventListener('click', e => {
      const btn = e.target.closest('.demo-btn');
      if (!btn) return;
      usernameInput.value = btn.dataset.user;
      passwordInput.value = btn.dataset.pass;
      doLogin();
    });
  }

  // ── Login logic ──
  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.classList.add('show');
    passwordInput.value = '';
    passwordInput.focus();
    setTimeout(hideError, 4000);
  }
  function hideError() {
    errorBox?.classList.remove('show');
  }

  function doLogin() {
    hideError();
    const un = usernameInput.value.trim();
    const pw = passwordInput.value.trim();
    if (!un || !pw) { showError('⚠️ أدخل اسم المستخدم وكلمة المرور'); return; }

    // Animate button
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="ph ph-spinner" style="animation:spin 1s linear infinite"></i> جاري الدخول...';

    setTimeout(() => {
      const user = AUTH.login(un, pw);
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<i class="ph ph-sign-in-fill"></i> تسجيل الدخول';

      if (!user) { showError('❌ اسم المستخدم أو كلمة المرور غير صحيحة'); return; }
      if (activeRole !== 'all' && user.role !== activeRole) {
        showError(`❌ هذا الحساب مخصص لـ${activeRole === 'teacher' ? 'المعلم' : 'الطالب'}`);
        AUTH.logout();
        return;
      }
      showToast(`🎉 مرحباً ${user.name.split(' ')[0]}!`, 'success');
      setTimeout(() => {
        window.location.href = user.role === 'teacher' ? 'teacher.html' : 'home.html';
      }, 600);
    }, 400);
  }

  loginBtn?.addEventListener('click', doLogin);
  passwordInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  usernameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') passwordInput.focus(); });

  // ── Init ──
  renderDemoButtons();
  usernameInput?.focus();
})();

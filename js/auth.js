// ============================================================
//  AUTH HELPER - منصة التعلم الذكية
// ============================================================

const AUTH = {
  login(username, password) {
    const user = getUserByCredentials(username.trim(), password);
    if (!user) return false;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  },

  getUser() {
    const raw = sessionStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  },

  requireAuth(role) {
    const user = this.getUser();
    if (!user) { window.location.href = 'index.html'; return null; }
    if (role && user.role !== role) { window.location.href = user.role === 'teacher' ? 'teacher.html' : 'home.html'; return null; }
    return user;
  },

  isLoggedIn() { return !!this.getUser(); }
};

// ============================================================
//  PROGRESS HELPER
// ============================================================
const PROGRESS = {
  _key(userId, lessonId, sessionId) { return `progress_${userId}_L${lessonId}_S${sessionId}`; },
  _quizKey(userId, lessonId, sessionId) { return `quiz_${userId}_L${lessonId}_S${sessionId}`; },

  getSession(userId, lessonId, sessionId) {
    const raw = localStorage.getItem(this._key(userId, lessonId, sessionId));
    return raw ? JSON.parse(raw) : { completed: false, tab: 'objectives', activitiesDone: [] };
  },

  saveSession(userId, lessonId, sessionId, data) {
    localStorage.setItem(this._key(userId, lessonId, sessionId), JSON.stringify(data));
  },

  markTabDone(userId, lessonId, sessionId, tab) {
    const data = this.getSession(userId, lessonId, sessionId);
    if (!data.tabsDone) data.tabsDone = [];
    if (!data.tabsDone.includes(tab)) data.tabsDone.push(tab);
    this.saveSession(userId, lessonId, sessionId, data);
  },

  saveQuiz(userId, lessonId, sessionId, result) {
    localStorage.setItem(this._quizKey(userId, lessonId, sessionId), JSON.stringify(result));
  },

  getQuiz(userId, lessonId, sessionId) {
    const raw = localStorage.getItem(this._quizKey(userId, lessonId, sessionId));
    return raw ? JSON.parse(raw) : null;
  },

  getTotalScore(userId) {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`quiz_${userId}`)) {
        const q = JSON.parse(localStorage.getItem(key));
        if (q && q.score) total += q.score;
      }
    }
    return total;
  },

  getCompletedSessions(userId) {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`quiz_${userId}`)) count++;
    }
    return count;
  }
};

// ============================================================
//  TOAST NOTIFICATIONS
// ============================================================
function showToast(msg, type = 'success') {
  const existing = document.getElementById('global-toast');
  if (existing) existing.remove();

  const colors = {
    success: 'linear-gradient(135deg, #00D97E, #00A85A)',
    error:   'linear-gradient(135deg, #FF4757, #CC0000)',
    info:    'linear-gradient(135deg, #6C3EFF, #FF6B35)',
  };

  const toast = document.createElement('div');
  toast.id = 'global-toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(80px);
    background:${colors[type] || colors.info}; color:#fff;
    padding:14px 30px; border-radius:50px;
    font-family:'Cairo',sans-serif; font-size:16px; font-weight:700;
    z-index:99999; box-shadow:0 8px 30px rgba(0,0,0,0.4);
    transition:transform .4s cubic-bezier(.34,1.56,.64,1);
    direction:rtl; white-space:nowrap;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ============================================================
//  UTILS
// ============================================================
function formatDate() {
  return new Date().toLocaleDateString('ar-SA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

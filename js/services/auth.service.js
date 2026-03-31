// ============================================================
//  SERVICES/AUTH.SERVICE.JS — Authentication
//  منصة التعلم الذكية
// ============================================================

const AUTH = {
  _key: 'currentUser',

  login(username, password) {
    const user = getUserByCredentials(username.trim(), password.trim());
    if (!user) return null;
    sessionStorage.setItem(this._key, JSON.stringify(user));
    return user;
  },

  logout() {
    sessionStorage.removeItem(this._key);
    window.location.href = 'index.html';
  },

  getUser() {
    try {
      const raw = sessionStorage.getItem(this._key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  requireAuth(role) {
    const user = this.getUser();
    if (!user) { window.location.href = 'index.html'; return null; }
    if (role && user.role !== role) {
      window.location.href = user.role === 'teacher' ? 'teacher.html' : 'home.html';
      return null;
    }
    return user;
  },

  isLoggedIn() { return !!this.getUser(); },
};

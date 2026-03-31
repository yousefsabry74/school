// ============================================================
//  SERVICES/PROGRESS.SERVICE.JS — Progress Tracking
//  منصة التعلم الذكية
// ============================================================

const PROGRESS = {
  _quizKey(userId, lessonId, sessionId) {
    return `quiz_${userId}_L${lessonId}_S${sessionId}`;
  },
  _sessionKey(userId, lessonId, sessionId) {
    return `progress_${userId}_L${lessonId}_S${sessionId}`;
  },

  // ── Quiz ──
  saveQuiz(userId, lessonId, sessionId, result) {
    localStorage.setItem(this._quizKey(userId, lessonId, sessionId), JSON.stringify(result));
    this._invalidateCache(userId);
  },

  getQuiz(userId, lessonId, sessionId) {
    try {
      const raw = localStorage.getItem(this._quizKey(userId, lessonId, sessionId));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  // ── Session state ──
  getSession(userId, lessonId, sessionId) {
    try {
      const raw = localStorage.getItem(this._sessionKey(userId, lessonId, sessionId));
      return raw ? JSON.parse(raw) : { completed: false, tabsDone: [], activitiesDone: [] };
    } catch { return { completed: false, tabsDone: [], activitiesDone: [] }; }
  },

  saveSession(userId, lessonId, sessionId, data) {
    localStorage.setItem(this._sessionKey(userId, lessonId, sessionId), JSON.stringify(data));
  },

  // ── Aggregates (cached) ──
  _cache: {},
  _invalidateCache(userId) { delete this._cache[userId]; },

  _buildCache(userId) {
    if (this._cache[userId]) return;
    let totalScore = 0, completedSessions = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`quiz_${userId}`)) continue;
      try {
        const q = JSON.parse(localStorage.getItem(key));
        if (q && q.score) totalScore += q.score;
        completedSessions++;
      } catch { /* skip */ }
    }
    this._cache[userId] = { totalScore, completedSessions };
  },

  getTotalScore(userId) {
    this._buildCache(userId);
    return this._cache[userId]?.totalScore || 0;
  },

  getCompletedSessions(userId) {
    this._buildCache(userId);
    return this._cache[userId]?.completedSessions || 0;
  },

  hasHighScore(userId, minScore = 80) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`quiz_${userId}`)) continue;
      try {
        const q = JSON.parse(localStorage.getItem(key));
        if (q && q.score >= minScore) return true;
      } catch { /* skip */ }
    }
    return false;
  },
};

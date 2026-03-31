// ============================================================
//  SERVICES/PROGRESS.SERVICE.JS — Progress Tracking
//  منصة التعلم الذكية
// ============================================================

const PROGRESS = {
  _api: "http://localhost:8000/api/progress",
  _cache: {},

  _quizKey(userId, lessonId, sessionId) {
    return `quiz_${userId}_L${lessonId}_S${sessionId}`;
  },

  _sessionKey(userId, lessonId, sessionId) {
    return `progress_${userId}_L${lessonId}_S${sessionId}`;
  },

  _invalidateCache(userId) {
    delete this._cache[userId];
  },

  _normalizeQuizResult(result) {
    if (!result) return null;

    return {
      score: Number(result.score || 0),
      correct: Number(result.correctAnswers ?? result.correct ?? 0),
      total: Number(result.totalQuestions ?? result.total ?? 0),
      date:
        result.submittedAt ||
        result.date ||
        result.updatedAt ||
        new Date().toISOString(),
    };
  },

  _storeQuizLocally(userId, lessonId, sessionId, result) {
    const normalized = this._normalizeQuizResult(result);
    if (!normalized) return;

    localStorage.setItem(
      this._quizKey(userId, lessonId, sessionId),
      JSON.stringify(normalized),
    );
    this._invalidateCache(userId);
  },

  _clearUserQuizCache(userId) {
    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`quiz_${userId}_`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => localStorage.removeItem(key));
    this._invalidateCache(userId);
  },

  async _authorizedRequest(path, options = {}) {
    const user = AUTH.getUser();
    const token = user?.token;

    if (!token) return null;

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(`${this._api}${path}`, {
        ...options,
        headers,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "تعذر مزامنة الدرجات مع الخادم.");
      }

      return result;
    } catch (error) {
      console.error("Progress API request failed:", error);
      return null;
    }
  },

  async syncUserQuizResults(userId) {
    const result = await this._authorizedRequest("/quiz-results/me");
    const quizResults = result?.data?.results;

    if (!Array.isArray(quizResults)) return false;

    this._clearUserQuizCache(userId);

    quizResults.forEach((item) => {
      this._storeQuizLocally(userId, item.lessonId, item.sessionId, item);
    });

    return true;
  },

  async syncCurrentQuizResult(userId, lessonId, sessionId) {
    const result = await this._authorizedRequest(`/quiz/${lessonId}/${sessionId}`);
    const quizResult = result?.data;

    if (!quizResult) return null;

    this._storeQuizLocally(userId, lessonId, sessionId, quizResult);
    return this.getQuiz(userId, lessonId, sessionId);
  },

  async saveQuiz(userId, lessonId, sessionId, result, answers = {}) {
    this._storeQuizLocally(userId, lessonId, sessionId, result);

    const payload = {
      lessonId,
      sessionId,
      answers,
      score: Number(result?.score || 0),
      totalQuestions: Number(result?.total || 0),
      correctAnswers: Number(result?.correct || 0),
    };

    const response = await this._authorizedRequest("/quiz", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response?.data) {
      this._storeQuizLocally(userId, lessonId, sessionId, response.data);
      return true;
    }

    return false;
  },

  getQuiz(userId, lessonId, sessionId) {
    try {
      const raw = localStorage.getItem(this._quizKey(userId, lessonId, sessionId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getSession(userId, lessonId, sessionId) {
    try {
      const raw = localStorage.getItem(
        this._sessionKey(userId, lessonId, sessionId),
      );
      return raw
        ? JSON.parse(raw)
        : { completed: false, tabsDone: [], activitiesDone: [] };
    } catch {
      return { completed: false, tabsDone: [], activitiesDone: [] };
    }
  },

  saveSession(userId, lessonId, sessionId, data) {
    localStorage.setItem(
      this._sessionKey(userId, lessonId, sessionId),
      JSON.stringify(data),
    );
  },

  _buildCache(userId) {
    if (this._cache[userId]) return;

    let totalScore = 0;
    let completedSessions = 0;
    let highScore = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`quiz_${userId}_`)) continue;

      try {
        const quiz = JSON.parse(localStorage.getItem(key));
        if (!quiz) continue;

        totalScore += Number(quiz.score || 0);
        completedSessions += 1;
        highScore = Math.max(highScore, Number(quiz.score || 0));
      } catch {
        // ignore invalid cached rows
      }
    }

    this._cache[userId] = { totalScore, completedSessions, highScore };
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
    this._buildCache(userId);
    return (this._cache[userId]?.highScore || 0) >= minScore;
  },

  async getTeacherOverview() {
    const result = await this._authorizedRequest("/quiz-results/teacher-overview");
    return (
      result?.data || {
        students: [],
        summary: {
          totalStudents: 0,
          totalQuizSubmissions: 0,
          averageScore: 0,
        },
      }
    );
  },
};

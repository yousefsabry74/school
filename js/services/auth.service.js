const AUTH = {
  _key: "currentUser",
  _api: "http://localhost:8000/api/users",

  _decodeToken(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(
            (char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`,
          )
          .join(""),
      );

      return JSON.parse(payload);
    } catch (error) {
      console.error("Token decode failed:", error);
      return null;
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${this._api}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok && result.token) {
        const tokenData = this._decodeToken(result.token) || {};
        const role =
          tokenData.role ||
          result.role ||
          (email.includes("teacher") ? "teacher" : "student");

        const userData = {
          token: result.token,
          id: tokenData.id || result.userId || null,
          username: tokenData.username || result.username || email.split("@")[0],
          name: tokenData.username || result.username || email.split("@")[0],
          role,
          avatar: role === "teacher" ? "👨‍🏫" : "👦",
        };

        sessionStorage.setItem(this._key, JSON.stringify(userData));
        return userData;
      }

      throw new Error(result.message || "خطأ في البريد أو كلمة المرور");
    } catch (err) {
      showToast(err.message, "error");
      return null;
    }
  },

  async register(userData) {
    try {
      const response = await fetch(`${this._api}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const result = await response.json();

      if (response.ok) return result;

      throw new Error(result.message || "فشل إنشاء الحساب");
    } catch (err) {
      showToast(err.message, "error");
      return null;
    }
  },

  getUser() {
    const raw = sessionStorage.getItem(this._key);
    if (!raw) return null;

    try {
      const user = JSON.parse(raw);
      if (user?.token && (!user.id || user.id === "1")) {
        const tokenData = this._decodeToken(user.token) || {};
        const normalized = {
          ...user,
          id: tokenData.id || user.id,
          username: tokenData.username || user.username || user.name,
          role:
            tokenData.role ||
            user.role ||
            (String(user.name || "").includes("teacher") ? "teacher" : "student"),
        };
        sessionStorage.setItem(this._key, JSON.stringify(normalized));
        return normalized;
      }

      return user;
    } catch {
      return null;
    }
  },

  async getAllUsers() {
    const user = this.getUser();
    if (!user?.token) return [];

    try {
      const response = await fetch(this._api, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "تعذر تحميل المستخدمين");
      }

      return result?.data?.users || [];
    } catch (err) {
      console.error("Get users failed:", err);
      return [];
    }
  },

  requireAuth(role) {
    const user = this.getUser();
    if (!user) {
      window.location.href = "index.html";
      return null;
    }

    if (role && user.role !== role) {
      window.location.href = user.role === "teacher" ? "teacher.html" : "home.html";
      return null;
    }

    return user;
  },

  logout() {
    sessionStorage.removeItem(this._key);
    window.location.href = "index.html";
  },

  isLoggedIn() {
    return !!this.getUser();
  },
};

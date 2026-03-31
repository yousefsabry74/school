const CHATBOT_SERVICE = {
  _api: "http://localhost:8000/api/chatbot",

  async ask({ question, context, lessonId }) {
    const user = AUTH.getUser();
    const token = user?.token;

    if (!token) {
      const error = new Error("missing_auth_token");
      error.code = "missing_auth_token";
      throw error;
    }

    const response = await fetch(`${this._api}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        context,
        lessonId,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        result?.message || "تعذر الوصول إلى المساعد الذكي حالياً.",
      );
      error.status = response.status;
      throw error;
    }

    return {
      answer: result?.data?.answer || "",
      source: result?.data?.source || "api",
    };
  },
};

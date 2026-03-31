(function () {
  "use strict";
  let isLoginMode = true;

  const toggleAuth = document.getElementById("toggle-auth");
  const submitBtn = document.getElementById("login-btn");
  const extraFields = document.getElementById("register-extra-fields");

  toggleAuth?.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    extraFields.style.display = isLoginMode ? "none" : "block";
    document.getElementById("auth-title").textContent = isLoginMode
      ? "تسجيل الدخول"
      : "إنشاء حساب طالب";
    document.getElementById("btn-text").textContent = isLoginMode
      ? "تسجيل الدخول"
      : "ابدأ الآن";
    toggleAuth.textContent = isLoginMode
      ? "أنشئ حساباً الآن"
      : "لديك حساب؟ سجل دخولك";
  });

  submitBtn?.addEventListener("click", async () => {
    const emailValue = document.getElementById("username-input").value.trim();
    const passwordValue = document
      .getElementById("password-input")
      .value.trim();
    const regEmail = document.getElementById("email-input")?.value.trim();
    const userClass = document.getElementById("class-input")?.value.trim();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ph ph-spinner spin"></i> جاري التحقق...';

    if (isLoginMode) {
      // تسجيل دخول
      const user = await AUTH.login(emailValue, passwordValue);
      if (user) {
        showToast(`أهلاً بك يا ${user.name}!`);
        setTimeout(() => {
          window.location.href =
            user.role === "teacher" ? "teacher.html" : "home.html";
        }, 800);
      }
    } else {
      // تسجيل جديد - الرتبة طالب تلقائياً
      const success = await AUTH.register({
        username: emailValue.split("@")[0],
        email: regEmail,
        password: passwordValue,
        class: userClass,
        role: "student",
      });
      if (success) {
        showToast("🎉 تم التسجيل! سجل دخولك الآن");
        isLoginMode = true;
        toggleAuth.click();
      }
    }
    submitBtn.disabled = false;
    submitBtn.innerHTML =
      '<i class="ph ph-sign-in-fill"></i> <span id="btn-text">دخول</span>';
  });
})();

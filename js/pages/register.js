(function () {
  "use strict";

  const registerBtn = $("register-btn");
  const errorBox = $("reg-error");
  const fields = ["reg-username", "reg-email", "reg-password", "reg-class"];

  function setError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.style.display = message ? "block" : "none";
  }

  function getFormData() {
    return {
      username: $("reg-username")?.value.trim() || "",
      email: $("reg-email")?.value.trim() || "",
      password: $("reg-password")?.value.trim() || "",
      className: $("reg-class")?.value.trim() || "",
    };
  }

  function validateForm(data) {
    if (!data.username || !data.email || !data.password || !data.className) {
      return "من فضلك املأ كل البيانات أولاً.";
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(data.username)) {
      return "اسم المستخدم يجب أن يكون من 3 إلى 30 حرفًا أو رقمًا أو _.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.";
    }

    if (data.password.length < 6) {
      return "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
    }

    return "";
  }

  async function submitRegister() {
    const data = getFormData();
    const validationError = validateForm(data);
    setError(validationError);
    if (validationError) return;

    registerBtn.disabled = true;
    registerBtn.innerHTML =
      '<i class="ph ph-spinner-gap spin"></i> جاري إنشاء الحساب...';

    const registered = await AUTH.register({
      username: data.username,
      email: data.email,
      password: data.password,
      class: data.className,
      role: "student",
    });

    if (!registered) {
      registerBtn.disabled = false;
      registerBtn.innerHTML =
        '<i class="ph ph-user-plus-fill"></i> إنشاء الحساب';
      return;
    }

    showToast("تم إنشاء الحساب بنجاح، جاري تسجيل دخول الطالب...");

    const user = await AUTH.login(data.email, data.password);

    registerBtn.disabled = false;
    registerBtn.innerHTML =
      '<i class="ph ph-user-plus-fill"></i> إنشاء الحساب';

    if (!user) {
      window.location.href = "index.html";
      return;
    }

    setTimeout(() => {
      window.location.href = "home.html";
    }, 700);
  }

  registerBtn?.addEventListener("click", submitRegister);

  fields.forEach((fieldId) => {
    $(fieldId)?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitRegister();
    });
  });
})();

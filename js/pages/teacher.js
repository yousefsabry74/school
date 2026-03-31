// ============================================================
//  PAGES/TEACHER.JS — Teacher Dashboard Logic
//  منصة التعلم الذكية
// ============================================================

(async function () {
  "use strict";

  const teacher = AUTH.requireAuth("teacher");
  if (!teacher) return;

  setText("nav-name", teacher.name);
  setText("teacher-name", teacher.name.split(" ")[0]);
  setText("teacher-date", formatDate());

  const ctrl = $("lessons-control");
  if (ctrl) {
    LESSONS.forEach((lesson, li) => {
      const lessonStorageKey = `cfg_lesson_${lesson.id}`;
      const lessonConfig = JSON.parse(localStorage.getItem(lessonStorageKey) || "null");
      const isAvail = lessonConfig !== null ? lessonConfig.available : lesson.available;

      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="lesson-control-row">
          <span class="lc-icon">${lesson.icon}</span>
          <div class="lc-info">
            <div class="lc-title">${APP.LESSON_LABELS[li]} — ${lesson.title}</div>
            <div class="lc-meta">${lesson.sessions} حصص</div>
          </div>
          <div class="lc-actions">
            <span class="toggle-label" id="ll-${lesson.id}">${isAvail ? "مفعّل" : "معطّل"}</span>
            <label class="toggle">
              <input type="checkbox" id="lt-${lesson.id}" ${isAvail ? "checked" : ""}
                     data-lesson-id="${lesson.id}">
              <span class="toggle-slider"></span>
            </label>
            <button class="expand-btn" data-expand="${lesson.id}">الحصص ▾</button>
          </div>
        </div>
        <div class="sessions-panel" id="sp-${lesson.id}">
          ${lesson.sessions_data
            .map((sessionItem) => {
              const sessionStorageKey = `cfg_session_${lesson.id}_${sessionItem.id}`;
              const sessionConfig = JSON.parse(
                localStorage.getItem(sessionStorageKey) || "null",
              );
              const sessionAvail =
                sessionConfig !== null ? sessionConfig.available : sessionItem.available;

              return `
                <div class="session-ctrl-row">
                  <span class="sc-icon">${sessionItem.icon}</span>
                  <span class="sc-title">${sessionItem.title}</span>
                  <span class="toggle-label" id="sl-${lesson.id}-${sessionItem.id}">${sessionAvail ? "مفعّلة" : "معطّلة"}</span>
                  <label class="toggle">
                    <input type="checkbox" ${sessionAvail ? "checked" : ""}
                           data-lesson-id="${lesson.id}" data-session-id="${sessionItem.id}">
                    <span class="toggle-slider"></span>
                  </label>
                </div>`;
            })
            .join("")}
        </div>`;

      ctrl.appendChild(wrapper);
    });

    ctrl.addEventListener("change", (e) => {
      const input = e.target;
      if (input.type !== "checkbox") return;

      const lessonId = input.dataset.lessonId;
      const sessionId = input.dataset.sessionId;

      if (sessionId) {
        localStorage.setItem(
          `cfg_session_${lessonId}_${sessionId}`,
          JSON.stringify({ available: input.checked }),
        );
        setText(`sl-${lessonId}-${sessionId}`, input.checked ? "مفعّلة" : "معطّلة");
        showToast(
          input.checked ? "✅ تم تفعيل الحصة" : "🔒 تم إيقاف الحصة",
          input.checked ? "success" : "info",
        );
        return;
      }

      if (lessonId) {
        localStorage.setItem(
          `cfg_lesson_${lessonId}`,
          JSON.stringify({ available: input.checked }),
        );
        setText(`ll-${lessonId}`, input.checked ? "مفعّل" : "معطّل");
        showToast(
          input.checked ? "✅ تم تفعيل الدرس" : "🔒 تم إيقاف الدرس",
          input.checked ? "success" : "info",
        );
      }
    });

    ctrl.addEventListener("click", (e) => {
      const btn = e.target.closest(".expand-btn");
      if (!btn) return;
      $(`sp-${btn.dataset.expand}`)?.classList.toggle("open");
    });
  }

  function getStudentDisplayName(student) {
    return (
      student.displayName ||
      student.name ||
      student.username ||
      student.email ||
      "طالب"
    );
  }

  function getStudentAvatar(student) {
    return student.avatar && !String(student.avatar).includes("uploads/")
      ? student.avatar
      : "👦";
  }

  function getScoreBadge(score) {
    if (score === null || score === undefined) {
      return { scoreClass: "score-z", grade: "—" };
    }

    if (score >= 80) return { scoreClass: "score-hi", grade: "ممتاز" };
    if (score >= 60) return { scoreClass: "score-md", grade: "جيد" };
    return { scoreClass: "score-lo", grade: "يحتاج مراجعة" };
  }

  function getLatestLocalQuizResult(userId) {
    let latest = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`quiz_${userId}_`)) continue;

      try {
        const result = JSON.parse(localStorage.getItem(key));
        if (!result) continue;

        if (!latest || new Date(result.date) > new Date(latest.date)) {
          latest = result;
        }
      } catch {
        // ignore invalid rows
      }
    }

    return latest;
  }

  const [apiUsers, teacherOverview] = await Promise.all([
    AUTH.getAllUsers(),
    PROGRESS.getTeacherOverview(),
  ]);

  const overviewById = new Map(
    (teacherOverview.students || []).map((student) => [student.id, student]),
  );

  const fallbackStudents = USERS.filter((user) => user.role === "student").map(
    (student) => ({
      id: student.id,
      username: student.username,
      name: student.name,
      class: student.class,
      avatar: student.avatar,
      password: student.password,
      completedSessions: PROGRESS.getCompletedSessions(student.id),
      totalScore: PROGRESS.getTotalScore(student.id),
      latestResult: getLatestLocalQuizResult(student.id),
    }),
  );

  const studentsSource = teacherOverview.students?.length
    ? teacherOverview.students
    : apiUsers.length
      ? apiUsers
      : fallbackStudents;

  const students = studentsSource
    .filter((user) => user.role === "student" || !user.role)
    .map((student) => {
      const studentId = student.id || student._id;
      const stats = overviewById.get(String(studentId));

      return {
        id: String(studentId),
        username: student.username,
        email: student.email,
        class: student.class,
        name: getStudentDisplayName(student),
        avatar: getStudentAvatar(student),
        password: student.password,
        completedSessions: stats?.completedSessions ?? student.completedSessions ?? 0,
        totalScore: stats?.totalScore ?? student.totalScore ?? 0,
        latestResult: stats?.latestResult || student.latestResult || null,
      };
    });

  const totalStudents =
    teacherOverview.summary?.totalStudents || students.length || 0;
  const totalCompletions = students.reduce(
    (sum, student) => sum + (student.completedSessions || 0),
    0,
  );
  const avgScoreFromApi = teacherOverview.summary?.averageScore || 0;
  const fallbackLatestScores = students
    .map((student) => student.latestResult?.score)
    .filter((score) => score !== undefined && score !== null);
  const fallbackAverage = fallbackLatestScores.length
    ? Math.round(
        fallbackLatestScores.reduce((sum, score) => sum + score, 0) /
          fallbackLatestScores.length,
      )
    : 0;

  setText("st-students", totalStudents);
  setText("st-completions", totalCompletions);
  setText("st-avg", (avgScoreFromApi || fallbackAverage) ? `${avgScoreFromApi || fallbackAverage}%` : "—");

  const tbody = $("students-tbody");
  students.forEach((student) => {
    const latestScore = student.latestResult?.score;
    const { scoreClass, grade } = getScoreBadge(latestScore);

    if (tbody) {
      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td><div class="student-name-cell">
            <div class="student-avatar-sm">${student.avatar}</div>
            <span>${student.name}</span>
          </div></td>
          <td>${student.class || "—"}</td>
          <td>${student.completedSessions || 0} اختبار</td>
          <td>${latestScore !== undefined && latestScore !== null ? `${latestScore}%` : "—"}</td>
          <td><span class="score-badge ${scoreClass}">${grade}</span></td>
        </tr>`,
      );
    }
  });

  const quickStudents = $("quick-students");
  if (quickStudents) {
    students.forEach((student) => {
      quickStudents.insertAdjacentHTML(
        "beforeend",
        `
        <div class="qs-row">
          <div class="qs-left">
            <span class="qs-icon">${student.avatar}</span>
            <span class="qs-name">${student.name}<br><span style="color:var(--text3);font-size:11px">${student.class || "بدون فصل"}</span></span>
          </div>
          <span class="qs-val">${student.completedSessions || 0} ✅</span>
        </div>`,
      );
    });
  }

  const credsEl = $("student-creds");
  if (credsEl) {
    students.forEach((student) => {
      const secondary =
        student.password && !student.email
          ? `${student.username} / ${student.password}`
          : `${student.username || "—"} / ${student.email || "بدون بريد"}`;

      credsEl.insertAdjacentHTML(
        "beforeend",
        `
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);padding:4px 0;border-bottom:1px solid var(--border)">
          <span>${student.avatar} ${student.name}</span>
          <span style="color:var(--text3);direction:ltr">${secondary}</span>
        </div>`,
      );
    });
  }

  $("btn-export-json")?.addEventListener("click", () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(LESSONS, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "school_lessons.json");
    anchor.click();
    showToast("تم تصدير ملف المحتوى بنجاح", "success");
  });

  $("input-import-json")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error("invalid_json");
        }

        if (typeof saveLessonsData === "function") {
          saveLessonsData(parsed);
        } else {
          localStorage.setItem("app_lessons_data", JSON.stringify(parsed));
          showToast("تم استيراد الدروس بنجاح", "success");
          setTimeout(() => location.reload(), 1500);
        }
      } catch (error) {
        showToast("خطأ في صيغة الملف، تأكد من أنه JSON صحيح", "error");
        console.error(error);
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  });

  $("btn-reset-json")?.addEventListener("click", () => {
    if (
      confirm(
        "هل أنت متأكد من استعادة الدروس الافتراضية؟ سيتم مسح أي تعديلات سابقة.",
      )
    ) {
      localStorage.removeItem("app_lessons_data");
      showToast("تمت استعادة المحتوى الافتراضي، جاري التحديث...", "success");
      setTimeout(() => location.reload(), 1500);
    }
  });

  $("logout-btn")?.addEventListener("click", () => AUTH.logout());
})();

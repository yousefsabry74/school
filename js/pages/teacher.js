// ============================================================
//  PAGES/TEACHER.JS — Teacher Dashboard Logic
//  منصة التعلم الذكية
// ============================================================

(function () {
  'use strict';

  const teacher = AUTH.requireAuth('teacher');
  if (!teacher) return;

  setText('nav-name',      teacher.name);
  setText('teacher-name',  teacher.name.split(' ')[0]);
  setText('teacher-date',  formatDate());
  setText('st-students',   USERS.filter(u => u.role === 'student').length);

  // ── Lessons Control ──
  const ctrl = $('lessons-control');
  if (ctrl) {
    LESSONS.forEach((lesson, li) => {
      const lsKey  = `cfg_lesson_${lesson.id}`;
      const cfg    = JSON.parse(localStorage.getItem(lsKey) || 'null');
      const isAvail= cfg !== null ? cfg.available : lesson.available;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div class="lesson-control-row">
          <span class="lc-icon">${lesson.icon}</span>
          <div class="lc-info">
            <div class="lc-title">${APP.LESSON_LABELS[li]} — ${lesson.title}</div>
            <div class="lc-meta">${lesson.sessions} حصص</div>
          </div>
          <div class="lc-actions">
            <span class="toggle-label" id="ll-${lesson.id}">${isAvail ? 'مفعّل' : 'معطّل'}</span>
            <label class="toggle">
              <input type="checkbox" id="lt-${lesson.id}" ${isAvail ? 'checked' : ''}
                     data-lesson-id="${lesson.id}">
              <span class="toggle-slider"></span>
            </label>
            <button class="expand-btn" data-expand="${lesson.id}">الحصص ▾</button>
          </div>
        </div>
        <div class="sessions-panel" id="sp-${lesson.id}">
          ${lesson.sessions_data.map(s => {
            const sk    = `cfg_session_${lesson.id}_${s.id}`;
            const scfg  = JSON.parse(localStorage.getItem(sk) || 'null');
            const sAvail= scfg !== null ? scfg.available : s.available;
            return `
              <div class="session-ctrl-row">
                <span class="sc-icon">${s.icon}</span>
                <span class="sc-title">${s.title}</span>
                <span class="toggle-label" id="sl-${lesson.id}-${s.id}">${sAvail ? 'مفعّلة' : 'معطّلة'}</span>
                <label class="toggle">
                  <input type="checkbox" ${sAvail ? 'checked' : ''}
                         data-lesson-id="${lesson.id}" data-session-id="${s.id}">
                  <span class="toggle-slider"></span>
                </label>
              </div>`;
          }).join('')}
        </div>`;
      ctrl.appendChild(wrapper);
    });

    // Event delegation for all toggles and expand btns
    ctrl.addEventListener('change', e => {
      const inp = e.target;
      if (!inp.type === 'checkbox') return;
      const lid = inp.dataset.lessonId;
      const sid = inp.dataset.sessionId;
      if (sid) {
        localStorage.setItem(`cfg_session_${lid}_${sid}`, JSON.stringify({ available: inp.checked }));
        setText(`sl-${lid}-${sid}`, inp.checked ? 'مفعّلة' : 'معطّلة');
        showToast(inp.checked ? '✅ تم تفعيل الحصة' : '🔒 تم إيقاف الحصة', inp.checked ? 'success' : 'info');
      } else if (lid) {
        localStorage.setItem(`cfg_lesson_${lid}`, JSON.stringify({ available: inp.checked }));
        setText(`ll-${lid}`, inp.checked ? 'مفعّل' : 'معطّل');
        showToast(inp.checked ? '✅ تم تفعيل الدرس' : '🔒 تم إيقاف الدرس', inp.checked ? 'success' : 'info');
      }
    });

    ctrl.addEventListener('click', e => {
      const btn = e.target.closest('.expand-btn');
      if (!btn) return;
      $(`sp-${btn.dataset.expand}`)?.classList.toggle('open');
    });
  }

  // ── Students Table ──
  const students = USERS.filter(u => u.role === 'student');
  const tbody    = $('students-tbody');
  let totalCompletions = 0, totalScore = 0, scoreCount = 0;

  students.forEach(s => {
    const score = PROGRESS.getTotalScore(s.id);
    const done  = PROGRESS.getCompletedSessions(s.id);
    totalCompletions += done;
    if (score > 0) { totalScore += score; scoreCount++; }

    // Find last quiz result
    let lastResult = null;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`quiz_${s.id}`)) {
        try {
          const r = JSON.parse(localStorage.getItem(k));
          if (!lastResult || new Date(r.date) > new Date(lastResult.date)) lastResult = r;
        } catch { /* skip */ }
      }
    }

    const scoreClass = !lastResult ? 'score-z' : lastResult.score >= 80 ? 'score-hi' : lastResult.score >= 60 ? 'score-md' : 'score-lo';
    const grade      = !lastResult ? '—' : lastResult.score >= 80 ? 'ممتاز' : lastResult.score >= 60 ? 'جيد' : 'يحتاج مراجعة';

    if (tbody) tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><div class="student-name-cell">
          <div class="student-avatar-sm">${s.avatar}</div>
          <span>${s.name}</span>
        </div></td>
        <td>${s.class}</td>
        <td>${done} اختبار</td>
        <td>${lastResult ? lastResult.score + '%' : '—'}</td>
        <td><span class="score-badge ${scoreClass}">${grade}</span></td>
      </tr>`);
  });

  setText('st-completions', totalCompletions);
  setText('st-avg', scoreCount > 0 ? Math.round(totalScore / scoreCount) + '%' : '—');

  // ── Quick Students Panel ──
  const qsEl = $('quick-students');
  if (qsEl) {
    students.forEach(s => {
      const done = PROGRESS.getCompletedSessions(s.id);
      qsEl.insertAdjacentHTML('beforeend', `
        <div class="qs-row">
          <div class="qs-left">
            <span class="qs-icon">${s.avatar}</span>
            <span class="qs-name">${s.name}<br><span style="color:var(--text3);font-size:11px">${s.class}</span></span>
          </div>
          <span class="qs-val">${done} ✅</span>
        </div>`);
    });
  }

  // ── Credentials List ──
  const credsEl = $('student-creds');
  if (credsEl) {
    students.forEach(s => {
      credsEl.insertAdjacentHTML('beforeend', `
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);padding:4px 0;border-bottom:1px solid var(--border)">
          <span>${s.avatar} ${s.name}</span>
          <span style="color:var(--text3);direction:ltr">${s.username} / ${s.password}</span>
        </div>`);
    });
  }

  // ── Import / Export Logic ──
  $('btn-export-json')?.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LESSONS, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "school_lessons.json");
    dlAnchorElem.click();
    showToast('تم تصدير ملف المحتوى بنجاح', 'success');
  });

  $('input-import-json')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) throw new Error("ملف غير صالح، يجب أن يكون قائمة دروس.");
        // Use global helper from lessons.js
        if(typeof saveLessonsData === 'function') {
          saveLessonsData(parsed);
        } else {
          localStorage.setItem('app_lessons_data', JSON.stringify(parsed));
          showToast('تم استيراد الدروس بنجاح', 'success');
          setTimeout(() => location.reload(), 1500);
        }
      } catch (err) {
        showToast('خطأ في صيغة الملف، تأكد من انه JSON صحيح', 'error');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  });

  $('btn-reset-json')?.addEventListener('click', () => {
    if (confirm("هل أنت متأكد من استعادة الدروس الافتراضية؟ سيتم مسح أي تعديلات سابقة.")) {
      localStorage.removeItem('app_lessons_data');
      showToast('تمت استعادة المحتوى الافتراضي، جاري التحديث...', 'success');
      setTimeout(() => location.reload(), 1500);
    }
  });

  // ── Logout ──
  $('logout-btn')?.addEventListener('click', () => AUTH.logout());
})();

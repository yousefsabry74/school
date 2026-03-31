// ============================================================
//  PAGES/HOME.JS — Student Dashboard Logic
//  منصة التعلم الذكية
// ============================================================

(function () {
  'use strict';

  // ── Auth Guard ──
  const user = AUTH.requireAuth('student');
  if (!user) return;

  // ── Populate user info ──
  setText('nav-avatar',      user.avatar);
  setText('nav-name',        user.name);
  setText('welcome-name',    user.name.split(' ')[0]);
  setText('welcome-date',    formatDate());

  // ── Compute stats (cached) ──
  const xp               = PROGRESS.getTotalScore(user.id);
  const completedSessions= PROGRESS.getCompletedSessions(user.id);
  const totalSessions    = LESSONS.reduce((a, l) => a + l.sessions, 0);
  const progressPct      = totalSessions ? Math.round((completedSessions / totalSessions) * 100) : 0;

  setText('stat-score',       xp);
  setText('stat-sessions',    `${completedSessions}/${totalSessions}`);
  setText('stat-progress',    `${progressPct}%`);
  setText('total-score-hero', xp);
  setText('streak-val',       1);

  // ── XP / Level ──
  const lvlInfo = getLevelInfo(xp);
  setText('level-num-badge',  lvlInfo.num);
  setText('level-name-text',  lvlInfo.name);
  setText('mascot-level-badge', lvlInfo.name);
  setText('mascot',           lvlInfo.icon);
  setText('xp-current',      xp);
  setText('xp-max',          lvlInfo.nextXP);

  // Animate XP bar + milestones after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      const bar = $('xp-bar');
      if (bar) bar.style.width = lvlInfo.pct + '%';
      APP.LEVELS.forEach((l, i) => {
        if (xp >= l.xp) $(`ms${i}`)?.classList.add('reached');
      });
    }, 300);
  });

  // ── Mascot talks ──
  const speeches = [
    'رائع! استمر هكذا 🔥', 'هل أنت مستعد؟ 💪', 'العلم نور! 💡',
    'الشغل = قوة × مسافة ⚡', 'أنت نجم اليوم ⭐', 'لا تستسلم! 🚀'
  ];
  let speechIdx = 0;
  function mascotTalk() {
    speechIdx = (speechIdx + 1) % speeches.length;
    const s = $('mascot-speech');
    if (!s) return;
    s.style.animation = 'none';
    s.textContent = speeches[speechIdx];
    void s.offsetHeight; // reflow
    s.style.animation = 'speech-show .5s ease';
  }
  $('mascot')?.addEventListener('click', mascotTalk);
  setInterval(mascotTalk, 5000);

  // ── Render Lessons (with Event Delegation) ──
  const grid = $('lessons-grid');
  if (grid) {
    LESSONS.forEach((lesson, idx) => {
      const done = lesson.sessions_data.filter(
        s => PROGRESS.getQuiz(user.id, lesson.id, s.id)
      ).length;
      const pct     = lesson.sessions ? Math.round((done / lesson.sessions) * 100) : 0;
      const col     = lesson.color;
      const isAvail = lesson.available;
      const isDone  = pct === 100;
      const dw      = Math.max(20, Math.floor(80 / lesson.sessions));

      const card = document.createElement('div');
      card.className = `lesson-card ${isAvail ? '' : 'locked'}`;
      card.style.animationDelay = `${idx * .12}s`;
      if (isAvail) card.dataset.lessonId = lesson.id;

      card.innerHTML = `
        <div class="lesson-card-top" style="background:linear-gradient(135deg,${col}44,${col}22);">
          ${!isAvail ? `<div class="lock-overlay"><div class="lock-circle"><i class="ph ph-lock-simple-fill" style="font-size:22px;color:rgba(255,255,255,0.7)"></i></div></div>` : ''}
          <div class="lesson-icon-wrap">${lesson.icon}</div>
          <div class="lesson-badge" style="color:${col}">${APP.LESSON_LABELS[idx]}</div>
        </div>
        <div class="lesson-card-body">
          <div class="lesson-num"><i class="ph ph-stack"></i> ${lesson.sessions} حصص تعليمية</div>
          <div class="lesson-title">${lesson.title}</div>
          <div class="sessions-dots">
            ${Array.from({ length: lesson.sessions }, (_, i) => {
              const d = PROGRESS.getQuiz(user.id, lesson.id, i + 1);
              return `<div class="s-dot ${d ? 'done' : ''}" style="width:${dw}px;${!d ? 'background:rgba(255,255,255,0.1)' : ''}"></div>`;
            }).join('')}
          </div>
          <div class="lesson-progress-bar">
            <div class="lesson-progress-fill" style="width:${pct}%;background:linear-gradient(90deg,${col},${col}aa);"></div>
          </div>
        </div>
        <div class="lesson-card-footer">
          <div class="lesson-meta">
            <div class="meta-pill"><i class="ph ph-clock"></i> ${lesson.sessions * 45} دقيقة</div>
            <div class="meta-pill"><i class="ph ph-chart-pie-slice"></i> ${pct}%</div>
          </div>
          <button class="btn-lesson ${!isAvail ? 'locked' : isDone ? 'done-btn' : 'available'}"
                  ${!isAvail ? 'disabled' : ''}>
            ${!isAvail
              ? `<i class="ph ph-lock-simple"></i> قريباً`
              : isDone
              ? `<i class="ph ph-check-circle-fill"></i> مكتمل`
              : done > 0
              ? `<i class="ph ph-play-circle-fill"></i> استمر`
              : `<i class="ph ph-play-fill"></i> ابدأ`}
          </button>
        </div>`;
      grid.appendChild(card);
    });

    // Event delegation — one listener for all cards
    grid.addEventListener('click', e => {
      const card = e.target.closest('[data-lesson-id]');
      if (!card) return;
      const id = +card.dataset.lessonId;
      window.location.href = `session.html?lesson=${id}&session=1`;
    });
  }

  // ── Achievements ──
  const achGrid = $('achievements-grid');
  if (achGrid) {
    const achs = [
      { icon:'⭐', name:'أول خطوة',       desc:'أكمل حصتك الأولى',         color:'#FFD600', ok: completedSessions >= 1 },
      { icon:'🔥', name:'متعلم نشيط',     desc:'أكمل 3 حصص',               color:'#FF6B35', ok: completedSessions >= 3 },
      { icon:'🏆', name:'بطل الاختبارات', desc:'احصل على 80% في اختبار',   color:'#6C3EFF', ok: PROGRESS.hasHighScore(user.id, 80) },
      { icon:'🌟', name:'نجم العلوم',     desc:'أكمل جميع الحصص',          color:'#00D97E', ok: completedSessions >= totalSessions },
    ];
    achs.forEach(a => {
      achGrid.insertAdjacentHTML('beforeend', `
        <div class="ach-card ${a.ok ? 'unlocked' : 'locked-ach'}">
          <div class="ach-icon-wrap" style="background:${a.color}22;border:1px solid ${a.color}44;">
            <span style="font-size:22px">${a.icon}</span>
          </div>
          <div>
            <div class="ach-name">${a.name}</div>
            <div class="ach-desc">${a.desc} ${a.ok ? '✅' : ''}</div>
          </div>
        </div>`);
    });
  }
})();

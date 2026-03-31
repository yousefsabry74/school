// ============================================================
//  PAGES/SESSION.JS — Session / Lesson Page Logic
//  منصة التعلم الذكية
// ============================================================

(function () {
  "use strict";

  // ── Auth Guard ──
  const user = AUTH.requireAuth("student");
  if (!user) return;

  setText("nav-avatar", user.avatar);
  setText("nav-name", user.name);

  // ── URL Params ──
  const params = new URLSearchParams(location.search);
  let currentLessonId = parseInt(params.get("lesson") || "1");
  let currentSessionId = parseInt(params.get("session") || "1");
  let lesson, session;

  // ── Load Lesson ──
  function loadLesson() {
    lesson = getLessonById(currentLessonId);
    session = getSessionById(currentLessonId, currentSessionId);
    if (!lesson || !session) {
      window.location.href = "home.html";
      return;
    }

    setText("lesson-badge", lesson.icon + " " + lesson.title);
    setText("session-icon", session.icon);
    setText("session-title", session.title);
    setText("breadcrumb", `وحدة القوى والطاقة ← ${lesson.title}`);
    document.title = `${session.title} | منصة التعلم الذكية`;

    renderSessionsNav();
    renderObjectives();
    renderActivities();
    renderQuiz();
    switchTab("objectives");
  }

  // ── Sessions Nav ──
  function renderSessionsNav() {
    const nav = $("sessions-nav");
    if (!nav) return;
    nav.innerHTML = lesson.sessions_data
      .map((s) => {
        const done = !!PROGRESS.getQuiz(user.id, lesson.id, s.id);
        const isActive = s.id === currentSessionId;
        const isLocked = !s.available;
        return `
        <button class="session-nav-btn ${isActive ? "active" : ""} ${isLocked && !isActive ? "locked" : ""}"
                data-sid="${isLocked ? "" : s.id}">
          ${done ? '<i class="ph ph-check-circle-fill" style="color:var(--green)"></i>' : isLocked ? '<i class="ph ph-lock-simple-fill"></i>' : s.icon}
          ${s.title}
        </button>`;
      })
      .join("");

    nav.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sid]");
      if (!btn || !btn.dataset.sid) return;
      goSession(+btn.dataset.sid);
    });
  }

  function goSession(sid) {
    window.location.href = `session.html?lesson=${currentLessonId}&session=${sid}`;
  }

  // ── Tab Switching ──
  let activitiesMotivationTimer = null;
  function switchTab(tab) {
    // ✅ VALIDATION: منع الانتقال للـ Quiz بدون ملء الأنشطة
    if (tab === "quiz" && !quizSubmitted) {
      if (!checkAllActivitiesAnswered()) {
        showToast("❌ يجب إكمال جميع الأنشطة أولاً!", "error");
        return;
      }
    }

    $$(".tab-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.tab === tab),
    );
    $$(".tab-content").forEach((c) => c.classList.remove("active"));
    $(`tab-${tab}`)?.classList.add("active");
    if (tab === "activities" && session.activities?.[0]) {
      currentChatContext = session.activities[0].chatbotContext;
      // 🤖 Start motivational messages when entering activities
      startActivitiesMotivation();
    } else if (tab !== "activities") {
      // Stop motivation when leaving activities
      clearTimeout(activitiesMotivationTimer);
    }
    // Open quiz assistant when entering quiz tab
    if (tab === "quiz" && !quizSubmitted) {
      setTimeout(() => {
        quizAssistantGreet();
      }, 800);
    }
  }

  // ── Motivational Messages for Activities ──
  const motivationalMessages = [
    '🤖 هل تحتاج مساعدة؟ اضغط على "اسأل المساعد" 💡',
    "🌟 شغلك ممتاز حتى الآن! هل تحتاج توضيح؟",
    "👏 أنت بطل! لو في أي استفسار أنا هنا 🤖",
    "📚 تذكر: اقرأ السؤال بعناية قبل الإجابة!",
  ];

  function startActivitiesMotivation() {
    clearTimeout(activitiesMotivationTimer);
    // First message after 8 seconds
    activitiesMotivationTimer = setTimeout(() => {
      const msg =
        motivationalMessages[
          Math.floor(Math.random() * motivationalMessages.length)
        ];
      sendMotivationalMessage(msg);
      // Then every 15 seconds
      setInterval(() => {
        if ($("tab-activities")?.classList.contains("active")) {
          const msg2 =
            motivationalMessages[
              Math.floor(Math.random() * motivationalMessages.length)
            ];
          sendMotivationalMessage(msg2);
        }
      }, 15000);
    }, 8000);
  }

  function sendMotivationalMessage(text) {
    // Show floating bubble near robot icon
    let bubble = $("motivation-bubble");
    if (!bubble) {
      bubble = document.createElement("div");
      bubble.id = "motivation-bubble";
      bubble.style.cssText = [
        "position:fixed",
        "bottom:140px",
        "left:24px",
        "z-index:9989",
        "max-width:280px",
        "background:linear-gradient(135deg,var(--primary),#FF9500)",
        "border-radius:20px",
        "padding:16px 18px",
        "font-size:13px",
        "font-weight:700",
        "color:white",
        "direction:rtl",
        "box-shadow:var(--glow)",
        "animation:popIn .4s cubic-bezier(.34,1.56,.64,1)",
        "cursor:pointer",
        "transition:all .25s",
      ].join(";");
      // ✅ أضف click handler — عند الضغط يفتح شات البوت
      bubble.addEventListener("click", () => {
        openChatbotFor(currentChatContext);
      });
      document.body.appendChild(bubble);
    }
    bubble.textContent = text;
    bubble.style.display = "block";
    setTimeout(() => {
      bubble.style.opacity = "0";
      bubble.style.transition = "opacity .4s";
      setTimeout(() => {
        bubble.style.display = "none";
        bubble.style.opacity = "1";
      }, 400);
    }, 4000);
  }
  window.switchTab = switchTab;

  // ── Objectives ──
  function renderObjectives() {
    const list = $("objectives-list");
    if (!list) return;
    list.innerHTML = session.objectives
      .map(
        (o, i) => `
      <div class="objective-item animate-fadeup" style="animation-delay:${i * 0.1}s">
        <div class="obj-num">${i + 1}</div>
        <div class="obj-icon-box">${o.icon}</div>
        <div class="obj-text">${o.text}</div>
      </div>`,
      )
      .join("");
  }

  // ── Activities ──
  function renderActivities() {
    const container = $("activities-container");
    if (!container) return;
    if (!session.activities?.length) {
      container.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text3)">🔒 أنشطة هذه الحصة قيد الإعداد</div>`;
      return;
    }

    container.innerHTML = session.activities
      .map((act, ai) => {
        let bodyHTML = "";

        if (act.scenarios) {
          bodyHTML += `<div class="scenarios-grid" id="scenarios-${ai}">
          ${act.scenarios
            .map(
              (sc, si) => `
            <div class="scenario-item" id="sc-${ai}-${si}">
              <div style="flex:1">
                <div class="scenario-text">${si + 1}. ${sc.text}</div>
                <div class="scenario-feedback" id="scf-${ai}-${si}"></div>
              </div>
              <div class="scenario-btns">
                <button class="sc-btn yes" data-ai="${ai}" data-si="${si}" data-ans="true" title="يتحقق الشغل">✅</button>
                <button class="sc-btn no"  data-ai="${ai}" data-si="${si}" data-ans="false" title="لا يتحقق">❌</button>
              </div>
            </div>`,
            )
            .join("")}
        </div>`;
        }

        if (act.problems) {
          bodyHTML += `<div class="problems-list">
          ${act.problems
            .map(
              (pr, pi) => `
            <div class="problem-item">
              <div class="problem-text">${pi + 1}. ${pr.text}</div>
              <div class="problem-hint">💡 تلميح: ${pr.hint}</div>
              <div class="problem-input-row">
                <input class="problem-input" id="prob-${ai}-${pi}" type="number" placeholder="الإجابة"
                       data-answer="${pr.answer}" data-unit="${pr.unit}">
                <span class="problem-unit">${pr.unit}</span>
                <button class="check-btn" data-ai="${ai}" data-pi="${pi}">تحقق ✓</button>
              </div>
              <div class="problem-result" id="pr-${ai}-${pi}"></div>
            </div>`,
            )
            .join("")}
        </div>`;
        }

        if (act.matchPairs) {
          bodyHTML += `<div id="match-container-${ai}"></div>`;
        }

        if (act.blocks) {
          bodyHTML += `<div class="content-blocks" id="blocks-${ai}">
          ${act.blocks
            .map((blk, bi) => {
              if (blk.type === "robot_prompt")
                return `
              <div class="robot-prompt-block">
                <div class="robot-avatar">🤖</div>
                <div class="robot-bubble">${blk.content}</div>
              </div>`;
              if (blk.type === "video") {
                const isYouTube =
                  blk.src.includes("youtube.com") ||
                  blk.src.includes("youtu.be");
                if (isYouTube) {
                  return `
                  <div class="block-video">
                    <iframe src="${blk.src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                  </div>
                  <div style="text-align:center; margin-bottom:12px; font-size:12px;">
                    <a href="${blk.src.replace("/embed/", "/watch?v=")}" target="_blank" style="color:var(--primary); text-decoration:none;">
                      <i class="ph ph-link"></i> إذا لم يعمل الفيديو (ممنوع من المصدر)، يرجى الضغط هنا
                    </a>
                  </div>`;
                } else {
                  return `
                  <div class="block-video">
                    <video controls src="${blk.src}" style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:var(--rd);"></video>
                  </div>`;
                }
              }
              if (blk.type === "image")
                return `
              <img src="${blk.src}" alt="صورة توضيحية" class="block-image">`;
              if (blk.type === "text")
                return `<div class="block-text">${blk.content}</div>`;
              if (blk.type === "textarea")
                return `
              <div class="block-textarea">
                <label>${blk.label}</label>
                <textarea rows="4" placeholder="اكتب إجابتك هنا..."></textarea>
              </div>`;
              if (blk.type === "inputs_row")
                return `
              <div class="block-inputs-row">
                ${blk.fields
                  .map(
                    (f) => `
                  <div class="input-col">
                    <label>${f.label}</label>
                    <input type="text" class="block-input" placeholder="...">
                  </div>
                `,
                  )
                  .join("")}
              </div>`;
              if (blk.type === "table")
                return `
              <div class="block-table">
                <table>
                  <thead><tr>${blk.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
                  <tbody>
                    ${blk.rows
                      .map(
                        (row) => `
                      <tr>
                        ${row
                          .map(
                            (cell) => `
                          <td>${cell ? `<span>${cell}</span>` : `<input type="text" class="cell-input">`}</td>
                        `,
                          )
                          .join("")}
                      </tr>
                    `,
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>`;
              return "";
            })
            .join("")}
        </div>`;
        }

        return `
        <div class="activity-card animate-fadeup" style="animation-delay:${ai * 0.15}s" data-context="${act.chatbotContext}">
          <div class="activity-card-header">
            <span class="activity-emoji">${act.emoji}</span>
            <div class="activity-header-info">
              <div class="activity-num">نشاط ${ai + 1} من ${session.activities.length}</div>
              <div class="activity-title">${act.title}</div>
              <div class="activity-desc">${act.description}</div>
            </div>
            <button class="chatbot-open-btn" data-context="${act.chatbotContext}">
              <i class="ph ph-robot-fill"></i> اسأل المساعد
            </button>
          </div>
          <div class="activity-card-body">
            <div class="activity-steps">
              <h4><i class="ph ph-list-checks"></i> خطوات النشاط:</h4>
              ${act.steps
                .map(
                  (st, si) => `
                <div class="step-item">
                  <span class="step-num">${si + 1}</span>
                  <span>${st}</span>
                </div>`,
                )
                .join("")}
            </div>
            ${bodyHTML}
          </div>
        </div>`;
      })
      .join("");

    session.activities.forEach((act, ai) => {
      if (act.matchPairs)
        renderMatchingActivity(act.matchPairs, `match-container-${ai}`);
    });

    container.addEventListener("click", (e) => {
      const scBtn = e.target.closest(".sc-btn");
      if (scBtn) {
        answerScenario(
          +scBtn.dataset.ai,
          +scBtn.dataset.si,
          scBtn.dataset.ans === "true",
        );
        return;
      }
      const chkBtn = e.target.closest(".check-btn");
      if (chkBtn) {
        checkProblem(+chkBtn.dataset.ai, +chkBtn.dataset.pi);
        return;
      }
      const cbBtn = e.target.closest(".chatbot-open-btn");
      if (cbBtn) openChatbotFor(cbBtn.dataset.context);
    });

    // ✅ Update the "متابعة للتقويم" button to check for answers
    const doneBtn = $$(".activities-done-btn .obj-done-btn")[0];
    if (doneBtn) {
      doneBtn.onclick = () => {
        // Check if all activities have answers
        if (checkAllActivitiesAnswered()) {
          switchTab("quiz");
        }
      };
    }
  }

  // ✅ VALIDATION: تحقق من ملء جميع الأنشطة
  function checkAllActivitiesAnswered() {
    if (!session.activities?.length) return true;

    for (let ai = 0; ai < session.activities.length; ai++) {
      const act = session.activities[ai];
      let activityAnswered = false;

      // Check scenarios
      if (act.scenarios?.length) {
        const answered = $$(`#sc-${ai}-0, #sc-${ai}-1, #sc-${ai}-2`).some(
          (el) =>
            el?.classList.contains("correct") ||
            el?.classList.contains("wrong"),
        );
        if (answered) activityAnswered = true;
      }

      // Check problems
      if (act.problems?.length) {
        const answered = $$(`[id^="pr-${ai}-"]`).some(
          (el) =>
            el?.textContent.includes("✅") || el?.textContent.includes("❌"),
        );
        if (answered) activityAnswered = true;
      }

      // Check matching
      if (act.matchPairs?.length) {
        const allMatched =
          $$(`#match-container-${ai} .match-item.matched`).length ===
          act.matchPairs.length * 2;
        if (allMatched) activityAnswered = true;
      }

      // Check textareas and inputs
      if (act.blocks?.length) {
        const textareas = $$(`#blocks-${ai} textarea`);
        const inputs = $$(`#blocks-${ai} .block-input`);
        const answered = Array.from([...textareas, ...inputs]).some(
          (el) => el?.value?.trim().length > 0,
        );
        if (answered) activityAnswered = true;
      }

      // If no activity data, skip
      if (
        !act.scenarios?.length &&
        !act.problems?.length &&
        !act.matchPairs?.length &&
        !act.blocks?.length
      ) {
        activityAnswered = true;
      }

      if (!activityAnswered) {
        showToast(
          `❌ يجب الإجابة على النشاط ${ai + 1} قبل الانتقال للتقويم!`,
          "error",
        );
        return false;
      }
    }

    return true;
  }
  window.checkAllActivitiesAnswered = checkAllActivitiesAnswered;

  function answerScenario(ai, si, answer) {
    const sc = session.activities[ai].scenarios[si];
    const el = $(`sc-${ai}-${si}`);
    const fb = $(`scf-${ai}-${si}`);
    if (!el || !fb) return;
    const isCorrect = answer === sc.answer;
    el.classList.remove("correct", "wrong");
    el.classList.add(isCorrect ? "correct" : "wrong");
    fb.textContent = (isCorrect ? "✅ صحيح! " : "❌ خطأ — ") + sc.explanation;
    fb.style.color = isCorrect ? "var(--green)" : "var(--red)";
    $$(`.sc-btn[data-ai="${ai}"][data-si="${si}"]`).forEach((b) =>
      b.classList.remove("selected"),
    );
    el.querySelector(`.sc-btn[data-ans="${answer}"]`)?.classList.add(
      "selected",
    );
  }

  function checkProblem(ai, pi) {
    const input = $(`prob-${ai}-${pi}`);
    const resEl = $(`pr-${ai}-${pi}`);
    if (!input || !resEl) return;
    const val = parseFloat(input.value);
    const correct = +input.dataset.answer;
    const unit = input.dataset.unit;
    if (isNaN(val)) {
      resEl.textContent = "⚠️ أدخل رقماً";
      resEl.className = "problem-result err";
      return;
    }
    const isCorrect = val === correct;
    resEl.textContent = isCorrect
      ? `✅ إجابة صحيحة! الشغل = ${correct} ${unit} 🎉`
      : `❌ الإجابة الصحيحة هي ${correct} ${unit} — راجع القانون`;
    resEl.className = "problem-result " + (isCorrect ? "ok" : "err");
  }

  // ── Matching Activity ──
  function renderMatchingActivity(pairs, containerId) {
    const wrap = $(containerId);
    if (!wrap) return;
    const shuffled = [...pairs].sort(() => Math.random() - 0.5);
    let selectedTermIdx = null;
    let matchedCount = 0;

    wrap.innerHTML = `
      <div style="margin-bottom:12px;font-weight:700;font-size:14px;color:var(--text2)">
        🔗 اضغط على مصطلح ثم على تعريفه المناسب
      </div>
      <div class="match-grid">
        <div>
          <div class="match-col-label">المصطلحات</div>
          <div class="match-col" id="${containerId}-terms">
            ${pairs.map((p, i) => `<div class="match-item" data-term-idx="${i}">${p.term}</div>`).join("")}
          </div>
        </div>
        <div>
          <div class="match-col-label">التعريفات</div>
          <div class="match-col" id="${containerId}-defs">
            ${shuffled.map((p, i) => `<div class="match-item" data-def-idx="${i}" data-term="${p.term}">${p.def}</div>`).join("")}
          </div>
        </div>
      </div>
      <div class="match-score" id="${containerId}-score">تم المطابقة: 0 / ${pairs.length}</div>`;

    wrap.addEventListener("click", (e) => {
      const termEl = e.target.closest("[data-term-idx]");
      const defEl = e.target.closest("[data-def-idx]");

      if (termEl && !termEl.classList.contains("matched")) {
        $$("[data-term-idx]", wrap).forEach((el) =>
          el.classList.remove("selected"),
        );
        selectedTermIdx = +termEl.dataset.termIdx;
        termEl.classList.add("selected");
        return;
      }

      if (
        defEl &&
        !defEl.classList.contains("matched") &&
        selectedTermIdx !== null
      ) {
        const targetTerm = pairs[selectedTermIdx].term;
        const isCorrect = defEl.dataset.term === targetTerm;

        if (isCorrect) {
          wrap
            .querySelector(`[data-term-idx="${selectedTermIdx}"]`)
            ?.classList.replace("selected", "matched");
          defEl.classList.add("matched");
          matchedCount++;
          const sc = $(`${containerId}-score`);
          if (sc)
            sc.textContent = `✅ تم المطابقة: ${matchedCount} / ${pairs.length}`;
          if (matchedCount === pairs.length) {
            launchConfetti(2000);
            showToast("🎉 رائع! أكملت نشاط المطابقة!", "success");
          }
        } else {
          const termEl3 = wrap.querySelector(
            `[data-term-idx="${selectedTermIdx}"]`,
          );
          termEl3?.classList.add("wrong-flash");
          defEl.classList.add("wrong-flash");
          setTimeout(() => {
            termEl3?.classList.remove("wrong-flash", "selected");
            defEl.classList.remove("wrong-flash");
          }, 450);
        }
        selectedTermIdx = null;
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  //  🎓 QUIZ ASSISTANT — Educational AI for 5th Graders
  //  Friendly, motivating, Saudi-Arabic tone
  //  System Prompt integrated as structured data
  // ══════════════════════════════════════════════════════════
  const QUIZ_ASSISTANT = {
    correctPhrases: [
      { message: "عاش يا بطل! 🌟 إجابة صحيحة!", emotion: "very_happy" },
      { message: "كفو عليك! أبدعت والله! 🔥", emotion: "very_happy" },
      { message: "ممتاز! هكذا يكون التفوق 🏆", emotion: "very_happy" },
      { message: "أبدعت والله! استمر هكذا 💪", emotion: "very_happy" },
      { message: "صح! أنت فاهم الدرس زين 👏", emotion: "happy" },
      { message: "إجابة صحيحة! أنت نجم اليوم ⭐", emotion: "very_happy" },
    ],

    wrongPhrases: [
      { message: "قريب جدًا! حاول مرة ثانية 💪", emotion: "sad", hint: true },
      { message: "ولا يهمك، أنت تقدر! 😊", emotion: "sad", hint: false },
      { message: "لا تستسلم! المحاولة ستنجح 🌟", emotion: "sad", hint: true },
      {
        message: "بداية حلوة! وبدور ثاني هتصح 💙",
        emotion: "sad",
        hint: false,
      },
      {
        message: "قريب جدًا من الإجابة! فكّر مرة ثانية 🤔",
        emotion: "sad",
        hint: true,
      },
    ],

    emotions: {
      very_happy: { emoji: "🤩", label: "متحمس جداً" },
      happy: { emoji: "😊", label: "سعيد" },
      sad: { emoji: "😢", label: "حزين لكن مشجع" },
    },

    onAnswer(isCorrect) {
      const pool = isCorrect ? this.correctPhrases : this.wrongPhrases;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const emoj = this.emotions[pick.emotion]?.emoji || "🤖";
      return {
        message: `${emoj} ${pick.message}`,
        emotion: pick.emotion,
        character_image: isCorrect
          ? "cartoon child jumping with joy, very happy"
          : "cartoon child with sad face but thumbs up, encouraging",
      };
    },

    onFinish(score) {
      if (score >= 80)
        return {
          message: "أنت نجم اليوم! 🌟 كفو عليك! أداء رائع جداً 🏆",
          emotion: "very_happy",
          character_image: "cartoon child jumping with trophy, extremely happy",
        };
      if (score >= 60)
        return {
          message: "شغلك ممتاز! كمّل كده 👏 بداية حلوة جداً!",
          emotion: "happy",
          character_image: "cartoon child smiling and giving thumbs up",
        };
      return {
        message: "بداية حلوة! ومع التدريب هتبقى أحسن 💪 لا تستسلم!",
        emotion: "sad",
        character_image: "cartoon child with sad face but encouraging pose",
      };
    },
  };

  // ── Quiz Assistant Bubble (appears next to mascot area) ──
  let bubbleTimer = null;
  function showQuizAssistantBubble(resp, questionIdx) {
    // Only show every other question to avoid spam
    if (questionIdx % 2 !== 0) return;

    const panel = $("chatbot-panel");
    // If chatbot open, add as bot message
    if (panel?.classList.contains("open")) {
      addBotMessage(resp.message);
      return;
    }

    // Otherwise show floating bubble
    clearTimeout(bubbleTimer);
    let bubble = $("qa-bubble");
    if (!bubble) {
      bubble = document.createElement("div");
      bubble.id = "qa-bubble";
      bubble.style.cssText = [
        "position:fixed",
        "bottom:100px",
        "left:24px",
        "z-index:9990",
        "max-width:260px",
        "background:var(--card)",
        "border:2px solid var(--primary)",
        "border-radius:18px",
        "padding:14px 18px",
        "font-size:14px",
        "font-weight:700",
        "color:var(--text)",
        "direction:rtl",
        "box-shadow:var(--glow)",
        "animation:popIn .4s cubic-bezier(.34,1.56,.64,1)",
        "display:flex",
        "gap:10px",
        "align-items:center",
      ].join(";");
      document.body.appendChild(bubble);
    }

    const emo = QUIZ_ASSISTANT.emotions[resp.emotion] || { emoji: "🤖" };
    bubble.innerHTML = `
      <span style="font-size:28px">${emo.emoji}</span>
      <span>${resp.message}</span>`;
    bubble.style.display = "flex";

    bubbleTimer = setTimeout(() => {
      bubble.style.animation = "none";
      bubble.style.opacity = "0";
      bubble.style.transition = "opacity .4s";
      setTimeout(() => {
        if (bubble) bubble.style.display = "none";
        bubble.style.opacity = "1";
      }, 400);
    }, 3500);
  }

  // ── Quiz Assistant: greet when entering quiz tab ──
  let quizGreeted = false;
  function quizAssistantGreet() {
    if (quizGreeted || quizSubmitted) return;
    quizGreeted = true;
  }

  // ── Quiz ──
  let selectedAnswers = {};
  let timerInterval = null;
  let quizSubmitted = false;

  function renderQuiz() {
    const q = session.quiz;
    if (!q?.questions?.length) {
      const qs = $("quiz-questions");
      if (qs)
        qs.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text3)">🔒 التقويم قيد الإعداد</div>`;
      const sb = $("submit-quiz-btn");
      if (sb) sb.style.display = "none";
      return;
    }

    const prevResult = PROGRESS.getQuiz(
      user.id,
      currentLessonId,
      currentSessionId,
    );
    if (prevResult) {
      showResult(prevResult, true);
      return;
    }

    const qContainer = $("quiz-questions");
    if (qContainer) {
      qContainer.innerHTML = q.questions
        .map(
          (qu, qi) => `
        <div class="question-card animate-fadeup" style="animation-delay:${qi * 0.1}s">
          <div class="q-header">
            <div class="q-num">${qi + 1}</div>
            <div class="q-text">${qu.text}</div>
          </div>
          ${
            qu.type === "essay"
              ? `
            <textarea class="essay-input" id="qans-${qi}" rows="5" placeholder="اكتب إجابتك العلمية..."></textarea>
          `
              : qu.type === "experiment"
                ? `
            <div class="experiment-fields">
              ${qu.fields
                .map(
                  (f) => `
                <div class="exp-field">
                  <label>${f.label}</label>
                  ${
                    f.isTextarea
                      ? `<textarea rows="4" class="exp-input" data-qi="${qi}" data-fid="${f.id}" placeholder="اكتب..."></textarea>`
                      : `<input type="text" class="exp-input" data-qi="${qi}" data-fid="${f.id}" placeholder="...">`
                  }
                </div>
              `,
                )
                .join("")}
            </div>
          `
                : `
            <div class="q-options" id="qopts-${qi}">
              ${(qu.options || [])
                .map(
                  (opt, oi) => `
                <div class="q-option" data-qi="${qi}" data-oi="${oi}">
                  <div class="q-option-label">${["أ", "ب", "ج", "د"][oi]}</div>
                  <span>${opt}</span>
                </div>`,
                )
                .join("")}
            </div>
          `
          }
          <div class="q-explanation" id="qexp-${qi}">${qu.explanation || ""}</div>
        </div>`,
        )
        .join("");

      qContainer.addEventListener("click", (e) => {
        const opt = e.target.closest(".q-option[data-qi]");
        if (!opt || quizSubmitted) return;
        const qi = +opt.dataset.qi,
          oi = +opt.dataset.oi;

        // If re-selecting same option, ignore
        if (selectedAnswers[qi] === oi) return;
        selectedAnswers[qi] = oi;
        $$(`#qopts-${qi} .q-option`).forEach((el, i) =>
          el.classList.toggle("selected", i === oi),
        );
      });
    }

    startTimer(q.timeLimit || APP.QUIZ_TIME_MINUTES);
  }

  function startTimer(minutes) {
    let secs = minutes * 60;
    const display = $("timer-display");
    timerInterval = setInterval(() => {
      if (secs <= 0) {
        clearInterval(timerInterval);
        submitQuiz();
        return;
      }
      const m = Math.floor(secs / 60),
        s = secs % 60;
      if (display) {
        display.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        if (secs <= 60) display.style.color = "var(--red)";
      }
      secs--;
    }, 1000);
  }

  function buildQuizAnswers(questions) {
    const answers = {};

    questions.forEach((question, qi) => {
      if (question.type === "mcq" || !question.type) {
        const chosenIndex = selectedAnswers[qi];
        answers[question.id || `q${qi + 1}`] =
          chosenIndex === undefined ? null : question.options?.[chosenIndex];
        return;
      }

      if (question.type === "essay") {
        answers[question.id || `q${qi + 1}`] = $(`qans-${qi}`)?.value?.trim() || "";
        return;
      }

      if (question.type === "experiment") {
        const fieldAnswers = {};
        (question.fields || []).forEach((field) => {
          const input = $$(`[data-qi="${qi}"][data-fid="${field.id}"]`)[0];
          fieldAnswers[field.id] = input?.value?.trim() || "";
        });
        answers[question.id || `q${qi + 1}`] = fieldAnswers;
      }
    });

    return answers;
  }

  async function submitQuiz() {
    if (quizSubmitted) return;

    const qs = session.quiz.questions;

    // ✅ VALIDATION: تحقق من أن جميع الأسئلة تمت الإجابة عليها
    let hasAllAnswers = true;

    qs.forEach((qu, qi) => {
      let isAnswered = false;

      if (qu.type === "mcq" || !qu.type) {
        // أسئلة الاختيار من متعدد — تحقق من التحديد
        isAnswered = qi in selectedAnswers;
      } else if (qu.type === "essay") {
        // أسئلة essay — تحقق من الـ textarea
        const textarea = $(`qans-${qi}`);
        isAnswered = textarea?.value?.trim().length > 0;
      } else if (qu.type === "experiment") {
        // أسئلة experiment — تحقق من أن جميع الحقول مليانة
        if (qu.fields?.length > 0) {
          // لازم جميع الحقول مليانة
          isAnswered = qu.fields.every((field) => {
            let input = null;
            if (field.isTextarea) {
              input = $$(`[data-qi="${qi}"][data-fid="${field.id}"]`)[0];
            } else {
              input = $$(`[data-qi="${qi}"][data-fid="${field.id}"]`)[0];
            }
            return input?.value?.trim().length > 0;
          });
        }
      }

      if (!isAnswered) {
        hasAllAnswers = false;
      }
    });

    // إذا كانت هناك أسئلة بدون إجابة، أظهر رسالة تنبيه
    if (!hasAllAnswers) {
      showToast(
        "❌ يجب الإجابة على جميع الأسئلة بشكل كامل قبل التسليم!",
        "error",
      );
      return;
    }

    clearInterval(timerInterval);
    quizSubmitted = true;
    let correct = 0;
    qs.forEach((qu, qi) => {
      if (qu.type === "mcq" || !qu.type) {
        const chosen = selectedAnswers[qi];
        const isCorrect = chosen === qu.correct;
        if (isCorrect) correct++;
        $$(`#qopts-${qi} .q-option`).forEach((el, oi) => {
          if (oi === qu.correct) el.classList.add("correct");
          else if (oi === chosen && !isCorrect) el.classList.add("wrong");
        });
      } else {
        const ansEls = $$(`[data-qi="${qi}"], #qans-${qi}`);
        const answered = Array.from(ansEls).some(
          (el) => el.value && el.value.trim().length > 0,
        );
        if (answered) correct++;
      }
      const exp = $(`qexp-${qi}`);
      if (exp) exp.style.display = "block";
    });
    const score = Math.round((correct / qs.length) * 100);
    const result = {
      score,
      correct,
      total: qs.length,
      date: new Date().toISOString(),
    };
    const saved = await PROGRESS.saveQuiz(
      user.id,
      currentLessonId,
      currentSessionId,
      result,
      buildQuizAnswers(qs),
    );
    if (!saved) {
      showToast(
        "تم حفظ الدرجة محلياً، لكن لم تكتمل مزامنتها مع القاعدة حالياً.",
        "info",
      );
    }
    const btn = $("submit-quiz-btn");
    if (btn) btn.style.display = "none";
    // Remove assistant bubble
    const bubble = $("qa-bubble");
    if (bubble) bubble.style.display = "none";
    setTimeout(() => showResult(result, false), 800);
  }
  window.submitQuiz = submitQuiz;

  function showResult(result, isPrev) {
    const qContainer = $("quiz-questions");
    const submitBtn = $("submit-quiz-btn");
    const timerBox = $("quiz-timer-box");
    const resultEl = $("quiz-result");
    if (qContainer) qContainer.style.display = "none";
    if (submitBtn) submitBtn.style.display = "none";
    if (timerBox) timerBox.style.display = "none";
    if (!resultEl) return;

    // Use QUIZ_ASSISTANT for end-of-quiz message
    const assistantResp = QUIZ_ASSISTANT.onFinish(result.score);
    const emo = QUIZ_ASSISTANT.emotions[assistantResp.emotion];
    const scoreColor =
      result.score >= 80
        ? "var(--green)"
        : result.score >= 60
          ? "var(--yellow)"
          : "var(--red)";

    resultEl.style.display = "block";
    resultEl.innerHTML = `
      <div class="result-character">
        <div class="result-char-emoji" id="result-char">${emo.emoji}</div>
        <div class="result-char-label">${emo.label}</div>
      </div>
      <div class="result-score" style="color:${scoreColor}">${result.score}%</div>
      <div class="result-assistant-msg">${assistantResp.message} ${isPrev ? '<span style="font-size:12px;color:var(--text3)">(نتيجة سابقة)</span>' : ""}</div>
      <div class="result-breakdown">
        <div class="rb-item"><div class="rb-val" style="color:var(--green)">${result.correct}</div><div class="rb-lbl">إجابات صحيحة</div></div>
        <div class="rb-item"><div class="rb-val" style="color:var(--red)">${result.total - result.correct}</div><div class="rb-lbl">إجابات خاطئة</div></div>
        <div class="rb-item"><div class="rb-val" style="color:var(--yellow)">${result.total}</div><div class="rb-lbl">إجمالي الأسئلة</div></div>
      </div>
      <div class="result-actions">
        <button class="btn-success" onclick="window.location.href='home.html'"><i class="ph ph-house-fill"></i> الرئيسية</button>
        ${!isPrev ? `<button class="btn-secondary" onclick="location.reload()"><i class="ph ph-arrow-clockwise"></i> مراجعة</button>` : ""}
      </div>`;

    // Animate the character
    const charEl = $("result-char");
    if (charEl) {
      charEl.style.animation =
        result.score >= 60
          ? "bounce 1s ease infinite"
          : "float 2s ease-in-out infinite";
    }

    if (!isPrev && result.score >= 60) {
      launchConfetti(3500);
      const cel = $("celebration-modal");
      if (cel) {
        setText("cel-score-val", result.score + "%");
        setText(
          "cel-sub-text",
          assistantResp.message.replace(/[🌟🏆💪👏😊🤩]/g, "").trim(),
        );
        const scoreEl = $("cel-score-val");
        if (scoreEl)
          scoreEl.style.color =
            result.score >= 80 ? "var(--green)" : "var(--yellow)";
        const star = cel.querySelector(".cel-star");
        if (star) star.textContent = emo.emoji;
        setTimeout(() => cel.classList.add("show"), 1000);
      }
    }
  }

  // ── Chatbot ──
  let currentChatContext = null;
  let chatOpen = false;
  let chatbotBusy = false;

  function toggleChatbot() {
    chatOpen = !chatOpen;
    $("chatbot-panel")?.classList.toggle("open", chatOpen);
    $("chatbot-fab")?.classList.toggle("hidden", chatOpen);
    // ✅ أخفِ/أظهر الرسالة التحفيزية
    const bubble = $("motivation-bubble");
    if (chatOpen) {
      if (bubble) bubble.style.display = "none";
    } else {
      // إذا أغلق الشات، عاود تشغيل الرسائل التحفيزية
      if ($("tab-activities")?.classList.contains("active")) {
        startActivitiesMotivation();
      }
    }
    if (chatOpen && !$("chatbot-messages")?.children.length) {
      initChatbot(currentChatContext);
    }
  }
  window.toggleChatbot = toggleChatbot;

  function openChatbotFor(context) {
    currentChatContext = context;
    chatOpen = true;
    $("chatbot-panel")?.classList.add("open");
    $("chatbot-fab")?.classList.add("hidden");
    // ✅ أخفِ الرسالة التحفيزية عندما يفتح الشات
    const bubble = $("motivation-bubble");
    if (bubble) bubble.style.display = "none";
    const msgs = $("chatbot-messages");
    if (msgs) msgs.innerHTML = "";
    initChatbot(context);
  }

  function getChatbotKB(context) {
    return CHATBOT_KB[context] || CHATBOT_KB[Object.keys(CHATBOT_KB)[0]];
  }

  function getChatActivity(context) {
    return (
      session?.activities?.find((activity) => activity.chatbotContext === context) ||
      null
    );
  }

  function buildChatbotApiContext(context) {
    const activity = getChatActivity(context);

    return [
      `الصف الدراسي: ${APP.grade}`,
      `المادة: ${APP.subject}`,
      lesson?.title ? `اسم الدرس: ${lesson.title}` : "",
      session?.title ? `اسم الحصة: ${session.title}` : "",
      activity?.title ? `اسم النشاط: ${activity.title}` : "",
      activity?.description ? `وصف النشاط: ${activity.description}` : "",
      activity?.steps?.length
        ? `خطوات النشاط: ${activity.steps.join(" | ")}`
        : "",
      session?.objectives?.length
        ? `أهداف الحصة: ${session.objectives
            .map((objective) => objective.text)
            .join(" | ")}`
        : "",
      context ? `معرف سياق المساعدة: ${context}` : "",
    ]
      .filter(Boolean)
      .join(" . ");
  }

  function getLocalChatbotReply(text, context) {
    const kb = getChatbotKB(context);
    const lower = text.toLowerCase();
    let reply = kb?.fallback || "🤖 سأحاول مساعدتك بشكل مبسط.";

    if (kb?.responses) {
      for (const response of kb.responses) {
        if (
          response.keywords.some(
            (keyword) => lower.includes(keyword) || text.includes(keyword),
          )
        ) {
          reply = response.answer;
          break;
        }
      }
    }

    return reply;
  }

  function setChatbotInputState(disabled) {
    const input = $("chatbot-input");
    const sendBtn = $("send-btn");

    if (input) input.disabled = disabled;
    if (sendBtn) sendBtn.disabled = disabled;
  }

  function scrollChatToBottom() {
    const msgs = $("chatbot-messages");
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function showBotTyping() {
    const msgs = $("chatbot-messages");
    if (!msgs) return null;

    const typing = document.createElement("div");
    typing.className = "chat-typing";
    typing.innerHTML =
      '<div class="chat-dot"></div><div class="chat-dot"></div><div class="chat-dot"></div>';
    msgs.appendChild(typing);
    scrollChatToBottom();
    return typing;
  }

  function appendChatMessage(text, sender) {
    const msgs = $("chatbot-messages");
    if (!msgs) return;

    const msg = document.createElement("div");
    msg.className = `chat-msg ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;

    msg.appendChild(bubble);
    msgs.appendChild(msg);
    scrollChatToBottom();
  }

  function initChatbot(context) {
    const kb = getChatbotKB(context);
    if (!kb) return;

    addBotMessage(kb.greeting);

    const qr = $("quick-replies");
    if (!qr) return;

    qr.innerHTML = (kb.quickReplies || [])
      .map((q) => `<button class="quick-reply" data-text="${q}">${q}</button>`)
      .join("");

    qr.onclick = (e) => {
      const btn = e.target.closest(".quick-reply");
      if (btn) sendQuickReply(btn.dataset.text);
    };
  }

  function addBotMessage(text) {
    const typing = showBotTyping();

    setTimeout(() => {
      typing?.remove();
      appendChatMessage(text, "bot");
    }, 700);
  }

  function addUserMessage(text) {
    appendChatMessage(text, "user");
  }

  async function sendChatMessage() {
    if (chatbotBusy) return;

    const input = $("chatbot-input");
    const text = input?.value.trim();
    if (!text) return;
    if (input) input.value = "";
    addUserMessage(text);
    const kb =
      CHATBOT_KB[currentChatContext] || CHATBOT_KB[Object.keys(CHATBOT_KB)[0]];
    const lower = text.toLowerCase();
    let reply = kb?.fallback || "🤖 سأحاول مساعدتك!";
    if (kb?.responses) {
      for (const r of kb.responses) {
        if (r.keywords.some((k) => lower.includes(k) || text.includes(k))) {
          reply = r.answer;
          break;
        }
      }
    }
    setTimeout(() => addBotMessage(reply), 300);
  }

  async function sendChatMessageViaApi() {
    if (chatbotBusy) return;

    const input = $("chatbot-input");
    const text = input?.value.trim();
    if (!text) return;

    if (input) input.value = "";
    addUserMessage(text);
    setChatbotInputState(true);
    chatbotBusy = true;

    const typing = showBotTyping();

    try {
      const response = await CHATBOT_SERVICE.ask({
        question: text,
        context: buildChatbotApiContext(currentChatContext),
        lessonId: currentLessonId,
      });

      typing?.remove();
      appendChatMessage(
        response.answer || getLocalChatbotReply(text, currentChatContext),
        "bot",
      );
    } catch (error) {
      console.error("Chatbot request failed:", error);
      typing?.remove();
      appendChatMessage(getLocalChatbotReply(text, currentChatContext), "bot");
      showToast(
        "تعذر الاتصال بالمساعد عبر الباك حالياً، فتم استخدام الرد المحلي مؤقتاً.",
        "info",
      );
    } finally {
      chatbotBusy = false;
      setChatbotInputState(false);
      input?.focus();
    }
  }
  window.sendChatMessage = sendChatMessageViaApi;

  function sendQuickReply(text) {
    const input = $("chatbot-input");
    if (input) input.value = text;
    sendChatMessageViaApi();
  }

  // ── Event Listeners ──
  $("chatbot-fab")?.addEventListener("click", toggleChatbot);
  $("chatbot-close")?.addEventListener("click", toggleChatbot);
  $("chatbot-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessageViaApi();
  });
  $("send-btn")?.addEventListener("click", sendChatMessageViaApi);
  $("submit-quiz-btn")?.addEventListener("click", submitQuiz);
  $("celebration-modal")?.addEventListener("click", function () {
    this.classList.remove("show");
  });
  $("cel-close-btn")?.addEventListener("click", () =>
    $("celebration-modal")?.classList.remove("show"),
  );

  // ── Init ──
  async function initPage() {
    await PROGRESS.syncUserQuizResults(user.id);
    loadLesson();
  }

  initPage();
})();

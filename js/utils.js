// ============================================================
//  UTILS.JS — Shared Utility Functions
//  منصة التعلم الذكية
// ============================================================

// ── Toast Notification ── (single instance, no re-render spam)
function showToast(msg, type = 'success') {
  const existing = document.getElementById('global-toast');
  if (existing) existing.remove();

  const gradients = {
    success: 'linear-gradient(135deg,#00D97E,#00A85A)',
    error:   'linear-gradient(135deg,#FF4757,#CC0000)',
    info:    'linear-gradient(135deg,#6C3EFF,#FF6B35)',
  };

  const toast = document.createElement('div');
  toast.id = 'global-toast';
  toast.style.cssText = [
    'position:fixed','bottom:30px','left:50%',
    'transform:translateX(-50%) translateY(80px)',
    `background:${gradients[type] || gradients.info}`,
    'color:#fff','padding:14px 30px','border-radius:50px',
    "font-family:'Cairo',sans-serif",'font-size:16px','font-weight:700',
    'z-index:99999','box-shadow:0 8px 30px rgba(0,0,0,0.4)',
    'transition:transform .4s cubic-bezier(.34,1.56,.64,1)',
    'direction:rtl','white-space:nowrap','pointer-events:none',
  ].join(';');
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    setTimeout(() => toast.remove(), 400);
  }, APP.TOAST_DURATION);
}

// ── Format Date (Arabic) ──
function formatDate() {
  return new Date().toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Debounce ──
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── DOM Helpers ──
function $(id)  { return document.getElementById(id); }
function $$(sel,ctx=document) { return Array.from(ctx.querySelectorAll(sel)); }
function setText(id, val) { const el=$(id); if(el) el.textContent = val; }

// ── Data Helpers ──
function getLessonById(id) {
  return LESSONS.find(l => l.id === id) || null;
}
function getSessionById(lessonId, sessionId) {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;
  return lesson.sessions_data.find(s => s.id === sessionId) || null;
}
function getUserByCredentials(username, password) {
  return USERS.find(u => u.username === username && u.password === password) || null;
}

// ── XP / Level ──
function getLevelInfo(xp) {
  const levels = APP.LEVELS;
  let lvl = 0;
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].xp) lvl = i;
    else break;
  }
  const next  = levels[lvl + 1] ? levels[lvl + 1].xp : levels[levels.length - 1].xp + 500;
  const prev  = levels[lvl].xp;
  const pct   = Math.min(100, Math.round(((xp - prev) / (next - prev)) * 100));
  return {
    index:   lvl,
    num:     lvl + 1,
    name:    levels[lvl].name,
    icon:    levels[lvl].icon,
    xp,
    nextXP:  next,
    prevXP:  prev,
    pct,
  };
}

// ── Simple Confetti ──
function launchConfetti(duration = 3000) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#6C3EFF','#FF6B35','#FFD600','#00D97E','#00C8FF','#FF71CE'];
  const pieces = Array.from({ length: 120 }, () => ({
    x:         Math.random() * canvas.width,
    y:         Math.random() * canvas.height - canvas.height,
    r:         Math.random() * 8 + 4,
    d:         Math.random() * 2 + 1,
    color:     colors[Math.floor(Math.random() * colors.length)],
    spin:      0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
    tilt:      0,
  }));

  let start = null;
  function draw(ts) {
    if (!start) start = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y    += p.d;
      p.spin += p.tiltSpeed;
      p.tilt  = Math.sin(p.spin) * 15;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tilt * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r / 2);
      ctx.restore();
    });
    if (ts - start < duration) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(draw);
}

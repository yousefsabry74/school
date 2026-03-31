// ============================================
// SESSION DATA
// ============================================
const sessions = {
    1: {
        icon: '💪',
        title: 'الحصة الأولى - مفهوم الشغل',
        body: `
            <div style="text-align:right; direction:rtl;">
                <div style="background:rgba(108,62,255,0.1); border:1px solid rgba(108,62,255,0.3); border-radius:12px; padding:16px; margin-bottom:16px;">
                    <p style="font-weight:700; color:#8B5FFF; margin-bottom:8px;">📌 ماذا ستتعلم؟</p>
                    <ul style="padding-right:20px; color:#B0B8D8; font-size:14px; line-height:2;">
                        <li>تعريف الشغل في العلوم</li>
                        <li>الفرق بين الشغل والجهد</li>
                        <li>قانون حساب الشغل: ش = ق × م</li>
                        <li>وحدة قياس الشغل (الجول)</li>
                    </ul>
                </div>
                <div style="display:flex; gap:12px; justify-content:center; margin-bottom:16px;">
                    <div style="background:rgba(255,214,0,0.1); border:1px solid rgba(255,214,0,0.3); border-radius:10px; padding:12px 20px; text-align:center;">
                        <div style="font-size:20px; font-weight:900; color:#FFD600;">45</div>
                        <div style="font-size:12px; color:#6B7A99;">دقيقة</div>
                    </div>
                    <div style="background:rgba(0,217,126,0.1); border:1px solid rgba(0,217,126,0.3); border-radius:10px; padding:12px 20px; text-align:center;">
                        <div style="font-size:20px; font-weight:900; color:#00D97E;">100</div>
                        <div style="font-size:12px; color:#6B7A99;">نقطة</div>
                    </div>
                    <div style="background:rgba(0,201,255,0.1); border:1px solid rgba(0,201,255,0.3); border-radius:10px; padding:12px 20px; text-align:center;">
                        <div style="font-size:20px; font-weight:900; color:#00C9FF;">5</div>
                        <div style="font-size:12px; color:#6B7A99;">أسئلة</div>
                    </div>
                </div>
                <p style="color:#B0B8D8; font-size:14px; text-align:center;">لتبدأ الحصة، انقر على الزر أدناه ✨</p>
            </div>
        `
    },
    2: {
        icon: '⚡',
        title: 'الحصة الثانية - أشكال الطاقة',
        body: '<p>🔒 يجب إكمال الحصة الأولى أولاً للوصول إلى هذه الحصة!</p>'
    },
    3: {
        icon: '🔄',
        title: 'الحصة الثالثة - تحوّل الطاقة وحفظها',
        body: '<p>🔒 يجب إكمال الحصة الثانية أولاً للوصول إلى هذه الحصة!</p>'
    }
};

// ============================================
// OPEN / CLOSE SESSION MODAL
// ============================================
function openSession(num) {
    const session = sessions[num];
    document.getElementById('modalTitle').textContent = session.title;
    document.getElementById('modalBody').innerHTML = session.body;

    const iconEl = document.querySelector('.modal-icon');
    iconEl.textContent = session.icon;

    document.getElementById('sessionModal').classList.add('active');

    if (num > 1) {
        document.querySelector('.modal-start-btn').disabled = true;
        document.querySelector('.modal-start-btn').style.opacity = '0.4';
        document.querySelector('.modal-start-btn').textContent = '🔒 غير متاحة بعد';
    } else {
        document.querySelector('.modal-start-btn').disabled = false;
        document.querySelector('.modal-start-btn').style.opacity = '1';
        document.querySelector('.modal-start-btn').textContent = '🚀 ابدأ الحصة الآن!';
    }
}

function closeModal() {
    document.getElementById('sessionModal').classList.remove('active');
}

// ============================================
// DASHBOARD
// ============================================
function goToDashboard() {
    document.getElementById('dashboardModal').classList.add('active');
}

function closeDashboard() {
    document.getElementById('dashboardModal').classList.remove('active');
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// ============================================
// START LESSON (Demo)
// ============================================
function startLesson() {
    closeModal();
    showToast('🎉 يتم تحميل الحصة الأولى... جاهز للتعلم!');
    // Simulate progress update
    setTimeout(() => {
        // In the real app, this would navigate to the lesson content
        showComingSoon();
    }, 1500);
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: linear-gradient(135deg, #6C3EFF, #FF6B35);
        color: white;
        padding: 14px 28px;
        border-radius: 50px;
        font-family: 'Cairo', sans-serif;
        font-size: 16px;
        font-weight: 700;
        z-index: 9999;
        box-shadow: 0 8px 30px rgba(108, 62, 255, 0.4);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        direction: rtl;
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; }, 50);
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ============================================
// COMING SOON OVERLAY
// ============================================
function showComingSoon() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.92);
        backdrop-filter: blur(12px);
        z-index: 9998;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 20px;
        font-family: 'Cairo', sans-serif;
        direction: rtl;
        animation: fadeIn 0.5s ease;
    `;
    overlay.innerHTML = `
        <div style="font-size:80px; animation:bounce-anim 2s infinite;">🚀</div>
        <h2 style="font-size:36px; font-weight:900; color:white; text-align:center;">قريباً!</h2>
        <p style="font-size:18px; color:#B0B8D8; text-align:center; max-width:400px; line-height:1.8;">
            هذا تصميم مبدئي فقط — محتوى الحصة الكامل سيكون جاهزاً قريباً! 🎓
        </p>
        <div style="display:flex; gap:12px; align-items:center;">
            <div style="width:10px; height:10px; border-radius:50%; background:#6C3EFF; animation:dot-pulse 1.4s infinite 0s;"></div>
            <div style="width:10px; height:10px; border-radius:50%; background:#FF6B35; animation:dot-pulse 1.4s infinite 0.2s;"></div>
            <div style="width:10px; height:10px; border-radius:50%; background:#00D97E; animation:dot-pulse 1.4s infinite 0.4s;"></div>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: linear-gradient(135deg, #6C3EFF, #8B5FFF);
            color: white; border: none; padding: 14px 32px;
            border-radius: 50px; font-family: 'Cairo', sans-serif;
            font-size: 16px; font-weight: 700; cursor: pointer;
            margin-top: 10px;
        ">العودة للدرس</button>
    `;
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce-anim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes dot-pulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.4);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
}

// ============================================
// ENTRANCE ANIMATIONS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Animate session cards on scroll
    const cards = document.querySelectorAll('.session-card, .objective-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Keyboard shortcut: Escape to close modals
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });
});

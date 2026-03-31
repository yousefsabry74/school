// ============================================================
//  CONFIG.JS — App-wide Constants
//  منصة التعلم الذكية
// ============================================================

const APP = Object.freeze({
  name:    'منصة التعلم الذكية',
  version: '2.0.0',
  grade:   'الصف الخامس الابتدائي',
  subject: 'العلوم',

  // XP Level thresholds
  LEVELS: [
    { name: 'مبتدئ',   xp: 0,    icon: '🌱' },
    { name: 'مستكشف', xp: 100,  icon: '🤖' },
    { name: 'عالم',   xp: 300,  icon: '🔬' },
    { name: 'بطل',    xp: 600,  icon: '🏆' },
    { name: 'نجم',    xp: 1000, icon: '⭐' },
    { name: 'عبقري',  xp: 1500, icon: '🚀' },
  ],

  // Lesson name labels
  LESSON_LABELS: ['الدرس الأول','الدرس الثاني','الدرس الثالث','الدرس الرابع'],

  // Toast defaults
  TOAST_DURATION: 3000,

  // Quiz defaults
  QUIZ_TIME_MINUTES: 10,
});

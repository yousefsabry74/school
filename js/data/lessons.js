// ============================================================
//  DATA/LESSONS.JS — Dynamic Lessons + Sessions Data
//  منصة التعلم الذكية
// ============================================================

const INITIAL_LESSONS = [
  {
    id: 1,
    title: "الشغل والطاقة",
    icon: "⚡",
    color: "#6C3EFF",
    colorLight: "rgba(108,62,255,0.15)",
    sessions: 1, // Only 1 loaded for now to match user content
    available: true,
    sessions_data: [
      {
        id: 1,
        title: "متى يحدث الشغل؟",
        icon: "💪",
        available: true,

        objectives: [
          {
            icon: "📝",
            text: "يبني تفسيرًا علميًا يوضح العلاقة بين القوة والإزاحة واتجاه الحركة لتحديد متى يُنجَز شغل على جسم.",
          },
          {
            icon: "🔍",
            text: "يستخدم نموذج القوى لتحليل حركة جسم على سطح خشن، موضحًا كيف يؤثر الاحتكاك في مقدار الشغل وانتقال الطاقة.",
          },
          {
            icon: "📐",
            text: "يفسر لماذا يُعد رفع جسم شغلاً علميًا بينما الاحتفاظ به ثابتًا لا يُعد شغلاً، من خلال تحليل حدوث الإزاحة أو عدمها.",
          },
        ],

        activities: [
          {
            id: "act1-1",
            title: "نشاط ١: هل كل تعب يُعد شغلاً؟ (5 دقائق)",
            emoji: "🤔",
            description:
              "إثارة التعارض المعرفي والانتقال من الفهم الحياتي لتعريف الشغل.",
            steps: ["شاهد الفيديو الذي يعرض الحالتين معاً."],
            blocks: [
              {
                type: "robot_prompt",
                content:
                  "أهلاً بك يا بطل! شاهد الفيديو التالي، ثم اجب: في أي حالة تم إنجاز شغل علمي؟ ولماذا؟ عبّر عن رأيك بحرية.",
              },
              { type: "video", src: "uploads/lesson1/نشاط1.mp4" },
              { type: "textarea", id: "q1", label: "إجابتي:" },
              { type: "text", content: "أستنتج:" },
              {
                type: "inputs_row",
                id: "inputs1",
                fields: [
                  { id: "f1", label: "العلاقة بين القوة:" },
                  { id: "f2", label: "الإزاحة:" },
                  { id: "f3", label: "اتجاه الحركة:" },
                ],
              },
            ],
            chatbotContext: "activity_1_work_concept",
          },
          {
            id: "act1-2",
            title: "نشاط ٢: هل أنجزت شغلاً؟ (5 دقائق)",
            emoji: "🛠️",
            description:
              "تحديد متى يُنجز شغل من خلال تحليل العلاقة بين القوة والإزاحة.",
            steps: ["شاهد المحاكاة ثم سجل استنتاجاتك في الجدول الآتي."],
            blocks: [
              {
                type: "robot_prompt",
                content:
                  "ممتاز! دعنا الآن نشاهد المحاكاة. هل يمكنك أن تخبرني، ما هي الحالة التي حدث فيها شغل؟ وما هو السبب العلمي؟",
              },
              { type: "text", content: "🎥 محاكاة تفاعلية" },
              { type: "video", src: "uploads/lesson1/نشاط3.mp4" },
              {
                type: "inputs_row",
                id: "inputs2",
                fields: [
                  { id: "f1", label: "الحالة التي حدث فيها شغل:" },
                  { id: "f2", label: "السبب العلمي:" },
                ],
              },
              {
                type: "table",
                id: "tbl1",
                headers: [
                  "مقدار القوة",
                  "المسافة",
                  "اتجاه القوة",
                  "هل حدث شغل؟",
                  "لماذا؟",
                ],
                rows: [
                  ["", "", "", "", ""],
                  ["", "", "", "", ""],
                ],
              },
              { type: "textarea", id: "q2", label: "استنتاجي:" },
            ],
            chatbotContext: "activity_1_work_concept",
          },
          {
            id: "act1-3",
            title: "نشاط ٣: الاحتكاك… صديق أم عدو؟ (5 دقائق)",
            emoji: "🛑",
            description: "تحليل تأثير الاحتكاك في مقدار الشغل وانتقال الطاقة.",
            steps: ["شاهد الفيديو والمحاكاة ثم سجل نتائجك."],
            blocks: [
              {
                type: "robot_prompt",
                content:
                  "فكر معي صديقي! عند دفع الصندوق على سطحين مختلفين، أي سطح تطلب منك قوة أكبر؟ ولِماذا؟",
              },
              { type: "text", content: "📊 ملاحظات عن الاحتكاك" },
              { type: "video", src: "uploads/lesson1/نشاط2.mp4" },

              {
                type: "inputs_row",
                id: "inputs3",
                fields: [
                  { id: "f1", label: "السطح الذي تطلب قوة أكبر:" },
                  { id: "f2", label: "السبب:" },
                ],
              },
              {
                type: "table",
                id: "tbl2",
                headers: [
                  "نوع السطح",
                  "قوة الاحتكاك",
                  "القوة المطلوبة",
                  "ماذا حدث للطاقة؟",
                ],
                rows: [
                  ["أملس", "", "", ""],
                  ["خشن", "", "", ""],
                ],
              },
              {
                type: "textarea",
                id: "q3",
                label: "كيف يؤثر الاحتكاك في الشغل؟",
              },
            ],
            chatbotContext: "activity_1_work_concept",
          },
          {
            id: "act1-4",
            title: "نشاط ٤: رفع أم حمل؟ (5 دقائق)",
            emoji: "⚖️",
            description:
              "التمييز بين إنجاز الشغل وعدم إنجازه من خلال تحليل وجود الإزاحة.",
            steps: ["حلل الصورتين ثم أكمل الجدول."],
            blocks: [
              {
                type: "robot_prompt",
                content:
                  "لعبة الفروق! انظر إلى صورتي رفع الثقل وحمله، هل تستطيع إخباري متى حدثت الإزاحة ومتى أُنجز الشغل؟",
              },
              { type: "text", content: "📸 تحليل الصورتين" },
              { type: "image", src: "uploads/lesson1/نشاط4.png" },
              {
                type: "table",
                id: "tbl3",
                headers: [
                  "الحالة",
                  "هل توجد إزاحة؟",
                  "هل حدث شغل؟",
                  "التفسير العلمي",
                ],
                rows: [
                  ["رفع الثقل", "", "", ""],
                  ["حمل الثقل ثابتًا", "", "", ""],
                ],
              },
              {
                type: "textarea",
                id: "q4",
                label: "لماذا لا يُعد الاحتفاظ بالثقل شغلاً رغم التعب؟",
              },
            ],
            chatbotContext: "activity_1_work_formula",
          },
        ],

        quiz: {
          timeLimit: 5,
          questions: [
            {
              id: "q1",
              type: "essay",
              text: "إذا دفعت صندوقًا على سطح أملس ثم على سطح خشن بنفس المسافة، في أي الحالتين تبذل شغلًا أكبر؟ ولماذا؟",
              explanation:
                "💡 يطلب الروبوت منك: تفسير السبب، واستخدام مفهوم الاحتكاك، وذكر اتجاه القوة.",
            },
            {
              id: "q2",
              type: "experiment",
              text: "صمّم تجربة رقمية باستخدام المحاكاة لتوضيح كيف يؤثر الاحتكاك في مقدار الشغل المبذول عند دفع جسم.",
              fields: [
                { id: "f1", label: "المتغير المستقل:" },
                { id: "f2", label: "المتغير التابع:" },
                { id: "f3", label: "خطوات التجربة:", isTextarea: true },
                { id: "f4", label: "تفسير النتائج:", isTextarea: true },
              ],
            },
            {
              id: "q3",
              type: "mcq",
              text: "عند زيادة الاحتكاك بين سطحين، فإن الشغل المبذول:",
              options: ["يقل", "لا يتغير", "يزداد", "يساوي صفر"],
              correct: 2,
              explanation:
                "للتغلب على الاحتكاك المتزايد، نحتاج لبذل قوة أكبر ومجهود أكثر وبالتالي يزداد الشغل.",
            },
          ],
        },
      },
    ],
  },
];

// Read from localStorage if available, otherwise use INITIAL_LESSONS
let savedData = null;
try {
  const raw = localStorage.getItem("app_lessons_data");
  if (raw) savedData = JSON.parse(raw);
} catch (e) {
  console.warn("Could not parse saved lessons");
}

const LESSONS = savedData || INITIAL_LESSONS;

// Helper to save back to local storage (used by Admin Dashboard)
function saveLessonsData(newLessonsArray) {
  localStorage.setItem("app_lessons_data", JSON.stringify(newLessonsArray));
  showToast("✅ تم حفظ هيكل الدروس بنجاح!", "success");
  setTimeout(() => location.reload(), 1500);
}

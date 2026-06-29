/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // تأمين دعم الوضع الداكن (Dark Mode) بشكل قياسي للمستقبل
  theme: {
    extend: {
      colors: {
        // ألوان هويتك الرسمية المعتمدة
        brand: {
          blue: '#1a237e',
          blueHover: '#121858',  // إضافة حالة التمرير للزر الأزرق
          green: '#00c853',
          greenHover: '#00a444', // إضافة حالة التمرير للزر الأخضر
          orange: '#E87722',
          orangeHover: '#c65f17', // إضافة حالة التمرير للزر البرتقالي
        },
        // ألوان لوحة التحكم الاحترافية لعمق وفخامة الواجهات
        panel: {
          bg: '#0a0f24',          // الخلفية العميقة للتطبيق
          surface: '#121833',     // خلفية الكروت والقوائم المنبثقة
          surfaceHover: '#1b2244',// إضافة: تمرير الماوس فوق الكروت أو أسطر الجداول والقوائم
          border: '#1e264f',      // ألوان الحواف الرفيعة اللامعة
          
          // إضافة: توحيد درجات النصوص لمنع التشتت بين الصفحات
          textMain: '#f8fafc',    // للنصوص الأساسية والعناوين (أبيض ناصع ومريح)
          textSub: '#94a3b8',     // للعناوين الفرعية، التواريخ، والملاحظات (رمادي هادئ)
          textMuted: '#475569',   // للنصوص التعطيلية أو التلميحات الداخلية (Placeholders)
        },
        // إضافة: ألوان الحالات القياسية لنظام الـ SaaS العالمي (حضور، غياب، مالية، تقييم)
        status: {
          success: '#00c853',     // حاضر / مدفوع / ممتاز
          warning: '#ffb300',     // متأخر / معلق / مقبول
          danger: '#ef4444',      // غائب / ملغي / ضعيف
          info: '#29b6f6',        // مستند جديد / إشعار
        }
      },
      boxShadow: {
        // تأثير الظلال الزجاجية الفاخرة (Glassmorphic) لكروت الطلاب والحلقات
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px rgba(255, 255, 255, 0.05)',
        'glow-green': '0 0 15px rgba(0, 200, 83, 0.15)', // توهج خفيف لحالات الطلاب المستمرين
        'glow-blue': '0 0 15px rgba(26, 35, 126, 0.2)',
        'glow-orange': '0 0 15px rgba(232, 119, 34, 0.15)', // إضافة توهج برتقالي للتنبيهات والاختبارات
      },
      fontFamily: {
        // إجبار المتصفحات على إعطاء الأولوية لأفخم الخطوط العربية المريحة للعين
        sans: ['Cairo', 'Tajawal', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        // حركات (Animations) خفيفة وسريعة تمنح لوحة التحكم روحاً تفاعلية عالمية
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

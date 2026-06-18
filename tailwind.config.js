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
        // دمج ألوان هويتك الرسمية
        brand: {
          blue: '#1a237e',
          green: '#00c853',
          orange: '#E87722',
        },
        // ألوان لوحة التحكم الاحترافية (تمنح الواجهات عمقاً وفخامة)
        panel: {
          bg: '#0a0f24',       // الخلفية العميقة للتطبيق
          surface: '#121833',  // خلفية الكروت والقوائم المنبثقة
          border: '#1e264f',   // ألوان الحواف الرفيعة اللامعة
        }
      },
      boxShadow: {
        // تأثير الظلال الزجاجية الفاخرة (Glassmorphism) لكروت الطلاب والحلقات
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px rgba(255, 255, 255, 0.05)',
        'glow-green': '0 0 15px rgba(0, 200, 83, 0.15)', // توهج خفيف لحالات الطلاب المستمرين
        'glow-blue': '0 0 15px rgba(26, 35, 126, 0.2)',
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

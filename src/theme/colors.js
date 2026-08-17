// src/theme/colors.js

export const colors = {
  // 1. الألوان الرئيسية (من صفحة تسجيل الدخول)
  primary: '#D97706',          // البرتقالي الذهبي لزر التسجيل والتركيز
  primaryHover: '#B45309',     // الدرجة الداكنة عند الهوفر
  gold: '#F59E0B',             // البرتقالي الذهبي للروابط
  goldLight: '#FEF08A',        // درجة الأصفر الفاتح للشعار
  goldDark: '#B45309',         // درجة البرتقالي الداكن للشعار

  // 2. الهوية الزمردية (Logo & Status)
  brandEmerald: {
    DEFAULT: '#10B981',        // الزمردي الرئيسي (شريط التحميل والأيقونات)
    dark: '#047857',           // الزمردي الداكن
    teal: '#0F766E',           // وهج الشعار
    tealDark: '#042F2E',       // خلفية مربع الشعار
    light: '#34D399',          // الزمردي الفاتح للرسائل والنجاح
    border: 'rgba(45, 212, 191, 0.35)',
    shadow: 'rgba(15, 118, 110, 0.35)',
  },

  // 3. الخلفيات والأسطح الداكنة (تم توحيد خلفية المشروع بخلفية الشاشة الافتتاحية)
  bg: '#070B14',               // الخلفية الأساسية المعتمدة لكل المشروع (الخاصة بالشاشة الافتتاحية)
  bgSplash: '#070B14',         // نفس خلفية المشروع
  card: '#0F172A',             // خلفية بطاقة تسجيل الدخول والنوافذ
  input: '#090F16',            // خلفية حقول الإدخال
  buttonGoogle: '#1E293B',     // خلفية زر Google وزر اللغة

  // 4. الحدود (Borders)
  border: '#223147',           // حدود الحقول
  borderCard: '#1E293B',       // حدود البطاقات
  borderGoogle: '#334155',     // حدود زر Google

  // 5. النصوص (Text Colors)
  text: '#F8FAFC',             // النص الناصع
  textSub: '#E2E8F0',          // النص الفرعي
  textLight: '#CBD5E1',        // النص المساعد
  textMuted: '#94A3B8',        // النصوص الثانوية
  textPlaceholder: '#64748B',  // نص الـ Placeholder
  textDark: '#475569',         // الحقوق ونسخة التطبيق

  // 6. الحالات والأخطاء (Status)
  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerBg: 'rgba(239, 68, 68, 0.1)',
  dangerBorder: 'rgba(239, 68, 68, 0.25)',
  
  successBg: 'rgba(16, 185, 129, 0.1)',
  successBorder: 'rgba(16, 185, 129, 0.25)',

  // 7. التدرجات البصرية (Gradients)
  gradients: {
    // تدرج الخلفية الرسمي الموحد للمشروع بالكامل (من الشاشة الافتتاحية)
    pageBackground: 'radial-gradient(circle at center, #0F172A 0%, #070B14 100%)',
    splashBackground: 'radial-gradient(circle at center, #0F172A 0%, #070B14 100%)',
    
    logoBg: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
    goldSvg: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
    emeraldSvg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    progressBar: 'linear-gradient(90deg, #10B981, #F59E0B)',
  }
};

export const C = colors;
export const g = colors.gradients;
export default colors;

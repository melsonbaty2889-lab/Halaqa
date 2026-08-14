// src/theme/colors.js

export const colors = {
  // اللون الأساسي (البرتقالي العنبري للأزرار والإجراءات الرئيسية)
  primary: {
    DEFAULT: '#D97706',
    hover: '#B45309',
    light: '#F59E0B',
    focusRing: 'rgba(217, 119, 6, 0.2)',
    shadow: 'rgba(217, 119, 6, 0.25)',
  },

  // الأخضر الزمردي/التركواز (لون اللوجو، الأيقونات، ورموز الأمان)
  brandEmerald: {
    DEFAULT: '#10B981',
    teal: '#0F766E',
    light: '#34D399',
    border: 'rgba(45, 212, 191, 0.35)',
    bgGlow: 'rgba(15, 118, 110, 0.18)',
  },

  // لمسة ذهبية فرعية (للعناوين الخاصة والتمويجات)
  gold: {
    DEFAULT: '#C9A84C',
    hover: '#A58230',
    glow: 'rgba(201, 168, 76, 0.2)',
  },

  // الأحمر للتنبيهات والأخطاء
  error: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
  },

  // الألوان الداكنة والأسطح (نفس صفحة الدخول)
  dark: {
    bg: '#070C12',           // خلفية الصفحة الداكنة
    card: '#0F172A',         // خلفية البطاقة الرئيسية
    surface: '#111C2A',      // أسطح القوائم واللوحات
    input: '#090F16',        // خلفية حقول الإدخال
    buttonDark: '#1E293B',   // الأزرار الثانوية (مثل Google واللغة)
    border: '#223147',       // حدود الحقول
    borderLight: '#1E293B',
  },

  // درجات النصوص
  text: {
    title: '#F8FAFC',
    heading: '#E2E8F0',
    body: '#CBD5E1',
    muted: '#94A3B8',
    placeholder: '#64748B',
  },

  // التدرجات الرسمية الخاصة باللوجو وخلفية الدخول
  gradients: {
    pageBackground: 'radial-gradient(circle at 50% 25%, rgba(15, 118, 110, 0.18) 0%, #070C12 70%)',
    logoGlow: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
  }
};

export const C = colors;
export const g = colors.gradients;
export default colors;

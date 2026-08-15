// src/theme/colors.js

export const colors = {
  // 1. الوصول المباشر (Direct Flattened Mapping للمكونات في UI.jsx)
  primary: '#D97706',          // البرتقالي الرئيسي
  primaryHover: '#B45309',     // الهوفر البرتقالي
  bg: '#070C12',               // خلفية التطبيق العامة
  card: '#0F172A',             // خلفية البطاقة والكروت
  surface: '#111C2A',          // أسطح القوائم واللوحات
  input: '#090F16',            // خلفية حقول الإدخال
  border: '#223147',           // حدود الحقول والبطاقات
  borderLight: '#1E293B',
  
  // النصوص والحالات
  text: '#F8FAFC',             // النص الرئيسي الناصع
  textSub: '#E2E8F0',          // النص الفرعي
  textMuted: '#94A3B8',        // النص المساعد
  textPlaceholder: '#64748B',  // الـ Placeholder
  danger: '#EF4444',           // الأحمر للتنبيهات والأخطاء
  success: '#10B981',          // الأخضر للعمليات الناجحة
  shadow: '0 10px 25px rgba(0, 0, 0, 0.5)',

  // 2. الهيكلية المتداخلة (Nested Object لتوافق Tailwind Config والمميزات المتقدمة)
  brandEmerald: {
    DEFAULT: '#10B981',
    teal: '#0F766E',
    light: '#34D399',
    border: 'rgba(45, 212, 191, 0.35)',
    bgGlow: 'rgba(15, 118, 110, 0.18)',
  },

  gold: {
    DEFAULT: '#C9A84C',
    hover: '#A58230',
    glow: 'rgba(201, 168, 76, 0.2)',
  },

  error: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
  },

  dark: {
    bg: '#070C12',
    card: '#0F172A',
    surface: '#111C2A',
    input: '#090F16',
    buttonDark: '#1E293B',
    border: '#223147',
    borderLight: '#1E293B',
  },

  // التدرجات
  gradients: {
    gold: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    emerald: 'linear-gradient(135deg, #0F766E 0%, #042F2E 100%)',
    pageBackground: 'radial-gradient(circle at 50% 25%, rgba(15, 118, 110, 0.18) 0%, #070C12 70%)',
    logoGlow: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
  }
};

export const C = colors;
export const g = colors.gradients;
export default colors;

// src/theme/colors.js

// 1. ألوان الهوية والتصميم الأساسية
const baseColors = {
  primary: '#D97706',
  primaryHover: '#B45309',
  
  card: '#1E293B',
  borderCard: '#334155',
  input: '#0F172A',
  
  text: '#F8FAFC',
  textSub: '#CBD5E1',
  textMuted: '#94A3B8',
  
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

// 2. الكائن الشامل للألوان
export const colors = {
  ...baseColors,

  // دعم الاستدعاء المتداخل C.dark
  dark: {
    main: '#0F172A',
    card: '#1E293B',
    border: '#334155',
    surface: '#090F16',
  },

  // دعم الاستدعاء المتداخل C.primary
  primary: {
    DEFAULT: '#D97706',
    hover: '#B45309',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    bgGlow: 'rgba(217, 119, 6, 0.15)',
  },

  // دعم الاستدعاء المتداخل C.text
  text: {
    title: '#F8FAFC',
    body: '#CBD5E1',
    muted: '#94A3B8',
  },

  // دعم الاستدعاء المتداخل C.error
  error: {
    DEFAULT: '#EF4444',
    bgGlow: 'rgba(239, 68, 68, 0.15)',
    light: '#FCA5A5',
  },

  // دعم الاستدعاء المتداخل C.brandEmerald
  brandEmerald: {
    DEFAULT: '#10B981',
    bgGlow: 'rgba(16, 185, 129, 0.15)',
  },

  // التدرجات الخلفية
  gradients: {
    pageBackground: 'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 70%, #090F16 100%)',
    goldButton: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
  }
};

// 3. التدرجات المباشرة (حل استيراد g)
export const g = colors.gradients;

// 4. تصدير الاختصار C ليتوافق مع Skeleton.jsx والمكونات المشابهة
export const C = colors;

// 5. التصدير الافتراضي
export default colors;

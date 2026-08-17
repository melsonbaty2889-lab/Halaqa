// src/theme/colors.js

// 1. ألوان الهوية والتصميم الأساسية (نفس الدرجات الحالية)
const baseColors = {
  // الهوية الذهبية / الكهرمانية
  primary: '#D97706',
  primaryHover: '#B45309',
  
  // الخلفيات والأسطح الداكنة
  card: '#1E293B',
  borderCard: '#334155',
  input: '#0F172A',
  
  // ألوان النصوص
  text: '#F8FAFC',
  textSub: '#CBD5E1',
  textMuted: '#94A3B8',
  
  // ألوان التنبيهات والحالات
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

// 2. التصدير المزدوج (يدعم الاستدعاء المباشر والمتداخل لمنع أي Crash)
export const colors = {
  ...baseColors,

  // 🔹 دعم الاستدعاء المتداخل C.dark (المستخدم في App.jsx وبقية المكونات)
  dark: {
    main: '#0F172A',
    card: '#1E293B',
    border: '#334155',
    surface: '#090F16',
  },

  // 🔹 دعم الاستدعاء المتداخل C.primary
  primary: {
    DEFAULT: '#D97706',
    hover: '#B45309',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    bgGlow: 'rgba(217, 119, 6, 0.15)',
  },

  // 🔹 دعم الاستدعاء المتداخل C.text
  text: {
    title: '#F8FAFC',
    body: '#CBD5E1',
    muted: '#94A3B8',
  },

  // 🔹 دعم الاستدعاء المتداخل C.error
  error: {
    DEFAULT: '#EF4444',
    bgGlow: 'rgba(239, 68, 68, 0.15)',
    light: '#FCA5A5',
  },

  // 🔹 دعم الاستدعاء المتداخل C.brandEmerald
  brandEmerald: {
    DEFAULT: '#10B981',
    bgGlow: 'rgba(16, 185, 129, 0.15)',
  },

  // 🔹 التدرجات الخلفية لصفحات التطبيق
  gradients: {
    pageBackground: 'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 70%, #090F16 100%)',
    goldButton: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
  }
};

export default colors;

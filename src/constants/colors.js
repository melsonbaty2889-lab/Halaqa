// src/constants/colors.js

export const colors = {
  // الألوان الأساسية والتأكيدية (Amber / Gold)
  primary: {
    DEFAULT: '#D97706',
    hover: '#B45309',
    light: '#F59E0B',
    focusRing: 'rgba(217, 119, 6, 0.2)',
    shadow: 'rgba(217, 119, 6, 0.25)',
  },

  // ألوان النجاح والأمان (Emerald / Green)
  success: {
    DEFAULT: '#10B981',
    light: '#34D399',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.25)',
  },

  // ألوان الأخطاء والتنبيهات (Red)
  error: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
  },

  // ألوان الخلفيات والمساحات الداكنة (Dark / Slate)
  dark: {
    pageBgStart: 'rgba(15, 118, 110, 0.18)',
    pageBgEnd: '#070C12',
    cardBg: '#0F172A',
    inputBg: '#090F16',
    buttonBg: '#1E293B',
  },

  // ألوان النصوص (Typography)
  text: {
    title: '#F8FAFC',
    heading: '#E2E8F0',
    body: '#CBD5E1',
    muted: '#94A3B8',
    placeholder: '#64748B',
    highlight: '#38BDF8',
  },

  // ألوان الحدود والتفاصيل (Borders & Dividers)
  border: {
    card: '#1E293B',
    input: '#223147',
    divider: '#334155',
    logoBorder: 'rgba(45, 212, 191, 0.35)',
  },

  // التدرجات اللونية الخاصة للشعار والرسوم البيانية (Gradients)
  gradients: {
    background: 'radial-gradient(circle at 50% 25%, rgba(15, 118, 110, 0.18) 0%, #070C12 70%)',
    logoRadial: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
    gold: {
      stop1: '#FEF08A',
      stop2: '#F59E0B',
      stop3: '#B45309',
    },
    emerald: {
      stop1: '#10B981',
      stop2: '#047857',
    }
  }
};

// 🔄 التوافق مع المكونات التي تستورد C و g
export const C = colors;
export const g = colors.gradients;
export default colors;

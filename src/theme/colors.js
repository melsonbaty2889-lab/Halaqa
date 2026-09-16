/**
 * نظام الألوان الموحد - Smart Halaqa Design System (v2.5)
 * يقرأ القيم ديناميكياً من CSS Variables لضمان عدم وجود أي تضارب.
 */

// دالة قراءة قيمة المتغير مباشرة من DOM (تستخدم في وقت التشغيل/Runtime)
export const getCssVar = (varName) => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return '';
};

export const colors = {
  dark: {
    bg: 'var(--bg-dark)',
    card: 'var(--surface-card)',
    surface: 'var(--surface-input)',
  },
  amber: {
    DEFAULT: 'var(--primary)',
    buttonStart: 'var(--primary-btn-start)',
    buttonEnd: 'var(--primary-btn-end)',
    glowFocus: 'var(--primary-glow)',
  },
  emerald: {
    DEFAULT: 'var(--emerald-text)',
    dark: 'var(--emerald-dark)',
    light: 'var(--emerald-light)',
    radialGlow: 'var(--emerald-radial-glow)',
    logoGlow: 'var(--emerald-logo-glow)',
  },
  text: {
    title: 'var(--text-main)',
    subtitle: 'var(--primary)',
    body: 'var(--text-sub)',
    muted: 'var(--text-muted)',
  },
  primary: {
    DEFAULT: 'var(--primary)',
    hover: 'var(--primary-hover)',
  },
  error: {
    DEFAULT: 'var(--error)',
  }
};

export const C = colors;
export default colors;

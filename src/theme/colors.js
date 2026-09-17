/**
 * Smart Halaqa Design System - Dynamic Theme Provider
 */

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
    input: 'var(--surface-input)',
    google: 'var(--surface-google)',
  },
  primary: {
    DEFAULT: 'var(--primary)',
    hover: 'var(--primary-hover)',
    glow: 'var(--primary-glow)',
    btnStart: 'var(--primary-btn-start)',
    btnEnd: 'var(--primary-btn-end)',
  },
  brandEmerald: {
    DEFAULT: 'var(--emerald-text)',
    bg: 'var(--emerald-bg)',
    border: 'var(--emerald-border)',
    dark: 'var(--emerald-dark)',
    light: 'var(--emerald-light)',
    glow: 'var(--emerald-radial-glow)',
  },
  appText: {
    main: 'var(--text-main)',
    sub: 'var(--text-sub)',
    muted: 'var(--text-muted)',
  },
  appBorder: {
    card: 'var(--border-card)',
    input: 'var(--border-input)',
    hover: 'var(--border-hover)',
  },
  error: 'var(--error)'
};

export const C = colors;
export default colors;

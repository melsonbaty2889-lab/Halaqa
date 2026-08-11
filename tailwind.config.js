/* tailwind.config.js */
import colors from './src/constants/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 1. ربط الألوان البرمجية المباشرة من ملف colors.js
        primary: colors.primary,
        brand: colors.brand,
        gold: colors.gold,
        error: colors.error,
        dark: colors.dark,
        text: colors.text,

        // 2. ربط المتغيرات الهيكلية لتوحيد الأسطح والحدود مع index.css
        'bg-dark': 'var(--bg-dark)',
        'surface-dark': 'var(--surface-dark)',
        'surface-card': 'var(--surface-card)',
        'surface-input': 'var(--surface-input)',
        'border-light': 'var(--border-light)',
        'border-input': 'var(--border-input)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 1px rgba(255, 255, 255, 0.05)',
        'primary-glow': 'var(--primary-glow, 0 0 15px rgba(217, 119, 6, 0.25))',
        'emerald-glow': '0 0 15px rgba(16, 185, 129, 0.2)',
        'main': 'var(--shadow-main)',
      },
      fontFamily: {
        // إضافة دعم عائلات الخطوط العربية والإنجليزية معاً
        cairo: ['Cairo', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['Cairo', 'Plus Jakarta Sans', 'Tajawal', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 1s linear infinite',
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

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
        // ربط الألوان بملف الثوابت مباشرة
        primary: colors.primary,
        brand: colors.brand,
        gold: colors.gold,
        error: colors.error,
        dark: colors.dark,
        text: colors.text,
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 1px rgba(255, 255, 255, 0.05)',
        'primary-glow': '0 0 15px rgba(217, 119, 6, 0.25)',
        'emerald-glow': '0 0 15px rgba(16, 185, 129, 0.2)',
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
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

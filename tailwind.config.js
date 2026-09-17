/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        sans: ['Cairo', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
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
        appError: 'var(--error)',
      },
      boxShadow: {
        'main': 'var(--shadow-main)',
      }
    },
  },
  plugins: [],
}

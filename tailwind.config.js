/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: 'var(--bg-dark)',
        bgDark: 'var(--bg-dark)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          glow: 'var(--primary-glow)',
        },
        brandEmerald: {
          DEFAULT: 'var(--emerald-text)',
          bg: 'var(--emerald-bg)',
          border: 'var(--emerald-border)',
        },
      },
      boxShadow: {
        'main': '0 20px 50px rgba(0, 0, 0, 0.6)',
        'btn': '0 4px 14px rgba(224, 122, 0, 0.3)',
      },
    },
  },
  plugins: [],
}

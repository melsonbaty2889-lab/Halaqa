/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        // 1. الخلفيات والأسطح
        dark: {
          bg: 'var(--bg-dark)',           // #070B11
          card: 'var(--surface-card)',     // rgba(15, 23, 42, 0.85)
          input: 'var(--surface-input)',   // #0A101D
          google: 'var(--surface-google)', // #162032
        },
        // 2. اللون الأساسي للتطبيق (Primary Amber/Orange)
        primary: {
          DEFAULT: 'var(--primary)',       // #E07A00
          hover: 'var(--primary-hover)',   // #C66B00
          glow: 'var(--primary-glow)',     // rgba(224, 122, 0, 0.35)
        },
        // 3. الهوية الزمردية (للنجاح والإنجاز والشارات)
        brandEmerald: {
          DEFAULT: 'var(--emerald-text)',  // #10B981
          bg: 'var(--emerald-bg)',        // #09332C
          border: 'var(--emerald-border)',// #0D5C4D
          glow: 'var(--emerald-radial-glow)',
        },
        // 4. ألوان النصوص الموحدة
        appText: {
          main: 'var(--text-main)',       // #FFFFFF
          sub: 'var(--text-sub)',         // #94A3B8
          muted: 'var(--text-muted)',     // #475569
        },
        // 5. ألوان الحدود الموحدة
        appBorder: {
          card: 'var(--border-card)',     // rgba(255, 255, 255, 0.08)
          input: 'var(--border-input)',   // #1B2738
          hover: 'var(--border-hover)',   // #2E3E56
        },
      },
    },
  },
  plugins: [],
}

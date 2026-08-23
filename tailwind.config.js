// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'var(--bg-dark)',           // #070B11
          card: 'var(--surface-card)',     // rgba(15, 23, 42, 0.85)
          input: 'var(--surface-input)',   // #0A101D
        },
        primary: {
          DEFAULT: 'var(--primary)',       // #E07A00 / #D97706
          hover: 'var(--primary-hover)',   // #C66B00
          glow: 'var(--primary-glow)',
        },
        brandEmerald: {
          DEFAULT: 'var(--emerald-text)',  // #10B981
          bg: 'var(--emerald-bg)',        // #09332C
          border: 'var(--emerald-border)',// #0D5C4D
        },
      },
    },
  },
  plugins: [],
}

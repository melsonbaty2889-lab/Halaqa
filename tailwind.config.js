/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#070B11',
        primary: {
          DEFAULT: '#E07A00',
          hover: '#C66B00',
          glow: 'rgba(224, 122, 0, 0.35)',
        },
        brandEmerald: {
          DEFAULT: '#10B981',
          bg: '#09332C',
          border: '#0D5C4D',
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

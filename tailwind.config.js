/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: '#1a237e',
        brandGreen: '#00c853',
        brandOrange: '#E87722',
      }
    },
  },
  plugins: [],
}

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
        // ربط ألوان الهوية الذهبية في Tailwind
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dark: '#A88B3A',
        },
        // ألوان الهوية التشغيلية
        brand: {
          blue: '#1A237E',
          blueHover: '#121858',
          green: '#00C853',
          greenHover: '#00A444',
          orange: '#E87722',
          orangeHover: '#C65F17',
        },
        // توحيد خلفيات السطح واللوحة مع colors.js
        panel: {
          bg: '#0C1520',          // نفس C.bg
          surface: '#111C2A',     // نفس C.surface
          card: '#162030',        // نفس C.card
          cardHover: '#1B283D',
          border: 'rgba(201, 168, 76, 0.15)',
          
          textMain: '#E4DAC8',    // نفس C.text
          textSub: '#94A3B8',     // نفس C.textSub
          textMuted: '#64748B',
        },
        // ألوان الحالات
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 1px rgba(255, 255, 255, 0.05)',
        'gold-glow': '0 0 15px rgba(201, 168, 76, 0.2)',
        'green-glow': '0 0 15px rgba(16, 185, 129, 0.2)',
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

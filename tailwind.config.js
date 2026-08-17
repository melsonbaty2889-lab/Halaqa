/** @type {import('tailwindcss').Config} */
import colors from './src/theme/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        'primary-hover': colors.primaryHover,
        gold: colors.gold,
        'gold-light': colors.goldLight,
        'gold-dark': colors.goldDark,
        bg: colors.bg,
        card: colors.card,
        input: colors.input,
        border: colors.border,
        'border-card': colors.borderCard,
        'border-google': colors.borderGoogle,
        'text-main': colors.text,
        'text-sub': colors.textSub,
        'text-muted': colors.textMuted,
        'text-placeholder': colors.textPlaceholder,
        danger: colors.danger,
        emerald: colors.brandEmerald,
      },
      backgroundImage: {
        'page-radial': colors.gradients.pageBackground,
        'splash-radial': colors.gradients.splashBackground,
        'logo-radial': colors.gradients.logoBg,
      }
    },
  },
  plugins: [],
}

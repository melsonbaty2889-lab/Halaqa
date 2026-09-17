// src/theme/styles.js
export const UI = {
  card: "card-surface transition-all duration-200",
  cardActive: "card-surface border-primary ring-2 ring-primary/20 transition-all duration-200",
  btnPrimary: "btn-primary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
  // ✅ تصحيح المسارات للـ Tailwind Config
  btnSecondary: "bg-dark-card border border-appBorder-card text-appText-main hover:border-appBorder-hover font-semibold text-sm py-2.5 px-4 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-appBorder-hover",
  input: "app-input focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  logoWrapper: "relative flex items-center justify-center p-3 rounded-2xl bg-brandEmerald-bg/30 border border-brandEmerald-border/50 backdrop-blur-md shadow-[0_0_20px_var(--emerald-radial-glow)]",
  link: "text-primary hover:text-primary-hover font-semibold underline-offset-4 hover:underline transition-colors duration-200 cursor-pointer",
  title: "text-appText-main font-extrabold text-xl md:text-2xl tracking-tight",
  subtitle: "text-appText-sub text-sm font-medium",
  errorText: "text-appError text-xs font-semibold mt-1 animate-fade-in"
};

export default UI;

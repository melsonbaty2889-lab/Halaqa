// src/theme/styles.js
export const UI = {
  card: "card-surface transition-all duration-200",
  cardActive: "card-surface border-semantic-actionPrimary ring-2 ring-semantic-actionPrimary/20 transition-all duration-200",
  btnPrimary: "btn-primary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-actionPrimary/50",
  btnSecondary: "btn-secondary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-borderHover",
  input: "app-input focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  // التعديل هنا: استخدام --emerald-logo-glow لضمان التطابق التام
  logoWrapper: "relative flex items-center justify-center p-3 rounded-2xl bg-brandEmerald-bg/30 border border-brandEmerald-border/50 backdrop-blur-md shadow-[0_0_20px_var(--emerald-logo-glow)]",
  link: "text-semantic-actionPrimary hover:text-semantic-actionPrimaryHover font-semibold underline-offset-4 hover:underline transition-colors duration-200 cursor-pointer",
  title: "text-semantic-textPrimary font-extrabold text-xl md:text-2xl tracking-tight",
  subtitle: "text-semantic-textSecondary text-sm font-medium",
  errorText: "text-semantic-danger text-xs font-semibold mt-1 animate-fade-in"
};

export default UI;

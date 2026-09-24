// src/theme/styles.js
export const UI = {
  // البطاقات والقوائم المنسدلة
  card: "card-surface transition-all duration-200",
  dropdown: "dropdown-surface transition-all duration-200 text-start",
  cardActive: "card-surface border-semantic-actionPrimary ring-2 ring-semantic-actionPrimary/20 transition-all duration-200",
  cardGlass: "card-glass transition-all duration-200",
  
  // الأزرار
  btnPrimary: "btn-primary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-actionPrimary/50",
  btnSecondary: "btn-secondary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-borderHover",
  
  // زر زمردي موحد للإجراءات الإيجابية (تأكيد / حفظ / تسميع)
  btnEmerald: "w-full bg-semantic-successBg text-semantic-success border border-semantic-successBorder/60 hover:bg-semantic-success/20 font-bold text-sm py-2.5 px-4 rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_var(--emerald-radial-glow)]",
  
  // الحقول والمدخلات
  input: "app-input focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-start",
  
  // غلاف الشعار والتأثيرات
  logoWrapper: "relative flex items-center justify-center p-3 rounded-2xl bg-semantic-successBg/30 border border-semantic-successBorder/50 backdrop-blur-md shadow-[0_0_20px_var(--emerald-logo-glow)]",
  
  // النصوص والعناوين
  link: "text-semantic-actionPrimary hover:text-semantic-actionPrimaryHover font-semibold underline-offset-4 hover:underline transition-colors duration-200 cursor-pointer",
  title: "text-semantic-textPrimary font-extrabold text-xl md:text-2xl tracking-tight text-start",
  subtitle: "text-semantic-textSecondary text-sm font-medium text-start",
  errorText: "text-semantic-danger text-xs font-semibold mt-1 animate-fade-in text-start"
};

export default UI;

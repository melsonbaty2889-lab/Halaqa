// src/theme/styles.js

/**
 * Smart Halaqa Design System - UI Class Aggregator
 * مجمّع كلاسات الواجهة لتسهيل الاستدعاء وتقليل تكرار الأكواد في عناصر React
 */
export const UI = {
  // 📦 1. تصميم البطاقات والأسطح
  card: "card-surface transition-all duration-200",
  cardActive: "card-surface border-primary ring-2 ring-primary/20 transition-all duration-200",
  
  // 🔘 2. الأزرار (مع دعم حالات Disabled و Focus)
  btnPrimary: "btn-primary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
  btnSecondary: "bg-dark-card border border-appBorder-card text-appText-main hover:border-appBorder-hover font-semibold text-sm py-2.5 px-4 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-appBorder-hover",
  
  // ✏️ 3. حقول الإدخال
  input: "app-input focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",

  // 📖 4. غلاف الشعار والأيقونات
  logoWrapper: "relative flex items-center justify-center p-3 rounded-2xl bg-emerald-bg/30 border border-emerald-border/50 backdrop-blur-md shadow-[0_0_20px_var(--emerald-radial-glow)]",
  
  // 🔗 5. الروابط والنصوص
  link: "text-primary hover:text-primary-hover font-semibold underline-offset-4 hover:underline transition-colors duration-200 cursor-pointer",
  title: "text-appText-main font-extrabold text-xl md:text-2xl tracking-tight",
  subtitle: "text-appText-sub text-sm font-medium",
  errorText: "text-appError text-xs font-semibold mt-1 animate-fade-in"
};

export default UI;

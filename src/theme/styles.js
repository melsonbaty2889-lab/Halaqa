// src/theme/styles.js
import { colors } from './colors';

export const UI = {
  // 📦 1. تصميم البطاقات (Glassmorphism Cards)
  card: "card-surface transition-all duration-200",
  cardActive: "card-surface border-primary ring-2 ring-primary/20 transition-all duration-200",
  
  // 🔘 2. الأزرار (Primary Gradient & Secondary)
  btnPrimary: "btn-primary transition-all active:scale-[0.99]",
  btnSecondary: "btn-secondary transition-all active:scale-[0.99]",
  
  // ✏️ 3. حقول الإدخال
  input: "app-input focus:outline-none transition-all duration-200",

  // 📖 4. غلاف الشعار الأعلى
  logoWrapper: "logo-icon-wrapper",
  
  // 🔗 5. الروابط الملونة
  link: "link-primary",
};

export default UI;

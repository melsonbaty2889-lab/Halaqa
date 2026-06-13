export const C = {
  // 1. الألوان الأساسية (Backgrounds)
  bg: "#0C1520",        // خلفية الصفحة الرئيسية
  surface: "#111C2A",    // خلفية القوائم والـ Sidebar
  card: "#162030",       // خلفية البطاقات (تدرج عمق)
  
  // 2. نظام ألوان الهوية (Gold Brand)
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldDark: "#A88B3A",
  
  // 3. الألوان النصية (Typography)
  text: "#E4DAC8",       // اللون الأساسي للنص
  textMuted: "#94a3b8",  // للنصوص الثانوية (أكثر وضوحاً من السابق)
  
  // 4. ألوان الحالة (Semantic Colors)
  success: "#10b981",    // للأخضر الإيجابي
  danger: "#ef4444",     // للأحمر التحذيري
  warning: "#f59e0b",    // للأصفر التنبيهي
  info: "#3b82f6",       // للأزرق الإجرائي
  
  // 5. الأطر والحدود
  border: "rgba(201, 168, 76, 0.15)",
  shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
};

export const g = {
  gold: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
  surface: `linear-gradient(180deg, ${C.surface}, ${C.card})`,
  danger: `linear-gradient(135deg, ${C.danger}, #b91c1c)`
};

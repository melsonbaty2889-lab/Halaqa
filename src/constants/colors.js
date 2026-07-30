export const C = {
  // 1. الألوان الأساسية وخلفيات السطح (Backgrounds & Surface)
  bg: "#0C1520",        // خلفية الصفحة الرئيسية الداكنة
  surface: "#111C2A",    // خلفية القوائم والـ Sidebar
  card: "#162030",       // خلفية البطاقات الكروت
  cardHover: "#1B283D",  // عند مرور الماوس على البطاقات
  
  // 2. نظام ألوان الهوية الذهبية (Gold Brand)
  gold: "#C9A84C",       // الذهبي الأساسي
  goldLight: "#E8C97A",  // الذهبي الفاتح للـ Hover
  goldDark: "#A88B3A",   // الذهبي الداكن
  
  // 3. ألوان الأزرار والعمليات (Brand Actions)
  blue: "#1A237E",
  blueHover: "#121858",
  green: "#00C853",
  greenHover: "#00A444",
  orange: "#E87722",
  orangeHover: "#C65F17",

  // 4. الألوان النصية الموحدة (Typography)
  text: "#E4DAC8",       // النص الأساسي العاجي المريح للعين
  textSub: "#94A3B8",    // النصوص الثانوية والتواريخ
  textMuted: "#64748B",  // التلميحات الداخلية (Placeholder)
  
  // 5. ألوان الحالة القياسية (Semantic Status)
  success: "#10B981",    // حاضر / مدفوع / ممتاز
  danger: "#EF4444",     // غائب / ملغي / ضعيف
  warning: "#F59E0B",    // متأخر / معلق / مقبول
  info: "#3B82F6",       // مستند جديد / إشعار
  
  // 6. الأطر والحدود والظلال
  border: "rgba(201, 168, 76, 0.15)", // حدود ذهبية شفاف أنيقة
  borderHover: "rgba(201, 168, 76, 0.35)",
  shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
};

// التدرجات اللونية الفاخرة (Gradients)
export const g = {
  gold: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
  surface: `linear-gradient(180deg, ${C.surface}, ${C.card})`,
  danger: `linear-gradient(135deg, ${C.danger}, #B91C1C)`,
  blue: `linear-gradient(135deg, ${C.blue}, #0D47A1)`,
};

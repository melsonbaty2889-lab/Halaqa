// src/config/menuBlueprint.js

export const MASTER_MENU = [
  {
    id: "ops_center",
    categoryKey: "1. مركز القيادة والعمليات",
    items: [
      { id: "dashboard", labelKey: "لوحة التحكم والأداء", icon: "BarChart", roles: ["admin", "teacher", "student"] },
      { id: "live_activity", labelKey: "السجل الحي للأنشطة", icon: "History", roles: ["admin"] },
      { id: "communication", labelKey: "مركز التواصل والمراسلات", icon: "Send", roles: ["admin", "teacher"] },
      { id: "analytics", labelKey: "التقارير والتحليلات", icon: "BarChart3", roles: ["admin", "teacher"] }
    ]
  },
  {
    id: "quran_affairs",
    categoryKey: "2. الشؤون القرآنية والأكاديمية",
    items: [
      { id: "students", labelKey: "إدارة الدارسين", icon: "GraduationCap", roles: ["admin", "teacher"] },
      { id: "staff", labelKey: "الكادر والمقرئين", icon: "Users", roles: ["admin"] },
      { id: "halaqas", labelKey: "المقارئ والحلقات", icon: "BookOpen", roles: ["admin", "teacher"] },
      { id: "daily_recitation", labelKey: "التسميع والتحضير اليومي", icon: "CheckCircle2", roles: ["admin", "teacher", "student"] },
      { id: "exams", labelKey: "الاختبارات والتقييم", icon: "Award", roles: ["admin", "teacher", "student"] }
    ]
  },
  {
    id: "engagement",
    categoryKey: "3. تفاعل الدارسين والأسر",
    items: [
      { id: "families", labelKey: "شبكة أسر الدارسين", icon: "Home", roles: ["admin", "teacher"] },
      { id: "rewards", labelKey: "الإنجاز والحوافز", icon: "Trophy", roles: ["admin", "teacher", "student"] }
    ]
  },
  {
    id: "governance_finance",
    categoryKey: "4. الحوكمة والمالية",
    items: [
      { id: "subscriptions", labelKey: "الاشتراكات والترقية", icon: "Zap", roles: ["admin"] },
      { id: "payments", labelKey: "التحصيل والمعاملات", icon: "CreditCard", roles: ["admin"] },
      { id: "assets", labelKey: "المستندات والأصول", icon: "Folder", roles: ["admin"] },
      { id: "referrals", labelKey: "برنامج الإحالة والأرباح", icon: "TrendingUp", roles: ["admin"] },
      { id: "settings", labelKey: "إعدادات المنظومة", icon: "Sliders", roles: ["admin"] }
    ]
  }
];

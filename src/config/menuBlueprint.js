// src/config/menuBlueprint.js

export const MASTER_MENU = [
  {
    categoryKey: "nav.categories.main", // لوحة التحكم الأساسية
    items: [
      {
        id: "dashboard",
        labelKey: "nav.dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
        roles: ["admin", "academy_owner", "teacher", "student"],
      },
    ],
  },
  {
    categoryKey: "nav.categories.education", // الشؤون التعليمية
    items: [
      {
        id: "halaqas",
        labelKey: "nav.halaqas",
        path: "/halaqas",
        icon: "BookOpen",
        roles: ["admin", "academy_owner", "teacher"],
      },
      {
        id: "students",
        labelKey: "nav.students",
        path: "/students",
        icon: "Users",
        roles: ["admin", "academy_owner", "teacher"],
      },
      {
        id: "teachers",
        labelKey: "nav.teachers",
        path: "/teachers",
        icon: "GraduationCap",
        roles: ["admin", "academy_owner"],
      },
      {
        id: "quran-progress",
        labelKey: "nav.quranProgress",
        path: "/quran-progress",
        icon: "BookmarkCheck",
        roles: ["admin", "teacher", "student"],
      },
      {
        id: "exams",
        labelKey: "nav.exams",
        path: "/exams",
        icon: "FileCheck",
        roles: ["admin", "teacher", "student"],
      },
    ],
  },
  {
    categoryKey: "nav.categories.performance", // التقييم والتحفيز
    items: [
      {
        id: "reports",
        labelKey: "nav.reports",
        path: "/reports",
        icon: "BarChart3",
        roles: ["admin", "academy_owner", "teacher"],
      },
      {
        id: "gamification",
        labelKey: "nav.gamification",
        path: "/gamification",
        icon: "Trophy",
        roles: ["admin", "teacher", "student"],
      },
      {
        id: "certificates",
        labelKey: "nav.certificates",
        path: "/certificates",
        icon: "Award",
        roles: ["admin", "academy_owner", "teacher", "student"],
      },
    ],
  },
  {
    categoryKey: "nav.categories.management", // الإدارة والمالية
    items: [
      {
        id: "payments",
        labelKey: "nav.payments",
        path: "/payments",
        icon: "CreditCard",
        roles: ["admin", "academy_owner"],
      },
      {
        id: "settings",
        labelKey: "nav.settings",
        path: "/settings",
        icon: "Settings",
        roles: ["admin", "academy_owner"],
      },
    ],
  },
];

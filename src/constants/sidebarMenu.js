// src/constants/sidebarMenu.js
import { 
  BarChart3, 
  GraduationCap, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  CreditCard, 
  SlidersHorizontal, 
  Send, 
  BookMarked,
  Library
} from "lucide-react";

/**
 * القائمة الجانبية العالمية الموحدة والنهائية (Global Quranic SaaS Sidebar)
 * هيكل مقتضب ومحترف (10 عناصر رئيسية) يغطي كافة جداول قاعدة البيانات (48 جدولاً ومشهداً)
 * 
 * @param {boolean} isRtl - اتجاه الواجهة (عربي / إنجليزي)
 * @param {string} userRole - دور المستخدم الحالي ('admin', 'teacher', 'student')
 */
export const getMenuSections = (isRtl, userRole = 'admin') => {
  const sections = [
    {
      id: 'main-ops',
      title: isRtl ? 'الرئيسية والعمليات' : 'Operations Hub',
      items: [
        { 
          id: 'dashboard', 
          label: isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Analytics', 
          icon: BarChart3, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'attendance', 
          label: isRtl ? 'متابعة الحفظ والحضور' : 'Recitation & Attendance', 
          icon: CheckCircle2, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'interactive_quran', 
          label: isRtl ? 'المصحف والتسميع الذكي' : 'Interactive Quran & AI', 
          icon: BookMarked, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'reports', 
          label: isRtl ? 'التواصل والتقارير' : 'Communication & Reports', 
          icon: Send, 
          roles: ['admin', 'teacher'] 
        }
      ]
    },
    {
      id: 'academic-hub',
      title: isRtl ? 'الشؤون الأكاديمية والقراءات' : 'Academic & Curricula Hub',
      items: [
        { 
          id: 'halaqas', 
          label: isRtl ? 'الحلقات والمقارئ' : 'Quran Classes & Circles', 
          icon: BookOpen, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'directory', 
          label: isRtl ? 'دليل المقرأة والمستخدمين' : 'Academy Directory', 
          icon: GraduationCap, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'curricula', 
          label: isRtl ? 'المناهج والمكتبة القرآنية' : 'Curricula, Sanad & Library', 
          icon: Library, 
          roles: ['admin', 'teacher', 'student'] 
        }
      ]
    },
    {
      id: 'eval-finance',
      title: isRtl ? 'التحفيز والمالية والإدارة' : 'Rewards, Finance & Governance',
      items: [
        { 
          id: 'evaluations', 
          label: isRtl ? 'الاختبارات والتحفيز' : 'Exams & Badges', 
          icon: Award, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'finance', 
          label: isRtl ? 'المركز المالي والاشتراكات' : 'Finance & Subscriptions', 
          icon: CreditCard, 
          roles: ['admin'] 
        },
        { 
          id: 'settings', 
          label: isRtl ? 'إعدادات المنظومة' : 'Platform Settings', 
          icon: SlidersHorizontal, 
          roles: ['admin'] 
        }
      ]
    }
  ];

  // تصفية العناصر بحسب دور المستخدم وإخفاء الأقسام الفارغة
  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.roles || item.roles.includes(userRole))
    }))
    .filter(section => section.items.length > 0);
};

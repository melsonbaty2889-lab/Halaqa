// src/constants/sidebarMenu.js
import { 
  BarChart3, 
  GraduationCap, 
  Presentation, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  CreditCard, 
  SlidersHorizontal, 
  Trophy, 
  BookMarked, 
  Send 
} from "lucide-react";

/**
 * توليد أقسام القائمة الجانبية المخصصة بحسب لغة الواجهة ودور المستخدم (Role-based Menu)
 * @param {boolean} isRtl - اتجاه النص (عربي / إنجليزي)
 * @param {string} userRole - دور المستخدم الحالي ('admin', 'teacher', 'student')
 */
export const getMenuSections = (isRtl, userRole = 'admin') => {
  const sections = [
    {
      id: 'main-ops',
      title: isRtl ? 'الرئيسية والعمليات' : 'Main Operations',
      items: [
        { 
          id: 'dashboard', 
          label: isRtl ? 'لوحة التحكم' : 'Dashboard', 
          icon: BarChart3, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'attendance', 
          label: isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation Log', 
          icon: CheckCircle2, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'reports', 
          label: isRtl ? 'التواصل والتقارير' : 'Communication & Reports', 
          icon: Send, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'interactive_quran', 
          label: isRtl ? 'المصحف والتسميع الذكي' : 'Interactive Quran & AI', 
          icon: BookMarked, 
          roles: ['admin', 'teacher', 'student'] 
        }
      ]
    },
    {
      id: 'academic-hub',
      title: isRtl ? 'الشؤون الأكاديمية' : 'Academic Hub',
      items: [
        { 
          id: 'halaqas', 
          label: isRtl ? 'الحلقات والكتاتيب' : 'Halaqas & Katateeb', 
          icon: BookOpen, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'students', 
          label: isRtl ? 'دليل الطلاب والأسر' : 'Students & Guardians', 
          icon: GraduationCap, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'teachers', 
          label: isRtl ? 'الكادر والمعلمون' : 'Faculty & Staff', 
          icon: Presentation, 
          roles: ['admin'] 
        }
      ]
    },
    {
      id: 'eval-gamification',
      title: isRtl ? 'التقييم والتحفيز' : 'Evaluation & Rewards',
      items: [
        { 
          id: 'exams', 
          label: isRtl ? 'الاختبارات والشهادات' : 'Exams & Certificates', 
          icon: Award, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'gamification-streaks', 
          label: isRtl ? 'سلسلة الإنجاز والأوسمة' : 'Streaks & Badges', 
          icon: Trophy, 
          roles: ['admin', 'teacher', 'student'] 
        }
      ]
    },
    {
      id: 'admin-finance',
      title: isRtl ? 'الإدارة والمالية' : 'Finance & Governance',
      items: [
        { 
          id: 'payments', 
          label: isRtl ? 'المالية والكفالات' : 'Finance & Sponsorships', 
          icon: CreditCard, 
          roles: ['admin'] 
        },
        { 
          id: 'settings', 
          label: isRtl ? 'إعدادات المنظومة' : 'Academy Settings', 
          icon: SlidersHorizontal, 
          roles: ['admin'] 
        }
      ]
    }
  ];

  // تصفية الأقسام والعناصر بناءً على صلاحيات المستخدم المحددة
  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.roles || item.roles.includes(userRole))
    }))
    .filter(section => section.items.length > 0);
};

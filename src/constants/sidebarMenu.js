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
  Zap, 
  History, 
  Send, 
  Trophy, 
  FolderOpen, 
  Share2, 
  BookMarked,
  Library
} from "lucide-react";

/**
 * القائمة الجانبية العالمية الموحدة (Global Quranic SaaS Menu)
 * مصطلحات واضحة يفهمها أي مستخدم عربي أو أجنبي بغض النظر عن دولته أو ثقافته
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
          label: isRtl ? 'متابعة الحفظ والحضور' : 'Recitation & Attendance Log', 
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
        },
        { 
          id: 'audit_logs', 
          label: isRtl ? 'سجل النشاطات' : 'Activity Log', 
          icon: History, 
          roles: ['admin'] 
        }
      ]
    },
    {
      id: 'academic-hub',
      title: isRtl ? 'الشؤون الأكاديمية' : 'Academic Hub',
      items: [
        { 
          id: 'halaqas', 
          label: isRtl ? 'الحلقات والمقارئ' : 'Quran Classes & Circles', 
          icon: BookOpen, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'students', 
          label: isRtl ? 'الطلاب وأولياء الأمور' : 'Students & Guardians', 
          icon: GraduationCap, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'teachers', 
          label: isRtl ? 'المعلمون والمقرئون' : 'Teachers & Reciters', 
          icon: Presentation, 
          roles: ['admin'] 
        },
        { 
          id: 'curricula', 
          label: isRtl ? 'المناهج والقراءات' : 'Curricula & Qiraat', 
          icon: Library, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'files', 
          label: isRtl ? 'المكتبة والمصادر' : 'Library & Resources', 
          icon: FolderOpen, 
          roles: ['admin', 'teacher', 'student'] 
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
          label: isRtl ? 'لوحة التحفيز والأوسمة' : 'Rewards & Badges', 
          icon: Trophy, 
          roles: ['admin', 'teacher', 'student'] 
        }
      ]
    },
    {
      id: 'admin-finance',
      title: isRtl ? 'الإدارة والمالية' : 'Finance & Settings',
      items: [
        { 
          id: 'payments', 
          label: isRtl ? 'الاشتراكات والرسوم' : 'Fees & Subscriptions', 
          icon: CreditCard, 
          roles: ['admin'] 
        },
        { 
          id: 'subscriptions', 
          label: isRtl ? 'باقة الأكاديمية والترقية' : 'Plan & Upgrades', 
          icon: Zap, 
          roles: ['admin'] 
        },
        { 
          id: 'referrals', 
          label: isRtl ? 'برنامج التوصية والدعوات' : 'Referral Program', 
          icon: Share2, 
          roles: ['admin', 'teacher'] 
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

  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.roles || item.roles.includes(userRole))
    }))
    .filter(section => section.items.length > 0);
};

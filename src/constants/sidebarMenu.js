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
  Library,
  HeartHandshake,
  Users,
  Flame,
  ShieldCheck,
  FolderOpen
} from "lucide-react";

export const getMenuSections = (t, userRole = 'admin') => {
  // 🟢 دالة حماية تضمن عدم انهيار التطبيق إذا كانت t ليست دالة
  const safeT = typeof t === 'function' ? t : (key, fallback) => fallback || key;

  const sections = [
    {
      id: 'main-operations',
      title: safeT('menu.sections.main_operations', 'الرئيسية والعمليات'),
      items: [
        { 
          id: 'dashboard', 
          label: safeT('menu.items.dashboard', 'لوحة التحكم'), 
          icon: BarChart3, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'attendance', 
          label: safeT('menu.items.attendance', 'التسميع والحضور'), 
          icon: CheckCircle2, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'interactive_quran', 
          label: safeT('menu.items.interactive_quran', 'المصحف والتسميع الذكي'), 
          icon: BookMarked, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'notifications_reports', 
          label: safeT('menu.items.notifications_reports', 'الإشعارات والتقارير'), 
          icon: Send, 
          roles: ['admin', 'teacher', 'parent'] 
        }
      ]
    },
    {
      id: 'halaqas-people',
      title: safeT('menu.sections.halaqas_people', 'الحلقات والأفراد'),
      items: [
        { 
          id: 'halaqas', 
          label: safeT('menu.items.halaqas', 'الحلقات والفصول'), 
          icon: BookOpen, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'students', 
          label: safeT('menu.items.students', 'إدارة الطلاب'), 
          icon: GraduationCap, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'parents', 
          label: safeT('menu.items.parents', 'أولياء الأمور'), 
          icon: HeartHandshake, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'teachers', 
          label: safeT('menu.items.teachers', 'الكادر التعليمي والإداري'), 
          icon: Users, 
          roles: ['admin'] 
        }
      ]
    },
    {
      id: 'curriculum-progress',
      title: safeT('menu.sections.curriculum_progress', 'المناهج والتقييم'),
      items: [
        { 
          id: 'curricula', 
          label: safeT('menu.items.curricula', 'المناهج والعلوم الشرعية'), 
          icon: Library, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'exams', 
          label: safeT('menu.items.exams', 'الاختبارات والشهادات'), 
          icon: Award, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'gamification', 
          label: safeT('menu.items.gamification', 'التحفيز والأوسمة'), 
          icon: Flame, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'documents', 
          label: safeT('menu.items.documents', 'المستندات والملفات'), 
          icon: FolderOpen, 
          roles: ['admin', 'teacher'] 
        }
      ]
    },
    {
      id: 'management-finance',
      title: safeT('menu.sections.management_finance', 'الإدارة والمالية'),
      items: [
        { 
          id: 'finance', 
          label: safeT('menu.items.finance', 'الاشتراكات والمالية'), 
          icon: CreditCard, 
          roles: ['admin', 'parent'] 
        },
        { 
          id: 'audit_logs', 
          label: safeT('menu.items.audit_logs', 'سجل العمليات الأمني'), 
          icon: ShieldCheck, 
          roles: ['admin', 'super_admin'] 
        },
        { 
          id: 'settings', 
          label: safeT('menu.items.settings', 'إعدادات المنظومة'), 
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

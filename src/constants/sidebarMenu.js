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
 * القائمة الجانبية العالمية الموحدة (SaaS Enterprise Model)
 * @param {Function} t - دالة الترجمة من i18next
 * @param {string} userRole - دور المستخدم الحالي ('admin', 'teacher', 'student')
 */
export const getMenuSections = (t, userRole = 'admin') => {
  const sections = [
    {
      id: 'main-ops',
      title: t('sidebar.sections.operations', 'الرئيسية والعمليات'),
      items: [
        { 
          id: 'dashboard', 
          label: t('sidebar.items.dashboard', 'لوحة التحكم والأداء'), 
          icon: BarChart3, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'attendance', 
          label: t('sidebar.items.attendance', 'متابعة الحفظ والحضور'), 
          icon: CheckCircle2, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'interactive_quran', 
          label: t('sidebar.items.interactiveQuran', 'المصحف والتسميع الذكي'), 
          icon: BookMarked, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'reports', 
          label: t('sidebar.items.reports', 'التواصل والتقارير'), 
          icon: Send, 
          roles: ['admin', 'teacher'] 
        }
      ]
    },
    {
      id: 'academic-hub',
      title: t('sidebar.sections.academic', 'الشؤون الأكاديمية والقراءات'),
      items: [
        { 
          id: 'halaqas', 
          label: t('sidebar.items.halaqas', 'الحلقات والمقارئ'), 
          icon: BookOpen, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'directory', 
          label: t('sidebar.items.directory', 'دليل المقرأة والمستخدمين'), 
          icon: GraduationCap, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'curricula', 
          label: t('sidebar.items.curricula', 'المناهج والمكتبة القرآنية'), 
          icon: Library, 
          roles: ['admin', 'teacher', 'student'] 
        }
      ]
    },
    {
      id: 'eval-finance',
      title: t('sidebar.sections.governance', 'التحفيز والمالية والإدارة'),
      items: [
        { 
          id: 'evaluations', 
          label: t('sidebar.items.evaluations', 'الاختبارات والتحفيز'), 
          icon: Award, 
          roles: ['admin', 'teacher', 'student'] 
        },
        { 
          id: 'finance', 
          label: t('sidebar.items.finance', 'المركز المالي والاشتراكات'), 
          icon: CreditCard, 
          roles: ['admin'] 
        },
        { 
          id: 'settings', 
          label: t('sidebar.items.settings', 'إعدادات المنظومة'), 
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

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

export const getMenuSections = (isRtl, userRole = 'admin') => {
  const sections = [
    {
      id: 'main-ops',
      title: isRtl ? 'الرئيسية والعمليات' : 'Main & Operations',
      items: [
        { 
          id: 'dashboard', 
          label: isRtl ? 'لوحة التحكم' : 'Dashboard', 
          icon: BarChart3, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'attendance', 
          label: isRtl ? 'التسميع والحضور' : 'Attendance & Recitation', 
          icon: CheckCircle2, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'interactive_quran', 
          label: isRtl ? 'المصحف والتسميع الذكي' : 'Interactive Quran & AI', 
          icon: BookMarked, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'reports', 
          label: isRtl ? 'الرسائل والتقارير' : 'Messaging & Reports', 
          icon: Send, 
          roles: ['admin', 'teacher', 'parent'] 
        }
      ]
    },
    {
      id: 'people-halaqas',
      title: isRtl ? 'الحلقات والأفراد' : 'Halaqas & Directory',
      items: [
        { 
          id: 'halaqas', 
          label: isRtl ? 'الحلقات والفصول' : 'Classes & Circles', 
          icon: BookOpen, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'students', 
          label: isRtl ? 'إدارة الطلاب' : 'Students Directory', 
          icon: GraduationCap, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'parents', 
          label: isRtl ? 'أولياء الأمور' : 'Parents & Guardians', 
          icon: HeartHandshake, 
          roles: ['admin', 'teacher'] 
        },
        { 
          id: 'teachers', 
          label: isRtl ? 'الكادر التعليمي والإداري' : 'Teachers & Staff', 
          icon: Users, 
          roles: ['admin'] 
        }
      ]
    },
    {
      id: 'academic-evaluation',
      title: isRtl ? 'المناهج والتقييم' : 'Curricula & Progress',
      items: [
        { 
          id: 'curricula', 
          label: isRtl ? 'المناهج والعلوم الشرعية' : 'Curricula & Islamic Studies', 
          icon: Library, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'evaluations', 
          label: isRtl ? 'الاختبارات والشهادات' : 'Exams & Certificates', 
          icon: Award, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'gamification', 
          label: isRtl ? 'التحفيز والأوسمة' : 'Badges & Streaks', 
          icon: Flame, 
          roles: ['admin', 'teacher', 'student', 'parent'] 
        },
        { 
          id: 'documents', 
          label: isRtl ? 'المستندات والملفات' : 'Documents & Files', 
          icon: FolderOpen, 
          roles: ['admin', 'teacher'] 
        }
      ]
    },
    {
      id: 'eval-finance',
      title: isRtl ? 'الإدارة والمالية' : 'Management & Finance',
      items: [
        { 
          id: 'finance', 
          label: isRtl ? 'الاشتراكات والمالية' : 'Finance & Subscriptions', 
          icon: CreditCard, 
          roles: ['admin', 'parent'] 
        },
        { 
          id: 'audit_logs', 
          label: isRtl ? 'سجل العمليات الأمني' : 'Security Audit Logs', 
          icon: ShieldCheck, 
          roles: ['admin', 'super_admin'] 
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

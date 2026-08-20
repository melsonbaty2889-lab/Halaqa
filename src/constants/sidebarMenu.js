// src/constants/sidebarMenu.js
import { 
  BarChart3, GraduationCap, Presentation, CheckCircle2, 
  BookOpen, Award, CreditCard, SlidersHorizontal, Zap, 
  History, Send, Home, Trophy, Folder, TrendingUp, BookMarked
} from "lucide-react";

export const getMenuSections = (isRtl, userRole = 'admin') => {
  const sections = [
    {
      id: 'ops',
      title: isRtl ? '1. القيادة والعمليات' : '1. Leadership & Operations',
      items: [
        { id: 'dashboard', label: isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance', icon: BarChart3, roles: ['admin', 'teacher', 'student'] },
        { id: 'realtime-audit', label: isRtl ? 'السجل الحي للأنشطة' : 'Realtime Audit Trail', icon: History, roles: ['admin'] },
        { id: 'communication-hub', label: isRtl ? 'مركز التواصل والتقارير' : 'Communication & Reports', icon: Send, roles: ['admin', 'teacher'] },
        { id: 'reports', label: isRtl ? 'التحليلات والتقارير' : 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'teacher'] }
      ]
    },
    {
      id: 'academic',
      title: isRtl ? '2. إدارة الأكاديمية والمقاريء' : '2. Academic & Recitations',
      items: [
        { id: 'halaqas', label: isRtl ? 'المقارئ والتسميع اليومي' : 'Halaqas & Daily Recitation', icon: BookOpen, roles: ['admin', 'teacher'] },
        { id: 'attendance', label: isRtl ? 'التحضير والتسميع' : 'Attendance & Recitation', icon: CheckCircle2, roles: ['admin', 'teacher', 'student'] },
        { id: 'interactive_quran', label: isRtl ? 'المصحف التفاعلي والروايات' : 'Interactive Quran & Qiraat', icon: BookMarked, roles: ['admin', 'teacher', 'student'] },
        { id: 'students', label: isRtl ? 'إدارة الدارسين والأسر' : 'Students & Guardian Directory', icon: GraduationCap, roles: ['admin', 'teacher'] },
        { id: 'guardian-portal', label: isRtl ? 'شبكة أسر الدارسين' : 'Guardian Portal', icon: Home, roles: ['admin', 'teacher'] },
        { id: 'teachers', label: isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters', icon: Presentation, roles: ['admin'] },
        { id: 'exams', label: isRtl ? 'المناهج والاختبارات' : 'Curriculum & Exams', icon: Award, roles: ['admin', 'teacher', 'student'] },
        { id: 'gamification-streaks', label: isRtl ? 'الإنجاز والحوافز' : 'Gamification & Streaks', icon: Trophy, roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      id: 'governance',
      title: isRtl ? '3. المالية والإعدادات' : '3. Treasury & Governance',
      items: [
        { id: 'subscriptions', label: isRtl ? 'الاشتراكات والترقية' : 'Subscriptions & Upgrades', icon: Zap, roles: ['admin'] },
        { id: 'payments', label: isRtl ? 'التحصيل والمعاملات' : 'Billing & Payments', icon: CreditCard, roles: ['admin'] },
        { id: 'referrals', label: isRtl ? 'برنامج الإحالة والأرباح' : 'Affiliate & Rewards', icon: TrendingUp, roles: ['admin'] },
        { id: 'asset-management', label: isRtl ? 'المستندات والأصول' : 'Asset Management', icon: Folder, roles: ['admin'] },
        { id: 'settings', label: isRtl ? 'إعدادات المنظومة' : 'Platform Governance', icon: SlidersHorizontal, roles: ['admin'] }
      ]
    }
  ];

  // تصفية العناصر بناءً على دور المستخدم وإخفاء المجموعات الفارغة
  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.roles || item.roles.includes(userRole))
    }))
    .filter(section => section.items.length > 0);
};

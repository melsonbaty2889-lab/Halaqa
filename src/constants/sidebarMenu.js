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
      title: isRtl ? '1. مركز القيادة والعمليات' : '1. Operations Hub',
      items: [
        { id: 'dashboard', label: isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance', icon: BarChart3, roles: ['admin', 'teacher', 'student'] },
        { id: 'realtime-audit', label: isRtl ? 'السجل الحي للأنشطة' : 'Realtime Audit Trail', icon: History, roles: ['admin'] },
        { id: 'communication-hub', label: isRtl ? 'مركز التواصل والمراسلات' : 'Communication Hub', icon: Send, roles: ['admin', 'teacher'] },
        { id: 'reports', label: isRtl ? 'التقارير والتحليلات' : 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'teacher'] }
      ]
    },
    {
      id: 'academic',
      title: isRtl ? '2. الشؤون القرآنية والأكاديمية' : '2. Academic Core',
      items: [
        { id: 'interactive_quran', label: isRtl ? 'المصحف التفاعلي والروايات' : 'Interactive Quran & Qiraat', icon: BookMarked, roles: ['admin', 'teacher', 'student'] },
        { id: 'students', label: isRtl ? 'إدارة الدارسين' : 'Learner Directory', icon: GraduationCap, roles: ['admin', 'teacher'] },
        { id: 'teachers', label: isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters', icon: Presentation, roles: ['admin'] },
        { id: 'halaqas', label: isRtl ? 'المقارئ والحلقات' : 'Halaqas & Sanad', icon: BookOpen, roles: ['admin', 'teacher'] },
        { id: 'attendance', label: isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation', icon: CheckCircle2, roles: ['admin', 'teacher', 'student'] },
        { id: 'exams', label: isRtl ? 'الاختبارات والتقييم' : 'Exams & Diplomas', icon: Award, roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      id: 'community',
      title: isRtl ? '3. تفاعل الدارسين والأسر' : '3. Engagement & Community',
      items: [
        { id: 'guardian-portal', label: isRtl ? 'شبكة أسر الدارسين' : 'Guardian Portal', icon: Home, roles: ['admin', 'teacher'] },
        { id: 'gamification-streaks', label: isRtl ? 'الإنجاز والحوافز' : 'Gamification & Streaks', icon: Trophy, roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      id: 'governance',
      title: isRtl ? '4. الحوكمة والمالية' : '4. Governance & Treasury',
      items: [
        { id: 'subscriptions', label: isRtl ? 'الاشتراكات والترقية' : 'Subscriptions & Upgrades', icon: Zap, roles: ['admin'] },
        { id: 'payments', label: isRtl ? 'التحصيل والمعاملات' : 'Billing & Payments', icon: CreditCard, roles: ['admin'] },
        { id: 'asset-management', label: isRtl ? 'المستندات والأصول' : 'Asset Management', icon: Folder, roles: ['admin'] },
        { id: 'referrals', label: isRtl ? 'برنامج الإحالة والأرباح' : 'Affiliate & Rewards', icon: TrendingUp, roles: ['admin'] },
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

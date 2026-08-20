// src/constants/sidebarMenu.js
import { 
  BarChart3, GraduationCap, Presentation, CheckCircle2, 
  BookOpen, Award, CreditCard, SlidersHorizontal, Trophy, 
  BookMarked, HeartHandshake, Bot
} from "lucide-react";

export const getMenuSections = (isRtl, userRole = 'admin') => {
  const sections = [
    {
      id: 'main-ops',
      title: isRtl ? 'الرئيسية والعمليات' : 'Main Operations',
      items: [
        { id: 'dashboard', label: isRtl ? 'لوحة التحكم' : 'Dashboard', icon: BarChart3, roles: ['admin', 'teacher', 'student'] },
        { id: 'attendance', label: isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation Log', icon: CheckCircle2, roles: ['admin', 'teacher', 'student'] },
        { id: 'interactive_quran', label: isRtl ? 'المصحف والتسميع الذكي' : 'Interactive Quran & AI', icon: BookMarked, roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      id: 'academic-hub',
      title: isRtl ? 'الشؤون الأكاديمية' : 'Academic Hub',
      items: [
        { id: 'halaqas', label: isRtl ? 'الحلقات والكتاتيب' : 'Halaqas & Katateeb', icon: BookOpen, roles: ['admin', 'teacher'] },
        { id: 'students', label: isRtl ? 'دليل الطلاب والأسر' : 'Students & Guardians', icon: GraduationCap, roles: ['admin', 'teacher'] },
        { id: 'teachers', label: isRtl ? 'الكادر والمعلمون' : 'Faculty & Staff', icon: Presentation, roles: ['admin'] }
      ]
    },
    {
      id: 'eval-gamification',
      title: isRtl ? 'التقييم والتحفيز' : 'Evaluation & Rewards',
      items: [
        { id: 'exams', label: isRtl ? 'الاختبارات والشهادات' : 'Exams & Certificates', icon: Award, roles: ['admin', 'teacher', 'student'] },
        { id: 'gamification-streaks', label: isRtl ? 'سلسلة الإنجاز والأوسمة' : 'Streaks & Badges', icon: Trophy, roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      id: 'admin-finance',
      title: isRtl ? 'الإدارة والمالية' : 'Finance & Governance',
      items: [
        { id: 'payments', label: isRtl ? 'المالية والكفالات' : 'Finance & Sponsorships', icon: CreditCard, roles: ['admin'] },
        { id: 'settings', label: isRtl ? 'إعدادات المنظومة' : 'Academy Settings', icon: SlidersHorizontal, roles: ['admin'] }
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

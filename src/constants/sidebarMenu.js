import { 
  BarChart3, GraduationCap, Presentation, CheckCircle2, 
  BookOpen, Award, CreditCard, SlidersHorizontal, Zap, 
  History, Send, Home, Trophy, Folder
} from "lucide-react";

export const getMenuSections = (isRtl) => [
  {
    id: 'ops',
    title: isRtl ? '1. مركز القيادة والعمليات' : '1. Operations Hub',
    items: [
      { id: 'dashboard', label: isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance', icon: BarChart3 },
      { id: 'realtime-audit', label: isRtl ? 'السجل الحي للأنشطة' : 'Realtime Audit Trail', icon: History },
      { id: 'communication-hub', label: isRtl ? 'مركز التواصل والمراسلات' : 'Communication Hub', icon: Send },
      { id: 'reports', label: isRtl ? 'التقارير والتحليلات' : 'Reports & Analytics', icon: BarChart3 }
    ]
  },
  {
    id: 'academic',
    title: isRtl ? '2. الشؤون القرآنية والأكاديمية' : '2. Academic Core',
    items: [
      { id: 'students', label: isRtl ? 'إدارة الدارسين' : 'Learner Directory', icon: GraduationCap },
      { id: 'teachers', label: isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters', icon: Presentation },
      { id: 'halaqas', label: isRtl ? 'المقارئ والحلقات' : 'Halaqas & Sanad', icon: BookOpen },
      { id: 'attendance', label: isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation', icon: CheckCircle2 },
      { id: 'exams', label: isRtl ? 'الاختبارات والتقييم' : 'Exams & Diplomas', icon: Award }
    ]
  },
  {
    id: 'community',
    title: isRtl ? '3. تفاعل الدارسين والأسر' : '3. Engagement & Community',
    items: [
      { id: 'guardian-portal', label: isRtl ? 'شبكة أسر الدارسين' : 'Guardian Portal', icon: Home },
      { id: 'gamification-streaks', label: isRtl ? 'الإنجاز والحوافز' : 'Gamification & Streaks', icon: Trophy }
    ]
  },
  {
    id: 'governance',
    title: isRtl ? '4. الحوكمة والمالية' : '4. Governance & Treasury',
    items: [
      { id: 'subscriptions', label: isRtl ? 'الاشتراكات والترقية' : 'Subscriptions & Upgrades', icon: Zap },
      { id: 'payments', label: isRtl ? 'التحصيل والمعاملات' : 'Billing & Payments', icon: CreditCard },
      { id: 'asset-management', label: isRtl ? 'المستندات والأصول' : 'Asset Management', icon: Folder },
      { id: 'referrals', label: isRtl ? 'برنامج الإحالة والأرباح' : 'Affiliate & Rewards', icon: Zap },
      { id: 'settings', label: isRtl ? 'إعدادات المنظومة' : 'Platform Governance', icon: SlidersHorizontal }
    ]
  }
];

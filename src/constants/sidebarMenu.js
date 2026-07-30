import { 
  FaChartBar, FaUserGraduate, FaChalkboardTeacher, FaCheckCircle, 
  FaBookOpen, FaAward, FaCreditCard, FaSlidersH, FaBolt, 
  FaHistory, FaPaperPlane, FaHome, FaTrophy, FaFolder
} from "react-icons/fa";

export const getMenuSections = (isRtl) => [
  {
    id: 'ops',
    title: isRtl ? '1. مركز القيادة والعمليات' : '1. Operations Hub',
    items: [
      { id: 'dashboard', label: isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance', icon: FaChartBar },
      { id: 'realtime-audit', label: isRtl ? 'السجل الحي للأنشطة' : 'Realtime Audit Trail', icon: FaHistory },
      { id: 'communication-hub', label: isRtl ? 'مركز التواصل والمراسلات' : 'Communication Hub', icon: FaPaperPlane },
      { id: 'reports', label: isRtl ? 'التقارير والتحليلات' : 'Reports & Analytics', icon: FaChartBar }
    ]
  },
  {
    id: 'academic',
    title: isRtl ? '2. الشؤون القرآنية والأكاديمية' : '2. Academic Core',
    items: [
      { id: 'students', label: isRtl ? 'إدارة الدارسين' : 'Learner Directory', icon: FaUserGraduate },
      { id: 'teachers', label: isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters', icon: FaChalkboardTeacher },
      { id: 'halaqas', label: isRtl ? 'المقارئ والحلقات' : 'Halaqas & Sanad', icon: FaBookOpen },
      { id: 'attendance', label: isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation', icon: FaCheckCircle },
      { id: 'exams', label: isRtl ? 'الاختبارات والتقييم' : 'Exams & Diplomas', icon: FaAward }
    ]
  },
  {
    id: 'community',
    title: isRtl ? '3. تفاعل الدارسين والأسر' : '3. Engagement & Community',
    items: [
      { id: 'guardian-portal', label: isRtl ? 'شبكة أسر الدارسين' : 'Guardian Portal', icon: FaHome },
      { id: 'gamification-streaks', label: isRtl ? 'الإنجاز والحوافز' : 'Gamification & Streaks', icon: FaTrophy }
    ]
  },
  {
    id: 'governance',
    title: isRtl ? '4. الحوكمة والمالية' : '4. Governance & Treasury',
    items: [
      { id: 'subscriptions', label: isRtl ? 'الاشتراكات والترقية' : 'Subscriptions & Upgrades', icon: FaBolt },
      { id: 'payments', label: isRtl ? 'التحصيل والمعاملات' : 'Billing & Payments', icon: FaCreditCard },
      { id: 'asset-management', label: isRtl ? 'المستندات والأصول' : 'Asset Management', icon: FaFolder },
      { id: 'referrals', label: isRtl ? 'برنامج الإحالة والأرباح' : 'Affiliate & Rewards', icon: FaBolt },
      { id: 'settings', label: isRtl ? 'إعدادات المنظومة' : 'Platform Governance', icon: FaSlidersH }
    ]
  }
];

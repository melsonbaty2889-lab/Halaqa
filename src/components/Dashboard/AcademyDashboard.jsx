import React from 'react';
import { 
  BookOpen, 
  Award, 
  MessageCircle, 
  GraduationCap, 
  Clock, 
  Landmark, 
  CheckCircle2,
  Zap,
  BarChart2
} from 'lucide-react';

import ActiveHalaqas from '@/components/Dashboard/ActiveHalaqas';
import AchievementChart from '@/components/Gamification/AchievementChart';

export default function AcademyDashboard({ 
  isRtl, 
  greeting, 
  academyName, 
  stats = {}, 
  setActiveTab, 
  t 
}) {
  const getText = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return isRtl ? (val.ar || val.en || fallback) : (val.en || val.ar || fallback);
    }
    return fallback;
  };

  const translate = (key, fallback) => {
    if (typeof t === 'function') {
      const res = t(key, fallback);
      if (res && typeof res !== 'object') return res;
      if (res && typeof res === 'object') return getText(res, fallback);
    }
    return fallback;
  };

  const studentsCount = stats.studentsCount !== undefined ? stats.studentsCount : (stats.students || 0);
  const pendingCount = stats.overdueCount !== undefined ? stats.overdueCount : (stats.pending || 0);
  const activeHalagas = stats.activeHalagas || 0;
  const completedExams = stats.completedExams || 0;
  const attendanceRate = stats.attendanceRate || null;
  const totalPagesMuted = stats.totalPagesMuted || null;

  return (
    <div className={`p-4 md:p-6 pb-24 space-y-6 font-cairo bg-dark-bg text-appText-main ${isRtl ? 'rtl text-start' : 'ltr text-start'}`}>
      
      {/* 🟢 الهيدر والترحيب بالهوية الموحدة */}
      <header className="card-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white m-0 mb-1 leading-snug">
            {getText(greeting, translate('dashboard.welcome_default', 'مرحباً بك'))}
          </h1>
          <p className="text-sm font-bold text-amber-500 m-0 flex items-center gap-2">
            <span>🏛️</span>
            <span>{getText(academyName, translate('dashboard.default_academy_title', 'الأكاديمية القرآنيّة الرقمية'))}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brandEmerald-bg border border-brandEmerald-border text-brandEmerald text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-brandEmerald animate-pulse"></span>
          <span>متزامن لحظياً</span>
        </div>
      </header>

      {/* 🟢 الإجراءات السريعة (أزرار الهوية الموحدة) */}
      <section className="card-surface space-y-4">
        <h2 className="text-base font-extrabold m-0 flex items-center gap-2 text-amber-500">
          <Zap size={18} />
          <span>{translate('dashboard.quick_actions', 'الإجراءات السريعة والمباشرة')}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <button 
            onClick={() => setActiveTab && setActiveTab('attendance')} 
            aria-label={translate('dashboard.action_attendance', 'رصد التحضير والتسميع اليومي')}
            className="btn-primary flex items-center justify-start gap-3 min-h-[48px]"
          >
            <div className="p-2 rounded-lg bg-black/20 shrink-0">
              <BookOpen size={20} />
            </div>
            <span className="font-extrabold text-xs">
              {translate('dashboard.action_attendance', 'رصد التحضير والتسميع اليومي')}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab && setActiveTab('exams')} 
            aria-label={translate('dashboard.action_exams', 'الاختبارات والترقيات')}
            className="btn-secondary flex items-center justify-start gap-3 min-h-[48px]"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
              <Award size={20} />
            </div>
            <span className="text-xs font-extrabold">
              {translate('dashboard.action_exams', 'الاختبارات والترقيات')}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab && setActiveTab('reports')} 
            aria-label={translate('dashboard.action_reports', 'تقارير أولياء الأمور')}
            className="btn-secondary flex items-center justify-start gap-3 min-h-[48px]"
          >
            <div className="p-2 rounded-lg bg-brandEmerald-bg border border-brandEmerald-border text-brandEmerald shrink-0">
              <MessageCircle size={20} />
            </div>
            <span className="text-xs font-extrabold">
              {translate('dashboard.action_reports', 'تقارير أولياء الأمور')}
            </span>
          </button>
        </div>
      </section>

      {/* 🟢 شبكة المؤشرات بالبطاقات الموحدة */}
      <section className="card-surface space-y-4">
        <h2 className="text-base font-extrabold m-0 flex items-center gap-2 text-brandEmerald">
          <BarChart2 size={18} />
          <span>{translate('dashboard.academy_overview', 'مؤشرات الأداء العام للأكاديمية')}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* إجمالي الطلاب */}
          <div className="bg-dark-input border border-appBorder-input p-4 rounded-xl flex flex-col justify-between shadow-md">
            <p className="text-[11px] font-bold text-appText-sub m-0 mb-1">
              {translate('dashboard.total_students', 'إجمالي الطلاب')}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-xl md:text-2xl font-black text-white m-0">{studentsCount}</h3>
              <GraduationCap size={20} className="text-amber-500" />
            </div>
          </div>

          {/* نسبة الحضور */}
          {attendanceRate !== null && (
            <div className="bg-dark-input border border-appBorder-input p-4 rounded-xl flex flex-col justify-between shadow-md">
              <p className="text-[11px] font-bold text-appText-sub m-0 mb-1">
                {translate('dashboard.attendance_rate', 'نسبة الحضور')}
              </p>
              <div className="flex justify-between items-end">
                <h3 className="text-xl md:text-2xl font-black text-brandEmerald m-0">{attendanceRate}</h3>
                <CheckCircle2 size={20} className="text-brandEmerald" />
              </div>
            </div>
          )}

          {/* صفحات التسميع */}
          {totalPagesMuted !== null && (
            <div className="bg-dark-input border border-appBorder-input p-4 rounded-xl flex flex-col justify-between shadow-md">
              <p className="text-[11px] font-bold text-appText-sub m-0 mb-1">
                {translate('dashboard.pages_recited_today', 'صفحات القرآن اليوم')}
              </p>
              <div className="flex justify-between items-end">
                <h3 className="text-xl md:text-2xl font-black text-amber-500 m-0">{totalPagesMuted}</h3>
                <BookOpen size={20} className="text-amber-500" />
              </div>
            </div>
          )}

          {/* المستحقات المعلقة */}
          <div className="bg-dark-input border border-appBorder-input p-4 rounded-xl flex flex-col justify-between shadow-md">
            <p className="text-[11px] font-bold text-appText-sub m-0 mb-1">
              {translate('dashboard.pending_payments', 'المدفوعات المعلقة')}
            </p>
            <div className="flex justify-between items-end">
              <h3 className={`text-xl md:text-2xl font-black m-0 ${pendingCount > 0 ? 'text-red-500' : 'text-white'}`}>
                {pendingCount}
              </h3>
              <Clock size={20} className={pendingCount > 0 ? 'text-red-500' : 'text-appText-muted'} />
            </div>
          </div>

          {/* الحلقات النشطة */}
          <div className="bg-dark-input border border-appBorder-input p-4 rounded-xl flex flex-col justify-between shadow-md">
            <p className="text-[11px] font-bold text-appText-sub m-0 mb-1">
              {translate('dashboard.active_halagas', 'الحلقات النشطة')}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-xl md:text-2xl font-black text-amber-500 m-0">{activeHalagas}</h3>
              <Landmark size={20} className="text-amber-500" />
            </div>
          </div>

          {/* الاختبارات المكتملة */}
          <div className="bg-dark-input border border-appBorder-input p-4 rounded-xl flex flex-col justify-between shadow-md">
            <p className="text-[11px] font-bold text-appText-sub m-0 mb-1">
              {translate('dashboard.completed_exams', 'الاختبارات المكتملة')}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-xl md:text-2xl font-black text-brandEmerald m-0">{completedExams}</h3>
              <CheckCircle2 size={20} className="text-brandEmerald" />
            </div>
          </div>

        </div>
      </section>

      {/* 🟢 المكونات التفاعلية المكملة */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActiveHalaqas isRtl={isRtl} t={t} halaqas={stats.activeHalaqasData} />
        <AchievementChart isRtl={isRtl} />
      </section>
    </div>
  );
}

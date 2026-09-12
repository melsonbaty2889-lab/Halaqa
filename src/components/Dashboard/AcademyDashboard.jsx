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
import { C } from '@/theme/colors';

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
    <div 
      className={`p-4 md:p-6 pb-24 space-y-6 font-sans ${isRtl ? 'rtl text-start' : 'ltr text-start'}`}
      style={{ backgroundColor: C?.dark?.background || '#060A12', color: C?.text?.primary || '#FFFFFF' }}
    >
      
      {/* 🟢 الهيدر والترحيب */}
      <header 
        className="p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-md"
        style={{ backgroundColor: C?.dark?.surface || '#0A101D', borderColor: C?.dark?.border || '#1B2738' }}
      >
        <h1 className="text-2xl font-black m-0 mb-1 leading-snug" style={{ color: C?.text?.primary || '#FFFFFF' }}>
          {getText(greeting, translate('dashboard.welcome_default', 'مرحباً بك'))}
        </h1>
        <p className="text-sm font-extrabold m-0 flex items-center gap-2" style={{ color: C?.amber?.gold || '#F59E0B' }}>
          <span>🏛️</span>
          <span>{getText(academyName, translate('dashboard.default_academy_title', 'الأكاديمية القرآنيّة الرقمية'))}</span>
        </p>
      </header>

      {/* 🟢 الإجراءات السريعة */}
      <section 
        className="p-5 rounded-xl border shadow-xl space-y-4"
        style={{ backgroundColor: C?.dark?.surface || '#0A101D', borderColor: C?.dark?.border || '#1B2738' }}
      >
        <h2 className="text-base font-extrabold m-0 flex items-center gap-2" style={{ color: C?.amber?.gold || '#F59E0B' }}>
          <Zap size={18} />
          <span>{translate('dashboard.quick_actions', 'الإجراءات السريعة والمباشرة')}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <button 
            onClick={() => setActiveTab && setActiveTab('attendance')} 
            aria-label={translate('dashboard.action_attendance', 'رصد التحضير والتسميع اليومي')}
            className="border-0 p-4 rounded-xl cursor-pointer transition-all shadow-lg active:scale-95 flex items-center gap-3 min-h-[44px]"
            style={{ backgroundColor: C?.amber?.gold || '#F59E0B', color: C?.dark?.background || '#060A12' }}
          >
            <div className="p-2.5 rounded-lg shrink-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
              <BookOpen size={20} />
            </div>
            <div className="font-extrabold text-xs text-start">
              {translate('dashboard.action_attendance', 'رصد التحضير والتسميع اليومي')}
            </div>
          </button>

          <button 
            onClick={() => setActiveTab && setActiveTab('exams')} 
            aria-label={translate('dashboard.action_exams', 'الاختبارات والترقيات')}
            className="border p-4 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-3 min-h-[44px]"
            style={{ 
              backgroundColor: C?.dark?.background || '#060A12', 
              borderColor: C?.dark?.border || '#1B2738',
              color: C?.text?.primary || '#FFFFFF'
            }}
          >
            <div 
              className="p-2.5 rounded-lg shrink-0 border"
              style={{ 
                backgroundColor: `${C?.amber?.gold || '#F59E0B'}15`, 
                borderColor: `${C?.amber?.gold || '#F59E0B'}30`,
                color: C?.amber?.gold || '#F59E0B'
              }}
            >
              <Award size={20} />
            </div>
            <span className="text-xs font-extrabold">
              {translate('dashboard.action_exams', 'الاختبارات والترقيات')}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab && setActiveTab('reports')} 
            aria-label={translate('dashboard.action_reports', 'تقارير أولياء الأمور')}
            className="border p-4 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-3 min-h-[44px]"
            style={{ 
              backgroundColor: C?.dark?.background || '#060A12', 
              borderColor: C?.dark?.border || '#1B2738',
              color: C?.text?.primary || '#FFFFFF'
            }}
          >
            <div 
              className="p-2.5 rounded-lg shrink-0 border"
              style={{ 
                backgroundColor: `${C?.success?.main || '#10B981'}15`, 
                borderColor: `${C?.success?.main || '#10B981'}30`,
                color: C?.success?.main || '#10B981'
              }}
            >
              <MessageCircle size={20} />
            </div>
            <span className="text-xs font-extrabold">
              {translate('dashboard.action_reports', 'تقارير أولياء الأمور')}
            </span>
          </button>
        </div>
      </section>

      {/* 🟢 شبكة المؤشرات بالألوان القياسية */}
      <section 
        className="p-5 rounded-xl border shadow-xl space-y-4"
        style={{ backgroundColor: C?.dark?.surface || '#0A101D', borderColor: C?.dark?.border || '#1B2738' }}
      >
        <h2 className="text-base font-extrabold m-0 flex items-center gap-2" style={{ color: C?.sky?.main || '#0EA5E9' }}>
          <BarChart2 size={18} />
          <span>{translate('dashboard.academy_overview', 'مؤشرات الأداء العام للأكاديمية')}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* إجمالي الطلاب */}
          <div 
            className="border p-4 rounded-xl flex flex-col justify-between shadow-md"
            style={{ backgroundColor: C?.dark?.background || '#060A12', borderColor: C?.dark?.border || '#1B2738' }}
          >
            <p className="text-[11px] font-bold m-0 mb-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
              {translate('dashboard.total_students', 'إجمالي الطلاب')}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-xl md:text-2xl font-black m-0" style={{ color: C?.text?.primary || '#FFFFFF' }}>{studentsCount}</h3>
              <GraduationCap size={20} style={{ color: C?.amber?.gold || '#F59E0B' }} />
            </div>
          </div>

          {/* نسبة الحضور */}
          {attendanceRate !== null && (
            <div 
              className="border p-4 rounded-xl flex flex-col justify-between shadow-md"
              style={{ backgroundColor: C?.dark?.background || '#060A12', borderColor: C?.dark?.border || '#1B2738' }}
            >
              <p className="text-[11px] font-bold m-0 mb-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
                {translate('dashboard.attendance_rate', 'نسبة الحضور')}
              </p>
              <div className="flex justify-between items-end">
                <h3 className="text-xl md:text-2xl font-black m-0" style={{ color: C?.success?.main || '#10B981' }}>{attendanceRate}</h3>
                <CheckCircle2 size={20} style={{ color: C?.success?.main || '#10B981' }} />
              </div>
            </div>
          )}

          {/* صفحات التسميع */}
          {totalPagesMuted !== null && (
            <div 
              className="border p-4 rounded-xl flex flex-col justify-between shadow-md"
              style={{ backgroundColor: C?.dark?.background || '#060A12', borderColor: C?.dark?.border || '#1B2738' }}
            >
              <p className="text-[11px] font-bold m-0 mb-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
                {translate('dashboard.pages_recited_today', 'صفحات القرآن اليوم')}
              </p>
              <div className="flex justify-between items-end">
                <h3 className="text-xl md:text-2xl font-black m-0" style={{ color: C?.sky?.main || '#0EA5E9' }}>{totalPagesMuted}</h3>
                <BookOpen size={20} style={{ color: C?.sky?.main || '#0EA5E9' }} />
              </div>
            </div>
          )}

          {/* المستحقات المعلقة */}
          <div 
            className="border p-4 rounded-xl flex flex-col justify-between shadow-md"
            style={{ backgroundColor: C?.dark?.background || '#060A12', borderColor: C?.dark?.border || '#1B2738' }}
          >
            <p className="text-[11px] font-bold m-0 mb-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
              {translate('dashboard.pending_payments', 'المدفوعات المعلقة')}
            </p>
            <div className="flex justify-between items-end">
              <h3 
                className="text-xl md:text-2xl font-black m-0" 
                style={{ color: pendingCount > 0 ? (C?.danger?.text || '#F43F5E') : (C?.text?.primary || '#FFFFFF') }}
              >
                {pendingCount}
              </h3>
              <Clock size={20} style={{ color: pendingCount > 0 ? (C?.danger?.text || '#F43F5E') : (C?.text?.muted || '#64748B') }} />
            </div>
          </div>

          {/* الحلقات النشطة */}
          <div 
            className="border p-4 rounded-xl flex flex-col justify-between shadow-md"
            style={{ backgroundColor: C?.dark?.background || '#060A12', borderColor: C?.dark?.border || '#1B2738' }}
          >
            <p className="text-[11px] font-bold m-0 mb-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
              {translate('dashboard.active_halagas', 'الحلقات النشطة')}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-xl md:text-2xl font-black m-0" style={{ color: C?.amber?.gold || '#F59E0B' }}>{activeHalagas}</h3>
              <Landmark size={20} style={{ color: C?.amber?.gold || '#F59E0B' }} />
            </div>
          </div>

          {/* الاختبارات المكتملة */}
          <div 
            className="border p-4 rounded-xl flex flex-col justify-between shadow-md"
            style={{ backgroundColor: C?.dark?.background || '#060A12', borderColor: C?.dark?.border || '#1B2738' }}
          >
            <p className="text-[11px] font-bold m-0 mb-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
              {translate('dashboard.completed_exams', 'الاختبارات المكتملة')}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-xl md:text-2xl font-black m-0" style={{ color: C?.success?.main || '#10B981' }}>{completedExams}</h3>
              <CheckCircle2 size={20} style={{ color: C?.success?.main || '#10B981' }} />
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

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
      const res = t(key);
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
    <div className={`p-2.5 pb-20 ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* الهيدر والترحيب */}
      <header className="mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 m-0 mb-1.5">
            {getText(greeting, isRtl ? 'مرحباً بك' : 'Welcome')}
          </h1>
          <p className="text-amber-500 text-sm font-bold m-0">
            {getText(academyName, isRtl ? 'الأكاديمية القرآنيّة الرقمية' : 'Digital Quran Academy')}
          </p>
        </div>
      </header>

      {/* الإجراءات السريعة */}
      <section className="mb-9">
        <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          <span>{translate('quick_actions', isRtl ? 'الإجراءات السريعة والمباشرة' : 'Quick Actions')}</span>
        </h2>
        
        <div className="grid grid-cols-1 gap-3.5">
          <button 
            onClick={() => setActiveTab('attendance')} 
            className="bg-amber-600 hover:bg-amber-500 text-white border-0 p-4 rounded-xl cursor-pointer transition-colors shadow-md shadow-amber-600/10"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg text-white">
                <BookOpen size={20} />
              </div>
              <div className="font-bold text-sm">
                {translate('action_attendance', isRtl ? 'رصد التحضير، وتسميع الحلقات اليومية فورا' : 'Take Attendance & Daily Recitation')}
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3.5">
            <button 
              onClick={() => setActiveTab('exams')} 
              className="bg-slate-800/90 border border-slate-700/60 hover:bg-slate-800 p-4 rounded-xl cursor-pointer flex flex-col items-center gap-2 transition-colors"
            >
              <Award className="text-amber-500" size={22} />
              <span className="text-xs font-bold text-slate-100">
                {translate('action_exams', isRtl ? 'الاختبارات والترقيات' : 'Exams & Levels')}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('reports')} 
              className="bg-slate-800/90 border border-slate-700/60 hover:bg-slate-800 p-4 rounded-xl cursor-pointer flex flex-col items-center gap-2 transition-colors"
            >
              <MessageCircle className="text-emerald-400" size={22} />
              <span className="text-xs font-bold text-slate-100">
                {translate('action_reports', isRtl ? 'تقارير أولياء الأمور' : 'Parent Reports')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* مؤشرات الأداء */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <BarChart2 size={18} className="text-sky-400" />
          <span>{translate('academy_overview', isRtl ? 'مؤشرات الأداء العام للأكاديمية' : 'Academy Overview')}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* الطلاب */}
          <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">{translate('total_students', isRtl ? 'إجمالي الطلاب' : 'Total Students')}</p>
              <h2 className="text-xl font-extrabold text-slate-100 m-0">{studentsCount}</h2>
            </div>
            <div className="text-amber-500"><GraduationCap size={24} /></div>
          </div>

          {/* نسبة الحضور */}
          {attendanceRate !== null && (
            <div className="bg-slate-800/80 border border-slate-700/50 border-b-2 border-b-emerald-400 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 mb-1">{isRtl ? 'نسبة الحضور اليومي' : 'Attendance Rate'}</p>
                <h2 className="text-xl font-extrabold text-emerald-400 m-0">{attendanceRate}</h2>
              </div>
              <div className="text-emerald-400"><CheckCircle2 size={24} /></div>
            </div>
          )}

          {/* الصفحات المسمعة */}
          {totalPagesMuted !== null && (
            <div className="bg-slate-800/80 border border-slate-700/50 border-b-2 border-b-emerald-400 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 mb-1">{isRtl ? 'صفحات القرآن المسمّعة اليوم' : 'Pages Recited Today'}</p>
                <h2 className="text-xl font-extrabold text-emerald-400 m-0">{totalPagesMuted}</h2>
              </div>
              <div className="text-emerald-400"><BookOpen size={24} /></div>
            </div>
          )}

          {/* الرسوم المعلقة */}
          <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">{translate('pending_payments', isRtl ? 'المدفوعات المعلقة' : 'Pending Payments')}</p>
              <h2 className={`text-xl font-extrabold m-0 ${pendingCount > 0 ? "text-rose-500" : "text-slate-100"}`}>{pendingCount}</h2>
            </div>
            <div className={pendingCount > 0 ? "text-rose-500" : "text-slate-400"}><Clock size={24} /></div>
          </div>

          {/* الحلقات النشطة */}
          <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">{translate('active_halagas', isRtl ? 'الحلقات النشطة' : 'Active Halaqas')}</p>
              <h2 className="text-xl font-extrabold text-slate-100 m-0">{activeHalagas}</h2>
            </div>
            <div className="text-amber-500"><Landmark size={24} /></div>
          </div>

          {/* الاختبارات المكتملة */}
          <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">{translate('completed_exams', isRtl ? 'الاختبارات المكتملة' : 'Completed Exams')}</p>
              <h2 className="text-xl font-extrabold text-emerald-400 m-0">{completedExams}</h2>
            </div>
            <div className="text-emerald-400"><CheckCircle2 size={24} /></div>
          </div>
        </div>
      </section>

      {/* المكونات الفرعية */}
      <section className="grid grid-cols-1 gap-5 mt-8">
        <ActiveHalaqas isRtl={isRtl} t={t} halaqas={stats.activeHalaqasData} />
        <AchievementChart isRtl={isRtl} />
      </section>
    </div>
  );
}

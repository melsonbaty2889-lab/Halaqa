import React from 'react';
import { FaUser, FaClock, FaChartPie } from 'react-icons/fa';

export default function ActiveHalaqas({ isRtl = true, t }) {
  // بيانات تجريبية لمحاكاة الحلقات اليومية
  const halaqasToday = [
    {
      id: 1,
      name: 'حلقة الإمام عاصم (حفظ)',
      teacher: 'الشيخ عبد الرحمن محمد',
      time: '04:00 م - 06:00 م',
      status: 'live', // live | upcoming | finished
      attendanceRate: 85,
    },
    {
      id: 2,
      name: 'حلقة التجويد المكثفة',
      teacher: 'الشيخ أحمد السنباطي',
      time: '06:30 م - 08:00 م',
      status: 'upcoming',
      attendanceRate: 0,
    },
    {
      id: 3,
      name: 'حلقة تثبيت جزء عم',
      teacher: 'الأستاذة سارة مصطفى',
      time: '01:00 م - 03:00 م',
      status: 'finished',
      attendanceRate: 100,
    },
  ];

  // دالة لتحديد مظهر شارة الحالة (Status Badge)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {/* نقطة وامضة للحلقة الجارية الآن */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {isRtl ? 'جارية الآن' : 'Live'}
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            {isRtl ? 'قادمة اليوم' : 'Upcoming'}
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="h-2 w-2 rounded-full bg-slate-500"></span>
            {isRtl ? 'انتهت' : 'Finished'}
          </span>
        );
      default:
        return null;
    }
  };

  const textAlignment = isRtl ? 'text-right' : 'text-left';

  return (
    <div 
      className="p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4"
      style={{ background: 'var(--surface)' }}
    >
      {/* رأس الجزء (Header) */}
      <div className={`flex items-center justify-between ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
        <h3 className="text-base font-bold text-white">
          {isRtl ? 'حلقات اليوم النشطة' : 'Active Halaqas Today'}
        </h3>
        <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">
          {halaqasToday.length} {isRtl ? 'حلقات' : 'Halaqas'}
        </span>
      </div>

      {/* قائمة الحلقات */}
      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
        {halaqasToday.map((halaqa) => (
          <div 
            key={halaqa.id}
            className={`p-4 rounded-xl border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              isRtl ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* معلومات الحلقة الأساسية */}
            <div className={`flex flex-col gap-1 flex-1 ${textAlignment}`}>
              <h4 className="text-sm font-semibold text-slate-200">{halaqa.name}</h4>
              <div className={`flex items-center gap-4 text-xs text-slate-400 mt-1 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                <span className="flex items-center gap-1">
                  <FaUser size={11} className="text-slate-500" />
                  {halaqa.teacher}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock size={11} className="text-slate-500" />
                  {halaqa.time}
                </span>
              </div>
            </div>

            {/* الحضور وحالة الحلقة */}
            <div className={`flex items-center gap-5 w-full md:w-auto justify-between md:justify-end ${
              isRtl ? 'flex-row' : 'flex-row-reverse'
            }`}>
              {/* شريط نسبة الحضور (يظهر فقط إذا كانت الحلقة جارية أو انتهت) */}
              {halaqa.status !== 'upcoming' && (
                <div className={`flex flex-col gap-1 w-24 md:w-28 ${textAlignment}`}>
                  <div className={`flex items-center justify-between text-[10px] text-slate-400 ${
                    isRtl ? 'flex-row' : 'flex-row-reverse'
                  }`}>
                    <span>{isRtl ? 'الحضور:' : 'Attended:'}</span>
                    <span className="font-bold text-slate-300">{halaqa.attendanceRate}%</span>
                  </div>
                  {/* شريط التقدم باللون الذهبي الموحد */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${halaqa.attendanceRate}%`,
                        background: 'var(--gold)'
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* شارة الحالة التفاعلية */}
              <div className="flex-shrink-0">
                {getStatusBadge(halaqa.status)}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

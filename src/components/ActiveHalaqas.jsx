import React from 'react';
import { FaUser, FaClock, FaCircle, FaFolderOpen } from 'react-icons/fa';

export default function ActiveHalaqas({ 
  halaqas = [], 
  isLoading = false, 
  error = null, 
  isRtl = true 
}) {

  // 1️⃣ حالة التحميل الذكي (Skeleton Loading) لمنع وميض الشاشة وإعطاء مظهر احترافي أثناء جلب البيانات
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-white/5 shadow-xl bg-[var(--surface)] flex flex-col gap-4 h-full animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-white/10 rounded w-1/3"></div>
          <div className="h-6 bg-white/5 rounded-lg w-12"></div>
        </div>
        <div className="flex flex-col gap-3.5 pt-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] h-20 flex justify-between items-center">
              <div className="space-y-2 w-1/2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-white/5 rounded-lg w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2️⃣ حالة حدوث خطأ في الاتصال بقاعدة البيانات
  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/10 shadow-xl bg-[var(--surface)] flex flex-col items-center justify-center text-center p-8 h-full">
        <p className="text-red-400 text-sm font-medium">
          {isRtl ? 'حدث خطأ أثناء تحميل الحلقات الحية.' : 'Failed to load active sessions.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4 h-full bg-[var(--surface)]">
      
      {/* رأس القسم المطور */}
      <div className={`flex items-center justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
        <div>
          <h3 className="text-base font-bold text-white">
            {isRtl ? 'حلقات اليوم النشطة' : 'Active Halaqas Today'}
          </h3>
        </div>
        <span className="text-xs font-semibold bg-white/5 text-slate-400 px-2.5 py-1 rounded-lg border border-white/[0.02]">
          {halaqas.length} {isRtl ? 'حلقات' : 'Halaqas'}
        </span>
      </div>

      {/* 3️⃣ حالة عدم وجود أي حلقات منشأة أو نشطة اليوم في الأكاديمية (Empty State) */}
      {halaqas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
          <FaFolderOpen className="text-slate-600 mb-3" size={28} />
          <p className="text-slate-400 text-sm font-medium">
            {isRtl ? 'لا توجد حلقات نشطة مجدولة اليوم' : 'No active sessions scheduled today'}
          </p>
        </div>
      ) : (
        /* 4️⃣ رندرة البيانات الحقيقية القادمة من قاعدة البيانات ديناميكياً */
        <div className="flex flex-col gap-3.5 pt-2">
          {halaqas.map((halaqa) => (
            <div 
              key={halaqa.id}
              className="p-4 rounded-xl border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              {/* بيانات الحلقة الوصفية (تتغير اللغة بناءً على واجهة النظام الحالية وعقول البيانات الحقيقية) */}
              <div className={`md:col-span-7 flex flex-col gap-1.5 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h4 className="text-sm font-bold text-slate-100 truncate">
                  {isRtl ? (halaqa.name_ar || halaqa.name) : (halaqa.name_en || halaqa.name)}
                </h4>
                
                <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 ${isRtl ? 'flex-row' : 'flex-row-reverse justify-end'}`}>
                  <span className="flex items-center gap-1.5 min-w-0 truncate">
                    <FaUser className="text-slate-500 flex-shrink-0" size={11} />
                    {isRtl ? (halaqa.teacher_name_ar || halaqa.teacher_name) : (halaqa.teacher_name_en || halaqa.teacher_name)}
                  </span>
                  <span className="flex items-center gap-1.5 flex-shrink-0">
                    <FaClock className="text-slate-500" size={11} />
                    <span className="direction-ltr">
                      {isRtl ? (halaqa.time_display_ar || halaqa.time_display) : (halaqa.time_display_en || halaqa.time_display)}
                    </span>
                  </span>
                </div>
              </div>

              {/* المؤشرات والإحصائيات الحية للحلقة المعزولة بصرياً */}
              <div className={`md:col-span-5 flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 w-full ${isRtl ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                
                {/* شريط نسبة الحضور الحقيقي الفوري */}
                {halaqa.attendance_rate !== undefined && halaqa.attendance_rate !== null && (
                  <div className="w-full sm:w-28 flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>{isRtl ? 'الحضور:' : 'Attended:'}</span>
                      <span className="font-bold text-slate-200">{halaqa.attendance_rate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${halaqa.attendance_rate}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* بادج حالة الحلقة الملون الذكي */}
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 flex-shrink-0 border ${
                  halaqa.status === 'live' || halaqa.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15 animate-pulse' :
                  halaqa.status === 'upcoming' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' :
                  'bg-slate-500/10 text-slate-400 border-white/5'
                }`}>
                  <FaCircle size={6} />
                  {halaqa.status === 'live' || halaqa.status === 'active' ? (isRtl ? 'جارية الآن' : 'Live') : ''}
                  {halaqa.status === 'upcoming' ? (isRtl ? 'قادمة اليوم' : 'Upcoming') : ''}
                  {halaqa.status === 'finished' || halaqa.status === 'completed' ? (isRtl ? 'انتهت' : 'Finished') : ''}
                </span>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

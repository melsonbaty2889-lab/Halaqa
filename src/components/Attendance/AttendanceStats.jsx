// src/components/Attendance/AttendanceStats.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCheck, TrendingUp } from 'lucide-react';

export default function AttendanceStats({
  stats,
  handleMarkAllPresent,
  disabledMarkAll
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-semantic-surfaceInput border border-semantic-borderInput p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-[11px] text-semantic-textSecondary font-semibold">{t('attendance.totalStudents', 'إجمالي الطلاب')}</span>
          <span className="text-xl font-extrabold text-semantic-textPrimary mt-1 font-cairo">{stats.total}</span>
        </div>
        <div className="bg-semantic-successBg border border-semantic-successBorder p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[11px] text-semantic-success font-semibold">{t('attendance.present', 'الحاضرون')}</span>
          <span className="text-xl font-extrabold text-semantic-success mt-1 font-cairo">{stats.present}</span>
        </div>
        <div className="bg-semantic-dangerBg border border-semantic-danger/30 p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[11px] text-semantic-danger font-semibold">{t('attendance.absent', 'الغائبون')}</span>
          <span className="text-xl font-extrabold text-semantic-danger mt-1 font-cairo">{stats.absent}</span>
        </div>
        <div className="bg-semantic-surfaceInput border border-semantic-borderInput p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[11px] text-semantic-actionPrimary font-semibold">{t('attendance.late', 'المتأخرون')}</span>
          <span className="text-xl font-extrabold text-semantic-actionPrimary mt-1 font-cairo">{stats.late}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1 bg-semantic-surfaceInput border border-semantic-borderInput p-3 rounded-xl flex items-center justify-between px-4">
          <span className="text-xs text-semantic-textSecondary font-bold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-semantic-success" /> {t('attendance.rate', 'نسبة الانضباط:')}
          </span>
          <span className="text-base font-extrabold text-semantic-success font-cairo">{stats.rate}%</span>
        </div>

        <button
          type="button"
          onClick={handleMarkAllPresent}
          disabled={disabledMarkAll}
          className="sm:col-span-2 bg-semantic-successBg hover:bg-semantic-success/20 border border-semantic-successBorder text-semantic-success disabled:opacity-40 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all active:scale-[0.98] cursor-pointer shadow-sm font-cairo"
        >
          <CheckCheck className="w-4 h-4 shrink-0" /> {t('attendance.markAllPresent', 'تسجيل حضور كافة طلاب القائمة')}
        </button>
      </div>
    </div>
  );
}

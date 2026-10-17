// src/components/Attendance/AttendanceStats.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AttendanceStats({ stats }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {/* إجمالي الطلاب */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
        <span className="text-xs text-semantic-textSecondary font-medium">
          {t('attendance.totalStudents', 'إجمالي الطلاب')}
        </span>
        <span className="text-lg font-bold text-semantic-textPrimary mt-1">
          {stats?.total || 0}
        </span>
      </div>

      {/* الحاضرون */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
        <span className="text-xs text-semantic-success font-medium">
          {t('attendance.present', 'الحاضرون')}
        </span>
        <span className="text-lg font-bold text-semantic-success mt-1">
          {stats?.present || 0}
        </span>
      </div>

      {/* الغائبون */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
        <span className="text-xs text-semantic-danger font-medium">
          {t('attendance.absent', 'الغائبون')}
        </span>
        <span className="text-lg font-bold text-semantic-danger mt-1">
          {stats?.absent || 0}
        </span>
      </div>

      {/* المتأخرون */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
        <span className="text-xs text-semantic-actionPrimary font-medium">
          {t('attendance.late', 'المتأخرون')}
        </span>
        <span className="text-lg font-bold text-semantic-actionPrimary mt-1">
          {stats?.late || 0}
        </span>
      </div>
    </div>
  );
}

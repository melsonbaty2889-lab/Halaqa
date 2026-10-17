// src/components/Attendance/ArchivedNoticeBar.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Archive } from 'lucide-react';

export default function ArchivedNoticeBar() {
  const { t } = useTranslation();

  return (
    <div className="p-3.5 rounded-xl mb-5 bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textSecondary text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
      <Archive className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
      <span>
        {t(
          'attendance.archivedNotice', 
          'هذه الحلقة مؤرشفة حالياً. يمكنك استعراض السجلات القديمة فقط، وتم إيقاف إمكانية تعديل الحضور أو تسجيل التسميع.'
        )}
      </span>
    </div>
  );
}

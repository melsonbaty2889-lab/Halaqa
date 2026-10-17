// src/components/Attendance/AttendanceHeader.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, BookOpen, GraduationCap } from 'lucide-react';
import Select from '@/components/UI/Select';

export default function AttendanceHeader({
  halaqas = [],
  selectedHalaqaId,
  setSelectedHalaqaId,
  selectedDate,
  setSelectedDate,
  formatHalaqaName,
  isOfficialScheduleDay,
  isRtl
}) {
  const { t } = useTranslation();

  // تحويل الحلقات إلى خيارات متوافقة مع مكون Select الموحد
  const halaqaOptions = [
    { value: '', label: t('attendance.allHalaqas', 'جميع الحلقات والمجموعات') },
    ...halaqas.map(halaqa => ({
      value: halaqa.id,
      label: `${formatHalaqaName(halaqa)} ${halaqa.is_archived ? `(${t('common.archived', 'مؤرشفة')})` : ''}`
    }))
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-semantic-textPrimary flex items-center gap-2.5 m-0">
          <GraduationCap className="w-7 h-7 text-semantic-actionPrimary shrink-0" /> 
          {t('attendance.title', 'متابعة الجلسات والتحصيل')}
        </h2>
        <p className="text-xs text-semantic-textSecondary mt-1.5 font-normal leading-normal">
          {t('attendance.subtitle', 'إدارة وتوثيق سجلات التسميع والمراجعة والتقييم مع التقارير الفورية للمستفيدين.')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
        {/* استخدام مكون Select الموحد في المشروع */}
        <div className="min-w-[200px]">
          <Select
            value={selectedHalaqaId || ''}
            onChange={setSelectedHalaqaId}
            options={halaqaOptions}
            placeholder={t('attendance.selectHalaqa', 'اختر الحلقة...')}
            icon={BookOpen}
          />
        </div>

        {/* حقل التاريخ مع المؤشر الذكي */}
        <div className="flex flex-col min-w-[160px]">
          <div className="flex items-center gap-2.5 bg-semantic-surfaceInput border border-semantic-borderInput p-2 px-3 rounded-xl focus-within:border-semantic-actionPrimary transition-all">
            <Calendar className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-semantic-textPrimary text-xs font-bold outline-none cursor-pointer w-full font-cairo"
            />
          </div>
          {selectedHalaqaId && selectedDate && (
            <div className="text-[10px] mt-1 font-semibold px-1 flex items-center gap-1">
              {isOfficialScheduleDay ? (
                <span className="text-semantic-success flex items-center gap-1">
                  ● {t('attendance.officialDay', 'يوم انعقاد مجدول لهذه الحلقة')}
                </span>
              ) : (
                <span className="text-semantic-textMuted flex items-center gap-1">
                  ○ {t('attendance.extraOrArchiveDay', 'جلسة استثنائية / استعراض أرشيف')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

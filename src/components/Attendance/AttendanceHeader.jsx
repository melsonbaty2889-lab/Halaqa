// src/components/Attendance/AttendanceHeader.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, GraduationCap, Calendar as CalendarIcon } from 'lucide-react';
import Select from '@/components/UI/Select';
import CustomDatePicker from '@/components/UI/CustomDatePicker'; // التقويم الموحد المظلم

export default function AttendanceHeader({
  halaqas = [],
  selectedHalaqaId,
  setSelectedHalaqaId,
  selectedDate,
  setSelectedDate,
  formatHalaqaName,
  isOfficialScheduleDay
}) {
  const { t } = useTranslation();

  // تحضير خيارات الحلقات
  const halaqaOptions = [
    { value: '', label: t('attendance.allHalaqas', 'جميع الحلقات والمجموعات') },
    ...halaqas.map(halaqa => ({
      value: halaqa.id,
      label: `${formatHalaqaName(halaqa)} ${halaqa.is_archived ? `(${t('common.archived', 'مؤرشفة')})` : ''}`
    }))
  ];

  return (
    <div className="flex flex-col gap-5 mb-6">
      {/* 1. ترويسة الصفحة */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-semantic-textPrimary flex items-center gap-2.5 m-0">
          <GraduationCap className="w-7 h-7 text-semantic-actionPrimary shrink-0" /> 
          {t('attendance.title', 'متابعة الجلسات والتحصيل')}
        </h2>
        <p className="text-xs text-semantic-textSecondary mt-1.5 font-normal leading-normal">
          {t('attendance.subtitle', 'إدارة وتوثيق سجلات التسميع والمراجعة والتقييم مع التقارير الفورية للمستفيدين.')}
        </p>
      </div>

      {/* 2. شريط الأدوات والاختيارات الموحد */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full bg-semantic-surfaceCard p-3 rounded-2xl border border-semantic-borderCard shadow-sm">
        {/* اختيار الحلقة مع العنوان الصحيح */}
        <div className="w-full">
          <Select
            value={selectedHalaqaId || ''}
            onChange={setSelectedHalaqaId}
            options={halaqaOptions}
            placeholder={t('attendance.selectHalaqa', 'اختر الحلقة...')}
            modalTitle={t('attendance.selectHalaqaModalTitle', 'اختيار الحلقة الدراسية')}
            icon={BookOpen}
          />
        </div>

        {/* مكون اختيار التاريخ الموحد المظلم */}
        <div className="w-full flex flex-col justify-center">
          <CustomDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            icon={CalendarIcon}
          />

          {/* المؤشر الذكي ليوم الانعقاد */}
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

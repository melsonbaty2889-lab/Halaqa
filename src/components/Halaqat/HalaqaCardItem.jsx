/* src/components/Halaqat/HalaqaCardItem.jsx */

import React, { useState, useRef, useEffect } from 'react';
import { User, Clock, Video, AlertCircle, Edit3, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import { getLocalizedContent } from './HalaqaConstants';
import { formatTimeString } from '@/utils/dateUtils';

export default function HalaqaCardItem({ 
  halaqa, 
  teachers = [],
  viewMode = 'active', 
  layoutMode = 'grid',
  getLocalizedText, 
  onNavigateToAttendance, 
  onToggleArchiveHalaqa,
  onEditHalaqa,
  onUpdateHalaqa
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';

  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [isUpdatingTeacher, setIsUpdatingTeacher] = useState(false);
  const dropdownRef = useRef(null);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const halaqaName = getLocalizedContent(halaqa?.name, currentLang, getLocalizedText) || halaqa?.name_text;
  
  const rawTeacher = halaqa?.teacher || halaqa?.teacher_name || halaqa?.teacher_id;
  let teacherName = '';

  if (typeof rawTeacher === 'object' && rawTeacher !== null) {
    teacherName = getLocalizedContent(rawTeacher.name || rawTeacher.full_name, currentLang, getLocalizedText) || rawTeacher.email;
  } else if (typeof rawTeacher === 'string') {
    teacherName = rawTeacher;
  }

  // البحث عن اسم المعلم من قائمة teachers الممررة إذا توفر id
  if (!teacherName && halaqa?.teacher_id && Array.isArray(teachers)) {
    const foundTeacher = teachers.find(t => String(t.id) === String(halaqa.teacher_id));
    if (foundTeacher) {
      teacherName = getLocalizedContent(foundTeacher.name || foundTeacher.full_name, currentLang, getLocalizedText) || foundTeacher.email;
    }
  }

  const hasTeacher = Boolean(teacherName || halaqa?.teacher_id);

  const renderFormattedTime = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('ص') || timeStr.includes('م') || timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
      return timeStr;
    }
    const [hours, minutes] = timeStr.split(':');
    if (hours !== undefined && minutes !== undefined) {
      const dummyDate = new Date();
      dummyDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return formatTimeString(dummyDate, currentLang);
    }
    return timeStr;
  };

  const startTimeFormatted = renderFormattedTime(halaqa?.start_time);
  const endTimeFormatted = renderFormattedTime(halaqa?.end_time);

  const isArchived = Boolean(halaqa?.is_archived);
  const isListView = layoutMode === 'list';

  // التعيين السريع للمعلم
  const handleSelectTeacher = async (teacherId) => {
    setIsTeacherDropdownOpen(false);
    if (!onUpdateHalaqa || isUpdatingTeacher) return;

    setIsUpdatingTeacher(true);
    try {
      await onUpdateHalaqa({
        ...halaqa,
        teacher_id: teacherId || null
      });
    } catch (error) {
      console.error("Failed to assign teacher:", error);
    } finally {
      setIsUpdatingTeacher(false);
    }
  };

  return (
    <div className={`${UI.card} flex ${isListView ? 'flex-row items-center justify-between flex-wrap md:flex-nowrap' : 'flex-col justify-between'} gap-3 p-4 hover:border-semantic-borderHover transition-all w-full max-w-full overflow-visible relative`}>
      {/* القسم الرئيسي للمعلومات (يتكيف حسب وضع العرض) */}
      <div className={`flex flex-col justify-center ${isListView ? 'flex-1 min-w-[200px]' : 'w-full'}`}>
        {/* عنوان الحلقة وحالتها */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="text-sm font-extrabold text-semantic-textPrimary m-0 line-clamp-1">
            {halaqaName || t('unnamedHalaqa', 'حلقة بدون اسم')}
          </h4>
          
          {isArchived ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderCard font-bold shrink-0">
              {t('archived', 'مؤرشفة')}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30 font-bold shrink-0">
              {t('activeSession', 'نشطة')}
            </span>
          )}
        </div>

        {/* معلومات المعلم مع التعيين السريع */}
        <div className="relative mb-2" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsTeacherDropdownOpen((prev) => !prev)}
            disabled={isUpdatingTeacher}
            className={`w-full flex items-center justify-between gap-1.5 text-xs p-1.5 rounded-lg transition-colors border cursor-pointer ${
              hasTeacher 
                ? 'text-semantic-textSecondary bg-semantic-surfaceInput/40 border-semantic-borderCard hover:border-semantic-actionPrimary/40' 
                : 'text-semantic-actionPrimary bg-semantic-actionPrimary/10 border-semantic-actionPrimary/20 hover:bg-semantic-actionPrimary/20'
            }`}
            title={t('clickToAssignTeacher', 'انقر لتعيين/تغيير المعلم سريعاً')}
          >
            <div className="flex items-center gap-1.5 truncate">
              {hasTeacher ? (
                <>
                  <User size={14} className="text-semantic-actionPrimary shrink-0" />
                  <span className="truncate font-semibold">
                    {teacherName || t('unnamedTeacher', 'معلم غير محدد')}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={13} className="shrink-0" />
                  <span className="text-[11px] font-bold">{t('unassigned', 'بانتظار تعيين معتمد')}</span>
                </>
              )}
            </div>
            <ChevronDown size={13} className={`shrink-0 transition-transform ${isTeacherDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* القائمة المنسدلة لاختيار المعلم */}
          {isTeacherDropdownOpen && (
            <div className="absolute top-full right-0 left-0 mt-1 z-50 bg-semantic-surfaceCard border border-semantic-borderCard rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 space-y-0.5 animate-fade-in">
              <button
                type="button"
                onClick={() => handleSelectTeacher(null)}
                className="w-full text-right px-2.5 py-1.5 text-xs text-semantic-textMuted hover:bg-semantic-surfaceInput rounded-lg flex items-center justify-between border-none cursor-pointer"
              >
                <span>{t('unassignTeacherOption', 'بدون معلم (غير معين)')}</span>
                {!halaqa?.teacher_id && <Check size={12} className="text-semantic-actionPrimary" />}
              </button>

              <div className="my-1 border-t border-semantic-borderCard" />

              {Array.isArray(teachers) && teachers.length > 0 ? (
                teachers.map((teacher) => {
                  const name = getLocalizedContent(teacher.name || teacher.full_name, currentLang, getLocalizedText) || teacher.email;
                  const isSelected = String(halaqa?.teacher_id) === String(teacher.id);
                  return (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => handleSelectTeacher(teacher.id)}
                      className={`w-full text-right px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between border-none cursor-pointer ${
                        isSelected 
                          ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary' 
                          : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                      }`}
                    >
                      <span className="truncate">{name}</span>
                      {isSelected && <Check size={12} className="text-semantic-actionPrimary" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-2.5 py-2 text-[11px] text-semantic-textMuted text-center">
                  {t('noTeachersAvailable', 'لا يوجد معلمون مسجلون')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* التوقيت */}
        {(startTimeFormatted || endTimeFormatted) && (
          <div className="flex items-center gap-1.5 text-[11px] text-semantic-textSecondary">
            <Clock size={13} className="text-semantic-textMuted shrink-0" />
            <span className="font-semibold truncate">
              {startTimeFormatted} {endTimeFormatted && `- ${endTimeFormatted}`}
            </span>
          </div>
        )}
      </div>

      {/* أزرار الإجراءات الديناميكية (تتأثر بـ layoutMode و isArchived) */}
      <div className={`grid grid-cols-12 items-center gap-1.5 ${isListView ? 'border-t md:border-t-0 md:border-r md:pr-3 pt-3 md:pt-0 mt-1 md:mt-0 w-full md:w-auto shrink-0' : 'border-t border-semantic-borderCard pt-3 mt-1 w-full'}`}>
        {isArchived ? (
          <>
            {/* في حالة الحلقات المؤرشفة: زر التنشيط هو الأساسي والبارز */}
            <button 
              type="button"
              onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, isArchived)} 
              className={`${UI.btnEmerald} col-span-9 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1 min-w-0`}
            >
              <span className="truncate">{t('activate', 'تنشيط')}</span>
            </button>

            {/* زر التعديل */}
            {onEditHalaqa && (
              <button
                type="button"
                onClick={() => onEditHalaqa(halaqa)}
                className={`${UI.btnSecondary} col-span-3 py-2 px-0 flex items-center justify-center text-xs font-bold rounded-xl`}
                title={t('edit', 'تعديل')}
              >
                <Edit3 size={14} />
              </button>
            )}
          </>
        ) : (
          <>
            {/* في حالة الحلقات النشطة: الجلسة المباشرة هي الأساسية */}
            <button 
              type="button"
              onClick={() => onNavigateToAttendance?.(halaqa?.id)} 
              className={`${UI.btnEmerald} col-span-7 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1 min-w-0`}
              title={t('goToAttendance', 'الجلسة المباشرة')}
            >
              <Video size={13} className="shrink-0" />
              <span className="truncate">{t('goToAttendance', 'الجلسة المباشرة')}</span>
            </button>

            {/* زر التعديل */}
            {onEditHalaqa && (
              <button
                type="button"
                onClick={() => onEditHalaqa(halaqa)}
                className={`${UI.btnSecondary} col-span-2 py-2 px-0 flex items-center justify-center text-xs font-bold rounded-xl`}
                title={t('edit', 'تعديل')}
              >
                <Edit3 size={14} />
              </button>
            )}

            {/* زر الأرشفة */}
            <button 
              type="button"
              onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, isArchived)} 
              className={`${UI.btnSecondary} col-span-3 py-2 px-1 text-[11px] font-bold flex items-center justify-center rounded-xl truncate`}
            >
              <span className="truncate">{t('archive', 'أرشفة')}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

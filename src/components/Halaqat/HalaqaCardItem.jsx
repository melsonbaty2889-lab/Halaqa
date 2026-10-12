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

  // ==========================================
  // 1. وضع القائمة المدمج والمنظم (List View)
  // ==========================================
  if (isListView) {
    return (
      <div className={`${UI.card} p-3 transition-all w-full relative flex flex-col gap-2 overflow-visible border border-semantic-borderCard hover:border-semantic-borderHover`}>
        {/* السطر الأول: الاسم + الحالة + التوقيت */}
        <div className="flex items-center justify-between gap-2 border-b border-semantic-borderCard/40 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-sm font-extrabold text-semantic-textPrimary m-0 truncate">
              {halaqaName || t('unnamedHalaqa', 'حلقة بدون اسم')}
            </h4>
            {isArchived ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderCard font-bold shrink-0">
                {t('archived', 'مؤرشفة')}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30 font-bold shrink-0">
                {t('activeSession', 'نشطة')}
              </span>
            )}
          </div>

          {(startTimeFormatted || endTimeFormatted) && (
            <div className="flex items-center gap-1 text-[11px] text-semantic-textSecondary shrink-0 bg-semantic-surfaceInput/60 px-2 py-0.5 rounded-md">
              <Clock size={11} className="text-semantic-textMuted" />
              <span className="font-semibold">{startTimeFormatted}</span>
            </div>
          )}
        </div>

        {/* السطر الثاني: معلم الحلقة + أزرار الإجراءات */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* اختيار المعلم */}
          <div className="relative flex-1 min-w-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsTeacherDropdownOpen((prev) => !prev)}
              disabled={isUpdatingTeacher}
              className={`w-full flex items-center justify-between gap-1 text-[11px] p-1.5 rounded-lg border cursor-pointer ${
                hasTeacher 
                  ? 'text-semantic-textSecondary bg-semantic-surfaceInput/40 border-semantic-borderCard' 
                  : 'text-semantic-actionPrimary bg-semantic-actionPrimary/10 border-semantic-actionPrimary/20'
              }`}
            >
              <div className="flex items-center gap-1 truncate">
                <User size={12} className={hasTeacher ? "text-semantic-actionPrimary shrink-0" : "shrink-0"} />
                <span className="truncate font-semibold">{teacherName || t('unassigned', 'غير معين')}</span>
              </div>
              <ChevronDown size={11} className={`shrink-0 transition-transform ${isTeacherDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTeacherDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-semantic-surfaceCard border border-semantic-borderCard rounded-xl shadow-xl w-full min-w-[180px] max-h-40 overflow-y-auto p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleSelectTeacher(null)}
                  className="w-full text-right px-2 py-1 text-[11px] text-semantic-textMuted hover:bg-semantic-surfaceInput rounded-lg flex items-center justify-between border-none cursor-pointer"
                >
                  <span>{t('unassignTeacherOption', 'بدون معلم')}</span>
                  {!halaqa?.teacher_id && <Check size={11} className="text-semantic-actionPrimary" />}
                </button>
                <div className="my-1 border-t border-semantic-borderCard" />
                {Array.isArray(teachers) && teachers.map((teacher) => {
                  const name = getLocalizedContent(teacher.name || teacher.full_name, currentLang, getLocalizedText) || teacher.email;
                  const isSelected = String(halaqa?.teacher_id) === String(teacher.id);
                  return (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => handleSelectTeacher(teacher.id)}
                      className={`w-full text-right px-2 py-1 text-[11px] font-semibold rounded-lg flex items-center justify-between border-none cursor-pointer ${
                        isSelected ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary' : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                      }`}
                    >
                      <span className="truncate">{name}</span>
                      {isSelected && <Check size={11} className="text-semantic-actionPrimary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* الأزرار */}
          <div className="flex items-center gap-1 shrink-0">
            {isArchived ? (
              <button 
                type="button"
                onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, isArchived)} 
                className={`${UI.btnEmerald} px-3 py-1.5 text-[11px] font-extrabold flex items-center justify-center rounded-lg`}
              >
                <span>{t('activate', 'تنشيط')}</span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => onNavigateToAttendance?.(halaqa?.id)} 
                className={`${UI.btnEmerald} px-2.5 py-1.5 text-[11px] font-extrabold flex items-center justify-center gap-1 rounded-lg`}
              >
                <Video size={11} />
                <span>{t('goToAttendance', 'الجلسة')}</span>
              </button>
            )}

            {onEditHalaqa && (
              <button
                type="button"
                onClick={() => onEditHalaqa(halaqa)}
                className={`${UI.btnSecondary} p-1.5 flex items-center justify-center rounded-lg`}
                title={t('edit', 'تعديل')}
              >
                <Edit3 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. وضع الشبكة القياسي (Grid View)
  // ==========================================
  return (
    <div className={`${UI.card} flex flex-col justify-between gap-3 p-4 hover:border-semantic-borderHover transition-all w-full max-w-full overflow-visible relative`}>
      <div>
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
          >
            <div className="flex items-center gap-1.5 truncate">
              {hasTeacher ? (
                <>
                  <User size={14} className="text-semantic-actionPrimary shrink-0" />
                  <span className="truncate font-semibold">{teacherName || t('unnamedTeacher', 'معلم غير محدد')}</span>
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
                        isSelected ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary' : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
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

        {(startTimeFormatted || endTimeFormatted) && (
          <div className="flex items-center gap-1.5 text-[11px] text-semantic-textSecondary">
            <Clock size={13} className="text-semantic-textMuted shrink-0" />
            <span className="font-semibold truncate">
              {startTimeFormatted} {endTimeFormatted && `- ${endTimeFormatted}`}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 items-center gap-1.5 border-t border-semantic-borderCard pt-3 mt-1 w-full">
        {isArchived ? (
          <>
            <button 
              type="button"
              onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, isArchived)} 
              className={`${UI.btnEmerald} col-span-9 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1 min-w-0`}
            >
              <span className="truncate">{t('activate', 'تنشيط')}</span>
            </button>
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
            <button 
              type="button"
              onClick={() => onNavigateToAttendance?.(halaqa?.id)} 
              className={`${UI.btnEmerald} col-span-7 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1 min-w-0`}
              title={t('goToAttendance', 'الجلسة المباشرة')}
            >
              <Video size={13} className="shrink-0" />
              <span className="truncate">{t('goToAttendance', 'الجلسة المباشرة')}</span>
            </button>

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

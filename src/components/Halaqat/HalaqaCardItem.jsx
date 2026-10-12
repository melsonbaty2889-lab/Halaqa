/* src/components/Halaqat/HalaqaCardItem.jsx */

import React, { useState, useRef, useEffect } from 'react';
import { User, Clock, Video, AlertCircle, Edit3, ChevronDown, Check, Calendar, Users, Globe, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import { getLocalizedContent, getTrackOptions, getTargetAudienceOptions } from './HalaqaConstants';
import { formatTimeRange } from '@/utils/formatters';

export default function HalaqaCardItem({ 
  halaqa, 
  teachers = [],
  viewMode = 'active', 
  getLocalizedText, 
  onNavigateToAttendance, 
  onToggleArchiveHalaqa,
  onEditHalaqa,
  onUpdateHalaqa
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  
  const isRtl = ['ar', 'ur'].includes(currentLang);

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

  const formatDaysDisplay = (daysArray = []) => {
    if (!Array.isArray(daysArray) || daysArray.length === 0) return null;
    const dayNames = {
      sat: t('days.sat', 'السبت'),
      sun: t('days.sun', 'الأحد'),
      mon: t('days.mon', 'الإثنين'),
      tue: t('days.tue', 'الثلاثاء'),
      wed: t('days.wed', 'الأربعاء'),
      thu: t('days.thu', 'الخميس'),
      fri: t('days.fri', 'الجمعة')
    };
    const separator = isRtl ? ' ، ' : ', ';
    return daysArray.map((day) => dayNames[day] || day).join(separator);
  };

  const formattedTimeRange = formatTimeRange(halaqa?.start_time, halaqa?.end_time, currentLang);
  const formattedDays = formatDaysDisplay(halaqa?.days_of_week);
  const isArchived = Boolean(halaqa?.is_archived);

  const trackOptions = getTrackOptions(t);
  const currentTrack = trackOptions.find(opt => opt.value === (halaqa?.educational_track || 'hifz'));
  
  const audienceOptions = getTargetAudienceOptions(t);
  const currentAudience = audienceOptions.find(opt => opt.value === halaqa?.target_audience);

  const isOnline = (halaqa?.teaching_type || 'online') === 'online';

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
    <div 
      className={`${UI.card} flex flex-col justify-between gap-3 p-4 hover:border-semantic-borderHover transition-all w-full max-w-full relative shadow-sm hover:shadow-md text-right`} 
      dir="rtl"
    >
      <div>
        {/* الترويسة: اسم الحلقة والشارات */}
        <div className="flex flex-col gap-2 mb-2.5">
          <div className="flex justify-between items-center gap-2">
            <h4 className="text-sm font-black text-semantic-textPrimary m-0 line-clamp-1">
              {halaqaName || t('unnamedHalaqa', 'حلقة بدون اسم')}
            </h4>
            
            <div className="flex items-center gap-1.5 shrink-0">
              {isOnline ? (
                <span className="p-1 rounded-full bg-semantic-actionPrimary/15 text-semantic-actionPrimary" title={t('onlineHalaqa', 'حلقة عن بُعد')}>
                  <Globe size={13} />
                </span>
              ) : (
                <span className="p-1 rounded-full bg-semantic-surfaceInput text-semantic-textMuted" title={t('offlineHalaqa', 'حلقة حضورية')}>
                  <Building2 size={13} />
                </span>
              )}

              {isArchived ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderCard font-bold">
                  {t('archived', 'مؤرشفة')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30 font-bold">
                  {t('activeSession', 'نشطة')}
                </span>
              )}
            </div>
          </div>

          {/* المسار التعليمي والفئة المستهدفة */}
          {(currentTrack?.label || currentAudience?.label) && (
            <div className="flex flex-wrap items-center gap-1.5 justify-start">
              {currentTrack?.label && (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderCard/80">
                  {currentTrack.label}
                </span>
              )}
              {currentAudience?.label && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-semantic-surfaceInput/50 text-semantic-textMuted border border-semantic-borderCard/40">
                  {currentAudience.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* قائمة المعلم */}
        <div className="relative mb-2.5" ref={dropdownRef}>
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
            <div className="absolute top-full right-0 left-0 mt-1 z-50 bg-semantic-surfaceCard border border-semantic-borderCard rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 space-y-0.5 text-right">
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

        {/* المواعيد والأيام والحد الأقصى */}
        <div className="space-y-1">
          {formattedTimeRange && (
            <div className="flex items-center gap-1.5 text-[11px] text-semantic-textSecondary">
              <Clock size={13} className="text-semantic-textMuted shrink-0" />
              <span className="font-semibold truncate">
                {formattedTimeRange}
              </span>
            </div>
          )}

          {formattedDays && (
            <div className="flex items-center gap-1.5 text-[11px] text-semantic-textSecondary">
              <Calendar size={13} className="text-semantic-actionPrimary shrink-0" />
              <span className="font-semibold truncate text-semantic-textPrimary">
                {formattedDays}
              </span>
            </div>
          )}

          {halaqa?.max_students && (
            <div className="flex items-center gap-1.5 text-[11px] text-semantic-textMuted pt-0.5">
              <Users size={12} className="shrink-0" />
              <span>
                {t('maxStudentsShort', 'الحد الأقصى:')}{' '}
                <span className="font-bold text-semantic-textSecondary">
                  {halaqa.max_students}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* أزرار العمليات */}
      <div className="grid grid-cols-12 items-center gap-1.5 border-t border-semantic-borderCard pt-3 mt-1 w-full">
        {isArchived ? (
          <>
            <button 
              type="button"
              onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, isArchived)} 
              className={`${UI.btnEmerald} col-span-9 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1 min-w-0 cursor-pointer`}
            >
              <span className="truncate">{t('activate', 'تنشيط')}</span>
            </button>
            {onEditHalaqa && (
              <button
                type="button"
                onClick={() => onEditHalaqa(halaqa)}
                className={`${UI.btnSecondary} col-span-3 py-2 px-0 flex items-center justify-center text-xs font-bold rounded-xl cursor-pointer`}
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
              className={`${UI.btnEmerald} col-span-7 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1 min-w-0 cursor-pointer`}
              title={t('goToAttendance', 'الجلسة المباشرة')}
            >
              <Video size={13} className="shrink-0" />
              <span className="truncate">{t('goToAttendance', 'الجلسة')}</span>
            </button>

            {onEditHalaqa && (
              <button
                type="button"
                onClick={() => onEditHalaqa(halaqa)}
                className={`${UI.btnSecondary} col-span-2 py-2 px-0 flex items-center justify-center text-xs font-bold rounded-xl cursor-pointer`}
                title={t('edit', 'تعديل')}
              >
                <Edit3 size={14} />
              </button>
            )}

            <button 
              type="button"
              onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, isArchived)} 
              className={`${UI.btnSecondary} col-span-3 py-2 px-1 text-[11px] font-bold flex items-center justify-center rounded-xl truncate text-semantic-textMuted hover:text-semantic-danger cursor-pointer`}
              title={t('archive', 'أرشفة')}
            >
              <span className="truncate">{t('archive', 'أرشفة')}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

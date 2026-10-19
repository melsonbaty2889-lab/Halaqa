/* src/components/Halaqat/HalaqaFormModal.jsx */

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/UI/Modal';
import { UI } from '@/theme/styles';
import { Input, Select, CustomTimePicker } from '@/components/UI';
import { getTrackOptions, getTargetAudienceOptions, getHalaqaTypeOptions } from './HalaqaConstants';
import { isStartTimeBeforeEndTime } from '@/utils/dateUtils';
import { getDaysOptions, normalizeDayValue } from '@/constants/days';

export default function HalaqaFormModal({ 
  isOpen,
  open,
  onClose,
  formData = {}, 
  setFormData, 
  handleSubmit, 
  onSubmit, 
  teachers = [], 
  isSubmitting = false
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);
  
  const [timeError, setTimeError] = useState('');
  const [loading, setLoading] = useState(false);
  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const daysOptions = getDaysOptions(t);

  const getStoredAcademyId = () => {
    try {
      const activeAcademy = localStorage.getItem('active_academy_id') || localStorage.getItem('academy_id');
      if (activeAcademy) return activeAcademy;

      const userSession = localStorage.getItem('supabase.auth.token') || localStorage.getItem('sb-access-token');
      if (userSession) {
        const parsed = JSON.parse(userSession);
        return parsed?.user?.user_metadata?.academy_id || parsed?.user?.academy_id || null;
      }
    } catch (e) {
      console.warn('Could not retrieve academy_id from storage', e);
    }
    return null;
  };

  useEffect(() => {
    const isVisible = Boolean(isOpen || open);
    if (isVisible) {
      setTimeError('');
      setLoading(false);
    }
  }, [isOpen, open]);

  const getCurrentName = () => {
    if (typeof formData?.name_text === 'string' && formData.name_text.trim() !== '') {
      return formData.name_text;
    }
    if (typeof formData?.name === 'string') {
      return formData.name;
    }
    if (typeof formData?.name === 'object' && formData?.name !== null) {
      return formData.name[currentLang] || formData.name.ar || formData.name.en || Object.values(formData.name)[0] || '';
    }
    return '';
  };

  const extractValue = (val) => {
    if (val && typeof val === 'object' && 'target' in val) {
      return val.target.value;
    }
    return val;
  };

  const handleChange = (field, val) => {
    const value = extractValue(val);
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 1️⃣ استخدام دالة التوحيد المعيارية لإدارة أيام الانعقاد ومنع التكرار والتناقض
  const toggleDay = (dayValue) => {
    const normalizedTarget = normalizeDayValue(dayValue);
    setFormData((prev) => {
      const currentDays = (Array.isArray(prev?.days_of_week) ? prev.days_of_week : []).map(normalizeDayValue);
      const exists = currentDays.includes(normalizedTarget);
      
      const updatedDays = exists
        ? currentDays.filter((d) => d !== normalizedTarget)
        : [...currentDays, normalizedTarget];
        
      return { ...prev, days_of_week: Array.from(new Set(updatedDays)) };
    });
  };

  const validateTimes = (startTime, endTime) => {
    if (!startTime || !endTime) {
      setTimeError(t('timeRequiredError', 'يرجى تحديد وقت البدء ووقت الانتهاء للحلقة'));
      return false;
    }
    if (!isStartTimeBeforeEndTime(startTime, endTime)) {
      setTimeError(t('timeCheckError', 'وقت البدء يجب أن يكون قبل وقت الانتهاء'));
      return false;
    }
    setTimeError('');
    return true;
  };

  const handleTimeChange = (field, rawVal) => {
    const val = extractValue(rawVal);
    const newStartTime = field === 'start_time' ? val : formData?.start_time;
    const newEndTime = field === 'end_time' ? val : formData?.end_time;

    handleChange(field, val);
    if (newStartTime && newEndTime) {
      validateTimes(newStartTime, newEndTime);
    } else {
      setTimeError('');
    }
  };

  const handleNameChange = (val) => {
    const value = extractValue(val);
    setFormData((prev) => ({
      ...prev,
      name_text: value,
      name: typeof prev?.name === 'object' && prev?.name !== null 
        ? { ...prev.name, [currentLang]: value, ar: value } 
        : { [currentLang]: value, ar: value }
    }));
  };

  const trackOptions = getTrackOptions(t).filter((o) => o.value !== 'all');
  const audienceOptions = getTargetAudienceOptions(t).filter((o) => o.value !== 'all');
  const typeOptions = getHalaqaTypeOptions(t);

  const teacherSelectOptions = teachers.map((tch) => ({
    value: tch.id || tch.teacher_id,
    label: tch.name || tch.full_name || tch.email || t('unnamedTeacher', 'معلم بدون اسم')
  }));

  const onSubmitForm = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (loading || isSubmitting) return;

    const rawName = getCurrentName();
    if (!rawName || !rawName.trim()) {
      alert(t('enterHalaqaNameAlert', 'يرجى إدخال اسم الحلقة'));
      return;
    }

    const startTime = formData?.start_time;
    const endTime = formData?.end_time;
    if (!validateTimes(startTime, endTime)) {
      return;
    }

    const resolvedAcademyId = formData?.academy_id || formData?.academyId || getStoredAcademyId();

    if (!resolvedAcademyId) {
      alert(t('academyErrorAlert', 'خطأ: لم يتم التعرف على الأكاديمية الحالية، يرجى إعادة تسجيل الدخول.'));
      return;
    }

    const formattedName = typeof formData?.name === 'object' && formData?.name !== null 
      ? { ...formData.name, [currentLang]: rawName, ar: rawName }
      : { [currentLang]: rawName, ar: rawName };

    // تنقية وتوحيد أيام الانعقاد بالصيغة المعيارية ومنع أي تكرار نهائياً
    const cleanDays = Array.from(
      new Set((Array.isArray(formData?.days_of_week) ? formData.days_of_week : []).map(normalizeDayValue))
    ).filter(Boolean);

    const payload = {
      ...formData,
      academy_id: resolvedAcademyId,
      name: formattedName,
      days_of_week: cleanDays,
      educational_track: formData?.educational_track || 'hifz',
      teaching_type: formData?.teaching_type || 'online',
      target_audience: formData?.target_audience || 'kids',
      teacher_id: formData?.teacher_id || null,
      start_time: startTime,
      end_time: endTime,
      max_students: formData?.max_students ? parseInt(formData.max_students, 10) : null
    };

    delete payload.name_text;
    delete payload.track;
    delete payload.type;
    delete payload.academyId;

    const submitCallback = handleSubmit || onSubmit;
    if (submitCallback) {
      try {
        setLoading(true);
        await submitCallback(payload);
      } catch (err) {
        console.error("Error submitting halaqa form:", err);
      } finally {
        setLoading(false);
      }
    } else {
      alert(t('noSaveFuncAlert', 'خطأ: لم يتم ربط دالة الحفظ بالمودال!'));
    }
  };

  const isModalVisible = Boolean(isOpen || open);
  
  // توحيد الأيام المحددة حالياً لتتطابق بسلاسة مع أزرار المودال
  const selectedDays = Array.from(
    new Set((Array.isArray(formData?.days_of_week) ? formData.days_of_week : []).map(normalizeDayValue))
  ).filter(Boolean);

  const showLoading = loading || isSubmitting;

  return (
    <Modal
      open={isModalVisible}
      onClose={onClose}
      title={formData?.id ? t('editHalaqaTitle', 'تعديل بيانات الحلقة') : t('createHalaqaTitle', 'إنشاء حلقة جديدة')}
    >
      <form onSubmit={onSubmitForm} className={`flex flex-col flex-1 min-h-0 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="space-y-3.5 p-1 overflow-y-auto flex-1 pb-3 text-start">
          
          {/* اسم الحلقة */}
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1 text-start">
              {t('halaqaNameLabel', 'اسم الحلقة')} <span className="text-semantic-actionPrimary">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder={t('halaqaNamePlaceholder', 'أدخل اسم الحلقة')}
              value={getCurrentName()}
              onChange={handleNameChange}
            />
          </div>

          {/* أيام الانعقاد */}
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5 flex items-center gap-1.5 text-start">
              <Calendar size={13} className="text-semantic-actionPrimary shrink-0" />
              <span>{t('daysOfWeekLabel', 'أيام انعقاد الحلقة')}</span>
            </label>
            <div className={`flex flex-wrap gap-1.5 ${isRtl ? 'justify-start' : 'justify-start'}`}>
              {daysOptions.map((day) => {
                const normalizedDayVal = normalizeDayValue(day.value);
                const isSelected = selectedDays.includes(normalizedDayVal);
                
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-semantic-actionPrimary text-white border-semantic-actionPrimary shadow-md'
                        : 'bg-semantic-surfaceCard text-semantic-textSecondary border-semantic-borderCard hover:border-semantic-actionPrimary/50 hover:text-semantic-textPrimary'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1 text-start">
                {t('trackLabel', 'المسار التعليمي')}
              </label>
              <Select
                title={t('trackLabel', 'المسار التعليمي')}
                placeholder={t('selectPlaceholder', 'اختر...')}
                value={formData?.educational_track || ''}
                onChange={(v) => handleChange('educational_track', v)}
                options={trackOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1 text-start">
                {t('teacherLabel', 'المعلم المسؤول')}
              </label>
              <Select
                title={t('teacherLabel', 'المعلم المسؤول')}
                placeholder={t('optionalPlaceholder', 'اختياري...')}
                value={formData?.teacher_id || ''}
                onChange={(v) => handleChange('teacher_id', v)}
                options={teacherSelectOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1 text-start">
                {t('targetAudienceLabel', 'الفئة المستهدفة')}
              </label>
              <Select
                title={t('targetAudienceLabel', 'الفئة المستهدفة')}
                placeholder={t('selectPlaceholder', 'اختر...')}
                value={formData?.target_audience || ''}
                onChange={(v) => handleChange('target_audience', v)}
                options={audienceOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1 text-start">
                {t('halaqaTypeLabel', 'نمط انعقاد الحلقة')}
              </label>
              <Select
                title={t('halaqaTypeLabel', 'نمط انعقاد الحلقة')}
                placeholder={t('selectPlaceholder', 'اختر...')}
                value={formData?.teaching_type || ''}
                onChange={(v) => handleChange('teaching_type', v)}
                options={typeOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <CustomTimePicker
              label={t('startTimeLabel', 'وقت البدء')}
              required
              value={formData?.start_time || ''}
              onChange={(val) => handleTimeChange('start_time', val)}
              error={Boolean(timeError)}
            />

            <CustomTimePicker
              label={t('endTimeLabel', 'وقت الانتهاء')}
              required
              value={formData?.end_time || ''}
              onChange={(val) => handleTimeChange('end_time', val)}
              error={Boolean(timeError)}
            />

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1 text-start">
                {t('maxStudentsLabel', 'الحد الأقصى للطلاب')}
              </label>
              <Input
                type="number"
                min="1"
                max="500"
                placeholder={t('enterNumberPlaceholder', 'أدخل العدد')}
                value={formData?.max_students ?? ''}
                onChange={(v) => handleChange('max_students', extractValue(v))}
              />
            </div>
          </div>

          {timeError && (
            <div className="p-2 rounded-xl bg-semantic-dangerBg text-semantic-danger text-xs flex items-center gap-2 border border-semantic-danger/30 animate-fade-in text-start">
              <AlertCircle size={15} className="shrink-0 text-semantic-danger" />
              <span className="font-semibold">{timeError}</span>
            </div>
          )}

        </div>

        <div className="flex items-center justify-end gap-2 border-t border-semantic-borderCard pt-3 mt-auto shrink-0 bg-semantic-surfaceCard">
          <button
            type="button"
            onClick={onClose}
            disabled={showLoading}
            className={`${UI.btnSecondary} text-xs py-2.5 px-4 rounded-xl font-bold cursor-pointer`}
          >
            {t('cancel', 'إلغاء')}
          </button>
          <button
            type="submit"
            disabled={showLoading}
            className={`${UI.btnPrimary} text-xs py-2.5 px-6 rounded-xl font-extrabold transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <Save size={14} className={showLoading ? 'animate-spin' : ''} />
            <span>{showLoading ? t('saving', 'جاري الحفظ...') : (formData?.id ? t('saveChanges', 'حفظ التعديلات') : t('createNewHalaqa', 'إنشاء الحلقة'))}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

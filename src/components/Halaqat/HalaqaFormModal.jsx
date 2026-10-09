import React, { useState, useEffect } from 'react';
import { Save, Plus, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/UI/Modal';
import { UI } from '@/theme/styles';
import { Input, Select, CustomTimePicker } from '@/components/UI';
import { getTrackOptions, getTargetAudienceOptions, getHalaqaTypeOptions } from './HalaqaConstants';
import { isStartTimeBeforeEndTime } from '@/utils/dateUtils';

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
  const [timeError, setTimeError] = useState('');

  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  useEffect(() => {
    if (isOpen || open) {
      setTimeError('');
    }
  }, [isOpen, open]);

  const getCurrentName = () => {
    if (typeof formData?.name_text === 'string') return formData.name_text;
    if (typeof formData?.name === 'string') return formData.name;
    if (typeof formData?.name === 'object' && formData?.name !== null) {
      return formData.name[currentLang] || formData.name.ar || formData.name.en || '';
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
      name: {
        ...(typeof prev?.name === 'object' && prev?.name !== null ? prev.name : {}),
        [currentLang]: value
      }
    }));
  };

  // خيارات القوائم المنسدلة مع الخيار الإرشادي الأول
  const trackOptions = [
    { value: '', label: 'اختر المسار التعليمي...' },
    ...getTrackOptions(t).filter((o) => o.value !== 'all')
  ];

  const audienceOptions = [
    { value: '', label: 'اختر الفئة المستهدفة...' },
    ...getTargetAudienceOptions(t).filter((o) => o.value !== 'all')
  ];

  const typeOptions = [
    { value: '', label: 'اختر نمط الانعقاد...' },
    ...getHalaqaTypeOptions(t)
  ];

  const teacherSelectOptions = [
    { value: '', label: 'اختر معلماً للحلقة (اختياري)...' },
    ...teachers.map((tch) => ({
      value: tch.id || tch.teacher_id,
      label: tch.name || tch.full_name || tch.email || t('unnamedTeacher', 'معلم بدون اسم')
    }))
  ];

  const onSubmitForm = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const rawName = getCurrentName();
    if (!rawName || !rawName.trim()) {
      alert('يرجى إدخال اسم الحلقة');
      return;
    }

    const startTime = formData?.start_time;
    const endTime = formData?.end_time;
    if (!validateTimes(startTime, endTime)) {
      return;
    }

    const formattedName = typeof formData?.name === 'object' && formData?.name !== null 
      ? { ...formData.name, [currentLang]: rawName }
      : { [currentLang]: rawName, ar: rawName };

    const payload = {
      ...formData,
      ...(formData?.academy_id ? { academy_id: formData.academy_id } : {}),
      ...(formData?.academyId ? { academyId: formData.academyId } : {}),
      name: formattedName,
      educational_track: formData?.educational_track || formData?.track || 'hifz',
      teaching_type: formData?.teaching_type || formData?.type || 'online',
      target_audience: formData?.target_audience || 'kids',
      teacher_id: formData?.teacher_id || null,
      max_students: formData?.max_students ? parseInt(formData.max_students, 10) : null,
      timezone: formData?.timezone || defaultTimezone
    };

    delete payload.name_text;
    delete payload.track;
    delete payload.type;

    const submitCallback = handleSubmit || onSubmit;
    if (submitCallback) {
      await submitCallback(payload);
    } else {
      alert('خطأ: لم يتم ربط دالة الحفظ بالمودال!');
    }
  };

  const isModalVisible = Boolean(isOpen || open);

  return (
    <Modal
      open={isModalVisible}
      onClose={onClose}
      title={formData?.id ? t('editHalaqaTitle', 'تعديل بيانات الحلقة') : t('createHalaqaTitle', 'إنشاء حلقة جديدة')}
    >
      <form onSubmit={onSubmitForm} className="flex flex-col flex-1 min-h-0 text-right">
        <div className="space-y-3 p-1 overflow-y-auto flex-1 pb-3">
          
          {/* اسم الحلقة */}
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
              {t('halaqaNameLabel', 'اسم الحلقة')} <span className="text-semantic-actionPrimary">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="أدخل اسم الحلقة"
              value={getCurrentName()}
              onChange={handleNameChange}
            />
          </div>

          {/* المسار والمعلم */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('trackLabel', 'المسار التعليمي')}
              </label>
              <Select
                value={formData?.educational_track || formData?.track || ''}
                onChange={(v) => handleChange('educational_track', v)}
                options={trackOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('teacherLabel', 'المعلم المسؤول')}
              </label>
              <Select
                value={formData?.teacher_id || ''}
                onChange={(v) => handleChange('teacher_id', v)}
                options={teacherSelectOptions}
              />
            </div>
          </div>

          {/* الفئة ونمط الانعقاد */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('targetAudienceLabel', 'الفئة المستهدفة')}
              </label>
              <Select
                value={formData?.target_audience || ''}
                onChange={(v) => handleChange('target_audience', v)}
                options={audienceOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('halaqaTypeLabel', 'نمط انعقاد الحلقة')}
              </label>
              <Select
                value={formData?.teaching_type || formData?.type || ''}
                onChange={(v) => handleChange('teaching_type', v)}
                options={typeOptions}
              />
            </div>
          </div>

          {/* أوقات الحلقة والحد الأقصى */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('maxStudentsLabel', 'الحد الأقصى للطلاب')}
              </label>
              <Input
                type="number"
                min="1"
                max="500"
                placeholder="أدخل العدد"
                value={formData?.max_students ?? ''}
                onChange={(v) => handleChange('max_students', extractValue(v))}
              />
            </div>
          </div>

          {/* صندوق أخطاء التوقيت */}
          {timeError && (
            <div className="p-2.5 rounded-xl bg-semantic-dangerBg text-semantic-danger text-xs flex items-center gap-2 border border-semantic-danger/30 animate-fade-in">
              <AlertCircle size={15} className="shrink-0 text-semantic-danger" />
              <span className="font-semibold">{timeError}</span>
            </div>
          )}

        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center justify-end gap-2 border-t border-semantic-borderCard pt-3 mt-auto shrink-0 bg-semantic-surfaceCard">
          <button
            type="button"
            onClick={onClose}
            className={`${UI.btnSecondary} text-xs py-2 px-4 rounded-xl font-bold`}
          >
            {t('cancel', 'إلغاء')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${UI.btnPrimary} text-xs py-2 px-5 rounded-xl font-extrabold flex items-center gap-1.5 transition-opacity`}
          >
            {formData?.id ? <Save size={14} /> : <Plus size={14} />}
            <span>
              {isSubmitting
                ? t('saving', 'جاري الحفظ...')
                : formData?.id
                ? t('saveChanges', 'حفظ التعديلات')
                : t('createNewHalaqa', 'إنشاء الحلقة')}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

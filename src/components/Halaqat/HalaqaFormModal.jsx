import React, { useState, useEffect } from 'react';
import { Save, Plus, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/UI/Modal';
import { UI } from '@/theme/styles';
import { Input, Select } from '@/components/UI';
import { getTrackOptions, getTargetAudienceOptions, getHalaqaTypeOptions } from './HalaqaConstants';

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

  // تحديد المنطقة الزمنية تلقائياً دون الحاجة لعرض حقل إدخال لها
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

  const trackOptions = getTrackOptions(t).filter((o) => o.value !== 'all');
  const audienceOptions = getTargetAudienceOptions(t).filter((o) => o.value !== 'all');
  const typeOptions = getHalaqaTypeOptions(t);

  const teacherSelectOptions = [
    { value: '', label: t('selectTeacherPlaceholder', 'اختر معلماً للحلقة (اختياري)') },
    ...teachers.map((tch) => ({
      value: tch.id || tch.teacher_id,
      label: tch.name || tch.full_name || tch.email || t('unnamedTeacher', 'معلم بدون اسم')
    }))
  ];

  const onSubmitForm = (e) => {
    e.preventDefault();
    setTimeError('');

    const startTime = formData?.start_time;
    const endTime = formData?.end_time;

    if (startTime && endTime && startTime >= endTime) {
      setTimeError(t('timeCheckError', 'وقت البدء يجب أن يكون قبل وقت الانتهاء'));
      return;
    }

    const rawName = getCurrentName();
    const formattedName = typeof formData?.name === 'object' && formData?.name !== null 
      ? { ...formData.name, [currentLang]: rawName }
      : { [currentLang]: rawName, ar: rawName };

    const payload = {
      ...formData,
      name: formattedName,
      educational_track: formData?.educational_track || formData?.track || 'hifz',
      teaching_type: formData?.teaching_type || formData?.type || 'online',
      teacher_id: formData?.teacher_id || null,
      max_students: formData?.max_students ? parseInt(formData.max_students) : null,
      timezone: formData?.timezone || defaultTimezone
    };

    delete payload.name_text;
    delete payload.track;
    delete payload.type;

    const submitCallback = handleSubmit || onSubmit;
    submitCallback?.(payload);
  };

  const isModalVisible = Boolean(isOpen || open);

  return (
    <Modal
      open={isModalVisible}
      onClose={onClose}
      title={formData?.id ? t('editHalaqaTitle', 'تعديل بيانات الحلقة') : t('createHalaqaTitle', 'إنشاء حلقة جديدة')}
    >
      <form onSubmit={onSubmitForm} className="flex flex-col flex-1 min-h-0 text-right">
        
        {/* منطقة الحقول */}
        <div className="space-y-3 p-1 overflow-y-auto flex-1 pb-3">
          
          {/* اسم الحلقة */}
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
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

          {/* المسار التعليمي والمعلم */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('trackLabel', 'المسار التعليمي')}
              </label>
              <Select
                value={formData?.educational_track || formData?.track || 'hifz'}
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
                value={formData?.target_audience || 'kids'}
                onChange={(v) => handleChange('target_audience', v)}
                options={audienceOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('halaqaTypeLabel', 'نمط انعقاد الحلقة')}
              </label>
              <Select
                value={formData?.teaching_type || formData?.type || 'online'}
                onChange={(v) => handleChange('teaching_type', v)}
                options={typeOptions}
              />
            </div>
          </div>

          {/* توقيت الحلقة والحد الأقصى */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('startTimeLabel', 'وقت البدء')} <span className="text-semantic-actionPrimary">*</span>
              </label>
              <Input
                type="time"
                required
                value={formData?.start_time || ''}
                onChange={(v) => handleChange('start_time', v)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('endTimeLabel', 'وقت الانتهاء')} <span className="text-semantic-actionPrimary">*</span>
              </label>
              <Input
                type="time"
                required
                value={formData?.end_time || ''}
                onChange={(v) => handleChange('end_time', v)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('maxStudentsLabel', 'الحد الأقصى للطلاب')}
              </label>
              <Input
                type="number"
                min="1"
                max="500"
                placeholder={t('maxStudentsPlaceholder', 'أدخل السعة')}
                value={formData?.max_students ?? ''}
                onChange={(v) => handleChange('max_students', extractValue(v))}
              />
            </div>
          </div>

          {/* تنبيه أخطاء التوقيت */}
          {timeError && (
            <div className="p-2.5 rounded-xl bg-semantic-errorBg text-semantic-error text-xs flex items-center gap-2 border border-semantic-errorBorder/30">
              <AlertCircle size={15} className="shrink-0" />
              <span>{timeError}</span>
            </div>
          )}

        </div>

        {/* أزرار التحكم في الأسفل */}
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
            className={`${UI.btnPrimary} text-xs py-2 px-5 rounded-xl font-extrabold flex items-center gap-1.5`}
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

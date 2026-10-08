import React, { useState, useEffect } from 'react';
import { Globe, Save, Plus, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/UI/Modal';
import { UI } from '@/theme/styles';
import { Input, Select } from '@/components/UI';
import { getTrackOptions, getTargetAudienceOptions, getHalaqaTypeOptions } from './HalaqaConstants';

export default function HalaqaFormModal({ 
  isOpen,
  onClose,
  formData = {}, 
  setFormData, 
  handleSubmit, 
  teachers = [], 
  isSubmitting = false
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const [timeError, setTimeError] = useState('');

  // استخراج اسم الحلقة الحالي بأسلوب آمن
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
      max_students: parseInt(formData?.max_students) || 10,
      timezone: formData?.timezone || 'Africa/Cairo'
    };

    delete payload.name_text;
    delete payload.track;
    delete payload.type;

    handleSubmit?.(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formData?.id ? t('editHalaqaTitle', 'تعديل بيانات الحلقة') : t('createHalaqaTitle', 'إنشاء حلقة جديدة')}
      maxWidth="max-w-lg"
    >
      <form onSubmit={onSubmitForm} className="flex flex-col max-h-[75vh] overflow-hidden text-right">
        
        {/* منطقة الحقول مع شريط التمرير */}
        <div className="space-y-3.5 p-1 overflow-y-auto flex-1 pr-1">
          
          {/* اسم الحلقة */}
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
              {t('halaqaNameLabel', 'اسم الحلقة')} <span className="text-semantic-actionPrimary">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder={t('halaqaNamePlaceholder', 'مثال: حلقة الإمام عاصم لحفظ الجزء الثلاثين')}
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
                value={formData?.target_audience || 'all'}
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

          {/* توقيت الحلقة */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* تنبيه الخطأ لترتيب الأوقات */}
          {timeError && (
            <div className="p-2.5 rounded-xl bg-semantic-errorBg text-semantic-error text-xs flex items-center gap-2 border border-semantic-errorBorder/30">
              <AlertCircle size={15} className="shrink-0" />
              <span>{timeError}</span>
            </div>
          )}

          {/* السعة القصوى والمنطقة الزمنية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('maxStudentsLabel', 'الحد الأقصى للطلاب')}
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData?.max_students ?? 10}
                onChange={(v) => handleChange('max_students', parseInt(extractValue(v)) || 10)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textMuted mb-1">
                {t('timezone', 'المنطقة الزمنية')}
              </label>
              <div className="p-2.5 text-xs rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted flex items-center gap-1.5 h-[38px]">
                <Globe size={13} className="text-semantic-actionPrimary shrink-0" />
                <span className="truncate">{formData?.timezone || 'Africa/Cairo'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات مثبتة دائماً في أسفل النموذج */}
        <div className="flex items-center justify-end gap-2 border-t border-semantic-borderCard pt-3 mt-2 shrink-0 bg-semantic-bgMain sticky bottom-0">
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

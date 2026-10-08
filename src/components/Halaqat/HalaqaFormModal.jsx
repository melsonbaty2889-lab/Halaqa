import React from 'react';
import { X, Save, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import { Input, Select } from '@/components/UI';
import { getTrackOptions, getTargetAudienceOptions, getHalaqaTypeOptions } from './HalaqaConstants';

export default function HalaqaFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  teachers = [],
  isSubmitting = false
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const extractValue = (val) => {
    if (val && typeof val === 'object' && 'target' in val) {
      return val.target.value;
    }
    return val;
  };

  const handleChange = (field, value) => {
    const extracted = extractValue(value);
    setFormData((prev) => ({
      ...prev,
      [field]: extracted
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

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-semantic-bgMain border border-semantic-borderCard w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* الهيدر */}
        <div className="flex items-center justify-between p-4 border-b border-semantic-borderCard bg-semantic-surfaceInput/50">
          <h3 className="text-base font-extrabold text-semantic-textPrimary m-0">
            {formData?.id ? t('editHalaqaTitle', 'تعديل بيانات الحلقة') : t('createHalaqaTitle', 'إنشاء حلقة جديدة')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-semantic-textMuted hover:text-semantic-textPrimary hover:bg-semantic-surfaceInput transition-colors border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* جسم النموذج */}
        <form onSubmit={handleSubmitForm} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* اسم الحلقة */}
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
              {t('halaqaNameLabel', 'اسم الحلقة')} *
            </label>
            <Input
              type="text"
              required
              placeholder={t('halaqaNamePlaceholder', 'مثال: حلقة الإمام عاصم لحفظ الجزء الثلاثين')}
              value={formData?.name || ''}
              onChange={(v) => handleChange('name', v)}
            />
          </div>

          {/* المسار التعليمي والمعلم */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
                {t('trackLabel', 'المسار التعليمي')}
              </label>
              <Select
                value={formData?.track || 'hifz'}
                onChange={(v) => handleChange('track', v)}
                options={trackOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
                {t('teacherLabel', 'المعلم المسؤول')}
              </label>
              <Select
                value={formData?.teacher_id || ''}
                onChange={(v) => handleChange('teacher_id', v)}
                options={teacherSelectOptions}
              />
            </div>
          </div>

          {/* الفئة والمكان (أونلاين / حضوري) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
                {t('targetAudienceLabel', 'الفئة المستهدفة')}
              </label>
              <Select
                value={formData?.target_audience || 'kids'}
                onChange={(v) => handleChange('target_audience', v)}
                options={audienceOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
                {t('halaqaTypeLabel', 'نمط انعقاد الحلقة')}
              </label>
              <Select
                value={formData?.type || 'online'}
                onChange={(v) => handleChange('type', v)}
                options={typeOptions}
              />
            </div>
          </div>

          {/* توقيت الحلقة */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
                {t('startTimeLabel', 'وقت البدء')}
              </label>
              <Input
                type="time"
                value={formData?.start_time || ''}
                onChange={(v) => handleChange('start_time', v)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
                {t('endTimeLabel', 'وقت الانتهاء')}
              </label>
              <Input
                type="time"
                value={formData?.end_time || ''}
                onChange={(v) => handleChange('end_time', v)}
              />
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex items-center justify-end gap-2 border-t border-semantic-borderCard pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className={`${UI.btnSecondary} text-xs py-2 px-4`}
            >
              {t('cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${UI.btnPrimary} text-xs py-2 px-5 flex items-center gap-1.5`}
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
      </div>
    </div>
  );
}

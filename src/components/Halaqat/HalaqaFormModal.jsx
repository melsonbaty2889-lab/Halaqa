import React, { useState } from 'react';
import { Globe, Users, Target, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/UI/Modal';
import { UI } from '@/theme/styles';
import { Input, Select } from '@/components/UI';

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

  const extractValue = (val) => {
    if (val && typeof val === 'object' && 'target' in val) {
      return val.target.value;
    }
    return val;
  };

  const handleNameChange = (val) => {
    const value = extractValue(val);
    setFormData(prev => ({
      ...prev,
      name: {
        ...(prev?.name || {}),
        [currentLang]: value
      }
    }));
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    setTimeError('');

    if (formData?.start_time && formData?.end_time) {
      if (formData.start_time >= formData.end_time) {
        setTimeError(t('timeCheckError', 'وقت البدء يجب أن يكون قبل وقت الانتهاء'));
        return;
      }
    }

    handleSubmit?.(e);
  };

  const teacherOptions = [
    { value: '', label: t('selectTeacher', '-- بدون معلم (بانتظار معلم) --') },
    ...(Array.isArray(teachers) ? teachers.map(teacher => {
      const teacherName = typeof teacher?.name === 'object' 
        ? (teacher.name[currentLang] || teacher.name.ar || '')
        : (teacher?.name || teacher?.full_name || '');

      return {
        value: teacher.id,
        label: teacherName
      };
    }) : [])
  ];

  const trackOptions = [
    { value: 'hifz', label: t('trackHifz', 'الحفظ الجديد والتجويد المكثف') },
    { value: 'review', label: t('trackReview', 'المراجعة والتثبيت') },
    { value: 'tilawah', label: t('trackTilawah', 'التلاوة وتصحيح القراءة') },
    { value: 'ijazah', label: t('trackIjazah', 'الإجازة بالسند المتصل') }
  ];

  const targetAudienceOptions = [
    { value: 'all', label: t('audienceAll', 'جميع الفئات') },
    { value: 'kids', label: t('audienceKids', 'الأطفال') },
    { value: 'males', label: t('audienceMales', 'الرجال / الذكور') },
    { value: 'females', label: t('audienceFemales', 'النساء / الإناث') }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('createHalaqa', 'إنشاء حلقة جديدة')}
      maxWidth="max-w-lg"
    >
      <form onSubmit={onSubmitForm} className="space-y-3.5">
        {/* اسم الحلقة */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-semantic-textSecondary">
            {t('halaqaName', 'اسم الحلقة')}
          </label>
          <Input 
            type="text" 
            required 
            placeholder={t('halaqaNamePlaceholder', 'مثال: حلقة الإمام الشاطبي')} 
            value={formData?.name?.[currentLang] || formData?.name?.ar || ''} 
            onChange={handleNameChange} 
          />
        </div>

        {/* تعيين المعلم */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-semantic-textSecondary">
            {t('assignTeacher', 'المعلم المسؤول')}
          </label>
          <Select
            value={formData?.teacher_id || ''} 
            onChange={(v) => setFormData(prev => ({ ...prev, teacher_id: extractValue(v) }))} 
            options={teacherOptions}
          />
        </div>

        {/* المسار التعليمي والفئة المستهدفة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-semantic-textSecondary">
              {t('track', 'المسار التعليمي')}
            </label>
            <Select 
              value={formData?.educational_track || 'hifz'} 
              onChange={(v) => setFormData(prev => ({ ...prev, educational_track: extractValue(v) }))} 
              options={trackOptions}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-semantic-textSecondary flex items-center gap-1">
              <Target size={13} />
              <span>{t('targetAudience', 'الفئة المستهدفة')}</span>
            </label>
            <Select 
              value={formData?.target_audience || 'all'} 
              onChange={(v) => setFormData(prev => ({ ...prev, target_audience: extractValue(v) }))} 
              options={targetAudienceOptions}
            />
          </div>
        </div>

        {/* أوقات البدء والانتهاء */}
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-semantic-textSecondary">
                {t('startTime', 'وقت البدء')}
              </label>
              <Input 
                type="time" 
                required
                value={formData?.start_time || ''} 
                onChange={(v) => setFormData(prev => ({ ...prev, start_time: extractValue(v) }))} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-semantic-textSecondary">
                {t('endTime', 'وقت الانتهاء')}
              </label>
              <Input 
                type="time" 
                required
                value={formData?.end_time || ''} 
                onChange={(v) => setFormData(prev => ({ ...prev, end_time: extractValue(v) }))} 
              />
            </div>
          </div>
          {timeError && (
            <span className="text-[11px] font-bold text-semantic-danger mt-1">
              {timeError}
            </span>
          )}
        </div>

        {/* السعة والاستفادة التلقائية من إعدادات الأكاديمية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-semantic-textSecondary flex items-center gap-1">
              <Users size={13} />
              <span>{t('maxStudents', 'السعة الأقصى للطلاب')}</span>
            </label>
            <Input 
              type="number" 
              min="1"
              max="100"
              value={formData?.max_students || 25} 
              onChange={(v) => setFormData(prev => ({ ...prev, max_students: parseInt(extractValue(v)) || 25 }))} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-semantic-textSecondary flex items-center gap-1">
              <Globe size={13} />
              <span>{t('timezone', 'المنطقة الزمنية (افتراضي الأكاديمية)')}</span>
            </label>
            <div className="p-2.5 text-xs rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted flex items-center gap-2">
              <Globe size={14} className="text-semantic-actionPrimary shrink-0" />
              <span>{formData?.timezone || 'Africa/Cairo'}</span>
            </div>
          </div>
        </div>

        {/* أزرار الحفظ والإلغاء */}
        <div className="pt-2 flex gap-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`${UI.btnPrimary} flex-1 py-2.5 text-xs font-black`}
          >
            {isSubmitting ? t('saving', 'جاري الحفظ...') : t('btnSave', 'حفظ الحلقة')}
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className={`${UI.btnSecondary} px-4 py-2.5 text-xs font-bold`}
          >
            {t('cancel', 'إلغاء')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

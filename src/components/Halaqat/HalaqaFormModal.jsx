import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
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
      if (!formData?.id) {
        setFormData((prev) => ({
          ...prev,
          educational_track: prev?.educational_track === 'hifz' ? '' : (prev?.educational_track || ''),
          target_audience: prev?.target_audience === 'kids' ? '' : (prev?.target_audience || ''),
          teaching_type: prev?.teaching_type === 'online' ? '' : (prev?.teaching_type || ''),
          track: '',
          type: ''
        }));
      }
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

    const resolvedAcademyId = formData?.academy_id || formData?.academyId || getStoredAcademyId();

    if (!resolvedAcademyId) {
      alert('خطأ: لم يتم التعرف على الأكاديمية الحالية، يرجى إعادة تسجيل الدخول.');
      return;
    }

    const formattedName = typeof formData?.name === 'object' && formData?.name !== null 
      ? { ...formData.name, [currentLang]: rawName }
      : { [currentLang]: rawName, ar: rawName };

    const payload = {
      ...formData,
      academy_id: resolvedAcademyId,
      academyId: resolvedAcademyId,
      name: formattedName,
      educational_track: formData?.educational_track || 'hifz',
      teaching_type: formData?.teaching_type || 'online',
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
        <div className="space-y-2.5 p-1 overflow-y-auto flex-1 pb-2">
          
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('trackLabel', 'المسار التعليمي')}
              </label>
              <Select
                title="المسار التعليمي"
                placeholder="اختر..."
                value={formData?.educational_track || ''}
                onChange={(v) => handleChange('educational_track', v)}
                options={trackOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('teacherLabel', 'المعلم المسؤول')}
              </label>
              <Select
                title="المعلم المسؤول"
                placeholder="اختياري..."
                value={formData?.teacher_id || ''}
                onChange={(v) => handleChange('teacher_id', v)}
                options={teacherSelectOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('targetAudienceLabel', 'الفئة المستهدفة')}
              </label>
              <Select
                title="الفئة المستهدفة"
                placeholder="اختر..."
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
                title="نمط انعقاد الحلقة"
                placeholder="اختر..."
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

          {timeError && (
            <div className="p-2 rounded-xl bg-semantic-dangerBg text-semantic-danger text-xs flex items-center gap-2 border border-semantic-danger/30 animate-fade-in">
              <AlertCircle size={15} className="shrink-0 text-semantic-danger" />
              <span className="font-semibold">{timeError}</span>
            </div>
          )}

        </div>

        <div className="flex items-center justify-end gap-2 border-t border-semantic-borderCard pt-2.5 mt-auto shrink-0 bg-semantic-surfaceCard">
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
            className={`${UI.btnPrimary} text-xs py-2 px-6 rounded-xl font-extrabold transition-opacity flex items-center justify-center`}
          >
            {formData?.id ? (
              <span className="flex items-center gap-1.5">
                <Save size={14} />
                <span>{isSubmitting ? t('saving', 'جاري الحفظ...') : t('saveChanges', 'حفظ التعديلات')}</span>
              </span>
            ) : (
              <span>{isSubmitting ? t('saving', 'جاري الحفظ...') : t('createNewHalaqa', 'إنشاء الحلقة')}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

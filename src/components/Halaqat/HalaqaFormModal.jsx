import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/UI/Modal';
import { UI } from '@/theme/styles';

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

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: {
        ...(prev?.name || {}),
        [currentLang]: value
      }
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('createHalaqa', 'إنشاء حلقة جديدة')}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* اسم الحلقة */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-semantic-textSecondary">
            {t('halaqaName', 'اسم الحلقة')}
          </label>
          <input 
            type="text" 
            required 
            placeholder={t('halaqaNamePlaceholder', 'مثال: حلقة الإمام الشاطبي')} 
            value={formData?.name?.[currentLang] || formData?.name?.ar || ''} 
            onChange={handleNameChange} 
            className={`${UI.input} text-xs py-2.5`} 
          />
        </div>

        {/* تعيين المعلم */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-semantic-textSecondary">
            {t('assignTeacher', 'المعلم المسؤول')}
          </label>
          <select 
            required 
            value={formData?.teacher_id || ''} 
            onChange={e => setFormData(prev => ({ ...prev, teacher_id: e.target.value }))} 
            className={`${UI.input} text-xs py-2.5`}
          >
            <option value="">{t('selectTeacher', '-- اختر المعلم --')}</option>
            {Array.isArray(teachers) && teachers.map(teacher => {
              const teacherName = typeof teacher?.name === 'object' 
                ? (teacher.name[currentLang] || teacher.name.ar || '')
                : (teacher?.name || teacher?.full_name || '');

              return (
                <option key={teacher.id} value={teacher.id}>
                  {teacherName}
                </option>
              );
            })}
          </select>
        </div>

        {/* المسار التعليمي */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-semantic-textSecondary">
            {t('track', 'المسار التعليمي')}
          </label>
          <select 
            required
            value={formData?.educational_track || ''} 
            onChange={e => setFormData(prev => ({ ...prev, educational_track: e.target.value }))} 
            className={`${UI.input} text-xs py-2.5`}
          >
            <option value="hifz">{t('trackHifz', 'مسار الحفظ والتجويد المكثف')}</option>
            <option value="tilawah">{t('trackTilawah', 'مسار التلاوة وتصحيح الأداء')}</option>
            <option value="ijazah">{t('trackIjazah', 'مسار الإجازات بالسند المتصل')}</option>
          </select>
        </div>

        {/* أوقات البدء والانتهاء */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-semantic-textSecondary">
              {t('startTime', 'وقت البدء')}
            </label>
            <input 
              type="time" 
              required
              value={formData?.start_time || ''} 
              onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))} 
              className={`${UI.input} text-xs py-2 text-center`} 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-semantic-textSecondary">
              {t('endTime', 'وقت الانتهاء')}
            </label>
            <input 
              type="time" 
              required
              value={formData?.end_time || ''} 
              onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))} 
              className={`${UI.input} text-xs py-2 text-center`} 
            />
          </div>
        </div>

        {/* المنطقة الزمنية */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-semantic-textSecondary">
            {t('timezone', 'المنطقة الزمنية')}
          </label>
          <div className="p-2 text-xs rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted flex items-center gap-2">
            <Globe size={14} className="text-semantic-actionPrimary shrink-0" />
            <span>{formData?.timezone || 'UTC'}</span>
          </div>
        </div>

        {/* زر الإرسال والإلغاء */}
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

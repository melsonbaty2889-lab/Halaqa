import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';

export default function HalaqaFormModal({ 
  formData, 
  setFormData, 
  handleSubmit, 
  teachers = [], 
  getLocalizedText,
  isSubmitting = false
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';

  // تحديث الاسم بناءً على اللغة الحالية
  const handleNameChange = (value) => {
    setFormData({
      ...formData,
      name: {
        ...(formData.name || {}),
        [currentLang]: value
      }
    });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${UI.card} p-5 mb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-semantic-actionPrimary/30`}
    >
      {/* حقل اسم الحلقة بدعم دالة الترجمة t والقيمة الافتراضية العربية */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-semantic-textSecondary">
          {t('halaqaName', 'اسم الحلقة')}
        </label>
        <input 
          type="text" 
          required 
          placeholder={t('halaqaNamePlaceholder', 'مثال: حلقة الإمام الشاطبي')} 
          value={formData.name?.[currentLang] || formData.name?.ar || ''} 
          onChange={e => handleNameChange(e.target.value)} 
          className={`${UI.input} text-xs`} 
        />
      </div>

      {/* تعيين المعلم */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-semantic-textSecondary">
          {t('assignTeacher', 'تعيين المعلم المسؤول')}
        </label>
        <select 
          required 
          value={formData.teacher_id || ''} 
          onChange={e => setFormData({ ...formData, teacher_id: e.target.value })} 
          className={`${UI.input} text-xs`}
        >
          <option value="">{t('selectTeacher', '-- اختر المعلم المعتمد --')}</option>
          {teachers.map(teacher => {
            const teacherName = getLocalizedText 
              ? getLocalizedText(teacher.name || teacher.full_name) 
              : (teacher.name?.[currentLang] || teacher.name?.ar || teacher.full_name || '');
            return (
              <option key={teacher.id} value={teacher.id}>
                {teacherName}
              </option>
            );
          })}
        </select>
      </div>

      {/* المسار التعليمي */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-semantic-textSecondary">
          {t('track', 'المسار التعليمي')}
        </label>
        <select 
          required
          value={formData.educational_track || ''} 
          onChange={e => setFormData({ ...formData, educational_track: e.target.value })} 
          className={`${UI.input} text-xs`}
        >
          <option value="">{t('selectTrack', '-- اختر المسار --')}</option>
          <option value="hifz">{t('trackHifz', 'مسار الحفظ والتجويد المكثف')}</option>
          <option value="tilawah">{t('trackTilawah', 'مسار التلاوة وتصحيح الأداء')}</option>
          <option value="ijazah">{t('trackIjazah', 'مسار الإجازات بالسند المتصل')}</option>
        </select>
      </div>

      {/* أوقات البدء والانتهاء */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-semantic-textSecondary">{t('startTime', 'وقت البدء')}</label>
          <input 
            type="time" 
            required
            value={formData.start_time || ''} 
            onChange={e => setFormData({ ...formData, start_time: e.target.value })} 
            className={`${UI.input} text-xs text-center`} 
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-semantic-textSecondary">{t('endTime', 'وقت الانتهاء')}</label>
          <input 
            type="time" 
            required
            value={formData.end_time || ''} 
            onChange={e => setFormData({ ...formData, end_time: e.target.value })} 
            className={`${UI.input} text-xs text-center`} 
          />
        </div>
      </div>

      {/* المنطقة الزمنية */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-semantic-textSecondary">{t('timezone', 'المنطقة الزمنية النظامية')}</label>
        <div className="p-2.5 text-xs rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted flex items-center gap-2">
          <Globe size={15} className="text-semantic-actionPrimary" />
          <span>{formData.timezone || 'UTC'}</span>
        </div>
      </div>

      {/* زر الاعتماد */}
      <div className="col-span-full pt-2">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`${UI.btnPrimary} w-full py-3 text-xs font-extrabold flex items-center justify-center gap-2`}
        >
          {isSubmitting ? t('saving', 'جاري الحفظ...') : t('btnSave', 'اعتماد الحلقة وتأكيد الجدولة')}
        </button>
      </div>
    </form>
  );
}

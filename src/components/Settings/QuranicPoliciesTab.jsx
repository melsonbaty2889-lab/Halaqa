import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '@/components/UI/CustomSelect.jsx';
import { RIWAYAT_LIST } from '@/constants/riwayat.js';

export default function QuranicPoliciesTab({ formData = {}, updateField }) {
  const { t } = useTranslation();

  const handleChange = (field, value) => {
    if (typeof updateField === 'function') {
      updateField(field, value);
    }
  };

  // خيارات نمط التعليم
  const educationModeOptions = useMemo(() => [
    { label: t('quranic.modeOnline', 'عن بعد (Online)'), value: 'online' },
    { label: t('quranic.modeOnsite', 'حضوري (In-person)'), value: 'onsite' },
    { label: t('quranic.modeHybrid', 'مختلط (Hybrid)'), value: 'hybrid' },
  ], [t]);

  // خيارات الرواية / القراءة
  const riwayaOptions = useMemo(() => {
    if (!Array.isArray(RIWAYAT_LIST)) return [];
    return RIWAYAT_LIST.map((r, index) => {
      if (typeof r === 'string') return { label: r, value: r };
      const rawValue = r?.id ?? r?.value ?? r?.code ?? r?.nameAr ?? index;
      const label = r?.nameAr || r?.name || r?.label || `رواية ${index + 1}`;
      return { label, value: rawValue };
    });
  }, []);

  // خيارات المنهجية والمدرسة
  const madrasaOptions = useMemo(() => [
    { label: t('quranic.madrasaEastern', 'المشرقية (المعتادة)'), value: 'mashreqi' },
    { label: t('quranic.madrasaMaghrebi', 'المغربية'), value: 'maghrebi' },
  ], [t]);

  return (
    <div className="space-y-5 text-start">
      <div className="card-surface space-y-4 !overflow-visible">
        <h3 className="text-xs font-bold text-[var(--primary)] pb-2 border-b border-[var(--border-input)]">
          {t('quranic.title', 'الإعدادات القرآنية والتعليمية')}
        </h3>

        <div className="space-y-3.5">
          {/* نمط التعليم: تم ربطه بـ learning_type */}
          <CustomSelect
            label={t('quranic.mode', 'نمط التعليم')}
            value={formData?.learning_type ?? 'online'}
            onChange={(val) => handleChange('learning_type', val)}
            options={educationModeOptions}
          />

          {/* الرواية الافتراضية: تم ربطها بـ default_qiraat */}
          <CustomSelect
            label={t('quranic.riwaya', 'الرواية الافتراضية')}
            value={formData?.default_qiraat ?? 'hafs'}
            onChange={(val) => handleChange('default_qiraat', val)}
            options={riwayaOptions}
            searchable={true}
            placeholder={t('quranic.selectRiwaya', 'اختر الرواية...')}
          />

          {/* المدرسة والمنهجية: تم ربطها بـ teaching_methodology */}
          <CustomSelect
            label={t('quranic.madrasa', 'المدرسة والمنهجية')}
            value={formData?.teaching_methodology ?? 'mashreqi'}
            onChange={(val) => handleChange('teaching_methodology', val)}
            options={madrasaOptions}
          />

          {/* خيارات التسجيل الذاتي والموافقة */}
          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-main)] select-none">
              <input
                type="checkbox"
                checked={Boolean(formData?.allow_self_registration ?? true)}
                onChange={(e) => handleChange('allow_self_registration', e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer"
              />
              <span>{t('quranic.allowSelfReg', 'السماح للطلاب بالتسجيل الذاتي')}</span>
            </label>

            {/* تم تغيير المفتاح إلى require_approval */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-main)] select-none">
              <input
                type="checkbox"
                checked={Boolean(formData?.require_approval ?? true)}
                onChange={(e) => handleChange('require_approval', e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer"
              />
              <span>{t('quranic.requireApproval', 'اشتراط موافقة الإدارة على كل طالب جديد')}</span>
            </label>
          </div>

          {/* الحد الأقصى للطلاب */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('quranic.maxStudents', 'الحد الأقصى للطلاب في الحلقة')}
            </label>
            <input
              type="number"
              value={formData?.max_students_per_group ?? 25}
              onChange={(e) => handleChange('max_students_per_group', Number(e.target.value))}
              className="app-input text-start"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

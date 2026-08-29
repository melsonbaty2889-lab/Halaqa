import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '@/components/UI/CustomSelect.jsx';
import { RIWAYAT_LIST } from '@/constants/riwayat.js';

export default function QuranicPoliciesTab({ formData = {}, updateField }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const handleChange = (field, value) => {
    if (typeof updateField === 'function') {
      updateField(field, value);
    }
  };

  // خيارات نمط التعليم
  const educationModeOptions = useMemo(() => [
  { label: t('quranic.online', isRtl ? 'عن بُعد (Online)' : 'Online'), value: 'online' },
  { label: t('quranic.inPerson', isRtl ? 'حضوري (In-person)' : 'In-Person'), value: 'onsite' },
  { label: t('quranic.hybrid', isRtl ? 'مدمج (Hybrid)' : 'Hybrid'), value: 'hybrid' },
], [t, isRtl]);

  // خيارات الرواية / القراءة - جلب الاسم حسب اللغة الحالية للواجهة
  const riwayaOptions = useMemo(() => {
    if (!Array.isArray(RIWAYAT_LIST)) return [];
    return RIWAYAT_LIST.map((r, index) => {
      if (typeof r === 'string') return { label: r, value: r };
      const rawValue = r?.id ?? r?.value ?? r?.code ?? r?.nameAr ?? index;

      const label = isRtl 
        ? (r?.nameAr || r?.name || r?.label || `رواية ${index + 1}`)
        : (r?.nameEn || r?.name || r?.label || r?.nameAr || `Riwaya ${index + 1}`);

      return { label, value: rawValue };
    });
  }, [isRtl, i18n.language]);

  // خيارات المنهجية والمدرسة
  const madrasaOptions = useMemo(() => [
    { label: t('quranic.madrasaEastern', isRtl ? 'المشرقية (المعتادة)' : 'Mashreqi (Standard)'), value: 'mashreqi' },
    { label: t('quranic.madrasaMaghrebi', isRtl ? 'المغربية' : 'Maghrebi'), value: 'maghrebi' },
  ], [t, i18n.language, isRtl]);

  return (
    <div className="space-y-5 text-start w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="card-surface space-y-4 !overflow-visible border border-[var(--border-card)] p-4 rounded-xl">
        <h3 className="text-xs font-bold text-[var(--primary)] pb-2 border-b border-[var(--border-input)]">
          {t('quranic.title', isRtl ? 'الإعدادات القرآنية والتعليمية' : 'Quranic & Educational Settings')}
        </h3>

        <div className="space-y-3.5">
          {/* نمط التعليم */}
          <CustomSelect
            label={t('quranic.mode', isRtl ? 'نمط التعليم' : 'Learning Mode')}
            value={formData?.learning_type ?? 'online'}
            onChange={(val) => handleChange('learning_type', val)}
            options={educationModeOptions}
          />

          {/* الرواية الافتراضية */}
          <CustomSelect
            label={t('quranic.riwaya', isRtl ? 'الرواية الافتراضية' : 'Default Recitation / Riwaya')}
            value={formData?.default_qiraat ?? 'hafs_an_asem'}
            onChange={(val) => handleChange('default_qiraat', val)}
            options={riwayaOptions}
            searchable={true}
            placeholder={t('quranic.selectRiwaya', isRtl ? 'اختر الرواية...' : 'Select Recitation / Riwaya...')}
          />

          {/* المدرسة والمنهجية */}
          <CustomSelect
            label={t('quranic.madrasa', isRtl ? 'المدرسة والمنهجية' : 'Methodology & School')}
            value={formData?.teaching_methodology ?? 'mashreqi'}
            onChange={(val) => handleChange('teaching_methodology', val)}
            options={madrasaOptions}
          />

          {/* خيارات التسجيل الذاتي والموافقة */}
          <div className="pt-2 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[var(--text-main)] select-none">
              <input
                type="checkbox"
                checked={Boolean(formData?.allow_self_registration ?? true)}
                onChange={(e) => handleChange('allow_self_registration', e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer shrink-0"
              />
              <span>{t('quranic.allowSelfReg', isRtl ? 'السماح للطلاب بالتسجيل الذاتي' : 'Allow Student Self-Registration')}</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[var(--text-main)] select-none">
              <input
                type="checkbox"
                checked={Boolean(formData?.require_approval ?? true)}
                onChange={(e) => handleChange('require_approval', e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer shrink-0"
              />
              <span>{t('quranic.requireApproval', isRtl ? 'اشتراط موافقة الإدارة على كل طالب جديد' : 'Require Admin Approval for New Students')}</span>
            </label>
          </div>

          {/* الحد الأقصى للطلاب */}{/* الحد الأقصى للطلاب */}
<div>
  <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
    {t('quranic.maxStudents', isRtl ? 'الحد الأقصى للطلاب في الحلقة' : 'Max Students per Group')}
  </label>
  <input
    type="number"
    min={1}
    value={formData?.max_students_per_group ?? 25}
    onChange={(e) => handleChange('max_students_per_group', Number(e.target.value))}
    className="app-input w-full text-start"
  />
</div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
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

  // تحضير خيارات نمط التعليم
  const educationModeOptions = [
    { label: t('quranic.modeOnline', 'عن بعد (Online)'), value: 'online' },
    { label: t('quranic.modeOnsite', 'حضوري (In-person)'), value: 'onsite' },
    { label: t('quranic.modeHybrid', 'مختلط (Hybrid)'), value: 'hybrid' },
  ];

  // تحضير قائمة الروايات الكاملة من ملف riwayat.js
  const riwayaOptions = (RIWAYAT_LIST || []).map((r) => ({
    label: r.nameAr,
    value: r.id,
  }));

  // تحضير خيارات المنهجية
  const madrasaOptions = [
    { label: t('quranic.madrasaEastern', 'المشرقية (المعتادة)'), value: 'eastern' },
    { label: t('quranic.madrasaMaghrebi', 'المغربية'), value: 'maghrebi' },
  ];

  return (
    <div className="space-y-5 text-start">
      <div className="card-surface space-y-4">
        <h3 className="text-xs font-bold text-[var(--primary)] pb-2 border-b border-[var(--border-input)]">
          {t('quranic.title', 'الإعدادات القرآنية والتعليمية')}
        </h3>

        <div className="space-y-3.5">
          {/* نمط التعليم */}
          <CustomSelect
            label={t('quranic.mode', 'نمط التعليم')}
            value={formData?.education_mode || 'online'}
            onChange={(val) => handleChange('education_mode', val)}
            options={educationModeOptions}
          />

          {/* الرواية الافتراضية مع دعم البحث وجميع الروايات العشر */}
          <CustomSelect
            label={t('quranic.riwaya', 'الرواية الافتراضية')}
            value={formData?.default_riwaya || 'hafs_an_asem'}
            onChange={(val) => handleChange('default_riwaya', val)}
            options={riwayaOptions}
            searchable={true}
            placeholder={t('quranic.selectRiwaya', 'اختر الرواية...')}
          />

          {/* المدرسة والمنهجية */}
          <CustomSelect
            label={t('quranic.madrasa', 'المدرسة والمنهجية')}
            value={formData?.madrasa_type || 'eastern'}
            onChange={(val) => handleChange('madrasa_type', val)}
            options={madrasaOptions}
          />

          {/* خيارات التسجيل الذاتي والموافقة */}
          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-main)]">
              <input
                type="checkbox"
                checked={formData?.allow_self_registration ?? true}
                onChange={(e) => handleChange('allow_self_registration', e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer"
              />
              <span>{t('quranic.allowSelfReg', 'السماح للطلاب بالتسجيل الذاتي')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-main)]">
              <input
                type="checkbox"
                checked={formData?.require_admin_approval ?? true}
                onChange={(e) => handleChange('require_admin_approval', e.target.checked)}
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
              value={formData?.max_students_per_group || 25}
              onChange={(e) => handleChange('max_students_per_group', Number(e.target.value))}
              className="app-input text-start"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

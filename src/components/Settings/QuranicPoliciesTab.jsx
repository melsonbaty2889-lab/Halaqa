import React from 'react';
import { useTranslation } from 'react-i18next';

export default function QuranicPoliciesTab({ formData = {}, updateField }) {
  const { t } = useTranslation();

  const handleChange = (field, value) => {
    if (typeof updateField === 'function') {
      updateField(field, value);
    }
  };

  return (
    <div className="space-y-5 text-start">
      <div className="card-surface space-y-4">
        <h3 className="text-xs font-bold text-[var(--primary)] pb-2 border-b border-[var(--border-input)]">
          {t('quranic.title', 'الإعدادات القرآنية والتعليمية')}
        </h3>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('quranic.mode', 'نمط التعليم')}
            </label>
            <select
              value={formData?.education_mode || 'online'}
              onChange={(e) => handleChange('education_mode', e.target.value)}
              className="app-input text-start cursor-pointer"
            >
              <option value="online">عن بعد (Online)</option>
              <option value="onsite">حضوري (In-person)</option>
              <option value="hybrid">مختلط (Hybrid)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('quranic.riwaya', 'الرواية الافتراضية')}
            </label>
            <select
              value={formData?.default_riwaya || 'hafs'}
              onChange={(e) => handleChange('default_riwaya', e.target.value)}
              className="app-input text-start cursor-pointer"
            >
              <option value="hafs">حفص عن عاصم</option>
              <option value="warsh">ورش عن نافع</option>
              <option value="qaloon">قالون عن نافع</option>
              <option value="alduri">الدوري عن أبي عمرو</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('quranic.madrasa', 'المدرسة والمنهجية')}
            </label>
            <select
              value={formData?.madrasa_type || 'eastern'}
              onChange={(e) => handleChange('madrasa_type', e.target.value)}
              className="app-input text-start cursor-pointer"
            >
              <option value="eastern">المشرقية (المعتادة)</option>
              <option value="maghrebi">المغربية</option>
            </select>
          </div>

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

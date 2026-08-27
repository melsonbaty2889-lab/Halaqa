import React from 'react';
import { useTranslation } from 'react-i18next';

export default function QuranicPoliciesTab({ formData = {}, updateField }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface)] space-y-4">
        <h3 className="text-xs font-bold text-[var(--primary)] border-b border-[var(--border-light)] pb-2">
          {t('settings.quranicSetup', 'الإعدادات القرآنية والتعليمية')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.learningType', 'نمط التعليم')}
            </label>
            <select
              value={formData.learning_type || 'online'}
              onChange={(e) => updateField('learning_type', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
            >
              <option value="online">عن بعد (Online)</option>
              <option value="in_person">حضوري (In-Person)</option>
              <option value="hybrid">مدمج (Hybrid)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.defaultQiraat', 'الرواية الافتراضية')}
            </label>
            <select
              value={formData.default_qiraat || 'hafs'}
              onChange={(e) => updateField('default_qiraat', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
            >
              <option value="hafs">حفص عن عاصم</option>
              <option value="warsh">ورش عن نافع</option>
              <option value="qaloon">قالون عن نافع</option>
              <option value="mutawatir">السبع / العشر المتواترة</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.teachingMethod', 'المدرسة والمنهجية')}
            </label>
            <select
              value={formData.teaching_methodology || 'mashreqi'}
              onChange={(e) => updateField('teaching_methodology', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
            >
              <option value="mashreqi">المشرقية (المعتادة)</option>
              <option value="maghrebi">المغربية</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allow_self_registration ?? true}
              onChange={(e) => updateField('allow_self_registration', e.target.checked)}
              className="rounded accent-[var(--primary)] w-4 h-4"
            />
            <span className="text-xs font-bold text-[var(--text-main)]">
              {t('settings.allowSelfReg', 'السماح للطلاب بالتسجيل الذاتي')}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.require_admin_approval ?? true}
              onChange={(e) => updateField('require_admin_approval', e.target.checked)}
              className="rounded accent-[var(--primary)] w-4 h-4"
            />
            <span className="text-xs font-bold text-[var(--text-main)]">
              {t('settings.requireApproval', 'اشتراط موافقة الإدارة على طالب جديد')}
            </span>
          </label>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
            {t('settings.maxStudentsPerCircle', 'الحد الأقصى للطلاب في الحلقة')}
          </label>
          <input
            type="number"
            value={formData.max_students_per_circle || 25}
            onChange={(e) => updateField('max_students_per_circle', parseInt(e.target.value, 10) || 0)}
            className="w-full md:w-1/3 text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
          />
        </div>
      </div>
    </div>
  );
}

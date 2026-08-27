import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ContactRegionalTab({ formData = {}, updateField }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.email', 'البريد الإلكتروني الرسمى')}
            </label>
            <input
              type="email"
              value={formData.contact_email || ''}
              onChange={(e) => updateField('contact_email', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.phone', 'الهاتف / الواتساب')}
            </label>
            <input
              type="text"
              value={formData.contact_phone || ''}
              onChange={(e) => updateField('contact_phone', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.country', 'الدولة')}
            </label>
            <select
              value={formData.country || 'Egypt'}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
            >
              <option value="Egypt">مصر</option>
              <option value="Saudi Arabia">السعودية</option>
              <option value="UAE">الإمارات</option>
              <option value="Kuwait">الكويت</option>
              <option value="Qatar">قطر</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.currency', 'العملة الرسمية')}
            </label>
            <select
              value={formData.currency || 'EGP'}
              onChange={(e) => updateField('currency', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
            >
              <option value="EGP">جنيه مصري (EGP) - ج.م</option>
              <option value="SAR">ريال سعودي (SAR) - ر.س</option>
              <option value="AED">درهم إماراتي (AED) - د.إ</option>
              <option value="KWD">دينار كويتي (KWD) - د.ك</option>
              <option value="QAR">ريال قطري (QAR) - ر.ق</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

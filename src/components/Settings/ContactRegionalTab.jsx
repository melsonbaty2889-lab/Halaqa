import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Select } from '@/components/UI/UI.jsx';
import { COUNTRIES_LIST } from '@/constants/countries.js'; // مسار ملف الدول
import { CURRENCIES } from '@/constants/currencies.js';    // مسار ملف العملات

export default function ContactRegionalTab({ formData, updateField, isRtl }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 1. تجهيز قائمة الدول من الملف المستورد
  const countryOptions = COUNTRIES_LIST.map(country => ({
    label: `${country.flag} ${isRtl ? country.nameAr : country.nameEn}`,
    value: country.code
  }));

  // 2. تجهيز قائمة العملات من الملف المستورد
  const currencyOptions = CURRENCIES.map(currency => ({
    label: `${isRtl ? currency.nameAr : currency.nameEn} (${currency.code}) - ${currency.symbol}`,
    value: currency.code
  }));

  // 3. القوائم المحلية (بما أن التوقيتات مجمعة بشكل محدد)
  const timezoneOptions = [
    { label: isRtl ? 'القاهرة (GMT+2 / GMT+3)' : 'Cairo (GMT+2/3)', value: 'Africa/Cairo' },
    { label: isRtl ? 'مكة المكرمة / الرياض (GMT+3)' : 'Makkah / Riyadh (GMT+3)', value: 'Asia/Riyadh' },
    { label: isRtl ? 'دبي (GMT+4)' : 'Dubai (GMT+4)', value: 'Asia/Dubai' },
    { label: isRtl ? 'جرينتش / التوقيت العالمي (UTC+0)' : 'UTC / London (GMT+0)', value: 'UTC' },
    { label: isRtl ? 'أوروبا الوسطى / برلين (GMT+1)' : 'Central Europe / Berlin (GMT+1)', value: 'Europe/Berlin' },
    { label: isRtl ? 'التوقيت الشرقي - أمريكا (EST/EDT GMT-5)' : 'US Eastern Time (GMT-5)', value: 'America/New_York' },
    { label: isRtl ? 'جاكرتا (GMT+7)' : 'Jakarta (GMT+7)', value: 'Asia/Jakarta' }
  ];

  const daysList = [
    { key: 'saturday', label: isRtl ? 'السبت' : 'Saturday' },
    { key: 'sunday', label: isRtl ? 'الأحد' : 'Sunday' },
    { key: 'monday', label: isRtl ? 'الإثنين' : 'Monday' },
    { key: 'tuesday', label: isRtl ? 'الثلاثاء' : 'Tuesday' },
    { key: 'wednesday', label: isRtl ? 'الأربعاء' : 'Wednesday' },
    { key: 'thursday', label: isRtl ? 'الخميس' : 'Thursday' },
    { key: 'friday', label: isRtl ? 'الجمعة' : 'Friday' }
  ];

  const toggleWeekendDay = (dayKey) => {
    const days = Array.isArray(formData.weekend_days) ? formData.weekend_days : [];
    const updated = days.includes(dayKey) 
      ? days.filter(d => d !== dayKey) 
      : [...days, dayKey];
    updateField('weekend_days', updated);
  };

  return (
    <div className="space-y-5 text-start">
      <div className="bg-[var(--surface-card)] p-4 rounded-xl border border-[var(--border-light)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {isRtl ? 'البريد الإلكتروني الرسمي' : 'Official Email'}
            </label>
            <input 
              type="email" 
              value={formData.contact_email} 
              onChange={(e) => updateField('contact_email', e.target.value)} 
              className="app-input text-start dir-ltr" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {isRtl ? 'الهاتف / الواتساب' : 'Phone / WhatsApp'}
            </label>
            <input 
              type="text" 
              value={formData.contact_phone} 
              onChange={(e) => updateField('contact_phone', e.target.value)} 
              className="app-input text-start dir-ltr" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select 
            label={isRtl ? 'الدولة' : 'Country'}
            value={formData.country_code}
            onChange={(e) => updateField('country_code', e.target.value)}
            options={countryOptions}
          />

          <Select 
            label={isRtl ? 'العملة الرسمية' : 'Currency'}
            value={formData.currency}
            onChange={(e) => updateField('currency', e.target.value)}
            options={currencyOptions}
          />
        </div>
      </div>

      <div className="border border-[var(--border-light)] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-3 bg-[var(--surface-card)] hover:bg-[var(--surface-input)] transition-colors flex items-center justify-between text-xs font-bold text-[var(--text-muted)] border-none cursor-pointer"
        >
          <span>{isRtl ? 'إعدادات إقليمية متقدمة' : 'Advanced Regional Settings'}</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="p-4 bg-[var(--surface-card)] border-t border-[var(--border-light)] space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">
                {isRtl ? 'الموقع الإلكتروني' : 'Website'}
              </label>
              <input 
                type="url" 
                value={formData.website} 
                onChange={(e) => updateField('website', e.target.value)} 
                className="app-input text-start dir-ltr text-xs" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select 
                label={isRtl ? 'المنطقة الزمنية' : 'Timezone'}
                value={formData.timezone}
                onChange={(e) => updateField('timezone', e.target.value)}
                options={timezoneOptions}
              />

              <Select 
                label={isRtl ? 'نوع التقويم' : 'Calendar Type'}
                value={formData.calendar_type}
                onChange={(e) => updateField('calendar_type', e.target.value)}
                options={[
                  { label: isRtl ? 'ميلادي' : 'Gregorian', value: 'gregorian' },
                  { label: isRtl ? 'هجري' : 'Hijri', value: 'hijri' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-[var(--text-muted)]">
                {isRtl ? 'أيام العطلة الأسبوعية' : 'Weekend Days'}
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {daysList.map((day) => {
                  const active = (formData.weekend_days || []).includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleWeekendDay(day.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        active ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

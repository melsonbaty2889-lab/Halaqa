import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '@/components/UI/CustomSelect.jsx';
import { COUNTRIES_LIST } from '@/constants/countries.js';
import { CURRENCIES } from '@/constants/currencies.js';

export default function ContactRegionalTab({ formData = {}, updateField }) {
  const { t, i18n } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isAr = i18n.language === 'ar';

  // تحضير خيارات الدول
  const countryOptions = (COUNTRIES_LIST || []).map(country => ({
    label: `${country.flag} ${isAr ? country.nameAr : country.nameEn}`,
    value: country.code
  }));

  // تحضير خيارات العملات
  const currencyOptions = (CURRENCIES || []).map(currency => ({
    label: `${isAr ? currency.nameAr : currency.nameEn} (${currency.code}) - ${currency.symbol}`,
    value: currency.code
  }));

  // تحضير خيارات المناطق الزمنية
  const timezoneOptions = [
    { label: t('timezones.cairo', 'القاهرة (GMT+2 / GMT+3)'), value: 'Africa/Cairo' },
    { label: t('timezones.riyadh', 'مكة المكرمة / الرياض (GMT+3)'), value: 'Asia/Riyadh' },
    { label: t('timezones.dubai', 'دبي (GMT+4)'), value: 'Asia/Dubai' },
    { label: t('timezones.utc', 'جرينتش / التوقيت العالمي (UTC+0)'), value: 'UTC' },
    { label: t('timezones.berlin', 'أوروبا الوسطى / برلين (GMT+1)'), value: 'Europe/Berlin' },
    { label: t('timezones.ny', 'التوقيت الشرقي - أمريكا (EST/EDT GMT-5)'), value: 'America/New_York' },
    { label: t('timezones.jakarta', 'جاكرتا (GMT+7)'), value: 'Asia/Jakarta' }
  ];

  // تحضير خيارات نوع التقويم
  const calendarOptions = [
    { label: t('calendar.gregorian', 'ميلادي'), value: 'gregorian' },
    { label: t('calendar.hijri', 'هجري'), value: 'hijri' }
  ];

  const daysList = [
    { key: 'saturday', label: t('days.saturday', 'السبت') },
    { key: 'sunday', label: t('days.sunday', 'الأحد') },
    { key: 'monday', label: t('days.monday', 'الإثنين') },
    { key: 'tuesday', label: t('days.tuesday', 'الثلاثاء') },
    { key: 'wednesday', label: t('days.wednesday', 'الأربعاء') },
    { key: 'thursday', label: t('days.thursday', 'الخميس') },
    { key: 'friday', label: t('days.friday', 'الجمعة') }
  ];

  // ربط الدولة بالعملة والمنطقة الزمنية تلقائياً عند التغيير
  const handleCountryChange = (countryCode) => {
    updateField('country_code', countryCode);
    
    const matchedCountry = COUNTRIES_LIST.find(c => c.code === countryCode);
    if (matchedCountry?.timezone) {
      updateField('timezone', matchedCountry.timezone);
    }
    
    const matchedCurrency = CURRENCIES.find(c => c.countryCode === countryCode);
    if (matchedCurrency?.code) {
      updateField('currency', matchedCurrency.code);
    }
  };

  const toggleWeekendDay = (dayKey) => {
    const days = Array.isArray(formData?.weekend_days) ? formData.weekend_days : [];
    const updated = days.includes(dayKey) 
      ? days.filter(d => d !== dayKey) 
      : [...days, dayKey];
    updateField('weekend_days', updated);
  };

  return (
    <div className="space-y-5 text-start">
      {/* القسم الرئيسي: بيانات التواصل والدولة */}
      <div className="card-surface space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('settings.officialEmail', 'البريد الإلكتروني الرسمي')}
            </label>
            <input 
              type="email" 
              value={formData?.contact_email || ''} 
              onChange={(e) => updateField('contact_email', e.target.value)} 
              className="app-input text-start dir-ltr" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('settings.phoneWhatsapp', 'الهاتف / الواتساب')}
            </label>
            <input 
              type="text" 
              value={formData?.contact_phone || ''} 
              onChange={(e) => updateField('contact_phone', e.target.value)} 
              className="app-input text-start dir-ltr" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <CustomSelect 
            label={t('settings.country', 'الدولة')}
            value={formData?.country_code || 'EG'}
            onChange={handleCountryChange}
            options={countryOptions}
            searchable={true}
          />

          <CustomSelect 
            label={t('settings.currency', 'العملة الرسمية')}
            value={formData?.currency || 'EGP'}
            onChange={(val) => updateField('currency', val)}
            options={currencyOptions}
            searchable={true}
          />
        </div>
      </div>

      {/* القسم المتقدم: الإعدادات الإقليمية */}
      <div className="card-surface p-0 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 bg-transparent hover:bg-[var(--surface-input)] transition-colors flex items-center justify-between text-xs font-bold text-[var(--text-sub)] border-none cursor-pointer"
        >
          <span>{t('settings.advancedRegional', 'إعدادات إقليمية متقدمة')}</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="p-4 border-t border-[var(--border-card)] space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
                {t('settings.website', 'الموقع الإلكتروني')}
              </label>
              <input 
                type="url" 
                value={formData?.website || ''} 
                onChange={(e) => updateField('website', e.target.value)} 
                className="app-input text-start dir-ltr text-xs" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <CustomSelect 
                label={t('settings.timezone', 'المنطقة الزمنية')}
                value={formData?.timezone || 'Africa/Cairo'}
                onChange={(val) => updateField('timezone', val)}
                options={timezoneOptions}
                searchable={true}
              />

              <CustomSelect 
                label={t('settings.calendarType', 'نوع التقويم')}
                value={formData?.calendar_type || 'gregorian'}
                onChange={(val) => updateField('calendar_type', val)}
                options={calendarOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-[var(--text-main)]">
                {t('settings.weekendDays', 'أيام العطلة الأسبوعية')}
              </label>
              <div className="flex flex-wrap gap-2">
                {daysList.map((day) => {
                  const active = (formData?.weekend_days || []).includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleWeekendDay(day.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        active 
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-[var(--primary-glow)]' 
                          : 'bg-[var(--surface-input)] text-[var(--text-sub)] border-[var(--border-input)] hover:text-[var(--text-main)]'
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

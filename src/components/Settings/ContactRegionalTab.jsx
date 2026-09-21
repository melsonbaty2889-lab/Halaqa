// src/components/Settings/ContactRegionalTab.jsx

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Select from '@/components/UI/Select';
import { COUNTRIES_LIST } from '@/constants/countries';
import { CURRENCIES } from '@/constants/currencies';

export default function ContactRegionalTab({ formData = {}, updateField }) {
  const { t, i18n } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';
  const isAr = i18n.language === 'ar';

  // تحضير وتثبيت خيارات الدول
  const countryOptions = useMemo(() => {
    return (COUNTRIES_LIST || []).map(country => ({
      label: `${country.flag} ${isAr ? country.nameAr : country.nameEn}`,
      value: country.code
    }));
  }, [isAr]);

  // تحضير وتثبيت خيارات العملات
  const currencyOptions = useMemo(() => {
    return (CURRENCIES || []).map(currency => ({
      label: `${isAr ? currency.nameAr : currency.nameEn} (${currency.code}) - ${currency.symbol}`,
      value: currency.code
    }));
  }, [isAr]);

  // تحضير وتثبيت خيارات المناطق الزمنية
  const timezoneOptions = useMemo(() => [
    { label: t('timezones.cairo', isRtl ? 'القاهرة (GMT+2 / GMT+3)' : 'Cairo (GMT+2 / GMT+3)'), value: 'Africa/Cairo' },
    { label: t('timezones.riyadh', isRtl ? 'مكة المكرمة / الرياض (GMT+3)' : 'Riyadh / Mecca (GMT+3)'), value: 'Asia/Riyadh' },
    { label: t('timezones.dubai', isRtl ? 'دبي (GMT+4)' : 'Dubai (GMT+4)'), value: 'Asia/Dubai' },
    { label: t('timezones.utc', isRtl ? 'جرينتش / التوقيت العالمي (UTC+0)' : 'Greenwich / UTC (UTC+0)'), value: 'UTC' },
    { label: t('timezones.berlin', isRtl ? 'أوروبا الوسطى / برلين (GMT+1)' : 'Central Europe / Berlin (GMT+1)'), value: 'Europe/Berlin' },
    { label: t('timezones.ny', isRtl ? 'التوقيت الشرقي - أمريكا (EST/EDT GMT-5)' : 'Eastern Time - US (EST/EDT GMT-5)'), value: 'America/New_York' },
    { label: t('timezones.jakarta', isRtl ? 'جاكرتا (GMT+7)' : 'Jakarta (GMT+7)'), value: 'Asia/Jakarta' }
  ], [t, i18n.language, isRtl]);

  // تحضير خيارات نوع التقويم
  const calendarOptions = useMemo(() => [
    { label: t('calendar.gregorian', isRtl ? 'ميلادي' : 'Gregorian'), value: 'gregorian' },
    { label: t('calendar.hijri', isRtl ? 'هجري' : 'Hijri'), value: 'hijri' }
  ], [t, isRtl]);

  const daysList = useMemo(() => [
    { key: 'saturday', label: t('days.saturday', isRtl ? 'السبت' : 'Saturday') },
    { key: 'sunday', label: t('days.sunday', isRtl ? 'الأحد' : 'Sunday') },
    { key: 'monday', label: t('days.monday', isRtl ? 'الإثنين' : 'Monday') },
    { key: 'tuesday', label: t('days.tuesday', isRtl ? 'الثلاثاء' : 'Tuesday') },
    { key: 'wednesday', label: t('days.wednesday', isRtl ? 'الأربعاء' : 'Wednesday') },
    { key: 'thursday', label: t('days.thursday', isRtl ? 'الخميس' : 'Thursday') },
    { key: 'friday', label: t('days.friday', isRtl ? 'الجمعة' : 'Friday') }
  ], [t, i18n.language, isRtl]);

  // ربط الدولة بالعملة والمنطقة الزمنية تلقائياً عند التغيير
  const handleCountryChange = (countryCode) => {
    if (typeof updateField !== 'function') return;

    updateField('country_code', countryCode);
    
    const matchedCountry = (COUNTRIES_LIST || []).find(c => c.code === countryCode);
    if (matchedCountry?.timezone) {
      updateField('timezone', matchedCountry.timezone);
    }
    
    const matchedCurrency = (CURRENCIES || []).find(c => c.countryCode === countryCode);
    if (matchedCurrency?.code) {
      updateField('currency', matchedCurrency.code);
    }
  };

  // معالجة اختيار وإلغاء أيام العطلة
  const toggleWeekendDay = (dayKey) => {
    if (typeof updateField !== 'function') return;

    let currentDays = [];
    if (Array.isArray(formData?.weekend_days)) {
      currentDays = formData.weekend_days;
    } else if (typeof formData?.weekend_days === 'string') {
      try {
        currentDays = JSON.parse(formData.weekend_days);
      } catch {
        currentDays = [];
      }
    }

    const updated = currentDays.includes(dayKey)
      ? currentDays.filter(d => d !== dayKey)
      : [...currentDays, dayKey];

    updateField('weekend_days', updated);
  };

  // استخراج الأيام المختارة لعرضها
  const selectedWeekendDays = useMemo(() => {
    if (Array.isArray(formData?.weekend_days)) return formData.weekend_days;
    if (typeof formData?.weekend_days === 'string') {
      try { return JSON.parse(formData.weekend_days); } catch { return []; }
    }
    return [];
  }, [formData?.weekend_days]);

  return (
    <div className="space-y-5 text-start w-full text-semantic-textPrimary" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* القسم الرئيسي: بيانات التواصل والدولة */}
      <div className="bg-semantic-surfaceCard space-y-4 !overflow-visible w-full border border-semantic-borderCard p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-semantic-textPrimary">
              {t('settings.officialEmail', isRtl ? 'البريد الإلكتروني الرسمي' : 'Official Email')}
            </label>
            <input 
              type="email" 
              value={formData?.contact_email ?? ''} 
              onChange={(e) => updateField && updateField('contact_email', e.target.value)} 
              dir="ltr"
              className="w-full px-3 py-2 bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl text-semantic-textPrimary text-xs focus:outline-none focus:border-semantic-actionPrimary transition-colors" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-semantic-textPrimary">
              {t('settings.phoneWhatsapp', isRtl ? 'الهاتف / الواتساب' : 'Phone / WhatsApp')}
            </label>
            <input 
              type="text" 
              value={formData?.contact_phone ?? ''} 
              onChange={(e) => updateField && updateField('contact_phone', e.target.value)} 
              dir="ltr"
              className="w-full px-3 py-2 bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl text-semantic-textPrimary text-xs focus:outline-none focus:border-semantic-actionPrimary transition-colors" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 !overflow-visible">
          <Select 
            label={t('settings.country', isRtl ? 'الدولة' : 'Country')}
            value={formData?.country_code ?? 'EG'}
            onChange={handleCountryChange}
            options={countryOptions}
            searchable={true}
          />

          <Select 
            label={t('settings.currency', isRtl ? 'العملة الرسمية' : 'Official Currency')}
            value={formData?.currency ?? 'EGP'}
            onChange={(val) => updateField && updateField('currency', val)}
            options={currencyOptions}
            searchable={true}
          />
        </div>
      </div>

      {/* القسم المتقدم: الإعدادات الإقليمية */}
      <div className="bg-semantic-surfaceCard p-0 !overflow-visible border border-semantic-borderCard rounded-xl w-full shadow-sm">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 bg-transparent hover:bg-semantic-surfaceInput transition-colors flex items-center justify-between text-xs font-bold text-semantic-textSecondary border-none cursor-pointer rounded-xl"
        >
          <div className="flex items-center gap-2">
            <span>{t('settings.advancedRegional', isRtl ? 'إعدادات إقليمية متقدمة' : 'Advanced Regional Settings')}</span>
            {selectedWeekendDays.length > 0 && (
              <span className="text-[10px] bg-semantic-actionPrimary/10 text-semantic-actionPrimary px-2 py-0.5 rounded-full font-bold">
                {selectedWeekendDays.length} {isRtl ? 'أيام عطلة' : 'weekend days'}
              </span>
            )}
          </div>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="p-4 border-t border-semantic-borderCard space-y-4 !overflow-visible w-full">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-semantic-textPrimary">
                {t('settings.website', isRtl ? 'الموقع الإلكتروني' : 'Website')}
              </label>
              <input 
                type="url" 
                value={formData?.website ?? ''} 
                onChange={(e) => updateField && updateField('website', e.target.value)} 
                dir="ltr"
                className="w-full px-3 py-2 bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl text-semantic-textPrimary text-xs focus:outline-none focus:border-semantic-actionPrimary transition-colors" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 !overflow-visible">
              <Select 
                label={t('settings.timezone', isRtl ? 'المنطقة الزمنية' : 'Timezone')}
                value={formData?.timezone ?? 'Africa/Cairo'}
                onChange={(val) => updateField && updateField('timezone', val)}
                options={timezoneOptions}
                searchable={true}
              />

              <Select 
                label={t('settings.calendarType', isRtl ? 'نوع التقويم' : 'Calendar Type')}
                value={formData?.calendar_type ?? 'gregorian'}
                onChange={(val) => updateField && updateField('calendar_type', val)}
                options={calendarOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-semantic-textPrimary">
                {t('settings.weekendDays', isRtl ? 'أيام العطلة الأسبوعية' : 'Weekend Days')}
              </label>
              <div className="flex flex-wrap gap-2">
                {daysList.map((day) => {
                  const active = selectedWeekendDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleWeekendDay(day.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        active 
                          ? 'bg-semantic-actionPrimary text-white border-semantic-actionPrimary shadow-md' 
                          : 'bg-semantic-surfaceInput text-semantic-textSecondary border-semantic-borderInput hover:text-semantic-textPrimary'
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

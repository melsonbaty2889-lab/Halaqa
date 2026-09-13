import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { C } from '@/theme/colors';
import { useCreateAcademy } from '@/hooks/useCreateAcademy';
import CustomSelect from '@/components/UI/CustomSelect.jsx';
import { COUNTRIES_LIST } from '@/constants/countries.js';
import { CURRENCIES } from '@/constants/currencies.js';

import { Building2, Check, Loader2, AlertCircle, CheckCircle2, Globe, Mail, Phone } from 'lucide-react';

export default function CreateAcademy({ onSubmitAcademy }) {
  const { t, i18n } = useTranslation();
  
  // تحديد اللغة والاتجاه التلقائي
  const currentLang = i18n?.language?.split('-')[0] || 'ar';
  const rtlLanguages = ['ar', 'ur'];
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : rtlLanguages.includes(currentLang);
  const isAr = currentLang === 'ar';

  // ترجمة اسم المنصة الفرعي للعرض أسفل اللوجو
  const appSubtitleMap = {
    ar: 'الحلقة الذكية',
    en: 'Smart Halaqa',
    fr: 'Halaqa Intelligente',
    tr: 'Akıllı Halka',
    ur: 'اسمارٹ حلقہ',
    id: 'Halaqa Pintar'
  };
  const appSubtitle = appSubtitleMap[currentLang] || appSubtitleMap.ar;

  // حالة البيانات الأساسية المطلوبة للتأسيس
  const [academyData, setAcademyData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    country_code: 'EG',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    calendar_type: 'gregorian'
  });

  const updateField = (field, value) => {
    setAcademyData(prev => ({ ...prev, [field]: value }));
  };

  const {
    isSubmitting,
    isSuccess,
    errorMsg,
    handleSubmit: submitHookHandler
  } = useCreateAcademy((data) => {
    if (typeof onSubmitAcademy === 'function') {
      onSubmitAcademy({
        ...data,
        ...academyData,
        // هيكلة الاسم الداعمة لجميع اللغات الست المعتمدة
        name: { 
          ar: academyData.name, 
          en: academyData.name, 
          tr: academyData.name, 
          fr: academyData.name, 
          ur: academyData.name, 
          id: academyData.name 
        }
      });
    }
  });

  // تحضير خيارات الدول
  const countryOptions = useMemo(() => {
    return (COUNTRIES_LIST || []).map(country => ({
      label: `${country.flag} ${isAr ? country.nameAr : country.nameEn}`,
      value: country.code
    }));
  }, [isAr]);

  // تحضير خيارات العملات
  const currencyOptions = useMemo(() => {
    return (CURRENCIES || []).map(currency => ({
      label: `${isAr ? currency.nameAr : currency.nameEn} (${currency.code}) - ${currency.symbol}`,
      value: currency.code
    }));
  }, [isAr]);

  // خيارات المناطق الزمنية مع الترجمة والتوافق
  const timezoneOptions = useMemo(() => [
    { label: isRtl ? 'القاهرة (GMT+2 / GMT+3)' : 'Cairo (GMT+2 / GMT+3)', value: 'Africa/Cairo' },
    { label: isRtl ? 'مكة المكرمة / الرياض (GMT+3)' : 'Riyadh / Mecca (GMT+3)', value: 'Asia/Riyadh' },
    { label: isRtl ? 'دبي (GMT+4)' : 'Dubai (GMT+4)', value: 'Asia/Dubai' },
    { label: isRtl ? 'جرينتش / التوقيت العالمي (UTC+0)' : 'Greenwich / UTC (UTC+0)', value: 'UTC' }
  ], [isRtl]);

  // خيارات التقويم
  const calendarOptions = useMemo(() => [
    { label: t('calendar.gregorian', isRtl ? 'ميلادي' : 'Gregorian'), value: 'gregorian' },
    { label: t('calendar.hijri', isRtl ? 'هجري' : 'Hijri'), value: 'hijri' }
  ], [isRtl, t]);

  // ربط الدولة بالعملة والمنطقة الزمنية تلقائياً
  const handleCountryChange = (countryCode) => {
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

  // توليد معاينة الرابط الفورية
  const generateSlugPreview = (name) => {
    if (!name) return 'academy-name';
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0621-\u064A\-]+/g, '')
      .slice(0, 30);
  };

  if (isSuccess) {
    return (
      <AuthLayout 
        langBtn={<LanguageSwitcher />}
        subtitle={appSubtitle}
      >
        <div className="flex flex-col items-center justify-center py-6 text-center animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border shadow-lg bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-base font-bold mb-1" style={{ color: C?.text?.title }}>
            {t('academy.created_success', 'تم إنشاء الأكاديمية بنجاح!')}
          </h2>
          <p className="text-xs font-medium" style={{ color: C?.text?.muted }}>
            {t('common.preparing_dashboard', 'جاري تجهيز لوحة التحكم...')}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      langBtn={<LanguageSwitcher />}
      subtitle={appSubtitle}
    >
      <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center mb-4 text-center">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mb-1" style={{ color: C?.text?.title }}>
            {t('academy.create_title', 'إنشاء أكاديمية جديدة')}
          </h2>
          <p className="text-xs font-medium leading-relaxed max-w-xs mx-auto m-0" style={{ color: C?.text?.muted }}>
            {t('academy.create_subtitle', 'قم بإدخال البيانات الأساسية لتأسيس المقرأة أو الأكاديمية')}
          </p>
        </div>

        {errorMsg && (
          <div 
            className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs border transition-all"
            role="alert"
            style={{ 
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              borderColor: C?.error?.DEFAULT || '#EF4444',
              color: C?.error?.DEFAULT || '#EF4444'
            }}
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          submitHookHandler(e);
        }} className="space-y-3.5 animate-fadeIn" noValidate>
          
          {/* اسم الأكاديمية */}
          <div className="space-y-1">
            <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: C?.text?.body }}>
              <Building2 size={13} style={{ color: C?.amber?.DEFAULT }} />
              <span>{t('academy.name', 'اسم الأكاديمية')} *</span>
            </label>
            <input
              type="text"
              value={academyData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('academy.name_placeholder', 'أدخل اسم الأكاديمية')}
              className="w-full px-3.5 min-h-[44px] text-xs rounded-xl border outline-none transition-all text-start"
              style={{ 
                backgroundColor: C?.inputs?.bg, 
                borderColor: C?.inputs?.border,
                color: C?.text?.title
              }}
              required
              autoFocus
            />
            <div className="flex items-center gap-1.5 px-1 pt-0.5 text-[10px] font-mono tracking-tight opacity-75" style={{ color: C?.text?.muted }}>
              <Globe size={11} style={{ color: C?.amber?.DEFAULT }} />
              <span className="truncate" dir="ltr">
                {window.location.host}/{generateSlugPreview(academyData.name)}
              </span>
            </div>
          </div>

          {/* البريد الإلكتروني والهاتف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: C?.text?.body }}>
                <Mail size={13} style={{ color: C?.amber?.DEFAULT }} />
                <span>{t('settings.officialEmail', 'البريد الرسمي')}</span>
              </label>
              <input 
                type="email" 
                value={academyData.contact_email} 
                onChange={(e) => updateField('contact_email', e.target.value)} 
                dir="ltr"
                placeholder="admin@academy.com"
                className="w-full px-3 min-h-[44px] text-xs rounded-xl border outline-none transition-all font-sans text-start"
                style={{ backgroundColor: C?.inputs?.bg, borderColor: C?.inputs?.border, color: C?.text?.title }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: C?.text?.body }}>
                <Phone size={13} style={{ color: C?.amber?.DEFAULT }} />
                <span>{t('settings.phoneWhatsapp', 'الهاتف / الواتساب')}</span>
              </label>
              <input 
                type="text" 
                value={academyData.contact_phone} 
                onChange={(e) => updateField('contact_phone', e.target.value)} 
                dir="ltr"
                placeholder="+20..."
                className="w-full px-3 min-h-[44px] text-xs rounded-xl border outline-none transition-all font-sans text-start"
                style={{ backgroundColor: C?.inputs?.bg, borderColor: C?.inputs?.border, color: C?.text?.title }}
              />
            </div>
          </div>

          {/* الدولة والعملة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 !overflow-visible">
            <CustomSelect 
              label={t('settings.country', 'الدولة')}
              value={academyData.country_code}
              onChange={handleCountryChange}
              options={countryOptions}
              searchable={true}
            />
            <CustomSelect 
              label={t('settings.currency', 'العملة الرسمية')}
              value={academyData.currency}
              onChange={(val) => updateField('currency', val)}
              options={currencyOptions}
              searchable={true}
            />
          </div>

          {/* المنطقة الزمنية والتقويم */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 !overflow-visible">
            <CustomSelect 
              label={t('settings.timezone', 'المنطقة الزمنية')}
              value={academyData.timezone}
              onChange={(val) => updateField('timezone', val)}
              options={timezoneOptions}
              searchable={true}
            />
            <CustomSelect 
              label={t('settings.calendarType', 'نوع التقويم')}
              value={academyData.calendar_type}
              onChange={(val) => updateField('calendar_type', val)}
              options={calendarOptions}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!academyData.name.trim() || isSubmitting}
              title={t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
              aria-label={t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
              className="w-full min-h-[44px] py-2.5 px-4 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-white active:scale-[0.98]"
              style={{ background: C?.gradients?.primaryBtn }}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Check size={16} />
                  <span>{t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

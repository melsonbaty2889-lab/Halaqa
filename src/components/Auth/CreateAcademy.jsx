// src/components/Auth/CreateAcademy.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import SelectModal from './SelectModal';

import { CURRENCIES } from '@/constants/currencies';
import { COUNTRIES } from '@/constants/countries';
import { colors as C } from '@/theme/colors';

import { 
  Building2, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Link as LinkIcon, 
  Loader2, 
  AlertCircle, 
  Upload, 
  CheckCircle2, 
  BookOpen, 
  Laptop, 
  Users, 
  Sliders
} from 'lucide-react';

export default function CreateAcademy({ onLogout, onSubmitAcademy, currentLanguage = 'ar' }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir ? i18n.dir() === 'rtl' : true;

  // دالة الترجمة الآمنة المعتمدة بالدليل
  const safeT = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      return t(key, { defaultValue: fallback || key });
    }
    return fallback || key;
  }, [t]);

  const [currentStep, setCurrentStep] = useState(1);
  const [modalType, setModalType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // حالات التحقق
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // إدخال مخصص للدولة واللغة
  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [customCountryName, setCustomCountryName] = useState('');
  const [isCustomLanguage, setIsCustomLanguage] = useState(false);
  const [customLanguageName, setCustomLanguageName] = useState('');

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // النموذج
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    learning_type: 'online',
    country_code: 'SA',
    currency: 'SAR',
    calendar_type: 'hijri',
    timezone: 'Asia/Riyadh',
    language_code: currentLanguage || 'ar',
    default_qiraat: 'hafs',
    teaching_methodology: 'mashreqi',
    weekend_days: ['friday', 'saturday'],
    contact_email: '',
    contact_phone: '',
    logo_url: ''
  });

  const LEARNING_TYPES = useMemo(() => [
    { id: 'online', label: safeT('createAcademy.online', 'عن بُعد'), icon: Laptop },
    { id: 'onsite', label: safeT('createAcademy.onsite', 'حضوري'), icon: Building2 },
    { id: 'hybrid', label: safeT('createAcademy.hybrid', 'مختلط'), icon: Users },
  ], [safeT]);

  const DAYS_OF_WEEK = useMemo(() => [
    { id: 'sunday', label: safeT('days.sunday', 'الأحد') },
    { id: 'monday', label: safeT('days.monday', 'الإثنين') },
    { id: 'tuesday', label: safeT('days.tuesday', 'الثلاثاء') },
    { id: 'wednesday', label: safeT('days.wednesday', 'الأربعاء') },
    { id: 'thursday', label: safeT('days.thursday', 'الخميس') },
    { id: 'friday', label: safeT('days.friday', 'الجمعة') },
    { id: 'saturday', label: safeT('days.saturday', 'السبت') },
  ], [safeT]);

  const QIRAAT_OPTIONS = useMemo(() => [
    { value: 'hafs', label: safeT('qiraat.hafs', 'حفص عن عاصم') },
    { value: 'warsh', label: safeT('qiraat.warsh', 'ورش عن نافع') },
    { value: 'qalon', label: safeT('qiraat.qalon', 'قالون عن نافع') },
    { value: 'aldoori', label: safeT('qiraat.aldoori', 'الدوري عن أبي عمرو') },
  ], [safeT]);

  const METHODOLOGY_OPTIONS = useMemo(() => [
    { value: 'mashreqi', label: safeT('methodology.mashreqi', 'النظام المشرقي (حفظ ومراجعة صغرى وكبرى)') },
    { value: 'maghrebi', label: safeT('methodology.maghrebi', 'النظام المغاربي (اللوح والرسم والراتب)') },
    { value: 'repetitive', label: safeT('methodology.repetitive', 'نظام التكرار والتلقين') },
  ], [safeT]);

  const BASE_LANGUAGES = useMemo(() => [
    { value: 'ar', label: safeT('languages.ar', 'العربية (Arabic)') },
    { value: 'en', label: safeT('languages.en', 'English') },
    { value: 'fr', label: safeT('languages.fr', 'Français') },
    { value: 'tr', label: safeT('languages.tr', 'Türkçe') },
    { value: 'ur', label: safeT('languages.ur', 'اردو (Urdu)') },
    { value: 'custom', label: safeT('languages.custom', 'لغة أخرى...') }
  ], [safeT]);

  const countryOptions = useMemo(() => [
    ...(COUNTRIES || []).map((c) => ({
      value: c.code,
      label: c.nameAr || c.name,
      subLabel: c.timezone,
    })),
    { value: 'CUSTOM', label: safeT('countries.custom', 'دولة أخرى...') }
  ], [safeT]);

  const handleCountrySelect = useCallback((countryCode) => {
    if (countryCode === 'CUSTOM') {
      setIsCustomCountry(true);
      setFormData((prev) => ({ ...prev, country_code: 'CUSTOM' }));
      return;
    }

    setIsCustomCountry(false);
    const country = (COUNTRIES || []).find((c) => c.code === countryCode);
    if (!country) return;

    let updatedQiraat = 'hafs';
    let updatedMethodology = 'mashreqi';

    if (['MA', 'DZ', 'MR'].includes(countryCode)) {
      updatedQiraat = 'warsh';
      updatedMethodology = 'maghrebi';
    } else if (['LY', 'TN'].includes(countryCode)) {
      updatedQiraat = 'qalon';
    } else if (['SD', 'SO'].includes(countryCode)) {
      updatedQiraat = 'aldoori';
    }

    setFormData((prev) => ({
      ...prev,
      country_code: countryCode,
      currency: country.currency || prev.currency,
      timezone: country.timezone || prev.timezone,
      default_qiraat: updatedQiraat,
      teaching_methodology: updatedMethodology
    }));
  }, []);

  // فحص توفر الـ slug في قاعدة البيانات بأمان
  useEffect(() => {
    const cleanSlug = formData.slug.trim().toLowerCase();
    if (!cleanSlug || cleanSlug.length < 2) {
      setIsSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        if (!supabase?.rpc) throw new Error('Supabase RPC is not available');
        const { data, error } = await supabase.rpc('check_slug_availability', {
          p_slug: cleanSlug
        });

        if (error) throw error;
        setIsSlugAvailable(data);
      } catch (err) {
        console.error('Slug check error:', err);
        setIsSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleNameChange = useCallback((e) => {
    const nameVal = e.target.value;
    const generatedSlug = nameVal
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: prev.slug === '' || prev.slug === generatedSlug ? generatedSlug : prev.slug
    }));
  }, []);

  const handleSlugChange = useCallback((e) => {
    const sanitized = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    setFormData((prev) => ({ ...prev, slug: sanitized }));
  }, []);

  const toggleWeekendDay = useCallback((dayId) => {
    setFormData((prev) => {
      const exists = prev.weekend_days.includes(dayId);
      const updated = exists
        ? prev.weekend_days.filter((d) => d !== dayId)
        : [...prev.weekend_days, dayId];
      return { ...prev, weekend_days: updated };
    });
  }, []);

  const handleLogoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(safeT('createAcademy.invalidImage', 'يُرجى اختيار ملف صورة صالح.'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg(safeT('createAcademy.imageTooLarge', 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت.'));
      return;
    }

    setUploadingLogo(true);
    setErrorMsg('');

    try {
      if (!supabase?.storage) throw new Error('Supabase storage unavailable');
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('academies')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('academies')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, logo_url: publicUrlData.publicUrl }));
    } catch (err) {
      console.error('Logo upload error:', err);
      setErrorMsg(safeT('createAcademy.uploadError', 'فشل رفع الشعار، يُرجى المحاولة مرة أخرى.'));
    } finally {
      setUploadingLogo(false);
    }
  }, [safeT]);

  const isStep1Valid = formData.name.trim().length >= 2 && formData.slug.trim().length >= 2 && isSlugAvailable === true;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (!supabase?.rpc) throw new Error('Supabase client error');
      const finalCountry = isCustomCountry ? 'OTHER' : formData.country_code;
      const finalReading = formData.default_qiraat === 'OTHER' ? 'hafs' : formData.default_qiraat;
      const finalMethodology = formData.teaching_methodology === 'OTHER' ? 'mashreqi' : formData.teaching_methodology;

      const { data, error } = await supabase.rpc('create_academy_with_owner', {
        p_name: formData.name.trim(),
        p_slug: formData.slug.trim().toLowerCase(),
        p_country_code: finalCountry,
        p_custom_country_name: isCustomCountry ? customCountryName.trim() : null,
        p_default_qiraat: finalReading,
        p_teaching_methodology: finalMethodology,
        p_logo_url: formData.logo_url || null,
      });

      if (error) throw error;

      setIsSuccess(true);

      setTimeout(async () => {
        if (onSubmitAcademy) {
          await onSubmitAcademy(data);
        }
      }, 1200);

    } catch (error) {
      console.error('Error creating academy:', error);
      setErrorMsg(
        error.message?.includes('duplicate key') || error.code === '23505'
          ? safeT('createAcademy.slugTaken', 'رابط الأكاديمية مستخدم بالفعل، اختر رابطاً آخر.')
          : (error.message || safeT('createAcademy.genericError', 'حدث خطأ أثناء إنشاء الأكاديمية، يُرجى المحاولة لاحقاً.'))
      );
      setIsSubmitting(false);
    }
  }, [isSubmitting, isCustomCountry, formData, customCountryName, onSubmitAcademy, safeT]);

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-10 text-center animate-fadeIn">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{
              backgroundColor: C.emerald?.light || 'rgba(16, 185, 129, 0.2)',
              borderColor: C.emerald?.DEFAULT || 'rgba(16, 185, 129, 0.4)',
              borderWidth: '1px',
              borderStyle: 'solid',
              color: C.emerald?.DEFAULT || '#10b981'
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-base font-bold mb-1" style={{ color: C.text?.main }}>
            {safeT('createAcademy.successTitle', 'تم تأسيس الأكاديمية بنجاح!')}
          </h2>
          <p className="text-xs" style={{ color: C.text?.muted }}>
            {safeT('createAcademy.preparingDashboard', 'جاري تجهيز لوحة التحكم الخاصة بك...')}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mb-1">
          <SmartHalaqaProLogo size={44} />
        </div>
        <h1 className="text-lg font-bold mt-1 mb-0.5 text-center" style={{ color: C.text?.main }}>
          {safeT('createAcademy.title', 'تأسيس الأكاديمية')}
        </h1>
        <p className="text-xs text-center m-0" style={{ color: C.text?.sub }}>
          {safeT('createAcademy.subtitle', 'إدخال البيانات الأساسية والخيارات التشغيلية')}
        </p>
      </div>

      <div 
        className="flex items-center justify-center gap-2 mb-4 p-2 rounded-xl"
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{
          backgroundColor: C.dark?.surfaceInput,
          borderColor: C.dark?.borderInput,
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{
                backgroundColor: currentStep === step 
                  ? (C.amber?.DEFAULT || C.primary?.DEFAULT)
                  : currentStep > step 
                  ? (C.emerald?.light || 'rgba(16, 185, 129, 0.2)')
                  : C.dark?.surfaceCard,
                color: currentStep === step ? C.dark?.bg : currentStep > step ? (C.emerald?.DEFAULT || '#10b981') : C.text?.muted,
                borderColor: currentStep > step ? (C.emerald?.DEFAULT || '#10b981') : 'transparent',
                borderWidth: currentStep > step ? '1px' : '0px'
              }}
            >
              {currentStep > step ? <Check size={12} /> : step}
            </div>
            <span className="text-[11px] font-semibold" style={{ color: C.text?.main }}>
              {step === 1 ? safeT('createAcademy.step1Name', 'بيانات الهوية') : safeT('createAcademy.step2Name', 'التكيف والإنشاء')}
            </span>
            {step < 2 && <div className="w-8 h-0.5 mx-1" style={{ backgroundColor: C.dark?.borderInput }} />}
          </div>
        ))}
      </div>

      {errorMsg && (
        <div 
          className="mb-4 p-2.5 rounded-xl flex items-center gap-2 text-xs"
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            backgroundColor: C.error?.light || 'rgba(239, 68, 68, 0.1)',
            borderColor: C.error?.DEFAULT || 'rgba(239, 68, 68, 0.3)',
            borderWidth: '1px',
            borderStyle: 'solid',
            color: C.error?.DEFAULT || '#f87171'
          }}
        >
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} dir={isRtl ? 'rtl' : 'ltr'}>
        {currentStep === 1 && (
          <div className="space-y-3.5">
            <div 
              className="flex items-center gap-2 pb-1.5"
              style={{
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: C.dark?.borderInput
              }}
            >
              <Building2 size={16} style={{ color: C.amber?.DEFAULT || C.primary?.DEFAULT }} />
              <h2 className="font-bold text-xs" style={{ color: C.text?.main }}>
                {safeT('createAcademy.identityHeader', 'المعلومات التعريفية')}
              </h2>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium block" style={{ color: C.text?.sub }}>
                {safeT('createAcademy.academyNameLabel', 'اسم الأكاديمية')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                aria-label={safeT('createAcademy.academyNameLabel', 'اسم الأكاديمية')}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-colors duration-200"
                style={{
                  backgroundColor: C.dark?.surfaceInput,
                  color: C.text?.main,
                  borderColor: C.dark?.borderInput,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium flex items-center gap-1" style={{ color: C.text?.sub }}>
                <LinkIcon size={12} style={{ color: C.amber?.DEFAULT || C.primary?.DEFAULT }} />
                <span>{safeT('createAcademy.slugLabel', 'المعرف الفريد (Slug)')}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  aria-label={safeT('createAcademy.slugLabel', 'المعرف الفريد (Slug)')}
                  className="w-full px-3 py-2 pe-8 rounded-xl text-xs outline-none transition-colors duration-200"
                  dir="ltr"
                  style={{
                    backgroundColor: C.dark?.surfaceInput,
                    color: C.text?.main,
                    borderColor: C.dark?.borderInput,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  required
                />
                <div className="absolute top-2.5 inset-inline-end-2.5 flex items-center pointer-events-none">
                  {isCheckingSlug ? (
                    <Loader2 size={14} className="animate-spin" style={{ color: C.amber?.DEFAULT }} />
                  ) : isSlugAvailable === true ? (
                    <CheckCircle2 size={14} style={{ color: C.emerald?.DEFAULT }} />
                  ) : isSlugAvailable === false ? (
                    <AlertCircle size={14} style={{ color: C.error?.DEFAULT }} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-medium block" style={{ color: C.text?.sub }}>
                {safeT('createAcademy.learningTypeLabel', 'نموذج تقديم التعليم')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {LEARNING_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.learning_type === type.id;
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setFormData({ ...formData, learning_type: type.id })}
                      aria-label={type.label}
                      className="p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 min-h-[44px]"
                      style={{
                        backgroundColor: isSelected ? (C.amber?.light || 'rgba(217, 119, 6, 0.1)') : C.dark?.surfaceInput,
                        borderColor: isSelected ? (C.amber?.DEFAULT || C.primary?.DEFAULT) : C.dark?.borderInput,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: isSelected ? C.text?.main : C.text?.muted
                      }}
                    >
                      <Icon size={16} style={{ color: isSelected ? (C.amber?.DEFAULT || C.primary?.DEFAULT) : C.text?.muted }} />
                      <span className="text-[11px] font-bold mt-1 truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] block" style={{ color: C.text?.sub }}>
                  {safeT('createAcademy.countryDomain', 'النطاق الجغرافي')}
                </label>
                <button
                  type="button"
                  onClick={() => setModalType('country')}
                  aria-label={safeT('createAcademy.countryDomain', 'النطاق الجغرافي')}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs min-h-[44px]"
                  style={{
                    backgroundColor: C.dark?.surfaceInput,
                    borderColor: C.dark?.borderInput,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: C.text?.main
                  }}
                >
                  <span className="truncate">
                    {isCustomCountry ? (customCountryName || safeT('common.custom', 'مخصص')) : formData.country_code}
                  </span>
                  <ChevronDown size={14} className="shrink-0" style={{ color: C.text?.muted }} />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] block" style={{ color: C.text?.sub }}>
                  {safeT('createAcademy.operationalLanguage', 'اللغة التشغيلية')}
                </label>
                <button
                  type="button"
                  onClick={() => setModalType('language')}
                  aria-label={safeT('createAcademy.operationalLanguage', 'اللغة التشغيلية')}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs min-h-[44px]"
                  style={{
                    backgroundColor: C.dark?.surfaceInput,
                    borderColor: C.dark?.borderInput,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: C.text?.main
                  }}
                >
                  <span className="truncate">
                    {isCustomLanguage ? (customLanguageName || safeT('common.custom', 'مخصص')) : formData.language_code}
                  </span>
                  <ChevronDown size={14} className="shrink-0" style={{ color: C.text?.muted }} />
                </button>
              </div>
            </div>

            {isCustomCountry && (
              <input
                type="text"
                placeholder={safeT('createAcademy.enterCountryPlaceholder', 'ادخل اسم الدولة')}
                value={customCountryName}
                onChange={(e) => setCustomCountryName(e.target.value)}
                aria-label={safeT('createAcademy.enterCountryPlaceholder', 'ادخل اسم الدولة')}
                className="w-full px-3 py-1.5 text-xs rounded-xl outline-none"
                style={{
                  backgroundColor: C.dark?.surfaceInput,
                  color: C.text?.main,
                  borderColor: C.amber?.DEFAULT || C.primary?.DEFAULT,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                required
              />
            )}

            {isCustomLanguage && (
              <input
                type="text"
                placeholder={safeT('createAcademy.enterLanguagePlaceholder', 'ادخل اسم اللغة')}
                value={customLanguageName}
                onChange={(e) => setCustomLanguageName(e.target.value)}
                aria-label={safeT('createAcademy.enterLanguagePlaceholder', 'ادخل اسم اللغة')}
                className="w-full px-3 py-1.5 text-xs rounded-xl outline-none"
                style={{
                  backgroundColor: C.dark?.surfaceInput,
                  color: C.text?.main,
                  borderColor: C.amber?.DEFAULT || C.primary?.DEFAULT,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                required
              />
            )}

            <div className="space-y-1">
              <label className="text-[10px] block" style={{ color: C.text?.sub }}>
                {safeT('createAcademy.weekendConfig', 'أيام العطلة الأسبوعية')}
              </label>
              <div className="flex flex-wrap gap-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = formData.weekend_days.includes(day.id);
                  return (
                    <button
                      type="button"
                      key={day.id}
                      onClick={() => toggleWeekendDay(day.id)}
                      aria-label={day.label}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition min-h-[36px]"
                      style={{
                        backgroundColor: isSelected ? (C.amber?.light || 'rgba(217, 119, 6, 0.2)') : C.dark?.surfaceCard,
                        borderColor: isSelected ? (C.amber?.DEFAULT || C.primary?.DEFAULT) : C.dark?.borderInput,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: isSelected ? (C.amber?.DEFAULT || C.primary?.DEFAULT) : C.text?.muted
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer hover:underline border-0 bg-transparent"
                style={{ color: C.amber?.DEFAULT || C.primary?.DEFAULT }}
              >
                <Sliders size={13} />
                <span>
                  {showAdvancedSettings 
                    ? safeT('createAcademy.hideAdvanced', 'إخفاء الإعدادات الإضافية') 
                    : safeT('createAcademy.showAdvanced', 'إعدادات الرواية والمنهجية والشعار')}
                </span>
              </button>

              {showAdvancedSettings && (
                <div 
                  className="mt-2.5 p-3 rounded-xl space-y-3"
                  style={{
                    backgroundColor: C.dark?.surfaceInput,
                    borderColor: C.dark?.borderInput,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  <div className="space-y-1">
                    <label className="text-[10px] flex items-center gap-1" style={{ color: C.text?.sub }}>
                      <BookOpen size={11} style={{ color: C.amber?.DEFAULT || C.primary?.DEFAULT }} />
                      <span>{safeT('createAcademy.defaultQiraat', 'رواية القراءة الاعتيادية')}</span>
                    </label>
                    <select
                      value={formData.default_qiraat}
                      onChange={(e) => setFormData({ ...formData, default_qiraat: e.target.value })}
                      aria-label={safeT('createAcademy.defaultQiraat', 'رواية القراءة الاعتيادية')}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                      style={{
                        backgroundColor: C.dark?.bg,
                        color: C.text?.main,
                        borderColor: C.dark?.borderInput,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {QIRAAT_OPTIONS.map((q) => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] block" style={{ color: C.text?.sub }}>
                      {safeT('createAcademy.methodologyStandard', 'منهجية المتابعة والتحفيظ')}
                    </label>
                    <select
                      value={formData.teaching_methodology}
                      onChange={(e) => setFormData({ ...formData, teaching_methodology: e.target.value })}
                      aria-label={safeT('createAcademy.methodologyStandard', 'منهجية المتابعة والتحفيظ')}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                      style={{
                        backgroundColor: C.dark?.bg,
                        color: C.text?.main,
                        borderColor: C.dark?.borderInput,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {METHODOLOGY_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                      style={{
                        backgroundColor: C.dark?.surfaceCard,
                        borderColor: C.dark?.borderInput,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt={safeT('createAcademy.logoAlt', 'شعار الأكاديمية')} className="w-full h-full object-cover" />
                      ) : (
                        <Upload size={16} style={{ color: C.text?.muted }} />
                      )}
                    </div>
                    <label 
                      className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium rounded-lg border transition-colors min-h-[36px]"
                      style={{
                        backgroundColor: C.dark?.surfaceCard,
                        color: C.text?.main,
                        borderColor: C.dark?.borderInput
                      }}
                    >
                      {uploadingLogo ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                      <span>{safeT('createAcademy.uploadLogo', 'تحميل الشعار')}</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 pt-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              aria-label={safeT('common.previous', 'السابق')}
              className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition min-h-[44px]"
              style={{
                backgroundColor: C.dark?.surfaceCard,
                color: C.text?.main,
                borderColor: C.dark?.borderInput,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <ChevronRight size={14} className={isRtl ? '' : 'rotate-180'} />
              <span>{safeT('common.previous', 'السابق')}</span>
            </button>
          )}

          {currentStep === 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!isStep1Valid}
              aria-label={safeT('common.next', 'التالي')}
              className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition min-h-[44px]"
              style={{
                backgroundColor: !isStep1Valid ? C.dark?.surfaceCard : (C.amber?.DEFAULT || C.primary?.DEFAULT),
                color: !isStep1Valid ? C.text?.muted : C.dark?.bg,
                cursor: !isStep1Valid ? 'not-allowed' : 'pointer'
              }}
            >
              <span>{safeT('common.next', 'التالي')}</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label={safeT('createAcademy.completeSetup', 'إنهاء التأسيس')}
              className="flex-[1.5] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md transition min-h-[44px]"
              style={{
                backgroundColor: C.amber?.DEFAULT || C.primary?.DEFAULT,
                color: C.dark?.bg,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Check size={15} />
                  <span>{safeT('createAcademy.completeSetup', 'إنهاء التأسيس')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <SelectModal
        isOpen={modalType === 'country'}
        onClose={() => setModalType(null)}
        title={safeT('createAcademy.selectCountry', 'اختر الدولة')}
        options={countryOptions}
        selectedValue={formData.country_code}
        onSelect={handleCountrySelect}
      />

      <SelectModal
        isOpen={modalType === 'language'}
        onClose={() => setModalType(null)}
        title={safeT('createAcademy.selectLanguage', 'اختر اللغة')}
        options={BASE_LANGUAGES}
        selectedValue={formData.language_code}
        onSelect={(val) => {
          if (val === 'custom') {
            setIsCustomLanguage(true);
            setFormData((prev) => ({ ...prev, language_code: 'custom' }));
          } else {
            setIsCustomLanguage(false);
            setFormData((prev) => ({ ...prev, language_code: val }));
          }
        }}
      />
    </AuthLayout>
  );
}

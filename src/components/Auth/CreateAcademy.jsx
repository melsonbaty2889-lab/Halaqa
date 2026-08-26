import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import SelectModal from './SelectModal';

import { CURRENCIES } from '../../constants/currencies';
import { COUNTRIES } from '../../constants/countries';

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
  Sliders,
  Globe
} from 'lucide-react';

export default function CreateAcademy({ onLogout, onSubmitAcademy, isRtl = true, currentLanguage = 'ar' }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [modalType, setModalType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // النموذج الخالي من أي بيانات تجريبية
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

  const LEARNING_TYPES = [
    { id: 'online', label: isRtl ? 'عن بُعد' : 'Online', icon: Laptop },
    { id: 'onsite', label: isRtl ? 'حضوري' : 'On-Site', icon: Building2 },
    { id: 'hybrid', label: isRtl ? 'مختلط' : 'Hybrid', icon: Users },
  ];

  const DAYS_OF_WEEK = [
    { id: 'sunday', label: isRtl ? 'الأحد' : 'Sunday' },
    { id: 'monday', label: isRtl ? 'الإثنين' : 'Monday' },
    { id: 'tuesday', label: isRtl ? 'الثلاثاء' : 'Tuesday' },
    { id: 'wednesday', label: isRtl ? 'الأربعاء' : 'Wednesday' },
    { id: 'thursday', label: isRtl ? 'الخميس' : 'Thursday' },
    { id: 'friday', label: isRtl ? 'الجمعة' : 'Friday' },
    { id: 'saturday', label: isRtl ? 'السبت' : 'Saturday' },
  ];

  const QIRAAT_OPTIONS = [
    { value: 'hafs', label: isRtl ? 'حفص عن عاصم' : 'Hafs an Asim' },
    { value: 'warsh', label: isRtl ? 'ورش عن نافع' : 'Warsh an Nafi' },
    { value: 'qalon', label: isRtl ? 'قالون عن نافع' : 'Qalon an Nafi' },
    { value: 'aldoori', label: isRtl ? 'الدوري عن أبي عمرو' : 'Al-Doori an Abi Amr' },
  ];

  const METHODOLOGY_OPTIONS = [
    { value: 'mashreqi', label: isRtl ? 'النظام المشرقي (حفظ ومراجعة صغرى وكبرى)' : 'Mashreqi Methodology' },
    { value: 'maghrebi', label: isRtl ? 'النظام المغاربي (اللوح والرسم والراتب)' : 'Maghrebi Methodology' },
    { value: 'repetitive', label: isRtl ? 'نظام التكرار والتلقين' : 'Repetitive Methodology' },
  ];

  const BASE_LANGUAGES = [
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'ur', label: 'اردو (Urdu)' },
    { value: 'custom', label: isRtl ? 'لغة أخرى...' : 'Other Language...' }
  ];

  const countryOptions = [
    ...(COUNTRIES || []).map((c) => ({
      value: c.code,
      label: c.nameAr || c.name,
      subLabel: c.timezone,
    })),
    { value: 'CUSTOM', label: isRtl ? 'دولة أخرى...' : 'Other Country...' }
  ];

  // الاكتشاف والتلقين الذكي حسب الدولة
  const handleCountrySelect = (countryCode) => {
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
  };

  // فحص توفر الـ slug في قاعدة البيانات
  useEffect(() => {
    if (!formData.slug || formData.slug.trim().length < 2) {
      setIsSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const { data, error } = await supabase
          .from('academies')
          .select('id')
          .eq('slug', formData.slug.trim())
          .maybeSingle();

        if (error) throw error;
        setIsSlugAvailable(!data);
      } catch (err) {
        console.error('Slug check error:', err);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const generatedSlug = nameVal
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: prev.slug === '' || prev.slug === generatedSlug ? generatedSlug : prev.slug
    }));
  };

  const toggleWeekendDay = (dayId) => {
    setFormData((prev) => {
      const exists = prev.weekend_days.includes(dayId);
      const updated = exists
        ? prev.weekend_days.filter((d) => d !== dayId)
        : [...prev.weekend_days, dayId];
      return { ...prev, weekend_days: updated };
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `academy_logo_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('academies')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('academies')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, logo_url: publicUrlData.publicUrl }));
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const isStep1Valid = formData.name.trim().length >= 2 && formData.slug.trim().length >= 2 && isSlugAvailable === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const finalCountry = isCustomCountry ? 'OTHER' : formData.country_code;
      const finalReading = formData.default_qiraat === 'OTHER' ? 'hafs' : formData.default_qiraat;
      const finalMethodology = formData.teaching_methodology === 'OTHER' ? 'mashreqi' : formData.teaching_methodology;

      // استدعاء الدالة الذرية من Supabase
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

      if (onSubmitAcademy) {
        await onSubmitAcademy(data);
      }
    } catch (error) {
      console.error('Error creating academy:', error);
      setErrorMsg(
        error.message?.includes('duplicate key') || error.code === '23505'
          ? (isRtl ? 'رابط الأكاديمية مستخدم بالفعل، اختر رابطاً آخر.' : 'Academy URL is already taken.')
          : (error.message || (isRtl ? 'حدث خطأ أثناء إنشاء الأكاديمية، يُرجى المحاولة لاحقاً.' : 'Failed to create academy. Please try again.'))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-4">
        <div className="mb-1">
          <SmartHalaqaProLogo size={44} />
        </div>
        <h1 className="text-[var(--text-main,#FFFFFF)] text-lg font-bold mt-1 mb-0.5 text-center">
          {isRtl ? 'تأسيس الأكاديمية' : 'Establish Academy'}
        </h1>
        <p className="text-[var(--text-sub,#94A3B8)] text-xs text-center m-0">
          {isRtl ? 'إدخال البيانات الأساسية والخيارات التشغيلية' : 'Enter basic and operational configurations'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4 bg-[var(--surface-input,#0A101D)] p-2 rounded-xl border border-[var(--border-input,#1B2738)]">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              currentStep === step
                ? 'bg-[var(--primary,#E07A00)] text-slate-950'
                : currentStep > step
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {currentStep > step ? <Check size={12} /> : step}
            </div>
            <span className="text-[11px] font-semibold text-slate-300">
              {step === 1 ? (isRtl ? 'بيانات الهوية' : 'Identity') : (isRtl ? 'التكيف والإنشاء' : 'Configurations')}
            </span>
            {step < 2 && <div className="w-8 h-0.5 bg-slate-800 mx-1" />}
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[var(--border-input,#1B2738)]">
              <Building2 size={16} className="text-[var(--primary,#E07A00)]" />
              <h2 className="font-bold text-xs text-[var(--text-main,#FFFFFF)]">
                {isRtl ? 'المعلومات التعريفية' : 'Basic Identifiers'}
              </h2>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-sub,#94A3B8)]">
                {isRtl ? 'اسم الأكاديمية' : 'Academy Title'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-3 py-2 bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] rounded-xl border border-[var(--border-input,#1B2738)] focus:border-[var(--primary,#E07A00)] text-xs outline-none"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-sub,#94A3B8)] flex items-center gap-1">
                <LinkIcon size={12} className="text-[var(--primary,#E07A00)]" />
                <span>{isRtl ? 'المعرف الفريد (Slug)' : 'Unique Identifier (Slug)'}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] rounded-xl border border-[var(--border-input,#1B2738)] focus:border-[var(--primary,#E07A00)] text-xs dir-ltr outline-none pr-8"
                  required
                />
                <div className="absolute top-2.5 left-2.5 flex items-center">
                  {isCheckingSlug ? (
                    <Loader2 size={14} className="animate-spin text-amber-400" />
                  ) : isSlugAvailable === true ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : isSlugAvailable === false ? (
                    <AlertCircle size={14} className="text-rose-400" />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-sub,#94A3B8)]">
                {isRtl ? 'نموذج تقديم التعليم' : 'Learning Delivery Model'}
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
                      className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[var(--primary,#E07A00)]/10 border-[var(--primary,#E07A00)] text-[var(--text-main,#FFFFFF)]'
                          : 'bg-[var(--surface-input,#0A101D)] border-[var(--border-input,#1B2738)] text-slate-400'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-[var(--primary,#E07A00)]' : 'text-slate-400'} />
                      <span className="text-[11px] font-bold mt-1">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-sub,#94A3B8)]">{isRtl ? 'النطاق الجغرافي' : 'Country Domain'}</label>
                <button
                  type="button"
                  onClick={() => setModalType('country')}
                  className="w-full flex items-center justify-between px-2.5 py-2 bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-xl text-xs text-[var(--text-main,#FFFFFF)]"
                >
                  <span className="truncate">{isCustomCountry ? (customCountryName || (isRtl ? 'مخصص' : 'Custom')) : formData.country_code}</span>
                  <ChevronDown size={14} className="text-slate-400 shrink-0" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-sub,#94A3B8)]">{isRtl ? 'اللغة التشغيلية' : 'Operational Language'}</label>
                <button
                  type="button"
                  onClick={() => setModalType('language')}
                  className="w-full flex items-center justify-between px-2.5 py-2 bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-xl text-xs text-[var(--text-main,#FFFFFF)]"
                >
                  <span className="truncate">{isCustomLanguage ? (customLanguageName || (isRtl ? 'مخصص' : 'Custom')) : formData.language_code}</span>
                  <ChevronDown size={14} className="text-slate-400 shrink-0" />
                </button>
              </div>
            </div>

            {isCustomCountry && (
              <input
                type="text"
                placeholder={isRtl ? 'ادخل اسم الدولة' : 'Enter Country Name'}
                value={customCountryName}
                onChange={(e) => setCustomCountryName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[var(--surface-input,#0A101D)] text-xs text-[var(--text-main,#FFFFFF)] rounded-xl border border-[var(--primary,#E07A00)]/50 outline-none"
                required
              />
            )}

            {isCustomLanguage && (
              <input
                type="text"
                placeholder={isRtl ? 'ادخل اسم اللغة' : 'Enter Language Name'}
                value={customLanguageName}
                onChange={(e) => setCustomLanguageName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[var(--surface-input,#0A101D)] text-xs text-[var(--text-main,#FFFFFF)] rounded-xl border border-[var(--primary,#E07A00)]/50 outline-none"
                required
              />
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-[var(--text-sub,#94A3B8)]">{isRtl ? 'أيام العطلة الأسبوعية' : 'Weekend Configuration'}</label>
              <div className="flex flex-wrap gap-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = formData.weekend_days.includes(day.id);
                  return (
                    <button
                      type="button"
                      key={day.id}
                      onClick={() => toggleWeekendDay(day.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
                      }`}
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
                className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--primary,#E07A00)] hover:underline"
              >
                <Sliders size={13} />
                <span>{showAdvancedSettings ? (isRtl ? 'إخفاء الإعدادات الإضافية' : 'Hide Advanced Settings') : (isRtl ? 'إعدادات الرواية والمنهجية والشعار' : 'Configure Qiraat & Methodology')}</span>
              </button>

              {showAdvancedSettings && (
                <div className="mt-2.5 p-3 bg-[var(--surface-input,#0A101D)] rounded-xl border border-[var(--border-input,#1B2738)] space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-sub,#94A3B8)] flex items-center gap-1">
                      <BookOpen size={11} className="text-[var(--primary,#E07A00)]" />
                      <span>{isRtl ? 'رواية القراءة الاعتيادية' : 'Default Qiraat'}</span>
                    </label>
                    <select
                      value={formData.default_qiraat}
                      onChange={(e) => setFormData({ ...formData, default_qiraat: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 text-[var(--text-main,#FFFFFF)] rounded-lg border border-slate-800 text-xs outline-none"
                    >
                      {QIRAAT_OPTIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-sub,#94A3B8)]">{isRtl ? 'منهجية المتابعة والتحفيظ' : 'Methodology Standard'}</label>
                    <select
                      value={formData.teaching_methodology}
                      onChange={(e) => setFormData({ ...formData, teaching_methodology: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 text-[var(--text-main,#FFFFFF)] rounded-lg border border-slate-800 text-xs outline-none"
                    >
                      {METHODOLOGY_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Upload size={16} className="text-slate-400" />
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-200 rounded-lg border border-slate-700">
                      {uploadingLogo ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                      <span>{isRtl ? 'تحميل الشعار' : 'Upload Logo'}</span>
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
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-slate-700"
            >
              <ChevronRight size={14} />
              <span>{isRtl ? 'السابق' : 'Previous'}</span>
            </button>
          )}

          {currentStep === 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!isStep1Valid}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 ${
                !isStep1Valid
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#E67E00] to-[#D97706] text-slate-950 cursor-pointer'
              }`}
            >
              <span>{isRtl ? 'التالي' : 'Next'}</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[1.5] py-2.5 px-3 bg-gradient-to-r from-[#E67E00] to-[#D97706] text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Check size={15} />
                  <span>{isRtl ? 'إنهاء التأسيس' : 'Complete Setup'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <SelectModal
        isOpen={modalType === 'country'}
        onClose={() => setModalType(null)}
        title={isRtl ? 'اختر الدولة' : 'Select Country'}
        options={countryOptions}
        selectedValue={formData.country_code}
        onSelect={handleCountrySelect}
      />

      <SelectModal
        isOpen={modalType === 'language'}
        onClose={() => setModalType(null)}
        title={isRtl ? 'اختر اللغة' : 'Select Language'}
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

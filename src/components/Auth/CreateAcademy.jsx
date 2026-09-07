import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import SelectModal from './SelectModal';

// 1. نظام الألوان والثيم الموحد
import C from '@/theme/colors';

// 2. الثوابت والهوكات
import { COUNTRIES } from '@/constants/countries';
import { getRiwayatOptions } from '@/constants/riwayat';

import { 
  Building2, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Globe,
  BookOpen,
  Sliders
} from 'lucide-react';

export default function CreateAcademy({ onSubmitAcademy }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [modalType, setModalType] = useState(null);

  // البيانات مع القيم الافتراضية
  const [formData, setFormData] = useState({
    name_ar: '',
    slug: '',
    country: 'SA',
    currency: 'SAR',
    mode: 'online',
    riwaya: 'hafs_an_asem',
    madrasa: 'mashreqi',
  });

  const LEARNING_MODES = useMemo(() => [
    { value: 'online', label: t('settings.online', 'عن بُعد') },
    { value: 'onsite', label: t('settings.onsite', 'حضوري') },
    { value: 'hybrid', label: t('settings.hybrid', 'مختلط') },
  ], [t]);

  const countryOptions = useMemo(() => 
    (COUNTRIES || []).map((c) => ({
      value: c.code,
      label: isRtl ? (c.nameAr || c.name) : c.name,
    })), [isRtl]
  );

  const riwayaOptions = useMemo(() => 
    getRiwayatOptions(t, i18n.language), [t, i18n.language]
  );

  // توليد الـ Slug تلقائياً مع كتابة الاسم
  const handleNameChange = useCallback((e) => {
    const nameVal = e.target.value;
    const generatedSlug = nameVal
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    setFormData((prev) => ({
      ...prev,
      name_ar: nameVal,
      slug: generatedSlug,
    }));
  }, []);

  const handleNextStep = useCallback((e) => {
    e.preventDefault();
    if (!formData.name_ar.trim()) return;
    setErrorMsg('');
    setStep(2);
  }, [formData.name_ar]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting || !formData.name_ar.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const finalSlug = formData.slug.trim() || `academy-${Date.now().toString().slice(-4)}`;

      const { data, error } = await supabase.rpc('create_academy_with_owner', {
        p_name: formData.name_ar.trim(),
        p_slug: finalSlug,
        p_country_code: formData.country,
        p_learning_type: formData.mode,
        p_currency: formData.currency,
        p_default_qiraat: formData.riwaya,
        p_teaching_methodology: formData.madrasa,
        p_logo_url: null,
      });

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(async () => {
        if (onSubmitAcademy) {
          await onSubmitAcademy(data);
        }
      }, 1000);

    } catch (error) {
      console.error('Create academy error:', error);
      setErrorMsg(
        error.message?.includes('duplicate key') || error.code === '23505'
          ? t('errors.slug_taken', 'اسم الأكاديمية مستخدم بالفعل، يرجى كتابة اسم آخر')
          : (error.message || t('errors.generic', 'حدث خطأ أثناء الإنشاء'))
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, onSubmitAcademy, t]);

  // حالة النجاح
  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border shadow-lg"
            style={{ 
              backgroundColor: C?.success?.bg || 'rgba(16, 185, 129, 0.1)', 
              borderColor: C?.success?.border || 'rgba(16, 185, 129, 0.3)',
              color: C?.success?.text || '#10B981'
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h2 
            className="text-base font-bold mb-1"
            style={{ color: C?.text?.primary || '#FFFFFF' }}
          >
            {t('academy.created_success', 'تم إنشاء الأكاديمية بنجاح!')}
          </h2>
          <p 
            className="text-xs"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            {t('common.preparing_dashboard', 'جاري تجهيز لوحة التحكم...')}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* هيدر الصفحة ومؤشر الخطوات */}
      <div className="flex flex-col items-center mb-5 text-center">
        <div className="mb-2">
          <SmartHalaqaProLogo size={40} />
        </div>
        <h1 
          className="text-base font-bold"
          style={{ color: C?.text?.primary || '#FFFFFF' }}
        >
          {t('academy.create_title', 'إنشاء أكاديمية جديدة')}
        </h1>

        {/* شريط تقدم الخطوات */}
        <div className="flex items-center gap-2 mt-3">
          <div 
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ 
              width: step === 1 ? '2rem' : '0.75rem', 
              backgroundColor: step === 1 ? (C?.primary?.DEFAULT || '#E07A00') : (C?.dark?.border || '#1B2738') 
            }} 
          />
          <div 
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ 
              width: step === 2 ? '2rem' : '0.75rem', 
              backgroundColor: step === 2 ? (C?.primary?.DEFAULT || '#E07A00') : (C?.dark?.border || '#1B2738') 
            }} 
          />
        </div>
      </div>

      {/* تنبيه الأخطاء */}
      {errorMsg && (
        <div 
          className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs border"
          role="alert"
          style={{ 
            backgroundColor: C?.danger?.bg || 'rgba(244, 63, 94, 0.1)',
            borderColor: C?.danger?.border || 'rgba(244, 63, 94, 0.3)',
            color: C?.danger?.text || '#F43F5E'
          }}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- الخطوة 1: اسم الأكاديمية فقط --- */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4 animate-fadeIn">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: C?.text?.primary || '#FFFFFF' }}>
              <Building2 size={14} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
              <span>{t('academy.name_ar', 'اسم الأكاديمية')} *</span>
            </label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={handleNameChange}
              placeholder={t('academy.name_placeholder_example', 'أدخل اسم الأكاديمية')}
              className="w-full px-3.5 min-h-[44px] text-xs rounded-xl border outline-none transition focus:border-amber-500"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738',
                color: C?.text?.primary || '#FFFFFF'
              }}
              aria-label={t('academy.name_ar', 'اسم الأكاديمية')}
              required
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!formData.name_ar.trim()}
              title={t('common.next', 'المتابعة')}
              aria-label={t('common.next', 'المتابعة')}
              className="w-full min-h-[44px] py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              style={{ 
                backgroundColor: C?.primary?.DEFAULT || '#E07A00',
                color: C?.primary?.text || '#000000'
              }}
            >
              <span>{t('common.next', 'المتابعة')}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      )}

      {/* --- الخطوة 2: الخيارات الأساسية والسريعة --- */}
      {step === 2 && (
        <div className="space-y-3.5 animate-fadeIn">
          
          {/* الدولة */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium flex items-center gap-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
              <Globe size={12} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
              <span>{t('settings.country', 'الدولة المقترحة')}</span>
            </label>
            <button
              type="button"
              onClick={() => setModalType('country')}
              title={t('settings.select_country', 'اختر الدولة')}
              aria-label={t('settings.select_country', 'اختر الدولة')}
              className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738',
                color: C?.text?.primary || '#FFFFFF'
              }}
            >
              <span className="truncate">
                {countryOptions.find((c) => c.value === formData.country)?.label || formData.country}
              </span>
              <ChevronDown size={14} className="shrink-0" style={{ color: C?.text?.secondary || '#94A3B8' }} />
            </button>
          </div>

          {/* الرواية */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium flex items-center gap-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
              <BookOpen size={12} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
              <span>{t('settings.riwaya', 'الرواية الرئيسية')}</span>
            </label>
            <button
              type="button"
              onClick={() => setModalType('riwaya')}
              title={t('settings.select_riwaya', 'اختر الرواية')}
              aria-label={t('settings.select_riwaya', 'اختر الرواية')}
              className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738',
                color: C?.text?.primary || '#FFFFFF'
              }}
            >
              <span className="truncate">
                {riwayaOptions.find((r) => r.value === formData.riwaya)?.label}
              </span>
              <ChevronDown size={14} className="shrink-0" style={{ color: C?.text?.secondary || '#94A3B8' }} />
            </button>
          </div>

          {/* نمط التعليم */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium flex items-center gap-1" style={{ color: C?.text?.secondary || '#94A3B8' }}>
              <Sliders size={12} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
              <span>{t('settings.mode', 'نموذج التعليم')}</span>
            </label>
            <select
              value={formData.mode}
              onChange={(e) => setFormData((prev) => ({ ...prev, mode: e.target.value }))}
              aria-label={t('settings.mode', 'نموذج التعليم')}
              className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border outline-none transition"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738',
                color: C?.text?.primary || '#FFFFFF'
              }}
            >
              {LEARNING_MODES.map((m) => (
                <option key={m.value} value={m.value} style={{ backgroundColor: C?.dark?.surface || '#0A101D' }}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* أزرار التحكم والرجوع */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              title={t('common.back', 'الرجوع')}
              aria-label={t('common.back', 'الرجوع')}
              className="min-h-[44px] py-2.5 px-3.5 font-semibold text-xs rounded-xl border transition flex items-center justify-center disabled:opacity-50"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738',
                color: C?.text?.secondary || '#94A3B8'
              }}
            >
              {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              title={t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
              aria-label={t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
              className="flex-1 min-h-[44px] py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              style={{ 
                backgroundColor: C?.primary?.DEFAULT || '#E07A00',
                color: C?.primary?.text || '#000000'
              }}
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
        </div>
      )}

      {/* المودالات المساعدة للاختيار */}
      <SelectModal
        isOpen={modalType === 'country'}
        onClose={() => setModalType(null)}
        title={t('settings.select_country', 'اختر الدولة')}
        options={countryOptions}
        selectedValue={formData.country}
        onSelect={(val) => setFormData((prev) => ({ ...prev, country: val }))}
      />

      <SelectModal
        isOpen={modalType === 'riwaya'}
        onClose={() => setModalType(null)}
        title={t('settings.select_riwaya', 'اختر الرواية')}
        options={riwayaOptions}
        selectedValue={formData.riwaya}
        onSelect={(val) => setFormData((prev) => ({ ...prev, riwaya: val }))}
      />
    </AuthLayout>
  );
}

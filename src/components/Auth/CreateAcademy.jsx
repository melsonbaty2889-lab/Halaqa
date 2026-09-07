import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import SelectModal from './SelectModal';

// استيراد الألوان والثوابت من المجلدات الصحيحة
import C from '@/theme/colors';
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

  // البيانات مع القيم الافتراضية الذكية
  const [formData, setFormData] = useState({
    name_ar: '',
    slug: '',
    country: 'SA',
    currency: 'SAR',
    mode: 'online',
    riwaya: 'hafs_an_asem',
    madrasa: 'mashreqi',
  });

  const LEARNING_MODES = [
    { value: 'online', label: t('settings.online', 'عن بُعد') },
    { value: 'onsite', label: t('settings.onsite', 'حضوري') },
    { value: 'hybrid', label: t('settings.hybrid', 'مختلط') },
  ];

  const countryOptions = (COUNTRIES || []).map((c) => ({
    value: c.code,
    label: isRtl ? (c.nameAr || c.name) : c.name,
  }));

  const riwayaOptions = getRiwayatOptions(t, i18n.language);

  // توليد الـ Slug تلقائياً مع كتابة الاسم
  const handleNameChange = (e) => {
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
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name_ar.trim()) return;
    setErrorMsg('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
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
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-base font-bold text-white mb-1">
            {t('academy.created_success', 'تم إنشاء الأكاديمية بنجاح!')}
          </h2>
          <p className="text-xs text-slate-400">
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
        <h1 className="text-white text-base font-bold">
          {t('academy.create_title', 'إنشاء أكاديمية جديدة')}
        </h1>

        {/* شريط تقدم الخطوات */}
        <div className="flex items-center gap-2 mt-3">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-amber-500' : 'w-3 bg-slate-700'}`} 
          />
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-amber-500' : 'w-3 bg-slate-700'}`} 
          />
        </div>
      </div>

      {errorMsg && (
        <div 
          className="mb-4 p-2.5 rounded-xl flex items-center gap-2 text-xs border"
          style={{ 
            backgroundColor: C?.danger?.bg || 'rgba(244, 63, 94, 0.1)',
            borderColor: C?.danger?.border || 'rgba(244, 63, 94, 0.3)',
            color: C?.danger?.text || '#F43F5E'
          }}
        >
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- الخطوة 1: اسم الأكاديمية فقط --- */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4 animate-fadeIn">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Building2 size={14} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
              <span>{t('academy.name_ar', 'اسم الأكاديمية')} *</span>
            </label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={handleNameChange}
              placeholder={t('academy.name_placeholder_example', 'أدخل اسم الأكاديمية')}
              className="w-full px-3.5 py-2.5 text-white text-xs rounded-xl border outline-none transition focus:border-amber-500"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738' 
              }}
              required
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!formData.name_ar.trim()}
              className="w-full py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-slate-950"
              style={{ backgroundColor: C?.primary?.DEFAULT || '#E07A00' }}
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
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
              <Globe size={12} className="text-amber-400" />
              <span>{t('settings.country', 'الدولة المقترحة')}</span>
            </label>
            <button
              type="button"
              onClick={() => setModalType('country')}
              className="w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs text-white"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738' 
              }}
            >
              <span className="truncate">
                {countryOptions.find((c) => c.value === formData.country)?.label || formData.country}
              </span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>
          </div>

          {/* الرواية */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
              <BookOpen size={12} className="text-amber-400" />
              <span>{t('settings.riwaya', 'الرواية الرئيسية')}</span>
            </label>
            <button
              type="button"
              onClick={() => setModalType('riwaya')}
              className="w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs text-white"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738' 
              }}
            >
              <span className="truncate">
                {riwayaOptions.find((r) => r.value === formData.riwaya)?.label}
              </span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>
          </div>

          {/* نمط التعليم */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
              <Sliders size={12} className="text-amber-400" />
              <span>{t('settings.mode', 'نموذج التعليم')}</span>
            </label>
            <select
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className="w-full px-3 py-2 text-white text-xs rounded-xl border outline-none"
              style={{ 
                backgroundColor: C?.dark?.surface || '#0A101D', 
                borderColor: C?.dark?.border || '#1B2738' 
              }}
            >
              {LEARNING_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* أزرار التحكم والرجوع */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className="py-2.5 px-3 font-semibold text-xs text-slate-300 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 transition"
            >
              {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-950"
              style={{ backgroundColor: C?.primary?.DEFAULT || '#E07A00' }}
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

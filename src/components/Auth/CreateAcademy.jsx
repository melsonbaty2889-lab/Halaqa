import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import SelectModal from './SelectModal';

// استيراد الألوان والثوابت المعتمدة
import C from '@/constants/colors';
import { COUNTRIES } from '@/constants/countries';
import { CURRENCIES } from '@/constants/currencies';
import { getRiwayatOptions } from '@/constants/riwayat';

import { 
  Building2, 
  Check, 
  Link as LinkIcon, 
  Loader2, 
  AlertCircle, 
  Upload, 
  CheckCircle2, 
  ChevronDown 
} from 'lucide-react';

export default function CreateAcademy({ onLogout, onSubmitAcademy }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [modalType, setModalType] = useState(null);

  // حالات التحقق والسحابة
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // نموذج البيانات الأساسية فقط (خالي تماماً من البيانات التجريبية)
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    slug: '',
    description: '',
    official_email: '',
    phone_whatsapp: '',
    country: 'SA',
    currency: 'SAR',
    mode: 'online',
    riwaya: 'hafs_an_asem',
    madrasa: 'mashreqi',
    logo_url: ''
  });

  // الخيارات الأساسية
  const LEARNING_MODES = [
    { value: 'online', label: t('settings.online', 'عن بُعد') },
    { value: 'onsite', label: t('settings.onsite', 'حضوري') },
    { value: 'hybrid', label: t('settings.hybrid', 'مختلط') },
  ];

  const MADRASA_OPTIONS = [
    { value: 'mashreqi', label: t('settings.mashreqi', 'النظام المشرقي') },
    { value: 'maghrebi', label: t('settings.maghrebi', 'النظام المغاربي') },
  ];

  const riwayaOptions = getRiwayatOptions(t, i18n.language);

  const countryOptions = (COUNTRIES || []).map((c) => ({
    value: c.code,
    label: isRtl ? (c.nameAr || c.name) : c.name,
  }));

  const currencyOptions = (CURRENCIES || []).map((c) => ({
    value: c.code,
    label: `${c.code} - ${isRtl ? (c.nameAr || c.name) : c.name}`,
  }));

  // التحقق التلقائي من الـ Slug
  useEffect(() => {
    const cleanSlug = formData.slug.trim().toLowerCase();
    if (!cleanSlug || cleanSlug.length < 2) {
      setIsSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const { data, error } = await supabase.rpc('check_slug_availability', {
          p_slug: cleanSlug
        });
        if (error) throw error;
        setIsSlugAvailable(Boolean(data));
      } catch (err) {
        console.error('Slug validation error:', err);
        setIsSlugAvailable(null);
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
      .replace(/[^a-z0-9-]/g, '');

    setFormData((prev) => ({
      ...prev,
      name_ar: nameVal,
      slug: prev.slug === '' || prev.slug === generatedSlug ? generatedSlug : prev.slug
    }));
  };

  const handleLogoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setErrorMsg('');

    try {
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
      console.error('Logo upload failed:', err);
      setErrorMsg(t('errors.upload_failed', 'فشل رفع الشعار، يرجى المحاولة لاحقاً'));
    } finally {
      setUploadingLogo(false);
    }
  }, [t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.rpc('create_academy_with_owner', {
        p_name: formData.name_ar.trim(),
        p_slug: formData.slug.trim().toLowerCase(),
        p_country_code: formData.country,
        p_learning_type: formData.mode,
        p_currency: formData.currency,
        p_default_qiraat: formData.riwaya,
        p_teaching_methodology: formData.madrasa,
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
      console.error('Create academy error:', error);
      setErrorMsg(
        error.message?.includes('duplicate key') || error.code === '23505'
          ? t('errors.slug_taken', 'رابط الأكاديمية مستخدم بالفعل')
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
              backgroundColor: C.success?.bg || 'rgba(16, 185, 129, 0.1)', 
              borderColor: C.success?.border || 'rgba(16, 185, 129, 0.3)',
              color: C.success?.text || '#10B981'
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-base font-bold text-white mb-1">
            {t('academy.created_success', 'تم إنشاء الأكاديمية بنجاح!')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('common.preparing_dashboard', 'جاري تجهيز النظام...')}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* الهيدر الموحد لصفحات المصادقة والتأسيس */}
      <div className="flex flex-col items-center mb-5 text-center">
        <div className="mb-2">
          <SmartHalaqaProLogo size={42} />
        </div>
        <h1 className="text-white text-lg font-bold">
          {t('academy.create_title', 'إنشاء أكاديمية جديدة')}
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          {t('academy.create_subtitle', 'أدخل البيانات الأساسية للبدء')}
        </p>
      </div>

      {errorMsg && (
        <div 
          className="mb-4 p-2.5 rounded-xl flex items-center gap-2 text-xs border"
          style={{ 
            backgroundColor: C.danger?.bg || 'rgba(244, 63, 94, 0.1)',
            borderColor: C.danger?.border || 'rgba(244, 63, 94, 0.3)',
            color: C.danger?.text || '#F43F5E'
          }}
        >
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* رفع الشعار */}
        <div 
          className="flex items-center gap-3 p-2 rounded-xl border"
          style={{ 
            backgroundColor: C.dark?.surface || '#0A101D', 
            borderColor: C.dark?.border || '#1B2738' 
          }}
        >
          <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={20} className="text-slate-500" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-slate-300 block mb-1 font-medium">
              {t('academy.logo_label', 'شعار الأكاديمية')}
            </span>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-200 rounded-lg border border-slate-700 transition">
              {uploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              <span>{t('academy.upload_logo', 'تحميل الشعار')}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                className="hidden" 
                aria-label={t('academy.upload_logo', 'تحميل الشعار')} 
              />
            </label>
          </div>
        </div>

        {/* الاسم بالعربية والإنجليزية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              {t('academy.name_ar', 'اسم الأكاديمية (بالعربية)')} *
            </label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={handleNameChange}
              placeholder={t('academy.name_ar_placeholder', 'أدخل اسم الأكاديمية')}
              className="w-full px-3 py-2 text-white text-xs rounded-xl border outline-none transition focus:border-amber-500"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              {t('academy.name_en', 'اسم الأكاديمية (بالإنجليزية)')}
            </label>
            <input
              type="text"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder={t('academy.name_en_placeholder', 'Enter academy name')}
              className="w-full px-3 py-2 text-white text-xs rounded-xl border outline-none transition focus:border-amber-500 dir-ltr"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
            />
          </div>
        </div>

        {/* الـ Slug */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
            <LinkIcon size={12} style={{ color: C.primary?.DEFAULT || '#E07A00' }} />
            <span>{t('academy.slug', 'معرف الرابط (Slug)')} *</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="academy-name"
              className="w-full px-3 py-2 text-white text-xs rounded-xl border outline-none transition focus:border-amber-500 dir-ltr pe-8"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
              required
            />
            <div className="absolute top-2.5 end-2.5 flex items-center">
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

        {/* الوصف المختصر */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-300">
            {t('academy.description', 'الوصف المختصر')}
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('academy.description_placeholder', 'نبذة مختصرة عن الأكاديمية...')}
            className="w-full px-3 py-2 text-white text-xs rounded-xl border outline-none transition focus:border-amber-500"
            style={{ 
              backgroundColor: C.dark?.surface || '#0A101D', 
              borderColor: C.dark?.border || '#1B2738' 
            }}
          />
        </div>

        {/* البريد الإلكتروني والواتساب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              {t('academy.official_email', 'البريد الرسمي')}
            </label>
            <input
              type="email"
              value={formData.official_email}
              onChange={(e) => setFormData({ ...formData, official_email: e.target.value })}
              placeholder="info@academy.com"
              className="w-full px-3 py-2 text-white text-xs rounded-xl border outline-none transition focus:border-amber-500 dir-ltr"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              {t('academy.phone_whatsapp', 'هاتف الواتساب')}
            </label>
            <input
              type="tel"
              value={formData.phone_whatsapp}
              onChange={(e) => setFormData({ ...formData, phone_whatsapp: e.target.value })}
              placeholder="+201000000000"
              className="w-full px-3 py-2 text-white text-xs rounded-xl border outline-none transition focus:border-amber-500 dir-ltr"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
            />
          </div>
        </div>

        {/* الدولة والعملة */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">{t('settings.country', 'الدولة')}</label>
            <button
              type="button"
              onClick={() => setModalType('country')}
              className="w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs text-white"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
            >
              <span className="truncate">{formData.country}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">{t('settings.currency', 'العملة')}</label>
            <button
              type="button"
              onClick={() => setModalType('currency')}
              className="w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs text-white"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
            >
              <span className="truncate">{formData.currency}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* نوع التعليم، الرواية، والمدرسة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">{t('settings.mode', 'نموذج التعليم')}</label>
            <select
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className="w-full px-2.5 py-2 text-white text-xs rounded-xl border outline-none"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
            >
              {LEARNING_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">{t('settings.riwaya', 'الرواية')}</label>
            <select
              value={formData.riwaya}
              onChange={(e) => setFormData({ ...formData, riwaya: e.target.value })}
              className="w-full px-2.5 py-2 text-white text-xs rounded-xl border outline-none"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
            >
              {riwayaOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">{t('settings.madrasa', 'المدرسة')}</label>
            <select
              value={formData.madrasa}
              onChange={(e) => setFormData({ ...formData, madrasa: e.target.value })}
              className="w-full px-2.5 py-2 text-white text-xs rounded-xl border outline-none"
              style={{ 
                backgroundColor: C.dark?.surface || '#0A101D', 
                borderColor: C.dark?.border || '#1B2738' 
              }}
            >
              {MADRASA_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* زر التأسيس الموحد */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting || isSlugAvailable === false}
            className="w-full py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[44px] text-slate-950"
            style={{ 
              backgroundColor: C.primary?.DEFAULT || '#E07A00'
            }}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Check size={16} />
                <span>{t('academy.establish_button', 'تأسيس الأكاديمية')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* مودال اختيار الدولة والعملة */}
      <SelectModal
        isOpen={modalType === 'country'}
        onClose={() => setModalType(null)}
        title={t('settings.select_country', 'اختر الدولة')}
        options={countryOptions}
        selectedValue={formData.country}
        onSelect={(val) => setFormData((prev) => ({ ...prev, country: val }))}
      />

      <SelectModal
        isOpen={modalType === 'currency'}
        onClose={() => setModalType(null)}
        title={t('settings.select_currency', 'اختر العملة')}
        options={currencyOptions}
        selectedValue={formData.currency}
        onSelect={(val) => setFormData((prev) => ({ ...prev, currency: val }))}
      />
    </AuthLayout>
  );
}

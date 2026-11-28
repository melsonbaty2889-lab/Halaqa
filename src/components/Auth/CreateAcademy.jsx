import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout, { APP_SUBTITLES } from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { PrimaryButton } from '@/components/UI/AuthButtons';
import Toast from '@/components/UI/Toast';
import { useToast } from '@/hooks/useToast';
import { C } from '@/theme/colors';
import { useCreateAcademy } from '@/hooks/useCreateAcademy';
import { useAcademy } from '@/context/AcademyContext';
import Select from '@/components/UI/Select.jsx';
import { COUNTRIES_LIST } from '@/constants/countries.js';

import { Building2, CheckCircle2, Globe, AlertCircle } from 'lucide-react';

export default function CreateAcademy({ onSubmitAcademy }) {
  const { t, i18n } = useTranslation();
  const { toastState, showToast, hideToast } = useToast();
  const { refreshStatus } = useAcademy() || {};

  const currentLang = i18n?.language?.split('-')[0] || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);
  const isAr = currentLang === 'ar';

  const appSubtitle = APP_SUBTITLES[currentLang] || APP_SUBTITLES.ar;

  const [academyData, setAcademyData] = useState({
    name: '',
    country_code: 'EG',
  });

  const updateField = (field, value) => {
    setAcademyData((prev) => ({ ...prev, [field]: value }));
  };

  const {
    isSubmitting,
    isSuccess,
    errorMsg,
    handleSubmit: submitHookHandler,
  } = useCreateAcademy(async (data) => {
    if (typeof refreshStatus === 'function') {
      await refreshStatus();
    }

    if (typeof onSubmitAcademy === 'function') {
      await onSubmitAcademy({
        ...data,
        ...academyData,
      });
    }
  });

  useEffect(() => {
    if (errorMsg) {
      showToast(errorMsg, 'error');
    }
  }, [errorMsg, showToast]);

  const countryOptions = useMemo(() => {
    return (COUNTRIES_LIST || []).map((country) => ({
      label: `${country.flag} ${isAr ? country.nameAr : country.nameEn}`,
      value: country.code,
    }));
  }, [isAr]);

  const generateSlugPreview = (name) => {
    const latinPart = String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);

    return latinPart ? `${latinPart}-xxxxx` : 'academy-xxxxx';
  };

  const currentHost = typeof window !== 'undefined' ? window.location.host : 'localhost';

  if (isSuccess) {
    return (
      <AuthLayout langBtn={<LanguageSwitcher />} subtitle={appSubtitle}>
        <div
          className="flex flex-col items-center justify-center py-6 text-center animate-fadeIn"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
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
    <AuthLayout langBtn={<LanguageSwitcher />} subtitle={appSubtitle}>
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
              color: C?.error?.DEFAULT || '#EF4444',
            }}
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitHookHandler(e, academyData);
          }}
          className="space-y-3.5 animate-fadeIn"
          noValidate
        >
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
                color: C?.text?.title,
              }}
              required
              autoFocus
            />
            <div
              className="flex items-center gap-1.5 px-1 pt-0.5 text-[10px] font-mono tracking-tight opacity-75"
              style={{ color: C?.text?.muted }}
            >
              <Globe size={11} style={{ color: C?.amber?.DEFAULT }} />
              <span className="truncate" dir="ltr">
                {currentHost}/{generateSlugPreview(academyData.name)}
              </span>
            </div>
          </div>

          <div className="!overflow-visible">
            <Select
              title={t('settings.country', 'الدولة')}
              value={academyData.country_code}
              onChange={(val) => updateField('country_code', val)}
              options={countryOptions}
            />
          </div>

          <div className="pt-2">
            <PrimaryButton loading={isSubmitting} disabled={!academyData.name.trim()}>
              {t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
            </PrimaryButton>
          </div>
        </form>
      </div>

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={hideToast}
      />
    </AuthLayout>
  );
}

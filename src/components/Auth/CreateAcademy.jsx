import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import { C } from '@/theme/colors';
import { useCreateAcademy } from '@/hooks/useCreateAcademy';

import { Building2, Check, Loader2, AlertCircle, CheckCircle2, Globe } from 'lucide-react';

export default function CreateAcademy({ onSubmitAcademy }) {
  const { t } = useTranslation();
  const {
    academyName,
    setAcademyName,
    isSubmitting,
    isSuccess,
    errorMsg,
    handleSubmit
  } = useCreateAcademy(onSubmitAcademy);

  // دالة مساعدة لتوليد معاينة الـ slug بشكل نظيف وسلس
  const generateSlugPreview = (name) => {
    if (!name) return 'academy-name';
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0621-\u064A\-]+/g, '') // السماح بالعربية والأنجليزية والشرطات
      .slice(0, 30);
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-6 text-center animate-fadeIn">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border shadow-lg bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          >
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-base font-bold mb-1" style={{ color: C.text?.title }}>
            {t('academy.created_success', 'تم إنشاء الأكاديمية بنجاح!')}
          </h2>
          <p className="text-xs font-medium" style={{ color: C.text?.muted }}>
            {t('common.preparing_dashboard', 'جاري تجهيز لوحة التحكم...')}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-4 text-center">
        <h2 className="text-base font-bold" style={{ color: C.text?.title }}>
          {t('academy.create_title', 'إنشاء أكاديمية جديدة')}
        </h2>
        <p className="text-xs font-medium mt-1" style={{ color: C.text?.muted }}>
          {t('academy.create_subtitle', 'قم بإدخال اسم المقرأة أو الأكاديمية لبدء إعداد النظام')}
        </p>
      </div>

      {errorMsg && (
        <div 
          className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs border"
          role="alert"
          style={{ 
            backgroundColor: `${C.error?.DEFAULT}15`,
            borderColor: C.error?.DEFAULT,
            color: C.error?.DEFAULT
          }}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn" noValidate>
        <div className="space-y-1.5">
          <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: C.text?.body }}>
            <Building2 size={14} style={{ color: C.amber?.DEFAULT }} />
            <span>{t('academy.name', 'اسم الأكاديمية')} *</span>
          </label>
          <input
            type="text"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            placeholder={t('academy.name_placeholder', 'أدخل اسم الأكاديمية')}
            className="w-full px-3.5 min-h-[44px] text-xs rounded-xl border outline-none transition focus:border-amber-500"
            style={{ 
              backgroundColor: C.inputs?.bg, 
              borderColor: C.inputs?.border,
              color: C.text?.title
            }}
            aria-label={t('academy.name', 'اسم الأكاديمية')}
            required
            autoFocus
          />
          
          {/* معاينة الرابط الفورية (Slug Preview) */}
          <div className="flex items-center gap-1.5 px-1 pt-1 text-[11px] font-mono tracking-tight opacity-80" style={{ color: C.text?.muted }}>
            <Globe size={12} style={{ color: C.amber?.DEFAULT }} />
            <span className="truncate">
              {window.location.host}/{generateSlugPreview(academyName)}/...
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!academyName.trim() || isSubmitting}
            title={t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
            aria-label={t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
            className="w-full min-h-[44px] py-2.5 px-4 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-white active:scale-[0.98]"
            style={{ 
              background: C.gradients?.primaryBtn
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
      </form>
    </AuthLayout>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import C from '@/theme/colors';
import { useCreateAcademy } from '@/hooks/useCreateAcademy';

import { Building2, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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
          <h2 className="text-base font-bold mb-1" style={{ color: C?.text?.primary || '#FFFFFF' }}>
            {t('academy.created_success', 'تم إنشاء الأكاديمية بنجاح!')}
          </h2>
          <p className="text-xs" style={{ color: C?.text?.secondary || '#94A3B8' }}>
            {t('common.preparing_dashboard', 'جاري تجهيز لوحة التحكم...')}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-5 text-center">
        <div className="mb-2">
          <SmartHalaqaProLogo size={40} />
        </div>
        <h1 className="text-base font-bold" style={{ color: C?.text?.primary || '#FFFFFF' }}>
          {t('academy.create_title', 'إنشاء أكاديمية جديدة')}
        </h1>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: C?.text?.primary || '#FFFFFF' }}>
            <Building2 size={14} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
            <span>{t('academy.name', 'اسم الأكاديمية')} *</span>
          </label>
          <input
            type="text"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            placeholder={t('academy.name_placeholder', 'أدخل اسم الأكاديمية')}
            className="w-full px-3.5 min-h-[44px] text-xs rounded-xl border outline-none transition"
            style={{ 
              backgroundColor: C?.dark?.surface || '#0A101D', 
              borderColor: C?.dark?.border || '#1B2738',
              color: C?.text?.primary || '#FFFFFF'
            }}
            aria-label={t('academy.name', 'اسم الأكاديمية')}
            required
            autoFocus
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!academyName.trim() || isSubmitting}
            title={t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
            aria-label={t('academy.finish_setup', 'تأكيد وتأسيس الأكاديمية')}
            className="w-full min-h-[44px] py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
      </form>
    </AuthLayout>
  );
}

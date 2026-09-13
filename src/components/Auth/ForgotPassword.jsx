import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout, { APP_SUBTITLES } from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { PrimaryButton } from '@/components/UI/AuthButtons';
import { C } from '@/theme/colors';
import { useForgotPassword } from '@/hooks/useForgotPassword';

import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export default function ForgotPassword({ onBackToLogin }) {
  const { t, i18n } = useTranslation();
  
  // استخراج بيانات الـ Hook
  const {
    email,
    setEmail,
    loading,
    isSubmitted,
    cooldown,
    status,
    handleReset,
    isRtl,
    currentLang: hookLang
  } = useForgotPassword();

  // تحديد كود اللغة الحالية والاسم الفرعي أسفل اللوجو
  const currentLang = i18n?.language?.split('-')[0] || hookLang || 'ar';
  const appSubtitle = APP_SUBTITLES[currentLang] || APP_SUBTITLES.ar;

  return (
    <AuthLayout 
      langBtn={<LanguageSwitcher />} 
      subtitle={appSubtitle}
    >
      <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        {!isSubmitted ? (
          <>
            <div className="text-center mb-5">
              <h2 
                className="text-lg sm:text-xl font-extrabold tracking-tight mb-1"
                style={{ color: C?.text?.title }}
              >
                {t('auth.reset_password_heading', 'استعادة كلمة المرور')}
              </h2>
              <p 
                className="text-xs font-medium leading-relaxed max-w-xs mx-auto m-0"
                style={{ color: C?.text?.muted }}
              >
                {t('auth.reset_password_desc', 'أدخل بريدك الإلكتروني المسجل لإرسال رابط آمن لإعادة التعيين')}
              </p>
            </div>

            {/* التنبيهات والأخطاء */}
            {status?.msg && (
              <div 
                className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 border transition-all"
                role="alert"
                style={{
                  backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  borderColor: status.type === 'success' ? (C?.emerald?.DEFAULT || '#10B981') : (C?.error?.DEFAULT || '#EF4444'),
                  color: status.type === 'success' ? (C?.emerald?.DEFAULT || '#10B981') : (C?.error?.DEFAULT || '#EF4444'),
                }}
              >
                <AlertCircle size={16} className="shrink-0" />
                <div>{status.msg}</div>
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-3.5" noValidate>
              <div className="relative flex items-center">
                <Mail 
                  size={18} 
                  className={`absolute pointer-events-none transition-colors inset-y-auto ${
                    isRtl ? 'right-3.5' : 'left-3.5'
                  }`}
                  style={{ color: email ? (C?.amber?.DEFAULT || '#D97706') : C?.text?.muted }}
                />
                <input 
                  type="email"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder', 'البريد الإلكتروني')}
                  required
                  dir="ltr"
                  aria-label={t('auth.email_placeholder', 'البريد الإلكتروني')}
                  className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all text-start font-sans min-h-[44px] ${
                    isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                  }`}
                  style={{
                    backgroundColor: C?.inputs?.bg,
                    borderColor: C?.inputs?.border,
                    color: C?.text?.title,
                  }}
                />
              </div>

              {/* زر إرسال الرابط الرئيسي الموحد */}
              <PrimaryButton 
                loading={loading}
                disabled={cooldown > 0}
              >
                {t('auth.send_reset_link', 'إرسال رابط الحماية')}
              </PrimaryButton>
            </form>
          </>
        ) : (
          <div className="text-center py-2 animate-fadeIn">
            <CheckCircle2 
              size={48} 
              className="mx-auto mb-3"
              style={{ color: C?.emerald?.DEFAULT || '#10B981' }} 
            />
            <h2 
              className="text-lg font-bold mb-2"
              style={{ color: C?.text?.title }}
            >
              {t('auth.check_inbox_title', 'تحقق من صندوق البريد')}
            </h2>
            <p 
              className="text-xs leading-relaxed mb-4"
              style={{ color: C?.text?.muted }}
            >
              {t('auth.reset_link_sent_to', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى:')}
              <br />
              <strong className="break-all" style={{ color: C?.amber?.DEFAULT || '#D97706' }}>
                {email}
              </strong>
            </p>

            <button
              type="button"
              onClick={handleReset}
              disabled={cooldown > 0 || loading}
              title={t('auth.resend_link', 'إعادة إرسال الرابط')}
              aria-label={t('auth.resend_link', 'إعادة إرسال الرابط')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold border disabled:opacity-50 cursor-pointer transition-all mb-2"
              style={{
                backgroundColor: C?.inputs?.bg,
                borderColor: C?.inputs?.border,
                color: C?.text?.title,
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>
                {cooldown > 0 
                  ? t('auth.resend_cooldown', `إعادة الإرسال بعد (${cooldown} ثانية)`, { count: cooldown })
                  : t('auth.resend_link', 'إعادة إرسال الرابط')}
              </span>
            </button>
          </div>
        )}

        {/* العودة لتسجيل الدخول */}
        <div className="mt-5 text-center flex items-center justify-center">
          <button 
            type="button"
            onClick={onBackToLogin} 
            title={t('auth.back_to_login', 'العودة لتسجيل الدخول')}
            aria-label={t('auth.back_to_login', 'العودة لتسجيل الدخول')}
            className="bg-transparent border-none cursor-pointer inline-flex items-center gap-2 text-xs font-semibold transition-colors min-h-[44px] px-2 hover:underline"
            style={{ color: C?.text?.muted }}
          >
            {isRtl ? (
              <ArrowRight size={16} style={{ color: C?.amber?.DEFAULT || '#D97706' }} />
            ) : (
              <ArrowLeft size={16} style={{ color: C?.amber?.DEFAULT || '#D97706' }} />
            )}
            <span>{t('auth.back_to_login', 'العودة لتسجيل الدخول')}</span>
          </button>
        </div>

        {/* شارة الأمان */}
        <div 
          className="flex items-center justify-center gap-1.5 text-[11px] mt-4 opacity-75"
          style={{ color: C?.text?.muted }}
        >
          <ShieldCheck size={14} style={{ color: C?.emerald?.DEFAULT || '#10B981' }} />
          <span>
            {t('auth.ssl_secured', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}

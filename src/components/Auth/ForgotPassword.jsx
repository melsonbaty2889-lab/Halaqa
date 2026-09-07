import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import C from '@/theme/colors';
import { useForgotPassword } from '@/hooks/useForgotPassword';

import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  Globe, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export default function ForgotPassword({ onBackToLogin }) {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    loading,
    isSubmitted,
    cooldown,
    status,
    toggleLanguage,
    handleReset,
    isRtl,
    currentLang
  } = useForgotPassword();

  const langBtn = (
    <button
      type="button"
      onClick={toggleLanguage}
      title={t('common.switch_language', 'تغيير اللغة')}
      aria-label={t('common.switch_language', 'تغيير اللغة')}
      className="border hover:opacity-90 py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg z-50 transition-all min-h-[36px]"
      style={{
        backgroundColor: C?.dark?.surface || '#0A101D',
        borderColor: C?.dark?.border || '#1B2738',
        color: C?.text?.primary || '#FFFFFF'
      }}
    >
      <Globe size={14} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
      <span>{currentLang === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );

  return (
    <AuthLayout langBtn={langBtn}>
      {/* الشعار والعنوان */}
      <div className="flex flex-col items-center mb-5 text-center">
        <div className="mb-2">
          <SmartHalaqaProLogo size={52} />
        </div>
        <h1 
          className="text-2xl font-extrabold tracking-tight mt-1 mb-0.5"
          style={{ color: C?.text?.primary || '#FFFFFF' }}
        >
          {t('app.name', 'الحلقة الذكية')}
        </h1>
        <p 
          className="text-[11px] font-bold tracking-wider uppercase m-0"
          style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
        >
          {t('app.tagline', 'منصة إدارة المقارئ والأكاديميات')}
        </p>
      </div>

      {!isSubmitted ? (
        <>
          <h2 
            className="text-lg text-center mb-1 font-semibold"
            style={{ color: C?.text?.primary || '#FFFFFF' }}
          >
            {t('auth.reset_password_heading', 'استعادة كلمة المرور')}
          </h2>
          <p 
            className="text-xs text-center mb-5 max-w-[300px] mx-auto leading-relaxed"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            {t('auth.reset_password_desc', 'أدخل بريدك الإلكتروني المسجل لإرسال رابط آمن لإعادة التعيين')}
          </p>

          {/* التنبيهات */}
          {status.msg && (
            <div 
              className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 border"
              role="alert"
              style={{
                backgroundColor: C?.danger?.bg || 'rgba(244, 63, 94, 0.1)',
                borderColor: C?.danger?.border || 'rgba(244, 63, 94, 0.3)',
                color: C?.danger?.text || '#F43F5E'
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <div>{status.msg}</div>
            </div>
          )}

          <form onSubmit={handleReset} className="flex flex-col gap-3.5">
            <div className="relative flex items-center">
              <Mail 
                size={18} 
                className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors`}
                style={{ color: email ? (C?.primary?.DEFAULT || '#E07A00') : (C?.text?.muted || '#475569') }}
              />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder', 'البريد الإلكتروني')}
                required
                dir="ltr"
                aria-label={t('auth.email_placeholder', 'البريد الإلكتروني')}
                className={`w-full min-h-[44px] py-2.5 ${isRtl ? 'pe-3.5 ps-11 text-right' : 'ps-11 pe-3.5 text-left'} rounded-xl border outline-none transition-all`}
                style={{
                  backgroundColor: C?.dark?.surface || '#0A101D',
                  borderColor: C?.dark?.border || '#1B2738',
                  color: C?.text?.primary || '#FFFFFF'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || cooldown > 0}
              title={t('auth.send_reset_link', 'إرسال رابط الحماية')}
              aria-label={t('auth.send_reset_link', 'إرسال رابط الحماية')}
              className="w-full min-h-[44px] py-2.5 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60"
              style={{
                backgroundColor: C?.primary?.DEFAULT || '#E07A00',
                color: C?.primary?.text || '#000000'
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>{t('auth.send_reset_link', 'إرسال رابط الحماية')}</span>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-2 animate-fadeIn">
          <CheckCircle2 
            size={48} 
            className="mx-auto mb-3"
            style={{ color: C?.success?.text || '#10B981' }} 
          />
          <h2 
            className="text-lg font-bold mb-2"
            style={{ color: C?.text?.primary || '#FFFFFF' }}
          >
            {t('auth.check_inbox_title', 'تحقق من صندوق البريد')}
          </h2>
          <p 
            className="text-xs leading-relaxed mb-4"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            {t('auth.reset_link_sent_to', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى:')}
            <br />
            <strong className="break-all" style={{ color: C?.primary?.DEFAULT || '#E07A00' }}>
              {email}
            </strong>
          </p>

          <button
            type="button"
            onClick={handleReset}
            disabled={cooldown > 0 || loading}
            title={t('auth.resend_link', 'إعادة إرسال الرابط')}
            aria-label={t('auth.resend_link', 'إعادة إرسال الرابط')}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold border disabled:opacity-50 cursor-pointer transition-all mb-2"
            style={{
              backgroundColor: C?.dark?.surface || '#0A101D',
              borderColor: C?.dark?.border || '#1B2738',
              color: C?.text?.primary || '#FFFFFF'
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
      <div className="mt-5 text-center">
        <button 
          type="button"
          onClick={onBackToLogin} 
          title={t('auth.back_to_login', 'العودة لتسجيل الدخول')}
          aria-label={t('auth.back_to_login', 'العودة لتسجيل الدخول')}
          className="bg-transparent border-none cursor-pointer inline-flex items-center gap-2 text-xs font-semibold transition-colors min-h-[44px] px-2"
          style={{ color: C?.text?.secondary || '#94A3B8' }}
        >
          {isRtl ? (
            <ArrowRight size={16} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
          ) : (
            <ArrowLeft size={16} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
          )}
          <span>{t('auth.back_to_login', 'العودة لتسجيل الدخول')}</span>
        </button>
      </div>

      {/* شارة الأمان */}
      <div 
        className="flex items-center justify-center gap-1.5 text-[11px] mt-5"
        style={{ color: C?.text?.muted || '#475569' }}
      >
        <ShieldCheck size={14} style={{ color: C?.success?.text || '#10B981' }} />
        <span>
          {t('auth.ssl_secured', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}
        </span>
      </div>
    </AuthLayout>
  );
}

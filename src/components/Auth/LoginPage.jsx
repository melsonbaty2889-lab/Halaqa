import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from '@/hooks/useLoginForm';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import C from '@/theme/colors';

import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Globe, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';

export default function LoginPage({ onSwitchToSignUp, onForgotPassword, onLoginSuccess }) {
  const { t, i18n } = useTranslation();
  
  const {
    isRtl,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    loading,
    redirecting,
    capsLockOn,
    cooldown,
    fieldErrors,
    setFieldErrors,
    status,
    showResend,
    resendLoading,
    toggleLanguage,
    handleKeyUp,
    handleEmailLogin,
    handleResendEmail,
    handleGoogleLogin,
  } = useLoginForm(onLoginSuccess);

  // زر تغيير اللغة
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
      <span>{i18n?.language === 'ar' ? 'English' : 'العربية'}</span>
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

      <h2 
        className="text-lg text-center mb-1 font-semibold"
        style={{ color: C?.text?.primary || '#FFFFFF' }}
      >
        {t('auth.login_title', 'تسجيل الدخول')}
      </h2>
      <p 
        className="text-xs text-center mb-5 max-w-[300px] mx-auto leading-relaxed"
        style={{ color: C?.text?.secondary || '#94A3B8' }}
      >
        {t('auth.login_subtitle', 'أهلاً بعودتك! ادخل لمتابعة إدارة حلقاتك التعليمية')}
      </p>

      {/* التسجيل عبر Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || redirecting}
        title={t('auth.continue_google', 'المتابعة بواسطة Google')}
        aria-label={t('auth.continue_google', 'المتابعة بواسطة Google')}
        className="w-full min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer mb-4 transition-all disabled:opacity-50"
        style={{
          backgroundColor: C?.dark?.surface || '#162032',
          borderColor: C?.dark?.border || '#1B2738',
          color: C?.text?.primary || '#FFFFFF'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>{t('auth.continue_google', 'المتابعة بواسطة Google')}</span>
      </button>

      {/* فاصل */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex-1 h-px" style={{ backgroundColor: C?.dark?.border || '#1B2738' }}></div>
        <span className="text-xs" style={{ color: C?.text?.muted || '#475569' }}>
          {t('common.or_via_email', 'أو عبر البريد')}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: C?.dark?.border || '#1B2738' }}></div>
      </div>

      {/* التنبيهات */}
      {status.msg && (
        <div 
          className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex flex-col gap-2 border"
          role="alert"
          style={{
            backgroundColor: status.type === 'success' ? (C?.success?.bg || 'rgba(16, 185, 129, 0.1)') : (C?.danger?.bg || 'rgba(244, 63, 94, 0.1)'),
            borderColor: status.type === 'success' ? (C?.success?.border || 'rgba(16, 185, 129, 0.3)') : (C?.danger?.border || 'rgba(244, 63, 94, 0.3)'),
            color: status.type === 'success' ? (C?.success?.text || '#10B981') : (C?.danger?.text || '#F43F5E')
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <div>{status.msg}</div>
          </div>

          {showResend && (
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resendLoading || cooldown > 0}
              title={t('auth.resend_activation', 'إعادة إرسال رابط التفعيل')}
              aria-label={t('auth.resend_activation', 'إعادة إرسال رابط التفعيل')}
              className="self-start rounded px-2.5 py-1 text-[11px] font-bold cursor-pointer disabled:opacity-60 transition-all min-h-[32px]"
              style={{
                backgroundColor: C?.primary?.DEFAULT || '#E07A00',
                color: C?.primary?.text || '#000000'
              }}
            >
              {resendLoading 
                ? t('common.sending', 'جاري الإرسال...') 
                : cooldown > 0 
                  ? t('auth.resend_cooldown', `انتظر (${cooldown} ثانية)`, { count: cooldown })
                  : t('auth.resend_activation', 'إعادة إرسال رابط التفعيل؟')}
            </button>
          )}
        </div>
      )}

      {/* نموذج تسجيل الدخول */}
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
        
        {/* حقل البريد الإلكتروني */}
        <div className="relative flex flex-col">
          <div className="relative flex items-center">
            <Mail 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors`}
              style={{ color: email ? (C?.primary?.DEFAULT || '#E07A00') : (C?.text?.muted || '#475569') }}
            />
            <input 
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder={t('auth.email_placeholder', 'البريد الإلكتروني')}
              required
              aria-label={t('auth.email_placeholder', 'البريد الإلكتروني')}
              className={`w-full min-h-[44px] py-2.5 ${isRtl ? 'pe-3.5 ps-11 text-right' : 'ps-11 pe-3.5 text-left'} rounded-xl border text-xs outline-none transition-all`}
              style={{
                backgroundColor: C?.dark?.surface || '#0A101D',
                borderColor: fieldErrors.email ? (C?.danger?.text || '#F43F5E') : (C?.dark?.border || '#1B2738'),
                color: C?.text?.primary || '#FFFFFF'
              }}
            />
          </div>
          {fieldErrors.email && (
            <span className="text-[11px] mt-1 block font-medium" style={{ color: C?.danger?.text || '#F43F5E' }}>
              {fieldErrors.email}
            </span>
          )}
        </div>

        {/* حقل كلمة المرور */}
        <div className="relative flex flex-col">
          <div className="relative flex items-center">
            <Lock 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors`}
              style={{ color: password ? (C?.primary?.DEFAULT || '#E07A00') : (C?.text?.muted || '#475569') }}
            />
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onKeyUp={handleKeyUp}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder={t('auth.password_placeholder', 'كلمة المرور')}
              required
              aria-label={t('auth.password_placeholder', 'كلمة المرور')}
              className={`w-full min-h-[44px] py-2.5 ${isRtl ? 'ps-11 pe-11 text-right' : 'ps-11 pe-11 text-left'} rounded-xl border text-xs outline-none transition-all`}
              style={{
                backgroundColor: C?.dark?.surface || '#0A101D',
                borderColor: fieldErrors.password ? (C?.danger?.text || '#F43F5E') : (C?.dark?.border || '#1B2738'),
                color: C?.text?.primary || '#FFFFFF'
              }}
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? t('auth.hide_password', 'إخفاء كلمة المرور') : t('auth.show_password', 'إظهار كلمة المرور')}
              aria-label={showPassword ? t('auth.hide_password', 'إخفاء كلمة المرور') : t('auth.show_password', 'إظهار كلمة المرور')}
              className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} bg-transparent border-none cursor-pointer flex items-center p-1 min-h-[36px]`}
              style={{ color: C?.text?.muted || '#475569' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {fieldErrors.password && (
            <span className="text-[11px] mt-1 block font-medium" style={{ color: C?.danger?.text || '#F43F5E' }}>
              {fieldErrors.password}
            </span>
          )}

          {capsLockOn && (
            <div className="flex items-center gap-1 text-[11px] mt-1 font-semibold" style={{ color: C?.primary?.DEFAULT || '#E07A00' }}>
              <AlertTriangle size={13} />
              <span>{t('auth.caps_lock_on', 'مفتاح الحروف الكبيرة (Caps Lock) مفعل')}</span>
            </div>
          )}
        </div>

        {/* تذكرني واستعادة كلمة السر */}
        <div className="flex justify-between items-center text-xs mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none min-h-[36px]" style={{ color: C?.text?.secondary || '#94A3B8' }}>
            <input 
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 cursor-pointer rounded"
              style={{ accentColor: C?.primary?.DEFAULT || '#E07A00' }}
            />
            <span>{t('auth.remember_me', 'تذكرني')}</span>
          </label>

          <button 
            type="button"
            onClick={onForgotPassword}
            title={t('auth.forgot_password', 'نسيت كلمة المرور؟')}
            aria-label={t('auth.forgot_password', 'نسيت كلمة المرور؟')}
            className="bg-transparent border-none hover:underline cursor-pointer font-medium text-xs min-h-[36px] px-1"
            style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
          >
            {t('auth.forgot_password', 'نسيت كلمة المرور؟')}
          </button>
        </div>

        {/* زر الإرسال */}
        <button 
          type="submit" 
          disabled={loading || redirecting}
          title={t('auth.login_title', 'تسجيل الدخول')}
          aria-label={t('auth.login_title', 'تسجيل الدخول')}
          className="w-full min-h-[44px] py-2.5 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
          style={{
            backgroundColor: C?.primary?.DEFAULT || '#E07A00',
            color: C?.primary?.text || '#000000'
          }}
        >
          {redirecting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{t('common.preparing_dashboard', 'جاري تجهيز لوحة التحكم...')}</span>
            </>
          ) : loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{t('common.verifying', 'جاري التحقق...')}</span>
            </>
          ) : (
            <span>{t('auth.login_title', 'تسجيل الدخول')}</span>
          )}
        </button>
      </form>

      {/* شارة التشفير والأمان */}
      <div 
        className="flex items-center justify-center gap-1.5 text-[11px] mt-5"
        style={{ color: C?.text?.muted || '#475569' }}
      >
        <ShieldCheck size={14} style={{ color: C?.success?.text || '#10B981' }} />
        <span>
          {t('auth.ssl_secured', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}
        </span>
      </div>

      {/* التحويل لإنشاء حساب */}
      <div className="mt-4 text-center text-xs" style={{ color: C?.text?.secondary || '#94A3B8' }}>
        <span>{t('auth.no_account', 'ليس لديك حساب؟')}</span>{' '}
        <button 
          type="button"
          onClick={onSwitchToSignUp} 
          title={t('auth.create_account', 'إنشاء حساب جديد')}
          aria-label={t('auth.create_account', 'إنشاء حساب جديد')}
          className="bg-transparent border-none font-bold cursor-pointer hover:underline p-0 ms-1 min-h-[36px]"
          style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
        >
          {t('auth.create_account', 'إنشاء حساب جديد')}
        </button>
      </div>
    </AuthLayout>
  );
}

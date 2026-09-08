import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from '@/hooks/useLoginForm';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import C from '@/theme/colors';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage({ onNavigate, onSuccess }) {
  const { t, i18n } = useTranslation();

  const {
    isRtl,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    fieldErrors,
    status,
    handleEmailLogin,
    handleGoogleLogin,
  } = useLoginForm(onSuccess);

  const [localError, setLocalError] = useState('');

  const currentLang = i18n?.language || 'ar';

  useEffect(() => {
    document.title = `${t('auth.login')} | ${t('common.appName')}`;
  }, [currentLang, t]);

  const handleNavigation = (e, targetPage) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onNavigate === 'function') {
      onNavigate(targetPage);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim()) {
      setLocalError(t('auth.emailRequired'));
      return;
    }

    if (!password.trim()) {
      setLocalError(t('auth.passwordRequired'));
      return;
    }

    handleEmailLogin(e);
  };

  const activeError = localError || status.msg || fieldErrors.email || fieldErrors.password;

  return (
    <AuthLayout langBtn={<LanguageSwitcher />}>
      <div className="w-full flex flex-col justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full">
          {/* الشعار واسم المنصة */}
          <div className="flex flex-col items-center mb-5 text-center">
            <div className="mb-2 drop-shadow-md">
              <SmartHalaqaProLogo size={52} />
            </div>
            <h1
              className="text-2xl font-extrabold tracking-tight mt-1 mb-0.5 font-sans"
              style={{ color: C?.text?.primary || '#FFFFFF' }}
            >
              {t('common.appName')}
            </h1>
            <p
              className="text-[11px] font-bold tracking-wider uppercase m-0"
              style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
            >
              {t('auth.platformSubtitle')}
            </p>
          </div>

          <h2
            className="text-lg text-center mb-1 font-semibold"
            style={{ color: C?.text?.primary || '#FFFFFF' }}
          >
            {t('auth.loginTitle')}
          </h2>
          <p
            className="text-xs text-center mb-5 leading-relaxed"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            {t('auth.loginDesc')}
          </p>

          {/* التنبيهات والأخطاء */}
          {activeError && (
            <div
              className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 border animate-fadeIn"
              style={{
                backgroundColor: status.type === 'success' 
                  ? (C?.success?.bg || 'rgba(16, 185, 129, 0.1)') 
                  : (C?.danger?.bg || 'rgba(244, 63, 94, 0.1)'),
                color: status.type === 'success' 
                  ? (C?.success?.text || '#10B981') 
                  : (C?.danger?.text || '#F43F5E'),
                borderColor: status.type === 'success' 
                  ? (C?.success?.border || 'rgba(16, 185, 129, 0.3)') 
                  : (C?.danger?.border || 'rgba(244, 63, 94, 0.3)'),
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <div>{activeError}</div>
            </div>
          )}

          {/* نموذج الدخول */}
          <form onSubmit={handleSubmitForm} noValidate className="flex flex-col gap-3.5">
            {/* البريد الإلكتروني */}
            <div className="relative flex items-center">
              <Mail
                size={18}
                className={`absolute pointer-events-none transition-colors inset-y-auto ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: email
                    ? C?.primary?.DEFAULT || '#E07A00'
                    : C?.text?.secondary || '#94A3B8',
                }}
              />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  if (localError) setLocalError('');
                  setEmail(e.target.value);
                }}
                placeholder={t('auth.emailPlaceholder')}
                aria-label={t('auth.emailPlaceholder')}
                dir="ltr"
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px] ${
                  isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                }`}
                style={{
                  borderColor: C?.dark?.border || '#1B2738',
                  backgroundColor: C?.dark?.surfaceInput || '#0A101D',
                  color: C?.text?.primary || '#FFFFFF',
                }}
              />
            </div>

            {/* كلمة المرور */}
            <div className="relative flex items-center">
              <Lock
                size={18}
                className={`absolute pointer-events-none transition-colors inset-y-auto ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: password
                    ? C?.primary?.DEFAULT || '#E07A00'
                    : C?.text?.secondary || '#94A3B8',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => {
                  if (localError) setLocalError('');
                  setPassword(e.target.value);
                }}
                placeholder={t('auth.passwordPlaceholder')}
                aria-label={t('auth.passwordPlaceholder')}
                dir="ltr"
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px] ${
                  isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11'
                }`}
                style={{
                  borderColor: C?.dark?.border || '#1B2738',
                  backgroundColor: C?.dark?.surfaceInput || '#0A101D',
                  color: C?.text?.primary || '#FFFFFF',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-20 ${
                  isRtl ? 'left-2.5' : 'right-2.5'
                }`}
                style={{ color: C?.text?.secondary || '#94A3B8' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* نسيت كلمة المرور */}
            <div className="flex justify-end relative z-20">
              <button
                type="button"
                onClick={(e) => handleNavigation(e, 'forgot-password')}
                className="text-xs hover:underline cursor-pointer min-h-[44px] inline-flex items-center px-1"
                style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
              >
                {t('auth.forgotPassword')}
              </button>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60 min-h-[44px] relative z-20"
              style={{
                backgroundColor: C?.primary?.DEFAULT || '#E07A00',
                color: C?.primary?.text || '#000000',
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>{t('auth.login')}</span>
              )}
            </button>
          </form>

          {/* فاصل "أو" */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t w-full" style={{ borderColor: C?.dark?.border || '#1B2738' }} />
            <span
              className="absolute px-3 text-[10px] uppercase font-mono rounded-full"
              style={{
                backgroundColor: C?.dark?.card || '#0F172A',
                color: C?.text?.secondary || '#94A3B8',
              }}
            >
              {t('auth.or')}
            </span>
          </div>

          {/* زر Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 font-semibold text-xs rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] relative z-20 disabled:opacity-60 hover:bg-white/5"
            style={{
              borderColor: C?.dark?.border || '#1B2738',
              backgroundColor: C?.dark?.surfaceInput || '#0A101D',
              color: C?.text?.primary || '#FFFFFF',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t('auth.loginWithGoogle')}</span>
          </button>

          {/* إنشاء حساب جديد */}
          <div
            className="text-center mt-5 text-xs flex items-center justify-center gap-1 relative z-20"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            <span>{t('auth.noAccount')}</span>
            <button
              type="button"
              onClick={(e) => handleNavigation(e, 'signup')}
              className="font-bold hover:underline cursor-pointer min-h-[44px] inline-flex items-center px-1"
              style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
            >
              {t('auth.createNewAccount')}
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

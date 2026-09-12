import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from '@/hooks/useLoginForm';
import AuthLayout from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { C } from '@/theme/colors';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage({ 
  onNavigate, 
  onSwitchToSignUp, 
  onForgotPassword, 
  onSuccess 
}) {
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
    document.title = `${t('auth.login', 'تسجيل الدخول')} | ${t('app.name', t('common.appName', 'الحلقة الذكية'))}`;
  }, [currentLang, t]);

  const handleGoToSignUp = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onSwitchToSignUp === 'function') {
      onSwitchToSignUp();
    } else if (typeof onNavigate === 'function') {
      onNavigate('signup');
    }
  };

  const handleGoToForgotPassword = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onForgotPassword === 'function') {
      onForgotPassword();
    } else if (typeof onNavigate === 'function') {
      onNavigate('forgot-password');
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim()) {
      setLocalError(t('auth.emailRequired', 'يرجى إدخال البريد الإلكتروني'));
      return;
    }

    if (!password.trim()) {
      setLocalError(t('auth.passwordRequired', 'يرجى إدخال كلمة المرور'));
      return;
    }

    handleEmailLogin(e);
  };

  const activeError = localError || status?.msg || fieldErrors?.email || fieldErrors?.password;

  return (
    <AuthLayout langBtn={<LanguageSwitcher />}>
      <div className="w-full flex flex-col justify-between relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full">
          
          {/* النصوص الأساسية */}
          <div className="text-center mb-5">
            <h1
              className="text-lg sm:text-xl font-extrabold tracking-tight mb-1"
              style={{ color: C.text?.title }}
            >
              {t('auth.loginTitle', 'تسجيل الدخول')}
            </h1>
            <p
              className="text-xs font-medium leading-relaxed max-w-xs mx-auto m-0"
              style={{ color: C.text?.muted }}
            >
              {t('auth.loginDesc', 'أهلاً بك مجدداً، أدخل بياناتك للمتابعة إلى حسابك')}
            </p>
          </div>

          {/* صندوق الأخطاء والتنبيهات */}
          {activeError && (
            <div
              className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 border transition-all"
              style={{
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                borderColor: C.error?.DEFAULT,
                color: C.error?.DEFAULT,
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <div>{activeError}</div>
            </div>
          )}

          {/* النموذج */}
          <form onSubmit={handleSubmitForm} noValidate className="flex flex-col gap-3.5">
            
            {/* حقل البريد الإلكتروني */}
            <div className="relative flex items-center group">
              <Mail
                size={18}
                className={`absolute pointer-events-none transition-colors inset-y-auto ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: email ? C.amber?.DEFAULT : C.text?.muted,
                }}
              />
              <input
                type="email"
                name="email"
                value={email || ''}
                onChange={(e) => {
                  if (localError) setLocalError('');
                  setEmail(e.target.value);
                }}
                placeholder={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                aria-label={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                dir="ltr"
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all text-start font-sans min-h-[44px] ${
                  isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                }`}
                style={{
                  borderColor: fieldErrors?.email ? C.error?.DEFAULT : C.inputs?.border,
                  backgroundColor: C.inputs?.bg,
                  color: C.text?.title,
                }}
              />
            </div>

            {/* حقل كلمة المرور */}
            <div className="relative flex items-center group">
              <Lock
                size={18}
                className={`absolute pointer-events-none transition-colors inset-y-auto ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: password ? C.amber?.DEFAULT : C.text?.muted,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password || ''}
                onChange={(e) => {
                  if (localError) setLocalError('');
                  setPassword(e.target.value);
                }}
                placeholder={t('auth.passwordPlaceholder', 'كلمة المرور')}
                aria-label={t('auth.passwordPlaceholder', 'كلمة المرور')}
                dir="ltr"
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all text-start font-sans min-h-[44px] ${
                  isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11'
                }`}
                style={{
                  borderColor: fieldErrors?.password ? C.error?.DEFAULT : C.inputs?.border,
                  backgroundColor: C.inputs?.bg,
                  color: C.text?.title,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                aria-label={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                className={`absolute transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isRtl ? 'left-1' : 'right-1'
                }`}
                style={{ color: C.text?.muted }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* رابط نسيت كلمة المرور */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGoToForgotPassword}
                title={t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
                aria-label={t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
                className="bg-transparent border-none text-xs cursor-pointer min-h-[32px] inline-flex items-center px-1 font-medium hover:underline"
                style={{ color: C.amber?.DEFAULT }}
              >
                {t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
              </button>
            </div>

            {/* زر الدخول الرئيسي */}
            <button
              type="submit"
              disabled={loading}
              title={t('auth.login', 'تسجيل الدخول')}
              aria-label={t('auth.login', 'تسجيل الدخول')}
              className="w-full py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60 min-h-[44px] text-white active:scale-[0.98]"
              style={{
                background: C.gradients?.primaryBtn,
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>{t('auth.login', 'تسجيل الدخول')}</span>
              )}
            </button>
          </form>

          {/* الفاصل الزمني (OR) */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t w-full" style={{ borderColor: C.inputs?.border }} />
            <span
              className="absolute px-3 text-[10px] uppercase font-mono rounded-full border"
              style={{
                backgroundColor: C.dark?.surface,
                color: C.text?.muted,
                borderColor: C.inputs?.border,
              }}
            >
              {t('auth.or', 'أو')}
            </span>
          </div>

          {/* زر تسجيل الدخول عبر جوجل */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            title={t('auth.loginWithGoogle', 'تسجيل الدخول بواسطة Google')}
            aria-label={t('auth.loginWithGoogle', 'تسجيل الدخول بواسطة Google')}
            className="w-full py-2.5 px-4 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-all disabled:opacity-60 min-h-[44px]"
            style={{
              backgroundColor: C.inputs?.bg,
              borderColor: C.inputs?.border,
              color: C.text?.title,
            }}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{t('auth.loginWithGoogle', 'تسجيل الدخول بواسطة Google')}</span>
          </button>

          {/* إنشاء حساب جديد */}
          <div
            className="text-center mt-5 text-xs flex items-center justify-center gap-1.5"
            style={{ color: C.text?.muted }}
          >
            <span>{t('auth.noAccount', 'ليس لديك حساب؟')}</span>
            <button
              type="button"
              onClick={handleGoToSignUp}
              title={t('auth.createNewAccount', 'إنشاء حساب جديد')}
              aria-label={t('auth.createNewAccount', 'إنشاء حساب جديد')}
              className="bg-transparent border-none font-bold cursor-pointer hover:underline p-0 min-h-[32px] inline-flex items-center px-1"
              style={{ color: C.amber?.DEFAULT }}
            >
              {t('auth.createNewAccount', 'إنشاء حساب جديد')}
            </button>
          </div>

        </div>
      </div>
    </AuthLayout>
  );
}

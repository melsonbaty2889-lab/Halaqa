import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from '@/hooks/useLoginForm';
import AuthLayout, { APP_SUBTITLES } from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { PrimaryButton, GoogleButton } from '@/components/UI/AuthButtons';
import Toast from '@/components/UI/Toast';
import { useToast } from '@/hooks/useToast';
import { C } from '@/theme/colors';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage({ 
  onNavigate, 
  onSwitchToSignUp, 
  onForgotPassword, 
  onSuccess 
}) {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { toastState, showToast, hideToast } = useToast();

  const {
    isRtl,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    googleLoading,
    fieldErrors,
    status,
    handleEmailLogin,
    handleGoogleLogin,
  } = useLoginForm(onSuccess);

  const [localError, setLocalError] = useState('');

  // 🛑 استلام البريد الإلكتروني الممرر تلقائياً من صفحة Sign Up إن وجد
  useEffect(() => {
    const passedEmail = location?.state?.email;
    if (passedEmail) {
      setEmail(passedEmail);
    }
  }, [location?.state, setEmail]);

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const appSubtitle = APP_SUBTITLES?.[currentLangCode] || APP_SUBTITLES?.ar || 'الحلقة الذكية';

  useEffect(() => {
    document.title = `${t('auth.login', 'تسجيل الدخول')} | ${appSubtitle}`;
  }, [i18n.language, t, appSubtitle]);

  // إظهار تنبيهات Toast فور وجود أخطاء قادمة من النظام أو النموذج
  useEffect(() => {
    const errorMsg = status?.msg || fieldErrors?.email || fieldErrors?.password;
    if (errorMsg) {
      showToast(errorMsg, 'error');
    }
  }, [status, fieldErrors, showToast]);

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
      const msg = t('auth.emailRequired', 'يرجى إدخال البريد الإلكتروني');
      setLocalError(msg);
      showToast(msg, 'warning');
      return;
    }

    if (!password.trim()) {
      const msg = t('auth.passwordRequired', 'يرجى إدخال كلمة المرور');
      setLocalError(msg);
      showToast(msg, 'warning');
      return;
    }

    handleEmailLogin(e);
  };

  const activeError = localError || status?.msg || fieldErrors?.email || fieldErrors?.password;

  // توحيد استخدام متغيرات ألوان نظام التصميم مع الدعم المتبادل لضمان الاتساق الكامل
  const textPrimaryColor = C.semantic?.textPrimary || C.text?.title;
  const textSecondaryColor = C.semantic?.textSecondary || C.text?.muted;
  const actionPrimaryColor = C.semantic?.actionPrimary || C.amber?.DEFAULT;
  const dangerColor = C.semantic?.danger || C.error?.DEFAULT;
  const borderInputColor = C.semantic?.borderInput || C.inputs?.border;
  const surfaceInputColor = C.semantic?.surfaceInput || C.inputs?.bg;

  return (
    <AuthLayout 
      langBtn={<LanguageSwitcher />}
      subtitle={appSubtitle}
    >
      <div className="w-full flex flex-col justify-between relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full">
          
          {/* النصوص الأساسية */}
          <div className="text-center mb-5">
            <h1
              className="text-lg sm:text-xl font-extrabold tracking-tight mb-1"
              style={{ color: textPrimaryColor }}
            >
              {t('auth.loginTitle', 'تسجيل الدخول')}
            </h1>
            <p
              className="text-xs font-medium leading-relaxed max-w-xs mx-auto m-0"
              style={{ color: textSecondaryColor }}
            >
              {t('auth.loginDesc', 'أهلاً بك مجدداً، أدخل بياناتك للمتابعة إلى حسابك')}
            </p>
          </div>

          {/* صندوق الأخطاء والتنبيهات المباشرة */}
          {activeError && (
            <div
              className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 border transition-all"
              style={{
                backgroundColor: C.semantic?.dangerBg || 'rgba(239, 68, 68, 0.15)',
                borderColor: dangerColor,
                color: dangerColor,
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <div>{activeError}</div>
            </div>
          )}

          {/* النموذج */}
          <form onSubmit={handleSubmitForm} noValidate className="flex flex-col gap-3.5">
            
            {/* حقل البريد الإلكتروني */}
            <div className="relative flex items-center group w-full">
              <Mail
                size={18}
                className={`absolute z-10 pointer-events-none transition-colors top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: email ? actionPrimaryColor : textSecondaryColor,
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
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] ${
                  isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                }`}
                style={{
                  borderColor: fieldErrors?.email ? dangerColor : borderInputColor,
                  backgroundColor: surfaceInputColor,
                  color: textPrimaryColor,
                }}
              />
            </div>

            {/* حقل كلمة المرور */}
            <div className="relative flex items-center group w-full">
              <Lock
                size={18}
                className={`absolute z-10 pointer-events-none transition-colors top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: password ? actionPrimaryColor : textSecondaryColor,
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
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] ${
                  isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'
                }`}
                style={{
                  borderColor: fieldErrors?.password ? dangerColor : borderInputColor,
                  backgroundColor: surfaceInputColor,
                  color: textPrimaryColor,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                aria-label={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                className={`absolute z-10 top-1/2 -translate-y-1/2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isRtl ? 'left-1' : 'right-1'
                }`}
                style={{ color: textSecondaryColor }}
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
                style={{ color: actionPrimaryColor }}
              >
                {t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
              </button>
            </div>

            {/* زر الدخول الرئيسي الموحد */}
            <PrimaryButton loading={loading && !googleLoading} disabled={googleLoading}>
              {t('auth.login', 'تسجيل الدخول')}
            </PrimaryButton>
          </form>

          {/* الفاصل الزمني (OR) */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t w-full" style={{ borderColor: borderInputColor }} />
            <span
              className="absolute px-3 text-[10px] uppercase font-mono rounded-full border"
              style={{
                backgroundColor: C.semantic?.surfaceCard || C.dark?.surface,
                color: textSecondaryColor,
                borderColor: borderInputColor,
              }}
            >
              {t('auth.or', 'أو')}
            </span>
          </div>

          {/* زر تسجيل الدخول عبر جوجل الموحد */}
          <GoogleButton 
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={loading}
            text={t('auth.loginWithGoogle', 'متابعة باستخدام Google')}
          />

          {/* إنشاء حساب جديد */}
          <div
            className="text-center mt-5 text-xs flex items-center justify-center gap-1.5"
            style={{ color: textSecondaryColor }}
          >
            <span>{t('auth.noAccount', 'ليس لديك حساب؟')}</span>
            <button
              type="button"
              onClick={handleGoToSignUp}
              title={t('auth.createNewAccount', 'إنشاء حساب جديد')}
              aria-label={t('auth.createNewAccount', 'إنشاء حساب جديد')}
              className="bg-transparent border-none font-bold cursor-pointer hover:underline p-0 min-h-[32px] inline-flex items-center px-1"
              style={{ color: actionPrimaryColor }}
            >
              {t('auth.createNewAccount', 'إنشاء حساب جديد')}
            </button>
          </div>

        </div>
      </div>

      {/* تنبيه Toast الموحد المنسدل */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={hideToast}
      />
    </AuthLayout>
  );
}

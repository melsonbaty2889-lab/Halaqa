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
  } = useLoginForm(onSuccess);

  const [localError, setLocalError] = useState('');

  // تحديد الاسم الافتراضي بناءً على اتجاه اللغة
  const defaultAppName = isRtl ? 'الحلقة الذكية' : 'Smart Halaqa';

  useEffect(() => {
    document.title = `${t('auth.login', 'تسجيل الدخول')} | ${t('common.appName', defaultAppName)}`;
  }, [i18n.language, t, defaultAppName]);

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
      setLocalError(t('auth.emailRequired', isRtl ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email address'));
      return;
    }

    if (!password.trim()) {
      setLocalError(t('auth.passwordRequired', isRtl ? 'يرجى إدخال كلمة المرور' : 'Please enter your password'));
      return;
    }

    handleEmailLogin(e);
  };

  const activeError = localError || status.msg || fieldErrors.email || fieldErrors.password;

  return (
    <AuthLayout langBtn={<LanguageSwitcher />}>
      <div className="w-full flex flex-col justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full">
          {/* الشعار وعنوان المنصة مترجم ديناميكياً */}
          <div className="flex flex-col items-center mb-5 text-center">
            <div className="mb-2 drop-shadow-md">
              <SmartHalaqaProLogo size={52} />
            </div>
            <h1
              className="text-2xl font-extrabold tracking-tight mt-1 mb-0.5 font-sans"
              style={{ color: C?.text?.primary || '#FFFFFF' }}
            >
              {t('common.appName', defaultAppName)}
            </h1>
            <p
              className="text-[11px] font-bold tracking-wider uppercase m-0"
              style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
            >
              {t('auth.platformSubtitle', isRtl ? 'منصة إدارة المقارئ والأكاديميات' : 'Management Platform for Maqaris & Academies')}
            </p>
          </div>

          <h2
            className="text-lg text-center mb-1 font-semibold"
            style={{ color: C?.text?.primary || '#FFFFFF' }}
          >
            {t('auth.loginTitle', isRtl ? 'مرحباً بك مجدداً' : 'Welcome Back')}
          </h2>
          <p
            className="text-xs text-center mb-5 leading-relaxed"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            {t('auth.loginDesc', isRtl ? 'يرجى إدخال بيانات حسابك للمتابعة' : 'Please enter your credentials to continue')}
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
                placeholder={t('auth.emailPlaceholder', isRtl ? 'البريد الإلكتروني' : 'Email Address')}
                aria-label={t('auth.emailPlaceholder', isRtl ? 'البريد الإلكتروني' : 'Email Address')}
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
                placeholder={t('auth.passwordPlaceholder', isRtl ? 'كلمة المرور' : 'Password')}
                aria-label={t('auth.passwordPlaceholder', isRtl ? 'كلمة المرور' : 'Password')}
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
                  isRtl ? 'left-1' : 'right-1'
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
                {t('auth.forgotPassword', isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?')}
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
                <span>{t('auth.login', isRtl ? 'تسجيل الدخول' : 'Sign In')}</span>
              )}
            </button>
          </form>

          {/* إنشاء حساب جديد */}
          <div
            className="text-center mt-5 text-xs flex items-center justify-center gap-1 relative z-20"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            <span>{t('auth.noAccount', isRtl ? 'ليس لديك حساب؟' : "Don't have an account?")}</span>
            <button
              type="button"
              onClick={(e) => handleNavigation(e, 'signup')}
              className="font-bold hover:underline cursor-pointer min-h-[44px] inline-flex items-center px-1"
              style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
            >
              {t('auth.createNewAccount', isRtl ? 'إنشاء حساب جديد' : 'Create New Account')}
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

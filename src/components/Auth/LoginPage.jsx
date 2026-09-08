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

  // ربط المتغيرات الحقيقية المصدّرة من هوك useLoginForm.ts
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

  // حالة محلية للتحقق المخصص (Custom Validation) لمنع تجميد الموبايل
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    document.title = `${t('auth.login', 'تسجيل الدخول')} | ${t('common.appName', 'الحلقة الذكية')}`;
  }, [i18n.language, t]);

  // دالة معالجة الإرسال المخصصة
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

    // استدعاء الدالة الحقيقية من الهوك
    handleEmailLogin(e);
  };

  // تجميع الأخطاء للعرض
  const activeError = localError || status.msg || fieldErrors.email || fieldErrors.password;

  return (
    <AuthLayout langBtn={<LanguageSwitcher />}>
      <div className="w-full flex flex-col justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full">
          {/* الشعار وعنوان المنصة */}
          <div className="flex flex-col items-center mb-5 text-center">
            <div className="mb-2 drop-shadow-md">
              <SmartHalaqaProLogo size={52} />
            </div>
            <h1
              className="text-2xl font-extrabold tracking-tight mt-1 mb-0.5 font-sans"
              style={{ color: C?.text?.primary || '#FFFFFF' }}
            >
              {t('common.appName', 'الحلقة الذكية')}
            </h1>
            <p
              className="text-[11px] font-bold tracking-wider uppercase m-0"
              style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
            >
              {t('auth.platformSubtitle', 'منصة إدارة المقارئ والأكاديميات')}
            </p>
          </div>

          <h2
            className="text-lg text-center mb-1 font-semibold"
            style={{ color: C?.text?.primary || '#FFFFFF' }}
          >
            {t('auth.loginTitle', 'مرحباً بك مجدداً')}
          </h2>
          <p
            className="text-xs text-center mb-5 leading-relaxed"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            {t('auth.loginDesc', 'يرجى إدخال بيانات حسابك للمتابعة')}
          </p>

          {/* عرض رسائل الخطأ المترجمة والمخصصة */}
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

          {/* نموذج تسجيل الدخول مع noValidate لمنع تجميد متصفح الموبايل */}
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
                placeholder={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                aria-label={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
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
                placeholder={t('auth.passwordPlaceholder', 'كلمة المرور')}
                aria-label={t('auth.passwordPlaceholder', 'كلمة المرور')}
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
                title={
                  showPassword
                    ? t('auth.hidePassword', 'إخفاء كلمة المرور')
                    : t('auth.showPassword', 'إظهار كلمة المرور')
                }
                aria-label={
                  showPassword
                    ? t('auth.hidePassword', 'إخفاء كلمة المرور')
                    : t('auth.showPassword', 'إظهار كلمة المرور')
                }
                className={`absolute transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-10 ${
                  isRtl ? 'left-1' : 'right-1'
                }`}
                style={{ color: C?.text?.secondary || '#94A3B8' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* نسيت كلمة المرور */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('forgot-password')}
                className="text-xs hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
                style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
              >
                {t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
              </button>
            </div>

            {/* زر الدخول */}
            <button
              type="submit"
              disabled={loading}
              title={t('auth.login', 'تسجيل الدخول')}
              aria-label={t('auth.login', 'تسجيل الدخول')}
              className="w-full py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60 min-h-[44px]"
              style={{
                backgroundColor: C?.primary?.DEFAULT || '#E07A00',
                color: C?.primary?.text || '#000000',
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>{t('auth.login', 'تسجيل الدخول')}</span>
              )}
            </button>
          </form>

          {/* التبديل لإنشاء حساب جديد */}
          <div
            className="text-center mt-5 text-xs flex items-center justify-center gap-1"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            <span>{t('auth.noAccount', 'ليس لديك حساب؟')}</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('signup')}
              className="font-bold hover:underline cursor-pointer min-h-[44px] inline-flex items-center px-1"
              style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
            >
              {t('auth.createNewAccount', 'إنشاء حساب جديد')}
            </button>
          </div>
        </div>

        {/* إظهار رقم الإصدار v2.5 بشكل ثابت ومستمر بالأسفل */}
        <div className="text-center pt-6 pb-2 text-[10px] tracking-widest uppercase opacity-60" style={{ color: C?.text?.secondary || '#94A3B8' }}>
          SMART HALAQA • v2.5
        </div>
      </div>
    </AuthLayout>
  );
}

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { C } from '@/theme/colors';
import { supabase } from '@/lib/supabase';
import AuthLayout, { APP_SUBTITLES } from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { TermsModal } from '@/components/UI/TermsModal';
import { PrimaryButton, GoogleButton } from '@/components/UI/AuthButtons';
import Toast from '@/components/UI/Toast';
import { useToast } from '@/hooks/useToast';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function SignUpPage({ onSwitchToLogin, onSignUpSuccess }) {
  const { t, i18n } = useTranslation();
  const { toastState, showToast, hideToast } = useToast();

  const {
    isRtl,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    agreeTerms,
    setAgreeTerms,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    fieldErrors,
    setFieldErrors,
    status,
    setStatus,
    handleKeyUp,
    handleSignUp,
  } = useSignUpForm(onSignUpSuccess);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('terms');
  const [googleLoading, setGoogleLoading] = useState(false);

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const appSubtitle = APP_SUBTITLES[currentLangCode] || APP_SUBTITLES.ar;

  useEffect(() => {
    document.title = `${t('auth.createNewAccount', 'إنشاء حساب جديد')} | ${appSubtitle}`;
  }, [i18n.language, t, appSubtitle]);

  // إظهار Toast عند تغير حالة التسجيل من הـ Hook
  useEffect(() => {
    if (status?.msg) {
      showToast(status.msg, status.type === 'success' ? 'success' : 'error');
    }
  }, [status, showToast]);

  const passwordCriteria = useMemo(() => {
    const val = password || '';
    return {
      minLength: val.length >= 8,
      hasLetter: /[a-zA-Z]/.test(val),
      hasNumber: /\d/.test(val),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(val),
    };
  }, [password]);

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    const passedCount = Object.values(passwordCriteria).filter(Boolean).length;
    if (passedCount <= 1) return { score: 25, label: t('auth.weak', 'ضعيفة جداً'), color: C.error?.DEFAULT || '#f43f5e' };
    if (passedCount === 2) return { score: 50, label: t('auth.medium', 'ضعيفة'), color: '#f59e0b' };
    if (passedCount === 3) return { score: 75, label: t('auth.good', 'جيدة'), color: '#3b82f6' };
    return { score: 100, label: t('auth.strong', 'قوية ممتاز'), color: C.emerald?.DEFAULT || '#10b981' };
  }, [password, passwordCriteria, t]);

  const handleGoogleSignUp = useCallback(async () => {
    if (!agreeTerms) {
      const errorMsg = t('auth.agreeTermsRequired', 'يرجى الموافقة على الشروط وسياسة الخصوصية أولاً.');
      setFieldErrors((prev) => ({
        ...prev,
        agreeTerms: errorMsg,
      }));
      showToast(errorMsg, 'error');
      return;
    }

    try {
      setGoogleLoading(true);
      if (supabase?.auth?.signInWithOAuth) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/select-role`,
          },
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      showToast(t('auth.googleSignUpFailed', 'فشل التسجيل بواسطة Google'), 'error');
    } fontFinally {
      setGoogleLoading(false);
    }
  }, [agreeTerms, setFieldErrors, showToast, t]);

  const openTermsModal = useCallback((type) => {
    setModalType(type);
    setShowModal(true);
  }, []);

  const closeTermsModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <AuthLayout langBtn={<LanguageSwitcher />} subtitle={appSubtitle}>
      <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center mb-4">
          <h1
            className="text-lg sm:text-xl font-extrabold tracking-tight mb-1"
            style={{ color: C.text?.title }}
          >
            {t('auth.createNewAccount', 'إنشاء حساب جديد')}
          </h1>
          <p
            className="text-xs font-medium leading-relaxed m-0"
            style={{ color: C.text?.muted }}
          >
            {t('auth.signUpDescription', 'قم بإنشاء حسابك الآن وادعُ طلابك لمتابعة حلقات التحفيظ')}
          </p>
        </div>

        {/* زر Google الموحد */}
        <div className="mb-4">
          <GoogleButton
            onClick={handleGoogleSignUp}
            loading={googleLoading}
            disabled={loading}
            text={t('auth.quickGoogleSignUp', 'التسجيل السريع باستخدام Google')}
          />
        </div>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t w-full" style={{ borderColor: C.inputs?.border }}></div>
          <span
            className="px-3 text-[11px] absolute font-medium"
            style={{
              backgroundColor: C.dark?.surface,
              color: C.text?.muted,
            }}
          >
            {t('auth.orViaEmail', 'أو عبر البريد')}
          </span>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-3" noValidate>
          {/* الاسم الكامل */}
          <div>
            <div className="relative flex items-center">
              <User
                size={18}
                className="absolute start-3.5 pointer-events-none transition-colors inset-y-auto z-10"
                style={{
                  color: fullName ? (C.amber?.DEFAULT || '#D97706') : C.text?.muted,
                }}
              />
              <input
                type="text"
                value={fullName || ''}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder', 'الاسم الكامل')}
                aria-label={t('auth.fullNamePlaceholder', 'الاسم الكامل')}
                required
                className="w-full py-2.5 rounded-xl border text-xs outline-none transition-all text-start min-h-[44px] ps-11 pe-4"
                style={{
                  borderColor: fieldErrors?.fullName ? C.error?.DEFAULT : C.inputs?.border,
                  backgroundColor: C.inputs?.bg,
                  color: C.text?.title,
                }}
              />
            </div>
            {fieldErrors?.fullName && (
              <p className="text-[10px] mt-1 text-rose-500 px-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <div className="relative flex items-center">
              <Mail
                size={18}
                className="absolute start-3.5 pointer-events-none transition-colors inset-y-auto z-10"
                style={{
                  color: email ? (C.amber?.DEFAULT || '#D97706') : C.text?.muted,
                }}
              />
              <input
                type="email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                aria-label={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                required
                className="w-full py-2.5 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px] ps-11 pe-4"
                style={{
                  borderColor: fieldErrors?.email ? C.error?.DEFAULT : C.inputs?.border,
                  backgroundColor: C.inputs?.bg,
                  color: C.text?.title,
                }}
              />
            </div>
            {fieldErrors?.email && (
              <p className="text-[10px] mt-1 text-rose-500 px-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* كلمة المرور */}
          <div>
            <div className="relative flex items-center">
              <Lock
                size={18}
                className="absolute start-3.5 pointer-events-none transition-colors inset-y-auto z-10"
                style={{
                  color: password ? (C.amber?.DEFAULT || '#D97706') : C.text?.muted,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password || ''}
                onKeyUp={handleKeyUp}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder', 'كلمة المرور')}
                aria-label={t('auth.passwordPlaceholder', 'كلمة المرور')}
                required
                className="w-full py-2.5 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px] ps-11 pe-11"
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
                className="absolute end-1 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
                style={{ color: C.text?.muted }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && (
              <div className="mt-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span style={{ color: C.text?.muted }}>
                    {t('auth.strength', 'قوة كلمة المرور:')}
                  </span>
                  <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${passwordStrength.score}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]" style={{ color: C.text?.muted }}>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.minLength ? (
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={12} className="text-gray-400 shrink-0" />
                    )}
                    <span>{t('auth.min8Chars', '8 حروف على الأقل')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasLetter ? (
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={12} className="text-gray-400 shrink-0" />
                    )}
                    <span>{t('auth.hasLetter', 'تتضمن حروف')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasNumber ? (
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={12} className="text-gray-400 shrink-0" />
                    )}
                    <span>{t('auth.hasNumber', 'تتضمن أرقام')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasSpecial ? (
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={12} className="text-gray-400 shrink-0" />
                    )}
                    <span>{t('auth.hasSpecial', 'رمز خاص (@#$)')}</span>
                  </div>
                </div>
              </div>
            )}
            {fieldErrors?.password && (
              <p className="text-[10px] mt-1 text-rose-500 px-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <div className="relative flex items-center">
              <Lock
                size={18}
                className="absolute start-3.5 pointer-events-none transition-colors inset-y-auto z-10"
                style={{
                  color: confirmPassword ? (C.amber?.DEFAULT || '#D97706') : C.text?.muted,
                }}
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword || ''}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
                aria-label={t('auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
                required
                className="w-full py-2.5 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px] ps-11 pe-11"
                style={{
                  borderColor: fieldErrors?.confirmPassword ? C.error?.DEFAULT : C.inputs?.border,
                  backgroundColor: C.inputs?.bg,
                  color: C.text?.title,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                aria-label={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                className="absolute end-1 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
                style={{ color: C.text?.muted }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors?.confirmPassword && (
              <p className="text-[10px] mt-1 text-rose-500 px-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* الشروط والأحكام */}
          <div
            className="flex items-start gap-2.5 my-1 p-2 rounded-xl transition-all border"
            style={{
              borderColor: fieldErrors?.agreeTerms ? C.error?.DEFAULT : 'transparent',
              backgroundColor: fieldErrors?.agreeTerms ? 'rgba(244, 63, 94, 0.1)' : 'transparent',
            }}
          >
            <input
              type="checkbox"
              id="agreeTerms"
              checked={Boolean(agreeTerms)}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              aria-label={t('auth.agreeTermsLabel', 'أوافق على الشروط وسياسة الخصوصية')}
              className="mt-1 rounded focus:ring-0 cursor-pointer min-h-[20px] min-w-[20px] shrink-0"
              style={{
                borderColor: C.inputs?.border,
                backgroundColor: C.inputs?.bg,
                accentColor: C.amber?.DEFAULT,
              }}
            />
            <label
              htmlFor="agreeTerms"
              className="text-[11px] cursor-pointer leading-tight select-none pt-0.5"
              style={{ color: C.text?.muted }}
            >
              {t('auth.iAgreeTo', 'أوافق على')}{' '}
              <button
                type="button"
                onClick={() => openTermsModal('terms')}
                title={t('auth.termsAndConditions', 'الشروط والأحكام')}
                aria-label={t('auth.termsAndConditions', 'الشروط والأحكام')}
                className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: C.amber?.DEFAULT }}
              >
                {t('auth.termsAndConditions', 'الشروط والأحكام')}
              </button>{' '}
              {t('common.and', 'و')}{' '}
              <button
                type="button"
                onClick={() => openTermsModal('privacy')}
                title={t('auth.privacyPolicy', 'سياسة الخصوصية')}
                aria-label={t('auth.privacyPolicy', 'سياسة الخصوصية')}
                className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: C.amber?.DEFAULT }}
              >
                {t('auth.privacyPolicy', 'سياسة الخصوصية')}
              </button>
            </label>
          </div>

          {status?.msg && (
            <div
              className="p-3 rounded-xl my-1 text-xs leading-relaxed flex items-center gap-2 border"
              style={{
                backgroundColor:
                  status.type === 'success'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(244, 63, 94, 0.1)',
                color:
                  status.type === 'success'
                    ? C.emerald?.DEFAULT
                    : C.error?.DEFAULT,
                borderColor:
                  status.type === 'success'
                    ? C.emerald?.DEFAULT
                    : C.error?.DEFAULT,
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <div>{status.msg}</div>
            </div>
          )}

          {/* زر إنشاء الحساب الرئيسي الموحد */}
          <PrimaryButton loading={loading}>
            {t('auth.createNewAccount', 'إنشاء حساب جديد')}
          </PrimaryButton>
        </form>

        <div
          className="flex items-center justify-center gap-1.5 text-[11px] mt-4"
          style={{ color: C.text?.muted }}
        >
          <ShieldCheck size={14} style={{ color: C.emerald?.DEFAULT }} />
          <span>{t('auth.encryptionNotice', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}</span>
        </div>

        <div
          className="mt-3 text-center text-xs flex items-center justify-center gap-1"
          style={{ color: C.text?.muted }}
        >
          <span>{t('auth.alreadyHaveAccount', 'لديك حساب بالفعل؟')}</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            title={t('auth.signIn', 'تسجيل الدخول')}
            aria-label={t('auth.signIn', 'تسجيل الدخول')}
            className="bg-transparent border-none font-bold cursor-pointer hover:underline p-0 min-h-[44px] px-1 flex items-center"
            style={{ color: C.amber?.DEFAULT }}
          >
            {t('auth.signIn', 'تسجيل الدخول')}
          </button>
        </div>

        <TermsModal isOpen={showModal} onClose={closeTermsModal} contentType={modalType} isRtl={isRtl} />
      </div>

      {/* مكون الـ Toast المنزلق أسفل الشاشة */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={hideToast}
      />
    </AuthLayout>
  );
}

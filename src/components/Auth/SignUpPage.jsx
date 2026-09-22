import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { useSignUpValidation } from '@/hooks/useSignUpValidation';
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
    handleSignUp,
  } = useSignUpForm(onSignUpSuccess);

  const { passwordCriteria, passwordStrength } = useSignUpValidation(password);

  const [localError, setLocalError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('terms');
  const [googleLoading, setGoogleLoading] = useState(false);

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const appSubtitle = APP_SUBTITLES[currentLangCode] || APP_SUBTITLES.ar;

  useEffect(() => {
    document.title = `${t('auth.createNewAccount', 'إنشاء حساب جديد')} | ${appSubtitle}`;
  }, [i18n.language, t, appSubtitle]);

  useEffect(() => {
    if (status?.msg) {
      showToast(status.msg, status.type === 'error' ? 'error' : 'success');
    }
  }, [status, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (typeof setFieldErrors === 'function') setFieldErrors({});
    await handleSignUp(e);
  };

  const handleGoogleSignUp = useCallback(async () => {
    setLocalError('');
    if (!agreeTerms) {
      const errorMsg = t('auth.agreeTermsRequired', 'يرجى الموافقة على الشروط وسياسة الخصوصية أولاً.');
      setLocalError(errorMsg);
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
    } finally {
      setGoogleLoading(false);
    }
  }, [agreeTerms, showToast, t]);

  const openTermsModal = useCallback((type) => {
    setModalType(type);
    setShowModal(true);
  }, []);

  const closeTermsModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const activeErrorMessage = localError || fieldErrors?.general || status?.msg;

  return (
    <AuthLayout langBtn={<LanguageSwitcher />} subtitle={appSubtitle}>
      <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center mb-4">
          <h1
            className="text-lg sm:text-xl font-extrabold tracking-tight mb-1"
            style={{ color: C.semantic.textPrimary }}
          >
            {t('auth.createNewAccount', 'إنشاء حساب جديد')}
          </h1>
          <p
            className="text-xs font-medium leading-relaxed m-0"
            style={{ color: C.semantic.textSecondary }}
          >
            {t('auth.signUpDescription', 'قم بإنشاء حسابك الآن وادعُ طلابك لمتابعة حلقات التحفيظ')}
          </p>
        </div>

        <div className="mb-4">
          <GoogleButton
            onClick={handleGoogleSignUp}
            loading={googleLoading}
            disabled={loading}
            text={t('auth.quickGoogleSignUp', 'التسجيل السريع باستخدام Google')}
          />
        </div>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t w-full" style={{ borderColor: C.semantic.borderInput }}></div>
          <span
            className="px-3 text-[11px] absolute font-medium"
            style={{
              backgroundColor: C.semantic.surfaceCard,
              color: C.semantic.textSecondary,
            }}
          >
            {t('auth.orViaEmail', 'أو عبر البريد')}
          </span>
        </div>

        {activeErrorMessage && status?.type === 'error' && (
          <div
            className="p-3 rounded-xl mb-3 text-xs leading-relaxed flex items-center gap-2 border transition-all"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: C.semantic.danger,
              color: C.semantic.danger,
            }}
          >
            <AlertCircle size={16} className="shrink-0" />
            <div>{activeErrorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {/* الاسم الكامل */}
          <div>
            <div className="relative flex items-center">
              <User
                size={18}
                className={`absolute z-10 pointer-events-none transition-colors top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: fullName ? C.semantic.actionPrimary : C.semantic.textSecondary,
                }}
              />
              <input
                type="text"
                value={fullName || ''}
                onChange={(e) => {
                  if (localError) setLocalError('');
                  setFullName(e.target.value);
                }}
                placeholder={t('auth.fullNamePlaceholder', 'الاسم الكامل')}
                aria-label={t('auth.fullNamePlaceholder', 'الاسم الكامل')}
                required
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] ${
                  isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                }`}
                style={{
                  borderColor: fieldErrors?.fullName ? C.semantic.danger : C.semantic.borderInput,
                  backgroundColor: C.semantic.surfaceInput,
                  color: C.semantic.textPrimary,
                }}
              />
            </div>
            {fieldErrors?.fullName && (
              <p className="text-[10px] mt-1 px-1" style={{ color: C.semantic.danger }}>
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <div className="relative flex items-center">
              <Mail
                size={18}
                className={`absolute z-10 pointer-events-none transition-colors top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: email ? C.semantic.actionPrimary : C.semantic.textSecondary,
                }}
              />
              <input
                type="email"
                value={email || ''}
                onChange={(e) => {
                  if (localError) setLocalError('');
                  setEmail(e.target.value);
                }}
                placeholder={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                aria-label={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                required
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] ${
                  isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                }`}
                style={{
                  borderColor: fieldErrors?.email ? C.semantic.danger : C.semantic.borderInput,
                  backgroundColor: C.semantic.surfaceInput,
                  color: C.semantic.textPrimary,
                }}
              />
            </div>
            {fieldErrors?.email && (
              <p className="text-[10px] mt-1 px-1" style={{ color: C.semantic.danger }}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* كلمة المرور */}
          <div>
            <div className="relative flex items-center">
              <Lock
                size={18}
                className={`absolute z-10 pointer-events-none transition-colors top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: password ? C.semantic.actionPrimary : C.semantic.textSecondary,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password || ''}
                onChange={(e) => {
                  if (localError) setLocalError('');
                  setPassword(e.target.value);
                }}
                placeholder={t('auth.passwordPlaceholder', 'كلمة المرور')}
                aria-label={t('auth.passwordPlaceholder', 'كلمة المرور')}
                required
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] ${
                  isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'
                }`}
                style={{
                  borderColor: fieldErrors?.password ? C.semantic.danger : C.semantic.borderInput,
                  backgroundColor: C.semantic.surfaceInput,
                  color: C.semantic.textPrimary,
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
                style={{ color: C.semantic.textSecondary }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && (
              <div className="mt-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span style={{ color: C.semantic.textSecondary }}>
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
                <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]" style={{ color: C.semantic.textSecondary }}>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.minLength ? (
                      <CheckCircle2 size={12} className="shrink-0" style={{ color: C.semantic.success }} />
                    ) : (
                      <XCircle size={12} className="shrink-0" style={{ color: C.semantic.textSecondary }} />
                    )}
                    <span>{t('auth.min8Chars', '8 حروف على الأقل')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasUppercase ? (
                      <CheckCircle2 size={12} className="shrink-0" style={{ color: C.semantic.success }} />
                    ) : (
                      <XCircle size={12} className="shrink-0" style={{ color: C.semantic.textSecondary }} />
                    )}
                    <span>{t('auth.hasUppercase', 'حرف كبير (A-Z)')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasNumber ? (
                      <CheckCircle2 size={12} className="shrink-0" style={{ color: C.semantic.success }} />
                    ) : (
                      <XCircle size={12} className="shrink-0" style={{ color: C.semantic.textSecondary }} />
                    )}
                    <span>{t('auth.hasNumber', 'تتضمن أرقام')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasSpecial ? (
                      <CheckCircle2 size={12} className="shrink-0" style={{ color: C.semantic.success }} />
                    ) : (
                      <XCircle size={12} className="shrink-0" style={{ color: C.semantic.textSecondary }} />
                    )}
                    <span>{t('auth.hasSpecial', 'رمز خاص (@#$)')}</span>
                  </div>
                </div>
              </div>
            )}
            {fieldErrors?.password && (
              <p className="text-[10px] mt-1 px-1" style={{ color: C.semantic.danger }}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <div className="relative flex items-center">
              <Lock
                size={18}
                className={`absolute z-10 pointer-events-none transition-colors top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
                style={{
                  color: confirmPassword ? C.semantic.actionPrimary : C.semantic.textSecondary,
                }}
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword || ''}
                onChange={(e) => {
                  if (localError) setLocalError('');
                  setConfirmPassword(e.target.value);
                }}
                placeholder={t('auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
                aria-label={t('auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
                required
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] ${
                  isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'
                }`}
                style={{
                  borderColor: fieldErrors?.confirmPassword ? C.semantic.danger : C.semantic.borderInput,
                  backgroundColor: C.semantic.surfaceInput,
                  color: C.semantic.textPrimary,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                aria-label={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                className={`absolute z-10 top-1/2 -translate-y-1/2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isRtl ? 'left-1' : 'right-1'
                }`}
                style={{ color: C.semantic.textSecondary }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors?.confirmPassword && (
              <p className="text-[10px] mt-1 px-1" style={{ color: C.semantic.danger }}>
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* الشروط والأحكام */}
          <div
            className="flex items-start gap-2.5 my-1 p-2 rounded-xl transition-all border"
            style={{
              borderColor: fieldErrors?.agreeTerms ? C.semantic.danger : 'transparent',
              backgroundColor: fieldErrors?.agreeTerms ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            }}
          >
            <input
              type="checkbox"
              id="agreeTerms"
              checked={Boolean(agreeTerms)}
              onChange={(e) => {
                if (localError) setLocalError('');
                setAgreeTerms(e.target.checked);
              }}
              aria-label={t('auth.agreeTermsLabel', 'أوافق على الشروط وسياسة الخصوصية')}
              className="mt-1 rounded focus:ring-0 cursor-pointer min-h-[20px] min-w-[20px] shrink-0"
              style={{
                borderColor: C.semantic.borderInput,
                backgroundColor: C.semantic.surfaceInput,
                accentColor: C.semantic.actionPrimary,
              }}
            />
            <label
              htmlFor="agreeTerms"
              className="text-[11px] cursor-pointer leading-tight select-none pt-0.5"
              style={{ color: C.semantic.textSecondary }}
            >
              {t('auth.iAgreeTo', 'أوافق على')}{' '}
              <button
                type="button"
                onClick={() => openTermsModal('terms')}
                title={t('auth.termsAndConditions', 'الشروط والأحكام')}
                aria-label={t('auth.termsAndConditions', 'الشروط والأحكام')}
                className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: C.semantic.actionPrimary }}
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
                style={{ color: C.semantic.actionPrimary }}
              >
                {t('auth.privacyPolicy', 'سياسة الخصوصية')}
              </button>
            </label>
          </div>

          {/* زر إنشاء الحساب */}
          <PrimaryButton loading={loading && !googleLoading} disabled={googleLoading}>
            {t('auth.createNewAccount', 'إنشاء حساب جديد')}
          </PrimaryButton>
        </form>

        <div
          className="flex items-center justify-center gap-1.5 text-[11px] mt-4"
          style={{ color: C.semantic.textSecondary }}
        >
          <ShieldCheck size={14} style={{ color: C.semantic.success }} />
          <span>{t('auth.encryptionNotice', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}</span>
        </div>

        <div
          className="mt-3 text-center text-xs flex items-center justify-center gap-1"
          style={{ color: C.semantic.textSecondary }}
        >
          <span>{t('auth.alreadyHaveAccount', 'لديك حساب بالفعل؟')}</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            title={t('auth.signIn', 'تسجيل الدخول')}
            aria-label={t('auth.signIn', 'تسجيل الدخول')}
            className="bg-transparent border-none font-bold cursor-pointer hover:underline p-0 min-h-[44px] px-1 flex items-center"
            style={{ color: C.semantic.actionPrimary }}
          >
            {t('auth.signIn', 'تسجيل الدخول')}
          </button>
        </div>

        <TermsModal isOpen={showModal} onClose={closeTermsModal} contentType={modalType} isRtl={isRtl} />
      </div>

      <Toast
        isOpen={toastState?.isOpen || toastState?.show}
        message={toastState?.message}
        type={toastState?.type}
        onClose={hideToast}
      />
    </AuthLayout>
  );
}

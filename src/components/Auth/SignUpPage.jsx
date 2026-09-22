import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { useSignUpValidation } from '@/hooks/useSignUpValidation';
import AuthLayout from './AuthLayout';
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
    googleLoading,
    fieldErrors,
    setFieldErrors,
    status,
    handleSignUp,
    handleGoogleSignUp,
  } = useSignUpForm(onSignUpSuccess);

  const { passwordCriteria, passwordStrength } = useSignUpValidation(password);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('terms');

  useEffect(() => {
    document.title = `${t('auth.createNewAccount', 'إنشاء حساب جديد')} | ${t('app.title', 'الحلقة الذكية')}`;
  }, [i18n.language, t]);

  const hasFieldErrors = Object.values(fieldErrors || {}).some(Boolean);

  useEffect(() => {
    if (status?.msg && status?.type === 'success') {
      showToast(status.msg, 'success');
    } else if (status?.msg && status?.type === 'error' && !hasFieldErrors) {
      showToast(status.msg, 'error');
    }
  }, [status, showToast, hasFieldErrors]);

  const clearFieldError = (fieldName) => {
    if (fieldErrors?.[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSignUp(e);
  };

  const openTermsModal = useCallback((type) => {
    setModalType(type);
    setShowModal(true);
  }, []);

  const closeTermsModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const activeGeneralErrorMessage = !hasFieldErrors && status?.type === 'error' ? status.msg : fieldErrors?.general;

  return (
    <AuthLayout>
      <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center mb-4">
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight mb-1 text-semantic-textPrimary">
            {t('auth.createNewAccount', 'إنشاء حساب جديد')}
          </h1>
          <p className="text-xs font-medium leading-relaxed m-0 text-semantic-textSecondary">
            {t('auth.signUpDescription', 'قم بإنشاء حسابك الآن وادعُ طلابك لمتابعة حلقات التحفيظ')}
          </p>
        </div>

        {/* زر التسجيل بواسطة Google */}
        <div className="mb-4">
          <GoogleButton
            onClick={handleGoogleSignUp}
            loading={googleLoading}
            disabled={loading}
            text={t('auth.quickGoogleSignUp', 'التسجيل السريع باستخدام Google')}
          />
        </div>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t w-full border-semantic-borderInput"></div>
          <span className="px-3 text-[11px] absolute font-medium bg-semantic-surfaceCard text-semantic-textSecondary">
            {t('auth.orViaEmail', 'أو عبر البريد')}
          </span>
        </div>

        {activeGeneralErrorMessage && (
          <div className="p-3 rounded-xl mb-3 text-xs leading-relaxed flex items-center gap-2 border transition-all bg-semantic-dangerBg border-semantic-danger text-semantic-danger">
            <AlertCircle size={16} className="shrink-0" />
            <div>{activeGeneralErrorMessage}</div>
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
                } ${fullName ? 'text-semantic-actionPrimary' : 'text-semantic-textSecondary'}`}
              />
              <input
                type="text"
                value={fullName || ''}
                onChange={(e) => {
                  clearFieldError('fullName');
                  setFullName(e.target.value);
                }}
                placeholder={t('auth.fullNamePlaceholder', 'الاسم الكامل')}
                aria-label={t('auth.fullNamePlaceholder', 'الاسم الكامل')}
                required
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] bg-semantic-surfaceInput text-semantic-textPrimary ${
                  isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                } ${fieldErrors?.fullName ? 'border-semantic-danger' : 'border-semantic-borderInput'}`}
              />
            </div>
            {fieldErrors?.fullName && (
              <p className="text-[10px] mt-1 px-1 text-semantic-danger">
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
                } ${email ? 'text-semantic-actionPrimary' : 'text-semantic-textSecondary'}`}
              />
              <input
                type="email"
                value={email || ''}
                onChange={(e) => {
                  clearFieldError('email');
                  setEmail(e.target.value);
                }}
                placeholder={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                aria-label={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
                required
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] bg-semantic-surfaceInput text-semantic-textPrimary ${
                  isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                } ${fieldErrors?.email ? 'border-semantic-danger' : 'border-semantic-borderInput'}`}
              />
            </div>
            {fieldErrors?.email && (
              <p className="text-[10px] mt-1 px-1 text-semantic-danger">
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
                } ${password ? 'text-semantic-actionPrimary' : 'text-semantic-textSecondary'}`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password || ''}
                onChange={(e) => {
                  clearFieldError('password');
                  setPassword(e.target.value);
                }}
                placeholder={t('auth.passwordPlaceholder', 'كلمة المرور')}
                aria-label={t('auth.passwordPlaceholder', 'كلمة المرور')}
                required
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] bg-semantic-surfaceInput text-semantic-textPrimary ${
                  isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'
                } ${fieldErrors?.password ? 'border-semantic-danger' : 'border-semantic-borderInput'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                aria-label={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                className={`absolute z-10 top-1/2 -translate-y-1/2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center text-semantic-textSecondary ${
                  isRtl ? 'left-1' : 'right-1'
                }`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && (
              <div className="mt-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-semantic-textSecondary">
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
                <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-semantic-textSecondary">
                  <div className="flex items-center gap-1">
                    {passwordCriteria.minLength ? (
                      <CheckCircle2 size={12} className="shrink-0 text-semantic-success" />
                    ) : (
                      <XCircle size={12} className="shrink-0 text-semantic-textSecondary" />
                    )}
                    <span>{t('auth.min8Chars', '8 حروف على الأقل')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasUppercase ? (
                      <CheckCircle2 size={12} className="shrink-0 text-semantic-success" />
                    ) : (
                      <XCircle size={12} className="shrink-0 text-semantic-textSecondary" />
                    )}
                    <span>{t('auth.hasUppercase', 'حرف كبير (A-Z)')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasNumber ? (
                      <CheckCircle2 size={12} className="shrink-0 text-semantic-success" />
                    ) : (
                      <XCircle size={12} className="shrink-0 text-semantic-textSecondary" />
                    )}
                    <span>{t('auth.hasNumber', 'تتضمن أرقام')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.hasSpecial ? (
                      <CheckCircle2 size={12} className="shrink-0 text-semantic-success" />
                    ) : (
                      <XCircle size={12} className="shrink-0 text-semantic-textSecondary" />
                    )}
                    <span>{t('auth.hasSpecial', 'رمز خاص (@#$)')}</span>
                  </div>
                </div>
              </div>
            )}
            {fieldErrors?.password && (
              <p className="text-[10px] mt-1 px-1 text-semantic-danger">
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
                } ${confirmPassword ? 'text-semantic-actionPrimary' : 'text-semantic-textSecondary'}`}
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword || ''}
                onChange={(e) => {
                  clearFieldError('confirmPassword');
                  setConfirmPassword(e.target.value);
                }}
                placeholder={t('auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
                aria-label={t('auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
                required
                className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all min-h-[44px] bg-semantic-surfaceInput text-semantic-textPrimary ${
                  isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'
                } ${fieldErrors?.confirmPassword ? 'border-semantic-danger' : 'border-semantic-borderInput'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                aria-label={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                className={`absolute z-10 top-1/2 -translate-y-1/2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center text-semantic-textSecondary ${
                  isRtl ? 'left-1' : 'right-1'
                }`}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors?.confirmPassword && (
              <p className="text-[10px] mt-1 px-1 text-semantic-danger">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* الشروط والأحكام مع الإبراز البصري عند وجود خطأ */}
          <div
            className={`flex items-start gap-2.5 my-1 p-2 rounded-xl transition-all border ${
              fieldErrors?.agreeTerms
                ? 'bg-semantic-dangerBg/20 border-semantic-danger'
                : 'border-transparent bg-transparent'
            }`}
          >
            <input
              type="checkbox"
              id="agreeTerms"
              checked={Boolean(agreeTerms)}
              onChange={(e) => {
                clearFieldError('agreeTerms');
                setAgreeTerms(e.target.checked);
              }}
              aria-label={t('auth.agreeTermsLabel', 'أوافق على الشروط وسياسة الخصوصية')}
              className="mt-1 rounded focus:ring-0 cursor-pointer min-h-[20px] min-w-[20px] shrink-0 border-semantic-borderInput bg-semantic-surfaceInput accent-semantic-actionPrimary"
            />
            <label
              htmlFor="agreeTerms"
              className="text-[11px] cursor-pointer leading-tight select-none pt-0.5 text-semantic-textSecondary"
            >
              {t('auth.iAgreeTo', 'أوافق على')}{' '}
              <button
                type="button"
                onClick={() => openTermsModal('terms')}
                title={t('auth.termsAndConditions', 'الشروط والأحكام')}
                aria-label={t('auth.termsAndConditions', 'الشروط والأحكام')}
                className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-semantic-actionPrimary"
              >
                {t('auth.termsAndConditions', 'الشروط والأحكام')}
              </button>{' '}
              {t('common.and', 'و')}{' '}
              <button
                type="button"
                onClick={() => openTermsModal('privacy')}
                title={t('auth.privacyPolicy', 'سياسة الخصوصية')}
                aria-label={t('auth.privacyPolicy', 'سياسة الخصوصية')}
                className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-semantic-actionPrimary"
              >
                {t('auth.privacyPolicy', 'سياسة الخصوصية')}
              </button>
            </label>
          </div>
          {fieldErrors?.agreeTerms && (
            <p className="text-[10px] mt-0 px-1 text-semantic-danger">
              {fieldErrors.agreeTerms}
            </p>
          )}

          {/* زر إنشاء الحساب */}
          <PrimaryButton loading={loading && !googleLoading} disabled={googleLoading}>
            {t('auth.createNewAccount', 'إنشاء حساب جديد')}
          </PrimaryButton>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] mt-4 text-semantic-textSecondary">
          <ShieldCheck size={14} className="text-semantic-success" />
          <span>{t('auth.encryptionNotice', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}</span>
        </div>

        {/* زر الانتقال لتسجيل الدخول */}
        {onSwitchToLogin && (
          <div className="text-center mt-3 text-xs text-semantic-textSecondary">
            <span>{t('auth.alreadyHaveAccount', 'لديك حساب بالفعل؟')} </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-semantic-actionPrimary"
            >
              {t('auth.loginNow', 'تسجيل الدخول')}
            </button>
          </div>
        )}
      </div>

      <TermsModal
        isOpen={showModal}
        onClose={closeTermsModal}
        initialTab={modalType}
        isRtl={isRtl}
      />

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={hideToast}
      />
    </AuthLayout>
  );
}

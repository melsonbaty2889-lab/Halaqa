import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { C } from '@/theme/colors';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import { TermsModal } from '@/components/UI/TermsModal';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Globe,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function SignUpPage({ onSwitchToLogin, onSignUpSuccess }) {
  const { t, i18n } = useTranslation();

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
    toggleLanguage,
    handleKeyUp,
    handleSignUp,
  } = useSignUpForm(onSignUpSuccess);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('terms');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = useCallback(async () => {
    if (!agreeTerms) {
      setFieldErrors((prev) => ({ ...prev, agreeTerms: true }));
      setStatus({
        type: 'error',
        msg: t('auth.agreeTermsRequired', 'يرجى الموافقة على الشروط وسياسة الخصوصية أولاً.'),
      });
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
      setStatus({
        type: 'error',
        msg: t('auth.googleSignUpFailed', 'فشل التسجيل بواسطة Google'),
      });
    } finally {
      setGoogleLoading(false);
    }
  }, [agreeTerms, setFieldErrors, setStatus, t]);

  const openTermsModal = useCallback((type) => {
    setModalType(type);
    setShowModal(true);
  }, []);

  const closeTermsModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const langBtn = (
    <button
      type="button"
      onClick={toggleLanguage}
      title={t('common.switchLanguage', 'تغيير اللغة')}
      aria-label={t('common.switchLanguage', 'تغيير اللغة')}
      className="border py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-all min-h-[44px]"
      style={{
        backgroundColor: C.inputs?.bg,
        borderColor: C.inputs?.border,
        color: C.text?.muted,
      }}
    >
      <Globe size={14} style={{ color: C.amber?.DEFAULT }} />
      <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );

  return (
    <AuthLayout langBtn={langBtn}>
      <div className="w-full">
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

        {/* التسجيل عبر Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          title={t('auth.quickGoogleSignUp', 'التسجيل السريع باستخدام Google')}
          aria-label={t('auth.quickGoogleSignUp', 'التسجيل السريع باستخدام Google')}
          className="w-full py-2.5 px-4 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer mb-4 transition-all disabled:opacity-50 min-h-[44px]"
          style={{
            backgroundColor: C.inputs?.bg,
            borderColor: C.inputs?.border,
            color: C.text?.title,
          }}
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: C.amber?.DEFAULT }} />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>{t('auth.quickGoogleSignUp', 'التسجيل السريع باستخدام Google')}</span>
        </button>

        {/* فاصل */}
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

        {/* نموذج إنشاء الحساب */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          {/* الاسم الكامل */}
          <div className="relative flex items-center">
            <User
              size={18}
              className={`absolute pointer-events-none transition-colors inset-y-auto ${
                isRtl ? 'right-3.5' : 'left-3.5'
              }`}
              style={{
                color: fullName ? C.amber?.DEFAULT : C.text?.muted,
              }}
            />
            <input
              type="text"
              value={fullName || ''}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('auth.fullNamePlaceholder', 'الاسم الكامل')}
              aria-label={t('auth.fullNamePlaceholder', 'الاسم الكامل')}
              required
              className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all text-start min-h-[44px] ${
                isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
              }`}
              style={{
                borderColor: fieldErrors?.fullName ? C.error?.DEFAULT : C.inputs?.border,
                backgroundColor: C.inputs?.bg,
                color: C.text?.title,
              }}
            />
          </div>

          {/* البريد الإلكتروني */}
          <div className="relative flex items-center">
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
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
              aria-label={t('auth.emailPlaceholder', 'البريد الإلكتروني')}
              required
              className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px] ${
                isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
              }`}
              style={{
                borderColor: fieldErrors?.email ? C.error?.DEFAULT : C.inputs?.border,
                backgroundColor: C.inputs?.bg,
                color: C.text?.title,
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
                color: password ? C.amber?.DEFAULT : C.text?.muted,
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
              className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px] ${
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
              style={{
                color: C.text?.muted,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* تأكيد كلمة المرور */}
          <div className="relative flex items-center">
            <Lock
              size={18}
              className={`absolute pointer-events-none transition-colors inset-y-auto ${
                isRtl ? 'right-3.5' : 'left-3.5'
              }`}
              style={{
                color: confirmPassword ? C.amber?.DEFAULT : C.text?.muted,
              }}
            />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword || ''}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
              aria-label={t('auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
              required
              className={`w-full py-2.5 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px] ${
                isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11'
              }`}
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
              className={`absolute transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isRtl ? 'left-1' : 'right-1'
              }`}
              style={{
                color: C.text?.muted,
              }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* التعهد بالشروط */}
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
              className="mt-1 rounded focus:ring-0 cursor-pointer min-h-[20px] min-w-[20px]"
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

          {/* التنبيهات والأخطاء */}
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

          {/* زر إنشاء الحساب */}
          <button
            type="submit"
            disabled={loading}
            title={t('auth.createNewAccount', 'إنشاء حساب جديد')}
            aria-label={t('auth.createNewAccount', 'إنشاء حساب جديد')}
            className="w-full py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60 min-h-[44px] text-white active:scale-[0.98]"
            style={{
              background: C.gradients?.primaryBtn,
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span>{t('auth.createNewAccount', 'إنشاء حساب جديد')}</span>
            )}
          </button>
        </form>

        {/* شارة التشفير */}
        <div
          className="flex items-center justify-center gap-1.5 text-[11px] mt-4"
          style={{ color: C.text?.muted }}
        >
          <ShieldCheck size={14} style={{ color: C.emerald?.DEFAULT }} />
          <span>{t('auth.encryptionNotice', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}</span>
        </div>

        {/* تحويل الدخول */}
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
    </AuthLayout>
  );
}

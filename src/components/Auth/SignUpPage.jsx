import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { TermsModal } from '@/components/UI/TermsModal';
import { getText } from '@/utils/textUtils';
import C from '@/theme/colors';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Globe, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';

export default function SignUpPage({ onSwitchToLogin, onSignUpSuccess }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const {
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
    status,
    setStatus,
    toggleLanguage,
    handleKeyUp,
    handleSignUp,
  } = useSignUpForm(onSignUpSuccess);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('terms');
  const [googleLoading, setGoogleLoading] = useState(false);

  // معالجة تسجيل Google مع حماية السحابة ودعم try/catch
  const handleGoogleSignUp = useCallback(async () => {
    if (!agreeTerms) {
      setStatus({
        type: 'error',
        msg: getText(t, 'auth.errors.agreeTermsRequired', 'يرجى الموافقة على الشروط وسياسة الخصوصية أولاً.')
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
      setStatus({
        type: 'error',
        msg: getText(t, 'auth.errors.googleFailed', 'فشل التسجيل بواسطة Google')
      });
    } finally {
      setGoogleLoading(false);
    }
  }, [agreeTerms, setStatus, t]);

  // زر تحويل اللغة مع معايير A11y والألوان المعتمدة
  const langBtn = useMemo(() => (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={getText(t, 'common.switchLanguage', 'تغيير اللغة')}
      title={getText(t, 'common.switchLanguage', 'تغيير اللغة')}
      className="border py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-all min-h-[36px]"
      style={{
        backgroundColor: C.dark?.surfaceInput || 'var(--surface-input)',
        borderColor: C.dark?.borderInput || 'var(--border-input)',
        color: C.text?.main || '#FFFFFF',
      }}
    >
      <Globe size={14} style={{ color: C.primary?.DEFAULT || 'var(--primary)' }} />
      <span>{isRtl ? 'English' : 'العربية'}</span>
    </button>
  ), [toggleLanguage, t, isRtl]);

  return (
    <AuthLayout langBtn={langBtn}>
      <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* الشعار والعنوان */}
        <div className="flex flex-col items-center mb-4 text-center">
          <div className="mb-1 drop-shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <SmartHalaqaProLogo size={44} />
          </div>
          <h1 
            className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 mb-0.5"
            style={{ color: C.text?.main || 'var(--text-main)' }}
          >
            {getText(t, 'auth.joinSmartHalaqa', 'انضم إلى الحلقة الذكية')}
          </h1>
          <p 
            className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase m-0"
            style={{ color: C.primary?.DEFAULT || 'var(--primary)' }}
          >
            {getText(t, 'auth.platformSubtitle', 'منصة إدارة المقارئ والأكاديميات')}
          </p>
        </div>

        <h2 
          className="text-base sm:text-lg text-center mb-1 font-semibold"
          style={{ color: C.text?.main || 'var(--text-main)' }}
        >
          {getText(t, 'auth.createNewAccount', 'إنشاء حساب جديد')}
        </h2>
        <p 
          className="text-xs text-center mb-4 leading-relaxed"
          style={{ color: C.text?.sub || 'var(--text-sub)' }}
        >
          {getText(t, 'auth.signUpDesc', 'قم بإنشاء حسابك الآن وادعُ طلابك لمتابعة حلقات التحفيظ')}
        </p>

        {/* التسجيل عبر Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          aria-label={getText(t, 'auth.quickGoogleSignUp', 'التسجيل السريع باستخدام Google')}
          className="w-full min-h-[44px] py-2.5 px-4 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer mb-4 transition-all disabled:opacity-50"
          style={{
            backgroundColor: C.dark?.surfaceInput || 'var(--surface-input)',
            borderColor: C.dark?.borderInput || 'var(--border-input)',
            color: C.text?.main || '#FFFFFF'
          }}
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: C.primary?.DEFAULT }} />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>{getText(t, 'auth.quickGoogleSignUp', 'التسجيل السريع باستخدام Google')}</span>
        </button>

        {/* فاصل */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t w-full" style={{ borderColor: C.dark?.borderInput || 'var(--border-input)' }}></div>
          <span 
            className="px-3 text-[11px] absolute font-medium"
            style={{ 
              backgroundColor: C.dark?.card || '#0A1220', 
              color: C.text?.muted || 'var(--text-muted)' 
            }}
          >
            {getText(t, 'auth.orViaEmail', 'أو عبر البريد')}
          </span>
        </div>

        {/* نموذج إنشاء الحساب */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          
          {/* الاسم الكامل */}
          <div className="relative flex items-center">
            <User 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors`}
              style={{ color: fullName ? (C.primary?.DEFAULT || 'var(--primary)') : (C.text?.muted || 'var(--text-muted)') }}
            />
            <input 
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={getText(t, 'auth.fullNamePlaceholder', 'الاسم الكامل')}
              required
              aria-label={getText(t, 'auth.fullNamePlaceholder', 'الاسم الكامل')}
              className={`w-full min-h-[44px] py-2.5 ${isRtl ? 'pr-11 pl-4 text-start' : 'pl-11 pr-4 text-start'} rounded-xl border text-xs outline-none transition-all`}
              style={{
                backgroundColor: C.dark?.surfaceInput || 'var(--surface-input)',
                borderColor: C.dark?.borderInput || 'var(--border-input)',
                color: C.text?.main || '#FFFFFF',
              }}
            />
          </div>

          {/* البريد الإلكتروني */}
          <div className="relative flex items-center">
            <Mail 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors`}
              style={{ color: email ? (C.primary?.DEFAULT || 'var(--primary)') : (C.text?.muted || 'var(--text-muted)') }}
            />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={getText(t, 'auth.emailPlaceholder', 'البريد الإلكتروني')}
              required
              aria-label={getText(t, 'auth.emailPlaceholder', 'البريد الإلكتروني')}
              className={`w-full min-h-[44px] py-2.5 ${isRtl ? 'pr-11 pl-4 text-start' : 'pl-11 pr-4 text-start'} rounded-xl border text-xs outline-none transition-all font-sans`}
              style={{
                backgroundColor: C.dark?.surfaceInput || 'var(--surface-input)',
                borderColor: C.dark?.borderInput || 'var(--border-input)',
                color: C.text?.main || '#FFFFFF',
              }}
            />
          </div>

          {/* كلمة المرور */}
          <div className="relative flex items-center">
            <Lock 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors`}
              style={{ color: password ? (C.primary?.DEFAULT || 'var(--primary)') : (C.text?.muted || 'var(--text-muted)') }}
            />
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onKeyUp={handleKeyUp}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={getText(t, 'auth.passwordPlaceholder', 'كلمة المرور')}
              required
              aria-label={getText(t, 'auth.passwordPlaceholder', 'كلمة المرور')}
              className={`w-full min-h-[44px] py-2.5 ${isRtl ? 'pr-11 pl-11 text-start' : 'pl-11 pr-11 text-start'} rounded-xl border text-xs outline-none transition-all font-sans`}
              style={{
                backgroundColor: C.dark?.surfaceInput || 'var(--surface-input)',
                borderColor: C.dark?.borderInput || 'var(--border-input)',
                color: C.text?.main || '#FFFFFF',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? getText(t, 'auth.hidePassword', 'إخفاء كلمة المرور') : getText(t, 'auth.showPassword', 'إظهار كلمة المرور')}
              className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} transition-colors cursor-pointer p-1 min-h-[36px] flex items-center`}
              style={{ color: C.text?.muted || 'var(--text-muted)' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* تأكيد كلمة المرور */}
          <div className="relative flex items-center">
            <Lock 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors`}
              style={{ color: confirmPassword ? (C.primary?.DEFAULT || 'var(--primary)') : (C.text?.muted || 'var(--text-muted)') }}
            />
            <input 
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={getText(t, 'auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
              required
              aria-label={getText(t, 'auth.confirmPasswordPlaceholder', 'تأكيد كلمة المرور')}
              className={`w-full min-h-[44px] py-2.5 ${isRtl ? 'pr-11 pl-11 text-start' : 'pl-11 pr-11 text-start'} rounded-xl border text-xs outline-none transition-all font-sans`}
              style={{
                backgroundColor: C.dark?.surfaceInput || 'var(--surface-input)',
                borderColor: C.dark?.borderInput || 'var(--border-input)',
                color: C.text?.main || '#FFFFFF',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? getText(t, 'auth.hidePassword', 'إخفاء كلمة المرور') : getText(t, 'auth.showPassword', 'إظهار كلمة المرور')}
              className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} transition-colors cursor-pointer p-1 min-h-[36px] flex items-center`}
              style={{ color: C.text?.muted || 'var(--text-muted)' }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* الشروط والتعهد (Mobile First Touch Target 44px) */}
          <label 
            htmlFor="agreeTerms"
            className="flex items-center gap-2.5 my-1 p-2 rounded-xl transition-all cursor-pointer min-h-[44px]"
            style={{
              backgroundColor: fieldErrors?.agreeTerms ? `${C.error?.DEFAULT || '#ef4444'}15` : 'transparent',
              border: fieldErrors?.agreeTerms ? `1px solid ${C.error?.DEFAULT || '#ef4444'}40` : '1px solid transparent'
            }}
          >
            <input 
              type="checkbox" 
              id="agreeTerms" 
              checked={agreeTerms} 
              onChange={(e) => setAgreeTerms(e.target.checked)} 
              aria-label={getText(t, 'auth.agreeTermsLabel', 'الموافقة على الشروط والأحكام وسياسة الخصوصية')}
              className="w-4 h-4 rounded cursor-pointer shrink-0"
              style={{ accentColor: C.primary?.DEFAULT || 'var(--primary)' }}
            />
            <span className="text-[11px] leading-tight select-none text-start" style={{ color: C.text?.sub || 'var(--text-sub)' }}>
              {getText(t, 'auth.iAgreeTo', 'أوافق على')}{' '}
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setModalType('terms'); setShowModal(true); }} 
                className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: C.primary?.DEFAULT || 'var(--primary)' }}
              >
                {getText(t, 'auth.terms', 'الشروط والأحكام')}
              </button>{' '}
              {getText(t, 'common.and', 'و')}{' '}
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setModalType('privacy'); setShowModal(true); }} 
                className="font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: C.primary?.DEFAULT || 'var(--primary)' }}
              >
                {getText(t, 'auth.privacy', 'سياسة الخصوصية')}
              </button>
            </span>
          </label>

          {/* التنبيهات والأخطاء */}
          {status.msg && (
            <div 
              className="p-3 rounded-xl my-1 text-xs leading-relaxed flex items-center gap-2 border text-start"
              style={{
                backgroundColor: status.type === 'success' ? `${C.emerald?.DEFAULT || '#10b981'}15` : `${C.error?.DEFAULT || '#ef4444'}15`,
                borderColor: status.type === 'success' ? `${C.emerald?.DEFAULT || '#10b981'}30` : `${C.error?.DEFAULT || '#ef4444'}30`,
                color: status.type === 'success' ? C.emerald?.DEFAULT : C.error?.DEFAULT
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <div>{status.msg}</div>
            </div>
          )}

          {/* زر إنشاء الحساب الرئيسي */}
          <button 
            type="submit" 
            disabled={loading}
            aria-label={getText(t, 'auth.createAccountBtn', 'إنشاء حساب جديد')}
            className="w-full min-h-[44px] py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60"
            style={{
              backgroundColor: C.primary?.DEFAULT || 'var(--primary)',
              color: '#000000'
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span>{getText(t, 'auth.createAccountBtn', 'إنشاء حساب جديد')}</span>
            )}
          </button>
        </form>

        {/* شارة التشفير */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] mt-4" style={{ color: C.text?.muted || 'var(--text-muted)' }}>
          <ShieldCheck size={14} style={{ color: C.emerald?.DEFAULT || '#10b981' }} />
          <span>
            {getText(t, 'auth.sslEncryptedText', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}
          </span>
        </div>

        {/* تحويل الدخول */}
        <div className="mt-3 text-center text-xs" style={{ color: C.text?.sub || 'var(--text-sub)' }}>
          <span>{getText(t, 'auth.alreadyHaveAccount', 'لديك حساب بالفعل؟')}</span>{' '}
          <button 
            type="button"
            onClick={onSwitchToLogin} 
            className="bg-transparent border-none font-bold cursor-pointer hover:underline p-0 ms-1"
            style={{ color: C.primary?.DEFAULT || 'var(--primary)' }}
          >
            {getText(t, 'auth.signIn', 'تسجيل الدخول')}
          </button>
        </div>

        <TermsModal isOpen={showModal} onClose={() => setShowModal(false)} contentType={modalType} isRtl={isRtl} />
      </div>
    </AuthLayout>
  );
}

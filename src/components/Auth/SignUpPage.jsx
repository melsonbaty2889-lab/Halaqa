import React, { useState } from 'react';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
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
  Loader2 
} from 'lucide-react';

export default function SignUpPage({ onSwitchToLogin, onSignUpSuccess }) {
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
    status,
    setStatus,
    toggleLanguage,
    handleKeyUp,
    handleSignUp,
  } = useSignUpForm(onSignUpSuccess);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('terms');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    if (!agreeTerms) {
      setStatus({
        type: 'error',
        msg: isRtl ? 'يرجى الموافقة على الشروط وسياسة الخصوصية أولاً.' : 'Please agree to terms and privacy policy first.'
      });
      return;
    }

    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/select-role`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setStatus({
        type: 'error',
        msg: isRtl ? 'فشل التسجيل بواسطة Google' : 'Google sign-up failed'
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const langBtn = (
    <button
      type="button"
      onClick={toggleLanguage}
      className="bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] hover:border-[var(--border-hover,#2E3E56)] text-slate-300 py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
    >
      <Globe size={14} className="text-[var(--primary,#E07A00)]" />
      <span>{isRtl ? 'English' : 'العربية'}</span>
    </button>
  );

  return (
    <AuthLayout langBtn={langBtn}>
      {/* الشعار والعنوان */}
      <div className="flex flex-col items-center mb-4 text-center">
        <div className="mb-1 drop-shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <SmartHalaqaProLogo size={44} />
        </div>
        <h1 className="text-[var(--text-main,#FFFFFF)] text-xl sm:text-2xl font-extrabold tracking-tight mt-1 mb-0.5">
          {isRtl ? 'انضم إلى الحلقة الذكية' : 'Join Smart Halaqa'}
        </h1>
        <p className="text-[var(--primary,#E07A00)] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase m-0">
          {isRtl ? 'منصة إدارة المقارئ والأكاديميات' : 'ACADEMY MANAGEMENT PLATFORM'}
        </p>
      </div>

      <h2 className="text-[var(--text-main,#FFFFFF)] text-base sm:text-lg text-center mb-1 font-semibold">
        {isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
      </h2>
      <p className="text-[var(--text-sub,#94A3B8)] text-xs text-center mb-4 leading-relaxed">
        {isRtl ? 'قم بإنشاء حسابك الآن وادعُ طلابك لمتابعة حلقات التحفيظ' : 'Sign up now to start managing your Quranic academy'}
      </p>

      {/* التسجيل عبر Google */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading || loading}
        className="w-full py-2.5 px-4 bg-[var(--surface-input,#0A101D)] hover:bg-[#121B2C] border border-[var(--border-input,#1B2738)] hover:border-[var(--border-hover,#2E3E56)] rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer mb-4 transition-all disabled:opacity-50"
      >
        {googleLoading ? (
          <Loader2 size={16} className="animate-spin text-[var(--primary,#E07A00)]" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        )}
        <span>{isRtl ? 'التسجيل السريع باستخدام Google' : 'Quick Sign up with Google'}</span>
      </button>

      {/* فاصل */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="border-t border-[var(--border-input,#1B2738)] w-full"></div>
        <span className="bg-[#0A1220] px-3 text-[11px] text-[var(--text-muted,#475569)] absolute font-medium">
          {isRtl ? 'أو عبر البريد' : 'or via email'}
        </span>
      </div>

      {/* التنبيهات */}
      {status.msg && (
        <div className={`p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
            : 'bg-red-500/10 text-red-400 border border-red-500/25'
        }`}>
          <AlertCircle size={16} className="shrink-0" />
          <div>{status.msg}</div>
        </div>
      )}

      {/* نموذج إنشاء الحساب */}
      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
        
        {/* الاسم الكامل */}
        <div className="relative flex items-center">
          <User 
            size={18} 
            className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${fullName ? 'text-[var(--primary,#E07A00)]' : 'text-[var(--text-muted,#475569)]'}`} 
          />
          <input 
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={isRtl ? 'الاسم الكامل' : 'Full Name'}
            required
            className={`w-full py-2.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)]`}
          />
        </div>

        {/* البريد الإلكتروني */}
        <div className="relative flex items-center">
          <Mail 
            size={18} 
            className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${email ? 'text-[var(--primary,#E07A00)]' : 'text-[var(--text-muted,#475569)]'}`} 
          />
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
            required
            dir="ltr"
            className={`w-full py-2.5 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)]`}
          />
        </div>

        {/* كلمة المرور */}
        <div className="relative flex items-center">
          <Lock 
            size={18} 
            className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${password ? 'text-[var(--primary,#E07A00)]' : 'text-[var(--text-muted,#475569)]'}`} 
          />
          <input 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onKeyUp={handleKeyUp}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRtl ? 'كلمة المرور' : 'Password'}
            required
            dir="ltr"
            className={`w-full py-2.5 ${isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)]`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} text-[var(--text-muted,#475569)] hover:text-slate-300 transition-colors cursor-pointer`}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* تأكيد كلمة المرور */}
        <div className="relative flex items-center">
          <Lock 
            size={18} 
            className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${confirmPassword ? 'text-[var(--primary,#E07A00)]' : 'text-[var(--text-muted,#475569)]'}`} 
          />
          <input 
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            required
            dir="ltr"
            className={`w-full py-2.5 ${isRtl ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)]`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} text-[var(--text-muted,#475569)] hover:text-slate-300 transition-colors cursor-pointer`}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* التعهد والشروط تصحيح السياق LTR/RTL */}
        <div className={`flex items-start gap-2.5 my-1 p-2 rounded-xl transition-all ${
          fieldErrors?.agreeTerms ? 'bg-red-500/10 border border-red-500/30' : ''
        }`}>
          <input 
            type="checkbox" 
            id="agreeTerms" 
            checked={agreeTerms} 
            onChange={(e) => setAgreeTerms(e.target.checked)} 
            className="mt-0.5 rounded border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--primary,#E07A00)] focus:ring-0 cursor-pointer" 
          />
          <label htmlFor="agreeTerms" className="text-[11px] text-[var(--text-sub,#94A3B8)] cursor-pointer leading-tight select-none">
            {isRtl ? (
              <>أوافق على <button type="button" onClick={() => { setModalType('terms'); setShowModal(true); }} className="text-[var(--primary,#E07A00)] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">الشروط والأحكام</button> و <button type="button" onClick={() => { setModalType('privacy'); setShowModal(true); }} className="text-[var(--primary,#E07A00)] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">سياسة الخصوصية</button></>
            ) : (
              <>I agree to the <button type="button" onClick={() => { setModalType('terms'); setShowModal(true); }} className="text-[var(--primary,#E07A00)] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">Terms</button> & <button type="button" onClick={() => { setModalType('privacy'); setShowModal(true); }} className="text-[var(--primary,#E07A00)] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">Privacy Policy</button></>
            )}
          </label>
        </div>

        {/* زر إنشاء الحساب */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-[#E67E00] to-[#D97706] hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-[rgba(217,119,6,0.2)] flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span>{isRtl ? 'إنشاء حساب جديد' : 'Create Account'}</span>
          )}
        </button>
      </form>

      {/* شارة التشفير المصححة لغوياً */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted,#475569)] mt-4">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>
          {isRtl ? (
            <>بياناتك مشفرة ومحمية وفق معايير <span dir="ltr">256-bit</span></>
          ) : (
            <>256-bit SSL encrypted & secure data</>
          )}
        </span>
      </div>

      {/* تحويل الدخول - المصحح بدون مقلوب علامات الاستفهام */}
      <div className="mt-3 text-center text-xs text-[var(--text-sub,#94A3B8)]">
        <span>{isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}</span>{' '}
        <button 
          type="button"
          onClick={onSwitchToLogin} 
          className="bg-transparent border-none text-[var(--primary,#E07A00)] font-bold cursor-pointer hover:underline p-0 ms-1"
        >
          {isRtl ? 'تسجيل الدخول' : 'Sign In'}
        </button>
      </div>

      <TermsModal isOpen={showModal} onClose={() => setShowModal(false)} contentType={modalType} isRtl={isRtl} />
    </AuthLayout>
  );
}

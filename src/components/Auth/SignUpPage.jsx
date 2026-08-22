import React, { useState } from 'react';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { supabase } from '@/lib/supabase';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { TermsModal } from '@/components/UI/TermsModal';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Globe, Loader2 } from 'lucide-react';

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

  // التسجيل السريع بـ Google بنقرة واحدة
  const handleGoogleSignUp = async () => {
    if (!agreeTerms) {
      setStatus({
        type: 'error',
        msg: isRtl ? 'يرجى الموافقة على الشروط وسياسة الخصوصية أولاً' : 'Please agree to terms first.'
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

  const inputPadding = isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(15,118,110,0.18)_0%,#070C12_70%)] pt-12 pb-10 px-5 font-['Cairo',sans-serif]" dir={isRtl ? 'rtl' : 'ltr'}>
      
      <button
        type="button"
        onClick={toggleLanguage}
        className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} bg-slate-900 border border-slate-800 text-slate-300 py-2 px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg z-50`}
      >
        <Globe size={14} className="text-amber-500" />
        <span>{isRtl ? 'English' : 'العربية'}</span>
      </button>

      <div className="w-full max-w-[420px] bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative">
        
        <div className="flex flex-col items-center mb-5">
          <SmartHalaqaProLogo size={48} />
          <h1 className="text-slate-50 text-xl font-bold mt-2">
            {isRtl ? 'انضم إلى الحلقة الذكية' : 'Join Smart Halaqa'}
          </h1>
        </div>

        {status.msg && (
          <div className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/10 text-red-400 border border-red-500/25'}`}>
            <AlertCircle size={16} className="shrink-0" />
            <div>{status.msg}</div>
          </div>
        )}

        {/* زر جوجل بنقرة واحدة */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer mb-3"
        >
          {googleLoading ? <Loader2 size={16} className="animate-spin text-amber-500" /> : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
          )}
          <span>{isRtl ? 'التسجيل السريع باستخدام Google' : 'Quick Sign up with Google'}</span>
        </button>

        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="px-3 text-[11px] text-slate-500 uppercase">{isRtl ? 'أو' : 'OR'}</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <User size={18} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} text-slate-500 z-10`} />
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder={isRtl ? 'الاسم الكامل' : 'Full Name'} 
              required 
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700 bg-slate-950 text-white text-sm outline-none focus:border-amber-500`} 
            />
          </div>

          <div className="relative flex items-center">
            <Mail size={18} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} text-slate-500 z-10`} />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'} 
              required 
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700 bg-slate-950 text-white text-sm outline-none focus:border-amber-500`} 
            />
          </div>

          <div className="relative flex items-center">
            <Lock size={18} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} text-slate-500 z-10`} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onKeyUp={handleKeyUp} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={isRtl ? 'كلمة المرور' : 'Password'} 
              required 
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700 bg-slate-950 text-white text-sm outline-none focus:border-amber-500`} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} text-slate-500 z-10 p-1`}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative flex items-center">
            <Lock size={18} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} text-slate-500 z-10`} />
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'} 
              required 
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700 bg-slate-950 text-white text-sm outline-none focus:border-amber-500`} 
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} text-slate-500 z-10 p-1`}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-300 my-1">
            <input 
              type="checkbox" 
              id="agreeTerms" 
              checked={agreeTerms} 
              onChange={(e) => setAgreeTerms(e.target.checked)} 
              className="accent-amber-500 w-4 h-4 cursor-pointer mt-0.5" 
            />
            <label htmlFor="agreeTerms" className="cursor-pointer leading-tight">
              {isRtl ? (
                <>أوافق على <button type="button" onClick={() => { setModalType('terms'); setShowModal(true); }} className="text-amber-500 underline">الشروط والأحكام</button> و <button type="button" onClick={() => { setModalType('privacy'); setShowModal(true); }} className="text-amber-500 underline">سياسة الخصوصية</button></>
              ) : (
                <>I agree to <button type="button" onClick={() => { setModalType('terms'); setShowModal(true); }} className="text-amber-500 underline">Terms</button> & <button type="button" onClick={() => { setModalType('privacy'); setShowModal(true); }} className="text-amber-500 underline">Privacy</button></>
              )}
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg transition-colors mt-1 disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : <span>{isRtl ? 'إنشاء حساب جديد' : 'Create Account'}</span>}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-amber-500 font-bold hover:underline">
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </div>
      </div>

      <TermsModal isOpen={showModal} onClose={() => setShowModal(false)} contentType={modalType} isRtl={isRtl} />
    </div>
  );
}

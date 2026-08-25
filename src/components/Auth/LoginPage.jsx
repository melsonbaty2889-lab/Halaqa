import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from '@/hooks/useLoginForm';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Globe, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';

export default function LoginPage({ onSwitchToSignUp, onForgotPassword, onLoginSuccess }) {
  const { t } = useTranslation();
  
  const {
    isRtl,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    loading,
    redirecting,
    capsLockOn,
    cooldown,
    fieldErrors,
    setFieldErrors,
    status,
    showResend,
    resendLoading,
    toggleLanguage,
    handleKeyUp,
    handleEmailLogin,
    handleResendEmail,
    handleGoogleLogin,
  } = useLoginForm(onLoginSuccess);

  const inputPadding = isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11';

  // زر تغيير اللغة يمرر لـ AuthLayout مباشرة
  const langBtn = (
    <button
      type="button"
      onClick={toggleLanguage}
      className="bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] hover:border-[var(--border-hover,#2E3E56)] text-slate-300 py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg z-50 transition-all"
    >
      <Globe size={14} className="text-[var(--primary,#E07A00)]" />
      <span>{isRtl ? 'English' : 'العربية'}</span>
    </button>
  );

  return (
    <AuthLayout langBtn={langBtn}>
      {/* الشعار والعنوان */}
      <div className="flex flex-col items-center mb-5">
        <div className="mb-2 drop-shadow-[0_0_15px_var(--emerald-radial-glow,rgba(16,185,129,0.2))]">
          <SmartHalaqaProLogo size={52} />
        </div>
        <h1 className="text-[var(--text-main,#FFFFFF)] text-2xl font-extrabold tracking-tight mt-1 mb-0.5">
          {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
        </h1>
        <p className="text-[var(--primary,#E07A00)] text-[11px] font-bold tracking-wider uppercase m-0">
          {isRtl ? 'منصة إدارة المقارئ والأكاديميات' : 'ACADEMY MANAGEMENT PLATFORM'}
        </p>
      </div>

      <h2 className="text-[var(--text-main,#FFFFFF)] text-lg text-center mb-1 font-semibold">
        {isRtl ? 'تسجيل الدخول' : 'Sign In'}
      </h2>
      <p className="text-[var(--text-sub,#94A3B8)] text-xs text-center mb-5">
        {isRtl ? 'أهلاً بعودتك! ادخل لمتابعة إدارة حلقاتك التعليمية' : 'Welcome back! Log in to access your academy'}
      </p>

      {/* التسجيل عبر Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || redirecting}
        className="w-full p-2.5 rounded-xl border border-[var(--border-input,#1B2738)] hover:border-[var(--border-hover,#2E3E56)] bg-[var(--surface-google,#162032)] hover:bg-slate-800/80 text-[var(--text-main,#FFFFFF)] text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer mb-4 transition-all disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        {isRtl ? 'المتابعة بواسطة Google' : 'Continue with Google'}
      </button>

      {/* فاصل */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex-1 h-px bg-[var(--border-input,#1B2738)]"></div>
        <span className="text-[var(--text-muted,#475569)] text-xs">{isRtl ? 'أو عبر البريد' : 'or via email'}</span>
        <div className="flex-1 h-px bg-[var(--border-input,#1B2738)]"></div>
      </div>

      {/* التنبيهات */}
      {status.msg && (
        <div className={`p-3 rounded-xl mb-4 text-xs leading-relaxed flex flex-col gap-2 ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
            : 'bg-red-500/10 text-red-400 border border-red-500/25'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <div>{status.msg}</div>
          </div>

          {showResend && (
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resendLoading || cooldown > 0}
              className="self-start bg-[var(--primary,#E07A00)] hover:brightness-110 text-slate-950 rounded px-2.5 py-1 text-[11px] font-bold cursor-pointer disabled:opacity-60"
            >
              {resendLoading 
                ? (isRtl ? 'جاري الإرسال...' : 'Sending...') 
                : cooldown > 0 
                  ? (isRtl ? `انتظر (${cooldown} ثانية)` : `Wait (${cooldown}s)`) 
                  : (isRtl ? 'إعادة إرسال رابط التفعيل؟' : 'Resend Activation Link?')}
            </button>
          )}
        </div>
      )}

      {/* نموذج تسجيل الدخول */}
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
        
        {/* حقل البريد الإلكتروني */}
        <div className="relative flex items-center">
          <Mail 
            size={18} 
            className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${email ? 'text-[var(--primary,#E07A00)]' : 'text-[var(--text-muted,#475569)]'}`} 
          />
          <input 
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
            }}
            placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
            required
            className={`w-full py-2.5 ${inputPadding} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)] ${fieldErrors.email ? '!border-red-500' : ''}`}
          />
          {fieldErrors.email && (
            <span className="text-red-500 text-[11px] mt-1 block">{fieldErrors.email}</span>
          )}
        </div>

        {/* حقل كلمة المرور */}
        <div className="relative flex items-center">
          <Lock 
            size={18} 
            className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${password ? 'text-[var(--primary,#E07A00)]' : 'text-[var(--text-muted,#475569)]'}`} 
          />
          <input 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onKeyUp={handleKeyUp}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder={isRtl ? 'كلمة المرور' : 'Password'}
            required
            className={`w-full py-2.5 ${inputPadding} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)] ${fieldErrors.password ? '!border-red-500' : ''}`}
          />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} bg-transparent border-none cursor-pointer flex items-center text-[var(--text-muted,#475569)] hover:text-[var(--text-sub,#94A3B8)]`}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          {fieldErrors.password && (
            <span className="text-red-500 text-[11px] mt-1 block">{fieldErrors.password}</span>
          )}

          {capsLockOn && (
            <div className="flex items-center gap-1 text-[var(--primary,#E07A00)] text-[11px] mt-1">
              <AlertTriangle size={13} />
              <span>{isRtl ? 'مفتاح الحروف الكبيرة (Caps Lock) مفعل' : 'Caps Lock is ON'}</span>
            </div>
          )}
        </div>

        {/* تذكرني واستعادة كلمة السر */}
        <div className="flex justify-between items-center text-xs text-[var(--text-sub,#94A3B8)] mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[var(--primary,#E07A00)] w-4 h-4 cursor-pointer"
            />
            <span>{isRtl ? 'تذكرني' : 'Remember me'}</span>
          </label>

          <button 
            type="button"
            onClick={onForgotPassword}
            className="bg-transparent border-none text-[var(--primary,#E07A00)] hover:underline cursor-pointer font-inherit text-xs"
          >
            {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
          </button>
        </div>

        {/* زر الإرسال */}
        <button 
          type="submit" 
          disabled={loading || redirecting}
          className="w-full py-2.5 bg-gradient-to-r from-[#E67E00] to-[#D97706] hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-[rgba(217,119,6,0.2)] flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
        >
          {redirecting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{isRtl ? 'جاري تجهيز لوحة التحكم...' : 'Preparing dashboard...'}</span>
            </>
          ) : loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{isRtl ? 'جاري التحقق...' : 'Signing in...'}</span>
            </>
          ) : (
            <span>{isRtl ? 'تسجيل الدخول' : 'Log In'}</span>
          )}
        </button>
      </form>

      {/* شارة التشفير والأمان */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted,#475569)] mt-5">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>
          {isRtl ? (
            <>بياناتك مشفرة ومحمية وفق معايير <span dir="ltr">256-bit</span></>
          ) : (
            '256-bit SSL encrypted & secure data'
          )}
        </span>
      </div>

      {/* التحويل لإنشاء حساب */}
      <div className="mt-4 text-center text-xs text-[var(--text-sub,#94A3B8)]">
        {isRtl ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
        <button 
          type="button"
          onClick={onSwitchToSignUp} 
          className="bg-transparent border-none text-[var(--primary,#E07A00)] font-bold cursor-pointer hover:underline p-0 ms-1"
        >
          {isRtl ? 'إنشاء حساب جديد' : 'Create Account'}
        </button>
      </div>
    </AuthLayout>
  );
}

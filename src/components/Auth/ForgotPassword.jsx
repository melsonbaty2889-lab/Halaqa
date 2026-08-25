import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  Globe, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export default function ForgotPassword({ onBackToLogin }) {
  const { i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState({ type: null, msg: '' });

  const isRtl = i18n?.language === 'ar';

  useEffect(() => {
    document.title = isRtl ? 'استعادة كلمة المرور | الحلقة الذكية' : 'Reset Password | Smart Halaqa';
  }, [isRtl]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) i18n.changeLanguage(nextLang);
  };

  const handleReset = async (e) => {
    e?.preventDefault();
    if (!email.trim() || cooldown > 0) return;

    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        let errorMsg = error.message || '';
        if (isRtl) {
          if (errorMsg.includes('User not found')) {
            errorMsg = 'البريد الإلكتروني غير مسجل لدينا.';
          } else if (errorMsg.toLowerCase().includes('rate limit') || error.status === 429) {
            errorMsg = 'تجاوزت حد إرسال الرسائل المسموح به. انتظر دقيقة ثم حاول مجدداً.';
          } else {
            errorMsg = `خطأ الخادم: ${errorMsg}`;
          }
        }
        setStatus({ type: 'error', msg: errorMsg });
      } else {
        setIsSubmitted(true);
        setCooldown(60);
      }
    } catch (err) {
      const fallbackMsg = err?.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
      setStatus({ type: 'error', msg: fallbackMsg });
    } finally {
      setLoading(false);
    }
  };

  const inputPadding = isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11';

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

      {!isSubmitted ? (
        <>
          <h2 className="text-[var(--text-main,#FFFFFF)] text-lg text-center mb-1 font-semibold">
            {isRtl ? 'استعادة كلمة المرور' : 'Reset Password'}
          </h2>
          <p className="text-[var(--text-sub,#94A3B8)] text-xs text-center mb-5 max-w-[300px] mx-auto leading-relaxed">
            {isRtl ? 'أدخل بريدك الإلكتروني المسجل لإرسال رابط آمن لإعادة التعيين' : 'Enter your email address to receive a secure reset link'}
          </p>

          {/* التنبيهات */}
          {status.msg && (
            <div className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/25">
              <AlertCircle size={16} className="shrink-0" />
              <div>{status.msg}</div>
            </div>
          )}

          <form onSubmit={handleReset} className="flex flex-col gap-3.5">
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
                className={`w-full py-2.5 ${inputPadding} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)] ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || cooldown > 0}
              className="w-full py-2.5 bg-gradient-to-r from-[#E67E00] to-[#D97706] hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-[rgba(217,119,6,0.2)] flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>{isRtl ? 'إرسال رابط الحماية' : 'Send Reset Link'}</span>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-2">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
          <h2 className="text-[var(--text-main,#FFFFFF)] text-lg font-bold mb-2">
            {isRtl ? 'تحقق من صندوق البريد' : 'Check Your Inbox'}
          </h2>
          <p className="text-[var(--text-sub,#94A3B8)] text-xs leading-relaxed mb-4">
            {isRtl ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى:' : 'Password reset link sent to:'}
            <br />
            <strong className="text-sky-400 break-all">{email}</strong>
          </p>

          <button
            type="button"
            onClick={handleReset}
            disabled={cooldown > 0 || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] hover:border-[var(--border-hover,#2E3E56)] text-slate-300 disabled:opacity-50 cursor-pointer transition-all mb-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>
              {cooldown > 0 
                ? (isRtl ? `إعادة الإرسال بعد (${cooldown} ثانية)` : `Resend in (${cooldown}s)`)
                : (isRtl ? 'إعادة إرسال الرابط' : 'Resend Link')}
            </span>
          </button>
        </div>
      )}

      {/* العودة لتسجيل الدخول */}
      <div className="mt-5 text-center">
        <button 
          type="button"
          onClick={onBackToLogin} 
          className="bg-transparent border-none text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)] cursor-pointer inline-flex items-center gap-2 text-xs font-semibold transition-colors"
        >
          {isRtl ? <ArrowRight size={16} className="text-[var(--primary,#E07A00)]" /> : <ArrowLeft size={16} className="text-[var(--primary,#E07A00)]" />}
          <span>{isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}</span>
        </button>
      </div>

      {/* شارة الأمان */}
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
    </AuthLayout>
  );
}
